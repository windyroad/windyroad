# Problem 130: Two run-retro detectors assume a packages/ monorepo and produce nothing in a consumer repo

**Status**: Open
**Reported**: 2026-08-08
**Priority**: 10 (High), Impact: 2 x Likelihood: 5, derived at capture from the description. Impact is 2 because the failures are advisory surfaces, not reader-facing or release-path: no visitor, no subscriber, no build. It is not 1 because one of the two (the Tier-3 budget pass) is load-bearing for a rotation decision the retro has to make, and its absence is silent. Likelihood is 5 because both fire deterministically on every retro run in this repo, which is a consumer repo by construction; observed 2026-08-08.
**Origin**: internal
**Effort**: S, derived at capture. One path substitution in a SKILL body and one guard clause in a detector script, each with an existing test sibling. Same size class as P129, also rated S for a guard clause in one script.
**WSJF**: 10.0 = (10 x 1.0) / 1

## Description

Two of `/wr-retrospective:run-retro`'s advisory detectors cannot run in this repo, because both assume the plugin's own `packages/` monorepo layout rather than the layout of a repo that consumes the plugin. Observed 2026-08-08 during the retro that closed P117.

**(1) The Tier-3 briefing budget pass names a repo-relative script path.** Step 3's rotation pass instructs invoking `packages/retrospective/scripts/check-briefing-budgets.sh`. This repo installs `wr-retrospective` from the plugin cache and has no `packages/` directory, so the call returns:

```
bash: packages/retrospective/scripts/check-briefing-budgets.sh: No such file or directory
```

This is drift within a single SKILL rather than a missing convention. ADR-049 exists precisely to forbid repo-relative script paths in plugin skills in favour of `$PATH` shims, the same SKILL warns "never invoke the canonical script via repo-relative path; the path does not resolve in adopter trees", and the sibling passes in that same SKILL do it correctly (`wr-retrospective-measure-context-budget`, `wr-retrospective-check-autocreate-rfc-scope`, `wr-retrospective-check-readme-jtbd-currency`). One pass was left behind.

**(2) The README-currency detector is invoked correctly but fails on the same assumption.** It is called by its proper shim name, and the shim resolves, but the detector body hard-codes a `packages` glob and exits with:

```
check-readme-jtbd-currency: packages dir not found: packages
```

Its own SKILL prose says the detector "always exits 0" and is advisory, so the contract promises a clean-or-drift verdict and delivers a failure string instead. In a consumer repo there are no plugin READMEs to check, so the honest answer is a clean no-op, not an error.

## Symptoms

- Step 3's budget pass produces no output, so the retro has no measured input for the rotation decision it is required to make.
- Step 2b's README inventory-currency advisory emits a failure line instead of `TOTAL packages=<N> drift_instances=<K>`.
- Both are silent-ish: the retro continues (correctly, both surfaces are fail-open), so the absence is only visible if someone reads the command output.

## Workaround

Substitute a manual measurement for the budget pass:

```bash
for f in docs/briefing/*.md; do printf "%s %s\n" "$(wc -c < "$f")" "$f"; done | sort -rn
```

Compare against the 5120-byte Tier-3 ceiling and the 10240-byte MUST_SPLIT ratio by hand. That is what this session did, and it mattered: the manual measurement found both `what-you-need-to-know.md` (12347 bytes) and `what-will-surprise-you.md` (11826 bytes) still above 2x the ceiling after an earlier same-day rotation, which is exactly the recurring-defer condition the MUST_SPLIT branch exists to force. Without the manual substitute the retro would have had no evidence and would plausibly have skipped the rotation.

The README-currency detector has no workaround and needs none in a consumer repo; its correct output here is "nothing to check".

## Impact Assessment

- **Who is affected**: whoever runs a retro in a repo that consumes the plugin rather than develops it. In practice that is every retro in this repo.
- **Frequency**: every run-retro invocation.
- **Severity**: Minor. Advisory surfaces only; no reader, build, or release-path effect. The load-bearing part is that the budget pass feeds a decision, and losing its input pushes that decision onto a manual step nobody is prompted to take.
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

Both defects share one cause: the plugin was authored in its own monorepo, where `packages/` exists and the repo-relative path resolves, so neither failure is visible to its authors. ADR-049 and the `$PATH` shim convention are the existing answer; defect (1) is a site that never migrated, and defect (2) is a shim that migrated its invocation surface but not its internals.

### Investigation Tasks

- [ ] Confirm on the installed plugin that the budget-pass path is the only remaining repo-relative invocation in the retrospective SKILL (grep the SKILL for `packages/` in command position).
- [ ] Confirm the readme-currency detector's `packages` glob is the only monorepo assumption in its body.
- [ ] Report upstream against `wr-retrospective` (this is not a windyroad-local fix; see Fix Strategy).

## Fix Strategy

Two bounded upstream edits, neither of which this repo can make locally:

1. Replace the repo-relative `packages/retrospective/scripts/check-briefing-budgets.sh` invocation in the retrospective SKILL's Step 3 with the `$PATH` shim name, matching its three siblings in the same file, and ship the shim if one does not exist yet.
2. Make the readme-currency detector no-op cleanly when no `packages/` directory is present: emit `TOTAL packages=0 drift_instances=0` and exit 0, honouring the always-exits-0 advisory contract its own SKILL prose states.

Both live in the upstream `wr-retrospective` plugin, so this ticket is a report-upstream candidate rather than a local fix. Per the verify-before-propagating discipline, that placement claim is a proposal to the maintainers, not a settled fact: the domain fit is clear (the defective files are plugin-owned and this repo has no copy of them), but the maintainers can reject it.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

Captured via `/wr-itil:capture-problem` during the retro of the P117 close iteration (2026-08-08).

**Anchoring: (unconfirmed - elicitation queued).** Captured under `--no-prompt` with no persona or JTBD flag, and derivation is genuinely low-confidence: the affected party is whoever operates the governance pipeline, and `docs/jtbd/` models four personas (engineering-leader, technical-founder, developer, publication-author) of which none is that operator. The briefing already records this gap under "Internal release-path / maintainer tooling has no documented JTBD persona yet", with Tom's 2026-06-17 direction that a maintainer persona should be authored locally. Rather than shoehorn this ticket onto a reader job, the anchoring is left explicitly unconfirmed and the elicitation is queued. Do not build dependent RFC or story work on this ticket until the anchoring is settled. Per local convention the `**JTBD**` and `**Persona**` header lines are omitted, as on every other ticket in this repo.

**Duplicate check.** Title-only keyword grep on `retro`, `detector`, `packages` returned two files, neither a match on substance: P058 (architect and jtbd edit-enforce hooks should exclude `docs/retros`) and P029 (work-problems iteration boundary leaves run-retro briefing edits uncommitted). The hang-off-check signal pre-filter over `open/` and `verifying/` bodies for `ADR-049`, `wr-retrospective` and `run-retro` returned zero candidates, so the subagent dispatch short-circuited on an empty candidate set and this captured as a new ticket.
