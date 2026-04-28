---
status: "proposed"
first-released:
date: 2026-04-26
decision-makers: [Tom Howard, Claude]
consulted: [wr-architect agent]
informed: []
---

# Auto-resolve stale dependencies in push:watch

## Context and Problem Statement

`.git/hooks/pre-push` runs `npm run deps:check` (`dry-aged-deps --check`) and aborts the push when any dependency is past the staleness threshold. The gate is correct in concept (it surfaces stale deps before they ship), but it has no AFK-bypass path. When the `/wr-itil:work-problems` orchestrator is draining problem tickets while the user is away, a stale-deps state halts the entire loop and there is no human in the room to clear the gate. P026 (`docs/problems/026-dry-aged-deps-pre-push-gate-has-no-afk-bypass-path.open.md`) captured one such halt: react/react-dom 16-day staleness halted the loop on a prior AFK session.

`scripts/push-watch.sh` currently treats the working tree as read-only. It stashes uncommitted changes, pulls + rebases, pops the stash, then pushes. It never authors commits on the user's behalf. Adding an auto-resolved-deps step is a behavioural-contract change to the script and requires an ADR per `wr-architect` review.

## Decision Drivers

- AFK orchestrator halts on a stale-deps gate are non-recoverable without human intervention; the loop's value is lost when this happens (JTBD-006 in the wr-itil context: progress the backlog while away).
- The pre-push gate is the safety surface; removing it entirely is wrong. The gate should still fire on issues that auto-update cannot resolve.
- ADR-008's "Risk-reducing bypass" principle already permits actions that close a downstream-risk gap. A stale-deps refresh closes such a gap by definition: it refreshes the lockfile to current minor / patch versions within the staleness window.
- The windyroad package is `private: true` (`package.json:7`), so root deps refreshes do not affect any published API surface and do not require a changeset. Plugin packages in `packages/` are a separate concern. Their releases go through a different flow, not `scripts/push-watch.sh`.
- The `dry-aged-deps --update --yes` command is bounded: it applies only auto-resolvable updates within the configured tolerance. Major-version bumps and other non-auto-resolvable cases stay stale and the pre-push gate still fires for them.

## Considered Options

1. **Pre-emptive `--update --yes` inside push-watch.sh, with auto-commit when the lockfile changes** (chosen).
2. **AFK-only gate via `WR_AFK=1` env var**: same script change but only fires when the env var is set; interactive runs preserve current behaviour exactly. Con: requires coordinated changes to every orchestrator that drains the queue, and any future caller of `push:watch` has to opt in explicitly.
3. **Add `--auto-resolve-deps` CLI flag to `push-watch.sh`**: orchestrator passes the flag explicitly. Con: same coordination cost as option 2, plus a script-API surface change for every caller.
4. **Move the deps-check out of pre-push**: let the gate fire elsewhere (e.g., as a post-pull-request CI step), removing it as a push blocker. Con: loses the local-fast-fail property of the pre-push hook and pushes the surface to a slower, remote signal.
5. **Open as a wr-itil orchestrator concern**: handle in `/wr-itil:work-problems` Step 0 by running `dry-aged-deps --update --yes` before each iteration. Con: does not help non-orchestrator callers of `push:watch` and duplicates concern across every future orchestrator that drains the queue.

## Decision Outcome

Chosen option: **1. Pre-emptive `--update --yes` inside push-watch.sh, with auto-commit when the lockfile changes**.

Rationale: the AFK halt symptom is a property of `push-watch.sh`, not of the orchestrator. Putting the fix here keeps the orchestrator generic. Any future caller of `push:watch` benefits without per-orchestrator wiring. The auto-commit is required because the orchestrator's iteration boundary commits its own work first; by the time `push:watch` runs, the working tree should be clean, and a working-tree change introduced inside `push-watch.sh` would either be lost on push (unstaged) or surface as a confusing post-push diff. Auto-committing closes that gap deterministically.

