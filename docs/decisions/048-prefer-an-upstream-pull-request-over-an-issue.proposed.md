---
status: "proposed"
date: 2026-08-08
human-oversight: confirmed
oversight-date: 2026-08-08
decision-makers: [Tom Howard, Claude]
consulted: [wr-architect:agent, wr-jtbd:agent]
informed: []
related: [008-action-specific-pipeline-risk-management, 045-rfcs-in-this-project-carry-no-stories-until-a-story-tier-exists]
amends: [036-marketplace-consumer-cannot-edit-cached-plugin-park-classification]
reassessment-date: 2026-11-08
---

# Prefer a pull request over an issue when the upstream accepts them

> Captured via /wr-architect:capture-adr (foreground-lightweight aside-invocation
> per upstream ADR-032). Tom ratified this decision in session on 2026-08-08. Every
> factual claim below was checked against disk before landing; where the ratified
> draft's premise did not survive that check, the corrected premise is recorded
> here and noted in the Context section.

## Context and Problem Statement

A large share of this backlog resolves to code in another repository rather than
to code here. The existing flow files an issue upstream and parks the local
ticket. A park has been treated as terminal.

ADR-036 set a reassessment trigger: revisit if marketplace-consumer parks pass
70% of all parks. Counted on 2026-08-08, `docs/problems/parked/` holds 16
tickets; 15 carry an explicit `upstream-blocked` park reason, and the sixteenth
(P068) is the lone `architect-design` park. That is 94%, well past the trigger.
ADR-036 offered three ways out: author plugins locally, negotiate upstream
priorities, or explicitly accept the consumer-only posture.

ADR-036 also pre-registered this outcome as a cost of its own classification, in
its Consequences / Bad section: "if every WSJF=12 ticket is upstream-blocked, the
project is implicitly accepting that all the dev-work-queue value is in upstream
contributions, not local work." That sentence is a stronger warrant for
reopening the question than the 94% count on its own. This decision discharges
it.

The trigger fired on a premise none of the three options examined. Checked on
2026-08-08, `gh repo view windyroad/agent-plugins` returns
`viewerPermission: ADMIN`. That repo is ours. Over eighty issues are open
upstream; 15 of them are our own parked tickets, one per park, each
cross-referenced from the ticket's `## Reported Upstream` section.

**Correction to the ratified draft.** The draft attributed the blockage to there
being no local clone of the upstream. That is not true, and the truth makes the
case stronger. Two working clones of `windyroad/agent-plugins` exist on this
machine:

- `~/.claude/plugins/marketplaces/windyroad`, which is Claude Code's *managed*
  marketplace checkout. It is a real clone on `main`, but it is the wrong tree to
  branch in: `/plugin marketplace update` pulls it, and a dirty tree or a feature
  branch there can break plugin resolution for every project on this machine.
- `/Users/tomhoward/Projects/agent-plugins`, an ordinary working clone at an
  ordinary path, with the same remote. This is the right tree to work in, and it
  was already in use by another session on the day this decision was ratified.

So the blocker was never permission and never reachability. It was that neither
clone had ever been treated as an edit path. Note also that ADR-036's predicate
condition 2 keys on the plugin *cache* (`~/.claude/plugins/cache/...`), which is
a third and genuinely non-editable location. The cache is the thing you cannot
durably edit; the clone is the thing you contribute through. Conflating them is
what made the park look terminal.

Write access is the narrow case. The general one is broader: **most upstreams
accept pull requests from contributors who have no write access at all.**
Fork-and-PR is the ordinary open-source contribution path. Scoping this decision
to "repos we own" would leave every genuine third-party dependency parked
forever, which is the same dead end in a smaller box.

## Decision Drivers

- The 70% reassessment trigger in ADR-036 has fired at 94% (15 of 16 parks), and
  ADR-036 pre-registered that outcome as a signal to act on.
- The blocker that shaped the consumer-only posture was neither permission (we
  hold ADMIN) nor reachability (two clones exist). It was that no clone was ever
  treated as an edit path.
- Parks accumulate and get rediscovered as findings on every AFK loop, spending
  iteration budget without moving any ticket.
- A fix landed in the shared plugin reaches every adopter, not just this repo.
- Restricting the change to repos we own would re-create the dead end for genuine
  third-party dependencies.

## Considered Options

1. **Prefer a pull request over an issue wherever the upstream accepts them
   (chosen)**. Treat a park as a staging state and drive the fix as a
   contribution, whether or not we hold write access.
2. **Prefer a pull request only on repos we own.** Narrower and safer, and it
   leaves every third-party dependency permanently parked. Rejected: it
   reproduces the dead end in a smaller box.
3. **Author the plugins locally (ADR-036 option a).** Fork the plugin sources
   into `packages/<plugin>/` trees here. Rejected: it forks the shared tooling
   and splits maintenance across two lineages to solve a contribution problem.
4. **Negotiate upstream priorities (ADR-036 option b).** File better issues and
   wait. Rejected: it is the current behaviour, and it produced the 94%.
