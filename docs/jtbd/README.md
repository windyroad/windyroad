# Jobs To Be Done (JTBD) Index

This directory defines the user personas, jobs, and desired outcomes for windyroad.com.au.
The `wr-jtbd:agent` reads these files to review UI changes against documented user jobs.

Migrated from `docs/JOBS_TO_BE_DONE.md` on 2026-04-20 per ADR-008 Option 3 (P019).

## Engineering Leader

CTOs, Heads of Engineering, VPs at mid-to-large organisations with AI-coding-tool-equipped teams. Primary commercial persona.

[Persona definition](engineering-leader/persona.md)

### Proposed

| ID | Job | Priority | File |
|----|-----|----------|------|
| JTBD-005 | Stay Ahead of the Shift | Must-have | [JTBD-005-stay-ahead-of-the-shift.proposed.md](engineering-leader/JTBD-005-stay-ahead-of-the-shift.proposed.md) |

### Retired (per ADR-041, pending ratification)

The consulting funnel was retired 2026-07-10. These jobs are no longer served by the site.

| ID | Job | File |
|----|-----|------|
| JTBD-001 | Awareness | [JTBD-001-awareness.proposed.md](engineering-leader/JTBD-001-awareness.proposed.md) |
| JTBD-002 | Engagement | [JTBD-002-engagement.proposed.md](engineering-leader/JTBD-002-engagement.proposed.md) |
| JTBD-003 | Evaluation | [JTBD-003-evaluation.proposed.md](engineering-leader/JTBD-003-evaluation.proposed.md) |
| JTBD-004 | Ongoing Ownership | [JTBD-004-ongoing-ownership.proposed.md](engineering-leader/JTBD-004-ongoing-ownership.proposed.md) |

## Technical Founder (retired per ADR-041, pending ratification)

Non-technical to semi-technical founders with AI-generated apps in production that break unpredictably. Retired 2026-07-10: the funnel pages that served this persona (`/founders`, `/vibe-code-audit`) are deleted and the site no longer offers this work.

[Persona definition](technical-founder/persona.md)

### Retired

| ID | Job | File |
|----|-----|------|
| JTBD-100 | Founder Stabilisation | [JTBD-100-founder-stabilisation.proposed.md](technical-founder/JTBD-100-founder-stabilisation.proposed.md) |

## Developer

Working engineers using AI coding tools day-to-day. Influence-only persona, with no direct commercial offer. Serves as an upstream credibility channel on Engineering Leader tool decisions.

[Persona definition](developer/persona.md)

### Proposed

| ID | Job | Priority | File |
|----|-----|----------|------|
| JTBD-200 | Signal from Noise | Must-have | [JTBD-200-signal-from-noise.proposed.md](developer/JTBD-200-signal-from-noise.proposed.md) |
| JTBD-201 | Tool Triage in a Time Budget | Must-have | [JTBD-201-tool-triage-time-budget.proposed.md](developer/JTBD-201-tool-triage-time-budget.proposed.md) |
| JTBD-202 | Timing the Category, Not the Tool | Important | [JTBD-202-timing-the-category.proposed.md](developer/JTBD-202-timing-the-category.proposed.md) |
| JTBD-203 | Peer Validation | Important | [JTBD-203-peer-validation.proposed.md](developer/JTBD-203-peer-validation.proposed.md) |
| JTBD-204 | Experiment vs Delivery Boundary | Important | [JTBD-204-experiment-delivery-boundary.proposed.md](developer/JTBD-204-experiment-delivery-boundary.proposed.md) |
| JTBD-205 | Trust, Shipped vs Demo | Must-have | [JTBD-205-trust-shipped-vs-demo.proposed.md](developer/JTBD-205-trust-shipped-vs-demo.proposed.md) |

## Job-to-Screen Mapping

| Route / Surface | Primary jobs served | Persona |
|-----------------|---------------------|---------|
| `/` (homepage) | JTBD-005 | Engineering Leader |
| `/blog` | JTBD-005 | Engineering Leader |
| The Shift newsletter (LinkedIn, off-site) | JTBD-005 | Engineering Leader |
| Tokens Spent newsletter (LinkedIn, off-site) | JTBD-200 through JTBD-205 | Developer |

Retired per ADR-041: `/ai-quality`, `/founders`, `/vibe-code-audit` are deleted and redirect to `/`. The homepage, blog, and The Shift no longer serve the consulting jobs JTBD-001 to JTBD-004 or the Technical Founder's JTBD-100.

## Pricing Alignment

Retired per ADR-041. Windy Road no longer sells consulting engagements (Patch Fitness Assessment, Embedded Delivery Lead, Delivery Sprint, Vibe Code Audit). Tom is full-time at Endava with no consulting capacity, and the funnel produced no leads. The site's only calls to action are subscribing to and reading The Shift and the blog, neither of which is a paid offer. The prior pricing table is preserved in git history and in superseded ADR-023 if the funnel is ever reopened.

## Status Model

- **`proposed`**: drafted but not yet confirmed by user research or production use
- **`validated`**: confirmed by user research or production use. Promote by renaming the file from `.proposed.md` to `.validated.md` and updating the status field in frontmatter
- **`retired`**: no longer served by the site. Marked in frontmatter (`status: retired`, `retired-by`, `retired-date`); the file is kept for historical context. Introduced by ADR-041.

## ID Ranges

- Engineering Leader: 001-099
- Technical Founder: 100-199
- Developer: 200-299
