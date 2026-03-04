'use client';

import { useRef, useState } from 'react';
import styles from './NotifyForm.module.scss';

export default function NotifyForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLParagraphElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = inputRef.current?.value.trim() ?? '';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      setErrorMsg('Please enter a valid email address.');
      inputRef.current?.focus();
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    try {
      const body = new URLSearchParams(new FormData(form) as never).toString();
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });

      if (!res.ok) throw new Error('Network error');
      setStatus('success');
      setTimeout(() => successRef.current?.focus(), 100);
    } catch {
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again.');
      inputRef.current?.focus();
    }
  }

  if (status === 'success') {
    return (
      <div className={styles.notifySection}>
        <p
          ref={successRef}
          className={styles.successMsg}
          role="status"
          tabIndex={-1}
        >
          Thanks! I&apos;ll be in touch.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.notifySection}>
      <h3 className={styles.heading} id="notify-heading">
        Not ready for a call?
      </h3>
      <p className={styles.desc}>
        Drop your email and tell me what&apos;s breaking. I&apos;ll let you
        know if it&apos;s something I can help with.
      </p>

      <form
        name="notify"
        method="POST"
        data-netlify="true"
        netlify-honeypot="bot-field"
        aria-labelledby="notify-heading"
        noValidate
        onSubmit={handleSubmit}
        className={styles.form}
      >
        <input type="hidden" name="form-name" value="notify" />

        <p
          style={{ position: 'absolute', left: '-9999px', overflow: 'hidden' }}
          aria-hidden="true"
        >
          <label>
            Do not fill this out if you are human:
            <input name="bot-field" tabIndex={-1} autoComplete="off" />
          </label>
        </p>

        <div className={styles.formGroup}>
          <label htmlFor="notify-email" className={styles.label}>
            Email address
          </label>
          <input
            ref={inputRef}
            id="notify-email"
            type="email"
            name="email"
            autoComplete="email"
            required
            aria-invalid={status === 'error' ? 'true' : undefined}
            aria-describedby={status === 'error' ? 'notify-error' : undefined}
            className={styles.emailInput}
            placeholder="you@example.com"
          />
          {status === 'error' && errorMsg && (
            <p id="notify-error" className={styles.errorMsg} role="alert">
              {errorMsg}
            </p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="notify-message" className={styles.label}>
            What&apos;s breaking?
          </label>
          <textarea
            id="notify-message"
            name="message"
            rows={3}
            className={styles.messageInput}
            placeholder="e.g. Stripe webhooks fail randomly, or the app crashes under load"
          />
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Sending\u2026' : 'Send'}
        </button>

        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={styles.srOnly}
        >
          {status === 'submitting' ? 'Sending your message\u2026' : ''}
        </div>
      </form>
    </div>
  );
}
