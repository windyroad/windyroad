---
status: "proposed"
first-released:
date: 2026-05-11
decision-makers: [Tom Howard, Claude]
consulted: [wr-architect agent, wr-jtbd agent]
informed: []
---

# CI-status check in push:watch and release:watch

## Context and Problem Statement

P012 identifies that the upstream `wr-risk-scorer` plugin's `git-push-gate.sh` scores a leading-indicator risk score on every push and release attempt but never queries the lagging signal of "did the last actual CI run pass?" A push that scores low risk can still proceed onto a red master, because the gate has no `gh run list` check.

The fix was reported upstream at `windyroad/agent-plugins#86` on 2026-04-27. The issue is OPEN with no comments and no movement after 2 weeks. The risk persists in this project meanwhile: every push or release on windyroad has the opportunity to ship a regression on top of an already-broken master.

The windyroad project owns wrapper scripts `scripts/push-watch.sh` and `scripts/release-watch.sh` that mediate every push and release. ADR-021 ("Auto-resolve stale dependencies in push:watch") establishes the precedent for adding project-local defence-in-depth at this wrapper layer when an upstream gate has a gap. The same shape applies to the CI-status gap: a windyroad-local check at the wrapper layer closes the surface in days rather than waiting on upstream that may take months.

## Decision Drivers

- The upstream gate is single-source-of-truth and the right long-term home, but it is not moving and we cannot block on it.
- ADR-021 has already established that wrapper-layer extensions are a valid project-specific surface (ADR-009 lists project-specific hooks under "What stays project-specific").
- The check is most valuable closest to the action. `npm run push:watch` and `npm run release:watch` are where every push and release passes through, so a check inside the wrapper catches every attempt.
- The bypass-marker pattern from ADR-008 (`reducing-push`, `incident-release`, `red-ci-acknowledged`) is a known shape that fits the human-acknowledged-override use case here.
- Defence-in-depth is acceptable: if upstream lands, the two gates coexist or we retire the wrapper version cleanly.

## Considered Options

1. **Wait for upstream `windyroad/agent-plugins#86`**: block P012 on upstream movement. Con: 2-week-zero-comment signal predicts months of wait; meanwhile risk continues on every release.
2. **Wrapper-only defence-in-depth via a shared `scripts/ci-status-check.sh` called from both wrappers** (chosen). Pro: closes the surface fast, reduces duplication between push-watch.sh and release-watch.sh, retires cleanly when upstream lands.
3. **Inline check directly in each wrapper**: same logic but duplicated across both scripts. Con: future drift between the two implementations; harder to retire on upstream landing.
4. **`WR_AFK=1` env-gated wrapper check**: only fires when AFK orchestrator runs. Con: misses the interactive surface where the same red-master push can occur.
5. **Move the check into a separate PreToolUse hook in `.claude/hooks/`**: cross-cuts more cleanly but duplicates the upstream plugin's surface and re-introduces the layering problem of multiple gates targeting the same Bash command.

## Decision Outcome

Chosen option: **2. Wrapper-only defence-in-depth via a shared `scripts/ci-status-check.sh`**.

Rationale: closes the P012 risk surface immediately without fabricating upstream code (per ADR-009's project-specific hook carve-out and ADR-021's wrapper-extension precedent). The shared script avoids duplication between the two wrappers; both call `bash scripts/ci-status-check.sh <branch>` and either get a clean exit or a block message with acknowledged-override instructions. Retirement on upstream landing is one-step: delete the script and the call sites.

### Implementation shape

`scripts/ci-status-check.sh` accepts a branch argument and:

1. Honours a single-shot bypass marker `/tmp/wr-push-watch-${CLAUDE_SESSION_ID:-no-session}/red-ci-acknowledged` (deletes on use, then exits 0).
2. Calls `gh run list --branch "$BRANCH" --limit 1 --json conclusion --jq '.[0].conclusion // ""'` to get the most recent CI conclusion on the branch.
3. Exits 0 on anything except `failure` (including empty result on `gh` transient failure: non-fatal degradation per ADR-021's "Robustness shape").
4. On `failure`: prints a clear block message with the exact `mkdir -p ${RDIR} && touch ${RDIR}/red-ci-acknowledged` command the user can run to acknowledge and re-attempt. Exits 1.

`scripts/push-watch.sh` calls `bash scripts/ci-status-check.sh "$(git branch --show-current)"` after the dry-aged-deps refresh and before `git push`.

`scripts/release-watch.sh` calls `bash scripts/ci-status-check.sh master` after locating the open release PR and before `gh pr merge`. The branch argument is `master` (not `publish`, the PR base) because the release PR carries diff sourced from `master`; the CI-relevant signal is the most recent main-pipeline run on `master`.

### Bypass-marker namespace

The marker lives at `/tmp/wr-push-watch-${CLAUDE_SESSION_ID:-no-session}/red-ci-acknowledged`. The wrapper owns this directory exclusively; it does NOT reach into the upstream plugin's `/tmp/risk-${SESSION_ID}/` namespace. The wr-risk-scorer plugin owns its score-file directory per ADR-008; using a sibling directory keeps the two surfaces independent and makes future cleanup trivial.

### Interaction with existing gates

- The upstream `git-push-gate.sh` PreToolUse hook still fires on `git push` (inside `npm run push:watch`) and on `gh pr merge` (which is blocked, redirected to `npm run release:watch`). It scores risk; this wrapper check verifies CI status. The two are complementary, not duplicative: risk score is a leading indicator on the diff being shipped; CI status is a lagging indicator on the diff already on the branch.
- The wrapper check runs before `git push` and `gh pr merge` fire, so it is upstream of the plugin gate in the call sequence. A red-CI block here means the plugin gate never runs. The user fixes CI or acknowledges, then re-runs.

### Robustness

- `gh` failures degrade non-fatally to "no block": same shape as ADR-021's `dry-aged-deps` wrapper. Better to let an attempt through on transient `gh` error than to deadlock the wrapper on network noise. The block surface is narrowly "the CI run is definitively `failure`"; everything else (success, in-progress, cancelled, network error, no runs found) does not block.
- The check runs in under 1s when `gh` is responsive (single API call, single-row response).

### TDD interaction (ADR-006)

ADR-006 enforces TDD on implementation files in `src/`. Shell scripts in `scripts/` are infrastructure, not application code, and are exempt from the TDD state machine, the same exemption ADR-021 applied. No TDD interaction.

### JTBD interaction

JTBD review (2026-05-11) confirmed the change is operator/infrastructure scope; no user-facing persona surface is touched. Indirectly supports JTBD-001/002/003 by protecting the integrity of `windyroad.com.au` from broken-master deploys.

## Consequences

- **Good**: P012's CI-status risk surface closes immediately, defence-in-depth on top of the upstream plugin gate.
- **Good**: Shared script keeps push-watch.sh and release-watch.sh in sync; future drift risk minimised.
- **Good**: Bypass marker namespace is wrapper-owned; no layering violation against the upstream plugin's directory.
- **Good**: Non-fatal `gh` failure handling matches ADR-021's robustness pattern.
- **Good**: Retirement on upstream landing is one-step (delete `scripts/ci-status-check.sh` and the two call sites).
- **Neutral**: Interactive `npm run push:watch` and `npm run release:watch` invocations now block on red CI. This is the intended behaviour; the bypass marker handles the rare legitimate-override case.
- **Bad**: Defence-in-depth at the wrapper layer means the check is bypassable by directly invoking `git push` or `gh pr merge`, but those are already blocked by the upstream plugin gate (which redirects to the wrappers). The composition holds.

## Confirmation

- `scripts/ci-status-check.sh` exists, is executable, and accepts a branch argument.
- `scripts/push-watch.sh` invokes `bash scripts/ci-status-check.sh "$(git branch --show-current)"` after the dry-aged-deps refresh and before `git push`.
- `scripts/release-watch.sh` invokes `bash scripts/ci-status-check.sh master` after locating the open release PR and before `gh pr merge`.
- A red CI conclusion blocks the wrapper with a clear acknowledge-marker message; a single-shot `red-ci-acknowledged` marker in `/tmp/wr-push-watch-${SESSION_ID}/` allows override.
- A `gh` failure degrades non-fatally; the wrapper proceeds.

## Reassessment Criteria

- Upstream `windyroad/agent-plugins#86` lands a CI-status check in `git-push-gate.sh`. Retire `scripts/ci-status-check.sh` and the call sites; either delete or downgrade to a no-op on upstream presence detection.
- A second project (bbstats, addressr) needs the same surface: promote the script into a sharable form (plugin or shared library) rather than copy-paste.
- A pattern emerges where the wrapper check fires false positives (e.g., infrastructure CI runs flagged as `failure` that should not block release). Revisit branch-scope or filter on workflow name.
- The bypass-marker shape becomes ambiguous (e.g., second class of wrapper-side block needs its own marker). Document the wrapper's own marker registry instead of growing organically.

## Related

- ADR-008 (Action-specific pipeline risk management): defines the bypass-marker pattern and the upstream plugin's gate surface.
- ADR-009 (Adopt plugin marketplace): lists project-specific hooks as the carve-out under which this wrapper extension is valid.
- ADR-014 (Wardley mapping as strategic lens): strategic framing for defence-in-depth on top of upstream commodity tooling.
- ADR-021 (Auto-resolve stale deps in push:watch): direct precedent for wrapper-as-defence-in-depth shape.
- P012 (`docs/problems/012-no-ship-gate-on-push-publish-deploy.known-error.md`): driver problem.
- Upstream issue: https://github.com/windyroad/agent-plugins/issues/86 (2026-04-27, OPEN as of 2026-05-11).
