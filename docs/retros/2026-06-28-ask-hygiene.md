# Ask Hygiene, 2026-06-28

> Per ADR-044 (Decision-Delegation Contract) Step 2d. Lazy count is the regression metric (target 0).

This foreground interactive session (close P001 via root-cause + fix; audit upstream-reporting state; file P048 upstream as windyroad/agent-plugins#296; check upstream issue states; this retro) made **zero `AskUserQuestion` tool calls**. Every decision was acted on directly or was framework-mediated: the external-comms risk + voice-tone evaluators were Agent-tool dispatches (not AskUserQuestion), and the upstream-filing decision was acted on after the user's explicit "Do it."

Caveat (not an AskUserQuestion-metric event, recorded for honesty): one **prose-ask** slipped through at the end of the upstream-audit turn ("Want me to run /wr-itil:report-upstream 048 to file it, or leave it for the next work-problems loop?"). The user corrected it with "Do it. Lazy question." That is the prose-ask anti-pattern (no-pitching / act-on-obvious), not an AskUserQuestion laziness event, so it does not move the lazy count below; it is reinforced in the `feedback_no_pitching_act_on_obvious_decisions.md` memory instead. The tension that produced it: filing a GitHub issue is an outward-facing publish action (confirm-first by default), but the user had just surfaced the gap, which made closing it the obvious next step. Resolution: when the user has just surfaced a gap and one bounded action closes it, act (or use the AskUserQuestion tool), never prose-ask.

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | | | |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**
