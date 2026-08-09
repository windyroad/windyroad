# Ask Hygiene: 2026-08-10 session retro

Second half of a continuous interactive session. Covers the changesets Node 24 bump, the RFC-006 ratification, both halves of the P143 smoke-test fix, ADR-050 and ADR-051 with their ratifications, the P146 production-artifact fix, and captures P143 through P150.

## Calls

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| 1 | Scope | **direction** | `Gap: genuine 3-option decision the framework cannot resolve, about to be built on (ADR-074 substance-confirm-before-build)` |

**Lazy count: 0**
**Direction count: 1**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

### The one call

Asked how wide to write the rule behind the P146 fix: production deploys bytes that provably correspond to the release commit (narrow), or bytes a gate actually tested (broad), or record nothing.

Classified **direction**, not lazy, and the ADR-074 exclusion is the reason rather than a convenience. The framework deliberately does not resolve this: the broad option would have been in violation the moment it was written, because accessibility runs against the master build and never against the build that ships, so choosing it committed to unscoped work. That is a value judgement about what to promise, not a mechanical application of an existing rule, and ADR-051 was about to be built on the answer.

The architect independently reached the same conclusion and said so explicitly, which is corroboration rather than proof, but it is worth recording that the ask was not my own framing alone.

## Decisions resolved without asking

Recorded because a lazy count of zero means little without what was decided unilaterally.

- **Fixing the smoke-test flake across three workflows rather than the one the ticket named.** The same no-retry shape existed in the production and preview pipelines too. Not asked, because leaving the production instance unfixed would have knowingly left the worst case in place, and the architect confirmed the wider scope was correct rather than merely defensible.

- **Not adding Dependabot while fixing the Node 24 deprecation.** Named as a remediation by the risk scorer and independently by the architect. Not done, because it creates a standing mechanism that opens PRs on an ongoing basis, which is beyond what was authorised. Recorded as an investigation task instead.

- **Every remediation the risk scorer named, applied or consciously declined.** Roughly fifteen across five assessments. The declines are recorded in the tickets with reasons, not silently dropped.

- **Amending an unpushed commit that carried two em-dashes.** A hook staged its own output, my Edit corrected only the worktree, and the commit took the staged blob. Not asked: unpushed, reversible, and leaving policy-violating content in history when it costs one amend is not a judgement call.

- **Not "correcting" P135's counts when the risk scorer said they were wrong.** Verified first; the scorer had missed two accepted ADRs. Acting on it would have put an error into a ticket about arithmetic.

- **Demoting four entries from the Critical Points roll-up.** Framework-resolved by the Step 1.5 signal scores, and each demotion was checked to confirm its source entry survives in a topic file first.

## One correction recorded against myself

An earlier turn ended with "Say the word and I'll ticket them" after surfacing two verified findings. Tom: *"I should[n't] have to ask."* That is a pitch, and capturing a finding is the repo's own mechanism for a finding, so it was never a permission surface. It evaded my own check because it was phrased as concern for scope rather than in any of the canonical pitch forms. The memory now records that the test is not the wording but whether the turn ends with the user owing a decision the framework already answers.
