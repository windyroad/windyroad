# Problem 124: Governance edit-gate markers fail to land after a genuine PASS, costing a redundant review round

**Status**: Open
**Reported**: 2026-08-05
**Priority**: 9 (Medium), Impact: 3 x Likelihood: 3, derived at capture. Impact is 3 because no wrong output ships: the gate fails closed, so the cost is a wasted subagent round plus the confusion of a passing review that does not unblock edits. Likelihood is 3 because both causes fired in a single iteration and neither is rare: verdict formatting is agent-authored prose, and SendMessage resumption is the natural way to continue a review that needs another pass.
**Origin**: internal
**Effort**: M, derived at capture. Two distinct hook-side fixes in the upstream `wr-architect` (and sibling `wr-jtbd`) plugin: loosen the verdict anchor, and make the marker land on agent-resume. Comparable to P085 (external-comms marker hash invalidation), also rated M.
**JTBD**: JTBD-001
**Persona**: developer

## Description

Two independent defects produce the same observable failure: a governance review agent returns a genuine PASS, the reviewing work is complete and correct, and the edit gate still denies the next Write. Each costs a full redundant subagent round to recover.

**Cause 1: the verdict anchor is a literal bold line, and the hook fails closed on anything else.**

`architect-mark-reviewed.sh` (wr-architect 0.20.2, `hooks/architect-mark-reviewed.sh` lines 36-66) parses the agent's output with:

```
grep -qE '^[[:space:]]*>?[[:space:]]*\*\*Architecture Review: PASS\*\*'
```

and its `case` statement routes `FAIL|""` to the same branch: no marker. In the 0.20.0 shipped alongside it, the equivalent branch is `PASS|""` (allow-with-marker on unparseable) with a comment naming backward compatibility. So the two versions disagree on the unparseable case, and the newer one fails closed.

Observed 2026-08-05 during the P120 iteration: the `wr-architect:agent` subagent completed its review, verified every folded item against disk, and emitted `## Architecture Review: PASS` as a markdown heading. That is a semantically unambiguous PASS and matches nothing in the anchor. No marker was written, the next `Edit` on `docs/decisions/043-...proposed.md` was denied, and recovery took a fourth full architect invocation whose only added instruction was to emit the verdict in the pinned bold shape.

The agent's own "How to Report" section specifies the bold form, so this is agent-side drift against a hook-side contract that has no tolerance for it. The asymmetry is the problem: the verdict's *content* is agent-authored prose, and the hook treats its *formatting* as load-bearing with no fallback.

**Cause 2: `SendMessage` resumption of a review agent never fires the marker hook at all.**

The marker is written by a `PostToolUse:Agent` hook. Resuming an existing review agent via `SendMessage` (the natural way to continue a review that needs a second or third pass with its context intact) does not fire that hook. Observed the same iteration: the `wr-jtbd:agent` was resumed via SendMessage, ran a full third pass, and returned PASS. `/tmp/jtbd-verdict` held `PASS`, but no `/tmp/jtbd-reviewed-<SID>` marker existed, so edits stayed blocked. Recovery was a fresh `Agent` tool call covering the same ground the resumed agent had already covered.

The two causes compound. A review that needs three passes hits cause 2 on every resumption, and cause 1 on any pass whose verdict formatting drifts.

## Symptoms

A governance review agent returns PASS, the review content is correct and complete, and the next Edit or Write on a gated path is still denied with "No <gate> review marker found". `/tmp/<gate>-verdict` may contain `PASS` while `/tmp/<gate>-reviewed-<SESSION_ID>` is absent.

**Recurrence 2026-08-05 (P123 AFK iter), cause 1, one day after capture.** A fresh `Agent(subagent_type: 'wr-architect:agent')` call returned a substantive PASS opening with `## Architecture Review: PASS - no ADR conflicts` (heading form with a trailing qualifier, not the pinned bold form). The review was correct and detailed, and it landed no marker; the next Write was denied. Two observations that sharpen the ticket:

