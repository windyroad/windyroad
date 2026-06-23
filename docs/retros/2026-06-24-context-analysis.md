# Context Analysis, 2026-06-24

> Source: `/wr-retrospective:analyze-context` (deep layer per ADR-043). Auto-fired from run-retro Step 2c: prior snapshot 2026-05-13 is 42 days old (>14-day cadence) and multiple buckets breached the 20% delta trigger.
> Methodology: byte-count-on-disk + per-plugin decomposition. Per-turn attribution not available (interactive session, no turn-usage log).
> Cheap-layer baseline: `measure-context-budget` shim (ADR-049).

## Bucket Totals

Total measured: **1,967,637 bytes** vs prior 1,015,748 (2026-05-13) = **+93.7%** over 42 days.

| Bucket | Bytes | % of measured | Δ vs prior |
|--------|-------|---------------|------------|
| problems | 887,047 | 45.1% | **+105.5%** (was 431,588) |
| memory | 477,640 | 24.3% | **+129.1%** (was 208,469) |
| decisions | 405,309 | 20.6% | **+73.8%** (was 233,138) |
| skills (project-local) | 152,509 | 7.7% | +53.0% (was 99,669) |
| jtbd | 23,200 | 1.2% | +3.4% (was 22,444) |
| hooks (project-local) | 14,402 | 0.7% | +11.6% (was 12,910) |
| project-claude-md | 7,530 | 0.4% | 0.0% (was 7,530) |
| briefing | not measured | reason=source-absent (legacy single-file `docs/BRIEFING.md`; no `docs/briefing/` tree) |
| framework-injected | not measured | reason=framework-injected-no-on-disk-source |

Four buckets breached the 20% delta trigger: problems, memory, decisions, skills. The auto-fire was correct.

## Per-Plugin Decomposition

**Adopter-mode caveat (ADR-026):** this project root has no `packages/`, so the cheap-layer `hooks`/`skills` buckets measure the project-local `.claude/` surfaces (14,402 / 152,509) while the plugin-attribution shim below walks the *installed plugin cache*. The two are different surfaces and do NOT sum to the cheap-layer aggregates here; the documented "aggregate equals sum of plugin rows" sanity-check holds only in source-repo mode. Numbers below are installed-plugin-cache byte counts, not project-local.

### Hooks (installed plugin cache)

| Plugin | Bytes |
|--------|-------|
| wr-itil | 154,970 |
| wr-risk-scorer | 108,886 |
| wr-architect | 68,821 |
| wr-voice-tone | 59,564 |
| wr-jtbd | 39,893 |
| wr-style-guide | 24,305 |
| wr-retrospective | 17,163 |

### Skills (installed plugin cache)

| Plugin | Bytes |
|--------|-------|
| wr-itil | 921,320 |
| wr-retrospective | 116,481 |
| wr-risk-scorer | 68,550 |
| wr-architect | 64,100 |
| skill-creator | 33,168 |
| wr-jtbd | 21,702 |
| wr-voice-tone | 10,119 |
| wr-style-guide | 3,895 |

## Top-N Offenders

| Surface | Bytes | Bucket | Comparable prior |
|---------|-------|--------|------------------|
| `wr-itil/skills/work-problems/SKILL.md` | 216,843 | skills (plugin) | P097 (SKILL.md size cluster) |
| `docs/problems/README.md` | 39,461 | problems | P282 (Verification Queue exceeded 25K-token Read cap) |
| `docs/decisions/020-newsletter-editor-subagent.proposed.md` | 29,587 | decisions | not estimated, no prior data |
| `docs/decisions/README.md` | 25,043 | decisions | P083 (ADR compendium stale) |
| `docs/problems/open/081-...external-editorial-reviewer-subagent.md` | 17,982 | problems | not estimated, no prior data |

## Per-Turn Attribution

per-turn attribution: not measured, no session log accessible (this is an interactive session; `.afk-run-state/` holds only `outstanding-questions.jsonl` and `risk-register-queue.jsonl`, not turn-usage logs).

## Suggestions

1. **problems (887KB, +105%)**: the bucket doubled, driven by ticket accumulation (102 ticket files) and a 39KB `README.md`. The per-state subdir layout is already in place; the live in-context cost is `README.md`. Comparable prior: P282 (Verification Queue exceeded the 25K-token Read cap, forcing paged reads) reclaimed read-cost by persisted-output paging. Estimated saving: not estimated, no byte-level prior; candidate action is a closed-ticket archive split mirroring P100's per-topic BRIEFING split.
2. **memory (478KB, +129%)**: fastest-growing bucket. `MEMORY.md` index (7.5KB) loads every session; individual feedback memories run 5-6KB (`feedback_smallest_change_satisfies_correction.md` 5.9KB). Comparable prior: not estimated, no prior memory-trim reclamation on record. Candidate action: prune superseded memories (this session superseded `feedback_silent_classify_obvious_capture_type.md` in place rather than deleting; a delete-superseded sweep would reclaim index + body bytes).
3. **decisions (405KB, +74%)**: `decisions/README.md` (25KB) is flagged stale by P083 (ADR compendium lists 8 entries while ~40 ADR files exist). Regenerating the compendium would not shrink the bucket but would correct the load-bearing index. Estimated saving: not estimated, no prior data.
4. **skills project-local (152KB, +53%)**: dominated by the `wr-newsletter` SKILL.md. Comparable prior: P097 (SKILL.md size cluster, evolving budget anchor). Project-local trim is a newsletter-skill concern, not addressed here.

## Policy Breaches

| Budget | Offender | Bytes | Citation |
|--------|----------|-------|----------|
| ADR-038 SKILL.md <=50KB (P097) | `wr-itil/skills/work-problems/SKILL.md` (live 0.51.2) | 216,843 | P097 (SKILL.md size cluster). Upstream plugin surface, not project-trimmable here. |

ADR-040 briefing tier budgets: not measured (no `docs/briefing/` tree; legacy single-file `docs/BRIEFING.md` in use). ADR-038 hook prose budget (<=150 bytes): not measured this run.

<!--
context-snapshot:
  total-bytes: 1967637
  hooks: 14402
  skills: 152509
  memory: 477640
  briefing: not-measured-source-absent
  decisions: 405309
  problems: 887047
  jtbd: 23200
  project-claude-md: 7530
  framework-injected: not-measured-framework-injected
  measurement-method: byte-count-on-disk
  measured-at: 2026-06-24
-->
