import { useEffect } from 'react';
import ScrollReveal from 'scrollreveal';

const base = {
  distance: '40px',
  duration: 1400,
  easing: 'cubic-bezier(0.19, 1, 0.22, 1)',
  opacity: 0,
  viewFactor: 0.15,
  cleanup: false,
  reset: false,
};

/** Wires ScrollReveal to any element carrying data-sr (value: up | left | right | fade | zoom). */
export function useScrollReveal() {
  useEffect(() => {
    const sr = ScrollReveal();
    const groups: Record<string, scrollReveal.ScrollRevealObjectOptions> = {
      up: { origin: 'bottom' },
      left: { origin: 'left' },
      right: { origin: 'right' },
      fade: { distance: '0px' },
      zoom: { distance: '0px', scale: 0.92 },
    };
    Object.entries(groups).forEach(([key, opts]) => {
      const els = document.querySelectorAll<HTMLElement>(`[data-sr="${key}"]`);
      els.forEach((el) => {
        const delay = Number(el.dataset.srDelay ?? 0);
        sr.reveal(el, { ...base, ...opts, delay });
      });
    });
    return () => sr.destroy();
  }, []);
}
