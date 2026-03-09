---
status: "proposed"
date: 2026-03-09
decision-makers: [Tom Howard, Claude]
consulted: [accessibility-lead agent]
informed: []
---

# Use aside with role="note" for pull quotes

## Context and Problem Statement

Blog articles need pull quotes to break up long sections and highlight key insights for scanning readers. The blog renders markdown via a remark/rehype pipeline with `rehype-raw` (allowing raw HTML in markdown). A convention is needed for authoring and rendering pull quotes accessibly.

## Decision Drivers

- Semantic HTML correctness
- Screen reader accessibility (avoid landmark clutter)
- Author ergonomics (simple markdown syntax)
- No custom remark/rehype parser needed

## Considered Options

1. **`<aside>` with `role="note"`** - Semantic HTML with ARIA override
2. **`<aside>` with `aria-label`** - Labeled landmark
3. **`<blockquote>` with a class** - Repurposed blockquote
4. **Custom remark directive** - New syntax (e.g., `:::pullquote`)

## Decision Outcome

Chosen option: **`<aside>` with `role="note"`**, because it is semantically correct, avoids landmark pollution, and requires no custom parser.

`<aside>` is the HTML spec's recommended element for pull quotes. However, bare `<aside>` creates a complementary landmark. Multiple pull quotes per article would create several unlabeled landmarks, adding noise for screen reader users navigating by landmarks.

Adding `role="note"` overrides the implicit landmark role. Screen readers announce the content as a note (ancillary content) without creating a landmark. This is applied automatically by a rehype plugin (`rehypeAsideRole`) so authors don't need to remember the attribute.

## Consequences

- **Good**: Authors write `<aside>Text</aside>` in markdown with no extra attributes
- **Good**: `role="note"` prevents landmark clutter for screen reader users
- **Good**: No `aria-hidden` on pull quotes (content parity maintained)
- **Good**: rehype plugin enforces the role automatically
- **Neutral**: Pull quotes that repeat article text are read twice by screen readers (acceptable; users can skip)
- **Bad**: Authors could misuse `<aside>` for non-pull-quote content

## Confirmation

- Build output contains `<aside role="note">` for all aside elements
- No complementary landmarks from pull quotes in accessibility tree
- Pull quote text is visible to screen readers (not hidden)

## Pros and Cons of the Options

### `<aside>` with `role="note"`

- Good: Semantically correct per HTML spec
- Good: No landmark clutter
- Good: Automatic via rehype plugin
- Good: Simple author syntax
- Neutral: Overrides native landmark role

### `<aside>` with `aria-label`

- Good: Semantically correct
- Bad: Creates labeled landmarks (still clutters landmark navigation)
- Bad: "Pull quote, complementary" announcement is verbose

### `<blockquote>` with a class

- Good: Simple syntax
- Bad: Semantically incorrect (pull quotes are not quotations from external sources)
- Bad: CSS modules hash class names, requiring `:global()` workaround

### Custom remark directive

- Good: Clean syntax in markdown
- Bad: Requires remark-directive plugin and custom handler
- Bad: Non-standard markdown syntax

## Reassessment Criteria

- If more than two `<aside>` uses emerge (non-pull-quote), consider scoping the plugin
- If screen reader testing reveals issues with `role="note"` announcements
