# `numbers100.html` — numbers to 100 worksheet generator

**File:** `numbers100.html` · **Shared patterns:** [`conventions.md`](conventions.md)

A seed-driven generator for **Numbers to 100** (Unit 9), built on the shared `WS` engine. The
broadest number unit: place value (tens & ones with base-ten blocks), reading/writing to 100 in
numerals and words, more/less, patterns, comparing, ordering, and colouring a hundred-grid.

---

## 1. Page structure

- **Control panel** — collapsible `<details id="ws-panel">` titled `💯 Numbers to 100 Worksheet —
  options`, seed field, nine count fields (each `data-tip`), standard buttons.
- **Header** — `Numbers to 100`, meta line, Name/Date row.
- **Body** — nine sections (Count tens/ones → Words → Match → Tens & ones → More/less → Patterns →
  Compare → Order → Colour-grid). Empty counts hide their heading.

---

## 2. Exercise types & their visuals

| Section (fn) | Asks | Visual |
|--------------|------|--------|
| Count (`gCount10`) | "tens, ones, the number is __" | base-ten **rods** (SVG 1×10) + **ones** squares |
| Words (`gWords`) | write a number in words / a word in numerals | none |
| Match (`gMatch`) | match a number (21–99) to its word | number, arrow, word chips |
| Tens & ones (`gTensOnes`) | `7 tens 1 one = __` / `24 = __ tens __ ones` | none |
| More/less (`gMoreLess`) | `1/10 more/less than n is __` | none |
| Patterns (`gPattern`) | what comes next / missing numbers (step ±1/±2/±5/±10) | a 5-box `→` sequence |
| Compare (`gCompare`) | tick the greater/smaller of two numbers | two number chips |
| Order (`gOrder`) | arrange 4 numbers smallest→greatest / reverse | set tiles + input boxes |
| Colour-grid (`gColourGrid`) | "colour N of the squares" | a 10×10 grid of tappable cells |

---

## 3. Configuration

URL params, all clamped (seed defaults to `WS.randomSeed()`):

| Param | Section | Default | Range |
|-------|---------|---------|-------|
| `seed` | RNG seed | random | any string |
| `count10` | Count tens & ones | 3 | 0–20 |
| `words` | Words/numerals | 4 | 0–20 |
| `match` | Number↔word | 1 | 0–10 |
| `tensones` | Tens & ones (symbolic) | 4 | 0–20 |
| `moreless` | More/less | 4 | 0–20 |
| `patterns` | Number patterns | 3 | 0–20 |
| `compare` | Compare | 3 | 0–20 |
| `order` | Order | 2 | 0–20 |
| `colourgrid` | Colour the hundred-grid | 1 | 0–10 |

---

## 4. Complicated logic

1. **Number words to 100 + a registered kind.** `WS.parseNum` only covers 0–25, so this unit ships
   its own `numWord100(n)` and `parse100(s)` (digit, hyphen, or space), and registers a `n100` answer
   kind: `WS.addKind('n100', (v,a)=>parse100(v)===parse100(a))`. "Write in words" inputs carry
   `data-kind="n100"` with the **word** as `data-answer`; "write in numerals" inputs are plain numeric.

   ```javascript
   function numWord100(n){ if(n===100) return 'one hundred'; if(n<10) return ONES[n];
     if(n<20) return TEENS[n-10]; const t=(n/10|0), o=n%10; return TENS[t]+(o?'-'+ONES[o]:''); }
   ```

2. **Base-ten blocks.** `tenRod()` is an inline SVG of a 1×10 stick; `oneSq()` a single unit; `blocks(T,O)`
   lays T rods + O ones in a `.pic-box` so the place value is visible.
3. **Colour-grid reuses the `.countn` block.** The hundred-grid is a `.countn[data-need]` of 100
   `.chip` cells; the page wires the toggle and grades by *count of selected* via a `WS.mark` extra —
   the same pattern as `numbers10`'s colour-N, so the existing verifier hook already drives it.
4. **Compare / Match are `.sel-block`s**; everything else is numeric (default kind). Patterns/Order
   reuse the `numbers20` sequence/sorted-blank approach, lifted to 0–100.

---

## 5. Insights & gotchas

- **Words are the risk.** `numWord100` is easy to get subtly wrong ("fourty", missing hyphen). The
  browser verifier can't catch it (self-consistent), so correctness rests on the independent
  node logic-check, which re-derives every word with a *separately typed* reference generator/parser
  and compares — 0 mismatches across 80 seeds (2,560 items).
- `colourgrid` caps N at ~55 so the verifier (which taps `need` cells) stays fast; the workbook goes
  higher (e.g. "colour 87") — raise the cap if you don't mind slower verification.
- Tens-rods print fine in black-and-white (light fills + strokes); the hundred-grid prints as empty
  cells for hand-colouring.

---

## 6. Assets

**None from `assets/twemoji/`.** Base-ten rods/ones, the hundred-grid, sequence boxes, and chips are
all CSS / inline SVG.
