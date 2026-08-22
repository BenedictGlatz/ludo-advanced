# Requirements Specification and MoSCoW Analysis

The testable requirements of Ludo Advanced, prioritised by MoSCoW.

This is the layer below
[Functional-and-Non-Functional-Goals.md](Functional-and-Non-Functional-Goals.md). A **goal** says
what the software is for; a **requirement** says what must be built and how it is checked. Every
requirement here traces to a goal, an issue, or both, and every one carries an **acceptance
criterion**, which is what the backlog does not have: all 47 issues have empty bodies, so the MoSCoW
labels currently prioritise titles.

## Notation

- `FR-nn` functional, `NFR-nn` non-functional. IDs are permanent; a dropped requirement keeps its ID
  and is marked withdrawn rather than renumbered.
- **MoSCoW**: `M` must have, `S` should have, `C` could have, `W` won't have *this time*.
- **†** marks a requirement **not derivable from any existing document**. It was added while writing
  this specification because the rules or the flow are incomplete without it. Every † is a proposal
  and needs the Product Owner's confirmation; section 5 lists the ones that change gameplay.
- **Traces to**: the goal ID and/or backlog issue the requirement comes from.

---

## 1 Functional requirements

### 1.1 Match setup and lifecycle

| ID | Requirement | Acceptance criterion | MoSCoW | Traces to |
| --- | --- | --- | --- | --- |
| FR-01 | A new match is started for a player count chosen from 2, 3 or 4. | Each of the three counts starts a match with that many players, four pawns each, all in their start areas. | M | FG-01, #41 |
| FR-02 | Each player has a distinct colour, one start area, one entry square and one home path. | No two players share a colour or any of the three board regions. | M | FG-01, #26 |
| FR-03 † | The MVP is played **hot-seat**: all players share one device and one browser tab. | A match completes with 4 players without any network connection. | M | FG-01 |
| FR-04 | Turn order is fixed when the match starts and rotates in that order. | Given players in order, after player *n* the active player is *n+1*, wrapping to the first. | M | FG-06, #27 |
| FR-05 | A match ends when one player has all four pawns home; that player is declared the winner. | The win screen names the winner within one turn of the fourth pawn arriving. | M | FG-05 |
| FR-06 † | A finished match can be restarted without reloading the page. | Restart from the win screen yields a fresh match with all state reset. | S | #41 |
| FR-07 † | A match in progress can be paused and abandoned back to the main menu. | Pause is reachable at any point in a turn; abandoning returns to the menu. | S | #41 |

### 1.2 Board and movement

| ID | Requirement | Acceptance criterion | MoSCoW | Traces to |
| --- | --- | --- | --- | --- |
| FR-08 | The board is a closed track shared by all players, plus one home path per player. | The track is traversable from any square back to itself; each home path is enterable only by its owner. | M | FG-02, #26 |
| FR-09 | A pawn leaves the start area only when the roll equals the **maximum** of the die chosen that turn. | With a D6 chosen, a roll of 6 permits leaving and 1–5 does not; with a D20, only 20 does. | M | FG-03, #28 |
| FR-10 | A pawn on the track advances exactly the number of squares rolled. | Pawn at square *s* with roll *r* lands on *s+r* along the track. | M | FG-02, #28 |
| FR-11 | Landing exactly on a square occupied by an opponent's pawn captures it; the captured pawn returns to its owner's start area and must leave again under FR-09. | After a capture the opponent's pawn is in its start area and the capturing pawn holds the square. | M | FG-04, #29 |
| FR-12 † | Landing on a square occupied by **one's own pawn** is illegal; the move is not offered. | A move whose target square holds an own pawn is absent from the legal-move set. | M | — |
| FR-13 † | Entering home requires an **exact** count; a roll that would overshoot makes that move illegal. | A pawn 3 squares from home cannot move on a roll of 4; it can on a roll of 3. | M | FG-05 |
| FR-14 † | If the roll produces **no legal move at all**, the turn passes to the next player with an on-screen explanation of why. | With every pawn blocked, the game states the reason and advances the active player without further input. | M | NFG-08 |
| FR-15 † | The MVP board has **no safe squares**; every track square is capturable. | No square rejects a capture that FR-11 would otherwise permit. | C | — |

