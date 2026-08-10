# Functional and Non-Functional Goals
## 1 Functional goals

What a player must be able to do. Grouped along the four `must have` epics on the backlog (#36–#39),
so that the goal list and the board decompose the same way.

### 1.1 Board, pawns and movement — epic #36

| ID | Goal | Priority |
| --- | --- | --- |
| FG-01 | A match is playable by **2 to 4 players**, each controlling four pawns from a colour-coded start area. | must have |
| FG-02 | Pawns move along a shared circular track and into a player's own home area. | must have |
| FG-03 | A pawn leaves the start area **only on the highest number of the die that was chosen that turn** — not on a fixed 6. | must have |
| FG-04 | Landing **exactly** on a square occupied by an opponent's pawn captures it and returns it to its start area. | must have |
| FG-05 | The match ends when one player has brought all four pawns home; that player wins. | must have |
| FG-06 | Turn order rotates deterministically between the participating players. | must have |

- **Source:** [00-One-Pager.md](00-One-Pager.md) sections *Objective*, *Beginning*, *Eliminating
  Pawns*; [README.md](../../README.md) *About*; backlog epic #36 with sub-issues #26–#29.
- **Why FG-03 is called out separately:** it is the single rule where Ludo Advanced diverges from
  classic Ludo at the *board* level rather than at the card level. Because the chosen die varies from
  D2 to D20, the probability of leaving the start area is no longer a constant 1/6 but 1/n for the
  chosen die — which makes die choice a real decision instead of a preference. This is the mechanic
  the report's probability section is built on (see
  [reference/style-reference.md](../Documentation/reference/style-reference.md), *What to copy from
  the sample directly*).

### 1.2 Dice Card Pool — epic #37

| ID | Goal | Priority |
| --- | --- | --- |
| FG-07 | At the start of a turn the player **draws 3 cards** from the Dice Card Pool. | must have |
| FG-08 | The player **picks one** of the three and rolls that die; the roll determines the move. | must have |
| FG-09 | All **3 drawn cards are shuffled back** into the pool afterwards, so the pool does not deplete over a match. | must have |
| FG-10 | The pool contains dice from **D2 to D20**. | must have |

- **Source:** [00-One-Pager.md](00-One-Pager.md) *Turn* and *Dice Card Pool*; backlog epic #37 with
  sub-issues #30, #31.
- **Why FG-09 matters as its own goal:** returning the cards makes the pool *stateless between
  turns*. That is what keeps the draw probability constant for every player over the whole match, so
  no player gains an advantage from turn order or from an opponent's earlier draws. A depleting pool
  would need a discard pile, a reshuffle rule and a fairness argument — none of which the one-pager
  provides.

### 1.3 Skill Card Pool — epic #38

| ID | Goal | Priority |
| --- | --- | --- |
| FG-11 | **Action** cards are playable on the owning player's own turn. | must have |
| FG-12 | **Reaction** cards are playable in response to another player's action, i.e. outside the owner's own turn. | must have |
| FG-13 | Card effects resolve against the game state and are matched to their visual representation by card id. | must have |

- **Source:** [00-One-Pager.md](00-One-Pager.md) *Skill Card Pool*; [CLAUDE.md](../../CLAUDE.md)
  *Architecture* for the id-matching rule in FG-13; backlog epic #38 with sub-issues #32–#34.
- **Why FG-12 is the expensive one:** a Reaction card is the only mechanic in the design that
  interrupts the turn sequence. Everything else in the rule set happens inside the active player's
  turn, so the turn manager can be a simple rotation — Reactions force it to support an interruption
  window. This is worth stating as a goal rather than leaving implicit, because it is a
  requirement on the *state machine*, not on the card.

### 1.4 Interface, presentation and game state — epic #39

| ID | Goal | Priority |
| --- | --- | --- |
| FG-14 | The board, all pawns, the drawn dice cards and the player's skill hand are visible and operable in a browser. | must have |
| FG-15 | The interface is available in **German and English**. | must have |
| FG-16 | Game state (whose turn, pawn positions, hands) is represented explicitly and drives what is rendered. | must have |

