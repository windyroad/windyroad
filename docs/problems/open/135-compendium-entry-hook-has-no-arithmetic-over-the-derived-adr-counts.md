# Problem 135: The compendium entry hook has no arithmetic over the derived ADR counts, so the total drifts by one on every new ADR

**Status**: Open
**Reported**: 2026-08-09
**Priority**: 8 (Medium), Impact: 2 x Likelihood: 4, derived at capture from the description. Impact is 2 because `RISK-POLICY.md` rates a defect confined to dev tooling with no visitor or reader effect at Minor, and this one is confined to a metadata line in a governance document that no gate parses. Likelihood is 4 rather than 5: the drift trigger is certain, since the hook fires on every ADR write and has no count arithmetic at all, but the harm needs the drift to survive uncorrected, and on the one observed occasion it was corrected by hand in the same commit. It is not lower because that correction depended on someone remembering, which is the condition this ticket exists to remove.
**Origin**: internal
**Effort**: S. Either the count arithmetic is added upstream where the entry is written, or this repo gains a cheap check that fails when the header disagrees with the file count. No product code either way.

## Description

`docs/decisions/README.md` opens with a derived summary line of the form `**Total ADRs:** N (M in-force, H historical)`, plus a per-section count in each section's preamble. Nothing recomputes them when an ADR lands.

The compendium is now maintained by the `architect-compendium-update-entry.sh` PostToolUse hook, which re-derives a single entry whenever its ADR file is written. Verified on disk 2026-08-09 against the installed hook: it never reads, writes or recomputes `**Total ADRs:**` or either section preamble. Say it that precisely, because the hook does count things: its fail-closed post-condition guard tallies `^## ` section headers and counts occurrences of the entry id it just wrote, and it reads the whole file several times to snapshot the entry-id set before and after. So it is entry-scoped in what it **writes**, not in what it reads, and the counting it does is a structural-invariant check on its own edit rather than a tally of the corpus. The gap is specifically arithmetic over the derived ADR figures, which is what the title says.

The retired full-file generator did compute the counts (it emits the `Total ADRs` line and both section preambles from tallies it builds while walking the corpus). So this is a capability that existed under the tool that is going away and was not carried into the tool that replaced it. That generator now self-declares deprecated on every invocation and is scheduled for removal, so "just run the generator" is not the answer.

Observed 2026-08-09 during P128. ADR-049 landed; the entry hook wrote its entry correctly and left `Total ADRs` reading one short. It was corrected by hand in that commit, and the correction is recorded in the cross-session briefing as a thing the operator must remember to do. A briefing bullet is a reminder, not a control.

The counts are right at the time of writing: 49 total as 45 in-force plus 4 historical, which matches 37 `.proposed` plus 8 `.accepted` plus 4 `.superseded` on disk. They will be wrong the next time an ADR lands without someone thinking of it.

## Symptoms

`**Total ADRs:**` in `docs/decisions/README.md` disagrees with `ls docs/decisions/*.md | grep -v README | wc -l`, and the two section preambles (`_N ADRs. These are the current rules..._` and `_H ADRs. These were tried and superseded..._`) disagree with the number of entries rendered beneath them. The disagreement is one per un-corrected ADR landing, so it compounds silently rather than announcing itself.

## Workaround

After any commit that lands or re-statuses an ADR, recount and correct the three numbers by hand:

```bash
ls docs/decisions/*.md | grep -v README | wc -l                    # total
ls docs/decisions/*.proposed.md docs/decisions/*.accepted.md | wc -l   # in-force
ls docs/decisions/*.superseded.md docs/decisions/*.rejected.md docs/decisions/*.deprecated.md 2>/dev/null | wc -l  # historical
```

Do not reach for `wr-architect-generate-decisions-compendium` to fix it. It would recompute the counts, but it rewrites every entry to do so, which discards hand annotations and re-emits em-dashes the no-em-dash hook rejects (P087).

## Impact Assessment

- **Who is affected**: anyone reading `docs/decisions/README.md` to size the decision corpus, and the architect agent, which is documented to read this section first.
- **Frequency**: the trigger is every ADR landing. The harm is every ADR landing where nobody remembers to recount.
- **Severity**: Minor. No gate parses these numbers, so no verdict can be wrong from this. The cost is a reader who trusts a header that is quietly wrong, and the class of error is the same one P128 is about: governance metadata that reads as current because nothing marks it stale.
- **Analytics**: none.

## Root Cause Analysis

### Investigation Tasks

- [ ] Confirm the placement proposal before acting on it. The hook lives in the `wr-architect` plugin, which this repository consumes rather than owns, so the arithmetic most likely belongs upstream next to the code that writes the entry. That is a proposal the upstream maintainers can decline, not a settled fact about where the work goes (P045). Check whether a per-entry hook is even the right place for a whole-section tally before proposing it there.
- [ ] Decide whether this repo wants a local check regardless of the upstream outcome. A few lines that recount and compare would fail loudly on drift without waiting on anyone, and would keep working if the upstream answer is "the entry hook is deliberately entry-scoped". Weigh that against adding a check for a defect whose worst outcome is a wrong number in a header.
- [x] Create a reproduction. No throwaway ADR was needed: landing ADR-050 on 2026-08-09 reproduced it exactly as this
      ticket predicted. See the recurrence evidence below. The second half of the task, asserting the counts again
      after whichever fix is chosen, is still owed and belongs with that fix.
