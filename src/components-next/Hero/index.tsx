'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
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
          You ship faster with AI.<br />
          I make sure it <span className={styles.accent}>actually</span> works.
        </h1>
        <p className={styles.subheadline}>
          Copilot, Cursor, and Claude are writing your production code. I
          partner with founders and engineering leaders as a co-driver,
          reading the road ahead so the speed doesn&apos;t put you in a
          ditch.
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
