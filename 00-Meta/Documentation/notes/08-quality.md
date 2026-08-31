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
| `greyscale.spec.js` | The four seats told apart without colour | NFR-12 |

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

#### Negative finding: `greyscale.spec.js` fails, and is marked as expected to fail

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
- **No CI/CD pipeline exists.** `Brainstorming.md` proposes a `build-check.yml` build-validation
  workflow on every PR, plus optional playable build artifacts. Nothing is implemented. If the
  project ships without CI, this chapter says so plainly and gives the reason: the sample report
  scored well doing exactly that with its missing formatter. **2026-08-22:** the five gates such a
  workflow would run are now named in section 6 of the test plan (lint, test, coverage against the
  NFR-05 floor, build, E2E on the NFR-10 browsers), and so is the sentence the report uses if it never
  lands: the gates were enforced by discipline rather than by a machine, which is a weaker control and
  is named as one. The workflow itself is still not written.
- **The *Test coverage discipline slips* risk row was deliberately not re-rated** when the test plan
  landed, 2026-08-22. A document describing gates does not run them, so the likelihood of the risk is
  unchanged by writing it down. Only the mitigation column was updated, to point at the plan and the
  Definition of Done. Worth stating in the report as a case of a mitigation recorded without a rating
  change, since the two are usually assumed to move together.
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
