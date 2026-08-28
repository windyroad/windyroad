---
status: proposed
rfc-id: gated-digest-makes-post-gate-edits-detectable-at-save
reported: 2026-08-08
human-oversight: unconfirmed
decision-makers: [Tom Howard]
problems: [P099]
adrs: [047-stale-gate-verdicts-are-re-run-and-the-check-over-reports, 017-ai-brief-prep-and-finalise-phases, 026-reviews-and-meta-content-to-sibling-files, 043-bounded-editorial-remediation-loop-for-editor-and-skeptic-gates, 046-skip-the-agent-re-invocation-when-the-artefact-is-unchanged]
jtbd: [JTBD-005, JTBD-200, JTBD-300]
stories: []
---

# RFC-005: Detect post-gate edits at save, and re-run the reviews that missed them

**Status**: proposed
**Reported**: 2026-08-08
**Problems**: P099
**ADRs**: ADR-017 (prep and finalise phases), ADR-026 (reviews to sibling files), ADR-043 (bounded editorial remediation loop), ADR-046 (skip the agent re-invocation when the artefact is unchanged)
**JTBD**: JTBD-005, JTBD-200, JTBD-300

> **ID namespaces.** Bare `ADR-0NN` means a **local** decision in `docs/decisions/` (017, 026, 032, 039, 040, 043, 045, 046). **ADR-060, ADR-073, ADR-074, ADR-077** are **upstream `@windyroad` plugin** IDs, marked upstream at each mention. Local ADR-046 collides with a different upstream ADR-046. Same note ADR-043:19, ADR-046:18 and RFC-004:21 carry.

## Summary

Have each gate record the digest of the artefact version it actually scored, then check at save time that every recorded digest still matches. A mismatch means a gate's verdict attaches to a superseded artefact, which is the P099 failure and is currently invisible. **Per Tom's direction of 2026-08-08, a stale gate is re-invoked automatically rather than reported**: handing him a list of skipped reviews on publish morning is the moment the original problem says he is least able to act on it.

## Driving problem trace

**P099 (no rule that a post-gate body edit must re-run the FULL gate set).** A prose rule was shipped for exactly this, at SKILL.md step 15.6. P099's own Effort line records that it "shipped and did not hold".

**The failure is on disk, one edition old, stated by the author unprompted.** `src/newsletters/published/leader/2026-08-03/2026-08-03.reviews.md:213-217`:

> Six further rounds of external editorial review ran on 2026-08-03 after the gate ledger above was written, so that ledger describes a text this edition no longer carries. This section records what changed and what was re-gated, because the ledger's verdicts attach to superseded artefacts.

**Attestation strength, stated per limb rather than claimed uniformly.**

- **Post-pass-3 positive attestation**, one gate: `:240-243`, "The final LinkedIn companion did not get a voice pass after the second rewrite."
- **Pre-pass-3 positive attestation**, three gates: `:86` skeptic (brief), "it has not been re-tested, because the skeptic's budget for the brief was spent before the final rewrite"; `:94` skeptic (LinkedIn), "Not re-tested."; `:100` cog-a11y, whose Grade 9.7 figure is qualified "(measured before the final opener rewrite)".
- **Absence-warranted**, five gates (critic, editor, skeptic-brief, skeptic-LinkedIn, cog-a11y): absence from the re-gated list at `:234-238`, warranted by `:215-216` stating the section "records what changed and what was re-gated". That is inference from an asserted-complete record. Stronger than bare absence, weaker than attestation, and labelled as such rather than blurred.

Re-gated at `:234-238`: voice (brief), content-risk, cross-edition, structural lint.

**The evidence is self-demonstrating.** `reviews:127` says cross-edition was "Not re-run at finalise. **This is a gap worth naming**"; `:237` says "Cross-edition consistency SUPPORTED". Both are in the same file and `:237` is the later state. P099:91-94 quotes the superseded `:127` as its lead recurrence citation, so the driving ticket was itself written against a stale ledger. That is this RFC's thesis happening to its own evidence.

