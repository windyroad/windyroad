import Link from 'next/link';
import styles from './Header.module.scss';

export default function Header() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.wordmark}>
        Tom Howard
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
