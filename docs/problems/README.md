# Problem Backlog

> Last reviewed: 2026-08-26 **P169 and P170 captured; P132 recurrence recorded at scale** (the AFK loop's backlog scan reports an empty queue under zsh, and a verification cell can close a ticket its own evidence says is broken) (session retro via /wr-itil:work-problems preflight)
> Run `/wr-itil:review-problems` to refresh WSJF rankings.

## WSJF Rankings

Dev-work queue only. Verification Pending and Parked tickets are excluded per ADR-022 and appear in their own sections. Rows render tier-first (Tier 0 Critical-bypass, Tier 1 Inbound-reported, Tier 2 Internal), then within each tier by `(WSJF desc, Known-Error-first, Effort-divisor asc, Reported-date asc, ID asc)` so top-to-bottom order matches `/wr-itil:work-problems` Step 3 selection. No ticket reaches Severity 17, carries a security classification or links an incident, so there is no Tier 0; no ticket carries `**Origin**: inbound-reported`, so every row is Tier 2. <!-- REPORTED-FIRST-TIER-SOURCE: /wr-itil:work-problems SKILL.md Step 3 (ADR-076) -->

| WSJF | ID | Title | Severity | Status | Effort | Reported | Origin |
|------|-----|-------|----------|--------|--------|----------|--------|
| 16.0 | P128 | The risk threshold is restated in ten places with no single source of truth | 8 | Known Error | S | 2026-08-07 | internal |
| 16.0 | P165 | The stale-verdict check stands down on the very absence it exists to catch | 16 | Open | S | 2026-08-25 | internal |
| 15.0 | P169 | The AFK orchestrator's shell snippets assume bash, so under zsh the backlog scan reports zero against a full queue | 15 | Open | S | 2026-08-26 | internal |
| 15.0 | P161 | No check compares a brief against its own companion post for agreement | 15 | Open | S | 2026-08-24 | internal |
| 12.0 | P170 | A verification cell can assert verified while its own evidence text says the fix failed | 12 | Open | S | 2026-08-26 | internal |
| 12.0 | P115 | Site changes land on master without a changeset and silently never release to production | 12 | Known Error | M | 2026-07-14 | internal |
| 12.0 | P124 | Governance edit-gate markers fail to land after a genuine PASS, costing a redundant review round | 12 | Known Error | M | 2026-08-05 | internal |
| 12.0 | P166 | A governance surface that silently degrades to a subset of its specification reads as a clean run | 12 | Open | S | 2026-08-25 | internal |
| 10.0 | P087 | wr-architect-generate-decisions-compendium emits em-dashes that violate adopter no-em-dash policies | 10 | Known Error | M | 2026-06-03 | internal |
| 10.0 | P145 | Risk register is empty, so every scorer run regenerates from scratch | 10 | Known Error | M | 2026-08-09 | internal |
| 10.0 | P130 | Two run-retro detectors assume a packages/ monorepo and produce nothing in a consumer repo | 10 | Open | S | 2026-08-08 | internal |
| 9.0 | P111 | Publish-day push blocked by deps-hygiene tooling chain (lock desync + local-vs-CI freshness divergence) | 9 | Known Error | M | 2026-07-06 | internal |
| 9.0 | P143 | CI smoke test has no retry, and its failure skips the production path rather than failing it | 9 | Open | S | 2026-08-09 | internal |
| 9.0 | P153 | An operator-authored dependency refresh reaches a commit with no lockfile install-shape check | 9 | Open | S | 2026-08-16 | internal |
| 9.0 | P157 | The test suite is not gated anywhere, so 561 tests run only when an operator remembers | 9 | Open | S | 2026-08-23 | internal |
| 9.0 | P159 | A self-produced measurement is trusted without checking, so a broken measurement can kill a correct fix | 9 | Open | S | 2026-08-23 | internal |
| 8.0 | P061 | assistant gates policy-authorised actions (push, release-watch) on user permission when risk-scorer has already cleared | 8 | Known Error | M | 2026-05-14 | internal |
| 8.0 | P085 | External-comms gate marker hash invalidated by commit-message body changes, forcing re-review on every retry | 8 | Known Error | M | 2026-06-03 | internal |
| 8.0 | P113 | wr-newsletter review-gate loop runs many rounds; editor surfaces one rhythm nit per pass and section 15.6 re-runs all gates per edit | 8 | Known Error | M | 2026-07-13 | internal |
| 8.0 | P132 | Relevance evaluator emits CLOSE verdicts from syntax-only ADR-number and driver matching | 8 | Open | S | 2026-08-08 | internal |
| 8.0 | P133 | Assistant composes for a desktop reader with the repo open, so asks are unactionable on a phone | 8 | Open | S | 2026-08-08 | internal |
| 8.0 | P134 | Agents infer staged state from the session-start git status snapshot, which is lossy on its first line | 8 | Open | S | 2026-08-09 | internal |
| 8.0 | P135 | The compendium entry hook has no arithmetic over the derived ADR counts, so the total drifts by one on every new ADR | 8 | Open | S | 2026-08-09 | internal |
| 8.0 | P137 | The correction-signal hook fires on standing operational constraints, not just on genuine user corrections | 8 | Open | S | 2026-08-09 | internal |
| 8.0 | P146 | publish-pipeline selects the production artifact by recency, not identity | 8 | Open | S | 2026-08-09 | internal |
| 8.0 | P149 | Em-dash gate is blind to the index, so staged-then-corrected content commits unchecked | 8 | Open | S | 2026-08-10 | internal |
| 8.0 | P158 | The newsletter eval harness reports misconfiguration as results, so a broken run looks like a real one | 8 | Open | S | 2026-08-23 | internal |
| 8.0 | P167 | The recovery path for a blocked push cannot run unattended and reports the stall as a judgement call | 8 | Open | S | 2026-08-25 | internal |
| 8.0 | P162 | A claim corrected at one site survives at its sibling sites | 16 | Open | M | 2026-08-24 | internal |
| 7.5 | P127 | Unverified subprocess claims propagate into decisions without reading the source | 15 | Open | M | 2026-08-07 | internal |
| 6.0 | P058 | architect-enforce-edit + jtbd-enforce-edit hooks should add docs/retros/ to the exclusion list | 3 | Known Error | S | 2026-05-13 | internal |
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
| 6.0 | P131 | External-comms gate cannot see a --body-file body, so the block becomes unclearable after a genuine PASS | 6 | Open | S | 2026-08-08 | internal |
| 6.0 | P136 | Tier 3 briefing rotation strips entries the Critical Points still point at, because nothing re-points the roll-up | 6 | Open | S | 2026-08-09 | internal |
| 6.0 | P148 | serve is undeclared, so npx fetches an unpinned major on the release-blocking path | 6 | Open | S | 2026-08-09 | internal |
| 6.0 | P150 | Briefing has a per-file budget and no aggregate one, so rotation grows the total | 6 | Open | S | 2026-08-10 | internal |
| 6.0 | P164 | A gate finding applied while another gate is reading invalidates that gate's verdict | 6 | Open | S | 2026-08-25 | internal |
| 6.0 | P141 | GitHub Actions versions are an uninstrumented dependency surface | 12 | Open | M | 2026-08-09 | internal |
| 6.0 | P142 | RFC lifecycle cannot advance past proposed because a gate blocks a ratified local deviation | 12 | Open | M | 2026-08-09 | internal |
| 5.0 | P147 | Accessibility gate does not gate the release path | 5 | Open | S | 2026-08-09 | internal |
| 5.0 | P144 | push:watch forces a full risk rescore after every commit | 10 | Open | M | 2026-08-09 | internal |
| 4.5 | P023 | architect-gate drift detection rm's marker without offering recovery path | 9 | Open | M | 2026-04-26 | internal |
| 4.5 | P077 | Voice and tone gate misses Tom-specific idioms not codified in the guide | 9 | Open | M | 2026-06-01 | internal |
| 4.5 | P155 | A governance subagent's recommended action can be wrong in a way only the enforcement it would break reveals | 9 | Open | M | 2026-08-23 | internal |
| 4.0 | P030 | work-problems SKILL.md marker wording uses em-dash, forces whitelist in PostToolUse:Bash em-dash hook | 4 | Known Error | M | 2026-04-26 | internal |
| 4.0 | P097 | upstream wr-itil check-upstream-responses.sh writes a U+2014 em-dash into the audit-log heading, tripping adopter no-em-dash hooks every Step-0d pass | 4 | Open | S | 2026-06-17 | internal |
| 4.0 | P138 | Nothing gates or reports on the human-oversight axis at promotion time, so an ADR can reach accepted without ever having been read | 4 | Open | S | 2026-08-09 | internal |
| 4.0 | P139 | Ratification flips frontmatter but nothing sweeps the prose asserting the prior unconfirmed state | 8 | Open | M | 2026-08-09 | internal |
| 4.0 | P156 | Briefing absence claims are never re-verified, so a stale one loads into every session | 8 | Open | M | 2026-08-23 | internal |
| 4.0 | P163 | Risk scorer report persistence writes empty files | 8 | Open | M | 2026-08-24 | internal |
| 3.0 | P074 | External-comms marker hooks do not write expected marker files after subagent PASS verdicts; gh issue create / commit gates re-fire indefinitely, forcing BYPASS_RISK_GATE=1 workaround | 6 | Open | M | 2026-05-31 | internal |
| 3.0 | P088 | architect edit-gate session-ID mismatch under AFK subprocess forces manual marker reconciliation | 6 | Open | M | 2026-06-14 | internal |
| 3.0 | P096 | work-problems orchestrator re-selects direction-blocked tickets as highest-WSJF every loop, producing no-op skips until the user answers | 6 | Open | M | 2026-06-17 | internal |
| 2.0 | P160 | No deterministic check reads the LinkedIn companion body for a manual URL | 2 | Open | S | 2026-08-23 | internal |
| 1.5 | P054 | work-problems Step 1 ranking does not exclude just-worked Known Error tickets awaiting orchestrator-owned push and transition | 3 | Open | M | 2026-05-12 | internal |
| 1.5 | P055 | AFK iter subprocess `Stream idle timeout` API errors recur at high rate | 3 | Open | M | 2026-05-12 | internal |
| 1.5 | P056 | manage-problem SKILL.md misattributes ADR-014 to "single-commit governance" in 6+ blocks | 3 | Open | M | 2026-05-13 | internal |
| 1.5 | P069 | work-problems orchestrator WSJF ranking does not factor placement-authority | 3 | Open | M | 2026-05-16 | internal |
## Verification Queue

Fix released, awaiting verification. Sorted by Released date ascending, oldest first; same-day releases tiebreak by ID ascending. <!-- VQ-SORT-DIRECTION: oldest-first per ADR-022 --> <!-- LIKELY-VERIFIED-CELL-SHAPE: evidence-based per P186 -->

| ID | Title | Released | Likely verified? |
|----|-------|----------|------------------|
| P015 | wr-newsletter drafter paraphrases per-item AskUserQuestion "Adjust" text into abstract commentary, losing Tom-voice fidelity | 2026-04-25 | no - not observed |
| P050 | Assistant scope-creeps on user-flagged corrections, changing more than asked | 2026-05-12 AFK iter 3 (memory layer, no project-tree commit) | no - not observed |
| P094 | extend the domain-specific critic supersede to wr-blog (retire wr-sw-critic entirely) | 2026-06-27, repo-local agents and skills, no changeset | no - not observed |
| P120 | Editor and skeptic gates surface findings to Tom instead of remediating them, so their output becomes his review burden | 2026-08-05, ADR-043 plus SKILL and agent wiring | no - observed regression; the verifying run happened on 2026-08-24 and split the verdict: the remediating half worked (editor and skeptic findings acted on in the body, three residuals, all cross-boundary placement calls Tom ruled on) while the round count met the ticket's own not-working condition at 24 rounds against a criterion of one per body pass |
| P099 | wr-newsletter has no rule that a post-gate body edit re-runs the FULL gate set | 2026-08-08, gate verdicts record a digest; stale gates re-run at save | no - observed regression; the verifying run happened on 2026-08-25 and it BLOCKS: the Issue 19 finalise took post-gate edits across 24 rounds, but ADR-047's recording half never fired (zero scored-digest lines against Issue 18's five) and check (m) skipped calling it a pre-ADR-047 edition. Cannot verify until P165 is fixed (verifies on the next /wr-newsletter run with post-gate edits) |
| P118 | Newsletter publish step uses `git mv` on untracked drafts, which fails | 2026-08-08, repo-local documentation across three surfaces, no changeset (nothing shippable changed) | no - not observed; Issue 19 reached published/ as a single commit rather than through the guarded promotion chain, so the command the fix rewrote was not the one exercised (verifies on the next /wr-newsletter publish) |
| P126 | The deps refresh chain creates a manifest desync and its own recovery path cannot clear it | 2026-08-08 under RFC-006, no changeset (private root package, maintainer tooling) | no - not observed live; the `f1d7b8b` reproduction replays to `rollback` and 13 new cases pass, but the end-to-end path needs a real dep update, which is what ADR-034 criterion (d) is re-armed against |
| P109 | External-review round-trips waste cycles when the reviewer sees a stale copy of a repo artifact | 2026-08-09, repo-local skill prose plus an out-of-repo memory note, no changeset (nothing shippable changed) | no - not observed; verifies on the next edition that goes out for external editorial review, and the thing to watch is whether the artefact is handed over with its checksum at all, not just whether a stale round is diagnosed faster |
| P140 | Lint and SKILL disagree on the prep-phase reviews sibling path | 2026-08-23, repo-local dev lint plus skill prose, no changeset (private root package, nothing shippable changed) | no - not observed; Issue 19 ran a prep phase (its capture records phase-written: prep) but the prep-time lint invocation is not recorded, so the previously-dead checks are still unwitnessed against a live prep artefact; verifies on the next `/wr-newsletter phase=prep` run, which is where checks (m) and (n) first execute against a live prep artefact |
| P154 | Newsletter remediation edits are never independently verified, so a fix can introduce a defect that survives until the next full battery | 2026-08-23, repo-local dev lint plus skill prose and tests, no changeset (private root package, nothing shippable changed) | no - observed regression; the verifying run happened on 2026-08-24 and the disclosure half did NOT ship: checks (p) and (r) fired on Issue 19, but the Editorial Remediation Loop block carries no round-close lint report, no before-and-after pairs and no Verified-against lines, which Fix Strategy change 2 requires; verifies on the next `/wr-newsletter` run, and the thing to watch is the `## Editorial Remediation Loop` block, which should now report what the round-close lint caught with a before-and-after pair for each fix, or say plainly that it caught nothing |
| P168 | The freshness gate reads the installed tree and its fix flow only writes the manifests, so the gate never clears | 2026-08-25, repo-local maintainer scripts plus 8 behavioural tests, no changeset (private root package, nothing shippable changed) | no - not observed; verifies on the next dependency that matures, and the test is whether fix:deps commits and the following push:watch proceeds rather than blocking on the package it just updated |

## Inbound Upstream Reports

Polled 2026-08-25 (TTL-expiry auto-recheck; prior poll 2026-08-08). One channel configured: `github-issues` on `windyroad/windyroad`, no label filter, all open issues. Zero open issues, so the assessment pipeline did not run and no local tickets were created.

| # | Source | Title | Author | Created | Classification | Matched local ticket |
|---|--------|-------|--------|---------|----------------|----------------------|
| _(none)_ | | | | | | |

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
| P125 | Nothing recomputes WSJF on a status transition, so the Open multiplier persists and halves the ticket's rank |

