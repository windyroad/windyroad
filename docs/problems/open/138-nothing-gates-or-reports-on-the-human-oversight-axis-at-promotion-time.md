# Problem 138: Nothing gates or reports on the human-oversight axis at promotion time, so an ADR can reach accepted without ever having been read

**Status**: Open
**Reported**: 2026-08-09
**Priority**: 4 (Low), Impact: 2 x Likelihood: 2, derived at capture from the description. Impact is 2 because an unread record reaching `accepted` misdirects agent and human reasoning about what has been decided, but it cannot produce a wrong gate verdict: no enforcing hook reads `human-oversight`, and the same Minor band P128 uses for stale governance prose applies here. Likelihood is 2 rather than 4: the trigger needs an ADR to ship with `human-oversight: unconfirmed` AND then sit unratified through a release plus the promotion window, and in the whole corpus that has happened once, on ADR-049, which was drained by hand within two days. It is not 1 because the corpus has now demonstrated the shape once and nothing prevents a second.
**Origin**: internal
**Effort**: S. The decision is Tom's and is one ADR. Option A is a condition in an existing loop, option B is a small report over frontmatter, option C is no code at all.
**WSJF**: 4.0 = (4 x 1.0) / 1

## Description

`status` and `human-oversight` are independent axes, and nothing joins them at the point where an ADR gains authority.

Verified on disk rather than taken from prose:

- `scripts/post-release.d/stamp-and-promote-decisions.sh` is 122 lines and contains no reference to `human-oversight` anywhere. Pass 1 stamps `first-released` on a proposed decision included in a release. Pass 2 promotes to `accepted` when that stamp is older than `DECISION_PROMOTION_DAYS` (default 14). Age is the only condition.
- ADR-005 (`docs/decisions/005-automated-decision-promotion-via-first-released.accepted.md`) defines that lifecycle and names no oversight condition, not in its Decision Outcome and not in any of its five Confirmation criteria. So the script is not diverging from its decision; the decision never carried the condition.

The consequence is that a record no human has read can reach `status: accepted` purely by surviving fourteen days. A reader meeting `accepted` reasonably takes it as settled.

**What is missing is a roll-up, not a report.** Be precise here, because the imprecise version scopes option B against a surface that already partly exists. The axis IS reported per entry: `docs/decisions/README.md` renders `**Oversight:** <value>` on every in-force and historical entry, and it is the surface the architect agent is documented to read first. What nothing does is aggregate, so no one can ask "which accepted ADRs are unratified?" and get an answer without reading 49 entries. And nothing joins the axis to the promotion event, which is the moment authority is conferred.

This is written up as an open question, not as a defect with a known fix. **The framing matters and should not be collapsed**: calling this "the real defect" would pre-empt a live option.

## Three options, none picked

**A. Hold promotion while unratified.** Pass 2 gains a condition: do not promote a decision carrying `human-oversight: unconfirmed`, regardless of age. Makes `accepted` mean read-and-accepted. Costs: an unratified record sits at `proposed` indefinitely and the backlog is invisible unless something surfaces it, so A arguably needs B's reporting surface anyway.

**B. Promote on age as now, but add a surface reporting which accepted ADRs are unratified.** Keeps the two axes independent and makes the gap legible instead of closing it. Costs: `accepted` still does not imply read, so the reporting surface has to be consulted rather than encountered.

**C. Do nothing, because the two axes are independent by design and this is a documented property rather than a bug.** `status` records where a decision sits in its release lifecycle; `human-oversight` records whether a human read it. Collapsing them loses information. **Option C is genuinely live**, and ADR-049's own ratification blockquote asserts its premise in exactly those terms: the two axes are independent and an ADR can read `accepted` while unratified.

**Resolution is Tom's**, and it belongs in its own ADR rather than an amendment section on ADR-005. Readers read the main decision and miss amendment sections, and A and B both change governance behaviour rather than clarifying ADR-005's existing text.

## Symptoms

An ADR carrying `human-oversight: unconfirmed` is included in a release, sits fourteen days, and is renamed to `*.accepted.md` with `status: "accepted"`. A later reader, human or agent, treats it as a settled decision. Nothing in the record, the compendium, or the promotion output says it was never read.

## Workaround

Drain the oversight axis in the same session an unratified ADR lands, via `/wr-architect:review-decisions`. That is what happened with ADR-049 and it is why live exposure is currently zero.

## Impact Assessment

- **Who is affected**: any reader or agent reasoning about what has been decided from an ADR's `status` field; and Tom, whose ratification marker is the thing being hollowed out.
- **Frequency**: once observed. ADR-049 was the first ADR in this repo to carry `human-oversight: unconfirmed`, and it was drained by hand on 2026-08-09 before any promotion window elapsed.
- **Severity**: no gate verdict can be wrong from this, since no enforcing hook reads `human-oversight`. The cost is a record acquiring the appearance of authority it was never granted.
- **Analytics**: none.

## Live exposure is currently zero

Swept at capture: no ADR on disk carries `human-oversight: unconfirmed`. ADR-049 was the only one and was ratified on 2026-08-09. ADR-049 also carries no `first-released` field, so the promotion hook could not have acted on it at the next release regardless. **This is a latent gap, not a live hazard**, and the Low severity reflects that rather than reflecting a judgement that the question is unimportant.

## Root Cause Analysis

### Investigation Tasks

- [ ] Tom picks A, B, or C. Nothing else here is an agent's call.
- [ ] Record the pick in its own ADR, not as an ADR-005 amendment section.
- [ ] If A or B: note that the fix site is the release path (`scripts/post-release.d/`), which P115 records as having no documented job on either side and no row in the Job-to-Screen Mapping. That gap is inherited by this ticket's implementation rather than introduced by it, and it should be met at design time rather than rediscovered.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none). Blocked on a human decision, which is not the same thing.
- **Composes with**: (none)

## Related

- **ADR-005** (`docs/decisions/005-automated-decision-promotion-via-first-released.accepted.md`): the promotion lifecycle, which names no oversight condition. Not amended by this ticket.
- **ADR-049** (`docs/decisions/049-risk-label-bands-adopt-the-3-5-low-shape.proposed.md`): the first ADR here to carry `human-oversight: unconfirmed`, and the first drained. Its ratification blockquote states the independence of the two axes and points at this ticket.
- **P115** (`docs/problems/known-error/115-site-changes-without-changeset-silently-never-release-to-production.md`): records that the release path has no documented job on either side. Relevant to any A-or-B implementation, per the investigation task above.
- **P128** (`docs/problems/known-error/128-risk-threshold-restated-in-ten-places-with-no-single-source-of-truth.md`): the same Minor-impact band for governance prose that misdirects reasoning without being able to produce a wrong verdict. Used as the grounding comparable for Impact 2.
- **Hang-off check not run.** The mechanical pre-filter at capture surfaced eleven candidates sharing at least one signal, above the five-candidate cap, so the subagent dispatch was skipped per the latency rule and the list is recorded here for review-time re-evaluation: P088, P096, P097, P130, P131, P132, P133, P135, P137, P109, P122. All but two matched only on the broad `human-oversight` token. The two that matched on `ADR-049` are P130 and P135; neither is a plausible parent, P130 being about run-retro detectors in a consumer repo and P135 about the compendium hook's derived counts, which is a different surface of the same governance tooling rather than the same defect.
- Captured 2026-08-09 alongside the ADR-049 ratification recording, which is the iteration that surfaced it.
