import Link from 'next/link';
import { format, parse } from 'date-fns';
import { getAllPosts } from '@/src/lib/markdown';

export const metadata = {
  title: 'Blog - Windy Road',
  description: 'Blog posts from Windy Road Technology',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="container">
      <div className="content blog">
        <h2>Blog</h2>
        {posts
          .filter((post) => !!post.frontmatter.date)
          .map((post) => (
            <article
              key={post.slug}
              className="post-link"
              style={{ minHeight: '135px', overflow: 'auto' }}
            >
              <div style={{ marginLeft: '0.75em', marginRight: '0.75em' }}>
                <header>
                  <h3>
                    <Link href={`/blog/${post.slug}`}>
                      {post.frontmatter.title}
                    </Link>
                  </h3>
                </header>
                <div className="meta">
                  By {post.frontmatter.author},{' '}
                  {format(
                    parse(post.frontmatter.date, 'yyyy-MM-dd', new Date()),
                    'MMMM yyyy',
                  )}
                </div>
                <section>
                  {post.excerpt}{' '}
                  <Link href={`/blog/${post.slug}`}>(more)</Link>
                </section>
              </div>
            </article>
          ))}
        <div style={{ textAlign: 'center', marginBottom: '0.75em' }}>
          <a href="https://windyroad.com.au/articles/">Older Blog Posts</a>
        </div>
      </div>
    </main>
  );
}
