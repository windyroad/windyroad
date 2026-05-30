# Problem 013: External-facing text (GitHub comments, LinkedIn teasers, PR bodies, release notes) has no automated voice/tone gate before posting

**Status**: Verification Pending
**Reported**: 2026-04-18
**Origin**: internal
**Transitioned to Known Error**: 2026-04-25 (review pass: root cause confirmed; workaround = manual voice-tone invocation)
**Transitioned to Verification Pending**: 2026-04-25 (Investigation Tasks 1 + 3 shipped via SKILL.md step 15.5 voice gate; Tasks 2 + 4 deferred to P012 ship-gate hook)
**Priority**: 9 (Medium). Impact: Moderate (3) x Likelihood: Possible (3)
**Effort**: M (PreToolUse hook + voice-tone integration; pair with P012 ship-gate)
**WSJF**: (9 x 2.0) / 2 = 9.0
**Re-rated 2026-04-25**: Impact label corrected from Significant (3) to Moderate (3). 3 in the impact ladder is Moderate; Significant is 4. Likelihood label corrected from Likely (3) to Possible (3). Score 9 unchanged.

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

- [x] **Done (2026-04-25)**: Added a voice gate to `.claude/skills/wr-newsletter/SKILL.md` step 15.5 (Draft the LinkedIn post). The gate mirrors step 13's pattern: invokes `wr-voice-tone:agent` on the LinkedIn post text, FAIL means fix and re-run until PASS. The captured voice block is saved into the draft alongside the brief-body voice block under a `## Voice Review (LinkedIn post)` section (step 16 save-block layout updated for both phase=finalise and phase=full).
- [ ] **Deferred to P012**: PreToolUse hook intercepting `gh issue comment`, `gh pr create`, `gh release create`, `npm publish`. This is P012's ship-gate scope. The hook will extract the body payload from each command, pass to `wr-voice-tone:agent`, and block on FAIL. Picks up automatically when P012 ships.
- [x] **Done (2026-04-25, decision)**: The upstream `wr-voice-tone:agent` already accepts pasted text in the agent prompt. The `wr-newsletter` SKILL.md has used this pattern since 2026-04-17 (step 13 for the brief body, step 14 for the content-risk reviewer, and now step 15.5 for the LinkedIn post). The agent definition lives in an external marketplace plugin (`~/.claude/plugins/marketplaces/windyroad/packages/voice-tone/agents/agent.md`); modifying the upstream surface from this project is structurally awkward and unnecessary because the existing prompt-paste pattern already satisfies the "scan-this-text" use case. No new wrapper agent in this repo. Architect review confirmed this is defensible (no new ADR needed; ADR 011 reuse principle covers it).
- [ ] **Deferred to P012**: Validation against recent outbound comms (GitHub issues, PR bodies). Live exercise after P012's hook ships, since the hook is the surface that handles those CLI surfaces.

## Fix Released

**2026-04-25 (iter 8 of AFK loop)**: Investigation Tasks 1 and 3 shipped via SKILL.md edit.

**Verification path**:

- The teaser-voice-gate part exercises on the next `/wr-newsletter phase=finalise` or `phase=full` run. Verification = the saved draft contains a `## Voice Review (LinkedIn post)` section with a captured voice agent verdict.
- The hook part remains pending P012's ship-gate landing. Once P012 ships the PreToolUse infrastructure, the same voice agent is wired into `gh issue comment` / `gh pr create` / `gh release create` / `npm publish` per the strategy in this ticket's Fix Strategy section.

**Out-of-scope-for-this-ticket parts pending P012**: Investigation Tasks 2 and 4. These are bundled with the ship-gate hook surface area; addressing them piecemeal here would just duplicate work P012 will do.

## Related

- Problem 012 (ship-gate PreToolUse hook; this problem is a specific extension covering voice/tone specifically)
- ADR 015 (reader-respect clause; extends to all external comms, not just newsletter drafts)
- `docs/VOICE-AND-TONE.md` (guide the voice subagent enforces)
- `docs/BRIEFING.md` "Cross-project patterns" (external-facing text needs a voice check)
