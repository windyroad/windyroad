# Problem 012: No PreToolUse ship-gate blocks push/publish/deploy when risk is above appetite or CI is red

**Status**: Open
**Reported**: 2026-04-18
**Priority**: 12 (High). Impact: Significant (4) x Likelihood: Likely (3)

## Description

The 86-session insights report (2026-03-17 to 2026-04-16, across windyroad, addressr, bbstats, and the wr-* plugin projects) identifies "shipping before the fix is complete" as a top-three friction category. Specific instances include releases attempted with risk-scorer output above appetite, pushes attempted with CI red, and a release (P140) shipped without its promised conditional dependency (P141). User pushback was the only reason these did not reach production.

The project already has a risk-scorer that produces machine-readable scores and bypass markers (ADR 014 governance), and a commit-gate hook that blocks commits when scores are above appetite. Push, publish, and deploy commands are not gated the same way. There is also no automated check that conditional commitments from the user prompt are satisfied before shipping.

## Symptoms

- Claude attempts `git push`, `npm publish`, or deploy despite the risk-scorer output being above appetite; only user intervention prevents a bad release
- Claude attempts to ship work where the user conditioned one change on another being in place, and the condition is not satisfied (P140/P141 pattern)
- No machine-readable checklist run before external actions; voice/tone on external text, CI status, and risk score are each checked ad hoc at best

## Workaround

User-in-the-loop review: Tom inspects every release and push manually before approving. Works for windyroad's current low-volume release cadence. Does not scale and relies on Tom catching failures the hook system should catch.

## Impact Assessment

- **Who is affected**: the site's live behaviour (bad releases reach windyroad.com.au), subscribers of The Shift (bad drafts reach LinkedIn), and Tom (carries the review load alone).
- **Frequency**: every push/publish/deploy action; the opportunity for failure is roughly weekly on windyroad.
- **Severity**: High. A bad newsletter edition or a regression on the live site has reputational cost that is harder to unwind than a pre-push block.

## Root Cause Analysis

### Root Cause

ADR 014's commit-gate hook enforces risk-scorer discipline at commit time, but the gate was never extended to push/publish/deploy. The risk-scorer output is session-scoped and the bypass marker lives on disk, but the pre-push hook (`dry-aged-deps`) is the only cross-check currently enforcing any pre-push discipline, and it only covers dep freshness, not risk scoring or CI status.

Additionally, no hook parses the original user request for conditional commitments ("remove X only when Y works") and verifies the dependency is satisfied before allowing a release.

### Fix Strategy

Build a `ship-gate` PreToolUse hook that triggers on Bash commands matching:
- `git push` (and variants)
- `npm publish`
- `eb deploy` or similar deploy commands
- `gh pr create`, `gh issue comment` (see also problem 013)

The hook invokes a verifier subagent that:
1. Reads the latest risk-scorer output and blocks if any axis is above appetite
2. Checks CI status for the current branch (via `gh` CLI) and blocks if red
3. Verifies the bypass marker is fresh (scoped to the current session and pipeline state)
4. Optionally: reads the original user request from the session and flags any conditional commitments that are not satisfied
5. Emits a clear block reason so the user can choose to override, remediate, or park the work

Integrates with the existing wr-risk-scorer:pipeline agent rather than duplicating logic.

### Investigation Tasks

- [ ] Spike a minimal PreToolUse hook that blocks `git push` when risk-scorer output is above appetite
- [ ] Extend the hook to cover `npm publish` and `gh pr create`
- [ ] Design the conditional-commitment check (parsing user prompts from session state)
- [ ] Draft an ADR if the change is load-bearing; otherwise treat as a hook refactor

## Related

- ADR 014 (governance skills commit their own work; this extends the principle to push/publish/deploy)
- `.claude/hooks/` (existing hook scripts)
- Problem 008 (editorial-sim subagent; this ship-gate is parallel to the editor gate but upstream of it)
- `docs/BRIEFING.md` "Cross-project patterns" (risk-scorer above appetite is a hard stop)
