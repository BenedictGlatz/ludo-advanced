# Effort Estimation

What is left to build, sized in story points, and whether it fits the calendar that remains.

Priority is not cost. [Requirements-Specification.md](Requirements-Specification.md) says which
requirements matter and in what order they would be dropped; this document says what each item costs
relative to the others, so that the drop order can be weighed against what a cut actually saves. It was
named as a missing input in that document's own known gaps.

---

## 1 Method

**Relative sizing in story points, on the Fibonacci scale 1, 2, 3, 5, 8, 13.** A point is not an hour
and does not convert to one. It expresses how large an item is compared to the anchor, taking scope,
uncertainty and the number of layers it touches together.

**The anchor is issue #29, *Knockout & Capture Rules Logic*, at 2 points.** It is the smallest complete
item in the backlog: one rule in `core/capture.js`, its unit test, no view, no state transition of its
own, and section 4.3 of [Game-Design-Document.md](Game-Design-Document.md) already states the rule to
edge-case level. Everything else is sized by asking how much larger than #29 it is.

**Hours were rejected**, and not here for the first time: the decision of 2026-08-06 in
[project-journal.md](../Documentation/project-journal.md) rules out hour-level effort tracking for this
project. Points are also what makes the velocity slide of the buffer sprint producible at all, since a
velocity needs a summable estimate and an issue count is not one.

**What the numbers below are.** Estimates, produced by reasoning about scope against the anchor. They
are not measurements, and this document is the only place in the repository where numbers that were
never measured are allowed, because an estimate that had to be measured first would not be an estimate.
Measured figures live in
[notes/09-source-code-overview.md](../Documentation/notes/09-source-code-overview.md) next to the command
that produced them, and none of the numbers here ever moves there.

**Single-estimator caveat, stated once.** These estimates were produced by one person and one AI
session, not by a planning poker round with three people. Relative sizing gets most of its value from
disagreement between estimators, so the totals below are a starting point for a planning conversation
rather than the outcome of one.

---

## 2 Structure basis

The work breakdown is **the backlog itself**. Issue #17 *PSP: Project Structure Plan* is not in Sprint 1
on the board, so no separate work breakdown structure exists yet, and the backlog is already a de facto
one: four epics, each with its children, plus five extended features and the documentation issues.

That is acceptable here for a specific reason rather than by convenience: the epic-to-child structure
was read from the board's own sub-issue graph on 2026-08-22, not inferred from titles, and it matches
the requirement blocks of [Requirements-Specification.md](Requirements-Specification.md) section 4
exactly. A separate structure plan would restate the same tree in a second place. When #17 is written it
should adopt this tree rather than invent another, and this document is then its cost column.

| Epic | Children, read from the board's sub-issue graph | Requirements | MoSCoW |
| --- | --- | --- | --- |
| #36 Core Game Engine & Board | #26, #27, #28, #29 | FR-01 to FR-15 | must have |
| #37 Enhanced Dice Pool System | #30, #31 | FR-16 to FR-21 | must have |
| #38 Skill Cards Mechanics | #32, #33, #34 | FR-22 to FR-30 | must have |
| #39 UI / UX, Audio & Game State | #35, #40, #41 | FR-31 to FR-41 | must have |
| No epic: extended features | #42, #43, #44, #45, #46 | FR-42 to FR-45 | see section 3.5 |

**The four epics carry no points of their own.** An epic is the sum of its children; giving it a size as
well would double-count. The epics are `must have`, so their children inherit that class, which is the
only way to read a MoSCoW value for them at all: **none of the 17 implementation child issues carries a
MoSCoW label**, only the four epics and the five extended features do.

---

## 3 Estimates

### 3.1 Epic #36, Core Game Engine & Board

| Issue | Points | Rationale |
| --- | --- | --- |
| #26 Board Grid & Tile Navigation System | 5 | `core/board.js`: the 52-square closed track, the entry and turn-off squares per player, the 5-square home column, and the relative-position arithmetic that everything else is computed on. Larger than the anchor because it is the coordinate system four other modules depend on, smaller than an 8 because section 2 of the game design document states every number it needs. |
| #27 Turn Manager & Game Loop | 8 | `state/turn-manager.js` plus `state/intents.js`: the 8-step sequence, and the reaction window as a phase of the turn rather than a special case. An 8 because it is the integration point of every other module and it owns the only mechanic that interrupts the sequence. Nothing else in the backlog can be finished before it exists in some form. |
| #28 Pawn/Token Spawning & Movement Animation | 8 | Two items in one issue: the legal-move set in `core/movement.js` (FR-09 to FR-14, the leaving rule, the own-pawn rule, the exact count into home) and the pawn rendering and animation in `ui/board-view.js`. The rule half alone would be a 5. Splitting the issue would be the better move and is recommended in section 6. |
| #29 Knockout & Capture Rules Logic | 2 | The anchor. |
| **Epic total** | **23** | |

