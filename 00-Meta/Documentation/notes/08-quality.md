# 08 Quality

> **Covers:** the test strategy: unit tests, coverage, E2E tests, CI/CD, and code documentation.
> **Does not cover:** the tools themselves, which are Chapter 07. This chapter is about what the
> testing *achieves*, not how it is configured.

## What this chapter must answer

- The test strategy as a whole, in one opening sentence: which layers are tested how, and why the
  split falls where it does.
- Unit tests: framework, what is covered, how many. The count comes from a command in Chapter 09.
- Coverage: the figure per directory, and **what it means**. A coverage number printed without an
  interpretation is a wasted table.
- E2E tests: which player-facing flows, what each asserts, how long they take.
- CI/CD: what runs on which trigger, in what order.
- Code comments and structure.

## Facts

### Declared targets

From [CLAUDE.md](../../../CLAUDE.md):

- Every rule change in `core/` ships with its unit test in the same commit.
- Every player-facing flow has an E2E test: take a turn, pick a dice card, play a skill card,
  capture a pawn, win.
- Coverage target: **≥ 80 % of lines in `src/core/` and `src/state/`**. `ui/` is covered through E2E
  instead of unit tests.

The reason the target applies only to `core/` and `state/` is worth stating explicitly in the
report: those two layers are pure and browser-free by construction, so they are cheaply and
meaningfully unit-testable. `ui/` is not, and a coverage number for it would measure how much jQuery
was executed rather than whether anything works.

### Strategy written: 2026-08-22, issue #23

Full document: [Test-Plan-and-Quality-Strategy.md](../../Project-Management/Test-Plan-and-Quality-Strategy.md).

- **The strategy in one sentence, which is the opening this chapter asks for:** the rules are tested as
  functions, the game is tested as a flow, and the feel is tested by people.
- **Four levels, each with what it cannot catch recorded next to what it owns:** Vitest unit tests over
  `core/` and `state/`; Playwright end-to-end over `ui/` in a real browser; a manual playtest for game
  feel, which is evidence and not a regression check; ESLint and Prettier for style and, if
  `no-restricted-imports` is configured for it, the layering rule.
- **The split follows the layering rather than being imposed on it.** `core/` and `state/` are DOM-free
  by construction (NFR-01), so a unit test is a function call with no fixture beyond its arguments;
  `ui/` correctness is what a player sees, which is a browser question.
- **The layering rule is itself a test.** NFR-01's criterion is that `core/` unit tests run with no DOM
  environment configured, so a `core/` module importing jQuery fails a test run rather than a review.
- **12 end-to-end flows**, derived from the requirements rather than from the screens, each mapped to
  its FR ids: match setup for 2, 3 and 4 players, a full turn, the dice card pick, leaving the start
  area, a capture, an Action card, a Reaction inside an open window, a turn with no legal move, the
  legal-move highlighting, the win, the restart, the locale switch.
- **Two flows named and deliberately unscheduled:** pause and abandon (FR-07), covered only by the
  restart flow's reset assertions, and mute (FR-41), which has no flow because audio has no test
  strategy. Both are `should have`.
- **16 unit test case rows plus one per skill card**, taken from the 13 edge cases settled in section 8
  of the game design document and assigned to the `core/` module that owns each rule. The rulebook was
  written before the test plan for exactly this reason: an unsettled edge case can only be guessed at,
  not asserted.
- **Coverage is a floor and not a goal.** 80 % of `core/` lines with those edge cases untested would
  satisfy the number and miss the point, which is why the case list is its own section. The figure is
  reported with an interpretation or not at all.
- **NFR-09's injectable RNG is recorded as a testability requirement**, not an implementation detail:
  without it every case that names a roll is unassertable.

### Definition of Done, written 2026-08-22 for the first time

Section 5 of the document. It had never been written down anywhere, and its absence was a named
condition of the feasibility verdict, a prerequisite in the SMART analysis, and the reason all four
SMART sub-goal criteria (*epic closed*) were not comparable between three people.

- **Three levels, because "done" differs for an issue, a sprint and a release.** Issue: merged into
  `dev` with one approval, acceptance criteria met, unit tests in the same commit, lint and tests
  passing with coverage not below the NFR-05 floor, the 300-line and no-hardcoded-string limits held,
  notes plus journal plus changelog written, the prompt log entry present, and the issue closed
  explicitly with its board card moved. Sprint: every issue done or explicitly moved out with a reason
  in the sprint log, the sprint log's delivered and divergence entries filled, and `dev` mergeable.
  Release: `dev` merged into `main` by pull request, a playable static build, and the E2E suite passing
  on the NFR-10 browsers.
- **The issue-level list is deliberately split into a code half and a record half**, steps 1 to 5 and 6
  to 8. The record half is the one skipped under pressure, so it is numbered rather than implied.
- **Three gates deliberately excluded**, each with its reason: no review checklist beyond one approval,
  because a checklist a three-person team will not use makes the definition less honest; no performance
  gate, since NFR-11 is measured once during the buffer-sprint playtest; no accessibility gate beyond
  NFR-12's greyscale check, verified once per release.
- **Step 8 encodes two known mechanics, not a formality:** `Closes #<n>` fires only on a merge into the
  default branch, and moving a board card is manual while the `gh` token lacks the `project` scope.

### Test infrastructure in place: 2026-08-29, issue #63

- **Vitest runs with `environment: "node"`**, which is NFR-01's acceptance criterion made real rather
  than a default that happened to be kept: there is no DOM in a unit test run at all.
- **The layering rule is now also a lint failure, not only a test failure.** `no-restricted-imports`
  and `no-restricted-globals` over `src/core/**` were verified by deliberately writing a violating
  file, which produced three restriction errors and exit code 1. Details in
  [07-tooling.md](07-tooling.md).
- **The coverage threshold is configured at 80 % of lines over `src/core/**` and `src/state/**`**,
  with `all: true`, so a module that no test imports is counted rather than left out of the
  denominator. Leaving it out is the one way a coverage floor can be met while the code gets worse.
- **Negative finding recorded at the bootstrap, and now closed:** with both directories empty, v8
  measured `0/0`, printed `Unknown%` and the threshold did not fire, so `npm run test:coverage`
  passed for a reason unrelated to quality. **From #26 onward there is real code to measure**, and it
  does.
- **Negative finding that is still open: the coverage report's per-file table renders empty.**
  `npm run test:coverage` prints correct totals and then a table with a header, a separator and no
  rows, so the per-directory figure NFR-05 asks for cannot be read from the terminal. The workaround
  is in `vitest.config.js`: `json-summary` is added to the reporters and the per-file numbers are read
  out of `coverage/coverage-summary.json`, where they are correct. Recorded in
  [09-source-code-overview.md](09-source-code-overview.md) next to the command.
- **One test exists and it is a smoke test.** `tests/unit/smoke.test.js` asserts `1 + 1 === 2` and
  proves the runner works. It is called that in its own comment and in the commit that added it,
  rather than being counted toward anything.

### The first real unit tests: 2026-08-29, issue #26

`tests/unit/core/board.test.js`. Counts and the coverage figure are in
[09-source-code-overview.md](09-source-code-overview.md).

- **The test layout mirrors `src/`**, so `src/core/board.js` is tested by
  `tests/unit/core/board.test.js`. `CLAUDE.md`'s architecture section asks for the mirror; its
  example command shows a flat `tests/unit/dice-pool.test.js`. The mirror wins, because it is the
  binding statement and because a flat directory stops being navigable at about eight modules.
  `tests/unit/smoke.test.js` stays flat, since it tests nothing in `src/`.
- **Six groups of cases**, one per export plus one for the constants: the constants against section 2
  of the rulebook, `entrySquare`, `turnOffSquare`, `absoluteSquare`, `region`, `homeColumnStep` and
  `isSameSquare`.
- **Three cases are exhaustive loops rather than samples**, and this is the part worth carrying into
  the report. A claim about a board's topology is a claim about *every* position, so:
  - every one of the 52 track positions is checked to be visited exactly once per lap, for all four
    players;
  - every pair of distinct players is checked against every pair of home column steps, so "two
    players' home columns never overlap" is asserted 300 times rather than once;
  - every home column position is checked against all 52 track positions.

  A sample-point test would pass on a wrong modulo. These do not.
- **Boundary cases are tested at the boundary**, not near it: `region` is asserted at `r` = 0, 1, 52,
  53, 57 and 58, which are exactly the five places the four regions meet, and a separate case walks
  all 59 positions and counts how many fall in each region.
- **Errors are asserted too.** Every function rejects a player outside 0 to 3 and an `r` outside 0 to
  58 with a `RangeError`, and `absoluteSquare` rejects a position that is not on the shared track.
  Testing the refusals is what makes the validation a contract instead of a comment.
