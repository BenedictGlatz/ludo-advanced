# Project journal

Append-only. Never rewrite an earlier entry: if something turns out to have been wrong, add a new
entry saying so and why. The value of this file is that it records what was believed at the time.

Three sections, each with its own rule:

- **Log**: one line per working session. What was done, which sprint, which issue.
- **Decisions**: one block per non-obvious technical or process decision. Raw material for the
  report's justifications, so it must include what was *rejected*.
- **Challenges**: anything that cost more than roughly 30 minutes of unplanned work. Feeds
  Chapter 11.

Dates are absolute (`YYYY-MM-DD`). No hour tracking: the team decided against it; plan-versus-actual
is tracked as scope and dates in [sprint-log.md](sprint-log.md).

---

## Log

- **2026-08-06**: Repository and GitHub project created. Sprint 0.
- **2026-08-06**: `CLAUDE.md`, `README.md` and `CHANGELOG.md` written; stack fixed to
  JavaScript + jQuery + Vite + i18next, Vitest and Playwright for tests, ESLint and Prettier.
  Sprint 0.
- **2026-08-06**: Documentation notes established under `00-Meta/Documentation/`: steering index,
  13 chapter notes, this journal, sprint log, abbreviation list, and two adapted reference
  transcripts. `CLAUDE.md` extended with a documentation-notes section and a mandatory
  per-change step list. Sprint 0.
- **2026-08-06**: Repository and GitHub project made public; board read for the first time from the
  development environment. 46 issues, 50 board items, 16 fields and 3 views transcribed into
  Ch. 01 and Ch. 02. Sprint calendar dates recovered and filled into `sprint-log.md`. Four negative
  findings recorded about board configuration. Sprint 0.
- **2026-08-06**: `dev` pushed to `origin` for the first time (four documentation commits; the remote
  had only `main` until now). Issues #4 *Create a Claude.md* and #2 *Github Setup + Documentation*
  closed with closing comments. An earlier negative finding corrected: an authenticated GitHub token
  was available all along, in the Git Credential Manager. Sprint 0.
