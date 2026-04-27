# Problem 012: No CI-status check on push/release; conditional-commitment verification missing

**Status**: Known Error
**Reported**: 2026-04-18
**Transitioned to Known Error**: 2026-04-25 (review pass: root cause confirmed; workaround = manual Tom-in-the-loop review)
**Rescoped 2026-04-27**: Verified existing gate coverage by direct read of `git-push-gate.sh`. Push and release ARE gated on risk score; publish + deploy are CI-only for this project. Fix scope narrowed to CI-status check on push/release; conditional-commitment verification is a separate problem class and is being split out (see Update section below).
**Priority**: 12 (Significant). Impact: Significant (4) x Likelihood: Possible (3)
**Effort**: S (extend existing `git-push-gate.sh` with one `gh run list` check; conditional-commitment piece split out)
**WSJF**: (12 x 2.0) / 1 = 24.0
**Re-rated 2026-04-27**: Effort dropped L to S after rescope; Known Error multiplier 2.0 (ADR-022). WSJF rises 6.0 to 24.0.
**Re-rated 2026-04-25**: Likelihood label corrected from Likely (3) to Possible (3). 3 in the likelihood ladder is Possible; Likely is 4. Score 12 unchanged.

## Description

The 86-session insights report (2026-03-17 to 2026-04-16, across windyroad, addressr, bbstats, and the wr-* plugin projects) identified "shipping before the fix is complete" as a top-three friction category. Specific instances cited included releases attempted with risk-scorer output above appetite, pushes attempted with CI red, and a release (P140) shipped without its promised conditional dependency (P141).

Subsequent direct read of `~/.claude/plugins/cache/windyroad/wr-risk-scorer/0.4.1/hooks/git-push-gate.sh` (during the 2026-04-27 design walk-through) confirms that **push and release ARE gated on the risk-scorer**. The original ticket framing was wrong on two of three claimed gaps; the only real gaps are the CI-status check and the conditional-commitment verification.

### Existing gate coverage (verified 2026-04-27)

