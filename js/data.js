const DATA_ROOT = '../data/';
const DATA_VERSION = 'p5r-personas-20260917';

export async function loadCollection(name) {
  const response = await fetch(`${DATA_ROOT}${name}.json?v=${DATA_VERSION}`, {
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`Could not load ${name}.json`);
  return response.json();
}
