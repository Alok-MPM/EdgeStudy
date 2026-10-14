/* =========================================================
   Chapter content lives in folders, one per subject, one per chapter:

     subjects/<subject>/<chapter>/theory.html
     subjects/<subject>/<chapter>/questions.html
     subjects/<subject>/<chapter>/revision.html

   <subject> and <chapter> are the names in lowercase with dashes
   (Electric Charges and Fields  ->  electric-charges-and-fields).
   Nothing needs to be registered anywhere: add a file and it shows up.
   ========================================================= */
const Content = {
  slug: t => String(t).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
  url(subject, chapter, part) { return `subjects/${this.slug(subject)}/${this.slug(chapter)}/${part}.html`; },
  /* A missing file must not be mistaken for the app shell (some hosts answer unknown paths with index.html). */
  isShell: t => /^\s*<!doctype html|^\s*<html/i.test(t),
  async load(url) {
    const r = await fetch(url, { cache: 'no-cache' });
    if (r.status === 404 || r.status === 403) return null;
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const t = await r.text();
    return !t.trim() || this.isShell(t) ? null : t;
  },
  /* Cheap existence check: asks for the first bytes only, remembered for five minutes. */
  async exists(url) {
    const k = 'es:cx:' + url;
    try { const v = JSON.parse(sessionStorage.getItem(k)); if (v && Date.now() - v.t < 3e5) return v.ok; } catch (e) {}
    let ok = false;
    try { const r = await fetch(url, { headers: { Range: 'bytes=0-63' }, cache: 'no-cache' }); if (r.ok) { const t = await r.text(); ok = !!t.trim() && !this.isShell(t); } } catch (e) {}
    try { sessionStorage.setItem(k, JSON.stringify({ ok, t: Date.now() })); } catch (e) {}
    return ok;
  },
  /* Marks each chapter card of a subject page as "Notes available" or "Notes coming soon". */
  async mark(subject, chapters, root) {
    let next = 0; const run = async () => {
      while (next < chapters.length) {
        const i = next++, c = chapters[i];
        const flags = await Promise.all(TABS.map(([t]) => this.exists(this.url(subject, c, t))));
        const card = root.querySelector(`.cc[data-i="${i}"]`); if (!card?.isConnected) continue;
        const live = flags.some(Boolean);
        card.querySelector('small').textContent = live ? 'Notes available' : 'Notes coming soon';
        card.querySelector('.btn').classList.toggle('primary', live);
      }
    };
    await Promise.all([run(), run(), run(), run()]);
  }
};
