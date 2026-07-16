---
date: '2026-07-16'
title: 'At noon Sydney time, ten million addresses disappeared'
author: 'Tom Howard'
tags: ['ai coding', 'claude code', 'opensearch', 'software delivery', 'risk management', 'zero outage']
image: '/img/social/opensearch-upgrade-failed-cluster.jpg'
imageAlt: 'Two parallel server clusters in daylight: the production cluster remains lit in teal while the candidate cluster is almost dark, with orange warning indicators.'
---

At 11am Sydney time, the new OpenSearch cluster held about ten million Australian addresses. At noon, the next CloudWatch reading counted just seven addresses.

At 1:00:59pm, the failed logins began. By the time the import was stopped, the audit log contained 184 of them. The cluster had lost almost all its data and stopped recognising the credentials that had loaded it.

Claude Code had been supervising the migration for more than a day. The new cluster was supposed to replace an old one running OpenSearch 1.3.20. It was not yet serving customers, so the production API continued answering searches as if nothing had happened.

That was the first thing the migration got right.

![Two parallel server clusters in daylight: the production cluster remains lit in teal while the candidate cluster is almost dark, with orange warning indicators.](/img/social/opensearch-upgrade-failed-cluster.jpg)

## A cluster too old to leave alone

Addressr is an Australian address-validation and search service. It indexes the Geocoded National Address File (G&#8209;NAF), a source dataset of about 16.9 million addresses, in OpenSearch. Its production cluster worked, but it was still on OpenSearch 1.3.20, a version family already past upstream maintenance.

The destination was OpenSearch 3.5. Reaching it safely meant stopping at 2.19 first. Each step had to preserve search behaviour, keep the API available and leave a working path back.

An in-place upgrade would have put the only production cluster on the operating table. The chosen design was blue/green. The old cluster would continue serving while a new one was provisioned beside it. In CI, the automated test suite would run against both OpenSearch 1.3.20 and 2.19.5. The new cluster would be rebuilt from G&#8209;NAF, tested directly, fed copies of real searches and compared with production. Only then would the application switch over.

The switch itself would be a configuration change. If it failed, the old cluster would still be warm.

Claude Code was asked to carry that plan through the repository, the deployment pipeline and the live AWS environment. It could edit the application, Terraform and GitHub Actions workflows; run the tests; follow releases; inspect CloudWatch; and keep working as long-running operations completed. Architecture decisions, risk policy and production gates already lived in the project.

The plan was careful. The first attempt still failed.

## The first attempt

The first OpenSearch 2.19 domain came up in May. Read-shadowing sent it copies of production searches without using its answers, giving the migration a way to observe real behaviour before cutover.

Then several faults began to overlap.

Credentials drifted between Terraform Cloud, GitHub Actions and the application environment. The shadow client kept sending a password the domain no longer accepted, turning what looked like a healthy soak into a stream of silent authentication failures.

During the full data load, Queensland and Western Australia collided with an hourly snapshot. The loader tried to close the index while the snapshot was in progress and failed. A retry against the small cluster dragged on while shadow traffic competed with bulk indexing.

The cluster was resized to get the load through. AWS began its managed blue/green resize and remained stuck for more than three hours, reporting shard progress that moved forward and then backwards. Authentication failed again after the reconfiguration.

On 14 May, the migration was rolled back. The new domain was deleted and shadow traffic was disabled. Production stayed on 1.3.20 throughout.

The failed attempt left useful evidence behind. The repository still had a Terraform module for parallel domains, a default-off shadow client, a two-version CI matrix and incident records describing where the plan had broken. It also left a better question: what if the cluster were allowed to finish loading before it saw a single search?

## The quiet cluster

The second attempt began with that change in sequence.

OpenSearch 2.19 would be provisioned quiet. No shadow reads. No customer traffic. It would receive the complete G&#8209;NAF dataset, prove its document count and search behaviour, and only then begin warming on copies of production queries.

Before another dollar of AWS capacity was spent, Claude Code changed the loader. If the index settings and mappings were already correct, it would no longer close and reopen the index for every state. If a close genuinely collided with a snapshot, it would retry with backoff. CI kept testing both 1.3.20 and 2.19.5. A CloudWatch dashboard established the old cluster's latency baseline before the new cluster existed.

Audit logging was enabled as well. The first attempt had shown the symptoms of the credential failure but not the moment it occurred. This time the migration would be watching.

The fresh domain came online with no query traffic. The loader completed the Australian Capital Territory, New South Wales, Northern Territory, Other Territories and Queensland. Five states were green. South Australia started next.

Six hours later, that job was cancelled by GitHub Actions' timeout.

At first it looked like a capacity problem. Claude Code checked the AWS metrics. CPU was around seven percent. JVM pressure was ordinary. Indexing had been flat at zero for hours. The cluster was not overloaded. It was idle.

Direct probes returned 401. The same credentials still matched in 1Password, GitHub Actions and Terraform Cloud, but the domain rejected them. The new audit log showed 184 failed logins, yet no event that changed the password.

CloudWatch supplied the missing half of the picture. At 11am, the searchable-document count stood at about ten million. At noon, it fell to seven. At 1:00:59pm, the authentication failures started.

That established where the authentication fault lived: the fine-grained access control user store inside the managed domain no longer matched any credential plane under the project's control. It did not establish what had changed it. The audit log contained the failed logins, but no initiating event. The index deletion had left no delete event either.

Claude Code initially treated the timing as causation and joined the symptoms into one failure. The evidence supported only two simultaneous failures with two causes still unknown.

## Remove the thing that can break

Changing the password might restore access. It could not make the internal user store a safe dependency. Claude Code stopped the doomed workflow and surfaced the architectural choice. The operator approved removing OpenSearch's username-and-password store from this deployment and replacing it with AWS identity.

The decision became an architecture record before the code changed. The OpenSearch client gained an optional AWS Signature Version 4, or SigV4, mode. Existing users still received the same basic-authentication path unless they explicitly enabled it. The AWS domain policy named only the application role and the loader identity. There was no shared cluster password left to drift.

This was a structural remedy, not a diagnosis. It removed the mutable credential store even though the event that had changed it remained unknown.

The broken parallel domain was deleted and recreated. An unsigned request received 403. The same request signed by an approved AWS identity received 200, and the cluster reported green. The real loader connected through the new path and began indexing.

The next monitor reading showed 274,000 documents and 97 percent progress. Claude Code concluded that the loader was processing only one state. Before changing the configuration, it checked the file list and the log. The percentage reset for every state: the loader was already 53 percent through New South Wales' 5.2 million rows, and all nine state and territory files were present. Searchable-document count, not the loader's percentage, became the progress signal.

The long-running local process was killed when its original agent task ended, so Claude Code relaunched it detached from the task and resumed monitoring. The document count started climbing again.

Then, near fourteen million records, one of the two nodes dropped out. The cluster went yellow, the loader fell into escalating backoffs and indexing stopped. When the second node returned, the cluster was green again, but the index had disappeared.

There was no fine-grained access control on this cluster. Its loader log contained no index close or delete. CloudWatch placed the loss minutes after the node drop: 14.17 million searchable documents fell to zero. The credential failure was gone. The disappearing index was a separate problem.

## The weight of the new index

The old 1.3 cluster held the full dataset on two small instances with 12 GB disks. It had also been loaded from scratch. It was reasonable to expect the same shape to hold the same addresses on 2.19.

The metrics said otherwise. The complete 1.3 index occupied about 56 percent of its disks. At only fourteen million documents, the 2.19 domain had reached about 80 percent. It was consuming roughly 1.7 times as much disk per document, and its full dataset with a replica would not fit safely in 12 GB.

The second loss supplied the causal chain that the first had not: sustained 2.19 indexing pressure, a node drop, loader backoff and then a vanished index, with no delete in the loader log. The first deletion's exact initiating event remained unrecorded, but the failure could now be reproduced independently of authentication.

The domain received 20 GB disks. An index template held replicas at zero during the bulk load, halving write and storage pressure. It crossed both previous failure points with both nodes green. Once all 16,905,824 documents were present, the replica was added and the cluster returned to green. The controlled rerun supported the diagnosis: the 2.19 load had exceeded the small domain's resource envelope. A document-count alarm remained armed in case the index vanished again.

![An illustrated stream of address records entering two search nodes with expanded storage, with a second replica path shown beside the primary load.](/img/social/opensearch-upgrade-recovery.jpg)

The data was finally complete. It was still not ready for production.

Read-shadowing exposed a new problem. On the small instances, OpenSearch 2.19 was much slower than 1.3 even though its CPU and JVM figures were lower. Its search tail grew into seconds while the old cluster remained steady.

The low CPU was the clue. The larger 2.19 index did not fit the smaller instances' memory, so searches kept missing the page cache and waiting on disk. Claude Code resized the quiet domain to memory-optimised instances and measured both domains during the same warmed hour of mirrored production searches. At the 90th percentile, the new cluster recorded 45 milliseconds against the old cluster's 64. At the 99th, it recorded 115 milliseconds against 187.

To test whether time alone could save the cheaper option, the domain was returned to the smaller instances under the same mirrored query stream. Over four hours, its 90th-percentile latency climbed from 1.16 to 2.75 seconds while the old cluster held near 200 milliseconds. The larger instances were no longer a guess. They were the measured requirement.

## The last unsafe green light

The formal gates now passed. The search-quality baseline returned 14 correct results out of 14. The Cucumber suites passed against the managed 2.19 domain. A matching 38-minute load-test profile in k6, ramping from five to 20 virtual users, had measured the old cluster at a 95th-percentile search latency of 962 milliseconds and set the acceptance limit at 1,443. Against 2.19, the same profile completed 38,459 requests with no failures and a 95th percentile of 219 milliseconds.

One green light was still lying.

The deployment platform used `/health` to decide whether a new application version was safe. That endpoint returned a static healthy response. A release with the wrong OpenSearch host or broken SigV4 configuration could therefore pass the rolling-deployment check, reach every instance and fail only when a customer searched.

Claude Code changed the health check to ping the configured OpenSearch cluster. A sustained connection or authentication failure now returned 503 and triggered the platform's automatic rollback. A kill switch could restore the old shallow check if the new dependency itself caused trouble.

On 10 July, the deployment changed the primary host and authentication mode together. The old 1.3 cluster remained warm while the platform rolled the change through its instances and checked each one. Search stayed available. The smoke tests passed. Production was running on OpenSearch 2.19.

The quarterly data-refresh workflows were moved to SigV4 through GitHub's short-lived AWS identity, first with one small territory as a canary and then with the remaining eight states. On 11 July, the 1.3 domain was decommissioned.

The migration that had already failed twice was complete.

## "There is an OpenSearch v3 as well, isn't there?"

That question arrived the next day.

The second upgrade began with something the first had never possessed: a working migration system.

CI replaced the retired 1.3 leg with OpenSearch 3.5 while retaining 2.19 as a compatibility target. The same Terraform module provisioned another quiet parallel domain. The same identity model secured it. The loader ran a small canary, then rebuilt all 16.9 million addresses. The same quality tests, document alarm, latency dashboard and read-shadow path checked the result.

The machinery did not make the cutover automatic. The project's release gate scored residual impact multiplied by likelihood on a scale from one to 25 and blocked scores above five. This cutover scored eight because one important condition had not been exercised. Read-shadowing had replayed the normal production query stream, but the 3.5 domain had never acted as the sole primary under the load test's maximum concurrency.

Claude Code ran the missing test instead of bypassing the gate. A shortened run of the same application-level k6 harness ramped to 20 virtual users, then held them against a local application pointed directly at 3.5 over SigV4. In four and a half minutes it completed 4,311 requests. Every check passed, there were no failed requests, and 95th-percentile search latency was 368 milliseconds. The test was not a comparison with production latency; it exercised the missing concurrency condition. With that likelihood reduced by evidence, residual risk fell to four out of 25.

Production cut over on 14 July. Three hours later, the 3.5 domain was green with the full dataset, no server errors and no search rejections. CloudWatch's domain-side search metric reported a 95th percentile of 24 milliseconds. After the operator accepted the loss of the warm rollback domain, the 2.19 infrastructure was removed. Its CI leg remained, preserving code compatibility until 2.19 reaches end of life.

By 14 July, OpenSearch 3.5 was the only search domain left running.

## What made Claude Code capable

Claude Code wrote client code, tests, Terraform and workflows. It followed CI runs, waited for AWS operations, read logs, compared metrics and resumed work when long-running jobs finished. Those capabilities mattered, but they were not enough on their own.

The upgrade succeeded because the project gave reasoning somewhere concrete to land. Architecture decisions constrained the options. Tests bounded search behaviour. Terraform made each domain reproducible. Shadow reads exposed performance without trusting the new answers. CloudWatch made silent failure visible. The risk gate turned unease into a missing experiment. The deployment health check kept a bad configuration from becoming a fleet-wide outage.

The human still made the consequential choices: change the migration sequence, replace the authentication model, accept the larger instances, authorise each cutover and decide when to remove the rollback domain. Claude Code carried those decisions through the delivery system and returned with evidence for the next one.

It also made mistakes. It initially treated coincidence as causation, misread a per-state loader percentage as total progress and began with a domain that was too small. Each mistake met a deterministic signal before production traffic moved.

<span data-pull>Claude Code did not need to be right the first time. It needed to discover when it was wrong before customers did.</span>

The path from OpenSearch 1.3.20 to 3.5 contained a rolled-back attempt, two vanished indexes, an authentication redesign, repeated full-data loads, a sizing reversal and two production cutovers. Customers saw no outage.
