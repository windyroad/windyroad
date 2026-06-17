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
