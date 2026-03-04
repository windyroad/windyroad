import Section from '@/src/components-next/Section';
import CountUp from '@/src/components-next/CountUp';
import RangeCountUp from '@/src/components-next/CountUp/RangeCountUp';
import styles from './OperatorSection.module.scss';

export default function OperatorSection() {
  return (
    <Section number="01" label="THE OPERATOR" variant="dark" id="operator">
      <h2 className={styles.title}>I&apos;ve been here before.</h2>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <CountUp end={3} className={styles.statValue} />
          <div className={styles.statLabel}>profitable products shipped from scratch</div>
        </div>
        <div className={styles.stat}>
          <CountUp end={400} suffix="%" className={styles.statValue} />
          <div className={styles.statLabel}>throughput increase per developer at Greater Bank</div>
        </div>
        <div className={styles.stat}>
          <RangeCountUp start={0} end={97} suffix="%" className={styles.statValue} />
          <div className={styles.statLabel}>compliance in 10 months at Westpac</div>
        </div>
      </div>

      <div className={styles.narrative}>
        <p>
          Through Windy Road Technology, I&apos;ve taken three software products
          from idea to market to profit: TIBant, BWUnit, and Addressr. Not
          consulting on someone else&apos;s product, actually building it.
          Finding customers, closing sales, supporting users. With paying
          customers across Australia, the UK, US, and Europe, I know what it
          takes to ship something real.
        </p>
        <p>
          I&apos;ve been working with AI since 1999: building autonomous
          agents at CSIRO, competing at the RoboCup World Cup, holding a patent,
          co-authoring research papers. Which means I understand how these tools
          actually reason, not just how to prompt them. I know where they
          hallucinate and why.
        </p>
        <p>
          At Greater Bank I introduced Software Delivery Fireteams that cut
          cycle time from 24 to 8 days and increased developer throughput by
          400%, while growing the team by 50%. At Westpac I led
          FATCA/CRS compliance remediation across 5,300+ bankers, taking entity
          compliance from 0% to 97% in 10 months. At Pacific National I halved
          open incidents and built the API platform behind their award-winning
          customer portal.
        </p>
        <p>
          25+ years of delivery leadership. Three products shipped from scratch.
          Which means I&apos;m not guessing at what breaks when you scale.
          I&apos;ve broken it and fixed it.
        </p>
      </div>
    </Section>
  );
}
