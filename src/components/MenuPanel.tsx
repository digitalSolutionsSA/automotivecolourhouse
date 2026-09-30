import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { NAV } from '../lib/content';
import { scrollToId } from '../lib/scrollTo';
import { Close, Instagram, Mail } from './Icons';

interface Props {
  open: boolean;
  active: string;
  onClose: () => void;
}

/** Off-canvas navigation styled after the light sidebar concept. */
export default function MenuPanel({ open, active, onClose }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      tl.current = gsap
        .timeline({ paused: true })
        .set(root.current, { visibility: 'visible' })
        .fromTo('.menu-backdrop', { opacity: 0 }, { opacity: 1, duration: 0.6 })
        .fromTo('.menu-panel', { xPercent: -100 }, { xPercent: 0, duration: 0.9, ease: 'expo.out' }, 0)
        .fromTo('.menu-anim', { x: -30, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.05, duration: 0.7, ease: 'power3.out' }, 0.25);
    }, root);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!tl.current) return;
    if (open) tl.current.timeScale(1).play();
    else tl.current.timeScale(1.6).reverse();
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }, [open]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
    setTimeout(() => scrollToId(id), 350);
  };

  return (
    <div className="menu" ref={root} aria-hidden={!open}>
      <div className="menu-backdrop" onClick={onClose} />
      <aside className="menu-panel">
        <button className="menu-close menu-anim" onClick={onClose} aria-label="Close menu">
          <Close />
        </button>
        <img className="menu-logo menu-anim" src="/images/logo-black.png" alt="Automotive Colour House" />
        <nav className="menu-nav">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} className={`menu-anim ${active === n.id ? 'is-active' : ''}`} onClick={go(n.id)}>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="menu-foot">
          <p className="menu-anim">South Africa</p>
          <span className="menu-dash menu-anim" />
          <p className="menu-anim">
            Colour
            <br />
            Protection
            <br />
            Transformation
          </p>
          <div className="menu-social menu-anim">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <Instagram size={20} />
            </a>
            <a href="#contact" onClick={go('contact')} aria-label="Email">
              <Mail size={22} />
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}
