import Button from '@/src/components-next/Button';
import styles from './Hero.module.scss';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <h1 className={styles.headline}>
          Your team ships faster with AI.<br />
          <span className={styles.accent}>I make sure it actually works.</span>
        </h1>
        <p className={styles.subheadline}>
          Copilot, Cursor, and Claude are writing your production code. I help
          founders and engineering leaders put the guardrails in place so that
          speed doesn&apos;t become your most expensive liability.
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
