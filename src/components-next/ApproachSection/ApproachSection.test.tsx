import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ApproachSection from './index';

describe('ApproachSection', () => {
  it('uses "we" voice', () => {
    const { container } = render(<ApproachSection />);
    const text = container.textContent || '';
    expect(text).not.toMatch(/\bI look\b/);
    expect(text).not.toMatch(/\bI pair\b/);
    expect(text).not.toMatch(/\bwith me\b/i);
  });
});
