# Problem Backlog

> Last reviewed: 2026-08-08 **P099 fix released (top of queue at 16.0, now clear); P122 fix released; P108 was a live blocker and is fixed; P119 transition caught; P087 and P127 re-rated up** -- P122 (no gate owns within-edition assembly) moved to Verification Pending: the editor gained a Step 4.6 whole-edition read, the structure lint gained a duplicate-citation check, and three decisions were ratified to authorise it. P087 (compendium em-dashes) re-rated 8.0 to 10.0: it fired five times on 2026-08-07, twice within one ADR's create-then-ratify lifecycle, and the hand-repair does not survive the next edit to the same ADR, so it is a per-edit tax rather than a one-time scrub. P127 (unverified claims) re-rated to likelihood 5 on two further instances during the P122 build, and its WSJF line was arithmetically wrong: it stated 12.0 where 12 x 1.0 / 2 is 6.0, so the effort divisor had never been applied. Corrected to 7.5 at the new severity. P119 was also found sitting in Known Error with its fix shipped and test-pinned since 2026-08-03; the transition had been missed and is now made. P108 was worse than a missed transition: step 7 pinned the wardley converter at version 0.1.0, which is no longer installed (0.1.4 and 0.1.7 are), so the next run would have failed at the map render. De-pinned to highest-version-wins and smoke-tested byte-identical against the live map. P121 is deliberately NOT transitioned: ADR-044 shipped a subagent where its Fix Strategy specified a deterministic lint, and whether the subagent covers the two JTBD-grounded probes is unestablished until a run exercises it.
> Run `/wr-itil:review-problems` to refresh WSJF rankings.

## WSJF Rankings

Dev-work queue only. Verification Pending and Parked tickets are excluded per ADR-022 and appear in their own sections. Rows render tier-first (Tier 0 Critical-bypass, Tier 1 Inbound-reported, Tier 2 Internal), then within each tier by `(WSJF desc, Known-Error-first, Effort-divisor asc, Reported-date asc, ID asc)` so top-to-bottom order matches `/wr-itil:work-problems` Step 3 selection. No ticket currently carries `**Origin**: inbound-reported`, so every row is Tier 2. <!-- REPORTED-FIRST-TIER-SOURCE: /wr-itil:work-problems SKILL.md Step 3 (ADR-076) -->

