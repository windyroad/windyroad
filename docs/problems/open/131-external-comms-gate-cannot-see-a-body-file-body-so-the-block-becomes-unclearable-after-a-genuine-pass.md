# Problem 131: External-comms gate cannot see a --body-file body, so the block becomes unclearable after a genuine PASS

**Status**: Open
**Reported**: 2026-08-08
**Priority**: 6 (Medium), Impact: 2 x Likelihood: 3, derived at capture from the description. Impact is 2 because nothing wrong ships: the failure is dev-tooling friction on an outbound call that never leaves the machine, and the gate errs closed rather than open. It is not 1 because the block is unclearable by the remedy its own message prescribes, so the natural recovery loop is infinite and the operator has no way to diagnose it from the message. Likelihood is 3 because it fires deterministically whenever an external-comms surface is invoked with `--body-file`, and that form is the natural choice for a long body, but the inline forms are more common.
**Origin**: internal
**Effort**: S, derived at capture. One extraction branch in `external-comms-gate.sh` (read the file named by `--body-file` into `DRAFT`) plus a bats case alongside the existing extraction fixtures. Same size class as P129, also rated S for a guard clause in one script.
**WSJF**: 6.0 = (6 x 1.0) / 1

## Description

The external-comms gate cannot see a body passed with `--body-file`, so its marker key hashes an empty draft and the block becomes unclearable after a genuine PASS.

The PreToolUse gate scrapes the draft out of the command string itself. `hooks/external-comms-gate.sh` (upstream `windyroad/agent-plugins`, at `packages/risk-scorer/`; read here from the plugin cache) carries a seven-entry pattern list: a `$(cat <<'EOF' ... EOF)` heredoc, then `--body` and `--field` in single- and double-quoted forms, then `-m` / `--message` likewise. There is no `--body-file` branch, so for that form nothing matches and `DRAFT` is set to the empty string. The script's own comment treats this as acceptable: *"When absent (npm publish, --body-file, editor flow already filtered), DRAFT="" is acceptable: the agent will be invoked with command context and read whatever body source the call uses."*

But the marker key is computed from that draft unconditionally. `compute_external_comms_key` in `hooks/lib/external-comms-key.sh` returns `sha256(normalize(draft) + '\n' + surface)`, and the PostToolUse mark hook derives its key from the reviewer subagent's prompt via `derive_external_comms_key_from_prompt`, which extracts the body from the `<draft>...</draft>` block. So the gate hashes `""` while the reviewer hashes the real body. An empty draft yields a valid-but-unmatchable key, and the gate denies rather than skipping. The marker never matches, and the gate re-blocks after a genuine PASS with the same message instructing the operator to run the review they just ran.

**Not version-bounded.** Verified on both `0.17.0` (the version that produced the observation) and `0.18.6` (the newest cached build): the pattern list is byte-identical and `--body-file` appears in neither, only in the comment quoted above.

Observed 2026-08-08 filing `windyroad/agent-plugins#413` for P125. Two `gh issue create --body-file` attempts were blocked after a full `wr-risk-scorer:external-comms` PASS. Switching the same body to the inline `--body "$(cat <<'EOF' ... EOF)"` form cleared the risk gate on the next attempt, which then surfaced the voice-tone gate, which cleared the same way.

## Symptoms

- `gh issue create --repo <r> --title <t> --body-file <path>` returns `BLOCKED (external-comms gate / risk evaluator): gh-issue-create draft has not been reviewed by wr-risk-scorer:external-comms`, after `wr-risk-scorer:external-comms` has already returned `EXTERNAL_COMMS_RISK_VERDICT: PASS` for that exact body.
- Re-running the reviewer does not help. The block is stable across retries because the mismatch is structural, not staleness.
- The message names three real failure modes (wrong prompt shape, background dispatch, missing `SURFACE:` line) and none of them is the actual cause, so the message actively misdirects diagnosis.
- Switching to `--body "$(cat <<'EOF' ... EOF)"` with byte-identical content clears the gate on the next attempt.

