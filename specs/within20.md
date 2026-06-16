# `within20.html` — add & subtract within 20 worksheet generator

**File:** `within20.html` · **Shared patterns:** [`conventions.md`](conventions.md)

A seed-driven generator for **Addition & Subtraction within 20** (Unit 7), built on the shared `WS`
engine. Combines both operations: bare and picture equations, the make-a-ten strategy, colour-match,
missing-number, and boxed word problems. Conceptually the `addition.html` + `subtraction.html`
patterns merged and lifted to a range of 20.

---

## 1. Page structure

- **Control panel** — collapsible `<details id="ws-panel">` titled `➕➖ Add & Subtract within 20 —
  options`, seed field, eight count fields (each `data-tip`), standard buttons.
- **Header** — `Addition & Subtraction within 20`, meta line, Name/Date row.
- **Body** — eight sections (Add → Subtract → Picture add → Picture subtract → Make-a-ten → Match →
  Missing → Word). Empty counts hide their heading.

---

## 2. Exercise types & their visuals

| Section (fn) | Asks | Visual |
|--------------|------|--------|
| Add (`gBareAdd`) | `a + b = ___` (sum ≤ 20) | none, 2-col grid |
| Subtract (`gBareSub`) | `m − s = ___` (≤ 20) | none, 2-col grid |
| Picture add (`gPicAdd`) | `a + b = ___` | two emoji groups with a `+` |
| Picture subtract (`gPicSub`) | `m − s = ___` | m emoji with the last s **crossed out** |
| Make-a-ten (`gMakeTen`) | "group ten, then add" (a+b bridges 10) | two emoji groups |
| Match (`gMatch`) | "colour the ones that make N" | chips of `+` **and** `−` expressions |
| Missing (`gMissing`) | `□ + 4 = 13`, `15 − □ = 12`, … (blank in any slot) | none |
| Word (`gWord`) | add **or** subtract story | boxed `□ ○ □ = □` (operator drawn) + picture + a "left/altogether" sentence |

---

## 3. Configuration

URL params, all clamped (seed defaults to `WS.randomSeed()`):

| Param | Section | Default | Range |
|-------|---------|---------|-------|
| `seed` | RNG seed | random | any string |
| `bareadd` | bare addition | 5 | 0–40 |
| `baresub` | bare subtraction | 5 | 0–40 |
| `picadd` | picture addition | 3 | 0–30 |
| `picsub` | picture subtraction | 3 | 0–30 |
| `maketen` | make-a-ten | 2 | 0–30 |
| `match` | colour-match | 1 | 0–10 |
| `missing` | missing number | 4 | 0–30 |
| `word` | word problems | 4 | 0–30 |

---

## 4. Complicated logic

1. **One numeric kind, blanks anywhere.** Every equation type is just `gradable` inputs with
   `data-answer`, so the shared `WS.mark()` (default `num`) grades them with no special handling —
   whether the blank is the sum (`a + b = □`), an addend (`□ + b = sum`), or a subtrahend
   (`m − □ = res`). `gMissing` simply places the input in a different slot and stores the matching
   answer.
2. **Boxed word equations draw the operator.** Unlike `subtraction.html` (which leaves the circle
   empty for the child to write `−`), this unit mixes `+` and `−`, so the operator is **drawn** in the
   circle to disambiguate; the child fills the three number boxes plus the closing-sentence blank.
3. **Picture subtraction reuses the cross-out.** `crossedGrp(cp,m,s)` draws m icons with the last s
   wearing a `.crossed::after` ✕ — the same convention as `subtraction.html`.
4. **Colour-match mixes operations.** `gMatch` builds chips whose value is a `+` or `−` expression;
   `data-ok="1"` iff the value equals the target. It forces ≥2 correct and ≥2 wrong, de-duped by the
   expression string, then shuffles. Graded all-or-nothing by `WS.markChips` (a `.match-block`).
5. **Make-a-ten** constrains `a + b` to bridge ten (`10 < a+b ≤ 20`) so the strategy is exercised.

---

## 5. Insights & gotchas

- The boxed word equation having its operator **drawn** is a deliberate divergence from the
  subtraction unit — flagged because it's the kind of thing a reviewer would expect to match.
- Answers were verified two ways: the browser verifier (self-consistency, happy 39/39) and an
  independent node logic-check across 60 seeds (1,620 items) that re-evaluates every equation, checks
  each match chip's `data-ok` against its computed value, confirms crossed-icon counts equal the
  subtrahend, and that make-a-ten actually bridges ten — 0 errors.
- Picture sums can show up to 20 icons in two groups; fine on screen/paper but a large group.

---

## 6. Assets

18 Twemoji nouns (apple `1f34e`, balloon `1f388`, duck `1f986`, fish `1f41f`, cookie `1f36a`,
strawberry `1f353`, bee `1f41d`, bird `1f426`, butterfly `1f98b`, star `2b50`, pencil `270f`, car
`1f697`, cake `1f370`, boat `26f5`, ball `1f3c0`, shell `1f41a`, flag `1f6a9`, rabbit `1f430`).
