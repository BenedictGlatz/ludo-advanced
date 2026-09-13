# 11 Project report

> **Covers:** how the project actually went: planned scope against delivered scope, the challenges
> that arose, and the lessons learned.
> **Does not cover:** how the work was *organised*. That is Chapter 02. This chapter is the
> retrospective; that one is the plan.

In a project-management module this is the chapter that carries the most weight, and it is the one
that cannot be reconstructed at the end. Its raw material is
[project-journal.md](../project-journal.md) and [sprint-log.md](../sprint-log.md), both of which
have to be kept current as the project runs.

## What this chapter must answer

- **Plan versus actual.** What was planned for each sprint, what was delivered, where the two
  diverged and why. Divergence is normal; unexplained divergence is not.
- **Challenges.** What went wrong or cost unplanned effort, and how it was resolved.
- **Lessons learned.** What the team takes from this into the next project.

## Style note

Challenges and lessons learned are written as **running prose, not bullet points**. Reflection is
what is being assessed here, and a bullet list cannot show it. The sample report writes each lesson
as observation → assessment → recommendation for future projects, and that pattern is worth copying
directly.

## Facts

### Plan versus actual

Source: [sprint-log.md](../sprint-log.md).

- **The team's own reading, stated by Benedict Glatz on 2026-09-11 for report section 4.3.**
  AI-assisted development was planned from the start, so it was not what moved the schedule. What took
  longer than planned was the project documentation of Sprints 0 and 1, which is why implementation only
  began in Sprint 2 (first code commit 2026-08-29). Lars Bolender then put a large amount of time into
  the implementation, and that is why the delivered scope goes beyond the MVP: bot opponents (FR-43) and
  online multiplayer (FR-42), both `should have`.
- **A different reading is on record** in the Sprint 2 divergence section of the sprint log, written on
  2026-09-01 and 2026-09-02, which attributes the early finish to estimates "built for people writing the
  code by hand". Both are kept: the sprint log's is an observation made at the time, this one is the
  team's explanation afterwards, and the report uses the team's.

### Challenges

Source: the `## Challenges` section of [project-journal.md](../project-journal.md). Nothing logged
yet.

### Lessons learned: candidates

Collect these as they occur rather than inventing them at the end.

- **Documentation written alongside development.** The sample report this project models on names
  late documentation as its own biggest weakness: it produced time pressure at the end and the
  presentation was cut short for it. This project inverted that from the first week. Whether the
  inversion actually paid off is an honest question to answer in the retrospective: if the notes
  went stale anyway, say so.
- **Scope cut early rather than late.** The 3D-to-2D decision was taken on 2026-08-06, before
  implementation began, explicitly framed against the iron triangle. Whether that early cut was
  enough is worth revisiting once the sprints have run.

## Open / to verify

- No sprint has closed, so there is no actual to compare against plan.
- The team decided against hour-level effort tracking. Plan-versus-actual is therefore shown in
  scope and dates, not in hours. State this in the report as a deliberate choice with its reason,
  rather than leaving the absence of a capacity table unexplained.
