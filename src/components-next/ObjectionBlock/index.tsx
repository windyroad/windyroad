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
          You can. But Claude wrote the bugs in the first place. You need a
          human who knows what production-grade code actually looks like.
        </p>
      </div>
    </Section>
  );
}
