# Problem 130: Two run-retro detectors assume a packages/ monorepo and produce nothing in a consumer repo

**Status**: Known Error
**Reported**: 2026-08-08
**Priority**: 10 (High), Impact: 2 x Likelihood: 5, derived at capture from the description. Impact is 2 because the failures are advisory surfaces, not reader-facing or release-path: no visitor, no subscriber, no build. It is not 1 because one of the two (the Tier-3 budget pass) is load-bearing for a rotation decision the retro has to make, and its absence is silent. Likelihood is 5 because both fire deterministically on every retro run in this repo, which is a consumer repo by construction; observed 2026-08-08.
**Origin**: internal
**Effort**: S, derived at capture. One path substitution in a SKILL body and one guard clause in a detector script, each with an existing test sibling. Same size class as P129, also rated S for a guard clause in one script.
**WSJF**: 20.0 = (10 x 2.0) / 1 (re-rated 2026-08-28 review: Open -> Known Error auto-transition, status multiplier 1.0 -> 2.0)

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

**Third site, found the same day.** `/wr-retrospective:analyze-context` Step 0 is a guard that runs `test -x packages/retrospective/scripts/measure-context-budget.sh` and instructs halting if the primitive is missing. In a consumer repo the test always fails, so the guard would halt the deep layer permanently. It only did not, on 2026-08-08, because Step 1 invokes the same measurement through the correct `wr-retrospective-measure-context-budget` shim, so the analysis proceeded past a guard that had already declared the tool absent. That is worse than the two sites above: a fail-open guard that is wrong in every consumer repo trains its reader to skip it. Recorded in `docs/retros/2026-08-08-context-analysis.md` under Policy Breaches.

**Two further sites, found 2026-08-08 during the maintainer-persona iteration's retro.** Both are the same defect in a different shape: the SKILL names a `packages/retrospective/scripts/*.sh` path for a detector that ships no `$PATH` shim at all, so there is nothing to invoke by any route in a consumer repo.

- Step 2d's R6 numeric gate instructs invoking `packages/retrospective/scripts/check-ask-hygiene.sh` to read the cross-session ask-hygiene trail and detect the "lazy count >= 2 across 3 consecutive retros" condition. No `wr-retrospective-check-ask-hygiene` shim exists.
- Step 4b Stage 1 names `packages/retrospective/scripts/check-tickets-deferred-cause.sh` as the advisory that surfaces Tickets-Deferred rows lacking a valid `cause:`. No shim for it either.

Confirmed by listing the plugin's shipped shims at `~/.claude/plugins/cache/windyroad/wr-retrospective/0.27.0/bin/`, which holds nine `wr-retrospective-*` commands: `check-autocreate-rfc-scope`, `check-internal-id-leaks`, `check-plugin-maturity-drift`, `check-readme-jtbd-currency`, `check-skill-md-budgets`, `check-tarball-shipped-shims`, `list-plugin-attribution`, `measure-context-budget`, `migrate-briefing`. Neither ask-hygiene nor tickets-deferred-cause nor briefing-budgets is among them. So the budget pass in defect (1) is not merely a site that was left behind on the shim migration; its shim was never shipped. The R6 gate was substituted by hand this retro (read the last four `docs/retros/*ask-hygiene.md` files, all lazy count 0, gate does not fire), which works only because the trail is small.

This widens the Fix Strategy: the first bullet below is not a one-line path substitution, it also needs the shim to be authored and shipped, and the same is true for the two sites above.

**Second occurrence 2026-08-09, with the consequence now measured.** The missing briefing-budgets shim reproduced one day later in the ADR-049 / JTBD-006 iteration's retro; nothing had changed, so it failed the same way. What that iteration adds is the cost, which was previously unquantified. Hand-measuring `docs/briefing/*.md` found **eight files at or above the 5,120-byte ADR-040 Tier 3 threshold**, none of which any automated surface can see: `what-you-need-to-know-archive-early.md` 9,379 (1.83x), `what-you-need-to-know.md` 8,983 (1.75x), `what-will-surprise-you-archive-early.md` 8,499 (1.66x), `what-will-surprise-you.md` 7,600 (1.48x), `what-you-need-to-know-archive.md` 7,059 (1.38x), `governance-iteration-friction-2026-08-08-adr-048-iter.md` 6,965 (1.36x), `what-will-surprise-you-archive.md` 6,617 (1.29x), `README.md` 6,427 (1.26x). None reaches the 2x MUST_SPLIT line, so all eight are Branch B, which Step 3 marks rotation-required rather than deferrable. The briefing bucket also grew 24.7% this cycle. So the unenforced budget is not theoretical: the surface it governs is over budget across the board and growing, and the only reason anyone knows is that a retro measured it by hand. Full working in `docs/retros/2026-08-09-context-analysis.md` § Policy Breaches.

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

**Anchoring: JTBD-400 (Trust what the loop did while I was away), Internal Maintainer persona.** The elicitation queued at capture was answered on 2026-08-08: Tom directed that the missing persona be written, and `docs/jtbd/internal-maintainer/` now models the person who operates the governance loop. This ticket is direct evidence for that job's first two outcomes, that a surface which cannot run says so rather than producing nothing, and that an advisory surface honours its stated contract. The fix site is upstream, so [JTBD-402](../../jtbd/internal-maintainer/JTBD-402-land-the-fix-where-the-defect-lives.proposed.md) governs how it lands; JTBD-400 is why it matters. The persona and job are `human-oversight: unconfirmed`: Tom directed that they be written and has not yet read them, so this anchoring is provisional until `/wr-jtbd:confirm-jobs-and-personas` ratifies it. Per local convention the anchoring is recorded in prose here rather than as `**JTBD**` / `**Persona**` header lines.

**Duplicate check.** Title-only keyword grep on `retro`, `detector`, `packages` returned two files, neither a match on substance: P058 (architect and jtbd edit-enforce hooks should exclude `docs/retros`) and P029 (work-problems iteration boundary leaves run-retro briefing edits uncommitted). The hang-off-check signal pre-filter over `open/` and `verifying/` bodies for `ADR-049`, `wr-retrospective` and `run-retro` returned zero candidates, so the subagent dispatch short-circuited on an empty candidate set and this captured as a new ticket.
