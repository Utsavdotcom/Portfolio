(() => {
  'use strict';
  const toggle = document.getElementById('menu-icon');
  const menu = document.getElementById('menu');
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('show');
    toggle.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  menu.addEventListener('click', (event) => {
    if (!event.target.closest('a')) return;
    menu.classList.remove('show');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
  });
  const top = document.querySelector('.back-to-top');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function updateTop() {
    top.classList.toggle('is-visible', window.scrollY > 300);
  }
  window.addEventListener('scroll', updateTop, { passive: true });
  updateTop();
  top.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: reduced.matches ? 'instant' : 'smooth' }),
  );
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ target, intersectionRatio, boundingClientRect }) => {
        if (reduced.matches) {
          target.style.transform = '';
          return;
        }
        const distance = Math.abs(
          boundingClientRect.top + boundingClientRect.height / 2 - window.innerHeight / 2,
        );
        const scale = Math.max(
          0.7,
          Math.min(1, 0.7 + (1 - distance / (window.innerHeight / 2)) * 0.3),
        );
        target.style.transform = `scale(${scale})`;
        target.classList.toggle('in-view', intersectionRatio > 0.5);
      });
    },
    { threshold: Array.from({ length: 21 }, (_, i) => i / 20) },
  );
  document.querySelectorAll('.project').forEach((project) => observer.observe(project));
})();