- **What is not covered yet, stated plainly:** nothing in this file tests a *rule*. Movement (#28),
  capture (#29) and the win condition are not written, so the 16 unit test cases the test plan derives
  from the rulebook's edge-case table are all still outstanding. This module is the coordinate system
  those rules will be written against, and coverage of it says nothing about them.

### The rulebook's edge-case table becomes a test file: 2026-08-29, issues #28 and #29

Section 8 of the game design document lists thirteen edge cases and how each is resolved. It exists
so that nobody has to re-derive them under time pressure. **Nine of the thirteen are now a test each**
in `tests/unit/core/`, and the test names are taken from the table rows rather than invented, so the
two cannot drift apart without a test name stopping making sense.

| Rulebook row | Test file |
| --- | --- |
| Roll would overshoot home | `movement.test.js` |
| No legal move at all | `movement.test.js` |
| Target square holds an own pawn | `movement.test.js` |
| Capture inside a home column | `capture.test.js` |
| Two own pawns on one square | `movement-edge-cases.test.js` |
| Entry square blocked by an own pawn on the maximum | `movement-edge-cases.test.js` |
| Entry square held by an opponent on the maximum | `movement-edge-cases.test.js` |
| Maximum rolled with an empty start area | `movement-edge-cases.test.js` |
| Last pawn captured while others are home | `movement-edge-cases.test.js` |

**The remaining four rows are all skill-card rules** (two reactions against one trigger, a reaction
against an Action card, the pool running out, a player at the hand limit). They belong to issue #38,
which is not in this branch, and they carry no test yet.

#### Two things tested as properties rather than as examples

- **"Two own pawns can never end up on one square" is checked by construction.** The test takes four
  starting positions, enumerates *every* legal move for *every* roll from 1 to 6, applies each one,
  and asserts that no two of the player's own pawns collide afterwards. An example test would prove
  the rule for the position it happened to pick.
- **"A pawn moved from `r = 0` to `r = 58`" is a scripted eleven-roll sequence** and asserts the
  exact position after each one, not just the last. This is one half of acceptance criterion SG1 in
  [SMART-Analysis.md](../../Project-Management/SMART-Analysis.md). The other half needs the state
  layer and the view.

### Shared test fixtures: 2026-08-29, issue #29

#### A shared fixture builder, because a rule is hard to see behind twelve pawn literals

`tests/helpers/fixtures.js` holds two builders and no tests. `pawnsAt(2, { "0.0": 52, "1.1": 13 })`
says which pawns are where and leaves the other six in their start areas.

`rngForRolls([6, 3, 6], 6)` is the injectable RNG required by NFR-09, written in terms of the rolls
the test wants instead of the raw floats behind them. **It throws when it runs out**: a test that
rolls more often than it scripted has stopped testing what it says it tests, and wrapping around
silently would hide that.

It sits in `tests/helpers/` rather than `tests/unit/helpers/` so the Playwright specs can use the
same builders later. Vitest only collects `*.test.js`, so nothing in it runs on its own.

#### A formatter setting changed because of these tests

`quoteProps` in `.prettierrc` is now `"preserve"`. Prettier's default strips quotes from an object
key when the key survives the round trip, which turned the fixture coordinate `"0.1"` into `0.1` in
some objects and left `"0.0"` quoted in others, because `0.0` would have become `"0"`. The keys are
coordinates and read as strings; `"preserve"` leaves the decision with whoever wrote the line.
Rejected: `"consistent"`, which quotes every key in an object only when one of them needs it, so an
object of purely decimal-looking keys still came out unquoted.

### The state layer under test: 2026-08-29, issue #27

The four state modules are tested from unit tests standing in for the view. That proves the intent
contract holds; it does not prove a jQuery handler can satisfy it, which is issue #62.

- **A complete match is played end to end on a scripted RNG and asserted to an exact final state.**
  87 turns, from the first draw to the win. Player 0 walks one pawn home at a time (a 6 to leave,
  nine 6s along the track, a 3 to land exactly on `r = 58`) while player 1 rolls a 1 every turn and
  can never leave. The test asserts the winner, the phase, the turn number and the position of all
  sixteen pawns. This is the other half of acceptance criterion SG1 and it is what NFR-09's
  injectable RNG exists for: without it, the test would be unwritable.
- **The "`ui/` cannot write state" rule is asserted three ways**, because it is the layering claim
  the whole architecture rests on: a rejected intent returns the very same object
  (`result.state === before`, not a deep-equality check); an assignment to a state field throws; an
  assignment to a pawn inside the frozen pawn list throws.
- **Turn rotation is checked for 2, 3 and 4 players**, over two full laps each, so the wrap is tested
  and not just the increment.
- **Every phase guard is asserted by calling every step out of order.** A state machine that accepts
  a transition out of order is not one, and six one-line assertions is a cheap way to say so.

#### The coverage number earned its keep, and the line figure alone would not have

The first measurement after #27 reported 99.53 % of lines and 97.53 % of branches. The line figure
looked finished. The four missing branches were not decoration:

| Missing branch | What it meant |
| --- | --- |
| The freeze path for a move that captures something | No test had ever resolved a capture **through the state layer**, only through `core/` |
| The refusal of `select-pawn` for a pawn with no move | A highlight could have been shown for a pawn that cannot move, and nothing would have caught it |
| Two counts of the same two gaps | |

Two tests closed them and the branch figure moved to 99.38 %. **The lesson for the report:** line
coverage was already at 99.53 % with both gaps open. Reading only the headline number would have
reported a tested layer and shipped an untested capture path.

**One line and one branch stay uncovered on purpose** and are recorded in
[09-source-code-overview.md](09-source-code-overview.md): `movement.js` returns a generic refusal
reason when every pawn of a player is already home, which means the player has won and no turn is
ever evaluated in that state. The line stays as a guard against reading from an empty array, and it
is written down rather than deleted or excluded from the measurement.

### NFR-03 becomes half a test: 2026-08-29, issue #64

NFR-03's acceptance criterion has two halves: *the two locale files have identical key sets*, and
*no literal user-facing string exists in `src/`*.

**The first half is a test and passes.** `tests/unit/i18n/locales.test.js` flattens both locale files
to dotted keys and compares the sets. It also checks three things the criterion does not name and
which a translator would otherwise get wrong quietly:

- **No translation is an empty string.** An empty string resolves to nothing on screen and looks like
  a rendering bug rather than a missing translation.
- **The same interpolation placeholders appear in both languages.** A German string saying
  `{{number}}` against an English one saying `{{player}}` would leave a gap in one of the two, and
  nothing else in the project would catch it.
- **Every key the code can emit has text in both files.** The keys come from `REFUSAL` in
  `core/movement.js` and `REJECTED` in `state/intents.js`, so a rule that gains a refusal reason and
  no translation fails this test rather than showing the player a raw key.

**The second half is not checked anywhere and that is a real gap.** "No literal user-facing string in
`src/`" needs a grep over `src/ui/`, which does not exist yet. The plan's own verification section
proposes `Select-String -Path src\ui\*.js -Pattern '>[A-Za-z]{3,}<'` with every hit inspected by
hand. It is outstanding until issue #62.

**One test asserts that a missing key resolves to the key itself** rather than to empty text. That is
i18next's default and it is worth pinning: while views are being built, a forgotten key is then
visible on screen instead of invisible.

### The end-to-end suite: 2026-08-30, issue #62

Seven spec files, run against the production build in Chromium, Firefox and Edge. Counts are in
[09-source-code-overview.md](09-source-code-overview.md).

| Spec | The flow it proves | Requirements |
| --- | --- | --- |
| `board-renders.spec.js` | The board on screen is the board the rulebook describes | FR-02, FR-08 |
| `pawn-leaves-start.spec.js` | A pawn leaves the yard on the die's maximum | FR-09, FR-32 |
| `pawn-moves.spec.js` | A pawn advances exactly the number rolled and nothing else moves | FR-10 |
| `capture.spec.js` | Landing on an opponent sends it home and takes its square | FR-11 |
| `no-legal-move.spec.js` | The turn passes and the reason is on screen, in German | FR-14, NFR-08, NFR-03 |
| `win.spec.js` | A whole match, clicked through, ends with a full house and names the winner | FR-05, SG1 |
| `greyscale.spec.js` | The four seats told apart without colour. Asserts four different shapes on the pieces since 2026-09-02; measured the palette's greyscale contrast before that | NFR-12 |

#### Every spec fixes the RNG, and the seeds were measured rather than guessed

`?seed=N` is read only by the composition root and makes the match repeatable (NFR-09). Choosing the
seeds was a small piece of work in itself: a script replayed matches headlessly using **exactly the
policy the tests use**, always activating the lowest-numbered pawn that can move, and recorded which
turn each situation first happened on. That is what makes "seed 9 captures on turn 8" a fact.

**Superseded on 2026-08-30 by issue #30, and the way it was superseded is the finding.** See below.

#### Two things the suite does not do, and why

**It does not sleep.** Every wait is on a board attribute. `?fast=1` collapses the two pauses in the
turn loop to zero, which changes the waiting and nothing else: the same intents run in the same
order. The one spec that does use a real clock is `no-legal-move.spec.js`, because D9's four-second
minimum is part of what it is testing.

**It does not watch `data-captured`.** That attribute is transient by design, cleared once the return
animation has run, so waiting for it would be a race. A pawn going from the track back to `r = 0` is
the rule itself and is not transient at all.

#### Resolved 2026-09-02: what `greyscale.spec.js` measures now, and what it used to

> The section below is the state from 2026-08-30 to 2026-09-02 and is **kept unchanged** as the record
> of it. What follows here is what replaced it.

Design handoff 06 put a shape per seat on the piece, so NFR-12 is met by a non-colour identifier rather
than by the palette. That changes what the test can honestly assert, and D50 of the spec decided it
explicitly rather than leaving the old case running against a threshold nothing was trying to reach.

**The first case now asserts the acceptance criterion as it is written.** For all sixteen pawns: the mark
has a non-zero rendered box, its computed `clip-path` is not `none`, the four pawns of one seat share one
shape, and the four seats have four different shapes. The whole block then runs a second time under
`html { filter: grayscale(1) }`. The filter changes what a pixel looks like and not what a box measures,
so the assertions are identical and the greyscale run is the criterion's own wording rather than a proxy
for it.

**The 1.30 luminance case is retired.** Its threshold was derived, not invented: four values spread evenly
in contrast-ratio terms across the range these hues span, blue at 0.2543 to yellow at 0.6336 relative
luminance, gives three equal steps of the cube root of 2.246, which is 1.31. The measured worst pair was
**1.146**, red against blue, ten greyscale levels apart out of 255. Both numbers are kept here and next to
NFR-12 in [01-requirements-and-goals.md](01-requirements-and-goals.md), because a figure that is no longer
asserted is a figure nobody re-runs, and the next person who proposes moving a seat colour needs it.

**Rejected: keeping it as a weaker check with a lower threshold.** 1.10 is the only threshold that both
passes today and means anything, and against a measured 1.146 that is four per cent of headroom. It would
fire on a colour tweak that harms nothing, while a real regression, two seats reducing to the same grey,
has to cross the 1.0 case that is already there. A guard that thin is a maintenance cost.

**What is kept** is the case asserting every pair clears 1.0, which is the floor below which the board
would be unreadable rather than merely hard, plus the both-skins case and the screenshot attachment.

**The process point worth the report.** From 2026-08-30 the suite carried one permanently red test on
purpose, so that an unmet requirement could not go quietly green. It stayed red for three days, it is
named in the sprint log, the risk register and three chapter notes, and it is what carried the question
into handoff 06. **There is now no expected failure anywhere in this project's test suites.** The pattern
is worth stating in general: an expected-failure marker is a way of writing a known gap into the one
artefact that gets run every day, and its whole value is that removing it requires fixing the thing.

#### Negative finding, 2026-08-30 to 2026-09-02: `greyscale.spec.js` fails, and is marked as expected to fail

NFR-12 asks for a second, non-colour identifier per player. D2 of design handoff 01 delivers colour
alone. The measurement, taken 2026-08-30 from the live tokens:

| Seat | Colour | Greyscale value, 0 to 255 |
| --- | --- | --- |
| 1 | yellow `#FFC93C` | 207 |
| 2 | green `#2FBF71` | 166 |
| 0 | red `#FF5D5D` | 147 |
| 3 | blue `#4C86F9` | 137 |

**Red and blue are ten levels apart out of 255**, a contrast ratio of 1.146. Red against green is
1.263. `01-Design/assets/board-greyscale.png` shows what that looks like: three of the four yards are
the same grey.

The threshold the test asserts is **1.30 for every pair**, and it is not an arbitrary number. Four
values spread evenly, in contrast-ratio terms, across the range these four hues already span, from
blue at 0.2543 to yellow at 0.6336 relative luminance, gives three equal steps of the cube root of
2.246, which is 1.31. So 1.30 is very nearly the best this palette can do without changing which
colours it uses, and falling short of it is a fact about the palette rather than about the threshold.

The test is marked `test.fail()`. The suite therefore reports a known failure rather than going green
over a requirement that is not met, and **if somebody widens the palette Playwright reports an
unexpected pass**, which is exactly the signal wanted. Row 8 of the Product Owner sign-off table
records the question.

### The seeds went stale on the first rule change, because the replay was never committed: 2026-08-30, issue #30

Replacing the stand-in die with the twenty-card Dice Card Pool made **all five seeds worthless in one
commit**. The pool draws from the same injected generator the die rolls from, so every `?seed=N`
played a different match from the one the specs were written against. Two of the twenty-four Chromium
tests failed immediately.

The seeds had been found by a replay script that was **used and then thrown away**, so re-deriving
them meant redoing work nobody could see. That is the cost, and it was entirely avoidable: the script
is 150 lines and the note above already called its output "a fact".

It is committed now as `scripts/find-seeds.js`, behind `npm run test:seeds`. Three properties make it
worth keeping rather than a convenience:

- **It imports the shipped modules.** `startMatch`, `dispatch` and `createDicePool` are the same
  functions the page loads, so its output is a fact about the code and not about a model of it.
- **It states its own policy in one place.** Choosing `hand[0]` and clicking the lowest-numbered
  movable pawn are written down next to the warning that changing either invalidates the seeds.
- **It reports a bound, not only seeds.** 400 of 400 two-player matches finish inside 600 turns,
  which is the evidence that the auto-choice gap in `ui/game-loop.js` costs turns and does not
  deadlock the game.

| Seed | Was | Now | What it produces |
| --- | --- | --- | --- |
| `leavesStartAtOnce` | 4 | **1** | 4 players, a pawn leaves on turn 1 |
| `advancesEarly` | 4 | **1** | 2 players, first advance on turn 3 |
| `capturesEarly` | 120 | **9** | 2 players, first capture on turn 8 |
| `passesOnTurnOne` | 1 | **2** | 4 players, no legal move on turn 1 |
| `winsQuickest` | 120 | **200** | 2 players, seat 2 wins on turn 80 |

#### Two specs were asserting the stand-in rather than the rule

`pawn-leaves-start.spec.js` asserted `expect(roll).toBe(6)` for "the maximum was rolled". That was
only ever true because the stand-in was a D6. **The view had no way to say which die was in play**, so
the test could not express FR-09 as written. `data-die` was added to the board's attributes and the
assertion is now `expect(roll).toBe(die)`, which is the rule. The dice hand in issue #31 needs the
same attribute anyway.

`win.spec.js` asserted that seat 0 wins and that the message reads "Spieler 1 hat gewonnen". Under
seed 200 seat 2 wins. Which seat wins is a property of the seed and never was a rule, so the spec now
names seat 2 with a comment saying why, instead of quietly assuming the first player.

The general lesson for the report: **a test that hard-codes a value the rules derive will pass for
the wrong reason until the derivation changes.** Both of these did.

### The locale split brought its own failure mode, and a test for it: 2026-08-31, issue #38

Splitting each language's text into `ui.json` and `cards.json` introduced a bug class that did not
exist while there was one file per language: **two files defining the same top-level key**. The merge
in `src/i18n/index.js` is shallow, so a plain spread keeps one side and discards the other in silence.

The symptom is what makes it worth a test. A dropped key does not throw, does not fail a build and
does not fail the existing key-set comparison, because that test compares German against English and
both languages would lose the same keys. It surfaces as a raw key such as `card.type.action` printed on
screen, possibly weeks later, with nothing pointing at the cause.

Three tests were added:

- **The shipped files own disjoint top-level keys**, checked per language. This is the one that would
  actually fire during development.
- **The merge throws on a collision**, checked against a hand-built pair of objects rather than the
  shipped files, so the guard stays tested once the shipped files are correct.
- **Both files reach the merged locale**, read through `LOCALES` rather than through `t()`, so a broken
  merge fails even before i18next is booted.

One more test was added for a reason that is not about the split: `card.dice.name` resolves to `W8` in
German and `D8` in English. It is the first assertion in the project that a card's own text differs by
language beyond translation of a sentence.

**Still outstanding, unchanged:** the second half of NFR-03, the grep for literal user-facing strings
in `src/ui/`, is still checked by nothing. `src/ui/` has existed since 2026-08-30, so the reason
recorded above ("it does not exist yet") no longer holds. The gap is now simply unaddressed work.

### A test that covers a shape instead of a field list: 2026-08-31, issue #38

`game-state.test.js` had three tests for immutability, and each one named the field it wrote to:
assign `activePlayer`, push onto `pawns`, set `pawns[0].r`. All three pass and all three are useless
against a field added tomorrow, which is the same weakness the hand-written freeze list had.

The generic deep freeze made a different test possible: `isDeeplyFrozen(createGameState(4))`. One
assertion covers the whole object, and it is the test that fails when a new nested field arrives
unfrozen. The three named tests were kept, because they are the ones that show a reader *what* throws.

**One test in `freeze.test.js` is written the awkward way on purpose.** `isDeeplyFrozen` shares its
notion of "is this a container" with `deepFreeze`, so a bug there would make both agree and both be
wrong, and every test written with `isDeeplyFrozen` would pass. So the main freeze test asserts
`Object.isFrozen` by hand on named paths, `state.legalMoves[0].captures[0]` among them. It is longer
to read and it is the assertion that would still fail.

The cycle guard has its own test, even though the game state cannot contain a cycle. The old
hand-written freeze named that guard as its reason for not being generic, so the claim that it costs
four lines is worth pinning down rather than asserting.

### The seeds went stale a second time, and one spec was rebuilt so it cannot happen to it again: 2026-08-31, issue #38

The skill square respawn draws from `deps.rng`, the same generator the die rolls from. Every seed in
`tests/e2e/helpers.js` therefore played a different match, and two specs in `capture.spec.js` failed
across all three browsers. Exactly the failure recorded here for issue #30, five days later, for a
different rule.

Two things were done about it, and only the second one is new.

**The routine fix:** `npm run test:seeds` regenerated the block. That is the whole point of having
committed that script rather than leaving it in a scratch file, and this time it cost one command
instead of an afternoon. `capturesEarly` moved from seed 9 to seed 95, `winsQuickest` from seed 200 to
seed 225.

**The fix that stops it recurring in one place:** `win.spec.js` used to assert the literal text "Spieler
3 hat gewonnen" and read the winner's pawns out of `positions["2.<index>"]`, because seed 200 happened to
be won by seat 2. Seed 225 is won by seat 0. That spec had now failed twice for a reason unrelated to
what it tests, and had twice been repaired by copying a new seat number into it.

The view now exposes `data-winner`, and the spec reads it. What it asserts is the rule: the winner's four
pawns fill the four house squares, and the message names that seat. It is seed-independent from here on.

**The general lesson, and it is the second time it has come up:** when a spec hard-codes a value that the
seed decides rather than a rule, the view is missing an attribute. `data-die` was added for the same
reason for issue #30. Worth checking the remaining specs against before the next rule that spends
randomness.

**One new spec, deliberately thin.** `board-renders.spec.js` checks that eight fields carry
`data-skill-square`, that they are the eight the layout says, and that no entry field is one of them. It
asserts no appearance, because there is none: D27 of design handoff 03 is unanswered.

### The unit tests for the skill squares state the rule, because no document does: 2026-08-31, issue #38

The respawn is the team's own rule, decided 2026-08-30 in answer to a question. There was no worked
example to check against and no requirement text either (see the negative finding in Chapter 05). So the
tests are written as invariants over 200 uses rather than as one expected board:

- the count on the board never changes, and no two squares ever coincide;
- no square ever lands on an entry square;
- a used square never comes back where it was;
- the returned list is always sorted, so the same board is the same array;
- the same seed produces the same sequence of boards and a different seed does not.

Two of them are worth singling out. The **28 candidates** test asserts the number the module comment
claims, so the arithmetic in that comment is checked rather than trusted. The **reachability** test plays
2000 respawns and requires all 28 to appear at least once, because a respawn that only ever used half the
board would satisfy every other test in the file.

### Testing a transcription, and testing an invariant: 2026-08-31, issue #38

Two new test files, and they are testing genuinely different kinds of thing.

**`cards/catalogue.test.js` tests a transcription.** The catalogue is 29 entries typed out by hand from
a generated artboard, so most of what can go wrong is a slip rather than a bug: a duplicated id, a card
in the wrong category, a Reaction whose trigger is the action phase.

The useful trick here is that the counts were taken **twice, independently**. Section 4.3 of design
handoff 03 counted 22 Action, 7 Reaction and 5/5/5/4 across the categories off the artwork before the
catalogue existed. The tests assert those numbers, so a slip shows up as two counts disagreeing and both
get looked at, rather than as a card quietly missing from a list nobody counted.

The catalogue also validates itself at import, which is a second layer on the same problem and worth
having: the test catches it in CI, the load-time check catches it in the browser for whoever is editing
the list. Neither is redundant, because the person adding card 30 is not necessarily running the tests
first.

**`skill-pool.test.js` tests an invariant**, and it is the reason that module exists. FR-27's acceptance
criterion is a property of the whole system, not of any step: every one of the 58 cards is in exactly one
of pool, a hand, or the discard pile, always. So the test plays 400 draws and discards across four hands
and asserts the total after **every single step**, not at the end.

Asserting after every step rather than at the end matters. A bug that loses a card and a bug that
duplicates one can cancel out over a long run, and an end-of-run check would pass. A second test covers
the duplication case directly: no card ever exists in more copies than the catalogue defines, which is
what would catch a reshuffle that copied the discard pile instead of moving it.

**One test deliberately exercises something that cannot happen.** Drawing from an empty pool with an
empty discard pile needs all 58 cards in hands, which four hands of five cannot hold. It is tested
because "cannot happen" arguments are how closed accounting quietly stops being closed, and the cost of
the test is three lines.

**Outstanding coverage, stated plainly:** no card effect is tested, because no card effect exists. The
catalogue says what 29 cards are and when they may be played; what any of them *does* is untested and
unimplemented. The rules sentences are also absent from the locales for the same reason, so the only
card text under test is the 29 titles.

### The suite had been running at the wrong resolution for two weeks: 2026-08-31, issue #31

`playwright.config.js` has said `viewport: { width: 1440, height: 900 }` since 2026-08-14, in its
top-level `use` block, with a comment explaining that NFR-10 is desktop only. **The suite was running
at 1280 by 720.**

Playwright's device descriptors each carry their own viewport, and every project spreads one:
`{ ...devices["Desktop Chrome"] }` sets 1280 by 720, and a project's `use` beats the config's `use`.
So the setting was overridden three times over, silently, and nothing failed.

It went unnoticed because until this commit no test measured the page. It surfaced the moment one did:
design spec 03 introduced a breakpoint at 84 rem, which is 1344 px, so 1280 is **below** it and the
whole suite had been playing the stacked fallback layout rather than the two-column one the design is
drawn for.

- **Fixed** by naming the resolution once as `DESIGN_VIEWPORT` and spreading it into each project
  *after* the device descriptor.
- **And the fix got its own test**, `shell.spec.js`, whose first case does nothing but read
  `page.viewportSize()` and assert 1440 by 900. A configuration mistake that no test can see is a
  configuration mistake that comes back, and this one is invisible by construction: the wrong value
  makes every other test pass.
- **The general lesson, worth a line in the report:** a setting that is silently overridden looks
  exactly like a setting that works. The only defence is a test that reads the setting itself, not the
  behaviour it is supposed to produce.

### A layout claim finally got a test, and it failed: 2026-08-31, issue #31

FR-31 wants board, dice hand, skill hand and refusal strip visible together without scrolling. Spec 01
said "the five-region layout is asserted, not built". Spec 03 built it and printed the arithmetic:
"page height 776. Nothing scrolls."

Measured at 1440 by 900 the page was **916 px tall in a 900 px viewport**. Two causes at once, and both
had been invisible for the reason above.

1. The delivered `app.css` had dropped the `body { margin: 0 }` that the placeholder it replaced
   carried, so the browser's 8 px default came back and every page was exactly `100vh + 16px`.
2. Nothing was measuring, and what measuring there was would have been at the wrong size.

`tests/e2e/shell.spec.js` now holds four cases: the viewport is what the config says, the page does not
scroll in either direction, all four regions sit inside the viewport, and below the breakpoint the
regions stack and are all still present. The last one is there so the third is not read as "nothing may
ever scroll": FR-31 asks for one screen at the design resolution, not at every size.

**One trap in writing it, worth recording because it also produced a wrong measurement by hand
first.** D31's dealing animation starts each card translated out of place, so a measurement taken while
it plays reports a card sticking out of the page and a scroll height that is real for 360 ms and gone
afterwards. The first hand measurement of a card came out 210 by 282 against the spec's 198 by 289, and
the card was simply mid-rotation. The spec table was right. The test polls until the page has settled
before it measures anything.

### The choose step landed and every spec had to be told about it: 2026-08-31, issue #31

Picking a dice card became a real player action, so a turn now has two waiting points instead of one.
Fourteen of the 25 Chromium tests failed on the first run, and every failure was a spec asserting
something about a game that no longer starts the same way.

- **Four specs assumed a match opens ready to move.** `pawn-leaves-start.spec.js` expected
  `data-phase="act"` straight after `openMatch`, and `no-legal-move.spec.js` expected `turn-end`. Both
  now pick a card first, through a small local `openAndChoose` helper. **Deliberately not folded into
  `openMatch`**: a match really does open with a choice to make, and hiding that in the opener would
  make every spec describe a game that does not exist.
- **`playUntil` changed shape.** It used to check its `done` predicate only when the phase was `act`.
  Now it asks once per *step*, and the step that matters is the one straight after a card is chosen,
  because at that point the roll is known and no pawn has moved: it is the only moment a caller can ask
  "is this the situation I was waiting for" and still act on the answer.
- **`capture.spec.js` lost a branch instead of gaining one.** Its loop had a "phase is not act, so wait
  for it" case that would now wait forever. It just calls `playTurn` every iteration, because a turn
  nobody can move in changes no position and therefore needs no special case at all.

#### The seeds did not go stale this time, and that was not luck

The seeds had to be regenerated for issue #30 and again for issue #38. This change touches what the
tests *click*, which is exactly the thing `scripts/find-seeds.js` has to agree with, so it looked like
a third regeneration.

It was not, because **the helper clicks slot 0 and slot 0 holds `hand[0]`, which is what the replay
script already picked.** The two policies stayed identical, so every seed produced the same match and
`npm run test:seeds` printed the same five lines. That agreement is now stated in both files, in the
helper header and in the script header, rather than being true by accident.

#### One racy spec was found by the change rather than caused by it

`pawn-leaves-start.spec.js` held `firstMovablePawn(board)` across the two clicks that end a turn. That
locator is live: the second click hands the turn over, the next seat's pawns become the movable ones,
and the assertion afterwards reads a *different* pawn that happens to also be at `r = 0`. It had been
passing on timing. The extra step shifted the timing and it started failing.

Fixed by resolving the pawn to its identity once, `[data-player][data-pawn]`, so the locator names one
element for the whole test. The class of bug is worth naming: **a live locator plus an action that
changes what it matches is a race, and it passes until something unrelated gets slower.**

### The dice hand's own spec, and what it deliberately does not check: 2026-08-31, issue #31

`tests/e2e/dice-hand.spec.js`, six cases. Every one is about the choice being real, not about how a
card looks: whether the ink outline is 3 px is not something a test should have an opinion on.

- Three face-up cards, all three offered, and the turn waits.
- Every card carries a denomination the pool actually holds, cross-checked against `POOL_COMPOSITION`
  rather than against a list typed into the test, and titled `W2` and not `2`.
- **The card the player picks is the one that gets rolled.** This test clicks slot **1**, deliberately,
  because clicking slot 0 would pass even if the click were ignored and the old automatic `hand[0]`
  were still in place. That is the one case that would have caught the bug this commit fixes.
- Once chosen, exactly one card is marked and none is playable: a second pick would be a second roll.
- The next turn's hand is fresh, with no mark and no result badge left over from a finished turn.
- **The whole thing works from the keyboard**, focus and Enter, which is NFR-08. The design styles
  `:focus-visible` on a card, and a focus state on an element the keyboard cannot reach is a state that
  never happens.

**Not covered, and it is the same gap as the board's:** `card-view.js` and `dice-hand-view.js` have no
unit tests. `vitest.config.js` runs with `environment: "node"` on purpose, as the second half of
NFR-01's criterion, so a `ui/` unit test would need a DOM configured and would weaken that guarantee.
The trade is stated in the config and is unchanged. What it costs here is real: `updateCard`'s handling
of a roll of `0`, which will matter once a card can subtract from a die, is currently unreachable by
any test.

### The seeds went stale a third time, and the script paid for itself: 2026-08-31, issue #38

`scripts/find-seeds.js` was written after the second regeneration, when the replay had to be rebuilt
from work nobody had written down. Issue #38 made it happen again, and this time it cost one command.

What changed is what the injected RNG is spent on. Two new claims on it, both at the very start of a
match or a turn:

| New draw | How many | When |
| --- | --- | --- |
| Shuffling the 58-card skill pool | 57 | Once, when the match starts |
| Drawing one skill card | 1 | Every turn |

Every seed therefore produced a different match from the same number. `npm run test:seeds` found new
ones, and **two of the five pinned seeds changed**: the capture seed and the win seed. The other three
kept working by coincidence, which is worth noting rather than celebrating.

The script itself needed three lines, because its replay policy has to match what the browser does step
for step, and the browser now walks through two extra phases and a reaction window. That agreement is
the script's whole value, and it is stated in both files rather than being true by accident.

#### The consequence that hit harder than the seeds

**Every unit test that scripts an exact sequence of rolls broke**, and not by one draw: by 57. A
scripted RNG throws when it is asked for a number it was not given, so the tests failed at
`startMatch` before the first die.

Two fixes, and the choice between them is recorded in the journal:

- `startMatch` now takes a `skillPool` override, the same way it already took `skillSquares`, and the
  tests that script rolls pass `[]` for both. That was the existing pattern, used a second time.
- The tests that are *not* about `startMatch` build their state from `createGameState` instead, which
  starts with an empty pool and therefore spends nothing.

**The general lesson, and it is the second one this project has learned about scripted randomness:**
anything that spends the injected RNG at match start silently invalidates every scripted test in the
project. It needs a test-side off switch on the day it is written, not on the day the tests go red.

### `turn-manager.test.js` was split because it grew past 300 lines: 2026-08-31, issue #38

The skill-square cases moved to `turn-manager-skill-squares.test.js`. The seam is a real one and not a
line count: every case in the new file pins the skill squares to one known place and asserts what
happens to **the board**, while the cases left behind assert what happens to **the turn**.

Worth recording because NFR-02 applies to tests as well as to source, and this is the first test file in
the project to hit the limit.

### The end-to-end suite grew a fourth waiting point, and the seed script caught up: 2026-08-31, issue #34

A turn now has **three** places it waits for a person rather than two: the dice card, the action phase,
and the pawn. Every spec written before issue #38 assumed the second one did not exist.

The fix is one helper, `carryOn`, and the thing worth recording is that it **asks the board rather than
assuming**: the loop skips the action phase by itself whenever the active player holds no playable card,
so a spec cannot know in advance whether the button will be there. Eleven specs needed one extra line
each and none of them needed rewriting.

#### `skill-hand.spec.js` deliberately pins no situation

Every other end-to-end spec plays a pinned seed and asserts an exact outcome. That cannot work for a card
hand: a hand is drawn one card per turn out of 58, so "seed 83 holds Hyperbeam on turn 4" is a fact about
the shuffle, and the seeds have already had to be repinned three times for exactly that kind of reason.

So these seven cases assert the **mechanism** and branch on whatever the shuffle produced: a card is
offered or it is not, clicking one either resolves it or asks for a target, cancelling gives it back.
`test.skip` with a stated reason is used where a branch does not apply, so a skipped case says which
situation did not come up rather than passing silently.

#### The seed replay had to be rewritten as a loop, and 330 seeds said so

`scripts/find-seeds.js` walked the automatic steps of a turn as a **straight line**: pass the action
phase, roll, commit, close. Issue #38 made that order not fixed, because rolling can open a reaction
window and closing a window leaves the turn still needing to roll.

The symptom was loud and specific: "the turn could not be ended" for **330 of 400 seeds**, and the
remaining 70 produced a different set of pinned seeds. Rewritten as a loop that asks what the state needs
next, it reproduces all five pinned seeds exactly, which is the cross-check that matters: the script and
the browser spend the injected RNG identically, and neither had to be told the other's answer.

**The near miss is the lesson.** The 70 seeds that still worked produced a plausible-looking block of
output. Pasting it in would have repinned every seed in the suite to values derived from a broken replay,
and the tests would have gone green on them.

### A test whose whole job is to make a generated directory honest: 2026-09-01, issue #39

`tests/unit/ui/card-art.test.js` is the second unit test under `tests/unit/ui/`, and like
`board-geometry.test.js` it needs no DOM, so it sits inside `environment: "node"` without weakening
anything.

It exists because `src/ui/art/index.js` reads its 36 files with `import.meta.glob`. That is the right
call for the module and it has one consequence: **a missing drawing is a runtime `undefined`, not a
build error.** So the test does not check a list of file names, which would be the same list twice. It
walks `SKILL_CARDS` and `POOL_COMPOSITION`, the real ones, and asserts every id and every denomination
resolves to something starting with `<svg`. A card added to the game without a drawing added to the
artboard fails here.

Three of the seven cases check the **extraction**, not the game: every drawing is `aria-hidden`, none
carries an inline `style` on its root element, and all of them keep a `viewBox`. Those are the two
transforms `scripts/extract-card-art.js` applies, and without a test they would be true only until the
next re-run of a script nobody reads.

`tests/e2e/dice-hand.spec.js` gained one case for the other half: that a drawing actually reaches the
page. The unit test proves the string exists and the spec proves it arrives, which is the gap a module
boundary hides.

### A spec that had pinned a defect: 2026-09-01, issue #39

`win.spec.js` asserted the literal string `Spieler ${winner + 1} hat gewonnen`. Renaming the players
broke it, and the break was the useful part: the assertion had encoded **two** things a test should not
own. The German wording, so any rewording would fail a test rather than change a JSON file. And the
seat-plus-one numbering, which was the defect itself, so the test was actively holding the bug in place.

It now composes the expected sentence out of `src/i18n/locales/de/ui.json`, filling `player.named` and
`match.won` the way `player-labels.js` does, and adds one line asserting that seat 2 is called "Spieler
2". The numbering is still checked; the prose is not duplicated.

**Worth carrying into the report:** a test that hard-codes rendered output looks like a strong assertion
and is a copy of the implementation. This one had been repaired twice already for seed changes, and its
own header says so.

### Coverage after issue #38

`ui/` is still not unit tested and that is unchanged and deliberate: `vitest.config.js` runs with
`environment: "node"` as the second half of NFR-01's criterion, so a `ui/` unit test would need a DOM
configured and would weaken that guarantee. The five new `ui/` modules are covered through Playwright
instead.

**What that costs, stated rather than implied:** `ui/timers.js` has no test of its own, and the one
behaviour it exists for, two named timers not cancelling each other, is exercised only indirectly by a
reaction window opening during a handover pause. That situation is reachable in play and no test forces
it.

### The HUD spec and the language spec: 2026-09-01, issue #39

`tests/e2e/hud.spec.js`, seven cases, and they are the first end-to-end assertions in the suite that are
about **words** rather than about attributes.

- **Two describe blocks in one file**, the HUD and the language switch, because they are two halves of
  one complaint: the game did not say anything in words. It named no player and it had no language
  control at all, although FR-34 makes one a must-have.
- **It checks no appearance.** Whether the active seat is marked by a ring or a fill is handoff 04's D36
  and the stylesheet is interim, so the spec asserts that the sentence is there, that exactly one seat
  carries `data-on-turn`, and that the numbers agree with the board.
- **The two-player case is a regression test with a name.** "renders one row per seat actually in the
  match, numbered from 1" would have failed before this sprint, reading "Spieler 1" and "Spieler 3".
- **The sum-to-four case runs before and after a turn**, which is FR-36's acceptance criterion turned
  into an assertion. A player reads three numbers as a breakdown of four pawns, so a total of three
  would be wrong even where each number looked plausible on its own.
- **The language case asserts the absence of the old language**, by pulling the page's whole `innerText`
  and searching it for the German words. FR-34's criterion is literally "no string remains in the
  previous language", and a per-element check cannot say that. It deliberately does not search for
  "Start", which is the same word in both files.
- **Both locale files are imported** rather than the expected strings being typed out, for the reason
  `win.spec.js` had just taught: a test that hard-codes rendered prose is a copy of the implementation.

**What is not covered:** the interim stylesheets have no visual regression test, so a layout that fits
at 1440 by 900 today and not after the next change would be caught only by
`skill-hand.spec.js`'s no-scroll assertion. That assertion is real and it did catch the HUD's first
version, which made the page 935 px tall.

### The flow spec, and the two bugs it found before a person could: 2026-09-01, issue #41

`tests/e2e/match-flow.spec.js`, eight cases over FR-01, FR-05, FR-06, FR-07 and FR-38.

- **It asserts the flow as a flow**, because FR-38's acceptance criterion is one sentence about a
  sequence: menu to match to pause to match to win to menu, without a reload. A pause screen that opens
  and cannot be closed passes every per-screen check there is.
- **"Without a reload" is tested rather than assumed.** A probe is written onto `window` before the match
  and read back after the restart; a reload would wipe it. Every other assertion in the file would still
  pass if the game secretly reloaded.
- **One case runs without `?fast=1`**, the handover, because the whole point of that screen is that it
  waits. It plays the turn by hand, checks the turn number does not move for 1.2 seconds, then presses
  Ready and checks that it does.
- **The restart case ends by counting three dice cards**, which is the cheapest observable form of "the
  pool came back whole" after the leak described in Chapter 06.

**Two defects were found by writing it, and both were invisible:**

1. Every overlay and chrome button went dead from the second match onward, because `.empty()` unbinds
   handlers on the children it removes. Everything still rendered, so the menu and the handover looked
   correct and simply did nothing.
2. Quitting to the menu left the abandoned match's board mounted behind the menu's opaque sheet, so
   eight pawns were still in the document while the player was on the main menu.

Neither is visible in a screenshot, and neither would have been found by playing the game once. That is
the argument for an end-to-end test of a **flow** rather than of a screen, and it is worth a paragraph in
the report.

**What the ten older specs cost:** one case, and it is the honest kind. `?players=` skips the menu,
which is a deliberate affordance in `main.js` and is documented there as load-bearing, and `?fast=1`
passes the handover. Both are the same compromise the suite already made for the thirty-second reaction
window: the shape of the turn is identical either way and only the waiting is gone.

The exception is `no-legal-move.spec.js`, which deliberately runs **without** `?fast=1` because D9's
four-second minimum is what it measures. Its last case asserted that the active player changes by itself
once the four seconds are up, and with the gate on it does not: the handover screen opens instead. The
requirement did not change and neither did the order, the reason is still readable for four seconds
before anything covers the board, so the case now waits for that screen and presses Ready. **The point
worth recording is that it failed rather than passing quietly**, which is what a timing assertion written
against a behaviour rather than against a duration buys.

### The suite outgrew `test.slow()`, and four failures were contention: 2026-09-01, issue #39

The first run of the full three-browser suite after issue #39 reported **four failures, and none of them
was a defect**. All four were the two tests that play a complete 77-turn match through the real
interface, on chromium and firefox but not on the project that happened to run last.

- **Measured:** 1.1 to 1.3 minutes each with three workers. `test.slow()` triples Playwright's default
  30 seconds to 90, which was enough while the suite was smaller.
- **What changed:** the suite went from 42 tests to 60, so Playwright's default worker count, half of
  sixteen cores, now has eight browsers running at once. Eight concurrent full matches pushed the two
  long ones past 90 seconds.
- **The fix is an explicit `test.setTimeout(240_000)` on those two describe blocks**, with the
  measurement in a comment above it. Rejected: pinning `workers` in `playwright.config.js`, which would
  have slowed all 180 tests to fix two.

**Why this is worth recording rather than quietly fixing.** A timeout failure and a real failure look
identical in the summary line, and the temptation is to re-run until it passes. What made the difference
here was that the same tests passed alone and failed together, twice, which is the signature of
contention rather than of a bug. **The dangerous version of this is the one that happens in CI**, where
`retries: 1` would have hidden it entirely and the suite would have been slowly getting less reliable
with nobody able to say when it started.

### A test that named a requirement and did not test it: 2026-09-01, issue #30

This is the most useful negative finding of the sprint for Chapter 08, because nothing was broken, no
test was failing, and the suite was reporting a requirement as covered that it was not checking.

**What FR-20 asks:** "over a large sample each face occurs with frequency consistent with 1/*n*".

**What `tests/unit/core/dice-source.test.js` asserted**, under the heading `rollDie (FR-20)`:

```js
it("covers the whole range 1..n and nothing outside it", () => {
  // ... 4000 rolls per denomination
  expect(seen.size).toBe(faces);
});
```

That is *reachability*: every face turns up at least once. **A die that returned the 1 in ninety per cent
of rolls and spread the other ten per cent over the remaining faces would have passed it**, at every
denomination, every run. Reachability and uniformity are different claims, and the test asserted the one
the requirement does not ask for.

The pool test had the same shape of gap against FR-16, "each defined denomination is reachable" over a
long run: `dice-pool.test.js` checked the `POOL_COMPOSITION` **table**, not what `draw` actually deals. A
`draw` that never returned a D20 would have passed, because the table would still have said two copies.

#### What was added, and how the tolerance was chosen rather than guessed

`tests/unit/core/dice-distribution.test.js`, 12 cases:

| What | Sample | Assertion |
| --- | --- | --- |
| `rollDie` per denomination | 60,000 rolls each | every face inside a band around `n/faces` |
| `draw` per denomination | 30,000 hands, 90,000 cards | every denomination inside a band around `copies/20` |
| The weighting itself | same sample | D6 : D2 is 2 to 1, D4 : D20 is 1.5 to 1, as ratios |
| The band's own sensitivity | 8,000 rolls | a deliberately skewed generator falls outside it |

For `n` trials of an event with probability `p`, a binomial count has standard deviation
`sqrt(n * p * (1 - p))`. The band is **four** of those. Four rather than three, because three sigma over
sixty-seven separate faces would be expected to fail somewhere by chance, and a suite with one known
flaky test in it stops being read.

**Every generator uses `createSeededRng` with a seed written into the file, and that is the decision worth
recording.** Rejected: a fresh seed per run, which is what a "real" statistical test would do. It buys
sensitivity to a bias that only shows on some seeds, and it pays for it with a test that fails one run in
some thousands for no reason at all. With a pinned seed the sample is the same sample on every machine and
every run, so the assertion either holds forever or it never held. It also means this file spends no
budget on the CI flakiness that would otherwise have to be diagnosed later.

The last case in the table is there because a tolerance nobody has tested is a tolerance that might be
wide enough to accept anything. It hands `rollDie` a generator that never returns the top fifth of
`[0, 1)` and asserts the band rejects it.

**Runtime cost of all of it: about one second**, measured, on top of a 2.45 s unit suite.

#### The lesson, and it is about names rather than about dice

The test was called `rollDie (FR-20)`. It sat directly under the requirement id, in a file organised by
requirement, and it had been read and approved twice. **A test with the right name and the wrong
assertion is worse than a missing test**, because the missing one shows up in a coverage gap or a
traceability table and this one shows up as a green tick next to the requirement.

Nothing in this project's process would have caught it. The Definition of Done asks whether a rule change
ships with its unit test, and it did. What is worth adding, and it is one sentence: **when a test cites a
requirement id, the check is whether the assertion is the acceptance criterion, not whether an assertion
exists.** The FR-16 to FR-21 traceability table in
[01-requirements-and-goals.md](01-requirements-and-goals.md) was written for this issue and is the first
place that check was actually performed against a requirement's own wording.

### Two new spec files, and the pause check that was borrowed: 2026-09-01, issue #30

- **`tests/unit/ui/pool-screen.test.js`**, 10 cases. Only the fourth unit test in `ui/`, after
  `board-geometry`, `card-art` and `player-labels`, and it exists for the same reason those do: the module
  is pure and what it claims has to stay true when the data behind it changes. Two of its cases are about
  FR-17 specifically, that the screen follows `POOL_COMPOSITION` rather than a list of its own.
- **`tests/e2e/dice-pool.spec.js`**, 8 cases per browser, 24 across the three. The one worth naming is
  "stops the match while it is open", which is the same 600 ms `waitForTimeout` plus `boardState`
  comparison that `match-flow.spec.js` gives the pause screen. **Borrowed deliberately rather than
  invented:** the two screens make the same claim about the loop, so they should fail the same way when it
  stops being true.
- **Neither needed a seed regeneration**, and that was predicted before the work started rather than
  discovered afterwards. The overview consumes no randomness: it reads `remaining()` and
  `POOL_COMPOSITION`. The five pinned seeds in `tests/e2e/helpers.js` are untouched and the full 204-case
  run passed first time on all three browsers. That is the entry from 2026-08-30 finally being used as a
  prediction instead of as a post-mortem.

#### A jQuery import made a pure function untestable, and no test failed to say so

`pool-screen.test.js` failed on its first run with `jQuery requires a window with a document`, before any
assertion. The cause and the fix are in [04-frontend-building-blocks.md](04-frontend-building-blocks.md);
what belongs here is the testing half.

`overlay-screens.js` has been in the same state since it was written and **it has no unit test, so nothing
ever reported it.** The module is pure, it returns a description rather than touching the DOM, and it was
covered through Playwright along with the rest of `ui/`. That is the right default and it is also what hid
the problem: Playwright runs in a browser, where jQuery imports fine.

**Rejected: `environment: "jsdom"` for these files.** The `node` environment is the guard that makes
NFR-01 enforceable rather than declared, and weakening it so one test file can import an enum would trade
a real check for a convenience. The enums moved instead.

The generalisable form for Chapter 08: **a test suite tells you about the code it runs, and says nothing
at all about code no test imports.** The first attempt to import a module is the first time that module's
dependencies are checked, which is an argument for writing the unit test even when the end-to-end suite
already covers the behaviour.

### Testing a single painted frame, and the two attribute checks that found a bug: 2026-09-01, handoff 04

Design spec 04 arrived with one ordering requirement and three new DOM attributes. Three tests went in for
them, and one of the three failed on the first run and was right to.

#### The MutationObserver test, because a frame is not something an assertion can see

D39's handover conceals the rail while the device changes hands. The requirement is an **ordering** one: the
rail has to be rewritten for the arriving seat while the curtain is still up, because no CSS can cover a
frame that has already been painted. Playwright's assertions all retry, so every one of them would pass a
page that showed the wrong thing for 16 ms and then corrected itself. That is exactly the failure this
requirement is about, which makes the whole assertion library the wrong tool.

What works is recording the order of the DOM writes instead of the pixels. Two MutationObservers, installed
after the handover screen is up and before the Ready click, both pushing into one array on `window`:

```js
watch(".hand--skill", "data-seat", "rail");
watch(".overlay", "data-open", "curtain");
// then, after the click:
expect(order.indexOf("rail:2")).toBeLessThan(order.indexOf("curtain:false"));
```

**It is deterministic and not a race**, and the reason is worth stating: both writes happen inside one
synchronous click handler, so there is no scheduling between them. The order in the log is the order in the
source. A test that had waited and then looked would have been flaky; this one cannot be.

It caught the defect it was written for. `openScreen(NONE)` was running before `loop.passTurn()`, so the
curtain came down over the leaving player's cards and then flipped. Recorded in
[04-frontend-building-blocks.md](04-frontend-building-blocks.md).

#### The attribute test that failed, and why that is a good outcome

`data-player` on `.app__chrome` was written by `match-flow.js` and cleared a few times per turn by
`render.js`, because **two files update the same element with different argument sets** and whatever one of
them omits, the other erases. The test failed in all three browsers on the first run with `unexpected value
"null"`.

The generalisable point for Chapter 08: this is a defect that no unit test could have found, because neither
file is wrong on its own. It only exists in the composition, which is the layer end-to-end tests are for.
It is also invisible without a test, since the attribute's only job is to feed a CSS selector, so the
symptom would have been a missing seat mark that nobody thought to look for.

#### One test was deliberately written smaller than the requirement

D40's abandoned win screen cannot be reached from the interface at all: nothing in `ui/` calls
`abandonMatch`. So the end-to-end test asserts what is reachable, that no screen leaves `data-outcome`
behind, and says in its own comment why the other half is missing and where it is covered instead
(`tests/unit/ui/overlay-screens.test.js`, which reaches both branches directly).

**Writing the smaller test and naming the gap is the point.** A test called "distinguishes a win from an
abandoned match" that quit to the menu and asserted an absent attribute would have passed forever while
checking nothing, and it would have read in a report as coverage of a requirement.

#### What the suite costs now

| | Before handoff 04 | After |
| --- | --- | --- |
| Unit test files | 38 | 39 |
| Unit tests | 549 | 554 |
| End-to-end files, per browser | 13 | 14 |
| End-to-end tests, per browser | 68 | 71 |
| Full end-to-end run | 204 | 213 |

Numbers are in [09-source-code-overview.md](09-source-code-overview.md) next to the commands that produced
them. `tests/e2e/match-flow.spec.js` hit 331 lines and was split into `handover.spec.js` along the same seam
the spec used for the stylesheets, which is where the extra e2e file comes from.

**The five pinned Playwright seeds did not need regenerating**, and that was predicted before the work
started rather than discovered afterwards: nothing in this delivery consumes RNG. Two full green runs
confirmed it. That is the third change in a row where the prediction was made in advance, after the first
two cost 45 minutes and then 5 minutes as post-mortems.

### CI/CD exists: 2026-09-02, issue #68

`.github/workflows/build-check.yml`, well inside the NFR-02 limit; the line count is in
[09-source-code-overview.md](09-source-code-overview.md), next to the command that produces it, which
gained `.github/*.yml` on the same day and for this file. It is the answer to the question this chapter has
carried open since it was created, and the sentence it replaces is the one three documents had already
written for the case that it never landed.

**What changed is not the gates. It is who runs them.** Every one of the five gates already worked and
every one already ran green. What none of them had was a trigger that does not depend on a person
remembering. Step 4 of the Definition of Done was an agreement between three people; from this commit
it is a condition of a pull request.

#### What runs, and on which trigger

Trigger: `pull_request` into `dev` or `main`, plus `workflow_dispatch` for manual re-runs. Not on
`push`, because the branching model routes everything through a pull request anyway and a push trigger
would double every run.

| Gate | Command | Job |
| --- | --- | --- |
| 1 | `npm run lint` | `checks` |
| 2 | `npm test` | `checks` |
| 3 | `npm run test:coverage` | `checks` |
| 4 | `npm run build` | `checks` |
| 5 | `npx playwright test --project=<engine>` | `e2e`, one job per engine |

**Two jobs and not one, and `e2e` declares `needs: checks`.** `checks` answers in a couple of minutes,
which is the feedback that is actually useful while a pull request is open. `e2e` is the slow half and
must not delay it. The dependency is also thrift: a broken lint rule should not cost two browser
downloads. Rejected: one job running all five gates in sequence, which is simpler to read and makes
the fast answer wait for the slow one.

#### Gates 2 and 3 are the same test suite, on purpose

`npm run test:coverage` runs the identical unit suite that `npm test` runs, only with the v8 reporter
and the NFR-05 threshold attached. Two steps is therefore a measured 3.26 s of duplicated work.

It stays, because the five steps map one to one onto the five gates named in section 6 of the test
plan, and a traceability table that needs a footnote explaining why five became four is worse value
than three seconds of runner time. The workflow says so in a comment at the top of the file, so that
the next person to read it does not tidy away something deliberate.

#### The coverage floor is not configured in CI, and that is the point

NFR-05's 80 % lives in `vitest.config.js` and nowhere else. CI runs `npm run test:coverage`, the same
command a developer runs, and gets the same failure for the same reason. **A threshold configured in
the workflow instead would mean the local command and the CI command enforce different things**, which
is the failure mode where CI is red and nobody can reproduce it.

#### Which gates stay local, and why

The issue asked for this list explicitly, and it is the honest half of the entry.

| Not in CI | Why | When it does run |
| --- | --- | --- |
| The `msedge` project of NFR-10 | It drives the **system** Edge rather than a Playwright-managed build, and a Linux runner has no Edge. Rejected: `npx playwright install msedge` on Ubuntu, the most fragile step in the file for the smallest gain, and a second `windows-latest` runner for one engine. | Locally, once per release, per the Definition of Done's release level |
| `npm run format` | Prettier is not one of the five named gates, and it ignores `*.md` and `00-Meta/`, so a `--check` gate would police a fraction of the repository. Adding it is a new rule and belongs in its own issue. | On demand, by whoever edits code |
| The manual playtest | It is evidence about game feel, not a regression check. Section 3 of the test plan already says so. | Buffer sprint |
| NFR-11, feedback within 100 ms | Measured once, during that playtest. | Buffer sprint |
| NFR-12, the greyscale check | Verified once per release. The automated part of it is in `greyscale.spec.js` and does run in CI; what stays manual is a person looking at the screen. | Per release |

**So NFR-10 is two thirds automated and one third disciplined**, and that is the plainest way to say
it. Chromium and Firefox are gated by a machine, Edge by a checklist.

#### Node 24, and a claim nothing checks

The workflow pins `node-version: 24`, matching the machines the team develops on. `package.json`
declares `engines: ">=20"`, and **nothing in this project verifies that floor**. Rejected: a matrix
over 20 and 24, which doubles the fast job to defend a compatibility promise this project never makes
to anyone. Nothing here is published as a package; the artefact is a static build.

#### `retries: 1` stays, and the report upload is why

This chapter recorded on 2026-09-01 that the dangerous version of a contention failure is the one that
happens in CI, "where `retries: 1` would have hidden it entirely and the suite would have been slowly
getting less reliable with nobody able to say when it started". That risk is now real and the retry
value did not change.

**The answer is not a different number, it is a readable artefact.** Playwright reports a test that
failed once and passed on the retry as **flaky**, not as a pass, and the workflow uploads
`playwright-report/` on success as well as on failure with `if: ${{ !cancelled() }}`. So the flaky
count is in a place somebody can look at. Rejected: `retries: 0` in CI, which turns every contention
blip into a red pull request and trains people to press re-run, which is the same blindness by a
different route.

#### Verification

Written and locally verified on 2026-09-02: gates 1 to 4 green on the `dev` merge base, e2e run over
chromium and firefox. **What the CI run itself proved is recorded below once it has actually run**, and
until then this section claims nothing about the runner.

### A rule change destroyed a test that had nothing wrong with it: 2026-09-02, issue #45

Eight cases went red when the trap rules were rebuilt, all of them predicted before the work started.
Seven were ordinary: an assertion named the old behaviour, the behaviour changed, the assertion was
rewritten. **The eighth is the one worth the report**, and it is a kind of test failure this project had
not met before.

`move-resolution.test.js` has one case whose whole purpose is to prove the **step order** inside
`resolveMove`: the pawn arrives, then a trap fires and can move it again, and only then is the square it
is *actually standing on* asked whether it hands out a card. Chapter 05 calls that order a rule, and it
is invisible in nearly every other test, because a trap and a skill square rarely meet. So this case put
them in each other's way on purpose: the pawn walked onto skill square 14 and a Banana Peel on square 12
knocked it home before it could collect.

**The test was correct, valuable, well commented, and it stopped testing anything.** Banana Peel now
stuns instead of sending the pawn home, and a stun does not move the pawn. So the pawn would have landed
on the skill square and collected the card, and the assertion `skillHands[0]).toEqual([])` would have
failed for a reason that had nothing to do with the step order. Worse, the plausible "fix" is to change
the expected hand to contain the card, which would leave the file with a green test whose comment claims
it proves an ordering it no longer touches.

It was rebuilt with It's Not That Deep, whose pushback still moves the pawn off where it landed, so the
ordering is demonstrated again. The rewritten case carries a paragraph saying what happened, because the
next person to change a trap rule will hit exactly this.

**Two lessons, and the second is the uncomfortable one.**

1. **A test can be destroyed by a rule change that has nothing to do with what it was testing.** The
   step order did not change. Only the fixture's ability to demonstrate it did. Nothing in a green or red
   signal distinguishes that from an ordinary expectation change.
2. **The dangerous direction is the one where the test still passes.** Had Banana Peel been changed to
   something that moved the pawn *slightly* rather than not at all, this case would have gone green with
   a fixture that no longer put a trap and a skill square in each other's way, and nobody would have
   looked. The only defence is that the comment above it says what the case is *for*, in words, so a
   reader can check the fixture against the intent. That is an argument for the comment density this
   codebase uses, from a case where it actually paid.

#### Where the trap tests live now

`fireTrap` moved to `core/trap-fire.js` and its tests moved with it, into
`tests/unit/core/trap-fire.test.js`.
The walk it sends a pawn on is a separate file, `tests/unit/core/enter.test.js`, and the two are split
along the same seam as the source: one asserts the **decision** a trap makes, the other asserts where the
pawn **ends up**. That is the split `notes/05` already records for the status cards, where the effect test
asserts the status is written and `move-rules.test.js` asserts it stops a pawn. It exists so that a
failure says which of the two halves is wrong.

`cards/trap-effects.test.js` keeps the placement half and shrank accordingly. Two new files rather than
growth in the old ones, and that was not a stylistic choice: `intents-cards.test.js` is close enough to
the 300-line NFR-02 limit that it cannot take a case, and the same is true of
`cards/effects.test.js`.

#### One inverted assertion, which is the good kind

`trap-effects.test.js` had a case named "does nothing at all for a blocker, and leaves it standing". It
now reads `expect(() => ...).toThrow()`. The old behaviour was a `switch` whose `default:` returned
everything untouched, which is correct for a blocker and also swallowed a missing rule for any future
trap kind in complete silence. **A test that asserted a silent no-op was locking in the thing that made
the silence possible.** Chapter 05 has the rest.

### The coverage report found dead code that a green suite and a line count both missed: 2026-09-02, issue #45

Worth its own entry because it is the first time in this project that a coverage percentage found
something rather than merely recording something.

**What happened.** Issue #45 added `core/slide.js`, a push that respects blockers and resolves
captures, and the plan was that `displace` in `core/displacement.js` would stay as the blunt push the
five displacement cards used. After the last card was routed through the new path, `npm run
test:coverage` reported `displacement.js` at **60 per cent lines**, with the body of `displace` as the
only gap, on a file that had barely been edited.

**Why nothing else would have caught it.** The suite was green, because a function nobody calls breaks
no test. `npm run lint` was clean, because an exported function with no importer is not an unused
variable. The 300-line check was happy, because the file got smaller. And a grep for the name returned
plenty of hits, all of them in prose: the module headers and four test comments all mentioned
`displace` as the thing `slide.js` was being contrasted with, which reads exactly like a live
reference.

**Two things this says about the setup, and they point in opposite directions.**

- The `all: true` setting in `vitest.config.js` is what made this visible. Its comment says it exists
  so that "a module nobody tested is simply absent from the report" cannot happen. That was written
  about untested files; it turns out to catch unreachable ones too.
- **A directory-level floor would have hidden it.** `src/core/` as a whole never dropped below 98 per
  cent, so the 80 per cent threshold NFR-05 asks for was never close to failing. The number that
  mattered was the per-file column, and the per-file table is the one the `text` reporter prints
  **empty** on this setup, which is the defect already recorded further up this chapter. It was read
  out of `coverage/coverage-summary.json` instead.

**What was done about it** is in chapter 05 and the journal: `displace` was deleted, `PUSHBACK_FLOOR`
and `sendHome` stayed. `src/core/` came out at 99.51 per cent lines afterwards with every function
covered, and the figures go in chapter 09 next to the command that produced them.

### The first end-to-end coverage of a trap, and the bug it found on its first run: 2026-09-03, issue #45

Two new spec files, `traps.spec.js` and `trap-fires.spec.js`, plus `trap-helpers.js`. There had been no
trap coverage at all: the one `grep -i trap` hit in `tests/e2e/` was the word used figuratively in a
comment.

#### `?stack=`, and why a seed could not do the job

Every existing spec reaches its situation by seed. That could not work here. A trap card is 4 ids out of
29, and the flow needs **two** turns to line up: one seat lays the trap, a different seat walks over it.
`skill-hand.spec.js`'s answer to the odds, assert the mechanism and skip when the shuffle dealt
something else, cannot cover a two-turn sequence.

Pinning a seed is worse, and `scripts/find-seeds.js` says why in its own header: it never plays a card,
"because a card played here would change what the RNG is spent on and every seed with it". It cannot
search for a seed whose shuffle deals a named card, and the seeds it does find have gone stale three
times already.

`?stack=` is a comma-separated list of card ids that becomes the skill pool. It changes no rule:
`startMatch` has accepted a stacked pool since issue #38 and its comment already recorded that no
production caller passed one. Same category as `?seed=` and `?fast=1`, read in `main.js` and nowhere
else. **Rejected:** exposing `dispatch` on the game loop so Playwright could place a trap directly. A
test that dispatches into `state/` is not testing a player-facing flow, and it would add a production
API that exists only for tests.

**One property of the stack that cost a failing test to learn:** it *replaces* the pool, and
`drawSkillCard` picks a random eligible card out of whatever is there. A stack of two different ids
therefore makes the first draw a coin flip. The spec that needs a second trap card stacks two copies of
the same id, which is also what the real pool holds of every card.

#### The two specs are one seam apart

`traps.spec.js` covers **laying** an object and seeing it: one turn, one click. Only the legal 36
fields are offered, the object and its owner are in the DOM, a blocker reads as a blocker, an occupied
field is refused, Janky RPG still gets all 40, the object survives the turn passing to another seat, a
field can be picked from the keyboard, and the tab order is clean afterwards.

`trap-fires.spec.js` covers a trap **going off**, which takes a match played until somebody walks into
it. It was split off when the first file reached the 300-line limit, and the seam is real: one file
asserts a click, the other drives a match.

#### The hardest assertion in the suite so far, and why the driving helpers could not make it

Under the new rules a Banana Peel does not move the pawn. Proving it fired means proving something
about a board that looks exactly like a board where nothing happened. Three things have to hold
together: the object is gone from the field, the pawn carries `stunned`, and the strip says so.

The third is the one the existing helpers cannot reach. The announcement is a turn-level field, wiped
when the turn passes, and `playTurn` and `playUntil` both wait past the turn before handing control
back. By the time either returns the message is gone. `playUntilTrapFires` in `trap-helpers.js` drives
the four phases itself and reads the strip **straight after the move**, which is the one moment the
message exists. `waitPastTurn` was exported from `helpers.js` to make that possible.

**Getting the trap to fire at all took a diagnostic run.** With four players, three other seats each
wait for the die's maximum to leave the yard, and sixty turns went by without one of them crossing the
trap. Two players halve the turn cycle, and `capturesEarly` is the seed where both seats are on the
track by turn 4. The spec still guards with `test.skip` for a match that ends first, because that is a
property of the seed and not of the mechanic, and the skip says which happened.

#### The bug the spec found on its first run

The diagnostic run showed the trap consumed on turn 6 and the strip **empty**. The report was being
produced by `core/enter.js`, carried through `trapChanges`, and dropped on the last step: `resolveMove`
repacked three of the four fields by hand into a `board` object and left `trapFired` behind. The pawn
list was right, the trap list was right, the status was right. The player was told nothing.

**No unit test had caught it because every existing case asserted the board**, and the board was
correct. Three regression cases now assert the field on the state `resolveMove` returns, including the
winning-move branch, which returns early with an object of its own and would have lost the message on
the one turn nobody gets to replay.

The fix was also a small design correction: `trapChanges` used to short-circuit to `{}` on an empty
trap list, which is why the caller could not simply spread its answer. It now returns the whole
`{ pawns, statuses, traps, trapFired }` always, so `resolveMove` uses it as it stands. That kept
`turn-manager.js` at exactly 300 lines, which it was already sitting on.

## Decisions

<!-- Promote decision blocks here from project-journal.md when this chapter is written. -->

## Open / to verify

- ~~No tests exist yet.~~ **One did on 2026-08-29, a smoke test.** As of 2026-08-30 there is a full
  unit suite and a full end-to-end suite; the figures are in Chapter 09 next to the commands.
- ~~**No end-to-end test exists and Playwright has never been run.**~~ **Closed 2026-08-30.** Seven
  spec files run in three browsers. One wrinkle worth recording: the first full three-browser run
  failed all 24 Firefox tests with `Executable doesn't exist`, because `npx playwright install` had
  only ever fetched Chromium. Nothing was wrong with the code. It is the kind of failure that reads
  as a cross-browser defect for the first minute and is a missing download, and the lesson is that a
  suite is not proven on an engine until it has actually run on it.
- **NFR-08 is only half testable.** Its criterion is that a playtester can say why a move was refused
  *without being told*. A test can check that the text is on screen, in the right region, in the right
  language and for long enough to read. Whether a person reads it is a playtest, and the playtest has
  not happened.
- ~~**No CI/CD pipeline exists.**~~ **Closed 2026-09-02, issue #68.** The history of this entry is
  worth keeping intact, because it is a three-step record rather than a single fact.
  **2026-08-04:** `Brainstorming.md` proposes a `build-check.yml` build-validation workflow on every
  PR, plus optional playable build artifacts. Nothing is implemented. **2026-08-22:** the five gates
  such a workflow would run are named in section 6 of the test plan, and so is the sentence the report
  uses if it never lands, that the gates were enforced by discipline rather than by a machine, which
  is a weaker control and is named as one. The workflow itself is still not written. **2026-09-02:**
  it is written, and the facts section above has the shape and the reasons. The prepared sentence is
  not needed and is deliberately left standing in section 6 of the test plan, marked as superseded:
  it is the evidence that the weaker alternative had been thought through rather than overlooked.
  The playable build artifacts of the original proposal are still not implemented and are still out
  of scope.
- ~~**The *Test coverage discipline slips* risk row was deliberately not re-rated**~~ **Re-rated
  2026-09-02, on the trigger the row itself named.** When the test plan landed on 2026-08-22 only the
  mitigation column moved, with the reason written into the row: a document describing gates does not
  run them, so writing it down does not change the likelihood. The row ended with the sentence *"The
  rating moves when `build-check.yml` lands, not when the plan is written."* It has landed and the
  row moved from M/M/3 to L/M/2. **This is the entry the report should quote**, because a register
  that names its own trigger in advance and then honours it is a different artefact from one that
  gets adjusted in hindsight, and the two are indistinguishable once the project is finished.
- **The `build-check` check is not a required status check yet.** It reports on a pull request and it
  does not block a merge: making it blocking is a repository ruleset, which needs a token with
  `admin` scope and is not part of issue #68. Section 7 of the test plan already records that no
  branch-protection ruleset is configured, and what the absence of one cost on 2026-08-09 when pull
  request #48 was merged without approval. **So the control is currently advisory**, and that
  distinction belongs in the report rather than a claim that CI gates the merge.
- ~~No decision on whether Playwright runs against the dev server or the production build.~~
  **Decided 2026-08-29 in `playwright.config.js`, exactly where the test plan said it would be:
  against the production build.** The `webServer` block runs `npm run build && npm run preview` on
  port 4173 and the suite points at that. Reason: the dev server serves modules straight off disk and
  hides the class of defect a build introduces, such as an asset the build forgets to copy or a path
  that only resolves in development. Cost: a `vite build` before every E2E run, a few seconds.
  **Rejected:** running against `npm run dev`, which is faster and exercises something the player
  never receives.
- **Three browser projects are configured for NFR-10**, `chromium`, `firefox` and `msedge`, with two
  limits stated rather than glossed over: Playwright ships one pinned build per engine, so "current
  **and previous** major versions" is not something the config can assert, and `msedge` drives the
  system Edge, so that project needs Edge installed on the machine running the suite.
- Lighthouse or comparable audits: not considered yet. Likely of limited value for a single-screen
  board game, but the report should say that rather than skip it.
