---
status: "accepted"
date: 2026-08-10
human-oversight: confirmed
oversight-date: 2026-08-10
decision-makers: [Tom Howard]
consulted: []
informed: []
reassessment-date: 2026-11-10
related: [032-newsletter-editorial-discipline-policy, 039-per-date-subdir-layout-for-published-newsletter-editions, 044-cross-edition-shape-as-a-fresh-context-subagent-gate, 052-every-newsletter-reviewer-gate-blocks-publication]
---

# The Shift adopts an H2-rooted section outline from Issue 17, and the archive is left alone

> Captured via /wr-architect:capture-adr (foreground-lightweight aside-invocation per ADR-032). Section content was derived by the capturing agent from the in-session decision context; The chosen option was selected by Tom on 2026-08-10 from four options put to him with the architect's lean stated, and ratified by him the same day on the text as committed at e1d8900, including its correction of the false claim that the corpus was uniformly H3.

## Context and Problem Statement

Most editions of The Shift from Issue 1 to Issue 16 are built the same way: one H1 carrying the issue title, then H3 section headings for each item, the forward-deadline slot and the closing coda, with the author's opener as bold text rather than a heading at all.

**Most, not all, and the exceptions matter.** A count of the published corpus on 2026-08-10 found three editions that already break the pattern. 2026-04-17 carries four H2 headings alongside five H3s and 2026-04-24 carries five alongside six, so the earliest editions were mixed rather than uniformly H3. More pointedly, 2026-06-08 carries `## From Tom` and `## Also worth noting` as H2 headings, which is exactly the shape this decision adopts. That edition shipped, was read, and nobody recorded a problem with it.

This is worth stating because the argument used to refuse the accessibility finding, twice, was that sixteen editions of precedent stood against it. That argument was wrong twice over. It was not the real blocker, which was the lint. And the precedent it invoked does not exist in the uniform form it was claimed in: the corpus already contains the H2 section shape and already contains a From Tom heading. Nobody checked. The claim was asserted from an impression of the corpus rather than from a count of it, which is the same failure this project has recorded before as asserting project state without reading the files.

That outline has two defects and the cognitive-accessibility gate raised both. The document jumps from H1 to H3 with no H2 anywhere, which is a WCAG 1.3.1 and 2.4.10 failure and breaks heading navigation for anyone using assistive technology to move through the piece. And the opener, at roughly 420 words the single longest section in most editions, has no entry in the document outline at all, so a reader navigating by heading cannot reach it.

The findings were refused twice, and the reason recorded for refusing them was wrong both times. The first refusal cited sixteen editions of precedent. On checking, the actual blocker was the deterministic structure lint: `scripts/check-newsletter-structure.sh` matched section boundaries on the literal `^### ` in five places and hard-failed check (i) on anything other than the literal string `**From Tom**`. A conformance gate was being overruled by a tool this project owns, and the overruling was being reported as editorial judgement. Tom's instruction on learning that was direct: fix the lint.

The lint fix is settled and is not what this decision is about. Five matchers now accept `^###? `, so H2 and H3 both count as section boundaries while H4 and deeper deliberately still do not, and check (i) accepts either the bold form or a `## From Tom` heading. Sixty tests pass, including the corpus regression that walks all sixteen published editions. The comment now standing at the check (i) predicate records why the bold-only form was wrong: it was what stopped the cognitive-accessibility gate acting on a real WCAG 1.3.1 finding. That change is backward compatible by construction and needs no decision.

What needs a decision is the change that rode along with it. The draft template now specifies H2, which makes every future edition H2-rooted by construction and forks the corpus at Issue 17. That is not temporary, not local, and only half reversible: once Issue 18 ships, the fork is a fact. The cross-edition shape gate asked for it to be settled once for the series rather than refought every edition.

## Decision Drivers

- A conformance failure that a repository-owned tool is preventing anyone from fixing is a bug in the tool, not a standard to defend. The lint asserting H3 was the lint encoding an accident.
- Heading level costs nothing visually if H2 is styled the way H3 is now, so the reader-facing price is close to zero while the accessibility gain is real.
- The corpus has never nested headings. Items, the forward-deadline slot and the coda all sit at one level, so the old shape was flat and the new shape is flat. There is no relative hierarchy to lose, only a missing parent to supply.
- Published editions are a record of what readers actually received. Rewriting them to tidy an outline nobody is currently reading is a worse act than tolerating a visible seam.
- Leaving both forms permanently legal with no template position is how the `**From Tom**` opener lapsed for six weeks across the editions published 2026-06-08 to 2026-07-13 without anyone noticing. That is the corpus evidence ADR-044 already cites for why template invariants need an owner.

## Considered Options

1. **Adopt forward, leave the archive alone (chosen).** Template and all future editions are H2-rooted. Editions 1 to 16 keep H3 as shipped. The lint stays bilingual.
2. **Adopt forward and migrate the archive.** Rewrite the sixteen published briefs to H2 so the corpus is uniform, then drop the H3 arm of the lint after a deprecation window.
3. **Revert the template to H3 and treat Issue 17 as a one-off.** Keep the lint bilingual so the accessibility gate can raise the question case by case, and defer the series decision.
4. **No series decision.** Both forms legal indefinitely, template neutral, per-edition choice.

