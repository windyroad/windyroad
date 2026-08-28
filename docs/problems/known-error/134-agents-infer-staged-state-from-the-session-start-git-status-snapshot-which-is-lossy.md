# Problem 134: Agents infer staged state from the session-start git status snapshot, which is lossy on its first line

**Status**: Known Error
**Reported**: 2026-08-09
**Origin**: internal
**Priority**: 8 (Medium), Impact: 2 x Likelihood: 4, derived at capture from the description. Impact is 2 because the harm is dev-tooling friction and audit-trail noise, not a visitor or reader surface: a re-score round trip, plus a risk report that names a Medium risk item which does not exist. It is not 1 because the second-order effect is a real control: an orchestrator that learns to wave away the scorer's staged-set finding has stopped reading the one check that would catch in-flight work genuinely being swept into a commit. Likelihood is 4 because the snapshot is handed to every session, the first listed path is modified in most dirty worktrees, and any question of the form "is X staged" routes an agent straight at it. Observed once on 2026-08-09, but the trigger is present at the start of every session.
**Effort**: S, derived at capture and re-rated 2026-08-29 (bucket unchanged). Still one convention line in the reviewer-dispatch prompt shape. The capture-time rationale gave the wrong reason for there being no local code change, blaming the framework-injected snapshot; the actual reason is that this repository carries no source tree for the two plugins whose prompts hold the fix site, so the change lands upstream. The size of the change itself is what sets the bucket, and that has not moved. Comparable to P129 and P133, both rated S.
**WSJF**: 16.0 = (8 x 2.0) / 1 (re-rated 2026-08-28 review: Open -> Known Error auto-transition, status multiplier 1.0 -> 2.0)

## Description

The SessionStart briefing hands each session a `git status` block in porcelain-like form. Porcelain uses two columns, index then worktree, so an unstaged worktree modification is ` M path` with a LEADING SPACE standing in for the blank index column. In the snapshot as rendered, the FIRST entry loses that leading space and reads `M path`, which is the staged form. Every subsequent line keeps its space.

On 2026-08-09, during the P129 iteration, the `wr-risk-scorer:pipeline` agent read `M output/pdf/paper.pdf` off that snapshot, concluded Tom's in-flight research paper was staged for commit, and returned STOP with a Medium risk item for "in-flight research work swept into a governance commit". The file was never staged. `git status --porcelain output/pdf/paper.pdf | cat -A` shows ` M output/pdf/paper.pdf$` with the leading space intact as a real byte, and `git diff --cached --name-only` never listed it. Nothing needed unstaging; the staged set was correct throughout. Cost was a full re-score round trip.

The defect reaches any read-only subagent granted no Bash tool, because without Bash it cannot read the git index at all. That is true of the risk scorer, which holds only Read and Glob, and of the architect, which holds Read, Glob and Grep. It is not true of the jtbd reviewer, which does hold Bash and can check the index itself. See the Findings section below for the verified tool grants. When an agent that cannot see the index is asked to verify a staging precondition it must reason from whatever the orchestrator handed it, and the session-start snapshot is simultaneously the most available and the most wrong source. The scorer behaved correctly given its inputs, and explicitly flagged that it could not verify the claim itself. The fault is in the input, and in the orchestrator convention that did not supply a better one.

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

Two causes compose. The first has no fix path anyone here can reach; the second has one, and it runs through an upstream pull request rather than through this repository. See the Fix Strategy section for where each lands.

The first is that the snapshot's rendering strips a semantically load-bearing leading space from its first line. In porcelain, column 1 is the index status and column 2 the worktree status, so ` M` and `M ` are different facts, and the difference is one space at the start of the line. Whatever trims that line for display cannot know the space is data.

The second is a convention gap on the orchestrator side. Read-only subagents are asked to verify preconditions about repository state they have no tool to observe. The correct discharge is for the caller to supply the observation. The agent has no tool that could obtain it. This repo already applies that discipline in the other direction, asking the scorer to verify an artefact's claims against disk; the staging axis is the case where the agent cannot comply no matter how willing, because the index is not a file it can read.

