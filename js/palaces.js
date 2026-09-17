const DATA_ROOT = new URL('../data/', import.meta.url);
const VERSION = 'p5r-palaces-20260917-1';

async function load(name) {
  const response = await fetch(new URL(`${name}.json?v=${VERSION}`, DATA_ROOT), { cache: 'no-store' });
  if (!response.ok) throw new Error(`Could not load ${name}.json`);
  return response.json();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function currentId() {
  return document.body.dataset.id || '';
}

function navigationPrefix() {
  return window.location.pathname.includes('/pages/palaces/') ? '../' : '';
}

function homeLink() {
  return window.location.pathname.includes('/pages/palaces/') ? '../../index.html' : '../index.html';
}

function renderNavigation() {
  const target = document.querySelector('#site-navigation');
  if (!target) return;
  const prefix = navigationPrefix();
  target.innerHTML = `<a href="${homeLink()}">Home</a> <a href="${prefix}characters.html">Characters</a> <a href="${prefix}personas.html">Personas</a> <a href="${prefix}shadows.html">Shadows</a> <a href="${prefix}palaces.html">Palaces</a> <a href="${prefix}confidants.html">Confidants</a> <a href="${prefix}skills.html">Skills</a> <a href="${prefix}items.html">Items</a> <a href="${prefix}guide.html">Guide</a>`;
}

function renderList(palaces) {
  const cards = palaces.map(p => `
    <article class="entity-link">
      <div>
        <h2>${escapeHtml(p.name)}</h2>
        ${p.owner ? `<p><strong>Owner:</strong> ${escapeHtml(p.owner)}</p>` : ''}
        ${p.location ? `<p>${escapeHtml(p.location)}</p>` : ''}
      </div>
      <a href="palaces/${encodeURIComponent(p.id)}.html">View Palace</a>
    </article>`).join('');

  return `<div class="breadcrumb"><a href="../index.html">Home</a> <span>›</span> <strong>Palaces</strong></div>
    <h1>Palaces</h1>
    <p>Narrative information about the major locations of Persona 5 Royal.</p>
    <div class="entity-list">${cards}</div>`;
}

function renderDetail(p, shadows) {
  const shadow = shadows.find(s => s.id === p.shadowId);
  const shadowLink = shadow
    ? `<a href="../shadows/${encodeURIComponent(shadow.id)}.html">${escapeHtml(shadow.name)}</a>`
    : '';
  const isMementos = p.id === 'mementos';

  return `<div class="breadcrumb"><a href="../../index.html">Home</a> <span>›</span> <a href="../palaces.html">Palaces</a> <span>›</span> <strong>${escapeHtml(p.name)}</strong></div>
    <article class="palace-detail">
      <header>
        <h1>${escapeHtml(p.name)}</h1>
        ${p.owner ? `<p><strong>Owner:</strong> ${escapeHtml(p.owner)}</p>` : ''}
        ${p.location ? `<p><strong>Location:</strong> ${escapeHtml(p.location)}</p>` : ''}
        ${shadowLink ? `<p><strong>Shadow:</strong> ${shadowLink}</p>` : ''}
      </header>
      ${p.origin ? `<section><h2>Origin</h2><p>${escapeHtml(p.origin)}</p></section>` : ''}
      ${p.story ? `<section><h2>Story</h2><p>${escapeHtml(p.story)}</p></section>` : ''}
      ${isMementos
        ? `<section><h2>Objective</h2><p>${escapeHtml(p.objective)}</p></section>
           <section><h2>The Depths of Mementos</h2><p>${escapeHtml(p.depths)}</p></section>`
        : `<section><h2>Shadow / Ruler</h2><p>${escapeHtml(p.ruler)}</p></section>
           <section><h2>Outcome</h2><p>${escapeHtml(p.outcome)}</p></section>`}
    </article>`;
}

async function init() {
  const target = document.querySelector('#app');
  if (!target) return;
  renderNavigation();
  target.innerHTML = '<h1>Palaces</h1><p>Loading data...</p>';

  try {
    const [palaces, shadows] = await Promise.all([load('palaces'), load('shadows')]);
    const selected = palaces.find(p => p.id === currentId());
    target.innerHTML = selected ? renderDetail(selected, shadows) : renderList(palaces);
  } catch (error) {
    target.innerHTML = `<h1>Palaces</h1><p>Data connection error: ${escapeHtml(error.message)}</p>`;
  }
}

init();
