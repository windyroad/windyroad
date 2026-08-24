# Problem 163: Risk scorer report persistence writes empty files

**Status**: Open
**Reported**: 2026-08-24
**Priority**: 8 (Medium), Impact: 2 x Likelihood: 4, derived at capture. Impact is 2 because nothing reaches a reader or a visitor; the exposure is to the governance audit trail and to the dev-side tooling that consumes it. Likelihood is 4 because no check reads the written file back, which satisfies the likelihood-4 clause "no hooks or automated checks cover this area", and because the failure has already fired sixteen consecutive times without anything surfacing it.
**Origin**: internal
**Effort**: M, re-rated at the pre-commit scoring. Capture assumed S on the belief that the fix site was local. It is not: the write lives in the `wr-risk-scorer` plugin cache, so the write half is an upstream report plus a wait for release. The read-back half is locally implementable and is the part worth doing first.

## Description

The risk scorer's report persistence writes empty files, so no scoring pass since 2026-08-23 has left a re-readable artefact.

Verified on disk 2026-08-24. `.risk-reports/` holds 48 files. Seventeen are one byte. Sixteen of those are consecutive: the last report with content is `2026-08-23T06-35-37-commit.md` at 12,546 bytes, the first empty is `2026-08-23T07-33-14-commit.md`, and every report written since is a single byte. One further empty at `2026-08-23T00-13-15-commit.md` sits earlier and precedes good reports, so this is not a single clean transition and that earlier one may have a separate cause. Reports before the boundary are intact: `2026-08-16T10-22-11-commit.md` is 136 lines and carries its own `RISK_SCORES` line, a `RISK_BYPASS_REASON` and five numbered remediations.

The hook reports success. Nothing surfaced the failure. Eight scoring passes ran on 2026-08-24 alone, each a substantial piece of analysis, and all eight wrote nothing. It was noticed only when a scorer went looking for a prior report in order to check a bypass citation and found a blank page.

## Symptoms

- A scoring pass completes, reports success, and leaves a one-byte file.
- A scorer that needs to cite a prior report cannot read one, and says so mid-assessment rather than failing.
- `.risk-reports/` grows at the normal rate, so directory listings and file counts look healthy.

## Workaround

None. The analysis exists only in the session transcript that produced it, and only until that transcript is gone.

## Impact Assessment

- **Who is affected**: anyone auditing why a commit was allowed, including the next scoring pass. No reader or visitor path.
- **Frequency**: every scoring pass since 2026-08-23T07:33. Sixteen consecutive, eight of them on 2026-08-24.
- **Severity**: the reasoning behind sixteen commit-gate decisions is unrecoverable. Whether anything was mis-gated is unverified, and the hook's branch structure argues against assuming not: the score files are written only when a `RISK_SCORES:` line parses, at lines 42 to 54, while `state-hash` refreshes unconditionally at lines 72 to 76. A pass that parses nothing therefore leaves the previous pass's scores in place behind a drift hash freshened by the very run that failed. This has not been observed happening; it is read off the branches, and it is the reason the earlier draft of this ticket asserting that nothing was mis-gated was wrong to do so.
- **Analytics**: not instrumented.

## Root Cause Analysis

### Fix site, verified on disk 2026-08-24

The writer is `hooks/risk-score-mark.sh` in the `wr-risk-scorer` plugin cache, not in this repository. Line 33 captures the agent output once with `AGENT_OUTPUT=$(_get_tool_output)`, and line 83 writes it with `echo "$AGENT_OUTPUT" > "$REPORT_PATH"`. There is no other branch at line 83, so a one-byte file is `echo ""`, which means the capture at line 33 returned nothing. `_get_tool_output` lives in `hooks/lib/gate-helpers.sh` and reads `tool_response.content[]` for text items with a fallback to `tool_output`; if the PostToolUse payload shape changed, it returns empty and every consumer below line 33 silently gets nothing.

Five versions are cached: 0.9.0, 0.13.5, 0.17.0, 0.18.6 and 0.18.15. The write site is byte-identical between 0.17.0 and 0.18.6, so the change is upstream of it. 0.18.6 ships a `risk-scorer-dispatch.sh` that 0.17.0 does not, and a dispatch-layer change is exactly the shape that alters the payload reaching a PostToolUse hook.

This makes the ticket upstream-blocked in the same class as P046 and P047, both already parked against this plugin.

### Preliminary Hypothesis

Something upstream of the write stopped supplying content while the write continued to create the file and exit zero. The window is between 06:35:37 and 07:33:14 on 2026-08-23. The question to ask is not what changed in this repository but whether a `wr-risk-scorer` version landed in that window.

The reason it went unnoticed for a week is separate from the reason it broke. The hook has no read-back: it writes and reports success without confirming the artefact exists and is non-empty. A persistence step that cannot fail visibly will fail this way again.

### Why this is more than a lost log

It breaks a governance surface. The risk-reducing bypass criteria require citing a risk item previously flagged by the scorer in a prior report, and the reason line is meant to make that auditable. The 2026-08-16 report does exactly that, naming an earlier report and its remediations by identifier. From 07:33 on 2026-08-23 onward no such citation can be checked by anyone, including the next scorer. On 2026-08-24 a scorer declined to emit a reducing bypass partly on these grounds: the criterion was met in substance, but the artefact that would evidence it is a blank file, and citing a blank file is not citing.

