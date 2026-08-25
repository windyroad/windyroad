# Problem 134: Agents infer staged state from the session-start git status snapshot, which is lossy on its first line

**Status**: Open
**Reported**: 2026-08-09
**Origin**: internal
**Priority**: 8 (Medium), Impact: 2 x Likelihood: 4, derived at capture from the description. Impact is 2 because the harm is dev-tooling friction and audit-trail noise, not a visitor or reader surface: a re-score round trip, plus a risk report that names a Medium risk item which does not exist. It is not 1 because the second-order effect is a real control: an orchestrator that learns to wave away the scorer's staged-set finding has stopped reading the one check that would catch in-flight work genuinely being swept into a commit. Likelihood is 4 because the snapshot is handed to every session, the first listed path is modified in most dirty worktrees, and any question of the form "is X staged" routes an agent straight at it. Observed once on 2026-08-09, but the trigger is present at the start of every session.
**Effort**: S, derived at capture. A convention line in the orchestrator's prompt shape plus a briefing entry; no code change is available in this repo because the snapshot is framework-injected. Comparable to P129 and P133, both rated S.
**WSJF**: 8.0 = (8 x 1.0) / 1

## Description

The SessionStart briefing hands each session a `git status` block in porcelain-like form. Porcelain uses two columns, index then worktree, so an unstaged worktree modification is ` M path` with a LEADING SPACE standing in for the blank index column. In the snapshot as rendered, the FIRST entry loses that leading space and reads `M path`, which is the staged form. Every subsequent line keeps its space.

On 2026-08-09, during the P129 iteration, the `wr-risk-scorer:pipeline` agent read `M output/pdf/paper.pdf` off that snapshot, concluded Tom's in-flight research paper was staged for commit, and returned STOP with a Medium risk item for "in-flight research work swept into a governance commit". The file was never staged. `git status --porcelain output/pdf/paper.pdf | cat -A` shows ` M output/pdf/paper.pdf$` with the leading space intact as a real byte, and `git diff --cached --name-only` never listed it. Nothing needed unstaging; the staged set was correct throughout. Cost was a full re-score round trip.

The defect generalises past that one agent. Any read-only subagent (risk scorer, architect, jtbd reviewer) has no Bash tool and therefore cannot read the git index at all. When asked to verify a staging precondition it must reason from whatever the orchestrator handed it, and the session-start snapshot is simultaneously the most available and the most wrong source. The scorer behaved correctly given its inputs, and explicitly flagged that it could not verify the claim itself. The fault is in the input, and in the orchestrator convention that did not supply a better one.

## Symptoms

A risk report names a staged file that `git diff --cached --name-only` does not list, and the named file is the FIRST entry in the session-start `git status` block. The verdict is STOP on a precondition the operator has already satisfied, and the remediation reads "unstage X" for an X that was never staged.

## Workaround

Never let a subagent infer staging from the snapshot. When asking any agent to verify a staging or working-tree precondition, paste real output into the prompt:

```bash
git diff --cached --name-only
git diff --cached --name-only | grep -E '^(research|output)/' && echo FAIL || echo "PASS: none staged"
```

State in the prompt that the session-start snapshot must not be used for staging inference. For a human reading the snapshot directly, `git status --porcelain <path> | cat -A` makes the leading space visible as a byte.

## Impact Assessment

- **Who is affected**: any agent asked to verify a staging precondition, and any orchestrator acting on its verdict. Sharpest under AFK, where a false STOP costs a re-score round trip nobody is present to short-circuit.
- **Frequency**: once observed. The trigger is present at the start of every session with a dirty worktree.
- **Severity**: Medium. No data is lost and no wrong commit is made; the cost is wasted cycles plus erosion of trust in a control that is doing real work the rest of the time.
- **Analytics**: none.

## Root Cause Analysis

Two causes compose, and only the second is fixable here.

The first is that the snapshot's rendering strips a semantically load-bearing leading space from its first line. In porcelain, column 1 is the index status and column 2 the worktree status, so ` M` and `M ` are different facts, and the difference is one space at the start of the line. Whatever trims that line for display cannot know the space is data.

The second is a convention gap on the orchestrator side. Read-only subagents are asked to verify preconditions about repository state they have no tool to observe. The correct discharge is for the caller to supply the observation, not for the agent to hunt for the nearest available proxy. This repo already applies that discipline in the other direction, asking the scorer to verify an artefact's claims against disk; the staging axis is the case where the agent cannot comply no matter how willing, because the index is not a file it can read.

### Investigation Tasks

- [ ] Decide where the convention belongs: a line in the risk-scorer prompt shape used by `/wr-itil:work-problems` and the transition skills, a briefing entry only, or both. The briefing half is done, in `docs/briefing/what-will-surprise-you.md` plus a Critical Points bullet in `docs/briefing/README.md`, landed by the same retro that captured this ticket but in a separate commit, so it may not be present in the commit that created this file. The prompt-shape change is the outstanding half and is the part that would make the convention automatic rather than remembered.
- [ ] Check whether the other read-only reviewers (architect, jtbd) are ever asked staging-shaped or working-tree-shaped questions, and whether they have hit the same trap silently. A false PASS from this class would be quieter than the observed false STOP.
- [ ] Confirm whether the snapshot's first-line trim is worth reporting upstream, and to which repo. It is framework-injected, so this project can mitigate but probably cannot fix it.
- [ ] Consider whether the scorer should be instructed to REFUSE to score a staging precondition it was not handed data for, rather than scoring it at reduced confidence. The observed pass held the likelihood at 2 rather than 1 and said why, which is the honest behaviour; the question is whether honest-but-scored or explicit-refusal produces the better orchestrator response.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P127, P129

## Related

- **P127** (`docs/problems/open/127-unverified-subprocess-claims-propagate-into-decisions-without-reading-the-source.md`): the same family, from the other end. P127 is about a consumer propagating a subagent's unverified claim; this is about a subagent being handed a bad premise it cannot check. The shared discipline is that the party who CAN verify must do the verifying, and here that party is the caller.
- **P129** (`docs/problems/known-error/129-sourcing-a-repo-script-to-probe-a-helper-runs-its-whole-flow.md`): the iteration in which this was observed. The scorer's STOP on P129's fix commit is the evidence.
- Anchoring, provisional and in prose only. The **internal-maintainer** persona (`docs/jtbd/internal-maintainer/persona.md`) describes who this costs: someone absent while the loop runs, for whom a false STOP burns an iteration nobody is watching. That anchor is provisional because the persona is unratified. No documented job covers it; the closest, JTBD-400, is about the loop's verdicts being right or visibly absent, which is arguably a fit here in a way it was not for P129, but the job is also unratified and the fit is not clean enough to claim. Persona and JTBD header lines omitted per this repo's local convention for maintainer-tooling tickets.
- Captured via `/wr-itil:capture-problem` from the P129 iteration's retro, Step 4b Stage 1 (recurring class-of-behaviour, P342 mechanical-stage carve-out). Duplicate grep on `snapshot` / `staged` / `porcelain` returned no title matches; hang-off pre-filter extracted no ADR, RFC, skill or file-path signals, so the subagent dispatch was skipped per the empty-candidates short-circuit.
