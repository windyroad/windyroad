# Problem 083: ADR compendium docs/decisions/README.md is stale; lists 8 entries while ~40 ADR files exist on disk

**Status**: Open
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

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems.
- [ ] Verify whether the upstream `wr-architect` plugin defines an automatic compendium-regen contract (hook, PostToolUse, commit-gate) that is failing to fire in this project, OR whether regen is documented as a manual step that has not been integrated into this project's commit cycle.
- [ ] If upstream defines an auto-regen contract: identify which hook should have fired and why it has not (probable causes: hook not registered in this project's settings; hook is registered but conditional on a precondition that does not match this project's state; hook fires but its output is discarded).
- [ ] If upstream documents manual regen only: decide whether to (a) add a windyroad-local PostToolUse hook on Write of `docs/decisions/*.md` files that runs the regen, (b) wire regen into `scripts/push-watch.sh` or `scripts/release-watch.sh` as the wrapper-as-defence-in-depth pattern per the existing ADR-021 / ADR-028 precedent, or (c) accept the drift as a manual-discipline pattern and re-rate the priority down.
- [ ] One-shot regen + commit to clear the current drift independent of the structural fix.

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
