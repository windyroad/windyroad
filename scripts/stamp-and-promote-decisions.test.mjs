import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// Age-based promotion must not promote an unratified decision (P179).
//
// Pass 2 of scripts/post-release.d/stamp-and-promote-decisions.sh rewrites
// `status: proposed` to `accepted` once a record is DECISION_PROMOTION_DAYS
// past its first release. Before this file existed it decided that on age
// alone and never read `human-oversight`, so a record Tom had not ratified
// would silently present itself as an accepted decision. ADR-058 was the first
// `unconfirmed` record in the DECISION corpus, which is what surfaced it. (The
// RFC tier has carried unconfirmed records for longer; this promoter never
// walks that directory.)
//
// The property asserted is narrow and load-bearing: age is necessary for
// promotion, never sufficient. `human-oversight: confirmed` is also required.
// Stamping (pass 1) is deliberately unguarded, recording when a record first
// shipped is a fact about the release, not a claim about ratification.

const SCRIPT = join(process.cwd(), 'scripts/post-release.d/stamp-and-promote-decisions.sh');

let repo;

function git(...args) {
  execFileSync('git', args, { cwd: repo, stdio: 'pipe' });
}

/** Write a proposed ADR that first shipped `age` days before RELEASE_DATE. */
function adr(slug, { oversight, age = 30 }) {
  const released = new Date(Date.UTC(2026, 0, 1) - age * 86400000)
    .toISOString()
    .slice(0, 10);
  const fm = [
    '---',
    'status: "proposed"',
    `first-released: ${released}`,
    ...(oversight === undefined ? [] : [`human-oversight: ${oversight}`]),
    '---',
    '',
    `# ${slug}`,
    '',
  ].join('\n');
  writeFileSync(join(repo, 'docs/decisions', `${slug}.proposed.md`), fm);
}

/** Run pass 1 + pass 2 with an empty file list, as a cold-start run does. */
function run() {
  execFileSync('bash', [SCRIPT], {
    cwd: repo,
    env: { ...process.env, RELEASE_DATE: '2026-01-01', DECISION_PROMOTION_DAYS: '14' },
    input: '',
    stdio: 'pipe',
  });
}

const statusOf = (slug) => {
  for (const state of ['proposed', 'accepted']) {
    const p = join(repo, 'docs/decisions', `${slug}.${state}.md`);
    if (existsSync(p)) return { state, body: readFileSync(p, 'utf8') };
  }
  return { state: 'missing', body: '' };
};

beforeEach(() => {
  repo = mkdtempSync(join(tmpdir(), 'promote-'));
  mkdirSync(join(repo, 'docs/decisions'), { recursive: true });
  git('init', '-q');
  git('config', 'user.email', 't@example.com');
  git('config', 'user.name', 'T');
});

afterEach(() => rmSync(repo, { recursive: true, force: true }));

describe('stamp-and-promote-decisions age-based promotion', () => {
  it('promotes a well-aged decision that a human has confirmed', () => {
    adr('100-confirmed', { oversight: 'confirmed' });
    git('add', '-A');
    git('commit', '-qm', 'seed');

    run();

    const { state, body } = statusOf('100-confirmed');
    expect(state).toBe('accepted');
    expect(body).toMatch(/^status: "accepted"$/m);
  });

  it('does NOT promote a well-aged decision that is still unconfirmed', () => {
    adr('101-unconfirmed', { oversight: 'unconfirmed' });
    git('add', '-A');
    git('commit', '-qm', 'seed');

    run();

    const { state, body } = statusOf('101-unconfirmed');
    expect(state).toBe('proposed');
    expect(body).toMatch(/^status: "proposed"$/m);
    expect(body).not.toMatch(/accepted-date:/);
  });

  it('does NOT promote a decision with no human-oversight field at all', () => {
    // Absence is not confirmation. A record predating the marker must not be
    // promoted by default, which is the fail-closed half of the guard.
    adr('102-no-marker', { oversight: undefined });
    git('add', '-A');
    git('commit', '-qm', 'seed');

    run();

    expect(statusOf('102-no-marker').state).toBe('proposed');
  });

  it('leaves a confirmed but too-young decision alone', () => {
    adr('103-young', { oversight: 'confirmed', age: 3 });
    git('add', '-A');
    git('commit', '-qm', 'seed');

    run();

    expect(statusOf('103-young').state).toBe('proposed');
  });

  it('still stamps first-released on an unconfirmed decision', () => {
    // Stamping records a release fact and is not gated on ratification.
    writeFileSync(
      join(repo, 'docs/decisions', '104-fresh.proposed.md'),
      '---\nstatus: "proposed"\nhuman-oversight: unconfirmed\n---\n\n# fresh\n',
    );
    git('add', '-A');
    git('commit', '-qm', 'seed');

    execFileSync('bash', [SCRIPT], {
      cwd: repo,
      env: { ...process.env, RELEASE_DATE: '2026-01-01', DECISION_PROMOTION_DAYS: '14' },
      input: 'docs/decisions/104-fresh.proposed.md\n',
      stdio: 'pipe',
    });

    const { state, body } = statusOf('104-fresh');
    expect(state).toBe('proposed');
    expect(body).toMatch(/^first-released: 2026-01-01$/m);
  });
});
