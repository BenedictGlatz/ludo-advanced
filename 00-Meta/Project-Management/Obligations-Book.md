# Obligations Book

What will be built to satisfy the requirements: the system architecture it is built on, the screens it
consists of, the technology it is built with, and the platform it runs on.

**Relationship to the requirements specification, stated first because it is the risk in this
document.** [Requirements-Specification.md](Requirements-Specification.md) is the *what*: 45
functional and 12 non-functional requirements, each with an acceptance criterion and a MoSCoW
priority. This document is the *how*. No requirement is restated here. Every section instead names the
FR and NFR ids it answers, so that a reader can check a commitment against the requirement it serves
without the two documents drifting apart. Where a decision has already been taken in another document,
this one cites it and does not repeat it.

**Nothing in this document is verified.** The repository has no `package.json` and no `src/`, so every
commitment below is a plan. That is stated once here rather than in every section.

---

## 1 System architecture

Full document: [System-Architecture.md](System-Architecture.md). It is not redrawn here, because two
copies of a diagram diverge on the first change.

What this document commits to by citing it:

| Commitment | Requirement |
| --- | --- |
| Five units: `core/` for pure rules, `state/` for the single writable state object and its transitions, `ui/` for jQuery rendering and event binding, `i18n/` for i18next and the two locale files, `main.js` as the composition root | NFR-01 |
| `core/` imports nothing from `state/` or `ui/`, and `ui/` never mutates state but dispatches intents into `state/` | NFR-01 |
| 8 modules in `core/`, 4 in `state/` and 7 in `ui/`, each owning a named block of functional requirements | NFR-02 |
| One data flow with no second path: DOM event, intent, rule check in `core/`, transition in `state/`, re-render in `ui/` | NFR-01, FR-32 |
| The RNG enters `core/` as an argument, so a test can supply a fixed sequence | NFR-09 |
| No file over 300 lines, in source, tests or config | NFR-02 |

The two rejected alternatives, game rules inside jQuery event handlers and a service layer between
`state/` and `core/`, are argued in section 5 of that document.

---

## 2 GUI

### 2.1 Scope boundary

This section names **screens, their responsibility and the requirements they serve**. It does not name
colours, spacing, typography or component looks. Those are Claude Design's territory and belong to
issue #3, per [CLAUDE.md](../../CLAUDE.md) *Design and UI*, and inventing them here would be exactly
the invented design rule that file forbids. The boundary is drawn at that line: what has to be on
screen is a requirement, what it looks like is a design decision.

### 2.2 Screen inventory

Nine screens and screen regions. The board screen is one screen with five regions rather than five
screens, because the player never navigates between them: all five are visible at once, which is what
FR-31 asks for.

| # | Screen | Responsibility | Requirements | Issue |
| --- | --- | --- | --- | --- |
| S1 | Main menu | Entry point. Starts a match. **As built on 2026-09-01 it does not reach a settings screen**: the language switch lives in the always-present chrome instead, see S11, and the rules screen still has no issue. | FR-38 | #41 |
| S2 | Match setup | Choose the player count from 2, 3 or 4 and start the match. | FR-01 | #41 |
| S3 | Board | The track, the four start areas, the four home columns, the home slots and every pawn, rendered from state. | FR-31, FR-02, FR-08 | #26, #28 |
| S4 | Dice hand | The 3 drawn dice cards, the choice between them, and the roll result. | FR-18, FR-19, FR-31, FR-33 | #30, #31 |
| S5 | Skill hand | The active player's skill cards, which of them are playable now, and the reaction prompt when a window is open. | FR-23, FR-24, FR-25, FR-31 | #34 |
| S6 | Move hints and refusal | Highlights the legal-move set before the player commits, and states the reason when there is no legal move or a move is refused. | FR-32, FR-14, NFR-08 | #28 |
| S7 | HUD | Per-player progress: pawns in the start area, on the track, home. Progress only, no resource display. | FR-36 | #35 |
| S8 | Pause | Reachable at any point in a turn. Resume, or abandon back to the main menu. | FR-07 | #41 |
| S9 | Win | Names the winner and offers a restart without a page reload. | FR-05, FR-06 | #41 |

Two screens are `should have` rather than `must have` and are listed separately, so that the MVP
boundary stays readable:

| # | Screen | Responsibility | Requirements | Issue |
| --- | --- | --- | --- | --- |
| S10 | Rules screen | Explains dice cards, skill cards and the leaving-the-start-area rule, reachable from the menu and from a match. | FR-35 | none |
| S11 | Audio and language settings | Mute, and the runtime switch between German and English. **Split on 2026-09-01.** Audio was deferred with #40, and the language half is a must-have (FR-34) with no issue of its own, so it was built as a button in the always-present chrome rather than left on a screen that no longer had a reason to exist. What is outstanding here is the mute, not the language. | FR-34, FR-41 | #40 for audio; the language half shipped inside #39 |

