import Section from '@/src/components-next/Section';
import styles from './ApproachSection.module.scss';

const problems = [
  'A vibe-coded prototype that works until it meets real users, real data, or a security audit',
  'Hallucinated dependencies that slip past review and into production',
  'AI code that \u201Clooks right\u201D but ships with security holes',
  'Tests that pass but test nothing \u2014 the real failure mode goes undetected',
  '3\u00D7 faster shipping, quietly doubled defect rate',
  'Junior devs who don\u2019t know enough to push back on AI suggestions',
];

const process = [
  {
    label: 'Diagnose',
    description:
      'I look at how your team actually works with AI tools today \u2014 which ones they use, how generated code gets reviewed, what your pipeline catches and what slips through. You get a clear picture of where the risk is and what to fix first.',
  },
  {
    label: 'Implement',
    description:
      'I build the guardrails: quality gates in your pipeline, review checklists for AI-generated code, test coverage rules that actually catch the failure modes these tools introduce. Not a slide deck \u2014 working infrastructure.',
  },
  {
    label: 'Embed',
    description:
      'I work alongside your team to make it stick. Pair on real PRs, coach developers on what to watch for in AI output, tune the process based on what\u2019s actually happening in your codebase.',
  },
];

export default function ApproachSection() {
  return (
    <Section number="02" label="THE PROBLEM" variant="light" id="approach">
      <h2 className={styles.sectionTitle}>
        Vibe-coded a prototype, or your team is on Copilot?<br />
        Here&apos;s what&apos;s going wrong.
      </h2>
      <div className={styles.problemList}>
        {problems.map((problem) => (
          <div key={problem} className={styles.problemItem}>
            <svg className={styles.problemIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>{problem}</span>
          </div>
        ))}
      </div>

      <h3 className={styles.processTitle}>What working with me looks like</h3>
      <div className={styles.processSteps}>
        {process.map((step, i) => (
          <div key={step.label} className={styles.step}>
            <div className={styles.stepNumber}>{String(i + 1).padStart(2, '0')}</div>
            <div>
              <div className={styles.stepLabel}>{step.label}</div>
              <p className={styles.stepDesc}>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