It quietly consumes the fix path of an existing known error. P145 records that the risk register is empty so every scorer run regenerates from scratch, and its stated remedy is to bootstrap the catalog from the `.risk-reports/` corpus. Every empty report is one less input to that bootstrap.

### Investigation Tasks

- [ ] Run the discriminator first, because it costs one session and no code: is the external-comms gate currently re-blocking after a PASS? If it is, the shared-helper cause is likely and this ticket folds into P074. If markers are landing normally while reports are still one byte, the shared-helper hypothesis is refuted and the separation holds on root cause as well as consequence.
- [ ] Check whether a `wr-risk-scorer` version landed in the 06:35 to 07:33 window on 2026-08-23
- [ ] Determine whether the isolated 00:13 empty has the same cause
- [ ] Create reproduction test
- [ ] Land the read-back check non-blocking, and confirm it **surfaces** rather than merely prints, against the sixteen one-byte files still on disk. A check that correctly detects and is correctly ignored reproduces this defect one layer deeper, and PostToolUse stderr and exit codes are routinely ignored. Confirming red proves the wiring, which is where the risk actually sits.
- [ ] Only after the write is fixed and the check goes quiet, escalate it to blocking. A blocking check landed while the write is still broken would wedge every commit.

## Fix Strategy

Two parts, and the second matters more than the first.

**Find and fix the write.** The window is under an hour and the corpus supplies a clean before-and-after pair to diff against.

**Make the hook read back what it wrote.** A persistence step that reports success without verifying the artefact exists and is non-empty will fail this way again, and the next silent failure will also go unnoticed for a week. This is the same requirement P162's fix strategy arrived at from the other direction, that a step's result has to be a counted output from the artefact rather than a claim from the step, so the two are worth designing together even though they sit on different surfaces.

Write the read-back check first and confirm it fails against the current state, before fixing the write. The red fixture exists now and is free: sixteen one-byte files are on disk. Fix the write first and the fixture is destroyed, then manufacturing it again costs more than the check does. A check that has never been seen failing is, by the standard this project's own newsletter argues, a plan rather than a control.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P145, P159, P162

## Related

Captured via `/wr-itil:capture-problem` on 2026-08-24, during an Issue 19 newsletter finalise, after a scoring pass reported that it could not read its own prior reports.

Two notes on the provenance of this ticket, recorded because the ticket is about an audit trail.

The Impact rating originated with the affected component: it was suggested by the risk scorer, whose own reports are the thing being lost. The self-interested error direction would be inflation and 2 is not inflated, but the origin belongs on the record. It is also why the severity claim above was re-read with extra scepticism, and why the earlier "nothing was mis-gated" assertion did not survive that read.

The evidence base is frozen and was being actively destroyed. Every scoring pass that observes this defect destroys its own observation, so the corpus cannot grow while the ticket is open. Worse, `hooks/risk-score.sh` line 26 runs `find .risk-reports -name '*.md' -mtime +7 -delete` on UserPromptSubmit, and the intact pre-boundary reports were already past that threshold. Thirty intact reports were copied out of `.risk-reports/` on 2026-08-24, before anything else was done to this ticket, so the rotation can no longer reach them. They are the only diff-a-good-pair evidence for this defect and the only non-degraded input to P145's bootstrap.

They are held at `../windyroad-evidence/risk-reports-pre-2026-08-23/`, outside the repository, and that placement is a compromise rather than a good answer. Committing them was blocked by the em-dash gate, which is correct by its own rule: scorer reports contain em-dashes. Rewriting them to comply would destroy the fidelity that makes them evidence. So the corpus is safe from the seven-day rotation but is untracked, unbacked-up and machine-local, which is a worse home than it deserves. Deciding where preserved verbatim artefacts belong in a repository that bans em-dashes in authored content is a real question this ticket has surfaced and does not answer.

The mechanical pre-filter returned 35 candidates, far above the 5-candidate ceiling, so the hang-off arbitration short-circuited per the skill contract and the candidate list is recorded here for review-time re-evaluation. Two were close enough to check by hand rather than defer:

- **P074** (external-comms marker hooks do not write files after subagent pass verdicts) names the same script, and the separation recorded at capture was wrong on the code. Verified on disk: the external-comms marker branch and the report write both read the same `AGENT_OUTPUT`, from the same single `_get_tool_output()` call at line 33. If that call returns empty, the external-comms verdict parses empty, hits the fail-closed arm, writes no marker and the gate re-blocks after a PASS, which is P074's symptom exactly. So it is one file and possibly one fix, with two branches failing in opposite directions.

  The tickets stay separate on **consequence class**, which is a real distinction and drives prioritisation: P074 fails closed and announces itself, this one fails open and is silent. But the root cause of this ticket is not yet known, so no root-cause separation can be asserted either way. **Merge trigger: if the investigation lands on `_get_tool_output` or anything shared above line 33, fold this ticket and P074 into one record.**

- **P124** (governance edit-gate markers fail to land after a genuine pass) is the same family at one remove and should be re-read when the discriminator below is run.
- **P159** (a self-produced measurement is trusted without checking) is the general case of the second half of the fix strategy. Worth testing at review time whether this should hang off it rather than stand alone; the argument for standing alone is that P159 is about trusting a measurement, and this is about a write that produced no measurement at all.
- **P145** (risk register is empty so every scorer run regenerates from scratch) is not a sibling but is materially affected: this defect erodes its stated fix path. Recording on both is worthwhile.
