import Section from '@/src/components-next/Section';
import styles from './PricingSection.module.scss';

const engagements = [
  {
    name: 'Quick Wins Week',
    price: '$5,000',
    duration: '1 week',
    description:
      'I spend a week with your team: diagnose how AI tools are being used, identify the biggest gaps, and implement the first round of fixes \u2014 pipeline guardrails, review process changes, or test coverage improvements. You get quick wins shipped plus a roadmap for what\u2019s next.',
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
      'A focused, project-based engagement with a defined outcome \u2014 a greenfield product built from scratch, a CI/CD pipeline with AI-specific quality gates, a test automation framework, or a working product increment with proper guardrails in place.',
    outcome: 'Specific deliverable, shipped',
  },
];

export default function PricingSection() {
  return (
    <Section number="03" label="ENGAGEMENTS" variant="dark" id="engagements">
      <p className={styles.intro}>
        Engagements start at $5,000. No retainers, no long-term commitments.
      </p>
      <ul className={styles.tiers}>
        {engagements.map((eng) => (
          <li key={eng.name} className={styles.tier}>
            <h3 className={styles.tierName}>{eng.name}</h3>
            <p className={styles.tierPrice}>{eng.price}</p>
            <div className={styles.tierDuration}>{eng.duration}</div>
            <p className={styles.tierDesc}>{eng.description}</p>
            <div className={styles.tierOutcome}>
              <svg aria-hidden="true" className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {eng.outcome}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
