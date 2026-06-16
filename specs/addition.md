# `addition.html` — addition worksheet generator (sums within 10)

**File:** `addition.html` · **Shared patterns:** [`conventions.md`](conventions.md)

A self-contained, seed-driven generator for addition practice with **sums within 10**. It is the
broadest of the generators — ten question types ranging from bare equations to number bonds, picture
sums, word problems, commutative pairs, and an interactive colour-the-matching-sums exercise. Same
seed / marking / print model as the rest of the repo.

---

## 1. Page structure

- **Control panel** (`.no-print`) — `➕ Addition Worksheet Generator (sums within 10)`, a seed field,
  an **Allow +0** checkbox, and eleven count fields (one per type). Buttons: Generate · 🎲 Random
  seed · ✅ Submit & Mark · Clear answers · 🖨️ Print.
- **Worksheet header** — title `Addition Practice`, a meta line (`seed: … • sums within 10 • …`), and
  a Name/Date row.
- **Worksheet body** — sections rendered in a **fixed order** (Count → Subset → Bond → Pic → Bare →
  Make → Commute → Missing → Word → Match). A zero count hides that section's heading.
- **Footer** — "Great job!" + Twemoji attribution.

---

## 2. Question types & their pictures

| # | Type (fn) | Asks | Child fills | Picture |
|---|-----------|------|-------------|---------|
| 1 | Bare (`qBare`) | `a + b = ___` | the sum | none, 2-col grid |
| 2 | Make (`qMake`) | "3 and 5 make ___" | the sum | none, 2-col grid |
| 3 | Bond (`qBond`) | number-bond diagram, parts given | the whole | **SVG**: two lines joining a top "whole" node to two part nodes |
| 4 | Picture eq (`qPic`) | `a + b = ___` | the sum | two emoji groups (30px icons) with a `+` between, right-aligned |
| 5 | Subset (`qSubset`) | "___ black, ___ white, ___ altogether" | three counts | a row of one shape kind in **two fills**: `a` solid (#000) + `b` outline (#fff) |
| 6 | Word (`qWord`) | story + equation (4 variants) | sum, or all three addends | two emoji groups like `qPic` |
| 7 | Commute (`qCommute`) | "Write two addition equations" (a+b and b+a) | all six blanks | two groups of plain CSS dots |
| 8 | Missing (`qMissing`) | `___ + ___ = [sum]` | both addends | two emoji groups; sum given as text |
| 9 | Count (`qCount`) | "There are ___ altogether" | one count | one emoji group, **left-aligned** (the exception) |
| 10 | Match (`qMatch`) | "Colour the sums that make N" | tap chips | none — text chips, **interactive only** |

**Word-problem variants** (`qWord`): `given` and `addmore` show `a + b = ___`; `boxed` uses boxed
numbers; `allblank` blanks all three (`___ + ___ = ___`). Pictures are two groups of the same noun.

**Shapes for subsets** are inline SVG with hard-coded paths (star/triangle/square/heart) plus a
`<circle>` special case; the same factory draws filled vs. outline by swapping the `fill` attribute.

---

## 3. Configuration

URL params, all clamped (see [`conventions.md`](conventions.md) §3):

| Param | Meaning | Default | Range |
|-------|---------|---------|-------|
| `seed` | RNG seed | `'1'` | any string |
| `zero` | allow `+0` | `1` (on) | `0`/`1` |
| `bare` | bare equations | 6 | 0–40 |
| `make` | "make" sentences | 4 | 0–40 |
| `bond` | number bonds | 3 | 0–30 |
| `pic` | picture equations | 4 | 0–30 |
| `subset` | subset/shape | 3 | 0–30 |
| `word` | word problems | 5 | 0–30 |
| `commute` | commutative pairs | 2 | 0–20 |
| `missing` | missing addends | 2 | 0–20 |
| `count` | pure count | 2 | 0–20 |
| `match` | colour-match | 1 | 0–10 |

---

## 4. Complicated logic

1. **The colour-match generator (`qMatch`, ~lines 314–334).** Must produce exactly 5 chips with **≥2
   correct and ≥2 incorrect**, no duplicates. A greedy loop (≤40 tries) tracks how many of each it
   still needs and biases `wantCorrect` accordingly, generating addend pairs with `pairFor(s)` and
   de-duping by `a+'+'+b` key. *Tricky because* it can in principle exhaust its tries and render
   fewer than 5 chips — a silent quality bug, not a crash. Options are then Fisher–Yates shuffled.

   ```javascript
   const wantCorrect = opts.filter(o=>o.val===target).length<2 ? true
     : (opts.filter(o=>o.val!==target).length<2 ? false : rng()<0.5);
   let s = wantCorrect ? target : randInt(2,MAXSUM);
   if(!wantCorrect && s===target) continue;
   const p=pairFor(s); const key=p.a+'+'+p.b;
   if(seen.has(key)) continue; seen.add(key);
   opts.push({a:p.a,b:p.b,val:p.a+p.b});
   ```

2. **Marking two element families in one pass (`mark`, ~lines 366–392).** Text inputs are graded by
   `parseAnswer` (digits or number words) against `data-answer`; `.match-block`s are graded
   all-or-nothing across their chips. Each match block counts as **one** point even though it has
   five buttons — see the shared marking contract.

3. **Subset dual-state shapes (`shapeSVG`, ~lines 216–223).** One shape kind is drawn twice in the
   same row — `a` filled, `b` outline — by toggling `fill` between `#000` and `#fff`. The circle uses
   a `<circle>` element while the rest use `<path>` strings, so the factory branches.

4. **Number-bond SVG (`qBond`).** A fixed 170×120 diagram: two SVG lines from a top node to two
   bottom nodes, with the parts as static text and the whole as the single gradable input — absolute
   positioning has to line the boxes up with the line endpoints.

5. **Grammar in word problems.** Nouns store `one`/`many`; the template picks singular only when
   `b===1` (e.g. "Add 1 more fish" vs "Add 5 more fish"). Simpler than subtraction's verb agreement
   because addition stories don't conjugate a removal verb.

---

## 5. Key snippets

Number bond (representative generator):

```javascript
function qBond(i){
  const {a,b,sum}=pickAB();
  const bond='<div class="bond"><svg viewBox="0 0 170 120">'
    +'<line x1="85" y1="48" x2="41" y2="74" stroke="#000" stroke-width="2"/>'
    +'<line x1="85" y1="48" x2="129" y2="74" stroke="#000" stroke-width="2"/></svg>'
    +'<div class="node whole"><input class="bondin gradable" data-answer="'+sum+'" …></div>'
    +'<div class="node pL">'+a+'</div><div class="node pR">'+b+'</div></div>';
  return '<div class="item">…'+a+' + '+b+' ='+bond+'</div>';
}
```

Match block marking (all-or-nothing across chips):

```javascript
document.querySelectorAll('.match-block').forEach(b=>{
  total++; let ok=true;
  b.querySelectorAll('.chip').forEach(c=>{
    const should=c.dataset.ok==='1', sel=c.classList.contains('selected');
    if(sel && should) c.classList.add('correct');
    else if(sel && !should){ c.classList.add('incorrect'); ok=false; }
    else if(!sel && should){ c.classList.add('missed'); ok=false; }
  });
  if(ok) right++;
});
```

---

## 6. Insights & gotchas

- **`qCount` breaks the right-align convention** — its single emoji group is left-aligned while every
  other picture group is right-aligned. Intentional, but easy to "fix" by mistake.
- **Commute forces distinct addends** (`pickABdistinct`, `a !== b`) so swapping visibly changes the
  equation; other types allow `3+3`.
- **The match loop's 40-try cap is a soft failure mode** — for the live range (2–10) it always
  succeeds, but a future range change could silently yield short chip rows. Worth a `log`/assert if
  the ranges widen.
- Worksheet HTML is built by **string concatenation** and injected via `innerHTML`; answers live in
  `data-answer`. Same trade-offs as the other generators.

---

## 7. Assets

~22 Twemoji nouns (apple `1f34e`, balloon `1f388`, duck `1f986`, fish `1f41f`, cookie `1f36a`,
strawberry `1f353`, bee `1f41d`, bird `1f426`, butterfly `1f98b`, star `2b50`, pencil `270f`, car
`1f697`, cupcake `1f9c1`, cake `1f370`, sailing boat `26f5`, ball `1f3c0`, lorry `1f69a`, beetle
`1f41e`, shell `1f41a`, flag `1f6a9`, cat `1f431`, rabbit `1f430`). Subset shapes are inline SVG, not
assets. CSS palette: `--ink #000`, `--right #137a13`, `--wrong #c0142c`, `--accent #2563eb`.
