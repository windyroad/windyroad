# Wardley Map

![Wardley Map](wardley-map.png)

## Analysis

### Differentiation

Articles and Hook Gates are the two genesis/custom components. Articles are original insights about AI-assisted software delivery that no one else is publishing. Hook Gates (architect, voice-and-tone, accessibility enforcement) are a novel four-hook pattern with no off-the-shelf equivalent. These two reinforce each other: the gates produce the practices, the articles document them.

### Evolution

Hook Gates are moving from Genesis (0.14) toward Custom-Built (0.30) as the pattern gets documented in articles and reused across projects. Articles are evolving from Genesis (0.22) toward Custom-Built (0.32) as the content matures from experimental posts into a recognisable body of work. If others adopt the hook gate pattern, it moves further toward Product.

### Risk

Next.js (Commodity, 0.78) is low risk but high switching cost due to static export dependency. Netlify (Commodity, 0.90) is easily replaceable with any static host. Service Pages (Product, 0.48) follow standard consulting sales patterns and depend on the Blog driving traffic to convert. The main risk is underinvesting in Articles, since they are the primary differentiator and traffic driver.

### Decisions

Blog and Service Pages serve different strategic roles. Blog is the differentiator (Custom-Built); Service Pages are standard sales (Product). Investment in articles has higher strategic leverage than investment in sales page refinement. The gap between Hook Gates (Genesis) and the rest of the map suggests the pattern could become a distributable product (a Claude Code plugin or template repo) if it continues to mature.
