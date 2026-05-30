---
status: "proposed"
first-released:
date: 2026-05-10
human-oversight: confirmed
oversight-date: 2026-05-30
decision-makers: [Tom Howard, Claude]
consulted: [wr-risk-scorer:policy agent]
informed: []
---

# Encode newsletter primacy in the risk Impact rubric

## Context and Problem Statement

`RISK-POLICY.md` Business Context (line 15) names the LinkedIn newsletter (The Shift / Tokens Spent) as "the primary lead-generation channel". The Impact rubric did not encode this: newsletter and static-site visitor surfaces both sat at Level 4 Significant, with no asymmetry between the primary channel and the supporting reference material.

Downstream, this produced two problems:

1. **Folklore weight on tickets.** A 2026-05-02 user direction declared "newsletter is primary repo activity" and per-ticket WSJF annotations of `(weight 2.0: newsletter is primary repo activity per 2026-05-02 direction)` started appearing on Open newsletter tickets (P034, P037, P039, P043, P044, P036, P038, P040, P041). The 2026-05-08 retro flagged this as folklore: there was no codified rule, the multiplier coincidentally matched the upstream Known-Error Status Multiplier (also 2.0), and the application was inconsistent. Some Open newsletter tickets had the annotation, some did not. P002 (a Known Error) was missing the legitimate upstream Known-Error multiplier entirely, scoring 12.0 instead of 24.0.

2. **Site CTA discipline drift.** ADR 023 paused all commercial funnel CTAs ("Book a vibe code audit", "Hire us") at "Fully booked". The static site became reference material for the LinkedIn-led funnel rather than an active conversion surface. The Impact rubric had not been updated to reflect this; it still rated "booking CTA degraded or inaccessible" at Level 4 Significant.

The rubric's Severity feeds the WSJF formula in upstream `wr-itil:manage-problem`:

```
WSJF = (Severity x Status Multiplier) / Effort
```

Severity is `Impact x Likelihood` from `RISK-POLICY.md`. Updating the Impact rubric to reflect newsletter primacy and CTA paused-state flows naturally through Severity, then through WSJF, with no formula change and no per-ticket folklore.

## Decision Drivers

- The 2026-05-02 newsletter primacy direction needs a codified home, not a per-ticket prose annotation that drifts.
- ADR 023's paused-CTA discipline means static-site degradation is no longer commercially equivalent to newsletter degradation.
- The upstream `wr-itil:manage-problem` WSJF formula is intentionally simple: `(Severity x Status Multiplier) / Effort`. Adding a windyroad-local Class Multiplier extension would fork the upstream formula and require maintenance every time the upstream evolved. Encoding primacy in `RISK-POLICY.md` instead keeps the formula upstream-clean.
- ISO 31000 compliance: the rubric should map business consequence to numeric level, not encode prioritisation policy via downstream multipliers.
- The 2026-05-08 retro's marquee finding (P052 ticket-family completeness) compounds when WSJF rankings under-represent the friction class people care about most. Re-tiering surfaces newsletter friction at the top of the queue automatically.

## Considered Options

1. **Re-tier newsletter up and static site down in the Impact rubric** (chosen). Encodes primacy as a structural rubric change. Newsletter content failures occupy L4 (caught at gate) and L5 (reaches readers); static-site degradation drops to L3 unless the site is fully offline (which lands at L4). Severity flows up; WSJF rises naturally; per-ticket folklore can be deleted.

2. **Add a Class Multiplier to the WSJF formula.** Extend `wr-itil:manage-problem` with a windyroad-local override: `WSJF = (Severity x Status x Class) / Effort`, where `Class = 2.0` for newsletter-class tickets and `1.0` otherwise. Codifies primacy outside the rubric. Con: forks the upstream formula, requires defining "newsletter-class" criteria as a separate rule (keyword vs JTBD-anchor), and creates a maintenance burden every time upstream evolves.

3. **Keep folklore but document the rule.** Write a CLAUDE.md or BRIEFING.md note saying "newsletter Open tickets get weight 2.0", but leave the per-ticket annotations as the implementation. Con: still no enforcement; new tickets opened by the assistant or user still need to remember to apply the weight; the inconsistency this ADR is closing would persist.

4. **Re-tier newsletter up only** (do not re-tier static site down). Bumps newsletter to L5 for content reaching readers, leaves static site at L4 for blog/founders/AI-Quality/Vibe-Code-Audit/booking CTA. Con: ignores ADR 023's paused-CTA reality; static-site issues continue to crowd the WSJF rankings at the same band as newsletter issues.

5. **Re-tier static site down only** (do not re-tier newsletter up). Drops static-site degradation to L3, leaves newsletter at L4. Con: under-represents the impact of newsletter content failures reaching LinkedIn readers, which is the highest-stakes failure mode in the project's actual operation.

## Decision Outcome

Chosen option: **1. Re-tier newsletter up and static site down**.

The new Impact rubric (`RISK-POLICY.md` lines 36-44):

