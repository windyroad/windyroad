---
status: "proposed"
first-released:
date: 2026-07-10
human-oversight: confirmed
oversight-date: 2026-07-14
decision-makers: [Tom Howard, Claude]
consulted: [wr-architect agent, accessibility-lead agent, wr-style-guide agent, wr-voice-tone agent, wr-jtbd agent]
informed: []
supersedes: [023-pause-commercial-funnel-via-fully-booked-cta]
---

# Retire the consulting funnel; repurpose windyroad.com.au as The Shift newsletter hub

## Context and Problem Statement

ADR-023 *paused* the consulting funnel via a "Fully Booked" CTA pattern,
chosen explicitly because it was reversible and preserved the funnel pages as
social proof for a re-opening that was expected to come. That expectation no
longer holds. Tom is now full-time at Endava with no capacity to take Windy
Road consulting work, the position is not treated as temporary, and the
paused funnel produced no leads. ADR-023's own Reassessment Criteria are met
(the "Tom's full-time role ... capacity" trigger and the cold demand signal).

The live output of Windy Road is now the writing: **The Shift** (Tom's weekly
LinkedIn newsletter on AI engineering, for engineering leaders) and the blog.
The site should sell what is actually produced, not a consulting engagement
that cannot be honoured. This ADR converts ADR-023's reversible *pause* into a
formal *retirement* of the funnel and repurposes the homepage as a hub for
The Shift.

## Decision Drivers

- Honesty: the site must not present a consulting offer Tom cannot deliver.
- Focus: drive the one action that is real, subscribing to or reading The
  Shift and the blog.
- Preserve credibility: keep the bio and track-record content that makes
  Tom's writing worth reading.
- Preserve inbound link value: retiring routes must not hard-404 existing
  inbound links.
- Governance in lockstep: retiring the funnel retires the JTBD jobs and the
  voice premise that ADR-023 had only paused.

## Considered Options

1. **Retire the funnel and repurpose the homepage as a The Shift hub**
   (chosen). Delete `/founders`, `/vibe-code-audit`, `/ai-quality`; rewrite
   the homepage to drive newsletter subscription and surface recent writing;
   keep the bio/stats credibility section; delete the now-dead funnel
   components; redirect the retired routes.
2. **Keep the paused "Fully Booked" pattern in place** (ADR-023 status quo).
   Rejected: the pause was justified by an expected re-open that is no longer
   coming, so leaving disabled pricing and engagement scaffolding on the site
   is dead weight that undercuts the credibility of the content around it.
3. **Single Sivers-style `/now` page, funnel pages left dark**. Rejected:
   leaves three consulting pages live with nothing driving them, and does not
   give The Shift a real front door.

## Decision Outcome

Chosen option: **1. Retire the funnel and repurpose the homepage as a The
Shift hub.**

### Homepage (`src/app/page.tsx`)

Rewritten to four sections: (1) hero promoting The Shift with a "Subscribe on
LinkedIn" primary CTA (to the LinkedIn newsletter URL) and a "Read the blog"
secondary CTA; (2) the existing credentials/bio and stats section, kept; (3) a
new "Recent writing" section rendering the three latest posts from
`getAllPosts()`; (4) a closing subscribe CTA. Removed: the problems list,
process, priced engagements, testimonials, fit-check, FAQ plus FAQ JSON-LD,
and the `<Countdown>` (a Manifold bet that has resolved). Metadata and
OpenGraph rewritten from the patch-fitness copy to the hub purpose.

### Retired routes and redirects

`/ai-quality`, `/founders`, `/vibe-code-audit` are deleted. Redirects are
added in `netlify.toml` (not `next.config.mjs`: this is a Next.js static
export via `output: 'export'`, where framework-level `redirects()` do not
fire, so the host is the correct surface). Each redirects to `/` with a
**temporary** status `302`, mirroring the existing working redirect rules in
the same file. Temporary rather than permanent because the business direction
could change; the redirect also mitigates the SEO and inbound-link breakage
that ADR-023 named as the cost of stripping.

### Component deletions

`Hero`, `CTASection`, `FullyBookedCTA`, `FullyBookedStatus` (and its provider
plus region in `layout.tsx`), and `Countdown` become dead once the funnel
pages and homepage funnel are gone. Grep confirms they are imported only by
the retiring pages, the homepage funnel, `Header`, and `layout.tsx`. They are
deleted together with their colocated `*.test.tsx` files and the affected
page/layout tests, in the same change, so the suite and the TDD hook gate
(ADR-006) stay green. The `--color-disabled-*` tokens and the
`Clarity/track.ts` wrapper introduced by ADR-023 become dead code; pruning
them is optional hygiene, out of scope for this pass unless trivially clean.

