# `verify/` — browser-driven verifier

**Files:** `verify/verify.js`, `verify/package.json`, `verify/README.md`

A single generic Playwright script that loads each generator in a real browser, fills in every
answer correctly, presses Submit, and asserts the marker awards full marks — then repeats with one
deliberate fault and asserts the score drops. It proves the generators both *render* and *mark*
correctly, end to end, without a browser download.

```
cd verify && npm install && npm run verify
```

It drives your already-installed Chrome/Edge via `playwright-core` (auto-detected from common install
paths and Playwright channels; override with `CHROME_PATH`). Full-page screenshots of each happy run
land in `verify/out/`. Exit code is non-zero if any target fails.

---

## How it works

For each target (subtraction, addition, shapes, ordinals) it runs the same `drive()` twice:

- **Happy path** — fills every `input.gradable` from its `data-answer`, clicks every
  `.chip[data-ok="1"]`, reconstructs each grid figure, submits, asserts `right === total` and **no
  console errors**.
- **Probe** — repeats with one injected fault (first input left blank, one grid segment skipped) and
  asserts `right < total`. This is the load-bearing half: it proves the marker actually distinguishes
  right from wrong rather than always passing.

```javascript
const happyOK = happy.total > 0 && happy.right === happy.total && happy.errs.length === 0;
const probeOK = probe.total > 0 && probe.right < probe.total;
const pass = happyOK && probeOK;
```

The score is read from `#score` with `/Score:\s*(\d+)\s*\/\s*(\d+)/`.

---

## Why it's generic (and the contract it depends on)

The harness knows **nothing** about any specific generator. It relies only on the shared marking
conventions documented in [`conventions.md`](conventions.md) §4:

- typed answers expose `input.gradable[data-answer]`,
- multiple-choice/colour-match expose `.chip[data-ok]`,
- the interactive grid exposes `svg[data-grid]` with a sibling target grid and `.ghit[data-gx][data-gy]`
  hit-dots,
- the score renders into `#score` as `Score: R / T`.

**A new generator that follows those conventions is added by appending one line to the `TARGETS`
array — no other change.** Conversely, if you break one of those selectors in a generator, the
verifier is how you'll find out.

---

## The clever part — replaying the grid figure (`gridPlan`)

To "draw" a shapes grid figure, the script runs in-page, reads each target line's endpoints from the
left (non-interactive) SVG, finds the **nearest interactive dot** to each endpoint by squared
distance, and returns the figure as pairs of `(gx,gy)` dot coordinates. `drive()` then clicks those
dot pairs to recreate the line — mirroring exactly how a child would tap.

```javascript
const nearest = (x, y) => hits.reduce((b, h) => {
  const d = (h.cx - x) ** 2 + (h.cy - y) ** 2; return d < b.d ? { d, h } : b;
}, { d: 1e9, h: null }).h;
out[svg.id] = [...left.querySelectorAll('line.gtarget')].map(L => {
  const a = nearest(+L.getAttribute('x1'), +L.getAttribute('y1'));
  const b = nearest(+L.getAttribute('x2'), +L.getAttribute('y2'));
  return [[a.gx, a.gy], [b.gx, b.gy]];
});
```

---

## Gotchas

- Totals in `verify/README.md` ("happy 37/37" etc.) are illustrative — exact counts move with the
  default question counts in each generator, so don't hard-code them.
- `node_modules/` and `out/` are git-ignored.
- The shapes target passes an all-sections-on params string so every exercise type is exercised.
- It asserts **zero console errors** on the happy path — a generator that throws during render fails
  even if the visible score looks fine.
