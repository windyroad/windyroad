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
      <Link href="/" className={styles.wordmark}>
        <span className={styles.name}>Tom Howard</span>
        <span className={styles.company}>Windy Road Technology</span>
      </Link>
      <a
        href="https://cal.com/tomhoward"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.cta}
      >
        Book a Call
      </a>
    </header>
  );
}
