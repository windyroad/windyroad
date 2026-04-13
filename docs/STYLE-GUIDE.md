# Style Guide

Last reviewed: 2026-04-11

This guide documents the visual design system for windyroad.com.au. The `wr-style-guide:agent` reads this file to review CSS and UI component changes.

---

## CSS Architecture

**Approach:** SCSS modules with CSS custom properties (design tokens).

- Global tokens defined in `/src/styles/globals.scss` as `:root` custom properties
- Each component in `/src/components-next/` has a co-located `.module.scss` file
- Pages use `page.module.scss` in their route directory
- Typography: Inter (Google Fonts), loaded via Next.js font system, weights 400/500/600/700/800, variable `--font-inter`
- No utility-first framework (no Tailwind). All styles are hand-authored SCSS modules.

---

## Design Tokens

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-ink` | #1A1A1A | Primary text on light backgrounds |
| `--color-bg-dark` | #1A1A1A | Dark section background |
| `--color-surface` | #F5F5F5 | Light surface |
| `--color-bg-light` | #F5F5F5 | Light section background |
| `--color-accent` | #B8390F | Primary brand/action color |
| `--color-accent-text` | #9E310D | Accent for text on light backgrounds (darker for contrast) |
| `--color-accent-hover` | #D4441A | Accent hover state |
| `--color-accent-on-dark` | #E8644A | Accent for text/elements on dark backgrounds |
| `--color-text-dark` | #1A1A1A | Text on light backgrounds |
| `--color-text-light` | #F5F5F5 | Text on dark backgrounds |
| `--color-body` | #444444 | Default body text |
| `--color-text-muted` | #6B6B6B | Muted text on light backgrounds |
| `--color-text-muted-on-dark` | #AAAAAA | Muted text on dark backgrounds |
| `--color-white` | #FFFFFF | Pure white |
| `--color-border` | rgba(255, 255, 255, 0.12) | Subtle border on dark backgrounds |
| `--color-border-light` | rgba(0, 0, 0, 0.1) | Subtle border on light backgrounds |

### Spacing

| Token | Value | Responsive |
|-------|-------|------------|
| `--section-padding` | 6rem 1.5rem | 4rem 1.25rem at 768px, 3rem 1rem at 480px |
| `--header-height` | 4rem | -- |
| `--content-max-width` | 800px | -- |

### Transitions

| Token | Value | Usage |
|-------|-------|-------|
| `--transition-fast` | 150ms ease | Button hover, small state changes |
| `--transition-base` | 250ms ease | General transitions, color changes |

---

## Dark / Light Section Rules

The site alternates between dark and light sections. Each context requires specific token usage.

### Dark sections (`--color-bg-dark: #1A1A1A`)
- Text: `--color-text-light`
- Muted text: `--color-text-muted-on-dark`
- Accent text: `--color-accent-on-dark`
- Borders: `--color-border`
- Card backgrounds: `rgba(255, 255, 255, 0.03)` or `rgba(255, 255, 255, 0.04)`

