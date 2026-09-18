const DATA_ROOT = new URL('../data/', import.meta.url);
const DATA_VERSION = 'p5r-data-20260918-3';

export async function loadCollection(name) {
  const url = new URL(`${name}.json?v=${DATA_VERSION}`, DATA_ROOT);
  const response = await fetch(url, {
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`Could not load ${name}.json`);
  return response.json();
}
