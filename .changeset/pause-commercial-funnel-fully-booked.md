---
'windy-road': minor
---

Pause the consulting funnel via a "Fully Booked" CTA pattern. Tom is starting a full-time engineering role and has no capacity to take Windy Road clients; the newsletter and blog continue. Per ADR-023, every "Book a Call" anchor across the site is replaced with a non-navigating `FullyBookedCTA` button that visibly marks the offering as paused while preserving the credibility content on `/founders`, `/vibe-code-audit`, and `/ai-quality`.

Visible label is `~~Book a Call~~ Fully Booked`. The button is `aria-disabled="true"` (not HTML `disabled`), keeping it focusable and click-capturable. A single `aria-live="polite"` region in the root layout announces "We're fully booked right now. Subscribe to The Shift for a note when that changes." on click. Click and hover fire Microsoft Clarity custom events (`fully_booked_click`, `fully_booked_hover`) tagged with the call-site `source`, so demand signal is measurable per surface.

Contract changes:

- New `FullyBookedCTA` component at `src/components-next/FullyBookedCTA/`. Sibling to `Button` (which stays anchor-only by contract). Variants `primary` / `inverted`, sizes `default` / `large`, required `source` prop typed against the surface enum.
- New `FullyBookedStatus` context + polite live region at `src/components-next/FullyBookedStatus/`, mounted once in `src/app/layout.tsx`. `setStatus` clears then re-sets via `requestAnimationFrame` to force re-announcement of identical messages.
- New typed analytics helper at `src/components-next/Clarity/track.ts` (`trackEvent(name, tags?)`). After this change the Clarity wrapper module is the only importer of `@microsoft/clarity`; leaf components never reach for the SDK directly.
- Four new disabled-look tokens in `src/styles/globals.scss`: `--color-disabled-bg`, `--color-disabled-border`, and the `-on-dark` variants. Each pair meets WCAG AA at 4.5:1 (text) / 3:1 (border) without relying on opacity.
- The conditional CTA section on AI/vibe-coding tagged blog posts (`src/app/blog/[slug]/page.tsx`) is removed. Per JTBD review, Developer readers (JTBD-200, JTBD-201, JTBD-205) are doing content consumption; a struck-through pitch reads as a dead-end. Restore when the funnel reopens.
- Footer adds the caption "Fully booked. Not taking new engagements right now." Phone, email, and LinkedIn stay as peer-contact channels.
- `NotifyForm` on `/vibe-code-audit` is repurposed as a waitlist (heading "Want to know when we're taking work again?", helper "Leave your email. We'll send one note when we open up. No pitch, no list churn.", button "Notify me", success "Thanks. We'll send one note when we open up."). The "What's breaking?" textarea is removed.

Reversal: swap `FullyBookedCTA` back to the active `Book a Call` anchor and restore the blog `{showCTA && ...}` block. ADR-023 records the reassessment criteria (90 days, or fewer than one click per week for four weeks).

ADR-023 references `docs/jtbd/README.md` Job-to-Screen mapping as the canonical reference for which jobs each surface must re-serve when the funnel restarts.
