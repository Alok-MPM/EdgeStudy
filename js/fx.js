/* =========================================================
   EdgeStudy FX: particle intro, living dot field, confetti,
   toasts, level-up and the unlock gate. All motion reacts to
   taps, typing, scrolling and study activity. Never to hover.
   ========================================================= */
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ACC = [[94, 226, 188], [255, 195, 107], [184, 162, 255]];
const INK = [245, 247, 252];
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const DPR = Math.min(window.devicePixelRatio || 1, 2);

function fitCanvas(cv) {
  const w = innerWidth, h = innerHeight;
  cv.width = Math.round(w * DPR); cv.height = Math.round(h * DPR);
  cv.style.width = w + 'px'; cv.style.height = h + 'px';
  const ctx = cv.getContext('2d'); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  return { ctx, w, h };
}

/* ---------- Intro: particles assemble the wordmark, then burst ---------- */
const Boot = {
  run(ready, done) {
    const el = document.getElementById('boot'), cv = document.getElementById('bootCanvas');
    const pctEl = document.getElementById('bootPct'), bar = document.getElementById('bootBar'), logEl = document.getElementById('bootLog');
    let quick = RM; try { quick = quick || sessionStorage.getItem('es-boot') === '1'; } catch (e) {}
    const LINES = ['Sharpening pencils', 'Loading Physics', 'Loading Chemistry', 'Loading Mathematics', 'Opening your journal', 'Warming up the planner', 'Almost there'];
    let isReady = false, p = 0, shown = -1, finished = false;
    ready.finally(() => (isReady = true)); setTimeout(() => (isReady = true), 7000);
    const t0 = performance.now(), min = quick ? 900 : 2600;

    const finish = () => {
      if (finished) return; finished = true;
      try { sessionStorage.setItem('es-boot', '1'); } catch (e) {}
      el.classList.add('out'); document.body.classList.remove('locked');
      burst();
      setTimeout(done, quick ? 120 : 380);
      setTimeout(() => el.remove(), 1700);
    };
    const progress = now => {
      const dt = now - t0, target = isReady && dt >= min ? 100 : Math.min(94, dt / min * 94);
      p += (target - p) * (quick ? .25 : .08); if (target === 100 && p > 99.4) p = 100;
      pctEl.textContent = pad2(Math.floor(p)); bar.style.transform = `scaleX(${p / 100})`;
      const li = Math.min(LINES.length - 1, Math.floor(p / 100 * LINES.length));
      if (li !== shown) { shown = li; const s = document.createElement('span'); s.textContent = LINES[li]; logEl.replaceChildren(s); }
      return p >= 100;
    };

    if (RM || !cv.getContext) { const f = n => (progress(n) ? finish() : requestAnimationFrame(f)); requestAnimationFrame(f); return; }

    let { ctx, w, h } = fitCanvas(cv);
    const N = Math.min(1500, Math.round(w * h / 520));
    const P = Array.from({ length: N }, () => {
      const a = Math.random() * Math.PI * 2, r = Math.max(w, h) * (.55 + Math.random() * .5);
      return { x: w / 2 + Math.cos(a) * r, y: h / 2 + Math.sin(a) * r, vx: 0, vy: 0, tx: null, ty: null, c0: ACC[(Math.random() * 3) | 0], c1: INK, ph: Math.random() * 6.28, d: .9 + Math.random() * 1.6 };
    });
    let mode = 'gather';

    const sample = () => {
      const o = document.createElement('canvas'); o.width = w; o.height = h;
      const g = o.getContext('2d'), fs = Math.min(w * .16, 176);
      g.font = `800 ${fs}px "Bricolage Grotesque", system-ui, sans-serif`; g.textBaseline = 'middle';
      const full = g.measureText('EdgeStudy').width, edge = g.measureText('Edge').width, x0 = (w - full) / 2, y0 = h * .42;
      g.fillText('EdgeStudy', x0, y0);
      const data = g.getImageData(0, 0, w, h).data, gap = Math.max(3, Math.round(fs / 30)), pts = [];
      for (let y = 0; y < h; y += gap) for (let x = 0; x < w; x += gap) if (data[(y * w + x) * 4 + 3] > 140) pts.push([x, y, x < x0 + edge ? INK : ACC[0]]);
      for (let i = pts.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pts[i], pts[j]] = [pts[j], pts[i]]; }
      P.forEach((q, i) => { const t = pts[i % pts.length]; if (t) { q.tx = t[0]; q.ty = t[1]; q.c1 = t[2]; } });
      el.style.setProperty('--wordY', `${y0 + fs * .62}px`);
    };
    Promise.race([document.fonts ? document.fonts.load('800 160px "Bricolage Grotesque"') : null, new Promise(r => setTimeout(r, 700))]).then(sample, sample);

    function burst() {
      mode = 'burst';
      for (const q of P) { const a = Math.atan2(q.y - h * .42, q.x - w / 2) + (Math.random() - .5) * .6, s = 6 + Math.random() * 16; q.vx = Math.cos(a) * s; q.vy = Math.sin(a) * s; }
    }
    let alpha = 1;
    const frame = now => {
      if (!finished && progress(now)) finish();
      ctx.clearRect(0, 0, w, h);
      if (mode === 'burst') alpha -= .022;
      for (const q of P) {
        if (mode === 'gather' && q.tx !== null) {
          q.vx += (q.tx - q.x) * .022; q.vy += (q.ty - q.y) * .022; q.vx *= .82; q.vy *= .82;
        } else if (mode === 'burst') { q.vx *= .96; q.vy *= .96; }
        else { q.vx += Math.sin(now / 900 + q.ph) * .04; q.vy += Math.cos(now / 1100 + q.ph) * .04; q.vx *= .97; q.vy *= .97; }
        q.x += q.vx; q.y += q.vy;
        const near = q.tx === null ? 0 : Math.max(0, 1 - Math.hypot(q.tx - q.x, q.ty - q.y) / 160);
        const tw = mode === 'gather' && near > .97 ? .75 + Math.sin(now / 260 + q.ph) * .25 : 1;
        ctx.fillStyle = rgba(mixc(q.c0, q.c1, near), Math.max(0, alpha) * (.35 + near * .65) * tw);
        ctx.fillRect(q.x, q.y, q.d, q.d);
      }
      if (alpha > 0) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
};

/* ---------- Living field: background dots ripple on tap, typing and study ---------- */
const Field = {
  ripples: [], sparks: [], running: false, hue: 0, oy: 0,
  init() {
    this.bg = document.getElementById('field'); this.fg = document.getElementById('spark');
    if (!this.bg?.getContext) return;
    const fit = () => { ({ ctx: this.b, w: this.w, h: this.h } = fitCanvas(this.bg)); ({ ctx: this.f } = fitCanvas(this.fg)); this.kick(); };
    fit(); addEventListener('resize', fit);
    addEventListener('pointerdown', e => {
      if (e.target.closest('input,textarea,select')) return;
      const c = ACC[this.hue++ % 3]; this.ripple(e.clientX, e.clientY, c);
      if (e.target.closest('.btn.primary,.tchk,[data-focus=toggle]')) this.spark(e.clientX, e.clientY, 14, c);
    }, { passive: true });
    addEventListener('keydown', e => {
      const t = e.target; if (!t.matches?.('input,textarea') || e.key.length > 1 && e.key !== 'Backspace') return;
      const r = t.getBoundingClientRect(), x = Math.min(r.right - 18, r.left + 16 + (t.value.length + 1) * 8.4);
      this.ripple(x, r.top + r.height / 2, e.key === 'Backspace' ? [255, 143, 131] : ACC[0], .45);
    });
    addEventListener('scroll', () => this.kick(), { passive: true });
  },
  ripple(x, y, c = ACC[0], power = 1) { if (RM) return; this.ripples.push({ x, y, c, p: power, t: performance.now() }); if (this.ripples.length > 6) this.ripples.shift(); this.kick(); },
  pulse(c = ACC[0]) { this.ripple(innerWidth / 2, innerHeight * .4, c, .7); },
  spark(x, y, n = 70, c) {
    if (RM) return;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = (n > 30 ? 4 : 2) + Math.random() * (n > 30 ? 9 : 4);
      this.sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - (n > 30 ? 4 : 1), r: Math.random() * 6.28, vr: (Math.random() - .5) * .4, c: c && n < 30 ? c : ACC[(Math.random() * 3) | 0], life: 1, sz: n > 30 ? 4 + Math.random() * 5 : 2 + Math.random() * 2, g: n > 30 ? .22 : .05 });
    }
    this.kick();
  },
  kick() { if (!this.running && this.b) { this.running = true; requestAnimationFrame(t => this.draw(t)); } },
  draw(now) {
    const { b, f, w, h } = this, gap = 30;
    this.ripples = this.ripples.filter(r => now - r.t < 1600);
    this.oy = -(scrollY * .18) % gap;
    b.clearRect(0, 0, w, h);
    for (let y = this.oy - gap; y < h + gap; y += gap) for (let x = gap / 2; x < w; x += gap) {
      let a = .055, dx = 0, dy = 0, col = null, best = 0;
      for (const r of this.ripples) {
        const age = (now - r.t) / 1600, rad = age * 620, d = Math.hypot(x - r.x, y - r.y), band = Math.exp(-((d - rad) ** 2) / 1800) * (1 - age) * r.p;
        if (band > .02) { a += band * .75; const k = band * 7 / (d || 1); dx += (x - r.x) * k; dy += (y - r.y) * k; if (band > best) { best = band; col = r.c; } }
      }
      b.fillStyle = col ? rgba(mixc([164, 175, 192], col, Math.min(1, best * 2)), Math.min(.9, a)) : `rgba(164,175,192,${a})`;
      const s = col ? 1.6 + best * 1.6 : 1.4; b.fillRect(x + dx - s / 2, y + dy - s / 2, s, s);
    }
    f.clearRect(0, 0, w, h);
    this.sparks = this.sparks.filter(p => p.life > 0);
    for (const p of this.sparks) {
      p.vy += p.g; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life -= .012;
      f.save(); f.translate(p.x, p.y); f.rotate(p.r); f.fillStyle = rgba(p.c, Math.max(0, p.life)); f.fillRect(-p.sz / 2, -p.sz / 4, p.sz, p.sz / 2); f.restore();
    }
    if (this.ripples.length || this.sparks.length) requestAnimationFrame(t => this.draw(t));
    else this.running = false;
  }
};
const burstAt = (el, n = 90) => { const r = el?.getBoundingClientRect?.() || { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 }; Field.spark(r.left + r.width / 2, r.top + r.height / 2, n); };

