# Problem 142: RFC lifecycle cannot advance past proposed because a gate blocks a ratified local deviation

**Status**: Open
**Reported**: 2026-08-09
**Priority**: 12 (High). Impact: 3 x Likelihood: 4, derived at capture from the description per Step 4a
**Origin**: internal
**Effort**: M, derived at capture per Step 4a
**WSJF**: 6.0 = (12 x 1.0) / 2

## Description

No RFC in this repository can reach `accepted`, and none ever has. An upstream gate hard-blocks the first lifecycle transition by enforcing a rule that a ratified local decision deliberately deviates from, and the gate has no way to learn about the deviation.

Evidence, read from disk 2026-08-09. `/wr-itil:manage-rfc <RFC> accepted` runs `wr-itil-check-rfc-has-stories` as a hard-block pre-flight on `proposed -> accepted`. The gate fails any RFC whose `stories:` array is empty, citing upstream ADR-089 (every RFC has at least one story).

ADR-045 is the local decision that RFCs here carry `stories: []` until a story tier exists. It is `human-oversight: confirmed`. It records that there is no `docs/stories/` and no `docs/story-maps/` directory, so there is no surface a story could land on, and that three RFCs had each re-derived the same warrant in their own bodies with wordings that had already drifted. Its Scope paragraph enumerates what it does not touch (the I1 problem-trace invariant, the I13 propose-fix gate, ADR-071, upstream ADR-073) but says nothing about this gate script. So the deviation is recorded in a decision the gate cannot read.

The block is total rather than partial. Running the gate against every RFC on disk returns exit 1 for all six. All six carry `stories: []` and all six sit at `status: proposed`. No RFC in this repository has ever reached `accepted`, `in-progress`, `verifying` or `closed`.

Surfaced 2026-08-09 when the user ratified RFC-006 and the transition could not be performed. The ratification was recorded on the `human-oversight` axis instead, which ADR-049 establishes as separable from lifecycle `status` (it carries `status: "proposed"` alongside `human-oversight: confirmed`). So the substance decision is captured, but the lifecycle artefact still reads proposed and every downstream step of the manage-rfc contract was skipped: the `## Commits` section render, the reverse-trace refresh onto the driving problem ticket, and the README ranking, whose WSJF formula multiplies severity by a status multiplier that is 1.0 at proposed and 2.0 at accepted. RFC ranking is therefore uniformly depressed by construction.

One further consequence worth recording: RFC-006's own closing line asserts it is "ratified at `/wr-itil:manage-rfc RFC-006 accepted`", a mechanism that cannot succeed here. That line was ratified along with the rest of the document, so it has been left alone rather than swept.

Fix strategy should not be guessed. The candidates have materially different blast radii and the choice is direction-setting, not mechanical.

## Symptoms

- `wr-itil-check-rfc-has-stories` returns exit 1 for RFC-001 through RFC-006, every RFC on disk.
- All six RFCs sit at `status: proposed`; the lifecycle has never advanced once.
- A ratified RFC cannot be marked accepted, so its ratification is visible only in frontmatter and not in the lifecycle status, the RFC index ranking, or the reverse trace on its driving problem.
- RFC WSJF ranks are uniformly computed at the proposed multiplier (1.0) rather than accepted (2.0), so the ranking cannot distinguish ratified work from unratified.

## Workaround

Record the ratification on the `human-oversight` axis and leave `status: proposed`. Applied to RFC-006 on 2026-08-09. This preserves the audit trail of the human decision but skips the commits-section render, the reverse-trace refresh and the ranking update, so it is a partial workaround rather than an equivalent.

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: every RFC lifecycle transition attempted in this repository, since the RFC tier was stood up
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Investigate root cause
- [ ] Create reproduction test
- [ ] Choose the fix direction. Candidates, each with a different blast radius: teach the gate to honour a recorded local deviation; amend ADR-045 to name this gate in its Scope paragraph and add the carve-out upstream; stand up a minimal story tier so the rule can be satisfied honestly; or decide the lifecycle here legitimately terminates at proposed plus a ratification marker, and change the skill contract to match
- [ ] Whichever direction is chosen, decide whether the general principle (an upstream gate needs a mechanism to honour a ratified adopter deviation) warrants its own decision record rather than a per-gate patch
- [ ] Check whether other upstream gates enforce rules this repo has ratified deviations from, since the same blindness would produce the same silent block
- [ ] Decide whether the five already-shipped RFCs (RFC-001 through RFC-005) should be ratified and transitioned in the same pass once unblocked

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