- [ ] File as a `/wr-itil:report-upstream` candidate against `@windyroad/wr-architect` if the first task confirms the upstream placement.

## Recurrence evidence (2026-08-09, first predicted recurrence)

This ticket's Description said the counts were right at the time of writing, 49 total as 37 `.proposed` plus 8 `.accepted` plus 4 `.superseded`, and predicted they "will be wrong the next time an ADR lands without someone thinking of it."

That happened the same day. ADR-050 landed and the counts drifted by exactly one. Disk now reads 38 `.proposed` plus 8 `.accepted` plus 4 `.superseded`, so 50 total and 46 in-force, while the compendium still claimed 49 and 45. The drift also survived its own commit uncorrected, which is the part that matters: nothing in the commit path noticed.

Two details worth recording for whoever fixes this.

**Both stale numbers must move together.** Line 14 carries `**Total ADRs:** 49 (45 in-force, 4 historical)` and line 20 carries `_45 ADRs. These are the current rules...._`. An earlier draft of the correction touched only line 14, which would have left the file asserting 46 in-force at line 14 and 45 six lines later. That is worse than being uniformly wrong: a reader can discount a header that is consistently off by one but cannot adjudicate between two disagreeing numbers. Line 245's historical count of 4 was and remains correct.

**The row was written by the hook, not the generator.** The ADR-050 entry at lines 235 to 239 was appended by `architect-compendium-update-entry.sh` firing on the ADR write. The retired generator did compute these counts, so this is a capability lost in the handover to the hook rather than a defect the hook introduced. That distinction is the reason this ticket stays separate from P087, and it survived a challenge on 2026-08-09: the proposal to fold this onto P087 as a second symptom of the same tooling was rejected on the grounds recorded in this ticket's own Related section.

Corrected by hand in the same commit, per this ticket's Workaround and the stronger instruction in `docs/briefing/architect-compendium-deadlock.md` not to run the generator at all.

### Second recurrence, same session (2026-08-09)

ADR-051 landed roughly an hour after the ADR-050 correction above, and the counts went stale again immediately: the file claimed 50 total and 46 in-force against 51 and 47 on disk, with both lines wrong again. So the defect reproduced twice in one session, and on the second occasion the numbers had been correct for less than an hour.

That is worth more than a second tally mark, because it rules out the reading that the first instance was a one-off missed by whoever landed ADR-050. The hook appends its entry and does not touch the arithmetic, every time, and the only thing standing between the compendium and permanent drift is a human noticing. Two for two on the ADRs that have landed since this ticket was written.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P087, P128

## Related

- **P128** (`docs/problems/known-error/128-risk-threshold-restated-in-ten-places-with-no-single-source-of-truth.md`): the ticket that surfaced this. Its last investigation task asked whether the compendium can be regenerated; the answer was that regeneration is retired and the per-entry hook replaces it, at which point the missing count arithmetic became a finding with no home. Captured here rather than left in P128, whose scope is threshold prose.
- **P087** (`docs/problems/known-error/087-wr-architect-generate-decisions-compendium-emits-em-dashes-violating-adopter-no-em-dash-policies.md`): the sibling gap in the same tooling. The entry hook emitted an em-dash into the ADR-007 heading on 2026-08-09 and the `no-em-dash-bash.sh` hook blocked until it was rewritten to a hyphen. Same tool, different failure, deliberately not merged.
- **P083** (`docs/problems/closed/083-adr-compendium-decisions-readme-is-stale-lists-eight-entries-while-decisions-on-disk.md`): the closed predecessor. It was about entries missing from the compendium and was answered by the per-entry hook existing at all. This ticket is the residue that fix left: the entries are maintained, the numbers describing them are not. Checked for absorption; it is closed and its scope does not reach the counts.
- **P098** (`docs/problems/known-error/098-work-problems-step-6-5-kv-auto-transition-has-no-vehicle-for-repo-local-script-fixes-in-a-consumer-repo-no-npm-release.md`): the shape precedent for a consumer-repo ticket whose fix is proposed upstream, including how the placement claim should be held as a proposal.
- Anchoring, provisional and in prose per this repo's local convention for maintainer-tooling tickets, which omits the header lines. The **internal-maintainer** persona (`docs/jtbd/internal-maintainer/persona.md`) fits: someone frequently absent while the work runs, for whom a governance document quietly disagreeing with disk is exactly the quiet error the persona names. The anchor is provisional because the persona is unratified. No documented job is claimed. JTBD-400 (Trust What the Loop Did While I Was Away) is a closer fit here than it was for P129, since its outcomes are about verdicts and measurements being right or visibly absent and a corpus count is a measurement, but the claim is left unmade until the persona set is ratified.
- Captured via `/wr-itil:capture-problem` under `--no-prompt` from the P128 iteration. The hang-off pre-filter surfaced three candidates on the `docs/decisions/README.md` signal (P097, P120, P122); none touches the compendium's derived counts, so the dispatch was not warranted and this proceeds as a new ticket. P083 and P087 came from the title grep and are addressed above.
