import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Behavioural test for the Actions pin-form lint (P141, ADR-055). It spawns the
// script against fixture directories and asserts on exit code and stdout, per
// the repo's vitest discipline (precedent: scripts/check-newsletter-structure.test.mjs).

const SCRIPT = join(process.cwd(), 'scripts/check-action-pins.sh');
const SHA = 'a'.repeat(40);
const DIGEST = 'sha256:' + 'b'.repeat(64);

function lint(files) {
  const dir = mkdtempSync(join(tmpdir(), 'action-pins-'));
  for (const [name, body] of Object.entries(files)) writeFileSync(join(dir, name), body);
  return spawnSync('bash', [SCRIPT, dir], { encoding: 'utf8' });
}

// A workflow with a top-level permissions block and one step, for the pin cases.
const wf = (usesLine) => `permissions:\n  contents: read\njobs:\n  a:\n    steps:\n      - uses: ${usesLine}\n`;

describe('check-action-pins.sh', () => {
  it('passes this repo\u2019s own workflows', () => {
    const r = spawnSync('bash', [SCRIPT, '.github/workflows'], { encoding: 'utf8' });
    expect(r.stdout).toMatch(/^check-action-pins: OK/m);
    expect(r.status).toBe(0);
  });

  // Mirrors the CI step rather than assuming it (R2 of the P141 commit-gate
  // score). Every other case spawns the script via `bash [SCRIPT, dir]`, which
  // is structurally blind to HOW main-pipeline.yml invokes it. This case reads
  // the step's run: command out of the workflow and executes that exact string,
  // so a drift between the step and the file reddens here rather than at the
  // root of the release graph, where there is no override valve.
  it('runs green using the exact command main-pipeline.yml invokes', () => {
    const wf = readFileSync('.github/workflows/main-pipeline.yml', 'utf8');
    const step = wf.match(/- name: Check action pin form\n\s*run: (.+)\n/);
    expect(step, 'the "Check action pin form" step is missing from main-pipeline.yml').not.toBeNull();
    const r = spawnSync(step[1], { shell: true, encoding: 'utf8', cwd: process.cwd() });
    expect(r.stdout).toMatch(/^check-action-pins: OK/m);
    expect(r.status).toBe(0);
  });

  it('exits 2 on a directory that does not exist', () => {
    expect(spawnSync('bash', [SCRIPT, '/nope/nope'], { encoding: 'utf8' }).status).toBe(2);
  });

  // Rule 1: third-party pins a commit SHA. This is the P141 defect.
  it('rejects a third-party action on a moving branch', () => {
    const r = lint({ 'w.yml': wf('trufflesecurity/trufflehog@main') });
    expect(r.stdout).toMatch(/third-party 'trufflesecurity\/trufflehog@main' must pin a 40-char commit SHA/);
    expect(r.status).toBe(1);
  });

  it('rejects a third-party action on a version tag', () => {
    expect(lint({ 'w.yml': wf('peter-evans/create-pull-request@v7') }).status).toBe(1);
  });

  it.each([
    ['third-party SHA', `trufflesecurity/trufflehog@${SHA} # v3.97.0`],
    ['reusable workflow SHA', `owner/repo/.github/workflows/x.yml@${SHA}`],
    ['first-party major tag', 'actions/checkout@v6'],
    ['quoted first-party major tag', '"actions/checkout@v6"'],
    ['local composite action', './.github/actions/local'],
    ['digest-pinned container', `docker://alpine@${DIGEST}`],
  ])('accepts %s', (_label, usesLine) => {
    const r = lint({ 'w.yml': wf(usesLine) });
    expect(r.stdout).toMatch(/^check-action-pins: OK/m);
    expect(r.status).toBe(0);
  });

  // Rule 2: first-party pins a MAJOR tag, so a patch tag is a rot risk.
  it('rejects a first-party action on a patch tag', () => {
    const r = lint({ 'w.yml': wf('actions/checkout@v6.1.2') });
    expect(r.stdout).toMatch(/first-party .* must pin a major tag/);
    expect(r.status).toBe(1);
  });

  it('rejects an undigested container step', () => {
    expect(lint({ 'w.yml': wf('docker://alpine:3.20') }).status).toBe(1);
  });

  // Fail closed, and say so, rather than skipping a form it was never taught.
  it('rejects a uses: form it cannot classify', () => {
    const r = lint({ 'w.yml': wf('some-nonsense') });
    expect(r.stdout).toMatch(/cannot classify/);
    expect(r.status).toBe(1);
  });

  // Rule 5: the block must be TOP level. A job-level-only block is the state
  // main-pipeline.yml was in when P141 was written, so it must not pass.
  it('rejects a workflow whose only permissions block is job-level', () => {
    const r = lint({
      'w.yml': `jobs:\n  a:\n    permissions:\n      contents: read\n    steps:\n      - uses: actions/checkout@v6\n`,
    });
    expect(r.stdout).toMatch(/declares no top-level permissions/);
    expect(r.status).toBe(1);
  });

  it.each([['bare', 'write-all'], ['quoted', '"write-all"']])(
    'rejects %s write-all',
    (_label, value) => {
      const r = lint({
        'w.yml': `permissions: ${value}\njobs:\n  a:\n    steps:\n      - uses: actions/checkout@v6\n`,
      });
      expect(r.stdout).toMatch(/grants write-all/);
      expect(r.status).toBe(1);
    },
  );
});
