# Three-lens filter

Every candidate story is scored against three lenses. A story makes the brief only if it scores on at least two of three. Stories that hit all three are prioritised.

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
- Keep only candidates scoring yes on at least two lenses.
- Among the kept candidates, prioritise those scoring yes on all three.
- Select three items for the brief. If fewer than three candidates clear the bar, note the shortfall in the summary for Tom rather than padding.

## Target audience reminder

The reader is an Engineering Leader (CTO, Head of Engineering, VP Engineering) at a mid-to-large organisation. Credential-sensitive. Responsible for delivery pipeline, security posture, and team capability. Scores should reflect what THIS persona would care about, not what the tech press finds shareable.
