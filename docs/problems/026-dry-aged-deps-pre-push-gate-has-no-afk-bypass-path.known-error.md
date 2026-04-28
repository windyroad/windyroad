# Problem 026: dry-aged-deps pre-push gate has no AFK-bypass path; halts work-problems loop on every stale-dep state

**Status**: Known Error
**Reported**: 2026-04-26
**Priority**: 16 (Significant). Impact: Significant (4) x Likelihood: Likely (4)
**Effort**: S
**WSJF**: 32.0 = (16 x 2.0) / 1

## Description

`dry-aged-deps --check` runs as part of `npm run push:watch` and halts the AFK work-problems loop when deps are stale. The gate has no AFK-bypass nor authorised-update path; user intervention is required.

## Symptoms

From prior AFK session:
- First drain rejected on react/react-dom 16-day staleness
- Required user "fix the deps" intervention to clear the gate
- Loop could not self-recover; orchestrator halted

## Workaround

Pre-emptive `npx dry-aged-deps --update --yes` before starting work-problems, OR commit-time deps-refresh as part of work-problems Step 0.

## Impact Assessment

- **Who is affected**: AFK orchestrator runs
- **Frequency**: Every AFK session with deps older than the staleness threshold
- **Severity**: Significant. Halts the loop; forces user intervention
- **Analytics**: dry-aged-deps gate halt logs; npm push failure transcripts

## Root Cause Analysis

The pre-push hook at `.git/hooks/pre-push` runs `npm run deps:check` which is `dry-aged-deps --check`. When any dependency is past the staleness threshold the hook exits non-zero, aborting `git push`. `scripts/push-watch.sh` runs `git push "$@"` directly (line 38 in the pre-fix version), so a stale-deps state surfaces as a halt of the entire `npm run push:watch` flow. The work-problems orchestrator's drain step invokes `push:watch` and has no path to clear the gate without a human in the room.

The gate itself is correct: it surfaces stale deps before they ship. What is missing is a deterministic auto-resolution path for the auto-resolvable subset that does not need human judgement.

### Fix Strategy

Pre-emptively run `npx dry-aged-deps --update --yes` inside `scripts/push-watch.sh` before the `git push`. The command is bounded to the auto-resolvable subset within the configured staleness tolerance. When it changes root manifests (`package.json`, `package-lock.json`), the script auto-commits the change as `chore(deps): refresh stale dependencies (P026)` so it rides the same push. Anything not auto-resolvable stays stale and the pre-push gate still fires (preserving the gate's safety surface). Failures of the pre-emptive command are non-fatal.

The auto-commit invokes ADR-008's "Risk-reducing bypass" principle to skip `risk-score-commit-gate.sh`. A stale-deps refresh shrinks the staleness gap that would otherwise fail the pre-push gate, so it is risk-reducing by definition. No changeset is required because the windyroad root package is `private: true` (`package.json:7`) and the auto-commit is scoped to root manifests only. ADR 021 records the policy in full.

### Investigation Tasks

- [x] Decide insertion point for fix: chose `scripts/push-watch.sh` over orchestrator Step 0. The AFK halt is a property of `push-watch.sh`; fixing it there benefits any future caller, not just `/wr-itil:work-problems`.
- [x] Architect review: completed. ADR 021 written and reviewed. ADR-008 risk-reducing-bypass framing confirmed sound.
- [x] Implement fix in `scripts/push-watch.sh` with non-fatal failure handling
- [ ] Reproduction test: deferred. Reproducing requires backdating the lockfile by the staleness threshold and invoking `push-watch.sh`. The existing ticket's symptom evidence (react/react-dom 16-day halt on a prior AFK session) is sufficient evidence of the failure mode. A formal regression test would require a fixture lockfile and a sandboxed dry-aged-deps install; defer until a recurrence justifies the cost.
- [ ] User verification on next AFK orchestrator run that touches a stale-deps state

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P020 (cadence): same root surface; closing P020 reduces P026 trigger frequency

## Related

- ADR 021 (auto-resolve stale dependencies in push:watch): docs/decisions/021-auto-resolve-stale-deps-in-push-watch.proposed.md
- ADR-008 (action-specific pipeline risk management; "Risk-reducing bypass" sub-section): docs/decisions/008-action-specific-pipeline-risk-management.proposed.md
- `scripts/push-watch.sh` (fix site)
- `.git/hooks/pre-push` (the gate this fix avoids tripping on)
- packages/itil/skills/work-problems/SKILL.md (Step 0 / Step 6.5 push paths)
- npm dry-aged-deps package
