# `money.html` — money worksheet generator (Singapore $ & ¢)

**File:** `money.html` · **Shared patterns:** [`conventions.md`](conventions.md)

A seed-driven generator for Singapore money — coins **5¢/10¢/20¢/50¢/$1** and notes
**$2/$5/$10/$50**. Currency is **our own SVG artwork** (recognisable colours/denominations, a portrait
silhouette and guilloché), clearly stylised so it can't be mistaken for genuine — never photographic scans.

## Why our own SVG (the legal basis)

Reviewed the live MAS "Using Images of Singapore Currency" page (via `playwright-core` — see
[`verify.md`](verify.md) for the technique): **educational reproduction is explicitly permission-free**
provided the Conditions are met — chiefly **not mistakable as genuine**. A clearly stylised SVG
illustration plainly isn't, so the **SPECIMEN** mark (required only for realistic whole-note
reproductions) and the ≥150%/≤60% size rule aren't engaged — we omit SPECIMEN for a cleaner look. The
note *designs* are separately Government-of-Singapore **copyright**, so drawing our own SVG (rather
than copying a scan) also avoids any third-party-rights question, while staying offline and on-style.
See the `money-unit-sg-currency-legal` memory.

## Exercise types

| Section (fn) | Asks | Marked by |
|--------------|------|-----------|
| Count (`gCount`) | count a set of coins (→ ¢) or notes (→ $) | `num` input |
| Exchange (`gExchange`) | "N b1-notes = __ b2-notes" | `num` input |
| Compare (`gCompare`) | tap the set with **more** money | `.sel-block` chips |
| Word (`gWord`) | cost-each / two-items / how-much-more / change | `num` input |

All marking is standard (`gradable` numbers + chips), so the verifier needs **no driver extension**.

## Currency SVG

`noteSVG(dollars)` and `coinSVG(cents)` build the art; `renderSet(centsList)` lays out a row (values
≥ 200¢ render as notes, else coins). Everything is tracked in **cents** internally (`$2` = 200¢,
`$1` coin = 100¢) so totals and comparisons are integer math.

## Determinism / no duplicates

Each section keeps distinct content: `gCount` dedups on total, `gExchange`/`gWord` via a
`distinctBy`/used-key set, `gCompare` dedups on the (sorted) pair of set totals, and word-problem
type + item spread via `balanced()`. Enforced by the verifier's duplicate gate.

## Config (URL params, clamped)

`count` 4 · `exchange` 3 · `compare` 3 · `word` 4 — each `0–20`.
