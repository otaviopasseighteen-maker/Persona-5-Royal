const sections = [
  ['Characters', 'characters'], ['Personas', 'personas'], ['Shadows', 'shadows'],
  ['Palaces', 'palaces'], ['Confidants', 'confidants'], ['Skills', 'skills'],
  ['Items', 'items'], ['Guide', 'guide']
];

export function renderHome(target) {
  if (!target) return;
  target.className = 'entity-list';
  target.innerHTML = sections.map(([label, key]) =>
    `<a class="entity-link" href="pages/${key}.html">${label}</a>`
  ).join('');
}
