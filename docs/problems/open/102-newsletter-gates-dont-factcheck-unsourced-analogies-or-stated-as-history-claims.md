# Problem 102: Newsletter review gates fact-check URLs but not unsourced analogies or stated-as-history claims

**Status**: Open
**Reported**: 2026-06-22
**Priority**: 6 (Medium). Impact: Moderate (3) x Likelihood: Unlikely (2) (deferred, re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: M (deferred, re-rate at next /wr-itil:review-problems)
**WSJF**: deferred, re-rate at next /wr-itil:review-problems
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

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Add a fact-check pass (or extend an existing gate / drafter discipline) for stated-as-history claims and load-bearing analogies that carry no URL: either source them or flag them as illustrative / "probably apocryphal".
- [ ] Minor: consider a leader-register plain-language check for obscure words like "apocryphal" (cog-a11y did not catch it).
- [ ] Minor: add "the brief" (internal self-nomenclature) to the banned reader-facing-copy patterns (voice guide or structural lint).

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: ADR-024 (URL verification), the cog-a11y gate, VOICE-AND-TONE.

## Related

Captured during the 2026-06-22 Issue 10 retrospective. Sibling to P089 (gates pass but defects remain) on the content-accuracy axis rather than the structural axis.
