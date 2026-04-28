---
status: "proposed"
first-released:
date: 2026-04-26
decision-makers: [Tom Howard, Claude]
consulted: [wr-architect agent]
informed: []
---

# Scheduled stale-deps refresh PR

## Context and Problem Statement

`scripts/push-watch.sh` runs `npx dry-aged-deps --update --yes` pre-emptively before every push (per ADR-021) so the local pre-push gate does not halt AFK orchestrator runs. That is the **reactive** surface: it bypasses the gate at push time. The **proactive** surface, refreshing dependencies on a known cadence so staleness never accumulates enough to gate in the first place, is missing. P020 (`docs/problems/020-no-dependency-update-cadence-afk-loop-halts-on-stale-dep-gate.open.md`) records the gap and ties it to a real AFK halt.

Without a cadence, every AFK session that runs after a long gap is a coin flip: either deps are fresh and the loop drains, or they are stale and the loop halts at push time. ADR-021's reactive bypass closes one half of the loop (the auto-resolvable subset), but it does not address the underlying drift. Major-version bumps and other non-auto-resolvable cases stay stale and still halt the gate; only a regular human or scheduled refresh can keep those moving.

The cadence surface is GitHub Actions (cron). Putting it on the origin (CI) rather than locally means it fires regardless of whether the user is online, regardless of whether anyone runs `push:watch`, and regardless of which machine is checked out. A PR-based shape (rather than a direct commit) keeps the existing main-pipeline review trail intact: the main-pipeline runs on the PR, the existing accessibility / smoke-test / build gates fire, and the user merges when satisfied.

## Decision Drivers

- AFK orchestrator drains require deps freshness; ADR-021 covers the auto-resolvable last-mile bypass but not the cadence that prevents accumulation.
- A scheduled origin-side action fires independently of any local invocation and keeps drift bounded.
- A PR shape preserves the main-pipeline review trail, which is the project's existing trust surface for changes landing on `master`.
- The action authors commits via a bot identity (`peter-evans/create-pull-request` runs as `github-actions[bot]` by default). This is a new author site on `master`-bound PRs and warrants explicit recording.
- ADR-008's "Risk-reducing bypass" principle applies the same way it does in ADR-021: a stale-deps refresh shrinks a downstream-risk gap and is bounded to within `dry-aged-deps`'s configured tolerance.
- The windyroad package is `private: true` (`package.json:7`), so root deps refreshes do not affect any published API surface and do not require a changeset. Plugin packages in `packages/` (when present in this project) ship through a different flow and are not in scope for this workflow.

## Considered Options

