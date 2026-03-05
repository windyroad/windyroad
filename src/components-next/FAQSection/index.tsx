'use client';

import { useEffect, useState } from 'react';
import Section from '@/src/components-next/Section';
import styles from './FAQSection.module.scss';

const faqs = [
  {
    q: 'What if we\u2019re already shipping fine?',
    a: 'Then I\u2019ll tell you that. Most teams using AI tools have 5\u201310 hidden issues that only surface under load, during a security audit, or when someone leaves.',
  },
  {
    q: 'What stack do you work with?',
    a: 'JavaScript/TypeScript, Python, and most modern web frameworks.',
  },
  {
    q: 'How is this different from an agency?',
    a: 'I\u2019m one senior person who actually reads your code. Not an account manager who hands you off to juniors. Engagements start at $5k, not $50k.',
  },
];

export default function FAQSection() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 769px)');
    setIsDesktop(mq.matches);
    function onChange(e: MediaQueryListEvent) {
      setIsDesktop(e.matches);
    }
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <Section variant="light" id="faq">
      <h2 className={styles.title}>Questions</h2>
      <div className={styles.faqList}>
        {faqs.map((faq) => (
          <details key={faq.q} className={styles.faqItem} open={isDesktop || undefined}>
            <summary className={styles.faqQuestion}>{faq.q}</summary>
            <p className={styles.faqAnswer}>{faq.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
