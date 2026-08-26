# Problem 172: The deprecated full-file compendium generator still runs and clobbers hook-authored entries

**Status**: Open
**Reported**: 2026-08-26
**Priority**: 8 (Medium) - Impact: Minor (2) x Likelihood: Likely (4). Impact is 2 because the blast radius is dev tooling and governance prose: the published site and the newsletter pipeline are untouched, and no gate verdict can be wrong from it because the commit gate reads `RISK-POLICY.md` and never the compendium. Likelihood is 4 because nothing checks for it. No hook compares `docs/decisions/README.md` against generator output, so a rewrite lands silently, and the path is prescribed rather than merely reachable (see Description). Derived at capture; cf. P128, which rates the same governance-prose class at Impact 2.
**Origin**: internal
**Effort**: M - a guard on the generator plus a test. The generator is upstream in `wr-architect`, so the local work is a proposal, not a change (see Fix Strategy).

## Description

`scripts/generate-decisions-compendium.sh` in the installed `wr-architect` plugin declares itself deprecated on every invocation and then runs to completion anyway. It re-derives every entry in `docs/decisions/README.md` from the ADR bodies, so any annotation that exists only in the compendium is destroyed. There is no guard, no confirmation, and no diff against what it is about to overwrite.

The compendium's other author is the `architect-compendium-update-entry.sh` PostToolUse hook, which re-derives one entry when its ADR is edited. Content authored by that hook, and content hand-corrected after it, both live only in the compendium. The full-file generator overwrites both.

**The destructive path is prescribed in three places, not merely reachable.** Line 3 of `docs/decisions/README.md` reads `do NOT hand-edit; regenerate via wr-architect-generate-decisions-compendium`. The entry hook's own recovery messages instruct the operator to run that same command. So does the architect agent's standing instruction set: asked to review this capture, the architect confirmed its instructions name that command as the mechanical recovery for compendium staleness, and said it was declining to prescribe it here for that reason. An agent following its instructions correctly re-enters the destructive path. That is why this is a mechanism problem rather than an operator-discipline problem.

**Observed 2026-08-23 in commit `0e3957dd`.** The generator ran inside a commit whose subject is `fix(ci): pin trufflehog to an immutable SHA and declare least-privilege permissions`, an otherwise unrelated CI change. Net 31 insertions, 32 deletions on `docs/decisions/README.md`. That it rode an unrelated commit is the evidence that surfaced this, not a second root cause: the same rewrite would have happened had the command been run on its own.

