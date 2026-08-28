# Problem 099: wr-newsletter has no rule that a post-gate / post-finalise body edit must re-run the FULL gate set

**Status**: Known Error
**Reported**: 2026-06-22
**Priority**: 16 (High). Impact: Significant (4) x Likelihood: Likely (4) (re-rated 2026-08-05 review, up from a deferred 6: Impact 4 per RISK-POLICY "pipeline ships poor-quality content past one of the ... gates ... indicates gate weakness" -- Issue 16's publish-morning thesis rewrite shipped without cross-edition or skeptic re-validation. Likelihood 4 because post-gate external-review edits are now routine on every edition and no hook or automated check covers the re-run, which the ticket's own Fix Strategy records as infeasible.)
**Origin**: internal
**Effort**: M (re-rated 2026-08-05 review, up from S: the S bucket covered authoring the §15.6 prose rule, which shipped and did not hold. The remaining work is a stronger enforcement mechanism -- the marker file the Fix Strategy rejected as YAGNI, or a dirty-body check at save -- designed alongside P113's gate-loop cost and P120's remediation loop, since those determine whether re-running the heavy gates is affordable at all.)
**WSJF**: 16.0 = (16 x 2.0) / 2 (re-rated 2026-08-28 review: Verification Pending -> Known Error flip-back on observed regression, user-confirmed; status multiplier 0 -> 2.0)
**Type**: technical

## Description

The `/wr-newsletter` pipeline runs five LLM gates (voice, content-risk, newsletter-critic, editor, cognitive-accessibility) plus cross-edition consistency and the deterministic structural lint, in a defined sequence. But there is no documented discipline for what happens when the brief or LinkedIn body is edited AFTER that sequence has passed (the common case: author-directed corrections during finalise, or fixes prompted by an external review).

During Issue 10 (2026-06-22) finalise, after the gates first passed, the body changed across roughly six edit rounds: the apocryphal-anecdote fix, the human-code-review reframe of Item 3, the CTA swap, the external-review continuity fixes (model names plus the WSJ link, the Nature hedge), and the "the brief" to "we have tracked" fix. After each edit the agent re-ran only the cheap subset (voice plus structural lint) and did NOT re-run critic / editor / cog-a11y / content-risk. Tom had to ask "have the cog-a11y and strengths/weaknesses checks been run?". They had not.

Re-running the full set on the final text then surfaced real, new weaknesses the post-edit body had introduced: Item 2 lacked a concrete metric, Item 4's "rare week" urgency contradicted Item 1, the Item 3 heading was an abstract maxim, and the LinkedIn post called Gemma 4 "frontier-grade" (contradicting the brief's 12B vs 753B framing). Each shipped past the cheap subset and would have published un-caught.

## Symptoms

- Agent keeps voice plus lint current after each post-finalise edit but silently drops critic / editor / cog-a11y / content-risk.
- The user has to manually ask whether the heavier gates were re-run.
- Real weaknesses introduced by late edits are caught only when the full set is re-run on demand.

## Workaround

Manually re-run the full gate set after any post-finalise body edit. Tom prompting "have the checks been run?" is the current manual backstop.

## Impact Assessment

- **Who is affected**: the newsletter author (Tom) and the pipeline's quality guarantee.
- **Frequency**: every edition that gets author-directed edits after the gate sequence (most editions).
- **Severity**: Moderate. Defects reach a publish-bound artifact; caught only by manual prompting.

## Root Cause Analysis

The SKILL.md gate steps (13 to 15.4) are framed as a one-pass sequence. There is no "any body edit after this point re-enters the gate sequence" rule, so the agent defaults to the cheapest plausible re-check (voice plus lint) rather than the full set.

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [x] Add a wr-newsletter SKILL.md discipline rule: any post-save / post-finalise edit to the brief or LinkedIn body re-runs the full gate set (voice, content-risk, newsletter-critic, editor, cog-a11y, cross-edition, structural lint), not the cheap voice+lint subset.
- [x] Consider a lightweight mechanism (a "dirty since last full-gate-pass" marker, or a save-time checklist) so the rule is hard to forget rather than a memory load.

