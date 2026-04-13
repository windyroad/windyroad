---
status: proposed
date: 2026-04-13
decision-makers: Tom Howard
consulted: Voice/tone review agent
informed: n/a
---

# 10. Team voice positioning

## Context and Problem Statement

Windy Road Technology positions as a solo consulting practice with first-person singular voice ("I help", "I partner", "I audit"). The business is pivoting to "patch fitness" consulting (LSM canvas v3) with team-scale delivery (embedded delivery leads, delivery sprints). The solo voice no longer matches the offering. Additionally, the Mythos-era messaging requires a tone register for communicating real external threats without manufacturing urgency.

## Decision Drivers

- LSM canvas v3 pivot to team-scale patch fitness delivery ($5k-$40k engagements)
- Enterprise engineering leaders expect a team behind the service, not a solo practitioner
- External threat messaging (Claude Mythos, AI-powered vulnerability discovery) needs guidance to avoid violating existing "don't manufacture urgency" CTA rules
- Existing blog articles and social posts use "I" voice that should not be retroactively rewritten

## Considered Options

1. Keep solo first-person singular voice ("I")
2. Switch to team first-person plural voice ("we") with Tom Howard as named founder
3. Third-person institutional voice ("Windy Road helps...")

## Decision Outcome

Chosen option: **Option 2**, because team voice matches the delivery model, builds enterprise credibility, and preserves personal authority through Tom Howard as named founder. Third-person feels impersonal for a consulting practice.

### Implementation

1. Service copy uses "we help", "our team", "we've built" across all pages
2. Tom Howard is named as founder in credentials sections
3. Blog articles retain "I" voice (practitioner sharing personal experience)
4. Add an "external threat" tone register to `docs/VOICE-AND-TONE.md`: lead with the visitor's exposure, then factual context. No alarm for its own sake.
5. Existing pages updated to "we" when next modified (or as part of the v3 homepage pivot)

## Pros and Cons of the Options

### Option 1: Keep solo "I" voice

- Good, because it is authentic and established
- Good, because blog readers connect with a named individual
- Bad, because it undersells team-scale delivery offerings
- Bad, because enterprise buyers expect a team behind $20k-$40k engagements

### Option 2: Team "we" voice with named founder

- Good, because it matches the delivery model
- Good, because Tom Howard as named founder preserves personal authority
- Good, because enterprise engineering leaders trust teams over individuals for ongoing work
- Bad, because existing copy across multiple pages needs updating
- Bad, because "we" from a small practice can feel presumptuous if not grounded in specifics

### Option 3: Third-person institutional voice

- Good, because it sounds professional and scalable
- Bad, because it loses the direct, personal tone that differentiates Windy Road
- Bad, because it conflicts with the voice guide's "direct" and "empathetic" principles

## Confirmation

To verify compliance with this decision:

- **Service copy** (homepage, pricing, process, fit check, FAQ, CTA): uses "we help", "we've built", "our team". No "I help", "I partner", "I audit".
- **Metadata** (title, description, OG tags): uses "we" or neutral phrasing. No "I".
- **Credentials sections**: Tom Howard named as founder. Bio narrative uses "Tom Howard founded Windy Road" then "we" for team capabilities. Heading uses "Who we are" or similar, not "Why trust me".
- **Testimonials**: unchanged (third-party quotes referencing Tom by name or "he").
- **Blog articles**: "I" is acceptable for practitioner voice. "We" for service references within articles.
- **FAQ answers**: "we" for describing what Windy Road does.
- **External threat copy**: leads with visitor's exposure, then factual context. No "Don't wait!" urgency.

## Reassessment Criteria

Reassess this decision if:

- The business returns to solo practice without team delivery
- Client feedback indicates the team voice creates a trust gap
- Blog engagement drops after switching service-related posts to "we"

## Consequences

- All new website copy, landing pages, and service descriptions use "we"
- Blog articles can still use "I" (practitioner sharing personal experience)
- The `docs/VOICE-AND-TONE.md` guide must be updated before any new copy is written
- Social media posts shift to "we" for service-related content, "I" remains acceptable for personal observations
- The external threat register enables Mythos-related messaging without violating the existing "don't manufacture urgency" CTA rule
