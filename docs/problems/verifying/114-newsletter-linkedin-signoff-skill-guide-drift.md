# Problem 114: wr-newsletter step 15.5 tells the LinkedIn post to close with a windyroad.com.au sign-off, but VOICE-AND-TONE.md's auto-share carve-out forbids any manual URL in the post body

**Status**: Verification Pending
**Reported**: 2026-07-13
**Priority**: 4 (Low), Impact: 1 x Likelihood: 4, derived at capture from the description
**Origin**: internal
**Effort**: S, derived at capture
**WSJF**: 8.0 = (4 x 2.0) / 1

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
- **Severity**: recorded at capture as minor rework on the assumption the gate always catches it. **Corrected 2026-08-23**: the gate is non-deterministic on this finding. `src/newsletters/published/leader/2026-07-20/2026-07-20.linkedin.md` line 20 ships a bare `windyroad.com.au` in the post body, a week after this ticket was captured, so a bad post did ship. The severity is avoidable churn in the caught case and a guide violation reaching readers in the missed case.
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [x] Update /wr-newsletter step 15.5 (and step 16 LinkedIn-post save shape) to state that the LinkedIn share post carries NO manual URL / brand sign-off line, per the VOICE-AND-TONE.md auto-share carve-out, while the brief body keeps its windyroad.com.au closing line.
- [x] Confirm whether P079 already narrowed the LinkedIn shape and, if so, reconcile the residual "brand sign-off line" wording.

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

**Release vehicle**: none. The fix is repo-local tooling prose in `.claude/skills/wr-newsletter/SKILL.md`, which is not a build input and ships in no npm package, so no changeset exists and `wr-itil-derive-release-vehicle 114` exits 2 by construction. Cited manually per the transition contract's exit-2 route. <!-- no-changeset-reference -->

**Task 2 outcome.** P079 had narrowed the LinkedIn shape only partially. Step 15.5 already carried its no-manual-"Read the full issue" clause citing the same auto-share carve-out, but exempted the brand sign-off from it, which is the residual wording this ticket names. The carve-out itself grants no such exemption: it reads "Do NOT include a manual URL in the body of an auto-share post", and `windyroad.com.au` in the post body is a manual URL. Reconciled by extending the existing P079 clause to cover the brand line rather than adding a second competing rule.

## Fix Released

**Release marker**: commit landed 2026-08-23 on `master`. No npm release and no changeset: the fix is prose in `.claude/skills/wr-newsletter/SKILL.md`, repo-local tooling that is not a build input. <!-- no-changeset-reference -->

Step 15.5 and the step 16 save-shape template both told the drafter to close the LinkedIn share post with the `windyroad.com.au` brand sign-off. Both now state the post body carries no manual URL, name the brand line as covered, quote the VOICE-AND-TONE auto-share carve-out, and record the asymmetry the original prose missed: the brief body keeps its closing line because the brief is not an auto-share post; only the share post omits it.

Checked for the two-surfaces-disagree defect this repo has fixed three times this session, and the lint and the SKILL now agree. Two corrections to an earlier reading of that check, both from the risk review:

Check (g) does not enforce the closing line, it *permits* it. Its rule is that the CTA block carries at most one non-blank prose line, and it exempts the `windyroad.com.au` line and blanks from that count (P090). So it requires the line nowhere, and it reads the brief rather than the `.linkedin.md` companion. The inverted reading strengthens the conclusion rather than weakening it.

The companion-scoped checks are (f) model-name consistency, (l) length ceiling and (m) digest staleness, not two. (m) compares a heading naming the LinkedIn post against the post, so it is digest-scoped rather than content-scoped. None of the three requires or forbids a sign-off.

Awaiting user verification.

**How to verify**: grep the DRAFT companion, `src/newsletters/drafts/leader/2026-08-24/2026-08-24.linkedin.md`, for a bare `windyroad.com.au` line and find none. Step 16 writes that file before publication, so checking there prevents the violation. The published copy under `src/newsletters/published/` is only populated after Tom posts, so a check pointed at it detects rather than prevents and is not creditable as a control.

Do NOT rely on the voice gate passing on its first draft. The gate is non-deterministic on this finding and the corpus proves it: it FAILed Issue 13 on 2026-07-13 (recorded in that edition's reviews sibling), then let five editions ship the bare domain in the post body: 2026-06-08, 2026-06-22, 2026-06-29, 2026-07-06 and 2026-07-20. The last of those is a week after this ticket was captured. Every edition from 2026-07-27 onward is clean, which is drafter luck plus the P079 narrowing rather than enforcement.

The corpus measurement is five escapes across seventeen leader editions, taken with `grep -qE '^windyroad\.com\.au[[:space:]]*$'` over `src/newsletters/published/leader/*/*.linkedin.md`. Recorded with its method per P159, because a first pass at this count was wrong: `grep -c` prints `0` and exits 1, so a `|| echo 0` fallback fired alongside it and every edition appeared to match. So a first-draft PASS is consistent with both a working fix and a lucky draft, and only the grep discriminates.

All five escapes are cited here so a later auditor grepping the corpus finds them already accounted for rather than reading this ticket as incomplete.
