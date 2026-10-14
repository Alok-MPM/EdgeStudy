/* ---------- Touch glow: a soft light follows the finger inside the card you press. One shared overlay, no DOM changes to the cards. ---------- */
(() => {
  if (RM) return;
  const SEL = '.glass,.sc,.cc,.box,.tk,.card,.li,.pk,.dp,.btn,.tab,.tabbar a,.stat,.tchk,.hc';
  const SKIP = 'input,textarea,select,label,.lesson,.thread,#les,.idcard,.k-comp,.au-box,.au-stage,.au-form,.crop-card';
  const gl = document.createElement('div'); gl.id = 'glow'; gl.setAttribute('aria-hidden', 'true'); document.body.append(gl);
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  let cur = null, since = 0, timer = 0, raf = 0, hoverEl = null;
  const place = (t, e, cls) => {
    const r = t.getBoundingClientRect();
    if (r.width * r.height > innerWidth * innerHeight * .55) return false;
    gl.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;border-radius:${getComputedStyle(t).borderRadius};--gx:${e.clientX - r.left}px;--gy:${e.clientY - r.top}px`;
    gl.className = cls + (t.matches('.btn.primary') ? ' lt' : '');
    return true;
  };
  const release = () => { clearTimeout(timer); gl.className = ''; if (cur) { cur.classList.remove('glow-on'); cur = null; } };
  addEventListener('pointerdown', e => {
    const t = e.target.closest?.(SEL); if (!t || e.target.closest?.(SKIP)) return;
    release(); if (place(t, e, 'on')) { cur = t; since = performance.now(); t.classList.add('glow-on'); }
  }, { passive: true });
  const up = () => { if (!cur) return; clearTimeout(timer); timer = setTimeout(release, Math.max(0, 260 - (performance.now() - since))); };
  addEventListener('pointerup', up, { passive: true }); addEventListener('pointercancel', release, { passive: true });
  addEventListener('scroll', () => { if (cur) release(); }, { passive: true });
  if (fine) addEventListener('pointermove', e => {
    if (cur || raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0; const t = e.target.closest?.(SEL);
      if (!t || e.target.closest?.(SKIP)) { if (hoverEl) { hoverEl = null; gl.className = ''; } return; }
      hoverEl = t; place(t, e, 'hov');
    });
  }, { passive: true });
})();
