# `length.html` — length worksheet generator

**File:** `length.html` · **Shared patterns:** [`conventions.md`](conventions.md)

A seed-driven generator for measuring and comparing lengths, built on the shared `WS` engine.
Seven section types spanning centimetre rulers, non-standard units, bar comparisons, ordering,
curves, and real-world benchmarks — all rendered as inline SVG.

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

---

## 2. Visuals (all inline SVG, no library)

- **`rulerSVG(maxCm, bars)`** — a yellow ruler body with major cm ticks, numbers, and minor half-cm
  ticks; coloured bars sit above it with dashed drop-lines to their cm reading.
- **`barsSVG(rows, vertical)`** — free-standing comparison bars, either horizontal (left-anchored,
  labelled on the left) or vertical (bottom-anchored, labelled below a baseline).
- **`nonstdSVG(obj, unit, K)`** — a coloured bar representing the object above a row of K inline
  unit-icons (paper clips / beans / cubes / matchsticks, each drawn as a small SVG element).
- **`curvesSVG(rows)`** — three same-span paths labelled A–C: `straight` (flat), `scalloped`
  (sinusoidal with amplitude 12 px), `zigzag` (amplitude 18 px). End-dots mark the shared endpoints.

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

---

## 4. Config (URL params, clamped 0–20 each)

`ruler` 3 · `nonstd` 3 · `compare` 3 · `extremes` 3 · `order` 2 · `curves` 2 · `benchmark` 4