| Command | Gate behaviour |
|---|---|
| `git push` (bare or to master/main/publish/changeset-release/*) | BLOCKED, redirected to `npm run push:watch` |
| `npm run push:watch` | GATED on push-risk score (with `reducing-push` and `clean` bypass markers) |
| `changeset version` | BLOCKED locally (release pipeline owns versioning) |
| `npx changeset` / `npm run changeset` | GATED on release-risk score |
| `npm run release:watch` | GATED on release-risk score (with `incident-release` and `reducing-release` bypass markers) |
| `gh pr merge` | BLOCKED, redirected to `npm run release:watch` |

The user clarified that for this project **publish and deploy don't run from local; only CI does that**. Local hooks for `npm publish` and `eb deploy` are therefore not relevant for windyroad and are out of scope for this ticket.

### Real gaps (the rescoped fix surface)

1. **No CI-status check**: the push/release gates score *risk* but never directly check whether the latest CI run is red. A push that scores low risk can still proceed onto a broken master.
2. **No conditional-commitment verification**: no hook parses session state for unfulfilled commitments ("remove X only when Y is in place") before allowing release. P140 shipped without P141 was the canonical instance. This is now being split out: different problem class, XL open research, should not block the simpler CI-status fix.

## Symptoms

- Push or release can proceed when CI on master is red, because the existing gate only checks risk score, not CI status.
- Conditional-commitment failure: Claude attempts to ship work where the user conditioned one change on another being in place, and the condition is not satisfied (P140/P141 pattern).
- ~~Claude attempts `git push` / `npm publish` / deploy despite the risk-scorer output being above appetite~~ (REMOVED 2026-04-27: this is gated. The original framing was wrong; verified by direct read of `git-push-gate.sh`.)

## Workaround

User-in-the-loop review: Tom inspects every release and push manually before approving. Works for windyroad's current low-volume release cadence. Does not scale and relies on Tom catching CI redness the hook system does not currently surface.

## Impact Assessment

- **Who is affected**: the site's live behaviour (a regression on master can ship if CI hasn't reported back), Tom (carries the CI-status review load alone).
- **Frequency**: every push/release; the opportunity for failure is roughly weekly on windyroad.
- **Severity**: Significant. A push onto a CI-red master compounds the existing failure with a fresh layer.

## Root Cause Analysis

### Root Cause

`git-push-gate.sh` integrates the wr-risk-scorer pipeline correctly but never queries CI directly. The risk-scorer output is a leading indicator (it predicts risk based on diff shape and pipeline state) and the bypass markers are session-scoped, but neither captures the lagging signal of "did the last actual CI run pass?" A clean diff with low predicted risk can still be pushed onto a broken master if the gate has no `gh run list` check.

Separately, no hook parses the original user request from session state for conditional commitments. This is now being split out as a separate ticket.

### Fix Strategy (rescoped 2026-04-27)

**Narrow scope: CI-status check only.** Extend `~/.claude/plugins/cache/windyroad/wr-risk-scorer/0.4.x/hooks/git-push-gate.sh` to call `gh run list --branch master --limit 1 --json conclusion,status` (or equivalent for the current branch) and block on `conclusion: failure`. Bypass marker shape mirrors the existing `reducing-push` / `incident-release` pattern: `red-ci-acknowledged` (single-shot, deleted on use).

Implementation notes:
- Apply the check inside the same `if echo "$COMMAND" | grep -qE 'npm run push:watch'` block, after the risk-score gate.
- For `npm run release:watch`, also block on the most recent run on master being `conclusion: failure`.
- Hook integrates with the existing wr-risk-scorer:pipeline agent for re-scoring + bypass-marker creation rather than duplicating logic.

**Out of scope (split out as a separate ticket):**

- Conditional-commitment verification: parsing session state for unfulfilled commitments before allowing release. Different problem class: XL open research (session-state parsing, prompt history surface area). Should not block the simpler CI-status fix from shipping.

### Investigation Tasks

- [ ] Spike a minimal extension to `git-push-gate.sh` that calls `gh run list --branch <branch> --limit 1 --json conclusion,status` and blocks on `conclusion: failure`.
- [ ] Decide bypass-marker name (`red-ci-acknowledged` proposed) and lifecycle (single-shot? session-scoped?).
- [ ] Apply to both `npm run push:watch` and `npm run release:watch`.
- [ ] Open a sibling ticket for conditional-commitment verification (XL open research; different problem class).

## Update 2026-04-27

Verified existing gate coverage via direct read of `~/.claude/plugins/cache/windyroad/wr-risk-scorer/0.4.1/hooks/git-push-gate.sh` during a P012 design walk-through. Push and release ARE gated on risk score (table above). publish and deploy are CI-only for this project, so local hooks for `npm publish` and `eb deploy` are not relevant.

Fix scope narrowed to **CI-status check on push/release**. The conditional-commitment verification piece is recommended as a separate ticket because it is XL open research (parsing session state for unfulfilled prompt-level conditions) and should not block the simpler CI-status fix from shipping.

Effort drops L to S (CI-status piece only); WSJF rises 6.0 to 24.0 with Known Error multiplier 2.0.

Reference: 2026-04-27 retro session.

## Related

- ADR 014 (governance skills commit their own work; this extends the principle to push/release CI gating)
- `~/.claude/plugins/cache/windyroad/wr-risk-scorer/0.4.x/hooks/git-push-gate.sh` (the hook to extend)
- Problem 008 (editorial-sim subagent; this CI-status gate is parallel to the editor gate but upstream of it)
- Problem 013 (voice/tone gate on external comms; pairs with this ticket's CLI-level surface)
- `docs/BRIEFING.md` "Cross-project patterns" (risk-scorer above appetite is a hard stop, confirmed implemented)
- **Upstream report pending** — external dependency identified; invoke /wr-itil:report-upstream when ready
