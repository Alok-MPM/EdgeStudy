/* =========================================================
   EdgeStudy views: auth flow, dashboard, journal, planner,
   live HUD and chapter session strip.
   Uses globals from app.js at call time (SUBJECTS, shell, esc...).
   ========================================================= */
let holdRoute = false;
const chName = (s, c) => sub(s)?.ch[c] || 'Chapter';
const subColor = n => sub(n)?.c || 'var(--mint)';
const subTag = n => n === 'Focus' ? 'Fo' : sub(n)?.i || '..';
const CHECK = '<svg class="ck" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

function logText(e) {
  const ch = e.s ? esc(chName(e.s, e.c)) : '';
  switch (e.k) {
    case 'open': return `Opened <b>${PART[e.tab]}</b> in ${ch}`;
    case 'plan': return `Planned ${e.m} min of <b>${PART[e.tab]}</b> for ${ch}`;
    case 'done': return `Finished planned task <b>${ch}</b>`;
    case 'focus-start': return `Started a <b>${e.m}-minute</b> focus session`;
    case 'focus': return `Completed a <b>${e.m}-minute</b> focus session`;
    case 'quest': return `Quest complete: <b>${esc(e.label)}</b>`;
    case 'level': return `Reached <b>level ${e.m}</b>`;
  }
  return esc(e.k);
}
const logColor = e => e.s ? subColor(e.s) : ({ quest: 'var(--amber)', level: 'var(--violet)' }[e.k] || 'var(--mint)');
const tm = t => new Date(t).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
const logList = (log, n = 99) => log.length
  ? `<ol class="tline" data-stagger>${[...log].reverse().slice(0, n).map(e => `<li class="rv" data-rv="right" style="--a:${logColor(e)}"><time>${tm(e.t)}</time><span>${logText(e)}</span></li>`).join('')}</ol>`
  : '<p class="quiet">Nothing recorded yet. Open any chapter and your journal starts writing itself.</p>';

/* ---------- Live values: HUD, timers, quest bars ---------- */
const Live = {
  refresh() {
    const d = Journal.day(), lv = XP.level(), fr = Focus.remaining();
    document.querySelectorAll('[data-live]').forEach(el => {
      const k = el.dataset.live;
      if (k === 'today') el.textContent = dur(d.sec);
      else if (k === 'today-clock') el.textContent = clock(d.sec);
      else if (k === 'item') el.textContent = clock(d.items[el.dataset.key] || 0);
      else if (k === 'streak') el.textContent = Journal.streak();
      else if (k === 'level') el.textContent = lv.l;
      else if (k === 'plan') { const t = Planner.all().find(x => x.id === el.dataset.id); if (t) el.style.width = Math.min(100, Planner.spent(t) / (t.min * 60) * 100) + '%'; }
    });
    for (const q of Quests.list()) document.querySelectorAll(`[data-quest="${q.id}"]`).forEach(el => {
      el.classList.toggle('done', q.done); el.querySelector('i').style.width = (q.v / q.goal * 100) + '%'; el.querySelector('em').textContent = q.fmt(q.v, q.goal);
    });
    document.querySelectorAll('[data-focus=time]').forEach(el => (el.textContent = clock(Math.ceil(fr))));
    document.querySelectorAll('[data-focus=state]').forEach(el => (el.textContent = Focus.running ? 'Focusing' : fr < Focus.len ? 'Paused' : 'Ready'));
    document.querySelectorAll('[data-focus=toggle]').forEach(el => (el.textContent = Focus.running ? 'Pause' : fr < Focus.len ? 'Resume' : 'Start'));
    document.querySelectorAll('.fring').forEach(el => el.style.setProperty('--p', (1 - fr / Focus.len).toFixed(4)));
    document.querySelectorAll('[data-min]').forEach(el => el.setAttribute('aria-pressed', String(Number(el.dataset.min) * 60 === Focus.len)));
    const hud = document.getElementById('hud');
    if (hud) { hud.classList.toggle('idle', Tracker.idle); hud.classList.toggle('rec', !!Tracker.ctx && !Tracker.idle); hud.classList.toggle('foc', Focus.running); const fm = hud.querySelector('[data-hud=focus]'); if (fm) fm.textContent = clock(Math.ceil(fr)); }
  }
};
const hudHTML = () => `<a class="hud" id="hud" href="#/journal" aria-label="Study time today, streak and level"><span class="hdot" aria-hidden="true"></span><span class="hclock" data-live="today-clock">${clock(Journal.day().sec)}</span><span class="hfoc" data-hud="focus"></span><span class="hsep" aria-hidden="true"></span>${ic('flame')}<span data-live="streak">${Journal.streak()}</span><span class="hlv">Lv <b data-live="level">${XP.level().l}</b></span></a>`;