**Blast radius of that one run: eight entries lost their `**Decides:**` prose** and were replaced by the generator's truncated `**Chosen:**` form. The entries were ADR-007, ADR-027, ADR-049, ADR-052, ADR-054, and the three whose lost prose began `` `release-pr` now declares `needs: [deploy-test, gate-accessibility]` ``, `Production must deploy the preview artifact built from the exact commit being released`, and `The Shift's section headings sit at H2`. Several also lost `**Related:**` edges.

**Two of the eight were restored on 2026-08-26** while working P128, verbatim from the pre-clobber revision `368602da`: the ADR-007 and ADR-027 entries, because those two carried the dated staleness clauses that are P128's documented workaround and their loss had put unmarked stale risk-threshold figures back into the In-force section the architect agent reads first. **The other six are still clobbered.** They were left alone deliberately: restoring them inside a P128 iteration would have been authoring content for unrelated decisions, unattended, in an iteration scoped to threshold prose.

**One named consequence, because it is a distinct failure shape.** ADR-049's entry read `**Related:** upstream ADR-086 (agent-plugins, precedent not authority), ADR-007, ADR-008, ADR-027, P128, P082` before the clobber and reads `**Related:** ADR-086, ADR-007, ADR-008, ADR-027` after. There is no local `docs/decisions/086-*`; the highest local ADR id is 057. So the surviving bare `ADR-086` is a dangling reference sitting in the read-first surface, and the qualifier that made it safe by saying it was upstream and not local authority is exactly what was stripped. That is the phantom-reference shape P082 exists to prevent, materialising inside the compendium itself. It is **not repairable by re-deriving the entry**: ADR-049's frontmatter `related:` names only `007`, `008` and `027`, so the `ADR-086` edge and the dropped `P128`/`P082` edges have no frontmatter source at all. Any re-derivation reproduces the dangling bare reference. The annotation that made it safe existed only in the compendium.

**A second dangling reference exists and is NOT clobber-caused.** ADR-045's entry reads `**Related:** ADR-089, ADR-060, ADR-073`, and there is no local `docs/decisions/089-*`. Checked rather than assumed: `0e3957dd` does not touch that line, so it predates the clobber. Recorded here as the same shape from a different cause; its origin was not chased.

## Symptoms

- Compendium entries silently revert from the hook's `**Decides:**` form to the generator's truncated `**Chosen:** ... ...` form, losing any annotation added after the last full-file run.
- `**Related:**` edges disappear, and surviving references can be left dangling once their qualifying prose is stripped.
- The rewrite is staged into a commit about something else, so `git status` shows nothing a reviewer would question.
- Two authoring shapes coexist in one file, which is the readable tell: entries for ADR-056 and ADR-057 carry the hook form while ADR-007, ADR-008 and ADR-027 carry the generator form.

## Workaround

Diff `docs/decisions/README.md` before committing any change that touched it, and restore lost entries verbatim from the last good revision with `git show <rev>:docs/decisions/README.md` rather than re-authoring the prose. Do not run `wr-architect-generate-decisions-compendium` despite the banner, the hook messages and the agent instructions all recommending it.

This is a weak control and it did not hold. It is recorded in a briefing entry subject to Tier-3 rotation, and the 2026-08-23 clobber went unnoticed for three days.

## Impact Assessment

- **Who is affected**: the architect agent, which is documented to read the compendium's In-force section first on routine compliance review, and any reader or agent reasoning about a decision from the compendium rather than the record.
- **Frequency**: every full-file regeneration. The command is recommended by three separate surfaces, so the trigger is ordinary compliant behaviour rather than a mistake.
- **Severity**: no gate verdict can be wrong from this. The cost is destroyed governance annotations, dangling references in the read-first surface, and misdirected agent reasoning.
- **Analytics**: none.

## Root Cause Analysis

### Investigation Tasks

- [ ] Confirm whether the upstream generator can refuse rather than warn, and whether the entry hook's recovery messages and the compendium banner can stop naming it.
- [ ] Decide what the supported recovery is when the compendium genuinely is stale, given that the only tool for it is the destructive one.
- [ ] Restore the six remaining clobbered entries from `368602da`, or decide deliberately that they stay as re-derived.
- [ ] Create a reproduction test.

## Fix Strategy

The generator lives upstream in the `wr-architect` plugin, not in this repository, so **this ticket proposes rather than places**. Per P045, an upstream home is a hypothesis the maintainers can reject, and nothing here should be read as a decision that upstream will carry it. Per ADR-048 (prefer an upstream pull request over an issue), a pull request is preferred to an issue if this is reported.

The shape worth proposing is a guard rather than a removal: the generator already knows it is deprecated, and the cheapest correct behaviour is to refuse unless explicitly forced, since its remaining declared roles are backstop and bootstrap. The three prescribing surfaces need to stop naming it in the same change, or a compliant agent keeps re-entering the path.

Local-only work that does not depend on upstream: restoring the six remaining entries, and correcting the prescription in the compendium banner if that line is locally owned.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P128, P087, P135

## Related

- **P128** (`docs/problems/known-error/128-risk-threshold-restated-in-ten-places-with-no-single-source-of-truth.md`): the ticket this was found from. Its Investigation Task 5 is closed with the claim that "there is no longer a supported path that clobbers"; commit `0e3957dd` falsifies it. P128 owns the two restored entries; this ticket owns the mechanism and the six still clobbered.
- **P087** (`docs/problems/known-error/087-wr-architect-generate-decisions-compendium-emits-em-dashes-violating-adopter-no-em-dash-policies.md`): same tool, different failure. P087's root cause is em-dash emission and its upstream issue is em-dash-scoped, so fixing it would not prevent a clobber. P087 already records the destructive overwrite, but as a symptom paragraph under an em-dash root cause, which is why it has never been fixed.
- **P135** (`docs/problems/open/135-compendium-entry-hook-has-no-arithmetic-over-the-derived-adr-counts.md`): same tool again, different failure, and the precedent for not merging these. P135 says so in terms: "Same tool, different failure, deliberately not merged." The derived counts on the compendium's total line are drifting right now and that is P135's, not this ticket's.
- **P082**: the phantom-reference class the stripped ADR-049 qualifier materialises.
- **ADR-048** (`docs/decisions/048-prefer-an-upstream-pull-request-over-an-issue.proposed.md`): ratified; governs the reporting shape if this goes upstream.
- **Hang-off check not dispatched.** The capture-time mechanical pre-filter returned six candidates sharing the `docs/decisions/README.md` signal, above the cap of five, so `/wr-itil:capture-problem` sub-step 2b skipped the subagent per its own short-circuit. Candidates for review-time re-evaluation: P097, P135, P138, P141, P149, P120. In place of that dispatch, the `wr-architect:agent` reviewer was asked directly whether this belonged here, on P128 or on P087, and ruled a new ticket, reasoning from P135's stated same-tool-different-failure precedent and from P128 having already routed two tooling findings out rather than absorbing them.
- Title-keyword duplicate matches at capture: P083 (closed), P087, P135.
