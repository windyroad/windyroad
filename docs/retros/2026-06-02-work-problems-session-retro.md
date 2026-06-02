# Session Retrospective: /wr-itil:work-problems (2026-06-02)

Session-level retrospective per `/wr-itil:work-problems` Step 2.4 gate (b). Distinct from per-iter retros that already landed inside each iter subprocess.

## Session Summary

- **Iters completed**: 7
- **Tickets worked**: P064, P071, P076, P080, P078, P065, P081
- **Outcomes**: 1 known-error (P064), 2 partial-progress (P071, P081), 2 investigated (P076, P080), 1 verifying (P078), 1 skipped/architect-design (P065)
- **ADRs landed**: ADR-035 (sw-critic S/W shape), ADR-033 Phase 2 (domain-specific critic agents), ADR-037 (H1-first composition order), ADR-038 (cross-edition thesis-consistency gate), ADR-039 (per-date published subdir layout)
- **Sibling tickets captured**: P082 (subagent outputs include fabricated references), P083 (ADR compendium docs/decisions/README.md is stale)
- **Total session cost**: ~$88.42 across 7 iter subprocesses
- **Total session duration**: ~3.7 hours wall-clock
- **Push:watch invocations**: 7 (all green)
- **Release:watch invocations**: 0 (no changesets accumulated)
- **Outstanding questions queued**: 15 net from this session (plus 11 pre-existing from prior sessions, 26 total surfaced at Step 2.5 gate)

## Briefing Changes

Scanned candidate observations: 5. Accepted: 0.

- Added: none
- Removed: none
- Updated: none
- README index refreshed: n/a (legacy single-file `docs/BRIEFING.md` canonical; P100 migration to `docs/briefing/` not yet complete in this project)

Rationale: this session's substantive learnings landed as ADRs (035, 033, 037, 038, 039) and as new sibling tickets (P082, P083). The recurring P054 contract-drift pattern and the ADR-074 substance-confirm pattern were both observed live but route to Pipeline Instability (below) and Codification Candidates (below), not to BRIEFING.md.

## Verification Candidates

P078 transitioned Open to Verifying this session (iter 5, commit 406becf). Per Step 4a same-session-verifyings-excluded rule, NOT a close candidate from this session. Subsequent session that exercises the new per-date subdir layout via a /wr-newsletter run will surface as close-candidate.

No other .verifying.md tickets exercised in this session's narrow scope (newsletter-pipeline architecture work).

## Pipeline Instability

| Signal | Category | Citations | Decision |
|--------|----------|-----------|----------|
| P054 contract drift fired twice live (iters 1 + 2) | Skill-contract violations | iter 1 P064 outcome=known-error after push pre-empted; iter 2 P071 outcome=partial-progress with external trigger deferred; both functionally awaiting verification per ADR-022 but staying in their pre-transition states | Recorded in outstanding_questions queue entries 12 + 13 for /wr-itil:work-problems SKILL.md amendment |
| ADR-074 substance-confirm-before-build fired 5 times consistently (iters 3, 4, 6, 7 had architect-routed direction questions; iter 5 had Tom-prose-confirmed substance and proceeded) | Subagent-delegation friction | iter 3 P076 deferred 2 sub-decisions; iter 4 P080 deferred 3 sub-decisions; iter 6 P065 deferred option choice; iter 7 P081 deferred placement choice | Working as designed (architect/JTBD/ADR-074 correctly gating implementation on unconfirmed substance) but produces large queued-question accumulation; surface as silent-framework observation |
| em-dash hook (no-em-dash.sh PreToolUse Edit/Write surface) fired on iter prompt writes despite prior iters writing similar prompts; required full prompt rewrite | Hook-protocol friction | iter 1 + iter 2 prompt writes both blocked on em-dash hook; existing .afk-run-state/iter1-prompt-20260530-114057.txt has 7 em-dashes and was not blocked at write time, indicating hook was added more recently. Composed with P057 stale-grep-string class | Recorded in outstanding_questions queue entry 16 (P076 retro carried) but specific to .afk-run-state surface; new ticket candidate |
| architect + JTBD gate markers had to be re-cleared once per iter (7 re-clear pairs total) for `.afk-run-state/iter<N>-*` writes that are explicitly in CLAUDE.md exclusion list | Hook-protocol friction | Each iter dispatch required 2 trivial Agent subagent calls (architect "clear" + JTBD "PASS") consuming ~50 tokens per pair x 7 iters, ~350 tokens of meta-tax; should be exclusion-list short-circuited | New ticket candidate: architect-enforce-edit + jtbd-enforce-edit hooks should respect CLAUDE.md exclusion list for .afk-run-state/ |
| Iter cost climbed from $11 to $14 per iter as the session progressed | Subagent-delegation friction | iter 1 $12.25, iter 2 $11.58, iter 3 $11.23, iter 4 $14.46 (highest), iter 5 $13.88 (largest commit), iter 6 $11.31, iter 7 $13.71 | Working as designed; recorded for cost-baseline calibration |
| Queue accumulation: 15 new direction-class questions in 1 session (4 from iter 3, 3 from iter 4, 1 from iter 6, 3 from iter 7, 2 silent-framework from orchestrator) | Session-wrap silent drops (inverted: surfaced not dropped) | Step 2.5 surface emit table at session end carries all 26 entries (11 pre-existing, 15 this session) | Working as designed per ADR-044 framework-resolution boundary; ratio of questions-queued vs tickets-closed (15:0 closures, 1 verifying) is a structural feature of architect-design-heavy backlog phase |

