# Problem 107: Assistant routes free-text input collection through AskUserQuestion instead of presenting per-item copyable blocks

**Status**: Open
**Reported**: 2026-06-28
**Priority**: 3 (Medium) -- Impact: 3 x Likelihood: 1 (deferred -- re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: M (deferred -- re-rate at next /wr-itil:review-problems)

## Description

When the assistant is blocked needing free-text input from the user (canonical URLs the environment cannot resolve, tokens, IDs), it routes the request through `AskUserQuestion` (whose "Other" field is awkward to paste into) and only provides per-item copyable code blocks after several follow-up corrections.

Observed in the Issue 11 `/wr-newsletter` prep run (2026-06-28): the URL-verification gate could not auto-resolve three citations (Reuters returns 401, Bloomberg serves a bot wall, DuckDuckGo HTML serves a challenge page), so per the P091 unresolvable-URL fallback the assistant asked the user for canonical URLs. It first used `AskUserQuestion` (options Agree/Adjust/Drop) expecting the user to paste URLs into the "Other" free-text field, which did not capture. Tom then had to correct three times: "you need to give me the urls in a format I can copy", then "you keep forgetting that", then "I want a separate block for each so I can paste straight into the browser". Only on the third correction did the assistant present one single-click copyable code block per URL.

Desired behaviour: when collecting free-text the user must supply (URLs, tokens, IDs), present each item as its own single-click copyable code block up front, and accept a plain-message paste back. Do NOT route free-text collection through `AskUserQuestion` (which is for choosing among bounded options, not for collecting free-form text the user pastes back), and do NOT give a single multi-line block the user has to paste elsewhere and re-split. The friction is doubly notable because the underlying task (P091) is itself the "ask the user for unresolvable URLs" path, so the presentation format of that ask is on the hot path of a documented workflow.

## Symptoms

(deferred to investigation)

## Workaround

(deferred to investigation)

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: (deferred to investigation)
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Investigate root cause (is this a memory-layer discipline fix, like P050/P061, or a tooling change?)
- [ ] Decide the canonical interaction contract: per-item copyable code block + plain-message paste for free-text collection; AskUserQuestion reserved for bounded option choices
- [ ] Consider whether the P091 unresolvable-URL fallback should itself specify the copyable-block presentation (it currently mandates a batched AskUserQuestion)

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

- **Reported upstream**: https://github.com/windyroad/agent-plugins/issues/324 (2026-07-03)

- P091 (closed) -- newsletter should ask user for unresolvable source URLs. P091 establishes WHEN to ask (the fallback); P107 is about HOW to present that ask (copyable blocks vs AskUserQuestion Other). P091's fallback currently mandates a batched AskUserQuestion, which is the surface this ticket flags.
- P034 (closed), P068 (parked) -- adjacent URL-resolution / canonical-URL tickets; distinct from this presentation-format concern.
- P050, P061 -- prior assistant-interaction discipline fixes shipped as memory-layer levers; likely the same fix class.
- captured via /wr-itil:capture-problem; expand at next investigation.

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/324
- **Reported**: 2026-07-03
- **Template used**: structured default (problem-shaped)
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes
