---
status: "proposed"
first-released:
date: 2026-08-07
human-oversight: unconfirmed
decision-makers: [Tom Howard, Claude]
consulted: [wr-architect:agent]
informed: []
reassessment-date: 2026-11-07
amends: [043-bounded-editorial-remediation-loop-for-editor-and-skeptic-gates]
composes-with: [020-newsletter-editor-subagent, 042-newsletter-adversarial-skeptic-gate, 044-cross-edition-shape-as-a-fresh-context-subagent-gate]
related: [017-ai-brief-prep-and-finalise-phases, 032-newsletter-editorial-discipline-policy]
---

# Skip the agent re-invocation when the artefact is unchanged

> **ID namespace.** Bare `ADR-046` in this repository means this decision. The upstream `@windyroad` plugin corpus has its own ADR-046 (blocked-reporters persistence), which is unrelated. Same first-mention hazard ADR-043 carries a note for.

## Context and Problem Statement

ADR-043's bounded remediation loop re-invokes the contributing gates after a remediation round so they can see what changed. Step 15.37 does this as a paired round (editor plus skeptic, plus the shape gate when it contributed); steps 15.55 and 15.57 do it for a single contributor on the companion post.

A remediation round can produce **no edit at all**. Every finding it collected may be stop-and-surface, or the drafter may decline every one for cause. The re-invocation then asks an agent to re-read a file byte-identical to the one its findings were already taken against, and it can only return the same findings. On the brief surface that is up to three agent invocations (editor, skeptic, and the shape gate when it contributed) spent to learn nothing.

**Why this is a document rather than a clause.** It was first drafted as a sixth clause on ADR-043's `## Amendment 2026-08-07 (P121, P122)` section and committed that way in `5305344`. Tom directed on 2026-08-07 that a new decision should be its own document, because a reader who opens an ADR reads the main decision and can miss an amendment section entirely. This corpus has a worked instance: ADR-020's criterion-6 "ceiling" misreading entered through an amendment body, propagated into ADR-042 and then ADR-043, and had to be corrected inline at the criterion itself.

The commit made the case stronger than the argument did. The insertion matched the wrong section boundary and landed clause 6 inside ADR-043's `## Invocation budget re-assertion` section, whose own opening blockquote instructs the reader to treat everything under it as **historical framing, corrected**. A live normative rule sat under a do-not-act-on-this marker for the length of one commit.

## Decision Drivers

- A re-read of a byte-identical artefact cannot return information the previous read did not.
- A wrongly-skipped look silently drops a finding, which is the P099 failure this pipeline exists to prevent. The costs are asymmetric and the safe direction is known.
- ADR-043 deliberately holds the loop's bookkeeping in orchestrator context rather than on disk, so any state this decision adds must not become the marker file that decision declined.
- The rule ships on cost-benefit. Two attempts to warrant it in principle failed (see Decision Outcome).

## Considered Options

Three distinct behaviours. A fourth entry is recorded under Decision Outcome as a rejected *warrant* for the chosen behaviour rather than as a rival behaviour, because listing it here would suggest the chosen rule beat something it is identical to.

1. **Key the skip on byte-identity of the artefact** (chosen).
2. **Key the skip on the actor**: skip when the remediation step applied no edit. Rejected. It keys on who acted rather than on what the artefact is. On ADR-043 condition (c)'s post-full-pass path the remediation step is not the only thing that can have edited the body, so "the step applied no edit" does not entail "the body is unchanged", and the skip would suppress a look that should happen.
3. **Leave the re-invocation unconditional.** The status quo. Costs up to three agent invocations per no-edit round for information that cannot differ.

## Decision Outcome

**Skip the AGENT re-invocation when the artefact is byte-identical to the version the collected findings were taken against.**

**"Agent" is load-bearing.** A deterministic contributor re-run on a byte-identical body provably returns identical findings, so for that half the skip would be a deduction rather than a judgement, and re-running it costs no invocation while giving the churn comparison a fixed point. This rests on the deterministic-versus-agent contributor split established by **ADR-043's 2026-08-07 amendment clause 1** (landed by ADR-044). Deterministic contributors are therefore **always re-run**; only agent invocations are skipped.

