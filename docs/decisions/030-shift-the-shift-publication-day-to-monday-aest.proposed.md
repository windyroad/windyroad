---
status: "proposed"
date: 2026-05-23
human-oversight: confirmed
oversight-date: 2026-05-30
decision-makers: [Tom Howard, Claude]
consulted: []
informed: []
reassessment-date: 2026-08-23
---

# Shift The Shift publication day from Friday to Monday AEST

## Context and Problem Statement

ADR 017 introduced the prep/finalise phase split for the newsletter pipeline with the working assumption that publication lands on Friday morning (AEST). That assumption was implicit: ADR 017 named Friday throughout the rationale, and SKILL.md hard-coded Friday in the `<publication-date>` computation, in the phase table, and in the Tom-summary reminders. The Friday choice predates both the weekend-availability shift in Tom's working week and the Anthropic weekly-quota reset boundary, and it actively excludes Friday US/EU stories from the published edition because those stories break after the Friday-AEST publication moment.

After running on the Friday cadence for several editions, three drivers have accumulated that point at a different day:

1. **Weekend availability for the time-expensive work.** Tom's weekdays are committed to a full-time engineering role. The prep phase (research, drafting, critic loops, image design, which is the bulk of the multi-hour work that ADR 017 was designed to absorb) lands more naturally on Saturday and Sunday than on Tuesday-through-Thursday evenings. Weekend prep removes a recurring evening-time conflict without changing the prep/finalise architecture.
2. **Weekly Claude quota reset on Saturday 3 PM AEST.** The Anthropic interactive-quota week resets Saturday afternoon local. Doing prep on the weekend starts each edition against a fresh quota, which removes the "did I burn enough quota mid-week to block the critic loops on Friday morning" risk that occasionally bit the previous schedule (the critic gates and Wardley artefact loops are the heaviest consumers in a single session).
3. **Friday US/EU stories.** AEST is roughly 14 to 16 hours ahead of US-Eastern and 9 to 11 hours ahead of European business hours. Friday-AEST publication misses the entire US/EU Friday news window because that window is still happening when the AEST edition has already shipped. Monday-AEST publication brings the prior Friday US/EU window inside the finalise tier-1 refresh, which is where ADR 017 already promised to absorb late-breaking news.

The decision here is narrow: which day does The Shift (persona=leader) publish on? It does not revisit ADR 011 (orchestration mechanism) or ADR 017 (phase split). It does narrow ADR 017's implicit Friday-publication assumption to be persona-configurable rather than hard-coded.

## Decision Drivers

- **Weekend-vs-weekday time budget.** Prep must land on the days when Tom actually has uncommitted time. Tuesday-through-Thursday evenings compete with engineering-role obligations; Saturday and Sunday do not.
- **Quota reset alignment.** Each edition's heavy critic/loop work should start against a fresh weekly quota, not a mid-week-depleted one.
- **News-window coverage.** The finalise tier-1 refresh should capture the prior business-week's late-breaking US/EU stories, not exclude them by sequencing.
- **No architectural overhaul.** ADR 017's prep/finalise split is the design that already absorbs this kind of timing change; the publish-day should be a parameter inside that architecture, not a new architecture.
- **Persona scope.** This decision is about The Shift only. Tokens Spent (persona=developer) is out of scope; its publish day stays as the skill's existing default behaviour until a separate decision moves it.

## Considered Options

1. **Keep Friday-AEST publication.** Leave SKILL.md and the leader persona config untouched. Continue absorbing weekday prep evenings.
2. **Shift to Monday-AEST publication, parameterised per-persona** (chosen). Add `publish-day` and `publish-timezone` to the leader persona config. Generalise the `<publication-date>` computation in SKILL.md to read those fields. Prep naturally lands on the weekend; finalise lands Monday morning AEST.
3. **Shift to a different weekday (Tuesday or Wednesday AEST).** Same parameterisation, different target day.
4. **Bi-weekly cadence on Monday-AEST.** Keep the day shift but halve the frequency to relieve quota and time pressure further.

