# Problem 090: wr-newsletter CTA persistently includes the Windy Road services pitch despite repeated correction

**Status**: Verification Pending
**Reported**: 2026-06-15
**Priority**: 6 (Medium). Impact: Moderate (3) x Likelihood: Unlikely (2) (re-rated 2026-06-15)
**Origin**: internal
**Effort**: S
**WSJF**: 6 = (6 x 1) / 1
**Type**: technical

## Description

The newsletter drafter appends a Windy Road services-description sentence to the closing CTA every edition (Issue 09: "We help engineering leaders keep their pipelines patch fit as the pace of change picks up: assessments, working guardrails, and hands-on remediation."). Tom has corrected this before and corrected it again this session with strong affect: "remove the pitch at the end!!! I've said that before." The desired CTA is the reader invitation plus the linked `windyroad.com.au` only, matching the prior published Issue 08 convention. The services pitch should not appear.

## Symptoms

- Issue 09 draft (and prior editions) closed with the services-description sentence before the invitation.
- Tom removed it manually; flagged it as recurring ("I've said that before").
- The persona-config CTA section (`.claude/skills/wr-newsletter/personas/leader.md` ## CTA) lists "Description variants" that the drafter pulls one of, which is the likely source of the recurring pitch.

## Impact Assessment

- **Who is affected**: the Engineering Leader reader (the pitch reads as promotional, against the reader-respect voice direction); Tom pays a recurring manual-removal cost.
- **Frequency**: every edition (recurring class).
- **Severity**: Medium. Promotional framing in the CTA conflicts with the established voice direction (outbound copy must not be promotional); the recurrence indicates a config/SKILL defect rather than a one-off.

## Root Cause Analysis

### Hypothesis

The leader persona-config CTA section enumerates "Description variants" (services pitches) alongside "Invitation variants", and SKILL.md step 11b instructs the drafter to "pick one cta-description and one cta-invitation". The fix is to stop emitting the description sentence: either remove the Description variants from the persona config, or amend SKILL.md step 11b so the CTA is invitation + linked windyroad.com.au only.

## Fix Strategy

- **Kind**: improve
- **Shape**: guide / settings (persona-config edit) + skill
- **Target file**: `.claude/skills/wr-newsletter/personas/leader.md` (## CTA) and `.claude/skills/wr-newsletter/SKILL.md` step 11b.
- **Edit summary**: drop the services-"Description variants" from the CTA composition; the CTA is the rotating invitation + closing linked `windyroad.com.au` only. Apply the same fix to the developer persona config if it carries an equivalent pitch.
- **Evidence**: Issue 09 (commit b837c89) CTA carried the pitch; Tom's correction "remove the pitch at the end!!! I've said that before" (recurring).

## Related

- Retro 2026-06-15. Split from the P089 drafter-discipline cluster as a distinct recurring concern with a distinct fix home (persona-config CTA). Composes with the reader-respect voice direction (outbound copy must not frame promotionally).
- Architect review (2026-06-15): the fix is consistency-restoring against ADR-023 (pause the commercial funnel via a "Fully Booked" CTA pattern). A services-pitch CTA funnels readers toward consulting capacity ADR-023 says cannot be honoured. No new ADR required; check (g) is a within-scope extension of the undocumented-but-precedented P089 structural lint.
- JTBD review (2026-06-15): removing the pitch restores conformance. The developer persona (Tokens Spent) is non-commercial by design; commercial conversion (JTBD-002) lives on-site, not in the digest.

## Fix Released

Fixed in the repo-local `.claude/skills/wr-newsletter/` skill (no package release; repo-local skill/config change, no changeset). Changes:

- Removed the services-pitch "Description variants" from both persona configs (`personas/leader.md`, `personas/developer.md`). CTA composition is now one rotating invitation + the linked `windyroad.com.au` closing line only.
- Amended `SKILL.md` step 11b (and the `<cta-invitation>` placeholder definition + the URL-verify carve-out) so the drafter composes the CTA as invitation + closing line, with no `<cta-description>` services sentence.
- Removed the pitch sentence + Description variants from `assets/draft-template.md` (the template the drafter reads).
- Added a 7th deterministic structural-lint check (g) to `scripts/check-newsletter-structure.sh` + vitest test: the CTA block (after the final `---`) carries at most one non-blank, non-link prose line (the invitation); a services-description sentence is a disallowed second prose line. The check passes the hand-fixed published Issue 09 brief.

This is a behaviour change verified on the next `/wr-newsletter` run (the next drafted brief must close with invitation + linked `windyroad.com.au` only, and the lint must pass at save). Awaiting that verification before closing.
