# Problem Backlog

> Last reviewed: 2026-08-09 **P138 captured, and two ratification sweeps landed.** Tom read and ratified ADR-049 in session, draining the first `human-oversight: unconfirmed` marker this repo ever carried, so no ADR on disk now holds one. Recording it surfaced the gap P138 names: `stamp-and-promote-decisions.sh` promotes on `first-released` age alone and never reads `human-oversight` (verified, no reference in its 122 lines), and ADR-005 names no oversight condition in its outcome or any of its five Confirmation criteria, so a record no human has read can reach `accepted` by surviving fourteen days. Captured with three options and no pick, because option C, that the two axes are independent by design, is genuinely live and ADR-049's own blockquote asserts its premise. Rated 4 (Impact 2 x Likelihood 2), Low, since live exposure is currently zero. The sweep also discharged **P115's first blocker**: it was held open on the `internal-maintainer` persona and JTBD-400/401/402 being unratified, and all four were ratified 2026-08-09 in `cc68d4f`. P115's second blocker, two missing release-path jobs, is untouched and still Tom's. Prior entry: 2026-08-09 **P115 investigation complete, fix designed but not applied.** Root cause found and it is sharper than the ticket assumed: the upstream changeset-discipline gate is installed here and structurally cannot fire, because its path classifier only recognises a `packages/` monorepo layout and this repo's site sources are under `src/`. So the discipline is not missing, it is silently scoped past. The fix is a path-scoped pre-push halt in `scripts/push-watch.sh`, specified in full on the ticket after two architect rounds and three JTBD rounds. Status stays Known Error. Prior entry: 2026-08-09 **P132 third witness** -- the relevance evaluator returned CLOSE-CANDIDATE-WITH-CAVEAT on P115, which is live and being worked, with both faulty shapes firing at once. The shape-5 half repeats the known "Composes with" failure. The shape-2 half is new and does not fit the reported root cause: ADR-041 is local, correctly resolved and genuinely oversight-confirmed, but P115 cites it as the change that sat unreleased rather than as its fix, and both entries date from the same session because the same failure produced both. So the fix needs a remedy-versus-mention test as well as namespace qualification. Posted upstream on agent-plugins#414. No ranking change: P132's WSJF, severity, status and effort band are all unmoved. Prior entry: 2026-08-09 **P137 captured** -- the correction-signal hook matched `DO NOT` inside the orchestrator's own standing constraint block ("Do NOT push", "Do NOT use ScheduleWakeup") and injected the mandatory correction-capture instruction. Nothing had been corrected, so the instruction was unactionable, and that block rides every AFK iteration prompt, so it fires nearly every iter. The cost that matters is second-order: a detector that fires unactionably on most invocations trains the agent to note it and move on, which is the response a genuine correction would then also get. Fix site is upstream (`detectors.sh` CORRECTION_SIGNAL_PATTERNS), and the ticket says plainly that its account of that file is a hypothesis from the hook's own message, unverified against source (lightweight aside via /wr-itil:capture-problem).
> Run `/wr-itil:review-problems` to refresh WSJF rankings.

## WSJF Rankings

Dev-work queue only. Verification Pending and Parked tickets are excluded per ADR-022 and appear in their own sections. Rows render tier-first (Tier 0 Critical-bypass, Tier 1 Inbound-reported, Tier 2 Internal), then within each tier by `(WSJF desc, Known-Error-first, Effort-divisor asc, Reported-date asc, ID asc)` so top-to-bottom order matches `/wr-itil:work-problems` Step 3 selection. No ticket reaches Severity 17, carries a security classification or links an incident, so there is no Tier 0; no ticket carries `**Origin**: inbound-reported`, so every row is Tier 2. <!-- REPORTED-FIRST-TIER-SOURCE: /wr-itil:work-problems SKILL.md Step 3 (ADR-076) -->

