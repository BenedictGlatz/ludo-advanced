# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `CLAUDE.md` defining the tech stack, architecture layering, testing, Git and AI prompt log conventions
- `README.md` with project overview, setup instructions, scripts and contribution guidelines
- This changelog
- AI prompt log under `00-Meta/AI-Prompts/<github-username>/YYYY-MM-DD.json`
- Living documentation notes under `00-Meta/Documentation/`: a steering index, 13 chapter notes for the final
  project report, a project journal for decisions and challenges, a sprint log for planned versus delivered
  scope, an abbreviation list, and two adapted reference documents on report structure and writing style
- Mandatory per-change steps in `CLAUDE.md`, making the prompt log, documentation notes, changelog and tests part
  of the same commit as the change itself
- SMART analysis of the project goals in `00-Meta/Project-Management/SMART-Analysis.md`: one overall goal plus one
  sub-goal per must-have epic (#36–#39), each with a deadline taken from the board's sprint markers and measurable
  criteria stated as checks against artefacts, plus a section naming what still has to exist before those criteria
  can be read
- Feasibility study in `00-Meta/Project-Management/Feasibility-Study.md`: technical, schedule,
  personnel/organisational, economic and legal feasibility, each with its own verdict, and a conditional Go whose
  conditions and precondition (the AI toolchain) are named explicitly
- `00-Meta/Project-Management/Functional-and-Non-Functional-Goals.md`: the project's goal catalogue, 21 functional
  goals traced to the backlog epics and 8 non-functional goals derived from the hard constraints, each with its
  source, its reason and how it is verified
- `00-Meta/Project-Management/System-Architecture.md`: the layer diagram and the turn sequence diagram as Mermaid
  figures, a module inventory for `core/`, `state/` and `ui/` with the requirement ids each module owns, the data
  flow from DOM event to re-render, and the reasons for the layering with the rejected alternatives named
- `00-Meta/Project-Management/Game-Design-Document.md`: the rulebook of Ludo Advanced. Board topology as exact
  numbers (52 shared track squares, 5 home column squares, 58 steps from start area to home), the turn sequence as
  an 8-step state machine, the Dice Card Pool composition with its probability arithmetic, an 8-card MVP skill card
  catalogue with ids, the eight open gameplay rules written out with their rejected alternatives and a Product Owner
  sign-off table, and 13 win-condition and movement edge cases resolved
- `00-Meta/Project-Management/Effort-Estimation.md`: the open work sized in story points on a Fibonacci scale
  anchored on one named issue, covering the four implementation epics, the five extended features, the open
  documentation issues and three work items that carry no board issue at all, with totals per epic and per MoSCoW
  class, a capacity check against the weekdays left in Sprints 2 and 3, and the finding that the must-have set does
  not fit as scoped
- `00-Meta/Project-Management/Test-Plan-and-Quality-Strategy.md`: the test strategy across four levels with what
  each level cannot catch, the coverage floor and the reason it excludes `ui/`, 12 end-to-end flows mapped to
  requirement ids, one unit test case per rule edge case settled in the game design document, the injectable RNG as
  a testability requirement, the CI gates that do not exist yet, and **the project's first written Definition of
  Done** at issue, sprint and release level
- `00-Meta/Project-Management/Obligations-Book.md`: what will be built to satisfy the requirements. The system
  architecture cited rather than redrawn, a GUI inventory of nine screens plus two should-have ones with the
  requirement ids and backlog issue of each, the technology stack with its dependency policy and an empty version
  column until `package.json` exists, the platform committed from NFR-06 and NFR-10, and five known gaps including
  two screens that carry no backlog issue
- `00-Meta/Project-Management/Roadmap-and-Gantt.md`: the project schedule as a Mermaid Gantt chart, with
  the measured configuration of the board's Roadmap view, the three of its properties the GitHub API does
  not expose, and the finding that dates are set on 11 of 64 board items so the view renders 4 bars and 7
  dots. Registered as Figure 5, with Figure 6 reserved for the board screenshot
- `00-Meta/Project-Management/Project-Plan.md`: the project plan for time, resources and risks. Five
  checkable milestones, the decision that no buffer sprint is created and that the closing work is a dated
  window inside Sprint 3 behind a 2026-09-11 feature freeze, the decision that there is no dedicated Scrum
  Master, a work package dependency graph taken from the architecture, the critical path with the finding
  that only 32 points of work exist off it, a sprint assignment for the 27 previously unscheduled
  implementation issues, and the required rate corrected upward to 4.9 points per weekday
- Five risks created by the project plan added to `00-Meta/Project-Management/03-Risk-Analysis.md` as their
  own block, including the missed-feature-freeze row, which is the highest-rated risk in the register
- `00-Meta/Project-Management/Project-Structure-Plan.md`: the project structure plan (issue #17, pulled into
  Sprint 1 on 2026-08-22). Eight subprojects and the complete work package inventory, adopting the board's epic
  and sub-issue graph, placing all 47 board issues exactly once plus the three packages that have no issue, and
  carrying structure only: points, dates and owners stay in the documents that own them. The tree is registered
  as Figure 7
- `00-Meta/Project-Management/Requirements-Specification.md`: 45 functional and 12 non-functional requirements,
  each with an acceptance criterion and a MoSCoW priority, plus the MoSCoW analysis with a drop order agreed in
  advance and the eight gameplay decisions still owed by the Product Owner
- A **`Story Points`** number field on the GitHub Projects board, back-filled on the 25 open issues that
  `00-Meta/Project-Management/Effort-Estimation.md` sizes, 134 points in all. It was outstanding action 1 of that
  document and had been blocked since 2026-08-22 by the missing `project` token scope. Story-point velocity
  becomes producible from Sprint 2 onward; closed issues were deliberately left blank so that no sprint gets a
  retroactive estimate
- **The npm project.** `package.json` with the 11 scripts `CLAUDE.md` requires, plus `vite.config.js`,
  `eslint.config.js`, `.prettierrc`, `.prettierignore`, `vitest.config.js`, `playwright.config.js`,
  `.gitattributes`, `index.html`, the composition root `src/main.js`, and the `src/core`, `src/state`,
  `src/ui`, `src/ui/styles`, `src/i18n`, `tests/unit` and `tests/e2e` directories. Runtime dependencies are
  `jquery` 4.0.0 and `i18next` 26.4.0 only. This is the first commit in the repository that is not
  documentation
- Two ESLint rules that turn architecture prose into a failing build: `max-lines` at 300 over every
  JavaScript file (NFR-02, counting blank lines and comments so the limit cannot be met by deleting them),
  and `no-restricted-imports` plus `no-restricted-globals` over `src/core/**` and `src/state/**`, so a rules
  module that reaches for `state/`, `ui/`, jQuery, i18next or the DOM fails `npm run lint` rather than a code
  review. Both were verified by deliberately breaking them
- `scripts/docs-ai-index.js`, the generator behind `npm run docs:ai-index`. It reads every
  `00-Meta/AI-Prompts/*/*.json`, groups the entries into the six subsections of the AI index chapter, and
  fails loudly on an unknown `topic` or `use` instead of dropping the entry. It has not been run, because the
  prompt log is per machine and a run here would produce an incomplete chapter
- A toolchain smoke test, `tests/unit/smoke.test.js`, asserting `1 + 1 === 2`. It proves the runner works and
  nothing else, and it is called that rather than counted as coverage
- **`src/core/board.js`, the board topology and position arithmetic** (issue #26, FR-02 and FR-08). The
  52-square closed track, the entry and turn-off square per player, the region classifier over a pawn's
  58-step journey, the home column step number, and whether two pawns stand on the same physical square.
  Every number comes from section 2 of the game design document and two of them are derived rather than
  typed in, so the code and the rulebook cannot drift. Pure functions: no DOM, no state, no imports from
  any other layer
- `tests/unit/core/board.test.js`, mirroring the `src/` layout. Boundary cases at every region edge, plus
  three properties asserted exhaustively over their whole domain rather than at a sample point, because a
  claim about a board's topology is a claim about every position on it
- **`01-Design/`, the design handoff folder** (issue #3). A `README.md` describing the loop between Claude
  Code and Claude Design with both document templates, a `Handoff/` directory for numbered brief and spec
  pairs, and `assets/`. The reasoning lives here; the CSS itself lands in `src/ui/styles/`, because it is
  production code and every translation step from a design document into a stylesheet is a chance to drift
- **`01-Design/Handoff/01-brief-foundations-and-board.md`, the first design brief.** Screens S3 (board) and
  S6 (move hints and refusal) plus the colour, spacing and typography foundations; eight hard constraints
  each with its reason; the full DOM contract `ui/board-view.js` will produce, including the five states
  driven by data attributes; the board facts taken from the rulebook; **nine numbered open decisions D1 to
  D9**, each of which the spec must answer with a reason and a rejected alternative; the deliverables with
  their paths; and what is out of scope. It contains no colour, size or font of its own, which is the line
  `CLAUDE.md` draws between a technical interface and a design rule
- Two board issues that had never existed, both `must have` and both in Sprint 2: **#63 Project Bootstrap**
  (`package.json`, Vite, ESLint, Prettier, Vitest, Playwright, 5 points) and **#64 i18n Setup and the German and
  English Locale Files** (5 points). They are 10 of the 12 points section 3.6 of the effort estimation found
  invisible to the board; the remaining 2, the CI workflow, still have no issue
- **`src/core/pawns.js` and `src/core/capture.js`** (issue #29, FR-11). The pawn record
  `{ player, pawn, r }` and the queries over a list of them, plus capture resolution: landing exactly on a
  shared-track square held by an opponent sends that pawn back to `r = 0` and the arriving pawn holds the
  square. Capture in a home column, in a start area and at home need no rule, because the topology in
  `board.js` already makes them impossible to express
- Unit tests for both, including the capture rows of the rulebook's edge-case table
- **`src/core/movement.js`** (issue #28, FR-09, FR-10, FR-12, FR-13, FR-14). The legal-move set for a roll,
  and applying a chosen move. It returns the moves, a per-pawn reason for every pawn that cannot move, and
  one turn-level reason when nothing can move at all, so that a refusal can state its cause on screen
  (NFR-08). The reasons are i18next keys, never sentences
- **`src/core/win.js`** (FR-05). A player with all four pawns at `r = 58` has won and the match ends
  immediately; there is no second place in the MVP
- **`src/core/dice-source.js`** (FR-20, NFR-09). A die roll from an injected RNG, a seeded generator so the
  browser and the tests can share one, and a temporary single-card stand-in for the Dice Card Pool behind the
  interface the real pool (#37) will implement
- Unit tests for all of the above, including nine of the thirteen rows of the rulebook's edge-case table, one
  test each. The remaining four rows are skill-card rules and belong to issue #38
- `tests/helpers/fixtures.js`: a pawn-position builder and a scripted RNG shared by the unit tests, and later
  by the Playwright specs
- **The state layer** (issue #27, FR-01, FR-04, FR-05, FR-06, FR-07, FR-14, FR-18 to FR-21). `src/state/`
  with four modules: `game-state.js` holds the single state object and the only function that produces a
  new one, `turn-manager.js` the eight-step turn sequence from the rulebook, `intents.js` the four things
  `ui/` may ask for, and `match.js` start, restart and abandon
- Every state object is **deeply frozen**, so an assignment from `ui/` throws instead of being silently
  dropped. The layering rule holds even when somebody forgets it
- The **reaction window exists as a phase of the turn with nothing in it**, so that adding skill cards in
  issue #38 is filling a phase rather than reshaping the sequence
- A **complete match played end to end on a scripted RNG** as a unit test: 87 turns from the first draw to
  the win, asserted to an exact final state. This is the half of acceptance criterion SG1 that needs a
  whole match
- **i18n** (issue #64, FR-34, NFR-03). `src/i18n/index.js` boots i18next with German as the default and
  English as the fallback, and `locales/de.json` and `locales/en.json` carry the text. The refusal and
  rejection keys the rules already produced now resolve to sentences, and the language switches at runtime
- A test asserting the two locale files have identical key sets, use the same interpolation placeholders,
  contain no empty translation, and cover every key `core/` and `state/` can emit. That is NFR-03's
  acceptance criterion turned into a failing test

- **The design system** (issue #3, NFR-10, NFR-11, NFR-12). Design handoff 01 landed as five stylesheets in
  `src/ui/styles/`: `tokens.css` with every colour, size, font and duration as a CSS custom property on `:root`,
  `board.css` and `board-track.css` for the 11 by 11 grid and the 40 track fields, `pawn.css` for the pawn and its
  five states, and `refusal.css` for the move-refusal strip. Two skins, Picnic and Night In, follow the operating
  system or a `data-theme` attribute on `<html>`
- The reasoning behind the design system in `01-Design/Handoff/01-spec-foundations-and-board.md`: sixteen numbered
  decisions covering colour, the player identifier, board geometry, spacing, typography, board size, the five pawn
  and square states, motion, the refusal region, pawn positioning, keyboard focus, reduced motion, contrast and
  dark mode, each with its reason and at least one named rejected alternative
- Two players now sit **opposite each other, on seats 0 and 2**, rather than side by side. `core/board.js` gained
  `seatsFor(playerCount)`, and a player number is a seat number everywhere: a two-player match has no seat 1
- **The game is playable** (issue #62). `src/ui/board-view.js` renders the board out of state, `move-hints.js`
  highlights the legal moves and shows the refusal reason, `events.js` turns clicks into intents, `game-loop.js`
  drives the turn, and `main.js` wires it all together. 2 to 4 players take turns hot-seat, pawns leave the yard
  on the die's maximum, move along the 40-square track, capture opponents and fill their house to win
- **The pawn click is the only control.** Picking a dice card happens automatically, because the stand-in pool
  holds one card, and the turn hands over by itself once the move has animated or the refusal has been read.
  The first click on a pawn selects it and shows where it would land; the second plays the move
- `?seed=42` fixes the dice so a match replays identically, `?players=2` picks the seat count and `?fast=1`
  shortens the pauses between turns. All three are read only by the composition root
- Seven Playwright end-to-end specs covering the board, leaving the start area, advancing, capture, a turn with
  no legal move, a complete match ending in a win, and the NFR-12 greyscale check. They run against the
  production build in Chromium, Firefox and Edge
- `scripts/design-screenshots.js`, which captures the board at 2, 3 and 4 players, in the dark skin and in
  greyscale, into `01-Design/assets/` for the design handoff briefs
- **The real Dice Card Pool** (issue #30): twenty cards over seven denominations, two D2, three D4, four D6,
  four D8, three D10, two D12 and two D20. Three are drawn per turn without replacement, one is kept, and all
  three go back and are reshuffled at the end of the turn. There is no discard pile, so the pool is stationary.
  The composition is a single data table the rules read (FR-17), and the randomness is still injected from
  outside, so `?seed=42` replays a match card for card
- `data-die` on the board, holding the face count of the chosen card. It is what lets a test assert the rule
  FR-09 actually states, that leaving the start area needs the die's maximum, now that the maximum is no longer
  always six
- `npm run test:seeds`, which replays matches headlessly and prints the seeds the end-to-end suite plays on.
  The seeds used to be found by hand and the script that found them was never kept, so the first change to what
  the random generator is spent on made all five of them expire with no way to reproduce the search
- `npm run docs:dice-balance`, which derives how many turns a pawn needs per die, exactly, and then measures
  1200 real matches through the shipped rules to check the derivation. Section 5.2 of the game design document
  is now this command's output rather than arithmetic done by hand
- **Design handoff 03** (`01-Design/Handoff/03-brief-cards-and-hands.md`), asking for the card component, the
  dice hand (S4), the skill hand at rest (S5), the skill square on the board and the page shell that holds
  them all without scrolling (FR-31). Nine open decisions, D25 to D33
- The card artwork handoff, `01-Design/Handoff/Card artwork design planning/`. It is the only record of what
  the 29 cards are, the Product Owner picked the set out of it, and design handoff 03 references it by path
- **The eight skill fields** (issue #38, FR-22): four, seven, fourteen, seventeen, twenty-four, twenty-seven,
  thirty-four and thirty-seven of the forty shared track fields. A pawn that **lands** on one earns its owner
  an extra skill card; crossing one does nothing, because otherwise a D20 would collect several in a move and
  "take the biggest card" would be the only sensible choice. The field is then used up and reappears on a
  random other field, never on a player's entry field, never on a field another skill field is on, and never
  where it just was. The layout is generated from two offsets per player quarter, so every player meets a
  skill field at exactly the same points of their own journey. **Nothing is visible yet**: skill fields are
  meant to be purple and purple already marks a legal target field, which is open decision D27 of design
  handoff 03
- `data-skill-square` on the eight track fields that currently hand out a card, and `data-winner` on the
  board, holding the seat that won. Both are for the tests, and `data-winner` exists because the win spec had
  twice been repaired by copying a new seat number into it after a seed regeneration
- `src/state/freeze.js`, a generic deep freeze replacing the field-by-field one in `game-state.js`. The card
  work adds nine state fields, two of them nested two levels deep, and a freeze list that has to be edited
  for every new field leaves an array writable with no symptom the day somebody forgets a line
- The locale text split into `locales/<code>/ui.json` and `locales/<code>/cards.json`, merged into one
  i18next namespace at boot so that every existing `t("turn.end")` call is unchanged. Done ahead of the 29
  card titles and rules sentences, which are roughly four times as much text as the whole interface
- **The 29-card skill card catalogue** (issue #38, FR-26 and FR-28): 22 Action cards and 7 Reaction cards,
  two copies of each, so a 58-card pool. Split across `src/core/cards/`: the ten cards of artboard `6a`
  that need no new board concept, the nineteen of artboard `4a` that need five mechanics the game does not
  have yet, a shared vocabulary, and an assembly module that validates the whole list when it loads. Each
  entry says what a card is, when it may be played and what the player has to point at. **What a card
  does is not in it**: an effect is a separate function matched by the same id, and none exists yet
- **The player now picks which of the three drawn dice cards is rolled** (issue #31, FR-18 and FR-19). The three
  cards are dealt face up in a hand beside the board, any of them can be clicked or reached with the keyboard, and
  the chosen one shows its roll on a badge. Until now the view took the first of the three, so a choice the
  rulebook gives the player was being made for them
- `src/ui/card-view.js`, one card component behind every dice card, Action card and Reaction card, built once and
  updated by attribute. `src/ui/dice-hand-view.js` renders the three drawn cards and `src/ui/events.js` gained
  `bindDiceHandEvents`
- **The page is now the four-region layout FR-31 asks for**: board on the left, dice hand and skill hand stacked
  in a rail on the right, refusal strip across the foot, all visible at 1440 by 900 without scrolling. Below
  1344 px the regions stack and the page may scroll. The skill hand region is mounted and empty until issue #38
  draws a card into it
- Design specification 03 as `01-Design/Handoff/03-spec-cards-and-hands.md`, with `src/ui/styles/card.css`,
  `card-state.css` and `hand.css`, a real `app.css` replacing the placeholder Claude Code wrote, 32 new tokens,
  and the skill square finally visible as a teal diamond rather than as an attribute nothing styled
- Names for all seven dice denominations in both locales, plus the two tags every dice card carries: its range,
  and the number it needs to get a pawn out of the start area
- `tests/e2e/shell.spec.js`, four cases covering FR-31: the suite runs at the design resolution, the page does not
  scroll, all four regions sit inside the viewport, and below the breakpoint they stack. `tests/e2e/dice-hand.spec.js`,
  six cases covering the choice itself, including one that plays a whole turn from the keyboard alone
- **The closed skill card pool** (`src/core/skill-pool.js`, FR-22 and FR-27): the pool, one hand per seat
  and a discard pile, as pure functions over the arrays the game state holds. A hand holds at most 5
  cards and a draw for a full hand leaves the card in the pool. A played card goes to the discard pile,
  and an empty pool is refilled by shuffling the discard pile back in. Every one of the 58 cards is in
  exactly one of pool, hand or discard at every moment, which is checked after each of 400 steps in a test
- The 29 card names in both locales, plus the four category labels. **The names are the same in German
  and English on purpose**: they are memes, and a German "Aight Imma Head Out" is worse German than the
  English. The rules sentence of each card is deliberately absent and arrives with the card's effect
- Section 2.5 of the game design document, the skill fields as a board rule: where they start, why the
  layout is symmetric, why landing counts and crossing does not, and what a respawn excludes
- **The skill hand is playable** (issue #34, FR-23 to FR-26). Click a card and it either resolves at
  once or the game asks what to aim it at: one of your pawns, an opponent's, a square, a direction, a
  number, an opponent, or one of two options. Sixteen of the 29 cards need a target and two need two of
  them. Cancelling half way through costs nothing, because nothing is played until every target is in
- **The reaction window on screen**, with the thirty-second countdown FR-25 asks for and a Decline button.
  A window shuts the moment everybody has answered, without waiting out the clock
- **A prompt strip under the board** that asks whatever the game is waiting for: play a card or carry on,
  react or decline, or point at something. **It is the one thing on screen with no design specification
  behind it**: it composes existing tokens only, and what design handoff 04 still owes is written into
  the top of `src/ui/styles/prompt.css`
- `tests/e2e/skill-hand.spec.js`, eight cases covering the card flows a unit test cannot reach, including
  playing a card from the keyboard alone (NFR-08) and the page still fitting on one screen while the
  prompt is up
- **All 29 skill cards now have their rule** (issue #38, FR-26 and FR-28). The last twelve needed
  three mechanics the board did not have: a pawn can be moved without making a move (Yeet, Aight Imma
  Head Out, Let Him Cook, Ghost Mode, Uno Reverse), objects can sit on a square and either fire or block
  (Banana Peel, Oil Spill, It's Not That Deep, Big Ah Rock), and a card can hit a run of squares at once
  (Hyperbeam, Janky RPG, 67)
- **A trap fires when a pawn crosses it, not only when it lands on it.** A skill square is the opposite
  and only counts on a landing. Both are deliberate: a reward you can farm is broken, and a punishment
  you can jump over is not a punishment
- **A push backwards stops at your entry square and never reaches the start area.** Otherwise three cards
  would be cheaper substitutes for a capture, and capture is what the whole board is built around
- **A rules sentence for every one of the 29 cards, in both languages.** It describes the rule that was
  implemented, which differs from the artwork's wording on seven cards. Provisional copy: the Product
  Owner owns the final wording
- The nineteen sub-kind labels the artwork prints under a card's banner, in both languages
- **Skill cards can be played, and 17 of the 29 have their rule** (issue #38, FR-23 to FR-26). The
  action phase accepts an Action card, and an opponent can answer it, the roll, or an announced capture
  with a Reaction card. The five that change the roll (Critical Success, Critical Failure, Angel Die,
  Devil Die, Speedrun Any%), the five that act on cards (Pot of Greed, Double Dip, No Take-Backsies,
  Nühü, Tax Fraud), FR FR, and the six that leave something on a pawn (Rock, Lock In, Built Different,
  Ragebait, Hold Pawn, The Purge). The hand is not clickable yet, which is issue #34
- **The reaction window** (FR-24, FR-25). It opens at three moments and only when somebody could
  actually use it: a window that opened on every roll would put a countdown in front of a game whose
  ordinary turn is two clicks. Everything played into it resolves when it shuts, in the order it was
  played, which is what lets Nühü cancel a card without anything having to be undone
- One card per player per turn, and Double Dip raising that to two for the player who plays it
- **The action phase**: a turn now stops after the dice card is chosen and before the die is rolled, so
  the active player can play a skill card there (issue #38, FR-23). The player is carried straight
  through it for now, because the skill hand is not clickable yet. The rule it exists for is the Product
  Owner's: skill cards come **after** the die is known, so choosing whether to buff a D20 or a D4 is a
  real decision
- **A skill card is drawn at the start of every turn** (FR-23), and a second one when a pawn lands on a
  skill square (FR-22). The 58-card pool is shuffled when the match starts. The cards are in a hand
  nobody can play yet, which is issue #34
- **Declaring a move no longer applies it.** A committed move waits in the reaction window, and the pawn
  moves when the window closes. Nothing can be played into that window yet, so it opens and closes in
  one tick, and the split is what makes a reaction to an announced capture possible at all (FR-25)
- **The rules the skill cards stand on** (issue #38), five new modules in `src/core/`, none of which
  mentions a card by name. The roll is now an ordered chain of modifiers rather than a single number, so
  a card can add a die, subtract one, roll twice for the better or worse of two, multiply the result or
  name it outright, and the order those apply in is fixed and tested. Statuses last a number of turns,
  with "2 rounds" converted to turns once so a card cannot quietly mean something different at a
  different table size. Traps and blockers sit on the shared squares. And movement can now be asked
  about the squares a move **passes over**, which it never needed before
- **Every card shows its illustration** (issue #39). All 36 drawings, 29 skill cards plus one per dice
  denomination from D2 to D20, now appear in the card's art window. They had existed only inside the
  Claude Design artboard, so the window had been a framed empty box on every card since it was built.
  `npm run assets:card-art` extracts them into `src/ui/art/`, matches each drawing to its card by title,
  and refuses to write anything at all if a drawing matches no card or a card has no drawing
- **Design handoff 04** (`01-Design/Handoff/04-brief-hud-menus-and-handover.md`), asking for the HUD
  (S7), the main menu (S1), match setup (S2), pause (S8), win (S9) and a new handover screen for the
  moment between two turns at a shared screen. Eight open decisions, D35 to D42, plus the eleven items
  that were left open by handoffs 02 and 03 and had been drifting since
- **Design handoff 06** (`01-Design/Handoff/06-brief-pawn-mark.md`), asking for the seat's shape on the
  pawn itself, which is where NFR-12 is measured and the one place the shape is not yet. Three open
  decisions, D48 to D50. Every pawn now carries an empty mark element for the stylesheet to fill, so
  nothing is visible until the spec lands. The work order to Claude Design puts this brief ahead of
  handoff 05
- **Players are named on screen** (issue #39): "Spieler 2 (Grün)", the number counting from 1 in seat
  order and the colour naming the pieces on the board. German and English
- **The game says whose turn it is** (issue #35). A sentence in the top bar, "Spieler 1 (Rot) ist am
  Zug", which is what the game had never said in words: the board marked the active player with a
  colour halo and dimmed pawns and nothing else, so a player who had not worked out which colour was
  theirs had no way to tell
- **A HUD showing each player's progress** (issue #35, FR-36): pawns in the start area, out on the
  track and home, plus how many skill cards that player holds, one row per player. The three pawn
  counts always add up to four, and the fourth number is public because an opponent's hand size was
  made public. No resource or energy display: FR-37 has no rule behind it and stays out of scope
- **A German/English switch that works during a match** (FR-34, a must-have that had no issue of its
  own). One button in the top bar showing the language you would switch to. Every visible string
  changes, including the cards in hand
- **A main menu, a match setup, a pause screen and a win screen** (issue #41, FR-01, FR-05, FR-06,
  FR-07, FR-38). The game opens on a menu, asks how many people are playing, and can be paused at any
  point in a turn, given up, or restarted after a win, all without reloading the page. Opening the game
  with a player count in the address bar still starts a match straight away
- **A handover screen between two turns.** It names the next player and waits for them to say the screen
  has been passed on. It exists because an opponent's skill cards are secret: at one shared screen that
  is only true if something covers the screen while it changes hands. The turn used to change by itself
  after a third of a second
- **A dice card pool overview** (issue #30, FR-16, FR-17). A **Kartenpool** button in the top bar, reachable
  at any point in a turn, opens a screen showing all seven dice card denominations, how many copies of each
  the pool holds, and how many of the twenty cards are face down right now. It is there because keeping one
  of three dealt cards is only a decision if you can see what the twenty behind them look like: a D2 gets a
  pawn out of the start area half the time and a D20 one time in twenty. The match stops while the screen is
  open and carries on where it left off
- **A continuous integration workflow** (issue #68), `.github/workflows/build-check.yml`. Every pull
  request into `dev` or `main` now runs the five quality gates by itself: ESLint, the unit test suite,
  the coverage run against the 80 % floor for `src/core/` and `src/state/`, the production build, and
  the end-to-end suite in Chromium and Firefox. Nothing about the gates changed, only who runs them:
  until now every one of them ran because somebody remembered. The Edge run of the browser matrix stays
  a local check, because it drives the system browser and the runner has no Edge, and the check reports
  on a pull request without blocking the merge until a branch-protection ruleset is configured
- **You can read a card in your own hand by pointing at it** (design handoff 10, D66 and D67). Rest the
  mouse on an Action or Reaction card and it grows to the size the pool overview shows it at, with its
  rules paragraph readable. Move the pointer away and it goes back into the row. It works for every card
  you are holding, including the ones you cannot play right now, which are usually the ones you most want
  to read, and it works from the keyboard too: every card in the hand is reachable with Tab now, and the
  card you land on opens the same way. The row itself no longer shuffles sideways when the pointer
  crosses it

### Changed

- **Banana Peel no longer sends a pawn home. It stuns it** (issue #45, FR-30). The pawn that walks into
  one finishes its move and then loses its next turn, which is what the card in your hand has always
  said and what the rulebook has always said. Only that pawn sits out: you still move your other three.
  **The game gets easier as a result**, and that is a deliberate trade: sending a pawn home cost a full
  lap, which made the cheapest trap in the game as harsh as a capture
- **It's Not That Deep pushes you back one square, not a D6** (issue #45, FR-30). The card is named
  after how small it is and it now behaves that way. It rolls no die at all, so the outcome is something
  you can plan around
- **It's Not That Deep also protects the ground around it**, which is the half of the card that was
  printed on it but had never been built. While it lies there, an opponent's offensive card aimed within
  three squares of it does nothing, which is seven squares of cover. The card is still spent: you could
  not see the trap, and that is what the trap is for. The game says which card was cancelled, because
  otherwise it looks exactly like a bug
- **Big Ah Rock lasts three rounds instead of two, and it now knocks a pawn back** (issue #45, FR-30).
  Dropping the boulder also shoves the nearest enemy pawn behind it three squares backwards, which is
  the half of the card that was printed on it but had never been built. A pawn already standing on the
  square the boulder lands on is still not moved
- **A trap can now set off another trap.** If a trap pushes your pawn and the push crosses a second
  trap, that one fires too, up to a limit of six in one chain. Two consequences a player will notice:
  a push that lands on an opponent now **captures** it, and a push is **stopped** by a boulder instead
  of sliding through it
- **A trap card now offers only the squares it may actually be placed on** (issue #45, FR-30). Four of
  the forty squares were never sensible targets and one of them was destructive: laying a trap on a
  square that already held one silently deleted the first, which no card is supposed to be able to do.
  A trap can no longer go on an occupied square, on a square a pawn is standing on, or on one of the
  four squares where a player enters the track. Janky RPG is unaffected, because it fires at a square
  rather than occupying one, so aiming it at an occupied square is the whole point of it
- **Traps fire on any movement, not just on your dice move** (FR-30). Yeet, Aight Imma Head Out and Let
  Him Cook can all push a pawn onto a trap now, which is what Yeet's own card text promises. A captured
  pawn on its way home still sets off nothing
- **The game now tells you when a trap goes off**, and who laid it (issue #45, FR-30). This matters most
  for Banana Peel, which does not move your pawn at all: without a message the pawn would arrive exactly
  where you aimed it and then silently be unable to move next turn. The message stays on screen for the
  same four seconds a refusal does, so the handover screen cannot cover it before it is read. It shipped
  in the orange the game uses for "you cannot do that", which was the wrong colour for something you did
  not do wrong; **design handoff 07 fixed that**, and the message now has its own quieter voice
- **Every trap and blocker is public** (issue #45, FR-30). Whoever lays one, everyone at the table can see
  where it is and whose it is. The rulebook's "face-down" It's Not That Deep is gone: four people share
  one screen, so a hidden trap was never really hidden, and a trap nobody can see cannot be avoided,
  which is the only thing that makes its protective aura a choice rather than a fine
- **Traps, blockers, the protected zone and two pawn conditions are now drawn on the board** (design
  handoff 07). Until now all of it was in the page and none of it was visible. What a player sees:
  - **A trap is a small chip in the bottom-left corner of the field**, in the colour of whoever laid it
    and carrying that player's shape, so you can tell your own traps from everybody else's at a glance.
    That matters because a trap never goes off under a pawn of the player who laid it. The three kinds of
    trap look the same on purpose: at that size, next to everything else a field can be carrying, the
    thing worth reading is that something is there and whose it is
  - **A Big Ah Rock is the same object grown to cover the field, with square corners.** A trap is a small
    thing lying on the path; a blocker is the path being gone, and the size difference says it with no
    legend needed
  - **The seven fields an It's Not That Deep protects are hatched**, so you can see the zone your
    offensive card would be swallowed by before you spend it
  - **A stunned pawn tips over and goes dull.** It is the only piece on the board that is not standing
    upright, which is what makes a Banana Peel visible at all: it does not move your pawn, so the tipped
    piece and the message are the only evidence that your turn was taken away
  - **A pawn that slid on an Oil Spill wears a small tag** on its shoulder, as a reminder of why the
    field it stopped on handed it no card
  Two things handoff 07 designed are **not** visible yet, and both are the same conflict: a field you can
  click keeps the colour it had, and a field you have tabbed to still gives no sign of it. An earlier
  stylesheet answers both questions and overrides the new one, so the two answers have gone back to the
  designer as D61. Reaching a field with the keyboard works; seeing which one you have reached does not
- **A trap set off by a card now holds the turn for two seconds** (design handoff 07). A trap sprung by
  your dice move already stayed on screen until the handover; one sprung by a card resolved in the middle
  of your turn and the game carried straight on, so the message could be gone before you read it. Two
  seconds rather than the four a refusal gets, because a refusal follows your own click and this does not.
  Playing another card or pressing Skip ends the wait early
- **A square on the board can now be picked with the keyboard alone** (NFR-08). No square was reachable
  from the keyboard at all, which nobody noticed while a single card in 29 pointed at one. Four of the
  five that do are the trap cards, so a keyboard player could not have played a trap
- **Every player now has a shape as well as a colour, and the shape is on the pieces** (design handoff 06,
  NFR-12). Each seat's pawns carry a small ink badge: a circle, a triangle, a square or a diamond,
  matching the shape that seat already had on the scoreboard and in the top bar. It sits low on the piece
  so the two eyes stay where they were, and it travels with the pawn through every state. The point is a
  board you can still read when you cannot tell red from green, or on a black and white printout
- **The dice card pool overview is drawn by its designed stylesheet** (design handoff 05). What a player
  notices: each of the seven cards is now drawn as the little stack of copies the pool actually holds, so
  a W6 visibly sits on a thicker pile than a W20 and the weighting of the pool can be seen rather than
  counted. The cards are bigger, the short second row is centred under the first, the word "Würfelkarte"
  is gone from cards on a screen already titled with it, and the copy count is the one tag that stands out
- **The keyboard skips cards it cannot play.** Tabbing across the pool overview used to stop on all seven
  cards before reaching the button that closes it, and pressing Enter on them did nothing
- **The game has a designed look for the whole of its interface** (design handoff 04). The four regions that
  were drawn by placeholder stylesheets are drawn by real ones now: the top bar, the scoreboard, the prompt
  strip and the five screens. What a player notices, in rough order: the reaction countdown is a ring that
  empties and turns orange for the last eight seconds instead of a bare number; each seat has a **shape** as
  well as a colour, a circle, triangle, square or diamond, so the scoreboard and the top bar say whose turn
  it is without relying on being able to tell red from green; the pause and win screens let you read the
  board through them, while the menu and the handover do not; an empty slot in the skill hand is now the
  dashed outline of where a card would go rather than a blank card; and the win screen is where winning is
  announced
- **The board and the cards in hand are back to full size** (design handoff 04, FR-31). They had been
  shrunk about nine per cent to make room for the scoreboard row. The room came out of the foot of the page
  instead: the refusal message now appears over the bottom of the board and the prompt strip sits under the
  skill hand, so neither holds an empty strip across the page any more. Measured at 1440 by 900, the layout
  uses 882 pixels of 900 in the worst case
- **Winning is announced once, on the win screen, and no longer in the orange strip under the board.** That
  strip is the colour the game uses for "you cannot do that", which is the wrong colour for "you won", and
  the message was being shown in two places at the same time
- **A two-player match is played by Spieler 1 and Spieler 2** (issue #39). It used to be played by
  Spieler 1 and Spieler 3, because two players sit opposite each other on seats 0 and 2 and every label
  was built as the seat number plus one. Four-player matches were unaffected, which is why nobody had
  noticed. The seat number is still what the markup, the pawn colours and every rule use
- **A turn now waits for the player in three places rather than two**: the dice card, the action phase,
  and the pawn. The action phase is skipped automatically when the player holds nothing playable, so it
  never stalls a turn
- `ui/timers.js` replaced the game loop's single timer slot. With a countdown running beside the handover
  pause, whichever was scheduled second would have silently cancelled the first
- **Leaving the start area now needs the die's highest number or better, not exactly that number**
  (FR-09, issue #38). Nothing changes for a match played without skill cards, because a plain roll can
  never go above the maximum. It changes everything for a card that adds to the roll: under the old
  wording a buff made leaving the start area **impossible**, so a card meant to help was a trap
- **A roll can now come out at 0**, which happens when a card subtracts more than the die produced.
  Nobody moves that turn and the board says so. The roll used to be rejected as an invalid number, which
  would have turned one card into a crash
- The intent list `ui/` may dispatch went from four entries to seven. `choose-die` got **smaller**: it
  used to pick the card and roll it in one step, and now stops at the action phase. `commit-move` got
  smaller too, and `skip-action`, `roll-die` and `close-window` are the three new ones
- **The end-to-end seeds were repinned for the third time**, because starting a match now shuffles a
  58-card skill pool and every turn draws from it, so every seed played a different match. `npm run
  test:seeds` found the new ones and two of the five changed
- The per-pawn movement rules moved out of `src/core/movement.js` into `src/core/move-rules.js`.
  `movement.js` keeps the public API and everything that looks at a player's four pawns at once, and
  still exports the move kinds and refusal reasons from the same place, so no caller changed

- **The board topology changed from 52 track squares to 40** (issues #3 and #26), following the first design
  handoff. The player offset is 10 instead of 13, entry squares are 0 / 10 / 20 / 30, turn-off squares are
  39 / 9 / 19 / 29, and a pawn's journey is 44 steps instead of 58. Section 2 of the game design document was
  rewritten in the same commit and gained a section 2.4 explaining why the earlier decision, which had explicitly
  rejected a 40-square track, was overturned
- **A player's home column is now a four-square house with no separate home area** (FR-05). It holds exactly one
  pawn per square, so a player wins when the house is full. `REGION.HOME` was removed, and the rule that stops two
  pawns sharing a house square is FR-12, which already existed
- The dice pool composition and balance arithmetic in section 5 of the game design document are **knowingly out of
  date**: they were derived against a 58-step journey. The section carries a note saying so and pointing at issue
  #37, where the pool should be re-derived against 44 rather than adjusted
- Row 8 of the Product Owner sign-off table in the game design document now records a **question rather than a
  rule**: design handoff 01 tells players apart by colour alone, so NFR-12's "second, non-colour identifier" is not
  answered as written and only its narrower greyscale acceptance criterion is being aimed at
- The 40 track field grid placements were split out of `src/ui/styles/board.css` into `board-track.css`. The
  delivered file was 248 lines and inside the 300-line limit; running the project's own Prettier over it expanded
  every single-line rule and took it to 407
- The yards, the houses and the pawn slots were split out of `src/ui/styles/board.css` into `board-regions.css`,
  at the seam between a field and a region that holds fields. Same cause as the split above and the second time it
  has happened: design specification 03 delivered `board.css` at 269 lines, Prettier expanded it to 429
- `--board-size` is now `clamp(24rem, min(82vh, 44vw), 60rem)`, because the hand rail needs about half the width.
  `--cell` is derived from it, so any rule overriding one has to re-derive the other
- A turn no longer advances by itself from drawing to rolling. It waits in the `choose` phase for the player, the
  way it already waited in `act` for a pawn click
- Section 5 of `00-Meta/Project-Management/Obligations-Book.md` no longer says "No design specification exists",
  and points at `01-Design/` and `src/ui/styles/` instead. Screens S4, S5, S7 and the menus still have no design
- Prettier now uses `"quoteProps": "preserve"`, so an object key written with quotes keeps them. The default
  stripped the quotes from test fixture keys such as `"0.1"` while keeping them on `"0.0"`, which made
  coordinate keys read inconsistently

- AI prompt log entries now carry a `topic` and a `use` field, so the report's AI index chapter can be generated
  from the log rather than sorted by hand
- The truncated `## Documentation` section in `00-Meta/Project-Management/01-Github-Project.md` now points at the
  project journal instead of ending mid-sentence
- `00-Meta/AI-Prompts/` is now gitignored and kept locally per contributor instead of being committed; `CLAUDE.md`
  updated so the AI prompt log step is no longer part of the same commit as documentation notes, changelog and
  tests
- `00-Meta/Project-Management/00-One-Pager.md` rewritten as a one-page overview: the swallowed `TURN` heading and
  the typographic bullet characters fixed, the MVP boundary stated in one sentence, the board's sprint calendar and
  a question-to-document pointer table added, and the rules detail moved to the game design document so that only
  one document holds the rules
- The GitHub Projects board is now the single source of truth for sprint membership: `sprint-log.md` takes its
  planned scope from the board's `Sprint` field instead of the prose plan in `01-Github-Project.md`, and the
  Sprint 1 entry records the 13 documentation issues actually assigned to it, with the previously listed gameplay
  scope kept as superseded and unstarted
- Two risk rows in `00-Meta/Project-Management/03-Risk-Analysis.md` updated: *No velocity/burn-down data
  producible* re-rated from priority 4 to 3 now that story point estimates exist, with velocity and burn-down split
  apart because points fix only the first; *Test coverage discipline slips* deliberately left at 3 with only its
  mitigation extended, because a written test plan without CI does not lower the likelihood
- The Definition of Done condition in `Feasibility-Study.md` and its row in `SMART-Analysis.md` marked as met and
  annotated rather than deleted, so the sequence stays readable, with the adoption still named as outstanding
- Three contradictions carried across four documents resolved and recorded rather than left open: the buffer
  sprint and Sprint 3's length in `sprint-log.md`, the two disagreeing role tables in `00-index.md` and
  `notes/02-project-management.md`, and the sprint assignment of the implementation backlog. The superseded
  role table and prose sprint plan in `00-Meta/Project-Management/01-Github-Project.md` are annotated in
  place instead of deleted, and its malformed roles table now renders
- The *Sprint-plan vs. board-date contradiction* risk row re-rated from priority 4 to 3, its mitigation
  having been carried out, with the residual named as adoption rather than as decision
- Section 5.2 of `00-Meta/Project-Management/Effort-Estimation.md` revised: implementation has 15 weekdays
  rather than 19 once the closing window is in the calendar, printed next to the original figure
- Two negative findings from 2026-08-06 corrected in `notes/02-project-management.md` after the first full board
  read: `Status` is populated on all 64 items and `Sprint` on 20 of them. Story points and an Iteration field are
  still missing, so burn-down charts remain impossible and only an issue-count velocity is available
- `Start Date` and `End Date` back-filled on the 14 closed board items that carried none (the 13 Sprint 1 issues
  plus #17), each set to the day its delivering commit was authored rather than to the issue's close date, so the
  Roadmap view now renders 4 bars and 21 dots instead of 4 bars and 7 dots. `00-Meta/Project-Management/Roadmap-and-Gantt.md`
  section 2.1 records the measurement and the per-issue dates; the `project` token scope that blocked this, the
  `Story Points` field and the `Sprint` assignment was granted on the same day
- `CLAUDE.md` now opens with three sections on how answers and documentation are written: *Communication*, which
  states that the readers are 4th semester students, plus *Tone & Readability* and *Structure & Scannability*.
  They govern the register of the prose, while the existing *Writing style* section keeps governing the em dash
  ban. A typo in the *Communication* paragraph was fixed in the same commit
- Board issue **#28** split into **#28 *Pawn Movement Rules*** (5 points, the legal-move set in `core/`) and the
  new **#62 *Pawn Rendering & Movement Animation*** (3 points, the view half). The split is point-neutral and
  was outstanding action 3 of `00-Meta/Project-Management/Effort-Estimation.md`: the rule half blocks four other
  issues and the animation half blocks nothing, so holding them together put the animation on the critical path
- `Sprint 2` set on **#26, #27, #28, #29** and on the three issues created the same day, so the epic #36 tree is
  the first one whose children are all in the same sprint as their epic. Sprint 2 now reads 17 issues and 72
  story points on the board
- **How the board is drawn is decided: real DOM elements laid out by CSS Grid**, with SVG and `<canvas>` as the
  named rejected alternatives. Section 6 of `System-Architecture.md` and section 2.4 of `Obligations-Book.md`
  had both deferred this to Claude Design as a design rule; the deferral is corrected in place rather than
  deleted, because a rendering technology decides what a stylesheet can address, not what anything looks like
- The version column of the technology table in `00-Meta/Project-Management/Obligations-Book.md` section 3.1 is
  filled from the real `package.json`, having been deliberately empty since it was written
- **A match now runs on the twenty-card Dice Card Pool instead of one fixed six-sided die** (issue #30). The
  swap was one default argument in `state/match.js` and one call in `src/main.js`, because every rule was
  already written against the die's maximum rather than against a six. `fixedDieSource` stays in the code for
  tests that need a predictable die
- **All five end-to-end seeds were re-derived**, because the pool draws from the same random generator the die
  rolls from, so every seed played a different match than the specs were written against. `leavesStartAtOnce`
  4 → 1, `advancesEarly` 4 → 1, `capturesEarly` 120 → 9, `passesOnTurnOne` 1 → 2, `winsQuickest` 120 → 200.
  The quickest win is now turn 80 instead of turn 101, and it is seat 2 rather than seat 0
- Two end-to-end specs stopped asserting the stand-in and started asserting the rule. `pawn-leaves-start.spec.js`
  checked `roll === 6`, which was only true while the die was always a D6, and now checks that the roll equals
  the chosen die's maximum. `win.spec.js` assumed seat 0 wins, which was a property of the old seed
- ESLint ignores `01-Design/`. Claude Design delivers a generated canvas runtime with every handoff, marked
  "do not edit" by the tool that wrote it, and the card artwork handoff took `npm run lint` from clean to 306
  errors none of which were in project code. Nothing under `01-Design/` is built or shipped
- **Section 5.2 of the game design document is re-derived against the 44-step journey** and no longer carries
  its "out of date, knowingly left standing" banner. The composition did not change. What changed is one
  conclusion, that the cheapest die for crossing the track is the D8 rather than the D10, and one omission that
  is now filled: the exact-count rule of section 6.2 costs a D20 **18.7 of its 22.8 travel turns**, which the
  old two-formula derivation could not show because neither formula knows how deep the house is. Sections
  2.3, 2.4, 5.1, 5.3 and 10 were updated to match, and section 5.3 was left alone on purpose, because a
  hypergeometric draw does not depend on how long the track is
- Section 10 of the game design document no longer claims that nothing in it is verified, which stopped being
  true on 2026-08-29. It now names which sections are implemented and under test and which are not
- **All five end-to-end seeds were re-derived for the second time in a week** (issue #38), because a used-up
  skill field draws from the same random generator the die rolls from. `capturesEarly` 9 → 95 and
  `winsQuickest` 200 → 225; the other three are unchanged. The quickest win is now turn 79 and it is seat 0.
  This time the fix was one command, `npm run test:seeds`, instead of rebuilding the script that finds them
- **`win.spec.js` no longer names the winning seat.** Which seat wins is a property of the seed, and the spec
  had failed twice for that reason. It now reads `data-winner` off the board and asserts the rule instead:
  the winner's four pawns fill the four house fields and the message names that seat
- `resolveReactions` and the `commit-move` intent take `deps`, because using up a skill field needs the
  injected randomness. `createGameState` and `startMatch` accept the skill field layout, defaulting to the
  real one, so a test that scripts an exact sequence of rolls can pin an empty board
- **Section 7 of the game design document is replaced.** The eight skill cards invented while writing that
  document are gone, and the 29 cards of the artwork take their place, in two tables split by how much new
  machinery each half needs. A third table names the six cards whose printed text the board model cannot
  express, with what is built instead and why. The old set and the argument it made about set size are
  quoted rather than deleted, because that argument is still unanswered: 29 cards is 29 rules and 29 tests
  against 8
- **Section 6.5 of the game design document is rewritten**, and the old rule is quoted below the new one.
  The pool is 58 cards instead of 16, the hand limit is 5 instead of 3, and a player draws at the **start**
  of their own turn plus on landing on a skill field, instead of at the end of the turn plus on being
  captured. The compensating card for a captured player is gone, and the changelog says so plainly because
  the argument for it was never answered, only overruled
- Section 6.6 of the game design document carries a "superseded, not yet rewritten" banner: the reaction
  window is decided as one shared 30-second window with a budget of one card per player per turn, and the
  section still describes the untimed one. Left standing until it is implemented, because the reasoning it
  gives against a timed window is what the new rule has to answer
- The Product Owner sign-off table of the game design document gained three rows marked **Overridden** and
  two new unsigned rows for the rule changes the cards force: leaving the start field becomes
  `roll >= dieMax`, and card-driven backward movement stops at the first track field

### Fixed

- **The game no longer scrolls on a window that is not 900 px tall.** Everything except the board was
  measured in text units, so the page needed a fixed 820 px of height, up to 882 px while it was asking
  something, however large the window was. On a 1438 by 770 laptop that was 50 px of scrolling before the
  game asked anything and 112 px once it did, and the only size ever measured was 1440 by 900. The layout
  is now drawn on a stage of a fixed 16:9 shape that is fitted to the window, with bars on whichever side
  has room to spare
- **The card counts in the player bar are readable again.** The four numbers per seat needed 278 px and
  their plate gave them 218, so the last one ran 45 px out of the plate and the next seat's plate painted
  over it. Three of four players read "1 KA" instead of "1 KARTEN". The plate now takes the width its
  numbers need
- **An empty slot in the skill hand is no longer drawn as a card.** The four places where a card would go
  wore a card back's dashed frame and its violet diamond on top of their own outline, so an empty hand read
  as a pile of clipped diamonds, and the outlines were painted across the face of the last real card in the
  hand
- **The overlapping cards in the skill hand read as a stack rather than as a glitch.** The card on the right
  lies on top, which is what keeps every card's name visible, but the shadow was cast to the right and so
  disappeared underneath the next card. Cast to the left it lands on the card it is lying on, and every card
  in the fan has a visible edge again
- **The handover screen no longer shows the leaving player's skill cards to the arriving one.** For one
  frame after the Ready button, the screen uncovered the hand of the player who had just finished before
  swapping it for the new player's. Nobody would have called it a bug from watching it, and it defeated the
  entire point of the screen: an opponent's skill cards are supposed to be secret, and at one shared screen
  that is only true if the cover comes off *after* the hand has changed
- **The seat colour and shape on the turn sentence kept disappearing.** The top bar was being redrawn by two
  different places and only one of them was setting which seat is on turn, so the mark vanished several
  times a turn
- **A restart no longer eats the dice pool** (issue #41). A match that ends in the middle of a turn never
  gives its three drawn cards back, so a second match on the same pool started three cards short, and the
  fourth would have failed outright. Every match now gets its own pool, which is what the pool's own
  documentation had been claiming all along
- **Quitting to the main menu now actually ends the match.** The abandoned game's board stayed in the
  page behind the menu. Nobody could see it, because the menu covers the screen, but it was still there
- **The menu, the pause screen and the handover stopped responding to clicks from the second match
  onward.** They still looked right, which is what made it hard to spot: rebuilding the page for a new
  match was silently unbinding their buttons

- **Every page was 16 px taller than the window**, so the layout FR-31 requires to fit on one screen always had a
  scrollbar. Design specification 03's `app.css` had dropped the `body { margin: 0 }` that the placeholder it
  replaced carried, and the browser's own 8 px default came back top and bottom
- **The end-to-end suite had been running at 1280 by 720 rather than the 1440 by 900 `playwright.config.js` asks
  for**, since 2026-08-14. Each project spreads a Playwright device descriptor and every one of those carries its
  own viewport, which silently overrode the setting. 1280 is below the breakpoint design specification 03
  introduced, so the whole suite was playing the stacked fallback layout
- The 40 track field grid placements briefly existed in two stylesheets at once, because design specification 03
  delivered a `board.css` that had them inlined again after handoff 02 had split them out
- `tests/e2e/pawn-leaves-start.spec.js` held a live "first movable pawn" locator across the two clicks that end a
  turn, so after the handover it was asserting against a different pawn that happened to also be at `r = 0`. It had
  been passing on timing
- **Twelve files cited the wrong requirement.** Everything issue #38 built was labelled FR-29, which is the
  *expanded* skill card set and belongs to issue #44. The trap requirement is FR-30 and the finished MVP card
  set is FR-28. Corrected across seven source files, five test files and one changelog entry, and it is not a
  blanket substitution: the traps now cite FR-30, the rest cite FR-26 and FR-28
- **Two comments claimed the skill square was invisible**, which stopped being true on 2026-08-31 when design
  decision D27 was answered and the teal diamond shipped. One was the doc comment on `markSkillSquares`, the
  other a paragraph in documentation chapter 04. Both said the stylesheet reading the attribute did not exist
- `src/core/cards/catalogue-extra.js` still said "no effect is implemented yet". All 29 cards have had a rule
  since 2026-08-31
- **Four card descriptions described the old rules**, in both languages (issue #45). Banana Peel said the
  pawn "goes back to the start area", It's Not That Deep said "a D6", Big Ah Rock said "two rounds" and
  nothing about the knockback, and Oil Spill said nothing about being stopped by a boulder. Every one now
  says what the card does
- **Three trap cards described the code rather than the game**, in both languages. Banana Peel said the
  pawn "goes back to the start area", It's Not That Deep said "pushed back a D6", and Big Ah Rock said
  "two rounds" and never mentioned its knockback at all. None matched the card the player is holding or
  the rulebook, and each is corrected along with the rule it describes
- **Your own skill cards are no longer face down during your own turn** (design handoff 10, D65). The hand
  showed the backs of your five cards while you picked a dice card, while your pawn moved, and again for
  the rest of the turn once you had played your card, which is most of every turn. One attribute was doing
  two jobs: it said "a card here can be played right now" and the stylesheet read it as "these cards belong
  to somebody else". They are two attributes now. Nothing about hot-seat privacy changes, because the
  handover screen is what covers the cards when the device changes hands, and it always was
