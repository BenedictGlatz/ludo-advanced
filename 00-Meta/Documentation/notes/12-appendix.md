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
| 4 | Work package dependencies and the critical path | [Project-Plan.md](../../Project-Management/Project-Plan.md) section 4.1, Mermaid | Ch. 02 |
| 5 | Ludo Advanced schedule, recorded to 2026-08-23 and planned after it | [Roadmap-and-Gantt.md](../../Project-Management/Roadmap-and-Gantt.md) section 4, Mermaid gantt | Ch. 02, Ch. 11 |
| 6 | The Roadmap view of the GitHub Projects board as a Gantt chart | *reserved*, see the note below | Ch. 02 |

**Figure 1 is reserved, not written.** Open pull request #51 adds a Kanban board screenshot as
Figure 1 to this file. The architecture figures were numbered from 2 on 2026-08-22 so that the two
branches do not both claim the same number, which is cheaper than renumbering afterwards. If #51 is
closed without merging, the numbering is closed up and this row is deleted.

Both architecture figures are **Mermaid** rather than an image: GitHub renders Mermaid inline, so the
diagram is readable in the document it belongs to, and it stays a text diff in review. The report
exports them as images at the end. Deliberate trade-off, the same one the sample report makes when it
draws its component hierarchy as a text tree with no graphics software at all.

**Figure 6 is reserved and cannot be produced from the command line.** A GitHub Projects view has no
export, so the only artefact is a screenshot, and taking one is a human step by nature rather than by
the missing token scope. It is reserved rather than dropped because issue #18 asks for the board view
and not only for a chart. What blocks it first is the board's own state: dates are set on 11 of 64
items, so a screenshot taken today would show 4 bars and 7 dots. Section 6 of
[Roadmap-and-Gantt.md](../../Project-Management/Roadmap-and-Gantt.md) lists what has to happen before
the screenshot is worth taking.

**Figure 5 is a Mermaid `gantt` block, not the board view.** The reason is in section 3 of that
document: the Roadmap view cannot be configured without the `project` token scope and cannot be
exported at all, so a schedule kept only there is neither printable nor reviewable in a pull request.
Figure 5 is the printable one and the board stays the live tracking surface. The two can disagree, in
which case the board wins and Figure 5 is corrected.

Still likely candidates: the board topology and its indexing (Ch. 05, from the 52-square track and the
58-step journey), and the component hierarchy of the most complex view (Ch. 04).

## Listings

*(none yet)*

Likely candidates: the board topology definition, one skill card effect as a pure function, the
intent-dispatch boundary between `ui/` and `state/`.
