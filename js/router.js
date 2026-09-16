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

function renderConfidants(data) {
  const params = new URLSearchParams(window.location.search);
  const selectedId = params.get('id');

  if (selectedId) {
    const confidant = data.find(item => item.id === selectedId);
    if (!confidant) {
      return `<h1>Confidants</h1><p>Confidant not found.</p><a href="confidants.html">Back to Confidants</a>`;
    }

    const ranks = (confidant.ranks ?? []).map((rank, index) => {
      const rankNumber = rank.rank ?? index + 1;
      const ability = rank.ability || 'No new ability';
      const effect = rank.effect || 'No effect information available.';

      return `
        <details class="rank-up">
          <summary>Rank ${escapeHtml(rankNumber)}</summary>
          <div class="rank-content">
            <p><strong>${escapeHtml(ability)}</strong></p>
            <p>${escapeHtml(effect)}</p>
          </div>
        </details>
      `;
    }).join('');

    return `
      <a href="confidants.html">← All Confidants</a>
      <h1>${escapeHtml(confidant.name)}</h1>
      <p><strong>Arcana:</strong> ${escapeHtml(confidant.arcana)}</p>
      <section class="rank-list">
        <h2>Rank-Up</h2>
        ${ranks}
      </section>
    `;
  }

  const cards = data.map(confidant => `
    <a class="entity-link" href="confidants.html?id=${encodeURIComponent(confidant.id)}">
      <strong>${escapeHtml(confidant.name)}</strong>
      <span>${escapeHtml(confidant.arcana)}</span>
    </a>
  `).join('');

  return `<h1>Confidants</h1><div class="entity-list">${cards}</div>`;
}

export async function renderPage(page, target) {
  if (!target || !pageMap[page]) return;

  target.innerHTML = `<h1>${page[0].toUpperCase() + page.slice(1)}</h1><p>Loading data...</p>`;

  try {
    const data = await loadCollection(pageMap[page]);

    if (page === 'confidants') {
      target.innerHTML = renderConfidants(data);
      return;
    }

    target.innerHTML = `<h1>${page[0].toUpperCase() + page.slice(1)}</h1><pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>`;
  } catch (error) {
    target.innerHTML = `<h1>${page}</h1><p>Data connection error: ${escapeHtml(error.message)}</p>`;
  }
}
