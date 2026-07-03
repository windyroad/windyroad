# Problem 108: wr-newsletter step 7 hard-codes the wr-wardley owm-to-svg converter at a pinned plugin version, breaking the map render on plugin update

**Status**: Open
**Reported**: 2026-07-03
**Priority**: 3 (Medium) -- Impact: 3 x Likelihood: 1 (deferred -- re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: S (deferred -- re-rate at next /wr-itil:review-problems)

## Description

`.claude/skills/wr-newsletter/SKILL.md` step 7 (re-render the Wardley map) hard-codes the converter path at a pinned plugin version:

```
node ~/.claude/plugins/cache/windyroad/wr-wardley/0.1.0/skills/generate/owm-to-svg.mjs docs/ai-engineering-brief/ai-landscape.owm docs/ai-engineering-brief/ai-landscape.svg
```

During the Issue 11 prep run (2026-06-28) this path did not exist because the cached plugin had updated: `find ~/.claude/plugins/cache/windyroad/wr-wardley -name owm-to-svg.mjs` showed only `0.1.4/` and `0.1.7/` present, not `0.1.0/`. The render failed with `Error: Cannot find module '.../wr-wardley/0.1.0/skills/generate/owm-to-svg.mjs'` (exit 1) and only succeeded after manually substituting `0.1.7` into the path.

The version pin means the map re-render (step 7 and its finalise variant 7-prime) breaks every time the `wr-wardley` plugin updates its cached version, silently, until the next newsletter run hits it. Because step 5's map-mutation gate has already passed by then, the drafter is mid-run when the render fails.

## Symptoms

- `node .../wr-wardley/0.1.0/... ` exits 1 with `Cannot find module` after any `wr-wardley` plugin version bump.
- Observed 2026-06-28 (0.1.0 pinned in SKILL.md; 0.1.4 + 0.1.7 on disk).

## Workaround

`find ~/.claude/plugins/cache/windyroad/wr-wardley -name owm-to-svg.mjs`, then substitute the highest installed version into the step-7 command by hand.

## Impact Assessment

- **Who is affected**: the weekly newsletter run (both prep and finalise map re-render).
- **Frequency**: once per wr-wardley plugin version bump.
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Replace the hard-coded version segment in SKILL.md step 7 + 7-prime with version-agnostic resolution: glob `~/.claude/plugins/cache/windyroad/wr-wardley/*/skills/generate/owm-to-svg.mjs` and pick the highest semver, OR invoke via the `wr-wardley:generate` skill / a `$PATH` shim rather than the cached script path.
- [ ] Check whether any other SKILL step hard-codes a versioned plugin-cache path (same failure class).
- [ ] Create a reproduction (bump the cached version, run step 7, assert graceful resolution).

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

- **Reported upstream**: https://github.com/windyroad/agent-plugins/issues/325 (2026-07-03)

- Fix strategy: skill-improvement to `.claude/skills/wr-newsletter/SKILL.md` step 7 / 7-prime (Kind: improve, Shape: skill). Version-agnostic converter resolution.
- Captured via /wr-itil:capture-problem during the 2026-06-29 Issue 11 retrospective; expand at next investigation.

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/325
- **Reported**: 2026-07-03
- **Template used**: structured default (problem-shaped)
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes
