# Three-lens filter with Wardley preference

> **2026-05-12 (P043 update)**: Lens definitions tightened so each lens REQUIRES a named action the `<target-reader>` should take this quarter, drawn from the persona-conditional action vocabulary below. The leader-relevance check that previously lived as a post-filter qualifier on the prioritisation rule is now absorbed inside each lens; the post-filter persona-specific check is dropped. A `named_action` field is required on every yes-scored lens. Three-tier prioritisation is preserved (the P016 no-map-anchor safety net stays); the third tier is rewritten so the lens-level `named_action` does the gating work instead of a hard-coded leader-persona check.

Every candidate story passes a three-lens score (technical, operational, human; pass on at least two of three). Each lens scores yes only when a `named_action` for the `<target-reader>` this quarter can be cited as one sentence; a lens with no nameable action scores no, regardless of topical fit. Candidates that also anchor to an observable Wardley landscape map movement are prioritised; candidates without a clean map anchor can still qualify on three-lens strength alone. Candidates whose only surviving source is a secondary aggregator are run through multi-outlet corroboration before the shortlist is finalised, so significant stories that first surface on aggregators are not silently dropped on attribution risk (P016).

## Persona-conditional action vocabulary (P043)

The `named_action` recorded for a yes-scored lens must come from the persona's action vocabulary. The pipeline binds `<target-reader>` and the persona-conditional vocabulary at step 0; both vocabularies live here so the asset is self-contained.

| `<persona>` | `<target-reader>` | Acceptable `named_action` types (this-quarter scope) |
|-------------|-------------------|------------------------------------------------------|
| `leader`    | Engineering Leader (CTO / Head of Engineering / VP Engineering); jobs JTBD-001 through JTBD-004 | procurement question; capability investment; risk audit; measurement update; hiring decision; role redesign; training investment; comms / change-management action; policy update |
| `developer` | Working Developer; jobs JTBD-200 through JTBD-205 | spot-test (half-day or less); adopt; pilot; watch; skip; time-box experimentation; abstain; re-evaluate evidence stance (shipped vs demo); change personal workflow / tool selection; raise-to-lead / champion-to-team / surface objection (upward-influence action class per JTBD-203) |

Vocabularies are non-exhaustive but illustrative. New actions are admissible if they match the persona's documented decision authority OR documented influence channel (`docs/jtbd/engineering-leader/persona.md` for leader, `docs/jtbd/developer/persona.md` for developer) and fall inside a quarter-scope horizon.

## Editorial stance: the human-in-the-loop question (P101)

A standing editorial conviction governs how every edition frames the human role around AI-generated code. The human contribution is ratification of architecture and product-direction decisions, kept off the delivery critical path, where it keeps software aligned with the business and heads off costly, hard-to-reverse mistakes. Code-level quality is carried at AI pace by automated gates and evals, not by gating delivery behind human code review. Human code review as the answer to AI-generated code pushes delivery back to human pace; the brief's own Issue 06 ("more review will not fix AI slop") already argued this position, and later editions drifted off it.

Apply this when scoring the `named_action` for any story about AI-generated code, team capability, or oversight: do NOT record "measure review throughput", "add a human review gate", or any "more human code review" framing as the response. Prefer the ratification-and-gates framing: an architecture or product-direction ratification decision, an automated-gate or eval investment, or a measurement update tied to shipped outcomes rather than review volume. The persona action vocabularies above already encode this (procurement question, risk audit, policy update for the leader; adopt, pilot, watch, skip and evidence-stance re-evaluation for the developer); none of them is "do the review by hand".

## Wardley map anchoring (preference, not precondition)

The Wardley landscape map (`docs/ai-engineering-brief/ai-landscape.owm`) is the primary qualification path. A candidate anchors to a map movement when it triggers one of:

- A component's evolution position shifts (for example, AI Coding Assistants moving further toward commodity).
- A new component appears that the map does not yet show.
- A component disappears or merges with another.
- A dependency is added, removed, or redirected.
- An existing map position is reinforced by new evidence worth naming.

