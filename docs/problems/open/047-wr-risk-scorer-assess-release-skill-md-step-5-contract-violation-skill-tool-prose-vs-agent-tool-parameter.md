# Problem 047: wr-risk-scorer:assess-release SKILL.md step 5 contract violation (Skill-tool prose vs Agent-tool parameter)

**Status**: Open
**Reported**: 2026-05-02
**Priority**: 12 (Significant). Impact: Significant (4) x Likelihood: Possible (3)
**Effort**: S
**WSJF**: 12.0 = (12 x 1.0) / 1

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
