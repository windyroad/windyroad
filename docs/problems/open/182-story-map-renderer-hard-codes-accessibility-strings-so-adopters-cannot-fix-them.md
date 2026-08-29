# Problem 182: Story-map renderer hard-codes accessibility strings so adopters cannot fix them

**Status**: Open
**Reported**: 2026-08-30
**Priority**: 6 (Medium), Impact: 2 x Likelihood: 3, derived at capture. Impact is 2 because no finding is a WCAG A or AA failure in the maps as rendered today: the accessibility review returned no critical and no major defect, and stated that nothing found blocks ratification. The cost is that several genuine improvements, and one latent Level A hazard, sit behind a renderer an adopter cannot edit. Likelihood is 3 because every map this repository or any adopter renders carries the same strings.
**Origin**: internal
**Effort**: M, derived at capture. Each change is small in isolation; all of them are in another repository, and ADR-048 prefers a pull request over an issue.
**WSJF**: 3.0 = (6 x 1.0) / 2

## Description

A full accessibility review of the two draft story maps on 2026-08-30 found no critical and no major WCAG defect, and no Level A or AA failure in the rendered output. It did find that almost every accessibility string in a rendered map is a literal in `render-story-map.mjs` with no JSON-island override, so an adopter cannot correct any of them locally. Confirmed by reading the renderer at `wr-itil/2.1.0/scripts/render-story-map.mjs`.

The findings worth reporting upstream:

1. **`aria-label="Story map grid"` on the scroll region** names a `<table>` as a `grid`. In ARIA, `grid` is a composite widget with arrow-key cell navigation the document does not implement, so the name advertises an interaction model that is not there. It is also identical across every map, so landmark navigation cannot tell two maps apart. The renderer already emits `id="story-map-title"` on the `<h1>` and references it from nothing; `aria-labelledby="story-map-title"` fixes both halves at no cost.
2. **Element ids are not namespaced by map.** `story-map-title`, `story-map`, `story-map-traces`, `story-map-data` and `story-map-status` are byte-identical across maps. Unique within one document today, so no present defect, but any combined or index view collides on all five, and it would make the `aria-labelledby` fix above resolve to the wrong heading. Worth landing with finding 1, not after it.
3. **Empty-cell hidden text restates both associated headers.** The template is `No stories for <activity title> in <release name>.`, and `scope="col"` / `scope="row"` already deliver both. Entering one empty cell announces roughly 58 words to convey that the cell is empty. The renderer already reaches the right answer on the adjacent path, emitting the terse `No stories in this release band.` for a wholly empty band.
4. **Release state never reaches the accessibility tree.** The badge renders `<span class="badge b-next"><span class="b-glyph" aria-hidden="true">arrow</span>RFC-005</span>`. The glyph is correctly `aria-hidden` (it is a second visual channel for colour), but the badge's only accessible text is the RFC identifier, not the state. State reaches a screen reader solely because the authored release name happens to begin with a status word. The machine-readable state is already in the `story-map-status` island and is simply not rendered. This is a latent SC 1.4.1 failure that a one-word edit to an authored field would trigger silently.
5. **`.s-note` is removed at 640px and below** by `display: none` in the vendored stylesheet, which drops it from the accessibility tree as well as the screen. 400% zoom on a 1280px viewport reaches that width, so the release's stated driver is absent under SC 1.4.10 Reflow with no alternative anywhere in the rendered page.
6. **`forced-color-adjust: none` on `.badge` restates only `border`,** leaving `color` and `background` at author values under a user contrast theme. The stylesheet's own comment at the glyph rationale argues the opposite behaviour, so premise and code disagree.
7. **The forced-colors hatch uses `GrayText`,** the one system keyword reserved for disabled affordances and carrying no contrast guarantee, where `CanvasText` is guaranteed.

Contrast was measured across all token pairs in both themes and passes throughout: the lowest text ratio is 6.79:1 against a 4.5:1 floor, and the focus ring clears 2.4.13 AAA. Every ratio asserted in the stylesheet's own comments was recomputed and is arithmetically correct. None of that needs reporting.

## Symptoms

- An adopter running an accessibility audit finds defects and has no local surface on which to fix any of them.
- Hand-editing the rendered HTML is reverted on the next render; hand-editing the vendored CSS is reverted by `ensureSharedAssets`, which rewrites it from the upstream template whenever it differs.

## Workaround

Three levers exist in the authored JSON island. Two are honoured on both maps: a status word first in `releases[].name` so state stays in text (finding 4), and a plain-language description after the identifier in `tasks[].ref` so the link has same-cell context. The third, keeping `backbone[].note` short because it is part of the column header's accessible name and is replayed on every cell traverse, is NOT honoured: the notes were shortened during review but the longest still run 38 words (STORY-MAP-002 `readback`), 34 (STORY-MAP-001 `fix`) and 26 (STORY-MAP-001 `external`), counted from the islands. Two of those three carry job substance a reviewer asked for explicitly, so shortening them further is a real trade rather than a tidy-up. All three levers are conventions a person has to know, and nothing enforces them.

## Impact Assessment

- **Who is affected**: the Internal Maintainer persona here; any adopter of `@windyroad/itil` rendering story maps, and their screen-reader users.
- **Frequency**: every rendered map.
- **Severity**: no WCAG A or AA failure today. Finding 4 is a latent Level A failure one authored word away, and finding 5 is a Reflow defect at 400% zoom.
- **Analytics**: none.

## Root Cause Analysis

### Investigation Tasks

- [ ] Confirm whether the renderer should expose an override for the region label, or simply switch to `aria-labelledby`.
- [ ] Decide whether findings 5, 6 and 7 are one CSS-template pull request or belong with the renderer changes.
- [ ] Check whether the `.b-live` and `.b-defect` badge variants emit distinct glyphs; only `.b-next` is exercised by the current corpus, so the colour-alone guarantee is untested on the other two.

## Fix Strategy

Report upstream against the repository owning `render-story-map.mjs` and `templates/story-map.css`, preferring a pull request per ADR-048. Findings 1 and 2 land together. Findings 5, 6 and 7 are stylesheet changes and can go as one.

Placement is a proposal only. This project does not own that repository and cannot assert the changes will be accepted. Sibling report on the same component: P180.
