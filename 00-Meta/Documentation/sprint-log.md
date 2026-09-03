# Sprint log: planned versus delivered

Plan-versus-actual evidence for Chapter 11, tracked as **scope and dates** rather than hours. The
team decided against hour-level effort tracking; see the decision of 2026-08-06 in
[project-journal.md](project-journal.md).

Fill the *Delivered* and *Actual* columns when a sprint closes, not before. A sprint that overran or
dropped scope is recorded as it happened: an unexplained divergence is a problem, a divergence with
a reason is a finding.

**Planned scope is taken from the board's `Sprint` field**, which is the single source of truth for
sprint membership as of the 2026-08-22 decision in [project-journal.md](project-journal.md). Where
the prose plan in [01-Github-Project.md](../Project-Management/01-Github-Project.md) gives a sprint a
different scope, the board wins and the prose scope is recorded in that sprint's entry as superseded,
so the difference stays readable. Sprints whose entries below still carry only the prose scope are
marked as such: their board scope is empty, because no issues have been assigned to them yet.

**Planned dates are taken from the board**: four draft issues on
[GitHub project *Ludo Advanced*](https://github.com/users/BenedictGlatz/projects/3) act as sprint
markers and carry `Start Date` / `End Date`. Read 2026-08-06:

| Board marker | Start | End | Length |
| --- | --- | --- | --- |
| Sprint 0 | 2026-07-23 | 2026-08-09 | 2½ weeks |
| Sprint 1 | 2026-08-10 | 2026-08-23 | 2 weeks |
| Sprint 2 | 2026-08-24 | 2026-09-06 | 2 weeks |
| Sprint 3 | 2026-09-07 | 2026-09-17 | 1½ weeks |

> **Two contradictions with the written plan.** The board has **no buffer sprint**: it defines
> Sprint 0–3 and stops, while the plan is 3 sprints of 2 weeks plus a 1-week buffer. Board `Sprint 3`
> is 1½ weeks and sits where the buffer would, so it may *be* the buffer under a different name;
> nothing says so. And board `Sprint 0` runs 2½ weeks against the planned 1 week, starting
> 2026-07-23: two weeks before the repository was created. Total span 2026-07-23 → 2026-09-17 is
> ~8 weeks, which does match the plan's 8-week total.
>
> **Resolved 2026-08-22, issue #15.** Section 2.2 of
> [Project-Plan.md](../Project-Management/Project-Plan.md) decides both:
>
> - **The board's four sprints hold and no fifth sprint is created.** Board `Sprint 3` is *not* the
>   buffer sprint renamed. The closing work is a dated window **inside** Sprint 3, 2026-09-14 to
>   2026-09-17 (4 weekdays), behind a **feature freeze at the end of 2026-09-11**. The rejected
>   alternatives are recorded there: calling Sprint 3 the buffer, which is a label and not a plan, and
>   adding a fifth sprint after 2026-09-17, which is a date nobody has confirmed exists.
> - **Sprint 0 stays 2½ weeks.** Not corrected, deliberately. The dates are what the board records and
>   the board is authoritative; back-dating them to match the prose plan would be editing history to
>   make a plan look kept. It stays a Chapter 11 finding: the first sprint ran over half again its
>   planned length before any tracking existed to notice.
>
> What follows is that implementation has 15 weekdays rather than 19, which is recorded in section 5.2
> of [Effort-Estimation.md](../Project-Management/Effort-Estimation.md). The decision is written and
> **not yet adopted**: no planning slot has confirmed it.

---

## Sprint 0: Planning and prototyping (board: 2026-07-23 → 2026-08-09)

| | |
| --- | --- |
| **Planned start** | 2026-07-23 (board) |
| **Planned end** | 2026-08-09 (board) |
| **Actual start** | 2026-08-06 (repository creation) |
| **Actual end** | *open* |

**Planned scope**

- Define the rulebook for the Ludo variation: board layout, win conditions, how skill cards are
  drawn and played, dice pool maths.
- Paper-prototype or spreadsheet-test the card mechanics and dice pool balance.
- Set up the repository, the project, and the GitHub Projects board.
- Agree asset formats, screen resolution and coding standards.

**Delivered**

- Repository and GitHub project created (2026-08-06).
- Coding standards and conventions fixed in `CLAUDE.md`; stack decided.
- Rulebook exists at one-pager level only: board layout and win conditions are not specified to
  edge cases.
- Documentation notes structure established.
- **First two backlog issues closed (2026-08-06):** #4 *Create a Claude.md* and #2 *Github Setup +
  Documentation*. Both belong to this sprint's planned scope: #2 to "set up the repository, the
  project, and the GitHub Projects board", #4 to "agree asset formats, screen resolution and coding
  standards", of which #4 covers the coding-standards part only.
- `dev` pushed to `origin` (2026-08-06). `main` deliberately still at the pre-documentation state; it
  advances by pull request, not by push.

**Divergence and reasons**

- *open: record when the sprint closes.*
- Not yet done: dice pool balance prototyping, asset formats, screen resolution.

---

## Sprint 1: Core gameplay and board MVP (board: 2026-08-10 → 2026-08-23)

| | |
| --- | --- |
| **Planned start** | 2026-08-10 (board) |
| **Planned end** | 2026-08-23 (board) |
| **Actual start** | *open* |
| **Actual end** | *open* |

**Planned scope**

Read from the board's `Sprint` field on 2026-08-22, which is the single source of truth for sprint
membership (see the 2026-08-22 decision in [project-journal.md](project-journal.md)). 13 issues, all
documentation or planning; **a 14th, #17, was pulled in on 2026-08-22** (see below the table):

| # | Title | Board status 2026-08-22 |
| --- | --- | --- |
| 1 | One Pager | Todo |
| 9 | SMART Analysis | Done |
| 10 | Functional vs. Non-Functional Goals | Done |
| 11 | Risk Analysis | Done |
| 12 | Feasibility Study | Done |
| 13 | MoSCoW Analysis (issue title: Requirements Specification + MoSCoW Analysis) | Done |
| 14 | Obligations Book: System Architecture, GUI, Technology, Platform | Todo |
| 15 | Project Plan: Time, Ressources, Risks | Todo |
| 16 | Effort Estimation | Todo |
| 18 | Gantt Diagram via Roadmap | Todo |
| 21 | System Architecture Diagram | Todo |
| 22 | Game Design Document | Todo |
| 23 | Test Plan and Quality Strategy | Todo |
| 17 | PSP: Project Structure Plan | pulled in 2026-08-22, Todo |

**Scope change during the sprint, 2026-08-22.** #17 had been left out of Sprint 1 by oversight; the
project plan's section 4.4 had parked it in the Sprint 3 closing window the same day. The team set
its `Sprint` field to `Sprint 1` on 2026-08-22 and it was delivered the same evening as
[Project-Structure-Plan.md](../Project-Management/Project-Structure-Plan.md), committed directly on
`dev` by the team's instruction rather than on a feature branch, because the sprint ends 2026-08-23
and a review round on a single self-contained document was judged not worth losing the sprint
boundary over. The closing window drops from 23 to 21 points; the revision is recorded in section
4.4 of [Project-Plan.md](../Project-Management/Project-Plan.md).

**Superseded planned scope.** Until 2026-08-22 this entry carried the scope from
[01-Github-Project.md](../Project-Management/01-Github-Project.md) instead, "Core gameplay and board
MVP": board layout and tile grid logic, a standard 1 to 6 dice roll with basic pawn movement, the
turn manager across four players, and the basic knockout/capture mechanic. **None of it was in the
sprint on the board and none of it was started.** The four matching issues (#26 Board Grid, #27 Turn
Manager, #28 Pawn Movement, #29 Knockout, plus #31 Dice Rolling and the epic #36) carry no sprint
value at all and will be scheduled later. Kept here because the written plan is what the report's
planning chapter describes, so the gap between it and the executed sprint has to stay visible.

**Delivered**

- 5 of the 13 board issues closed: #9 SMART analysis, #10 goal catalogue, #11 risk analysis (register
  expanded from 3 to 16 risks), #12 feasibility study, #13 requirements specification with the MoSCoW
  analysis. All five are documents under `00-Meta/Project-Management/`.
- Merged in the same window without being board issues of their own: the AI prompt log moved out of
  version control, the branch layout corrected from stacked feature branches to branches off `dev`,
  and the unreviewed-merge recovery on `dev`.
- **No source code.** The repository still has no `package.json`, no `src/` and no tooling on the last
  day of the sprint.

**Divergence and reasons**

- **The whole gameplay scope is missing**, for the reason above: it was planned in prose but never put
  on the board, and the board is what the team works from. Not a slip during the sprint, a gap between
  two artefacts that nobody could see until the `Sprint` field became readable on 2026-08-22.
- **8 of 13 issues are still Todo one day before the sprint ends, and all 8 are unassigned.** The
  eight are #1, #14, #15, #16, #18, #21, #22, #23: the one-pager plus the entire planning block
  (obligations book, project plan, effort estimation, Gantt, architecture diagram, game design
  document, test plan). Effort estimation (#16) is a precondition three other documents already defer
  to, so it carries more weight than its position in the list suggests.
- **2026-08-22, a Saturday and the second-to-last day of the sprint: 6 of the 8 open issues delivered
  on one branch.** In order: #22 game design document, #21 system architecture, #1 one pager, #14
  obligations book, #23 test plan and quality strategy, #16 effort estimation, all on
  `feature/sprint1-planning`. The order is deliberate and is not the issue order: the rulebook first
  because it blocks #14, #23 and all implementation; the one-pager third so that the summary is
  written after the rulebook rather than rewritten after it; the estimation after the test plan,
  because sizing #33 needs the test cases that make it a 13. All eight open issues were also assigned
  on this day, having been unassigned for the whole sprint.
- **The work landed on a weekend, which is the fact rather than a detail.** Six planning documents on
  one Saturday is not a sustainable rate and is not offered as one. It is what recovering a sprint that
  produced nothing for its first eleven days looks like, and the retrospective should read it that way.
- **The remaining two (#15 project plan, #18 Gantt) are not backdated.** Either the sprint end moves or
  they carry into Sprint 2; whichever happens is recorded here as it happens. Sprint 1 therefore closes
  with 11 of 13 issues done at the earliest, which is the figure the velocity count uses. **No story
  points were recorded for any of them**, so this remains an issue count and cannot be compared to the
  point estimates that now exist for the open work.
- **Consequence for Sprint 2** (starts 2026-08-24): it has to absorb its own scope, the unstarted
  Sprint 1 gameplay scope, the two remaining planning documents, and the npm bootstrap. Sprint 2 has no
  board scope assigned yet, which makes assigning it the first thing to do rather than a later one.
  **Sized 2026-08-22:** 110 story points of implementation work and 28 of documentation remain against
  19 weekdays in Sprints 2 and 3 and two implementers, of which 74 points are `must have` and therefore
  not droppable. See section 5 of [Effort-Estimation.md](../Project-Management/Effort-Estimation.md);
  the finding there is that the must-have set does not fit as scoped, which makes it a scope
  conversation for the Product Owner and for the project plan of issue #15.

---

## Sprint 2: Skill cards, dice mechanics, multiplayer (board: 2026-08-24 → 2026-09-06)

| | |
| --- | --- |
| **Planned start** | 2026-08-24 (board) |
| **Planned end** | 2026-09-06 (board) |
| **Actual start** | 2026-08-29 (first commit of implementation work) |
| **Actual end** | *open* |

**Planned scope**

> **Board scope read 2026-08-29: 17 issues, 72 story points.** The sprint no longer has an empty board
> scope. The table is below; the prose plan and the project plan's assignment are both kept underneath
> it, because the three disagree and the difference is the finding.

| # | Title | Points | Status, latest read 2026-08-29 evening |
| --- | --- | --- | --- |
| 3 | Create Design System | 5 | In Progress, brief sent |
| 26 | Board Grid & Tile Navigation System | 5 | In Progress, committed |
| 27 | Turn Manager & Game Loop | 8 | In Progress, committed |
| 28 | Pawn Movement Rules | 5 | In Progress, committed |
| 29 | Knockout & Capture Rules Logic | 2 | In Progress, committed |
| 62 | Pawn Rendering & Movement Animation | 3 | Todo |
| 63 | Project Bootstrap: package.json, Vite, ESLint, Prettier, Vitest, Playwright | 5 | In Progress, committed |
| 64 | i18n Setup and the German and English Locale Files | 5 | In Progress, committed |
| 36 | Core Game Engine & Board (epic) | 0 by design | In Progress |
| 37 | Enhanced Dice Pool System (epic) | 0 by design | Todo |
| 38 | Skill Cards Mechanics (epic) | 0 by design | Todo |
| 39 | UI / UX & Game State (epic) | 0 by design | Todo |
| 42 | Online Multiplayer & Lobby System | 13 | Todo |
| 43 | LLM-Powered Bot API Integration | 8 | Todo |
| 44 | Expanded Skill Card Set | 3 | Todo |
| 45 | Trap Card System & Tile Trigger Logic | 5 | In Progress, committed 2026-09-03 on its feature branch |
| 46 | Classic vs. Custom Game Modes (Rule Toggles) | 5 | Todo |

> **The epic in row 39 was renamed on 2026-09-01**, from *UI / UX, Audio & Game State*, when audio was
> deferred out of it. Its three points left the must-have class with it. The table above is written with
> the current title; [notes/01-requirements-and-goals.md](notes/01-requirements-and-goals.md) has the
> facts and [project-journal.md](project-journal.md) the decision.
>
> **The sprint placement of #39 is contradictory and this log is not the place that resolves it.** The
> board carries it as Sprint 2, In Progress; `SMART-Analysis.md`, `Requirements-Specification.md` and
> `Roadmap-and-Gantt.md` all put it in Sprint 3. By the 2026-08-22 decision the board wins, which is why
> it is in the table above, and it is the same finding
> [notes/02-project-management.md](notes/02-project-management.md) already records: the epics are in
> Sprint 2 and eight of their children carry no sprint at all.

**Three things about that table are worth stating before the sprint closes, not after.**

1. **34 of the 72 points are #42 to #46**, which section 4.4 of
   [Project-Plan.md](../Project-Management/Project-Plan.md) leaves **unscheduled** on purpose: #42 is
   `should have` and named there as the largest available cut, and #43 to #46 are all `could have`. They
   were put in Sprint 2 on the board sometime between the 2026-08-22 read and the 2026-08-29 one. The
   board wins by the 2026-08-22 decision, so this is Sprint 2's scope until a planning slot changes it.
   It is not corrected unilaterally here.
2. **The must-have work in this sprint is 38 points**: #3, #26, #27, #28, #29, #62, #63, #64. That is the
   figure to compare against the calendar, and against a sprint that started 2026-08-24 with its first
   implementation commit on 2026-08-29.
3. **Three of the 17 issues did not exist on 2026-08-22.** #62 is the rendering half of #28, split out
   the same day; #63 and #64 are the bootstrap and the i18n setup, 10 of the 12 points that section 3.6
   of [Effort-Estimation.md](../Project-Management/Effort-Estimation.md) found invisible to the board.

**Superseded prose scope**, from
[01-Github-Project.md](../Project-Management/01-Github-Project.md). Kept because the report's planning
chapter describes it:

- Dice pool: special dice and the selection UI.
- Skill cards: deck system, hand UI, action system (shield token, swap positions, reroll).
- Resource/energy system for buying or using cards and enhanced dice.

**Scope decided 2026-08-22, issue #15, and not yet on the board.** Section 4.4 of
[Project-Plan.md](../Project-Management/Project-Plan.md) assigns **46 points** here: the npm bootstrap,
the i18n setup, #3 design system, #26 board grid, #28 pawn movement, #29 capture, #30 dice pool, #31
dice rolling, #27 turn manager. Three differences from the prose scope above, each with a reason:

- **The skill cards move to Sprint 3**, because #32 and #33 depend on the turn manager and #33 is the
  largest item in the backlog at 13 points.
- **The dice pool moves forward rather than back.** #30 is scheduled before #27 so that the turn
  manager takes a die from the pool from its first commit. Building against a fixed D6 first would mean
  writing the FR-09 leaving rule twice, which section 3.4 of
  [Requirements-Specification.md](../Project-Management/Requirements-Specification.md) flagged and
  section 4.2 of the project plan decides against.
- **The resource and energy system is out**, ruled out of the MVP by section 6.7 of the game design
  document. It carries no requirement id at all. The prose plan above still lists it and has not been
  edited, which is why it stays visible here.

Multiplayer also stays out of this sprint: #42 is `should have`, 13 points, and named as the largest
available cut. **That is no longer what the board says**, see point 1 above.

**Delivered**: *open, filled as it happens*

- **2026-08-29:** board hygiene. `Story Points` created and back-filled on 25 open issues, `Sprint 2`
  set on #26 to #29, #28 split into #28 and #62, #63 and #64 created. Details in
  [notes/02-project-management.md](notes/02-project-management.md).
- **2026-08-29:** #63 project bootstrap (5). npm project, Vite, ESLint, Prettier, Vitest, Playwright,
  and the two architecture rules turned into failing lint runs.
- **2026-08-29:** #26 board topology (5). `core/board.js`, the coordinate system everything else is
  computed on.
- **2026-08-29:** the first Claude Design handoff. `01-Design/` and
  `Handoff/01-brief-foundations-and-board.md`, with nine numbered open decisions. #3 stays open until
  the spec comes back.
- **2026-08-29:** #29 capture (2) and #28 pawn movement rules (5). `core/pawns.js`,
  `core/capture.js`, `core/movement.js`, `core/win.js`, `core/dice-source.js`.
- **2026-08-29:** #27 turn manager and game loop (8). The four `state/` modules, the eight-step turn
  sequence, the four-intent boundary, and a complete match played end to end on a scripted RNG.
- **2026-08-29:** #64 i18n setup (5). i18next with the German and English locales.
- **2026-08-30:** the design handoff came back, and it changed the rulebook. The board went from a
  52-square track to 40, from a 5-square home column plus a separate home area to a 4-square house
  holding one pawn per square, and two players now sit opposite each other on seats 0 and 2. Section
  2 of the game design document was rewritten in the same commit as `core/board.js`. **This carries
  no story points and was not in anybody's estimate.**
- **2026-08-30:** #3 create design system (5). Five stylesheets in `src/ui/styles/` and the spec in
  `01-Design/Handoff/`. The five landing checks from the sprint plan were run before merging the
  delivery; one of them failed on arrival and is recorded below.
- **2026-08-30:** #62 pawn rendering and movement animation (3). Five modules in `src/ui/`, the
  composition root, and seven Playwright specs run against the production build in Chromium, Firefox
  and Edge. **The game is playable.** Milestones M2 and M3 are both met.
- **2026-08-30:** handoff 02 sent, `01-Design/Handoff/02-brief-board-review.md`, with nine numbered
  questions and six screenshots taken from the running build. The round is open.
- **2026-09-01:** #30 dice pool data model and selection logic (3), **closed as an audit rather than as
  a build.** The pool itself shipped on 2026-08-30 inside the same day's work; FR-16, FR-17, FR-18,
  FR-19 and FR-21 were already satisfied and its parent epic #37 was already closed. What this issue
  actually delivered is the FR-16 to FR-21 traceability table in
  [notes/01-requirements-and-goals.md](notes/01-requirements-and-goals.md), a dice card pool overview
  screen so the player can see what they are choosing from, and the FR-20 distribution test that the
  table's own check found missing. Handoff 05 sent,
  `01-Design/Handoff/05-brief-dice-pool-overlay.md`, with five numbered decisions D43 to D47. The round
  is open. **The 3 points are booked in full**, and whether that is honest is the note below.
- **2026-09-01:** the work order `01-Design/Handoff/00-open-requests.md` sent, and **design handoff 04
  answered the same evening**: `04-spec-hud-menus-and-handover.md`, D35 to D42 plus D16, D20 and four
  unnumbered items, with five replacement stylesheets and five amended ones. Landed on the branch. **No
  story points**, because it carries no issue: it is design work for issues #35, #41 and epic #39, all of
  which were already booked. The visible effect on the board is nil and the visible effect on the game is
  the whole of its interface, which is worth one sentence in the retrospective about what a points-based
  velocity figure does and does not measure.
  - **What it closed:** four of the five placeholder stylesheets, D38's overlay animation, D40's duplicated
    win message, D20's hardcoded duration, and the empty-hand-slot question open since issue #39. It also
    reverted issue #39's two token changes, so the board and the cards are full size again.
  - **What it did not close:** handoff 05 has no spec, so `pool.css` is still a placeholder. **D16 is
    answered but NFR-12 is still unmet**, because the seat shapes went on the HUD, the chrome and two
    overlay panels and not on the pawn, which is where the requirement is measured. That is the only
    `must have` in the sprint that a design item is still blocking, and the remaining work is named in the
    spec as one `<span>` and about fifteen lines of CSS.
  - **Two defects found while landing it**, both by the spec's own requirements rather than by the code: the
    handover was uncovering the leaving player's secret hand for one frame, and the chrome's seat marker was
    being written by one file and erased by another. Both fixed and both tested.
- **This Delivered list had a hole between 2026-08-30 and 2026-09-01.** Issues #31, #32, #33, #34, #35,
  #38, #39 and #41 all landed in that window with no entry here, although their facts were in the chapter
  notes and the journal's decision blocks. It is the same gap the 2026-08-30 entry in
  [project-journal.md](project-journal.md) records for the session log, which makes it a pattern rather
  than an oversight: **the per-change documentation step was being done in the chapter notes and skipped
  in the two chronological logs.**

  **Filled on 2026-09-02, and it was safe to fill.** The concern recorded above was that a sprint log
  written from somebody else's commits is a guess. Every commit in the window is authored by `lbolender`,
  checked with `git log --date=short --format='%h %ad %an %s'`, so this is the author writing their own
  log two days late rather than reconstructing anybody else's work. Two days late is still late, and the
  entries below are dated by the commit rather than by today.

  | Date | Issue | What landed |
  | --- | --- | --- |
  | 2026-08-31 | #38 (epic) | The rules substrate the skill cards stand on: the roll as an ordered chain of modifiers, turn-counted statuses, traps and blockers on the shared squares, and movement answering questions about squares a move passes over |
  | 2026-08-31 | #32 (5) | The 29-card catalogue and the closed 58-card pool, plus the eight skill squares on the board and the locale split into `ui` and `cards` files |
  | 2026-08-31 | #31 (5) | Design spec 03 landed and the player picks the die: the card component behind all three families, the dice hand, and the choose step added to the turn |
  | 2026-09-01 | #33 (13) | The effect engine, the reaction window and all 29 cards over two commits, plus the action phase splitting commit from resolve in the turn flow |
  | 2026-09-01 | #34 (5) | The skill hand made playable, with the target picker |
  | 2026-09-01 | #39 (epic) | The 36 card illustrations extracted from the artboard, players named on screen, and the language switch put in the chrome |
  | 2026-09-01 | #35 (2) | The HUD: whose turn it is in words, and each seat's pawn and card counts |
  | 2026-09-01 | #41 (5) | The menu, match setup, handover, pause, win and restart flow, with no page reload |
  | 2026-09-03 | #45 (5) | The trap rules brought back to the rulebook after three had drifted, a chain reaction and one choke point for entering a square, traps and pawn statuses in the DOM, the announcement, placement limits, keyboard picking of a field, the first trap end-to-end coverage, and design brief 07 sent. **The first `could have` delivered**, and it cost well over its 5 points: eight Product Owner decisions turned a finish-the-mechanic issue into three new mechanics |

  **The lesson is about when, not whether.** Every one of these has its facts recorded somewhere; what was
  missing was the sequence, and the sequence is the only thing a chapter note cannot reconstruct. The two
  chronological logs are the artefacts that show pace, which is exactly what the report's
  plan-versus-actual chapter is built from.

**Note on booking #30's points.** The estimate for #30 reads "`core/dice-pool.js`: the 20-card
composition as a single data definition, the draw of 3, the return and reshuffle, with the RNG taken as
an argument", and every word of that was built on 2026-08-30 under a commit that named no issue. So the
3 points describe work that was delivered on a different day, and the work actually done on 2026-09-01
was an audit, a screen and a test that the estimate does not mention. Booked in full anyway, because
the alternative is 3 points that no sprint ever gets, and flagged here because it makes the sprint's
velocity figure slightly fictional in a way a reader could not otherwise see.

**All 38 of the sprint's must-have points are committed**, over two days, all on the branch
`feature/sprint2-core-and-design`. **None of it is merged, reviewed or pushed**, so by the project's
own Definition of Done not one of these issues is done: the board still shows them as `In Progress`.
That gap between "committed" and "done" is the whole remaining risk in this sprint, and it is one
review away.

- **2026-09-02:** the Sprint 2 closeout opened with a brief rather than with the board. Design brief 06
  (`01-Design/Handoff/06-brief-pawn-mark.md`, the seat shape on the pawn, closing D16 and NFR-12) went out
  first, the work order was re-ordered to 06 before 05, and the `.pawn__mark` element the brief needs went
  into `board-view.js` in the same commit with an end-to-end case asserting it. Reason, recorded in the
  journal: two of the five closeout steps wait on Claude Design and the other three do not touch the
  stylesheets, so sending first turns the whole closeout window into design time. No points booked; NFR-12
  has no issue and was never estimated.

- **2026-09-02:** **design handoffs 05 and 06 both landed, in one delivery.** `pool.css` replaced the last
  placeholder stylesheet and `pawn.css` gained the seat mark, with `05-spec-dice-pool-overlay.md` and
  `06-spec-pawn-mark.md` answering D43 to D50. **NFR-12 is met** and `greyscale.spec.js` runs green with no
  expected-failure marker for the first time since 2026-08-30. Two DOM changes the specs asked for by name
  were wired: `data-copies` on the pool card and `tabindex` conditional on a card being playable. **No
  story points**, for the same reason handoff 04 booked none: the design loop generates work without
  generating cards, and NFR-12 was never estimated by anybody.
- **2026-09-02, the board caught up with the code.** #31, #32, #33, #34 and #35 closed by hand with a
  comment naming why (`Closes #n` only fires on a merge into `main`), their `Sprint` set to Sprint 2, their
  `Status` to Done and their dates set from the author date of the delivering commit. Epics #37 and #38
  moved to Done. #40 moved to Sprint 3. **#68 created**, the CI build-check workflow, 2 points, Sprint 3:
  it was the last must-have work in the project with no card at all, named in three documents and on the
  board in none of them. #30 stays In Progress until the merge, by the project's own Definition of Done.
- **The Sprint 2 figure, read off the board after the corrections above:**

  ```bash
  gh project item-list 3 --owner BenedictGlatz --format json --limit 100 \
    | node -e "const j=JSON.parse(require('fs').readFileSync(0));const a={};for(const i of j.items){if(i.status!=='Done')continue;const s=i.sprint||'none';a[s]=(a[s]||0)+(i['story Points']||0)}console.log(a)"
  ```

  **73 points marked Done in Sprint 2**, read 2026-09-02, with #30's 3 points still outside it. **This is
  not a velocity and must not be used as one**, and there are now four independent reasons rather than
  three: no effort is measured anywhere; #30's points describe work done on a different day; two design
  deliveries did a day's work each for no points; and five of the issues counted here were planned for
  Sprint 3 and pulled forward. The figure is printed with all four next to it or not printed at all.

**Divergence and reasons**: *open, filled as it happens*

- **Five issues moved from Sprint 3 into Sprint 2, after the fact.** #31, #32, #33, #34 and #35 were
  scheduled into the Sprint 3 implementation half by section 2.2 of
  [Project-Plan.md](../Project-Management/Project-Plan.md), and all five were built on 2026-08-31 and
  2026-09-01 because the state layer finished early and nothing blocked them. The board now says Sprint 2,
  which is where the work happened. The plan is not edited to match: the gap between what was planned and
  what happened is the finding, and this is the sentence that holds it.
- **Sprint 3's implementation half is nearly empty before it starts.** It was planned as 35 points over
  five weekdays, and six of its seven items are delivered. What is left is #40 audio (3 points, and the
  Product Owner has been asked to cut it), #68 the CI workflow (2 points), and the review and merge of
  this branch. **That is the plan-versus-actual story of this project in one line**, and it is a schedule
  finding rather than a success: the estimates were built for people writing the code by hand.
- **A sixth issue moved from Sprint 3 into Sprint 2 the same day: #68, the CI workflow, 2 points.** It was
  created on 2026-09-02 during this closeout precisely so the board would carry it before Sprint 3 began,
  and then it was built on 2026-09-02 as well, on `feature/68-ci-build-check` off `dev`. The reason is
  the one the line above already gives: Sprint 3's implementation half had nothing left to block it.
  **This makes Sprint 3's planned implementation half exactly one item, #40 audio, which the Product
  Owner has been asked to cut.** The honest reading is not that the team is fast, it is that the
  estimate of 35 points for that half described a different way of working, and the log now says so for
  the sixth time rather than once. It also moves the Sprint 2 figure again, to 75 points of `Done` work
  against 72 planned, and the four reasons the 2026-09-02 decision block gives for why that number is
  not a velocity all still apply, with this as a fifth instance of the same cause.

- **The plan's Step 4 was committed in the reverse of the order it names.** It asks for
  `feat(movement)` closing #28 and then `feat(capture)` closing #29. `movement.js` imports
  `capture.js`, so committing movement first would have left an intermediate commit whose tree does
  not run. The two commits are in dependency order instead, and both issues still get their own
  commit, which is what the plan asked the two commits *for*.
- **The rules and the state layer take a pawn list, not the state object**, which is a deviation from
  the function signature the plan sketched. The reason is in the 2026-08-29 decision block in
  [project-journal.md](project-journal.md): passing the state object would keep the letter of NFR-01
  and lose its point.
- **Nothing was measured about how long any of this took**, because the project records no hours by
  the 2026-08-06 decision. So the 30 committed points cannot be checked against the estimates that
  produced them, and the retrospective will have story points delivered and no effort to compare them
  against. That is the known cost of that decision, showing up for the first time.

- **Five weekdays of the sprint were spent before any implementation work started.** The sprint opened
  2026-08-24 and the first commit that is not documentation lands 2026-08-29. Milestone **M1, toolchain
  up, was due 2026-08-25 and was missed**; M2, a pawn moves on a real board, is due 2026-08-31 and M3,
  a full turn resolves, on 2026-09-06.
- **The must-have half of this sprint is 38 points over the 5 weekdays that remain**, 2026-08-31 to
  2026-09-04, which is 7.6 points per weekday against a required project average of 4.9 and against no
  measured velocity at all, because every issue closed so far is a document. **This will not fit.** It
  is written here in advance rather than explained afterwards, and neither the plan nor any board date
  is being adjusted to hide it. Either the sprint end moves or part of the scope carries into Sprint 3,
  and whichever happens is recorded here when it happens.
- **The 34 points of #42 to #46 are counted in the sprint and are not planned to be worked on.** If
  they are still `Todo` on 2026-09-06 the sprint reads as 38 of 72 points delivered at best, which
  understates the work. The honest reading is against the 38, and the reason the two figures differ is
  point 1 of the planned scope above.

- **The "this will not fit" prediction above was wrong, and it is left standing.** It was written on
  2026-08-29 against 38 points over 5 remaining weekdays. All 38 were committed on the second of
  those days. The prediction is kept rather than deleted because the reason it was wrong is the
  finding, not the arithmetic: the estimate was built for a team writing the code, and the work was
  done at a rate that says nothing about how long it would take anybody to do it by hand. **The
  velocity figure this sprint produces is therefore not a planning input for Sprint 3.** Using it as
  one would be the single most misleading number this project could put in its report.

- **A whole day of finished, tested work was invalidated by the design handoff.** #26 closed on
  2026-08-29 against a 52-square board, because that is what the rulebook said and the sprint plan
  explicitly forbade inventing a number that was not in it. The handoff arrived the next morning
  built on 40. The plan had no step for this: it scheduled the rules and the design **in parallel**
  precisely because they were not expected to interact. See the challenge entry of 2026-08-30 in
  [project-journal.md](project-journal.md) for what it cost and why the recovery was cheap in the
  source and expensive in the tests.

- **The plan's step 8 needed a decision it did not anticipate.** Handoff 01 designed the board and
  the refusal region and nothing around them, so there was no designed way to pick a die, hand over
  or see who won. `CLAUDE.md` forbids Claude Code from inventing what a component looks like, so the
  question went to the team rather than into the code, and the answer was that the pawn click is the
  only control. That is a real reduction in what the slice does, taken deliberately.

- **The seating rule reached the rules layer, which no estimate covered.** D3 of the design spec
  seats two players opposite each other. The state layer numbered players 0 and 1, so a two-player
  match would have put pawns in a yard the stylesheet had greyed out. `core/board.js` gained
  `seatsFor`, `findWinner` lost an argument, and a second round of test re-derivation followed.

- **One of the five landing checks failed on arrival, and the cause was our own toolchain.**
  `board.css` was delivered at 248 lines and inside NFR-02. `npm run format` expanded every
  single-line rule and took it to 407. Two rules that are each sensible on their own, "format
  everything" and "no file over 300 lines", disagreed on a file that was compliant when it was
  written.

- ~~**NFR-12 is not met, and the sprint closes with it not met.** The design tells players apart by
  colour alone after the non-colour identifier was removed on request. Red and blue are ten
  greyscale levels apart out of 255. `greyscale.spec.js` measures it, fails, and is marked as
  expected to fail so the suite reports a known failure rather than going green. Row 8 of the
  Product Owner sign-off table carries the question. **This is a `must have` requirement that is
  visibly unsatisfied and is being carried, not closed.**~~

  **Closed on 2026-09-02, and the entry is kept because how it closed is the interesting part.** The
  requirement was open for three days and is met: design handoff 06 put a shape per seat on the piece and
  the test now asserts the acceptance criterion instead of a proxy for it. Two corrections to what the
  struck-through text says: NFR-12 is **`should have`**, not `must have`, an error that had spread to five
  files and was found on 2026-09-01; and the thing that carried the requirement to a close was the
  expected-failure marker itself, which made the gap impossible to forget in three days of daily test runs.

- **The dice pool balance in section 5 of the game design document is knowingly out of date**,
  because it was derived against a 58-step journey and the journey is now 44. It is flagged in the
  document and belongs to issue #37. Nothing in the MVP depends on it, because the MVP runs on one
  fixed die.

> The resource/energy system appears only in this sprint plan, not in the one-pager or the README.
> Whether it is in scope is undecided: see [notes/01-requirements-and-goals.md](notes/01-requirements-and-goals.md).
> Multiplayer has no chosen technology and may end up local hot-seat only.

---

## Sprint 3: Polish, art, audio, fixes (board: 2026-09-07 → 2026-09-17)

| | |
| --- | --- |
| **Planned start** | 2026-09-07 (board) |
| **Planned end** | 2026-09-17 (board) |
| **Actual start** | *open* |
| **Actual end** | *open* |

**Planned scope**

> **Board scope is empty**: no issue carries `Sprint 3` as of 2026-08-22, so what follows is the
> prose plan only.

- 2D sprites, animations, UI skins, particle effects for skills and cards.
- Sound effects (dice rolls, card play, victory) and background music.
- Main menu, pause menu, win/loss screens, restart flow.

**Split and scoped 2026-08-22, issue #15, and not yet on the board.** Section 2.2 of
[Project-Plan.md](../Project-Management/Project-Plan.md) divides this sprint at the feature freeze:

| Window | Dates | Weekdays | Scope | Points |
| --- | --- | --- | --- | --- |
| Implementation half | 2026-09-07 → 2026-09-11 | 5 | #32, #33, #34, #35, #40, #41, the CI workflow | 35 |
| Closing window | 2026-09-14 → 2026-09-17 | 4 | See the closing-window entry below | 23 |

> **Board scope read 2026-09-02, and it is two items.** #40 audio (3 points, Todo) and **#68, the CI
> build-check workflow (2 points, Todo, created 2026-09-02)**. Five of the seven planned implementation
> items, #32 to #35 and #41, were delivered in Sprint 2 and are booked there. **5 points against five
> weekdays**, where the plan wrote 35, and the Product Owner has been asked to cut #40 by 2026-09-06.
>
> The plan's 35-point line is left standing above rather than edited. The difference between the two
> figures is the plan-versus-actual comparison this sprint contributes, and rewriting the plan to match
> what happened would delete it.
>
> **What is genuinely left is not on the board and is not points.** The review and merge of the Sprint 2
> branch into `dev`, the decision about a `dev` to `main` release, and everything in the closing window.

**35 points against 5 weekdays is 7 per weekday, against a required average of 4.9.** The imbalance is
recorded rather than smoothed: it is where the must-have set stops fitting, and printing it on the
board is what makes that visible in early September instead of in the last week.

Two items of the prose scope above are dropped and named as dropped: **UI skins and particle effects**
carry no requirement id, so they are not in the requirements specification at all and cost nothing to
cut. **Audio (#40, 3 points) survives only if assets exist**, and no asset has ever been budgeted.

**Delivered**: *open*

**Divergence and reasons**: *open*

---

## ~~Buffer sprint~~ Closing window: Playtesting and presentation

> **Not present on the board, and no longer planned as a sprint.** The board defines Sprint 0–3 only.
> **Decided 2026-08-22, issue #15** (section 2.2 of
> [Project-Plan.md](../Project-Management/Project-Plan.md)): the buffer sprint is not created, and this
> scope becomes a dated window inside Sprint 3 instead. Board `Sprint 3` does **not** double as the
> buffer sprint; it is split, with implementation up to the feature freeze and the closing work after
> it. The entry is kept under its old name struck through so the change stays readable.

| | |
| --- | --- |
| **Planned start** | 2026-09-14 (decided 2026-08-22, inside board Sprint 3) |
| **Planned end** | 2026-09-17 (board Sprint 3 end) |
| **Weekdays** | 4 |
| **Actual start** | *open* |
| **Actual end** | *open* |

**Board scope assigned by the project plan** (section 4.4, as revised the same day), 21 points: #24
usability and playtest evaluation, #25 presentation deck and live demo prep, #19 finalization
documentation, #20 project closure report. #17 PSP was in this list for part of one day and was then
pulled into Sprint 1, where it was delivered. **Not yet on the board**: setting the `Sprint` field
needs the `project` token scope, so this assignment currently exists in a document only.

**Four weekdays is the finding, not the plan's comfort.** The playtest needs 3 to 5 external people
who get no instructions, and people found inside a 4-day window will not be found in time. The
external-playtester risk row therefore stands unchanged in
[03-Risk-Analysis.md](../Project-Management/03-Risk-Analysis.md), and lining candidates up is Sprint 2
work rather than closing-window work.

**Planned scope**

- Playtesting with 3–5 external people playing without instructions, to surface UI problems.
- Fallback video: a 2-minute clean gameplay walkthrough, in case live hardware fails during the
  presentation.
- Presentation deck covering Scrum velocity, burn-down charts, architecture decisions and mechanic
  trade-offs.

**Delivered**: *open*

**Divergence and reasons**: *open*

> Velocity and burn-down charts need real board data to exist. If story points are never recorded,
> those slides cannot be produced: decide early, not in week 8.
>
> **Confirmed 2026-08-06: as the board stands, neither chart can be produced.** There is no story
> point field and no Iteration field, and `Status` and `Sprint` are unset on all 50 items: so there
> is no estimate to sum and no dated status history to burn down against. See the negative findings
> in [notes/02-project-management.md](notes/02-project-management.md#board).
>
> **Partly revised 2026-08-22.** `Status` is now set on all 64 board items and `Sprint` on 20 of
> them, so a *velocity* count of issues closed per sprint is possible from Sprint 1 onward. Story
> points and an Iteration field still do not exist, so **story-point velocity and burn-down remain
> impossible**, and no sprint has dated status transitions recorded. Sprint 0 and Sprint 1 can be
> counted retroactively (7 and 13 issues); Sprint 2 and Sprint 3 have no board scope yet, so nothing
> can be counted for them until issues are assigned.
>
> **Revised again the same day, issue #16.** Estimates now exist:
> [Effort-Estimation.md](../Project-Management/Effort-Estimation.md) sizes every open issue in story
> points. That separates the two charts, which have been treated as one problem until now:
>
> - **Story-point velocity is producible from Sprint 2 onward**, as soon as the `Story Points` field is
>   created and back-filled from that document. Not for Sprint 0 or Sprint 1: their issues were closed
>   without estimates and estimating them now, after the fact, would produce a number that flatters
>   whatever it is compared against.
> - **Burn-down stays impossible, and points do not fix it.** It needs dated status transitions or a
>   GitHub Iteration field, and the board has a plain single-select `Sprint` field with no dated
>   history. That is a separate configuration gap from the missing estimate field.
> - **Both are blocked on the same missing token scope.** Creating the field needs `project`, which the
>   `gh` token does not carry; `gh project field-create` fails outright. So the outstanding step is a
>   human one, in the browser or through one interactive `gh auth refresh -s project`.
