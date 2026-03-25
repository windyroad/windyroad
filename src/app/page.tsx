import type { Metadata } from 'next';
import Link from 'next/link';
import Button from '@/src/components-next/Button';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title:
    'Your Team Uses AI Tools. Here\u2019s What\u2019s Slipping Through. | Windy Road Technology',
  description:
    'Your team adopted Copilot, Cursor, or Claude. Hallucinated dependencies, security holes, and silent defect increases are slipping through review. I fix that.',
};

const problems = [
  '3\u00D7 faster shipping, quietly doubled defect rate',
  'AI code that \u201Clooks right\u201D but ships with security holes',
  'Tests that pass but test nothing, the real failure mode goes undetected',
  'AI suggestions accepted without scrutiny, compounding risk across the team',
  'Dependencies nobody on your team chose, adding supply chain risk nobody is tracking',
];

const process = [
  {
    label: 'Diagnose',
    description:
      'You get a clear picture of where your risk is and what to fix first, before it costs you a production incident. I look at how your team uses AI tools: where the risk concentrates, what your pipeline catches, and what controls are missing.',
  },
  {
    label: 'Implement',
    description:
      'You get working guardrails: quality gates in your pipeline, review checklists for AI-generated code, test coverage rules that catch the failure modes these tools introduce.',
  },
  {
    label: 'Embed',
    description:
      'Your team learns to catch the problems themselves. I pair on real PRs, coach developers on what to watch for in AI output, and tune the process based on what\u2019s happening in your codebase.',
  },
];

const engagements = [
  {
    name: 'Pipeline Assessment',
    price: '$10,000',
    duration: '2 weeks',
    description:
      'I audit your AI tool usage, map where risk concentrates in your pipeline, and implement the first controls. Risk scoring, quality gates, or test coverage for AI-specific failure modes. You get working improvements shipped plus a prioritised roadmap.',
    outcome: 'Working controls + prioritised roadmap',
  },
  {
    name: 'Embedded Delivery Lead',
    price: '$20,000/month',
    duration: 'Ongoing, ~8\u201310 hrs/week',
    description:
      'I embed with your team part-time as a fractional delivery lead. Hands-on work: implementing quality gates, pairing on AI-generated PRs, building CI/CD guardrails, and coaching your developers on what to watch for.',
    outcome: 'Working guardrails + team capability uplift',
  },
  {
    name: 'Delivery Sprint',
    price: '$40,000',
    duration: '4 weeks',
    description:
      'A focused, project-based engagement with a defined outcome: a CI/CD pipeline with AI-specific quality gates, a risk scoring system with automated back-pressure, or a test automation framework that catches semantic failures.',
    outcome: 'Specific deliverable, shipped',
  },
];

const testimonials = [
  {
    theme: 'On fixing what\u2019s broken',
    name: 'Mark Chan',
    role: 'Senior Project Manager, Westpac',
    quote:
      'Resourced into a troubled project at WBC, he was able to reassure management regarding directions to stabilise and bring the project back on course. Tom projects well with all levels of staff and is highly regarded for his training efforts. I highly recommend Tom from a technical and management perspective.',
  },
  {
    theme: 'On bridging tech and business',
    name: 'Kasi Subramanian',
    role: 'Manager, Rail Services at Pacific National',
    quote:
      'What set him apart was his technical strength \u2014 he could engage credibly with both the business and the team, managing expectations effectively while keeping everyone honest on what was truly achievable.',
  },
];

const goodFit = [
  'Your team is using Copilot, Cursor, or Claude and you\u2019re not sure what\u2019s getting through review',
  'You\u2019ve shipped faster since adopting AI tools but defect rates or security issues are creeping up',
  'You want guardrails implemented in your pipeline, not written up in a PDF',
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

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className={`${styles.section} ${styles.dark} ${styles.hero}`}>
        <div className={styles.inner}>
          <h1 className={styles.headline}>
            Your team adopted AI tools.<br />
            Here&apos;s what&apos;s slipping through.
          </h1>
          <p className={styles.sub}>
            Copilot, Cursor, and Claude are writing your production code.
            {' '}I&nbsp;partner with engineering leaders to make sure the speed
            doesn&apos;t come at the cost of quality.
          </p>
          <div className={styles.cta}>
            <Button
              href="https://cal.com/tomhoward/meeting?user=tomhoward&duration=30&overlayCalendar=true&layout=week_view"
              variant="primary"
              size="large"
              external
            >
              Book a Call
            </Button>
            <Button href="/founders" variant="ghost" size="large">
              Building something yourself? <span aria-hidden="true">&rarr;</span>
            </Button>
          </div>
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
              I&apos;ve built pipeline controls, risk scoring systems, and
              quality gates at Greater Bank, Westpac, and Pacific National.
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
              reason and where they break.
            </p>
            <p>
              At Greater Bank I introduced Software Delivery Fireteams that cut
              cycle time from 24 to 8 days and increased developer throughput by
              400%, while growing the team by 50%. At Westpac I led
              FATCA/CRS compliance remediation across 5,300+ bankers, taking
              compliance from 0% to 97% in 10 months.
            </p>
          </div>
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
            Engagements start at $10,000. No retainers, no long-term commitments.
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
                <Button
                  href="https://cal.com/tomhoward/meeting?user=tomhoward&duration=30&overlayCalendar=true&layout=week_view"
                  variant="primary"
                  size="large"
                  external
                >
                  Book a Call
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Testimonials */}
      <section className={`${styles.section} ${styles.light}`}>
        <div className={styles.inner}>
          <h2 className={styles.sectionTitle}>What others say</h2>
          <div className={styles.testimonials}>
            {testimonials.map((t) => (
              <div key={t.name} className={styles.testimonialCard}>
                <div className={styles.testimonialTheme}>{t.theme}</div>
                <blockquote className={styles.testimonialQuote}>
                  <p>{t.quote}</p>
                  <footer className={styles.testimonialAttribution}>
                    <cite className={styles.testimonialName}>{t.name}</cite>
                    <span className={styles.testimonialRole}>{t.role}</span>
                  </footer>
                </blockquote>
              </div>
            ))}
          </div>
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
    </>
  );
}
