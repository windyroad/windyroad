---
status: "proposed"
first-released: 2026-07-07
date: 2026-04-17
human-oversight: confirmed
oversight-date: 2026-05-30
decision-makers: [Tom Howard, Claude]
consulted: []
informed: []
related: [010-team-voice-positioning, 012-ai-generated-content-review-gates]
reassessment-date: 2026-07-17
---

# Reader-respect clause and gate-rejection policy for AI-generated content

## Context and Problem Statement

ADR 012 established mandatory voice and content-risk review gates for AI-generated content, with four content-risk axes: factual, reputational, claims, attribution. The first run of the `/wr-newsletter` skill (2026-04-17) produced a draft containing a disparaging line about the reader's team: "your team's build, review, and testing assumptions probably trailed 4.6 by weeks, so they trail 4.7 by more." The wr-voice-tone subagent returned PASS and the inline content-risk scorer returned `reputational=medium`. Neither gate rejected the draft. Tom flagged the line as disparaging toward the Engineering Leader persona (credential-sensitive per `docs/JOBS_TO_BE_DONE.md`) and said the gates must reject drafts that frame the reader's team as behind, slow, or negligent, not merely annotate them.

Two gaps surfaced:

1. `docs/VOICE-AND-TONE.md` bans "dismissing the reader's tools" but does not ban disparaging the reader's team. The wr-voice-tone subagent had nothing concrete to fail on.
2. ADR 012's confirmation criteria specify that failing drafts are "flagged with severity" but do not specify whether `high` severity blocks publication. The current skill saves and annotates in all cases.

## Decision Drivers

- **Credential sensitivity of the target persona.** The Engineering Leader persona in `docs/JOBS_TO_BE_DONE.md` is explicitly credential-sensitive. Disparaging their team reads as an attack on their stewardship and destroys the J3 (Evaluation) social dimension: readers cannot forward content that implies their own team is negligent.
- **Defence in depth.** Reader-respect is both a voice concern (how we speak) and a content-risk concern (what reputational damage a published disparagement causes). Covering it in both gates is consistent with ADR 012's "systematically different failure modes" rationale.
- **Verdict clarity.** Gate output today is advisory scoring. A loud `REJECTED` signal is cheaper for Tom to act on than a `reputational=medium` annotation that still reads like a save.
- **False-positive risk.** Reader-respect is the axis most likely to false-positive on legitimate capability-gap framing. The policy must be revisitable if the gate becomes cynical.
- **Reuse, not replacement.** The existing wr-voice-tone subagent and the inline content-risk scorer both stay. We refine the inputs (banned patterns) and the output (verdict semantics).

## Considered Options

1. **Reader-respect clause in VOICE-AND-TONE.md + new reader-respect axis in content-risk review + any-high-axis-is-REJECTED policy** (chosen). Adds the clause to the shared voice guide, adds a fifth axis to the content-risk block, and introduces a verdict field. Any axis scoring `high` produces `VERDICT: REJECTED`. Drafts are still saved so Tom can review, but `REJECTED` drafts must not be published as-is.
2. **Skill-local rule only.** Put the reader-respect check only in `.claude/skills/wr-newsletter/SKILL.md`. Rejected: future outbound content (blog posts, social, landing page copy) would not inherit the rule.
3. **Harden ADR 012's existing axes without adding a new one.** Redefine `reputational` to include disparagement of the reader. Rejected: the existing definition is about "dismissive tone toward a company" and "punching down," which is close but not identical. A named `reader-respect` axis is clearer and easier to audit.
4. **Hard block (do not save REJECTED drafts).** Rejected: Tom wants to see what the skill produced even when it fails, so he can learn what kinds of copy the model drifts into. "Save but mark REJECTED" preserves the learning loop while removing ambiguity about whether to publish.

## Decision Outcome

Chosen option: **"Reader-respect clause in VOICE-AND-TONE.md + new reader-respect axis in content-risk review + any-high-axis-is-REJECTED policy"** because it uses the cheapest existing surfaces (a guide the voice agent already reads; an axis in a block the skill already emits), covers the failure in both gates (defence in depth), and gives Tom a clear `REJECTED` signal without removing the ability to inspect rejected drafts.

This is not a supersession of ADR 012. ADR 012 established the architecture (gates run, specialists are reused, output is saved alongside drafts). ADR 015 refines the decision policy (what a gate verdict means) and extends the axes set. ADR 012 stays in force.

## Scope

**In scope (rejected):**
- Framing that attributes fault, negligence, or inferiority to the reader's specific team.
- "Your team probably..." / "you're already behind" / "most teams don't..." formulations that assume reader inadequacy.
- Implied judgments that the reader's current practice is substandard.

