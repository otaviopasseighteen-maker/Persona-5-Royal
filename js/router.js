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

export async function renderPage(page, target) {
  if (!target || !pageMap[page]) return;
  target.innerHTML = `<h1>${page[0].toUpperCase() + page.slice(1)}</h1><p>Loading data...</p>`;
  try {
    const data = await loadCollection(pageMap[page]);
    target.innerHTML = `<h1>${page[0].toUpperCase() + page.slice(1)}</h1><pre>${JSON.stringify(data, null, 2)}</pre>`;
  } catch (error) {
    target.innerHTML = `<h1>${page}</h1><p>Data connection error: ${error.message}</p>`;
  }
}
