# Risk Policy

Risk assessment for pipeline actions (commit, push, release), aligned with ISO 31000.

**Last reviewed:** 2026-05-25

## Business Context

Windy Road is a public GitHub repository containing the static marketing site at windyroad.com.au (Next.js, deployed to Netlify) and the LinkedIn newsletter pipeline (The Shift for engineering leaders, Tokens Spent for developers). Visitor-facing surfaces include the home page, blog, founders page, AI Quality page, Vibe Code Audit page, and the published newsletters distributed via LinkedIn.

Material constraints that shape risk assessment:

- **Solo operator, no QA team.** Automated controls (hooks, tests, CI gates, agent reviews) are the only safety net between a change and visitors. This justifies a tight risk appetite.
- **No paying users, no SLA, no PII storage.** There are no contractual uptime obligations and no regulated data. Severe impact is bounded by reputation and trust, not contract or compliance penalties.
- **Newsletter is the primary lead-generation channel.** Failures in the newsletter pipeline (bad drafts reaching LinkedIn, voice or content-risk gate bypass, publication failures) directly affect acquisition.
- **Public repository.** Source code, commits, and changesets are world-readable. Confidential business information must not appear in any committed file.

## Confidential Information

This repository is public. The following categories of information are confidential and MUST NOT appear in any committed file (source, docs, problem tickets, briefings, changesets, commit messages, or risk reports):

- Revenue figures, contract values, deal sizes
- Subscriber counts, user counts, traffic volumes (page views, sessions, unique visitors)
- Pricing details for engagements not otherwise published on the site
- Conversion rates, funnel metrics, marketing performance data
- Client names not otherwise public, including in case studies that have not been approved for publication

When discussing such information in tickets or briefings, use generic descriptions ("low single-digit subscribers", "early-stage traffic", "below threshold") instead of exact figures. The risk-scorer flags any diff containing apparent business metrics as a standalone information-disclosure risk.

## Risk Appetite

Residual risk score must be **< 5 (Low)** for any pipeline action (commit, push, release). Scores >= 5 (Medium and above) must be reduced before proceeding.

The tight appetite reflects the solo-operator context. With no second pair of eyes, and automated controls as the only safety net, accepting Medium residual risk would mean shipping changes that the existing controls cannot reliably catch.

## Impact Levels

| Level | Label | Description |
|-------|-------|-------------|
| 1 | Negligible | No visitor or reader impact. Site behaviour, content, newsletter pipeline, and availability unchanged. |
| 2 | Minor | No visitor or reader impact. Dev tooling, hooks, or local build affected, but the published site and newsletter pipeline are unaffected. |
| 3 | Moderate | Static-site visitor degradation, OR newsletter pipeline disruption that does not reach readers. Blog content, founders page, AI Quality page, or Vibe Code Audit page degraded or inaccessible (the static site is reference material for the LinkedIn-led funnel; commercial CTAs are paused per ADR 023). Netlify build broken or delayed. Newsletter pipeline broken before draft generation (caught before publish, rescheduling possible). Confidential business metrics (revenue, subscriber counts, pricing, traffic volumes) committed to the public repository (information disclosure requiring immediate remediation but not yet affecting visitor-facing service). |
| 4 | Significant | Newsletter content quality failure caught at a gate, OR site fully offline. Newsletter draft pipeline ships poor-quality content past one of the voice, content-risk, SW-critic, or editor gates (caught at finalise but indicates gate weakness). Published newsletter on LinkedIn renders incorrectly or contains broken links. Site fully offline (LinkedIn-newsletter article links break; credibility hit at the destination of the funnel). |
| 5 | Severe | Newsletter content failure reaching LinkedIn readers (the primary channel), OR catastrophic content / trust / security failure on visitor surface. Newsletter content factually wrong or misrepresenting sources reaches LinkedIn readers. Voice-violating outbound copy that frames readers' teams as behind. Misleading or factually wrong content reaching site visitors. Broken accessibility (WCAG AA violation reaching readers or visitors). Exposed secrets or credentials. |

## Likelihood Levels

| Level | Label | Description |
|-------|-------|-------------|
| 1 | Rare | Almost no chance of reaching visitors or readers. Hooks, build, static export, or pre-publish gates would catch the issue first. |
| 2 | Unlikely | Low chance of impact. Existing controls (architect, accessibility, voice-and-tone, content-risk hooks) mitigate effectively. |
| 3 | Possible | Reasonable chance of reaching the published surface. Controls only partially cover the affected area. |
| 4 | Likely | High chance of impact. No hooks or automated checks cover this area of the site or newsletter pipeline. |
| 5 | Almost certain | Impact will reach visitors or readers. No safety net between the change and the live site or LinkedIn publication. |

## Risk Matrix

Residual risk = impact x likelihood (after controls are applied). Both dimensions contribute proportionally to the score on a 1-25 scale.

### Product Reference Table

| Impact \ Likelihood | 1 Rare | 2 Unlikely | 3 Possible | 4 Likely | 5 Almost certain |
|---|---|---|---|---|---|
| 1 Negligible | 1 | 2 | 3 | 4 | 5 |
| 2 Minor | 2 | 4 | 6 | 8 | 10 |
| 3 Moderate | 3 | 6 | 9 | 12 | 15 |
| 4 Significant | 4 | 8 | 12 | 16 | 20 |
| 5 Severe | 5 | 10 | 15 | 20 | 25 |

### Label Bands

| Range | Label |
|-------|-------|
| 1-2 | Very Low |
| 3-4 | Low |
| 5-9 | Medium |
| 10-16 | High |
| 17-25 | Very High |

This risk matrix is the single source of truth for both the **risk-scorer agent** (pipeline risk assessment for commit, push, release) and the **problem management process** (problem severity classification via the manage-problem skill).

## Action-Specific Risk

The risk appetite (< 5) applies uniformly to all pipeline actions: commit, push, and release. We are delivering change into production; the threshold does not change based on which stage the change is at. CI controls and preview deploys are mitigating controls that reduce residual risk, not reasons to accept higher risk.

The risk scorer assesses the accumulated change at each stage, not just counts of commits or files. It must understand what the changes are to judge their impact and likelihood.

## Back-Pressure

Each action must consider its effect on the next queue downstream. WIP accumulation acts as back-pressure through the pipeline:

- Do not commit if the accumulated unpushed changes (including this commit) would have risk >= 5
- Do not push if the accumulated unreleased changes (including this push) would have risk >= 5
- Exception: actions that reduce downstream risk bypass back-pressure (e.g. adding tests when release risk is high)
