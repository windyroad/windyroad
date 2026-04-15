---
"windy-road": patch
---

Reverted the OG image filename back to `og-image.png` from
`og-image-patch-fitness.png`. The cache-bust rename did not clear
LinkedIn's cached preview. Clean filename is simpler to maintain
and LinkedIn's cache will expire on its own schedule.
