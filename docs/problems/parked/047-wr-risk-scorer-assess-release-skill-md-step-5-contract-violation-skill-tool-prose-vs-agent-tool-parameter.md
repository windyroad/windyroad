# Problem 047: wr-risk-scorer:assess-release SKILL.md step 5 contract violation (Skill-tool prose vs Agent-tool parameter)

**Status**: Parked
**Reported**: 2026-05-02
**Origin**: internal
**Priority**: 12 (High). Impact: Significant (4) x Likelihood: Possible (3)
**Effort**: S
**WSJF**: 0 (parked, excluded from ranking)

## Description

The `wr-risk-scorer:assess-release` SKILL.md step 5 contains a contract violation in its delegation prose. The text reads:

> "Invoke the pipeline subagent via the `Skill` tool:"
>
> ```
> subagent_type: wr-risk-scorer:pipeline
> prompt: <constructed assessment prompt from step 4>
> ```

`subagent_type:` is an Agent-tool parameter, not a Skill-tool parameter. The Skill tool takes `skill:` and `args:`. Following the prose verbatim (Skill-tool with `subagent_type:`) fails with "Unknown skill: wr-risk-scorer:pipeline" because there is no SKILL named `wr-risk-scorer:pipeline` (only the AGENT exists).

Source SKILL lives in the plugin cache at `~/.claude/plugins/cache/windyroad/wr-risk-scorer/0.4.2/skills/assess-release/SKILL.md`.

## Symptoms

Live evidence, 2026-05-02 session:

- Iter 3 attempted Skill-tool invocation per the SKILL prose verbatim and got "Unknown skill: wr-risk-scorer:pipeline". Corrected to Agent tool.
- The orchestrator's Step 6.5 release-cadence check hit the same contract violation when the bypass-marker TTL expired (P028 surface).
- Two attempts to satisfy the push gate via direct Agent-tool invocation succeeded at producing risk scores BUT the PostToolUse:Agent hook (which writes the bypass markers) requires the assess-release SKILL invocation chain to fire; the marker-writing path is gated on the skill-context, not bare Agent invocation. Required: invoke the assess-release SKILL via Skill tool, which internally invokes the pipeline subagent via Agent tool, which triggers PostToolUse:Agent → marker write.
- The mismatch between SKILL prose and actual invocation shape produces silent failures in callers who follow the prose, plus confusion when the marker doesn't appear.

## Workaround

Invoke the Agent tool with `subagent_type: wr-risk-scorer:pipeline` directly when only a score is needed. Invoke the Skill tool with `skill: wr-risk-scorer:assess-release` when the bypass marker is also needed (the skill wraps the agent invocation in the right surface for PostToolUse:Agent to fire).

## Impact Assessment

- **Who is affected**: Every caller of the assess-release SKILL who reads the prose verbatim. Currently includes orchestrator skills (`/wr-itil:work-problems` Step 6.5, `/wr-itil:manage-problem` Step 12) and on-demand assessments.
- **Frequency**: Every assessment dispatch from prose-following callers. Several times per AFK loop.
- **Severity**: Significant. Failed dispatch produces wrong outputs (no score, no marker), wastes turns on diagnosis, and in this session blocked the push:watch drain twice before it was resolved.
- **Analytics**: N/A.

## Root Cause Analysis

### Pattern

The SKILL prose was likely copied from a different invocation pattern (Agent-tool delegation) without adjusting the wrapping verb (Skill vs Agent). The result is a "Skill tool with Agent-tool parameter" Frankenstein that no caller can faithfully execute.

The fix is single-line prose: change "via the `Skill` tool" to "via the `Agent` tool" in step 5, since the parameters listed (`subagent_type:`) are correct for Agent-tool delegation. Alternative fix: leave "via the `Skill` tool" and change the parameters to `skill:` / `args:`. but that path is incorrect because `wr-risk-scorer:pipeline` is an agent name, not a skill name.

### Fix Strategy

Single-line prose fix in `~/.claude/plugins/cache/windyroad/wr-risk-scorer/0.4.2/skills/assess-release/SKILL.md` step 5: change "Invoke the pipeline subagent via the `Skill` tool:" to "Invoke the pipeline subagent via the `Agent` tool:". The parameters listed (`subagent_type: wr-risk-scorer:pipeline`) match Agent-tool semantics and are correct.

Also worth checking: any sibling SKILLs in the wr-risk-scorer plugin that use the same boilerplate (e.g. assess-wip, assess-external-comms) for the same drift.

### Verification check (per P045 discipline)

Per P045 verify-upstream-placement-before-propagating:
1. **Domain fit**: prose-fix to assess-release SKILL.md is `wr-risk-scorer`'s domain. Yes, fit.
2. **Placement authority**: this project is the wr-risk-scorer plugin's consumer, not maintainer. Recommendation only; the maintainers decide where the fix lands. Tom's direction was: open local ticket + report upstream.

### Investigation Tasks

- [ ] Confirm the prose-vs-parameter mismatch on line 5 by reading the actual SKILL.md (verify-before-asserting per P032).
- [ ] Grep sibling assess-* SKILLs in wr-risk-scorer for the same boilerplate.
- [ ] Report upstream via /wr-itil:report-upstream after this ticket lands.
- [ ] Once upstream prose ships: verify the new prose works on next assess-release invocation in this project.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P028, P046, P045

## Related

- P028 (risk-scorer 30-min TTL expired during long-running orchestrator turns): same plugin, different surface (TTL vs delegation prose).
- P046 (risk scorer treats changesets as queued when underlying commits are already on origin): same plugin, different surface (scoring logic vs delegation prose).
- P045 (assistant accepts ticket Fix Strategy upstream-placement framing without questioning): the discipline applied to classify this fix.
- `~/.claude/plugins/cache/windyroad/wr-risk-scorer/0.4.2/skills/assess-release/SKILL.md` step 5 (the fix site).
- ADR-015 (on-demand assessment skills): the parent decision describing the SKILL-vs-subagent delegation pattern.
- **Reported upstream**: https://github.com/windyroad/agent-plugins/issues/110 (2026-05-02)

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/110
- **Reported**: 2026-05-02
- **Template used**: problem-report.yml
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes

## Parked

- **Reason**: upstream-blocked. The genuine fix lives in the `wr-risk-scorer` plugin SKILL at `~/.claude/plugins/cache/windyroad/wr-risk-scorer/<version>/skills/assess-release/SKILL.md` step 5, inside the `windyroad/agent-plugins` repo. The local repo has no `packages/wr-risk-scorer/` directory; this project is a downstream marketplace consumer of `@windyroad/wr-risk-scorer`. A consumer cannot edit the cached SKILL.md without losing the change on next plugin update, so the only durable fix is upstream. The agent-side workaround (invoke the `Agent` tool directly with `subagent_type: wr-risk-scorer:pipeline` when only a score is needed; invoke the `Skill` tool with `skill: wr-risk-scorer:assess-release` only when the `PostToolUse:Agent` bypass-marker write is also needed) is operator discipline rather than codified policy and cannot be enforced locally because the dispatch path is the cached SKILL itself.
- **Verified persistence**: latest cached plugin version `0.11.2` still ships the contract violation at `skills/assess-release/SKILL.md` line 67: `Invoke the pipeline subagent via the \`Skill\` tool:` followed by `subagent_type: wr-risk-scorer:pipeline` on line 70. `subagent_type:` remains an Agent-tool parameter, not a Skill-tool parameter; following the prose verbatim still fails with "Unknown skill: wr-risk-scorer:pipeline". Verified 2026-05-30 by reading the cached file. Sibling drift also persists: `skills/assess-external-comms/SKILL.md` line 75 (`Invoke the subagent via the \`Skill\` tool:`) and `skills/assess-wip/SKILL.md` line 45 (`Invoke the wip subagent via the \`Skill\` tool:`) carry the same boilerplate mismatch. `skills/assess-inbound-report/SKILL.md` is clean (no matching prose). Per the Fix Strategy "Also worth checking" follow-up, the upstream fix should cover all three sibling SKILLs.
- **Upstream issue status**: `windyroad/agent-plugins#110` OPEN as of 2026-05-30 (last updated 2026-05-15T05:37:01Z, no labels). Filed 2026-05-02 via problem-report.yml template; cross-reference confirmed in the "Reported Upstream" section above. No fix committed upstream yet.
- **Un-park trigger**: a new `wr-risk-scorer` plugin release lands in `~/.claude/plugins/cache/windyroad/wr-risk-scorer/` whose `skills/assess-release/SKILL.md` step 5 either (a) changes `via the \`Skill\` tool:` to `via the \`Agent\` tool:` (Option 1, recommended; the listed `subagent_type:` parameter matches Agent-tool semantics), or (b) keeps the `Skill` tool wrapper and changes the parameters to `skill:` / `args:` (Option 2; incorrect on its face because `wr-risk-scorer:pipeline` is an agent name, not a skill name, so this path would also need the plugin to ship a sibling SKILL alias). Verify by re-reading the cached SKILL in the new version. Sibling SKILLs `assess-external-comms` (line 75) and `assess-wip` (line 45) should receive the matching prose fix in the same release; verify in the new cache version. Close P047 once a session exercising `/wr-risk-scorer:assess-release` (or sibling) dispatches the pipeline subagent via prose-following without hitting "Unknown skill".
- **Local impact while parked**: agent-side discipline (the existing Workaround section) remains the operating contract. When calling assess-release / assess-wip / assess-external-comms, dispatch via the `Agent` tool with `subagent_type: wr-risk-scorer:pipeline` (or sibling agent) directly when only a score is needed; route via the `Skill` tool only when the `PostToolUse:Agent` bypass-marker write must fire. AFK orchestrators that hit "Unknown skill: wr-risk-scorer:pipeline" should recognise it as the SKILL-prose-vs-Agent-parameter mismatch and switch to direct Agent-tool dispatch.
- **Composes with**: P021 (parked 2026-05-30, upstream `windyroad/agent-plugins` `wr-architect` plugin hook, upstream-blocked); P022 (parked 2026-05-30, upstream `wr-architect` plugin hook); P027 (parked 2026-05-30, upstream `wr-itil` plugin SKILL.md); P031 (parked 2026-05-02, upstream `wr-itil` plugin SKILL.md); P033 (parked 2026-05-30, upstream `wr-itil` plugin SKILL.md); P042 (parked 2026-05-30, upstream `wr-jtbd` plugin hook). All six share the marketplace-consumer-cannot-edit-cached-plugin pattern; P047 extends the surface from `wr-architect` + `wr-itil` + `wr-jtbd` to `wr-risk-scorer`.
- **Date parked**: 2026-05-30
