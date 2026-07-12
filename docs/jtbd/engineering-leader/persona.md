---
name: engineering-leader
description: CTOs, Heads of Engineering, VPs at mid-to-large organisations with AI-coding-tool-equipped teams
human-oversight: confirmed
oversight-date: 2026-07-12
oversight-note: broadened from consulting-buyer to newsletter reader per ADR-041
---

# Engineering Leader (Primary)

## Who

CTOs, Heads of Engineering, VPs of Engineering at mid-to-large organisations.

## Context Constraints

- Teams actively using AI coding tools (Claude Code, Cursor, Copilot)
- Responsible for delivery pipeline, security posture, and team capability
- Dependency trees they don't fully understand, with libraries nobody chose
- Patch cycles measured in days or weeks, not hours
- Credential-sensitive, want demonstrated proof over theory
- Active on LinkedIn, engage with operational/governance content
- Want a trusted weekly signal on AI engineering they can act on, without doomscrolling to stay current (see JTBD-005)
- Stack coverage in scope: JavaScript/TypeScript, Python, Java, .NET, Go, and most modern stacks. The patch fitness methodology (dependency audit, CI gates, remediation pipeline) applies across ecosystems. Past track record includes banking/FS enterprise stacks (Greater Bank, Westpac, Pacific National) where Java and .NET are common.

## Pain Points

- Dependabot PRs piling up with nobody reviewing them
- Patching as a multi-week project requiring committees and manual testing
- AI-accelerated vulnerability discovery making their slow patch cycle a real risk
- No visibility into dependency staleness across the codebase
- AI engineering moving faster than they can personally track, hard to know which shifts their team should act on

## Notes

Per ADR-041, windyroad.com.au is repurposed from a consulting funnel into a hub for The Shift newsletter. This persona is broadened from a consulting buyer (JTBD-001 to JTBD-004, now retired) to a newsletter reader (JTBD-005). The patch-fitness pains above are retained as true of the persona, but the site no longer sells consulting against them. Pending human ratification via /wr-jtbd:confirm-jobs-and-personas.
