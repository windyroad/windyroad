import Link from 'next/link';
import { format, parse } from 'date-fns';
import slugify from 'slugify';
import { getAllPosts } from '@/src/lib/markdown';
import { notFound } from 'next/navigation';
import styles from '../../blog.module.scss';

export async function generateStaticParams(): Promise<{ tag: string }[]> {
  const posts = getAllPosts();
  const tagSlugs = new Set<string>();

  for (const post of posts) {
    for (const tag of post.frontmatter.tags ?? []) {
      tagSlugs.add(slugify(tag, { lower: true }));
    }
  }

  return Array.from(tagSlugs).map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag: tagSlug } = await params;
  const posts = getAllPosts();

  const tagName = posts
    .flatMap((p) => p.frontmatter.tags ?? [])
    .find((t) => slugify(t, { lower: true }) === tagSlug);

  if (!tagName) {
    return { title: 'Tag not found — Tom Howard' };
  }

  return {
    title: `Posts tagged "${tagName}" — Tom Howard`,
    description: `Blog posts tagged with ${tagName}.`,
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag: tagSlug } = await params;
  const allPosts = getAllPosts();

  const isKnownTag = allPosts.some((post) =>
    post.frontmatter.tags?.some((t) => slugify(t, { lower: true }) === tagSlug),
  );
  if (!isKnownTag) notFound();

  const posts = allPosts.filter((post) =>
    post.frontmatter.tags?.some((t) => slugify(t, { lower: true }) === tagSlug),
  );

  const tagName =
    posts[0]?.frontmatter.tags?.find(
      (t) => slugify(t, { lower: true }) === tagSlug,
    ) ?? tagSlug;

  return (
    <div className={styles.blogPage}>
      <div className={styles.inner}>
        <nav aria-label="Back to blog">
          <Link href="/blog" className={styles.backLink}>
            ← All posts
          </Link>
        </nav>
        <h1 className={styles.pageTitle}>
          Posts tagged &ldquo;#{tagName}&rdquo;
        </h1>
        {posts
          .filter((post) => !!post.frontmatter.date)
          .map((post) => (
            <article
              key={post.slug}
              className={styles.postCard}
              aria-labelledby={`post-title-${post.slug}`}
            >
              <h2
                id={`post-title-${post.slug}`}
                className={styles.postTitle}
              >
                <Link href={`/blog/${post.slug}`}>
                  {post.frontmatter.title}
                </Link>
              </h2>
              <div className={styles.postMeta}>
                By {post.frontmatter.author},{' '}
                {format(
                  parse(post.frontmatter.date, 'yyyy-MM-dd', new Date()),
                  'MMMM yyyy',
                )}
              </div>
              {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
                <div className={styles.tags}>
                  {post.frontmatter.tags.map((tag) => {
                    const tSlug = slugify(tag, { lower: true });
                    return (
                      <Link
                        key={tag}
                        href={`/blog/tag/${tSlug}`}
                        className={styles.tag}
                        aria-label={`Posts tagged ${tag}`}
                        aria-current={tSlug === tagSlug ? 'page' : undefined}
                      >
                        #{tag}
                      </Link>
                    );
                  })}
                </div>
              )}
              <div className={styles.postExcerpt}>
                {post.excerpt}{' '}
                <Link
                  href={`/blog/${post.slug}`}
                  aria-label={`Read more about ${post.frontmatter.title}`}
                >
                  (more)
                </Link>
              </div>
            </article>
          ))}
        <div className={styles.olderLink}>
          <a href="https://windyroad.com.au/articles/">Older Blog Posts</a>
        </div>
      </div>
    </div>
  );
}
