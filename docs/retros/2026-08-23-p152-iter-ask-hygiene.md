# Ask Hygiene, 2026-08-23 (P152 AFK iter)

Iteration: `/wr-itil:work-problems` dispatching P152 (No newsletter gate owns parse-on-first-pass comprehension, so an unreadable sentence passes every gate).

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | (none) | (none) | No `AskUserQuestion` was invoked. The iteration ran under the AFK orchestrator, whose contract forbids it; every decision that would have warranted one was queued to `outstanding_questions` instead. |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

One decision was queued rather than asked, direction-setting in shape: the `wr-itil-check-fix-rfc-trace` predicate again returned exit 3 because this repository holds no story maps at all, and drawing the first map for a journey decides what that journey is. This is the same queued item P151's iter recorded, unchanged.

Two further judgements were resolved by the framework rather than queued, and are recorded here so the classification is auditable. The choice of which gate owns parse-on-first-pass comprehension was NOT direction-setting: the architect ruled it implementation of ADR-052's own recorded residue ("readability had no blocking owner"), so no new ADR and no substance-confirm ask fired. The decision to delete three eval fixtures that passed under falsification was mechanical: `falsify.sh`'s own contract is that a fixture passing against the baseline guards nothing, so the framework resolved it.
