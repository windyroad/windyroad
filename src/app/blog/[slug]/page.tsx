import Link from 'next/link';
import { format, parse } from 'date-fns';
import { getAllSlugs, getPostBySlug } from '@/src/lib/markdown';
import { notFound } from 'next/navigation';
import NewsletterButton from '@/src/components-next/NewsletterButton';
import styles from '../post.module.scss';
import ArticleContent from './ArticleContent';
import 'highlight.js/styles/github-dark.css';


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

  const image = post.frontmatter.image?.startsWith('/')
    ? `https://windyroad.com.au${post.frontmatter.image}`
    : undefined;

  return {
    title: `${post.frontmatter.title} | Tom Howard`,
    description: post.excerpt,
    openGraph: {
      title: post.frontmatter.title,
      description: post.excerpt,
      url: `https://windyroad.com.au/blog/${slug}`,
      siteName: 'Windy Road Technology',
      type: 'article',
      images: image
        ? [{
            url: image,
            width: 1200,
            height: 630,
            alt: post.frontmatter.imageAlt ?? post.frontmatter.title,
          }]
        : undefined,
    },
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
            <ArticleContent html={html} />
            {moreLink}
          </section>
          <hr className={styles.ctaDivider} />
          <section className={styles.cta}>
            <h2 className={styles.ctaHeadline}>
              Keep following The Shift
            </h2>
            <p className={styles.ctaBody}>
              A practical newsletter about AI engineering, software delivery,
              and the systems around them.
            </p>
            <div className={styles.ctaActions}>
              <NewsletterButton placement="article-end">
                Subscribe to The Shift on LinkedIn
              </NewsletterButton>
              <Link href="/blog" className={styles.ctaRelated}>
                Browse all articles <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
