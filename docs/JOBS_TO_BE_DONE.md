# Jobs To Be Done

Last reviewed: 2026-04-11

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

---

## Job-to-Screen Mapping

| Route | Primary jobs served | Persona |
|-------|-------------------|---------|
| `/` (homepage) | J1 (Awareness), J2 (Engagement), J3 (Evaluation) | Engineering Leader |
| `/ai-quality` (planned) | J3 (Evaluation), J4 (Ongoing Ownership) | Engineering Leader |
| `/founders` | J5 (Founder Stabilisation) | Technical Founder |
| `/vibe-code-audit` | J5 (Founder Stabilisation) | Technical Founder |
| `/blog` | J1 (Awareness), J3 (Evaluation) | Both |

---

## Pricing Alignment

| Engagement | Price | Job served | Entry point for |
|-----------|-------|-----------|----------------|
| Patch Fitness Assessment | $9,000 / 1 week | J2 (Engagement) | Engineering leaders wanting proof before committing |
| Embedded Delivery Lead | $20,000/month | J4 (Ongoing Ownership) | Teams ready for hands-on capability building |
| Delivery Sprint | $40,000 / 4 weeks | J4 (Ongoing Ownership) | Teams wanting a specific deliverable shipped |
| Vibe Code Audit | $9,000 / 1 week | J5 (Founder Stabilisation) | Founders with broken apps |
