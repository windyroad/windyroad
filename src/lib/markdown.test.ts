import { describe, it, expect } from 'vitest';
import { slugFromTitle } from './markdown';

describe('slugFromTitle', () => {
  it('lowercases and hyphenates plain titles', () => {
    expect(slugFromTitle('Stop your AI agent from ignoring your architecture')).toBe(
      'stop-your-ai-agent-from-ignoring-your-architecture',
    );
  });

  it('strips apostrophes from titles', () => {
    expect(slugFromTitle("Your AI agent doesn't know when to stop committing")).toBe(
      'your-ai-agent-doesnt-know-when-to-stop-committing',
    );
  });

  it('strips periods from titles', () => {
    expect(
      slugFromTitle("An AI agent deleted production. The model wasn't the problem."),
    ).toBe('an-ai-agent-deleted-production-the-model-wasnt-the-problem');
  });

  it('does not leave trailing punctuation in slugs', () => {
    expect(slugFromTitle('A title with a trailing period.')).toBe(
      'a-title-with-a-trailing-period',
    );
  });
});
