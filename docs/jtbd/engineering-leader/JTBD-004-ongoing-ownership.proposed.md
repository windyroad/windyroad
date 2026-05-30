---
status: proposed
human-oversight: confirmed
oversight-date: 2026-05-30
job-id: ongoing-ownership
persona: engineering-leader
date-created: 2026-04-20
priority: important
type: functional
screens:
  - process section (Embed step)
  - fit check "Wrong Road" (already continuously deploying)
  - /ai-quality (planned)
---

# JTBD-004: Ongoing Ownership

## Job Statement

When continuous patching is established in our pipeline, I want my team to own the process end-to-end, so a critical CVE patch deploys like any other change without heroics or external help.

## Desired Outcomes

- Automated dependency updates flowing through CI without manual intervention
- Team confident merging dependency updates without fear of breakage
- Patch cycle time reduced from weeks to hours
- No dependency on external consultants for routine patching

## Persona Constraints

- Responsible for delivery pipeline, security posture, and team capability
- Patch cycles measured in days or weeks, not hours (current state they want to change)
- Teams actively using AI coding tools (Claude Code, Cursor, Copilot)

## Current Solutions

Ad-hoc Dependabot/Renovate setup, manual quarterly updates, reactive patching on alerts.
