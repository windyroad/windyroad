# Session Retrospective, 2026-06-02 work-problems iter on P071

Session: AFK `/wr-itil:work-problems` iter 2 (subprocess via `claude -p`).
Ticket worked: P071 (ADR-016 parameterised sw-critic pattern has poor discoverability + UX; supersede with domain-specific critic agents).
Commit: `2e0348e`.

## Briefing Changes

- Added: none. The existing "Any new `.claude/agents/*.md` file is not discoverable until Claude Code session restart" entry (`docs/BRIEFING.md:13`) already covers the new agents shipped this iter (`wr-newsletter-critic.md`, `wr-wardley-critic.md`); next `/wr-newsletter` run will hit this constraint, but the lesson is already captured.
- Removed: none. The "wr-sw-critic agent will not be discoverable in the session it was created in" entry (`docs/BRIEFING.md:30`, references problem 007) is still accurate as a worked example pointer; the pattern persists. The legacy `wr-sw-critic.md` file is intentionally retained per ADR-033 Phase 3 deferral.
- Updated: none. Scanned `## What You Need to Know` (24 entries) and `## What Will Surprise You` (19 entries); none required edit based on this iter's evidence. Counter-scan: no observation this iter changed the truth of any existing entry.
- README index refreshed: not applicable. `docs/briefing/` tree does not exist in this project; the project uses the legacy single-file `docs/BRIEFING.md` (P100 migration window open).

## Signal-vs-Noise Pass (P105)

AFK iter; signal scoring per-entry was not run in this subprocess (the project uses the legacy single-file briefing, which Step 1.5's per-entry signal scoring is not parametrised for). Defer to next interactive retro that runs after the P100 migration.

## Problems Created/Updated

- `docs/problems/open/071-...md`: Investigation Tasks updated to reflect Phase 1 + Phase 2 done; Phase 3 (retire `wr-sw-critic.md`) deferred until ADR-033 criterion (d) closes. Two new tracking entries added for the ADR-033 and ADR-035 `.accepted` status flips that follow criterion (d).
- No new tickets created this iter.

## Verification Candidates

None. This iter's work landed two new agent files and a SKILL.md migration; it did NOT exercise any existing `.verifying.md` ticket's fix in a way that produces in-session evidence. The new `wr-newsletter-critic` and `wr-wardley-critic` agents will be exercised on the next `/wr-newsletter` run, which is also the path that closes ADR-033 criterion (d).

## Pipeline Instability

Scanned this iter's tool-call history against the six P074 signal categories. One observation, framed for completeness; not new-ticket-worthy:

- **Architect-review marker write requires explicit PASS verdict line.** First architect call returned `**Architecture Review: ISSUES FOUND**` (the canonical flag-and-fix path), so the hook correctly did not write a PASS marker. Subsequent file write was blocked. Second architect call (after I revised the plan to address all 3 issues) returned `**Architecture Review: PASS**`; hook wrote the marker; file write unblocked. This is the documented contract working as designed: marker writes on PASS only, not on ISSUES FOUND. Citation: turn-position of first architect agent response containing `ISSUES FOUND` (no marker), turn-position of second architect agent response containing `PASS` (marker written; subsequent `Write` tool call succeeded). No category fires; the contract is correct, the friction was self-induced (my first plan was incomplete).

README inventory currency: skipped. `packages/` directory not present in this project (the project is an adopter, not a plugin host). Detector gracefully no-op'd with `check-readme-jtbd-currency: packages dir not found: packages`. Per ADR-013 Rule 6, advisory-only with documented fail-open.

## Topic File Rotation Candidates

`docs/BRIEFING.md` is 18899 bytes, which exceeds the 10240-byte threshold by 1.85x (`OVER`, not `MUST_SPLIT`). However, the legacy single-file briefing is in the P100 migration window; per the P100 transition contract the legacy file is read-only and the rotation pass does not apply to it. No action. Once P100 slice 2 lands the `docs/briefing/*.md` topic-file tree, the Tier 3 budget pass will fire normally on each topic file.

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

Persisted to `docs/retros/2026-06-02-work-problems-iter-p071-ask-hygiene.md`.

## Codification Candidates

| Kind | Shape | Suggested name / Target file | Scope / Flaw | Triggers / Evidence | Decision |
|------|-------|------------------------------|--------------|---------------------|----------|
| (none) | n/a | n/a | n/a | n/a | no codification candidates this iter |

No recurring class-of-behaviour observation surfaced this iter. The work was scope-bounded ADR-033 Phase 2 + ADR-035 criterion 4 implementation; both ADRs already capture the codification (the agent shape, the SKILL.md call-sites, the rubric simplification). Nothing new this iter to codify.

## Context Usage (Cheap Layer)

Per the wr-retrospective-measure-context-budget script. Prior snapshot: `docs/retros/2026-05-13-context-analysis.md` (20 days ago).

| Bucket | Bytes | % of total | Delta vs prior |
|--------|-------|------------|----------------|
| problems | 682461 | 43.8% | +250873 (+58.1%) |
| memory | 386571 | 24.8% | +178102 (+85.4%) |
| decisions | 315119 | 20.2% | +81981 (+35.2%) |
| skills | 131040 | 8.4% | +31371 (+31.5%) |
| jtbd | 23200 | 1.5% | +756 (+3.4%) |
| hooks | 14402 | 0.9% | +1492 (+11.6%) |
| project-claude-md | 7530 | 0.5% | 0 (no change) |
| briefing | not measured (source-absent) | n/a | n/a (legacy single-file; docs/briefing/ tree not yet present) |
| framework-injected | not measured (framework-injected-no-on-disk-source) | n/a | n/a |

Top 5 offenders (bytes-descending, ADR-026 citation required):
1. `docs/problems/*` = 682461 bytes (measurement-method: byte-count-on-disk). Highest growth source: open-tickets backlog + verifying-tickets accumulation.
2. `~/.claude/.../memory/*` = 386571 bytes (byte-count-on-disk). Largest single delta (+85.4%); memory has accumulated nearly twice its prior size in 20 days.
3. `docs/decisions/*` = 315119 bytes (byte-count-on-disk). +35% reflects the ADR cadence over the last 20 days (ADRs 030 to 036 plus body-text growth on earlier ADRs).
4. `.claude/skills/*` = 131040 bytes (byte-count-on-disk). +31% reflects the wr-newsletter SKILL.md growth (phase model expansion, URL verification gate, the two new agent invocations this iter).
5. `docs/jtbd/*` = 23200 bytes (byte-count-on-disk). Effectively unchanged.

Per-plugin breakdown available in /wr-retrospective:analyze-context (deep layer).

**Deep analysis recommended: invoke /wr-retrospective:analyze-context.** Four buckets exceed the +20% delta threshold since prior snapshot (problems +58%, memory +85%, decisions +35%, skills +31%); deep layer can attribute the growth per-turn / per-plugin and propose trim candidates. Last deep run was 2026-05-13 (20 days ago, exceeds 14-day staleness threshold).

## No Action Needed

- The work itself: P071 Phase 2 landed cleanly; commit 2e0348e is on master locally; orchestrator's Step 6.5 owns the push decision.
- Iter 1's retro pattern (no AskUserQuestion, all framework-resolved): same shape this iter.
- The existing ADR-035 amendment to ADR-016 / ADR-025 already captured the rubric-shape lessons; no new lessons surfaced this iter.
