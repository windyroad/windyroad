# Problem 177: Two governance gates cannot block, because their reviewer cannot write the verdict they are judged by

**Status**: Open
**Reported**: 2026-08-29
**Priority**: 16 (High), Impact: 4 x Likelihood: 4, derived at capture. Impact is 4 because two of the six governance edit gates cannot withhold their marker on a FAIL: the hook reads a verdict file the reviewer has no tool to write, and its no-file branch allows. That is the same shape this project rated 4 on P165 when ADR-047's only enforcement was disarmed. Not 5 because the reviewer's findings still reach the caller inline, so the failure is lost enforcement rather than lost information. Likelihood is 4 because the disarming is structural and holds on every invocation, while the harm needs a FAIL verdict to be the thing that was suppressed, which is common rather than universal.
**Origin**: internal
**Effort**: S, derived at capture. The fix is one line in each of two agent definitions, adding the `Bash` the sibling jtbd agent already declares. The sizing is for authoring the change, not for landing it. Landing is upstream and is not this loop's to do.

## Description

Observed 2026-08-29 during the P165 iteration. Both the style-guide reviewer and the voice-tone reviewer ended their reports saying they could not write their verdict marker, because their tool set is read-only. The voice-tone reviewer added that any gate polling for the file would not find it.

Verified on disk in the installed cache.

- `~/.claude/plugins/cache/windyroad/wr-style-guide/0.5.3/agents/agent.md` instructs `printf 'PASS' > /tmp/style-guide-verdict` at lines 69 and 73-75, and declares `tools: Read, Glob, Grep`. At line 79 it says "You are read-only. You do not edit files (except writing the verdict file)", which contradicts its own frontmatter.
- `~/.claude/plugins/cache/windyroad/wr-voice-tone/0.7.3/agents/agent.md` instructs the same for `/tmp/voice-tone-verdict` at lines 34 and 78-80, with the same three tools.
- The sibling `wr-jtbd` agent at 0.13.3 carries the same instruction, at lines 134-141, and repeats the same read-only-except-the-verdict-file sentence at line 145. It declares `tools: Read, Glob, Grep, Bash`. The printf is executable there, so its FAIL arm is reachable and its gate is not disarmed. The instruction is the same across all three; the tool grant is what differs.

**The verdict file is load-bearing, and its absence fails open.** `wr-style-guide/0.5.3/hooks/style-guide-mark-reviewed.sh` reads `/tmp/style-guide-verdict` at line 20 and branches on its contents: `PASS` writes the reviewed marker, `FAIL` deliberately writes nothing, and the catch-all `*)` branch, commented "No verdict file - backward compat, allow with marker", writes the marker anyway. `wr-voice-tone/0.7.3/hooks/voice-tone-mark-reviewed.sh` has the same three-way branch on `/tmp/voice-tone-verdict`.

Because the reviewer can never write the file, the catch-all is the only branch these two hooks ever take. The `FAIL` arm is unreachable. So the style-guide and voice-tone edit gates open on every completed review, whatever the review found. That is the opposite of the wr-architect gate, which at 0.21.4 routes `FAIL|""` to the no-marker branch under the comment "Fail closed: issues and unparseable output do not unlock edits".

**A second surface, narrower.** All three hooks, jtbd included, touch `/tmp/<gate>-plan-reviewed-${SESSION_ID}` outside the case statement, so the plan-review gate opens on agent completion regardless of verdict. In the style-guide hook the comment says so deliberately: "No verdict file needed - PostToolUse:Agent is the unforgeable signal." The architect hook gates its equivalent on PASS. Whether that is a defect or a decision belongs to the same upstream conversation, and it is recorded here so the fix is not scoped to the edit gate alone.

This iteration is a live instance rather than a hypothetical: the voice-tone reviewer returned FAIL on ticket prose, with two findings it called blocking, and the gate opened regardless. The findings were acted on because they were read in the reply, not because anything enforced them.

## Symptoms