/* ---------- Toasts ---------- */
const Toast = {
  show(title, sub = '', a = 'var(--mint)') {
    const box = document.getElementById('toasts'); if (!box) return;
    const t = document.createElement('div'); t.className = 'toast'; t.style.setProperty('--a', a);
    t.innerHTML = `<i aria-hidden="true"></i><span><b></b><small></small></span>`;
    t.querySelector('b').textContent = title; t.querySelector('small').textContent = sub;
    box.append(t); while (box.children.length > 3) box.firstChild.remove();
    requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('in')));
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 600); }, 3600);
  }
};

/* ---------- Level up ---------- */
function levelUp(level) {
  const o = document.createElement('div'); o.className = 'lvup'; o.setAttribute('role', 'status');
  o.innerHTML = `<div class="lvup-card glass"><span class="kicker">Level up</span><b class="lvup-n"><span>${level - 1}</span><span>${level}</span></b><p>You reached level ${level}. Keep the streak going.</p></div>`;
  document.body.append(o);
  requestAnimationFrame(() => requestAnimationFrame(() => { o.classList.add('on'); setTimeout(() => burstAt(o.querySelector('.lvup-card'), 120), 380); }));
  const close = () => { o.classList.add('off'); setTimeout(() => o.remove(), 700); };
  o.addEventListener('click', close); setTimeout(close, 2800);
}

/* ---------- Unlock gate shown after login / signup ---------- */
const Gate = {
  play(label) {
    return new Promise(res => {
      const g = document.createElement('div'); g.className = 'gate'; g.setAttribute('aria-hidden', 'true');
      g.innerHTML = `<div class="gate-in"><svg class="gmark" viewBox="0 0 76 76"><rect class="frame" x="1" y="1" width="74" height="74" rx="20"/><rect class="sp" x="24" y="22" width="7" height="32" rx="3.5"/><rect class="br b1" x="24" y="22" width="30" height="7" rx="3.5"/><rect class="br b2" x="24" y="34.5" width="21" height="7" rx="3.5"/><rect class="br b3" x="24" y="47" width="30" height="7" rx="3.5"/></svg><p></p></div>`;
      g.querySelector('p').textContent = label; document.body.append(g);
      requestAnimationFrame(() => requestAnimationFrame(() => g.classList.add('on')));
      setTimeout(() => { res(); setTimeout(() => { g.classList.add('out'); setTimeout(() => g.remove(), 1000); }, 260); }, RM ? 150 : 1350);
    });
  }
};
const shake = el => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
