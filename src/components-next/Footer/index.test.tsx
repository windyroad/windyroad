import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const source = readFileSync(
  resolve(__dirname, 'index.tsx'),
  'utf-8',
);

describe('Footer source', () => {
  it('does not pitch consulting availability (funnel retired per ADR-041)', () => {
    expect(source).not.toMatch(/Fully booked/i);
    expect(source).not.toMatch(/engagements/i);
  });
});
