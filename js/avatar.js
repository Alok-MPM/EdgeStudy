/* ---------- Profile photo: pick, crop, save. Shown instantly from this device, kept in the "avatars" storage bucket for other devices. ---------- */
const toDataURL = b => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(b); });
const Avatar = {
  src: null,
  path() { return `${me.id}/avatar.jpg`; },
  lk() { return `es:${me.id}:avatar`; },
  async init() {
    if (!me) { this.src = null; this.apply(); return; }
    try { this.src = localStorage.getItem(this.lk()) || null; } catch (e) { this.src = null; }
    this.apply();
    const tag = 'es-av-' + me.id; try { if (sessionStorage.getItem(tag)) return; sessionStorage.setItem(tag, '1'); } catch (e) {}
    if (!sb) return;
    try {   // once per visit, pick up a photo set on another device
      const { data, error } = await sb.storage.from('avatars').createSignedUrl(this.path(), 600);
      if (error || !data?.signedUrl) return;
      const du = await toDataURL(await (await fetch(data.signedUrl)).blob());
      if (du !== this.src) { this.src = du; try { localStorage.setItem(this.lk(), du); } catch (e) {} this.apply(); }
    } catch (e) {}
  },
  apply(root = document) {
    root.querySelectorAll('.av').forEach(a => { a.classList.toggle('img', !!this.src); a.style.backgroundImage = this.src ? `url("${this.src}")` : ''; });
    const rm = document.getElementById('avrm'); if (rm) rm.hidden = !this.src;
  },
  pick() {
    const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*';
    i.onchange = () => { const f = i.files?.[0]; if (f) this.crop(f); }; i.click();
  },
  async crop(file) {
    let bmp;
    try { bmp = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
    catch (e) { try { bmp = await createImageBitmap(file); } catch (e2) { return Toast.show('Could not open that image', 'Please choose a JPG or PNG photo.', 'var(--coral)'); } }
    const W = bmp.width, H = bmp.height, S = 280, cover = Math.max(S / W, S / H), fit = Math.min(S / W, S / H), lo = fit * 0.2, hi = cover * 10;
    const m = document.createElement('div'); m.className = 'crop';
    m.innerHTML = `<div class="crop-card" role="dialog" aria-modal="true" aria-label="Adjust your photo"><h3>Adjust your photo</h3><p>Drag to move. Pinch or scroll to zoom in and out.</p><div class="crop-stage"><canvas width="${S * 2}" height="${S * 2}"></canvas><i class="crop-ring"></i></div><div class="crop-zoom"><button type="button" class="btn sm" data-zo aria-label="Zoom out">&minus;</button><button type="button" class="btn sm" data-fit>Fit</button><button type="button" class="btn sm" data-zi aria-label="Zoom in">+</button></div><div class="crop-btns"><button type="button" class="btn" data-x>Cancel</button><button type="button" class="btn primary" data-ok>Save photo</button></div></div>`;
    document.body.append(m);
    const cv = m.querySelector('canvas'), ctx = cv.getContext('2d'), st = m.querySelector('.crop-stage');
    let sc = cover, ox = (S - W * sc) / 2, oy = (S - H * sc) / 2;
    /* free pan: only stop the photo from being dragged completely out of the frame */
    const keep = () => { const vw = Math.min(48, W * sc), vh = Math.min(48, H * sc); ox = Math.min(S - vw, Math.max(vw - W * sc, ox)); oy = Math.min(S - vh, Math.max(vh - H * sc, oy)); };
    const draw = () => {
      keep(); ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.imageSmoothingQuality = 'high'; ctx.fillStyle = '#0b0f17'; ctx.fillRect(0, 0, S, S); ctx.drawImage(bmp, ox, oy, W * sc, H * sc);
    };
    /* zoom around a point (px, py) in frame coordinates; no fixed minimum, zoom out as far as you like */
    const zoomAt = (f, px, py) => { const n = Math.min(hi, Math.max(lo, sc * f)); ox = px - (px - ox) * n / sc; oy = py - (py - oy) * n / sc; sc = n; draw(); };
    const k = () => S / st.clientWidth;
    draw();
    st.addEventListener('wheel', e => { e.preventDefault(); const r = st.getBoundingClientRect(); zoomAt(Math.exp(-e.deltaY * .0015), (e.clientX - r.left) * k(), (e.clientY - r.top) * k()); }, { passive: false });
    m.querySelector('[data-zi]').onclick = () => zoomAt(1.25, S / 2, S / 2);
    m.querySelector('[data-zo]').onclick = () => zoomAt(1 / 1.25, S / 2, S / 2);
    m.querySelector('[data-fit]').onclick = () => { sc = fit; ox = (S - W * sc) / 2; oy = (S - H * sc) / 2; draw(); };
    /* one finger or mouse drags, two fingers pinch to zoom and move together */
    const ptrs = new Map(); let pin = null;
    const mid = () => { const [a, b] = [...ptrs.values()]; return { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; };
    st.addEventListener('pointerdown', e => { ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); st.setPointerCapture(e.pointerId); st.style.cursor = 'grabbing'; if (ptrs.size === 2) pin = mid(); });
    st.addEventListener('pointermove', e => {
      const p = ptrs.get(e.pointerId); if (!p) return;
      const px = p.x, py = p.y; p.x = e.clientX; p.y = e.clientY;
      if (ptrs.size === 1) { ox += (p.x - px) * k(); oy += (p.y - py) * k(); draw(); }
      else if (ptrs.size === 2 && pin) { const c = mid(), r = st.getBoundingClientRect(); ox += (c.x - pin.x) * k(); oy += (c.y - pin.y) * k(); zoomAt(c.d / pin.d, (c.x - r.left) * k(), (c.y - r.top) * k()); pin = c; }
    });
    const end = e => { ptrs.delete(e.pointerId); pin = ptrs.size === 2 ? mid() : null; if (!ptrs.size) st.style.cursor = ''; };
    st.addEventListener('pointerup', end); st.addEventListener('pointercancel', end);
    const close = () => { m.remove(); bmp.close?.(); document.removeEventListener('keydown', key); };
    const key = e => { if (e.key === 'Escape') close(); }; document.addEventListener('keydown', key);
    m.addEventListener('click', e => { if (e.target === m) close(); }); m.querySelector('[data-x]').onclick = close;
    m.querySelector('[data-ok]').onclick = async e => {
      e.currentTarget.disabled = true;
      const oc = document.createElement('canvas'); oc.width = oc.height = 256; oc.getContext('2d').drawImage(cv, 0, 0, cv.width, cv.height, 0, 0, 256, 256);
      const blob = await new Promise(r => oc.toBlob(r, 'image/jpeg', .86)); close(); await this.save(blob);
    };
  },
  async save(blob) {
    this.src = await toDataURL(blob); try { localStorage.setItem(this.lk(), this.src); } catch (e) {}
    this.apply();
    let remote = false;
    if (sb) { try { const { error } = await sb.storage.from('avatars').upload(this.path(), blob, { upsert: true, contentType: 'image/jpeg' }); remote = !error; } catch (e) {} }
    Toast.show('Profile photo updated', remote ? 'Saved to your account.' : 'Saved on this device only for now.', 'var(--mint)');
  },
  async remove() {
    this.src = null; try { localStorage.removeItem(this.lk()); } catch (e) {}
    if (sb) { try { await sb.storage.from('avatars').remove([this.path()]); } catch (e) {} }
    this.apply(); Toast.show('Photo removed', 'Your initial is shown again.', 'var(--dim)');
  }
};
