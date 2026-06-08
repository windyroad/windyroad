# Problem 079: /wr-newsletter step 15.5 LinkedIn post drafter generates auto-share-incompatible extras (Image section, Read-full-issue link line)

**Status**: Open
**Reported**: 2026-06-01
**Priority**: 3 (Medium). Impact: 2 x Likelihood: 5 (deferred. Re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: S (deferred. Re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

The /wr-newsletter SKILL.md step 15.5 LinkedIn-post drafter template instructs the agent to write three sections into `<publication-date>.linkedin.md`: `## LinkedIn Post`, `## Image` (image path + alt text), and `## Notes for posting`. The template also instructs the drafter to close the LinkedIn post body with "Read the full issue: [link inserted at publish time]".

For The Shift's actual LinkedIn auto-share flow these extras are not needed:

1. **Image section**: The Shift posts via the LinkedIn Newsletter feature where the article's cover image is automatically used by LinkedIn as the article hero. The companion LinkedIn share post does not need (and LinkedIn does not accept) a separate image attachment with alt text. The Image section in the drafter output is dead content.
2. **Read-full-issue link**: LinkedIn auto-injects the article URL as a card preview on auto-share posts. A manual "Read the full issue: [link]" line in the body is redundant at best and confusing at worst (reader sees the link card + the manual link).

The 2026-06-01 finalise run for The Shift Issue 07 produced both extras; Tom manually deleted them from `.linkedin.md` before publishing. Net friction: ~30 seconds of editing per edition, plus the cognitive load of remembering what to delete. Over a year of weekly publication this is ~26 minutes of pure manual cleanup. Not high in absolute terms, but the LinkedIn voice gate also flagged the Read-full-issue line as a finding in round 1, burning a gate-review round on a structural issue the drafter should not produce in the first place.

Suggested fix:

- Distinguish LinkedIn-auto-share posts from free-text promo posts in the persona config. The leader persona (The Shift) posts via LinkedIn Newsletter auto-share; future free-text promo posts (if any) would be a separate persona variant or post-type flag.
- Step 15.5 template branches on the post type:
  - **auto-share** (leader / The Shift): drafter writes only `## LinkedIn Post` with body + CTA; no Image section, no Read-full-issue line, no posting notes block (or a minimal one naming the publish window only).
  - **free-text promo** (hypothetical future): drafter writes the existing fuller template including Image + manual link + notes.
- The persona config gains a `linkedin-post-type` field (`auto-share` or `free-text-promo`); step 15.5 reads it and selects the template branch.
- Alternative if persona-config changes are heavyweight: hardcode the auto-share shape in step 15.5 since both current personas (leader, developer) plan to post via LinkedIn Newsletter; revisit if a free-text promo case ever arises.

Composes with P076 (newsletter pipeline drafts body before heading) and P070 (draft template gap) as the newsletter-pipeline editorial-discipline cluster.

### Recurrence: Issue 08 finalise (2026-06-09)

The Issue 08 (2026-06-08, "Discipline is your AI lever this quarter") finalise run confirmed the pattern persists. The same wr-newsletter step 15.5 + step 16 LinkedIn sibling save shape produced the same three classes of unwanted content. Tom flagged the pattern across three separate publish-day prompts:

1. **Link-to-edition reference in post body**: drafter shipped `Full edition link in the first comment.` after the brief-content paragraph. Tom direction: "I am sick of telling you that the linkedin post is auto linked to the edition. You don't need to talk about the link." Same class as the original `[Link to full edition on publish.]` placeholder cited in P079 line 12; the assistant has been re-introducing it under varying phrasings every edition.

2. **Image section**: drafter shipped `## Image` block with `Cover image: <path>` + `Alt text: <string>` per the canonical step 16 template. Tom direction: "the linkedin post automatically has the image of the edition. This is just noise." Same `## Image` block named verbatim in P079 line 16.

3. **Notes for posting section**: drafter shipped `## Notes for posting` block with publish-window + link-insertion + hashtag + character-count notes. Tom direction: "I know when and how to post." Same posting-notes block class P079 already covers.

Tom manually deleted all three from the Issue 08 `.linkedin.md` before publishing, as predicted by P079's "every edition" frequency line. The total flagged-corrections count on this single publish-day run reached three before Tom asked for a problem ticket; the original P079 was filed after Issue 07's first occurrence, which means the recurrence count across publish-day sessions is now confirmed at 07 + 08 minimum (and the pattern probably recurred silently on intervening editions where the LinkedIn drafter ran but Tom edited without flagging).

**Suggested rating elevation at next /wr-itil:review-problems**: bump deferred Impact from 2 to 3 or 4. The original Impact-2 rating was tuned to ~30 seconds of mechanical deletion per edition; the Issue 08 evidence suggests the actual cost is materially higher when the assistant also (a) re-introduces the placeholder text under new phrasings (requiring repeated user education each edition) and (b) burns LinkedIn-post voice-gate rounds on link-reference findings the drafter should not produce in the first place. Likelihood-5 already correctly encodes "confirmed every-edition recurrence."

The Issue 08 confirmation also tightens the fix scope: the LinkedIn sibling save shape should be reduced to the YAML frontmatter (`post-type` + `companion-to`) + the post body only. No `## LinkedIn Post` heading wrapper, no `## Image` section, no `## Notes for posting` section. Tom edited the Issue 08 file to this minimal shape after raising the recurrence; the post-fix file shape under `src/newsletters/drafts/leader/2026-06-08.linkedin.md` is the canonical target for the step 16 template.

A sibling skill-defect class flagged in the same Issue 08 finalise session, worth filing separately or absorbing here at next review: the wr-newsletter persona-config (`.claude/skills/wr-newsletter/personas/leader.md` lines 45-60) bakes three "Windy Road runs / helps / works with..." pitch variants into the brief's CTA structure, defaulting to a pitch every edition. ADR-023 paused site funnel CTAs but did not extend the pause to the newsletter persona CTA. Tom direction on Issue 08: drop the "What we do at Windy Road" pitch. Architect verdict 2026-06-09 confirmed ALIGNED with ADR-023 funnel-pause logic and flagged the persona-config gap as a follow-up. Decision queued for review-problems.

## Symptoms

(deferred to investigation)

## Workaround

(deferred to investigation. Current workaround: Tom manually deletes the Image section and Read-full-issue line from `.linkedin.md` before publishing each edition.)

## Impact Assessment

- **Who is affected**: (deferred to investigation. Direct: Tom publishing each edition; indirect: any future editor of The Shift.)
- **Frequency**: (deferred to investigation. Estimated: every edition. Weekly cadence per ADR-030.)
- **Severity**: (deferred to investigation. Estimated: very low per edition; compounding across publication cadence.)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Decide between persona-config `linkedin-post-type` field vs hardcoded auto-share shape
- [ ] Update /wr-newsletter SKILL.md step 15.5 template to branch (or simplify) accordingly
- [ ] Update step 16 finalise variant + step 16 phase=full variant for the matching `.linkedin.md` write shape
- [ ] Test on next edition: zero manual deletions needed for the LinkedIn post

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P076 (newsletter pipeline drafts body before heading), P070 (draft-template gap). All three are newsletter-pipeline editorial-discipline cluster.

## Related

- **P013** (`docs/problems/verifying/013-...verifying.md`). LinkedIn-post voice gate. Adjacent: that gate flagged the Read-full-issue line as a finding in round 1, which composes with the structural issue this ticket addresses.
- **P076** (`docs/problems/open/076-...`). Pipeline editorial-discipline sibling.
- **ADR-026** (`docs/decisions/026-...`). Sibling-file convention; the `.linkedin.md` shape is governed there.

(captured manually following the /wr-itil:capture-problem template after Tom-direction; bundled with P080 + P081 in one batch commit per ADR-014 related-cluster carve-out)
