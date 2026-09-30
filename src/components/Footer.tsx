import { NAV } from '../lib/content';
import { scrollToId } from '../lib/scrollTo';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <img className="footer-logo" src="/images/logo-white.png" alt="Automotive Colour House" data-sr="fade" />
        <nav className="footer-nav" aria-label="Footer">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={(e) => { e.preventDefault(); scrollToId(n.id); }}>
              {n.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Automotive Colour House</span>
        <span>Colour • Protection • Transformation</span>
        <span>South Africa</span>
      </div>
    </footer>
  );
}
