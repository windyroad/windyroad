# Problem 124: Governance edit-gate markers fail to land after a genuine PASS, costing a redundant review round

**Status**: Known Error
**Reported**: 2026-08-05
**Priority**: 12 (High), Impact: 3 x Likelihood: 4 (re-rated 2026-08-09 from 9, Impact 3 x Likelihood 3). Impact is unchanged at 3: no wrong output ships, the gate fails closed, and the cost is a wasted subagent round plus the confusion of a passing review that does not unblock edits. Likelihood rises to 4 because the investigation both narrowed and widened the ticket, and the widening dominates. One of the two capture-time causes turned out not to be live on the installed version, but the surviving one is not two gates, it is all six, it fires on every `SendMessage` resume by construction, and five of the six give the operator no hint why. Third recorded occurrence in five days.
**Origin**: internal
**Effort**: M, derived at capture. Two distinct hook-side fixes in the upstream `wr-architect` (and sibling `wr-jtbd`) plugin: loosen the verdict anchor, and make the marker land on agent-resume. Comparable to P085 (external-comms marker hash invalidation), also rated M. Re-derived 2026-08-09 after the investigation below: still M, but the shape changed twice. Cause 1 needs no fix on the version this repo runs. The diff to propose is one sentence added to each of five sibling deny messages in four upstream plugins, mirroring a sentence one of them already ships: multi-package, mechanically small. The structural half stays M rather than growing, because two of the six gates already ship the registry-and-replay mechanism it needs and the remaining work is identifying one tool event and porting existing code, not designing anything.
**WSJF**: 12.0 = (12 x 2.0) / 2 (recomputed 2026-08-09 from the re-rated Priority above, per the P125 discipline of recomputing at every change rather than carrying a stale value. Prior value 9.0 = (9 x 2.0) / 2, added 2026-08-08 when the line was absent entirely and the README rendered this ticket at 0.0. Status multiplier 2.0 is the Known Error value; Effort M divides by 2.)

## Description

Two independent defects produce the same observable failure: a governance review agent returns a genuine PASS, the reviewing work is complete and correct, and the edit gate still denies the next Write. Each costs a full redundant subagent round to recover.

**Cause 1: the verdict anchor is a literal bold line, and the hook fails closed on anything else.**

> Superseded 2026-08-09, do not act on this section as written. It reasons from `wr-architect`
> 0.20.2, which this project does not run. The installed 0.20.0 allows on an unparseable verdict, so
> cause 1 has never been live here and the recurrences filed against it below belong to P088. See
> Investigation findings.

`architect-mark-reviewed.sh` (wr-architect 0.20.2, `hooks/architect-mark-reviewed.sh` lines 36-66) parses the agent's output with:

```
grep -qE '^[[:space:]]*>?[[:space:]]*\*\*Architecture Review: PASS\*\*'
```

and its `case` statement routes `FAIL|""` to the same branch: no marker. In the 0.20.0 shipped alongside it, the equivalent branch is `PASS|""` (allow-with-marker on unparseable) with a comment naming backward compatibility. So the two versions disagree on the unparseable case, and the newer one fails closed.

Observed 2026-08-05 during the P120 iteration: the `wr-architect:agent` subagent completed its review, verified every folded item against disk, and emitted `## Architecture Review: PASS` as a markdown heading. That is a semantically unambiguous PASS and matches nothing in the anchor. No marker was written, the next `Edit` on `docs/decisions/043-...proposed.md` was denied, and recovery took a fourth full architect invocation whose only added instruction was to emit the verdict in the pinned bold shape.

The agent's own "How to Report" section specifies the bold form, so this is agent-side drift against a hook-side contract that has no tolerance for it. The asymmetry is the problem: the verdict's *content* is agent-authored prose, and the hook treats its *formatting* as load-bearing with no fallback.

**Cause 2: `SendMessage` resumption of a review agent never fires the marker hook at all.**

