# Problem 100: Newsletter cover hook silently clips, and the structural lint false-positives on a sentence-final model name

**Status**: Open
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
- [ ] Cover skill: warn (or fail) when a hook line exceeds the safe-area width, and flag a hook line that ends in a dangling fragment (no terminal predicate).
- [ ] check-newsletter-structure.sh: strip trailing punctuation from model-name tokens before the brief-vs-linkedin comparison so a sentence-final "Gemma 4." matches "Gemma 4".
- [ ] Consider whether these two concerns warrant splitting into separate tickets (cover skill vs lint script are distinct fix paths).

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P089 (structural lint), P037 / P044 (cover-image friction class).

## Related

Captured during the 2026-06-22 Issue 10 retrospective. The cover-overflow half is sibling to the P037 / P044 cover-image friction class; the lint half is a P089-family false-positive.
