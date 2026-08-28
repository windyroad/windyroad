# Problem 174: Briefing rotation scores how often an entry is used, never what rediscovering it costs

**Status**: Open
**Reported**: 2026-08-29
**Priority**: 6 (Medium), Impact: 2 x Likelihood: 3, derived at capture from the description. Impact is 2 because the cost is wasted agent effort on a maintainer surface, with no reader, build or release-path effect. Likelihood is 3 because it fires only when a rotated trap's condition is next met, which is sporadic rather than per-session, but the archive now holds several such entries and each is a live trap.
**Origin**: internal
**Effort**: M, derived at capture. The fix is a second retention axis in run-retro's Step 1.5 scoring plus the Step 3 rotation branches that consume it, both in the upstream `wr-retrospective` SKILL. Larger than P130's S because it changes a heuristic rather than substituting a path, and the axis has to be defined before it can be scored.
**WSJF**: 3.0 = (6 x 1.0) / 2

## Description

The briefing's Tier-3 rotation decides what stays in the session-start surface by signal score, and signal score measures one thing: whether the entry was used this session. Every entry decays by 1 each retro and gains 2 when cited. An entry you need twice a year therefore decays out of the loaded file and into an archive that nothing loads at session start, which is exactly backwards for an entry whose whole value is being present the rare time you walk into the thing it warns about.

Observed as a recurrence on 2026-08-29. The trap: the external-comms gate scrapes the draft body out of the command string, so a `--body-file` call leaves it hashing an empty draft while the reviewer hashes the real body, the keys never meet, and the gate re-blocks after a genuine PASS with a message telling you to run the review you just ran. That was documented on 2026-08-08 in `docs/briefing/what-will-surprise-you-archive.md` after being hit filing agent-plugins#413. It was re-hit on 2026-08-29 filing agent-plugins#453, costing three wasted reviewer dispatches, because the entry had rotated to the archive and the archive is not loaded at session start.

The rotation pass recorded its own reasoning at the time, which is the clearest statement of the gap: line 52 of that archive says the entry is archived "**by date, not staleness** (the trap is live)". The rotation knew the entry was still true and still valuable and moved it anyway, because the heuristic it runs has no axis that could express "rarely needed, expensive when needed".

Frequency-of-use and cost-of-rediscovery are different axes. The scoring rule reads only the first.

## Symptoms

- A true, live warning sits in an archive file while the failure it describes is re-encountered at full cost.
- The retro summary reports the rotation as a clean Branch B action, because by its own scoring it was one.
- Re-promoting the entry by hand, as this iteration did, only resets the decay clock; the entry will decay out again on the same schedule.

## Workaround

Promote the entry back into the loaded topic file by hand when the trap is re-hit, and say in the entry itself that it is a trap rather than an observation. Done on 2026-08-29 for the `--body-file` entry. This does not survive the next few retros.

## Impact Assessment

- **Who is affected**: any agent session that walks into a documented trap whose entry has decayed out of the loaded surface.
- **Frequency**: per trap, when its condition is next met. Twice for this one trap in three weeks.
- **Severity**: Minor. Wasted agent effort and round-trips; no reader, build or release-path effect.
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

Step 1.5's scoring table has exactly three events, all about use: signal +2 when cited, noise -1 when loaded but not cited, decay -1 every cycle regardless. Nothing in the table can distinguish an entry that was not needed this session from an entry that must be present for the session where it is needed. Step 3's rotation branches then consume that single score, so the gap is inherited rather than introduced there.

### Investigation Tasks

- [ ] Decide what the second axis is. Candidates: an explicit entry kind (trap vs observation) set when the entry is written, a cost-of-rediscovery field, or a decay exemption for entries whose text names a reproducible failure and its recovery.
- [ ] Check whether the archive holds other live traps in the same position, and how many.
- [ ] Confirm the fix site is the upstream `wr-retrospective` run-retro SKILL and nothing local.

## Fix Strategy

(deferred to investigation)

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P131, P136, P150, P156

## Related

Captured via `/wr-itil:capture-problem` during the retro of the P130 iteration (2026-08-29). Anchoring in prose per local convention: JTBD-400 (Trust what the loop did while I was away), Internal Maintainer persona, ratified 2026-08-09. The job's first outcome is that the loop's surfaces tell the operator what they need; an archived live trap is that surface withholding it.

**Hang-off check.** The `wr-itil:hang-off-check` subagent was dispatched on three candidates sharing the `docs/briefing/` and Tier-3-rotation signals, and returned PROCEED_NEW. P136 (rotation strips entries the Critical Points still point at) is a referential break, detectable by grepping rotated entries against the README; here nothing points at the archived entry, so that detector reads clean. P150 (per-file budget with no aggregate) is byte accounting rather than entry selection, though this ticket does challenge one premise it rests on, that archives are cheap to hold because they are not session-start loaded. P156 (absence claims never re-verified) is the closest sibling and shares the locus, Step 1.5's single-axis scoring, but its missing axis is truth and its harm is a false claim reaching every session, where this one's missing axis is cost and its harm is a true claim reaching no session.

**The knowledge existed twice and reached the session neither time.** P131 (External-comms gate cannot see a --body-file body, so the block becomes unclearable after a genuine PASS) is open and owns the gate defect this ticket uses as its worked example. So on 2026-08-29 the trap was written down in two places, an open ticket and an archived briefing entry, and the session walked into it anyway. The two tickets are not duplicates and the division is clean: P131 owns the gate, this ticket owns the retention rule that let the warning decay out of the surface the session actually loads. The hang-off dispatch did not surface P131, because its signals are gate-shaped rather than briefing-shaped; the cross-reference came from the commit-gate risk scorer instead.

**Cluster note for the next review pass.** The subagent observed that P136, P156 and this ticket look like three members of an unwritten parent: the session-start surface is maintained by several rules that each score one axis, and none of them scores whether a session ends up correctly oriented.

**Correction owed to P136, verified on disk 2026-08-29.** P136's line 18 says the 2026-08-09 rotation "was reverted in the same turn and only the new entry was kept, so no broken pointer was committed". The `### Rotated 2026-08-09 (Tier 3 budget pass, Branch B)` block and its three entries are present in `docs/briefing/what-will-surprise-you-archive.md` at line 50 today. Surfaced by the hang-off subagent and confirmed by direct read; recorded here rather than edited into P136, which is a separate ticket's business.
