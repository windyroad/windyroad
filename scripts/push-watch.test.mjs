import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

// Behavioural test for the P092 robustness helpers in scripts/push-watch.sh.
// Repo TDD discipline is vitest + spawnSync (no bats harness in this repo;
// precedent: scripts/check-newsletter-structure.test.mjs, render-cover.test.mjs).
// The script exposes its helpers for testing via a one-line "lib-only" seam:
// sourcing with PUSH_WATCH_LIB_ONLY=1 defines the functions and returns before
// the push/watch flow runs.

const SCRIPT = join(process.cwd(), 'scripts/push-watch.sh');

function runBash(script) {
  return spawnSync('bash', ['-c', script], { encoding: 'utf8', timeout: 30000 });
}

// Source the script in lib-only mode, then run a probe body. The script sets
// `set -euo pipefail`; probe bodies always test helper return codes inside an
// `if` so a non-transient (return 1) result does not abort the shell.
function probe(body) {
  return runBash(
    `set +e\nexport PUSH_WATCH_LIB_ONLY=1\nsource ${JSON.stringify(SCRIPT)}\n${body}`,
  ).stdout.trim();
}

// Build a throwaway local+origin pair, apply a divergence setup, then probe a
// git-state helper from inside the working clone.
function probeInRepo(setup, body) {
  const script = `
set +e
WORK=$(mktemp -d)
ORIGIN=$(mktemp -d)
git init --bare -b master "$ORIGIN" >/dev/null 2>&1
git clone -q "$ORIGIN" "$WORK" >/dev/null 2>&1
cd "$WORK" || { echo "CLONE_FAIL"; exit 99; }
git config user.email t@example.com
git config user.name tester
echo base > f; git add f; git commit -qm base >/dev/null 2>&1
git push -q origin master >/dev/null 2>&1
git branch --set-upstream-to=origin/master >/dev/null 2>&1
${setup}
export PUSH_WATCH_LIB_ONLY=1
source ${JSON.stringify(SCRIPT)}
${body}
`;
  return runBash(script).stdout.trim();
}

describe('push-watch.sh: is_transient_gh_error (P092 case C)', () => {
  // The fresh-evidence regression: a transient HTTP 401 "Bad credentials" blip
  // while polling a run that genuinely concluded success (run 27609565746).
  it('classifies HTTP 401 / Bad credentials as transient', () => {
    expect(
      probe(
        'if is_transient_gh_error "failed to get run: HTTP 401: Bad credentials"; then echo Y; else echo N; fi',
      ),
    ).toBe('Y');
  });

  it('classifies a connection reset as transient', () => {
    expect(
      probe(
        'if is_transient_gh_error "Get https://api.github.com/...: read: connection reset by peer"; then echo Y; else echo N; fi',
      ),
    ).toBe('Y');
  });

  it('classifies a timeout as transient', () => {
    expect(
      probe(
        'if is_transient_gh_error "net/http: request canceled (Client.Timeout exceeded)"; then echo Y; else echo N; fi',
      ),
    ).toBe('Y');
  });

  it('classifies an HTTP 502 as transient', () => {
    expect(
      probe(
        'if is_transient_gh_error "HTTP 502: Bad Gateway"; then echo Y; else echo N; fi',
      ),
    ).toBe('Y');
  });

  it('does NOT classify a generic non-network message as transient', () => {
    expect(
      probe(
        'if is_transient_gh_error "the run completed with result: failure"; then echo Y; else echo N; fi',
      ),
    ).toBe('N');
  });
});

