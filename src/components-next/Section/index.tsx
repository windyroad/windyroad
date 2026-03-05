import styles from './Section.module.scss';

interface SectionProps {
  variant?: 'dark' | 'light';
  id?: string;
  children: React.ReactNode;
}

export default function Section({
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
        {children}
      </div>
    </section>
  );
}
