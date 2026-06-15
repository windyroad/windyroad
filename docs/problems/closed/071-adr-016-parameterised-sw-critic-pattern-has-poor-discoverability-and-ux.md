# Problem 071: ADR-016 parameterised sw-critic pattern has poor discoverability + UX; supersede with domain-specific critic agents

**Status**: Closed
**Reported**: 2026-05-30
**Origin**: internal
**Priority**: 16 (High). Impact: Significant (4) x Likelihood: Likely (4) (re-rated 2026-05-31 from 8.0; user direction on critic shape SUBSTANTIALLY elevates priority. The parameterised pattern is the root mechanism allowing the wrong-shape 38-check newsletter rubric per P064; supersession is now the strategic fix path for both this ticket AND P064 simultaneously.)
**Effort**: M
**WSJF**: 12 = (16 x 1) / 2 (re-rated 2026-05-31 from 4.0)
**Type**: technical

## Description

ADR-016 (sw-critic subagents and iteration loop) chose a single parameterised `wr-sw-critic` subagent with rubric files passed as arguments. The user-noted weakness in this pattern surfaced during the 2026-05-30 `/wr-architect:review-decisions` drain: **parameterised skills have poor discoverability and UX**.

User direction (2026-05-30, ADR-016 rejection in architect oversight drain): supersede with a non-parameterised pattern (likely domain-specific critic agents, e.g. `wr-newsletter-critic`, `wr-wardley-critic`, ADR-016 Option 2 which was originally rejected). The "single agent + many rubrics" pattern that ADR-016 chose for rubric reusability is now traded off against discoverability/UX cost: a parameterised agent is opaque to readers (you can't tell what it does without inspecting the invocation); domain-named agents self-document.

## Symptoms

- Reader of agent surface cannot tell at a glance what `wr-sw-critic` actually critiques (depends on rubric arg passed at call site).
- New artifact types (newsletter, wardley map, blog post, social post) each require new rubric authoring + plumbing in the calling skill; agent count stays small but cognitive load per artifact stays high.
- ADR-018 (`wr-content-risk-scorer`) followed ADR-016's pattern and is also parameterised; the supersede may cascade to ADR-018 too (re-evaluate after this ADR's rework).

## Workaround

(deferred to investigation; the parameterised pattern works mechanically; the friction is reader UX + discoverability)

## Impact Assessment

- **Who is affected**: every developer reading the agent definitions; future-Tom maintaining the critic pattern; downstream adopters of agent-plugins if any.
- **Frequency**: per-agent-definition-read frequency (estimated weekly via session-start agent enumeration).
- **Severity**: Medium. Mechanically the pattern works; discoverability cost compounds as artifact types grow.

## Root Cause Analysis

### Investigation Tasks

- [x] Re-rate Priority and Effort at next /wr-itil:review-problems. (Re-rated 2026-05-31 WSJF 4 to 12.)
- [x] Evaluate the supersede shape: ADR-016 Option 2 (two domain-specific critics: wr-wardley-critic, wr-newsletter-critic) was originally rejected on "duplicates the critic logic" grounds; re-evaluate that trade-off in light of the discoverability+UX cost. (Resolved via ADR-033: domain-specific split chosen; the "duplicates critic logic" risk is addressed by deferred library extraction tied to ADR-033's 8-edition reassessment criterion.)
- [x] Determine whether ADR-018's content-risk-scorer (which followed ADR-016's pattern) should also be superseded or kept as parameterised (different cost-benefit because content-risk axes are more stable than critic rubrics). (Resolved: ADR-033 Decision Outcome explicitly scopes ADR-018 OUT of the supersede. Content-risk axes are more stable; revisit if a second caller emerges.)
- [x] Author the superseding ADR via /wr-architect:create-adr. (Landed as ADR-033 on 2026-05-30 with `human-oversight: confirmed`. ADR-035 followed on 2026-05-31 amending the rubric content shape.)
- [x] Phase 1 (author wr-newsletter-critic.md and wr-wardley-critic.md per ADR-033). (Landed 2026-06-02 iter 2 of work-problems AFK loop.)
- [x] Phase 2 (migrate SKILL.md call-sites at steps 9 + 15 from wr-sw-critic to domain-specific agents; drop accepted_overrides list per ADR-035). (Landed 2026-06-02 iter 2; SKILL.md steps 9 + 15 invocations now call wr-wardley-critic + wr-newsletter-critic; step 15.25 + 15.4 + 17 prose updated.)
- [x] Phase 3 (retire wr-sw-critic.md to .deprecated.md or remove). **RESOLVED BY NARROWING (Tom, 2026-06-15); supersedes the prior BLOCKED note below.** Phase 3 narrowed to "no newsletter call-sites remain" (already true: SKILL.md steps 9 + 15 were migrated in Phase 2). `wr-sw-critic` is **deliberately retained as a wr-blog-only shared agent, NOT retired**, per Tom's direction. The wr-blog domain-specific critics are out of scope for P071 (a separate ticket if/when wanted). The original BLOCKED analysis is preserved verbatim for audit. **BLOCKED (discovered 2026-06-14):** ADR-033 criterion (d) has now closed (Issue 08 cycle), which unblocks the *newsletter* side, but `wr-sw-critic` is still a LIVE dependency of the wr-blog skill. Live call sites outside the newsletter pipeline: `skills/wr-blog/create-social-posts/SKILL.md:119` (invokes wr-sw-critic against `social-critic-rubric.md`), `skills/wr-blog/assets/genres/root-cause-guide.md:103` (SW critic loop against `article-critic-rubric.md`), plus the output-contract references in `skills/wr-blog/assets/article-critic-rubric.md` and `skills/wr-blog/create-social-posts/assets/social-critic-rubric.md`. ADR-033 was scoped only to the newsletter pipeline and did not contemplate wr-blog adoption; retiring or removing the agent file would break wr-blog. Resolution requires a new in-scope decision (extend the domain-specific supersede to wr-blog with its own critics, vs. keep wr-sw-critic alive as a wr-blog-only shared agent, vs. other). Queued to the AFK orchestrator as a direction question 2026-06-14; not actionable non-interactively. Architect confirmed this read 2026-06-14.
- [x] ADR-033 status flip from `.proposed` to `.accepted`. (Done 2026-06-14: criterion (d) closed empirically via The Shift Issue 08 (2026-06-08) prep + finalise cycle, which exercised wr-newsletter-critic + wr-wardley-critic end-to-end with the expected verdict shapes per `src/newsletters/published/leader/2026-06-08/2026-06-08.reviews.md`. File renamed to `.accepted.md`; criteria (a) through (e) all closed.)
- [x] ADR-035 status flip from `.proposed` to `.accepted`. (Done 2026-06-14: criterion 5 closed by the same Issue 08 cycle (simplified S/W critic shape produced a publish-decision verdict matching editorial judgement); criterion 6 confirmed closed (both P064 and P071 fix strategies reference ADR-035). File renamed to `.accepted.md`.)

