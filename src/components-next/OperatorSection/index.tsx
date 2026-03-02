import Section from '@/src/components-next/Section';
import styles from './OperatorSection.module.scss';

export default function OperatorSection() {
  return (
    <Section number="01" label="THE OPERATOR" variant="dark" id="operator">
      <h2 className={styles.title}>I&apos;ve been here before.</h2>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statValue}>400%</div>
          <div className={styles.statLabel}>throughput increase per developer at Greater Bank</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>0 &rarr; 97%</div>
          <div className={styles.statLabel}>compliance in 10 months at Westpac</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>3</div>
          <div className={styles.statLabel}>profitable software products shipped</div>
        </div>
      </div>

      <div className={styles.narrative}>
        <p>
          At Greater Bank I introduced Software Delivery Fireteams that cut
          cycle time from 24 to 8 days and increased developer throughput by
          400% &mdash; while growing the team by 50%. At Westpac I led
          FATCA/CRS compliance remediation across 5,300+ bankers, taking entity
          compliance from 0% to 97% in 10 months. At Pacific National I halved
          open incidents and built the API platform behind their award-winning
          customer portal.
        </p>
        <p>
          I&apos;ve been working with AI since 1999 &mdash; building autonomous
          agents at CSIRO, competing at the RoboCup World Cup, holding a patent,
          co-authoring research papers. AI experience before it was called AI.
        </p>
        <p>
          Through Windy Road Technology, I&apos;ve taken three software products
          from idea to implementation to market to profit: TIBant, BWUnit, and
          Addressr. Not consulting on someone else&apos;s product &mdash;
          actually doing it. Finding customers, closing sales, supporting users.
          With paying customers across Australia, the UK, US, and Europe, I know
          what it takes.
        </p>
        <p>
          25+ years of delivery leadership. AI before it was a buzzword. Three
          products taken from idea to profit. When you need a navigator who&apos;s
          been on this road before, I&apos;m that person.
        </p>
      </div>
    </Section>
  );
}
