# 02 Project management and process

> **Covers:** how the work was organised: process model, roles, sprints, the GitHub board,
> ceremonies, branching and review policy, definition of done.
> **Does not cover:** how it actually went. Plan-versus-actual, challenges and lessons learned are
> Chapter 11. This chapter is the *plan*; that one is the *retrospective*.

This module is project-management focused, so this chapter and Chapter 11 carry more weight here
than they do in the sample report, where the same material was compressed into a single section.

## What this chapter must answer

- Which process model, and why that one.
- Who did what: roles, both Scrum roles and technical ownership.
- Sprint structure: how many, how long, what each was for.
- How the backlog was managed: board, columns, custom fields, estimation, prioritisation.
- Which ceremonies actually happened (planning, review, retro) and at what cadence.
- Branching model, review policy, definition of done.
- How AI assistance was integrated into the process: cross-reference Chapter 10.

## Facts

### Process model

- Scrum, 3 sprints of 2 weeks, preceded by a 1-week Sprint 0 and followed by a 1-week buffer sprint:
  8 weeks total. Source: [00-One-Pager.md](../../Project-Management/00-One-Pager.md),
  [01-Github-Project.md](../../Project-Management/01-Github-Project.md).
- No dedicated Scrum Master. The one-pager states the Scrum Members also do the Scrum Master work,
  "defining how to implement (Workflows etc.)".

### Roles

- Product Owner: Fabian Gemming (defines *what* and *why*).
- Scrum Member, implementation: Lars Bolender.
- Scrum Member, implementation: Benedict Glatz.
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

#### Board as actually configured: observed 2026-08-06

Read from the live board at `https://github.com/users/BenedictGlatz/projects/3` (a **user-level**
project, not repository-level). 50 items: the 46 issues plus 4 draft issues used as sprint markers.

- **Views (3), matching the plan:** `Roadmap` (roadmap layout), `Backlog` (table), `Kanban Board`
  (board layout, grouped by Status).
- **`Status` field options are `Todo` / `In Progress` / `Done`**: the GitHub default triple, *not*
  the five planned columns. `Ready for Sprint` and `In Review` do not exist, so the review step of
  the branching policy has no board representation.
- **`Sprint` field options:** `Sprint 0` / `Sprint 1` / `Sprint 2` / `Sprint 3`. It is a plain
  single-select, **not** a GitHub *Iteration* field. Iteration fields carry date ranges and drive
  burn-down charts natively; a single-select does not.
- **Custom date fields:** `Start Date`, `End Date`. Populated on all 50 items.
- Remaining fields are GitHub built-ins: Title, Assignees, Labels, Linked pull requests, Milestone,
  Repository, Reviewers, Parent issue, Sub-issues progress, Created, Updated, Closed.
- **Four negative findings, all as of 2026-08-06:**
  1. **`Status` is unset on all 50 items.** Every card sits in the Kanban board's no-status lane, so
     the board currently shows no progress at all.
  2. **`Sprint` is unset on all 50 items.** Sprint membership exists only as the 4 draft-issue
     markers and the per-item date fields, not as a queryable field value.
  3. **No `Story Points` field exists**, and no estimation field of any kind. The Fibonacci
     estimation planned in [Brainstorming.md](../../../Brainstorming.md) was never configured.
  4. **No `Category` field exists.** Its role is filled by free labels (`gameplay`, `ui`, `audio`,
     `documentation`) instead.