- A `wr-style-guide:agent` or `wr-voice-tone:agent` report ends by saying it could not write `/tmp/style-guide-verdict` or `/tmp/voice-tone-verdict`, and asks the caller to write the file or to re-run it with write access.
- `ls /tmp/style-guide-verdict /tmp/voice-tone-verdict` finds nothing after a completed review of either kind.
- An edit proceeds after a FAIL verdict from either reviewer, with no block.
- The style-guide agent describes itself as read-only "except writing the verdict file" while declaring no tool that could write one.

## Workaround

Read the reviewer's verdict in its reply and act on it, which is what the gate was meant to make unnecessary. Do not write the verdict file by hand to satisfy the hook: the caller writing `PASS` would forge a marker the review did not produce, and writing `FAIL` to force a block is the same forgery pointed the other way.

## Impact Assessment

- **Who is affected**: every session in a project that installs these two plugins. The gates are advertised as blocking and are not.
- **Frequency**: every invocation of either reviewer. Two of two occurrences on 2026-08-29 reported the same inability.
- **Severity**: two of the six governance edit gates cannot enforce a FAIL. The architect gate fails closed instead, and the jtbd gate is armed because it holds the tool. External-comms and risk-score are unchecked. Separately, the plan-review marker opens on agent completion in all three of the hooks read here, jtbd included.
- **Analytics**: not instrumented.

## Root Cause Analysis

### Preliminary Hypothesis

The agent prompt and the agent frontmatter were written against different assumptions about the agent's tools, and nothing checks them against each other. The hook's catch-all branch then converts that mismatch into silence rather than into a failure, because "no verdict file" was designed to mean "an older agent that predates the protocol" and now also means "an agent that cannot speak the protocol at all".

The two readings are indistinguishable to the hook, which is the same defect class as P165: a check resolving an ambiguity it cannot see, toward the outcome that stops checking.

### Investigation Tasks

- [ ] Confirm the same mismatch across every cached version of both plugins, not only 0.5.3 and 0.7.3, so the fix targets the right range.
- [x] Check the sibling jtbd gate. Checked 2026-08-29: same instruction, `Bash` granted, not disarmed. The remaining gates (external-comms, risk-score) are still to check.
- [ ] Check the external-comms and risk-score gates for the same prompt-versus-frontmatter mismatch.
- [ ] Confirm granting `Bash` is the right fix rather than deleting the instruction. The jtbd agent settles what looked like an open dilemma at capture: the same family already ships a reviewer with `Bash` granted for exactly this, so matching it is following an existing precedent rather than inventing a policy. The remaining question is whether a reviewer meant to be read-only should hold `Bash` at all, which is upstream's to answer.
- [ ] Create a reproduction test.

## Fix Strategy

The fix site is upstream in the `agent-plugins` repository, in `packages/style-guide/agents/agent.md` and `packages/voice-tone/agents/agent.md`, and possibly the plan-marker line in all three mark-reviewed hooks. Nothing in this repository can change it. The likely shape is adding `Bash` to the two agents' `tools:` lists, matching what `wr-jtbd` already ships.

Under ADR-048, ratified 2026-08-08, an upstream pull request raised from the working clone at `~/Projects/agent-plugins` is the default outbound artefact, and a park is a staging state rather than a terminal one. This AFK loop is not authorised to work that clone, so the placement is queued for the maintainer rather than actioned here. This ticket is not parked.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P074, P124, P165

## Related

Captured via `/wr-itil:capture-problem` from the P165 iteration retrospective on 2026-08-29. The capture first recorded that jtbd carried no such instruction; the commit-gate risk pass read the file and refuted it, and the correction is what identifies the tool grant as the whole difference. A bounded grep that found nothing was taken for absence, which is P103.

- **P074** (external-comms marker hooks do not write files after subagent PASS verdicts) is the neighbour, and the mechanism is different. There the hook fails to write a marker after a genuine PASS, so the gate over-blocks. Here the hook writes the marker unconditionally because the verdict it would read cannot exist, so the gate under-blocks. Same surface, opposite failure direction.
- **P124** (governance edit gate markers fail to land after a genuine PASS) is the other over-blocking sibling and covers the session-ID mismatch path.
- **P165** (the stale-verdict check stands down on the very absence it exists to catch) is the same defect class one project over: a check that cannot distinguish two populations and resolves the ambiguity toward silence. The hook's `*)` branch is that branch again, with "no verdict file" standing in for "no digest lines".
