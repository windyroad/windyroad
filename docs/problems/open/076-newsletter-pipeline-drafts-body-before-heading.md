# Problem 076: Newsletter pipeline drafts body before heading, forcing rework on every H1 revision

**Status**: Open
**Reported**: 2026-06-01
**Priority**: 2 (High). Impact: 4 x Likelihood: 4 (manual rating at capture: HIGH per Tom direction. Confirm at next /wr-itil:review-problems.)
**Origin**: internal
**Effort**: M (deferred. Re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

The /wr-newsletter SKILL.md step 11 (Draft the brief) composes the full edition body (opener, bridge, 7 Item blocks, also-worth-noting, CTA) and derives the H1 in the same monolithic drafter pass. The H1 is effectively a by-product of the body work rather than the load-bearing theme that authored it.

When the H1 needs rework after gate review or user feedback, the downstream items often need rework too because the body was authored to thread the original H1's frame. Opener tone, bridge phrasing, item ordering, and item "Why-it-matters" lines all carry the original theme.

The 2026-06-01 prep run for The Shift Issue 07 exhibited this directly:

- Initial H1 produced colon-flourish + jargon-stack failures. Tom rejected with "all the headings are horrible".
- First rewrite of headings (matching plain-declarative style). Tom approved headings with "much better".
- Body review revealed body-level jargon stacks ("services-arm", "tier-1 + eval-governance + eval-harness", "sandboxing patterns", "substrate-concentration trajectory") had been authored under the original substrate-collision theme. 8 body edits applied.
- H1 swap to opinionated verdict pair ("The AI pilot phase is over. The discipline phase has started.").
- Opener rewrite from scratch because the original opener argued for the substrate-collision frame, not the pilot-to-discipline arc the new H1 names.
- Bridge paragraph dropped because the new opener subsumed it.
- Cover image re-rendered three times (initial, post-headings rewrite, post-H1-swap).

Aggregate cost was approximately 30 minutes of iteration, plus N gate re-runs (voice agent rounds 1-3, sw-critic rounds 1-3, architect + JTBD twice per file). The body work done before the H1 was settled was largely wasted because the new H1 reframed the theme.

The pipeline should instead compose the H1 first, get explicit Tom approval, then draft the body with the approved H1 as the load-bearing frame.

This is HIGH priority because the cost compounds: every edition Tom rejects the H1 on triggers a full-body rework cycle. The current pipeline has no mechanism to compose-headline-first; step 11 monolithically authors everything in one drafter pass.

Suggested fix:

- Split /wr-newsletter step 11 into two sub-steps: 11a (compose H1 + cover hook lines + one-paragraph theme statement) and 11b (draft body using approved H1 as theme anchor).
- 11a output: H1 (with "Issue NN:" prefix), cover hook line 1 + line 2, one-paragraph theme statement that the From-Tom opener will elaborate.
- 11a Tom-approval gate via AskUserQuestion with options: Accept (proceed to 11b), Refine (Tom edits the H1 / hook lines / theme statement via Other), Reject (back to per-item capture or 9.5 ranking with a note).
- 11b drafts opener + bridge (if needed) + items + also-worth-noting WITH the approved H1 as the anchor frame. Opener leads with the theme statement (expanded). Item ordering may be adjusted to thread the theme. Item Why-it-matters lines reference the theme where natural.
- Cover image renders ONCE in 11a (not deferred to step 12) since the hook lines are settled at that point.
- Step 12 becomes a re-render-only step if 11a's hook lines change in 11b, which should be rare.
- Reduces rework cost on H1 rejection from full-edition rework to opener+bridge rework only.

Composes with P064 (newsletter critic complexity) and P070 (draft-template gap) as the newsletter-pipeline editorial-discipline cluster. The fix for P076 unblocks cleaner H1-discipline enforcement because the H1 settles before the body is gate-reviewed against it.

## Symptoms

(deferred to investigation)

## Workaround

(deferred to investigation. Current workaround is to manually re-author the opener + bridge after H1 changes, accepting the body rework cost.)

## Impact Assessment

- **Who is affected**: (deferred to investigation. Direct: the agent running /wr-newsletter; indirect: Tom reviewing the brief.)
- **Frequency**: (deferred to investigation. Estimated: every edition where the initial drafter H1 doesn't survive Tom's editorial pass, which has been most editions this cycle per the rolling retro evidence.)
- **Severity**: (deferred to investigation. Estimated: M to L per edition, compounding across editions.)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems (manual HIGH rating at capture; confirm)
- [ ] Investigate: is the colon-flourish pattern in the drafter prompt at step 11, or is it an emergent default in the absence of explicit guidance?
- [x] Draft an ADR amendment to ADR 011 (or a new ADR) codifying the H1-first composition order (landed as ADR-037 `compose-newsletter-theme-anchor-before-body.proposed.md`, 2026-06-02, AFK iter 3; born `human-oversight: confirmed` per ticket's substantive Tom-direction capture)
- [ ] Implement the step 11a / 11b split in /wr-newsletter SKILL.md per ADR-037 pinned shape (UNBLOCKED 2026-06-03 via /wr-architect:review-decisions follow-up):
  - 11a: compose H1 (with `Issue NN:` prefix), cover hook line 1 + 2, one-paragraph theme statement. Output text only; no cover render at 11a per Tom-pinned sub-decision 1 / Option C.
  - 11a Tom-approval gate via AskUserQuestion (Accept / Refine / Reject).
  - 11b: drafts opener, bridge if needed, items, ATWN, CTA using approved H1 as anchor frame.
  - Step 12 cover render stays unchanged at current placement (status quo per Option C; no cover-skill 12 amendment needed).
- [ ] Implement `11a-prime` finalise variant per Tom-pinned sub-decision 2 / Option B: always re-runs as "confirm theme anchor is still right" gate with default Accept (1 prep gate plus 1 finalise re-confirm gate per edition).
- [ ] Test on the next edition by composing the H1 first and watching for body-rework reduction (confirmation criterion d in ADR-037: H1-rejection-rework rate drops below 1-in-3 editions across the next three).

### Progress log

- **2026-06-02 (AFK iter 3)**: ADR-037 landed. ADR substance is Tom-pinned (H1-first composition + approval gate). Two sub-decisions deferred (cover-render placement, finalise-variant) per architect verdict; SKILL.md split blocked on Tom direction via `/wr-architect:review-decisions` drain. Architect verdict: PASS on revised draft (issues 1-6 from prior round all resolved). JTBD verdict: PASS (serves JTBD-001 + JTBD-002 for engineering-leader persona; Tom-as-editor jobs are implicit not documented; no JTBD regression risk).

## Dependencies

- **Blocks**: (none direct, but unblocks a cleaner H1-discipline enforcement path that P075 + P064 would benefit from)
- **Blocked by**: (none)
- **Composes with**: P064 (newsletter critic complexity, blocks the same H1-discipline path from a different angle), P070 (draft-template gap), P075 (headline clarity gates miss the failure)

## Related

- **P064** (`docs/problems/open/064-newsletter-critic-round-3-budget-exhausted-on-fixable-micro-issues.md`). The newsletter critic doesn't catch H1-level jargon stacks, so the H1 rework discipline currently lives entirely with Tom's editorial pass. If the H1 settled before the body work, the critic could focus on body issues only.
- **P070** (`docs/problems/open/070-newsletter-draft-template-does-not-codify-three-deep-items-plus-notes-discipline.md`). Adjacent template gap; this ticket extends the template question with "what gets composed when".
- **P075** (`docs/problems/open/075-newsletter-drafter-headings-fail-clarity-test.md`). Sibling: the rubric blind spots around H1 clarity; this ticket addresses the workflow that surfaces the cost.

(captured manually following the /wr-itil:capture-problem template after Tom-direction; HIGH priority per Tom; bundled with P077 + P078 in one batch commit per ADR-014 related-cluster carve-out)
