'use client';

import { useState, useRef } from 'react';
import { faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import validator from 'email-validator';
import Button from '../Button';
import './contact.css';
import './input.css';

const ZD_API = 'https://windyroad.zendesk.com:443/api/v2/requests.json';

const DEFAULT_PRIORITY = 'normal';
const DEFAULT_CATEGORY = 'general-enquiry';

type FormState =
  | 'READY'
  | 'VALIDATING'
  | 'VALIDATION_FAILED'
  | 'SENDING'
  | 'SENT'
  | 'RESPONSE_ERROR'
  | 'REQUEST_ERROR'
  | 'GENERAL_ERROR';

interface FieldErrors {
  name?: string;
  email?: string;
  message?: string;
}

interface Ticket {
  id: number;
  subject: string;
  description: string;
}

interface ContactProps {
  id: string;
}

export default function Contact({ id }: ContactProps) {
  const [formState, setFormState] = useState<FormState>('READY');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState(DEFAULT_PRIORITY);
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const sectionRef = useRef<HTMLHeadingElement>(null);

  function validate(): FieldErrors {
    const errs: FieldErrors = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!validator.validate(email)) {
      errs.email = `'${email}' is not a valid email.`;
    }
    if (!message.trim()) errs.message = 'Message is required';
    return errs;
  }

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate());
  }

  async function handleSubmit(e: React.FormEvent | React.MouseEvent) {
    e.preventDefault();
    setFormState('VALIDATING');

    const errs = validate();
    setErrors(errs);
    setTouched({ name: true, email: true, message: true });

    if (Object.keys(errs).length > 0) {
      setFormState('VALIDATION_FAILED');
      return;
    }

    setFormState('SENDING');
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    try {
      const response = await fetch(ZD_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request: {
            requester: { name, email },
            subject: category || DEFAULT_CATEGORY,
            comment: { body: message },
            priority: priority || DEFAULT_PRIORITY,
            type: 'question',
          },
        }),
      });

      if (!response.ok) {
        if (response.status === 422) {
          setFormState('RESPONSE_ERROR');
          setErrorMsg('There were validation errors with your request. Please check your details and try again.');
        } else {
          setFormState('RESPONSE_ERROR');
          setErrorMsg(`Server error (${response.status}). Please try again.`);
        }
        return;
      }

      const data = await response.json();
      setTicket(data.request);
      setFormState('SENT');
    } catch {
      setFormState('REQUEST_ERROR');
      setErrorMsg('Unable to send your request. Please check your internet connection and try again, or call us.');
    }
  }

  function reset() {
    setName('');
    setEmail('');
    setMessage('');
    setPriority(DEFAULT_PRIORITY);
    setCategory(DEFAULT_CATEGORY);
    setErrors({});
    setTouched({});
    setTicket(null);
    setErrorMsg('');
    setFormState('READY');
  }

  const showError = (field: string) =>
    touched[field] && errors[field as keyof FieldErrors] && formState !== 'READY';

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <section
      id={id}
      className="wrapper style1 special fade"
      style={{ zIndex: 400 }}
    >
      <div className="container">
        <header>
          <h2>Find Your Navigator</h2>
        </header>
        <div
          className={`contactForm ${ticket ? 'submitted ' : ''}${formState}`}
        >
          <div style={{ display: 'flex', flexWrap: 'nowrap' }}>
            {/* Panel 1: Form */}
            <div style={{ flex: '0 0 33.333%', padding: '1.5%' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1em' }}>
                <div style={{ padding: '1.25em 0.5em 0 0.5em', maxWidth: '300px', width: '100%' }}>
                  <Button
                    style={{
                      fontWeight: '900',
                      verticalAlign: 'middle',
                      width: '100%',
                    }}
                    href="tel:+61402756685"
                  >
                    <FontAwesomeIcon
                      icon={faPhone}
                      style={{ paddingRight: '1em' }}
                    />
                    0402 756 685
                  </Button>
                </div>
              </div>
              <div style={{ textAlign: 'center', marginBottom: '1em' }}>or</div>
              <form method="post" onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  <div style={{ flex: '1 1 45%', minWidth: '200px', padding: '1.25em 0.5em 0 0.5em' }}>
                    <div>
                      <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={() => handleBlur('name')}
                        className={showError('name') ? 'error' : ''}
                        autoComplete="on"
                      />
                      <div className="error-msg">
                        {touched.name ? errors.name : ''}&nbsp;
                      </div>
                    </div>
                  </div>
                  <div style={{ flex: '1 1 45%', minWidth: '200px', padding: '1.25em 0.5em 0 0.5em' }}>
                    <div>
                      <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => handleBlur('email')}
                        className={showError('email') ? 'error' : ''}
                        autoComplete="on"
                      />
                      <div className="error-msg">
                        {touched.email ? errors.email : ''}&nbsp;
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '1.25em 0.5em 0 0.5em' }}>
                  <div className="select-wrapper">
                    <select
                      name="category"
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="">- Category -</option>
                      <option value="general-enquiry">General Enquiry</option>
                      <option value="agile-&amp;-lean-mentoring">
                        Agile &amp; Lean Mentoring
                      </option>
                      <option value="ci/cd">
                        Continuous Integration &amp; Continuous Delivery
                      </option>
                      <option value="product-resharpening">
                        Product Resharpening
                      </option>
                      <option value="test-automation">Test Automation</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  {['low', 'normal', 'high'].map((val) => (
                    <div
                      key={val}
                      style={{ flex: '1 1 30%', minWidth: '150px', padding: '1.25em 0.5em 0 0.5em' }}
                    >
                      <div>
                        <input
                          type="radio"
                          id={`priority-${val}`}
                          name="priority"
                          value={val}
                          checked={priority === val}
                          onChange={(e) => setPriority(e.target.value)}
                        />
                        <label htmlFor={`priority-${val}`}>
                          {val.charAt(0).toUpperCase() + val.slice(1)} Priority
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '1.25em 0.5em 0 0.5em' }}>
                  <div>
                    <textarea
                      name="message"
                      placeholder="Message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onBlur={() => handleBlur('message')}
                      className={showError('message') ? 'error' : ''}
                      rows={6}
                    />
                    <div className="error-msg">
                      {touched.message ? errors.message : ''}&nbsp;
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '1em', padding: '0 0.5em' }}>
                  <div style={{ flex: '0 1 300px', padding: '1.25em 0.5em 0 0.5em' }}>
                    <Button
                      style={{
                        fontWeight: '900',
                        verticalAlign: 'middle',
                        width: '100%',
                      }}
                      className={hasErrors && Object.values(touched).some(Boolean) ? 'error' : ''}
                      onClick={handleSubmit}
                    >
                      Send Message
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        style={{ paddingLeft: '1em' }}
                      />
                    </Button>
                    <div className="error-msg">
                      {hasErrors && Object.values(touched).some(Boolean) ? 'Please fix the errors above.' : ''}&nbsp;
                    </div>
                  </div>
                  <div style={{ padding: '1.25em 0.5em 0 0.5em', display: 'flex', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="reset"
                      onClick={reset}
                    >
                      reset
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Panel 2: Sending / Error */}
            <div style={{ flex: '0 0 33.333%', padding: '1.5%' }}>
              <h3 ref={sectionRef}>
                {formState === 'SENDING' ? 'Sending...' : (errorMsg ? 'Sending Failed' : 'Sending...')}
              </h3>
              <div className="table-wrapper" style={{ textAlign: 'left' }}>
                <table>
                  <tbody>
                    <tr><th>Name:</th><td>{name}</td></tr>
                    <tr><th>Email:</th><td>{email}</td></tr>
                    <tr><th>Category:</th><td>{category}</td></tr>
                    <tr><th>Priority:</th><td>{priority}</td></tr>
                    <tr><th>Message:</th><td>{message}</td></tr>
                  </tbody>
                </table>
              </div>
              {errorMsg && (
                <div>
                  <div className="form-error-msg">
                    <h3>Sorry, something&apos;s gone wrong sending your request.</h3>
                    <p>{errorMsg}</p>
                    <p>
                      Please try calling us on{' '}
                      <a href="tel:+61285203165">02 8520 3165</a>
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '1em', justifyContent: 'center', marginTop: '1em' }}>
                    <Button
                      style={{
                        fontWeight: '900',
                        verticalAlign: 'middle',
                      }}
                      onClick={handleSubmit}
                    >
                      Retry
                    </Button>
                    <button
                      type="button"
                      className="button"
                      onClick={() => setFormState('READY')}
                    >
                      edit
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Panel 3: Success */}
            <div style={{ flex: '0 0 33.333%', padding: '1.5%' }}>
              <div className={ticket ? 'ticket submitted' : 'ticket'}>
                <h3>Request Sent Successfully</h3>
                <p>Thanks! We&apos;ll respond to your request ASAP.</p>
                {ticket && (
                  <>
                    <div className="table-wrapper" style={{ textAlign: 'left' }}>
                      <table>
                        <tbody>
                          <tr>
                            <th>Request&nbsp;ID:</th>
                            <td>
                              <a
                                href={`https://windyroad.zendesk.com/hc/requests/${ticket.id}`}
                              >
                                {ticket.id}
                              </a>
                            </td>
                          </tr>
                          <tr><th>Name:</th><td>{name}</td></tr>
                          <tr><th>Email:</th><td>{email}</td></tr>
                          <tr><th>Category:</th><td>{ticket.subject}</td></tr>
                          <tr><th>Message:</th><td>{ticket.description}</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <p>
                      A copy of your request has also been emailed to {email}.
                    </p>
                    <p>
                      If you would like to provide us with more information, you
                      can simply reply to that email.
                    </p>
                  </>
                )}
                <button
                  type="button"
                  className="reset"
                  onClick={reset}
                >
                  reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
