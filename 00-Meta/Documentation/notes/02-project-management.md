# 02 Project management and process

> **Covers:** how the work was organised — process model, roles, sprints, the GitHub board,
> ceremonies, branching and review policy, definition of done.
> **Does not cover:** how it actually went. Plan-versus-actual, challenges and lessons learned are
> Chapter 11. This chapter is the *plan*; that one is the *retrospective*.

This module is project-management focused, so this chapter and Chapter 11 carry more weight here
than they do in the sample report, where the same material was compressed into a single section.

## What this chapter must answer

- Which process model, and why that one.
- Who did what — roles, both Scrum roles and technical ownership.
- Sprint structure: how many, how long, what each was for.
- How the backlog was managed: board, columns, custom fields, estimation, prioritisation.
- Which ceremonies actually happened (planning, review, retro) and at what cadence.
- Branching model, review policy, definition of done.
- How AI assistance was integrated into the process — cross-reference Chapter 10.

## Facts

### Process model

- Scrum, 3 sprints of 2 weeks, preceded by a 1-week Sprint 0 and followed by a 1-week buffer sprint
  — 8 weeks total. Source: [00-One-Pager.md](../../Project-Management/00-One-Pager.md),
  [01-Github-Project.md](../../Project-Management/01-Github-Project.md).
- No dedicated Scrum Master. The one-pager states the Scrum Members also do the Scrum Master work,
  "defining how to implement (Workflows etc.)".

### Roles

- Product Owner — Fabian Gemming (defines *what* and *why*).
- Scrum Member, implementation — Lars Bolender.
- Scrum Member, implementation — Benedict Glatz.
- **Contradiction, unresolved:** [01-Github-Project.md](../../Project-Management/01-Github-Project.md)
  carries a second, unnamed Developer A/B/C table that assigns a Scrum Master and a Quality & UX
  Lead, and pairs each Scrum role with a technical lead role. The two tables disagree on whether a
  Scrum Master exists. Needs deciding; whichever holds, the report states which and why.

### Board

- GitHub Projects v2, board named *Ludo Advanced*, with Roadmap, Backlog and Kanban views.
- Phase labels: `2-definition`, `3-planning`, `4-implementation`, `5-completion`.
- MoSCoW labels: `must have`, `should have`, `could have`.
- Planned custom fields (from [Brainstorming.md](../../../Brainstorming.md)): Iteration (2-week
  sprints), Story Points (Fibonacci 1/2/3/5/8), Category (Gameplay, UI, Art/Audio, Bug, Mechanics).
- Planned columns: Backlog → Ready for Sprint → In Progress → In Review → Done.

### Branching and review

- `main` always holds a working, playable build; no direct pushes or commits.
- `dev` is the integration branch; feature branches merge into it, and `dev` merges into `main` for
  releases.
- Feature branches: `feature/<issue>-<slug>` or `fix/<issue>-<slug>`, branched off `dev`.
- Pull requests need at least one review approval and are merged with **Squash and Merge**.
- `Closes #<n>` in the commit body auto-closes the issue and moves the board card.
- Conventional Commits, English, imperative mood.

### Documentation process

- 2026-08-06 — Repository and GitHub project created.
- 2026-08-06 — Documentation notes established under `00-Meta/Documentation/`. The report is written
  *alongside* development: every commit appends facts to the chapter note it touches, and any
  non-obvious decision gets a block in [project-journal.md](../project-journal.md). Reason: the
  sample report this project models on names late documentation as its own biggest weakness.
  See the decision block of the same date in the journal.

## Decisions

<!-- Promote decision blocks here from project-journal.md when this chapter is written. -->

## Open / to verify

- Which ceremonies actually take place, and whether they are minuted. Only one meeting note exists
  so far ([20260806.md](../../Project-Management/Meeting%20Notes/20260806.md), one sentence).
- Whether Story Points and the Fibonacci estimation from `Brainstorming.md` were actually
  configured on the board, or only planned. Velocity and burn-down charts are named as presentation
  content and need real data to exist.
- No calendar dates for sprint boundaries — only relative weeks. Needed for `sprint-log.md`.
- Definition of Done has not been written down anywhere.
- Whether a CI build-validation workflow (`build-check.yml`, planned in `Brainstorming.md`) gets
  implemented. If not, say so in Chapter 08 with a reason.
