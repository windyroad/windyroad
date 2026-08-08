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
| JTBD-006 | Navigate an Edition I Already Know My Way Around | Important | [JTBD-006-navigate-an-edition-i-already-know-my-way-around.proposed.md](engineering-leader/JTBD-006-navigate-an-edition-i-already-know-my-way-around.proposed.md) |

JTBD-006 was added 2026-08-09 on Tom's direction at a question gate and is **not ratified**: it carries `human-oversight: unconfirmed` pending `/wr-jtbd:confirm-jobs-and-personas`. It also reverses a decision recorded on 2026-08-07 (P121 lines 169 to 182 declined to add a stable-shape outcome), and its own Notes section explains why writing it down does not by itself discharge that objection. Read the Notes before citing it.

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

## Publication Author

Tom, on the production side of the same artefacts. Not a reader persona. See [publication-author/persona.md](publication-author/persona.md). Added 2026-08-07: the corpus modelled only readers, so newsletter-pipeline work justified partly on the author's review load had no job to trace to.

| ID | Job | Priority | File |
|----|-----|----------|------|
| JTBD-300 | Spend Editorial Judgement Where It Counts | Must-have | [JTBD-300-spend-editorial-judgement-where-it-counts.proposed.md](publication-author/JTBD-300-spend-editorial-judgement-where-it-counts.proposed.md) |

## Internal Maintainer

Tom, operating this repo's governance loop while away from it and maintaining the tooling that loop runs on, here and upstream. Not a reader persona. See [internal-maintainer/persona.md](internal-maintainer/persona.md). Added 2026-08-08 to close a gap recorded 2026-06-17 with Tom's direction to author it locally; four tickets captured on 2026-08-08 (P130, P131, P132, P133) had to record their anchoring as unconfirmed because no persona covered the person they describe. Written on direction, not yet ratified: the persona and all three jobs carry `human-oversight: unconfirmed` pending `/wr-jtbd:confirm-jobs-and-personas`.

| ID | Job | Priority | File |
|----|-----|----------|------|
| JTBD-400 | Trust What the Loop Did While I Was Away | Must-have | [JTBD-400-trust-what-the-loop-did-while-i-was-away.proposed.md](internal-maintainer/JTBD-400-trust-what-the-loop-did-while-i-was-away.proposed.md) |
| JTBD-401 | Decide From the Phone in My Hand | Must-have | [JTBD-401-decide-from-the-phone-in-my-hand.proposed.md](internal-maintainer/JTBD-401-decide-from-the-phone-in-my-hand.proposed.md) |
| JTBD-402 | Land the Fix Where the Defect Lives | Must-have | [JTBD-402-land-the-fix-where-the-defect-lives.proposed.md](internal-maintainer/JTBD-402-land-the-fix-where-the-defect-lives.proposed.md) |

## Job-to-Screen Mapping

| Route / Surface | Primary jobs served | Persona |
|-----------------|---------------------|---------|
| `/` (homepage) | JTBD-005 | Engineering Leader |
| `/blog` | JTBD-005 | Engineering Leader |
| The Shift newsletter (LinkedIn, off-site) | JTBD-005, JTBD-006 | Engineering Leader |
| Tokens Spent newsletter (LinkedIn, off-site) | JTBD-200 through JTBD-205 | Developer |
| `/wr-newsletter` pipeline (prep and finalise) | JTBD-300 | Publication Author |
| `/wr-itil:work-problems` loop, `/wr-itil:review-problems`, `/wr-retrospective:run-retro` | JTBD-400 | Internal Maintainer |
| Ratification asks: `/wr-architect:review-decisions`, `/wr-jtbd:confirm-jobs-and-personas`, iteration summaries | JTBD-401 | Internal Maintainer |
| `/wr-itil:report-upstream`, `/wr-itil:update-upstream`, `/wr-itil:check-upstream-responses`, `docs/problems/parked/` | JTBD-402 | Internal Maintainer |

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
- Publication Author: 300-399
- Internal Maintainer: 400-499
