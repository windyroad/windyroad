import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// The em-dash scrub in scripts/render-story-map.sh (P180).
//
// The upstream story-map renderer emits U+2014 at sites this repository's
// no-em-dash hooks block, and regenerates the vendored stylesheet on every
// render, so hand-scrubbing is reverted by construction. The wrapper scrubs
// post-render instead. That scrub is the only thing standing between a render
// and a blocked commit, and it had two defects this file exists to pin:
//
//   1. A line ending in an em-dash became a line ending in " ,", because only
//      the surrounded-by-spaces and bare cases were handled.
//   2. The first fix for that used \s*, which consumed the trailing newline and
//      spliced the following line onto it. That is a worse corruption than the
//      defect it replaced, and nothing caught it but a hand read of the output.
//
// The scrub function is extracted from the script rather than reimplemented, so
// a change to the script that breaks these cases fails here.

const SCRIPT = join(process.cwd(), 'scripts/render-story-map.sh');
const EMDASH = '\u2014';

let dir;
beforeEach(() => { dir = mkdtempSync(join(tmpdir(), 'scrub-')); });
afterEach(() => rmSync(dir, { recursive: true, force: true }));

/** Run the script's own scrub() over `text` by sourcing the script's definition. */
function scrub(text) {
  const f = join(dir, 'sample.txt');
  writeFileSync(f, text);
  // Pull the scrub definition out of the script so the test exercises the real
  // regex, not a copy of it that can drift.
  const src = readFileSync(SCRIPT, 'utf8');
  const line = src.split('\n').find((l) => l.startsWith('scrub() {'));
  if (!line) throw new Error('scrub() definition not found in render-story-map.sh');
  execFileSync('bash', ['-c', `${line}\nscrub "$1"`, 'bash', f], { stdio: 'pipe' });
  return readFileSync(f, 'utf8');
}

describe('render-story-map.sh scrub', () => {
  it('replaces a spaced em-dash with a comma', () => {
    expect(scrub(`Draft ${EMDASH} not yet agreed.\n`)).toBe('Draft, not yet agreed.\n');
  });

  it('replaces a bare em-dash with a comma', () => {
    expect(scrub(`a${EMDASH}b\n`)).toBe('a,b\n');
  });

  it('drops a line-final em-dash instead of leaving a dangling comma', () => {
    const out = scrub(`the italic IS the channel ${EMDASH}\n`);
    expect(out).toBe('the italic IS the channel\n');
    expect(out).not.toMatch(/ ,/);
  });

  it('does NOT splice the following line onto a line-final em-dash', () => {
    // The \s* regression: a greedy whitespace class eats the newline.
    const out = scrub(`first line ${EMDASH}\nsecond line\n`);
    expect(out).toBe('first line\nsecond line\n');
    expect(out.split('\n').length).toBe(3);
  });

  it('leaves an em-dash-free file byte-identical', () => {
    const text = 'no dashes here\njust text\n';
    expect(scrub(text)).toBe(text);
  });

  it('removes every em-dash it is given', () => {
    const out = scrub(`a ${EMDASH} b\nc${EMDASH}d\ne ${EMDASH}\n`);
    expect(out).not.toContain(EMDASH);
  });
});
