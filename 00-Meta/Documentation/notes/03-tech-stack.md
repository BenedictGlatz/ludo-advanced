# 03 Tech stack

> **Covers:** languages, libraries, versions, and the reason behind each choice: including the
> ones that were rejected.
> **Does not cover:** how the code is structured (04–06) or the developer tooling around it (07).

Keep this chapter short. Detail belongs in a stack table in the appendix (Chapter 12); the running
text names the choice and the reason in a clause.

## What this chapter must answer

- Target platform and its constraints.
- Each production dependency: what it is for, why it and not the alternative.
- Each deliberate *non*-choice, with its reason. A rejected technology explained is worth more than
  a chosen one asserted.
- Where the exact versions are recorded.

## Facts

### Platform

- 2D web application, runs in the browser. No installation, no server.

### Chosen

| Area | Choice | Reason |
| --- | --- | --- |
| Language | JavaScript, ES modules | n/a |
| DOM / UI | jQuery | n/a |
| Build | Vite | n/a |
| Localisation | i18next, locales `de` and `en` | n/a |
| Unit tests | Vitest | n/a |
| E2E tests | Playwright | n/a |
| Lint / format | ESLint + Prettier | n/a |

Reasons are blank because they have not been recorded yet. A row without a reason is not finished;
fill it when the decision is made or reconstructed, and add the version once `package.json` exists.

### Rejected, with reasons

- **3D approach with Unity**: rejected. A new programming language for two of three team members,
  plus asset creation and multiplayer work. Source:
  [00-One-Pager.md](../../Project-Management/00-One-Pager.md) risk assessment.
- **2D approach with Pygame**: rejected. Named as offering less extensibility and a harder
  multiplayer path. Source: same risk assessment.
- **2D web chosen over both**, 2026-08-06: *"Because of the missing time (magical triangle), we
  decided to use a 2D board to be able to deliver more quality."*
  ([Meeting Notes 20260806](../../Project-Management/Meeting%20Notes/20260806.md)). This is a scope
  decision framed against the iron triangle: worth stating in the report as such, since the module
  is project-management focused.
- **TypeScript**: deliberately not used. Reason not yet recorded; it must be, because a report that
  omits a deliberate non-choice reads as an oversight.

### Dependency policy

- Any additional runtime dependency requires asking the user first. Approved so far: `jquery`,
  `i18next`. Approved dev dependencies: Vite, ESLint, Prettier, Vitest, Playwright.

### The stack assessed for feasibility: 2026-08-09, issue #12

Full document: [Feasibility-Study.md](../../Project-Management/Feasibility-Study.md). Facts only:

- **Technical verdict: feasible, without conditions.** The reasons, each of them a property of the
  stack rather than of the team: the MVP mechanics reduce to data and pure functions (the Dice Card
  Pool is a draw over a finite set, skill card effects are functions over game state); no physics, no
  real-time loop, no server and no networking, because multiplayer is outside the MVP and the MVP is
  local hot-seat; the Vite output is a static `dist/` deployable to GitHub Pages or itch.io with no
  infrastructure to operate.
- **The layering is what makes the goal measurable, not only what makes the code tidy.** `core/`
  being free of the DOM is the reason the ≥ 80 % coverage criterion of issue #9 can be read at all:
  interleaved rules and rendering would have left the same goal unmeasurable in practice. Worth
  stating in this chapter because it is an architecture consequence of a *goal* decision.
