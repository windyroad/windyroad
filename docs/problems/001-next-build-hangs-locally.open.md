# Problem 001: Next.js build hangs locally

**Status**: Open
**Reported**: 2026-04-14
**Priority**: 6 (Medium). Impact: Minor (2) x Likelihood: Possible (3)
**Effort**: M (root-cause investigation; possibly resolved by fresh shell or system restart)
**WSJF**: (6 x 1.0) / 2 = 3.0

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

### Investigation Tasks

- [ ] Verify build succeeds in CI (clean environment)
- [ ] Reproduce in a fresh terminal session with no stale processes
- [ ] Check if `next build` works after a full system restart
- [ ] Investigate whether TDD hook test runner needs process cleanup on timeout

## Related

- ADR 006: TDD enforcement via hooks (the hook-triggered test runs may contribute to process accumulation)
