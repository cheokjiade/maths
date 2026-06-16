# Specification — Subtraction Worksheet Generator

**File:** `subtraction.html` · **Shared patterns:** [`conventions.md`](conventions.md)

This document specifies a small web app that generates printable, self-marking
subtraction worksheets for young children (around Primary 1 / first grade). It is written
so a developer (or coding agent) can build the app from scratch. Sections 1–13 intentionally
contain **no code** — only requirements, behaviour, and reference data. The
[Implementation notes](#14-implementation-notes-as-built) appendix added at the end maps those
requirements onto the actual `subtraction.html` code, with snippets and gotchas.

---

## 1. Goal

Produce a single, self-contained web page that:

- Generates a subtraction worksheet from a **seed**, so the same seed and settings always
  produce the exact same worksheet (reproducible, shareable, re-printable).
- Mixes plain arithmetic equations with picture-based word problems modelled on a typical
  Primary-1 "Unit 3: Subtraction" workbook page.
- Lets a child either **do it on screen and be marked instantly**, or **print it** and do it
  on paper.
- Runs as a static site (suitable for GitHub Pages) with everything bundled locally.

---

## 2. Owner's instructions (the source requirements)

These are the requirements as given by the project owner, consolidated:

1. Generate subtraction problems similar to a Primary-1 workbook page, in HTML, suitable for
   printing. Originally no answer key was required.
2. Each word problem should include a **helper picture** showing the objects. For problems
   where the equation is given, show **both** groups of objects; for problems with empty
   answer boxes, show **only one** group of objects.
3. In the boxed-equation layout, the subtraction operator and equals signs are drawn, but the
   number boxes are blank for the child to fill. Do **not** pre-fill the minus sign's operands.
4. Use **open-source images**. Some concepts (e.g. "fish in a tank", "ducks in a pond") have no
   single emoji — compose those scenes from a drawn container plus object icons.
5. The worksheet must be generated from a **seed**.
6. The number range must be **configurable between 10 and 25**, with a sensible default.
7. Whether a `0` answer is allowed must be **configurable**, defaulting to **not allowed**.
8. Output must be a **self-contained HTML file that can run on GitHub Pages**.
9. The number of questions in each section must be **parameterised, with defaults**.
10. A child should be able to **attempt the questions on the page and press Submit to have the
    page mark them**, or press **Print**.
11. Bundle the emoji images **locally**, in their own assets folder (no external CDN at runtime).

A representative default layout the owner settled on: **5 equations**, **4 pre-filled-equation
word problems**, and **6 empty-box word problems** (the 6 split into take-away and
part-whole styles).

---

## 3. Visual reference (the source page)

There is no source image included with this spec; this section describes it in words so the
visual conventions can be reproduced. The model is one page of a Primary-1 subtraction workbook:
black line-art, a single column, large rounded print, and generous spacing. It contains a plain
equation and two picture word problems. Reproduce these conventions:

- **Header** naming the unit ("Unit 3: Subtraction") at the top.
- **Plain equation example:** a sentence pair such as *"There are 9 cookies in a jar. / 4 of the
  cookies are taken out."*, followed by a horizontal equation **"9 − 4 = ___"** where the result
  sits on a short underline blank. A simple line drawing of the objects and their container (a
  cookie jar with cookies) sits to the right. Then a closing sentence with an inline blank:
  *"There are ___ cookies left."*
- **Boxed-equation example (the distinctive layout):** a problem such as *"There are 7 presents
  altogether. / How many presents are there in the box?"* is answered with a **boxed equation**,
  read left to right as: the first number inside its own **square box**, the **minus sign inside a
  circle**, the second number inside a **square box**, a plain **"="**, then an **empty square box**
  for the answer. To the right are line drawings of the visible objects (several wrapped presents)
  next to the container that hides the rest (a large box). A closing sentence with an inline blank
  follows: *"There are ___ presents in the box."*
- **A second boxed example** uses a different container that hides objects — e.g. *"There are 9
  pies altogether. / How many pies are under the cover?"* with a domed serving cover (cloche) as
  the container, the visible pies drawn beside it, and the same boxed-equation layout.
- **Footer** with a page number.

The three load-bearing visual conventions a build must reproduce:
1. **Plain equations** are `M − S = ___` with the answer on an underline blank.
2. **Boxed equations** put each number in its own square, the equals plain, and the **answer box
   empty** — drawn shapes, not plain text inputs, never with the operands pre-filled. The source
   draws the minus inside a circle; **this build instead leaves that circle empty so the child
   writes the minus sign themselves** (see §5.3).
3. **Pictures** are simple black-and-white object drawings beside each problem, including the
   container (jar, box, cover, tank, pond) for the "how many are hidden / left" problems.

---

## 4. Page structure

The page has two areas:

1. **Control panel** — visible on screen, hidden when printing. Lets the user set the seed and
   all configuration, regenerate, mark, clear, and print.
2. **Worksheet** — a title, a name/date line, then two numbered sections:
   - **Section 1 — "Solve the equations."** A two-column list of plain equations.
   - **Section 2 — "Solve the word problems."** A vertical list of picture word problems.

Each problem is numbered. A small caption should display the active seed and number range so a
printed sheet is identifiable. There is no separate answer key; correctness is known to the app
and surfaced only through on-screen marking.

---

## 5. Question types

### 5.1 Plain equation (Section 1)
A horizontal expression of the form "minuend − subtrahend = blank", where the child fills the
single blank (an underline) with the result.

### 5.2 Word problems (Section 2)
There are three archetypes. All three are built from the same underlying idea but differ along
three independent dimensions: whether the equation is pre-filled or blank, whether the picture
shows one or both groups, and whether the story is "take-away" or "part-whole".

| Archetype | Equation shown | Picture | Story meaning |
|-----------|----------------|---------|---------------|
| **A. Given + take-away** | A pre-filled equation "M − S = blank" is displayed (only the result is blank) | **Both** groups: the kept objects drawn normally, plus the removed objects with a cross-out mark over each | Start with M, remove S, find what's left |
| **B. Boxes + take-away** | The boxed-equation layout (§5.3) with all three number boxes empty | **One** group: all M starting objects | Start with M, remove S, find what's left |
| **C. Boxes + part-whole** | The boxed-equation layout (§5.3) with all three number boxes empty | **One** group: the visible objects, plus a container icon holding the hidden ones | M altogether, V visible, find how many are hidden (M − V) |

Notes:
- In archetype A the displayed equation must actually be shown (the picture alone is not enough);
  the child fills the single result blank and a matching blank in the closing sentence.
- In archetypes B and C the child fills all three number boxes plus the closing-sentence blank.
- In archetype C the visible count is deliberately **not** the answer — it is the known part, so
  the child must read the problem rather than just count the picture.

### 5.3 The boxed-equation layout (archetypes B and C)
This is the distinctive visual from §3 and must be rendered as **drawn shapes, not plain text**:
each number sits inside its own **square box**, then a **circle that is intentionally left empty**
(so the child pencils in the minus sign themselves), then a plain **equals**, then the answer as a
final **empty square box**. For B and C, all three number boxes are empty for the child to fill;
the empty circle and the equals are always drawn, but the minus sign itself is **not** drawn.
Never pre-fill the operands. (Plain Section-1 equations do **not** use boxes — they use a simple
underline blank and do show the minus sign normally.)

### 5.4 Independence of the three dimensions
Although the defaults bundle them as above, the design should treat "equation given vs blank",
"show one group vs both", and "take-away vs part-whole" as independent flags, so other
combinations are possible later (the original workbook even had a *given + part-whole* problem).

---

## 6. Wording and grammar

Each word problem is three pieces of text: an opening line, an action/question line, and a
closing sentence containing the answer blank.

**Take-away problems (A and B):**
- Opening: "There are {M} {plural noun} {place phrase}." — the place phrase is optional
  (e.g. "on a plate", "in a pond"); omit it cleanly when absent. The opening must always state
  the starting quantity M; it must never be empty.
- Action: describes removing S, e.g. "{S} {plural} {verb-plural}." or the variant
  "{S} of the {plural} {verb-plural}." The "of the" variant should only be used for verbs where
  it reads naturally (e.g. "eaten", "picked"), not for all verbs.
- Closing: "There are {blank} {plural} left{optional place}."

**Part-whole problems (C):**
- Opening: "There are {M} {plural} altogether."
- Question: "How many {plural} are {container phrase}?" (e.g. "in the box", "behind the cloud").
- Closing: "There are {blank} {plural} {container phrase}."

**Required grammar handling:**
- **Subject–verb agreement depends on the count.** When the removed count S is 1, use the
  singular noun and singular verb ("1 fish is taken out"); otherwise use plural ("3 fish are
  taken out"). The singular and plural verb forms must genuinely differ where English requires it
  (e.g. "flies away" vs "fly away"); do not store identical forms for both.
- **Irregular plurals** must be explicit per noun (e.g. fish → fish, leaf → leaves); do not
  assume "add an s".
- The closing sentence may keep a generic plural form for the blank regardless of the answer,
  matching conventional worksheet style (and avoiding leaking the answer through grammar).
- Sentences should be capitalised correctly at the start of each line, and read naturally — do
  not emit fragments like "5 ate." or sentences missing their subject.

---

## 7. Visual assets

### 7.1 Object and container icons
Use **Twemoji** (Twitter's emoji set, licensed CC-BY 4.0) as the open-source icon source.
**All icons must be bundled locally** in an assets folder (e.g. `assets/twemoji/`), one SVG per
icon, named by its Unicode codepoint. No content delivery network may be required at runtime;
the worksheet must work fully offline. Provide attribution to Twemoji in the page footer.

**This is a hard requirement, not a suggestion:** the build must actually fetch and **commit the
SVG files** into the assets folder and reference those local files. It must **never fall back to
Unicode / system emoji glyphs** rendered by the operating-system font (these render differently on
each device, are not the bundled open-source asset, and defeat the offline requirement). If the
icons cannot be obtained during the build, the build should fail loudly and say so rather than
silently substitute system emoji.

### 7.2 Composite scenes
For settings with no suitable single icon, draw the scene as a simple vector (e.g. inline SVG)
outline and place object icons on top of it. At minimum: a **fish tank** and a **pond**. Keep
these line-art and black-and-white so they print well. Use scenes only when the object count is
small enough to fit neatly (roughly eight or fewer); otherwise fall back to a plain row of icons.

### 7.3 Cross-out mark
For archetype A, each removed object is overlaid with a clear cross/×. This must be a drawn mark
(not a separate image) so it scales and prints cleanly and stays centred on its icon.

### 7.4 Reference content catalogue
The generator draws from a catalogue of nouns. Each noun carries: its icon, singular and plural
forms, an optional location phrase, an optional "objects left" location phrase, its compatible
removal verb(s) with singular and plural forms and a flag for whether the "N of the …" phrasing
is allowed, an optional scene, and the list of containers it can be hidden in (for part-whole).

Containers carry an icon and a phrase ("in the box", "in the bag", "in the jar", "in the
basket", "in the garage", "behind the cloud", "in the pouch", etc.).

Representative nouns used (the build may extend this):

| Object | Plural | Example place | Removal verb (sing./plur.) | Part-whole container(s) | Scene |
|--------|--------|---------------|----------------------------|-------------------------|-------|
| apple | apples | on a plate | is/are eaten | basket | — |
| balloon | balloons | — | flies/fly away | — | — |
| duck | ducks | in a pond | swims/swim away | — | pond |
| fish | fish | in a tank | is/are taken out | — | tank |
| egg | eggs | in a basket | is/are cracked | basket | — |
| cookie | cookies | on a plate | is/are eaten | jar | — |
| strawberry | strawberries | on a plate | is/are eaten | — | — |
| orange | oranges | in a bowl | is/are given away | basket | — |
| frog | frogs | on a log | hops/hop away | — | — |
| leaf | leaves | on a branch | falls/fall down | — | — |
| bird | birds | on a tree | flies/fly away | — | — |
| bee | bees | on a flower | flies/fly away | — | — |
| butterfly | butterflies | in the garden | flies/fly away | — | — |
| car | cars | in a car park | drives/drive away | garage | — |
| flower | flowers | in the garden | is/are picked | — | — |
| cupcake | cupcakes | on a tray | is/are eaten | — | — |
| book | books | on the shelf | is/are borrowed | — | — |
| candy | candies | on a plate | is/are eaten | bag, jar | — |
| pencil | pencils | — | (part-whole only) | box, case | — |
| crayon | crayons | — | (part-whole only) | box, case | — |
| marble | marbles | — | (part-whole only) | bag, pouch | — |
| star | stars | — | (part-whole only) | cloud | — |

Some nouns only ever appear as part-whole problems (no natural take-away verb), e.g. pencils,
crayons, marbles, stars.

---

## 8. Configuration

Configuration is read from the page URL's query parameters so worksheets are shareable by link,
and is also editable through the control panel. Applying changes from the panel updates the URL
and regenerates.

| Parameter | Meaning | Allowed | Default |
|-----------|---------|---------|---------|
| seed | Any text or number; drives all randomness | any string | `1` |
| max | Largest number used (the largest minuend/total) | 10–25 (clamp) | 10 |
| zero | Whether a `0` answer is permitted | on/off | off |
| bare | Number of plain equations (Section 1) | 0–40 | 5 |
| given | Number of archetype-A problems | 0–30 | 4 |
| btk | Number of archetype-B problems | 0–30 | 3 |
| pw | Number of archetype-C problems | 0–30 | 3 |

Out-of-range values must be clamped to the allowed range. The `max` control must not allow values
below 10 or above 25. A section with a count of zero should hide its heading.

The control panel must also offer: a **Generate** action (apply settings + regenerate), a
**random seed** action, **Submit & Mark**, **Clear answers**, and **Print**.

---

## 9. Generation rules and determinism

- All randomness must come from a **seeded pseudo-random generator** derived from the seed
  string. Same seed + same configuration ⇒ byte-for-byte identical worksheet. (A freshly chosen
  random seed is fine when the user explicitly asks for one.)
- For each problem, choose a minuend/total and a subtrahend/visible-part such that the answer is
  valid: at least 1 by default, or at least 0 when zero answers are enabled. The subtrahend /
  visible part is always at least 1.
- **The full range of answers must actually occur.** It is a defect if every answer collapses to a
  single value (e.g. always 1, or always 0); answers should vary across the sheet within the
  allowed range. Pay special attention to the subtrahend's random range so it is not degenerate.
- The "allow zero" control is a checkbox: read its **checked state**, not a string value.
- The minuend/total should be at least a small floor (e.g. 3) and at most `max`.
- **No object should repeat within a single worksheet** where possible: draw nouns without
  replacement from the appropriate pool (take-away pool for A and B, container-capable pool for
  C), falling back to reuse only if a pool is exhausted.
- For part-whole problems, pick one of the noun's allowed containers, and keep the container's
  representation consistent (do not store an object in one place and look it up as a name in
  another).

---

## 10. Interactive marking

- Each fillable blank (equation result, the three boxes, and each closing-sentence blank) is an
  input the child can type into. The app already knows the correct value for every blank.
- **Submit & Mark** checks every blank and:
  - Accepts either digits or spelled-out number words (zero through twenty-five).
  - Treats an empty or unparseable entry as incorrect.
  - Marks each input visibly correct or incorrect (e.g. colour), and shows the correct value
    next to each incorrect one.
  - Displays a total score and a percentage, with a small encouraging indicator.
- **Clear answers** resets all inputs and removes all marking.
- Marking happens entirely in the page; nothing is sent anywhere.

---

## 11. Printing

- **Print** triggers the browser's print dialog.
- When printing: hide the control panel, all buttons, and the score; suppress marking colours and
  the "correct value" hints so a clean sheet results. Empty inputs should read as blank
  writing-lines and blank boxes.
- Word problems should avoid breaking across a page where reasonable.
- Target paper size A4 with comfortable margins; the layout is child-friendly (large, rounded,
  generous spacing) — it should look like a children's worksheet, not a web dashboard (avoid
  card shadows, gradients, and app chrome).

---

## 12. Deployment / packaging

- The deliverable is a **single self-contained HTML file** (its logic and styling inline) plus
  the **local assets folder** of icons. No build step and no runtime third-party requests.
- It must run when opened directly from disk and when served as a static site from **GitHub
  Pages** (the main HTML file named so it serves as the site index).
- Include a short README describing usage and the URL parameters, and crediting Twemoji.

---

## 13. Acceptance checklist

A correct implementation should satisfy all of the following:

1. Loading with no parameters renders a complete worksheet using the defaults.
2. The same seed + settings reproduce an identical worksheet every time; changing only the seed
   changes the content.
3. `max` is honoured and clamped to 10–25; numbers never exceed it; the control cannot be set
   below 10.
4. With zero answers disabled (the default), no problem has an answer of 0; enabling the option
   permits 0. The control's checked state is what matters.
5. Answers vary across the sheet — they are **not** all the same value (a sheet where every
   answer is 0 or every answer is 1 is a failure).
6. Section counts follow the four count parameters; a zero count hides that section's heading.
7. Archetype A shows a pre-filled equation (only the result blank) and both object groups
   (kept + crossed-out).
8. Archetype B shows the boxed-equation layout — drawn square boxes, an **empty** circle where the
   minus goes (the minus sign is not drawn), and a plain equals, all three numbers blank — plus one
   full group of objects.
9. Archetype C shows the boxed-equation layout, the visible objects, and a container icon; the
   visible count is the known part, not the answer; part-whole problems render without errors.
10. Fish-tank and pond scenes render as drawn scenes with icons placed inside.
11. Sentence grammar is correct and natural, including singular forms when a count is 1, distinct
    singular/plural verbs, and irregular plurals; no empty or fragment sentences.
12. No object repeats within one worksheet unless a pool is genuinely exhausted.
13. Submit marks every blank, accepts digits and number words, shows a score, and reveals correct
    values for wrong entries; Clear resets everything.
14. Print produces a clean, child-friendly black-and-white sheet with no panel, buttons, score, or
    marking hints, and no web-app chrome.
15. All icons are locally committed SVG files loaded from the assets folder, with **no** system-
    emoji fallback; the page works fully offline.
16. The seed/identifier caption renders on the sheet (no missing-element errors), and the page
    generates with no uncaught console errors.
17. The page works opened from disk and when hosted on GitHub Pages.

---

## 14. Implementation notes (as built)

This appendix describes how `subtraction.html` actually implements the requirements above. Line
numbers are approximate. Shared scaffolding (PRNG, marking, print) lives in
[`conventions.md`](conventions.md); this section covers what is specific to subtraction.

### 14.1 File map

| Region | Lines | Purpose |
|--------|-------|---------|
| CSS — layout / panel / worksheet | 8–107 | A4 page, control panel, equation & box styling, cross-out mark, scene containers |
| CSS — `@media print` | 109–114 | Hide panel & corrections, normalise marked answers to ink |
| PRNG (xmur3 + mulberry32) | 184–203 | Seeded RNG stream |
| Config from URL | 205–219 | Parse/clamp `seed,max,zero,bare,given,btk,pw` |
| Container catalogue | 224–233 | 8 containers (cp + phrase) |
| Noun catalogue | 236–278 | ~22 nouns (forms, place, actions, containers, scene) |
| Pool filters | 280–281 | `TAKEAWAY_POOL`, `PARTWHOLE_POOL` |
| Draw-without-replacement | 283–292 | `pick()` + `usedCP` set |
| Problem models | 294–317 | `newTakeaway()`, `newPartWhole()` |
| Render helpers + scenes | 319–356 | `img/imgs/grp`, tank & pond SVG, box/answer inputs |
| Grammar | 358–364 | `actionLine()` |
| Problem renderer | 366–397 | dispatch on archetype A/B/C |
| Paint worksheet | 399–407 | sections, hide empty ones |
| Marking | 410–455 | word parser, grader, clear |
| Panel wiring | 457–482 | populate fields, `apply()`, buttons |

### 14.2 Data catalogue shape

A noun carries everything the grammar and pictures need:

```javascript
{ cp:'1f34e', one:'apple', many:'apples', place:'on a plate', leftPlace:'',
  scene:null, actions:[{ s:'is eaten', p:'are eaten', ofThe:true }], containers:['basket'] }
```

`cp` = Twemoji codepoint; `one`/`many` = singular/plural (irregulars explicit, e.g. `leaf`/`leaves`,
`fish`/`fish`); `place`/`leftPlace` = optional location phrases; `scene` = `null` | `'tank'` |
`'pond'`; each `action` has distinct singular/plural verb forms and an `ofThe` flag for whether
"N of the …" reads naturally. Containers are simpler: `{ cp:'1f4e6', phrase:'in the box' }`.

Pool filters split the catalogue: nouns with `actions` go to the take-away pool (archetypes A, B),
nouns with `containers` go to the part-whole pool (archetype C). Some nouns (pencil, crayon, marble,
star) are **part-whole only**.

### 14.3 Grammar (the trickiest correctness area)

```javascript
function actionLine(noun, S){
  const a = pickList(noun.actions);
  if (S === 1) return '1 ' + noun.one + ' ' + a.s + '.';            // "1 fish is taken out."
  if (a.ofThe && rng() < 0.5) return S + ' of the ' + noun.many + ' ' + a.p + '.';
  return S + ' ' + noun.many + ' ' + a.p + '.';                     // "3 fish are taken out."
}
```

Why it's load-bearing: subject–verb agreement flips on `S === 1` (singular noun **and** verb), the
"N of the …" variant is gated per-verb by `ofThe` and chosen 50/50, and irregular plurals are read
from the noun, never derived by "add s". Getting this wrong produces fragments like "5 ate." — an
acceptance-checklist failure (§13.11).

### 14.4 Keeping answers non-degenerate

```javascript
const LO = Math.min(3, cfg.max);
const floor = cfg.zero ? 0 : 1;                 // smallest allowed answer
const M = randInt(Math.max(LO, 2), cfg.max);
const S = randInt(1, M - floor);                // subtrahend ≥ 1, answer ≥ floor
```

`floor` enforces the "allow zero" checkbox at the *answer* level; the subtrahend is always ≥ 1 (you
always remove/hide at least one object). The `M - floor` upper bound is what stops every answer
collapsing to 0 or 1 (§9 / checklist §13.5).

### 14.5 The boxed equation (archetypes B & C)

Drawn shapes, never text — three boxes, an intentionally empty circle (child writes the minus), a
plain equals:

```javascript
const boxesEq = (a, b, c) =>
  '<div class="equation-boxes">' + boxIn(a) +
  '<span class="op circle"></span>' +     // empty circle — minus NOT drawn
  boxIn(b) + '<span class="equals">=</span>' + boxIn(c) + '</div>';
```

For B and C all three `boxIn(...)` are empty gradable inputs. Archetype A instead shows a *pre-filled*
inline equation `M − S = ___` with only the result blank.

### 14.6 Pictures, cross-outs, and scenes

- Archetype **A** draws both groups: the kept objects, plus the removed objects each wearing a
  drawn `✕` via a CSS `::after` overlay (`.crossed::after { content:'\2715'; … }`) so it scales and
  prints with the icon.
- Archetype **B** draws one group of all M objects.
- Archetype **C** draws the V visible objects plus a container icon holding the hidden rest.
- Fish/duck get composite **SVG scenes** (tank = box + water line; pond = ellipse + ripple) with
  icons absolutely positioned on top — but only when `count <= 8`, otherwise it falls back to a plain
  row:

```javascript
function sceneOrGroup(noun, count, small){
  const inner = imgs(noun.cp, count, small, false);
  return (noun.scene && count <= 8) ? SCENES[noun.scene](inner) : grp(inner, false);
}
```

### 14.7 Gotchas for maintainers

- **Containers are not de-duplicated** like nouns — the same container can appear twice on a sheet
  (`pickList(noun.containers)` is independent of `usedCP`). Fine, since containers are scene furniture.
- **Answers live in the DOM** (`data-answer`) — not a problem for a client-side worksheet, but don't
  repurpose the marking pattern anywhere answers must stay hidden.
- The "allow 0" control governs the **answer**, not the subtrahend; there are never "5 − 0 =" problems.
- Scene auto-cutoff at 8 objects means small fish/duck problems get the tank/pond but large ones
  silently don't — a minor visual inconsistency, not a bug.