const Study = {
  init() {
    Tracker.init();
    setInterval(() => Live.refresh(), 1000);
    Bus.on('xp', ({ n, why, levelUp: up, level }) => { Toast.show(`+${n} XP`, why, 'var(--amber)'); document.querySelectorAll('.hlv').forEach(e => { e.classList.remove('pop'); void e.offsetWidth; e.classList.add('pop'); }); if (up) setTimeout(() => levelUp(level), 500); });
    Bus.on('idle', v => { if (Tracker.ctx) v ? Toast.show('Timer paused', 'No activity for 90 seconds. Tap anywhere to continue.', 'var(--dim)') : Toast.show('Welcome back', 'Your study timer is running again.'); });
    Bus.on('focus', () => Live.refresh());
    Bus.on('focusDone', () => { Field.spark(innerWidth / 2, innerHeight / 2, 120); Toast.show('Focus session complete', 'Take a five-minute break. You earned it.', 'var(--violet)'); });
    Bus.on('plan', e => { if (location.hash.startsWith('#/planner')) Planner_.renderAll(); if (e?.done) Field.pulse(ACC[2]); });
    Bus.on('log', e => { if (e.k === 'open') Field.pulse(ACC[0]); });
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-focus=toggle],[data-focus=reset],[data-min]'); if (!t) return;
      if (t.dataset.min) Focus.set(Number(t.dataset.min));
      else if (t.dataset.focus === 'reset') Focus.reset();
      else Focus.running ? Focus.pause() : Focus.start();
    });
  },
  onUser(u) {
    Store.bind(u?.id); if (!u) return;
    Prefs.adoptPending();
    Store.global('last', { name: dname() || u.email.split('@')[0], streak: Journal.streak() });
  }
};
const focusHTML = () => `<div class="focus"><div class="fring" style="--p:0"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="trk" cx="60" cy="60" r="52"/><circle class="arc" cx="60" cy="60" r="52" pathLength="1"/></svg><span><b data-focus="time">${clock(Focus.remaining())}</b><small data-focus="state">Ready</small></span></div>
  <div class="fside"><div class="seg" role="group" aria-label="Session length">${[25, 45, 60].map(m => `<button type="button" data-min="${m}" aria-pressed="${m * 60 === Focus.len}">${m}m</button>`).join('')}</div>
  <div class="row2"><button type="button" class="btn primary sm" data-focus="toggle">Start</button><button type="button" class="btn sm" data-focus="reset">Reset</button></div></div></div>`;
const questHTML = () => `<ul class="quests">${Quests.list().map(q => `<li data-quest="${q.id}" class="${q.done ? 'done' : ''}" style="--a:${q.a}"><span class="qchk">${CHECK}</span><span class="qt"><strong>${q.t}</strong><em>${q.fmt(q.v, q.goal)}</em><span class="qbar"><i style="width:${q.v / q.goal * 100}%"></i></span></span><small>+${q.xp}</small></li>`).join('')}</ul>`;

/* ---------- Auth: login ---------- */
const orbitHTML = () => `<div class="orbit" aria-hidden="true"><div class="ocore">${LOGO}</div>${SUBJECTS.slice(0, 3).map((s, k) => `<span class="osat" style="--k:${k};--a:${s.c}"><i>${s.i}</i></span>`).join('')}<span class="oring r1"></span><span class="oring r2"></span></div>`;
function authView(mode) {
  if (me) return go('#/app');
  mode === 'signup' ? signupView() : loginView();
}
function loginView() {
  const last = Store.global('last'), first = last?.name?.split(' ')[0];
  view.innerHTML = `<div class="wrap authGrid au">
  <section class="pitch au-pitch rv" data-rv="left">
    <span class="eyebrow"><span class="dot"></span>${first ? 'Welcome back' : 'Your study space'}</span>
    <h1 class="split">${first ? `${words('Good to see you,')} <em>${words(esc(first) + '.', 4)}</em>` : `${words('Pick up where')} <em>${words('you left off.', 3)}</em>`}</h1>
    <p>${last?.streak ? `Your ${last.streak}-day streak is waiting. Log in to keep it alive.` : 'Your journal, planner and every chapter you opened are right where you left them.'}</p>
    ${orbitHTML()}
  </section>
  <form class="card au-card rv" data-rv="scale" style="--i:1" id="f">
    <h2>Log in</h2><p class="sub">Continue your board preparation.</p>
    <label for="e">Email</label><div class="fxin"><input id="e" type="email" required autocomplete="email" inputmode="email">${CHECK}</div>
    ${pwf('p', 'Password', 'current-password')}
    <button class="btn primary block morph" id="go"><span class="lbl">Log in</span><span class="spin" aria-hidden="true"></span>${CHECK}</button>
    <div class="msg" id="m" role="alert" hidden></div>
    <p class="switch">New here? <a class="tl" href="#/signup">Create an account</a></p>
  </form></div>`;
  wireEmail();
  $('#f').onsubmit = async e => {
    e.preventDefault(); const b = $('#go'), m = $('#m'); m.hidden = true;
    b.disabled = true; b.classList.add('busy'); holdRoute = true;
    const r = await sb.auth.signInWithPassword({ email: $('#e').value.trim(), password: $('#p').value });
    if (r.error) { holdRoute = false; b.disabled = false; b.classList.remove('busy'); shake($('#f')); return say(m, r.error.message); }
    b.classList.replace('busy', 'done'); burstAt(b, 40);
    await Gate.play('Opening your study space'); holdRoute = false; go('#/app');
  };
}
function wireEmail() { const e = $('#e'); e.addEventListener('input', () => e.parentElement.classList.toggle('valid', !!e.value && e.validity.valid)); }