### Light sections (`--color-bg-light: #F5F5F5`)
- Text: `--color-text-dark`
- Muted text: `--color-text-muted`
- Accent text: `--color-accent-text` (overridden to #9E310D for contrast)
- Borders: `--color-border-light`
- Card backgrounds: `--color-white`

**Rule:** Always use the context-appropriate token. Never use `--color-text-light` on a light background or `--color-text-dark` on a dark background.

---

## Typography

### Scale

| Context | Size (desktop) | Size (768px) | Size (480px) | Weight | Line height |
|---------|---------------|-------------|-------------|--------|-------------|
| Hero headline | 3.5rem | 2.5rem | -- | 700 | 1.1 |
| H1 | 3rem | 2.25rem | 1.875rem | 700 | 1.2 |
| H2 / Section title | 2rem | 1.625rem | 1.375rem | 700 | 1.2 |
| H3 | 1.25rem | -- | -- | 700 | 1.2 |
| Body | 1rem | -- | -- | 400 | 1.7 |
| Narrative / quotes | 1.0625rem | -- | -- | 400 | 1.8 |
| Body small | 0.9375rem | -- | -- | 400 | 1.7 |
| Labels | 0.75rem-0.875rem | -- | -- | 600 | -- |

### Rules

- Use `letter-spacing: -0.02em` on large display text (hero headlines)
- Use `letter-spacing: 0.1em` to `0.15em` on uppercase labels
- Use `text-transform: uppercase` only on small labels (section labels, tags)
- Use `font-variant-numeric: tabular-nums` on numbers that change (counters, stats)

---

## Responsive Breakpoints

| Name | Query | Usage |
|------|-------|-------|
| Desktop | Base styles (no query) | Default, desktop-first |
| Tablet | `@media (max-width: 768px)` | Grid collapse, type scaling |
| Mobile | `@media (max-width: 480px)` | Single column, compact spacing |

### Responsive patterns

- Multi-column grids collapse to single column at 768px
- Typography scales down at each breakpoint
- Section padding reduces proportionally
- Stats grid: 3 columns -> 1 column at 480px
- Pricing/fit check: 2 columns -> 1 column at 768px

---

## Component Patterns

### Sections

Every page section follows this structure:
```scss
.section {
  padding: var(--section-padding);
}
.inner {
  max-width: var(--content-max-width);
  margin: 0 auto;
}
```
Apply `.dark` or `.light` to set the color context.

### Buttons

Four variants, two sizes. See `/src/components-next/Button/Button.module.scss`.

| Variant | Background | Text | Border | Use case |
|---------|-----------|------|--------|----------|
| Primary | `--color-accent` | white | none | Main CTAs |
| Outline | transparent | `--color-accent` | 2px accent inset shadow | Secondary actions on light |
| Ghost | transparent | white | 2px white inset shadow | Secondary actions on dark |
| Inverted | white | `--color-bg-dark` | none | CTAs on dark backgrounds |

Sizes: default (0.75rem 2rem padding) and large (1rem 2.5rem padding).

### Cards

- Border radius: 12px
- Border: 1px solid context-appropriate border token
- Padding: 1.5rem to 2rem
- Background: context-appropriate (see dark/light rules above)

### Lists

- No bullet points (`list-style: none`)
- Flex column layout with consistent gaps (0.75rem to 1.25rem)
- Arrow or check icon indicators using flex gap pattern
- Icons marked `aria-hidden="true"`

---

## Focus and Interactive States

### Focus visible

All interactive elements must have a visible focus indicator:
```scss
&:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

On dark backgrounds, ghost/inverted buttons override to white outlines.

### Hover

- Buttons: `transform: translateY(-1px)` on hover, `translateY(0)` on active
- Links: color transition using `--transition-fast`
- Cards: subtle border color change

---

## Animation and Motion

### Transition tokens

Use `--transition-fast` (150ms) for small state changes (hover, active). Use `--transition-base` (250ms) for larger transitions (color changes, layout shifts).

### Reduced motion

All animation must respect `prefers-reduced-motion: reduce`:
```scss
@media (prefers-reduced-motion: reduce) {
  // Skip animation, show final state immediately
  // Do not just shorten duration -- skip entirely
}
```

The Hero component and CountUp component already implement this. New animated components must follow the same pattern: check `matchMedia('(prefers-reduced-motion: reduce)')` and skip `setInterval`/`requestAnimationFrame` entirely when active.

---

## Contrast Requirements (WCAG AA)

### Minimum ratios

- Normal text (< 18pt / < 14pt bold): 4.5:1
- Large text (>= 18pt / >= 14pt bold): 3:1
- UI components and graphical objects: 3:1

### Validated token pairs

| Background | Text token | Ratio | Status |
|-----------|-----------|-------|--------|
| `--color-bg-dark` (#1A1A1A) | `--color-text-light` (#F5F5F5) | ~15:1 | Pass |
| `--color-bg-dark` (#1A1A1A) | `--color-text-muted-on-dark` (#AAAAAA) | ~8.5:1 | Pass |
| `--color-bg-dark` (#1A1A1A) | `--color-accent-on-dark` (#E8644A) | ~4.6:1 | Pass |
| `--color-bg-light` (#F5F5F5) | `--color-text-dark` (#1A1A1A) | ~15:1 | Pass |
| `--color-bg-light` (#F5F5F5) | `--color-text-muted` (#6B6B6B) | ~4.7:1 | Pass |
| `--color-bg-light` (#F5F5F5) | `--color-accent-text` (#9E310D) | ~5.3:1 | Pass |
| `--color-accent` (#B8390F) | white (#FFFFFF) | ~5.2:1 | Pass |

Always use the context-appropriate accent token. `--color-accent` on light backgrounds and `--color-accent-on-dark` on dark backgrounds both pass AA for large text but are marginal for small text. Use `--color-accent-text` for small text on light backgrounds.

---

## New Component Guidance

When creating a new component in `/src/components-next/`:

1. **Create the directory:** `/src/components-next/ComponentName/`
2. **Create the component file:** `index.tsx`
3. **Create the SCSS module:** `ComponentName.module.scss`
4. **Use tokens:** All colors must use CSS custom properties from `:root`. No hardcoded hex values.
5. **Respect context:** If the component appears in both dark and light sections, handle both via parent class or props.
6. **Add focus styles:** Every interactive element needs `:focus-visible` with the standard outline pattern.
7. **Add reduced motion:** If the component animates, check `prefers-reduced-motion` and skip animation entirely.
8. **Use existing scale:** Font sizes, spacing, and border radius should match the established scale (see tokens above). Do not introduce new arbitrary values.
9. **Responsive:** Support all three breakpoints. Grids collapse at 768px, spacing reduces at 480px.

---

## Technical Debt: Hardcoded Values

The following hardcoded color values should be migrated to tokens in a future refactor:

| Location | Value | Suggested token |
|----------|-------|----------------|
| Button `.primary` | #FFFFFF | `--color-white` |
| Button `.ghost` | rgba(255, 255, 255, 0.5) | New: `--color-border-ghost` |
| Button `.inverted` hover | #E8E8E8 | New: `--color-white-hover` |
| Hero `.subheadline` | #fefeff | `--color-text-light` |
| Hero `.statStrip` | #F5F5F5 | `--color-surface` |
| TestimonialsSection `.card` | #fff | `--color-white` |
| FitCheckSection `.good` | rgba(34, 197, 94, 0.06) | New: `--color-success-tint` |
| NotifyForm error | #f87171 | New: `--color-error` |
| Page module `.testimonialCard` | #fff | `--color-white` |
| Page module `.fitGood` | rgba(34, 197, 94, 0.06) | New: `--color-success-tint` |

**Rule for new code:** Do not add hardcoded color values. Use existing tokens or propose a new token if none fits.
