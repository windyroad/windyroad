import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import OperatorSection from './index';

describe('OperatorSection', () => {
  it('uses "we" voice and names Tom Howard', () => {
    const { container } = render(<OperatorSection />);
    const text = container.textContent || '';
    expect(text).not.toMatch(/\bI've shipped\b/);
    expect(text).not.toMatch(/\bI know\b/);
    expect(text).not.toMatch(/\bI've seen\b/);
    expect(text).not.toMatch(/\bI've fixed\b/);
    expect(text).toMatch(/Tom Howard/);
  });
});
