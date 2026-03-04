import Link from 'next/link';
import { format, parse } from 'date-fns';
import slugify from 'slugify';
import { getAllPosts } from '@/src/lib/markdown';
import styles from './blog.module.scss';

export const metadata = {
  title: 'Blog | Tom Howard',
  description: 'Articles on software delivery, AI, and engineering leadership.',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className={styles.blogPage}>
      <div className={styles.inner}>
        <h1 className={styles.pageTitle}>Blog</h1>
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
                    const tagSlug = slugify(tag, { lower: true });
                    return (
                      <Link
                        key={tag}
                        href={`/blog/tag/${tagSlug}`}
                        className={styles.tag}
                        aria-label={`Posts tagged ${tag}`}
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
