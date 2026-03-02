import Section from '@/src/components-next/Section';
import styles from './TestimonialsSection.module.scss';

const testimonials = [
  {
    name: 'Kasi Subramanian',
    role: 'Manager, Rail Services at Pacific National',
    quote:
      'Tom is the kind of Scrum Master who doesn\u2019t just run standups \u2014 he transforms teams. When he joined Rail Services, we were following a waterfall approach. Tom introduced agile thinking, improved our delivery and productivity, and created a model that other teams across the organisation have since adopted. What set him apart was his technical strength \u2014 he could engage credibly with both the business and the team, managing expectations effectively while keeping everyone honest on what was truly achievable. He brought a new energy and a practical, people-first approach to change.',
  },
  {
    name: 'Martin Lee',
    role: 'Senior / Lead Business Analyst | Regulatory Compliance | Risk Management | Data Governance',
    quote:
      'Tom is a true professional with uncompromising values and willingness provide advice or share knowledge for work or other related matters. We worked together in large regulatory projects with emphasis on compliance, data and technology deliveries. Throughout the time, Tom has demonstrated structural and logical approaches to complex matters. He always made himself available to provide guidance or constructive feedbacks to ideas. Tom is a great asset for any organisation that looks for technology delivery or team leadership.',
  },
  {
    name: 'Stan Ciesielski',
    role: 'Senior Software Engineer',
    quote:
      'I had the pleasure of working with Tom on two projects at DigiZoo and it was truly a great experience. Tom is very versatile and comfortable working in many areas. He handles solution architecture, technical design, coding, testing, scrum mastering and project management very well. He has strong technical knowledge and understands both the big picture and the details. He always looks for ways to improve processes and make delivery smoother and more reliable.',
  },
];

export default function TestimonialsSection() {
  return (
    <Section number="04" label="WHAT OTHERS SAY" variant="light" id="testimonials">
      <div className={styles.testimonials}>
        {testimonials.map((t) => (
          <div key={t.name} className={styles.card}>
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
