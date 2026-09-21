const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function createOverlay() {
  let overlay = document.querySelector('.p5r-page-transition');
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.className = 'p5r-page-transition';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `
    <div class="p5r-transition-slice p5r-transition-slice--one"></div>
    <div class="p5r-transition-slice p5r-transition-slice--two"></div>
    <div class="p5r-transition-red"></div>
    <div class="p5r-transition-label">TAKE YOUR HEART</div>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

function isInternalPageLink(link) {
  if (!link || link.target === '_blank' || link.hasAttribute('download')) return false;
  const raw = link.getAttribute('href');
  if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('tel:')) return false;

  const url = new URL(link.href, window.location.href);
  return url.origin === window.location.origin && !url.pathname.endsWith('.json');
}

function runExit(url) {
  const overlay = createOverlay();
  document.body.classList.add('p5r-is-leaving');

  requestAnimationFrame(() => {
    overlay.classList.add('is-active');
  });

  window.setTimeout(() => {
    window.location.href = url;
  }, reduceMotion ? 0 : 560);
}

function runIntro() {
  const overlay = createOverlay();

  if (reduceMotion) {
    overlay.classList.add('is-intro-done');
    return;
  }

  overlay.classList.add('is-intro');
  window.setTimeout(() => {
    overlay.classList.remove('is-intro');
    overlay.classList.add('is-intro-done');
  }, 520);
}

export function initPageTransitions() {
  createOverlay();
  runIntro();

  document.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!isInternalPageLink(link)) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const url = new URL(link.href, window.location.href);
    if (url.href === window.location.href) return;

    event.preventDefault();
    runExit(url.href);
  });
}