### Investigation Tasks

- [x] Decide where the convention belongs: a line in the risk-scorer prompt shape used by `/wr-itil:work-problems` and the transition skills, a briefing entry only, or both. Answered 2026-08-29: **both, and the briefing half is not durable on its own.**
- [x] Check whether the other read-only reviewers (architect, jtbd) are ever asked staging-shaped or working-tree-shaped questions, and whether they have hit the same trap silently. Answered 2026-08-29: **no silent hit found; only the ad-hoc dispatch is exposed.**
- [x] Confirm whether the snapshot's first-line trim is worth reporting upstream, and to which repo. Answered 2026-08-29: **the only channel is the Claude Code public issue tracker, and it is not worth iteration budget.**
- [ ] Consider whether the scorer should be instructed to REFUSE to score a staging precondition it was not handed data for, rather than scoring it at reduced confidence. The observed pass held the likelihood at 2 rather than 1 and said why, which is the honest behaviour; the question is whether honest-but-scored or explicit-refusal produces the better orchestrator response. **Still open, and deliberately left as backlog rather than put to the maintainer.** It is a second candidate change in a different artefact from the convention line, so the Fix Strategy below is scoped to the observed defect only and does not pre-decide this. It is also not yet in a shape worth anyone's attention: it is an unworked two-way fork with no recommendation behind it, and the material to form a recommendation is in hand. Whoever next works this ticket should reason it to a recommendation first and put that up for accept-or-reject, rather than handing over the fork.

### Findings, 2026-08-29

Each claim below was checked against the file on disk in the same session that recorded it.

**Where the convention belongs.** The briefing half has already decayed. The entry now sits in `docs/briefing/what-will-surprise-you-archive.md`, rotated out of the live tier, and `docs/briefing/README.md` carries no Critical Points bullet on it any more. A session opened today is not warned about this defect at all. That answers the task's question, and it rules out the briefing-only option: rotation retires an entry on its own schedule, with no reference to whether the underlying defect is still live, so a briefing entry cannot be the durable home for a convention that has to hold every time. The durable home is the prompt shape, and it is missing there. In the installed `wr-itil` 2.1.0 `work-problems` SKILL, `git diff --cached` appears twice, both times as the orchestrator running it to decide whether to salvage an iteration's work or halt, once on the salvage branch and once on the halt branch. Neither the block that constrains what an iteration dispatch may do, nor the commit-gate dispatch, says anything about handing a reviewer real index output. The installed `wr-risk-scorer` 0.18.17 `pipeline` agent has no mention of staging, the index, or `git status` anywhere in its prompt.

**Whether the other read-only reviewers hit the same trap.** The blindness is real but unevenly distributed, and the two on-demand skills already discharge it. `wr-architect:agent` 0.21.4 declares tools Read, Glob and Grep, with no Bash, so it cannot read the index and has exactly the scorer's exposure. `wr-jtbd:agent` 0.13.3 declares Read, Glob, Grep and Bash, so it can verify a staging claim itself. But both on-demand skills already do the caller's job for it: `/wr-architect:review-design` and `/wr-jtbd:review-jobs` each run `git diff --cached --stat` and `git diff --cached --name-only` in the skill body before the reviewer is dispatched, so on those paths the reviewer is handed real index output rather than left to infer. No false PASS from this class was found. That leaves one path: the ad-hoc dispatch, where an orchestrator hand-writes a reviewer prompt and no skill body has run the git command first. That is exactly the shape the 2026-08-09 call took. That narrowing is what makes the prompt-shape change the right fix rather than a change to the agents' tool grants.

