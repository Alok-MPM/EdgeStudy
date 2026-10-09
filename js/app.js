/* ===== SETUP ===== */
const SB_URL='https://xnlpqhxkqeockawecrlm.supabase.co', SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhubHBxaHhrcWVvY2thd2VjcmxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NzA1ODEsImV4cCI6MjEwNzA0NjU4MX0.sXuA1wnH46l-R2BqUz3MKp07hPhKSV7w_yF-fV6WE_4';

/* ===== SUBJECTS AND CHAPTERS (titles only; content is added later) ===== */
const SUBJECTS=[
{n:'Physics',i:'Ph',c:'var(--mint)',ch:['Electric Charges and Fields','Electrostatic Potential and Capacitance','Current Electricity','Moving Charges and Magnetism','Magnetism and Matter','Electromagnetic Induction','Alternating Current','Electromagnetic Waves','Ray Optics and Optical Instruments','Wave Optics','Dual Nature of Radiation and Matter','Atoms','Nuclei','Semiconductor Electronics']},
{n:'Chemistry',i:'Ch',c:'var(--violet)',ch:['Solutions','Electrochemistry','Chemical Kinetics','The d- and f-Block Elements','Coordination Compounds','Haloalkanes and Haloarenes','Alcohols, Phenols and Ethers','Aldehydes, Ketones and Carboxylic Acids','Amines','Biomolecules']},
{n:'Mathematics',i:'Ma',c:'var(--amber)',ch:['Relations and Functions','Inverse Trigonometric Functions','Matrices','Determinants','Continuity and Differentiability','Applications of Derivatives','Integrals','Applications of Integrals','Differential Equations','Vector Algebra','Three Dimensional Geometry','Linear Programming','Probability']},
{n:'English',i:'En',c:'var(--text)',ch:['Reading Comprehension','Writing Skills','Flamingo: Prose','Flamingo: Poetry']},
{n:'Painting',i:'Pa',c:'var(--amber)',ch:['The Rajasthani School of Painting','The Pahari School of Painting','The Mughal School of Miniature Painting','The Deccan Schools of Painting','The Bengal School and Cultural Nationalism','Modern Trends in Indian Art']}
];
/* Add content later. Key = 'Subject|Chapter title|tab' (tab = theory | questions | revision).
   Value = path of an HTML fragment file, e.g. 'Physics|Nuclei|theory':'notes/physics/nuclei-theory.html' */
const CONTENT={};
const TABS=[['theory','Theory'],['questions','Important Questions'],['revision','Quick Revision']];

