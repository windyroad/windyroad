import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const source = readFileSync(resolve(__dirname, 'index.tsx'), 'utf-8');

describe('Header source', () => {
  it('does not link to cal.com', () => {
    expect(source).not.toMatch(/cal\.com/);
  });

  it('does not reference the retired FullyBookedCTA', () => {
    expect(source).not.toMatch(/FullyBookedCTA/);
  });

  it('does not link to the retired /ai-quality route', () => {
    expect(source).not.toMatch(/href=["']\/ai-quality["']/);
  });

  it('links to the blog and The Shift newsletter', () => {
    expect(source).toMatch(/href=["']\/blog["']/);
    expect(source).toMatch(/linkedin\.com\/newsletters\/the-shift/);
  });
});
