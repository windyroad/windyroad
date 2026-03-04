import Link from 'next/link';
import Button from '@/src/components-next/Button';
import styles from './Hero.module.scss';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <h1 className={styles.headline}>
          You ship faster with AI.<br />
          I make sure it <span className={styles.accent}>actually</span> works.
        </h1>
        <p className={styles.subheadline}>
          Copilot, Cursor, and Claude are writing your production code. I
          partner with founders and engineering leaders as a co-driver,
          reading the road ahead, warning about what&apos;s coming, so the
          speed doesn&apos;t put you in a ditch.
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
        <div className={styles.routing}>
          <Link href="/vibe-code-audit" className={styles.routeLink}>
            I vibe-coded something
          </Link>
          <Link href="#approach" className={styles.routeLink}>
            My team uses AI tools
          </Link>
        </div>
      </div>
    </section>
  );
}
