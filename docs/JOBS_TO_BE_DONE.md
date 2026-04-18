# Jobs To Be Done

Last reviewed: 2026-04-18

This document defines the user personas, jobs, and desired outcomes for windyroad.com.au. The `wr-jtbd:agent` reads this file to review UI changes against documented user jobs.

---

## Personas

### Engineering Leader (Primary)

**Who:** CTOs, Heads of Engineering, VPs of Engineering at mid-to-large organisations.

**Characteristics:**
- Teams actively using AI coding tools (Claude Code, Cursor, Copilot)
- Responsible for delivery pipeline, security posture, and team capability
- Dependency trees they don't fully understand, with libraries nobody chose
- Patch cycles measured in days or weeks, not hours
- Credential-sensitive, want demonstrated proof over theory
- Active on LinkedIn, engage with operational/governance content
- Decision authority over consulting engagements ($9k-$40k range)

**Stack coverage in scope:** JavaScript/TypeScript, Python, Java, .NET, Go, and most modern stacks. The patch fitness methodology (dependency audit, CI gates, remediation pipeline) applies across ecosystems. Past track record includes banking/FS enterprise stacks (Greater Bank, Westpac, Pacific National) where Java and .NET are common.

**What frustrates them:**
- Dependabot PRs piling up with nobody reviewing them
- Patching as a multi-week project requiring committees and manual testing
- AI-accelerated vulnerability discovery making their slow patch cycle a real risk
- No visibility into dependency staleness across the codebase

### Technical Founder (Secondary)

**Who:** Non-technical to semi-technical founders with AI-generated apps in production.

**Characteristics:**
- Built with vibe-coding tools (Bolt, Lovable, Cursor, Claude)
- App works but breaks unpredictably
- Stressed, possibly embarrassed about codebase quality
- Stuck at "how do I fix what I built" stage
- Want pragmatic help, not long-term commitments
- Found via Indie Hackers, Reddit, organic search

**What frustrates them:**
- "Fix one thing, destroy 10 others"
- Scared to touch the codebase
- Security and integration blind spots they don't know how to find
- Unclear whether to hire, rebuild, or bring in expert help

### Developer (Influence, non-commercial)

**Who:** Working engineers for whom AI tools are part of the craft. Individual contributors, tech leads, staff engineers. Not decision-makers on consulting spend, but direct users and assessors of the tools their employers adopt.

**Characteristics:**
- Ship production code day-to-day; AI coding tools are already in the loop (Claude Code, Cursor, Copilot, Aider, local models)
- Technically literate, pattern-match fast, allergic to hype
- Limited time to keep up: a few hours a week between features, reviews, incidents
- Vote with their tokens: try tools, abandon tools, recommend tools to their team
- Active on Hacker News, Reddit (r/LocalLLaMA, r/MachineLearning, r/ExperiencedDevs), technical blogs, YouTube, and the Tokens Spent newsletter on LinkedIn
- Influence adoption upward: what a staff engineer champions often becomes what the Engineering Leader approves

**What frustrates them:**
- Volume and velocity: dozens of "breakthrough" announcements per week, impossible to triage
- Hype vs reality: demos that work in short clips but fall apart on real codebases
- Trust and epistemics: no reliable way to tell shipped-in-production capability from marketing theatre
- Balancing experimentation against delivery: every hour trying a new tool is an hour not shipping

**Relationship to other personas:**

Developers are the upstream influence channel on Engineering Leader tool decisions. When developers converge on a tool through day-to-day use ("tokens-vote"), Engineering Leaders eventually approve it; when developers reject a procurement-mandated tool, that rejection surfaces as attrition or workaround friction. Serving this persona well is how Windy Road earns credibility at the engineer level so that later engagements with their employers are already de-risked. No commercial offer is pitched to this persona directly.

The Developer persona is distinct from Technical Founder: a founder ships a commercial app they own, typically without a team, and needs stabilisation help. A developer is an employed working engineer whose AI-tool choices ripple into their employer's stack.

---

## Jobs

### J1: Awareness (Must-have)

**Job statement:** Help engineering leaders understand their patch fitness exposure when AI-accelerated vulnerability discovery changes the threat landscape.

**Type:** Functional + Emotional

**Job story:** "When I hear about AI models finding decades-old vulnerabilities overnight, I want to understand how exposed my team actually is, so I can assess whether our patch cycle is a real risk before it becomes a breach."

**Desired outcomes:**
- Clear understanding of current dependency staleness across the codebase
- Knowledge of how long it takes the team to get a critical patch to production
- Awareness of forgotten or outdated libraries in the dependency tree
- Emotional shift from "we're probably fine" to "we need to act"

**Current solutions:** Security team triage, quarterly vulnerability scans, hoping for the best

**Screen mapping:** Homepage hero, problems section, countdown component, final CTA

### J2: Engagement (Must-have)

**Job statement:** Help engineering leaders start working on patch fitness through a low-risk entry point that validates capability before a larger commitment.

**Type:** Functional