## Decision Outcome

Chosen option: **"Shift to Monday-AEST publication, parameterised per-persona"**, because it satisfies all three drivers in one move without breaking the ADR 017 architecture and without altering the weekly cadence the brief earns trust on (P018, JTBD-001 Awareness, JTBD-002 Engagement). The Friday-AEST status quo loses on all three drivers. A Tuesday or Wednesday AEST target moves the publication day off the weekend-prep tail (which loses driver 1) and re-introduces the news-window-misalignment problem for European Monday launches without solving the US Friday window. Bi-weekly cadence trades weekly trust-building for capacity relief; the drivers here are about timing, not frequency, so the cadence change is not warranted.

### Why per-persona rather than a global publish-day swap

The leader persona is the only one in scope for this decision. The developer persona's About text already names "Wednesday morning" as its target publish day, while SKILL.md's hard-coded Friday treats developer the same as leader. That is a latent inconsistency which predates this decision. Parameterising publish-day per persona (rather than hard-coding Monday globally) addresses The Shift's change cleanly and leaves the developer-persona inconsistency exactly as it stands today; a separate decision can address Tokens Spent on its own timeline.

### Constraints this decision must satisfy

- The leader persona config (`personas/leader.md`) gains two frontmatter fields: `publish-day: Monday` and `publish-timezone: Australia/Sydney`. Both are required.
- SKILL.md step 0 reads those fields into `<publish-day>` and `<publish-timezone>` variables. The `<publication-date>` computation becomes: "if today in `<publish-timezone>` is `<publish-day>`, use today; otherwise use the next `<publish-day>` after today."
- The skill description (frontmatter `description:` field), the phase table, the finalise rationale prose, the cover-image step's `publication_date` comment, and the step-17 Tom-summary reminder all stop hard-coding "Friday" and instead reference `<publish-day>` or call out Monday-AEST explicitly where the prose serves the leader persona.
- Backward compatibility: the developer persona config does not yet carry `publish-day` / `publish-timezone`. The skill must continue to work for developer without crashing if those fields are absent. Resolution: when the fields are absent for a persona, the skill surfaces an `AskUserQuestion` rather than guessing a day. This makes the absence visible (it is currently latent) but does not silently drift behaviour. A future ADR can backfill developer's fields once that persona is being actively published again.
- ADR 017 is not amended. This ADR refines ADR 017's implicit Friday assumption to be a per-persona parameter without changing any of ADR 017's phase-split logic or the 3-round critic-cap reading.

## Consequences

### Good

- Weekend prep removes the weekday-evening conflict with Tom's engineering-role obligations. The bulk of the multi-hour work (critic loops, image iteration, source corroboration) lands when Tom actually has the time.
- Quota reset on Saturday 3 PM AEST aligns with the start of prep, so each edition runs the heavy gates against a fresh weekly quota.
- Friday US/EU stories land inside the finalise tier-1 refresh on Monday morning AEST, which is exactly the late-breaking-news pickup that ADR 017 promised but the Friday-AEST schedule structurally excluded.
- The persona-config parameterisation closes a latent SKILL.md / developer-persona inconsistency by making publish-day an explicit per-persona field rather than a hard-coded shared default.

### Neutral