describe('push-watch.sh: deps_gate_route (P072 / ADR-034 Phase 1 fail-fast)', () => {
  // After the ADR-021 inline auto-resolve, push:watch re-checks dry-aged-deps.
  // A zero exit means deps are clean and the push proceeds; a non-zero exit
  // means stale deps remain that auto-resolve could not clear, so push:watch
  // HALTs and routes the operator to the separate fix flow (npm run fix:deps).
  it('routes a clean dep-check (exit 0) to proceed', () => {
    expect(probe('deps_gate_route 0')).toBe('proceed');
  });

  it('routes a stale dep-check (exit 1) to halt', () => {
    expect(probe('deps_gate_route 1')).toBe('halt');
  });

  it('treats any non-zero exit code as halt', () => {
    expect(probe('deps_gate_route 2')).toBe('halt');
  });

  it('defaults a missing exit code to proceed (no stale signal)', () => {
    expect(probe('deps_gate_route')).toBe('proceed');
  });
});

describe('push-watch.sh: manifest_refresh_route (P126 / RFC-006)', () => {
  // After ADR-021's inline auto-resolve and the lockfile regeneration that
  // completes it, push:watch decides what to do with the refreshed pair. It
  // commits only a coherent pair; an incoherent one is rolled back to the
  // pre-refresh state so the flow degrades to its existing behaviour rather
  // than committing something `npm ci` will reject (P126 defect 1).
  // Args: <authored> <changed> <violations>. `authored` is 1 only when BOTH
  // manifests were clean before the refresh, so every change to them is one
  // this block made and is therefore push:watch's to commit or to undo.
  it('routes a coherent authored refresh to commit', () => {
    expect(probe('manifest_refresh_route 1 1 ""')).toBe('commit');
  });

  it('routes an incoherent authored refresh to rollback', () => {
    expect(probe('manifest_refresh_route 1 1 "vitest: package.json 4.1.10 vs lock 3.2.4"')).toBe(
      'rollback',
    );
  });

  it('routes an unchanged tree to skip', () => {
    expect(probe('manifest_refresh_route 1 0 ""')).toBe('skip');
  });

  // Ownership is symmetric across BOTH acting branches, not just rollback.
  // If the operator arrived with a dirty manifest, push:watch cannot tell its
  // own writes from theirs, so it neither commits their work as chore(deps)
  // nor reverts it. It leaves the tree alone and lets the existing gate halt.
  it('skips a coherent change it cannot prove it authored', () => {
    expect(probe('manifest_refresh_route 0 1 ""')).toBe('skip');
  });

  it('skips an incoherent change it cannot prove it authored', () => {
    expect(probe('manifest_refresh_route 0 1 "vitest: package.json 4.1.10 vs lock 3.2.4"')).toBe(
      'skip',
    );
  });

  it('skips when nothing changed even if the pre-existing pair is incoherent', () => {
    expect(probe('manifest_refresh_route 1 0 "vitest: package.json 4.1.10 vs lock 3.2.4"')).toBe(
      'skip',
    );
  });

  it('defaults missing arguments to skip', () => {
    expect(probe('manifest_refresh_route')).toBe('skip');
  });
});

describe('push-watch.sh: is_sibling_amend (P092 case B)', () => {
  it('detects a sibling-amend (amended just-pushed commit shares a parent with the upstream tip)', () => {
    const out = probeInRepo(
      `echo work > g; git add g; git commit -qm c1 >/dev/null 2>&1
       git push -q origin master >/dev/null 2>&1
       echo work-amended > g; git add g; git commit -q --amend -m c1-amended >/dev/null 2>&1`,
      'if is_sibling_amend; then echo SIBLING; else echo NOT; fi',
    );
    expect(out).toBe('SIBLING');
  }, 15000);

  it('does NOT flag a clean fast-forward-ahead state as a sibling-amend', () => {
    const out = probeInRepo(
      `echo work > g; git add g; git commit -qm c1 >/dev/null 2>&1`,
      'if is_sibling_amend; then echo SIBLING; else echo NOT; fi',
    );
    expect(out).toBe('NOT');
  });

  it('does NOT flag an in-sync HEAD as a sibling-amend', () => {
    const out = probeInRepo(
      '',
      'if is_sibling_amend; then echo SIBLING; else echo NOT; fi',
    );
    expect(out).toBe('NOT');
  });
});
