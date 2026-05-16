# Problem 018: Newsletter publication takes too long on Friday morning; pipeline needs a pre-Friday prep phase

**Status**: Verification Pending
**Reported**: 2026-04-24
**Transitioned to Known Error**: 2026-04-25 (review pass: root cause confirmed by 2026-04-24 session; workaround = manual mid-week save + resume on Friday)
**Transitioned to Verification Pending**: 2026-04-25 (fix released: phase=prep, phase=finalise, phase=full added to wr-newsletter SKILL.md per ADR 017; awaiting back-test on next edition)
**Priority**: 16 (High). Impact: Significant (4) x Likelihood: Likely (4)
**Effort**: M (SKILL.md phase split into prep + finalise, state handoff between sessions, inbox-for-late-week-additions behaviour)
**WSJF**: (16 x 2.0) / 2 = 16.0 (reduced to 0 effective per ADR-022 once Verification Pending; see README backlog)
**Re-rated 2026-04-25**: Status auto-transitioned to Known Error; WSJF 8.0 to 16.0 reflects Known Error multiplier.

## Description

The `/wr-newsletter` skill currently runs end-to-end on Friday morning: source fetches, map update, filter, Wardley critic loop, per-item interactive voice capture, drafting, voice gate, content-risk gate, newsletter critic loop (up to 3 rounds), image generation, LinkedIn post draft, publish.

In practice, a full Friday run takes multiple hours of active work. The 2026-04-24 session took several hours of iterative refinement before the edition was ready to move to `published/`. The pressure concentrates on the one morning where Tom also has other priorities (new role starting), which risks two bad outcomes: (a) the edition ships late or is skipped for a week, breaking the weekly cadence commitment; (b) the edition ships rushed with errors that the multi-round review gates catch in-session, but at the cost of the time pressure and the stress pattern repeating every Friday.

The concrete friction this edition exposed:
- Every tier-1 source had to be fetched Friday morning (Anthropic, OpenAI via Google News workaround, DeepMind)
- The map update, Wardley critic loop, and analysis rewrite all happened in one sitting
- Per-item interactive capture with Tom happened in one sitting
- Multi-round newsletter critic (3-5 rounds total this edition) happened in one sitting
- Image design iteration (three versions before landing) happened in one sitting
- LinkedIn post and alt text happened in one sitting

The right shape is roughly 90 percent of the work done across the week (Mon-Thu) with Friday morning reserved for a finalise phase: refresh tier-1, pull in any inbox-added or overnight-tier-1 stories, re-run the final gate pass, publish.

## Symptoms

- Friday morning sessions run 2-4+ hours to get the edition publication-ready
- Tom carries the time pressure weekly, which risks both late/skipped editions and stress-driven compromises on quality
- Source-fetch failures on tier-1 (OpenAI Cloudflare, Reddit blocked, Reuters 401) surface mid-pipeline on Friday and force workaround decisions under time pressure
- Multi-round critic loops compound because they run against the full draft rather than against a draft that was already near-publication before Friday
- Image design iteration is expensive (three versions this edition) and forcing it onto Friday means the final version is often a rushed compromise
- There is no "save progress for Friday" checkpoint today; the skill runs front-to-back or not at all

## Workaround

Manual for now. Tom can invoke the skill mid-week and save the draft state by leaving it in `drafts/<persona>/YYYY-MM-DD.md` partially complete, then resume on Friday. This works but loses the pipeline's ability to reason about which phases are done, forces Tom to remember where the skill left off, and does not re-fetch tier-1 automatically on Friday to pick up late-breaking news.

## Impact Assessment

