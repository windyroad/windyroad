import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Behavioural test for the deterministic newsletter structural lint (P089).
// Repo TDD discipline is vitest (no bats harness in this repo; precedent:
// scripts/render-cover.test.mjs). The ticket Fix Strategy says "bats", which is
// the upstream itil-plugin convention; vitest is the right runner for this repo.

const SCRIPT = join(process.cwd(), 'scripts/check-newsletter-structure.sh');
const ISSUE_09 = join(
  process.cwd(),
  'src/newsletters/published/leader/2026-06-15/2026-06-15.md',
);

function run(...args) {
  return spawnSync('bash', [SCRIPT, ...args], { encoding: 'utf8' });
}

// A minimal brief that satisfies all six invariants.
const VALID_BRIEF = `---
phase: full
edition: 9
---

# Issue 09: Own your AI supply

*The Shift, AI engineering, week ending 2026-06-14*

From Tom: optionality is the theme this week.

### Item 1: A government switched models off

**What happened.** Anthropic [published a statement](https://www.anthropic.com/news/x) (Jun 12). The Wall Street Journal reported [the trigger](https://www.wsj.com/x) (Jun 13). Google shipped [Gemma 4 12B](https://blog.google/x) (Jun 11).

**Why it matters to your team.** Portability is the cheapest hedge.

### Also worth noting

Both [Anthropic](https://www.anthropic.com/news/y) and [OpenAI](https://openai.com/z) filed draft S-1s.

---

Tell us the conversation you are having with your CTO this week.

[windyroad.com.au](https://windyroad.com.au)
`;

const VALID_LINKEDIN = `---
post-type: linkedin-share
---

## LinkedIn Post

Google's Gemma 4 12B, open and non-Chinese, is where I would start.
`;

// Write a brief (+ optional linkedin sibling) into a fresh temp dir and return
// the brief path so the lint auto-derives the sibling.
function fixture(brief, linkedin) {
  const dir = mkdtempSync(join(tmpdir(), 'nl-lint-'));
  const briefPath = join(dir, '2026-06-15.md');
  writeFileSync(briefPath, brief);
  if (linkedin !== undefined) {
    writeFileSync(join(dir, '2026-06-15.linkedin.md'), linkedin);
  }
  return briefPath;
}

