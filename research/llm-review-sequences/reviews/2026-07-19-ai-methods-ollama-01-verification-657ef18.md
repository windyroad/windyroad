# AI-METHODS-01 finding-specific verification

## Exact commit

`657ef18eb36661b4ab4a71b3f422760d07358440`

Parent: `7937e1eb8cd11b386aa0a1fe419c560eeb45bb20`

The requested commit was clean `HEAD`. No files were edited, and no OSF, provider, subscription, or model call was made.

## Checks performed

- Inspected the complete parent-to-commit diff.
- Confirmed `git diff --check` passes.
- Parsed `study.json` successfully.
- Compared the archived methods report with the previously supplied standalone report.

## Prior minor finding disposition

Resolved.

`study.json:153-157` now machine-readably identifies only:

- `active_subscription_design`
- `exploratory_ollama_cloud_replication`

as authoritative current-design fields. It explicitly prohibits OSF exports, runners, or analysis from interpreting the following legacy API fields as active.

`README.md:23` repeats the same rule for human readers and tooling. This adequately resolves the risk that retained three-model, three-trial legacy fields could be mistaken for the active design.

## Archived report integrity

The archived file `reviews/2026-07-19-ai-methods-ollama-01-correction-7937e1e.md` preserves the standalone methods report body verbatim from its heading through its stable signature. No substantive finding, qualification, verdict, or evidence was altered.

The application-level memory-citation footer was not included in the research record; it was transport metadata rather than part of the methods report.

## New blockers

None.

This finding-specific verification does not alter the report’s existing activation restrictions or documented methodological limitations.

## Final verdict

**APPROVE WITH DOCUMENTED LIMITATIONS**

`AI-METHODS-01 | finding-specific verification | 2026-07-19 | 657ef18eb36661b4ab4a71b3f422760d07358440 | APPROVE WITH DOCUMENTED LIMITATIONS`
