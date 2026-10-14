/* ---------- Dot field: a quiet constellation behind every page.
   Dots drift slowly, parallax with scroll, are pushed away by a finger or cursor, and ripple on tap and while typing.
   Keeps the old Field API (ripple, pulse, spark, kick) so the rest of the app is unchanged. ---------- */
const Field = {
  ripples: [], sparks: [], pts: [], running: false, hue: 0, last: 0, wake: 0, sy: 0, ptr: { x: -999, y: -999, down: false }, frames: 0, slow: 0,
  init() {
    this.bg = document.getElementById('field'); this.fg = document.getElementById('spark');
    if (!this.bg?.getContext) return;
    let rt; const fit = () => { ({ ctx: this.b, w: this.w, h: this.h } = fitCanvas(this.bg)); ({ ctx: this.f } = fitCanvas(this.fg)); this.seed(); this.kick(); };
    fit(); addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(fit, 120); });
    addEventListener('pointerdown', e => {
      this.ptr = { x: e.clientX, y: e.clientY, down: true };
      if (e.target.closest('input,textarea,select')) return;
      const c = ACC[this.hue++ % 3]; this.ripple(e.clientX, e.clientY, c);
      if (e.target.closest('.btn.primary,.tchk,[data-focus=toggle]')) this.spark(e.clientX, e.clientY, 14, c);
    }, { passive: true });
    addEventListener('pointermove', e => { if (e.pointerType === 'mouse' || this.ptr.down) { this.ptr.x = e.clientX; this.ptr.y = e.clientY; this.kick(); } }, { passive: true });
    const up = () => { this.ptr.down = false; if (matchMedia('(hover:none)').matches) { this.ptr.x = -999; this.ptr.y = -999; } };
    addEventListener('pointerup', up, { passive: true }); addEventListener('pointercancel', up, { passive: true });
    addEventListener('keydown', e => {
      const t = e.target; if (!t.matches?.('input,textarea') || e.key.length > 1 && e.key !== 'Backspace') return;
      const r = t.getBoundingClientRect(), x = Math.min(r.right - 18, r.left + 16 + (t.value.length + 1) * 8.4);
      this.ripple(x, r.top + r.height / 2, e.key === 'Backspace' ? [255, 143, 131] : ACC[0], .45);
    });
    addEventListener('scroll', () => this.kick(), { passive: true });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) this.kick(); });
  },
  seed() {
    const n = Math.max(30, Math.min(64, Math.round(this.w * this.h / 12000)));
    this.pts = Array.from({ length: n }, () => ({ x: Math.random() * this.w, y: Math.random() * this.h, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3, r: .9 + Math.random() * 1.1, z: .3 + Math.random() * .7, ox: 0, oy: 0 }));
  },
  ripple(x, y, c = ACC[0], power = 1) { if (RM) return; this.ripples.push({ x, y, c, p: power, t: performance.now() }); if (this.ripples.length > 6) this.ripples.shift(); this.kick(); },
  pulse(c = ACC[0]) { this.ripple(innerWidth / 2, innerHeight * .4, c, .7); },
  spark(x, y, n = 70, c) {
    if (RM) return;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = (n > 30 ? 4 : 2) + Math.random() * (n > 30 ? 9 : 4);
      this.sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - (n > 30 ? 4 : 1), r: Math.random() * 6.28, vr: (Math.random() - .5) * .4, c: c && n < 30 ? c : ACC[(Math.random() * 3) | 0], life: 1, sz: 4 + Math.random() * 6, g: .28 });
    }
    this.kick();
  },
  kick() { this.wake = performance.now(); if (!this.running && this.b && !document.hidden) { this.running = true; requestAnimationFrame(t => this.draw(t)); } },
  draw(now) {
    if (document.hidden) { this.running = false; return; }
    const { b, f, w, h } = this;
    if (now - this.last < 30) { requestAnimationFrame(t => this.draw(t)); return; }   // ~30fps is plenty for a background
    const dt = Math.min(2, (now - this.last) / 16.7 || 1); if (this.last) { this.frames++; if (this.frames > 20 && this.frames < 120 && now - this.last > 60) this.slow++; if (this.frames === 120 && this.slow > 50) this.pts.length = Math.round(this.pts.length * .55); }
    this.last = now;
    this.ripples = this.ripples.filter(r => now - r.t < 1600);
    const sy = scrollY, ds = sy - this.sy; this.sy = sy;
    const [cr, cg, cb] = ACC[0], P = this.pts, px = this.ptr.x, py = this.ptr.y;
    b.clearRect(0, 0, w, h);
    for (const p of P) {
      if (!RM) { p.x += p.vx * dt; p.y += p.vy * dt - ds * .1 * p.z; }
      if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;
      // pointer push + ripple push (smoothed so dots glide back)
      let tx = 0, ty = 0, band = 0, col = null;
      const ddx = p.x - px, ddy = p.y - py, d2 = ddx * ddx + ddy * ddy;
      if (d2 < 17000) { const d = Math.sqrt(d2) || 1, k = (130 - d) / 130 * 26; tx += ddx / d * k; ty += ddy / d * k; }
      for (const r of this.ripples) {
        const age = (now - r.t) / 1600, rad = age * 620, d = Math.hypot(p.x - r.x, p.y - r.y), bd = Math.exp(-((d - rad) ** 2) / 1800) * (1 - age) * r.p;
        if (bd > .02) { const k = bd * 16 / (d || 1); tx += (p.x - r.x) * k; ty += (p.y - r.y) * k; if (bd > band) { band = bd; col = r.c; } }
      }
      p.ox += (tx - p.ox) * .18; p.oy += (ty - p.oy) * .18; p.dx = p.x + p.ox; p.dy = p.y + p.oy; p.band = band; p.col = col;
    }
    for (const p of P) {
      const c = p.col ? mixc([cr, cg, cb], p.col, Math.min(1, p.band * 2)) : [cr, cg, cb];
      b.fillStyle = rgba(c, Math.min(.9, .5 + p.band * .5)); b.beginPath(); b.arc(p.dx, p.dy, p.r + p.band * 1.4, 0, 6.283); b.fill();
    }
    b.lineWidth = 1;
    for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
      const a = P[i], c = P[j], dx = a.dx - c.dx, dy = a.dy - c.dy, d2 = dx * dx + dy * dy;
      if (d2 < 14400) { const al = (1 - d2 / 14400) * (.15 + Math.max(a.band, c.band) * .5); b.strokeStyle = rgba(a.col || c.col || [cr, cg, cb], al); b.beginPath(); b.moveTo(a.dx, a.dy); b.lineTo(c.dx, c.dy); b.stroke(); }
    }
    f.clearRect(0, 0, w, h);
    this.sparks = this.sparks.filter(p => p.life > 0);
    for (const p of this.sparks) {
      p.vy += p.g; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life -= .012;
      f.save(); f.translate(p.x, p.y); f.rotate(p.r); f.fillStyle = rgba(p.c, Math.max(0, p.life)); f.fillRect(-p.sz / 2, -p.sz / 4, p.sz, p.sz / 2); f.restore();
    }
    // sleep when nothing has happened for a while (saves battery); any input wakes it again
    if (!RM && (now - this.wake < 45000 || this.ripples.length || this.sparks.length)) requestAnimationFrame(t => this.draw(t));
    else this.running = false;
  }
};