## Dependencies

- **Blocks**: ADR-016 final-status. Until this ticket lands a superseding ADR, ADR-016 carries `human-oversight: rejected-pending-supersede` marker.
- **Blocked by**: (none, ready to investigate when prioritised)
- **Composes with**: ADR-018 (followed the same parameterised pattern; potential cascade supersede). P064 (Newsletter critic round-3 budget exhausted, touches sw-critic surface; may compose if both reworks land together).

## Related

- Captured via `/wr-itil:capture-problem` on 2026-05-30 during `/wr-architect:review-decisions` drain after user rejected ADR-016.
- ADR-016 frontmatter carries `human-oversight: rejected-pending-supersede` + `supersede-ticket: P071`.
- Rationale verbatim from user: "Parameterised skills have poor discoverability and UX".
- 2026-06-14 (`/wr-itil:work-problems` AFK iter): ADR-033 + ADR-035 flipped `.proposed` to `.accepted` after the empirical confirmation criteria closed via The Shift Issue 08. Phase 3 (retire wr-sw-critic.md) found BLOCKED by a previously-undocumented wr-blog dependency on `wr-sw-critic`; ADR-033's Phase 3 scope did not contemplate wr-blog. Ticket stays Open (partial-progress); the Phase-3 scope question is queued for human direction. Architect (COMPLIANT on the flips) + JTBD (PASS) gates run; Decisions Compendium regenerated per ADR-077.
- Re-rated 2026-05-31 (WSJF 4.0 to 12.0) during `/wr-itil:work-problems` orchestrator main turn after user direction reframed P064: the newsletter critic's 38-check structured rubric is the wrong shape; the parameterised pattern is the mechanism that allowed it to accrete. Supersession path now serves both this ticket AND P064. User rationale verbatim 2026-05-31: "I never approved a strength/weaknesses rubric. It's supposed to be a simple 'what are the strengths and weaknesses of the document, maybe with some additional relevant context'. That's it. Nothing more. Cog-a11y, voice and tone and risk are all run separately."

## Resolution (Tom, 2026-06-15)

Phase 3 direction decided: **narrow Phase 3 to "no newsletter call-sites remain" (already true) and keep wr-sw-critic as a wr-blog-only shared agent**. The newsletter supersede (ADR-033 Phase 2 + ADR-033/035 acceptance) is complete; wr-blog migration is explicitly out of scope for P071. Resolved-complete on the newsletter axis. Follow-on close-transition pending; wr-blog domain-specific critics are a separate ticket if/when wanted.

## Closed as no longer relevant

- **Evidence shape**: ADR-shipped-confirmed, self-marker-in-body (ADR-079 Phase 1 + Phase 2)
- **Closed on**: 2026-06-15
- **Closed by**: /wr-itil:manage-problem decision-complete close executing Tom's `## Resolution (Tom, 2026-06-15)`. Open to Closed bypasses Verification Pending per ADR-079 (no fix was released by this close; the newsletter supersede shipped earlier under ADR-033 Phase 2).
- **Cite (per-shape evidence)**: ADR-shipped-confirmed: `docs/decisions/033-*.accepted.md` (human-oversight: confirmed) and `docs/decisions/035-*.accepted.md` both flipped to accepted 2026-06-14, superseding the parameterised newsletter critic; Phase 2 migrated SKILL.md steps 9 + 15 to wr-newsletter-critic + wr-wardley-critic. self-marker-in-body: the `## Resolution (Tom, 2026-06-15)` section narrows P071 to the newsletter axis (resolved-complete) and records that wr-sw-critic is deliberately retained as a wr-blog-only shared agent.
- **Caveat**: scope-narrowed close. wr-blog still depends on wr-sw-critic (live call sites in `skills/wr-blog/create-social-posts/SKILL.md` + `skills/wr-blog/assets/genres/root-cause-guide.md`); that dependency is intentional, not a defect. wr-blog domain-specific critics are deferred to a separate ticket if/when wanted (queued at outstanding_questions for the orchestrator, not auto-created).
- **Persist**: this section is committed in the ticket file itself.
- **Uncertainty / reversibility**: deterministic given the body + the accepted ADR state. Reversible via `git revert` of the close commit OR `git mv` back to `open/`.
