# Problem 077: Voice and tone gate misses Tom-specific idioms not codified in the guide

**Status**: Open
**Reported**: 2026-06-01
**Priority**: 3 (Medium). Impact: 3 x Likelihood: 3 (deferred. Re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: M (deferred. Re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

The voice and tone gate (wr-voice-tone:agent) passes phrases that match the documented rules in docs/VOICE-AND-TONE.md but don't match Tom's personal voice. The agent has no oracle for "what Tom says" separate from the general rules.

The 2026-06-01 prep run for The Shift Issue 07 produced multiple phrases that passed the gate but Tom rejected:

- "came due" (finance / legal idiom). Tom: "I don't talk like that".
- "this beat" (music / journalism idiom in the From-Tom opener). Borderline; survived in the final draft but flagged for awareness.
- Various jargon stacks ("substrate provider" in H1, "services-arm" in body, "tier-1 + eval-governance + eval harness" stacked in one item, "sandboxing patterns" as a heading phrase). Each one matched the guide's gloss-on-first-use rule mechanically but failed Tom's editorial bar for plain English.
- "narrative tide turns" (in an earlier heading iteration). Journalism cliche.

Tom's actual voice, visible in prior published editions (2026-05-25 "AI's real prize is capacity, not a smaller team"; 2026-05-15 closing line; 2026-05-01 closing line), uses concrete verbs ("landed", "shipped", "rationed", "ration"), avoids finance / legal idioms, avoids journalism cliches, avoids abstract-noun stacks, and has a recognisable cadence the docs/VOICE-AND-TONE.md guide does not codify in detail.

The current guide has:

- Voice principles (direct, confident, specific, empathetic, respectful of reader's team). Abstract.
- Tone-by-context sections (hero, blog, LinkedIn, etc.). Abstract.
- Banned patterns. Specific but limited (actually, leverage, deep dive, etc.).
- Word list (prefer / avoid). Specific but small.

What's missing: a Tom-vocabulary or Tom-idioms reference drawn from prior published editions, with a "phrases Tom doesn't use" list (finance idioms, journalism cliches, abstract-noun stacks) as banned-pattern entries.

Suggested fix:

- Add a "Tom's voice reference" section to docs/VOICE-AND-TONE.md drawn from prior published editions in src/newsletters/published/. Include:
  - Verbs Tom uses ("landed", "shipped", "rationed", "broke", "fix")
  - Phrasings Tom uses for the reader ("your team", "your patch cycle", "your CFO")
  - Phrasings Tom uses for himself / Windy Road ("we have shipped", "we run", "we help")
  - Banned-idiom list (finance: "came due", "on the table", "in the red"; journalism: "narrative tide turns", "the story is", "what to watch")
  - Abstract-noun-stack examples that fail the CTO-from-non-AI-native-company clarity test ("substrate provider", "eval-governance reference structures", "containment patterns")
- Update the wr-voice-tone:agent prompt to consult this section in addition to the general rules
- Optionally: extract Tom's published voice via a corpus pass over src/newsletters/published/ to build the seed list automatically, then have Tom curate

## Symptoms

(deferred to investigation)

## Workaround

(deferred to investigation. Current workaround is Tom's manual editorial pass catching the gaps that the voice gate let through.)

## Impact Assessment

- **Who is affected**: (deferred to investigation. Direct: agents producing copy; indirect: Tom reviewing copy.)
- **Frequency**: (deferred to investigation. Estimated: multiple flags per edition based on the 2026-06-01 prep run.)
- **Severity**: (deferred to investigation. Estimated: moderate per flag; compounding because the gaps require user-judgement to spot.)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Corpus-extract Tom's vocabulary from src/newsletters/published/ as a seed list
- [ ] Draft the "Tom's voice reference" section for docs/VOICE-AND-TONE.md with Tom-curated entries
- [ ] Update wr-voice-tone:agent prompt to consult the new section
- [ ] Test on the next /wr-newsletter prep run by counting Tom-rejection rate before vs after

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P075 (newsletter drafter headings fail clarity test, gates do not catch). Both tickets address the same class of voice-gate blind spot from different angles: P075 on heading-level structure, P077 on word-level idioms.

## Related

- **P075** (`docs/problems/open/075-newsletter-drafter-headings-fail-clarity-test.md`). Sibling.
- **P076** (`docs/problems/open/076-newsletter-pipeline-drafts-body-before-heading.md`). Adjacent; would compose with the Tom-voice gate to catch idiom failures earlier in the pipeline.

(captured manually following the /wr-itil:capture-problem template after Tom-direction; bundled with P076 + P078 in one batch commit per ADR-014 related-cluster carve-out)
