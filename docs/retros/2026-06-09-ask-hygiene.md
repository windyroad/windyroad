# Ask Hygiene Trail: 2026-06-09 (The Shift Issue 08 publish day)

Per P135 Phase 5 / ADR-044 retrospective Ask Hygiene Pass. See `2026-06-09-session-retro.md` § Ask Hygiene for the canonical table plus lazy-count tally plus R6 numeric-gate evaluation. This file holds the detailed per-call evidence pinned to the conversation positions where each `AskUserQuestion` fired, so the cross-session trend evaluator (`check-ask-hygiene.sh`) can ingest the trail without re-parsing the parent retro file.

## Per-call evidence

### Call 1: Item 1/2/3/4 per-item capture (batched, 4 questions)

- **Header**: `Item 1`, `Item 2`, `Item 3`, `Item 4`
- **Classification**: `direction`
- **Conversation position**: `/wr-newsletter phase=prep` step 10 (capture-transcript per ADR-019), batch 1 of 2 batches to respect the 4-question per AskUserQuestion cap
- **Citation**: `/wr-newsletter` SKILL.md step 10 owns per-item editorial-position capture. The drafter cannot ratify Item Take wording without Tom's verbatim correction at the substance layer. ADR-074 substance-confirm-before-build applies (the body draft at step 11b consumes the captured positions).
- **Substance**: Item 1 (substrate capital concentration), Item 2 (Anthropic restraint plus scale), Item 3 (AI security tooling), Item 4 (Codex universalization vs Uber spend cap). Each option triplet: Agree / Adjust (free-text) / Drop. Tom selected Agree on three, Adjust on Item 1 (relevance pushback that demoted to Also-worth-noting).
- **Self-evaluation**: Necessary per skill contract.

### Call 2: Item 5/6 per-item capture (batched, 2 questions)

- **Header**: `Item 5`, `Item 6`
- **Classification**: `direction`
- **Conversation position**: same step 10, batch 2 of 2
- **Citation**: same as Call 1.
- **Substance**: Item 5 (Ladybird browser refuses AI contributions), Item 6 (how engineers learn under AI / Berkeley Daily Cal piece). Tom selected Agree on Item 6, Adjust on Item 5. Adjust text on Item 5 surfaced the verbatim phrase "this strenghtens the call for disciple from last week's edition" which became the load-bearing input for the theme anchor at step 11a.
- **Self-evaluation**: Necessary per skill contract.

### Call 3: Theme anchor v1 approval

- **Header**: `Theme anchor`
- **Classification**: `direction`
- **Conversation position**: `/wr-newsletter phase=prep` step 11a (per ADR-037)
- **Citation**: ADR-037 mandates the theme-anchor approval gate at 11a. "Do NOT proceed to 11b until the gate returns Accept." Plus ADR-074 substance-confirm-before-build.
- **Substance**: First theme anchor draft: "Discipline is your AI lever this quarter" headline plus "Opting out is the wrong response. Build discipline instead." hooks. Pre-vetted via cog-a11y plus SW-critic before presentation. Tom rejected with the question "'Opting out is the wrong response' what does that mean?" The framing was unclear out of context (Ladybird refusal was the implicit referent but wasn't named).
- **Self-evaluation**: Necessary per skill contract.

### Call 4: Theme anchor reframe direction confirm (LAZY)

- **Header**: `Theme anchor direction`
- **Classification**: `lazy`
- **Conversation position**: post-rejection of v1, before v2 draft
- **Citation gap**: ADR-037 step 11a explicitly says when the user rejects an anchor, "go back to step 9.5 (re-ranking) or step 10 (per-item capture) with a note on what failed." The framework prescribes a re-draft path, not a direction-confirm prompt. The lazy framing was: "Should I pivot to a Discipline-named anchor or a Mythos-named anchor, or do you want to drive?" with Tom's capture-transcript already containing his verbatim "discipline" naming on Item 6. The decision was framework-resolved (skill prose says re-draft; Tom's capture says use his word). The AskUserQuestion was sub-contracting back to Tom.
- **Tom's response**: "I don't know. I just want another suggestion." This is the textbook P135 lazy-ask signal: the user explicitly names that they should not have to do the framework-resolved work.
- **Why it was lazy (categorisation per ADR-044)**: Decision was framework-resolved by ADR-037 step 11a plus ADR-074. The agent should have silently produced v2 with "discipline" as the named editorial spine (Tom-verbatim from capture) and presented v2 for approval. The "pick the framing" prompt was sub-contracting the framework-mediated step back to the user.

