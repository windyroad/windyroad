# Three-lens filter with Wardley preference

Every candidate story passes a three-lens score (technical, operational, human; pass on at least two of three). Candidates that also anchor to an observable Wardley landscape map movement are prioritised; candidates without a clean map anchor can still qualify on three-lens strength alone.

## Wardley map anchoring (preference, not precondition)

The Wardley landscape map (`docs/ai-engineering-brief/ai-landscape.owm`) is the primary qualification path. A candidate anchors to a map movement when it triggers one of:

- A component's evolution position shifts (for example, AI Coding Assistants moving further toward commodity).
- A new component appears that the map does not yet show.
- A component disappears or merges with another.
- A dependency is added, removed, or redirected.
- An existing map position is reinforced by new evidence worth naming.

Tag each candidate as `MAP_ANCHORED` or `NO_MAP_ANCHOR` during the filter step. Map-anchored candidates get priority. Candidates without a clean map anchor can still qualify if they are three-lens-strong (significant on all three lenses, or significant-plus-clearly-relevant on two lenses) and matter to the Engineering Leader persona: an AI incident, a notable personnel move, a social dynamic inside engineering teams, a legal shift that does not map to a named component.

Prioritisation rule: map-anchored candidates first, three-lens-strong candidates second. A week with zero map-anchored items is a signal that either the map needs new components or the week genuinely had no landscape movement; surface this in the Tom-summary. A month where every item is three-lens-only (no map anchors) is a signal that the filter is dropping the substrate discipline; revisit the map.

## Lens 1: Technical

Does this represent a meaningful capability change in AI models, tools, or infrastructure?

Score **yes** if: a new model was released, a known model gained a new capability, a major developer tool shipped or broke, a security vulnerability was disclosed, or a research result materially changes what is possible.

Score **no** if: incremental update, rebrand, blog post summarising prior work, or speculation without a shipping artifact.

## Lens 2: Operational

Does this change how an engineering team should build, deploy, test, or secure software?

Score **yes** if: there is a concrete implication for how developers write code, how teams run pipelines, how security posture needs to shift, or how delivery practices need to adapt.

Score **no** if: the story is interesting but has no direct actionable implication for engineering practice inside a team.

## Lens 3: Human

Does this affect how engineering leaders manage their teams, how developers feel about their work, or how organisations need to adapt?

Score **yes** if: the story touches change management, role redesign, hiring implications, developer anxiety or motivation, org structure, organisational psychology, or the sociology of technology adoption.

Score **no** if: the story is purely technical with no visible human or organisational consequence.

## Scoring rule

- Score each candidate on all three lenses: yes or no.
- Tag each candidate as `MAP_ANCHORED` or `NO_MAP_ANCHOR`.
- Keep candidates scoring yes on at least two lenses.
- Prioritise in this order: (1) map-anchored and all-three-lens, (2) map-anchored and two-lens, (3) no-map-anchor but all-three-lens AND significant for the Engineering Leader persona.
- Include every significant candidate in the brief. There is no upper cap; minimum three. If fewer than three candidates clear the bar, note the shortfall in the summary rather than padding. Significance means the candidate represents a meaningful change for the Engineering Leader persona.

## Target audience reminder

The reader is an Engineering Leader (CTO, Head of Engineering, VP Engineering) at a mid-to-large organisation. Credential-sensitive. Responsible for delivery pipeline, security posture, and team capability. Scores should reflect what THIS persona would care about, not what the tech press finds shareable.
