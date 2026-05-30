---
status: "proposed"
first-released:
date: 2026-04-29
human-oversight: confirmed
oversight-date: 2026-05-30
decision-makers: [Tom Howard, Claude]
consulted: [wr-architect agent, accessibility-lead agent, wr-style-guide agent, wr-voice-tone agent, wr-jtbd agent, wr-risk-scorer:plan agent]
informed: []
---

# Pause the commercial funnel via a "Fully Booked" CTA pattern

## Context and Problem Statement

Tom is starting a full-time engineering role and no longer has capacity to
take Windy Road consulting clients. The newsletter (The Shift, Tokens Spent)
and blog continue. The site currently funnels visitors to cal.com via ~20
"Book a Call" anchor links across the header, hero, CTASection, homepage,
`/founders`, `/vibe-code-audit`, `/ai-quality`, and an end-of-post CTA on
AI/vibe-coding tagged blog articles.

Routing every one of those visitors to a real cal.com booking that we cannot
honour produces a worse outcome for both sides: visitors waste a click and we
have to decline, both quietly damaging trust. A scarcity-style pause that
visibly marks the offering as unavailable preserves the credibility content
on `/founders`, `/vibe-code-audit`, `/ai-quality`, signals demand without
requiring a rewrite, lets us count interest signal via Microsoft Clarity, and
reverses cleanly when capacity returns.

JTBD impact: Engineering Leader jobs (JTBD-001..004) and the Technical Founder
job (JTBD-100) are **paused**, not retired. The six Developer jobs
(JTBD-200..205, served by content) remain primary. ADR-010's "we" voice
positioning stays in force. The Job-to-Screen mapping in `docs/jtbd/README.md`
is unchanged: routes and their job mappings stay the same; only CTA state
changes. When restoring the funnel, that table is the canonical reference
for which jobs each surface must re-serve.

## Decision Drivers

- Reversibility: the pause should swap back to active CTAs without rewriting
  funnel pages.
- Honest signalling: visitors must know the offering is unavailable before
  they click anything that promises a booking.
- Demand measurement: we want a quantifiable signal of paused demand to
  inform the decision to re-open.
- Accessibility: the unavailable state must convey via more than colour
  (WCAG SC 1.4.1) and must remain operable for screen-reader and keyboard
  users (SC 2.1.1, 2.4.7, 4.1.2).
- Style-guide reuse: the disabled-look state must independently meet AA
  contrast (4.5:1 text, 3:1 UI) and reuse existing tokens where possible.
- Voice (ADR-010): copy stays "we" team voice; no manufactured urgency or
  reader-shaming framing.

## Considered Options

1. **Replace each "Book a Call" CTA with a non-navigating "Fully Booked"
   button** (chosen). Keeps the funnel pages intact as social-proof content,
   visibly marks the offering as paused, captures interest signal, reverses
   by swapping the component back.
2. **Strip the funnel** (delete `/founders`, `/vibe-code-audit`, `/ai-quality`,
   homepage pricing). Cleanest but loses authority/case-study content and
   isn't easily reversible. Also breaks any inbound SEO/links to those pages.
3. **Single /now or /about availability page** (Derek Sivers / Patrick
   McKenzie pattern) with all funnel CTAs untouched. Lightweight but leaves
   the live "Book a Call" CTAs in place, which keeps shipping booking
   requests we cannot honour.
4. **Swap "Book a Call" for "Subscribe to the newsletter" CTAs site-wide**.
   Aggressively repositions the site as content-first. Bigger rewrite; loses
   the scarcity / social-proof signal Tom wants to preserve; doesn't capture
   demand signal for the paused funnel.

## Decision Outcome

Chosen option: **1. Replace each "Book a Call" CTA with a non-navigating
"Fully Booked" button**.

A new reusable component `FullyBookedCTA` replaces every "Book a Call"
instance. Visible label is `~~Book a Call~~  Fully Booked`. Click and hover
fire Microsoft Clarity custom events tagged with the call-site `source`. A
single polite `aria-live` region in the root layout announces a status line
when any CTA is clicked.

