const links = [
  ['Characters', 'pages/characters.html'],
  ['Personas', 'pages/personas.html'],
  ['Shadows', 'pages/shadows.html'],
  ['Palaces', 'pages/palaces.html'],
  ['Confidants', 'pages/confidants.html'],
  ['Skills', 'pages/skills.html'],
  ['Items', 'pages/items.html'],
  ['Guide', 'pages/guide.html']
];

export function renderNavigation(target) {
  if (!target) return;
  target.innerHTML = `<a href="index.html">Home</a> ${links.map(([label, href]) => `<a href="../${href}">${label}</a>`).join('')}`;
}