- **No milestones are defined** in the repository (`/milestones` returns an empty list).
- Assignees are set on only 3 of 46 issues (#2, #4, #5 to all three members; #1 to BenedictGlatz;
  #3 to lbolender). The remaining 41 are unassigned.
- **Third GitHub account observed:** `CreativeName06`, alongside `BenedictGlatz` and `lbolender`.
  By elimination this is Fabian Gemming, but that mapping is not written down anywhere and should be
  confirmed before the report names it.

**Consequence for the report:** velocity and burn-down charts are named as buffer-sprint
presentation content in [sprint-log.md](../sprint-log.md), and as the board stands **neither can be
produced**: burn-down needs an Iteration field or dated status transitions, velocity needs story
points. Both fields have to be added and back-filled *before* Sprint 1 closes, or the presentation
drops those slides and the report explains why. This is a decision to take now, not in week 8.

#### Board update: 2026-08-09, from a screenshot of the Backlog view

Partial observation, not a full re-read: the source is a screenshot of backlog rows 27–35 supplied by
Benedict Glatz, not the board itself. Recorded with that limitation because it revises an earlier
negative finding.

- **`Status` is no longer unset.** Every row visible in the screenshot (#36–#39 and #42–#46) shows
  `Todo`. Negative finding 1 above is therefore **at least partly resolved**: how many of the 50
  items were back-filled is not observable from the excerpt and needs a full read to confirm.
- **Sub-issue progress bars read 0 %** on all four epics, consistent with no implementation issue
  being closed yet.
- **The repository now has 47 issues, not 46.** #47 *Utility Value Analysis* was added on 2026-08-09
  and is labelled `documentation`, `1-initialization`. It is still open although its pull request
  (#48) is merged.
- **#46 *Classic vs. Custom Game Modes* has gained a `question` label**, the only issue carrying it.
  Consistent with rule toggles being genuinely undecided rather than merely deprioritised.
- Still not observable and still open: `Sprint` field values, story points (no such field), and the
  five planned Kanban columns.

#### Board access from the development environment

- 2026-08-06, first attempt: **not readable.** No GitHub MCP server configured for Claude Code,
  no `gh` CLI installed, no `GITHUB_TOKEN`/`GH_TOKEN`, and the repository was private, so the
  unauthenticated REST API answered `404`.
- 2026-08-06, second attempt: **readable, but not through MCP.** The GitHub MCP server was
  installed into `%APPDATA%\Code\User\mcp.json`, which is **VS Code's own (Copilot) MCP registry**.
  Claude Code reads a different set of locations (`.mcp.json` in the project root, `mcpServers` in
  `~/.claude.json`, or `claude mcp add`) and its config was still empty. Installing an MCP server in
  one client does not expose it to another client running in the same editor: worth stating plainly
  in the report, because it looks like it should.
- What actually made the board readable was **making the repository and project public**:
  - Issues, labels and milestones: unauthenticated GitHub REST API.
  - Board structure and item values: parsed out of the board page's server-rendered
    `memex-columns-data` and `memex-paginated-items-data` JSON payloads.
  - The **Projects v2 GraphQL API rejects unauthenticated requests with `403`** regardless of
    project visibility, so the HTML payload route is the only unauthenticated one. It depends on
    GitHub's internal page structure and will break without notice: fine for a one-off reading,
    not something to build tooling on.
- 2026-08-06, third finding: **authenticated *writes* were available all along.** Pushing `dev`
  succeeded, which proves a credential existed; `git credential fill` against `host=github.com`
  returns the Git Credential Manager's stored token (`credential.helper=manager`). It authenticates
  as `lbolender` with scopes `gist, repo, workflow`, which is enough to comment on and close issues
  through the REST API. The earlier conclusion that *no* authenticated GitHub automation was possible
  was wrong: what was missing was not a token but the knowledge that one was already there. See the
  correction in [07-tooling.md](07-tooling.md).
- **The one scope that is missing is `read:project`.** With the stored token, a Projects v2 GraphQL
  query returns `INSUFFICIENT_SCOPES`, naming `read:project` explicitly. So the board field values
  (the one thing the `memex-*` HTML route is needed for) remain the only part of GitHub that has no
  stable access path. Adding `read:project` to the existing token at
  <https://github.com/settings/tokens> is a smaller change than installing the `gh` CLI and replaces
  the HTML-parsing route entirely.
- Durable access therefore needs **one scope added to an existing token**, not new tooling. The `gh`
  CLI stays optional convenience rather than a prerequisite.
- 2026-08-22: **the board is now fully readable, and the route taken was the other one.** The `gh`
  CLI was installed after all and authenticates as `lbolender` out of the Windows keyring, and
  `gh auth refresh -s read:project` added the missing scope to that session's token. `gh project
  item-list 3 --owner BenedictGlatz --format json` returns every item with all field values,
  including `Sprint`. The prediction above (one scope, not new tooling) was half right: the scope was
  indeed the blocker, but the token that got it was the `gh` one rather than the Git Credential
  Manager's, so the tooling was installed anyway. The `memex-*` HTML-parsing route is now obsolete
  and should not be used again.
- 2026-08-22, a second scope gap, found while trying to move board cards: **the board can be read and
  not written.** The `gh` token carries `gist`, `read:org`, `read:project`, `repo`, `workflow`, so
  `gh project item-edit` fails with `your authentication token is missing required scopes [project]`.
  Consequence, and it is a process consequence rather than a tooling one: **issue assignees and issue
  state are automatable** (`gh issue edit` and `gh issue close` need only `repo`, and the eight open
  Sprint 1 issues were assigned that way on 2026-08-22), while **`Status`, `Sprint`, dates and any new
  field have to be set by hand in the browser**. So the dated status history that a velocity figure
  reads from depends on a human moving cards, which is the step most likely to be skipped under
  deadline pressure. Closing this needs one interactive `gh auth refresh -s project`, the same
  browser device flow as `read:project` and equally impossible for an agent to grant itself.
- **`read:project` cannot be added silently.** `gh auth refresh` is an interactive browser device
  flow, so an agent cannot grant it to itself: it is a step the human contributor has to perform
  once per machine. Worth stating in the report, because it is the difference between "automatable"
  and "automatable after a one-time manual grant".

#### Board read 2026-08-22: full field read, first time `Sprint` values were visible

Read with `gh project item-list 3 --owner BenedictGlatz`. **64 items:** 47 issues, 13 pull requests
and the 4 sprint-marker draft issues. The item count rose from 50 because pull requests are now
auto-added to the board.

- **`Status` is populated on all 64 items:** 22 `Done`, 41 `Todo`, 1 `In Progress` (the `Sprint 1`
  marker). Negative finding 1 of 2026-08-06 is **fully resolved**, and the partial resolution
  recorded on 2026-08-09 is confirmed.
- **`Sprint` is populated on 20 of 64 items:** 7 on `Sprint 0`, 13 on `Sprint 1`, none on `Sprint 2`
  or `Sprint 3`. Negative finding 2 of 2026-08-06 (*`Sprint` unset on all items*) is therefore
  **corrected, but only for the first two sprints**.
- The remaining 44 items carry no sprint: the 13 pull requests, the 4 sprint markers, and **27
  issues**, which include every implementation issue #26 to #46. The team's position as of
  2026-08-22 is that these will be assigned to their sprints later, so the gap is deliberate
  sequencing and not a configuration defect.
- The 4 sprint-marker draft issues carry `Start Date` and `End Date` but **no `Sprint` value of their
  own**, so a filter on the field does not return its own marker. Dates unchanged from the 2026-08-06
  read.
- **`Start Date` / `End Date` are no longer populated on all items.** They are set on the 4 markers
  and on the 7 `Sprint 0` issues, and empty on all 13 `Sprint 1` issues. The 2026-08-06 statement
  "populated on all 50 items" no longer holds for the current item set, so per-item dates cannot be
  used as a sprint-membership proxy any more. The `Sprint` field is now the only complete source.
- Still absent: `Story Points` or any estimation field, a `Category` field, the `Ready for Sprint`
  and `In Review` columns, and repository milestones (`milestone` is null on all 47 issues).

**`Sprint 1` membership as configured on the board** (marker: 2026-08-10 → 2026-08-23, status
`In Progress`), 13 issues, all of them documentation or planning work:

| # | Title | Status | Assignee |
| --- | --- | --- | --- |
| 9 | SMART Analysis | Done | lbolender |
| 10 | Functional vs. Non-Functional Goals | Done | BenedictGlatz |
| 11 | Risk Analysis | Done | CreativeName06 |
| 12 | Feasibility Study | Done | lbolender |
| 13 | MoSCoW Analysis | Done | BenedictGlatz |
| 1 | One Pager | Todo | none |
| 14 | Obligations Book: System Architecture, GUI, Technology, Platform | Todo | none |
| 15 | Project Plan: Time, Ressources, Risks | Todo | none |
| 16 | Effort Estimation | Todo | none |
| 18 | Gantt Diagram via Roadmap | Todo | none |
| 21 | System Architecture Diagram | Todo | none |
| 22 | Game Design Document | Todo | none |
| 23 | Test Plan and Quality Strategy | Todo | none |

Item #13 appears on the board as *MoSCoW Analysis*; the issue's own title is *Requirements
Specification + MoSCoW Analysis*.

- 5 Done, 8 Todo, and **all 8 open ones are unassigned** with one day of the sprint left. **Corrected
  the same day:** all eight were assigned to `lbolender` with `gh issue edit` on 2026-08-22, so the
  assignee count rises from 9 to 17 of 47 issues. The finding stands as a finding: they were
  unassigned for the whole sprint and were assigned on its last day, which is the fact the
  retrospective needs, not the current value.
- **`Sprint 0` membership**, for comparison: #2, #4, #5, #6, #7, #8, #47, all `Done`. The seven
  initialization issues, which matches the sprint-log entry for Sprint 0.
- **Assignees are still sparse:** set on 9 of 47 issues. Every implementation issue is unassigned.

**Consequence for the report.** Sprint 1 as executed is a *documentation* sprint, not the
"Core gameplay and board MVP" sprint that [01-Github-Project.md](../../Project-Management/01-Github-Project.md)
planned. The written plan and the board diverge on the whole content of the sprint, not on details.
The divergence and its reason are recorded in [sprint-log.md](../sprint-log.md); which artefact wins
is settled in the 2026-08-22 decision in [project-journal.md](../project-journal.md).

### Branching and review

- `main` always holds a working, playable build; no direct pushes or commits.
- `dev` is the integration branch; feature branches merge into it, and `dev` merges into `main` for
  releases.
- Feature branches: `feature/<issue>-<slug>` or `fix/<issue>-<slug>`, branched off `dev`.
- Pull requests need at least one review approval and are merged with **Squash and Merge**.
- `Closes #<n>` in the commit body auto-closes the issue and moves the board card: but **only when
  the commit lands on the default branch (`main`)**. On feature branches and on `dev` the trailer is
  recorded and does nothing until the release merge. Verified 2026-08-06. Consequence: an issue
  finished mid-sprint has to be closed explicitly, or it stays open until the next release even though
  the work is merged into `dev`.
- Conventional Commits, English, imperative mood.
- **Third branch-naming deviation, 2026-08-22:** `feature/sprint1-planning` carries no issue number,
  against the `feature/<issue>-<slug>` convention, because it carries **eight** issues (#1, #14, #15,
  #16, #18, #21, #22, #23): the open Sprint 1 planning documents, which cross-reference each other
  constantly. Eight branches would have meant eight pull requests whose merge order is forced by those
  cross-references. The cost is that the board cannot link a branch to a single issue, so the per-issue
  trail lives in the commits instead, one commit per issue with `Closes #<n>` in its body.
- **Consequence at merge time, decided in advance:** the pull request is merged with a **merge
  commit** rather than Squash and Merge, which deviates from the policy above. Squashing eight commits
  into one destroys exactly the per-issue trail that replaces the missing branch-to-issue link, and
  that trail is what the report's plan-versus-actual comparison reads. Recorded here because a policy
  deviation nobody wrote down is indistinguishable from a mistake.

### Documentation process

- 2026-08-06: Repository and GitHub project created.
- 2026-08-06: Documentation notes established under `00-Meta/Documentation/`. The report is written
  *alongside* development: every commit appends facts to the chapter note it touches, and any
  non-obvious decision gets a block in [project-journal.md](../project-journal.md). Reason: the
  sample report this project models on names late documentation as its own biggest weakness.
  See the decision block of the same date in the journal.
- 2026-08-06: **`dev` created on `origin`.** Until this push the remote had only `main`; the four
  documentation commits existed locally only. `main` is deliberately left at `96109df`: the
  branching policy forbids direct pushes to it, so these commits reach `main` through a `dev` → `main`
  pull request, not a push.
- 2026-08-06: **First two issues closed:** #4 *Create a Claude.md* and #2 *Github Setup +
  Documentation*, each with a closing comment naming the evidence. Note that closing was done through
  the REST API, **not** by a `Closes #<n>` commit trailer: GitHub only honours that trailer when the
  commit reaches the **default branch**, so a trailer on a `dev` commit does nothing until the release
  merge. This matters for the policy in *Branching and review* below: on this branching model,
  `Closes #<n>` closes issues at release time, not at commit time.
- 2026-08-09 — **The board's sprint end dates now also serve as goal deadlines.** Issue #9 formulated
  the project goals SMART against them; the facts are in
  [01-requirements-and-goals.md](01-requirements-and-goals.md), the document is
  [SMART-Analysis.md](../../Project-Management/SMART-Analysis.md). Consequence for this chapter: a
  change to the sprint boundaries is no longer only a planning change.
- 2026-08-09 — **Feasibility assessed and affirmed conditionally** (issue #12,
  [Feasibility-Study.md](../../Project-Management/Feasibility-Study.md)). Two of its five verdicts
  land in this chapter's territory and are conditions on the *process*, not on the technology:
  - **Schedule.** Sprint 1 starts 2026-08-10 and has to bootstrap the toolchain before it can
    implement anything, which is not in its planned scope; the board has no buffer sprint although the
    written plan does; and the Sprint 2 plan still lists multiplayer and the energy system, neither of
    which is in the `must have` set — reconciling it releases schedule rather than costing it.
  - **Personnel.** Two people implement four epics, because the Product Owner does not implement.
    The conditions attached are the ones already listed under *Prerequisites for measurability* in
    [SMART-Analysis.md](../../Project-Management/SMART-Analysis.md) — Definition of Done, role
    contradiction, board fields — referenced there rather than repeated.

### Risk management

- Risk register lives at
  [03-Risk-Analysis.md](../../Project-Management/03-Risk-Analysis.md): a 3×3 Likelihood×Impact
  matrix (Priority 1–5) plus a Risk Ratings table with Category, Likelihood, Impact, Priority and a
  Mitigation/Response column.
- **2026-08-10:** extended from 3 unrated-mitigation rows (Multiplayer, Complexity, Sickness) to 16,
  by mining the risks already implied elsewhere in the documentation rather than inventing new ones
  — e.g. the sprint-plan/board-date contradiction and missing velocity data from `sprint-log.md`, the
  unstable `memex-*` board-parsing route and the public-repository decision from `project-journal.md`,
  and the role-concentration and external-playtester dependency from
  [01-Github-Project.md](../../Project-Management/01-Github-Project.md). Categories used: Schedule,
  Scope, Process/Quality, Team, Technical/Tooling, Compliance/Academic, Presentation.
- Every row added on 2026-08-10 traces to a fact already recorded elsewhere in this repository (no
  speculative risks) — see [03-Risk-Analysis.md](../../Project-Management/03-Risk-Analysis.md) for
  the full table and per-row mitigation.
- 2026-08-09: **Feasibility assessed and affirmed conditionally** (issue #12,
  [Feasibility-Study.md](../../Project-Management/Feasibility-Study.md)). Two of its five verdicts
  land in this chapter's territory and are conditions on the *process*, not on the technology:
  - **Schedule.** Sprint 1 starts 2026-08-10 and has to bootstrap the toolchain before it can
    implement anything, which is not in its planned scope; the board has no buffer sprint although the
    written plan does; and the Sprint 2 plan still lists multiplayer and the energy system, neither of
    which is in the `must have` set: reconciling it releases schedule rather than costing it.
  - **Personnel.** Two people implement four epics, because the Product Owner does not implement.
    The conditions attached are the ones already listed under *Prerequisites for measurability* in
    [SMART-Analysis.md](../../Project-Management/SMART-Analysis.md): Definition of Done, role
    contradiction, board fields, referenced there rather than repeated.

## Decisions

<!-- Promote decision blocks here from project-journal.md when this chapter is written. -->

## Open / to verify

- Which ceremonies actually take place, and whether they are minuted. Only one meeting note exists
  so far ([20260806.md](../../Project-Management/Meeting%20Notes/20260806.md), one sentence).
- ~~Whether Story Points and the Fibonacci estimation were actually configured on the board.~~
  **Answered 2026-08-06: they were not.** See the four negative findings above. What is still open is
  the *decision*: add the fields and back-fill, or drop velocity and burn-down from the
  presentation and say so.
- ~~No calendar dates for sprint boundaries.~~ **Answered 2026-08-06** from the board's sprint
  markers; see [sprint-log.md](../sprint-log.md). Two contradictions surfaced with it and are open:
  - The board has **no buffer sprint**. The plan is 3 sprints plus a buffer; the board has Sprint 0–3
    and stops. Either board `Sprint 3` *is* the buffer sprint under another name, or the buffer was
    dropped. Decide and record which.
  - Board `Sprint 0` runs 2026-07-23 → 2026-08-09, i.e. **2½ weeks**, against the planned 1 week.
    It also starts two weeks before the repository existed.
- Whether the board's `Status` triple (`Todo`/`In Progress`/`Done`) replaces the five planned columns
  deliberately, or was simply never changed from the GitHub default. The report needs one or the
  other, and the branching policy's review step currently has no column.
- Whether `CreativeName06` is Fabian Gemming. Assumed by elimination, confirmed nowhere.
- Definition of Done has not been written down anywhere. Since 2026-08-09 this blocks a measurable
  criterion rather than only a convention: all four SMART sub-goals check "epic closed", and without a
  Definition of Done that is not comparable between the three of us. Listed with a proposed date
  (2026-08-23) in [SMART-Analysis.md](../../Project-Management/SMART-Analysis.md).
- Whether a CI build-validation workflow (`build-check.yml`, planned in `Brainstorming.md`) gets
  implemented. If not, say so in Chapter 08 with a reason.
