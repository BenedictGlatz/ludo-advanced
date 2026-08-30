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

### Changed

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
