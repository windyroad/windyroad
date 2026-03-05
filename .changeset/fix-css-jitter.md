---
"windy-road": patch
---

Fix page load jitter: replace Google Fonts @import (render-blocking) with next/font/google for zero-layout-shift font loading, and add preload link for hero banner image to prevent background flash.