**Job story:** "When I recognise my team patches too slowly, I want a low-risk first engagement that maps my actual exposure and delivers fixes, so I can validate whether this consultant can help before committing to ongoing work."

**Desired outcomes:**
- Dependency tree fully mapped with staleness measured
- Patch cycle time measured end-to-end
- Riskiest gaps identified and first fixes shipped
- Prioritised remediation roadmap delivered
- Confidence to approve or decline a larger engagement

**Current solutions:** Internal engineering time, hiring a security firm for a one-off audit, ignoring the problem

**Screen mapping:** Pricing section (Patch Fitness Assessment, $9k), process section (Diagnose step), Book a Call CTA

### J3: Evaluation (Important)

**Job statement:** Help engineering leaders evaluate whether outside help can close the patch fitness gap faster than building the capability internally.

**Type:** Functional + Social

**Job story:** "When I'm comparing options for improving our patch velocity, I want to see demonstrated proof that this approach works at scale, so I can justify the spend internally and defend the decision to my peers."

**Desired outcomes:**
- Concrete evidence from comparable organisations (stats, testimonials)
- Clear comparison: external help vs internal build timeline
- Understanding of what "patch fit" looks like when achieved
- Ammunition to justify the engagement to leadership/board

**Current solutions:** Hiring a senior engineer, assigning an internal team, vendor security tools

**Screen mapping:** Credentials section (stats, company names), testimonials, fit check section

### J4: Ongoing Ownership (Important)

**Job statement:** Help engineering teams own continuous patching so they are never dependent on external consultants for routine updates.

**Type:** Functional

**Job story:** "When continuous patching is established in our pipeline, I want my team to own the process end-to-end, so a critical CVE patch deploys like any other change without heroics or external help."

**Desired outcomes:**
- Automated dependency updates flowing through CI without manual intervention
- Team confident merging dependency updates without fear of breakage
- Patch cycle time reduced from weeks to hours
- No dependency on external consultants for routine patching

**Current solutions:** Ad-hoc Dependabot/Renovate setup, manual quarterly updates, reactive patching on alerts

**Screen mapping:** Process section (Embed step), fit check "Wrong Road" (already continuously deploying)

### J5: Founder Stabilisation (Nice-to-have)

**Job statement:** Help technical founders stabilise their vibe-coded app so it stops breaking unpredictably in production.

**Type:** Functional + Emotional

**Job story:** "When my AI-built app keeps breaking and I don't know why, I want an expert to tell me exactly what's wrong and how to fix it, so I can stop being scared to touch my own product."

**Desired outcomes:**
- Prioritised list of what's broken and what to fix first
- Production risk assessment (what could take the app down)
- Clear fix recommendations they can act on
- Emotional relief from knowing the scope of the problem

**Current solutions:** Prompting AI to fix itself, hiring a freelance developer, rebuilding from scratch

**Screen mapping:** `/founders` page, `/vibe-code-audit` page

### J6: Signal from Noise (Must-have for Developer)

**Job statement:** Help working developers cut the week's AI news down to the handful of items that actually matter for people shipping code.

**Type:** Functional

**Job story:** "When dozens of AI announcements hit my feed every week, I want a trusted short list of what is worth my attention, so I can spend my limited learning time on things that might change how I ship, not on hype that will be irrelevant by next month."

**Desired outcomes:**
- A weekly digest short enough to read in under 10 minutes
- Items filtered through a consistent lens (technical, operational, human impact)
- Clear statement of why each item matters to someone shipping production code
- Confidence that items excluded from the list were excluded on purpose, not missed

**Current solutions:** Hacker News doomscrolling, subreddit skims, colleague Slack forwards, paid newsletters of varying quality

**Screen mapping:** The Shift newsletter (LinkedIn), future `/newsletters` archive

### J7: Tool Triage in a Time Budget (Must-have for Developer)

**Job statement:** Help developers decide go/no-go on a specific tool or technique in a single short session, not over multiple evenings.

**Type:** Functional

**Job story:** "When a new tool is getting attention, I want a fast read on whether it is worth a deeper trial in my context, so I can make the go/no-go call in under 30 minutes instead of burning an evening and still being unsure."

**Desired outcomes:**
- Tool-level assessment delivered in under 30 minutes of reading
- Clear statement of what the tool is good at and where it breaks
- Guidance on how to spot-test it against a representative slice of work
- Confidence to skip deep evaluation when the tool is clearly not a fit

**Current solutions:** Skimming project READMEs, watching YouTube demos, asking in Discord, trying it personally and hoping to remember

**Screen mapping:** The Shift newsletter items, future tool-review posts on the blog

### J8: Timing the Category, Not the Tool (Important for Developer)

**Job statement:** Help developers judge when a whole category of capability (agent runtimes, local models, code-review AI) has matured enough to commit real project time to, versus still being early.

**Type:** Functional

**Job story:** "When a category is shifting fast, I want a sense of where it is on the curve, so I can decide whether to commit my next project to it or wait a few months for the dust to settle."

