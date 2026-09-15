const links = [
  ['Characters', 'characters.html'],
  ['Personas', 'personas.html'],
  ['Shadows', 'shadows.html'],
  ['Palaces', 'palaces.html'],
  ['Confidants', 'confidants.html'],
  ['Skills', 'skills.html'],
  ['Items', 'items.html'],
  ['Guide', 'guide.html']
];

export function renderNavigation(target) {
  if (!target) return;
  const inPages = window.location.pathname.includes('/pages/');
  const prefix = inPages ? '' : 'pages/';
  const home = inPages ? '../index.html' : 'index.html';
  target.innerHTML = `<a href="${home}">Home</a> ${links.map(([label, href]) => `<a href="${prefix}${href}">${label}</a>`).join('')}`;
}
