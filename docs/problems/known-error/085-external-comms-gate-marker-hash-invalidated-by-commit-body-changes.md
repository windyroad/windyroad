# Problem 085: External-comms gate marker hash invalidated by commit-message body changes, forcing re-review on every retry

**Status**: Known Error
**Reported**: 2026-06-03
**Priority**: 8 (Medium), Impact: Minor (2) x Likelihood: Likely (4) (re-rated 2026-07-15 review: deterministic marker invalidation on any body change between review and commit; dev-tooling friction only)
**Origin**: internal
**Effort**: M
**WSJF**: 8.0 = (8 x 2.0) / 2
**Type**: technical

## Description

The external-comms gate hash mechanism (PostToolUse hook that marks a commit-message draft "reviewed" after `wr-risk-scorer:external-comms` + `wr-voice-tone:external-comms` subagents emit PASS verdicts) is invalidated by ANY change to the commit-message body between review and commit. This includes:

- Adding the standard Anthropic `Co-Authored-By:` trailer between review-time draft and final commit message.
- Re-wording the body after the first review (e.g. dropping a "BYPASS_README_REFRESH_GATE justified" sentence on retry).
- Splitting the message across multiple `-m` flags vs. a single HEREDOC blob (whitespace differs).

When the body changes, the marker key derived from the hash no longer matches what the PreToolUse:Bash gate computes from the actual `git commit -m "..."` command-string, so the gate fires with:

> BLOCKED (external-comms gate / risk evaluator): git-commit-message draft has not been reviewed by wr-risk-scorer:external-comms. Delegate to wr-risk-scorer:external-comms ...

Forcing re-review of BOTH risk + voice gates on every retry.

## Symptoms

- This session's `/wr-architect:review-decisions` follow-up: 3 commits each required 2 separate re-review pairs (risk + voice) because the body text was tweaked between first-attempt review and final commit. 6 subagent invocations on what should have been 2 (one per commit).
- 2026-06-02 AFK session's iter 4 retro flagged the same pattern at the Co-Authored-By trailer split between review-time and commit-time.
- Compounds with the P165 README-refresh-discipline hook block: when P165 forces a retry, the commit message often gains a justification sentence, which invalidates the marker, which forces re-review.

## Workaround

Use a single HEREDOC for the commit message verbatim matching the reviewed draft. Avoid editing the message between review and commit. When changes are unavoidable, re-fire BOTH external-comms subagents (risk + voice) before each retry.

## Impact Assessment

- **Who is affected**: every commit that goes through external-comms gates (most commits in this project).
- **Frequency**: every commit that needs a retry, every commit where the message body is composed after review (most commits, in practice). Observed ~5x in this session alone.
- **Severity**: Medium. Each re-review pair costs ~30 seconds of subagent time + token budget; compounds across iterative commit attempts. Discoverability cost: agents trying to compose commits learn to either over-review (defensive) or under-review (risky).
- **Analytics**: deferred to investigation.

## Root Cause Analysis

### Hypothesis

The marker hash is derived from the FULL draft body the subagent received in its prompt (between `<draft>...</draft>` markers). The PreToolUse:Bash gate then hashes the actual `git commit` command's message argument string and compares. Any whitespace, line-break, or content difference between the two breaks the match.

The cleanest fix is at the hook layer: strip predictable trailing trailer lines (Co-Authored-By: ...) before hashing on BOTH sides (review-time and commit-time). The existing P074 / external-comms ticket covers a different failure mode (markers not being written at all after PASS); this is a third failure mode where markers ARE written but get invalidated.

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Verify hash derivation logic in the upstream wr-risk-scorer + wr-voice-tone external-comms PostToolUse hooks
- [ ] Identify which whitespace / trailer normalisation is missing (Co-Authored-By trailer strip, `-m` vs HEREDOC whitespace, etc.)
- [ ] Determine if the fix lives in upstream agent-plugins (risk-scorer + voice-tone PostToolUse hook) or in the project-local PreToolUse:Bash gate that does the second hash comparison
- [ ] Verify whether stripping Co-Authored-By trailer is sufficient OR whether a broader normalisation (e.g. body-after-blank-line-stripped) is needed