**Which artefact, per surface.** The rule is about *the artefact under review*, which differs by site: the brief body at 15.37, the LinkedIn post at 15.55 and 15.57. A remediation at 15.55 can propagate a claim change back into the brief; where it does, the brief is a changed artefact for any subsequent brief-surface look, and the skip does not apply to it on the ground that the post was the thing edited.

**Which rounds this fires on.** The no-edit rounds this optimises for are largely the ones **ADR-043's 2026-08-07 amendment clause 3** produces: its classification precedence (wrongness outer, grain inner) is what routes a whole round to stop-and-surface. That adjacency was implicit while this rule lived beside clause 3 and is stated here because it no longer is.

Three conditions make the rule safe. Each is load-bearing; leaving any implicit is what makes a skip rule dangerous.

**The loop-exit full pass is OUT of scope.** On an all-stop-and-surface round the artefact reaching ADR-043's loop-exit full pass is also byte-identical, and that pass costs more agent invocations than the round did, so it is the obvious next place to extend this rule. It is deliberately not extended. ADR-043 condition (a) makes the full pass the guarantee that no publish-bound body reaches step 16 without a complete gate pass since its last edit, which is the P099 invariant itself; skipping it would trade a bounded cost saving against the thing the loop was built to preserve. A future proposal to extend the skip there is a new decision, not an implementation detail of this one.

### 1. The comparison needs an operand, and this decision adds one

Step 15.37 item 1 pins a *requirement* (all findings must be against the same body version) but retains nothing to compare against, and ADR-043 deliberately declined a marker file, calling the loop's bookkeeping in-context judgement. A byte comparison against a remembered version is not a byte comparison.

So the collect step **retains a hash of the artefact it collected against, for the duration of the pass, in orchestrator context**, and the skip test is that hash against a fresh read of `artifact_path`. In-context is load-bearing: ADR-043's Neutral consequences record that no marker file is added, so the retained hash must not become one.

### 2. When in doubt, re-run

Where the hash is unavailable, the default fires and the agent is re-invoked. This is not optional hedging.

The asymmetry is the justification. A needless re-run costs up to three agent invocations on the brief surface (editor, skeptic, and the shape gate when it contributed). A wrongly-skipped look silently drops a finding. And the agent judging identity is the agent that just decided whether to edit, so its judgement is not independent; the retained hash exists to remove the judgement from the loop, not to inform it.

### 3. A skipped round IS consumed, and it is recorded

Declining a look because nothing changed still spends that round. **ADR-043 condition (c)'s counter is consumed by a declined look**, leaving the post-full-pass look as the remaining one.

**ADR-043 condition (d) is unaffected**: it bounds a different counter, the outer cycle of consecutive edit-forcing full passes, as ADR-043's own Consequences state. (P122 and RFC-004 both prescribed the wording "conditions (c) and (d) read that counter". That is false, and both carry inline correction markers pointing here.)

Without this, a no-edit round would be free and the loop could cycle indefinitely on an unchanged body, which is the unbounded behaviour ADR-043's one-round cap exists to prevent.

**Reconciling with the finding-level rule.** ADR-043 states that a stop-and-surface finding "does not consume the round". That rule governs the treatment of a *finding*; this decision governs the *loop*. In the all-stop-and-surface case this optimises for, no finding consumes the round and the declined look consumes it anyway. Both hold: findings are not charged, looks are.

A declined round is recorded in the edition's `.reviews.md` distinguishably from a taken round, so the trade can be evaluated after the fact rather than asserted.

**The rejected warrant, recorded because the history is load-bearing.** Two successive drafts tried to justify this rule *in principle*, by arguing the re-invocation is a no-op. Both failed on inspection, and P122 Fix Strategy section 5 records exactly why each collapsed. The re-invocation is not inherently pointless: an agent re-reading a *changed* body genuinely can return different findings, which is the reason the loop re-invokes at all. What survives is narrower than those drafts claimed, and it is a cost-benefit judgement rather than a correction of an error.