The blog post conditional CTA section (`src/app/blog/[slug]/page.tsx`,
`{showCTA && ...}` block plus the `CTA_TAGS` constant) is deleted on this
pass rather than struck-through, per JTBD review: Developer readers landing
on AI/vibe-coding posts are doing content consumption (JTBD-200, JTBD-201,
JTBD-205) and a struck-through pitch reads as a dead-end. Restore the block
when the funnel reopens.

### Sibling component, not a Button variant

`FullyBookedCTA` is a sibling component to the existing `Button`, not a new
variant of `Button`. `Button` is anchor-only by contract; this CTA needs a
`<button>` for interaction tracking and status announcement. Future
contributors should not refactor `Button` to take an `as="button"` prop --
that would silently merge the two patterns and make the unavailable state
harder to reason about.

### Leaf components do not import the analytics SDK directly

The `@microsoft/clarity` SDK is wrapped by a single module
(`src/components-next/Clarity/track.ts`) that exposes a typed
`trackEvent(name, tags?)` helper. `FullyBookedCTA` imports this helper, never
the SDK directly. The Clarity wrapper module is the sole importer of
`@microsoft/clarity` after this change. This rule applies to any future leaf
component that needs analytics; the wrapper is the contract surface.

### Status region wired via React context

The polite `aria-live` region is mounted once in the root layout and exposes
a `setStatus(message: string)` setter via a small React context
(`FullyBookedStatusContext`). React context was chosen over an event bus or a
state library to stay consistent with the codebase's plain-hooks +
colocated-client-component pattern (Header, Clarity, Hero). No new
dependency. The region must be present on initial render (empty), not
conditionally mounted, or the first announcement is missed. `setStatus` must
clear-then-set on the next animation frame to force re-announcement of
identical messages (otherwise repeat clicks on the same surface produce no
DOM change and no announcement).

### Tracking contract

- Event names (stable):
  - `fully_booked_click` -- one per click.
  - `fully_booked_hover` -- one per element per session, debounced via a
    `useRef` flag.
- Tag on each event:
  - `source` -- one of `header`, `homepage_hero`, `homepage_pricing_t1`,
    `homepage_pricing_t2`, `homepage_pricing_t3`, `homepage_final`,
    `founders_hero`, `founders_cta`, `vibe_audit_hero`, `vibe_audit_15min`,
    `ai_quality_hero`, `ai_quality_pricing_t1`, `ai_quality_pricing_t2`,
    `ai_quality_pricing_t3`, `ai_quality_final`. Hard-coded at the call site
    so it survives layout changes.
- Read pattern: filter by event name, segment by `source` tag.

### Disabled-look style tokens

A set of new tokens supports the disabled-look state at AA contrast:

- `--color-disabled-bg: #E5E5E5` (light surface)
- `--color-disabled-border: #9E9E9E` (light surface)
- `--color-disabled-bg-on-dark: #2A2A2A` (dark surface)
- `--color-disabled-border-on-dark: #5A5A5A` (dark surface)

Foreground reuses existing `--color-text-muted` (#6B6B6B, 4.61:1 on the
disabled-light bg) and `--color-text-muted-on-dark` (#AAAAAA, 6.9:1 on the
disabled-dark bg). The tokens are added to `src/styles/globals.scss` at the
existing `:root` selector.

`docs/STYLE-GUIDE.md` does not currently document a disabled / unavailable
button variant. A follow-up problem ticket records the gap; this ADR is the
de-facto specification until the style guide is updated.

### Accessibility contract

- Strikethrough is CSS `text-decoration: line-through` on a
  `<span aria-hidden="true">`. Not `<s>` / `<del>` -- they carry semantics
  some screen readers announce.
- `aria-label="Fully booked. Not taking new engagements right now."` on every
  button; visible content is `aria-hidden`.