The marker is written by a `PostToolUse:Agent` hook. Resuming an existing review agent via `SendMessage` (the natural way to continue a review that needs a second or third pass with its context intact) does not fire that hook. Observed the same iteration: the `wr-jtbd:agent` was resumed via SendMessage, ran a full third pass, and returned PASS. `/tmp/jtbd-verdict` held `PASS`, but no `/tmp/jtbd-reviewed-<SID>` marker existed, so edits stayed blocked. Recovery was a fresh `Agent` tool call covering the same ground the resumed agent had already covered.

The two causes compound. A review that needs three passes hits cause 2 on every resumption, and cause 1 on any pass whose verdict formatting drifts.

## Symptoms

A governance review agent returns PASS, the review content is correct and complete, and the next Edit or Write on a gated path is still denied with "No <gate> review marker found". `/tmp/<gate>-verdict` may contain `PASS` while `/tmp/<gate>-reviewed-<SESSION_ID>` is absent.

**Recurrence 2026-08-05 (P123 AFK iter), cause 1, one day after capture.** A fresh `Agent(subagent_type: 'wr-architect:agent')` call returned a substantive PASS opening with `## Architecture Review: PASS - no ADR conflicts` (heading form with a trailing qualifier, not the pinned bold form). The review was correct and detailed, and it landed no marker; the next Write was denied. Two observations that sharpen the ticket:

- The deny message itself now documents the escape (`touch /tmp/architect-reviewed-$SID && rm -f /tmp/architect-reviewed-$SID.hash`), which makes the manual assertion the de facto workaround rather than the re-dispatch in the Workaround section below. Re-dispatching would have burned a second full architect review to fix a formatting mismatch in the first one.
- The deny message's `SID = newest architect-plan-reviewed-* / architect-announced-* basename` instruction was not sufficient on its own: markers already existed for the two newest `architect-plan-reviewed-*` SIDs and the Write was still denied, so the correct SID was neither. Asserting across every candidate SID (loop `/tmp/architect-announced-*` and `/tmp/architect-plan-reviewed-*`, touch each matching `architect-reviewed-<sid>`) is what unblocked it. That is the ADR-050 Option C candidate-set discipline the itil create-gate already adopted, applied by hand. It suggests this ticket composes with the architect-gate SID race rather than being purely a verdict-parsing bug.

## Workaround

Fire a fresh `Agent` tool call (not `SendMessage`), and dispatch it synchronously rather than in the background. That is the half that matters: it is what fires the PostToolUse hook.

Asking for the pinned literal shape `**Architecture Review: PASS**` is still worth doing, but as of the 2026-08-09 investigation it is belt-and-braces on the version this repo runs, not a second necessary half. 0.20.0 writes the marker on an unparseable verdict too. Keep the instruction so the workaround stays correct if 0.20.2 ever installs here, and do not read a block as a formatting problem: on 0.20.0 a block after a genuine PASS is the session-ID mismatch (P088), and the recovery is to assert the marker across every candidate SID, not to re-review.

## Impact Assessment

- **Who is affected**: any session editing gated paths (`docs/decisions/`, and all project files under the JTBD gate). Worst on changes that legitimately need multiple review rounds, which is exactly the class of change the gates exist for.
- **Frequency**: both causes fired in one iteration on 2026-08-05. Cause 2 fires on every SendMessage resumption of a review agent by construction. Cause 1 fires whenever verdict formatting drifts, which is unbounded because the verdict is agent-authored prose.
- **Severity**: no wrong output ships; the gate fails closed, which is the safe direction. The cost is wasted subagent rounds and the misleading signal of a passing review that does not unblock work.
- **Analytics**: none.

## Root Cause Analysis

### Investigation Tasks

