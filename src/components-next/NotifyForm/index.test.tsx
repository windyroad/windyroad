import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const source = readFileSync(
  resolve(__dirname, 'index.tsx'),
  'utf-8',
);

describe('NotifyForm source', () => {
  it('uses the waitlist heading copy', () => {
    expect(source).toMatch(/Want to know when we(&apos;|')re taking work again\?/);
  });

  it('uses the waitlist helper text', () => {
    expect(source).toMatch(
      /We(&apos;|')ll send one note when we open up\. No pitch, no list churn\./,
    );
  });

  it('uses "Notify me" as the submit label', () => {
    expect(source).toMatch(/Notify me/);
  });

  it('does not include the legacy "Not sure where to start?" heading', () => {
    expect(source).not.toMatch(/Not sure where to start\?/);
  });

  it('does not include the legacy "What\'s breaking?" textarea label', () => {
    expect(source).not.toMatch(/What's breaking\?/);
    expect(source).not.toMatch(/What&apos;s breaking\?/);
  });
});
