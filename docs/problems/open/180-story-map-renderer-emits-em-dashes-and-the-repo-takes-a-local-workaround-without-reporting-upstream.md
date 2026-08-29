# Problem 180: Story-map renderer emits em-dashes and the repo takes a local workaround without reporting upstream

**Status**: Open
**Reported**: 2026-08-30
**Priority**: 6 (Medium), Impact: 2 x Likelihood: 3, derived at capture. Impact is 2 because the workaround is effective and no wrong output reaches a reader: the cost is that a cache-resident upstream defect stays unreported, so every adopter of the renderer with a no-em-dash policy re-discovers and re-solves it. Likelihood is 3 because the defect fires on every render, and the repository now has two maps that will be re-rendered on every substantive edit.
**Origin**: internal
**Effort**: M, derived at capture. Authoring the upstream pull request is small; the surface is another repository, and ADR-048 prefers a PR over an issue, so landing it means a cross-repo change this project cannot merge itself.
**WSJF**: 3.0 = (6 x 1.0) / 2

## Description

`wr-itil-render-story-map` emits U+2014 at two unconditional sites that this repository's `no-em-dash` hooks block, and both return on every render:

- the orientation lead, `"Draft <emdash> not yet agreed."`, hard-coded in `render-story-map.mjs` `renderOrient` with no island override, so no authored input can avoid it;
- 16 occurrences across 13 comment blocks in `templates/story-map.css`, which `ensureSharedAssets` rewrites from the upstream template whenever the vendored copy differs, so hand-scrubbing `docs/story-maps/story-map.css` is reverted by construction.

Two further sites are conditional and do not fire on the current corpus, but an upstream change scoped to the two above would leave them: `rowLabel`'s default return, `Untraced <emdash> needs a problem`, which fires on a row with no RFC identity and no problems; and the fallback caption, which fires whenever the island authors no `caption` key. Both maps here author a caption, which is why that one is dormant.

The repository's response is `scripts/render-story-map.sh`, a wrapper that renders and then strips U+2014 from both the map and the shared stylesheet. That wrapper works, and it is the posture ADR-032 and ADR-044 criterion 12 describe for generated output. What is missing is the other half: ADR-048 holds that a cache-resident upstream defect is reported upstream, with a pull request preferred over an issue. Nothing has been filed.

This is the same shape as P087, which records the identical defect in the decisions-compendium generator. P087 is scoped to that generator and does not cover this renderer; the two share a cause but not a surface.

## Symptoms

- A fresh render reintroduces em-dashes into a file that was clean, in both the map and the shared stylesheet.
- Any re-render path that does not go through `scripts/render-story-map.sh` leaves the em-dashes in place, and the commit is then blocked by the hook rather than by the renderer.
- `wr-itil-story-map-edit` re-renders after every operation and rewrites the vendored CSS, so it is one such path.

## Workaround

Render only through `scripts/render-story-map.sh`, never `wr-itil-render-story-map` directly. Documented in that script's header. It depends on whoever renders knowing the wrapper exists, and the upstream editing tool bypasses it.

## Impact Assessment

- **Who is affected**: the Internal Maintainer persona here, and any adopter of `@windyroad/itil` running a no-em-dash policy.
- **Frequency**: every render.
- **Severity**: no wrong output reaches a reader; the map is a governance artefact. The cost is an unreported upstream defect and a local workaround that other entry points bypass.
- **Analytics**: none.

## Root Cause Analysis

### Investigation Tasks

- [ ] Confirm whether the orientation lead can take an island override upstream, or whether removing the em-dash from the template is the smaller change.
- [ ] Confirm whether `ensureSharedAssets` has a documented opt-out for a vendored stylesheet an adopter has modified.
- [ ] Decide whether the fix is one PR covering both sites or two, given the CSS half is a template edit and the orientation half is renderer logic.

## Fix Strategy

Report upstream against the repository owning `render-story-map.mjs` and `templates/story-map.css`, preferring a pull request per ADR-048. Two candidate changes: replace the two U+2014 sites in the template and the hard-coded orientation lead with punctuation that carries no policy weight, and, separately, consider whether `ensureSharedAssets` should leave a locally-modified vendored stylesheet alone.

Placement is a proposal only. This project does not own that repository and cannot assert the change will be accepted.

Keep `scripts/render-story-map.sh` regardless: it is the only safe entry point until the upstream change ships, and it stays useful afterwards as a guard.