5. **Accept the consumer-only posture explicitly (ADR-036 option c).** Record
   that the parks are permanent. Rejected: the premise it rests on (an upstream
   we cannot reach) is false on both counts.

## Decision Outcome

Chosen option: **"Prefer a pull request over an issue when the upstream accepts
them."**

When a ticket's fix site is in an upstream repository, prefer opening a pull
request over filing an issue, whenever that upstream accepts pull requests.

File an issue instead when the upstream does not accept contributions, when the
fix needs a design decision that is the maintainers' to make, or when the ticket
is security-classified and belongs on a private advisory path.

A park becomes a staging state, not a terminal one: it records that the fix site
is in another tree and that the ticket waits on a change there.

Contribution work happens in an ordinary working clone
(`/Users/tomhoward/Projects/agent-plugins` for the `agent-plugins` upstream), and
never in Claude Code's managed marketplace checkout under
`~/.claude/plugins/marketplaces/`.

### What this amends in ADR-036, and what survives

This is a partial amendment, named by section. ADR-036 keeps its status and its
filename; it is not superseded outright, because its classification predicate is
still in force and still governs 15 currently-parked tickets.

Displaced by this decision:

- ADR-036 § Un-park trigger. A park is a staging state, and the trigger set gains
  "the upstream pull request merges".
- ADR-036 § Park-transition workflow, step 3. The default outbound artefact
  becomes a pull request rather than an issue, subject to the exceptions above.
- ADR-036 § Reassessment Criteria, bullet 1. The three options it named gain a
  fourth, which is this decision.

Unchanged and still binding:

- ADR-036 § Classification predicate. Whether a fix site is outside our authority
  is still the structural, file-path-based test it always was.
- ADR-036 § Boundary with architect-design parks.
- ADR-036 § Composition with P069.

ADR-036's reassessment bullet 3 tracks the per-park upstream-report cost (roughly
$5 to $8). A pull request costs more per park than an issue does. This decision
changes the economics that criterion watches, and the criterion should be read
against the new baseline rather than the old one.

### Home of the mechanism

This decision records the posture for this repo, but the behaviour belongs in
`/wr-itil:report-upstream`, so every adopter of the plugin gets it rather than
this repo alone. The skill currently ends at `gh issue create`. The change to it
is itself an upstream change, so the first exercise of this decision is the pull
request that implements it.

Upstream ADR-071's every-fix-goes-through-an-RFC rule and upstream ADR-073's
RFC-first timing continue to bind here unchanged, as ADR-045 § Scope states
explicitly. This ADR records a posture and is not itself a fix, so it needs no
RFC. The pull request that implements the mechanism *is* a fix, and it carries
the RFC and problem trace like any other.

### A note on ADR numbers in this document

Local and upstream ADR numbers collide, and two of the collisions are traps in
exactly this subject area. Verified on disk on 2026-08-08:

- Local ADR-028 is the CI-status check in `push:watch` and `release:watch`.
  Upstream ADR-028 is the voice-tone gate on external communications.
- Local ADR-036 is the park classification amended above. Upstream ADR-036 is
  scaffold-downstream-OSS-intake, which the `report-upstream` skill cites in the
  same breath as the gate.
- Local ADR-014 is Wardley-mapping-as-strategic-lens, not commit grain. P056 is
  the open ticket tracking that misattribution; this document does not repeat it.

Every bare `ADR-NNN` below is local. Upstream references are written
`upstream ADR-NNN`, per the convention ADR-045 already uses.

### External communications

A pull request carries two outbound surfaces where an issue carries one.

**1. The prose** (pull request title and body). Already covered.

`external-comms-gate.sh`, shared by the `wr-risk-scorer` and `wr-voice-tone`
plugins, matches `gh pr create`, `gh pr comment` and `gh pr edit` alongside their
`gh issue` equivalents. Verified on the latest cached copy at
`~/.claude/plugins/cache/windyroad/wr-risk-scorer/0.18.6/hooks/external-comms-gate.sh`:
the surface list is in the file header, and the match arms are at lines 156
(`gh issue create`) and 162 (`gh pr create`). Drafts on both surfaces are scored
by `wr-risk-scorer:external-comms` and `wr-voice-tone:external-comms`. No change
needed; the existing gate applies unchanged.

The gate's own header attributes this to **upstream ADR-028**, the voice-tone
gate on external communications. The evidence for the claim above is the hook on
disk, not either ADR number.

Locally, ADR-012 (mandatory voice and risk review gates for AI-generated content)
and ADR-015 (reader-respect clause and gate-rejection policy) govern
AI-generated prose generally, and a pull request body sent to another repository
is squarely that. They apply to PR prose for the same reason they apply to issue
prose.

One documentation gap follows from this decision rather than predating it:
`/wr-itil:report-upstream`'s own SKILL.md names only `gh issue create` (Step 5)
and the security-advisory `gh api` call (Step 6) in its gated-surface section. If
the pull-request path lands in that skill, `gh pr create` has to be added there,
or the skill will document gate behaviour that no longer matches what it does.

