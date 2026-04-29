import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const source = readFileSync(
  resolve(__dirname, 'page.tsx'),
  'utf-8',
);

describe('vibe-code-audit page.tsx source', () => {
  it('does not link to cal.com', () => {
    expect(source).not.toMatch(/cal\.com/);
  });

  it('imports FullyBookedCTA', () => {
    expect(source).toMatch(
      /import\s+FullyBookedCTA\s+from\s+['"][^'"]*FullyBookedCTA['"]/,
    );
  });

  it('tags the hero CTA with source="vibe_audit_hero"', () => {
    expect(source).toMatch(/source=["']vibe_audit_hero["']/);
  });

  it('tags the 15-min CTA with source="vibe_audit_15min"', () => {
    expect(source).toMatch(/source=["']vibe_audit_15min["']/);
  });
});
