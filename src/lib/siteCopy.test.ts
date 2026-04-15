import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { HERO_HEADLINE, HERO_HEADLINE_LINE1, HERO_HEADLINE_LINE2 } from './siteCopy.mjs';

describe('siteCopy', () => {
  it('HERO_HEADLINE combines the two headline lines', () => {
    expect(HERO_HEADLINE).toBe(`${HERO_HEADLINE_LINE1} ${HERO_HEADLINE_LINE2}`);
  });

  it('OG image generator uses the shared hero headline constants', () => {
    const ogScript = readFileSync(
      join(process.cwd(), 'scripts/generate-og-image.mjs'),
      'utf-8',
    );
    expect(ogScript).toContain('HERO_HEADLINE_LINE1');
    expect(ogScript).toContain('HERO_HEADLINE_LINE2');
  });

  it('homepage uses the shared hero headline', () => {
    const pageFile = readFileSync(
      join(process.cwd(), 'src/app/page.tsx'),
      'utf-8',
    );
    expect(pageFile).toContain('HERO_HEADLINE');
  });
});
