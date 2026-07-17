import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const source = readFileSync(
  resolve(__dirname, 'page.tsx'),
  'utf-8',
);

describe('blog [slug]/page.tsx source', () => {
  it('does not link to cal.com', () => {
    expect(source).not.toMatch(/cal\.com/);
  });

  it('does not contain the legacy "Want these controls" CTA headline', () => {
    expect(source).not.toMatch(/Want these controls/);
  });

  it('does not declare the CTA_TAGS allowlist', () => {
    expect(source).not.toMatch(/CTA_TAGS/);
  });

  it('does not import the generic Button component', () => {
    expect(source).not.toMatch(/from ['"].*\/Button['"]/);
  });

  it('offers a tracked newsletter subscription and more articles', () => {
    expect(source).toContain('placement="article-end"');
    expect(source).toContain('href="/blog"');
  });

  it('includes accessible Open Graph image metadata', () => {
    expect(source).toContain('openGraph:');
    expect(source).toContain('alt: post.frontmatter.imageAlt ?? post.frontmatter.title');
  });
});
