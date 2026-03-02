import Button from '@/src/components-next/Button';
import styles from './Hero.module.scss';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <h1 className={styles.headline}>
          Ship with AI.<br />
          <span className={styles.accent}>Without the risk.</span>
        </h1>
        <p className={styles.subheadline}>
          AI tools let your team move fast &mdash; but speed without guardrails
          is how you blow up your production database. I help founders and
          engineering leaders deliver with AI safely.
        </p>
        <div className={styles.cta}>
          <Button
            href="https://cal.com/tomhoward"
            variant="primary"
            size="large"
            external
          >
            Book a Call
          </Button>
        </div>
      </div>
    </section>
  );
}
