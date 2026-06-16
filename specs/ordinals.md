# `ordinals.html` — ordinal numbers worksheet generator (1st–10th)

**File:** `ordinals.html` · **Shared patterns:** [`conventions.md`](conventions.md)

A self-contained, seed-driven generator for ordinal-number practice from **1st to 10th**: colour the
Nth object, match ordinals to words, find letters by position, positions from left/right, and convert
between words and numerals. Same seed / marking / print model as the rest of the repo.

> **Status:** this file is currently **untracked in git** (new, not yet committed). Its spec is
> included here for completeness; commit the page and this spec together.

---

## 1. Page structure

- **Control panel** (`.no-print`) — `🥇 Ordinal Numbers Worksheet Generator (1st–10th)`, seed field,
  six count fields, standard button row.
- **Header** — `Ordinal Numbers`, meta line, Name/Date row.
- **Body** — six sections in fixed order (Colour → Match → Which → Position → Words → Picture). Empty
  counts hide their headings.

---

## 2. Exercise types & their visuals

| Section (fn) | Asks | Child does | Visual |
|--------------|------|------------|--------|
| Colour (`gColour`) | "Colour the [Nth] [object] from the [left/right]" | taps the right object | a row of 6–8 identical emoji in bordered tiles; direction stated in text |
| Match (`gMatch`) | match each of 4–5 ordinals (e.g. `2nd →`) to its word | taps a word chip | text only — ordinal symbol, arrow, shuffled word chips |
| Which (`gWhich`) | "Which letter is [Nth] from the [left/right]?" | types a letter A–J | a row of 6–9 letter tiles |
| Position (`gPosition`) | "In which position … is letter [X]?" | types an ordinal | same letter-tile row |
| Words (`gWords`) | "Write [Nth] in words" **or** "Write '[word]' in numerals" (50/50) | types word or numeral | text only |
| Picture (`gPicture`) | "The [obj] is [blank] from the [left/right]" or the name-blank variant | types name or ordinal | a row of 5–7 **different** labelled emoji |

`gPicture` uses unique objects per exercise via the shared draw-without-replacement `usedObj` set.

---

## 3. Configuration

URL params, all clamped:

| Param | Section | Default | Range |
|-------|---------|---------|-------|
| `seed` | RNG seed | `'1'` | any string |
| `colour` | Colour the object | 3 | 0–20 |
| `match` | Match ordinals | 1 | 0–10 |
| `which` | Which letter | 3 | 0–20 |
| `position` | Position from L/R | 3 | 0–20 |
| `words` | Words/numerals | 4 | 0–20 |
| `picture` | Picture | 2 | 0–10 |

---

## 4. Complicated logic

1. **Ordinal suffix by modular arithmetic (`ordSym`).** Handles the English irregulars (1st/2nd/3rd
   but 11th/12th/13th, 21st…) without an if-chain:

   ```javascript
   function ordSym(n){ const s=['th','st','nd','rd'], v=n%100; return n+(s[(v-20)%10]||s[v]||s[0]); }
   ```

   Compact but opaque — `(v-20)%10` folds 21–30 back to 1–10 and the teens fall through to `'th'`.
   Within 1–10 it's overkill, but it's correct if the range ever grows.

2. **Left/right indexing (`idxFrom`).** Converts an ordinal + side into a 0-based array index, used by
   every positional exercise to know which tile/object is correct:

   ```javascript
   function idxFrom(L,n,side){ return side==='left' ? n-1 : L-n; }
   ```

3. **Flexible answer parsing (`normOrd`, `normName`).** `normOrd` accepts "third", "3rd", or "3"
   (word lookup first, then a `^(\d+)(st|nd|rd|th)?$` regex); `normName` singularises object names by
   stripping a trailing `s` (guarded so it never empties the string). Both lowercase/trim first.

   ```javascript
   function normOrd(s){ s=(s||'').toLowerCase().trim().replace(/\s+/g,' ');
     const wi=OWORD.indexOf(s); if(wi>0) return wi;
     const m=s.match(/^(\d+)(st|nd|rd|th)?$/); return m?+m[1]:NaN; }
   ```

4. **Selection blocks (`selBlock`, mode `'one'`).** Match chips behave like radio buttons — tapping
   one clears its siblings — and marking is the shared all-or-nothing chip contract (`.correct` /
   `.incorrect` / `.missed`), one point per block.

---

## 5. Insights & gotchas

- `ordSym`'s cleverness earns a mention in code review: prefer a comment or lookup table if the
  ordinal range stays 1–10, where the modular trick buys nothing.
- The Picture section enforces **unique objects** per sheet; with >19 picture exercises the pool
  exhausts and objects repeat (fallback to the full list).
- Print keeps the worksheet monochrome: chip colours drop, `.missed`'s dashed border becomes solid,
  `.correction` hints hide.

---

## 6. Assets

19 Twemoji objects: apple `1f34e`, balloon `1f388`, duck `1f986`, fish `1f41f`, cookie `1f36a`,
strawberry `1f353`, bee `1f41d`, bird `1f426`, butterfly `1f98b`, star `2b50`, pencil `270f`, car
`1f697`, cake `1f370`, boat `26f5`, ball `1f3c0`, shell `1f41a`, flag `1f6a9`, cat `1f431`, rabbit
`1f430`. Letter and word exercises use no assets.