- [x] Decide the right tolerance for the verdict anchor. **Answered 2026-08-09, and the question turned out to be moot here: this repo does not run 0.20.2.** See "Cause 1 does not reproduce on the installed version" below. The 0.20.0-vs-0.20.2 disagreement is real and still worth an upstream decision, but it is not what has been costing rounds in this repo, so it is no longer this ticket's fix.
- [x] Confirm whether `wr-jtbd`'s `jtbd-mark-reviewed.sh` carries the same anchor fragility. **No.** `wr-jtbd/0.13.0/hooks/jtbd-mark-reviewed.sh:36-56` reads `/tmp/jtbd-verdict` and its `*)` default branch is allow-with-marker, so a missing or unparseable verdict still writes the marker. Immune to cause 1; exposed to cause 2 like every other gate.
- [x] Establish whether `SendMessage` resumption can fire `PostToolUse:Agent`, or whether the fix has to be caller-side. **Caller-side on the versions this repo pins, but a structural fix is already built upstream and the answer changed mid-investigation.** On the installed hooks, every mark hook identifies its reviewer from `tool_input.subagent_type` (`hooks/lib/gate-helpers.sh:204-213`), and a `SendMessage` call carries `to` and `message` and no `subagent_type`, so widening the matcher alone would fire the hook and then fall straight through the `case "$SUBAGENT"` guard doing nothing. That was the finding, and it was wrong to conclude from it that agent-identity resolution is unavailable. `wr-risk-scorer` 0.18.6 has since built exactly that resolution, described below.
- [x] Check whether the same resume-does-not-mark gap affects the other marker-writing gates. **All of them, uniformly.** See "Cause 2 is one shape across six gates" below.

### Investigation findings (2026-08-09)

Every claim below was read from the plugin copies this project actually loads. Active versions
were resolved from `~/.claude/plugins/installed_plugins.json`, filtering to the `user` scope and the
`/Users/tomhoward/Projects/windyroad` project scope: `wr-architect` 0.20.0, `wr-jtbd` 0.13.0,
`wr-risk-scorer` 0.17.0, `wr-voice-tone` 0.7.0, `wr-style-guide` 0.5.0. Both scopes agree on every
version, so there is no ambiguity about which copy runs.

**Cause 1 does not reproduce on the installed version, and the Description's premise is wrong for
this repo.** The Description reasons from `wr-architect` 0.20.2. That build is present in the cache
but is not installed for this project or for the user scope. The installed 0.20.0 does the opposite
of what the ticket says: `hooks/architect-mark-reviewed.sh:38-42` sets `VERDICT` to `PASS` only on
the bold form and to `FAIL` only on the bold ISSUES FOUND form, and lines 51-64 route `PASS|""` to
allow-with-marker with a comment naming the backward-compat intent. So a heading-form
`## Architecture Review: PASS` parses to the empty string, takes the `PASS|""` branch, and **writes
the marker**. On the version this repo runs, only a literal `**Architecture Review: ISSUES FOUND**`
withholds it.

That matters beyond bookkeeping, because it re-attributes this ticket's own recurrence evidence. The
2026-08-05 and 2026-08-08 blocks recorded above were both filed against cause 1, and on 0.20.0 they
cannot have been caused by verdict formatting. The Recurrence note already contains the better
explanation and stops one step short of drawing it: markers existed for the two newest candidate
SIDs and the Write was still denied, and asserting across every candidate SID is what unblocked it.
That is P088, the session-ID mismatch, not a parsing bug. Those witnesses belong on P088.

**Cause 2 is one shape across six gates, not two.** Every governance marker in this stack is written
by a `PostToolUse` hook whose matcher is the literal string `Agent`, read from each plugin's
`hooks/hooks.json`: `architect-mark-reviewed.sh`, `jtbd-mark-reviewed.sh`, `risk-score-mark.sh`,
`voice-tone-mark-reviewed.sh`, `external-comms-mark-reviewed.sh` and `style-guide-mark-reviewed.sh`.
A `SendMessage` resume is not an `Agent` tool call, so it fires none of them. The ticket frames this
as an architect-and-maybe-jtbd problem; it is the single shared shape of the whole gate family, and
it closes investigation task 4 as "yes, all of them".

