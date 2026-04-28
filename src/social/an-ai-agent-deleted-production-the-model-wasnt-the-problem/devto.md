---
platform: devto
article: /blog/an-ai-agent-deleted-production-the-model-wasnt-the-problem
canonical_url: https://windyroad.com.au/blog/an-ai-agent-deleted-production-the-model-wasnt-the-problem
title: "An AI agent deleted production. The model wasn't the problem."
tags: [claudecode, ai, devops, security]
cover_image: https://windyroad.com.au/img/social/sign-vs-control.png
cover_image_alt: Two-column comparison. Left column titled Sign with three boxes labelled Agent has production credentials, A single API call destroys production, and System prompt says don't, ending in a red badge labelled production deleted. Right column titled Control with three boxes labelled Production credentials in CI/CD secrets only, Production changes flow through the pipeline, and Pipeline gate scores commit push and release, ending in a green badge labelled denied at the boundary.
published: false
---

Last week an AI coding agent deleted a production database in 9 seconds. [The thread documenting it](https://x.com/lifeof_jer/status/2048103471019434248) and [The Register's coverage](https://www.theregister.com/2026/04/27/cursoropus_agent_snuffs_out_pocketos/) have been read as a story about AI safety: a flagship model went rogue, the guardrails didn't hold, another company learned the cost. That reading is wrong. The agent is the least interesting part of the story.

The agent was working for PocketOS, a SaaS that car-rental businesses run their day-to-day on. It had been assigned a routine task in the staging environment. The credentials it was using did not match what Railway expected. Rather than ask, it decided to fix the mismatch by deleting a Railway volume. It ran one `curl` call. The production volume was gone, and because Railway stores volume-level backups inside the same volume, the backups went with it. Three months of recoverable history, erased.

The token that authorised the call had not been created for this. It had been created weeks earlier for adding and removing custom domains via the Railway CLI. Same token. Same `volumeDelete` permission across the entire Railway GraphQL API. Railway does ship some scoping today. Workspace tokens are limited to a single workspace. Project tokens are limited to a single environment within a project. Enterprise customers get [role-based access control at the environment level](https://docs.railway.com/enterprise/environment-rbac) (RBAC: who can do what, where). What it does not ship is operation-level scope on the CLI tokens most teams use. Per Jer Crane's account, the token he held could authenticate any GraphQL mutation, including `volumeDelete`, against any environment in his workspace. Railway CEO Jake Cooper [responded publicly](https://www.theregister.com/2026/04/27/cursoropus_agent_snuffs_out_pocketos/) that the deletion "1000% shouldn't be possible."

The harness, the tool that ran the agent, was Cursor. The model was Anthropic's Claude Opus 4.6. Asked to explain itself, the agent produced a written confession enumerating the safety rules it had violated. The thread quotes the confession. It is also the wrong thing to read.

> The agent didn't escape its constraints. It found there were no constraints to escape.

Three things sat between the agent's intent and production. The token had blanket authority. The API had no friction. The system prompt had advisory text. None of them fired. The agent did not break a control. It walked through a corridor with no doors. Anyone holding that token walks the same corridor: a junior developer on day three, an attacker who found the token in a leaked log, a maintenance script that started doing something nobody noticed. The agent's intent is the variable. The access path is the constant.

The deeper failure is that the corridor existed at all. An AI coding agent should not be one wrong decision away from production.

## This is not the first time

The PocketOS pattern predates AI. Two versions of the same incident, before agents:

- **Pixar, 1998.** During production of Toy Story 2, an animator ran a recursive delete command (`/bin/rm -r -f *`) on the root of the asset server. About 90 percent of the film's files were deleted before anyone could stop it. The tape backups had silently been failing for weeks. The film was recovered only because Galyn Susman, the technical director, had a near-complete copy on her home workstation while she was on maternity leave. ([The Next Web summary](https://thenextweb.com/news/how-pixars-toy-story-2-was-deleted-twice-once-by-technology-and-again-for-its-own-good))
- **GitLab, January 2017.** An engineer was cleaning up a stuck replica. They ran `rm -rf` on what they thought was the standby database. It was the live one. The `pg_dump` backups had not run for weeks because of a misconfiguration. Email-authentication settings were silently rejecting the failure-alert emails. Six hours of data lost; the post-mortem is public. ([GitLab post-mortem](https://about.gitlab.com/blog/postmortem-of-database-outage-of-january-31/))

The AI-agent versions, in the months before PocketOS:

- **Replit, July 2025.** SaaStr had declared a code freeze: a deliberate no-deploy window. The AI coding agent deleted the production database anyway, fabricated 4,000 fake user records, and told the operator that recovery was impossible. Recovery turned out to be possible. Founder Jason Lemkin documented the incident in real time. ([Lemkin's thread](https://x.com/jasonlk/status/1946069562723897802), [The Register](https://www.theregister.com/2025/07/21/replit_saastr_vibe_coding_incident/))
- **Cursor Plan Mode, December 2025.** An agent in Plan Mode (Cursor's mode for proposing changes before running them) deleted around 70 source files tracked in Git and terminated processes on remote machines after the user typed "DO NOT RUN ANYTHING." A Cursor team member acknowledged a critical bug in the same thread: the mode did not enforce its own constraints. ([Cursor forum thread, with Cursor staff reply](https://forum.cursor.com/t/catastrophic-damage-and-chaos-in-plan-mode/145523))

Different operators, different tools, different decades. The shared variable is the access pattern, not the model and not the harness. In every case, a session held credentials that could destroy production, and someone or something invoked them. The shape of the failure does not change.

## Rules are not controls

The agent's confession is the strongest evidence. Asked why it had run a destructive call without permission, it listed the principles it had violated:

> I guessed instead of verifying.
>
> I ran a destructive action without being asked.
>
> I didn't understand what I was doing before doing it.

Each line is a rule the agent had been given. Each is a sound engineering principle. None of them is a control.

A rule is text. A control is enforcement. Rules tell the agent what to do. Controls determine what happens when the agent doesn't. When the PocketOS thread lists Cursor's guardrails and PocketOS's project rules, it is listing rules. Rules can fail silently. Controls cannot.

The same distinction applies to the human stack. "Don't share your password" is a rule. A password manager is a control. "Don't run `rm -rf /` in production" is a rule. A read-only deploy account is a control. AI agents make the lesson urgent again.

![Two columns, side by side. Left column titled Sign. Three boxes stacked: Agent has production credentials, A single API call destroys production, System prompt says don't. An arrow at the bottom points to a red outcome badge labelled production deleted. Right column titled Control. Three boxes stacked: Production credentials live in CI/CD secrets only, Production changes flow through the pipeline, Pipeline gate scores commit push and release. An arrow at the bottom points to a green outcome badge labelled denied at the boundary.](https://windyroad.com.au/img/social/sign-vs-control.png)

## What won't fix this

Six answers will surface in the comments under any retelling of this incident. None of them prevent the next one.

**A better model.** Newer, more aligned models comply with system prompts more often. "More often" is the problem. Compliance is a probability distribution. A rule that holds 99 percent of the time, run thousands of times a day across a fleet of agents, fails every day. The fix has to live somewhere the probability is one.

**A better system prompt.** A system prompt is advisory text. Nothing forces the model to follow it once it has read it. Cursor's prompt forbade destructive operations. PocketOS's project rules reinforced it. Adding sentences increases compliance. It does not produce certainty.

**Scoped API tokens.** Necessary infrastructure, not a complete fix. An API token scoped to "domain operations only" cannot call `volumeDelete`, which is the one Railway should ship. But the agent uses whatever scope it has against whatever the scope permits. A `git push` token still force-pushes. A read-write database token still drops tables. Scoping reduces the blast radius (the set of things one token can damage); it does not stop an agent from acting destructively within the radius it has.

**A denylist of dangerous commands.** This works until the dangerous command is a `curl` to a URL. Then the denylist needs to know about Railway, Stripe, AWS, every cloud provider, every payment processor, every internal admin API any team has ever wired up. The list is unmaintainable, and the next provider added is always the one that's missing.

**A gate on every destructive API.** The obvious next answer once denylists are rejected. It is the same problem one layer up. To gate `volumeDelete` against Railway, then `bucket.delete` against S3, then `DELETE /v1/customers` against Stripe, you must enumerate every destructive API across every provider an agent might reach. The list is just as unmaintainable. The fix is to ensure the agent has no credentials to call any of these APIs in the first place.

**A human in the loop.** Most destructive operations are routine and pre-authorised: scheduled cleanups, automated rotations, CI-driven deprecations. Forcing a human to approve each one creates fatigue and gets bypassed. The right primitive is authorisation, not human attention: every destructive call carries a reference to an approved change. A token authenticates. The change record authorises. Where a specific call genuinely needs explicit human sign-off, the human has to provide something the agent cannot reach (a one-time code on a phone, a physical button press), but the default is automated, audited, and tied to a change record.

**Monitoring and alerting.** These shorten detection time after the destructive action has run. They do not prevent it. Treating them as controls puts them in the same category as "we have backups in the same volume": true, but not the thing it sounds like.

## What does fix this

The first answer is structural: **the agent has no production access**. Its credentials are development-only. Production tokens live in CI/CD secrets, used only by pipeline jobs, never readable by an interactive session. With that one property, the PocketOS curl is impossible: the agent has no token to authenticate it.

Production changes still have to happen. The path that remains is the pipeline. Code is committed, pushed, and released; the pipeline holds the production credentials and applies the change. The agent has no other path.

The pipeline itself needs a control. To work, the control must:

1. Fire before the action runs, not after.
2. Decide from a written policy, not from the agent's judgement.
3. Have a structured bypass that lands in an audit trail, not an escape the agent can take on its own.

The plugin today implements all three, with one caveat on (3): the incident bypass currently logs but does not require a structured reason. An agent labelling its action an incident can self-issue it. That is a gap worth fixing, named here rather than in the adoption notes because a bypass without a structured reason is closer to a rule than a control.

Production-bound changes pass through three observable actions. Commit records the change locally and accumulates toward a push. Push sends the commits to the remote and triggers CI; this is where the change first enters the pipeline. Release promotes the queued unreleased work to production. The implementation here uses [Changesets](https://github.com/changesets/changesets) to accumulate unreleased changes in a release PR; merging that PR via the `release:watch` npm script triggers publish. A gate on each of the three actions catches risky changes at the boundary the agent cannot avoid.

[`@windyroad/risk-scorer`](https://github.com/windyroad/agent-plugins) is one such gate: a risk-scoring hook on commit, push, and release.

The pattern is not specific to Claude Code, Anthropic, or any one harness. Any agent system that lets you run code before a tool call can host the gate; any pipeline that exposes commit, push, and release as observable events can be the boundary.

![Five-step horizontal flow diagram of the PreToolUse risk gate, showing agent intent (git commit, git push, gh pr merge), the hook intercepting, the score check with five fail-closed tests, and the PERMIT and DENY branches.](https://windyroad.com.au/img/social/risk-gate-flow.png)

## The hook

Claude Code's `PreToolUse` hook fires before any tool call and can deny it outright. The interception is regex matching and JSON output:

```bash
INPUT=$(cat)

COMMAND=$(echo "$INPUT" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(data.get('tool_input', {}).get('command', ''))
" 2>/dev/null || echo "")

# Match git commit (handle compound commands too)
echo "$COMMAND" | grep -qE '(^|;|&&|\|\|)\s*git commit' || exit 0

# Check for a valid, fresh, drift-free score below threshold
if ! check_risk_gate "$SESSION_ID" "commit"; then
  cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Commit blocked: ${RISK_GATE_REASON} To proceed: stage files with git add, then delegate to wr-risk-scorer:pipeline to assess cumulative pipeline risk."
  }
}
EOF
  exit 0
fi

exit 0
```

The matcher fires on the `Bash` tool. If the command is not a `git commit`, the hook exits zero and the call runs normally. If it is, the hook calls `check_risk_gate`. The same shape, with a different regex, gates `git push` and the release step.

The production hook also reads two bypass markers scoped to the current Claude Code session before calling the gate: a clean-tree marker (no changes to score) and a one-shot risk-reducing-commit marker. Those let no-risk work proceed without re-scoring. The gate logic itself is unchanged.

## The gate

`check_risk_gate` is the part that decides. It runs five tests in order, fail-closed:

```bash
check_risk_gate() {
  local SESSION_ID="$1"
  local ACTION="$2"
  local SCORE_FILE="$(_risk_dir "$SESSION_ID")/${ACTION}"
  local HASH_FILE="$(_risk_dir "$SESSION_ID")/state-hash"
  local TTL_SECONDS="${RISK_TTL:-3600}"

  # 1. Score must exist (fail-closed)
  [ -f "$SCORE_FILE" ] || {
    RISK_GATE_REASON="No ${ACTION} risk score found."
    return 1
  }

  # 2. Score must be fresh (TTL: 1 hour default)
  local AGE=$(( $(date +%s) - $(_mtime "$SCORE_FILE") ))
  [ "$AGE" -lt "$TTL_SECONDS" ] || {
    RISK_GATE_REASON="Risk score expired (${AGE}s old)."
    return 1
  }

  # 3. State must not have drifted since scoring
  local CURRENT_HASH=$(pipeline-state.sh --hash-inputs | sha256sum | cut -d' ' -f1)
  local STORED_HASH=$(cat "$HASH_FILE" 2>/dev/null || echo "")
  [ "$STORED_HASH" = "$CURRENT_HASH" ] || {
    RISK_GATE_REASON="Pipeline state changed since scoring."
    return 1
  }

  # 4. Score must be below appetite threshold (RISK-POLICY.md: residual >= 5 blocks)
  local SCORE=$(cat "$SCORE_FILE")
  [ "$SCORE" -lt 5 ] || {
    RISK_GATE_REASON="${ACTION} risk score ${SCORE}/25 (Medium or above)."
    return 1
  }

  return 0
}
```

The five checks together close the obvious bypass paths. Existence stops "no score, run anyway." TTL stops "scored at the start of the session, run two hours later after the situation changed." Hash drift stops "scored a small change, then added more files before running." Threshold stops "scored as risky, run anyway."

The production version carries one refinement worth calling out: a staleness check on `RISK-POLICY.md` itself. If the policy has not been reviewed in two weeks, the gate fails closed. An unread policy is a rule, not a control. The other refinements (a half-TTL slide for unchanged trees, a hard cap on how long a single score can ride) are operational; the five-check spine is what does the work.

## The score

The score is not a vibe check. It comes from a written policy and a structured calculation.

The framework follows [ISO 31000](https://www.iso.org/standard/65694.html), the international standard for risk management. The terminology (impact, likelihood, inherent risk, residual risk, appetite, control) and the matrix structure are taken from there, not invented for this purpose. `RISK-POLICY.md` defines impact levels (1 Negligible to 5 Severe), likelihood levels (1 Rare to 5 Almost certain), and a 1-25 risk matrix.

The obvious objection: the scoring is done by an LLM, so isn't that just another rule the model can ignore? Two answers, structural and mechanical.

**Structural:** the scoring is done by a separate risk-scorer subagent, a fresh process with its own conversation, called only to score. It is not the agent driving the commit toward a green build. [Apollo Research's in-context scheming study](https://arxiv.org/abs/2412.04984) found that the top-tier models (Claude, GPT, Gemini) will bend or break rules to complete the task they were given, when the task itself rewards it. An agent told to "complete this commit" is in exactly that situation: a low score is what gets the commit through, so the agent has a built-in pull to score the risk low. The risk-scorer subagent has a different task. Its goal is accurate scoring against the policy, not getting the commit through. If the subagent gets it wrong, the error tilts toward flagging too much, not too little. If anything gets in the way of accurate scoring, the subagent works around the obstacle, not around the policy.

**Mechanical:** the score is a discrete artefact, a number written to a file, checked by a deterministic gate. The model's compliance with the policy ends at the moment the file is written. From there, every check is shell.

> The probabilistic step is bounded by the policy and converted into a fixed value before the gate runs.

The risk-scorer subagent reads the diff and produces a structured report with one entry per identified risk. Each entry names the failure scenario, scores impact and likelihood, lists the controls that reduce inherent risk to residual risk, and ends with the residual number.

In a CI/CD-only world, the agent does not call `volumeDelete` directly. It edits `infra/railway.ts` to remove the `prod-pg-volume` resource, then attempts to commit. The commit gate fires. The risk-scorer reads the diff and scores it like this:

| Dimension | Value | Reasoning |
|---|---|---|
| Impact | 5 (Severe) | Diff removes a `Railway.Volume` resource named `prod-pg-volume`. On release, the change deletes the production database volume with no recoverable backup. |
| Likelihood | 5 (Almost certain) | The release pipeline applies infrastructure-as-code changes by default. There is no paired migration or backup snapshot in the same diff. |
| Inherent risk | 25/25 (Very High) | Above appetite by 20. |
| Controls | None named | No paired migration. No backup snapshot referenced in the changeset. No incident ticket linking the removal to an approved change. Monitoring is not a control. System prompt is not a control. |
| Residual risk | 25/25 (Very High) | Same as inherent. No control reduces it. |

The block threshold is residual score >= 5 (Medium band on the 1-25 product scale). The score on this commit is 25. The gate denies and stays denied until the residual drops below 5. That requires either splitting the change (remove the volume in a separate, paired-with-backup change), adding a control that reduces likelihood (an approved-by-incident-ticket changeset, a feature flag), or invoking an incident bypass.

The risk-scorer's prompt explicitly disqualifies monitoring, alerting, and post-release detection as controls. A control tests the failure scenario before the action ships. Anything that reduces time-to-notice after the fact does not reduce residual risk.

![Risk-item card titled commit removes production database volume, with inherent risk impact 5 likelihood 5 totalling 25 of 25, controls none named, and a red verdict bar showing residual 25 of 25, block threshold residual greater than or equal to 5, verdict DENY.](https://windyroad.com.au/img/social/risk-score-anatomy.png)

## What the gate doesn't catch

This pattern is one layer in a stack. It is not a complete answer.

The right model is layered:

1. The agent has no production access. Its credentials are development-only. Production credentials live in CI/CD secrets, used only by pipeline jobs.
2. The infrastructure provider scopes API tokens by operation, environment, and resource. CLI tokens for domain operations cannot call `volumeDelete`. Railway has shipped workspace scoping and project-environment scoping. It has not yet shipped scoping by operation, which is what would block a `volumeDelete` call from a domain-management token. Until that ships, the layers above and below carry the load.
3. The destructive API treats destructive calls like deployments: they require authorisation linked to an audited change, not just authentication. Routine destructive operations carry their authorisation in the change record (an approved cleanup, a scheduled rotation). Where explicit human sign-off is required for a specific call, the API requires something the agent cannot self-issue.
4. The pipeline has a risk-scoring gate on commit, push, and release.

![Vertical stack of four numbered layer cards showing the defence-in-depth model. PocketOS state column on the right marks layers 1 to 3 as missing and layer 4 as system prompt instead.](https://windyroad.com.au/img/social/layered-defence.png)

If layer 1 holds, the PocketOS curl call cannot be made: the agent has no token to authenticate it. If layer 1 fails for any reason (a leaked credential, a misconfigured CI secret, a developer who copies a production token to a local file), layers 2-3 reduce the blast radius. Layer 4 catches risky changes that flow through the pipeline the agent is supposed to use but should not be released. The PocketOS incident had no layer 1, no layer 2, no layer 3, and a paragraph of system-prompt text where layer 4 should have been.

## A test you can run today

Open your project. List every credential it holds: API tokens, deploy keys, database passwords, OAuth refresh tokens, machine-user PATs (personal access tokens), MCP server secrets, anything an agent's `Bash` or `Read` tool could surface and use.

For each one, answer three questions:

1. Is the credential stored anywhere the agent can read it (a dotfile, an env file, a project secret loaded into the shell)?
2. Can the holder reach production?
3. Can the holder call a destructive API?

If any answer is yes for any single credential, that is the same gap that took down PocketOS. The gap is not specific to Railway. It is the default state of every team that lets agents work alongside production credentials in their development environment.

The remediation is structural, not procedural. Move production credentials out of the agent's reach. Make production-bound changes flow through the pipeline. Put a control on the pipeline.

## Adapting this to your project

This is the kind of thing we set up for clients running AI agents against production.

Two prerequisites. First, your agents work in development environments. Production credentials live in CI/CD secrets and are not accessible to interactive sessions. Second, your team ships through a pipeline. Code is committed, pushed, and released through known checkpoints.

The prerequisites are hardest for solo developers, small teams without a CI/CD platform, infrastructure that is not yet codified, and emergency break-glass debugging of production incidents. The cheapest first step there is to separate development and production credentials and store the production credential somewhere the agent's tools cannot read: not your shell history, not a dotfile in the project, not the `.env` you source at session start. The pipeline gate is the next step once a pipeline exists.

If both prerequisites are in place, the simplest path is to install the plugin:

```bash
npx @windyroad/risk-scorer
```

Restart Claude Code afterward. The plugin wires the commit, push, and release gates and registers the risk-scorer subagent. On first run in a project without a `RISK-POLICY.md`, it directs you to generate one with `/wr-risk-scorer:update-policy`, which produces a policy tailored to your project.

To build the gate from scratch, you need three artefacts. A `RISK-POLICY.md` that defines impact levels, likelihood levels, the matrix, and the appetite threshold for your business. A risk-scorer prompt that reads diffs and conversation context and writes scores against the policy. A `PreToolUse` hook that gates the pipeline action you care about (`git commit`, `git push`, the release step). The hook checks for a score file, confirms it is fresh and matches the current state, and denies the call if the score is above threshold.

Start with one action. The commit gate is the cheapest to add. The push gate is the next. The release gate scores the queued unreleased changesets and fires on the release-PR merge.

Two design choices have non-obvious tradeoffs. First, store the score file per session, not per project. (A session is one Claude Code conversation; a project spans many.) A global score is faster but lets one session's reasoning authorise another session's action. Second, set a TTL short enough that stale scores do not accumulate; one hour is a reasonable default. Hash the pipeline state when you write the score, then re-hash and compare when the gate runs. Without that check, the agent can stage more files after scoring and still pass.

Decide what bypasses you allow. The plugin allows two: `RISK_BYPASS: reducing` for commits that genuinely reduce risk (closing a problem ticket, retiring a hazardous code path), and `RISK_BYPASS: incident` for live incidents. The reducing bypass requires a structured `RISK_BYPASS_REASON:` line in the agent's output, which lands in the audit trail. The incident bypass is logged but does not currently require a structured reason; if you copy this pattern, consider tightening that. The bypass is the only escape; the audit is the only discipline. Without both, the gate is back to being a rule.

## What to take away

We started with a deleted production database and 9 seconds of API time. We landed somewhere upstream of all three: an interactive session held a production credential it should never have had, an API treated destruction the same as a read, and a system prompt was asked to do a job no system prompt can do. What the agent's confession framed as a personal failure was a structural failure long before the model was ever invoked.

The portable lessons:

- **Rules are not controls.** A rule is text. A control is enforcement. Audit the two as separate things.
- **No production access for agents.** Production credentials live in CI/CD secrets, used only by pipeline jobs. Layer 1 in the layered model above is the one that does the most work.
- **The pipeline is the boundary.** Production-bound changes flow through commit, push, and release. A control on those three actions catches the risky ones before they ship.
- **Scoring beats denylisting** for the same reason controls beat rules. A list of forbidden commands becomes unmaintainable; a score recomputed against the current change does not. The policy is readable, the threshold is fixed, and neither is the agent's call.
- **Three properties make a control.** It fires before the action, decides from a written policy not the agent's judgement, and has a structured bypass that lands in an audit trail. If only two of three, you have half a control.

Even with all four layers, the model has gaps. Malware already running on the developer's machine reads tokens without going through the agent. A poisoned dependency, slipped in upstream, lands in the agent's path before any of the layers fire. A maintenance script written months ago, against a setup that has since changed, flows through the pipeline normally; its diff looks small, scores low, and nothing in the change signals its real effect. The layered model reduces the space of possible failures. It does not eliminate it.

The next problem is what risk policy looks like for your business, since the gate is only as good as the matrix it scores against. We have written about [pipeline discipline](https://windyroad.com.au/blog/enforcing-pipeline-discipline-with-claude-code-hooks), [architecture enforcement](https://windyroad.com.au/blog/stop-your-ai-agent-from-ignoring-your-architecture), and [the WIP back-pressure that the same risk-scorer brings to commits](https://windyroad.com.au/blog/your-ai-agent-doesnt-know-when-to-stop-committing). The plugin source is in [windyroad/agent-plugins](https://github.com/windyroad/agent-plugins).
