import Button from '@/src/components-next/Button';
import styles from './CTASection.module.scss';

export default function CTASection() {
  return (
    <section className={styles.cta} id="contact">
      <div className={styles.inner}>
        <h2 className={styles.headline}>Tell me what&apos;s breaking.</h2>
        <p className={styles.subtext}>
          Book a 30-minute call. If your app is breaking in production today,
          I can usually start this week.
        </p>
        <div className={styles.buttonWrap}>
          <Button
            href="https://cal.com/tomhoward/meeting?user=tomhoward&duration=30&overlayCalendar=true&layout=week_view"
            variant="primary"
            size="large"
            external
          >
            Book a Call
          </Button>
        </div>
        <div className={styles.contact}>
          <a href="tel:+61402756685" className={styles.contactItem}>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
            </svg>
            0402 756 685
          </a>
          <a href="mailto:tom@windyroad.com.au" className={styles.contactItem}>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            tom@windyroad.com.au
          </a>
          <a
            href="https://www.linkedin.com/in/tomhoward"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.contactItem}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  );
}
