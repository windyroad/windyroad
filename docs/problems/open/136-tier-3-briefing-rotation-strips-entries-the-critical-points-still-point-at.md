# Problem 136: Tier 3 briefing rotation strips entries the Critical Points still point at, because nothing re-points the roll-up

**Status**: Open
**Reported**: 2026-08-09
**Priority**: 6 (Medium), Impact: 2 x Likelihood: 3, derived at capture. Impact is 2 because `RISK-POLICY.md` rates a defect confined to dev tooling with no visitor or reader effect at Minor, and the damage is to the briefing surface a session reads at start rather than to anything published. It is not 1 because the broken pointer lands on the one surface designed to orient a session that has no other context, and a Critical Point that names a fact then links to a file not containing it is worse than no bullet at all. Likelihood is 3: rotation only fires when a topic file is over budget, which is currently four files, and only bites when a rotated entry is one of the roughly ten promoted to Critical Points. Observed once, on the first mechanical application.
**Origin**: internal
**Effort**: S. Either the rotation re-points the roll-up as it moves an entry, or it refuses to move a promoted entry. Both are local edits to the rotation step.

## Description

`/wr-retrospective:run-retro` Step 3 runs a Tier 3 budget pass over `docs/briefing/*.md` and, for any file at or above the threshold, applies a rotation shape. The Branch B fall-through is split-by-date: archive the oldest entries to `docs/briefing/<topic>-archive.md` until the file is under budget. The step is emphatic that deferring is the anti-pattern it exists to close, citing P246 and P247.

Nothing in that step accounts for `docs/briefing/README.md`'s Critical Points roll-up, which the SessionStart hook surfaces and which cites the topic file each promoted entry lives in.

Observed 2026-08-09 in this retro. The mechanical rotation moved six entries out of `what-will-surprise-you.md`, leaving two, and seven out of `what-you-need-to-know.md`, leaving four. The files were 8811 and 8983 bytes against a 5120 ceiling and entries here run roughly 1.2 KB, so four is the number the budget actually implies: the second file hit it and the first overshot by two. The overshoot has its own cause worth recording, because it will recur for anyone implementing this mechanically. Entries in these files are not uniformly separated by a blank line, since the trailing `<!-- signal-score -->` comment sometimes sits on the line directly below the entry and sometimes after a blank, so splitting the body on blank lines glues some entries into one block. The loop then pops whole glued blocks and overshoots. Three of the entries it moved were promoted Critical Points still linked from `README.md` lines 9, 10 and 11: the sourced-script guards, the external-comms `--body-file` trap, and the lossy `git status` snapshot. After the rotation each bullet named a fact and linked to a file that no longer contained it. Nothing warned; the rotation exits 0 and the budget script reports the file as compliant.

The rotation was reverted in the same turn and only the new entry was kept, so no broken pointer was committed. The defect is in the step, not in that one application: any faithful execution of Branch B on these files reproduces it.

Two things compose to make this reachable rather than theoretical. The roll-up promotes the highest-signal entries, and split-by-date moves the oldest; an entry can be both, because a fact learned early and cited often is exactly the shape that gets promoted and then ages. And the threshold is mismatched with entry size here: at 5120 bytes and 1.2 KB an entry, a topic file holds about four entries, so rotation is not an occasional trim but a near-permanent state for the two accumulator files.

## Symptoms

A Critical Points bullet in `docs/briefing/README.md` states a fact and links to `docs/briefing/<topic>.md`; grepping that file for the fact returns nothing, and grepping `docs/briefing/<topic>-archive.md` returns it. The budget script reports the topic file compliant, so nothing surfaces the inconsistency.

## Workaround

After any Tier 3 rotation, grep each rotated entry's distinguishing phrase against `docs/briefing/README.md`. Where a Critical Points bullet cites it, either re-point that bullet at the archive file or leave the entry in place and rotate a different one. If neither is possible without breaching the budget, prefer the breach and record it: a stale pointer on the session-start surface costs more than a topic file a few hundred bytes over.

## Impact Assessment

- **Who is affected**: any session that reads the Critical Points at start, which is every session, and any agent that follows a bullet's link to read the full entry.
- **Frequency**: once per rotation that happens to move a promoted entry. Four topic files are currently over budget, so rotation is not rare.
- **Severity**: Minor. Nothing published is affected and no gate verdict can be wrong from it. The cost is a session oriented by a pointer that does not resolve.
- **Analytics**: none.

## Root Cause Analysis

The roll-up and the topic files are maintained by two steps that do not know about each other. Step 1.5 promotes an entry into the roll-up on signal score. Step 3's budget pass moves entries between a topic file and its archive on age. Neither reads the other's output, and the entry carries no marker saying it is promoted, so the rotation has nothing to check even if it wanted to.

### Investigation Tasks

- [ ] Decide the shape. Two candidates: the rotation re-points any Critical Points bullet whose entry it moves, which keeps the budget authoritative; or promoted entries are exempt from rotation, which keeps the roll-up authoritative and lets the file run over. Prefer whichever leaves the session-start surface correct without a second pass.
- [ ] Confirm the placement proposal before acting on it. Step 3 lives in the `wr-retrospective` plugin, which this repository consumes rather than owns, so the fix is probably upstream. That is a proposal the upstream maintainers can decline, not a settled fact about where the work goes (P045).
- [ ] Re-examine the 5120-byte Tier 3 threshold against this repo's actual entry size. At roughly 1.2 KB an entry it admits about four entries per topic file, which makes rotation permanent rather than occasional for the two accumulators and is the pressure that surfaced this. Either the threshold is wrong for entries of this length, or entries here are longer than the tier envelope assumes. Worth settling before tuning the rotation, since a threshold that fits would reduce how often the defect is reachable.
- [ ] Create a reproduction: promote an entry, rotate the file past budget, assert the roll-up pointer still resolves.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P130

## Related

- **P130** (`docs/problems/open/130-two-run-retro-detectors-assume-a-packages-monorepo-and-produce-nothing-in-a-consumer-repo.md`): sibling run-retro defect in a consumer repo. Confirmed again this iteration, where `wr-retrospective-check-readme-jtbd-currency` exited with `packages dir not found: packages`. Same skill, different step, deliberately not merged.
- Evidence: the rotation and its revert both happened on 2026-08-09 in the `/wr-itil:work-problems` iteration that closed P128's last investigation task. Entry counts were checked across the move and nothing was lost; the reverted state is what HEAD carries.
- Anchoring, provisional and in prose per this repo's local convention for maintainer-tooling tickets, which omits the header lines. The **internal-maintainer** persona (`docs/jtbd/internal-maintainer/persona.md`) fits, since the harm lands on a session starting with no context and nobody watching. The anchor is provisional because the persona is unratified. No documented job is claimed.
- Captured via `/wr-itil:capture-problem` under `--no-prompt` from the retro that hit it, per Step 4b Stage 1's mechanical-auto-ticket rule for a recurring framework-gap class. Recorded rather than deferred to the retro summary precisely because the summary's own anti-pattern list names "the session is long" as an invalid reason to defer.
