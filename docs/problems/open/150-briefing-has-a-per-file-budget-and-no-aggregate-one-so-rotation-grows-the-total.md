# Problem 150: Briefing has a per-file budget and no aggregate one, so rotation grows the total

**Status**: Open
**Reported**: 2026-08-10
**Priority**: 6 (Medium). Impact: 2 x Likelihood: 3, derived at capture from the description per Step 4a
**Origin**: internal
**Effort**: S, derived at capture per Step 4a

## Description

The briefing directory grew 34.2% in a day, from 102,623 to 137,758 bytes, on the same day the Tier 3 budget pass ran and left every topic file under its ceiling. Both statements are true, and that is the defect: the enforced budget and the measured budget are different things.

ADR-040 sets Tier 3 per topic file, and `check-briefing-budgets.sh` enforces it per file. Rotation satisfies that check by moving bytes out of an over-budget file into an archive sibling, and sometimes by adding a new topic file. Per-file size falls; directory total rises. Nothing measures the directory.

Meanwhile the context-usage cheap layer in `run-retro` Step 2c measures `briefing` as a single aggregate bucket, and it was that aggregate crossing both the 20% and the 10 KB delta thresholds that auto-fired the deep analyzer on 2026-08-10. So one surface says the briefing is healthy and another says it breached, on the same day, about the same directory, and both are correct by their own definition.

The practical consequence is that a rotation reads as a fix on the enforced surface and as a regression on the measured one. Someone acting on the cheap layer's breach could reasonably conclude the rotation failed, when in fact rotation is what produced the growth.

Worth noting what is not being claimed: the aggregate growth is not obviously bad. Archives are cheaper to hold than live entries because they are not in the session-start surface, and the 2026-08-10 growth came from a legitimate rotation plus a new topic file. The gap is that nobody decided what the aggregate should be, so there is no basis on which to say whether 137 KB is fine.

Reproduced again on 2026-08-23 during the P141 iteration retro, with the numbers this time.

The briefing directory measured 137,758 bytes on 2026-08-10 and 147,277 on 2026-08-23, up 6.9% with no aggregate check anywhere in the loop. The Tier 3 pass then did exactly what it is written to do and made the total slightly worse: three entries rotated out of the live topic files landed in `what-you-need-to-know-archive.md` and `what-will-surprise-you-archive.md`, taking them from 10,738 to 11,966 and from 19,564 to 22,087 bytes (two arrivals there, one in the other). Both live files came in under the 5,120-byte ceiling and both archives moved further past twice it.

The follow-on is the part worth deciding. Branch A of the rotation pass says a file at or above 2x the ceiling MUST split, and three files now qualify: `what-will-surprise-you-archive.md` at 22,087, `governance-iteration-friction-archive.md` at 14,952, and `what-you-need-to-know-archive.md` at 11,966. Applying it would mint a third archive generation behind the `-archive-early` siblings that already exist, and those siblings are themselves over the ceiling at 8,499 and 9,379 bytes. Nothing reads an archive at session start, so each split costs churn and returns nothing. The rotation rule reads as though it was written for live topic files, where the ceiling protects a surface somebody actually loads, and then applied to the archive tail by path glob rather than by intent.

`docs/briefing/README.md` at 9,589 bytes has the same shape from the other direction. It is the index and the Critical Points roll-up, so it IS the loaded surface, and split-by-date is the wrong instrument for it; its size is governed by the Step 1.5 promote and demote mechanism, not by rotation.

A fix probably needs to say which files the ceiling is protecting, rather than which files match `docs/briefing/*.md`.

## Symptoms

- `check-briefing-budgets.sh` returns clean while the directory total grows sharply.
- The context-usage cheap layer reports a `briefing` breach on the same day, using the directory total.
- The two surfaces cannot be reconciled from either one's output alone.

## Workaround

Read a `briefing` breach from the context measurement against the Tier 3 per-file result before concluding anything. If Tier 3 is clean, the aggregate growth is rotation, not bloat.

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: every rotation cycle
- **Severity**: (deferred to investigation)
- **Analytics**: briefing directory 102,623 bytes on 2026-08-09, 137,758 on 2026-08-10, across 24 then 25 files

## Root Cause Analysis

### Investigation Tasks

- [ ] Investigate root cause
- [ ] Create reproduction test
- [ ] Decide whether the briefing directory should carry an aggregate ceiling at all, or whether the per-file budget plus archive-is-cheap is the right model and the cheap layer should measure live files separately from archives
- [ ] If archives are genuinely cheaper, decide whether the context measurement should exclude `*-archive*.md` from the `briefing` bucket, or report them as a separate bucket, so a rotation does not read as a breach
- [ ] Check whether the same enforced-versus-measured split exists for other buckets the cheap layer aggregates

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P136 (Tier 3 rotation strips entries the Critical Points still point at), the other known rotation defect. P130 (two run-retro detectors assume a packages/ monorepo), which is why the per-file check has to be run by hand here.

## Related

Surfaced by the deep-layer context analysis at `docs/retros/2026-08-10-context-analysis.md`, which auto-fired precisely because of this aggregate. Recorded there as suggestion 4.
