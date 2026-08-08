# Project Briefing

Migrated from legacy `docs/BRIEFING.md` via `/wr-retrospective:migrate-briefing` on 2026-08-07.

## Critical Points (Session-Start Surface)

- **The risk scorer is a design reviewer, not a formality.** Its STOPs have repeatedly caught genuine design defects that architect passes missed. Read a STOP as a finding, not a gate to satisfy. When its remediations would each breach a decision, look for a third close rather than choosing between them. ([risk-scorer-behaviour.md](./risk-scorer-behaviour.md))
- **Verify a ticket's own premises before acting on them, not just its prose.** Tickets carry stale claims about repo state (a governance tier said not to exist, a path pinned at a version no longer on disk). Read the file from disk. The same applies to ADR/RFC references in subagent verdicts. ([what-you-need-to-know.md](./what-you-need-to-know.md))
- **Sourcing `push-watch.sh`, `fix-deps.sh` or `release-watch.sh` now refuses instead of running the flow (P129, fixed 2026-08-09).** The opt-in `*_LIB_ONLY` seams are unchanged and still the way to reach a helper, so keep using the subshell shape. The guards are inert on the real path only because `package.json` invokes all three as `bash scripts/<name>.sh`; a test pins that, so let it fail rather than "fix" it. ([what-will-surprise-you.md](./what-will-surprise-you.md))
- **The external-comms gate cannot see a body passed with `--body-file`, and edits after a PASS invalidate the marker.** Pass the body inline as `--body "$(cat <<'EOF' ... EOF)"`, dispatch the reviewer synchronously, and do not touch a word of the draft between the PASS and the call. ([what-will-surprise-you.md](./what-will-surprise-you.md))
- **The session-start `git status` snapshot strips the leading space from its FIRST line only, so line 1 looks staged when it is not.** Porcelain's unstaged form is ` M path`; the snapshot renders it as `M path`. On 2026-08-09 the risk scorer read that as a staged file and returned STOP on a precondition never breached. Never infer staging from the snapshot: run `git diff --cached --name-only` and hand THAT to any agent you ask, because a read-only subagent cannot see the index at all. ([what-will-surprise-you.md](./what-will-surprise-you.md))
- **The maintainer persona now exists but is not ratified.** `docs/jtbd/internal-maintainer/` holds the persona plus JTBD-400/401/402 (400-499 band), all `human-oversight: unconfirmed` because Tom directed they be written and has not read them. Anchor internal-tooling tickets to these jobs in prose under `## Related`, never in header lines, and say the anchoring is provisional. ([what-you-need-to-know.md](./what-you-need-to-know.md))
- **A bare `ADR-NNN` is ambiguous: this repo and upstream `agent-plugins` both number from 001, and 014, 024, 028, 032 and 036 all collide with an unrelated real decision.** The citation reads plausibly and points at a document that exists, so the error is quiet. Write `upstream ADR-NNN` for cross-repo references, and prefer grounding a claim in the artefact on disk over the number. ([governance-iteration-friction-2026-08-08-adr-048-iter.md](./governance-iteration-friction-2026-08-08-adr-048-iter.md))
- **The compendium entry hook writes the ADR-049-style entry for you when the ADR lands, so do not hand-author one.** It also adds reciprocal `Related` links. Two things it does not do and you must: scrub its em-dashes (the no-em-dash hook blocks until you do) and fix the two derived counts in `docs/decisions/README.md`. ([governance-iteration-friction-2026-08-09-risk-band-shape-job-iter.md](./governance-iteration-friction-2026-08-09-risk-band-shape-job-iter.md))
- **A genuine architect PASS can still leave the edit blocked, and the cause is not the verdict string.** The mark hook routes an unparseable verdict into the same branch as PASS, so a heading-form pass should still write the marker; only ISSUES FOUND withholds it. The block message read "no marker found", which rules out the drift and expiry branches. The fit is P400: a `SendMessage` resume does not fire the marker hook at all, so use a fresh `Agent` spawn, and ask for the exact literal `**Architecture Review: PASS**` while you are there. ([governance-iteration-friction-2026-08-09-risk-band-shape-job-iter.md](./governance-iteration-friction-2026-08-09-risk-band-shape-job-iter.md))
- **Ask the risk scorer to verify an artefact's own claims against disk, not just to score it.** One sentence in the prompt; it has caught wrong shim counts, self-contradicting figures, and two false premises it was handed. ([governance-iteration-friction-2026-08-09-risk-band-shape-job-iter.md](./governance-iteration-friction-2026-08-09-risk-band-shape-job-iter.md))

## Topic Index

| File | Source heading |
|---|---|
| [what-you-need-to-know.md](./what-you-need-to-know.md) | What You Need to Know |
| [what-you-need-to-know-archive.md](./what-you-need-to-know-archive.md) | What You Need to Know (archive) |
| [what-you-need-to-know-archive-early.md](./what-you-need-to-know-archive-early.md) | What You Need to Know (early archive) |
| [what-will-surprise-you.md](./what-will-surprise-you.md) | What Will Surprise You |
| [what-will-surprise-you-archive.md](./what-will-surprise-you-archive.md) | What Will Surprise You (archive) |
| [what-will-surprise-you-archive-early.md](./what-will-surprise-you-archive-early.md) | What Will Surprise You (early archive) |
| [governance-iteration-friction-2026-08-09-risk-band-shape-job-iter.md](./governance-iteration-friction-2026-08-09-risk-band-shape-job-iter.md) | Governance iteration friction (2026-08-09, risk band + edition-shape job iter) |
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
| [governance-iteration-friction-2026-08-08-adr-048-iter.md](./governance-iteration-friction-2026-08-08-adr-048-iter.md) | Governance-iteration friction (2026-08-08 ADR-048 + P133 AFK iter) |

## Preamble

# Briefing

What a fresh session needs to know about this project beyond what CLAUDE.md, ADRs, JTBD, and the voice guide already cover.

