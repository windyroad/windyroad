# Ask Hygiene, 2026-08-30 (P120 AFK iteration)

Session: AFK `/wr-itil:work-problems` iteration on P120 (editor and skeptic gates surface findings to Tom instead of remediating them). Tier 0 critical-bypass selection; the iteration reversed the 2026-08-28 flip-back and closed the ticket on Tom's direct instruction.

No `AskUserQuestion` calls were made. The iteration ran under the AFK contract, which forbids mid-loop asks and routes anything user-answerable to `ITERATION_SUMMARY.outstanding_questions` for batched presentation at loop end. The iteration prompt also named the constraint explicitly.

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | (none) | (none) | No `AskUserQuestion` invoked this session. |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

## Decisions that could have become asks, and did not

Recorded so the zero is auditable rather than merely asserted.

- **Whether to reverse the flip-back at all.** Not an ask: Tom's direct instruction "Move back and close" was supplied in the iteration prompt as the authority for the iteration. Re-asking would have been the canonical lazy shape.
- **Whether the round-count claim held.** Not an ask: the iteration prompt made this a verify-or-stop condition, so the resolution path was a disk read, not a question. Verified against `src/newsletters/published/leader/2026-08-24/2026-08-24.reviews.md` and `docs/decisions/043-*.md` before the first transition.
- **Whether to fix the three ADR path references pointing at P120's old `known-error/` path.** Not an ask: `wr-architect:agent` returned ISSUES FOUND citing local ADR-054 (A decision is changed by a new decision, never by editing the old one), which forbids editing a ratified body. Framework-resolved; the ADRs were left alone. Those references died at commit `bb46807f`, when P120 left `known-error/`; the later move to `closed/` changed the correct target but added no second breakage. `Framework: local ADR-054`.
- **Whether to apply each risk-scorer remediation.** Not an ask: upstream ADR-042 (Auto-apply scorer remediations -- open action-class vocabulary) Rule 1 requires auto-applying remediations until residual is within appetite, and forbids asking whether to commit above appetite (upstream P377 / upstream RFC-029; local problem IDs stop at 178 and local RFCs at RFC-006, so both are the agent-plugins namespace). Twelve remediations R1 to R12 were raised across four scoring passes on the close commit: nine genuine defects applied, R8 verification-only and confirmed a false alarm, R9 refuted against disk, R12 a sweep instruction rather than a defect. `Framework: upstream ADR-042 Rule 1`.
- **Whether to ticket the reviewer read-extent observation.** Not an ask: run-retro Step 4b Stage 1 makes ticketing a recurring-class observation mechanical, with an explicit anti-pattern against deferring it. Captured as P178. `Framework: run-retro SKILL.md Step 4b Stage 1`.
- **Which rotation shape to apply to the over-budget briefing topic file.** Not an ask: run-retro Step 3's Tier 3 pass makes rotation silent agent judgement per ADR-044's framework-mediated surface list. Split-by-date applied. `Framework: upstream ADR-044 (Decision-Delegation Contract) framework-resolution boundary; run-retro Step 3 Branch B`. Both bare numbers collide with real local decisions -- local ADR-042 is the newsletter adversarial skeptic gate and local ADR-044 is the cross-edition shape gate -- which is why local ADR-043 and ADR-044 each carry a standing cite-on-first-mention instruction.

## Note on the two transitions

Both the Known Error to Verification Pending move and the Verification Pending to Closed move used the user-confirmed authority path rather than close-on-evidence, because Tom's instruction was the authority. Neither required an ask; `/wr-itil:transition-problem` Step 4 treats an orchestrator supplied the close argument under prior user authorisation as satisfying the close pre-flight.
