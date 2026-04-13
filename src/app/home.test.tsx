import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Home from './page';

describe('Homepage', () => {
  it('has patch fitness headline', () => {
    const { container } = render(<Home />);
    const h1 = container.querySelector('h1');
    expect(h1?.textContent).toMatch(/patch/i);
  });

  it('has heading hierarchy with no skipped levels', () => {
    const { container } = render(<Home />);
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    expect(headings.length).toBeGreaterThan(0);

    const h1s = container.querySelectorAll('h1');
    expect(h1s.length).toBe(1);

    const h2s = container.querySelectorAll('h2');
    expect(h2s.length).toBeGreaterThan(0);
  });

  it('uses "we" for service copy, not "I help/partner/audit"', () => {
    const { container } = render(<Home />);
    const text = container.textContent || '';
    expect(text).not.toMatch(/\bI help\b/);
    expect(text).not.toMatch(/\bI partner\b/);
    expect(text).not.toMatch(/\bI audit\b/);
    expect(text).not.toMatch(/\bI embed\b/);
    expect(text).not.toMatch(/\bI spend\b/);
  });

  it('includes Patch Fitness Assessment pricing', () => {
    const { container } = render(<Home />);
    const text = container.textContent || '';
    expect(text).toMatch(/Patch Fitness Assessment/);
    expect(text).toMatch(/\$5,000/);
  });

  it('links to /ai-quality as secondary path', () => {
    const { container } = render(<Home />);
    const link = container.querySelector('a[href="/ai-quality"]');
    expect(link).not.toBeNull();
  });
});
