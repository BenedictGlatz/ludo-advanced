# Test Plan and Quality Strategy

How Ludo Advanced is tested: which level tests what, which flows are covered, what counts as done, and
what is deliberately not tested.

The strategy in one sentence: **the rules are tested as functions, the game is tested as a flow, and
the feel is tested by people.** That split follows the layering of
[System-Architecture.md](System-Architecture.md) rather than being imposed on it, which is what makes
it cheap enough to hold under deadline pressure.

**No test exists yet.** The repository has no `package.json`, no `src/` and no test runner, so no
coverage figure and no test count has ever been produced. Every number in this document is a target or
a case list, never a measurement. Measurements live in
[notes/09-source-code-overview.md](../Documentation/notes/09-source-code-overview.md), next to the
command that produced them.

---

## 1 Test levels

| Level | Tool | Target | Owns | Cannot catch |
| --- | --- | --- | --- | --- |
| Unit | Vitest | `src/core/`, `src/state/` | Every game rule and every state transition, as function calls with no browser | Anything about rendering, layout or event binding |
| End to end | Playwright | `src/ui/` through a real browser | The player-facing flows of section 3, each asserted on what is on screen | Whether a rule is *correct*, only that the flow completes |
| Manual playtest | People | The whole game | Game feel, pacing, whether the pool composition produces a satisfying match, whether a first-time player understands the board | Anything repeatable. A playtest is evidence, not a regression check |
| Static analysis | ESLint, Prettier | Every file | Style, formatting, and the layering rule if `no-restricted-imports` is configured for it | Behaviour of any kind |

**Why the levels are split there and not elsewhere.** `core/` and `state/` are free of the DOM by
construction (NFR-01), so a unit test is a function call with no fixture beyond its arguments. `ui/` is
the opposite: its correctness is what a player sees, which is a browser question. Testing each layer
where it is cheap to test is the whole reason the layering exists, and section 5 of
[System-Architecture.md](System-Architecture.md) argues it from the other direction.

**The layering rule is itself a test.** NFR-01's acceptance criterion is that unit tests for `core/`
run with no DOM environment configured. A `core/` module that imports jQuery therefore fails its test
run rather than passing review, which is what makes the architecture rule enforceable instead of
aspirational.

---

## 2 Coverage

- **Target: at least 80 % of lines in `src/core/` and `src/state/`** (NFR-05), read from
  `npm run test:coverage`, which uses the v8 provider.
- **`ui/` carries no line-coverage target.** A coverage number for that layer would measure how much
  jQuery was executed rather than whether anything works. It is covered by the flows of section 3
  instead.
- **The figure is reported with an interpretation or not at all.** A coverage percentage printed
  without a sentence saying which rules are behind it and which are not is a wasted table. The report
  states what the uncovered lines are.
- **Coverage is a floor, not a goal.** 80 % of `core/` lines with the edge cases of section 4
  untested would satisfy the number and miss the point, which is why the case list exists as its own
  section.

The sample report this project models on printed a 12.67 % coverage figure, explained it, and scored
well. That is the standard here: if the target is missed, the number goes in the report with its
reason, and it is not quietly replaced by a claim about testing discipline.

---

## 3 End-to-end flows

One row per player-facing flow. The flow list is derived from the requirements rather than from the
screens, so a screen that serves no flow is visible as such.

| # | Flow | Asserts | Requirements |
| --- | --- | --- | --- |
| E1 | Start a match with 2, 3 and 4 players | Each count starts with that many players, four pawns each, all in their start areas | FR-01, FR-02 |
| E2 | Take a full turn | Three dice cards are offered, one is chosen, a roll is produced, a move is made, the next player becomes active | FR-18, FR-19, FR-04 |
| E3 | Pick a dice card | Exactly one of the three is rolled, the other two are not, and all three return to the pool | FR-19, FR-21 |
| E4 | Leave the start area | A pawn enters on the die's maximum and on nothing else, and lands on its entry square | FR-09 |
| E5 | Capture an opponent's pawn | The captured pawn is in its owner's start area and the capturing pawn holds the square | FR-11 |
| E6 | Play an Action card | The card leaves the hand, its effect applies, and it is not offered on another player's turn | FR-23, FR-26 |
| E7 | Play a Reaction card in an open window | The triggering action does not complete until every prompted holder has played or declined | FR-24, FR-25 |
| E8 | A turn with no legal move | The reason is stated on screen and the active player advances without further input | FR-14, NFR-08 |
| E9 | Legal moves are shown before committing | Selecting a pawn highlights only reachable squares, and an illegal move is refused with a reason | FR-32, NFR-08 |
| E10 | Win the match | The win screen names the winner within one turn of the fourth pawn arriving | FR-05 |
| E11 | Restart from the win screen | A fresh match starts with all state reset and no page reload | FR-06 |
| E12 | Switch the locale at runtime | Every visible string re-renders, and no string remains in the previous language | FR-34, NFR-03 |

