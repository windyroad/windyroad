# RFCs

Request-for-Comments records for this project. An RFC captures a planned change big enough to design before building: the work it covers, the problem(s) that drive it, and the tasks that deliver it. RFCs sit between problem tickets (`docs/problems/`) and decisions (`docs/decisions/`) in the Problem-RFC-Story framework that the `@windyroad/itil` suite provides (upstream ADR-060).

This tier is adopted by this project as a consumer of the upstream framework. The authoritative skills are `/wr-itil:capture-rfc` (lightweight capture) and `/wr-itil:manage-rfc` (full intake and lifecycle). This README is the body-shape contract those skills bind against; do not invent a parallel scheme here.

## When an RFC

- A planned change that needs design before implementation (multi-step work, a new surface, a cross-cutting refactor).
- The change traces to at least one existing problem ticket (see the I1 invariant below).

For a one-off bounded fix with no design surface, a problem ticket plus an ADR (if a decision is involved) is enough; an RFC is not required.

## The I1 invariant

Every RFC MUST trace to at least one problem ticket in `docs/problems/`. `/wr-itil:capture-rfc` hard-blocks on a missing or unresolved problem trace: open the driving problem first (`/wr-itil:capture-problem`), then capture the RFC against it. The trace is recorded in the RFC frontmatter `problems:` list and mirrored back as a `## RFCs` row on each driving problem ticket.

## File naming

```
docs/rfcs/RFC-<NNN>-<kebab-title>.<state>.md
```

Note the literal `RFC-` prefix on the filename (unlike ADRs and JTBDs, which use a bare `<NNN>-` number). `<NNN>` is a zero-padded three-digit sequence; `<state>` is the lifecycle suffix below. The upstream skills glob `docs/rfcs/RFC-<NNN>-*.md`, so the prefix is load-bearing.

## Lifecycle

Five states, advanced via `/wr-itil:manage-rfc <NNN> <state>`:

```
proposed -> accepted -> in-progress -> verifying -> closed
```

The filename suffix tracks the state: `.proposed.md`, `.accepted.md`, `.in-progress.md`, `.verifying.md`, `.closed.md`. A captured RFC starts at `proposed`; `## Scope` and `## Tasks` are deferred placeholders until the `accepted` transition fleshes them out.

## RFC body structure

`/wr-itil:capture-rfc` writes this shape; keep it consistent so the lifecycle skills bind cleanly.

```markdown
---
status: proposed
rfc-id: <kebab-slug>
reported: <YYYY-MM-DD>
human-oversight: unconfirmed
decision-makers: [<name>]
problems: [P<NNN>, P<NNN>, ...]
adrs: []
jtbd: []
stories: []
---

# RFC-<NNN>: <Title>

**Status**: proposed
**Reported**: <YYYY-MM-DD>
**Problems**: <P<NNN> [, P<NNN>, ...]>
**ADRs**: (none)
**JTBD**: (none)

## Summary

<one-paragraph statement of the change>

## Driving problem trace

<for each P<NNN>: one line linking the RFC scope to that problem's symptom or root-cause finding>

## Scope

(deferred -- populate at /wr-itil:manage-rfc accepted transition)

## Tasks

- [ ] (deferred -- populate at /wr-itil:manage-rfc accepted transition)

## Commits

(maintained automatically by the commit-message RFC trailer hook)

## Related

(captured via /wr-itil:capture-rfc; expand at next /wr-itil:manage-rfc invocation)
```

## Index maintenance

This README's RFC index (when RFCs exist) is refreshed by `wr-itil-reconcile-rfcs docs/rfcs` and by `/wr-itil:manage-rfc review`, following the same deferred-refresh contract as the problems README: `/wr-itil:capture-rfc` does not refresh this README inline; the next manage-rfc or reconcile pass does.

## Current RFCs

(none yet -- this tier was just established)