Captured via `/wr-itil:capture-problem`; expand at next investigation.

Sibling surface of P104 (I13 RFC-trace predicate not adopter-aware in repos without an RFC tier). Same family, an upstream gate blind to local tier adoption or to a ratified deviation, but a different gate, script, skill and lifecycle transition. P104's fix shape (no-op when the tier directory is absent) cannot resolve this one, because this repository has the RFC tier; the absent tier is the story tier, which P104's predicate never inspects. Candidate cluster parent at the next `/wr-itil:review-problems`. Arbitrated by a fresh-context `wr-itil:hang-off-check` dispatch, verdict PROCEED_NEW.

Shares a shape with P140 (the newsletter lint and the wr-newsletter SKILL disagree on the prep-phase reviews sibling path) and P141 (GitHub Actions versions are an uninstrumented dependency surface): all three are cases where two governance surfaces hold different beliefs about the same thing, and nothing reconciles them.

## Maintainer decision, 2026-08-23

Tom chose to draw one minimal story map rather than teach the gates to honour ADR-045 or end the lifecycle at proposed. Scope is a single map covering the newsletter-production journey, which is the smallest thing that makes every gate honest and is entirely local. Drawing it decides what that journey is, so it is his to author or to direct; the tooling must not generate it. Once it exists, RFC-002, RFC-004 and RFC-005 can cite it and advance past proposed, and the fix-trace predicate stops returning exit 3 on newsletter-pipeline work. **It does not unblock all six.** The discriminator is the journey, not the persona named in an RFC's annotations. RFC-002, RFC-004 and RFC-005 are production-side changes on the newsletter journey, so the map anchors all three regardless of which persona's jobs each names as the benefit. Note that only RFC-004 cites JTBD-300; RFC-002 and RFC-005 annotate reader jobs (JTBD-005, JTBD-200 and siblings) as the outcome rather than the journey, which is why the map anchors them without being widened to span reader personas. RFC-001 (align RISK-POLICY.md with the upstream staleness gate), RFC-003 (fix:deps green gate CI parity) and RFC-006 (deps refresh manifest pair and rollback) all carry `jtbd: []` and none sits on the newsletter journey: they are risk-policy, CI-dependency and release-path surfaces. RFC-003 and RFC-006 map to Internal Maintainer through the Job-to-Screen Mapping's `.github/workflows/` row; RFC-001's surface has no mapping row at all, so its exclusion rests on the journey argument rather than on that table, and a row for the risk-policy surfaces is queued for Tom. All three stay blocked pending a second map covering the maintainer and CI supply-chain journey, which P141 already queues. Do not widen the first map to span both personas: one map covering reader-facing and internal-tooling work collapses the conflict the persona file's "not the readers' interests by proxy" constraint requires to stay visible. This also addresses the sibling gap recorded on P104.

**Constraint on the fix, from the architect review of the decision commit (2026-08-23).** Drawing the map fires ADR-045's reassessment criterion 1 verbatim: a story tier existing in this repository supersedes that decision, and its own wording says superseded, not amended. So the commit that lands the first map must carry a new ADR that supersedes ADR-045, and ADR-045 then gains the three things ADR-054 requires when a decision is retired whole: a `superseded-by:` pointer, `status: "superseded"`, and a rename to `.superseded.md`. All three matter, because `scripts/decisions-supersession.test.mjs` keys its dead-end check on the filename, so a retired record left at `.proposed.md` would pass the test and keep rendering in the compendium's in-force section as a current rule.