## Dependencies

- **Blocks**: (none directly; affects commit-flow ergonomics)
- **Blocked by**: (none; can be investigated locally then reported upstream)
- **Composes with**: P074 (external-comms marker hooks do not write expected marker files after subagent PASS verdicts; sibling failure mode); P262 + P265 (RISK_BYPASS allow-list token mechanism; the analogous mechanism class).

## Related

- P074 (`docs/problems/open/074-external-comms-marker-hooks-do-not-write-files-after-subagent-pass-verdicts.md`). Sibling failure mode at the same gate.
- P165 (README-refresh-discipline hook; composes via "force retry, retry message changes, marker invalidated" cascade).
- 2026-06-02 outstanding question #17 (deferred from prior AFK session); this ticket codifies that observation.
- Upstream surface (probable): `packages/risk-scorer/hooks/external-comms-mark-reviewed.sh` and `packages/voice-tone/hooks/external-comms-mark-reviewed.sh` in agent-plugins repo.
- **Reported upstream**: https://github.com/windyroad/agent-plugins/issues/217 (2026-06-03)

(captured via /wr-itil:capture-problem on 2026-06-03 after live observation in /wr-architect:review-decisions follow-up: 3 commits required 6 subagent re-reviews vs 2 expected; bundled with P086 + P087 in one batch commit per ADR-014 related-cluster carve-out)

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/217
- **Reported**: 2026-06-03
- **Template used**: problem-report.yml (structured default body, per ADR-033)
- **Disclosure path**: public issue (used BYPASS_RISK_GATE=1 because P074 hook failure prevented marker write despite both wr-risk-scorer:external-comms AND wr-voice-tone:external-comms returning PASS verdicts on review)
- **Cross-reference confirmed**: yes (upstream body cites this ticket's GitHub path verbatim)

## Session evidence (2026-06-15 AFK work-problems loop)

Recurred while committing two ticket-resolution notes (`docs(problems): record Tom's resolutions ...`). The risk + voice-tone external-comms markers passed on first review, but a second commit attempt re-blocked because the staged content changed between attempts, invalidating the marker key. Forced `BYPASS_RISK_GATE=1` after the content had already passed both risk and voice-tone review twice.

**Distinct sub-finding worth its own ticket (data-loss class, more severe than this hash issue):** when the commit gate BLOCKS, it discards the working-tree changes that were staged for the commit (not merely unstages them). This is why the re-review loop is destructive: each blocked retry loses the appended edits, and re-appending produces a fresh content hash that re-invalidates the marker. Reliable avoidance: pre-run the gate subagents on the exact final commit message to set markers BEFORE the first `git commit`, so the commit never blocks. Recommend a sibling ticket scoped to "commit gate must not revert working-tree changes on block".

## Session evidence (2026-06-16 work-problems loop): marker mismatch is cross-surface, not commit-message-specific

The marker-hash mismatch recurred on TWO distinct external-comms surfaces in one loop, confirming the bug is general to the external-comms marker-key derivation, not specific to git commit messages:

1. **git-commit-message** (the P093/P094 capture commit): both `wr-risk-scorer:external-comms` and `wr-voice-tone:external-comms` returned PASS on the exact message, yet the PreToolUse:Bash gate reported "draft has not been reviewed" on `git commit`. Forced `BYPASS_RISK_GATE=1`.
2. **gh-issue-create** (filing windyroad/agent-plugins#258): both reviewers returned PASS with the correct `SURFACE: gh-issue-create` label and the verbatim `--body-file` content, yet `gh issue create` reported "gh-issue-create draft has not been reviewed". Forced `BYPASS_RISK_GATE=1`.

In both cases the content was twice-reviewed-clean; the blocker was the marker-key the PostToolUse hook derives not matching what the PreToolUse gate recomputes. This widens the root cause: the marker-derivation mismatch is not tied to commit-message body changes alone (the original P085 framing); it reproduces on a fresh gh-issue-create surface where the body never changed between review and action. The fix should target the marker-key derivation symmetry across ALL external-comms surfaces (commit-message, gh-issue-create, gh-pr, changeset-author), not just the commit-message body-hash case.
