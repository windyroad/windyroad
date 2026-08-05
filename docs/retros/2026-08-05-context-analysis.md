# Context Analysis 2026-08-05

> **ID namespace warning.** Every `ADR-NNN` and `P<NNN>` reference in this report is an **upstream `@windyroad` plugin** governance ID, inherited from the `wr-retrospective` skill contract that generated it. They are NOT this repository's `docs/decisions/` or `docs/problems/` IDs, and several collide: upstream ADR-043 is the two-layer context-measurement decision, while local ADR-043 is the bounded editorial remediation loop; upstream ADR-040 is the briefing tier budgets, local ADR-040 is the per-date-subdir drafts layout; upstream ADR-038 is progressive disclosure, local ADR-038 is the cross-edition thesis check; upstream ADR-026 is agent output grounding, local ADR-026 is reviews-to-sibling-files. The same holds for ADR-049, ADR-078, and every `P<NNN>` above 124 (this repository's highest ticket). Resolve these against the plugin cache, not against `docs/`.

> Source: `/wr-retrospective:analyze-context` (deep layer per ADR-043, Progressive context-usage measurement and reporting for retrospective sessions).
> Auto-fired from `/wr-retrospective:run-retro` Step 2c on the calendar-elapse axis: the prior report is `docs/retros/2026-06-24-context-analysis.md`, 42 days old against a 14-day threshold. No `docs/retros/2026-08-05-context-analysis.md` existed, so the once-per-day guard did not fire.
> Methodology: byte-count-on-disk via `wr-retrospective-measure-context-budget`, per-plugin decomposition via `wr-retrospective-list-plugin-attribution`. Both invoked through their ADR-049 `$PATH` shims; this repository has no `packages/` tree, so the Step 0 repo-relative `test -x packages/retrospective/scripts/measure-context-budget.sh` check does not resolve here and the shim is the only valid entry point.

## Bucket Totals

Measured total: 2,497,809 bytes. Prior measured total (2026-06-24 snapshot): 1,967,637 bytes. Delta: +530,172 bytes (+26.9%).

| Bucket | Bytes | % of measured | Δ vs prior |
|--------|-------|---------------|------------|
| problems | 1,134,917 | 45.4% | +247,870 (+27.9%) |
| memory | 626,872 | 25.1% | +149,232 (+31.2%) |
| decisions | 502,456 | 20.1% | +97,147 (+24.0%) |
| skills | 183,672 | 7.4% | +31,163 (+20.4%) |
| jtbd | 25,922 | 1.0% | +2,722 (+11.7%) |
| hooks | 14,402 | 0.6% | 0 (0.0%) |
| project-claude-md | 9,568 | 0.4% | +2,038 (+27.1%) |

Not-measured buckets, sentinels carried verbatim from the script:

| Bucket | Sentinel |
|--------|----------|
| briefing | `not-measured reason=source-absent` |
| framework-injected | `not-measured reason=framework-injected-no-on-disk-source` |

The `briefing` sentinel is itself a finding, not an absence of one. This repository still carries the legacy single-file `docs/BRIEFING.md` (60,527 bytes) and has no `docs/briefing/` tree, so the measurement script finds no source at the path it looks for. The briefing cost is real and unmeasured. See Policy Breaches below.

Four buckets clear both axes of the run-retro Step 2c delta trigger (>20% AND >10,240 bytes): problems, memory, decisions, skills. `project-claude-md` clears the percentage axis (+27.1%) but not the absolute floor (+2,038 bytes), which is the exact noise case the ADR-043 Amendment 2026-06-17 floor was added to suppress.

## Per-Plugin Decomposition

The cheap layer's `hooks` and `skills` buckets measure this repository's own `.claude/` surfaces. The attribution helper, finding no `packages/` tree here, resolved in cache-fallback mode and measured the plugin cache under `~/.claude/plugins/cache/windyroad/`. The two are therefore **not** summable against each other: the cheap-layer `hooks=14,402` does not equal the 550,270-byte plugin-hooks sum below, because they measure different surfaces. Recording the divergence rather than reconciling it, per ADR-026.

### Hooks (plugin-cache aggregate: 550,270 bytes)

| Plugin | Bytes | % of plugin hooks |
|--------|-------|-------------------|
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

### Skills (plugin-cache aggregate: 1,354,963 bytes)

| Plugin | Bytes | % of plugin skills |
|--------|-------|--------------------|
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

The plugin-skills figure counts every cached version, not just the active one. `find ~/.claude/plugins/cache/windyroad -name SKILL.md -size +50k` returns eight copies of `wr-itil` `work-problems/SKILL.md` alone, one per retained version from 0.50.1 through 0.59.2, ranging 210,267 to 245,245 bytes. Only the active version loads into context, so the 1,008,146-byte `wr-itil` row overstates context cost by roughly the retained-version multiple. It is an accurate disk measurement and a misleading context proxy; both facts are recorded here so the next reader does not treat the row as a context figure.

## Top-N Offenders

