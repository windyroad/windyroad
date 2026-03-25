# LSM Validation Board: Windy Road

A Lean Startup Machine canvas for validating the Windy Road AI delivery
consulting business. Based on the LSM validation board framework by
Trevor Owens.

## Customer Hypothesis (v1, PIVOTED)

~~**Early-stage startup founders** (seed to Series A) who have used AI
coding tools to build and ship their MVP, and are now experiencing
production instability as they onboard real users.~~

**Why this was invalidated:** IH research (Experiment 2) showed that
early-stage founders' #1 pain is getting users, not fixing code. Code
quality is a step-3 problem; most IH founders are stuck at step 2
(distribution). Voder AI customer discovery independently reached the
same conclusion. r/vibecoding (89k members) had no recent "help me"
posts from founders. LinkedIn blog posts about vibe-coding got 0
conversions from founders. The target customer doesn't congregate
where we looked, and may not prioritise this problem enough to pay.

## Customer Hypothesis (v2, CURRENT)

**Engineering leaders** (Heads of Engineering, CTOs, VPs of Engineering)
at mid-to-large organisations whose teams are shipping code with AI
agents (Claude Code, Cursor, Copilot) and need governance, quality
gates, and risk controls in their pipeline.

**Evidence:** LinkedIn post about pipeline risk scoring (2026-03-24)
got 496 impressions, 3,141 views, 14 likes from IT leaders, 2
comments, and 1 repost in 21 hours. This is organic engagement from
the target audience without paid promotion. The content that resonated
was not "your app is broken" but "give your AI agents a risk budget
and gates that change how they work."

## Problem Hypothesis (v1, PIVOTED)

~~Founders cannot confidently ship updates to their AI-generated
codebase.~~

## Problem Hypothesis (v2, CURRENT)

Engineering leaders **cannot trust what their AI agents push to
production** because:

1. AI agents ship code that looks right but introduces subtle
   defects, security holes, and architectural drift
2. Teams are shipping 3x faster but quietly doubling their defect rate
3. Junior developers don't know enough to push back on AI suggestions
4. There are no quality gates specifically designed for AI-generated
   code in the pipeline

## Solution Hypothesis (v1, PIVOTED)

~~A $5k Vibe Code Audit for founders.~~

## Solution Hypothesis (v2, CURRENT)

An **embedded delivery lead** ($10k/month) who implements AI-specific
pipeline guardrails: risk scoring, quality gates, review processes,
and test coverage rules. The product is demonstrated in public
through LinkedIn content showing the actual system working (dogfooding).

Entry point: A **Quick Wins Week** ($5k, 1 week) to diagnose AI tool
usage, identify gaps, and implement the first round of guardrails.

**Key differentiator:** Not consulting theory. Working, demonstrated
pipeline controls that the AI agent responds to autonomously. "The
gate doesn't just stop bad pushes. It changes how the agent works."

---

## Riskiest Assumptions

Ordered from riskiest (test first) to least risky.

### 1. Problem awareness: "Do they know they have a problem?" VALIDATED

**Assumption:** Founders with vibe-coded apps recognise that production
instability is a codebase quality problem (not just "bugs to fix") and
that it will get worse without intervention.

**Status: VALIDATED (2026-03-24).** See Experiment 1 results below.
Founders on Indie Hackers and Reddit are loudly describing this exact
problem. r/vibecoding alone has 89k members. The dominant narrative has
shifted from "look what I built in a weekend" to "how do I fix what I
built in a weekend."

**Next riskiest assumption to test: #4 (Channel reachability).** The
problem is real, but our content is reaching developers, not the
founders who are posting on IH and Reddit.

### 2. Solution-seeking behaviour: "Are they looking for help?"

**Assumption:** Founders who recognise the problem actively look for
outside expertise rather than hiring a full-time engineer, continuing to
prompt through it, or ignoring it.

**Why this is risky:** Even if the problem is recognised, the default
response may be to hire (perceived as cheaper long-term) or to keep
using AI tools (perceived as faster). A consulting engagement is not the
obvious first move.

**Falsified if:** Founders say "I'd just hire someone" or "I'd ask
ChatGPT to fix it" when presented with the scenario.

### 3. Willingness to pay: "Is $5k the right price point?"

**Assumption:** $5k is low enough to be a no-brainer for a funded
startup founder, but high enough to signal serious expertise and filter
out tyre-kickers.

**Why this is risky:** Too high and founders delay or look for free
alternatives. Too low and it attracts the wrong customers or
undervalues the work.

**Falsified if:** Conversion rate is near zero at $5k, or the audience
overwhelmingly says "I'd pay $X" where X is significantly different.

### 4. Channel reachability: "Can we reach them?"

**Assumption:** These founders are reachable through content marketing
(blog posts, social posts about vibe coding risks), founder communities
(Indie Hackers, X/Twitter, LinkedIn), and word of mouth.

