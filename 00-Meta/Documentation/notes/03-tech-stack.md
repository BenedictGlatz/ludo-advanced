# 03 Tech stack

> **Covers:** languages, libraries, versions, and the reason behind each choice — including the
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
| Language | JavaScript, ES modules | — |
| DOM / UI | jQuery | — |
| Build | Vite | — |
| Localisation | i18next, locales `de` and `en` | — |
| Unit tests | Vitest | — |
| E2E tests | Playwright | — |
| Lint / format | ESLint + Prettier | — |

Reasons are blank because they have not been recorded yet. A row without a reason is not finished;
fill it when the decision is made or reconstructed, and add the version once `package.json` exists.

### Rejected, with reasons

- **3D approach with Unity** — rejected. A new programming language for two of three team members,
  plus asset creation and multiplayer work. Source:
  [00-One-Pager.md](../../Project-Management/00-One-Pager.md) risk assessment.
- **2D approach with Pygame** — rejected. Named as offering less extensibility and a harder
  multiplayer path. Source: same risk assessment.
- **2D web chosen over both**, 2026-08-06: *"Because of the missing time (magical triangle), we
  decided to use a 2D board to be able to deliver more quality."*
  ([Meeting Notes 20260806](../../Project-Management/Meeting%20Notes/20260806.md)). This is a scope
  decision framed against the iron triangle — worth stating in the report as such, since the module
  is project-management focused.
- **TypeScript** — deliberately not used. Reason not yet recorded; it must be, because a report that
  omits a deliberate non-choice reads as an oversight.

### Dependency policy

- Any additional runtime dependency requires asking the user first. Approved so far: `jquery`,
  `i18next`. Approved dev dependencies: Vite, ESLint, Prettier, Vitest, Playwright.

### The stack assessed for feasibility — 2026-08-09, issue #12

Full document: [Feasibility-Study.md](../../Project-Management/Feasibility-Study.md). Facts only:

- **Technical verdict: feasible, without conditions.** The reasons, each of them a property of the
  stack rather than of the team: the MVP mechanics reduce to data and pure functions (the Dice Card
  Pool is a draw over a finite set, skill card effects are functions over game state); no physics, no
  real-time loop, no server and no networking, because multiplayer is outside the MVP and the MVP is
  local hot-seat; the Vite output is a static `dist/` deployable to GitHub Pages or itch.io with no
  infrastructure to operate.
- **The layering is what makes the goal measurable, not only what makes the code tidy.** `core/`
  being free of the DOM is the reason the ≥ 80 % coverage criterion of issue #9 can be read at all —
  interleaved rules and rendering would have left the same goal unmeasurable in practice. Worth
  stating in this chapter because it is an architecture consequence of a *goal* decision.
- **Second, feasibility-side justification for rejecting Unity 3D and 2.5D**, alongside the
  one-pager's risk assessment already recorded above: the two criteria that decided the
  Nutzwertanalyse — C# competence and available time — are exactly the two dimensions a feasibility
  study assesses. 3D lost on feasibility grounds, not on preference.
- **Licence check outstanding.** The licences of the chosen packages are to be verified against each
  package's own `LICENSE` file once `package.json` exists. Recorded in the study as a task, not
  asserted as a finding — no dependency licence is claimed anywhere from memory.
- **Open technical points named in the study**, none of which blocks the MVP: the win condition has
  no rule for overshooting the goal with a high die (a D20 makes this concrete); the energy/resource
  system is undecided; no CI workflow and no deployment target chosen; multiplayer has no chosen
  networking technology.

## Decisions

<!-- Promote decision blocks here from project-journal.md when this chapter is written. -->

## Open / to verify

- No `package.json` exists yet, so no version is pinned. The stack above is the binding target
  state declared in [CLAUDE.md](../../../CLAUDE.md), not an observed fact.
- Dependency licences are unverified until `package.json` exists — see the licence check in the
  feasibility facts above.
- Why jQuery specifically, over plain DOM APIs or a component framework, is unrecorded.
- Why Vite over other bundlers is unrecorded.
- Multiplayer is named in the Sprint 2 plan but no networking technology has been chosen. If the
  game ships local-only, that is a scope decision and belongs in Chapter 01 and Chapter 11.