let sb=null;try{if(window.supabase)sb=supabase.createClient(SB_URL,SB_KEY)}catch(e){console.error(e)}
const $=s=>document.querySelector(s),view=$('#view');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let me=null,prof=null,rt=null;
const go=h=>location.hash=h;
const fmt=d=>new Date(d).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
const say=(el,t,k='err')=>{el.className='msg '+k;el.textContent=t;el.hidden=false};
const SL={open:'Under review',answered:'Replied',closed:'Closed'};
const sub=n=>SUBJECTS.find(s=>s.n===n);
const total=SUBJECTS.reduce((a,s)=>a+s.ch.length,0);
const P={home:'<path d="M3 11l9-8 9 8v10H3z"/>',book:'<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/>',help:'<path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6A8 8 0 1 1 21 12z"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',eye:'<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',off:'<path d="M17.9 17.9A10.9 10.9 0 0 1 12 19C5 19 1 12 1 12a18 18 0 0 1 5.1-5.9M9.9 5.1A10.7 10.7 0 0 1 12 5c7 0 11 7 11 7a18 18 0 0 1-2.2 3.2M1 1l22 22"/>',out:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',flame:'<path d="M12 22c4 0 7-2.8 7-7 0-3.5-2.3-5.6-3.6-7.8-.5 1.8-1.4 3-2.9 3.6C12.9 7.4 11.3 4.3 8.6 2c.3 3.4-1.4 5.4-3 7.5C4.6 10.9 5 12.6 5 15c0 4.2 3 7 7 7z"/>',plus:'<path d="M12 5v14M5 12h14"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',cal:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',pen:'<path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4"/>'};
const ic=n=>`<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;
const LOGO='<svg class="logo" viewBox="0 0 76 76" aria-hidden="true"><rect x="1" y="1" width="74" height="74" rx="20" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="3"/><rect x="24" y="22" width="7" height="32" rx="3.5" fill="#5ee2bc"/><rect x="24" y="22" width="30" height="7" rx="3.5" fill="#5ee2bc"/><rect x="24" y="34.5" width="21" height="7" rx="3.5" fill="#ffc36b"/><rect x="24" y="47" width="30" height="7" rx="3.5" fill="#b8a2ff"/></svg>';
const pwf=(id,label,ac)=>`<label for="${id}">${label}</label><div class="pw"><input id="${id}" type="password" minlength="6" required autocomplete="${ac}"><button type="button" class="eye" data-t="${id}" aria-label="Show password">${ic('eye')}</button></div>`;
const words=(t,start=0)=>t.split(' ').map((w,k)=>`<span class="mw"><span style="--i:${start+k}">${w}</span></span>`).join(' ');
const dots=s=>`<span class="dots" aria-hidden="true">${s.ch.map((_,k)=>`<i style="--k:${k}"></i>`).join('')}</span>`;
const pad=n=>String(n).padStart(2,'0');
document.addEventListener('click',e=>{const b=e.target.closest('.eye');if(!b)return;const i=document.getElementById(b.dataset.t),s=i.type==='password';i.type=s?'text':'password';b.innerHTML=ic(s?'off':'eye');b.setAttribute('aria-label',s?'Hide password':'Show password')});

/* ===== MOTION ENGINE: scroll reveals, parallax, progress ===== */
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let introDone=false,par=[],prog=[],ticking=false;
function countUp(el){
  const t=Number(el.dataset.count);if(reduce){el.textContent=t;return}
  const d=1300,s=performance.now();
  const f=n=>{const k=Math.min(1,(n-s)/d);el.textContent=Math.round(t*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f)};
  requestAnimationFrame(f);
}
const io='IntersectionObserver' in window?new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;const t=e.target;t.classList.add('in');t.querySelectorAll('[data-count]').forEach(countUp);io.unobserve(t);
}),{threshold:.14,rootMargin:'0px 0px -6% 0px'}):null;
function scan(){
  if(!introDone)return;
  document.querySelectorAll('.main[data-auto]>*:not(.norv):not(.rv)').forEach((c,k)=>{c.classList.add('rv');c.style.setProperty('--i',Math.min(k,6))});
  document.querySelectorAll('[data-stagger]').forEach(p=>[...p.children].forEach((c,k)=>{if(!c.style.getPropertyValue('--i'))c.style.setProperty('--i',Math.min(k,8))}));
  document.querySelectorAll('.rv:not(.seen),.split:not(.seen)').forEach(el=>{
    el.classList.add('seen');
    if(reduce||!io){el.classList.add('in');el.querySelectorAll('[data-count]').forEach(countUp);return}
    el.querySelectorAll('[data-count]').forEach(c=>c.textContent='0');io.observe(el);
  });
  par=reduce?[]:[...document.querySelectorAll('[data-speed]')];
  prog=[...document.querySelectorAll('[data-progress]')];
  tick();
}
function tick(){
  if(ticking)return;ticking=true;
  requestAnimationFrame(()=>{
    ticking=false;const vh=innerHeight;
    for(const el of par){if(!el.isConnected)continue;const r=el.parentElement.getBoundingClientRect();el.style.transform=`translate3d(0,${((r.top+r.height/2-vh/2)*parseFloat(el.dataset.speed)).toFixed(1)}px,0)`}
    for(const el of prog){if(!el.isConnected)continue;const r=el.getBoundingClientRect();el.style.setProperty('--p',Math.min(1,Math.max(0,(vh*.62-r.top)/r.height)).toFixed(3))}
    $('.topbar').classList.toggle('scrolled',scrollY>8);
  });
}
addEventListener('scroll',tick,{passive:true});addEventListener('resize',tick);
new MutationObserver(scan).observe(view,{childList:true,subtree:true});

async function init(){
  window.onhashchange=route;Study.init();Field.init();
  if(!sb){route();return}
  const {data}=await sb.auth.getSession();await setUser(data.session?.user);
  sb.auth.onAuthStateChange((ev,s)=>{
    if(ev==='SIGNED_OUT'||(ev==='SIGNED_IN'&&s?.user?.id!==me?.id))setTimeout(async()=>{await setUser(s?.user);if(!holdRoute)route()},0)});
  route();
}
async function setUser(u){me=u||null;prof=null;if(me){const {data}=await sb.from('profiles').select('*').eq('id',me.id).maybeSingle();prof=data}Study.onUser(me)}
const dname=()=>prof?.full_name||me?.user_metadata?.full_name||'';

const PRIVATE=['app','subjects','c','help','ticket','profile','planner','journal'];
const onTab=(p,k)=>p===k||(k==='subjects'&&p==='c')||(k==='help'&&p==='ticket');
function chrome(p){
  const priv=PRIVATE.includes(p);
  $('#nav').innerHTML=`<a class="brand" href="${me&&priv?'#/app':'#/'}">${LOGO}EdgeStudy</a>
  ${me?`${priv?hudHTML():'<a class="btn sm primary" href="#/app">Study space</a>'}<a class="av" href="#/profile" aria-label="Profile">${esc((dname()||me.email)[0].toUpperCase())}</a>`
  :`<nav class="navl" aria-label="Sections"><a href="#/" onclick="event.preventDefault();jump('features')">Features</a><a href="#/" onclick="event.preventDefault();jump('subjects')">Subjects</a><a href="#/" onclick="event.preventDefault();jump('how')">Method</a></nav><a class="btn sm" href="#/login">Log in</a><a class="btn sm primary" href="#/signup">Get started</a>`}`;
  const tb=$('#tabbar'),show=!!me&&priv;tb.hidden=!show;document.body.classList.toggle('hasTab',show);
  const T=(h,k,i,t)=>`<a class="${onTab(p,k)?'on':''}" href="${h}"${onTab(p,k)?' aria-current="page"':''}>${ic(i)}<span>${t}</span></a>`;
  tb.innerHTML=T('#/app','app','home','Home')+T('#/subjects','subjects','book','Subjects')+T('#/planner','planner','cal','Planner')+T('#/journal','journal','pen','Journal')+T('#/profile','profile','user','Profile');
}
function jump(id){if((location.hash||'#/')!=='#/'){go('#/');setTimeout(()=>document.getElementById(id)?.scrollIntoView({behavior:'smooth'}),80)}else document.getElementById(id)?.scrollIntoView({behavior:'smooth'})}
function shell(p,inner){
  const L=(h,k,i,t)=>`<a class="${onTab(p,k)?'on':''}" href="${h}"${onTab(p,k)?' aria-current="page"':''}>${ic(i)}${t}</a>`;
  view.innerHTML=`<div class="wrap appLayout"><aside class="sidebar" aria-label="Study space"><span class="side-label">Study space</span>${L('#/app','app','home','Dashboard')}${L('#/subjects','subjects','book','My subjects')}${L('#/planner','planner','cal','Planner')}${L('#/journal','journal','pen','Journal')}${L('#/help','help','help','Report a gap')}${L('#/profile','profile','user','Profile')}<span class="side-sep"></span><button id="so">${ic('out')}Log out</button></aside><main class="main" data-auto>${inner}</main></div>`;
  $('#so').onclick=()=>sb.auth.signOut().then(()=>go('#/'));
}
function route(){
  if(rt){sb.removeChannel(rt);rt=null}
  Tracker.stop();
  const [,p='',a,b,c]=(location.hash||'#/').split('/');
  chrome(p);scrollTo(0,0);
  view.classList.remove('enter');void view.offsetWidth;view.classList.add('enter');
  const sw=$('#sweep');sw.classList.remove('go');void sw.offsetWidth;sw.classList.add('go');
  if(!sb&&p!==''){view.innerHTML='<div class="wrap authGrid"><div class="card empty"><h3>Service unavailable</h3><p>Could not connect. Check your internet connection and reload.</p></div></div>';return}
  if(PRIVATE.includes(p)&&!me)return go('#/login');
  ({'':landing,login:()=>authView('login'),signup:()=>authView('signup'),app:dashboard,subjects:()=>subjects(a),c:()=>chapter(a,b,c),help,ticket:()=>ticket(a),profile,planner:()=>plannerView(a),journal:()=>journalView(a)}[p]||landing)();
}

/* ---------- Landing ---------- */
function landing(){
  const startHref=me?'#/app':'#/signup',startLabel=me?'Open study space':'Get started free';
  const tickerRow=list=>{const s=list.map(([sj,c])=>`<span><i style="--a:${sj.c}">${sj.i}</i>${esc(c)}</span>`).join('');return s+s};
  const all=SUBJECTS.flatMap(s=>s.ch.map(c=>[s,c])),half=Math.ceil(all.length/2);
  const tile=(s,k)=>`<a class="glass tint stile s${k} rv" data-rv="scale" style="--a:${s.c}" href="#/subjects/${encodeURIComponent(s.n)}">
    <span class="z"><b>${pad(s.ch.length)}</b><span>${k===0?'Start here':'Open'} ${ic('arrow')}</span></span>
    ${k===0?`<ol class="chl">${s.ch.slice(0,5).map((c,j)=>`<li><span>${pad(j+1)}</span>${esc(c)}</li>`).join('')}<li><span>..</span>and ${s.ch.length-5} more</li></ol>`:''}
    <span class="sym" aria-hidden="true">${s.i}</span><h3>${s.n}</h3><small>${s.ch.length} chapters</small>${dots(s)}</a>`;

  view.innerHTML=`
  <section class="hero"><div class="wrap heroGrid">
    <div>
      <span class="eyebrow rv"><span class="dot"></span>Class 12 board exam prep</span>
      <h1 class="split">${words('Board prep,')} <em>${words('made simple.',2)}</em></h1>
      <p class="lead rv" style="--i:3">Understand concepts, practise important questions and revise with clear notes. Found something missing? Tell us and we will work on it.</p>
      <div class="acts rv" style="--i:4"><a class="btn primary" href="${startHref}">${startLabel} ${ic('arrow')}</a><a class="btn" href="#/" onclick="event.preventDefault();jump('subjects')">Explore subjects</a></div>
      <div class="facts rv" style="--i:5"><div><b data-count="${SUBJECTS.length}">${SUBJECTS.length}</b><small>Subjects</small></div><div><b data-count="${total}">${total}</b><small>Chapters</small></div><div><b data-count="3">3</b><small>Parts per chapter</small></div></div>
    </div>
    <div class="stack" aria-label="Preview of a chapter inside EdgeStudy">
      <div class="layer l1" data-speed="-0.05"><div class="glass pane rv" data-rv="scale" style="--i:2;--a:var(--mint)">
        <div class="pane-h"><span class="tag">Theory</span><small>Physics / Ch 13</small></div>
        <h3>Mass defect and binding energy</h3><p>The mass of a nucleus is less than the sum of its nucleons. That missing mass is released as energy.</p>
        <div class="formula"><span class="v">E</span><sub>b</sub> = <span class="v">&Delta;m</span> &middot; c<sup>2</sup></div>
      </div></div>
      <div class="layer l2" data-speed="0.04"><div class="glass pane rv" data-rv="scale" style="--i:4;--a:var(--amber)">
        <div class="pane-h"><span class="tag">Important question</span><small>3 marks</small></div>
        <h3>Calculate the binding energy per nucleon of iron-56.</h3>
        <div class="chips"><span class="chip">Numerical</span><span class="chip">Step-by-step answer</span></div>
      </div></div>
      <div class="layer l3" data-speed="0.11"><div class="glass pane rv" data-rv="scale" style="--i:6;--a:var(--violet)">
        <div class="pane-h"><span class="tag">Quick revision</span><small>2 min read</small></div>
        <ul class="kp"><li>Binding energy per nucleon peaks near iron</li><li>Fission and fusion both move toward that peak</li><li>1 u of mass is about 931.5 MeV</li></ul>
      </div></div>
    </div>
  </div></section>

  <div class="ticker" aria-hidden="true"><div class="track">${tickerRow(all.slice(0,half))}</div><div class="track rev">${tickerRow(all.slice(half))}</div></div>

  <section class="section" id="features"><div class="wrap">
    <div class="sh"><span class="kicker rv">What you get</span><h2 class="split">${words('Everything for one chapter, in one place.')}</h2></div>
    <div class="bento">
      <article class="glass tint tile t-theory rv" data-rv="scale" style="--a:var(--mint)">
        <span class="tag">Understand</span><h3>Concepts and theory</h3><p>Clear explanations, essential definitions and worked examples that build real understanding, one idea at a time.</p>
        <div class="vis"><div class="big-f"><span class="v">&Phi;</span><sub>E</sub> = q<sub>enc</sub> / &epsilon;<sub>0</sub></div>
        <ol class="wsteps"><li>Choose a Gaussian surface that matches the symmetry</li><li>Find the charge enclosed by that surface</li><li>Solve for the electric field</li></ol></div>
      </article>
      <article class="glass tint tile t-practise rv" data-rv="scale" style="--a:var(--amber);--i:1">
        <span class="tag">Practise</span><h3>Important questions</h3><p>Board-style short answers, long answers and numericals.</p>
        <div class="vis"><div class="qa"><span class="m">2 marks</span><p class="q">Define mutual inductance and state its SI unit.</p>
        <details><summary>Show answer</summary><p>The emf induced in one coil per unit rate of change of current in a neighbouring coil. SI unit: henry (H).</p></details></div></div>
      </article>
      <article class="glass tint tile t-revise rv" data-rv="scale" style="--a:var(--violet);--i:2">
        <span class="tag">Revise</span><h3>Formulas and key points</h3><p>Quick-recall notes you can scan the night before an exam.</p>
        <div class="vis fchips"><span>v = u + at</span><span>F = qvB</span><span>&lambda; = h / p</span><span>PV = nRT</span></div>
      </article>
      <article class="glass tint tile t-report rv" data-rv="scale" style="--a:var(--mint);--i:1">
        <div class="copy"><span class="tag">Help us improve</span><h3>Report a gap, get a real reply</h3><p>Missing a topic or found something unclear? Send a report and the founder reads it personally. If more detail is needed, a chat opens right on your report.</p></div>
        <div class="vis"><div class="mini-thread" data-stagger><div class="s rv" data-rv="right">The Nuclei chapter needs more numericals.<small>You</small></div><div class="f rv" data-rv="left">Thanks for flagging this. Which type helps most: binding energy or decay?<small>Founder</small></div></div></div>
      </article>
    </div>
  </div></section>

  <section class="section" id="subjects"><div class="wrap">
    <div class="sh"><span class="kicker rv">Class 12 subjects</span><h2 class="split">${words('Choose a subject to begin.')}</h2><p class="rv" style="--i:2">Each tile is one subject. The number shows how many chapters it holds, and every square is a chapter waiting for you.</p></div>
    <div class="sgrid" data-stagger>${SUBJECTS.map(tile).join('')}</div>
  </div></section>

  ${landingLive()}

  <section class="section" id="how"><div class="wrap howGrid">
    <div class="howHead sh"><span class="kicker rv">A routine that works</span><h2 class="split">${words('Learn it. Try it. Recall it.')}</h2><p class="rv" style="--i:2">Three steps, repeated for every chapter. Simple enough to keep doing until exam day.</p></div>
    <div class="loop" data-progress>
      <article class="glass lstep rv" data-rv="right" style="--a:var(--mint)"><span class="n">1</span><h3>Understand</h3><p>Read the concept and follow a worked example until the idea makes sense.</p><span class="where">Theory tab</span></article>
      <article class="glass lstep rv" data-rv="right" style="--a:var(--amber)"><span class="n">2</span><h3>Practise</h3><p>Attempt questions before looking at answers, and learn from your mistakes.</p><span class="where">Important questions tab</span></article>
      <article class="glass lstep rv" data-rv="right" style="--a:var(--violet)"><span class="n">3</span><h3>Revise</h3><p>Recall key points, formulas and diagrams again after a short break.</p><span class="where">Quick revision tab</span></article>
    </div>
  </div></section>

  <section class="section"><div class="wrap">
    <div class="glass tint cta rv" data-rv="scale" style="--a:var(--mint)">
      <span class="kicker">Free to start</span>
      <h2 class="split">${words('Your next chapter is waiting.')}</h2>
      <p>Create a free account, pick a subject and open your first chapter.</p>
      <div class="acts"><a class="btn primary" href="${startHref}">${me?'Open study space':'Create free account'} ${ic('arrow')}</a></div>
    </div>
    <footer class="foot"><span>&copy; ${new Date().getFullYear()} EdgeStudy</span><span>Class 12 board prep</span></footer>
  </div></section>`;
}

/* ---------- Dashboard ---------- */
async function dashboard(){
  const {data:ts}=await sb.from('tickets').select('id,subject,status,created_at').eq('user_id',me.id).order('created_at',{ascending:false});
  renderDashboard(ts);
}

/* ---------- Subjects and chapters ---------- */
function subjects(name){
  const s=name&&sub(decodeURIComponent(name));
  if(!s){shell('subjects',`<div class="pageTop"><h1>Your subjects</h1><p>Choose a subject to see its chapters.</p></div><div class="subjectList norv" data-stagger>${SUBJECTS.map(x=>`<a class="sc tint rv" data-rv="scale" style="--a:${x.c}" href="#/subjects/${encodeURIComponent(x.n)}"><span class="el" style="--a:${x.c}" aria-hidden="true">${x.i}</span><span><strong>${x.n}</strong><small>${x.ch.length} chapters</small></span><span class="go" aria-hidden="true">${ic('arrow')}</span></a>`).join('')}</div>`);return}
  const has=(c,t)=>CONTENT[`${s.n}|${c}|${t}`];
  shell('subjects',`<div class="pageTop"><div class="crumb"><a href="#/subjects">Subjects</a> / ${esc(s.n)}</div><h1>${esc(s.n)}</h1><p>${s.ch.length} chapters. Open a chapter for theory, questions and revision.</p></div>
  <div class="chapterGrid norv" data-stagger>${s.ch.map((c,i)=>{const live=TABS.some(([t])=>has(c,t));return `<article class="cc rv" data-rv="scale" style="--a:${s.c}"><div class="no">Chapter ${pad(i+1)}</div><h3>${esc(c)}</h3><div class="ft"><small>${live?'Notes available':'Notes coming soon'}</small><a class="btn sm ${live?'primary':''}" href="#/c/${encodeURIComponent(s.n)}/${i}/theory">Open</a></div></article>`}).join('')}</div>`);
}
async function chapter(sn,idx,tab){
  const s=sub(decodeURIComponent(sn||'')),i=Number(idx);
  if(!s||!(i>=0&&i<s.ch.length))return go('#/subjects');
  tab=TABS.some(t=>t[0]===tab)?tab:'theory';const c=s.ch[i],base=`#/c/${encodeURIComponent(s.n)}/`;
  shell('c',`<div class="pageTop"><div class="crumb"><a href="#/subjects">Subjects</a> / <a href="#/subjects/${encodeURIComponent(s.n)}">${esc(s.n)}</a></div><h1>${esc(c)}</h1><p>Chapter ${i+1} of ${s.ch.length}</p></div>
  <div class="tabs" role="tablist">${TABS.map(([k,l])=>`<a class="tab ${k===tab?'on':''}" href="${base}${i}/${k}"${k===tab?' aria-current="page"':''}>${l}${partTime(s.n,i,k)>=180?'<i class="tdot" aria-label="studied today"></i>':''}</a>`).join('')}</div>
  ${chapterStrip(s.n,i,tab)}
  <article class="lesson" id="les"><p>Loading...</p></article>
  <div class="pn">${i>0?`<a class="btn" href="${base}${i-1}/${tab}">&larr; Previous</a>`:'<span></span>'}${i<s.ch.length-1?`<a class="btn" href="${base}${i+1}/${tab}">Next &rarr;</a>`:''}</div>`);
  Tracker.start({s:s.n,c:i,tab});
  const box=$('#les'),u=CONTENT[`${s.n}|${c}|${tab}`],label=TABS.find(t=>t[0]===tab)[1];
  if(!u){box.innerHTML=`<div class="empty"><h3>${label} is coming soon</h3><p>This section is being prepared and will appear here as soon as it is published.</p><a class="btn" href="#/help">Report a gap</a></div>`;return}
  try{const r=await fetch(u);if(!r.ok)throw 0;box.innerHTML=await r.text()}catch(e){box.innerHTML='<div class="empty"><h3>Could not load this section</h3><p>Check your connection and try again.</p></div>'}
}

/* ---------- Profile ---------- */
function profile(){
  const n=dname();
  shell('profile',`<div class="who"><div class="av">${esc((n||me.email)[0].toUpperCase())}</div><div><h2>${esc(n||'Student')}</h2><p>${esc(me.email)}</p></div></div>
  <form class="box" id="pf"><h3>Your details</h3><label for="pn">Full name</label><input id="pn" required maxlength="60" value="${esc(n)}" autocomplete="name"><label for="pe">Email</label><input id="pe" value="${esc(me.email)}" disabled>
   <button class="btn primary block">Save changes</button><div class="msg" id="pm" role="status" hidden></div></form>
  <form class="box" id="pw"><h3>Change password</h3>${pwf('np','New password','new-password')}${pwf('np2','Confirm new password','new-password')}<button class="btn primary block">Update password</button><div class="msg" id="wm" role="status" hidden></div></form>
  <a class="tk" href="#/help"><span><b>My reports</b><br><small>See your reports and replies</small></span><span class="tl">Open</span></a>
  <button class="btn block" id="lo" style="margin-top:6px">Log out</button>`);
  $('#pf').onsubmit=async e=>{e.preventDefault();const m=$('#pm'),v=$('#pn').value.trim();
    const [a,b]=await Promise.all([sb.from('profiles').update({full_name:v}).eq('id',me.id),sb.auth.updateUser({data:{full_name:v}})]);
    if(a.error||b.error)return say(m,(a.error||b.error).message);prof={...prof,full_name:v};say(m,'Changes saved.','ok')};
  $('#pw').onsubmit=async e=>{e.preventDefault();const m=$('#wm');
    if($('#np').value!==$('#np2').value)return say(m,'Passwords do not match. Please re-enter them.');
    const r=await sb.auth.updateUser({password:$('#np').value});if(r.error)return say(m,r.error.message);e.target.reset();say(m,'Password updated.','ok')};
  $('#lo').onclick=()=>sb.auth.signOut().then(()=>go('#/'));
}

