# Problem 139: Ratification flips frontmatter but nothing sweeps the prose asserting the prior unconfirmed state

**Status**: Open
**Reported**: 2026-08-09
**Priority**: 8 (Medium), Impact: 2 x Likelihood: 4, derived at capture from the description. Impact is 2, the same Minor band P128 and P138 use for stale governance prose: the harm reaches no reader or visitor and produces no wrong site or newsletter output, and RISK-POLICY reserves Impact 3 for visitor degradation or newsletter-pipeline disruption. Note one way this differs from those two comparables: both of them justify Impact 2 partly on the harm being unable to produce a wrong gate verdict, and that half does not transfer, because this one does reach gate behaviour (the JTBD edit gate withholds its marker on a refusal that is no longer warranted). The band still holds; a wrong gate refusal on internal tooling is dev-tooling cost. Likelihood is 4 on RISK-POLICY's coverage definition, not on frequency: no hook or automated check covers the area, because nothing joins prose claims to `human-oversight:` frontmatter. Two-of-two is corroboration, not the argument.
**Origin**: internal
**Effort**: M, derived at capture. Detection is a small script over `human-oversight:` frontmatter versus prose claims, cf. the grep-shaped detectors P089 built. The cost is not the detector, it is deciding where it fires: `/wr-jtbd:confirm-jobs-and-personas` and `/wr-architect:review-decisions` both need a sweep step, and the prose forms are varied enough ("unratified", "not yet ratified", "carries `human-oversight: unconfirmed`", "cite it as provisional") that the matcher needs care to be useful rather than noisy.
**WSJF**: 4.0 = (8 x 1.0) / 2
**JTBD**: JTBD-400
**Persona**: internal-maintainer

## Description

Ratifying a JTBD, persona or ADR flips `human-oversight:` in one or two files. But the fact of the prior unconfirmed state has by then been written into prose across problem tickets, briefing files and the ratified artefact's own body, and nothing sweeps those. Nothing in this repo cross-checks a prose oversight claim against the `human-oversight:` frontmatter it describes.

The claim and its source of truth live in different files, in different formats, and only one of them is machine-readable.

### Two witnesses, both on 2026-08-09

**Witness 1, commit `cc68d4f`.** It ratified the internal-maintainer persona and JTBD-400, JTBD-401 and JTBD-402. It flipped four frontmatter blocks and stopped there. Left standing:

- `docs/problems/verifying/122-...md` still called the persona "unratified".
- `docs/briefing/what-you-need-to-know.md` carried an entire entry headed "The maintainer persona gap is closed on disk but not yet ratified (2026-08-08)", asserting that all four files carry `human-oversight: unconfirmed` and that this is "a hard stop on executable work".
- `docs/briefing/README.md` carried the same claim in its Critical Points list.

**Witness 2, the JTBD-006 ratification.** The same day, ratifying JTBD-006 falsified three further sites and one self-contradiction:

- `docs/problems/known-error/121-...md` in two places, one of them an operative instruction to downstream agents reading "Cite it as provisional grounding, never as settled", whose stated premise had become false. An agent that notices the false premise has reason to discount the whole guard, including the part that still holds.
- `docs/problems/verifying/122-...md` again, on the same line as the persona instance.
- JTBD-006's own opening callout, which read "**Not ratified.**" with the very next sentence recording that Tom had read and ratified it. That is the first prose in the file and the thing two other tickets link to.

Both sweeps were done by hand, in the iteration that noticed. Neither was prompted by anything.

### Why the briefing surface is the expensive one

`docs/briefing/README.md` is SessionStart-injected. A falsified oversight claim there does not sit waiting to be read; it enters every future session's context automatically, as an assertion about current repo state, ahead of any file the agent might check.

The specific shape of the harm is a wrong refusal. While the claim was true, it correctly stopped a fully designed, twice-reviewed fix on the P115 iteration, because "reasons from an unratified persona" is an ISSUES FOUND the JTBD edit gate withholds its marker on and an AFK agent cannot clear. That is the behaviour the entry was written to produce, and it worked. After ratification, the same entry produces the same refusal against work that is no longer blocked, and an AFK agent has no cheap way to tell the two cases apart, because the entry reads as current state and the agent has no reason to doubt it.

This is the inverse of P138. P138 is about an unread record acquiring authority it was never granted. This is about a read record failing to shed a caveat it no longer carries.

## Symptoms

An artefact is ratified. Its frontmatter says `human-oversight: confirmed`. Prose elsewhere, and sometimes in the same file, says it is unratified, unconfirmed, or provisional. An agent reading the prose reasons from it, because prose is what the briefing surface and the ticket bodies are made of.

## Workaround

