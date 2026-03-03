import type { Metadata } from 'next';
import Link from 'next/link';
import Button from '@/src/components-next/Button';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'Vibe Code Audit — Fix Your AI-Generated App | Windy Road Technology',
  description:
    'Your vibe-coded app is breaking in production. $5,000. One week. A senior engineer audits your AI-generated code, tells you exactly what\'s broken, and how to fix it.',
};

const problems = [
  'Your Stripe webhooks fail randomly and you don\'t know why',
  'Users see loading screens that never finish',
  'The code looks right but something keeps breaking',
  'You\'re scared to touch anything in case it makes things worse',
  'An agency quoted you $50k and 8 weeks',
];

const deliverables = [
  { title: 'Full codebase audit', desc: 'I read every line your AI wrote' },
  { title: 'Prioritised issue list', desc: 'What\'s critical vs. what can wait' },
  { title: 'Production risk assessment', desc: 'Where you\'ll break next as you scale' },
  { title: 'Fix recommendations', desc: 'Exactly what to change, in priority order' },
  { title: 'Optional: I fix the critical issues', desc: 'Add implementation if you want it' },
];

const faqs = [
  {
    q: 'Can\'t I just ask Claude to audit the code?',
    a: 'You can. But Claude wrote the bugs in the first place. You need a human who knows what production-grade code actually looks like.',
  },
  {
    q: 'What if my code is fine?',
    a: 'Then I\'ll tell you that and you\'ll have peace of mind. Most vibe-coded apps have 5–10 critical issues hiding under the surface.',
  },
  {
    q: 'What stack do you work with?',
    a: 'JavaScript/TypeScript, Python, and most modern web frameworks. If you\'re not sure, book a call and we\'ll figure it out.',
  },
  {
    q: 'How is this different from an agency?',
    a: 'I\'m one senior person who actually reads your code. Not an account manager who hands you off to juniors. $5k not $50k. One week not two months.',
  },
];

export default function VibeCodingAuditPage() {
  return (
    <main>

      {/* Hero */}
      <section className={`${styles.section} ${styles.dark} ${styles.hero}`}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Vibe Code Audit</p>
          <h1 className={styles.heroHeadline}>
            Your vibe-coded app is breaking.<br />
            <span className={styles.accent}>I fix that.</span>
          </h1>
          <p className={styles.heroSub}>
            $5,000. One week. A senior engineer tells you exactly what&apos;s broken — and how to fix it.
          </p>
          <Button href="https://cal.com/tomhoward" variant="primary" size="large" external>
            Book a Call
          </Button>
        </div>
      </section>

      {/* Problem */}
      <section className={`${styles.section} ${styles.light}`}>
        <div className={styles.inner}>
          <h2 className={styles.sectionTitle}>Sound familiar?</h2>
          <ul className={styles.problemList} role="list">
            {problems.map((p) => (
              <li key={p} className={styles.problemItem}>
                <span className={styles.arrow} aria-hidden="true">→</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Solution */}
      <section className={`${styles.section} ${styles.dark}`}>
        <div className={styles.inner}>
          <h2 className={styles.sectionTitle}>What you get in one week</h2>
          <ul className={styles.deliverableList} role="list">
            {deliverables.map((d, i) => (
              <li key={d.title} className={styles.deliverableItem}>
                <span className={styles.deliverableNum} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <strong className={styles.deliverableTitle}>{d.title}</strong>
                  <span className={styles.deliverableDesc}> — {d.desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pricing */}
      <section className={`${styles.section} ${styles.light}`}>
        <div className={styles.inner}>
          <h2 className={styles.sectionTitle}>Pricing</h2>
          <div className={styles.pricingCard}>
            <div className={styles.pricingHeader}>
              <span className={styles.pricingName}>Vibe Code Audit</span>
              <span className={styles.pricingPrice}>$5,000</span>
            </div>
            <ul className={styles.pricingFeatures} role="list">
              <li>1 week turnaround</li>
              <li>Full codebase review</li>
              <li>Written report with prioritised fixes</li>
              <li>1-hour walkthrough call</li>
              <li>You know exactly what&apos;s broken and what to do about it</li>
            </ul>
            <p className={styles.pricingNote}>
              If you decide to have me implement the fixes, the $5k applies toward a delivery engagement.
            </p>
          </div>
          <p className={styles.agencyNote}>
            Agencies charge $50–100k and take 6–8 weeks. I charge $5k and take one week.
          </p>
        </div>
      </section>

      {/* Credibility */}
      <section className={`${styles.section} ${styles.dark}`}>
        <div className={styles.inner}>
          <h2 className={styles.sectionTitle}>Why trust me with your codebase</h2>
          <ul className={styles.credList} role="list">
            <li>25 years shipping production software</li>
            <li>AI and automation since 1999 — CSIRO, RoboCup, patents</li>
            <li>Led delivery at Greater Bank, Westpac, Pacific National</li>
            <li>Shipped 3 profitable software products from scratch</li>
          </ul>
          <Link href="/" className={styles.credLink}>Full background at windyroad.com.au →</Link>
        </div>
      </section>

      {/* FAQ */}
      <section className={`${styles.section} ${styles.light}`}>
        <div className={styles.inner}>
          <h2 className={styles.sectionTitle}>Questions</h2>
          <div className={styles.faqList}>
            {faqs.map((faq) => (
              <details key={faq.q} className={styles.faqItem}>
                <summary className={styles.faqQuestion}>{faq.q}</summary>
                <p className={styles.faqAnswer}>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={`${styles.section} ${styles.dark}`}>
        <div className={styles.inner}>
          <h2 className={styles.ctaTitle}>Your app is breaking. Let&apos;s fix it.</h2>
          <p className={styles.ctaSub}>
            Book a 15-minute call. I&apos;ll tell you if I can help — and if I can&apos;t,
            I&apos;ll point you to someone who can.
          </p>
          <Button href="https://cal.com/tomhoward" variant="primary" size="large" external>
            Book a Call
          </Button>
        </div>
      </section>

    </main>
  );
}