describe('check-newsletter-structure.sh', () => {
  it('passes the hand-fixed published Issue 09 brief (clean fixture)', () => {
    const r = run(ISSUE_09);
    expect(r.status, r.stderr).toBe(0);
  });

  it('passes a minimal brief satisfying every invariant', () => {
    const r = run(fixture(VALID_BRIEF, VALID_LINKEDIN));
    expect(r.status, r.stderr).toBe(0);
  });

  it('errors with usage when no brief argument is given', () => {
    const r = run();
    expect(r.status).toBe(2);
  });

  it('(a) flags a redundant **Source.** line in an item that has inline links', () => {
    const broken = VALID_BRIEF.replace(
      '**Why it matters to your team.** Portability is the cheapest hedge.',
      '**Why it matters to your team.** Portability is the cheapest hedge.\n\n**Source.**\n  - https://www.wsj.com/x',
    );
    const r = run(fixture(broken, VALID_LINKEDIN));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[a]');
  });

  it('(b) flags a bare news-outlet name on a line with no link', () => {
    const broken = VALID_BRIEF.replace(
      '**Why it matters to your team.** Portability is the cheapest hedge.',
      '**Why it matters to your team.** Corroborated by Reuters, FT, NYT, and WSJ.',
    );
    const r = run(fixture(broken, VALID_LINKEDIN));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[b]');
  });

  // P093: check (b) now also flags a SINGLE bare unlinked outlet, not only 2+.
  // Tom's pipeline rule (2026-06-15 P089 review): do not name a news site
  // without linking it. The carve-out is per-item: a bare outlet passes only
  // when it is linked elsewhere in the same `### ` item (legitimate
  // back-reference), matched by URL domain including syndication domains.
  it('(b) flags a SINGLE bare outlet named on a link-free line, unlinked in its item', () => {
    // Reuters appears only on this link-free line; the item links anthropic.com
    // and wsj.com but never Reuters, so Reuters is an unlinked bare name.
    const broken = VALID_BRIEF.replace(
      '**Why it matters to your team.** Portability is the cheapest hedge.',
      '**Why it matters to your team.** Reuters said the same thing.',
    );
    const r = run(fixture(broken, VALID_LINKEDIN));
    expect(r.status, r.stderr).toBe(1);
    expect(r.stderr).toContain('[b]');
  });

  it('(b) passes a single bare outlet that is linked elsewhere in the same item (back-reference)', () => {
    // WSJ is linked in Item 1 via the wsj.com URL on the "What happened" line;
    // a later link-free line naming "the WSJ piece" is a legitimate
    // back-reference and must NOT be flagged.
    const backref = VALID_BRIEF.replace(
      '**Why it matters to your team.** Portability is the cheapest hedge.',
      '**Why it matters to your team.** The WSJ piece is worth reading in full.',
    );
    const r = run(fixture(backref, VALID_LINKEDIN));
    expect(r.status, r.stderr).toBe(0);
  });

  it('(b) passes a bare outlet linked only via a syndication domain (finance.yahoo.com -> Bloomberg)', () => {
    // The item links a Bloomberg piece via a finance.yahoo.com syndication URL
    // where the anchor/prose on the link line does NOT name Bloomberg; a later
    // link-free line names "Bloomberg" bare. The syndication-domain map must
    // recognise Bloomberg as linked so the back-reference passes.
    const syndicated = VALID_BRIEF.replace(
      '**Why it matters to your team.** Portability is the cheapest hedge.',
      '**What shifted.** Markets reacted to [the inverse anxiety](https://finance.yahoo.com/news/ai-coders-105500495.html) (Jun 14).\n\n**Why it matters to your team.** Bloomberg framed it as a warning.',
    );
    const r = run(fixture(syndicated, VALID_LINKEDIN));
    expect(r.status, r.stderr).toBe(0);
  });

  it('(c) flags a missing "### Also worth noting" section', () => {
    const broken = VALID_BRIEF.replace('### Also worth noting', '### One more thing');
    const r = run(fixture(broken, VALID_LINKEDIN));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[c]');
  });

  it('(d) flags an H1 missing the "Issue NN:" prefix', () => {
    const broken = VALID_BRIEF.replace('# Issue 09: Own your AI supply', '# Own your AI supply');
    const r = run(fixture(broken, VALID_LINKEDIN));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[d]');
  });

  it('(e) flags a missing "---" rule before the closing CTA', () => {
    // Remove the horizontal rule that precedes the CTA block.
    const broken = VALID_BRIEF.replace(
      '\n---\n\nTell us the conversation',
      '\n\nTell us the conversation',
    );
    const r = run(fixture(broken, VALID_LINKEDIN));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[e]');
  });

  it('(f) flags a model-name mismatch between brief and linkedin sibling', () => {
    const brokenLinkedin = VALID_LINKEDIN.replace('Gemma 4 12B', 'Gemma 4');
    const r = run(fixture(VALID_BRIEF, brokenLinkedin));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[f]');
  });

  it('(f) skips the cross-file check when no linkedin sibling exists', () => {
    const r = run(fixture(VALID_BRIEF, undefined));
    expect(r.status, r.stderr).toBe(0);
  });

  // P100: a sentence-final model name carried a trailing period into the
  // extracted token, so a mid-sentence "Gemma 4" in the brief mismatched a
  // sentence-final "Gemma 4." in the linkedin sibling. Trailing sentence
  // punctuation must be normalised before the family comparison.
  it('(f) passes when the only difference is a sentence-final period (Gemma 4.)', () => {
    const briefSameModel = VALID_BRIEF.replace(
      'Google shipped [Gemma 4 12B](https://blog.google/x) (Jun 11).',
      'Google shipped Gemma 4 12B mid-sentence so no period follows.',
    );
    const linkedinSentenceFinal = VALID_LINKEDIN.replace(
      "Google's Gemma 4 12B, open and non-Chinese, is where I would start.",
      'I would start with Gemma 4 12B.',
    );
    const r = run(fixture(briefSameModel, linkedinSentenceFinal));
    expect(r.status, r.stderr).toBe(0);
  });

  // Internal version dots must survive the trailing-punctuation strip, so a
  // genuine "Sonnet 4.6" vs "Sonnet 4" mismatch still fires.
  it('(f) still flags a genuine version mismatch after trailing-punctuation strip', () => {
    const briefSonnet = VALID_BRIEF.replace(
      'Google shipped [Gemma 4 12B](https://blog.google/x) (Jun 11).',
      'Anthropic shipped Claude Sonnet 4.6 mid-sentence here.',
    );
    const linkedinSonnet = VALID_LINKEDIN.replace(
      "Google's Gemma 4 12B, open and non-Chinese, is where I would start.",
      'I would reach for Claude Sonnet 4 first.',
    );
    const r = run(fixture(briefSonnet, linkedinSonnet));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[f]');
  });

  it('(g) flags a services-pitch sentence in the CTA block', () => {
    const broken = VALID_BRIEF.replace(
      'Tell us the conversation you are having with your CTO this week.',
      'Windy Road runs Patch Fitness Assessments for engineering teams: one-week audits that leave you with a prioritised fix list.\n\nTell us the conversation you are having with your CTO this week.',
    );
    const r = run(fixture(broken, VALID_LINKEDIN));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[g]');
  });

  it('(g) passes a CTA whose closing line is a bare domain (no markdown link)', () => {
    const bareClosing = VALID_BRIEF.replace(
      '[windyroad.com.au](https://windyroad.com.au)',
      'windyroad.com.au',
    );
    const r = run(fixture(bareClosing, VALID_LINKEDIN));
    expect(r.status, r.stderr).toBe(0);
  });

  it('(g) flags a services pitch even when the closing line is a bare domain', () => {
    const broken = VALID_BRIEF
      .replace('[windyroad.com.au](https://windyroad.com.au)', 'windyroad.com.au')
      .replace(
        'Tell us the conversation you are having with your CTO this week.',
        'Windy Road helps engineering leaders keep their pipelines patch fit.\n\nTell us the conversation you are having with your CTO this week.',
      );
    const r = run(fixture(broken, VALID_LINKEDIN));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[g]');
  });
});
