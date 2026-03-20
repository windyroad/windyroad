---
date: '2026-03-21'
title: "Your AI agent doesn't know when to stop committing"
author: 'Tom Howard'
tags: ['ci/cd', 'ai coding', 'claude code', 'deployment', 'production', 'software delivery']
---

A low-risk commit is fine on its own. Ten low-risk commits that haven't been pushed are not fine. The risk compounds. Each commit adds to a batch that will eventually land on a CI pipeline, and that batch has its own risk profile that no individual commit score captures.

I had a [risk scorer](/blog/making-work-in-progress-visible-to-your-ai-agent) that assessed each diff before committing. It worked for individual commits. But it was blind to what happened after the commit. The agent would commit ten small changes, each scoring 2/25 (Very Low), and never push. Meanwhile the accumulated diff was 400 lines touching the build pipeline, the deploy config, and three hook scripts. That batch, as a push, was not low risk.

<span data-pull>Risk doesn't stay where you put it. It flows downstream.</span>

The fix is to score the pipeline, not just the diff. Every prompt now produces two risk reports: one for the commit (the uncommitted changes) and one for the push (the accumulated unpushed changes). Each report considers the effect on the next queue downstream.

## The pipeline as a connected system

Code flows through three queues on its way to production: commit, push, release. Each queue accumulates work-in-progress. Each has a risk profile.

The risk scorer now assesses two of these every prompt:

| Action | What it scores | What it considers downstream |
|--------|---------------|----------------------------|
| Commit | The uncommitted diff | What the push batch would become |
| Push | The accumulated unpushed changes | What the release would become |
| Release | The full release PR | Nothing (terminal) |

Release scoring happens on demand, only when `release:watch` is attempted. The other two run every prompt.

## Back-pressure

The key design choice is downstream back-pressure. Each action must consider its effect on the next queue.

If committing a change would make the accumulated unpushed diff too risky to push, the scorer warns. The agent gets a signal: "push what you have before adding more." If pushing would make the accumulated unreleased changes too risky to release, the scorer warns again: "release first, or reduce what you're pushing."

This is how WIP limits work in Lean manufacturing. You don't keep adding items to a queue that's already full. The downstream constraint flows backwards through the system, limiting intake.

The threshold is uniform: residual risk < 5 (on a 1-25 scale) for every action. CI controls and deploy previews reduce residual risk, but they don't change the appetite. A push isn't safer just because CI will catch some problems. The pipeline is a system for delivering change to production; the risk tolerance is the same at every stage.

## Risk-reducing bypass

Back-pressure has an escape hatch. If the push queue is at high risk because of a risky change, a commit that reverts that change or adds tests for it should be encouraged, not blocked.

The scorer handles this by projecting the downstream state. Before applying back-pressure, it scores what the downstream queue would look like with the new change included. If the projected risk is lower than the current risk, the change is risk-reducing and bypasses back-pressure.

This avoids a binary classification. A change isn't "risk-increasing" or "risk-reducing" by category. It depends on what's already in the queue. Adding tests is risk-reducing when the queue lacks test coverage. Adding tests is neutral when the queue already has coverage and the risk comes from something else.

## Pipeline state

A standalone script gathers the full pipeline state using only local git operations. No network calls. No GitHub API. It runs on every prompt without adding latency.

```bash
.claude/hooks/lib/pipeline-state.sh --all
```

The output is structured text with four sections:

```
=== UNCOMMITTED CHANGES ===
Tracked changes (git diff HEAD --stat):
 .claude/hooks/risk-score.sh | 191 ++++++++++----------
 RISK-POLICY.md              |  40 ++---
 2 files changed, 120 insertions(+), 111 deletions(-)

Categories:
  hooks: 1 file(s)
  docs: 1 file(s)

=== UNPUSHED CHANGES ===
Unpushed commits (3):
abc1234 feat: add pipeline state script
def5678 refactor: risk scorer for action awareness
ghi9012 chore: update risk policy

Accumulated unpushed diff:
 12 files changed, 696 insertions(+), 241 deletions(-)

=== UNRELEASED CHANGES ===
Pending changesets: 1
Accumulated unreleased diff (origin/publish..origin/master):
 7 files changed, 154 insertions(+), 31 deletions(-)

=== STALE FILES ===
No stale files.
```

The script accepts flags (`--uncommitted`, `--unpushed`, `--unreleased`, `--stale`, `--all`) so hooks can request only the sections they need.

## The risk reports

The scorer produces two reports per prompt. Each follows the same structure: inherent risk, mitigating controls, residual risk, downstream impact.

```
## Commit Risk Report

### Inherent Risk
- Impact: 1/5 (Negligible) - Developer tooling only
- Likelihood: 2/5 (Unlikely) - Hook scripts could regress

### Mitigating Controls
- Architect review hook - directly applicable
- Risk score commit gate - self-referential but applicable

### Residual Risk
- Impact: 1/5 (Negligible)
- Likelihood: 1/5 (Rare)
- Risk rating: 1/25 (Very Low)

### Downstream Impact
- Projected push risk if committed: Very Low
- Back-pressure: none

## Push Risk Report
...
```

When both scores are low, the scorer adds flow guidance: "commit and push this batch." When downstream risk is high, it suggests risk-reducing actions first: "push risk is accumulating, push current commits before continuing."

## Absorbing WIP nudges

The previous setup had a separate `wip-nudge.sh` hook that tracked stale files and unpushed commit counts. It gathered some of the same data as the risk scorer, producing duplicate signals.

The pipeline state script now gathers everything: uncommitted changes, unpushed changes, unreleased changes, and stale files. The risk scoring hook emits WIP warnings as part of its output. One hook, one data source, one coherent signal.

## The gates

Three gates enforce the threshold at different points in the pipeline:

**Commit gate** (`risk-score-commit-gate.sh`): Reads the commit risk score. If >= 5, denies `git commit`. The agent must reduce the uncommitted changes first.

**Push gate** (`git-push-gate.sh`): Reads the push risk score when `push:watch` runs. If >= 5, denies the push. The agent must reduce the accumulated unpushed changes or release existing unreleased changes first.

**Release gate** (`git-push-gate.sh`): Reads the release risk score when `release:watch` runs. If >= 5, denies the release. Otherwise, prompts for human confirmation as before.

The commit gate existed before. The push and release gates are new.

## Adapting this for your project

The pattern works for any pipeline with multiple stages where work accumulates. The specifics here are tuned for trunk-based development with changesets and a `publish` branch.

To build your own version, start with two questions: where does work accumulate, and what does each stage look like when it's too full?

Map your pipeline stages. For most projects, that's at least commit and push. If you have a staging environment or a release branch, that's another stage.

Define what "too risky" means at each stage. A 400-line push touching the build config is different from a 400-line push that's all documentation. The scorer needs to understand what the changes are, not just count them.

Wire the gates to the right intercept points. Commit gates fire on `git commit`. Push gates fire on your push command. Release gates fire on your release command. Each gate reads a score file and denies the action if the score is too high.

Keep prompt-time hooks fast and network-free. Everything that runs on `UserPromptSubmit` should use local git operations only. Network calls belong in the action scripts (`push:watch`, `release:watch`), not in the hooks that run on every prompt.

The full implementation is in the public repo at [github.com/windyroad/windyroad](https://github.com/windyroad/windyroad).
