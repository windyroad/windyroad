import Section from '@/src/components-next/Section';
import styles from './TestimonialsSection.module.scss';

const testimonials = [
  {
    theme: 'On fixing what\u2019s broken',
    name: 'Mark Chan',
    role: 'Senior Project Manager, Westpac',
    quote:
      'Resourced into a troubled project at WBC, he was able to reassure management regarding directions to stabilise and bring the project back on course. Tom projects well with all levels of staff and is highly regarded for his training efforts. I highly recommend Tom from a technical and management perspective.',
  },
  {
    theme: 'On bridging tech and business',
    name: 'Kasi Subramanian',
    role: 'Manager, Rail Services at Pacific National',
    quote:
      'What set him apart was his technical strength \u2014 he could engage credibly with both the business and the team, managing expectations effectively while keeping everyone honest on what was truly achievable.',
  },
  {
    theme: 'On tackling hard problems',
    name: 'John Menzies',
    role: 'Director and Founding Engineer, Think Platinum',
    quote:
      'Never afraid to tackle a problem, he brought high levels of innovation coupled with quality and commitment. Tom never failed to meet the objectives set for him, often exceeding expectations.',
  },
];

export default function TestimonialsSection() {
  return (
    <Section number="04" label="WHAT OTHERS SAY" variant="light" id="testimonials">
      <div className={styles.testimonials}>
        {testimonials.map((t) => (
          <div key={t.name} className={styles.card}>
            <div className={styles.theme}>{t.theme}</div>
            <blockquote className={styles.quote}>
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <div className={styles.attribution}>
              <span className={styles.name}>{t.name}</span>
              <span className={styles.role}>{t.role}</span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
