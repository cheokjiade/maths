/*
 * Browser-driven verifier for the worksheet generators.
 *
 * For each generator it loads the page in a real browser, fills every answer
 * from its data-answer, clicks the correct chips, copies any grid figures by
 * joining the right dots, presses Submit, and reads the score. It asserts:
 *   - happy path  -> full marks (right === total), no console errors
 *   - probe       -> a deliberate fault drops the score below full marks
 *
 * Run:  cd verify && npm install && npm run verify
 * Chrome/Edge is auto-detected; override with CHROME_PATH=/path/to/chrome.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const TARGETS = [
  { name: 'subtraction', file: 'subtraction.html', params: 'seed=verify' },
  { name: 'addition',    file: 'addition.html',    params: 'seed=verify' },
  { name: 'shapes',      file: 'shapes.html', gateDups: true,
    params: 'seed=verify&name=2&match=1&count=1&group=1&compose=1&object=1&grid=1&draw=1&part=1' },
  { name: 'ordinals',    file: 'ordinals.html', params: 'seed=verify' },
  { name: 'numbers20',   file: 'numbers20.html', params: 'seed=verify' },
  { name: 'numbers10',   file: 'numbers10.html', params: 'seed=verify' },
  { name: 'within20',    file: 'within20.html', params: 'seed=verify' },
  { name: 'graphs',      file: 'graphs.html',   params: 'seed=verify&read=3&build=1' },
  { name: 'numbers100',  file: 'numbers100.html', params: 'seed=verify' },
];

// Higher per-section counts used only for duplicate-question detection (each kept <= its pool size,
// so a healthy generator can render them all distinct). Falls back to the marking params if absent.
const DUP_PARAMS = {
  shapes:      'name=6&match=6&count=4&group=3&compose=4&object=4&grid=6&draw=6&part=4',
  numbers10:   'count=6&colourn=4&same=4&which=6&next=6&compare=6',
  numbers20:   'count=6&tens=5&words=6&match=4&pattern=6&compare=4&order=4&mf=6',
  numbers100:  'count10=6&words=6&tensones=6&moreless=4&patterns=6&compare=6&order=4&colourgrid=3',
  ordinals:    'colour=6&match=4&which=6&position=6&words=6&picture=4',
  within20:    'bareadd=8&baresub=8&picadd=6&picsub=6&maketen=6&match=4&missing=6&word=4',
  addition:    'bare=8&make=6&bond=6&pic=6&subset=6&word=4&commute=4&missing=4&count=4&match=4',
  subtraction: 'bare=8&given=6&btk=6&pw=6',
  graphs:      'read=4&build=4',
};

// Launch installed Chrome/Edge without downloading a browser.
async function launch() {
  const tries = [];
  if (process.env.CHROME_PATH) tries.push({ executablePath: process.env.CHROME_PATH });
  tries.push({ channel: 'chrome' }, { channel: 'msedge' });
  for (const p of [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ]) if (fs.existsSync(p)) tries.push({ executablePath: p });

  let last;
  for (const opt of tries) {
    try { return await chromium.launch({ headless: true, ...opt }); }
    catch (e) { last = e; }
  }
  throw new Error('No Chrome/Edge found. Set CHROME_PATH. Last error: ' + (last && last.message));
}

// In-page: map each interactive grid's target lines to dot (gx,gy) segment pairs.
function gridPlan() {
  const out = {};
  document.querySelectorAll('svg[data-grid]').forEach(svg => {
    const grids = svg.closest('.grids');
    const left = grids.querySelector('.gridwrap svg:not([data-grid])');
    const hits = [...svg.querySelectorAll('.ghit')].map(h => ({
      gx: +h.dataset.gx, gy: +h.dataset.gy, cx: +h.getAttribute('cx'), cy: +h.getAttribute('cy'),
    }));
    const nearest = (x, y) => hits.reduce((b, h) => {
      const d = (h.cx - x) ** 2 + (h.cy - y) ** 2; return d < b.d ? { d, h } : b;
    }, { d: 1e9, h: null }).h;
    out[svg.id] = [...left.querySelectorAll('line.gtarget')].map(L => {
      const a = nearest(+L.getAttribute('x1'), +L.getAttribute('y1'));
      const b = nearest(+L.getAttribute('x2'), +L.getAttribute('y2'));
      return [[a.gx, a.gy], [b.gx, b.gy]];
    });
  });
  return out;
}

// In-page: group every question by its section heading and return a signature per question.
// The signature captures what makes a question distinct — its prompt text, correct answers,
// selected-chip contents, colour-N needs, order tiles, and grid target lines — so the driver
// can spot two questions in the same section that are effectively identical.
function sectionSignatures() {
  const out = {};
  let cur = '(top)';
  const root = document.getElementById('sheet') || document.body;
  root.querySelectorAll('h2, .item').forEach(el => {
    if (el.tagName === 'H2') { cur = el.textContent.replace(/\s+/g, ' ').trim(); return; }
    const grab = (sel, f) => [...el.querySelectorAll(sel)].map(f).sort();
    const sig = [
      el.textContent.replace(/\s+/g, ' ').trim().replace(/^\d+\.\s*/, ''),
      grab('[data-answer]', x => x.getAttribute('data-answer')).join(','),
      grab('.chip[data-ok="1"]', c => c.innerHTML.replace(/\s+/g, '')).join('|'),
      grab('[data-need]', x => x.getAttribute('data-need')).join(','),
      grab('.dtile[data-val]', x => x.getAttribute('data-val')).join(','),
      grab('line.gtarget', L => ['x1','y1','x2','y2'].map(a => L.getAttribute(a)).join(',')).join(';'),
    ].join(' ## ');
    (out[cur] = out[cur] || []).push(sig);
  });
  return out;
}

async function drive(page, url, probe) {
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForSelector('input.gradable, .chip', { timeout: 15000 });

  const inputs = await page.$$('input.gradable');
  for (let i = 0; i < inputs.length; i++) {
    if (probe && i === 0) continue;              // leave first blank in the probe
    const a = await inputs[i].getAttribute('data-answer');
    if (a != null) await inputs[i].fill(a);
  }
  for (const c of await page.$$('.chip[data-ok]')) {
    if ((await c.getAttribute('data-ok')) === '1') await c.click();
  }
  // colour-exactly-N blocks: tap `need` of the chips
  for (const blk of await page.$$('.countn')) {
    const need = +(await blk.getAttribute('data-need'));
    const chips = await blk.$$('.chip');
    for (let k = 0; k < need && k < chips.length; k++) await chips[k].click();
  }
  // build-a-graph columns: shade `need` cells
  for (const col of await page.$$('.bg-col')) {
    const need = +(await col.getAttribute('data-need'));
    const cells = await col.$$('.cell');
    for (let k = 0; k < need && k < cells.length; k++) await cells[k].click();
  }
  // drag/tap-to-order: tap the matching tile, then its slot
  for (const order of await page.$$('.dorder')) {
    for (const slot of await order.$$('.dslot')) {
      const ans = await slot.getAttribute('data-answer');
      const tile = await order.$(`.dsource .dtile[data-val="${ans}"]`);
      if (tile) { await tile.click(); await slot.click(); }
    }
  }
  const plan = await page.evaluate(gridPlan);
  const gids = Object.keys(plan);
  for (const gid of gids) {
    let k = 0;
    for (const [[ax, ay], [bx, by]] of plan[gid]) {
      if (probe && gid === gids[0] && k++ === 0) continue;   // skip one segment in the probe
      await page.click(`#${gid} .ghit[data-gx="${ax}"][data-gy="${ay}"]`);
      await page.click(`#${gid} .ghit[data-gx="${bx}"][data-gy="${by}"]`);
    }
  }
  await page.click('#b-submit');
  await page.waitForTimeout(250);
  const txt = (await page.textContent('#score')) || '';
  const m = txt.match(/Score:\s*(\d+)\s*\/\s*(\d+)/);
  return { right: m ? +m[1] : -1, total: m ? +m[2] : -1, errs, txt: txt.trim() };
}

// Load a generator across several seeds and report sections that render duplicate questions.
// A section is treated as a real (systemic) defect only if duplicates recur in >=2 of 3 seeds —
// a single coincidental collision in one seed is noted but not failed.
async function dupScan(ctx, t) {
  const params = DUP_PARAMS[t.name] || t.params.replace(/seed=\w+&?/, '');
  const seeds = ['dupaa', 'dupbb', 'dupcc'];
  const perSeed = [];
  for (const s of seeds) {
    const abs = path.resolve(__dirname, '..', t.file).replace(/\\/g, '/');
    const pg = await ctx.newPage();
    await pg.goto('file:///' + abs + '?seed=' + s + '&' + params, { waitUntil: 'load' });
    await pg.waitForSelector('#sheet .item, #sheet .chip', { timeout: 15000 }).catch(() => {});
    const sigs = await pg.evaluate(sectionSignatures);
    await pg.close();
    const dups = {};
    for (const sec of Object.keys(sigs)) {
      const counts = {};
      sigs[sec].forEach(x => { counts[x] = (counts[x] || 0) + 1; });
      const repeated = Object.entries(counts).filter(([, n]) => n > 1);
      if (repeated.length) dups[sec] = Math.max(...repeated.map(([, n]) => n));
    }
    perSeed.push(dups);
  }
  const sections = new Set(perSeed.flatMap(d => Object.keys(d)));
  const findings = [...sections].map(sec => ({
    section: sec,
    seedsWith: perSeed.filter(d => d[sec]).length,
    exampleCount: Math.max(...perSeed.map(d => d[sec] || 0)),
  })).sort((a, b) => b.seedsWith - a.seedsWith);
  return { findings, fail: findings.some(f => f.seedsWith >= 2) };
}

(async () => {
  const browser = await launch();
  const out = path.resolve(__dirname, 'out');
  fs.mkdirSync(out, { recursive: true });
  let allPass = true;

  for (const t of TARGETS) {
    const abs = path.resolve(__dirname, '..', t.file).replace(/\\/g, '/');
    const url = 'file:///' + abs + '?' + t.params;
    const ctx = await browser.newContext({ viewport: { width: 900, height: 1400 }, deviceScaleFactor: 2 });

    const p1 = await ctx.newPage();
    const happy = await drive(p1, url, false);
    await p1.screenshot({ path: path.join(out, t.name + '.png'), fullPage: true });
    const p2 = await ctx.newPage();
    const probe = await drive(p2, url, true);
    const dup = await dupScan(ctx, t);
    await ctx.close();

    const happyOK = happy.total > 0 && happy.right === happy.total && happy.errs.length === 0;
    const probeOK = probe.total > 0 && probe.right < probe.total;
    const dupGateFail = !!t.gateDups && dup.fail;
    const pass = happyOK && probeOK && !dupGateFail;
    allPass = allPass && pass;

    const systemic = dup.findings.filter(f => f.seedsWith >= 2);
    console.log(
      `${pass ? 'PASS' : 'FAIL'}  ${t.name.padEnd(12)} ` +
      `happy ${happy.right}/${happy.total}  probe ${probe.right}/${probe.total}  dups ${systemic.length}` +
      (happy.errs.length ? '  ERRORS: ' + happy.errs.join(' ; ') : '')
    );
    for (const f of dup.findings) {
      const sys = f.seedsWith >= 2;
      if (!sys) continue;                              // one-off coincidences aren't worth the noise
      console.log(`        ${t.gateDups ? 'DUP-FAIL' : 'DUP'}  "${f.section}" — identical question x${f.exampleCount} (${f.seedsWith}/3 seeds)`);
    }
  }

  await browser.close();
  console.log(allPass ? '\nAll verifiers PASSED' : '\nSome verifiers FAILED');
  process.exit(allPass ? 0 : 1);
})().catch(e => { console.error('VERIFY ERROR:', e); process.exit(1); });
