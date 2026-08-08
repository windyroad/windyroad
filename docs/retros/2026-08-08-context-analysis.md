# Context Analysis - 2026-08-08

> Source: `/wr-retrospective:analyze-context` (deep layer per ADR-043).
> Auto-fired from `run-retro` Step 2c: the `decisions` bucket grew 115,176 bytes (+22.9%) since the 2026-08-05 snapshot, clearing both the 20% and the 10 KB absolute floor. Calendar-elapse was 3 days, so the delta axis is what fired. Once-per-day guard was clear.
> Methodology: byte-count-on-disk via `wr-retrospective-measure-context-budget` + per-plugin decomposition via `wr-retrospective-list-plugin-attribution`. Per-turn attribution not available (see below).

## Bucket Totals

Total measured: 2,888,359 bytes. Prior snapshot (2026-08-05): 2,497,809 bytes measured across a smaller bucket set.

| Bucket | Bytes | % of measured | Delta vs prior |
|--------|-------|---------------|----------------|
| problems | 1,276,716 | 44.2% | +141,799 (+12.5%) |
| memory | 647,922 | 22.4% | +21,050 (+3.4%) |
| decisions | 617,632 | 21.4% | **+115,176 (+22.9%)** |
| skills | 206,180 | 7.1% | +22,508 (+12.3%) |
| briefing | 82,313 | 2.9% | no prior (was `not-measured-source-absent`) |
| jtbd | 33,626 | 1.2% | +7,704 (+29.7%, under the 10 KB floor) |
| hooks | 14,402 | 0.5% | 0 (0.0%) |
| project-claude-md | 9,568 | 0.3% | 0 (0.0%) |
| framework-injected | not measured | - | reason: `framework-injected-no-on-disk-source` |

The `decisions` bucket is the trigger. It is also the second-fastest grower in percentage terms after `jtbd`, and unlike `jtbd` it is large enough that the growth matters: 115 KB in three days on a bucket that is already 21% of measured context.

## Per-Plugin Decomposition

**Read the aggregate mismatch before the tables.** The skill's own sanity-check ("the aggregate cheap-layer `hooks` row equals the sum of all `PLUGIN-HOOKS` rows") **fails**, in both directions and by a wide margin:

| Surface | Cheap-layer aggregate | Sum of per-plugin rows | Ratio |
|---|---|---|---|
| hooks | 14,402 | 550,270 | 38x |
| skills | 206,180 | 1,354,963 | 6.6x |

The cause is measurable rather than speculative: `wr-retrospective-list-plugin-attribution` walks the plugin cache at `~/.claude/plugins/cache/windyroad/`, which holds **eleven** installed versions of `wr-itil` alone (0.29.0, 0.37.1, 0.49.2, 0.49.4, 0.50.1, 0.50.3, 0.51.0, 0.51.1, 0.57.1, 0.59.0, 0.59.2), totalling 42,792 KB. Only 0.59.2 is active. The cheap layer measures the active surface; the attribution helper measures everything on disk. Neither is wrong, but the two are not comparable and the report must not pretend they are.

Consequence: **the per-plugin tables below are upper bounds across all cached versions, not the live context cost.** Treat the relative ordering as signal and the absolute numbers as inflated by roughly the version-count multiplier for whichever plugin has the most cached versions.

### Hooks (per-plugin, all cached versions)

| Plugin | Bytes | % of per-plugin sum |
|--------|-------|---------------------|
| wr-itil | 186,354 | 33.9% |
| wr-risk-scorer | 118,484 | 21.5% |
| wr-architect | 72,880 | 13.2% |
| wr-voice-tone | 64,781 | 11.8% |
| wr-jtbd | 43,389 | 7.9% |
| wr-style-guide | 27,801 | 5.1% |
| wr-retrospective | 21,818 | 4.0% |
| wr-cruise | 14,315 | 2.6% |
| ponytail | 448 | 0.1% |
| accessibility-agents | 0 | 0.0% |

### Skills (per-plugin, all cached versions)

| Plugin | Bytes | % of per-plugin sum |
|--------|-------|---------------------|
| wr-itil | 1,008,146 | 74.4% |
| wr-retrospective | 118,136 | 8.7% |
| wr-risk-scorer | 74,674 | 5.5% |
| wr-architect | 67,938 | 5.0% |
| skill-creator | 33,168 | 2.4% |
| wr-jtbd | 21,702 | 1.6% |
| ponytail | 15,500 | 1.1% |
| wr-voice-tone | 10,473 | 0.8% |
| wr-style-guide | 3,895 | 0.3% |
| wr-cruise | 1,331 | 0.1% |

## Top-N Offenders