/* ---------- Auth: signup, a three-step flow that builds a student pass ---------- */
const strength = v => !v ? 0 : (v.length >= 6) + (v.length >= 10) + ((/[a-z]/i.test(v) && /\d/.test(v)) || (/[a-z]/.test(v) && /[A-Z]/.test(v))) + /[^\w\s]/.test(v);
const SLABEL = ['Use at least 6 characters', 'Weak', 'Okay', 'Strong', 'Excellent'];
function signupView() {
  const pick = new Set(['Physics', 'Chemistry', 'Mathematics']), no = String(1000 + Math.floor(Math.random() * 9000));
  const since = new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  const subsHTML = () => [...pick].map((n, k) => `<span class="el" style="--a:${subColor(n)};--k:${k}">${subTag(n)}</span>`).join('') || '<span class="idc-empty">No subjects yet</span>';
  view.innerHTML = `<div class="wrap authGrid au">
  <section class="pitch au-pitch rv" data-rv="left">
    <span class="eyebrow"><span class="dot"></span>Your student pass</span>
    <div class="idcard" id="idc"><div class="idc-in">
      <div class="idc-face front">
        <div class="idc-top">${LOGO}<span>EdgeStudy pass</span><span class="idc-no">No. ${no}</span></div>
        <div class="idc-name"><span id="idName">Your name</span><i class="caret" aria-hidden="true"></i></div>
        <div class="idc-subs" id="idSubs">${subsHTML()}</div>
        <div class="idc-foot"><span>Level 1 &middot; 0 XP</span><span>Since ${since}</span></div>
      </div>
      <div class="idc-face back" id="idBack"></div>
    </div></div>
    <p class="quiet">Fill in the steps and watch your pass come to life.</p>
  </section>
  <form class="card au-card rv" data-rv="scale" style="--i:1" id="f">
    <div class="steps" aria-hidden="true"><i class="on"></i><i></i><i></i></div>
    <p class="stepc" id="sc" aria-live="polite">Step 1 of 3</p>
    <fieldset class="stp on"><legend><h2>What should we call you?</h2></legend>
      <label for="n">Full name</label><input id="n" required maxlength="60" autocomplete="name">
      <button type="button" class="btn primary block nx">Continue ${ic('arrow')}</button></fieldset>
    <fieldset class="stp"><legend><h2>Which subjects are you taking?</h2></legend>
      <p class="sub">Your dashboard and planner will focus on these. You can still open every subject.</p>
      <div class="pick">${SUBJECTS.map(s => `<button type="button" class="pk" data-s="${s.n}" style="--a:${s.c}" aria-pressed="${pick.has(s.n)}"><span class="el" style="--a:${s.c}">${s.i}</span>${s.n}${CHECK}</button>`).join('')}</div>
      <div class="row2"><button type="button" class="btn bk">Back</button><button type="button" class="btn primary nx">Continue ${ic('arrow')}</button></div></fieldset>
    <fieldset class="stp"><legend><h2>Secure your account</h2></legend>
      <label for="e">Email</label><div class="fxin"><input id="e" type="email" required autocomplete="email" inputmode="email">${CHECK}</div>
      ${pwf('p', 'Password', 'new-password')}
      <div class="meter" id="mt" data-s="0" aria-live="polite"><span class="bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span><small id="ml">${SLABEL[0]}</small></div>
      ${pwf('p2', 'Confirm password', 'new-password')}<div class="hint" id="h" aria-live="polite"></div>
      <div class="row2"><button type="button" class="btn bk">Back</button><button class="btn primary morph" id="go"><span class="lbl">Create account</span><span class="spin" aria-hidden="true"></span>${CHECK}</button></div></fieldset>
    <div class="msg" id="m" role="alert" hidden></div>
    <p class="switch">Already have an account? <a class="tl" href="#/login">Log in</a></p>
  </form></div>`;
  const f = $('#f'), steps = [...f.querySelectorAll('.stp')], m = $('#m'); let step = 0;
  const show = n => {
    m.hidden = true; f.style.setProperty('--dir', n > step ? 1 : -1); step = n;
    steps.forEach((s, i) => s.classList.toggle('on', i === n));
    f.querySelectorAll('.steps i').forEach((d, i) => d.classList.toggle('on', i <= n));
    $('#sc').textContent = `Step ${n + 1} of 3`;
    steps[n].querySelector('input,button.pk')?.focus({ preventScroll: true });
  };
  f.querySelectorAll('.nx').forEach(b => b.onclick = () => {
    if (step === 0 && !$('#n').reportValidity()) return shake(f);
    if (step === 1 && !pick.size) { shake(f); return say(m, 'Pick at least one subject.'); }
    show(step + 1);
  });
  f.querySelectorAll('.bk').forEach(b => b.onclick = () => show(step - 1));
  $('#n').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); f.querySelector('.nx').click(); } });
  $('#n').oninput = () => { $('#idName').textContent = $('#n').value.trim() || 'Your name'; $('#idc').classList.add('live'); };
  f.querySelectorAll('.pk').forEach(b => b.onclick = () => {
    const s = b.dataset.s; pick.has(s) ? pick.delete(s) : pick.add(s);
    b.setAttribute('aria-pressed', String(pick.has(s))); $('#idSubs').innerHTML = subsHTML();
  });
  wireEmail();
  const chk = () => {
    const a = $('#p').value, b2 = $('#p2').value, sc = strength(a), h = $('#h');
    $('#mt').dataset.s = sc; $('#ml').textContent = SLABEL[sc];
    if (!b2) { h.textContent = ''; return; }
    const ok = a === b2; h.className = 'hint ' + (ok ? 'ok' : 'err'); h.textContent = ok ? 'Passwords match' : 'Passwords do not match';
  };
  $('#p').oninput = $('#p2').oninput = chk;
  f.onsubmit = async e => {
    e.preventDefault(); const b = $('#go'), pw = $('#p').value;
    if (pw !== $('#p2').value) { shake(f); return say(m, 'Passwords do not match. Please re-enter them.'); }
    b.disabled = true; b.classList.add('busy'); holdRoute = true;
    const name = $('#n').value.trim(), em = $('#e').value.trim();
    const r = await sb.auth.signUp({ email: em, password: pw, options: { data: { full_name: name } } });
    if (r.error) { holdRoute = false; b.disabled = false; b.classList.remove('busy'); shake(f); return say(m, r.error.message); }
    Store.global('pending', { subjects: [...pick] });
    b.classList.replace('busy', 'done');
    const first = esc(name.split(' ')[0]), idc = $('#idc');
    $('#idBack').innerHTML = r.data.session
      ? `<span class="kicker">Pass activated</span><h3>Welcome aboard, ${first}.</h3><p>Setting up your study space now.</p>`
      : `<span class="kicker">One last step</span><h3>Check your inbox, ${first}.</h3><p>We sent a confirmation link to ${esc(em)}. Confirm it, then log in.</p><a class="btn primary sm" href="#/login">Go to log in</a>`;
    idc.classList.add('flip'); idc.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => burstAt(idc, 120), 420);
    if (r.data.session) { setTimeout(async () => { await Gate.play('Setting up your study space'); holdRoute = false; go('#/app'); }, 1500); }
    else { holdRoute = false; say(m, 'Account created. Check your email to confirm it, then log in.', 'ok'); }
  };
}

