---
status: proposed
human-oversight: confirmed
oversight-date: 2026-08-09
oversight-note: ratified by Tom in session 2026-08-09, read file by file
job-id: land-the-fix-where-the-defect-lives
persona: internal-maintainer
date-created: 2026-08-08
priority: must-have
type: functional
screens:
  - /wr-itil:report-upstream
  - /wr-itil:update-upstream
  - /wr-itil:check-upstream-responses
  - docs/problems/parked/
---

# JTBD-402: Land the fix where the defect lives

## Job Statement

When a ticket's defect is in a tree other than this one, I want to drive the fix there and close the ticket on that evidence, so the backlog reflects defects actually removed rather than defects successfully described to someone else.

## Context

Most of this backlog does not resolve to code here. Counted on 2026-08-08, `docs/problems/parked/` held 16 tickets and 15 carried an explicit upstream-blocked park reason: 94%, against the 70% reassessment trigger ADR-036 set for itself.

For a long time a park was terminal, on the belief that the fix site was outside this project's authority. ADR-048 checked the belief and it did not survive: `gh repo view windyroad/agent-plugins` returns `viewerPermission: ADMIN`, and two working clones of the upstream already existed on the machine. The ADR records the finding as *"the blocker was never permission and never reachability. It was that neither clone had ever been treated as an edit path."*

The decision that followed is broader than the repos we own, deliberately: most upstreams accept pull requests from contributors with no write access at all, and scoping the change to owned repos would leave every genuine third-party dependency parked forever, *"the same dead end in a smaller box"*.

## Outcomes

1. **A park is a staging state, not a terminal one.** It records that the fix site is in another tree and that the ticket waits on a change there. The un-park trigger set includes the upstream pull request merging.
2. **The default outbound artefact is a pull request where the upstream accepts them.** An issue remains correct when the upstream takes no contributions, when the fix needs a design decision that is the maintainers' to make, or when the ticket is security-classified and belongs on a private advisory path.
3. **The outbound path itself works.** A gate that blocks an outbound filing with a message naming three causes, none of them the actual one, costs a review round and the diagnosis time, which is the expensive part (P131). Contribution friction is friction on this job.
4. **A fix reaches every adopter, not just this repo.** Landing the change in the shared plugin is what makes the round trip worth its cost, and is why local forking was rejected.
5. **Contribution happens in an ordinary working clone.** `/Users/tomhoward/Projects/agent-plugins`, never Claude Code's managed marketplace checkout, whose dirty tree would break plugin resolution for every project on the machine, and never the cache, which cannot be durably edited at all.
6. **A placement claim is verified before it is acted on.** A ticket's Fix Strategy proposing an upstream home is a proposal the maintainers can reject, not a settled fact. P130 states this on its own face.
7. **The cost of the second tree is visible and accepted, not discovered.** A pull request pays another repo's gates, changesets, review and release latency, and a ticket's audit trail then spans two histories. ADR-048 records all of it under Consequences / Bad.

## Anti-outcomes

These would satisfy a naive reading of "unblock the parked backlog" and fail the job:

- **Forking the plugin sources locally to make them editable.** Rejected as ADR-036 option (a): it splits shared tooling across two lineages to solve a contribution problem.
- **Filing better issues and waiting.** Rejected as ADR-036 option (b): it is the current behaviour, and it produced the 94%.
- **Closing a local ticket when the upstream artefact is filed.** The ticket closes on the defect being gone, not on it having been reported. `/wr-itil:check-upstream-responses` exists because filed is not fixed.
- **Contributing a diff nobody scored against the receiving repo's standards.** ADR-048 names this gap explicitly and does not close it: the prose gate reads PR bodies, the pipeline scorer reads diffs but against *our* `RISK-POLICY.md`, and ADR-008's action taxonomy has no action for opening a pull request against a repo we do not own. On a repo we own that is survivable; on a third-party repo it is how a contribution gets rejected, or accepted and regretted.

## Evidence

- ADR-048 (`docs/decisions/048-prefer-an-upstream-pull-request-over-an-issue.proposed.md`), ratified in session 2026-08-08, amending ADR-036 by section.
- ADR-036 (`docs/decisions/036-marketplace-consumer-cannot-edit-cached-plugin-park-classification.proposed.md`), whose classification predicate still governs the 15 currently-parked tickets and whose Consequences / Bad section pre-registered this outcome: *"if every WSJF=12 ticket is upstream-blocked, the project is implicitly accepting that all the dev-work-queue value is in upstream contributions, not local work."*
- Problem 131: two `gh issue create --body-file` attempts blocked after a genuine external-comms PASS while filing `windyroad/agent-plugins#413`. The block's own message named three real failure modes and none was the cause.
- Problem 132: filed upstream as `windyroad/agent-plugins#414` on 2026-08-08, with both defective shapes verified present in the upstream HEAD copy before filing rather than only in the cached build.
- Problem 130: an upstream-report candidate whose ticket states its own placement claim as a proposal the maintainers can reject.
- `docs/briefing/governance-iteration-friction-2026-08-08-adr-048-iter.md`: the three-tree distinction between cache, managed marketplace checkout and ordinary working clone, and which of them is a trap.

## Current Solutions

Filing an issue upstream and parking the ticket, then rediscovering the park as a finding on the next loop. `/wr-itil:report-upstream` currently ends at `gh issue create`; the change that makes it prefer a pull request is itself an upstream change, which ADR-048 names as the first exercise of the decision.
