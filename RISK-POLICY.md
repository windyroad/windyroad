# Risk Policy

Risk assessment for pipeline actions (commit, push, release), aligned with ISO 31000.

**Last reviewed:** 2026-08-09

> Reviewed quarterly. This blockquote line is machine-read by the wr-risk-scorer commit gate's staleness check (line-anchored, capital R, lowercase cadence word); keep the shape intact so the gate resolves the 90-day quarterly threshold instead of its 14-day fallback.

**Review cadence:** Quarterly (every 3 months). The policy is re-attested by the operator each quarter, or sooner if an incident or material business change warrants it (ISO 31000 review-after-incident). Note: since wr-risk-scorer 0.16.5 the enforcing `risk-score-commit-gate` reads this policy's stated cadence from the machine-readable "Reviewed quarterly" blockquote line above (90 days), falling back to 14 days only if that line is removed or its cadence word is unrecognised; the earlier hardcoded 14-day threshold was fixed upstream (windyroad/agent-plugins#322, closed 2026-07-06).

## Business Context

Windy Road is a public GitHub repository containing the static site at windyroad.com.au (Next.js, deployed to Netlify) and the LinkedIn newsletter pipeline (The Shift for engineering leaders, Tokens Spent for developers). As of ADR-041 the site is a hub for The Shift: the consulting funnel (the founders, AI Quality, and Vibe Code Audit pages) has been retired and deleted, and the visitor-facing surfaces are the home page, the blog, and the newsletters distributed via LinkedIn.

Material constraints that shape risk assessment:

- **Solo operator, no QA team.** Automated controls (hooks, tests, CI gates, agent reviews) are the only safety net between a change and visitors. This justifies a tight risk appetite.
- **No paying users, no SLA, no PII storage.** There are no contractual uptime obligations and no regulated data. Severe impact is bounded by reputation and trust, not contract or compliance penalties.
- **The newsletter is the primary audience channel.** Failures in the newsletter pipeline (bad drafts reaching LinkedIn, voice or content-risk gate bypass, publication failures) directly affect reputation and audience growth.
- **Public repository.** Source code, commits, and changesets are world-readable. Confidential business information must not appear in any committed file.

## Confidential Information

This repository is public. The following categories of information are confidential and MUST NOT appear in any committed file (source, docs, problem tickets, briefings, changesets, commit messages, or risk reports):

- Revenue figures, contract values, deal sizes
- Subscriber counts, user counts, traffic volumes (page views, sessions, unique visitors)
- Pricing or commercial terms for any private engagement or arrangement not published on the site
- Conversion rates, funnel metrics, marketing performance data
- Client names not otherwise public, including in case studies that have not been approved for publication

When discussing such information in tickets or briefings, use generic descriptions ("low single-digit subscribers", "early-stage traffic", "below threshold") instead of exact figures. The risk-scorer flags any diff containing apparent business metrics as a standalone information-disclosure risk.

## Risk Appetite

**Threshold: 5 (Low)**

Residual risk score must be **5 or below** for any pipeline action (commit, push, release). Scores above 5 must be reduced before proceeding. Under the Label Bands below, 5 is the top of the Low band, so the numeric threshold and the band label now agree: the appetite is Low or better.

The tight appetite reflects the solo-operator context. With no second pair of eyes, and automated controls as the only safety net, a residual above 5 would mean shipping changes that the existing controls cannot reliably catch.

**How a residual of exactly 5 may be composed.** A residual of 5 is admissible only where it is reached with likelihood 1: that is, where a severe-impact risk has been driven to Rare by a named control. State the control, do not assert Rare. Absent a named control the likelihood is not 1, so the residual is not 5, so the change is above appetite. This is deliberately tighter than the label band alone requires, and it is kept rather than dropped when the band moves. The only other route to 5 on this matrix is negligible impact at almost-certain likelihood, and that cell is incoherent here: impact 1 is defined as no reader or visitor effect, so there is nothing for an almost-certain likelihood to deliver. This constraint is enforced by the scoring agent, not by the commit hook: the hook compares the product only and cannot see how a 5 was composed.

See Amendment History for how this boundary moved and why.

## Impact Levels