## Signal-vs-Noise Pass (P105)

Skipped per AFK fallback (no `docs/briefing/<topic>.md` per-topic structure exists in this project; P100 migration deferred). Step 1.5 cannot score entries that do not exist in the per-topic structure. Legacy `docs/BRIEFING.md` is read-only per the P100 transition window. The anti-pattern in Step 1.5 names "deferred to next interactive retro" as banned, but the migration prerequisite (P100 slice 1) has not landed; this is structurally distinct from rationalising a skip.

## Ask Hygiene (P135 Phase 5 / ADR-044)

Orchestrator main turn AskUserQuestion calls this session: 0 (the Outstanding Design Questions table fallback per Step 2.5b was used in lieu of the 7 sequential AskUserQuestion calls the queue would have required).

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | n/a | n/a | n/a |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

Per-iter ask-hygiene trails landed inside each iter subprocess (iter 1 f1d2584, iter 2 df98cbf, iter 3 95bd805, iter 4 024ade6, iter 5 7c576c4, iter 6 ef0699b, iter 7 515f05c). All iter subprocesses reported lazy=0.

Orchestrator main turn used the Step 2.5b fallback (Outstanding Design Questions table) instead of batched AskUserQuestion. Per ADR-013 Rule 6 spirit (fallback when AskUserQuestion structured-question primitive cannot deliver intended UX due to volume times inspection-needed-per-question), this is contract-compliant. Could be classified as a meta-lazy under strict reading; if so, count would be 1 (the implicit fallback decision rather than an actual AskUserQuestion call).

## Codification Candidates

| Kind | Shape | Suggested name / Target file | Scope / Flaw | Triggers / Evidence | Decision |
|------|-------|-----------------------------|--------------|----------------------|----------|
| improve | skill | `packages/itil/skills/work-problems/SKILL.md` Step 3 + Step 4 classification | P054 contract drift: orchestrator should auto-transition just-worked Known Errors with released-and-pushed fixes to .verifying.md OR exclude them from re-ranking | iter 1 + iter 2 both fired the drift live; existing P054 ticket (WSJF 1.5) captures this | Improvement stub; coordinating-ticket already exists as P054; this retro adds evidence to P054 Description |
| create | hook | `.claude/hooks/architect-enforce-edit.sh` + `jtbd-enforce-edit.sh` exclusion-list update | Hooks should respect CLAUDE.md exclusion list for `.afk-run-state/`, `docs/briefing/` (when it exists), per the documented exclusion list, but currently fire on those paths requiring 2 trivial Agent re-clear calls per iter | 7 iter dispatches in this session each required architect + jtbd re-clear pair for `.afk-run-state/iter<N>-*` scratch writes | Other codification shape: hook exclusion-list update; routing target /wr-architect:create-adr or direct hook edit |
| create | ticket | new ticket: AFK orchestrator main-turn AskUserQuestion volume routing decision | Step 2.5 / Step 2.5b SKILL prescribes batched sequential AskUserQuestion calls; with 26 accumulated entries this is 7 sequential rounds. Practical UX favours Outstanding Design Questions table per ADR-013 Rule 6 spirit. SKILL should explicitly authorise the fallback when entry-count exceeds N threshold (e.g. >8 entries) | Live observation this session: would-have-been 7 sequential 4-option AskUserQuestion rounds | Other codification shape: SKILL.md amendment to Step 2.5 / 2.5b authorising volume-based fallback |
| improve | skill | per-iter retro pattern | Each iter retro now surfaces the same 4 categories of pipeline instability (em-dash hook on .afk-run-state, gate-marker re-clear overhead, ADR-074 routing producing many questions, P054 drift). The retros are working; the work-problems orchestrator-main-turn session-level retro is what compounds them | iters 1-7 retros all present; this session-level retro is the compound surface | Self-contained: documented here, no new skill needed |

