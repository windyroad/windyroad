# Context Analysis: 2026-08-23

> Source: `/wr-retrospective:analyze-context` (deep layer per upstream ADR-043 (agent-plugins)).
> Auto-fired from `run-retro` Step 2c during the P145 AFK iteration: the `briefing`
> bucket moved +28184 bytes (+20.46%) against the 2026-08-10 snapshot, clearing both
> the 20% relative and the 10240-byte absolute gates. Once-per-day guard was not set.
> Methodology: byte-count-on-disk, plus per-plugin decomposition. Per-turn attribution
> not measured (see below).
> Cheap-layer baseline: `wr-retrospective-measure-context-budget`.

## Bucket Totals

Measured after this iteration's briefing edits, so the `briefing` delta below
(+31401) is larger than the +28184 that fired the trigger: rotation is byte-neutral
within the bucket, and this pass added new entries on top.

| Bucket | Bytes | % of measured | Delta vs 2026-08-10 |
|--------|-------|---------------|---------------------|
| problems | 1709162 | 46.2% | +148312 (+9.5%) |
| decisions | 744748 | 20.2% | +82796 (+12.5%) |
| memory | 739875 | 20.0% | +61069 (+9.0%) |
| skills | 235961 | 6.4% | +27150 (+13.0%) |
| briefing | 169159 | 4.6% | +31401 (+22.8%) |
| jtbd | 72646 | 2.0% | +2887 (+4.1%) |
| hooks | 14402 | 0.4% | 0 (0.0%) |
| project-claude-md | 9568 | 0.3% | 0 (0.0%) |
| framework-injected | not measured | reason=framework-injected-no-on-disk-source | not estimated |

Total measured: 3695521 bytes, up from 3341906 on 2026-08-10 (+353615, +10.6%).

## Per-Plugin Decomposition

**Scope discrepancy, recorded rather than reconciled.** The SKILL's sanity-check
expects the cheap-layer `hooks` and `skills` rows to equal the sums of the
`PLUGIN-HOOKS` and `PLUGIN-SKILLS` rows. They do not, and the gap is structural
rather than an error in either. The two differ on both axes. On scope, the cheap
layer measures project-local trees while the attribution helper walks the installed
plugin cache. On filter, the cheap layer's `skills` bucket counts only
`packages/*/skills/**/SKILL.md` plus `.claude/skills/**/SKILL.md`, which here is
three files totalling 235961 bytes; `du -sb .claude/skills` reports 2011626 because
that tree also holds eval fixtures, configs and scripts that never enter context.
The `hooks` row shows the scope axis on its own: project-local 14402 against a
plugin-cache sum of 575189. Do not add the two tables, and do not read the
cheap-layer `skills` row as covering plugin skills. Sums: hooks 575189,
skills 1397729.

### Hooks (plugin cache; cheap-layer project-local row is 14402)

| Plugin | Bytes | % of plugin hooks |
|--------|-------|-------------------|
| wr-itil | 191939 | 33.4% |
| wr-risk-scorer | 118484 | 20.6% |
| wr-architect | 72880 | 12.7% |
| wr-voice-tone | 64781 | 11.3% |
| wr-jtbd | 43389 | 7.5% |
| wr-tdd | 31593 | 5.5% |
| wr-style-guide | 27801 | 4.8% |
| wr-retrospective | 21818 | 3.8% |
| wr-connect | 2056 | 0.4% |
| ponytail | 448 | 0.1% |
| accessibility-agents | 0 | 0.0% |

### Skills (plugin cache; cheap-layer project-local row is 235961)

| Plugin | Bytes | % of plugin skills |
|--------|-------|--------------------|
| wr-itil | 1024555 | 73.3% |
| wr-retrospective | 118136 | 8.5% |
| wr-risk-scorer | 74674 | 5.3% |
| wr-architect | 67938 | 4.9% |
| skill-creator | 33168 | 2.4% |
| wr-jtbd | 21702 | 1.6% |
| ponytail | 15500 | 1.1% |
| wr-wardley | 12225 | 0.9% |
| wr-connect | 11434 | 0.8% |
| wr-voice-tone | 10473 | 0.7% |
| wr-style-guide | 3895 | 0.3% |
| wr-tdd | 3369 | 0.2% |
| wr-c4 | 660 | 0.0% |

## Top-N Offenders

| Surface | Bytes | Bucket | Comparable prior |
|---------|-------|--------|------------------|
| `wr-itil/1.2.0/skills/work-problems/SKILL.md` | 232870 | skills (plugin) | P097 is the evolving budget anchor for the >50KB SKILL cluster |
| `wr-itil/1.2.0/skills/manage-problem/SKILL.md` | 148688 | skills (plugin) | P097, same cluster |
| `wr-retrospective/0.27.3/skills/run-retro/SKILL.md` | 93950 | skills (plugin) | P097, same cluster |
| `docs/problems/known-error/121-...md` | 56131 | problems | not estimated, no per-ticket budget exists |
| `docs/problems/verifying/122-...md` | 54779 | problems | not estimated, no per-ticket budget exists |

Three cached versions of `wr-itil` are resident (1.1.1, 1.1.2, 1.2.0), so the
work-problems and manage-problem SKILLs each appear three times on disk. Only the
resolved version loads into a session, but the cache retains all three.

## Per-Turn Attribution

