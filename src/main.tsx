import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// StrictMode is intentionally omitted: it double-mounts effects, which would spin up
// duplicate WebGL contexts and ScrollReveal instances in development.
createRoot(document.getElementById('root')!).render(<App />);