### 1.3 Dice Card Pool

| ID | Requirement | Acceptance criterion | MoSCoW | Traces to |
| --- | --- | --- | --- | --- |
| FR-16 | The pool contains dice cards from D2 to D20. | Every card drawn over a long run is one of the defined denominations, and each defined denomination is reachable. | M | FG-10, #30 |
| FR-17 † | The exact denomination list and the number of copies of each are fixed and written down before implementation. | The pool composition exists as a single data definition that the rules read; changing it changes the game without a code change. | M | #30 |
| FR-18 | Exactly 3 cards are drawn at the start of a turn. | The hand offered each turn holds 3 cards, at every point in a match. | M | FG-07, #30 |
| FR-19 | The player picks exactly one of the three and rolls it; the other two are not rolled. | Exactly one roll result is produced per turn. | M | FG-08, #31 |
| FR-20 | A rolled die of *n* sides yields a uniformly distributed integer in 1…*n*. | Over a large sample each face occurs with frequency consistent with 1/*n*. | M | FG-08 |
| FR-21 | All 3 drawn cards are returned to the pool and reshuffled after the turn. | Pool size before and after a turn is identical; a card drawn this turn can be drawn next turn. | M | FG-09, #30 |

### 1.4 Skill Card Pool

| ID | Requirement | Acceptance criterion | MoSCoW | Traces to |
| --- | --- | --- | --- | --- |
| FR-22 † | How a player **acquires** skill cards is defined: when a draw happens, how many, and the maximum hand size. | The rule is stated in the rulebook and implemented; hand size never exceeds the stated maximum. | M | #32 |
| FR-23 | *Action* cards are playable only during the owner's own turn. | An Action card is not offered while another player is active. | M | FG-11, #33 |
| FR-24 | *Reaction* cards are playable in response to another player's action. | A Reaction card is offered to its holder at the moment the triggering action occurs. | M | FG-12, #33 |
| FR-25 † | The reaction window is explicit: the game pauses the resolving action and prompts every holder of a currently playable Reaction, then resumes. | The triggering action does not complete until every prompted player has played or declined. | M | FG-12 |
| FR-26 | A card's effect is a rule over game state and is matched to its visual representation by card id. | Effect and artwork are looked up by the same id; neither imports the other. | M | FG-13, CLAUDE.md |
| FR-27 † | A played card leaves the hand and returns to the pool under a defined rule (discard-and-reshuffle or removal). | Pool accounting is closed: every card is in exactly one of pool, hand or discard at all times. | M | #32 |
| FR-28 | The MVP skill card set is a finite, agreed list. | The list exists in the rulebook, and every card on it is implemented and tested. | M | #38 |
| FR-29 | An expanded skill card set beyond the MVP list. | New cards are added by data plus one effect function, with no change to the resolution engine. | C | FG-19, #44 |
| FR-30 | Trap cards with tile-trigger logic. | A trap placed on a tile fires when a pawn enters that tile. | C | FG-20, #45 |

### 1.5 Interface, feedback and localisation

| ID | Requirement | Acceptance criterion | MoSCoW | Traces to |
| --- | --- | --- | --- | --- |
| FR-31 | The board, all pawns, the active player, the three drawn dice cards and the active player's skill hand are visible. | All five are readable on screen without scrolling at the supported resolution. | M | FG-14, FG-16 |
| FR-32 † | Legal moves are shown before the player commits; an attempted illegal move is refused with a stated reason. | Selecting a pawn highlights only squares reachable under FR-09–FR-14. | M | NFG-08 |
| FR-33 | Rolling, moving, capturing and playing a card each produce visible feedback. | Each of the four events changes something on screen beyond the underlying state. | M | #28, #31 |
| FR-34 | The interface is available in German and English, switchable at runtime. | Switching locale re-renders every visible string; no string remains in the previous language. | M | FG-15, NFG-03 |
| FR-35 † | A rules screen explaining dice cards, skill cards and the leaving-start rule is reachable in-game. | A first-time player can reach it from the main menu and from a match. | S | NFG-08 |
| FR-36 | A HUD shows each player's progress: pawns still in start, on track and home. | The counts match the game state after every turn. | S | #35 |
| FR-37 | Resource/energy display. | No rule exists to display; see section 5. | W | #35 |

### 1.6 Screens and audio

| ID | Requirement | Acceptance criterion | MoSCoW | Traces to |
| --- | --- | --- | --- | --- |
| FR-38 | Main menu, pause screen and win screen exist and connect into a complete flow. | Menu → match → pause → match → win → menu is navigable without a reload. | M | #41 |
| FR-39 | Sound effects for rolling, capturing, playing a card and winning. | Each of the four events plays its distinct sound. | S | #40 |
| FR-40 | Background music. | Music plays during a match and loops. | C | #40 |
| FR-41 † | Audio can be muted, and the setting survives leaving and re-entering a match. | Mute silences both effects and music; the state persists within the session. | S | #40 |

### 1.7 Beyond the MVP

| ID | Requirement | Acceptance criterion | MoSCoW | Traces to |
| --- | --- | --- | --- | --- |
| FR-42 | Online multiplayer with a lobby. | Two browsers on different machines play one match. | S | FG-17, #42 |
| FR-43 | LLM-powered bot opponents. | A bot takes a legal turn without human input. | C | FG-18, #43 |
| FR-44 | Classic-vs-custom game modes as rule toggles. | Toggling a rule changes behaviour without a rebuild. | C | FG-21, #46 |
| FR-45 † | A match in progress survives a page reload. | Reloading mid-match restores the board, hands and active player. | C | — |

---

## 2 Non-functional requirements

| ID | Requirement | Acceptance criterion | MoSCoW | Traces to |
| --- | --- | --- | --- | --- |
| NFR-01 | `core/` imports nothing from `state/` or `ui/`; `ui/` mutates state only by dispatching into `state/`. | Unit tests for `core/` run with no DOM environment configured. | M | NFG-01 |
| NFR-02 | No source, test or config file exceeds 300 lines. | Every file under `src/` and `tests/` is at or below the limit. | M | NFG-02 |
| NFR-03 | No user-facing string is hardcoded; both `de` and `en` are complete. | The two locale files have identical key sets, and no literal user-facing string exists in `src/`. | M | NFG-03 |
| NFR-04 | Runtime dependencies are limited to `jquery` and `i18next`; no TypeScript. | `package.json` lists no other runtime dependency and no `.ts` file exists. | M | NFG-04 |
| NFR-05 | At least 80 % line coverage in `src/core/` and `src/state/`. | `npm run test:coverage` reports ≥ 80 % lines for both directories. | M | NFG-05 |
| NFR-06 | The game runs from a static production build with no backend. | `npm run build` output is playable when served as static files. | M | NFG-06 |
| NFR-07 | Every change carries its prompt log entry, chapter-note facts, changelog entry and tests in the same commit. | Reviewable in the diff of each commit. | M | NFG-07 |
| NFR-08 | Game state that determines legal moves is derivable from what is on screen. | A playtester can state why a move was refused without being told. | M | NFG-08 |
| NFR-09 † | The RNG used for dice rolls and card draws is injectable, so tests are deterministic. | A test supplies a fixed sequence and asserts an exact board state. | M | NFG-05 |
| NFR-10 † | Supported: current and previous major versions of Chrome, Firefox and Edge on desktop. Mobile and tablet are **out of scope for the MVP**. | The E2E suite passes on the named desktop browsers. | S | NFG-06 |
| NFR-11 † | A player action produces visible feedback within 100 ms. No frame-rate target is set, since the game is turn-based. | Measured on the reference machine during the buffer-sprint playtest. | S | NFG-08 |
| NFR-12 † | Players are distinguishable **without relying on colour alone**: shape, pattern or label as well. | A greyscale screenshot still identifies each player's pawns. | S | — |

---

## 3 MoSCoW analysis

### 3.1 Distribution

| Priority | Functional | Non-functional | Total |
| --- | --- | --- | --- |
| Must have | 30 | 9 | 39 |
| Should have | 7 | 3 | 10 |
| Could have | 7 | 0 | 7 |
| Won't have (this time) | 1 | 0 | 1 |
| **Total** | **45** | **12** | **57** |

### 3.2 What the distribution says

**Roughly two thirds of the requirements are `must have`, which is high.** The common rule of thumb
for MoSCoW is that must-haves should be well under half, precisely so the remainder can absorb a
schedule overrun. The reason here is structural rather than sloppy prioritisation: the MVP is a
*playable game*, and a game with any of its rules missing is not partially playable, it is unplayable.
FR-09 through FR-14 cannot be dropped individually; drop one and no match can be completed.

The honest consequence is that **this project's schedule buffer is not in the must-have list.** It
is in the 17 should- and could-haves, and in the four extended features (FR-42–FR-45), which is
thinner cover than MoSCoW normally assumes. That is a risk to name in the report rather than a flaw
to hide: it follows directly from building a rule-complete game in 8 weeks, and it is the same
trade-off the 2D decision was made against. See
[Utility-Value-Analysis.md](Utility-Value-Analysis.md).

### 3.3 Drop order if the schedule slips

Stated in advance, so that cutting scope mid-sprint is a decision that was already made rather than
one taken under pressure:

1. **Could-haves first**, in this order: FR-40 and FR-45 (no gameplay impact), FR-15 (safe squares,
   the MVP already assumes none), then FR-29, FR-30, FR-43, FR-44.
2. **Should-haves next**, keeping FR-35 (rules screen) and NFR-12 (colour-independent players) for
   last, since both are preconditions for the buffer-sprint playtest with people who get no
   instructions, which is where the usability evidence for the report comes from.
3. **FR-42 (online multiplayer) is the single largest cut available** and the one most likely to be
   taken. It is already `should have` on the backlog, and the one-pager named multiplayer as a risk
   for *both* candidate stacks before either was chosen.
4. **No must-have is droppable** without the deliverable ceasing to be a game. If must-haves cannot
   be finished, the correct response is a scope conversation with the Product Owner, not a silent cut.

### 3.4 Sprint alignment

Sprint plan from [01-Github-Project.md](01-Github-Project.md), mapped to requirement blocks:

| Sprint | Requirements |
| --- | --- |
| Sprint 1: core gameplay | FR-01 – FR-15, NFR-01, NFR-09 |
| Sprint 2: dice pool, skill cards, multiplayer | FR-16 – FR-30, FR-42 |
| Sprint 3: polish, art, audio | FR-31 – FR-41, NFR-03, NFR-10 – NFR-12 |
| Buffer: playtest and presentation | NFR-05, NFR-08, NFR-11 verified |

**Mismatch worth flagging:** the Sprint 1 plan names a "standard 1–6 dice roll", but FR-09 makes
leaving the start area depend on the chosen die's maximum. Building Sprint 1 against a fixed D6 and
replacing it in Sprint 2 means writing the leaving rule twice. Implementing FR-16 – FR-21 far enough
to supply a die in Sprint 1 avoids that.

---

## 4 Traceability

| Backlog epic | Requirements |
| --- | --- |
| #36 Core Game Engine & Board | FR-01 – FR-15 |
| #37 Enhanced Dice Pool System | FR-16 – FR-21 |
| #38 Skill Cards Mechanics | FR-22 – FR-30 |
| #39 UI / UX, Audio & Game State | FR-31 – FR-41 |
| #42 – #46 (extended) | FR-42 – FR-45 |
| No epic: applies to all work | NFR-01 – NFR-12 |

---

## 5 Open decisions the Product Owner has to take

Every item below is a **†** requirement that changes how the game plays. They are written as
proposals so that implementation is not blocked, but each is a real decision and none of them is
recorded anywhere in the existing documents.

> **Updated 2026-08-22, issue #22.** All eight are now **written out as rules** in section 6 of
> [Game-Design-Document.md](Game-Design-Document.md), each with its reason and its rejected
> alternatives, and the sign-off table in section 9 of that document is where the Product Owner
> confirms or overrides them. The sentence "none of them is recorded anywhere" above described the
> state before that document existed and is kept as the record of it. What is still open is the
> *sign-off*, not the rule: implementation follows the game design document provisionally, and an
> override changes that document and this section, not the code first.

- **FR-12, landing on your own pawn.** Proposed: illegal. Alternatives in common Ludo variants:
  stacking (two pawns share a square) or blocking (the pair blocks opponents entirely). Blocking is
  the most interesting and the most work, because it changes the legal-move calculation for everyone.
- **FR-13, exact count to enter home.** Proposed: exact count required, overshoot illegal. The
  alternative is bouncing back from the home square. With dice up to D20 this rule fires constantly,
  so the choice materially changes how the game feels: it is not an edge case here.
- **FR-14, no legal move.** Proposed: pass the turn. Nothing in the rules covers this today, and
  with a D20 in hand it happens often.
- **FR-17, pool composition.** Which denominations, and how many copies of each. The one-pager says
  "D2–D20" and nothing more. Whether D2, D4, D6, D8, D10, D12, D20 or every integer from 2 to 20 is
  a balance decision, and it drives the whole probability argument in the report.
- **FR-22 and FR-27, the skill card economy.** *The rulebook never says how a player gets a skill
  card.* This is the single largest hole in the specification: without a draw rule and a hand limit,
  the Skill Card Pool has no defined behaviour at all. Needed before Sprint 2 planning.
- **FR-25, the reaction window.** Reactions are the only mechanic that interrupts the turn
  sequence, so this is a requirement on the turn manager, not on the cards. It should be settled
  before the turn manager is built in Sprint 1, not after.
- **FR-37, the resource/energy system.** [01-Github-Project.md](01-Github-Project.md) plans it for
  Sprint 2 and issue #35 is titled *Game HUD & Resource Display*, but no rule for it exists in the
  one-pager or anywhere else. It is marked `W`, *won't have this time*, on the grounds that an
  unspecified mechanic cannot be built. If the Product Owner wants it, it needs rules first and the
  priority changes.
- **NFR-12, colour-independent player distinction.** Colour is the primary way players are told
  apart in Ludo, which makes this a real question for this game rather than a generic accessibility
  checkbox. Per [CLAUDE.md](../../CLAUDE.md) the visual solution belongs to Claude Design; this
  specification only states the requirement.

---

## 6 Known gaps in this specification

- **No requirement is verified yet.** Every acceptance criterion above describes a check that will be
  possible once the code exists. None has been run.
- **The acceptance criteria are not on the issues.** They live here, and the 47 backlog issues still
  have empty bodies. Either the criteria get copied onto the issues or the issues link here; until
  one of the two happens, the board still prioritises titles.
- **No effort estimate.** Priority is not cost. Issue #16 *Effort Estimation* and the missing Story
  Points field on the board both have to land before the drop order in section 3.3 can be weighed
  against what each cut actually saves.
- **FR-42 (online multiplayer) has one acceptance criterion and no specification.** It is the largest
  single item in the backlog and is described here in one line, which is honest about how little has
  been decided, not a claim that it is understood.
