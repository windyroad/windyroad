# Ask Hygiene: 2026-08-23 P141 AFK iteration

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | (none) | (none) | No `AskUserQuestion` call was made. The iteration ran under the `/wr-itil:work-problems` AFK orchestrator, which forbids the tool outright. Three decisions warranting a human were queued to `outstanding_questions` per the AFK carve-out in the decision-delegation contract (upstream ADR-044 in agent-plugins, NOT the local ADR-044, which is a newsletter gate): which staleness detector to adopt for GitHub Actions refs, ratification of ADR-055, and whether to draw the repository's first story map. |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

Note for the R6 numeric gate: this is the fourth consecutive AFK retro to report zero, and the zero remains a structural property of the surface rather than evidence the declarative approach is working. All three queued items would have been category-1 direction asks on an interactive surface, and the staleness-detector one would have been a substance-confirm-before-build ask under the confirm-substance-before-building rule (upstream ADR-074 in agent-plugins; there is no local 074), since the local ADR-055 records the options without picking one. Reading this trend as passing would be reading the constraint, not the behaviour.
