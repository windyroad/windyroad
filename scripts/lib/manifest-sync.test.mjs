import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Behavioural test for the P126 / RFC-006 manifest-hygiene scans in
// scripts/lib/manifest-sync.sh. Repo TDD discipline is vitest + spawnSync
// (no bats harness here; precedent: scripts/fix-deps.test.mjs).
// The library is pure and sourceable on its own, so no LIB_ONLY seam is
// needed: sourcing it defines the two scans and nothing else.

const LIB = join(process.cwd(), 'scripts/lib/manifest-sync.sh');

// Source the library, then run a probe body. Probe bodies run under `set +e`
// so a non-zero helper return does not abort the shell.
function probe(body) {
  return spawnSync('bash', ['-c', `set +e\nsource ${JSON.stringify(LIB)}\n${body}`], {
    encoding: 'utf8',
    timeout: 30000,
  }).stdout.trim();
}

// Write a package.json / package-lock.json pair to a throwaway dir and return
// the two paths, so each case states exactly the shape it is testing.
function manifests(pkg, lock) {
  const dir = mkdtempSync(join(tmpdir(), 'manifest-sync-'));
  const pkgPath = join(dir, 'package.json');
  const lockPath = join(dir, 'package-lock.json');
  writeFileSync(pkgPath, JSON.stringify(pkg));
  writeFileSync(lockPath, JSON.stringify(lock));
  return { pkgPath, lockPath };
}

// A lockfile whose root entry records the given dependency blocks.
function lockWithRoot(blocks) {
  return { lockfileVersion: 3, packages: { '': { name: 'x', version: '1.0.0', ...blocks } } };
}

describe('manifest-sync.sh: manifest_sync_violations', () => {
  it('reports nothing when the declared specs and the lockfile root agree', () => {
    const { pkgPath, lockPath } = manifests(
      { dependencies: { a: '1.0.0' }, devDependencies: { b: '2.0.0' } },
      lockWithRoot({ dependencies: { a: '1.0.0' }, devDependencies: { b: '2.0.0' } }),
    );
    expect(probe(`manifest_sync_violations ${pkgPath} ${lockPath}`)).toBe('');
  });

  // The observed P126 defect: `dry-aged-deps --update` bumps package.json and
  // no install follows, so the lockfile root still records the old spec.
  it('reports the key when package.json was bumped and the lockfile was not', () => {
    const { pkgPath, lockPath } = manifests(
      { devDependencies: { vitest: '4.1.10' } },
      lockWithRoot({ devDependencies: { vitest: '3.2.4' } }),
    );
    const out = probe(`manifest_sync_violations ${pkgPath} ${lockPath}`);
    expect(out).toContain('vitest');
    expect(out).toContain('4.1.10');
    expect(out).toContain('3.2.4');
    expect(out.split('\n')).toHaveLength(1);
  });

  it('reports a dependency declared in package.json but missing from the lockfile root', () => {
    const { pkgPath, lockPath } = manifests(
      { dependencies: { a: '1.0.0', fresh: '9.9.9' } },
      lockWithRoot({ dependencies: { a: '1.0.0' } }),
    );
    const out = probe(`manifest_sync_violations ${pkgPath} ${lockPath}`);
    expect(out).toContain('fresh');
    expect(out).toContain('absent');
    expect(out.split('\n')).toHaveLength(1);
  });

  it('reports a dependency left in the lockfile root after package.json dropped it', () => {
    const { pkgPath, lockPath } = manifests(
      { dependencies: { a: '1.0.0' } },
      lockWithRoot({ dependencies: { a: '1.0.0', dropped: '1.2.3' } }),
    );
    const out = probe(`manifest_sync_violations ${pkgPath} ${lockPath}`);
    expect(out).toContain('dropped');
    expect(out.split('\n')).toHaveLength(1);
  });

  it('spans dependencies, devDependencies and optionalDependencies', () => {
    const { pkgPath, lockPath } = manifests(
      { dependencies: { a: '1' }, devDependencies: { b: '2' }, optionalDependencies: { c: '3' } },
      lockWithRoot({ dependencies: { a: '1' }, devDependencies: { b: '9' }, optionalDependencies: { c: '9' } }),
    );
    const out = probe(`manifest_sync_violations ${pkgPath} ${lockPath}`);
    expect(out.split('\n').sort()).toHaveLength(2);
    expect(out).toContain('b');
    expect(out).toContain('c');
  });

  it('tolerates a lockfile with no root packages entry', () => {
    const { pkgPath, lockPath } = manifests({ dependencies: {} }, { lockfileVersion: 3, packages: {} });
    expect(probe(`manifest_sync_violations ${pkgPath} ${lockPath}`)).toBe('');
  });

  // Regression anchor: this repository's own manifests must read as coherent,
  // so a green suite means the scan is not simply reporting everything.
  it('reports nothing for this repository\'s committed manifests', () => {
    expect(probe('manifest_sync_violations package.json package-lock.json')).toBe('');
  });
});

describe('manifest-sync.sh: lockfile_resolution_delta', () => {
  // push:watch commits its refreshed pair without running lint, test or build
  // (ADR-034 rejected moving that flow into push:watch). That is only safe when
  // the regenerated lockfile is a pure spec-sync: a change confined to the root
  // `packages[""]` block cannot alter what npm actually installs. Anything that
  // moves a resolved entry changes the installed tree, so push:watch declines it
  // and lets `npm run fix:deps` apply its CI-parity gate instead (P126 / RFC-006).
  function locks(before, after) {
    const dir = mkdtempSync(join(tmpdir(), 'lock-delta-'));
    const a = join(dir, 'before.json');
    const b = join(dir, 'after.json');
    writeFileSync(a, JSON.stringify(before));
    writeFileSync(b, JSON.stringify(after));
    return { a, b };
  }

  it('reports nothing when only the root spec block moved', () => {
    const { a, b } = locks(
      { packages: { '': { devDependencies: { vitest: '3.2.4' } }, 'node_modules/vitest': { version: '4.1.10' } } },
      { packages: { '': { devDependencies: { vitest: '4.1.10' } }, 'node_modules/vitest': { version: '4.1.10' } } },
    );
    expect(probe(`lockfile_resolution_delta ${a} ${b}`)).toBe('');
  });

  it('reports a resolved entry whose version changed', () => {
    const { a, b } = locks(
      { packages: { '': {}, 'node_modules/left-pad': { version: '1.0.0' } } },
      { packages: { '': {}, 'node_modules/left-pad': { version: '2.0.0' } } },
    );
    expect(probe(`lockfile_resolution_delta ${a} ${b}`)).toBe('node_modules/left-pad');
  });

  it('reports an added resolved entry', () => {
    const { a, b } = locks(
      { packages: { '': {} } },
      { packages: { '': {}, 'node_modules/new-transitive': { version: '1.0.0' } } },
    );
    expect(probe(`lockfile_resolution_delta ${a} ${b}`)).toBe('node_modules/new-transitive');
  });

  it('reports a removed resolved entry', () => {
    const { a, b } = locks(
      { packages: { '': {}, 'node_modules/gone': { version: '1.0.0' } } },
      { packages: { '': {} } },
    );
    expect(probe(`lockfile_resolution_delta ${a} ${b}`)).toBe('node_modules/gone');
  });

  it('reports nothing when the two lockfiles are identical', () => {
    const { a, b } = locks(
      { packages: { '': {}, 'node_modules/x': { version: '1.0.0' } } },
      { packages: { '': {}, 'node_modules/x': { version: '1.0.0' } } },
    );
    expect(probe(`lockfile_resolution_delta ${a} ${b}`)).toBe('');
  });
});

describe('manifest-sync.sh: lockfile_platform_flag_violations (relocated from fix-deps.sh)', () => {
  // Behavioural coverage for this scan lives in scripts/fix-deps.test.mjs and
  // still reaches it through the FIX_DEPS_LIB_ONLY seam. This case only pins
  // that the relocated definition is reachable from the library itself.
  it('is defined by the library and passes this repository\'s lockfile', () => {
    expect(probe('type -t lockfile_platform_flag_violations')).toBe('function');
    expect(probe('lockfile_platform_flag_violations package-lock.json')).toBe('');
  });
});

// ── P168: installed_tree_desync ───────────────────────────────────────────────
// The freshness checker (dry-aged-deps --check) reports the INSTALLED version as
// current, while fix-deps.sh completes its manifest pair with
// `npm install --package-lock-only`, which never touches node_modules. So a
// fully successful fix:deps can leave the push gate blocking on the package it
// just updated, with nothing in any tracked file showing why. This scan is the
// missing comparison: what the lockfile pins against what is actually on disk.
function installed(lock, tree) {
  const dir = mkdtempSync(join(tmpdir(), 'installed-desync-'));
  const lockPath = join(dir, 'package-lock.json');
  writeFileSync(lockPath, JSON.stringify(lock));
  const nm = join(dir, 'node_modules');
  mkdirSync(nm, { recursive: true });
  for (const [name, version] of Object.entries(tree)) {
    const pkgDir = join(nm, ...name.split('/'));
    mkdirSync(pkgDir, { recursive: true });
    writeFileSync(join(pkgDir, 'package.json'), JSON.stringify({ name, version }));
  }
  return { lockPath, nm };
}

describe('manifest-sync.sh: installed_tree_desync (P168)', () => {
  // Guard the negative cases below. A scan that does not exist also prints
  // nothing, so every `toBe('')` here passes trivially against an absent
  // function. This case is what makes the silence mean something, and it is
  // the lesson P162 and the briefing's verification-discipline entry record:
  // write the check against the requirement, not against what you just wrote.
  it('is defined by the library', () => {
    expect(probe('type -t installed_tree_desync')).toBe('function');
  });

  it('reports the package whose installed copy is behind the lockfile', () => {
    // The exact observed shape: lockfile and package.json both committed at
    // 2.17.1, node_modules still carrying 2.14.0, freshness gate never clears.
    const { lockPath, nm } = installed(
      { packages: { '': {}, 'node_modules/dry-aged-deps': { version: '2.17.1' } } },
      { 'dry-aged-deps': '2.14.0' },
    );
    expect(probe(`installed_tree_desync ${lockPath} ${nm}`))
      .toBe('dry-aged-deps: locked 2.17.1 vs installed 2.14.0');
  });

  it('is silent when the installed tree matches the lockfile', () => {
    const { lockPath, nm } = installed(
      { packages: { '': {}, 'node_modules/dry-aged-deps': { version: '2.17.1' } } },
      { 'dry-aged-deps': '2.17.1' },
    );
    expect(probe(`installed_tree_desync ${lockPath} ${nm}`)).toBe('');
  });

  it('ignores a locked package that is not installed at all', () => {
    // An absent optional or platform-specific dependency is not a desync: it was
    // never installed on this platform, so there is no stale copy to clear.
    // Reporting it would make the scan fire constantly on a healthy tree.
    const { lockPath, nm } = installed(
      { packages: { '': {}, 'node_modules/only-on-linux': { version: '1.0.0' } } },
      {},
    );
    expect(probe(`installed_tree_desync ${lockPath} ${nm}`)).toBe('');
  });

  it('ignores nested entries and reads only top-level installs', () => {
    // A nested node_modules/a/node_modules/b copy is npm resolving a conflict,
    // not staleness. Comparing it against the top-level tree would report a
    // desync that no reinstall can fix.
    const { lockPath, nm } = installed(
      { packages: { '': {}, 'node_modules/a/node_modules/b': { version: '9.9.9' } } },
      { a: '1.0.0' },
    );
    expect(probe(`installed_tree_desync ${lockPath} ${nm}`)).toBe('');
  });

  it('handles a scoped package', () => {
    const { lockPath, nm } = installed(
      { packages: { '': {}, 'node_modules/@scope/pkg': { version: '2.0.0' } } },
      { '@scope/pkg': '1.0.0' },
    );
    expect(probe(`installed_tree_desync ${lockPath} ${nm}`))
      .toBe('@scope/pkg: locked 2.0.0 vs installed 1.0.0');
  });

  it('reports every desynced package, not just the first', () => {
    const { lockPath, nm } = installed(
      { packages: { '': {}, 'node_modules/a': { version: '2.0.0' }, 'node_modules/b': { version: '3.0.0' } } },
      { a: '1.0.0', b: '1.0.0' },
    );
    expect(probe(`installed_tree_desync ${lockPath} ${nm}`).split('\n').sort())
      .toEqual(['a: locked 2.0.0 vs installed 1.0.0', 'b: locked 3.0.0 vs installed 1.0.0']);
  });

  it('is silent when the node_modules directory does not exist', () => {
    // Nothing installed is a fresh clone, not a stale tree. `npm ci` is the
    // answer there and it is not this scan's job to say so.
    const { lockPath } = installed({ packages: { '': {}, 'node_modules/a': { version: '1.0.0' } } }, {});
    expect(probe(`installed_tree_desync ${lockPath} /nonexistent-tree-${process.pid}`)).toBe('');
  });
});
