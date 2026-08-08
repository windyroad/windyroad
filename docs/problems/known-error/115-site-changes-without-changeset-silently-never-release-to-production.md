# Problem 115: Site changes land on master without a changeset and silently never release to production

**Status**: Known Error
**Reported**: 2026-07-14
**Priority**: 12 (High), Impact: 3 x Likelihood: 4, derived at capture from the description
**Origin**: internal
**Effort**: M, derived at capture
**WSJF**: 12.0 = (12 x 2.0) / 2

## Description

Site changes land on master without changesets, so they silently never release to production. Production deploys only when the `publish` branch advances via the changeset-release flow: a changeset on master triggers the main-pipeline "Create release PR" job, whose merge to `publish` runs publish-pipeline's `netlify deploy --prod`. Commits with no changeset produce no release PR, so `publish` never moves and the change stays live-invisible on master indefinitely.

Concrete failure: ADR-041's consulting-funnel retirement (commits d358fe3 through ee17f15, landing on master from around 2026-07-07 onward) sat green on master but unreleased for a week. The old pitchy funnel stayed live in production the whole time. The gap was only discovered when Tom saw the live site still showing the old funnel and asked "did you release???". At that point master was 10 commits ahead of publish with 0 changesets pending.

There is no nudge at the point a site-affecting commit lands without a changeset. push-watch does surface a WIP nudge, but only after 3 or more unreleased commits OR a 24h age threshold, and only when zero changesets exist. That fired too late and too quietly here: the retirement accumulated unreleased for a week without anyone acting on the nudge.

Candidate fix strategies:

- (a) A commit-time or push-time gate or nudge that detects site-source changes (`src/app`, `src/components-next`, `netlify.toml`, and similar) landing without a changeset, and prompts to author one before the change can accumulate unreleased.
- (b) Tighten the existing push-watch unreleased-commits nudge thresholds specifically for site-source paths (lower the count and age triggers, or escalate the nudge from advisory to blocking).
- (c) Documentation or runbook making explicit that site changes require a changeset to reach production.

Evidence: session 2026-07-14 releasing the ADR-041 retirement. `git log origin/publish..origin/master` showed 10 commits; `.changeset/` held only `README.md` and `config.json`.

## Symptoms

- The live site keeps serving content the repo has already replaced, with nothing red anywhere: master is green, CI passes, no gate fires.
- `git rev-list --count origin/publish..origin/master` is greater than zero while `.changeset/` holds only `README.md` and `config.json`.
- push-watch prints "No pending changesets" and pushes cleanly, which reads as "nothing to release" rather than "the release path is not armed".
- The gap is found by looking at the live site, not by any instrument. In the witnessed case the detection was Tom asking "did you release???".

## Workaround

Author a changeset for the accumulated site work (`npx changeset`), push it, let the changesets action open the `pipeline: release` PR, then run `npm run release:watch` to merge to `publish` and deploy. This is the manual recovery run in the 2026-07-14 session.

## Impact Assessment

- **Who is affected**: site visitors first, and whoever landed the change second. A visitor reads a position the project has already abandoned. The author believes work shipped that did not.
- **Frequency**: once per site-affecting change that lands without a changeset. Rare in absolute count, because most commits here are docs, tickets and newsletter drafts, but the ones it catches are the ones that mattered enough to change the site.
- **Severity**: the observed instance is the ceiling, not the floor. ADR-041 retired the consulting funnel because the project no longer takes consulting work; for a week the live site kept selling it. The exposure window has no natural end, since nothing in the pipeline gets louder over time.
- **Analytics**: none instrumented, and the signal would be hard to instrument from inside the repo, because the failure is defined by the difference between what master says and what production serves.

## Root Cause Analysis

The causal chain in the Description is confirmed against the files, not inferred:
`.changeset/config.json` sets `baseBranch: master`; `.github/workflows/main-pipeline.yml`
runs `changesets/action` with `branch: publish` and title `pipeline: release`;
`.github/workflows/publish-pipeline.yml` triggers on push to `publish` and runs
`npx netlify deploy --dir=out --prod`. No changeset, no release PR, no `publish`
movement, no deploy.

