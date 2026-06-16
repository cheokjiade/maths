# `time.html` — telling-time worksheet generator

**File:** `time.html` · **Shared patterns:** [`conventions.md`](conventions.md)

A seed-driven generator for telling time **to 5 minutes**, built on the shared `WS` engine. Clocks
are drawn as **inline SVG** (no library — a clock is just trig, and the `file://`/offline constraint
rules out npm/ES-module/canvas clock libs). Six exercise types, including an **interactive
set-the-hands** clock the child drags or taps.

---

## 1. Exercise types

| Section (fn) | Asks | Child does | Marked by |
|--------------|------|------------|-----------|
| Read clock (`gRead`) | "Write the time shown" | types `3:25` | `gradable[data-kind="time"]` |
| Set hands (`gSet`) | "Show 3:25 — drag or tap the hands" | drags a hand or taps a number / minute mark | custom `clockExtra` |
| Minutes after (`gAfter`) | "__ minutes after 4:00" + "Time: __" | types minutes + time | `num` + `time` inputs |
| Match (`gMatch`) | "Tap the time shown" | taps one of 4 digital times | `.sel-block` chips |
| a.m./p.m. (`gAmPm`) | context sentence | taps a.m. or p.m. | `.sel-block` chips |
| Duration (`gDuration`) | "10:00, half an hour later it will be __" | types the end time | `time` input |

---

## 2. The clock (SVG + trig)

`tip(deg,len)` returns the `[x,y]` at a clock angle (0° = 12 o'clock, clockwise) on the 100×100
viewBox centred on (50,50). Hand angles: minute `= m*6`, hour `= (h%12)*30 + m*0.5` (so a *displayed*
clock's hour hand sits realistically between numbers). `readClock(h,m)` is a static display clock;
`setClock(ansH,ansM)` is the interactive one.

### Interactive set-the-hands (`setClock` / `enableClock` / `clockExtra`)

- Two input methods: **tap** an hour number (`.htick[data-h]`) or a minute mark (`.mtick[data-m]`),
  or **drag** a hand (`.grab` hit-lines, wide + transparent, layered above the ticks so a drag wins
  over a tap where they overlap). Pointer events → mouse + touch, `file://`-safe.
- Snap: dragging rounds to the nearest 30° → whole hours / 5-minute marks (the unit is "to 5 min").
- State in `clockState[cid] = {h, m, ansH, ansM}`. `clockExtra()` is a custom marker (passed to
  `WS.mark({extras:[clockExtra]})`) — one point per clock, correct iff `h===ansH && m===ansM`; wrong
  clocks show `(H:MM)` in a `.correction` span. `clockClear()` resets hands to 12:00.

**Verifier contract:** each widget exposes `data-ans-h`/`data-ans-m`, and the hour/minute ticks are
`.htick[data-h]` / `.mtick[data-m]`. `verify.js` solves a clock by clicking the two matching ticks
(mirroring a child tapping) — see [`verify.md`](verify.md).

---

## 3. Answer kinds & determinism

- `WS.addKind('time', …)` via `normTime` — accepts `3:25`, `3:5`, `325`; normalises hour mod 12 so
  `12:25` and `0:25` match.
- Each section draws **distinct times** (a `distinctTimes()` closure per section) and a.m./p.m. uses
  `balanced()` over its sentence pool, so no question repeats (enforced by the verifier's dup gate).

---

## 4. Config (URL params, clamped)

`read` 4 · `sethands` 4 · `after` 3 · `match` 4 · `ampm` 4 · `duration` 4 — each `0–20`. A section
with count `0` is omitted.
