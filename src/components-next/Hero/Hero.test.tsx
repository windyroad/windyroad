import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Hero from './index';

describe('Hero', () => {
  it('uses "we" voice, not "I"', () => {
    const { container } = render(<Hero />);
    const text = container.textContent || '';
    expect(text).not.toMatch(/\bI make\b/);
    expect(text).toMatch(/We make/);
  });
});