Tag each candidate as `MAP_ANCHORED` or `NO_MAP_ANCHOR` during the filter step. Map-anchored candidates get priority. Candidates without a clean map anchor can still qualify if they are three-lens-strong (significant on all three lenses, or significant-plus-clearly-relevant on two lenses) and matter to the Engineering Leader persona: an AI incident, a notable personnel move, a social dynamic inside engineering teams, a legal shift that does not map to a named component.

Prioritisation rule: map-anchored candidates first, three-lens-strong candidates second. A week with zero map-anchored items is a signal that either the map needs new components or the week genuinely had no landscape movement; surface this in the Tom-summary. A month where every item is three-lens-only (no map anchors) is a signal that the filter is dropping the substrate discipline; revisit the map.

## Corroboration for aggregator-only candidates (P016)

A three-lens-strong candidate whose only surviving source is a secondary aggregator (AI Daily Brief, Stratechery, Casey Newton, podcast notes, letsdatascience.com) passes through a corroboration step before the shortlist is finalised. The instinct to deprioritise on attribution risk is correct in isolation but wrong when multi-outlet primary coverage is one query away: that is the failure mode that dropped the Tim Cook transition from the 2026-04-24 edition.

Trigger: the candidate is tagged `NO_PRIMARY_SOURCE` at intake (the only URLs on the candidate are aggregator domains, not tier-1 outlets like Anthropic, OpenAI, DeepMind, or the primary-outlet allowlist below) AND scored yes on at least two lenses.

Corroboration mechanism: run one Google News RSS query scoped to the named entity in the candidate title. The same mechanism is already established in the pipeline for OpenAI tier-1 fallback (see `docs/ai-engineering-brief/ai-landscape.md` Source-coverage notes and P010).

```
WebFetch https://news.google.com/rss/search?q=<url-encoded-named-entity>&hl=en-US&gl=US&ceid=US:en
```

Extract the top 5-10 items. For each: outlet (publisher), headline, URL, date.

Primary-outlet allowlist (a non-exhaustive reference list; any major wire or established publisher counts):

- International wires: Reuters, Associated Press (AP), Bloomberg, Financial Times
- US general news: NYT, Washington Post, Wall Street Journal, LA Times, CNN, CNBC, NBC News, ABC News, CBS News
- UK and Europe: BBC, The Guardian, The Times, Le Monde, Der Spiegel
- Trade and tech (with primary reporting, not aggregation): The Information, The Verge, Ars Technica, TechCrunch, Wired

Aggregator re-posts of the same wire story do NOT count as distinct outlets. Distinct means distinct publisher domain AND distinct reporting (quick sanity check: if outlet B opens with "per Reuters," B is a re-post, not an independent source).

Threshold:

- **3+ distinct primary outlets** covering the named entity in the last 10 days: tag the candidate `CORROBORATED_PRIMARY`. Attach the 3 strongest outlet/URL pairs as candidate metadata. Treat the candidate as primary-sourced from here on; the final Source line cites the aggregator that originally surfaced the story plus one or two primary outlets.
- **0 to 2 distinct primary outlets**: tag the candidate `WEAK_ATTRIBUTION`. Do NOT silently drop. Carry on a separate weak-attribution list that step 10 of the pipeline surfaces to Tom for keep/drop/ask-for-help resolution.

Runtime cost: corroboration fires only on candidates that are (a) three-lens-strong AND (b) aggregator-only at intake. Tier-1-sourced candidates bypass this step; weak three-lens candidates have already been dropped. The expected fan-out is 0-2 Google News queries per edition in a typical week, bounded above by the shortlist length in a heavy aggregator-only week.

## Lens 1: Technical

Does this represent a meaningful capability change in AI models, tools, or infrastructure that the `<target-reader>` must act on this quarter?

Score **yes** if: a new model was released, a known model gained a new capability, a major developer tool shipped or broke, a security vulnerability was disclosed, or a research result materially changes what is possible AND a named action from the persona-conditional action vocabulary can be cited as one sentence (the action the `<target-reader>` should take this quarter, recorded as `named_action` on the candidate). For leader persona, this is typically a procurement question, capability investment, risk audit, or measurement update; for developer persona, a spot-test, adopt/pilot/watch/skip judgement, or evidence-stance re-evaluation.

