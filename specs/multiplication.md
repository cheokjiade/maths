# `multiplication.html` — multiplication worksheet generator

**File:** `multiplication.html` · **Shared patterns:** [`conventions.md`](conventions.md)

A seed-driven generator for multiplication as equal groups and repeated addition, built on the
shared `WS` engine. Four section types; all factors 2–5 with products ≤ 24 (15 distinct pairs).
Object pictures use bundled Twemoji (16 nouns).

---

## 1. Exercise types

| Section (fn) | Asks | Child does | Marked by |
|---|---|---|---|
| Equal groups (`gGroups`) | G groups of M objects drawn in bordered boxes; fill three blanks: repeated addition, "G groups of M", G × M | types sum, count, product (3 inputs) | three `num` inputs |
| Write sentence (`gWrite`) | R × C array of icons; "Write the multiplication sentence (rows × columns)" | types R, C, and product (3 inputs) | three `num` inputs |
| Multiply (`gMultiply`) | `G × M = __` beside G boxes of M icons | types product | `num` input |
| Word problems (`gWord`) | "There are G baskets. There are M apples in each basket." + pre-printed `__ × __ = __` + "There are __ apples altogether." | types both factors and product, then the sentence total (4 inputs) | four `num` inputs |

---

## 2. Visuals

- **`groupBoxes(cp, g, m)`** — `g` bordered `.gbox` divs, each containing `m` identical 24×24 px
  Twemoji `<img>` elements, laid in a flowing row (`.groups`).
- **`arrayPic(cp, r, c)`** — a CSS grid (`.array`, `grid-template-columns: repeat(c, 1fr)`) of
  `r*c` identical 26×26 px Twemoji icons, shown in a `.pic-side` panel beside the equation.
- All pictures are local Twemoji SVGs under `assets/twemoji/`; `used` Set prevents the same icon
  appearing twice on one sheet.

---

## 3. Answer kinds & determinism

All answers are plain numbers; the default `num` kind handles them.

Factor pairs are drawn from `PAIRS` (all `{a,b}` with `a,b ∈ 2..5` and `a*b ≤ 24`): 15 pairs.
Each section has a `poolRoller` that iterates over a freshly-shuffled copy of `PAIRS` so the 15
pairs fill in without repetition before cycling. A `distinctBy` wrapper keyed on `g+'x'+m` (or
`r+'x'+c`) additionally re-rolls if the same ordered pair appears twice, giving a hard no-duplicate
guarantee.

Each section has its own independent `poolRoller` and `distinctBy` instance, so sections don't
share draw order. Nouns are drawn from a global `used` Set (draw-without-replacement, falls back to
full pool when exhausted), so the same icon is unlikely to appear twice on one sheet.

---

## 4. Config (URL params, clamped 0–20 each)

`groups` 4 · `write` 4 · `multiply` 4 · `word` 4