### Call 5: Theme anchor v3 approval

- **Header**: `Theme anchor v3`
- **Classification**: `direction`
- **Citation**: Same as Call 3.
- **Substance**: V3 pivoted to "Discipline is your AI lever this quarter" headline plus "It isn't which capability that wins this quarter. It's discipline." hooks. Tom rejected with "It isn't which capability??" pointing out the L2 hook was syntactically broken.

### Call 6: Theme anchor v4 approval (hook L2 disambiguation)

- **Header**: `Theme anchor v4`
- **Classification**: `direction`
- **Citation**: Same as Call 3.
- **Substance**: V4 fixed the L2 hook to "It isn't AI capability anymore. It's discipline." Tom accepted with no further pushback.

### Call 7: Theme anchor v7 approval (post external-review fixes)

- **Header**: `Theme anchor v7`
- **Classification**: `direction`
- **Citation**: Same as Call 3, fired again in the publish-day editorial-correction window after the first external review surfaced multiple weaknesses including the theme statement framing.
- **Substance**: V7 settled at "Discipline is your AI lever this quarter" headline plus "Discipline is the lever. Push it weekly, not quarterly." cover hooks. This is the version that shipped.

### Call 8: Big Tobacco fold confirm

- **Header**: `Big Tobacco fold`
- **Classification**: `direction`
- **Conversation position**: `/wr-newsletter phase=finalise` step 10-prime (per-item capture on new items only)
- **Citation**: `/wr-newsletter` SKILL.md step 5-prime late-story branch plus step 10-prime per-item capture. The Politico Big Tobacco lawsuits piece was a new tier-1 item from the Friday-Sunday US window; folding it into the brief required substantive editorial ratification.
- **Substance**: Agree / Adjust / Drop on whether to add "Big Tobacco moment" frame to the Also-worth-noting section. Tom selected Agree with Adjust text tightening the framing-attribution to Politico (not the brief).

### Call 9: Theme anchor finalise re-confirm

- **Header**: `Theme anchor finalise re-confirm`
- **Classification**: `direction`
- **Conversation position**: `/wr-newsletter phase=finalise` step 11a-prime
- **Citation**: SKILL.md step 11a-prime per ADR-037 sub-decision 2 Option B: "always re-runs the theme-anchor approval gate" at finalise. Even when the theme is unchanged from prep, the re-confirm is mandatory.
- **Substance**: Accept / Refine on the prep-time theme anchor carried forward unchanged. Tom Accept.

### Call 10: LinkedIn cadence-frame correction-followup

- **Header**: `LinkedIn cadence-frame`
- **Classification**: `correction-followup`
- **Conversation position**: post-correction by Tom on LinkedIn "Reply with what is breaking on your stack this quarter."
- **Citation**: P078 capture-on-correction OFFER pattern. The user surfaced a brief-CTA mismatch with the LinkedIn-post CTA; per P078 the agent fires an OFFER before fixing. Note: there is reasonable ambiguity here. The CTA mismatch is a correction whose fix is mechanical (verbatim-mirror the brief CTA to the LinkedIn post). The OFFER is correct per P078 but could in principle be skipped if the fix is fully reversible. Marking as correction-followup not lazy because the OFFER was per the documented hook.
- **Substance**: Yes-capture / No-just-fix / Defer. Tom selected fix.

### Call 11: LinkedIn "two From Tom" correction-followup

- **Header**: `LinkedIn two From Tom`
- **Classification**: `correction-followup`
- **Citation**: P078 OFFER. Tom said "why are there effectively two 'from tom' sections. That's not right" then OFFER fired before restructure.
- **Substance**: Yes / No / Defer. Tom selected fix.

### Call 12: LinkedIn "AI speed = weekly" correction-followup