## Proposal

Each gate verdict records the digest of the artefact version it scored, as an attribute of the verdict, serialised into the `.reviews.md` sibling at step 16. At step 16, after the sibling is written, the structure lint recomputes and compares.

### Why the lint is the right hook, on evidence rather than convenience

`reviews:238` records, under "Re-gated, final text": "Structural lint 10/10 clean runs." The lint **did** re-run against the post-six-rounds text while the critic, the editor and both skeptics did not. It is the one row in the section 15.6 table that survived the publish-morning pressure that broke every heavy gate, because it is deterministic and cheap. Hanging detection on it is not arbitrary placement; it is the one hook the evidence shows still firing.

The ledger was also updated by **appending** a narrative section (`:211`) rather than by rewriting the verdict blocks, so prior per-gate digests would have survived intact and the comparison would have fired.

### Operand custody across passes

The digest is **not** ADR-046's in-context operand. ADR-046 pins its digest to one pass; this must work across saves, because the six review rounds ran after the ledger was written. If the orchestrator re-serialises the current digest at every save, every gate matches by construction and the check detects nothing.

So: on a subsequent save, a gate that did **not** re-run keeps the digest it originally recorded; only a re-run gate writes a fresh one. That requires reading prior digests back off the sibling, which is durable on-disk custody, stated as such rather than dressed as in-context. This is a **different shape** from ADR-046, not the same mechanism reused.

### The custody invariant, and its honest cost

**A digest is written ONLY as part of writing a verdict block. A block that was not re-scored is copied VERBATIM, digest included.**

**This is a behaviour change, not a formalisation.** The template at SKILL.md:1237-1309 prescribes carried-from-prep blocks, but neither recent edition follows it. Issue 16's reviews file contains **zero** `(prep)` sections: the slots were replaced by a summary table plus a git pointer at `:8` ("Prep-phase review blocks are preserved verbatim in git at commit `1cf2691` ... This file records the finalise-phase verdicts and **summarises** the prep-phase outcomes"). Issue 15 does carry `(prep)` sections, but as one-line summaries composed at finalise (`:45`, `:58`, `:74`), not copied blocks. On both editions the orchestrator **composed** rather than copied, which is exactly what would silently refresh a digest.

Two consequences. The `:1261-1301` slots are surfaces the implementation must **rewrite**, not merely read. And this remains a **prose rule enforced by orchestrator adherence**, the same enforcement class as step 15.6, which P099 records as having not held. Its failure mode is a **silent false negative**: a refreshed digest is indistinguishable from a legitimate re-score, and `:1223`'s replace leaves no prior copy in the working tree. What can honestly be claimed is that it is **better-conditioned** than 15.6's, because "am I writing a block or copying one?" is a within-step question rather than a memory of body state across unbounded edit rounds.

> **Narrowed 2026-08-29 (P099).** The paragraph above is now too pessimistic on one limb, and marked rather than rewritten so the original reasoning stays readable. A refreshed digest on a block **marked carried** is no longer indistinguishable: a carried block scored an earlier artefact by construction, so a carried digest equal to the draft being saved is a positive signal that the digest was recomputed at save. Check (m) previously skipped carried blocks from comparison entirely (`if (carried) next`) and now reports that equality. What remains a silent false negative is the unmarked case: dropping both carried markers without actually re-running the gate produces a block indistinguishable from a legitimate fresh finalise verdict, and no deterministic check can see it. The ordered remedies at `SKILL.md`'s check (m) response are prose mitigation of that remainder, which is the same enforcement class this paragraph names. The class is narrowed, not closed.

### Four states, not a boolean

A block carried from prep can never match the current digest by construction, and SKILL.md:1194/:1196 rename and replace the `.prep.md` so a carried prep digest names a path the working tree no longer has. A boolean would fire on every legitimate ADR-017 carry, which is the identical objection this RFC uses to eliminate the whole-set digest, recurring inside its own limb. The states are:

`matches-current` | `carried-by-design` | `never-scored` | `stale`

**`never-scored` is distinct.** SKILL.md:1261 carries a second N/A branch (written **first** in the template), "N/A: newsletter-critic returned REJECTED", recurring at `:1269`, `:1281`, `:1293`, `:1301`. A gate that never scored is not `carried-by-design`, which asserts equivalence. Conflating them would merge "asserted equivalent" with "never evaluated", different risk states under P099's own thesis.

Recognising the states is **derivation, not an open choice**, but on the full suffix string rather than the bare `N/A:` prefix, which no longer discriminates with two branches. The vocabulary is not uniform either: `:1293` uses "No-op: editor and skeptic both PASSed".

**`carried-by-design` is recognisable but not verifiable** by a deterministic working-tree lint: the prep artefacts survive in git (Issue 16's `reviews:8` records commit `1cf2691`) but not in the tree. Only `matches-current` and `stale` are actually checked.

## Tom's direction, 2026-08-08: re-run the missing reviews, do not just report them

**This supersedes the detect-only scope this RFC was drafted with.** Asked how fussy the check should be, Tom answered: *"I'm happy with Fussy. But I don't want it just telling me that the review hasn't been run. I want to actually run the missing reviews."*

So the mechanism is unchanged (each verdict records the digest of what it scored; the comparison at save finds the stale ones) but the **response** changes. A gate found stale is **re-invoked against the current artefact**, not reported as a finding for Tom to action on publish morning. Detect-only would have handed him a list at exactly the moment the original problem says he is least able to act on it, which is the opposite of the point.

Three things this does not change, because they are the difference between re-running what is stale and re-running everything:

- **Legitimately-skipped gates are not re-run.** The claim-scoped rows still govern: cross-edition triggers on a thesis-bearing line changing, URL verification on a URL or URL-anchored claim changing, and "body changed" is the wrong test for both (SKILL.md:1091). A body edit that touched neither does not re-invoke them.
- **Sanctioned skips stay skipped.** Where the step-15 re-run returned REJECTED, the rows that skip on it stay skipped. Re-invoking the editor on a body the critic rejected is waste.
- **The bound still holds.** ADR-043 capped the remediation loop for a reason, and auto-re-running is exactly the cost it bounded. The re-run is of the **stale set**, once, against the current artefact, not an uncapped loop. If a re-run itself forces an edit, that re-enters the existing section 15.6 machinery rather than recursing here.

**What this costs, stated plainly.** Re-running the heavy gates costs agent invocations on publish morning, which is the busiest moment. The trade Tom accepted is that spending them automatically beats handing him a list of what was skipped. The fussy setting he chose means some of those re-runs will turn out to have been unnecessary; that is the accepted cost of not staying quiet about a real miss.

**Consequence for the escalated choice.** The keying granularity below now decides not only what is flagged but what is **automatically re-invoked**, which raises the stakes on dimensions 3 and 5 in particular: an over-broad digest now spends invocations rather than merely printing a line.

## Scope: what re-runs, and what a stale verdict means

"Body changed" is the wrong test for some rows, and SKILL.md:1091 says so outright:

> **Two rows have claim-scoped triggers that step 15.37's remediation fires by construction.** "Body changed" is the wrong test for them, so check them directly after any skeptic remediation:

Cross-edition (`:1081`) triggers on a thesis-bearing line changing; URL verification (`:1082`) on a URL or URL-anchored claim changing, with its skip column sanctioning the carry ("unchanged URLs carry their prior verdict"). The shape gate at `:1077` carries a Tom-cleared deviation forward by design. Across `:1075-1080` the REJECTED skip column sanctions five rows (`:1075` editor, `:1076` skeptic, `:1077` shape-brief, `:1078` remediation loop, `:1080` cog-a11y); `:1079`'s skip is `phase=prep`, and `:1074`'s critic row carries a differently-keyed upstream-content-risk skip.

**For body-triggered rows** a detected staleness IS a condition-(a) violation, and its remedy is now the automatic re-invocation above, which is what condition (a)'s existing full pass (ADR-046:57: condition (a) "makes the full pass the guarantee that no publish-bound body reaches step 16 without a complete gate pass since its last edit, which is the P099 invariant itself"). No discretion is added and no ADR-043 amendment is implied.

An earlier draft claimed staleness could stay editorial judgement under ADR-043's residual-advisory vocabulary. That vocabulary governs a **finding that survived remediation** (`:64`, `:82`, `:109`), not a stale verdict, and the claim is withdrawn. Tom's direction settles it further: a stale body-triggered verdict is re-run, not judged.

### Which reading of `:1075` this RFC holds

The detect-only carve-out turns on this. The skip reads "skip iff the step-15 re-run returns `VERDICT: REJECTED`". **This RFC holds the STRICT reading**: the skip is sanctioned only when a step-15 re-run actually happened and returned REJECTED.

On Issue 16 the critic did return terminal REJECTED (`reviews:16`, `:28`), and **three** of the six residuals are REJECTED-skip rows: editor (`:1075`), skeptic-brief (`:1076`), cog-a11y (`:1080`). The other three are excluded by this RFC's own text: skeptic-LinkedIn is row `:1083`, whose only skip is `phase=prep`; LinkedIn voice (`:1084`) has no REJECTED skip; and the critic (`:1074`) carries the differently-keyed skip, which was not satisfied here on a terminal-verdict reading since content-risk returned PASS (`reviews:15`, `:235`, "PASS, after two REJECTED verdicts at `claims=high`").

Under the loose reading **those three REJECTED-skip rows** would still be genuinely stale, so a firing is not a detection error; what would change is only whether staleness counts as a condition-(a) violation, per the scope section above. Under the strict reading no step-15 re-run happened in pass 3, so nothing was sanctioned.

**Corollary**: the `never-scored` state discriminates a sanctioned skip only when the orchestrator **writes** the `N/A:` block. A silently-taken skip writes nothing and correctly reports stale.

The counterfactual is scoped to the **body-triggered** residual gates. `## URL Verification (finalise)` at `reviews:190` is a seventh finalise verdict absent from the re-gated list, and the post-gate browser-sourcing pass at `:162` leaves its status genuinely open; it is excluded on the claim-scoped ground at `:1082`, which is open dimension 5.

## Non-unification constraint

ADR-046:69 and :97 pin its digest in-context **precisely so it does not become the marker file ADR-043:164 declines**. This RFC adds a second digest of the same artefact computed with the same `shasum -a 256`. The obvious implementer efficiency, unifying them, would violate ADR-046:69. **Non-unification is an explicit constraint.**

When the keying ADR lands, ADR-043:164, ADR-046:69 and ADR-046:97 read as contradicted unless annotated inline. ADR-043:164 already carries an inline ADR-046 annotation, so the new annotation nests beside it rather than replacing it, and ADR-046's confirmation criterion 3 is the enumeration model.

## Why this is not the marker file the corpus declined

**Precise attribution.** ADR-043 records no rejected-option entry for a marker file; its decline is a Neutral consequence at `:164`, and ADR-046:34/:67/:69 reads that consequence as a deliberate decline. An earlier draft asserted "ADR-043 does not reject a marker file", which over-corrects against a ratified reading and is withdrawn. The YAGNI reasoning itself is P099's Fix Strategy at `:49` and, normatively, SKILL.md:1087.

**SKILL.md:1087 is the operative surface and this RFC supersedes it.** It reads:

> The "dirty since last full-gate pass" judgement is carried in-context: the agent knows it just edited the body. No marker file or "dirty" flag is added (YAGNI); it would be machinery for a judgement the working agent already holds, mirroring the in-context `*-prime` re-run discipline above.

The trailing clause is quoted rather than elided because it ties the holding to the `*-prime` discipline, a second surface the supersession implicitly reaches. P099 is the evidence that the judgement is not reliably held.

**The discriminator, on the axis the corpus draws** (ADR-046:34, on-disk versus orchestrator context): what ADR-043 and ADR-046 declined is **live loop-control state consulted during a pass**, which can go stale and lie mid-loop. A digest is an attribute of a verdict that ADR-026 already made durable on-disk, serialised at end of pass. **ADR-046's own confirmation criterion 4 is the ratified precedent**: "A declined round appears in the edition's `.reviews.md` and is distinguishable from a taken round" is per-round bookkeeping serialised into that same file.

**The widening, owned.** This makes `.reviews.md` an input, read by the lint and by the orchestrator carrying digests forward. The ADR-026 and ADR-043:74 fresh-context protection is **agent-scoped** and bars a scoring gate from reading its own prior verdict ("round 2 must not read round 1's own verdict off the artifact"). Neither reader here is a scoring gate. An earlier draft justified this as "the reader is a deterministic lint and never an agent", which became literally false once the orchestrator reads back; the warrant is re-stated on the correct axis.

**A ratified decision already records this primitive as needed**, for an adjacent purpose. ADR-017:70, a Neutral consequence: "Finalise needs a 'did something material change?' check to decide whether to re-render the image; that check is a new piece of state-comparison logic."

## The option choice, now made

> **Settled 2026-08-08 by ADR-047 (A gate whose verdict predates the current draft is re-run, and the check is tuned to over-report).** Tom chose over-report plus automatic re-run. That resolves four of the five dimensions below and the fifth was never a tuning question; ADR-047's Decision Outcome records which and why. The dimensions are kept here as the record of what was open and what closed them, not as live questions.

## The option set as it stood

Per upstream ADR-060's I13, an uncovered option-choice escalates to an ADR ratified before implementation and the orchestrator does not pick it. (RFC-004:57 is the local restatement of ratified-not-committed and is itself `human-oversight: unconfirmed`, so it is cited as restatement, not authority.)

**Two limbs are not live** and are recorded as rejected rather than offered:

- **Marker file.** Contra-indicated by ADR-043:164 as read by ADR-046:34/:67/:69, plus P099:49 and SKILL.md:1087.
- **One digest for the whole gate set.** Eliminated by derivation: `reviews:22-23` shows cross-edition and Wardley verdicts legitimately carried from prep, which ADR-017:52 sanctions ("the finalise-phase critic only re-runs against material changes from late-breaking additions"). A set-wide digest would flag every carried verdict stale.

**The uncovered choice is keying granularity**, on five open dimensions:

1. **Per-surface artefact.** ADR-046:51 established that "which artefact" differs by surface. The sharpest observed gap is on the LinkedIn surface, which a single-artefact digest would miss.
2. **The prep-to-finalise boundary.** A carried verdict scored a file at a path that no longer exists, because SKILL.md:1194 renames `.prep.md` to `.md`. What does a carried verdict record?
3. **What is digested**: frontmatter-inclusive or body-only. The lint's general stance is `check-newsletter-structure.sh:71-79`, whose `body=` awk strips brief frontmatter for the whole brief check set. Including frontmatter would mark every gate stale on any step-16 frontmatter touch.
4. **How the lint reaches the sibling.** Not a forced third argument: the script already derives its second input at `:63-66`, and SKILL.md:1108 documents the affordance ("pass it explicitly as a second argument only when it lives elsewhere"). The live precedent is **derive-by-default-with-explicit-override**, a third shape that also resolves the `-2` suffix branch at SKILL.md:1100.
5. **Sub-artefact scope.** Narrower than dimension 1: the claim-scoped rows key on the URL set, the thesis lines, or a cleared deviation rather than on the body. What operand do they digest, if any?

**The corpus had already narrowed to this limb.** ADR-046:59-63 (the 2026-08-08 caveat) independently attributes the YAGNI rejection to P099's Fix Strategy and names "a dirty-body check at save" as one of two candidate mechanisms; P099:7 frames the same two options; P099:63-67 records that "ADR-046's own digest-at-collect mechanism is a working precedent for the dirty-body check this ticket names as one of its two options. This ticket is designable now."

## Surfaces

| Surface | What changes |
|---|---|
| `SKILL.md:1087` | the YAGNI sentence, superseded by this RFC |
| `SKILL.md:1085` | the "Structural lint / 16 pre-save" checklist row |
| `SKILL.md:1102-1105` | the write-then-lint sequence and the lint invocation |
| `SKILL.md:1108` | the sibling-derivation prose, and its stale "six structural invariants" count (the lint now implements twelve, `(a)` through `(l)`) |
| `SKILL.md:1223` | the replace-the-prep-file semantics the custody invariant constrains |
| `SKILL.md:1261-1301` | the carried-from-prep slots, rewritten to require verbatim copy |
| `scripts/check-newsletter-structure.sh` | the comparison, and its header comment, which still enumerates only `(a)` through `(g)` |
| `scripts/check-newsletter-structure.test.mjs` | tests |

**Ordering pinned within step 16**: sibling write, then lint. ADR-026 confirmation criterion 1 puts the write at step 16; the comparison cannot precede it.

## Dependencies

**P119 gates implementation.** It is at Verification Pending, not Closed. The reason is sharper than general flakiness: `reviews:207-209` records the lint "failing 4 runs in 6" and the save proceeding on "multiple clean exit-0 runs" rather than one invocation. A true digest mismatch is deterministic and would not clear on re-run, so re-run-until-green is safe against it. But while the lint flakes, exit-1 is low-signal and a genuine mismatch could be dismissed as "P119 again".

**P099 gains a `## RFCs` reverse-trace section**, required by I1 (`docs/rfcs/README.md:16`), not I13. The same edit must add a correction marker at **P099:55**, which still reads that this repo is "a Phase-1 adopter with no `docs/rfcs/` tier and zero RFC history in git" and treats the I13 firing as a P104 false positive on that ground. Four RFCs now exist. Adding a trace without marking `:55` would leave the ticket asserting both "there is no RFC tier" and "this traces to RFC-005", which is the exact stale-claim-beside-current-claim shape this RFC exists to detect. The ticket already carries a dated in-body correction section at `:79` as the shape to follow.

`docs/rfcs/README.md:90-92` carries P099:55's twin ("(none yet, this tier was just established)") against four RFCs on disk. Its `:88` defers index refresh to the next reconcile pass, so it is mechanically owned rather than a new obligation.

**Precondition means ratified, not committed.** Implementation does not begin until the keying ADR is ratified.

When the keying ADR lands, `docs/decisions/README.md` is regenerated and staged per upstream ADR-077, subject to the P087 posture; verify `wr-architect-generate-decisions-compendium` resolves on disk before relying on it (P082 precedent: it was absent once).

## Commits

(rendered from `git log --grep "Refs: RFC-005"` by `/wr-itil:manage-rfc` and `wr-itil-reconcile-rfcs`.)

## Stories

Empty. The reason is local ADR-045 (RFCs in this project carry no stories until a story tier exists), and standing up the tier remains queued for Tom.

## Related

- **P099**: the driving problem.
- **ADR-046**: the digest precedent, and the decision whose 2026-08-08 caveat records P099's fix as designable now. Closing P099 strengthens it, since its own out-of-scope note leans on the invariant P099 says is unenforced.
- **ADR-043**: whose Neutral consequence at `:164` this RFC's mechanism moves against, with the non-unification constraint above as the reconciliation.
- **ADR-017**: the phase model that makes carried verdicts legitimate, and whose `:70` records this primitive as needed.
- **Evidence**: `src/newsletters/published/leader/2026-08-03/2026-08-03.reviews.md`.