- **L1 Negligible** and **L2 Minor**: unchanged.
- **L3 Moderate**: now covers static-site visitor degradation (named pages: blog, founders, AI Quality, Vibe Code Audit) AND newsletter pipeline disruption that does not reach readers. Plus the existing L3 cases (Netlify build break, confidential-info disclosure).
- **L4 Significant**: now covers newsletter content quality failures caught at gate (poor content past voice / content-risk / sw-critic / editor) AND newsletter rendering or link failures on LinkedIn AND site fully offline. Site offline lives here because LinkedIn newsletter posts link back to the site; total outage is a credibility hit at the funnel destination, not at the funnel itself.
- **L5 Severe**: now covers newsletter content failures reaching LinkedIn readers (factual error, source misrepresentation, voice-violating reader-respect failure) AND catastrophic visitor-surface failures (misleading content, accessibility violation, exposed secrets).

Confidential-information disclosure stays at L3. Likelihood rubric, risk matrix, label bands, and risk appetite (< 5) are unchanged. Validated PASS by `wr-risk-scorer:policy` against ISO 31000 distinguishability, monotonicity, groundedness, and downstream-consumer compatibility.

## Confirmation

This ADR's contract holds when:

1. `RISK-POLICY.md` Impact rubric encodes newsletter primacy: newsletter content failures reaching readers occupy L5, content failures caught at gate occupy L4, pre-publish pipeline disruption occupies L3.
2. Static-site degradation occupies L3 (named pages) and L4 (full outage) but does NOT occupy L5 unless the failure is content / trust / security severity equivalent.
3. The folklore "(weight 2.0: newsletter is primary repo activity per 2026-05-02 direction)" annotations on per-ticket WSJF lines are deletable: the per-ticket math should be `WSJF = (Severity x Status Multiplier) / Effort` per the upstream `wr-itil:manage-problem` formula, with no windyroad-local extension. Existing tickets carrying the annotation should drop it on next re-rate via `/wr-itil:review-problems`.
4. New problem tickets opened after this ADR lands score Severity from the new rubric; the Impact level chosen reflects the new asymmetry.
5. The 2026-05-02 user-direction prose claim ("newsletter is primary repo activity") is now codified in `RISK-POLICY.md`; future references should cite ADR 027 plus RISK-POLICY.md line 15 / line 43 / line 44 instead of "the 2026-05-02 direction".

## Consequences

### Positive

- Newsletter friction surfaces at the top of the WSJF queue automatically, without folklore.
- The upstream `wr-itil:manage-problem` formula stays clean.
- ADR 023's paused-CTA discipline is reflected in risk assessment, not just in the visible site.
- The 2026-05-08 retro's marquee finding (P052 ticket-family completeness) is partially closed: if newsletter Severity rises through the rubric, the friction class people care about no longer needs a sibling-family check to surface; it surfaces by default.

### Negative

- All existing problem tickets carrying the folklore annotation need re-rating. `/wr-itil:review-problems` is the right surface; it walks each ticket, applies the new rubric, and updates README WSJF rankings.
- Some newsletter tickets currently at Severity 12 or 16 will shift up under the new rubric (Significant to Severe is +1 Impact, +1 Severity at every Likelihood level); some site tickets will shift down. Net effect is a re-shuffle of the queue, not a uniform inflation.
- Ticket-creation discipline now requires reading the new rubric carefully; the previous symmetry was easier to apply mechanically.

### Neutral

- The risk appetite (< 5) is unchanged. Existing pipeline-action gates (commit / push / release) continue to operate against the same threshold; only the mapping from change to Severity changes for newsletter and static-site work.
- The 2026-05-02 direction's intent (newsletter is primary) is preserved verbatim; this ADR codifies the implementation, not the direction itself.

## Migration plan

1. **This commit**: ship `RISK-POLICY.md` rubric edit + this ADR. Bump line-5 last-reviewed date.
2. **Next pipeline step**: invoke `/wr-itil:review-problems` to walk every ticket, apply the new rubric, drop the folklore annotations from per-ticket WSJF lines, and refresh `docs/problems/README.md` rankings.
3. **Verification**: the migration is verified when (a) the README WSJF rankings reflect the new rubric (newsletter tickets move up, site tickets move down where applicable); (b) no per-ticket WSJF line carries the "(weight 2.0: ...)" folklore annotation; (c) P002's missing Known-Error multiplier is corrected (separate fix landing through the same review pass).

## Related

- `RISK-POLICY.md` (Impact rubric, lines 36-44; Business Context, line 15).
- ADR 023 (paused commercial funnel CTA discipline) sets the static-site-as-reference-material context this ADR depends on.
- `wr-itil:manage-problem` SKILL.md WSJF formula (`packages/itil/skills/manage-problem/SKILL.md` lines 75-110) is the formula this ADR is encoding for, without forking.
- `wr-itil:review-problems` SKILL is the migration surface for existing tickets.
- P052 (ticket-family completeness check missing before declaring friction done) is the 2026-05-08 retro's marquee finding; this ADR partially closes the WSJF-undersell symptom.
- BRIEFING.md "newsletter is primary repo activity per 2026-05-02 direction" prose annotation source.
