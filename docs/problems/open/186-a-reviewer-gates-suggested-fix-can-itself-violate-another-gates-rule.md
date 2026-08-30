# Problem 186: A reviewer gate's suggested fix can itself violate another gate's rule

**Status**: Open
**Reported**: 2026-08-30
**Priority**: 9 (Medium) - Impact: 3 x Likelihood: 3 - derived at capture from the description per Step 4a
**Effort**: S - derived at capture per Step 4a
**Origin**: internal
**JTBD**: JTBD-300
**Persona**: publication-author

## Description

A reviewer gate's suggested fix is a hypothesis, not a safe edit. Applying one verbatim introduced a defect twice in a single `/wr-newsletter phase=prep` run on 2026-08-30 (The Shift Issue 20).

Evidence, both from that run:

1. The `cognitive-accessibility` gate's remedy for one of its own findings contained the word "actually", which sits under `Word list > Avoid` in `docs/VOICE-AND-TONE.md`. It was applied verbatim and failed check (p) in `scripts/check-newsletter-structure.sh` at the round close.
2. A search-result summary asserted that the ruling blocking the Pentagon's Anthropic blacklist turned on the First Amendment. The primary source (NBC News, fetched via `scripts/playwright-fetch.mjs`) records that as Anthropic's own allegation in its filing, not the ground of the ruling. The claim reached the draft body before verification caught it.

P154 already establishes that a **fact** a gate supplies inside a `Suggested fix:` line must be verified before it enters the body, and `.claude/skills/wr-newsletter/SKILL.md` step 15.37 item 2 codifies that. What this run adds is that the same discipline is needed for the **fix itself**, not only for factual claims inside it. Each gate scores one axis and cannot see the others, so a suggested rewrite can be correct on its own axis and still violate a banned word, a person rule, or a structural invariant.

The round-close lint already catches these, so the control exists. The gap is that it catches them one step later than necessary, which costs a remediation round.

Wider context from the same run, relevant to sizing: seven separate remediations applied from gate findings each introduced a new defect a later gate caught. That rate is the substantive cost driver behind ADR-043's live reassessment criterion 1 on the round cap.

## Symptoms

- A gate-suggested fix applied verbatim fails a different gate's deterministic check at the round close.
- The remediation round is consumed correcting a defect the fix introduced rather than the one it addressed.

## Workaround

Run `scripts/check-newsletter-structure.sh` at every round close before the paired gate re-invocation. This is already prescribed by SKILL step 15.37 item 2 and it did catch both instances above; the cost is the round, not the defect.

## Impact Assessment

- **Who is affected**: the publication author, via editions that need extra remediation rounds.
- **Frequency**: twice in one prep run.
- **Severity**: no defect published. Cost is rounds spent, which is the resource ADR-043's cap exists to protect.
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

Each reviewer gate scores a single axis in fresh context and has no visibility of the other gates' rules, so nothing in a gate's own contract prevents its suggested fix from breaching one.

### Investigation Tasks

- [ ] Decide whether SKILL step 15.37 item 2 should require a suggested fix to be checked against the deterministic lint's rule set BEFORE application rather than only at the round close.
- [ ] Consider whether the avoided-word list in particular is cheap enough to check inline at application time.
- [ ] Confirm whether this warrants an ADR-043 amendment or is a SKILL-local change.
- [ ] Create a reproduction test.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P154 (verify a gate-supplied fact before propagating it)

## Related

Captured via `/wr-itil:capture-problem` during The Shift Issue 20 prep. Sibling capture from the same run: the voice guide has no rule for aggregate cadence.

- **P154** - the verify-before-propagating discipline this extends from facts to fixes.
- **ADR-043** - bounded editorial remediation loop; reassessment criterion 1 (round cap) is live and this run is evidence for it.
- **ADR-052** - every reviewer gate blocks publication.
- `.claude/skills/wr-newsletter/SKILL.md` step 15.37 item 2 - the codified fact-verification discipline. Verified on disk at line 918: "A fact a gate hands you inside a suggested fix is a hypothesis, not a fact (P154)."
- `scripts/check-newsletter-structure.sh` check (p) - the deterministic control that caught both instances.