**The root cause is not that the discipline is missing. It is that the discipline
exists and cannot see this repo.** The `wr-itil` plugin ships
`hooks/itil-changeset-discipline.sh` (upstream P141), a `PreToolUse:Bash` hook that
denies a `git commit` staging publishable source with no changeset. It is installed
and running here. Its detection helper `hooks/lib/changeset-detect.sh` classifies
staged paths with `case "$path" in .changeset/*.md) ... packages/*) ... *) # Non-packages/
path: always allow`. This repo has no `packages/` tree; its site sources are under
`src/`. Every site path falls into the always-allow branch, so the hook cannot fire
here and never has.

That is a sharper diagnosis than "no nudge exists", and it changes what the fix has
to be. The gate is not absent, it is silently scoped past. A gate that runs and
reports nothing is weaker evidence than it looks, and this one has been reporting
nothing on every site commit in this repo since it was installed.

**The existing push-watch nudge is a second-order cause, not the primary one.**
`scripts/push-watch.sh` check 3 does report unreleased commits, but it is post-push,
unscoped, and gated at 3 or more commits or 24 hours of age. During the ADR-041 week
it fired and went unacted-on for seven days. The lesson is not that its thresholds
are too loose. It is that an advisory on this surface has already been observed to
fail, which is why fix candidate (b) is not the direction taken below.

### Judgement on this session's four pushes

This session pushed master four times with zero changesets and push-watch reported
"No pending changesets" on each. Read against this ticket's own definition, **none of
the four is evidence for it.** Every batch was docs, tickets and briefing files, none
of which the build reads, so nothing was stranded and production was never stale.

They are still worth recording, because they are the strongest available argument for
scoping. A correctly path-scoped gate stays silent on all four. Fix candidate (b),
tightening the global unreleased-commits thresholds, would have nagged four times
tonight for nothing, and a gate that fires on the weekly newsletter-draft commits gets
bypassed out of habit and is then worth nothing when a real site change comes through.
The benign case is the design constraint.

### Investigation Tasks

- [x] Investigate root cause. Done: the upstream changeset-discipline hook is `packages/`-scoped and structurally inert in a consumer repo, and the existing push-watch nudge is advisory and already observed to fail. Recorded above.
- [x] Create reproduction test. Reproduced by inspection rather than by execution, because executing it means shipping a stale site: `git ls-tree origin/publish` versus `origin/master` on the ADR-041 range, plus the always-allow branch in `changeset-detect.sh`. The durable test is the drift test specified in the Fix Strategy, which fails when a build input stops being covered.
- [ ] Blocked, needs Tom: ratify the `internal-maintainer` persona and JTBD-400/401/402 via `/wr-jtbd:confirm-jobs-and-personas`. The JTBD reviewer will not pass the change while it reasons from an unratified persona.
- [ ] Blocked, needs Tom: two jobs are missing and neither is an agent's to write. See the Fix Strategy's blocked-on section.

## Fix Strategy

Candidate (a) refined, candidates (b) and (c) rejected on the evidence above. The
design below is what two rounds of `wr-architect:agent` and three rounds of
`wr-jtbd:agent` converged on. It is fully specified and ready to apply. **It is not
applied**, because the last two blockers are ratifications only Tom can give; see the
blocked-on section.

**Where it lives.** A pre-push halt in `scripts/push-watch.sh`, after the existing
`ci-status-check.sh` call and before `git push`. Not a `.claude/hooks/` commit gate:
the architect found that ADR-028 considered a repo-local hook for this exact class and
rejected it, choosing wrapper-layer defence-in-depth on the ADR-021 precedent, and a
second `PreToolUse:Bash` gate on `git commit` reinstates the layering problem ADR-028
named. The wrapper is also the smaller change, needing no new file and no
`settings.json` wiring, and it sits at the loss boundary: the loss is "on master,
unreleased", not "committed locally".

**Shape.** Two pure helpers behind the script's existing `PUSH_WATCH_LIB_ONLY=1` test
seam, alongside `deps_gate_route` and `manifest_refresh_route`:

- `is_site_path <path>` returns 0 when the path is a build input.
- `site_changeset_route <site-paths> <changeset-paths>` returns `halt` when site paths
  are present and changeset paths are not, `ok` otherwise.

**Site-affecting set**: `src/app/`, `src/components-next/`, `src/lib/`, `src/styles/`,
`src/img/`, `src/articles/`, `public/`, `netlify.toml`, `next.config.mjs`,
`scripts/generate-og-image.mjs`. Excluded: test files, `src/newsletters/`,
`src/social/`, `src/articles-draft/`, `docs/`, the rest of `scripts/`.

