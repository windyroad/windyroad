# Retrospective: work-problems iter P078 (2026-06-02)

AFK `/wr-itil:work-problems` iter 5. P078 (src/newsletters/published/leader/ folder is crowded; needs dated sub-directories) selected by orchestrator after iters 1-4 landed ADR-035, ADR-033 Phase 2, ADR-037, ADR-038.

## Outcome

P078 transitioned Open -> Verifying. ADR-039 (per-date sub-directory layout for published newsletter editions) landed alongside the 6-edition `git mv` migration + SKILL.md / persona-config / READMEs / ADR-019 / ADR-026 / ADR-038 amendments in one related-cluster commit per ADR-014. Commit sha `406becf`.

## Briefing Changes

- **Added**: none. Per-section scan ran against legacy `docs/BRIEFING.md`; 2 candidate observations surfaced (per-state-subdir undocumented decision; gate-stack sequencing friction), neither rose to durable cross-session continuity material this session. The undocumented-per-state-subdir decision is recorded under "Pipeline Instability" as ticket-candidate signal; the gate-stack sequencing is recorded under "No Action Needed" as session-local procedural observation. Scanned 30 candidate entries in BRIEFING.md (legacy single-file).
- **Removed**: none.
- **Updated**: none. Note: BRIEFING.md "What You Need to Know" line for problem-tickets cites "ADR-031" as the per-state-subdir layout precedent. ADR-031 is actually google-news-redirect (different topic). The per-state-subdir layout for `docs/problems/<state>/` is currently undocumented in ADR form. Update deferred pending the undocumented-decision ticket disposition (see Pipeline Instability).
- **README index refreshed**: n/a (no per-topic briefing tree yet; legacy single-file BRIEFING.md still in use per P100 transition window).

## Signal-vs-Noise Pass (P105)

| Entry | Topic file | Old score | New score | Classification | Citation |
|-------|-----------|-----------|-----------|----------------|----------|
| Problem tickets live in `docs/problems/<state>/NNN-slug.md` (per-state subdirectory layout, ADR-031...) | `docs/BRIEFING.md` | 0 | +1 | signal (cited and acted on; ADR-031 reference flagged as stale) | iter consulted this entry mid-task; cited as precedent for ADR-039 per-date-subdir layout (ADR-039 line: "per-state-subdir layout for `docs/problems/<state>/` is the precedent pattern"); also flagged stale ADR-031 reference during architect round-1 review |
| Drafter is an inline main-assistant pass, not a subagent | `docs/BRIEFING.md` | 0 | -1 | decay-only | not in context this iter (migration-mechanical, no drafter work) |
| Tom's editorial reviews repeatedly catch weaknesses the critic subagent does not | `docs/BRIEFING.md` (Surprise) | 0 | -1 | decay-only | not in context this iter |

**Critical Points changes**: none promoted; none demoted. (No `Critical Points` section in legacy BRIEFING.md anyway, per-topic tree migration not yet done.)
**Delete queue**: empty.
**Budget overflow**: n/a.

## Problems Created/Updated

