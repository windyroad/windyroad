---
status: "proposed"
date: 2026-04-24
decision-makers: [Tom Howard, Claude]
consulted: [wr-architect:agent, wr-jtbd:agent]
informed: []
reassessment-date: 2026-07-24
---

# Split the AI Engineering Brief skill into prep and finalise phases

## Context and Problem Statement

ADR 011 chose a Claude Code interactive slash command as the orchestration mechanism for the AI Engineering Brief, with the working assumption that the skill runs as a single atomic pipeline (fetch, filter, draft, review, save) inside one session. After two editions of operating on that assumption, the Friday-morning publication session regularly takes 2 to 4 hours of active work (the 2026-04-24 session is the latest evidence). The cause is structural, not editorial: every phase of the pipeline runs in one sitting on the day of publication, including the time-expensive ones (multi-round critic loops, image design iteration, source corroboration via Playwright when the direct fetch is blocked).

Tom is starting a new role and cannot sustain multi-hour Friday mornings each week. The pipeline either needs to ship 90 percent of its work before Friday or risk slipping editions, breaking the weekly cadence the brief earns trust on (see P018, JTBD-001 Awareness, JTBD-002 Engagement, JTBD-003 Evaluation for the Engineering Leader persona, and JTBD-200 through JTBD-205 for the Developer persona).

This ADR narrows ADR 011's linear-pipeline working assumption without overturning its outcome. The orchestration mechanism from ADR 011 (Claude Code interactive slash command, $0 at the margin, reuses voice and risk specialists) is unchanged. The decision here is about phase boundaries within that mechanism, not about replacing it.

## Decision Drivers

- **Friday-morning time budget.** Publication-day work must compress to under one hour. The remainder of the work (research, drafting, review gates, image design) must run mid-week.
- **Late-breaking news must still land in the published edition.** A tier-1 model launch on Thursday evening or Friday morning cannot wait until next week. The finalise phase must accept additions without re-running the full pipeline.
- **State handoff must be lightweight.** A `.prep.md` file plus frontmatter is the minimum viable handoff; introducing a separate state-management system would itself become friction.
- **Idempotency.** Running prep twice in a week (e.g. Tuesday and Thursday) should not lose work or duplicate effort. Running finalise without a prior prep should still produce a valid edition (single-shot fallback).
- **No new billable spend.** The constraint from ADR 011 still binds. Phase split must run on the same Claude Code interactive quota.

## Considered Options

1. **Status quo: single atomic run on Friday.** Keep the current SKILL.md flow. No phase split. No state handoff.
2. **Phase split: `phase=prep` (Mon-Thu) plus `phase=finalise` (Fri) with `.prep.md` state handoff** (chosen). Two skill invocations across the week. Prep covers steps 0-15 plus a first gate pass; finalise refreshes tier-1, picks up inbox additions, re-runs gates on the (mostly final) draft, generates the image, drafts the LinkedIn post, and publishes.
3. **Continuous rolling-prep.** No explicit phase boundary; the skill runs incrementally as news drops, maintaining a live working draft. State is the working draft itself. Friday is just the last invocation.
4. **Hybrid: rolling prep for sources and map, single Friday finalise for everything else.** Sources fetched as they break (cron or manual); draft, critic, image all happen Friday morning.

## Decision Outcome

Chosen option: **"Phase split: `phase=prep` plus `phase=finalise` with `.prep.md` state handoff"**, because it concentrates the time-expensive work (critic loops, image design, source corroboration) into a relaxed mid-week session while preserving Friday as the moment late-breaking news lands. It does so with the smallest possible state-management surface (one frontmatter-tagged file). The orchestration mechanism from ADR 011 is unchanged. Option 1 (status quo) violates the Friday time budget. Option 3 (continuous rolling) loses the natural "publish-readiness checkpoint" that the prep handoff provides. Option 4 (hybrid) leaves the most expensive phases (critic, image) on Friday, which does not address the time-budget driver.

### Reading of ADR 016's three-round critic cap under phase split

ADR 016 caps the SW-critic iteration loop at three rounds per artifact pass. The phase split runs the critic twice across the week: once in prep against the prep-output draft, and once in finalise against the finalise-output draft. The reading this ADR adopts is **per-artifact-pass**, not per-edition: each phase produces a distinct artifact (`.prep.md` and the published `.md`), and each artifact gets its own three-round budget. The justification: the prep-output and finalise-output are not iterations of the same artifact (they have different inputs because finalise carries late-breaking news the prep critic never saw), so treating them as separate passes is consistent with ADR 016's intent (avoid runaway loops on a single artifact). If a future reading determines ADR 016's cap should be edition-scoped rather than artifact-scoped, this ADR's per-phase budget falls back to a 1.5-round average per phase (one full pass plus an opportunistic second-round fix) and the constraint is preserved without restructuring the phase split.

