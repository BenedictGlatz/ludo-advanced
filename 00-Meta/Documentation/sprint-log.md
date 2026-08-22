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
documentation or planning:

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
| **Actual start** | *open* |
| **Actual end** | *open* |

**Planned scope**

> **Board scope is empty**: no issue carries `Sprint 2` as of 2026-08-22, so what follows is the
> prose plan only and is not yet what the team will work on. It also does not yet contain the
> unstarted Sprint 1 gameplay scope or the npm bootstrap, both of which have to land here or later.

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
available cut.

**Delivered**: *open*

**Divergence and reasons**: *open*

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

**Board scope assigned by the project plan** (section 4.4), 23 points: #24 usability and playtest
evaluation, #25 presentation deck and live demo prep, #19 finalization documentation, #20 project
closure report, #17 PSP. **Not yet on the board**: setting the `Sprint` field needs the `project`
token scope, so this assignment currently exists in a document only.

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