- **Source:** backlog epic #39 with sub-issues #35, #40, #41; [CLAUDE.md](../../CLAUDE.md) for the
  i18next rule behind FG-15; [README.md](../../README.md) *Localization* for the two locales.

### 1.5 Deliberately outside the MVP

Named here rather than omitted, because a goal list without a boundary invites scope creep at
exactly the point in the schedule where there is no room for it.

| ID | Goal | Priority | Note |
| --- | --- | --- | --- |
| FG-17 | Online multiplayer with a lobby system. | should have | Backlog #42. Named as a risk criterion for *both* options in the one-pager's initial risk assessment, i.e. known to be expensive before the stack was chosen. |
| FG-18 | LLM-powered bot opponents. | could have | Backlog #43. |
| FG-19 | An expanded skill card set beyond the MVP cards. | could have | Backlog #44. |
| FG-20 | Trap cards and tile trigger logic. | could have | Backlog #45. |
| FG-21 | Classic-vs-custom game modes (rule toggles). | could have | Backlog #46. |

- **Source:** MoSCoW labels as actually applied on the backlog, transcribed in
  [notes/01-requirements-and-goals.md](../Documentation/notes/01-requirements-and-goals.md).
- **Undecided, not out of scope:** the **Resource/Energy System** appears in the Sprint 2 task list
  in [01-Github-Project.md](01-Github-Project.md) but in neither the one-pager, the README, nor any
  labelled backlog issue. It therefore has no goal ID above. It is either an MVP mechanic that never
  got written into the rules or a stretch goal that never got labelled — this has to be decided
  before Sprint 2 planning, and whichever way it goes, it belongs in this list afterwards.

---

## 2 Non-functional goals

Qualities the software must have. Each is stated with the reason it was adopted and, where one
exists, the mechanism that makes it checkable rather than aspirational — a non-functional goal with
no verification route is a slogan.

### NFG-01 Maintainability through strict layering

**Goal.** `src/core/` (pure rules) never imports from `src/state/` or `src/ui/`; `src/ui/` never
mutates state directly but dispatches into `src/state/`, which applies `core/` rules.

- **Source:** [CLAUDE.md](../../CLAUDE.md) *Architecture*.
- **Why:** it makes the game rules runnable and testable **without a browser**, which is what makes
  the coverage goal NFG-05 reachable at all. A rule engine that needs the DOM to run can only be
  tested end-to-end, and end-to-end tests are too slow and too brittle to cover rule edge cases
  exhaustively.
- **Verification:** unit tests for `core/` execute in Vitest with no DOM environment — an accidental
  jQuery import breaks them immediately rather than silently.

### NFG-02 Reviewability through a file-length limit

**Goal.** No file — source, test or config — exceeds **300 lines**, and a file approaching the limit
is split along a real seam rather than compressed.

- **Source:** [CLAUDE.md](../../CLAUDE.md) *Tech stack and hard constraints*.
- **Why:** the review policy requires at least one approval per pull request
  ([Brainstorming.md](../../Brainstorming.md)). A limit that keeps a file readable in one sitting is
  what makes that approval a real review rather than a rubber stamp, in a three-person team where
  every reviewer is also implementing.
- **Explicit exception:** the limit does **not** apply under `00-Meta/Documentation/`, where
  splitting a chapter into fragments works against the purpose of the file.
- **Verification:** none automated at present. This is a **negative finding**: the rule is stated in
  `CLAUDE.md` but nothing enforces it, so it currently depends on review discipline. An ESLint
  `max-lines` rule would close the gap and has not been configured.

### NFG-03 Full localisation, no hardcoded strings

**Goal.** Every user-facing string passes through i18next; the interface ships in German (`de`) and
English (`en`).

- **Source:** [CLAUDE.md](../../CLAUDE.md); [README.md](../../README.md) *Localization*.
- **Why:** retrofitting localisation is a rewrite of every view, because the strings have to be found
  before they can be extracted. Enforcing it from the first component costs a key per string and
  nothing else. The two-locale requirement follows from the project context — a German university
  module documented and coded in English.
