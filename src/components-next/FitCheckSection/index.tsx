import Section from '@/src/components-next/Section';
import styles from './FitCheckSection.module.scss';

const goodFit = [
  'You vibe-coded a working prototype and need someone to make it production-ready',
  'Your team is using Copilot, Cursor, or Claude and you\u2019re not sure what\u2019s getting through review',
  'You\u2019ve shipped faster since adopting AI tools but defect rates or security issues are creeping up',
  'You need someone who can implement the guardrails, not just recommend them in a PDF',
];

const notFit = [
  'You haven\u2019t started using AI tools yet and want a general AI strategy',
  'You need a full-time permanent engineering leader',
  'You\u2019re looking for someone to build a custom ML model or AI product',
  'You want advice without implementation \u2014 I work hands-on',
];

const CheckIcon = () => (
  <svg aria-hidden="true" className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg aria-hidden="true" className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function FitCheckSection() {
  return (
    <Section number="05" label="FIT CHECK" variant="dark" id="fit">
      <div className={styles.columns}>
        <div className={`${styles.column} ${styles.good}`}>
          <h3 className={styles.columnTitle}>
            <CheckIcon /> Good Fit
          </h3>
          <div className={styles.list}>
            {goodFit.map((item) => (
              <div key={item} className={styles.item}>
                <CheckIcon />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`${styles.column} ${styles.notFit}`}>
          <h3 className={styles.columnTitle}>
            <XIcon /> Not a Fit
          </h3>
          <div className={styles.list}>
            {notFit.map((item) => (
              <div key={item} className={styles.item}>
                <XIcon />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
