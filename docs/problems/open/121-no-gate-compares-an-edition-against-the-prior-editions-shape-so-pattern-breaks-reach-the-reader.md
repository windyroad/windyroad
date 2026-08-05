# Problem 121: No gate compares an edition against the prior edition's shape, so pattern breaks and precedent drift reach the reader

**Status**: Open
**Reported**: 2026-08-04
**Priority**: 12 (High), Impact: 3 x Likelihood: 4, derived at capture from the description. Impact is 3 because pattern breaks reach the reader and are noticed by returning subscribers (the class the external reviewer described as "the two things a returning subscriber will notice"), but nothing factually wrong ships. Likelihood is 4 because every edition is drafted against the skill template rather than against the prior edition's artefact, so drift is the default rather than the exception.
**Origin**: internal
**Effort**: M, derived at capture. Extend the existing `wr-newsletter-cross-edition-consistency` gate's prompt with a structural-shape axis, or add a sibling step; comparable to P117's prompt-tightening work, also rated M.
**WSJF**: 6.0 = (12 x 1.0) / 2

## Description

Every newsletter gate reads the edition under production. Only one gate reads prior editions at all, and ADR-038 scopes it to thesis contradiction. Nothing reads the prior edition's artefact as a **shape template**, so recurring structural elements silently drop, label vocabulary drifts, and the companion post's length has no anchor.

**Evidence: The Shift Issue 16 (published 2026-08-03).**

The LinkedIn companion post accumulated four pattern breaks against Issue 15's published post, none caught by any gate, all caught by Tom's external reviewer:

1. **No issue line.** Issue 15's post carried "Issue 15 of The Shift: An AI agent broke its sandbox to cheat on a test." Issue 16's post named neither the issue number nor the article anywhere in its text; the number appeared only in the cover art and the title only in the link card.
2. **Label drift.** Issue 15 used "This week:". Issue 16 used "In this week's issue:".
3. **No reply prompt.** Issue 15 closed with a question plus an instruction ("Reply with where your team is on bounding what your agents can reach"). Issue 16 closed on a bare rhetorical question, even though the brief itself said "Reply and tell us."
4. **Length with no anchor.** Issue 15's post is 1,655 characters. Issue 16's reached 2,993, hit LinkedIn's 3,000-character ceiling three separate times during revision, and each time space was bought by cutting something load-bearing. One of those cuts removed the GCC clause that answered the edition's own checkable question; the same clause came back two review rounds later as a reviewer finding. The precedent post was never compared against until the reviewer did it manually.

The brief had the same class of break: Issues 14 and 15 both carried a forward-deadline slot ("Two weeks out", "Six days out"). Issue 16 dropped it, because that week's deadline had become a deep item. The successors were already in the draft; only the recurring slot was missing. The external reviewer caught it, and the restored section became one of the edition's stronger beats.

## Root cause

`wr-newsletter-cross-edition-consistency` (ADR-038) is the only gate that reads prior editions, and its charter is thesis-level: does this edition contradict a position the series has taken. P117 extended it with an advisory dropped-thread scan, which is content continuity. Neither covers structural shape.

The drafter works from `.claude/skills/wr-newsletter/assets/draft-template.md` plus the persona config. Those encode the canonical shape in the abstract; they do not encode what the last two editions actually did. When a recurring slot is a pattern rather than a template rule (the "N out" forward-deadline beat is not in any template), the only surviving record of it is the previous edition's file, and nothing reads that file for shape.

The companion post is the worst-affected surface because it has the least template coverage. `SKILL.md` step 15.5 enumerates its required contents, but the published corpus is where its actual conventions live: the issue line, the "This week:" label, the closing reply instruction, and a length norm roughly 40% of what Issue 16 produced.

## Symptoms

Recurring structural elements silently disappear between editions; label vocabulary drifts; the companion post has no length anchor and grows until it hits the platform ceiling, at which point load-bearing content is cut to fit. All detected by external review rather than by a gate.

## Workaround

Tom or the external reviewer opens the prior edition's published files side by side with the draft and diffs them by eye.

## Impact Assessment

- **Who is affected**: returning subscribers (the pattern breaks are exactly what a repeat reader notices); Tom and the external reviewer (carry the comparison manually).
- **Frequency**: every edition, since nothing in the pipeline reads the prior artefact for shape.
- **Severity**: no factual error ships. The cost is reader-facing inconsistency plus review rounds spent rediscovering conventions that are already on disk.
- **Analytics**: none.

## Root Cause Analysis

### Investigation Tasks

- [ ] Decide the home: extend `wr-newsletter-cross-edition-consistency` with a structural-shape axis, or add a sibling gate. The existing gate already loads the prior N editions, so extending it avoids a second expensive read; but ADR-038 scopes it to thesis contradiction, so widening its charter needs the ADR amended.
- [ ] Define the shape diff. Candidate axes: section-heading inventory against the prior two editions (catches the dropped "N out" slot); recurring label vocabulary ("This week:"); companion-post element inventory (issue line, label, bullet count, closing instruction); companion-post length against the trailing median rather than only against the platform ceiling.
- [ ] Decide whether a shape break is a finding or an advisory. Some breaks are deliberate: Issue 16's forward-deadline slot legitimately had no content until the successors were identified. The gate should surface the break and require a stated reason, not force restoration.
- [ ] Check the interaction with P120. If the editor and skeptic gates gain remediation loops, a shape gate's findings should flow through the same loop rather than becoming another surface-to-Tom advisory, or this ticket just adds a fifth thing for Tom to action.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P120, P117, P080

## Related

- **P120** (`docs/problems/open/120-editor-and-skeptic-gates-surface-findings-to-tom-instead-of-remediating-them.md`): the remediation-loop ticket. If a shape gate lands while gate findings still route to Tom by default, it adds detection without reducing his load. Sequencing matters; see Investigation Task 4.
- **P117** (`docs/problems/verifying/117-tighten-newsletter-gate-prompts-for-lower-frequency-external-review-classes.md`): extended the cross-edition gate with a dropped-thread scan. That is content continuity; this is structural continuity. Same gate, adjacent axis.
- **P080** (`docs/problems/.../080-newsletter-pipeline-has-no-cross-edition-thesis-contradiction-check.md`): the ticket that built the cross-edition gate under ADR-038, scoping it to thesis contradiction.
- **P070** (`docs/problems/.../070-newsletter-draft-template-does-not-codify-three-deep-items-plus-notes-discipline.md`): codified the canonical shape into ADR-032. That work encodes the shape in the abstract; this ticket is about the conventions that live only in the published corpus.
- **ADR-038** (`docs/decisions/038-cross-edition-thesis-consistency-check-as-fresh-context-subagent-gate.proposed.md`): scopes the cross-edition gate to thesis consistency. Widening it needs an amendment.
- Evidence corpus: `src/newsletters/published/leader/2026-07-27/2026-07-27.linkedin.md` (1,655 chars, carries all four elements Issue 16 dropped) against `src/newsletters/published/leader/2026-08-03/2026-08-03.linkedin.md`.
- Captured via `/wr-itil:capture-problem` during the Issue 16 retrospective (2026-08-04), against Tom's framing: "what would we need to change to require less feedback from me and the external reviewer".
