import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const source = readFileSync(
  resolve(__dirname, 'page.tsx'),
  'utf-8',
);

describe('Homepage page.tsx source', () => {
  it('does not link to cal.com', () => {
    expect(source).not.toMatch(/cal\.com/);
  });

  it('imports FullyBookedCTA', () => {
    expect(source).toMatch(
      /import\s+FullyBookedCTA\s+from\s+['"][^'"]*FullyBookedCTA['"]/,
    );
  });

  it('tags the hero CTA with source="homepage_hero"', () => {
    expect(source).toMatch(/source=["']homepage_hero["']/);
  });

  it('tags the final CTA with source="homepage_final"', () => {
    expect(source).toMatch(/source=["']homepage_final["']/);
  });

  it('tags the three pricing tier CTAs', () => {
    expect(source).toMatch(/source=["']homepage_pricing_t1["']/);
    expect(source).toMatch(/source=["']homepage_pricing_t2["']/);
    expect(source).toMatch(/source=["']homepage_pricing_t3["']/);
  });
});