Two flows are named and **not** scheduled, so that the gap is a decision rather than an oversight:
pause and abandon (FR-07) is covered by E11's reset assertions only, and mute (FR-41) has no flow
because audio has no test strategy in this plan. Both are `should have`.

### 3.1 Which spec file covers which flow, measured 2026-09-02

The table above was written on 2026-08-22, before any spec file existed. This one says where each flow
actually lives, so the plan can be checked rather than believed. Read from `tests/e2e/`, fourteen files.

| # | Flow | Spec file |
| --- | --- | --- |
| E1 | Start a match with 2, 3 and 4 players | `match-flow.spec.js`, `board-renders.spec.js` |
| E2 | Take a full turn | `match-flow.spec.js`, `dice-hand.spec.js` |
| E3 | Pick a dice card | `dice-hand.spec.js`, `dice-pool.spec.js` |
| E4 | Leave the start area | `pawn-leaves-start.spec.js` |
| E5 | Capture an opponent's pawn | `capture.spec.js` |
| E6 | Play an Action card | `skill-hand.spec.js` |
| E7 | Play a Reaction card in an open window | **No spec file.** See below |
| E8 | A turn with no legal move | `no-legal-move.spec.js` |
| E9 | Legal moves are shown before committing | `pawn-moves.spec.js`, `pawn-leaves-start.spec.js` |
| E10 | Win the match | `win.spec.js`, `match-flow.spec.js` |
| E11 | Restart from the win screen | `match-flow.spec.js` |
| E12 | Switch the locale at runtime | `hud.spec.js`, `match-flow.spec.js`, `dice-pool.spec.js` |

**E7 is the one flow with no end-to-end coverage, and it is the most complex rule in the game.** The
reaction window is covered at unit level in `tests/unit/state/reaction-window.test.js`, so the rule is
tested; what is not tested is the flow through a browser, where the window has to open, prompt every
eligible holder in turn order and hold the triggering action until each has played or declined. It is
named here rather than left to be noticed: **an untested player-facing flow is a known gap, and this one
is a should-have mechanic that a playtester will exercise on their first capture.**

