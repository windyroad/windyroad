import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import OperatorSection from './index';

describe('OperatorSection', () => {
  it('names Tom Howard and uses "I" for personal track record', () => {
    const { container } = render(<OperatorSection />);
    const text = container.textContent || '';
    expect(text).toMatch(/Tom Howard/);
    // Personal track record uses "I" per ADR 010
    expect(text).toMatch(/I've been working with AI/);
  });

  it('uses "we" for team capabilities', () => {
    const { container } = render(<OperatorSection />);
    const text = container.textContent || '';
    // "we know" and "we've seen/fixed" are team capability claims
    expect(text).toMatch(/we know what it takes/);
    expect(text).toMatch(/[Ww]e've seen what breaks/);
  });
});