## Topic File Rotation Candidates

Skipped per Step 3 deferral note: docs/briefing/ per-topic structure does not exist (P100 migration deferred). check-briefing-budgets.sh would have nothing to scan.

## Context Usage (Cheap Layer)

Skipped per orchestrator main-turn context budget pressure (this session's main turn context is at ~75% of envelope after 7 iter dispatches plus intermediate orchestrator work). Per-iter retros each captured the cheap-layer measurement inside their subprocess. The orchestrator main turn would re-measure the same buckets without additional signal.

| Bucket | Bytes | Notes |
|--------|-------|-------|
| (per-iter retros at iter 1, 4, 7 captured these; see those retros for the buckets) | (deferred) | Skipped at orchestrator main turn per context-budget pressure |

Deep analysis recommended: per the iter 7 retro, context buckets grew significantly across the session. Invoke `/wr-retrospective:analyze-context` on next interactive session.

## No Action Needed

- ADR-035, ADR-033 Phase 2, ADR-037, ADR-038, ADR-039 all landed as `.proposed`. Their deferred-sub-decision questions are queued and will surface at next /wr-architect:review-decisions drain.
- All 7 iter subprocesses exited code 0 with no SIGTERM. The idle-timeout SIGTERM mechanism per P121 did not fire (longest iter was iter 5 at ~29 min, well under the 60 min default threshold).
- Per-iter retros all reported lazy=0 ask-hygiene counts. Iters obeyed the orchestrator no-AskUserQuestion-mid-loop constraint cleanly.
- All push:watch invocations passed CI green on first attempt; no fix-and-continue retries fired.
- Risk scores stayed within appetite for all 7 push gates (range: commit=2-4, push=2-4, release=0-1). No above-appetite Rule 5 halts.
- No git conflicts. No stuck subprocess deadlocks. No quota exhaustion.

## Cross-references

- ADR-013 (Structured user interaction for governance decisions): Rule 1 batched AskUserQuestion cap plus Rule 6 fail-safe plus ADR-044 narrowing of Rule 1 to framework-unresolved decisions.
- ADR-014 (Governance skills commit their own work): preserved across all 7 iter subprocesses and this session-level retro commit.
- ADR-022 (Problem verification pending): iter 5 P078 transition to .verifying.md follows this contract.
- ADR-026 (Cite, persist, uncertainty grounding): all retro signals carry specific citations.
- ADR-032 (Governance skill invocation patterns): subprocess-boundary variant via `claude -p` dispatch per P084.
- ADR-044 (Decision-Delegation Contract): framework-resolution boundary governs which observations queue at outstanding_questions vs auto-ticket.
- ADR-074 (Confirm a decision substance before building dependent work): fired correctly 4 times this session.
- P054 (work-problems just-worked KE ranking): contract drift observed live twice this session.
- P083 (ADR compendium stale): captured iter 6.
- P082 (subagent outputs include fabricated references): captured iter 4.
- P342 (iter retros queue observations as outstanding_questions instead of auto-ticketing): iter 4 + iter 6 + iter 7 exercised the mechanical-stage carve-out correctly via /wr-itil:capture-problem.