**Five spec files serve no flow in the table**, which is the opposite check and is worth as much:
`shell.spec.js` (FR-31, one screen with no scrolling), `hud.spec.js` (FR-36), `handover.spec.js` (the
screen that only exists because skill cards are secret), `greyscale.spec.js` (NFR-12) and
`board-renders.spec.js` (the board's topology). Four of the five test non-functional requirements, which
is why the flow list derived from FR ids did not predict them. **The flow list is not wrong, it is
narrower than the suite**, and the report should say which of the two it is quoting.

---

## 4 Unit test cases for the settled edge cases

Section 8 of [Game-Design-Document.md](Game-Design-Document.md) settles 13 edge cases. Each becomes at
least one unit test, in the module that owns the rule. This table is why the rulebook was written
before the test plan: an edge case that is not settled cannot be asserted, only guessed at.

| Case | Module | Assertion |
| --- | --- | --- |
| Roll would overshoot home | `core/movement.js` | A pawn at `r = 55` has no legal move on a roll of 4 and one on a roll of 3 |
| No legal move at all | `core/turn-rules.js` | With every pawn blocked, the legal-move set is empty and a reason code is returned |
| Target square holds an own pawn | `core/movement.js` | The move is absent from the legal-move set, on the track and in a home column |
| Entry square blocked by an own pawn on the maximum | `core/movement.js` | Leaving the start area is illegal that turn |
| Entry square held by an opponent on the maximum | `core/capture.js` | The entering pawn captures and the opponent's pawn returns to `r = 0` |
| Maximum rolled with no pawn in the start area | `core/movement.js` | The roll resolves as an ordinary move |
| Leaving the start area, once per denomination | `core/movement.js` | For each of D2, D4, D6, D8, D10, D12 and D20, only the maximum permits leaving |
| Capture inside a home column | `core/capture.js` | No capture is ever produced for a home column square |
| Last pawn captured while others are home | `core/capture.js` | The captured pawn restarts at `r = 0` and pawns at `r = 58` are untouched |
| Two players hold a Reaction against one trigger | `core/turn-rules.js` | Both are prompted in turn order and each may play at most one card |
| A Reaction played against an Action card | `core/turn-rules.js` | It resolves inside the same window and opens no new window |
| The Skill Card Pool runs out | `core/skill-pool.js` | The discard pile is shuffled and becomes the new pool |
| A player at the hand limit at end of turn | `core/skill-pool.js` | No card is drawn and the hand stays at 3 |
| Win condition | `core/win.js` | Four pawns at `r = 58` wins; three at 58 and one at 57 does not |
| Pool accounting is closed | `core/skill-pool.js` | After an arbitrary sequence of draws and plays, every card is in exactly one of pool, hand or discard |
| Dice pool is stationary | `core/dice-pool.js` | Pool size and composition before and after a turn are identical |

**Every skill card is its own case.** The eight cards of section 7 of the game design document are
eight distinct rules in `core/card-effects.js`, so each carries at least one test of its own effect and,
for the four Reactions, one of its playability predicate. That is 8 rules and not one engine, which is
also why issue #33 carries the largest single estimate in the effort estimation of issue #16.

### Determinism

NFR-09 requires the RNG for dice rolls and card draws to be **injectable**. It is a testability
requirement on `core/` and not an implementation detail: without it, every case above that names a roll
is unassertable. A test supplies a fixed sequence and asserts an exact board state, and nothing in
`core/` reads `Math.random()` directly.

---

## 5 Definition of Done

**Written here for the first time.** It has never existed anywhere in this repository, and its absence
is a named condition of the feasibility verdict in [Feasibility-Study.md](Feasibility-Study.md), a
listed prerequisite for measurability in [SMART-Analysis.md](SMART-Analysis.md), and the reason all four
SMART sub-goal criteria (*epic closed*) are not comparable between three people. It is written at three
levels, because "done" means something different for an issue, a sprint and a release.

### 5.1 An issue is done when

1. The change is on `dev`, merged by a pull request with at least one approval.
2. Every acceptance criterion of every requirement the issue serves is met, taken from
   [Requirements-Specification.md](Requirements-Specification.md).
3. Rules in `core/` ship with their unit tests in the same commit. Where coverage is outstanding, the
   commit body says which, rather than leaving it unsaid.
4. `npm run lint` and `npm test` pass. Coverage in `core/` and `state/` has not fallen below the
   NFR-05 floor.
5. No file exceeds 300 lines (NFR-02) and no user-facing string is hardcoded (NFR-03).
6. The documentation notes for the chapter the change belongs to carry its facts, any non-obvious
   decision has a block in [project-journal.md](../Documentation/project-journal.md), and any
   user-visible change is in `CHANGELOG.md` under `## [Unreleased]`.
7. The prompt log entry exists locally under `00-Meta/AI-Prompts/<github-username>/`.
8. The issue is closed explicitly and its board card is moved to `Done`. Neither happens on its own:
   `Closes #<n>` fires only on a merge into the default branch, and moving the card is a manual step
   for as long as the token lacks the `project` scope.

Steps 1 to 5 are the code half and 6 to 8 the record half. The second half is the one that gets
skipped under pressure, which is why it is numbered rather than implied.

### 5.2 A sprint is done when

1. Every issue in the sprint is done by 5.1, or is explicitly moved out of the sprint with a reason
   recorded in [sprint-log.md](../Documentation/sprint-log.md).
2. The sprint's *Delivered* and *Divergence and reasons* entries in `sprint-log.md` are filled, with
   nothing backdated.
3. `dev` is in a state that can be merged into `main` without further work.

### 5.3 A release is done when

1. `dev` is merged into `main` by a pull request, and `main` is a working, playable build.
2. `npm run build` produces a `dist/` that is playable when served as static files (NFR-06).
3. The E2E suite of section 3 passes on the browsers named in NFR-10.

### 5.4 What the Definition of Done deliberately does not require

- **No code review checklist beyond one approval.** The review policy is one approval and no direct
  commits to `main`; adding a checklist a three-person team will not use would make the definition less
  honest, not more thorough.
- **No performance gate.** NFR-11 asks for visible feedback within 100 ms and is verified once, by
  measurement during the buffer-sprint playtest, not per issue.
- **No accessibility gate**, beyond NFR-12's greyscale check, which is verified once per release rather
  than per issue.

---

## 6 CI/CD

**None exists.** No workflow file, no pipeline, no automated run of anything.

The intent on record is in [Brainstorming.md](../../Brainstorming.md): a build-validation workflow at
`.github/workflows/build-check.yml`, triggered on every pull request, compiling the project so that a
broken build cannot be merged, plus optional playable build artifacts per merge. Translated into this
stack, the gates a workflow would run on a pull request into `dev` or `main` are:

1. `npm run lint`
2. `npm test`
3. `npm run test:coverage`, failing below the NFR-05 floor
4. `npm run build`
5. `npm run test:e2e` on the NFR-10 browsers

**What the report says if it never lands**, stated now so it is not improvised later: the project ran
its quality gates locally and by review, and step 4 of the Definition of Done was therefore enforced by
discipline rather than by a machine. That is a weaker control and it is named as one. It is also the
reason the *Test coverage discipline slips* row in
[03-Risk-Analysis.md](03-Risk-Analysis.md) was **not** re-rated when this plan was written: a document
describing gates does not run them.

---

## 7 Review and branching policy

Cited from [CLAUDE.md](../../CLAUDE.md) rather than restated, because the branching model is process
and belongs to Chapter 02:

- `main` always holds a working, playable build. No direct pushes and no direct commits.
- Feature branches off `dev`, pull requests into `dev`, at least one approval, **Squash and Merge**.
- One recorded deviation: `feature/sprint1-planning` carries eight issues and is merged with a merge
  commit, because squashing would destroy the per-issue trail that the plan-versus-actual comparison
  reads. Recorded in
  [notes/02-project-management.md](../Documentation/notes/02-project-management.md) under *Branching and
  review*.
- The board has no `In Review` column, so the review step of this policy has no board representation.

The one control this project has already paid for the absence of: pull request #48 was merged into `dev`
without approval on 2026-08-09, and undoing it cost a rewrite of published history across four branches.
The challenge entry in [project-journal.md](../Documentation/project-journal.md) has the account. It is
the concrete argument for a branch-protection ruleset, which is still not configured.

---

## 8 What this plan does not cover

- **Nothing in it has been run.** No test exists, no coverage figure has been produced, and the flow
  and case lists are lists rather than results.
- **Whether Playwright runs against the dev server or the production build is undecided.** The
  production build catches what the dev server hides, such as an asset the build forgets to copy. It is
  decided in the commit that adds the Playwright config, not here.
- **No browser matrix has been run.** NFR-10 names Chrome, Firefox and Edge; nothing has been executed
  on any of them.
- **Audio has no test strategy.** FR-39 to FR-41 are verified by ear during the playtest. Asserting that
  a sound played is possible in Playwright and is not worth the fixture for four sounds.
- **Lighthouse and comparable audits are not planned.** For a single-screen turn-based board game the
  yield is low, and saying so is better than omitting the topic.
- **Multiplayer (FR-42) has no test plan**, because it has no specification and no chosen technology.
- **The playtest has no instrument yet.** Section 1 commits to people testing game feel, and what they
  are asked, and how their answers are recorded, belongs to issue #24 *Usability & Playtest Evaluation*.
