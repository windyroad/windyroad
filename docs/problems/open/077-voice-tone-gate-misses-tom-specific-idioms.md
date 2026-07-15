# Problem 077: Voice and tone gate misses Tom-specific idioms not codified in the guide

**Status**: Open
**Reported**: 2026-06-01
**Priority**: 9 (Medium). Impact: Moderate (3) x Likelihood: Possible (3) (re-rated 2026-07-15 review: recurs each edition until Tom-voice corpus is codified; manual editorial pass is the only net)
**Origin**: internal
**Effort**: M (corpus extraction from recorded rejections + guide amendment)
**WSJF**: 4.5 = (9 x 1.0) / 2
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
- [x] Corpus-extract Tom's vocabulary from src/newsletters/published/ as a seed list (done 2026-06-16; see Findings below)
- [x] Draft the "Tom's voice reference" section for docs/VOICE-AND-TONE.md (done 2026-06-16 as a corpus-seeded draft; Tom-curated 2026-06-17, see Resolution below)
- [x] Tom curates the corpus-seeded draft: keep / drop / reword each seed entry; drop the "pending curation" qualifier from the section header (done 2026-06-17: banned list kept, three corpus-positive tables dropped, services-arm hyphenated stack banned, section reframed + retitled "Idioms Tom rejects"; see Resolution below)
- [ ] Update wr-voice-tone:agent prompt to consult the new section (UPSTREAM-BLOCKED, see Dependencies)
- [ ] Test on the next /wr-newsletter prep run by counting Tom-rejection rate before vs after

### Findings (2026-06-16, AFK iteration)

Corpus-extracted Tom's published vocabulary from all nine published leader editions of The Shift (`src/newsletters/published/leader/2026-04-17` through `2026-06-15`). Every recorded entry is a verbatim, grep-verified usage with the source edition cited; no invented or paraphrased entries (P082 no-fabrication).

Drafted the "Tom's voice reference (corpus-seeded draft, pending curation)" section into `docs/VOICE-AND-TONE.md` (appended before "## Technical constraints"). It captures:

- **Verbs Tom reaches for** (ration, land, ship, hold the line, bank, clear, walk back, push on, pull a lever) with verbatim quotes.
- **How Tom addresses the reader** (your team, your patch cycle, your CTO, on your desk, your security team, the bottleneck in your team's work).
- **How Tom talks about himself / Windy Road** ("we" for the team, "I" for hedged conviction and predictions).
- **Banned-idiom list** sourced from this ticket's documented Tom-rejections (finance/legal idioms, journalism cliches, abstract-noun stacks).

The section is explicitly marked as a draft pending Tom's curation; it does not assert the seed list as final.

Governance gates run before the edit (per /wr-itil:manage-problem): wr-architect:agent PASS (VOICE-AND-TONE.md is the chosen voice-rule surface per ADR-015; no new ADR needed; deferring the upstream agent-prompt half as upstream-blocked is consistent with ADR-036), wr-jtbd:agent PASS (serves the newsletter-production jobs; pending-human-curation is the correct posture for a taste artifact), wr-voice-tone:agent PASS (section prose obeys the guide; two accuracy fixes applied before append: the services-arm curation note was corrected after verifying the hyphenated form also shipped 2026-05-15, and the "your team" header was confirmed present in all nine editions). The style-guide gate is not applicable (no CSS / visual-design change).

A correction caught during the voice-tone gate: an early draft of the services-arm curation note claimed only the unhyphenated "services arm" shipped in the 2026-05-15 edition. Grep verification showed the hyphenated "services-arm" also shipped that edition (Item 2 heading + a note), so the note was reworded to state the accurate tension before append.

### Resolution (2026-06-17, Tom-directed curation)

Tom reviewed the corpus-seeded section and gave explicit confirmed direction. Two decisions:

1. **Keep banned, drop positives.** The three corpus-extracted positive tables (Verbs Tom reaches for; How Tom addresses the reader; How Tom talks about himself and Windy Road) were removed. Tom's reasoning: those entries are mostly drafter-words he tolerated in AI-drafted-then-edited published editions, not good examples of his actual voice ("Most of these are actually your words. They aren't necessarily bad, but they are not necessarily good examples of how I speak/write"). The published-edition corpus is contaminated as a positive-voice source because the editions are AI-drafted; the surviving phrasing reflects what Tom let through, not what he would author. A future positive seed must come from Tom-authored material and is deferred until that material exists.
2. **Ban the hyphenated stack.** "services-arm" (the hyphenated stacked heading form) was added to the Abstract-noun-stacks banned row. The open-prose form "services arm" (e.g. "the vendor's services arm") stays acceptable; only the hyphenated stacked form is banned. This settles the open Curation note, which was removed.

The "Idioms Tom does not use (banned)" table was kept (it is drawn from Tom's real recorded rejections in this ticket, not the contaminated corpus). The section was reframed: the "corpus-seeded draft, pending curation" qualifier was dropped from the heading and the status blockquote, the section was retitled "Idioms Tom rejects", and the intro now states it is a settled rule set giving the voice-tone gate a concrete oracle for phrasings Tom rejects, with the deliberate non-seeding of positives explained. The "Last reviewed" provenance line in docs/VOICE-AND-TONE.md was updated to 2026-06-17.

Governance gates re-run before this curation edit (per /wr-itil:manage-problem): wr-architect:agent PASS (no ADR conflict; ADR-015 voice-rule surface reinforced, ADR-036 N/A as VOICE-AND-TONE.md is an in-project file; no new ADR), wr-jtbd:agent PASS (serves the newsletter-production jobs JTBD-001/002/003; tightening the gate oracle serves the engineering-leader clarity constraint), wr-voice-tone:agent PASS (reframed prose obeys the guide, no banned patterns, no em-dashes). Style-guide gate N/A (no CSS / visual change).

**Status decision: ticket stays Open.** The repo-local curation deliverable is complete, but the behavioural fix (the voice-tone gate actually consulting this oracle) is not delivered until the upstream wr-voice-tone:agent prompt update lands. That sub-task is the sole remaining open item and is upstream-blocked (the agent lives in the installed plugin cache; this consumer repo has no packages/wr-voice-tone/ source tree to edit, the ADR-036 predicate). Verification Pending was considered and rejected: ADR-022 reserves that status for "fix released, awaiting user verification", but the remaining work here is upstream DEV work, not user verification, so VP would mislabel the remaining-work type and overstate "fix released". Open with the documented `**Upstream-blocked (sub-task only)**` marker (see Dependencies) lets the work-problems upstream-blocked classifier skip the ticket without falsely signalling it is awaiting user confirmation.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Upstream-blocked (sub-task only)**: the "Update wr-voice-tone:agent prompt to consult the new section" Investigation Task cannot be done from this consumer repo. The `wr-voice-tone:agent` lives in the installed plugin cache (`~/.claude/plugins/cache/windyroad/wr-voice-tone/...`); this repo has no `packages/wr-voice-tone/` source tree to edit. This is the exact predicate of ADR-036 (marketplace-consumer-cannot-edit-cached-plugin): the fix site is inside the plugin-cache root. The in-repo half (the docs/VOICE-AND-TONE.md reference section) lands here; the upstream prompt-update half is deferred to the wr-voice-tone source repo. The ticket stays Open (not Parked) because the in-repo half progressed and the curation sub-task is still actionable by Tom.
- **Composes with**: P075 (newsletter drafter headings fail clarity test, gates do not catch). Both tickets address the same class of voice-gate blind spot from different angles: P075 on heading-level structure, P077 on word-level idioms.

## Related

- **Reported upstream**: https://github.com/windyroad/agent-plugins/issues/316 (2026-07-03)

- **P075** (`docs/problems/open/075-newsletter-drafter-headings-fail-clarity-test.md`). Sibling.
- **P076** (`docs/problems/open/076-newsletter-pipeline-drafts-body-before-heading.md`). Adjacent; would compose with the Tom-voice gate to catch idiom failures earlier in the pipeline.

(captured manually following the /wr-itil:capture-problem template after Tom-direction; bundled with P076 + P078 in one batch commit per ADR-014 related-cluster carve-out)

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/316
- **Reported**: 2026-07-03
- **Template used**: structured default (problem-shaped)
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes
