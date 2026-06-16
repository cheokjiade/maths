# `within100.html` — add & subtract within 100 worksheet generator

**File:** `within100.html` · **Shared patterns:** [`conventions.md`](conventions.md)

A seed-driven generator for two-digit addition and subtraction, built on the shared `WS` engine.
Eight section types covering place value, column arithmetic, horizontal equations, multi-addend sums,
tens facts, and word problems — all within 100.

---

## 1. Exercise types

| Section (fn) | Asks | Child does | Marked by |
|---|---|---|---|
| Place value (`gPlace`) | tens rods + unit cubes drawn beside `T*10 + O = __` | types sum | `num` input |
| Column add (`gColAdd`) | two 2-digit numbers stacked in Tens\|Ones table | types each digit of the total | two `num` inputs (`colIn`) |
| Column subtract (`gColSub`) | two 2-digit numbers stacked in Tens\|Ones table | types each digit of the difference | two `num` inputs (`colIn`) |
| Add (`gAdd`) | horizontal `ab + cd = __` | types sum | `num` input |
| Subtract (`gSub`) | horizontal `ab − cd = __` | types difference | `num` input |
| Add three (`gThree`) | `a + b + c = __` (single digits, sum ≤ 24) | types sum | `num` input |
| Tens (`gTens`) | `X tens ± Y tens = __ tens` linked to `X0 ± Y0 = __` | types both blanks | two `num` inputs |
| Word problems (`gWord`) | join / take-away / compare / part-whole story | types the missing number in a sentence | `num` input (wide `wblank`) |

---

## 2. Visuals

- **Place-value blocks** — `tenRod()` draws a 10-cell blue SVG rod; `oneSq()` draws a tan unit square.
  `blocks(T, O)` lays T rods then O squares in a `.pic-box`. Displayed beside the equation.
- **Column table** — `colTable(top, bot, op, ans)` renders a `<table>` with a Tens header, the two
  operands in rows, a rule row, and empty `colIn` cells for the child's answer digits.
- **Horizontal / tens / three** — plain `.eq` spans; word problems are `.item` paragraphs with a
  wide `.wblank` inline input.

---

## 3. Answer kinds & determinism

All answers are plain numbers; no custom `WS.addKind` needed beyond the default `num`.

Each section uses its own `distinctBy` closure (keyed on the operand pair) to guarantee no two
questions in a section are numerically identical. Column add/subtract and horizontal add/subtract
share the same picker logic (`pickColAdd`/`pickColSub`/`pickHSub`), each with its own `distinctBy`
instance so sections don't consume from each other.

`balanced()` spreads variants across each section:
- `coladdKind` / `colsubKind` / `addKind` / `subKind` — alternates `plain` (no rename) and `rename`
  (carry / borrow) so each appears roughly equally.
- `tensKind` — alternates `add` and `sub`.
- `wordKind` — cycles `join → takeaway → compare → partwhole`.

Word-problem names and nouns are drawn from pre-shuffled pools (`shuffle(NAMES)`,
`shuffle(NOUNS)`) so they vary across questions without repeating until exhausted.

---

## 4. Config (URL params, clamped 0–20 each, word 0–30)

`place` 3 · `coladd` 3 · `colsub` 3 · `add` 4 · `sub` 4 · `three` 3 · `tens` 3 · `word` 4
