import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const source = readFileSync(
  resolve(__dirname, 'index.tsx'),
  'utf-8',
);

describe('Footer source', () => {
  it('shows the "Fully booked" status caption', () => {
    expect(source).toMatch(/Fully booked\. Not taking new engagements right now\./);
  });
});