### Header nav

The "AI Quality" nav link and the header `FullyBookedCTA` are removed. Nav
becomes The Shift (external, to the newsletter) plus Blog.

### Voice (ADR-010 disposition)

ADR-010's *consulting-positioning* premise (Windy Road as a team-scale patch
fitness delivery practice, $5k to $40k engagements) is superseded by this ADR.
Its **"we" team voice convention is retained**. Tom's direction this session
was to keep "we/our" for the site's framing and reserve "I" for personal
track-record claims. The Shift is treated as the "product/service" that "we"
frames; the bio's personal history stays "I". This is ADR-010's original
we/I split, repointed from consulting delivery to the newsletter. ADR-010 is
marked partially superseded (positioning premise only); the voice convention
stands.

### JTBD

Retires the Engineering Leader consulting jobs (JTBD-001 to JTBD-004) and the
Technical Founder persona plus JTBD-100 (its only two screens, `/founders` and
`/vibe-code-audit`, are deleted). Adds a new Engineering Leader "weekly
signal" reader job for The Shift (the Developer persona already has the
equivalent, JTBD-200 to JTBD-205). The `docs/jtbd/README.md` Job-to-Screen
mapping and Pricing Alignment table are updated in lockstep. New/changed jobs
and the persona retirement require human ratification via
`/wr-jtbd:confirm-jobs-and-personas` before this change is fully landed.

## Consequences

- **Good**: The site is honest. It drives the one real action (subscribe or
  read) and stops advertising unavailable consulting.
- **Good**: The recent-writing section makes the page show the output it
  sells.
- **Good**: Temporary redirects preserve inbound links to the retired routes.
- **Good**: Large net deletion. Five components, three routes, and their
  tests removed; the codebase shrinks.
- **Neutral**: ADR-023's `FullyBookedCTA`/`Status` machinery, disabled tokens,
  and Clarity wrapper are retired; re-opening a funnel later is a fresh build,
  not a one-line swap.
- **Bad**: Reversal is no longer cheap. This is retirement, not pause.
  Accepted: the re-open ADR-023 was hedging for is not expected.
- **Neutral**: The OG share image (`/img/og-image.png`) is regenerated at
  build time by the `prebuild` step (`scripts/generate-og-image.mjs`) from the
  shared `src/lib/siteCopy.mjs` hero copy, so it tracked the hub headline
  automatically when the homepage was rewritten (verified live 2026-07-14: the
  production image reads "The AI frontier moves every week. / Keeping up
  shouldn't be your job."). No separate follow-up is needed.

## Confirmation

- `src/app/page.tsx` has no consulting sections (pricing, engagements,
  fit-check, FAQ, testimonials), no `<Countdown>`, and a "Subscribe on
  LinkedIn" CTA pointing at the newsletter URL; metadata and OG describe the
  hub.
- `src/app/ai-quality/`, `src/app/founders/`, `src/app/vibe-code-audit/` are
  deleted; `netlify.toml` redirects each to `/` with status `302`.
- `Hero`, `CTASection`, `FullyBookedCTA`, `FullyBookedStatus`, `Countdown`
  and their colocated tests are deleted; `layout.tsx` no longer mounts
  `FullyBookedStatusProvider`/`FullyBookedStatus`; `Header` no longer imports
  `FullyBookedCTA` or links `/ai-quality`.
- `npm test` and `npm run build` pass with no references to the deleted
  symbols.
- `docs/jtbd/README.md` reflects the retired jobs plus the new reader job; the
  Technical Founder persona and JTBD-100 are marked retired/superseded.
- `docs/decisions/023-*` is renamed to `.superseded.md` with a Superseded-by
  note; `docs/decisions/README.md` lists this ADR.

## Reassessment Criteria

- Revisit if Tom's capacity returns and consulting is re-offered. This ADR
  becomes historical context and a fresh funnel ADR supersedes it.
- Revisit if The Shift moves off LinkedIn to an owned subscribe surface. The
  primary CTA destination changes.
- Revisit if analytics show the retired routes still carry meaningful inbound
  traffic. Reconsider redirecting to `/blog` (topical) rather than `/`.