## Workaround

Pass outbound bodies inline via the heredoc form, which the gate's extractor matches first and by design:

```bash
gh issue create --repo <owner/repo> --title "<title>" --body "$(cat <<'EOF'
<body>
EOF
)"
```

Use a quoted heredoc delimiter (`<<'EOF'`) so backticks and `$` in the body stay literal. The gate carries a `unescape_dq` pass for the double-quoted form, but not needing it is simpler.

Two adjacent requirements are worth stating because failing either wastes an entire review round rather than producing this block: the reviewer must be dispatched synchronously (`run_in_background: false`), because a background agent never fires its PostToolUse mark hook; and its prompt must begin with a literal `SURFACE: <name>` line and wrap the body in `<draft>...</draft>` markers, or no key is derived at all.

## Impact Assessment

- **Who is affected**: whoever files outbound prose from this repo, including the AFK `/wr-itil:work-problems` orchestrator when an iteration reports a ticket upstream per ADR-036 step 3.
- **Frequency**: every external-comms call that uses `--body-file`. Two occurrences in one filing on 2026-08-08.
- **Severity**: no wrong output ships. The cost is the wasted review rounds plus the diagnostic time, which is the expensive part, since the block's own message points away from the cause.
- **Analytics**: none.

## Root Cause Analysis

### Investigation Tasks

- [ ] Confirm the extraction branch is the whole story, or whether the surface-detection half also mis-handles `--body-file`. Read `external-comms-gate.sh` around the `DRAFT=$(...)` python extractor and the `COMMAND` matcher that assigns `SURFACE`.
- [ ] Decide the fix shape. Reading the file named by `--body-file` into `DRAFT` is the direct fix and makes the two keys agree. Alternatively the gate could refuse to compute a key from an empty draft and say so, which at least makes the failure legible instead of silent. The two compose.
- [x] Check whether the same blind spot reaches the other extraction-dependent surfaces: `npm publish`, `gh api .../security-advisories --input`, and the editor flow the comment says is "already filtered". Partly answered 2026-08-30, see the fail-open variant below: `git commit -F` is a fourth affected form and it fails OPEN rather than closed. The remaining forms named here are still unchecked.
- [ ] Create a reproduction test alongside the existing extraction fixtures.

## Fail-open variant on the git-commit-message surface (2026-08-30)

The same missing-branch defect has a second manifestation on a different surface, and this one fails OPEN rather than closed. It is the more serious of the two.

Neither `git commit -F <file>` nor `git commit -F -` appears in the extractor's flag list, exactly as the body-file form does not. But on the `git-commit-message` surface the miss happens one step earlier, in surface and message detection rather than in draft extraction: with no `-m` or `--message` present the gate takes an early `exit 0` instead of reaching the `DRAFT=` extractor at all. That ordering is what makes the flag list beside the point here. The heredoc branch keys on body shape rather than on a flag, so for the `-F -` plus quoted-heredoc form actually observed it would have matched had control ever reached it; the early exit means it never does. So where the body-file form produces an unmatchable key and an unclearable block, `-F` produces no gate at all. The review is skipped silently.

That matters here because the gate's own P365 repo-visibility precondition is satisfied: `windyroad` is a public repo, so by the gate's own rule commit messages on it are external-facing prose in scope for review.

Observed 2026-08-30 during the story-map salvage iteration. Commit `89da2a0` was authored with `git commit -F -` and a quoted heredoc, and no gate fired. The very next commit in the same session used `-m` and was blocked immediately, demanding the review the previous commit had never been asked for. The two commits went to the same repo, minutes apart, and only the second was gated. Verified against `external-comms-gate.sh` at cached version `0.18.17`: the extraction chain is heredoc-inside-`-m`, then `--body` and `--field`, then `-m` and `--message`, and `-F` and `--file` appear in none of them.

