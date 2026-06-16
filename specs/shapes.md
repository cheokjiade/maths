# `shapes.html` — shapes worksheet generator

**File:** `shapes.html` · **Shared patterns:** [`conventions.md`](conventions.md)

A seed-driven generator for shapes practice — rectangle, square, circle, triangle, half circle,
quarter circle — built on the shared `WS` engine (see [`conventions.md`](conventions.md)). Nine
exercise types covering naming, counting, grouping, decomposing, colour-matching, object→shape, an
interactive **copy-the-figure-on-a-grid** exercise, and two print-only drawing tasks. The most
graphically rich generator: shapes are drawn as inline SVG, not emoji, and it adds two **custom
markers** (the order-independent compose pair and the grid) on top of the shared marking.

---

## 1. Page structure

- **Control panel** — a collapsible `<details id="ws-panel">` (auto-collapses on phones) titled
  `🔷 Shapes Worksheet — options`, seed field, nine count fields (each with a `data-tip` tooltip),
  standard button row.
- **Header** — `Shapes Practice`, meta line, Name/Date row.
- **Body** — nine sections in fixed order (Name → Match → Count → Group → Compose → Object → Grid →
  Draw → Partition). Each empty count hides its heading.
- **Footer** — "Great job! 🔺🔵⬛".

---

## 2. Exercise types & their visuals

| Section (fn) | Asks | Child does | Visual |
|--------------|------|------------|--------|
| Name (`gName`) | "This shape is a ___" | types the name | 3–5 instances of one shape in **varied prototypes** + random size/tilt — a "rectangle" is seen wide, tall and thin |
| Colour-match (`gMatch`) | "Colour every [shape]" | taps correct shape chips | 5 SVG shape chips; 2–3 correct; tap → yellow, marked green/red |
| Count (`gCount`) | "There is/are ___ [shape]" ×6 | types six counts | one picture box, a shuffled pool of mixed shapes (0–4 of each kind) |
| Group (`gGroup`) | "How are these grouped?" | taps size / colour / shape | two boxes (A & B) differing by exactly one of size, colour, or shape |
| Compose (`gCompose`) | "Name the two shapes" | types two names | a **composite silhouette** (one outline path) with the **seam drawn**, so both parts show |
| Object (`gObject`) | "What shape is the [object]?" | taps one of four names | a custom object SVG (window=square, clock=circle, door=rectangle, party hat=triangle) |
| Grid (`gGrid`) | "Copy the figure onto the grid" | taps two dots **or drags dot-to-dot (snaps)** to draw a line; taps a line to remove | left: target 6×6 dot grid with black path; right: interactive grid |
| Draw (`gDraw`) | "Draw a [shape]" | pencils it in | **print-only** blank labelled boxes (distinct shape per box) |
| Partition (`gPart`) | "Draw a line to split this figure" | pencils the dividing line | **print-only** composite **silhouette, no seam** — parts align by construction |

Shapes are drawn by a small factory. `SHAPE_VARIANTS[kind]` holds **several prototypes** per shape
(rectangle: wide/tall/thin/squat; triangle: isosceles/right/scalene; square & circle: one each — their
identity *is* the fixed proportion); `shapeBody(kind, fill, variant)` emits one prototype, and
`shapeSVG(kind, opts)` wraps it in a scaled `<svg>` with a rotation group
`<g transform="rotate(rot 50 50)">`. `looseOpts(kind)` returns a random `{size, rot, variant}` so each
free-standing shape differs. All geometry is tuned to a 100×100 viewBox centred on (50,50).

---

## 3. Configuration

URL params, all clamped:

| Param | Section | Default | Range |
|-------|---------|---------|-------|
| `seed` | RNG seed | random (`WS.randomSeed()`) | any string |
| `name` | Name the shape | 4 | 0–20 |
| `match` | Colour-match | 2 | 0–20 |
| `count` | Count | 1 | 0–10 |
| `group` | Group | 3 | 0–10 |
| `compose` | Name 2 parts | 3 | 0–20 |
| `object` | Object→shape | 3 | 0–20 |
| `grid` | Copy-grid | 2 | 0–10 |
| `draw` | Draw (print) | 2 | 0–12 |
| `part` | Partition (print) | 2 | 0–10 |

---

## 4. Complicated logic

### The copy-the-figure grid (the standout, ~lines 233–341)

The hardest part of the repo. The target figure is a path on a left-hand grid; the child rebuilds it
on a right-hand interactive grid by tapping dots. Auto-marking compares **sets of line segments**,
and segments are direction-agnostic — drawing dot1→dot2 must equal the target's dot2→dot1. A
normalised key makes that work:

```javascript
function segKey(a,b){                       // a,b are [gx,gy] grid coords
  const k1=a[0]+','+a[1], k2=b[0]+','+b[1];
  return k1<k2 ? k1+'|'+k2 : k2+'|'+k1;      // smaller endpoint first → order-independent
}
```

The grid is graded by a **custom marker** the page hands to the shared engine as an *extra*:
`WS.mark({ skip: inp => inp.closest('[data-compose]'), extras: [composeExtra, gridExtra] })`. Each
extra returns `{total, right}` and paints its own DOM; `gridExtra` is:

```javascript
function gridExtra(){                        // returns {total,right}; passed to WS.mark as an extra
  document.querySelectorAll('svg[data-grid]').forEach(svg=>{
  total++; const st=gridState[svg.id];
  const tset=new Set(st.segs.map(s=>segKey(s[0],s[1])));   // target
  const uset=new Set(st.user.map(s=>segKey(s.a,s.b)));     // drawn
  let allright = tset.size===uset.size; tset.forEach(k=>{ if(!uset.has(k)) allright=false; });
  st.user.forEach(s=>{ s.cls = tset.has(segKey(s.a,s.b))?'correct':'extra'; });  // green / red
  st.segs.forEach(s=>{ const k=segKey(s[0],s[1]); if(!uset.has(k)) st.user.push({…,cls:'missing'}); });
  redrawGrid(svg.id);
  if(allright) right++;
});
```

Interaction relies on **invisible hit-circles** (`.ghit`, 13px radius, transparent) layered over the
visible dots, and `touch-action:none` on the grid so dragging doesn't scroll the page. Two ways to
join dots: **tap–tap**, or **pointer-drag** from one dot to another — a dashed rubber-band line snaps
blue to the nearest dot and release commits (pointer events, so mouse + touch, `file://`-safe). *Tap
is also the contract the verifier reconstructs* — it reads `.ghit[data-gx][data-gy]`, finds the dots
nearest each target line endpoint, and clicks them in pairs (see [`verify.md`](verify.md)).

### Other tricky bits

- **Order-independent decompose marking (`composeExtra`).** The other custom marker. Two name inputs
  accepted in either order: `JSON.stringify([...ans].sort()) === JSON.stringify([...got].sort())`,
  with per-input partial credit as a fallback. Its inputs are excluded from the generic pass by the
  `skip: inp => inp.closest('[data-compose]')` predicate so they aren't double-counted.
- **Answer normalisation (`SYN`).** Lowercases, maps synonyms ("semicircle"→"half circle"), strips a
  trailing `s`. Registered as the `name` answer-kind via `WS.addKind('name', (v,a)=>SYN(v)===SYN(a))`
  so the non-compose name inputs grade through the shared engine. Forgiving, but would accept odd
  variants if a hyphen sneaks in.
- **Colour-match & group are all-or-nothing chip blocks** (`.sel-block`, graded by the shared
  `WS.markChips`) — one point each, correct only if every right chip is selected and no wrong one is.
- **Print vs. mark ordering.** Marks are applied as CSS classes on existing DOM, so the child must
  Submit *before* printing to get marks on paper; `.gline.missing` ghosts are hidden in print.

---

## 5. Insights & gotchas

- **Rotation is around the viewBox centre (50,50)**, so every shape's geometry must be roughly
  centred or it will appear to orbit when rotated. The hand-tuned coordinates encode this assumption.
- **Composites are one silhouette `outline` path + a `divider` seam** (`COMPOSITES`), so the two parts
  always align: `gCompose` draws outline+seam (both parts visible to name), `gPart` draws outline only
  (the child draws the seam). Objects and grid figures (`OBJECTS`, `FIGS`) are still hard-coded SVG.
- **No section repeats a question.** `gName/gMatch/gObject/gGrid/gCompose/gDraw/gPart` choose their
  shape/composite/figure through `balanced()` (a shuffled round-robin keyed by question number), so a
  section is duplicate-free while its count ≤ its pool size — enforced by the verifier's dup gate.
- The grid is the reason `shapes` appears in the verifier with a richer params string
  (`…&grid=1&draw=1&part=1`) — every section is forced on so the harness exercises all of them.
- No Twemoji assets are used; the only emoji (🔷 🎲 ✅ 🖨️ 🔺🔵⬛) are system glyphs in panel/footer.

---

## 6. Assets

**None from `assets/twemoji/`.** All shapes, composites, objects, and grid figures are inline SVG
generated or hand-authored in the file.
