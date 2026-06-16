# Maths — Worksheets

A small collection of self-contained static pages that generate printable maths worksheets
for young children. No build step, no dependencies — emoji pictures are bundled locally in
`assets/twemoji/` (Twemoji, CC-BY 4.0), so everything works fully offline.

- `index.html` — table of contents linking to each worksheet.
- `subtraction.html` — the subtraction worksheet generator (details below).
- `addition.html` — the addition worksheet generator (sums within 10): number bonds,
  picture sums, "…make…" and missing-number questions, commutative pairs, word problems,
  and an interactive colour-the-matching-sums exercise. Same seed/marking/print model.
- `ordinals.html` — the ordinal numbers generator (1st–10th): colour the Nth object,
  match ordinal↔word, which letter / what position from left or right, write in words and
  numerals, and picture-position questions. Accepts "3rd", "third", or "3".
- `numbers20.html` — the numbers-to-20 generator: count & write, tens and ones, words↔numerals,
  match number↔word, number patterns (what-comes-next / missing numbers), compare
  (greater/smaller/greatest/smallest), order a set, and more/fewer comparisons.
- `numbers10.html` — the numbers-1-to-10 generator (Unit 1): count & write (number + word),
  match number↔word, colour exactly N objects, same-number groups, which-set-has-more/fewer,
  what-comes-next, and count-and-compare.
- `within20.html` — add & subtract within 20 (Unit 7): bare & picture equations for both
  operations, make-a-ten, colour-match, missing-number, and boxed word problems.
- `graphs.html` — picture graphs (Unit 8): read a picture graph (count, more/fewer, total,
  most/least) and an interactive build-a-graph (shade cells to match tray counts).
- `numbers100.html` — numbers to 100 (Unit 9): count tens & ones (base-ten blocks), words↔numerals
  to 100, match, more/less, number patterns, compare, order, and colour a hundred-grid.
- `shapes.html` — the shapes worksheet generator (rectangle, square, circle, triangle,
  half/quarter circle): name, count, group, decompose, colour-match, and object→shape, plus
  an interactive copy-the-figure-on-a-grid exercise (snap dots to draw lines, auto-marked by
  segment match). Print-only draw and partition exercises too.

To add a topic later, drop a new page at the repo root (so it shares `assets/`) and add a
card for it in `index.html`.

## Use it

Open `index.html` in a browser (or host it on GitHub Pages) and pick a topic. For subtraction,
open `subtraction.html` directly or follow the link from the contents page.

- **Generate** a worksheet from a **seed** — the same seed always produces the same sheet,
  so you can re-print or share an exact worksheet via its link.
- Children can type answers and press **Submit & Mark** for instant on-screen marking
  (accepts digits or spelled-out numbers), or just **Print** and work on paper.

## Configuration (URL parameters)

| Param  | Meaning                          | Default |
|--------|----------------------------------|---------|
| `seed` | any word/number (reproducible)   | `1`     |
| `max`  | largest number used (10–25)      | `10`    |
| `zero` | allow `0` answers (`0`/`1`)      | `0`     |
| `bare` | number of plain equations        | `5`     |
| `given`| pre-filled-equation problems     | `4`     |
| `btk`  | empty-box take-away problems     | `3`     |
| `pw`   | empty-box part-whole problems    | `3`     |

Example: `index.html?seed=janelle&max=12&given=4&pw=3`

## Question types

1. **Equations** — `M − S = ___`
2. **Given + take-away** — equation shown, picture shows both groups (kept + crossed-out)
3. **Boxes + take-away** — empty boxes, picture shows the whole group
4. **Boxes + part-whole** — empty boxes, picture shows the visible part plus a container

Pictures: [Twemoji](https://github.com/twitter/twemoji) by Twitter, licensed CC-BY 4.0.
