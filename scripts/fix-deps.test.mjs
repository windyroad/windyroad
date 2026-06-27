import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

// Behavioural test for the pure helper in scripts/fix-deps.sh (P072 / ADR-034
// Phase 1 repo-local deps-fix flow). Repo TDD discipline is vitest + spawnSync
// (no bats harness in this repo; precedent: scripts/push-watch.test.mjs).
// The script exposes its helpers via a one-line "lib-only" seam: sourcing with
// FIX_DEPS_LIB_ONLY=1 defines the functions and returns before the
// detect/update/test/commit flow runs (mirrors PUSH_WATCH_LIB_ONLY).

const SCRIPT = join(process.cwd(), 'scripts/fix-deps.sh');
const EM_DASH = String.fromCharCode(0x2014);

function runBash(script) {
  return spawnSync('bash', ['-c', script], { encoding: 'utf8', timeout: 30000 });
}

// Source the script in lib-only mode, then run a probe body.
function probe(body) {
  return runBash(
    `set +e\nexport FIX_DEPS_LIB_ONLY=1\nsource ${JSON.stringify(SCRIPT)}\n${body}`,
  ).stdout.trim();
}

// Write a dry-aged-deps JSON fixture to a temp file and return its path.
function fixture(json) {
  const dir = mkdtempSync(join(tmpdir(), 'fix-deps-'));
  const path = join(dir, 'updates.json');
  writeFileSync(path, JSON.stringify(json));
  return path;
}

describe('fix-deps.sh: fix_deps_commit_body', () => {
  it('lists only packages whose version actually changed', () => {
    const f = fixture([
      { name: 'react', current: '18.0.0', recommended: '18.2.0' },
      { name: 'unchanged-pkg', current: '1.0.0', recommended: '1.0.0' },
    ]);
    const out = probe(`fix_deps_commit_body ${JSON.stringify(f)}`);
    expect(out).toContain('react 18.0.0 -> 18.2.0');
    expect(out).not.toContain('unchanged-pkg');
  });

  it('handles the {rows:[...]} wrapper shape', () => {
    const f = fixture({
      rows: [{ name: 'next', current: '15.0.0', recommended: '16.0.0' }],
    });
    const out = probe(`fix_deps_commit_body ${JSON.stringify(f)}`);
    expect(out).toContain('next 15.0.0 -> 16.0.0');
  });

  it('emits a generic body when no package actually changed', () => {
    const f = fixture([
      { name: 'still-maturing', current: '2.0.0', recommended: '2.0.0' },
    ]);
    const out = probe(`fix_deps_commit_body ${JSON.stringify(f)}`);
    expect(out).toContain('Routine dependency maintenance');
    expect(out).not.toContain('still-maturing');
  });

  it('does not emit a U+2014 em-dash in the commit body', () => {
    const f = fixture([
      { name: 'react', current: '18.0.0', recommended: '18.2.0' },
    ]);
    const out = probe(`fix_deps_commit_body ${JSON.stringify(f)}`);
    expect(out).not.toContain(EM_DASH);
  });
});

// P095: the exact-pin deadlock. `dry-aged-deps --update` writes `wanted` to
// package.json; an exact pin caps wanted == current so --update no-ops, but
// --check still flags the dep because `recommended` (the matured target) is
// newer. exact_pin_deadlock_targets parses --check --format=json and emits one
// "name@recommended type" line per package we must bump with --save-exact.
describe('fix-deps.sh: exact_pin_deadlock_targets', () => {
  it('emits name@recommended and type for a flagged exact-pin dep', () => {
    const f = fixture({
      packages: [
        { name: 'sass', type: 'dev', current: '1.99.0', wanted: '1.99.0', recommended: '1.101.0', filtered: false },
      ],
    });
    const out = probe(`exact_pin_deadlock_targets ${JSON.stringify(f)}`);
    expect(out).toBe('sass@1.101.0 dev');
  });

  it('reports prod deps as prod', () => {
    const f = fixture({
      packages: [
        { name: 'react', type: 'prod', current: '19.2.6', wanted: '19.2.6', recommended: '19.2.7', filtered: false },
      ],
    });
    const out = probe(`exact_pin_deadlock_targets ${JSON.stringify(f)}`);
    expect(out).toBe('react@19.2.7 prod');
  });

  it('excludes filtered (not-yet-mature) packages', () => {
    const f = fixture({
      packages: [
        { name: 'too-fresh', type: 'prod', current: '1.0.0', recommended: '2.0.0', filtered: true },
      ],
    });
    const out = probe(`exact_pin_deadlock_targets ${JSON.stringify(f)}`);
    expect(out).toBe('');
  });

  it('excludes packages whose recommended equals current (nothing to bump)', () => {
    const f = fixture({
      packages: [
        { name: 'current-already', type: 'dev', current: '3.0.0', recommended: '3.0.0', filtered: false },
      ],
    });
    const out = probe(`exact_pin_deadlock_targets ${JSON.stringify(f)}`);
    expect(out).toBe('');
  });

  it('emits one line per deadlocked dep and tolerates an empty/clean check', () => {
    const many = fixture({
      packages: [
        { name: 'sass', type: 'dev', current: '1.99.0', recommended: '1.101.0', filtered: false },
        { name: 'react', type: 'prod', current: '19.2.6', recommended: '19.2.7', filtered: false },
      ],
    });
    const out = probe(`exact_pin_deadlock_targets ${JSON.stringify(many)}`);
    expect(out.split('\n').sort()).toEqual(['react@19.2.7 prod', 'sass@1.101.0 dev']);

    const clean = fixture({ packages: [] });
    expect(probe(`exact_pin_deadlock_targets ${JSON.stringify(clean)}`)).toBe('');
  });
});
