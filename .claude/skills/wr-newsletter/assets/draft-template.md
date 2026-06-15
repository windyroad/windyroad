# Draft template: The AI Engineering Brief

Use this structure when drafting a brief. Fill every placeholder in square brackets.

## Voice reminders

- Team voice: "we", not "I" (ADR 010).
- Direct, specific, confident.
- No em-dashes. Use commas, periods, colons, or parentheses.
- Each bullet: one sentence, under ~25 words. Split at the natural clause boundary when longer.
- Concrete verbs, specific nouns, verifiable claims.

## Formatting rules (LinkedIn readability)

- **Multi-event "What happened":** when an item aggregates two or more distinct events, use sub-bullets with one event per line, not a comma-separated run-on sentence.
- **Inline-link sources.** On LinkedIn, a `Source:` block of raw URLs renders as a wall of unclickable text. Inline-link the primary claim instead: "OpenAI released [Agents SDK v2](https://...)" reads cleaner than a trailing URL. Drop the separate `Source:` block once inline links are in place.
- **Section labels:** bold each section label (`**What happened:**`, `**Why it matters to your team:**`, `**The human angle:**`) so structure is visible before detail.
- Test against LinkedIn's narrow column width before assuming it reads. The IDE markdown preview is wider than LinkedIn's rendering.
- **Keep the preamble short.** Voice opener (2-3 sentences) + one short bridge sentence to the items is enough. Avoid a separate "three pressures" paragraph plus a "week's shift" paragraph plus the opener; that is too much distance between headline and first payoff.
- **Prefer 4-5 items over 6+.** If the week has more stories than that, demote the borderline ones to an "Also worth noting" section at the end, each as a single bolded-hook paragraph with inline links.

## Structural invariants (P089, P090, enforced by check-newsletter-structure.sh)

These seven are checked deterministically at save (step 16 runs `scripts/check-newsletter-structure.sh`). Produce them by construction so the lint passes first time:

1. **No trailing `**Source:**` block** in an item that already carries inline links. Inline-link the claim; do not also append a separate Source line. (The five LLM gates do not catch this; the lint does.)
2. **Do not name two or more outlets on a line without linking them.** "corroborated by Reuters, FT, NYT, and WSJ" is the banned shape. If an outlet is worth naming, link it ("The Wall Street Journal reported [headline](url)"); otherwise drop the name. A single back-reference to an already-linked article ("the WSJ piece is worth reading") is fine.
3. **Keep the `### Also worth noting` section.** It is the standalone closing coda; do not fold its content back into the items.
4. **H1 carries the `Issue NN:` prefix**, matching published editions: `# Issue 09: <POV one-liner>`, never `# <POV one-liner>` alone.
5. **A `---` horizontal rule precedes the closing CTA block.**
6. **Model names are consistent across the brief and the `.linkedin.md` sibling.** If the brief says "Gemma 4 12B", the LinkedIn post says "Gemma 4 12B", not "Gemma 4".
7. **No services-pitch sentence in the closing CTA.** The CTA block (after the final `---`) is the rotating invitation line plus the `windyroad.com.au` closing line only. Do not add a "Windy Road runs / helps / works..." or "Tokens Spent is / helps..." services-description sentence (P090; ADR-023 funnel pause).

## Structure

The draft frontmatter should include `edition: N` (integer, 1 for the first issue, incrementing weekly). The first edition (N=1) requires a welcome line above the voice opener orienting new subscribers; subsequent editions may carry fresh framing or omit the welcome line. The simplified critic (ADR 035) will flag a missing welcome line on edition 1 as a weakness.

