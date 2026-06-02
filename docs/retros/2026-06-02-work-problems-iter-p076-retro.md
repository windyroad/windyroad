# Session Retrospective: 2026-06-02 work-problems iter (P076)

## Briefing Changes

- Added: none. Scanned legacy `docs/BRIEFING.md` against the iter's observations; the existing entries already cover the relevant patterns (em-dash hook, architect ISSUES FOUND iteration loop, AFK subprocess quota separation, ticket-family completeness). The iter's friction signals are already captured.
- Removed: none.
- Updated: none. The legacy single-file briefing (54 lines) is in the P100 transition window per ADR-040; the per-topic-file migration (`docs/briefing/<topic>.md`) has not landed yet in this project. Step 1.5 signal-vs-noise scoring requires per-entry HTML-comment scoring blocks; legacy file does not carry them. Pass skipped with scan citation, not silently dropped.
- README index refreshed: N/A (per-topic tree absent).

## Signal-vs-Noise Pass (P105)

Pass scoped to per-topic-file briefing tree. Tree absent in this project (`docs/briefing/` does not exist; legacy `docs/BRIEFING.md` is in the P100 transition window). Pass deferred to the per-topic migration session; no entry-level scoring infrastructure exists in the legacy file. Cited: `ls docs/briefing/` returned "No such file or directory" at retro Step 1.

## Problems Created/Updated

- **P076 (Newsletter pipeline drafts body before heading)**: Investigation Tasks updated. ADR-amend task checked off (lands as ADR-037, born `human-oversight: confirmed`). Four other tasks (SKILL.md split, approval-gate, cover-amendment, test on next edition) remain unchecked with deferred-blocked notes citing ADR-037 § Deferred sub-decisions. Progress log subsection added with iter narrative. Single-commit grain per ADR-014 (commit 5ca8ad8).

## Tickets Deferred

(None. Stage 1 ticketing fired for P076 update inline; no `skill_unavailable` fallbacks taken.)

## Verification Candidates

(None. This iter's activity was newsletter-pipeline ADR work; no `.verifying.md` ticket's fix area was exercised. Step 4a same-session exclusion applies to the in-flight P076 commit. Sub-step 9 prior-session README cell drain checked: `## Verification Queue` table has zero `yes, observed:` rows.)

## Pipeline Instability

| Signal | Category | Citations | Decision |
|--------|----------|-----------|----------|
| `wr-architect-generate-decisions-compendium` produces em-dash output that triggers the project's `.claude/hooks/no-em-dash-bash.sh` PostToolUse hook. Compendium left stale (advisory regen by architect verdict could not land). | Skill-contract violations | Tool invocation: `wr-architect-generate-decisions-compendium` at retro turn 21 in this iter session. Observable outcome: `BLOCKED: Em-dashes (U+2014) detected in files modified by Bash. Files: docs/decisions/README.md`. Workaround: `git checkout -- docs/decisions/README.md` (revert). Tool path: `/Users/tomhoward/.claude/plugins/marketplaces/windyroad/packages/architect/bin/wr-architect-generate-decisions-compendium`. Architect advisory at agent review id a4a558889ab3ccc1f recommended the regen explicitly. | flagged (non-interactive): record in retro only; user reviews on return and routes via `/wr-itil:capture-problem` to either an upstream report on the architect plugin or a local wrapper. Placement choice is a verify-upstream-placement decision per feedback memory. |
| External-comms gate marker hash mismatch when `Co-Authored-By` trailer is present in commit message but absent in the risk-scorer review draft body. Required re-firing both risk-scorer and voice-tone external-comms reviewers with the full commit body including the trailer. | Hook-protocol friction | First risk-scorer external-comms invocation at agent id abe8c7372d3699eab returned PASS, but the subsequent `git commit` was BLOCKED with "draft has not been reviewed". Voice-tone external-comms first invocation at agent id aec5f3ae13db4cd8c had the same outcome. Both required re-firing with the body containing the `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>` trailer to converge the hash and unblock the commit. | flagged (non-interactive): record in retro only; user reviews on return. Either (a) gate docs gain a "include trailers when reviewing git-commit-message surface" note or (b) the PostToolUse hook strips the `Co-Authored-By:` trailer before hashing (matching the existing frontmatter-strip for `changeset-author` surface). |
| Architect verdict ISSUES FOUND on first review of new ADR file path blocks the Write of that file; revised draft plus second architect review with PASS verdict required. Standard gate behaviour, but iteration loop cost is non-trivial (held full ADR body in context across 3 architect dispatches: initial plan review, draft review, revised draft review). | Subagent-delegation friction | First architect review of ADR-037 plan (agent id a0bc7cc4e64cc0145): ISSUES FOUND on 5 items. Second architect review of skeleton draft (agent id a3c7530cb4a3ffe5d): ISSUES FOUND on 6 items. Third architect review of full revised draft (agent id a4a558889ab3ccc1f): PASS. Write attempt at retro turn 11 was BLOCKED with "Cannot edit ... without architecture review" until PASS verdict landed. | recorded in retro only (not ticket-worthy): standard gate behaviour. Cost is intrinsic to the architect-gated-write contract; per ADR-009 the gate exists for a reason and the iteration loop is the correct shape. |

