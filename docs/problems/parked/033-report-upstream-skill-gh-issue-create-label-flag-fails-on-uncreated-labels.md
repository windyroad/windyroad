# Problem 033: report-upstream SKILL.md Step 5 example uses --label flag that fails when upstream repo hasn't pre-created the label

**Status**: Parked
**Reported**: 2026-04-27
**Origin**: internal
**Priority**: 12 (High). Impact: Moderate (3) x Likelihood: Likely (4)
**Effort**: S
**WSJF**: 0 (parked, excluded from ranking)

## Description

`report-upstream` SKILL.md Step 5 example invocation includes:

```bash
gh issue create \
  --repo "${UPSTREAM_OWNER_REPO}" \
  --title "${TITLE_PREFIXED_BY_TEMPLATE}" \
  --body "${FILLED_BODY}" \
  --label "${MATCHED_TEMPLATE_LABEL_IF_ANY}"
```

GitHub's `gh issue create --label` rejects unknown labels with `could not add label: 'X' not found`. Issue templates with `labels:` frontmatter (the canonical `problem-report.yml` shape ships `labels: ["problem", "needs-triage"]`) auto-apply the labels on form submit, so the CLI flag is redundant. When the upstream repo hasn't pre-created the label name in repo settings (default for new repos), every `report-upstream` invocation fails first try and self-corrects only after the operator drops the flag.

The skill's example is therefore wrong on two grounds: redundant when the upstream is configured correctly, and a hard fail when it isn't.

## Symptoms

- 8-ticket upstream batch (P021-P031) on 2026-04-27, target `windyroad/agent-plugins`. First invocation exited 1 with the `could not add label: '...' not found` error. Subsequent 7 invocations omitted `--label` and succeeded; the upstream `problem-report.yml` template's `labels:` frontmatter applied the `problem` and `needs-triage` labels on submit anyway.
- Reproduces on any new GitHub repository that has not pre-created the label names referenced by its issue templates.
- Reproduces on any project that adopts `@windyroad/itil` and uses `/wr-itil:report-upstream` against an upstream that ships a `problem-report.yml` template (the standard shape).

## Workaround

Drop the `--label` flag from the `gh issue create` invocation. The upstream `problem-report.yml` template's frontmatter `labels:` field auto-applies the labels on submit. The flag adds no value when the template carries its own labels and is the failure mode when the upstream repo hasn't pre-created them.

## Impact Assessment

- **Who is affected**: every operator (or AFK orchestrator) running `/wr-itil:report-upstream` against an upstream whose label names haven't been pre-created. Affects first-run scenarios for newly-scaffolded upstreams, including any repo recently bootstrapped via `/wr-itil:scaffold-intake`.
- **Frequency**: Likely. Every `report-upstream` invocation against a fresh upstream fails first try; the rate of "fresh upstream" invocations grows as `scaffold-intake` adoption grows.
- **Severity**: Moderate. The failure is loud and recoverable (operator drops the flag and retries), but it costs an extra round-trip and a wasted `gh` call. Worse, AFK orchestrators see an exit-1 from the skill and may halt the loop unless the SKILL.md handles the retry path.
- **Analytics**: count `gh issue create` invocations from the report-upstream skill that exit 1 with `could not add label` text in stderr.

## Root Cause Analysis

### Root Cause

The SKILL.md Step 5 example was authored before the `problem-report.yml` template's frontmatter `labels:` field was finalised. At the time, the operator passed labels via CLI flag because the templates did not auto-apply them. Once the canonical `problem-report.yml` shape adopted `labels: ["problem", "needs-triage"]` (and the broader `@windyroad/itil` intake pattern adopted frontmatter labels uniformly), the flag became redundant. The SKILL.md was not updated to match.

### Fix Strategy

Two options for the upstream SKILL.md amendment:

1. **Drop the flag entirely** (recommended). Templates handle labels via frontmatter; the CLI flag is redundant when the template is configured correctly. Mirrors the actual successful shape used by 7 of the 8 invocations in the 2026-04-27 batch.

2. **Guard with label-exists pre-flight check**. Only pass `--label` if the label already exists in repo settings (pre-flight via `gh label list --repo "$UPSTREAM_OWNER_REPO" --json name --jq '.[].name'` and grep). More defensive but adds complexity for negligible upside.

