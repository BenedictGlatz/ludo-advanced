# 04 Frontend: structure and building blocks

> **Covers:** `src/ui/` and `src/i18n/`: the components the player sees, how they render, how they
> bind events, how they dispatch into `state/`, and how localisation works.
> **Does not cover:** game rules (Chapter 05) or state transitions (Chapter 06). If a fact is about
> *what the rule is*, it belongs in 05 even when the UI shows it.

## What this chapter must answer

- The list of UI components, one line each on what it does.
- How components interact, and how they are grouped.
- **One component in depth**: the most complex view, with its structure drawn out. The sample
  report does this with a single screen and it is one of its strongest sections. Pick the board
  renderer or the card-hand view, and put the component tree in the appendix as a text diagram.
- Modularisation: how the UI is split across files and why along those seams.
- How the UI reads state and dispatches intents: it never mutates state directly.
- Styling approach.
- Localisation: how i18next is set up, where the locale files live, how a key is resolved.
- Routing, if any. If there is none (a single-screen game), say so and explain why, rather than
  omitting the topic.

## Facts

### Where the design system lives, and how it gets here: 2026-08-29, issue #3

This chapter's *Open* section asked for exactly this: "when it does, record where it lives". It now
lives in two places on purpose, and the split is the fact worth carrying.

| What | Where | Why there |
| --- | --- | --- |
| The CSS itself | `src/ui/styles/` | It is production code and it is what the build ships. |
| The reasoning behind it | `01-Design/Handoff/` | "Why does it look like that" has to be findable without reading a stylesheet, six weeks later, by whoever writes the report. |

- **`01-Design/` is a new top-level folder, committed to git**, sitting next to `00-Meta`. It holds a
  `README.md` describing the loop, a `Handoff/` directory of numbered brief and spec pairs, and an
  `assets/` directory for exported images if any turn out to be needed.
- **The loop is a pair of documents with a fixed shape.** Claude Code writes a **seven-section
  brief**: what to design, hard constraints with reasons, the DOM contract, facts taken from the
  rulebook, numbered open decisions, deliverables with paths, and what is out of scope. Claude Design
  answers with a **five-section spec**: files delivered, one answer per open decision with a reason
  **and a rejected alternative**, a token reference table, the component states covered, and what is
  still open.
- **The rejected-alternative requirement is in the template rather than in a reminder.** A delivered
  palette looks finished, and a finished thing does not invite the question "compared to what". Asking
  for the alternative in the template costs a sentence per decision; reconstructing it for the report
  in week eight is not possible at all.
- **Brief 01 went out on 2026-08-29** as
  [01-brief-foundations-and-board.md](../../../01-Design/Handoff/01-brief-foundations-and-board.md).
  It covers screen S3 (the board), screen S6 (move hints and refusal) and the colour, spacing and
  typography foundations every later screen reuses. It asks **nine numbered decisions, D1 to D9**, and
  contains no colour, size or font of its own.
- **It went out after `core/board.js` existed and not before**, deliberately. The square indices,
  the entry squares and the 58-step journey in the brief are values a reader can check against real
  code rather than against a plan.

#### The DOM contract is the load-bearing part, and it is not a design rule

The brief specifies the exact markup `ui/board-view.js` will produce: `.board`, `.square--track` with
`data-square="0..51"`, `.start-area`, `.home-column` with `data-home-step="1..5"`, `.home`, `.pawn`
with `data-player`, `data-pawn` and `data-r`, and a `.move-refusal` region carrying a
`data-reason-key`. Five states are driven by attributes: `data-legal-target`, `data-movable`,
`data-selected`, `data-captured` on pawns and squares, and `data-active-player` on the board.

**Why this is worth a paragraph in the report:** it is what lets the design work and the rules work
happen at the same time without the two sides meeting. Claude Design writes selectors against markup
that does not exist yet, and the view is written to produce exactly it. Without the contract, one side
waits for the other, and #3 blocks 15 points of UI work.

**The line the brief must not cross**, and it is drawn in the brief itself: naming an element or an
attribute is a technical interface, naming a colour, size or font is a design rule that `CLAUDE.md`
forbids Claude Code from inventing. The practical test used is whether Claude Design could reasonably
answer "no, it should be different". If yes, the brief asks instead of telling, which is what the
nine open decisions are for.

#### The one presentation decision taken by Claude Code

