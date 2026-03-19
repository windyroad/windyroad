---
status: "proposed"
date: 2026-03-20
decision-makers: [Tom Howard, Claude]
consulted: []
informed: []
---

# Automated decision promotion via first-released timestamps

## Context and Problem Statement

Architecture decisions stay in `proposed` status forever because nothing triggers promotion to `accepted` after production validation. The architect system documents that decisions should move from proposed to accepted "after successful production implementation," but this transition is entirely manual and never happens in practice.

## Decision Drivers

- Decisions should reflect their actual production status
- Promotion should be deterministic and auditable (no LLM judgment)
- The mechanism should work for both ongoing releases and cold-start backfill
- Must integrate with the post-release hook pattern (ADR 004)

## Considered Options

1. **Stamp-and-promote via `first-released` timestamp**: track when a decision first ships, auto-promote after a configurable grace period
2. **Manual promotion**: rely on developers to remember to update decision status
3. **CI-based promotion**: a GitHub Action that checks decision ages on every push

## Decision Outcome

Chosen option: **Stamp-and-promote via `first-released` timestamp**, because it automates the lifecycle with a simple, deterministic two-pass approach.

The mechanism:
- **Pass 1 (stamp)**: When a proposed decision is included in a release, add `first-released: YYYY-MM-DD` to its frontmatter. For cold-start/backfill, check `git log origin/publish` for the oldest commit date.
- **Pass 2 (promote)**: For all proposed decisions with a `first-released` date older than `DECISION_PROMOTION_DAYS` (default 14), update status to `accepted`, add `accepted-date`, and rename the file from `*.proposed.md` to `*.accepted.md`.

This runs as a post-release hook (`scripts/post-release.d/stamp-and-promote-decisions.sh`), integrating with ADR 004.

## Consequences

- **Good**: Decisions automatically reflect their production validation status
- **Good**: 14-day grace period allows reverting decisions that cause production issues
- **Good**: Cold-start mode backfills accurate dates from git history
- **Good**: Pure shell, no LLM dependency, fully deterministic
- **Neutral**: Requires `origin/publish` branch to exist for cold-start backfill
- **Bad**: Decisions modified outside of releases (e.g., direct push) may not get stamped until the next release cycle

## Confirmation

- A proposed decision included in a release gets `first-released` added to its frontmatter
- A proposed decision with `first-released` older than 14 days is renamed to `*.accepted.md` with `status: "accepted"`
- A proposed decision with `first-released` less than 14 days old remains proposed
- Running with empty stdin (cold-start) uses git history dates, not the current date
- Already-stamped decisions are not re-stamped

## Pros and Cons of the Options

### Stamp-and-promote via first-released timestamp

- Good: Fully automated, no human action needed
- Good: Deterministic, same inputs always produce same outputs
- Good: Grace period prevents premature acceptance
- Good: Cold-start backfill handles existing decisions
- Neutral: Adds two frontmatter fields to decision files
- Bad: Only triggers on releases (decisions could sit proposed between releases)

### Manual promotion

- Good: Human judgment on when a decision is validated
- Bad: Never actually happens in practice (current state)
- Bad: No audit trail of when a decision was first released

### CI-based promotion

- Good: Runs on every push, not just releases
- Bad: Requires CI configuration and permissions
- Bad: Promotion is decoupled from the release event that validates it
- Bad: Harder to test locally

## Reassessment Criteria

- If the 14-day default proves too short or too long for the project's release cadence
- If decisions need more granular promotion criteria (e.g., per-decision thresholds)
- If the project moves to a monorepo where decisions span multiple packages
