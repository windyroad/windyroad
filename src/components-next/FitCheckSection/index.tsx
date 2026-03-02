import Section from '@/src/components-next/Section';
import styles from './FitCheckSection.module.scss';

const goodFit = [
  'You\u2019re a founder or engineering leader using AI to ship faster',
  'You want guardrails before your team pushes AI-generated code to production',
  'You need someone who can lead delivery and write code, not just make slides',
  'You\u2019re in a regulated industry where shipping fast means managing risk',
  'You want to build a sustainable AI-assisted delivery process, not a one-off hack',
];

const notFit = [
  'You want a pure strategy consultant who won\u2019t touch code',
  'You need a full-time permanent hire',
  'You\u2019re looking for someone to build an AI/ML model from scratch',
  'You want to move fast with zero process and see what happens',
];

const CheckIcon = () => (
  <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
