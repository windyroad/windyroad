import type { Metadata } from 'next';
import Link from 'next/link';
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

const engagements = [
  {
    name: 'Quick Wins Week',
    price: '$5,000',
    duration: '1 week',
    description:
      'I spend a week with your team: diagnose how AI tools are being used, identify the biggest gaps, and implement the first round of fixes. Pipeline guardrails, review process changes, or test coverage improvements. You get quick wins shipped plus a roadmap for what\u2019s next.',
    outcome: 'Immediate improvements + prioritised roadmap',
  },
  {
    name: 'Embedded Delivery Lead',
    price: '$10,000/month',
    duration: 'Ongoing, ~8\u201310 hrs/week',
    description:
      'I embed with your team part-time as a fractional delivery lead. Hands-on work: implementing quality gates, pairing on AI-generated PRs, building CI/CD guardrails, and coaching your developers on what to watch for.',
    outcome: 'Working guardrails + team capability uplift',
  },
  {
    name: 'Delivery Sprint',
    price: '$15,000\u2013$25,000',
    duration: '2\u20134 weeks',
    description:
      'A focused, project-based engagement with a defined outcome: a CI/CD pipeline with AI-specific quality gates, a test automation framework, or a working product increment with proper guardrails in place.',
    outcome: 'Specific deliverable, shipped',
  },
];

const goodFit = [
  'Your team is using Copilot, Cursor, or Claude and you\u2019re not sure what\u2019s getting through review',
  'You\u2019ve shipped faster since adopting AI tools but defect rates or security issues are creeping up',
  'You need someone who can implement the guardrails, not just recommend them in a PDF',
];

const notFit = [
  'You want a review process documented in a Word doc, not implemented in your pipeline',
  'Your team isn\u2019t actually using AI tools yet',
  'You need someone to manage your team full-time',
];

const faqs = [
  {
    q: 'Can\u2019t we just add a linter?',
    a: 'Linters catch syntax. They don\u2019t catch hallucinated dependencies, incorrect business logic, or tests that pass but test nothing. The failure modes AI tools introduce are semantic, not syntactic.',
  },
  {
    q: 'We already do code review.',
    a: 'Most teams reviewing AI-generated code are pattern-matching against what looks right. AI output looks right by design. The gaps show up under load, during a security audit, or when someone leaves and nobody understands the code they approved.',
  },
  {
    q: 'How is this different from hiring a senior dev?',
    a: 'A senior hire takes 3\u20136 months to ramp up, costs $200k+ per year, and may not have specific experience with AI-generated code failure modes. I start delivering in week one and leave your team better equipped to catch the problems themselves.',
  },
  {
    q: 'What stack do you work with?',
    a: 'JavaScript/TypeScript, Python, and most modern web frameworks. If you\u2019re not sure, book a call and we\u2019ll figure it out.',
  },
];

const CheckIcon = ({ className }: { className?: string }) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function AITeamsPage() {
  return (
    <main>
      {/* Hero */}
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

      {/* Problems */}
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

      {/* Credentials */}
      <section className={`${styles.section} ${styles.dark}`}>
        <div className={styles.inner}>
          <div className={styles.bioIntro}>
            <img
              src="/img/tomhoward.jpg"
              alt="Tom Howard"
              className={styles.headshot}
              width={120}
              height={120}
              loading="lazy"
            />
            <h2 className={styles.bioTitle}>
              I&apos;ve shipped three profitable software products from
              scratch. Not consulting on someone else&apos;s idea: actually
              building, finding customers, and closing sales.
            </h2>
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statValue}>400%</div>
              <div className={styles.statLabel}>throughput increase per developer at Greater Bank</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>0 &rarr; 97%</div>
              <div className={styles.statLabel}>compliance in 10 months at Westpac</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>25+</div>
              <div className={styles.statLabel}>years of delivery leadership</div>
            </div>
          </div>
          <div className={styles.narrative}>
            <p>
              I&apos;ve been working with AI since 1999: building autonomous
              agents at CSIRO, competing at the RoboCup World Cup, holding a patent,
              co-authoring research papers. Which means I understand how these tools
              actually reason, not just how to prompt them.
            </p>
            <p>
              At Greater Bank I introduced Software Delivery Fireteams that cut
              cycle time from 24 to 8 days and increased developer throughput by
              400%, while growing the team by 50%. At Westpac I led
              FATCA/CRS compliance remediation across 5,300+ bankers, taking
              compliance from 0% to 97% in 10 months.
            </p>
          </div>
          <Link href="/" className={styles.credLink}>Full background at windyroad.com.au &rarr;</Link>
        </div>
      </section>

      {/* Process */}
      <section className={`${styles.section} ${styles.light}`}>
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

      {/* Pricing */}
      <section className={`${styles.section} ${styles.dark}`}>
        <div className={styles.inner}>
          <h2 className={styles.sectionTitle}>Engagements</h2>
          <p className={styles.pricingIntro}>
            Engagements start at $5,000. No retainers, no long-term commitments.
          </p>
          <ul className={styles.tiers} role="list">
            {engagements.map((eng) => (
              <li key={eng.name} className={styles.tier}>
                <h3 className={styles.tierName}>{eng.name}</h3>
                <p className={styles.tierPrice}>{eng.price}</p>
                <div className={styles.tierDuration}>{eng.duration}</div>
                <p className={styles.tierDesc}>{eng.description}</p>
                <div className={styles.tierOutcome}>
                  <CheckIcon className={styles.checkIcon} />
                  {eng.outcome}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Fit check */}
      <section className={`${styles.section} ${styles.dark} ${styles.fitSection}`}>
        <div className={styles.inner}>
          <div className={styles.fitColumns}>
            <div className={`${styles.fitColumn} ${styles.fitGood}`}>
              <h3 className={styles.fitTitle}>
                <CheckIcon className={styles.fitIcon} /> This Road
              </h3>
              <ul className={styles.fitList} role="list">
                {goodFit.map((item) => (
                  <li key={item} className={styles.fitItem}>
                    <CheckIcon className={styles.fitIcon} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={`${styles.fitColumn} ${styles.fitBad}`}>
              <h3 className={styles.fitTitle}>
                <XIcon className={styles.fitIcon} /> Wrong Road
              </h3>
              <ul className={styles.fitList} role="list">
                {notFit.map((item) => (
                  <li key={item} className={styles.fitItem}>
                    <XIcon className={styles.fitIcon} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={`${styles.section} ${styles.light}`}>
        <div className={styles.inner}>
          <h2 className={styles.sectionTitle}>Questions</h2>
          <div className={styles.faqList}>
            {faqs.map((faq) => (
              <details key={faq.q} className={styles.faqItem} open>
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
          <h2 className={styles.ctaTitle}>
            The defect rate is already climbing. Let&apos;s get ahead of it
            before it becomes a production incident.
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
