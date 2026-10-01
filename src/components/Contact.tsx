import { useRef, useState } from 'react';
import { gsap } from '../lib/gsap';
import { Arrow, Instagram, Mail } from './Icons';

const INTERESTS = ['Colour change', 'Paint protection', 'Dealership / trade', 'Just following along'];
const EMAIL = 'info@abautomotive.co.za';

export default function Contact() {
  const [interest, setInterest] = useState(INTERESTS[0]);
  const [sent, setSent] = useState(false);
  const form = useRef<HTMLFormElement>(null);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    // No backend yet: hand the enquiry to the visitor's mail client.
    const body = [
      `Name: ${data.get('name')}`,
      `Email: ${data.get('email')}`,
      `Vehicle: ${data.get('vehicle') || '-'}`,
      `Interest: ${interest}`,
      '',
      String(data.get('message') || ''),
    ].join('\n');
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Automotive Colour House enquiry')}&body=${encodeURIComponent(body)}`;
    gsap.to(form.current, {
      opacity: 0,
      y: -20,
      duration: 0.6,
      ease: 'power3.in',
      onComplete: () => setSent(true),
    });
  };

  return (
    <section className="contact" id="contact">
      <div className="contact-head">
        <p className="eyebrow" data-sr="left">
          Contact <span className="rule" />
        </p>
        <h2 className="contact-title" data-sr="up">
          <span className="thin">Follow</span>
          <span className="heavy">Our journey.</span>
        </h2>
        <p className="contact-intro" data-sr="up" data-sr-delay="100">
          Register your interest to be among the first to experience bespoke, removable finishes when we open —
          or reach out to talk about partnerships.
        </p>
        <ul className="contact-list" data-sr="up" data-sr-delay="200">
          <li>
            <span>Location</span>South Africa
          </li>
          <li>
            <span>Email</span>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </li>
          <li className="contact-social">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={20} /></a>
            <a href={`mailto:${EMAIL}`} aria-label="Email"><Mail size={22} /></a>
          </li>
        </ul>
      </div>

      <div className="contact-form-wrap" data-sr="fade" data-sr-delay="200">
        {sent ? (
          <div className="contact-thanks">
            <span className="dash" />
            <h3>Thank you.</h3>
            <p>Your enquiry is ready in your email app. We'll be in touch as our journey unfolds.</p>
            <button className="btn btn-outline" onClick={() => setSent(false)}>Send another</button>
          </div>
        ) : (
          <form className="contact-form" ref={form} onSubmit={submit}>
            <fieldset className="chips">
              <legend>I'm interested in</legend>
              {INTERESTS.map((i) => (
                <button type="button" key={i} className={interest === i ? 'is-active' : ''} onClick={() => setInterest(i)}>
                  {i}
                </button>
              ))}
            </fieldset>
            <div className="field-row">
              <label className="field">
                <input name="name" required placeholder=" " autoComplete="name" />
                <span>Full name</span>
              </label>
              <label className="field">
                <input name="email" type="email" required placeholder=" " autoComplete="email" />
                <span>Email address</span>
              </label>
            </div>
            <label className="field">
              <input name="vehicle" placeholder=" " />
              <span>Vehicle (optional)</span>
            </label>
            <label className="field">
              <textarea name="message" rows={3} placeholder=" " />
              <span>Message</span>
            </label>
            <button type="submit" className="btn btn-solid">
              Register interest <Arrow />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
