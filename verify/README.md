# Verifier

A browser-driven check that each worksheet generator renders and **marks** correctly.
It uses [`playwright-core`](https://playwright.dev) to drive your already-installed
Chrome or Edge — no browser download.

## Run

```bash
cd verify
npm install
npm run verify
```

Expected output:

```
PASS  subtraction  happy 37/37  probe 36/37
PASS  addition     happy 55/55  probe 54/55
PASS  shapes       happy 14/14  probe 12/14

All verifiers PASSED
```

(Exact totals vary with the default question counts.) Exit code is non-zero if any target fails.

## What it does

For each generator it loads the page with a fixed seed, then:

- **Happy path** — fills every `input.gradable` from its `data-answer`, clicks every
  correct chip (`.chip[data-ok="1"]`), reconstructs any grid figure by joining the right
  dots, presses **Submit**, and asserts full marks with no console errors.
- **Probe** — repeats with one deliberate fault (first answer left blank, one grid segment
  skipped) and asserts the score drops below full marks — proving the marker actually
  distinguishes right from wrong rather than always passing.

Full-page screenshots of each happy run are written to `verify/out/` for eyeballing.

## Notes

- Chrome/Edge is auto-detected (common install paths + Playwright channels). Override with
  `CHROME_PATH=/path/to/chrome npm run verify`.
- The harness is generic: it relies only on the shared marking conventions
  (`input.gradable[data-answer]`, `.chip[data-ok]`, `svg[data-grid]` with a sibling target
  grid). A new generator that follows those conventions can be added to the `TARGETS` list
  in `verify.js` with no other changes.
- `node_modules/` and `out/` are git-ignored.
