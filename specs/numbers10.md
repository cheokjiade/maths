# `numbers10.html` — numbers 1 to 10 worksheet generator

**File:** `numbers10.html` · **Shared patterns:** [`conventions.md`](conventions.md)

A seed-driven generator for **Numbers 1 to 10** (Unit 1), built on the shared `WS` engine: count and
write (numeral + word), match number↔word, colour exactly N objects, find same-count groups, which
set has more/fewer, what number comes next, and count-and-compare. The foundational counting unit —
a simpler cousin of `numbers20.html`, plus three types it doesn't have.

---

## 1. Page structure

- **Control panel** — collapsible `<details id="ws-panel">` (auto-collapses on phones) titled
  `🔟 Numbers 1 to 10 Worksheet — options`, seed field, seven count fields (each with a `data-tip`
  tooltip), standard button row.
- **Header** — `Numbers 1 to 10`, meta line, Name/Date row.
- **Body** — seven sections in fixed order (Count → Match → Colour-N → Same → Which → Next → Compare).
  Empty counts hide their heading.

---

## 2. Exercise types & their visuals

| Section (fn) | Asks | Child does | Visual |
|--------------|------|------------|--------|
| Count (`gCount`) | "write the number and the word" | types numeral + word | a box of N emoji (1–10) |
| Match (`gMatch`) | match each of 4 numbers to its word | taps a word chip | number, arrow, shuffled word chips |
| Colour-N (`gColourN`) | "Colour N {objects}" | taps **exactly N** chips | a row of M emoji chips |
| Same (`gSame`) | "tap the two groups with the same number" | taps 2 chips | 3–4 emoji-group chips; 2 share a count |
| Which (`gWhich`) | "Which set has more / fewer?" | taps set A or B | two labelled emoji-group chips |
| Next (`gNext`) | "what number comes next?" | types the last cell | a 4-box `→` sequence, step ±1 |
| Compare (`gCompare`) | "Set _ has fewer; _ is smaller than _; _ is greater than _" | a letter + four numbers | two labelled sets X and Y |

---

## 3. Configuration

URL params, all clamped (seed defaults to `WS.randomSeed()`):

| Param | Section | Default | Range |
|-------|---------|---------|-------|
| `seed` | RNG seed | random | any string |
| `count` | Count & write | 3 | 0–20 |
| `match` | Number↔word | 1 | 0–10 |
| `colourn` | Colour exactly N | 3 | 0–20 |
| `same` | Same-number groups | 2 | 0–20 |
| `which` | Which set more/fewer | 2 | 0–20 |
| `next` | What comes next | 3 | 0–20 |
| `compare` | Count & compare | 2 | 0–20 |

---

## 4. Complicated logic

1. **Colour-exactly-N — a custom marker.** The one new interaction. The block is a `.countn`
   (`data-need="N"`) of plain chips; the page wires its own multi-toggle (not `WS.wireChips`, which
   only handles `.sel-block`/`.match-block`). Marking is a custom **extra** passed to `WS.mark` —
   correctness is the *count* of selected chips, not specific chips:

   ```javascript
   function colourNExtra(){                         // passed as WS.mark({extras:[colourNExtra]})
     document.querySelectorAll('.countn').forEach(b=>{
       const need=+b.dataset.need, sel=b.querySelectorAll('.chip.selected');
       const ok = sel.length===need;                // any N is correct
       sel.forEach(c=>c.classList.add(ok?'correct':'incorrect'));
       if(ok) right++; total++;
     });
   }
   ```

2. **Letter answers (`gCompare`).** "Set _ has fewer" expects a letter (X/Y), graded by a registered
   kind: `WS.addKind('letter', (v,a)=>v.trim().toUpperCase()===a.trim().toUpperCase())`. The four
   number blanks use the default numeric kind.
3. **Same-number / which-set are ordinary `.sel-block`s** (graded by `WS.markChips`): `gSame` is
   `mode="many"` with the two equal-count groups flagged `data-ok="1"` (and all distractor counts
   forced distinct from the shared count); `gWhich` is `mode="one"` with `data-ok` on the larger or
   smaller set per the more/fewer prompt.
4. **Word inputs are lenient.** "five" or "5" both pass — the word input stores the word as
   `data-answer`, and `WS.parseNum` maps both to the same number.

---

## 5. Insights & gotchas

- The verifier learned `.countn`: it taps `data-need` chips so the happy path reaches full marks.
  Any future "select-a-count" interaction can reuse this block + the verifier hook.
- `gCompare`'s number blanks are filled so `small < large` always holds; the letter answer is the
  set with **fewer** (matching the workbook's phrasing).
- Heavy overlap with `numbers20.html` (match, what-comes-next) is intentional — same conventions,
  simpler range — but Colour-N, Same-number, and Which-set are unique to this unit.

---

## 6. Assets

19 Twemoji objects (apple `1f34e`, balloon `1f388`, duck `1f986`, fish `1f41f`, cookie `1f36a`,
strawberry `1f353`, bee `1f41d`, bird `1f426`, butterfly `1f98b`, star `2b50`, pencil `270f`, car
`1f697`, cake `1f370`, boat `26f5`, ball `1f3c0`, shell `1f41a`, flag `1f6a9`, cat `1f431`, rabbit
`1f430`). Sequence boxes and chips are CSS/text.
