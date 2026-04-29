import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import AiQuality, { metadata } from './page';

const source = readFileSync(resolve(__dirname, 'page.tsx'), 'utf-8');

describe('AI Quality page', () => {
  it('renders without error and produces a single h1', () => {
    const { container } = render(<AiQuality />);
    const h1s = container.querySelectorAll('h1');
    expect(h1s.length).toBe(1);
  });

  it('exposes the AI code quality title in metadata', () => {
    expect(metadata.title).toMatch(/AI Code Quality/i);
  });

  it('does not link to cal.com', () => {
    expect(source).not.toMatch(/cal\.com/);
  });

  it('imports FullyBookedCTA', () => {
    expect(source).toMatch(
      /import\s+FullyBookedCTA\s+from\s+['"][^'"]*FullyBookedCTA['"]/,
    );
  });

  it('tags the hero CTA with source="ai_quality_hero"', () => {
    expect(source).toMatch(/source=["']ai_quality_hero["']/);
  });

  it('tags the final CTA with source="ai_quality_final"', () => {
    expect(source).toMatch(/source=["']ai_quality_final["']/);
  });

  it('tags the three pricing tier CTAs', () => {
    expect(source).toMatch(/source=["']ai_quality_pricing_t1["']/);
    expect(source).toMatch(/source=["']ai_quality_pricing_t2["']/);
    expect(source).toMatch(/source=["']ai_quality_pricing_t3["']/);
  });
});
