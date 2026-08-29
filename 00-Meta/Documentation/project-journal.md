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

Log anything that cost more than roughly 30 minutes of unplanned work: what happened, what it cost,
how it was resolved. These become the running prose of Chapter 11, so a sentence of context is worth
more than a terse label.
