---
name: wr-newsletter-cover
description: Generate the weekly newsletter cover image (SVG + PNG) from a parameterised template plus per-edition inputs. Invoked from `/wr-newsletter` step 12 (and step 12-prime in finalise) to produce a consistent, brand-faithful cover without hand-composing the SVG each week. Outputs `<draft-folder>/<publication-date>.cover.svg` + `.cover.png` plus an alt-text string (100-160 chars).
allowed-tools: Read, Write, Bash, Glob, Grep
---

# Weekly newsletter cover generator

Render the weekly cover image from `assets/cover-template.svg` plus per-edition inputs. The template bakes in the canonical brand mark (6-speed + reverse shift-gate), WR monogram, accent stripe, font stack, layout, and palette so they cannot drift edition-to-edition. The skill substitutes only the dynamic text fields: wordmark, subtitle, two-line hook, week-ending date, and the accessible `<title>` / `<desc>` strings.

This skill closes P044 by extracting `/wr-newsletter` step 12's hand-composition prose into a deterministic template-plus-script flow. The render engine is `scripts/render-cover.mjs`, which substitutes the placeholders and shells out to `scripts/render-svg.mjs` (sips) for SVG-to-PNG conversion. This reuses the sips conventions documented under P037 (Avenir Next 500 for hooks, Futura 300 for the wordmark with HelveticaNeue Light fallback). A Playwright-based render path was considered (ticket fix strategy) but deferred per the architect review: no ADR binds the render pipeline, and the sips workarounds in step 12.c are now the canonical convention. Switching engines would warrant its own ADR and is out of M-effort scope for P044.

## Reference

- Ticket: `docs/problems/044-newsletter-cover-image-needs-templated-skill-with-render-pipeline.*.md`
- Related: P037 (cover-image iteration cycle too long), P011 (render-and-verify discipline)
- ADRs: `011-ai-brief-orchestration-via-claude-code.proposed.md` (project-local skill placement), `017-ai-brief-prep-and-finalise-phases.proposed.md` (12-prime idempotent re-render), `026-reviews-and-meta-content-to-sibling-files.proposed.md` (`<publication-date>.cover.*` naming)
- Canonical brand assets: `src/newsletters/assets/the-shift-logo.svg`, `src/newsletters/assets/the-shift-logo.png`
- Render helper: `scripts/render-svg.mjs`
- This skill's render script: `scripts/render-cover.mjs`
- This skill's template: `.claude/skills/wr-newsletter-cover/assets/cover-template.svg`

## Inputs

The caller (typically `/wr-newsletter` step 12) supplies:

| Input | Type | Example | Purpose |
|---|---|---|---|
| `persona` | `leader` or `developer` | `leader` | Selects publication wordmark and subtitle prefix. |
| `edition_number` | int, padded to 2 digits | `04` | Used in the subtitle ("ISSUE 04") and the `<title>` / `<desc>` strings. |
| `publication_date` | `YYYY-MM-DD` (the publish-day date per ADR-026, P040, ADR 030) | `2026-05-25` | Output filename anchor only. |
| `week_ending` | `YYYY-MM-DD` (the Sunday ending the editorial week per ADR 030; publish-day date minus one day for a Monday publish) | `2026-05-24` | The "WEEK ENDING ..." stamp and the date inside the `<title>` / `<desc>` strings. Distinct from `publication_date` because the week does not end on the publish Monday. |
| `hook_line_1` | string, around 28 chars max | `Six AI shifts this week.` | White hook line, rendered at 80px. LinkedIn preview crops slightly on the right edge, so 30+ chars risks shaving the final character (P-issue observed 2026-05-14 with "AI cyber capabilities shipped."). Stay at or below 28 chars to keep the trailing punctuation in the preview. |
| `hook_line_2` | string, around 45 chars max | `All of them measurement problems.` | Accent-orange hook line, rendered at 60px. Smaller font has more horizontal headroom; 28-char hooks here have not clipped to date. |
| `draft_folder` | path | `src/newsletters/drafts/leader/` | Output directory; outputs land at `<draft-folder>/<publication-date>.cover.{svg,png}`. |

Hook lines should fit on one rendered line each. Re-render and visually inspect (step 4 below) if either line wraps or overlaps. Always preview against LinkedIn's share-card crop before publish; the safe-area lives ~2 character-widths inside each margin.

## Persona defaults

These are the only per-persona variations:

| Field | leader | developer |
|---|---|---|
| `WORDMARK` | `The Shift` | `Tokens Spent` |
| `SUBTITLE` | `AI ENGINEERING, WEEKLY  ·  ISSUE 0X` | `AI ENGINEERING FOR DEVELOPERS, WEEKLY  ·  ISSUE 0X` |

Substitute the edition number into the subtitle (two-space ` · ` separator, leading zero for single-digit editions).

## Outputs

- `<draft-folder>/<publication-date>.cover.svg` (canonical SVG, substituted)
- `<draft-folder>/<publication-date>.cover.png` (1200px longest edge, sips-rendered)
- Alt text string (100-160 chars). The caller writes this into the LinkedIn post and the brief frontmatter; this skill returns it as text in the Tom-summary.

