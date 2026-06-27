# Problem 083: ADR compendium docs/decisions/README.md is stale; lists 8 entries while ~40 ADR files exist on disk

**Status**: Closed
**Reported**: 2026-06-02
**Priority**: 3 (Medium). Impact: 3 x Likelihood: 1 (deferred. Re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: M (deferred. Re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

The ADR compendium `docs/decisions/README.md` is structurally out of date relative to the on-disk ADR inventory.

**Verified disk-state evidence (2026-06-02)**:

- `docs/decisions/README.md` enumerates 8 ADR entries: 001, 002, 004, 005, 006, 007, 008, 023 (under "Proposed Decisions") plus 003 (under "Superseded Decisions").
- `ls docs/decisions/*.md | wc -l` returns 40 files (39 ADR bodies plus the README itself); highest numbered ADR on disk is 039.
- ADRs 009-022 and 024-039 are present on disk but absent from `docs/decisions/README.md`.

**Verified tooling**:

- `wr-architect-generate-decisions-compendium` exists in the upstream `wr-architect` plugin's `bin/` directory (`packages/architect/bin/wr-architect-generate-decisions-compendium`) and resolves on `$PATH` per ADR-049 shim convention. Manual recovery is `wr-architect-generate-decisions-compendium && git add docs/decisions/README.md`.

**Architect-side hypothesis (NOT verified locally; flagged per P082 discipline)**:

- The wr-architect plugin's agent prompt cites an upstream "ADR-077" rule requiring compendium regen when ADR bodies change. ADR-077 does not exist in this project's `docs/decisions/` (highest local ADR is 039); the reference presumably points at an ADR in the upstream `agent-plugins` repo. The "regen has not been firing" framing assumes ADR-077 establishes an automatic regen contract that is being silently violated; whether the upstream actually pins automatic regen, or merely declares the compendium-out-of-date condition without a regen hook, is unverified.

**How the drift surfaced**: `wr-architect:agent` review during the P065 iter on 2026-06-02 (AFK work-problems iter 6) reported the compendium count mismatch as a side observation. Routed via `/wr-retrospective:run-retro` Step 4b Stage 1 mechanical-auto-ticket per the P342 trust-boundary carve-out (recurring class-of-behaviour: every ADR landing this session leaves the compendium further behind; iters 1-5 of this AFK loop landed ADR-035, ADR-033 Phase 2, ADR-037, ADR-038, ADR-039 without refreshing the compendium).

## Symptoms

- `docs/decisions/README.md` Proposed Decisions list omits 26+ ADRs that exist on disk.
- Drift recurs on every ADR landing because the compendium is not auto-regenerated as part of the commit cycle that lands a new ADR or amends an existing one.

## Workaround

After landing or amending an ADR, manually run `wr-architect-generate-decisions-compendium` and stage `docs/decisions/README.md` in the same commit (or a follow-on commit).

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: (deferred to investigation; appears to fire on every ADR landing or amendment)
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [x] One-shot regen + commit to clear the current drift independent of the structural fix. RESOLVED: the compendium was regenerated on 2026-06-03 (commit `85113e4`, the ADR-037/038/039 sub-decision drain) and has been kept current since (last touched 2026-06-17, commit `a66ad4a`, ADR-026 amendment). On-disk verification 2026-06-27 (see `## Fix Released`) confirms the drift no longer exists.
- [x] Decide where the recurring-regeneration structural fix lives. The compendium emitting U+2014 em-dashes on regen (the generator-bug that the no-em-dash hook blocks) is the SEPARATE upstream ticket P087 (`wr-architect-generate-decisions-compendium emits em-dashes`). The structural auto-regen-on-ADR-landing concern is therefore out of scope for this windyroad-local ticket; this ticket covers the disk-verifiable one-shot drift only.
- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems. (Now Verification Pending; excluded from WSJF ranking per ADR-022.)

## Fix Released

The one-shot compendium drift this ticket describes is **already resolved on disk**; the windyroad-local lever (regenerate `docs/decisions/README.md` directly so it enumerates every on-disk ADR) was satisfied as a side-effect of the 2026-06-03 ADR drain, the day after this ticket was filed.

**On-disk verification (2026-06-27)**:

- `ls docs/decisions/[0-9]*.md` returns 39 ADR bodies (001-039); no gaps.
- `docs/decisions/README.md` enumerates all 39: 36 in-force (`In-force decisions` section) plus 3 historical (`Historical decisions`: 003, 016, 022). Header reads `**Total ADRs:** 39 (36 in-force, 3 historical)`.
- Every README status badge matches the on-disk filename status (spot-confirmed across all 39: e.g. 006/033/035 `.accepted`, 003/016/022 `.superseded`, the rest `.proposed`).
- The README is ASCII-only: `grep -c` for U+2014 (em-dash) and U+2013 (en-dash) both return 0. Separators are spaced ASCII hyphens.

The original symptom (README listing 8 entries while ~40 ADRs exist) was a true snapshot on 2026-06-02 but a falsified hypothesis by 2026-06-27. Per the verify-before-asserting discipline (P032 / P103 / P082), this iteration grounded the claim against disk before acting rather than blindly regenerating; the file needed no edit.

**Resolution provenance**:

- `85113e4` (2026-06-03) "docs(architect): drain 6 sub-decisions from ADR-037, ADR-038, ADR-039" regenerated the compendium to its current complete shape.
- `a66ad4a` (2026-06-17) "docs(decisions): amend ADR-026 LinkedIn-sibling shape" kept it current.

**Out of scope (upstream P087)**: the recurring-regeneration structural fix is the buggy upstream generator `wr-architect-generate-decisions-compendium` emitting U+2014 em-dashes that adopter no-em-dash hooks block. That is tracked as P087 and was deliberately NOT run here; the current ASCII-clean README was produced by the 2026-06-03 drain, not the raw generator. The README header's `per ADR-077` reference points at an upstream `agent-plugins` ADR, not a local one (highest local ADR is 039) - consistent with the P082 caveat recorded below; it is not load-bearing for this ticket.

**Verification trigger**: spot-check `docs/decisions/README.md` against `ls docs/decisions/[0-9]*.md` on the next ADR landing - the compendium should still enumerate every on-disk ADR with matching statuses and remain ASCII-only. Recurrence (a new ADR landing without a corresponding compendium refresh) reopens the structural concern, which routes to upstream P087.

Transitioned 2026-06-27 (was misfiled as Open; drift self-resolved 2026-06-03 via the ADR-037/038/039 drain). No fix commit by this iteration - the deliverable was already on disk; this transition records that and moves the ticket to Verification Pending. Doc-class / problem-ticket edit, no changeset.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: P082 (subagent fabrication discipline) is a sibling-class concern; this ticket's body was scrubbed against P082's same-day verification to separate the disk-verifiable drift evidence from the architect's unverified upstream-ADR claim.
- **Composes with**: (none)

## Related

- P065 (Newsletter cog-a11y target choice on leader register). The architect surfaced the compendium drift during the P065 iter as a side observation; P065 line 74 logs the finding for retro triage. P065's domain (cog-a11y calibration) is structurally distinct from this drift.
- P082 (Subagent outputs include fabricated references to artefacts not on disk). Sibling-class concern: P082 documents the subagent's tendency to cite nonexistent ADRs / tools; this ticket's body was scrubbed against P082's discipline so the architect's "ADR-077" claim is recorded as upstream hypothesis rather than load-bearing fact.
- /wr-retrospective:run-retro Step 4b Stage 1 mechanical-auto-ticket (P342 trust-boundary carve-out). The surfacing channel.
- `wr-architect-generate-decisions-compendium` (verified on `$PATH`; located at `packages/architect/bin/wr-architect-generate-decisions-compendium` in the upstream architect plugin). The recovery tool.
- Captured via /wr-itil:capture-problem on 2026-06-02; expand at next investigation.

### Hang-off-check verdict (2026-06-02, /wr-itil:capture-problem Step 2b)

PROCEED_NEW. Neither P065 (cog-a11y target calibration; domain structurally distinct) nor P082 (subagent fabrication pattern; fix locus is the subagent grounding contract, not the compendium itself) absorbs the new capture's actual problem (the disk-verifiable README.md vs disk count drift). Caveat per the subagent verdict: the architect's "ADR-077 requires regen" and "run `wr-architect-generate-decisions-compendium`" claims required verification per P082 discipline; the tool was verified on `$PATH`, the ADR-077 claim was not verified locally (does not exist in this project; presumably references upstream `agent-plugins` repo).

## Closed

- **Closed**: 2026-06-28 (verification-queue drain; evidence-based per ADR-022)
- **Evidence**: docs/decisions/README.md compendium enumerates 40 ADRs matching on-disk inventory (verified 2026-06-27)
- **Recovery**: reopen via /wr-itil:transition-problem 083 known-error if a regression surfaces
