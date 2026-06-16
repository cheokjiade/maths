/* Shared engine for all worksheet generators.
 * Loaded as a CLASSIC script (<script src="assets/worksheet.js"></script>) — NOT a module —
 * so it works from file:// (double-click) with no server. Exposes a global `WS`.
 *
 * Each generator: builds its cfg from WS.Q/clamp/toInt (seed defaults to WS.randomSeed()),
 * makes an rng with WS.makeRng, generates question HTML, then calls WS.wireChips() and
 * WS.wirePanel(...). wirePanel also wires tooltips, collapses the panel on small screens,
 * and writes a generated seed back into the URL. Page-specific answer kinds register via
 * WS.addKind(name, fn); custom markers (grids, etc.) pass as `extras` to WS.mark().
 */
window.WS = (function () {
  "use strict";

  /* ---- seeded PRNG ---- */
  function xmur3(s){ let h=1779033703^s.length; for(let i=0;i<s.length;i++){ h=Math.imul(h^s.charCodeAt(i),3432918353); h=(h<<13)|(h>>>19); } return function(){ h=Math.imul(h^(h>>>16),2246822507); h=Math.imul(h^(h>>>13),3266489909); return (h^=h>>>16)>>>0; }; }
  function mulberry32(a){ return function(){ a|=0; a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
  function makeRng(seed){ return mulberry32(xmur3(String(seed))()); }
  function helpers(rng){
    return {
      randInt:(lo,hi)=>lo+Math.floor(rng()*(hi-lo+1)),
      pick:a=>a[Math.floor(rng()*a.length)],
      shuffle:a=>{ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(rng()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; },
      distinct:(k,lo,hi)=>{ const s=new Set(); let g=0; while(s.size<k && g++<500) s.add(lo+Math.floor(rng()*(hi-lo+1))); return [...s]; },
    };
  }
  /* short, child-friendly random seed (a 4–5 letter word) for fresh (no ?seed=) visits */
  const SEEDWORDS = ['bear','duck','fish','lion','bird','cake','moon','tree','ball','frog','star','swan','deer','goat','crab','seal','panda','tiger','zebra','koala','puppy','bunny','candy','robot','train','plane','smile','happy','jelly','mango','lemon','peach','grape','melon','daisy','cloud','snail','otter','whale','shark','sheep','horse','mouse','snake','apple','sunny','teddy','kitty','fairy','magic','pearl','coral','berry','honey','pizza','kite','leaf','rose','plum','pear','kiwi'];
  function randomSeed(){ return SEEDWORDS[Math.floor(Math.random() * SEEDWORDS.length)]; }

  /* ---- config helpers ---- */
  const Q = new URLSearchParams(location.search);
  const clamp = (v,lo,hi)=>Math.max(lo,Math.min(hi,v));
  const toInt = (v,d)=>{ const n=parseInt(v,10); return isNaN(n)?d:n; };

  /* ---- number words (0–25 covers every generator) ---- */
  const NUMWORD = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty','twenty-one','twenty-two','twenty-three','twenty-four','twenty-five'];
  const WMAP = {}; NUMWORD.forEach((w,i)=>{ WMAP[w]=i; WMAP[w.replace('-',' ')]=i; WMAP[w.replace('-','')]=i; });
  function parseNum(s){ s=(s||'').toLowerCase().trim(); if(s==='') return NaN; if(/^\d+$/.test(s)) return Number(s); return (s in WMAP)?WMAP[s]:NaN; }

  /* ---- answer-kind normalisers (kind -> (value, answer) => bool) ---- */
  const NORMS = { num:(v,a)=>parseNum(v)===parseNum(a) };
  function addKind(name, fn){ NORMS[name]=fn; }

  /* ---- marking ---- */
  function setMark(inp, ok, txt){
    inp.classList.remove('correct','incorrect');
    const old=inp.parentNode.querySelector('.correction'); if(old) old.remove();
    if(ok){ inp.classList.add('correct'); }
    else { inp.classList.add('incorrect'); const s=document.createElement('span'); s.className='correction'; s.textContent='('+txt+')'; inp.after(s); }
  }
  function markInputs(skip){
    let total=0, right=0;
    document.querySelectorAll('input.gradable').forEach(inp=>{
      if(skip && skip(inp)) return;
      total++;
      const kind=inp.dataset.kind||'num';
      const norm=NORMS[kind]||NORMS.num;
      const ok=norm(inp.value, inp.dataset.answer);
      if(ok) right++; setMark(inp, ok, inp.dataset.answer);
    });
    return { total, right };
  }
  function blockMode(b){ return b.dataset.mode || (b.classList.contains('match-block') ? 'many' : 'one'); }
  function wireChips(){
    document.querySelectorAll('.sel-block,.match-block').forEach(b=>{
      const mode=blockMode(b);
      b.querySelectorAll('.chip').forEach(c=>c.addEventListener('click',()=>{
        if(mode==='one') b.querySelectorAll('.chip').forEach(x=>{ if(x!==c) x.classList.remove('selected'); });
        c.classList.toggle('selected');
      }));
    });
  }
  function markChips(){
    let total=0, right=0;
    document.querySelectorAll('.sel-block,.match-block').forEach(b=>{
      total++; let ok=true;
      b.querySelectorAll('.chip').forEach(c=>{
        const should=c.dataset.ok==='1', sel=c.classList.contains('selected');
        c.classList.remove('correct','incorrect','missed');
        if(sel&&should) c.classList.add('correct');
        else if(sel&&!should){ c.classList.add('incorrect'); ok=false; }
        else if(!sel&&should){ c.classList.add('missed'); ok=false; }
      });
      if(ok) right++;
    });
    return { total, right };
  }
  function showScore(right, total){
    const pct = total ? Math.round(right/total*100) : 0;
    const face = pct===100 ? ' 🌟' : pct>=70 ? ' 😀' : ' 💪';
    const el=document.getElementById('score');
    el.textContent='Score: '+right+' / '+total+'  ('+pct+'%)'+face;
    el.style.display='block';
    el.scrollIntoView({ behavior:'smooth', block:'nearest' });
  }
  /* drag-to-order: each .dslot[data-answer] is correct iff it holds the .dtile with that value */
  function markDragOrder(){
    let total=0, right=0;
    document.querySelectorAll('.dslot[data-answer]').forEach(slot=>{
      total++;
      const tile=slot.querySelector('.dtile');
      const ans=slot.getAttribute('data-answer');
      const ok = !!tile && tile.getAttribute('data-val')===ans;
      slot.classList.remove('correct','incorrect'); slot.removeAttribute('data-correct');
      if(ok){ slot.classList.add('correct'); right++; }
      else { slot.classList.add('incorrect'); slot.setAttribute('data-correct', ans); }
    });
    return { total, right };
  }
  /* opts: { skip:(inp)=>bool, extras:[ ()=>({total,right}) ] } */
  function mark(opts){
    opts=opts||{}; let total=0, right=0;
    const a=markInputs(opts.skip); total+=a.total; right+=a.right;
    const c=markChips(); total+=c.total; right+=c.right;
    const d=markDragOrder(); total+=d.total; right+=d.right;
    (opts.extras||[]).forEach(fn=>{ const e=fn()||{total:0,right:0}; total+=e.total; right+=e.right; });
    showScore(right, total);
  }
  function clearAll(extra){
    document.querySelectorAll('input.gradable').forEach(inp=>{ inp.value=''; inp.classList.remove('correct','incorrect'); const old=inp.parentNode.querySelector('.correction'); if(old) old.remove(); });
    document.querySelectorAll('.chip').forEach(c=>c.classList.remove('selected','correct','incorrect','missed'));
    document.querySelectorAll('.dorder').forEach(o=>{ const src=o.querySelector('.dsource');
      o.querySelectorAll('.dslot .dtile').forEach(t=>{ if(src) src.appendChild(t); });
      o.querySelectorAll('.dslot').forEach(s=>{ s.classList.remove('correct','incorrect'); s.removeAttribute('data-correct'); }); });
    if(extra) extra();
    const el=document.getElementById('score'); if(el) el.style.display='none';
  }

  /* drag/tap-to-order interaction: tiles in a .dsource move into .dslot drop boxes (tap-to-place or drag).
     No library, pointer events (mouse + touch), file://-safe. Marking is automatic in WS.mark. */
  function enableDragOrder(){
    let selected=null, drag=null;
    const orderOf=el=>el.closest('.dorder');
    function clearSel(){ if(selected) selected.classList.remove('dsel'); selected=null; }
    function place(tile, slot){ const o=orderOf(tile); if(orderOf(slot)!==o) return; const occ=slot.querySelector('.dtile'); const src=o.querySelector('.dsource'); if(occ && occ!==tile) src.appendChild(occ); slot.appendChild(tile); clearSel(); }
    function toSource(tile){ orderOf(tile).querySelector('.dsource').appendChild(tile); clearSel(); }

    document.querySelectorAll('.dorder .dtile').forEach(t=>{
      t.addEventListener('click', ()=>{ if(t._dragged) return; if(selected===t){ clearSel(); return; } clearSel(); selected=t; t.classList.add('dsel'); });
      t.addEventListener('pointerdown', startDrag);
    });
    document.querySelectorAll('.dorder .dslot').forEach(s=>{
      s.addEventListener('click', ()=>{ if(selected){ place(selected, s); } else { const occ=s.querySelector('.dtile'); if(occ) toSource(occ); } });
    });

    function startDrag(e){ if(e.pointerType==='mouse' && e.button!==0) return; const tile=e.currentTarget; const r=tile.getBoundingClientRect();
      drag={ tile, dx:e.clientX-r.left, dy:e.clientY-r.top, w:r.width, h:r.height, sx:e.clientX, sy:e.clientY, moved:false };
      try{ tile.setPointerCapture(e.pointerId); }catch(_){}
      tile.addEventListener('pointermove', onMove); tile.addEventListener('pointerup', onUp); }
    function onMove(e){ if(!drag) return;
      if(!drag.moved){ if(Math.hypot(e.clientX-drag.sx, e.clientY-drag.sy) < 5) return;
        drag.moved=true; const t=drag.tile; t.classList.add('dragging'); t.style.position='fixed'; t.style.width=drag.w+'px'; t.style.height=drag.h+'px'; t.style.zIndex='2000'; t.style.pointerEvents='none'; }
      drag.tile.style.left=(e.clientX-drag.dx)+'px'; drag.tile.style.top=(e.clientY-drag.dy)+'px'; }
    function onUp(e){ if(!drag) return; const t=drag.tile; t.removeEventListener('pointermove',onMove); t.removeEventListener('pointerup',onUp);
      if(drag.moved){ const el=document.elementFromPoint(e.clientX,e.clientY); t.classList.remove('dragging'); t.style.cssText='';
        const slot=el&&el.closest?el.closest('.dslot'):null; const src=el&&el.closest?el.closest('.dsource'):null; const o=orderOf(t);
        if(slot && orderOf(slot)===o) place(t,slot); else if(src && orderOf(src)===o) toSource(t);
        t._dragged=true; setTimeout(()=>{ t._dragged=false; },0); }
      drag=null; }
  }

  /* ---- option tooltips (hover on desktop, tap on touch) ---- */
  function tooltips(){
    let tip=document.querySelector('.ws-tip');
    if(!tip){ tip=document.createElement('div'); tip.className='ws-tip no-print'; tip.style.display='none'; document.body.appendChild(tip); }
    function show(el){ const t=el.getAttribute('data-tip'); if(!t) return; tip.textContent=t; tip.style.display='block';
      const r=el.getBoundingClientRect(); tip.style.left=(window.scrollX+r.left)+'px'; tip.style.top=(window.scrollY+r.bottom+6)+'px'; }
    function hide(){ tip.style.display='none'; }
    document.querySelectorAll('[data-tip]').forEach(el=>{
      el.addEventListener('mouseenter',()=>show(el));
      el.addEventListener('mouseleave',hide);
      el.addEventListener('click',()=>show(el));
    });
    document.addEventListener('click',e=>{ if(!e.target.closest('[data-tip]')) hide(); });
  }

  /* ---- control panel wiring (also: collapse on small screens, write seed to URL) ---- */
  function wirePanel(cfg, keys, handlers){
    const $=id=>document.getElementById(id);
    if($('f-seed')) $('f-seed').value=cfg.seed;
    keys.forEach(k=>{ const e=$('f-'+k); if(!e) return; if(e.type==='checkbox') e.checked=!!cfg[k]; else e.value=cfg[k]; });
    function apply(){
      const p=new URLSearchParams();
      p.set('seed', ($('f-seed')&&$('f-seed').value)||'1');
      keys.forEach(k=>{ const e=$('f-'+k); if(!e) return; p.set(k, e.type==='checkbox' ? (e.checked?'1':'0') : e.value); });
      location.search=p.toString();
    }
    if($('b-apply')) $('b-apply').onclick=apply;
    if($('b-random')) $('b-random').onclick=()=>{ $('f-seed').value=randomSeed(); apply(); };
    if($('b-submit')) $('b-submit').onclick=handlers.mark;
    if($('b-reset')) $('b-reset').onclick=handlers.clear;
    if($('b-print')) $('b-print').onclick=()=>window.print();

    /* a fresh visit had no ?seed= — reflect the generated one so it's bookmarkable/reproducible */
    if(!Q.has('seed')){ const p=new URLSearchParams(Q); p.set('seed', cfg.seed); history.replaceState(null,'', location.pathname+'?'+p.toString()); }

    /* collapse the options panel on phones so it doesn't fill the screen */
    const panel=document.getElementById('ws-panel');
    if(panel && 'open' in panel && window.innerWidth < 700) panel.open=false;

    tooltips();
  }

  return { makeRng, helpers, randomSeed, Q, clamp, toInt, NUMWORD, parseNum, addKind,
           setMark, markInputs, markChips, wireChips, showScore, mark, clearAll, wirePanel, tooltips,
           enableDragOrder };
})();
