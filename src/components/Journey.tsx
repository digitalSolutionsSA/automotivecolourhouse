import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';

const PHASES = [
  { no: '01', title: 'Research & sourcing', text: 'Identifying premium peelable coating systems and testing them for South African conditions.', status: 'In progress' },
  { no: '02', title: 'Skills & standards', text: 'Building professional application standards, preparation processes and technical expertise.', status: 'In progress' },
  { no: '03', title: 'The studio', text: 'A dedicated, controlled application environment designed around precision and finish quality.', status: 'Next' },
  { no: '04', title: 'Launch', text: 'Opening our doors to vehicle owners, dealerships and automotive businesses across South Africa.', status: 'Coming soon' },
];

export default function Journey() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.journey-bg img', { yPercent: -12, scale: 1.15 }, {
        yPercent: 12,
        scale: 1.05,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
      });
      gsap.from('.journey-title .line > span', {
        yPercent: 110,
        duration: 1.4,
        stagger: 0.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.journey-title', start: 'top 80%' },
      });
      // progress line runs horizontally on desktop, vertically on phones
      const axis = window.matchMedia('(max-width: 700px)').matches ? 'scaleY' : 'scaleX';
      gsap.fromTo('.journey-progress i', { [axis]: 0 }, {
        [axis]: 0.42,
        ease: 'none',
        scrollTrigger: { trigger: '.journey-track', start: 'top 85%', end: 'top 35%', scrub: 1 },
      });
      gsap.from('.journey-node', {
        scale: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'back.out(3)',
        scrollTrigger: { trigger: '.journey-track', start: 'top 75%' },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="journey" id="journey" ref={root}>
      <div className="journey-bg">
        <img src="/images/journey-concrete.jpg" alt="" loading="lazy" />
      </div>
      <div className="journey-shade" />

      <div className="journey-inner">
        <div className="journey-head">
          <p className="eyebrow" data-sr="left">
            Our journey <span className="rule" />
          </p>
          <h2 className="journey-title">
            <span className="line thin"><span>From vision</span></span>
            <span className="line heavy"><span>To finish.</span></span>
          </h2>
          <p className="journey-intro" data-sr="up">
            Automotive Colour House is being built step by step — with the same care we intend to bring to every
            vehicle. Follow along as we bring bespoke, removable finishes to South Africa.
          </p>
        </div>

        <div className="journey-track">
          <div className="journey-progress"><i /></div>
          {PHASES.map((p, i) => (
            <div className={`journey-phase ${i < 2 ? 'is-live' : ''}`} key={p.no} data-sr="up" data-sr-delay={i * 150}>
              <span className="journey-node" />
              <span className="journey-status">{p.status}</span>
              <span className="journey-no">{p.no}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </div>

      <span className="journey-side">South Africa</span>
    </section>
  );
}
