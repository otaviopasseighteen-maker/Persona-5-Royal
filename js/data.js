const DATA_ROOT = '../data/';

export async function loadCollection(name) {
  const response = await fetch(`${DATA_ROOT}${name}.json`);
  if (!response.ok) throw new Error(`Could not load ${name}.json`);
  return response.json();
}
