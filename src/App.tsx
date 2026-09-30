import { useCallback, useEffect, useState } from 'react';
import { ScrollTrigger } from './lib/gsap';
import { NAV } from './lib/content';
import { useScrollReveal } from './hooks/useScrollReveal';
import Preloader from './components/Preloader';
import Cursor from './components/Cursor';
import Header from './components/Header';
import MenuPanel from './components/MenuPanel';
import Hero from './components/Hero';
import Pillars from './components/Pillars';
import Marquee from './components/Marquee';
import Building from './components/Building';
import Technology from './components/Technology';
import Journey from './components/Journey';
import Contact from './components/Contact';
import Footer from './components/Footer';
import VisionModal from './components/VisionModal';

export default function App() {
  const [assetsReady, setAssetsReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [menu, setMenu] = useState(false);
  const [vision, setVision] = useState(false);
  const [active, setActive] = useState('home');

  useScrollReveal();

  const onReady = useCallback(() => setAssetsReady(true), []);
  const onDone = useCallback(() => setStarted(true), []);
  const closeMenu = useCallback(() => setMenu(false), []);
  const closeVision = useCallback(() => setVision(false), []);

  // never block the site if an image is slow
  useEffect(() => {
    const t = setTimeout(() => setAssetsReady(true), 6000);
    return () => clearTimeout(t);
  }, []);

  // scroll-spy for the nav
  useEffect(() => {
    const triggers = NAV.map((n) =>
      ScrollTrigger.create({
        trigger: `#${n.id}`,
        start: 'top 45%',
        end: 'bottom 45%',
        onToggle: (self) => self.isActive && setActive(n.id),
      }),
    );
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    return () => {
      triggers.forEach((t) => t.kill());
      window.removeEventListener('load', refresh);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('is-loading', !started);
    if (started) ScrollTrigger.refresh();
  }, [started]);

  return (
    <>
      <Preloader ready={assetsReady} onDone={onDone} />
      <Cursor />
      <Header active={active} onMenu={() => setMenu(true)} />
      <MenuPanel open={menu} active={active} onClose={closeMenu} />
      <main>
        <Hero started={started} onReady={onReady} onVision={() => setVision(true)} />
        <Pillars />
        <Marquee />
        <Building />
        <Technology />
        <Journey />
        <Contact />
      </main>
      <Footer />
      <VisionModal open={vision} onClose={closeVision} />
    </>
  );
}
