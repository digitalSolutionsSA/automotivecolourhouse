type P = { size?: number; className?: string };
const s = (size = 34) => ({ width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const });

export const Palette = ({ size, className }: P) => (
  <svg viewBox="0 0 40 40" {...s(size)} className={className}>
    <path d="M20 5C11.7 5 5 11.3 5 19.2c0 7.8 6.2 14.3 14.2 14.3 2 0 2.8-1.2 2.8-2.4 0-1.6-1.3-2.1-1.3-3.6 0-1.3 1-2.3 2.4-2.3h3.3C31.6 25.2 35 21.6 35 17 35 10.3 28.3 5 20 5Z" />
    <circle cx="12.5" cy="18" r="2" /><circle cx="16.5" cy="11.5" r="2" /><circle cx="24" cy="11" r="2" /><circle cx="29" cy="16.5" r="2" />
    <path d="M34.5 3.5 26 14" /><path d="M25 13.2c-1.6.2-2.6 1.5-2.4 3.4 1.8.1 3.2-.8 3.6-2.5" />
  </svg>
);

export const Shield = ({ size, className }: P) => (
  <svg viewBox="0 0 40 40" {...s(size)} className={className}>
    <path d="M20 4 7 9v9.5C7 27 12.5 33.5 20 36c7.5-2.5 13-9 13-17.5V9L20 4Z" />
    <path d="m14 19.5 4.3 4.3L26.5 15" />
  </svg>
);

export const Diamond = ({ size, className }: P) => (
  <svg viewBox="0 0 40 40" {...s(size)} className={className}>
    <path d="M11 7h18l7 9-16 18L4 16l7-9Z" /><path d="M4 16h32" /><path d="m15 16 5 18 5-18" /><path d="m11 7 4 9 5-9 5 9 4-9" />
  </svg>
);

export const Arrow = ({ size = 22, className }: P) => (
  <svg viewBox="0 0 24 12" width={size} height={size / 2} fill="none" stroke="currentColor" strokeWidth={1.2} className={className}>
    <path d="M0 6h22M17 1l5 5-5 5" />
  </svg>
);

export const Play = ({ size = 14 }: P) => (
  <svg viewBox="0 0 12 14" width={size * 0.86} height={size} fill="currentColor"><path d="M0 0l12 7-12 7z" /></svg>
);

export const Instagram = ({ size = 18 }: P) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.5}>
    <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
  </svg>
);

export const Mail = ({ size = 20 }: P) => (
  <svg viewBox="0 0 24 18" width={size} height={size * 0.75} fill="none" stroke="currentColor" strokeWidth={1.5}>
    <rect x="1" y="1" width="22" height="16" rx="1" /><path d="m1 1 11 9 11-9M1 17l8-7M23 17l-8-7" />
  </svg>
);

export const Close = ({ size = 22 }: P) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.2}><path d="M4 4l16 16M20 4 4 20" /></svg>
);

export const ICONS = { palette: Palette, shield: Shield, diamond: Diamond };