### 2.3 What the GUI owes the rules

Three obligations that are easy to miss because they are not screens:

- **The reaction window has a place on screen.** It is a phase of the turn held by
  `state/turn-manager.js`, and section 6.6 of [Game-Design-Document.md](Game-Design-Document.md)
  prompts every eligible player in turn order. In a hot-seat game all of them share one screen (FR-03),
  so the prompt is a modal state of S5 and not a separate screen.
- **Every refusal carries a reason.** NFR-08 requires that a player can state why a move was refused
  without being told. S6 is the whole of that requirement, and it is the reason the legal-move set is
  computed in `core/` and handed to the view rather than re-derived while rendering.
- **Players are distinguishable without colour.** NFR-12 requires a second, non-colour identifier per
  player. The rules layer supplies a stable player identity; which identifier renders it is a Claude
  Design decision, per section 6.8 of the game design document.

### 2.4 Not decided here

- ~~How the board is drawn: SVG, a CSS grid or `<canvas>`.~~ **Decided 2026-08-29: real DOM elements
  laid out by CSS Grid**, with SVG and `<canvas>` recorded as the rejected alternatives. The reasoning
  is the decision block of that date in
  [project-journal.md](../Documentation/project-journal.md), and section 6 of
  [System-Architecture.md](System-Architecture.md) carries the correction to its own deferral. The
  practical consequence for this document: the screen inventory of section 2.2 is now backed by a DOM
  contract, written into `01-Design/Handoff/01-brief-foundations-and-board.md`, which names the exact
  elements and data attributes each region of screen S3 consists of.
- Screen resolution and asset formats. They were Sprint 0 scope in
  [01-Github-Project.md](01-Github-Project.md) and were never agreed; see the Sprint 0 divergence in
  [sprint-log.md](../Documentation/sprint-log.md).
- Whether S3 through S7 are one route or several. A single-screen game has no routing question worth
  answering, and this document does not invent one.

---

## 3 Technology

### 3.1 The stack

| Layer | Technology | Version | Purpose |
| --- | --- | --- | --- |
| Language | JavaScript, ES modules | n/a | The whole application. No TypeScript, no build-time type checking (NFR-04). |
| DOM and events | jQuery | 4.0.0 | Rendering and event binding in `ui/`. |
| Localisation | i18next | 26.4.0 | German and English at runtime (FR-34, NFR-03). |
| Build and dev server | Vite | 8.2.2 | `npm run dev`, and a static `dist/` from `npm run build` (NFR-06). |
| Unit tests | Vitest | 4.1.11 | `core/` and `state/`, plus the coverage figure (NFR-05), through `@vitest/coverage-v8` 4.1.11. |
| E2E tests | Playwright | 1.62.1 | The player-facing flows through `ui/`, as `@playwright/test`. |
| Lint and format | ESLint 10.9.1 with `@eslint/js` 10.0.1, Prettier 3.9.6 | see cell | Style and static checks, plus the two rules that enforce NFR-01 and NFR-02. |

Runtime environment used for the bootstrap: Node v24.11.0, npm 11.6.1.

**The version column was empty until 2026-08-29 and is now filled from the real `package.json`**,
created in the same commit as the project bootstrap. It is a copy and it will go stale, so the rule
that applies to every other number applies here as well: the authority is `package.json`, and if this
table and that file disagree, the file wins. The measured figures with their commands live in
[notes/09-source-code-overview.md](../Documentation/notes/09-source-code-overview.md).

**One version worth reading twice: jQuery is 4.0.0, not 3.x.** No document in this repository ever
said which major version, and jQuery 4 removes a set of long-deprecated APIs. Nothing built so far
uses them, so it costs nothing today. It is written down because an answer or a tutorial written for
jQuery 3 will not always apply.

### 3.2 Why this stack

The engine decision is argued in [Utility-Value-Analysis.md](Utility-Value-Analysis.md): six weighted
criteria, 2D web at 4.20 of 5.00 against 2.5D at 2.75 and Unity 3D at 2.30, decided mainly on team
competence and available time, which together carry half the weight. Its non-obvious finding is worth
carrying here, because it is the one that matters if scope is renegotiated: 2.5D scores *above* full 3D
and is still not a safe middle ground, since it inherits the C# and Unity risk without buying back much
of 3D's visual advantage.

