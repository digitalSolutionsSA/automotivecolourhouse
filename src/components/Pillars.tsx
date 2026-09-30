import { useEffect, useRef } from 'react';
import { PILLARS } from '../lib/content';
import { GLImage } from '../three/GLImage';
import { ICONS } from './Icons';

function Pillar({ p, index }: { p: (typeof PILLARS)[number]; index: number }) {
  const host = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const gl = new GLImage(canvas.current!, host.current!, p.image, { focus: p.focus, tint: p.tint });
    return () => gl.dispose();
  }, [p]);

  const Icon = ICONS[p.icon];
  return (
    <article className="pillar" ref={host} data-sr="fade" data-sr-delay={index * 150}>
      <canvas className="pillar-canvas" ref={canvas} />
      <div className="pillar-shade" />
      <div className="pillar-body">
        <div className="pillar-top">
          <Icon />
          <span className="pillar-no">{p.no}</span>
        </div>
        <span className="dash" />
        <h3>{p.title}</h3>
        <p>{p.text}</p>
      </div>
    </article>
  );
}

export default function Pillars() {
  return (
    <section className="pillars" aria-label="What we offer">
      {PILLARS.map((p, i) => (
        <Pillar key={p.no} p={p} index={i} />
      ))}
    </section>
  );
}
