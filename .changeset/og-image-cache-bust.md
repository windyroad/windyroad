---
"windy-road": patch
---

Renamed the Open Graph share image from `og-image.png` to
`og-image-patch-fitness.png` so LinkedIn treats it as a new URL and
fetches fresh, rather than serving the stale AI-quality image it had
cached. Updated `scripts/generate-og-image.mjs`, homepage metadata,
and `/ai-quality` metadata to reference the new filename.
