import Link from 'next/link';
import styles from './not-found.module.scss';

export default function NotFound() {
  return (
    <div className={styles.notFound}>
      <div>
        <div className={styles.code}>404</div>
        <p className={styles.message}>
          This page doesn&apos;t exist.
        </p>
        <Link href="/" className={styles.homeLink}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
