import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { Close } from './Icons';

const SCENES = [
  { img: '/images/hero-studio.jpg', kicker: 'Colour', line: 'Colour without commitment.' },
  { img: '/images/card-drops.jpg', kicker: 'Protection', line: 'A finish that protects the finish.' },
  { img: '/images/hero-silver.jpg', kicker: 'Expression', line: 'Same vehicle. A whole new look.' },
  { img: '/images/hero-sunset.jpg', kicker: 'South Africa', line: 'The future of automotive colour.' },
];

/** A cinematic, GSAP-driven "vision" reel built from the brand imagery. */
export default function VisionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);

    const ctx = gsap.context(() => {
      gsap.fromTo(root.current, { opacity: 0 }, { opacity: 1, duration: 0.6 });
      const tl = gsap.timeline({ repeat: -1 });
      const scenes = gsap.utils.toArray<HTMLElement>('.vision-scene');
      const bars = gsap.utils.toArray<HTMLElement>('.vision-bars i');
      scenes.forEach((s, i) => {
        const at = i * 5;
        tl.set(bars, { scaleX: (j: number) => (j < i ? 1 : 0) }, at)
          .fromTo(s, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.inOut' }, at)
          .fromTo(s.querySelector('img'), { scale: 1.25, x: i % 2 ? -40 : 40 }, { scale: 1.05, x: 0, duration: 6.2, ease: 'none' }, at)
          .fromTo(s.querySelectorAll('.vk, .vl'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.15, duration: 1.2, ease: 'expo.out' }, at + 0.5)
          .fromTo(bars[i], { scaleX: 0 }, { scaleX: 1, duration: 5, ease: 'none' }, at)
          .to(s.querySelectorAll('.vk, .vl'), { opacity: 0, y: -20, duration: 0.6, ease: 'power2.in' }, at + 4.2)
          .to(s, { opacity: 0, duration: 1.2, ease: 'power2.inOut' }, at + 4.8);
      });
    }, root);

    return () => {
      ctx.revert();
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="vision" ref={root} role="dialog" aria-modal="true" aria-label="Our vision">
      {SCENES.map((s) => (
        <div className="vision-scene" key={s.line}>
          <img src={s.img} alt="" />
          <div className="vision-copy">
            <p className="vk eyebrow">{s.kicker}</p>
            <p className="vl">{s.line}</p>
          </div>
        </div>
      ))}
      <img className="vision-logo" src="/images/logo-white.png" alt="Automotive Colour House" />
      <button className="vision-close" onClick={onClose} aria-label="Close">
        <Close size={26} />
      </button>
      <div className="vision-bars">
        {SCENES.map((s) => (
          <span key={s.line}><i /></span>
        ))}
      </div>
    </div>
  );
}
