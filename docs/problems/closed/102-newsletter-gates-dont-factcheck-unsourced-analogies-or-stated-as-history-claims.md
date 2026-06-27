# Problem 102: Newsletter review gates fact-check URLs but not unsourced analogies or stated-as-history claims

**Status**: Closed
**Reported**: 2026-06-22
**Priority**: 6 (Medium). Impact: Moderate (3) x Likelihood: Unlikely (2) (re-rated 2026-06-27 at fix time: concrete values confirmed, deferral cleared)
**Origin**: internal
**Effort**: M (re-rated 2026-06-27: four additive markdown edits across rubric, SKILL, voice guide, persona; moderate change, few files)
**WSJF**: excluded (Verification Pending; remaining work is user-side verification per ADR-022)
**Type**: technical

## Description

Issue 10's From-Tom opener stated an anecdote as historical fact: a school once worried that giving children paper and pencils would erode their ability to write on slate with chalk. The line passed voice, content-risk, newsletter-critic, editor, cog-a11y, AND the URL-verification gate, then Tom asked for a source. Web verification (Quote Investigator, TruthOrFiction, Boston1775) found it is an apocryphal / satirical "students today depend on paper too much" quote with no primary source. It was reframed to "There is a story, probably made up, ...".

The gap: the URL-verification gate checks LINKS (a claim with a URL is verified against the article body), but a vivid analogy or a "X once happened" historical claim that carries no URL has no gate at all. For an edition whose whole spine is evidence quality, shipping a fabricated "fact" is a real risk.

Two adjacent, smaller observations from the same fix:
- "apocryphal" itself was too obscure for the leader register (cog-a11y did not flag it; Tom did, preferring plain "probably made up").
- "the brief has tracked" leaked internal nomenclature into reader-facing copy (corrected to "we have tracked").

## Symptoms

- A stated-as-history claim / vivid analogy with no URL passes every gate including URL-verify.
- Caught only when the user asks for a source.

## Workaround

Manually fact-check analogies and stated-as-history claims before publish (done on Issue 10 after Tom asked).

## Impact Assessment

- **Who is affected**: any edition whose opener or items use a historical analogy or an unsourced "X happened" claim.
- **Frequency**: occasional (analogies are common in the From-Tom opener).
- **Severity**: Moderate. A fabricated fact in an evidence-themed brief is a credibility risk for a credential-sensitive audience.

## Root Cause Analysis

The gate suite verifies URL-backed claims (ADR-024) and voice/risk/craft, but has no pass that flags rhetoric stated as historical fact without a source. Such claims are invisible to the URL gate (no link to check) and to the voice/critic gates (which do not fact-check).

### Investigation Tasks

- [x] Re-rate Priority and Effort (done 2026-06-27 at fix time; see header)
- [x] Add a fact-check pass (or extend an existing gate / drafter discipline) for stated-as-history claims and load-bearing analogies that carry no URL: either source them or flag them as illustrative / "probably apocryphal". (Done: extended the content-risk rubric `check_1: factual` axis.)
- [x] Minor: consider a leader-register plain-language check for obscure words like "apocryphal" (cog-a11y did not catch it). (Done: added a plain-word-preference clause to the leader persona register.)
- [x] Minor: add "the brief" (internal self-nomenclature) to the banned reader-facing-copy patterns (voice guide or structural lint). (Done: added a Banned patterns row to docs/VOICE-AND-TONE.md.)

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: ADR-024 (URL verification), the cog-a11y gate, VOICE-AND-TONE.

## Related

Captured during the 2026-06-22 Issue 10 retrospective. Sibling to P089 (gates pass but defects remain) on the content-accuracy axis rather than the structural axis.

## Fix Strategy

Extend the existing content-risk gate rather than add a new gate (the ticket's first option). The content-risk `wr-content-risk-scorer` subagent runs on every draft at SKILL.md step 14 and already owns the `factual` axis; broadening that axis's scope is the lazy fix that closes the gap with no new subagent, no new ADR, and no change to the pinned five-axis `CONTENT_RISK:` output block (ADR 015 confirmation criterion 3 left intact, confirmed by architect).

Surfaces touched (all repo-local markdown, no packages/<plugin> change, so no changeset required):

1. `.claude/skills/wr-newsletter/assets/content-risk-rubric.md` `check_1: factual` extended to flag historical anecdotes, "X once happened" claims, and load-bearing analogies stated as fact with no primary source, unless framed illustrative. A note records that this axis is where no-URL claims (invisible to the ADR-024 URL-verify gate) get caught.
2. `.claude/skills/wr-newsletter/SKILL.md` step 11.5 carries a scope-boundary note routing no-URL rhetorical/historical claims to content-risk check_1.
3. `docs/VOICE-AND-TONE.md` Banned patterns gains a row for naming the artifact by its internal label instead of speaking as the team ("the brief has tracked" -> "we have tracked").
4. `.claude/skills/wr-newsletter/personas/leader.md` register gains a plain-word-preference clause ("probably made up" over "apocryphal").

## Fix Released

Fixed in this commit (repo-local `.claude/skills` + governance-doc edits; no npm release). Status moved Open -> Verification Pending per ADR-022. Awaiting user verification that the next edition's content-risk gate flags an unsourced stated-as-history claim or load-bearing analogy.

Gate trail: architect PASS (within-axis scope clarification, pinned CONTENT_RISK block byte-identical, no sixth axis, no ADR supersession), jtbd PASS (serves JTBD-205 trust / JTBD-001 credibility), voice-tone PASS after one revision (banned-row wording de-jargonised to match the Tom-curated register).

Calibration note (architect advisory): the new `high` clause is a deliberate widening of the factual axis's reject-set. Flag it for false-positive-rate audit at a future retrospective per the ADR-015 / ADR-018 reassessment pattern, in case illustrative-but-flagged analogies start tripping it.

Process note (I13 / P104): the propose-fix RFC-trace gate fires `no-rfc-trace` in this repo because there is no `docs/rfcs/` tier; this is the known P104 false positive. Per P070 / P103 precedent the legacy direct-implementation path was used; no RFC was auto-created.

## Closed

- **Closed**: 2026-06-28 (verification-queue drain; evidence-based per ADR-022)
- **Evidence**: content-risk check_1 extended for unsourced historical/analogy claims; 2026-06-22 opener uses plain-word reframe
- **Recovery**: reopen via /wr-itil:transition-problem 102 known-error if a regression surfaces
