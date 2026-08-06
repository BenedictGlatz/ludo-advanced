# Sprint log — planned versus delivered

Plan-versus-actual evidence for Chapter 11, tracked as **scope and dates** rather than hours. The
team decided against hour-level effort tracking; see the decision of 2026-08-06 in
[project-journal.md](project-journal.md).

Fill the *Delivered* and *Actual* columns when a sprint closes, not before. A sprint that overran or
dropped scope is recorded as it happened — an unexplained divergence is a problem, a divergence with
a reason is a finding.

**Planned scope is taken from** [01-Github-Project.md](../Project-Management/01-Github-Project.md).

> **Dates are missing.** The sprint plan defines only relative week numbers, with no calendar
> boundaries anywhere in the repository. Week 1 began on or around 2026-08-06 (repository creation),
> which puts the buffer sprint at roughly the start of October, but this has not been confirmed.
> Fix this before the first sprint closes — plan-versus-actual with no planned dates shows nothing.

---

## Sprint 0 — Planning and prototyping (week 1)

| | |
| --- | --- |
| **Planned start** | 2026-08-06 |
| **Planned end** | *TBD* |
| **Actual start** | 2026-08-06 |
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

## Sprint 1 — Core gameplay and board MVP (weeks 2–3)

| | |
| --- | --- |
| **Planned start** | *TBD* |
| **Planned end** | *TBD* |
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

## Sprint 2 — Skill cards, dice mechanics, multiplayer (weeks 4–5)

| | |
| --- | --- |
| **Planned start** | *TBD* |
| **Planned end** | *TBD* |
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

## Sprint 3 — Polish, art, audio, fixes (weeks 6–7)

| | |
| --- | --- |
| **Planned start** | *TBD* |
| **Planned end** | *TBD* |
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

| | |
| --- | --- |
| **Planned start** | *TBD* |
| **Planned end** | *TBD* |
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
