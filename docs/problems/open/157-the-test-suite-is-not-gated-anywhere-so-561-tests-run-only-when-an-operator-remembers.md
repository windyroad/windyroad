# Problem 157: The test suite is not gated anywhere, so 561 tests run only when an operator remembers

**Status**: Open
**Reported**: 2026-08-23
**Priority**: 9 (Medium), Impact: 3 x Likelihood: 3, derived at capture from the description per Step 4a. Impact 3 because the suite covers `src/` alongside the dev scripts, so a regression it would have caught can reach master and the published site, which is pipeline disruption rather than dev-tooling-only. Likelihood 3 because operators do run the suite by habit (it was run twice during the P151 iteration) but nothing makes it unmissable, and the exposure is permanent.
**Origin**: internal
**Effort**: S, derived at capture: one job block in an existing workflow, with care about where it sits relative to the release-blocking steps. Sizing is close to P143 (CI smoke test has no retry), also an S on the same workflow.
**WSJF**: 9.0 = (9 x 1.0) / 1

## Description

`npm test` is `vitest run`, and nothing runs it automatically. Verified on disk 2026-08-23 during the P151 iteration:

- It appears in none of `.github/workflows/main-pipeline.yml`, `publish-pipeline.yml` or `release-pr-preview.yml`. `main-pipeline.yml` runs `npm run lint`, `deps:check`, `build`, pa11y and smoke tests, and never the suite.
- `scripts/push-watch.sh` gates on dependency freshness and CI status, not the suite.
- One git hook is installed, and it is not the suite: `.git/hooks/pre-push` runs `npm run --silent deps:check` and halts on stale deps. `scripts/push-watch.sh` names it in its own comments. `.githooks/` and `.husky/` hold no files, which is a different claim and not the one that matters.

So 561 tests across 32 files are advisory. They pass when someone runs them and are silent otherwise.

The concrete cost surfaced on P151. Check (o) in `scripts/check-newsletter-structure.sh` derives its roster of prescribed gates from `.claude/skills/wr-newsletter/SKILL.md` at run time, deliberately, so the two surfaces cannot disagree. The trade is that a heading quietly dropped from that template shrinks the roster and the check stops asking for that gate, and the only thing standing against it is a cardinality pin in `scripts/check-newsletter-structure.test.mjs`. The risk scorer put that residual at 8/25 on its first pass, above this repo's appetite of 5, and re-scored it to 4 only after correcting the impact grain. Its note on the control was the point: it is real on any run of the suite, but it is not a gate.

It was not fixed inside the P151 commit on purpose. The exposure is identical for every other test in the repo, so the subject is a repo-wide pipeline decision rather than a line item on a newsletter lint, and adding a job to the release-blocking workflow under gate pressure would have been a riskier change than the one it was gating.

## Symptoms

- A behavioural regression in any `scripts/*.test.mjs` or `src/` test can reach master with CI green.
- A control described in a ticket's Resolution as "pinned by test" is pinned only against a run nobody schedules.
- CI green means lint, deps, build, pa11y and smoke passed. It has never meant the suite passed, and reading it that way is easy.

## Workaround

Run `npm test` by hand before committing. This is what happens today and it is why the gap has not bitten yet; it is also exactly the reliance the ticket is about.

## Impact Assessment

- **Who is affected**: the maintainer, and any reader of a published edition or the site if a regression the suite covers ships.
- **Frequency**: continuous exposure. No occurrence observed yet.
- **Severity**: bounded by operator habit today, unbounded if that habit lapses.
- **Analytics**: not instrumented.

## Root Cause Analysis

### Investigation Tasks

- [ ] Investigate root cause
- [ ] Create reproduction test
- [ ] Decide where the suite runs: a job in `main-pipeline.yml`, a pre-push step in `scripts/push-watch.sh`, or both. The workflow is release-blocking, so job ordering and failure semantics need deciding, not assuming. `.git/hooks/pre-push` is a third candidate site and a trap: it is untracked, so it protects the machine it was installed on and nothing else.
- [ ] Check the suite's runtime against the workflow's budget. It took 36 seconds locally on 2026-08-23; confirm it holds on a runner.
- [ ] Confirm the suite passes in a clean checkout. Several cases read the live published-newsletter corpus and one reads `.claude/skills/wr-newsletter/SKILL.md`, so a workflow that does a partial checkout would fail for the wrong reason.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P143, P147, P151

## Related

Captured via `/wr-itil:capture-problem`.

The hang-off pre-filter found six candidates sharing the `main-pipeline.yml` signal, over the five-candidate cap, so the arbitration subagent was not dispatched and the list is recorded here for the next `/wr-itil:review-problems` cluster pass: P141 (GitHub Actions versions are an uninstrumented dependency surface), P143 (CI smoke test has no retry, and its failure skips the production path), P146 (publish pipeline selects the production artifact by recency, not identity), P147 (accessibility gate does not gate the release path), P148 (serve is undeclared, so npx fetches an unpinned major on the release-blocking path) and P151 (the ticket this was captured from).

P147 is the closest sibling by shape: it is the same "a check exists but does not gate the release path" defect, one surface over. If a reviewer wants a common parent, those two plus P143 are the cluster, on the theme of what CI green actually asserts.

The originating evidence is P151's Resolution, which records the residual left standing and why.

## Maintainer decision, 2026-08-23

Tom chose both surfaces: the suite runs in main-pipeline.yml and in push-watch. Belt and braces was preferred over the cheaper main-pipeline-only option, accepting that the suite runs twice and that two places must stay in sync.

**Constraint on the fix, from the architect review of the decision commit (2026-08-23).** Wiring the suite into main-pipeline.yml is not sufficient on its own: the test job must be an ancestor of release-pr, not a sibling hung off build. ADR-050 generalises to every quality gate being a release ancestor, and ADR-051 draws the class line at whether a gate asks if the code is good enough to release, which a test suite plainly does. release-pr currently declares needs: [deploy-test, gate-accessibility]. A sibling job would be reportable and non-blocking, which is the exact defect P147 records. Accepted cost, already implied by choosing both surfaces: ADR-050 ships no override valve, so a red test job stops the release path with no acknowledge-and-ship escape. A second constraint comes from the JTBD review: naming the sync cost is not enough on its own. Two surfaces running the same suite is a fresh instance of the defect class P142 names, two governance surfaces holding different beliefs with nothing reconciling them, and under JTBD-400 a silent divergence is the failure the job exists to prevent. The fix commit must therefore name how drift is detected, not merely accept that it can happen. Either both surfaces invoke one shared script so divergence is structurally impossible, or a test asserts parity between the push-watch invocation and the main-pipeline job. Without one of those, the second brace can go missing and nothing says so.
