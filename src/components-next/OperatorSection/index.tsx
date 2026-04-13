import Section from '@/src/components-next/Section';
import CountUp from '@/src/components-next/CountUp';
import RangeCountUp from '@/src/components-next/CountUp/RangeCountUp';
import styles from './OperatorSection.module.scss';

export default function OperatorSection() {
  return (
    <Section variant="dark" id="operator">
      <div className={styles.intro}>
        <img
          src="/img/tomhoward.jpg"
          alt="Tom Howard"
          className={styles.headshot}
          width={120}
          height={120}
          loading="lazy"
        />
        <h2 className={styles.title}>
          Tom Howard has shipped three profitable software products from
          scratch: built them, found the customers, closed the sales.
        </h2>
      </div>

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
          Tom Howard founded Windy Road Technology and took three software
          products from idea to market to profit: TIBant, BWUnit, and Addressr.
          Built them, found the customers, closed the sales, supported the users.
          With paying customers across Australia, the UK, US, and Europe, we
          know what it takes to ship something real.
        </p>
        <p>
          We&apos;ve been working with AI since 1999: building autonomous
          agents at CSIRO, competing at the RoboCup World Cup, holding a patent,
          co-authoring research papers. Which means we understand how these tools
          reason and where they break.
        </p>
        <p>
          At Greater Bank we introduced Software Delivery Fireteams that cut
          cycle time from 24 to 8 days and increased developer throughput by
          400%, while growing the team by 50%. At Westpac we led
          FATCA/CRS compliance remediation across 5,300+ bankers, taking entity
          compliance from 0% to 97% in 10 months. At Pacific National we halved
          open incidents and built the API platform behind their award-winning
          customer portal.
        </p>
        <p>
          25+ years of delivery leadership. Three products shipped from scratch.
          We&apos;ve seen what breaks when you scale, and we&apos;ve fixed it.
        </p>
      </div>
    </Section>
  );
}
