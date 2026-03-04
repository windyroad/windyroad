import Link from 'next/link';
import { format, parse } from 'date-fns';
import { getAllSlugs, getPostBySlug } from '@/src/lib/markdown';
import { notFound } from 'next/navigation';
import styles from '../post.module.scss';
import Button from '@/src/components-next/Button';

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

        {(() => {
          const tags = frontmatter.tags ?? [];
          const isPipelinePost = tags.some((t) =>
            ['ci/cd', 'deployment', 'release', 'production'].includes(t),
          );
          const isDeliveryPost =
            !isPipelinePost &&
            tags.some((t) =>
              ['software delivery', 'agile', 'devops', 'lean', 'software'].includes(t),
            );
          if (isPipelinePost) {
            return (
              <>
                <hr className={styles.ctaDivider} />
                <aside className={styles.cta}>
                  <p className={styles.ctaHeadline}>
                    Shipping AI-generated code and want guardrails like this?
                  </p>
                  <p className={styles.ctaBody}>
                    I&apos;ve built CI/CD pipelines for teams at MLC, AMP, Greater Bank, and Pacific National.
                    I help founders and engineering teams set up quality gates, preview environments,
                    and the controls to ship AI-generated code without fear. One week, fixed price.
                  </p>
                  <Button href="https://cal.com/tomhoward" external>
                    Book a call →
                  </Button>
                </aside>
              </>
            );
          }
          if (isDeliveryPost) {
            return (
              <>
                <hr className={styles.ctaDivider} />
                <aside className={styles.cta}>
                  <p className={styles.ctaHeadline}>
                    Want to improve how your team delivers software?
                  </p>
                  <p className={styles.ctaBody}>
                    I help founders and engineering leads ship faster, reduce risk, and build
                    the habits that make teams genuinely effective. Let&apos;s talk.
                  </p>
                  <Button href="https://cal.com/tomhoward" external>
                    Book a call →
                  </Button>
                </aside>
              </>
            );
          }
          return null;
        })()}
      </div>
    </div>
  );
}
