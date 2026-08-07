import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
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

**From Tom**

Optionality is the theme this week.

*This edition is drafted by AI and reviewed by a different AI, never the one that wrote the draft. I hold editorial responsibility for what follows.*

### Item 1: A government switched models off

**What happened.** Anthropic [published a statement](https://www.anthropic.com/news/x) (Jun 12). The Wall Street Journal reported [the trigger](https://www.wsj.com/x) (Jun 13). Google shipped [Gemma 4 12B](https://blog.google/x) (Jun 11).

**Why it matters to your team.** Portability is the cheapest hedge.

### Also worth noting

Both [Anthropic](https://www.anthropic.com/news/y) and [OpenAI](https://openai.com/z) filed draft S-1s.

---

If portability is the cheapest hedge, what is your team hedging against this quarter?

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
  it('passes the hand-fixed published Issue 09 brief on every check that existed when it shipped', () => {
    // Issue 09 published 2026-06-15, before three invariants existed: the
    // provenance line (h) was introduced by ADR-032's Amendment 2026-08-03,
    // and the **From Tom** opener (i) and content-tied-question CTA (j) are
    // template invariants this edition predates. It legitimately fails those
    // three, which is the point ADR-044 makes about lint ownership: a
    // precedent-based check would have let them lapse, a template invariant
    // catches them. Assert it is clean on (a) through (g) instead of asserting
    // a June edition satisfies August's rules.
    const r = run(ISSUE_09);
    // Guard the fixture itself: per-code stderr matching would pass vacuously on
    // exit 2 ("brief not found"), and ADR-039 and ADR-040 both moved these paths
    // inside the last two months.
    expect(r.status, r.stderr).not.toBe(2);
    for (const code of ['a', 'b', 'c', 'd', 'e', 'f', 'g']) {
      expect(r.stderr, `check (${code}) should not fire on Issue 09`).not.toContain(
        `[${code}]`,
      );
    }
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
      '\n---\n\nIf portability is the cheapest hedge,',
      '\n\nIf portability is the cheapest hedge,',
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
      'If portability is the cheapest hedge, what is your team hedging against this quarter?',
      'Windy Road runs Patch Fitness Assessments for engineering teams: one-week audits that leave you with a prioritised fix list.\n\nIf portability is the cheapest hedge, what is your team hedging against this quarter?',
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
        'If portability is the cheapest hedge, what is your team hedging against this quarter?',
        'Windy Road helps engineering leaders keep their pipelines patch fit.\n\nIf portability is the cheapest hedge, what is your team hedging against this quarter?',
      );
    const r = run(fixture(broken, VALID_LINKEDIN));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[g]');
  });

  it('(h) flags a brief with no provenance line before the first item', () => {
    const broken = VALID_BRIEF.replace(
      '*This edition is drafted by AI and reviewed by a different AI, never the one that wrote the draft. I hold editorial responsibility for what follows.*\n\n',
      '',
    );
    const r = run(fixture(broken, VALID_LINKEDIN));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[h]');
  });

  it('(h) does not fire when the provenance line sits after the first item', () => {
    // Placement is the point: ADR-032 element 5 puts it before the first item,
    // closing the From Tom opener. A line further down is not the same artefact,
    // so the check must fail rather than pass on a merely-present string.
    const moved = VALID_BRIEF
      .replace(
        '*This edition is drafted by AI and reviewed by a different AI, never the one that wrote the draft. I hold editorial responsibility for what follows.*\n\n',
        '',
      )
      .replace(
        '### Also worth noting',
        '*This edition is drafted by AI and reviewed by a different AI, never the one that wrote the draft.*\n\n### Also worth noting',
      );
    const r = run(fixture(moved, VALID_LINKEDIN));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[h]');
  });

  it('(h) fails rather than silently skipping when no "### Item " heading exists', () => {
    // Downgrade the heading rather than deleting it: that is the real corpus
    // shape (Issues 12 and 13 use bare `### <headline>`), and it isolates (h).
    // Deleting the section would also trip the item-boundary checks.
    const broken = VALID_BRIEF.replace(
      '### Item 1: A government switched models off',
      '### A government switched models off',
    );
    const r = run(fixture(broken, VALID_LINKEDIN));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[h]');
  });

  it('(h) does not accept an ordinary italic line whose words merely contain "ai"', () => {
    // The predicate was /[Aa][Ii]/ before 2026-08-07, which matched inside
    // detail, available, again, maintain and email. Anchored to the standalone
    // AI token, this line must no longer satisfy it.
    const broken = VALID_BRIEF.replace(
      '*This edition is drafted by AI and reviewed by a different AI, never the one that wrote the draft. I hold editorial responsibility for what follows.*',
      '*We reviewed every claim against the original source; full details are available on request.*',
    );
    const r = run(fixture(broken, VALID_LINKEDIN));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[h]');
  });

  it('(i) flags a brief whose author-voice opener is inline prose, not the bold slot', () => {
    // The corpus shape this catches: editions published 2026-07-06 and
    // 2026-07-13 opened with "From Tom: ..." inline instead of the bold slot.
    const broken = VALID_BRIEF.replace(
      '**From Tom**\n\nOptionality is the theme this week.',
      'From Tom: optionality is the theme this week.',
    );
    const r = run(fixture(broken, VALID_LINKEDIN));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[i]');
  });

  it('(j) flags a CTA that is a statement rather than a question', () => {
    const broken = VALID_BRIEF.replace(
      'If portability is the cheapest hedge, what is your team hedging against this quarter?',
      'This week we watched three vendors converge on the same answer.',
    );
    const r = run(fixture(broken, VALID_LINKEDIN));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[j]');
  });

  it('(j) flags a forward request, which cannot satisfy element 6', () => {
    // The shape removed from the template and both persona configs on
    // 2026-08-07: forwarding is not replying.
    const broken = VALID_BRIEF.replace(
      'If portability is the cheapest hedge, what is your team hedging against this quarter?',
      'Forward this to a colleague who runs an engineering team.',
    );
    const r = run(fixture(broken, VALID_LINKEDIN));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[j]');
  });

  it('(j) does not fire on a question mark inside a linked CTA line', () => {
    // Shares check (g)'s extractor, which skips markdown-link lines. A question
    // mark in a link title must not satisfy the invitation requirement.
    const broken = VALID_BRIEF.replace(
      'If portability is the cheapest hedge, what is your team hedging against this quarter?',
      '[Is your stack patch fit?](https://windyroad.com.au/x)',
    );
    const r = run(fixture(broken, VALID_LINKEDIN));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[j]');
  });

  // --- (k) duplicate citation across sections (P122 / RFC-004 item 5) ---------
  // The key is the IDENTICAL link: same anchor text AND same URL. The looser
  // same-URL-only rule was implemented first and fired on three published
  // editions, all legitimate (a landing-page URL cited for three different
  // findings; a setup-then-detail opener; one source across two items for two
  // claims). Those cases are what these tests pin.

  it('(k) flags the identical citation appearing in two sections', () => {
    const brief = VALID_BRIEF.replace(
      'Both [Anthropic](https://www.anthropic.com/news/y) and [OpenAI](https://openai.com/z) filed draft S-1s.',
      'Both [published a statement](https://www.anthropic.com/news/x) and [OpenAI](https://openai.com/z) filed draft S-1s.',
    );
    const r = run(fixture(brief, VALID_LINKEDIN));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[k]');
    expect(r.stderr).toContain('appears in two different sections');
  });

  it('(k) does not fire when the same URL carries different anchor text', () => {
    // A landing-page URL cited for two distinct findings. This is the
    // 2026-04-17 Thoughtworks Radar case: one report, several findings.
    const brief = VALID_BRIEF.replace(
      'Both [Anthropic](https://www.anthropic.com/news/y) and [OpenAI](https://openai.com/z) filed draft S-1s.',
      'Both [a second finding in the same report](https://www.anthropic.com/news/x) and [OpenAI](https://openai.com/z) filed draft S-1s.',
    );
    const r = run(fixture(brief, VALID_LINKEDIN));
    expect(r.stderr).not.toContain('[k]');
    expect(r.status).toBe(0);
  });

  it('(k) does not fire on the identical citation twice inside ONE section', () => {
    const brief = VALID_BRIEF.replace(
      '**Why it matters to your team.** Portability is the cheapest hedge.',
      '**Why it matters to your team.** Portability is the cheapest hedge, per [published a statement](https://www.anthropic.com/news/x).',
    );
    const r = run(fixture(brief, VALID_LINKEDIN));
    expect(r.stderr).not.toContain('[k]');
    expect(r.status).toBe(0);
  });

  it('(k) exempts windyroad.com.au, which recurs legitimately in the CTA', () => {
    const brief = VALID_BRIEF.replace(
      '**Why it matters to your team.** Portability is the cheapest hedge.',
      '**Why it matters to your team.** Portability is the cheapest hedge. See [windyroad.com.au](https://windyroad.com.au).',
    );
    const r = run(fixture(brief, VALID_LINKEDIN));
    expect(r.stderr).not.toContain('[k]');
    expect(r.status).toBe(0);
  });

  it('(k) treats the pre-first-heading region as its own section, named opener', () => {
    const brief = VALID_BRIEF.replace(
      '*This edition is drafted by AI',
      'We covered [published a statement](https://www.anthropic.com/news/x) last week.\n\n*This edition is drafted by AI',
    );
    const r = run(fixture(brief, VALID_LINKEDIN));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[k]');
    expect(r.stderr).toContain('"opener"');
  });

  // Regression guard, not a claimed-live exemption: the rule must stay quiet on
  // every real edition. It fires on zero as at 2026-08-08. If this starts
  // failing, either an edition regressed or the rule needs narrowing further;
  // do not silence it.
  it('(k) stays quiet on every published leader edition', () => {
    const dir = 'src/newsletters/published/leader';
    expect(existsSync(dir), `regression corpus missing: ${dir}`).toBe(true);
    const editions = readdirSync(dir)
      .map((d) => join(dir, d, `${d}.md`))
      .filter((f) => existsSync(f));
    expect(editions.length).toBeGreaterThan(0);
    const firing = editions.filter((f) => run(f).stderr.includes('[k]'));
    expect(firing, `check (k) fired on: ${firing.join(', ')}`).toEqual([]);
  }, 60_000);

  // P119 regression. Check (c) used to run `body_text | grep -qE '^### Also worth
  // noting'` directly under `set -uo pipefail`. `grep -q` exits on its FIRST match
  // and closes the pipe; the upstream printf/cut then takes SIGPIPE (141) with
  // output still buffered, and pipefail promoted that to a spurious "missing
  // section" FAIL. Reproducing it needs both conditions: the match must come early
  // enough that a lot is still unwritten, and the remainder must exceed the pipe
  // buffer (64KB on macOS/Linux). So the padding goes AFTER the heading, and is
  // sized well past the buffer. Verified to fail against the pre-fix check (c).
  it('(c) is deterministic on a long body (P119 SIGPIPE under pipefail)', () => {
    const filler = Array.from(
      { length: 1500 },
      (_, i) => `Padding entry ${i} kept after the heading so the match fires early and the writer still has more than a pipe buffer left to flush.`,
    ).join('\n\n');
    const longBrief = VALID_BRIEF.replace(
      '### Also worth noting\n',
      `### Also worth noting\n\n${filler}\n`,
    );
    const path = fixture(longBrief, VALID_LINKEDIN);
    const codes = Array.from({ length: 20 }, () => run(path).status);
    expect(new Set(codes), `unstable exit codes: ${codes.join(' ')}`).toEqual(new Set([0]));
  }, 30_000);
});
