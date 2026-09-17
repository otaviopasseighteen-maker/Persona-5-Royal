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

function renderCharacterList(data) {
  const selectedId = new URLSearchParams(window.location.search).get('id');
  const selected = data.find(character => character.id === selectedId);

  if (selected) {
    return renderCharacterDetail(selected);
  }

  const cards = data.map(character => `
    <article class="entity-link">
      <div>
        <h2>${escapeHtml(character.name)}</h2>
        <p>${escapeHtml(character.role)}</p>
      </div>
      <a href="characters.html?id=${encodeURIComponent(character.id)}">View Character</a>
    </article>
  `).join('');

  return `
    <div class="breadcrumb"><a href="../index.html">Home</a> <span>›</span> <strong>Characters</strong></div>
    <h1>Characters</h1>
    <p>Main Persona 5 Royal characters.</p>
    <div class="entity-list">${cards}</div>
  `;
}

function renderCharacterDetail(character) {
  const personaPage = `personas.html?id=${encodeURIComponent(character.personaId || '')}`;
  const hasPersona = Boolean(character.personaId);

  return `
    <div class="breadcrumb"><a href="../index.html">Home</a> <span>›</span> <a href="characters.html">Characters</a> <span>›</span> <strong>${escapeHtml(character.name)}</strong></div>
    <article class="character-detail">
      <h1>${escapeHtml(character.name)}</h1>
      <p><strong>Role:</strong> ${escapeHtml(character.role)}</p>
      ${hasPersona ? `
        <section class="character-persona-link">
          <h2>Persona</h2>
          <a href="${personaPage}">View ${escapeHtml(character.personaName || 'Persona')}</a>
        </section>
      ` : ''}
    </article>
  `;
}

function renderPersonaCard(persona) {
  const initialIndex = 0;
  const forms = persona.forms ?? [];
  const initial = forms[initialIndex];
  const formButtons = forms.map((form, index) => `
    <button class="persona-form-button${index === initialIndex ? ' active' : ''}" type="button"
      data-persona-form-index="${index}">
      ${escapeHtml(form.name)}
    </button>
  `).join('');

  return `
    <article class="persona-card" data-persona-id="${escapeHtml(persona.id)}">
      <header class="persona-heading">
        <div>
          <h2>${escapeHtml(persona.name)}</h2>
          <p><strong>Arcana:</strong> ${escapeHtml(persona.arcana)}</p>
          <p><strong>Character:</strong> <a href="characters.html?id=${encodeURIComponent(persona.characterId)}">${escapeHtml(persona.character)}</a></p>
        </div>
        <span class="persona-type">${escapeHtml(persona.type)}</span>
      </header>
      <div class="persona-form-selector" role="group" aria-label="${escapeHtml(persona.name)} evolution forms">
        ${formButtons}
      </div>
      <div class="persona-selected-form" data-persona-form-display>
        ${renderPersonaForm(persona, initial)}
      </div>
    </article>
  `;
}

function renderPersonaForm(persona, form) {
  if (!form) return '<p>No form data available.</p>';
  return `
    <div class="persona-form-detail">
      <div class="persona-form-stage">${escapeHtml(form.stage)}</div>
      <h3>${escapeHtml(form.name)}</h3>
      <p><strong>Arcana:</strong> ${escapeHtml(persona.arcana)}</p>
      <p><strong>Level:</strong> ${form.level == null ? '—' : `Lv. ${escapeHtml(form.level)}`}</p>
    </div>
  `;
}

function renderPersonas(data) {
  const selectedId = new URLSearchParams(window.location.search).get('id');
  const selected = selectedId ? data.find(persona => persona.id === selectedId) : null;

  if (selected) {
    return renderPersonaDetail(selected);
  }

  const cards = data.map(renderPersonaCard).join('');

  return `
    <div class="breadcrumb"><a href="../index.html">Home</a> <span>›</span> <strong>Personas</strong></div>
    <h1>Main Personas</h1>
    <p>Party Personas and their Royal evolution forms.</p>
    <div class="persona-list">${cards}</div>
  `;
}

function renderPersonaDetail(persona) {
  const forms = persona.forms ?? [];
  const initial = forms[0];
  const formButtons = forms.map((form, index) => `
    <button class="persona-form-button${index === 0 ? ' active' : ''}" type="button" data-persona-detail-form-index="${index}">
      ${escapeHtml(form.name)}
    </button>
  `).join('');

  return `
    <div class="breadcrumb"><a href="../index.html">Home</a> <span>›</span> <a href="personas.html">Personas</a> <span>›</span> <strong>${escapeHtml(initial?.name || persona.name)}</strong></div>
    <article class="persona-detail" data-persona-detail-id="${escapeHtml(persona.id)}">
      <header class="persona-heading">
        <div>
          <h1 data-persona-detail-title>${escapeHtml(initial?.name || persona.name)}</h1>
          <p><strong>Arcana:</strong> ${escapeHtml(persona.arcana)}</p>
          <p><strong>Character:</strong> <a href="characters.html?id=${encodeURIComponent(persona.characterId)}">${escapeHtml(persona.character)}</a></p>
        </div>
      </header>
      <div class="persona-form-selector" role="group" aria-label="${escapeHtml(persona.name)} evolution forms">
        ${formButtons}
      </div>
      <div class="persona-selected-form" data-persona-detail-display>
        ${renderPersonaForm(persona, initial)}
      </div>
    </article>
  `;
}

function setupPersonaInteractions(target, data) {
  target.querySelectorAll('[data-persona-id]').forEach(card => {
    const persona = data.find(item => item.id === card.dataset.personaId);
    if (!persona) return;
    const forms = persona.forms ?? [];
    const display = card.querySelector('[data-persona-form-display]');

    card.querySelectorAll('[data-persona-form-index]').forEach(button => {
      button.addEventListener('click', () => {
        const index = Number(button.dataset.personaFormIndex);
        const form = forms[index];
        if (!form || !display) return;
        card.querySelectorAll('[data-persona-form-index]').forEach((item, itemIndex) => {
          item.classList.toggle('active', itemIndex === index);
        });
        display.innerHTML = renderPersonaForm(persona, form);
      });
    });
  });

  target.querySelectorAll('[data-persona-detail-id]').forEach(card => {
    const persona = data.find(item => item.id === card.dataset.personaDetailId);
    if (!persona) return;
    const forms = persona.forms ?? [];
    const display = card.querySelector('[data-persona-detail-display]');
    const title = card.querySelector('[data-persona-detail-title]');

    card.querySelectorAll('[data-persona-detail-form-index]').forEach(button => {
      button.addEventListener('click', () => {
        const index = Number(button.dataset.personaDetailFormIndex);
        const form = forms[index];
        if (!form || !display) return;
        card.querySelectorAll('[data-persona-detail-form-index]').forEach((item, itemIndex) => {
          item.classList.toggle('active', itemIndex === index);
        });
        display.innerHTML = renderPersonaForm(persona, form);
        if (title) title.textContent = form.name;
      });
    });
  });
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
      setupPersonaInteractions(target, data);
      return;
    }

    if (page === 'characters') {
      const personas = await loadCollection('personas');
      const enrichedCharacters = data.map(character => {
        const persona = personas.find(item => item.characterId === character.id);
        return {
          ...character,
          personaId: persona?.id || '',
          personaName: persona?.name || ''
        };
      });
      target.innerHTML = renderCharacterList(enrichedCharacters);
      return;
    }

    target.innerHTML = `<h1>${page[0].toUpperCase() + page.slice(1)}</h1><pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>`;
  } catch (error) {
    target.innerHTML = `<h1>${page}</h1><p>Data connection error: ${escapeHtml(error.message)}</p>`;
  }
}
