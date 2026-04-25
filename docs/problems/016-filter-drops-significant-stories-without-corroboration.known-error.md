# Problem 016: wr-newsletter filter step drops significant stories that lack a primary source without attempting corroboration

**Status**: Known Error
**Reported**: 2026-04-24
**Transitioned to Known Error**: 2026-04-25 (review pass: root cause confirmed by 2026-04-24 edition; workaround = manual flag in chat + Google News corroboration)
**Priority**: 16 (High). Impact: Significant (4) x Likelihood: Likely (4)
**Effort**: M (SKILL.md step 4 filter logic change plus optional cross-source corroboration helper)
**WSJF**: (16 x 2.0) / 2 = 16.0
**Re-rated 2026-04-25**: Status auto-transitioned to Known Error; WSJF 8.0 to 16.0 reflects Known Error multiplier.

## Description

The `/wr-newsletter` skill at step 4 (Wardley precondition + three-lens filter) drops candidate stories whose only available source is a secondary aggregator (e.g. AI Daily Brief, letsdatascience.com), without attempting cross-source corroboration via Google News or other multi-outlet checks.

This caused the Apple CEO transition (Tim Cook stepping back, John Ternus appointed CEO with explicit AI-strategy reset) to be omitted from the 2026-04-24 The Shift edition draft on the first pass, despite being one of the highest-resonance leader-coded stories of the week. The story scored 3/3 on the three-lens (technical, operational, human) and had clear Foundation Models map relevance, but was deprioritised on the heuristic "no primary source equals weak attribution risk."

When Tom subsequently asked for the story to be considered and instructed "check it with Apple News," a quick Google News search returned multi-outlet primary corroboration (Reuters, CNBC, The Guardian, LA Times, CNN, all dated April 20-21). Corroboration was both available and trivial to obtain. The deprioritisation was a process failure, not a sourcing failure.

The same heuristic risk applies to other secondary-aggregator-only items in any week: AI Daily Brief commentary, Stratechery summaries, Casey Newton's posts, podcast notes. All of these can carry significant signal that traces back to verifiable primary reporting one click away.

## Symptoms

- Candidate list at step 3 includes a story sourced only from a secondary aggregator
- Step 4 filter scores the story strong on three-lens criteria but the drafter silently deprioritises it on attribution risk
- Story does not appear in the shortlist passed to step 9.5 ranking
- Story does not appear in the per-item interactive capture (step 10)
- Story is invisible to Tom unless he names it explicitly in chat
- After Tom names it, a quick Google News search returns multi-outlet primary corroboration, demonstrating the original deprioritisation was avoidable
- Net effect: significant industry stories are missing from the published edition until Tom acts as the corroboration-of-last-resort

## Workaround

**Manual (this run):** Tom flags the missed story in chat. The drafter then runs a Google News query (or equivalent), finds multi-outlet primary corroboration, and adds the story (typically as an Also-worth-noting note). The transcript of this exchange is now the workaround record for the 2026-04-24 edition.

**Manual (general):** before finalising any edition, scan the deprioritised-candidates list for items that scored 3/3 on three-lens but were dropped on attribution. Run Google News on the named entity for any such item. Re-add if multi-outlet corroboration exists.

There is no automated workaround in the pipeline today.

## Impact Assessment

