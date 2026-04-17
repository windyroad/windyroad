# Problem 013: External-facing text (GitHub comments, LinkedIn teasers, PR bodies, release notes) has no automated voice/tone gate before posting

**Status**: Open
**Reported**: 2026-04-18
**Priority**: 9 (Medium). Impact: Significant (3) x Likelihood: Likely (3)

## Description

The 86-session insights report cites a specific user-frustration incident on another project: Claude posted a GitHub issue comment that read as AI-generated (em-dashes, hedging, "happy to help"), triggering an "FFS" pushback from the user. The same class of failure nearly happened on windyroad this week: the LinkedIn teaser for The Shift's first edition went through three drafts before voice review caught a reader-respect violation ("the approved tool on your procurement list is probably the wrong one") that would have landed as an AI-typical jab on subscribers' feeds.

The newsletter body now passes through `wr-voice-tone:agent` automatically during the `/wr-newsletter` skill. External-facing text outside that one surface, including LinkedIn teasers, PR bodies, release notes, and GitHub issue or PR comments, does not have an equivalent automated gate. The user runs the check manually when they remember; when they don't, AI tells leak.

## Symptoms

- External text posted without a voice check leaks AI-tells (em-dashes, hedging, unexplained jargon, generic enthusiasm)
- Newsletter teasers drafted inline in the chat are not routed through `wr-voice-tone:agent` by default; a voice review is only run when the user explicitly asks
- Release notes and PR bodies auto-generated from commit messages inherit the commit's tone without an editorial pass
- GitHub issue comments are posted directly via `gh` CLI with no intermediate voice check

## Workaround

Manually invoke `wr-voice-tone:agent` on any external-facing text before posting. Tom has been doing this for newsletter teasers this week. It works when Tom or Claude remembers. It does not scale and will fail on a distracted session.

## Impact Assessment

- **Who is affected**: anyone reading outbound Windy Road content (LinkedIn subscribers, GitHub issue participants, PR reviewers, release-notes readers).
- **Frequency**: every external-facing text action. For windyroad specifically: weekly newsletter teaser, periodic release notes, occasional GitHub comments.
- **Severity**: Medium. Each individual leak is small; cumulatively the brand voice erodes and subscriber trust degrades. The "FFS" moment on the other project is a warning shot for what the same failure looks like on windyroad.

## Root Cause Analysis

### Root Cause

Voice enforcement is coupled to a specific skill (`/wr-newsletter`) rather than being a runtime gate on external-facing actions. Anything outside that skill bypasses the check. The hook system already enforces voice on user-facing HTML/JSX/template files (via UserPromptSubmit hook directives) but not on text passed to `gh` CLI, the LinkedIn newsletter publisher (manual), or `npm publish` release notes.

### Fix Strategy

Pair with problem 012's ship-gate PreToolUse hook. For Bash commands matching:
- `gh issue comment`
- `gh pr create`
- `gh pr comment`
- `gh release create`
- `npm publish` (for the release notes it generates)

Extract the text payload from the command, pass to `wr-voice-tone:agent`, and block if FAIL. Also consider a check against any file in `src/newsletters/drafts/` or similar copy-bearing directories immediately before commit.

For LinkedIn, there is no CLI equivalent; the gate has to live in the `/wr-newsletter` skill itself (already done for the body; extend to teaser drafting). Add a step to the skill that runs voice review on the teaser before presenting to the user.

Related but separate: the `wr-voice-tone:agent` should be enhanced with a "scan-this-text" mode that does not require a file path, so ad-hoc voice checks on chat text can happen cheaply during interactive sessions.

### Investigation Tasks

- [ ] Add a step to `/wr-newsletter` SKILL.md that runs voice on the teaser before presenting (should have happened in the 2026-04-17 session by default)
- [ ] Design a PreToolUse hook that intercepts `gh issue comment`, `gh pr create`, `gh release create`, extracts the body text, and runs voice review before allowing the command
- [ ] Decide whether to enhance `wr-voice-tone:agent` with a scan-text mode or add a dedicated thin wrapper
- [ ] Once hook is in place, test against recent outbound comms (GitHub issues, PR bodies) to confirm it catches AI-tells

## Related

- Problem 012 (ship-gate PreToolUse hook; this problem is a specific extension covering voice/tone specifically)
- ADR 015 (reader-respect clause; extends to all external comms, not just newsletter drafts)
- `docs/VOICE-AND-TONE.md` (guide the voice subagent enforces)
- `docs/BRIEFING.md` "Cross-project patterns" (external-facing text needs a voice check)
