import { loadCollection } from './data.js';

const pageMap = {
  characters: 'characters',
  personas: 'personas',
  shadows: 'shadows',
  palaces: 'palaces',
  confidants: 'confidants',
  skills: 'skills',
  items: 'items',
  guide: 'guide'
};

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderRankBox(rank) {
  const ability = rank?.ability || 'No new ability';
  const effect = rank?.effect || 'No effect information available.';
  return `
    <div class="rank-content">
      <div class="rank-label">Rank ${escapeHtml(rank?.rank ?? '')}</div>
      <p><strong>${escapeHtml(ability)}</strong></p>
      <p>${escapeHtml(effect)}</p>
    </div>
  `;
}

function renderConfidants(data) {
  const cards = data.map((confidant, confidantIndex) => {
    const ranks = confidant.ranks ?? [];
    const firstRank = ranks[0] ?? { rank: 1, ability: null, effect: 'No rank data available.' };
    const stars = ranks.map((rank, index) => `
      <button class="rank-star${index === 0 ? ' active' : ''}" type="button"
        data-confidant="${confidantIndex}" data-rank-index="${index}"
        aria-label="${escapeHtml(confidant.name)} Rank ${escapeHtml(rank.rank ?? index + 1)}">
        ★
      </button>
    `).join('');

    return `
      <section class="confidant-rank-card" data-confidant-card="${confidantIndex}">
        <header class="confidant-heading">
          <h2>${escapeHtml(confidant.name)}</h2>
          <p><strong>Arcana:</strong> ${escapeHtml(confidant.arcana)}</p>
        </header>
        <div class="rank-progress" role="group" aria-label="${escapeHtml(confidant.name)} Rank progression">
          ${stars}
        </div>
        <div class="selected-rank" data-rank-display="${confidantIndex}">
          ${renderRankBox(firstRank)}
        </div>
      </section>
    `;
  }).join('');

  return `
    <div class="breadcrumb"><a href="../index.html">Home</a> <span>›</span> <span>Confidants</span> <span>›</span> <strong>Rank-Up List</strong></div>
    <h1>Confidant Rank-Up List</h1>
    <p>Select a star to view the ability and effect for that Rank.</p>
    <div class="confidant-rank-list">${cards}</div>
  `;
}

function setupConfidantInteractions(target, data) {
  target.querySelectorAll('.rank-star').forEach(button => {
    button.addEventListener('click', () => {
      const confidantIndex = Number(button.dataset.confidant);
      const rankIndex = Number(button.dataset.rankIndex);
      const card = target.querySelector(`[data-confidant-card="${confidantIndex}"]`);
      const display = target.querySelector(`[data-rank-display="${confidantIndex}"]`);
      const ranks = data[confidantIndex]?.ranks ?? [];
      const rank = ranks[rankIndex];
      if (!card || !display || !rank) return;

      card.querySelectorAll('.rank-star').forEach((star, index) => {
        star.classList.toggle('active', index <= rankIndex);
      });

      display.innerHTML = renderRankBox(rank);
    });
  });
}

function renderPersonas(data) {
  const cards = data.map(persona => {
    const forms = (persona.forms ?? []).map(form => `
      <div class="persona-form">
        <div class="persona-form-stage">${escapeHtml(form.stage)}</div>
        <div class="persona-form-name">${escapeHtml(form.name)}</div>
        <div class="persona-form-level">${form.level == null ? '—' : `Lv. ${escapeHtml(form.level)}`}</div>
      </div>
    `).join('');

    return `
      <article class="persona-card">
        <header class="persona-heading">
          <div>
            <h2>${escapeHtml(persona.name)}</h2>
            <p><strong>Arcana:</strong> ${escapeHtml(persona.arcana)}</p>
            <p><strong>Character:</strong> ${escapeHtml(persona.character)}</p>
          </div>
          <span class="persona-type">${escapeHtml(persona.type)}</span>
        </header>
        <div class="persona-evolution">
          ${forms}
        </div>
      </article>
    `;
  }).join('');

  return `
    <div class="breadcrumb"><a href="../index.html">Home</a> <span>›</span> <strong>Personas</strong></div>
    <h1>Main Personas</h1>
    <p>Initial Personas and their Royal evolution forms.</p>
    <div class="persona-list">${cards}</div>
  `;
}

export async function renderPage(page, target) {
  if (!target || !pageMap[page]) return;

  target.innerHTML = `<h1>${page[0].toUpperCase() + page.slice(1)}</h1><p>Loading data...</p>`;

  try {
    const data = await loadCollection(pageMap[page]);

    if (page === 'confidants') {
      target.innerHTML = renderConfidants(data);
      setupConfidantInteractions(target, data);
      return;
    }

    if (page === 'personas') {
      target.innerHTML = renderPersonas(data);
      return;
    }

    target.innerHTML = `<h1>${page[0].toUpperCase() + page.slice(1)}</h1><pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>`;
  } catch (error) {
    target.innerHTML = `<h1>${page}</h1><p>Data connection error: ${escapeHtml(error.message)}</p>`;
  }
}
