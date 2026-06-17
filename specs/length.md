# `length.html` — length worksheet generator

**File:** `length.html` · **Shared patterns:** [`conventions.md`](conventions.md)

A seed-driven generator for measuring and comparing lengths, built on the shared `WS` engine.
Eight section types spanning centimetre rulers, non-standard units, bar comparisons, ordering,
curves, real-world benchmarks, and a print-only draw-a-line section — all rendered as inline SVG.

---

## 1. Exercise types

| Section (fn) | Asks | Child does | Marked by |
|---|---|---|---|
| Measure (`gRuler`) | read a cm ruler: "The pencil is __ cm long"; optionally 2 bars with a difference | types length(s) | `num` input(s) |
| Non-standard (`gNonstd`) | count unit-icons below an object bar; "The book is as long as __ paper clips" | types count | `num` input |
| Compare (`gCompare`) | two bars labelled A/B; "Which ribbon is longer / shorter / taller?" | taps A or B chip | `.sel-block` chip |
| Longest/shortest (`gExtremes`) | four bars A–D; "The longest is __ / the shortest is __" | types a letter (A–D) | `letter` input |
| Order (`gOrder`) | four bars A–D; drag into order shortest → longest | drags/taps tiles into slots | `WS.enableDragOrder()` (`.dorder`) |
| Curves (`gCurves`) | three same-width paths of differing waviness; "Which is the longest?" | types a letter (A–C) | `letter` input |
| Benchmark (`gBenchmark`) | everyday object name; "Is a door longer than 1 metre?" | taps "Less than 1 m" or "More than 1 m" | `.sel-block` chip |
| Draw (`gDraw`) | **print-only**: "Draw a straight line N cm long", a line K cm longer/shorter than a reference segment (`MN`/`XY`/…), or "a curve longer than line MN" | draws with a ruler on the printout (baseline + start dot) | not marked (no inputs) |

---

## 2. Visuals (all inline SVG, no library)

- **`drawObjH(kind, x, cy, L)` / `drawObjV(kind, cx, baseY, H, w)`** — draw a recognisable object
  (pencil, crayon, marker, ribbon, straw, stick, nail, candle, spoon, eraser, rope, lace / tree,
  tower, bottle, lamp) occupying **exactly** the given length, so every ruler reading and unit count
  stays honest. A rounded-bar fallback covers any unknown kind.
- **`rulerSVG(maxCm, bars)`** — a yellow ruler body with major cm ticks, numbers, and minor half-cm
  ticks; each object **shape** (`bar.kind`) sits above it, aligned to whole cm, with a dashed
  drop-line to its reading.
- **`barsSVG(rows, vertical, kind)`** — free-standing comparison **object shapes**, horizontal
  (left-anchored, A–D labels on the left) or vertical (bottom-anchored, labels below a baseline).
- **`nonstdSVG(obj, unit, K, kind)`** — the object **shape** above a row of K inline unit-icons
  (paper clips / beans / cubes / matchsticks, each a small SVG element).
- **`curvesSVG(rows)`** — three same-span paths labelled A–C: `straight` (flat), `scalloped`
  (sinusoidal with amplitude 12 px), `zigzag` (amplitude 18 px). End-dots mark the shared endpoints.
- **Layout:** each visual is a `display:block; width:fit-content` box (`.barwrap`/`.nonstdwrap`), so it
  sits on its **own line below the question text**, not beside it.

---

## 3. Answer kinds & determinism

`WS.addKind('letter', …)` is registered: accepts A–D case-insensitively.

Section-level `distinctBy` closures prevent repeated objects/lengths:
- `gRuler` and `gNonstd` deduplicate on the object name (from separate `distinctBy` instances).
- `gCompare` uses `balanced(['longer','shorter','taller'])` to spread question words; comparison
  bars and nouns are drawn from separate `makeNounPicker()` sets (so bar nouns never repeat).
- `gExtremes` uses `distinctInts(4, 2, 12)` for the four bar lengths (always distinct).
- `gOrder` likewise uses `distinctInts(4, 2, 12)`.
- `gCurves` shuffles the three waviness kinds randomly each question.
- `gBenchmark` deduplicates on object name from a fixed pool with known real-world classification.
- `gDraw` (print-only) spreads variants with `balanced(['exact','exact','longer','shorter','curve'])`
  and dedups on a used-key set (distinct `N` for "exact"; a distinct reference-segment letter pair
  `MN`/`XY`/… per "longer/shorter/curve" item), so no two draw prompts repeat.

---

## 4. Config (URL params, clamped 0–20 each)

`ruler` 3 · `nonstd` 3 · `compare` 3 · `extremes` 3 · `order` 2 · `curves` 2 · `benchmark` 4 · `draw` 4 (print-only)
