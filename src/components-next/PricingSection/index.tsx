import Section from '@/src/components-next/Section';
import styles from './PricingSection.module.scss';

const engagements = [
  {
    name: 'AI Delivery Review',
    duration: '1 week',
    description:
      'I look at how your team works with AI tools today and where the gaps are. You get a prioritised action plan \u2014 what to fix first, what guardrails to add, and what\u2019s already working.',
    outcome: 'Clear picture + prioritised action plan',
  },
  {
    name: 'Embedded Delivery Lead',
    duration: 'Ongoing, ~8\u201310 hrs/week',
    description:
      'I embed with your team part-time as a fractional delivery lead. Hands-on work: implementing quality gates, pairing on AI-generated PRs, building CI/CD guardrails, and coaching your developers on what to watch for.',
    outcome: 'Working guardrails + team capability uplift',
  },
  {
    name: 'Delivery Sprint',
    duration: '2\u20134 weeks',
    description:
      'A focused, project-based engagement with a defined outcome \u2014 a CI/CD pipeline with AI-specific quality gates, a test automation framework, or a working product increment with proper guardrails in place.',
    outcome: 'Specific deliverable, shipped',
  },
];

export default function PricingSection() {
  return (
    <Section number="03" label="ENGAGEMENTS" variant="dark" id="engagements">
      <div className={styles.tiers}>
        {engagements.map((eng) => (
          <div key={eng.name} className={styles.tier}>
            <div className={styles.tierName}>{eng.name}</div>
            <div className={styles.tierDuration}>{eng.duration}</div>
            <p className={styles.tierDesc}>{eng.description}</p>
            <div className={styles.tierOutcome}>
              <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {eng.outcome}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
