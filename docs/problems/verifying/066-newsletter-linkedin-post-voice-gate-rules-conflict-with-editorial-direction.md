# Problem 066: Voice guide LinkedIn-posts section needs amendment; rules conflict with editorial direction on three axes

**Status**: Verification Pending
**Reported**: 2026-05-15
**Transitioned to Verification Pending**: 2026-05-30 (AFK iter 3; three carve-out paragraphs amended into `docs/VOICE-AND-TONE.md` LinkedIn-posts section; JTBD PASS, voice-tone PASS round 2 after `actually` word-list fix)
**Priority**: 4 (Medium). Impact: 3 x Likelihood: 5 (deferred, re-rate at next /wr-itil:review-problems)
**Effort**: S (deferred, re-rate at next /wr-itil:review-problems)
**Type**: technical

## Fix Summary

Three carve-out paragraphs added to `docs/VOICE-AND-TONE.md` § LinkedIn posts:

1. **"End with the link" auto-share carve-out**: rule applies when manual linking is needed; LinkedIn auto-share posts (recurring newsletter editions auto-published from a LinkedIn-newsletter article) have the article URL auto-injected on publish. Do NOT include a manual URL in the body.
2. **"No promotional framing" recurring-newsletter cadence-anchor carve-out**: banned pattern is one-off post excitement; recurring newsletter editions MAY anchor the first line with "Issue N of <Newsletter Name> is out" as legitimate cadence signal.
3. **"Don't ask for generic engagement" (split out as separate bullet) substantive-question carve-out**: generic bait remains banned; a one-line CTA tied to a specific item's editorial thread is legitimate. Test: the question only makes sense if the reader has engaged with one of the post's items.

The previously-combined "No promotional framing" rule was split into two bullets so the engagement-bait rule is independently citable.

Verification triggers on the next `/wr-newsletter` LinkedIn-post finalise run (Issue 06 onward); zero round-1 voice-gate violations on the three previously-failing axes (URL-on-its-own-line, promotional framing for issue-number anchor, generic-engagement flag on substantive content-tied CTA) constitutes verification.

## Description

The voice guide (`docs/VOICE-AND-TONE.md`) LinkedIn-posts section carries three rules that conflicted with Tom's explicit editorial direction on the 2026-05-15 LinkedIn share post for Issue 05. All three were addressed via author-override per ADR-025 pattern, with rationale recorded in `2026-05-15.reviews.md`. The rules need amendment to clarify carve-outs.

The three conflicts:

1. **"Don't ask for engagement"** vs Tom's substantive content-tied CTA. Tom's editorial direction: "On LinkedIn, the comment section is your reply-rate signal. A one-line CTA after the third paragraph would lift engagement materially. Pick one of the article's three threads and ask a question against it." Tom's CTA for Issue 05 LinkedIn post: "What does your team's AI-usage metric actually reward today?" The voice gate flagged this as banned-engagement-prompt; Tom's intent is that a substantive content-tied question is distinct from generic "drop a comment below" engagement bait.

2. **"End with the link, just the URL on its own line"** vs LinkedIn auto-share behaviour. Tom clarified: "LinkedIn auto-links the share-post on publish; the URL doesn't even exist until you post." The voice gate's "end with the link" rule applies when manual linking is needed (regular text posts); auto-share is the documented exception. The current rule does not carve this out.

3. **"No promotional framing"** vs the issue-number brand anchor. Tom's editorial direction: "name the issue ('Issue 05 of The Shift') so the post anchors to the newsletter brand." The voice gate flagged this as promotional framing (the same axis that bans "I'm thrilled to announce"). Tom's intent is that an edition-cadence brand anchor on the FIRST line is legitimate newsletter-publication signal, distinct from self-promotional excitement.

Three documented author overrides this session; pattern across multiple editions suggests the rules need refactoring, not per-edition overrides.

## Symptoms

- Voice gate (P013) FAILs every LinkedIn-post review with 3-5 violations.
- Tom applies author overrides per ADR-025 pattern, documented in `<edition>.reviews.md`.
- Each edition repeats the same conversation; voice guide does not carry the carve-outs.
- Round-1 voice gate FAIL costs ~30 seconds of iteration each edition; round-2 fixes the surface flags but the override conversation re-surfaces every time.

## Workaround

Document the author overrides in the reviews companion file per edition. Reference ADR-025 for the override mechanism. The voice gate flags continue to fire on every run.

## Impact Assessment

- **Who is affected**: Tom; every LinkedIn share-post finalise.
- **Frequency**: every edition's LinkedIn post (weekly).
- **Severity**: Medium. The override mechanism works (ADR-025 pattern); the friction is repeated conversation each edition. Risk-class: governance-rule miscalibration that erodes confidence in the gate's signal.
- **Analytics**: deferred to investigation.

## Root Cause Analysis

### Hypothesis

The LinkedIn-posts section in `docs/VOICE-AND-TONE.md` was authored against the general LinkedIn-text-post shape (manual posts where the author writes the post and pastes a link). The Windy Road weekly newsletter is a different shape:

- It is a SHARE post (auto-share of the LinkedIn-newsletter article), not a free-text post.
- It has a recurring cadence (weekly), which legitimises edition-cadence anchors.
- The CTA is a content-tied question on a specific item's thread, not generic engagement bait.

Three guide amendments:

a. **Auto-share carve-out** on "End with the link": the rule should say "applies when manual linking is needed; LinkedIn auto-share posts have the article URL auto-injected, do NOT include a manual URL in the body."
b. **Substantive question carve-out** on "Don't ask for engagement": the rule should distinguish generic engagement bait ("What do you think? Drop a comment below!") from substantive content-tied questions ("What does your team's AI-usage metric actually reward today?"). The latter is legitimate when tied to a specific item's editorial thread.
c. **Cadence anchor carve-out** on "No promotional framing": the rule should say "applies to one-off post excitement ('I'm thrilled to announce'); recurring newsletter editions MAY anchor with 'Issue N of <Newsletter Name> is out' as legitimate cadence signal."

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems.
- [ ] Read `docs/VOICE-AND-TONE.md` LinkedIn-posts section and identify the three rules' current text.
- [ ] Draft the three amendments. Run them through voice-tone agent review.
- [ ] Commit the amendments and remove the per-edition override conversation surface.
- [ ] Update `2026-05-15.reviews.md` cross-reference once the guide is amended.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: ADR-012 (voice + risk gate review). ADR-025 (PASS_WITH_AUTHOR_OVERRIDES verdict for sw-critic; same pattern applied to voice-gate overrides).

## Related

- docs/VOICE-AND-TONE.md (LinkedIn-posts section)
- /wr-newsletter SKILL.md Step 15.5 (LinkedIn post voice gate, P013)
- ADR-012 (review gates)
- ADR-025 (author overrides)
- 2026-05-15.reviews.md (3 documented LinkedIn-post overrides for Issue 05)
- Captured via /wr-retrospective:run-retro on 2026-05-15 session.