/* ---------- Dashboard ---------- */
function renderDashboard(ts) {
  const d = Journal.day(), first = (dname().split(' ')[0]) || 'there';
  const hr = new Date().getHours(), greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const lv = XP.level(), xp = XP.get().total, streak = Journal.streak(), last = Journal.lastOpened();
  const left = Quests.list().filter(q => !q.done).length, plan = Planner.on(dayKey());
  const pref = Prefs.get().subjects, mine = SUBJECTS.filter(s => !pref.length || pref.includes(s.n));
  const mon = mondayOf(dayKey()), week = Journal.range(mon, 7), bys = Journal.bySubject(week), max = Math.max(60, ...Object.values(bys));
  const open = (ts || []).filter(t => t.status === 'open').length;
  shell('app', `<div class="dash norv">
    <section class="glass tint dtile d-greet rv" data-rv="scale" style="--a:var(--mint)">
      <span class="date">${today}</span>
      <h1 class="split">${words(greet + ',')} <em>${words(esc(first) + '.', greet.split(' ').length)}</em></h1>
      <p>${d.sec >= 60 ? `You have studied <b class="hl" data-live="today">${dur(d.sec)}</b> today.` : 'Nothing studied yet today. Ten focused minutes is a great start.'} ${left ? `${left} of 3 daily quests left.` : 'All daily quests done. Brilliant work.'}</p>
      <div class="acts">${last ? `<a class="btn primary" href="#/c/${encodeURIComponent(last.s)}/${last.c}/${last.tab}">Continue ${esc(chName(last.s, last.c))} ${ic('arrow')}</a>` : `<a class="btn primary" href="#/subjects">Choose a subject ${ic('arrow')}</a>`}<a class="btn" href="#/planner">Plan today</a></div>
    </section>
    <section class="glass dtile d-level rv" data-rv="scale" style="--i:1" aria-label="Level and streak">
      <div class="lring" style="--off:${(1 - lv.into / lv.need).toFixed(3)}"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="trk" cx="60" cy="60" r="50"/><circle class="arc" cx="60" cy="60" r="50" pathLength="1"/></svg><span><small>Level</small><b data-count="${lv.l}">${lv.l}</b></span></div>
      <p class="xpline"><b data-count="${xp}">${xp}</b> XP &middot; ${lv.need - lv.into} to level ${lv.l + 1}</p>
      <div class="streak"><span class="fl">${ic('flame')}<b>${streak}</b> day streak</span><span class="wk" aria-label="This week">${week.map(([k, v]) => `<i class="${v.sec >= 300 ? 'on' : ''} ${k === dayKey() ? 'now' : ''}"></i>`).join('')}</span></div>
    </section>
    <section class="glass dtile d-quests rv" data-rv="scale" style="--i:2"><div class="dh"><h3>Daily quests</h3><small class="quiet">Resets at midnight</small></div>${questHTML()}</section>
    <section class="glass dtile d-plan rv" data-rv="scale" style="--i:3"><div class="dh"><h3>Today&apos;s plan</h3><a class="tl" href="#/planner">Planner</a></div>
      ${plan.length ? `<ul class="mplan">${plan.slice(0, 4).map(t => `<li class="${t.done ? 'done' : ''}" style="--a:${subColor(t.s)}"><span class="el" style="--a:${subColor(t.s)}">${subTag(t.s)}</span><span><strong>${esc(chName(t.s, t.c))}</strong><small>${PART[t.tab]} &middot; ${t.min} min</small><span class="tbar"><i data-live="plan" data-id="${t.id}" style="width:${Math.min(100, Planner.spent(t) / (t.min * 60) * 100)}%"></i></span></span></li>`).join('')}</ul>` : '<p class="quiet">No plan for today yet. Add two or three small tasks and tick them off as you go.</p><a class="btn sm" href="#/planner">Make a plan</a>'}
    </section>
    <section class="glass dtile d-focus rv" data-rv="scale" style="--i:4"><div class="dh"><h3>Focus timer</h3><small class="quiet">+30 XP</small></div>${focusHTML()}</section>
    <section class="glass dtile d-subj rv" data-rv="scale" style="--i:5"><div class="dh"><h3>Your subjects</h3><a class="tl" href="#/subjects">View all</a></div>
      ${mine.map(s => `<div class="srow" style="--a:${s.c}"><span class="el" style="--a:${s.c}" aria-hidden="true">${s.i}</span><div><strong>${s.n}</strong><small class="quiet">${s.ch.length} chapters &middot; ${dur(bys[s.n] || 0)} this week</small><span class="wbar"><i style="--w:${((bys[s.n] || 0) / max).toFixed(3)}"></i></span></div><a class="btn sm" href="#/subjects/${encodeURIComponent(s.n)}" aria-label="Open ${s.n}">Open</a></div>`).join('')}
    </section>
    <section class="glass dtile d-jour rv" data-rv="scale" style="--i:6"><div class="dh"><h3>Journal</h3><a class="tl" href="#/journal">Open</a></div>${logList(d.log, 4)}</section>
    <section class="glass dtile d-rep rv" data-rv="scale" style="--i:7"><div class="dh"><h3>Your reports</h3><a class="tl" href="#/help">New</a></div>
      ${open ? `<p class="quiet">${open} under review.</p>` : ''}
      ${ts?.length ? ts.slice(0, 3).map(t => `<a class="li" href="#/ticket/${t.id}"><div><strong>${esc(t.subject)}</strong><small>${fmt(t.created_at)}</small></div><span class="st ${t.status}">${SL[t.status] || t.status}</span></a>`).join('') : '<p class="quiet">No reports yet. Found something missing? Let us know.</p>'}
    </section>
  </div>`);
  Live.refresh();
}

