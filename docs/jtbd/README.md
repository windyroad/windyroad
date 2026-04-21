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
| JTBD-001 | Awareness | Must-have | [JTBD-001-awareness.proposed.md](engineering-leader/JTBD-001-awareness.proposed.md) |
| JTBD-002 | Engagement | Must-have | [JTBD-002-engagement.proposed.md](engineering-leader/JTBD-002-engagement.proposed.md) |
| JTBD-003 | Evaluation | Important | [JTBD-003-evaluation.proposed.md](engineering-leader/JTBD-003-evaluation.proposed.md) |
| JTBD-004 | Ongoing Ownership | Important | [JTBD-004-ongoing-ownership.proposed.md](engineering-leader/JTBD-004-ongoing-ownership.proposed.md) |

## Technical Founder

Non-technical to semi-technical founders with AI-generated apps in production that break unpredictably. Secondary commercial persona.

[Persona definition](technical-founder/persona.md)

### Proposed

| ID | Job | Priority | File |
|----|-----|----------|------|
| JTBD-100 | Founder Stabilisation | Nice-to-have | [JTBD-100-founder-stabilisation.proposed.md](technical-founder/JTBD-100-founder-stabilisation.proposed.md) |

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
| `/` (homepage) | JTBD-001, JTBD-002, JTBD-003 | Engineering Leader |
| `/ai-quality` (planned) | JTBD-003, JTBD-004 | Engineering Leader |
| `/founders` | JTBD-100 | Technical Founder |
| `/vibe-code-audit` | JTBD-100 | Technical Founder |
| `/blog` | JTBD-001, JTBD-003 | Engineering Leader, Technical Founder |
| The Shift newsletter (LinkedIn, off-site) | JTBD-001, JTBD-002, JTBD-003 | Engineering Leader |
| Tokens Spent newsletter (LinkedIn, off-site) | JTBD-200 through JTBD-205 | Developer |

## Pricing Alignment

| Engagement | Price | Job served | Entry point for |
|------------|-------|------------|-----------------|
| Patch Fitness Assessment | $9,000 / 1 week | JTBD-002 (Engagement) | Engineering leaders wanting proof before committing |
| Embedded Delivery Lead | $20,000/month | JTBD-004 (Ongoing Ownership) | Teams ready for hands-on capability building |
| Delivery Sprint | $40,000 / 4 weeks | JTBD-004 (Ongoing Ownership) | Teams wanting a specific deliverable shipped |
| Vibe Code Audit | $9,000 / 1 week | JTBD-100 (Founder Stabilisation) | Founders with broken apps |

The Developer persona has no pricing row by design. Developer-serving work (Tokens Spent newsletter, future developer-oriented blog posts and community surfaces) is an influence and community investment, not a direct commercial offer. Commercial return, if any, is indirect: developers influence their employers' tool and consulting choices, so credibility earned here compounds into Engineering Leader engagements over time.

## Status Model

- **`proposed`**: drafted but not yet confirmed by user research or production use
- **`validated`**: confirmed by user research or production use. Promote by renaming the file from `.proposed.md` to `.validated.md` and updating the status field in frontmatter

## ID Ranges

- Engineering Leader: 001-099
- Technical Founder: 100-199
- Developer: 200-299
