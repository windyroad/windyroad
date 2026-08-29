# Problem 176: The newsletter eval harness cannot run on this machine, so no change to it can be verified by running it

**Status**: Open
**Reported**: 2026-08-29
**Priority**: 8 (Medium), Impact: 2 x Likelihood: 4, derived at capture from the description. Impact is 2 because nothing reader-facing is at stake and the harness is dev tooling, but it is not 1 because this harness is the instrument that certifies changes to publication-blocking gates, and while it cannot run locally, every claim about it has to be reasoned from source instead of observed. Likelihood is 4 because the blocker is a missing native binding for the Node versions installed here, which is a property of the machine rather than of any particular run, so it recurs on every local invocation until the environment changes.
**Origin**: internal
**Effort**: S, derived at capture. The likely fix is installing the Node version CI already uses, or adding an `engines` field to `package.json` so the mismatch fails at install with a readable message. Both are single-surface changes. Sized alongside P169 (an AFK shell-assumption defect, also S) rather than alongside a dependency migration, because moving off the native binding is the fallback rather than the expected route.
**WSJF**: 8.0 = (8 x 1.0) / 1 (first computed at the 2026-08-29 review; the capture skeleton wrote Priority and Effort but no WSJF line)

## Description

Two things were observed on 2026-08-29, during the P158 iteration.

**Observed.** A locally installed `promptfoo@0.120.19`, run against a throwaway config outside this repository, aborts during database migration with `Database migration failed: Error: Could not locate the bindings file`, naming paths under `better-sqlite3`. No fixture executes and no results table is printed. This happened on both Node versions installed here, 22.7.0 and 24.16.0. Nothing in the failure names a Node version as the cause; the error names a missing `.node` file, which reads as a broken dependency rather than as a runtime mismatch.

**Also observed.** `.nvmrc` pins Node 20.19.0, and that version is not installed on this machine. `.nvmrc` is consumed by CI, where six `actions/setup-node` steps across `main-pipeline.yml`, `publish-pipeline.yml` and `release-pr-preview.yml` read it via `node-version-file`. Nothing in `package.json` or in the eval scripts' local invocation path reads it, and `package.json` declares no `engines` field, so locally the pin documents an intent without enforcing it.

**Also observed.** No workflow runs the eval scripts. Nothing under `.github/workflows/` references `eval:newsletter` in any form, so the harness is not exercised in CI at all. That removes the runtime asymmetry it would be natural to assume from the paragraph above, and it means the local blocker is the only place this harness is ever run.

**Inferred, not observed.** That the second fact explains the first, and therefore that installing 20.19.0 would fix it. `better-sqlite3` may equally lack a prebuild for that version on this platform. Investigation Task 1 exists to settle it, and it should be settled before anyone spends an iteration installing a runtime.

The consequence is not that one command is inconvenient. It is that any change to the ADR-052 eval harness has to be argued from promptfoo's source rather than confirmed by running the fixtures. P158's corrected symptom figure is labelled predicted rather than observed for exactly this reason, and the same limit will apply to whoever implements its fix.

Fix candidates, in the order they are worth trying: install the Node version CI uses; add an `engines` field so the mismatch fails loudly at install time rather than at database migration; or move the affected tooling off a dependency that needs a native binding.

## Symptoms

- **Observed.** `promptfoo@0.120.19`, installed locally into a scratch directory and invoked directly against a throwaway config outside this repository, exits during database migration with `Database migration failed: Error: Could not locate the bindings file`. Reproduced on Node 22.7.0 and on Node 24.16.0. No fixture ran.
- **Predicted from that, not observed.** `npm run eval:newsletter` and `npm run eval:newsletter:comprehension` should fail the same way, since they reach promptfoo the same way. They were not run, and their vehicle differs in one respect that has not been tested: they resolve promptfoo through `npx --yes`, which installs into the npx cache rather than into a local `node_modules`, so the npx path has not been exercised at all.
- **Observed on disk, and it makes these two the best reproduction path rather than the worst.** `npm run eval:newsletter:falsify` and `npm run eval:newsletter:comprehension:falsify` both drive `falsify.sh`, which has a guard that can exit 2 before promptfoo is reached. The guard is narrow: `git diff --quiet -- "$SKILL_PATH"`, one file, worktree against index, where `SKILL_PATH` defaults to the newsletter SKILL and the comprehension variant points it at the editor agent instead. It fires only when that single file carries unstaged edits. Past it, the script invokes the same `npx --yes promptfoo@0.120.19` the other two scripts use, which makes these the shortest route to exercising the untested npx vehicle named in the bullet above. Two cautions, neither observed and both readable from the script. There is a second precondition before the npx call: `git show "${BASELINE_REF}:${SKILL_PATH}"` has to resolve, and neither baseline ref was checked against the object database, so a clean file alone does not guarantee promptfoo is reached. And the route is not read-only: `falsify.sh` overwrites the tracked file it watches with the baseline version and restores it through an EXIT trap, which is why the guard exists.
- **Observed.** `.nvmrc` reads `20.19.0`; `ls ~/.nvm/versions/node/` shows only `v22.7.0` and `v24.16.0`; `package.json` declares no `engines` field.

