import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';

const WORDS = ['Colour', 'Protection', 'Transformation', 'Bespoke finishes', 'South Africa'];

export default function Marquee() {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current!;
    const tween = gsap.to(el, { xPercent: -50, duration: 40, ease: 'none', repeat: -1 });
    // speed up briefly with scroll velocity
    let last = window.scrollY;
    const onScroll = () => {
      const v = Math.min(Math.abs(window.scrollY - last) / 8, 6);
      last = window.scrollY;
      gsap.to(tween, { timeScale: 1 + v, duration: 0.2, overwrite: true, onComplete: () => { gsap.to(tween, { timeScale: 1, duration: 1.2 }); } });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      tween.kill();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const row = [...WORDS, ...WORDS];
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee-track" ref={track}>
        {[...row, ...row].map((w, i) => (
          <span key={i}>
            {w}
            <i>•</i>
          </span>
        ))}
      </div>
    </div>
  );
}
