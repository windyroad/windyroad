# Problem 084: Extend per-date sub-directory layout to src/newsletters/drafts/<persona>/

**Status**: Open
**Reported**: 2026-06-03
**Priority**: 3 (Medium), Impact: 3 x Likelihood: 1 (deferred, re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: M (deferred, re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

Tom-pinned 2026-06-03 via `/wr-architect:review-decisions` follow-up on ADR-039's deferred sub-decision (drafts extension chose Option A: yes, extend now).

ADR-039 (Per-date sub-directory layout for published newsletter editions) shipped 2026-06-02 covering the published-side migration. The sub-decision "extend per-date subdir layout to drafts/?" was deferred at ADR-039 landing time (P078 Out-of-scope clause). Tom pinned Option A (extend now) on 2026-06-03 via the review-decisions sub-decision drain.

**Scope of follow-up work:**

1. **Sibling ADR for drafts scope.** ADR-039 is explicitly scoped to `src/newsletters/published/<persona>/` only (its Out-of-scope clause names ADR-011 + ADR-012 drafts-folder example paths as NOT amended). A sibling ADR carries the drafts layout decision with its own Considered Options, Decision Drivers, Confirmation, and Reassessment. The sibling ADR cites ADR-039 as the published-side precedent and ADR-074 (substance-confirm-before-build) as the Tom-direction-pinning record.

2. **Migration of any in-flight drafts.** When the sibling ADR lands, migrate any current draft folders (`src/newsletters/drafts/leader/`, `src/newsletters/drafts/developer/`) from the flat shape to per-date subdirs via `git mv` (preserves history, matching ADR-039 migration pattern).

3. **SKILL.md write-path updates.** `/wr-newsletter` SKILL.md step 11 (drafter) writes draft files to `<draft-folder>/<publication-date>.{md,prep.md,capture.md,reviews.md,linkedin.md,cover.svg,cover.png}`. Under the new layout these write paths become `<draft-folder>/<publication-date>/<publication-date>.{md,...}`. Update step 11 plus any sub-steps that write to the drafts surface. Step 16's "move to published" workflow ALREADY assumes per-date subdir target shape per ADR-039 amendment.

4. **Drafts edition-counting Glob.** `.claude/skills/wr-newsletter/personas/<persona>.md` carries an edition-counting Glob (`src/newsletters/drafts/<persona>/2026-*.md` or similar). Update to the per-date subdir shape (`src/newsletters/drafts/<persona>/*/*.md`) to match the canonical brief shape (basename equals subdir name equals publication date).

5. **Cross-ADR amendments.** ADR-011 and ADR-012 cite drafts-folder example paths (per ADR-039 Out-of-scope clause line). The sibling ADR amends these in lockstep, matching ADR-039's amendment pattern for ADR-019/026/038.

**Target layout** (mirroring ADR-039 published-side shape):

```
src/newsletters/drafts/leader/
  README.md
  2026-06-08/
    2026-06-08.md
    2026-06-08.prep.md
    2026-06-08.capture.md
    2026-06-08.reviews.md
    2026-06-08.linkedin.md
    2026-06-08.cover.svg
    2026-06-08.cover.png
```

**Rationale (Tom direction 2026-06-03)**: layout convention consistency between drafts/ and published/ outweighs the lower cognitive-load surface for drafts (drafts hold 1-3 editions in flight at any time). Reduces the "what shape does this folder use" cognitive switch when moving between drafting and reviewing published editions. Sets the per-date subdir convention earlier in the lifecycle so any new sibling-artifact class (e.g. future video or audio companion) defaults to the right shape from creation, not from the published-side move.

## Symptoms

(deferred to investigation)

## Workaround

(deferred to investigation. Current workaround: drafts/ stays flat; the published-side per-date subdir layout is the only place the new convention applies.)

## Impact Assessment

- **Who is affected**: (deferred to investigation. Direct: the agent running /wr-newsletter drafting. Indirect: Tom navigating drafts folders.)
- **Frequency**: (deferred to investigation. Per-drafting-session.)
- **Severity**: (deferred to investigation. Low day-to-day; one-time migration cost when the sibling ADR lands.)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] BLOCKED (interactive): Draft sibling ADR-040 for drafts-folder per-date sub-directory layout via /wr-architect:create-adr (full intake; substance is Tom-pinned 2026-06-03, but Considered Options, Decision Drivers, Confirmation, and `human-oversight` need full authoring plus Tom's oversight marker, which cannot be produced AFK). See "Architect review findings" below.
- [ ] Migrate the single in-flight draft via git mv (preserves history): `git mv src/newsletters/drafts/developer/2026-04-19.md src/newsletters/drafts/developer/2026-04-19/2026-04-19.md` (leader drafts is README-only, no leader file to migrate)
- [ ] Update /wr-newsletter SKILL.md drafter write paths to the per-date subdir shape (specific spots enumerated below)
- [ ] Update persona configs (leader.md, developer.md) drafts-side edition-counting Globs to the per-date subdir shape (lines 74-77 each)
- [ ] Cross-ADR amendments to ADR-011 (line 65), ADR-012 (line 59), and ADR-019 (line 52, NEW, see findings) drafts-folder example paths, in the same commit as the new sibling ADR plus migration
- [ ] Regenerate and stage docs/decisions/README.md compendium in the same commit (`wr-architect-generate-decisions-compendium`) per ADR-077
- [ ] Confirm new layout via spot-check that drafter writes resolve correctly and the next /wr-newsletter run produces files in the right shape

### Architect review findings (2026-06-27, /wr-itil:work-problems iter)

Architect gate (`wr-architect:agent`) returned ISSUES FOUND with two blocking items; JTBD gate returned PASS (internal substrate, no reader-facing surface, mirrors P078). Findings persisted here so the next pass is mechanical:

1. A separate sibling ADR is genuinely required (path A "amend ADR-039 in place" is REJECTED). ADR-039 deliberately scopes itself to the published side and defers the drafts scope to a separate sibling ADR in three places: line 80 ("the sibling ADR carries the drafts scope"), line 97 ("a separate ADR with its own amendment scope takes them up"), and Reassessment line 134. That deferral is a Tom-ratified scope boundary (`human-oversight: confirmed`); amending ADR-039 in place to absorb the drafts landing would be a substance change to a confirmed decision, not a mechanical application of it. Action: author ADR-040 (next free ID; compendium currently tops out at ADR-039), citing ADR-039 as the published-side precedent. ADR-039 stays as-is.

2. Missed lockstep amendment target: ADR-019 line 52. Neither this ticket nor ADR-039's Out-of-scope clause (which named only ADR-011 line 65 and ADR-012 line 59) caught that ADR-019 line 52 ALSO encodes flat drafts paths (`src/newsletters/drafts/leader/YYYY-MM-DD.capture.md` and `.../developer/YYYY-MM-DD.capture.md`). ADR-039 amended ADR-019's published-side move-workflow text but left its drafts-side capture path flat. Add ADR-019 line 52 to the lockstep set (`drafts/<persona>/YYYY-MM-DD.capture.md` becomes `drafts/<persona>/YYYY-MM-DD/YYYY-MM-DD.capture.md`). Architect confirmed via full-decisions sweep that ADR-011/012/019 are the ONLY ADRs carrying a flat drafts-path encoding; ADR-015/017/018/020/037 mention "drafts" only generically (no path); ADR-026/038 are published-side only.

Why this iter skipped the implementation (not a scope change, the ticket always scoped a create-adr sibling ADR at Investigation Task line 65): the migration, sibling ADR, and cross-ADR amendments are ONE related cluster per ADR-039 line 78, so the migration commit must NOT land before the sibling ADR exists. The sibling ADR needs `human-oversight` from a Tom-present session (`/wr-architect:create-adr` uses AskUserQuestion, unavailable in this AFK iter; authoring it AFK would fabricate an oversight marker on a born-unconfirmed ADR that Tom must drain anyway). Queued to the orchestrator's outstanding-questions for a Tom-present session.

Mechanical amendment map for the implementing pass (all in one commit):
- Migration: `git mv src/newsletters/drafts/developer/2026-04-19.md src/newsletters/drafts/developer/2026-04-19/2026-04-19.md`
- `.claude/skills/wr-newsletter/SKILL.md`: line 69 `<draft-folder>` binding (add a per-date-subdir note mirroring line 70's published note, so all `<draft-folder>/<publication-date>.X` references resolve to `<draft-folder>/<publication-date>/<publication-date>.X`); line 96 prep-locate glob `<draft-folder>/*.prep.md` becomes `<draft-folder>/*/*.prep.md`; line 407 edition-count drafts glob `<draft-folder>/<YYYY-MM-DD>.md` (flat) becomes `<draft-folder>/*/<YYYY-MM-DD>.md`; line 1161 step-17 move source (drafts source now in the per-date subdir); line 3 description save path.
- `.claude/skills/wr-newsletter/personas/{leader,developer}.md` lines 74-77: drafts glob becomes `src/newsletters/drafts/<persona>/*/<YYYY-MM-DD>.md`; drop the "flat layout for drafts" qualifier.
- READMEs: `src/newsletters/drafts/README.md` (Format and Workflow sections), `drafts/leader/README.md`, `drafts/developer/README.md`, per-date-subdir filename/move notes.
- ADRs: 011 line 65, 012 line 59, 019 line 52; new ADR-040; regenerate docs/decisions/README.md.

Advisory (no action): ADR-074 is not on disk locally (the "ADR-074 guard satisfied" claim resolves to ADR-039 line 80, which IS on disk and confirmed). ADR-014 on disk is "Wardley mapping", not the single-commit related-cluster carve-out, so that cross-ref in ADR-039 is pre-existing and out of scope here.

I13 note: the propose-fix RFC-trace gate (I13) fired `no-rfc-trace` for P084, a known false positive per P104 (no RFC tier in this repo). No RFC auto-created; legacy direct-implementation path applies per P070/P103.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: interactive sibling-ADR authoring. Substance is confirmed by Tom direction-set 2026-06-03, but the ADR-040 artefact needs a Tom-present session (`/wr-architect:create-adr` full intake plus `human-oversight` marker) before the one-commit migration cluster can land (architect ruling 2026-06-27, see Root Cause Analysis). Cannot be authored AFK.
- **Composes with**: P078 (newsletters published folder per-date subdir layout, ADR-039 published-side precedent); ADR-039 (the published-side ADR this work mirrors on the drafts side).

## Related

- ADR-039 (`docs/decisions/039-per-date-subdir-layout-for-published-newsletter-editions.proposed.md`). Published-side precedent; drafts-side sibling ADR mirrors its shape and amendment pattern.
- P078 (`docs/problems/verifying/078-newsletters-published-folder-needs-dated-subdirs.md`). Parent ticket for the published-side migration; this P084 carries the deferred drafts-extension scope.
- ADR-011 (`docs/decisions/011-ai-brief-orchestration-via-claude-code.proposed.md`). Carries a drafts-folder example path that needs amending in lockstep.
- ADR-012 (`docs/decisions/012-mandatory-voice-and-risk-review-gates-for-ai-generated-content.proposed.md`). Carries a drafts-folder example path that needs amending in lockstep.
- ADR-074 (`docs/decisions/074-confirm-decisions-substance-before-building-dependent-work.proposed.md`). Tom-direction-pin record at 2026-06-03 satisfies the substance-confirm-before-build guard for this work.

(captured via /wr-itil:capture-problem on 2026-06-03; substance confirmed by Tom 2026-06-03 via /wr-architect:review-decisions sub-decision drain on ADR-039)

## Duplicate-check matches (capture-time, conservative title-only grep)

- P076 (`docs/problems/open/076-newsletter-pipeline-drafts-body-before-heading.md`): keyword overlap on "drafts"; different concern (H1-first composition order, not folder layout). NOT a duplicate.
- P078 (`docs/problems/verifying/078-newsletters-published-folder-needs-dated-subdirs.md`): keyword overlap on "subdirs"; P084 is the deferred drafts-side sibling per ADR-039 Out-of-scope clause. Composes-with relationship, NOT a duplicate.