**The board is drawn as real DOM elements in a CSS Grid**, not as SVG and not on a `<canvas>`. The
reasons and the two rejected alternatives are in the decision block of 2026-08-29 in
[project-journal.md](../project-journal.md). In short: jQuery, Playwright, i18next and CSS transitions
each do something for free with DOM elements that would have to be built by hand otherwise, and the
game is turn-based with one pawn moving at a time, so canvas buys performance the game does not need.

This **reverses a deferral** in section 6 of
[System-Architecture.md](../../Project-Management/System-Architecture.md), which had handed the choice
to Claude Design as a design rule. It is a rendering technology and not an appearance, and a brief
cannot hand over a DOM contract without first deciding that there is a DOM. The brief tells Claude
Design to push back if the constraint makes a design impossible, so the reversal is reversible.

**Planned structure recorded 2026-08-22, issue #21.** The 7 planned modules of `ui/` and the FR ids
each one owns are in [System-Architecture.md](../../Project-Management/System-Architecture.md)
section 2.3, with the facts summarised in [03-tech-stack.md](03-tech-stack.md). Two points from it
belong to this chapter specifically: all jQuery event handlers live in one module, `ui/events.js`, and
each handler translates a DOM event into exactly one intent and dispatches it; and `ui/` carries no
line-coverage target, because a coverage number for this layer would measure how much jQuery ran
rather than whether anything works. This chapter fills from observation once the code exists.

**Screen inventory recorded 2026-08-22, issue #14.** Section 2 of
[Obligations-Book.md](../../Project-Management/Obligations-Book.md) holds the full table. Facts for this
chapter:

- **Nine screens and screen regions in the MVP, plus two `should have` ones.** S1 main menu, S2 match
  setup, S3 board, S4 dice hand, S5 skill hand, S6 move hints and refusal, S7 HUD, S8 pause, S9 win.
  Should-have: S10 rules screen, S11 audio and language settings.
- **S3 to S7 are one screen with five regions, not five screens.** The player never navigates between
  them: FR-31 requires all five to be visible at once. This is also the answer to this chapter's routing
  question: a single-screen game has no routing, and the reason is a requirement rather than a
  simplification.
- **The reaction window is a modal state of S5, not a screen of its own.** It is a phase of the turn
  held by `state/turn-manager.js`, and in a hot-seat game every prompted player shares one screen
  (FR-03), so the prompt has nowhere else to happen.
- **S6 exists because of NFR-08 alone.** A refusal has to carry its reason, which is why the
  legal-move set is computed in `core/` and handed to the view instead of re-derived while rendering.
  It is the clearest case of the layering rule doing visible work for a player.
- **S7, the HUD, shows pawn progress only.** No resource or energy display, because section 6.7 of the
  game design document rules the mechanic out of the MVP, although issue #35 is titled *Game HUD &
  Resource Display*.
- **Negative finding: two screens carry no backlog issue.** S10 (FR-35, `should have`) and the language
  half of S11 (FR-34, **`must have`**, with NFR-03) appear in no issue on the board. A must-have
  requirement with no issue means the board understates the remaining work; carried into the effort
  estimation for issue #16.
- **No design specification exists yet**, so the screen inventory is the complete GUI commitment for
  now. Palette, spacing and typography stay with Claude Design and issue #3, and the obligations book
  draws the boundary explicitly: what has to be on screen is a requirement, what it looks like is a
  design decision.

## Decisions

<!-- Promote decision blocks here from project-journal.md when this chapter is written. -->

## Open / to verify

- No source code exists yet. The layering below is the declared target state from
  [CLAUDE.md](../../../CLAUDE.md), not an observed fact:
  `ui/` does jQuery rendering and event binding, reads state, dispatches intents into `state/`, and
  contains no game rules.
- ~~Design and UI are developed with Claude Design; no design specification (colour palette, spacing,
  typography) exists in this repository yet. When it does, record where it lives.~~ **Half answered
  2026-08-29:** where it will live is decided and recorded above, and the first brief has gone out.
  **The specification itself does not exist yet.** No colour, spacing value or font has been decided
  by anyone, and none is written down anywhere in this repository. The nine open decisions D1 to D9
  are open. Chapter 12 still wants the component overview table, and it cannot be written until the
  spec comes back.
- A card's visual presentation belongs here and its rule belongs in Chapter 05; the two are matched
  by card id. Worth stating explicitly in the report, because it is the clearest example of the
  layering rule doing real work.
