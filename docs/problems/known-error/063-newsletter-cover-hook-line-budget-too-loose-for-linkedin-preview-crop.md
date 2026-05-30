# Problem 063: Newsletter cover `hook_line_1` budget too loose for LinkedIn preview crop

**Status**: Known Error
**Reported**: 2026-05-15
**Origin**: internal
**Priority**: 8 (Medium). Impact: Minor (2) x Likelihood: Likely (4)
**Effort**: S
**WSJF**: 16 = (8 x 2) / 1
**Type**: technical

## Description

The `/wr-newsletter-cover` SKILL.md documented `hook_line_1` (white, 80px) as "around 30 chars max". Witnessed 2026-05-15: a 30-character hook ("AI cyber capabilities shipped.") rendered correctly in the local PNG but the final period was clipped on the right edge when LinkedIn rendered the share-card preview. Tom screenshot-corrected mid-session, prompting a re-render with a 28-character variant ("AI cyber capability shipped.") that has comfortable right-margin breathing room.

The skill prose has been amended in this session (commit `eb0e8be`) to state "around 28 chars max" with the LinkedIn-crop rationale inline. Ticket is captured to record the discovery cycle and so the rule remains visible in the WSJF queue for re-rating if other LinkedIn-render edges surface.

## Symptoms

- Cover image renders cleanly when read directly (sips/PNG inspection).
- LinkedIn share-preview crops the final ~10-15px on the right edge, shaving terminal punctuation on 30-char hooks.
- Discovery requires the user posting to LinkedIn and visually comparing the preview to the local render.

## Workaround

Keep `hook_line_1` at or below 28 characters. The skill prose update landed in commit `eb0e8be`. Future runs of `/wr-newsletter-cover` respect the tighter budget.

## Impact Assessment

- **Who is affected**: Tom (newsletter author); every edition of The Shift or Tokens Spent.
- **Frequency**: every cover render that pushes hook_line_1 past 28 characters. The previous 30-char budget made this a recurring trip.
- **Severity**: Medium. Each occurrence is a re-render plus updated alt text plus re-publish. The previous edition (Issue 04 hook "Frontier models can run") was well under, so the issue did not surface until Issue 05.
- **Analytics**: deferred to investigation.

## Root Cause Analysis

### Hypothesis

The cover template's text box geometry was sized against the SVG canvas, not against LinkedIn's preview-crop safe area. LinkedIn shaves 1-2 character widths on each margin in share-card previews (~1200x627 final crop from ~1200x630 source). The 30-char budget was set by visual inspection of the local PNG, not by LinkedIn's preview render.

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Confirm whether `hook_line_2` (60px, around 45 chars max) also crops in LinkedIn preview. Witnessed 2026-05-15: a 28-char line 2 did not clip; the 45-char budget may also need tightening for longer lines.
- [ ] Consider an automated check in `/wr-newsletter-cover` Step 4 verify pass that simulates the LinkedIn crop and warns if hooks land within the unsafe margin.
- [ ] Alternatively, widen the template's text box safe area on the right edge so the 30-char budget can hold without LinkedIn-side cropping.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P044 (cover image render pipeline). This is a budget-calibration follow-on to the templated render that landed in P044.

## Related

- .claude/skills/wr-newsletter-cover/SKILL.md (budget rule)
- P044 (cover image needs templated skill with render pipeline)
- Commit eb0e8be (skill prose tightening landed 2026-05-15)
- Captured via /wr-retrospective:run-retro on 2026-05-15 session.
