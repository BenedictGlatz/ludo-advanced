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

## Decisions

<!-- Promote decision blocks here from project-journal.md when this chapter is written. -->

## Open / to verify

- No tests exist yet. No coverage figure has ever been produced. Do not write a number here: write
  the command in Chapter 09 and quote its output once it has actually been run.
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
- No decision on whether Playwright runs against the dev server or the production build. Running
  against the production build catches things the dev server hides, such as assets the build forgets
  to copy. Named as undecided in section 8 of the test plan and settled in the commit that adds the
  Playwright config.
- Lighthouse or comparable audits: not considered yet. Likely of limited value for a single-screen
  board game, but the report should say that rather than skip it.
