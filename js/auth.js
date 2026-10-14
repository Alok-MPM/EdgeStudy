/* =========================================================
   Auth: log in and sign up.
   One combined card: the animated stage (Edgy the robot, plus the student pass on sign up) sits inside the same box as the form.
   On phones the stage folds away while the keyboard is open so the fields are never covered.
   ========================================================= */

/* ---------- Accounts remembered on this device (so the login page can greet you by name) ---------- */
const Accounts = {
  all() { return Store.global('accounts') || {}; },
  remember(email, name, streak) {
    if (!email) return;
    const k = String(email).trim().toLowerCase(), a = this.all(); a[k] = { name, streak: streak || 0, t: Date.now() };
    const keep = Object.keys(a).sort((x, y) => a[y].t - a[x].t).slice(0, 6), o = {}; keep.forEach(x => (o[x] = a[x]));
    Store.global('accounts', o);
    try { sessionStorage.setItem('es-who', k); } catch (e) {}
  },
  find(email) { return this.all()[String(email || '').trim().toLowerCase()] || null; },
  /* the person who was just using this tab (signed up or logged out a moment ago) */
  recent() { try { const e = sessionStorage.getItem('es-who'); return e ? this.find(e) : null; } catch (e) { return null; } }
};

/* ---------- Edgy, the study buddy ---------- */
const ROBOT = `<div class="edgy" aria-hidden="true"><svg viewBox="0 0 200 200"><defs><linearGradient id="eg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5ee2bc"/><stop offset="1" stop-color="#8dbbff"/></linearGradient></defs>
<g class="ant"><line x1="100" y1="36" x2="100" y2="16" stroke="#8dbbff" stroke-width="5" stroke-linecap="round"/><circle class="ball" cx="100" cy="12" r="7" fill="#ffc36b"/></g>
<rect x="28" y="34" width="144" height="128" rx="44" fill="url(#eg)"/><rect x="44" y="56" width="112" height="82" rx="32" fill="#0e1420"/>
<g class="eyew"><circle cx="76" cy="92" r="17" fill="#fff"/></g><g class="eyew"><circle cx="124" cy="92" r="17" fill="#fff"/></g>
<circle class="pup" cx="76" cy="92" r="8" fill="#10141e"/><circle class="pup" cx="124" cy="92" r="8" fill="#10141e"/>
<path class="hy" d="M60 98q16-20 32 0M108 98q16-20 32 0" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
<ellipse cx="58" cy="118" rx="9" ry="6" fill="#ff8f83" opacity=".5"/><ellipse cx="142" cy="118" rx="9" ry="6" fill="#ff8f83" opacity=".5"/>
<path class="mo s" d="M86 117q14 14 28 0" fill="none" stroke="#5ee2bc" stroke-width="4.5" stroke-linecap="round"/>
<path class="mo h" d="M82 112q18 26 36 0z" fill="#ff8f83" stroke="#ff8f83" stroke-width="4" stroke-linejoin="round"/>
<path class="mo d" d="M88 126q12-13 24 0" fill="none" stroke="#ff8f83" stroke-width="4.5" stroke-linecap="round"/>
<ellipse class="hand hL" cx="62" cy="166" rx="22" ry="17" fill="#5ee2bc" stroke="#0e1420" stroke-width="4"/><ellipse class="hand hR" cx="138" cy="166" rx="22" ry="17" fill="#5ee2bc" stroke="#0e1420" stroke-width="4"/></svg></div>`;
const Edgy = {
  tw: null,
  mount(root) { this.el = root.querySelector('.edgy'); this.eyes = [...root.querySelectorAll('.eyew')]; this.pups = [...root.querySelectorAll('.pup')]; this.bub = root.querySelector('#bub'); },
  live() { return !!this.el?.isConnected; },
  mood(m) { if (this.live()) this.el.className = 'edgy' + (m && m !== 'idle' ? ' m-' + m : ''); },
  look(x, y) {
    if (!this.live() || /m-(shy|peek)/.test(this.el.className)) return;
    this.pups.forEach((p, i) => { const r = this.eyes[i].getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) || 1, k = Math.min(7, d / 16); p.style.transform = `translate(${dx / d * k}px,${dy / d * k}px)`; });
  },
  lookAt(input) { const r = input.getBoundingClientRect(); this.look(r.left + Math.min(r.width - 24, 18 + (input.value.length || 0) * 8.5), r.top + r.height / 2); },
  pulse() { const b = this.el?.querySelector('.ball'); if (!b || RM) return; b.classList.remove('hit'); void b.getBoundingClientRect(); b.classList.add('hit'); },
  say(t) {
    if (!this.bub) return; clearInterval(this.tw);
    if (RM) { this.bub.textContent = t; return; }
    const ch = Array.from(t); let i = 0; this.bub.textContent = '';
    this.tw = setInterval(() => { if (!this.bub?.isConnected) return clearInterval(this.tw); this.bub.textContent = ch.slice(0, ++i).join(''); if (i >= ch.length) clearInterval(this.tw); }, 18);
  }
};

