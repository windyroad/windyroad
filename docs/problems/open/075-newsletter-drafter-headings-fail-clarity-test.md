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

### Investigation findings (2026-06-16)

Confirmed by reading the files on disk:

- The critic rubric (`.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md`) no longer carries a numbered `check_36`. It was rewritten to the ADR-035 check-free editorial-reader format (STRENGTHS / WEAKNESSES / optional RELEVANT CONTEXT, no numbered checks). The ticket's `check_36` reference predates that rewrite. The real gap is that no rubric concern, numbered or prose, audited headings as a separate surface: clarity, jargon density, and cross-heading sameness were uncovered.
- The voice agent gloss-on-first-use enforcement runs at body-copy granularity. Heading-level jargon stacking and colon-flourish sameness fell between the editorial critic (no heading concern) and the voice agent (body only). This is the catch-it-in-gates gap.
- The colon-flourish habit lives in the drafter step 11a/11b instructions, which named no anti-default for the "X: Y" framing and required gloss-on-first-use only implicitly via the body voice rules.

Root cause: heading craft had no owner in any gate. The fix homes the heading-craft concern explicitly in the critic rubric (review backstop) and in the drafter step 11a/11b instructions (prevent-at-draft).

### Fix Strategy (repo-local checks landed 2026-06-16)

- `.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md`: added a "Headline craft" section with three editorial-reader concerns (headline clarity via the VOICE-AND-TONE "competent CTO from a non-AI-native company" standalone-readability test on the H1 plus each Item heading; headline jargon density flagging two-or-more unglossed specialist terms in one heading; sameness-across-headings flagging an editorial-framing pattern on more than half the items). Noted in Coverage partitioning that heading craft is deliberately critic-owned because the sibling voice and cognitive-accessibility gates audit body copy, not headings. Kept the ADR-035 no-numbered-checks prose format.
- `.claude/skills/wr-newsletter/SKILL.md`: step 11a H1 bullet now requires the H1 to pass the standalone-readability test and bans unglossed specialist-term stacking; step 11b gained a "Heading craft" discipline discouraging the colon-flourish default (no more than half the items may share one framing pattern) and requiring gloss-on-first-use at HEADING granularity.

All new checks are grounded in the documented Issue 07 evidence (substrate-provider H1, bare Starlette, services-arm, stacked tier-1 plus eval-governance plus eval harness, sandboxing patterns, 5-of-7 colon-flourish headings). No invented examples (P082).

### Outstanding (upstream-bound)

- The suggested-fix "cross-reference the voice agent prompt to apply the gloss-on-first-use audit to H1 and Item headings as a separate pass from body copy" targets the upstream `wr-voice-tone` plugin agent prompt (installed plugin cache, not editable from this consumer repo). It must be raised against the upstream plugin. The repo-local critic plus drafter checks above already close the catch-it-in-gates intent for the `/wr-newsletter` pipeline; the voice-agent cross-reference is defence-in-depth, not a blocker.

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [x] Investigate root cause: is the colon-flourish habit in the drafter prompt, in the critic rubric's check_36 wording, or both? (Both surfaces; `check_36` no longer exists post-ADR-035; the gap was heading-granularity coverage absent from both critic and drafter. See Investigation findings.)
- [x] Create reproduction test: superseded. `check_36` no longer exists; the rubric is now check-free editorial-reader prose (ADR-035), so the "feed headings through check_36" reproduction is obsolete. The behavioural check is now the critic's "Headline craft" prose concern, exercised on the next `/wr-newsletter` run.
- [ ] Upstream: raise the voice-agent heading-granularity gloss pass against the `wr-voice-tone` plugin (not editable from this consumer repo).

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

- **P064** (`docs/problems/open/064-newsletter-critic-round-3-budget-exhausted-on-fixable-micro-issues.md`). Sibling. Same /wr-newsletter prep run hit critic-round-3 exhaustion on micro-issues (check_16 sentence length plus check_20 substrate-provider H1 jargon). Both tickets surface gaps in the newsletter-critic rubric's coverage of editorial discipline.
- **P070** (`docs/problems/open/070-newsletter-draft-template-does-not-codify-three-deep-items-plus-notes-discipline.md`). Adjacent. Draft template gap; this ticket is about headline craft inside whichever template structure is used.

(captured via /wr-itil:capture-problem; expand at next investigation)
