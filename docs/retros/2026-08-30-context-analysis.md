# Context Analysis, 2026-08-30

> Source: `/wr-retrospective:analyze-context` (deep layer per ADR-043).
> Auto-fired from `run-retro` Step 2c: the `briefing` bucket moved +34,247 bytes (+20.25%) against the 2026-08-23 snapshot, clearing both the 20% test and the 10,240-byte absolute floor. Calendar-elapse did not fire (7 days since the prior report, threshold 14). The once-per-day guard was clear.
> Methodology: byte-count-on-disk via `wr-retrospective-measure-context-budget`, plus per-plugin decomposition via `wr-retrospective-list-plugin-attribution`.
> Session: story-map salvage iteration (commit `89da2a0`).

## Bucket Totals

Measured total: 4,124,418 bytes. Prior snapshot (2026-08-23): 3,695,521 bytes. Change: +428,897 (+11.6%).

| Bucket | Bytes | % of measured | Delta vs prior | Delta % |
|--------|-------|---------------|----------------|---------|
| problems | 2,039,366 | 49.4% | +330,204 | +19.3% |
| decisions | 780,018 | 18.9% | +35,270 | +4.7% |
| memory | 761,091 | 18.5% | +21,216 | +2.9% |
| skills | 240,082 | 5.8% | +4,121 | +1.7% |
| briefing | 205,174 | 5.0% | +36,015 | +21.3% |
| jtbd | 74,717 | 1.8% | +2,071 | +2.9% |
| hooks | 14,402 | 0.3% | 0 | 0.0% |
| project-claude-md | 9,568 | 0.2% | 0 | 0.0% |
| framework-injected | not measured: framework-injected-no-on-disk-source | n/a | n/a | n/a |

The `briefing` delta is the trigger. It is measured after this retro's own Step 3 edits, which added a derived-`<meta>` entry to `what-will-surprise-you.md` and rotated the two-reviewers-converging entry into `what-will-surprise-you-archive.md` (net +1,768 bytes across the pair). The trigger value Step 2c read was the pre-edit 203,406, so the trigger did not fire on this session's own writes.

## Per-Plugin Decomposition

Measured by `wr-retrospective-list-plugin-attribution` (helper method: `find -name '*.sh'` for hooks, `SKILL.md` for skills, then `wc -c`). Rows sum across every cached version of each plugin. See the first Policy Breach row for why that overcounts what actually loads.

### Hooks (plugin-attribution sum: 575,189 bytes)

| Plugin | Bytes | % of plugin hooks |
|--------|-------|-------------------|
| wr-itil | 191,939 | 33.4% |
| wr-risk-scorer | 118,484 | 20.6% |
| wr-architect | 72,880 | 12.7% |
| wr-voice-tone | 64,781 | 11.3% |
| wr-jtbd | 43,389 | 7.5% |
| wr-tdd | 31,593 | 5.5% |
| wr-style-guide | 27,801 | 4.8% |
| wr-retrospective | 21,818 | 3.8% |
| wr-connect | 2,056 | 0.4% |
| ponytail | 448 | 0.1% |
| accessibility-agents | 0 | 0.0% |

### Skills (plugin-attribution sum: 1,397,729 bytes)

| Plugin | Bytes | % of plugin skills |
|--------|-------|--------------------|
| wr-itil | 1,024,555 | 73.3% |
| wr-retrospective | 118,136 | 8.5% |
| wr-risk-scorer | 74,674 | 5.3% |
| wr-architect | 67,938 | 4.9% |
| skill-creator | 33,168 | 2.4% |
| wr-jtbd | 21,702 | 1.6% |
| ponytail | 15,500 | 1.1% |
| wr-wardley | 12,225 | 0.9% |
| wr-connect | 11,434 | 0.8% |
| wr-voice-tone | 10,473 | 0.7% |
| wr-style-guide | 3,895 | 0.3% |
| wr-tdd | 3,369 | 0.2% |
| wr-c4 | 660 | 0.0% |

**The sanity check this skill states does not hold, and the reason is scope rather than arithmetic.** Step 2 of `analyze-context` says the cheap-layer `hooks` row equals the sum of the `PLUGIN-HOOKS` rows, and likewise for skills. Measured here: `hooks` is 14,402 against a plugin sum of 575,189, and `skills` is 240,082 against a plugin sum of 1,397,729. The cheap layer's `hooks` bucket is `.claude/hooks` in this repository, confirmed at exactly 14,402 bytes by `du -sb`; the plugin attribution walks `~/.claude/plugins/cache/windyroad`. They measure disjoint surfaces, so neither number is wrong, and the two must not be added or compared. Recorded as a Policy Breach row below, because the stated invariant is what a reader would otherwise rely on.

## Top-N Offenders

