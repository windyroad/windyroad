import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const source = readFileSync(resolve(__dirname, 'page.tsx'), 'utf-8');

describe('Homepage page.tsx source', () => {
  it('does not link to cal.com', () => {
    expect(source).not.toMatch(/cal\.com/);
  });

  it('does not reference the retired FullyBookedCTA', () => {
    expect(source).not.toMatch(/FullyBookedCTA/);
  });

  it('drives subscription to The Shift newsletter', () => {
    expect(source).toMatch(/linkedin\.com\/newsletters\/the-shift/);
  });

  it('links to the blog', () => {
    expect(source).toMatch(/href=["']\/blog["']/);
  });

  it('has no consulting pricing/engagement copy', () => {
    expect(source).not.toMatch(/Patch Fitness Assessment/);
    expect(source).not.toMatch(/\$9,000/);
  });
});
