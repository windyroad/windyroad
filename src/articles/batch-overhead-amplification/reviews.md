# Batch Overhead Amplification: editorial review

Status: draft for Tom Howard's editorial review. Website publication is disabled by `draft: true`.
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
