# Problem 178: A reviewer states a read extent that is wrong, and the false absence it grounds looks verified

**Status**: Open
**Reported**: 2026-08-30
**Priority**: 12 (High), Impact: 3 x Likelihood: 4, derived at capture. Impact is 3 because the loss is confined to governance records: nothing reaches a reader, and the standing verify-before-propagating discipline is the control that catches it. That is the band P166 took for a governance surface degrading unannounced. It is not 2, because this failure does not merely withhold coverage the way P166's does; it produces a remediation that would rewrite a correct citation into a wrong one, so acting on it makes the record worse than not running the check at all. Likelihood is 4 because the cause is structural rather than incidental: a reviewer given a large artefact reads a bounded part of it, and nothing in the output shape distinguishes a bounded read from a complete one.
**Origin**: internal
**Effort**: S, derived at capture. The fix is a clause in the reviewer agent definitions requiring an absence claim to state how the absence was established and to report the artefact's full extent alongside what was read. Authoring is small; landing is upstream in the agent-plugins repo and is not this project's to place.
**WSJF**: 12.0 = (12 x 1.0) / 1

## Description

A reviewing subagent asserted a specific read extent that was false, and used it to ground an absence claim. The stated extent is what made the claim look checked.

**Evidence, 2026-08-29/30, during the P120 close.** The `wr-risk-scorer:pipeline` agent wrote:

> "I read all 549 lines of `src/newsletters/published/leader/2026-08-24/2026-08-24.reviews.md`. That sentence is not in it."

and on that basis raised remediation R9, directing that a quotation in P120 be re-attributed away from the reviews file and re-worded.

The file is 616 lines. The sentence is at lines 611 to 612, verbatim, under the bolded lead **"What that evidence does not show."** Two further sub-claims in the same finding were false the same way: "no paragraph in it names P122 or P152" (P152 is named at line 590), and a claim that P120's framing of the passage as qualifying evidence for two other tickets was unsupported (lines 580 to 582 state exactly that purpose). A later scoring pass, asked to check the line count, refuted its predecessor and confirmed the original attribution was correct.

Had R9 been applied, a correct attribution would have been rewritten into a wrong one, inside the section of a closing ticket whose whole warrant is that it was verified against disk.

## Symptoms

- A reviewer reports an absence and names the extent it read, and the named extent is larger than what it actually read.
- A consumer applying the verify-before-propagating discipline still cannot tell a bounded read from a complete one, because the output asserts completeness.
- The false absence survives one round of scrutiny; it is caught only if the consumer independently measures the artefact.

## Workaround

Before acting on any absence claim in a subagent verdict, measure the artefact yourself (`wc -l`, `wc -c`) and compare against whatever extent the verdict names. If the verdict names no extent, treat the absence as unestablished. Manual, and it only fires when the consumer thinks to check a number the verdict presented as settled.

## Impact Assessment

- **Who is affected**: whoever consumes a governance reviewer's verdict, which on this project is every gate-mediated commit.
- **Frequency**: once observed directly. `docs/briefing/README.md` line 7 records a sibling instance from the same week, in which the scorer caught "a capture that asserted a sibling agent carried no verdict instruction when it carries the same one, an absence claim produced by a truncated grep rather than by reading the file". That instance is the scorer catching the pattern in someone else's work; this one is the scorer producing it. (A third, different instance sits at `docs/briefing/risk-scorer-behaviour.md` line 16 -- a CI step miscounted from a grep whose own output had printed the right number. That one is a misread rather than a truncation, and is not evidence for this ticket.)
- **Severity**: no wrong output reaches a reader. The cost is a wrong remediation that a consumer may apply, corrupting a record that was correct.
- **Analytics**: none.

## Root Cause Analysis

### Investigation Tasks

- [ ] Confirm which reviewer agents can make absence claims at all, and which of those read artefacts large enough for a bounded read to matter.
- [ ] Decide the required output shape. The candidate is: an absence claim must name the artefact's full extent and the extent actually read, and must say which method established the absence (whole-file read, grep, ranged read).
- [ ] Check whether the same clause belongs on the consumer side as well, or whether producer-side disclosure is sufficient given the standing verify-before-propagating discipline.
- [ ] Establish whether this is placeable here. The reviewer agent definitions live upstream in the agent-plugins repo, so this project can author the clause and propose it but cannot land it.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P127, P166, P155, P082

## Related

- **P127** (`docs/problems/open/127-unverified-subprocess-claims-propagate-into-decisions-without-reading-the-source.md`): the consumer-side counterpart. P127 is the orchestrator repeating a subagent claim without reading the source. This is the producer side: the claim carries a completeness assertion that makes the consumer's check look already done. On this occasion the consumer did check and the propagation P127 describes did not happen.
- **P166** (`docs/problems/open/166-a-governance-surface-that-silently-degrades-to-a-subset-of-its-specification-reads-as-a-clean-run.md`): same class, one step worse. P166's surface degrades to a subset and says nothing. Here the subset was affirmatively misreported as the whole, so a reader who went looking for a coverage statement would have found one and been misled by it.
- **P155** (`docs/problems/known-error/155-a-governance-subagents-recommended-action-can-be-wrong-in-a-way-only-the-enforcement-reveals.md`): the complement. In P155 every cited artefact was real and every asserted fact held, and the recommendation was still wrong. Here the asserted fact was false. Between them they cover both ways a verdict can mislead a consumer who has verified its references.
- **P082** (`docs/problems/closed/082-subagent-outputs-include-fabricated-references-to-artefacts-not-on-disk.md`): established that subagent output is hypothesis until verified, for references that do not exist. This extends the same asymmetric trust model to claims about what is absent from a reference that does exist, which the existence check does not reach.
- **P103**: the assistant-side version of the same reasoning error, that a bounded search finding nothing is not proof of absence. Closed. This ticket is that error appearing in a subagent verdict rather than in assistant output, where the consumer cannot see the search that produced it.
- Captured via `/wr-itil:capture-problem` during the P120 close retrospective (2026-08-30).
