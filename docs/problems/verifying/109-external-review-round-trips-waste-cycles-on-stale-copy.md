# Problem 109: External-review round-trips waste cycles when the reviewer sees a stale copy of a repo artifact

**Status**: Verification Pending
**Reported**: 2026-07-03
**Priority**: 6 (Medium) -- Impact: Minor (2) x Likelihood: Possible (3) (re-rated 2026-07-15 review: recurs whenever an external reviewer relays repo artifacts; multiple stale rounds in Issue 11)
**Origin**: internal
**Effort**: S (assistant-discipline memory lever per ticket investigation tasks)
**WSJF**: 12.0 = (6 x 2.0) / 1

## Description

During the Issue 11 newsletter session (2026-06-29 to 07-03), an external reviewer was fed the brief for editorial review across several rounds. Multiple rounds the reviewer reported the file as "unchanged" or flagged weaknesses that had already been fixed (e.g. asked for an Item 3 concrete action and a checklist-prioritization line that were already in the committed file). Each stale-copy round cost a full diagnosis-and-explanation round-trip.

Two root causes compounded:

1. **Local commits were never pushed.** The whole edition (prep + finalise + revisions) was committed locally on `master`; `origin/master` had none of the 2026-06-29 files. A reviewer reading from the remote saw nothing / the old state.
2. **Stale IDE / copy source.** The version relayed to the reviewer came from a source one commit behind (a stale editor buffer that did not reload after the assistant's on-disk edits, or a re-sent earlier copy). The reviewer therefore reviewed pre-fix text and flagged already-fixed issues.

The durable lesson is assistant-side: when the user will relay a repo artifact to an external reviewer, proactively hand them the current committed content (send the file via SendUserFile with its checksum, or offer to push so there is one canonical source) and flag stale-buffer / unpushed-commit risk, rather than assuming the user's buffer or the remote is current. Later in the session, sending the file + md5 and diagnosing the stale-copy cause is what broke the loop.

## Symptoms

- Reviewer reports "unchanged" or re-flags already-fixed weaknesses across consecutive rounds.
- `git log origin/master..master` shows the edition committed locally but `git ls-tree origin/master` shows the files absent from the remote.
- The phrase the assistant just added is present on disk (grep confirms) but the reviewer's copy lacks it.

## Workaround

Send the user the freshly-committed file (SendUserFile) with its md5, and confirm which distinctive post-fix phrase is present so the current-vs-stale copy can be identified. Offer to push `master` so the reviewer can pull one source of truth.

## Impact Assessment

- **Who is affected**: any session where the user relays a repo artifact (newsletter brief, doc, code) to an external reviewer while the assistant is still editing/committing.
- **Frequency**: recurred 3+ times in one session.
- **Severity**: Minor. No artefact is corrupted and nothing ships wrong; the cost is wasted review round-trips, paid at the worst moment (publish morning) against the scarcest input (an external reviewer's attention).
- **Analytics**: none instrumented. The signal is qualitative -- a reviewer reporting "unchanged", or re-flagging a fixed weakness -- and there is nothing on disk to count, since the stale copy lives outside the repo.

## Root Cause Analysis

### Investigation Tasks

- [x] Re-rate Priority and Effort at next /wr-itil:review-problems (done at the 2026-07-15 review; the Priority line records it)
- [x] Decide the assistant-side discipline: on detecting an external-review relay loop, proactively SendUserFile the current committed artifact + checksum and name the stale-buffer / unpushed-commit risk before the user re-sends. Likely a memory-layer lever (sibling to P050 / P061 / P107 assistant-interaction discipline notes).
- [x] Consider whether a light "push before external review, or send the committed file" prompt belongs in the newsletter step-17 close-out. **Answered yes**, see Fix Strategy.
- [x] Create a reproduction / recognition test for the loop signal. Satisfied in substance by the positive-mismatch test, not by an automated repro; see Fix Strategy.

## Fix Strategy

Two surfaces, because the defect has a general form and a pipeline-local instance.

**1. Memory-layer assistant discipline (the general case).** Written to
`~/.claude/projects/-Users-tomhoward-Projects-windyroad/memory/feedback_external_reviewers_may_hold_a_stale_copy.md`,
indexed in `MEMORY.md`. Covers any relay of a repo artefact -- brief, doc, code -- not just
the newsletter. This is the Fix Strategy the ticket already recorded (Kind: improve,
Shape: memory), sibling to the P050 / P061 / P107 assistant-interaction notes.

**2. `.claude/skills/wr-newsletter/SKILL.md` (the instance where it recurred).** Split in
two, because the reactive and preventive halves fire at different moments:

- A `## Failure modes` bullet after the P099 bullet, for a review round that has already
  come back stale.
- A `### 17. Summarise for Tom` bullet for the handout precondition. This answers
  investigation task 3 affirmatively. The JTBD reviewer's argument decided it: a
  precondition sited only in `## Failure modes` can only fire *after* the waste it exists
  to prevent, and step 17 is the pipeline's last moment before Tom relays anything outward.

**The recognition test (investigation task 4), and why it is not automated.** The signal is
a **positive mismatch**: the finding quotes a passage verbatim and that passage is absent
from the current file. Grep one distinctive phrase per finding. No automated reproduction
is feasible or appropriate -- the reviewer's copy does not exist on disk, so there is
nothing for a check to compare against, which is the whole difference from P099 below.
Verification is by observing the rule fire on the next edition that takes external review.

**The triage grain is the part both gates rewrote, and it is load-bearing.** The first
draft keyed staleness on the *round* and would have discarded it wholesale. Both the
architect and the JTBD reviewer independently rejected that: a partly-stale round is the
observed shape (this ticket's own Description says the reviewer "reported the file as
'unchanged' **or** flagged weaknesses that had already been fixed"), so discarding the
round drops findings still true of the current text. The shipped rule triages per finding,
requires staleness to be affirmatively demonstrated, defaults a paraphrase with nothing
verbatim to check to *current and remediated normally*, and reports the stale-versus-carried
split at step 17. The failure direction is fixed toward a needless edit, never toward a
silently dropped finding -- the same asymmetry ADR-046 ("When in doubt, re-run") and
ADR-047 ("toward a wasted invocation, never toward a silent miss") already ratified for
this repo's own gates, applied here to a human reviewer instead of an agent one.

**Gate reviews.** `wr-architect:agent` **Architecture Review: PASS** on the revised
proposal (first pass ISSUES FOUND on the failure direction, corrected above). Ruled no new
ADR is needed and ruled explicitly on the question of whether siting a precondition inside
an existing pipeline step crosses the decision bar: it does not, because it adds no gate,
no agent invocation, no artefact and no durable on-disk state, which is the axis ADR-046
and ADR-047 sit above. `wr-jtbd:agent` **PASS** on the revised proposal (first pass GAPS
FOUND on the round-versus-finding grain and on the preventive siting, both corrected).
Anchors to JTBD-300 (Spend Editorial Judgement Where It Counts), persona
`publication-author`, both ratified; outcome 5 is this defect nearly verbatim ("the
external reviewer finds new things, not the same things ... the round trip was avoidable
and the pipeline, not the reviewer, is where the fix belongs"). The memory note's general
case has no ratified home; it is anchored **provisionally** to the `internal-maintainer`
persona and JTBD-400, both `human-oversight: unconfirmed`, and says so. Style-guide and
voice-tone gates are N/A: internal pipeline prose in a `.claude/skills/*.md` file, outside
both hooks' scope.

**No changeset.** The root package is private, there is no `packages/` workspace on disk,
and nothing here is shippable code or package behaviour -- a skill-prose rule, a ticket
body, and an out-of-repo memory file. Same reasoning P099 recorded for its skill change.

**Release vehicle**: none. `wr-itil-derive-release-vehicle 109` exits 2 (no changeset
reference), which is correct rather than a gap: there is no npm artefact to ride, so the
release marker is the fix commit SHA on `master`. <!-- no-changeset-reference -->

## Relationship to P099: adjacent, not identical

Worth arguing rather than asserting, because the two were generated by the same event and
read as one defect from the retrospective.

**The shared surface.** In both, an artefact changes after something was said about it, so
a recorded judgement attaches to superseded text.

**Three things differ, and each one drives a different fix.**

1. **Who holds the stale copy.** P099: the *verdict* is stale. Both the artefact and the
   record are in the repo, and the reviewer is an agent, re-invocable at no human cost.
   P109: the *reviewer's copy* is stale. The artefact has left the repo and the holder is
   outside it.
2. **What detects it.** P099 compares two things that are both on disk -- a `scored-digest`
   against a recomputed digest -- so detection is an equality check a lint can run. P109
   has nothing to compare: the reviewer's copy is not on disk and never will be. Detection
   is necessarily inferential, which is why this ticket ships a positive-mismatch heuristic
   and P099 ships an exact check.
3. **What the fix does.** P099 silently re-invokes the stale gate. P109 cannot -- the
   response is a human re-send that costs a real round-trip with a person. That cost is
   why the per-finding triage grain matters here and does not arise for P099 at all.

**Where they touch, which is what makes them look identical.** Issue 16's reviews sibling
records that six further external editorial rounds ran after the gate ledger was written,
so "that ledger describes a text this edition no longer carries", and that the final
LinkedIn companion never got a voice pass after its second rewrite. Both admissions are
**P099 evidence** -- they are about stale *verdicts* -- and P099 already owns them (they are
recorded on that ticket under the 2026-08-08 scope-hung-off section). The six external
rounds that produced them are the **P109 surface**. One event, two defects, which is
exactly why the retro reads them as one.

**The decisive test.** Had ADR-047's digest mechanism been in force during Issue 11, would
the external reviewer still have reviewed a stale copy? Yes. Nothing in that mechanism
touches what is handed to a person outside the repo; it cannot see an unpushed commit or an
unreloaded editor buffer. Symmetrically, this ticket's per-finding triage rule does nothing
about an internal gate verdict going stale. Neither subsumes the other, and closing either
one alone leaves the other's failure live. They are recorded separately.

## Fix Released (2026-08-09)

Shipped in one commit: the memory-layer discipline note (out of repo, indexed in
`MEMORY.md`) plus two `.claude/skills/wr-newsletter/SKILL.md` bullets -- the reactive
stale-round rule in `## Failure modes`, the handout precondition in step 17. Repo-local
skill change, no npm release, no changeset.

**Awaiting Tom's verification**: the next edition that goes out for external editorial
review. Two things to watch, and they are separable:

- Does the artefact get handed over with its checksum and commit SHA, rather than by
  assuming a buffer is current? That is the preventive half, and it is the one that
  removes the round-trip rather than diagnosing it faster.
- When a round does come back partly stale, does the triage happen per finding, with the
  stale-versus-carried split reported? The failure mode to watch for is the rule
  over-firing -- treating a paraphrasing reviewer as stale and quietly dropping a live
  finding. The rule is written to default the other way, but the default is prose, not
  enforcement.

**Honest limit, stated rather than dressed up.** Like P099's first fix, this is a
discipline rule enforced only by agent adherence -- no marker, no lint, no automated
check. P099's §15.6 rule was the same enforcement class and did not hold under
publish-morning pressure, which is why that ticket flipped back. The difference here is
that no stronger mechanism is available: the reviewer's copy is not on disk, so there is
nothing a check could compare against. If this rule proves not to hold, the escalation is
not a better check but a narrower handoff -- making the file-plus-checksum handover the
only supported way an artefact leaves the pipeline, rather than one instruction among
many.

## Recurrence: Issue 16 (2026-08-03)

The pattern was still live on the most recent edition. `src/newsletters/published/leader/2026-08-03/2026-08-03.reviews.md`
records six further rounds of external editorial review on publish morning, after the gate
ledger had been written. That volume of relay traffic on a publish morning is this
ticket's exposure surface, and it is the reason the Likelihood-3 rating holds.

Read the ledger's own admissions carefully, though: "that ledger describes a text this
edition no longer carries" and the un-regated final LinkedIn companion are **stale-verdict**
findings, and they belong to P099, which already records them. They are cited here as
evidence of how much external-relay traffic a single edition now carries, **not** as
evidence of a stale reviewer copy -- the reviews file does not record whether any of those
six rounds read superseded text. See the P099 relationship section above.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P107 (assistant-user content-handoff friction, same family: copyable URL blocks; P109 is the stale-copy-provenance sibling); P099 (the stale-verdict sibling -- adjacent, not identical; see the relationship section above)

## Related

- **Reported upstream**: https://github.com/windyroad/agent-plugins/issues/326 (2026-07-03)

- Fix strategy: memory-layer assistant-interaction discipline (Kind: improve, Shape: memory), sibling to the P050 / P061 / P107 pattern.
- Captured during the 2026-06-29 Issue 11 retrospective; expand at next investigation.

## Upstream Lifecycle Updates

- **2026-08-09** -- Known Error -> Verification Pending
  - **Target URL**: https://github.com/windyroad/agent-plugins/issues/326
  - **Comment URL**: queued -- see `## Queued Upstream Update`
  - **Disclosure path**: queued-unresolvable-link
  - **Gate verdict**: external-comms PASS + voice-tone PASS

## Queued Upstream Update

- **Drafted**: 2026-08-09
- **Transition**: Known Error -> Verification Pending
- **Target URL**: https://github.com/windyroad/agent-plugins/issues/326
- **Halt reason**: **not** a gate failure -- both gates passed. The draft's
  `blob/master` link resolves against `origin/master`, and the commit that moves this
  ticket into `verifying/` is unpushed (this AFK iteration is barred from pushing; the
  orchestrator owns release cadence). The link would 404 for every reader of issue 326.
  The external-comms reviewer caught it and named the irony: this is the one comment where
  shipping a pointer to a copy the reader cannot see would be the very defect the ticket
  describes. Post after `master` is pushed, once the blob URL resolves.
- **Risk-reduce attempts**: 0 -- risk-reducing the prose cannot fix an unresolvable link.
  The fix is to push first, not to reword.
- **Drafted comment body**:

  Update from https://github.com/windyroad/windyroad/blob/master/docs/problems/verifying/109-external-review-round-trips-waste-cycles-on-stale-copy.md:

  **Status**: Fix released downstream (local ticket transitioned to Verification Pending).

  **Release**: no package release. What shipped is downstream-local prose, a `wr-newsletter` skill rule in the consuming repo plus an assistant-memory note outside it, so there is nothing here to upgrade. Saying so explicitly because a downstream fix landing does not resolve what this issue asks for.

  **Fix summary**, two surfaces:

  - Reactive. When an external reviewer's findings quote a passage that is absent from the current file, treat that finding as stale, re-send the file, and re-run the review rather than explaining the discrepancy back to the reviewer. Triage is per finding, not per round, and staleness needs a positive mismatch: a paraphrase with nothing verbatim to check defaults to current and gets actioned. Both governance reviewers rejected an earlier per-round draft on exactly this, since discarding a partly-stale round drops findings still true of the text.
  - Preventive. Hand the artefact over with its checksum and the current commit SHA rather than assuming an editor buffer or the remote is current. An unpushed commit and an unreloaded buffer were the two causes behind the original report.

  **Still open here**: the general lever. The downstream fix is discipline prose in one consumer repo and does nothing for any other adopter relaying a repo artefact to an external reviewer. If this belongs in a plugin rather than in each consumer, that work is still outstanding and this issue is still the right home for it.

  Local tracking: P109.

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/326
- **Reported**: 2026-07-03
- **Template used**: structured default (problem-shaped)
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes
