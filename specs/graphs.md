# `graphs.html` — picture graphs worksheet generator

**File:** `graphs.html` · **Shared patterns:** [`conventions.md`](conventions.md)

A seed-driven generator for **Picture Graphs** (Unit 8), built on the shared `WS` engine. Two
exercises: **read** a picture graph and answer questions, and **build** a graph by shading cells.
The only generator with no equations — it introduces a graph renderer and a shade-the-cells
interaction.

---

## 1. Page structure

- **Control panel** — collapsible `<details id="ws-panel">` titled `📊 Picture Graphs Worksheet —
  options`, seed field, three count fields (`readobj`, `readsym`, `build`), standard buttons.
- **Header** — `Picture Graphs`, meta line, Name/Date row.
- **Body** — three sections (Read object → Read symbol → Build). Empty counts hide their heading.

---

## 2. Exercise types & their visuals

| Section (fn) | Asks | Child does | Visual |
|--------------|------|------------|--------|
| Read object graph (`gReadObject`) | 6 sub-questions per graph | types 4 numbers, taps 2 category words | a bordered graph of 3–4 categories, each with its own emoji — **no key line** |
| Read symbol graph (`gReadSymbol`) | 6 sub-questions per graph | types 4 numbers, taps 2 category words | a bordered graph of 3–4 categories using one generic shape (▲ / ★ / ■) — includes key |
| Build (`gBuild`) | "count each tray, shade the graph to match" | taps cells to shade each column | 3–4 columns of empty cells, each captioned with a tray of objects |

**Graph styles** (from a `THEMES` table, split into two pools, in **horizontal or vertical** orientation):
- **Object graph** (`gReadObject`) — each category *is* its own object, drawn with its own emoji
  (animals, toys, snacks). Phrasing is "There are N {category}"; **no key line** (rows use different
  icons). Themes picked via `balanced(objThemes)`.
- **Symbol graph** (`gReadSymbol`) — one drawn shape (▲ / ★ / ■) stands for 1 item; categories
  are **names/labels**. Two phrasings: *count* (fruit names → "There are N mangoes") and *owner*
  (children's names → "John has N stickers"). Adds a key: **"Each ▲ stands for 1 fruit."**
  Themes picked via `balanced(symThemes)`.

Both sections share the same render function `renderRead(i, th)`, which receives a theme picked by
the caller. Object graphs appear first; symbol graphs are ordered last. Within each section,
`balanced()` spreads across the available themes so all theme variants appear before any repeats —
the same "balance variants" pattern as `within20`'s add/subtract word problems.

**Read sub-questions** (all derived from the category counts): *count of category 1*, *more A than B*,
*fewer B than A*, *total altogether* (numeric); *the most* and *the fewest* (tap a category word).
Counts are `WS.helpers.distinct(k, 2, 8)` so they're all different — the max and min are unique (no
ambiguous "most"), and every pairwise difference is non-zero.

---

## 3. Configuration

URL params, all clamped (seed defaults to `WS.randomSeed()`):

| Param | Section | Default | Range |
|-------|---------|---------|-------|
| `seed` | RNG seed | random | any string |
| `readobj` | Read-the-picture-graph blocks | 2 | 0–10 |
| `readsym` | Read-the-symbol-graph blocks | 2 | 0–10 |
| `build` | Build-the-graph blocks | 1 | 0–10 |

---

## 4. Complicated logic

1. **The graph renderer.** `renderGraphH` makes `.grow` rows (a `.glabel` + a `.gicons` strip);
   `renderGraphV` makes `.vcol` columns (a bottom-up `.vstack` of `.vcell` + a `.vlabel`). Both take a
   `cellFn(cat)` — `img(cat.cp)` for object graphs, `symbolSVG(theme.symbol)` for symbol graphs.
   Pictures *are* the data, so no separate answer store is needed.
2. **Most / fewest are `.sel-block`s** of category-word chips (`data-ok` on the max/min category),
   graded all-or-nothing by `WS.markChips`.
3. **Build-the-graph — a custom marker.** Columns are `.bg-col[data-need]`; cells are `.cell` buttons
   wired by the page to toggle `.filled` (independent, not bottom-up). Correctness is the *count* of
   filled cells per column, graded by an **extra** passed to `WS.mark`, one point per column:

   ```javascript
   function buildExtra(){                            // WS.mark({extras:[buildExtra]})
     document.querySelectorAll('.bg-col').forEach(col=>{
       const need=+col.dataset.need;
       const filled=[...col.querySelectorAll('.cell')].filter(c=>c.classList.contains('filled'));
       const ok = filled.length===need;
       filled.forEach(c=>c.classList.add(ok?'correct':'incorrect'));
       if(ok) right++; total++;
     });
   }
   ```
   `WS.clearAll(buildClear)` un-shades the cells on Clear; the verifier shades `data-need` cells per
   column (same hook pattern as `.countn`).

---

## 5. Insights & gotchas

- **Self-consistency ≠ correctness (twice).** (1) An early bug referenced `.many` on the category
  *wrapper*, rendering "4 more **undefined** than undefined"; both the browser verifier and a naive
  logic-check passed — only the screenshot caught it. (2) Vertical **object** graphs rendered with
  *blank* columns: `img()` emits a class-less `<img>` sized only by `.gicons img` (horizontal); the
  data logic-check counted `.vcell` elements (which existed) and passed, and symbol graphs were fine
  (their `<svg>` carries width/height) — again only the screenshot (seed `otter`) revealed it. Fix:
  `.gicons img, .vcell img { width:26px; height:26px }`. Lesson, reinforced: **eyeball multiple
  seeds/orientations**, and assert the logic-check against an independent source, not the artifact.
- `.gicons` wraps, so a tall category (8 icons) may span two lines — acceptable, but the bar length is
  then less visually obvious.
- Build cells shade light-blue on screen; on paper the child shades by hand (cells print as boxes).

---

## 6. Assets

18 Twemoji nouns used as graph/tray icons (rabbit `1f430`, cat `1f431`, fish `1f41f`, bird `1f426`,
duck `1f986`, bee `1f41d`, butterfly `1f98b`, apple `1f34e`, strawberry `1f353`, cookie `1f36a`, cake
`1f370`, boat `26f5`, car `1f697`, ball `1f3c0`, star `2b50`, flag `1f6a9`, shell `1f41a`, balloon
`1f388`). The graph frame and cells are CSS.
