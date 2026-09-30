import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    document.body.classList.add('has-cursor');
    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.12, ease: 'power3' });
    const dy = gsap.quickTo(dot.current, 'y', { duration: 0.12, ease: 'power3' });
    const rx = gsap.quickTo(ring.current, 'x', { duration: 0.55, ease: 'power3' });
    const ry = gsap.quickTo(ring.current, 'y', { duration: 0.55, ease: 'power3' });
    const move = (e: PointerEvent) => {
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
      const t = e.target as HTMLElement;
      const controlEl = t.closest('a, button, input, textarea, select');
      const labelEl = t.closest<HTMLElement>('[data-cursor]');
      // never cover a clickable control with the big label disc (unless the control itself is labelled)
      const labelled = labelEl && (!controlEl || controlEl === labelEl) ? labelEl : null;
      const hot = !!controlEl || !!labelled;
      ring.current?.classList.toggle('is-hot', hot);
      ring.current?.classList.toggle('has-label', !!labelled);
      if (ring.current) ring.current.dataset.label = labelled?.dataset.cursor ?? '';
    };
    window.addEventListener('pointermove', move);
    return () => {
      window.removeEventListener('pointermove', move);
      document.body.classList.remove('has-cursor');
    };
  }, []);

  return (
    <>
      <div className="cursor-dot" ref={dot} />
      <div className="cursor-ring" ref={ring} />
    </>
  );
}