- **Verification:** adding a locale must require only copying `en.json` and registering it; if that
  is not sufficient, a string has been hardcoded somewhere.

### NFG-04 A restricted, justified dependency set

**Goal.** Runtime dependencies are limited to those explicitly approved (`jquery`, `i18next`);
anything further requires asking first. Dev dependencies approved: Vite, ESLint, Prettier, Vitest,
Playwright. **JavaScript only — no TypeScript.**

- **Source:** [CLAUDE.md](../../CLAUDE.md) *Tech stack and hard constraints*.
- **Why:** the fixed 8-week schedule is the binding constraint on this project (see the weighted
  analysis in [Utility-Value-Analysis.md](Utility-Value-Analysis.md), where *Zeitaufwand* and
  *Team-Kompetenz* together carry 50 % of the score). Every added dependency is unbudgeted learning
  time for three people. The no-TypeScript rule is the same trade in a different form: type safety
  bought with build-toolchain and annotation time the schedule does not have.
- **Rejected alternative, recorded honestly:** TypeScript was excluded by decision, not by oversight.
  The sample report the team models on made the same call and named it in its text with a reason,
  which is the treatment it gets here — see
  [reference/style-reference.md](../Documentation/reference/style-reference.md), section 4.

### NFG-05 Test coverage on the logic layers

**Goal.** At least **80 % of lines in `src/core/` and `src/state/`**. `ui/` is covered through E2E
tests instead. Every rule change in `core/` ships with its unit test in the same commit; every
player-facing flow has an E2E test.

- **Source:** [CLAUDE.md](../../CLAUDE.md) *Testing*.
- **Why the target is layer-specific rather than global:** a single global percentage would be
  satisfied cheapest by testing whatever is easiest, which in a frontend-heavy project is not the
  game rules. Restricting the threshold to the two pure layers points the effort at the code where a
  bug is a wrong game rather than a misplaced pixel. The uneven distribution that results is the
  intended outcome and is explained rather than hidden — the same treatment the sample report gave
  its own uneven coverage table.
- **Verification:** `npm run test:coverage`. The measured figure lives only in
  [notes/09-source-code-overview.md](../Documentation/notes/09-source-code-overview.md), next to the
  command that produces it.

### NFG-06 Browser deployment without an install step

**Goal.** The game runs in a current desktop browser from a static build (`npm run build` →
`dist/`), with no installation and no backend.

- **Source:** [README.md](../../README.md) *Tech stack* and *Scripts*; deployment candidates
  (GitHub Pages, itch.io) named in [Brainstorming.md](../../Brainstorming.md).
- **Why:** this is the payoff that justified the 2D web decision. The buffer-sprint plan requires
  playtesting with **3–5 external people without instructions**
  ([01-Github-Project.md](01-Github-Project.md)); a build that needs installing loses most of those
  testers before they start. It also removes hosting cost and backend maintenance from an 8-week
  student project entirely.
- **Negative finding:** **no deployment target has been decided and no CI/CD pipeline exists.** Both
  are listed as open questions in [00-index.md](../Documentation/00-index.md). Until one is chosen,
  this goal is met by the local production build only.

### NFG-07 Traceable process and documentation

**Goal.** Every change carries, in the same commit: an AI prompt log entry, facts appended to the
matching chapter note, a changelog entry for user-visible changes, and tests or an explicit statement
of what coverage is outstanding. Commits follow Conventional Commits; work reaches `main` only
through `dev` and a reviewed pull request.

- **Source:** [CLAUDE.md](../../CLAUDE.md) *Mandatory per-change steps*, *Git workflow*, *AI prompt
  log*.
- **Why:** this module is assessed on the written project and architecture documentation. The sample
  report names *late documentation* as its own biggest weakness, and it cost that team presentation
  time at the end. Documenting per commit converts a large end-of-project task into a small
  per-change one; that is a project-management goal, not a coding preference. See the decision block
  *Documentation notes are kept per commit* in
  [project-journal.md](../Documentation/project-journal.md).
- **Verification:** reviewable in the commit itself — the artefacts are either in the diff or they
  are not.