`scripts/generate-og-image.mjs` is in the set because `package.json`'s `prebuild` runs
it and it writes `public/img/og-image.png`. Closed P006 is that omission having already
shipped once, and the architect caught it because the first draft excluded `scripts/`
wholesale.

`package.json` and `package-lock.json` are genuine build inputs, since `output:
'export'` makes the dependency tree part of the bundle, and are nonetheless **out**,
deliberately. push-watch auto-commits `chore(deps)` under ADR-021 upstream of this
gate, so including them would halt an AFK run whose only change is machine-authored,
which is P111's recorded chain again and is in tension with ADR-021's confirmation
criterion that the AFK drain no longer halts on that symptom. How a machine-authored
dep refresh should reach production is a separate open question, queued. `tsconfig.json`
and `.nvmrc` are out on the same deliberate basis.

**Mechanics**, each one a review finding rather than a default:

- Guarded to `master`. The premise "commits accumulate unreleased" only holds there,
  and push-watch is written to run on other branches.
- Range is `git diff --name-only origin/publish...HEAD`, three-dot. `release-watch.sh`
  force-sets `publish` to master's SHA after each release, so in steady state the two
  forms agree; they diverge only in the window after the release PR merges and before
  the version sync-back completes, where two-dot would report `publish`-side changes
  master never authored and fire on a delta that is not a defect.
- An explicit `git fetch origin publish` first. A narrowed `remote.origin.fetch` would
  otherwise leave `origin/publish` stale and the gate over-fires silently.
- **Changeset presence is tested over the same committed range**, not the working tree.
  This is the load-bearing detail. A changeset sitting unstaged is not in the push, so
  `publish` still never advances, and a working-tree test would pass the gate and leave
  the defect live with a green light on it.
- Fail-open when `origin/publish` will not resolve, but loudly, on stdout as well as
  stderr, so it reaches the run's captured output rather than only a watched console.
  A silent skip is the same shape as the defect being fixed.
- No bypass variable. push-watch already halts on stale deps with `exit 1` and no
  escape, so this is in character. It differs deliberately from the acknowledgement
  marker ADR-028 put on the CI halt immediately above: a red CI can be someone else's
  problem and unfixable from here, whereas authoring a changeset is always available to
  the halted operator.

**The halt message names an executable remedy, not `npx changeset`.** This was the
JTBD reviewer's decisive finding and it nearly sank the halt. The persona this serves
is frequently absent while the work runs, so a halt whose only prescribed remedy is
interactive converts a silent non-release into a silent non-push, the same loss moved
one stage earlier. The reviewer supplied what dissolves it: changesets here are
hand-authored `.changeset/*.md` files landed as their own commits (`c7865a9`,
`8effe2f`, `3fc0961`), so an unattended agent can clear this gate without a prompt. The
message therefore prints the offending paths, then the literal `cat > .changeset/....md
<<'CS'` heredoc with frontmatter, the `git add`, the `git commit`, and the re-run.

**Check 3 stays, and its remedy line changes in the same diff.** Check 3 is post-push,
unscoped, threshold-gated and advisory; this gate is pre-push, path-scoped and
zero-tolerance. Different timing, surface and verdict class, so it is not the option-(b)
threshold tighten and not a duplicate. After this lands it will only ever fire for
non-site accumulation, which the ADR must state or a later reader will simplify by
deleting one of the two and silently reopen half of this ticket. Its current line
`Run \`npx changeset\` to describe what's shipping.` must be pointed at the same
file-and-commit recipe or dropped: leaving two remedies for one condition, one of them
unexecutable by the actor that will most often meet it, is the trap this fix exists to
close.

**Drift test.** `is_site_path` is a hand-listed set, and a hand-listed set goes stale
quietly, which turns a deny into false confidence. `scripts/push-watch.test.mjs` gains
cases that derive the build-input set from `package.json`'s `prebuild`/`build` chain
and scan non-test source for both `process.cwd()` and `new URL(..., import.meta.url)`
path literals, asserting each is covered. The premise that build inputs arrive only via
`process.cwd()` is false, which is how the OG-image script was missed. ADR-041 makes it
plausible that a route will one day render out of `src/newsletters/published/`; when it
does, the test fails loudly instead of the gate going quietly silent. Plus a case
pinning the committed-range changeset test: site path committed, changeset present in
the working tree only, expect halt.

