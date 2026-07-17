## Finding-specific verification

- Reviewed commit: `4b48101ea57f074c14b1c4ab72c42d861c788e8c`.
- This review is non-isolated because I inspected the cross-role resolution log (`reviews/resolution.md:73-83`).
- No files were edited; the subscription runner was not invoked and no benchmark/model prompt was submitted.

METH-FB01 is resolved:

- The active manifest renames the audit and all three fields as sensitivity/rejection fractions, explicitly denying that they are operating characteristics, power, or assurance for the registered pooled bootstrap (`study.json:61-68`).
- The README gives the same single-system, normal-approximation qualification (`README.md:102`).
- The preregistration identifies the section as “Sampling and sensitivity diagnostics” and repeats both exclusions (`preregistration-v2.md:97-101`).
- The manuscript uses identical qualifications (`paper/paper.tex:253-261`).
- The focused test labels the active invocation a normal-approximation sensitivity audit and still reproduces `0.2577` (`design.test.mjs:39-44`). Under Node `20.19.0`, all 10 active tests passed; one legacy exhaustive test was skipped.
- The shared legacy simulator retains internal identifiers such as `primary_power` and `workflow_equivalence_assurance` (`design.mjs:328-333`), but no active report-facing artifact exposes them without the required qualification. This is not a new methods blocker.
- Neither the registered analysis nor its decision rules changed in this commit.

## Decision

`approve`
