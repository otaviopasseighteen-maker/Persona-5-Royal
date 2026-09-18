const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animateIn(elements, options = {}) {
  if (reduceMotion) return;
  elements.forEach((el, index) => {
    el.animate(
      [
        { opacity: 0, transform: 'translateY(34px) rotate(-1.5deg) scale(.97)' },
        { opacity: 1, transform: 'translateY(0) rotate(0) scale(1)' }
      ],
      {
        duration: options.duration || 520,
        delay: (options.delay || 0) + index * (options.stagger || 55),
        easing: 'cubic-bezier(.16,1,.3,1)',
        fill: 'both'
      }
    );
  });
}

function addTilt(elements) {
  if (reduceMotion || !window.matchMedia('(pointer:fine)').matches) return;

  elements.forEach(card => {
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      card.style.setProperty('--tilt-x', (y * -3.5).toFixed(2) + 'deg');
      card.style.setProperty('--tilt-y', (x * 4).toFixed(2) + 'deg');
      card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    });

    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
      card.style.setProperty('--mx', '50%');
      card.style.setProperty('--my', '50%');
    });
  });
}

function addClickImpact() {
  document.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || reduceMotion || event.defaultPrevented) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || link.target === '_blank') return;

    const burst = document.createElement('span');
    burst.className = 'click-impact';
    burst.style.left = event.clientX + 'px';
    burst.style.top = event.clientY + 'px';
    document.body.appendChild(burst);

    burst.animate(
      [
        { opacity: .9, transform: 'translate(-50%,-50%) scale(.1) rotate(0deg)' },
        { opacity: 0, transform: 'translate(-50%,-50%) scale(8) rotate(35deg)' }
      ],
      { duration: 280, easing: 'cubic-bezier(.2,.8,.2,1)' }
    ).finished.then(() => burst.remove());
  }, { passive: true });
}

export function initMotion() {
  document.documentElement.classList.add('motion-ready');

  if (!reduceMotion) {
    const navItems = [...document.querySelectorAll('#site-navigation a')];
    const homeHero = document.querySelector('.home-hero');
    const sectionHeading = document.querySelector('.section-heading');
    const cards = [...document.querySelectorAll('.entity-link, .persona-card, .confidant-rank-card, article.character-detail, article.persona-detail, article.palace-detail, article.shadow-detail')];

    animateIn(navItems, { duration: 420, stagger: 45 });
    if (homeHero) {
      const heroParts = homeHero.querySelectorAll('.eyebrow, h1, .home-intro');
      animateIn([...heroParts], { duration: 650, delay: 180, stagger: 90 });
    }
    if (sectionHeading) animateIn([sectionHeading], { duration: 600, delay: 320 });
    animateIn(cards, { duration: 500, delay: 420, stagger: 70 });
    addTilt(cards);
    addClickImpact();
  }
}
