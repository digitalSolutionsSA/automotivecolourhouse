export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({ top: id === 'home' ? 0 : el.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' });
}
