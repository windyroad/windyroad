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
