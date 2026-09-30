import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';

/** "What we're building" — light editorial section with a scroll-driven peel lens. */
export default function Building() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const top = root.current!.querySelector<HTMLElement>('.lens-coat')!;
      const flap = root.current!.querySelector<HTMLElement>('.lens-flap')!;
      const state = { p: 0 };
      // coat is visible where x + y < L (percent units); the flap mirrors the peeled corner
      const render = () => {
        const L = 200 - state.p * 120;
        const k = (200 - L) * 0.32;
        top.style.clipPath = `polygon(0 0, ${L}% 0, 0 ${L}%)`;
        flap.style.clipPath = `polygon(${L}% 0, 0 ${L}%, ${L / 2 - k}% ${L / 2 - k}%)`;
      };
      render();
      gsap.to(state, {
        p: 1,
        ease: 'none',
        onUpdate: render,
        scrollTrigger: { trigger: '.building-visual', start: 'top 75%', end: 'bottom 35%', scrub: 1 },
      });

      gsap.fromTo('.building-img img', { scale: 1.12, xPercent: 3 }, {
        scale: 1,
        xPercent: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
      });

      gsap.from('.building-pointer', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 1.4,
        ease: 'expo.inOut',
        scrollTrigger: { trigger: '.building-visual', start: 'top 70%' },
      });

      gsap.from('.building-title .line > span', {
        yPercent: 110,
        duration: 1.4,
        stagger: 0.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.building-title', start: 'top 80%' },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="building" id="about" ref={root}>
      <div className="building-text">
        <p className="eyebrow eyebrow-dark" data-sr="left">
          What we're building <span className="rule" />
        </p>
        <h2 className="building-title">
          <span className="line thin"><span>A new</span></span>
          <span className="line thin"><span>approach to</span></span>
          <span className="line heavy"><span>Automotive</span></span>
          <span className="line heavy"><span>finishes.</span></span>
        </h2>
      </div>

      <div className="building-copy">
        <p data-sr="up">
          We aim to establish a professional automotive coating operation specialising in removable colour and
          protective coating solutions.
        </p>
        <p data-sr="up" data-sr-delay="150">
          Our objective is to combine premium products, professional application standards and exceptional
          attention to detail to create a new option for vehicle owners, dealerships and automotive businesses.
        </p>
      </div>

      <div className="building-visual">
        <div className="building-img">
          <img src="/images/building-panel.jpg" alt="Close-up of a coated performance car body panel" loading="lazy" />
        </div>
        <span className="building-pointer">
          <i />
        </span>
        <div className="lens" data-cursor="Peel">
          <div className="lens-base" />
          <div className="lens-coat" />
          <div className="lens-flap" />
        </div>
        <p className="lens-caption">
          Same vehicle.
          <br />A whole new look.
          <br />Removable.
        </p>
      </div>
    </section>
  );
}