**ADR.** The change needs its own ADR, on the architect's ruling: it is a new
enforcement gate plus a commitment to maintain a downstream duplicate of upstream
tooling, which is the class ADR-036 warns about and the class ADR-028 and ADR-021 each
got an ADR for. It carries a retirement clause naming what gets deleted when upstream
path-scoping lands, modelled on ADR-028's "delete the script and the call sites", and
ships `human-oversight: unconfirmed` on the ADR-049 precedent for Tom to drain via
`/wr-architect:review-decisions`. It must land in the same commit as the implementation,
or a later review fires on an ADR reference that is not yet on disk. Every cross-series
reference in it is written as `upstream ADR-NNN (agent-plugins)`, since this repo and
the upstream both number from 001. `docs/decisions/README.md` is regenerated and staged
in the same commit.

**No changeset for the fix commit itself.** `scripts/push-watch.sh`, the test file and
the ADR are not build inputs, so by this gate's own definition they change nothing a
visitor receives. The design is self-consistent on that point: if the fix needed a
changeset by its own rule, the rule would be wrong.

**Blocked on, and neither is an agent's call:**

1. **Ratification.** The design reasons from the `internal-maintainer` persona and
   JTBD-400/401/402, all `human-oversight: unconfirmed`. The JTBD reviewer will not pass
   while executable code is built on an unratified anchor. `/wr-jtbd:confirm-jobs-and-personas`.
2. **Two missing jobs.** The release path has no job on either side and no row in the
   Job-to-Screen Mapping. The reader side has no outcome saying the site should reflect
   what the project currently means, so the stale funnel week is legible only as "a
   retired job kept being served". The maintainer side has none either: JTBD-400/401/402
   are about the loop's instruments, and a commit that never reaches production is not an
   instrument failure. Until both exist, the friction-versus-loss trade this design makes
   rests on an unweighted scale.

   These are not written here on purpose. A new job is direction-setting and needs Tom,
   and writing the reader's job in an agent's words to justify the agent's own halt is
   precisely the collapse the persona's "not the readers' interests by proxy" clause
   forbids. Both reviewers agreed on that point.

**Where the reviewers landed.** `wr-architect:agent`: ISSUES FOUND twice, the second
round producing the OG-image hole, the manifest split, the committed-range test, the
branch guard and the cross-series citation trap, all folded in above. `wr-jtbd:agent`:
ISSUES FOUND three times; it withdrew its objection to the halting form in round three
once the remedy became mechanical, and its remaining findings are the two blockers plus
the Check 3 remedy line. The halt survives on the asymmetry it named: the advisory
alternative is the thing already observed to fail for seven days, and shipping a second
advisory ships the documented anti-outcome.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P012 (CI-status ship gate on push/release), P046 (risk-scorer changeset accounting)

## Related

Captured via /wr-itil:capture-problem; expand at next investigation.

- P012 (`docs/problems/closed/012-no-ship-gate-on-push-publish-deploy.md`, since closed; the path recorded here previously said `verifying/` and was stale). Adjacent ship-gate concern, but P012 gates on red CI; this ticket is the distinct missing-changeset-authoring nudge for site changes. P012's closure is **not** evidence that this ticket is resolved, and the relevance evaluator has now twice been told otherwise by a script that reads the number and not this sentence: see the note below.

**Relevance-evaluator false positive, 2026-08-09.** `wr-itil-evaluate-relevance` returned
`CLOSE-CANDIDATE-WITH-CAVEAT` on this ticket, citing ADR-041 as an ADR whose shipping proves the
fix landed, and closed P012 as a closed driver. Both citations are wrong in the same way. ADR-041 is
this ticket's exhibit, the change that sat unreleased, not its remedy; the two share a date because
the same session produced both. P012 is declared above as a distinct concern, in words. The ticket
was NOT closed on that verdict, and the verdict is recorded as the third witness on P132 and posted
upstream at https://github.com/windyroad/agent-plugins/issues/414#issuecomment-5227689280.
- P046 (`docs/problems/parked/046-risk-scorer-treats-changesets-as-queued-when-underlying-commits-are-already-on-origin.md`). Adjacent changeset-accounting concern in the risk scorer, distinct from the missing-changeset-authoring gap here.
- ADR-041 (`docs/decisions/041-retire-consulting-funnel-repurpose-as-the-shift-hub.proposed.md`). The change whose week-long unreleased state surfaced this gap.
