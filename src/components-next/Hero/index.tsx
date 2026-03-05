'use client';

import { useState, useRef, useEffect } from 'react';
import Button from '@/src/components-next/Button';
import styles from './Hero.module.scss';

export default function Hero() {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  return (
    <section className={styles.hero}>
      <img
        ref={imgRef}
        src="/img/banner.jpg"
        alt=""
        aria-hidden="true"
        className={`${styles.backgroundImage} ${loaded ? styles.backgroundImageLoaded : ''}`}
        fetchPriority="high"
        loading="eager"
        onLoad={() => setLoaded(true)}
      />
      <div className={styles.inner}>
        <h1 className={styles.headline}>
          Your vibe-coded app is in production.<br />
          Something keeps breaking.<br />
          You&apos;re scared to touch it.
        </h1>
        <p className={styles.subheadline}>
          I make sure it <span className={styles.accent}>works</span>.
        </p>
        <div className={styles.cta}>
          <Button
            href="https://cal.com/tomhoward/meeting?user=tomhoward&duration=30&overlayCalendar=true&layout=week_view"
            variant="primary"
            size="large"
            external
          >
            Book a Call
          </Button>
          <Button href="/vibe-code-audit" variant="inverted" size="large">
            Vibe Code Audit: $5k
          </Button>
        </div>
        <p className={styles.statStrip}>
          400% developer throughput
          <span aria-hidden="true"> · </span>
          0 to 97% compliance in 10 months
          <span aria-hidden="true"> · </span>
          3 products shipped from scratch
        </p>
      </div>
    </section>
  );
}
