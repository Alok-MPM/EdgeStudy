/* ---------- Intro: atom + wordmark. Renders the app underneath only once, right before the fade. ---------- */
const Boot = {
  run(ready, render, done) {
    const el = document.getElementById('boot');
    if (!el) { ready.finally(() => { render(); done(); }); return; }
    const bar = document.getElementById('bootBar'), pctEl = document.getElementById('bootPct'), logEl = document.getElementById('bootLog');
    let quick = RM;
    try {
      quick = quick || sessionStorage.getItem('es-boot') === '1' || Date.now() - Number(localStorage.getItem('es-boot-ts') || 0) < 20 * 60 * 1000;
    } catch (e) {}
    if (quick) el.classList.add('quick');
    if (RM) el.querySelectorAll('animateMotion').forEach(n => n.remove());
    const LINES = ['Sharpening pencils', 'Loading Physics', 'Loading Chemistry', 'Loading Mathematics', 'Opening your journal', 'Warming up the planner', 'Almost there'];
    const t0 = performance.now(), min = quick ? 650 : 3000;
    let isReady = false, p = 0, shown = -1, lastPct = -1, last = 0, finished = false, skip = false, rendered = false;
    /* Build the page under the overlay early, while only compositor animations are on screen, so nothing stutters at the end. */
    const doRender = () => { if (rendered) return; rendered = true; try { render(); } catch (e) { console.error(e); } };
    ready.finally(() => (isReady = true)); setTimeout(() => (isReady = true), 7000);
    el.addEventListener('pointerdown', () => { if (performance.now() - t0 > 700) skip = true; });

    const finish = () => {
      if (finished) return; finished = true;
      try { sessionStorage.setItem('es-boot', '1'); if (!quick) localStorage.setItem('es-boot-ts', String(Date.now())); } catch (e) {}
      bar.style.transform = 'scaleX(1)'; pctEl.textContent = '100'; logEl.textContent = 'Ready';
      // make sure the page exists, give layout a moment to settle, then fade the overlay out
      requestAnimationFrame(() => {
        doRender();
        setTimeout(() => {
          el.classList.add('out'); document.body.classList.remove('locked');
          try { done(); } catch (e) { console.error(e); }
          setTimeout(() => el.remove(), 900);
        }, quick ? 60 : 120);
      });
    };
    const loop = now => {
      if (finished) return;
      if (now - last >= 32) {
        last = now; const dt = now - t0;
        if (!rendered && isReady && dt > 450) doRender();
        const target = isReady && (dt >= min || skip) ? 100 : Math.min(92, dt / min * 92);
        p += (target - p) * (quick ? .3 : .12); if (target === 100 && p > 99.2) p = 100;
        bar.style.transform = `scaleX(${p / 100})`;
        const pc = Math.floor(p); if (pc !== lastPct) { lastPct = pc; pctEl.textContent = String(pc).padStart(2, '0'); }
        const li = Math.min(LINES.length - 1, Math.floor(p / 100 * LINES.length));
        if (li !== shown) { shown = li; logEl.textContent = LINES[li]; }
        if (p >= 100) { finish(); return; }
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
};