| Surface | Bytes | Bucket | Comparable prior |
|---------|-------|--------|------------------|
| `docs/problems/` corpus | 2,039,366 | problems | P100 split `BRIEFING.md` into per-topic files; no comparable prior for the problems corpus |
| `wr-itil` skills (all cached versions) | 1,024,555 | skills | not estimated: no prior data |
| `wr-itil/2.1.0/skills/work-problems/SKILL.md` | 242,685 | skills | P097 is the evolving budget anchor at 50 KB |
| `docs/decisions/` corpus | 780,018 | decisions | not estimated: no prior data |
| `wr-itil/2.1.0/skills/manage-problem/SKILL.md` | 153,291 | skills | P097 is the evolving budget anchor at 50 KB |

## Per-Turn Attribution

per-turn attribution: not measured, no session log accessible. The three files under `.afk-run-state/` (`answered-questions.jsonl`, `outstanding-questions.jsonl`, `risk-register-queue.jsonl`) are governance queues rather than turn logs; `grep -l usage` across them returns nothing, so there is no `usage.{input,output,cache_creation,cache_read}` field to parse.

## Suggestions

1. **problems (2,039,366 bytes, 49.4% of measured)**. The corpus is now half of all measured context and grew +330,204 bytes (+19.3%) in seven days, the largest absolute movement of any bucket. The closed tier is the candidate: closed tickets are read for provenance rather than for work in hand. Comparable prior: `P100 split BRIEFING.md into per-topic files`, which is the same shape (one accumulating surface, split so session start loads only the live part). Estimated byte saving: not estimated, no prior data for this corpus, and the split boundary needs a decision about what a closed ticket is still loaded for.

2. **`wr-itil/2.1.0/skills/work-problems/SKILL.md` (242,685 bytes)**. This is 4.9 times the 50 KB P097 anchor and the single largest file in the skills bucket. It is upstream, so the fix is a report rather than an edit here. Comparable prior: `P097` names the anchor but records no reclamation figure. Estimated byte saving: not estimated, no prior data.

3. **Stale plugin-cache versions**. `wr-itil` has 4 cached versions and five other plugins have 5 or 6, of which only the highest resolves per ADR-080. The attribution figures above therefore overcount live context by roughly 4 times for `wr-itil`. This is a measurement-accuracy fix rather than a context saving: no stale version is loaded, so pruning the cache reclaims disk, not context. Comparable prior: not estimated, no prior data. The actionable half is teaching the helper to walk only the highest-version sibling, which would make every future report's plugin figures mean what they appear to mean.

4. **briefing (205,174 bytes, +21.3%)**. The trigger bucket, but the growth is distributed across topic files rather than concentrated, and `wr-retrospective-check-briefing-budgets` reports no file over the 5,120-byte Tier 3 ceiling after this retro's rotation. No trim is warranted on this measurement. Comparable prior: `P099 promoted Tier 3 to advisory enforcement`, which is the mechanism that kept the per-file distribution flat while the aggregate grew.

5. **decisions (780,018 bytes, +4.7%)**. Grew by 35,270 bytes, of which ADR-058 is the bulk of this session's share. The corpus is append-only by ADR-054 (a decision is changed by a new decision, never by editing the old one), so growth here is the design working rather than bloat. No trim suggested. Comparable prior: not applicable, ADR-054 forecloses the compaction shape.

## Policy Breaches

| Budget | Offender | Bytes | Citation |
|--------|----------|-------|----------|
| ADR-038 SKILL.md 50 KB cluster (P097) | `wr-itil/2.1.0/skills/work-problems/SKILL.md` | 242,685 | `find ~/.claude/plugins/cache/windyroad -name SKILL.md -size +50k` |
| ADR-038 SKILL.md 50 KB cluster (P097) | `wr-itil/2.1.0/skills/manage-problem/SKILL.md` | 153,291 | same invocation |
| `analyze-context` Step 2 aggregate-equality invariant | cheap-layer `hooks` 14,402 vs plugin sum 575,189; `skills` 240,082 vs plugin sum 1,397,729 | n/a | `wr-retrospective-measure-context-budget .` and `wr-retrospective-list-plugin-attribution .`, same session |
| ADR-040 Tier 3 briefing ceiling | none | n/a | `wr-retrospective-check-briefing-budgets` returned empty after the Step 3 rotation |

The ADR-038 hook prose budget (at most 150 bytes per subsequent-prompt reminder) was not sampled this run: the `UserPromptSubmit` reminders observed in this session are project-local and none carried a terse-reminder branch to measure. Recorded as not measured rather than as clean.

<!--
context-snapshot:
  total-bytes: 4124418
  hooks: 14402
  skills: 240082
  memory: 761091
  briefing: 205174
  decisions: 780018
  problems: 2039366
  jtbd: 74717
  project-claude-md: 9568
  framework-injected: not-measured-framework-injected
  measurement-method: byte-count-on-disk
  measured-at: 2026-08-30
-->
