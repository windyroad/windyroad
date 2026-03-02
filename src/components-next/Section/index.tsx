import styles from './Section.module.scss';

interface SectionProps {
  number?: string;
  label?: string;
  variant?: 'dark' | 'light';
  id?: string;
  children: React.ReactNode;
}

export default function Section({
  number,
  label,
  variant = 'dark',
  id,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`${styles.section} ${styles[variant]}`}
    >
      <div className={styles.inner}>
        {(number || label) && (
          <div className={styles.header}>
            {number && <span className={styles.number}>{number}</span>}
            {label && <span className={styles.label}>{label}</span>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