**Why this is risky:** If the target customer doesn't consume this type
of content or hang out in these communities, the entire go-to-market
motion fails regardless of product-market fit.

**Falsified if:** Content about vibe coding risks gets no engagement
from founders (only engagement from other developers/consultants).

### 5. Diagnostic value: "Is a report enough?"

**Assumption:** A prioritised diagnostic report (without implementation)
is valuable enough on its own to justify $5k, and naturally leads to
follow-on remediation work.

**Why this is risky:** Founders may want "just fix it" rather than a
report. A diagnostic-only offering may feel like paying to learn about
more problems.

**Falsified if:** Prospects consistently ask "but who fixes it?" and
decline when told the audit is diagnostic only, or if audit clients
don't convert to remediation engagements.

---

## Experiments

### Experiment 1: Problem Awareness (Testing Assumption #1)

#### Prior evidence (LinkedIn + website, last 30 days as of 2026-03-24)

Blog posts shared on LinkedIn with zero conversions (no Book a Call,
no Vibe Code Audit purchases).

| Page | Views | Clicks | Nav CTA click % |
|------|-------|--------|-----------------|
| Homepage | 67 | 111 | 4.50% (Book a Call) |
| "Stop your AI agent from ignoring your architecture" | 28 | 16 | 6.25% |
| "Enforcing voice and tone with Claude Code hooks" | 80 | 341 | 0.29% |

**What this tells us:**
- Traffic is very low (67 homepage views in 30 days).
- The voice/tone article gets the most views (80) but near-zero CTA
  engagement (0.29%). This article resonates with *developers* building
  AI tooling, not *founders* with broken apps.
- The architecture article has the fewest views (28) but the highest
  CTA engagement (6.25%), suggesting that audience (people thinking
  about AI architecture decisions) is closer to the target customer.
