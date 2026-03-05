import Section from '@/src/components-next/Section';
import styles from './FitCheckSection.module.scss';

const goodFit = [
  'You vibe-coded a working prototype and need someone to make it production-ready',
  'Your team is using Copilot, Cursor, or Claude and you\u2019re not sure what\u2019s getting through review',
  'You\u2019ve shipped faster since adopting AI tools but defect rates or security issues are creeping up',
  'You need someone who can implement the guardrails, not just recommend them in a PDF',
];

const notFit = [
  'You want a strategy document, not working code',
  'You\u2019re not ready to give a senior engineer real access to your codebase',
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
    <Section variant="dark" id="fit">
      <div className={styles.columns}>
        <div className={`${styles.column} ${styles.good}`}>
          <h3 className={styles.columnTitle}>
            <CheckIcon /> This Road
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
            <XIcon /> Wrong Road
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