| WSJF | ID | Title | Severity | Status | Effort | Reported | Origin |
|------|-----|-------|----------|--------|--------|----------|--------|
| 16.0 | P128 | The risk threshold is restated in ten places with no single source of truth | 8 | Known Error | S | 2026-08-07 | internal |
| 12.0 | P115 | Site changes land on master without a changeset and silently never release to production | 12 | Known Error | M | 2026-07-14 | internal |
| 12.0 | P124 | Governance edit-gate markers fail to land after a genuine PASS, costing a redundant review round | 12 | Known Error | M | 2026-08-05 | internal |
| 10.0 | P087 | wr-architect-generate-decisions-compendium emits em-dashes that violate adopter no-em-dash policies | 10 | Known Error | M | 2026-06-03 | internal |
| 10.0 | P130 | Two run-retro detectors assume a packages/ monorepo and produce nothing in a consumer repo | 10 | Open | S | 2026-08-08 | internal |
| 9.0 | P111 | Publish-day push blocked by deps-hygiene tooling chain (lock desync + local-vs-CI freshness divergence) | 9 | Known Error | M | 2026-07-06 | internal |
| 8.0 | P114 | wr-newsletter step 15.5 tells the LinkedIn post to close with a windyroad.com.au sign-off, but VOICE-AND-TONE.md's auto-share carve-out forbids any manual URL in the post body | 4 | Known Error | S | 2026-07-13 | internal |
| 8.0 | P061 | assistant gates policy-authorised actions (push, release-watch) on user permission when risk-scorer has already cleared | 8 | Known Error | M | 2026-05-14 | internal |
| 8.0 | P085 | External-comms gate marker hash invalidated by commit-message body changes, forcing re-review on every retry | 8 | Known Error | M | 2026-06-03 | internal |
| 8.0 | P113 | wr-newsletter review-gate loop runs many rounds; editor surfaces one rhythm nit per pass and section 15.6 re-runs all gates per edit | 8 | Known Error | M | 2026-07-13 | internal |
| 8.0 | P132 | Relevance evaluator emits CLOSE verdicts from syntax-only ADR-number and driver matching | 8 | Open | S | 2026-08-08 | internal |
| 8.0 | P133 | Assistant composes for a desktop reader with the repo open, so asks are unactionable on a phone | 8 | Open | S | 2026-08-08 | internal |
| 8.0 | P134 | Agents infer staged state from the session-start git status snapshot, which is lossy on its first line | 8 | Open | S | 2026-08-09 | internal |
| 8.0 | P135 | The compendium entry hook has no arithmetic over the derived ADR counts, so the total drifts by one on every new ADR | 8 | Open | S | 2026-08-09 | internal |
| 8.0 | P137 | The correction-signal hook fires on standing operational constraints, not just on genuine user corrections | 8 | Open | S | 2026-08-09 | internal |
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
| 6.0 | P131 | External-comms gate cannot see a `--body-file` body, so the block becomes unclearable after a genuine PASS | 6 | Open | S | 2026-08-08 | internal |
| 6.0 | P136 | Tier 3 briefing rotation strips entries the Critical Points still point at | 6 | Open | S | 2026-08-09 | internal |
| 4.5 | P023 | architect-gate drift detection rm's marker without offering recovery path | 9 | Open | M | 2026-04-26 | internal |
| 4.5 | P077 | Voice and tone gate misses Tom-specific idioms not codified in the guide | 9 | Open | M | 2026-06-01 | internal |
| 4.0 | P030 | work-problems SKILL.md marker wording uses em-dash, forces whitelist in PostToolUse:Bash em-dash hook | 4 | Known Error | M | 2026-04-26 | internal |
| 4.0 | P097 | upstream wr-itil check-upstream-responses.sh writes a U+2014 em-dash into the audit-log heading, tripping adopter no-em-dash hooks every Step-0d pass | 4 | Open | S | 2026-06-17 | internal |
| 4.0 | P138 | Nothing gates or reports on the human-oversight axis at promotion time, so an ADR can reach accepted without ever having been read | 4 | Open | S | 2026-08-09 | internal |
| 3.0 | P074 | External-comms marker hooks do not write expected marker files after subagent PASS verdicts; gh issue create / commit gates re-fire indefinitely, forcing BYPASS_RISK_GATE=1 workaround | 6 | Open | M | 2026-05-31 | internal |
| 3.0 | P088 | architect edit-gate session-ID mismatch under AFK subprocess forces manual marker reconciliation | 6 | Open | M | 2026-06-14 | internal |
| 3.0 | P096 | work-problems orchestrator re-selects direction-blocked tickets as highest-WSJF every loop, producing no-op skips until the user answers | 6 | Open | M | 2026-06-17 | internal |
| 1.5 | P054 | work-problems Step 1 ranking does not exclude just-worked Known Error tickets awaiting orchestrator-owned push and transition | 3 | Open | M | 2026-05-12 | internal |
| 1.5 | P055 | AFK iter subprocess `Stream idle timeout` API errors recur at high rate | 3 | Open | M | 2026-05-12 | internal |
| 1.5 | P056 | manage-problem SKILL.md misattributes ADR-014 to "single-commit governance" in 6+ blocks | 3 | Open | M | 2026-05-13 | internal |
| 1.5 | P069 | work-problems orchestrator WSJF ranking does not factor placement-authority | 3 | Open | M | 2026-05-16 | internal |

