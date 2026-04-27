# Problem 028: risk-scorer 30-min TTL expired during long-running orchestrator turns

**Status**: Open
**Reported**: 2026-04-26
**Priority**: 12 (Significant). Impact: Moderate (3) x Likelihood: Likely (4)

## Description

The risk-scorer commit gate uses a 1800s TTL on the cached score. During long orchestrator turns (multi-iteration AFK loops), the score expires mid-turn even when no commits happen between scoring and the eventual commit. This forces a fresh scorer invocation just to commit.

## Symptoms

From prior AFK session:
- Final BRIEFING hand-off commit blocked: "Commit blocked: Risk score expired (1826s old, TTL 1800s)"
- Resolution: re-invoked `wr-risk-scorer:pipeline` subagent inline

## Workaround

Re-score before commit if turn duration approaches TTL. Adds extra subagent invocation cost.

## Impact Assessment

- **Who is affected**: Long orchestrator turns (multi-iteration AFK loops, batch operations)
- **Frequency**: Any turn longer than ~30 min between scoring and committing
- **Severity**: Moderate. Wastes a subagent invocation per occurrence; doesn't block work
- **Analytics**: Commit-gate denial logs with TTL-expired reason

## Root Cause Analysis

### Investigation Tasks

- [ ] Review the 1800s TTL choice; why 30 min specifically?
- [ ] Decide fix: TTL extension OR auto-refresh on near-expiry OR commit-gate-side fallback scoring
- [ ] Consider: does TTL serve a real purpose if no commits happened between scoring and gate check?
- [ ] Create reproduction test (long turn with score-then-commit-after-30min)
- [ ] Create INVEST story for permanent fix

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P029 (BRIEFING hand-off commits trigger this; closing P029 reduces P028 trigger frequency)

## Related

- ~/.claude/plugins/cache/windyroad/wr-risk-scorer/ (TTL config)
- docs/decisions/015-*.md (risk-scorer split-skill ADR)
- **Reported upstream**: https://github.com/windyroad/agent-plugins/issues/82 (2026-04-27)

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/82
- **Reported**: 2026-04-27
- **Template used**: problem-report.yml
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes

## Additional Evidence (2026-04-27)

The 8-ticket upstream-batch retro pass on 2026-04-27 surfaced a second instance of the TTL-pressure pattern, this time on the **lower** end (waste rather than expiry). The pattern is the inverse of the original symptom: not "TTL too short and the score expires mid-turn", but "TTL is fixed and the score lifecycle has no shape-recognition cache, so 8 isomorphic commits each pay a fresh subagent invocation".

Concrete shape:

- 8 sequential commits in the upstream-batch pass each required a fresh `wr-risk-scorer:pipeline` subagent invocation before the commit gate would accept the change.
- All 8 returned identical `1/25 Very Low` verdicts on isomorphic single-line `## Reported Upstream` appends to `docs/problems/*.open.md`.
- That is 8 redundant subagent turns, each charged at full pipeline cost, to score the same staged-change shape 8 times. The Layer 3 risk text differed only in the ticket number; Layers 1 and 2 were materially identical across the batch.
- Commits cited: `c7fa52a`, `eaffb2c`, `488cc6e`, `6a81184`, `47418b4`, `5d682f3`, `01fd9f1`, `570517c`.

This widens the original P028 framing. The TTL is the **lifecycle parameter**; the **lifecycle policy** is a separate axis. Two candidate amendments to the upstream gate (either or both, not mutually exclusive):

1. **Shape-recognition caching**: hash the staged diff's structural shape (file list + diff size + content-class signature) and cache the score keyed by that shape for the TTL window. If a subsequent staging matches the same shape (e.g. all 8 batch commits append a single line to a single `.open.md` file in the same `## Related` section), reuse the cached score without firing a fresh subagent. This reuses the existing TTL but adds shape-keyed memoisation.
2. **TTL extension during multi-commit batches**: detect a batch session (via an explicit `BATCH_BEGIN` / `BATCH_END` marker pair set by the orchestrator, or implicitly via the rate of commits within the rolling TTL window) and extend the TTL accordingly. This is a coarser fix that handles the long-orchestrator-turn case AND the batch case, but at the cost of broader TTL semantics.

Recommend (1) as the primary path: it composes cleanly with the existing per-commit gate contract, does not change TTL semantics, and the shape signature is already implicit in the scorer's prompt (the staged diff is the input). Implementation hint: add the cache between the gate hook's marker check and the subagent dispatch; on cache hit, write the bypass marker directly without firing the subagent.

This evidence does not change P028's WSJF ranking (Severity 12 x Effort S = 12.0 Open) but enriches the upstream report (issue #82) with a concrete cost model for the redundancy: 8 subagent turns wasted in a single 30-minute window, all returning the same verdict on the same shape.