### 3.2 Epic #37, Enhanced Dice Pool System

| Issue | Points | Rationale |
| --- | --- | --- |
| #30 Dice Pool Data Model & Selection Logic | 3 | `core/dice-pool.js`: the 20-card composition as a single data definition, the draw of 3, the return and reshuffle, with the RNG taken as an argument. Small because section 5.1 of the game design document is already the data structure. |
| #31 Dice Rolling Mechanics & 2D Animations | 5 | The roll itself is trivial once the RNG is injected. The size is in `ui/dice-hand-view.js`: three cards, the choice, the roll result and its animation, which is the first place the project needs a visual design that does not exist yet. |
| **Epic total** | **8** | |

### 3.3 Epic #38, Skill Cards Mechanics

| Issue | Points | Rationale |
| --- | --- | --- |
| #32 Card Data Structure & Deck Management | 5 | `core/skill-pool.js`: 16 cards, the hand limit of 3, the draw at end of turn, the capture compensation draw, and the discard-and-reshuffle. The size is in the closed-accounting invariant of FR-27, which is a property over sequences of operations rather than a single function. |
| #33 Card Effect Handler / Execution Engine | 13 | The largest single item in the backlog. Eight cards are eight distinct rules in `core/card-effects.js`, each with its own unit test and, for the four Reactions, its own playability predicate. Three of them (`reaction-shield`, `reaction-slow`, `reaction-cancel-card`) modify an action while it is resolving, which is where the effects and the turn manager meet and where the cost is. |
| #34 Player Hand UI & Card Interaction | 5 | `ui/skill-hand-view.js`: the hand, which cards are playable now, and the reaction prompt as a modal state. Comparable to #31 and for the same reason. |
| **Epic total** | **23** | |

### 3.4 Epic #39, UI / UX, Audio & Game State

| Issue | Points | Rationale |
| --- | --- | --- |
| #35 Game HUD & Resource Display | 2 | Three counts per player read from state (FR-36). Small because section 6.7 of the game design document rules out the resource system the issue title names, so the issue is half what its title suggests. |
| #40 Audio Manager & SFX Integration | 3 | Four sounds, background music and a mute that survives leaving a match (FR-39 to FR-41). No asset exists yet; the estimate covers wiring, not sound design. |
| #41 Main Menu, Pause & Win Screen Flow | 5 | Five screens and the navigation between them (S1, S2, S8, S9 of [Obligations-Book.md](Obligations-Book.md)), plus match restart and abandon (FR-06, FR-07). |
| **Epic total** | **10** | |

### 3.5 Extended features, no epic

| Issue | MoSCoW | Points | Rationale |
| --- | --- | --- | --- |
| #42 Online Multiplayer & Lobby System | should have | 13 | **A 13 here is a statement, not a measurement.** No networking technology is chosen, no architecture question is answered, and the requirements specification describes it in one line. The number says the item is too large and too undefined to estimate honestly, which is also why the specification names it as the single largest cut available. |
| #43 LLM-Powered Bot API Integration | could have | 8 | Needs a legal-move consumer, a decision policy and an external API with a key and a failure mode. The `core/` layer being headless is what makes it possible at all. |
| #44 Expanded Skill Card Set | could have | 3 | By construction a data-plus-one-function addition per card (FR-29), so the cost is per card and the engine does not change. |
| #45 Trap Card System & Tile Trigger Logic | could have | 5 | The first mechanic that fires on entering a square rather than on a player action, so it adds a trigger point to the turn sequence. |
| #46 Classic vs. Custom Game Modes | could have | 5 | Rule toggles reach into every rule module. It is the one issue carrying the `question` label, which fits: what is toggleable is undecided. |

### 3.6 Work with no board issue at all

Found while writing the obligations book and this document. **None of these has an issue, so the board
does not show them and no burn-down would ever count them.**