| Level | Label | Description |
|-------|-------|-------------|
| 1 | Negligible | No visitor or reader impact. Site behaviour, content, newsletter pipeline, and availability unchanged. |
| 2 | Minor | No visitor or reader impact. Dev tooling, hooks, or local build affected, but the published site and newsletter pipeline are unaffected. |
| 3 | Moderate | Static-site visitor degradation, OR newsletter pipeline disruption that does not reach readers. Blog or home page degraded or inaccessible (the static site is the hub for the LinkedIn-distributed newsletter and Tom's writing; the consulting funnel and its CTAs are retired per ADR-041). Netlify build broken or delayed. Newsletter pipeline broken before draft generation (caught before publish, rescheduling possible). Confidential business metrics (revenue, subscriber counts, pricing, traffic volumes) committed to the public repository (information disclosure requiring immediate remediation but not yet affecting visitor-facing service). |
| 4 | Significant | Newsletter content quality failure caught at a gate, OR site fully offline. Newsletter draft pipeline ships poor-quality content past one of the voice, content-risk, SW-critic, or editor gates (caught at finalise but indicates gate weakness). Published newsletter on LinkedIn renders incorrectly or contains broken links. Site fully offline (LinkedIn-newsletter article links break; credibility hit at the destination of the funnel). |
| 5 | Severe | Newsletter content failure reaching LinkedIn readers (the primary channel), OR catastrophic content / trust / security failure on visitor surface. Newsletter content factually wrong or misrepresenting sources reaches LinkedIn readers. Voice-violating outbound copy that frames readers' teams as behind. Misleading or factually wrong content reaching site visitors. Broken accessibility (WCAG AA violation reaching readers or visitors). Exposed secrets or credentials. |

## Amendment History

**2026-08-07, appetite boundary moved from `< 5` to `5 or below` (Tom's direction).** The old boundary put the whole of the Medium band out of reach and could not distinguish a residual of 5 from one of 9. The only cell it newly admits is severe impact at likelihood 1: a 5-impact risk that a named control has driven to Rare. A negligible-impact risk at likelihood 5 also multiplies to 5, but the likelihood-1 constraint above excludes it, so it is not admitted and must still be reduced. It does not admit 6 through 9, which remain the genuinely multi-dimensional Medium risks the solo-operator rationale excludes. This reverses a position recorded on 2026-07-12 that read "stay below Medium" as strictly `< 5`; the reversal is deliberate, not an oversight.

At the time of that amendment the label bands below still read `5-9 Medium`, so a residual of exactly 5 was an accepted Medium rather than a Low. The 2026-08-09 amendment below closes that gap; the composition constraint survives it.

**2026-08-09, label bands adopt the `3-5 Low / 6-9 Medium` shape (Tom's direction).** Low was `3-4` and Medium was `5-9`; Low is now `3-5` and Medium `6-9`. The only score whose label changes is 5. This matches the band table in the scoring agent that reads this policy (`packages/risk-scorer/agents/pipeline.md`, which has carried `3-5 Low, 6-9 Medium` since the upstream `agent-plugins` decision ADR-086 of 2026-06-25). Until now the policy and the agent scoring against it disagreed about what a 5 was called, so a change that scored exactly 5 was printed as `5/25 (Medium)` and read as a Medium waved through at the boundary, rather than as what it is: a Low at the top of its band, within a Low appetite.

**This changes no pass/fail outcome.** The commit gate compares the product against the threshold, and the threshold is unchanged at 5. Nothing that was blocked now passes, and nothing that passed now blocks. What changes is the label the assessment prints and the sentence in this section that justifies it. The composition constraint above is kept for the same reason it was written, so the one cell the band move might otherwise have opened (impact 1 at likelihood 5) stays closed.

**Worked cases.** A newsletter change whose severe-impact risk is driven to Rare by named gates scores `5 x 1 = 5`. Before: `5/25 (Medium)`, admitted only by the carve-out paragraph, and readable as a bypass. After: `5/25 (Low)`, at the top of the Low band, within a Low appetite, on its merits. A newsletter change whose moderate-impact risk is only partly covered scores `3 x 2 = 6`. Before: `6/25 (Medium)`, above appetite, STOP. After: `6/25 (Medium)`, above appetite, STOP. Unchanged, which is the point: the band moved by one score, not the bar.

**Correction recorded in the same change.** The reason originally put to Tom for raising this was that the Impact Levels table rates any reader-facing copy change 5, making newsletter commits structurally un-passable. That is not what the table says: impact 5 requires the failure to reach readers, so a commit to an unpublished draft is impact 4 at most and usually 3. The claim came from a P120 iteration summary and was repeated several times without reading the table. This amendment does not rest on it.

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
| 3-5 | Low |
| 6-9 | Medium |
| 10-16 | High |
| 17-25 | Very High |

This risk matrix is the single source of truth for both the **risk-scorer agent** (pipeline risk assessment for commit, push, release) and the **problem management process** (problem severity classification via the manage-problem skill).

## Action-Specific Risk

The risk appetite (5 or below) applies uniformly to all pipeline actions: commit, push, and release. We are delivering change into production; the threshold does not change based on which stage the change is at. CI controls and preview deploys are mitigating controls that reduce residual risk, not reasons to accept higher risk.

The risk scorer assesses the accumulated change at each stage, not just counts of commits or files. It must understand what the changes are to judge their impact and likelihood.

## Back-Pressure

Each action must consider its effect on the next queue downstream. WIP accumulation acts as back-pressure through the pipeline:

- Do not commit if the accumulated unpushed changes (including this commit) would have risk > 5
- Do not push if the accumulated unreleased changes (including this push) would have risk > 5
- Exception: actions that reduce downstream risk bypass back-pressure (e.g. adding tests when release risk is high)
