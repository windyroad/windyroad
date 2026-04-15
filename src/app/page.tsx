import type { Metadata } from 'next';
import Button from '@/src/components-next/Button';
import Countdown from '@/src/components-next/Countdown';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title:
    'You\u2019re Taking Too Long to Patch Your Software | Windy Road Technology',
  description:
    'AI-powered vulnerability discovery is measured in hours. Your patch cycle isn\u2019t. We help engineering teams get patch fit.',
  keywords:
    'patch fitness, dependency management, vulnerability patching, continuous patching, CI/CD, software supply chain',
  alternates: {
    canonical: 'https://windyroad.com.au',
  },
  openGraph: {
    title: 'You\u2019re Taking Too Long to Patch Your Software',
    description:
      'AI-powered vulnerability discovery is measured in hours. Your patch cycle isn\u2019t. We help engineering teams get patch fit.',
    url: 'https://windyroad.com.au',
    siteName: 'Windy Road Technology',
    type: 'website',
    images: [
      {
        url: 'https://windyroad.com.au/img/og-image.png',
        width: 1200,
        height: 630,
        alt: 'You\u2019re taking too long to patch your software.',
      },
    ],
  },
};

const problems = [
  'You patch when something breaks, not before. The window between discovery and exploitation is collapsing.',
  'Dependency trees full of libraries nobody on your team chose and nobody is tracking',
  'We once found a 12-year-old version of Apache HTTP Components in production at a major financial services company. Nobody knew it was there.',
  'Dependabot PRs piling up, ignored, breaking builds',
  'Quarterly patching cycles leaving months of exposure',
];

const process = [
  {
    label: 'Diagnose',
    description:
      'You get a clear picture of your dependency staleness: forgotten libraries, outdated transitive dependencies, and how long your current patch cycle takes end-to-end.',
  },
  {
    label: 'Implement',
    description:
      'You get automated dependency updates with CI gates that prevent regressions. Merge confidence scoring. Pipeline changes that make updating safe and routine.',
  },
  {
    label: 'Embed',
    description:
      'Your team owns continuous patching. Updates flow through the pipeline without heroics. A critical CVE patch deploys like any other change.',
  },
];

const engagements = [
  {
    name: 'Patch Fitness Assessment',
    price: '$9,000',
    duration: '1 week',
    description:
      'We map dependency staleness across your codebase, measure your patch cycle time, and identify the riskiest gaps. You get first fixes shipped plus a prioritised remediation roadmap.',
    outcome: 'Dependency map + first fixes shipped',
  },
  {
    name: 'Embedded Delivery Lead',
    price: '$20,000/month',
    duration: 'Ongoing, ~8\u201310 hrs/week',
    description:
      'We embed with your team part-time. Hands-on: automated dependency updates, CI gates, merge confidence scoring, and coaching your developers to own the process.',
    outcome: 'Continuous patching + team capability uplift',
  },
  {
    name: 'Delivery Sprint',
    price: '$40,000',
    duration: '4 weeks',
    description:
      'A focused engagement with a defined outcome: automated dependency pipeline with CI gates, patch cycle time reduced from weeks to hours, or supply chain visibility across your stack.',
    outcome: 'Specific deliverable, shipped',
  },
];

const testimonials = [
  {
    theme: 'On engineering discipline',
    name: 'Raymond Lay',
    role: 'Product & AI Experience Design, Pacific National',
    quote:
      'He didn\u2019t simply manage BAU. He elevated it. By introducing structured root cause analysis, strengthening incident hygiene, and embedding Agile and Lean practices, he shifted the team from reactive fire-fighting to disciplined, data-driven service reliability. Reducing open incidents by half within a mission-critical freight system is a significant achievement.',
  },
  {
    theme: 'On delivery at scale',
    name: 'David Tanconi',
    role: 'Change Leadership, Westpac',
    quote:
      'Taking compliance from 0% to 97%, rolling the solution out to more than 5,000 bankers and doing it with minimal disruption to day-to-day operations was a substantial achievement. What stood out to me wasn\u2019t just the numbers, but the way Tom achieved them. He led with calm focus, thought strategically about the bigger picture and stayed committed to getting the detail right.',
  },
];

const goodFit = [
  'Your last dependency update was a multi-week project',
  'You have Dependabot PRs piling up that nobody reviews',
  'You patched Log4Shell as an emergency and nothing has changed since',
];

const notFit = [
  'You already deploy continuously with automated dependency updates',
  'Your pipeline catches regressions from dependency changes automatically',
  'You need someone to manage your team full-time',
];

const faqs = [
  {
    q: 'We already use Dependabot.',
    a: 'Dependabot is good at surfacing what\u2019s outdated. It opens the PRs. What it doesn\u2019t do is merge them, validate them, or handle the transitive conflicts that make teams ignore them. Patch fitness means updates flow through your pipeline with confidence, not pile up in a backlog.',
  },
  {
    q: 'Our security team handles patching.',
    a: 'Your security team is good at triaging alerts and prioritising risk. What they don\u2019t typically own is your build pipeline, your test suite, or the developer workflow that determines whether a patch ships in hours or weeks. Patch fitness is an engineering capability, not a security process.',
  },
  {
    q: 'We patch quarterly and that\u2019s fine.',
    a: 'A quarterly cycle means up to 90 days of exposure. When AI-powered vulnerability discovery makes exploits available in hours, 90 days is not a risk you can carry.',
  },
  {
    q: 'What stack do you work with?',
    a: 'JavaScript/TypeScript, Python, Java, .NET, Go, and most modern stacks. If you\u2019re not sure, book a call and we\u2019ll figure it out.',
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
            You&apos;re taking too long to patch your software.
          </h1>
          <p className={styles.sub}>
            AI-powered vulnerability discovery is measured in hours. Your patch
            cycle isn&apos;t. Anthropic&apos;s Claude Mythos found a 27-year-old
            vulnerability in OpenBSD overnight. Only 40 companies have access
            today. That won&apos;t last.
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
            <Button href="/ai-quality" variant="ghost" size="large">
              AI code quality <span aria-hidden="true">&rarr;</span>
            </Button>
          </div>
          <Countdown
            manifoldSlug="when-will-a-claude-mythos-previewle"
          />
        </div>
        <a href="#problems" className={styles.scrollCue} aria-label="Scroll to see more">
          <span aria-hidden="true">&darr;</span>
        </a>
      </section>

      {/* Problems */}
      <section id="problems" className={`${styles.section} ${styles.light}`}>
        <div className={styles.inner}>
          <h2 className={styles.sectionTitle}>What&apos;s coming</h2>
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
              I&apos;ve built delivery pipelines and operational controls at Greater
              Bank, Essential Energy, MLC, AMP, and Pacific National.
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
              Tom Howard founded Windy Road Technology. I&apos;ve been working
              with AI since 1999: building autonomous agents at CSIRO, competing
              at the RoboCup World Cup, holding a patent, co-authoring research
              papers. Which means I understand how these tools reason and where
              they break.
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
          <h2 className={styles.sectionTitle}>How we get you patch fit</h2>
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
            Engagements start at $9,000. No retainers, no long-term commitments.
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
          <h2 className={styles.srOnly}>Is this a good fit?</h2>
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
          <h2 className={styles.ctaTitle}>
            Your patch cycle is measured in weeks. AI-powered vulnerability
            discovery is measured in hours. We help engineering teams close
            that gap.
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

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.a,
              },
            })),
          }),
        }}
      />
    </>
  );
}
