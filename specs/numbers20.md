# `numbers20.html` — numbers to 20 worksheet generator

**File:** `numbers20.html` · **Shared patterns:** [`conventions.md`](conventions.md)

A seed-driven generator for **Numbers to 20** (Unit 6), built on the shared `WS` engine (see
[`conventions.md`](conventions.md)): counting and writing numbers, tens and ones, converting between
words and numerals, number patterns, comparing, ordering, and more/fewer comparisons. Same seed /
marking / print model as the rest of the repo.

---

## 1. Page structure

- **Control panel** — a collapsible `<details id="ws-panel">` (auto-collapses on phones) titled
  `🔢 Numbers to 20 Worksheet — options`, seed field, eight count fields (each with a `data-tip`
  tooltip), standard button row.
- **Header** — `Numbers to 20`, meta line, Name/Date row.
- **Body** — eight sections in fixed order (Count → Tens & ones → Words → Match → Patterns → Compare →
  Order → More/fewer). Empty counts hide their headings.

---

## 2. Exercise types & their visuals

| Section (fn) | Asks | Child does | Visual |
|--------------|------|------------|--------|
| Count (`gCount`) | "Count and write the number" | types the count (11–20) | a bordered box of N identical emoji |
| Tens & ones (`gTens`) | "10 and [k] make ___" **or** "10 + [k] = ___" (50/50) | types 10+k | a dashed ten-block of 10 emoji + a small box of k emoji |
| Words (`gWords`) | "Write [n] in words" **or** "Write '[word]' in numerals" (50/50) | types word or numeral | text only |
| Match (`gMatch`) | match each of 4 numbers (e.g. `17 →`) to its word | taps a word chip | number, arrow, shuffled word chips |
| Patterns (`gPattern`) | "What number comes next?" / "Fill in the missing numbers" | types the missing cell(s) | a 5-box `→`-linked sequence with 1–2 input boxes |
| Compare (`gCompare`) | "Tick the greater/smaller number" (2) or "Colour the greatest/smallest" (5) | taps a number chip | 2 or 5 number chips |
| Order (`gOrder`) | "Arrange … smallest→greatest / greatest→smallest" | types the 4 numbers in order | the given set as static tiles + 4 input boxes |
| More/fewer (`gMF`) | "There are ___ more/fewer X than Y" | types the difference | two bordered boxes of emoji (the larger and smaller groups) |

Counting/tens/more-fewer draw objects via the shared draw-without-replacement `usedObj` set.

---

## 3. Configuration

URL params, all clamped:

| Param | Section | Default | Range |
|-------|---------|---------|-------|
| `seed` | RNG seed | random (`WS.randomSeed()`) | any string |
| `count` | Count & write | 3 | 0–20 |
| `tens` | Tens and ones | 3 | 0–20 |
| `words` | Words/numerals | 4 | 0–20 |
| `match` | Number↔word match | 1 | 0–10 |
| `pattern` | Number patterns | 3 | 0–20 |
| `compare` | Compare numbers | 3 | 0–20 |
| `order` | Order a set | 2 | 0–20 |
| `mf` | More/fewer | 3 | 0–20 |

---

## 4. Complicated logic

1. **Pattern generation (`gPattern`).** Picks a step `s ∈ {1,1,2,-1,-2}` (1 weighted double) and a start
   chosen so all five cells stay in `0..20`, then blanks 1–2 cells. The heading switches on *where* the
   blanks fall — all at the tail → "What number comes next?", otherwise "Fill in the missing numbers."

   ```javascript
   if (s>0) start = randInt(0, 20 - s*(len-1)); else start = randInt(-s*(len-1), 20);
   const vals = []; for (let k=0;k<len;k++) vals.push(start + s*k);
   ```

2. **Comparison target (`gCompare`).** A distinct set of `K ∈ {2,2,5}` numbers; the correct chip is
   `Math.max(...)` for greater/greatest or `Math.min(...)` for smaller/smallest. `K===2` reads "Tick
   the greater/smaller", `K===5` reads "Colour the greatest/smallest".

3. **Ordering (`gOrder`).** Sorts the set ascending or descending; each ordered position becomes an
   input whose `data-answer` is the sorted value, so the verifier/child must reproduce the full order.

4. **More/fewer wording (`gMF`).** Computes `big = max`, `small = min` and assigns `big` emoji to object
   A, `small` to object B. The sentence then always reads naturally — "more A than B" or "fewer B than
   A" — and the answer is `big - small`. (Wording is correct by construction; never "more" of the
   smaller group.)

5. **Flexible answer parsing (shared `WS.parseNum`).** Every input uses the engine's default numeric
   kind — no `data-kind`, no page-local parser. `WS.parseNum` accepts a digit string or a number-word
   (`WS.NUMWORD`, 0–25). "Write in words" stores the *word* as `data-answer`; both sides run through
   `WS.parseNum`, so typing `17` or `seventeen` both match — lenient by design. The page reuses
   `WS.NUMWORD` for generation too (`gWords`, `gMatch`), and marking is just `WS.mark()`.

   ```javascript
   // assets/worksheet.js
   function parseNum(s){ s=(s||'').toLowerCase().trim(); if(s==='')return NaN;
     if(/^\d+$/.test(s))return Number(s); return (s in WMAP)?WMAP[s]:NaN; }
   ```

---

## 5. Insights & gotchas

- Every answer is numeric (`input.gradable` + `parseNum`) or a select block — no bespoke text marking —
  so the generic verifier drives it with no special-casing.
- The verifier only proves *self-consistency* (typing `data-answer` scores full marks). Because several
  answers are **computed** (pattern step, min/max, sort, difference), correctness is additionally
  guaranteed by an independent node logic-check across many seeds (1,250 items, 0 errors at last run).
- `gPattern`'s blank picker can blank the first cell; the constant step still makes it solvable, but
  it's the one place a child gets no left-hand anchor.
- Print drops chip colours and `.correction` hints; sequence/order boxes stay as empty squares.

---

## 6. Assets

20 Twemoji objects: apple `1f34e`, balloon `1f388`, duck `1f986`, fish `1f41f`, cookie `1f36a`,
strawberry `1f353`, bee `1f41d`, bird `1f426`, butterfly `1f98b`, star `2b50`, pencil `270f`, car
`1f697`, cake `1f370`, boat `26f5`, ball `1f3c0`, shell `1f41a`, flag `1f6a9`, cat `1f431`, rabbit
`1f430`, beetle `1f41e`. The ten-block, sequence boxes, and number chips are CSS/text — no extra assets.
