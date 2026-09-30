import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from '../lib/gsap';
import { HERO_SLIDES } from '../lib/content';
import { scrollToId } from '../lib/scrollTo';
import { HeroScene } from '../three/HeroScene';
import { Arrow, Play } from './Icons';

interface Props {
  started: boolean;
  onReady: () => void;
  onVision: () => void;
}

const AUTOPLAY = 8;

export default function Hero({ started, onReady, onVision }: Props) {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<HeroScene | null>(null);
  const [slide, setSlide] = useState(0);
  const busy = useRef(false);
  const timer = useRef<gsap.core.Tween | null>(null);
  const first = useRef(true);

  useEffect(() => {
    scene.current = new HeroScene(
      canvas.current!,
      HERO_SLIDES.map((s) => ({ src: s.image, focusX: s.focusX })),
      onReady,
    );
    return () => scene.current?.dispose();
  }, [onReady]);

  const startTimer = useCallback((from: number) => {
    timer.current?.kill();
    const bar = root.current?.querySelector(`.hero-pager button:nth-child(${from + 1}) i`);
    root.current?.querySelectorAll('.hero-pager i').forEach((el) => gsap.set(el, { scaleY: 0 }));
    timer.current = gsap.fromTo(bar ?? {}, { scaleY: 0 }, {
      scaleY: 1,
      duration: AUTOPLAY,
      ease: 'none',
      onComplete: () => go((from + 1) % HERO_SLIDES.length),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = useCallback(
    (i: number) => {
      if (busy.current) return;
      busy.current = true;
      scene.current?.goTo(i);
      gsap.to(root.current!.querySelectorAll('.hero-line > span'), {
        yPercent: -110,
        duration: 0.7,
        stagger: 0.06,
        ease: 'power3.in',
        onComplete: () => setSlide(i),
      });
    },
    [],
  );

  // animate the new headline in after each slide change
  useLayoutEffect(() => {
    if (first.current) return;
    const lines = root.current!.querySelectorAll('.hero-line > span');
    gsap.fromTo(lines, { yPercent: 110 }, {
      yPercent: 0,
      duration: 1.1,
      stagger: 0.08,
      ease: 'expo.out',
      onComplete: () => {
        busy.current = false;
      },
    });
    startTimer(slide);
  }, [slide, startTimer]);

  // intro once the preloader lifts
  useEffect(() => {
    if (!started) return;
    scene.current?.intro();
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'expo.out' }, onComplete: () => { first.current = false; startTimer(0); } })
        .from('.hero-eyebrow', { opacity: 0, x: -30, duration: 1.4 }, 0.2)
        .from('.hero-line > span', { yPercent: 110, duration: 1.6, stagger: 0.12 }, 0.3)
        .from('.hero-copy', { opacity: 0, y: 30, duration: 1.4 }, 0.8)
        .from('.hero-actions > *', { opacity: 0, y: 30, duration: 1.4, stagger: 0.1 }, 0.95)
        .from('.hero-scroll, .hero-tags, .hero-pager', { opacity: 0, duration: 1.6 }, 1.2);

      // gentle parallax as the hero scrolls away
      gsap.to('.hero-content', {
        yPercent: -18,
        opacity: 0.2,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.to('.hero-canvas', {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, [started, startTimer]);

  const current = HERO_SLIDES[slide];

  return (
    <section className="hero" id="home" ref={root}>
      <canvas className="hero-canvas" ref={canvas} />
      <div className="hero-shade" />

      <div className="hero-content">
        <p className="hero-eyebrow eyebrow">
          Bespoke automotive finishes <span className="rule" />
        </p>
        <h1 className="hero-title" aria-label={current.lines.map((l) => l.text).join(' ')}>
          {current.lines.map((l, i) => (
            <span className={`hero-line w-${l.weight}`} key={`${slide}-${i}`} aria-hidden>
              <span>{l.text}</span>
            </span>
          ))}
        </h1>
        <p className="hero-copy">
          We are developing a specialist automotive coating business focused on bringing advanced peelable
          coating technology to South Africa.
        </p>
        <div className="hero-actions">
          <a href="#contact" className="btn btn-solid" onClick={(e) => { e.preventDefault(); scrollToId('contact'); }}>
            Follow our journey <Arrow />
          </a>
          <button className="play" onClick={onVision} data-cursor="Play">
            <span className="play-ring"><Play /></span>
            <span className="play-label">Watch<br />our vision</span>
          </button>
        </div>
      </div>

      <div className="hero-scroll">
        <span className="hero-scroll-line" />
        <span>Scroll</span>
      </div>

      <div className="hero-tags">
        <span>South Africa</span>
        <span className="rule" />
        <span>Colour</span>
        <span className="sep">|</span>
        <span>Protection</span>
        <span className="sep">|</span>
        <span>Transformation</span>
      </div>

      <div className="hero-pager" role="tablist" aria-label="Hero slides">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={slide === i}
            className={slide === i ? 'is-active' : ''}
            onClick={() => i !== slide && go(i)}
          >
            <span>0{i + 1}</span>
            <em><i /></em>
          </button>
        ))}
      </div>
    </section>
  );
}