/* ---------- Media ---------- */
async function upload(file,tid){
  const path=`${me.id}/${tid}/${Date.now()}-${file.name.replace(/[^\w.-]/g,'_')}`;
  const {error}=await sb.storage.from('ticket-media').upload(path,file,{contentType:file.type});if(error)throw error;return{path,type:file.type};
}
async function media(path,type){
  if(!path)return'';const {data}=await sb.storage.from('ticket-media').createSignedUrl(path,3600);const u=data?.signedUrl;if(!u)return'';
  return type?.startsWith('image')?`<img src="${u}" alt="Attachment" loading="lazy">`:type?.startsWith('video')?`<video src="${u}" controls playsinline></video>`:`<a class="tl" href="${u}" target="_blank" rel="noopener">Open attachment</a>`;
}

/* ---------- Report a gap ---------- */
async function help(){
  const {data:ts}=await sb.from('tickets').select('*').eq('user_id',me.id).order('created_at',{ascending:false});
  shell('help',`<div class="pageTop"><h1>Report a gap</h1><p>Found something missing, unclear or wrong? Tell us what is lacking and we will work on it.</p></div>
  <div class="box"><h3>How it works</h3><p style="font-size:.92rem;margin-top:6px">If we understand your report in one go, we will simply fix it. If we need more details, we will turn on chat on your report and ask you here. Our reply appears on the same page.</p></div>
  <form class="box" id="f"><label for="sj" style="margin-top:0">Subject</label><select id="sj">${SUBJECTS.map(x=>`<option>${x.n}</option>`).join('')}<option>General</option></select>
   <label for="s">What is missing?</label><input id="s" required maxlength="100" placeholder="e.g. Numericals for the Nuclei chapter">
   <label for="b">Details</label><textarea id="b" required placeholder="Tell us what is lacking and what would help you."></textarea>
   <label for="fi">Screenshot, photo or video (optional)</label><div class="btn file block">Choose file<input type="file" id="fi" accept="image/*,video/*"></div><small id="fn" style="color:var(--muted)"></small>
   <button class="btn primary block" id="go">Send report</button><div class="msg" id="m" role="alert" hidden></div></form>
  <h3 style="margin:24px 0 12px">Your reports</h3><div class="norv" data-stagger>${ts?.length?ts.map(t=>`<a class="tk rv" href="#/ticket/${t.id}"><span><b>${esc(t.subject)}</b><br><small>${fmt(t.created_at)}</small></span><span class="st ${t.status}">${SL[t.status]||t.status}</span></a>`).join(''):'<div class="box empty rv"><p style="margin:0 auto">No reports yet. Anything you send will show up here.</p></div>'}</div>`);
  $('#fi').onchange=e=>$('#fn').textContent=e.target.files[0]?.name||'';
  $('#f').onsubmit=async e=>{e.preventDefault();const b=$('#go'),m=$('#m');b.disabled=true;
    try{const {data:t,error}=await sb.from('tickets').insert({user_id:me.id,subject:`${$('#sj').value} \u00b7 ${$('#s').value.trim()}`}).select().single();if(error)throw error;
      const f=$('#fi').files[0],up=f?await upload(f,t.id):{};
      const r=await sb.from('ticket_messages').insert({ticket_id:t.id,sender_id:me.id,body:$('#b').value.trim(),media_path:up.path,media_type:up.type});if(r.error)throw r.error;go('#/ticket/'+t.id);
    }catch(x){say(m,x.message);b.disabled=false}};
}

