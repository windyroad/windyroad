# Ask Hygiene 2026-08-05

Session: AFK `/wr-itil:work-problems` iteration on P123 (fix:deps gates on vitest only, so a lockfile npm ci cannot install passes and reddens master).

**ID namespace warning.** The `ADR-044` / `ADR-073` / `ADR-074` references below are **upstream `@windyroad` plugin** governance IDs from the skill contracts, not this repository's `docs/decisions/` IDs, which stop at 043 and mean different things. `P123` and `P124` are local. `ADR-034` is local.

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | (none) | n/a | No `AskUserQuestion` calls were made this session. |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

Every decision this iteration reached was framework-resolved and taken silently, per ADR-044's framework-resolution boundary:

- Fix shape (composite gate, cheap-to-expensive ordering, shape-scan-as-proxy) came from P123's own Investigation Tasks, which named the decisions to make and the evidence to make them on.
- The I13 propose-fix gate's no-RFC-trace directive resolved to sub-case (b), no existing fix vehicle, so `/wr-itil:capture-rfc --fix-time` auto-created RFC-003 without a consent gate. ADR-073 classifies fix-time RFC scope as framework-mediated, not category-1 direction-setting.
- The ADR-074 substance-confirm-before-build guard did not fire: `wr-architect-is-decision-unconfirmed ADR-034` exited 1 (confirmed), so the fix was clear to build on it.
- Two governance-gate defects were hit and worked around silently rather than escalated: the architect PASS marker not landing on a heading-form verdict, and the deprecated compendium generator clobbering the hook-authored entry. Both were already-known classes with documented recovery paths (P124, P087), so neither warranted a question.

Cross-session trend: the last three trail files (2026-07-13, 2026-07-15, 2026-07-27) each record **Lazy count: 0**. With this retro that is four consecutive zeros, so the ADR-044 R6 numeric gate (lazy count >= 2 across 3 consecutive retros) does not fire and no deviation-candidate is queued. The `check-ask-hygiene.sh` consumer is not resolvable in this repository (no `packages/retrospective/` tree and no `wr-retrospective-check-ask-hygiene` shim on `$PATH`), so the trend above was read directly from the trail files.
