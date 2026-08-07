---
status: proposed
rfc-id: within-edition-assembly-sweep-as-a-third-editor-read
reported: 2026-08-07
human-oversight: unconfirmed
decision-makers: [Tom Howard]
problems: [P122]
adrs: [020-newsletter-editor-subagent, 042-newsletter-adversarial-skeptic-gate, 043-bounded-editorial-remediation-loop-for-editor-and-skeptic-gates]
jtbd: [JTBD-005, JTBD-200, JTBD-300]
stories: []
---

# RFC-004: Within-edition assembly sweep as a third editor read, with four craft axes and an ADR-043 remediation contract

**Status**: proposed
**Reported**: 2026-08-07
**Problems**: P122
**ADRs**: ADR-020 (Newsletter editor subagent), ADR-042 (Newsletter adversarial skeptic gate), ADR-043 (Bounded editorial remediation loop for the editor and skeptic gates)
**JTBD**: JTBD-005 and JTBD-200 (the reader anchors carrying the warrant), JTBD-300 (Spend editorial judgement where it counts, the author anchor carrying the motivation)

> **ID namespaces.** Bare `ADR-0NN` in this document means a **local** decision in `docs/decisions/` (ADR-020, ADR-032, ADR-035, ADR-042, ADR-043, ADR-044). References to **ADR-060, ADR-072, ADR-073, ADR-074, ADR-089** and to **P371** are **upstream `@windyroad` plugin** IDs and are marked "upstream" at each mention. This repository's local ADRs stop at 044, and the upstream 07x series means something entirely different. Same hazard local ADR-043:19 carries an inline note for.

## Summary

Add a third whole-edition read inside the existing `wr-newsletter-editor` invocation that checks how an edition's parts relate to each other and to its own headline, name the four findings it can report as craft axes on ADR-020, give them a remediation contract under ADR-043, and move the one deterministic half of the check to the structure lint.

## Driving problem trace

**P122 (No gate owns within-edition structural mechanics, so assembly defects reach the reader).** The gate battery is partitioned by content axis. The critic scores rubric quality, the editor scores reader experience and line-level craft, the skeptic attacks claim-evidence calibration, the shape gate compares this edition against its predecessors, and the structure lint checks format hygiene. No partition owns how the parts relate to each other or to the headline. Issue 16 surfaced eight findings of this shape, all caught by a human reading the assembled edition: the item run fought its own thesis, the close did not discharge the title, a promoted argument sat in the demoted section, and content was told twice at near-full length.

Two qualifications the ticket's own investigation added, which its Description prose predates and this RFC does not inherit. **One of the eight is not an assembly finding.** P122:82's lead sentence says "two of the eight findings turn out not to be assembly at all", but the axis table immediately below it maps findings 1 through 7 onto the four axes and excludes only finding 8. The table is the authored artefact, so the count follows it: seven findings collapse into four axes, which is why the vocabulary grows by four and not by seven. Finding 8 in particular (a LinkedIn-post bullet that lists where it should argue) is the skeptic's `promise-payoff` axis on `artifact_kind: linkedin-post`, "already in charter at step 15.55 and already running" (P122:91). It is a calibration miss, not a coverage gap, so the claim that *every* existing gate was structurally blind holds only for the assembly subset. **And none of these reached a reader.** P122:47 records that no factual error ships; the edition was hand-remediated before publication, and P122's Correction 2 (`:70`) further records findings 3 and 5 as arising against intermediate revision states rather than the declared-ready `d2d674a` body. The cost this RFC addresses is Tom's hand-remediation, not reader-facing damage.

The fix is a third read inside an invocation that already happens, so the sweep itself costs no new subagent invocation. The three ADR amendments below are what make its findings legible to the remediation loop.

**Warrant versus motivation.** P122's axis table anchors three of the four axes to **JTBD-005** alone; `edition-internal-consistency` cites **JTBD-005 and JTBD-200** together (`122-...:86-89`). Its Related section records both as the live ratified persona anchors, with JTBD-005 carrying the grounding. **JTBD-300** (author job, ratified 2026-08-07) is the *motivation*: it is why the work is worth doing now. It is not the warrant for editing reader-facing prose. P122 states that distinction explicitly and this RFC keeps it, which is why the trace is additive rather than a swap.

## Deviation from upstream ADR-073, stated rather than assumed

Upstream **ADR-073** was rewritten on 2026-06-29 and is `human-oversight: confirmed`. Three things in it bear directly on this RFC and are recorded here rather than left for a reader to discover:

1. **"Auto-create at fix-time, never block" is rejected** (its History item 4, Considered Option 2). The `capture-rfc --fix-time` mechanism is **held, not shipped**, pending rework.
2. **The lockstep ADR-073:78 called for has since landed, and ADR-073's own note is now the stale surface.** ADR-073:78 still describes upstream ADR-072 and upstream ADR-060's I13 as encoding the rejected auto-create stance, and calls the lag "an integrity hazard, not a cosmetic lag". Both files have in fact been amended: ADR-060:116 now reads that a missing RFC "must be **authored first**, fix implementation does **NOT** begin until the problem has an RFC (**RFC-first**, per the corrected ADR-073; retrospective RFC prohibited)", with a superseded-note at ADR-060:101 retiring the old wording, and ADR-072:46-49 reads "no RFC, author it first (per ADR-073), then implement, never auto-create as a byproduct of the fix." **So the I13 gate that fired during `/wr-itil:work-problem P122` and produced this RFC is running current wording, not stale wording.** An earlier draft of this section asserted the opposite by propagating ADR-073:78 without opening the two files it names, which is the P127 class recorded below.
3. **ADR-073's corrected model requires an RFC to exist before fix work starts**, and holds that an RFC is *stories in a user story map* (upstream ADR-060), **not a `Scope` prose blob**.

Against that text: the **timing here is conformant**. No fix work has been done. P122 is a Known Error with a settled Fix Strategy and this RFC precedes implementation, which is exactly RFC-first.

The **shape is not conformant**. This RFC is `Scope` prose with `stories: []`, because this repository has no story tier (no `docs/stories/`, no `docs/story-maps/`). That is a genuine deviation from a confirmed upstream decision, not a formatting choice.

The empty-stories half of that deviation, and the upstream ADR-089 requirement it breaks, are recorded once in local **ADR-045** (RFCs in this project carry no stories until a story tier exists) and are not re-argued here. ADR-045 was created on 2026-08-07 at Tom's direction, in preference to a `docs/rfcs/README.md` convention clause, precisely so this argument stops being re-derived per RFC.

What ADR-045 does **not** cover, and this section therefore still owns, is the ADR-073 **timing** question: whether this RFC exists at the right point in the flow. It does.

## Scope

Six items in dependency order. The three ADR amendments are **preconditions, not follow-ups**: `.claude/agents/wr-newsletter-editor.md:190` carries a hard rule that no further axes may be added without amending ADR-020 first.

