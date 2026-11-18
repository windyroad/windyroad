# Batch Overhead Amplification: editorial review

Status: prepared for release preview. Production publication is held until Tom approves the release.
Review date: 2026-11-03.
Article SHA-256: `376e59388ebb975f89e9128e8bd89a750a347c502d58568fc2f6fb5ce2938858`.

These are independent agent assessments. The Reinertsen and Yip critics used those authors' published work as analytical lenses. They do not represent the people or imply endorsement.

## Iteration

Two substantive review rounds with the five requested critics. Round one led to clearer experimental provenance, table capacity labels, timing interpretation beside the table, precise holding-cost wording, explicit predictions and disconfirming outcomes, a rejection rule for regressions, a cursor definition, a tighter attribution section and an explicit diagnosis-versus-deployment outcome. All five critics passed round two. The final copy corrects one capital letter and separates two attribution paragraphs; final voice and content-risk gates reviewed those bytes.

## Cognitive accessibility critic

Verdict: PASS.
Strengths: page capacities, page counts and overlapping operations are explained together; definitions arrive before they are needed; instructions include counterevidence and regression handling.
Weaknesses: no material findings. Capitalisation and a paragraph break suggested in the final round are applied.
Scope: text comprehension, not a rendered assistive-technology audit.

## Reinertsen batch-economics critic

Verdict: PASS.
Strengths: separates diagnostic perturbation from the economical operating size; distinguishes transaction costs from holding costs; evaluates the complete system and each batching layer; credits the underlying thinking.
Weaknesses: no substantive issue remains. The article neither measures holding costs nor claims an economic optimum.
Source independently checked: Don Reinertsen, Iteration vs. Batch Size, January 2011.

## Yip learning-and-feedback critic

Verdict: PASS.
Strengths: expectations, intervention, observation and adjustment form a closed learning loop; representative regressions change the decision; source attribution matches the batch-size/transaction-cost mapping.
Weaknesses: no material findings after adding predictions and explicit rejection or revision of regressing candidates.
Source independently checked: Jason Yip, Agile as doctrine, slides 27 and 31-32, 2021.

## Performance optimisation critic

Verdict: PASS.
Strengths: identifies priming, fresh projections, individual instrumented readings and server scope; separates overlapping operations and local query counts from causal claims; distinguishes application pages from database transport batches; retains scale failures.
Weaknesses: historical readings do not establish variance. The article makes no stable speedup or current browser-performance claim.

## Technical writer critic

Verdict: PASS.
Strengths: concrete problem-first opening, assessable measurement provenance, useful method, clear diagnosis and rejected repair, concise attribution and ending.
Weaknesses: no material restructuring required. Final capitalisation and paragraph-break suggestions are applied.

## Independent voice and tone gate

VOICE_VERDICT: PASS.
Strengths: practitioner voice, concrete evidence, clear definitions, fair attribution, Australian spelling and no promotional closer.
Findings: no violations or guide gaps. No required edits.
Both the isolated checkout's voice guide and the original checkout's concurrent additions were considered.

## Independent content-risk gate

CONTENT_RISK_VERDICT: PASS.
Residual content risk: 3/25, impact 3 and likelihood 1.
Strengths: bounded historical claims, negative results retained, primary-source attribution verified, no confidential-information class matched, respectful framing and no novelty or endorsement claim.
Findings: no required fixes.
Public repository exposure was assessed separately from website draft exclusion.
Historical measurements were checked by the drafting agent against the original investigation record. The content-risk critic received those evidence details and independently checked the public attributions.

## Evidence and limits

The historical experiment used one process-priming reconstruction, one 1,024-event baseline and one 16-event diagnostic reconstruction, with unchanged follow-up reads. Complete primary timing samples were recovered from an otherwise incomplete diagnostic log. Missing key-service durations were not inferred. The article uses rounded readings and distinguishes the local query-plan evidence. No account identifiers, financial values or private-source links are reproduced.

Public sources:

- [Don Reinertsen: Iteration vs. Batch Size](https://www.leanproductflow.com/iteration-vs-batch-size/).
- [Jason Yip: Agile as doctrine, slide 32](https://www.slideshare.net/slideshow/frugagile-2021-agile-as-doctrine-and-thats-a-good-thing/250446669).
- [Eliyahu Goldratt: Standing on the shoulders of giants](https://doi.org/10.1590/S0104-530X2009000300002).

## Delivery validation

Validation results will be recorded separately from editorial verdicts. A dependency installation in this isolated clone failed with ENOSPC. That task-owned incomplete installation was stopped and removed. No package manifests or lockfiles were changed. A local build has not passed. Frontmatter, draft flag, title length, whitespace and no-em-dash checks passed. The delivery prerequisite `npx --no-install dry-aged-deps --check` exits 1 because the package is not installed. The standard push wrapper is held because it can update and auto-commit dependencies before checking the installed tree; direct push would bypass that gate.

## Figure review (2026-11-04)

Added a zero-based rebuild timing chart and a schematic of the existing reader and cursor prototype. Both figures rendered in Quick Look. The Markdown image descriptions, asset paths and SVG structure were checked. Voice and content risk reviews passed for the revised draft and figures.

Revised article SHA-256 `d86af25ee8498737d3678da7f77ef947a907391c0efcfbe0fa6c75d2ebe3a62d`. The digest above records the earlier editorial review.

## Title and attribution review (2026-11-04)

The title names the diagnostic. The subtitle describes the worked example, and the opening credits Jason Yip for the batch-size analogy. Independent voice and content risk reviews passed.

Revised article SHA-256 `16b6668edbff7ac12514fdb53ae22941ff74a83e1cef35c2b2c91e24ffbce45a`.

## Event sourcing introduction and follow-up review

The opening introduces event sourcing and defines replay before explaining the diagnostic. The 469-event example leads into a 50,000-event follow-up with paired median timings at both page sizes. The chart rendered locally and agrees with the table and alt text. Independent voice and content risk reviews passed.

Revised article SHA-256 `beb12f60e6cfd16a5a3282622ac06c4c8355b79819e24089fabd1d8dac89880e`.

## Subtitle review

The subtitle names performance bottlenecks and uses event sourcing directly. Voice review passed.

Revised article SHA-256 `c59305ffc083edce2fac7680591d030cba75f87203a8ccaa58631cdaf318c982`.

## Opening cost distinction

The opening names per-event processing and per-page setup before introducing Yip’s analogy. Voice review passed.

Revised article SHA-256 `b47ce530e1a2ec3d0169a6e36c3026a67534e8a883711f95317083dc700d7e2d`.

## Team voice review

The revised copy describes the experiments directly in team voice. Voice review passed.

Revised article SHA-256 `468dcb333a9ece7af02cdadc980d704e30d4b161977d662736cccceba8e58cec`.

## Diagnostic framing review

The introduction leads with the rebuild problem and identifies what the smaller pages helped diagnose. Voice review flagged a structural preview, which was replaced with a direct description of the method.

Revised article SHA-256 `6d57bf0e6918c9ba8a3c00b7b10547369bb3e40b7f99563c1efe954fe68489cd`.

## Opening context and throughput

The opening explains the balance display, fresh state reconstruction and server timing scope. Throughput is calculated from the same 469 events and full rebuild durations.

Revised article SHA-256 `a5cc8143ec3330a931d3eb5b095f9ddaa74a48df519944d619592992e75f3904`.

## Opening context review

The opening establishes the event sourcing performance problem before introducing the banking app as the worked example. Architecture and JTBD reviews passed.

Revised article SHA-256 `5f7a006ff39c3d1c87c094d80ce3ef58ea2cd32c685b633ed5094629a52bacac`.

## Independent introduction editing

The first cold reader requested a concrete hook, page limits alongside timings, and separation of the local database investigation from the server benchmark. The revision addresses all three. A fresh editor passed the second round with no material changes requested.

Revised article SHA-256 `0b070ff3ace36dcfb1ac305717d9cbbbb7cc151bd48ea023600b597ea93f2915`.

## Replay wording review

Two fresh editors reviewed successive revisions. The final editor confirmed that replay reads naturally as part of the timed rebuild and that the diagnostic hook is clear.

Revised article SHA-256 `5eb7a0ae11669612c7d41db760f7228b22704dcfa8dd708067d879daf79dddde`.

## Analogy attribution

The introduction credits Taiichi Ohno for the analogy. The prior-art discussion credits Jason Yip for applying it to batch size and transaction costs. Architecture and JTBD reviews passed.

Revised article SHA-256 `5216528875bd29d1c6b9129b5ae14755417fbe4d4180a32a62d2810826b650d0`.

## Opening chart placement

The 469-event rebuild chart follows the opening results paragraph. The detailed measurements remain in the worked example. Architecture and JTBD reviews passed.

Revised article SHA-256 `57f42bba3cdcff24f8d1a756d78d7ab7fcad1b5473aaaaaf2de62c94d9e3e8d9`.

## Article subtitle

Moved the existing subtitle into frontmatter for display beneath the title.

Revised article SHA-256 `db8ae895b689345c5440ae42891a11956284669b25d4cc2ecef34da05bc88d47`.

## Body rewrite and independent review (2026-11-04)

Rebuilt the body around the investigation's decisions while preserving the approved opening, descriptive MathML and three figures. Measurements now explain why key retrieval and query work became investigation targets, why the cursor prototype was rejected after larger-workload failures, and why the later context-reuse change was retained. The follow-up explains ownership, immutable context identity, parser-equivalent representation and conservative fallback. The closing method follows directly from those examples.

The original follow-up record and retained implementation were re-read for this revision. The 50,000-event workload comprised two synthetic 25,000-event histories. Twelve alternating-order pairs were measured at each page size. The article retains separate median elapsed times and reports the faster-pair counts without confusing the difference between medians with the median paired difference. All 48 reconstructions passed complete-output and progress checks. Those historical checks were not rerun for this article.

Fresh independent reviewers passed the body:

- Technical article editor: reasoning, substance and progression.
- Performance optimisation critic: causal claims, source fidelity and measurement scope.
- Cognitive-accessibility critic: experiment distinctions, terminology and structure.
- Reinertsen perspective: diagnostic size versus operating batch economics.
- Yip perspective: small-batch learning, attribution and the stable-counter example.

These were independent reviews through the requested perspectives, not reviews or endorsements by Reinertsen or Yip. Final voice review passed. Final content-risk review passed at 3/25, including public repository exposure separately from website draft exclusion. No account identifiers or private-source links are included.

Chrome displayed the revised body and all three SVGs loaded. The page had no horizontal document overflow at the inspected desktop width. Heading, table, link and alternative-text checks passed. The production build passed in the local preview checkout, and the draft article was absent from the exported routes. No new assistive-technology conformance claim is made. This supersedes the earlier note that no local build had passed.

Reviewed article SHA-256: `d30d57c4604f49c06169e6c01476016c01d8ca98065c88dea46790db8f2e3dc9`.

Delivery check: an isolated checkout based on current remote trunk also passed the production build and application/library lint under Node 24.22.1. The required dependency check failed on existing freshness and vulnerability findings. No dependency files were changed and no push was attempted. The article remains excluded from the production export.


## Later performance results (2026-11-13)

Added the recorded follow-up after context reuse: further transaction-cost simplification, application page tuning to 64 events, and browser REST-page comparisons at 256, 512, 1,024 and 2,048 events. The table separates complete replay time from the median longest main-thread pause. The ending now reports Tom's direct observation of substantially faster production account loading. No production speedup percentage is inferred from synthetic timings.

The existing benchmark records were used as requested; no performance experiments were rerun. The approved opening, formula, three figures and draft flag are unchanged. The final method now explicitly chooses operating sizes after reducing overhead.

Architecture and JTBD reviews passed before editing. The independent technical/performance editor passed and clarified the 1,024-event comparison baseline. Final voice and content-risk reviews passed. Chrome displayed the new server results, all four browser rows and the production observation correctly. The local preview is running using Next.js's supported Webpack option after its Turbopack font loader failed; no site configuration was changed.

Reviewed article SHA-256: `52ec37e21ddf16a15572e4a068ccba2b89e6d5251124ea0be2794cc4e8069b20`.

## Release-preview preparation (2026-11-15)

Tom requested a phone-accessible release preview with the production release held. The article is now eligible for the static build; publication remains controlled by the unmerged release PR into `publish`. Article prose is unchanged. The approved subtitle, linked tags and formula presentation accompany the preview.

Article SHA-256: `feaf9dcb9a37bedf7658f13a306c0751883a8ef4966a525e9ec9912fd0749159`. Historical reviews above retain their original scope and digests.

## General applicability correction (2026-11-15)

Removed the event-sourcing restriction from the subtitle. A short bridge explains how the diagnostic applies to batched database reads, API requests, imports and message processing; the closing method now uses general batch terminology. The banking investigation remains the worked example. Its approved opening, measurements, figures, formula and attribution are unchanged; the formula's lead now explicitly scopes it to the example.

Architecture and JTBD reviews passed before editing. Voice review passed the exact proposed copy. A scoped accessibility review passed comprehension and heading/link clarity. The independent content-risk review passed all five axes: factual, reputational, claims, attribution and reader-respect. The broader examples make no additional benchmark claims.

The static build passed, and the exported HTML contains the revised subtitle, applicability paragraph and closing heading. The pipeline assessment scored commit, push and release-preview risk at 5/25, within the current policy. Production publication remains held. Historical review receipts above retain their original scope.

Reviewed article SHA-256: `12db6d7c461c5b70dea7b3f7b6ee9d7a74c8bedda93e790aedbd5532cf179847`.

## Release-process scope and critic iteration (2026-11-16)

Tom requested software release processes as an explicit application, then added cold-read and Pascal-inspired brevity critics to the cognitive accessibility, Reinertsen perspective, Yip perspective, performance and technical-writing reviews. The perspective reviews do not imply review or endorsement by Reinertsen, Yip or Pascal.

The first round identified a misclassification of per-event construction as transaction overhead, missing release waiting/feedback costs, an insufficiently scoped page-size approximation, ambiguous stable-counter guidance and avoidable repetition. The revision resolves those issues, distinguishes the separate batching layers and experiments, and makes clear that the observed operating settings were not established optima. The context-reuse implementation is condensed to its mechanism, safety conditions and results.

All seven final critics returned READY. The second cold reader and brevity critic were new agents without conversation or review history. Their remaining suggestions were optional; the unexplained identity-hashing aside was removed. The approved opening, throughput grounding, all three figures, meaningful numerical results, failed cursor trials and requested production observation remain. Duplicate table rows and repeated conclusions were removed. Word count fell from 2,187 in the first review draft to 1,714.

Architecture and JTBD reviews passed the editorial scope before revision. Final voice and scoped source-accessibility reviews passed the exact article below. An independent content-risk review passed all five axes (factual, reputational, claims, attribution and reader-respect), and pipeline risk scored 5/25 for commit, push and preview delivery. The static build passed. Historical receipts retain their original scope; production publication remains held.

Reviewed article SHA-256: `d070003b6dad188b7ae770327a95e7959fdbedee7fa2621fe7f30066487ad6bf`.

## Ohno and Yip attribution clarification (2026-11-16)

Replaced the repeated water-and-rocks explanation with an explicit statement that Yip applies Ohno's analogy to batch size and transaction costs. The opening Ohno attribution, existing source links and established-idea framing remain unchanged. Yip's slide 32 was checked directly.

Architecture, JTBD, exact-sentence voice and scoped accessibility reviews passed. A fresh cold reader found the contributions clearly distinguished and no material attribution or concision issue. Independent content-risk review passed all five axes; pipeline risk was 5/25 for commit, push and preview delivery. The static build passed. This is a one-sentence correction; earlier full-article reviews retain their scope and production remains held.

Reviewed article SHA-256: `f330adc89d75ecd7d40dbd178fd3419a4b05424986295404ca6fe0db026ab5f6`.

## Remove redundant attribution (2026-11-17)

Removed the Jason Yip sentence at Tom's request. The earlier Ohno attribution and the Goldratt setup-cost example remain; no new historical claim is introduced. Architecture, JTBD and exact-deletion voice reviews passed. Independent content-risk review passed all five axes for the bounded deletion. The static build passed, and the exported article retains Ohno and Goldratt without the removed sentence. Historical reviews retain their original scope; production publication remains held.

Reviewed article SHA-256: `d86e23e7b32d12c6e13d19ace2feb2b0d81a85285329abb13284affd9b92c8ee`.

## Lead with the matched performance result (2026-11-18)

The opening now leads with the later account-list improvement, then returns to the 469-event diagnostic. A new section explains the matched comparison: the same 51,015 source records and HTTP route took 35,469.160333 ms before output reuse and 3,804.494083 ms afterwards. Repeated reconstruction read 867,255 records across 17 passes; the prototype read the source once. The subsequent version with an encoded-output retention cap took 4,510.555625 ms. These were individual local synthetic runs of a proposed repair, not a production speedup measurement. The earlier production observation retains its separate scope.

Architecture and JTBD edit reviews passed before editing. The independent performance critic checked the three recorded runs and test construction, including complete output and account-result assertions. Exact-copy voice review, a fresh introduction editor and the scoped cognitive-accessibility review passed. The stale reference to the opening example in the formula qualification now names the 469-event diagnostic. No benchmark was rerun.

Independent content-risk verdict: factual=low, reputational=low, claims=low, attribution=low, reader-respect=low; PASS with no flags. The static build passed on the supported retry after Next.js displayed a dependency security advisory. The exported HTML contains the new opening and follow-up. No dependency or build-policy change was made as part of this editorial revision. Historical reviews retain their original scope; production publication remains held.

Reviewed article SHA-256: `9cdfb4c96120ec249310e10b6da69020811ddae7b0ee32d93482f358edd2d54b`.

## Numerical comprehension and visual comparisons (2026-11-18)

The updated cognitive-accessibility critic identified two material comprehension defects: the numerical opening left readers to calculate the benefit, and the browser table required comparison across two units and four settings. The revision adds an adjacent, proportional account-list chart and separate aligned browser panels. The opening states the practical benefit; throughput moves to the detailed account-list example. The capped-output version remains visible beside the first prototype. All four browser settings, the complete table and the adopted setting remain explicit.

The cognitive, cold-read, Pascal-inspired brevity, Reinertsen-perspective, Yip-perspective, performance and technical-writing critics all returned READY after revision. The final cold reader and brevity reviewer were fresh agents. These perspectives do not imply endorsement by the named people. Optional suggestions to remove throughput and the production observation were not applied because Tom requested both. The 469-event example, failed cursor experiment, formula, general release-process applicability and attribution remain intact.

Architecture and JTBD pre-edit reviews passed, including a style-guide clarification documenting the existing standalone SVG palette. Final voice, style and scoped accessibility reviews passed. Independent content-risk review passed all five axes: factual, reputational, claims, attribution and reader-respect. No benchmark was rerun.

Chrome showed the revised article at desktop width and at 390 by 844 pixels. All five figures loaded; the mobile document and viewport were both 390 pixels wide. Direct labels and both comparison panels were readable. The static build passed on the supported retry after the existing Next.js dependency advisory; the export contains the revised opening and both new assets. No dependency or gate changes were made. No assistive-technology or whole-page WCAG conformance claim is made. Production publication remains held.

Reviewed article SHA-256: `bd709ab03b84d3ad8b6ac3ece8ced21a338fc647e4acdaa0839c65c6c7d95afd`.

Account-list SVG SHA-256: `c9abbfc8ac9fc11e755d6f42dc58926d66edd549f15a100cf7ffc1c84b23f640`.

Browser SVG SHA-256: `a3bc777ced8d264ca59206e4960a1451d24f028ae76ee43eb3b4f5fe0ff1d555`.

## First-encounter clarity correction (2026-11-18)

Tom identified two opening-chart labels that the previous cold reviews had missed: “Output reuse” and “Stored results limited”. Those passes did not establish that the visible labels made sense before the later implementation explanation. The cognitive-accessibility guide now requires first-encounter reading across prose and figures, distinguishes visible labels from unseen alt text, and preserves early findings when explanations arrive later. AGENTS.md routes fresh cold readers to that guidance.

Blind behavioural evaluation on six excerpts found the original label defect and an analogous release-process defect, while accepting four clear controls, including the same labels after prior explanation. A continuation with the later mechanism explanation preserved the original finding. Inputs, guidance and reviewer responses are recorded in `.claude/agents/evals/cognitive-accessibility/first-encounter/results.md`. This demonstrates the exercised cases, not universal reviewer reliability.

The opening now states the benefit without the premature reconstruction explanation. Its chart compares “Before optimisation” and “After optimisation” using the same 35.5-second and 3.80-second measurements. The subsequent 4.51-second version remains in the detailed section where its change is explained. A fresh cold reader passed the corrected excerpt. Architecture, JTBD, exact-copy voice, style and scoped accessibility reviews passed.

The static build passed on the supported retry after the existing Next.js advisory. Chrome showed the revised figure at desktop width and 390 by 844 pixels; all five figures loaded and the mobile document had no horizontal overflow. No benchmark was rerun and no whole-page or assistive-technology conformance is claimed. Production publication remains held.

Reviewed article SHA-256: `a993b149110295130c92a34fc052863d9058ef787d1335a8bbac707794322221`.

Account-list SVG SHA-256: `69a1e31684d355c250baf7b98956a3519b99c2aa97d61c8850322a431426ba67`.

Cognitive-accessibility guide SHA-256: `d6abc33957bb274764f30265ed28bb8be3775254dbe754decce41a9b39f1c9ef`.

## Lead with the measured benefit (2026-11-18)

Tom asked for the opening to sell the observed benefit and diagnostic approach. It now states the almost 90% reduction in loading time, from 35.5 seconds to 3.80 seconds, then explains that deliberately shrinking batches made the overhead stand out. The chart repeats the benefit. The detailed results retain the individual local synthetic test conditions, the measurement's deployment status and the later 4.51-second result. The underlying observations and comparison are unchanged.

Architecture, JTBD, exact-copy voice and style reviews passed before editing. A fresh cold reader, given only the opening and first figure plus the repository's comprehension guidance, passed the revised excerpt: the outcome is immediate, the diagnostic provides a reason to continue, and the proportional chart makes the scale visible. That verdict is scoped to comprehension and does not independently substantiate the measurements.

The static build passed on the supported retry after the existing Next.js advisory. The SVG was rendered and visually inspected; the replacement line fits without changing fonts, colours, spacing or bar geometry. No benchmark was rerun. Production publication remains held.

Reviewed article SHA-256: `b2da32b8053db5cfb9a6a908d5d47c754b1eeb68c23b36bee7a6fbfdbe53dac7`.

Account-list SVG SHA-256: `3eaf6f411162b52f95f5f410f4cd0df6c2946be75e4aa75bb4ba47b23306a311`.

## Introduce the optimisation approach before the example (2026-11-19)

Tom requested an introduction to batch overhead optimisation immediately after the benefit chart. The new section defines batch overhead, explains how deliberately smaller batches expose it, distinguishes diagnostic and operating sizes, and establishes applications including software release processes. The banking example follows under its own heading, with events and pages introduced before the 469-event measurements. The benefit-led opening, all measured values, figures and Ohno attribution are preserved.

Architecture, JTBD and exact-copy voice reviews passed before editing. Independent technical/brevity and scoped accessibility reviews passed the final source. An initial cold reviewer reported reading ahead before figure inspection; that verdict was excluded from the cold-read gate. A replacement fresh reviewer read only lines 1–12 and the first figure, then 14–20, then 22–30 and the second figure, recording findings before each next block; it finished with lines 32–50. Its scoped verdict was PASS with no material comprehension weaknesses.

The static build passed on the supported unchanged retry after the existing Next.js advisory, and the whitespace check passed. No benchmark was rerun. Production publication remains held.

Reviewed article SHA-256: `f56b62153874d1ce6c1729ae0f5c12f05e8a1233b08236c7923eb56d873aa677`.

## Keep the concept together and restore editorial review (2026-11-19)

Tom identified the Ohno attribution as disconnected from the technique introduction and the applicability list as sounding exhaustive. The attribution now sits beside the definition, with its comparison expressed in general batch terms. Applicability states the relevant condition before explicitly illustrative examples. All measurements and figures are unchanged.

The previous revision's scoped comprehension and technical reviews did not provide a whole-article editorial verdict. The drafter also told a pre-edit reviewer to preserve the attribution's existing position. Those choices constrained the review around the draft's structure. AGENTS.md now explicitly routes conceptual and structural revisions through the existing editorial critic as well as the separate cold reader. Its owned rubric asks for whole-argument cohesion, useful placement of sources and clear scope; it adds no new critic or numbered checklist.

The behavioural check used fresh sessions without the conversation, complaints, intended fixes or prior verdicts:

- `structure_probe_a_1911` reviewed the original article from commit `8869ea860c4fcf5245b109c98c86cb48ab40a6d1`, SHA-256 `f56b62153874d1ce6c1729ae0f5c12f05e8a1233b08236c7923eb56d873aa677`, with the revised rubric and unchanged linked figures. Verdict: WEAKNESSES_FOUND. It explicitly found that the Ohno paragraph interrupted the reader's question about the slower 469-event rebuild. It also questioned the separated Goldratt/operating-size discussion, delayed headline experiment qualifications and missing pull quote. It did not flag the original applicability list.
- `structure_editor_b_1911` independently reviewed the corrected article, SHA-256 `de037864cf0e7f3485c89e16a952823bdb4655575e0728110c05b008e7434931`. It recognised the definition and conditional applicability as coherent and the examples as non-exhaustive. Verdict: WEAKNESSES_FOUND for three other concerns: unclear status of the 64-event operating choice, the detached production observation, and the missing early pull quote.
- The operating choice now reads as a working setting with inconclusive timing evidence. The unchanged production observation accompanies retained server optimisation, separately from the later undeployed prototype. The pull quote remains omitted for a genre-specific reason: the opening benefit chart and immediately following method definition already provide emphasis, and another callout would interrupt that short transition.
- Fresh round-two reviewer `structure_editor_final_1911` read the full revised article and figures, with the previous weaknesses and remediation notes allowed by the existing critic contract. Verdict: PASS, no weaknesses or overrides. It accepted the operating-choice clarification, production-observation placement and reason for omitting the pull quote.

These are observed reviewer judgements, not a controlled comparison with the old rubric or proof of universal detection. In particular, the original-list omission remains part of the evaluation record rather than being claimed as a detected defect.

Architecture, JTBD and exact-copy voice reviews passed. Fresh content-risk review passed all five axes. The separate fresh cold reader recorded findings in order for lines 1–50 and the first two figures and passed comprehension; it inspected visible SVG text and geometry, not rendered layout. Its optional suggestion to remove the throughput figures was not applied because Tom requested them. The later editorial refinement leaves this opening excerpt unchanged.

The final static build passed on the supported unchanged retry after the existing Next.js advisory; the whitespace check passed. No benchmark was rerun and no dependency or build-policy change was made. Production publication remains held.

Reviewed article SHA-256: `ba0190765c774e223cdb8f605610160b5b0dc56599bb809607451f10ee6309f4`.

Editorial rubric SHA-256: `8dc336662d8a2d8f19ecb817ee38d32b3594c5cb09ba2133f24d7e298e9f7e26`.