**Desired outcomes:**
- Category-level commentary across a multi-month horizon
- Signals that the category is stabilising (converging interfaces, shrinking churn, repeat adopters)
- Signals that the category is still early (competing standards, rapid version churn, no production case studies)
- Framework for deciding whether to adopt, pilot, watch, or skip

**Current solutions:** Gut feel, waiting for a loud enterprise adopter, following specific analysts on Twitter

**Screen mapping:** The Shift newsletter (pattern items and through-line), occasional long-form blog pieces

### J9: Peer Validation (Important for Developer)

**Job statement:** Help developers confirm their read on a tool or technique against peers whose judgement they trust.

**Type:** Social + Functional

**Job story:** "When I'm on the fence about whether a tool works in real teams, I want to know what engineers like me are actually finding, so my internal pitch to my team isn't resting on marketing claims or a single personal evening of tinkering."

**Desired outcomes:**
- Reference to concrete experiences from working engineers, not vendor case studies
- Named patterns where the tool works well and named patterns where it breaks
- Enough peer signal to argue for or against adoption in a team discussion
- Reassurance that a skeptical read is shared, not contrarian

**Current solutions:** Reddit threads, Discord servers, conference hallway track, trusted individual bloggers

**Screen mapping:** The Shift newsletter (patterns and counter-patterns called out in item bodies), future community surface (if built)

### J10: Experiment vs Delivery Boundary (Important for Developer)

**Job statement:** Help developers protect delivery commitments while still exploring new AI tooling, rather than letting exploration crowd out the work they were hired to ship.

**Type:** Functional + Emotional

**Job story:** "When a new AI tool is hyped, I want a way to decide how much time it is worth spending on it this week, so I can keep shipping my real work without feeling like I'm falling behind the field."

**Desired outcomes:**
- A rule of thumb for how much time per week belongs to experimentation
- Permission to skip this week's hot tool when delivery pressure is high
- A place to park promising-but-not-urgent items for later review
- Reduced fear of missing out when skipping a trend

**Current solutions:** Guilt-driven evenings and weekends, promising the team to "look at it later" then never doing so, or abandoning delivery work to chase trends

**Screen mapping:** The Shift newsletter intro framing, "From Tom" opener when the theme applies

### J11: Trust, Shipped vs Demo (Must-have for Developer)

**Job statement:** Help developers distinguish AI capabilities that work on production codebases from capabilities that only work in short demos or narrow benchmarks.

**Type:** Functional + Social

**Job story:** "When a capability is claimed, I want to know whether engineers have actually shipped it on real production code, so I don't stake a project or a team recommendation on something that only works in a curated demo."

**Desired outcomes:**
- Clear labelling of each claim as demo, benchmark, or shipped-in-production
- Named production adopters where available, or an honest "not yet" when not
- Distinction between "the model can do this" and "the tooling around it is ready"
- A default skeptical stance that nonetheless lets through what is genuinely ready

**Current solutions:** Reading between the lines of launch posts, waiting for postmortems, trusting specific sceptical voices on social media

**Screen mapping:** The Shift newsletter (evidence and attribution under each item; demo-vs-shipped language in pattern items)

---

## Job-to-Screen Mapping

| Route | Primary jobs served | Persona |
|-------|-------------------|---------|
| `/` (homepage) | J1 (Awareness), J2 (Engagement), J3 (Evaluation) | Engineering Leader |
| `/ai-quality` (planned) | J3 (Evaluation), J4 (Ongoing Ownership) | Engineering Leader |
| `/founders` | J5 (Founder Stabilisation) | Technical Founder |
| `/vibe-code-audit` | J5 (Founder Stabilisation) | Technical Founder |
| `/blog` | J1 (Awareness), J3 (Evaluation) | Engineering Leader, Technical Founder |
| The Shift newsletter (LinkedIn, off-site) | J1 (Awareness), J2 (Engagement), J3 (Evaluation) | Engineering Leader |
| Tokens Spent newsletter (LinkedIn, off-site) | J6, J7, J8, J9, J10, J11 | Developer |

---

## Pricing Alignment

| Engagement | Price | Job served | Entry point for |
|-----------|-------|-----------|----------------|
| Patch Fitness Assessment | $9,000 / 1 week | J2 (Engagement) | Engineering leaders wanting proof before committing |
| Embedded Delivery Lead | $20,000/month | J4 (Ongoing Ownership) | Teams ready for hands-on capability building |
| Delivery Sprint | $40,000 / 4 weeks | J4 (Ongoing Ownership) | Teams wanting a specific deliverable shipped |
| Vibe Code Audit | $9,000 / 1 week | J5 (Founder Stabilisation) | Founders with broken apps |

**Note:** The Developer persona has no pricing row by design. Developer-serving work (The Shift newsletter, future developer-oriented blog posts and community surfaces) is an influence and community investment, not a direct commercial offer. Commercial return, if any, is indirect: developers influence their employers' tool and consulting choices, so credibility earned here compounds into Engineering Leader engagements over time.
