# Shared conventions

Every worksheet generator in this repo (`subtraction.html`, `addition.html`, `shapes.html`,
`ordinals.html`) is an independent, self-contained static page, yet they all share the same
skeleton. This document describes the conventions common to all of them so the per-file specs can
stay focused on what is unique. **If you change one of these contracts, change it in every
generator and update [`verify.md`](verify.md).**

---

## 1. One file = one app

Each generator is a single `.html` file with **inline `<style>` and `<script>`** — no build step, no
imports, no runtime third-party requests. The only external references are local SVG icons under
`assets/twemoji/` (shared by all pages). This is what makes the pages work opened straight from disk
and when served as static files from GitHub Pages.

To add a topic: drop a new page at the repo root (so it shares `assets/`) and add a card in
`index.html`.

---

## 2. Determinism — the seeded PRNG

All randomness comes from a string **seed**, so the same seed + same settings always produce a
byte-for-byte identical worksheet (reproducible, shareable, re-printable). Every generator uses the
same two well-known functions, copied verbatim into each file:

```javascript
// xmur3: hash a seed string into a 32-bit integer
function xmur3(str){
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++){
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function(){
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}
// mulberry32: turn that integer into a stream of floats in [0,1)
function mulberry32(a){
  return function(){
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(xmur3(cfg.seed)());   // hash the seed once, seed the stream
```

Helpers built on `rng()` are likewise near-identical across files:

```javascript
const randInt = (lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));   // inclusive
const pick    = arr => arr[Math.floor(rng() * arr.length)];
const shuffle = a => { /* Fisher–Yates using rng() */ };
```

> **Gotcha:** because the RNG is consumed in a fixed order, *inserting a new `rng()` call anywhere
> shifts every subsequent draw* — so the same seed renders a different sheet. That is acceptable
> (seeds aren't promised stable across code versions) but means you cannot reorder generator calls
> without changing existing worksheets.

### Draw-without-replacement for pictures

Generators that show emoji objects keep a `used`/`usedCP` `Set` of codepoints and prefer unused
objects, falling back to the full pool only when it is exhausted, so a single sheet shows variety:

```javascript
const used = new Set();
function pickNoun(){
  const av = NOUNS.filter(n => !used.has(n.cp));
  const n  = pick(av.length ? av : NOUNS);
  used.add(n.cp);
  return n;
}
```

The set is **not** cleared between sections, so very long sheets repeat objects in later sections.

---

## 3. Configuration via URL query parameters

Config is read from `location.search` (so a worksheet is shareable as a link) and mirrored in the
control panel. Every numeric param is **clamped** to a safe range; the seed defaults to `'1'`.
Clicking **Generate** rebuilds the query string and reloads the page (a soft reload via
`location.search`); a section whose count is `0` hides its heading.

```javascript
const Q = new URLSearchParams(location.search);
const cfg = { seed: Q.get('seed') || '1', /* …clamp(toInt(Q.get(x), default), lo, hi)… */ };
```

The control panel (`.no-print`) always offers: **Generate**, **🎲 Random seed**, **✅ Submit &
Mark**, **Clear answers**, **🖨️ Print**.

---

## 4. The marking contract

This is the shared interface the verifier depends on. Two kinds of gradable elements:

**(a) Typed-answer inputs** carry the correct value in a data attribute and a `gradable` class:

```html
<input class="ans gradable" data-answer="6" type="text" inputmode="numeric" autocomplete="off">
```

**(b) Tappable chips** (multiple-choice / colour-match / shape-select) carry `data-ok`:

```html
<button class="chip" data-ok="1">first</button>   <!-- data-ok="1" = should be selected -->
```

`Submit & Mark` walks both:

- Inputs: parse the value (digits **or** spelled-out number words — see below), compare to
  `data-answer`, add `.correct` / `.incorrect`, and on a miss insert a `.correction` span showing the
  right value.
- Chip blocks: each block counts as **one** point, all-or-nothing — a block is correct only if every
  `data-ok="1"` chip is selected and no others are. States: `.correct` (selected & right),
  `.incorrect` (selected & wrong), `.missed` (unselected & should be).

Number-word parsing accepts digits or words (and hyphen variants where the range needs them):

```javascript
function parseAnswer(s){
  s = (s || '').trim().toLowerCase();
  if (s === '') return NaN;
  if (/^\d+$/.test(s)) return Number(s);
  return (s in WMAP) ? WMAP[s] : NaN;   // 'three' / 'twenty-one' / 'twenty one' → number
}
```

A running score (`right / total`) is written to an element with `id="score"` in the form
`Score: R / T`, which the verifier reads with `/Score:\s*(\d+)\s*\/\s*(\d+)/`.

### Interactive grid figures (shapes only)

`shapes.html` adds a third gradable type: a copy-the-figure grid. The target lines live in a
sibling SVG; the user-drawn lines live in an `svg[data-grid]`. Segments are matched as **unordered
pairs** via a normalised key, all-or-nothing per grid. See [`shapes.md`](shapes.md) §grid.

---

## 5. Printing

A `@media print` block:

- hides everything `.no-print` (control panel, buttons, score),
- resets `.correct`/`.incorrect` colours back to ink black and hides `.correction` spans, so a sheet
  marked on screen prints **clean** (no answers leaked, no colour),
- uses `@page { size: A4; margin: … }` and `page-break-inside: avoid` on each item so problems don't
  split across pages.

The visual language throughout is a children's worksheet — Comic Sans / Century Gothic stack, large
rounded type, generous spacing, black-and-white line art — deliberately **not** a web dashboard
(no card shadows, gradients, or app chrome on the printable area).

---

## 6. Assets

Icons are **Twemoji** (Twitter, CC-BY 4.0), one SVG per icon named by Unicode codepoint, committed
under `assets/twemoji/` and referenced as `assets/twemoji/<codepoint>.svg`. **No CDN, no system-emoji
fallback** — the pages must work fully offline, and OS emoji render differently per device. Composite
scenes with no single emoji (fish tank, pond) are drawn as inline SVG with object icons placed on
top. Attribution to Twemoji sits in each page footer.

> Emoji used purely as UI decoration in the control panel/footer (🎲 ✅ 🖨️ 🔷) are system glyphs,
> not bundled assets — they never appear on the printable worksheet.
