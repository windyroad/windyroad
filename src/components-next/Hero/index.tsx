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
          Copilot, Cursor, and Claude are writing your production code. I
          partner with founders and engineering leaders as a co-driver —
          reading the road ahead, calling corners — so the speed doesn&apos;t
          put you in the ditch. Whether you&apos;re building something new or
          fixing what&apos;s broken, I&apos;ve done both.
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
