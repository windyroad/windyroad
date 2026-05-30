---
status: proposed
human-oversight: confirmed
oversight-date: 2026-05-30
job-id: awareness
persona: engineering-leader
date-created: 2026-04-20
priority: must-have
type: functional-emotional
screens:
  - /
  - homepage hero
  - problems section
  - countdown component
  - final CTA
---

# JTBD-001: Awareness

## Job Statement

When I hear about AI models finding decades-old vulnerabilities overnight, I want to understand how exposed my team actually is, so I can assess whether our patch cycle is a real risk before it becomes a breach.

## Desired Outcomes

- Clear understanding of current dependency staleness across the codebase
- Knowledge of how long it takes the team to get a critical patch to production
- Awareness of forgotten or outdated libraries in the dependency tree
- Emotional shift from "we're probably fine" to "we need to act"

## Persona Constraints

- Responsible for delivery pipeline, security posture, and team capability
- Dependency trees they don't fully understand, with libraries nobody chose
- Patch cycles measured in days or weeks, not hours
- Credential-sensitive, want demonstrated proof over theory

## Current Solutions

Security team triage, quarterly vulnerability scans, hoping for the best.
