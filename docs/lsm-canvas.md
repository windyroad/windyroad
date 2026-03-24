# LSM Validation Board: Windy Road

A Lean Startup Machine canvas for validating the Windy Road AI delivery
consulting business. Based on the LSM validation board framework by
Trevor Owens.

## Customer Hypothesis

**Early-stage startup founders** (seed to Series A) who have used AI coding
tools (Cursor, Claude Code, Copilot) to build and ship their MVP, and are
now experiencing production instability as they onboard real users.

## Problem Hypothesis

These founders **cannot confidently ship updates** to their AI-generated
codebase because:

1. They don't understand what the AI wrote well enough to debug it
2. They have no test coverage, quality gates, or CI/CD guardrails
3. Every change risks breaking something in production, slowing them down
   at the exact moment they need to move fast (post-launch, pre-Series A)

## Solution Hypothesis

A **fixed-scope diagnostic engagement** ($5k Vibe Code Audit) that gives
the founder a clear, prioritised report of what's broken, what's risky,
and what guardrails to implement, so they can make an informed
build-vs-buy decision on remediation without committing to a large
retainer upfront.

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

#### Experiment 2a: IH/Reddit direct engagement (low effort)

**Goal:** Get in front of founders where they already are, using
their language, and see if they respond to an offer of help.

**Method:** Reply to 5 IH posts where a founder describes a
vibe-coded app breaking. Offer genuine help (not a sales pitch).

**Reply template** (adapt per post):
> "This matches what I've been seeing. I help founders stabilise
> vibe-coded apps (25 years in delivery engineering). If you want
> a second pair of eyes on what's breaking, I'm happy to do a free
> 20-min code review. No strings. DM me if interested."

**Target posts (identified 2026-03-24):**

| # | Post | Why this one |
|---|------|-------------|
| 1 | [Notion for Songwriters in a Vibe-Coded Standstill](https://www.indiehackers.com/post/notion-for-songwriters-in-a-vibe-coded-standstill-615be642a6) | Founder stuck. App has input bugs. Title says "standstill." |
| 2 | [I hit the "Credit Limit" wall with Vibe Coding](https://www.indiehackers.com/post/i-hit-the-credit-limit-wall-with-vibe-coding-here-is-how-i-fixed-it-e46fc970a5) | "Backend wires dangling unplugged, data were dummy, basic functionality broken." |
| 3 | [Vibe coding has a security problem](https://www.indiehackers.com/post/tech/vibe-coding-has-a-security-problem-here-are-two-solutions-vLxyPTrTlZVwDo76oqvr) | Builder got hacked (exposed API keys, bypassed paywall). Commenters asking for help. |
| 4 | [Changed my mind on vibe coding](https://www.indiehackers.com/post/changed-my-mind-on-vibe-coding-H0FoahUxjxAsUCgW4Z0H) | Shifted view after experience. Reply opportunities in comments. |
| 5 | [The Reality of Vibe Coding](https://www.indiehackers.com/post/the-reality-of-vibe-coding-47c65d45d6) | Data-driven post about context collapse after 5,000 lines. Highly engaged thread. |

**Tracking table:**

| # | Replied | Date | Response? | Call booked? | Notes |
|---|---------|------|-----------|-------------|-------|
| 1 | [ ] | | | | |
| 2 | [ ] | | | | |
| 3 | [ ] | | | | |
| 4 | [ ] | | | | |
| 5 | [ ] | | | | |

**Pass criteria:** 2 out of 5 take the call.
**Fail criteria:** 0 responses, or responses only from developers.

**Timeline:** 1 week (reply by 2026-03-25, assess by 2026-03-31).

**What this tests simultaneously:**
- Channel reachability (#4): Are founders on IH/Reddit reachable?
- Solution-seeking (#2): Do they want outside help?
- Diagnostic value (#5): Is a free code review compelling?

#### Experiment 2b: Write one IH post in founder language

**Goal:** Test whether content written in founder language (not
developer language) generates engagement and inbound interest.

**Method:** Write a short IH post titled something like: "I've
reviewed 10 vibe-coded apps this month. Here's what keeps
breaking." Use the language from the research (house of cards,
the 70% problem, fix one thing destroy 10 others). End with an
offer for a free code review.

**Pass criteria:** 5+ founders respond or DM within 1 week.
**Fail criteria:** Post gets engagement only from developers,
or fewer than 3 founder responses.