## Decision Outcome

Chosen option: **"Adopt forward, leave the archive alone"**.

The seam is legible rather than confusing. Editions 1 to 16 are H3-rooted and 17 onward are H2-rooted, which reads as a dated change of practice, because that is what it is. Set against that, option 2 means editing sixteen published artefacts for a benefit that accrues to nobody currently reading them.

Option 4 was rejected on the corpus evidence above. Option 3 was rejected because the accessibility finding will not change, so deferring only guarantees the same argument next week with the lint already fixed.

The corpus count also makes the choice easier than it looked. Issue 17 is not introducing an unprecedented shape; it is standardising one the publication has already shipped. 2026-06-08 is the worked example, and it is evidence that H2 sections and a From Tom heading render acceptably on the channel that matters.

Verified before choosing, and the verification is the reason option 2 is unnecessary rather than merely expensive: nothing in the site build reads `src/newsletters` as content. `src/lib/markdown.ts` is wired to `src/articles` only, the accessibility CI config tests five unrelated URLs, `next build` has no newsletter step, and a recursive search of `src/`, `scripts/`, the Next config and `package.json` returns only LinkedIn URLs in components and prose in READMEs. The published archive is described in its own README as a future surfacing, not a current one. No rendered page today mixes editions of both shapes.

## Consequences

### Good

- The document gains a valid outline: one H1, seven H2s, no skipped levels. The WCAG 1.3.1 and 2.4.10 failures are closed, verified by the cognitive-accessibility gate reading the lint and its tests rather than taking the claim on trust.
- The opener becomes a named landmark in the outline for the first time. This is the part of the change that does most for a reader navigating by heading, and it is separate from the level skip.
- The lint now tests what it means. It asserts that a section boundary exists, not which markup spells it, which is the right level of abstraction for a structural invariant.
- Per-item labels could become H3 later and give heading navigation a route into the inside of a long item. The level skip made that impossible; the door is now open, and this decision does not walk through it.

### Neutral

- The lint stays bilingual. It has to, because the corpus regression walks all sixteen H3 editions and those editions are not being migrated.

### Bad

- The corpus forks. The cross-edition shape gate reads the two most recent editions, so on Issue 18 it will read one H2 edition and one H3 edition and can legitimately report the difference. Heading level is therefore added by name to the shape agent's "what you do not own" list, in the same shape as the existing check (i) carve-out, or the gate refights this every week. Under ADR-052 that matters more than it used to: an unowned fork surfaces as a cleared deviation every single edition.
- H2 renders heavier than H3 in the LinkedIn newsletter editor, where the brief is actually pasted. Seven H2s in a row is a visibly louder page than seven H3s. No gate in this repository can see rendered output, so Issue 17 should be looked at in the editor before it goes out.

## Confirmation

- Check (i) in `scripts/check-newsletter-structure.sh` is tightened to accept the H2 heading form and the legacy bold form, and not the H3 heading form, so the template invariant has a deterministic owner rather than merely being permitted. Its current predicate accepts `##` and `###` alike, which pins nothing; ADR-044 reassessment criterion 3 holds that a convention cleared the same way every edition belongs in the template as an invariant, and a template invariant is out of the shape gate's scope by that agent's own non-ownership clause. Tightening the check is what makes the Issue 18 interaction above go away rather than recur.
- The lint passes on both an H2-rooted and a legacy H3-rooted brief, with negative cases for checks (c), (h), (i) and (k) on the H2 shape and a case asserting H4 is not treated as a section boundary. Present at `scripts/check-newsletter-structure.test.mjs`.
- The lint's existing corpus regression, which walks every published leader edition on disk and asserts check (k) does not fire, still passes unchanged. Note what that test does and does not cover: it guards duplicate-citation detection across section boundaries, which is the false-positive direction the matcher widening opens, and it is directory-driven so it grows with the archive. It is not a heading-level assertion.
- `draft-template.md` specifies `## From Tom` and `## Item N:`.
- Issues 17 and 18 both ship H2-rooted, and no published edition before Issue 17 is modified.
- A count of the published corpus, not an impression of it, is the basis for any future claim about what the archive does. The impression was wrong here.
- The shape agent's non-ownership list names heading level, so Issue 18's run does not report the fork as a fresh deviation.

## Reassessment Criteria

- Any surface is built that renders more than one edition into a single document: a combined archive page, an aggregated contents list, a year-in-review build. A mixed outline under one wrapper is genuinely broken, and at that point migrating the archive becomes the cheaper option.
- The rendered LinkedIn output is materially worse with H2, in which case the answer is styling or a return to H3, not a return to the level skip.
- The bilingual arm of the lint outlives its purpose, which happens only if the archive is ever migrated.
