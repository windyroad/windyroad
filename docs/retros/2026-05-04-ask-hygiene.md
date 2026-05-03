# Ask Hygiene Trail. 2026-05-04 main-turn retro

Scope: orchestrator main turn of the 2026-05-02 / 2026-05-03 / 2026-05-04 work-problems session (run-retro invoked 2026-05-04). Iteration subprocess ask-hygiene trails persisted independently: iter1 at `2026-05-02-ask-hygiene.md` (no iter-suffix; commit `2e7b89a`), iter2 at `2026-05-02-iter2-ask-hygiene.md`, iter3 at `2026-05-02-iter3-ask-hygiene.md`. Each iter reported lazy=0. The iter1 file's missing iter-suffix is a naming-convention inconsistency worth noting (P086 evidence: iter1's retro-on-exit produced a trail but used a different filename shape than iter2/iter3); not blocking.

## Per-call classification

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| 1 | "Preflight" | direction | Gap: Step 0 README reconciliation script `packages/itil/scripts/reconcile-readme.sh` is missing in marketplace consumer (exit 127, undefined exit-code routing in SKILL). Three options offered (proceed using README directly / work P031 first / halt). Framework does not resolve "what to do when reconcile script is missing" because the SKILL exit-code routing covers exit 0 / 1 / 2 only. |
| 2 | "assess-release fix" | direction | Gap: The wr-risk-scorer assess-release SKILL prose contract violation surfaced via iter 3's outstanding_questions queue. Three options on routing (open local + report upstream / report upstream only / defer). Framework does not pre-resolve which routing path is appropriate because the upstream/local placement requires user judgement (per P045 discipline). |
| 3 | "P094 bulk path" | direction | Gap: P094 bulk-creation README refresh bypass surfaced via iter 2's outstanding_questions queue. Three options (open local ticket / defer / already covered). Framework does not pre-resolve whether to open a local ticket vs defer. |
| 4 | "section-order bug" | direction | Gap: reconcile-readme.sh:89 section-order assumption surfaced via iter 2's outstanding_questions queue. Three options (open local / defer / already covered). Framework does not pre-resolve. |
| 5 | "Next move" | direction | Gap: Quota-cut iter 4 left orchestrator at a halt boundary. Three options (halt / push iter-3 commits / open tickets only). Framework does not pre-resolve the user's preferred next-action; choice is direction-class. |

**Lazy count: 0**
**Direction count: 5**
**Deviation-approval count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

## Notes

All 5 main-turn AskUserQuestion calls were direction-setting on observations the framework had not pre-resolved. Three of them (calls 2, 3, 4) batched at loop-end per Step 2.5b's surfacing routine, ranking the queue from `direction` (Q1) and `silent-framework` (Q2, Q3) per ADR-044 6-class taxonomy.

R6 numeric gate condition: this is the first main-turn ask-hygiene file in the trail. Cross-session check via `check-ask-hygiene.sh` cannot fire on a single-retro window. Subsequent retros will accumulate the trail; R6 trigger requires lazy at least 2 across 3 consecutive retros.

Iter-subprocess trails (`2026-05-02-ask-hygiene.md` (iter1) + `2026-05-02-iter2-ask-hygiene.md` + `2026-05-02-iter3-ask-hygiene.md`) all reported lazy=0; that observation matches the iter-subprocess constraint "Do NOT call AskUserQuestion mid-loop" (work-problems SKILL.md Step 5 + ADR-044 framework-resolution boundary). Naming-convention drift (iter1 lacks the iter-suffix) is a P086-evidence-append candidate; not blocking and not cumulative-impact-bearing.