**Out of scope (allowed):**
- Describing industry baselines, shared conditions, or external threats that affect the reader. Example: "Patch cycles for enterprise teams are typically measured in weeks" is a statement about the industry, not an accusation.
- Naming the reader's felt situation bluntly, consistent with VOICE-AND-TONE's "Empathetic, not flattering" clause. Example: "Your vibe-coded app is in production. Something keeps breaking" describes a situation, not a competence judgment.
- Direct technical critique of tools, vendors, or approaches (bounded by the existing "Never dismiss a tool or approach the visitor is using and likes" rule).

The boundary: **describe the situation and the external world in direct language; do not pass judgment on the reader's team's competence or diligence.**

## Consequences

### Good

- Engineering Leader persona's credential-sensitivity is protected structurally, not just by reviewer judgment.
- J3 (Evaluation) social dimension is preserved: readers can forward content without self-incrimination.
- Two gates catch the same class of failure, so a single-gate false negative does not ship a bad draft.
- `REJECTED` verdict is machine-readable. Future archive surfaces (PLAN layer 7) and retrospectives can filter on it.
- Policy is explicit about in-scope and out-of-scope framing, so the axis does not become a blanket ban on directness.

### Neutral

- Content-risk block grows from four axes to five. Marginal tokens per draft.
- One more banned pattern to maintain in VOICE-AND-TONE.md. Low ongoing cost.
- `REJECTED` is advisory. There is no automated publish in the current architecture (ADR 011 is interactive). The verdict guides Tom, not a CI gate. This may change if we ever automate publishing.

### Bad

- Reader-respect is the axis most prone to false positives (legitimate capability-gap framing can read as implied accusation). False positives waste Tom's time and erode trust in the gate.
- Gate authority overlap: voice gate and content-risk gate both check reader-respect. If they disagree (voice PASS + content-risk `reader-respect=high`), content-risk is authoritative because it produces `REJECTED`. This is documented but adds a nuance reviewers must remember.
- A `REJECTED` verdict might tempt Tom to override without rewriting. We mitigate by requiring rewrites for `REJECTED` drafts, not overrides.

## Confirmation

1. `docs/VOICE-AND-TONE.md` contains an explicit reader-respect clause under the principles section and a corresponding entry in the Banned Patterns table.
2. `.claude/skills/wr-newsletter/SKILL.md` step 7 lists five axes (factual, reputational, claims, attribution, reader-respect) with clear definitions.
3. The content-risk output block has this exact format:

   ```
   CONTENT_RISK: factual=<low|medium|high> reputational=<low|medium|high> claims=<low|medium|high> attribution=<low|medium|high> reader-respect=<low|medium|high>
   VERDICT: <PASS|REJECTED>
   Notes:
   - <flagged passage 1, or "no flags" if clean>
   - <flagged passage 2>
   ```

4. `VERDICT: REJECTED` is emitted whenever any axis scores `high`. All other combinations yield `VERDICT: PASS`.
5. The skill's step 9 Tom-summary surfaces `REJECTED` drafts prominently (e.g. "VERDICT: REJECTED. Do not publish as-is. Rewrite and re-run").
6. The skill's failure-modes section states that `REJECTED` drafts are advisory, not a hard publish block, but must not be published without rewrite.
7. After the first four weekly issues, the retrospective reviews reader-respect axis flags: total count, true positives, false positives. If false-positive rate exceeds 50% over the first four issues, revisit the axis definition or its verdict threshold (see Reassessment).

## Pros and Cons of the Options

### Reader-respect clause + fifth axis + any-high-is-REJECTED (chosen)

- Good: defence in depth (both gates); machine-readable verdict; applies to all outbound content via VOICE-AND-TONE.md
- Good: explicit scope carve-out prevents the axis from banning legitimate directness
- Good: save-but-reject preserves the learning loop
- Bad: new axis prone to false positives on capability-gap framing
- Bad: dual-gate coverage introduces an authority-precedence rule reviewers must remember

### Skill-local rule only

- Good: smaller blast radius
- Bad: future outbound content (blog, social, landing pages) loses the rule
- Bad: divergence risk if the rule evolves

### Harden reputational axis instead of adding reader-respect

- Good: no new axis to maintain
- Bad: muddies the reputational axis (which is about third parties, not the reader)
- Bad: harder to audit which failures are reader-respect vs. company-disparagement

### Hard block (do not save REJECTED)

- Good: unambiguous
- Bad: Tom loses visibility into what the model drifted toward
- Bad: removes a learning signal that feeds retrospective improvement

## Reassessment Criteria

- After 4 weekly issues: review reader-respect axis flag counts. If false-positive rate exceeds 50%, or if the axis has never produced a true positive in that window, revisit the definition, the scope clause, or the verdict threshold.
- If VOICE-AND-TONE.md evolves such that reader-respect is already covered by a broader principle, fold the banned-patterns entry into that principle.
- If automated publishing is introduced (ADR 011 currently keeps publishing interactive), reassess whether `REJECTED` should become a hard block rather than advisory.
- If a new content surface (blog, social, landing page AI drafts) shows the rule produces different false-positive rates, consider per-surface thresholds.