## Verification Queue

Fix released, awaiting verification. Sorted by Released date ascending, oldest first; same-day releases tiebreak by ID ascending. <!-- VQ-SORT-DIRECTION: oldest-first per ADR-022 --> <!-- LIKELY-VERIFIED-CELL-SHAPE: evidence-based per P186 -->

| ID | Title | Released | Likely verified? |
|----|-------|----------|------------------|
| P002 | Hero content extends beyond the fold | 2026-04-25, commit `72c3c2b` | no - not observed |
| P015 | wr-newsletter drafter paraphrases per-item AskUserQuestion "Adjust" text into abstract commentary, losing Tom-voice fidelity | 2026-04-25 | no - not observed |
| P050 | Assistant scope-creeps on user-flagged corrections, changing more than asked | 2026-05-12 AFK iter 3 (memory layer, no project-tree commit) | no - not observed |
| P094 | extend the domain-specific critic supersede to wr-blog (retire wr-sw-critic entirely) | 2026-06-27, repo-local agents and skills, no changeset | no - not observed |
| P119 | Newsletter structure lint check (c) is non-deterministic under pipefail | 2026-08-03, commit `bbb6ca1`, pinned by a 20-run determinism test | no - not observed (verifies on the next /wr-newsletter run) |
| P120 | Editor and skeptic gates surface findings to Tom instead of remediating them, so their output becomes his review burden | 2026-08-05, ADR-043 plus SKILL and agent wiring | no - not observed |
| P099 | wr-newsletter has no rule that a post-gate body edit re-runs the FULL gate set | 2026-08-08, gate verdicts record a digest; stale gates re-run at save | no - not observed (verifies on the next /wr-newsletter run with post-gate edits) |
| P108 | wr-newsletter step 7 hard-codes the wardley converter at a pinned plugin version | 2026-08-08, de-pinned to highest-version-wins per ADR-080, smoke-tested byte-identical | no - not observed (verifies on the next /wr-newsletter run) |
| P118 | Newsletter publish step uses `git mv` on untracked drafts, which fails | 2026-08-08, repo-local documentation across three surfaces, no changeset (nothing shippable changed) | no - not observed (verifies on the next /wr-newsletter publish) |
| P122 | No gate owns within-edition structural mechanics, so assembly defects reach the reader | 2026-08-08 across four commits, against three decisions ratified 2026-08-07 | no - not observed (verifies on the next /wr-newsletter run) |
| P126 | The deps refresh chain creates a manifest desync and its own recovery path cannot clear it | 2026-08-08 under RFC-006, no changeset (private root package, maintainer tooling) | no - not observed live; the `f1d7b8b` reproduction replays to `rollback` and 13 new cases pass, but the end-to-end path needs a real dep update, which is what ADR-034 criterion (d) is re-armed against |
| P129 | Sourcing a repo script to probe a helper runs its whole flow, because the LIB_ONLY seam is opt-in | 2026-08-09, commit `8ad2dba` on `origin/master`, CI green, no changeset (repo-local dev scripts, private root package) | no - not observed; verifies when a normal `push:watch`, `deps:fix` or `release:watch` run behaves exactly as before, since the guards are meant to be invisible on the executed path |
| P109 | External-review round-trips waste cycles when the reviewer sees a stale copy of a repo artifact | 2026-08-09, repo-local skill prose plus an out-of-repo memory note, no changeset (nothing shippable changed) | no - not observed; verifies on the next edition that goes out for external editorial review, and the thing to watch is whether the artefact is handed over with its checksum at all, not just whether a stale round is diagnosed faster |

## Inbound Upstream Reports

Polled 2026-08-08T03:37:55Z (TTL-expiry auto-recheck; prior poll 2026-08-05). One channel configured: `github-issues` on `windyroad/windyroad`, no label filter, all open issues. Zero open issues, so the assessment pipeline did not run and no local tickets were created.

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
