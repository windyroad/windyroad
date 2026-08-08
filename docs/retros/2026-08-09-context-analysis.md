# Context Analysis - 2026-08-09

> Source: `/wr-retrospective:analyze-context` (deep layer per ADR-043).
> Methodology: byte-count-on-disk + per-plugin decomposition. Per-turn attribution not available (see below).
> Cheap-layer baseline: `wr-retrospective-measure-context-budget`.
> Auto-fired from `run-retro` Step 2c. Trigger: delta breach on two buckets, both clearing the 20% and 10 KB floors. Prior snapshot 2026-08-08.

## Bucket Totals

| Bucket | Bytes | % of measured | Delta vs prior |
|--------|-------|---------------|----------------|
| problems | 1,342,127 | 45.4% | +65,411 (+5.1%) |
| memory | 652,843 | 22.1% | +4,921 (+0.8%) |
| decisions | 640,230 | 21.7% | +22,598 (+3.7%) |
| skills | 207,039 | 7.0% | +859 (+0.4%) |
| briefing | 102,623 | 3.5% | **+20,310 (+24.7%)** |
| jtbd | 69,630 | 2.4% | **+36,004 (+107.1%)** |
| hooks | 14,402 | 0.5% | 0 (0.0%) |
| project-claude-md | 9,568 | 0.3% | 0 (0.0%) |
| framework-injected | not measured | - | reason=framework-injected-no-on-disk-source |

Total measured: 3,038,462 bytes. Prior total 2,888,359. Delta +150,103 (+5.2%).

**Both breaching buckets are fully attributable and neither is bloat.**

- **jtbd +36,004.** The 2026-08-08 snapshot was taken before that day's `docs/jtbd/internal-maintainer/` work committed in `1efeea0` (persona plus JTBD-400/401/402, 32 KB on disk today). Today's addition is `JTBD-006-navigate-an-edition-i-already-know-my-way-around.proposed.md` at 8,562 bytes. The two together account for the delta. The percentage is large only because the bucket's base was small.
- **briefing +20,310.** The 2026-08-08 retro's Tier-3 rotation created `governance-iteration-friction-2026-08-08-adr-048-iter.md` (6,965 bytes) and rotated entries across the archive and archive-early siblings. Rotation moves bytes into new files rather than removing them, so a rotation cycle reads as growth on this bucket by construction.

## Per-Plugin Decomposition

The helper resolved in **cache-fallback mode**: this is an adopter repo with no `packages/` tree, so the walk covers every installed plugin under the marketplace cache rather than repo-local surfaces.

**Sanity-check fails, and the failure is structural rather than a defect.** The skill's contract says the aggregate cheap-layer `hooks` row should equal the sum of `PLUGIN-HOOKS` rows. It does not: `PLUGIN-HOOKS` sums to 550,270 against a cheap-layer `hooks` bucket of 14,402, and `PLUGIN-SKILLS` sums to 1,354,963 against a `skills` bucket of 207,039.

The cause is in the scripts, not in either number. Both use the same file filters, `*.sh` for hooks and `SKILL.md` for skills, so the filters are not the source. What differs is the tree each walks. `measure-context-budget.sh` walks this repo's `.claude/hooks` and `.claude/skills`, plus `packages/*/hooks` and `packages/*/skills` if they exist. `list-plugin-attribution.sh` falls back to cache mode when no `packages/` tree exists, which is the case here, and then walks every plugin root it can reach by sniffing `$PATH` for `*/cache/*/*/bin` entries, across all ten installed plugins. So the aggregate covers the whole installed cache while the bucket covers this repo. Neither is wrong, and the contract's equality claim holds only in source-tree mode. Recorded rather than reconciled: the fix belongs upstream in the helper's contract prose.

### Hooks (plugin cache, 550,270 bytes)

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

### Skills (plugin cache, 1,354,963 bytes)

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

## Top-N Offenders

| Surface | Bytes | Bucket | Comparable prior |
|---------|-------|--------|------------------|
| `docs/problems/README-history.md` | 99,545 | problems | P282 records the live `docs/problems/README.md` growing past the Read-tool 25K-token whole-file cap at 134 KB, forcing paged reads. The history sibling is already the overflow surface from that split, and at 99.5 KB it is approaching the same ceiling itself. |
| `docs/decisions/020-newsletter-editor-subagent.proposed.md` | 68,876 | decisions | not estimated - no prior data. No ADR in this repo has been split or trimmed, so there is no reclamation precedent to anchor an estimate on. |
| `docs/problems/known-error/121-...shape...md` | 55,898 | problems | not estimated - no prior data. |
| `docs/problems/verifying/122-...assembly-defects...md` | 54,759 | problems | not estimated - no prior data. |
| `docs/problems/README.md` | 13,471 | problems | P062 established the refresh contract that keeps this file bounded; the history split is what holds it at 13 KB against the 134 KB P282 recorded. Working as designed. |

## Per-Turn Attribution

per-turn attribution: not measured - no session log accessible. `.afk-run-state/` holds only `outstanding-questions.jsonl` and `risk-register-queue.jsonl`, neither of which carries a per-turn `usage` field.

## Suggestions

1. **problems / `docs/problems/README-history.md`** - At 99,545 bytes this file is 74% of the way to the 134 KB point at which P282 recorded the live README becoming unreadable in one Read call. It is append-only by construction, so it will cross that line without intervention. Comparable prior: the P282 split that created this file reclaimed the live README from 134 KB to 13,471 bytes, a 90% reduction on the surface that is actually read every iteration. Estimated byte saving on the read path: the same shape applied again (a second-generation history sibling, or per-year partitioning) keeps the read cost flat rather than reclaiming bytes. The bytes are the archive's job to hold.