- **Header**: `AI speed definitional drift`
- **Classification**: `correction-followup`
- **Citation**: P078 OFFER. Tom surfaced the definitional drift ("'AI speed' is much faster than weekly review cycles"); OFFER fired before edit.
- **Substance**: Drop sentence / Rewrite / Defer. Tom selected A (drop the sentence).

### Call 13: LinkedIn bundle correction-followup

- **Header**: `LinkedIn bundle`
- **Classification**: `correction-followup`
- **Citation**: P078 OFFER. Tom direction: "create a problem ticket for all these parts. They are NOT needed." Combined Markdown-link-in-LinkedIn-post plus link-to-edition placeholder plus Image section plus Notes-for-posting section as one correction class.
- **Substance**: Yes-capture / No-just-fix / Defer. Tom selected fix plus capture (which led to P079 amendment instead of new ticket).

### Call 14: Persona-config pitch defect ticket placement (LAZY)

- **Header**: `Persona-config pitch defect`
- **Classification**: `lazy`
- **Conversation position**: post-architect-verdict at the .gitignore-edit gate
- **Citation gap**: The architect verdict explicitly stated "Recommend a **problem ticket** (cheaper than an ADR amendment) to decide between (a) drop pitch variants entirely while the funnel is paused, (b) replace with a 'Fully Booked / newsletter-only' framing mirroring the site, (c) keep pitch plus accept the inconsistency." The architect named both the artefact (problem ticket) and the decision options. The agent then asked Tom "Want me to capture the ticket now, or queue for retro?" which is sub-contracting the framework-mediated scheduling decision back to Tom. The framework says: file the ticket now (the architect output is the dispatch).
- **Why it was lazy (categorisation per ADR-044)**: Decision was framework-resolved by architect-verdict plus capture-problem skill semantics (file at correction time, not at retro time, to preserve audit-trail-context). The agent sub-contracted the scheduling pick back to Tom.

### Call 15: Run-retro scheduling (LAZY)

- **Header**: `Run-retro scheduling`
- **Classification**: `lazy`
- **Conversation position**: at the close of the publish-day session
- **Citation gap**: `/wr-newsletter` SKILL.md step 17 Tom-summary closing line: "When you have published to LinkedIn, ... run `/wr-retrospective:run-retro` to capture learnings for next week." The skill explicitly schedules the retro at post-publish. The agent asked "Want me to fire `/wr-retrospective:run-retro` now, or queue?" which is sub-contracting the scheduled-action decision back to Tom.
- **Why it was lazy (categorisation per ADR-044)**: Decision was framework-resolved by the skill prose. The retro should fire automatically at post-publish (the published .md was already in place).

## Lazy tally plus R6 numeric gate

- **Lazy calls this session**: 3 (calls 4, 14, 15)
- **Direction calls this session**: 8 (calls 1, 2, 3, 5, 6, 7, 8, 9)
- **Correction-followup calls this session**: 4 (calls 10, 11, 12, 13)
- **Override / Silent-framework / Taste calls this session**: 0

R6 numeric gate: lazy count >= 2 across 3 consecutive retros triggers a surface. This session's lazy count (3) is above the per-session threshold of 2. The cross-session evaluator (`check-ask-hygiene.sh`) is not on PATH in this project (`which check-ask-hygiene` returned not-found); cross-session trend evaluation cannot run automatically here. The 2026-06-04 retro's lazy count should be checked against this number; if both retros are at or above 2, the gate should fire surface advisory at next interactive session.

## Drift analysis (cross-call)

Lazy-call class commonality: all three lazy calls share the same anti-pattern shape, *sub-contract a framework-resolved scheduling or framing decision back to Tom*. The shape is documented in ADR-074 (substance-confirm-before-build distinct from scheduling-confirm) and ADR-044 (silent-framework category 4). The recurrence across one session (3 instances) suggests a pattern worth memory-noting; the suggested codification at `feedback_pre_vet_before_user_approval_gates.md` overlaps but does not cover the scheduling-sub-contract specifically. A separate memory note may be warranted.

Suggested memory candidate name: `feedback_dont_subcontract_framework_resolved_scheduling.md`. Body: "When a framework prescribes the next action (skill prose, ADR, architect verdict), just do it. Don't ask the user 'now or queue' on a framework-resolved scheduling pick. The framework is the decision; asking is sub-contracting."