| Ticket | Action | Citation |
|--------|--------|----------|
| P078 | Open -> Verifying (this iter's primary work) | commit `406becf`; Status field edit + file rename + Fix Summary appended + docs/problems/README.md Verification Queue row added |

No new problem tickets created (per AFK fallback, surfacing under Pipeline Instability and Outstanding Questions for user review).

## Pipeline Instability

| Signal | Category | Citations | Decision |
|--------|----------|-----------|----------|
| JTBD enforce-edit hook misfired on `src/newsletters/published/leader/README.md` Edit with "no JTBD documentation exists" branch despite `docs/jtbd/` being present (4 sub-directories: developer, engineering-leader, technical-founder, README.md). Workaround: Bash heredoc per P191's documented mitigation. Fired twice in this iter (post-marker-refresh-dance failed; only Bash bypass worked). | Hook-protocol friction | `ls docs/jtbd/` returned 4 entries; Edit tool returned `BLOCKED: Cannot edit 'README.md' because no JTBD documentation exists` twice; Bash `cat > README.md << EOF` succeeded immediately after; matches P191 (`docs/problems/open/191-jtbd-edit-gate-misfires-no-jtbd-documentation-branch-despite-docs-jtbd-present.md`) under the plugin-marketplaces tree. | matches P191, append new evidence on user return (count of in-session misfires: 2; current workaround surface: published/leader/README.md edit, not a bats fixture as P191's prior evidence) |
| `docs/problems/<state>/` per-state-subdir layout has NO documenting ADR (verified via `grep -l "per-state" docs/decisions/`). P078 ticket Description and BRIEFING.md "What You Need to Know" both cite "ADR-031" as the precedent, but actual ADR-031 is google-news-redirect (different topic). ADR-039 had to re-cite the precedent as an on-disk-only convention. Recurring class: future tickets needing to reference the precedent will hit the same stale citation. | Skill-contract violations (undocumented architectural convention) | grep `per-state\|per_state` in `docs/decisions/*.md` returns only ADR-039 (this iter's ADR); ADR-031 grep returns google-news-redirect content; P078 ticket line 91 cites "ADR-031" stale; `docs/BRIEFING.md` line 14 cites "ADR-031" stale. Two stale citations identified across the repo on a load-bearing architectural convention. | new ticket (route via `/wr-itil:manage-problem` on user return); proposed title: "per-state-subdir layout for `docs/problems/<state>/` is undocumented in ADR form; multiple stale ADR-031 citations propagated"; proposed fix shape: ADR (create), codify the layout decision with citations to the existing on-disk precedent |

**README inventory currency advisory**: not run (project repo, not a plugin-marketplaces tree with `packages/*/README.md` structure).

## Topic File Rotation Candidates

n/a, legacy BRIEFING.md single-file; per-topic budget pass does not apply.

## Verification Candidates

None this iter (no `.verifying.md` tickets exercised successfully in this iter's tool-call history; P078's own verifying entry is excluded per same-session rule).

## Context Usage (Cheap Layer)

| Bucket | Bytes | % of total | Δ vs prior |
|--------|-------|-----------|------------|
| problems | 694,998 | 42.7% | no prior snapshot, first measurement this iter |
| memory | 389,312 | 23.9% | no prior snapshot, first measurement this iter |
| decisions | 370,727 | 22.8% | no prior snapshot, first measurement this iter |
| skills | 131,548 | 8.1% | no prior snapshot, first measurement this iter |
| jtbd | 23,200 | 1.4% | no prior snapshot, first measurement this iter |
| hooks | 14,402 | 0.9% | no prior snapshot, first measurement this iter |
| project-claude-md | 7,530 | 0.5% | no prior snapshot, first measurement this iter |
| briefing | not measured | n/a | reason: source-absent (per-topic tree not yet created; legacy `docs/BRIEFING.md` falls into a different measurement bucket) |
| framework-injected | not measured | n/a | reason: framework-injected-no-on-disk-source |

Top-5 offenders (bytes-descending; measurement-method: `wr-retrospective-measure-context-budget` script reading on-disk source files):

1. problems (694,998 bytes; `du -sb docs/problems/`), likely high because verifying/ holds 30+ pending tickets with full body text
2. memory (389,312 bytes; `du -sb` on memory dir), auto-memory corpus
3. decisions (370,727 bytes; `du -sb docs/decisions/`), 39 ADRs with substantial bodies
4. skills (131,548 bytes; plugin-cache + project-local skills aggregated)
5. jtbd (23,200 bytes; persona job-records)

Per-plugin breakdown available in `/wr-retrospective:analyze-context` (deep layer).

## Ask Hygiene (P135 Phase 5 / ADR-044)

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | n/a | n/a | n/a |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

Zero AskUserQuestion calls. AFK orchestrator forbids them per P135. Persistence at `docs/retros/2026-06-02-work-problems-iter-p078-ask-hygiene.md`.

## Codification Candidates

| Kind | Shape | Suggested name / Target file | Scope / Flaw | Triggers / Evidence | Decision |
|------|-------|-----------------------------|--------------|----------------------|----------|
| create | ADR | (per the Pipeline Instability ticket above) | Codify the per-state-subdir layout for `docs/problems/<state>/` as an ADR; close out two stale ADR-031 citations (P078 ticket Description line 91, BRIEFING.md "What You Need to Know" line 14) | grep evidence above: no existing ADR documents the layout; both repo citations stale | flagged (non-interactive), user invokes `/wr-architect:create-adr` on return |

## No Action Needed

- 4-gate commit sequence (external-comms risk-scorer + voice-tone external-comms + risk-scorer pipeline + ADR-014 commit) fired correctly in this iter; not a friction observation, just procedural overhead. ~4 Agent calls before `git commit` returned 0. Working-as-designed per the documented commit-gate stack.
- Architect agent ISSUES-FOUND (round 1) -> revised scope (added ADR-026 to amends list, named ADR-038 line 90 specifically, confirmed frontmatter shape) -> PASS (round 2). Single-iter architect round-trip; not a recurring pattern. Working-as-designed per the architect-review-resolves-issues loop.
- Em-dash blocking hook caught a stale em-dash in ADR-039 first draft. Rewrite removed em-dashes successfully on second pass. Working-as-designed.
