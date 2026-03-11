# Wardley Map

![Wardley Map](wardley-map.png)

## Analysis

### Differentiation

Articles and Hook Gates are the only components a competitor cannot buy off the shelf. Hook Gates depend on a hook API that is not yet stable or formally versioned, making the pattern vulnerable to upstream changes. Articles (Custom-Built, 0.24) carry their own fragility: they depend on a single author, so any disruption to writing cadence causes content decay and breaks the traffic-to-consulting loop. Protect Hook Gates by keeping the pattern portable across API versions, and protect Articles by maintaining a backlog of draft outlines so output can resume quickly after any interruption.

### Evolution

Hook Gates sit at Genesis (0.17, evolving toward Custom-Built) as the pattern expands to new enforcement domains. Articles are early Custom-Built (0.24), maturing from experimental posts into a coherent series. Article investment has a multiplier effect because Service Pages depend on Articles for traffic: each article strengthens both the content arm and the sales pipeline. Prioritise article topics that demonstrate hook-based enforcement in new domains, and watch for the point where Hook Gates patterns stabilise enough to extract into reusable tooling.

### Risk

Hook Gates depend on Claude Code (Product, 0.55), which is controlled by Anthropic and has no equivalent with the same hook API; if the hook API changes, Hook Gates need rewriting and published articles referencing specific hook behaviour become outdated -- both differentiators are hit simultaneously. Next.js (Commodity, 0.78) poses a commodity-layer risk: if `npx next export` emits a deprecation warning or the framework's licence changes from MIT, all pages need migration to a plain static-site generator, and the switching cost is high due to App Router lock-in. Internally, if fewer than one new post appears within any rolling 60-day window -- measured by counting publish-date values in article frontmatter under `src/articles/` -- the reinforcing loop between practice and content stalls. Monitor the internal cadence trigger first, since it is the only risk the project owner directly controls.

### Decisions

Articles and Hook Gates packaging compete for the same resource: time. Packaging should wait until the hook-gate pattern appears in a second, independent repository with a different tech stack -- until then, articles have higher leverage because they create the audience and credibility that would make a packaged product viable. If no such external adoption has occurred within twelve months of the first published article, revisit whether the pattern's value is too context-specific to package.