## Workaround

None found this session. Reason about harness changes from promptfoo's published source instead of running them, and label any figure derived that way as predicted rather than observed.

## Impact Assessment

- **Who is affected**: whoever next changes or verifies the newsletter eval harness. Today that is the maintainer.
- **Frequency**: every local invocation, until the environment changes. CI never runs this harness, so local is the only place it runs at all.
- **Severity**: Medium. Nothing reaches the published site. The cost is that the instrument certifying publication-blocking gates cannot be exercised locally, so changes to it ship on reasoning rather than on observation.
- **Analytics**: not instrumented.

## Root Cause Analysis

### Investigation Tasks

- [ ] Establish whether Node 20.19.0 actually resolves it, before anyone installs it on that expectation. The failure has been observed only on 22 and 24, and only against a locally installed promptfoo. That the pinned version carries a working `better-sqlite3` prebuild for this platform is inference.
- [ ] Reproduce through the real vehicle. Every npm script reaches promptfoo through `npx --yes promptfoo@0.120.19`, which resolves into the npx cache; the observation used a local install into a scratch `node_modules`, so the npx path has never been exercised. Either falsify script is the shortest route to it, subject to the two cautions in Symptoms bullet 3: its baseline ref has to resolve, and it rewrites a tracked file and restores it on exit. Confirm the npx path fails the same way before writing the fix against it.
- [x] Check whether CI runs these eval scripts. **Answered 2026-08-29 from disk**: it does not. Nothing under `.github/workflows/` references `eval:newsletter` in any form, so the harness runs only locally and the runtime asymmetry this task anticipated does not exist.
- [ ] Decide between installing the runtime, declaring `engines`, and dropping the native-binding dependency. The first two are complementary rather than alternatives.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P158

## Related

Captured via `/wr-itil:capture-problem` during the P158 iteration retro.

Hang-off check dispatched against P165, P172, P173, P140 and P158; verdict PROCEED_NEW. Rationale from that arbitration, recorded so the next reviewer sees what was tested: P158 is the closest candidate and already records this observation twice while explicitly scoping it out, in its Findings section and again under "Not in scope, recorded so it is not rediscovered". That is a hand-off rather than a deferred sub-phase. P158's root cause is unverified assumptions about promptfoo's config schema, with every fix site in the eval configs, `falsify.sh` and a new decision record; this ticket's root cause is an environment failure, with fix sites in the installed runtime, a `package.json` `engines` field, or the dependency choice. Absorbing an environment blocker into P158 would also couple it to that ticket's ratification-gated sequence, which is queued on a maintainer call about eval cost.

The two compose rather than block. P158's fix can be written and shipped while this stands; what cannot happen is confirming it by running the fixtures, which is why P158's corrected symptom figure is labelled predicted rather than observed.

The observed-versus-inferred separation in the Description and Symptoms sections above is not stylistic. The first draft of this ticket stated the npm scripts' failure and the `.nvmrc` causation as observed fact, and the commit-gate risk scorer caught it: a ticket capturing that a harness reports unobserved things as results had itself done the same thing one layer up. The second draft, written to fix that, introduced two fresh claims of the same kind, which the same gate caught on the re-score: it said `falsify.sh`'s guard fires on a dirty tree when the guard watches a single file, and it counted five CI `setup-node` steps where disk shows six. Both are corrected above. The pattern is worth recording rather than tidying away, because a correction round is evidently not a safe place to relax the discipline.

- **P165**, **P172** and **P173** share only an incidental ADR-052 citation. Their fix sites are the newsletter structure lint, the upstream compendium generator, and the problem-management review process respectively; none reaches a runtime or a dependency.
- **P140** is Verification Pending with its fix shipped, and its subject is a filename-derivation disagreement between two in-repo surfaces. P158 already tested it as a near-miss and rejected it.
