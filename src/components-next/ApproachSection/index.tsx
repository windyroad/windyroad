import Section from '@/src/components-next/Section';
import styles from './ApproachSection.module.scss';

const pillars = [
  {
    title: 'AI Expertise',
    description:
      'From autonomous agents at CSIRO to building Voder today — I understand what AI can reliably do, where it breaks down, and how to put guardrails around it so your team ships safely.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5v1h-4v-1A4 4 0 0 1 12 2z" />
        <path d="M10 10.5v2h4v-2" />
        <path d="M10 14.5h4" />
        <path d="M9 18h6" />
        <path d="M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 7l1.4-1.4" />
      </svg>
    ),
  },
  {
    title: 'Delivery & Risk',
    description:
      '25+ years scaling teams and delivery systems in banking, rail, and regulated environments. I know how to make things ship on time without cutting the corners that come back to bite you.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Hands-On Building',
    description:
      'I don\'t just advise — I build. CI/CD pipelines, test automation frameworks, API platforms, full products. When I recommend a quality gate, I can implement it the same afternoon.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
        <line x1="14" y1="4" x2="10" y2="20" />
      </svg>
    ),
  },
];

export default function ApproachSection() {
  return (
    <Section number="02" label="THE APPROACH" variant="light" id="approach">
      <div className={styles.pillars}>
        {pillars.map((pillar) => (
          <div key={pillar.title} className={styles.pillar}>
            <div className={styles.icon}>{pillar.icon}</div>
            <h3 className={styles.pillarTitle}>{pillar.title}</h3>
            <p className={styles.pillarDesc}>{pillar.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