/* ---------- small helpers ---------- */
const TYPOS = { 'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gnail.com': 'gmail.com', 'gmil.com': 'gmail.com', 'gmail.con': 'gmail.com', 'gmail.co': 'gmail.com', 'hotmial.com': 'hotmail.com', 'hotmai.com': 'hotmail.com', 'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com', 'outlok.com': 'outlook.com', 'outloook.com': 'outlook.com' };
const mailFix = v => { const m = String(v).trim().toLowerCase().match(/^([^@\s]+)@([^@\s]+)$/); return m && TYPOS[m[2]] ? m[1] + '@' + TYPOS[m[2]] : null; };
const strength = v => !v ? 0 : (v.length >= 6) + (v.length >= 10) + ((/[a-z]/i.test(v) && /\d/.test(v)) || (/[a-z]/.test(v) && /[A-Z]/.test(v))) + /[^\w\s]/.test(v);
const SLABEL = ['Use at least 6 characters', 'Weak', 'Okay', 'Strong', 'Excellent'];

/* Keep the stage out of the way while the on-screen keyboard is open (phones only). */
function keyboardFold(box) {
  let base = innerHeight;
  const small = () => matchMedia('(max-width:639px)').matches;
  const inField = () => document.activeElement?.matches?.('input,textarea,select');
  const set = open => { box.classList.toggle('kb', open && small()); };
  const upd = () => {
    if (!box.isConnected) { removeEventListener('resize', upd); window.visualViewport?.removeEventListener('resize', upd); return; }
    const vv = window.visualViewport, shrink = Math.max(vv ? base - vv.height : 0, base - innerHeight);
    if (!inField() && shrink < 80) base = Math.max(innerHeight, vv?.height || 0);
    const open = shrink > 140 && inField(); set(open);
    if (open) setTimeout(() => document.activeElement?.scrollIntoView?.({ block: 'center', behavior: RM ? 'auto' : 'smooth' }), 120);
  };
  addEventListener('resize', upd); window.visualViewport?.addEventListener('resize', upd);
  box.addEventListener('focusin', () => setTimeout(upd, 350)); box.addEventListener('focusout', () => setTimeout(() => { if (!inField()) set(false); }, 120));
}
/* Typing feedback shared by both forms: eyes follow the caret, antenna blinks, Caps Lock and e-mail typo hints. */
function wireTyping(f, { onType } = {}) {
  const au = $('#au');
  addEventListener('pointermove', function mv(e) { if (!au.isConnected) return removeEventListener('pointermove', mv); Edgy.look(e.clientX, e.clientY); }, { passive: true });
  f.addEventListener('input', e => { const i = e.target; if (!i.matches('input')) return; Edgy.pulse(); if (i.type !== 'password') Edgy.lookAt(i); onType?.(i); });
  f.addEventListener('focusin', e => {
    const i = e.target; if (!i.matches('input')) return;
    if (i.id.startsWith('p')) Edgy.mood(i.type === 'text' ? 'peek' : 'shy'); else { Edgy.mood('idle'); Edgy.lookAt(i); }
  });
  f.addEventListener('focusout', e => { if (e.target.id?.startsWith('p')) Edgy.mood('idle'); });
  document.addEventListener('click', function eye(e) { if (!au.isConnected) return document.removeEventListener('click', eye); const b = e.target.closest('.eye'); if (b) setTimeout(() => Edgy.mood(document.getElementById(b.dataset.t)?.type === 'text' ? 'peek' : 'shy'), 0); });
  const caps = e => { const on = !!e.getModifierState?.('CapsLock'), c = $('#caps'); if (c && e.target.matches?.('input[type=password]')) { c.hidden = !on; if (on) Edgy.say('Caps Lock is on.'); } };
  f.addEventListener('keydown', caps); f.addEventListener('keyup', caps);
  f.addEventListener('click', e => { const t = e.target.closest('[data-fix]'); if (!t) return; const i = $('#e'); i.value = t.dataset.fix; i.dispatchEvent(new Event('input', { bubbles: true })); });
}
function mailHint(i) { const h = $('#eh'); if (!h) return; const fix = mailFix(i.value); h.innerHTML = fix ? `Did you mean <button type="button" class="tl" data-fix="${esc(fix)}">${esc(fix)}</button>?` : ''; i.parentElement.classList.toggle('valid', !!i.value && i.validity.valid && !fix); }
const holdUntil = (b, ms) => new Promise(r => setTimeout(r, ms));

