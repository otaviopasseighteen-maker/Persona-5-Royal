const DATA_URL = '../data/guide.json?v=p5r-guide-20260917-4';
const STORAGE_KEY = 'p5r-guide-completed-v2';

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

function activityType(text, month) {
  if (month !== 'April') return 'normal';
  const value = String(text || '').toLowerCase();
  if (/(knowledge|knowledge rank|guts|guts rank|kindness|kindness rank|charm|charm rank|proficiency|proficiency rank|gain .*\+\d)/.test(value)) return 'stat';
  if (/(rank|confidant|spend time with|progress (death|magician|lovers|hierophant|chariot|fool)|magician rank|lovers rank|death rank|hierophant rank|chariot rank)/.test(value)) return 'relationship';
  if (/(palace|infiltration|shadow kamoshida|steal kamoshida|calling card|hideout|metaverse|treasure|shadow|seed|guardian|castle|heart)/.test(value)) return 'palace';
  if (/(book|read |borrow |dvd|rent |bio nutrient|nutrient|arginade|water of rebirth|silk yarn|tin clasp|lock pick|yakisoba pan|tv|items?|purchase|buy )/.test(value)) return 'item';
  return 'normal';
}

function activityList(slot, month) {
  const activities = Array.isArray(slot.activities) ? slot.activities : (slot.text ? [slot.text] : []);
  return `<ul class="guide-activities">${activities.map(activity => `<li class="guide-activity guide-activity-${activityType(activity, month.month)}">${escapeHtml(activity)}</li>`).join('')}</ul>`;
}

function slotGroup(slot) {
  const period = String(slot.period || 'Activity');
  const lower = period.toLowerCase();
  return lower.includes('evening') || lower.includes('night') ? 'night' : 'day';
}

function renderSlot(slot, month) {
  return `<section class="guide-schedule-slot ${slotGroup(slot)}"><h3>${escapeHtml(slot.period)}</h3>${activityList(slot, month)}</section>`;
}

function renderScheduleColumn(title, slots, month) {
  if (!slots.length) return `<section class="guide-schedule-column"><h3>${title}</h3><p class="guide-empty">No scheduled activity.</p></section>`;
  return `<section class="guide-schedule-column"><h3>${title}</h3>${slots.map(slot => renderSlot(slot, month)).join('')}</section>`;
}

function renderDay(month, day) {
  if (!day) return '<p>No guide data available for this date.</p>';
  const done = state.completed.has(dayKey(month, day));
  const slots = day.slots || [];
  const daySlots = slots.filter(slot => slotGroup(slot) === 'day');
  const nightSlots = slots.filter(slot => slotGroup(slot) === 'night');
  return `<article class="guide-day-detail"><header class="guide-date-header"><div><span>${escapeHtml(month.month)}</span><h2>${escapeHtml(day.date)} — ${escapeHtml(day.label)}</h2></div><button type="button" data-guide-complete>${done ? '✓ Day Completed' : 'Mark Day Complete'}</button></header><div class="guide-schedule">${renderScheduleColumn('Daytime', daySlots, month)}${renderScheduleColumn('Night', nightSlots, month)}</div></article>`;
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
  target.innerHTML = `<div class="breadcrumb"><a href="../index.html">Home</a> <span>›</span> <strong>Guide</strong></div><header class="guide-header"><p>Persona 5 Royal 100% Perfect Schedule</p><h1>${escapeHtml(month?.month || 'Guide')}</h1><p>Follow each date in order. Every action is listed individually so you can check the schedule while playing.</p></header><section class="guide-progress"><div><strong>Schedule Progress</strong><span>${p.done}/${p.total} days completed · ${p.percent}%</span></div><div class="guide-progress-bar"><span style="width:${p.percent}%"></span></div></section><nav class="guide-month-tabs" aria-label="Guide months">${renderMonthTabs()}</nav><section class="guide-layout"><aside class="guide-calendar"><h2>${escapeHtml(month?.month || '')}</h2><div class="guide-day-list">${month ? renderDayList(month) : ''}</div></aside><div class="guide-content">${renderDay(month, day)}</div></section>`;

  target.querySelectorAll('[data-guide-month]').forEach(button => button.addEventListener('click', () => { state.monthIndex = Number(button.dataset.guideMonth); state.dayIndex = 0; render(); }));
  target.querySelectorAll('[data-guide-day]').forEach(button => button.addEventListener('click', () => { state.dayIndex = Number(button.dataset.guideDay); render(); }));
  target.querySelector('[data-guide-complete]')?.addEventListener('click', () => { const key = dayKey(month, day); state.completed.has(key) ? state.completed.delete(key) : state.completed.add(key); saveCompleted(); render(); });
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
