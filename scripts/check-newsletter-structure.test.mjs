import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
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

  // --- (l) LinkedIn post length against the trailing median (P121) -----------
  // The threshold is 1.5x the median of the two most recent published posts for
  // the same persona. These pin the ARITHMETIC against a synthetic corpus via
  // NEWSLETTER_PUBLISHED_DIR, deliberately: an earlier version asserted against
  // the live corpus and would have gone red the moment Issue 17 published, since
  // Issue 16's priors change under it. A regression test that breaks on ordinary
  // corpus growth reads as "the check regressed" and invites deleting the check.

  function corpus(entries) {
    // entries: [{ date, chars }] -> a published-tree fixture for one persona
    const root = mkdtempSync(join(tmpdir(), 'nl-corpus-'));
    const personaDir = join(root, 'leader');
    for (const { date, chars } of entries) {
      const d = join(personaDir, date);
      mkdirSync(d, { recursive: true });
      writeFileSync(join(d, `${date}.linkedin.md`), `---\npost-type: linkedin-share\n---\n${'x'.repeat(chars)}`);
    }
    return root;
  }

  function runWithCorpus(briefPath, root) {
    return spawnSync('bash', [SCRIPT, briefPath], {
      encoding: 'utf8',
      env: { ...process.env, NEWSLETTER_PUBLISHED_DIR: root },
    });
  }

  it('(l) fires when the post exceeds 1.5x the median of its two priors', () => {
    const root = corpus([{ date: '2026-06-01', chars: 1000 }, { date: '2026-06-08', chars: 1000 }]);
    // median 1000 -> ceiling 1500; make the post 1600
    const brief = fixture(VALID_BRIEF, `---\npost-type: linkedin-share\n---\n${'y'.repeat(1600)}`);
    const r = runWithCorpus(brief, root);
    expect(r.stderr).toContain('[l]');
    expect(r.stderr).toContain('against a 1500 ceiling');
  });

  it('(l) stays quiet at exactly the ceiling', () => {
    const root = corpus([{ date: '2026-06-01', chars: 1000 }, { date: '2026-06-08', chars: 1000 }]);
    const brief = fixture(VALID_BRIEF, `---\npost-type: linkedin-share\n---\n${'y'.repeat(1500)}`);
    expect(runWithCorpus(brief, root).stderr).not.toContain('[l]');
  });

  it('(l) skips loudly, not silently, with fewer than two priors', () => {
    const root = corpus([{ date: '2026-06-01', chars: 1000 }]);
    const brief = fixture(VALID_BRIEF, `---\npost-type: linkedin-share\n---\n${'y'.repeat(9000)}`);
    const r = runWithCorpus(brief, root);
    expect(r.stderr).toContain('SKIP [l]');
    expect(r.stderr).not.toContain('FAIL [l]');
  });

  it('(l) skips loudly when the persona has no published corpus', () => {
    const root = mkdtempSync(join(tmpdir(), 'nl-corpus-empty-'));
    const brief = fixture(VALID_BRIEF, `---\npost-type: linkedin-share\n---\n${'y'.repeat(9000)}`);
    const r = runWithCorpus(brief, root);
    expect(r.stderr).toContain('SKIP [l]');
    expect(r.stderr).toContain('no published corpus');
  });

  it('(l) counts the whole file when the post has no frontmatter', () => {
    // Fail-open guard: an earlier post_chars quit after line 1 on a bare body,
    // counting ~1 character and passing the ceiling vacuously.
    const root = corpus([{ date: '2026-06-01', chars: 1000 }, { date: '2026-06-08', chars: 1000 }]);
    const brief = fixture(VALID_BRIEF, 'y'.repeat(1600));
    expect(runWithCorpus(brief, root).stderr).toContain('[l]');
  });

  // One corpus-coupled test, and it asserts only that the check RUNS cleanly on
  // the live tree, never that a particular edition fires. Safe across growth.
  it('(l) evaluates against the live corpus without erroring', () => {
    const brief = 'src/newsletters/published/leader/2026-08-03/2026-08-03.md';
    expect(existsSync(brief), `corpus fixture missing: ${brief}`).toBe(true);
    const r = run(brief);
    expect(r.status, `unexpected usage/IO error: ${r.stderr}`).not.toBe(2);
    expect(r.stderr).not.toContain('SKIP [l]');
  });

  // --- (m) a gate verdict that predates the current draft (P099 / ADR-047) ----
  // Detection only. The response (re-invoke the named gates) is the SKILL's, per
  // ADR-047; a lint cannot invoke a subagent. These pin the detection.

  function digestOf(text) {
    const body = text.startsWith('---') ? text.replace(/^---[\s\S]*?\n---\n/, '') : text;
    return createHash('sha256').update(body).digest('hex');
  }

  function withReviews(briefText, postText, blocks) {
    const dir = mkdtempSync(join(tmpdir(), 'nl-m-'));
    const b = join(dir, '2026-06-15.md');
    writeFileSync(b, briefText);
    writeFileSync(join(dir, '2026-06-15.linkedin.md'), postText);
    writeFileSync(join(dir, '2026-06-15.reviews.md'), `# Reviews\n\n${blocks}\n`);
    return b;
  }

  it('(m) names a gate whose verdict predates the current brief', () => {
    const stale = '0'.repeat(64);
    const brief = withReviews(VALID_BRIEF, VALID_LINKEDIN,
      `## Critic Review: Newsletter (finalise)\nscored-digest: sha256:${stale}\nPASS.`);
    const r = run(brief);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[m]');
    expect(r.stderr).toContain('Critic Review: Newsletter (finalise)');
    expect(r.stderr).toContain('different brief');
  });

  it('(m) stays quiet when every recorded digest matches', () => {
    const d = digestOf(VALID_BRIEF);
    const brief = withReviews(VALID_BRIEF, VALID_LINKEDIN,
      `## Editor Review (finalise)\nscored-digest: sha256:${d}\nPASS.`);
    expect(run(brief).stderr).not.toContain('[m]');
  });

  it('(m) routes a LinkedIn-scored verdict to the post, not the brief', () => {
    // The post digest against a LinkedIn heading must pass, and the same digest
    // against a brief heading must fail. This is the per-surface split (ADR-047).
    const dp = digestOf(VALID_LINKEDIN);
    const ok = withReviews(VALID_BRIEF, VALID_LINKEDIN,
      `## Skeptic Review (LinkedIn post)\nscored-digest: sha256:${dp}\nPASS.`);
    expect(run(ok).stderr).not.toContain('[m]');
    const bad = withReviews(VALID_BRIEF, VALID_LINKEDIN,
      `## Editor Review (finalise)\nscored-digest: sha256:${dp}\nPASS.`);
    expect(run(bad).stderr).toContain('[m]');
  });

  it('(m) flags every brief-scored gate after a brief edit, and no post-scored one', () => {
    // The P099 case: an edit to the brief lands, the post is untouched.
    const edited = `${VALID_BRIEF}\nA publish-morning thesis correction.\n`;
    const dbOld = digestOf(VALID_BRIEF);
    const dp = digestOf(VALID_LINKEDIN);
    const brief = withReviews(edited, VALID_LINKEDIN,
      `## Editor Review (finalise)\nscored-digest: sha256:${dbOld}\nPASS.\n\n` +
      `## Critic Review: Newsletter (finalise)\nscored-digest: sha256:${dbOld}\nPASS.\n\n` +
      `## Skeptic Review (LinkedIn post)\nscored-digest: sha256:${dp}\nPASS.`);
    const r = run(brief);
    expect(r.stderr).toContain('Editor Review (finalise)');
    expect(r.stderr).toContain('Critic Review: Newsletter (finalise)');
    expect(r.stderr).not.toContain('Skeptic Review (LinkedIn post)');
  });

  it('(m) skips loudly on a pre-adoption edition with no digests', () => {
    const brief = withReviews(VALID_BRIEF, VALID_LINKEDIN, '## Editor Review\nPASS.');
    const r = run(brief);
    expect(r.stderr).toContain('SKIP [m]');
    expect(r.stderr).not.toContain('FAIL [m]');
  });

  it('(m) skips loudly when the reviews sibling is absent', () => {
    const brief = fixture(VALID_BRIEF, VALID_LINKEDIN);
    const r = run(brief);
    expect(r.stderr).toContain('SKIP [m]');
    expect(r.stderr).toContain('no reviews sibling');
  });

  it('(m) treats a heading-marked (prep) block as carried, not stale', () => {
    const stale = '0'.repeat(64);
    const brief = withReviews(VALID_BRIEF, VALID_LINKEDIN,
      `## Editor Review (prep)\nscored-digest: sha256:${stale}\nPASS at prep.`);
    const r = run(brief);
    expect(r.stderr, 'a prep-carried block must not report stale').not.toContain('FAIL [m]');
  });

  it('(m) treats a carried-from: prep line as carried, not stale', () => {
    const stale = '1'.repeat(64);
    const brief = withReviews(VALID_BRIEF, VALID_LINKEDIN,
      `## Cross-Edition Consistency\ncarried-from: prep\nscored-digest: sha256:${stale}\nSUPPORTED.`);
    expect(run(brief).stderr).not.toContain('FAIL [m]');
  });

  it('(m) reports a verdict block carrying no digest as never-scored', () => {
    // Partial adoption must not read green: once ANY block carries a digest the
    // check runs, and an un-digested block would otherwise be invisible to it.
    const d = digestOf(VALID_BRIEF);
    const brief = withReviews(VALID_BRIEF, VALID_LINKEDIN,
      `## Editor Review (finalise)\nscored-digest: sha256:${d}\nPASS.\n\n` +
      `## Skeptic Review (brief, finalise)\nPASS, but nobody recorded what it read.`);
    const r = run(brief);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('Skeptic Review (brief, finalise)');
    expect(r.stderr).toContain('carries no scored-digest');
    expect(r.stderr).not.toContain('Editor Review (finalise)');
  });

  it('(m) discriminates all four states in one mixed sibling', () => {
    const d = digestOf(VALID_BRIEF);
    const brief = withReviews(VALID_BRIEF, VALID_LINKEDIN,
      `## Editor Review (finalise)\nscored-digest: sha256:${d}\nPASS.\n\n` +
      `## Editor Review (prep)\nscored-digest: sha256:${'0'.repeat(64)}\nPASS at prep.\n\n` +
      `## Skeptic Review (brief, finalise)\nPASS, no digest.\n\n` +
      `## Critic Review: Newsletter (finalise)\nscored-digest: sha256:${'2'.repeat(64)}\nPASS, older draft.`);
    const r = run(brief);
    const fails = r.stderr.split('\n').filter((l) => l.includes('FAIL [m]'));
    expect(fails.length, `expected exactly 2 firings, got: ${fails.join(' | ')}`).toBe(2);
    expect(r.stderr).toContain('Skeptic Review (brief, finalise)');
    expect(r.stderr).toContain('Critic Review: Newsletter (finalise)');
  });

  // R6 from the risk review: bind the step-16 templates to check (m). The earlier
  // gap was that every (m) test used handcrafted blocks, so a template that
  // disagreed with the classifier went undetected. These read SKILL.md itself.

  const SKILL = '.claude/skills/wr-newsletter/SKILL.md';

  it('(m) does not report the non-verdict sections the templates prescribe', () => {
    // Map Delta, URL Verification and the remediation loop are records, not gate
    // verdicts. Reporting them would block the save on something unrunnable.
    expect(existsSync(SKILL), `skill missing: ${SKILL}`).toBe(true);
    const blocks = ['Map Delta', 'URL Verification', 'Editorial Remediation Loop']
      .map((h) => `## ${h}\nSome record, no digest.`)
      .join('\n\n');
    const d = digestOf(VALID_BRIEF);
    const brief = withReviews(VALID_BRIEF, VALID_LINKEDIN,
      `## Editor Review (finalise)\nscored-digest: sha256:${d}\nPASS.\n\n${blocks}`);
    const r = run(brief);
    expect(r.stderr, 'a non-verdict section must not be reported').not.toContain('FAIL [m]');
  });

  it('(m) exempts the Wardley critic, which scores a third artefact', () => {
    const brief = withReviews(VALID_BRIEF, VALID_LINKEDIN,
      `## Critic Review: Wardley Artifacts\nscored-digest: sha256:${'3'.repeat(64)}\nPASS.`);
    expect(run(brief).stderr).not.toContain('FAIL [m]');
  });

  it('(m) reports a carried block that lost its digest as a custody breach', () => {
    // Marker present, digest absent is the signature of a block recomposed from
    // context rather than copied verbatim, which defeats the whole check.
    const d = digestOf(VALID_BRIEF);
    const brief = withReviews(VALID_BRIEF, VALID_LINKEDIN,
      `## Editor Review (finalise)\nscored-digest: sha256:${d}\nPASS.\n\n` +
      `## Voice Review (prep)\nPASS at prep, recomposed.`);
    const r = run(brief);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('Voice Review (prep)');
    expect(r.stderr).toContain('custody');
  });

  // The other half of the custody invariant. Losing the digest is the loud
  // breach and is covered above; refreshing it is the quiet one, and it was the
  // hole P099 named against its own fix. A carried block scored an earlier
  // artefact by construction, so a carried digest equal to the draft being
  // saved is a digest recomputed at save rather than copied across.

  it('(m) reports a carried block whose digest was refreshed to the current brief', () => {
    const d = digestOf(VALID_BRIEF);
    const brief = withReviews(VALID_BRIEF, VALID_LINKEDIN,
      `## Editor Review (finalise)\nscored-digest: sha256:${d}\nPASS.\n\n` +
      `## Voice Review (prep)\nscored-digest: sha256:${d}\nPASS at prep.`);
    const r = run(brief);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('Voice Review (prep)');
    expect(r.stderr).toContain('custody');
  });

  it('(m) reports a refreshed digest on a carried-from: prep block too', () => {
    // The marker form, not the heading form. Both set carried independently, so
    // both must be reached; pinning only one would leave half the surface open.
    const d = digestOf(VALID_BRIEF);
    const brief = withReviews(VALID_BRIEF, VALID_LINKEDIN,
      `## Cross-Edition Consistency\ncarried-from: prep\nscored-digest: sha256:${d}\nSUPPORTED.`);
    const r = run(brief);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('Cross-Edition Consistency');
    expect(r.stderr).toContain('custody');
  });

  it('(m) routes a carried LinkedIn verdict against the post, not the brief', () => {
    // A carried post-scored block holding the current POST digest is the breach;
    // holding the current BRIEF digest is not, because that is not the artefact
    // it claims to have scored. Without the per-surface split this arm would
    // both miss the real case and invent a false one.
    const db = digestOf(VALID_BRIEF);
    const dp = digestOf(VALID_LINKEDIN);
    const bad = withReviews(VALID_BRIEF, VALID_LINKEDIN,
      `## Voice Review (LinkedIn post)\ncarried-from: prep\nscored-digest: sha256:${dp}\nPASS.`);
    expect(run(bad).stderr).toContain('custody');
    const ok = withReviews(VALID_BRIEF, VALID_LINKEDIN,
      `## Voice Review (LinkedIn post)\ncarried-from: prep\nscored-digest: sha256:${db}\nPASS.`);
    expect(run(ok).stderr).not.toContain('FAIL [m]');
  });

  it('(m) leaves a genuinely carried digest alone', () => {
    // The regression guard on the arm above: the legitimate carry is the common
    // case at every finalise save, and firing on it would make the check noise.
    const stale = '4'.repeat(64);
    const d = digestOf(VALID_BRIEF);
    const brief = withReviews(VALID_BRIEF, VALID_LINKEDIN,
      `## Editor Review (finalise)\nscored-digest: sha256:${d}\nPASS.\n\n` +
      `## Editor Review (prep)\nscored-digest: sha256:${stale}\nPASS at prep.`);
    expect(run(brief).stderr).not.toContain('FAIL [m]');
  });

  it('(m) clears a refreshed carried block once it is recorded as finalise', () => {
    // The remedy has to terminate, or the check blocks the save with nothing the
    // author can do. Re-running the gate against the current draft means the
    // block is no longer carried, and the digest it holds is then the right one.
    // Same bytes, both carried markers gone, check quiet.
    const d = digestOf(VALID_BRIEF);
    const brief = withReviews(VALID_BRIEF, VALID_LINKEDIN,
      `## Voice Review (finalise)\nscored-digest: sha256:${d}\nPASS.`);
    expect(run(brief).stderr).not.toContain('FAIL [m]');
  });

  it('(m) names save ordering, not a stale gate, when the artefact is unwritten', () => {
    // A verdict scoring an artefact that has not been written yet cannot be
    // compared. The cause is step-16 ordering and the remedy is to write the
    // artefacts first; the old catch-all told the author to re-run the gate,
    // which spends an invocation on something a file write solves.
    const dir = mkdtempSync(join(tmpdir(), 'nl-m-noart-'));
    const b = join(dir, '2026-06-15.md');
    writeFileSync(b, VALID_BRIEF);
    writeFileSync(join(dir, '2026-06-15.reviews.md'),
      `# Reviews\n\n## Skeptic Review (LinkedIn post)\nscored-digest: sha256:${'5'.repeat(64)}\nPASS.\n`);
    const r = run(b);
    expect(r.stderr).toContain('no artefact on disk to compare');
    expect(r.stderr).toContain('ordering');
    expect(r.stderr).not.toContain('was scored against a different');
  });

  it('every verdict heading in the templates classifies as the template intends', () => {
    // Reads the real templates. A heading the classifier treats as a verdict must
    // have a digest placeholder or a carried marker beside it in SKILL.md; one it
    // treats as a record must not be required to.
    const skill = readFileSync(SKILL, 'utf8').split('\n');
    const verdictRe = /review|critic|consistency|skeptic|shape|accessibility/i;
    const unmet = [];
    skill.forEach((line, i) => {
      const m = line.match(/^\s*## (.+)$/);
      if (!m) return;
      const head = m[1];
      if (!verdictRe.test(head) || /wardley/i.test(head)) return;
      if (/failure modes|out of scope|phase model|pipeline|reference/i.test(head)) return;
      const window = skill.slice(i, i + 6).join('\n');
      if (!/scored-digest:|carried-from: prep/.test(window)) unmet.push(`${SKILL}:${i + 1} ${head}`);
    });
    expect(unmet, `verdict slots with no digest placeholder or carried marker:\n${unmet.join('\n')}`).toEqual([]);
  });

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

  // --- H2 section headings + heading-form opener --------------------------
  // The lint used to pin sections at H3 and the opener at literal `**From Tom**`.
  // That left the document with an H1 and no H2, which is a real WCAG 1.3.1 /
  // 2.4.10 defect, and it meant the cognitive-accessibility gate could not act
  // on its own finding: the deterministic check refused the fix. Both forms are
  // now accepted, so the corpus's sixteen H3 editions keep passing while new
  // editions can carry a valid outline. H4 and deeper stay invisible to section
  // accounting, which is why the matchers are `^###? ` and not `^##+ `.
  const H2_BRIEF = VALID_BRIEF
    .replace('**From Tom**', '## From Tom')
    .replaceAll('### ', '## ');

  it('accepts H2 section headings and a heading-form From Tom opener', () => {
    const r = run(fixture(H2_BRIEF, VALID_LINKEDIN));
    expect(r.status, r.stderr).toBe(0);
  });

  it('still accepts the legacy H3 + bold-opener shape', () => {
    const r = run(fixture(VALID_BRIEF, VALID_LINKEDIN));
    expect(r.status, r.stderr).toBe(0);
  });

  it('(c) fires when the Also-worth-noting coda is missing from an H2 brief', () => {
    const r = run(fixture(H2_BRIEF.replace('## Also worth noting', '## Something else'), VALID_LINKEDIN));
    expect(r.stderr).toContain('[c]');
  });

  it('(h) fires when the provenance line is missing from an H2 brief', () => {
    const noProv = H2_BRIEF.replace(
      '*This edition is drafted by AI and reviewed by a different AI, never the one that wrote the draft. I hold editorial responsibility for what follows.*\n\n',
      '',
    );
    const r = run(fixture(noProv, VALID_LINKEDIN));
    expect(r.stderr).toContain('[h]');
  });

  it('(i) fires when neither opener form is present', () => {
    const r = run(fixture(H2_BRIEF.replace('## From Tom', '## Opening'), VALID_LINKEDIN));
    expect(r.stderr).toContain('[i]');
  });

  it('(k) sees duplicate citations across H2 section boundaries', () => {
    const dup = H2_BRIEF.replace(
      'Both [Anthropic](https://www.anthropic.com/news/y) and [OpenAI](https://openai.com/z) filed draft S-1s.',
      'Anthropic [published a statement](https://www.anthropic.com/news/x) again.',
    );
    const r = run(fixture(dup, VALID_LINKEDIN));
    expect(r.stderr).toContain('[k]');
  });

  // --- (n) ADR-052 verdict bookkeeping ------------------------------------
  // ADR-052 makes every reviewer gate block publication. Check (n) asserts the
  // bookkeeping that makes an author-cleared finding a decision rather than a
  // default: a BLOCKING tag must not still be standing at save, a CLEARED or
  // DECLINED tag must carry a reason, and the retired RESIDUAL tag is rejected.
  // Each case below is written so it FAILS against a script without check (n),
  // which is the falsification direction that matters.
  function withVerdictReviews(reviewsBody) {
    const dir = mkdtempSync(join(tmpdir(), 'nl-lint-n-'));
    const briefPath = join(dir, '2026-06-15.md');
    writeFileSync(briefPath, H2_BRIEF);
    writeFileSync(join(dir, '2026-06-15.linkedin.md'), VALID_LINKEDIN);
    writeFileSync(join(dir, '2026-06-15.reviews.md'), reviewsBody);
    return briefPath;
  }

  it('(n) fires when a BLOCKING finding is still standing', () => {
    const r = run(withVerdictReviews('## Editor Review\n\n- BLOCKING (survived round 2): the close does not collect Item 3.\n'));
    expect(r.status, r.stderr).toBe(1);
    expect(r.stderr).toContain('[n]');
    expect(r.stderr).toMatch(/still standing/);
  });

  it('(n) fires when a CLEARED finding carries no reason', () => {
    const r = run(withVerdictReviews('## Shape Review\n\n- CLEARED (forbidden to remediate)\n\n## Voice Review\n\nPASS\n'));
    expect(r.status, r.stderr).toBe(1);
    expect(r.stderr).toContain('[n]');
    expect(r.stderr).toMatch(/no stated reason/);
  });

  it('(n) accepts a CLEARED finding whose reason is on the same line', () => {
    const r = run(withVerdictReviews('## Shape Review\n\n- CLEARED (forbidden to remediate): the sign-off link is a deliberate change and the bare form was never ratified.\n'));
    expect(r.stderr, 'check (n) must stay quiet here').not.toContain('[n]');
  });

  it('(n) accepts a CLEARED finding whose reason is on the following line', () => {
    const r = run(withVerdictReviews('## Shape Review\n\n- CLEARED (forbidden to remediate)\n  Tom: the issue line sits deeper because the opener carries the series identity instead.\n'));
    expect(r.stderr, 'check (n) must stay quiet here').not.toContain('[n]');
  });

  it('(n) accepts a DECLINED finding with a reason', () => {
    const r = run(withVerdictReviews('## Skeptic Review\n\n- DECLINED: the critic judged the same line acceptable compression and Tom arbitrated in its favour.\n'));
    expect(r.stderr, 'check (n) must stay quiet here').not.toContain('[n]');
  });

  it('(n) rejects the retired RESIDUAL tag', () => {
    const r = run(withVerdictReviews('## Editor Review\n\n- RESIDUAL (round 2, accepted): item placement, Item 2 should lead.\n'));
    expect(r.status, r.stderr).toBe(1);
    expect(r.stderr).toContain('[n]');
    expect(r.stderr).toMatch(/retired/);
  });

  it('(n) stays silent on a reviews sibling with no verdict tags at all', () => {
    const r = run(withVerdictReviews('## Voice Review\n\nPASS. No findings.\n'));
    expect(r.stderr, 'check (n) must stay quiet here').not.toContain('[n]');
  });

  it('(n) fires when the reason slot holds structured finding metadata, not a reason', () => {
    // The authoring order step 15.37 item 5 prescribes is tag, then the finding's
    // own fields. Without the metadata exclusion this passes silently with no
    // reason anywhere in it, which is the shape SKILL.md calls an unrecorded
    // blocker wearing a cleared tag. This is check (n)'s worst false negative.
    const r = run(withVerdictReviews(
      '## Editor Review\n\n- CLEARED (forbidden to remediate)\n  Passage: "the sign-off line became a markdown link"\n  Suggested fix: restore the bare-domain form\n',
    ));
    expect(r.status, r.stderr).toBe(1);
    expect(r.stderr).toContain('[n]');
    expect(r.stderr).toMatch(/no stated reason/);
  });

  it('(n) does not trip on a reviews sibling that documents the retired tag in prose', () => {
    const r = run(withVerdictReviews(
      '## Notes\n\nADR-052 retired the RESIDUAL (round 2, accepted) tag, so nothing here uses it.\n',
    ));
    expect(r.stderr, 'check (n) must stay quiet here').not.toContain('[n]');
  });

  // Binds check (n)'s literal tag strings to the template that produces them.
  // Modelled on the check-(m) binding test above: (m) was fixed for exactly this
  // gap, where every test used a handcrafted block so a template that disagreed
  // with the classifier went undetected. Check (n) would otherwise reproduce it.
  it('(n) matches every ADR-052 tag string SKILL.md prescribes', () => {
    const skill = readFileSync(SKILL, 'utf8');
    const script = readFileSync(join(process.cwd(), 'scripts/check-newsletter-structure.sh'), 'utf8');
    const prescribed = [...skill.matchAll(/`(CLEARED \(forbidden to remediate\)|BLOCKING \(survived round 2\)|DECLINED|RESIDUAL \(round 2, accepted\))`/g)]
      .map((m) => m[1]);
    expect(prescribed.length, 'SKILL.md should prescribe ADR-052 verdict tags').toBeGreaterThan(0);
    for (const tag of new Set(prescribed)) {
      // The script escapes the parens for grep/awk; compare on the escaped form.
      const escaped = tag.replace(/[()]/g, (c) => `\\${c}`);
      expect(
        script.includes(escaped),
        `check (n) does not match the tag SKILL.md prescribes: ${tag}`,
      ).toBe(true);
    }
  });

  // --- P140: a prep-phase brief carries a ".prep" infix its siblings do not ---
  // Sibling artefacts are named for the publication date in every phase (ADR-026),
  // so deriving them as "${brief%.md}.<kind>.md" names a file that never exists
  // during prep. Checks (m) and (n) both read the reviews sibling, so both were
  // dead for the whole prep phase: (m) skipped loudly, (n) silently. Each case
  // below fails against a script without the infix strip.
  function prepFixture(reviewsBody) {
    const dir = mkdtempSync(join(tmpdir(), 'nl-prep-'));
    const briefPath = join(dir, '2026-06-15.prep.md');
    writeFileSync(briefPath, H2_BRIEF);
    if (reviewsBody !== null) writeFileSync(join(dir, '2026-06-15.reviews.md'), reviewsBody);
    return briefPath;
  }

  it('(m) reaches the reviews sibling of a prep-phase brief', () => {
    const stale = '0'.repeat(64);
    const brief = prepFixture(`# Reviews\n\n## Editor Review\nscored-digest: sha256:${stale}\nPASS.\n`);
    const r = run(brief);
    expect(r.stderr, 'the prep sibling exists and must not be skipped').not.toContain('SKIP [m]');
    expect(r.stderr).toContain('FAIL [m]');
    expect(r.stderr).toContain('Editor Review');
  });

  it('(n) fires on a prep-phase brief whose reviews sibling holds a standing BLOCKING finding', () => {
    const brief = prepFixture('## Editor Review\n\n- BLOCKING (survived round 2): the close does not collect Item 3.\n');
    const r = run(brief);
    expect(r.status, r.stderr).toBe(1);
    expect(r.stderr).toContain('[n]');
    expect(r.stderr).toMatch(/still standing/);
  });

  it('(n) skips loudly when the reviews sibling is absent', () => {
    // Check (m) says so out loud on the same condition; (n) used to say nothing,
    // which is the one degradation mode this file's own stance forbids.
    const r = run(prepFixture(null));
    expect(r.stderr).toContain('SKIP [n]');
    expect(r.stderr).toContain('no reviews sibling');
  });

  it('an explicit third argument overrides the derived reviews path', () => {
    // ADR-047 dimension 4: derive by default, with an explicit override. The
    // override is what resolves a brief whose name carries a "-2" collision
    // suffix its sibling does not.
    const dir = mkdtempSync(join(tmpdir(), 'nl-override-'));
    const brief = join(dir, '2026-06-15-2.md');
    const reviews = join(dir, '2026-06-15.reviews.md');
    writeFileSync(brief, H2_BRIEF);
    writeFileSync(dir + '/2026-06-15-2.linkedin.md', VALID_LINKEDIN);
    writeFileSync(reviews, '## Editor Review\n\n- BLOCKING (survived round 2): the close does not collect Item 3.\n');
    expect(run(brief).stderr, 'derivation alone must miss it').toContain('SKIP [n]');
    const r = run(brief, dir + '/2026-06-15-2.linkedin.md', reviews);
    expect(r.status, r.stderr).toBe(1);
    expect(r.stderr).toContain('[n]');
  });

  it('does not treat H4 sub-headings as section boundaries', () => {
    const withH4 = H2_BRIEF.replace(
      '**Why it matters to your team.** Portability is the cheapest hedge.',
      '#### A sub-point\n\n**Why it matters to your team.** Portability is the cheapest hedge.',
    );
    const r = run(fixture(withH4, VALID_LINKEDIN));
    expect(r.status, r.stderr).toBe(0);
  });

  // --- (o) a prescribed gate that produced no block at all (P151) ------------
  // Check (m) is comparison-based: it classifies only the "## " headings
  // physically present in the reviews sibling, so a gate that never ran writes
  // no heading and produces no row to classify. Staleness was detected;
  // absence was not. Check (o) derives the roster of blocks the wr-newsletter
  // SKILL prescribes for the run's phase and fails on any that is missing.
  // The roster is DERIVED, never a second copy: a hard-coded list here would
  // recreate the two-surfaces-disagree defect P140 just closed on this script.

  const SKILL_MD = join(process.cwd(), '.claude/skills/wr-newsletter/SKILL.md');

  // Every "## " heading the SKILL's phase=prep reviews template prescribes,
  // read the same way the script reads it. Used to build a COMPLETE sibling
  // so the negative cases below isolate one missing gate at a time.
  function prescribedHeadings(phase) {
    const skill = readFileSync(SKILL_MD, 'utf8').split('\n');
    const out = [];
    let inSection = false;
    for (const line of skill) {
      if (line.startsWith('#### phase=')) {
        inSection = line.startsWith(`#### phase=${phase}:`);
        continue;
      }
      if (line.startsWith('### ')) {
        inSection = false;
        continue;
      }
      const m = inSection && /^ *## (.+?)\s*$/.exec(line);
      if (m) out.push(m[1]);
    }
    return out;
  }

  function reviewsFor(headings) {
    return (
      '---\ncompanion-to: 2026-06-15.md\n---\n\n' +
      headings.map((h) => `## ${h}\n\nPASS. No findings.\n`).join('\n')
    );
  }

  // A brief + reviews sibling pair with an explicit frontmatter phase.
  function phaseFixture(phase, reviewsBody, briefName = '2026-06-15.md') {
    const dir = mkdtempSync(join(tmpdir(), 'nl-roster-'));
    const briefPath = join(dir, briefName);
    writeFileSync(briefPath, H2_BRIEF.replace('phase: full', `phase: ${phase}`));
    writeFileSync(join(dir, '2026-06-15.linkedin.md'), VALID_LINKEDIN);
    if (reviewsBody !== null) writeFileSync(join(dir, '2026-06-15.reviews.md'), reviewsBody);
    return briefPath;
  }

  function firedGates(stderr) {
    return [...stderr.matchAll(/FAIL \[o\] .*?records no block for "([^"]+)"/g)].map(
      (m) => m[1],
    );
  }

  it('(o) stays quiet when every block the phase prescribes is present', () => {
    const r = run(phaseFixture('prep', reviewsFor(prescribedHeadings('prep'))));
    expect(r.stderr, 'a complete prep ledger must not fire (o)').not.toContain('[o]');
  });

  it('(o) fires on a prescribed gate with no block in the reviews sibling', () => {
    const kept = prescribedHeadings('prep').filter((h) => h !== 'Shape Review');
    const r = run(phaseFixture('prep', reviewsFor(kept)));
    expect(r.status, r.stderr).toBe(1);
    expect(firedGates(r.stderr)).toContain('Shape Review');
  });

  it('(o) catches the Wardley critic, which check (m) excludes by construction', () => {
    // (m) sets is_verdict=0 on a wardley heading because that gate scores
    // ai-landscape.md, a third artefact this lint has no digest target for.
    // Absence is (o)'s to catch; freshness stays out of scope.
    const kept = prescribedHeadings('prep').filter(
      (h) => !/wardley/i.test(h),
    );
    const r = run(phaseFixture('prep', reviewsFor(kept)));
    expect(firedGates(r.stderr).join(' ')).toMatch(/Wardley/);
  });

  it('(o) tolerates naming drift that still names the gate', () => {
    // Both drifted forms are on disk in the 2026-08-17 reviews sibling. A gate
    // written as "Adversarial Skeptic Review" ran; it is not a skipped gate.
    const drifted = prescribedHeadings('prep')
      .map((h) => (h === 'Skeptic Review' ? 'Adversarial Skeptic Review' : h))
      .map((h) => (h === 'Cross-Edition Consistency' ? 'Cross-Edition Consistency Review' : h));
    const r = run(phaseFixture('prep', reviewsFor(drifted)));
    expect(r.stderr, 'drifted-but-named gates must not fire (o)').not.toContain('[o]');
  });

  it('(o) does not let a LinkedIn-post block satisfy the brief-side gate', () => {
    const swapped = prescribedHeadings('prep').map((h) =>
      h === 'Voice Review' ? 'Voice Review (LinkedIn post)' : h,
    );
    const r = run(phaseFixture('prep', reviewsFor(swapped)));
    expect(firedGates(r.stderr)).toContain('Voice Review');
  });

  // The sanctioned set is DECLARED, in one anchored block in the SKILL. It used
  // to be scraped from every "N/A:" run in the prose, which let punctuation
  // decide what counted: one of the four reasons was sanctioned only because a
  // step-17 bullet happened to quote it, and a stray line ending "N/A:." would
  // have harvested a key prefixing every reason and quietly sanctioned all of
  // them. These pin every declared reason, not just one.
  function sanctionedReasons() {
    const skill = readFileSync(SKILL_MD, 'utf8').split('\n');
    const at = skill.findIndex((l) => l.includes('SANCTIONED-SKIP-REASONS:'));
    expect(at, 'the SKILL must declare the sanctioned skip reasons by anchor').toBeGreaterThan(-1);
    const out = [];
    for (const line of skill.slice(at + 1)) {
      if (/^\s*N\/A:/.test(line)) out.push(line.trim());
      else if (out.length && /^\s*```\s*$/.test(line)) break;
    }
    return out;
  }

  it('(o) accepts every skip reason the SKILL declares, and only those', () => {
    const reasons = sanctionedReasons();
    expect(reasons.length, 'the declared list must not be empty').toBeGreaterThan(0);
    for (const reason of reasons) {
      const body = reviewsFor(prescribedHeadings('prep')).replace(
        '## Editor Review\n\nPASS. No findings.',
        `## Editor Review\n\n${reason}`,
      );
      const r = run(phaseFixture('prep', body));
      expect(r.stderr, `declared reason rejected: ${reason}`).not.toContain('[o]');
    }
  });

  it('(o) accepts a block recorded N/A for a skip condition the SKILL prescribes', () => {
    const body = reviewsFor(prescribedHeadings('prep')).replace(
      '## Editor Review\n\nPASS. No findings.',
      '## Editor Review\n\nN/A: newsletter-critic returned REJECTED',
    );
    const r = run(phaseFixture('prep', body));
    expect(r.stderr, 'a sanctioned skip is a ledger entry, not a violation').not.toContain(
      '[o]',
    );
  });

  it('(o) rejects a block recorded N/A for a reason the SKILL does not prescribe', () => {
    // ADR-047 limit 2: a sanctioned skip is one whose DOCUMENTED skip condition
    // holds. A free-hand reason would discharge every gate with one typed line,
    // which is P151 relocated one level up.
    const body = reviewsFor(prescribedHeadings('prep')).replace(
      '## Editor Review\n\nPASS. No findings.',
      '## Editor Review\n\nN/A: ran out of time before the publish window',
    );
    const r = run(phaseFixture('prep', body));
    expect(r.status, r.stderr).toBe(1);
    expect(r.stderr).toContain('[o]');
    expect(r.stderr).toMatch(/the SKILL does not prescribe/);
  });

  // The roster is derived at runtime, so the drift that matters is PARTIAL: a
  // heading dropped from a SKILL template shrinks the roster and (o) quietly
  // stops asking for that gate. Pinning the cardinality turns a silent shrink
  // into a red test. Counting the fires against an empty ledger reads the
  // roster without giving the script a debug flag nothing else needs.
  const ROSTER_SIZE = { prep: 12, finalise: 15, full: 15 };
  const TEMPLATE_HEADINGS = { prep: 12, finalise: 24, full: 15 };
  const CANARY = {
    prep: 'Cross-Edition Consistency',
    finalise: 'Cross-Edition Consistency',
    full: 'Cross-Edition Consistency',
  };

  it('the SKILL still prescribes the reviews blocks the roster is read from', () => {
    // Pins the RAW template, upstream of the collapse below. A heading dropped
    // from a template shrinks the roster silently and (o) quietly stops asking
    // for that gate: P151 relocated into the roster. A count turns that red.
    for (const [phase, n] of Object.entries(TEMPLATE_HEADINGS)) {
      const got = prescribedHeadings(phase);
      expect(got.length, `phase=${phase} template: ${got.join(', ')}`).toBe(n);
      expect(got.join('|'), `phase=${phase} lost its cross-edition slot`).toMatch(
        /Cross-Edition Consistency/,
      );
    }
  });

  for (const [phase, size] of Object.entries(ROSTER_SIZE)) {
    it(`(o) derives ${size} prescribed blocks for phase=${phase}`, () => {
      const r = run(phaseFixture(phase, '---\ncompanion-to: 2026-06-15.md\n---\n'));
      const fired = firedGates(r.stderr);
      expect(
        fired.length,
        `roster for phase=${phase} changed; fired: ${fired.join(', ')}`,
      ).toBe(size);
      expect(fired).toContain(CANARY[phase]);
    });
  }

  it('(o) skips loudly when the SKILL cannot be read', () => {
    const brief = phaseFixture('prep', reviewsFor(['Voice Review']));
    const r = spawnSync('bash', [SCRIPT, brief], {
      encoding: 'utf8',
      env: { ...process.env, NEWSLETTER_SKILL_MD: '/nonexistent/SKILL.md' },
    });
    expect(r.stderr).toContain('SKIP [o]');
    expect(r.stderr).toContain('which gates this phase prescribes');
    expect(r.stderr).not.toContain('FAIL [o]');
  });

  it('(o) skips loudly when the reviews sibling is absent', () => {
    const r = run(phaseFixture('prep', null));
    expect(r.stderr).toContain('SKIP [o]');
    expect(r.stderr).toContain('no reviews sibling');
  });

  it('(o) falls back to the .prep filename infix when the brief names no phase', () => {
    const dir = mkdtempSync(join(tmpdir(), 'nl-roster-fb-'));
    const brief = join(dir, '2026-06-15.prep.md');
    writeFileSync(brief, H2_BRIEF.replace('phase: full\n', ''));
    writeFileSync(join(dir, '2026-06-15.reviews.md'), '---\n---\n');
    const fired = firedGates(run(brief).stderr);
    expect(fired.length).toBe(ROSTER_SIZE.prep);
  });


  // --- (p) avoided word, (q) markdown hard break, (r) joined paragraph (P154) ---
  //
  // These three are the deterministic half of P154: the editorial remediation
  // loop had no verification of its own, so a fix for one gate's finding could
  // introduce a new defect that nothing read until the next full gate battery.
  // Each check below has a named witness in the 2026-08-17 reviews sibling.

  const GUIDE = `## Word list

### Prefer

| Use | Instead of |
|-----|-----------|
| works | actually works |

### Avoid

| Word/phrase | Why |
|-------------|-----|
| actually | Almost always defensive filler |
| leverage | Corporate jargon |
| solution/solutions | Vague. Name the thing. |
| deep dive | Overused. Say "audit" or "review" |

---

## Idioms Tom rejects

| Class | Phrases to avoid | Note |
|-------|-----------------|------|
| Finance / legal idioms | "came due", "on the table" | Tom does not talk like that. |
`;

  // Run the lint with the avoided-word table pointed at a fixture guide.
  function runWithGuide(brief, guide) {
    const dir = mkdtempSync(join(tmpdir(), 'nl-guide-'));
    const path = join(dir, 'VOICE-AND-TONE.md');
    writeFileSync(path, guide === undefined ? GUIDE : guide);
    return spawnSync('bash', [SCRIPT, brief], {
      encoding: 'utf8',
      env: { ...process.env, VOICE_AND_TONE_MD: path },
    });
  }

  // Splice a line into the valid brief's body, just before the closing rule.
  function briefWithLine(line) {
    return VALID_BRIEF.replace(
      '**Why it matters to your team.** Portability is the cheapest hedge.',
      `**Why it matters to your team.** ${line}`,
    );
  }

  it('(p) flags a word the guide lists under Avoid', () => {
    const r = runWithGuide(
      fixture(briefWithLine('Portability is what teams actually hedge with.'), VALID_LINKEDIN),
      undefined,
    );
    expect(r.stderr).toContain('FAIL [p]');
    expect(r.stderr).toContain('actually');
  });

  it('(p) matches whole words, so "resolution" is not a hit on "solution"', () => {
    // Witness: 2026-04-24 line 53 carries "time to resolution", which a
    // substring match would flag and a whole-word match does not.
    const r = runWithGuide(
      fixture(briefWithLine('Time to resolution fell by a third.'), VALID_LINKEDIN),
      undefined,
    );
    expect(r.stderr).not.toContain('[p]');
  });

  it('(p) still fires inside our own parenthetical gloss', () => {
    // The strip is anchored on "](" so it takes link targets only. The guide's
    // gloss-on-first-use rule tells writers to put in-group terms in a
    // parenthetical, so exempting every parenthetical would exempt the one
    // construction the guide asks for.
    const r = runWithGuide(
      fixture(briefWithLine('Portability (actually the cheapest hedge) is the move.'), VALID_LINKEDIN),
      undefined,
    );
    expect(r.stderr).toContain('FAIL [p]');
  });

  it('(p) does not fire inside a quoted span or a link URL', () => {
    // The guide's list was written for landing-page copy. In a news brief
    // "leverage" and "solutions" have legitimate domain senses, and the brief
    // quotes sources verbatim, so quoted spans and URLs are out of scope.
    const r = runWithGuide(
      fixture(
        briefWithLine(
          'The filing called it "leverage plus a short squeeze", per [the report](https://example.com/solutions/x).',
        ),
        VALID_LINKEDIN,
      ),
      undefined,
    );
    expect(r.stderr).not.toContain('[p]');
  });

  it('(p) does not harvest the table header row as banned words', () => {
    // The header cell is "Word/phrase". Splitting slash-alternates before
    // skipping the header would ban "word" and "phrase" outright.
    const r = runWithGuide(
      fixture(briefWithLine('The word on every phrase here is portability.'), VALID_LINKEDIN),
      undefined,
    );
    expect(r.stderr).not.toContain('[p]');
  });

  it('(p) stops reading at the end of the Avoid table', () => {
    // The next table down has a Class cell "Finance / legal idioms"; an
    // unbounded read would slash-split it into "finance" and "legal idioms".
    const r = runWithGuide(
      fixture(briefWithLine('Finance teams are the ones asking.'), VALID_LINKEDIN),
      undefined,
    );
    expect(r.stderr).not.toContain('[p]');
  });

  it('(p) skips loudly when the guide file is absent', () => {
    const r = spawnSync('bash', [SCRIPT, fixture(VALID_BRIEF, VALID_LINKEDIN)], {
      encoding: 'utf8',
      env: { ...process.env, VOICE_AND_TONE_MD: '/nonexistent/VOICE-AND-TONE.md' },
    });
    expect(r.stderr).toContain('SKIP [p]');
    expect(r.stderr).not.toContain('FAIL [p]');
  });

  it('(p) fails, rather than skipping, when the guide has no readable Avoid table', () => {
    // Drift is silent in the direction that stops checking: a guide present but
    // unparseable is a broken contract, not an absent one.
    const r = runWithGuide(
      fixture(VALID_BRIEF, VALID_LINKEDIN),
      '## Word list\n\nNo table here any more.\n',
    );
    expect(r.stderr).toContain('FAIL [p]');
    expect(r.stderr).toContain('Avoid');
  });

  it('(p) parses the real guide on disk and finds a usable list', () => {
    // Size guard, matching check (o)'s roster-size pin: a parse that breaks
    // returns few or no entries, which is indistinguishable from a clean run.
    const r = run(
      fixture(
        briefWithLine('Portability is what teams actually hedge with.'),
        VALID_LINKEDIN,
      ),
    );
    expect(r.stderr, 'the real guide must still yield the "actually" entry').toContain(
      'FAIL [p]',
    );
  });

  it('(q) flags a markdown hard break left by an edit', () => {
    const r = run(fixture(briefWithLine('Portability is the cheapest hedge.  '), VALID_LINKEDIN));
    expect(r.stderr).toContain('FAIL [q]');
  });

  it('(q) leaves a single trailing space alone', () => {
    // A hard break needs two or more trailing spaces. The finding and the
    // reason given for it have to cover the same thing.
    const r = run(fixture(briefWithLine('Portability is the cheapest hedge. '), VALID_LINKEDIN));
    expect(r.stderr).not.toContain('[q]');
  });

  it('(r) flags two prose lines with no blank line between them', () => {
    // Witness: the 2026-08-17 ledger records this defect introduced twice by
    // remediation edits, the second time straight after a check was written
    // for the first.
    const r = run(
      fixture(
        briefWithLine('Portability is the cheapest hedge.\nSo is a second supplier.'),
        VALID_LINKEDIN,
      ),
    );
    expect(r.stderr).toContain('FAIL [r]');
  });

  it('(r) leaves list items, indented list items and table rows alone', () => {
    const r = run(
      fixture(
        briefWithLine(
          'Two hedges:\n\n- a second supplier\n- an open-weight fallback\n  - both of which cost money\n  - and neither of which is free\n\n| Hedge | Cost |\n|---|---|\n| Second supplier | High |\n| Open weights | Low |',
        ),
        VALID_LINKEDIN,
      ),
    );
    expect(r.stderr).not.toContain('[r]');
  });

  it('holds every corpus-wide pin in one sweep over the published editions', () => {
    // ONE spawn per edition, not one per property. Each of (p), (q), (r), (s)
    // and (m) carries a corpus-wide pin, and running a sweep each would spawn
    // the lint five times over every published brief. That was measured: three
    // sweeps took this file from roughly 47s to 191s and pushed a sibling test
    // past its own timeout under full-suite concurrency, which reddens the
    // CI-parity gate inside `npm run fix:deps` for a reason unrelated to
    // dependencies. Same coverage, a fifth of the spawns.
    //
    // Pins are measured, never assumed, and two of them corrected the tickets
    // that motivated them.
    const roots = ['src/newsletters/published/leader', 'src/newsletters/published/developer'];
    let checked = 0;
    const pHits = [];
    const sHits = [];
    const nonAdoption = [];
    for (const root of roots) {
      if (!existsSync(root)) continue;
      for (const date of readdirSync(root)) {
        const body = join(process.cwd(), root, date, `${date}.md`);
        if (!existsSync(body)) continue;
        checked += 1;
        const { stderr } = run(body);
        expect(stderr, `check (q) fired on ${body}`).not.toContain('[q]');
        expect(stderr, `check (r) fired on ${body}`).not.toContain('[r]');
        for (const line of stderr.split('\n')) {
          if (line.includes('FAIL [p]')) pHits.push(line);
          if (line.includes('[s]')) sHits.push(`${date}: ${line}`);
          if (line.includes('this is non-adoption rather than pre-adoption')) nonAdoption.push(date);
        }
      }
    }
    expect(checked, 'no published briefs were found to check').toBeGreaterThan(10);

    // (p): one genuine hit, 2026-05-01, "the distribution your business
    // actually needs". More than one means the parse widened; none means it
    // broke. The first version of (r)'s predicate treated an indented list item
    // as prose and appeared to fire 43 times, which nearly killed the check, so
    // all of these are pinned together rather than one at a time.
    expect(pHits.length, `check (p) hits:\n${pHits.join('\n')}`).toBe(1);
    expect(pHits[0]).toContain('2026-05-01');

    // (s): ADR-057's first-person hard fail. Measured at zero before the check
    // shipped, against one false positive with a naive word-boundary predicate:
    // "Landgericht Munchen I" in the 2026-08-03 edition, where the I is a
    // numeral in a court's name. A check that fires on a published edition gets
    // switched off.
    expect(sHits, `check (s) fired on published editions:\n${sHits.join('\n')}`).toEqual([]);

    // (m) non-adoption: digest counts are 2026-08-10 zero, 2026-08-17 five,
    // 2026-08-24 zero, so adoption is intermittent rather than a regression at a
    // point in time and TWO editions breached. P165's first draft said the
    // pipeline "stopped writing the digests"; the compliant edition between the
    // two breaches refutes it. Pinned on this branch's own message rather than
    // on any [m] failure, because 2026-08-17 fails [m] for the unrelated
    // pre-existing reason that its five digests no longer match its text.
    expect(nonAdoption).toEqual(['2026-08-10', '2026-08-24']);
  }, 60000);

  it('(p) reads the why column without doubling its full stop', () => {
    // Against the fixture guide, not the real one: the guide is a surface Tom
    // edits freely, and a suite that goes red on a reworded why cell would
    // report a parser bug for an ordinary edit. Real-guide coverage is the
    // corpus pin above.
    const r = runWithGuide(
      fixture(briefWithLine('We shipped a real solution here.'), VALID_LINKEDIN),
      undefined,
    );
    expect(r.stderr).toContain('Vague. Name the thing. Cut it');
  });

  it('(p) escapes a guide entry that carries a regex metacharacter', () => {
    // The cell is Tom-edited copy. Unescaped, "a.b" would match "axb".
    const r = runWithGuide(
      fixture(briefWithLine('The axb figure is the one to watch.'), VALID_LINKEDIN),
      GUIDE.replace('| leverage | Corporate jargon |', '| a.b | Made up |'),
    );
    expect(r.stderr).not.toContain('[p]');
  });

  it('(n) does not accept the (C) provenance line as an author reason', () => {
    // P154 adds a "Verified against:" line under a finding. Check (n) accepts
    // any following line of 12+ characters as the stated reason, so without an
    // exclusion the provenance line would discharge ADR-052's reason invariant.
    const dir = mkdtempSync(join(tmpdir(), 'nl-p154-n-'));
    const brief = join(dir, '2026-06-15.md');
    writeFileSync(brief, VALID_BRIEF);
    writeFileSync(
      join(dir, '2026-06-15.reviews.md'),
      [
        '# Reviews',
        '',
        '## Editor Review',
        '',
        '- CLEARED (forbidden to remediate)',
        '  Verified against: src/newsletters/published/leader/2026-06-22/2026-06-22.md',
        '',
      ].join('\n'),
    );
    expect(run(brief).stderr).toContain('FAIL [n]');
  });

});

