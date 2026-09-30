import { useEffect, useRef, useState } from 'react';
import { NAV } from '../lib/content';
import { scrollToId } from '../lib/scrollTo';
import { Arrow } from './Icons';

interface Props {
  active: string;
  onMenu: () => void;
}

export default function Header({ active, onMenu }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const last = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 500 && y > last.current);
      last.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const link = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToId(id);
  };

  return (
    <header className={`header ${scrolled ? 'is-scrolled' : ''} ${hidden ? 'is-hidden' : ''}`}>
      <a href="#home" className="header-logo" onClick={link('home')} aria-label="Automotive Colour House — home">
        <img src="/images/logo-white.png" alt="Automotive Colour House" />
      </a>
      <nav className="header-nav" aria-label="Primary">
        {NAV.map((n) => (
          <a key={n.id} href={`#${n.id}`} className={active === n.id ? 'is-active' : ''} onClick={link(n.id)}>
            {n.label}
          </a>
        ))}
      </nav>
      <a href="#contact" className="btn btn-outline header-cta" onClick={link('contact')}>
        Follow our journey <Arrow size={20} />
      </a>
      <button className="header-burger" onClick={onMenu} aria-label="Open menu">
        <span />
        <span />
      </button>
    </header>
  );
}
