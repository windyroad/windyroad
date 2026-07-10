import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('@/src/lib/markdown', () => ({
  getAllPosts: () => [
    {
      slug: 'sample-post',
      frontmatter: {
        title: 'Sample Post',
        date: '2026-06-01',
        author: 'Tom Howard',
      },
      excerpt: 'An excerpt.',
    },
  ],
}));

import Home from './page';

describe('Homepage', () => {
  it('leads with The Shift newsletter headline', () => {
    const { container } = render(<Home />);
    const h1 = container.querySelector('h1');
    expect(h1?.textContent).toMatch(/frontier/i);
  });

  it('has heading hierarchy with a single h1 and no skipped levels', () => {
    const { container } = render(<Home />);
    expect(container.querySelectorAll('h1').length).toBe(1);
    expect(container.querySelectorAll('h2').length).toBeGreaterThan(0);
  });

  it('uses "we" for framing copy, not "I help/partner/audit"', () => {
    const { container } = render(<Home />);
    const text = container.textContent || '';
    expect(text).not.toMatch(/\bI help\b/);
    expect(text).not.toMatch(/\bI partner\b/);
    expect(text).not.toMatch(/\bI audit\b/);
    expect(text).not.toMatch(/\bI embed\b/);
  });

  it('offers a subscribe path to The Shift newsletter', () => {
    const { container } = render(<Home />);
    const link = container.querySelector(
      'a[href*="linkedin.com/newsletters/the-shift"]',
    );
    expect(link).not.toBeNull();
  });

  it('surfaces recent writing linking to the blog', () => {
    const { container } = render(<Home />);
    const blogLink = container.querySelector('a[href="/blog/sample-post"]');
    expect(blogLink).not.toBeNull();
  });
});