**Whether the trim is worth reporting upstream.** The block is injected by the Claude Code harness, labelled "This is the git status at the start of the conversation", and it arrives in harness-injected context. A grep of this repository's hooks and the installed plugin hooks found nothing that emits it, which is consistent with that but is not by itself proof of absence. The positive evidence is the label. There is no clone to raise a pull request against. The only channel is the Claude Code public issue tracker. It is also not reproducible on demand: the snapshot is injected once at session start, so a session that opens on a clean tree cannot exercise the defect at all, and the 2026-08-09 observation remains the only evidence anyone has. Recommendation: mitigate locally through the convention and leave the harness half alone.

## Fix Strategy

Scoped to the observed defect. Investigation task 4 is still open, and whether the scorer should refuse rather than score at reduced confidence is a separate candidate change in a different artefact; nothing here pre-decides it.

**What the fix is.** One convention line in the prompt shape, saying that when any read-only reviewer is asked to verify a staging or working-tree precondition, the caller hands it real `git diff --cached --name-only` output and states that the session-start snapshot must not be used for staging inference. The party who can verify does the verifying, which is the discipline this repository already applies in the other direction when it asks a reviewer to check an artefact's claims against disk.

**Where it lands.** The fix site is upstream, and the ADR-036 classification predicate holds on all three conditions, verified 2026-08-29:

1. A specific fix site is identified. Two, in fact: the iter-dispatch constraint block in `packages/itil/skills/work-problems/SKILL.md`, where the sibling tool-discipline constraints for the bats-polling and turn-end-background classes already live, and `packages/risk-scorer/agents/pipeline.md`, whose prompt says nothing at all about how the agent should obtain staging facts.
2. Both sites live inside the plugin-cache root, and the defect is present on the latest cached version of each. `~/.claude/plugins/cache/windyroad/wr-itil/2.1.0/skills/work-problems/SKILL.md` mentions `git diff --cached` only where the orchestrator decides whether to salvage an iteration's work or halt, never as a convention for dispatching a reviewer. `~/.claude/plugins/cache/windyroad/wr-risk-scorer/0.18.17/agents/pipeline.md` has no mention of staging, the index or `git status` anywhere, and grants the agent only Read and Glob, without even Grep.
3. This repository carries no `packages/` tree for either plugin.

The cache is the copy that runs and cannot be durably edited. The tree to contribute from is the ordinary working clone at `~/Projects/agent-plugins`, on the same remote.

