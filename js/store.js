/* =========================================================
   EdgeStudy study data: journal, tracker, XP, quests, planner.
   Saved per user on this device through Store. To move this to
   Supabase later, only Store.get / Store.set need to change.
   ========================================================= */
const pad2 = n => String(n).padStart(2, '0');
const dayKey = (d = new Date()) => { const x = new Date(d); return `${x.getFullYear()}-${pad2(x.getMonth() + 1)}-${pad2(x.getDate())}`; };
const parseDay = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const shiftDay = (k, n) => { const d = parseDay(k); d.setDate(d.getDate() + n); return dayKey(d); };
const mondayOf = k => { const d = parseDay(k); return shiftDay(k, -((d.getDay() + 6) % 7)); };
const dur = s => { s = Math.floor(s); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return h ? `${h}h ${m}m` : m ? `${m}m` : `${s}s`; };
const clock = s => { s = Math.floor(s); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return h ? `${h}:${pad2(m)}:${pad2(x)}` : `${m}:${pad2(x)}`; };

const Bus = {
  h: {},
  on(e, f) { (this.h[e] ??= []).push(f); },
  emit(e, d) { (this.h[e] || []).forEach(f => { try { f(d); } catch (err) { console.error(err); } }); }
};

const Store = {
  uid: 'guest', cache: {},
  bind(id) { this.uid = id || 'guest'; this.cache = {}; },
  get(k, def) {
    if (k in this.cache) return this.cache[k];
    let v = def;
    try { const raw = localStorage.getItem(`es:${this.uid}:${k}`); if (raw) v = JSON.parse(raw); } catch (e) {}
    return (this.cache[k] = v);
  },
  set(k, v) { this.cache[k] = v; try { localStorage.setItem(`es:${this.uid}:${k}`, JSON.stringify(v)); } catch (e) {} },
  global(k, v) {
    try {
      if (v === undefined) return JSON.parse(localStorage.getItem(`es:${k}`) || 'null');
      v === null ? localStorage.removeItem(`es:${k}`) : localStorage.setItem(`es:${k}`, JSON.stringify(v));
    } catch (e) { return null; }
  }
};

const Prefs = {
  get() { return Store.get('prefs', { subjects: [], exam: '' }); },
  set(p) { Store.set('prefs', { ...this.get(), ...p }); },
  adoptPending() {
    const p = Store.global('pending');
    if (p && !this.get().subjects.length) this.set(p);
    if (p) Store.global('pending', null);
  }
};

const itemKey = c => `${c.s}|${c.c}|${c.tab}`;
const PART = { theory: 'Theory', questions: 'Important questions', revision: 'Quick revision', any: 'Any part', focus: 'Focus session' };

const Journal = {
  all() { return Store.get('journal', {}); },
  day(k = dayKey()) { const a = this.all(); return (a[k] ??= { sec: 0, items: {}, log: [], note: '', quests: [] }); },
  peek(k) { return this.all()[k] || { sec: 0, items: {}, log: [], note: '', quests: [] }; },
  save() { Store.set('journal', this.all()); },
  log(e) { const d = this.day(); d.log.push({ t: Date.now(), ...e }); if (d.log.length > 300) d.log.shift(); this.save(); Bus.emit('log', e); },
  add(key, s) { const d = this.day(); d.sec += s; d.items[key] = (d.items[key] || 0) + s; },
  streak() {
    const a = this.all(); let k = dayKey(), n = 0;
    if ((a[k]?.sec || 0) < 300) k = shiftDay(k, -1);
    while ((a[k]?.sec || 0) >= 300) { n++; k = shiftDay(k, -1); }
    return n;
  },
  range(fromKey, days) { const out = []; for (let i = 0; i < days; i++) { const k = shiftDay(fromKey, i); out.push([k, this.peek(k)]); } return out; },
  bySubject(entries) {
    const m = {};
    for (const [, d] of entries) for (const [k, v] of Object.entries(d.items)) { const s = k.split('|')[0]; m[s] = (m[s] || 0) + v; }
    return m;
  },
  lastOpened() {
    const a = this.all();
    for (const k of Object.keys(a).sort().reverse()) {
      const e = [...a[k].log].reverse().find(x => x.k === 'open');
      if (e) return e;
    }
    return null;
  }
};

const XP = {
  get() { return Store.get('xp', { total: 0 }); },
  level(t = this.get().total) {
    let l = 1, need = 100, acc = 0;
    while (t >= acc + need) { acc += need; l++; need = Math.round(need * 1.25); }
    return { l, into: t - acc, need };
  },
  add(n, why) {
    const x = this.get(), before = this.level(x.total).l;
    x.total += n; Store.set('xp', x);
    const after = this.level(x.total).l, levelUp = after > before;
    if (levelUp) Journal.log({ k: 'level', m: after });
    Bus.emit('xp', { n, why, levelUp, level: after });
  }
};

