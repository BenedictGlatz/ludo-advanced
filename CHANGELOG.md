# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `CLAUDE.md` defining the tech stack, architecture layering, testing, Git and AI prompt log conventions
- `README.md` with project overview, setup instructions, scripts and contribution guidelines
- This changelog
- AI prompt log under `00-Meta/AI-Prompts/<github-username>/YYYY-MM-DD.json`
- Living documentation notes under `00-Meta/Documentation/`: a steering index, 13 chapter notes for the final
  project report, a project journal for decisions and challenges, a sprint log for planned versus delivered
  scope, an abbreviation list, and two adapted reference documents on report structure and writing style
- Mandatory per-change steps in `CLAUDE.md`, making the prompt log, documentation notes, changelog and tests part
  of the same commit as the change itself
- SMART analysis of the project goals in `00-Meta/Project-Management/SMART-Analysis.md`: one overall goal plus one
  sub-goal per must-have epic (#36–#39), each with a deadline taken from the board's sprint markers and measurable
  criteria stated as checks against artefacts, plus a section naming what still has to exist before those criteria
  can be read
- Feasibility study in `00-Meta/Project-Management/Feasibility-Study.md`: technical, schedule,
  personnel/organisational, economic and legal feasibility, each with its own verdict, and a conditional Go whose
  conditions and precondition (the AI toolchain) are named explicitly
- `00-Meta/Project-Management/Functional-and-Non-Functional-Goals.md`: the project's goal catalogue, 21 functional
  goals traced to the backlog epics and 8 non-functional goals derived from the hard constraints, each with its
  source, its reason and how it is verified
- `00-Meta/Project-Management/System-Architecture.md`: the layer diagram and the turn sequence diagram as Mermaid
  figures, a module inventory for `core/`, `state/` and `ui/` with the requirement ids each module owns, the data
  flow from DOM event to re-render, and the reasons for the layering with the rejected alternatives named
- `00-Meta/Project-Management/Game-Design-Document.md`: the rulebook of Ludo Advanced. Board topology as exact
  numbers (52 shared track squares, 5 home column squares, 58 steps from start area to home), the turn sequence as
  an 8-step state machine, the Dice Card Pool composition with its probability arithmetic, an 8-card MVP skill card
  catalogue with ids, the eight open gameplay rules written out with their rejected alternatives and a Product Owner
  sign-off table, and 13 win-condition and movement edge cases resolved
- `00-Meta/Project-Management/Effort-Estimation.md`: the open work sized in story points on a Fibonacci scale
  anchored on one named issue, covering the four implementation epics, the five extended features, the open
  documentation issues and three work items that carry no board issue at all, with totals per epic and per MoSCoW
  class, a capacity check against the weekdays left in Sprints 2 and 3, and the finding that the must-have set does
  not fit as scoped
- `00-Meta/Project-Management/Test-Plan-and-Quality-Strategy.md`: the test strategy across four levels with what
  each level cannot catch, the coverage floor and the reason it excludes `ui/`, 12 end-to-end flows mapped to
  requirement ids, one unit test case per rule edge case settled in the game design document, the injectable RNG as
  a testability requirement, the CI gates that do not exist yet, and **the project's first written Definition of
  Done** at issue, sprint and release level
- `00-Meta/Project-Management/Obligations-Book.md`: what will be built to satisfy the requirements. The system
  architecture cited rather than redrawn, a GUI inventory of nine screens plus two should-have ones with the
  requirement ids and backlog issue of each, the technology stack with its dependency policy and an empty version
  column until `package.json` exists, the platform committed from NFR-06 and NFR-10, and five known gaps including
  two screens that carry no backlog issue
- `00-Meta/Project-Management/Roadmap-and-Gantt.md`: the project schedule as a Mermaid Gantt chart, with
  the measured configuration of the board's Roadmap view, the three of its properties the GitHub API does
  not expose, and the finding that dates are set on 11 of 64 board items so the view renders 4 bars and 7
  dots. Registered as Figure 5, with Figure 6 reserved for the board screenshot
- `00-Meta/Project-Management/Project-Plan.md`: the project plan for time, resources and risks. Five
  checkable milestones, the decision that no buffer sprint is created and that the closing work is a dated
  window inside Sprint 3 behind a 2026-09-11 feature freeze, the decision that there is no dedicated Scrum
  Master, a work package dependency graph taken from the architecture, the critical path with the finding
  that only 32 points of work exist off it, a sprint assignment for the 27 previously unscheduled
  implementation issues, and the required rate corrected upward to 4.9 points per weekday
- Five risks created by the project plan added to `00-Meta/Project-Management/03-Risk-Analysis.md` as their
  own block, including the missed-feature-freeze row, which is the highest-rated risk in the register
- `00-Meta/Project-Management/Project-Structure-Plan.md`: the project structure plan (issue #17, pulled into
  Sprint 1 on 2026-08-22). Eight subprojects and the complete work package inventory, adopting the board's epic
  and sub-issue graph, placing all 47 board issues exactly once plus the three packages that have no issue, and
  carrying structure only: points, dates and owners stay in the documents that own them. The tree is registered
  as Figure 7
- `00-Meta/Project-Management/Requirements-Specification.md`: 45 functional and 12 non-functional requirements,
  each with an acceptance criterion and a MoSCoW priority, plus the MoSCoW analysis with a drop order agreed in
  advance and the eight gameplay decisions still owed by the Product Owner

### Changed

- AI prompt log entries now carry a `topic` and a `use` field, so the report's AI index chapter can be generated
  from the log rather than sorted by hand
- The truncated `## Documentation` section in `00-Meta/Project-Management/01-Github-Project.md` now points at the
  project journal instead of ending mid-sentence
- `00-Meta/AI-Prompts/` is now gitignored and kept locally per contributor instead of being committed; `CLAUDE.md`
  updated so the AI prompt log step is no longer part of the same commit as documentation notes, changelog and
  tests
- `00-Meta/Project-Management/00-One-Pager.md` rewritten as a one-page overview: the swallowed `TURN` heading and
  the typographic bullet characters fixed, the MVP boundary stated in one sentence, the board's sprint calendar and
  a question-to-document pointer table added, and the rules detail moved to the game design document so that only
  one document holds the rules
- The GitHub Projects board is now the single source of truth for sprint membership: `sprint-log.md` takes its
  planned scope from the board's `Sprint` field instead of the prose plan in `01-Github-Project.md`, and the
  Sprint 1 entry records the 13 documentation issues actually assigned to it, with the previously listed gameplay
  scope kept as superseded and unstarted
- Two risk rows in `00-Meta/Project-Management/03-Risk-Analysis.md` updated: *No velocity/burn-down data
  producible* re-rated from priority 4 to 3 now that story point estimates exist, with velocity and burn-down split
  apart because points fix only the first; *Test coverage discipline slips* deliberately left at 3 with only its
  mitigation extended, because a written test plan without CI does not lower the likelihood
- The Definition of Done condition in `Feasibility-Study.md` and its row in `SMART-Analysis.md` marked as met and
  annotated rather than deleted, so the sequence stays readable, with the adoption still named as outstanding
- Three contradictions carried across four documents resolved and recorded rather than left open: the buffer
  sprint and Sprint 3's length in `sprint-log.md`, the two disagreeing role tables in `00-index.md` and
  `notes/02-project-management.md`, and the sprint assignment of the implementation backlog. The superseded
  role table and prose sprint plan in `00-Meta/Project-Management/01-Github-Project.md` are annotated in
  place instead of deleted, and its malformed roles table now renders
- The *Sprint-plan vs. board-date contradiction* risk row re-rated from priority 4 to 3, its mitigation
  having been carried out, with the residual named as adoption rather than as decision
- Section 5.2 of `00-Meta/Project-Management/Effort-Estimation.md` revised: implementation has 15 weekdays
  rather than 19 once the closing window is in the calendar, printed next to the original figure
- Two negative findings from 2026-08-06 corrected in `notes/02-project-management.md` after the first full board
  read: `Status` is populated on all 64 items and `Sprint` on 20 of them. Story points and an Iteration field are
  still missing, so burn-down charts remain impossible and only an issue-count velocity is available
- `Start Date` and `End Date` back-filled on the 14 closed board items that carried none (the 13 Sprint 1 issues
  plus #17), each set to the day its delivering commit was authored rather than to the issue's close date, so the
  Roadmap view now renders 4 bars and 21 dots instead of 4 bars and 7 dots. `00-Meta/Project-Management/Roadmap-and-Gantt.md`
  section 2.1 records the measurement and the per-issue dates; the `project` token scope that blocked this, the
  `Story Points` field and the `Sprint` assignment was granted on the same day
- `CLAUDE.md` now opens with three sections on how answers and documentation are written: *Communication*, which
  states that the readers are 4th semester students, plus *Tone & Readability* and *Structure & Scannability*.
  They govern the register of the prose, while the existing *Writing style* section keeps governing the em dash
  ban. A typo in the *Communication* paragraph was fixed in the same commit