## Steps

### 1. Preflight: brand assets exist (fail-fast)

```bash
ls src/newsletters/assets/the-shift-logo.svg src/newsletters/assets/the-shift-logo.png
```

If either is missing, halt and surface the missing path in the Tom-summary. Do not proceed with rendering: the template assumes the canonical brand mark exists in the asset folder so the website and the cover stay visually identical.

### 2. Compose the accessible title and description

The `<title>` and `<desc>` are the screen-reader narration of the cover image (alt-text equivalent inside the SVG itself). They are also what the alt-text string returned to the caller paraphrases.

| Field | Pattern | Example |
|---|---|---|
| `TITLE_TEXT` | `<publication-name> Issue <NN>, week ending <week_ending>` | `The Shift Issue 06, week ending 2026-05-24` |
| `DESC_TEXT` | One sentence describing the cover composition, ending with the headline | `Cover for The Shift Issue 04. Dark background with the orange shift-gate brand mark, "The Shift" wordmark, "AI ENGINEERING, WEEKLY · ISSUE 04" subtitle, and the headline "<hook_line_1> <hook_line_2>".` |

The full `DESC_TEXT` paraphrase is fine; do not pad past 200 chars. The returned alt-text (step 5) is a 100-160 char compression of the same content.

### 3. Invoke the render script

```bash
node scripts/render-cover.mjs \
  --template .claude/skills/wr-newsletter-cover/assets/cover-template.svg \
  --out-svg "<draft-folder>/<publication-date>.cover.svg" \
  --out-png "<draft-folder>/<publication-date>.cover.png" \
  --wordmark "<persona wordmark>" \
  --subtitle "<persona subtitle with ISSUE 0N substituted>" \
  --hook-1 "<hook_line_1>" \
  --hook-2 "<hook_line_2>" \
  --week-ending "<week_ending>" \
  --title "<TITLE_TEXT>" \
  --desc "<DESC_TEXT>"
```

The script substitutes the placeholders, writes the SVG, then shells out to `scripts/render-svg.mjs` for the PNG (longest edge 1200px). XML special characters in the supplied strings are escaped automatically; do not pre-escape them.

If the script exits non-zero, halt step 12 and surface the error in the Tom-summary. Do not retry with a different render path silently. Diagnose the failure first.

### 4. Render-and-verify (P011)

```
Read <draft-folder>/<publication-date>.cover.png
```

The harness displays the PNG inline. Visually compare against:

1. The prior edition's cover (highest-dated `src/newsletters/published/<persona>/*.cover.png`). Layout, hook scale, monogram scale, accent stripe geometry should match.
2. The canonical brand SVG (`src/newsletters/assets/the-shift-logo.svg`). Palette, font conventions, brand mark identical.
3. The supplied hook lines. Both fit on one rendered line each, no overlap with the rules above or below.

If anything is off (hook wraps, weights look compressed, monogram clashes, week-ending stamp clipped), the most likely cause is a sips font substitution. Step 12.c of `/wr-newsletter` documents the two traps (HelveticaNeue at weight 700 or higher resolves to Condensed Bold; Futura 300 falls through to HelveticaNeue Light). If the rendered weights look wrong, author a multi-row diagnostic SVG and render it before changing the template. The template's existing font choices (`Avenir Next` 500 for hooks, `Futura Lt BT` 300 for the wordmark) are the documented working set; do not change them edition-to-edition without rendering the diagnostic.

### 5. Return the alt text and output paths

Compose a 100-160 character alt-text string that names the publication, edition, and headline. Pattern:

```
The Shift Issue <NN> cover: <hook_line_1> <hook_line_2>
```

Return to the caller:

- `cover_svg_path`: absolute path to the rendered SVG
- `cover_png_path`: absolute path to the rendered PNG
- `alt_text`: the 100-160 char string

The caller writes `alt_text` into the brief frontmatter (`cover-image:` block) and the LinkedIn post.

## Idempotency

The script is deterministic: same inputs produce byte-identical output. `/wr-newsletter` step 12-prime (phase=finalise) can therefore compare the prep-time inputs against the finalise-time inputs and skip re-rendering when the headline and theme are unchanged. The output filenames are date-anchored to `<publication-date>` (the publish-day date) so the prep and finalise phases write to the same path.

## When to extend the template

Do not add a new placeholder casually. Each placeholder is part of the edition-to-edition diff surface; adding one weakens the consistency guarantee. Cases that warrant extension:

- A new persona is added (e.g., a third publication beyond `leader` and `developer`) and the subtitle pattern needs persona-specific layout, not just text substitution.
- A documented ADR amends the brand mark, accent stripe geometry, or font stack.
- A reader-feedback gate (voice review, editor review, or a future legibility check) flags a structural issue that the documented sips workarounds cannot solve, justifying the Playwright render path. At that point, file a new ADR per the architect review of P044.

For per-edition variation that does not justify template change (different hook framing, different headline length, different theme), adjust the supplied hook lines and re-render. The template is not the place to encode editorial variety.
