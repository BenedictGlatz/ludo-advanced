# Brief 01: foundations and the board

**Claude Code to Claude Design.** Issue #3 *Create Design System*, Sprint 2.
Written 2026-08-29. Answered by `01-spec-foundations-and-board.md`.

This is the first handoff of the project. The loop it belongs to is described in
[../README.md](../README.md), including why every answer in the spec has to name a rejected
alternative.

**Nothing visual is decided in this brief, on purpose.** It names elements, attributes and numbers
from the rulebook, and it asks nine questions. Every colour, size, font and component look is yours.
If a constraint below reads like a design instruction, treat that as a bug in the brief and say so.

---

## 1 What to design

Two screens from section 2.2 of
[Obligations-Book.md](../../00-Meta/Project-Management/Obligations-Book.md), plus the foundations
every later screen reuses.

| Id | Screen | Responsibility |
| --- | --- | --- |
| S3 | Board | The track, the four start areas, the four home columns, the home slots and every pawn, rendered from state. |
| S6 | Move hints and refusal | Highlights the legal moves before the player commits, and states the reason when a move is refused or no move exists. |

Plus the **foundations**: colour, spacing and typography as reusable tokens, since S4, S5, S7, S8 and
S9 will be built on them in later issues and must not each invent their own.

---

## 2 Hard constraints

Non-negotiable, each with the reason it exists. If one of them makes a design you want impossible,
say so in the spec rather than working around it silently.

| Constraint | Why |
| --- | --- |
| **Real DOM elements in a CSS Grid. No SVG, no `<canvas>`.** | Decided 2026-08-29, see section 5 of this brief for what it rules out. jQuery manipulates DOM elements, Playwright selects them by data attribute, i18next puts text in them, and CSS transitions animate them. All four of those are free with DOM and cost work with the alternatives. |
| **jQuery for all DOM work.** | It is the project's only UI dependency (`jquery` 4.0.0). Nothing may need a component framework, a build-time template language or a runtime beyond it. |
| **No file over 300 lines, CSS included.** | NFR-02. A file at the limit is split along a real seam, never compressed by deleting whitespace or comments. This is machine-checked for JavaScript and will be checked by hand for CSS. |
| **No hardcoded user-facing strings.** | NFR-03. Every string a player reads comes from i18next. CSS styles the container that holds the text; CSS never supplies the text. In particular, no `content:` property may carry a word a player reads. |
| **Design tokens as CSS custom properties on `:root`.** | So that no colour, size or font ever appears in `core/` or `state/`. Those two layers are pure and browser-free (NFR-01) and must stay that way. A token is also the only way the later screens can reuse a decision instead of copying a value. |
| **Desktop only.** | NFR-10. Current and previous major versions of Chrome, Firefox and Edge. No mobile or tablet layout, and no touch interaction. This is a scope decision with a stated reason, not an oversight. |
| **Visible feedback within 100 ms of a player action.** | NFR-11. It bounds animation: a movement animation may run longer than 100 ms, but the player must see *something* respond within it. |
| **Everything in section 3 below must be reachable by CSS selector alone.** | The view sets attributes; the stylesheet decides what they look like. If a state needs a class the view does not set, it has to be added to the contract rather than assumed. |

---

## 3 The DOM contract

**This is the load-bearing section of the brief.** It is what lets the design and the rules be built
at the same time without the two of us meeting: you can write selectors against markup that does not
exist yet, and `ui/board-view.js` will produce exactly this.

It is a technical interface and not a design rule. It says which elements exist and what they are
called. It says nothing about what any of them looks like.