Score **no** if: incremental update, rebrand, blog post summarising prior work, speculation without a shipping artifact, OR no `<target-reader>` action can be named in one sentence from the persona-conditional vocabulary.

## Lens 2: Operational

Does this change how an engineering team should build, deploy, test, or secure software in a way the `<target-reader>` must act on this quarter?

Score **yes** if: there is a concrete implication for how developers write code, how teams run pipelines, how security posture needs to shift, or how delivery practices need to adapt AND a named action from the persona-conditional action vocabulary can be cited as one sentence (recorded as `named_action` on the candidate). For leader persona, this is typically a measurement update, policy update, capability investment, or comms / change-management action; for developer persona, an adopt/pilot/watch/skip judgement, time-box experimentation, or change to personal workflow / tool selection.

Score **no** if: the story is interesting but has no direct actionable implication for engineering practice OR no `<target-reader>` action can be named in one sentence from the persona-conditional vocabulary.

## Lens 3: Human

Does this affect how engineering leaders manage their teams, how developers feel about their work, or how organisations need to adapt in a way the `<target-reader>` must act on this quarter?

Score **yes** if: the story touches change management, role redesign, hiring implications, developer anxiety or motivation, org structure, organisational psychology, or the sociology of technology adoption AND a named action from the persona-conditional action vocabulary can be cited as one sentence (recorded as `named_action` on the candidate). For leader persona, this is typically a hiring decision, role redesign, training investment, comms / change-management action, or policy update; for developer persona, an upward-influence action (raise-to-lead, champion-to-team, surface objection per JTBD-203), an abstain decision, or a change to personal workflow.

Score **no** if: the story is purely technical with no visible human or organisational consequence, OR no `<target-reader>` action can be named in one sentence from the persona-conditional vocabulary.

## Scoring rule

- Score each candidate on all three lenses: yes or no.
- For each lens scored yes, record `named_action: <one-sentence>` in candidate metadata. The sentence MUST name the action the `<target-reader>` should take this quarter from the persona-conditional action vocabulary above. A lens with no nameable action in the persona-conditional vocabulary scores no, regardless of topical fit.
- Tag each candidate as `MAP_ANCHORED` or `NO_MAP_ANCHOR`.
- Tag each aggregator-only candidate as `CORROBORATED_PRIMARY` (3+ distinct primary outlets confirmed via Google News), `WEAK_ATTRIBUTION` (0 to 2 primary outlets; surface to Tom at step 10 for keep/drop), or skip the corroboration tag if the candidate has a tier-1 primary source already. P016.
- Keep candidates scoring yes on at least two lenses.
- Prioritise in this order: (1) map-anchored and all-three-lens, (2) map-anchored and two-lens, (3) no-map-anchor but all-three-lens AND `named_action` recorded for `<target-reader>` on all three lenses. The third tier preserves the P016 no-map-anchor safety net for stories that lack a clean Wardley anchor but are genuinely actionable for the persona this quarter; the lens-level `named_action` requirement does the gating work that the prior post-filter "significant for the Engineering Leader persona" check used to do (and does it for both personas instead of only leader). `CORROBORATED_PRIMARY` candidates rank alongside equivalent tier-1-sourced candidates within each band; `WEAK_ATTRIBUTION` candidates do NOT enter the main shortlist until Tom adjudicates them at step 10.
- Include every significant candidate in the brief. There is no upper cap; minimum three. If fewer than three candidates clear the bar, note the shortfall in the summary rather than padding. Significance means the candidate represents a meaningful change for the `<target-reader>` with a nameable action this quarter.

## Target audience reminder

The `<target-reader>` is bound at step 0 from the persona config. For `persona=leader`, the reader is an Engineering Leader (CTO, Head of Engineering, VP Engineering) at a mid-to-large organisation. Credential-sensitive. Responsible for delivery pipeline, security posture, and team capability. For `persona=developer`, the reader is a Working Developer operating inside a tokens-vote budget with upward-influence channels per JTBD-200 through JTBD-205. Scores should reflect what THIS reader would care about and act on this quarter, not what the tech press finds shareable.
