import Section from '@/src/components-next/Section';
import styles from './PricingSection.module.scss';

const tiers = [
  {
    name: 'AI Delivery Audit',
    price: '$5,000',
    unit: 'one-off',
    description:
      'One-week deep-dive into your current AI-assisted development workflow. You get a written risk assessment plus recommendations for quality gates and security controls.',
  },
  {
    name: 'Fractional AI Delivery Lead',
    price: '$10,000',
    unit: 'per month',
    description:
      '~8\u201310 hours/week embedded with your team. Hands-on delivery leadership, CI/CD and quality gate implementation, AI workflow risk management, and team mentoring.',
  },
  {
    name: 'Delivery Sprint',
    price: '$15,000\u2013$25,000',
    unit: '2\u20134 week engagement',
    description:
      'Project-based engagement with a specific outcome \u2014 a CI/CD pipeline with AI guardrails, a test automation framework, or a working product increment.',
  },
];

export default function PricingSection() {
  return (
    <Section number="03" label="ENGAGEMENTS" variant="dark" id="engagements">
      <div className={styles.tiers}>
        {tiers.map((tier) => (
          <div key={tier.name} className={styles.tier}>
            <div className={styles.tierName}>{tier.name}</div>
            <div className={styles.tierPrice}>{tier.price}</div>
            <div className={styles.tierUnit}>{tier.unit}</div>
            <p className={styles.tierDesc}>{tier.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
