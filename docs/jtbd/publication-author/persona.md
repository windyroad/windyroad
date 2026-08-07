---
name: publication-author
description: Tom, authoring and publishing The Shift and Tokens Spent with an AI pipeline, accountable for what ships under his name
human-oversight: confirmed
oversight-date: 2026-08-07
oversight-note: new persona ratified 2026-08-07; the corpus modelled only readers, so the author side of the publication had no home
---

# Publication Author (Operator)

## Who

Tom Howard, sole author and publisher of The Shift (engineering leaders) and Tokens Spent (developers). Not a reader persona: this is the person on the production side of the same artefacts, accountable for what goes out under his name.

## Why this persona exists

Every job in this corpus models a **reader**. That left the production side undocumented, and the gap kept surfacing in decisions rather than staying theoretical. The newsletter pipeline's gates, its remediation loop, its shape and assembly checks, and most of the problem tickets driving them were justified half on reader benefit and half on reducing the author's review load, with only the first half traceable to a job.

The consequence was not abstract. A gate whose only warrant is "this reduces Tom's review rounds" could not be grounded, so P122 pinned a forward rule blocking any such axis until an author persona was ratified. This persona is what that rule was waiting for.

## Context Constraints

- Publishes weekly, on a fixed day, with a hard external deadline
- Drafting is delegated to an AI pipeline; editorial responsibility is not
- Reads every line before publishing, and intends to keep doing so
- Accepts a review burden he is willing to bear, not one he wants to eliminate
- An external reviewer catches what the pipeline misses, and that round trip is the expensive one
- Publishing surface is manual by decision (ADR-013), so the last check is always human
- Cannot verify what he cannot see: an automated edit to his own prose is invisible unless the pipeline shows him what changed

## What this persona is NOT

- **Not a request to remove the human.** The stated goal is fewer corrections, not no involvement. Automation that hides work from the author fails this persona rather than serving it.
- **Not a licence to ground any convenience feature.** A saved minute is not automatically a job outcome. The test is whether the author's editorial judgement is better spent, not whether less of it is spent.
- **Not the reader's interests by proxy.** Where author convenience and reader benefit conflict, they are different jobs with different outcomes, and the conflict should be visible rather than collapsed.
