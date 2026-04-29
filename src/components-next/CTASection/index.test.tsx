import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const source = readFileSync(
  resolve(__dirname, 'index.tsx'),
  'utf-8',
);

describe('CTASection source', () => {
  it('does not link to cal.com', () => {
    expect(source).not.toMatch(/cal\.com/);
  });

  it('imports FullyBookedCTA', () => {
    expect(source).toMatch(
      /import\s+FullyBookedCTA\s+from\s+['"][^'"]*FullyBookedCTA['"]/,
    );
  });

  it('uses source="founders_cta" tag for analytics', () => {
    expect(source).toMatch(/source=["']founders_cta["']/);
  });
});