const QUESTS = [
  { id: 'time', t: 'Study for 20 minutes', goal: 1200, a: 'var(--mint)', xp: 40, val: d => d.sec, fmt: (v, g) => `${Math.floor(v / 60)} / ${g / 60} min` },
  { id: 'loop', t: 'Open theory, questions and revision', goal: 3, a: 'var(--amber)', xp: 30,
    val: d => new Set(Object.keys(d.items).map(k => k.split('|')[2]).filter(t => t !== 'focus')).size, fmt: (v, g) => `${v} / ${g} parts` },
  { id: 'plan', t: 'Finish one planned task', goal: 1, a: 'var(--violet)', xp: 30, val: () => Planner.doneOn(dayKey()), fmt: (v, g) => `${v} / ${g} task` }
];
const Quests = {
  list() { const d = Journal.day(); return QUESTS.map(q => { const v = Math.min(q.goal, q.val(d)); return { ...q, v, done: v >= q.goal }; }); },
  check() {
    const d = Journal.day(); d.quests ??= [];
    for (const q of this.list()) if (q.done && !d.quests.includes(q.id)) {
      d.quests.push(q.id); Journal.log({ k: 'quest', label: q.t }); XP.add(q.xp, 'Quest complete: ' + q.t);
    }
  }
};

const Planner = {
  all() { return Store.get('plan', []); },
  on(day) { return this.all().filter(t => t.day === day); },
  add(t) {
    const a = this.all(), item = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), done: false, ...t };
    a.push(item); Store.set('plan', a); Journal.log({ k: 'plan', s: t.s, c: t.c, tab: t.tab, m: t.min }); return item;
  },
  remove(id) { Store.set('plan', this.all().filter(t => t.id !== id)); Bus.emit('plan'); },
  spent(t) {
    const d = Journal.peek(t.day);
    if (t.tab === 'any') return Object.entries(d.items).filter(([k]) => k.startsWith(`${t.s}|${t.c}|`)).reduce((a, [, v]) => a + v, 0);
    return d.items[`${t.s}|${t.c}|${t.tab}`] || 0;
  },
  toggle(id, force) {
    const a = this.all(), t = a.find(x => x.id === id); if (!t) return;
    const v = force ?? !t.done; if (v === t.done) return;
    t.done = v; Store.set('plan', a);
    if (v) { Journal.log({ k: 'done', s: t.s, c: t.c, tab: t.tab }); XP.add(20, 'Planned task finished'); Quests.check(); }
    Bus.emit('plan', { id, done: v });
  },
  auto() { for (const t of this.on(dayKey())) if (!t.done && this.spent(t) >= t.min * 60) this.toggle(t.id, true); },
  doneOn(day) { return this.on(day).filter(t => t.done).length; }
};

const Focus = {
  len: 1500, left: 1500, running: false, end: 0,
  set(min) { if (this.running) return; this.len = this.left = min * 60; Bus.emit('focus'); },
  start() { if (this.running) return; this.running = true; this.end = Date.now() + this.left * 1000; Journal.log({ k: 'focus-start', m: Math.round(this.left / 60) }); Bus.emit('focus'); },
  pause() { if (!this.running) return; this.left = this.remaining(); this.running = false; Bus.emit('focus'); },
  reset() { this.running = false; this.left = this.len; Bus.emit('focus'); },
  remaining() { return this.running ? Math.max(0, (this.end - Date.now()) / 1000) : this.left; },
  step() {
    if (!this.running || this.remaining() > 0) return;
    this.running = false; this.left = this.len;
    Journal.log({ k: 'focus', m: Math.round(this.len / 60) }); XP.add(30, 'Focus session complete');
    Bus.emit('focus'); Bus.emit('focusDone');
  }
};

/* Records study time only while a chapter is open, the tab is visible and the
   student was active in the last 90 seconds, or while a focus session runs. */
const Tracker = {
  ctx: null, last: Date.now(), lastTick: Date.now(), idle: false, n: 0,
  init() {
    ['pointerdown', 'keydown', 'scroll', 'wheel', 'touchstart'].forEach(e => addEventListener(e, () => this.wake(), { passive: true }));
    document.addEventListener('visibilitychange', () => { if (document.hidden) Journal.save(); else this.wake(); });
    addEventListener('pagehide', () => Journal.save());
    setInterval(() => this.tick(), 1000);
  },
  wake() { this.last = Date.now(); if (this.idle) { this.idle = false; Bus.emit('idle', false); } },
  active() { return !document.hidden && Date.now() - this.last < 90000; },
  start(ctx) {
    this.ctx = ctx; this.wake();
    const key = itemKey(ctx), d = Journal.day();
    const recent = [...d.log].reverse().find(e => e.k === 'open' && itemKey(e) === key);
    if (!recent || Date.now() - recent.t > 600000) Journal.log({ k: 'open', ...ctx });
    if (!(key in d.items)) { d.items[key] = 0; XP.add(5, `Opened ${PART[ctx.tab]}`); }
  },
  stop() { this.ctx = null; if (this.idle) { this.idle = false; Bus.emit('idle', false); } },
  tick() {
    const now = Date.now(), gap = (now - this.lastTick) / 1000; this.lastTick = now;
    Focus.step();
    if (Store.uid === 'guest' || (!this.ctx && !Focus.running)) return;
    let key, dt;
    if (this.ctx) {
      if (!this.active()) { if (!this.idle) { this.idle = true; Bus.emit('idle', true); } if (!Focus.running) return; }
      dt = Math.min(gap, 2);
      key = this.active() ? itemKey(this.ctx) : `Focus|${this.ctx.s}|focus`;
    } else { dt = Math.min(gap, 70); key = 'Focus||focus'; }
    const before = Journal.day().sec;
    Journal.add(key, dt);
    if (Math.floor(Journal.day().sec / 300) > Math.floor(before / 300)) XP.add(10, '5 more minutes studied');
    if (++this.n % 10 === 0) { Journal.save(); Planner.auto(); }
    Quests.check();
    Bus.emit('tick');
  }
};
