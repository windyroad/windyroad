import Section from '@/src/components-next/Section';
import styles from './OperatorSection.module.scss';

export default function OperatorSection() {
  return (
    <Section number="01" label="THE OPERATOR" variant="dark" id="operator">
      <h2 className={styles.title}>Tom Howard</h2>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statValue}>25+</div>
          <div className={styles.statLabel}>years in delivery</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>1999</div>
          <div className={styles.statLabel}>AI work since</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>17+</div>
          <div className={styles.statLabel}>years running Windy Road</div>
        </div>
      </div>

      <div className={styles.narrative}>
        <p>
          I started in AI before most people had broadband. At CSIRO I built
          autonomous agents in C++ for the RoboCup Simulation League, placing
          2nd in Pacific Rim and 9th at the World Cup. I co-authored three
          research papers and hold a patent for a functional planning system.
        </p>
        <p>
          From there I spent six years leading the RoboCup Soccer Simulator
          project, coordinating international contributors. Then I moved into
          enterprise delivery &mdash; integration architecture, solution design,
          and engineering leadership at organisations like AMP, Westpac, Pacific
          National, and Greater Bank.
        </p>
        <p>
          At Westpac I led FATCA/CRS compliance remediation, taking entity
          compliance from 0% to 97% in 10 months across 5,300+ bankers. At
          Greater Bank I introduced Software Delivery Fireteams that cut cycle
          time from 24 to 8 days and increased throughput by 400% per developer.
          At Pacific National I led the Rail Systems team, halved open
          incidents, and built an API platform that underpinned an award-winning
          customer portal.
        </p>
        <p>
          In 2008 I founded Windy Road Technology and have run it for 17+ years,
          building and commercialising software products &mdash; TIBant, BWUnit,
          Addressr &mdash; with customers across Australia, the UK, US, and
          Europe. Now I&apos;m building Voder, an autonomous software delivery
          system that takes user stories and iteratively delivers real software.
        </p>
        <p>
          I&apos;ve spoken at apidays, SlashNEW, and Newcastle Coder&apos;s
          Group on topics ranging from fireteam-based delivery to event-sourcing
          architecture. That mix of hands-on AI research, enterprise-scale
          delivery, and product-building is what I bring to every engagement.
        </p>
      </div>
    </Section>
  );
}
