import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPostBySlug } from '@/src/lib/markdown';
import BlogPost from './page';

vi.mock('@/src/lib/markdown', () => ({
  getAllSlugs: vi.fn(),
  getPostBySlug: vi.fn(),
}));

afterEach(cleanup);

async function renderPost(subtitle?: string) {
  vi.mocked(getPostBySlug).mockResolvedValue({
    slug: 'example',
    frontmatter: {
      title: 'Example article',
      subtitle,
      date: '2026-11-03',
      author: 'Tom Howard',
      tags: ['batch size'],
    },
    content: '',
    excerpt: '',
    html: '<p>Article body</p>',
  });
  return render(await BlogPost({ params: Promise.resolve({ slug: 'example' }) }));
}

describe('article header', () => {
  it('places an optional subtitle directly after the title', async () => {
    await renderPost('A worked example');
    const title = screen.getByRole('heading', { level: 1 });
    expect(title.nextElementSibling).toHaveTextContent('A worked example');
  });

  it.each([undefined, '   '])('omits empty subtitle markup for %s', async (subtitle) => {
    const { container } = await renderPost(subtitle);
    expect(container.querySelector('header > p')).toBeNull();
  });

  it('links tags to the existing tag archive', async () => {
    await renderPost();
    expect(screen.getByRole('link', { name: 'Posts tagged batch size' }))
      .toHaveAttribute('href', '/blog/tag/batch-size');
  });
});
