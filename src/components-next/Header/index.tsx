'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './Header.module.scss';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 50);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <Link href="/" className={styles.wordmark} aria-label="Windy Road Technology, home">
        <img
          src="/img/logo-white.svg"
          alt=""
          aria-hidden="true"
          className={styles.logo}
          width={140}
          height={42}
        />
      </Link>
      <a
        href="https://cal.com/tomhoward/meeting?user=tomhoward&duration=30&overlayCalendar=true&layout=week_view"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.cta}
      >
        Book a Call
      </a>
    </header>
  );
}
