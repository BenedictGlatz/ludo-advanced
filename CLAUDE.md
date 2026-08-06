# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Ludo Advanced** is a 2D web-based board game for 2–4 players — a Ludo variant that replaces the single die with two
card pools:

- **Dice Card Pool** — cards from D2 to D20. Each turn a player draws 3 cards, picks one, rolls that die, and the
  3 cards are shuffled back into the pool.
- **Skill Card Pool** — `Action` cards (playable on your own turn) and `Reaction` cards (playable in response to
  another player's action).

Classic Ludo rules still apply underneath: pawns leave the start area on the die's highest number, move along the
track, and capture opponents by landing exactly on their square. Full rules:
[00-One-Pager.md](00-Meta/Project-Management/00-One-Pager.md).

The decision for a 2D web build (over Unity 3D or Pygame) was made for scope reasons — see
[Meeting Notes 20260806](00-Meta/Project-Management/Meeting%20Notes/20260806.md).

## Status

The repository contains documentation only — no source code, no `package.json`, no tooling config yet. The stack,
commands and directory layout below are the **binding target state**. Whoever bootstraps the npm project implements
exactly this; do not substitute alternatives.

## Tech stack and hard constraints

- **JavaScript only — no TypeScript.** No `.ts` files, no build-time type checking.
- **jQuery** for DOM manipulation and event handling.
- **Any additional runtime dependency requires asking the user first.** Already approved: `jquery`, `i18next`.
  Approved dev dependencies: Vite, ESLint, Prettier, Vitest, Playwright. Anything else — ask, do not just install it.
- **No file longer than 300 lines.** Applies to source, tests and config. When a file approaches the limit, split it
  along a real seam — do not compress it by removing whitespace or comments.
- **No hardcoded user-facing strings.** Every string the player can read goes through i18next.

## Commands

These are the scripts `package.json` must provide:

```bash
npm run dev            # Vite dev server
npm run build          # Production build -> dist/
npm run preview        # Serve the production build locally
npm run lint           # ESLint
npm run lint:fix       # ESLint with --fix
npm run format         # Prettier --write
npm test               # Vitest, single run
npm run test:watch     # Vitest, watch mode
npm run test:coverage  # Vitest with v8 coverage
npm run test:e2e       # Playwright, all browsers
```

Running a single test:

```bash
npx vitest run tests/unit/dice-pool.test.js      # one unit test file
npx vitest run -t "captures an opponent pawn"    # one unit test by name
npx playwright test tests/e2e/turn-flow.spec.js  # one E2E spec
npx playwright test --ui                         # Playwright UI mode
```

## Architecture

The layering below is what makes the 300-line limit workable and the coverage target reachable — keep it strict.

```
src/
  core/    Pure game rules. No DOM, no jQuery, no i18next, no imports from
           state/ or ui/. Board topology, pawn movement, capture, turn
           manager, dice card pool (D2-D20), skill card pool and effect
           resolution, win conditions. Runs and tests without a browser.
  state/   The single game-state object plus its transitions. The only
           writable source of truth. Imports core/, never ui/.
  ui/      jQuery rendering and event binding. Reads state, dispatches
           intents into state/. Contains no game rules.
  i18n/    i18next setup, locales/de.json, locales/en.json
  main.js  Composition root: boots i18next, wires core + state + ui.
tests/
  unit/    Vitest, mirrors the src/ layout
  e2e/     Playwright
```

Two rules follow from this:

- **`core/` never imports from `state/` or `ui/`.** Rules stay headless and directly unit-testable.
- **`ui/` never mutates state directly.** It dispatches into `state/`, which applies `core/` rules.

Card effects (skill and dice) live in `core/` as pure functions over game state — a card's visual presentation belongs
in `ui/`, its rule belongs in `core/`, and the two are matched by card id.

## Testing

High test coverage is a project requirement, not a nice-to-have.

- Every rule change in `core/` ships with its unit test in the same commit.
- Every player-facing flow (take a turn, pick a dice card, play a skill card, capture a pawn, win) has an E2E test.
- Coverage target: **≥ 80 % lines in `src/core/` and `src/state/`**. `ui/` is covered through E2E instead.

## Design and UI

Design and UI are developed with **Claude Design**, which has access to this directory.

Claude Code does **not** invent design rules — no colour palettes, spacing scales, typography systems or component
looks — and does not overwrite existing ones. When a design specification is missing for something you need to build,
ask the user rather than filling the gap yourself.

## Git workflow

Branches:

- `main` — always a working, playable build. **No direct pushes, no direct commits.**
- `dev` — integration branch. Feature branches merge here; `dev` merges into `main` for releases.
- `feature/<issue>-<slug>` / `fix/<issue>-<slug>` — branched off `dev`, e.g. `feature/37-dice-pool-ui`.

> This supersedes the GitHub Flow description in [Brainstorming.md](Brainstorming.md) (feature branches off `main`,
> no `dev`). The rest of that file still applies: no direct pushes to `main`, minimum 1 review approval,
> **Squash and Merge**, `Closes #<n>` to auto-close issues.

Commits follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/): `feat:`, `fix:`, `docs:`,
`refactor:`, `test:`, `chore:`, `ci:`, with an optional scope (`feat(dice-pool): add D20 card`). Subjects are in
English, imperative mood.

**Commit automatically** as soon as a feature is implemented — do not wait to be asked. **Push only when the user
explicitly asks for it.**

When a commit resolves an issue, close it from the commit body:

```
feat(dice-pool): add weighted dice card selection

Closes #37
```

## Changelog

`CHANGELOG.md` follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and Semantic Versioning. Every
user-visible change is added to `## [Unreleased]` under the right heading (Added / Changed / Deprecated / Removed /
Fixed / Security) **in the same commit that makes the change**.

## AI prompt log

Every prompt is recorded under:

```
00-Meta/AI-Prompts/<github-username>/YYYY-MM-DD.json
```

One file per user **per day**, containing a JSON array. Append new entries; never rewrite existing ones. Entry schema:

```json
{
  "timestamp": "2026-08-06T17:03:00+02:00",
  "model": "claude-opus-5",
  "prompt": "<verbatim user prompt>",
  "issue": 37,
  "summary": "Short description of what was produced"
}
```

`issue` is the GitHub issue number the prompt relates to, or `null` when there is no identifiable issue. Commit the
log entry together with the work it produced, or as `chore(ai-log): ...` when there is no other change.

## Project management

GitHub Projects v2 board *Ludo Advanced* with Roadmap, Backlog and Kanban views.

- Phase labels: `2-definition`, `3-planning`, `4-implementation`, `5-completion`
- MoSCoW labels: `must have`, `should have`, `could have`
- Scrum: 3 sprints of 2 weeks plus a buffer sprint — see
  [01-Github-Project.md](00-Meta/Project-Management/01-Github-Project.md)

Roles: Fabian Gemming (Product Owner), Lars Bolender and Benedict Glatz (Scrum Members / implementation).