- **2026-08-09**: SMART analysis written for issue #9: one overall project goal plus four sub-goals,
  one per `must have` epic (#36–#39), with deadlines taken from the board sprint markers.
  `00-Meta/Project-Management/SMART-Analysis.md`; facts in Ch. 01. Sprint 0.
- **2026-08-09**: Feasibility study written for issue #12, assessing the chosen 2D option across
  five dimensions (technical, schedule, personnel/organisational, economic, legal). Verdict: a
  conditional Go, with the AI toolchain named as the precondition it rests on.
  `00-Meta/Project-Management/Feasibility-Study.md`; facts in Ch. 03 and Ch. 10. Sprint 0.
- **2026-08-10**: Risk register in `03-Risk-Analysis.md` expanded from 3 to 16 risks, all traced to
  facts already recorded in the project's own documentation. Issue #11, Sprint 0.

- **2026-08-22**: Board read in full for the first time through the `gh` CLI with the `read:project`
  scope granted. 64 items, all field values including `Sprint`. Sprint 1 membership is 13
  documentation and planning issues (5 Done, 8 Todo and unassigned), not the gameplay scope the
  written plan gave it. Board declared the single source of truth for sprint membership; Ch. 02 and
  `sprint-log.md` updated against it. Sprint 1.

- **2026-08-22**: Game design document written for issue #22 on `feature/sprint1-planning`: board
  topology as exact numbers, the turn sequence as a state machine, the Dice Card Pool composition and
  its probability arithmetic, an 8-card skill card catalogue, the eight open Product Owner rules
  written out with their rejected alternatives, and 13 edge cases settled in a table. Section 5 of
  `Requirements-Specification.md` now points at it; one risk row re-rated. Sprint 1.

- **2026-08-22**: One pager rewritten for issue #1 as a one-page overview: broken heading and
  typographic bullets fixed, the Product Owner's wording kept where it is still correct, the MVP
  boundary, the board sprint calendar and a pointer table added, and the rules detail moved to the
  game design document so that two documents do not hold the same rules. Written third rather than
  first, so the summary matches the rulebook instead of being rewritten after it. Sprint 1.

- **2026-08-22**: System architecture written for issue #22's neighbour #21 on
  `feature/sprint1-planning`: layer diagram and turn sequence diagram as Mermaid figures, a module
  inventory of 8 modules in `core/`, 4 in `state/` and 7 in `ui/` with the FR ids each owns, the data
  flow, and the layering justified against jQuery-handler rules as the rejected alternative. Figures
  registered in Ch. 12 starting at 2, because open pull request #51 claims Figure 1. Sprint 1.

- **2026-08-22**: Obligations book written for issue #14 on `feature/sprint1-planning`: the *how* to the
  requirements specification's *what*, with no requirement restated. A nine-screen GUI inventory plus two
  `should have` screens, each traced to its FR ids and its backlog issue; a technology table whose version
  column stays empty because no `package.json` exists; and the platform committed from NFR-06 and NFR-10.
  Two screens were found to carry no backlog issue at all, one of them a `must have`. Sprint 1.

- **2026-08-22**: Test plan and quality strategy written for issue #23 on `feature/sprint1-planning`:
  four test levels with what each cannot catch, the coverage floor and why it excludes `ui/`, 12
  end-to-end flows mapped to FR ids, a unit test case per edge case settled in the game design document,
  and the injectable RNG recorded as a testability requirement. It also carries **the project's first
  written Definition of Done**, at issue, sprint and release level, which closes a condition of the
  feasibility verdict and a prerequisite of the SMART analysis. The *test coverage discipline* risk row
  was deliberately not re-rated. Sprint 1.

- **2026-08-22**: Effort estimation written for issue #16 on `feature/sprint1-planning`: 138 story points
  over the implementation backlog, the extended features and the open documentation issues, on a Fibonacci
  scale anchored on issue #29 at 2 points, with the epic tree read from the board's own sub-issue graph.
  The capacity check found that 74 must-have points remain against 19 weekdays and two implementers, so
  the drop order of the requirements specification is now live. Three work items carrying no board issue
  at all were found and sized, 12 points the board does not show. One risk row re-rated 4 to 3; the
  `Story Points` field itself could not be created, for want of the `project` token scope. Sprint 1.

- **2026-08-22**: Em dash sweep across the documentation, no issue, `chore` commit. Roughly 100
  occurrences removed from 10 files, `CLAUDE.md` included, each rewritten into an ordinary sentence, a
  colon, a comma or a bracketed aside rather than replaced mechanically with a hyphen. Two files are
  exempt and keep theirs: `reference/style-reference.md`, which quotes a German transcript verbatim, and
  `reference/report-checklist.md`, which quotes "ENTWURF" from the source it is adapted from. The rule
  itself predates the sweep and is in `CLAUDE.md`; what this cleared is the backlog of text written
  before it was enforced. Sprint 1.

- **2026-08-22**: Roadmap and Gantt chart written for issue #18 on `feature/sprint1-planning`:
  [Roadmap-and-Gantt.md](../Project-Management/Roadmap-and-Gantt.md). The Roadmap view was read rather
  than described: it is view 1 with `ROADMAP_LAYOUT` and an empty filter, and three of its properties
  (date-field binding, zoom, grouping) are not exposed by the API at all, so they are labelled as
  recommendations. **Measured negative finding: dates are set on 11 of 64 board items, so the view
  renders 4 bars and 7 dots**, all 13 Sprint 1 issues are absent from it, and the 7 Sprint 0 bars are
  zero-length because start equals end on every one. The Gantt chart is therefore drawn in Mermaid in
  the repository, since a Projects view cannot be exported and cannot be configured without the
  `project` token scope. The board stays authoritative and the chart is what gets corrected if the two
  disagree. Sprint 1.

- **2026-08-22**: Project plan written for issue #15 on `feature/sprint1-planning`:
  [Project-Plan.md](../Project-Management/Project-Plan.md), covering time, resources, dependencies and
  risks. It is the document that had to decide rather than record, and it settled three contradictions
  carried across four documents: **no buffer sprint is created** and the closing work becomes a dated
  window inside Sprint 3 behind a 2026-09-11 feature freeze, **there is no dedicated Scrum Master** and
  the one-pager's role table supersedes the unfilled Developer A/B/C one, and **the 27 unscheduled
  implementation issues get a sprint each**, ending a deliberate deferral. Consequence, and it makes the
  picture worse rather than better: implementation has 15 weekdays instead of 19, so the required rate
  for the must-have set rises to 4.9 points per weekday. The critical path is 46 of 74 must-have points
  on one chain with only 32 points of work off it, so the second implementer runs dry before the first
  finishes. Five new risks entered the register, one of them the highest-rated row in it. Sprint 1.

- **2026-08-22**: Project structure plan written for issue #17, committed directly on `dev`:
  [Project-Structure-Plan.md](../Project-Management/Project-Structure-Plan.md). #17 had been left out
  of Sprint 1 by oversight and parked in the closing window by the project plan the same day; the
  team pulled it into Sprint 1 on the board and it was delivered the same evening. The tree adopts
  the board's epic and sub-issue graph, places all 47 issues exactly once plus the three issue-less
  packages (bootstrap, i18n, CI), and carries structure only: points, dates and owners stay in the
  documents that own them. Found in passing: the RACI matrix of issue #6 is an empty table. Sprint 1.

- **2026-08-09**: Requirements specification written on `feature/13-requirements-specification`
  (issue #13): 45 functional and 12 non-functional requirements with acceptance criteria and MoSCoW
  priorities, a drop order agreed in advance, and eight gameplay decisions handed to the Product
  Owner. Six previously unrecorded holes in the rules found in the process. Sprint 0.

- **2026-08-29**: Board hygiene on `feature/sprint2-core-and-design`, the first Sprint 2 work.
  `Story Points` field created and back-filled on 25 open issues (134 points, reconciled against the
  effort estimation's 138). #28 split into #28 *Pawn Movement Rules* and the new #62 *Pawn Rendering &
  Movement Animation*, point-neutral. #63 bootstrap and #64 i18n created, so 10 of the 12 points
  invisible to the board are now on it. `Sprint 2` set on #26 to #29 and on the three new issues.
  Measured finding: Sprint 2 holds 72 points, of which 34 are #42 to #46, work the project plan leaves
  unscheduled. Sprint 2.

- **2026-08-29**: Project bootstrapped on `feature/sprint2-core-and-design`, issue #63. `package.json`
  with the 11 npm scripts, Vite, ESLint, Prettier, Vitest and Playwright, the `src/` and `tests/` tree,
  and two ESLint rules that turn architecture prose into failing checks: `max-lines` at 300 for NFR-02
  and `no-restricted-imports` over `src/core/**` for NFR-01. The repository stops being
  documentation-only after 23 days. Milestone M1, four days late. Sprint 2.

- **2026-08-29**: Board topology written for issue #26, `src/core/board.js`: the 52-square closed
  track, entry and turn-off squares per player, the relative-position arithmetic and the region
  classifier, with unit tests over it. Every number taken from section 2 of the game design document.
  The test count and the coverage figure are in
  [notes/09-source-code-overview.md](notes/09-source-code-overview.md) next to the command that
  produced them; an earlier version of this entry carried a figure from memory, which is exactly what
  that rule exists to stop. Sprint 2.

- **2026-08-29**: Design handoff loop established for issue #3: `01-Design/` with a README, the brief
  and spec templates, and the first brief `01-brief-foundations-and-board.md` covering the board screen
  S3, the refusal region S6 and the foundations. It hands Claude Design a DOM contract and nine
  numbered open decisions and no visual rule at all, which is the line `CLAUDE.md` draws. Sprint 2.

- **2026-08-29**: Capture written for issue #29, with the pawn record it needs: `core/pawns.js` and
  `core/capture.js`. Written **in parallel with Claude Design**, which is the scheduling lever the
  sprint plan named: neither module touches the DOM. Sprint 2.

- **2026-08-29**: Movement, the win condition and the dice seam written for issue #28:
  `core/movement.js`, `core/win.js` and `core/dice-source.js`. Nine of the thirteen rows of the
  rulebook's edge-case table are now a test each; the remaining four are skill-card rules and belong
  to #38. Sprint 2.

- **2026-08-29**: State layer written for issue #27, the 8-point integration point everything else
  waits on: `state/game-state.js`, `state/turn-manager.js`, `state/intents.js` and `state/match.js`.
  The eight-step turn sequence, the four-intent boundary, and a complete match played end to end on
  a scripted RNG. The rules are now complete enough to finish a game, and there is still no way to
  see one: `src/ui/` and `src/i18n/` are empty. Sprint 2.

- **2026-08-29**: i18n set up for issue #64: `src/i18n/index.js` and the German and English locale
  files, with a test asserting identical key sets and text for every key `core/` and `state/` can
  emit. Written before the first view on purpose, so that no literal ever has to be found and
  replaced. Steps 4, 5 and 7 of the sprint plan are done, all three in parallel with Claude Design.
  Sprint 2.

- **2026-08-30**: The first design handoff landed, and it changed the rulebook rather than following
  it. `src/core/` was re-topologised from a 52-square track to 40, from an offset of 13 to 10, and
  from a 5-square home column plus a separate home area to a 4-square house holding one pawn per
  square. Section 2 of [Game-Design-Document.md](../Project-Management/Game-Design-Document.md) was
  rewritten in the same commit and gained a section 2.4 explaining the reversal. Both questions were
  put to the user before any code was written, because the design spec named them as Product Owner
  territory. All 164 unit tests pass again on the new numbers. Sprint 2.

- **2026-08-30**: Design handoff 01 landed for issue #3. Five stylesheets in `src/ui/styles/` and the
  spec in `01-Design/Handoff/`. The five landing checks from the sprint plan were run: sixteen
  decisions all carry a reason and a rejected alternative, no user-facing string is baked into a CSS
  `content:`, every state in the DOM contract is styled, and the 300-line check **failed on arrival**
  because Prettier expanded `board.css` from 248 lines to 407, so the track placements were split
  into `board-track.css`. Two stale comments in the delivery were corrected and no rule was touched.
  Row 8 of the sign-off table was filled in as a question, because D2 no longer answers NFR-12.
  Sprint 2.

- **2026-08-30**: The game became playable, issue #62. `src/ui/` went from empty to five modules plus
  a 35-line page shell, and `main.js` became a real composition root reading `?seed`, `?players` and
  `?fast` out of the address bar. Seven Playwright specs run against the production build in
  Chromium, Firefox and Edge, and one of them plays a complete two-player match by clicking pawns.
  The team decided that the pawn click is the only control, because handoff 01 designed no dice hand,
  no turn bar and no win screen. Milestones M2 and M3 are met, five days after M1 was missed.
  Sprint 2.

- **2026-08-30**: The stand-in W6 was replaced by the real twenty-card dice pool, issue #30. Section 5
  of the game design document was re-derived against the 44-step journey, which replaced the
  "outdated" banner it had carried since the morning. Design handoff 03 was written for the card
  component and the two hands. All five Playwright seeds had to be regenerated, because the pool draws
  from the same generator the die rolls from; the replay script that finds them was never committed
  and had to be rebuilt as `scripts/find-seeds.js`. Sprint 2. *(Entry written 2026-08-31: it was
  missing from this log, the three commits carried their facts into the chapter notes and the
  decisions below but not into the session log.)*

- **2026-08-31**: Design handoff 03 went to Claude Design, so the visible card work is waiting on a
  spec. Three commits that need no design decision landed instead: the locale text was split into
  `ui.json` plus `cards.json` per language ahead of the 29 card titles about to arrive; the
  hand-written freeze list in `game-state.js` was replaced by a generic deep freeze in
  `state/freeze.js`; and the eight skill squares arrived as `core/skill-squares.js`, wired into the
  state and into the resolve step of the turn. The Playwright seeds went stale for the second time in
  a week, for the same reason and with a one-command fix this time. A negative finding: the skill
  squares are implementing FR-22 and appear in no requirement text, so the code is ahead of the
  requirement. Then the 29-card catalogue and the closed skill card pool landed as pure `core/` work,
  and the game design document was pulled along with them: section 2.5 written for the skill squares,
  section 6.5 rewritten for the new card economy, section 7 replaced entirely, and three rows of the
  sign-off table marked overridden by the Product Owner. Then design spec 03 came back and the dice
  hand was built on it, so the player finally picks their own dice card: the view had been taking the
  first of the three since the pool landed. Landing the spec turned up four things the five-item
  entrance check exists for, two of them in the delivery and two of them pre-existing: a stylesheet
  split undone, a missing `body { margin: 0 }`, an end-to-end suite that had been running at the wrong
  viewport for two weeks, and a racy locator in a spec that had been passing on timing. Sprint 2.

- **2026-09-01, evening**: Issue #30 was closed, and the interesting part is that its code had shipped
  two days earlier. The audit that opened the work found the issue body **empty**, its parent #37
  already closed, and FR-16, FR-17, FR-18, FR-19 and FR-21 all satisfied since 2026-08-30. Two real
  gaps were left. The first is that **the pool was invisible to the player**: `pool.remaining()` existed
  and nothing outside the tests called it, and design spec 03 had delivered `.card--full` explicitly
  "because the pool overlay ... needs exactly it" for an overlay nobody built. The second is that
  **FR-20's test proved reachability rather than uniformity**, so a die biased ninety per cent toward
  the 1 would have passed a test named after the requirement. Both are closed: a sixth overlay screen
  showing the seven denominations with their copy counts, and a real distribution test over 60,000 rolls
  and 90,000 dealt cards against a four-sigma band. Writing the FR-16 to FR-21 traceability table is
  what found the second gap, and it is the first requirement in the project traced criterion by
  criterion against a named module and a named test. Two extractions came out of it, and the second one
  matters more than the feature: moving the overlay's two enums into a jQuery-free module revealed that
  **every pure screen-description file had been impossible to unit test since the overlay was written**,
  and nothing had reported it because none of them had a unit test. The five Playwright seeds needed no
  regeneration, predicted in advance for once rather than discovered afterwards, and the full 204-case
  run passed first time on all three browsers. Sprint 2. *(Noted while writing this: the morning's epic
  #39 work has no entry in this log either, the same gap the 2026-08-30 entry records. Not reconstructed
  here, because whoever did that work is who can describe it.)*
- **2026-09-01, late evening**: **Design handoff 04 came back the same evening the work order went out**,
  and it is the largest single delivery the design loop has produced: a 437-line spec answering D35 to D42
  plus D16, D20 and four items owed since spec 03, five replacement stylesheets, five amended ones and a
  rendered mockup. Four of the five placeholder stylesheets are gone and `pool.css` is the only one left.
  Landing it took three kinds of work. **Copying**, which was the smallest part and had one trap in it: the
  three files the README lists as "unchanged, included so the mockup runs" are not unchanged against this
  branch, because the delivered `board.css` is a pre-split copy from before NFR-02 split it three ways, so
  the whole folder was diffed file by file before anything was copied. **Wiring**, which was the three DOM
  attributes the spec asked for by name rather than styling around, plus the refusal strip moving inside
  `.app__board`, plus D40 taking the win message off the orange strip and D20 moving the last hardcoded
  duration into `tokens.css`. **Finding two defects**, both of which the spec's own requirements exposed
  rather than the code: the handover was taking its curtain down *before* rewriting the rail, so one painted
  frame of the leaving player's secret hand was on screen for the arriving player, which is the exact thing
  the screen exists to prevent; and `data-player` on the chrome was being written by `match-flow.js` and
  erased by `render.js` a few times per turn, because two files write that element with different argument
  sets. The first is fixed and tested with two MutationObservers, because a single frame is not something a
  retrying assertion can see. The second failed its test in all three browsers on the first run. `core/` and
  `state/` did not change by one line and every coverage figure is identical, which is the cleanest
  measurement of NFR-01's layering the project has produced. **D16 is answered and still not closed**: four
  seat shapes exist and are on the HUD, the chrome and two overlay panels, but not on the pawn, which is
  where NFR-12 is measured, so `greyscale.spec.js` stays expected-to-fail and the requirement stays unmet.
  Sprint 2.
- **2026-09-01, immediately after**: asked what NFR-12 actually is, and looking it up found that **it is
  `should have` and had been called `must have` in five files**, including three written that evening and
  the design spec itself. The requirements specification says `S` in the table row and again in section
  3.2's cutting order, where NFR-12 is named as one of the last two should-haves to be cut. The chain is
  traceable: the risk register said it first on 2026-08-30, the design work order took the label from the
  register, design spec 04 took it from the work order, and the chapter notes took it from all three.
  Nobody read the specification. All five corrected, and the risk row re-rated from priority 4 to 3,
  because its score depended on the label. The work it changes is nothing, fifteen lines of `pawn.css`
  either way; what it would have changed is a report claiming a must-have requirement shipped unmet, which
  is a heavier finding than the truth and one a reader can check in ten seconds. Sprint 2.

- **2026-09-02**: **design handoffs 05 and 06 came back in one delivery and both landed.** Four files:
  `pool.css` replacing the last placeholder stylesheet, `pawn.css` amended with the seat mark, and the two
  specs. **NFR-12 is met**: the shape is on the piece and `greyscale.spec.js` asserts four different
  computed `clip-path` values across the seats, in colour and under a greyscale filter, with no
  expected-failure marker left anywhere in the suite. Two DOM changes the specs asked for by name were
  wired rather than styled around: `data-copies` on the overview card, which draws the pool's weighting as
  the depth of a stack, and `tabindex` made conditional on a card being playable, which took seven dead tab
  stops out of the pool screen. **Board hygiene the same day**: #31 to #35 closed by hand with their
  reason, their `Sprint`, `Status`, `Start Date` and `End Date` set from the delivering commits, epics #37
  and #38 moved to Done, #40 moved to Sprint 3, and **issue #68 created for the CI workflow**, which was
  the last must-have work with no card. The #40 audio decision went to the Product Owner as a comment with
  both options costed. Sprint 2.

- **2026-09-02**: **the project has CI.** `.github/workflows/build-check.yml` for issue #68, on
  `feature/68-ci-build-check` off `dev`. Two jobs on every pull request into `dev` or `main`: `checks`
  runs the four fast gates (lint, unit tests, coverage against the NFR-05 floor, production build) and
  `e2e` runs the Playwright suite once per engine, chromium and firefox, gated behind `checks`. **The
  gates did not change and none of them was new**: what changed is that they no longer depend on
  somebody remembering, so step 4 of the Definition of Done stopped being an agreement between three
  people. Two documents that had prepared a sentence for the case that CI never landed were updated
  rather than emptied, and the *Test coverage discipline slips* risk row was re-rated M/M/3 to L/M/2 on
  the trigger the row had named for itself on 2026-08-22. Two limits recorded rather than glossed: the
  `msedge` project of NFR-10 stays a local per-release check, and the check reports on a pull request
  without blocking a merge, because that needs a repository ruleset. Sprint 2, delivered out of the
  Sprint 3 plan.

- **2026-09-03**: **four layout defects out of one test round on the Product Owner's own laptop**, no
  issue on the board. The page scrolled on any window that is not 900 px tall, the per-seat card count ran
  out of its plate and was painted over by the next plate, an empty skill-hand slot was drawn wearing a
  card back's frame and diamond, and the fan's overlap read as a glitch because the shadow fell the wrong
  way. Fixed as `fix(ui)`, with new end-to-end cases for all four and a measuring run that produced the
  numbers instead of arithmetic. Three of the fixes change a numbered design decision, so `09-brief` goes
  back to Claude Design as D62 to D64 for confirmation rather than as a request. Sprint 3.

- **2026-09-03, later**: **a feature request turned into a defect that was already on record.** The ask was
  that hovering an Action or Reaction card should turn it over so its text can be read. Looking for the
  place to put it found two unrelated reasons a player cannot read a card in their own hand: the hand is
  face down for most of every turn, because `data-active` answers "is something playable" and
  `card-state.css` reads it as "is this hand somebody else's", and the rules paragraph computes to 8.57 px
  at hand size, so turning a card over would not have helped anyway. `10-brief-card-reveal-on-hover.md`
  goes out with D65 to D69. **Nothing was implemented**, unlike the round before it, because D66 may
  rebuild the card's DOM. The first defect had been filed the same day as a finding that "needs no code",
  which was right about the cause and wrong about the consequence. Sprint 3, no issue on the board.

- **2026-09-03, evening**: **handoff 10 came back the same day it went out and landed whole, D65 to D69.**
  A player can now read the cards in their own hand: the hand stopped being face down, and a card under
  the pointer or under keyboard focus is magnified to exactly the reference card size, so the rules
  paragraph is painted at 12.6 px instead of 8.6. No card turns over, which is not what was asked for and
  is explained rather than glossed: a turn does not change the size, so it does not answer the request.
  Two attributes were all the code it needed, `data-face` on the hand and a tab stop on every card with an
  id, plus one new stylesheet and one new import. **The delivery was merged rather than copied in**,
  because it had been read against the tree of that morning and would have reverted the stage, the fan's
  shadow and the two empty-slot fixes; two of those three carry an end-to-end case that would have caught
  it. Four new cases in `tests/e2e/card-reveal.spec.js`, which is the first test of a hover state anywhere
  in the suite, 101 per browser and 303 across the three, all green. Sprint 3, no issue on the board.
- **2026-09-03, late**: **two feature requests in one message, and both went out as briefs rather than as
  code.** The roll is boring and the main menu is barebones, D70 to D74 and D75 to D80. Both descriptions
  were accurate and both had something underneath them. The roll has **no animation at all**, and two
  things nobody had reported: it has no moment of its own, because `advance()` rolls and carries on inside
  one synchronous pass, so the number is painted in the same frame as the two unkept cards flying back to
  the pool; and `state.rollSteps`, which exists so the screen can explain a roll three cards had a hand
  in, is **read by no file under `src/ui/`** although its sentences are written in both languages. That is
  NFR-08's explanation half, and the third time in three handoffs that a rule ran where nothing rendered
  it. The menu's finding is an absence: **nothing in this project styles a control you cannot use**, and
  two of the three requested items are exactly that. Brief 12 is also the first in the loop to ask for
  **three drawings and a pick**, because "barebones" has no cause to diagnose. Three small locale gaps
  found on the way and recorded rather than fixed in passing: `ROLL_STEP.MISSED` has no key in either
  language, and `turn.rolled` and `setup.start` are in both and read by nothing. No code, no changelog
  entry and no tests, all three for stated reasons. Sprint 3, no issue on the board.
- **2026-09-03, later: handoff 11 landed, so the roll has a moment and explains itself.** D70 to D74 came
  back the same evening and all five went in. Three commits, because the first one is mechanical and had
  to be separately verifiable: the message strip renamed from `.move-refusal` to `.message-strip`, then
  the feature, then the close. What landed is `roll.css` (new), two additive amendments, two new modules
  (`turn-waits.js` and `roll-steps.js`), two new tokens, one new locale key, one deleted one, and
  **NFR-08's explanation half closed**. D72 turned out to need no code at all, which is the opposite of
  what the brief had costed. One real bug on the way, found by three unrelated end-to-end specs: a roll
  arrives through two doors and the first implementation only knew about one, which left the dice hand
  permanently unclickable from the first turn an opponent held a Reaction that answers the roll.
  `game-loop.js` came out at 286 lines, below the 293 it went in at. Two new unit files, one new
  end-to-end spec, one new case in `locales.test.js`; the whole unit suite and the whole
  end-to-end suite pass on three browsers, with the counts in Ch. 09 next to the commands that produce
  them. Sprint 3, no issue on the board.
- **2026-09-04: the rules half of the bot opponents, issue #43.** A fourth layer, `src/ai/`, with three
  pure files: `move-scoring.js` ranks a move (finish, capture, enter the house, leave the yard, walk),
  `dice-choice.js` prices each card in the hand by the **mean** best move over its faces, and
  `bot-policy.js` turns a state into one intent and returns `null` everywhere a person is not being
  asked. Beside it, `state/bots.js` and a seventh match-level field, `state.bots`. Nothing is visible on
  screen yet, so no changelog entry. Five new test files, 44 cases, and the strongest regression test in
  the suite: a whole match played by four bots on the full skill pool, in about a second, under
  `environment: "node"`. Nothing failed at any point, which is a weaker result than a caught bug and is
  recorded as such in Ch. 08. Sprint 3, issue #43.
- **2026-09-04, later: the bots reached the screen.** `bot-driver.js` is the loop's fourth sibling and
  adds the one thing `ai/` may not know, time. Two lines in `advance()`, a borrowed duration token, input
  guards so a person cannot play a bot's turn for it during the pause, two locale keys per language, and
  `data-controller` on every HUD seat for the spec and for Design. The hand-over screen now only opens
  when a second **person** is going to take the keyboard, which is a rule change and not a convenience.
  `?bots=M` reads it off the address bar, and `readOptions` moved into `src/options.js` on the way,
  because it had never been unit testable. `game-loop.js` paid for the driver with two real seams and
  came out at exactly 300 lines, which is recorded as a problem for next time rather than as a success.
  Three end-to-end cases, two of them at real speed on purpose, one new unit file for `turn-controls.js`,
  and 15 cases for the address bar that had never existed. The full unit suite and the whole end-to-end
  suite pass, with the counts in Ch. 09 next to the commands that produce them. Two negative findings
  written down and not fixed: a bot's skill hand is face up, and the `reaction.*` sentences still say
  "Spieler". Sprint 3, issue #43.
- **2026-09-04, last: the requirements caught up with the code, and one of them had been contradicting
  another since it was written.** FR-01 gained a lower bound of one person, FR-43 was rewritten from
  "LLM-powered" to "local, rule-based" and rose from `C` to `S`, and FG-18 with it. The rise was forced
  rather than chosen: US-01 gives a match a lower bound of one person, and a `could have` that a
  `must have` depends on is a broken dependency. Dropping the LLM resolved a contradiction nobody had
  noticed, because an LLM bot needs a network call and FR-03's acceptance criterion is a match completed
  *without any network connection*. The open question in § 5 of the user stories is marked resolved, and
  that file is committed for the first time. `CLAUDE.md` and `System-Architecture.md` gained the fifth
  layer. Design brief 13 went out with D81 to D86, and issue #76 was opened for the setup screen so that
  `Closes #43` is honest: the bot works, but choosing one is still a URL parameter. Sprint 3, issue #43.
- **2026-09-04, after that: the bots learned to play cards, issue #82.** The scope decision of the
  morning is superseded: `src/ai/` grew from three files to eleven, and a bot now prices every card in
  its hand in the units of a move and plays the best one when it beats a threshold. `roll-odds.js` is
  the roll as a probability distribution, `threat.js` is the danger term that `move-scoring.js` had
  recorded as missing, four `values-*.js` files hold the 29 card values grouped by mechanic exactly as
  `core/cards/effects/` is, `card-values.js` is the table and checks itself at boot, and
  `card-choice.js` turns the best value into an intent and refuses to trust its own target. Seven new
  unit files. The strongest result is the old one turned upside down: the four-bot match on the full
  pool used to assert that the discard pile stayed **empty** and now asserts that cards are spent, with
  the real assertion unchanged, that no intent a bot produces is ever refused over hundreds of turns.
  Two cards are deliberately never played and one rule finding came out of the work: Double Dip is net
  zero, and `card-effects.js` claims it is net positive. Sprint 3, issue #82.
- **2026-09-04, then the screen caught up with the bots, issue #82.** A card played by somebody who is
  not at the keyboard is invisible, so it is announced in the message strip: a fourth kind of message on
  a seam that already had three, one locale key per language, and the reading time borrowed from
  `--motion-trap-hold` exactly as the bot's thinking pause borrows `--motion-roll-hold`. One new
  turn-level state field, `lastCardPlayed`, which is the first field in the state object that carries no
  rule at all. `declineAll` in the driver became `answerWindow`, because a bot in a window now has two
  possible answers and only one of them is instant. `game-loop.js` came out at exactly 300 lines again,
  two lines changed and none added. **One negative finding from this morning closed itself**: the seven
  `reaction.*` sentences said "Spieler 3 würfelt" for a bot, which was left as follow-up work when the
  bots landed and became load-bearing the moment a bot could answer a window, so the keys take a name
  instead of a number. The e2e bot helpers moved into `bot-helpers.js`, and the announcement spec was
  written twice: the first version polled a two-second message at real speed and spent a minute not
  seeing one. Sprint 3, issue #82.
- **2026-09-04, last: the documents caught up with the bots twice in one day, issue #82.** FR-43's
  acceptance criterion was rewritten for the second time in a few hours, from "plays no skill card and
  declines every reaction window" to "plays a skill card only when a rule-based value model says it is
  worth more than holding it". The wording names the value model on purpose: "plays cards" is satisfied
  by a bot that plays them at random, which is the version the morning's decision had already rejected.
  Design brief 13 was corrected in place in four places with dated notes, because it was written this
  morning against a bot that plays no cards, and **brief 14** went out with D87 to D89: what a card
  announcement looks like (it ships in the refusal orange, which is wrong and is the same deviation D55
  fixed for traps), the pause before a bot answers a window, and whether a bot should mark its target.
  One rule finding for the Product Owner recorded in Ch. 01 rather than fixed: Double Dip is net zero.
  Ch. 09 has a fresh measurement, and two of its own commands had to be widened first, because command
  5c had two branches for three layers and had been quietly counting bot files as `state/`. Sprint 3,
  issue #82.

- **2026-09-04**: A screenshot from a test round showed a skill card being covered by the chosen dice
  card while the player was reading it. The cause is one property: `card.css` makes every card a
  stacking context and neither hand plate is one, so both hands paint into a single z-index space and
  the chosen card's layer, 3, beat the read card's, 2. Fixed with one new token,
  `--layer-card-reading`, used in `card-reveal.css` and nowhere else, which also fixes the same
  collision inside the fan between a selected card and a revealed neighbour. Design handoff 10 § 3 had
  ruled this overlap correct on an argument about DOM order that holds for the plates and not for the
  cards; the design side is told in `00-open-requests.md`. One end-to-end case added, asserted with
  `elementFromPoint` rather than with a computed `z-index`, and checked against the unfixed stylesheet
  first. Sprint 3, no issue.
- **2026-09-05**: Design handoff 16 landed. D97 withdraws the four seat shapes across the whole game
  (four tokens, four mapping declarations, five `clip-path` reads) and deletes `.pawn__mark` from
  `pawn.css` and from the DOM, so the seats are told apart by colour alone again and NFR-12 is unmet.
  D98 moves the message strip off the board and above the skill plate, paid for by 44 px of
  `padding-bottom` on `.app__dice`. Nine stylesheets, three view files, four end-to-end specs. Six of
  the ten delivered files could not be copied over ours and were applied rule by rule. Sprint 3, no
  issue.

- **2026-09-05**: Issues #85 (design handoff 16) and #86 (the card being read) opened for work that was
  already delivered, put in Sprint 2 on the board with 3 and 1 story points, and set to In Progress so
  they can be closed with the merge. Both were built without an issue, which is why they had to be
  written after the fact. **A correction goes with them: twelve log entries from 2026-09-03 onward say
  Sprint 3 and every one of them is Sprint 2.** The board's Sprint 2 runs 2026-08-24 to 2026-09-06 and
  Sprint 3 starts 2026-09-07, so all work in that window belongs to Sprint 2. The entries are left
  standing, per this file's own append-only rule; this line is the correction. The Delivered list in
  `sprint-log.md` was not affected, because it is organised by sprint section rather than by a label on
  each line. Sprint 2.
- **2026-09-05**: `dev` brought up to date with the two branches that were still ahead of it. A
  teammate pulled `dev` and found the main menu missing, which is how the gap was noticed: PR #75
  (`feature/roll-animation` into `dev`) had been open since 2026-09-04 and held 17 commits, among them
  the three-door main menu, the bot policy, the line-up screen and the seat colours. In the meantime
  `feature/roll-animation` had itself taken PRs #83 and #84 from `feature/82-bot-card-tactics`, so it
  had quietly become a second integration branch stacked on top of `dev`. Both merges were made
  locally as merge commits, matching the shape of PR #74 already in `dev`, and `dev` was pushed;
  GitHub closed PR #75 as merged. Lint, 926 unit tests in 71 files and the production build all pass
  on the merged `dev`. One branch stays open: `docs/appendix-board-screenshot` (PR #51, one docs
  commit from 2026-08-09) conflicts with `dev` and needs a manual resolution, so it was left alone
  rather than resolved unasked. Sprint 2.


---

## Decisions

### 2026-08-09: Goals are catalogued in Project-Management, not in the chapter note

- **Chosen:** one standing document,
  [Functional-and-Non-Functional-Goals.md](../Project-Management/Functional-and-Non-Functional-Goals.md),
  holding every functional and non-functional goal with an ID, a source and a reason. Ch. 01 keeps a
  summary and the findings; the catalogue itself is the single place a goal is edited.
- **Rejected:** *writing the goals directly into
  [01-requirements-and-goals.md](notes/01-requirements-and-goals.md).* That note is a report chapter
  note: read once, near the end, when the report is written. Goals are consulted continuously during
  sprint planning and review, by people who are not writing the report at that moment, so burying
  them in a chapter note puts them where nobody looks. Also rejected: *stating goals as issue
  acceptance criteria on GitHub*, which is the more orthodox place, but all 46 issues currently have
  empty bodies, so this would have meant editing 46 issues before a single goal could be written down,
  and the board is the one part of GitHub this project has no stable write path to.
- **Why the catalogue is derived rather than authored:** every goal carries a Source line pointing at
  the one-pager, `CLAUDE.md`, the README or a backlog issue, and goals that are a reading of a source
  rather than a quotation say so explicitly. This keeps the document a *restatement*, so it cannot
  quietly become a second, competing rulebook that drifts from the one-pager.
- **Consequence:** a goal change edits the catalogue first and appends the fact to Ch. 01 in the same
  commit. Chapter 08 reports measured coverage against NFG-05, and Chapter 11 reports goals not met.
- **The finding worth carrying into Ch. 01 and Ch. 11:** writing the goals down produced five gaps
  that nobody had noticed while the same information was spread over four documents: no performance
  target, no browser support matrix, no accessibility goal, no enforcement for the 300-line limit, and
  a Resource/Energy System that appears in the Sprint 2 plan and in no rulebook. The exercise found
  more by being *collected* than by being *written*, which is an argument for doing it in week 1 of a
  project rather than in week 8.
- → Ch. 01, Ch. 08, Ch. 11

### 2026-08-09: Acceptance criteria live in the specification, not on the issues

- **Chosen:** one specification document holding every requirement with its acceptance criterion,
  referenced from the backlog.
- **Rejected:** *writing the acceptance criteria into the 47 issue bodies*, which is where a Scrum
  team would normally put them and where the board would surface them during sprint planning. It lost
  on two counts: all 47 bodies are currently empty, so this means editing 47 issues before the first
  criterion exists; and the criteria cross-reference each other constantly (FR-14 depends on FR-09
  through FR-13), which issue bodies represent badly.
- **Consequence, stated as a negative finding rather than resolved:** the board still prioritises
  titles. A reviewer looking at issue #29 sees *Knockout & Capture Rules Logic* and no criterion. The
  gap closes only when the criteria are copied onto the issues or each issue links here: that is
  still owed, and it is recorded in Ch. 01 as owed rather than quietly dropped.
- **Why the document came first anyway:** writing all 57 requirements in one pass is what surfaced
  the holes. Six rules that do not exist anywhere, most importantly that **the rulebook never says
  how a player acquires a skill card**, were found only because the requirements were written
  *together*, where a gap between two of them is visible. Filling 47 issue bodies one at a time
  would not have exposed a single one of them.
- → Ch. 01, Ch. 02, Ch. 11

### 2026-08-09: An unspecified mechanic is prioritised `W`, not deferred quietly

- **Chosen:** the resource/energy system is written into the specification as FR-37 with priority
  **`W`, won't have this time**, and the reason is given: no rule for it exists in any document.
- **Rejected:** *omitting it*, which would have been tidier since it has no rules, so there is nothing
  to specify. But issue #35 is titled *Game HUD & Resource Display* and the Sprint 2 plan lists the
  mechanic, so an omission would read as an oversight and would quietly leave two artefacts pointing
  at something the specification does not contain.
- **Why:** a `W` with a reason is a decision that can be reversed on purpose. A silent omission is a
  discrepancy someone rediscovers in Sprint 2.
- **Consequence:** if the Product Owner wants the mechanic, the blocker is rules, not priority.
- → Ch. 01, Ch. 11

### 2026-08-06: 2D web build instead of Unity 3D or Pygame

- **Chosen:** a 2D board game running in the browser.
- **Rejected:** a 3D approach in Unity: a new programming language for two of the three team
  members, plus asset creation and multiplayer work on top. Also rejected: 2D in Pygame, judged to
  offer less extensibility and a harder multiplayer path.
- **Why:** *"Because of the missing time (magical triangle), we decided to use a 2D board to be able
  to deliver more quality."* The scope was cut against the iron triangle deliberately and before
  implementation started.
- **Consequence:** the team works in a language it already knows, and the delivery risk moves from
  "can we learn the engine" to "can we finish the rules".
- **Source:** [Meeting Notes 20260806](../Project-Management/Meeting%20Notes/20260806.md),
  [00-One-Pager.md](../Project-Management/00-One-Pager.md).
- **Addendum (2026-08-09):** formalized as a weighted-criteria Nutzwertanalyse covering all three
  visual approaches (2D, 2.5D, 3D), not just the original 2D-vs-3D pair: see
  [Utility-Value-Analysis.md](../Project-Management/Utility-Value-Analysis.md). It confirms
  2D as the winner (4.20/5.00) and adds one finding not visible in the original prose reasoning:
  2.5D (2.75) also outscores full 3D (2.30), because 2.5D inherits 3D's C#/Unity risk without
  buying back most of its visual payoff.
- → Ch. 03, Ch. 11

### 2026-08-10: AI prompt logs are gitignored, kept locally instead of committed

- **Chosen:** `00-Meta/AI-Prompts/` added to `.gitignore`; the two existing tracked files
  (`BenedictGlatz/2026-08-09.json`, `lbolender/2026-08-06.json`) untracked with `git rm --cached`
  but kept on disk. `CLAUDE.md` step 1 of the mandatory per-change steps is no longer part of the
  commit.
- **Rejected:** the original rule in `CLAUDE.md`: log entries committed together with steps 2–4 in
  the same commit, before replying.
- **Why:** the working tree could not be used for anything else while a prompt-log entry sat as an
  uncommitted change, since the log is written *before* replying but the actual work (docs, code,
  tests) is what should be reviewed and committed together as one unit. Requiring the log file itself
  to be committed forced an extra commit cycle any time work was still in progress.
- **Consequence:** `npm run docs:ai-index` can no longer read every contributor's log straight from a
  fresh clone: logs now live only on each contributor's machine. Whoever regenerates the AI index
  chapter has to collect the other contributors' `00-Meta/AI-Prompts/<github-username>/` folders out
  of band first (chat, shared drive) and place them locally. This is a real loss of the
  "one `git pull` has everything" property the log used to have, traded for not blocking other work.
- → Ch. 07, Ch. 13

### 2026-08-06: Branching model is main/dev/feature, not GitHub Flow

- **Chosen:** `main` (always playable, no direct pushes) ← `dev` (integration) ← `feature/<issue>-<slug>`.
- **Rejected:** the GitHub Flow variant originally proposed in
  [Brainstorming.md](../../Brainstorming.md), with feature branches off `main` and no `dev`.
- **Why:** `main` is required to hold a working, playable build at all times. Merging feature
  branches straight into it makes that guarantee depend on every single PR being complete, whereas
  an integration branch absorbs partial work.
- **Consequence:** one extra merge step per release. The rest of the `Brainstorming.md` policy
  (no direct pushes to `main`, one review approval minimum, squash and merge, `Closes #<n>`) still
  applies.
- → Ch. 02

### 2026-08-06: Documentation notes are kept per commit, not written at the end

- **Chosen:** a `00-Meta/Documentation/` directory of fact-only chapter notes, updated in the same
  commit as the change it describes. The report itself is written once, near the end, from the
  notes.
- **Rejected:** *writing the report at the end from the code and git history.* This is what the
  sample report the team is modelling on did, and its own Lessons Learned chapter names it as the
  project's biggest weakness: it produced time pressure at the end and the presentation was cut
  short to absorb it. Also rejected: *drafting real report prose continuously*, because every code
  change would then mean rewriting paragraphs, and the prose would be rewritten many times before
  anyone read it once.
- **Why:** the expensive part of a design decision to reconstruct three weeks later is not *what*
  was decided but *why*, and which alternative lost. Facts are cheap to capture at the moment they
  are true and cheap to re-sort into a different chapter structure later; prose is neither.
- **Consequence:** every change now owes facts to a chapter note and, if the reasoning was
  non-obvious, a decision block here. This is enforced through the mandatory per-change steps in
  `CLAUDE.md`. The cost is a few lines per commit; the benefit is that Chapter 11 can be written
  from a record rather than from memory.
- **Note:** the module's actual requirements are unknown: no chapter catalogue, page count or
  deadline exists. The 13-chapter structure is adapted from a sample report for a *different module
  with a different professor*, weighted toward project management because that is this module's
  focus. Keeping the notes prose-free is what makes a later re-map a re-sort rather than a rewrite.
- → Ch. 02, Ch. 10, Ch. 11

### 2026-08-06: No hour-level effort tracking

- **Chosen:** a dated log of what was done, plus planned-versus-delivered scope per sprint.
- **Rejected:** logging hours per person per session, which is what the sample report's capacity
  plan is built from.
- **Why:** team decision. Hour logs that are not maintained honestly are worse than no hour log, and
  scope-and-dates is evidence that can be reconstructed from the board if a day is missed.
- **Consequence:** Chapter 11 shows plan against actual in scope and dates rather than in hours, and
  says so explicitly rather than leaving the absence of a capacity table unexplained.
- → Ch. 11

### 2026-08-06: The board is read by making it public, not by authenticating

- **Chosen:** make the repository and the GitHub project public, and read the board through the
  unauthenticated REST API plus the board page's server-rendered JSON payloads.
- **Rejected:** *installing the `gh` CLI and issuing a token with `project` scope*: the correct
  long-term route, but it needs a token per team member and per machine, and nothing in the project
  needed writes yet. Also rejected: *the Projects v2 GraphQL API*, which is not a choice at all:
  it returns `403` to unauthenticated requests **regardless of project visibility**, so public
  visibility does not unlock it.
- **Why:** the immediate need was one read of the board to get sprint dates and the backlog into the
  notes. Public visibility is also independently useful: the deployment candidates in
  `Brainstorming.md` (GitHub Pages, itch.io) assume a public repository anyway, and a university
  project has no confidentiality requirement.
- **Consequence, and the part to state honestly in the report:** the working route parses GitHub's
  internal `memex-*` page payloads, which is **not a stable interface** and will break without
  notice. It is adequate for occasional manual reads and unsuitable as a foundation for tooling. If
  board data is ever needed *automatically* (a velocity chart generator, a burn-down script), that
  needs the `gh` CLI and a token, and the rejected option becomes the chosen one.
- **Also learned:** MCP servers are registered **per client**, not per editor. The GitHub MCP server
  was installed into VS Code's own registry and was therefore invisible to Claude Code running inside
  the same editor. See Ch. 07.
- → Ch. 02, Ch. 07, Ch. 10

### 2026-08-06: Addendum to the decision above: the rejected option was cheaper than it looked

This does not replace the block above: it records that one of its premises was wrong, which is
exactly the kind of thing this file exists to keep visible.

- **What the earlier block assumed:** that authenticating "needs a token per team member and per
  machine", which is why the `gh` CLI route was rejected in favour of making the project public.
- **What is actually the case:** a working GitHub token was already on the machine, stored by the Git
  Credential Manager (`credential.helper=manager`): the same credential that authorises `git push`.
  It carries `gist, repo, workflow` scopes and was enough to comment on and close issues through the
  REST API immediately, with nothing installed.
- **Why the premise was wrong:** the check for a token looked at the environment (`GITHUB_TOKEN`,
  `GH_TOKEN`), and on Windows the credential is not there: it is in the credential manager. The right
  question is not "is a token exported" but "does the credential helper have one".
- **What still holds:** the board itself remains out of reach. GraphQL answers `INSUFFICIENT_SCOPES`
  and names `read:project`, which the stored token does not have. So the split is: **repository data
  is properly accessible, board field data is not.**
- **Revised recommendation:** add `read:project` to the existing token rather than installing the
  `gh` CLI. That is one checkbox, it retires the unstable `memex-*` HTML-parsing route, and it is what
  a velocity or burn-down generator would need.
- **The pattern worth carrying into Ch. 10 and Ch. 11:** twice in one day a capability that existed
  was reported as missing because the wrong location was checked: the MCP server in the wrong
  client's registry, the token in the wrong store. Both times the diagnosis, not the fix, was the work.
- → Ch. 02, Ch. 07, Ch. 10

### 2026-08-09: Project goals anchored to the board's sprint dates, not to the module deadline

- **Chosen:** formulate the goals SMART now, taking every date from the four sprint markers on the
  GitHub board (2026-07-23 → 2026-09-17), and state in the document that the anchor is provisional.
- **Rejected:** *waiting for the real module submission date before formulating any goal.* That date
  is unknown and has been a standing open question since 2026-08-06. Waiting would have left issues
  #10, #13 and #23 without a goal to build on for an unbounded period, and it treats the `T` criterion
  as the expensive one when in fact it is the cheapest to substitute later. The other four criteria
  are the work.
- **Also rejected:** *cutting the sub-goals per sprint* rather than per epic. Sprint-shaped sub-goals
  would have created a second breakdown of the same scope competing with the MoSCoW epics, and the
  epics are the structure the board already prioritises. The sprint dates are still used, as the
  epics' deadlines, which keeps one breakdown and one calendar rather than two of each.
- **Also rejected:** *auditing the existing goal statements against SMART* instead of formulating new
  ones. An audit of the one-pager would have produced a list of deficiencies and still no usable goal;
  this is a definition-phase issue, so it owes a definition.
- **Also rejected:** *velocity as a measurable criterion.* It is named as buffer-sprint presentation
  content, but the board has no story point field and no Iteration field, so a goal depending on it
  would be unmeasurable by construction. Recorded as an exclusion with its reason rather than silently
  omitted.
- **Why:** a goal that cannot be checked is not a goal, and three of the five criteria (S, A, R) were
  already derivable from documents written before this one. What was missing was a date and a set of
  checks, and a provisional date that is named as provisional costs less than no date at all.
- **Consequence:** if the real deadline differs, every `T` value re-anchors to it and the sub-goal
  dates move with the sprint boundaries. That is a date substitution, not a rewrite, which is why the
  dates were taken from a single named source ([sprint-log.md](sprint-log.md)) instead of being spread
  through the text. Second consequence: the sprint boundaries are no longer only a planning artefact,
  so moving one now moves a goal.
- **Finding worth carrying into Ch. 11:** the tightest sub-goal is the *first*, not the last. SG1
  (#36) has the most sub-issues, everything else builds on it, and its sprint starts 2026-08-10 with
  no source code, no `package.json` and no tooling in the repository, so Sprint 1 contains its own
  bootstrap, which is not in its planned scope.
- → Ch. 01, Ch. 02, Ch. 11
### 2026-08-09: Feasibility is affirmed conditionally, with the AI toolchain named as the condition

- **Chosen:** a *conditional* Go. The feasibility study assesses five dimensions, gives each its own
  verdict, and makes the overall verdict explicitly dependent on continued AI assistance: Claude
  Design for UI and 2D assets, Claude Code for implementation and documentation.
- **Rejected:** *an unconditional "feasible".* It would have been the more comfortable sentence and
  the less useful one. The scope in issue #9 was proposed on the assumption of that leverage; a study
  that recorded the verdict without the assumption would leave a later overrun unexplainable, and
  Chapter 11 would have no recorded premise to measure against.
- **Also rejected:** *treating AI use as one accelerator among many inside the technical section.*
  That is how it would normally be written, and it would understate it. Two implementers carry four
  epics with twelve sub-issues across three two-week sprints, plus 24 documentation issues and a
  per-commit documentation obligation. The honest description is a precondition, not a tool choice.
- **Also rejected:** *re-running the 2D/2.5D/3D comparison.* Issue #47 scored it a few hours earlier
  and merged; the study cites it and assesses the winning option in absolute terms instead.
- **Also rejected:** *putting capacity figures in*: hours per person per week, a person-day budget.
  The team decided against hour tracking on 2026-08-06, so there would be no actuals to compare an
  estimate against, and effort estimation is its own backlog item (#16). A number nobody can check is
  worse than a stated gap.
- **Why:** the value of a feasibility study is not the verdict, which was never seriously in doubt
  once the option was chosen. It is the record of *what the verdict assumed*. The assumption that
  matters here is not the stack: it is the leverage.
- **Consequence:** the project has a documented single-toolchain dependency. Its risk treatment
  belongs to issue #11, and this decision hands it over rather than absorbing it. Second consequence:
  the study lists six conditions, four of which are decisions the team has been deferring anyway
  (Definition of Done, buffer sprint, Sprint 2 scope, repository licence): so the study doubles as a
  deadline for them.
- **Two findings worth carrying into Ch. 11:** first, the 2D decision converted the project's risk
  rather than removing it: from "can two of us learn C#" (competence) to "can two of us finish four
  epics in eight weeks" (schedule). Second, with generation cheap, the binding constraint is **review**
  capacity, which argues for keeping the 300-line limit, the layering and the per-change notes exactly
  when deadline pressure would suggest dropping them.
- → Ch. 03, Ch. 10, Ch. 11

### 2026-08-22: The board is the single source of truth for sprint membership

- **Chosen:** the `Sprint` field on the GitHub Projects v2 board decides which issues belong to a
  sprint. Every other document describes the plan and is corrected against the board when the two
  disagree, never the other way round. Concretely: Sprint 1 is the 13 issues carrying `Sprint 1`
  (#1, #9 to #16, #18, #21, #22, #23), and the 27 issues with no sprint value, including all of
  #26 to #46, are simply not scheduled yet. They get their sprint later.
- **Rejected:** *treating [01-Github-Project.md](../Project-Management/01-Github-Project.md) as
  authoritative and the board as behind.* That document gives Sprint 1 the scope "Core gameplay and
  board MVP": board grid, a 1 to 6 dice roll, the turn manager, the capture rule. The board gives
  Sprint 1 thirteen documentation issues and not one gameplay issue. Keeping the written plan as the
  reference would mean declaring the sprint a near-total failure on its last day, when in fact 5 of
  its 13 actual items are Done and the gameplay work was never started because it was never
  scheduled. That reading would be false rather than merely pessimistic.
- **Also rejected:** *maintaining both and reconciling them per sprint.* Two sources agree only until
  the first change, and the 2026-08-06 board read already found four configuration facts that
  contradicted the written plan (Status triple instead of five columns, single-select instead of
  Iteration, no story points, no Category). A reconciliation step would run every sprint and be
  skipped under deadline pressure exactly when it matters.
- **Also rejected:** *back-filling the board to match the written plan*, i.e. moving #26 to #29, #31
  and #36 into Sprint 1 now. It would make the two agree and it would falsify the record: those
  issues were not worked on in Sprint 1, and a board that says they were destroys the plan-versus-
  actual comparison the sprint log exists for.
- **Why:** the board is the artefact the team actually operates, the one all three members see, and
  the only one with per-item state that changes as work happens. A prose plan cannot be queried and
  goes stale silently. This is the same argument the documentation rules already make for numbers:
  prefer the thing that can be re-read over the thing that was written down once.
- **Consequence:** Sprint 1 is a documentation sprint. The gameplay scope the plan put there is
  unstarted and unscheduled, so it has to land in Sprint 2 or later, and Sprint 2's board scope
  (currently empty) is now a blocking decision rather than a later one, with the sprint starting
  2026-08-24. Second consequence: the repository still contains no source code on the day Sprint 1
  ends, which confirms the finding recorded on 2026-08-09 that the first sub-goal was the tightest
  one, and moves the bootstrap of the npm project into Sprint 2 on top of Sprint 2's own scope.
- **Finding worth carrying into Ch. 11:** the divergence was invisible for two weeks because nobody
  could read the `Sprint` field. The written plan was not wrong when it was written, it was simply
  never checked against reality, and the reason it was never checked was a missing OAuth scope. A
  tooling gap silently became a planning gap.
- **Finding worth carrying into Ch. 02:** all 8 open Sprint 1 issues are unassigned on the last day
  of the sprint. The board's assignee field is populated on 9 of 47 issues overall, so "who is doing
  this" is currently not answered by the board at all, only by the RACI matrix and by memory.
- → Ch. 02, Ch. 11

### 2026-08-22: The eight open gameplay rules are decided in the game design document, not left open

- **Chosen:** all eight Product Owner decisions listed in section 5 of
  [Requirements-Specification.md](../Project-Management/Requirements-Specification.md) are written
  out as **rules** in [Game-Design-Document.md](../Project-Management/Game-Design-Document.md), each
  with its reason and its rejected alternatives, plus a sign-off table naming Fabian Gemming as the
  person who confirms or overrides them. Implementation follows the document provisionally.
- **Rejected:** *waiting for the sign-off before writing the rulebook.* The eight decisions block the
  turn manager, the movement rules, the whole Skill Card Pool and every unit test over them. Sprint 1
  ends 2026-08-23 and the repository still has no `src/`, so waiting would have pushed the rules
  decision into Sprint 2 implementation, which is precisely the "rule decisions under time pressure"
  scenario that the priority-4 risk row *Board layout & win conditions underspecified* describes.
- **Also rejected:** *writing the eight as proposals again, in a second document.* The specification
  already holds them as proposals. Restating them in that form would have produced two documents
  saying the same undecided thing, and no rulebook.
- **Also rejected:** *deciding them silently during implementation*, which is the default outcome of
  not writing them down. A rule invented in a pull request has no reason attached and no rejected
  alternative recorded, which is the material Chapter 05 and Chapter 11 are written from.
- **Why the decisions are safe to take this way:** each of the eight is written as *rule plus reason
  plus what lost*, so an override is a documented change to one section rather than a rewrite. The two
  most consequential ones (FR-13 exact count, FR-22/FR-27 the card economy) are the two whose
  alternatives are named most fully, precisely because they are the most likely to be overturned.
- **The decision that is deliberately not taken:** the visual form of the non-colour player
  identifier (NFR-12). The rule states that a stable non-colour identity must exist; which shape,
  pattern or label carries it is a Claude Design decision and issue #3, and inventing it here would
  break the rule in `CLAUDE.md` that Claude Code does not invent design rules.
- **Consequence:** the risk row *Board layout & win conditions underspecified* is re-rated from
  priority 4 to 3 in [03-Risk-Analysis.md](../Project-Management/03-Risk-Analysis.md). Likelihood
  drops because the ambiguity is written down; impact stays high because the rules are unsigned and
  the composition is unplaytested, so the residual risk is real rather than closed.
- → Ch. 01, Ch. 05, Ch. 11

### 2026-08-22: The one pager stays a summary; the rules move to the game design document

- **Chosen:** the rewritten [00-One-Pager.md](../Project-Management/00-One-Pager.md) keeps the base
  game in a handful of lines and points at
  [Game-Design-Document.md](../Project-Management/Game-Design-Document.md) for everything else. The
  Product Owner's original wording is kept wherever it is still correct.
- **Rejected:** *expanding the one pager into the rulebook*, which is the direction it was already
  drifting: it was the only rules source in the project for two weeks. Two documents holding the same
  rules drift apart, and the one-pager is the document people read first, so it is the worst place for
  the copy that goes stale.
- **Also rejected:** *leaving it untouched as a historical artefact* and writing a new overview
  beside it. It is issue #1 and it is linked from `CLAUDE.md`, the README and six documents; a second
  overview would have split the front door in two. The original text is recoverable from git history,
  which is what makes editing in place safe.
- **Why it was written third, after the game design document and the architecture**, rather than
  first as the plan's issue order would suggest: a summary written before the rulebook would have been
  rewritten immediately after it. The cost of the ordering is that issue #1 stayed open two documents
  longer, which is visible on the board and is the cheaper of the two.
- **Consequence:** the one-pager now carries three open points on its face (no buffer sprint on the
  board, Sprint 3 is 1½ weeks, the gameplay scope has no sprint), handed to the project plan, issue
  #15. A front-door document naming its own open points is the intended effect and not an oversight.
- → Ch. 01, Ch. 02

### 2026-08-22: The 300-line file limit is read as applying to code, not to documents

- **Chosen:** the 300-line limit in [CLAUDE.md](../../CLAUDE.md) is read as binding on source, tests
  and config, and not on documents under `00-Meta/Project-Management/`. The game design document is
  longer than 300 lines and is not split.
- **Rejected:** *splitting the rulebook into several files of under 300 lines each*, for example one
  per mechanic. A rulebook is consulted by searching for a rule, and the cross-references between
  rules are dense: the home-entry rule, the pool composition and the track length are one argument in
  three sections. Splitting it would put the reason for a rule in a different file from the rule.
- **Why this is a reading and not an exception:** the limit exists so that a unit of code stays small
  enough to review and test, which is the reason given for it in `CLAUDE.md` alongside the layering.
  Neither reason transfers to prose. The rule was already being read this way before this entry:
  `Feasibility-Study.md` is 257 lines and `Requirements-Specification.md` is longer, and
  `00-Meta/Documentation/` carries the same exemption explicitly.
- **Consequence:** the exemption now covers both documentation directories, and it is recorded once
  here instead of being re-argued per document. Code and tests keep the limit unchanged, and it is
  still unenforced: an ESLint `max-lines` rule remains the open item recorded in Ch. 01.
- → Ch. 02, Ch. 07

### 2026-08-22: The obligations book names screens and responsibilities, not a design system

- **Chosen:** the GUI section of [Obligations-Book.md](../Project-Management/Obligations-Book.md)
  commits to a screen inventory, each screen's responsibility and the FR ids it serves, and stops
  there. Colour palettes, spacing scales, typography and component looks are not in it.
- **Rejected:** *specifying the GUI down to its visual appearance*, which is what an obligations book
  in a traditional waterfall project would do and what the issue title (*System Architecture, GUI,
  Technology, Platform*) can be read as asking for. It was rejected because [CLAUDE.md](../../CLAUDE.md)
  assigns design to Claude Design and issue #3 and explicitly forbids inventing design rules here. A
  palette written in this document would be a rule the design system then has to either obey or
  contradict.
- **Rejected:** *leaving the GUI section out until the design system exists*. It would have left the
  issue unfinishable for a reason that has nothing to do with the issue: what has to be on screen is
  derivable from FR-31 to FR-41 today, and it is what the architecture and the estimation both need.
- **The boundary that resulted:** what has to be on screen is a requirement, what it looks like is a
  design decision. That line is drawn once in section 2.1 and is the reason the section is short.
- **Consequence:** the inventory found two screens with no backlog issue, the rules screen (FR-35) and
  the language switch (FR-34, `must have`, with NFR-03). Splitting the work this way is what made the
  gap visible: a section written as visual specification would have described what those screens look
  like without noticing that nobody is scheduled to build them.
- → Ch. 04, Ch. 03

### 2026-08-22: The Definition of Done lives with the quality strategy and has three levels

- **Chosen:** the Definition of Done is written in section 5 of
  [Test-Plan-and-Quality-Strategy.md](../Project-Management/Test-Plan-and-Quality-Strategy.md), at
  three levels: an issue is done, a sprint is done, a release is done. It had never been written down
  anywhere in this repository.
- **Why it lives there and not in a process document:** most of its clauses are test and coverage
  clauses. Acceptance criteria met, unit tests in the same commit, lint and tests passing, coverage not
  below the NFR-05 floor. Putting it next to the coverage target it depends on keeps the two from
  drifting; the process half of it is cross-referenced from Ch. 02 instead of duplicated.
- **Why three levels:** the same phrase was being used for three different things. All four SMART
  sub-goals check "epic closed", the sprint log checks a sprint's scope, and the branching policy checks
  that `main` is playable. One list satisfying all three would have been either too loose to close an
  issue with or too heavy to close a sprint with.
- **Rejected:** *one flat checklist*, for the reason above. **Rejected:** *a definition that requires
  green CI*, which is the version most projects write. There is no CI, so it would have been unmeetable
  from the day it was written, and an unmeetable definition is worse than a modest one because it gets
  ignored wholesale rather than in part. The gates a CI workflow would run are named in section 6 of the
  same document instead, so the definition tightens when the workflow lands.
- **Rejected:** *adding a review checklist, a performance gate and an accessibility gate*. Each is named
  in section 5.4 with the reason it is left out: a three-person team will not run a checklist, NFR-11 is
  measured once in the buffer-sprint playtest, and NFR-12's greyscale check is a per-release check.
- **Consequence:** condition 4 of the feasibility verdict and the Definition of Done row of the SMART
  prerequisites are met, and both are annotated rather than deleted so the sequence stays visible. What
  is not met is **adoption**: no sprint has been closed against it, and the team has not confirmed it in
  a planning slot. Writing a definition is not the same as agreeing to one, and the report should not
  let the first stand in for the second.
- → Ch. 08, Ch. 02

### 2026-08-22: The backlog is the work breakdown structure, and the estimate is in points

- **Chosen:** the work breakdown for the effort estimation is the backlog itself, four epics with their
  children as read from the board's sub-issue graph, and the estimate is in story points on the
  Fibonacci scale 1, 2, 3, 5, 8, 13, anchored on issue #29 at 2 points.
- **Rejected:** *writing the project structure plan first*. #17 PSP is not in Sprint 1 on the board, so
  it is not this sprint's work, and the estimation is a precondition three other documents already defer
  to. Waiting for #17 would have blocked #15 and #18 behind an issue nobody scheduled.
- **Why the backlog is acceptable as the breakdown, and not merely convenient:** the epic-to-child tree
  matches the requirement blocks of the requirements specification section 4 exactly, and it was read
  from the board rather than inferred from titles. A separate structure plan would restate the same tree
  in a second place, where the two would then diverge. The recommendation recorded in the estimation is
  that #17 adopts this tree instead of inventing another.
- **Rejected:** *hours*. Already decided on 2026-08-06 and not reopened. Points are also the only unit
  that makes the buffer sprint's velocity slide producible, since a velocity has to sum estimates and an
  issue count does not sum to anything.
- **Rejected:** *estimating Sprint 0 and Sprint 1 retroactively* so that a velocity would exist
  immediately. Estimating work after it is finished produces a number that flatters whatever it is
  compared against. The sprint log records instead that story-point velocity starts with Sprint 2.
- **Consequence, and it is the finding rather than the method:** 74 of the 110 open implementation points
  are `must have`, and no must-have is droppable without the deliverable ceasing to be a game. Applying
  the drop order of the requirements specification in full removes 36 points and leaves all 74. So the
  remaining levers are the calendar and the quality bar, both of which belong to the Product Owner and to
  the project plan of issue #15. The estimate turned a MoSCoW count into a cost, which is what it was
  named as missing for.
- **Second consequence:** the estimate found 12 points of `must have` work with no board issue, the npm
  bootstrap and the i18n setup, plus 2 points of CI. A board-derived plan understates the work by that
  much, and the finding came out of estimating rather than out of planning.
- → Ch. 02, Ch. 11

### 2026-08-22: The Gantt chart is drawn in the repository, and the board stays authoritative

- **Chosen:** the Gantt chart lives in [Roadmap-and-Gantt.md](../Project-Management/Roadmap-and-Gantt.md)
  as a Mermaid `gantt` block, and the board's Roadmap view stays the live tracking surface. The
  configuration of the view is recorded in the same document.
- **Rejected:** *the board's Roadmap view as the only deliverable*, which is the literal reading of issue
  #18 ("Creation in Github"). Two things make it insufficient rather than merely inconvenient. **A
  Projects view has no export**, so the only artefact is a screenshot: a binary that does not diff, goes
  stale when any date changes, and has to be retaken by hand. And **the view cannot be configured from
  here**, because grouping, zoom and the date fields of the 13 Sprint 1 issues all need the `project`
  token scope the `gh` token does not carry.
- **Rejected:** *waiting for the token scope before closing the issue*. The scope needs an interactive
  browser flow that an agent cannot perform, so waiting would have parked the last Sprint 1 issue behind
  a step nobody had scheduled. What can be produced without it was produced, and what cannot is listed as
  an outstanding action with the reason.
- **The risk this creates, and how it is closed:** drawing the plan in the repository creates a second
  place where the schedule lives, which is exactly the failure mode the sprint-membership decision of the
  same day exists to prevent. So the precedence is stated in the document itself: **if the chart and the
  board disagree, the board wins and the chart is corrected.** A second copy with a stated precedence is
  a mirror; a second copy without one is a fork.
- **Consequence for the report:** Figure 5 is a text diagram that renders on GitHub and exports at the
  end, the same trade-off already taken for the two architecture figures. Figure 6 stays reserved for the
  board screenshot, because issue #18 does ask for the view, and it is not worth taking while the board
  shows 4 bars and 7 dots out of 64 items.
- → Ch. 02, Ch. 11, Ch. 12

### 2026-08-22: There is no buffer sprint, and Sprint 3 is not one under another name

- **Chosen:** the board's four sprints hold. No fifth sprint is created. The closing work of the written
  plan's buffer week becomes a **dated window inside Sprint 3**, 2026-09-14 to 2026-09-17, behind a
  **feature freeze at the end of 2026-09-11**.
- **Rejected:** *board `Sprint 3` doubles as the buffer sprint*. This was the reading the sprint log had
  suggested since 2026-08-06, on the strength of Sprint 3 being 1½ weeks and sitting where the buffer
  would. It was rejected because it is a label rather than a plan: it leaves the boundary between
  building and closing undefined, and that boundary is the only thing worth deciding here. Length alone
  is not evidence of intent.
- **Rejected:** *adding a fifth sprint to the board after 2026-09-17*. No date after 2026-09-17 is known
  to be available. The board's last date is 2026-09-17 and the module's real deadline is recorded nowhere
  in this repository, so planning past it would be planning into a period that may not exist. That
  unknown is now a rated risk of its own rather than an assumption.
- **Why a window and not a sprint:** the closing scope is real work with real issues, #24 playtest and
  #25 deck and video, 10 points between them, plus the report. Dropping the buffer sprint without
  rehoming its scope would have quietly dropped the usability evidence the report needs and the fallback
  video that mitigates the live-demo risk.
- **Consequence, and it is the cost rather than the benefit:** implementation loses 4 weekdays. 15 remain
  instead of 19, and the required rate for the 74 must-have points rises from 3.9 to 4.9 points per
  weekday. The estimation document keeps both figures side by side rather than overwriting the first,
  because the difference between them is exactly what putting the closing work in the calendar costs.
- **Sprint 0's 2½-week length is deliberately left uncorrected.** Back-dating a board date to match the
  prose plan would be editing history to make a plan look kept. It stays a Chapter 11 finding: the first
  sprint ran over half again its planned length before any tracking existed to notice.
- → Ch. 02, Ch. 11

### 2026-08-22: No dedicated Scrum Master, and the role table that names people wins

- **Chosen:** the role table of [00-One-Pager.md](../Project-Management/00-One-Pager.md) holds. Fabian
  Gemming is Product Owner, Lars Bolender and Benedict Glatz are Scrum Members who also carry the Scrum
  Master work. The unnamed Developer A/B/C table in
  [01-Github-Project.md](../Project-Management/01-Github-Project.md) is superseded and kept in place with
  a note, not deleted.
- **Why:** the one-pager names real people, it is the Product Owner's own document, and it matches what
  actually happened over two sprints. The A/B/C table names placeholders and was never filled in, which
  is an unfinished template rather than a competing decision.
- **Rejected:** *appointing one of the three as Scrum Master now*. It would make the report's process
  chapter tidier and it would be a fiction. Nobody performed that role for two sprints, and describing a
  role nobody filled is worse for the grade than explaining why a team of three did without one.
- **Rejected:** *keeping the A/B/C table's three technical lead roles*. They assume three implementers
  and there are two, because the Product Owner does not implement. What survives is the idea behind it,
  which is naming a technical area per person instead of leaving ownership implicit.
- **Rejected:** *splitting the two implementers by layer*, which is the obvious move given that the
  architecture is layered. The critical path runs through `core/`, `state/` and `ui/` in sequence, so a
  layer split would put one person on the critical path and the other waiting on it. Work is split per
  issue at sprint planning instead. Recorded because the layer split looks natural and the architecture
  is not a work breakdown.
- **Negative finding that comes with the decision:** the board hygiene a Scrum Master would have owned
  was skipped for the whole of Sprint 1. `Status` and `Sprint` went unread until 2026-08-22, the eight
  open issues went unassigned until the second-to-last day, and one ceremony has been minuted in the
  whole project. Resolving the contradiction does not resolve that, and the plan says so rather than
  implying the roles are now covered.
- → Ch. 02, Ch. 11

---

### 2026-08-22: The project structure plan is structure only, and it mirrors the board

- **Chosen:** [Project-Structure-Plan.md](../Project-Management/Project-Structure-Plan.md) adopts the
  board's epic and sub-issue graph as its implementation branch, groups the remaining issues by kind
  of deliverable, and carries no points, dates, owners or MoSCoW classes. Each of those lives in
  exactly one other document, which the plan names, and the board wins any disagreement.
- **Why:** the board is already the team's working structure and the single source of truth for sprint
  membership since the 2026-08-22 decision above. Every column copied into the PSP is a copy that
  drifts; the effort estimation had already reserved the cost column for itself and asked #17 to adopt
  its tree rather than invent another.
- **Rejected:** *a freely designed product tree*, the textbook approach. It would force every issue to
  be mapped into a second structure and would diverge from the board with the first new issue.
- **Rejected:** *a phase-oriented decomposition* along the existing `2-definition` to `5-completion`
  labels. The labels classify issues by lifecycle stage; a phase tree would tear each epic across
  three phases and say nothing about what the game consists of.
- **Rejected:** *work packages for the standing process activities and for testing*. A package named
  "do the process" is done only when the project is, and a separate testing package would license
  deferring tests, which the Definition of Done exists to prevent.
- **Also decided, by the team rather than in the document:** #17 itself moved from the Sprint 3
  closing window into Sprint 1, and the deliverable was committed directly on `dev` as an exception
  to the feature-branch rule, because the sprint ends 2026-08-23 and one self-contained document was
  judged not worth a review round against the sprint boundary.
- → Ch. 02

---

### 2026-08-29: Board dates come from the commit, not from the issue closure

- **Chosen:** the 14 closed board items that had no dates were filled in with the day their delivering
  commit was authored, read per document out of `git log`. `Start Date` was set equal to `End Date`.
- **Why:** the seven `Sprint 0` items already on the board are dated that way. #6 and #47 carry
  2026-08-09 and were closed 2026-08-10. Filling the rest by close date would have made a single field
  mean the commit day for some rows and the closure day for others, and nothing on the board would say
  which row is which. Consistency inside one field beats picking the more defensible definition for
  half of it.
- **Rejected:** *the merge-into-`dev` or issue-close date*. It is partly a record of when somebody got
  round to clicking merge. For #13 the two differ by six days, and all six are the recovery from the
  2026-08-09 unreviewed-merge history rewrite rather than work on the document.
- **Rejected:** *the last commit that touched the file*. That is `ade75f7`, the em-dash sweep of
  2026-08-22, which touches most of these documents and would have dated nine issues to a day up to two
  weeks after they were finished.
- **Rejected:** *setting `End Date` alone*, which is literally what was asked for. A roadmap layout
  renders nothing for an item carrying one date of the pair, so the sprint would have stayed as absent
  from the chart as it was before. The pair is what makes the request's actual goal work.
- **Consequence, and it is the honest limit:** the dates are commit days, not work spans. Every bar is
  zero-length, so the Roadmap still shows when things landed and never how long they took.
- → Ch. 02

---

### 2026-08-29: The reading level of the documentation is written into `CLAUDE.md` as a rule

- **Chosen:** three new sections at the top of [CLAUDE.md](../../CLAUDE.md), *Communication*, *Tone &
  Readability* and *Structure & Scannability*, stating that the readers are 4th semester students and
  that answers and documents are written in plain English, broken into short paragraphs, bullets and
  tables, with the key terms in bold.
- **Why:** the project's documents are written by an AI assistant and read by three students, and the
  register drifted upward over Sprint 1. Several planning documents are dense enough that a reader has
  to re-read a sentence to get the claim out of it. That is a real cost at review time and a real cost
  in the report, which is graded on being understood.
- **Rejected:** *leaving the register to be corrected per document.* It was already being corrected that
  way and it did not hold, because a correction inside one document does not reach the next one. A rule
  in `CLAUDE.md` is read at the start of every session, which is the only place a standing instruction
  survives.
- **Also rejected:** *putting the guidance in the existing `Writing style` section.* That section owns
  one narrow ban, the em dash and the rhetorical habit behind it. Mixing a general register rule into it
  would have made the em dash rule look like a matter of taste, when it is a hard constraint that a
  verification command checks.
- **Consequence:** the two rules can pull against each other. Plain English wants short sentences, and
  the em dash ban removes the punctuation mark that usually shortens one. What resolves it is splitting
  into ordinary sentences rather than reaching for a semicolon, which is what the *Writing style*
  section already says.
- **Recorded as a process finding:** the change sat in the working tree as an uncommitted edit with no
  changelog entry and no journal entry, so it broke steps 2 and 3 of `CLAUDE.md`'s own mandatory
  per-change list. It was committed with both attached before any Sprint 2 work started. The finding
  worth keeping is that the file holding the rules is the file most likely to be edited outside them.
- → Ch. 02, Ch. 10, Ch. 11

---

### 2026-08-29: #28 is split and the two invisible must-have issues are created

Three of the four board actions section 6 of
[Effort-Estimation.md](../Project-Management/Effort-Estimation.md) listed as outstanding are carried
out in one sitting, now that the `project` token scope exists. They are one decision block because
they answer the same question: what does the board have to show before Sprint 2's numbers mean
anything.

- **Chosen, action 1:** a `Story Points` number field, back-filled on the **25 open issues** the
  estimation sizes. Total 134 points, which reconciles with the document's 138 open points once #17
  (delivered) and the CI workflow (no issue) come off.
- **Chosen, action 3:** **#28 is split.** It was *Pawn/Token Spawning & Movement Animation* at 8 points
  and held the movement rule and the pawn rendering in one issue. It is now **#28 *Pawn Movement
  Rules*** at 5 and **#62 *Pawn Rendering & Movement Animation*** at 3, with #62 attached to epic #36
  as a sub-issue. The split is point-neutral, which is the point: it is sequencing, not re-estimation.
- **Why the split is worth doing on the day implementation starts:** #28's rule half blocks #27, #29,
  #62 and the whole playable slice. Its animation half blocks nothing and cannot start before the
  design system lands. Held together, the issue is only finishable after the design is in, so an
  8-point item that four other issues wait on could not be closed for a reason unrelated to any of them.
- **Chosen, action 2:** **#63 Project Bootstrap** (5) and **#64 i18n Setup** (5) are created, labelled
  `4-implementation` and `must have`, put in Sprint 2 and assigned to both implementers. 10 of the 12
  points that were invisible to the board are now on it.
- **Rejected: creating the CI workflow issue too**, which would have closed all 12 points. It carries no
  requirement id, nobody has scheduled it, and creating an issue while setting `Sprint 2` on everything
  else would have put unscheduled work in a sprint by accident. Named as still owed instead.
- **Rejected: back-filling points onto closed issues.** Estimating Sprint 0 and Sprint 1 after the fact
  was already rejected on 2026-08-22. The one tempting exception is #17, whose estimate genuinely
  predates its delivery by a few hours, and it was left blank as well: filling only #17 would make
  Sprint 1 read as 2 points across 14 issues, which is a more misleading number than a blank.
  **Consequence: story-point velocity has its first data point at the end of Sprint 2 and nothing to
  compare it to.**
- **Rejected: giving the four epics points of their own.** An epic is the sum of its children.
- **Also rejected, and this is the uncomfortable one: correcting Sprint 2's scope on the board.**
  #42 to #46 carry `Sprint 2` and section 4.4 of
  [Project-Plan.md](../Project-Management/Project-Plan.md) says they are unscheduled. That is **34 of
  the sprint's 72 points**, all of it `should have` or `could have`. Removing them would make the board
  match the plan, and it would be one person editing a shared sprint's scope out of a session nobody
  else was in, which is exactly what the 2026-08-22 sprint-membership decision exists to prevent. The
  board wins, the divergence is written into [sprint-log.md](sprint-log.md), and the correction is a
  planning-slot decision.
- **Negative finding that survives all of this:** the 17 implementation child issues still carry no
  MoSCoW label, so a `must have` filter over Sprint 2 returns 13 points, all of them on issues created
  today. Action 4 of the estimation is the one still open.
- → Ch. 02, Ch. 11

---

### 2026-08-29: Two architecture rules become failing lint runs instead of prose

- **Chosen:** the bootstrap configures ESLint so that the two constraints this project has repeated in
  five documents are checked by a machine. `max-lines` at 300 over every `**/*.js` for NFR-02, and
  `no-restricted-imports` over `src/core/**` for NFR-01, banning `state/`, `ui/`, `i18n/`, `jquery`
  and `i18next` by name, each with its own error message naming the requirement.
- **Added beyond that, and it closes a hole the plan had:** `no-restricted-globals` over both
  `src/core/**` and `src/state/**`, banning `document`, `window`, `navigator`, `localStorage`, `$` and
  `jQuery`. The import ban alone does not stop a file writing `document.querySelector(...)`, because
  reaching a global needs no import at all.
- **`max-lines` counts blank lines and comments**, `skipBlankLines: false` and `skipComments: false`.
  The default skips both. Skipping them would reward exactly the behaviour `CLAUDE.md` forbids, which
  is getting under the limit by deleting whitespace or comments rather than by splitting the file.
- **Both rules were verified by breaking them on purpose**, not by reading the config. A probe file
  in `src/core/` importing `../state/game-state.js` and `jquery` and calling `document.querySelector`
  produced three restriction errors and exit code 1; a generated 302-line file produced
  `File has too many lines (302). Maximum allowed is 300`. The probes were then deleted. A rule that
  has never been seen to fail is a rule nobody knows is wired up.
- **Rejected: leaving both as review discipline**, which is what they have been since 2026-08-06. The
  journal already records the limit as unenforced on 2026-08-22, and the feasibility study's finding
  is the argument: with generation cheap, the binding constraint is **review** capacity. A constraint
  that only a reviewer can catch is a constraint that lapses first under deadline pressure, and this
  branch is where deadline pressure starts.
- **Rejected: a custom ESLint plugin** for the layering, which would express the rule more precisely
  (it could follow re-exports, for one). It is a second thing to maintain and a sixth dev dependency,
  and the pattern-based version catches the mistake anyone would actually make.
- **Consequence, and it is a real one:** `npm run lint` is now a gate that can block a commit for an
  architectural reason. That is the point, and it will be annoying at some point. The response when it
  is annoying should be splitting the file, not raising the number.
- → Ch. 07, Ch. 08, Ch. 03

---

### 2026-08-29: Prettier formats code and not the documentation

- **Chosen:** `.prettierignore` excludes every `*.md` file and the whole of `00-Meta/`. `npm run
  format` therefore touches JavaScript, JSON, HTML and CSS only.
- **Rejected:** *letting Prettier format the markdown too*, which is the default and would be one
  fewer thing to think about. It loses because the documentation is written to a hand-chosen wrap
  width with tables aligned to be read in the raw file, and Prettier would rewrap all of it. The
  resulting diff would be thousands of lines in which the actual change is invisible, and a diff
  nobody can read is a review nobody performs.
- **Also rejected:** *configuring Prettier's markdown options to match the current style*. Prettier
  has no setting for the thing that matters, which is the em dash ban of `CLAUDE.md`, and matching the
  rest by configuration would still rewrite every file once.
- **The cost, stated plainly:** markdown formatting stays a matter of discipline rather than a tool,
  in exactly the same way the em dash ban does. Two of this project's writing rules are now enforced
  by people and one (line length in code) by a machine.
- **A second thing was needed to make the formatter work at all**, and it was found by running the
  tools rather than by reasoning about them: `.gitattributes` with `* text=auto eol=lf`. The
  repository has `core.autocrlf=true` and all three of us are on Windows, so a fresh clone hands
  Prettier CRLF files while `.prettierrc` sets `endOfLine: "lf"`, and `npx prettier --check .` would
  report every file as badly formatted before anyone had touched it.
- → Ch. 07

---

### 2026-08-29: Three packages installed that are not literally on the approved list, and one refused

- **Chosen:** `@playwright/test`, `@vitest/coverage-v8` and `@eslint/js` were installed without
  asking, on the reading that each is part of an already-approved tool rather than a new one.
  `@playwright/test` **is** Playwright's package name; `@vitest/coverage-v8` is Vitest's own coverage
  provider, published by the Vitest team, and `npm run test:coverage # Vitest with v8 coverage` is a
  script `CLAUDE.md` requires; `@eslint/js` is ESLint's own package and is how a flat config reaches
  `js.configs.recommended`.
- **Rejected, and this is the one that shows where the line was drawn:** `globals`. It is the usual
  way a flat ESLint config declares browser and Node globals and it would have been the fourth
  install. It is a third-party package rather than an ESLint one, so it was **not** installed and the
  globals are declared by hand in `eslint.config.js` instead. The cost is a short list to maintain.
- **Why this is written down rather than just done:** `CLAUDE.md` says anything beyond the approved
  set is asked for, not installed. Three packages were installed on a judgement call, and the team
  should be able to overrule that judgement without first having to work out what happened. If the
  reading is wrong, the fix is one `npm uninstall` and a different way to reach the same script.
- **Also recorded:** the licence check the feasibility study parked on `package.json` existing was run
  the same day. 8 of the 9 direct dependencies are MIT and Playwright is Apache-2.0. **The transitive
  tree of 139 packages was not checked**, and that limit is stated rather than left to be assumed.
- → Ch. 03, Ch. 07

---

### 2026-08-29: The board module fails loudly, and its properties are tested exhaustively

Three small decisions taken while writing `core/board.js`, none of them obvious and all three cheap
to get wrong later.

- **Chosen: the functions validate their arguments and throw `RangeError`.** A player outside 0 to 3,
  an `r` outside 0 to 58, a non-integer, or an `absoluteSquare` call for a pawn that is not on the
  track are all errors.
- **Rejected:** *returning a sensible value anyway*, for example clamping `r` or letting the modulo
  wrap something meaningless. It is the usual choice for arithmetic helpers and it is wrong here,
  because this layer has no user interface. A wrong number produced silently in `core/` surfaces as a
  pawn standing in the wrong place three modules later, and the stack trace by then points at the
  view. **Rejected also:** returning `null` for an invalid input, which pushes a check into every
  caller and gets forgotten in one of them.
- **Chosen: two constants are derived instead of typed in.** `PLAYER_OFFSET` is
  `TRACK_LENGTH / MAX_PLAYERS` and `HOME_R` is `TRACK_LENGTH + HOME_COLUMN_LENGTH + 1`. The rulebook
  derives them the same way, so if the track length is ever changed there is one number to edit and
  not four. **Rejected:** writing `13` and `58` directly, which reads more clearly and is exactly the
  kind of thing that goes out of sync silently.
- **Chosen: three of the board's properties are asserted over their whole domain**, not at a sample
  point: all 52 track positions per player, every pair of players against every pair of home column
  steps, and every home column position against every track position. **Rejected:** one example per
  property, which is the normal thing to write. A claim about a board's topology is a claim about
  every position on it, and a wrong modulo passes a sample test comfortably. The loops cost a few
  milliseconds and roughly twenty lines.
- **One export exists that the plan for this issue did not list: `homeColumnStep(r)`**, returning 1
  to 5. The DOM contract handed to Claude Design uses `data-home-step="1"` to `"5"`, so somebody has
  to turn `r = 53` into step 1. Putting it in `core/` keeps that derivation next to the constant it
  depends on, instead of letting a view re-derive `r - 52` on its own.
- → Ch. 05, Ch. 08

---

### 2026-08-29: The board is drawn as DOM elements in a CSS Grid, not as SVG or canvas

- **Chosen:** every square, every pawn and every start slot is a real DOM element, laid out by CSS
  Grid. This is stated as a hard constraint in
  [01-brief-foundations-and-board.md](../../01-Design/Handoff/01-brief-foundations-and-board.md)
  section 2.
- **Why, and all four reasons are "something the project already committed to becomes free":**
  1. **jQuery is the project's only UI dependency**, and jQuery exists to manipulate DOM elements. In
     SVG or on a canvas it would have almost nothing to do.
  2. **Playwright selects a square by data attribute.** `page.locator('[data-square="13"]')` is one
     line. On a canvas there is nothing to select at all, so every end-to-end assertion would have to
     go through pixel comparison or through a test-only JavaScript hook, and the 12 flows of the test
     plan are the project's main evidence that the game works.
  3. **i18next puts text into an element.** The refusal region of S6 (NFR-08) is text on screen, and
     text on a canvas is drawn rather than translated.
  4. **CSS transitions animate a pawn for free.** The pawn's grid position changes and the browser
     does the movement. In canvas that is an animation loop somebody writes and maintains.
- **Rejected: SVG.** It is the natural fit for a board of shapes and it scales without pixelation.
  It loses on the same four counts in weaker form: jQuery's DOM helpers work awkwardly on SVG
  elements because of namespaces, and CSS Grid does not lay out SVG children, so the geometry would
  have to be computed in JavaScript instead of declared in a stylesheet. That moves layout out of the
  design system and into code, which is exactly the seam this project is trying to keep clean.
- **Rejected: `<canvas>`.** The most capable of the three and the fastest for many moving objects,
  neither of which this game needs: it is turn-based and moves one pawn at a time. It costs the
  entire accessibility and testability surface, since a canvas is one element with no internal
  structure. It would put a rendering loop in `ui/` and make NFR-12's greyscale check, FR-32's
  highlighting and NFR-08's on-screen reason each into custom drawing work.
- **This reverses a deferral, and that is worth naming rather than glossing over.** Section 6 of
  [System-Architecture.md](../Project-Management/System-Architecture.md) said the choice "belongs to
  Claude Design and issue #3, and picking one in this document would be inventing a design rule that
  CLAUDE.md forbids". That was over-cautious. `CLAUDE.md` forbids Claude Code from inventing **colour
  palettes, spacing scales, typography systems and component looks**. A rendering technology is none
  of those: it decides what a stylesheet can address, not what anything looks like. And the decision
  could not be deferred any longer in practice, because a brief cannot hand over a DOM contract
  without first deciding that there is a DOM.
- **The escape hatch is written into the brief**: it says in as many words that if a constraint makes
  a design impossible, Claude Design should say so rather than work around it. So the decision is
  reversible by the person whose territory it borders on.
- **Consequence:** `ui/board-view.js` renders a fixed set of elements and sets attributes on them,
  the stylesheet owns every appearance, and movement animation is a CSS token rather than JavaScript.
  It also means the 300-line limit now applies to CSS files, which is why the brief says so.
- → Ch. 04, Ch. 03

---

### 2026-08-29: The design handoff is a pair of documents with a fixed shape

- **Chosen:** a top-level `01-Design/` folder, committed to git, holding a numbered brief and spec per
  round. Claude Code writes a seven-section brief, Claude Design answers with a five-section spec plus
  the real CSS files in `src/ui/styles/`.
- **Why the CSS goes straight into `src/ui/styles/` and not into `01-Design/`:** the design system
  becomes the code instead of being translated into it. Every translation step from a design document
  into a stylesheet is a chance to drift, and the drift is invisible because both artefacts still look
  correct on their own.
- **Why the reasoning stays in `01-Design/` instead:** "what does it look like" belongs with the code
  and "why does it look like that" belongs where a report author can find it without reading a
  stylesheet.
- **Why the spec template forces a rejected alternative per answer:** the project's documentation
  rules require one for every decision, and this is the one handoff where the rule would otherwise be
  lost, because a delivered palette looks finished and a finished thing does not invite the question
  "compared to what". Asking for it in the template costs nothing; reconstructing it in week eight is
  impossible.
- **Rejected: keeping the handoff in the issue thread on GitHub**, which is where a design
  conversation would normally live. It loses because issue bodies in this project are empty by
  standing habit, a thread cannot be reviewed in a pull request, and the report cannot cite it as an
  artefact.
- **Rejected: putting the design documents under `00-Meta/Documentation/`** with the chapter notes.
  Those notes are report material, read once near the end. A handoff is working material read
  during the sprint by the other side of the loop, and burying it among 13 chapter notes puts it where
  nobody looks. Same argument as the 2026-08-09 decision about the goal catalogue.
- **Consequence:** `01-Design/` is a third documentation directory. The 300-line limit is read as not
  applying to it, for the reason recorded on 2026-08-22, and both files written so far are under 300
  lines anyway, so the exemption has not been used.
- → Ch. 04, Ch. 02

### 2026-08-29: The rules take a pawn list, not the state object

- **Chosen:** every function in `core/` takes a plain array of `{ player, pawn, r }` records. The
  plan sketched `legalMoves(state, playerId, roll, dieMax)`; what was built is
  `evaluateTurn(pawns, playerId, roll, dieMax)`.
- **Why:** NFR-01 says `core/` imports nothing from `state/`. Passing the state object would keep the
  letter of that rule and break its point, because `core/` would then know the state object's shape
  and every change to that shape would reach into the rules. A list of pawns is the smallest thing
  the rules actually need.
- **Second reason, and the one felt every day:** a test builds a position out of four literals. With
  the state object, every movement test would have to construct a whole match first.
- **Rejected: passing the state object and reading only `state.pawns` from it.** It works and it is
  one less argument at the call site. It loses because "we only read one field" is a convention, and
  a convention is exactly what the ESLint rule for NFR-01 was added to stop relying on.
- **Consequence:** `state/` does the unwrapping. That is one line per call and it is where the
  knowledge of the state shape belongs.
- → Ch. 05, Ch. 06

### 2026-08-29: The rules return new pawn lists and write to none

- **Chosen:** `withPawnAt`, `resolveCapture` and `applyMove` all copy. Nothing in `core/` assigns to
  a pawn it was given.
- **Why:** a test can compare the position before and after a move without having taken a deep copy
  first, which is what makes the "two own pawns can never share a square" property test readable at
  all. And a stale reference held by `ui/` cannot corrupt the board, which is the layering rule
  (NFR-01) holding even when somebody forgets it.
- **Rejected: mutating in place**, which is the obvious choice for a 16-element array and is faster.
  It loses because the game is turn-based and moves at most one pawn per turn, so the performance
  argument is worth nothing here, while the debugging argument is worth a lot.
- **Cost, stated honestly:** one array copy of at most 16 entries per move.
- → Ch. 05

### 2026-08-29: A refusal reason is computed with the legal-move set, not afterwards

- **Chosen:** `evaluateTurn` returns the legal moves, a per-pawn refusal reason for every pawn that
  cannot move, and one turn-level reason when nothing can move at all.
- **Why:** NFR-08's acceptance criterion is that a playtester can say why a move was refused without
  being told, and FR-14 requires the reason on screen when the turn passes. A reason derived later,
  in `ui/`, would have to re-implement the rule that produced it. Two copies of a rule is one copy
  too many, and the second is the one that drifts.
- **Rejected: returning only the legal moves and letting the view say "no legal move".** It is less
  code and it satisfies FR-14 literally. It loses on NFR-08: "no legal move" is not a reason, and a
  player who cannot tell a refusal from a bug stops trusting the game.
- **The reasons are i18next keys and not sentences**, because NFR-03 forbids a user-facing string in
  `src/` outside the locale files, and `core/` is the layer that must not know a language at all.
- **Negative finding recorded rather than smoothed over:** one of the three reasons section 6.3 of
  the game design document names, "every target square blocked by an own pawn", cannot occur as a
  turn-level reason. `r` only counts upward, so the pawn furthest along has nobody in front of it and
  is never blocked by one of its own; it either moves or overshoots. The key stays, because it is a
  real per-pawn reason under FR-32, and because FR-12 is unsigned and its rejected alternative
  (blocking) would break the argument. A test states the finding in place.
- → Ch. 05, Ch. 08

### 2026-08-29: The dice stub draws a hand of one, and holds no turn state

- **Chosen:** `core/dice-source.js` implements the interface the real Dice Card Pool (#37) will
  implement, `{ handSize, draw(rng), returnHand(hand) }`, and the stand-in returns a hand of exactly
  one card.
- **Why a hand of one and not three identical cards:** three would let a "pick one of three" screen
  be built against something that never had a choice in it. The missing choice would then surface in
  #37, in the UI, which is the most expensive place to find it.
- **Why the `chosen()` method in the plan's sketch was dropped:** which card the player picked is
  part of the turn, and the turn belongs to the turn manager. A source that remembered it would be a
  second place where turn state lives, and the two would eventually disagree.
- **Rejected: writing the real 20-card pool now.** It is issue #37 and 5 points, it is not in this
  branch's scope, and the state layer cannot be written without something to draw from either way.
- **What makes the swap cheap rather than wishful:** FR-09 is written as `roll === dieMax` and never
  as `roll === 6`, so it already works for a D2 and a D20; and the RNG enters from outside (NFR-09),
  so the swap changes one argument at the composition root.
- → Ch. 05, Ch. 06

### 2026-08-29: The state object is frozen, so `ui/` cannot write to it even by accident

- **Chosen:** every state object is deeply frozen, and every transition builds a new one through the
  single function `nextState`.
- **Why:** `CLAUDE.md` says `ui/` never mutates state directly. Freezing turns that from a convention
  into an error. ES modules run in strict mode, so an assignment to a frozen object **throws** rather
  than being silently dropped, and a view that writes to the board fails in the line that did it
  instead of three renders later.
- **Rejected: a code review convention**, which is what the rule was until now. It is free and it is
  exactly the kind of rule a three-person team under time pressure stops applying. The same argument
  produced the two ESLint rules on 2026-08-29.
- **Rejected: a deep clone on read**, handing `ui/` a copy it may do what it likes with. It costs a
  clone per render instead of a copy per transition, and it hides the mistake rather than reporting
  it: a view that writes to its copy simply has no effect, which is harder to debug than a throw.
- **Cost:** one shallow copy of a small object per transition, in a turn-based game that changes
  state a few times per turn. The freeze is hand-written for the known state shape rather than a
  general recursive freeze, because a general one would have to guard against cycles this shape
  cannot have.
- → Ch. 06

### 2026-08-29: The intent vocabulary has four entries, and none of them names a target square

- **Chosen:** `ui/` may dispatch `choose-die`, `select-pawn`, `commit-move` and `end-turn`, and
  nothing else. `commit-move` names a **pawn**, never a destination.
- **Why:** the destination comes out of the legal-move set that `core/` already produced. If the view
  could name a square, the rule that decides whether that square is reachable would have to be
  applied a second time, on the way in, and the two copies would eventually disagree. Section 2 of
  the architecture document called this out on 2026-08-22 as the reason the rule check and the state
  write are separate steps.
- **Rejected: a generic `applyMove(move)` intent** taking the move object. It is more flexible and
  the flexibility is the problem: the view would be constructing rule output instead of choosing from
  it.
- **A rejected intent returns the state object it was given**, identical rather than copied, so a
  test asserts `result.state === before`. Every check runs before anything is written, so there is
  never a half-applied intent to undo.
- **Two intents run two rulebook steps**, because the rulebook has no player input between them:
  `choose-die` also rolls, and `commit-move` also resolves. `end-turn` also draws the next player's
  hand, so the board is never in a phase the player can see and cannot act on.
- → Ch. 06, Ch. 04

### 2026-08-29: `legalMoves` and the refusal reason are cached in state for exactly one turn

- **Chosen:** the legal-move set and the turn's refusal reason are written into the state when the
  die is rolled, and wiped when the turn ends.
- **Why this is not the usual "derived state goes stale" mistake:** the lifetime is one turn. They
  are written once per roll from the pawn positions that produced them, and there is no transition
  between the write and the wipe that can change those positions. Chapter 06's own brief warns
  against derived values in state, and this is the answer to that warning rather than an exception
  to it.
- **Rejected: recomputing on every render.** It puts a rules call in the render path, and it makes
  FR-32's highlighting and NFR-08's refusal text two separate calls to the same rule instead of one
  result used twice.
- **Deliberately not cached: whether anyone has won.** `core/win.js` answers that from the pawn
  positions every time a move resolves. `winner` records the outcome after the match is over, which
  is a fact about a finished match and not a shortcut around a rule.
- → Ch. 06

### 2026-08-29: The empty per-file coverage table was not a defect, and the earlier note was wrong

- **What was recorded after #26:** `npm run test:coverage` prints correct totals and an empty
  per-file table, called a measured defect and worked around by reading
  `coverage/coverage-summary.json`.
- **What is actually true:** the v8 text reporter omits files that are at 100 %. At #26 there was one
  measured file and it was at 100 %, so the table had nothing to show. After #27 there are ten, one
  of them below 100 %, and that row renders.
- **Why it is worth a decision block rather than a silent edit:** the wrong conclusion was reached
  confidently, from a sample of one, about a tool nobody had used before. That is a failure mode
  worth naming in the retrospective, and deleting the claim would delete the evidence for it.
- **The workaround stays**, because commands 5b and 5c aggregate per directory, which is what NFR-05
  asks for and what neither the text reporter nor the totals give.
- → Ch. 08, Ch. 09

### 2026-08-29: German is the default language and English is the fallback

- **Chosen:** the game starts in German. A key missing from `de.json` shows the English text.
- **Why:** the team, the module and the presentation are German, so German is the language the game
  is actually read in. Nothing in the requirements or the obligations book states a default, so this
  was open and is now decided rather than left to whichever line was written first.
- **Rejected: English as the default**, which is the usual convention for a codebase written in
  English and would have matched every identifier in the project. It loses because nobody in the
  audience of the presentation reads the game in English, and a default nobody uses is a default
  nobody notices is broken.
- **Rejected: detecting the browser language.** One line of i18next configuration, and it makes the
  language the game starts in depend on the machine it is demonstrated on. FR-34's runtime switch
  covers the real requirement, and it is tested.
- **The fallback is a safety net and not a plan.** A unit test requires both files to be complete,
  which is NFR-03's acceptance criterion, so the fallback should never fire.
- → Ch. 04

### 2026-08-29: i18n is set up before the first view, not after it

- **Chosen:** issue #64 was done in the same branch as the rules and before any of `ui/` exists.
- **Why:** NFR-03 forbids a hardcoded user-facing string anywhere in `src/`. Doing this after the
  views exist means going back through every one of them to find the literals. Doing it first means
  there is never a literal to find.
- **It cost almost nothing because the rules already spoke in keys.** `core/movement.js` produces
  `move.refused.overshoot` and `state/intents.js` produces `intent.rejected.wrong-phase`. Neither has
  ever held a sentence, so this issue was writing the text and the wiring, not converting anything.
- **Rejected: leaving it to Sprint 3 with the rest of the polish**, which is where the requirements
  specification's own sprint mapping puts NFR-03. It loses for the reason above, and because #64 had
  no board issue at all until 2026-08-29: a `must have` with no issue is work that gets done late by
  default rather than by decision.
- → Ch. 04, Ch. 08

### 2026-08-30: The track is 40 squares and not 52, and the rulebook changed to follow the design

- **Chosen:** `TRACK_LENGTH = 40`, `PLAYER_OFFSET = 10`, entry squares 0 / 10 / 20 / 30, turn-off
  squares 39 / 9 / 19 / 29. Section 2 of the game design document was rewritten the same day, in the
  same commit as `src/core/board.js`.
- **Why:** the first design handoff came back with a board built on a different topology. An arm of
  the printed *Mensch ärgere Dich nicht* board shows five fields in its outer row, and D3a of
  [01-spec-foundations-and-board.md](../../01-Design/Handoff/01-spec-foundations-and-board.md)
  established that this is a property of the topology and not of the field size: an arm's outer row
  turns at the centre rather than stopping there, and the corner field it turns on belongs to two
  arms at once. Counting that shared field closes the ring at `4 × (4 + 1 + 4 + 1) = 40`.
- **The decision was put to the user before anything was written**, because the design spec named it
  as Product Owner territory and because it invalidates committed, passing code. Both this and the
  house question below were answered on 2026-08-30 before implementation continued.
- **This overturns a decision that was already written down with a reason**, which is the part worth
  recording. Section 2.1 of the game design document had explicitly rejected 40 squares on two
  grounds. One of them, that 40 "breaks the 4 × 13 symmetry", was **simply wrong**: 40 = 4 × 10 is
  exactly as symmetric. The other, that match length is better tuned through the pool than through
  the track, still stands and is not contradicted by this change.
- **Rejected: keeping 52 and sending `board.css` back for a re-geometry round.** It preserves the
  rulebook and every committed test, and it costs a second design handoff before any of the UI work
  can start, in a sprint that already had five weekdays left. It also throws away the one thing the
  design round was for.
- **Rejected: 44 squares on a 13 × 13 grid**, which is a smaller change from 52. It cannot show five
  fields per outer row without deleting the centre corner fields, and deleting those breaks the ring
  into four unconnected arms. The spec records this as its own second wrong attempt.
- **The cost is real and is written down rather than absorbed.** The journey drops from 58 steps to
  44, so the pool balance derived in section 5 of the game design document is out of date. Section 5
  carries a note saying so and pointing at issue #37. Nothing in the MVP depends on it, because the
  MVP runs on a single stand-in die.
- → Ch. 01, Ch. 04, Ch. 05

### 2026-08-30: The house holds one pawn per square and there is no separate home area

- **Chosen:** four house squares per player, `r = 41` to `44`, one pawn each. `REGION.HOME` was
  removed. A player wins when all four pawns are in the house, which can only mean one on each
  square.
- **Why:** it is how the printed board works, and it makes FR-05 fall out of a rule that already
  existed instead of needing one of its own. `isSameSquare` already reports a collision between two
  pawns of the same player inside a house, so FR-12 refuses the second arrival, and the four pawns
  are forced onto the four squares with no code written for it.
- **The design forced the question but did not answer it.** The delivered CSS has no `.home` element,
  so a separate home area had nowhere to render. The spec then contradicted itself, saying both "one
  field per pawn" and "the win condition becomes all four pawns at `r = 44`". Those cannot both be
  true, so it was put to the user rather than guessed.
- **Rejected: keeping a shared home area** that all four pawns occupy, which is what the committed
  `win.js`, `region()` and `isSameSquare` already implemented and would have changed no rule code.
  It needs a `.home` element the design does not have, and on an 11 × 11 grid the only free cell is
  the single centre square.
- **One earlier negative finding is overturned by this**, and the test that recorded it now records
  the reversal instead. On 2026-08-29 it was found that "every target square blocked by an own pawn"
  could never be a *turn-level* refusal reason, because `r` only counts upward so the leading pawn
  always has somewhere to go. That held only while home was a shared area no own pawn could block.
  With the four-square house the leader can sit on `r = 44`, report `ALREADY_HOME`, drop out of the
  vote, and leave the three behind it agreeing on `OWN_PAWN`.
- **A new negative finding replaces it.** `turnLevelReason`'s `blocked.length === 0` branch is now
  unreachable in any legal board state, because it needs all four pawns on `r = 44` at once and the
  house forbids that. It is kept as a guard rather than deleted, because removing it would make the
  function read `blocked[0]` of an empty array. It is the one uncovered line in `src/core/`.
- → Ch. 05, Ch. 08

### 2026-08-30: A player number is a seat number, so two players sit on seats 0 and 2

- **Chosen:** `core/board.js` gained `seatsFor(playerCount)`, returning `[0, 2]` for two players,
  `[0, 1, 2]` for three and `[0, 1, 2, 3]` for four. `createPawns` builds from that list, the state
  object stores `seats`, and `endTurn` rotates through it instead of counting upward.
- **Why:** D3 of the design spec seats two players opposite each other, and `board.css` implements it
  by draining seats 1 and 3 in a two-player match. The state layer numbered players 0 and 1, so a
  two-player game would have rendered pawns standing in a yard the CSS had greyed out. It is also the
  better rule on its own terms: on a 40-square track opposite seats are 20 squares apart and adjacent
  seats only 10, so seating two players side by side makes the board lopsided.
- **`player` is the seat and there is no second numbering.** The alternative was to keep players
  `0..n-1` in the rules and map player to seat in `ui/`. **Rejected**, and it is worth saying why it
  is not merely uglier: an entry square is a *rule*, `E(p) = 10p`, so if player 1 sits on seat 2 then
  their entry square is 20 and not 10. A view-only mapping would have had to relabel the whole board
  consistently, and the first thing to break would have been capture.
- **Also rejected: asking Claude Design to drain seats 2 and 3 instead**, which is one CSS block
  against four source files and a test sweep. It makes a two-player match use adjacent corners, which
  is the worse game, and it would have blocked the UI work on a second handoff round.
- **`findWinner` lost its `playerCount` argument** and now reads the seats off the pawn list. With
  seats 0 and 2, a loop from 0 to `playerCount - 1` checks seat 1, which nobody is in, and misses
  seat 2, which somebody is. Deriving it removes the way to be wrong instead of documenting it.
- **One test was found to have been passing vacuously.** `pawnsOf(pawns, 1)` for an empty seat
  returns `[]`, and `[].every(...)` is `true`, so the end-to-end match test asserted the opponent's
  pawns were all home while looking at a seat that had none. It now asserts the pawn count first.
- → Ch. 04, Ch. 05, Ch. 06

### 2026-08-30: Prettier pushed a delivered stylesheet over the 300-line limit, and it was split

- **Chosen:** the 40 track field grid placements were moved out of `board.css` into
  `board-track.css`, and the index-to-cell table moved with them.
- **Why:** `board.css` arrived at 248 lines and inside NFR-02. `npm run format` expanded every
  single-line rule such as `.square[data-square="0"] { grid-area: 5 / 1; }` into three lines and took
  the file to 407. Prettier has no option to keep a one-declaration rule on one line, so the choice
  was to split the file or to stop formatting the delivery.
- **This is the project's own toolchain breaking the project's own constraint**, which is the part
  worth carrying into the report. Two rules that are each individually sensible, "format everything"
  and "no file over 300 lines", disagree on a file that was compliant when it was written.
- **Rejected: adding `src/ui/styles/` to a Prettier ignore list.** One line, no split, and it makes
  the delivered CSS the only code in the repository nobody formats. The formatter would then be
  something the project applies where it happens to be convenient, which is worse than a split.
- **Rejected: splitting the square states out instead**, which is what section 1 of the spec had
  preferred. It separates `.square` from `.square[data-legal-target="true"]`, which is not a seam in
  any direction. The spec's objection to splitting the placements, that they must be read next to the
  geometry they implement, was answered by moving the geometry table into the new file rather than by
  overruling it.
- → Ch. 04, Ch. 07

### 2026-08-30: The pawn click is the only control, and the turn advances by itself

- **Chosen:** no dice hand, no turn bar, no win screen. Picking a die happens automatically and the
  turn hands over on a timer. The player clicks a pawn and nothing else.
- **Why:** handoff 01 designed the board and the refusal region, and `CLAUDE.md` forbids Claude Code
  from inventing what a component looks like. Building a turn bar would have meant deciding what a
  button looks like in this game, which is the line that rule draws. The question was put to the team
  rather than answered in code, and this is what came back.
- **Automatic is honest here rather than a shortcut**, because the stand-in dice pool holds exactly
  one card. There is no choice being hidden. Issue #37 brings the real three-card hand, and that is
  the line in `game-loop.js` that changes.
- **Rejected: a placeholder turn bar built only from existing tokens**, no new colour, size or font,
  every control marked as provisional and sent to handoff 02. It is the option that makes the game
  feel finished soonest. It still means Claude Code deciding what three components look like, and a
  placeholder that works is the hardest kind of placeholder to get replaced.
- **Rejected: stopping and asking Claude Design first.** It is the cleanest answer and it costs the
  playable slice, milestone M3, in a sprint with five weekdays left.
- **What it costs, said plainly.** The hot-seat handover is on a clock rather than on a click, so a
  player cannot take their time. The roll is not shown anywhere. And the win message has nowhere
  designed to go, so it borrows the refusal strip and comes out in warning orange.
- → Ch. 04

### 2026-08-30: The first click selects a pawn and the second commits it

- **Chosen:** two clicks per move. The first dispatches `select-pawn`, the second `commit-move`.
- **Why:** a capture costs the other player most of a lap and cannot be undone, so a misclick is
  expensive. It also makes FR-32 literal rather than approximate: with nothing selected every legal
  move is lit, which is the whole choice, and once a pawn is picked exactly one square stays lit, so
  the second click has one visible consequence.
- **Rejected: one click.** Half the clicks, and it makes `select-pawn` dead vocabulary in the intent
  boundary, so the `data-selected` state the design specified would never be reached either.
- **Rejected: hover to preview, click to commit.** It reads better and it is not an intent: hovering
  is not something the player asks the game to do, so it would have put a rule-adjacent decision in a
  jQuery handler.
- → Ch. 04

### 2026-08-30: Four attributes were added to the DOM contract for the tests, not for the design

- **Chosen:** `.board` carries `data-phase`, `data-status`, `data-turn` and `data-roll`. No
  stylesheet reads them.
- **Why:** an end-to-end test that waits a fixed number of milliseconds is either slow or flaky, and
  usually both in turn. Waiting for a state the application publishes is neither.
- **`data-turn` was added after a race rather than before one**, and that is the part worth keeping.
  The helpers first waited for the phase or the active seat to change. With the pauses collapsed for
  a test run, a turn nobody can move in passes itself inside one tick, so the board could go from
  `act` through two seats and back to `act` between two polls with both signals reading unchanged.
  A counter that only goes up cannot hide a turn that has already happened.
- **Rejected: exposing the state object on `window` and asserting against that.** It is less markup
  and it stops the test being an end-to-end test: it would assert what the rules computed, which the
  unit suite already covers, rather than what the browser rendered.
- **The line this does not cross:** naming an attribute is a technical interface, and the brief
  already established that. None of the four carries a colour, a size or a font, and no rule in
  `src/ui/styles/` matches any of them.
- → Ch. 04, Ch. 08

### 2026-08-30: One module in `ui/` is unit tested, against the stylesheet

- **Chosen:** `tests/unit/ui/board-geometry.test.js` exists, and it reads `board-track.css` and
  compares it to the JavaScript table index for index.
- **Why:** `vitest.config.js` says `ui/` is covered by Playwright instead, because a coverage figure
  for a rendering layer measures how much jQuery ran. `board-geometry.js` is not a rendering layer.
  It is a lookup table with no DOM, and it is the one place in `ui/` where a mistake is **silent**: a
  wrong cell does not throw and does not fail to render, it draws a pawn next to the square it should
  be standing on.
- **The table exists twice on purpose**, once for JavaScript and once for CSS, because CSS cannot
  compute a grid placement from an index and JavaScript cannot position an element without knowing
  one. The test is the price of that duplication, and it is cheaper than the duplication is.
- **Rejected: generating the CSS from the JavaScript table** at build time, which removes the
  duplication properly. It adds a build step, and it puts a generated file in `src/ui/styles/` where
  Claude Design writes by hand.
- → Ch. 04, Ch. 08

### 2026-08-30: `greyscale.spec.js` is written to fail, and marked as expected to fail

- **Chosen:** the NFR-12 test asserts a 1.30 minimum contrast ratio between every pair of seat
  colours in greyscale, currently measures 1.146 at worst, and carries `test.fail()`.
- **Why:** the requirement is not met and the suite must not go green over that. `test.fail()` makes
  Playwright report a known failure, and report an **unexpected pass** the day somebody widens the
  palette, which is the signal that is actually wanted.
- **The threshold is derived rather than picked.** Four values spread evenly in contrast-ratio terms
  across the range these hues already span, blue at 0.2543 to yellow at 0.6336 relative luminance,
  gives three equal steps of the cube root of 2.246, which is 1.31. So 1.30 is very nearly the best
  this palette can do without changing which colours it uses.
- **Rejected: setting the threshold where the palette passes.** It is one number and it turns the
  test into decoration. **Also rejected: deleting the test until the palette is fixed**, which loses
  the measurement and leaves NFR-12 with nothing but an opinion attached to it.
- → Ch. 04, Ch. 08

### 2026-08-30: The Dice Card Pool draws by random index and never shuffles

- **Chosen:** `core/dice-pool.js` holds the twenty cards in a closure. `draw(rng)` picks a uniformly
  random index out of what is left and swaps the last card into the gap; `returnHand` pushes the
  three cards back.
- **Why:** twenty such picks in a row *is* a Fisher-Yates shuffle, so the distribution is identical
  and there is one code path rather than two.
- **Rejected: a `shuffle(cards, rng)` function called on every `returnHand`.** It is a second source
  of randomness with its own tests, doing work no rule can observe, because the pool is face down.
  Nothing in the game can tell a shuffled pool from an unshuffled one that is drawn from at random.
- **This is the only module in `core/` that holds mutable state, and that is deliberate.** Which
  cards are on the table is the pool's own bookkeeping, not a rule; the part that belongs to the turn
  is already stored as `state.hand` by the turn manager. Keeping the twenty cards inside a closure
  means no other layer can reach in and take one. **Rejected: putting the remaining cards in the
  state object**, which would make every `nextState` copy a twenty-element array and would invite the
  view to count cards it is not supposed to see.
- **The seam held, and the measurement is two lines.** Swapping the stand-in for the real pool
  changed one default argument in `state/match.js` and one call in `src/main.js`. Nothing in
  `core/movement.js`, `state/turn-manager.js` or `state/intents.js` moved, which is what the
  2026-08-29 decisions about `roll === dieMax` and the injected RNG were for.
- → Ch. 05, Ch. 03

### 2026-08-30: The end-to-end seeds are generated by a committed script, not found by hand

- **Chosen:** `scripts/find-seeds.js`, run by `npm run test:seeds`, replays matches headlessly and
  prints the `SEEDS` block that `tests/e2e/helpers.js` pins.
- **Why now:** the twenty-card pool draws from the same injected generator the die rolls from, so
  wiring it in made **all five existing seeds worthless in one commit** and failed two specs. The
  original replay had been used once and thrown away, so re-deriving them meant redoing work nobody
  could see.
- **Why a script rather than a note saying which seeds to use:** it imports the shipped `startMatch`,
  `dispatch` and `createDicePool`, so its output is a fact about the code and not about a model of
  it. It also states its own policy, choosing `hand[0]` and clicking the lowest-numbered movable
  pawn, next to a warning that changing either invalidates the seeds.
- **Rejected: making the specs seed-independent by playing until a situation occurs.** `playUntil`
  already does that where it fits, and for "the first thing on screen is a refusal" it does not: the
  test would have to play an unknown number of turns to reach the state it wants to assert about the
  first turn.
- **A number that came out of it and is worth keeping:** 400 of 400 two-player matches finish inside
  600 turns. That is the evidence that `ui/game-loop.js` picking `hand[0]` for the player costs turns
  and does not deadlock the game.
- → Ch. 08, Ch. 07

### 2026-08-30: A fifth attribute, `data-die`, because a test could not otherwise state the rule

- **Chosen:** `.board` also carries `data-die`, the face count of the chosen card.
- **Why:** `pawn-leaves-start.spec.js` asserted `expect(roll).toBe(6)` for "the maximum was rolled".
  That was true only while the stand-in die was a D6. FR-09 is written as the die's maximum, and with
  seven denominations in play the view had no way to say which die that was, so the test could not
  express the rule it claimed to test. It now reads `expect(roll).toBe(die)`.
- **The general finding, which is the reusable part:** a test that hard-codes a value the rules
  derive passes for the wrong reason until the derivation changes. Two specs did, and neither was
  wrong when it was written.
- **Not extra work bought early:** the dice hand in issue #31 has to show the chosen die to the
  player anyway.
- → Ch. 04, Ch. 08

### 2026-08-30: ESLint ignores `01-Design/`

- **Chosen:** `01-Design/**` is in the ignore list in `eslint.config.js`.
- **Why:** Claude Design delivers a generated canvas runtime next to every `.dc.html` board,
  `support.js` and `_ds_bundle.js`, several thousand lines each and marked "do not edit" by the tool
  that wrote them. The card artwork handoff arrived with three of them and took `npm run lint` from
  clean to **306 errors, none in project code**.
- **Why the whole directory and not the file names:** every future handoff brings another copy under
  another folder name, so a list of names would go stale on the next delivery.
- **Why this is safe:** nothing under `01-Design/` is built or shipped. `01-Design/README.md` is
  explicit that the CSS lands in `src/ui/styles/` instead, which is linted normally.
- **Rejected: deleting the runtime files from the handoff.** They are what makes the delivered
  `.dc.html` boards openable, and the handoff is the record of what was asked for and what came back.
- **The point worth making in the report:** a lint run that reports on somebody else's generated code
  is a lint run people learn to ignore, and that is the failure mode being avoided here.
- → Ch. 07

### 2026-08-30: The dice balance is a script, and section 5.2 quotes it

- **Chosen:** `scripts/dice-balance.js`, run by `npm run docs:dice-balance`, derives the balance of
  the Dice Card Pool and measures it against real matches. Section 5.2 of the game design document
  carries its output and says not to edit the tables by hand.
- **Why now:** section 5.2 had been marked "out of date, knowingly left standing" since the track
  went from 52 squares to 40, because re-deriving it by hand was work nobody wanted to repeat. That
  is the same failure the seeds had a day later, and the same fix applies.
- **Why exact and not simulated:** the journey is solved backwards as a recurrence,
  `T(r) = n/m + (1/m)·Σ T(r+k)`, so the figures have no sampling error. A simulation would need
  millions of runs to separate a D8 at 16.3 turns from a D10 at 16.5.
- **Why a measurement as well:** the theory is for a lone pawn and a player has four. The two
  disagree by a lot, 23 turns per pawn against a measured 16, and the reason is the finding: a turn
  where the leading pawn is stuck waiting for an exact count is not wasted, because another pawn
  moves instead.
- **What the re-derivation actually changed:** one conclusion, not the composition. The cheapest die
  for crossing the track moved from D10 to **D8**, matching the shorter journey. D6 and D8 already
  have four copies each, so the pool was already weighted the way the arithmetic says.
- **The thing the old derivation never mentioned at all:** what FR-13 costs a large die. A D20 spends
  18.7 of its 22.8 travel turns unable to move, which is 82 %. Two formulas about `P(max)` and
  `E(roll)` cannot show that, because neither of them knows the house is four squares deep.
- **Rejected: adjusting the old numbers instead of re-deriving them.** Section 2.4 had already said
  re-derive rather than adjust, and this is why it was right: adjusting would have preserved the
  omission, since there was nothing in the old working to adjust the exact-count tax *into*.
- **A negative finding it produced:** one turn in three has no legal move at all, at every player
  count. Recorded in section 5.2.3 rather than smoothed over.
- → Ch. 05, Ch. 01

### 2026-08-31: Locale text splits by owner into `ui.json` and `cards.json`, and the merge refuses collisions

- **Chosen:** `locales/<code>/ui.json` for text the interface writes, `locales/<code>/cards.json` for
  text the card set writes. `src/i18n/index.js` merges the two per language into one i18next
  `translation` namespace at boot, through a `mergeNamespaces` helper that **throws** when both files
  define the same top-level key.
- **Why now, before the text exists:** 29 skill cards plus the dice denominations, each with a title
  and a rules sentence in two languages, is roughly four times as much card text as interface text.
  Doing the split as a rename today costs minutes; doing it once the text is in place is a merge
  conflict across a file nobody can review.
- **Why by owner and not by size:** the card wording is the part that changes during playtesting. With
  one file, a tweak to a single card's sentence produces a diff spanning the whole interface, so the
  reviewer cannot see what changed. The owner line also answers who edits which file later.
- **Rejected: i18next namespaces** (`t("cards:card.type.action")`), which is what the library itself
  offers for exactly this. It would mean editing every translation call in `core/`, `state/` and `ui/`
  to carry a prefix, and it buys nothing the merge does not already give. Keeping one namespace means
  the split is invisible to callers and no existing call site was touched.
- **Rejected: a plain `{ ...ui, ...cards }` spread.** It silently drops one side of a duplicate
  top-level key, and the symptom surfaces weeks later as a raw key such as `card.type.action` printed
  on screen with nothing pointing at the cause. A boot-time throw naming the key and the file is worth
  the twelve lines. Two unit tests cover it: the shipped files own disjoint top-level keys, and the
  throw happens.
- **The string that proves the split is not bookkeeping:** `card.dice.name` is `W{{faces}}` in German
  and `D{{faces}}` in English. W for Würfel, D for die. A dice card's name looked like a number the
  view could format itself, and it is not, because the letter in front of it is language.
- → Ch. 04

### 2026-08-31: The hand-written freeze list was replaced by a generic deep freeze, reversing an earlier decision

- **Chosen:** `src/state/freeze.js` with `deepFreeze` and `isDeeplyFrozen`, walking the whole state
  object. `game-state.js` calls it from `createGameState` and `nextState` and names no field.
- **This reverses the decision recorded in `game-state.js` on 2026-08-29**, which chose a
  field-by-field freeze precisely so that no general recursion and no cycle guard would be needed. That
  reasoning was sound for a seven-field state of known shape. It is recorded here rather than quietly
  overwritten, because the interesting part is what changed the answer.
- **What changed it:** the skill cards add nine fields, two of them nested two levels deep
  (`skillHands` is an object keyed by seat holding an array per seat). The deciding argument is not
  that the list got longer, it is the failure mode. A freeze list must be edited whenever a field is
  added, and a forgotten line leaves one array writable inside an apparently frozen state, with no
  symptom at all. Freezing exists to turn "`ui/` never mutates state" into a thrown error, and a list
  with a hole in it surrenders that silently.
- **The old objection cost four lines to answer:** a `WeakSet` of objects already visited in this call.
  It guards against cycles the state cannot have, and doubles as a guard against walking a shared
  subtree twice.
- **Rejected: skipping any subtree that is already frozen.** It is the obvious speed-up, since an
  unchanged array carries the same frozen reference from one state to the next. It is only sound while
  every frozen object in the project is deeply frozen, and one shallow `Object.freeze` in `core/` over
  an object with a mutable child would make the shortcut skip that child forever and in silence. What
  it saves is a walk over a few dozen numbers a handful of times per turn.
- **Rejected: freezing `Map`, `Date`, class instances and functions too.** `Object.freeze` on a `Map`
  does not stop `map.set`, so it would look like protection without being one. Only plain objects and
  arrays are touched. Nothing else belongs in the state, and leaving those alone keeps the code honest
  about what it does.
- **Rejected: a library such as `deep-freeze` or Immer.** A new runtime dependency needs the user's
  approval per `CLAUDE.md`, and this is nine lines of code. Immer would also change how every
  transition is written, for a state object that is copied a few times per turn.
- → Ch. 06, Ch. 08

### 2026-08-31: A skill square triggers on landing only, and not on being crossed

- **Chosen:** only the square a pawn **finishes** its move on hands out a card. Passing over one does
  nothing.
- **Why:** the dice pool is the reason, not simplicity. If crossing counted, a D20 would collect several
  skill squares in one move and a D2 almost none, so the answer to "which of these three cards should I
  take" would always be "the biggest one". FR-19's choice is the centre of the whole dice pool design,
  and this rule is what keeps it a choice.
- **Rejected: crossing counts too.** It is the more generous reading and it is what "reaching a skill
  field" could be taken to mean. It was rejected on the balance argument above, and secondarily because
  capture already only looks at the target square, so landing-only means a player learns one rule instead
  of two.
- **Falls out for free:** a captured pawn cannot trigger a skill square, because it goes back to its
  start area and a start area is not a track square. Nothing had to be written for that.
- → Ch. 05

### 2026-08-31: The skill square layout is generated from two offsets, not written out

- **Chosen:** `entry + 4` and `entry + 7` per player quarter, which produces 4, 7, 14, 17, 24, 27, 34
  and 37. Built in code from the offsets.
- **Why generated:** it makes the symmetry a property of the code rather than a claim in a comment, and
  it lets a test assert what the symmetry is *for*: every player meets a skill square at the same points
  of their own journey, relative positions 5, 8, 15, 18, 25, 28, 35 and 38.
- **Why symmetry at all:** FR-04 fixes turn order at the start of the match and nothing compensates for
  going first. A board that also gave one seat an earlier first card would stack a second advantage on
  top, and no rule in the game balances it.
- **Rejected: hand-picked interesting positions**, for example clustering squares near the house
  entrances. It would make the board more interesting and it would make one seat's cluster arrive
  earlier in turn order than another's. Not worth it before there is any playtesting to justify it.
- **The offsets themselves are not derived and the note says so.** What can be defended: 4 is far enough
  from the entry square that a pawn cannot reach a skill square straight out of the start area even with
  a D2, and 4 and 7 are far enough apart that one move rarely covers both. Both are tests. The rest is a
  playtesting question.
- → Ch. 05

### 2026-08-31: A used skill square respawns randomly, and three kinds of square are excluded

- **Chosen:** the used square disappears and reappears on a random other track square. Excluded are the
  four entry squares, the seven squares the other skill squares are on, and the square just used. 28
  candidates remain.
- **Why the entry squares:** not fairness in the abstract. The entry square is the busiest square a
  player owns, since every one of their pawns starts on it and every one passes over it. A skill square
  there would pay out far more often than one anywhere else, and always to the same player.
- **Why not the square just used:** having it reappear under the pawn that just used it would read as
  nothing having happened, and a player would have no way to tell that from a bug.
- **Houses needed no rule.** A house is not a track square, so an absolute square index never refers to
  one. The exclusion list is shorter than it looks because the topology already did the work.
- **Rejected: static skill squares**, which is what the game design document had. The user asked for the
  respawn on 2026-08-30, and the reason it is better is that eight fixed squares get farmed: players
  learn the eight positions and steer for them all match.
- **Rejected: a fixed rotation instead of a random square.** It would be reproducible without needing
  the injected `rng`, which is a real advantage for tests. It also makes the next position predictable
  after one match, which is the farming problem again in slower form.
- → Ch. 05

### 2026-08-31: The board's skill squares can be pinned when a match is created

- **Chosen:** `createGameState(playerCount, skillSquares = INITIAL_SKILL_SQUARES)`, forwarded by
  `startMatch`. No production caller passes it.
- **Why:** `deps.rng` is now drawn from twice per turn, once for the roll and once for a possible
  respawn. The exact-final-state unit test scripts 66 rolls as a list, and from the first pawn that
  landed on a skill square it silently played a different match. Handing in an empty list says "this
  test is about movement and turn order".
- **Rejected: interleaving dummy respawn draws into the roll script.** It keeps production code
  untouched, which is the honest argument for it. It also makes a test about movement depend on the exact
  skill square rule it is not testing, and it would break again on the next rule that spends randomness.
- **Rejected: a second `rng` in `deps`, one for rolls and one for board events.** It would separate the
  two cleanly and it would mean one seed no longer reproduces a whole match, which is the property
  NFR-09 is actually for.
- **The second caller is the one that justifies it long term:** a Playwright spec needs a skill square
  where its pawn will actually go, and a random layout cannot promise that.
- **A restart resets the layout** rather than carrying it over. A restart is a fresh match, and keeping
  the arrangement the previous match had wandered into would start the next one from a position nobody
  chose.
- → Ch. 06

### 2026-08-31: The win spec reads the winner off the board instead of naming a seat

- **Chosen:** the board carries `data-winner`, and `win.spec.js` asserts that the winner's four pawns
  fill the four house squares and that the message names that seat.
- **Why:** the spec used to assert the literal text "Spieler 3 hat gewonnen", because seed 200 happened
  to be won by seat 2. Which seat wins is a property of the seed and not of any rule. The seeds were
  regenerated twice in one week, and both times that spec failed for a reason unrelated to what it
  tests, and both times it was repaired by copying a new seat number into it.
- **Rejected: pinning the seed harder**, for example by searching only for seeds that seat 0 wins. It
  narrows the search for no gain, and the spec would still be asserting an accident.
- **The general form, and it is the second instance:** when a spec has to hard-code a value the seed
  decides rather than a rule, the view is missing an attribute. `data-die` was added for exactly this
  reason for issue #30.
- → Ch. 04, Ch. 08

### 2026-08-31: The card catalogue is data and holds no effects

- **Chosen:** a catalogue entry says what a card is (`type`, `category`, `kind`), when it may be played
  (`triggers`) and what the player must point at (`targets`). What the card *does* is a separate function
  looked up by the same id, arriving with the commit that implements it.
- **Why:** FR-26 requires exactly this, that effect and artwork are matched by id and neither imports the
  other. The practical payoff is that a view can render a card whose effect does not exist yet, and the
  whole catalogue is testable without loading a single effect.
- **Rejected: an effect function on each catalogue entry.** It is the obvious shape and it reads well.
  It also means the catalogue cannot be loaded without loading every effect, so the card view would pull
  the entire rules engine into the render path, and a test of the catalogue would be a test of 29 rules.
- → Ch. 05

### 2026-08-31: The catalogue validates itself when it loads, not only in a test

- **Chosen:** `assertCatalogue` runs at import time and throws with the card id in the message.
- **Why:** hand transcription from an artboard produces quiet mistakes. A duplicated id, a typo in a
  category, a Reaction card whose trigger is the action phase: none of them throws, and all of them
  become a card that cannot be played or cannot be labelled, discovered weeks later. One of the checks is
  a genuine rule rather than spelling, that FR-23 and FR-24 restrict which triggers each type may carry.
- **Rejected: leaving it to the unit tests**, which do also cover it. The person adding card 30 is not
  necessarily running the tests first, and a boot-time throw naming the card reaches them in the browser.
  The two are not redundant, they catch the same class at different moments.
- → Ch. 05, Ch. 08

### 2026-08-31: Ten cards keep `category: null` rather than being given an invented one

- **Chosen:** the four categories are stored only for the 19 cards of artboard `4a`, which is where the
  artwork prints them. The ten cards of artboard `6a` get `null`.
- **Why:** that artboard labels its cards by type and a sub-kind instead of by category. Reconciling the
  two labelling schemes into one card component is **open decision D28 of design handoff 03**, and
  `CLAUDE.md` forbids this side from inventing a design rule. A category invented here would be an answer
  to D28 hidden in a data file.
- **Rejected: mapping each sub-kind onto one of the four categories.** It would give every card a
  category and make the view simple. It is also the design decision, taken quietly, in the wrong place.
- **The sub-kind is stored for all 29 as `kind`, and no code reads it.** Stored because the catalogue is
  the machine-readable transcription of a generated HTML artboard nobody is going to open again, and
  being lossy against that source is the worse failure. Some values are odd and they are the artwork's
  own: `ACTION` and `REACTION` repeat `type`, `D4` and `D6` name a die. Transcribed as they are, because
  tidying them would be a decision hidden inside a transcription.
- → Ch. 05

### 2026-08-31: The skill pool is pure functions over state, and the dice pool is a closure

- **Chosen:** two pools in the same game, built in two different shapes. `core/dice-pool.js` holds its
  remaining cards in a closure; `core/skill-pool.js` is pure functions over arrays that live in the
  frozen game state.
- **Why, and the reason is lifetime, not taste.** A dice hand exists for one turn: all three cards go
  back at the end of it (FR-21), there is no discard pile, and nothing survives into the next turn, so
  nobody outside that turn ever needs to see it. A skill card sits in a hand for as long as its owner
  keeps it, so the pool, the four hands and the discard pile are all things the view must show, a saved
  match must write down, and a replay must reproduce. That makes them state.
- **Rejected: making the dice pool pure too, for consistency.** Consistency is a real argument and it
  lost to this one: a closure that nothing outside a turn can observe is genuinely simpler, and moving it
  into state would add three fields nothing reads.
- **Rejected: making the skill pool a closure like the dice pool.** It would hide the pool from the view
  and from any future save, and it would put mutable state in `core/`, which is exactly what the frozen
  state object exists to prevent.
- **The pool holds ids, not card objects.** Two copies of Angel Die are indistinguishable to every rule,
  so two references to the same frozen object would be the same string stored twice with extra steps. It
  also keeps the state JSON-shaped.
- → Ch. 05

### 2026-08-31: A full hand draws nothing, and the card stays in the pool

- **Chosen:** a draw for a player already at the hand limit does nothing at all. No card leaves the pool.
- **Why:** the alternative loses a card for no reason. A pool measurably thinner after a long match is a
  slow change to the game's balance that nobody chose and nobody would notice happening.
- **Rejected: draw it and discard it immediately**, which is what several card games do and which keeps
  the draw step uniform. It burns a card for nothing, and since the discard pile is reshuffled into the
  pool it does not even remove the card permanently, so the only effect is churn.
- **Rejected: forcing the player to discard one and keep the new card.** It is the most interesting rule
  of the three, and it needs a prompt, a decision and a screen in the middle of somebody else's turn. Not
  worth it before the hand limit itself has been playtested.
- → Ch. 05

### 2026-08-31: The 29 card names are the same in both languages, and the rules sentences are not written yet

- **Chosen:** `cards.json` holds `card.skill.<id>.title` for all 29 cards, identical text in German and
  English. The rules sentence of each card lands with the commit that implements its effect.
- **Why the names are not translated:** they are jokes and memes. "Aight Imma Head Out", "FR FR", "67",
  "Speedrun Any%". A German rendering would be worse German than the English the players say out loud,
  and `Nühü` is already German.
- **Rejected: translating the nine or ten names that would survive it.** A hand holding half-translated
  card names reads worse than either extreme.
- **Why the sentences wait:** a rules sentence is a description of an effect, and no effect exists. 29
  sentences written now would have to be checked against code that does not exist, and then checked again
  when it does. The name is stable and does not depend on any of that.
- **The keys exist in both files anyway**, which is what NFR-03's test requires, and which makes
  translating one later a locale edit rather than a code change.
- **Recorded as outstanding coverage** rather than as finished work, in Ch. 04 and Ch. 08.
- → Ch. 04, Ch. 08

### 2026-08-31: The eight invented skill cards were deleted rather than kept alongside the 29

- **Chosen:** section 7 of the game design document is replaced. `action-reroll`, `reaction-shield` and
  the other six are gone from the rulebook and were never implemented.
- **Why:** none of the eight existed as artwork. Keeping them would have meant eight cards nobody had
  drawn sitting in the same pool as 29 that had been, so either somebody draws eight more cards or the
  set is visibly inconsistent.
- **Rejected: keeping the eight as a smaller MVP set and treating the 29 as FR-29's expansion.** It is
  the schedule-safe answer and it is what the effort estimate assumed. It lost because the Product Owner
  chose the artwork set explicitly, and because the eight were invented in a document rather than
  designed.
- **The argument the old section made is still unanswered, and it is quoted rather than deleted.** It
  said the set was sized to what can be finished and tested. 29 cards is 29 rules, 29 unit tests and 29
  presentations against 8. The mitigation is the split into the ten cards that need no new board concept
  and the nineteen that need five new mechanics, so that work can stop at a sensible point. Whether it
  has to stop is a schedule decision and belongs in the sprint log.
- → Ch. 05, Ch. 01

### 2026-08-31: One card component takes a description, and never resolves its own text

- **Chosen:** `ui/card-view.js` renders any card from a plain object whose strings are already
  translated. It calls no `t()` and knows no card id.
- **Why:** the locale key layout differs per family. A dice card's name is `card.dice.name` with a
  `faces` placeholder; a skill card's is `card.skill.<id>.title`. A component that resolved its own
  text would have to learn a new key shape every time a family is added, and the two hands would then
  be the only callers who knew which shape applied.
- **Rejected: pass the card id and let the card look everything up.** It is fewer arguments and it
  reads more naturally. It also puts a `switch` on card family inside the component that exists
  precisely so there is only one component.
- **Consequence worth stating:** the same file will render the 29 skill cards with no change at all,
  which is what makes decision D28 a single component rather than a shared stylesheet.
- → Ch. 04

### 2026-08-31: Picking a dice card takes one click, and moving a pawn still takes two

- **Chosen:** one activation picks a dice card. A pawn keeps its select-then-commit pair.
- **Why:** the two clicks on a pawn exist because a misclick captures an opponent with no way back, and
  a capture costs that player most of a lap. Picking a dice card costs nobody anything, is visible
  before it matters, and is undone by the next turn. A confirmation step there charges a click for no
  risk.
- **Rejected: two clicks on a card as well, for consistency.** Consistency between two controls is
  worth something, and it lost to the fact that the reason for the first one does not exist for the
  second.
- → Ch. 04

### 2026-08-31: A dice card carries two tags, and neither of them is advice

- **Chosen:** every dice card shows its range and the number it needs to leave the start area. Nothing
  says which card is the better pick.
- **Why:** the whole point of the pool is a decision, and the decision is that a small die gets a pawn
  out of the yard while a large one moves it (FR-09 needs the die's maximum). That is not obvious from
  `W2` and `W20` alone, and a player should not have to hold it in their head. Both tags are facts
  printed from the card's own denomination.
- **Rejected: marking a recommended card**, which would help a new player and would also be a second
  player living in the view. `ui/` holds no rules and it holds no judgement either.
- **Rejected: no tags at all**, on the grounds that the title says the denomination. It does, and it
  does not say what the denomination is for.
- → Ch. 04

### 2026-08-31: `data-active` on a hand means "this plate is asking for a decision"

- **Chosen:** the dice hand carries `data-active="true"` only during the `choose` phase.
- **Why:** the DOM contract in the brief describes the attribute as "whether this hand belongs to the
  player whose turn it is". In hot-seat there is one shared dice hand, always the active player's, so
  read literally the attribute would be permanently true and the ink ring `app.css` draws around the
  plate would never mean anything. The stylesheet's own comment says what it is for: "the plate that is
  asking for a decision". That is the reading implemented.
- **Rejected: literal compliance**, one hand always active, and no ring anywhere. It satisfies the
  wording and throws away the design.
- **This is a contract wording problem and it goes into the next brief**, rather than being settled
  quietly on this side: the attribute needs a name or a definition that fits a single shared hand.
- → Ch. 04

### 2026-08-31: `body { margin: 0 }` was put back into a delivered stylesheet by hand

- **Chosen:** `src/ui/styles/app.css` gained a two-line `body` rule that the delivery did not have.
- **Why:** the placeholder `app.css` it replaced carried it. Without it the browser's own 8 px default
  returns, every page is exactly `100vh + 16px`, and FR-31's "no scrolling" fails by 16 px at the one
  resolution the requirement is about. Spec 03's own arithmetic assumes the margin is gone.
- **Why this does not break the rule that Claude Code invents no design.** No colour, size, spacing,
  font or component look is chosen here. A browser default is removed, which is the opposite of adding
  a design value, and it restores a rule the project already had.
- **Rejected: sending it back to Claude Design.** It is the correct process and it would have blocked
  a finished feature on a two-line reset. It is recorded as delivery feedback for handoff 04 instead,
  which is where the pattern belongs: this is the second delivery that dropped something the file it
  replaced was carrying.
- **Rejected: changing the padding or `--board-size` to buy the 16 px.** That would have been inventing
  a design value, and it would have hidden the cause.
- → Ch. 04

### 2026-08-31: The end-to-end helper picks slot 0 because the seed script does

- **Chosen:** `chooseDiceCard` always clicks the card in slot 0.
- **Why:** `scripts/find-seeds.js` replays matches with `hand[0]`, and slot 0 renders `hand[0]`. The two
  policies being the same one written twice is what makes every pinned seed survive this change. Picking
  the middle card, or the largest die, would have invalidated all five seeds for a third time in a week.
- **Rejected: picking a card by some rule**, such as the highest denomination, which would make the
  matches more interesting to watch. It would also require the replay script to implement the same rule
  and stay in step with it forever.
- **The one spec that deliberately breaks the policy is the one that has to.** `dice-hand.spec.js`
  clicks slot **1** when it checks that the chosen card is the card that gets rolled, because clicking
  slot 0 would pass even if the click were ignored and the old automatic `hand[0]` were still in place.
  A test of a choice has to pick something other than the default.
- → Ch. 08

### 2026-08-31: `playUntil` asks its question once per step, not once per turn

- **Chosen:** the end-to-end loop checks its predicate after a dice card is chosen and before a pawn
  moves, rather than once per turn.
- **Why:** that is the only moment in a turn where the roll is known and the board has not changed yet.
  A caller asking "is this the situation I was waiting for" needs both to be true, and every spec that
  waits for a particular kind of move needs exactly that moment.
- **Rejected: keeping one check per turn and having `playTurn` report what it did.** It moves the
  question from the caller to the helper and makes the helper decide what is interesting.
- **Cost:** the loop's cap now counts steps rather than turns, so a match may use two per turn. Said
  plainly in the parameter name and in the error message rather than left for a reader to work out.
- → Ch. 08

### 2026-08-31: Leaving the start area became "the maximum or better", not "exactly the maximum"

- **Chosen:** FR-09's rule in `core/move-rules.js` is now `roll >= dieMax`.
- **Why:** Angel Die adds a D8 to the roll. Under `roll === dieMax` a pawn in the yard with a buffed
  roll would have been **less** able to leave than an unbuffed one, so a card whose whole purpose is to
  help would have been a trap. The same applies to Speedrun's multiplier.
- **Why it is safe for everything already built:** without a card modifier a roll can never exceed the
  die's maximum, so the two wordings are identical for every match played before this change. That is
  not an argument, it is a test result: the movement tests written for issue #28 pass untouched.
- **Rejected: leaving the rule alone and clamping the roll to `dieMax`.** It keeps FR-09 literal and it
  throws away the whole point of a buff, which is to move further.
- **Rejected: a special case saying a buffed roll also leaves the yard.** Two rules where one will do,
  and the second one only exists to undo the first.
- → Ch. 05

### 2026-08-31: A roll of zero is an outcome, not an invalid input

- **Chosen:** `evaluateTurn` accepts a roll of 0 and answers with one turn-level reason,
  `move.refused.no-steps`.
- **Why:** Devil Die subtracts a D8, and on a D6 that goes below one more often than not. The old input
  check threw a `RangeError` for anything outside 1 to `dieMax`, which would have turned one card into
  a crash rather than into a bad turn.
- **Why it is turn-level and not per pawn.** Asking each of four pawns produces four copies of the same
  sentence and buries the one fact that matters. Zero distance is a property of the roll, and the
  refusal list stays empty so no pawn is described as blocked by something.
- **Rejected: a floor of 1 instead of 0**, so that a bad roll always moves one square. It reads as
  kinder and it makes Devil Die nearly worthless, because one square forward is what most turns want
  anyway.
- → Ch. 05

### 2026-08-31: Built Different protects rather than absorbing

- **Chosen:** a pawn with the armoured status cannot be **landed on** at all, for a duration. The move
  is refused with `move.refused.protected`.
- **Why:** the artwork reads "survives one capture". Taken literally, the capture is cancelled and the
  mover still arrives, which puts two pawns on one square and breaks the board's most basic invariant.
  Every honest reading has to answer "so where does the mover end up", and "it does not move" is the
  same as refusing the move.
- **Rejected: the mover stops one square short.** It keeps the capture attempt meaningful and it invents
  a movement rule that exists nowhere else in the game, for one card.
- **Rejected: the capture happens and the shield sends the mover home instead.** That is a different
  card, and a much stronger one.
- **What was lost:** the "once" in the card text. A duration replaced it, because a status that is spent
  by an event nobody can see would leave a player unable to tell a protected pawn from an unprotected
  one.
- → Ch. 05

### 2026-08-31: `movement.js` was split by argument count, not by line count

- **Chosen:** everything that takes **one** pawn moved to `core/move-rules.js`. Everything that takes a
  player's four stayed in `core/movement.js`, along with the public API and `applyMove`.
- **Why:** the file was at 207 of 300 lines and blockers plus backward moves would have burst it, so a
  split was coming either way. Choosing the seam by what the functions take rather than by where 300
  lines fell means the two halves have a describable difference, and `REFUSAL` lives with the rules that
  produce it.
- **Rejected: splitting off the refusal reasons and the constants.** It gets under the limit with the
  smallest diff and leaves two files neither of which can be described in a sentence.
- **The re-export is deliberate.** `movement.js` still exports `MOVE_KIND`, `REFUSAL` and `EMPTY_BOARD`,
  so no existing import changed. A refactor that also touches thirty call sites is a refactor whose
  diff nobody can read.
- → Ch. 05

### 2026-08-31: Advantage and disadvantage cancel out

- **Chosen:** both modifiers on the same roll means one ordinary roll.
- **Why:** every other resolution needs a written rule about which card was played first, and the game
  has no concept of card order. Cancelling needs no such rule, and it is what a player would guess.
- **Rejected: advantage wins**, on the grounds that the Action card is played before the Reaction. It
  makes Critical Failure unplayable against Critical Success, which is exactly the matchup the two cards
  are for.
- **Rejected: roll twice and take the second.** Arbitrary, and it hides a rule inside an implementation
  detail.
- **The test asserts the saving, not just the answer.** The scripted RNG is given exactly one number, so
  a second roll would fail the test with "scripted RNG exhausted" rather than passing quietly.
- → Ch. 05

### 2026-08-31: Turn start stayed a step and did not become a phase

- **Chosen:** the skill card of the turn's opening is drawn inside `drawHand`, which already covered
  "turn start and draw" as one step. There is no `turn-start` phase.
- **Why:** a phase name says **what the game is waiting for**, which is what the view needs to know. A
  turn-start phase would be waiting for nobody, so the view would have to skip it the instant it saw it.
  A phase that exists only to be skipped is a phase that will be forgotten in one of the places that has
  to skip it.
- **Rejected: the plan's own sketch**, which had `turn-start` as a phase before `draw`. It reads tidily
  as a table and it adds a state nobody can act in.
- **What is deferred with it:** if a card ever has to be played *at* turn start, before the dice hand is
  seen, this becomes a phase after all. No card in the 29 does.
- → Ch. 06

### 2026-08-31: `roll` became a real phase and the roll got its own intent

- **Chosen:** `skip-action` moves the turn to `roll`, and a separate `roll-die` intent does the rolling.
- **Why:** two things need exactly that moment. The roll animation has to hang off something, and the
  on-roll reaction window (Critical Failure, Devil Die, Hold Pawn) opens there. Folding the roll into
  `skip-action` would mean reopening it for both.
- **Rejected: rolling as part of passing on the action phase.** One intent fewer, and it hides the
  moment three of the ten cards of artboard `6a` are played into.
- **Cost, stated plainly:** the view now walks through two phases nobody can act in yet, `action` and
  `roll`. It does that in one tick and the player sees nothing. When the skill hand becomes playable
  (issue #34), `action` stops being automatic and nothing else moves.
- → Ch. 06

### 2026-08-31: The rejection reasons live in a file that imports nothing

- **Chosen:** `state/rejections.js` holds `REJECTED`, `accept` and `reject`, and has no imports at all.
- **Why:** `intents.js` and the card intents both need all three, and `intents.js` falls through *into*
  the card intents. Putting the shared three in either file would be a circular import. A file with no
  imports cannot be in a cycle.
- **Rejected: duplicating the two helpers in both files.** Four lines each, and then two lists of
  rejection reasons that drift.
- → Ch. 06

### 2026-08-31: Anything that spends the RNG at match start needs a test-side off switch

- **Chosen:** `startMatch(playerCount, deps, skillSquares, skillPool)`. Passing `[]` for the pool starts
  a match with no skill cards in it.
- **Why:** shuffling 58 cards spends **57 draws** from the injected RNG before the first die is thrown,
  and drawing a card at the start of every turn spends one more. Every unit test that scripts an exact
  sequence of rolls was exhausted instantly. The same argument already justified the `skillSquares`
  parameter one commit earlier, so this is the second instance of one pattern rather than a new
  workaround.
- **Rejected: dropping the initial shuffle**, on the grounds that `drawSkillCard` picks a random index
  rather than the top card, so the pool's order carries no information and the shuffle is redundant. It
  is redundant, and removing it would make a pool that anybody who has seen the catalogue can count.
- **Rejected: padding the scripted RNG sequences with 57 leading values.** It works and it makes every
  affected test unreadable, and it breaks again the day the pool size changes.
- **Both defaults are the real thing**, so no production caller passes either and a real match cannot
  start with an accidentally empty pool.
- → Ch. 06, Ch. 08

### 2026-08-31: Nothing in a reaction window resolves until the window shuts

- **Chosen:** a card played into a window leaves its player's hand at once and its **rule does not run**
  until the window closes. Then the played cards resolve in the order they were played, and the card that
  opened the window resolves last.
- **Why:** nothing in this design can be undone. `pawns`, `statuses` and `traps` are each replaced
  wholesale by a patch, so "cancel that card" cannot mean reversing an effect that has already run.
  Because nothing has run, cancelling is simply not running it, and Nühü needs no machinery at all.
- **A second thing falls out of it for free:** the resolution order needs no rule about which card was
  played first. The opening card is last because it is the thing being answered.
- **Rejected: resolving each card as it is played, and giving every effect an inverse.** Fourteen of the
  29 cards would need one, several of them are not invertible at all (a card that draws from a shuffled
  pool cannot put the pool back), and every future card would owe one.
- **Rejected: resolving as played and forbidding cancellation.** Simpler, and it deletes Nühü, which the
  Product Owner chose along with the other 28.
- **Cost, stated plainly:** a player who plays a Reaction does not see it take effect immediately. The
  countdown is on screen while they wait, which is what makes that legible rather than confusing.
- → Ch. 06

### 2026-08-31: A reaction window is a field, not a phase

- **Chosen:** `state.reactionWindow` is a field, and `dispatch` refuses every intent except the three
  window ones while it is set.
- **Why:** a window opens at three different moments, in three different phases, and the phase does not
  change while it is open. Expressing it as phases would need `waiting-inside-action`,
  `waiting-inside-roll` and the existing `reaction`, tripling the state machine to say one thing.
- **The guard is not a nicety, it prevents a deadlock.** `roll-die` opens an on-roll window, so
  dispatching it again while one is open would open a second window and the turn would never reach the
  roll. One line in `dispatch` catches that and every case like it, instead of one guard per handler that
  has to be remembered when a fourth trigger is added.
- **Rejected: a phase per window.** Three more phases, and `ui/` would have to learn all of them to know
  that a countdown is on screen.
- → Ch. 06

### 2026-08-31: A window that nobody could use does not open

- **Chosen:** `openWindow` returns `null` unless some other seat has an unspent card budget **and** holds
  a Reaction whose triggers include this exact moment **and** that card has a rule implemented.
- **Why:** an ordinary turn in this game is two clicks. A window that opened on every roll would put a
  thirty-second countdown in front of all of them, and would show a prompt to players with nothing to
  press. The same argument makes the on-capture window open only for a move that actually captures.
- **Rejected: always opening and letting the view hide an empty prompt.** The rules would then depend on
  the view choosing to skip something, which is exactly the direction the layering forbids.
- **What it costs:** the eligibility check reads every seat's hand and the catalogue, on every roll. That
  is at most twenty card lookups in a turn-based game, so it is not a performance question.
- → Ch. 06

### 2026-08-31: One `play-card` intent for both kinds of card play

- **Chosen:** `play-card` covers an Action card in the action phase and a Reaction in an open window, told
  apart by whether a window is open.
- **Why:** a click on a card in a hand is one gesture. The player is not choosing which kind of card play
  they are performing, and the view should not have to decide either. The test is unambiguous: a window
  is only ever open when somebody is being asked to answer, and an Action card cannot be played into one.
- **Rejected: `play-action` and `play-reaction`.** It reads more explicitly in `intents-cards.js` and
  pushes the same distinction into `ui/`, which would then hold a rule about when each is allowed.
- → Ch. 06

### 2026-08-31: The order the card checks run in is chosen for the message, not for the code

- **Chosen:** whose turn it is, then whether you hold the card, then whether the card fits the moment,
  then the budget, then the target.
- **Why:** more than one thing is often wrong at once, and the player sees only the first reason. Telling
  somebody "that card needs a target" when it was not even their turn is true and useless. The order runs
  from the most fundamental refusal to the most recoverable one.
- **Rejected: cheapest check first**, which would put the budget before the ownership check. Faster by an
  amount nobody can measure, and worse to read.
- → Ch. 06

### 2026-08-31: A card effect takes a flat snapshot and returns a flat patch

- **Chosen:** `core/cards/context.js` defines a snapshot and a patch, and `state/skill-play.js` is the
  only module that translates between them and the state object.
- **Why:** NFR-01 forbids `core/` from knowing the state object's shape. The payoff is the tests: every
  card effect is checked with three or four literals. Against the state object each of the 29 would need
  a started match, a chosen die and a scripted RNG, and the tests would be about the builder.
- **A patch that names an unknown field throws.** `{ status: [...] }` for `{ statuses: [...] }` is
  otherwise silently ignored, the card does nothing, and nothing fails. That is the quietest possible bug
  in a table-driven system.
- **Rejected: effects taking and returning the state object.** Fewer moving parts, and it makes `core/`
  depend on `state/`, which is the one dependency direction the whole architecture is built to forbid.
- **Rejected: effects mutating a draft object.** Convenient, and it would break the frozen state
  guarantee that makes `ui/` unable to corrupt the board.
- → Ch. 05, Ch. 06

### 2026-08-31: The target check lives in one place, not in 29 effects

- **Chosen:** `checkTarget` validates what a card's `targets` list asks for, before the effect runs, so
  every effect may read `context.target.pawn` unguarded.
- **Why:** 29 guards is 29 chances to write the same rule differently. It also lets the two refusals be
  told apart properly: "you have not picked a pawn yet" is a prompt and "that pawn is not yours" is a
  mistake, and the player needs to know which.
- **Rejected: each effect validating its own target.** Every effect gains three lines that say the same
  thing, and the view has no single question to ask about what a card still needs.
- **The one thing the catalogue could not express is a table instead.** 67 needs a die with at least six
  faces, which is a playability rule and not a target, so it is one line in `skill-play.js`.
- → Ch. 05

### 2026-08-31: A pushback stops at the entry square and never reaches the start area

- **Chosen:** `displace` in `core/displacement.js` clamps backward movement at `r = 1`.
- **Why:** three cards push a pawn back. If any of them could reach `r = 0` they would all be cheap
  substitutes for a capture, and capture is the mechanic the entire game is built around: a captured pawn
  loses most of a lap and that is what makes the whole board tense. Stopping at the entry square keeps a
  pushback a setback.
- **Rejected: letting a pushback reach the start area.** It is the literal reading of "push back six" and
  it makes Yeet strictly better than landing a capture, because it needs no exact count and no lucky roll.
- **The cards that are meant to send a pawn home call a different function.** `sendHome` exists so that
  "this card sends the pawn home" is visible at the call site rather than being a consequence of a large
  enough number.
- → Ch. 05

### 2026-08-31: A trap fires on crossing, a skill square only on landing

- **Chosen:** the two behave in opposite ways, and both are deliberate.
- **Why:** a trap that needed an exact landing would almost never fire, because a D20 crosses twenty
  squares and lands on one. A skill square that fired on crossing would be farmable by always taking the
  biggest die, which undoes the entire point of the dice card pool. Said plainly: a reward you can farm
  is broken, and a punishment you can jump over is not a punishment.
- **Rejected: one rule for both**, in either direction. Consistency between the two is worth something
  and it loses to each of them being right.
- **Cost:** `core/path.js` exists only for the trap half, and it is the one place in the project that
  looks at the whole walk rather than at the destination. Every ordinary move still ignores it.
- → Ch. 05

### 2026-08-31: The order inside `resolveMove` is a rule, and the tests put it under pressure

- **Chosen:** the pawn arrives, then a trap fires, then the square the pawn is **actually standing on** is
  asked whether it hands out a card.
- **Why:** a trap can move the pawn. Asking about the skill square first would hand out a card for a
  square the pawn is no longer on, or miss one a trap pushed it onto.
- **Why it needed a test written on purpose:** a trap and a skill square rarely meet, so the wrong order
  passes nearly every test that exists. `move-resolution.test.js` puts them in each other's way in both
  directions.
- **Rejected: skipping the skill square whenever a trap fired.** Simpler, and it loses the case where a
  trap pushes a pawn onto a skill square it was never going to reach, which is a nice thing to happen and
  should not be silently impossible.
- → Ch. 05, Ch. 08

### 2026-08-31: 67 needed a threshold step in the roll chain, before the multiplier

- **Chosen:** `modifiers.atLeast`, applied after the extra dice and **before** the multiplier.
- **Why:** the card is "roll a six or go nowhere, and if you do, take double". Putting the threshold after
  the multiplier would let a 3 doubled to 6 pass a test the dice failed, which is a different and much
  better card than the one on the artboard.
- **The guard on it caught a bug the same minute.** `atLeast` defaults to 0, and without checking
  `atLeast > 0` a roll that Devil Die had pushed to -7 was reported as a *missed threshold* instead of as
  the floor. The value was right and the explanation was wrong, and the explanation is what the screen
  reads out (NFR-08).
- **Rejected: implementing 67 as a special case in `rollChosenDie`.** One card's rule inside the turn
  manager, which is the layer that holds no rules.
- → Ch. 05

### 2026-08-31: The 29 rules sentences were written by Claude Code, and that is Product Owner work

- **Chosen:** every card has a `text` key in both locales, describing the rule that was **implemented**.
- **Why:** a card with a name and no rules text is a card nobody at the table can play, and the skill hand
  was about to become clickable. Waiting for the copy would have blocked a finished feature on wording.
- **What it is not:** final copy. Seven of the 29 differ from the artwork's wording because the rule
  differs, and every one of those deviations is tabulated in Chapter 05.
- **Rejected: shipping the cards with titles only**, which is what the previous commit did and was fine
  while nothing could be played. It stops being fine the moment a player has to choose between two cards.
- **The locale test checks all 29 have one**, so replacing the wording later is editing text rather than
  hunting for gaps.
- → Ch. 05, Ch. 04

### 2026-08-31: `prompt.css` was written by Claude Code, against the rule, and it is recorded not hidden

- **Chosen:** `src/ui/styles/prompt.css` exists, written on this side, composing only tokens that already
  exist in `tokens.css` and shapes already on the page.
- **Why:** `CLAUDE.md` says Claude Code invents no design rules and asks when a specification is missing.
  One is missing: design spec 03 covered the cards and the two hands and stopped, and issue #38 needs a
  reaction prompt and a target picker that it does not describe. Asking would have blocked the last
  commit of the two issues on a design round.
- **What was done instead of inventing:** no colour, size, spacing, radius, font or duration is chosen.
  Every value is an existing token and every shape is borrowed from the refusal strip, the panel chrome
  or the legal-move ring. The file's own header says so in its first thirty lines, so it cannot be
  mistaken for a delivered spec.
- **Rejected: sending a brief and waiting.** Correct process, and it would leave issue #38 unfinished
  with no working way to play a card.
- **Rejected: no styling at all, unstyled buttons on the page.** It would be visibly not this game, and
  it would make the four regions the design *does* cover look broken next to it.
- **Four things are named as owed by handoff 04** rather than guessed: what a countdown looks like, where
  the strip belongs, how a pickable pawn differs from a movable one, and D33.
- → Ch. 04

### 2026-08-31: A hand is always on screen, and playability is a separate question

- **Chosen:** `seatOnShow(state)` never returns `null`. Which cards in that hand can be clicked is
  `playableCards(state, seat)`.
- **Why:** the first version fused the two into "the seat being asked to act", which is nothing in every
  phase but the action phase, so the skill hand was **blank while the player chose a dice card**. A player
  needs to see what they hold in order to choose, not only in the moment they can play it.
- **How it was found:** the first run of `skill-hand.spec.js`, on its cheapest assertion, "the hand holds
  the card the turn drew". Worth recording because that case looked like a formality when it was written.
- **Rejected: showing all four hands.** One screen, hot seat: it would show every hand to everybody.
- → Ch. 04

### 2026-08-31: A half-finished card play lives in `ui/`, never in the game state

- **Chosen:** the clicked card and the targets collected so far are held in `ui/target-picker.js`.
  Nothing is dispatched until every target is in.
- **Why:** it is a fact about a mouse. It disappears if the player changes their mind, and because no
  intent has been sent, **cancelling is free**: there is nothing to undo and the rules layer never knew a
  card had been clicked.
- **Rejected: a `select-card` intent and a `cancel-card` intent.** It puts a presentation fact in the
  frozen state object and adds an intent whose only job is to undo something that never happened.
- **Marked by slot and not by card id**, because a hand can hold both copies of one card and marking by
  id lit up two of them.
- → Ch. 04

### 2026-08-31: The action phase is skipped when there is nothing to play

- **Chosen:** the loop dispatches `skip-action` by itself when the active player holds no playable card,
  and waits when they do.
- **Why:** this is not a design choice, it is the difference between a working game and a hung one. A loop
  that always waited would stall every turn in which the player has an empty hand, which is most early
  turns.
- **What it costs:** a spec cannot know in advance whether the "carry on" button will be there, which is
  why the end-to-end helper asks the board rather than assuming.
- → Ch. 04, Ch. 08

### 2026-08-31: A number target is one button per face, not a text field

- **Chosen:** FR FR's "name a number" is rendered as one button per face of the chosen dice card.
- **Why:** a text field needs validation, a submit, a keyboard and an error state for a number outside the
  die's range. The die has at most twenty faces, so the buttons **are** the validation, and a number the
  card cannot use is not offered.
- **Rejected: a number input.** Fewer elements on screen and four more states to design and test.
- → Ch. 04

### 2026-09-01: The card artwork is extracted by a script, not copied by hand

- **Chosen:** `scripts/extract-card-art.js` parses the Claude Design artboard and writes one `.svg` per
  card into `src/ui/art/`, run by hand as `npm run assets:card-art`. It matches drawings to cards **by
  title**, and it aborts before writing anything if a drawing matches no card or a card has no drawing.
- **Why:** a manual copy produces identical files once and leaves the next person to find 36 drawings in
  a 126 KB file and hope they catch all of them. The failure mode is the expensive part: a card that
  quietly misses its drawing looks exactly like the empty art window this work removes, so nobody would
  notice. Title matching over position matching for the same reason: the artboard happens to run in
  catalogue order today, and the first card moved on the canvas would silently put the Yeet drawing on
  Tax Fraud, which no test could catch because both are valid SVG.
- **Rejected: a build step.** It would make every `npm run build` depend on a file in `01-Design/`,
  which puts a design source in the production build's dependency graph.
- **Rejected: doing it once by hand.** Cheaper today, and it loses the two hard failure checks, which
  are the whole value.
- → Ch. 04

### 2026-09-01: The drawings are 36 separate files behind a glob, not one sprite sheet

- **Chosen:** one `.svg` file per card, read by `import.meta.glob` in `src/ui/art/index.js` and inlined
  eagerly, with `tests/unit/ui/card-art.test.js` walking the real catalogue to prove all 36 resolve.
- **Why:** the 300-line limit decides it. A sprite sheet holding 36 drawings is a few thousand lines in
  one file; 36 files are at most 50 lines each. The glob then means this module needs no editing when
  the card set changes, where 36 import lines would be a second copy of the card list maintained by
  hand, and this project already has one of those drifting in the locale files.
- **The cost is named:** a glob turns a missing drawing into a runtime `undefined` instead of a build
  error. The unit test is what buys that back, and it is why the test walks `SKILL_CARDS` and
  `POOL_COMPOSITION` rather than a list of file names.
- **Rejected: a sprite sheet with `<symbol>` and `<use>`.** One request instead of an inlined bundle,
  and it fails the file-size limit by a factor of ten.
- **Rejected: `<img>` tags or CSS backgrounds.** Design brief 03 § 2 already fixed inline SVG, and an
  external asset would put the drawing out of the stylesheet's reach.
- → Ch. 04

### 2026-09-01: The extraction strips the artboard's inline sizing, and that is a boundary question

- **Chosen:** the root `<svg>` of every extracted drawing loses its inline `style` and gains
  `aria-hidden="true"` and `focusable="false"`. The `viewBox` stays.
- **Why:** the artboard sets `display`, `width` and `height` inline, and `card.css` sets the same three
  on `.card__art > svg`. An inline style beats a stylesheet, so shipping it as delivered would have
  moved three sizing decisions out of Claude Design's reach, which is exactly the line `CLAUDE.md`
  draws. The `viewBox` is the drawing's own coordinate system and not a presentation choice, so it is
  not ours to touch. `aria-hidden` is NFR-08: the card already carries its name in `.card__title`, and
  without it a screen reader reads out the path data and the name is lost in it.
- **Rejected: shipping the SVG byte-for-byte as delivered.** Truer to the source, and it silently
  overrides the stylesheet the design owns.
- **Rejected: overriding it back with `!important` in `card.css`.** Same outcome, achieved by making the
  stylesheet fight the markup.
- → Ch. 04

### 2026-09-01: A player is named by position plus colour, and the seat stays the seat

- **Chosen:** on screen a player is "Spieler 2 (Grün)". The number counts from 1 over `state.seats`, so
  the second player of a two-player match is Spieler 2 and not Spieler 3. The colour word belongs to the
  seat. One helper, `ui/player-labels.js`, and three rewired call sites.
- **Why:** this fixes a real defect. Two players sit on seats 0 and **2**, so labelling a seat `seat + 1`
  gave a table with a Spieler 1 and a Spieler 3 and no Spieler 2. `move-hints.js` had recorded it as a
  known cost and left it, arguing that renumbering would introduce a second numbering that disagrees
  with `data-player` and the colour tokens. That objection is answered rather than overruled: the label
  now carries **both** facts, so nothing has to be inferred from the number, and the seat is still the
  seat in the markup and in every rule. The colour is in the name because a pawn on the board is
  identified by nothing else, so a name without it leaves the player to work out which pieces are theirs.
- **Why it survived two sprints:** in a four-player match the two numberings are identical, 1 2 3 4, and
  every screenshot anybody had taken was a four-player match.
- **Rejected: keeping `seat + 1`.** One numbering everywhere, and it prints a player who does not exist.
- **Rejected: names typed in at match setup.** The most personal option at a hot-seat table, and it needs
  an input per player and a place in the state object that does not exist: `createGameState` knows only
  `playerCount`.
- **Rejected: the colour alone, "Rot ist am Zug".** Shorter and directly readable off the board, and it
  makes the turn order invisible.
- → Ch. 04

### 2026-09-01: An opponent's skill cards stay secret and the count is public

- **Chosen:** the hand keeps rendering as card backs for anyone who is not the seat on show, and the
  number of cards each seat holds appears in the HUD. This closes open decision **D33**, which design
  spec 03 had correctly escalated to the Product Owner.
- **Why:** bluffing survives, and planning becomes possible, because a player can see where the threat
  is without seeing what it is. It also has a consequence the design has to absorb: **secrecy at a shared
  screen stops being theatre and becomes a requirement**, which is what forces the handover overlay. The
  rail currently flips from one player's face-up cards to the next player's after a 320 ms timer with
  nothing in between.
- **Rejected: hiding the count as well.** Maximum uncertainty, and weak at a hot-seat table where anyone
  can count the draws. It converts real information into mental bookkeeping.
- **Rejected: everything face up.** Honest, since all four players look at the same screen anyway, and it
  removes the surprise that makes a reaction card worth holding.
- **Consequence recorded rather than assumed:** the HUD now shows four numbers per seat instead of three.
  Pool and discard counters were considered at the same time and dropped, so sixteen numbers on screen do
  not become twenty-four.
- → Ch. 04, Ch. 06

### 2026-09-01: The turn sentence lives in the top bar, because the HUD had no width for it

- **Chosen:** one sentence, "Spieler 1 (Rot) ist am Zug", rendered in the always-present chrome row. The
  HUD's seat rows carry `data-on-turn` and the **short** name, "Spieler 2", with the colour shown as the
  row's left edge.
- **Why:** measured at 1440 by 900, a four-seat HUD row is 332 px wide. The full label needs 107, the
  four numbers with their words need 210, and an "am Zug" chip needs 55. It did not fit, and what it did
  instead was wrap onto a second line, which made the page 935 px tall and handed FR-31 a scrollbar, and
  truncate the names to "Spi...". The chrome row had roughly 1200 px going spare. A sentence is also
  what `turn.prompt` was written as, and it had been sitting unused in both locale files since the i18n
  commit.
- **Rejected: shrinking `--board-size`.** Spec 01 § 6 names it as the number to check first when a new
  region lands, so it was the sanctioned move and it was still the wrong one here: shrinking the board to
  make room for a HUD that Claude Code designed itself is a trade the designer should make. The
  measurements are in handoff 04 so D35 and D37 can make it with real numbers. The token is unchanged.
- **Rejected: dropping the words next to the four numbers.** It buys the width and leaves four bare
  numbers whose meaning nobody can recover.
- **Rejected: the full label in the seat row, clipped with an ellipsis.** "Spieler 2 (Gr..." is worse
  than "Spieler 2" next to a green edge.
- → Ch. 04

### 2026-09-01: The language switch is in the game's chrome and not behind a menu

- **Chosen:** the German/English switch is a button in the always-present top row, showing the language
  you would switch to.
- **Why:** FR-34 is a `must have` and its acceptance criterion is a switch **at runtime**. `S11` in the
  obligations book puts the language setting on a shared settings screen with the audio setting, and
  audio was dropped out of epic #39 on the same day. Leaving the language switch on a screen that no
  longer exists would have quietly dropped a must-have requirement behind a `should have` one, and
  nothing in the sprint log would have said so.
- **One key, both directions:** `language.switch` is "English" in the German file and "Deutsch" in the
  English one, so the label is always a word the reader can act on and there is no "current language"
  logic to get backwards.
- **Rejected: a settings overlay reached from the main menu.** Tidier, and it makes a runtime switch
  three clicks deep in a game that is played at one shared screen.
- **Rejected: two buttons, DE and EN.** No state to get wrong, and one of them is always a no-op.
- **What made it cheap:** no view caches a translated string, so the switch is `changeLanguage()` plus
  the existing re-render. FR-34's "no string remains in the previous language" is true by construction,
  and `hud.spec.js` checks it by searching the whole page for the German words afterwards.
- → Ch. 04

### 2026-09-01: Three stylesheets now exist that Claude Code should not have written

- **Chosen:** `hud.css` and `chrome.css` join `prompt.css` as interim files, each composing only tokens
  that already exist, each carrying a header in its first thirty lines saying it is not a delivered
  spec, and all three listed in handoff 04 as deliverables to be **replaced**.
- **Why:** the game had to become playable and nothing in epic #39 has a design. Handoff 01 said the HUD
  was "not yours to design yet" and handoff 03 listed it under what is deliberately not being asked, so
  waiting for a spec meant shipping a sprint with no answer to "whose turn is it". The honest version of
  that trade is to invent no colour, size, spacing or type, and to say so where nobody can miss it.
- **Rejected: waiting for design spec 04.** Correct by the letter of `CLAUDE.md`, and it ends the sprint
  with the same unplayable build the Product Owner opened this issue about.
- **Rejected: writing it and not saying so.** Cheapest of all, and it is the failure the report is meant
  to be able to describe.
- **`app.css` was touched too, and differently.** Two `auto` grid rows were prepended and every existing
  `grid-area` shifted down by two, so the two new regions have somewhere to be. No colour, no spacing
  value and no token changed. It carries a dated comment saying exactly that, which is the precedent the
  `body { margin: 0 }` correction in the same file already set.
- → Ch. 04

### 2026-09-01: The HUD was paid for out of the board and the cards, nine per cent each

- **Chosen:** `--board-size`'s width bound goes from 44vw to 39vw and the two hand `--card-u` factors
  from 0.76 and 0.68 to 0.70 and 0.62. Both carry the arithmetic in a dated comment, and both are in
  handoff 04 for D35 to confirm or overrule.
- **Why:** the HUD is a full-width grid row and the page had no room for one. Measured at 1440 by 900,
  the existing layout used 968 px of 900 once the prompt strip was up, and
  `tests/e2e/skill-hand.spec.js` caught it as FR-31's scrollbar. Spec 01 § 6 names `--board-size` as
  "the number to check first when the two hands are actually built", so changing it is the sanctioned
  procedure rather than an improvisation.
- **Why both and not one:** the board row is as tall as the taller of its two columns. Board 634, rail
  627. Shrinking the board alone bought 7 px of the 56 needed, which is worth writing down because the
  first attempt at the fix did exactly that and did not work.
- **Rejected: collapsing the empty refusal strip**, which would have freed 62 px in one move.
  `refusal.css` deliberately keeps it laid out at `opacity: 0` so the page does not jump when a refusal
  appears, which is D9's decision, and taking it would have traded a scrollbar for a jumping layout.
- **Rejected: cutting HUD content until it fits.** The measurements say a seat row needs 270 px and four
  seats plus a turn sentence need more than one line at 1392 px. Dropping the words next to the numbers
  would have fitted and left four numbers nobody can interpret.
- **Rejected: leaving FR-31 broken and noting it.** The assertion is a must-have requirement with a
  test already written for it, and a failing test in the suite is not a note.
- **The cost is named:** D26 says the hand sizes already drop the rules paragraph to keep the art, and
  spec 01 says `--board-size` had been raised on 2026-08-29 specifically to make the fields larger. Nine
  per cent of that increase is given back. The full-size reference card is untouched.
- → Ch. 04

### 2026-09-01: The turn is handed over by a person, not by a timer

- **Chosen:** at the end of a turn the game shows an overlay naming the next player, and waits for a
  Ready button. The 320 ms timer that used to pass the turn now opens that screen instead.
- **Why:** it follows from D33. Once an opponent's skill cards are secret and only the count is public,
  secrecy at one shared screen is whatever covers the screen while it changes hands, and the rail used to
  flip from one player's face-up cards to the next player's with nothing in between. It also answers the
  Product Owner's original question a second time: there is now a moment that says, in words, that it is
  your turn.
- **The wait still comes first.** A move has to finish animating and a refusal has to be readable (D9)
  **before** anything covers the board, so the overlay opens on the same timer rather than replacing it.
- **Rejected: carrying on automatically and just labelling the turn better.** Smoothest to play, and it
  makes the secret hand a fiction.
- **Rejected: leaving the hand face down until the player clicks it.** No overlay and one extra click per
  turn, and it protects the cards without protecting the board, the roll or the prompt.
- **The cost is named:** every turn now needs a click that it did not. `?fast=1` skips the gate so the
  end-to-end suite is not ten times slower, and one spec runs without the flag to prove the gate works.
- → Ch. 04

### 2026-09-01: A dice pool belongs to one match, and the caller is what enforces it

- **Chosen:** `match-flow.js` builds a fresh `createDicePool()` for every match, new or restarted. The
  RNG is **not** reset, so a restart plays a different match.
- **Why:** `createDicePool`'s own header has claimed since issue #30 that a pool is created once per
  match, and nothing enforced it because until the restart button there was only ever one match. A match
  that ends mid-turn never returns its three drawn cards, so a restart on the same pool starts seventeen
  deep and `draw()` throws outright after four of them.
- **Rejected: making `restartMatch` return the outstanding hand first.** It keeps one pool alive across
  matches, which contradicts the pool's own documented contract rather than satisfying it.
- **Rejected: making `restartMatch` build its own pool.** The state it returns and the `deps` the caller
  keeps dispatching with have to come from the same pool, and only the caller holds both.
- → Ch. 06

### 2026-09-01: `game-loop.js` was split three ways rather than compressed

- **Chosen:** `render.js` (what the page looks like), `turn-controls.js` (what a click means) and
  `game-loop.js` (what happens when nobody is clicking). The chrome moved to `match-flow.js` and
  `REFUSAL_MIN_MS` to `timers.js`. `match-flow.js` then hit the same limit and `page.js` came out of it.
- **Why:** the file passed NFR-02's 300 lines when the handover gate and the pause landed, and `CLAUDE.md`
  says to split along a real seam rather than compress. Every seam here already existed:
  `turn-controls.js` is the symmetric half of `card-controls.js`, which has done the same job for card
  clicks since issue #34, and the chrome's only button opens a screen the loop does not own.
- **Rejected: shortening the comments.** It is the one thing `CLAUDE.md` names explicitly as not a way to
  meet the limit, and the comments in that file are where the turn loop's reasoning lives.
- **Rejected: raising the limit.** It is NFR-02 and it is enforced by ESLint on purpose.
- → Ch. 04

### 2026-09-01: Audio left epic #39, and the language switch did not go with it

- **Chosen:** issue #40 (Audio Manager & SFX Integration, 3 points) is deferred out of epic #39. The epic
  is retitled from *UI / UX, Audio & Game State* to *UI / UX & Game State*, its estimate falls from 10
  points to 7, and the must-have class in the effort estimation falls from 74 to 71. **FR-34, the runtime
  language switch, was built anyway.**
- **Why:** the estimate's own note had said it for two weeks: "no asset exists yet; the estimate covers
  wiring, not sound design", and no asset was ever budgeted. The sprint log already listed audio as
  surviving "only if assets exist", the project plan listed it under "holds if the visual design exists
  by then", and both the feasibility study and the AI-engineering note had named it in advance as the
  likely cut. **No audio requirement is a must-have** (FR-39 `should`, FR-40 `could`, FR-41 `should`) and
  FG-14 to FG-16, the epic's must-have goals, contain no audio at all. So deferring it costs no must-have
  requirement, which is exactly the condition the MoSCoW drop order was written for.
- **The trap, and it was nearly walked into:** S11 in the obligations book is *"Audio and language
  settings"*, one screen for both. Cutting #40 would have taken the language switch with it, and FR-34 is
  a **must have** with no issue of its own, which means nothing on the board would have said it had gone.
  So the switch was built into the always-present chrome instead, where it does not depend on a settings
  screen existing at all.
- **Rejected: cutting the language switch too.** Consistent, and it silently drops a must-have
  requirement behind a `should have` one.
- **Rejected: keeping audio in the epic and letting it slip.** It is the same outcome with no record, and
  the sprint log would have had to explain an epic that closed with an open child.
- **What made this a decision block at all:** the retitling had already happened on GitHub earlier the
  same day and **no document recorded it.** Nine places across six files still carried the old title, the
  effort figures still counted the three points as must-have, and nothing anywhere said why. That gap is
  the thing worth carrying into the report: a board edit is not a decision until it is written down.
- → Ch. 01, Ch. 02

### 2026-09-01: The pool the player chooses from is a screen, not a counter

- **Chosen:** a sixth overlay screen showing all seven denominations with their copy counts, plus one
  sentence saying how many of the twenty cards are face down. Opened from a third always-present chrome
  button, and it pauses the match loop while it is up.
- **Why:** FR-19 asks the player to keep one of three dealt dice cards, and that is only a decision
  because of what the pool holds. A D2 leaves the start area half the time and a D20 one time in twenty
  (FR-09), so a hand of three is a good hand or a poor one entirely relative to the twenty cards behind
  it. Until this screen the only way to know the composition was to read section 5.1 of the game design
  document. The mechanic was complete and the information the mechanic depends on was not on screen.
- **Rejected: pool and discard counters in the HUD.** Considered earlier the same day and dropped, so
  that sixteen numbers on screen do not become twenty-four. A permanent number also could not have shown
  the seven cards, which is the part that communicates the weighting.
- **Rejected: the prose rules screen, S10 / FR-35.** A `should have` with no backlog issue that would
  explain dice cards, skill cards and the leaving-start rule in words. Showing a composition table is
  cheaper than describing it and clearer. If S10 is ever built, this is the part that already exists.
- **Rejected: putting the control on the hand plate**, which is nearer to where the question is asked.
  The chrome is where a control reachable at any point in a turn already lives, and the overview has to
  work in the `choose` phase or it does not help the decision it exists for. A second entry point on the
  hand is D47 of handoff 05 and needs only the extra element.
- **Worth noting for Ch. 01: this satisfies no requirement.** FR-16 to FR-21 are all satisfiable without
  it. It was built because the game is worse without it, which is a case the requirements catalogue does
  not capture.
- → Ch. 04, Ch. 01

### 2026-09-01: A jQuery import had made a pure function untestable, and no test said so

- **Chosen:** `OVERLAY_SCREEN` and `OVERLAY_ACTION` moved out of `overlay-view.js` into a new
  `ui/overlay-vocabulary.js`, which imports nothing. `overlay-view.js` re-exports both, so no existing
  importer changed.
- **Why:** `overlay-view.js` imports jQuery, and jQuery throws on import when there is no `document`.
  Vitest runs unit tests with `environment: "node"` **deliberately**, so that a module in `core/` or
  `state/` reaching for the DOM fails the run (NFR-01). The consequence nobody had noticed is that
  **anything importing `overlay-view.js` could not be unit tested at all**, including
  `overlay-screens.js`, which is pure and does nothing but describe screens. It went unreported because
  that file has no unit test to fail: it is covered through Playwright, where jQuery imports fine.
  `pool-screen.js` surfaced it on its first run, failing with "jQuery requires a window with a document"
  before a single assertion.
- **Rejected: `environment: "jsdom"` for these files.** The `node` environment is what makes NFR-01
  enforceable rather than declared. Weakening it so one test file can import an enum trades a real guard
  for a convenience.
- **Rejected: duplicating the two enums in `pool-screen.js`.** Two definitions of one vocabulary, and the
  attribute values are what the CSS and the Playwright specs match on.
- **The generalisable finding:** an untestable pure function is a sign of an import it does not need, not
  a reason to weaken the test environment. And a test suite says nothing at all about code that no test
  imports, which is an argument for writing the unit test even where the end-to-end suite already covers
  the behaviour.
- → Ch. 04, Ch. 08

### 2026-09-01: A distribution is tested against a pinned seed, not a fresh one

- **Chosen:** `tests/unit/core/dice-distribution.test.js` asserts that every die face and every pool
  denomination lands inside four binomial standard deviations of its expected count, over samples of
  60,000 rolls and 90,000 dealt cards, with **`createSeededRng` seeds written into the file**.
- **Why:** FR-20's criterion is a statement about frequencies and the old test was a statement about
  reachability, so a real distribution check was owed. Given that, the choice is between a fresh seed per
  run and a pinned one. A fresh seed fails roughly one run in some thousands for no reason at all, and a
  suite with one known flaky test in it stops being read. With a pinned seed the assertion either holds
  forever or it never held.
- **Why four sigma and not three:** there are sixty-seven separate faces across the seven denominations,
  and at three sigma one of them would be expected to fall outside the band by chance.
- **Rejected: a chi-square test with a p-value threshold.** More standard and it has the same flakiness
  problem, plus a threshold nobody on the team could defend in the report without explaining the
  statistic first.
- **Rejected: leaving the tolerance untested.** A band nobody has probed might be wide enough to accept
  anything, so one case hands `rollDie` a deliberately skewed generator and asserts the band rejects it.
- **Cost: about one second** on top of a 2.45 s unit suite, measured.
- → Ch. 08

### 2026-09-01: The pool overview reuses `resume` rather than getting an action of its own

- **Chosen:** the overview's close button carries `data-action="resume"`, the same action the pause
  screen's Resume button carries.
- **Why:** `match-flow.js` already answers `RESUME` with "close the overlay and resume the loop", and that
  is exactly what closing this screen means. Both screens suspend the loop while they are open for the
  same reason and both mean "put it back the way it was" when they close.
- **Rejected: a `CLOSE_POOL` action.** A second name for one behaviour, and two handlers that have to be
  kept in step for no gain. The label differs, which is the part the player sees, and the label is a
  locale string rather than an action name.
- **Consequence found while testing it:** `quitToMenu` cleared `state` but not `deps`, so the overview
  could have described an abandoned match's pool from the main menu. One line, and it was the test for
  "the button is hidden on the menu" that found it.
- → Ch. 04

---

### 2026-09-01: A delivery is diffed file by file, including the files declared unchanged

- **Chosen:** before copying anything out of the handoff folder, every delivered file was diffed against
  the file it would replace, including the three the README lists as "unchanged, included so the mockup
  runs". `board.css`, `card.css` and `card-state.css` were then **not** copied.
- **Why:** the delivered `board.css` is a 269-line pre-split copy. This branch had already split that file
  into `board.css`, `board-track.css` and `board-regions.css` for NFR-02. Copying the folder wholesale
  would have reverted the split, left two orphaned files still imported by `main.js`, and produced a page
  that looked correct because the pre-split file contains all the same rules.
- **The generalisable form:** "unchanged" in a delivery means unchanged since the designer took the
  snapshot, not unchanged against the branch it is being applied to. A handoff is a copy of a working tree
  at a moment, and the moment is not now.
- **Rejected: trusting the README's table.** It is accurate about what the designer changed, which is a
  different question from what is safe to copy. The cost of the diff was two minutes.
- → Ch. 04, Ch. 08

---

### 2026-09-01: The two rows the HUD needed were paid for out of the foot of the page, not the board

- **Chosen:** D35's answer was taken as delivered. `--board-size` goes back to 44vw and the two hand
  `--card-u` factors back to 0.76 and 0.68. The refusal strip hangs off the bottom of `.app__board` and the
  prompt strip becomes the third plate in the rail, so neither holds a grid row any more.
- **Why:** issue #39 had bought the HUD and the chrome their rows by shrinking the board and both hands
  about nine per cent, and both files said in their own headers that the change was forced by a measurement
  rather than chosen. The measurement was real, the *choice of what to cut* was not examined: the foot of
  the page held 148 px for two strips that are usually saying nothing, and the board and the cards are the
  part of the screen the game happens in. 882 px of 900 with the prompt up, measured in the mockup.
- **Rejected: keeping the smaller board.** It protects two empty strips by taking room from the two regions
  the player looks at.
- **Rejected: putting the HUD in the rail.** It is the only place that costs no full-width row, and the
  rail already sets the board row's height, so a HUD there would shrink the board by its own height anyway.
- **The fact to carry forward:** the board row is now set by the **rail** and not by the board, with 18 px
  of headroom. The next region added to the rail is the first one that costs the board its size.
- → Ch. 01, Ch. 04

---

### 2026-09-01: The handover passes the turn before it lifts the curtain

- **Chosen:** on the Ready button, `loop.passTurn()` runs first and `openScreen(NONE)` second, guarded so
  that a `passTurn` which ends the match does not have its win screen replaced.
- **Why:** `passTurn` is what re-renders the rail for the arriving seat. Closing the overlay first meant one
  painted frame of the **leaving** player's five skill cards in front of the person picking the device up.
  That is a real leak of decision D33's secrecy rule, and it is what the handover screen exists to prevent.
  Design spec 04 § 5 states the ordering as its one hard requirement, and its reason is the one that
  settles it: no CSS can cover a frame that has already been painted.
- **Rejected: hiding the rail with `visibility: hidden` during the handover as well.** It works, and it puts
  the concealment in two files that have to agree. When they stop agreeing the failure is silent, and what
  it costs is the game.
- **How it is tested:** two MutationObservers pushing into one array, asserting that `data-seat` on the rail
  appears before `data-open="false"` on the overlay. Every Playwright assertion retries, so all of them
  would pass a page that showed the wrong thing for one frame and then corrected itself, which is precisely
  the failure mode in question.
- → Ch. 04, Ch. 08

---

### 2026-09-01: The win is announced by the overlay alone, and the orange strip says nothing

- **Chosen:** `move-hints.js` lost its `WON` and `ABANDONED` branches. The win screen carries a new
  `data-outcome="won|abandoned"` so the stylesheet can draw the two apart.
- **Why:** the strip is `--color-warn` orange and `--color-warn` means the game has refused something.
  Telling a player they have won in the colour reserved for "you cannot do that" was recorded here as a
  defect when the strip was the only designed region available. D40 removed the reason it existed: there is
  a designed win screen now, so one message in two places is no longer a workaround, it is duplication.
- **Rejected: keeping the strip as a second, quieter announcement.** Two elements saying one thing is two
  places to change when the wording changes, and the strip was the wrong colour for it either way.
- **Rejected: inferring the outcome from `data-player` being absent**, which would have needed no new
  attribute. That is exactly the guess design brief 04 § 2 asks not to be made, and it couples the panel's
  colour rule to the accident that nobody wins an abandoned match.
- **Found while doing it:** the abandoned screen **cannot be reached from the interface at all**. Nothing in
  `ui/` calls `abandonMatch`; the Quit button goes to the menu. It is styled, translated, unit-tested and
  unreachable. Not fixed here, because what quitting a match is supposed to mean is a rule question.
- → Ch. 04, Ch. 08

---

### 2026-09-01: The four-second refusal hold became a token instead of a constant

- **Chosen:** `--motion-refusal-hold: 4s` in `tokens.css`, read by `game-loop.js` through the existing
  `motionMs` helper. `REFUSAL_MIN_MS = 4000` survives as the fallback for a harness with no stylesheet.
- **Why:** it was the only duration in the game that lived outside `tokens.css`, and its own comment said so
  and asked for it to be raised in the next handoff. D20 answered yes. The player feels this number, so it
  belongs to the design, and the mechanism to read it back already existed for `--motion-capture`.
- **Rejected: deleting the constant and letting the read fail to `undefined`.** Vitest runs with
  `environment: "node"` and no stylesheet, so the fallback is not hypothetical.
- **Why this one is worth recording at all:** it is the cheapest answer in a 437-line spec, one line of CSS,
  and it is the clearest demonstration of what the handoff round trip is for. A number stopped living in two
  layers at once, and nobody had to remember which.
- → Ch. 04

### 2026-09-02: The design briefs go out before the Sprint 2 closeout, and the pawn mark is asked for as a brief

- **Chosen:** brief 06 (the seat shape on the pawn, closing D16 and NFR-12) is written and sent on the first
  day of the closeout, ahead of board hygiene, the #40 audio decision, the documentation sweep and the
  merge. Handoff 05 stays open behind it, and the work order now says 06 first, 05 second. The one code
  change the brief needs, the empty `<span class="pawn__mark">`, ships in the same commit so Claude Design
  works against real markup.
- **Why:** the closeout has five steps and two of them wait on Claude Design. Nothing in the other three
  touches `src/ui/styles/`, so the two halves can run in parallel with no merge conflict. Sending the brief
  first buys the whole closeout window as design time. The Sprint 2 plan used the same lever for handoff 01
  and the sprint log records that it was the one scheduling move that worked.
- **Why 06 before 05:** 06 closes a `should have` requirement whose test has been marked expected-to-fail
  since 2026-08-30. 05 replaces a placeholder stylesheet for a screen that already works. Fifteen lines
  that close a requirement come before a panel that closes a preference.
- **Rejected: writing the fifteen lines of `pawn.css` here.** Spec 04 named the element and the tokens, and
  `hud.css` shows the pattern, so it was tempting. It would still mean choosing the mark's size on a piece
  that scales with the board and deciding what happens to the eyes of D14, and both are design decisions
  `CLAUDE.md` puts on the other side of the line. The Sprint 2 plan drew the same line for the board's DOM
  contract, and it held.
- **Rejected: closing out first and sending the briefs after the merge.** That is the order the five steps
  were listed in, and it would have had Claude Design idle for the three weekdays left in Sprint 2 and the
  specs landing in the last days before the 2026-09-11 freeze.
- → Ch. 02, Ch. 04

### 2026-09-02: The luminance threshold is retired rather than lowered, and the number moves to the notes

- **Chosen:** with the seat shape on the piece, the first case of `greyscale.spec.js` stops measuring the
  palette and starts asserting the acceptance criterion: sixteen marks with a non-zero box, one shape per
  seat, four different shapes, all of it repeated under `filter: grayscale(1)`. The 1.30 luminance case is
  deleted. The 1.146 measurement and the derivation of 1.30 move into
  `notes/01-requirements-and-goals.md` next to NFR-12 and into `notes/08-quality.md`.
- **Why:** the threshold measured a proxy. While colour was the only identifier, the spread of the four
  hues in greyscale **was** NFR-12, and falling short of 1.30 was a fact about the palette. With the shape
  on the piece the requirement is met another way, and what is left is a threshold nothing is trying to
  reach: a test that reports a known failure forever is how a suite learns to be ignored.
- **Rejected: keeping it as a weaker check at 1.10.** That is the only lower threshold that both passes
  today and means anything, and against a measured 1.146 it leaves four per cent of headroom. It would
  fire on a colour tweak that harms nothing, while the regression actually worth catching, two seats
  reducing to the same grey, has to cross the 1.0 case that is already in the file and stays.
- **Rejected: re-spreading the palette as well**, which was D2's other way out. Darkening blue and
  lightening green a step buys a margin the shape now provides, and costs the four hues that came from the
  layout template verbatim, every screenshot in the notes, handoff 01's sign-off and a Product Owner
  decision. A palette change should have a reason of its own.
- **What it costs, stated:** the visible reminder that the palette is thin. A number in a notes file is
  read less often than a red line in a test run. That is the trade, and it is worth making once the thing
  the red line was about is satisfied.
- → Ch. 01, Ch. 08

### 2026-09-02: A card is focusable when it is playable, which is a rule replacing a proxy

- **Chosen:** `card-view.js` writes `tabindex="0"` when `card.playable === true` and `-1` otherwise. It
  used to key on the card having an id.
- **Why:** the id test was a proxy for one case, the empty skill-hand slot of spec 04, and it silently got
  the other case wrong. The seven cards on the pool overview all have ids and none of them can be played,
  so a keyboard user tabbed through seven stops where `Enter` did nothing before reaching the button that
  closes the panel. Design spec 05 section 5 named it. The playable flag is what both cases actually mean:
  an empty slot is not playable either, so one rule covers both.
- **Rejected: excluding the pool screen by selector**, for example by keying on the overlay. It would fix
  the symptom on the one screen that has it today and leave the next unplayable card display to rediscover
  it. NFR-08 is about keyboard reachability in general, not about this panel.
- **Rejected: leaving the stops in and letting the focus ring explain them.** A focus ring on something
  that does nothing is a state that lies. `card-state.css` still styles `:focus-visible` and it now only
  ever appears on cards a player can act on.
- → Ch. 04, Ch. 08

### 2026-09-02: The delivered stylesheets were copied file by file again, and the mockup folder was not

- **Chosen:** only the four files the delivery's README listed as changed were copied into the repository:
  `pool.css`, `pawn.css` and the two specs. The package's `mockup/src/ui/styles/` folder holds twelve
  stylesheets, ten of them unchanged copies read from `dev` so the mockup runs standalone, and none of
  those ten was touched. Both mockup folders, `handoff-04/` and `handoff-05/`, were deleted after review.
- **Why:** this is the rule that was written after handoff 04, and this is the first delivery it was
  applied to prospectively rather than after a near miss. Handoff 04 shipped a `board.css` that predated
  the NFR-02 split into three files; copying the folder would have reverted that split silently and
  nothing in the test suite would have failed. The work order now asks every delivery to state the date
  and tree its snapshot was taken from, and this one did: `dev` at tree `991ee06c` on 2026-09-02.
- **Rejected: copying the whole folder and reverting what looks wrong afterwards.** That is the version of
  this process that failed once. A stylesheet that is subtly older than the repository is not visible in a
  diff anybody reads at the end of a merge, and the cost of being wrong is a silent regression in a file
  nobody thinks changed.
- **The generalisable point for the report:** an AI delivery arrives as a folder of plausible files, and
  the expensive question is not whether each file is good but which of them the sender actually intended
  to change. Asking the sender to say so in writing is cheaper than diffing twelve files, and it is the
  only part of this loop that is a checklist rather than a judgement.
- → Ch. 04, Ch. 02

### 2026-09-02: The Sprint 2 board is corrected rather than left as the plan wrote it

- **Chosen:** #31 to #35 carry `Sprint 2`, `Done`, and start and end dates taken from the author date of
  the commit that delivered them. The project plan had scheduled all five into the Sprint 3
  implementation half.
- **Why:** the board is the single source of truth for sprint membership (decided 2026-08-22) and it is
  what velocity is computed from. Leaving them in Sprint 3 would book work delivered on 2026-08-31 and
  2026-09-01 into a sprint that had not started, which is a worse distortion than the one it avoids.
- **Rejected: leaving the plan's assignment on the board so the plan stays visible.** The plan-versus-actual
  gap is worth keeping, but the sprint log is where it belongs, and it is recorded there in prose that a
  reader can check. A board field cannot hold "planned for Sprint 3, delivered in Sprint 2" and a sentence
  can.
- **What this makes the Sprint 2 figure:** 73 points of `Done` work against 72 planned, and the number is
  not a velocity. Three separate findings already say why (no effort is measured, #30's points describe
  work done on another day, and two design deliveries carry no points at all), and this decision adds a
  fourth cause rather than removing one: five issues that were planned for the next sprint are counted in
  this one. **The figure is printed with all four reasons next to it or not printed at all.**
- → Ch. 02

### 2026-09-02: Edge is left out of CI rather than installed onto the runner

- **Chosen:** the `e2e` job runs a matrix over `chromium` and `firefox` only. The `msedge` project stays
  in `playwright.config.js` and stays a local check, run once per release as the release level of the
  Definition of Done already requires.
- **Why:** `msedge` drives the **system** Edge rather than a browser Playwright manages, so a Linux
  runner has to acquire Edge before it can run that project at all. That install is the one step in the
  workflow that depends on a third-party package feed for a browser nobody in the team develops in, and
  it would be the most likely thing to turn a pull request red for a reason unrelated to the change.
- **Rejected: `npx playwright install msedge` on `ubuntu-latest`.** It works, and it makes the most
  fragile step in the file also the least valuable one. Edge and Chromium share an engine, so the third
  project buys coverage of Edge's shell rather than of a different renderer.
- **Rejected: a second `windows-latest` job for Edge alone.** Honest coverage of all three engines, paid
  for with a second runner type, a slower cold start and a Windows-only path problem waiting to be
  discovered. Not worth it inside a 2-point issue.
- **What this makes NFR-10:** two thirds automated, one third disciplined. That sentence goes in the
  report next to the requirement rather than a claim that CI covers the browser matrix.
- → Ch. 08

### 2026-09-02: The five gates stay five steps, including the one that duplicates work

- **Chosen:** the `checks` job runs `npm test` and then `npm run test:coverage` as two separate steps,
  even though the second runs the identical unit suite with a coverage reporter attached.
- **Why:** the five steps map one to one onto the five gates named in section 6 of
  `Test-Plan-and-Quality-Strategy.md`. A reader of the workflow, and a traceability table in the report,
  can point at each gate and find a step with that name. The duplication costs a measured 3.26 s of
  runner time.
- **Rejected: collapsing them into `npm run test:coverage` alone.** It is the tidier file, and it turns
  five documented gates into four steps, which then needs a footnote explaining the arithmetic. Three
  seconds is cheaper than a footnote nobody will trust.
- **The decision is written into the file itself**, in the comment block at the top, because the whole
  risk of this choice is that someone reads it as an oversight and removes it.
- → Ch. 08

### 2026-09-02: The coverage floor stays in `vitest.config.js` and is not repeated in CI

- **Chosen:** the workflow runs `npm run test:coverage` and configures no threshold of its own. NFR-05's
  80 % lives in `vitest.config.js`, in one place.
- **Why:** CI must fail for reasons a developer can reproduce with the same command on their own
  machine. A threshold set in the workflow means the local run and the CI run enforce different things,
  which produces the worst kind of red build: one that nobody can make red locally.
- **Rejected: a `--coverage.thresholds.lines=80` flag in the workflow step**, which reads as more
  explicit about what CI enforces and is exactly the duplication that goes stale.
- **The same argument applies to the browsers, the viewport and the retry count**, all of which are in
  `playwright.config.js` and none of which the workflow overrides. The workflow's job is to decide *when*
  the gates run. What they check belongs to the tooling.
- → Ch. 08, Ch. 07

### 2026-09-02: One retry stays in CI, and the flaky count is made visible instead

- **Chosen:** `retries: 1` under CI is unchanged, and the `e2e` job uploads `playwright-report/` on
  success as well as on failure, with `if: ${{ !cancelled() }}`.
- **Why:** this journal and Ch. 08 recorded on 2026-09-01 that four failures in the full suite were
  worker contention rather than defects, and named the dangerous version of that as the one that happens
  in CI, where a retry hides it and the suite gets slowly less reliable with nobody able to say when it
  started. Playwright does not report a retried pass as a pass: it reports it as **flaky**. The problem
  was never the retry, it was that nobody could see the flaky count. An uploaded report can be looked at.
- **Rejected: `retries: 0` in CI.** It makes every contention blip a red pull request, and the predictable
  human response is to press re-run until it goes green. That is the same blindness reached by a route
  that also wastes everyone's time.
- **Rejected: pinning `workers` to make contention impossible.** Already rejected once, on 2026-09-01,
  for the same reason: it slows all 213 tests to fix two.
- → Ch. 08

### 2026-09-02: CI pins Node 24, and the `engines` floor is left unverified on purpose

- **Chosen:** `node-version: "24"`, matching the version the team develops on. `package.json` keeps
  `engines: ">=20"`.
- **Why:** the value of CI here is that it runs what the developers run. A second version would be
  defending a compatibility promise this project does not make: nothing is published as a package, the
  artefact is a static build served from `dist/`, and no consumer chooses their own Node version.
- **Rejected: a matrix over Node 20 and 24.** It doubles the fast job, which is the job whose speed is
  its entire purpose, to test a claim that has no reader.
- **The consequence is stated rather than hidden:** the `>=20` floor in `package.json` is now checked by
  nothing, and it should be read as documentation of intent, not as a tested guarantee.
- → Ch. 07, Ch. 08

### 2026-09-02: The Game Design Document wins over the shipped code for all four square cards

- **Chosen:** where the implemented rule and the Game Design Document's section 7.2 disagree, the
  document is right and the **code** changes. Product Owner decision, taken on 2026-09-02 for issue #45.
  Three of the four square cards were affected: Banana Peel, It's Not That Deep and Big Ah Rock.
- **How the drift happened, because it is the part worth learning from.** None of the three was a
  mistake anybody made knowingly. Epic #38 implemented nineteen cards in one pass, five of which needed
  mechanics that did not exist, and the three that drifted are exactly the three whose printed rule
  needed a mechanic that *still* did not exist afterwards: a status that costs a turn, a rule measured
  in a radius, and a knockback that searches the board. Each was quietly replaced by the nearest thing
  the engine could already express. **`sendHome` instead of a stun. A D6 instead of "1 back plus an
  aura". Two rounds and no knockback instead of three and one.**
- **Why the drift was worse than any of the three substitutions.** Section 7.3 of that document is a
  table of six cards whose printed text the board model cannot express, each with the reading that was
  built instead and the reason. That table is the project's mechanism for exactly this situation, and
  **none of these three was in it.** So the rulebook said one thing, the game did another, the locale
  files described the code, and nothing anywhere recorded a choice. A deviation on the record is a
  decision; the same deviation off the record is just a bug with good manners.
- **Rejected: keep the code and amend the document.** It is much the cheaper option, and it was
  rejected because it makes the rulebook a description of an implementation. The document is the Product
  Owner's artefact and the artwork's text is its source; a card that reads "stunned and loses its next
  turn" in the player's hand should not have to be rewritten because the engine found it awkward.
- **The cost is real and is stated rather than buried:** the game gets easier. Banana Peel was the only
  trap that sent a pawn home, which cost a full lap, and it now costs one turn for one pawn. That is a
  balance change nobody has playtested. It is in the changelog under Changed for that reason.
- → Ch. 01, Ch. 05

### 2026-09-02: A Banana Peel stuns the pawn, not the seat

- **Chosen:** a new `STATUS.STUNNED` on `{ player, pawn }`, read by `evaluatePawn` exactly the way
  `STATUS.HELD` already is. The pawn drops out of the move choice for one of its owner's turns and that
  owner's other three pawns are unaffected.
- **Why:** the card text is "the next pawn to cross it is stunned and loses **its** next turn", so the
  pawn is what the sentence is about. It also needs no new step in the turn sequence: Hold Pawn
  established this shape and `evaluatePawn` already had two guards of the same form, so the whole rule
  is one status, one refusal reason and one three-line guard.
- **Rejected: skip the seat's whole turn**, which is the more literal reading of "loses its next turn"
  if "its" is taken loosely. It needs a new skip step in `turn-manager.js`, a message of its own, and it
  is disproportionate: a trap catches one pawn of four and would cost the player all four. A
  `could have` card should not be the harshest thing in the game.
- **One deadline subtlety, recorded because it looks like an off-by-one and is not.** The status lasts
  until `turnNumber + turnsForRounds(1, playerCount) + 1`. `hasStatus` applies while
  `turnNumber < until`, and a trap sprung during a dice move fires under the **active** seat's own pawn,
  so the turn to be missed is a full round away and `until` has to exceed it. The same expression also
  costs exactly one turn when a card sprang the trap under somebody else's pawn, whose next turn is
  sooner. One expression, no branch, and a test at two, three and four seats.
- → Ch. 05

### 2026-09-02: A trap chain is bounded at six, and the cap is not what makes it terminate

- **Chosen:** `TRAP_CHAIN_LIMIT = 6` in `core/enter.js`. On reaching it the trap is left standing and
  **unfired**, so the board stays honest and the player can still see it.
- **Why 6:** it is the longest chain a real board can build. Three trap kinds actually fire, the pool
  holds two copies of every card, so at most six firing traps can be on the board at once. The cap
  therefore never truncates a legal outcome.
- **What the cap is actually for, stated honestly:** it is **not** what makes the recursion terminate.
  Every firing calls `removeTrap`, so each link consumes an entry and the chain is already bounded by
  the length of the trap list. The cap guards against a future trap kind that survives its own firing,
  which this very issue makes plausible: It's Not That Deep now survives *nullifying* something and is
  only consumed by being stepped on. Writing that down matters, because a cap whose reason is
  misremembered as "otherwise it loops" is a cap somebody later removes after proving it cannot loop.
- **Rejected: a cap of 1**, which is the "no chaining at all" the Product Owner decided against.
  **Rejected: a cap of 40**, one per square, which is a number with no reason behind it.
- → Ch. 05

### 2026-09-02: A trap kind with no rule stops the game at boot rather than at the wrong moment

- **Chosen:** `core/trap-fire.js` holds a frozen table of one rule per trap kind, plus a loop that runs
  **at import** and throws if any non-blocker kind has no entry. A blocker reaching `fireTrap` throws as
  well.
- **Why:** what this replaced was a closed `switch` whose `default:` returned everything untouched. That
  branch existed for blockers, which share the list and never fire. It therefore also swallowed a
  missing rule for a *new* kind in complete silence, and the module's own header promised the opposite:
  "a fifth trap is a line there and a case here". The failure would have surfaced as a trap that did
  nothing, on some later turn, with nothing pointing at the cause.
- **Why at import and not on the first call:** it fails on the day the kind is added rather than on the
  turn somebody walks into one. `assertCatalogue` already sets this pattern, and it is the same
  argument: a check that runs when the module loads is a check nobody can route around.
- **Rejected: a throwing `default:` in the `switch`.** Better than silence, but it still only fires when
  a pawn actually crosses that kind of trap, which in a card game can be many matches later.
- → Ch. 05

### 2026-09-02: "The enemy pawn directly behind you" means behind the rock, not behind your pawn

- **Chosen:** Big Ah Rock's knockback searches backwards from the **rock's own square**, against the
  placing player's direction of travel, and hits the first foreign pawn it finds anywhere on the ring.
  The rock's own square is excluded, so a pawn already standing there is still not moved.
- **Why:** the pawn it hits is the one the boulder has just trapped, which is what makes the card's two
  halves one card rather than two effects sharing a name. It is also the only reading a player can see:
  the boulder is on screen, so the pawn behind it is obvious.
- **Rejected: behind the placing player's own pawn**, which is what "behind **you**" says most literally.
  It puts the knockback wherever that pawn happens to be standing, which can be the far side of the
  board from the boulder, and with four own pawns it needs a further rule about which one "you" is.
- **Rejected: only the one square directly behind**, which is the most literal reading of "directly".
  Easiest to explain and it would almost never fire, so half the card would be decoration.
- **Two things the board topology answered for free**, worth recording as evidence for the report that
  the early work on `board.js` keeps paying: `absoluteSquare` increases with `r` for all four seats, so
  "against the placing player's direction" is a single direction with no per-player branch; and
  `pawnsOnSquares` already answers in the order the squares were given, so "nearest one behind" is the
  first hit in a backwards run, with no distance arithmetic and no sort.
- → Ch. 05

### 2026-09-03: `?stack=` is a fourth test-only address-bar parameter

- **Chosen:** a comma-separated list of skill card ids that becomes the skill pool, read in `main.js`
  and forwarded to `startMatch`, which has accepted a stacked pool since issue #38.
- **Why:** the trap flows need two turns to line up, one seat laying a trap and another walking into
  it, and a trap card is 4 ids out of 29. Asserting the mechanism and skipping on a bad shuffle, which
  is how `skill-hand.spec.js` copes, cannot cover a two-turn sequence.
- **Rejected: pinning a seed.** `scripts/find-seeds.js` never plays a card, by its own stated policy,
  so it cannot find a seed that deals a named one, and its seeds have gone stale three times already.
- **Rejected: exposing `dispatch` on the game loop** so Playwright could place a trap directly. That
  tests `state/`, not a player-facing flow, and adds a production API that exists only for tests.
- **What it changes:** nothing about a rule. It is the same category as `?seed=` and `?fast=1`.
- → Ch. 06, Ch. 08

### 2026-09-03: `trapChanges` always returns the whole board, even when nothing happened

- **Chosen:** `{ pawns, statuses, traps, trapFired }` every time, with `trapFired: null` when no trap
  fired, instead of the earlier short-circuit to `{}` on an empty trap list.
- **Why:** the short-circuit meant `resolveMove` could not spread the answer and repacked three fields
  by hand, and the fourth, the report of what fired, was dropped. The board was correct and the player
  was told nothing. An end-to-end spec found it on its first run; no unit test had, because every case
  asserted the board.
- **Rejected: keeping the short-circuit and adding `trapFired` to the repack.** One more field to keep
  in step by hand, in a file already at the 300-line limit, and the same mistake waiting to happen the
  next time the shape grows.
- → Ch. 06, Ch. 08

### 2026-09-02: A trap announcement ships in the refusal colour, which is the wrong one

- **Chosen:** announce a fired trap and an aura-cancelled card in the existing D9 refusal strip, keyed
  off the `data-message-kind` seam that was already written and unread, in `--color-warn`.
- **Why it has to be announced at all:** a trap acts without the player asking, and under the new rules
  Banana Peel does not move the pawn. It arrives exactly where it was aimed and silently loses its next
  turn, so with no message the game simply takes a turn away.
- **Why the colour is wrong:** `--color-warn` is reserved for "you cannot do that". A trap going off is
  not a refusal, and announcing it in orange repeats the defect D40 fixed when it took the win message
  out of that same strip.
- **Rejected: waiting for design handoff 07**, which would leave a Banana Peel eating turns in silence
  until D55 is answered. **Rejected: inventing a neutral treatment**, which `CLAUDE.md` forbids this
  side from doing. A cosmetic debt with a brief open against it beats a live bug.
- → Ch. 04

### 2026-09-02: The trap mark is a real element, because both pseudo-elements were taken

- **Chosen:** an always-present empty `<span class="square__trap">` on all 40 track fields.
- **Why:** `.square::before` is D27's skill diamond and `.square::after` is the turn-off bar on squares
  9, 19, 29 and 39, and **all four of those are legal trap targets**. There was no third layer.
  Building it once with the board rather than when a trap appears is D10: a mark created at the moment
  it becomes visible has no previous state for a transition to run from.
- **Rejected: `::after` on the field**, which collides with the turn-off bar on exactly the four squares
  a trap is most likely to be laid near. **Rejected: creating the span on demand**, which breaks D10.
- Same situation and same answer as `.pawn__mark` in handoff 06.
- → Ch. 04

### 2026-09-02: One `data-statuses` list rather than eight boolean attributes

- **Chosen:** a single space-separated attribute on the pawn, matched with `[data-statuses~="stunned"]`.
- **Why:** a pawn carries several statuses at once, so eight per-kind booleans would be eight
  write-and-remove pairs per pawn per update, and the whitespace-list operator exists for this.
- **Rejected: one attribute per kind.** **Rejected: shipping only `stunned`**, the one this issue
  creates, which would mean revisiting the attribute seven more times.
- **Worth noting:** nothing was shown for any status before this. A held pawn was simply a pawn without
  `data-movable`, and a single held pawn among three movable ones was completely silent.
- → Ch. 04

### 2026-09-02: `displace` was deleted rather than kept as the blunt alternative

- **Chosen:** delete `displace` from `core/displacement.js`. `core/slide.js` is the only way a pawn is
  pushed now, for traps and for all five displacement cards.
- **Why:** the plan kept both, `slide` for traps and `displace` for cards. After the last card was
  routed through `shove` nothing imported `displace` at all, and no test had ever covered it. The
  reason every caller wanted the careful version is that `displace` checked nothing: a card using it
  could slide a pawn through a Big Ah Rock or stop it on an occupied square. There is no card for
  which "ignore the boulder" is the intended reading, so the blunt version had no audience.
- **Rejected: keeping it for future use.** A function nobody should pick, kept in case somebody does,
  is an invitation to reintroduce the bug it was replaced for. **Rejected: keeping it and excluding it
  from coverage**, which hides the evidence that it is dead.
- **How it was noticed, which is the part worth keeping:** the coverage report. `displacement.js` fell
  to 60 per cent lines on a file nobody had edited, with `displace`'s body as the only gap. A passing
  test suite did not show it and a line count would not have either.
- → Ch. 05, Ch. 08

### 2026-09-02: The nullification aura is checked in `resolveCard`, not in the `negate` instruction

- **Chosen:** `resolveCard` in `state/skill-play.js` asks whether an It's Not That Deep's aura covers the
  square the card acts on, and returns an empty change set plus `nullified: true` when it does.
- **Why:** it is the single place any card's rule actually runs. `playActionCard` calls it once and
  `closeWindow` calls it per played card plus once for the card that opened the window, so one check
  covers every path. It also reads the board **at resolve time**, which is the honest reading of an
  aura: the board can change between a card being played into a window and that window shutting.
- **Rejected: the `negate` instruction and `reaction-window.js`.** This is the one that looks right.
  `negate` already means "the card that opened this window does not resolve", which is the exact effect
  wanted. It fails for two reasons: it **only reaches anything while a window is open**, and an
  offensive card played when nobody can react resolves immediately with no window in existence, so half
  the plays would slip past. And `negate` is produced by an effect somebody played, while nothing plays
  an aura, so carrying it that way would mean minting a phantom card play and putting a fictional entry
  in the discard pile.
- **Rejected: checking inside each effect.** Not expressible: an effect is a pure function of a context
  snapshot returning a patch, and the board cannot tell it "do nothing". All 29 would have to ask, which
  is the opposite of why `checkTarget` is one place and not 29.
- → Ch. 05, Ch. 06

### 2026-09-02: A nullified card is spent, and the state gained a field to say so

- **Chosen:** the card leaves the hand and goes to the discard pile even though its effect never ran,
  and a turn-level `nullifiedCard` records which card it was.
- **Why the card is spent:** the player could not see the trap, and losing the card is the punishment
  the trap exists for. It also matches the decision `discardChanges` already carries, that a cancelled
  card stays in the discard pile because it was played.
- **Why the field is needed:** because it is spent silently, the board afterwards looks **exactly** as
  it would if the player had done nothing at all. The evidence is precisely what is missing, so it
  cannot be derived, and without it a nullified card is indistinguishable from a bug.
- **Rejected: refusing the play instead**, which would tell the player where an invisible trap is by
  process of elimination and make the card worthless. **Rejected: resolving silently**, which
  `core/cards/context.js` already names as "the quietest possible bug in a system like this".
- **One simplification stated rather than hidden:** a window resolving two nullified offensive cards
  records only the last. Possible, vanishingly rare, and one readable message beats a list nothing was
  built to display.
- → Ch. 05, Ch. 06

### 2026-09-02: Placement legality is a new target kind, not a per-card check

- **Chosen:** `TARGET.FREE_SQUARE`, a new value in the card vocabulary meaning "a track square that can
  take an object". The four cards that leave something standing on a square use it; `action-janky-rpg`
  keeps `TARGET.TRACK_SQUARE` and stays playable on all forty.
- **Why:** the catalogue's `targets` list is already the contract between a card and the target picker,
  so this is expressed where the question is already answered, by data. "An empty track square" is an
  honest kind of thing to point at. And the distinction it draws is real rather than administrative:
  **Janky RPG fires *at* a square, it does not occupy one**, so aiming it at an occupied square is
  exactly what the card is for.
- **Rejected: a table of card ids in `state/`** saying which cards also need the square to be free. It
  puts a list of cards next to a rule where the catalogue already answers by data, and it would have to
  be kept in step with the catalogue by hand.
- **Rejected: leaving all forty squares clickable and refusing at dispatch.** It offers the player a
  click the game then takes away, which is the interaction this codebase already avoids for pawns.
- **One rejection reason and not three.** `core/trap-rules.js` keeps the three causes apart because the
  view may one day want them, but the play is refused with the existing `BAD_TARGET`. All three lead the
  player to the same next action, pick a different square, and this project only splits a rejection when
  the next action differs.
- → Ch. 05, Ch. 06

### 2026-09-02: A pushed pawn stops before anything it cannot share a square with

- **Chosen:** a shove walks square by square and stops on the square **before** the first thing the pawn
  may not stand on. Three things count: a Rock or Big Ah Rock, a pawn of the pushed pawn's own player,
  and a pawn carrying `STATUS.ARMOURED`. `core/slide.js`, new in issue #45.
- **Why:** it is one walk and one rule, and two of the three are not new rules at all. FR-12 already
  forbids two of one player's pawns sharing a square, and `moveOnto` already reasons that "a pawn that
  cannot be captured cannot be landed on either, because the alternative is two pawns sharing a square".
  A shove is a different way of arriving, not a different board.
- **What it closes, and this is the reason it was worth doing now:** before this, an Oil Spill slide or a
  Yeet could put a pawn on an occupied square and leave both there. Two pawns of **different** players
  is caught later, loudly: `captureTarget` throws because FR-11 makes it impossible. Two pawns of the
  **same** player is caught by nothing, because that function filters to opponents. So the board could
  go quietly corrupt, and inside a house column it would break the FR-05 win condition several turns
  later, with no way to trace it back.
- **Rejected: let the slide pass over them and only refuse to stop on them**, stepping back a square at a
  time until it finds somewhere legal. That needs a retreat loop which can itself be blocked, so it is
  three rules where this is one, and it can end a *forward* slide behind where the pawn started, which no
  card says happens.
- **The cost, stated:** Yeet and Aight Imma Head Out now stop short in board states where they used to
  overlap two pawns silently. Somebody could read that as a regression. It is a strictly stronger
  invariant, and this block is the record that it was a decision.
- → Ch. 05

### 2026-09-02: Going home is never a slide, and that is how "a captured pawn sets off nothing" is implemented

- **Chosen:** `sendHome` stays a separate function and never routes through `core/slide.js` or through the
  trap trigger. A pawn arriving at `r = 0` is not treated as having entered any square.
- **Why:** FR-30 says a trap fires when a pawn **enters** a tile, and the Product Owner's decision on
  2026-09-02 extended that to every kind of movement. A start area is not a tile. Implementing the
  exception by *separating the two paths* rather than by filtering inside one of them means there is no
  condition that can be got wrong: the code that fires traps is simply never reached.
- **What the alternative would actually have done:** walking a pawn from `r = 17` to `r = 0` counts
  seventeen squares backwards, so a captured pawn would set off every trap between where it was standing
  and its own yard, on its way to being punished. Hyperbeam sends up to four pawns home at once, so one
  card could have detonated the whole board.
- **Rejected: one displacement function with a `firesTraps` flag.** The flag would have to be passed
  correctly by eleven call sites, and the failure mode is silent in both directions.
- → Ch. 05

---

### 2026-09-03: Handoff 07 landed whole, with D59 left dormant rather than patched

- **Chosen:** the five delivered stylesheets were copied in unchanged, including the `board.css` block
  answering D59, even though that block is overridden by `prompt.css` and therefore does nothing. The
  conflict goes back to Claude Design as D61.
- **Why:** `prompt.css` lines 190 to 222 have answered "what does a pickable field look like" since
  2026-09-01, in the other direction: teal, with every non-offered field dimmed. D59 says violet with no
  dimming and explicitly rejects both of those by name. `prompt.css` loads later, so it wins. Landing the
  package whole means no file is edited against its delivery and the board keeps a treatment that is
  already coherent.
- **A correction to this block's own reasoning, made the same day.** The plan claimed the keyboard focus
  was the one part of D59 with no competitor and would take effect regardless. It does not: the two
  selectors have equal specificity and both are built from `box-shadow`, so `prompt.css` wins the focus
  rule as well and a focused field is drawn exactly like an unfocused offered one. That makes **D61 a
  blocker for the second half of NFR-08** rather than a preference, which is a change of status and is
  corrected in `00-open-requests.md`. The keyboard reach itself works and shipped with issue #45.
- **Rejected: deleting the conflicting rules from `prompt.css` so D59 takes effect.** The earlier rule
  covers the **pawn** as well as the field and D59 speaks only about the field, so this buys a violet field
  next to a teal pawn, and non-offered fields undimmed next to non-offered pawns dimmed. Reconciling those
  is a design decision and `CLAUDE.md` forbids this side from taking one.
- **Rejected: holding `board.css` back until D61 is answered.** `board.css` also carries the `--seat-shape`
  consolidation that `board-trap.css` depends on for the owner's shape inside the chip, so holding it would
  ship a trap mark that cannot say whose it is, which touches NFR-12. The cost of holding is larger than
  the cost of a dormant block.
- **The cost, stated:** the D59 block is dead CSS in the repository until D61 is answered. That is recorded
  in `main.js`'s own import comment, where the cascade order is visible, rather than only in a note.
- → Ch. 04

---

### 2026-09-03: The D60 hold delays the loop and does not block input

- **Chosen:** when a trap fires from a card, `card-controls.js` draws the announcement and then delays the
  turn by `--motion-trap-hold` before carrying on. The player can still play another card or press Skip,
  and either ends the hold early.
- **Why:** while the hold runs the phase is still `action`, so `turn-controls.js` ignores a pawn click and
  `applyMoveHints` paints nothing. There is nothing on the board to click, which means the only input the
  hold could block is a deliberate one. D9 already reads this strip as staying "until the player's next
  action, and at minimum" for a duration, so a deliberate click is the player saying they have read it.
- **Rejected: swallowing input for the two seconds.** It needs either a new attribute in the DOM contract
  or a live-looking prompt button that does nothing, and what a disabled prompt looks like is a design
  decision `CLAUDE.md` forbids this side from taking. It is also the only version of the change that can
  leave the game feeling stuck.
- **The detail that was a bug in an earlier draft:** one announcement has to be held once. `trapFired` is
  a turn-level field cleared only at the end of the turn, so it is still set when the player presses Skip
  mid-hold, and that pass would schedule a second two seconds. A marker comparing the last announcement by
  identity fixes it, which is why `announcement(state)` returns the value and not a boolean.
- → Ch. 04

---

### 2026-09-03: `afterTrapCard` is a fourth delay key rather than a reuse of `afterTrap`

- **Chosen:** `FAST_DELAYS` gained a fourth key for the mid-turn hold, beside `afterMove`, `afterRefusal`
  and `reaction`.
- **Why:** the two waits read different tokens. `afterTrap` is the wait once the turn has ended and reads
  `--motion-refusal-hold`; the new one is mid-turn and reads `--motion-trap-hold`, which D60 sets to two
  seconds precisely because the two events differ in who caused them. One key for both would tie two
  numbers the design deliberately separated.
- **Rejected: reusing `afterTrap` so `?fast=1` needed no new key.** It would remove the freedom a unit
  test already pins one level up, namely collapsing one hold while keeping the other, and `?fast=1` is the
  one place that freedom is used.
- → Ch. 04

---

### 2026-09-03: The seat shape moved to one mapping, and a test was written for the fallback

- **Chosen:** the four `data-player` to `--seat-shape` rules were deleted from `pawn.css`, `hud.css`,
  `chrome.css` and `overlay.css`, leaving the single unscoped `[data-player="N"]` block in `board.css` to
  supply every consumer by inheritance. This is the follow-up spec 06 § 6 named and brief 07 § 6 asked for.
- **Why:** the mapping was repeated five times and D53 was about to put a seat mark on a sixth element. The
  surviving selector is unscoped, so it reaches the HUD and the chrome although they sit outside `.board`,
  and every consumer takes `--seat-shape` from the same ancestor it already takes `--player` from.
- **What made this worth a decision block rather than a tidy-up:** it fails **silently**. Each consumer
  writes `clip-path: var(--seat-shape, circle(50%))`, so a broken inheritance chain renders four identical
  circles instead of throwing or blanking. Every `clip-path` assertion in the suite was on `.pawn__mark`,
  so nothing would have caught it.
- **Rejected: doing the consolidation without a test**, on the grounds that the delivery says it is safe
  and the board renders. That is exactly the argument that would have shipped it broken.
- **Consequence worth generalising:** removing duplication also removes the redundancy that was covering
  for a mistake. Four copies of a rule fail loudly one at a time; one shared rule fails silently
  everywhere at once. The test to write is for the fallback the change made reachable.
- → Ch. 08

---

### 2026-09-03: The page got a 16:9 stage, and D6's "no target resolution" turned out to cover only the board

- **Chosen:** the whole layout is drawn on a stage of a fixed 16:9 shape, 100 by 56.25rem, which is 1600
  by 900 at the default text size. `app.css` fits it to the window with one declaration,
  `html { font-size: min(calc(100vw / 100), calc(100vh / 56.25)) }`, so 1rem is one per cent of the stage
  width and every `rem` length in the project scales with the stage. `#app` is the frame and paints the
  bars in `--color-ink`. Nothing inside the layout was re-measured.
- **Why:** D6 answered "what resolution is this drawn for" with "none, the board is one fluid unit", and
  that is true of the board and of nothing else. Every other region is in `rem`, so the rail costs a fixed
  705 px and the page 820 px of height, up to D35's 882 with the prompt strip up, whatever the window
  does. Measured on the reporting laptop, 1438 by 770 CSS px: 50 px of scrolling with nothing being asked
  and 112 px once the game asks. FR-31 was true at exactly one window size, which is also the only size
  the suite ever measured.
- **Why 1600 by 900 rather than 1440 by 810:** D35's height budget is 882 px and it is measured in the
  mockup. 810 cannot carry it, and making it fit means re-deciding every card size in D26. 900 keeps the
  budget that already works and 1600 is what makes the shape 16:9. At 1440 by 900 the board still comes
  out 634 px, exactly as before, with 45 px of bar above and below, so no existing measurement moved.
- **Rejected: `transform: scale()` with a factor computed in JavaScript.** It needs a resize listener in
  `ui/`, and it renders text at a fractional scale, which is blurry at every factor that is not whole.
- **Rejected: making the rail fluid in `vh` instead of scaling the stage.** That re-opens D26's card sizes
  and D35's row heights, both of which are design decisions and not ours to take.
- **Rejected: an `aspect-ratio` box with no scaling.** It gets the bars and not the fix: the rail's height
  is in `rem` either way, so a short window still scrolls.
- **Negative finding, recorded rather than glossed:** the stage overrides the text size the reader set in
  their browser, and above the 84rem breakpoint a small window makes everything evenly small instead of
  reflowing. Below the breakpoint the stage is switched off and D30's stacked layout is untouched. The
  trade is the usual one for a game field and it is the reason this goes back to Claude Design as **D62**.
- → Ch. 04

---

### 2026-09-03: The seat plate takes the width its numbers need, against D37's fixed 15.5rem

- **Chosen:** `.hud__seat` keeps 15.5rem as a `min-width` and takes `width: auto`.
- **Why:** D37's fixed plate leaves 218 px of content box and the four numbers need 278, measured. Nothing
  in that line can shrink, because `.hud__count` is `white-space: nowrap` with no `min-width: 0`, and
  nothing clips it, so the last item ended 45 px outside the plate and the **next plate painted over it**.
  Three of four seats read "1 KA" instead of "1 KARTEN". This was reported as "the card count is cut off"
  and it is not clipping, it is one plate covering another.
- **Why this still satisfies D37:** the plates hold the same labels and single-digit values, so all four
  come out identical at 308 px and the row still centres rather than stretching, which is what D37's
  answer is actually about. Four plates plus gaps are 1268 px of the stage's 1552.
- **Rejected: shorter labels, or dropping the two redundant counts.** D37 chose to keep all four and says
  why: they are quiet rather than absent. Changing what the plate says is a design decision; changing how
  wide it is to fit what it already says is a defect fix.
- **Rejected: `overflow: hidden` with an ellipsis.** It replaces text that runs into the neighbour with
  text that is missing, and the number a player reads is the one that would get cut.
- **A stale measurement was part of the cause.** `hud-view.js` justified its short seat name with "a seat
  row is 332 px", which is issue #39's layout and has not existed since D37 fixed the plate. Both comments
  are corrected to the measured numbers. A comment carrying an old measurement reads as a reason not to
  measure again. Goes back as **D63**.
- → Ch. 04

---

### 2026-09-03: The fan keeps its stacking order and flips its shadow, which is not what was asked for

- **Chosen:** the skill hand's cards keep DOM order, so the card on the right lies on top, and the hard
  shadow is cast to the **left** inside the fan only. One custom property, `--shadow-dir`, carries the sign
  through all four shadow declarations in `card.css` and `card-state.css`.
- **Why:** the request was to turn the order around so the left card lies on top. The order is not the
  defect. Every card sits at `--layer-card`, DOM order breaks the tie, and the exposed strip of a covered
  card is therefore its **left** edge, which is where D28 deliberately put the band and the title. What is
  broken is the depth cue: the shadow is cast down and to the right, so in a fan every shadow but the last
  is hidden under the next card, and a row of cards with no edges between them reads as a rendering fault.
- **Rejected: the order that was asked for.** It fixes the shadow as well, and it exposes the right-hand
  strip of every covered card instead of the left one, so the kind pill survives and the title and the
  `AKTION`/`REAKTION` label are what gets cut. Both looks were drawn out for the Product Owner with that
  consequence stated, and the shadow was chosen. **The rejected option is the one that was requested**,
  which is exactly why it is written down here.
- **Rejected: less overlap instead**, which the stage's wider rail would now afford. It hides the
  reordering rather than answering it, and the overlap is D26's number.
- **Not fixed, and it is in the brief:** the overlap table follows `data-count` while the hand always
  builds five slots, so a hand of three is wider than a hand of five, 714 px against 672. Two specs
  disagree, the stage's rail absorbs both, and the fan's own geometry is Claude Design's to set.
- Goes back as **D64**, together with two findings that need no code: `data-active` on the skill hand means
  "some card is playable" and not "this seat is on turn", so D33's hot-seat privacy hangs on the wrong
  state, and Baloo 2 and Nunito are declared in `tokens.css` and loaded by nothing, so no pixel
  measurement in any spec was taken against the metrics the game renders.
- → Ch. 04

---

### 2026-09-03: The card back on the player's own hand is a defect, not secrecy, and it is asked rather than deleted

- **Chosen:** the finding goes out as `10-brief-card-reveal-on-hover.md` with five numbered decisions,
  D65 to D69, and **no code is written this round.** The request behind it was that hovering an Action or
  Reaction card should turn it over so its text can be read.
- **Why the request could not simply be built.** Two independent reasons a player cannot read a card in
  their own hand, and neither is a missing hover rule. First, the hand is already face down for most of
  every turn: `skill-hand-view.js` writes `data-active` from "is some card playable", `card-state.css`
  reads the same attribute as "is this hand somebody else's", and `intents-cards.js` refuses every card
  outside the action phase, so the player's own five cards are backs through the dice choice and the move.
  Second, turning a hand card over would not have helped: `card.css` shows the rules paragraph at the
  reference size only, and at the hand's factor it computes to 8.57 px.
- **Why the back is not secrecy.** D33 is enforced by the handover curtain plus one ordering rule in
  `session-actions.js`, which passes the turn before the curtain comes down. A hand belonging to somebody
  else is never on screen with the board visible, so every case this back fires on is the player's own
  hand, and `app.css` already dims the plate in the same state.
- **Rejected: deleting the card back.** It is a change to how something looks, and `CLAUDE.md` reserves
  that for Claude Design. Asked as D65 instead, which is the whole reason the handoff loop exists.
- **Rejected: implement first and send it back for confirmation**, which is what handoff 09 did earlier
  the same day and which the Product Owner chose then. At 09 the open items were three numbers on things
  already on screen. Here D66 may rebuild the card's DOM into a front and a back under a `preserve-3d`
  wrapper, which breaks every rule targeting `.card > *`, moves the back off two pseudo-elements, pulls in
  `pool.css` and the reaction prompt, and rewrites three end-to-end checks. Building that twice costs more
  than waiting for the answer, and this defect is not breaking a requirement the way FR-31 was.
- **Rejected: fixing only the unreadable paragraph** and leaving the hand face down. It treats the symptom
  and leaves the cause, and the cause is the one that hides information the player owns.
- **Negative finding, and it explains the delay:** this was already on record. `09-brief` § 4 named it the
  same day among two findings that "need no code from you". That filing was right about the cause and
  wrong about the consequence, so it sat as a tidiness note instead of becoming a question. Promoted to
  D65 here.
- **Negative finding, second one:** there is **no test on hover anywhere in the suite**, and nothing
  asserts `data-active` against the turn phase, which is why a defect visible in every round survived two
  sprints. `tests/e2e/card-reveal.spec.js` is owed and is written when the spec lands.
- **Not fixed, and it is in the brief:** D64's measured hover finding, that the sibling shift is 43.5 px
  against a covered strip of up to 77.8 px, is carried on as D69 rather than answered here.
- → Ch. 04

---

### 2026-09-03: Handoff 10 was merged by hand, because it was read against a tree one commit old

- **Chosen:** the five delivered stylesheets were **not** copied in. Each was diffed against the working
  tree and only the hunks belonging to D65 to D69 were applied, keeping every change commit `e486bb4` had
  made to the same four files earlier the same day. One delivered rule was additionally amended, in
  `card-reveal.css`.
- **Why:** the delivery states it was read against "the working tree of 2026-09-03", which was true when
  it was written and stale about four hours later. Copying the files in would have reverted three separate
  things: the stage tokens `--stage-w` and `--stage-h`, which `app.css` reads for `#app`'s size, so the
  16:9 stage would have collapsed and FR-31 would have broken again on every window that is not 900 px
  tall; the `--shadow-dir` sign in three files, so the fan's shadow would have gone back to falling right
  and hiding under the next card, which is the defect the Product Owner had reported that morning; and the
  empty slot's `z-index: 0` and `content: none`, so a slot would have painted its dashed border across the
  last real card again. None of the three has anything to do with what handoff 10 was asked.
- **Why the amendment to `card-reveal.css`:** it casts a revealed card's hard shadow down and to the
  right, because it was written before D64 existed. A revealed card is still sitting in the fan, so its
  shadow would have flipped from left to right under the pointer, which is D64's depth cue defect undone
  one card at a time. Both offsets now multiply by `--shadow-dir`. The change and its reason are recorded
  in a note at the top of the delivered spec, the same way handoff 07's link fix was.
- **Rejected: copying the five files in and re-applying `e486bb4`'s changes on top as a second pass.**
  Identical end state, and the intermediate tree is broken, so a bisect lands on a commit where the page
  does not lay out. The diff is also harder to review, because the reviewer sees each hunk twice.
- **Rejected: sending the package back for a re-cut against the current tree.** The clean answer, and it
  costs a round trip on work that is already correct. It is also not obviously the right lever: handoff 09
  is still unconfirmed, so a re-cut would be made against a tree whose own decisions Claude Design has not
  agreed to yet. The staleness goes back as a finding instead, with the close of handoff 10.
- **The cost, stated:** the repository now holds a delivered file that differs from what was delivered, in
  one declaration, and two files whose delivered version this side chose not to take whole. That is worse
  than a clean copy and it is written down in three places rather than one, so nobody has to reconstruct
  it from a diff. **The process gap is real and is not closed by this decision:** nothing in the loop lets
  the receiving side check which tree a delivery was read against, and only diffing caught it.
- → Ch. 04

---

### 2026-09-03: The tab stop became a field on the card, not a rule inside the shared card component

- **Chosen:** `card-view.js` writes `tabindex` from `(card.focusable ?? card.playable)`. The default is
  exactly what it was, and `skill-hand-view.js` is the one caller that sets `focusable: true` regardless
  of playability.
- **Why:** D67 asks for every card in the skill hand to be reachable with Tab, playable or not, because
  focus now reveals the card and the card a player most wants to read is the one they cannot play yet.
  But `updateCard` is shared by three regions, and design spec 05 § 5 took seven dead tab stops **out** of
  the pool overview for a reason that still stands there: nothing in the pool reveals on focus, so a stop
  where `Enter` does nothing still tells a keyboard user nothing. `dice-pool.spec.js` asserts that. So one
  rule can no longer serve both, and the caller is the only place that knows which case it is in.
- **Rejected: keying it on `card.family === "skill"` inside `card-view.js`.** One line shorter and it puts
  a fact about a *region*, which regions let you tab to a card you cannot play, inside a component that is
  supposed to know only what a card is. The pool overview renders skill cards too, so the check would have
  been wrong there on the first day.
- **Rejected: making every card focusable and taking the pool's stops out with a second rule.** It
  reverses a delivered decision to re-implement it somewhere else, and it turns a green assertion in
  `dice-pool.spec.js` into something that has to be re-earned.
- **What it does not change, stated:** `events.js` still binds `click` and `keydown` on
  `[data-playable="true"]`, so `Enter` on a focused unplayable card does nothing. That is deliberate. The
  stop exists to read the card, not to play it, and the focus ring says "you are here" rather than "you
  may play this".
- → Ch. 04

---

### 2026-09-03: Brief 11 asks for the roll's animation and its explanation in one handoff

- **Chosen:** one brief covers both what the arrival of the roll looks like (D71) and how a roll that
  cards changed reads on screen (D73), rather than a brief about the animation and a later one about the
  breakdown. The Product Owner took this decision after being shown both options.
- **Why:** the two meet in the same instant and in the same 30 px of screen. `state.rollSteps` has existed
  since issue #38 with its sentences translated into both languages and no reader in `ui/`, so the
  explanation is owed either way. A look designed for a bare number has to be designed a second time when
  up to nine steps have to appear beside it, and the second design would arrive after the first one has
  tests and a stylesheet against it. Asking both at once costs one longer brief and no extra round trip.
- **Why it is also the honest scope:** the request was "the animation is boring", and NFR-08 is a
  `must have` whose explanation half this half-answers. Delivering only the animation would have left the
  requirement in the same state and made the brief look complete.
- **Rejected: two briefs, one per question.** Smaller and faster to answer, and it is the split that looks
  tidier on the loop's status table. It fails on the reason above: D71's answer constrains D73's and there
  is no order in which that is not true.
- **Rejected: asking only for the animation and filing the breakdown as an unnumbered leftover.** That is
  the shape that produced this file's own cautionary tale, where an unnumbered leftover was implemented in
  `prompt.css` while the loop still listed it as unanswered. Four such leftovers are still open from spec
  03 and brief 04 and none of them has moved in three weeks.
- **The cost, stated:** brief 11 is the longer of the two sent that day and D73 alone could hold up an
  answer to D71, which is why the brief says explicitly that **D70 is the one to deliver if only one thing
  can be delivered**. D70 is a duration, it needs no drawing, and it is the only one of the five that
  blocks code rather than CSS.
- → Ch. 04

---

### 2026-09-03: Brief 12 asks for three mockups and a choice, which no brief in this loop has done

- **Chosen:** `12-brief-main-menu.md` asks for **three artboards in `handoff-12/`**, each with a sentence
  saying what it does differently and what it gives up, and the Product Owner picks one. The spec then
  answers D75 to D80 for the chosen one.
- **Why:** every brief so far has been written against a defect or a gap, so it could name the cause and
  ask one question per consequence. "The main menu is barebones" has no cause. The three elements on it
  are each correct, `menuScreen()`'s own comment gives the right reason for one button, and what is being
  asked for is a direction. A direction is chosen by looking at alternatives, not by reading a question.
- **Why it makes the loop's hardest rule easier rather than harder:** the rule most often skipped is that
  every answer names a rejected alternative, because a finished design reads as an accident without one.
  Here the two mockups that are not picked **are** the rejected alternatives, already drawn, with their
  trade-offs written while they were fresh. That is cheaper than reconstructing them after the fact, which
  is what the documentation rules exist to avoid.
- **Rejected: asking one open question per aspect, the way every earlier brief did.** It is the
  established shape and it needs no new convention. It cannot work here: "what should the front door of
  the game look like" is not a question with a wrong answer, so a single answer would arrive with nothing
  to compare it against and the Product Owner would be approving the only thing on the table.
- **Rejected: this side drafting the three variants and asking Claude Design to refine one.** `CLAUDE.md`
  forbids it in as many words, and it would also be the worse artefact: three variants drawn by the side
  that owns the DOM would differ in layout and agree on everything that matters.
- **Rejected: four or five mockups.** More range, and each one thinner. Three is enough for a real choice
  and few enough that each is worked out, including the unavailable state that D77 cannot be judged
  without.
- **The cost, stated:** the mockup folder is the fifth in the project and, like `handoff-04/`,
  `handoff-05/`, `handoff-07/` and `handoff-10/`, it is deleted after the review. So the drawings that
  justify the decision do not survive in the repository, only the sentences about them in the spec. That
  is the same trade the four earlier folders made and it is the reason the spec has to carry the reasons
  rather than point at the pictures.
- → Ch. 04

---

### 2026-09-03: The roll's moment is asked of the state, not of the phase, because a roll has two doors

- **Chosen:** `advance()` asks `turn-waits.js` "does a roll exist that this turn has not been held for"
  at the top of the function, before any phase branch, rather than holding the roll inside the `roll`
  branch right after `apply(ROLL_DIE)`.
- **Why:** `handleRollDie` does not always roll. When an opponent holds Critical Failure, Devil Die or
  Hold Pawn it opens the on-roll reaction window and rolls nothing, because those three are played "as
  any player rolls" and have to be played before the number is known. `resumeAfterWindow` is what rolls
  once the window shuts, dispatched as `close-window` out of `card-controls.js`, and the loop's `roll`
  branch is never re-entered on that path. A question about the state catches both doors; a question
  about the phase catches one.
- **Why it matters more than a missed animation:** `roll.css` puts `pointer-events: none` on a rolling
  row and only the hold takes the attribute off, so the missed door left **the dice hand permanently
  unclickable** from the first turn an opponent drew one of those three cards. It surfaced as three
  unrelated specs timing out on a click four minutes into a 77-turn match.
- **The upside, which was not the reason but is real:** the second door now gets the hold as well, and a
  roll a Devil Die changed is the roll most worth showing.
- **Rejected: the `roll` branch plus a second hold inside `card-controls.js`.** The obvious local fix,
  and it puts one rule in two places. The next card that changes when a roll happens has to remember
  both.
- **Rejected: clearing `data-rolling` in `updateDiceHand` whenever the phase leaves `roll`.** Cheap, and
  it fixes the unclickable hand while silently dropping the hold on the second door, so the symptom goes
  away and the feature stays half built. That is the worse failure, because nothing would report it.
- **The cost, stated:** the check runs on every `advance()`, which is several times per turn, and it is
  guarded by a turn-number marker so one roll is never held twice. That marker is the same device
  `card-controls.js` uses for the D60 announcement hold.
- → Ch. 04

---

### 2026-09-03: `turn-waits.js` is a new file rather than `game-loop.js` growing past 300 lines

- **Chosen:** the two waits the loop takes by itself, the roll's moment and the pause before the
  handover, moved into `src/ui/turn-waits.js`. `handleWindow` moved into `card-controls.js` in the same
  change. `game-loop.js` came out at 286 lines, below the 293 it went in at.
- **Why:** NFR-02's 300-line limit, and brief 11 had already named the 7 remaining lines as the reason
  the hold could not be guessed at. The seam is one this file already has twice: `card-controls.js` owns
  the third wait, the two-second hold on a trap a card fired (D60), so putting the roll's hold beside the
  handover pause makes the arrangement symmetric instead of arbitrary. The loop decides *that* it waits,
  `timers.js` decides *how long*, and the new file decides *when*.
- **Why `handleWindow` went with it:** it was the loop's one branch that reads a reaction window, and
  `card-controls.js` already owned that window's clock, its prompt and its closing. It was in the wrong
  file before this change and moving it is what made the arithmetic work without a trick.
- **Rejected: shortening the comments in `game-loop.js`.** It would have fit and CLAUDE.md forbids it in
  as many words: when a file approaches the limit, split it along a real seam rather than compressing it.
  The comments in that file are where the reason for every automatic step lives.
- **Rejected: putting the roll's hold in `card-controls.js` beside the D60 hold.** The nearest existing
  home, and the file is named for what a player does with a card. A roll is not a card play, and the
  three cards that can interrupt it are a coincidence of the mechanism rather than the subject.
- **Rejected: `timers.js` owning the wait as well as its length.** It has no DOM access on purpose, and
  the roll's hold has to clear an attribute on the dice hand.
- **The cost, stated:** one more file in `ui/` and one more indirection between the loop and a
  `setTimeout`. This is the third time `game-loop.js` has been split at the limit, after
  `render.js` and the two controls files in issue #39, which is worth a sentence in the report: the
  limit has produced four real seams and no artificial ones.
- → Ch. 04

---

### 2026-09-03: The message strip was renamed now rather than left for later

- **Chosen:** `.move-refusal` became `.message-strip` and `refusal.css` became `message-strip.css`, in a
  commit of its own ahead of the feature. The Product Owner took this decision when asked.
- **Why:** the name was right while a refusal was the only thing the strip said. D55 gave it a trap's
  voice and D73 gave it the roll's, so two of the three kinds it carries are not refusals, and the spec
  reported it itself under "Noticed and not done". The files were open anyway, which is the condition the
  spec named for doing it.
- **Why a separate commit:** the rename touches five test files and a mistake in one of them would look
  like an animation bug. Landing it alone means the existing cases that locate the strip are
  what verify it, and the feature commit's diff contains only the feature.
- **Rejected: leaving it.** It costs nothing today and the name is read by every person who opens the
  file. Two decisions had already gone past it, and a third one making it wrong again is the point at
  which "later" stops being credible.
- **Rejected: renaming the two tokens as well.** `--motion-refusal-hold` really is the hold a refusal
  gets, so it is correct. `--layer-refusal` is a genuine leftover shared by all three kinds, but it
  lives in `tokens.css`, which belongs to Claude Design, so it was asked there rather than changed from
  here. Recording it matters: this is a name known to be wrong and deliberately left, which is a
  negative finding rather than an oversight.
- → Ch. 04

---

### 2026-09-03: The roll gets its 900 ms even on a turn with no legal move

- **Chosen:** the hold runs whenever a roll happened, including when the roll produces no legal move and
  the phase goes straight to `turn-end`. Such a turn then costs 4.9 s: 900 ms of roll followed by D20's
  four-second refusal hold. The Product Owner took this decision when asked.
- **Why:** one rule, one behaviour. `rollChosenDie` sets the phase to `act` **or** to `turn-end`, and
  which of the two is a fact about the pawns rather than about the roll. A roll that happened is a roll
  that happened, and the number is the thing the player is waiting for either way.
- **Rejected: skipping the hold when the phase goes to `turn-end`.** Saves 900 ms on a turn that is
  already the longest in the game, and the refusal's four seconds are more than enough time to read a
  number. It loses on two counts: the roll would have two different lengths depending on what came after
  it, which is a rule nobody can predict from the screen, and the throw animation would run while an
  orange refusal was already standing in the strip.
- **The cost, stated plainly:** the no-legal-move turn goes from 4.0 s to 4.9 s. `passesOnTurnOne` is
  the seed that shows it, and `no-legal-move.spec.js` is the only spec that plays without `?fast=1`, so
  it is the only one that pays the extra time.
- → Ch. 04

---

### 2026-09-04: The main menu is design 12c, chosen by the Product Owner, and it is not built yet

- **Chosen:** direction **12c** of the three mockups handoff 12 delivered, three doors laid out in the
  game's own card language. The Product Owner took the decision on 2026-09-04, in conversation with
  Claude Design rather than off the delivered package alone, and asked in the same message that the
  implementation not start yet.
- **Why brief 12 asked for three drawings at all:** the request was that the menu is "barebones", which
  is a preference and not a defect. There is no cause to diagnose, so the choice could only be made by
  looking at something. That is the reason this is the only brief in the loop that asked for more than
  one answer per decision.
- **Why the answer came back as a recommendation rather than as an open choice:** Claude Design drew all
  three and then picked 12c itself, writing the spec for that one and leaving 12a and 12b as the named
  rejected alternatives the spec template requires anyway. So the mockups did double duty. The
  Product Owner's confirmation is what turned the recommendation into the decision.
- **Rejected: 12b, the front door.** A two column panel with the game's name large on the left and three
  wide rows on the right. It needs **no artwork at all**, so it is the direction that would have cost
  least to land had the three drawings not already been made.
- **Rejected: 12a, the panel keeps its place.** The cheapest of the three by a wide margin: about 25
  lines inside `overlay.css` and no new file. It improves the measurement brief 12 complained about by
  four percentage points and leaves the brief's own sentence true, which is to say it is a real answer
  and not a straw man.
- **What is recorded here and what is not.** The argument on file for 12c is the spec's own, in D75 to
  D80. **The Product Owner's own reasons are not written down**, because the conversation that produced
  them happened with Claude Design and this side did not see it. That is a gap rather than a detail:
  the report is graded on why, and the why behind the one visual direction the game's entry screen will
  use is currently only in a spec's voice. Worth one sentence from the Product Owner before the report
  is written.
- **Why nothing was built on the strength of it:** the Product Owner asked for that explicitly. The
  package is landable as it stands, `menu.css` and three SVGs, so this is a queued decision and not a
  blocked one. **Released and built the same day**, see the four decisions below.
- → Ch. 04

### 2026-09-04: The menu's locale keys deviate from the six names the spec asked for

- **Chosen:** nest each door's two strings under the door, `menu.hotseat.label` and
  `menu.hotseat.hint`, and the same for `online` and `settings`. `menu.start` was deleted, because
  `menu.hotseat.label` replaced it.
- **Why the spec could not be followed literally:** 12-spec § D78.3 names the six keys as
  `menu.hotseat`, `menu.hotseat.hint`, and so on. **That is impossible in JSON**, where a key cannot
  hold a string and an object at the same time, so `menu.hotseat` cannot be both the label and the
  parent of the hint. The deviation is arithmetic rather than a judgement call, which is why it was
  taken rather than asked back.
- **Rejected:** *six flat sibling keys, `menu.hotseat` plus `menu.hotseatHint`.* It keeps the spec's
  literal short name for the label and stays at the depth-2 shape the `menu` block already had. It
  loses because the pairing then lives in a naming convention rather than in the structure: the label
  and the hint of one door are two unrelated keys that happen to share a prefix, and a fourth door
  would add two more siblings to a flat list of eight. Nesting also lets `menu-screen.js` derive both
  keys from the action, so a new door costs no change in that file. Depth 3 is not new here:
  `trap.fired.banana-peel` and `card.skill.<id>.title` are already at it.
- **Consequence:** `flatKeys` in `locales.test.js` produces the dotted keys either way, so the key-set
  and placeholder cases needed no change. `tests/e2e/match-flow.spec.js` reads `en.menu.hotseat.label`
  straight out of the locale file, so the shape is asserted by use.
- → Ch. 04

### 2026-09-04: The three menu drawings were stripped of their provenance metadata

- **Chosen:** delete the `<metadata><c2pa:manifest>` block and the two `xmlns` attributes from the
  three delivered SVGs before landing them, so each file begins
  `<svg viewBox="0 0 232 128" aria-hidden="true" focusable="false">`, exactly like the 36 card
  drawings. Paths, colours and geometry are byte-for-byte as delivered.
- **Why:** the 36 generated drawings carry no such blob, because `scripts/extract-card-art.js` strips
  it. Keeping it would have made the three files look nothing like their neighbours in the same
  directory, and roughly **23 KB of base64 provenance data** would have shipped inside the production
  bundle and been inlined into the DOM on every menu render, for three pictures totalling under 6 KB
  of actual drawing.
- **Rejected:** *landing the files exactly as Design delivered them.* It is the more faithful
  treatment of a deliverable and `card-art.test.js`'s three contracts pass either way. It loses on the
  bundle and on the inconsistency, and the metadata is not part of the design: no colour, size or path
  changed, so nothing Design decided was touched.
- **Consequence:** these three are the exception to `src/ui/art/`'s rule that its files are generated,
  and the exception is recorded in that file's header. A redraw is a file edit, and
  `npm run assets:card-art` neither produces nor removes them.
- → Ch. 04

### 2026-09-04: The chrome's controls are pushed right by a rule instead of by the turn sentence

- **Chosen:** one declaration, `justify-content: flex-end` on `.app__chrome`.
- **Why it was needed, and it is a finding rather than a preference:** 12-spec § 7 flagged that it
  could not tell from the stylesheets whether the language button sits at the right end of the chrome
  row on the menu, and said so rather than guessing. It did not. `.chrome__turn` carries
  `flex: 1 1 auto` and is the row's **only** spacer, so the controls were pushed right by the turn
  sentence rather than by any rule, and `chrome.css` takes that sentence out of flow with
  `:empty { display: none }` because it is empty on the menu and on the setup screen. With pause and
  pool also hidden there, the language button was the only child left and it sat at the **left** end.
- **Why it is safe:** the declaration is inert during a match. A flex child with `flex-grow: 1`
  already consumes every bit of the free space `justify-content` would otherwise distribute, so the
  rule only takes effect on the two screens where the sentence is gone. `shell.spec.js`, which
  measures the page's boxes, is unchanged.
- **Rejected:** *scoping the fix inside `menu.css`.* It would change one screen and leave the setup
  screen with the button on the left, which is the same bug one click later. Also rejected: *reporting
  it back to Design as a new open request and shipping the menu with the button on the left.* Design
  had already drawn it on the right in all four artboards, so the intent was visible and asking again
  would have cost a round trip to confirm something the mockup shows.
- **The pattern worth carrying into the report:** this is the third finding of the shape "a rule runs
  and nothing renders it", after handoff 07's traps and handoff 11's roll steps, and it is the first
  one a design brief found by **reasoning about the stylesheets** rather than by looking at a screen.
- → Ch. 04

### 2026-09-04: The menu's screen description got its own file, and `overlayButton` had to split

- **Chosen:** `src/ui/menu-screen.js` for the description, on the `pool-screen.js` precedent, and a
  shared `buttonShell` plus an `overlayDoor` branch inside `overlay-view.js`.
- **Why the file:** `overlay-screens.js` says of itself that it stays a switch, and the menu stopped
  being the one-line function it had been: three doors, three label keys, three hint keys, three
  drawings and a paragraph explaining why two of them are `disabled`. `pool-screen.js` set the
  precedent that a screen with more content than a switch entry earns a file. Both files are pure and
  import no jQuery, which is what keeps them unit-testable under `environment: "node"`.
- **Why `overlay-view.js` changed, against the delivery note.** The note claims "nothing changes in
  `overlay-view.js`", and that is true only of the `focusOverlay` call it had actually checked, which
  is correct as written because Hotseat is first in the DOM. `overlayButton` passed the label as the
  button's **own text**, and a door has three children, so it could not build one. Worth recording as
  a process point: the delivery checked the one function the brief had offered to change and did not
  check the one it had not.
- **Rejected:** *branching on `description.screen` inside `overlay-view.js`.* It reads more directly
  and it breaks that file's one promise, which its header states: it renders a description and knows
  nothing about screens. Branching on a **field**, the presence of `hint`, keeps the promise and means
  any future screen that wants a two-line button gets it without touching the component.
- → Ch. 04

### 2026-09-04: A bot is a fourth layer, `src/ai/`, and not a module inside `state/` or `ui/`

- **Chosen:** a new top-level layer, `src/ai/`, sitting between `ui/` and `state/`. It may read
  `state/` and ask `core/` about the rules; it may never import `ui/` or `i18n/`, touch jQuery or
  reach a DOM global. `ui/` may import `ai/`. The dependency arrow is `ui -> ai -> state -> core`.
- **Why not `state/`:** a strategy is neither a rule nor a transition. A different strategy still
  produces a legal game, and `decide()` writes nothing at all: it returns an intent, exactly as a
  jQuery click handler does. Putting it in `state/` would mean the one writable source of truth also
  held opinions about good play.
- **Why not `ui/bot.js`:** `ui/` is deliberately not unit tested, and the single most valuable test of
  a bot is a whole match played out with no browser. Under `environment: "node"` that is a one-second
  test; inside `ui/` it would have been a four-minute Playwright run, which is the difference between
  a test that runs on every commit and one that does not.
- **Rejected:** *no layer at all, with the policy inlined into `game-loop.js`.* It is fewer files and
  it is what a first draft would do. It loses the unit test, it pushes a 287-line file over the limit,
  and it puts "which pawn is worth moving" in the same file as "when does the timer fire".
- **Consequence:** three ESLint blocks instead of two, `src/ai/**` added to the coverage floor, and one
  rule stated in `CLAUDE.md`: a bot is a player without a screen. Time is `ui/`'s, never `ai/`'s.
- → Ch. 04, Ch. 06, Ch. 07

### 2026-09-04: Bot seats are a list on the state, written once by `startMatch`

- **Chosen:** `state.bots`, a sorted list of seat numbers, `[]` by default, set at `createGameState`
  and carried over by `restartMatch`. `state/bots.js` owns the rule that turns a *count* into that
  list: the last M seats, so the person at the keyboard keeps seat 0.
- **Why a list and not the count:** it follows `seats`, which exists for the same reason. State asks
  `core/` once and every later reader reads the answer instead of re-deriving it. "The last two of the
  seats in play" copied into the HUD, the labels, the loop and two guards is a rule that drifts.
- **Rejected:** *a `controllers` map, `{ 0: "human", 2: "bot" }`.* It is a second truth about who is
  playing beside `seats`, and object keys are strings, so `Object.entries` returns `"0"` and every seat
  comparison downstream quietly stops matching. `skillHands` had already cost an afternoon that way.
- **Rejected:** *storing only the number of bots.* Cheaper to write and it moves the derivation into
  five readers.
- **Consequence:** `startMatch` has a fifth positional parameter. That is one too many, and the file
  now names the trigger for converting it to an options object: the day FR-46's rule toggles ask for a
  sixth. An all-bot match is legal in `state/` on purpose, because the regression test needs one; "at
  least one human" is checked where a human types the number.
- → Ch. 06

### 2026-09-04: The bot plays no skill cards and declines every reaction window

- **Chosen:** in the action phase the bot always dispatches `skip-action`; in any open window it always
  dispatches `decline-reaction`. Agreed with the Product Owner when the work was planned.
- **Why:** card tactics need a value model for 36 different cards, several of which are only worth
  playing in response to something a *person* is about to do. That is a piece of work in its own right
  and it is not what FR-43 asks for. What FR-43 asks for is a seat that takes a legal turn without human
  input.
- **Why it is written into the acceptance criterion and tested rather than left as a comment:** the
  difference between "the bot chooses not to play cards" and "the bot cannot play cards" is invisible
  from the outside, and only the first one is a decision. `bot-match.test.js` plays four bots on the
  full pool and asserts the discard pile stays empty.
- **Rejected:** *a first pass at card play, picking any playable card at random.* It would look like
  tactics without being any, and a bot that plays Hold Pawn on itself is worse than one that plays
  nothing.
- **Consequence:** a bot's hand fills up over the match and is never spent. Whether that hand should be
  face down like a person's is a Design question, filed as D82 and D83.
- → Ch. 01, Ch. 06

### 2026-09-04: The bot's dice choice averages every face instead of taking the best case

- **Chosen:** `expectedScore` is the **mean** best-move score over faces 1..n, and a face that produces
  no legal move counts as a zero in that mean.
- **Why:** a pawn leaves the start area only on the die's maximum (FR-09), so at the beginning of a
  match a D2 and a D20 have the *same* best case: one pawn out of the yard. Scoring by best case makes
  the two indistinguishable and the bot picks whichever card it happened to see first, every time.
  Averaging asks the useful question instead, how *often* the die does something good, and the bot
  picks the D2, which is what a person does.
- **Rejected:** *the maximum over the faces.* Simpler, and wrong in the single most common position of
  the game. Also rejected: *weighting by how likely a good outcome is, on top of the average*, which is
  the same information counted twice.
- **Consequence:** ties go to the smaller die, because a smaller die overshoots the exact count into the
  house (FR-13) less often, and when a big die is genuinely better the advance term has already said so.
  Cost is 240 pure evaluations per turn, hidden behind an animation.
- → Ch. 06

### 2026-09-04: The hand-over screen is skipped when no second person is going to take the keyboard

- **Chosen:** `onHandover` in `match-flow.js` asks `handoverNeeded(state, seat)` and passes the turn
  itself when the answer is no. Two cases: the next seat is a bot, or there is only one person in the
  match at all.
- **Why:** the screen exists to keep an opponent's five skill cards secret while a device changes hands
  (D33). A bot is not handed anything, and a soloist never puts the mouse down, so in both cases the
  screen is a click charged for nothing.
- **Consequence, and it is a rule change rather than a convenience:** with one human and three bots the
  hand-over screen never appears in the whole match. Worth stating plainly, because D33's argument is
  simply absent in that configuration rather than overridden.
- **Why the flow and not the loop:** the loop's own comment already says that who decides the screen has
  changed hands is a question about the person in front of it and not about the turn. The flow owns the
  screens and is already handed `nextSeat(state)`.
- **Rejected:** *keeping the screen and letting it pass itself after a moment.* It preserves one shape
  for every turn and it puts an overlay in front of a solo player three times per round for no reason.
- **Unchanged on purpose:** the hold **before** the screen. A move still has to finish arriving and a
  refusal still has to be readable, whoever plays next; only what happens after the hold is different.
- → Ch. 04

### 2026-09-04: The bot's pause borrows `--motion-roll-hold` until Design answers D81

- **Chosen:** `holdBot` reads the existing `--motion-roll-hold` token, with 900 ms as the no-stylesheet
  fallback, and `FAST_DELAYS` gains `bot: 0`.
- **Why a pause at all:** the bot decides instantly, and instantly is unreadable. Without one, a bot's
  whole turn is painted inside a single synchronous pass and a player watching three opponents sees the
  board jump from their own move to their next one. That is D70's argument about the roll, applied to a
  whole turn.
- **Why that token:** `CLAUDE.md` is explicit that Claude Code does not invent design rules, and a
  duration in `tokens.css` is one. `--motion-roll-hold` already means "reading time for a decision the
  turn hangs on", which is exactly this, so borrowing it states the intent without deciding anything.
- **Rejected:** *a constant inside `bot-driver.js`.* Not overridable, so every end-to-end run with a bot
  would pay 900 ms per intent, and a duration outside `tokens.css` is what D20 and D70 were raised to
  remove. Also rejected: *inventing `--motion-bot-hold`*, which is Design's call and is asked as D81.
- → Ch. 04

### 2026-09-04: `readOptions` moved out of `main.js` so that it could be tested

- **Chosen:** `src/options.js` holds `readOptions` and `FAST_DELAYS`. `main.js` is still the only caller,
  and its header's claim becomes "read once, by the composition root".
- **Why:** not the line count, which was 204. Importing `main.js` from a unit test pulls in jQuery,
  twenty stylesheets and a `boot()` call at module level, so the address bar had never been unit tested
  at all. Issue #43 added a fifth option with real arithmetic in it, which made the gap worth closing.
- **Consequence:** `src/options.js` is listed **by name** in ESLint's browser-globals block for one
  identifier, `URLSearchParams`. By name and not as `src/*.js`, so a future non-browser module at the top
  of `src/` does not inherit a DOM by sitting next to it.
- **Rejected:** *testing `readOptions` through Playwright by loading URLs.* One browser run per malformed
  value, to test string parsing.
- → Ch. 07, Ch. 08

### 2026-09-04: `bindMatchEvents` was the seam that paid for the bot driver, not the header comment

- **Chosen:** `game-loop.js` made room by grouping its five `bind*` calls into `bindMatchEvents` in
  `events.js`, by replacing three identical stop blocks with a local `halt()`, and by naming the six
  things every waiting sibling needs as one `wiring` object.
- **Why it is a seam and not compression:** those five bindings are exactly the regions rebuilt with
  every match, while the chrome and the overlay live for the whole session and are still bound by the
  flow. The three stop blocks were literal copies, and each was a place a fourth sibling had to be
  remembered. `wiring` had been written out three times before it was about to be written a fourth.
- **Rejected:** *deleting comments to get under 300 lines.* `CLAUDE.md` forbids exactly that, and the
  file's header is the only place the loop's contract with its four siblings is written down.
- **Consequence, stated because it will come back:** `game-loop.js` is at **exactly** 300 lines. The next
  thing that goes in has to take something out first.
- → Ch. 04

### 2026-09-04: FR-43 dropped the LLM, and doing so resolved a contradiction with FR-03

- **Chosen:** FR-43 becomes *local, rule-based bot opponents* and rises from `C` to `S`. FR-01's lower
  bound becomes one person. FG-18 is reworded and raised with it. FR-03 is untouched.
- **Why the rise was forced rather than chosen:** US-01 gives a match a lower bound of **one** person,
  and that bound is only playable if the other seats play themselves. A `could have` that a `must have`
  depends on is a broken dependency: cut FR-43 and FR-01 becomes unbuildable.
- **Why the LLM went:** FR-03's acceptance criterion is a match completed *without any network
  connection*, and an LLM-backed bot needs a network call. The two requirements had contradicted each
  other since both were written, and it stayed invisible because FR-43 was a `could have` nobody was
  building. Worth naming in the report: **the traceability column is what made it visible**, and it is
  the second time in this project that writing a document found a defect in another document.
- **Rejected:** *keeping the LLM and giving FR-03 an exception.* It buys a network dependency, an API
  key, a failure mode and a per-request cost, and it makes "plays without a network" false for exactly
  the configuration a single player uses.
- **Consequence, stated rather than implied:** the bot is built, and **choosing one is still a URL
  parameter**. Issue #76 covers the setup screen and is deliberately blocked on D86 of design brief 13,
  so that a screen does not get invented in code.
- → Ch. 01

### 2026-09-04: The "bot plays no skill cards" decision is superseded, the same day

- **Chosen:** the decision taken this morning with the Product Owner is replaced. A bot now plays
  Action cards in its own turn and Reaction cards in other people's, on a rule-based value model.
- **Why so soon:** the consequence that block itself predicted turned out to be the whole problem. A
  bot's hand filled to its limit of five and was never spent, and one person against three bots played
  a game whose entire card mechanic, which is what makes Ludo Advanced a variant rather than Ludo, was
  present for exactly one seat.
- **What the earlier block got right, and it is worth keeping in view:** its rejected alternative was
  *"a first pass at card play, picking any playable card at random"*, on the grounds that it would look
  like tactics without being any. That is still true, and it is what shaped this work: the value model
  exists so that the bot's card plays are explainable in one sentence each.
- **Rejected:** *waiting for a separate issue in a later sprint.* Issue #82 already existed on the
  board (Enhanced Mechanics Bot Creation, a sub-issue of #80), and the missing mechanic was in the
  build a person would actually play.
- → Ch. 01, Ch. 06

### 2026-09-04: A card's value is in the same units as a move, and the threshold is what makes it a choice

- **Chosen:** every card value is expressed in the units of `SCORE` in `ai/move-scoring.js`, and a card
  is played only when its value clears `PLAY_AT` (4 points), dropping to 1 when the hand is full.
- **Why one currency:** "Angel Die on a D6" and "Yeet the leading pawn" have to be rankable against
  each other **and** against doing nothing. Two scales would need a conversion factor that nobody could
  justify, and the move scorer's scale already exists and is already tuned by the bot-against-bot test.
- **Why a threshold at all:** the card budget is one card per turn (FR-23), so a cheap play spends the
  only slot the turn has. Without a threshold the bot empties its hand and plays Lock In on a pawn that
  nobody is chasing.
- **Why the threshold drops at a full hand:** `drawSkillCard` refuses a draw into a hand of five and
  the card stays in the pool, so holding on has stopped buying anything at all.
- **Rejected:** *a scale of its own per card family.* More natural per card, and it makes every
  comparison between families a guess.
- **Rejected:** *play the best playable card every turn.* Simple, and it is the "looks like tactics"
  bot the earlier decision had already argued against.
- → Ch. 06

### 2026-09-04: Damage to one opponent counts as a share, one over seats minus one

- **Chosen:** in every card value, harm done to one opponent is multiplied by `1 / (seats - 1)`. Own
  gain, and a pawn of my own saved from a capture, count in full.
- **Why:** in a two-player match an opponent's loss is my gain outright. At a four-player table the
  other two players benefit from it exactly as much as I do, so paying a card for it is a third as good.
- **What it buys:** reaction cards are sharp in a duel and rare in a crowd, and Ragebait, Yeet, the four
  traps and all seven Reactions get that behaviour from one shared line rather than from seven special
  cases.
- **Rejected:** *counting an opponent's loss in full.* It makes a four-bot match a card fight in which
  nobody advances, and it is wrong in a way a player can feel.
- → Ch. 06

### 2026-09-04: The bot asks a card its own rule rather than copying it

- **Chosen:** the seven cards whose whole effect is a roll modifier are priced by calling the real
  effect from `core/cards/effects/` and reading the modifiers back, then computing the roll's
  distribution in `ai/roll-odds.js`.
- **Why:** the roll chain has an order that is easy to get subtly wrong. 67's threshold is applied
  **before** Speedrun's multiplier so that a 3 doubled to 6 cannot pass a test it failed, FR FR's named
  number is clamped to the die, and two Angel Dice add two D8s while two Speedruns do not square the
  roll. A copy of that in `ai/` is a second rulebook that is free to disagree with the first.
- **What made it possible:** those effects are pure functions of a snapshot and draw nothing from the
  RNG, so running one to find out what it would do costs nothing and changes nothing.
- **The one place duplication remained, and why:** `ai/roll-odds.js` walks the same six steps as
  `core/roll.js` over probabilities instead of dice. The alternative was to roll the real chain a few
  hundred times with a throwaway RNG, which puts randomness into the one layer whose whole property is
  that it has none (NFR-09: `?seed=42` has to replay a match). The drift risk is covered by a test that
  knows the closed forms independently.
- → Ch. 06

### 2026-09-04: The bot does not cheat, and a test enforces it by experiment

- **Chosen:** a bot reads the board, the statuses, the traps, its own hand, the chosen dice card, the
  modifiers, `pendingCard`, `pendingMove`, the open window, and **how many** cards each other seat
  holds. It never reads which cards they are.
- **Why the count is allowed:** decision D33 of 2026-09-01 made the count public and the HUD prints it
  for every seat, so a bot reading it reads the screen. Tax Fraud aiming at whoever holds the most cards
  is a play a person can make.
- **Why it is a test and not a comment:** `state.skillHands[1]` is one line of plausible-looking code
  away in any value function, and a bot that peeked would pass every other test in the suite while
  playing a game the person in front of it cannot. So `card-choice.test.js` decides the same board twice
  with completely different cards in the opponents' hands and asserts the answers are identical, plus a
  second case proving the public count still changes the answer, so the first cannot be satisfied by a
  bot that ignores the other seats entirely.
- **Rejected:** *reading the hands, on the grounds that a bot is not a person.* It makes the bot
  unbeatable in exactly the situations where the card mechanic is interesting, and it is undetectable
  from the outside, which is the worst combination for a feature the report has to justify.
- → Ch. 06, Ch. 08

### 2026-09-04: Two of the 29 cards are never played, as a recorded finding

- **Chosen:** Oil Spill in `values-squares.js` and The Purge in `values-window.js` return `null`,
  meaning "never play this".
- **Why Oil Spill:** it slides whoever steps on it three to five squares **forwards**. On almost every
  board that is a gift to the victim. The one board where it is good needs the victim's exact distance
  from their own house plus the slide distribution, for a card that is a mistake everywhere else.
- **Why The Purge:** it suspends the rule that an own pawn blocks, board-wide, for a round, for
  everybody including the player who played it. There is no one-step reading of that: its value depends
  on four seats' positions at once, and any number put on it would be a guess dressed as a model.
- **Why `null` and not a large negative number:** `null` says "do not play"; a number says "worth this
  much", and a full hand lowers the threshold to 1, where a badly guessed number would get played.
- **How a missing value is told apart from a deliberate one:** `ai/card-values.js` throws at **boot**
  for a card id with no entry in the table, on the pattern of `assertCatalogue` and
  `core/trap-fire.js`. So the 30th card added to the catalogue stops the game on the day it is added,
  and the two deliberate refusals are entries like any other.
- → Ch. 06

### 2026-09-04: A bad bot target becomes a pass, never a refused intent

- **Chosen:** each card value picks its own target, and `card-choice.js` then asks `checkTarget`, the
  same function the dispatcher asks. A target the rules would refuse makes the card unplayable and the
  bot considers the next one.
- **Why the asymmetry with a person:** a refused click is a message on screen and the player tries
  something else. A refused **bot** intent stops `ui/bot-driver.js`, leaves the phase unchanged, and
  parks the match for ever, so the symptom of a small arithmetic slip in one value is a game that
  freezes with no error.
- **Why it is not a licence to be sloppy:** `card-values.test.js` sweeps all 29 cards on a busy board
  and on an empty one and asserts the target is legal before the guard ever runs, and
  `bot-match.test.js` asserts over whole matches that no bot intent is refused.
- **The one simplification recorded with it:** the It's Not That Deep aura is checked once in
  `card-choice.js` for all six offensive cards, and a card whose best target sits inside an aura is
  dropped rather than re-aimed at the best square outside it.
- → Ch. 06, Ch. 08

### 2026-09-04: Double Dip is net zero, and the finding goes to the Product Owner rather than into a fix

- **Chosen:** the bot prices Double Dip as "make room in a full hand", worth 1, and the rule is left
  exactly as it is.
- **The finding:** `spendCard` counts Double Dip itself against the budget of one, and the card's effect
  then sets the budget to two. That leaves exactly one further play, which is the play the seat had
  before the card was played. `core/cards/effects/card-effects.js` states in its own header that the
  card "has to be net positive to be worth anything, and it is". It is not.
- **Why it is not fixed here:** which of the two readings is the rule is the Product Owner's call, not
  a bug with an obvious correction. Setting the budget to three, or not counting the card itself, are
  both defensible and both change the card's power.
- **Rejected:** *saying nothing and letting the bot price it as a second card.* The bot would then play
  Double Dip expecting a play it does not get, which is a wrong value hiding a wrong rule.
- → Ch. 01, Ch. 06

### 2026-09-04: A bot's card play is announced in the message strip, and it ships in the wrong colour

- **Chosen:** a fourth kind of message, `card`, on the strip that already says three kinds of thing.
  One locale key per language, no new component, no new token, and the reading time is the existing
  `--motion-trap-hold`.
- **Why an announcement is needed at all:** a card played by somebody who is not at the keyboard is
  invisible. Built Different writes a status, No Take-Backsies shuts a window nobody was going to use,
  and a nullified card does nothing whatsoever, so without a sentence the player watches their pawns get
  shoved around by nothing.
- **Why the strip and not something new:** `CLAUDE.md` is explicit that Claude Code does not invent
  design rules, and a component is a design rule. `data-message-kind` is a seam that already exists and
  that a third kind was added to on 2026-09-03, so this is the fourth use of a pattern rather than a new
  idea.
- **The deviation, stated rather than discovered:** no stylesheet reads `data-message-kind="card"`, so
  the sentence appears in `--color-warn`, the colour the game reserves for "you cannot do that". A bot
  playing a card is not a refusal. This is exactly the deviation issue #45 shipped for the trap
  announcement; D55 answered that with two selectors, and D87 of brief 14 is the same shape.
- **Rejected:** *inventing the two selectors here.* It is one line of CSS and it is still a design
  decision about what the game's second voice looks like, and the last time this side guessed at a
  design rule the guess was the thing the handoff had to undo.
- **Rejected:** *announcing nothing and letting the board speak.* For a third of the cards the board
  says nothing at all.
- → Ch. 04

### 2026-09-04: The card a bot played is a field on the state, not a variable in `ui/`

- **Chosen:** `lastCardPlayed`, `{ seat, cardId }`, written by both card intents and cleared at the
  handover with the rest of the turn-level fields.
- **Why in the state:** the message strip is drawn out of the state object and nothing else. A fourth
  piece of presentation state threaded through `render` would be one refresh out of step with the board
  it describes, and `nullifiedCard` and `trapFired` are already exactly this kind of field for exactly
  this reason.
- **What is unusual about it, named so it is not read as a mistake:** it is the first field in the state
  object that carries **no rule**. Nothing in `core/` or `state/` reads it and a match plays out
  identically without it.
- **Why it is written when the card leaves the hand and not when its rule runs:** an Action card that
  somebody can answer waits in `pendingCard` while a window is open, and the moment worth announcing is
  the moment somebody did something.
- **Consequence:** two lines of `state/` shipped inside a `ui/` commit. Splitting them out would have
  produced a commit that adds a field nothing reads, and the commit before it touches neither file.
- → Ch. 04, Ch. 06

### 2026-09-04: `holdMidTurn` gained a third source and `holdAfterTurn` deliberately did not

- **Chosen:** `announcement(state)` is unchanged; a new `midTurnAnnouncement(state)` adds a bot's card
  play on top of it, and only the mid-turn hold asks the new one.
- **Why the asymmetry:** the card already had its two seconds where it happened. Holding for it again at
  the handover would add four seconds to the end of every bot turn that played a card, which is most of
  them, and the four seconds is a **refusal**'s reading time (D20) rather than a report's.
- **Why a person's own card play is not announced at all:** they clicked the card, answered the target
  picker and pressed the last button. Telling them what they just did would cost two seconds per card in
  every match, including the all-human ones, for information they have already got.
- **Rejected:** *one function with a flag.* The two callers want different answers, and a flag makes the
  caller responsible for a decision that belongs to this module.
- → Ch. 04

### 2026-09-04: The announcement spec records the attribute instead of polling for it

- **Chosen:** the end-to-end case installs a `MutationObserver` on the message strip, records every
  value `data-message-kind` ever takes, and asserts against that list. It runs under `?fast=1`.
- **Why the first version was thrown away:** it polled for `data-message-kind="card"` at real speed and
  spent sixty seconds not seeing one. Two reasons, and neither is a bug: the announcement is on screen
  for two seconds, so a poll has to land inside that window, and the early turns of a match are quiet on
  purpose, because with every pawn still in the yard almost nothing is worth playing.
- **What the observer buys:** a race becomes a list, the case runs at full speed, and it asserts more
  than the poll could, both the kind and that the sentence names "Bot 2" rather than "Spieler 2".
- **What it gives up, and where that is covered instead:** it no longer proves the announcement is on
  screen for two seconds. That is a duration nothing on screen reports, which is precisely the argument
  `mid-turn-hold.test.js` was written for, and the unit case pins both halves of it.
- → Ch. 04, Ch. 08

### 2026-09-04: The card being read gets its own layer, above every other card layer

- **Chosen:** a fifth card layer, `--layer-card-reading: 4`, read only by the three reveal selectors in
  `card-reveal.css`. Reading a card is the one state that has to sit on top of every other card,
  including a selected one, so it is a layer of its own rather than a re-use of `--layer-card-raised`.
- **The defect it fixes, and why it is worth writing down:** design handoff 10 § 3 argued that the
  revealed card is above the dice plate because `.app__skill` follows `.app__dice` in the DOM, "with no
  `z-index` needed". That is true of the plates. It is false of the cards inside them, because
  `card.css` gives every card `position: relative` plus a `z-index`, which makes each card a stacking
  context, while neither plate sets either property and so neither is one. Both hands therefore compete
  in one z-index space, where the number is compared before the document order: the chosen dice card at
  `--layer-card-selected` (3) covered the card being read at `--layer-card-raised` (2). A correct rule,
  applied one level too high.
- **Rejected:** *`isolation: isolate` on `.app__dice` and `.app__skill`,* which makes the plates the
  stacking contexts the spec assumed and lets DOM order decide. It fixes only half: two cards in the
  **same** plate, a selected skill card and a revealed neighbour, still collide, and that half was
  broken too. It also moves the fix into `app.css`, a stylesheet the design side owns and handoff 10
  did not deliver.
- **Rejected:** *raising `--layer-card-raised` from 2 to 4.* Every hovered card in both hands would rise
  above every selected one, and the selected dice card is the one thing on screen that says which die is
  about to be rolled.
- **How it is tested:** `document.elementFromPoint` in the middle of the two cards' overlap, not a
  computed `z-index`. The numbers 2 and 3 only mean something together with the stacking contexts around
  them, and misreading those contexts was the bug. The case fails against the unfixed stylesheet.
- → Ch. 04

### 2026-09-05: `poolCounts` was the seam that made room for the line-up screen

- **Chosen:** move `poolCounts()` out of `match-flow.js` into `pool-screen.js` as `poolCountsFor(deps)`,
  before any of the line-up work. `match-flow.js` was at 287 of 300 lines (NFR-02) and the feature adds
  about fifteen.
- **Why that function and not another:** it is the only thing in `match-flow.js` that is a **pure
  function of `deps`** rather than an operation on the session. Everything else in the file reads or
  writes the screen, the loop, the state or the pool. It also touched no closure variable it wrote to,
  which is the same test `session-actions.js` passed when it was split out, so this is a move rather
  than a rewrite.
- **Rejected:** *splitting `match-flow.js` along the screen boundary instead*, which is the larger and
  more obvious seam. It would be the right split for a bigger file, and doing it under the pressure of
  a feature is how a good seam gets spent badly. The 300-line limit is met with fourteen lines to spare
  without it.
- **Rejected:** *compressing the file's comments to make room.* NFR-02 says to split along a real seam
  and not to shrink a file by deleting the part that explains it.
- **What it bought beyond the lines:** three unit tests. The function was covered only through
  Playwright, because it lived in a closure that needs jQuery to build. One of the three checks the
  property its own comment claimed and nothing verified: the count is asked of the dice source on every
  call, so it cannot go stale between two draws.
- → Ch. 04

### 2026-09-05: The line-up's FR-01 rule lives in `state/` and takes arrays, not a state

- **Chosen:** `canBeBot(seats, bots, seat)` and `toggleController(seats, bots, seat)` in
  `src/state/bots.js`. Pure, two arrays in, an answer or a new array out.
- **Why `state/`:** "the last person may not become a bot" is a rule about who is playing, which is the
  sentence that file's header already uses to explain why `botSeatsFor` is there. A rule inside a click
  handler cannot be unit tested without booting jQuery.
- **Why arrays and not a state object, unlike `isBot` and `humanSeats` directly above them:** there is
  no state. A player halfway through a line-up has not started a match, and `createGameState` has no
  field for a match that has not started. The asymmetry is commented in the file on purpose, because it
  is the kind of thing that gets "tidied up" later by someone who has not noticed there is no match.
- **Chosen:** `toggleController` returns the list unchanged when it refuses, rather than throwing. The
  caller is a click, and a refused click on a menu is normal. `assertBotSeats` keeps the throwing job:
  it is asked once, at the moment a match is built, about a list that has already been decided.
- **Rejected:** *putting the rule in `src/ui/lineup.js` with the rest of the screen's memory.* It would
  have been one file instead of two, and it would have put a requirement in the layer that is covered by
  Playwright rather than by unit tests.
- **Rejected:** *reusing `botSeatsFor` for the screen.* It computes bot seats from a **count**, and D95
  lets the player put the bot on seat 0, so the screen produces the set directly. `botSeatsFor` stays
  exactly as it is for `?bots=`, and both routes end at the same `startMatch` argument.
- **Note:** FR-01 is now guarded twice, in `options.js` for the address bar and on the screen for the
  menu. Two entry points, two guards, one requirement.
- → Ch. 06

### 2026-09-05: The half-made line-up is view state in its own file

- **Chosen:** `src/ui/lineup.js`, a small closure with `begin(count)`, `toggle(seat)` and `snapshot()`.
  It holds no jQuery and no `t()`, so it is a unit test, and the one rule it needs comes from
  `toggleController` in `state/bots.js`.
- **Why not the game state:** a player halfway through a line-up has not started a match, so there is
  nothing for `state/` to hold. Fourth time this project has answered that question the same way, after
  the screen itself, a half-finished card play, and the pool's own count.
- **Rejected:** *two more closure variables in `match-flow.js`.* The obvious thing. It loses on the
  300-line limit and, more importantly, on testability: a rule inside the closure that owns the loop,
  the pool and the state cannot be checked without booting jQuery.
- **Rejected:** *`session-actions.js`.* Its header promises neither function touches a variable, and
  that promise is what made it splittable in the first place.
- **Rejected:** *a `lineup` field on the frozen game state.* It would put a fact about a button in
  `core/`.
- **The case that earned its own test:** `begin` forgets the previous line-up completely. Going back to
  the count screen and picking 2 after setting three bots on a four-seat line-up must not carry bots
  into seats that do not exist.
- → Ch. 04

### 2026-09-05: A unit test written from the spec found the spec wrong, not the code

- **The claim:** design handoff 15, § D96.2 and mockup 15c, says a two-player line-up reads
  "Spieler 1 (Rot)" and "Spieler 3 (Grün)", with no Spieler 2, and draws it that way on purpose as
  "the case a four-row drawing hides".
- **What it actually reads:** "Spieler 1 (Rot)" and "Spieler 2 (Grün)". `displayNumber` in
  `player-labels.js` counts the seat's **position in `state.seats`**, not the seat number, and that
  file's header records "Spieler 1 and Spieler 3 with no Spieler 2" as the two-year-old off-by-one it
  was created to remove.
- **Nothing had to change.** The spec's instruction is to reuse `player.named` and `player.botNamed`,
  which is what is built. Only the worked example is wrong, and the pairing that made the case worth
  drawing survives anyway: Spieler 2 is **green**, because the colour is keyed on the seat and the
  number on the position.
- **How it was found:** a unit test written straight from the spec's sentence failed against correct
  code. That is the cheapest place this could have been caught, and it argues for writing the spec's
  own examples down as assertions rather than reading past them.
- **Reported to the Product Owner** rather than corrected in the delivered spec, since
  `01-Design/Handoff/` is the design side's document.
- → Ch. 04

### 2026-09-05: The count click stopped starting a match, which is the whole flow change

- **Chosen:** `OVERLAY_ACTION.PLAYERS` opens the line-up screen with that count instead of calling
  `freshMatch(count)`. One line in `session-actions.js`, and it is the only invasive change the whole
  feature makes. **No file in `core/` and no file in `ai/` was touched.**
- **Why it had to move:** the computer was reachable only through `?bots=` in the address bar. A screen
  that says who plays each seat cannot come before the count, because the count is what fixes how many
  seats there are to talk about, so the count click could no longer also start the match.
- **Rejected:** *one screen that grows, D90.2*, with the counts at the top and rows appearing under
  them. It saves a click and shows the consequence of the count immediately. It loses because it has to
  answer what happens to four set rows when the player then clicks 3: whichever way that is answered,
  the player has done work the screen throws away. Two screens make that a Back, which is a gesture the
  player chose rather than a consequence they discovered.
- **The cost, stated plainly:** the menu route is three clicks deep now, menu, count, line-up, Start.
  Nothing in this game is entered from cold more than once per session, so the click is cheap, but it is
  the sort of thing a retrospective notices without remembering why it was chosen.
- **What it cost the suite:** six clicks in three end-to-end specs, one added Start click each. The
  sixteen specs that boot with a player count in the address bar were untouched, which is what that
  parameter was kept alive for.
- → Ch. 04, Ch. 08

---

### 2026-09-05: `match-flow.js` had to be split twice in one feature, and the second seam was the line-up

- **What happened:** step 1 of the plan moved `poolCounts` out to make room, freeing fourteen lines. The
  line-up's three operations plus their reasoning then cost thirty-five, and the file went to 322 of the
  300-line NFR-02 limit.
- **Chosen:** move `open`, `setController` and `begin` into `lineup.js` as `createLineupFlow(session)`,
  beside the memory they change. `match-flow.js` came back to 295 and `lineup.js` went to 157.
- **Why that seam is real and not just convenient:** `match-flow.js` owns a **session**, and setting up
  a line-up happens before there is a session to own. It is the one thing on that file's plate that is
  not about owning one, which is the same test `session-actions.js` passed when it was split off.
- **Rejected:** *a third file for the three operations.* `lineup.js` already holds the line-up, the
  operations are a sentence each, and a file holding only them would be a wrapper.
- **Rejected:** *trimming the comments on the three new functions to fit.* NFR-02 asks for a split along
  a real seam and explicitly not for shrinking a file by deleting the part that explains it.
- **The estimate that was wrong, and why it is worth recording:** the plan budgeted "roughly fifteen
  lines" for the feature in `match-flow.js` and the real figure was thirty-five. The gap is entirely
  documentation: the three functions are two lines each and their reasoning is twenty. That is the
  project working as intended and it should be budgeted for next time.
- → Ch. 04

---

### 2026-09-05: `session.lineup` is an object where every other entry is a function

- **Chosen:** `createSessionActions` receives `lineup` as one object with three methods, next to six
  plain functions. `session-actions.js` calls `session.lineup.open`, `.setController` and `.begin`.
- **Why:** three separate entries would have been three names for one screen, and `session-actions.js`
  would then be the only place that knew they belonged together. The grouping says where they come from.
- **Rejected:** *flattening them into `openLineup`, `setController` and `beginFromLineup`.* It keeps the
  interface uniform, which is worth something, and it hides that the three are one module's public face.
- → Ch. 04

---

### 2026-09-05: A click on the line-up sets a value, it does not flip the row

- **Chosen:** each row has two named positions and a click says **which** one it is, through
  `data-value`. `bindOverlayEvents` passes it as a third argument, which handlers that do not need it
  simply do not declare.
- **Why it cannot be a toggle:** both positions are visible and live at all times (D91.2), so clicking
  "Spieler" on a row that is already a person is a real click on a real button. A toggle would turn that
  row into a bot, which is the opposite of what the player asked for.
- **Consequence in `state/`:** `toggleController` is still the function that holds the FR-01 rule.
  `lineup.js` calls it only when the requested value differs from the current one, so the rule is
  written once and the no-op is a guard rather than a second rule.
- **Rejected:** *reading `data-value` back out of the DOM inside the handler.* It would make
  `session-actions.js` touch an element, and its whole promise is that it does not.
- → Ch. 04

---

### 2026-09-05: `.overlay__seats:empty` was missing from the delivered stylesheet

- **What happened:** `lineup.css` arrived without a rule hiding the empty seat group. The group is built
  once and lives in the panel on all seven screens, and the panel is a flex column with a gap, so the
  other six would each carry a hole where the rows are not.
- **Chosen:** add the three lines, with a comment naming `pool.css` as the precedent and saying they are
  not a design decision. `pool.css` had already answered exactly this for the card region.
- **Why not ask instead:** the answer already exists in the project, in the same shape, for the same
  reason. Waiting for a spec to restate a rule the codebase has would be process for its own sake.
- **Reported to the Product Owner** rather than absorbed silently, because the file is the design side's
  and a stylesheet quietly edited on this side is how two trees drift.
- → Ch. 04

### 2026-09-05: The pawn's seat mark is deleted rather than turned into a dot

- **Chosen:** with the four seat shapes withdrawn (D97), the four other seat marks become dots and the
  pawn's mark is removed outright. `.pawn__mark` leaves `pawn.css` and leaves `board-view.js`.
- **Why the pawn is different from the other four:** it is the only one of the five that sits on a face.
  The mark was placed low and centred so that it cleared the two eyes, which is exactly what made it a
  mouth: four seats read as four expressions, and no legend explained them. The HUD plate, the chrome
  line, the win panel and the trap chip carry no face, so a dot there is a badge and reads as one.
- **What it costs, stated rather than absorbed:** NFR-12 asks that no fact be carried by colour alone,
  and this removes the only mechanism that answered it. In greyscale red and blue are 1.15:1 apart and
  green and red 1.26:1. A seat is still identifiable by words wherever it is named, and by position on
  the board's own furniture, but not on the shared track, which is 39 of the 40 track fields.
- **Rejected:** *a dot on the pawn too.* It would be a third circle under two eyes and would say nothing
  the disc's own colour does not already say.
- **Rejected:** *keeping the shapes behind `prefers-contrast` or a greyscale setting.* A cue that exists
  only under a setting is a cue the game is not designed around.
- **Booked as D99, and it is the Product Owner's:** re-tune the four seat colours so they differ in
  lightness as well as in hue, no pair closer than about 1.6:1. Eight values with the `-soft` partners,
  in two skins, so it is its own piece of work.
- → Ch. 04, Ch. 01

---

### 2026-09-05: The message strip moves to the rail, and the dice plate reserves the band it lands in

- **Chosen:** the strip hangs above `.app__skill` instead of off the bottom of `.app__board`, and
  `.app__dice` takes `padding-bottom: calc(var(--space-6) + var(--space-3))`, 44 px.
- **Why it left the board:** D35 put it under the board so that a message about a refused move sat over
  the pieces it was about. In play it covered two start areas and the last four fields of two tracks,
  and the board is the one region in the game that may not be covered.
- **Why the padding is not optional:** the strip is 46 px tall and the two plates are 16 px apart, so
  30 px of it lands inside the dice plate however it is nudged. The dice hand is centred and its cards
  run to the plate's edge, so that band is always card: a refusal cut the cards' tag row through the
  middle of the glyphs. Reserving it once is 44 px of permanent cost inside an existing plate, against a
  46 px grid row that would push the board, which is what D35 removed.
- **Rejected:** *capping the strip so its top cannot pass the dice plate.* A two line message would then
  grow downward onto the skill cards, which is the one direction the anchor makes impossible on purpose.
- **Rejected:** *below the skill plate.* That is the page edge at 1440 by 900 and off a scrolled page
  below the 84rem breakpoint.
- **Rejected:** *inside the skill plate as a flow item.* Row 4 is `auto`, so the plate would grow and the
  page would jump.
- → Ch. 04

---

### 2026-09-05: A whole-file stylesheet delivery is a diff whose base is unstated

- **What happened:** handoff 16 ships ten complete stylesheets and its README says to copy them over the
  files of the same name. Six of them are older than this tree, so copying would have silently reverted
  the 16:9 stage in `tokens.css` and `app.css`, `--layer-card-reading`, the `justify-content` fix in
  `chrome.css`, the `min-width` fix in `hud.css`, `position: absolute` in `overlay.css` and the `:empty`
  rule in `lineup.css`. A seventh, `refusal.css`, is the strip under the name it lost on 2026-09-03.
- **Chosen:** apply the changes rule by rule against our files instead, which is what § 1 of the spec
  itself asks for: "the selector named beside each rule is what to trust, not the line number".
- **Why not ask first:** the spec names every rule it touches and says why, so the intended change was
  unambiguous. What was ambiguous was only the delivery format, and that is answerable from the diff.
- **Consequence for the process:** a whole-file delivery carries an implicit base, and the base is
  whatever the design side last read. The two trees have now drifted twice. Worth naming in the
  retrospective and worth a line in the next brief.
- → Ch. 04, Ch. 11


---

## Challenges

- **2026-08-06: Reading the GitHub board took three attempts and two false leads.** The first
  attempt failed on four independent barriers at once (no MCP server visible to Claude Code, no `gh`
  CLI, no token, private repository), which made the cause hard to isolate: each one alone produces
  the same symptom. The second attempt failed in a more misleading way: the GitHub MCP server *had*
  been installed, so the reasonable conclusion was that it should work, but it had gone into VS
  Code's MCP registry rather than Claude Code's. Checking the config file directly rather than
  trusting "it is installed" is what resolved it. The board was finally read by parsing the page's
  embedded JSON, after confirming that Projects v2 GraphQL rejects unauthenticated requests even for
  a public project. Cost: roughly 30–40 minutes, most of it in the diagnosis rather than the fix.
  The lesson worth carrying into the report is that "the integration is installed" and "this
  particular client can see it" are different claims, and only the second one is testable.

- **2026-08-09: Undoing an unreviewed merge cost far more than the review would have.** Pull request
  #48 was merged into `dev` without approval. Reopening it was impossible, since GitHub closes merged pull
  requests permanently, and by the time it was noticed, four branches had been cut from the merge
  commit and all four carried the unreviewed work. The recovery was a rewrite of published history:
  `dev` force-reset one commit back, the four branches re-parented with `git rebase --onto`, five
  force-pushes, and every teammate obliged to re-fetch. What made it tractable at all was a property
  of the graph rather than any tooling: the merge commit's tree was identical to the commit it
  merged, so re-parenting could not change file content, and `git diff` against the old remote refs
  proved it before anything was pushed. The lesson for Chapter 11 is the asymmetry: the review that
  was skipped would have cost minutes, the undo cost an hour and a coordinated reset across three
  people. It is also the concrete argument for the branch-protection ruleset left open in Ch. 02:
  the control was absent twice in one day, and the second absence is what turned a process slip into
  a history rewrite.

- **2026-08-30: The first design handoff invalidated a whole day of finished, passing rules code.**
  Issue #26 closed on 2026-08-29 with `src/core/board.js` and 40 passing tests built on a 52-square
  track, because that is what section 2 of the game design document said and the plan for the sprint
  explicitly said no number in that file was to be invented. The design handoff that arrived the next
  morning was built on a 40-square track, and the two could not both ship. The plan had no step for
  this: it assumed the design would be drawn against the rulebook, so it scheduled the rules and the
  design in parallel precisely because they were not expected to interact. What made the recovery
  cheap in the source and expensive in the tests was the layering. `board.js` exports the topology as
  four constants and every other module derives from them, so `movement.js`, `capture.js`, `win.js`
  and `pawns.js` needed **comment changes only**. The tests were the opposite: roughly 30 assertions
  hold literal positions, because a test that recomputes the number it is checking is not a test. The
  end-to-end scripted match was the worst of them, since the roll sequence had to be re-derived by
  hand against the new house rule, which changes which pawn the strategy picks and where each one
  stops: 33 rolls instead of 44, and the four pawns finishing on four different squares instead of
  all on one. Cost: roughly an hour and a half, most of it in the test re-derivation. Two lessons for
  Chapter 11. The first is that the layering paid for itself here in a way no test could have proved
  in advance: a topology change that touched one file is the whole argument for `core/` having a
  single source for its numbers. The second is about the handoff itself: the brief told Claude Design
  that the numbers in section 4 were non-negotiable, and it changed them anyway and said so clearly.
  The spec being explicit about the contradiction, rather than quietly emitting CSS for a board
  nobody had agreed to, is what made this an hour and not a week.

- **2026-08-30: Swapping one default argument invalidated the entire end-to-end suite's inputs.**
  Issue #30 was planned as pure `core/` work: write `dice-pool.js`, point `matchDeps` at it, done.
  The unit suite agreed, and after handing the scripted tests an explicit `fixedDieSource()` all 205
  passed. Then Playwright failed. The cause was not a bug and not a rule: **the pool draws from the
  same injected generator the die rolls from**, so every `?seed=N` now plays a different match, and
  all five seeds in `tests/e2e/helpers.js` described situations that no longer happened. Two of the
  twenty-four Chromium specs failed on facts that had been true only for a fixed D6, one asserting
  `roll === 6` for "the maximum was rolled" and one assuming seat 0 wins. What made it cost more than
  it should have was a decision taken a day earlier and not written down: the original seeds had been
  found by a replay script that was used once and deleted, and the note describing them called the
  result "a fact" without saying how to reproduce it. So re-deriving five seeds meant rebuilding the
  tool first. Cost: roughly 45 minutes, almost all of it rebuilding `scripts/find-seeds.js`, against
  maybe 10 minutes to have committed it the first time. Two lessons for Chapter 11. The first is
  specific and repeatable: **when a change alters what a shared random source is spent on, every
  fixture derived from that source expires, whether or not any rule changed.** Nothing about the
  movement rules moved here, and the tests still broke. The second is about the earlier note itself:
  documentation that records a conclusion without recording how it was reached is exactly as
  expensive as no documentation on the day the conclusion stops holding. The script is committed now,
  behind `npm run test:seeds`, and the seeds are regenerated rather than maintained.

- **2026-08-31: The same failure happened again five days later, and cost five minutes instead of 45.**
  The skill square respawn draws from `deps.rng`, so every seed expired for the second time. Two
  Playwright specs failed across all three browsers, and the exact-final-state unit test failed with
  "scripted RNG exhausted". Both symptoms were recognised immediately, because the entry above
  describes them, and the routine fix was one command: `npm run test:seeds`.

  **This is the entry that shows the previous challenge was worth writing.** The lesson recorded on
  2026-08-30 was "when a change alters what a shared random source is spent on, every fixture derived
  from that source expires, whether or not any rule changed". It was not a hypothetical: it recurred
  within the week, from a completely different rule, and having the script committed turned an
  afternoon into a command. Worth naming in the retrospective, because the sample report the team
  models on lists late documentation as its own biggest weakness, and this is a small measured case of
  the opposite.

  One thing was not routine, and it is a second lesson. `win.spec.js` failed both times for a reason
  that had nothing to do with what it tests: it named seat 2 and the text "Spieler 3", because the seed
  happened to produce that. Repairing it by copying in a new seat number would have been the third
  time. So the view now exposes `data-winner` and the spec asserts the rule instead. **The general
  form: when a spec hard-codes a value the seed decides rather than a rule, the view is missing an
  attribute.** `data-die` was added for the same reason on 2026-08-30, which makes this a pattern
  rather than an incident.

- **2026-08-31: Landing one design spec turned up four defects, and only one of them was in the
  spec.** The five-item entrance check in `01-Design/README.md` says not to merge a spec unread. On a
  first look this delivery passed every item: nine decisions answered, each with a reason and a
  rejected alternative, no stylesheet over 300 lines, every `content:` declaration empty, every state
  in the contract styled. Reading it properly took about two hours and produced four separate problems.

  The first was the delivery undoing work. `board.css` came back with the 40 track-field grid
  placements inlined, which handoff 02 had already split into `board-track.css` for exactly the reason
  it recurred here: the designer writes single-line rules that fit the 300-line limit, and this
  project's Prettier expands them past it. 269 delivered lines became 429 formatted ones, and the 40
  rules briefly existed in two stylesheets at once with identical values, so nothing looked wrong. The
  fix was to restore the file from git, add only the 26 genuinely new lines, and then split it again at
  the next real seam, a field against a region that holds fields.

  The second was `body { margin: 0 }`, dropped from `app.css` between the placeholder and the delivery.
  Sixteen pixels, and it broke the one requirement the layout exists to satisfy.

  The third and fourth were not in the delivery at all and had been sitting there for two weeks.
  `playwright.config.js` set the viewport to 1440 by 900 with a comment explaining why, and every
  project overrode it to 1280 by 720 by spreading a Playwright device descriptor. Nothing failed,
  because the value only matters once something measures the page, and nothing did. Spec 03 introduced
  a breakpoint at 1344 px, which means the entire suite had been playing the stacked fallback layout.
  And `pawn-leaves-start.spec.js` held a live "first movable pawn" locator across the two clicks that
  end a turn, so after the handover it was asserting against a different pawn that happened to also be
  at `r = 0`; it had been passing on timing and the extra choose step broke it.

  Three lessons, and they are different from each other. **A delivery is a diff, not a file list:** two
  of the eight stylesheets differed from `src/` only in Prettier's line breaking and were correctly not
  copied, while one differed by 151 lines of duplicated work. Only the diff distinguishes them.
  **A configuration value that is silently overridden looks exactly like one that works**, and the only
  defence is a test that reads the setting rather than the behaviour, which `shell.spec.js` now does.
  **A claim nobody measures comes back:** "nothing scrolls" was written in two specs, five weeks apart,
  and was false when finally checked.

- **2026-09-01: A closed feature, a green suite, and a requirement that was not being tested.** Issue #30
  was picked up expecting to build a dice pool. The pool had shipped on 2026-08-30. The issue body was
  empty, its parent epic #37 was already closed, and five of the six requirements were satisfied. So the
  work became an audit, and the audit is what cost the unplanned time: roughly an hour, almost all of it
  reading FR-16 to FR-21 against the code and the tests one criterion at a time to build the traceability
  table.

  **It found one thing, and it was not a bug.** FR-20's criterion is "over a large sample each face
  occurs with frequency consistent with 1/*n*". The test under the heading `rollDie (FR-20)` asserted
  `seen.size === faces` over four thousand rolls: every face turns up at least once. A die returning the
  1 in ninety per cent of rolls would have passed it, at every denomination, every run. The test had the
  right name, cited the right requirement, sat in a file organised by requirement, and had been read and
  approved twice. Nothing was failing and nothing would have started failing.

  Fixing it was twenty minutes: a distribution test over 60,000 rolls and 90,000 dealt cards against a
  four-sigma binomial band, with pinned seeds, costing about a second of runtime.

  **Three lessons, and the first is the expensive one.**

  **A test that names a requirement is not evidence that the requirement is tested.** The only check that
  catches this is reading the acceptance criterion and the assertion side by side, and this project's
  Definition of Done does not ask for that: it asks whether a rule change ships with its unit test, and
  it did. One sentence is worth adding to it. The traceability table is where the check actually happened,
  which is an argument for writing those tables during development rather than as report filler at the
  end, since as filler it would have been written from the test *names*.

  **An issue with an empty body costs an hour to close.** #30 and #37 both have empty bodies. There were
  no acceptance criteria anywhere in the tracker, so the only source of truth was the requirements
  specification, and matching a title to six requirement ids is work somebody had already done once when
  the specification was written. That mapping exists in the specification's own trace column and nothing
  on the board points at it.

  **Two days is long enough for a repository to disagree with its issue tracker.** The parent epic was
  closed while a child stayed open, and the child's own code was already merged. Nothing is wrong with
  the code and the board is simply describing a state that ended. Worth one sentence in the project
  management chapter, because "is this done" was not answerable from the board.

- **2026-09-03: A green test run that proved nothing, and a bug it would not have caught anyway.** Two
  problems in one evening while landing design handoff 11, and the first one is the more embarrassing.

  **The Playwright web server was reused from a session five hours old.** `playwright.config.js` sets
  `reuseExistingServer: !process.env.CI`, and its command is `npm run build && npm run preview`. If a
  preview server is already answering on port 4173, **the build never runs**, and `preview` serves
  whatever is in `dist/` on disk. `dist/` was from 18:14 and the working tree was from 21:40. So the run
  that reported "24 passed" after the class rename had tested the old bundle: `dist/assets/*.js` still
  contained `move-refusal` and no `message-strip`, which is how it was eventually proved rather than
  guessed. The fix is one command, `npm run build`, because `preview` reads from disk on every request
  and needs no restart. Cost: about 25 minutes, most of it spent doubting the code rather than the
  harness.

  **The lesson is about the config and not about the mistake.** `reuseExistingServer` exists so a
  developer does not wait 30 seconds per run, and the price is that a stale server is indistinguishable
  from a fresh one in the output. Nothing warns. **Every end-to-end run in this project has to be
  preceded by `npm run build`, or the config has to stop reusing the server.** That is worth a line in
  the quality chapter, because a suite that can silently test the wrong code is worse than no suite for
  the one decision it is asked to support.

  **Then the real bug, which the full suite did find.** Three specs, in `win.spec.js` and
  `match-flow.spec.js`, timed out on a click four minutes into a 77-turn match, reporting
  `<div class="app__dice"> intercepts pointer events`. The cause: `roll.css` puts `pointer-events: none`
  on a rolling dice row, and the new hold that takes the attribute off was hanging off the loop's `roll`
  branch, which a roll does not always come through. When an opponent holds Critical Failure, Devil Die
  or Hold Pawn, the roll happens inside `close-window` instead, so the attribute was set and never
  cleared and **the dice hand became permanently unclickable from that turn on.** Cost: about 40 minutes,
  most of it narrowing down which turn broke by instrumenting a probe spec that plays turns and reports
  the first one where the attribute sticks in the `choose` phase.

  **Two lessons worth keeping.**

  **The specs that caught it were about winning a match, not about rolling.** Nothing in the new spec
  file would have found it, because a two-player match only reaches an opponent holding one of three
  specific Reactions after several turns, and the three long-running specs are the only ones that play
  that far. That is an argument for keeping a small number of expensive full-match specs even though they
  cost four minutes each: they are the only tests in the suite that exercise the game as a sequence
  rather than as a situation.

  **`pointer-events: none` is a dangerous thing to write from an attribute.** A stuck class that changes
  a colour is a cosmetic defect. A stuck attribute that removes pointer events makes the game
  unplayable, and it does so silently, with no error and a screen that looks completely normal. Any
  future attribute that gates input deserves the same treatment the roll's now has: a test that clicks
  through several turns and asserts the attribute is gone, rather than a test that only checks it
  appears.

Log anything that cost more than roughly 30 minutes of unplanned work: what happened, what it cost,
how it was resolved. These become the running prose of Chapter 11, so a sentence of context is worth
more than a terse label.
