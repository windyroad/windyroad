# Problem 100: Newsletter cover hook silently clips, and the structural lint false-positives on a sentence-final model name

**Status**: Verification Pending
**Reported**: 2026-06-22
**Priority**: 4 (Medium). Impact: Minor (2) x Likelihood: Likely (2) (deferred, re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: S (deferred, re-rate at next /wr-itil:review-problems)
**WSJF**: deferred, re-rate at next /wr-itil:review-problems
**Type**: technical

## Description

Two related silent-format traps on the newsletter save/render surface, each caught this session only by eye or by Tom, not by tooling.

(a) `/wr-newsletter-cover` clips hook line 2 with no overflow warning. On Issue 10 the approved line 2 ("Governance, trust and new skills are the job", ~44 chars) rendered truncated to "...are the j" at 60px. The agent's fix was to trim the predicate to "Governance, trust and new skills", which fit but READS as a dangling fragment (Tom: "is it truncated? are there some words missing?"). The render-and-verify step passed it because it technically fit; "fits" is not the bar, "reads as complete" is. The skill silently truncates and has no guard against an over-long or fragment hook line.

(b) `scripts/check-newsletter-structure.sh` model-name consistency check (f) false-positives when a model name is sentence-final. It flagged a mismatch between the brief's "Gemma 4" and the cover/LinkedIn "Gemma 4." (with the trailing sentence period captured into the token). This fired on the cover-driven reword and again twice on the LinkedIn bullet; each time the fix was to move "Gemma 4" mid-sentence so no period follows. The check should normalise trailing punctuation before comparing model names.

## Symptoms

- Cover line 2 ships truncated or as a dangling fragment with no warning from the cover skill.
- `check-newsletter-structure.sh` exits 1 on "model-name mismatch for 'Gemma' between brief (Gemma 4) and linkedin (Gemma 4.)" purely because of a sentence-final period.

## Workaround

Cover: reword hook line 2 to a complete phrase under ~40 chars and visually verify the render. Lint: reword so model names are never sentence-final (move them mid-sentence followed by a space or comma).

## Impact Assessment

- **Who is affected**: the newsletter author; every edition with a cover render and a model name in the LinkedIn post.
- **Frequency**: cover overflow whenever line 2 runs long; lint false-positive whenever a model name ends a sentence.
- **Severity**: Minor but recurring; the cover trap can ship a visibly broken hero image if not eye-caught.

## Root Cause Analysis

(a) The cover render measures nothing; it draws the text and relies on the human render-and-verify Read. (b) The lint's model-name extraction captures the following punctuation into the compared token rather than tokenising on word boundaries / stripping trailing punctuation.

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [x] Cover skill: warn (or fail) when a hook line exceeds the safe-area width, and flag a hook line that ends in a dangling fragment (no terminal predicate). Done via a non-fatal `checkHookWidth` stderr warning in `scripts/render-cover.mjs` (hook-1 > 28, hook-2 > 40 chars, derived from the 1040px safe area). Chose warn over fail: char count is a proportional-font proxy, so a hard block would false-positive; the render-and-verify Read stays the backstop. The dangling-fragment half is addressed by removing the forcing function (the width warning stops the trim-to-fit that produced the fragment) rather than a deterministic NLP fragment-detector, which would be false-positive-prone for no extra coverage (Tom's Issue-10 fragment "Governance, trust and new skills" ends in a noun, so a function-word heuristic would miss it anyway).
- [x] check-newsletter-structure.sh: strip trailing punctuation from model-name tokens before the brief-vs-linkedin comparison so a sentence-final "Gemma 4." matches "Gemma 4". Done: `extract_models()` sed widened from `s/[[:space:]]+$//` to `s/[[:space:].,;:!?]+$//`. Internal version dots (e.g. "Sonnet 4.6") are preserved (non-trailing).
- [x] Consider whether these two concerns warrant splitting into separate tickets (cover skill vs lint script are distinct fix paths). Decided NOT to split: both fixes are S-effort and were delivered in one iteration, so splitting would add ticket ceremony with no ranking or sequencing benefit. The Step 4b auto-split path governs new-problem *creation*, not an existing ticket worked end-to-end in a single pass.

## Fix Released

Both concerns fixed 2026-06-27 in the working tree (repo-local; no package release, so no changeset per the fix-surface rule):

- **(b) lint false-positive**: `scripts/check-newsletter-structure.sh` `extract_models()` now strips trailing sentence punctuation (`.,;:!?`) before the check (f) brief-vs-linkedin comparison. Behavioural coverage added to `scripts/check-newsletter-structure.test.mjs`: a sentence-final "Gemma 4." no longer trips (f), and a genuine "Sonnet 4.6" vs "Sonnet 4" version mismatch still fires (internal dots preserved).
- **(a) cover silent clip**: `scripts/render-cover.mjs` exports `checkHookWidth()` and main() prints its non-fatal warnings to stderr when a hook line is over budget (hook-1 > 28, hook-2 > 40). Behavioural coverage added to `scripts/render-cover.test.mjs`. `.claude/skills/wr-newsletter-cover/SKILL.md` hook_line_2 guidance reconciled ("around 45 chars max" was self-contradictory; now ~40 with the Issue-10 clip cited) and the new warning documented in step 3.

Gates: architect PASS (no new ADR; dropped a fabricated ADR-052 citation, reconciled the SKILL.md line-34 contradiction), jtbd PASS. Tests: 26/26 green across both suites.

**I13 note (P104)**: the fix-time RFC-trace gate would fire `no-rfc-trace` here; this repo has no RFC tier, so per P070/P103 the legacy direct-implementation path was used and no RFC was auto-created (known false positive).

Awaiting user verification that the lint no longer false-positives on a real edition and that the cover warning surfaces an over-long hook in the next newsletter run.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P089 (structural lint), P037 / P044 (cover-image friction class).

## Related

Captured during the 2026-06-22 Issue 10 retrospective. The cover-overflow half is sibling to the P037 / P044 cover-image friction class; the lint half is a P089-family false-positive.
