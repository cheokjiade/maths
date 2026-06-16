# `index.html` — contents page

The site landing page: a static table of contents linking to each worksheet generator. It is the
GitHub Pages site index, so its filename matters (`index.html` is served at the site root).

See [`conventions.md`](conventions.md) for repo-wide patterns. This page is the one file that is
**not** a generator — no seed, no PRNG, no marking — just navigation.

---

## Structure

- **Header** — `🧮 Maths Worksheets` title and a one-line subtitle.
- **Card grid** — a responsive CSS grid (`repeat(auto-fill, minmax(230px, 1fr))`) of cards, one per
  topic. Each live card is an `<a class="card" href="…">` with an emoji icon, title, one-line
  description, and an `Open →` affordance. A disabled `.card.soon` (e.g. Multiplication) shows a
  greyed-out "Coming soon" badge and is not a link.
- **Footer** — credit line ("Pictures: Twemoji (CC-BY 4.0)").

Current cards: **Subtraction**, **Addition**, **Shapes**, **Ordinal Numbers**, and a
**Multiplication** "coming soon" placeholder.

---

## Images / visuals

No worksheet pictures. The only graphics are **system emoji glyphs** used as card icons
(➖ ➕ 🔷 🥇 ✖️) and the page title (🧮) — rendered by the OS font, not bundled Twemoji, because this
page is never printed.

---

## Styling notes

This is the **only page styled like a web app** rather than a worksheet: it uses a light background
(`#f6f8fc`), card surfaces with `border-radius`, subtle `box-shadow`, and a hover lift
(`transform: translateY(-3px)` + accent border). CSS custom properties `--ink` and `--accent` set
the palette. The worksheet generators deliberately avoid all of this chrome (see
[`conventions.md`](conventions.md) §Printing).

```css
a.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(37,99,235,0.15);
  border-color: var(--accent);
}
```

---

## Maintenance

When adding a new generator, add a matching `<a class="card">` here. There is no automatic
discovery — the card list is hand-maintained. When a "coming soon" topic ships, swap its
`.card.soon` div for an `<a class="card" href="…">`.
