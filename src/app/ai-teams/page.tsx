import type { Metadata } from 'next';
import Button from '@/src/components-next/Button';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'AI Teams | Your Team Uses AI Tools | Windy Road Technology',
  description:
    'Your team adopted Copilot, Cursor, or Claude. Hallucinated dependencies, security holes, and silent defect increases are slipping through review. I fix that.',
};

const problems = [
  'Hallucinated dependencies that slip past review and into production',
  'AI code that \u201Clooks right\u201D but ships with security holes',
  'Tests that pass but test nothing, the real failure mode goes undetected',
  '3\u00D7 faster shipping, quietly doubled defect rate',
  'Junior devs who don\u2019t know enough to push back on AI suggestions',
];

const process = [
  {
    label: 'Diagnose',
    description:
      'You get a clear picture of where your risk is and what to fix first, before it costs you a production incident. I look at how your team actually uses AI tools: which ones, how generated code gets reviewed, what your pipeline catches and what slips through.',
  },
  {
    label: 'Implement',
    description:
      'You get working guardrails, not a slide deck. Quality gates in your pipeline, review checklists for AI-generated code, test coverage rules that actually catch the failure modes these tools introduce.',
  },
  {
    label: 'Embed',
    description:
      'Your team learns to catch the problems themselves. I pair on real PRs, coach developers on what to watch for in AI output, and tune the process based on what\u2019s actually happening in your codebase.',
  },
];

export default function AITeamsPage() {
  return (
    <main>
      <section className={`${styles.section} ${styles.dark} ${styles.hero}`}>
        <div className={styles.inner}>
          <h1 className={styles.headline}>
            Your team adopted AI tools.<br />
            Here&apos;s what&apos;s slipping through.
          </h1>
          <p className={styles.sub}>
            Copilot, Cursor, and Claude are writing your production code. I
            partner with engineering leaders to make sure the speed doesn&apos;t
            come at the cost of quality.
          </p>
          <Button
            href="https://cal.com/tomhoward/meeting?user=tomhoward&duration=30&overlayCalendar=true&layout=week_view"
            variant="primary"
            size="large"
            external
          >
            Book a Call
          </Button>
        </div>
      </section>

      <section className={`${styles.section} ${styles.light}`}>
        <div className={styles.inner}>
          <h2 className={styles.sectionTitle}>What goes wrong</h2>
          <ul className={styles.problemList} role="list">
            {problems.map((problem) => (
              <li key={problem} className={styles.problemItem}>
                <span className={styles.arrow} aria-hidden="true">&rarr;</span>
                <span>{problem}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`${styles.section} ${styles.dark}`}>
        <div className={styles.inner}>
          <h2 className={styles.sectionTitle}>What working with me looks like</h2>
          <ol className={styles.processList} role="list">
            {process.map((step, i) => (
              <li key={step.label} className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className={styles.stepLabel}>{step.label}</h3>
                  <p className={styles.stepDesc}>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`${styles.section} ${styles.light}`}>
        <div className={styles.inner}>
          <h2 className={styles.ctaTitle}>
            Your team is shipping faster. Let&apos;s make sure it&apos;s shipping safely.
          </h2>
          <Button
            href="https://cal.com/tomhoward/meeting?user=tomhoward&duration=30&overlayCalendar=true&layout=week_view"
            variant="primary"
            size="large"
            external
          >
            Book a Call
          </Button>
        </div>
      </section>
    </main>
  );
}
