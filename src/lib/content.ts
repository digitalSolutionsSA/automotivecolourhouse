export const NAV = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'technology', label: 'Technology' },
  { id: 'journey', label: 'Our Journey' },
  { id: 'contact', label: 'Contact' },
] as const;

export const HERO_SLIDES = [
  {
    image: '/images/hero-sunset.jpg',
    focusX: 0.7,
    lines: [
      { text: 'Colour', weight: 'heavy' },
      { text: 'Freedom', weight: 'thin-taupe' },
      { text: 'Redefined.', weight: 'heavy' },
    ],
  },
  {
    image: '/images/hero-studio.jpg',
    focusX: 0.6,
    lines: [
      { text: 'The future of', weight: 'thin' },
      { text: 'Automotive', weight: 'bold' },
      { text: 'Colour.', weight: 'bold' },
    ],
  },
  {
    image: '/images/hero-silver.jpg',
    focusX: 0.62,
    lines: [
      { text: 'The future of', weight: 'thin' },
      { text: 'Automotive', weight: 'bold' },
      { text: 'Colour & Protection.', weight: 'bold' },
    ],
  },
] as const;

export const PILLARS = [
  {
    no: '01',
    title: 'Colour',
    icon: 'palette',
    text: 'Transform the appearance of a vehicle without committing to permanent paint.',
    image: '/images/card-red.jpg',
    focus: [0.5, 0.5] as [number, number],
    tint: [1, 0.55, 0.5] as [number, number, number],
  },
  {
    no: '02',
    title: 'Protection',
    icon: 'shield',
    text: 'A removable coating designed to help protect the original finish beneath.',
    image: '/images/card-drops.jpg',
    focus: [0.7, 0.4] as [number, number],
    tint: [0.9, 0.95, 1] as [number, number, number],
  },
  {
    no: '03',
    title: 'Expression',
    icon: 'diamond',
    text: 'Give vehicle owners greater freedom to change, personalise and refresh their vehicles.',
    image: '/images/card-grey.jpg',
    focus: [0.6, 0.5] as [number, number],
    tint: [1, 1, 1] as [number, number, number],
  },
] as const;
