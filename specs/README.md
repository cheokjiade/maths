# Specs

Per-file specifications for the maths worksheets project. Each spec describes one file (or file
group): what it does, its structure, the questions/images it produces, where the tricky logic lives,
illustrative snippets, and maintainer gotchas.

Start with **[`conventions.md`](conventions.md)** — the patterns every generator shares (seeded PRNG,
the marking contract, configuration, printing, assets). The per-file specs assume it and only cover
what is unique to each file.

## Index

| Spec | Covers | What it is |
|------|--------|------------|
| [`conventions.md`](conventions.md) | *(cross-cutting)* | Shared PRNG, marking contract, config, print & asset rules |
| [`index.md`](index.md) | `index.html` | Contents page / site landing — the only non-generator page |
| [`subtraction.md`](subtraction.md) | `subtraction.html` | Subtraction generator — full requirements spec + as-built implementation notes |
| [`addition.md`](addition.md) | `addition.html` | Addition generator (sums within 10) — ten question types incl. colour-match |
| [`shapes.md`](shapes.md) | `shapes.html` | Shapes generator — incl. the interactive copy-the-figure grid |
| [`ordinals.md`](ordinals.md) | `ordinals.html` | Ordinal numbers generator (1st–10th) |
| [`numbers20.md`](numbers20.md) | `numbers20.html` | Numbers-to-20 generator — count, tens/ones, words, patterns, compare, order, more/fewer |
| [`verify.md`](verify.md) | `verify/` | Generic Playwright verifier that marks every generator end to end |
| [`legacy-prototypes.md`](legacy-prototypes.md) | `subtraction_worksheet*.html` | Superseded prototypes — historical, unreferenced |

## Conventions for these specs

- One spec per file (or tight file group). Cross-link with relative links rather than repeating
  shared material.
- Each generator spec follows roughly: purpose → page structure → question/exercise types (with
  picture descriptions) → configuration → complicated logic → key snippets → insights/gotchas →
  assets.
- Line numbers in snippets are **approximate** — the files are edited in place. Treat snippets as
  signposts, not exact quotes.
- When you add a generator: write its spec from this template, add a row above, add a `TARGETS` entry
  in `verify/verify.js`, and add a card in `index.html`.