**"Precondition" here means ratified, not committed.** Upstream ADR-073's Decision Outcome clause 3 and upstream ADR-074 (Confirm a decision's substance before building dependent work) both require an out-of-coverage choice to be human-ratified before implementation. Upstream ADR-060's I13 body says it directly for this exact shape: the orchestrator may author a story decomposition for a fix whose choices are already covered by existing ADRs, but an **uncovered** option-choice "escalates to a **new ADR ratified before implementation**", and the orchestrator does not pick it. P122's own Investigation Task 1 states the same thing in its own words: for a decision, "lands" means ratified, not committed. All three amendments carry genuinely new substance (four axis names, a new evidential/navigational seam, and a skip rule that changes what condition (c)'s counter means), so **items 4, 5 and 6 do not begin until items 1, 2 and 3 are ratified**, not merely architect-passed and committed. Building them earlier would stack unconfirmed decisions on unconfirmed decisions, which is the guard's case exactly.

Following upstream ADR-073:78's rationale, the three decision-file edits land as **separate architect-gate passes**, not one batch, to avoid the multi-decision-file edit deadlock. (ADR-073:78 prescribes separate passes for its own two lockstep amendments and states no general rule; the deadlock reasoning generalises, so the practice is adopted rather than cited as binding.)

### 1. ADR-020 amendment (own gate pass, then ratification)

Four new craft-axis names (`close-collects-the-so-what`, `signpost-promises-match-contents`, `item-placement`, `edition-internal-consistency`), folded into the verdict mechanic additively.

ADR-020 confirmation criterion 1 pins the craft vocabulary and states that "the agent file and SKILL.md step 15.25 parse block must move in lockstep." The enumeration lives at **ten normative on-disk surfaces**, all of which move in this change or the criterion is violated the moment the agent file changes. Line numbers are as at 2026-08-07; the three ADR-020 rows shift once the amendment inserts above them, which is why the amendment itself names those three by section instead:

| Surface | Line | What it carries |
|---|---|---|
| `docs/decisions/020-newsletter-editor-subagent.proposed.md` | 87 | Decision Outcome code block |
| `docs/decisions/020-newsletter-editor-subagent.proposed.md` | 118 | Prose enumeration inside `## Amendment 2026-06-17 (P081)` |
| `docs/decisions/020-newsletter-editor-subagent.proposed.md` | 184 | Criterion 1's own pin |
| `.claude/agents/wr-newsletter-editor.md` | 3 | Frontmatter `description` |
| `.claude/agents/wr-newsletter-editor.md` | 111 to 116 | Step 4.5 per-axis definition list |
| `.claude/agents/wr-newsletter-editor.md` | 161 | Output block |
| `.claude/agents/wr-newsletter-editor.md` | 190 | Hard rule |
| `.claude/skills/wr-newsletter/SKILL.md` | 774 | Step 15.25 narrative |
| `.claude/skills/wr-newsletter/SKILL.md` | 817 | Parse block |
| `.claude/skills/wr-newsletter/SKILL.md` | 1381 | Step 17 Tom-summary axis list |

The definition list at `:111` to `:116` (`:116` being `other`) is the most load-bearing of these: four new axes cannot land without per-axis definitions, and it is the surface most easily missed because it does not look like an enumeration.

**One surface deliberately does not move.** `docs/decisions/020-...md:140` names specific axes inside a historical evidence narrative: the Issue 16 record (published 2026-08-03) of three defects the editor named and the pipeline then discarded. It is a record of what happened, not a live enumeration. Editing it would falsify the evidence.

This takes the editor's pinned vocabulary from 5 craft plus 5 reader-experience axes to 9 plus 5. **Accepted trade, stated rather than slipped in**: ADR-035 exists because check accumulation was the failed path (38 numbered checks retired in favour of strengths-and-weaknesses prose). ADR-035's holding is narrow. It retires *numbered-check rubrics for the critic* on coverage-partitioning grounds, and an enumerated axis set inside a prose process is not that. ADR-020's own Bad consequence also makes tightening an existing gate the recommended path over standing up a new gate. The trade is nonetheless real, so the amendment carries a reassessment trigger on vocabulary size.

**P122's fifth assignment to this amendment is already discharged.** Its Fix Strategy section 6 lists a check (h) dependency answer alongside the four items above, left open at `122-...:162` as "an open question to settle when this is built". Check (h) has since landed: `scripts/check-newsletter-structure.sh:240-264` implements the provenance-line-before-first-item rule with an explicit fail branch when no `### Item ` heading exists. The amendment records the question as discharged by the check existing, rather than dropping it silently.

Two further corrections in the same amendment:

- **Criterion-4 false-positive note, placed inline at criterion 4 (`:202`) as a block quote, not only in the amendment section.** An axis that can never be remediated means the editor can never return PASS on an edition carrying one, which trips ADR-020 reassessment criterion 4 as a false positive, and its first remedy (recalibrating persona grounding; `:202` also offers relaxing the rule) would be the wrong fix. Amendment-only placement is what failed for the criterion-6 "ceiling" error: it entered via the 2026-06-17 amendment body and propagated into ADR-042 and then ADR-043 before ADR-044 corrected it, and the correction now sits inline at criterion 6 (`:206-208`) precisely because of that.
- **The `EDITORIAL_CRAFT` block's declared identity widens.** `.claude/agents/wr-newsletter-editor.md:210` declares the block "additive line-editor craft over the brief body," and the Step 4.5 boundary paragraph at `:118` is written entirely in passage-level terms. `item-placement` (item-run ordering, tier mis-assignment) is whole-edition structure, not line-editor craft. Folding it into the existing block is the right call on output-contract minimality: a second block would add a parse target, a save-block section and a Tom-summary line for no gain. (An earlier draft grounded this on ADR-020 reassessment criterion 2 keying on axis names. That criterion is a cross-gate editor-versus-sw-critic test and is indifferent to which block an editor axis lives in; the ADR-020 amendment carries the corrected ground.) But the block's self-description and the `:118` boundary paragraph must say the block now carries two passes' output, recorded as a decision rather than left as drift.

### 2. ADR-042 amendment (own gate pass, then ratification)

One line in ADR-042's boundary-partition list declaring the **evidential-versus-navigational seam** against the skeptic's promise-payoff axis. The skeptic's is evidential (is the named thing delivered as substance); the editor's `signpost-promises-match-contents` is navigational (does the label describe what physically follows). The contested case is P122 finding 2, a close that does not collect what the headline promised, which reads as either. The amendment argues it rather than assuming it.

### 3. ADR-043 sixth clause (own gate pass, then ratification)

Added to the **existing** `## Amendment 2026-08-07 (P121, P122)` section rather than opening a second dated section. Four grounds: the section title already names P122; clause 1 already names P122's sweep; the section's stated purpose is one section covering both tickets' changes to step 15.37 rather than two sequential patches on the same step; and clause 3 (precedence) interacts with the skip rule, since an all-stop-and-surface round is what the skip optimises for.

The rule: **skip the agent re-invocation when the artefact is byte-identical to the version the collected findings were taken against.** Named for byte-identity of the artefact, not for the paired shape, because P122 section 5 establishes that "skip the paired re-invocation" does not read onto step 15.57, which is single-contributor.

Two holes the clause must close:

- **Identity mechanism.** Re-read `artifact_path` and compare against the version step 15.37 item 1 pinned at collect. Default stated explicitly: when in doubt, re-run.
- **A skipped round IS consumed.** This is *not* purely additive to ADR-043 confirmation criterion 3 (`:177`), which pins the four section 15.6 conditions including "(c) the editor and skeptic counter does not reset". Resolving the second hole as "a declined paired look is consumed" changes what condition (c)'s counter means and therefore what condition (d) counts. The clause must say so in those terms ("condition (c)'s counter is consumed by a declined paired look; conditions (c) and (d) read that counter"), or a later compliance pass reads criterion 3's pin against a SKILL.md whose (c) means something else and cannot tell whether it was intended. That is the criterion-6 drift shape again, in the same corpus.

**Two corrections to the amendment section's own opening sentence (`:200`), both in one edit.** It reads: "Landed by ADR-044 (Cross-edition shape as a fresh-context subagent gate). ... **Amendment, not supersession**: the chosen option, the one-round cap, the skeptic reduce-only differential, the residual-advisory arm, the absent author-override arm and the four section-15.6 conditions all survive unchanged." Clause 6 falsifies **both** halves: it is landed by P122's own change, not by ADR-044, and it changes condition (c)'s counter semantics, so the four conditions do **not** all survive unchanged. Correcting only the provenance half would leave the amendment section contradicting its own clause. ADR-043's frontmatter `amended-by:` (`:12`, currently `[044-cross-edition-shape-as-a-fresh-context-subagent-gate]` alone) gains this change too.

The rule ships as a **cost-benefit judgement, not a correction**: two attempts to argue it wrong in principle failed, and P122 Fix Strategy section 5 records why, with the superseded drafting history parked under its own heading.

### 4. Editor agent Step 4.6

A third read of the same brief body as a whole-edition assembly pass, running after the Step 4.5 craft pass and feeding the existing `EDITORIAL_CRAFT` block, so the output contract grows by four axis names and nothing else. Carries the three boundary declarations from P122 Fix Strategy section 2 (`:138-142`) and the three exemption limbs from section 3 (`:146-156`), under the settled precedence: **wrongness outer, grain inner**.

### 5. Duplicate-citation detection in the structure lint

The deterministic half moves to `scripts/check-newsletter-structure.sh`; only the near-full-length duplication judgement stays with `edition-internal-consistency`.

**Correcting P122's premise at `:93`** (Investigation Tasks, "Finding 7 splits", not Fix Strategy section 4, which does not restate it). It states the lint "already extracts per-item markdown-link URLs for checks (a) and (b)." It does not. Check (a) tests link *presence* only (`has_link = (line ~ /\]\(/)` at `:146`, consumed at `:150` to `:151`). Check (b) matches outlet names and seven hard-coded domain regexes against whole lines (`:104`, via `low ~ doms[i]`). No URL is parsed out anywhere in the file. What genuinely exists and is reusable is the `### `-boundary item delimiting (`:145`), the per-item line buffering, and the flush-at-boundary pattern. The addition is still small, but it is a new extractor, not a reuse.

The lint has also grown three checks since P122's investigation, all in the file item 5 edits and none reflected in the ticket's description of it: (h) provenance line before the first item (`:240-264`), (i) the `**From Tom**` opener (`:266-275`), and (j) the CTA-is-a-question rule (`:277-298`).

The check carries a **pre-registered exemption set**, stated as a forward guard rather than as a live problem. Issue 16 was tested against the proposed rule (cross-section duplicate markdown-link URLs, keyed on `### `-delimited sections) and exhibits **none**: its only repeated link, the Reuters open-letter URL at `:97` and `:106`, sits twice inside `### Item 4`, and the `windyroad.com.au` closing line at `:168` is a bare domain, so there is no markdown-link URL to extract from it at all. The ADR-032 element-5 provenance line at `:45` and the CTA block at `:166-168` carry no markdown link at all. So no shipped edition exhibits a firing today, and an earlier draft's claim that the check would "fire on shipped editions" was unsupported.

**One boundary the rule must state explicitly**: whether the pre-first-heading region counts as a section. The published edition's From Tom opener (`:27-45`) carries four markdown links and sits before the first `### ` heading. None of the four repeats, so the Issue 16 result is unaffected either way, but the answer decides whether an opener link legitimately re-cited inside an item fires. The rule treats it as its own section, so such a re-citation does fire and is exempted by name if that turns out to be wanted.

The three anticipated shapes are pre-registered anyway, because each is legitimate if it arises: a repeated closing-line link, provenance or CTA surfaces that later gain links, and an item plus an Also-worth-noting entry deliberately citing the same primary source. Note that check (g) at `:236` is a CTA-composition check (P090) and confers **no** exemption a duplicate-URL check could inherit, so the set is declared from scratch. `check-newsletter-structure.test.mjs` gains a positive fixture (from `d2d674a`) and a **negative fixture drawn from a published edition**, the latter as a regression guard proving the rule stays quiet on real editions rather than as a claimed-live exemption.

### 6. SKILL.md wiring

Step 15.25's parse block and step 17's Tom-summary axis list, per the surface table in **item 1**.

Separately, and driven by **item 3** rather than item 1, the condition-(c) semantics change touches four SKILL.md surfaces that restate it: the section 15.6 row at `:1071`, the inner-loop exemption prose at `:1082`, and the two post-body-edit restatements at `:1017` and `:1045`.

## Compendium hygiene

`docs/decisions/README.md` must reflect all three amended ADRs. Regeneration is blocked by P087 (the upstream generator emits em-dashes that trip this repo's no-em-dash hook, which fired three times on 2026-08-07), so the three entries are **hand-edited in the same change** rather than deferred. That divergence is knowingly accepted under P087 and has on-disk precedent: ADR-044's own confirmation criterion accepts a hand-edited compendium entry with no em-dashes and a corrected count. Say so in the entries, because `docs/decisions/README.md:3` carries a generated "do NOT hand-edit" banner and the next reader will otherwise revert them.

ADR-032's entry already declares itself knowingly partial (`032-...md:150`), and `docs/decisions/032-newsletter-editorial-discipline-policy.proposed.md` is modified and uncommitted in the working tree. Resolve that state before layering further divergence on it.

## Stories

Empty, per local **ADR-045** (RFCs in this project carry no stories until a story tier exists). Standing up the tier remains queued for Tom.

## Commits

(rendered from `git log --grep "Refs: RFC-004"` by `/wr-itil:manage-rfc` and `wr-itil-reconcile-rfcs`.)

## Related

- **P122**: the driving problem. Its sections 1 to 6 carry the authored design this RFC records; do not re-derive it.
- **P121**: the sibling ticket. Checked as an alternative fix vehicle under the I13 existing-vehicle test and rejected, because no RFC on disk traces P121, so no vehicle exists to attach to. Recorded because ADR-043's amendment section already names P122 by name, which a later reader could mistake for evidence that a vehicle existed.
- **RFC-002**: built the ADR-043 remediation loop this RFC adds a contributor to. **Not** this RFC's fix vehicle. The I13 existing-vehicle test (whose branch vocabulary belongs to upstream **ADR-073** and upstream ADR-060's I13, **not** to upstream ADR-072, which records gate placement only and says so at its `:46-49`) asks whether the fix *is* that RFC's task set. RFC-002's `## Scope` is P120's loop construction, one of this RFC's six items touches it, P122 cites no RFC at all, and RFC-002's work has shipped (`e7d115c`, asserted by P122 and not independently verified here). The machinery-lineage reading ("RFC-002 built the loop, so extensions to it are RFC-002 work") is explicitly *not* the test used, because by that test every future ADR-043 amendment would belong to RFC-002, which is the upstream P371 pollution direction.
- **P127**: the unverified-claim family. Two instances are corrected in this RFC: the `:93` Investigation-Tasks premise about the lint (item 5), and an earlier draft's claim that upstream ADR-072 and ADR-060's I13 still carried the rejected auto-create stance (the deviation section above), which propagated ADR-073:78 without opening the two files it names.
