# Problem 187: The voice guide has no rule for aggregate cadence, so a legal construction becomes a tic

**Status**: Open
**Reported**: 2026-08-30
**Priority**: 6 (Medium) - Impact: 3 x Likelihood: 2 - derived at capture from the description per Step 4a
**Effort**: S - derived at capture per Step 4a
**Origin**: internal
**JTBD**: JTBD-300
**Persona**: publication-author

## Description

`docs/VOICE-AND-TONE.md` scores constructions one at a time. It has no rule for how often a construction may appear across a finished artefact, so a form that is correct in every instance can still make the whole edition read as monotone.

Found on The Shift Issue 20 during the 2026-08-30 prep run. The `wr-voice-tone:agent` gate counted 16 instances of the corrective "X rather than Y" plus 5 further corrective forms ("not simply", "is not the same as", "not a measurement anyone has reproduced", "not as a disinterested check on us", "Not the policy, the measurement") in roughly 2,600 words. The move list alone carried three in five paragraphs; the diary carried five in five sentences.

The gate was explicit that it could not fault any single instance:

> Instance by instance, every one of these passes the current guide. "Confident, not defensive" explicitly permits non-self-positioning "not" constructions for technical distinctions, and none of these are self-positioning. Most carry real information: "proposed rather than settled," "by agreement rather than by right," and "it changed in a release note rather than through a decision anyone was asked to make" all lose meaning if the second half is cut. I cannot fault them individually against a rule that exists.

The `wr-newsletter-editor` gate found the same problem independently on its `sentence-rhythm` axis, which is evidence it is a real defect rather than one reviewer's taste.

The nearest existing principle, "Vary construction. Gerund-heavy titles blur together when every article uses one," is scoped to titles only.

The voice gate drafted a proposed addition, quoted here so the substance is not lost:

> ### Varied construction
>
> A construction that is correct once becomes a tic at volume. The corrective form, "X rather than Y" and "not X, Y", is the most likely to run away, because the brief's job is to draw distinctions and every distinction reaches for the same frame. Each instance can be load-bearing and the passage still reads monotone.
>
> The check is per artefact, not per sentence: count the corrective constructions in a finished draft. When one construction carries most of the distinctions, recast some of them as direct statements ("The cutoff of 12 November is a proposal") or as two sentences.
>
> This is a cadence rule, not a correctness rule. Do not cut a "rather than" whose second half carries meaning; recast it.

Amending the voice guide is direction-setting and was out of scope for a newsletter run, so it is captured rather than applied.

## Symptoms

- A finished edition reads monotone while every individual sentence passes the voice gate.
- The voice gate reports a real defect it cannot attribute to any rule, and has to flag it as a guide gap.
- Remediation makes it worse: several instances on Issue 20 were introduced by fixes applied for other gates' findings.

## Workaround

None mechanical. The voice gate surfaced it as a guide gap and the editor gate as a rhythm weakness, so it reaches the author, but neither can block on it and neither has a threshold to cite.

## Impact Assessment

- **Who is affected**: readers of The Shift and Tokens Spent, and the publication author who has to catch this by ear.
- **Frequency**: 21 corrective constructions in one 2,600-word edition. Unknown across the back catalogue; worth counting.
- **Severity**: reader experience, not correctness. No claim is wrong.
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

The guide's checks are per-instance by construction. Cadence is a property of the finished artefact, so no per-instance rule can express it.

### Investigation Tasks

- [ ] Decide whether to adopt the gate's proposed "Varied construction" section into `docs/VOICE-AND-TONE.md`, and whether it needs an ADR (a new rule class, per-artefact rather than per-instance).
- [ ] Count corrective constructions across the published back catalogue to see whether Issue 20 is typical or an outlier.
- [ ] Decide whether this is a voice-gate rule or an editor-gate rule; both gates found it, and the editor's `sentence-rhythm` axis may already be the right owner.
- [ ] Create a reproduction test.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

Captured via `/wr-itil:capture-problem` during The Shift Issue 20 prep. Sibling capture from the same run: a reviewer gate's suggested fix can itself violate another gate's rule.

- `docs/VOICE-AND-TONE.md` - the guide the rule would be added to; "Vary construction" under Voice is the nearest existing principle and is title-scoped.
- **ADR-012** - AI-generated content review gates.
- The `wr-voice-tone:agent` gate - found and characterised the gap. It is an installed plugin, not vendored in this repository, so there is no in-repo path to cite; the agent file resolves under `~/.claude/plugins/cache/windyroad/wr-voice-tone/<version>/agents/agent.md`.
- `.claude/agents/wr-newsletter-editor.md` - found the same problem independently on `sentence-rhythm`.