| WSJF | ID | Title | Severity | Status | Effort | Reported | Origin |
|------|-----|-------|----------|--------|--------|----------|--------|
| 12.0 | P109 | External-review round-trips waste cycles when the reviewer sees a stale copy of a repo artifact | 6 | Known Error | S | 2026-07-03 | internal |
| 12.0 | P115 | Site changes land on master without a changeset and silently never release to production | 12 | Known Error | M | 2026-07-14 | internal |
| 12.0 | P126 | The deps refresh chain creates a manifest desync and its own recovery path cannot clear it | 12 | Open | S | 2026-08-05 | internal |
| 10.0 | P087 | wr-architect-generate-decisions-compendium emits em-dashes that violate adopter no-em-dash policies | 10 | Known Error | M | 2026-06-03 | internal |
| 9.0 | P111 | Publish-day push blocked by deps-hygiene tooling chain (lock desync + local-vs-CI freshness divergence) | 9 | Known Error | M | 2026-07-06 | internal |
| 8.0 | P114 | wr-newsletter step 15.5 tells the LinkedIn post to close with a windyroad.com.au sign-off, but VOICE-AND-TONE.md's auto-share carve-out forbids any manual URL in the post body | 4 | Known Error | S | 2026-07-13 | internal |
| 8.0 | P061 | assistant gates policy-authorised actions (push, release-watch) on user permission when risk-scorer has already cleared | 8 | Known Error | M | 2026-05-14 | internal |
| 8.0 | P085 | External-comms gate marker hash invalidated by commit-message body changes, forcing re-review on every retry | 8 | Known Error | M | 2026-06-03 | internal |
| 8.0 | P113 | wr-newsletter review-gate loop runs many rounds; editor surfaces one rhythm nit per pass and section 15.6 re-runs all gates per edit | 8 | Known Error | M | 2026-07-13 | internal |
| 8.0 | P118 | Newsletter publish step uses `git mv` on untracked drafts, which fails | 8 | Open | S | 2026-07-27 | internal |
| 8.0 | P125 | Nothing recomputes WSJF on a status transition, so the Open multiplier persists and halves the ticket's rank | 8 | Open | S | 2026-08-05 | internal |
| 8.0 | P128 | The risk threshold is restated in ten places with no single source of truth | 8 | Open | S | 2026-08-07 | internal |
| 7.5 | P127 | Unverified subprocess claims propagate into decisions without reading the source | 15 | Open | M | 2026-08-07 | internal |
| 6.0 | P016 | wr-newsletter filter step drops significant stories that lack a primary source without attempting corroboration | 6 | Known Error | M | 2026-04-24 | internal |
| 6.0 | P036 | /wr-newsletter drafter leaks editorial-process meta-commentary into reader-facing body | 6 | Known Error | M | 2026-05-01 | internal |
| 6.0 | P086 | P165 README-refresh-discipline hook over-fires on non-ranking-bearing problem-ticket edits | 6 | Known Error | M | 2026-06-03 | internal |
| 6.0 | P098 | work-problems Step 6.5 post-release K->V auto-transition has no vehicle for repo-local-script fixes in a consumer repo (no npm release) | 6 | Known Error | M | 2026-06-17 | internal |
| 6.0 | P104 | I13 RFC-trace predicate and manage-problem I13 gate are not adopter-aware (fire no-rfc-trace in repos without an RFC tier) | 6 | Known Error | M | 2026-06-27 | internal |
| 6.0 | P106 | Verification Queue evidence cells are never populated from subsequent-session exercises, so the auto-drain never fires and the queue accumulates | 6 | Known Error | M | 2026-06-28 | internal |
| 6.0 | P110 | work-problems Step 5 iter/pre-flight dispatch exceeds the interactive harness foreground Bash ceiling | 6 | Known Error | M | 2026-07-03 | internal |
| 6.0 | P112 | accessibility-lead review passes markup but misses colour-contrast, caught only by the CI axe gate | 6 | Known Error | M | 2026-07-12 | internal |
| 6.0 | P121 | No gate compares an edition against the prior edition's shape, so pattern breaks and precedent drift reach the reader | 12 | Known Error | L | 2026-08-04 | internal |
| 6.0 | P107 | Assistant routes free-text input collection through AskUserQuestion instead of presenting per-item copyable blocks | 6 | Open | S | 2026-06-28 | internal |
| 4.5 | P023 | architect-gate drift detection rm's marker without offering recovery path | 9 | Open | M | 2026-04-26 | internal |
| 4.5 | P077 | Voice and tone gate misses Tom-specific idioms not codified in the guide | 9 | Open | M | 2026-06-01 | internal |
| 4.0 | P097 | upstream wr-itil check-upstream-responses.sh writes a U+2014 em-dash into the audit-log heading, tripping adopter no-em-dash hooks every Step-0d pass | 4 | Open | S | 2026-06-17 | internal |
| 3.0 | P058 | architect-enforce-edit + jtbd-enforce-edit hooks should add docs/retros/ to the exclusion list | 3 | Open | S | 2026-05-13 | internal |
| 3.0 | P074 | External-comms marker hooks do not write expected marker files after subagent PASS verdicts; gh issue create / commit gates re-fire indefinitely, forcing BYPASS_RISK_GATE=1 workaround | 6 | Open | M | 2026-05-31 | internal |
| 3.0 | P088 | architect edit-gate session-ID mismatch under AFK subprocess forces manual marker reconciliation | 6 | Open | M | 2026-06-14 | internal |
| 3.0 | P096 | work-problems orchestrator re-selects direction-blocked tickets as highest-WSJF every loop, producing no-op skips until the user answers | 6 | Open | M | 2026-06-17 | internal |
| 2.0 | P030 | work-problems SKILL.md marker wording uses em-dash, forces whitelist in PostToolUse:Bash em-dash hook | 4 | Open | M | 2026-04-26 | internal |
| 1.5 | P054 | work-problems Step 1 ranking does not exclude just-worked Known Error tickets awaiting orchestrator-owned push and transition | 3 | Open | M | 2026-05-12 | internal |
| 1.5 | P055 | AFK iter subprocess `Stream idle timeout` API errors recur at high rate | 3 | Open | M | 2026-05-12 | internal |
| 1.5 | P056 | manage-problem SKILL.md misattributes ADR-014 to "single-commit governance" in 6+ blocks | 3 | Open | M | 2026-05-13 | internal |
| 1.5 | P069 | work-problems orchestrator WSJF ranking does not factor placement-authority | 3 | Open | M | 2026-05-16 | internal |
| 0.0 | P124 | Governance edit-gate markers fail to land after a genuine PASS, costing a redundant review round | 9 | Open | M | 2026-08-05 | internal |

## Verification Queue

Fix released, awaiting verification. Sorted by ID ascending within the release-date grouping. <!-- VQ-SORT-DIRECTION: oldest-first per ADR-022 --> <!-- LIKELY-VERIFIED-CELL-SHAPE: evidence-based per P186 -->

