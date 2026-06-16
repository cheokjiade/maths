# `subtraction_worksheet*.html` — legacy prototypes

**Files:** `subtraction_worksheet.html`, `subtraction_worksheet_1.html`, `subtraction_worksheet_2.html`,
`subtraction_worksheet_3.html`

These four files are **early prototypes** of the subtraction worksheet, superseded by the production
generator `subtraction.html`. They are git-tracked but **unreferenced** — nothing links to them
(`index.html` points only at `subtraction.html`), and the verifier does not test them.

> **Recommendation:** treat these as historical/throwaway. They no longer meet the project's
> requirements (see below) and are safe to delete once anything worth keeping has been folded into
> `subtraction.html` and [`subtraction.md`](subtraction.md). They are documented here so a future
> reader doesn't mistake them for live pages or a second entry point.

---

## What they are

| File | ~Lines | Shape |
|------|--------|-------|
| `subtraction_worksheet.html` | 717 | **Fully static** — no `<script>`; every problem hand-rendered in the HTML, including a "scene: emoji laid over an inline SVG background" experiment. |
| `subtraction_worksheet_1.html` | 262 | Early **dynamic** prototype with a small script (`group()`, `helperHTML()` builders); variant 1. |
| `subtraction_worksheet_2.html` | 262 | Same engine, variant 2. |
| `subtraction_worksheet_3.html` | 262 | Same engine, variant 3. |

They share the visual DNA that survived into `subtraction.html`: the A4 Comic-Sans/Century-Gothic
worksheet styling, the plain-equation and picture-word-problem layout, and the cookie-jar / presents
examples from the source workbook page.

---

## Why they are superseded (how they diverge from the current spec)

1. **They load icons from a CDN, not local assets.** Every image points at
   `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/<codepoint>.svg`. This directly
   violates the hard offline requirement in [`subtraction.md`](subtraction.md) §7.1 — the production
   page bundles SVGs under `assets/twemoji/` with no runtime third-party request.
2. **No seed / no reproducibility.** The static page is frozen; the `_1`/`_2`/`_3` variants are
   separate files rather than one seed-driven generator.
3. **No interactive marking, panel, or URL configuration** — none of the shared conventions in
   [`conventions.md`](conventions.md) apply.

---

## What (if anything) to mine from them

The static `subtraction_worksheet.html` is the closest artifact to the original workbook page and is
useful as a **visual reference** for the intended look (scene composition, spacing, the boxed-equation
appearance) — that intent is already captured in [`subtraction.md`](subtraction.md) §3. Beyond that
reference value, there is nothing in these files not better expressed by `subtraction.html`.
