import Link from 'next/link';
import { format, parse } from 'date-fns';
import { getAllSlugs, getPostBySlug } from '@/src/lib/markdown';
import { notFound } from 'next/navigation';
import CTASection from '@/src/components-next/CTASection';
import styles from '../post.module.scss';

const CTA_TAGS = ['ai coding', 'ai-coding', 'vibe coding', 'claude code'];


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
    title: `${post.frontmatter.title} | Tom Howard`,
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

  const showCTA = frontmatter.tags?.some((tag) => CTA_TAGS.includes(tag));

  const moreLink = frontmatter.link ? (
    <a
      href={frontmatter.link}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.readMore}
    >
      read more...
    </a>
  ) : null;

  return (
    <div className={styles.postPage}>
      <div className={styles.inner}>
        <article>
          <header className={styles.postHeader}>
            <h1 className={styles.postTitle}>
              <Link href={`/blog/${slug}`}>{frontmatter.title}</Link>
            </h1>
            <div className={styles.postMeta}>
              by {frontmatter.author}, {formattedDate}
              <div className={styles.tags}>
                {frontmatter.tags?.map((tag) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>
            </div>
          </header>
          <section className={styles.content}>
            <div dangerouslySetInnerHTML={{ __html: html }} />
            {moreLink}
          </section>
        </article>

        {showCTA && <CTASection />}
      </div>
    </div>
  );
}