| Surface | Bytes | Bucket | Comparable prior |
|---------|-------|--------|------------------|
| `docs/problems/README-history.md` | 81,661 | problems | P134 capped `docs/problems/README.md` line 3 at 1,024 bytes soft / 5,120 hard and routed the displaced text here; the archive is the intended sink, so growth is by design |
| `docs/BRIEFING.md` | 60,527 | briefing (unmeasured) | P100 split BRIEFING.md into per-topic files upstream; this repository never adopted the split |
| `docs/problems/README.md` | 50,974 | problems | P282 records this file crossing the Read-tool 25K-token whole-file cap at 134 KB in another repo, forcing paged reads |
| `~/.claude/plugins/cache/windyroad/wr-itil/0.59.2/skills/work-problems/SKILL.md` | 231,201 | skills (plugin cache) | not estimated, no prior data for a work-problems size reclamation |
| `docs/decisions/README.md` | 31,609 | decisions | ADR-078 moved compendium authoring from the batch generator to a per-edit PostToolUse hook, which is a growth-rate control rather than a reclamation |

## Per-Turn Attribution

per-turn attribution: not measured, no session log accessible. `.afk-run-state/` contains only `outstanding-questions.jsonl` and `risk-register-queue.jsonl`; neither carries per-turn `usage` fields.

## Suggestions

1. **briefing** Adopt the per-topic `docs/briefing/` tree so the bucket stops reading as `source-absent`. `/wr-retrospective:migrate-briefing` exists for exactly this migration and is idempotent. Today `docs/BRIEFING.md` is 60,527 bytes in one file that every retro reads end to end, and the measurement script reports the bucket as absent, so the largest single unmeasured surface is also the one with no budget enforcement. Comparable prior: P100 split BRIEFING.md into per-topic files, after which P099 promoted the ADR-040 Tier 3 per-file budget to advisory enforcement. Estimated byte saving: no bytes are reclaimed by the migration itself; the gain is that the 60,527 bytes become measurable and per-file budget-enforced, which is the precondition for the P099 rotation pass to act at all.

2. **problems** `docs/problems/README.md` is 50,974 bytes and every `manage-problem` / `work-problems` / retro invocation reads it. The Verification Queue is the dominant section: 14 tickets in `docs/problems/verifying/`, each carrying a multi-sentence `Fix summary` cell and an evidence-bearing `Likely verified?` cell. Draining the queue is the reclamation lever, not trimming the prose. Comparable prior: P282 documents this exact file reaching 134 KB elsewhere and exceeding the Read-tool 25K-token cap, which forced persisted-output and paged reads. Estimated byte saving: not estimated, no prior data on per-ticket VQ row cost after a drain.

3. **skills (plugin cache)** Prune superseded `wr-itil` versions from `~/.claude/plugins/cache/windyroad/`. Eight versions of `work-problems/SKILL.md` are retained at 210 KB to 245 KB each, roughly 1.8 MB for seven inactive copies. This does not reduce context (only the active version loads), so the benefit is disk and the accuracy of this report's own attribution numbers, not session budget. Comparable prior: not estimated, no prior data.

4. **decisions** `docs/decisions/README.md` at 31,609 bytes is the compendium the architect agent reads first on every review, so it is on the hot path of every gated edit. ADR-078 already moved authoring to a per-edit hook, which controls growth rate. No trim is proposed: the file is a derived view whose size tracks the 43-ADR corpus, and the corpus is the thing that grew. Estimated byte saving: not estimated, no prior data.

## Policy Breaches

| Budget | Offender | Bytes | Citation |
|--------|----------|-------|----------|
| ADR-040 Tier 3 per-topic-file envelope (2 KB to 5 KB, 5,120-byte default ceiling) | `docs/BRIEFING.md` | 60,527 | 11.8x the ceiling. The `check-briefing-budgets.sh` advisory could not be run: neither a `wr-retrospective-check-briefing-budgets` shim nor a `packages/retrospective/` tree resolves in this repository, so the breach is measured directly by `wc -c` rather than by the script. |
| ADR-038 SKILL.md size cluster (P097, 50 KB anchor) | `wr-itil/0.59.2/skills/work-problems/SKILL.md` | 231,201 | 4.6x the 50 KB anchor. Upstream plugin surface; not editable from this consumer repository. |
| ADR-038 SKILL.md size cluster (P097, 50 KB anchor) | `wr-itil/0.59.2/skills/manage-problem/SKILL.md` | 145,507 | 2.9x the 50 KB anchor. Read in full by every `manage-problem` invocation, including this session's. Same upstream-surface caveat. |

The `check-briefing-budgets.sh` unavailability is itself worth naming: run-retro Step 3's Tier 3 rotation pass and this skill's Step 5 both invoke it, and in this repository both degrade to the fail-open path. The budget is unenforced here rather than satisfied.

<!--
context-snapshot:
  total-bytes: 2497809
  hooks: 14402
  skills: 183672
  memory: 626872
  briefing: not-measured-source-absent
  decisions: 502456
  problems: 1134917
  jtbd: 25922
  project-claude-md: 9568
  framework-injected: not-measured-framework-injected
  measurement-method: byte-count-on-disk
  measured-at: 2026-08-05
-->
