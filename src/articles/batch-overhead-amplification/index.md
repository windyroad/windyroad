---
date: '2026-11-03'
title: 'Batch Overhead Amplification'
subtitle: 'How smaller batches uncover performance bottlenecks'
author: 'Tom Howard'
tags: ['performance', 'lean', 'batch size', 'software delivery']
draft: false
---

To find out where a banking app spent its time rebuilding a balance, we deliberately made the rebuild slower. We split the same 469 events across 30 pages, making the server repeat work that was easy to miss when the history fitted on one page.

The banking app reconstructs the balance from the account’s event history. After a warm-up run, we timed a fresh rebuild on the server. That included fetching the events, looking up keys, decrypting payloads and replaying the events to produce the balance.

With a limit of 1,024 events per page, the rebuild took 1.055 seconds, or about 445 events per second. At 16 events per page it took 9.040 seconds, or about 52 events per second. Key lookups rose from one to 28, while applying the events still took about 10 milliseconds.

![Rebuild time rose from 1.055 to 9.040 seconds for the same 469 events when the page limit fell from 1,024 to 16.](/img/social/batch-overhead-amplification-results.svg)

We call this diagnostic **Batch Overhead Amplification**. It draws on Taiichi Ohno’s analogy of lowering the water to expose the rocks. In Ohno’s example, reducing inventory exposes problems on the production line. In this experiment, smaller pages expose the work the server repeats for each page. [Lean Enterprise Institute on Ohno’s analogy](https://www.lean.org/the-lean-post/articles/once-again-heres-why-jit-matters/).

The same diagnostic can be used with database reads, API requests, file imports, message processing and software release processes. In the banking example, the batches are pages of events; in a release process, they are groups of changes shipped together.

## What the slowdown told us

Where did the extra eight seconds come from? The event history and required calculation were unchanged. These were individual instrumented readings in the deployed server environment, after a priming rebuild.

| Measurement | Page size: 1,024 events | Page size: 16 events |
| --- | ---: | ---: |
| Loading pages of account events | 139 milliseconds | 1,511 milliseconds |
| Key-metadata lookups | 1 | 28 |
| Applying events to calculate account state | About 10 milliseconds | About 10 milliseconds |

Applying events took about 10 milliseconds at both settings; decryption stayed around 350 to 400 milliseconds. Neither tracked the large increase in elapsed time. Eliminating event application entirely would barely affect even the one-second rebuild.

Key retrieval did track the change: one lookup became 28, making the work around fetching keys a concrete target for investigation.

A separate local query investigation exposed another target. Mongo performed access-control work before applying the page limit. The first query examined 469 candidates to return 16 events. Subsequent pages repeated that work over shrinking portions of the history, producing 7,110 candidate visits across 30 pages. Small result pages were still triggering substantial database work.

The timings and counts identified mechanisms to test, without allocating the extra eight seconds between them: the timed operations overlap, and the query counts came from a separate local investigation.

## Make page overhead visible

For event pages, a simple model shows how the two costs scale:

<p tabindex="0"><math display="block">
  <mtext>Total work</mtext><mo>≈</mo><mtext>event count</mtext><mo>×</mo>
  <mrow>
    <mo>(</mo><mtext>work per event</mtext><mo>+</mo>
    <mfrac><mtext>overhead per page</mtext><mtext>page size</mtext></mfrac><mo>)</mo>
  </mrow>
</math></p>

This approximation assumes many mostly full pages and roughly constant overhead per page. It describes the scaling effect, rather than predicting the opening example’s timings. Hold the event count fixed and reduce the page size: if per-event work stays stable, page overhead takes a larger share of the total.

Count the suspected work: query starts, key lookups or processor setup. Elapsed time alone cannot identify the cause, because page size can also change caching, concurrency and memory behaviour.

Goldratt describes small production batches exposing expensive setups in [*Standing on the shoulders of giants*](https://doi.org/10.1590/S0104-530X2009000300002). Batch Overhead Amplification names our application of that established idea to a performance investigation.

The diagnostic batch size serves a different purpose from the operating size. Reinertsen’s [*Iteration vs. Batch Size*](https://www.leanproductflow.com/iteration-vs-batch-size/) describes the trade-off between transaction costs and holding costs. For software releases, completed changes waiting to ship and delayed feedback also have a cost. Repeating build and deployment work more often can be worthwhile if smaller releases reduce that waiting.

## A promising repair that failed the larger test

In a later experiment, eight-event pages exposed a new Mongo query and cursor being opened for every application page. That suggested a repair: keep one bounded cursor open and read successive results from it, avoiding repeated query setup.

There were two independently adjustable sizes. The **application page** was the group of events handed to the application. The **database transport batch** was the group fetched from Mongo. We could keep the application’s eight-event pages while fetching larger transport batches through one cursor.

![The existing reader opens a separate query for each application page. In the prototype, one query opens a cursor that fetches database batches and feeds multiple eight-event application pages.](/img/social/batch-overhead-amplification-mechanism.svg)

Measured page-fetch time fell by about 80%, and a complete 745-event rebuild fell from 2.24 seconds to 1.39 seconds.

Larger histories changed the decision. At 25,000 events, the prototype was about 13% slower. At 50,000 events, it timed out in all three measured trials. We kept the existing reader: removing an exposed cost had helped the small case but failed the complete-workload test at larger sizes.

## The work that page size did not change

A separate investigation used a synthetic workload of 50,000 events: two account histories of 25,000 events each, rebuilt into an account list. We compared application page sizes of 4 and 256, keeping the database transport batch size fixed.

Both settings produced 50,000 address parses and 200,001 metadata objects inspected and frozen. Changing the number of pages had not changed how often these operations ran.

Source inspection showed why. Each event carried an address identifying its position in the stream. Input construction had already created an immutable context containing that address, but metadata publication parsed it and built another context. Existing caches could not prevent this fresh construction, and larger pages could not remove a cost paid for every event.

We reused the context only when the application had constructed it, made it immutable and verified that its representation matched the publication parser’s output. Other contexts retained the existing parsing and copying path; metadata roots retained their immutability checks. Tests checked that later events left earlier outputs unchanged and that restored checkpoints produced the same state and progress.

We ran 12 baseline/candidate pairs at each page size, alternating their order. These local server measurements used synthetic, unencrypted events and excluded browser and HTTP time. Each run rebuilt all 50,000 events from a cold account state in a primed process.

![Median local cold-rebuild time fell from 11.99 to 10.90 seconds at 4 events per page and from 9.09 to 8.23 seconds at 256 events per page.](/img/social/batch-overhead-amplification-follow-up.svg)

| Events per page | Before reuse (seconds) | After reuse (seconds) |
| ---: | ---: | ---: |
| 4 | 11.99 | 10.90 |
| 256 | 9.09 | 8.23 |

The table shows median elapsed times. The candidate was faster in 11 of 12 pairs at page size 4 and all 12 pairs at page size 256. All 48 rebuilds passed the complete-output and progress checks. We retained the change: it helped at both the small diagnostic size and the 256-event setting used at that stage.

## Tune the page size after reducing overhead

Context reuse reduced per-event work. After further simplification, we tuned the server application page size. In this later local, synthetic 50,000-event benchmark, 64-event pages took a median **4.92 seconds**, about **10,160 events per second**, compared with 5.07 seconds at 256. We adopted 64, although the small timing difference did not establish a clear winner.

### Browser pages introduce a responsiveness trade-off

In a separate browser comparison, we varied the number of events per REST response and timed the full 50,000-event synthetic replay through the dashboard. We also recorded each run’s longest main-thread pause; the table reports the median of those pauses.

| REST page size (events) | Median rebuild time (seconds) | Median longest main-thread pause (milliseconds) |
| ---: | ---: | ---: |
| 256 | 6.42 | 51 |
| 512 | 6.28 | 87 |
| 1,024 | 6.24 | 158 |
| 2,048 | 6.07 | 276 |

Moving from 1,024 to 2,048 saved about 0.17 seconds while the median longest pause rose from 158 to 276 milliseconds. At 512, completion time was almost unchanged from 1,024, with substantially shorter pauses. REST pages remained at 1,024 in that iteration; the comparison exposed the trade-off without establishing an optimal operating size.

We also observed substantially faster account loading in everyday production use after the optimisation work.

## Use batch size to choose the next experiment

Use the method where work is already batched and you can change the boundary. In software release processes, for example, track build runs, approval effort and deployment preparation as the number of changes per release falls.

1. **Match the work and conditions; change one batch size.** For data processing, use the same items, order and required outputs. For releases, use comparable sets of changes. Identify which batching layer you are changing.
2. **Measure time and counts.** Record complete-operation time alongside counts for suspected costs. Distinguish more occurrences from greater cost per occurrence: stable counts can still hide expensive work.
3. **Trace the cost to its mechanism.** Follow the code or process to establish why a query is reopened, an object is reconstructed or release preparation is repeated, and which work can change.
4. **Test one repair against the complete operation.** Repeat comparisons at diagnostic and normal sizes, including larger workloads. Check outcomes as well as timings. Keep regressions and timeouts in the result.
5. **Choose the operating size for the whole system.** Balance throughput against responsiveness, waiting time and speed of feedback at the layer you are tuning.

Use a controlled environment for deliberately inefficient tests. Reduce the batch size far enough to distinguish the costs you are investigating; reaching the smallest possible size is unnecessary.