**It is already fixed for exactly one gate, by documentation, and that fix is the template.**
`wr-architect/0.20.0/hooks/lib/architect-gate.sh:64` carries a P400 note in its no-marker deny
message stating cause 2 in terms: a verdict upgrade must be a fresh `Agent` spawn because *"a
SendMessage resume of the same architect agent does NOT fire the marker hook"*. Searching `hooks/`
across the four sibling plugins for `SendMessage` returns nothing at all. So five of the six gates
block on this with a deny message that gives the operator no way to work out why.

The external-comms gate shows the same fix already landing for the neighbouring variant. Its deny
message (`external-comms-gate.sh:413`, byte-identical in `wr-risk-scorer` 0.17.0 and `wr-voice-tone`
0.7.0) tells the caller to dispatch the reviewer synchronously because *"a background-launched
reviewer does not fire its PostToolUse mark hook"* (P402). Background-launch and SendMessage-resume
are the same defect reached two ways, and one of them is documented at that gate while the other is
not.

**Fix shape.** Add the P400 sentence to the five sibling deny messages, worded from the architect's
existing one and placed beside the P402 sentence where that already exists. It is prose in a hook
string, it needs no new mechanism, and one of the four plugins has already shipped the pattern, so
it is a clear enough shape to arrive as a pull request rather than an issue under ADR-048. The
deeper structural fix, making a resume mark the same as a spawn, is a genuinely larger change for
the reason recorded under Investigation Tasks and should be raised in the same pull request as a
follow-up rather than attempted in it.

**Upstream has already solved the hard half of this, in two sibling plugins, and that reshapes the ask.**
Surfaced by the risk scorer while it was scoring this iteration's retro commit, then verified
directly against the cache. `wr-risk-scorer` 0.18.6, installed for a different project on this
machine, has collapsed its four `PostToolUse` hooks into one `risk-scorer-dispatch.sh` whose matcher
is `Agent|Bash|Edit|Skill|Write` plus nine agent-lifecycle events (`spawn_agent`, `wait_agent`,
`close_agent`, `collaborationinterrupt_agent`, and the `collaboration`- and `multi_agent_v1__`-
prefixed forms). So the "six hooks, one matcher" finding above is true of the versions this repo pins
and is already false of a newer build of one of them.

The important part is not the matcher. It is `hooks/codex-agent-completion.mjs`, which answers the
agent-identity question this ticket recorded as unavailable. At spawn, `rememberSpawn` (lines 39-47)
reads `tool_input.agent_type` and writes the role to a state file keyed by `agent_id`. On a later
wait or close, `markTarget` (lines 49-69) reads that role back, synthesises a payload with
`tool_name: "Agent"` and `tool_input.subagent_type` filled in, and pipes it into `risk-score-mark.sh`
unchanged. A spawn-time registry plus a synthetic replay: the mark hook never learns it was not
called by an `Agent` event.

**And the architect plugin already ships the same mechanism, at the exact version this ticket was
written against.** `wr-architect` 0.20.2 carries its own `hooks/codex-agent-completion.mjs`, a
single-role variant (`const role = "wr-architect:agent"`, state prefix `codex-architect-`) that
replays into `architect-mark-reviewed.sh` the same way. It is wired to its own `PostToolUse` matcher
covering six lifecycle events: `spawn_agent`, `close_agent`, `collaborationspawn_agent`,
`collaborationinterrupt_agent` and the two `multi_agent_v1__` forms. `wr-architect` 0.20.0, which is
what this repo runs, has no such file at all.

So the version picture is the opposite of an upgrade recommendation, and this is the single most
useful thing the investigation produced. 0.20.2 is simultaneously the version that fails closed on an
unparseable verdict (cause 1, which 0.20.0 tolerates) and the version that adds the lifecycle
registry (a partial cause 2 fix that 0.20.0 lacks entirely). Upgrading trades one defect for the
other. Neither 0.20.2's six events nor 0.18.6's nine include anything that reads as a message-resume,
so the specific gap this ticket is about plausibly survives both.

