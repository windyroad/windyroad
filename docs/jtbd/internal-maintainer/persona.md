---
name: internal-maintainer
description: Tom, operating this repo's governance loop while away from it, and maintaining the tooling that loop runs on, here and upstream
human-oversight: unconfirmed
oversight-note: written 2026-08-08 on Tom's in-session direction ("write the persona"); he has not read it. Ratification is a separate act, pending /wr-jtbd:confirm-jobs-and-personas.
---

# Internal Maintainer (Operator)

## Who

Tom Howard, the person who runs this repo's governance machinery and maintains it. Not a reader persona, and not the publication author: this is the operator of the ITIL problem loop, the retro, the gates, the release path, and the upstream plugins those surfaces are installed from.

## Why this persona exists

The gap has been recorded and direction given, and neither closed it. `docs/briefing/what-you-need-to-know-archive.md` carries the note: *"Internal release-path / maintainer tooling has no documented JTBD persona yet (confirmed-direction to fix, 2026-06-17)... None describes the person who runs `npm run push:watch`, drives release cadence, or operates the AFK work-problems loop, so editing internal tooling gives the jtbd edit-gate nothing to map to."* The same note records Tom's 2026-06-17 direction that an internal-maintainer / AFK-orchestrator persona be authored locally, with its own ID band. Authoring was deferred, was recommended its own ticket, and was never ticketed.

The cost came due on 2026-08-08. Four tickets captured that day (P130, P131, P132, P133) all describe this person hitting something, and all four had to record their anchoring as explicitly unconfirmed because the corpus modelled four personas and none of them was him. The jtbd edit gate reads `docs/jtbd/` before every project change, so an entire class of work in this repo, the class that consumes most of the backlog, was being reviewed against jobs it does not serve.

## One persona, not two

The obvious split is the person who operates the loop against the person who maintains the plugins the loop runs on. The evidence says they are one job, not two, and that splitting them re-encodes a mistake this project has already paid for.

ADR-048 is that mistake, named and corrected. Sixteen tickets sat in `docs/problems/parked/` and fifteen were parked as upstream-blocked, on the belief that a fix living in the plugin repo was somebody else's to make. `gh repo view windyroad/agent-plugins` returns `viewerPermission: ADMIN`, and two working clones already existed on this machine. ADR-048 records the finding plainly: *"the blocker was never permission and never reachability. It was that neither clone had ever been treated as an edit path."* Treating operator and maintainer as different people is the belief that produced that park pile.

The four driving tickets do not split either. P132 is a defect in the loop's own verdict surface whose fix site is upstream. P131 is a defect in a local gate, hit while filing a report upstream, and its own impact section names *"whoever files outbound prose from this repo, including the AFK `/wr-itil:work-problems` orchestrator"*. P130 is a retro detector that fails here because it was written where `packages/` exists. Each one sits on both sides of the proposed line.

The context constraints are also identical on both sides: the same phone, the same scarce hours, the same absence mid-loop. Different repositories are a different tree, not a different person. What genuinely differs, and is recorded as a constraint rather than a persona boundary, is that a fix landing upstream pays a second repo's gates, review latency and release cycle (ADR-048 § Consequences / Bad).

## Context Constraints

- **Frequently absent while the work runs.** The backlog is worked through an AFK orchestrator loop that dispatches subprocess iterations; he leaves, and returns to read summaries. Nobody is watching the console when a surface fails.
- **Reviews and ratifies on a phone.** A single narrow column, no file tree, no repo access, no session context carried over. His own words, quoted in P133: *"If you want me to ratify something you have to give me the file. This is my interface. This is the window you have to work with me with... Think about the small window you have to interact with me with."*
- **Attention is scarce and interruptible.** In the 2026-08-08 session he described himself as *"a human male with a wife, 3 kids and a job, and a house to run"*. This file is the first record of that on disk; it is a context constraint, not colour. Work that needs him is work that waits.
- **Ratification is where he sits on the critical path, and nowhere else.** The project's stance, codified via P101 and stated again in P133, is that humans ratify architecture and product-direction decisions while automated gates and evals carry code quality at AI pace. Human code review is explicitly not the answer to AI-generated code.
- **Owns the upstream plugins, and holds three distinct trees that look alike.** The plugin *cache* (`~/.claude/plugins/cache/...`) is genuinely non-editable; the managed marketplace checkout (`~/.claude/plugins/marketplaces/windyroad`) is a real clone but the wrong tree to branch in; `/Users/tomhoward/Projects/agent-plugins` is the tree to contribute from. Conflating them is what made the parks look terminal.
- **Most of the backlog's fix sites are not in this repo.** 15 of 16 parked tickets were upstream-blocked at the 2026-08-08 count.
- **Runs a consumer repo, against tooling authored in a monorepo.** Detectors and skills that assume a `packages/` layout produce nothing here, and their absence is silent (P130).

## Pain Points

- A surface that cannot run in this repo fails quietly and the loop continues, so a missing measurement reads the same as a clean one (P130).
- A gate blocks on a condition its own message does not name, and the remedy the message prescribes cannot clear it, so the recovery loop is infinite and the diagnosis is misdirected (P131).
- A verdict surface asserts a confident conclusion from syntax that happens to match, and offers cited evidence for it, on a surface where a batch reviewer is invited to trust it (P132). One pass produced 24 candidates and zero survivors.
- Decisions arrive as descriptions of artefacts he cannot open, so the ask either stalls the loop or gets waved through unread (P133).
- Bare `ADR-NNN` citations resolve to a real but unrelated decision, because this repo and the upstream both number from 001, and the error is quiet.
- Parks accumulate and are rediscovered as findings on every loop, spending iteration budget without moving a ticket (ADR-048 § Decision Drivers).

## What this persona is NOT

- **Not a licence to ground any tooling convenience.** A saved keystroke, a tidier output, a faster path is not a job outcome. The test is whether a decision loses its integrity or an unattended iteration loses its output, not whether something is annoying. The failures above qualify because each one is silent, misdirecting, or confidently wrong; ordinary friction is not.
- **Not a request to remove him from ratification.** P133's loud failure is a stalled loop; its quiet failure is a ratification given without a real read, which hollows out the oversight marker the whole ratify-don't-review stance depends on. Automation that makes an ask disappear fails this persona. Automation that makes an ask answerable from a phone serves it.
- **Not a warrant for human code review.** Reserving his judgement for architecture and product direction is the point. Any change that routes code-quality decisions to him is going the wrong way, however well it serves his convenience.
- **Not the readers' interests by proxy.** Internal tooling work and reader-facing work compete for the same finite hours. Where they conflict, they are different jobs with different outcomes and the conflict should be visible rather than collapsed.
- **Not a generic maintainer archetype.** Every constraint above is derived from this repo's own record. A claim about "what maintainers want" that is not traceable to a ticket, retro, briefing entry or decision here does not belong in this persona.
