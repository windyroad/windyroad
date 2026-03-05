import Section from '@/src/components-next/Section';
import styles from './ObjectionBlock.module.scss';

export default function ObjectionBlock() {
  return (
    <Section variant="light" id="objection">
      <div className={styles.block}>
        <p className={styles.question}>
          &ldquo;Can&apos;t I just ask Claude to audit the code?&rdquo;
        </p>
        <p className={styles.answer}>
          You can. An AI audit will catch syntax and pattern issues. It
          won&apos;t catch the architectural gaps, the business logic that
          doesn&apos;t match your edge cases, or the dependencies that
          don&apos;t exist. That takes a human who&apos;s shipped production
          code.
        </p>
      </div>
    </Section>
  );
}
