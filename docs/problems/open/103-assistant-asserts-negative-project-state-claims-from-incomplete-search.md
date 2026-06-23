# Problem 103: Assistant asserts negative project-state claims from an incomplete search without verifying or asking

**Status**: Open
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

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Investigate root cause (why P032's CLAUDE.md fix did not generalise to negative/absence claims)
- [ ] Create reproduction test

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P032, P045 (same "verify before asserting" family)

## Related

Captured via /wr-itil:capture-problem (run from /wr-retrospective:run-retro Step 4b Stage 1; expand at next investigation).

- **P032** (closed): assistant writes claims about project state without verifying first. This ticket is a recurrence on the negative/absence-claim axis.
- **P045** (verifying): assistant accepts ticket framing without questioning; sibling in the same family.
- **Proposed fix strategy**: memory/guide improvement. Extend the existing "Verify before asserting" rule (`CLAUDE.md` plus memory `feedback_verify_project_state_before_writing.md`) to explicitly cover negative/absence claims and out-of-band (human-manual) mechanisms: a bounded search that finds nothing does not license a "does not do X" assertion; verify exhaustively or ask.
