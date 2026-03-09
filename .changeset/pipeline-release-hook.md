---
"windy-road": minor
---

feat: add release confirmation hook and update pipeline discipline article

- Add `permissionDecision: "ask"` hook for `npm run release:watch` to require human confirmation before releasing
- Update pipeline discipline article with new "Confirming before releasing" section, system flow diagram, stack disclosure, CLAUDE: convention explanation, failure modes guidance, and "Adapting this for your project" section
- Update hero and code card SVGs to show all three intercept levels (deny, deny, ask)
- Extend voice-and-tone gate to cover SVGs in public/img/social/
- Add Dev.to publishing script (scripts/publish-devto.sh)