/* ---------- Ticket thread ---------- */
async function ticket(id){
  const {data:t,error}=await sb.from('tickets').select('*').eq('id',id).maybeSingle();
  if(error||!t){shell('help','<div class="box empty"><h3>Report not found</h3><p>It may have been removed.</p><a class="btn" href="#/help">Back to reports</a></div>');return}
  const canType=t.chat_enabled&&t.status!=='closed';
  shell('ticket',`<div class="crumb"><a href="#/help">&larr; All reports</a></div>
  <div class="row" style="margin-top:8px"><h2>${esc(t.subject)}</h2><span class="st ${t.status}">${SL[t.status]||t.status}</span></div><div class="thread norv" id="th" aria-live="polite"></div>
  ${canType?`<form class="comp" id="cf"><textarea id="cb" required placeholder="Write your reply" aria-label="Your reply"></textarea><div class="btn file">Add media<input type="file" id="cfi" accept="image/*,video/*" aria-label="Add media"></div><button class="btn primary">Send</button><small id="cfn" style="color:var(--muted)"></small></form>`:`<div class="lock">${t.status==='closed'?'This report is closed. Thank you for helping us improve.':'Nothing more is needed from you right now. If we need more details, chat will be turned on here and you can reply.'}</div>`}`);
  const th=$('#th');
  const add=async m=>{const d=document.createElement('div');d.className='b '+(m.is_founder?'f':'me');
    d.innerHTML=`${esc(m.body).replace(/\n/g,'<br>')}${await media(m.media_path,m.media_type)}<small>${m.is_founder?'Founder':'You'} &middot; ${fmt(m.created_at)}</small>`;th.appendChild(d)};
  const {data:ms}=await sb.from('ticket_messages').select('*').eq('ticket_id',id).order('created_at');
  for(const m of ms||[])await add(m);
  const seen=new Set((ms||[]).map(m=>m.id));
  rt=sb.channel('t'+id).on('postgres_changes',{event:'INSERT',schema:'public',table:'ticket_messages',filter:`ticket_id=eq.${id}`},p=>{if(!seen.has(p.new.id)){seen.add(p.new.id);add(p.new)}})
   .on('postgres_changes',{event:'UPDATE',schema:'public',table:'tickets',filter:`id=eq.${id}`},()=>ticket(id)).subscribe();
  $('#cfi')&&($('#cfi').onchange=e=>$('#cfn').textContent=e.target.files[0]?.name||'');
  $('#cf')&&($('#cf').onsubmit=async e=>{e.preventDefault();const btn=e.submitter;btn.disabled=true;
    try{const f=$('#cfi').files[0],up=f?await upload(f,id):{};
      const {data:m,error}=await sb.from('ticket_messages').insert({ticket_id:id,sender_id:me.id,is_founder:false,body:$('#cb').value.trim(),media_path:up.path,media_type:up.type}).select().single();
      if(error)throw error;seen.add(m.id);await add(m);$('#cb').value='';$('#cfi').value='';$('#cfn').textContent='';
    }catch(x){alert(x.message)}btn.disabled=false});
}

Boot.run(init().catch(e=>{console.error(e);route()}),()=>{introDone=true;scan()});
