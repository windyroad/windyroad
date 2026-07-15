# Problem 112: accessibility-lead review passes markup but misses colour-contrast, caught only by the CI axe gate

**Status**: Known Error
**Reported**: 2026-07-12
**Priority**: 6 (Medium) Impact: 3 x Likelihood: 2 (derived at capture: a slipped contrast failure is caught by CI before visitors, so visitor-impact likelihood is low; the recurring cost is a failed-deploy + re-push cycle, and CI is the sole net so defence-in-depth is thin)
**Origin**: internal
**Effort**: M (derived at capture: local option is a pre-push design-system contrast check on Button-variant-vs-section-background; the deeper fix is an upstream accessibility-agents agent change)
**WSJF**: 6.0 = (6 x 2.0) / 2

## Description

The `accessibility-lead` subagent reviews markup correctness (aria-hidden, roles, heading order, alt text, list semantics) but does NOT compute actual colour contrast against the built CSS. As a result a `Button variant="ghost"` (white text `#FFFFFF`) placed in a `.light` section rendered at 1.09:1, passed accessibility-lead review, and was caught only by the CI axe accessibility gate, which failed the deploy pipeline (red CI, blocked production promotion). The pipeline risk-scorer independently flagged ghost-variant-on-light-section as a standing recurring trap.

Fix options:

- (a) Local: add a pre-push design-system contrast check that validates each Button `variant` against its section background (a white-text variant like `ghost` must not appear inside a `.light` section), so the failure is caught before push rather than by remote CI.
- (b) Upstream: `accessibility-lead` (in the `accessibility-agents` plugin) should compute contrast for variant-plus-section-background combinations before returning PASS, so its review matches what the CI axe gate enforces.

## Symptoms

(deferred to investigation)

## Workaround

Match Button variant to section background by hand: use `variant="outline"` (accent `#B8390F` = 5.31:1) or `primary` on `.light` sections; reserve `ghost` for dark sections. Rely on the CI axe gate as the catch, and use the `red-ci-acknowledged` marker to push the fix on top of the red run.

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: (deferred to investigation)
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Decide between local pre-push contrast check (option a) vs upstream accessibility-lead change (option b)
- [ ] Create reproduction test (ghost variant in a .light section fails contrast)

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

Evidence: 2026-07-12 The Shift hub push, GitHub Actions run 29190221304, axe selector `#writing > div > a` = 1.09:1 vs 4.5:1 required; fixed by ghost to outline (5.31:1) in commit 00d7720. Captured via /wr-itil:capture-problem during the site-repurpose retro. Fix placement likely upstream in the accessibility-agents plugin (option b) or a local script (option a).

## Fix Strategy

- **Kind**: create
- **Shape**: script (local option a) or agent-improvement (upstream option b)
- **Suggested name / target**: local `scripts/check-button-contrast.mjs` pre-push check, OR upstream `accessibility-lead` agent contrast computation.
- **Observed flaw**: markup-only review passes a variant-on-section contrast failure that CI axe catches.
- **Evidence**: run 29190221304 axe failure at 1.09:1; risk-scorer standing-trap hint; fixed in commit 00d7720.
