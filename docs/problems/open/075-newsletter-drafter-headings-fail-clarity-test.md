# Problem 075: Newsletter drafter headings fail clarity test, gates do not catch

**Status**: Open
**Reported**: 2026-05-31
**Priority**: 3 (Medium). Impact: 3 x Likelihood: 1 (deferred. Re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: M (deferred. Re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

The /wr-newsletter drafter produces brief headings that fail the docs/VOICE-AND-TONE.md "competent CTO from a non-AI-native company" clarity test, and neither the newsletter SW-critic rubric nor the voice agent catches it.

The 2026-06-01 prep run for The Shift Issue 07 produced colon-flourish "X: Y" headings on 5 of 7 items plus stacked specialist jargon: "substrate provider" undefined in the H1, bare "Starlette" without category gloss in Item 2, "services-arm" in Item 5, "tier-1" plus "eval-governance" plus "eval harness" all stacked in Item 6, and "sandboxing patterns" in Item 7.

Newsletter SW-critic check_36 (item-headline distinctiveness) PASSED these on round 2 because the rubric checks editorial-framing presence (a second clause on each headline) but not heading-level jargon stacking, not sameness-across-headings (5 of 7 using the same colon-flourish pattern), and not the standalone-readability test on each headline.

The voice agent rounds let them through because gloss-on-first-use enforcement was happening at body-copy granularity, not headline-level. Voice agent rounds 1 and 2 caught reader-respect violations and acronym-expansion violations in body copy, but did not separately audit heading-level jargon density.

Caught only by Tom user-review during the prep run with "all the headings are horrible" and "I thought voice and tone aimed for clarity". The fix landed as a Tom-directed manual rewrite (twice: once for the headings themselves, then a second pass on body copy that had similar jargon stacking).

Underlying drafter habit (colon-flourish on every Item heading as the default editorial-framing pattern) and rubric blind spots (no headline-clarity check, no headline-jargon-density check, no sameness-across-headings check) remain unresolved. Without fixes, the same failure mode will recur on the next /wr-newsletter run.

Suggested fixes worth investigating:

- Add a headline-clarity check to `.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md` that runs the CTO-non-AI-native-company standalone-readability test on the H1 and each Item heading separately.
- Add a headline-jargon-density check that flags stacked specialist terms (two or more in-group nouns without gloss) in any single heading.
- Add a sameness-across-headings check that flags an editorial-framing pattern appearing on more than half the items in one edition.
- Update the drafter instructions in `.claude/skills/wr-newsletter/SKILL.md` step 11 to discourage the colon-flourish pattern as a default and to require gloss-on-first-use at heading granularity, not just body.
- Cross-reference the voice agent prompt to apply the gloss-on-first-use audit to H1 and Item headings as a separate pass from body copy.

## Symptoms

(deferred to investigation)

## Workaround

(deferred to investigation)

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: (deferred to investigation)
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Investigate root cause: is the colon-flourish habit in the drafter prompt, in the critic rubric's check_36 wording, or both?
- [ ] Create reproduction test: feed a prior edition's headings through the existing rubric and confirm check_36 PASSES the jargon-stacked variants.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

- **P064** (`docs/problems/open/064-newsletter-critic-round-3-budget-exhausted-on-fixable-micro-issues.md`). Sibling. Same /wr-newsletter prep run hit critic-round-3 exhaustion on micro-issues (check_16 sentence length plus check_20 substrate-provider H1 jargon). Both tickets surface gaps in the newsletter-critic rubric's coverage of editorial discipline.
- **P070** (`docs/problems/open/070-newsletter-draft-template-does-not-codify-three-deep-items-plus-notes-discipline.md`). Adjacent. Draft template gap; this ticket is about headline craft inside whichever template structure is used.

(captured via /wr-itil:capture-problem; expand at next investigation)
