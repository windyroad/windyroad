---
'windy-road': patch
---

Trim the Bluesky social post for the "An AI agent deleted production" article so it fits the 300-character limit. The original body was 296 chars; with the 88-character canonical URL plus a blank line it overshot the limit by 30 (Bluesky counts URLs as their full length, unlike Twitter's `t.co` shortening). New body is 199 chars; total post including URL is 289 chars.

Also updates the `wr-blog:create-social-posts` skill: adds step 4.5 (mandatory platform character-limit check before save) and documents per-platform URL-counting behaviour in `assets/social-platform-conventions.md` (Bluesky counts URLs full-length; Twitter shortens via `t.co` to ~23 chars; LinkedIn / Reddit / dev.to are effectively unbounded for our use cases).
