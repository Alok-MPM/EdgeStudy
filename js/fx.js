/* =========================================================
   EdgeStudy FX helpers: canvas fitting, confetti bursts, toasts,
   level-up and the unlock gate. The intro lives in intro.js, the
   dot background in dots.js and the touch glow in glow.js.
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