### NFG-08 Comprehensible and fair game state

**Goal.** The rules the player is subject to are deterministic apart from the die roll and the card
draw, and the game state that determines legal moves is fully derivable from what is on screen.

- **Source:** derived, not quoted — this is the reading of the design intent stated in
  [00-One-Pager.md](00-One-Pager.md) ("more options than just rolling dice") together with the
  external-playtesting requirement in [01-Github-Project.md](01-Github-Project.md).
- **Why:** the design's whole value proposition is that the player makes a *decision* each turn —
  which die, which skill. A decision made without visible information is a guess, and a guess is
  indistinguishable from the classic single-die game the variant is trying to improve on. Hidden
  state would therefore undermine the premise of the project rather than merely inconveniencing the
  player.
- **Verification:** the buffer-sprint playtest with 3–5 external people *without instructions* is the
  test. This is the only non-functional goal here whose verification is empirical rather than
  automated, and it is the reason that playtest is in the plan.

---

## 3 Traceability

| Backlog epic (`must have`) | Functional goals | Non-functional goals that constrain it |
| --- | --- | --- |
| #36 Core Game Engine & Board | FG-01 – FG-06 | NFG-01, NFG-02, NFG-05 |
| #37 Enhanced Dice Pool System | FG-07 – FG-10 | NFG-01, NFG-05 |
| #38 Skill Cards Mechanics | FG-11 – FG-13 | NFG-01, NFG-05 |
| #39 UI / UX, Audio & Game State | FG-14 – FG-16 | NFG-02, NFG-03, NFG-06, NFG-08 |
| — (applies to all work) | — | NFG-04, NFG-07 |

Sub-issue decomposition per epic is transcribed in
[notes/01-requirements-and-goals.md](../Documentation/notes/01-requirements-and-goals.md) and was
verified against the GitHub sub-issue API on 2026-08-06.

---

## 4 Gaps — goals that do not exist yet

Listed rather than omitted, because an incomplete goal set that says where it is incomplete is more
useful than one that reads as finished.

- **No acceptance criteria anywhere.** All 46 backlog issues have empty bodies. The MoSCoW labels
  prioritise *titles*. The goals above are therefore derived from the rulebook and the constraint
  documents, not from written requirements — they are the first place in this repository where a
  requirement is stated in checkable form.
- **No performance goal.** No target frame rate, load time or input latency is specified anywhere.
  For a turn-based 2D board game this is defensible, but it should be stated as a deliberate
  omission in the report rather than left blank.
- **No browser support matrix.** "Runs in a current browser" (NFG-06) is as specific as the sources
  get. No minimum versions, and no statement on mobile or tablet support — which matters, because the
  board is a wide layout and nothing records whether small screens are in scope.
- **No accessibility goal.** Colour is the primary means of distinguishing players in Ludo, which
  makes colour-blind accessibility a real and foreseeable question for this specific game. Nothing in
  the sources addresses it. A decision belongs to Claude Design per
  [CLAUDE.md](../../CLAUDE.md) *Design and UI*, and is not invented here.
- **Win condition unspecified at the edges.** FG-05 states the win condition informally. Overshooting
  the goal with a high die and whether an exact count is required are open — and with dice up to D20
  in the pool, overshoot is a common case rather than a corner case. Already tracked in
  [notes/01-requirements-and-goals.md](../Documentation/notes/01-requirements-and-goals.md).
- **No licence.** [README.md](../../README.md) says "To be determined", which is in tension with the
  public-repository decision recorded in the project journal.

---

## 5 How this file is used

- **Chapter 01** of the report (*Requirements and goals*) is written from sections 1 and 2, with
  section 4 supplying the "negative findings" that the style reference identifies as a grading
  factor.
- **Chapter 08** (*Quality*) picks up NFG-05 and reports the measured figure against it.
- **Chapter 11** (*Project report*) picks up section 4 and whichever goals were not met, with reasons.
- When a goal changes, it changes **here first**, and the fact is appended to
  [notes/01-requirements-and-goals.md](../Documentation/notes/01-requirements-and-goals.md) in the
  same commit.
