const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('mainNav');

menuToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuToggle.textContent = isOpen ? '×' : '☰';
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
});

nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuToggle.textContent = '☰';
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menú');
}));

document.getElementById('year').textContent = new Date().getFullYear();

// Acordeón: mantiene una sola respuesta abierta para facilitar la lectura.
document.querySelectorAll('.faq-list details').forEach(item => {
  item.addEventListener('toggle', () => {
    if (item.open) document.querySelectorAll('.faq-list details').forEach(other => {
      if (other !== item) other.open = false;
    });
  });
});

// Barra superior de avance de lectura.
const progress = document.createElement('div');
progress.className = 'scroll-progress';
progress.setAttribute('aria-hidden', 'true');
document.body.appendChild(progress);
const updateProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${scrollable > 0 ? Math.min(100, window.scrollY / scrollable * 100) : 0}%`;
};
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// Entrada progresiva de contenidos.
const revealTargets = document.querySelectorAll('.section-heading, .service-card, .plan-card, .notice, .bot-copy, .bot-demo, .guarantee-card, .faq-list details, .final-inner');
if ('IntersectionObserver' in window) {
  document.documentElement.classList.add('reveal-ready');
  const revealObserver = new IntersectionObserver((entries, observer) => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
  revealTargets.forEach(el => { el.classList.add('reveal'); revealObserver.observe(el); });
} else revealTargets.forEach(el => el.classList.add('is-visible'));

// Navegación contextual: resalta la sección que está viendo la persona.
const sectionLinks = [...nav.querySelectorAll('a[href^="#"]')];
const sections = sectionLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    sectionLinks.forEach(link => {
      const active = link.getAttribute('href') === `#${entry.target.id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }), { rootMargin: '-28% 0px -62% 0px' });
  sections.forEach(section => sectionObserver.observe(section));
}

// Demo interactiva: permite seleccionar una tarjeta ilustrativa, sin conectarse a apps ni aceptar viajes.
const opportunityRows = document.querySelectorAll('[data-opportunity]');
const demoSelection = document.getElementById('demoSelection');
const selectOpportunity = row => {
  opportunityRows.forEach(item => {
    const selected = item === row;
    item.classList.toggle('selected', selected);
    item.setAttribute('aria-pressed', String(selected));
  });
  const name = row.querySelector('.order-main b')?.textContent || `Oportunidad ${row.dataset.opportunity}`;
  demoSelection.textContent = `${name} seleccionada · Ejemplo ficticio para mostrar la interfaz.`;
};
opportunityRows.forEach(row => {
  row.addEventListener('click', () => selectOpportunity(row));
  row.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectOpportunity(row); }
  });
});

// Inclinación muy sutil en escritorio; desactivada en pantallas táctiles y movimiento reducido.
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (finePointer && !reduceMotion) {
  document.querySelectorAll('.service-card, .plan-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      card.style.transform = `perspective(900px) rotateX(${-y * 2.2}deg) rotateY(${x * 2.2}deg) translateY(-5px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}
