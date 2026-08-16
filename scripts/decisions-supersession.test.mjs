import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Decision-relationship integrity (ADR-054).
//
// ADR-054 holds that a decision is changed by a new decision, never by editing
// the old one, and that the redirect lives in frontmatter so a reader meets it
// before the superseded prose. That only works if the graph is sound, and
// before this file existed it was not: eleven `amends:` claims across the
// corpus had no reciprocal pointer, including all eight of ADR-052's.
//
// Two properties are asserted. Every slug named in a relationship resolves to a
// decision on disk, and every claim is reciprocal. Plus the amendment-section
// allowlist, which is how the never-amend rule stops being memory.

const DIR = 'docs/decisions';

// The six records carrying an `## Amendment` section from before ADR-054.
// ADR-054 keeps them deliberately: retrofitting means editing prose in live
// records, which is the act it forbids. A seventh entry here is a violation,
// not a maintenance task.
const AMENDMENT_ALLOWLIST = new Set([
  '019-capture-transcript-artifact',
  '020-newsletter-editor-subagent',
  '026-reviews-and-meta-content-to-sibling-files',
  '032-newsletter-editorial-discipline-policy',
  '042-newsletter-adversarial-skeptic-gate',
  '043-bounded-editorial-remediation-loop-for-editor-and-skeptic-gates',
]);

const STATUS = /\.(proposed|accepted|superseded|rejected|deprecated)\.md$/;

function adrFiles() {
  return readdirSync(DIR).filter((f) => /^\d{3}-.*\.md$/.test(f));
}

function slugOf(file) {
  return file.replace(STATUS, '').replace(/\.md$/, '');
}

function frontmatter(file) {
  const src = readFileSync(join(DIR, file), 'utf8');
  if (!src.startsWith('---\n')) return '';
  const end = src.indexOf('\n---\n', 4);
  return end === -1 ? '' : src.slice(4, end);
}

// Both keys appear as bracketed lists (`amends: [a, b]`) and as bare scalars
// (`superseded-by: a`). Accept either rather than pinning one shape.
function rel(fm, key) {
  const list = fm.match(new RegExp(`^${key}: \\[([^\\]]*)\\]`, 'm'));
  if (list) return list[1].split(',').map((s) => s.trim()).filter(Boolean);
  const scalar = fm.match(new RegExp(`^${key}:\\s*(\\S+)`, 'm'));
  return scalar ? [scalar[1]] : [];
}

const PAIRS = [
  { forward: 'amends', back: 'amended-by' },
  { forward: 'supersedes', back: 'superseded-by' },
];

describe('decision relationships (ADR-054)', () => {
  const files = adrFiles();
  const slugs = new Set(files.map(slugOf));

  it('finds decision records to check', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it('every slug named in a relationship resolves to a decision on disk', () => {
    for (const f of files) {
      const fm = frontmatter(f);
      for (const { forward, back } of PAIRS) {
        for (const key of [forward, back]) {
          for (const target of rel(fm, key)) {
            expect(slugs.has(target), `${f} names ${target} under ${key}, which is not a decision file`).toBe(true);
          }
        }
      }
    }
  });

  it.each(PAIRS)('every $forward claim carries its reciprocal $back pointer', ({ forward, back }) => {
    const backBySlug = new Map(files.map((f) => [slugOf(f), rel(frontmatter(f), back)]));
    for (const f of files) {
      const from = slugOf(f);
      for (const target of rel(frontmatter(f), forward)) {
        expect(
          backBySlug.get(target) ?? [],
          `${target} is named by ${from} under ${forward} but does not carry ${back}: ${from}`,
        ).toContain(from);
      }
    }
  });

  it.each(PAIRS)('every $back pointer is claimed by the decision it names under $forward', ({ forward, back }) => {
    const fwdBySlug = new Map(files.map((f) => [slugOf(f), rel(frontmatter(f), forward)]));
    for (const f of files) {
      for (const target of rel(frontmatter(f), back)) {
        expect(
          fwdBySlug.get(target) ?? [],
          `${f} points at ${target} under ${back}, but ${target} does not name it under ${forward}`,
        ).toContain(slugOf(f));
      }
    }
  });

  // A retired decision must say what replaced it. Reciprocity cannot catch this:
  // a record that declares no relationship at all is invisible to it, which is
  // how ADR-003 sat superseded with no pointer and nothing noticed.
  it('every superseded decision names its successor', () => {
    const dead = files
      .filter((f) => f.endsWith('.superseded.md'))
      .filter((f) => rel(frontmatter(f), 'superseded-by').length === 0)
      .map(slugOf);
    expect(dead, 'a superseded decision with no superseded-by is a dead end for a reader').toEqual([]);
  });

  // The never-amend rule, enforced rather than remembered. An allowlist rather
  // than a date test, because a date cannot catch an amendment appended to an
  // old record.
  it('no decision gains an amendment section beyond the six ADR-054 grandfathers', () => {
    const found = files
      // Any heading level, because `### Amendment` evades a `## `-only test.
      // Deliberately not `Amend`: `### What this amends in ADR-036` and
      // `### Amend ADR 012 in place` sit in the AMENDING record and are fine.
      .filter((f) => /^#{2,4} +Amendment\b/m.test(readFileSync(join(DIR, f), 'utf8')))
      .map(slugOf)
      .filter((s) => !AMENDMENT_ALLOWLIST.has(s));
    expect(
      found,
      'ADR-054: a decision is changed by a new decision, never by editing the old one',
    ).toEqual([]);
  });
});
