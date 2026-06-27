# Problem 001: Next.js build hangs locally

**Status**: Open
**Reported**: 2026-04-14
**Origin**: internal
**Priority**: 6 (Medium). Impact: Minor (2) x Likelihood: Possible (3) (re-rated 2026-06-27 work-problems: the 2026-05-30 "unreproducible" note is FALSIFIED. `next build` REPRODUCIBLY hangs at 0% CPU on Next 16.1.6, telemetry + interactivity ruled out. Likelihood Rare -> Possible. Impact stays Minor: local-dev only, CI builds fine and the site is live. See Investigation 2026-06-27.)
**Effort**: M (root-cause investigation; possibly resolved by fresh shell or system restart)
**WSJF**: 1 = (2 x 1) / 2

## Description

`npm run build` (which runs `next build`) hangs indefinitely in the local dev environment. The `next build` process starts but shows 0% CPU usage and never progresses past initialization. The `.next` directory is never created.

This does not affect the CI pipeline (GitHub Actions) or the published Netlify site, but blocks local build verification.

## Symptoms

- `next build` process starts (visible in `ps aux`) but sits idle at 0% CPU
- No `.next` directory is created
- Build output shows only the prebuild OG image step completing, then `> next build` with no further output
- Multiple stale `next build` processes accumulate if retried
- Clearing `.next` cache and killing all processes does not resolve the issue
- Tests (`vitest`) run successfully; only `next build` is affected

## Workaround

Use the CI pipeline (GitHub Actions) for build verification. Commit and push to `master`; the CI workflow runs `npm run build` in a clean environment.

## Impact Assessment

- **Who is affected**: Developer (local workflow only)
- **Frequency**: Every local build attempt in this session
- **Severity**: Low (CI pipeline provides the same build verification)
- **Analytics**: N/A

## Root Cause Analysis

### Preliminary Hypothesis

Likely caused by resource exhaustion from accumulated zombie `vitest` and `next build` processes during the session. Multiple background test runs (spawned by TDD hooks and manual invocations) were not properly cleaned up, potentially exhausting file descriptors, ports, or worker threads.

Alternative hypothesis: Next.js worker pool initialization may deadlock when system resources are constrained by other Node.js processes.

### Investigation 2026-05-30 (AFK iter 9)

Quick non-reproducing diagnostics (build NOT run, to avoid blocking the loop):

- No `next build` processes for this project currently in `ps aux`. The original "process accumulation" symptom is not currently observable.
- Node `v22.17.1` (current LTS-line).
- Next.js has been bumped from the 15.x era (when the ticket was filed) to `^16` in `package.json`. The runtime that exhibited the hang is no longer the runtime in use.
- `next.config.mjs` unchanged since the ticket was filed; uses `output: 'export'` (static SSG). No exotic webpack or turbopack customisation.
- No `.next/` directory present (clean state).
- Lockfile churn since 2026-04-14 limited to react `19.2.5` to `19.2.6`, sass `1.98.0` to `1.99.0`, typescript hold, slugify, playwright. No Next.js plugin changes.
- Aside: `~/.npm` is 22 GB (large, but not a hang root cause; flag for future hygiene, not this ticket).
- Aside: stale `next-server v15.5.18` from `voder-mcp-hub` project running since 2026-05-27. Unrelated to this repo's build.

The session-specific stuck-process hypothesis from 2026-04-14 cannot be reproduced today, and the underlying Next.js version has since crossed a major boundary. The ticket should be re-verified against current state rather than treated as a load-bearing live bug.

### Investigation 2026-06-27 (work-problems main turn): REPRODUCED, telemetry ruled out

The 2026-05-30 "unreproducible on Next 16" hypothesis is FALSIFIED. Ran `npm run build` (Next 16.1.6) twice from a clean state (`.next` removed) this session:

- Run 1 (`npm run build`): the prebuild OG-image step completed, then `> next build` printed with NO further output. The `next build` process sat at **0.0% CPU** for ~240s; `.next/BUILD_ID` was never created. This is the exact original symptom (0% CPU, never progresses past init, no `.next`).
- Run 2 (`NEXT_TELEMETRY_DISABLED=1 CI=1 npx next build`): SAME hang (0.0% CPU, no `.next/BUILD_ID` after ~110s). So the hang is NOT a telemetry consent prompt and NOT an interactive-prompt block (`CI=1` forces non-interactive); both are ruled out.
- Corroborating: earlier this session `npm run dev` also failed to reach "Ready" within 60s (related Next.js startup stall), which blocked the P002 local render-verification.

Narrowed cause: a deeper Next 16.1.6 build-init hang (0% CPU = blocked/waiting, not computing) that fires before Next emits any build output. Candidate next steps (not pursued; Very Low priority): bisect with `--debug`, check the SWC/worker-thread init, try `output: 'export'` removed, check Node v22.17.1 x Next 16.1.6 native-module compatibility, or strace/sample the stuck PID. **Impact stays Minor: CI builds the site fine and windyroad.com.au is live; this is a local-developer-experience issue only, with the CI build as the workaround.** Likelihood re-rated Rare -> Possible (reproducible on demand). Left Open for deeper interactive investigation.

### Investigation Tasks

- [x] Verify build succeeds in CI (clean environment) -- CI builds succeed; the site is deployed and live.
- [x] **Re-verify locally on Next 16**: run `npm run build` once and observe. (2026-06-27: REPRODUCED the hang; did NOT complete, so no transition to Verifying. See Investigation 2026-06-27 above.)
- [ ] Bisect the Next 16.1.6 build-init hang (SWC/worker init, output:export, Node-x-Next native compat); sample/strace the 0%-CPU stuck PID.
- [ ] Check if `next build` works after a full system restart (only if re-verification still hangs)
- [ ] Investigate whether TDD hook test runner needs process cleanup on timeout (only if re-verification still hangs)

## Related

- ADR 006: TDD enforcement via hooks (the hook-triggered test runs may contribute to process accumulation)