## Fix Strategy

Added `### 15.6. Post-gate edit discipline: a body edit re-enters the FULL gate set (P099)` to `.claude/skills/wr-newsletter/SKILL.md`, between step 15.5 (Draft the LinkedIn post) and step 16 (Save the draft) so the "have all gates re-run since the last edit?" checkpoint sits immediately before save. The section states the rule (any post-gate edit to the brief or LinkedIn body re-enters the FULL gate set, not the cheap voice + lint subset; do not proceed to save/summary until every gate has re-run against the current body) and carries a per-gate dirty-body re-run checklist that preserves each gate's existing change-scoped skip (e.g. editor + cog-a11y skip only on a step-15 REJECTED, not on PASS_WITH_AUTHOR_OVERRIDES; LinkedIn voice gate only fires on a LinkedIn-body change; URL verification only on changed URLs). A flat cross-reference bullet was added to the `## Failure modes` list pointing at §15.6.

**Lightweight-mechanism decision (investigation task 3):** chose the save-time checklist + in-context "dirty" judgement; rejected a marker file (YAGNI). The working agent already holds the knowledge that it just edited the body, mirroring the existing in-context `*-prime` "default when in doubt: re-run" discipline, so a marker would be machinery for a judgement already in hand.

**No automated reproduction test:** the rule is a process discipline enforced by agent adherence to the SKILL, not code behaviour. The deterministic `check-newsletter-structure.sh` lint tests format invariants, not "did the heavy gates re-run after an edit"; no feasible/appropriate automated repro exists. Verification is by observing the rule fire on the next edition that takes post-gate edits.

