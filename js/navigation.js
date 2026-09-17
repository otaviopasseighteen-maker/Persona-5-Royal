const links = [
  ['Characters', 'characters.html'],
  ['Personas', 'personas.html'],
  ['Shadows', 'shadows.html'],
  ['Palaces', 'palaces.html'],
  ['Confidants', 'confidants.html']
];

export function renderNavigation(target) {
  if (!target) return;
  const path = window.location.pathname;
  const inPages = path.includes('/pages/');
  const inNestedPage = /\/pages\/(personas|characters|palaces|shadows)\//.test(path);
  const prefix = inNestedPage ? '../' : (inPages ? '' : 'pages/');
  const home = inNestedPage ? '../../index.html' : (inPages ? '../index.html' : 'index.html');
  target.innerHTML = `<a href="${home}">Home</a> ${links.map(([label, href]) => `<a href="${prefix}${href}">${label}</a>`).join('')}`;
}