/* ---------- Journal ---------- */
function journalView(param) {
  const today = dayKey(), k = /^\d{4}-\d{2}-\d{2}$/.test(param || '') && param <= today ? param : today, d = Journal.peek(k);
  const WEEKS = 18, start = shiftDay(mondayOf(today), -(WEEKS - 1) * 7), cells = Journal.range(start, WEEKS * 7);
  const lvl = s => s <= 0 ? 0 : s < 900 ? 1 : s < 1800 ? 2 : s < 3600 ? 3 : 4;
  const week = Journal.range(shiftDay(today, -6), 7), wsum = week.reduce((a, [, v]) => a + v.sec, 0), active = week.filter(([, v]) => v.sec >= 300).length;
  const bys = Object.entries(Journal.bySubject([[k, d]])).sort((a, b) => b[1] - a[1]), tot = Math.max(1, d.sec);
  const chap = {}; for (const [key, v] of Object.entries(d.items)) { const [s, c, t] = key.split('|'); if (t === 'focus') continue; (chap[`${s}|${c}`] ??= { s, c: Number(c), t: {} }).t[t] = v; }
  const label = parseDay(k).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  shell('journal', `<div class="pageTop"><span class="kicker">Recorded automatically</span><h1 class="split">${words('Your study journal')}</h1><p>Every chapter you open and every minute you study is written here for you. Tap any day on the map to look back.</p></div>
  <div class="jgrid norv">
    <section class="glass tint jtoday rv" data-rv="scale" style="--a:var(--mint)">
      <span class="date">${k === today ? 'Today' : label}</span>
      <b class="big">${k === today ? `<span data-live="today">${dur(d.sec)}</span>` : dur(d.sec)}</b>
      <p>${k === today ? label : 'studied on this day'}</p>
      <div class="jstats"><div><b data-count="${Math.round(wsum / 60)}">${Math.round(wsum / 60)}</b><small>Minutes in the last 7 days</small></div><div><b data-count="${active}">${active}</b><small>Active days this week</small></div><div><b data-count="${Journal.streak()}">${Journal.streak()}</b><small>Day streak</small></div></div>
    </section>
    <section class="glass jheat rv" data-rv="scale" style="--i:1"><div class="dh"><h3>Study map</h3><small class="quiet">Last ${WEEKS} weeks</small></div>
      <div class="heat" role="list">${cells.map(([ck, v], i) => ck > today ? '<span class="hc f" aria-hidden="true"></span>' : `<a role="listitem" class="hc h${lvl(v.sec)} ${ck === today ? 'now' : ''} ${ck === k ? 'sel' : ''}" style="--w:${Math.floor(i / 7)}" href="#/journal/${ck}" aria-label="${parseDay(ck).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}: ${dur(v.sec)}"></a>`).join('')}</div>
      <div class="hkey" aria-hidden="true"><small>Less</small><i class="hc h0"></i><i class="hc h1"></i><i class="hc h2"></i><i class="hc h3"></i><i class="hc h4"></i><small>More</small></div>
    </section>
    <section class="glass jlog rv" data-rv="scale" style="--i:2"><div class="dh"><h3>Timeline</h3><small class="quiet">${d.log.length} entries</small></div>${logList(d.log)}</section>
    <section class="glass jsplit rv" data-rv="scale" style="--i:3"><div class="dh"><h3>Where the time went</h3></div>
      ${bys.length ? `<ul class="split-l">${bys.map(([s, v]) => `<li style="--a:${s === 'Focus' ? 'var(--mint)' : subColor(s)}"><span class="el" style="--a:${s === 'Focus' ? 'var(--mint)' : subColor(s)}">${subTag(s)}</span><span><strong>${s === 'Focus' ? 'Focus sessions' : esc(s)}</strong><span class="wbar"><i style="--w:${(v / tot).toFixed(3)}"></i></span></span><em>${dur(v)}</em></li>`).join('')}</ul>` : '<p class="quiet">No study time recorded on this day.</p>'}
    </section>
    <section class="glass jchap rv" data-rv="scale" style="--i:4"><div class="dh"><h3>Chapters and topics opened</h3></div>
      ${Object.values(chap).length ? `<ul class="chl2">${Object.values(chap).map(x => `<li style="--a:${subColor(x.s)}"><a href="#/c/${encodeURIComponent(x.s)}/${x.c}/theory"><span class="el" style="--a:${subColor(x.s)}">${subTag(x.s)}</span><span><strong>${esc(chName(x.s, x.c))}</strong><small>${['theory', 'questions', 'revision'].filter(t => t in x.t).map(t => `${PART[t]} ${dur(x.t[t])}`).join(' &middot; ')}</small></span></a></li>`).join('')}</ul>` : '<p class="quiet">No chapters opened on this day.</p>'}
    </section>
    <section class="glass jnote rv" data-rv="scale" style="--i:5"><div class="dh"><h3>One line about the day</h3><small class="quiet" id="ns" aria-live="polite"></small></div>
      <label class="sr" for="jn">Your note for ${label}</label><textarea id="jn" maxlength="600" placeholder="What clicked today? What still feels shaky?">${esc(d.note || '')}</textarea>
    </section>
  </div>`);
  let tid; $('#jn').oninput = e => { clearTimeout(tid); $('#ns').textContent = 'Saving'; tid = setTimeout(() => { Journal.day(k).note = e.target.value; Journal.save(); $('#ns').textContent = 'Saved'; }, 500); };
}

