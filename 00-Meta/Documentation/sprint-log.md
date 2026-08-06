# Sprint log — planned versus delivered

Plan-versus-actual evidence for Chapter 11, tracked as **scope and dates** rather than hours. The
team decided against hour-level effort tracking; see the decision of 2026-08-06 in
[project-journal.md](project-journal.md).

Fill the *Delivered* and *Actual* columns when a sprint closes, not before. A sprint that overran or
dropped scope is recorded as it happened — an unexplained divergence is a problem, a divergence with
a reason is a finding.

**Planned scope is taken from** [01-Github-Project.md](../Project-Management/01-Github-Project.md).

**Planned dates are taken from the board** — four draft issues on
[GitHub project *Ludo Advanced*](https://github.com/users/BenedictGlatz/projects/3) act as sprint
markers and carry `Start Date` / `End Date`. Read 2026-08-06:

| Board marker | Start | End | Length |
| --- | --- | --- | --- |
| Sprint 0 | 2026-07-23 | 2026-08-09 | 2½ weeks |
| Sprint 1 | 2026-08-10 | 2026-08-23 | 2 weeks |
| Sprint 2 | 2026-08-24 | 2026-09-06 | 2 weeks |
| Sprint 3 | 2026-09-07 | 2026-09-17 | 1½ weeks |

> **Two contradictions with the written plan, both unresolved.** The board has **no buffer sprint** —
> it defines Sprint 0–3 and stops, while the plan is 3 sprints of 2 weeks plus a 1-week buffer. Board
> `Sprint 3` is 1½ weeks and sits where the buffer would, so it may *be* the buffer under a different
> name; nothing says so. And board `Sprint 0` runs 2½ weeks against the planned 1 week, starting
> 2026-07-23 — two weeks before the repository was created. Total span 2026-07-23 → 2026-09-17 is
> ~8 weeks, which does match the plan's 8-week total. Decide which numbering is authoritative and
> record it here; the tables below use the board dates in the meantime.

---

## Sprint 0 — Planning and prototyping (board: 2026-07-23 → 2026-08-09)

| | |
| --- | --- |
| **Planned start** | 2026-07-23 (board) |
| **Planned end** | 2026-08-09 (board) |
| **Actual start** | 2026-08-06 (repository creation) |
| **Actual end** | *open* |

**Planned scope**

- Define the rulebook for the Ludo variation: board layout, win conditions, how skill cards are
  drawn and played, dice pool maths.
- Paper-prototype or spreadsheet-test the card mechanics and dice pool balance.
- Set up the repository, the project, and the GitHub Projects board.
- Agree asset formats, screen resolution and coding standards.

**Delivered**

- Repository and GitHub project created (2026-08-06).
- Coding standards and conventions fixed in `CLAUDE.md`; stack decided.
- Rulebook exists at one-pager level only — board layout and win conditions are not specified to
  edge cases.
- Documentation notes structure established.

**Divergence and reasons**

- *open — record when the sprint closes.*
- Not yet done: dice pool balance prototyping, asset formats, screen resolution.

---

## Sprint 1 — Core gameplay and board MVP (board: 2026-08-10 → 2026-08-23)

| | |
| --- | --- |
| **Planned start** | 2026-08-10 (board) |
| **Planned end** | 2026-08-23 (board) |
| **Actual start** | *open* |
| **Actual end** | *open* |

**Planned scope**

- Board layout and tile grid logic.
- Standard 1–6 dice roll and basic pawn movement.
- Turn manager (Player 1 → Player 2 → Player 3 → Player 4 / AI).
- Basic knockout/capture mechanic on landing on an opponent token.

**Delivered** — *open*

**Divergence and reasons** — *open*

---

## Sprint 2 — Skill cards, dice mechanics, multiplayer (board: 2026-08-24 → 2026-09-06)

| | |
| --- | --- |
| **Planned start** | 2026-08-24 (board) |
| **Planned end** | 2026-09-06 (board) |
| **Actual start** | *open* |
| **Actual end** | *open* |

**Planned scope**

- Dice pool: special dice and the selection UI.
- Skill cards: deck system, hand UI, action system (shield token, swap positions, reroll).
- Resource/energy system for buying or using cards and enhanced dice.

**Delivered** — *open*

**Divergence and reasons** — *open*

> The resource/energy system appears only in this sprint plan, not in the one-pager or the README.
> Whether it is in scope is undecided — see [notes/01-requirements-and-goals.md](notes/01-requirements-and-goals.md).
> Multiplayer has no chosen technology and may end up local hot-seat only.

---

## Sprint 3 — Polish, art, audio, fixes (board: 2026-09-07 → 2026-09-17)

| | |
| --- | --- |
| **Planned start** | 2026-09-07 (board) |
| **Planned end** | 2026-09-17 (board) |
| **Actual start** | *open* |
| **Actual end** | *open* |

**Planned scope**

- 2D sprites, animations, UI skins, particle effects for skills and cards.
- Sound effects (dice rolls, card play, victory) and background music.
- Main menu, pause menu, win/loss screens, restart flow.

**Delivered** — *open*

**Divergence and reasons** — *open*

---

## Buffer sprint — Playtesting and presentation (week 8)

> **Not present on the board.** The board defines Sprint 0–3 only. Either board `Sprint 3`
> (2026-09-07 → 2026-09-17) doubles as this sprint, or the buffer was dropped when the board was
> laid out. Unresolved — see the note at the top of this file.

| | |
| --- | --- |
| **Planned start** | *not on board* |
| **Planned end** | *not on board* |
| **Actual start** | *open* |
| **Actual end** | *open* |

**Planned scope**

- Playtesting with 3–5 external people playing without instructions, to surface UI problems.
- Fallback video: a 2-minute clean gameplay walkthrough, in case live hardware fails during the
  presentation.
- Presentation deck covering Scrum velocity, burn-down charts, architecture decisions and mechanic
  trade-offs.

**Delivered** — *open*

**Divergence and reasons** — *open*

> Velocity and burn-down charts need real board data to exist. If story points are never recorded,
> those slides cannot be produced — decide early, not in week 8.
>
> **Confirmed 2026-08-06: as the board stands, neither chart can be produced.** There is no story
> point field and no Iteration field, and `Status` and `Sprint` are unset on all 50 items — so there
> is no estimate to sum and no dated status history to burn down against. See the negative findings
> in [notes/02-project-management.md](notes/02-project-management.md#board).
