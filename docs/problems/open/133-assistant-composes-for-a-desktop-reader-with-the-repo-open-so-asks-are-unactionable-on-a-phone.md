# Problem 133: Assistant composes for a desktop reader with the repo open, so asks are unactionable on a phone

**Status**: Open
**Reported**: 2026-08-08
**Priority**: 8 (Medium), Impact: 2 x Likelihood: 4, derived at capture from the description. Impact is 2 because nothing reader-facing is at stake and nothing wrong ships: the immediate cost is that a legitimate ask arrives in a form the user cannot act on, and the loop stalls until he corrects it. It is not 1 because the failure has a silent branch as well as a loud one. The loud branch is the correction below. The silent branch is that the user ratifies what he cannot read, which turns a human-oversight marker into exactly the hollow marker the `architect-oversight-marker-discipline` hook exists to prevent, and the whole ratify-don't-review stance rests on those markers meaning something. Likelihood is 4 because the phone is the primary interface, not an occasional one, so the constraint applies to every ask by default rather than to an unlucky subset, and three distinct instances landed in a single session on 2026-08-08.
**Origin**: internal
**Effort**: S, derived at capture. A memory-layer discipline note plus, if the pattern recurs after that, a prose line in the skills that compose ratification asks. Same size class and same fix locus as P050, P061 and P107, all assistant-discipline corrections shipped as memory-layer levers.
**WSJF**: 8.0 = (8 x 1.0) / 1
**JTBD**: anchoring left explicitly unconfirmed. `docs/jtbd/` models four personas, all readers or the newsletter author; the affected party is whoever the assistant asks to ratify a decision in this repo, and no maintainer persona is modelled. Same convention as the P130, P131 and P132 notes.

## Description

The assistant composes its output for a reader sitting at a desktop with the repository open. Tom's actual interface is a phone. The two are not compatible, and the mismatch makes governance asks unactionable at precisely the moment they matter.

Concretely, the assistant produces wide multi-column status tables that do not fit a phone screen, refers to work by bare ticket ID or file path as though the reader can open it, assumes the reader carries the session's context, and says things like "I'll draft it and bring it to you rather than landing it" without attaching anything. On a phone, none of that is readable or actionable. The reader cannot open `docs/decisions/` to review an ADR the assistant has only named.

Three instances on 2026-08-08 in one session: repeated wide status tables; the "I'll draft it and bring it to you" line with no file sent; and describing an ADR for ratification rather than delivering it.

The trigger was a phone screenshot from Tom:

> FFS! If you want me to ratify something you have to give me the file. This is my interface. This is the window you have to work with me with. You MUST take that into consideration... Think about what I know and what I don't or may have forgotten. Think about the small window you have to interact with me with... Be more empathetic!

This matters more than ordinary output-format friction because of where it lands. The project's stance is that humans ratify decisions and automated gates carry code quality. Ratification is therefore the one place a human is genuinely on the critical path, and it is the place this defect bites. An ask the reader cannot act on either stalls the loop or gets waved through unread.

Fix direction, as stated by the user:

- When asking a human to decide, deliver the artefact (`SendUserFile`) **and** put the decision itself in the message, so the ask is actionable without opening anything. Not one or the other: the file is what gets reviewed, the message is what makes the review possible when the file cannot be opened right then.
- Prefer prose over tables. Wide multi-column tables are the worst offender.
- Do not assume the reader has the session's context, the repository in front of them, or a memory of what a bare ID refers to. Name the substance before the identifier.

## Symptoms

- Wide multi-column status tables that do not fit the reader's screen.
- Ratification requested for an artefact that was named but not delivered.
- Deferral prose ("I'll draft it and bring it to you") with no attachment following.
- Bare ticket IDs, ADR numbers and file paths used as though the reader can resolve them.

## Workaround

Attach the artefact with `SendUserFile` and restate the decision in the message body. Replace tables with prose. Expand every identifier to its substance on first mention.

## Impact Assessment

- **Who is affected**: whoever the assistant asks to ratify a decision. Currently Tom, on a phone.
- **Frequency**: potentially every ask; three instances observed in one session on 2026-08-08.
- **Severity**: the loud failure is a stalled loop and a correction. The quiet failure is a ratification given without a real read, which hollows out the human-oversight marker.
- **Analytics**: none.

## Root Cause Analysis

### Investigation Tasks

- [ ] Investigate root cause: is this a memory-layer discipline fix, like P050, P061 and P107, or does it need a prose line in the skills that compose ratification asks?
- [ ] Decide the canonical contract for a ratification ask: artefact delivered via `SendUserFile` plus a self-contained decision statement in the message, with acceptance and rejection both expressible in a one-line reply.
- [ ] Decide whether the same reader model should bind ordinary status output, not just ratification asks. Wide tables were the most-repeated instance and are not ask-specific.
- [ ] Check whether `/wr-architect:review-decisions` and `/wr-jtbd:confirm-jobs-and-personas`, the two oversight drains that exist to collect human ratification, compose their prompts against the desktop reader model.
- [ ] Consider whether P107, P061, P109 and this ticket warrant a parent ticket for assistant-user content-handoff discipline at the next cluster pass.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

- P107 (open), assistant routes free-text input collection through AskUserQuestion instead of per-item copyable blocks. The nearest sibling. Arbitrated at capture via `wr-itil:hang-off-check`, verdict PROCEED_NEW: P107's scope is bounded to the input-collection mechanism for free text the user pastes back, while this ticket concerns the reader model the output is composed against. Different fix locus, so sibling rather than parent.
- P061 (known error), assistant gates policy-authorised actions on user permission. Also arbitrated, also PROCEED_NEW. Its corrective is "stop asking and act"; this ticket's corrective is the opposite, keep asking but make the ask actionable. The observed "I'll draft it and bring it to you" line resembles P061's deferral prose on the surface only: ADR ratification is a genuine human decision, not a policy-authorised action the assistant should have taken itself.
- P109 (known error), external review round-trips waste cycles on stale copy. Surfaced by the arbiter rather than the pre-filter. It is the only other ticket that names `SendUserFile`, and it shares the corrective mechanism, but its root cause is stale-copy provenance in a reviewer relay loop rather than the reader's channel constraints.
- P050 (closed), smallest change satisfies the correction. Same assistant-discipline fix class, shipped as a memory-layer lever.
- The capture-time mechanical pre-filter over-matched on the generic path token `docs/decisions` and returned six candidates (P056, P097, P132, P015, P120, P122), tripping the five-candidate cap. None concerns the assistant's output format or the user's interface. Recorded here for review-time re-evaluation rather than arbitrated, per the Step 2b cap short-circuit. The genuine nearest sibling, P107, was not in that set, which is why the arbiter was dispatched against P107 and P061 directly.
- captured via /wr-itil:capture-problem; expand at next investigation.