**Gate reviews:** wr-architect:agent ALIGNED (no ADR conflict; reinforces ADR-012/018/020 mandatory-per-pass intent; no new ADR needed). wr-jtbd:agent PASS (serves JTBD-003 Evaluation for the Engineering Leader persona; removes the author's manual gate-policing backstop). style-guide / voice-tone gates N/A: the edit is internal pipeline-process prose in a `.claude/skills/*.md` file, outside both hooks' scope (CSS / user-facing component copy).

> **Correction 2026-08-29.** That JTBD anchor is retired. JTBD-001 through JTBD-004 were retired by ADR-041, dated 2026-07-10, so the 2026-06-22 gate review above anchors to a retired job. Stated with its provenance because the retirement is not where you would look for it: ADR-041 does not name JTBD-003, and the retirement is recorded in ADR-020's own correction section. `docs/jtbd/README.md` still lists JTBD-003 and the job file is still on disk, so the index is stale rather than the claim wrong. The correct anchor is **JTBD-300 (Spend Editorial Judgement Where It Counts)** for the Publication Author persona, `oversight-date: 2026-08-07`, which is the job the JTBD README's Job-to-Screen Mapping assigns to the `/wr-newsletter` pipeline. The re-anchoring matters beyond bookkeeping: this ticket's whole argument is author-side, and JTBD-003 was a reader-side job. Marked rather than overwritten, matching the correction shape this ticket already uses above.

**I13 RFC-trace gate:** the `wr-itil-check-fix-rfc-trace` predicate fired `no-rfc-trace: P099` directing an RFC auto-create. This is the known P104 false positive: the windyroad website is a Phase-1 adopter with no `docs/rfcs/` tier and zero RFC history in git.

> **Correction 2026-08-08.** That premise is now stale and the conclusion with it. `docs/rfcs/` exists and carries RFC-001 through RFC-005; this ticket traces to **RFC-005** (Make a post-gate body edit detectable at save), recorded in the `## RFCs` section above. When the I13 gate fired again on 2026-08-08 it was legitimate, not a P104 false positive, and was handled as sub-case (b) no-vehicle: none of the four existing RFCs has this ticket's fix as its task set. Marked here rather than silently overwritten because leaving the stale claim beside the new trace would have this ticket asserting both "there is no RFC tier" and "this traces to RFC-005", which is the exact shape RFC-005 exists to detect. Verified the premise (`docs/rfcs/` absent, zero RFC commits) and fell back to the legacy direct-implementation path per the P070 / P103 precedent, carrying the fix-design trace on this ticket rather than bootstrapping an RFC tier.

## RFCs

| RFC | Status | Title |
|-----|--------|-------|
| RFC-005 | proposed | Make a post-gate body edit detectable at save, by recording the digest each gate scored |

## Fix Released

Discipline rule shipped to `.claude/skills/wr-newsletter/SKILL.md` (§15.6 + failure-modes cross-reference) in this commit. Repo-local skill change, no npm release. Awaiting verification that the rule fires on the next edition that takes post-gate body edits.


## Fix Released (2026-08-08)

The 2026-06-22 prose rule is superseded. Shipped across four commits: RFC-005 (the
vehicle), ADR-047 (the two calls Tom made), and the implementation.

**What changed.** Every gate verdict now records a digest of the artefact version it
scored. A new lint check names any gate whose verdict predates the draft being saved, and
the skill re-invokes those gates against the current draft rather than reporting a list.
Tom's direction: "I don't want it just telling me that the review hasn't been run. I want
to actually run the missing reviews."

**Verified by replaying this ticket's own event.** On the Issue 16 artefacts, appending a
publish-morning thesis correction to the brief names exactly the brief-scored gates and
leaves the post-scored one alone.

**Awaiting Tom's verification**: the next `/wr-newsletter` run that takes post-gate edits.
The test is whether the missing reviews re-run without him asking.

**Two things to watch.**

The check is tuned to over-report, per Tom's choice, so some re-runs will prove
unnecessary. That is the accepted trade against silence on a real miss, and it spends
agent invocations at the busiest moment of the week. If publish mornings start running
long, ADR-047 is a contributor.

The custody invariant is the weak point and is recorded as such rather than claimed as
solved: a verdict block that was not re-scored must be copied verbatim with its digest,
and that is a prose rule of the same enforcement class as the one this ticket records as
having failed. The lint now catches the common breach (a carried block that lost its
digest) but not the narrower one (a block paraphrased while its digest string is copied
across). ADR-047 and RFC-005 both state this rather than dressing it as structural.

**Second-order finding this fix produced.** ADR-046's out-of-scope declaration leans on
this ticket's invariant as a backstop. Until a run exercises the new check, that backstop
is intent rather than enforcement, and ADR-046 carries a caveat saying so.

## Dependencies

> **Note added 2026-08-08 (P122 build).** Two things changed for this ticket.
>
> **A second decision now leans on the invariant this ticket says does not hold.** ADR-046 (Skip the agent re-invocation when the artefact is unchanged) declares the loop-exit full pass out of scope for its skip, on the ground that condition (a)'s full pass is the guarantee no publish-bound body reaches step 16 ungated. ADR-046 carries a caveat recording that this ticket contradicts that reading. The skip fails safe independently, so ADR-046 is not at risk; but the two now share a worst case, and fixing this ticket strengthens both.
>
> **The design input this ticket was waiting on has landed.** The Effort note says the enforcement mechanism should be designed alongside P113's gate-loop cost and P120's remediation loop, "since those determine whether re-running the heavy gates is affordable". P120's loop shipped (ADR-043, plus the ADR-044 and ADR-046 amendments), and ADR-046's own digest-at-collect mechanism is a working precedent for the dirty-body check this ticket names as one of its two options. This ticket is designable now.



- **Blocks**: (none)
- **Blocked by**: P165
- **Composes with**: P089 (structural lint); the five-gate sequence.

**Why P165 blocks (added 2026-08-29).** Verification of this ticket needs an edition whose gates recorded digests, and P165 defect two is the reason two of the last three editions recorded none. Its own note says the same thing from the other side: "That ticket cannot verify while this is open." P165 is Effort S, so under the transitive-effort rule this ticket's effort is unchanged at M.

## Related

Captured during the 2026-06-22 Issue 10 retrospective. Sibling to the "gates pass but defects remain" class (P089).

## Flip-back: Verification Pending -> Known Error (2026-08-05 review pass)

**Verdict**: `no - observed regression`. Routed to `/wr-itil:review-problems` Step 4
Bucket 3 (botched-fix candidate, never batch-closed).

**Recurrence citation.** Issue 16 (`src/newsletters/published/leader/2026-08-03/2026-08-03.reviews.md`)
is the first edition after the §15.6 rule shipped, and it took three separate
post-gate body-edit passes (external editorial review, browser-assisted sourcing,
then six further external review rounds). The FULL gate set did **not** re-enter on
those edits. What re-ran: content-risk, voice, URL verification, structural lint.
What did not:

- **Cross-edition consistency.** The reviews ledger states it plainly: "Not re-run at
  finalise. **This is a gap worth naming:** Tom's publish-morning thesis correction
  moved the edition's position further than the prep-phase rewrite did ... it has not
  been checked against the prior eight editions."
- **Skeptic (brief).** "it has not been re-tested, because the skeptic's budget for the
  brief was spent before the final rewrite."
- **Skeptic (LinkedIn).** "The post was subsequently rewritten again around Tom's
  corrected thesis ... Not re-tested."

That is precisely the cheap-subset-instead-of-full-set failure the rule was written to
prevent, observed on the first edition that could exercise it.

**What this says about the fix.** The rule's text is not the defect; the delivery
mechanism is. §15.6 is a save-time discipline checkpoint enforced only by agent
adherence, with no marker and no automated check, and the ticket's own Fix Strategy
recorded that choice ("chose the save-time checklist + in-context 'dirty' judgement;
rejected a marker file (YAGNI)") and recorded that no automated repro was feasible.
Under real publish-morning pressure the in-context judgement did not fire. Re-opening
at Known Error is the honest state: root cause is understood, workaround is the manual
re-run, and a stronger mechanism is outstanding.

**Composes with**: P113 (gate-loop cost per pass, which is the reason the heavy gates
get skipped) and P120 (gates surface findings rather than remediating them). The
skipped-gate cost and the unactioned-finding cost are the same economics from two
sides.

**Recovery**: rerun `/wr-itil:transition-problem 099 verifying` if this flip-back is
judged wrong.

## Scope hung off this ticket 2026-08-08: the stale-ledger / un-regated-final-artefact residue (from P117)

Routed here during the P117 closure read rather than captured as a new ticket. A
duplicate check across `docs/problems/` found this ticket already owns the gap exactly,
so the evidence is recorded against it instead of minting a sibling.

**The residue.** Issue 16's reviews sibling records two admissions against itself, in the
section "Post-gate pass 3: external review rounds 2-6"
(`src/newsletters/published/leader/2026-08-03/2026-08-03.reviews.md`):

- "Six further rounds of external editorial review ran on 2026-08-03 after the gate
  ledger above was written, so **that ledger describes a text this edition no longer
  carries** ... the ledger's verdicts attach to superseded artefacts."
- "**Not re-gated.** The final LinkedIn companion did not get a voice pass after the
  second rewrite. The prior verdict was stale by then rather than favourable, and the
  rewrite was a cut rather than an addition, but the gap is real and recorded here rather
  than left implicit."

The general shape: editing continues after the gate battery terminates, so the recorded
verdicts attach to superseded text and the final shipped artefact can ship un-regated
while the ledger reads as though it were gated.

**Why this is this ticket and not a new one.** That is this ticket's defect statement.
The 2026-08-08 fix (RFC-005 vehicle, ADR-047 decision) is precisely the mechanism: every
gate verdict records a digest of the artefact version it scored, a lint names any gate
whose verdict predates the draft being saved, and the skill re-invokes those gates
against the current draft. Both admissions above are cases that mechanism is built to
catch -- a LinkedIn voice verdict whose digest no longer matches the post, and a ledger
whose verdicts as a set predate the saved body.

**Timing, which matters for how this evidence counts.** The reviews file carrying these
admissions was committed at `bbb6ca1` (2026-08-04); ADR-047 landed at `4f342a6`
(2026-08-08). This is therefore **pre-fix** evidence. It does not falsify the shipped
mechanism. What it does is raise the bar for the verification this ticket is already
waiting on: the next `/wr-newsletter` run that takes post-gate edits must re-run the
stale gates without Tom asking, **including on the LinkedIn companion after a
late rewrite**, which is the specific case the pre-fix ledger admits was dropped.

**Distinct from P113, and the distinction is directional.** P113 wants *fewer* gate
rounds (it targets the editor's one-nit-per-pass loop cost). This wants a *final re-gate
checkpoint at save* -- one more gate pass, on the last text, after editing stops. The two
pull opposite ways on the same budget and both are legitimate: P113 reduces the cost per
round so that this ticket's terminal re-run is affordable. Neither subsumes the other.

**Cross-references.** P117 (closed 2026-08-08; this residue is what its counter-evidence
read left over after the rest routed to P121, P122 and P113), P121 (prior-edition shape),
P122 (within-edition assembly), P113 (gate-loop cost, per the paragraph above).

## Observed 2026-08-25: the verifying run happened and the recording half did not fire

The Fix Released section names the test as the next `/wr-newsletter` run that takes post-gate edits, and whether the missing reviews re-run without Tom asking. The Shift Issue 19 was that run. It took post-gate edits repeatedly across twenty-four remediation rounds, so the condition to be detected was present in abundance.

It cannot be scored, and the reason is worse than an unmet condition. ADR-047's recording contract did not run at all. That edition's reviews sibling carries zero `scored-digest:` lines; its immediate predecessor, published a week earlier, carries five. Every verdict block is prose. The edition's own record explains what happened instead: the brief was frozen under an md5 each round and the checksum passed into every gate prompt, which is the discipline running by hand on a different algorithm rather than the custody contract this fix shipped.

The detector was silent for the same reason. Check (m) skips when the sibling carries no digest lines, and prints a fixed message attributing the absence to a pre-ADR-047 edition. Issue 19 postdates ADR-047 by sixteen days. That defect is captured as P165.

This is the falsification of what the Fix Released section already flagged as its weak point. It called the custody invariant "a prose rule of the same enforcement class as the one this ticket records as having failed", and declined to dress it as structural. One edition later the prose rule did not hold, and the lint could not tell.

So this ticket was flipped back to Known Error on 2026-08-28 rather than left reading as merely unverified: the mechanism it shipped is not running on the live pipeline, and it cannot be verified until the digests are emitted again and check (m) can distinguish a legacy edition from a current one. P165 owns both halves.

## Worked 2026-08-29: the custody hole this ticket named against its own fix is now closed

This ticket stays at **Known Error**. The 2026-08-28 flip-back set its own un-park
condition, and half of that condition is still outstanding, so nothing here reclassifies
it. What changed is that the ticket's own named weak point is no longer prose.

**The flip-back's evidence was re-verified on disk before anything was built on it.**
The count it rests on holds: `2026-08-24.reviews.md` carries zero `scored-digest:` lines
and `2026-08-17.reviews.md` carries five. Both files exist, so the zero is a real absence
rather than a missing sibling. The conclusion drawn from it needs splitting, though. It
reads "P165 owns both halves", and P165 shipped the first half on 2026-08-25, three days
before this flip-back was written: check (m) now derives whether ADR-047 governs an
edition from its date instead of inferring exemption from the absence it is testing for.
Only the second half is outstanding, and it needs an edition run, not a code change.

**The hole that was still open, and is this ticket's rather than P165's.** The Fix
Released section above says the lint "catches the common breach (a carried block that
lost its digest) but not the narrower one (a block paraphrased while its digest string is
copied across)". Reading the code, the gap was wider than that sentence: check (m) read
`if (carried) next` and skipped every carried block from digest comparison entirely. So
the whole carried-with-a-digest state was unexamined, and a carried block whose digest
had been recomputed at save read as legitimate. That is how a gate that never saw the
final text passes silently, which is this ticket's defect statement.

**What closes it.** A carried block scored an earlier artefact by construction, which
RFC-005 already states. Check (m) now reports a carried block holding the digest of the
draft being saved, because that equality is a positive signal the digest was recomputed
rather than copied across. It is one arm in the awk already walking the file: no git, no
baseline, no prose comparison, no new state, and the lint stays a pure function of the
brief, the post and the reviews sibling.

Two designs were rejected on gate review before this one. Comparing each verdict block
against its last committed version would have made the lint depend on repo state, and
would have failed exactly the edit check (n) requires when an author adds a stated reason
to a CLEARED finding. Minting a separate check letter would have forked check (m)'s
heading classifier. The arm also lands one branch from its own sibling, `custody-broken`,
which is the same invariant with the other signature.

**Also fixed, found while editing that dispatcher.** A verdict naming an artefact not yet
written fell through to the catch-all and printed "was scored against a different (no
artefact on disk to compare) than the one being saved; re-run that gate". Ungrammatical,
and it prescribed a gate invocation for what step 16 records as a save-ordering fault. It
now names the ordering remedy.

**Six behavioural tests**, four confirmed red first. They pin the refreshed digest on both
carried markers (the `(prep)` heading suffix and the `carried-from:` line set `carried`
independently), the per-surface split, the legitimate carry staying quiet, and the
ordering message. Full suite 127 passing.

**The remedies are ordered, and the order is the load-bearing part.** Recover the original
block from the prep commit verbatim where the prep digest differs; only where it is
unrecoverable or equal, re-run the gate and drop both carried markers. Presenting those as
equals would have been worse than saying nothing, because the second is the cheaper exit
and on a genuinely recomposed block it converts the recomposition into an assertion that
the gate scored the current body.

**What is still not mechanised, stated rather than dressed.** Dropping both carried markers
without actually re-running the gate produces a block no deterministic check can tell from
a legitimate fresh finalise verdict. The prep body is gone, so nothing can compare against
it. "Do not reach for that first" is prose mitigation of the same enforcement class this
ticket exists because of. The class is narrowed, not closed, and RFC-005 now records that
narrowing at its custody-invariant section rather than reading as though the whole failure
mode were still open.

**What remains before this can be verified.** Nothing further to build here. An edition has
to run that both records digests and takes post-gate edits, and the digests depend on P165
defect two. Gate reviews this round: architect PASS, jtbd PASS, style-guide PASS, voice and
tone PASS.

**Substance guard, recorded because the answer is not obvious from the file.** RFC-005's
own frontmatter reads `human-oversight: unconfirmed`, which looks at first glance like
building on an unratified decision. It is not: the RFC tier carries no decision substance
here, and RFC-005's stated precondition is that implementation waits on the keying ADR
rather than on itself. `wr-architect-is-decision-unconfirmed` returns confirmed for all
five ADRs it declares (047, 017, 026, 043, 046), so every decision this change rests on
is ratified. The risk scorer caught the same frontmatter and read it as an unsupported
ratification claim, which is a fair read of the RFC's framing and is noted here so the
next person does not have to re-derive it.
