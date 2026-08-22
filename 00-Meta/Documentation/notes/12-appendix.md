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

| Figure | Title | Source | Referenced from |
| --- | --- | --- | --- |
| 1 | The GitHub Projects Kanban board | *reserved*, see the note below | Ch. 02 |
| 2 | Layer structure of Ludo Advanced and the permitted import directions | [System-Architecture.md](../../Project-Management/System-Architecture.md) section 1, Mermaid | Ch. 03 |
| 3 | One turn as an interaction between the layers | [System-Architecture.md](../../Project-Management/System-Architecture.md) section 4, Mermaid | Ch. 03, Ch. 06 |

**Figure 1 is reserved, not written.** Open pull request #51 adds a Kanban board screenshot as
Figure 1 to this file. The architecture figures were numbered from 2 on 2026-08-22 so that the two
branches do not both claim the same number, which is cheaper than renumbering afterwards. If #51 is
closed without merging, the numbering is closed up and this row is deleted.

Both architecture figures are **Mermaid** rather than an image: GitHub renders Mermaid inline, so the
diagram is readable in the document it belongs to, and it stays a text diff in review. The report
exports them as images at the end. Deliberate trade-off, the same one the sample report makes when it
draws its component hierarchy as a text tree with no graphics software at all.

Still likely candidates: the board topology and its indexing (Ch. 05, from the 52-square track and the
58-step journey), the component hierarchy of the most complex view (Ch. 04), and the Roadmap view as a
Gantt chart (Ch. 02, issue #18).

## Listings

*(none yet)*

Likely candidates: the board topology definition, one skill card effect as a pure function, the
intent-dispatch boundary between `ui/` and `state/`.
