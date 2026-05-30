# Problem 060: `capture-adr` SKILL.md template frontmatter sentinel carries U+2014 that no-em-dash hook blocks

**Status**: Open
**Reported**: 2026-05-14
**Origin**: internal
**Priority**: 8 (Medium). Impact: Minor (2) x Likelihood: Likely (4)
**Effort**: S
**WSJF**: 8 = (8 x 1) / 1
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
