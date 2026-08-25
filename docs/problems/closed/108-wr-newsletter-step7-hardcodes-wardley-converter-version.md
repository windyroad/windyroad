# Problem 108: wr-newsletter step 7 hard-codes the wr-wardley owm-to-svg converter at a pinned plugin version, breaking the map render on plugin update

**Status**: Closed
**Reported**: 2026-07-03
**Priority**: 6 (Medium) -- Impact: Moderate (3) x Likelihood: Unlikely (2) (re-rated 2026-07-15 review: breaks the mid-run map render on every wr-wardley version bump; occasional but deterministic when it fires)
**Origin**: internal
**Effort**: S (version-agnostic path resolution in SKILL step 7 + 7-prime)
**WSJF**: 12.0 = (6 x 2.0) / 1

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


## Fix Released

Fixed 2026-08-08. Step 7 now resolves the converter at the highest installed `wr-wardley` version instead of a pinned one, per ADR-080 (highest-version-wins shim wrapper):

```bash
owm2svg=$(ls -d ~/.claude/plugins/cache/windyroad/wr-wardley/*/skills/generate/owm-to-svg.mjs 2>/dev/null | sort -V | tail -1)
```

with an explicit not-found branch that surfaces a `/install-updates` directive rather than failing opaquely.

**This was live, not theoretical.** The pinned path was `wr-wardley/0.1.0/`. Installed versions on disk are `0.1.4` and `0.1.7`; `0.1.0` is gone. Step 7 would have failed on the next `/wr-newsletter` run. Found while checking which backlog tickets bear on that run, not by the step failing.

**Smoke-tested before commit.** The resolved `0.1.7` converter was run against the live `docs/ai-engineering-brief/ai-landscape.owm` and its output is **byte-identical** to the committed `ai-landscape.svg`, so the version substitution is behaviour-preserving and no map re-render is owed.

One behavioural note for the next run: `0.1.7` emits a PNG alongside the SVG. Step 7's contract names only the SVG, so the PNG is an unclaimed side-effect output. Harmless, but worth knowing before it appears untracked in the working tree.

**Sibling-path sweep, 2026-08-08.** This ticket asked whether other versioned plugin-cache paths exist elsewhere. A repo-wide `git grep` for `plugins/cache/<vendor>/<plugin>/<semver>` across all tracked files, excluding ticket bodies and retros where such paths appear as evidence rather than as code, returns **zero** matches. The step-7 call site was the only one, and it is now version-agnostic. The only absolute-path `node` invocation remaining in the newsletter skill is the fixed line itself. The investigation task on sibling paths is discharged on that evidence.

**Awaiting Tom's verification**: the next `/wr-newsletter` run completing step 7 with a rendered map.

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

## Verified

Closed 2026-08-25 on evidence from The Shift Issue 19.

The Fix Released section named the test: the next `/wr-newsletter` run completing step 7 with a rendered map. That run happened. The weekly map mutation for the week ending 2026-08-23 committed at `da42358b`, so step 7 resolved a converter and produced a map rather than failing on the missing `0.1.0` path.

The confirming detail is the side-effect this ticket predicted. It recorded that the newer converter emits a PNG alongside the SVG, and that step 7's contract names only the SVG, so the PNG would appear as an unclaimed output. Both `ai-landscape.svg` and `ai-landscape.png` show in that commit. A run against the old pinned path could not have produced either file, and a run against a hand-substituted path would not have produced the PNG. The prediction discriminates.

The sibling-path sweep was already discharged at fix time on a repo-wide grep returning zero matches.