- `aria-disabled="true"`, never the HTML `disabled` attribute. Never
  `pointer-events: none` -- both would block tracking and announcement.
- Focus indicator (`outline: 2px solid var(--color-accent); outline-offset: 2px;`)
  remains visible in the unavailable state.
- Touch target stays 44x44 CSS px in the unavailable state (SC 2.5.8).

## Consequences

- **Good**: Reverses cleanly. Re-opening the funnel is a one-line component
  swap (`FullyBookedCTA` -> `Button`/anchor) plus restoring the blog
  conditional block. No copy or content rewrite needed. The
  `docs/jtbd/README.md` Job-to-Screen table is the canonical reference for
  which jobs each surface must re-serve on restoration.
- **Good**: Preserves authority/case-study content on `/founders`,
  `/vibe-code-audit`, `/ai-quality` without modification.
- **Good**: Captures demand signal (clicks/hovers via Clarity tags) so the
  decision to re-open is data-backed rather than vibes-based.
- **Good**: Honest with visitors. They know before they click that the
  offering is paused; they don't waste effort on a booking that won't happen.
- **Good**: Establishes a typed analytics-event contract via the Clarity
  wrapper, useful for any future event we want to track.
- **Neutral**: Adds two new components (`FullyBookedCTA`, `FullyBookedStatus`),
  one new utility module (`Clarity/track.ts`), and four new CSS tokens. All
  small, all contained.
- **Bad**: The blog conditional CTA section is removed on this pass; readers
  who would have clicked through to a booking from a high-intent post no
  longer have that path. Reasoning lives in JTBD review and the pause is
  reversible.
- **Bad**: `STYLE-GUIDE.md` is silent on the disabled / unavailable button
  variant; a follow-up ticket fills this gap.

## Confirmation

- `src/components-next/FullyBookedCTA/index.tsx` exists with
  `aria-disabled="true"`, `aria-label="Fully booked. Not taking new engagements right now."`,
  CSS-strikethrough on an `aria-hidden` inner span, and click/hover handlers
  that call `trackEvent` from `Clarity/track.ts`.
- `src/components-next/Clarity/track.ts` exists, exports `trackEvent(name, tags?)`,
  and is the only importer of `@microsoft/clarity` outside
  `src/components-next/Clarity/index.tsx`.
- `src/components-next/FullyBookedStatus/index.tsx` exists, mounts an
  always-rendered `aria-live="polite"` region, and exposes
  `FullyBookedStatusContext` with a `setStatus` setter that clear-then-sets.
- `<FullyBookedStatus>` is mounted once in `src/app/layout.tsx`.
- Every cal.com `Book a Call` anchor across `Header`, `CTASection`, `Hero`,
  `src/app/page.tsx`, `src/app/vibe-code-audit/page.tsx`,
  `src/app/ai-quality/page.tsx` has been replaced with `<FullyBookedCTA>`.
- The `{showCTA && ...}` block and `CTA_TAGS` constant in
  `src/app/blog/[slug]/page.tsx` are deleted.
- `src/styles/globals.scss` includes the four new `--color-disabled-*` tokens
  at `:root`.
- `src/components-next/FullyBookedCTA/index.test.tsx` exists and passes.
- `docs/decisions/README.md` lists this ADR.

## Reassessment Criteria

- Revisit the pause status if it exceeds **90 days** without a decision to
  re-open or to retire the funnel formally.
- Revisit if the Clarity demand signal averages **< 1 `fully_booked_click`
  per week for 4 consecutive weeks** -- demand has cooled enough that the
  social-proof framing no longer carries weight, and a Sivers-style /now
  page becomes the cleaner pattern.
- Revisit if Tom's full-time role ends or capacity returns -- swap the
  component back, restore the blog conditional CTA block, leave this ADR as
  historical context.
- Revisit if `docs/STYLE-GUIDE.md` adds a documented disabled / unavailable
  button variant -- align this component's tokens to whatever the style
  guide canonicalises.
