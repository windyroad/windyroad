---
"windy-road": patch
---

OG share image text now renders crisp on LinkedIn previews. The
`generate-og-image.mjs` script renders the SVG at 4x density (288 DPI)
and downscales to 1200x630, so text edges stay sharp instead of
pixelating when LinkedIn and other platforms re-encode the preview.
