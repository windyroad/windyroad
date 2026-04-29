import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const source = readFileSync(
  resolve(__dirname, 'index.tsx'),
  'utf-8',
);

describe('Header source', () => {
  it('does not link to cal.com', () => {
    expect(source).not.toMatch(/cal\.com/);
  });

  it('imports FullyBookedCTA', () => {
    expect(source).toMatch(
      /import\s+FullyBookedCTA\s+from\s+['"][^'"]*FullyBookedCTA['"]/,
    );
  });

  it('uses source="header" tag for analytics', () => {
    expect(source).toMatch(/source=["']header["']/);
  });
});
