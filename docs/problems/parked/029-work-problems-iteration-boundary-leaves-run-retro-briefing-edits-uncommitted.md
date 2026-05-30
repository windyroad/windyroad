# Problem 029: work-problems iteration boundary leaves run-retro BRIEFING.md edits uncommitted

**Status**: Parked
**Reported**: 2026-04-26
**Origin**: internal
**Priority**: 12 (High). Impact: Moderate (3) x Likelihood: Likely (4)
**Effort**: M
**WSJF**: 0 (parked, excluded from ranking)
**Type**: technical

## Description

Iteration retros inside `/wr-itil:work-problems` write to `docs/BRIEFING.md` but cannot commit per ADR-014 (run-retro out of scope for own commits). The orchestrator must add separate "BRIEFING hand-off" commits between iterations to keep Step 6.75 dirty-state classification clean. Each hand-off commit triggers another risk-scorer subagent invocation (compounds with P028 TTL expiry).

## Symptoms

From prior AFK session:
- Iters 7, 9, 11 each modified BRIEFING.md but committed only the main ticket fix
- Orchestrator added 4 hand-off commits: `4c644e5`, `3b3a703`, `556ef92`, `180b829`
- Each cost an additional risk-scorer subagent invocation cycle

## Workaround

Orchestrator adds a separate "BRIEFING hand-off" commit per iteration that touched BRIEFING. Mechanical but expensive.

## Impact Assessment

- **Who is affected**: AFK orchestrator runs that include retros
- **Frequency**: Most iterations (retros are the default closeout shape)
- **Severity**: Moderate. Adds risk-scorer invocations and commit churn; doesn't block work
- **Analytics**: Git history pattern: ticket commit followed by BRIEFING hand-off commit pairs

## Root Cause Analysis

### Investigation Tasks

- [ ] Review `work-problems/SKILL.md` Step 6 / Step 6.5 (commit-staging contract)
- [ ] Decide fix: orchestrator iteration prompt grants retro permission to fold BRIEFING into the iteration's main commit, OR work-problems explicitly stages BRIEFING in the iteration's commit before risk-scoring
- [ ] Consider ADR-014 amendment: retro-as-part-of-iteration commit scope
- [ ] Create reproduction test (run-retro inside work-problems iteration)
- [ ] Create INVEST story for permanent fix

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P028 (each hand-off commit triggers a risk-scorer call; closing P029 reduces P028 frequency)

## Related

- packages/itil/skills/work-problems/SKILL.md (Step 6 / Step 6.5 / Step 6.75)
- docs/decisions/014-*.md (governance skills commit own work)
- packages/wr-retrospective/skills/run-retro/SKILL.md
- **Reported upstream**: https://github.com/windyroad/agent-plugins/issues/83 (2026-04-27)

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/83
- **Reported**: 2026-04-27
- **Template used**: problem-report.yml
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes

## Parked