- The deny message itself now documents the escape (`touch /tmp/architect-reviewed-$SID && rm -f /tmp/architect-reviewed-$SID.hash`), which makes the manual assertion the de facto workaround rather than the re-dispatch in the Workaround section below. Re-dispatching would have burned a second full architect review to fix a formatting mismatch in the first one.
- The deny message's `SID = newest architect-plan-reviewed-* / architect-announced-* basename` instruction was not sufficient on its own: markers already existed for the two newest `architect-plan-reviewed-*` SIDs and the Write was still denied, so the correct SID was neither. Asserting across every candidate SID (loop `/tmp/architect-announced-*` and `/tmp/architect-plan-reviewed-*`, touch each matching `architect-reviewed-<sid>`) is what unblocked it. That is the ADR-050 Option C candidate-set discipline the itil create-gate already adopted, applied by hand. It suggests this ticket composes with the architect-gate SID race rather than being purely a verdict-parsing bug.

## Workaround

Fire a fresh `Agent` tool call (not `SendMessage`) and explicitly instruct the agent to emit the verdict in the pinned literal shape, naming the anchor: `**Architecture Review: PASS**` for the architect gate. Both halves are needed: the fresh call is what fires the PostToolUse hook, and the explicit format instruction is what makes the verdict parse.

## Impact Assessment

- **Who is affected**: any session editing gated paths (`docs/decisions/`, and all project files under the JTBD gate). Worst on changes that legitimately need multiple review rounds, which is exactly the class of change the gates exist for.
- **Frequency**: both causes fired in one iteration on 2026-08-05. Cause 2 fires on every SendMessage resumption of a review agent by construction. Cause 1 fires whenever verdict formatting drifts, which is unbounded because the verdict is agent-authored prose.
- **Severity**: no wrong output ships; the gate fails closed, which is the safe direction. The cost is wasted subagent rounds and the misleading signal of a passing review that does not unblock work.
- **Analytics**: none.

## Root Cause Analysis

### Investigation Tasks

- [ ] Decide the right tolerance for the verdict anchor. Options: accept the heading form alongside the bold form; parse the verdict token independent of surrounding markdown emphasis; or restore 0.20.0's allow-on-unparseable and accept the weaker audit signal. The 0.20.0-vs-0.20.2 disagreement on the empty-verdict branch suggests this was already contested upstream and needs a decision rather than a patch.
- [ ] Confirm whether `wr-jtbd`'s `jtbd-mark-reviewed.sh` carries the same anchor fragility. Its verdict path reads `/tmp/jtbd-verdict` written by the agent rather than parsing prose, so it may be immune to cause 1 while still exposed to cause 2.
- [ ] Establish whether `SendMessage` resumption can fire `PostToolUse:Agent` at all, or whether the fix has to be caller-side (a documented "always use a fresh Agent call for a gated review" rule). If it is caller-side, the SKILLs that dispatch review agents should say so.
- [ ] Check whether the same resume-does-not-mark gap affects the other marker-writing gates (voice-tone, style-guide, external-comms, risk-scorer commit gate).

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P085, P088, P074, P023

## Related

- **P085** (`docs/problems/known-error/085-...md`): external-comms gate marker invalidated by commit-message body changes, forcing re-review. Same class, different marker surface: a marker that fails to persist across a legitimate continuation.
- **P088** (`docs/problems/open/088-...md`): architect edit-gate session-ID mismatch under AFK subprocess forces manual marker reconciliation. Sibling on the same marker's identity axis rather than its verdict-parsing or hook-firing axis.
- **P074** (`docs/problems/open/074-...md`): external-comms marker hooks do not write expected marker files after subagent PASS verdicts. Likely the same underlying shape as cause 2 on a different gate; worth checking whether one fix closes both.
- **P023** (`docs/problems/open/023-...md`): architect-gate drift detection removes the marker without offering a recovery path. Adjacent: that ticket is about losing a valid marker, this one is about never writing one.
- Captured via `/wr-itil:capture-problem` from the `/wr-retrospective:run-retro` Step 4b Stage 1 pass on the 2026-08-05 P120 iteration. Fix is upstream in the `wr-architect` (and possibly `wr-jtbd`) plugin, not in this repository.