That settles what the pull request should say. Not "can reviewer identity be recovered from a
non-`Agent` event" (it demonstrably can, twice over, in their own code), and not "please widen a
matcher". It should ask which tool event a `SendMessage` resume emits, propose adding that event to
the registries that already exist in `wr-architect` and `wr-risk-scorer`, propose porting the same
mechanism to the four gates that have none, and note that 0.20.2's stricter verdict parsing is a
separate regression against 0.20.0 that a consumer cannot adopt the registry without also adopting.
The documentation fix stays worth doing alongside, because it is cheap and helps every gate today.

**Fix site is the read-only plugin cache, so this is external-root-cause.** All six mark hooks and
all five deny messages live under `~/.claude/plugins/cache/windyroad/`, in `windyroad/agent-plugins`.
This project has no `packages/` tree. Nothing here can be edited durably. The ticket stays Known
Error rather than moving to Parked, because the ADR-036 park predicate holds on all three counts but
the un-park trigger has nothing to point at until the outbound artefact exists: park it when the
pull request is open, not before.

**Line references handed in with this iteration's evidence, checked.** The EOF-only heredoc
extraction regex is at `external-comms-gate.sh:252` exactly, in both active copies. The claim that
the marker key includes the surface label is true, but not where it was said to be: the key is
computed in `hooks/lib/external-comms-key.sh:48-72` as `sha256(normalize(draft) + '\n' + surface)`
and documented in the gate header at lines 35-36. Line 413 is the deny message. Half of that claim
held and half did not, which is the same split the handing-over note predicted.

## Fourth witness, 2026-08-29 (P099 iteration)

Cause 2 again, on both gates in one iteration, and worth recording because the shape
was not ignorance of this ticket: the Critical Points roll-up carries the mechanism and
was in context at session start.

The pull that defeated it is the one this ticket's Workaround does not name. Both the
architect and the JTBD reviewer returned ISSUES FOUND with substantive, correct findings,
and both sets were resolved by `SendMessage` to the same agent. That is the better review
move on the merits, because the reviewer keeps the context that produced its findings and
can check whether the resolution actually answers them, which it did: the architect's
second round caught that the proposed remedy was mechanically wrong, and the JTBD
reviewer's caught that it did not terminate. Both upgraded to PASS. Neither marker landed,
because `SendMessage` fires no `PostToolUse:Agent` hook.

Recovery was two fresh synchronous `Agent` spawns re-covering ground already passed,
roughly 94K subagent tokens. The JTBD gate blocked first, and its deny string carries no
dispatch-shape hint, so the cause had to be inferred from this ticket rather than read off
the block. The architect's deny string, hit next, names it outright.

**What the Workaround is missing.** "Fire a fresh `Agent` tool call (not `SendMessage`)"
reads as a prohibition on resuming, which costs the review quality that resuming buys. The
shape that keeps both: iterate by `SendMessage` freely, then make the FINAL pass a fresh
synchronous `Agent` call carrying the settled design. The final spawn re-reads the artefact
from disk and is the one that writes the marker, so it is not wasted ceremony.


## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P085, P088, P074, P023

## Related

- **P085** (`docs/problems/known-error/085-...md`): external-comms gate marker invalidated by commit-message body changes, forcing re-review. Same class, different marker surface: a marker that fails to persist across a legitimate continuation.
- **P088** (`docs/problems/open/088-...md`): architect edit-gate session-ID mismatch under AFK subprocess forces manual marker reconciliation. Sibling on the same marker's identity axis rather than its verdict-parsing or hook-firing axis.
- **P074** (`docs/problems/open/074-...md`): external-comms marker hooks do not write expected marker files after subagent PASS verdicts. Likely the same underlying shape as cause 2 on a different gate; worth checking whether one fix closes both.
- **P023** (`docs/problems/open/023-...md`): architect-gate drift detection removes the marker without offering a recovery path. Adjacent: that ticket is about losing a valid marker, this one is about never writing one.
- Captured via `/wr-itil:capture-problem` from the `/wr-retrospective:run-retro` Step 4b Stage 1 pass on the 2026-08-05 P120 iteration. Fix is upstream in the `wr-architect` (and possibly `wr-jtbd`) plugin, not in this repository.

