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
  { name: 'shapes',      file: 'shapes.html',
    params: 'seed=verify&name=2&match=1&count=1&group=1&compose=1&object=1&grid=1&draw=1&part=1' },
  { name: 'ordinals',    file: 'ordinals.html', params: 'seed=verify' },
  { name: 'numbers20',   file: 'numbers20.html', params: 'seed=verify' },
  { name: 'numbers10',   file: 'numbers10.html', params: 'seed=verify' },
  { name: 'within20',    file: 'within20.html', params: 'seed=verify' },
  { name: 'graphs',      file: 'graphs.html',   params: 'seed=verify&read=2&build=1' },
];

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
    await ctx.close();

    const happyOK = happy.total > 0 && happy.right === happy.total && happy.errs.length === 0;
    const probeOK = probe.total > 0 && probe.right < probe.total;
    const pass = happyOK && probeOK;
    allPass = allPass && pass;

    console.log(
      `${pass ? 'PASS' : 'FAIL'}  ${t.name.padEnd(12)} ` +
      `happy ${happy.right}/${happy.total}  probe ${probe.right}/${probe.total}` +
      (happy.errs.length ? '  ERRORS: ' + happy.errs.join(' ; ') : '')
    );
  }

  await browser.close();
  console.log(allPass ? '\nAll verifiers PASSED' : '\nSome verifiers FAILED');
  process.exit(allPass ? 0 : 1);
})().catch(e => { console.error('VERIFY ERROR:', e); process.exit(1); });
