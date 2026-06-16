# `division.html` — division worksheet generator

**File:** `division.html` · **Shared patterns:** [`conventions.md`](conventions.md)

A seed-driven generator for division as equal sharing and grouping, built on the shared `WS` engine.
Four section types; divisors from {2, 3, 4, 5, 6, 10}, quotients 2–9, dividends ≤ 20 (exact —
no remainders). Object pictures use bundled Twemoji (18 nouns).

---

## 1. Exercise types

| Section (fn) | Asks | Child does | Marked by |
|---|---|---|---|
| Share equally (`gShare`) | N objects shown; "Arrange into G equal groups. There are __ in each group." | types quotient q | `num` input |
| Make groups (`gGroup`) | N objects shown; "Put them into groups of G. There are __ groups." | types quotient q | `num` input |
| Share (words) (`gShareWord`) | "Share N cookies equally among G friends. Each friend gets __ cookies." | types quotient q | `num` input |
| Group (words) (`gGroupWord`) | "There are N eggs. Each box holds G. How many boxes are needed? __" | types quotient q | `num` input |

---

## 2. Visuals

Each question shows a flat picture panel (`.pics`) containing N identical Twemoji `<img>` elements
(30×30 px) in a wrapping flex row — so the child can see the total and physically count or circle
them. No custom SVG; pictures are local Twemoji from `assets/twemoji/`.

For picture sections (`gShare`, `gGroup`) the full set of N icons is shown ungrouped; for word
sections (`gShareWord`, `gGroupWord`) the same flat N-icon panel is shown as context, with the
story in a text block beside it.

---

## 3. Answer kinds & determinism

All answers are the quotient q (a plain integer); the default `num` kind handles them.

`makeNG()` picks a `(q, G)` pair uniformly from all valid combinations (`q ∈ 2..9`,
`G ∈ {2,3,4,5,6,10}`, `N = q*G ≤ 20`), giving 27 valid triples. Each section has its own
`distinctBy(makeNG, keyNG)` instance, keyed on `N+'|'+G`, so the same division fact never appears
twice within a section. Sections are independent, so the same fact may appear across sections
(intended: share and share-word are separate pedagogical contexts).

Nouns are drawn from a global `used` Set (draw-without-replacement, falls back to full pool when
exhausted). `RECIPIENTS` and `CONTAINERS` are picked independently per question with `pick()`.

---

## 4. Config (URL params, clamped 0–20 each)

`share` 4 · `group` 4 · `shareword` 4 · `groupword` 4