The technical feasibility of the stack is affirmed without conditions in
[Feasibility-Study.md](Feasibility-Study.md): the MVP mechanics reduce to data and pure functions, there
is no physics, no real-time loop, no server and no networking in the MVP, and the Vite output is a
static directory with no infrastructure to operate.

Two reasons are still missing and are recorded as missing rather than invented: **why jQuery** over
plain DOM APIs or a component framework, and **why Vite** over another bundler. Both are open items in
[notes/03-tech-stack.md](../Documentation/notes/03-tech-stack.md). A deliberate choice with no recorded
reason reads as an accident in a report, which is why the gap is named here instead of being filled
with a plausible sentence.

### 3.3 Dependency policy

From [CLAUDE.md](../../CLAUDE.md), binding on every contributor:

- Runtime dependencies are limited to `jquery` and `i18next` (NFR-04). Approved development
  dependencies: Vite, ESLint, Prettier, Vitest, Playwright.
- Any further dependency, runtime or development, is asked for before it is installed. A dependency
  need is flagged when it is identified, not when a feature is blocked on it.
- Dependency licences are unverified. The check runs against each package's own `LICENSE` file once
  `package.json` exists; it is recorded in the feasibility study as a task and no licence is claimed
  anywhere from memory.

---

## 4 Platform

| Aspect | Commitment | Requirement |
| --- | --- | --- |
| Runtime | The browser. No installation, no plugin, no download. | NFR-06, NFG-06 |
| Browsers | Current and previous major versions of Chrome, Firefox and Edge. | NFR-10 |
| Devices | Desktop only. Mobile and tablet are out of scope for the MVP. | NFR-10 |
| Backend | None. The game is a static build; there is no server, no database and no account. | NFR-06 |
| Networking | None in the MVP. Play is hot-seat: all players share one device and one browser tab. | FR-03 |
| Build output | A static `dist/` from `npm run build`, servable as plain files. | NFR-06 |
| Persistence | None beyond the browser session. Surviving a page reload is FR-45, `could have`. | FR-45 |

**The deployment target is undecided.** GitHub Pages and itch.io are both named as candidates in
[Feasibility-Study.md](Feasibility-Study.md), and neither has been chosen. Nothing in the MVP depends
on the choice, because any static host serves a Vite build, which is why the decision can stay open
without blocking work. It is named here as undecided rather than presented as settled.

**Desktop-only is a scope decision, not an oversight.** NFR-10 states it and it has a consequence worth
printing: a board with 52 shared squares, four start areas, four home columns and two card hands on one
screen is a layout problem on a phone, and solving it is design work nobody has scheduled. The MVP
therefore does not attempt it.

---

## 5 Known gaps

Printed rather than smoothed over, because each one is a real obligation this document cannot yet meet.

- **The acceptance criteria are still not on the issues.** They live in
  [Requirements-Specification.md](Requirements-Specification.md); all backlog issues have empty bodies.
  Until the criteria are copied onto the issues or the issues link to them, the board prioritises
  titles. Recorded in the specification's own known gaps and in
  [SMART-Analysis.md](SMART-Analysis.md) under *Prerequisites for measurability*.
- **Multiplayer has no chosen technology.** FR-42 is `should have`, is the largest single item in the
  backlog and is specified in one line. Section 6 of [System-Architecture.md](System-Architecture.md)
  deliberately does not answer where a network layer would attach, because the answer would be
  guesswork.
- **The deployment target is unchosen**, as in section 4.
- **Two screens have no backlog issue.** S10, the rules screen (FR-35), and the language half of S11
  (FR-34, `must have`, with NFR-03) appear in no issue on the board. FR-34 being a must-have
  requirement with no issue is the more serious of the two: the board understates the remaining work
  by that much. Carried into the effort estimation, issue #16.
- ~~**No design specification exists.**~~ **Closed on 2026-08-30.** Design handoff 01 landed under
  issue #3. The reasoning is in
  [01-Design/Handoff/01-spec-foundations-and-board.md](../../01-Design/Handoff/01-spec-foundations-and-board.md),
  which answers sixteen numbered decisions covering colour, spacing, typography, board geometry,
  motion, the two skins and every state in the DOM contract. The design system itself is not a
  document: it is `src/ui/styles/tokens.css`, `board.css`, `board-track.css`, `pawn.css` and
  `refusal.css`, which is what the build ships. **This document points at both and absorbs neither.**
  It covers screens S3 and S6 only; S4, S5, S7 and the menus still have no design and belong to
  issues #37, #38 and #39.
- **Nothing here is verified**, as stated at the top. The first commit that creates `src/` is the first
  evidence that any of it survives contact with code.