1. **GitHub Actions cron workflow that opens a PR when manifests change** (chosen).
2. **Cron workflow that commits directly to `master`**: skips the PR shape and lands deps refreshes without a main-pipeline review on the change itself. Con: bypasses the existing review trail; if `dry-aged-deps` ships a regression, the bumped state is on `master` before any human or pipeline saw it.
3. **Project-level scheduled skill invocation via `/wr-itil:schedule`**: cleaner audit trail, agent-authored commit. Con: requires a long-running scheduling surface (the user's machine or a hosted Claude Code runner) and ties cadence to a single workstation. Origin-side cron is more durable.
4. **Open as a wr-itil orchestrator concern**: every AFK orchestrator runs `dry-aged-deps --update --yes` at the start of its session before iterating. Con: only fires when the user runs an orchestrator, so cadence is "whenever the user remembers to grind problems", not weekly. Same drift risk as no cadence.
5. **No cadence; rely on ADR-021 alone**: do nothing here. Con: the auto-resolvable bypass works, but non-auto-resolvable cases (major-version bumps, peer-dep conflicts) accumulate indefinitely. The pre-push gate eventually halts on those and the user has to clear them manually. ADR-021 is necessary but not sufficient.

## Decision Outcome

Chosen option: **1. GitHub Actions cron workflow that opens a PR when manifests change**.

Rationale: pairs the proactive (cadence) and reactive (push-watch bypass) surfaces explicitly. Cadence keeps drift bounded; push-watch is the last-mile bypass for whatever drift accumulated since the last cadence run. The PR shape preserves the main-pipeline review trail and lets the existing accessibility / smoke-test / build gates fire on the deps refresh exactly as they would on any other PR.

The cron schedule is **weekly, Mondays 09:00 UTC**. Mondays-AM-UTC lands the PR review surface in the working week (Australia / Europe / US-east overlap), so a human is most likely available to merge it. Weekly matches the windyroad newsletter cadence (the project's existing weekly rhythm) and is well within both staleness windows in `.dry-aged-deps.json` (`dev: 30, prod: 14`). Daily would create more churn than the windows justify; monthly would let prod deps drift up to twice the window before the next cadence run.

The PR action is `peter-evans/create-pull-request` (pinned to a major version, `@v7`). The bot author is `github-actions[bot]` by default. The PR title is `chore(deps): scheduled refresh of stale dependencies`, the branch is `chore/deps-refresh`, and the body cites P020 and this ADR for traceability.

### Risk-reducing-bypass framing (ADR-008 alignment)

ADR-008's "Risk-reducing bypass" applies identically to this workflow as it does to ADR-021: a stale-deps refresh shrinks a downstream-risk gap (the staleness gate). The action is bounded by `dry-aged-deps`'s configured tolerance (`dev: 30, prod: 14` per `.dry-aged-deps.json`), runs only on auto-resolvable updates (`--yes` semantic), and produces a reviewable PR rather than a direct `master` commit. The combination is a textbook risk-reducing-bypass shape on the CI surface: the change is bounded, reversible (the user can close the PR without merging), and reviewed by the existing main-pipeline gates.

The PR commit (authored by `github-actions[bot]`) does not pass through the local `risk-score-commit-gate.sh`. That gate is a local pre-commit hook, not a CI gate. The remote authoring path is, by construction, outside that gate's surface. This is consistent with ADR-021's framing: the bypass is achieved by not invoking the gate, not by editing it. The PR is bounded in scope (root `package.json` + root `package-lock.json` only) and risk-reducing in direction.

### Changeset policy

Same as ADR-021: auto-deps PRs do NOT require a changeset.

- The windyroad project is `private: true`; root deps changes have no external API contract.
- The policy applies only when the auto-update touches **root manifests** (`./package.json`, `./package-lock.json`). If a future `dry-aged-deps` mode touched `packages/*/package.json`, changeset rules re-engage.
- If the windyroad root package is published in a future re-architecture, this policy must be revisited (mirrors ADR-021 §"Changeset policy").

### Bot author identity

`peter-evans/create-pull-request` authors commits as `github-actions[bot]` by default. This is a new commit-author identity on `master`-bound PRs and is recorded explicitly here so reviewers know to expect it. Alternative: configure a dedicated `windyroad-deps-bot` identity. Default `github-actions[bot]` is sufficient until / unless the project needs to distinguish multiple bot-authoring sites; revisit if a second bot-author surface emerges.

### Main-pipeline interaction

The deps-refresh PR triggers `main-pipeline.yml` on its branch. The pipeline's `Check dependency freshness` step (`npm run deps:check`, `main-pipeline.yml:38-39`) runs against the just-refreshed manifests and passes by construction. The accessibility / smoke-test / build gates run as they would on any other PR. No special-case wiring required in the existing pipeline.

### TDD interaction (ADR-006)

Same as ADR-021: the auto-PR only touches `package.json` and `package-lock.json`, which are manifest / lockfile artefacts and exempt from the TDD state machine. No TDD interaction.

### Composition with ADR-021

Both ADRs are intentionally in force. ADR-021 is the **reactive** surface (push-watch bypass); this ADR is the **proactive** surface (origin cadence). Both are useful: cadence prevents accumulation, push-watch handles whatever accumulated since the last cadence run. Removing either leaves a gap. If the cadence shape changes (e.g. moves off GitHub Actions), this ADR updates; ADR-021 stays unchanged.

## Consequences

- **Good**: AFK orchestrator drains see fresh deps on the weekly cadence; the staleness gate is exercised only on non-auto-resolvable cases (closes P020).
- **Good**: PR shape preserves the main-pipeline review trail and runs the existing accessibility / smoke-test / build gates on the deps refresh.
- **Good**: Origin-side cron decouples cadence from any single workstation; it fires whether or not the user is online.
- **Good**: Composes cleanly with ADR-021; the two surfaces address different halves of the gap (proactive cadence vs. reactive bypass).
- **Neutral**: A new commit-author identity (`github-actions[bot]`) appears on `master`-bound PRs. Documented above.
- **Bad**: A new auto-author site for changes exists. If `dry-aged-deps` ships a regression that produces destructive auto-updates, the PR captures it before merge but the user must spot it in the PR diff. Mitigated by the PR shape (review surface) and by the existing main-pipeline gates running on the change.
- **Bad**: GitHub Actions minutes are consumed weekly even when there is no drift. Bounded; the workflow exits early if no manifest changes occur.

## Confirmation

- `.github/workflows/deps-refresh.yml` exists and runs weekly on a cron schedule.
- The workflow uses `actions/checkout@v6`, `actions/setup-node@v6` with `node-version-file: '.nvmrc'`, `cache: 'npm'`, mirroring `main-pipeline.yml`'s patterns.
- The workflow runs `npm ci` then `npx dry-aged-deps --update --yes`.
- A PR is created via `peter-evans/create-pull-request` (pinned major version) only when `package.json` or `package-lock.json` changed.
- The PR title is `chore(deps): scheduled refresh of stale dependencies`, branch is `chore/deps-refresh`, body cites P020 and this ADR.
- The deps-refresh PR triggers `main-pipeline.yml` and the existing `npm run deps:check` step passes.
- AFK `/wr-itil:work-problems` drain step no longer halts on accumulated drift (closes P020's symptom for the auto-resolvable subset).

## Reassessment Criteria

- If weekly cadence is too noisy (PRs too frequent) or too sparse (drift still accumulating into AFK halts), revisit the cron interval.
- If `dry-aged-deps` ships a regression that produces destructive auto-updates, the PR shape catches it before merge; if multiple such cases occur, revisit option 5 (no cadence) or add a manual-review gate.
- If the windyroad root package is published, the changeset-policy assumption breaks and this ADR (and ADR-021) must be revisited.
- If a second bot-author site emerges, consider a dedicated identity instead of default `github-actions[bot]`.
- If the project moves off GitHub Actions, the cron shape moves; this ADR updates accordingly while ADR-021 stays unchanged.