per-turn attribution: not measured, no session log accessible. `.afk-run-state/`
contains `risk-register-queue.jsonl` (the hint queue this iteration investigated),
not a per-turn `usage` log.

## Suggestions

1. **problems (1709162 bytes, 46.2%, the dominant bucket)**: two tickets alone
   account for 110910 bytes. Comparable prior: `P100 split BRIEFING.md into
   per-topic files`, the same accumulator-doc shape applied to a different surface.
   Estimated byte saving: not estimated, no prior data for per-ticket rotation.
   Note that no per-ticket budget rule exists today, so this is an observation and
   not a breach.

2. **briefing (169159 bytes, fastest-growing measured bucket at +22.8%)**: the growth
   is in per-iteration topic files, not in the Tier-3-governed entry files, which this
   iteration brought back under budget. Comparable prior: `P099 promoted Tier 3 to
   advisory enforcement`, which governs only `docs/briefing/<topic>.md` sizes and does
   not bound the file count. Estimated byte saving: not estimated, no prior data for
   file-count rotation. The relevant point is that the Tier-3 pass cannot see this
   growth axis at all. This is NOT a new finding: P150 (Briefing has a per-file
   budget and no aggregate one, so rotation grows the total) already records it
   verbatim. The file-count axis is a refinement of P150, not a separate
   discovery, and must not be re-captured as one.

3. **skills, plugin cache (1397729 bytes, wr-itil is 73.3%)**: three resident
   `wr-itil` versions duplicate the two largest SKILLs. Comparable prior: not
   estimated, no prior data. Cache pruning is upstream tooling behaviour and outside
   this repo's control per ADR-036.

## Policy Breaches

| Budget | Offender | Bytes | Citation |
|--------|----------|-------|----------|
| upstream ADR-038 (agent-plugins) / P097 SKILL.md >50KB | `wr-itil/1.2.0/skills/work-problems/SKILL.md` | 232870 | 4.7x the 50KB anchor |
| upstream ADR-038 (agent-plugins) / P097 SKILL.md >50KB | `wr-itil/1.2.0/skills/manage-problem/SKILL.md` | 148688 | 3.0x the 50KB anchor |
| upstream ADR-038 (agent-plugins) / P097 SKILL.md >50KB | `wr-retrospective/0.27.3/skills/run-retro/SKILL.md` | 93950 | 1.9x the 50KB anchor |

All three are upstream plugin files. Per ADR-036 this repo cannot edit the cached
plugin, so these are recorded, not actionable here.

Upstream ADR-040 (agent-plugins) Tier 3 briefing budgets: clean. Raw output of the last measurement taken
before staging, rather than transcribed figures, because three rounds of trimming
made transcribed numbers go stale twice:

```
$ wr-retrospective-check-briefing-budgets docs/briefing
exit=0
$ wc -c docs/briefing/risk-scorer-behaviour.md docs/briefing/verification-discipline.md \
        docs/briefing/what-you-need-to-know.md docs/briefing/what-will-surprise-you.md
 5061 docs/briefing/risk-scorer-behaviour.md
 4933 docs/briefing/verification-discipline.md
 4660 docs/briefing/what-you-need-to-know.md
 2203 docs/briefing/what-will-surprise-you.md
```

Empty checker output is the clean signal. The checker scans top-level `*.md` only,
excluding `README.md` and `*-archive*.md`, so the large archive sinks correctly do
not count, and it always exits 0 even on overflow, so the output rather than the
exit code is the result.

Three topic files were rotated this pass, each with a dated provenance block in its
archive sink: `what-will-surprise-you.md` (5328 to 2203, two entries),
`what-you-need-to-know.md` (5717 to 4660, one entry), and
`risk-scorer-behaviour.md` (6009 to 5061, one entry, rotated because it gained two
new register entries). The first two were over the ceiling at retro start; the third
went over only after this pass added to it.

**Recorded because it cost a scoring round.** The `what-you-need-to-know.md`
rotation was performed but its archive got no provenance block, and the topic file's
header was not updated. The round-2 risk score read that absence as evidence the file
had not been rotated at all and attributed its rotation to the already-committed P154
pass. That inference was wrong, and `git diff --cached` settles it: the story-map
entry left the topic file and landed in the archive in this pass's diff. But the
scorer was right that the pass was unverifiable from the artefacts alone, which is
the whole point of the provenance block. Write the provenance in the same edit as
the move, not as a follow-up step.

Two lessons, and the second is the more useful one. The scorer did not merely fail to
verify: it asserted a positive attribution about another commit's contents from a
bounded read, which is the P103 absence-claim family, and P082 puts the duty to verify
on the consumer. The structural reason it could not settle the question is that a
read-only subagent cannot see the git index at all (P134). So the class fix is to hand
the scorer `git diff --cached --name-only` and `git diff --cached` output in the
dispatch, rather than expecting it to infer what is staged. Provenance-in-the-same-edit
fixes this artefact; handing over the staged diff fixes every future round.

<!--
context-snapshot:
  total-bytes: 3695521
  hooks: 14402
  skills: 235961
  memory: 739875
  briefing: 169159
  decisions: 744748
  problems: 1709162
  jtbd: 72646
  project-claude-md: 9568
  framework-injected: not-measured-framework-injected
  measurement-method: byte-count-on-disk
  measured-at: 2026-08-23
-->
