# 12 Appendix

> **Covers:** the tables, figures and code excerpts that are moved out of the running text.
> **Does not cover:** anything that is only referenced once in passing: that stays inline.

## Why this chapter is large

In the sample report the running text is 23 pages and the appendix is 15. Nearly half the document
is material moved to the back. That is what keeps the running text readable: a chapter states a
finding in two sentences and points at the table, instead of interrupting itself with twenty rows.

Rule of thumb: **a table of roughly five rows or more goes here**, as does every figure and every
code excerpt.

## Numbering and referencing

Everything is numbered and captioned:

- `Table n: Title`
- `Figure n: Title`
- `Listing n: Title`

Every item is referenced at least once from the running text, by number **and** title: never a
bare "see above". An appendix item nothing points at should not exist.

Figures are drawn as plain text trees where a tree is what is needed. The sample report draws its
component hierarchy with `└─` characters and no graphics software at all, and it works.

## Tables

*(none yet)*

Likely candidates as the project runs:

- Stack table: layer, technology, version, purpose (feeds Chapter 03).
- Component overview: component, responsibility (feeds Chapter 04).
- Dice card pool distribution: die, probability of leaving the start area, expected move
  (feeds Chapter 05).
- Skill card catalogue: card, type, effect (feeds Chapter 05).
- npm script table if it grows past what fits in Chapter 07.
- Coverage per directory (feeds Chapters 08 and 09).
- Sprint plan versus actual (feeds Chapter 11).

## Figures

*(none yet)*

Likely candidates: the board topology and its indexing, the component hierarchy of the most complex
view, the turn cycle as a flow.

## Listings

*(none yet)*

Likely candidates: the board topology definition, one skill card effect as a pure function, the
intent-dispatch boundary between `ui/` and `state/`.