**How it lands.** As an upstream pull request raised from that clone, per ADR-048 (Prefer a pull request over an issue when the upstream accepts them, `human-oversight: confirmed` with `oversight-date: 2026-08-08`; its `status` string still reads proposed, which is this repo's convention and not a sign the decision is unsettled), which amends ADR-036 so that a pull request rather than an issue is the default outbound artefact and a park is a staging state rather than a terminal one. Two obligations ride with it. The pull request carries its own RFC and problem trace like any other fix, per ADR-048's statement that "the pull request that implements the mechanism *is* a fix, and it carries the RFC and problem trace like any other", and per ADR-045, whose Scope leaves those obligations untouched. The pull request body is outbound prose, so it is scored by the external-comms gate under ADR-012 and ADR-015 before it is opened.

**Why the ticket is still Known Error rather than parked.** The reason is sequencing. ADR-036's park-transition workflow puts the outbound artefact at step 3 and the status transition at step 4, and no pull request has been opened yet, so parking now would break the order. This is a deferred park, not a permanent Known Error. The transition trigger is the moment the pull request opens: the ticket then parks with a `## Park Reason` citing ADR-036 and ADR-048 and naming the verified cached versions plus the pull-request URL, and un-parks when that pull request merges, which ADR-048 adds to ADR-036's un-park trigger set. ADR-048 records the clone as reachable and permitted. P175 tracks the misreading that reads a hold like this one as a block.

The 2026-08-29 AFK iteration that recorded these findings did not work the upstream clone, and it did not implement a fix here either, because `wr-itil-check-fix-rfc-trace` exits 3 on the branch that says the repository holds no story maps at all. That branch's own instruction is to record one item for the maintainer and carry on rather than draw the first map automatically, since drawing it decides what the journey is. P175 (`docs/problems/open/175-afk-orchestrator-external-root-cause-instruction-still-encodes-the-pre-adr-048-park-posture.md`) tracks the unsettled half of how AFK iterations should treat upstream-rooted work.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P127, P129, P174 (P129 is Closed and contributes nothing to the transitive-effort closure)

## Related

- **P127** (`docs/problems/open/127-unverified-subprocess-claims-propagate-into-decisions-without-reading-the-source.md`): the same family, from the other end. P127 is about a consumer propagating a subagent's unverified claim; this is about a subagent being handed a bad premise it cannot check. The shared discipline is that the party who CAN verify must do the verifying, and here that party is the caller.
- **P129** (`docs/problems/closed/129-sourcing-a-repo-script-to-probe-a-helper-runs-its-whole-flow.md`, now Closed): the iteration in which this was observed. The scorer's STOP on P129's fix commit is the evidence, and it is the only observation this ticket has, so the pointer has to resolve. Path corrected 2026-08-29; it had been written against `known-error/` and P129 has since closed.
- Anchoring, in prose only. The **internal-maintainer** persona (`docs/jtbd/internal-maintainer/persona.md`) describes who this costs: someone absent while the loop runs, for whom a false STOP burns an iteration nobody is watching. The persona and its jobs carry `human-oversight: confirmed` with `oversight-date: 2026-08-09`, so the provisional caveat this ticket carried at capture is stale and has been dropped. The primary job is **JTBD-400** (Trust What the Loop Did While I Was Away). One of its outcomes is that a verdict rests on the relationship it claims, not on a string that looks like one. That is this defect exactly: the scorer grounded a STOP in `M path`, a string that only resembled a staged entry. Another of its outcomes is that checking should not cost more than it returns, and the re-score round trip is that cost. **JTBD-402** (Land the Fix Where the Defect Lives) is the secondary anchor, for the Fix Strategy half. Persona and JTBD header lines omitted per this repo's local convention for maintainer-tooling tickets.
- **P174** (`docs/problems/open/174-briefing-rotation-scores-how-often-an-entry-is-used-never-what-rediscovering-it-costs.md`): the general form of this ticket's first finding. P174 says briefing rotation scores how often an entry was used and never what rediscovering it costs, so a rarely-needed warning decays into an archive that nothing loads. This ticket's own briefing entry is a worked instance: it rotated out, and a session opened on 2026-08-29 was not warned about the defect the entry existed to warn about. The two were captured independently on the same day and found the same mechanism from opposite ends.
- **P175** (`docs/problems/open/175-afk-orchestrator-external-root-cause-instruction-still-encodes-the-pre-adr-048-park-posture.md`): tracks the unsettled question of how an AFK iteration should treat work whose fix site is upstream. Relevant to this ticket's Fix Strategy, which names an upstream pull request as the landing path.
- **ADR-036** (`docs/decisions/036-marketplace-consumer-cannot-edit-cached-plugin-park-classification.proposed.md`) supplies the classification predicate and the park-transition workflow; **ADR-048** (`docs/decisions/048-prefer-an-upstream-pull-request-over-an-issue.proposed.md`) amends it so the outbound artefact is a pull request and a park is a staging state. Both are cited in the Fix Strategy. Note for whoever runs ADR-036's reassessment, dated 2026-08-31: this ticket is live evidence for its bullet on the cost of producing an outbound artefact per park, which is higher under a pull request than under the issue baseline that ADR was measured against.
- Captured via `/wr-itil:capture-problem` from the P129 iteration's retro, Step 4b Stage 1, the route for a recurring class of behaviour, under the upstream carve-out for mechanical stages recorded as upstream P342 (the qualifier matters because local numbering does not reach 342, so a reader would otherwise search this repo for it). Duplicate grep on `snapshot` / `staged` / `porcelain` returned no title matches; the pre-filter that looks for an existing ticket to hang this one off found no ADR, RFC, skill or file-path signals, so there were no candidates and no subagent was dispatched.
