# Wardley artifact critic rubric

Applies to updates of `docs/ai-engineering-brief/ai-landscape.owm` and `docs/ai-engineering-brief/ai-landscape.md`. The critic scores the artifact against these checks and returns the structured block defined by `.claude/agents/wr-sw-critic.md`. Rubric lifted from `wr-wardley:generate`'s analysis quality rules, adapted for an external-landscape map rather than a codebase map, and extended with checks specific to the newsletter pipeline.

## Scope

The critic reviews both files together: the `.owm` source and the `.md` analysis. References from the analysis to positions in the map must be consistent with the map. References from the map to components in the analysis must be consistent with the analysis.

## Checks

### check_1: No inventory

The analysis does not list component counts, source counts, or file counts. It states what positions *mean* for investment, risk, or action. If any sentence reads like "we have 12 components," score UNMET.

### check_2: Phase naming matches evolution position

Each component's described phase (Genesis, Custom-Built, Product, Commodity) matches its evolution coordinate in the `.owm` file, using these boundaries: Genesis 0.00 to 0.17, Custom-Built 0.17 to 0.37, Product 0.37 to 0.63, Commodity 0.63 to 1.00. If a component is described as "Product" but its evolution is 0.28, score UNMET.

### check_3: Risks have observable triggers

Every risk in the Risk section names a trigger (what event or observation activates the risk) and a consequence (what breaks). "Low risk" is not analysis. "Pricing changes" is a condition, not a trigger. "A hosting provider announces a deprecation or a pricing change above 20%" is a trigger. Score UNMET for any risk without a named trigger.

### check_4: Decisions limited to two, stated as trade-offs

The Decisions section identifies at most two strategic choices. Each choice is stated as a trade-off (two actions competing for the same resource, or a go-signal against a reassess-signal). If there are three or more decisions, or if any decision is a solo statement without a competing option, score UNMET.

### check_5: Evidence for recommendations

Every recommended action (invest in X first, wait on Y, move Z) names the evidence that supports it and what would need to change to revisit. "Invest in Engineering Team Capability" without a basis is UNMET. "Invest in Engineering Team Capability because four downstream dependencies compound through it, and revisit if any of those dependencies commoditise" is MET.

### check_6: Every section ends with implications

Each of Differentiation, Evolution, Risk, Decisions closes with a sentence stating what an engineering leader should do differently, protect, or watch as a result of the analysis. Description without implication is UNMET.

### check_7: Internal risk with number and time window

The Risk section includes at least one risk the reader directly controls (for example, underinvestment in a differentiating component, or evaluation cadence dropping). The trigger for that internal risk includes a number and a time window. "Output drops" is UNMET. "Fewer than one model-evaluation run for any four consecutive weeks" is MET.

### check_8: Commodity-layer risk

The Risk section includes at least one risk from the commodity layer of the map. Name the trigger, the affected components, and the fallback. Do not treat commodities as zero-risk. UNMET if no commodity-layer risk is addressed.

### check_9: All custom components appear in Differentiation

Every component in Genesis or Custom-Built phase on the map is discussed in the Differentiation section. Silently omitting a custom component is UNMET. If a custom component has fragile internals or platform dependencies, that fragility is named.

### check_10: Visible dependencies covered in prose

Every dependency between components with visibility above 0.7 is mentioned in the analysis. If a dependency link appears on the map but not in the text, either remove the link or explain its role. UNMET if a high-visibility dependency is silent.

### check_11: Triggers are measurable today

Every trigger (for risks and decisions) is something an engineering leader or the newsletter skill can observe with existing tools and data. Triggers that require new infrastructure to measure (test suites that do not exist, monitoring not deployed) must say so explicitly and name the prerequisite. UNMET if a trigger is an unobservable hypothesis.

### check_12: No project-specific names in decisions

Decision triggers and reassess triggers are stated generically. Do not name specific external projects, people, or organisations in Decisions. "When three internal teams ask for a harness" is MET. "When the Greater Bank team asks" is UNMET. The analysis should remain valid if read by a reader outside the immediate team.

### check_13: Anchor describes a need, not a role

The `anchor` line in the `.owm` states an outcome the reader has after using the map, not a role or a capability offered. "Ship Software Under AI Disruption" is MET. "The Reader" or "Engineering Leader Advisory" is UNMET.

### check_14: Evolution arrows are justified in prose

Every `evolve` arrow in the `.owm` file has a corresponding sentence in the Evolution section of the analysis explaining why that component is moving and what that movement means for the reader. UNMET if an evolve arrow appears on the map but is not explained, or if a movement is claimed in prose but has no arrow on the map.

### check_15: Newsletter lens

The analysis is usable as context for drafting the weekly brief. Specifically, at least one sentence in each of Differentiation, Evolution, and Risk is phrased in a way that a brief item could point back to it. If the analysis reads as a standalone Wardley treatise with no connection to weekly-news interpretation, score UNMET.

### check_16: Week-on-week delta visibility

The analysis calls out what moved *this week* (or, on the first issue, establishes the baseline). If the file appears unchanged from last week's version and the update step was run, either the map did not move (in which case the brief must note it), or the analysis was not updated. Cross-check via `git diff` on the `.owm` file if available. UNMET if the `.owm` file shows movement but the `.md` does not explain it.

## Round-specific exit criteria

- **Round 1:** score all 16 checks. Report all UNMET and PARTIAL checks.
- **Round 2:** in addition to scoring all 16 checks, confirm each round-1 weakness was addressed. If a round-1 weakness persists, mark it `PARTIAL: still unmet from round 1` in the WEAKNESSES block.
- **Round 3:** as round 2. Any remaining UNMET or PARTIAL triggers `VERDICT: REJECTED` with `REJECTED_REASON: critic-loop-exhausted`.

## Strengths to look for

These are not scored but should be highlighted when present:

- Sections that explicitly flag a trade-off the reader would otherwise miss.
- Risks where the fallback is concrete and testable, not just defensive.
- Decisions where both the go trigger and the reassess trigger are named with numbers.
- Evolution claims tied to specific vendor actions that happened this week.
- Differentiation that identifies concentration risk, not just competitive advantage.