Fix shape, composing with the two already recorded above. Reading the file named by `-F` into `DRAFT` is the direct fix and is the same branch-addition as the body-file fix. `-F -` reads the body from stdin, which a PreToolUse hook may not be able to recover; where the body cannot be reconstructed the safer shape on this surface is to fail closed on an unparseable message form rather than `exit 0`, since a silent skip on a public repo is worse than a block the operator can clear by switching form. That inverts the current comment's stance that an empty `DRAFT` is acceptable.

This variant widens the ticket's severity beyond the original dev-tooling-friction framing: the body-file half ships nothing wrong, but the `-F` half lets unreviewed prose reach a public repo. Whoever re-rates this should treat the two halves separately, and it is a reasonable call to split the fail-open half into its own ticket if the fix shapes diverge.

A second, milder finding from the same session, recorded here because it is the same extractor: the surface detector matches on command text alone, so a purely local edit whose command line merely quotes an outbound-surface path is misread as that outbound call. Editing this very ticket was blocked as an advisory-API submission because the command quoted one of the surface strings named in the task list above. Harmless but the same root: the gate reasons about the command string rather than about what the command does.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P085, P074

## Related

**Anchoring: JTBD-402 (Land the fix where the defect lives), Internal Maintainer persona.** The header-line anchoring left unconfirmed at capture is now settled: `docs/jtbd/internal-maintainer/` models the person this ticket describes, written 2026-08-08 on Tom's direction. This is a defect on the outbound contribution path, which is JTBD-402's third outcome, that the path itself works rather than costing a review round and the diagnosis time to a message naming three causes and not the real one. It also touches [JTBD-400](../../jtbd/internal-maintainer/JTBD-400-trust-what-the-loop-did-while-i-was-away.proposed.md), since the AFK orchestrator hits this block unattended when an iteration reports a ticket upstream. The persona and job are `human-oversight: unconfirmed` pending `/wr-jtbd:confirm-jobs-and-personas`, so this anchoring is provisional. Recorded in prose rather than `**JTBD**` / `**Persona**` header lines, per local convention; the header lines carried at capture have been removed.

- Captured via `/wr-itil:capture-problem` during the P125 iteration retro (2026-08-08).
- Driver evidence: the two blocked `gh issue create --body-file` attempts while filing `https://github.com/windyroad/agent-plugins/issues/413`, and the successful inline-heredoc retry immediately after.
- Fix site: `hooks/external-comms-gate.sh` (the `DRAFT=$(...)` extractor and its pattern list, lines 201-271) and `hooks/lib/external-comms-key.sh` (`compute_external_comms_key`), read from `~/.claude/plugins/cache/windyroad/wr-risk-scorer/0.18.6/` (newest cached; `0.17.0` is byte-identical here). Both live upstream in `windyroad/agent-plugins` under `packages/risk-scorer/`, so this is a candidate for the ADR-036 `marketplace-consumer-cannot-edit-cached-plugin` park classification at its next review, on the same predicate P125 met.
- **P085** (`docs/problems/known-error/085-external-comms-gate-marker-hash-invalidated-by-commit-body-changes.md`): same marker-key family, different defect. P085 is invalidation when the body CHANGES between review and commit; this is a permanent mismatch when the body is never visible to the gate at all. Composes; neither blocks the other.
- **P074** (`docs/problems/open/074-external-comms-marker-hooks-do-not-write-files-after-subagent-pass-verdicts.md`): the marker-never-written surface. Adjacent, and this ticket is evidence that at least one such report may have had this root cause rather than a hook-write failure.
- Duplicate-check matches (3-keyword title-only grep on `external-comms|marker|gate`): 29 filename matches across all state directories, dominated by unrelated gate tickets. P085 and P074 are the only two in the marker-key family; both are listed above per the capture-problem contract for resolution at the next `/wr-itil:review-problems`.
- Hang-off pre-filter extracted no ADR / RFC / SKILL / file-path signals from the capture description, so no `wr-itil:hang-off-check` dispatch was made.
