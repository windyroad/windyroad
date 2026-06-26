# Problem 103: Assistant asserts negative project-state claims from an incomplete search without verifying or asking

**Status**: Verification Pending
**Reported**: 2026-06-24
**Priority**: 9 (Significant). Impact: Moderate (3) x Likelihood: Likely (3) (deferred, re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: S (deferred, re-rate at next /wr-itil:review-problems)

## Description

The assistant asserted a negative project-state claim, "the `resume` repo does not use 1Password for its Cloudflare token", based on an incomplete repo grep (no `op://` / `1password` / `op read` match), then repeated the conclusion. The user corrected it twice. The token IS in 1Password (item "Cloudflare - Resume (hire-tom-as-cto)"); the repo legitimately had no `op://` reference because the human bridges 1Password to GitHub-secret by hand, which a repo grep can never reveal.

This is a recurrence of CLOSED ticket **P032** (assistant writes claims about project state without verifying first) and adjacent to **P045** (assistant accepts framing without questioning). P032's fix (memory note plus `CLAUDE.md` "Verify before asserting" section) did not prevent recurrence on this axis.

The sharper, codify-worthy sub-pattern: **absence / negative claims ("X does not do Y") cannot be established from a bounded search**, because the mechanism may be human-out-of-band. "Not in the files I searched" is not "does not exist." Negative claims require either exhaustive verification OR asking the user *before* asserting. Asserting a negative from a grep is the specific failure mode here, distinct from P032's "asserting current state from memory of related tickets."

**Evidence (this session, 2026-06-24, turns 3 to 4):**
- `git grep -inE "op://|1password|op read"` in `~/Projects/resume` returned empty, so the assistant asserted "resume doesn't use 1Password" (stated as fact, repeated across two turns).
- User reply: *"no, ../resume has the cloudflare token in 1password somewhere ... I don't paste tokens in sessions like this. We use 1password to keep them secure and ../resume reads them from there and updates github."*
- Ground truth: 1Password item "Cloudflare - Resume (hire-tom-as-cto)" exists; the repo has no `op://` because the op-to-GitHub-secret bridge is a manual human step, not committed automation.

## Symptoms

(deferred to investigation)

## Workaround

(deferred to investigation)

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: (deferred to investigation)
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

**Why P032's fix did not generalise to negative/absence claims.** P032's three-lever fix (memory note plus `CLAUDE.md` "Verify before asserting" section) is framed around a single corrective: *READ the actual file from disk before asserting how a hook / skill / gate behaves*. That framing addresses the **positive-claim-from-memory** failure (asserting current state from memory of related tickets or prior prose without reading the source). It does **not** cover the negative/absence failure, because the two fail differently:

- In the P032 class, the truth IS in a file the assistant skipped reading; "read the file" closes the gap.
- In the P103 class, the assistant DID search (a `git grep` of the `resume` repo). The failure is not "didn't read", it is treating **absence within a bounded search** as **proof of absence in reality**. Reading every file in the repo would still find nothing, because the truth is not in any committed artifact: the 1Password to GitHub-secret bridge is a manual human-out-of-band step. "Not in the files I searched" is not "does not exist."

So P032's "read the file" corrective is a no-op against this class: the file reads return empty, and the assistant draws the wrong conclusion from the empty result. The missing rule is that a bounded search which finds nothing is **inconclusive**, not a license to assert "X does not do Y." Negative claims require exhaustive verification OR asking the user *before* asserting, especially where the mechanism could be out-of-band (manual secret bridging, a step performed in another tool, a manual deploy) that no repo grep can reveal.

This iteration is itself an in-session witness of the corrected discipline: the I13 propose-fix predicate returned a NEGATIVE result (`no-rfc-trace: P103`), and rather than acting on that absence, the absence's premise (an RFC tier exists in this repo) was verified. `docs/rfcs/` is absent with zero RFC history, so the predicate's directive was a false positive (see Fix Strategy).

### Investigation Tasks

- [x] Investigate root cause (why P032's CLAUDE.md fix did not generalise to negative/absence claims), documented above
- [x] Create reproduction test: N/A for a behavioural-discipline fix (no automated harness, same as the P032/P045 family, which verify via observed in-session behaviour). The verification trigger is behavioural (see Fix Applied).
- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems (effort confirmed S, doc-only memory/guide edit)

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P032, P045 (same "verify before asserting" family)

## Related

Captured via /wr-itil:capture-problem (run from /wr-retrospective:run-retro Step 4b Stage 1; expand at next investigation).

- **P032** (closed): assistant writes claims about project state without verifying first. This ticket is a recurrence on the negative/absence-claim axis.
- **P045** (verifying): assistant accepts ticket framing without questioning; sibling in the same family.

## Fix Strategy

Memory/guide improvement, mirroring the P032/P045 three-lever pattern (lever 1 only). Extend the existing "Verify before asserting" rule in two places to cover negative/absence claims and out-of-band (human-manual) mechanisms:

1. Repo-root `CLAUDE.md` "Verify before asserting" section: append a third paragraph stating that a bounded search returning nothing is inconclusive (not proof of absence), that the mechanism may be human-out-of-band, and that a negative claim requires exhaustive verification or asking the user before asserting.
2. Memory `feedback_verify_project_state_before_writing.md`: add a negative/absence-claim section with the P103 evidence (the `resume` 1Password Cloudflare-token example) and the out-of-band-mechanism rule.

**I13 propose-fix RFC-trace gate is non-actionable here.** The `wr-itil-check-fix-rfc-trace` predicate emits `no-rfc-trace: P103`, but this consumer repo has not adopted the RFC tier: `docs/rfcs/` does not exist and git carries zero RFC history. Auto-creating RFC-001 would bootstrap an entire governance tier, which is a direction-setting framework-adoption decision, not a mechanical fix-time auto-create. This matches the documented P070 precedent (closed 2026-06-16): "I13 RFC-trace gate noted as non-actionable (RFC tier unadopted in this consumer repo; fix-design trace carried by ADR-032)." The fix here is carried by this ticket plus the established P032/P045 discipline pattern; the fix ships via the SKILL's Phase-1 legacy direct-implementation path. Whether this repo should adopt the RFC tier (or make the I13 predicate adopter-aware) is queued as an outstanding question for the user.

## Fix Applied

Doc-class memory/guide edit, live on commit (no npm/release vehicle, no changeset, same pattern as P070). Shipped in this iteration:

- `CLAUDE.md` "Verify before asserting" section extended with the negative/absence-claim + out-of-band-mechanism paragraph (architect gate PASS, jtbd gate PASS; voice-tone and style-guide gates N/A: internal agent-discipline prose in a `.md`, not user-facing copy or CSS).
- Memory `feedback_verify_project_state_before_writing.md` extended with the negative/absence-claim section and P103 evidence (memory lives outside the repo, not part of this commit).

**Verification trigger (behavioural).** Like P032/P045, there is no automated test. Verified when a future session declines to assert a negative/absence claim from a bounded search that returns nothing, instead verifying exhaustively or asking. This iteration's I13/RFC-tier handling is one in-session witness, but a single freshly-shipped instance is too thin to self-close (confirmation-bias guard); a later `/wr-itil:review-problems` or retro pass can close on accumulated observed evidence.