## Consequences

**Good.** Removes a class of provably uninformative invocations. Gives the loop's bookkeeping an actual operand where it previously had recollection, which is a correctness improvement independent of the cost saving.

**Bad.** The rule ships on cost-benefit, not on principle, and the failed warrant above is the record of that. If the identity test is ever wrong about what "unchanged" means, the failure is silent.

**Neutral.** Adds one piece of in-context state to a loop whose parent decision chose to hold bookkeeping in context rather than on disk. Consistent with that choice, but it moves slightly against its spirit, which is why the in-context form is pinned here rather than left to an implementer.

## Confirmation

1. `.claude/skills/wr-newsletter/SKILL.md` step 15.37's collect step retains a hash of the collected-against artefact, and its re-invoke step is conditioned on that hash. The companion-surface re-invocations at 15.55 and 15.57 carry the same condition. (Exact line placement is RFC-004 item 6's decomposition, not pinned here, so it does not rot.)
2. Deterministic contributors are re-run unconditionally at every site. A skip that omits a deterministic contributor is a defect.
3. **ADR-043 carries this exception inline in its main body**, not only by reference from an amendment section. Specifically: its Decision Outcome loop enumeration (which states re-invocation of both gates unconditionally), conditions (a) and (c), the skeptic differential's "does not consume the round" rule, the brief-and-post scope paragraph, confirmation criterion 3, reassessment criterion 1, and the Neutral consequence recording that no marker file is added each point here. That last one matters because condition 1 above leans on it directly. This criterion exists because amendment-only placement is the exact drift this decision was moved to a separate document to prevent, so its own confirmation must be able to detect it.
4. A declined round appears in the edition's `.reviews.md` and is distinguishable from a taken round.
5. Section 15.6's remediation-loop row states that a declined look consumes condition (c)'s counter.
6. The two documents that prescribed the superseded "conditions (c) and (d) read that counter" wording (RFC-004 item 3 and P122's Fix Strategy) carry inline correction markers pointing here, and `docs/decisions/README.md` carries an ADR-046 entry noting it was hand-edited under the P087 posture.

## Reassessment Criteria

- **The pre-registered falsifier is ADR-043's reassessment criterion 1**: if external review starts raising classes the loop marked residual, the trade was wrong and the cap is too tight. This decision is registered against that check specifically, not against a general appeal to caution.
- **If a skip is ever found to have fired on a changed artefact**, the identity mechanism is wrong and this decision is the thing to reconsider, not the loop's cap.
- **If declined rounds are rare in practice** (fewer than one per four editions), the saving does not justify the added bookkeeping and the rule should be retired in favour of the unconditional re-invocation.

## Related

- **ADR-043** (Bounded editorial remediation loop for the editor and skeptic gates): the decision this amends. Its one-round cap, reduce-only differential, residual-advisory arm and absent author-override arm all survive unchanged. Its four section-15.6 conditions survive in wording; this decision changes what consumes condition (c)'s counter.
- **ADR-044** (Cross-edition shape as a fresh-context subagent gate): landed clauses 1 to 5 of ADR-043's 2026-08-07 amendment section, including clause 1's deterministic-versus-agent split and clause 3's classification precedence, both of which this decision rests on. This decision is not one of those clauses.
- **ADR-020** (Newsletter editor subagent) and **ADR-042** (Newsletter adversarial skeptic gate): the two gates whose re-invocation this conditions.
- **RFC-004** (Within-edition assembly sweep as a third editor read): the fix vehicle. Its item 3 specified this as an ADR-043 amendment clause; recording it as its own decision is a deliberate departure made on Tom's direction of 2026-08-07.
- **P122**: the driving ticket. Its Fix Strategy section 5 carries the failed in-principle arguments; its precondition 2, which prescribed the sixth-clause placement, carries a correction marker pointing here.
- **P099**: the invariant a wrongly-skipped look would violate.