function authView(mode) {
  if (me) return go('#/app');
  mode === 'signup' ? signupView() : loginView();
}

/* ---------- Log in ---------- */
function loginView() {
  const who = Accounts.recent(), first = who?.name?.split(' ')[0];
  const greet = (a, typed) => {
    const fn = a?.name?.split(' ')[0];
    $('#aEye').textContent = fn ? 'Welcome back' : 'Your study space';
    $('#aH').innerHTML = fn ? `${words('Good to see you,')} <em>${words(esc(fn) + '.', 4)}</em>` : `${words('Pick up where')} <em>${words('you left off.', 3)}</em>`;
    $('#aP').textContent = a?.streak ? `Your ${a.streak}-day streak is waiting. Log in to keep it alive.` : 'Your journal, planner and every chapter you opened are right where you left them.';
    if (typed) Edgy.say(fn ? `Hi ${fn}! Enter your password to continue.` : 'Enter your e-mail and password.');
  };
  view.innerHTML = `<div class="wrap au" id="au"><div class="au-box rv" data-rv="scale">
  <section class="au-stage" id="stage">
    <div class="au-robot">${ROBOT}</div>
    <div class="au-side">
      <div class="au-fold"><span class="eyebrow"><span class="dot"></span><span id="aEye"></span></span>
      <h1 class="au-h" id="aH"></h1><p class="au-p" id="aP"></p></div>
      <div class="au-bub" id="bub" aria-live="polite"></div>
    </div>
  </section>
  <form class="au-form" id="f">
    <h2>Log in</h2><p class="sub">Continue your board preparation.</p>
    <div class="au-ready" aria-hidden="true"><i id="rdy"></i></div>
    <label for="e">Email</label><div class="fxin"><input id="e" type="email" required autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false">${CHECK}</div>
    <div class="hint" id="eh" aria-live="polite"></div>
    ${pwf('p', 'Password', 'current-password')}
    <div class="caps" id="caps" hidden role="status">Caps Lock is on</div>
    <button class="btn primary block morph" id="go"><span class="lbl">Log in</span><span class="spin" aria-hidden="true"></span>${CHECK}</button>
    <div class="msg" id="m" role="alert" hidden></div>
    <p class="switch">New here? <a class="tl" href="#/signup">Create an account</a></p>
  </form></div></div>`;
  Edgy.mount($('#stage')); greet(who, false); Edgy.say(first ? `Welcome back, ${first}. Pick up where you left off.` : 'Hi, I\'m Edgy. Log in to see your study space.');
  const f = $('#f'), e = $('#e'), p = $('#p');
  keyboardFold($('.au-box'));
  const ready = () => { $('#rdy').style.transform = `scaleX(${(e.value && e.validity.valid ? .5 : 0) + (p.value ? .5 : 0)})`; };
  wireTyping(f, { onType: i => { if (i === e) { mailHint(e); const a = Accounts.find(e.value); greet(a || null, !!a); } ready(); } });
  e.addEventListener('change', () => { const a = Accounts.find(e.value); if (a) greet(a, true); });
  f.onsubmit = async ev => {
    ev.preventDefault(); const b = $('#go'), m = $('#m'); m.hidden = true;
    b.disabled = true; b.classList.add('busy'); holdRoute = true; Edgy.mood('idle'); Edgy.say('Checking your details...');
    let r;
    try { r = await sb.auth.signInWithPassword({ email: e.value.trim(), password: p.value }); }
    catch (err) { console.error(err); r = { error: { message: 'Network problem. Please try again.' } }; }
    if (r.error) { holdRoute = false; b.disabled = false; b.classList.remove('busy'); shake(f); Edgy.mood('sad'); Edgy.say('That did not work. Check your details and try again.'); setTimeout(() => Edgy.mood('idle'), 1800); return say(m, r.error.message); }
    const nm = r.data.user?.user_metadata?.full_name || Accounts.find(e.value)?.name || e.value.split('@')[0];
    Accounts.remember(e.value, nm, Accounts.find(e.value)?.streak || 0);
    try { await setUser(r.data.user); } catch (err) { console.error(err); }
    b.classList.replace('busy', 'done'); Edgy.mood('happy'); Edgy.say(`Welcome back, ${nm.split(' ')[0]}!`);
    try { await Gate.play('Opening your study space'); } catch (err) { console.error(err); }
    holdRoute = false; go('#/app');
  };
}

