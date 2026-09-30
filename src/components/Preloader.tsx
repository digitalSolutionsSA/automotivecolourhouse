import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';

interface Props {
  ready: boolean;
  onDone: () => void;
}

export default function Preloader({ ready, onDone }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const progress = useRef({ v: 0 });
  const intro = useRef<gsap.core.Timeline | null>(null);

  const paint = () => {
    if (count.current) count.current.textContent = String(Math.round(progress.current.v)).padStart(3, '0');
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      intro.current = gsap
        .timeline()
        .from('.pre-logo', { clipPath: 'inset(0 100% 0 0)', duration: 1.6, ease: 'expo.inOut' })
        .from('.pre-line', { scaleX: 0, duration: 1.2, ease: 'expo.inOut' }, '-=0.9')
        .from('.pre-meta', { opacity: 0, y: 10, duration: 0.8 }, '-=0.6')
        .to(progress.current, { v: 90, duration: 1.8, ease: 'power1.inOut', onUpdate: paint }, 0.4);
    }, root);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!ready || !intro.current) return;
    const tl = intro.current;
    const finish = () => {
      gsap
        .timeline({ onComplete: onDone })
        .to(progress.current, { v: 100, duration: 0.5, onUpdate: paint })
        .to(root.current!.querySelector('.pre-inner'), { opacity: 0, y: -30, duration: 0.7, ease: 'power3.in' })
        .to(root.current!.querySelectorAll('.pre-panel'), { yPercent: -100, duration: 1.1, stagger: 0.08, ease: 'expo.inOut' }, '-=0.2')
        .set(root.current, { display: 'none' });
    };
    if (tl.progress() >= 1) finish();
    else tl.eventCallback('onComplete', finish);
  }, [ready, onDone]);

  return (
    <div className="preloader" ref={root} aria-hidden>
      <div className="pre-panel" />
      <div className="pre-panel" />
      <div className="pre-panel" />
      <div className="pre-inner">
        <img className="pre-logo" src="/images/logo-white.png" alt="" />
        <span className="pre-line" />
        <div className="pre-meta">
          <span>South Africa</span>
          <span ref={count}>000</span>
        </div>
      </div>
    </div>
  );
}