- Monday-morning publication is a different LinkedIn-newsletter sending slot than Friday morning. Engagement-pattern data from the first 2 to 3 Monday editions should be compared against the Friday-AEST baseline at the 2026-08-23 reassessment, but the cadence-vs-day question is downstream of the drivers here.
- Tom must remember the new cadence (prep Sat/Sun, finalise Mon AM). The existing Tom-summary at SKILL.md step 17 now prints `<publish-day>` instead of Friday, so the in-skill reminder stays accurate.
- The retrospective skill (`/wr-retrospective:run-retro`) is invoked after publication; the day shift moves retro invocations from Friday afternoon to Monday afternoon. No code change needed; retro is day-agnostic.
- **"Week ending" label vs publication date (amendment, 2026-05-25).** A week does not end on the publication Monday, so the reader-facing "week ending" label must use the Sunday that ends the editorial week (the publish-day date minus one day), NOT the Monday publication date. This introduces a display-only `<week-ending>` binding in SKILL.md step 0, distinct from `<publication-date>`. The distinction is strictly label-vs-path: `<publication-date>` (Monday) remains the single source for all file paths and companion-file naming (P040 unchanged, since P040 governs paths, not labels); `<week-ending>` (Sunday) is used only in the headline subtitle, the cover "WEEK ENDING" stamp, and the capture-transcript header. This was a latent bug introduced by the Friday-to-Monday shift: under the prior Friday convention "week ending Friday" was already loose, but Monday publication makes it plainly wrong, which surfaced it.

### Bad

- The developer persona's existing "Wednesday morning" About-text claim is left in a more obviously-broken state: SKILL.md now requires `publish-day` to be present in the persona config and surfaces an AskUserQuestion if it is absent, which means a developer-persona invocation will halt at step 0 until that gap is filled. Mitigation: document the gap in this ADR (here) so the next developer-persona invocation has the context, and let that invocation prompt the backfill rather than pre-emptively setting a day that may not be the right choice.
- Saturday-AEST prep loses the ability to react to Saturday-morning US/EU news (the prep cutoff is now earlier in the news week, not later). The finalise refresh on Monday morning AEST recovers all of that window, so this is a sequencing observation, not a coverage gap.

## Confirmation

- The leader persona config carries `publish-day: Monday` and `publish-timezone: Australia/Sydney` in frontmatter.
- SKILL.md step 0 binds `<publish-day>` and `<publish-timezone>` from the persona config and uses them in the `<publication-date>` computation. The string "Friday" no longer appears in the `<publication-date>` computation, the phase table, the cover-image `publication_date` comment, the step-17 Tom-summary reminder, or the description frontmatter, except where the prose intentionally references the Friday US/EU news window that Monday-AEST publication captures.
- A `phase=prep` invocation on a Saturday resolves `<publication-date>` to the upcoming Monday, and a `phase=finalise` invocation on the following Monday morning resolves to the same date.
- The skill surfaces an `AskUserQuestion` (rather than silently defaulting) when a persona config does not carry `publish-day` / `publish-timezone`, so the developer-persona gap is visible the next time that persona is invoked.

## Pros and Cons of the Options

### Shift to Monday-AEST publication, parameterised per-persona (chosen)

- Good: satisfies all three drivers (weekend time, quota reset, US/EU news window) in one move.
- Good: preserves ADR 017's prep/finalise architecture untouched.
- Good: closes the SKILL.md / developer-persona latent inconsistency by making publish-day an explicit per-persona field.
- Good: weekly cadence is unchanged; trust-building rhythm continues.
- Bad: developer persona must backfill its publish-day field before its next invocation.
- Bad: Monday-morning LinkedIn-sending engagement patterns are unknown against the Friday-AEST baseline until the 2026-08-23 reassessment.

### Keep Friday-AEST publication

- Good: zero change.
- Bad: loses on all three drivers (weekday-evening conflict, mid-week-depleted quota, US/EU Friday window excluded).
- Bad: the latent SKILL.md / developer-persona Friday-vs-Wednesday inconsistency stays hidden.

### Shift to Tuesday or Wednesday AEST

- Good: still gets the quota-reset alignment if prep runs on the weekend.
- Bad: pushes finalise off Monday morning, which loses the natural weekend-prep-into-Monday-publish handoff.
- Bad: re-introduces the US/EU Monday-launch news-window gap for a smaller US Friday-window gain.

### Bi-weekly cadence on Monday-AEST

- Good: maximum capacity relief.
- Bad: trades weekly trust-building rhythm for capacity headroom Tom does not currently need (the drivers here are about timing, not capacity).
- Bad: makes engagement-pattern comparison against the Friday-AEST weekly baseline harder.
