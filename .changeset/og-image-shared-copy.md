---
"windy-road": patch
---

OG share image now matches the homepage hero. Fixes P006: the Open
Graph image was still showing the old AI-quality tagline because the
SVG text in `scripts/generate-og-image.mjs` was hardcoded and never
got updated when the homepage pivoted to the patch fitness narrative.

Permanent fix: hero headline and OG subtitle now live in
`src/lib/siteCopy.mjs` as a single source of truth. Both the React
homepage and the OG image generator import the same constants, so
the share preview cannot drift from the visible hero again. Reproduction
test in `src/lib/siteCopy.test.ts` asserts both consumers use the
shared module.

After deploy, run https://windyroad.com.au through the LinkedIn Post
Inspector to flush LinkedIn's OG image cache.