// ── (s): ADR-057's hard fail, first person in the factual "What happened"
// bullets ────────────────────────────────────────────────────────────────────
// ADR-057 sorts voice on who is answerable and blocks on LOCATION rather than on
// the test: "I" inside the factual "What happened" bullets or the move list is a
// hard fail, and anywhere else a wrong-person call is a finding the author
// clears. That hard fail needs a deterministic owner, because ADR-052's own
// confirmation records a prose rule at this exact surface failing to hold.
//
// This check owns the "What happened" half only. The move-list half is not
// checkable yet: ADR-057 records that assets/draft-template.md does not define
// that section, so there is nothing stable to anchor on.
describe('check-newsletter-structure.sh: (s) first person in What happened (ADR-057)', () => {
  const withBlock = (block) => VALID_BRIEF.replace(
    '**What happened.** Anthropic [published a statement](https://www.anthropic.com/news/x) (Jun 12). The Wall Street Journal reported [the trigger](https://www.wsj.com/x) (Jun 13). Google shipped [Gemma 4 12B](https://blog.google/x) (Jun 11).',
    block,
  );
  const lint = (brief) => {
    const dir = mkdtempSync(join(tmpdir(), 'check-s-'));
    const p = join(dir, '2026-06-15.md');
    writeFileSync(p, brief);
    return run(p).stderr;
  };

  it('fires on "I" used as a sentence subject in the block', () => {
    expect(lint(withBlock('**What happened.** I checked every source on 12 June.')))
      .toContain('FAIL [s]');
  });

  it('fires on a first-person contraction in the block', () => {
    expect(lint(withBlock("**What happened.** I've read the filing in full.")))
      .toContain('FAIL [s]');
  });

  it('fires on a sub-bullet under the block, not only the label line', () => {
    // The block is a label plus whatever hangs off it. Checking the label line
    // alone would miss the shape the corpus actually uses.
    expect(lint(withBlock('**What happened.** Two things.\n\n- Anthropic shipped it.\n- I confirmed the date myself.')))
      .toContain('FAIL [s]');
  });

  it('stays quiet on a Roman numeral that is not a pronoun', () => {
    // The one corpus hit a naive \bI\b predicate produced: the 2026-08-03
    // edition's "Landgericht Munchen I, Germany's Munich Regional Court I".
    // A check that fires on a published edition would be switched off.
    expect(lint(withBlock("**What happened.** The Landgericht Munchen I, Germany's Munich Regional Court I, ruled on 31 July.")))
      .not.toContain('[s]');
  });

  it('stays quiet on "AI"', () => {
    expect(lint(withBlock('**What happened.** An AI agent opened the pull request on 12 June.')))
      .not.toContain('[s]');
  });

  it('stays quiet on first person inside a quoted span', () => {
    // A quote is the source speaking, not the publication. ADR-057 is about who
    // the publication speaks as, so a quoted "I" is not a voice violation.
    expect(lint(withBlock('**What happened.** Torvalds wrote that "I kept being told it was impossible" on 12 June.')))
      .not.toContain('[s]');
  });

  it('stays quiet on first person OUTSIDE the block', () => {
    // The load-bearing negative. ADR-057 permits "I" in item analysis, and a
    // check that blocked it there would enforce the superseded whitelist that
    // two published editions had already broken.
    expect(lint(VALID_BRIEF.replace(
      '**Why it matters to your team.** Portability is the cheapest hedge.',
      '**Why it matters to your team.** I think portability is the cheapest hedge.',
    ))).not.toContain('[s]');
  });

  it('reads both the colon and the full-stop label form', () => {
    // The corpus carries "**What happened:**"; the fixture above carries
    // "**What happened.**". Both are live and the check must not pick a side.
    expect(lint(withBlock('**What happened:** I checked every source on 12 June.')))
      .toContain('FAIL [s]');
  });

  it('reads the legacy H3 outline as well as the H2-rooted one', () => {
    // ADR-053 moved the outline to H2 from Issue 17 and left the archive at H3,
    // so a check anchored on heading level would go blind on one era or the
    // other. This one anchors on the label, and this case pins that.
    const h2 = VALID_BRIEF.replace('### Item 1:', '## Item 1:');
    expect(lint(h2.replace(
      '**What happened.** Anthropic [published a statement](https://www.anthropic.com/news/x) (Jun 12). The Wall Street Journal reported [the trigger](https://www.wsj.com/x) (Jun 13). Google shipped [Gemma 4 12B](https://blog.google/x) (Jun 11).',
      '**What happened.** I checked every source on 12 June.',
    ))).toContain('FAIL [s]');
  });

});

// ── (m): zero digests is non-adoption on a current edition, not pre-adoption
// (P165) ─────────────────────────────────────────────────────────────────────
// The zero-digest branch used to skip unconditionally and print "(pre-ADR-047
// edition)", a cause its predicate never tested. Issue 19 was written sixteen
// days after ADR-047 landed and its immediate predecessor complied, so the one
// guard against a stale gate verdict stood down because of exactly the omission
// that should have alarmed it, on every one of roughly twenty lint runs.
//
// The neighbouring checks already state the principle this restores. (h): "Do
// NOT silently skip". (p) and (o): "drift here is silent in the direction that
// stops checking, so this fails rather than skipping."
describe('check-newsletter-structure.sh: (m) non-adoption vs pre-adoption (P165)', () => {
  function datedReviews(date, blocks) {
    const dir = mkdtempSync(join(tmpdir(), 'nl-m165-'));
    const b = join(dir, `${date}.md`);
    writeFileSync(b, VALID_BRIEF);
    writeFileSync(join(dir, `${date}.linkedin.md`), VALID_LINKEDIN);
    writeFileSync(join(dir, `${date}.reviews.md`), `# Reviews\n\n${blocks}\n`);
    return b;
  }

  it('fails a current edition whose reviews sibling carries no digests', () => {
    // The observed 2026-08-24 state. ADR-047 landed 2026-08-08.
    const r = run(datedReviews('2026-08-24', '## Editor Review\nPASS.'));
    expect(r.stderr).toContain('FAIL [m]');
    expect(r.status).toBe(1);
  });

  it('treats ADR-047\'s own date as in scope', () => {
    // The boundary is the decision's date, so an edition published that day is
    // governed by it. Off-by-one here would exempt the first compliant edition.
    expect(run(datedReviews('2026-08-08', '## Editor Review\nPASS.')).stderr)
      .toContain('FAIL [m]');
  });

  it('still skips a genuine pre-adoption edition, loudly', () => {
    const r = run(datedReviews('2026-08-07', '## Editor Review\nPASS.'));
    expect(r.stderr).toContain('SKIP [m]');
    expect(r.stderr).not.toContain('FAIL [m]');
  });

  it('never claims pre-adoption for an edition it did not date-check', () => {
    // The defect itself: the message asserted a cause the predicate could not
    // distinguish, and hardcoded the benign reading of it. A skip may only state
    // what was actually tested.
    const current = run(datedReviews('2026-08-24', '## Editor Review\nPASS.')).stderr;
    expect(current).not.toContain('pre-ADR-047 edition');
  });

  it('skips with an honest reason when the filename carries no date', () => {
    // Not every caller passes a date-named brief. Absent a derivable date the
    // check cannot tell the two populations apart, and saying so is the honest
    // report; claiming pre-adoption again would be this defect one layer down.
    const dir = mkdtempSync(join(tmpdir(), 'nl-m165-nodate-'));
    const b = join(dir, 'draft.md');
    writeFileSync(b, VALID_BRIEF);
    writeFileSync(join(dir, 'draft.linkedin.md'), VALID_LINKEDIN);
    writeFileSync(join(dir, 'draft.reviews.md'), '# Reviews\n\n## Editor Review\nPASS.\n');
    const r = run(b);
    expect(r.stderr).toContain('SKIP [m]');
    expect(r.stderr).not.toContain('pre-ADR-047 edition');
    expect(r.stderr).toContain('no edition date');
  });

  // --- a sanctioned skip is not a verdict, and owes no digest (P165 defect 3) --
  //
  // Check (o) (P151) lets a gate record a documented skip as an "N/A: <reason>"
  // block, and refuses any reason the SKILL does not declare. Check (m) read
  // every roster heading as a verdict, so a sanctioned skip carried no digest,
  // was reported never-scored, and the save was blocked. Satisfying both would
  // have meant writing a digest for a gate that never ran, which asserts the
  // custody ADR-047 exists to protect. The two populations are distinguishable,
  // so (m) derives which one it is rather than assuming the block holds a
  // verdict: the same fix as the zero-digest branch above, one grain down.
  //
  // The waiver is bounded in three ways, one test each below: the reason must
  // be one the SKILL declares, the block must not be marked carried, and the
  // N/A must be the block's first content line rather than a phrase anywhere
  // in its prose.

  function skDigest() {
    return createHash('sha256').update(VALID_BRIEF.replace(/^---[\s\S]*?\n---\n/, ''))
      .digest('hex');
  }

  // One real verdict so the zero-digest branch does not fire; the block under
  // test sits beside it. An edition with no digests at all is the branch above.
  function withSkip(block) {
    return `## Voice Review\nscored-digest: sha256:${skDigest()}\nPASS.\n\n${block}`;
  }

  it('does not fire on a block recorded N/A for a reason the SKILL declares', () => {
    const r = run(datedReviews('2026-08-24',
      withSkip('## Editor Review\n\nN/A: newsletter-critic returned REJECTED')));
    expect(r.stderr, 'a sanctioned skip has no verdict to hold custody of')
      .not.toContain('FAIL [m]');
  });

  it('still fires on a block recorded N/A for a reason the SKILL does not declare', () => {
    // (m) reads the SKILL's declared list itself rather than trusting (o) to
    // have run: (o) skips loudly when the SKILL is unreadable, and a waiver
    // granted on sanctioning nobody performed is P151 relocated one check over.
    const r = run(datedReviews('2026-08-24',
      withSkip('## Editor Review\n\nN/A: ran out of time before the publish window')));
    expect(r.stderr).toContain('FAIL [m]');
  });

  it('still fires on a carried block recorded N/A for the carried-from-prep reason', () => {
    // A carried block DOES have a verdict, produced at prep, and (m)'s carried
    // arm is the only thing checking it was copied rather than recomposed. The
    // SKILL says this in terms: check (o) keys on whether a block is present,
    // this arm keys on whether its digest was copied or recomputed.
    const r = run(datedReviews('2026-08-24',
      withSkip('## Editor Review (prep)\n\nN/A: carried from prep (no material change)')));
    expect(r.stderr).toContain('FAIL [m]');
    expect(r.stderr).toContain('custody');
  });

  it('still fires on an UNMARKED block whose N/A reason claims carriage', () => {
    // The one declared reason that asserts a verdict exists must not buy the
    // waiver on its own text. ADR-047 criterion 6: an unmarked carried block is
    // reported, not excused, so the reason marks the block carried and the
    // custody arm keeps it.
    const r = run(datedReviews('2026-08-24',
      withSkip('## Editor Review\n\nN/A: carried from prep (no material change)')));
    expect(r.stderr).toContain('FAIL [m]');
    expect(r.stderr).toContain('custody');
  });

  it('reads only the block\'s first content line, as check (o) does', () => {
    // A live verdict whose prose happens to say "N/A:" somewhere must keep
    // owing its digest. Two predicates for one question drift apart, and the
    // drift would be silent in the direction that stops checking.
    const r = run(datedReviews('2026-08-24',
      withSkip('## Editor Review\n\nPASS. Item 3 sourcing: N/A: no second outlet.')));
    expect(r.stderr).toContain('FAIL [m]');
  });

  it('a current edition WITH digests is unaffected by the scope test', () => {
    // The scope test gates the zero-digest branch only. An edition that records
    // its digests must still be compared, not waved through by being current.
    const stale = '0'.repeat(64);
    const r = run(datedReviews('2026-08-24',
      `## Editor Review (finalise)\nscored-digest: sha256:${stale}\nPASS.`));
    expect(r.stderr).toContain('FAIL [m]');
    expect(r.stderr).toContain('different brief');
  });

});