- Homepage hero copy ("Your vibe-coded app is in production. Something
  keeps breaking.") gets 7.21% engagement, but the CTAs below it
  ("Book a Call" at 1.80%, "Vibe Code Audit: $5k") have a steep
  drop-off. Visitors read the problem statement but do not take action.

**Interpretation:** The content is attracting developers and AI
enthusiasts, not founders with burning production problems. The people
who land on the homepage recognise the language but are not the ones
experiencing the pain. This is a **channel/audience mismatch** more
than a problem-awareness failure. We cannot yet distinguish between
"founders don't have this problem" and "we're not reaching founders."

#### Experiment 1a: Watering hole research (2026-03-24)

**Goal:** Determine whether founders are publicly describing this
problem, in their own words, without prompting.

**Method:** Search Indie Hackers and Reddit for organic posts from
founders describing vibe-coded apps breaking in production.

**Pass criteria:** 10+ posts from founders describing the problem.
**Fail criteria:** Fewer than 5, or all from developers, not founders.

#### Experiment 1a results: PASS (overwhelmingly)

**Indie Hackers findings (10 relevant posts):**

| Post | Who | Date | Key quote |
|------|-----|------|-----------|
| "The 70% Problem" | Addy Osmani (Google) | 2024-12 | "house of cards code," "demo-quality products with broken edge cases" |
| "The Reality of Vibe Coding" | Daniel Bentes (founder, ObjectiveScope) | 2025-03 | "Beyond ~5,000 lines, AI loses track of system context." Files over ~500 lines "hazardous to modify" |
| "Learning to Code from Scratch with AI" | Kaia Colban (non-technical founder) | 2025-09 | "Boom. Everything broke." Needed 3 full rebuilds |
| "My Experience Using AI to Code" | Dimitri (non-coder) | 2025-01 | Apps "60-80% fleshed out." Wanted "to toss my computer out the window" |
| "Are Lovable / Bolt Good Enough for Real Apps?" | Rohan Chaubey (founder) | 2025-09 | Unexpected Twilio bills, security vulnerabilities, "backend wires dangling unplugged" |
| "Why AI Can Speed Up Coding but Slow Down Debugging" | IH editorial | 2025-12 | Teams ~20% slower resolving runtime bugs. Half of AI fixes introduce secondary problems |
| "Most AI Products Fail After They Start Working" | Dr Shahroze Khan | 2025-12 | "Trust doesn't disappear overnight. It leaks." |
| "The Hidden Bugs Killing Your AI Product" | Aytekin Tank (founder) | 2025-10 | "One broken link breaks everything" |
| "I Am Frustrated with No-Code. I Am Done." | @techPackets | 2022-08 | 6 months wasted. Pre-vibe-coding but same pattern |

**Reddit findings (massive signal):**

- r/vibecoding has **89k members** with ~16% monthly growth
- r/VibeCodeDevs has ~15k members
- Combined: 100+ new posts daily

Notable horror stories from Reddit and adjacent communities:

| Story | Who | Problem |
|-------|-----|---------|
| "Leo" (viral thread) | Non-technical founder | SaaS hacked within 2 days: API keys maxed, paywall bypassed, DB filled with junk |
| "A Vibe Coded SaaS Killed My Team" | Cendyne (developer) | Broken modals, inactive search, orders without payment, CCPA/ADA violations |
| Career-planning SaaS | SF founder using Windsurf | API keys exposed client-side. API bill so severe he needed OpenAI to forgive it |
| Teacher platform | Non-technical builder | No rate limiting, unsecured API keys, admin protected only by frontend routes. "But it works fine!" |
| Proof Editor (Every) | Dan Shipper (CEO, Every) | Vibe-coded app went viral then crashed. 4,000 docs inaccessible. Week to stabilise |
| Groove pivot | Alex Turnbull (Groove founder) | "VibeCoding didn't get us there. Only real engineering could." |

**Market data:**
- ~10,000 startups attempted production apps via AI; ~8,000 reportedly
  need rebuilds ($50K-$500K each)
- AI coding platform traffic fell 76% in 12 weeks
- Apple cracking down on vibe-coded apps in App Store (March 2026)
- CodeRabbit study: AI co-authored code had 1.7x more major issues,
  2.74x more security vulnerabilities

**Language founders actually use:**
- "house of cards code"
- "fix one thing, destroy 10 others"
- "the 70% problem" / "60-80% fleshed out"
- "Boom. Everything broke"
- "I'm under attack" / "I'm not technical so this is taking me longer"
- "overconfident junior dev with amnesia"
- "nobody wants to talk about maintenance"
- "hazardous to modify"
- "trust leaks"

**Conclusion:** Problem awareness is not the bottleneck. Founders
know they have this problem. Many are actively seeking solutions.
The IH and Reddit communities are where they congregate.

Our current content (LinkedIn blog posts about Claude Code hooks
and architecture decisions) is reaching developers, not these
founders. The problem is validated; the channel is wrong.

**Assumption #1 status: VALIDATED.**
**New riskiest assumption: #4 (Channel reachability).**

---

### Experiment 2: Channel Reachability (Testing Assumption #4)

Now that we know the problem is real and founders talk about it
on IH and Reddit, the question is: can we reach them there?

**Prior evidence:**
- LinkedIn blog posts: 0 conversions. Audience is developers.
- Our blog content (hooks, architecture) is too technical for
  non-technical founders who say "everything broke."

**The language gap:** Our site says "quality gates," "CI/CD
guardrails," "architectural decisions." Founders say "fix one
thing, destroy 10 others," "house of cards," "scared to touch it."
The homepage hero is close ("Something keeps breaking. You're scared
to touch it.") but the rest of the site speaks developer, not
founder.

#### Experiment 2a (original plan): Reply to founder posts

**Original method:** Find 5 recent IH/Reddit posts where a founder
describes their vibe-coded app breaking. Reply with genuine help.

**Status: BLOCKED (2026-03-25).** Browsed r/vibecoding sorted by
New. Found no recent "help me" posts from founders. The subreddit
(89k members) is predominantly developers sharing tools, tips, and
wins. Founders whose apps broke may have already left, hired
someone, or given up. They post once when it breaks, then they're
gone.

**What this tells us:** r/vibecoding is not where founders in pain
congregate. The horror stories we found in our research (Experiment
1a) were older posts, viral incidents, or thought leadership. The
day-to-day subreddit is developers learning, not founders stuck.
This narrows the channel hypothesis: Reddit may not be the right
channel for reaching founders with this problem.

#### Experiment 2a (revised): Post offering free code reviews

**Goal:** Instead of replying to existing posts, be the post.
Test whether founders on IH respond to a direct offer of help.

**Method:** Post on IH offering free 20-min code reviews for
founders with vibe-coded apps that are breaking in production.

**Post copy** (honest, aligns with windyroad.com.au offering):
> "I'm a delivery engineer with 25 years experience. I've shipped
> 3 products from scratch and built the kind of quality gates and
> guardrails that AI-generated codebases are usually missing.
> I help founders stabilise vibe-coded apps that are breaking in
> production. If yours is struggling, I'll do a free 20-min code
> review. No pitch, just a genuine look at what's going on. DM me."

**Why this copy works:**
- Every claim is true and verifiable on windyroad.com.au
- "25 years experience" and "3 products from scratch" match site
- "quality gates and guardrails" matches site language
- "help founders stabilise vibe-coded apps" is what the site offers
- Free 20-min review leads naturally to the $5k Vibe Code Audit
  if the founder wants to go further
- Does not claim to have already reviewed vibe-coded apps

**Where to post:**
- IH main feed (indiehackers.com)
- Also consider: IH vibe coding hub, r/SaaS, X/Twitter

**Tracking table:**

| Platform | Posted | Date | Responses | Calls booked | Notes |
|----------|--------|------|-----------|-------------|-------|
| IH | [ ] | | | | |
| r/SaaS | [ ] | | | | |
| X/Twitter | [ ] | | | | |

**Pass criteria:** 3+ founders respond across all platforms,
and at least 1 takes the call.
**Fail criteria:** 0 founder responses within 7 days.

**Timeline:** Post by 2026-03-26, assess by 2026-04-02.

**What this tests simultaneously:**
- Channel reachability (#4): Can we reach founders on IH/Reddit?
- Solution-seeking (#2): Do they want outside help?
- Diagnostic value (#5): Is a free code review compelling?
- Language fit: Does founder-language copy outperform our current
  developer-language content?

**Status: SUPERSEDED (2026-03-25).** Customer hypothesis pivoted from
founders to engineering leaders. See Experiment 3 below.

---

### Experiment 3: IT Leader Pivot (Testing new Customer Hypothesis v2)

#### Evidence that triggered the pivot

1. **IH "building vs getting users" post (2026-03-21):** Founders'
   #1 pain is distribution, not code quality. Code quality is a
   step-3 problem; most IH founders are stuck at step 2.
2. **Voder AI research:** Independent customer discovery agent
   reached the same conclusion.
3. **r/vibecoding (2026-03-25):** No recent "help me" posts from
   founders despite 89k members. Subreddit is developers learning,
   not founders in pain.
4. **IH posting gate:** Cannot create posts without earning
   privileges through commenting first, limiting experiment velocity.
5. **LinkedIn risk-scoring post (2026-03-24):** 496 impressions,
   3,141 views, 14 likes from IT leaders, 2 comments, 1 repost in
   21 hours. Organic engagement from engineering leaders without
   any paid promotion.

#### What the LinkedIn data tells us

The content that resonated was not about broken apps or founder
pain. It was about **engineering governance of AI agents**:
- "I gave my AI agent a risk budget"
- "Every push gets scored before it leaves the machine"
- "The gate doesn't just stop bad pushes. It changes how the agent
  works"

This is a message for **engineering leaders managing teams**, not
founders building solo. The audience is already on LinkedIn. The
content already works. The channel is already proven.

#### New riskiest assumptions (for v2 hypothesis)

1. **Willingness to pay:** Will engineering leaders pay $5-10k/month
   for pipeline guardrails they could theoretically build themselves?
2. **Decision authority:** Can the people engaging on LinkedIn
   actually approve a consulting engagement, or do they need to
   sell it internally?
3. **Conversion path:** Does LinkedIn engagement (likes, comments)
   convert to calls and then to paid engagements?

#### Experiment 3a: LinkedIn content doubling down

**Goal:** Test whether continued LinkedIn content about AI pipeline
governance generates inbound enquiries from engineering leaders.

**Method:** Publish 3 more LinkedIn posts over the next 2 weeks
showing the pipeline risk system in action. Each post should
demonstrate a different aspect (risk scoring, quality gates,
agent behaviour change). End each with "Book a call or DM me."

**Tracking:**

| Post topic | Date | Impressions | Likes | Comments | DMs | Calls |
|------------|------|-------------|-------|----------|-----|-------|
| Risk budget + gate (done) | 2026-03-24 | 496 | 14 | 2 | | |
| | | | | | | |
| | | | | | | |

**Pass criteria:** 1+ DM or call booking from an engineering leader
within 2 weeks.
**Fail criteria:** High engagement (likes) but zero DMs or calls
after 3 posts.

**Timeline:** 2 weeks (assess by 2026-04-08).

#### Experiment 3b: Homepage swap (2026-03-25)

**Goal:** Align the website with the pivoted customer hypothesis.
LinkedIn traffic from engineering leaders should land on the right
message, not a founder-focused "your vibe-coded app is broken" page.

**Method:** Promote AI Teams page content to the homepage. Move
the founder-focused content to /founders as a secondary path.

**Changes made:**
- AI Teams content now serves at / (homepage)
- Previous homepage moved to /founders
- /ai-teams redirects 301 to /
- Nav updated: "AI Teams" link becomes "Founders"
- Root metadata updated for engineering leader audience

**What to track:**
- Homepage engagement in Clarity (compare to baseline 67 views/month)
- CTA click rates on new homepage vs old (baseline: 4.50% Book a Call)
- Whether LinkedIn traffic converts better when landing on /
- /founders page traffic (organic discovery of secondary path)

**Pass criteria:** Homepage CTA engagement rate improves above 4.50%
baseline, or 1+ call booked from homepage within 2 weeks.
**Fail criteria:** Engagement drops below baseline after 2 weeks.
