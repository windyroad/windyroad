# Problem 060: `capture-adr` SKILL.md template frontmatter sentinel carries U+2014 that no-em-dash hook blocks

**Status**: Parked
**Reported**: 2026-05-14
**Origin**: internal
**Priority**: 8 (Medium). Impact: Minor (2) x Likelihood: Likely (4)
**Effort**: S
**WSJF**: 0 (parked, excluded from ranking)
**Type**: technical

## Description

`packages/architect/skills/capture-adr/SKILL.md` step 3 template carries the literal frontmatter sentinel `decision-makers: [unspecified ... fill at canonical review]` with a U+2014 long-dash. Adopter projects that ship the no-em-dash Edit/Write PreToolUse hook (this project's `.claude/hooks/no-em-dash.sh` and `.claude/hooks/no-em-dash-bash.sh`, originally documented in P025) block the new ADR write on the first attempt because the rendered file inherits the long-dash from the template literal.

Reproduced 2026-05-13 (windyroad project, ADR-029 capture): first Write of `docs/decisions/029-out-of-band-source-fetch-cache-for-newsletter-playwright-fallback.proposed.md` blocked with the standard long-dash content-rejection message; second Write with long-dashes substituted for commas / colons / parentheses succeeded. The substitution effort was small (a few tens of seconds) but the failed-first-write is an avoidable round-trip.

The same template also carries long-dashes in the deferred-placeholder strings (the `Option A (chosen)` numbered options line and the `deferred ... canonical review` parenthetical pattern). Each is a hook trigger in adopter projects.

## Symptoms

- First Write of any new ADR via `/wr-architect:capture-adr` blocked on adopters with the no-em-dash hook.
- Agent must rewrite the entire skeleton in a second Write substituting separators.
- The skill's literal pointer string `(deferred to /wr-architect:create-adr canonical review)` (used for canonical-expansion auto-detection) IS long-dash-free; only the template prose surrounding it carries the U+2014.

## Workaround

Pre-substitute U+2014 to commas / colons / parentheses when authoring the second Write. The semantics of the deferred-placeholder pattern are preserved.

## Impact Assessment

- **Who is affected**: every adopter project that ships both `wr-architect:capture-adr` AND a no-em-dash Edit/Write hook. The windyroad project is the witness.
- **Frequency**: every ADR capture via `/wr-architect:capture-adr` until upstream fix lands.
- **Severity**: Minor. Failed-first-write costs ~30s of agent context per capture. Not a release-path or pipeline blocker.
- **Analytics**: N/A.

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems.
- [ ] Decide whether to report upstream as a `wr-architect:capture-adr` SKILL.md fix or as a per-project hook whitelist extension.
- [ ] If upstream fix: substitute U+2014 in `packages/architect/skills/capture-adr/SKILL.md` template literals; canonical-expansion auto-detection string `(deferred to /wr-architect:create-adr canonical review)` is already long-dash-free so no detection-string contract drift.
- [ ] If per-project whitelist: extend `.claude/hooks/no-em-dash.sh` whitelist with a contractual marker for the capture-adr template sentinel (similar shape to P025's existing `Upstream report pending` marker exemption).

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P025 (no-em-dash hook origin), P030 (work-problems SKILL marker long-dash whitelist removal, sibling family).

## Related

Captured via /wr-itil:capture-problem during /wr-retrospective:run-retro on 2026-05-14 after P014/P053/P059 work-problem session. Live evidence: 2026-05-13 ADR-029 first-write block plus second-write rewrite cycle. Upstream candidate: windyroad/agent-plugins `wr-architect` plugin.

- **Upstream report pending** — external dependency identified; invoke /wr-itil:report-upstream when ready

## Parked

- **Reason**: upstream-blocked. The fix site `packages/architect/skills/capture-adr/SKILL.md` does NOT exist in this project's working tree; the template literal lives in the upstream `wr-architect` plugin at `~/.claude/plugins/cache/windyroad/wr-architect/<version>/skills/capture-adr/SKILL.md`, inside the `windyroad/agent-plugins` repo. This project is a downstream marketplace consumer of `@windyroad/wr-architect`. A consumer cannot edit the cached SKILL.md without losing the change on next plugin update, so the only durable fix is upstream. The local whitelist option (extend `.claude/hooks/no-em-dash.sh` and `.claude/hooks/no-em-dash-bash.sh` WHITELIST_LINE entries with the capture-adr template sentinels) is a band-aid that would orphan once upstream substitutes the U+2014 characters; pursuing it locally would also propagate whitelist debt across every adopter that ships the no-em-dash hook style.
- **Verified persistence**: latest cached plugin version `0.12.1` still ships the U+2014 template literals at four sites in `skills/capture-adr/SKILL.md`: line 76 frontmatter sentinel (`decision-makers: [unspecified ... fill at canonical review]`), line 96 first considered-options entry (`1. **Option A (chosen)** ... <summary>`), line 97 second considered-options entry (`2. (deferred ... see /wr-architect:create-adr canonical review)`), and line 129 reassessment-criteria placeholder (`(deferred to /wr-architect:create-adr canonical review ... default reassessment-date 3 months from capture)`). All four are part of the template literal that gets written verbatim into new `.proposed.md` ADR files. Verified 2026-05-30 by `grep -n` on the cached file.
- **Upstream issue status**: no issue filed yet. `gh issue list -R windyroad/agent-plugins --search "capture-adr em-dash"`, `--search "capture-adr unspecified canonical review"`, and `--search "wr-architect capture-adr template"` on 2026-05-30 all returned empty. Ticket body's standing "Upstream report pending" note remains the current truth. AFK iter-12 discipline matches iters 3-9: park-only, defer the `/wr-itil:report-upstream` invocation to a batched filing pass at a session boundary rather than firing it in-loop.
- **Un-park trigger**: a new `wr-architect` plugin release lands in `~/.claude/plugins/cache/windyroad/wr-architect/` whose `skills/capture-adr/SKILL.md` template substitutes the four U+2014 characters with commas, colons, or parentheses. The canonical-expansion auto-detection string `(deferred to /wr-architect:create-adr canonical review)` is already long-dash-free per the ticket's Symptoms section, so the template substitution does not require changing the detection contract. Verify by re-reading the cached file in the new version, then capturing a new ADR via `/wr-architect:capture-adr` in this project; the first Write should succeed without the no-em-dash hook deny. Close P060 once a capture-adr invocation lands an ADR file on the first Write under the upgraded template.
- **Local impact while parked**: the existing Workaround (pre-substitute U+2014 to commas / colons / parentheses on the second Write attempt) remains the operating contract. Cost per capture is around 30 seconds of agent context for the rewrite cycle, not a release-path or pipeline blocker. AFK iters that hit the deny continue to use the second-Write substitution pattern.
- **Composes with**: P021 (parked 2026-05-30, upstream `windyroad/agent-plugins` `wr-architect` plugin hook); P022 (parked 2026-05-30, upstream `wr-architect` plugin hook, sibling parent plugin); P025 (closed 2026-05-30, local no-em-dash hook origin, sibling family); P027 (parked 2026-05-30, upstream `wr-itil` plugin SKILL.md); P030 (open, work-problems SKILL.md long-dash whitelist removal, sibling family); P033 (parked 2026-05-30, upstream `wr-itil` plugin SKILL.md); P042 (parked 2026-05-30, upstream `wr-jtbd` plugin hook); P047 (parked 2026-05-30, upstream `wr-risk-scorer` plugin SKILL.md); P049 (parked 2026-05-30, upstream `wr-itil` plugin script). All eight 2026-05-30-parked share the marketplace-consumer-cannot-edit-cached-plugin pattern.
- **Date parked**: 2026-05-30
