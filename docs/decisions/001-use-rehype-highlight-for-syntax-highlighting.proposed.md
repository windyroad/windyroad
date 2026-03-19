---
status: "proposed"
first-released: 2026-03-09
date: 2026-03-09
decision-makers: [Tom Howard, Claude]
consulted: []
informed: []
---

# Use rehype-highlight for syntax highlighting

## Context and Problem Statement

Blog posts contain code blocks in bash, JSON, and other languages. The existing rendering pipeline (remark/rehype) outputs plain `<pre><code>` with no token coloring. Syntax highlighting improves readability for technical content.

## Decision Drivers

- Dev server responsiveness (Turbopack compilation speed)
- Build-time rendering (no client-side JS for highlighting)
- Integration with existing remark/rehype unified pipeline
- Minimal dependency footprint

## Considered Options

1. **@shikijs/rehype (Shiki)** - VS Code's TextMate grammar engine, WASM-based
2. **rehype-highlight (highlight.js)** - Lightweight regex-based highlighter
3. **No highlighting** - Keep plain code blocks with CSS-only styling

## Decision Outcome

Chosen option: **rehype-highlight**, because it integrates into the rehype pipeline without blocking Turbopack compilation.

Shiki was tested first and caused the Next.js 16 Turbopack dev server to hang indefinitely during compilation. The WASM engine initialization blocks the event loop during module evaluation. A synchronous JS-engine variant was also tested but produced the same Turbopack hang. The production build worked fine with Shiki, but an unusable dev server is a blocker.

highlight.js adds CSS class names at build time. The theme is applied via a CSS import (`highlight.js/styles/github-dark.css`) scoped to the blog post page. No WASM, no async initialization.

## Consequences

- **Good**: Dev server starts in under 1 second, blog posts render in ~1.2s on first load
- **Good**: No client-side JavaScript for syntax highlighting
- **Good**: Theme is a standard CSS file, easy to swap
- **Neutral**: highlight.js token granularity is lower than Shiki's TextMate grammars
- **Bad**: Some edge cases in bash/shell highlighting may be less accurate than Shiki

## Confirmation

- `npm run build` succeeds
- `npm run dev` starts without hanging
- Blog post code blocks render with colored tokens
- No highlight.js runtime JS in the client bundle

## Pros and Cons of the Options

### @shikijs/rehype (Shiki)

- Good: Highest accuracy (TextMate grammars, same as VS Code)
- Good: Wide language support
- Bad: WASM engine hangs Turbopack dev server in Next.js 16
- Bad: Async initialization adds latency even in production builds
- Bad: Heavy dependency (~5MB WASM + grammars)

### rehype-highlight (highlight.js)

- Good: Instant initialization, no WASM
- Good: Works with Turbopack and webpack
- Good: Small dependency footprint
- Good: CSS-only theming
- Neutral: Slightly less accurate token detection
- Bad: Fewer supported languages (covers bash, JSON, and common web languages)

### No highlighting

- Good: Zero dependencies, fastest possible
- Bad: Code blocks are hard to read without token colors
- Bad: Looks unprofessional for a technical blog

## Reassessment Criteria

- When Next.js Turbopack resolves WASM module evaluation blocking
- When Shiki offers a pure-JS mode that works with Turbopack
- If blog adds languages not supported by highlight.js
