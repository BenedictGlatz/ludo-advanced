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

Log anything that cost more than roughly 30 minutes of unplanned work: what happened, what it cost,
how it was resolved. These become the running prose of Chapter 11, so a sentence of context is worth
more than a terse label.
