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
async function setUser(u){me=u||null;prof=null;if(me){const {data}=await sb.from('profiles').select('*').eq('id',me.id).maybeSingle();prof=data}Study.onUser(me);if(me)ChatKit.watch(sb,'student');else ChatKit.stopWatch()}
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
/* ===== ChatKit: shared chat engine (media tray + preview, WhatsApp-style ticks, swipe-highlight, flicker-free updates) ===== */
const ChatKit=(()=>{
  const MAXF=8,MAXMB=50,ZW='\u200b';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const tm=d=>new Date(d).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
  const fd=s=>(s==null||!isFinite(s))?'':Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
  const nowIso=()=>new Date().toISOString();
  const missingFn=e=>!!e&&/PGRST202|42883|Could not find the function|function .* does not exist/i.test((e.code||'')+' '+(e.message||''));
  const mergeRow=(r,m)=>{const sa=r.m.seen_at,da=r.m.delivered_at;Object.assign(r.m,m);r.m.seen_at=r.m.seen_at||sa;r.m.delivered_at=r.m.delivered_at||da};
  const IC={
    one:'<svg viewBox="0 0 16 11"><path d="M2 5.8l3 3L11.5 2.2"/></svg>',
    two:'<svg viewBox="0 0 16 11"><path d="M1 5.8l3 3L10.5 2.2M6 8.2l.8.8L14.5 2.2"/></svg>',
    clock:'<svg viewBox="0 0 16 11"><circle cx="8" cy="5.5" r="4"/><path d="M8 3.6v2l1.4 1"/></svg>',
    clip:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>',
    send:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>'
  };
  let cssDone=false;
  function css(){
    if(cssDone)return;cssDone=true;const s=document.createElement('style');
    s.textContent=`
.b{touch-action:pan-y;position:relative;transition:transform .28s cubic-bezier(.2,.9,.3,1.25),background .25s,box-shadow .25s}
.b.k-in{animation:kIn .22s ease-out}@keyframes kIn{from{opacity:0;transform:translateY(8px)}}
.b.k-drag{transition:none;user-select:none;-webkit-user-select:none}
.b.k-hl{box-shadow:0 0 0 2px #f5b301,0 8px 22px #f5b30140;background-image:linear-gradient(#f5b30124,#f5b30124)}
.b.k-hl::after{content:"\\2605";position:absolute;top:-9px;right:-7px;width:20px;height:20px;border-radius:50%;background:#f5b301;color:#1b1400;font-size:12px;display:grid;place-items:center;box-shadow:0 2px 8px #0005}
.b small.k-meta{display:flex;align-items:center;justify-content:space-between;gap:10px}
.k-tk{display:inline-flex;align-items:center;color:rgba(255,255,255,.62)}.k-tk svg{width:16px;height:11px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.k-tk.seen{color:#53bdeb}.k-tk.pend{opacity:.7}
.k-th{position:relative;display:block;padding:0;border:0;background:rgba(127,127,127,.22);border-radius:12px;overflow:hidden;margin-top:8px;width:min(300px,100%);min-height:60px;cursor:zoom-in;line-height:0;color:#fff}
.k-th img,.k-th video{display:block;width:100%;max-height:240px;object-fit:cover;margin:0;border-radius:0;pointer-events:none}
.k-play{position:absolute;inset:0;display:grid;place-items:center;font-size:30px;color:#fff;text-shadow:0 2px 10px #000a;background:linear-gradient(transparent 55%,#0006);pointer-events:none}
.k-dur{position:absolute;right:8px;bottom:6px;font:700 11px/1 system-ui,sans-serif;color:#fff;background:#000a;padding:3px 7px;border-radius:99px}
.k-comp{margin-top:10px}
.k-tray{display:flex;gap:10px;overflow-x:auto;padding:8px 2px 10px;scrollbar-width:thin}
.k-ti{position:relative;flex:none;width:86px;height:86px;border-radius:14px;overflow:hidden;background:rgba(127,127,127,.22);animation:kIn .2s}
.k-tp{position:absolute;inset:0;width:100%;height:100%;border:0;padding:0;margin:0;background:none;cursor:zoom-in;color:#fff;line-height:0}
.k-tp img{width:100%;height:100%;object-fit:cover;display:block}.k-tp .k-ph{display:grid;place-items:center;width:100%;height:100%;font-size:26px;opacity:.75}
.k-tp .k-play{font-size:22px}
.k-x{position:absolute;top:4px;right:4px;width:24px;height:24px;border-radius:50%;border:0;padding:0;background:#000c;color:#fff;font-size:16px;line-height:1;display:grid;place-items:center;cursor:pointer;z-index:2}
.k-form{display:flex;align-items:flex-end;gap:8px}
.k-form textarea{box-sizing:border-box;flex:1;min-width:0;min-height:46px;max-height:140px;height:46px;resize:none;margin:0;padding:12px 16px;border-radius:23px;border:1.5px solid rgba(127,127,127,.4);background:rgba(127,127,127,.12);color:inherit;font:inherit;line-height:1.35;overflow-y:auto}
.k-form textarea:focus{outline:none;border-color:var(--pri,var(--mint,#5ee2bc))}
.k-attach,.k-send{flex:none;width:46px;height:46px;border-radius:50%;display:grid;place-items:center;cursor:pointer;border:0;padding:0}
.k-attach{background:rgba(127,127,127,.18);color:inherit}
.k-send{transition:transform .25s cubic-bezier(.3,1.6,.5,1),opacity .2s}.k-send[disabled]{opacity:.38;transform:scale(.9);cursor:default}
.k-dark .k-send{background:var(--mint,#5ee2bc);color:#10201d}.k-light .k-send{background:var(--pri,#2456d8);color:#fff}
.k-pill{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(104px + env(safe-area-inset-bottom));z-index:60;border:0;border-radius:99px;padding:9px 16px;font:700 .85rem system-ui,sans-serif;background:#111d;color:#fff;box-shadow:0 8px 24px #0006;cursor:pointer;animation:kIn .2s}
.k-err{padding:14px 16px;border-radius:14px;border:1px dashed rgba(127,127,127,.5);font-size:.9rem}
.k-lb{position:fixed;inset:0;z-index:9999;background:#000e;display:grid;place-items:center;animation:kFade .15s}@keyframes kFade{from{opacity:0}}
.k-lb img,.k-lb video{max-width:94vw;max-height:82vh;border-radius:12px;background:#000;display:block}
.k-lb button{position:absolute;border:0;border-radius:50%;width:46px;height:46px;background:#fff2;color:#fff;font-size:26px;line-height:1;cursor:pointer;display:grid;place-items:center;padding:0}
.k-lb .k-c{top:calc(14px + env(safe-area-inset-top));right:14px}.k-lb .k-pv{left:12px;top:50%;margin-top:-23px}.k-lb .k-nx{right:12px;top:50%;margin-top:-23px}
.k-lb .k-ct{position:absolute;bottom:calc(18px + env(safe-area-inset-bottom));left:0;right:0;text-align:center;color:#fff9;font:600 .85rem system-ui,sans-serif}`;
    document.head.appendChild(s);
  }

  /* ---------- fullscreen preview with prev/next ---------- */
  function lightbox(list,i){
    let idx=i;const el=document.createElement('div');el.className='k-lb';el.setAttribute('role','dialog');el.setAttribute('aria-label','Preview');
    const close=()=>{document.removeEventListener('keydown',key);el.remove()};
    const draw=()=>{
      el.innerHTML='';const it=list[idx];
      const m=document.createElement(it.type.startsWith('video')?'video':'img');m.src=it.url;
      if(m.tagName==='VIDEO'){m.controls=true;m.autoplay=true;m.playsInline=true}else m.alt='Preview';
      el.appendChild(m);
      const mk=(c,t,l,f)=>{const b=document.createElement('button');b.type='button';b.className=c;b.textContent=t;b.setAttribute('aria-label',l);b.onclick=e=>{e.stopPropagation();f()};el.appendChild(b)};
      mk('k-c','\u00d7','Close',close);
      if(list.length>1){mk('k-pv','\u2039','Previous',()=>{idx=(idx-1+list.length)%list.length;draw()});mk('k-nx','\u203a','Next',()=>{idx=(idx+1)%list.length;draw()});
        const c=document.createElement('div');c.className='k-ct';c.textContent=(idx+1)+' / '+list.length;el.appendChild(c)}
    };
    const key=e=>{if(e.key==='Escape')close();else if(list.length>1&&e.key==='ArrowLeft'){idx=(idx-1+list.length)%list.length;draw()}else if(list.length>1&&e.key==='ArrowRight'){idx=(idx+1)%list.length;draw()}};
    el.addEventListener('click',e=>{if(e.target===el)close()});document.addEventListener('keydown',key);draw();document.body.appendChild(el);
  }

  /* ---------- video: duration + thumbnail (for the tray) ---------- */
  function vidMeta(url){
    return new Promise(res=>{
      const v=document.createElement('video');v.preload='metadata';v.muted=true;v.playsInline=true;let d0,done=false;
      const fin=o=>{if(done)return;done=true;clearTimeout(t);res(o)};const t=setTimeout(()=>fin({dur:d0}),3500);
      v.onloadedmetadata=()=>{d0=isFinite(v.duration)?v.duration:undefined;try{v.currentTime=Math.min(.2,(v.duration||1)/2)}catch(e){fin({dur:d0})}};
      v.onseeked=()=>{try{const w=v.videoWidth||320,h=v.videoHeight||180,s=Math.min(1,240/Math.max(w,h)),c=document.createElement('canvas');c.width=Math.max(1,w*s);c.height=Math.max(1,h*s);c.getContext('2d').drawImage(v,0,0,c.width,c.height);
        c.toBlob(b=>fin({dur:d0,thumb:b?URL.createObjectURL(b):null}),'image/jpeg',.7)}catch(e){fin({dur:d0})}};
      v.onerror=()=>fin({});v.src=url;
    });
  }

  /* ---------- global "delivered" watcher: online = delivered ---------- */
  let wsb=null,wch=null,wt=null;
  function stopWatch(){clearTimeout(wt);if(wsb&&wch){try{wsb.removeChannel(wch)}catch(e){}}wsb=null;wch=null}
  function watch(sb,role){
    stopWatch();if(!sb)return;wsb=sb;
    const ack=()=>{clearTimeout(wt);wt=setTimeout(()=>{Promise.resolve(sb.rpc('mark_delivered_all')).then(r=>{if(r&&missingFn(r.error))stopWatch()},()=>{})},250)};
    ack();
    wch=sb.channel('kw-'+role+'-'+Math.random().toString(36).slice(2,6)).on('postgres_changes',{event:'INSERT',schema:'public',table:'ticket_messages'},p=>{if(p&&p.new&&p.new.is_founder===(role==='admin'))return;ack()}).subscribe();
    window.addEventListener('online',ack);
  }

  /* ---------- the chat for one ticket ---------- */
  function mount(o){
    css();
    const sb=o.sb,tid=o.ticketId,th=o.th,recs=new Map(),tray=[];let seq=0,busy=false,compOn=false,ready=false,queue=[],rpcOK=true,acking=false,pill=null,pillN=0,stickUntil=0,suppress=0,first=true;
    const alive=()=>th.isConnected;
    const nearBottom=()=>{const el=document.documentElement;return el.scrollHeight-(scrollY+innerHeight)<170};
    const toBottom=sm=>scrollTo({top:document.documentElement.scrollHeight,behavior:sm?'smooth':'auto'});
    const killPill=()=>{if(pill){pill.remove();pill=null}pillN=0};
    const bumpPill=()=>{pillN++;if(!pill){pill=document.createElement('button');pill.type='button';pill.className='k-pill';pill.onclick=()=>{toBottom(true);killPill()};document.body.appendChild(pill)}pill.textContent='\u2193 '+pillN+' new message'+(pillN>1?'s':'')};

    /* signed media urls (cached) */
    const urls=new Map();
    const signed=p=>{if(!urls.has(p))urls.set(p,Promise.resolve(sb.storage.from('ticket-media').createSignedUrl(p,3600)).then(r=>(r&&r.data&&r.data.signedUrl)||'').catch(()=>''));return urls.get(p)};

    /* highlight (swipe) — remembered on this device */
    const HK='es:hl:'+tid;let hl=new Set();try{hl=new Set(JSON.parse(localStorage.getItem(HK)||'[]'))}catch(e){}
    const toggleHl=d=>{const id=d.dataset.id;if(!id)return;if(hl.has(id)){hl.delete(id);d.classList.remove('k-hl')}else{hl.add(id);d.classList.add('k-hl')}try{localStorage.setItem(HK,JSON.stringify([...hl].slice(-300)))}catch(e){}try{navigator.vibrate&&navigator.vibrate(12)}catch(e){}};

    /* ----- bubbles ----- */
    async function fillMedia(slot,m){
      const type=m.media_type||'',u=await signed(m.media_path);if(!u){slot.remove();return}
      if(type.startsWith('image')){
        const b=document.createElement('button');b.type='button';b.className='k-th';b.dataset.u=u;b.dataset.t=type;const im=document.createElement('img');im.alt='Attachment';im.loading='lazy';im.src=u;im.onload=()=>{if(Date.now()<stickUntil)toBottom(false)};b.appendChild(im);return b
      }
      if(type.startsWith('video')){
        const b=document.createElement('button');b.type='button';b.className='k-th';b.dataset.u=u;b.dataset.t=type;
        const v=document.createElement('video');v.preload='metadata';v.muted=true;v.playsInline=true;v.src=u+'#t=0.1';
        const pl=document.createElement('span');pl.className='k-play';pl.textContent='\u25b6';const du=document.createElement('span');du.className='k-dur';
        v.onloadedmetadata=()=>{du.textContent=fd(v.duration);if(Date.now()<stickUntil)toBottom(false)};b.append(v,pl,du);return b
      }
      const a=document.createElement('a');a.href=u;a.target='_blank';a.rel='noopener';a.className='tl';a.textContent='Open attachment';return a;
    }
    function build(m,anim){
      const d=document.createElement('div');d.className=o.cls(m)+(anim?' k-in':'');if(m.id!=null)d.dataset.id=m.id;if(hl.has(String(m.id)))d.classList.add('k-hl');
      const txt=(m.body||'').split(ZW).join('');
      let h='';if(txt.trim())h+=`<div class="k-body">${esc(txt).replace(/\n/g,'<br>')}</div>`;
      if(m.media_path)h+='<div class="k-mslot"></div>';
      h+=`<small class="k-meta"><span>${esc(o.who(m))} &middot; ${tm(m.created_at)}</span>${o.mine(m)?'<span class="k-tk"></span>':''}</small>`;
      d.innerHTML=h;
      if(m.media_path){const slot=d.querySelector('.k-mslot');fillMedia(slot,m).then(n=>{if(n&&slot.isConnected)slot.replaceWith(n)})}
      return d;
    }
    function tick(r){
      if(!o.mine(r.m))return;const s=r.el.querySelector('.k-tk');if(!s)return;const st=r.m.seen_at?'seen':r.m.delivered_at?'dlv':'sent';
      s.className='k-tk '+st;s.innerHTML=st==='sent'?IC.one:IC.two;s.title=st==='seen'?'Seen '+tm(r.m.seen_at):st==='dlv'?'Delivered':'Sent';s.setAttribute('aria-label',s.title);
    }
    function add(m,opt={}){
      if(recs.has(m.id))return recs.get(m.id);
      const nb=nearBottom(),el=build(m,!opt.init),rec={m,el};recs.set(m.id,rec);
      const t=Date.parse(m.created_at),nxt=[...recs.values()].find(r=>r!==rec&&Date.parse(r.m.created_at)>t),pend=th.querySelector('.k-pend');
      th.insertBefore(el,nxt?nxt.el:(pend||null));tick(rec);
      if(!opt.init&&!opt.own){if(nb)toBottom(true);else bumpPill()}
      return rec;
    }

    /* ----- receipts ----- */
    async function receipt(kind){
      if(!rpcOK)return false;
      try{const r=await sb.rpc('mark_messages',{tid,kind});if(r&&r.error){if(missingFn(r.error))rpcOK=false;return false}return true}catch(e){return false}
    }
    async function ack(){
      if(acking||!alive())return;const inc=[...recs.values()].filter(r=>!o.mine(r.m));if(!inc.length)return;acking=true;
      try{
        if(document.visibilityState==='visible'&&inc.some(r=>!r.m.seen_at)){if(await receipt('seen'))inc.forEach(r=>{r.m.seen_at=r.m.seen_at||nowIso();r.m.delivered_at=r.m.delivered_at||nowIso()})}
        else if(inc.some(r=>!r.m.delivered_at)){if(await receipt('delivered'))inc.forEach(r=>{r.m.delivered_at=r.m.delivered_at||nowIso()})}
      }finally{acking=false}
    }
    const onInsert=m=>{if(!alive())return;if(!ready){queue.push(['i',m]);return}if(recs.has(m.id))return;add(m,{});if(!o.mine(m))ack()};
    const onUpdate=m=>{if(!alive())return;if(!ready){queue.push(['u',m]);return}const r=recs.get(m.id);if(r){mergeRow(r,m);tick(r)}};
    async function sync(){
      if(!alive())return;const {data,error}=await sb.from('ticket_messages').select('*').eq('ticket_id',tid).order('created_at');if(error||!data)return;
      data.forEach(m=>{const r=recs.get(m.id);if(r){mergeRow(r,m);tick(r)}else add(m,{})});ack();
    }

    /* ----- realtime ----- */
    const chn=sb.channel('k'+tid+'-'+Math.random().toString(36).slice(2,6))
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'ticket_messages',filter:`ticket_id=eq.${tid}`},p=>onInsert(p.new))
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'ticket_messages',filter:`ticket_id=eq.${tid}`},p=>onUpdate(p.new));
    if(o.extend)o.extend(chn);
    chn.subscribe(st=>{if(st==='SUBSCRIBED'){if(first){first=false}else sync()}});

    /* ----- housekeeping listeners ----- */
    const onVis=()=>{if(!alive()){cleanup();return}if(document.visibilityState==='visible'){sync()}};
    const onScr=()=>{if(!alive()){cleanup();return}if(pill&&nearBottom())killPill()};
    function cleanup(){document.removeEventListener('visibilitychange',onVis);removeEventListener('online',onVis);removeEventListener('scroll',onScr);killPill()}
    document.addEventListener('visibilitychange',onVis);addEventListener('online',onVis);addEventListener('scroll',onScr,{passive:true});

    /* ----- swipe left/right (or double-tap) to highlight a message ----- */
    let sw=null;
    th.addEventListener('pointerdown',e=>{
      if(e.button>0)return;const d=e.target.closest('.b');if(!d||!th.contains(d)||d.classList.contains('k-pend'))return;
      sw={d,x:e.clientX,y:e.clientY,id:e.pointerId,drag:false};
    });
    th.addEventListener('pointermove',e=>{
      if(!sw||e.pointerId!==sw.id)return;const dx=e.clientX-sw.x,dy=e.clientY-sw.y;
      if(!sw.drag){if(Math.abs(dx)>10&&Math.abs(dx)>Math.abs(dy)*1.6){sw.drag=true;sw.d.classList.add('k-drag');try{th.setPointerCapture(e.pointerId)}catch(_){}}else if(Math.abs(dy)>10){sw=null;return}}
      if(sw.drag)sw.d.style.transform='translateX('+Math.max(-56,Math.min(56,dx*.6))+'px)';
    });
    const endSw=(e,cancel)=>{
      if(!sw||(e&&e.pointerId!==undefined&&e.pointerId!==sw.id))return;const {d,x,drag}=sw;const dx=e?e.clientX-x:0;
      d.classList.remove('k-drag');d.style.transform='';if(drag){suppress=Date.now();if(!cancel&&Math.abs(dx)>=70)toggleHl(d)}sw=null;
    };
    th.addEventListener('pointerup',e=>endSw(e,false));th.addEventListener('pointercancel',e=>endSw(e,true));
    th.addEventListener('dblclick',e=>{const d=e.target.closest('.b');if(d&&!d.classList.contains('k-pend')&&!e.target.closest('.k-th'))toggleHl(d)});
    th.addEventListener('click',e=>{
      const b=e.target.closest('.k-th[data-u]');if(!b)return;if(Date.now()-suppress<400)return;
      const all=[...th.querySelectorAll('.k-th[data-u]')];lightbox(all.map(x=>({url:x.dataset.u,type:x.dataset.t})),all.indexOf(b));
    });

    /* ----- composer ----- */
    let ta,snd,tr,fi;
    function setSend(){if(!snd)return;snd.disabled=busy||(!ta.value.trim()&&!tray.length)}
    function grow(){ta.style.height='auto';ta.style.height=Math.min(Math.max(ta.scrollHeight,46),140)+'px'}
    function dropItem(it){URL.revokeObjectURL(it.url);if(it.thumb)URL.revokeObjectURL(it.thumb);const i=tray.indexOf(it);if(i>=0)tray.splice(i,1)}
    function drawTray(){
      if(!tr)return;tr.hidden=!tray.length;tr.innerHTML='';
      tray.forEach((it,i)=>{
        const d=document.createElement('div');d.className='k-ti';const b=document.createElement('button');b.type='button';b.className='k-tp';b.setAttribute('aria-label','Preview '+(it.kind==='video'?'video':'photo')+' '+(i+1));
        const src=it.kind==='image'?it.url:it.thumb;
        if(src){const im=document.createElement('img');im.alt='';im.src=src;b.appendChild(im)}else{const ph=document.createElement('span');ph.className='k-ph';ph.textContent=it.kind==='video'?'\ud83c\udf9e':'\ud83d\uddbc';b.appendChild(ph)}
        if(it.kind==='video'){const pl=document.createElement('span');pl.className='k-play';pl.textContent='\u25b6';b.appendChild(pl);const du=document.createElement('span');du.className='k-dur';du.textContent=fd(it.dur)||'video';b.appendChild(du)}
        b.onclick=()=>lightbox(tray.map(x=>({url:x.url,type:x.file.type})),i);
        const x=document.createElement('button');x.type='button';x.className='k-x';x.textContent='\u00d7';x.setAttribute('aria-label','Remove');x.onclick=()=>{if(busy)return;dropItem(it);drawTray();setSend()};
        d.append(b,x);tr.appendChild(d);
      });
    }
    function addFiles(fs){
      for(const f of fs){
        if(tray.length>=MAXF){alert('Ek baar mein max '+MAXF+' files bhej sakte ho');break}
        const kind=(f.type||'').startsWith('image')?'image':(f.type||'').startsWith('video')?'video':null;
        if(!kind){alert('Sirf photo ya video bhej sakte ho');continue}
        if(f.size>MAXMB*1048576){alert((f.name||'File')+' bahut badi hai (max '+MAXMB+' MB)');continue}
        const it={id:++seq,file:f,kind,url:URL.createObjectURL(f),thumb:null,dur:null};tray.push(it);
        if(kind==='video')vidMeta(it.url).then(r=>{it.dur=r.dur;it.thumb=r.thumb||null;drawTray()});
      }
      drawTray();setSend();
    }
    function pending(it,cap){
      const d=document.createElement('div');d.className=o.cls({is_founder:o.role==='admin'})+' k-pend k-in';
      d.innerHTML=`${cap?`<div class="k-body">${esc(cap).replace(/\n/g,'<br>')}</div>`:''}<div class="k-th" style="cursor:default"></div><small class="k-meta"><span>Sending\u2026</span><span class="k-tk pend">${IC.clock}</span></small>`;
      const box=d.querySelector('.k-th'),src=it.kind==='image'?it.url:it.thumb;if(src){const im=document.createElement('img');im.alt='';im.src=src;box.appendChild(im)}else box.style.minHeight='70px';
      th.appendChild(d);toBottom(true);return d;
    }
    async function post(f){
      const row={ticket_id:tid,sender_id:o.meId,is_founder:o.role==='admin',...f};
      let r=await sb.from('ticket_messages').insert(row).select().single();
      if(r.error&&row.body===''&&/check|23514/i.test((r.error.code||'')+' '+r.error.message)){row.body=ZW;r=await sb.from('ticket_messages').insert(row).select().single()}
      if(r.error)throw r.error;const rec=add(r.data,{own:true});toBottom(true);return rec;
    }
    async function send(){
      if(busy)return;const text=ta.value.trim();if(!text&&!tray.length)return;busy=true;setSend();
      try{
        if(!tray.length){await post({body:text});ta.value='';grow()}
        else{
          const items=tray.slice();
          for(let i=0;i<items.length;i++){
            const it=items[i],cap=i===0?text:'',pd=pending(it,cap);
            try{
              const path=`${o.meId}/${tid}/${Date.now()}-${i}-${(it.file.name||('file'+i)).replace(/[^\w.-]/g,'_')}`;
              const u=await sb.storage.from('ticket-media').upload(path,it.file,{contentType:it.file.type});if(u.error)throw u.error;
              await post({body:cap,media_path:path,media_type:it.file.type});pd.remove();dropItem(it);drawTray();if(i===0){ta.value='';grow()}
            }catch(e){pd.remove();throw e}
          }
        }
      }catch(e){alert((e&&e.message)||'Message nahi ja paya')}
      busy=false;setSend();ta&&ta.focus();
    }
    function renderComp(){
      if(!o.comp||compOn)return;compOn=true;
      o.comp.innerHTML=`<div class="k-comp k-${o.theme||'dark'}"><div class="k-tray" hidden></div><form class="k-form"><label class="k-attach" aria-label="Add photo or video">${IC.clip}<input type="file" accept="image/*,video/*" multiple hidden></label><textarea rows="1" placeholder="Write a message" aria-label="Message"></textarea><button class="k-send" aria-label="Send" disabled>${IC.send}</button></form></div>`;
      ta=o.comp.querySelector('textarea');snd=o.comp.querySelector('.k-send');tr=o.comp.querySelector('.k-tray');fi=o.comp.querySelector('input[type=file]');
      fi.onchange=()=>{addFiles([...fi.files]);fi.value=''};
      ta.addEventListener('input',()=>{grow();setSend()});
      ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&matchMedia('(hover:hover) and (pointer:fine)').matches){e.preventDefault();send()}});
      ta.addEventListener('paste',e=>{const fs=[...((e.clipboardData&&e.clipboardData.files)||[])];if(fs.length){e.preventDefault();addFiles(fs)}});
      o.comp.querySelector('form').addEventListener('submit',e=>{e.preventDefault();send()});
    }
    function setCanType(on){
      if(on){renderComp()}else if(compOn&&o.comp){tray.slice().forEach(dropItem);o.comp.innerHTML='';compOn=false;ta=snd=tr=fi=null}
    }
    setCanType(!!o.canType);

    /* ----- initial load ----- */
    (async()=>{
      const {data,error}=await sb.from('ticket_messages').select('*').eq('ticket_id',tid).order('created_at');
      if(!alive())return;
      if(error)th.innerHTML='<div class="k-err">Messages could not be loaded: '+esc(error.message||'')+'</div>';
      (data||[]).forEach(m=>add(m,{init:true}));
      ready=true;stickUntil=Date.now()+2500;toBottom(false);
      queue.splice(0).forEach(([k,m])=>k==='i'?onInsert(m):onUpdate(m));
      ack();
    })();
    return{channel:chn,setCanType,sync,destroy(){cleanup();try{sb.removeChannel(chn)}catch(e){}}};
  }
  return{mount,watch,stopWatch};
})();

async function ticket(id){
  const {data:t,error}=await sb.from('tickets').select('*').eq('id',id).maybeSingle();
  if(error||!t){shell('help','<div class="box empty"><h3>Report not found</h3><p>It may have been removed.</p><a class="btn" href="#/help">Back to reports</a></div>');return}
  const canType=()=>t.chat_enabled&&t.status!=='closed';
  const lockText=()=>t.status==='closed'?'This report is closed. Thank you for helping us improve.':'Nothing more is needed from you right now. If we need more details, chat will be turned on here and you can reply.';
  shell('ticket',`<div class="crumb"><a href="#/help">&larr; All reports</a></div>
  <div class="row" style="margin-top:8px"><h2>${esc(t.subject)}</h2><span class="st ${t.status}">${SL[t.status]||t.status}</span></div><div class="thread norv" id="th" aria-live="polite"></div>
  <div id="kc"></div><div class="lock" id="klock"${canType()?' hidden':''}>${lockText()}</div>`);
  const chat=ChatKit.mount({sb,ticketId:id,meId:me.id,role:'student',th:$('#th'),comp:$('#kc'),canType:canType(),theme:'dark',
    cls:m=>'b '+(m.is_founder?'f':'me'),who:m=>m.is_founder?'Founder':'You',mine:m=>!m.is_founder,
    extend:ch=>ch.on('postgres_changes',{event:'UPDATE',schema:'public',table:'tickets',filter:`id=eq.${id}`},p=>{
      const n=p.new;t.chat_enabled=n.chat_enabled;t.status=n.status;
      const s=$('.st');if(s){s.className='st '+n.status;s.textContent=SL[n.status]||n.status}
      const on=canType();chat.setCanType(on);const lk=$('#klock');if(lk){lk.hidden=on;lk.textContent=lockText()}})});
  rt=chat.channel;
}


Boot.run(init().catch(e=>{console.error(e);route()}),()=>{introDone=true;scan()});