- **Who is affected**: The Shift subscribers (Engineering Leader persona, JTBD-001 Awareness, JTBD-003 Evaluation) and Tokens Spent subscribers (Developer persona, JTBD-200 through JTBD-205). Both newsletters share the same filter logic at step 4.
- **Frequency**: Likely once per edition. Major industry stories regularly first surface via secondary aggregators (CEO transitions, M&A, leadership changes, industry-trend pieces, podcast-originated commentary). Quick scan: at least one such candidate per recent week.
- **Severity**: Significant. Newsletter credibility depends on covering what subscribers will see covered elsewhere. Missing a Tim-Cook-stepping-back-level story that every major outlet ran on April 20-21 reads as either out-of-touch or asleep at the wheel; either reading erodes the trust the brief is trying to earn. Borderline Severe (5) for any edition that misses a flagship story; Significant (4) is the floor.
- **Analytics**: Qualitative (Tom's own catches; subscriber feedback once the readership grows). No quantitative signal yet.

## Root Cause Analysis

### Root Cause (confirmed by 2026-04-24 The Shift edition)

The step 4 filter applies a "primary source preference" without an explicit "attempt corroboration first" branch. Today's logic:

1. Candidate has only a secondary aggregator source -> attribution risk flag fires -> candidate is dropped from the shortlist.

What should happen:

1. Candidate has only a secondary aggregator source -> attempt cross-source corroboration (Google News query, multi-outlet check) -> if multi-outlet primary coverage exists, treat the candidate as primary-sourced and proceed -> if corroboration fails, escalate to Tom (do not silently drop).

The pipeline already documents the Google News RSS workaround for OpenAI tier-1 fetches in `docs/ai-engineering-brief/ai-landscape.md` and in P010. The same pattern (Google News as corroboration) already exists in the codebase as an established workaround. It just is not wired into the filter step for general secondary-source candidates.

The deprioritisation also intersects with the drafter's caution about content-risk attribution scoring (ADR 012). The drafter prefers to drop a story over carrying it with weaker attribution, which is the right instinct in isolation. The wrong move is dropping silently before exhausting the corroboration path that would resolve the attribution concern in either direction.

### Fix Strategy

Three-part fix:

1. **SKILL.md step 4 logic change.** Add an explicit "attempt corroboration before dropping" branch. When a candidate scores strong on three-lens but the only source is a secondary aggregator, run a Google News search (or equivalent multi-outlet check) on the named entity before applying the deprioritisation. If multi-outlet primary corroboration exists, treat the candidate as primary-sourced and carry it. Document the corroboration sources in the candidate metadata for the per-item capture.

2. **SKILL.md step 4 escalation branch.** When corroboration fails (no multi-outlet primary coverage), do not silently drop. Instead surface the candidate in a "weak-attribution candidates" list shown to Tom during the per-item capture, with the deprioritisation reason and the corroboration attempts. Tom decides keep / drop / ask for help. This matches the directive Tom gave with this ticket: "try to corroborate and if that fails, ask for help."

3. **Optional new critic check.** A `check_32` or similar that scans the deprioritised-candidates artifact (if step 2 writes one) and flags any candidate with three-lens score >= 2 that was dropped on attribution alone, asking the drafter to demonstrate the corroboration attempt. Defer until 1 and 2 land and the artifact format is settled.

### Investigation Tasks

- [ ] Decide where in step 4 the corroboration branch lands (before or after three-lens scoring; my read is after, so cheap items get dropped early without burning a Google News query each)
- [ ] Decide the corroboration query format (Google News RSS scoped to the named entity; or `news.google.com/search` HTML; the existing OpenAI workaround uses the RSS variant)
- [ ] Decide the deprioritised-candidates artifact format (markdown with per-candidate sections; include candidate, three-lens score, attribution reason, corroboration attempts, drafter's recommendation)
- [ ] Update SKILL.md step 4 with the corroboration branch and the escalation branch
- [ ] Update SKILL.md step 10 (per-item interactive capture) to also surface weak-attribution candidates if any exist
- [ ] Decide whether the optional critic check is worth the scope cost or should wait for a baseline of N editions with the new step-4 logic

## Related

- Problem 008 (critic rubric misses external-review findings). Same pattern: a quality gap that the existing pipeline structurally cannot catch, surfaced by Tom's external review. P016 is the upstream-of-critic equivalent: the filter step decides which stories the critic ever sees.
- Problem 010 (tier-1 source fetches blocked by bot protection). The Google News RSS workaround established for OpenAI is the existing precedent for the corroboration mechanism this ticket recommends.
- Problem 015 (drafter paraphrases interactive capture text). Different scope but adjacent: P015 is the drafter losing Tom-voice fidelity AFTER capture; P016 is the filter losing significant stories BEFORE capture. Together they bracket the pipeline's signal-preservation gaps.
- `.claude/skills/wr-newsletter/SKILL.md` step 4 (Wardley precondition + three-lens filter; the corroboration branch lands here)
- `.claude/skills/wr-newsletter/SKILL.md` step 10 (per-item interactive capture; the escalation branch surfaces weak-attribution candidates here)
- `src/newsletters/drafts/leader/2026-04-24.md` (the edition where the Apple CEO transition was first dropped, then added after Tom flagged it; transcript of the exchange is the symptom record)
- `docs/ai-engineering-brief/ai-landscape.md` Known Limitations section (existing precedent for Google News RSS as a tier-1 workaround)
- ADR 012 (content review gates). The "drop on attribution risk" instinct comes from this gate. This ticket does not weaken the gate; it adds an upstream corroboration step that resolves attribution one way or the other before the gate fires.
