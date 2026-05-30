# Problem 028: risk-scorer 30-min TTL expired during long-running orchestrator turns

**Status**: Verification Pending
**Reported**: 2026-04-26
**Origin**: internal
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

Root cause sits in the upstream `@windyroad/risk-scorer` plugin's commit-gate hook (`hooks/risk-score-commit-gate.sh`), which delegated to `check_risk_gate` with a fixed-TTL binary check (age < TTL was pass; age >= TTL was halt). The binary policy did not distinguish "tree changed since scoring, so re-score legitimately required" from "tree unchanged since scoring, so TTL is a stale heuristic". Long orchestrator turns hit the second case, paying a fresh subagent invocation for no informational gain.

Upstream (agent-plugins repo) has shipped a fix in `wr-risk-scorer` v0.9.0 that replaces the binary TTL with a three-band policy plus a subprocess-return slide mechanism. Verified on disk at `~/.claude/plugins/cache/windyroad/wr-risk-scorer/0.9.0/hooks/risk-score-commit-gate.sh` and CHANGELOG entry 43e9cc0:

- **Band A** (age < TTL/2): pass silently (unchanged from binary behaviour).
- **Band B** (TTL/2 <= age < TTL): consult the pipeline state-hash; if invariant since scoring, pass AND slide the marker forward (`touch` the score file). Bounded by a `2 * TTL` hard-cap via a new `<action>-born` sibling marker, so an unchanged-but-idle tree cannot ride one score indefinitely.
- **Band C** (age >= TTL): halt with the existing expired message (unchanged).

A companion `slide-marker-on-subprocess-return` mechanism (tested at `0.9.0/hooks/test/slide-marker-on-subprocess-return.bats`) ensures sub-Task subagent turns do not count against the parent turn's TTL.

Default TTL was also bumped from 1800s to 3600s in an earlier release (per the upstream's P107 symptom-treatment), so the operating window grew from 30 minutes to 60 minutes before the three-band policy now extends it further when the tree is unchanged.

### Investigation Tasks

- [x] Review the 1800s TTL choice; why 30 min specifically? Answered upstream: default TTL is now 3600s (60 min); the original 30-min figure was an arbitrary half-of-typical-session window with no formal grounding (upstream P107).
- [x] Decide fix: TTL extension OR auto-refresh on near-expiry OR commit-gate-side fallback scoring. Answered upstream: three-band policy (Band B auto-slides the marker on invariant state-hash); chosen over flat TTL extension because it preserves halt-on-drift semantics.
- [x] Consider: does TTL serve a real purpose if no commits happened between scoring and gate check? Answered upstream: TTL serves as the "tree must be revisited" expiry; the three-band policy carves out the "tree unchanged" subcase explicitly via state-hash invariance, separating "TTL expired" from "score stale" as two independent concerns.
- [x] Create reproduction test (long turn with score-then-commit-after-30min). Referenced upstream: `~/.claude/plugins/cache/windyroad/wr-risk-scorer/0.9.0/hooks/test/risk-gate.bats` covers all three bands and the 2*TTL hard cap; `slide-marker-on-subprocess-return.bats` covers the subprocess-return slide.
- [x] Create INVEST story for permanent fix. Not required locally: the permanent fix is upstream-shipped in v0.9.0; remaining local work is verification only.

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

## Fix Released

- **Release marker**: `@windyroad/risk-scorer` v0.9.0 (CHANGELOG entry `43e9cc0`). Installed locally for this project per `~/.claude/plugins/installed_plugins.json` (verified 2026-05-16).
- **Fix summary**: three-band TTL policy in `check_risk_gate` (Band A passes silently when age < TTL/2; Band B slides the marker forward on invariant state-hash bounded by a 2*TTL hard cap; Band C halts as before); companion `slide-marker-on-subprocess-return` ensures sub-Task subagent turns do not count against the parent turn's TTL. Default TTL also bumped 1800s to 3600s in an earlier release per upstream P107.
- **Awaiting user verification**: the next long AFK orchestrator turn (>30 min between scoring and committing on an unchanged tree) should pass the commit gate without an extra `wr-risk-scorer:pipeline` invocation. Expected behaviour: when the gate fires after the TTL midpoint with the staged-tree state-hash unchanged since scoring, the gate slides the marker forward (Band B) and admits the commit. When the staged tree has drifted since scoring, the gate still halts (correct halt-on-drift semantics preserved).
- **Exercise evidence (this iteration)**: this same iteration's two transition commits both relied on a single `wr-risk-scorer:pipeline` invocation up-front; the second commit gate (the Known Error to Verification Pending transition) is the live verification surface.
