# Shared conventions

Every worksheet generator in this repo (`addition.html`, `subtraction.html`, `shapes.html`,
`ordinals.html`, `numbers20.html`) is a static page that shares one engine and one stylesheet:

- **`assets/worksheet.css`** — all the common styling (panel, score, headers, inputs, chips, print).
- **`assets/worksheet.js`** — the shared engine, exposed as a global **`WS`** (PRNG, config helpers,
  number-word parsing, the marking contract, chip wiring, the control-panel wiring, tooltips).

Each page keeps only its **topic-specific** `<style>` (components unique to it) and `<script>` (its
question generators + a little glue). **If you change one of these shared contracts, update
`assets/worksheet.*` and re-run [`verify.md`](verify.md) — it exercises all five pages.**

---

## 1. Loads from `file://` — classic includes only

The shared files are pulled in with a plain stylesheet link and a **classic** script tag:

```html
<link rel="stylesheet" href="assets/worksheet.css">
<script src="assets/worksheet.js"></script>   <!-- NOT type="module" -->
```

This is deliberate: classic `<script src>` and `<link>` work when the page is opened straight from
disk (`file://`, double-click). **ES modules / `import` / `fetch()` of local files do _not_ work from
`file://`** (blocked by CORS), so the engine must stay a classic global-`WS` script. Everything else
is local too (Twemoji SVGs under `assets/twemoji/`), so the pages work fully offline and on GitHub
Pages alike. A page + the `assets/` folder is the unit of deployment.

To add a topic: drop a new page at the repo root (so it shares `assets/`), link the two shared files,
and add a card in `index.html`.

---

## 2. Determinism — the seeded PRNG

All randomness comes from a string **seed**, so the same seed + settings always produce a
byte-for-byte identical worksheet. The PRNG lives in the engine:

```javascript
const rng = WS.makeRng(cfg.seed);                 // xmur3(seed) -> mulberry32 stream
const { randInt, pick, shuffle, distinct } = WS.helpers(rng);   // rng-bound helpers
```

`WS.makeRng` is `mulberry32(xmur3(String(seed))())`; `WS.helpers(rng)` returns the inclusive
`randInt`, `pick`, Fisher–Yates `shuffle`, `distinct(k,lo,hi)` (k distinct ints), and
`balanced(list)`.

**`balanced(list)` — variant coverage.** Returns `i => variant`, a shuffled round-robin indexed by
the 1-based question number, so a section's sub-variants are *spread* across it rather than chosen by
an independent per-question coin-flip (which can omit some for a given seed). Use it whenever a section
renders visually-distinct variants — addition's 4 word-problem layouts, shapes' size/colour/shape
grouping, write-in-words vs write-in-numerals, the tens-and-ones phrasings, numbers100's more/less.
Every variant appears once the section's count reaches the number of variants, so set that section's
default count `≥` the variant count (e.g. shapes `group` defaults to 3). The graphs style spread and
within20's add/subtract balance are the same idea.

The same idea extends from *cosmetic* variants to *content*: when a section would otherwise pick its
content with replacement (a number, a composite, a figure) and could repeat a whole question, draw
from a shuffled pool indexed by the question number, or wrap the picker in a `distinctBy(pick, keyOf)`
that re-rolls past already-used keys. The verifier **fails any generator that renders the same
question twice** in a section (see [`verify.md`](verify.md)), so distinct content is a hard contract,
not a nicety.

> **Gotcha:** the RNG is consumed in a fixed order, so *inserting a new `rng()` call anywhere shifts
> every later draw* — the same seed then renders a different sheet. Acceptable (seeds aren't promised
> stable across code versions) but you can't reorder generator calls without changing worksheets.

### Random seed on a fresh visit

If the URL has **no** `?seed=`, the page picks a random **child-friendly 4–5 letter word**
(`WS.randomSeed()`, from a built-in list — e.g. `tiger`, `duck`, `kitty`) so each fresh open differs
and the seed is easy to read/share, then `WS.wirePanel` writes it back into the address bar with
`history.replaceState` — so the worksheet stays reproducible/bookmarkable on refresh.

```javascript
const cfg = { seed: WS.Q.get('seed') || WS.randomSeed(), /* …counts… */ };
```

### Draw-without-replacement for pictures

Generators that show emoji objects keep a `used` `Set` of codepoints and prefer unused ones, falling
back to the full pool when exhausted, so a sheet shows variety. The set is not cleared between
sections, so very long sheets repeat objects later.

---

## 3. Configuration & the control panel

Config is read from `location.search` via `WS.Q` and clamped with `WS.clamp` / `WS.toInt`:

```javascript
const cfg = { seed: WS.Q.get('seed') || WS.randomSeed(),
              count: WS.clamp(WS.toInt(WS.Q.get('count'), 3), 0, 20), /* … */ };
```

The panel is a **collapsible `<details class="panel no-print" id="ws-panel" open>`** with a
`<summary>` title. `WS.wirePanel(cfg, keys, {mark, clear})`:

- fills the `f-<key>` fields from `cfg` (checkbox keys use `.checked`),
- wires **Generate** (rebuild query + reload), **🎲 Random seed**, **Submit**, **Clear**, **Print**,
- writes the generated seed to the URL if `?seed=` was absent,
- **collapses the panel on phones** (`window.innerWidth < 700` → `details.open = false`) so it doesn't
  fill the screen,
- activates **tooltips**: any panel `<label data-tip="…">` shows its text on hover (desktop) or tap
  (touch) via a single floating `.ws-tip`.

A section whose count is `0` renders nothing (its heading is omitted).

---

## 4. The marking contract

This is the shared interface the verifier depends on. `WS.mark(opts)` tallies three things and writes
`Score: R / T (P%)` to `#score` (the verifier reads `/Score:\s*(\d+)\s*\/\s*(\d+)/`).

**(a) Typed-answer inputs** — class `gradable`, the correct value in `data-answer`, and an optional
`data-kind` selecting the normaliser (default `num`):

```html
<input class="ans gradable" data-answer="6" type="text" inputmode="numeric">   <!-- num -->
<input class="txt gradable" data-kind="name" data-answer="circle" type="text">  <!-- custom -->
```

`num` accepts digits or spelled number-words 0–25 (`WS.parseNum`). Pages register extra kinds with
`WS.addKind(name, (value, answer) => bool)` — e.g. ordinals adds `ord` (3rd/third/3), `letter`,
`name`; shapes adds `name`.

**(b) Tappable chips** — `.sel-block` (or `.match-block`) containing `.chip[data-ok]` buttons.
`WS.wireChips()` makes `data-mode="one"` blocks behave like radios and `many`/`match-block` like
checkboxes. Each block is **one** point, all-or-nothing: `.correct` (selected & right), `.incorrect`
(selected & wrong), `.missed` (unselected & should be).

**(b2) Drag-to-order** — a `.dorder` block with draggable `.dtile[data-val]` tiles in a `.dsource`
pool and `.dslot[data-answer]` drop boxes. `WS.enableDragOrder()` wires both **tap-to-place** (tap a
tile, tap a slot) and **pointer drag** (mouse + touch, no library, `file://`-safe). `WS.mark()` grades
it automatically — each slot is one point, correct iff it holds the tile whose value equals its
`data-answer`; wrong slots show `(answer)`. `WS.clearAll()` returns the tiles. Used by the "Order the
numbers" sections of `numbers20`/`numbers100`.

**(c) Custom markers** — pass `extras: [fn, …]` where each `fn` returns `{total, right}` and does its
own painting; use `skip: inp => …` to exclude inputs the extras handle. Shapes uses this for the
order-independent **compose** pair and the copy-the-figure **grid** (segments matched as unordered
keys, all-or-nothing per grid — see [`shapes.md`](shapes.md)).

```javascript
WS.wirePanel(cfg, KEYS, {
  mark:  () => WS.mark({ skip: i => i.closest('[data-compose]'), extras: [composeExtra, gridExtra] }),
  clear: () => WS.clearAll(gridClear),
});
```

---

## 5. Printing

`assets/worksheet.css`'s `@media print` block hides everything `.no-print` (panel, buttons, score,
tooltip), resets `.correct`/`.incorrect` to ink black and hides `.correction` spans (so a sheet marked
on screen prints clean), neutralises chip colours, and uses `@page { size: A4 }` with
`page-break-inside: avoid` per item. Pages add their own print tweaks for bespoke parts (e.g. shapes
hides the grid's dashed "missing" ghosts). The visual language is a children's worksheet — Comic
Sans / Century Gothic, large rounded type, black-and-white line art — not a web dashboard.

---

## 6. Assets

Icons are **Twemoji** (Twitter, CC-BY 4.0), one SVG per icon named by Unicode codepoint, committed
under `assets/twemoji/` and referenced as `assets/twemoji/<codepoint>.svg`. **No CDN, no system-emoji
fallback** — pages must work offline, and OS emoji render differently per device. Composite scenes
with no single emoji (fish tank, pond) are inline SVG with icons placed on top. Shapes are drawn
entirely as inline SVG (no emoji). Emoji used as UI decoration (🎲 ✅ 🖨️) are system glyphs, not
bundled, and never appear on the printable worksheet.

---

## When you add a generator

1. Link `assets/worksheet.css` + `assets/worksheet.js`; keep only page-specific `<style>`/`<script>`.
2. Build `cfg` from `WS.Q`/`clamp`/`toInt` (seed defaults to `WS.randomSeed()`).
3. Use the marking contract: `gradable` inputs (+ `WS.addKind` for new answer types), `.sel-block`
   chips, `extras`/`skip` for anything bespoke. Call `WS.wireChips()` and `WS.wirePanel(...)`.
4. Use the collapsible `<details id="ws-panel">` panel with `data-tip` on each field.
5. Add a spec here (from the template), a `TARGETS` entry in `verify/verify.js`, and a card in
   `index.html`.
