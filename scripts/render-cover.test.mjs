import { describe, it, expect } from 'vitest';
import { substituteCoverTemplate, checkHookWidth } from './render-cover.mjs';

const TEMPLATE = `<svg>
  <title>{{TITLE_TEXT}}</title>
  <desc>{{DESC_TEXT}}</desc>
  <text>{{WORDMARK}}</text>
  <text>{{SUBTITLE}}</text>
  <text>{{HOOK_LINE_1}}</text>
  <text>{{HOOK_LINE_2}}</text>
  <text>WEEK ENDING {{WEEK_ENDING}}</text>
</svg>`;

describe('substituteCoverTemplate', () => {
  it('replaces every documented placeholder', () => {
    const out = substituteCoverTemplate(TEMPLATE, {
      titleText: 'The Shift Issue 03, week ending 2026-05-01',
      descText: 'Cover for The Shift Issue 03.',
      wordmark: 'The Shift',
      subtitle: 'AI ENGINEERING, WEEKLY  ·  ISSUE 03',
      hookLine1: 'Six AI shifts this week.',
      hookLine2: 'All of them measurement problems.',
      weekEnding: '2026-05-01',
    });

    expect(out).toContain('<title>The Shift Issue 03, week ending 2026-05-01</title>');
    expect(out).toContain('<desc>Cover for The Shift Issue 03.</desc>');
    expect(out).toContain('>The Shift<');
    expect(out).toContain('AI ENGINEERING, WEEKLY  ·  ISSUE 03');
    expect(out).toContain('Six AI shifts this week.');
    expect(out).toContain('All of them measurement problems.');
    expect(out).toContain('WEEK ENDING 2026-05-01');
  });

  it('leaves no unsubstituted placeholders', () => {
    const out = substituteCoverTemplate(TEMPLATE, {
      titleText: 't',
      descText: 'd',
      wordmark: 'w',
      subtitle: 's',
      hookLine1: 'h1',
      hookLine2: 'h2',
      weekEnding: '2026-05-01',
    });
    expect(out).not.toMatch(/\{\{[A-Z_]+\}\}/);
  });

  it('throws when a required parameter is missing', () => {
    expect(() =>
      substituteCoverTemplate(TEMPLATE, {
        titleText: 't',
        descText: 'd',
        wordmark: 'w',
        subtitle: 's',
        hookLine1: 'h1',
      }),
    ).toThrow(/missing.*hookLine2|missing.*weekEnding/);
  });

  it('escapes XML special characters in user inputs', () => {
    const out = substituteCoverTemplate(TEMPLATE, {
      titleText: 'Issue 03 & week <2026-05-01>',
      descText: 'd',
      wordmark: 'w',
      subtitle: 's',
      hookLine1: "Tokens & context: don't blink",
      hookLine2: 'h2',
      weekEnding: '2026-05-01',
    });
    expect(out).toContain('Issue 03 &amp; week &lt;2026-05-01&gt;');
    expect(out).toContain('Tokens &amp; context: don&apos;t blink');
  });
});

// P100: the cover renderer used to substitute hook lines silently and rely on
// the human render-and-verify Read. An over-long hook-2 clipped invisibly. The
// char-count budget is a proportional-font proxy, so warnings are non-fatal:
// they surface the trap, and the render-and-verify step stays the backstop.
describe('checkHookWidth', () => {
  it('returns no warnings for hook lines within budget', () => {
    expect(
      checkHookWidth({
        hookLine1: 'Six AI shifts this week.',
        hookLine2: 'All of them measurement problems.',
      }),
    ).toEqual([]);
  });

  it('warns when hook-2 exceeds its ~40-char safe-area budget', () => {
    // 44 chars: the Issue 10 line that clipped to "...are the j".
    const warnings = checkHookWidth({
      hookLine1: 'Six AI shifts this week.',
      hookLine2: 'Governance, trust and new skills are the job',
    });
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatch(/hook-2/);
    expect(warnings[0]).toMatch(/44/);
  });

  it('warns when hook-1 exceeds its 28-char safe-area budget', () => {
    const warnings = checkHookWidth({
      hookLine1: 'AI cyber capabilities shipped this week too',
      hookLine2: 'All of them measurement problems.',
    });
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatch(/hook-1/);
  });

  it('warns for both lines when both exceed budget', () => {
    expect(
      checkHookWidth({
        hookLine1: 'A very long first hook line that overflows',
        hookLine2: 'And a very long second hook line that also overflows',
      }),
    ).toHaveLength(2);
  });
});
