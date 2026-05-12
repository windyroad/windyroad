# Context Analysis, 2026-05-13

> Source: `/wr-retrospective:analyze-context` (deep layer per ADR-043).
> Methodology: byte-count-on-disk, per-plugin decomposition, per-turn attribution (when session log available).
> Cheap-layer baseline: `packages/retrospective/scripts/measure-context-budget.sh` (via `wr-retrospective-measure-context-budget` shim).
> First deep run for this project. Subsequent retros' Step 2c reads the HTML-comment trailer at the bottom of this file for delta comparison.

## Bucket Totals

Total measured: 1,015,748 bytes (~992 KB). No prior snapshot; first measurement this project.

| Bucket | Bytes | % of measured | Δ vs prior |
|--------|------:|--------------:|------------|
| problems | 431,588 | 42.5% | first measurement |
| decisions | 233,138 | 22.9% | first measurement |
| memory | 208,469 | 20.5% | first measurement |
| skills | 99,669 | 9.8% | first measurement |
| jtbd | 22,444 | 2.2% | first measurement |
| hooks | 12,910 | 1.3% | first measurement |
| project-claude-md | 7,530 | 0.7% | first measurement |
| briefing | not measured (source-absent: legacy single-file `docs/BRIEFING.md`, no `docs/briefing/` tree yet) | n/a | n/a |
| framework-injected | not measured (no on-disk source) | n/a | n/a |

Cheap-layer measured-this-session delta (against the in-session baseline emitted by run-retro Step 2c ~6 turns earlier in this conversation): problems +2,319 bytes (+0.5%), accounted for by `docs/problems/059-npm-run-push-watch-exits-141-sigpipe-on-successful-push.open.md` captured this session. All other buckets unchanged.

## Per-Plugin Decomposition

Note on scope: the cheap-layer `hooks` bucket (12,910) measures `${PROJECT_ROOT}/.claude/hooks/**/*.sh` only (windyroad is an adopter repo, `packages/` not present locally). The `wr-retrospective-list-plugin-attribution` helper measures the installed plugin cache (`~/.claude/plugins/cache/...`). The two scopes are intentionally different: cheap layer surfaces what this project ships and loads as project-local hooks; helper surfaces the entire installed plugin surface available to the session. Plugin-cache sums therefore exceed the cheap-layer bucket; this is the expected adopter-repo shape, not a defect.

### Hooks (cheap-layer aggregate: 12,910 bytes from `.claude/hooks/`; plugin-cache sum: 285,310 bytes)

| Plugin | Bytes | % of plugin-cache hooks |
|--------|------:|------------------------:|
| wr-itil | 95,780 | 33.6% |
| wr-risk-scorer | 69,552 | 24.4% |
| wr-tdd | 26,937 | 9.4% |
| wr-architect | 22,930 | 8.0% |
| wr-jtbd | 21,287 | 7.5% |
| wr-voice-tone | 19,191 | 6.7% |
| wr-style-guide | 19,156 | 6.7% |
| wr-retrospective | 10,477 | 3.7% |

### Skills (cheap-layer aggregate: 99,669 bytes from `.claude/skills/` if present; plugin-cache sum: 709,164 bytes)

| Plugin | Bytes | % of plugin-cache skills |
|--------|------:|-------------------------:|
| wr-itil | 479,816 | 67.7% |
| wr-retrospective | 89,015 | 12.6% |
| wr-risk-scorer | 50,312 | 7.1% |
| skill-creator | 33,168 | 4.7% |
| wr-architect | 23,485 | 3.3% |
| wr-wardley | 11,926 | 1.7% |
| wr-jtbd | 9,684 | 1.4% |
| wr-style-guide | 3,895 | 0.5% |
| wr-voice-tone | 3,834 | 0.5% |
| wr-tdd | 3,369 | 0.5% |
| wr-c4 | 660 | 0.1% |

## Top-N Offenders

Top surfaces by individual file size (largest contributors to the corresponding bucket):

| Surface | Bytes | Bucket | Comparable prior |
|---------|------:|--------|------------------|
| `~/.claude/plugins/cache/windyroad/wr-itil/0.27.1/skills/work-problems/SKILL.md` | 100,611 | skills (wr-itil) | P097 cluster (ADR-038 size budget); no documented reclaim amount yet |
| `~/.claude/plugins/cache/windyroad/wr-itil/0.27.1/skills/manage-problem/SKILL.md` | 84,262 | skills (wr-itil) | P097 cluster (ADR-038 size budget); no documented reclaim amount yet |
| `~/.claude/plugins/cache/windyroad/wr-retrospective/0.18.1/skills/run-retro/SKILL.md` | 73,377 | skills (wr-retrospective) | P097 cluster (ADR-038 size budget); no documented reclaim amount yet |
| `docs/problems/` (aggregate, 60 ticket files + README) | 431,588 | problems | not estimated, no prior data |
| `docs/decisions/` (aggregate, ~60 ADR files) | 233,138 | decisions | not estimated, no prior data |
| `~/.claude/.../memory/` (aggregate, index + per-memory files) | 208,469 | memory | not estimated, no prior data |

## Per-Turn Attribution

Per-turn attribution: not measured, no session log accessible. `${CLAUDE_PROJECT_DIR}/.afk-run-state/outstanding-questions.jsonl` is present but empty (0 lines); no AFK-orchestrator turn-by-turn JSONL is being produced for this interactive session.

## Suggestions

Per ADR-026: each suggestion cites a specific surface plus a comparable prior plus a concrete byte estimate, or marks `not estimated, no prior data`.