```html
<div class="board" data-players="4" data-active-player="0">

  <!-- 52 shared track squares, index 0..51 -->
  <div class="square square--track" data-square="0"  data-entry-of="0"></div>
  <div class="square square--track" data-square="1"></div>
  <!-- ... -->
  <div class="square square--track" data-square="51" data-turnoff-of="0"></div>

  <!-- per player p = 0..3 -->
  <div class="start-area" data-player="0">
    <div class="slot" data-slot="0"></div>   <!-- x4 -->
  </div>
  <div class="home-column" data-player="0">
    <div class="square square--home-column" data-player="0" data-home-step="1"></div>  <!-- x5 -->
  </div>
  <div class="home" data-player="0">
    <div class="slot" data-slot="0"></div>   <!-- x4 -->
  </div>

  <!-- pawns, placed into a square by JS -->
  <div class="pawn" data-player="0" data-pawn="0" data-r="0"></div>

</div>

<!-- S6, the refusal region. Text comes from i18next, never from CSS -->
<div class="move-refusal" data-reason-key="move.refused.overshoot"></div>
```

### The states the CSS must style, all driven by attributes

| Selector | Meaning |
| --- | --- |
| `.square[data-legal-target="true"]` | A legal move target, highlighted before the player commits (FR-32) |
| `.pawn[data-movable="true"]` | This pawn has at least one legal move this turn |
| `.pawn[data-selected="true"]` | The player has picked this pawn |
| `.pawn[data-captured="true"]` | Transient, for the return-to-start animation |
| `.board[data-active-player="N"]` | Whose turn it is, so the board itself can signal it |

### Two attributes worth reading twice

- **`data-entry-of` and `data-turnoff-of`** appear on 8 of the 52 track squares, two per player. They
  mark the square a pawn enters the board on and the last shared square before that player's home
  column. Whether they are visually marked at all is your decision, D7.
- **`data-r`** on a pawn is its **relative position**, 0 to 58, counted from its own player's
  viewpoint. It is not a square index. The mapping is real code you can read:
  [`src/core/board.js`](../../src/core/board.js), written the day before this brief. `data-square` on
  a track square *is* an absolute index, 0 to 51.

---

## 4 Facts the design must match

Straight from section 2 of
[Game-Design-Document.md](../../00-Meta/Project-Management/Game-Design-Document.md), so that the
design and the code cannot disagree. None of these is negotiable and none of it was invented here.

- **52 shared track squares** in a closed loop, indexed 0 to 51. Square 51 is followed by square 0.
- **4 players at a fixed offset of 13.** Entry squares are 0, 13, 26 and 39. Turn-off squares are 51,
  12, 25 and 38.
- **Per player: 4 start slots, 5 home column squares, 4 home slots.**
- **4 pawns per player**, and **2, 3 or 4 players** in a match. A 2-player and a 3-player board must
  both work, and empty seats have to look deliberate rather than broken. See D3.
- **A pawn's journey is 58 steps**: 52 track squares, 5 home column squares, and home itself.
- **Two pawns of the same player can never share a square.** Pawns of different players can only ever
  meet on the shared track, never in a home column, so no square needs to show two pawns of different
  colours at once except momentarily during a capture.
- **S3 to S7 are one screen with five regions, not five screens.** FR-31 requires the board, the
  pawns, the active player, the three dice cards and the skill hand to be readable at once **without
  scrolling**. The dice hand, the skill hand and the HUD are not in this brief and are not yours to
  design yet, but the board layout has to leave room for them. That is the main reason D6 (target
  resolution and board size) matters more than it looks.

---

## 5 Open decisions this handoff must answer

Numbered so that the spec can answer them one by one and a gap is visible. Each one needs a reason
**and a named rejected alternative**.