| ID | Title | Fix summary | Likely verified? |
|----|-------|-------------|------------------|
| P002 | Hero content extends beyond the fold | **Released**: 2026-04-25 in commit `72c3c2b` on `origin/master` (`fix(hero): set min-height to 100svh for fold | no - not observed |
| P011 | Visual artifacts iterated and presented without render-and-verify discipline | see ticket | no - not observed |
| P012 | No CI-status check on push/release; conditional-commitment verification missing | see ticket | no - not observed |
| P013 | External-facing text (GitHub comments, LinkedIn teasers, PR bodies, release notes) has no automated voice/tone gate before posting | **2026-04-25 (iter 8 of AFK loop)**: Investigation Tasks 1 and 3 shipped via SKILL.md edit. | no - not observed |
| P015 | wr-newsletter drafter paraphrases per-item AskUserQuestion "Adjust" text into abstract commentary, losing Tom-voice fidelity | Released 2026-04-25 in commit covering: | no - not observed |
| P035 | /wr-newsletter drafter paraphrases quantitative claims away from source | Released 2026-05-02 in commit on master (no version bump; project-local skill prose is read at /wr-newsletter  | no - not observed |
| P037 | /wr-newsletter cover-image step requires 15+ iteration rounds; brand-asset grep + font-rendering diagnostics missing | Released 2026-05-12 to `origin/master` in commit `586c21e`: step 12 rewritten into five labelled sub-steps (ma | no - not observed |
| P045 | Assistant accepts a ticket's Fix Strategy framing about where upstream work should land, without questioning whether the work belongs upstream at all | Lever 1 of the three-lever fix completed on 2026-05-12 (AFK iter 6). Lever 1 per the ticket is "memory file pl | no - not observed |
| P050 | Assistant scope-creeps on user-flagged corrections, changing more than asked | **Release marker:** 2026-05-12 AFK iter 3 (no project-tree commit; memory layer is outside the repo). | no - not observed |
| P094 | extend the domain-specific critic supersede to wr-blog (retire wr-sw-critic entirely) | Committed 2026-06-27 (repo-local `.claude/agents/*` + `skills/wr-blog/*`; no plugin package touched, so no cha | no - not observed |
| P116 | Newsletter gates are all floor gates; no adversarial ceiling gate, so external review still finds substance issues every edition | Delivered to master 2026-07-14 in commit `4d6a622` (ADR-042 + `wr-newsletter-skeptic` agent + SKILL wiring at  | no - not observed |
| P117 | Tighten existing newsletter gate prompts for the lower-frequency external-review classes | Delivered to master 2026-07-15: three prompt/rubric edits to `.claude/skills/wr-newsletter/assets/newsletter-c | no - not observed |
| P120 | Editor and skeptic gates surface findings to Tom instead of remediating them, so their output becomes his review burden | Shipped 2026-08-05 as ADR-043 plus the SKILL and agent wiring above. Awaiting user verification. | no - not observed |
| P099 | wr-newsletter has no rule that a post-gate body edit re-runs the FULL gate set | Gate verdicts record a digest; stale gates re-run at save | no - not observed (verifies on the next /wr-newsletter run with post-gate edits) |
| P108 | wr-newsletter step 7 hard-codes the wardley converter at a pinned plugin version | De-pinned to highest-version-wins per ADR-080; smoke-tested byte-identical | no - not observed (verifies on the next /wr-newsletter run) |
| P119 | Newsletter structure lint check (c) is non-deterministic under pipefail | Fixed in bbb6ca1; pinned by a 20-run determinism test | no - not observed (verifies on the next /wr-newsletter run) |
| P122 | No gate owns within-edition structural mechanics, so assembly defects reach the reader | Shipped 2026-08-08 across four commits, against three decisions Tom ratified 2026-08-07. | no - not observed (verifies on the next /wr-newsletter run) |
| P123 | fix:deps gates on vitest only, so a lockfile npm ci cannot install passes locally and reddens master | Shipped 2026-08-05 in the commit that carries this transition: the composite gate and `lockfile_platform_flag_ | no - not observed |

## Parked

| ID | Title |
|----|-------|
| P021 | architect-mark-reviewed.sh strict-verdict-string parsing under-counts affirmative ISSUES FOUND verdicts as FAIL |
| P022 | architect-refresh-hash.sh only refreshes hash on docs/decisions/* writes, leaving cross-session drift on other gated paths |
| P027 | work-problems Step 5 exit-code rule does not handle is_error:true transient API failures (529 Overloaded) |
| P029 | work-problems iteration boundary leaves run-retro BRIEFING.md edits uncommitted |
| P031 | manage-problem Step 0 reconcile-readme.sh hits exit 127 on marketplace consumers; script only on disk for vendored installs |
| P033 | report-upstream SKILL.md Step 5 example uses --label flag that fails when upstream repo hasn't pre-created the label |
| P042 | jtbd-enforce-edit hook uses relative `docs/jtbd` path; fails when cwd is not project root |
| P046 | Risk scorer treats changesets as queued when underlying commits are already on origin |
| P047 | wr-risk-scorer:assess-release SKILL.md step 5 contract violation (Skill-tool prose vs Agent-tool parameter) |
| P048 | /wr-itil:manage-problem Step 5 P094 README refresh contract bypassed on bulk-creation paths |
| P049 | reconcile-readme.sh section-order assumption produces false-positive STALE for tickets in section-after-Closed |
| P052 | Ticket-family completeness check missing before declaring friction "done" |
| P060 | `capture-adr` SKILL.md template frontmatter sentinel carries U+2014 that no-em-dash hook blocks |
| P068 | Newsletter URL discovery via Google News RSS strips canonical to outlet root; misses real article URL |
| P073 | P186 evidence-first cell canonical shape uses U+2014 separator that no-em-dash hook blocks during README render |
