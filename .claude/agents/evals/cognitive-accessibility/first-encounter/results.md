# First-encounter comprehension evaluation — 2026-11-18

This is a behavioural evaluation of fresh reviewer responses, not a keyword test of the prompt. One guidance revision was evaluated. Earlier article reviews had passed the original chart; those historical passes are not a controlled baseline for this evaluation.

## Inputs and invocation

The exact guidance section is preserved in `review-guidance.md`. Cases `a.md` through `f.md` and the linked `a.svg` / `c.svg` preserve the reader-facing inputs. Case A reproduces the original opening and chart; C contains the corrected opening and chart. B, D, E and F are illustrative evaluation fixtures, not additional performance evidence for the article.

Three new agents received no conversation history, prior verdicts or expected answers. Each was told to read only the guide's First-encounter Comprehension section and assigned fixtures, including linked figures, and to report strengths, quoted weaknesses with missing meaning at first encounter, and PASS or WEAKNESSES_FOUND. Audience: software engineering leader with no implementation context. They were prohibited from reading other fixtures, source article, reviews or git history. Assignments: `/root/cold_eval_a`: A; `/root/cold_eval_b`: B then F; `/root/cold_eval_controls`: C then D then E. The agents inspected the SVG visible text and text alternative separately. These source-based evaluations do not establish visual rendering quality; Chrome verification is recorded in the article review receipt.

## Expected and observed outcomes

Expected outcomes were kept out of the reviewer prompts. The caller assessed responses semantically after completion; no substring scorer was used.

| Case | Expected behaviour | Observed |
| --- | --- | --- |
| A | Flag both unexplained chart labels at first encounter. | WEAKNESSES_FOUND: both labels and their missing referents/relationship identified. |
| B | Flag ordinary words that fail to explain two release-process variants. | WEAKNESSES_FOUND: both variants identified. |
| C | Accept the outcome-focused before/after opening. | PASS |
| D | Accept ordinary engineering vocabulary and a clear, insignificant timing difference. | PASS |
| E | Accept the same labels as A when their meaning is introduced before use. | PASS |
| F | Accept straightforward instructions with an isolated quantity. | PASS |

Six cases matched the intended behaviour. This is evidence for these cases, not a measured general reliability rate. No phrase blacklist was added to the critic. The examples were not revised in response to reviewer output.

## Reviewer responses

### A — original opening and figure

STRENGTHS

- The opening connects the change to a concrete user outcome: “account-list loading time” fell from “more than half a minute to a few seconds.”
- “Reconstructed the account history once, instead of starting again for every page” explains the main repair in understandable terms.
- The figure visibly identifies the measurement, seconds, common dataset and “Individual local synthetic runs.” Its numerical comparison is clear.

WEAKNESSES

- **The chart introduces implementation distinctions without explaining their relationship.** At first encounter, “Output reuse” does not explicitly identify the reused output or connect this bar to reconstructing history once. “Stored results limited” introduces a further change without explaining which results are retained, between what operations, or whether this is a later version of the same repair. A reader can compare the times but must guess what distinguishes the two repaired versions.

  Proportionate fix: label the second bar “History reconstructed once,” and visibly introduce the third with wording such as: “A later version also limited the results kept between pages.” The existing image alternative supplies some of this context, but does not explain the visible labels to a sighted reader.

VERDICT: **WEAKNESSES_FOUND**

Scope: this excerpt only. Inspected the SVG’s visible text and the image alternative separately.

### B — release process

STRENGTHS

- “The same twenty changes reached users sooner” establishes a consistent workload and a clear benefit.
- “Time to deliver the twenty changes” identifies what the timings measure, and “Before” provides a baseline.

WEAKNESSES

- “Checks combined” does not explain what was combined or how the release process changed. A reader must guess whether checks were grouped, shared between changes, or run together. Describe the concrete intervention beside the label.
- “Work limited” does not identify what was limited: simultaneous work, release size, or another quantity. State the actual restriction beside the label so readers can understand the comparison.

VERDICT: WEAKNESSES_FOUND

### F — import instructions

STRENGTHS

- “Upload a CSV file containing the transactions to import” states the action and purpose immediately.
- “Each row needs a date, amount and account number” gives concrete requirements before the reader acts.
- “The import shows its row number so you can correct it” explains how to locate and fix missing values.
- CSV, rows and account numbers are ordinary vocabulary for the intended reader.

WEAKNESSES

- None identified within this excerpt.

VERDICT: PASS

### C — revised opening and figure

STRENGTHS: “account-list loading time” identifies the user-visible operation; “more than half a minute to a few seconds” establishes the improvement immediately. The figure’s visible “Before optimisation” and “After optimisation” labels match the opening comparison. Its title, seconds axis, values, shared record count and “Individual local synthetic runs” qualification make the comparison understandable. The text alternative communicates the same result.

WEAKNESSES: None within this excerpt. Understanding the initial comparison does not require the repair’s implementation details. Figure labels inspected directly in the SVG source.

VERDICT: PASS

### D — API page sizes

STRENGTHS: “The API returns records in pages” introduces the comparison unit. “Pages of 50 and 200 records” specifies the changed setting, while the same query and record count establish a shared workload. “Both requests completed in about one second” and “no useful improvement” connect the evidence directly to the decision.

WEAKNESSES: None. The excerpt uses ordinary engineering vocabulary and supplies the meaning needed for its conclusion.

VERDICT: PASS

### E — labels with prior explanations

STRENGTHS: Both potentially opaque labels receive immediate explanations: “Output reuse” keeps calculated balances available, and “Stored results limited” adds a memory cap. “The app calculates them again when needed” explains the consequence of reaching that cap. The subsequent table reinforces meanings already introduced.

WEAKNESSES: None. Readers encounter each label’s concrete meaning before needing to interpret the comparison.

VERDICT: PASS

## Delayed-explanation continuation

After A's finding was recorded, the same reviewer received this next section, described as appearing after several intervening sections. This continuation tests reading order; it is not a new independent case.

> The later account-list test behind the opening result used 51,015 source records and produced 17,005 account updates. The HTTP route returned the account list after processing those updates in pages of 1,024. Each page restarted reconstruction from the beginning: 17 passes read 867,255 source records and took 35.5 seconds. The prototype reconstructed the history once and reused its outputs across successive pages. It read all 51,015 source records once, processed every account update and returned the expected balance and account details in 3.80 seconds. A subsequent version capped the amount of output retained between pages and completed the same test in 4.51 seconds.

The follow-up requested cumulative strengths, weaknesses and verdict; it supplied no expected answer.

### Continuation response

STRENGTHS

- The later section explains the repeated work concretely: 17 reconstruction passes read 867,255 source records.
- “Reconstructed the history once and reused its outputs across successive pages” connects the prototype’s behaviour to its improvement.
- “A subsequent version capped the amount of output retained between pages” explains the third bar’s relationship to the prototype.
- Processing every update and returning the expected account details establishes that the faster result still performed the required work.

WEAKNESSES

- The opening figure’s first-encounter obstacle remains: “Output reuse” and “Stored results limited” require readers to infer the variants before this explanation arrives. The later section resolves their meaning retrospectively, but several intervening sections separate it from the chart.
- Move a short explanation beside the opening figure, or replace its labels with descriptions grounded in the opening paragraph.

No additional comprehension obstacle found in the supplied later section.

Cumulative verdict: **WEAKNESSES_FOUND**.