Sweep by hand in the ratifying commit. `grep -rn "unratified\|not yet ratified\|human-oversight: unconfirmed\|provisional" docs/` locates most instances, and the ratified artefact's own callout and Notes need reading in full rather than grepping, because the self-contradiction in witness 2 used neither of those phrasings in the falsified sentence.

## Impact Assessment

- **Who is affected**: any agent reasoning about what is confirmed from prose rather than frontmatter, which is every agent, since the briefing surface and problem tickets are prose. And Tom, whose ratification does not fully take effect until someone notices.
- **Frequency**: twice out of two ratification events, both on 2026-08-09.
- **Severity**: no reader or visitor impact and no wrong site or newsletter output. The cost is a wrongly refused category of work plus the iteration budget spent rediscovering that the refusal was stale.
- **Analytics**: none.

## Root Cause Analysis

### Investigation Tasks

- [ ] Confirm the root cause: the oversight claim and its source of truth are in different files and different formats, and only the frontmatter half is machine-readable, so nothing can join them.
- [ ] Decide where a sweep belongs. Candidates: a step in `/wr-jtbd:confirm-jobs-and-personas` and `/wr-architect:review-decisions` that greps and reports before committing the flip; a standalone detector that any commit touching `human-oversight:` triggers; or a periodic check in `/wr-itil:review-problems`. The first catches it at the moment the fact changes, which is the only moment someone has the context to rewrite the prose correctly.
- [ ] Decide whether the ratified artefact's own body is in scope. Witness 2's self-contradiction was in the ratified file itself, and a grep for oversight vocabulary would not have found the falsified sentence.
- [ ] Check whether the fix belongs upstream. `/wr-jtbd:confirm-jobs-and-personas` and `/wr-architect:review-decisions` are both plugin-cache skills, not local, so a sweep step inside either is a cross-repo change and this repo can only propose it. Verify placement before scoping, per P045.
- [ ] Create a reproduction test.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P138, P136

## Related

- **P138** (`docs/problems/open/138-nothing-gates-or-reports-on-the-human-oversight-axis-at-promotion-time.md`): the same axis from the other end. P138 asks whether `status: accepted` should be reachable while `human-oversight: unconfirmed`; this ticket is about prose that outlives a flip to `confirmed`. Arbitrated at capture by a fresh-context `wr-itil:hang-off-check` dispatch, verdict PROCEED_NEW: P138's corpus is ADR frontmatter and the promotion script, and its first Investigation Task is a live A/B/C decision that is Tom's alone, so absorbing a prose-sweep defect into it would dilute that decision.
- **P136** (`docs/problems/open/136-tier-3-briefing-rotation-strips-entries-the-critical-points-still-point-at.md`): the nearest sibling and the same surface. Same arbitration, same PROCEED_NEW verdict: P136's failure is referential, a Critical Points bullet pointing at a topic file that no longer holds the entry, where this one is a truth-value failure, an entry whose content has been falsified elsewhere in the repo. Both are cases of "the briefing roll-up can carry a claim that no longer holds", so they are worth clustering at the next `/wr-itil:review-problems` pass.
- **P128**: the impact band precedent for stale governance prose.
- Thirteen further tickets matched the mechanical Step 2b pre-filter and were not offered as candidates: P088, P096, P097, P109, P122, P129, P130, P131, P132, P133, P134, P135, P137. Twelve of them matched on the literal token `human-oversight` appearing in a provisional-anchoring note under their own `## Related` section, which is anchoring boilerplate rather than shape overlap. **P122 is the exception and the reason to re-check this list rather than trust it.** P122 carries no provisional-anchoring note at all, since it anchors on JTBD-005 and JTBD-200 and both are ratified. Its `human-oversight` occurrences are substantive, and it holds a `## STALE PREMISE SWEEP, 2026-08-07` section that is itself a worked instance of this ticket's class. The decline still stands on other grounds (P122 is Verification Pending and scoped to newsletter gates), but the boilerplate reason does not apply to it, and the narrowing was mine rather than the arbiter's. Recorded per the Step 2b over-cap rule so the next reviewer re-evaluates rather than takes it on trust.
- **Three further live instances, un-swept at capture**, found by the risk scorer while checking this ticket's own claims. All three still assert the internal-maintainer persona or its jobs are unratified, and all three are false as of 2026-08-09: `docs/problems/open/136-*.md` line 57, `docs/problems/open/134-*.md` line 63, and `docs/problems/open/097-*.md` line 60. They are left standing deliberately: sweeping them is this ticket's fix work, not its capture, and they are the cheapest available fixture for a reproduction test. The briefing already tells a reader to treat pre-2026-08-09 caveats as stale, which is the workaround, not the fix.
- Fix commit for both witnesses: `a46b814` (JTBD-006 sweep) and `cc68d4f` (the persona ratification that left the first residue).
- Captured via `/wr-itil:capture-problem`; expand at next investigation.
