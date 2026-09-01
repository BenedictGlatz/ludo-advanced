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
| 7 | Project structure plan of Ludo Advanced, to epic level | [Project-Structure-Plan.md](../../Project-Management/Project-Structure-Plan.md) section 2, Mermaid | Ch. 02 |
| 8 | The board as an 11 by 11 grid: which cell holds which of the 40 track fields | [01-spec-foundations-and-board.md](../../../01-Design/Handoff/01-spec-foundations-and-board.md) D3, reproduced in the header of `src/ui/styles/board-track.css` | Ch. 04, Ch. 05 |
| 9 | The design token reference | [01-spec-foundations-and-board.md](../../../01-Design/Handoff/01-spec-foundations-and-board.md) section 3 | Ch. 04 |
| 10 | The board renderer, as the browser holds it | Drawn in this file, from `src/ui/board-view.js` | Ch. 04 |
| 11 | The rendered board: 2, 3 and 4 players, the Night In skin, and greyscale | `01-Design/assets/*.png`, from `node scripts/design-screenshots.js` | Ch. 04, Ch. 08 |

**Figures 8 and 9 registered on 2026-08-30**, both from design handoff 01. Figure 8 is a table and
not a drawing on purpose: the board's geometry is 40 index-to-cell mappings, and a picture of the
cross says less than the table does about which index sits where. It exists twice, once in the spec
and once in the header of the stylesheet that implements it, and the two were emitted from the same
arithmetic. If they ever disagree, the stylesheet is what the browser renders and the spec is what
gets corrected.

**Figure 10 is drawn below**, because Chapter 04 has to describe one component in depth and this is
it. **Figure 11 is a set of five screenshots** in `01-Design/assets/`, produced by
`node scripts/design-screenshots.js` against the production build at a fixed seed: the board at 2, 3
and 4 players, the Night In skin, and the greyscale view that Chapter 08 quotes numbers for.

### Figure 10: the board renderer, as the browser holds it

The element tree `src/ui/board-view.js` produces. Counts are per match and do not change during one:
nothing here is created or destroyed after the first render, which is what lets a pawn animate
between two squares (D10 of the design spec).

```
#app
└── .app                                        the page shell, src/ui/styles/app.css
    ├── .board  [data-players]                  11 x 11 CSS grid
    │           [data-active-player]            whose turn, styled by board.css
    │           [data-phase] [data-status]      added for the tests, styled by nothing
    │           [data-turn]  [data-roll]
    │   ├── .square.square--track  x40          [data-square="0..39"]
    │   │      ├── [data-entry-of="0..3"]       on 4 of the 40
    │   │      ├── [data-turnoff-of="0..3"]     on 4 of the 40
    │   │      └── [data-legal-target="true"]   transient, set by move-hints.js
    │   ├── .start-area  x4                     [data-player="0..3"], the yards
    │   │   └── .slot  x4                        [data-slot="0..3"]
    │   ├── .home-column  x4                    [data-player="0..3"], the houses
    │   │   └── .square.square--home-column x4   [data-home-step="1..4"]
    │   └── .pawn  x(4 per seated player)       direct child of .board, never re-parented
    │          ├── [data-player] [data-pawn]    identity, never changes
    │          ├── [data-r="0..44"]             position, the only thing that changes
    │          ├── style="--pawn-col, --pawn-row"  fractional cell centre, transitions
    │          └── [data-movable] [data-selected] [data-captured]   transient states
    └── .move-refusal  [data-reason-key]        the S6 strip, refusal.css
                       [data-message-kind]      "refusal" or "win", see the note in Ch. 04
```

For a four-player match that is 1 board, 40 track squares, 4 yards with 16 slots, 4 houses with 16
squares, 16 pawns and 1 message strip: **93 elements, built once.**

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
