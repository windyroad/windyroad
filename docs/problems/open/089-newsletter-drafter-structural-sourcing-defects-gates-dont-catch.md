# Problem 089: wr-newsletter drafter emits structural + sourcing defects the five gates do not catch

**Status**: Open
**Reported**: 2026-06-15
**Priority**: deferred, re-rate at next /wr-itil:review-problems
**Origin**: internal
**Effort**: M (deferred, re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

The Shift Issue 09 (2026-06-15) passed all five review gates (voice, content-risk, newsletter-critic, editor, cognitive-accessibility) plus cross-edition consistency and URL verification on its first complete draft, yet Tom flagged a cluster of structural and sourcing defects the gates did not catch. The defects are a recurring class of drafter-discipline failures in `.claude/skills/wr-newsletter/SKILL.md` step 11b + `assets/draft-template.md`:

1. **Redundant `**Source.**` lines** at the end of each item when the item body already carries inline source links. The drafter should not emit a separate Source line when inline links already cover sourcing.
2. **Naming news outlets in prose without linking them** (e.g. "corroborated by Reuters, FT, NYT, and WSJ"; "Wall Street Journal and Bloomberg"). Tom's rule: do not reference a news site without linking it; only link if the link is worth following for the item, otherwise drop the outlet name. Recurred across Items 2/3/4.
3. **Over-proving a widely-known / first-hand story** (Item 1 stacked a Simon Willison "reproduced the statement" link as if to prove the Fable 5 shutdown happened; Tom experienced it first-hand and it was widely reported). The drafter should not stack corroboration links to prove events the reader already knows are true.
4. **Dropped the `### Also worth noting` closing section** (folded its content into items and lost the standalone coda prior editions carry).
5. **H1 missing the `Issue NN:` prefix** that published editions use (e.g. `# Issue 06: ...`). Drafter wrote `# Own your AI supply...` instead of `# Issue 09: Own your AI supply...`.
6. **Missing the `---` horizontal rule before the closing CTA** that prior editions carry.
7. **Inconsistent model naming** across the brief and across sibling files: opener said "Gemma 4" while the body said "Gemma 4 12B"; after fixing the brief, the LinkedIn post still said "Gemma 4".
8. **Sparse dated-citation scaffolding** (`(Jun X)`) versus the prior Issue 08 convention; an external editorial review flagged it.

## Symptoms

- All five LLM gates returned PASS / NEEDS_REVISION_OPTIONAL on a draft still carrying defects 1-8.
- Tom corrected each defect manually across multiple turns (strong-affect corrections: "FFS", "I've said that before").
- Each fix was a re-draft + re-gate + amend cycle, multiplying the publish-day cost.

## Impact Assessment

- **Who is affected**: the Engineering Leader readership (JTBD-001 awareness, JTBD-003 evaluation) receives a lower-quality artefact when defects slip; Tom (technical-founder) pays repeated manual-correction cost every edition.
- **Frequency**: recurring across editions; this session evidenced 8 distinct defects in one edition.
- **Severity**: Medium. None is reader-fatal, but the cluster erodes the credibility signal (sourcing) and the format consistency readers rely on, and burns publish-day time.

## Root Cause Analysis

### Hypothesis

The five gates are LLM-judgement reviewers tuned for voice, analytical quality, reader-experience, accessibility, and cross-edition consistency. None checks deterministic structural invariants: Source-line redundancy, outlet-named-without-link, Also-section presence, H1 `Issue NN:` prefix, CTA horizontal rule, or cross-file model-name consistency. "Rubric PASS does not mean the artefact is good" (recurring structural gap, prior evidence P008 / P015) recurs here on the structural axis.

## Fix Strategy

- **Kind**: improve
- **Shape**: hook / script (deterministic structural-lint) + skill
- **Target**: a new deterministic newsletter structural-lint check (cheap, fast, deterministic) run as a pre-save / pre-publish gate, plus targeted edits to `.claude/skills/wr-newsletter/SKILL.md` step 11b + `assets/draft-template.md` to codify the invariants.
- **Lint checks (deterministic)**: (a) no `**Source.**` line when the item body already has >=1 markdown link; (b) no bare outlet name (Reuters|FT|NYT|WSJ|Bloomberg|Axios|Politico) outside a markdown link; (c) `### Also worth noting` section present; (d) H1 matches `^# Issue [0-9]+: `; (e) a `---` HR present immediately before the CTA block; (f) model-name strings consistent across brief + `.linkedin.md`.
- **Rationale**: deterministic checks are cheaper and more reliable than asking the LLM gates to enforce format; this is the same advisory-script + behavioural-bats + skill-edit triplet pattern used for briefing budgets (P099). Composes with P070 (draft-template discipline) and P081 (external-editorial-reviewer) rather than superseding them.
- **Evidence**: The Shift Issue 09 (commit b837c89), 8 distinct defects across one edition; external editorial review flagged the dated-citation sparseness.

## Related

- Retro 2026-06-15 (this session). Composes with P070 (draft-template three-deep-items discipline), P081 (external-editorial-reviewer subagent), P075 (drafter headings clarity), P079 (LinkedIn auto-share extras). Sibling defect P090 (CTA services-pitch recurrence) and P091 (ask-for-URLs gap) split out as distinct concerns.