2. **problems / P121 and P122 ticket bodies** - 55,898 and 54,759 bytes, and both are live: P121 is Known Error and was edited this session. Together they are 8.2% of the problems bucket. Both accumulated by design under the investigate-in-the-ticket pattern, and both now carry multiple dated correction blocks layered over superseded reasoning, including one added this session. Comparable prior: not estimated - no prior data, no ticket in this repo has been split or archived mid-life. Flagging the shape rather than proposing a trim: a ticket that is read in full on every iteration that touches it, and that grows a correction block each time, has a cost curve worth watching.

3. **decisions / `docs/decisions/020-newsletter-editor-subagent.proposed.md`** - 68,876 bytes, 10.8% of the decisions bucket on its own. Comparable prior: not estimated - no prior data. Noted because the decisions bucket grew 22,598 bytes this cycle and is the third-largest bucket; ADR-020 is the single largest contributor to its base.

4. **jtbd bucket** - No suggestion. The bucket breached its delta trigger but at 69,630 bytes is 2.4% of measured context, and the growth is two deliberate authoring events. Flagging it as a trim candidate would be the ungrounded-suggestion shape ADR-026 forbids.

5. **briefing bucket** - No trim suggestion. The Tier-3 rotation pass is the governing control and it ran on 2026-08-08. Growth from a rotation cycle is the control working, not bloat. Worth noting for the next cheap-layer run: rotation cycles will keep tripping the 20%-plus-10 KB delta trigger on this bucket, so a rotation-adjacent breach is expected signal rather than a finding.

## Policy Breaches

**The Tier 3 budget detector does not exist as an invocable command here, so the budget is unenforced and the breaches below were found by hand.**

Both `run-retro` Step 3 and this skill's Step 5 instruct invoking `packages/retrospective/scripts/check-briefing-budgets.sh`, a repo-relative path that does not resolve in a consumer repo. Checked the shim directory the plugin actually ships, `/Users/tomhoward/.claude/plugins/cache/windyroad/wr-retrospective/0.27.0/bin/`: eleven files, of which nine are `wr-retrospective-*` command shims and two are `check-deps.sh` and `install.mjs`. None is a briefing-budgets detector. So unlike its siblings, this check has no `wr-retrospective-*` entry point at all. The count matches P130's own, recorded a day earlier. An agent that follows the prose literally gets a command-not-found, and an agent that reads a silent failure as a clean result records "no files over budget" against a tree with eight of them.

**Already ticketed.** P130 recorded this exact finding on 2026-08-08, including the shim-list check that proves the detector was never shipped rather than left behind on a migration. This is the second occurrence, one day later, and it reproduced because nothing has changed. What is new here is the measured consequence: eight files over budget, the largest at 1.83x, none of which any automated surface can see. That list is appended to P130.

| Budget | Offender | Bytes | Citation |
|--------|----------|-------|----------|
| ADR-040 Tier 3 (5,120 bytes/topic) | `docs/briefing/what-you-need-to-know-archive-early.md` | 9,379 | Hand-measured via `wc -c`; ratio 1.83x, below the 2x MUST_SPLIT line. |
| ADR-040 Tier 3 | `docs/briefing/what-you-need-to-know.md` | 8,983 | Hand-measured; ratio 1.75x. |
| ADR-040 Tier 3 | `docs/briefing/what-will-surprise-you-archive-early.md` | 8,499 | Hand-measured; ratio 1.66x. |
| ADR-040 Tier 3 | `docs/briefing/what-will-surprise-you.md` | 7,600 | Hand-measured; ratio 1.48x. |
| ADR-040 Tier 3 | `docs/briefing/what-you-need-to-know-archive.md` | 7,059 | Hand-measured; ratio 1.38x. |
| ADR-040 Tier 3 | `docs/briefing/governance-iteration-friction-2026-08-08-adr-048-iter.md` | 6,965 | Hand-measured; ratio 1.36x. |
| ADR-040 Tier 3 | `docs/briefing/what-will-surprise-you-archive.md` | 6,617 | Hand-measured; ratio 1.29x. |
| ADR-040 Tier 3 | `docs/briefing/README.md` | 6,427 | Hand-measured; ratio 1.26x. The index file, which the SessionStart hook reads every session. |
| Detector availability | `check-briefing-budgets.sh` | n/a | No such shim in `wr-retrospective@0.27.0/bin/` (ten shims present, none of them this one). The SKILL prose names a repo-relative path that does not resolve here. Eight files are over budget and nothing detects them. |
| ADR-038 hook prose budget | not checked | n/a | not measured - the repo has no `packages/*/hooks` tree to sample; hooks are in the plugin cache and are not this repo's to edit (ADR-036 park classification). |

No file reaches the 2x MUST_SPLIT line. All eight are Branch B (between 1.0x and 2.0x), so per Step 3's rotation discipline they are rotation-required rather than deferrable, with split-by-date as the safe default.

<!--
context-snapshot:
  total-bytes: 3038462
  hooks: 14402
  skills: 207039
  memory: 652843
  briefing: 102623
  decisions: 640230
  problems: 1342127
  jtbd: 69630
  project-claude-md: 9568
  framework-injected: not-measured-framework-injected
  measurement-method: byte-count-on-disk
  measured-at: 2026-08-09
-->
