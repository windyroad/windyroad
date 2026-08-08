# Project Briefing

Migrated from legacy `docs/BRIEFING.md` via `/wr-retrospective:migrate-briefing` on 2026-08-07.

## Critical Points (Session-Start Surface)

- **The risk scorer is a design reviewer, not a formality.** Its STOPs have repeatedly caught genuine design defects that architect passes missed. Read a STOP as a finding, not a gate to satisfy. When its remediations would each breach a decision, look for a third close rather than choosing between them. ([risk-scorer-behaviour.md](./risk-scorer-behaviour.md))
- **Verify a ticket's own premises before acting on them, not just its prose.** Tickets carry stale claims about repo state (a governance tier said not to exist, a path pinned at a version no longer on disk). Read the file from disk. The same applies to ADR/RFC references in subagent verdicts. ([what-you-need-to-know.md](./what-you-need-to-know.md))
- **Sourcing a repo script to probe one helper runs the whole script** unless its `*_LIB_ONLY` variable is exported first. This has pushed to origin from a session told not to push. Use a subshell, or the existing test harness. ([what-will-surprise-you.md](./what-will-surprise-you.md))
- **The external-comms gate cannot see a body passed with `--body-file`, and edits after a PASS invalidate the marker.** Pass the body inline as `--body "$(cat <<'EOF' ... EOF)"`, dispatch the reviewer synchronously, and do not touch a word of the draft between the PASS and the call. ([what-will-surprise-you.md](./what-will-surprise-you.md))
- **The architect can take five rounds, and the later rounds are the valuable ones.** Budget for them rather than treating the first ISSUES FOUND as the whole cost, and prefer reshaping the design over documenting a new contract when a new ADR would need a human who is not there. ([what-will-surprise-you.md](./what-will-surprise-you.md))

## Topic Index

| File | Source heading |
|---|---|
| [what-you-need-to-know.md](./what-you-need-to-know.md) | What You Need to Know |
| [what-will-surprise-you.md](./what-will-surprise-you.md) | What Will Surprise You |
| [risk-scorer-behaviour.md](./risk-scorer-behaviour.md) | Risk Scorer Behaviour |
| [architect-compendium-deadlock.md](./architect-compendium-deadlock.md) | Architect Decisions Compendium |
| [cross-project-patterns-from-86-session-insights-report-2026-.md](./cross-project-patterns-from-86-session-insights-report-2026-.md) | Cross-project patterns (from 86-session insights report, 2026-03-17 to 2026-04-16) |
| [gate-dependency-friction-2026-06-15-afk-work-problems-sessio.md](./gate-dependency-friction-2026-06-15-afk-work-problems-sessio.md) | Gate + dependency friction (2026-06-15 AFK work-problems session) |
| [newsletter-pipeline-gates-vs-structural-defects-2026-06-15-i.md](./newsletter-pipeline-gates-vs-structural-defects-2026-06-15-i.md) | Newsletter pipeline gates vs structural defects (2026-06-15 Issue 09 retro) |
| [pipeline-friction-2026-06-16-second-work-problems-loop.md](./pipeline-friction-2026-06-16-second-work-problems-loop.md) | Pipeline friction (2026-06-16 second work-problems loop) |
| [pipeline-friction-2026-06-17-p079-adr-026-amend-iter.md](./pipeline-friction-2026-06-17-p079-adr-026-amend-iter.md) | Pipeline friction (2026-06-17 P079 ADR-026 amend iter) |
| [newsletter-pipeline-tooling-friction-2026-06-22-issue-10-ret.md](./newsletter-pipeline-tooling-friction-2026-06-22-issue-10-ret.md) | Newsletter pipeline + tooling friction (2026-06-22 Issue 10 retro) |
| [newsletter-publish-deps-ci-friction-2026-07-06-issue-12-retr.md](./newsletter-publish-deps-ci-friction-2026-07-06-issue-12-retr.md) | Newsletter publish + deps/CI friction (2026-07-06 Issue 12 retro) |
| [site-repurpose-deploy-gate-friction-2026-07-12-the-shift-hub.md](./site-repurpose-deploy-gate-friction-2026-07-12-the-shift-hub.md) | Site repurpose + deploy-gate friction (2026-07-12 The Shift hub retro) |
| [newsletter-pipeline-why-external-review-is-still-needed-2026.md](./newsletter-pipeline-why-external-review-is-still-needed-2026.md) | Newsletter pipeline: why external review is still needed (2026-08-04 Issue 16 retro) |
| [governance-iteration-friction-2026-08-05-p120-afk-iter.md](./governance-iteration-friction-2026-08-05-p120-afk-iter.md) | Governance-iteration friction (2026-08-05 P120 AFK iter) |
| [governance-iteration-friction-2026-08-05-p121-afk-iter.md](./governance-iteration-friction-2026-08-05-p121-afk-iter.md) | Governance-iteration friction (2026-08-05 P121 AFK iter) |
| [governance-iteration-friction-2026-08-05-p122-afk-iter.md](./governance-iteration-friction-2026-08-05-p122-afk-iter.md) | Governance-iteration friction (2026-08-05 P122 AFK iter) |

## Preamble

# Briefing

What a fresh session needs to know about this project beyond what CLAUDE.md, ADRs, JTBD, and the voice guide already cover.

