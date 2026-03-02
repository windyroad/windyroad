import Link from 'next/link';
import { format, parse } from 'date-fns';
import { getAllSlugs, getPostBySlug } from '@/src/lib/markdown';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Not Found' };
  return {
    title: `${post.frontmatter.title} - Windy Road`,
    description: post.excerpt,
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const { frontmatter, html } = post;
  const formattedDate = format(
    parse(frontmatter.date, 'yyyy-MM-dd', new Date()),
    'MMMM yyyy',
  );

  const moreLink = frontmatter.link ? (
    <a href={frontmatter.link} target="_blank" rel="noopener noreferrer">
      read more...
    </a>
  ) : null;

  return (
    <main className="container">
      <article className="content blog-article">
        <header>
          <h2>
            <Link href={`/blog/${slug}`}>{frontmatter.title}</Link>
          </h2>
          <div className="meta">
            by {frontmatter.author}, {formattedDate}
            <div>
              {frontmatter.tags?.map((tag) => (
                <span key={tag}>#{tag} </span>
              ))}
            </div>
          </div>
        </header>
        <section className="blog-article-content">
          <div
            className="blog-article-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          {moreLink}
        </section>
      </article>
    </main>
  );
}
