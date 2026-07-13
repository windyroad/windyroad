# Problem 114: wr-newsletter step 15.5 tells the LinkedIn post to close with a windyroad.com.au sign-off, but VOICE-AND-TONE.md's auto-share carve-out forbids any manual URL in the post body

**Status**: Open
**Reported**: 2026-07-13
**Priority**: 4 (Low), Impact: 1 x Likelihood: 4, derived at capture from the description
**Origin**: internal
**Effort**: S, derived at capture

## Description

The /wr-newsletter skill step 15.5 (and the step 16 save descriptions) instruct the drafter to close the LinkedIn share post with "the windyroad.com.au brand sign-off line". But docs/VOICE-AND-TONE.md's LinkedIn-posts section carries an explicit auto-share carve-out: a recurring newsletter edition that auto-publishes from a LinkedIn-newsletter article has the article URL auto-injected on publish, so the guide states "Do NOT include a manual URL in the body of an auto-share post."

The two contradict. During Issue 13 finalise, the LinkedIn-post voice gate (wr-voice-tone:agent, P013) returned FAIL on the first draft precisely because the skill-prescribed `windyroad.com.au` sign-off violated the guide's carve-out. The guide won (it is the gate authority) and the sign-off was removed, but the skill prose still directs the drafter to add it, so the same FAIL will recur every edition until the skill is corrected.

Note the asymmetry: the brief BODY (the article itself) correctly keeps its `windyroad.com.au` closing line; only the LinkedIn SHARE POST must omit any manual URL. The skill step 15.5 prose does not draw that distinction.

Evidence: Issue 13 finalise session 2026-07-13; wr-voice-tone:agent LinkedIn-post gate FAIL on finding 1 (auto-share carve-out, VOICE-AND-TONE.md LinkedIn-posts section), then PASS after the manual URL was removed.

## Symptoms

(deferred to investigation)

## Workaround

Ignore the step 15.5 "windyroad.com.au sign-off" instruction for the LinkedIn post; omit any manual URL from the post body (the article card auto-injects on publish). Keep the sign-off in the brief body only.

## Impact Assessment

- **Who is affected**: the newsletter drafter each week; one avoidable voice-gate FAIL + re-draft cycle per edition.
- **Frequency**: every edition that drafts a LinkedIn post (finalise/full phases, weekly).
- **Severity**: minor rework; the gate catches it, so no bad post ships, but it is avoidable churn.
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Update /wr-newsletter step 15.5 (and step 16 LinkedIn-post save shape) to state that the LinkedIn share post carries NO manual URL / brand sign-off line, per the VOICE-AND-TONE.md auto-share carve-out, while the brief body keeps its windyroad.com.au closing line.
- [ ] Confirm whether P079 already narrowed the LinkedIn shape and, if so, reconcile the residual "brand sign-off line" wording.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P113 (editor gate-loop friction, sibling wr-newsletter pipeline improvement)

## Related

Captured via /wr-itil:capture-problem during the Issue 13 finalise retro (2026-07-13). See also P013 (LinkedIn-post voice gate), P079 (LinkedIn share shape narrowing). Expand at next investigation.

## Fix Strategy

- **Kind**: improve
- **Shape**: skill
- **Target file**: `.claude/skills/wr-newsletter/SKILL.md` steps 15.5 and 16 (LinkedIn-post save shape).
- **Observed flaw**: step 15.5 directs a windyroad.com.au sign-off on the LinkedIn post, contradicting the VOICE-AND-TONE.md auto-share no-manual-URL carve-out.
- **Edit summary**: remove the "windyroad.com.au brand sign-off line" instruction from the LinkedIn-post shape (keep it in the brief body); state explicitly that the auto-share post carries no manual URL.
- **Evidence**: Issue 13 LinkedIn voice-gate FAIL then PASS after removal, 2026-07-13.
