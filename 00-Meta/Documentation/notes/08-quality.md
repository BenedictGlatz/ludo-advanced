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

## Decisions

<!-- Promote decision blocks here from project-journal.md when this chapter is written. -->

## Open / to verify

- ~~No tests exist yet.~~ **One does, 2026-08-29: a smoke test.** No coverage figure has ever been
  produced over real code. Do not write a number here: write the command in Chapter 09 and quote its
  output once it has actually been run.
- **No end-to-end test exists and Playwright has never been run.** `tests/e2e/` is empty, so
  `npm run test:e2e` would report no tests found, and the browsers have not been downloaded with
  `npx playwright install`. Both land with the board view.
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