1. **wr-itil skills bucket (479,816 bytes, 67.7% of plugin-cache skills)**. `work-problems/SKILL.md` (100KB) and `manage-problem/SKILL.md` (84KB) dominate. Comparable prior: P097 cluster (ADR-038 SKILL.md size budget tickets). Estimated reclaim: not estimated, no prior reclamation amount documented yet. Investigation candidate: split work-problems Phase 1 / Phase 2 / Phase 3 prose into REFERENCE.md (ADR-038 progressive-disclosure pattern; same shape as `analyze-context/REFERENCE.md` precedent referenced in P155).
2. **problems bucket (431,588 bytes, 42.5% of measured total)**. 60 ticket files, 6 closed. Comparable prior: P100 split `docs/BRIEFING.md` into per-topic files (no reclaim count documented for that one yet, but the pattern is established). Estimated reclaim: not estimated, no prior data. Investigation candidate: archive closed tickets to `docs/problems/closed-archive/` after a settle period; preserve git history.
3. **decisions bucket (233,138 bytes, 22.9% of measured total)**. ~60 ADR files; ADRs are reference material and are read on-demand by reviewer agents (architect, jtbd). Comparable prior: not estimated, no prior reclamation. Investigation candidate: index-and-defer pattern (a docs/decisions/README.md index that summarises ADRs by status; full bodies loaded only when an agent cites the ID); risk is that on-demand load violates the cheap-layer measurement contract.
4. **memory bucket (208,469 bytes, 20.5% of measured total)**. `MEMORY.md` index plus ~30 per-memory files. Comparable prior: not estimated, no prior reclamation. Some memories may be stale (review the index against current behaviours; consolidate where two memories cover the same correction). Investigation candidate: run `feedback_*.md` review pass and merge near-duplicates; risk is that consolidation erodes citation traceability.
5. **wr-retrospective skills bucket (89,015 bytes, 12.6% of plugin-cache skills)**. `run-retro/SKILL.md` (73KB) dominates. Comparable prior: P097 cluster (ADR-038 size budget). Estimated reclaim: not estimated, no prior reclamation amount documented yet. Investigation candidate: split run-retro Step 2c / Step 2d / Step 4a sub-step prose into REFERENCE.md (same ADR-038 progressive-disclosure pattern as analyze-context).

## Policy Breaches

ADR-038 SKILL.md size cluster (P097): 3 active-version SKILL.md files exceed the 50KB anchor budget.

| Budget | Offender | Bytes | Citation |
|--------|----------|------:|----------|
| ADR-038 SKILL.md <= 50KB (P097 anchor) | `~/.claude/plugins/cache/windyroad/wr-itil/0.27.1/skills/work-problems/SKILL.md` | 100,611 | P097 |
| ADR-038 SKILL.md <= 50KB (P097 anchor) | `~/.claude/plugins/cache/windyroad/wr-itil/0.27.1/skills/manage-problem/SKILL.md` | 84,262 | P097 |
| ADR-038 SKILL.md <= 50KB (P097 anchor) | `~/.claude/plugins/cache/windyroad/wr-retrospective/0.18.1/skills/run-retro/SKILL.md` | 73,377 | P097 |

ADR-040 Tier 1 / Tier 2 / Tier 3 briefing budgets: not measured. Briefing is the legacy single-file `docs/BRIEFING.md` (no `docs/briefing/` tree yet). The `check-briefing-budgets.sh` helper is not installed in this project's PATH; the cheap layer reports `briefing not-measured reason=source-absent`. No breach can be evaluated until P100 lands the per-topic tree.

ADR-038 hook prose budget (<=150 bytes per subsequent-prompt reminder): not sampled this run. The five UserPromptSubmit reminder bodies visible in this session were re-rendered at session start; their bytes are framework-injected and not on-disk-measurable from this skill's scope. Sampling deferred until a hook-prose scanner exists (P049 sibling territory).

## Cheap-layer / deep-layer scope mismatch finding

The SKILL.md Step 2 prose claims the aggregate cheap-layer `hooks` row equals the sum of all `PLUGIN-HOOKS` rows (sanity-check the report); same for `skills`. This is not what we observe in this adopter repo:

- Cheap-layer `hooks bytes=12910` versus plugin-cache sum 285,310 (gap 272,400 bytes).
- Cheap-layer `skills bytes=99669` versus plugin-cache sum 709,164 (gap 609,495 bytes).

Root cause: cheap-layer script walks `${PROJECT_ROOT}/packages/*/hooks/**/*.sh` plus `${PROJECT_ROOT}/.claude/hooks/**/*.sh`. windyroad has no `packages/` (it is an adopter, not a plugin source repo); the only contributor is the 6 hook files in `.claude/hooks/` (12,910 bytes). The plugin-attribution helper walks the installed plugin cache (`~/.claude/plugins/cache/...`), which is the much larger surface the session actually loads from.

The two scopes are not meant to match for an adopter repo. The SKILL.md prose claim is correct only for windyroad-claude-plugin (the plugin source repo where `packages/` exists). Surfacing this as a documentation drift candidate; deferred to a future analyze-context iteration that runs against the source-repo to validate the scope claim there.

<!--
context-snapshot:
  total-bytes: 1015748
  hooks: 12910
  skills: 99669
  memory: 208469
  briefing: not-measured-source-absent
  decisions: 233138
  problems: 431588
  jtbd: 22444
  project-claude-md: 7530
  framework-injected: not-measured-framework-injected
  measurement-method: byte-count-on-disk
  measured-at: 2026-05-13
-->