README inventory currency: not run this iter (Step 2b advisory script optional; no drift signal in this iter's scope which touched only `docs/decisions/` and `docs/problems/`).

## Topic File Rotation Candidates

(None. Per-topic briefing tree absent in this project; legacy `docs/BRIEFING.md` budget check is the P099 surface but does not apply to a non-tree layout. Topic file rotation pass skipped with scan citation.)

## Context Usage (Cheap Layer)

| Bucket | Bytes | % of total | Δ vs prior |
|--------|-------|------------|------------|
| problems | 683696 | 45% | no prior snapshot for this project: first measurement |
| memory | 386571 | 25% | no prior snapshot |
| decisions | 330478 | 22% | no prior snapshot |
| skills | 131040 | 9% | no prior snapshot |
| jtbd | 23200 | 1.5% | no prior snapshot |
| hooks | 14402 | 1% | no prior snapshot |
| project-claude-md | 7530 | 0.5% | no prior snapshot |
| briefing | not measured: source-absent | N/A | N/A |

**Threshold: 10240 bytes per bucket.** Buckets `hooks` and `project-claude-md` are within ceiling; all others (problems, memory, decisions, skills, jtbd) exceed. The `problems` bucket at 683KB is the dominant contributor (45% of measured total). The `decisions` bucket at 330KB grew this iter by approximately 5.6KB (ADR-037 written; compendium revert restored prior state).

Top-5 offenders by bytes:
1. `problems` 683696 bytes (measurement-method: byte-count of `docs/problems/**/*.md`)
2. `memory` 386571 bytes (`~/.claude/projects/-.../memory/*.md`)
3. `decisions` 330478 bytes (`docs/decisions/*.md`)
4. `skills` 131040 bytes (`.claude/skills/**/*.md` and `packages/*/skills/**/*.md`)
5. `jtbd` 23200 bytes (`docs/jtbd/**/*.md`)

Per-plugin breakdown available in /wr-retrospective:analyze-context (deep layer).

Deep analysis recommended: invoke /wr-retrospective:analyze-context (no prior snapshot exists for delta tracking; first measurement; deep layer establishes baseline).

## Ask Hygiene (P135 Phase 5 / ADR-044)

Trail file persisted at `docs/retros/2026-06-02-work-problems-iter-p076-ask-hygiene.md`.

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | (none) | (none) | No `AskUserQuestion` calls emitted in this iter. AFK orchestrator subprocess; per-iter prose-asks and lazy classification asks routed via outstanding_questions in ITERATION_SUMMARY. |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

R6 numeric gate (≥2 lazy asks per retro across 3 consecutive retros): NOT FIRED this retro. (Cross-session trend check not run because no R6 firing signal exists at lazy=0.)

## Codification Candidates

(None this iter. The Pipeline Instability section above carries two AFK-deferred ticket candidates; both are flagged for user review on return rather than auto-ticketed because they implicate upstream-vs-local placement decisions per the verify-upstream-placement-before-propagating feedback memory.)

## No Action Needed

- The Tom-approval gate substance was Tom-direction-pinned via the P076 ticket prose. Architect verdict explicitly approved born `human-oversight: confirmed` based on the ticket's substantive direction capture. This is exactly the surface ADR-066 plus ADR-074 plus the substance-confirm-before-build guard are designed to support; no additional confirmation infrastructure needed for this case.
- The architect's prior advisory to regenerate the compendium produced an em-dash hook block. Reverted compendium changes; staleness preserved. This is the correct trade-off for this iter (smallest-change-satisfies-correction per feedback memory); the upstream tool fix is the right placement.
