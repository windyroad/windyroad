# Problem 080: Newsletter pipeline has no cross-edition thesis-contradiction check between consecutive editions

**Status**: Open
**Reported**: 2026-06-01
**Priority**: 2 (High). Impact: 4 x Likelihood: 3 (deferred. Re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: M (deferred. Re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

The /wr-newsletter pipeline has no automated check that the current edition's load-bearing theses are consistent with the previous published edition. All current gates (voice, content-risk, sw-critic, editor, cog-a11y) review the edition in isolation, with no read of `src/newsletters/published/leader/<previous-edition>.md`.

The 2026-06-01 finalise run for The Shift Issue 07 hit this directly. Issue 06 (2026-05-25) had H1 "AI's real prize is capacity, not a smaller team", arguing the contrarian thesis that AI's value is doing-more-with-the-same-team rather than headcount cuts. Issue 07's prep brief Item 1 human angle stated: "The internal AI-deployment narrative that has carried teams for 18 months ('AI lets us do more with the same people') no longer survives an outside reader." That sentence directly contradicts the Issue 06 thesis. The pipeline shipped it past 3 voice gate rounds, content-risk, and 3 sw-critic rounds without flagging the contradiction. Tom caught it during his manual editorial review and the human angle was reframed around cost discipline (which is compatible with the Issue 06 capacity thesis).

This is high-severity for newsletter reputation: a self-contradiction across consecutive editions visible to readers who follow the newsletter would erode the editorial position the series is building. The "discipline phase" theme of Issue 07 only works if Issue 06's "capacity-not-smaller-team" framing is preserved as compatible context, not contradicted.

The pipeline has structural data to support a cross-edition check:

- `src/newsletters/published/leader/*.md` is the canonical archive (one file per edition since 2026-04-17).
- The persona config already declares edition-counting logic that scans the same folder (`src/newsletters/published/leader/2026-*.md`).
- The new edition's H1, opener, and item theses are available in the in-progress draft at step 11.

Suggested fix:

- Add a new pipeline step (provisionally 11.4, between step 11 drafter and step 11.5 URL verification) that invokes a fresh-context cross-edition consistency subagent.
- Subagent reads the last N published editions (default N=4, the rolling four-week window) plus the current draft. Returns SUPPORTED / CONTRADICTS / NEUTRAL plus quoted passages when CONTRADICTS.
- Save-gate semantics: CONTRADICTS blocks save and surfaces to Tom via AskUserQuestion (rewrite, override-with-reason, or accept as deliberate evolution). NEUTRAL or SUPPORTED proceeds.
- Audit trail: per-cross-edition verdict logged to `.reviews.md` under `## Cross-Edition Consistency` block.
- Reassessment: if zero CONTRADICTS verdicts fire across 8 consecutive editions and zero false-negatives are caught by Tom in retro, downgrade to a once-per-quarter check rather than per-edition.

Alternative lighter-weight fix:

- Append last edition's H1 + opener + Item 1 thesis to the SW-critic and voice-gate prompts as "prior edition theses; flag contradictions with current draft". Reuses existing gates rather than adding a new one.
- Trade-off: prior-edition context dilutes the gates' main focus. May not catch the contradiction because the gate's primary directive is voice / structure / argument-quality, not cross-edition consistency.

## Symptoms

(deferred to investigation)

## Workaround

(deferred to investigation. Current workaround: Tom reads the previous edition before publishing the next one and catches contradictions manually.)

## Impact Assessment

- **Who is affected**: (deferred to investigation. Direct: newsletter readers who notice the contradiction; indirect: Tom's editorial credibility.)
- **Frequency**: (deferred to investigation. Estimated: low base rate but high impact when it fires. One observed contradiction in 7 editions; rate likely climbs as the series accumulates theses to maintain consistency with.)
- **Severity**: (deferred to investigation. Estimated: High when fired; rep-erosion class.)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [x] Decide between fresh-context subagent (new pipeline step) vs gate-prompt-extension (lighter-weight) (landed as ADR-038 `cross-edition-thesis-consistency-check-as-fresh-context-subagent-gate.proposed.md`, 2026-06-02, AFK iter 4; Option A pinned by ADR-035 coverage-partitioning driver; Option B has direct ADR-035 conflict)
- [x] Subagent prompt shape pinned (UNBLOCKED 2026-06-03 via /wr-architect:review-decisions follow-up): N=8 (rolling two-month window, Option C, Tom rejected architect lean of B); CONTRADICTS save-gate Option A (block save until Tom resolves via AskUserQuestion Rewrite/Override/Accept-as-evolution); subagent input shape Option A (full prior-edition bodies for all N editions, Tom rejected architect lean of C/hybrid). Combined N=8 with full bodies drives a higher subagent token budget, accepted as load-bearing cost for JTBD-003 protection.
- [ ] If gate-extension: identify which existing gate(s) carry the cross-edition check (SW-critic plus voice both plausible) (N/A: gate-extension rejected per ADR-038 Option 2; ADR-035 coverage-partitioning conflict)
- [ ] Author `.claude/agents/wr-newsletter-cross-edition-consistency.md` per ADR-038 pinned shape: tool allowlist Read only; verdict shape SUPPORTED/CONTRADICTS/NEUTRAL; input shape per pinned Option A above.
- [ ] Implement SKILL.md gate invocation at the chosen step number (between 11b and 11.5 URL verification) with the AskUserQuestion surface on CONTRADICTS per pinned Option A save-gate.
- [ ] Add `## Cross-Edition Consistency` block append to `.reviews.md` writes.
- [ ] Test on next edition by injecting a contrived contradiction and confirming the check catches it (confirmation criterion e in ADR-038).
- [ ] Reassessment trigger: zero CONTRADICTS verdicts across 8 editions plus zero retro-flagged misses, downgrade to quarterly check (codified in ADR-038 Reassessment Criteria § Quarterly downgrade trigger)

### Progress log

- **2026-06-02 (AFK iter 4)**: ADR-038 landed. Architect verdict: PASS, recommended action slot (ii) per ADR-074 substance-confirm-before-build (option pinned, sub-decisions deferred). Option A pinned by ADR-035 Decision Drivers § Coverage partitioning (the architect cited verbatim "Each review gate owns its axis"). Option B has direct ADR-035 conflict by loading cross-edition consistency onto agents whose primary directive is voice / structure / argument-quality; P080's own prose flagged the same dilution risk independently. Options 3 (status-quo manual workaround) and 4 (inline drafter check) also rejected (Option 3: cost compounds; Option 4: ADR-016 fresh-context conflict). JTBD verdict: PASS, aligned to JTBD-001 (Awareness), JTBD-002 (Engagement), JTBD-003 (Evaluation); regression risk LOW; Tom-as-editor persona is implicit not documented (already covered by existing memory feedback_new_jtbd_and_persona_need_human_confirmation; not auto-ticketed). SKILL.md split deferred per ADR-038 § Deferred sub-decisions; three sub-decisions (N window, save-gate semantics, input shape) queued to /wr-architect:review-decisions direction-set.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P076 (newsletter pipeline H1-first composition order; H1 settles before body, which is when the cross-edition check would be most useful). P064 (newsletter SW-critic complexity; if cross-edition check rides the SW-critic gate, this composes with rubric simplification work).

## Related

- **P064** (`docs/problems/open/064-newsletter-critic-round-3-budget-exhausted-on-fixable-micro-issues.md`). Sibling: SW-critic complexity work would interact with adding cross-edition checks if the check rides the existing critic.
- **P076** (`docs/problems/open/076-newsletter-pipeline-drafts-body-before-heading.md`). Sibling: H1-first composition discipline.
- **ADR-016** (`docs/decisions/016-sw-critic-subagents-and-iteration-loop.superseded.md`). The fresh-context subagent pattern this ticket extends.
- **ADR-038** (`docs/decisions/038-cross-edition-thesis-consistency-check-as-fresh-context-subagent-gate.proposed.md`). The decision that codifies this ticket's fix substance.

(captured manually following the /wr-itil:capture-problem template after Tom-direction; bundled with P079 + P081 in one batch commit per ADR-014 related-cluster carve-out)