### Constraints this decision must satisfy

- The `phase` argument is parsed at SKILL.md step 0 alongside the existing `persona` argument. Default behaviour when no phase is specified: backward-compatible single-shot run (preserves the option-1 fallback).
- Prep-phase output is named `<draft-folder>/YYYY-MM-DD.prep.md` so the finalise phase can locate it without naming-convention guessing. Frontmatter carries `phase: prep`, `prep-date`, `prep-source-cutoff`, `source-failures`, `map-mutation-status`.
- Finalise re-fetches tier-1 sources only (Anthropic, OpenAI via Playwright workaround, DeepMind). Tier-2 and tier-3 are carried forward from the prep run. New tier-1 stories that land between prep and finalise are surfaced via per-item interactive capture (Agree / Adjust / Drop) before the final critic pass.
- Inbox (`src/newsletters/inbox/`) is re-read at finalise; new items since prep are surfaced in the same per-item capture.
- Critic gates run twice (once per phase) under the per-artifact-pass reading above. The prep-phase critic catches the bulk of issues against a near-final draft; the finalise-phase critic only re-runs against material changes from late-breaking additions.
- Image design lands at the end of prep (once the hook stabilises). Finalise re-renders only if the hook actually changes; otherwise the prep image carries through unchanged. Brand assets must be discovered via grep before any image generation (BRIEFING.md "What You Need to Know" rule).
- Single-shot run (`phase=full` or no phase argument) remains valid for first-time use, one-off editions, and the case where Tom cannot do mid-week prep that week.

## Consequences

### Good

- Friday-morning workload drops to under one hour for editions where prep ran successfully. Tom's new-role time pressure is accommodated without dropping the weekly cadence.
- Multi-round critic loops happen in a relaxed mid-week session, which means the loops can run their natural three rounds without pressure to cut corners on round 3.
- Image design iteration (which took three passes this edition) happens before the publication moment; rushed Friday-morning compromises on the cover image stop.
- Tier-1 source corroboration (Playwright workaround, slug verification, multi-outlet check per P016) is no longer time-pressured; the corroboration step can be added to the prep phase as a default rather than a Friday workaround.
- The `.prep.md` artifact is a natural audit trail: it captures what the brief looked like mid-week, which helps the retrospective compare against the published edition and notice what late-breaking news shifted.

### Neutral

- Two skill invocations per week instead of one. Tom needs to remember to invoke prep mid-week, or the prep checkpoint becomes a CI cron in a future iteration.
- The `.prep.md` file proliferates: one per edition. Cleanup is the same as the existing `<draft-folder>` cleanup pattern (move to published, delete on retro). Not a new burden.
- Finalise needs a "did something material change?" check to decide whether to re-render the image; that check is a new piece of state-comparison logic.
- The skill grows: SKILL.md gets longer to accommodate phase tagging on every step. Possible cure: extract phase logic into a SKILL.md table that says which step belongs to which phase, rather than threading the phase argument through every step's prose.
- The default may be flipped after the 4-edition reassessment if prep+finalise proves dominant. Documented here so future readers know the backward-compatible default is a transitional choice, not a permanent one.

### Bad

- Mid-week prep work on a story that becomes irrelevant by Friday is wasted (e.g. a prep-phase item that is overshadowed by a Thursday-evening tier-1 launch and gets demoted out of the shortlist). Estimated waste: small, because the per-item capture in finalise allows demotion or deletion without re-doing the rest of the work.
- A late-breaking story that is map-moving (e.g. the GPT-5.5 cluster on April 22-23) requires the finalise phase to re-run map mutation, which then requires the Wardley critic to re-run. This is a "finalise can be slower than expected" tail risk. Mitigation: the prep-phase map mutation is always tentative; finalise treats map state as mutable.
- Backward compatibility risk: existing one-off invocations (developers, tutorials, ad hoc editions) must keep working without the phase argument. If the default behaviour drifts, that risk increases.
- New ADR-level architectural surface: the prep/finalise distinction needs to survive any future rewrite of the skill, including a possible Option-2 extraction (standalone Node script) that ADR 011 named as the future evolution path.

## Confirmation

- `/wr-newsletter phase=prep` and `/wr-newsletter phase=finalise` both exist as parseable arguments at SKILL.md step 0; default behaviour without the argument is the existing single-shot run.
- A `.prep.md` draft created on a Tuesday or Wednesday resumes cleanly on the following Friday: finalise reads the frontmatter, re-fetches only tier-1, picks up new inbox items, re-runs gates only on changed material, and produces the final published artifact.
- Friday-morning session duration drops below one hour for at least three of the next four editions where prep ran. Measurement: session transcript length plus active-work-time logging.
- Inbox additions that land between prep and finalise are surfaced via per-item interactive capture during finalise; none are silently dropped.
- The image is generated during prep when the hook stabilises; finalise only re-renders if the hook changes. Brand assets are grep-discovered before generation in both phases (BRIEFING.md rule, ADR-013 Rule 1 structured-interaction pattern).
- A late-breaking tier-1 story between prep and finalise triggers a documented branch: minor (Also-worth-noting addition) versus major (restructure of draft + map re-mutation). The branch decision is surfaced via `AskUserQuestion`, not silent.