| Surface | Bytes | Bucket | Comparable prior |
|---------|-------|--------|------------------|
| `docs/problems/` tree | 1,276,716 | problems | P100 split `BRIEFING.md` into per-topic files; the same progressive-disclosure shape has never been applied to the problems tree |
| `~/.claude/.../memory/` | 647,922 | memory | not estimated - no prior data |
| `docs/decisions/` tree | 617,632 | decisions | not estimated - no prior data |
| `wr-itil/0.59.2/skills/work-problems/SKILL.md` | 231,201 | skills | P097 is the evolving budget anchor for the SKILL.md size cluster |
| `~/.claude/plugins/cache/windyroad/wr-itil/` (11 versions) | 43,819,008 (42,792 KB) | not in a measured bucket | P095 reclaimed ~120 KB by once-per-session gating; nothing comparable exists for cache-version pruning |

## Per-Turn Attribution

`per-turn attribution: not measured - no session log accessible`. `.afk-run-state/` holds only `outstanding-questions.jsonl` and `risk-register-queue.jsonl`; neither carries per-turn `usage` fields. This iteration ran as a dispatched sub-session rather than under an orchestrator writing a turn log.

## Suggestions

1. **decisions (617,632 bytes, +22.9% in three days)** - This bucket triggered the analysis and has no progressive-disclosure structure: every ADR body is a peer file with no tier split, so the whole corpus is a single readable surface. The nearest precedent is the briefing tree, which had the same shape until it was split. Comparable prior: `P100 split BRIEFING.md into per-topic files` (briefing then dropped out of the top-3 buckets entirely, and now sits at 2.9% of measured). Estimated byte saving: `not estimated - no prior data` for the decisions surface specifically, because the briefing split reduced what a session *loads*, and no equivalent load-path measurement exists for `docs/decisions/`.

2. **problems (1,276,716 bytes, 44.2% of measured)** - The single largest bucket by a factor of two, and it grows on every capture. `docs/problems/README.md` is already the progressive-disclosure surface for it, and the P134 rotation already drains line 3 into `README-history.md`; what has no rotation is the closed-ticket corpus, which is append-only. Comparable prior: `P100` again (the archive-sibling shape). Estimated byte saving: `not estimated - no prior data`.

3. **`wr-itil/0.59.2/skills/work-problems/SKILL.md` (231,201 bytes)** - 4.6x the 50 KB anchor P097 names, and the largest single file in the skills bucket. It is upstream-owned, so this is an observation rather than a local action. Comparable prior: `not estimated - no prior data`.

4. **Plugin cache retention (42,792 KB for wr-itil alone, across 11 versions)** - Not a measured bucket and not a context cost in the loading sense, but it is what makes the per-plugin attribution above unusable as an absolute measure. Pruning to the active version plus one rollback would make the attribution tables comparable to the cheap-layer aggregates. Comparable prior: `not estimated - no prior data`.

## Policy Breaches

| Budget | Offender | Bytes | Citation |
|--------|----------|-------|----------|
| ADR-038 SKILL.md size cluster (50 KB, per P097) | `wr-itil/0.59.2/skills/work-problems/SKILL.md` | 231,201 | measured via `find ... -size +50k` on the plugin cache; five further cached versions of the same file also breach |
| ADR-040 Tier 3 (5,120-byte ceiling) | `docs/briefing/what-you-need-to-know.md` | 7,162 (post-rotation, was 12,347) | measured via `wc -c`; was above the 10,240-byte MUST_SPLIT ratio before this retro's rotation, now above ceiling but below MUST_SPLIT |
| ADR-040 Tier 3 (5,120-byte ceiling) | `docs/briefing/what-will-surprise-you.md` | 5,815 (post-rotation, was 11,826) | as above |
| ADR-049 (no repo-relative script paths in plugin skills) | this skill's own Step 0, `test -x packages/retrospective/scripts/measure-context-budget.sh` | n/a | third site of the defect captured as P130; the path does not resolve in a consumer repo, so the Step 0 guard fails open and the analysis proceeds only because Step 1 uses the shim correctly |

Note on the Tier 3 rows: `packages/retrospective/scripts/check-briefing-budgets.sh` (the detector Step 5 prescribes) is the first of P130's two sites and does not resolve here, so both Tier 3 rows were measured by hand with `wc -c` rather than read from the detector.

<!--
context-snapshot:
  total-bytes: 2888359
  hooks: 14402
  skills: 206180
  memory: 647922
  briefing: 82313
  decisions: 617632
  problems: 1276716
  jtbd: 33626
  project-claude-md: 9568
  framework-injected: not-measured-framework-injected
  measurement-method: byte-count-on-disk
  measured-at: 2026-08-08
-->
