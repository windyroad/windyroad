---
"windy-road": minor
---

Homepage and pricing improvements for the patch fitness narrative.

**Countdown component**
- Added a discrete probability slider so visitors can explore Manifold Markets prediction stops by cumulative probability percentage.
- Slider stops are positioned proportionally to their actual cumulative probability with subtle dot indicators on the track.
- Filters out the "or later" catch-all bucket and any answers whose midpoint date has passed.
- Countdown displays the exact Manifold midpoint date in DD MMM YYYY format ("16 Jul 2026") rather than inventing end-of-month semantics.
- Attribution clarified: "chance a Mythos-level model ships by {date}" with correct a/an grammar for any percentage.
- Loading skeleton matches the loaded layout so the hero no longer shifts when the API responds.
- Reduced-motion variant still renders the slider, just without the ticking countdown.

**Pricing**
- Raised 1-week engagement pricing across the site from $5,000 to $9,000 (Vibe Code Audit, Patch Fitness Assessment, Quick Wins Week).
- Synchronised the `/founders` PricingSection with homepage figures so Embedded Delivery Lead and Delivery Sprint match.
- Tightened spacing between pricing card outcome line and Book a Call button.

**Other homepage polish**
- Replaced the regulatory-compliance testimonial with Sidney Shek (Staff Engineer, Stripe) endorsing Continuous Delivery work, a closer fit to the patch fitness narrative.
- Expanded the "What stack do you work with?" FAQ to include Java, .NET, and Go alongside JavaScript/TypeScript and Python.
- Added a downward chevron scroll cue at the bottom of the hero for visitors on viewports where the hero fills the screen.

**Docs and process**
- Updated Jobs To Be Done with explicit stack coverage in scope for the Engineering Leader persona.
- Created problem tickets P001 (next build hangs locally), P002 (hero overflow), P003 (slider alignment, closed), P004 (slider position), P005 (no stop indicators).