## Pros and Cons of the Options

### Phase split with .prep.md state handoff (chosen)

- Good: solves the Friday time-budget driver directly
- Good: minimum-viable state handoff (one frontmatter-tagged file)
- Good: backward-compatible (single-shot run still valid as fallback)
- Good: image design lands when the hook stabilises, not when the publication pressure peaks
- Bad: two invocations per week is a workflow change Tom must remember
- Bad: mid-week prep work on a soon-to-be-overshadowed story is partial waste
- Bad: late-breaking map-moving stories make finalise slower than its design target

### Status quo: single atomic run on Friday

- Good: zero workflow change, zero new state-handoff complexity
- Bad: Friday-morning session continues to take 2 to 4 hours
- Bad: violates Tom's new-role time budget
- Bad: critic loops compound under time pressure; image design rushed

### Continuous rolling-prep

- Good: most flexible; news lands when news lands
- Good: no explicit phase boundary to maintain
- Bad: no natural "publish-readiness checkpoint" that the prep handoff provides
- Bad: state is the working draft itself, with no audit-trail snapshot
- Bad: the rolling pattern resists straightforward measurement of Friday-morning duration savings

### Hybrid: rolling sources and map, single Friday finalise for everything else

- Good: sources are fresh on Friday morning
- Good: map updates are incrementally tracked
- Bad: leaves the most expensive phases (critic, image) on Friday, which does not solve the driver
- Bad: still requires Tom to be present mid-week for source/map work, without the relief of the critic and image work being mid-week too

## Reassessment Criteria

- After 4 weekly issues run on the prep+finalise flow, if the Friday-morning duration consistently exceeds one hour, the phase boundaries need rethinking (likely candidate: pull image design earlier in prep, or pre-commit to a tier-1-fail mitigation that runs Wednesday).
- If the `.prep.md` frontmatter schema accumulates more than 8 fields, the lightweight-state-handoff principle is broken and a separate state file (or a small SQLite store under `tmp/`) becomes the right move.
- If the late-breaking map-moving story branch fires on more than one in three editions, the prep-phase map-mutation needs to become provisional only (no published map until finalise commits).
- If Anthropic changes the Claude Code interactive quota model in a way that makes two invocations per week measurably cost-different from one, revisit alongside ADR 011's reassessment.
- If the skill is extracted to a standalone Node script (ADR 011's Option 2 evolution path), the phase split must be preserved in that extraction; this ADR locks in phase boundaries as a structural property, not just a SKILL.md convention.
- If the per-artifact-pass reading of ADR 016 (above) is challenged or overturned, revisit the per-phase critic-round budget here.

## Related

- ADR 011 (Orchestrate the AI Engineering Brief as a Claude Code interactive command). This ADR builds on 011's mechanism choice without superseding it. The orchestration mechanism is unchanged; the phase boundaries are added.
- ADR 012 (AI-generated content review gates). Voice and content-risk gates run twice in the new flow (once per phase). The gates themselves are unchanged.
- ADR 014 (Wardley mapping as strategic lens). Map mutation moves to the prep phase by default, with a documented branch for late-breaking map-moving stories in finalise.
- ADR 016 (SW-critic subagents and iteration loop). The 3-round critic cap applies per artifact pass under the reading argued in this ADR's Decision Outcome. Prep-phase critic plus finalise-phase critic together can run up to 6 rounds across the week, which is a feature (more rounds against a stable artifact) not a bug.
- P018 (Newsletter publication time pressure on Friday). The implementation ticket this ADR sits on top of. Fix path in P018 is the executable plan; this ADR is the architectural justification.
- JTBD-001 Awareness, JTBD-002 Engagement, JTBD-003 Evaluation (Engineering Leader persona). The weekly cadence is the trust-earning vehicle through which leaders move from "we're probably fine" to "we need to act"; the phase split protects that cadence.
- JTBD-200 Signal from Noise through JTBD-205 Trust Shipped vs Demo (Developer persona). The Developer persona's "few hours a week" time budget makes a reliably-shipped weekly brief itself the credibility signal; the phase split protects that signal.
- BRIEFING.md "Grep brand assets before designing new visuals". Confirmation criterion in this ADR depends on that rule for the image-design step in both phases.