**2. The diff** (code landing in someone else's repository, under our name,
judged by their conventions). Not covered.

The prose gate does not read diffs. The pipeline scorer does read diffs, but
scores them against *our* `RISK-POLICY.md`: its agent definition reads the local
policy for impact levels and the appetite threshold, and the local `docs/risks/`
catalog for standing risks. It has no notion of an upstream's policy or
contribution standards. Architecturally the gap sits in ADR-008
(action-specific pipeline risk management), whose action taxonomy is Commit,
Push and Release, with no action for "open a pull request against a repository we
do not own". On a repo we own this gap is survivable. On a third-party repo it is
how a contribution gets rejected or, worse, accepted and regretted.

Naming the second surface is part of this decision. Closing it is not; that needs
its own work, informed by what the pilot pull request actually hits.

## Consequences

### Good

- Parked tickets become workable instead of accumulating.
- Parks stop being rediscovered as findings every loop.
- Fixes reach the shared plugin, so other adopters get them too.
- Third-party dependencies stop being permanently terminal.

### Neutral

- Upstreams that do not accept contributions still park terminally. This changes
  only the case where a contribution is possible.

### Bad

- The loop spends in a second repository with its own gates, changesets and
  release process.
- A ticket now spans two repos, so its audit trail spans two histories.
- Upstream review and release latency sits between a fix and its arrival here.
- Per-park cost rises: a pull request is more work than an issue, against
  ADR-036's roughly $5 to $8 per-park baseline.
- The unscored-diff surface above is a live gap until separately closed.

## Confirmation

- [ ] One parked ticket driven end to end as an upstream pull request, landed and
      released, and the local ticket closed on that evidence.
- [ ] `/wr-itil:report-upstream` prefers a pull request over an issue when the
      upstream accepts them, with the external-comms gate applying to the PR
      prose as it already does to issue prose, and its gated-surface section
      updated to name `gh pr create`.
- [ ] The unscored-diff surface is either closed or carries its own ticket.
- [ ] ADR-036 carries both halves of the reciprocal amendment link: a bullet in
      its `## Related` section naming ADR-048, which is what the upstream ADR-077
      compendium generator actually reads (it extracts `ADR-NNN` references from
      the `Related` body section; the frontmatter relationship field it consumes
      is `supersedes`, and nothing else), and an inline pointer in its Decision
      Outcome, so a reader who arrives at ADR-036 alone does not re-run the 70%
      count against a trigger that has already fired. The `## Related` bullet has
      to land before the compendium is regenerated, or the staged README misses
      the edge.

## Pros and Cons of the Options

### Prefer a pull request wherever the upstream accepts them

- Good, because it unblocks both the repos we own and genuine third-party
  dependencies under one rule.
- Good, because fork-and-PR needs no permission we have to negotiate for.
- Bad, because it commits the loop to a second repo's gates and release cadence.

### Prefer a pull request only on repos we own

- Good, because it is the smaller change and needs no fork handling.
- Bad, because every third-party dependency stays permanently parked, which is
  the dead end this decision exists to remove.

### Negotiate upstream priorities

- Good, because it costs nothing to adopt and keeps the relationship with the
  maintainers exactly as it is.
- Bad, because it is the current behaviour, and the current behaviour produced
  the 94%.

### Author the plugins locally

- Good, because it removes the round trip entirely for the forked plugins.
- Bad, because it splits the tooling lineage and doubles maintenance to solve a
  contribution-path problem.

### Accept the consumer-only posture

- Good, because it costs nothing to adopt.
- Bad, because it rests on a false premise. The upstream is reachable, we hold
  ADMIN on it, and two working clones are already on this machine.

## Reassessment Criteria

Revisit if the pilot shows the two-repo round trip costs more than the parks it
clears, or if upstream review latency leaves tickets stranded in staging longer
than they sat parked.

## Related

- ADR-036 (marketplace-consumer-cannot-edit-cached-plugin park classification).
  Partially amended by this decision, section by section, per the list above.
  Not superseded: its classification predicate still governs 15 parked tickets.
- ADR-008 (action-specific pipeline risk management). Home of the unscored-diff
  gap named above; its action taxonomy has no PR-against-a-foreign-repo action.
- ADR-012 and ADR-015 (review gates and reader-respect for AI-generated prose).
  Apply to pull request bodies as they do to any other outbound prose.
- ADR-045 (RFCs carry no stories until a story tier exists). Its Scope section is
  why upstream ADR-071 and upstream ADR-073 still bind the implementing PR.
- `/wr-itil:report-upstream`. Carries the mechanism; the change to it is itself
  the first pull request under this decision.
- P132, reported upstream as `agent-plugins#414` in commit `51c8f46`. It is Open
  rather than parked, but it is the most recent upstream report, and it would
  have been a pull request under this decision. The natural candidate for the
  pilot.
- The 15 `upstream-blocked` tickets in `docs/problems/parked/`, each with an
  upstream issue recorded in its `## Reported Upstream` section.
