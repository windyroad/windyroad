## Cross-project patterns (from 86-session insights report, 2026-03-17 to 2026-04-16)

- **Risk-scorer above appetite is a hard stop, not an advisory signal.** Across projects, Claude attempted releases despite the scorer flagging above appetite and was pushed back by the user in at least three sessions. On windyroad, enforce the same discipline on `git push`, `npm publish`, and any deploy command. See problem 012.
- **External-facing text (GitHub comments, LinkedIn teasers, PR bodies, release notes) needs a voice/tone check before posting.** AI tells have leaked into external comms and produced user frustration. The newsletter body now runs voice via `wr-voice-tone:agent`; teaser copy, CTAs, and outbound GitHub text should too. See problem 013.
- **Output token limits bite on long sessions.** Checkpoint with commits frequently (after each logical batch, not at the end), and prefer short status lines over verbose narration between edits. Losing a session's final publish step to a token cutoff is a recurring pattern.
- **TDD RED-state verification matters.** Confirm the test fails for the right reason (matches the bug signature, not unrelated setup) before writing the fix. Grep-based BATS assertions in particular are brittle after renames and produce false positives.
- **Read all inputs before analysing, do not sample.** BRIEFING.md, risk reports, user screenshots, referenced ADRs: read them in full on first contact. Shallow sampling has misdiagnosed a live production outage on another project and can bite the same way on windyroad when multiple docs govern a change.

