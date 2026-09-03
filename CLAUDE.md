# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication

!!IMPORTANT!! This project is being developed by 4th semester university students. Please adapt your language to this, so we can understand what you are trying to convey. There is no point in condensing information so much that we cannot understand that.
Please keep this in mind when answering questions or writing documentation.

## Tone & Readability
- Write in clear, direct, and conversational plain English.
- Target an accessible reading level: explain complex technical or conceptual ideas using clear analogies and concrete real-world examples rather than high-register academic abstractions.
- Keep sentence structures straightforward. Favor active voice and concise phrasing; avoid deeply nested clauses, repetitive qualifiers, and overly formal transitions.

## Structure & Scannability
- Prioritize high scannability: break long explanations into short paragraphs, bullet points, numbered steps, or concise markdown tables.
- Bold key terms and takeaways to make skimming effortless.
- If an explanation becomes overly theoretical, ground it with a practical "Why this matters" or code/usage example.

## Project

**Ludo Advanced** is a 2D web-based board game for 2–4 players: a Ludo variant that replaces the single die with two
card pools:

- **Dice Card Pool**: cards from D2 to D20. Each turn a player draws 3 cards, picks one, rolls that die, and the
  3 cards are shuffled back into the pool.
- **Skill Card Pool**: `Action` cards (playable on your own turn) and `Reaction` cards (playable in response to
  another player's action).

Classic Ludo rules still apply underneath: pawns leave the start area on the die's highest number, move along the
track, and capture opponents by landing exactly on their square. Full rules:
[00-One-Pager.md](00-Meta/Project-Management/00-One-Pager.md).

The decision for a 2D web build (over Unity 3D or Pygame) was made for scope reasons: see
[Meeting Notes 20260806](00-Meta/Project-Management/Meeting%20Notes/20260806.md).

## Status

The repository contains documentation only: no source code, no `package.json`, no tooling config yet. The stack,
commands and directory layout below are the **binding target state**. Whoever bootstraps the npm project implements
exactly this; do not substitute alternatives.

## Mandatory per-change steps

Every change carries these five, in this order. They are not optional and not "when there is time": step 1 is
local-only and not part of the commit (see [AI prompt log](#ai-prompt-log)); step 2 is the one that cannot be
reconstructed afterwards, which is exactly why it comes first among the committed steps.

1. **AI prompt log**: append the prompt to `00-Meta/AI-Prompts/<github-username>/YYYY-MM-DD.json` **before
   replying**. This directory is gitignored and kept locally per machine, not committed. See
   [AI prompt log](#ai-prompt-log).
2. **Documentation notes**: append facts to the chapter note the change belongs to, add a decision block to
   `00-Meta/Documentation/project-journal.md` for any non-obvious decision, and a challenge bullet for anything
   that cost more than ~30 min of unplanned work. See [Documentation notes](#documentation-notes).
3. **Changelog**: user-visible changes under `## [Unreleased]` in `CHANGELOG.md`.
4. **Tests**: write them, or state plainly which coverage is still outstanding. Do not skip silently.
5. **Commit**: Conventional Commits, with steps 2–4 in the *same* commit. Push only when explicitly asked.

## Tech stack and hard constraints

- **JavaScript only: no TypeScript.** No `.ts` files, no build-time type checking.
- **jQuery** for DOM manipulation and event handling.
- **Any additional runtime dependency requires asking the user first.** Already approved: `jquery`, `i18next`.
  Approved dev dependencies: Vite, ESLint, Prettier, Vitest, Playwright. Anything else: ask, do not just install it.
- **No file longer than 300 lines.** Applies to source, tests and config. When a file approaches the limit, split it
  along a real seam: do not compress it by removing whitespace or comments.
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
npm run docs:ai-index  # Generate the AI index chapter from the AI prompt log
```

Running a single test:

```bash
npx vitest run tests/unit/dice-pool.test.js      # one unit test file
npx vitest run -t "captures an opponent pawn"    # one unit test by name
npx playwright test tests/e2e/turn-flow.spec.js  # one E2E spec
npx playwright test --ui                         # Playwright UI mode
```

## Architecture

The layering below is what makes the 300-line limit workable and the coverage target reachable: keep it strict.

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

Card effects (skill and dice) live in `core/` as pure functions over game state: a card's visual presentation belongs
in `ui/`, its rule belongs in `core/`, and the two are matched by card id.

## Testing

High test coverage is a project requirement, not a nice-to-have.

- Every rule change in `core/` ships with its unit test in the same commit.
- Every player-facing flow (take a turn, pick a dice card, play a skill card, capture a pawn, win) has an E2E test.
- Coverage target: **≥ 80 % lines in `src/core/` and `src/state/`**. `ui/` is covered through E2E instead.

## Documentation notes

This project is assessed on a written project and architecture documentation. That report is written **alongside**
development, not afterwards: the sample report the team models on names late documentation as its own biggest
weakness, and reversing that is worth a paragraph in the retrospective on its own.

What every change owes is **facts, not prose**. The report text is written once, near the end, from these notes.
Drafting paragraphs now means rewriting them every time the code moves.

Notes live under `00-Meta/Documentation/`: see [00-index.md](00-Meta/Documentation/00-index.md) for the full
chapter table, the status of each chapter, and the standing list of open questions.

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

Five rules apply at commit time:

- **No claim without a reason.** A note recording *what* without *why* is not finished. The reason is the expensive
  part to reconstruct later, and the part the report is actually graded on.
- **Record rejected alternatives.** A decision with no visible alternative reads as an accident, not a choice.
- **Negative findings stay.** Missing coverage, a cut feature, an overrun sprint: write it down and explain it.
  The sample report printed a 12.67 % coverage figure and a missing formatter, explained both, and scored well.
- **Numbers live only in `notes/09-source-code-overview.md`**, next to the command that regenerates them, and only
  after that command has actually been run. Never a line count, test count or coverage figure from memory, and
  never in any other note: a number goes stale silently, a command does not.
- **The 300-line limit does not apply under `00-Meta/Documentation/`.** A chapter note may be long and must not be
  split into fragments.

Before writing any report *prose*, read [reference/style-reference.md](00-Meta/Documentation/reference/style-reference.md).

> The module's actual requirements are unknown: no chapter catalogue, page count or deadline exists anywhere in
> this repository. The 13-chapter structure is adapted from a sample report for a **different module with a
> different professor**, weighted toward project management because that is this module's focus. Keeping the notes
> prose-free is what makes a later re-map a re-sort rather than a rewrite. See
> [reference/report-checklist.md](00-Meta/Documentation/reference/report-checklist.md), which is explicitly
> non-binding.

## Design and UI

Design and UI are developed with **Claude Design**, which has access to this directory.

Claude Code does **not** invent design rules (no colour palettes, spacing scales, typography systems or component
looks) and does not overwrite existing ones. When a design specification is missing for something you need to build,
ask the user rather than filling the gap yourself.

## Git workflow

Branches:

- `main`: always a working, playable build. **No direct pushes, no direct commits.**
- `dev`: integration branch. Feature branches merge here; `dev` merges into `main` for releases.
- `feature/<issue>-<slug>` / `fix/<issue>-<slug>`: branched off `dev`, e.g. `feature/37-dice-pool-ui`.

> This supersedes the GitHub Flow description in [Brainstorming.md](Brainstorming.md) (feature branches off `main`,
> no `dev`). The rest of that file still applies: no direct pushes to `main`, minimum 1 review approval,
> **Squash and Merge**, `Closes #<n>` to auto-close issues.

Commits follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/): `feat:`, `fix:`, `docs:`,
`refactor:`, `test:`, `chore:`, `ci:`, with an optional scope (`feat(dice-pool): add D20 card`). Subjects are in
English, imperative mood.

**Commit automatically** as soon as a feature is implemented: do not wait to be asked. **Push only when the user
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

**This directory is gitignored: it is not committed and not pushed.** It is kept locally per machine so that
work-in-progress never has to be committed just to satisfy the logging step. Before running
`npm run docs:ai-index`, whoever generates the AI index chapter must first collect the other contributors'
`00-Meta/AI-Prompts/<github-username>/` folders out of band (e.g. a zip shared in chat) and place them locally
alongside their own, since git no longer does that collection automatically. See the 2026-08-10 decision in
[project-journal.md](00-Meta/Documentation/project-journal.md) for why.

One file per user **per day**, containing a JSON array. Append new entries; never rewrite existing ones. Entry schema:

```json
{
  "timestamp": "2026-08-06T17:03:00+02:00",
  "model": "claude-opus-5",
  "prompt": "<verbatim user prompt>",
  "issue": 37,
  "topic": "game-logic",
  "use": "implementation",
  "summary": "Short description of what was produced"
}
```

- `issue`: the GitHub issue number the prompt relates to, or `null` when there is no identifiable issue.
- `prompt`: verbatim. Pasted material and attachments are marked in square brackets rather than inlined, e.g.
  `[CLAUDE.md of another project, pasted as reference]`. Long multi-turn exchanges may be condensed with `…`,
  keeping the decisive turns.
- `topic`: one of `concept-architecture`, `game-logic`, `frontend-ui`, `debugging`, `tooling-tests`,
  `process-docs`. These are the six subsections of the AI index chapter.
- `use`: one of `informational`, `research`, `implementation`, `adopted`, `revised`. Omitted means
  `implementation`. Mark the two informational values explicitly; they are the minority, and they are what shows
  an answer was weighed rather than simply accepted.

The AI index chapter (`00-Meta/Documentation/notes/13-ai-index.md`) is **generated** from these files by
`npm run docs:ai-index` and is never hand-maintained. Log every prompt, including trivial ones: completeness is
the point, and a curated selection is worth less because the reader cannot tell what was left out.

Commit the log entry together with the work it produced, or as `chore(ai-log): ...` when there is no other change.

## Writing style

**The em dash does not appear anywhere in this project**, in any document, in any language. This covers both the
character itself and the rhetorical habit it enables: a claim interrupted mid-sentence by an inserted aside that
lists or sharpens it, followed by a stated consequence, or an "either A, in which case B, or C, in which case D"
construction for laying out alternatives. Two examples of that rhetorical habit, already rewritten in place in
[Feasibility-Study.md](00-Meta/Project-Management/Feasibility-Study.md), were:

> Sprint 1 therefore has to bootstrap the project before it can implement anything, install the toolchain, create
> the build, wire up tests and linting, and that work is not in Sprint 1's planned scope.

> The board defines Sprint 0–3 and stops, and its Sprint 3 is 1½ weeks. Either Sprint 3 is the buffer under another
> name, in which case the polish, audio and menu scope has to move earlier, or the buffer was dropped, in which
> case there is no slack at all behind 2026-09-17.

Write plainly instead: split into ordinary sentences, use a colon, semicolon or comma where a dash would have gone,
and state consequences directly rather than building up to them.

## Project management

GitHub Projects v2 board *Ludo Advanced* with Roadmap, Backlog and Kanban views.

- Phase labels: `2-definition`, `3-planning`, `4-implementation`, `5-completion`
- MoSCoW labels: `must have`, `should have`, `could have`
- Scrum: 3 sprints of 2 weeks plus a buffer sprint: see
  [01-Github-Project.md](00-Meta/Project-Management/01-Github-Project.md)

Roles: Fabian Gemming (Product Owner), Lars Bolender and Benedict Glatz (Scrum Members / implementation).
