import { useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/gsap';
import { PanelShowcase, FINISHES } from '../three/PanelShowcase';

const COLOURS = [
  { name: 'Graphite Black', hex: '#161618', metal: 0.5 },
  { name: 'Chalk Grey', hex: '#a3a5a6', metal: 0.25 },
  { name: 'Rosso Corsa', hex: '#b1111c', metal: 0.2 },
  { name: 'Midnight Blue', hex: '#1c2d57', metal: 0.4 },
  { name: 'Racing Green', hex: '#1f4a34', metal: 0.35 },
  { name: 'Liquid Bronze', hex: '#8a5a2e', metal: 0.7 },
  { name: 'Pearl White', hex: '#ecE9e2', metal: 0.15 },
];

const FEATURES = [
  { no: '01', title: 'Peelable', text: 'A sprayable coating that can be removed when you are ready for something new.' },
  { no: '02', title: 'Protective', text: 'A sacrificial layer designed to help shield the factory finish beneath.' },
  { no: '03', title: 'Limitless', text: 'Gloss, satin or matte — in virtually any colour you can imagine.' },
  { no: '04', title: 'Reversible', text: 'Change your look without the permanence of a traditional respray.' },
];

export default function Technology() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const shape = useRef<PanelShowcase | null>(null);
  const [colour, setColour] = useState(0);
  const [finish, setFinish] = useState('Gloss');

  useEffect(() => {
    shape.current = new PanelShowcase(canvas.current!, stage.current!);
    shape.current.setColor(COLOURS[0].hex, COLOURS[0].metal);
    const ctx = gsap.context(() => {
      gsap.from('.tech-title .line > span', {
        yPercent: 110,
        duration: 1.4,
        stagger: 0.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.tech-title', start: 'top 80%' },
      });
      gsap.from('.tech-stage', {
        opacity: 0,
        scale: 0.9,
        duration: 2,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.tech-stage', start: 'top 80%' },
      });
    }, root);
    return () => {
      ctx.revert();
      shape.current?.dispose();
    };
  }, []);

  const pickColour = (i: number) => {
    setColour(i);
    shape.current?.setColor(COLOURS[i].hex, COLOURS[i].metal);
    gsap.fromTo('.tech-colour-name', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6 });
  };

  const pickFinish = (f: string) => {
    setFinish(f);
    shape.current?.setFinish(f);
  };

  return (
    <section className="tech" id="technology" ref={root}>
      <div className="tech-head">
        <p className="eyebrow" data-sr="left">
          The technology <span className="rule" />
        </p>
        <h2 className="tech-title">
          <span className="line thin"><span>Colour that</span></span>
          <span className="line heavy"><span>Peels away.</span></span>
        </h2>
        <p className="tech-intro" data-sr="up">
          Peelable coatings are sprayed like paint and cure into a durable, flexible skin. When it's time for a
          change, the finish can be removed — revealing the original paintwork underneath.
        </p>
      </div>

      <div className="tech-stage" ref={stage}>
        <canvas ref={canvas} data-cursor="Drag" />
        <div className="tech-glow" />
        <div className="tech-ui">
          <div className="tech-colour">
            <span className="tech-label">Colour</span>
            <span className="tech-colour-name">{COLOURS[colour].name}</span>
          </div>
          <div className="tech-swatches" role="radiogroup" aria-label="Colour">
            {COLOURS.map((c, i) => (
              <button
                key={c.name}
                role="radio"
                aria-checked={colour === i}
                aria-label={c.name}
                className={colour === i ? 'is-active' : ''}
                style={{ '--sw': c.hex } as React.CSSProperties}
                onClick={() => pickColour(i)}
              />
            ))}
          </div>
          <div className="tech-finish" role="radiogroup" aria-label="Finish">
            {Object.keys(FINISHES).map((f) => (
              <button key={f} role="radio" aria-checked={finish === f} className={finish === f ? 'is-active' : ''} onClick={() => pickFinish(f)}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <span className="tech-hint">Drag to rotate</span>
      </div>

      <div className="tech-features">
        {FEATURES.map((f, i) => (
          <div className="tech-feature" key={f.no} data-sr="up" data-sr-delay={i * 120}>
            <span className="tech-no">{f.no}</span>
            <span className="dash" />
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