/* ---------- Sign up: three steps that build a student pass ---------- */
function signupView() {
  const pick = new Set(['Physics', 'Chemistry', 'Mathematics']), no = String(1000 + Math.floor(Math.random() * 9000));
  const since = new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  const subsHTML = () => [...pick].map((n, k) => `<span class="el" style="--a:${subColor(n)};--k:${k}">${subTag(n)}</span>`).join('') || '<span class="idc-empty">No subjects yet</span>';
  view.innerHTML = `<div class="wrap au" id="au"><div class="au-box rv" data-rv="scale">
  <section class="au-stage" id="stage">
    <div class="au-robot">${ROBOT}</div>
    <div class="au-side">
      <div class="au-fold"><span class="eyebrow"><span class="dot"></span>Your student pass</span>
      <div class="idcard" id="idc"><div class="idc-in">
        <div class="idc-face front">
          <div class="idc-top">${LOGO}<span class="idc-t">EdgeStudy pass</span><span class="idc-no">No. ${no}</span></div>
          <div class="idc-name"><span id="idName">Your name</span><i class="caret" aria-hidden="true"></i></div>
          <div class="idc-subs" id="idSubs">${subsHTML()}</div>
          <div class="idc-foot"><span id="idMail">Level 1 &middot; 0 XP</span><span class="idc-sec" id="idSec" data-s="0" title="Password strength"><i></i><i></i><i></i><i></i></span></div>
        </div>
        <div class="idc-face back" id="idBack"></div>
      </div></div></div>
      <div class="au-bub" id="bub" aria-live="polite"></div>
    </div>
  </section>
  <form class="au-form" id="f">
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
      <label for="e">Email</label><div class="fxin"><input id="e" type="email" required autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false">${CHECK}</div>
      <div class="hint" id="eh" aria-live="polite"></div>
      ${pwf('p', 'Password', 'new-password')}
      <div class="caps" id="caps" hidden role="status">Caps Lock is on</div>
      <div class="meter" id="mt" data-s="0" aria-live="polite"><span class="bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span><small id="ml">${SLABEL[0]}</small></div>
      ${pwf('p2', 'Confirm password', 'new-password')}<div class="hint" id="h" aria-live="polite"></div>
      <div class="row2"><button type="button" class="btn bk">Back</button><button class="btn primary morph" id="go"><span class="lbl">Create account</span><span class="spin" aria-hidden="true"></span>${CHECK}</button></div></fieldset>
    <div class="msg" id="m" role="alert" hidden></div>
    <p class="switch">Already have an account? <a class="tl" href="#/login">Log in</a></p>
  </form></div></div>`;
  Edgy.mount($('#stage'));
  const f = $('#f'), steps = [...f.querySelectorAll('.stp')], m = $('#m'), idc = $('#idc'); let step = 0;
  const HINTS = ['Hi, I\'m Edgy. What should I call you?', 'Pick the subjects you study. Your pass updates as you go.', 'Last step. Use a strong password and I will look away.'];
  Edgy.say(HINTS[0]); keyboardFold($('.au-box'));
  const tilt = () => { if (RM) return; idc.style.setProperty('--ry', (Math.random() * 6 - 3) + 'deg'); idc.style.setProperty('--rx', (Math.random() * 4 - 2) + 'deg'); clearTimeout(tilt.t); tilt.t = setTimeout(() => { idc.style.setProperty('--ry', '0deg'); idc.style.setProperty('--rx', '0deg'); }, 160); };
  const show = n => {
    m.hidden = true; f.style.setProperty('--dir', n > step ? 1 : -1); step = n;
    steps.forEach((s, i) => s.classList.toggle('on', i === n));
    f.querySelectorAll('.steps i').forEach((d, i) => d.classList.toggle('on', i <= n));
    $('#sc').textContent = `Step ${n + 1} of 3`;
    const nm = $('#n').value.trim().split(' ')[0];
    Edgy.say(n === 1 && nm ? `Nice to meet you, ${nm}. Which subjects do you study?` : HINTS[n]);
    steps[n].querySelector('input,button.pk')?.focus({ preventScroll: true });
  };
  f.querySelectorAll('.nx').forEach(b => b.onclick = () => {
    if (step === 0 && !$('#n').reportValidity()) return shake(f);
    if (step === 1 && !pick.size) { shake(f); return say(m, 'Pick at least one subject.'); }
    show(step + 1);
  });
  f.querySelectorAll('.bk').forEach(b => b.onclick = () => show(step - 1));
  $('#n').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); f.querySelector('.nx').click(); } });
  f.querySelectorAll('.pk').forEach(b => b.onclick = () => {
    const s = b.dataset.s; pick.has(s) ? pick.delete(s) : pick.add(s);
    b.setAttribute('aria-pressed', String(pick.has(s))); $('#idSubs').innerHTML = subsHTML(); tilt(); Edgy.pulse();
  });
  const chk = () => {
    const a = $('#p').value, b2 = $('#p2').value, sc = strength(a), h = $('#h');
    $('#mt').dataset.s = sc; $('#ml').textContent = SLABEL[sc]; $('#idSec').dataset.s = sc;
    if (a && step === 2) Edgy.say(sc >= 3 ? 'That is a strong password.' : sc >= 1 ? 'Add numbers, capitals or a symbol to make it stronger.' : 'Use at least 6 characters.');
    if (!b2) { h.textContent = ''; return; }
    const ok = a === b2; h.className = 'hint ' + (ok ? 'ok' : 'err'); h.textContent = ok ? 'Passwords match' : 'Passwords do not match';
  };
  wireTyping(f, { onType: i => {
    tilt();
    if (i.id === 'n') { $('#idName').textContent = i.value.trim() || 'Your name'; idc.classList.add('live'); }
    if (i.id === 'e') { mailHint(i); $('#idMail').textContent = i.value.includes('@') && i.validity.valid ? '@' + i.value.split('@')[0].toLowerCase() : 'Level 1 \u00b7 0 XP'; }
    if (i.id === 'p' || i.id === 'p2') chk();
  } });
  f.onsubmit = async e => {
    e.preventDefault(); const b = $('#go'), pw = $('#p').value;
    if (pw !== $('#p2').value) { shake(f); Edgy.mood('sad'); setTimeout(() => Edgy.mood('shy'), 1200); return say(m, 'Passwords do not match. Please re-enter them.'); }
    b.disabled = true; b.classList.add('busy'); holdRoute = true; Edgy.mood('idle'); Edgy.say('Creating your pass...');
    const name = $('#n').value.trim(), em = $('#e').value.trim();
    let r;
    try { r = await sb.auth.signUp({ email: em, password: pw, options: { data: { full_name: name } } }); }
    catch (err) { console.error(err); r = { error: { message: 'Network problem. Please try again.' } }; }
    if (r.error) { holdRoute = false; b.disabled = false; b.classList.remove('busy'); shake(f); Edgy.mood('sad'); Edgy.say('Something went wrong. Please check the details.'); setTimeout(() => Edgy.mood('idle'), 1800); return say(m, r.error.message); }
    Store.global('pending', { subjects: [...pick] });
    Accounts.remember(em, name, 0);
    if (r.data?.session) { try { await setUser(r.data.user); } catch (err) { console.error(err); } }
    b.classList.replace('busy', 'done'); Edgy.mood('happy');
    const first = esc(name.split(' ')[0]);
    $('#idBack').innerHTML = r.data.session
      ? `<span class="kicker">Pass activated</span><h3>Welcome aboard, ${first}.</h3><p>Setting up your study space now.</p>`
      : `<span class="kicker">One last step</span><h3>Check your inbox, ${first}.</h3><p>We sent a confirmation link to ${esc(em)}. Confirm it, then log in.</p><a class="btn primary sm" href="#/login">Go to log in</a>`;
    Edgy.say(r.data.session ? `Welcome, ${name.split(' ')[0]}!` : 'Check your inbox to confirm your account.');
    $('.au-box').classList.remove('kb'); idc.classList.add('flip'); idc.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => burstAt(idc, 120), 420);
    if (r.data.session) { setTimeout(async () => { try { await Gate.play('Setting up your study space'); } catch (err) { console.error(err); } holdRoute = false; go('#/app'); }, 1500); }
    else { holdRoute = false; say(m, 'Account created. Check your email to confirm it, then log in.', 'ok'); }
  };
}
