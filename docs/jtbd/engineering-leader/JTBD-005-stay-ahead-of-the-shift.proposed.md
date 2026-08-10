---
status: proposed
human-oversight: unconfirmed
prior-oversight-date: 2026-07-12
oversight-invalidated: 2026-08-10 (outcome 1 retired and replaced; see the amendment below)
job-id: stay-ahead-of-the-shift
persona: engineering-leader
date-created: 2026-07-10
priority: must-have
type: functional
screens:
  - The Shift newsletter (LinkedIn)
  - / (homepage)
---

# JTBD-005: Stay Ahead of the Shift

## Job Statement

When AI engineering moves faster than I can track, and every week brings new models, tools, and capability shifts, I want a trusted weekly signal on what changed and what it means, so I can make better tool and delivery calls for my team without doomscrolling to stay current.

## Desired Outcomes

- A read whose length is earned by what it returns
- What changed at the frontier, filtered for what matters to teams shipping production code
- The "so what" for delivery, tooling, and risk decisions, not just the news
- Confidence I am not missing a shift my team should be acting on

## Persona Constraints

- Accountable for delivery, security posture, and team capability, with little time to keep up personally
- Credential-sensitive: cannot forward content that implies their own team is behind
- Active on LinkedIn, engage with operational and governance content
- Making tool and delivery calls that compound across the whole team

## Current Solutions

Scattered LinkedIn feed, vendor announcements, internal Slack forwards, occasional deep dives that go stale fast.

## Amendment 2026-08-10: outcome 1 retired, replaced by proportionality

Outcome 1 read "A weekly read short enough to finish in a few minutes" until 2026-08-10. Tom retired it during the Issue 17 finalise run, in his words, "leave the length, abandon the promise".

**What forced the question.** The newsletter editor gate returned a defect against Issue 17: roughly 2,700 words is about a twelve-minute read, so the edition failed outcome 1 by a factor of three. It had been failing it for some time. The choice was to cut roughly 700 words out of every edition, which means dropping or collapsing an item, or to stop making a promise the publication does not keep. Tom chose the second, on the grounds that the depth is the product.

**Why it is not simply deleted.** Three ratified editor axes hang off this outcome: `fold-compression`, `signpost-promises-match-contents` and `edition-internal-consistency`. Under ADR-044 an applied edit to reader-facing prose has to be job-grounded, so deleting outcome 1 with nothing in its place would silently demote all three from remediating to advisory. That is the failure ADR-043's reassessment criterion already names: the fix for an ungrounded axis is to add the outcome, not to leave the axis hanging.

**What the replacement changes.** The editor stops asking whether an edition comes in under a number and starts asking whether its length is justified by what the reader gets. A long edition that earns its length passes; a short one padded with restatement does not. That keeps all three axes able to require a fix, which a bare time budget scoped only to total words never really did: none of the three is about total length, they are about whether particular passages waste the reader.

**Reciprocal changes.** `.claude/agents/wr-newsletter-editor.md` lines 52 and 80, ADR-020 lines 152, 185 and 186, and ADR-043 lines 121 and 156 all quote or calibrate against the retired wording and are updated to match. The editor agent's line 79 is the developer arm citing JTBD-200's under-ten-minutes budget and is deliberately untouched: that is a different job and its own ratification.

Human oversight: unconfirmed. Tom directed the retirement in-session; ratify via `/wr-jtbd:confirm-jobs-and-personas`.

## Notes

Added 2026-07-10 per ADR-041, which retires the consulting funnel and repurposes the site as a hub for The Shift. This is the Engineering Leader equivalent of the Developer persona's JTBD-200 (Signal from Noise). Pending human ratification via /wr-jtbd:confirm-jobs-and-personas.
