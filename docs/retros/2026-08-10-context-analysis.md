# Context Analysis, 2026-08-10

> Source: `/wr-retrospective:analyze-context` (deep layer per ADR-043), auto-fired from `run-retro` Step 2c.
> Trigger: the `briefing` bucket changed +34.2% and +35,135 bytes since the 2026-08-09 snapshot, clearing both the 20% and the 10 KB floor. No report existed for today, so the once-per-day guard did not fire.
> Methodology: byte-count-on-disk via `wr-retrospective-measure-context-budget`, plus per-plugin decomposition via `wr-retrospective-list-plugin-attribution`.

## Bucket Totals

| Bucket | Bytes | % of measured | Delta vs 2026-08-09 |
|---|---|---|---|
| problems | 1,560,850 | 46.7% | +218,723 (+16.3%) |
| memory | 678,806 | 20.3% | +25,963 (+4.0%) |
| decisions | 661,952 | 19.8% | +21,722 (+3.4%) |
| skills | 208,811 | 6.2% | +1,772 (+0.9%) |
| briefing | 137,758 | 4.1% | +35,135 (+34.2%) **trigger** |
| jtbd | 69,759 | 2.1% | +129 (+0.2%) |
| hooks | 14,402 | 0.4% | 0 |
| project-claude-md | 9,568 | 0.3% | 0 |
| framework-injected | not measured | n/a | reason: framework-injected-no-on-disk-source |
| **TOTAL** | **3,341,906** | | **+303,444 (+10.0%)** |

The total grew 10% in one day. `problems` supplied 72% of that growth, which is expected: ten tickets were captured (P140 through P149) and several existing ones gained substantial resolution and recurrence sections.

**The `briefing` figure needs reading carefully, because it is the trigger and it is misleading.** That bucket grew 34.2% on a day when the Tier 3 budget pass ran and every topic file ended up *under* its ceiling. Both are true. Rotation moves bytes from an over-budget file into an archive sibling and adds a new topic file; it reduces per-file size and increases directory total. So the per-file budget is being enforced while the aggregate is unmanaged, and the cheap layer measures the aggregate. Worth knowing before anyone reads a `briefing` breach as a rotation failure.

## Per-Plugin Decomposition

### Skills (aggregate 208,811 bytes from the cheap layer)

The cheap-layer `skills` bucket measures `.claude/skills/` in this repo. The plugin-attribution helper measures the plugin cache, which is a different and much larger surface, so these do not sum to the bucket above. Both are reported because the cache is what a session actually loads from.

| Plugin | Bytes | Share |
|---|---|---|
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

### Hooks (aggregate 14,402 bytes from the cheap layer)

| Plugin | Bytes | Share |
|---|---|---|
| wr-itil | 186,354 | 33.9% |
| wr-risk-scorer | 118,484 | 21.5% |
| wr-architect | 72,880 | 13.2% |
| wr-voice-tone | 64,781 | 11.8% |
| wr-jtbd | 43,389 | 7.9% |
| wr-style-guide | 27,801 | 5.1% |
| wr-retrospective | 21,818 | 4.0% |
| wr-cruise | 14,315 | 2.6% |
| ponytail | 448 | 0.1% |
| accessibility-agents | 0 | 0% |

Same caveat: the cheap-layer `hooks` row measures this repo's `.claude/hooks/`, the table measures the cache.

## Top Offenders

| Surface | Bytes | Bucket | Comparable prior |
|---|---|---|---|
| `wr-itil` plugin cache, all versions | ~43,800 KB | skills + hooks | not estimated, no prior data |
| `~/.claude/plugins/cache/windyroad/wr-itil/0.59.0/skills/work-problems/SKILL.md` | 244,041 | skills | P097 (SKILL.md size cluster) |
| `.claude/skills/wr-newsletter/SKILL.md` | 177,099 | skills | P097 |
| `docs/problems/known-error/121-*.md` | 56,131 | problems | not estimated, no prior data |
| `docs/problems/verifying/122-*.md` | 54,779 | problems | not estimated, no prior data |
| `docs/briefing/what-will-surprise-you-archive.md` | 19,564 | briefing | P100 (split BRIEFING.md into per-topic files) |

## Per-Turn Attribution

Not measured, no session log accessible. `.afk-run-state/` holds `outstanding-questions.jsonl` and `risk-register-queue.jsonl`, which are work queues rather than turn logs: neither carries a `usage` field on any of its 11 and 69 lines respectively. This was an interactive session, so no AFK orchestrator wrote a turn log.

## Suggestions

1. **Stale plugin-cache versions are the single largest reclaimable surface, and nothing in this analysis is close.** `wr-itil` holds 11 cached versions totalling 42,788 KB, of which the newest is 4,388 KB, so roughly **38,400 KB sits in versions no session loads**. Across the four measured plugins the stale total is roughly **54,284 KB** (`wr-itil` ~38,400, `wr-risk-scorer` ~8,260, `wr-architect` ~4,456, `wr-retrospective` ~3,168). Estimated saving: `~54 MB` on disk. Comparable prior: `not estimated, no prior data` on context-window effect specifically, because whether a session reads stale cache directories was not measured here and should not be assumed. Treat the disk figure as certain and the context figure as unmeasured.

2. **`work-problems`-class SKILL.md files breach the P097 budget by a wide margin.** `wr-itil/0.59.0/skills/work-problems/SKILL.md` is 244,041 bytes and `.claude/skills/wr-newsletter/SKILL.md` is 177,099 bytes, against P097's 50 KB anchor. Estimated saving: `not estimated, no prior data`. The ADR-038 progressive-disclosure pattern (SKILL.md plus a lazy-loaded REFERENCE.md) is the named mechanism and both files already carry sections that would move cleanly, but no prior in this repo has measured the reclamation, so no number is offered.

3. **The `problems` bucket is 46.7% of measured context and grew 16.3% in a day.** 149 tickets, of which the two largest are 56 KB and 54 KB. Comparable prior: P100 split `BRIEFING.md` into per-topic files. Estimated saving: `not estimated, no prior data`. Note the countervailing consideration before anyone acts: ticket bodies are the audit trail this project runs on, and today's work depended repeatedly on reading a ticket's full history, so compression here trades directly against the verify-before-asserting discipline.

4. **The briefing aggregate has no ceiling, only per-file ones.** Directory total 137,758 bytes across 24 files, growing 34.2% today while every individual file passed its Tier 3 check. Comparable prior: P099 promoted the Tier 3 per-file budget from informational to advisory enforcement. Estimated saving: `not estimated, no prior data`. The concrete gap is that ADR-040 sets Tier 3 per topic file and nothing measures the directory.

## Policy Breaches

| Budget | Offender | Bytes | Citation |
|---|---|---|---|
| P097 SKILL.md 50 KB anchor | `~/.claude/plugins/cache/windyroad/wr-itil/0.59.0/skills/work-problems/SKILL.md` | 244,041 | 4.9x over |
| P097 SKILL.md 50 KB anchor | `.claude/skills/wr-newsletter/SKILL.md` | 177,099 | 3.5x over |
| ADR-040 Tier 1 Critical Points, 2,048 bytes | `docs/briefing/README.md` Critical Points section | 7,096 | 5,048 over, 12 bullets |
| ADR-040 Tier 3 per-topic-file | none | n/a | `check-briefing-budgets.sh` returns clean after today's rotation |

**Superseded within this same commit, and left visible rather than rewritten.** The table above measures 7,096 bytes and 12 bullets, which was true when the measurement ran. The retro that fired this analysis then applied the Step 1.5 signal scoring, demoted four Critical Points that had gone two cycles unexercised, and shipped the section at 8 bullets and 4,947 bytes in the same commit as this report. So the breach is real but 2.4x rather than 3.5x, and it is being worked rather than carried.

The measurement rows are left as measured, because a snapshot that is quietly edited after the fact is worth less than one that is dated and superseded in the open. What is corrected is the disposition: an earlier draft of this paragraph said the breach was deliberately not fixed, which the commit falsified. The part that remains true is narrower: no entry reached the +3 score that Step 3 requires for *promotion into* the roll-up, and cutting the remaining 8 to hit 2,048 would mean removing entries that scored positive this cycle, which trades a measured problem for an unmeasured one.

<!--
context-snapshot:
  total-bytes: 3341906
  hooks: 14402
  skills: 208811
  memory: 678806
  briefing: 137758
  decisions: 661952
  problems: 1560850
  jtbd: 69759
  project-claude-md: 9568
  framework-injected: not-measured-framework-injected
  measurement-method: byte-count-on-disk
  measured-at: 2026-08-10
-->
