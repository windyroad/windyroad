# Problem 062: Newsletter persona-config edition-count rule globs sibling files and undercounts editions

**Status**: Open
**Reported**: 2026-05-15
**Priority**: 3 (Medium). Impact: 3 x Likelihood: 3 (deferred, re-rate at next /wr-itil:review-problems)
**Effort**: S (deferred, re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

The leader persona config `.claude/skills/wr-newsletter/personas/leader.md` (and presumably `developer.md`) carries the rule:

> "Count `src/newsletters/published/leader/*.md` plus the current draft."

The glob matches all `.md` files in that folder, including the per-edition sibling files written under ADR-026 (`.linkedin.md`, `.reviews.md`, `.capture.md`) plus the folder's `README.md`. Each matched file is treated as one edition.

Witnessed 2026-05-15: 3 published briefs (2026-04-17, 2026-04-24, 2026-05-01) plus their sibling files plus README.md returned 8 matched files. The drafter mis-numbered the current edition as Issue 9. Tom caught the error mid-session ("are we really up to issue 9???"); correction required updating brief frontmatter, capture transcript, brief cover-image alt text, and re-rendering the cover PNG/SVG with the corrected ISSUE 05 subtitle. Correct edition was Issue 5 (3 published briefs + 2026-05-08 draft as Issue 4 + this as Issue 5).

The correct rule is to increment the most recent edition's frontmatter `edition:` value, scanning across both `published/<persona>/` AND `drafts/<persona>/`.

## Symptoms

- Frontmatter `edition: N` set wrong on first draft save.
- Cover image subtitle baked with wrong "ISSUE 0N" until re-rendered.
- Capture transcript carries wrong `edition: N`.
- Discovery requires the user catching it; the drafter has no internal cross-check.

## Workaround

Manually inspect the most recent edition's frontmatter `edition:` value and increment by 1. Update brief frontmatter, capture transcript, and re-render cover.

## Impact Assessment

- **Who is affected**: Tom (newsletter author); future runs of /wr-newsletter for either persona.
- **Frequency**: every edition until the rule is corrected. Already drift-prone (3 briefs vs many sibling/index files).
- **Severity**: Medium. Caught by Tom this session, but a future unattended run would publish with wrong issue number to LinkedIn (credibility-degrading defect on the brand-anchored issue-numbering used for back-issue findability).
- **Analytics**: deferred to investigation.

## Root Cause Analysis

### Hypothesis

The persona config was authored when the published folder contained only brief `.md` files. The ADR-026 sibling-file convention landed later and changed the file population without updating the dependent edition-count rule.

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [x] Read both persona configs (`leader.md`, `developer.md`) and confirm both carry the broken rule. (2026-05-30: confirmed identical broken `Count <published>/*.md plus the current draft` rule in both files)
- [x] Replace the glob-based rule with "increment the most recent edition's frontmatter `edition:` value across published + drafts". (2026-05-30: applied to both persona configs; scan filter narrowed to `YYYY-MM-DD.md` canonical brief shape so ADR-026 sibling files and `README.md` are excluded by construction)
- [x] Add a step to the /wr-newsletter SKILL.md drafter step to assert the computed edition number is exactly one greater than the most recent prior edition's `edition:` value; fail fast if not. (2026-05-30: SKILL.md step 11 rewritten to defer to persona-config rule, scan across published + drafts with `YYYY-MM-DD.md` filter, assert max+1 invariant and surface to Tom on mismatch rather than publishing wrong issue number)

### Resolution

Fix landed 2026-05-30 across three files:
- `.claude/skills/wr-newsletter/personas/leader.md` (Edition counting section)
- `.claude/skills/wr-newsletter/personas/developer.md` (Edition counting section)
- `.claude/skills/wr-newsletter/SKILL.md` step 11 first paragraph

Rule shape: read frontmatter `edition:` value from highest-numbered prior edition across BOTH `published/<persona>/` and `drafts/<persona>/`, take max + 1. Scan filtered to canonical `YYYY-MM-DD.md` filenames (eight digits and dashes, then `.md`) so ADR-026 sibling files (`.linkedin.md`, `.reviews.md`, `.capture.md`) and `README.md` are excluded by construction rather than by enumerated negative-list.

SKILL.md step 11 also gained an explicit assert-then-abort safeguard: if the computed edition is not exactly max+1, surface to Tom rather than publishing with a wrong issue number.

Verification: deferred to next live /wr-newsletter run (transition to Verifying). The next leader edition should compute as Issue 6 (or whatever max(published.edition, draft.edition)+1 reveals) without manual correction.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: ADR-026 (sibling-file convention is the upstream change that broke the count).

## Related

- /wr-newsletter SKILL.md Step 11 "Draft the brief" (edition counting)
- .claude/skills/wr-newsletter/personas/leader.md (rule location)
- ADR-026 (sibling-file convention)
- Captured via /wr-retrospective:run-retro on 2026-05-15 session.