| Work | Class | Points | Rationale |
| --- | --- | --- | --- |
| Project bootstrap: `package.json`, Vite, ESLint, Prettier, Vitest, Playwright, the 11 npm scripts of `CLAUDE.md` | must have by necessity | 5 | Nothing else in this table can start without it. It is Sprint 1 scope in the feasibility study's first condition and was not done in Sprint 1. |
| i18n setup and the two locale files | must have (FR-34, NFR-03) | 5 | A `must have` requirement with no issue. Not a large piece of work, but it touches every user-facing string in `ui/`, so doing it late is more expensive than doing it with the first view. |
| CI workflow `build-check.yml` | no requirement id | 2 | The five gates named in section 6 of [Test-Plan-and-Quality-Strategy.md](Test-Plan-and-Quality-Strategy.md). |
| **Total invisible to the board** | | **12** | |

The recommendation in section 6 is to create these three issues. This document does not create them:
adding issues to a shared board is the team's decision, not a side effect of an estimate.

---

## 4 Totals

### 4.1 By epic

| Group | Points |
| --- | --- |
| #36 Core Game Engine & Board | 23 |
| #37 Enhanced Dice Pool System | 8 |
| #38 Skill Cards Mechanics | 23 |
| #39 UI / UX, Audio & Game State | 10 |
| Extended features (#42 to #46) | 34 |
| No board issue (section 3.6) | 12 |
| **Implementation total** | **110** |

### 4.2 By MoSCoW class

| Class | Points | What is in it |
| --- | --- | --- |
| Must have | 74 | The four epics (64) plus the bootstrap and i18n (10) |
| Should have | 13 | #42 online multiplayer |
| Could have | 21 | #43, #44, #45, #46 |
| No requirement id | 2 | The CI workflow |
| **Total** | **110** | |

**Two thirds of the remaining implementation work is `must have`**, which is the same finding the MoSCoW
distribution already made from the other direction: 39 of 57 requirements are must-haves because a game
missing a rule is not partially playable. Section 3.2 of the requirements specification argues it. The
estimate turns it from a count into a cost: the droppable work is 36 points of 110, and none of it is
load-bearing for a playable match.

### 4.3 Documentation still open

Counted separately, because it is not implementation and competes for the same two people.

| Issue | Points | Note |
| --- | --- | --- |
| #3 Create Design System | 5 | Developed with Claude Design; the palette, spacing and typography that the obligations book deliberately does not contain. |
| #17 PSP: Project Structure Plan | 2 | Should adopt the tree of section 2 rather than invent one. |
| #19 Finalization Documentation | 8 | The report itself. Written from the chapter notes, which is the reason it is an 8 and not a 13. |
| #20 Project Closure Report | 3 | |
| #24 Usability & Playtest Evaluation | 5 | Needs the playtest instrument the test plan names as missing. |
| #25 Presentation Deck & Live Demo Prep | 5 | Includes the fallback video. |
| **Total** | **28** | |

**Grand total of everything open: 138 points.**

---

## 5 Capacity check

### 5.1 What velocity data exists

**None that can be used.** This is the finding, so it comes before the arithmetic.

- Sprint 0 closed 7 issues and Sprint 1 closes 8 of its 13 at the earliest. Both are **issue counts**,
  and no story point was ever assigned to any of those issues, so neither can be converted into a point
  velocity.
- Every issue closed so far is a document. Nothing in the counts above says anything about the rate at
  which this team writes code, because this team has not yet written any.
- One data point is not a velocity in any case, and two data points from a different kind of work are
  not either.

So the check below is a **required rate**, not a forecast. It says what would have to happen, and the
first sprint that records points against closed issues is the first time it can be compared to anything.

### 5.2 The calendar that remains

Board dates, from [sprint-log.md](../Documentation/sprint-log.md):

| Sprint | Dates | Weekdays |
| --- | --- | --- |
| Sprint 2 | 2026-08-24 to 2026-09-06 | 10 |
| Sprint 3 | 2026-09-07 to 2026-09-17 | 9 |
| **Total** | | **19** |

Two implementers, because the Product Owner does not implement (the personnel finding of
[Feasibility-Study.md](Feasibility-Study.md)). No buffer sprint exists on the board, which is the
contradiction handed to the project plan, issue #15.

**Revised the same day, issue #15.** The 19 weekdays above assume implementation runs to the last day
of the board calendar. It does not: section 2.2 of [Project-Plan.md](Project-Plan.md) puts a feature
freeze on 2026-09-11 and reserves 2026-09-14 to 2026-09-17 for the playtest, the deck, the fallback
video and the report. **Implementation therefore has 15 weekdays, not 19.** The rates in section 5.3
are left as they were computed rather than overwritten, and the project plan carries the corrected
figure of 4.9 points per weekday next to it. Both are printed because the difference between them is
the cost of putting the closing work in the calendar instead of leaving it implied.

### 5.3 The required rate

- **Must have alone: 74 points over 19 weekdays** is about **3.9 points per weekday** for the two
  implementers together, or roughly 1 point per person per half day sustained without interruption for
  three and a half weeks.
- Adding the 28 documentation points that also have to be produced by the same two people takes it to
  **102 points over 19 weekdays**, about **5.4 per weekday**.
- Both figures assume no sick day, no rework, no time spent on the 8 unsigned gameplay rules changing,
  and that the bootstrap, which nothing else can start without, is done on the first day.

### 5.4 The finding, printed either way

**The must-have set does not fit the remaining calendar as scoped.** The judgement rests on three facts
rather than on the rate arithmetic, which is only as good as an unvalidated point scale:

1. **Zero of 110 implementation points are delivered**, and 19 weekdays remain of the 41 the board's
   calendar spans. Two of the four sprints are over. The written plan had Sprint 1 deliver core
   gameplay, and Sprint 1 delivered documentation, so the whole implementation total is still ahead of
   a team that has not yet written a line of code together.
2. **The largest items are all still ahead**: #33 at 13, #27 and #28 at 8 each, which is 29 points in
   the three issues that are hardest to parallelise between two people, because each is the integration
   point the others depend on.
3. **12 points of must-have work are not even on the board** (section 3.6), so any plan drawn from the
   board today understates the remaining work.

**What follows, and it is a scope conversation rather than a silent cut.** The drop order of section 3.3
of the requirements specification is now live, and applying it in order removes 36 points: the four
could-haves (21) and online multiplayer (13), plus the CI workflow (2) if it comes to that. That leaves
74 must-have points, and **no must-have is droppable without the deliverable ceasing to be a game**. So
the only remaining levers are the calendar and the quality bar, both of which belong to the Product
Owner and to the project plan of issue #15.

The one lever the estimate itself suggests: **#28 should be split** into the legal-move rule and the
movement animation, because the rule blocks four other issues and the animation blocks nothing. That is
sequencing rather than scope, and it costs nothing to do.

---

## 6 Board action, blocked

The plan for this issue was to add a `Story Points` number field to the board and back-fill it from
section 3. **It could not be done.** The `gh` token carries `gist`, `read:org`, `read:project`, `repo`
and `workflow`, and `gh project field-create` answers:

```
error: your authentication token is missing required scopes [project]
```

`gh auth refresh -s project` is an interactive browser device flow, so this is a step a human has to
perform once per machine. Until it happens, or until the field is created by hand in the browser, the
estimate lives in this document only and the velocity slide of the buffer sprint stays unproducible.
The same gap blocks moving board cards; it is recorded in
[notes/02-project-management.md](../Documentation/notes/02-project-management.md).

Four board actions are outstanding, in the order they should be taken:

1. Create the `Story Points` number field and back-fill it from section 3. One sitting, and it converts
   the velocity slide from impossible to possible.
2. Create issues for the three items in section 3.6, so the board stops understating the work by 12
   points.
3. Split #28 into the rule and the animation, per section 5.4.
4. Add MoSCoW labels to the 17 implementation child issues, which currently inherit their class from
   their epic and carry none of their own.

---

## 7 What this estimate does not cover

- **It is not validated.** No item has been built, so no estimate has been checked against an outcome.
  The first three issues closed with points recorded are what turns this from a guess into a scale.
- **It was produced by one estimator**, as stated in section 1. A planning poker round with three people
  would move individual numbers, and the totals should be expected to move with them.
- **It says nothing about hours or about calendar effort per item.** Points are relative sizes, and the
  project decided against hour tracking on 2026-08-06.
- **Burn-down remains impossible even with points.** A burn-down needs dated status transitions or a
  GitHub Iteration field, and the board has a plain single-select `Sprint` field and no dated history.
  Points fix the velocity half of the problem and not the burn-down half.
- **The 8 unsigned rules are a live risk to these numbers.** Section 9 of
  [Game-Design-Document.md](Game-Design-Document.md) is unsigned by the Product Owner. An override on
  FR-12 to blocking, named there as the most expensive of the three alternatives, would change the
  legal-move calculation for every player and would move #28 upward on its own.