| # | Decision | Note |
| --- | --- | --- |
| D1 | **Colour palette.** | Four player colours plus board, surface, text and highlight colours. |
| D2 | **The non-colour player identifier.** | NFR-12: shape, pattern, letter, number or something else. **Acceptance criterion, and it is mechanical: a greyscale screenshot still identifies whose pawns are whose.** This is row 8 of the Product Owner sign-off table in section 9 of the game design document, deliberately left blank as "which one is a Claude Design decision". Your answer fills that row. |
| D3 | **Board grid geometry.** | Which grid cell holds which track index, and where the start areas, home columns and home slots sit. The classic Ludo cross fits a 15 by 15 grid; that is a proposal, not a constraint. Must also answer what a 2-player and a 3-player board look like. |
| D4 | **Spacing scale.** | |
| D5 | **Typography.** | Including whether a web font is loaded at all. A self-hosted font is an asset nobody has budgeted, so a system font stack is a legitimate answer if you say why. |
| D6 | **Target desktop resolution and board size.** | **Never agreed by anyone.** It was Sprint 0 scope and was skipped, which the sprint log records. FR-31 makes it load-bearing: the board plus two card hands plus a HUD must fit without scrolling. |
| D7 | **The five pawn and square states of section 3.** | Especially `data-legal-target`, because FR-32 depends on it being unmistakable, including when several squares are highlighted at once. Also whether entry and turn-off squares are marked at all. |
| D8 | **Movement animation: duration and easing.** | Bounded by NFR-11: the player sees feedback within 100 ms. The pawn's grid position changes and a CSS transition does the rest, so this is a token, not a script. |
| D9 | **How a refusal reason is presented (S6).** | NFR-08's acceptance criterion is that **a playtester can state why a move was refused without being told.** There are four reasons: no maximum rolled and no pawn on the track, the target square holds an own pawn, the move would overshoot home, and no legal move exists at all. The wording is i18next's job; where it appears, how long it stays and how it draws attention are yours. |

**If you need a decision that is not on this list, add it as D10 and onward.** A brief that missed
something is a better outcome than a spec that silently decided it.

---

## 6 Deliverables

| File | Contains |
| --- | --- |
| `01-Design/Handoff/01-spec-foundations-and-board.md` | The five-section spec of [../README.md](../README.md). D1 to D9 each answered with a reason and a rejected alternative. |
| `src/ui/styles/tokens.css` | Every token as a CSS custom property on `:root`. |
| `src/ui/styles/board.css` | The grid, the squares, the start areas, the home columns and the home slots. |
| `src/ui/styles/pawn.css` | The pawn, its five states from section 3, and the movement transition. |
| `01-Design/assets/` | Any exported image or SVG, and only if one is genuinely needed. |

The three CSS files land in `src/ui/styles/` and not in `01-Design/`, because they are production
code. The reasoning lands in the spec. That split is the point of the folder.

**Two mechanical checks will be run on the delivery**, so they are worth knowing in advance: no CSS
file over 300 lines, and no user-facing string inside a CSS `content:` property.

---

## 7 Out of scope

Said explicitly, because a design system grows to fill whatever is not ruled out.

| Not in this handoff | Where it belongs |
| --- | --- |
| The dice hand: three cards, the choice between them, the roll result (S4) | #30, #31, epic #37 |
| Skill cards: the hand, playability, the reaction prompt (S5) | #32, #33, #34, epic #38 |
| The HUD: per-player progress (S7) | #35, epic #39 |
| Main menu, match setup, pause and win screens (S1, S2, S8, S9) | #41, epic #39 |
| The rules screen (S10) and the language switch (S11) | No issue exists for either. |
| Sound, music and any audio cue | #40 |
| Any mobile or tablet layout | Out of scope for the MVP entirely (NFR-10) |

A **minimal win message** is in scope for the board later; the win **screen** is not.

---

## 8 One thing to be honest about

The eight gameplay rules in section 6 of the game design document are **still unsigned by the Product
Owner**. The one that could affect this handoff is FR-12: if it were overridden toward a *blocking*
mechanic, where a pair of pawns stops opponents passing, a square would gain a state this contract
does not have. It is written as decided so that work is not blocked, and this is the risk that comes
with that.

Nothing else in section 4 is likely to move. The 52 squares, the offset of 13 and the 58-step journey
are the classic Ludo topology and are settled.