```markdown
---
edition: 1
---

# Issue [N]: [UNIQUE ISSUE TITLE: a POV-carrying one-liner]

*The Shift, AI engineering, week ending YYYY-MM-DD*

[FIRST-EDITION ONLY: a welcome line orienting new subscribers. Example: "About The Shift: each issue covers what moved in AI engineering this week, what it means for engineering leaders, and where we think the industry is going. Opinions included. Published weekly, 4-5 stories plus shorter notes." Drop from edition 2 onwards, or replace with fresh framing; do not repeat verbatim each week.]

**From Tom**

[TWO TO THREE SENTENCES of author voice. Required. This is the thing that earns the subscriber's weekly attention. Pick one of:
- Something Tom saw in a client engagement this week (anonymised).
- A prediction or call he is willing to be wrong about.
- A piece of conventional wisdom in the AI-engineering category he wants to push back on.
Do NOT lead with news. Lead with a perspective. The drafter should attempt this and mark it "[DRAFT VOICE: Tom to replace]" if uncertain; the attempt is the scaffold, the published version is Tom's.]

[ONE-SENTENCE INTRO stating the theme of this week's items in plain industry language. The Wardley map is internal substrate (ADR 014); do NOT reference "the map", "position shifts", "evolution axis", or any map vocabulary. Example: "This week the agent-runtime layer fragments while coding assistants converge; three stories on what engineering teams are having to relearn."]

### Item 1: [HEADLINE, 6 TO 10 WORDS]

**What happened:**
  - [EVENT 1: named org, named artifact, date if relevant. One line.]
  - [EVENT 2: ...]
  - [EVENT 3: ...]

(Single-event items may use a one-line `**What happened:**` line instead of sub-bullets.)

**Why it matters to your team:** [ONE SENTENCE. Operational consequence framed as an external condition or a question to the reader, not as a judgement of the reader's team. The Wardley map movement informs what significance to emphasise here but is never named explicitly.]

**The human angle:** [ONE SENTENCE. Change management, psychology, hiring, morale, or organisational consequence.]

[SOURCING: inline-link each primary claim in the What-happened text above, e.g. "Anthropic [published a statement](https://...)". Do NOT append a separate `**Source:**` block; the inline links are the attribution. When you name an outlet, link it; never list two or more outlets without links (invariant 2 above).]

### Item 2: [HEADLINE]

(same structure)

### Item 3: [HEADLINE]

(same structure)

[Aim for 4-5 full items. Candidates that pass the filter but would push the brief past 5 full items can be demoted to "Also worth noting" (below).]

### Also worth noting

**[ONE-LINE HEADLINE-AS-BOLD-LEAD].** [Two or three sentences naming the event(s), the inline-linked source(s), and the Monday-actionable takeaway. No sub-bullets here; this is a compressed format for signal that matters but does not need the full what/why/human-angle frame.]

**[NEXT HEADLINE].** [Same format.]

---

[ONE-LINE INVITATION. Example: "Reply with what is breaking on your stack this quarter, or forward to a colleague who runs an engineering team." Vary the verb weekly; this is the subscribe-loop hook. Do NOT precede this with a Windy Road services-description sentence (P090): invitation + closing line only.]

windyroad.com.au
```

## CTA variants (pick one invitation each week)

The CTA is one rotating invitation plus the `windyroad.com.au` closing line only. There is no services-description variant (P090; ADR-023 funnel pause): do not add a "Windy Road runs / helps / works..." sentence.

**Invitation variants (pick one; rotate):**

- "Reply with what is breaking on your stack this quarter."
- "Forward this to a colleague who runs an engineering team."
- "Reply with a prediction you are willing to be wrong about."
- "Tell us the conversation you are having with your CTO this week."

## What NOT to do

- Do not write speculative claims without attribution. If uncertain, omit the item.
- Do not use hype words ("revolutionary", "game-changing", "unprecedented").
- Do not pad. Three items is the minimum, and there is no maximum: include every candidate that clears the filter AND anchors to a map movement. Two is acceptable only if three candidates did not clear the filter; note the shortfall in the summary.
- Do not link-dump. Every source link should have a one-sentence "What happened" anchoring it.
- Do not pack multiple events into one sentence. Sub-bullet instead.
- Do not comma-separate source URLs. One URL per line.
