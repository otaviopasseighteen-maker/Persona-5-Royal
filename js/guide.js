const DATA_URL = new URL('../data/guide.json?v=p5r-guide-20260917-1', import.meta.url);
const STORAGE_KEY = 'p5r-guide-completed-v1';

const state = { data: [], monthIndex: 0, dayIndex: 0, completed: new Set() };

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function loadCompleted() {
  try { state.completed = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); }
  catch { state.completed = new Set(); }
}

function saveCompleted() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.completed]));
}

function dayKey(month, day) { return `${month.month}-${day.date}`; }

function currentMonth() { return state.data[state.monthIndex]; }
function currentDay() { return currentMonth()?.days[state.dayIndex]; }

function renderNavigation() {
  const target = document.querySelector('#site-navigation');
  if (!target) return;
  target.innerHTML = '<a href="../index.html">Home</a> <a href="characters.html">Characters</a> <a href="personas.html">Personas</a> <a href="shadows.html">Shadows</a> <a href="palaces.html">Palaces</a> <a href="confidants.html">Confidants</a> <a href="guide.html">Guide</a>';
}

function renderMonthTabs() {
  return state.data.map((month, i) => `<button type="button" class="guide-month-button${i === state.monthIndex ? ' active' : ''}" data-guide-month="${i}">${escapeHtml(month.month)}</button>`).join('');
}

function renderDayList(month) {
  return month.days.map((day, i) => {
    const key = dayKey(month, day);
    const done = state.completed.has(key);
    return `<button type="button" class="guide-day-button${i === state.dayIndex ? ' active' : ''}${done ? ' completed' : ''}" data-guide-day="${i}"><strong>${escapeHtml(day.date)}</strong><span>${escapeHtml(day.label)}</span>${done ? '<small>✓</small>' : ''}</button>`;
  }).join('');
}

function renderDay(month, day) {
  if (!day) return '<p>No guide data available for this date.</p>';
  const key = dayKey(month, day);
  const done = state.completed.has(key);
  const slots = (day.slots || []).map(slot => `<section class="guide-slot"><h3>${escapeHtml(slot.period)}</h3><p>${escapeHtml(slot.text)}</p></section>`).join('');
  return `<article class="guide-day-detail">
    <header><p>${escapeHtml(month.month)}</p><h2>${escapeHtml(day.date)} — ${escapeHtml(day.label)}</h2></header>
    <div class="guide-day-actions"><button type="button" data-guide-complete>${done ? '✓ Day Completed' : 'Mark Day Complete'}</button></div>
    <div class="guide-slots">${slots}</div>
  </article>`;
}

function progress() {
  const total = state.data.reduce((sum, month) => sum + month.days.length, 0);
  const done = state.data.reduce((sum, month) => sum + month.days.filter(day => state.completed.has(dayKey(month, day))).length, 0);
  return { done, total, percent: total ? Math.round(done / total * 100) : 0 };
}

function render() {
  const target = document.querySelector('#app');
  if (!target) return;
  const month = currentMonth();
  const day = currentDay();
  const p = progress();
  target.innerHTML = `<div class="breadcrumb"><a href="../index.html">Home</a> <span>›</span> <strong>Guide</strong></div>
    <header class="guide-header"><p>Persona 5 Royal Walkthrough</p><h1>Calendar Guide</h1><p>Interactive daily walkthrough prototype. The schedule is being built month by month.</p></header>
    <section class="guide-progress"><div><strong>Prototype Progress</strong><span>${p.done}/${p.total} days completed · ${p.percent}%</span></div><div class="guide-progress-bar"><span style="width:${p.percent}%"></span></div></section>
    <nav class="guide-month-tabs" aria-label="Guide months">${renderMonthTabs()}</nav>
    <section class="guide-layout">
      <aside class="guide-calendar"><h2>${escapeHtml(month?.month || '')}</h2><div class="guide-day-list">${month ? renderDayList(month) : ''}</div></aside>
      <div class="guide-content">${renderDay(month, day)}</div>
    </section>`;

  target.querySelectorAll('[data-guide-month]').forEach(button => button.addEventListener('click', () => {
    state.monthIndex = Number(button.dataset.guideMonth); state.dayIndex = 0; render();
  }));
  target.querySelectorAll('[data-guide-day]').forEach(button => button.addEventListener('click', () => {
    state.dayIndex = Number(button.dataset.guideDay); render();
  }));
  target.querySelector('[data-guide-complete]')?.addEventListener('click', () => {
    const key = dayKey(month, day);
    state.completed.has(key) ? state.completed.delete(key) : state.completed.add(key);
    saveCompleted(); render();
  });
}

async function init() {
  renderNavigation();
  const target = document.querySelector('#app');
  if (!target) return;
  target.innerHTML = '<h1>Guide</h1><p>Loading walkthrough...</p>';
  try {
    const response = await fetch(DATA_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load guide data.');
    state.data = await response.json();
    loadCompleted();
    render();
  } catch (error) {
    target.innerHTML = `<h1>Guide</h1><p>Guide data error: ${escapeHtml(error.message)}</p>`;
  }
}

init();