- **Second, feasibility-side justification for rejecting Unity 3D and 2.5D**, alongside the
  one-pager's risk assessment already recorded above: the two criteria that decided the
  Nutzwertanalyse (C# competence and available time) are exactly the two dimensions a feasibility
  study assesses. 3D lost on feasibility grounds, not on preference.
- **Licence check outstanding.** The licences of the chosen packages are to be verified against each
  package's own `LICENSE` file once `package.json` exists. Recorded in the study as a task, not
  asserted as a finding: no dependency licence is claimed anywhere from memory.
- **Open technical points named in the study**, none of which blocks the MVP: the win condition has
  no rule for overshooting the goal with a high die (a D20 makes this concrete); the energy/resource
  system is undecided; no CI workflow and no deployment target chosen; multiplayer has no chosen
  networking technology.

### Architecture decisions: recorded 2026-08-22, issue #21

Full document: [System-Architecture.md](../../Project-Management/System-Architecture.md). It describes
the **target state**: no `src/` exists, so every item below is a design commitment and not an
observation.

- **Five units:** `core/` (pure rules), `state/` (the single writable state object and its
  transitions), `ui/` (jQuery rendering and event binding), `i18n/` (i18next plus `de` and `en`
  locales), and `main.js` as the composition root.
- **The two hard rules are stated as absent import edges** in the layer diagram: `core/` imports
  nothing from `state/` or `ui/`, and `ui/` never mutates state but dispatches intents into `state/`.
  Both are requirement NFR-01, whose acceptance criterion is mechanically checkable: unit tests for
  `core/` run with no DOM environment configured. A layering violation is a failing test rather than a
  style complaint.
- **Module inventory derived from the requirement blocks, not invented:** 8 modules in `core/`
  (`board`, `movement`, `capture`, `dice-pool`, `skill-pool`, `card-effects`, `turn-rules`, `win`),
  4 in `state/` (`game-state`, `turn-manager`, `intents`, `match`) and 7 in `ui/`. Each carries the FR
  ids it owns, so a requirement has one obvious home.
- **The data flow is a single loop with no second path:** DOM event, intent, rule check in `core/`,
  transition in `state/`, re-render in `ui/`. The check and the write are deliberately separate steps,
  because the same rule function that validates a move produces the highlighted legal-move set of
  FR-32; merging them would give one rule two implementations.
- **Three reasons for the layering, each a consequence the project already owes:** it makes the NFR-05
  coverage target readable at all, because two layers are browser-free; it makes the 300-line limit of
  NFR-02 survivable, because a mechanic's rule, transition and view are concerns of very different
  size; and it keeps a rule change cheap, which matters because the eight gameplay rules are unsigned
  and some of them will change.
- **Rejected: game rules inside jQuery event handlers.** The natural shape of a jQuery application and
  the shortest path to a playable prototype. It loses on all three counts above and additionally
  duplicates every rule, once for the FR-32 legal-move highlighting and once for validation on commit.
- **Rejected: a service or use-case layer between `state/` and `core/`.** With four modules in
  `state/`, no backend, no persistence beyond the session and no networking in the MVP, it would only
  forward calls. Recorded so that its absence reads as a decision.
- **The RNG enters `core/` as an argument** (NFR-09). Nothing in `core/` reads `Math.random()`, which
  is what lets a test supply a fixed sequence and assert an exact board state.
- **Two figures registered in Ch. 12:** the layer diagram and the turn sequence diagram, both in
  Mermaid so that GitHub renders them and the report can export them.
- **Negative finding:** the whole document is unverified by construction. The module inventory is a
  plan, and the first commit that creates `src/core/board.js` is the first evidence it survives contact
  with code.
- **Deliberately not decided there:** how the board is drawn (SVG, CSS grid or `<canvas>`), which is a
  Claude Design decision and issue #3; the deployment target, which is undecided and named as such;
  and where a network layer for FR-42 would attach, since no networking technology has been chosen.

### Technology and platform committed: 2026-08-22, issue #14

Full document: [Obligations-Book.md](../../Project-Management/Obligations-Book.md) sections 3 and 4.
It cites this chapter's material rather than adding to it, so only what is new belongs here:

- **The stack table has an empty version column, on purpose.** No `package.json` exists, so nothing is
  pinned, and a version written from memory would be a number with no command behind it. It is filled
  in the same commit that creates `package.json`. This is the numbers rule of `CLAUDE.md` applied to a
  Project-Management document rather than only to the chapter notes.
- **Platform commitments, each traced:** the browser with no installation and no plugin (NFR-06,
  NFG-06); current and previous major Chrome, Firefox and Edge (NFR-10); desktop only, mobile and
  tablet out of scope (NFR-10); no backend, no database, no account (NFR-06); no networking, hot-seat on
  one device and one tab (FR-03); a static `dist/` servable as plain files (NFR-06); no persistence
  beyond the session, since surviving a reload is FR-45 and `could have`.
- **Desktop-only carries a consequence worth printing:** 52 shared squares, four start areas, four home
  columns and two card hands on one screen is a layout problem on a phone, and solving it is design work
  nobody has scheduled. So NFR-10 is a scope decision with a stated reason, not an omission.
- **The deployment target is still unchosen**, and nothing in the MVP depends on it, because any static
  host serves a Vite build. That is why it can stay open without blocking work, and it is named as open
  in the obligations book rather than presented as settled.
- **The two missing reasons are named as missing in the obligations book too**, why jQuery over plain
  DOM APIs or a component framework, and why Vite over another bundler. They stay open items in this
  chapter. A deliberate choice with no recorded reason reads as an accident in a report, which is the
  reason for naming rather than filling the gap.
- **Dependency licences remain unverified**, and the obligations book repeats that no licence is claimed
  from memory anywhere.

### The stack becomes real: 2026-08-29, issue #63

`package.json` exists. Everything above stops being a target and becomes an observation. Versions are
read from each package's own `node_modules/<pkg>/package.json`, and the full script and configuration
detail lives in [07-tooling.md](07-tooling.md) rather than being repeated here.

| Area | Package | Version | Kind |
| --- | --- | --- | --- |
| DOM / UI | `jquery` | 4.0.0 | runtime |
| Localisation | `i18next` | 26.4.0 | runtime |
| Build | `vite` | 8.2.2 | dev |
| Lint | `eslint` | 10.9.1 | dev |
| Lint | `@eslint/js` | 10.0.1 | dev |
| Format | `prettier` | 3.9.6 | dev |
| Unit tests | `vitest` | 4.1.11 | dev |
| Coverage | `@vitest/coverage-v8` | 4.1.11 | dev |
| E2E tests | `@playwright/test` | 1.62.1 | dev |

- **jQuery installed is version 4.0.0, and that is worth flagging rather than filing.** Every document
  in this repository says "jQuery" and none of them says which major version. jQuery 4 drops support
  for old browsers and removes a set of long-deprecated APIs. Nothing here depends on those APIs yet,
  so it costs nothing today, and the risk is that a tutorial or an answer written for jQuery 3 will
  not always apply. Recorded now so that a later "why does this snippet not work" has an answer
  already written down.
- **Only two runtime dependencies**, as promised. Everything else is a dev dependency and none of it
  reaches `dist/`.
- **Three packages were installed that are not literally in the approved list**, with their reasoning
  and one package deliberately refused. The table is in
  [07-tooling.md](07-tooling.md#dependencies-installed-beyond-the-five-approved-dev-tools); the short
  version is that `@playwright/test` **is** Playwright, `@vitest/coverage-v8` is Vitest's own coverage
  provider that a required npm script cannot run without, and `@eslint/js` is ESLint's own. `globals`
  was **not** installed, and the globals are declared by hand instead.

#### Licence check, run rather than deferred

The feasibility study recorded this as a task blocked on `package.json` existing, with an explicit
note that no licence is claimed from memory. `package.json` now exists, so it was run. Each row is
read from the package's own `license` field **and** its own licence file:

| Package | Licence | Licence file present |
| --- | --- | --- |
| `jquery` | MIT | `LICENSE.txt` |
| `i18next` | MIT | `LICENSE` |
| `vite` | MIT | `LICENSE.md` |
| `eslint` | MIT | `LICENSE` |
| `@eslint/js` | MIT | `LICENSE` |
| `prettier` | MIT | `LICENSE` |
| `vitest` | MIT | `LICENSE.md` |
| `@vitest/coverage-v8` | MIT | `LICENSE` |
| `@playwright/test` | Apache-2.0 | `LICENSE` |

- **Eight of nine are MIT and Playwright is Apache-2.0.** Both are permissive and neither imposes any
  obligation this project cannot meet. Playwright is a dev dependency in any case, so it is not in
  anything a player receives.
- **The check covers the 9 direct dependencies only, not the 139 packages `npm ls --all` resolves.**
  That is a real limit and it is stated rather than hidden: a full transitive audit needs a tool the
  project has not installed, and the honest claim is "the direct dependencies were checked", not "the
  dependency tree is clean".
- **The repository itself still has no licence.** `package.json` says `"license": "UNLICENSED"` and
  `"private": true`, which is accurate for a university project with no licence file. Choosing a
  repository licence was named as an open condition in the feasibility study and is still open.

## Decisions

<!-- Promote decision blocks here from project-journal.md when this chapter is written. -->

## Open / to verify

- ~~No `package.json` exists yet, so no version is pinned. The stack above is the binding target
  state declared in [CLAUDE.md](../../../CLAUDE.md), not an observed fact.~~ **Resolved 2026-08-29,
  issue #63.** See *The stack becomes real* above.
- ~~Dependency licences are unverified until `package.json` exists: see the licence check in the
  feasibility facts above.~~ **Run 2026-08-29** for the 9 direct dependencies: 8 MIT and 1
  Apache-2.0. **Still open for the transitive tree**, 139 packages, which needs tooling nobody has
  installed. The repository's own licence is also still unchosen.
- Why jQuery specifically, over plain DOM APIs or a component framework, is unrecorded.
- Why Vite over other bundlers is unrecorded.
- Multiplayer is named in the Sprint 2 plan but no networking technology has been chosen. If the
  game ships local-only, that is a scope decision and belongs in Chapter 01 and Chapter 11.