- **Who is affected**: Tom (time pressure on the single weekly publication morning), The Shift subscribers (Engineering Leader persona, JTBD-001, JTBD-003) and Tokens Spent subscribers (Developer persona, JTBD-200-205) if editions slip or ship rushed, Windy Road brand (weekly cadence is the commitment the brief earns trust on).
- **Frequency**: Every Friday. Single highest-friction day in the weekly content operation.
- **Severity**: Significant. Weekly cadence is the commitment; missed or rushed editions erode the subscriber-trust growth curve the brief is trying to build. Also directly affects Tom's Friday mornings going into a new-role period where his time is constrained.
- **Analytics**: Qualitative (Tom's own time logs; session duration records). Quantifiable via session transcript length and edit-pass count per edition.

## Root Cause Analysis

### Root Cause (confirmed by the 2026-04-24 session duration and edit pattern)

The `/wr-newsletter` skill was designed as a single atomic run. Every phase assumes the same session context and the same news cutoff. This is optimal when the week's news is uniform and Tom has uninterrupted Friday time, neither of which is true in practice.

Specifically:
1. **No phase boundaries.** The skill does not distinguish between "research-and-draft" work (which is 80-90 percent of the value and can be done on any day) and "publish" work (which must happen Friday so late-week news is included).
2. **No state handoff.** Running the skill Thursday and trying to resume Friday requires Tom to re-run the full skill, which re-fetches sources and re-runs the critic against an already-improved draft, wasting most of the Thursday work.
3. **Inbox handling is passive.** The `src/newsletters/inbox/` folder is read at skill-start but not monitored between Thursday draft and Friday publish. A Thursday inbox-drop does not flow into the Friday finalise.
4. **Image iteration is Friday-only.** The cover image design happens against the finalised hook, which means every hook-line iteration during the critic loop requires an image re-render. Moving image design to late Thursday (once the hook stabilises) would front-load that cost.

### Fix Strategy

Four-part fix:

1. **Split `/wr-newsletter` into two phases.** Accept a `phase` argument:
   - `phase=prep` (default for mid-week runs): executes steps 0-11 (resolve persona, fetch sources, filter, map, Wardley critic, per-item capture, draft) plus a first pass of steps 13-15 (voice, content-risk, newsletter critic). Saves a `.prep.md` draft that holds the near-final content plus the critic-review blocks.
   - `phase=finalise` (default for Friday runs): loads the `.prep.md` draft, re-fetches tier-1 sources, inserts any new inbox items or new tier-1 stories as Also-worth-noting entries (or offers to restructure if the new story is map-moving), re-runs the gates on the final draft, generates/updates the image, drafts the LinkedIn post, and moves the draft from `.prep.md` to its final filename.
   - `phase=full` (existing behaviour): preserved for first-time users or one-off editions where there is no mid-week prep.

2. **State handoff via frontmatter.** The `.prep.md` draft carries `phase: prep`, `prep-date: YYYY-MM-DD`, and `prep-source-cutoff: <ISO timestamp>` in frontmatter. The finalise phase reads these to decide what to re-fetch and what to carry forward.

3. **Inbox monitoring between phases.** The finalise phase re-reads `src/newsletters/inbox/` and diffs against what the prep phase saw; anything new is surfaced via per-item interactive capture before the final critic pass.

4. **Image design lands in the prep phase.** Once the hook stabilises at the end of the prep-phase critic loop, the image is designed and saved. Finalise only re-renders if the hook actually changes; otherwise the prep-phase image carries through unchanged.

Validation: back-test by running `phase=prep` Thursday and `phase=finalise` Friday on the next edition. Compare Friday-morning session duration against this week's duration.

### Investigation Tasks

- [ ] Confirm with Tom that the prep/finalise split matches his preferred cadence (Tuesday or Wednesday prep, Friday finalise). A single prep pass late in the week is different from rolling prep throughout the week.
- [x] Design the `.prep.md` frontmatter schema (phase, prep-date, prep-source-cutoff, source-failures, map-mutation-status) (released 2026-04-25; schema documented in SKILL.md step 16 phase=prep block and ADR 017 line 46)
- [x] Decide the finalise-phase behaviour when a tier-1 story lands Thursday evening or Friday morning that is map-moving (released 2026-04-25; SKILL.md step 5-prime documents the AskUserQuestion branch with three options: Also-worth-noting, Restructure)
- [x] Update SKILL.md step 0 to parse the `phase` argument and branch accordingly (released 2026-04-25)
- [x] Update SKILL.md steps 1-15 to tag which belong to prep vs finalise (released 2026-04-25; phase-step matrix table added near top of SKILL.md plus per-step `*-prime` variants)
- [x] Update SKILL.md step 16 to save as `.prep.md` when in prep phase (released 2026-04-25; frontmatter schema includes phase, prep-date, prep-source-cutoff, source-failures, map-mutation-status per ADR 017 line 46)
- [x] Add finalise-phase steps covering tier-1 refresh, inbox diff, and late-story handling (released 2026-04-25; implemented as step 0.5 load-prep-state + step-prime variants 1-prime, 2-prime, 3-prime, 4-prime, 4b-prime, 5-prime late-story branch, 9-prime, 9.5-prime, 10-prime, 11-prime, 12-prime image re-render gate, 13-prime, 14-prime, 15-prime, plus step 15.5 LinkedIn post and step 16 phase-finalise rename .prep.md to .md)
- [ ] Run `/wr-newsletter phase=prep` against the 2026-05-01 edition mid-week and `/wr-newsletter phase=finalise` the following Friday as validation
- [ ] Measure Friday-morning session duration before and after

## Related

- `.claude/skills/wr-newsletter/SKILL.md` (host for the phase split; every step needs a prep/finalise tag)
- `.claude/skills/wr-newsletter/personas/leader.md` and `personas/developer.md` (persona configs; prep/finalise need to work for both)
- `src/newsletters/drafts/<persona>/` (host for the `.prep.md` file during the week)
- `src/newsletters/inbox/` (inbox-monitoring behaviour between phases)
- Problem 008 (critic rubric misses external-review findings; the multi-round critic loop is one of the most time-consuming phases on Friday, so any prep-phase critic pass reduces Friday pressure directly)
- Problem 015 (drafter paraphrases interactive capture text; per-item capture is currently a Friday-morning step and is a candidate for prep-phase move)
- Problem 016 (filter drops significant stories without corroboration; corroboration is a candidate for prep-phase automation)
- Problem 017 (critic rubric misses contradictions and ambiguity; both check_32 and check_33 would run in the prep-phase critic and again in the finalise critic)
- ADR 011 (AI brief orchestration via Claude Code; the phase split is an extension of this orchestration model, probably worth an amendment ADR documenting the prep/finalise decision)
- ADR 014 (Wardley mapping as strategic lens; map-mutation is a natural prep-phase step, with only marginal updates possible in finalise)
- Memory: `feedback_each_review_is_separate_subagent.md` (every review is a fresh subagent call; prep and finalise critic passes are separate subagent invocations)

## Verification

Released 2026-04-25 in `.claude/skills/wr-newsletter/SKILL.md` per ADR 017.

### Verification criteria (from ADR 017 Confirmation section)

- [ ] `/wr-newsletter phase=prep` and `/wr-newsletter phase=finalise` both parse without error at SKILL.md step 0; default behaviour without the argument is the existing single-shot run.
- [ ] A `.prep.md` draft created on a Tuesday or Wednesday resumes cleanly on the following Friday: finalise reads the frontmatter, re-fetches only tier-1, picks up new inbox items, re-runs gates only on changed material, and produces the final published artifact.
- [ ] Friday-morning session duration drops below one hour for at least three of the next four editions where prep ran.
- [ ] Inbox additions that land between prep and finalise are surfaced via per-item interactive capture during finalise; none are silently dropped.
- [ ] The image is generated during prep when the hook stabilises; finalise only re-renders if the hook changes.
- [ ] A late-breaking tier-1 story between prep and finalise triggers a documented branch (Also-worth-noting versus Restructure) via AskUserQuestion, not silent.

### Verification plan

Back-test on the next edition (target 2026-05-01):

1. Run `/wr-newsletter phase=prep` on Tuesday or Wednesday 2026-04-29 or 2026-04-30. Confirm `.prep.md` lands at `src/newsletters/drafts/leader/2026-05-01.prep.md` with full frontmatter.
2. Drop a test item into `src/newsletters/inbox/` between phases.
3. Run `/wr-newsletter phase=finalise` Friday morning 2026-05-01. Confirm: tier-1 refresh runs (Anthropic, OpenAI, DeepMind), the test inbox item is surfaced via per-item capture, gates re-run, image carries forward unless headline changed, LinkedIn post drafts, file renames to `2026-05-01.md`.
4. Compare Friday session duration against the 2026-04-24 baseline (multi-hour). Target: under one hour.

### Closure trigger

Close on the first edition that ships under one hour Friday-morning where prep ran successfully. If the back-test surfaces gaps (frontmatter parse failure, .prep.md not located, gate regression, image-rerender misfire), reopen as a fresh known-error and link from this ticket.
