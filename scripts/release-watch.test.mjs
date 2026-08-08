import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Behavioural test for the P129 fail-safe guard in scripts/release-watch.sh.
// Repo TDD discipline is vitest + spawnSync (no bats harness in this repo;
// precedent: scripts/push-watch.test.mjs, scripts/fix-deps.test.mjs).
//
// Unlike push-watch.sh and fix-deps.sh, this script has no *_LIB_ONLY seam and
// no pure helper worth probing, so there is no probe path to preserve here and
// the guard takes no opt-in variable. It is pure accident-prevention: the body
// runs `gh pr merge`, `git commit` and `git push`, so a stray source publishes a
// release. That makes it the highest-consequence of the three guards and the
// cheapest to test, because it needs no environment setup at all.
//
// Probes run from a scratch directory that is NOT a git repo, so a regression
// cannot reach a real remote.

const SCRIPT = join(process.cwd(), 'scripts/release-watch.sh');

function runBash(script) {
  return spawnSync('bash', ['-c', script], { encoding: 'utf8', timeout: 30000 });
}

describe('release-watch.sh: sourced guard (P129)', () => {
  const sourceFromScratch = (tail) =>
    runBash(
      [
        'set +e',
        'cd "$(mktemp -d)" || exit 9',
        `source ${JSON.stringify(SCRIPT)}`,
        tail,
      ].join('\n'),
    );

  it('refuses the flow and names the correct incantation', () => {
    const r = sourceFromScratch('echo "RC=$?"');
    expect(r.stderr).toContain('refusing to run the release flow');
    expect(r.stderr).toContain('npm run release:watch');
    expect(r.stdout).toContain('RC=0');
  });

  it('leaves the helpers undefined, so nothing below the guard ran', () => {
    const r = sourceFromScratch(
      'type -t show_failure_guidance || echo HELPER_UNDEFINED',
    );
    expect(r.stdout).toContain('HELPER_UNDEFINED');
  });

  // The guard sits above BOTH `set -euo pipefail` and the `gh repo view` call
  // that follows it. Below either one, a read-only probe would still leave
  // errexit and nounset switched on in the caller and still fire a network call.
  it('does not leak errexit or nounset into the probing shell', () => {
    const r = runBash(
      [
        'cd "$(mktemp -d)" || exit 9',
        `source ${JSON.stringify(SCRIPT)} 2>/dev/null`,
        'false',
        'echo ERREXIT_NOT_LEAKED',
        'echo "NOUNSET_NOT_LEAKED=[${WR_P129_NEVER_SET}]"',
      ].join('\n'),
    );
    expect(r.stdout).toContain('ERREXIT_NOT_LEAKED');
    expect(r.stdout).toContain('NOUNSET_NOT_LEAKED=[]');
  });
});

// All three P129 guards are inert on the executed path for exactly one reason:
// npm invokes these scripts as `bash scripts/<name>.sh`, where $0 and
// ${BASH_SOURCE[0]} are the same string. Rewriting one of these entries to
// source the file, or wrapping it, would silently flip each guard from a
// backstop into a block on the real flow, and no other test here would notice.
describe('package.json invokes the guarded scripts by execution (P129)', () => {
  const { scripts } = JSON.parse(
    readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
  );

  it.each([
    ['push:watch', 'scripts/push-watch.sh'],
    ['fix:deps', 'scripts/fix-deps.sh'],
    ['release:watch', 'scripts/release-watch.sh'],
  ])('runs %s as an executed bash script', (name, path) => {
    expect(scripts[name]).toBe(`bash ${path}`);
  });
});
