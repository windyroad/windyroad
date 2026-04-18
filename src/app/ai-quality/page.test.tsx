import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import AiQuality, { metadata } from './page';

describe('AI Quality page', () => {
  it('renders without error and produces a single h1', () => {
    const { container } = render(<AiQuality />);
    const h1s = container.querySelectorAll('h1');
    expect(h1s.length).toBe(1);
  });

  it('exposes the AI code quality title in metadata', () => {
    expect(metadata.title).toMatch(/AI Code Quality/i);
  });
});
