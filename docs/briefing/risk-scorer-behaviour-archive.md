## Risk Scorer Behaviour (archive)

> Rotated out of [`risk-scorer-behaviour.md`](risk-scorer-behaviour.md) on 2026-08-23 under the Tier 3 budget (5255 bytes against a 5120 ceiling). Both entries were first written 2026-08-08 and scored -2 this cycle. Still true; just not what a fresh session needs first.

- **When the scorer's own remediation would breach a decision, look for the third close rather than picking between "do it" and "accept it".** The P126 scorer offered two ways out of an above-appetite residual: add lint/test/build to push:watch (the option ADR-034 rejected on Tom's direct instruction) or record an acceptance (new direction, needing Tom). The close that worked was neither: shrink what push:watch is allowed to commit to the class that needs no execution, and hand the rest to the flow that already gates it. Residual went 6 to 3 with no decision reopened. The scorer's remediation list is a prompt, not an enumeration.
  <!-- signal-score: -2 | last-classified: 2026-08-23 | first-written: 2026-08-08 -->
- **`RISK_BYPASS: reducing` does not authorise committing above appetite.** The scorer emits it on any risk-reducing change, and it is tempting to read as a licence when a STOP is blocking a genuinely-improving fix. ADR-008 scopes it to bypassing back-pressure (a downstream queue gating an upstream action); `RISK-POLICY.md` § Action-Specific Risk says the 5-or-below appetite "applies uniformly to all pipeline actions". Verify the mechanism on disk before leaning on the token. (Cited by section rather than line number: the 2026-08-09 band amendment shifted the line, which is the drift P128 is about.)
  <!-- signal-score: -2 | last-classified: 2026-08-23 | first-written: 2026-08-08 -->

### Rotated 2026-08-23 (P145 iter)

One entry moved here to bring `risk-scorer-behaviour.md` back under the Tier 3 ceiling
after it gained two register entries. Not exercised in the P145 iteration; the subagent
errors that iteration hit were citation and version errors, covered elsewhere. Topic file
6009 bytes to 5061 as staged. Nothing was deleted.

- **A governance subagent can be wrong in its recommendation, not only in its citations, and the wrongness may only be visible by running the thing it would break.** On 2026-08-23 the architect recommended landing a decision record's forward `amends:` claim while holding its three reciprocal `amended-by:` lines, as a way to make progress without writing to ratified records. Reading `scripts/decisions-supersession.test.mjs` showed that shape ships a red test, and the architect withdrew the recommendation when told. Every citation in that verdict was real and every fact checked out; the reasoning built on them did not. So the verify-before-propagating discipline extends past artefact references: when a verdict recommends an action, check the enforcement that action has to satisfy before adopting it. Two reviewers openly disagreeing is a useful signal that the deciding fact has not been read yet. <!-- signal-score: 2 | last-classified: 2026-08-23 | first-written: 2026-08-23 -->
