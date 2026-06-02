---
status: "proposed"
first-released:
date: 2026-05-02
human-oversight: confirmed
oversight-date: 2026-05-30
decision-makers: [Tom Howard, Claude]
consulted: [wr-architect agent]
informed: []
amended-by: [039-per-date-subdir-layout-for-published-newsletter-editions]
---

# Newsletter reviews and meta content live in sibling files, not inline in the brief

## Amendment Note (2026-06-02, ADR-039)

ADR-039 (per-date sub-directory layout for published newsletter editions) refreshes the example paths used in this ADR. The sibling-file pattern itself (reviews and meta content live as siblings of the brief, not inline) is unchanged. Affected examples in this ADR: line 26 (Context), line 86 (Consequences, Good), line 111 (More Information, Aligns with). Where the prose cites `src/newsletters/published/leader/2026-04-24.linkedin.md` (flat), the post-ADR-039 layout resolves the same example to `src/newsletters/published/leader/2026-04-24/2026-04-24.linkedin.md` (per-date sub-directory). The example paths in the prose below are left as written for historical-record continuity; the sibling-file pattern they document still holds under the new layout.

## Context and Problem Statement

The `/wr-newsletter` skill step 16 mandates that two classes of artefact live INLINE in the saved brief draft, separated only by `---` rules from the body:

1. **Review blocks** (voice, content-risk, sw-critic, editor, Wardley critic), with the four-axis CONTENT_RISK block, CRITIC_REVIEW blocks, EDITOR_REVIEW block, and Wardley CRITIC_REVIEW block all stacked at the bottom of the brief.
2. **LinkedIn share post + image notes + alt text + posting notes**, meta content for the publication-day workflow that is not part of the published newsletter.

Both create real failure modes:

- **Inline reviews → confirmation bias on next reviewer**. ADR 016/018/020 establish fresh-context subagents specifically to avoid bias on the verdict-generation step. Embedding prior verdicts in the same file the next reviewer reads silently undermines the design.
- **Inline meta content → accidental-publication risk**. Copy-paste of the brief body, automation that pulls the file body, or simple human error can include the LinkedIn post or image-description meta content in the published newsletter.

The published convention already follows the sibling-file pattern: `src/newsletters/published/leader/2026-04-24.linkedin.md` is a sibling file to `2026-04-24.md`, not inline. The skill mandates the inline shape; the publish convention contradicts it.

P038 (reviews-inline → bias) and P041 (LinkedIn-inline → accidental publish) are companion tickets.

## Decision Drivers

- **Bias mitigation**: the fresh-context principle established by ADR 016/018/020 must extend to the persistence layer, not just the generation layer.
- **Publication safety**: meta content must be physically separated from the brief body so accidental inclusion is impossible.
- **Convention alignment**: the publish convention already uses sibling files (`<date>.linkedin.md`, capture-transcript per ADR 019). The skill prose should match.

## Considered Options

1. **Move reviews and LinkedIn-post + image notes to sibling files; brief contains only frontmatter + body + CTA**. New companion files: `<date>.reviews.md` (all review blocks + Map Delta), `<date>.linkedin.md` (LinkedIn post + image notes + alt text + posting notes). Brief frontmatter cross-references via `companion-files:`.
2. **Inline reviews; sibling LinkedIn**. Solves the publication-safety problem but not the bias problem.
3. **Sibling reviews; inline LinkedIn**. Solves the bias problem but not the publication-safety problem.
4. **Status quo**. Both failure modes recur every edition.

## Decision Outcome

Chosen option: **1. All reviews and meta content live in sibling files. Brief contains only frontmatter + body + CTA**.

The brief file (`<date>.md`) structure becomes:

```
---
phase: <prep|finalise|full>
[...other frontmatter...]
cover-image: <path>
companion-files:
  capture-transcript: <date>.capture.md   # ADR 019
  reviews: <date>.reviews.md              # this ADR
  linkedin-post: <date>.linkedin.md       # this ADR
---

# <H1>

*<subtitle>*

[brief body]

---

[CTA + URL]
```

The reviews sibling file (`<date>.reviews.md`) carries all review blocks: Voice Review, Content Risk Review, Critic Review (Newsletter), Editor Review, Critic Review (Wardley Artifacts), Map Delta. The audit trail is preserved; the brief is not contaminated.

The LinkedIn sibling file (`<date>.linkedin.md`) carries the post body, image description, alt text, and posting notes. Frontmatter declares `post-type: linkedin-share` and `companion-to: <date>.md`.

The capture-transcript sibling (`<date>.capture.md`) stays as ADR 019 already specifies.

The skill's step 16 (across prep / finalise / full phases) is amended to write three sibling files instead of one inline-everything file.

## Consequences

### Good

- Future review subagents reading the brief see only the brief; no bias surface.
- LinkedIn post and image meta content cannot accidentally enter the published brief body.
- Audit trail is more navigable: each artefact class has its own file with its own purpose.
- Convention aligns with the existing publish-convention (`<date>.linkedin.md` already in `published/leader/`).

### Bad

- Four files per edition instead of one (brief + reviews + linkedin + capture). Slightly higher file-management overhead.
- The `/wr-retrospective:run-retro` and `/wr-itil:manage-problem` patterns that grep `docs/` may need to learn the sibling-file shape; minimal change.

### Neutral

- The brief frontmatter's `companion-files:` block becomes the entry point for navigating an edition's full artefact set.

## Confirmation

- (1) `/wr-newsletter` step 16 (all three phases) writes three sibling files; brief contains only frontmatter + body + CTA.
- (2) Edition 4's published `<date>.md` brief contains no `## Voice Review`, `## Content Risk Review`, `## Critic Review`, `## Editor Review`, `## Map Delta`, `## LinkedIn Post`, `## Image`, or `## Notes for posting` sections.
- (3) Edition 4's `<date>.reviews.md`, `<date>.linkedin.md`, `<date>.capture.md` siblings exist with the correct content.
- (4) Spot-check on the next critic round (sw-critic re-running on the post-edit brief): the agent's transcript shows it does not see prior verdicts in the brief file.

Reassessment: if the four-file pattern produces friction (e.g. user constantly forgetting which file is which), reconsider consolidating reviews back inline with explicit fresh-context isolation at the agent level.

## More Information

- Companion problem tickets: P038 (reviews-inline → bias), P041 (LinkedIn-inline → accidental publish).
- Amends: ADR 016 (sw-critic), ADR 018 (content-risk), ADR 020 (editor), extends fresh-context discipline to persistence.
- Aligns with: ADR 019 (capture-transcript sibling-file pattern).
- Aligns with: published convention `src/newsletters/published/leader/2026-04-24.linkedin.md`.