The interactive-surprise concern (option 2's motivation) is acknowledged. Interactive users running `npm run push:watch` will see auto-resolvable deps silently bumped where previously the gate would have surfaced them. This is acceptable because: (a) the pre-push gate still fires on non-auto-resolvable cases, (b) the `--update --yes` operation is bounded to within the staleness tolerance configured for `dry-aged-deps`, and (c) the auto-applied bump produces a visible local commit (`chore(deps): refresh stale dependencies (P026)`) that the user can revert if undesired before the push lands.

### Risk-reducing-bypass framing (ADR-008 alignment)

ADR-008 establishes the "Risk-reducing bypass" sub-section under Key Design Principles: "When a downstream queue has high risk, actions that reduce that risk are always permitted... If projected downstream risk < current downstream risk, the action is risk-reducing and bypasses back-pressure." A stale-deps refresh is the canonical risk-reducing action: it shrinks the staleness gap that would otherwise fail the pre-push gate. This ADR records the explicit application of that principle to the auto-deps commit produced by `push-watch.sh`.

The mid-script `git commit` in `push-watch.sh` does not pass through the standard `risk-score-commit-gate.sh` (delivered by the `risk-scorer` plugin per ADR-009). The bypass is achieved by not invoking the gate, not by editing it. The commit runs inside an already-authorised push action: the user invoked `npm run push:watch`, which is a policy-authorised release-pipeline action per ADR-008. The commit is bounded in scope (root `package.json` + root `package-lock.json` only) and risk-reducing in direction (closes a staleness gap rather than introducing new functionality), so it satisfies ADR-008's bypass criterion without re-running the gate.

### Changeset policy

Auto-deps commits produced by `push-watch.sh` do NOT require a changeset, with one boundary condition:

- The windyroad project (`package.json:7` declares `private: true`) is unpublished, so root dep changes have no external API contract.
- The policy applies only when the auto-update touches **root manifests** (`./package.json`, `./package-lock.json`). If a future `dry-aged-deps` mode touched `packages/*/package.json` (the published plugin packages), changeset rules re-engage and the auto-commit shape would need to expand. Today's `--update --yes` invocation is scoped to the workspace root.
- Plugin packages in `packages/` ship through the marketplace flow per ADR-009; `scripts/push-watch.sh` does not touch them.

If a future re-architecture publishes the windyroad root package, this policy must be revisited.

### Robustness shape

The pre-emptive command runs non-fatally. `npx dry-aged-deps --update --yes` is wrapped so that registry hiccups, network failures, or transient errors do not abort the push. If the update fails, the pre-push gate still fires on the original staleness state and the user gets a clear failure message. The push action degrades to its existing behaviour rather than silently swallowing a different failure.

### TDD interaction (ADR-006)

ADR-006 enforces TDD on implementation files. The auto-commit only touches `package.json` and `package-lock.json`, which are manifest / lockfile artefacts, not implementation code, and are exempt from the TDD state machine. No TDD state interaction.

## Consequences

- **Good**: AFK orchestrator no longer halts on auto-resolvable stale-deps states (closes P026).
- **Good**: Behavioural contract for `push-watch.sh` is documented (closes architect Issue 2 from the P026 review).
- **Good**: Interaction with ADR-008's risk-reducing bypass is explicit (closes architect Issue 1).
- **Good**: Changeset policy is explicit and bounded to root manifests (closes architect Issue 3).
- **Good**: `dry-aged-deps` failure handling is non-fatal; transient registry issues do not break push.
- **Neutral**: Interactive `npm run push:watch` invocations now silently apply auto-resolvable bumps. Bounded by `dry-aged-deps`'s staleness tolerance; visible as a discrete `chore(deps)` commit.
- **Bad**: A new auto-author site for commits exists. If a future regression in `dry-aged-deps` produced a destructive update, the bumped state would be in HEAD before the user could review. Mitigated by `dry-aged-deps`'s `--yes` semantic (only auto-resolvable subset) and by the discrete commit's reversibility.

## Confirmation

- `scripts/push-watch.sh` runs `npx dry-aged-deps --update --yes` before `git push`.
- The command is wrapped non-fatally; a `dry-aged-deps` failure does not abort `push-watch.sh`.
- A `chore(deps): refresh stale dependencies (P026)` commit is produced when and only when the lockfile or `package.json` changed.
- Interactive `npm run push:watch` continues to fire the pre-push gate when no auto-resolvable updates exist.
- AFK `/wr-itil:work-problems` drain step no longer halts on P026's symptom (react/react-dom-style staleness).

## Reassessment Criteria

- If interactive users complain about unexpected auto-deps commits during `push:watch`.
- If `dry-aged-deps` ships a regression that produces destructive auto-updates.
- If the windyroad root package is published (changeset policy assumption breaks).
- If a second caller of `push:watch` emerges that needs different deps-handling semantics; in that case revisit option 3 (explicit CLI flag).
