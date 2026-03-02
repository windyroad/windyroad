import Link from 'next/link';
import { format, parse } from 'date-fns';
import { getAllPosts } from '@/src/lib/markdown';
import styles from './blog.module.scss';

export const metadata = {
  title: 'Blog — Tom Howard',
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
            <article key={post.slug} className={styles.postCard}>
              <h2 className={styles.postTitle}>
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
              <div className={styles.postExcerpt}>
                {post.excerpt}{' '}
                <Link href={`/blog/${post.slug}`}>(more)</Link>
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
