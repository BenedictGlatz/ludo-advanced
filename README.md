# Ludo Advanced

A 2D web remake of Ludo where the single die is replaced by two card pools: draw your dice, play your skills.

![Status](https://img.shields.io/badge/status-in%20development-orange)
![License](https://img.shields.io/badge/license-TBD-lightgrey)

## About

Classic Ludo gives you one die and one decision: which pawn to move. Ludo Advanced adds two layers of choice on top of
the familiar board:

- **Dice Card Pool**: cards ranging from **D2 to D20**. At the start of your turn you draw 3 cards, pick the die you
  want to roll, and the 3 cards are shuffled back into the pool. A D20 can carry a pawn across the board: or overshoot
  the goal.
- **Skill Card Pool**: **Action** cards you play on your own turn and **Reaction** cards you play in response to
  another player's move (shield a pawn, swap positions, force a reroll).

Everything else stays true to Ludo: 2–4 players, four pawns each, leave the start area on the highest roll, capture by
landing exactly on an opponent, first player home wins.

The full rules are in [00-One-Pager.md](00-Meta/Project-Management/00-One-Pager.md).

## Tech stack

| Area          | Choice                            |
| ------------- | --------------------------------- |
| Language      | JavaScript (ES modules): no TypeScript |
| DOM / UI      | jQuery                            |
| Build         | Vite                              |
| Localization  | i18next (`de`, `en`)              |
| Unit tests    | Vitest                            |
| E2E tests     | Playwright                        |
| Lint / Format | ESLint + Prettier                 |

## Getting started

> **Setup pending.** The repository currently contains project documentation only. The commands below describe the
> intended workflow and become available once the npm project is bootstrapped.

**Prerequisites:** Node.js LTS (20 or newer) and npm.

```bash
git clone https://github.com/BenedictGlatz/ludo-advanced.git
cd ludo-advanced
npm install
npm run dev
```

The dev server prints a local URL: open it in your browser to play.

## Scripts

| Command                 | Description                        |
| ----------------------- | ---------------------------------- |
| `npm run dev`           | Start the Vite dev server          |
| `npm run build`         | Production build into `dist/`      |
| `npm run preview`       | Serve the production build locally |
| `npm run lint`          | Run ESLint                         |
| `npm run lint:fix`      | Run ESLint with `--fix`            |
| `npm run format`        | Format the codebase with Prettier  |
| `npm test`              | Run unit tests once                |
| `npm run test:watch`    | Run unit tests in watch mode       |
| `npm run test:coverage` | Unit tests with a coverage report  |
| `npm run test:e2e`      | Run Playwright end-to-end tests    |

Four more exist and are not part of the everyday loop. They generate things rather than check them, so
each is run by hand when its input changes:

| Command                   | Description                                                                    |
| ------------------------- | ------------------------------------------------------------------------------ |
| `npm run assets:card-art` | Extract the 36 card illustrations out of the Claude Design artboard into `src/ui/art/` |
| `npm run docs:ai-index`   | Generate the AI index chapter from the local AI prompt logs                    |
| `npm run docs:dice-balance` | Derive and measure the dice pool balance quoted in the game design document  |
| `npm run test:seeds`      | Search for the fixed RNG seeds the end-to-end suite pins                       |

## The address bar

Read once, by `src/options.js`, on behalf of `src/main.js`. Every one of them falls back rather than
failing, so a malformed URL starts a normal game.

| Parameter    | Effect                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------- |
| `?seed=42`   | Fixes the RNG, so the same match plays out the same way every time (NFR-09)                 |
| `?players=4` | Starts a match with that many players at once, **skipping the main menu**. 2, 3 or 4        |
| `?bots=3`    | Hands the last seats to the computer. Needs `?players=`, and always leaves one person in    |
| `?fast=1`    | Shortens the pauses in the turn loop and passes the handover screen without waiting for it  |

**`?bots=` is how you play alone today.** `/?players=4&bots=3` seats you first and lets the computer
play the other three: they pick their dice card, roll it, move a pawn, and never play a skill card. The
hand-over screen stays away, because there is nobody to hand the keyboard to. Choosing bots from the
menu instead of the address bar is a separate issue, waiting on a design for the setup screen.

`?players=` and `?fast=1` exist for the end-to-end suite. They are what let every spec written before
the main menu and the handover screen existed keep running unchanged, and they change the waiting rather
than the rules: a run with `?fast=1` plays exactly the same turn, only quicker.

## Project structure

```
src/
  core/    Pure game rules: board, movement, capture, turn manager, card pools
  state/   Game state and its transitions
  ai/      Rule-based bot players: reads state, returns intents
  ui/      jQuery rendering and input handling
  i18n/    i18next setup and locale files
tests/
  unit/    Vitest
  e2e/     Playwright
00-Meta/
  Project-Management/  Rulebook, sprint plan and meeting notes
  Documentation/       Living notes for the final project report
  AI-Prompts/          The AI prompt log
```

Game rules live in `core/` and never touch the DOM, which keeps them testable without a browser.

## Testing

```bash
npm test                                          # all unit tests
npm run test:coverage                             # with coverage report
npx vitest run tests/unit/dice-pool.test.js       # a single unit test file
npx vitest run -t "captures an opponent pawn"     # a single test by name
npm run test:e2e                                  # all end-to-end tests
npx playwright test tests/e2e/turn-flow.spec.js   # a single E2E spec
```

Target coverage is at least 80 % of lines in `src/core/` and `src/state/`; the UI layer is covered by E2E tests.

## Localization

The interface ships in **German (`de`)** and **English (`en`)**. No user-facing string is hardcoded: every one of them
is an i18next key.

To add a language, copy `src/i18n/locales/en.json` to `<code>.json`, translate the values (leave the keys untouched),
and register the locale in the i18next setup in `src/i18n/`.

## Contributing

- Branch off `dev` as `feature/<issue>-<slug>` or `fix/<issue>-<slug>`. `main` always holds a playable build and never
  receives direct pushes.
- Write [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) (`feat:`, `fix:`, `docs:`, …) and add
  `Closes #<n>` when a commit resolves an issue.
- Pull requests need at least one review approval and are merged with **Squash and Merge**.
- Record user-visible changes under `## [Unreleased]` in [CHANGELOG.md](CHANGELOG.md) in the same commit.
- Append the facts your change produced to the matching chapter note in
  [00-Meta/Documentation/](00-Meta/Documentation/00-index.md), also in the same commit. The project report is
  written alongside development, not at the end.

Full conventions, including the architecture rules and the AI prompt log, are documented in [CLAUDE.md](CLAUDE.md).

## Roadmap

| Sprint   | Weeks | Focus                                                    |
| -------- | ----- | -------------------------------------------------------- |
| Sprint 0 | 1     | Planning, rulebook, prototyping, repository setup         |
| Sprint 1 | 2–3   | Core gameplay: board, movement, turn manager, capture     |
| Sprint 2 | 4–5   | Dice pool, skill cards, multiplayer                       |
| Sprint 3 | 6–7   | Art, audio, menus, polish and fixes                       |
| Buffer   | 8     | Playtesting and presentation                              |

Details: [01-Github-Project.md](00-Meta/Project-Management/01-Github-Project.md).

## Team

| Name            | Role                              |
| --------------- | --------------------------------- |
| Fabian Gemming  | Product Owner                     |
| Lars Bolender   | Scrum Member: implementation     |
| Benedict Glatz  | Scrum Member: implementation     |

## License

To be determined.
