import type { Metadata } from 'next';
import Link from 'next/link';
import { format, parse } from 'date-fns';
import Button from '@/src/components-next/Button';
import { getAllPosts } from '@/src/lib/markdown';
import { HERO_HEADLINE } from '@/src/lib/siteCopy.mjs';
import styles from './page.module.scss';

const NEWSLETTER_URL =
  'https://www.linkedin.com/newsletters/the-shift-7450748696826134528/';

export const metadata: Metadata = {
  title: 'The Shift: AI engineering, every week | Windy Road Technology',
  description:
    'A weekly read on what changed at the AI frontier and what it means for the teams shipping with these tools. Written by Tom Howard.',
  keywords:
    'AI engineering, newsletter, The Shift, engineering leadership, Tom Howard, Windy Road',
  alternates: {
    canonical: 'https://windyroad.com.au',
  },
  openGraph: {
    title: 'The Shift: AI engineering, every week',
    description:
      'A weekly read on what changed at the AI frontier and what it means for the teams shipping with these tools.',
    url: 'https://windyroad.com.au',
    siteName: 'Windy Road Technology',
    type: 'website',
    images: [
      {
        url: 'https://windyroad.com.au/img/og-image.png',
        width: 1200,
        height: 630,
        alt: 'The Shift: AI engineering, every week.',
      },
    ],
  },
};

export default function Home() {
  const posts = getAllPosts()
    .filter((post) => !!post.frontmatter.date)
    .slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className={`${styles.section} ${styles.dark} ${styles.hero}`}>
        <div className={styles.inner}>
          <h1 className={styles.headline}>{HERO_HEADLINE}</h1>
          <p className={styles.sub}>
            The Shift is our weekly read on what changed at the AI frontier, and
            what it means for the tools you ship with.
          </p>
          <div className={styles.cta}>
            <Button href={NEWSLETTER_URL} size="large" external>
              Subscribe on LinkedIn
            </Button>
            <Button href="/blog" variant="ghost" size="large">
              Read the blog <span aria-hidden="true">&rarr;</span>
            </Button>
          </div>
        </div>
        <a
          href="#writing"
          className={styles.scrollCue}
          aria-label="Scroll to recent writing"
        >
          <span aria-hidden="true">&darr;</span>
        </a>
      </section>

      {/* Credentials */}
      <section className={`${styles.section} ${styles.dark}`}>
        <div className={styles.inner}>
          <div className={styles.bioIntro}>
            <img
              src="/img/tomhoward-240.jpg"
              srcSet="/img/tomhoward-120.jpg 120w, /img/tomhoward-240.jpg 240w, /img/tomhoward.jpg 672w"
              sizes="120px"
              alt="Tom Howard"
              className={styles.headshot}
              width={120}
              height={120}
              loading="lazy"
            />
            <h2 className={styles.bioTitle}>
              I&apos;ve been working with AI since 1999, and building software
              delivery at Greater Bank, Essential Energy, MLC, AMP, and Pacific
              National.
            </h2>
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statValue}>400%</div>
              <div className={styles.statLabel}>
                throughput increase per developer at Greater Bank
              </div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>
                <span aria-hidden="true">0 &rarr; 97%</span>
                <span className={styles.srOnly}>0 to 97 percent</span>
              </div>
              <div className={styles.statLabel}>
                compliance in 10 months at Westpac
              </div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>25+</div>
              <div className={styles.statLabel}>
                years of delivery leadership
              </div>
            </div>
          </div>
          <div className={styles.narrative}>
            <p>
              I founded Windy Road Technology, and I&apos;ve been working with AI
              since 1999: building autonomous agents at CSIRO, competing at the
              RoboCup World Cup, holding a patent, co-authoring research papers.
              The Shift is where we track what&apos;s changing at the frontier
              now, week by week.
            </p>
            <p>
              At Greater Bank I introduced Software Delivery Fireteams that cut
              cycle time from 24 to 8 days and increased developer throughput by
              400%, while growing the team by 50%. At Westpac I led FATCA/CRS
              compliance remediation across 5,300+ bankers, taking compliance
              from 0% to 97% in 10 months.
            </p>
          </div>
        </div>
      </section>

      {/* Recent writing */}
      <section id="writing" className={`${styles.section} ${styles.light}`}>
        <div className={styles.inner}>
          <h2 className={styles.sectionTitle}>Recent writing</h2>
          <ul className={styles.writingList} role="list">
            {posts.map((post) => (
              <li key={post.slug} className={styles.writingItem}>
                <h3 className={styles.writingTitle}>
                  <Link href={`/blog/${post.slug}`}>
                    {post.frontmatter.title}
                  </Link>
                </h3>
                <div className={styles.writingMeta}>
                  {format(
                    parse(post.frontmatter.date, 'yyyy-MM-dd', new Date()),
                    'MMMM yyyy',
                  )}
                </div>
                <p className={styles.writingExcerpt}>{post.excerpt}</p>
              </li>
            ))}
          </ul>
          <Button href="/blog" variant="outline">
            All articles <span aria-hidden="true">&rarr;</span>
          </Button>
        </div>
      </section>

      {/* Closing subscribe */}
      <section className={`${styles.section} ${styles.dark}`}>
        <div className={styles.inner}>
          <h2 className={styles.ctaTitle}>
            The Shift lands most Mondays. One email, a few minutes, no fluff.
          </h2>
          <Button href={NEWSLETTER_URL} size="large" external>
            Subscribe on LinkedIn
          </Button>
        </div>
      </section>
    </>
  );
}
