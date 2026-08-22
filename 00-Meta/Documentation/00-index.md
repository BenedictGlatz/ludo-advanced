# Documentation notes: index

Working notes for the final project and architecture documentation of **Ludo Advanced**.

This directory is **not** the report. It is the raw material the report is written from: facts,
decisions and their reasons, captured in the commit that produced them. The report itself is written
once, near the end, by reading these notes in order.

The reason for working this way is in the sample report the team is modelling on. Its own
*Lessons Learned* chapter names writing the documentation afterwards as the project's biggest
weakness: it produced avoidable time pressure at the end, and the presentation suffered for it.
Reversing that is worth a paragraph in Chapter 11 on its own.

Read [reference/style-reference.md](reference/style-reference.md) before writing any report prose.

---

## Chapters

| #   | Note | Covers | Status |
| --- | ---- | ------ | ------ |
| 01 | [01-requirements-and-goals.md](notes/01-requirements-and-goals.md) | Target players, the problem, MVP scope, MoSCoW, what is deliberately out of scope | backlog, MoSCoW and SMART goals transcribed |
| 02 | [02-project-management.md](notes/02-project-management.md) | Scrum setup, roles, sprints, GitHub Projects board, ceremonies, definition of done | partial: board, roles, schedule, estimation and Roadmap recorded; ceremonies still unrecorded |
| 03 | [03-tech-stack.md](notes/03-tech-stack.md) | Languages, libraries, versions, why each was chosen, what was rejected | rejected options and the technical feasibility verdict recorded; reasons for the chosen stack still missing |
| 04 | [04-frontend-building-blocks.md](notes/04-frontend-building-blocks.md) | `src/ui/`, `src/i18n/`: components, rendering, event binding, localisation | partial: the screen inventory recorded; nothing implemented |
| 05 | [05-game-core-building-blocks.md](notes/05-game-core-building-blocks.md) | `src/core/`: board topology, movement, capture, dice card pool, skill cards | empty |
| 06 | [06-state-and-turn-flow.md](notes/06-state-and-turn-flow.md) | `src/state/`: the seam between core and ui, turn flow, state transitions | empty |
| 07 | [07-tooling.md](notes/07-tooling.md) | npm scripts, package management, ESLint, Prettier, Vite dev/prod build, deployment | target state only; local access findings recorded |
| 08 | [08-quality.md](notes/08-quality.md) | Unit tests, coverage, E2E, CI/CD, code comments | partial: strategy and Definition of Done recorded; nothing measured, since no code exists |
| 09 | [09-source-code-overview.md](notes/09-source-code-overview.md) | Size and metrics: **the only chapter where numbers live** | empty |
| 10 | [10-ai-driven-engineering.md](notes/10-ai-driven-engineering.md) | How AI was used in the workflow, what it was good and bad at | conventions, tool split and the precondition finding recorded; the honest assessment waits for real experience |
| 11 | [11-project-report.md](notes/11-project-report.md) | Plan vs actual, challenges, lessons learned | empty |
| 12 | [12-appendix.md](notes/12-appendix.md) | Tables, figures and code excerpts moved out of the running text | partial: figures 2 to 5 registered, 1 and 6 reserved |
| 13 | [13-ai-index.md](notes/13-ai-index.md) | The AI index: **generated**, never hand-maintained | empty |

Status values: `empty` → `partial` → `ready`. Update the row when a chapter's note becomes usable.

**Supporting files**, not chapters:

- [project-journal.md](project-journal.md): dated log, decision blocks, challenges.
- [Project-Management/Utility-Value-Analysis.md](../Project-Management/Utility-Value-Analysis.md): weighted-criteria comparison of 2D/2.5D/3D backing the engine-choice decision.
- [Project-Management/Feasibility-Study.md](../Project-Management/Feasibility-Study.md): five
  feasibility dimensions with a verdict each, and the conditional Go that rests on the AI toolchain
  (issue #12). Feeds Ch. 03 and Ch. 10; its conditions feed Ch. 11.
- [Project-Management/Functional-and-Non-Functional-Goals.md](../Project-Management/Functional-and-Non-Functional-Goals.md): the goal catalogue (FG-01 to FG-21, NFG-01 to NFG-08) feeding Chapter 01, with a traceability table to the backlog epics.
- [Project-Management/Requirements-Specification.md](../Project-Management/Requirements-Specification.md): 45 functional and 12 non-functional requirements with acceptance criteria, the MoSCoW analysis, and the open Product Owner decisions.
- [sprint-log.md](sprint-log.md): planned scope vs delivered scope, per sprint.
- [abbreviations.md](abbreviations.md): feeds the report's abbreviation list.

**Analysis documents outside this directory.** These are deliverables of their own backlog issues, not
notes. They live in `00-Meta/Project-Management/` and are cited from the chapter that uses them:

- [SMART-Analysis.md](../Project-Management/SMART-Analysis.md) — the project goal and four epic-level
  sub-goals, formulated SMART (issue #9). Feeds Ch. 01 and the plan-versus-actual comparison in Ch. 11.
- [Project-Plan.md](../Project-Management/Project-Plan.md): time, resources and risks (issue #15). The
  document that decides the buffer sprint, the role contradiction and the sprint assignment of the
  implementation backlog, with the critical path and the required rate. Feeds Ch. 02 and Ch. 11.
- [Effort-Estimation.md](../Project-Management/Effort-Estimation.md): the open work in story points
  (issue #16), with the capacity check and the finding that the must-have set does not fit. Feeds Ch. 02.
- [Test-Plan-and-Quality-Strategy.md](../Project-Management/Test-Plan-and-Quality-Strategy.md): test
  levels, coverage floor, E2E flows and the Definition of Done (issue #23). Feeds Ch. 08 and Ch. 02.
- [Obligations-Book.md](../Project-Management/Obligations-Book.md): architecture, GUI inventory,
  technology and platform (issue #14). Feeds Ch. 03 and Ch. 04.
- [Game-Design-Document.md](../Project-Management/Game-Design-Document.md): the rulebook to edge-case
  level (issue #22). Feeds Ch. 01 and Ch. 05.
- [System-Architecture.md](../Project-Management/System-Architecture.md): layer and turn-sequence
  diagrams, module inventory (issue #21). Feeds Ch. 03, Ch. 05 and Ch. 06.
- [Roadmap-and-Gantt.md](../Project-Management/Roadmap-and-Gantt.md): the schedule as a Mermaid Gantt
  chart plus the measured configuration and limits of the board's Roadmap view (issue #18). Feeds Ch. 02,
  Ch. 11 and Ch. 12.

---

## Where does a fact go?

| You changed… | Append facts to |
| --- | --- |
| `src/core/`: rules, board, movement, capture, card pools | `notes/05-game-core-building-blocks.md` |
| `src/state/`: transitions, turn manager, intents | `notes/06-state-and-turn-flow.md` |
| `src/ui/`, `src/i18n/`: rendering, events, locales | `notes/04-frontend-building-blocks.md` |
| `package.json`, ESLint, Prettier, Vite config | `notes/07-tooling.md` |
| tests, coverage, CI workflow | `notes/08-quality.md` |
| added, rejected or replaced a dependency | `notes/03-tech-stack.md` |
| scope, user stories, MoSCoW labels | `notes/01-requirements-and-goals.md` |
| sprint, board, process or role change | `notes/02-project-management.md` **and** `sprint-log.md` |
| anything with a non-obvious *why* | `project-journal.md` **as well as** the chapter note |

When a change genuinely spans two chapters, write the fact once in the chapter that owns it and add
a one-line cross-reference in the other. Do not duplicate the content: two copies drift.

---

## House rules

1. **Facts, not prose.** Bullets, tables, short statements. The report text is written once, at the
   end, from these notes. Drafting paragraphs now means rewriting them every time the code moves.

2. **No claim without a reason.** A note that records *what* without *why* is not finished. The
   reason is the part that is expensive to reconstruct three weeks later, and it is the part the
   report is actually graded on.

3. **Record rejected alternatives.** What else was on the table and why it lost. A decision with no
   visible alternative reads as an accident rather than a choice.

4. **Negative findings stay.** Missing coverage, a skipped feature, a sprint that overran, a rule
   that turned out to be wrong: write it down and explain it. The sample report printed a 12.67 %
   coverage figure and a missing formatter, explained both, and was graded well. Quietly omitting
   them is the worse outcome, not the safer one.

5. **Numbers live only in Chapter 09**, and always next to the command that regenerates them. Never
   write a line count, test count or coverage percentage into any other note, and never from memory:
   only from a command that was actually run. Everything else goes stale silently; a command does
   not.

6. **Interpret every number.** One sentence on what it says about the project. A table nobody reads
   a conclusion out of is not worth its page.

7. **The 300-line file limit does not apply here.** A chapter note may grow long and must not be
   split into fragments. The limit exists to keep source files reviewable; it does the opposite to a
   chapter.

8. **Cross-reference with number and title**, never a bare "see above".

---

## Open questions

Standing list. Resolve and delete, or move into the chapter that answers it.

- **The module's actual requirements are unknown.** No chapter catalogue, page count, deadline,
  required front matter or grading breakdown exists in this repository. The chapter list above is
  adapted from a sample report for a *different module with a different professor*, weighted toward
  project management because that is this module's focus. Re-map once the real requirements arrive:
  the notes are facts, so a different catalogue is a re-sort, not a rewrite.
- ~~**The two role tables contradict each other.**~~ **Resolved 2026-08-22, issue #15**, in section 3.1
  of [Project-Plan.md](../Project-Management/Project-Plan.md): the
  [00-One-Pager.md](../Project-Management/00-One-Pager.md) table holds (Fabian Gemming Product Owner,
  Lars Bolender and Benedict Glatz Scrum Members, no dedicated Scrum Master) and the unnamed Developer
  A/B/C table in [01-Github-Project.md](../Project-Management/01-Github-Project.md) is superseded as an
  unfinished template. Appointing a Scrum Master was rejected as a fiction, since nobody performed the
  role for two sprints. The facts are in [02-project-management.md](notes/02-project-management.md),
  including the negative finding that follows: the board hygiene a Scrum Master would own was skipped
  for all of Sprint 1.
- ~~**No calendar dates exist for the sprints.**~~ **Resolved 2026-08-06**: recovered from the
  board's sprint markers and filled into [sprint-log.md](sprint-log.md). The two contradictions that
  came with them were **decided 2026-08-22, issue #15**: no buffer sprint is created and the closing
  work becomes a dated window inside Sprint 3 behind a 2026-09-11 feature freeze, and Sprint 0's 2½
  weeks stay uncorrected as a Chapter 11 finding.
- **The module's real deadline is unknown.** Every date in
  [Project-Plan.md](../Project-Management/Project-Plan.md) rests on 2026-09-17 because that is the last
  date the board carries, and nothing confirms it is the actual one. Part of the unknown-module-
  requirements gap above, separated out because it is one question to one person and it changes every
  figure in the plan. Rated priority 4 in
  [03-Risk-Analysis.md](../Project-Management/03-Risk-Analysis.md).
- **Velocity and burn-down charts cannot currently be produced.** Partly revised 2026-08-22: `Status`
  is now set on all 64 board items and `Sprint` on 20, and every open issue is estimated in
  [Effort-Estimation.md](../Project-Management/Effort-Estimation.md). What is still missing is the
  `Story Points` field itself and an Iteration field, so **velocity becomes producible from Sprint 2
  once the field exists and burn-down stays impossible**, because it needs dated status transitions the
  plain single-select `Sprint` field cannot provide. Both are blocked on the same missing `project`
  token scope: see [02-project-management.md](notes/02-project-management.md#board).
- **No CI/CD pipeline and no deployment target** have been decided. Both are normal report chapters;
  if they stay absent, Chapter 08 says so and explains why rather than omitting the topic.
- **Licence is undetermined** (`README.md` says "To be determined"). Since 2026-08-09 this is a named
  condition of the feasibility verdict rather than a loose end: the repository is already public and
  the deployment candidates assume it stays that way.
- **Whether the module requires an explicit declaration of AI use** beyond the prompt log is unknown.
  Part of the same gap as the unknown module requirements above; raised in
  [Feasibility-Study.md](../Project-Management/Feasibility-Study.md).