/* ---------- Planner ---------- */
const Planner_ = {
  day: dayKey(),
  renderAll() { const el = $('#tl'); if (!el) return; el.innerHTML = this.tasks(); this.week(); },
  tasks(newId) {
    const ts = Planner.on(this.day);
    if (!ts.length) return `<p class="quiet empty-p">Nothing planned for this day. Add a task below. Small tasks are easier to finish.</p>`;
    return ts.map(t => { const s = sub(t.s), pct = Math.min(100, Planner.spent(t) / (t.min * 60) * 100);
      return `<li class="task ${t.done ? 'done' : ''} ${t.id === newId ? 'drop' : ''}" data-id="${t.id}" style="--a:${s?.c || 'var(--mint)'}">
      <button type="button" class="tchk" data-act="toggle" aria-pressed="${t.done}" aria-label="${t.done ? 'Mark as not done' : 'Mark as done'}">${CHECK}</button>
      <span class="tb"><strong>${esc(chName(t.s, t.c))}</strong><small>${esc(t.s)} &middot; ${PART[t.tab]} &middot; ${t.min} min</small><span class="tbar"><i data-live="plan" data-id="${t.id}" style="width:${pct}%"></i></span></span>
      <a class="btn sm" href="#/c/${encodeURIComponent(t.s)}/${t.c}/${t.tab === 'any' ? 'theory' : t.tab}">Start</a>
      <button type="button" class="tdel" data-act="del" aria-label="Remove task">${ic('x')}</button></li>`; }).join('');
  },
  week() {
    const mon = mondayOf(this.day), el = $('#wk'); if (!el) return;
    el.innerHTML = Journal.range(mon, 7).map(([k]) => { const ts = Planner.on(k), done = ts.filter(t => t.done).length, d = parseDay(k);
      return `<a class="dp ${k === this.day ? 'sel' : ''} ${k === dayKey() ? 'now' : ''}" href="#/planner/${k}" style="--p:${ts.length ? done / ts.length : 0}"${k === this.day ? ' aria-current="date"' : ''}><small>${d.toLocaleDateString('en-IN', { weekday: 'short' })}</small><b>${d.getDate()}</b><span class="dring" aria-hidden="true"></span><em>${ts.length ? `${done}/${ts.length}` : '&nbsp;'}</em></a>`; }).join('');
  }
};
function plannerView(param) {
  const today = dayKey(); Planner_.day = /^\d{4}-\d{2}-\d{2}$/.test(param || '') ? param : today;
  const k = Planner_.day, mon = mondayOf(k), pref = Prefs.get().subjects, list = SUBJECTS.filter(s => !pref.length || pref.includes(s.n));
  const exam = Prefs.get().exam, days = exam ? Math.ceil((parseDay(exam) - parseDay(today)) / 86400000) : null;
  const label = parseDay(k).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const range = `${parseDay(mon).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} to ${parseDay(shiftDay(mon, 6)).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
  shell('planner', `<div class="pageTop"><span class="kicker">Planner</span><h1 class="split">${words('Plan small. Finish more.')}</h1><p>Tasks tick themselves off when your journal records enough study time on them.</p></div>
  <div class="pgrid norv">
    <section class="glass pweek rv" data-rv="scale"><div class="dh"><a class="btn sm" href="#/planner/${shiftDay(mon, -7)}" aria-label="Previous week">&larr;</a><h3>${range}</h3><a class="btn sm" href="#/planner/${shiftDay(mon, 7)}" aria-label="Next week">&rarr;</a></div><nav class="wk7" id="wk" aria-label="Days of the week"></nav></section>
    <section class="glass plist rv" data-rv="scale" style="--i:1"><div class="dh"><h3>${k === today ? 'Today' : esc(label)}</h3>${k === today ? '' : `<a class="tl" href="#/planner/${today}">Back to today</a>`}</div><ul class="tasks" id="tl">${Planner_.tasks()}</ul></section>
    <form class="glass padd rv" data-rv="scale" style="--i:2" id="pa"><div class="dh"><h3>Add a task</h3><small class="quiet">${esc(label)}</small></div>
      <label for="ps">Subject</label><select id="ps">${list.map(s => `<option>${s.n}</option>`).join('')}</select>
      <label for="pc">Chapter</label><select id="pc"></select>
      <fieldset class="chips-f"><legend>Part</legend><div class="seg wrapseg">${[['theory', 'Theory'], ['questions', 'Questions'], ['revision', 'Revision'], ['any', 'Any']].map(([v, l], i) => `<label><input type="radio" name="pt" value="${v}"${i ? '' : ' checked'}><span>${l}</span></label>`).join('')}</div></fieldset>
      <fieldset class="chips-f"><legend>Time</legend><div class="seg">${[15, 25, 45, 60].map((v, i) => `<label><input type="radio" name="pm" value="${v}"${i === 1 ? ' checked' : ''}><span>${v} min</span></label>`).join('')}</div></fieldset>
      <button class="btn primary block">Add to plan ${ic('plus')}</button>
    </form>
    <section class="glass tint pexam rv" data-rv="scale" style="--i:3;--a:var(--amber)"><div class="dh"><h3>Board exam countdown</h3></div>
      ${days !== null ? `<b class="big" data-count="${Math.max(0, days)}">${Math.max(0, days)}</b><p>${days > 0 ? 'days until your first board exam.' : 'Exam day. You have got this.'}</p>` : '<p>Add the date of your first board exam to see a live countdown.</p>'}
      <label for="ed">First exam date</label><input type="date" id="ed" value="${esc(exam)}" min="${today}">
    </section>
    <section class="glass pfocus rv" data-rv="scale" style="--i:4"><div class="dh"><h3>Focus timer</h3><small class="quiet">Counts into your journal</small></div>${focusHTML()}</section>
  </div>`);
  Planner_.week();
  const fill = () => { const s = sub($('#ps').value); $('#pc').innerHTML = s.ch.map((c, i) => `<option value="${i}">${pad(i + 1)}. ${esc(c)}</option>`).join(''); };
  fill(); $('#ps').onchange = fill;
  $('#pa').onsubmit = e => {
    e.preventDefault(); const fd = new FormData(e.target);
    const t = Planner.add({ day: k, s: $('#ps').value, c: Number($('#pc').value), tab: fd.get('pt'), min: Number(fd.get('pm')) });
    $('#tl').innerHTML = Planner_.tasks(t.id); Planner_.week(); Toast.show('Added to your plan', `${chName(t.s, t.c)} · ${t.min} min`, subColor(t.s));
  };
  $('#tl').onclick = e => {
    const b = e.target.closest('[data-act]'); if (!b) return; const li = b.closest('.task'), id = li.dataset.id;
    if (b.dataset.act === 'toggle') { const was = li.classList.contains('done'); if (!was) burstAt(b, 26); Planner.toggle(id); }
    else { li.classList.add('leave'); setTimeout(() => Planner.remove(id), 380); }
  };
  $('#ed').onchange = e => { Prefs.set({ exam: e.target.value }); plannerView(k); };
  Live.refresh();
}

/* ---------- Chapter session strip ---------- */
const partTime = (s, c, t) => Journal.day().items[`${s}|${c}|${t}`] || 0;
const chapterStrip = (s, i, tab) => `<div class="sess rv" role="status"><span class="sdot" aria-hidden="true"></span><span>Recording <b data-live="item" data-key="${esc(`${s}|${i}|${tab}`)}">${clock(partTime(s, i, tab))}</b> on ${PART[tab]} today</span><span class="quiet">Pauses after 90 seconds without activity</span></div>`;

/* ---------- Landing: preview of the living features ---------- */
function landingLive() {
  const demo = Array.from({ length: 84 }, (_, i) => { const v = Math.abs(Math.sin(i * 1.7) * Math.cos(i * .45)); return i > 80 ? 0 : v < .25 ? 0 : v < .45 ? 1 : v < .65 ? 2 : v < .85 ? 3 : 4; });
  return `<section class="section" id="alive"><div class="wrap">
    <div class="sh"><span class="kicker rv">It notices you studying</span><h2 class="split">${words('Your study, recorded automatically.')}</h2><p class="rv" style="--i:2">Open a chapter and EdgeStudy starts a quiet timer. Your journal, streak, quests and planner update themselves. No manual logging.</p></div>
    <div class="lbento">
      <article class="glass tint lb-heat rv" data-rv="scale" style="--a:var(--mint)"><span class="tag">Journal</span><h3>A study map that fills itself</h3><p>Every day you study lights up a square. Tap a day to see what you opened and for how long.</p>
        <div class="heat demo" aria-hidden="true">${demo.map((l, i) => `<i class="hc h${l}" style="--w:${Math.floor(i / 7)}"></i>`).join('')}</div></article>
      <article class="glass tint lb-xp rv" data-rv="scale" style="--a:var(--amber);--i:1"><span class="tag">Progress</span><h3>XP, levels and streaks</h3><p>Earn XP for every five minutes of study, every new part you open and every quest you finish.</p>
        <div class="xpdemo" aria-hidden="true"><div class="lring" style="--off:.32"><svg viewBox="0 0 120 120"><circle class="trk" cx="60" cy="60" r="50"/><circle class="arc" cx="60" cy="60" r="50" pathLength="1"/></svg><span><small>Level</small><b>7</b></span></div><span class="fl">${ic('flame')}<b>12</b> day streak</span></div></article>
      <article class="glass tint lb-plan rv" data-rv="scale" style="--a:var(--violet);--i:2"><span class="tag">Planner</span><h3>Tasks that tick themselves off</h3>
        <ul class="mplan demo" aria-hidden="true" data-stagger><li class="done rv" data-rv="right" style="--a:var(--mint)"><span class="el" style="--a:var(--mint)">Ph</span><span><strong>Nuclei</strong><small>Theory &middot; 25 min</small><span class="tbar"><i style="width:100%"></i></span></span></li><li class="rv" data-rv="right" style="--a:var(--violet)"><span class="el" style="--a:var(--violet)">Ch</span><span><strong>Electrochemistry</strong><small>Questions &middot; 45 min</small><span class="tbar"><i style="width:58%"></i></span></span></li></ul></article>
      <article class="glass tint lb-q rv" data-rv="scale" style="--a:var(--mint);--i:1"><span class="tag">Daily quests</span><h3>Three small wins, every day</h3>
        <ul class="quests demo" aria-hidden="true"><li class="done" style="--a:var(--mint)"><span class="qchk">${CHECK}</span><span class="qt"><strong>Study for 20 minutes</strong><span class="qbar"><i style="width:100%"></i></span></span><small>+40</small></li><li style="--a:var(--amber)"><span class="qchk">${CHECK}</span><span class="qt"><strong>Open theory, questions and revision</strong><span class="qbar"><i style="width:66%"></i></span></span><small>+30</small></li></ul></article>
    </div>
  </div></section>`;
}