Option 1 is preferred because it matches the working pattern actually exercised in production and removes a redundant flag.

### Investigation Tasks

- [ ] Patch upstream `packages/itil/skills/report-upstream/SKILL.md` Step 5 to remove the `--label` line from the example invocation.
- [ ] Update Step 3 prose to clarify that the matched template's frontmatter `labels:` field is authoritative; the skill does not need to pass `--label`.
- [ ] Remove the `MATCHED_TEMPLATE_LABEL_IF_ANY` capture from Step 3's template-discovery output (no longer used downstream).
- [ ] Add a regression note in the SKILL.md References section: *"Operators should NOT pass `--label` when filing via `gh issue create` because the matched template's frontmatter labels are authoritative; passing `--label` against a repo that has not pre-created the label name fails with `could not add label: 'X' not found`."*
- [ ] Sanity-check whether any other SKILL.md (e.g. `manage-problem`, `scaffold-intake`) demonstrates `--label` on `gh issue create` and update those too.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

- packages/itil/skills/report-upstream/SKILL.md (Step 5 example invocation)
- docs/decisions/024-cross-project-problem-reporting-contract.proposed.md (ADR governing the skill)
- docs/decisions/033-report-upstream-classifier-problem-first.proposed.md (problem-first classifier)
- 2026-04-27 upstream-batch retro session
- **Reported upstream**: https://github.com/windyroad/agent-plugins/issues/87 (2026-04-27)

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/87
- **Reported**: 2026-04-27
- **Template used**: problem-report.yml
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes, upstream issue body contains the local ticket reference

## Parked

- **Reason**: upstream-blocked. The genuine fix lives in `skills/report-upstream/SKILL.md` Step 5 example invocation inside the `windyroad/agent-plugins` `wr-itil` plugin (consumed via `~/.claude/plugins/cache/windyroad/wr-itil/<version>/skills/report-upstream/SKILL.md`). A marketplace consumer cannot edit the cached SKILL.md without losing the change on next plugin update, so the only durable fix is upstream. The workaround (drop the `--label` flag at invocation time) is operator discipline rather than codified policy and cannot be enforced locally because the dispatch path is the cached SKILL.md itself.
- **Verified persistence**: latest cached plugin version `0.38.0` still ships `--label "${MATCHED_TEMPLATE_LABEL_IF_ANY}"` at `skills/report-upstream/SKILL.md` line 405 (verified 2026-05-30 by reading the cached file). No amended example, no guard-with-pre-flight-check variant, no Step 3 prose update clarifying that template frontmatter labels are authoritative.
- **Upstream issue status**: `windyroad/agent-plugins#87` is OPEN as of 2026-05-30 (last updated 2026-05-15). Tracked upstream as `docs/problems/open/207-...md` (P207, classified safe-and-valid with safe-low-fix-risk via `/wr-itil:review-problems` Step 4.5e). No labels applied; no resolution committed upstream yet.
- **Un-park trigger**: a new `wr-itil` plugin release lands in `~/.claude/plugins/cache/windyroad/wr-itil/` whose `skills/report-upstream/SKILL.md` Step 5 either (a) drops the `--label` line from the example invocation (Option 1 from the Fix Strategy section above, recommended), or (b) ships an alternative guard such as a `gh label list`-based pre-flight check (Option 2). Verify by re-reading the SKILL.md in the new cache version. Close P033 once a subsequent `/wr-itil:report-upstream` invocation against a fresh upstream (one whose label names have not been pre-created) succeeds first try with the upgraded SKILL.md.
- **Local impact while parked**: operators (and AFK orchestrators) running `/wr-itil:report-upstream` against a fresh upstream must drop the `--label` flag manually on the first failure, or omit it from the outset. The workaround is loud (first-try exit-1 with `could not add label: 'X' not found`) and self-corrects after the operator drops the flag, but AFK orchestrators may need to recognise the failure mode and retry without the flag rather than halting the loop on first failure.
- **Composes with**: P022 (parked 2026-05-30, same upstream `windyroad/agent-plugins` `wr-itil` plugin surface, also upstream-blocked); P027 (parked 2026-05-30, same plugin upstream); P031 (parked 2026-05-02, same `wr-itil` plugin upstream surface).
- **Date parked**: 2026-05-30
