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
    const W = bmp.width, H = bmp.height, S = 280, min = Math.max(S / W, S / H);
    const m = document.createElement('div'); m.className = 'crop';
    m.innerHTML = `<div class="crop-card" role="dialog" aria-modal="true" aria-label="Adjust your photo"><h3>Adjust your photo</h3><p>Drag to move. Use the slider to zoom.</p><div class="crop-stage"><canvas width="${S * 2}" height="${S * 2}"></canvas><i class="crop-ring"></i></div><input type="range" min="1" max="3" step="0.01" value="1" aria-label="Zoom"><div class="crop-btns"><button type="button" class="btn" data-x>Cancel</button><button type="button" class="btn primary" data-ok>Save photo</button></div></div>`;
    document.body.append(m);
    const cv = m.querySelector('canvas'), ctx = cv.getContext('2d'), st = m.querySelector('.crop-stage'), rg = m.querySelector('input');
    let z = 1, ox = (S - W * min) / 2, oy = (S - H * min) / 2;
    const draw = () => {
      const sc = min * z; ox = Math.min(0, Math.max(S - W * sc, ox)); oy = Math.min(0, Math.max(S - H * sc, oy));
      ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.fillStyle = '#0b0f17'; ctx.fillRect(0, 0, S, S); ctx.drawImage(bmp, ox, oy, W * sc, H * sc);
    };
    const setZ = nz => { const cx = (S / 2 - ox) / (min * z), cy = (S / 2 - oy) / (min * z); z = Math.min(3, Math.max(1, nz)); ox = S / 2 - cx * min * z; oy = S / 2 - cy * min * z; rg.value = z; draw(); };
    draw(); rg.oninput = () => setZ(+rg.value);
    st.addEventListener('wheel', e => { e.preventDefault(); setZ(z - e.deltaY * .002); }, { passive: false });
    let drag = null; const k = () => S / st.clientWidth;
    st.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, ox, oy }; st.setPointerCapture(e.pointerId); st.style.cursor = 'grabbing'; });
    st.addEventListener('pointermove', e => { if (!drag) return; ox = drag.ox + (e.clientX - drag.x) * k(); oy = drag.oy + (e.clientY - drag.y) * k(); draw(); });
    const end = () => { drag = null; st.style.cursor = ''; }; st.addEventListener('pointerup', end); st.addEventListener('pointercancel', end);
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