### Evidence triage, 2026-08-09 iteration

The iteration reported roughly four wasted rounds to three marker frictions and proposed an
attribution for each. Checked against the tickets and against the hooks on disk, all three hold, and
one of them sharpens an existing witness rather than adding a new one:

- **A PASS delivered by resuming an agent via `SendMessage` never wrote its marker.** This ticket,
  cause 2. Confirmed as the live cause here, and confirmed to be the shared shape of all six gates.
- **The architect gate's own manual-recovery instruction selected a different session's UUID.**
  P088, and not a new finding: P088's Symptoms already record the identical failure on 2026-08-08,
  quoting the same instruction and naming the same wrong-newest-marker mechanism. Tonight is a
  further witness on a recorded symptom. The instruction lives in the same deny string as the P400
  note this ticket wants propagated, so a pull request touching that string should fix both.
- **One phrase changed after an external-comms PASS invalidated the marker.** P085, squarely: that
  is the ticket's original framing, widened since to key-derivation asymmetry generally.

The three are easy to conflate because they surface identically, as a genuine PASS that does not
unblock. They separate cleanly on what the marker did: never written (this ticket), written under a
key nobody reads (P088), written under a key that then changed (P085).

**Anchoring: JTBD-400 (Trust what the loop did while I was away), Internal Maintainer persona.** The
header lines carried at capture, `**JTBD**: JTBD-001` and `**Persona**: developer`, have been
removed. Both were upstream `agent-plugins` values that leaked in and neither resolved here as
cited: local JTBD-001 is the Engineering Leader Awareness job, retired by ADR-041 on 2026-07-10, and
`developer` is this repo's reader persona, a working engineer who reads Tokens Spent on LinkedIn.
Neither has anything to do with a governance-tooling defect. `docs/jtbd/internal-maintainer/` models
the person who actually pays for this one. The fit is JTBD-400's fifth outcome, that the cost of
checking is proportionate to the value returned: a gate that fails closed after a genuine PASS
charges a full subagent round for nothing and gives the operator no way to tell that from a real
finding. The fix site is upstream, so
[JTBD-402](../../jtbd/internal-maintainer/JTBD-402-land-the-fix-where-the-defect-lives.proposed.md)
governs how it lands. The persona and job are `human-oversight: unconfirmed` pending
`/wr-jtbd:confirm-jobs-and-personas`, so this anchoring is provisional. Recorded in prose rather
than `**JTBD**` / `**Persona**` header lines, per local convention.

### Recommended outbound artefact

A pull request against `windyroad/agent-plugins`, not an issue, per ADR-048: the fix shape is clear
and already has a shipped template in the same codebase. Scope it to the five sibling deny messages
(`wr-jtbd`, `wr-style-guide`, `wr-voice-tone`, `wr-risk-scorer`, and the two external-comms copies),
worded from `wr-architect`'s existing P400 note. Then put the structural proposal in the pull request
body rather than in the diff: identify which tool event a `SendMessage` resume emits, add it to the
spawn-registry-and-replay hooks that `wr-architect` 0.20.2 and `wr-risk-scorer` 0.18.6 already ship,
and port that mechanism to the four gates with none. Cite their code rather than describing the fix
from scratch; it is already written and already theirs. Flag the 0.20.2 verdict-parsing regression in
the same body, because as things stand a consumer cannot take the registry without also taking a
gate that fails closed on an unparseable verdict. Work it in the ordinary
clone at `/Users/tomhoward/Projects/agent-plugins` per JTBD-402 outcome 5, never the cache and never
the managed marketplace checkout. Not filed from this iteration: the iteration was scoped to this
repository.
