# Documentation notes — index

Working notes for the final project and architecture documentation of **Ludo Advanced**.

This directory is **not** the report. It is the raw material the report is written from: facts,
decisions and their reasons, captured in the commit that produced them. The report itself is written
once, near the end, by reading these notes in order.

The reason for working this way is in the sample report the team is modelling on. Its own
*Lessons Learned* chapter names writing the documentation afterwards as the project's biggest
weakness — it produced avoidable time pressure at the end, and the presentation suffered for it.
Reversing that is worth a paragraph in Chapter 11 on its own.

Read [reference/style-reference.md](reference/style-reference.md) before writing any report prose.

---

## Chapters

| #   | Note | Covers | Status |
| --- | ---- | ------ | ------ |
| 01 | [01-requirements-and-goals.md](notes/01-requirements-and-goals.md) | Target players, the problem, MVP scope, MoSCoW, what is deliberately out of scope | backlog and MoSCoW transcribed |
| 02 | [02-project-management.md](notes/02-project-management.md) | Scrum setup, roles, sprints, GitHub Projects board, ceremonies, definition of done | board configuration transcribed |
| 03 | [03-tech-stack.md](notes/03-tech-stack.md) | Languages, libraries, versions, why each was chosen, what was rejected | empty |
| 04 | [04-frontend-building-blocks.md](notes/04-frontend-building-blocks.md) | `src/ui/`, `src/i18n/` — components, rendering, event binding, localisation | empty |
| 05 | [05-game-core-building-blocks.md](notes/05-game-core-building-blocks.md) | `src/core/` — board topology, movement, capture, dice card pool, skill cards | empty |
| 06 | [06-state-and-turn-flow.md](notes/06-state-and-turn-flow.md) | `src/state/` — the seam between core and ui, turn flow, state transitions | empty |
| 07 | [07-tooling.md](notes/07-tooling.md) | npm scripts, package management, ESLint, Prettier, Vite dev/prod build, deployment | empty |
| 08 | [08-quality.md](notes/08-quality.md) | Unit tests, coverage, E2E, CI/CD, code comments | empty |
| 09 | [09-source-code-overview.md](notes/09-source-code-overview.md) | Size and metrics — **the only chapter where numbers live** | empty |
| 10 | [10-ai-driven-engineering.md](notes/10-ai-driven-engineering.md) | How AI was used in the workflow, what it was good and bad at | empty |
| 11 | [11-project-report.md](notes/11-project-report.md) | Plan vs actual, challenges, lessons learned | empty |
| 12 | [12-appendix.md](notes/12-appendix.md) | Tables, figures and code excerpts moved out of the running text | empty |
| 13 | [13-ai-index.md](notes/13-ai-index.md) | The AI index — **generated**, never hand-maintained | empty |

Status values: `empty` → `partial` → `ready`. Update the row when a chapter's note becomes usable.

**Supporting files**, not chapters:

- [project-journal.md](project-journal.md) — dated log, decision blocks, challenges.
- [sprint-log.md](sprint-log.md) — planned scope vs delivered scope, per sprint.
- [abbreviations.md](abbreviations.md) — feeds the report's abbreviation list.

---

## Where does a fact go?

| You changed… | Append facts to |
| --- | --- |
| `src/core/` — rules, board, movement, capture, card pools | `notes/05-game-core-building-blocks.md` |
| `src/state/` — transitions, turn manager, intents | `notes/06-state-and-turn-flow.md` |
| `src/ui/`, `src/i18n/` — rendering, events, locales | `notes/04-frontend-building-blocks.md` |
| `package.json`, ESLint, Prettier, Vite config | `notes/07-tooling.md` |
| tests, coverage, CI workflow | `notes/08-quality.md` |
| added, rejected or replaced a dependency | `notes/03-tech-stack.md` |
| scope, user stories, MoSCoW labels | `notes/01-requirements-and-goals.md` |
| sprint, board, process or role change | `notes/02-project-management.md` **and** `sprint-log.md` |
| anything with a non-obvious *why* | `project-journal.md` **as well as** the chapter note |

When a change genuinely spans two chapters, write the fact once in the chapter that owns it and add
a one-line cross-reference in the other. Do not duplicate the content — two copies drift.

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
   that turned out to be wrong — write it down and explain it. The sample report printed a 12.67 %
   coverage figure and a missing formatter, explained both, and was graded well. Quietly omitting
   them is the worse outcome, not the safer one.

5. **Numbers live only in Chapter 09**, and always next to the command that regenerates them. Never
   write a line count, test count or coverage percentage into any other note, and never from memory
   — only from a command that was actually run. Everything else goes stale silently; a command does
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
  project management because that is this module's focus. Re-map once the real requirements arrive
  — the notes are facts, so a different catalogue is a re-sort, not a rewrite.
- **The two role tables contradict each other.** [00-One-Pager.md](../Project-Management/00-One-Pager.md)
  names Fabian Gemming as Product Owner and Lars Bolender and Benedict Glatz as Scrum Members with
  no dedicated Scrum Master. [01-Github-Project.md](../Project-Management/01-Github-Project.md) has
  an unnamed Developer A/B/C table that *does* include a Scrum Master. Which one holds needs
  deciding, and the outcome belongs in Chapter 02.
- ~~**No calendar dates exist for the sprints.**~~ **Resolved 2026-08-06** — recovered from the
  board's sprint markers and filled into [sprint-log.md](sprint-log.md). Two contradictions came with
  them and are open: the board has no buffer sprint, and its Sprint 0 is 2½ weeks against the planned
  1 week.
- **Velocity and burn-down charts cannot currently be produced.** The board has no story point field
  and no Iteration field, and `Status` and `Sprint` are unset on all 50 items. Both charts are named
  as buffer-sprint presentation content. Add and back-fill the fields before Sprint 1 closes, or drop
  the slides and explain why in Chapter 11 — see
  [02-project-management.md](notes/02-project-management.md#board).
- **No CI/CD pipeline and no deployment target** have been decided. Both are normal report chapters;
  if they stay absent, Chapter 08 says so and explains why rather than omitting the topic.
- **Licence is undetermined** (`README.md` says "To be determined").