- **Reason**: upstream-blocked. The fix sites for this contract gap live in the upstream `wr-itil` and `wr-retrospective` plugin SKILL.md files. The `work-problems` orchestrator's Step 6 / Step 6.4 / Step 6.5 / Step 6.75 commit-staging contract is authored at `~/.claude/plugins/cache/windyroad/wr-itil/0.38.0/skills/work-problems/SKILL.md` (lines 394 + 506 + 525 + 564 + 681 + 713 covering the retro-on-exit clause, Step 6 progress reporting, Step 6.4 risk-register drain, Step 6.5 release-cadence check, and Step 6.75 inter-iteration verification). The `run-retro` ownership boundary is authored at `~/.claude/plugins/cache/windyroad/wr-retrospective/0.21.4/skills/run-retro/SKILL.md` (line 441: "run-retro surfaces the observation and delegates ticket creation to `/wr-itil:manage-problem`. The delegated skill renames, edits, and commits per ADR-014. run-retro does not commit its own work."). This project is a downstream marketplace consumer of `@windyroad/wr-itil` and `@windyroad/wr-retrospective`. A consumer cannot edit the cached SKILL.md without losing the change on next plugin update, so the only durable fix is upstream: either (a) work-problems Step 6 explicitly stages `docs/BRIEFING.md` in the iteration's main commit before risk-scoring, or (b) the upstream governance ADR amends run-retro's commit scope to grant retro permission to fold BRIEFING into the iteration's commit when invoked inside work-problems. The local "ADR-014 amendment" option proposed in the ticket's Root Cause Analysis Investigation Tasks does NOT apply to this project: this project's `docs/decisions/014-wardley-mapping-as-strategic-lens.proposed.md` is a Wardley-mapping decision, not the governance-skills-commit-own-work ADR; that load-bearing ADR lives in the upstream `windyroad/agent-plugins` repo.
- **Verified persistence (upstream contract ambiguity)**: 2026-05-31 read of cached `wr-itil@0.38.0/skills/work-problems/SKILL.md` line 394 carries the retro-on-exit clause asserting `"Retro may create tickets or update docs/BRIEFING.md [U+2014] run-retro commits its own work per ADR-014; any tickets it creates ride into either the iteration's own commit (if retro runs before the main commit) or a retro-owned follow-up commit"`. Cached `wr-retrospective@0.21.4/skills/run-retro/SKILL.md` line 441 asserts the OPPOSITE: `"run-retro surfaces the observation and delegates ticket creation to /wr-itil:manage-problem. The delegated skill renames, edits, and commits per ADR-014. run-retro does not commit its own work."` The two SKILL.md texts contradict each other on whether run-retro commits BRIEFING.md edits. Step 6.75's inter-iteration verification (line 681) reads dirty-state at the iteration boundary, classifies any uncommitted BRIEFING.md edit as orchestrator-owned cleanup work, and forces the hand-off commit cycle the ticket Symptoms describe. The contract ambiguity itself is the upstream defect; downstream consumers see the ambiguity manifest as forced hand-off commits.
- **Verified persistence (upstream issue still open)**: 2026-05-31 `gh issue view 83 -R windyroad/agent-plugins --json state` returned `state: OPEN`, `createdAt: 2026-04-26T22:53:33Z`, `updatedAt: 2026-05-15T05:44:57Z`. Upstream maintainers have not closed or resolved the contract gap since the 2026-04-27 filing. Re-running `gh issue view 83 -R windyroad/agent-plugins` periodically is the simplest persistence-poll surface.
- **Local impact while parked (zero session manifestation)**: this project has no `docs/briefing/` directory tree and only a single legacy `docs/BRIEFING.md` stub file. The retro subprocess that runs as Step 5 of each AFK iteration explicitly reports `No briefing changes this iter` on every iteration. Empirically: all 13 prior iterations of this AFK loop today (iters 1 to 13: P062 KE to V, P063 KE to V, P061 KE to V, P021 / P022 / P027 / P033 / P042 / P047 / P049 / P060 / P068 / P073 Open to Parked) reported zero BRIEFING.md modifications and produced zero forced hand-off commits. The ticket Symptoms section cites a prior AFK session (iters 7, 9, 11 with hand-off commits `4c644e5`, `3b3a703`, `556ef92`, `180b829`) which was BEFORE the AFK orchestrator template wrote `<draft-folder>/<publication-date>.cover.svg` workflow and BEFORE the current iter-prompt template's pre-stage discipline. The contract gap is real upstream; the local manifestation is currently zero. Park preserves the original Severity 12 (High) Priority for tracking visibility but the actual frequency in THIS project is currently nil.
- **Un-park trigger**: any one of three signals lands: (1) a new `wr-itil` plugin release whose `skills/work-problems/SKILL.md` Step 6 / Step 6.5 explicitly stages `docs/BRIEFING.md` in the iteration's commit before risk-scoring (verify by re-reading the cached file in the new version and confirming the Step 6 commit-staging contract includes a `git add docs/BRIEFING.md` step before the risk-scorer invocation); OR (2) a new `wr-retrospective` plugin release whose `skills/run-retro/SKILL.md` Step 3 BRIEFING update path commits BRIEFING.md directly when invoked inside a `work-problems` iteration subprocess (verify by re-reading the cached file in the new version and confirming the ownership boundary text explicitly carves out the work-problems-inside-subprocess case); OR (3) upstream issue windyroad/agent-plugins#83 is closed with a linked PR landing one of the above fixes. Confirm by re-running `gh issue view 83 -R windyroad/agent-plugins --json state,closedAt`. Close P029 once a `/wr-itil:work-problems` AFK loop produces an iter with a BRIEFING.md modification that lands in the iter's main commit (no forced hand-off commit) on the upgraded spec.
- **Composes with**: P021 (parked 2026-05-30, upstream `windyroad/agent-plugins` `wr-architect` plugin hook); P022 (parked 2026-05-30, upstream `wr-architect` plugin hook); P027 (parked 2026-05-30, upstream `wr-itil` plugin SKILL.md sibling); P028 (verifying, the TTL-expiry composition the original ticket cites; each forced hand-off commit triggers another risk-scorer subagent invocation [U+2014] closing P029 reduces P028's empirical-trigger frequency, BUT the current-session empirical frequency is already zero per the local-impact section above so the composition is dormant); P033 (parked 2026-05-30, upstream `wr-itil` plugin SKILL.md sibling); P042 (parked 2026-05-30, upstream `wr-jtbd` plugin hook); P047 (parked 2026-05-30, upstream `wr-risk-scorer` plugin SKILL.md); P049 (parked 2026-05-30, upstream `wr-itil` plugin script); P060 (parked 2026-05-30, upstream `wr-architect` plugin SKILL.md template); P068 (parked 2026-05-30, in-project architect-design block); P073 (parked 2026-05-30, upstream `wr-itil` plugin SKILL.md P186 cell-shape contract). All ten 2026-05-30 / 2026-05-31 parks share the marketplace-consumer-cannot-edit-cached-plugin pattern.
- **Date parked**: 2026-05-31
