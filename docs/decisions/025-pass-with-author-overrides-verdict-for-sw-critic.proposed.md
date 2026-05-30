---
status: "proposed"
first-released:
date: 2026-05-02
human-oversight: confirmed
oversight-date: 2026-05-30
decision-makers: [Tom Howard, Claude]
consulted: [wr-architect agent]
informed: []
---

# PASS_WITH_AUTHOR_OVERRIDES verdict for sw-critic round-3 exhaustion

## Context and Problem Statement

ADR 016 establishes the sw-critic 3-round iteration loop. Round 3 emits `VERDICT: REJECTED` with `REJECTED_REASON: critic-loop-exhausted` whenever ANY UNMET or PARTIAL persists at round 3, including PARTIALs that are documented author overrides (e.g. inline-link source format vs `Source:` block, six items vs the rubric's preferred four-five, CTA description per ADR-023 commercial-funnel pause).

The verdict is technically correct (the rubric was not fully satisfied) but practically misleading (the brief is publish-ready; all blockers are intentional editorial choices). User reads "REJECTED" and either rewrites unnecessarily or learns to ignore the verdict, both bad.

P039 captures the recurring symptom across Editions 2 and 3.

## Decision Drivers

- **Signal accuracy**: the verdict should distinguish "rubric is wrong for this artefact / author has overridden" from "artefact has an unfixed flaw."
- **Audit-trail integrity**: the saved review block remains the durable record; the verdict variant must persist there for governance.
- **Mechanism simplicity**: the change must be reversible and small.

## Considered Options

1. **Add a `PASS_WITH_AUTHOR_OVERRIDES` verdict variant**. The caller passes an `accepted_overrides:` list of check IDs in `prior_weaknesses`. Round-3 logic: if remaining UNMETs/PARTIALs are all in the override list, emit `PASS_WITH_AUTHOR_OVERRIDES` with the override list named explicitly.
2. **Override at save time, not in critic**. Critic still emits REJECTED; the save-step gate consults a config file listing accepted overrides and re-classifies before save. Pushes the responsibility downstream and makes audit-trail less coherent.
3. **Status quo + Tom-summary disambiguation**. Surface "publish-ready (with N documented overrides)" in the chat summary while the saved verdict remains REJECTED. Solves the user-facing surface but leaves the audit trail confusing.
4. **Drop the round-3 strict-equality logic**. Round 3 emits PASS if ≥X% of checks MET. Loses the rubric's load-bearing rigor; not chosen.

## Decision Outcome

Chosen option: **1. Add `PASS_WITH_AUTHOR_OVERRIDES` as a third verdict alongside `PASS` and `REJECTED`**.

The contract:

1. The caller (e.g. `/wr-newsletter` step 15 or 9) passes `accepted_overrides` as a structured field in `prior_weaknesses` for round 2 onwards. Format: `accepted_overrides: [check_6, check_19, check_23, check_26]`.
2. Round-3 logic, in priority order:
   - All MET → `VERDICT: PASS`.
   - Remaining UNMETs and PARTIALs are all in `accepted_overrides` → `VERDICT: PASS_WITH_AUTHOR_OVERRIDES`. The verdict block names the override list explicitly: `OVERRIDDEN: [check_6, check_19, check_23, check_26]`.
   - Any UNMET or PARTIAL is NOT in `accepted_overrides` → `VERDICT: REJECTED` with `REJECTED_REASON: critic-loop-exhausted`.
3. The saved review block in the brief audit trail (ADR 019 capture-transcript pattern, P038 reviews-sibling pattern) records the variant verbatim.
4. The Tom-summary at step 17 surfaces "publish-ready with N author overrides" or "REJECTED, do not publish as-is" based on the variant.

This applies to both the newsletter critic (step 15) and the Wardley critic (step 9). Author-override semantics differ per artefact; each caller is responsible for declaring its own list.

## Consequences

### Good

- Verdict matches publish-decision signal: PASS_WITH_AUTHOR_OVERRIDES is publish-ready; REJECTED is not.
- Audit trail records overrides explicitly, satisfying ADR 015 attribution-adequacy at the verdict level.
- Existing PASS / REJECTED semantics unchanged; only a new variant added.

### Bad

- Caller burden: now needs to pass `accepted_overrides` per artefact. Mistakes (forgetting to list a real override; over-listing to suppress real failures) shift the failure surface.
- Slight rubric-erosion risk: making author overrides ergonomic could encourage overusing them.

### Neutral

- The override list is captured in the saved review block; rubric-erosion is auditable via grep over `OVERRIDDEN: [...]` lines across editions.

## Confirmation

- (1) The wr-sw-critic agent file declares the third verdict variant and the round-3 logic.
- (2) The `/wr-newsletter` skill at steps 9 and 15 passes `accepted_overrides` for the four documented overrides (check_6, check_19, check_23, check_26).
- (3) Edition 4's saved review block emits `PASS_WITH_AUTHOR_OVERRIDES` with the override list, and the Tom-summary surfaces "publish-ready" rather than "REJECTED."
- (4) Random-sample audit on 3 editions shows no growth in the override list relative to Edition 3.

Reassessment: if the override list grows past 6 checks across consecutive editions, the rubric needs amendment, not the override mechanism.

## More Information

- Companion problem ticket: P039.
- Amends: ADR 016 (sw-critic 3-round loop).
- Companion ADR: ADR 026 (reviews-to-sibling-file) carries the verdict variant in the audit trail.
