# SMART Analysis: Project Goals

Formulation of the Ludo Advanced project goal and its four sub-goals against the five SMART criteria,
done for issue **#9 (`documentation`, `2-definition`)**.

Until now the project had an *intention* but no goal that anyone could check. The intention is stated
in [00-One-Pager.md](00-One-Pager.md) — give the player "more options than just rolling dice" — and
the scope is carried by four `must have` epic **titles** (#36–#39) whose issue bodies are empty. None
of that says what "done" means, by when, or how a third person would verify it. This document closes
that gap, because the definition-phase issues that follow — #10 *Functional vs. Non-Functional
Goals*, #13 *Requirements Specification + MoSCoW*, #23 *Test Plan and Quality Strategy* — all need a
fixed goal to build on, and Chapter 11 of the report needs a plan to measure the actual result
against.

## Method

Five criteria, applied in the usual order:

| | Criterion | What it demands here |
| --- | --- | --- |
| **S** | Specific | Names the mechanics that must work, not an adjective like "advanced" or "polished". |
| **M** | Measurable | Every criterion names the artefact, board state or command that proves it. |
| **A** | Achievable | Justified against this team (three students, two of whom do not know C#) and this schedule. |
| **R** | Relevant | Justified against the MoSCoW priorities and the module's project-management focus. |
| **T** | Time-bound | A date, taken from the sprint markers on the board. |

Two rules were applied while writing it. **Goals are formulated, not audited** — this is a definition-
phase document, so it produces the goal rather than grading the existing wording. And **only facts
already on record are used as evidence**: the one-pager, the board labels and sub-issue links, the
engineering rules in [CLAUDE.md](../../CLAUDE.md), and the sprint dates in
[sprint-log.md](../Documentation/sprint-log.md). Nothing here is an estimate invented for this
document.

## Scope boundary

This document defines **goals**. It does not define requirements, risks or non-functional properties:

- Non-functional goals beyond the three already fixed in the repository (German/English localisation,
  the ≥ 80 % coverage target, the 300-line file limit) belong to **#10**. They appear below only as
  measurable criteria, not as newly invented requirements.
- The requirements specification and the MoSCoW rationale belong to **#13**.
- Risks belong to **#11**, feasibility to **#12**. The *achievability* argument below is deliberately
  short for that reason — it cites the decision already taken, it does not re-run the risk analysis.

## The overall project goal

> By **2026-09-17**, the three-person team delivers **Ludo Advanced** as a browser-playable 2D Ludo
> variant in which **2–4 players can complete a full game from the start area to victory**, with both
> card pools in play — the **Dice Card Pool** (D2–D20; draw 3, pick 1, roll it, shuffle all 3 back)
> and the **Skill Card Pool** (*Action* cards on the player's own turn, *Reaction* cards in response
> to another player) — with all four `must have` epics **#36–#39** closed, **≥ 80 % line coverage**
> in `src/core/` and `src/state/`, and the interface fully localised in German and English with no
> hardcoded user-facing string.

| | How the goal satisfies the criterion | Evidence on record |
| --- | --- | --- |
| **S** | It names the player count, the two card pools with their exact draw rule, and the win path. A build that renders a board but never reaches a victory does not meet it. | [00-One-Pager.md](00-One-Pager.md) |
| **M** | Five independent checks, none of which needs a judgement call: a full game completes with 2, 3 and 4 players; #36–#39 are closed on the board; `npm run test:coverage` reports ≥ 80 % lines for `src/core/` and `src/state/`; `de.json` and `en.json` resolve every visible string; no source file exceeds 300 lines. | [CLAUDE.md](../../CLAUDE.md) |
| **A** | The scope was cut to a 2D web build on 2026-08-06 *in order to* make it achievable — the team stays in JavaScript, which all three already use, instead of learning C#. The Nutzwertanalyse for issue #47 scores that option 4.20 of 5.00 against 2.30 for full 3D, on team competence and time. | Decision block 2026-08-06 in [project-journal.md](../Documentation/project-journal.md) |
| **R** | The goal is the `must have` set **exactly** — nothing added, nothing dropped. Online multiplayer (#42, `should have`) and the LLM bot, expanded card set, trap cards and rule toggles (#43–#46, `could have`) are outside it by design, matching the one-pager's framing of multiplayer and AI opponents as extensions. | MoSCoW table in [notes/01-requirements-and-goals.md](../Documentation/notes/01-requirements-and-goals.md) |
| **T** | 2026-09-17, the end of Sprint 3 on the board, with the four sub-goal dates below as intermediate checkpoints rather than a single end-of-project deadline. | Sprint markers in [sprint-log.md](../Documentation/sprint-log.md) |

## Sub-goals

One sub-goal per `must have` epic. The epic → sub-issue mapping is the one verified against GitHub's
`/sub_issues` API on 2026-08-06 and recorded in
[notes/01-requirements-and-goals.md](../Documentation/notes/01-requirements-and-goals.md); the dates
are the board's sprint end dates.

| | Epic | Deadline | Sprint |
| --- | --- | --- | --- |
| **SG1** | #36 Core Game Engine & Board | 2026-08-23 | Sprint 1 |
| **SG2** | #37 Enhanced Dice Pool System | 2026-09-06 | Sprint 2 |
| **SG3** | #38 Skill Cards Mechanics | 2026-09-06 | Sprint 2 |
| **SG4** | #39 UI / UX, Audio & Game State | 2026-09-17 | Sprint 3 |

### SG1 — Core game engine and board, by 2026-08-23

> By 2026-08-23 a game of 2 to 4 players runs headlessly in `src/core/`: pawns leave the start area,
> move along the track, capture opponents by landing exactly on their square, and the turn manager
> cycles players in order until one player has all four pawns home.

| | |
| --- | --- |
| **S** | Board topology, pawn movement, capture and turn order — no rendering, no cards. |
| **M** | #26, #27, #28 and #29 closed; unit tests show a pawn moved from start to home, a captured pawn returned to its start area, and turn order cycling correctly for 2, 3 and 4 players. |
| **A** | These are the classic Ludo rules, already described in the one-pager, in a language the team uses daily. It is the largest sub-goal by sub-issue count and also the best understood. |
| **R** | Everything else sits on top of it: neither a dice card nor a skill card can be tested without a board and a turn to apply it to. |
| **T** | End of Sprint 1 on the board, matching the Sprint 1 scope in [01-Github-Project.md](01-Github-Project.md). |

### SG2 — Enhanced dice pool, by 2026-09-06

> By 2026-09-06 the single die is replaced by the Dice Card Pool: at the start of a turn the player
> is dealt 3 cards from a pool ranging from D2 to D20, chooses one, rolls that die, and all 3 cards
> are shuffled back.

| | |
| --- | --- |
| **S** | Pool contents (D2–D20), the draw-3 / pick-1 / roll / return-3 cycle, and the card selection UI. |
| **M** | #30 and #31 closed; a unit test shows the pool size unchanged after a full turn; a player can select a card and see the rolled value; leaving the start area triggers on the chosen die's highest number, not on a fixed 6. |
| **A** | Pure data and a random draw over the board built in SG1 — no new dependency, and the rule is already fixed at one-pager level. |
| **R** | The first of the two mechanics that make this variant *advanced* rather than classic Ludo. |
| **T** | End of Sprint 2 on the board. |

### SG3 — Skill card mechanics, by 2026-09-06

> By 2026-09-06 players hold skill cards and can play them: *Action* cards on their own turn and
> *Reaction* cards in response to another player's action, with each card's effect implemented as a
> pure function over game state in `src/core/` and matched to its presentation by card id.

| | |
| --- | --- |
| **S** | Deck and hand management, the Action/Reaction distinction, and effect execution. |
| **M** | #32, #33 and #34 closed; at least one Action card and one Reaction card playable end to end; a unit test rejects a Reaction card played outside another player's action; every implemented card effect has its own unit test. |
| **A** | The *number* of cards is deliberately not part of this goal — the expanded card set is #44 (`could have`). A small working set satisfies it, which is what keeps the sub-goal deliverable inside one shared sprint with SG2. |
| **R** | The second of the two mechanics that define the variant. Without Reaction cards the game is a solitaire sequence of turns rather than an interactive one. |
| **T** | End of Sprint 2 on the board, shared with SG2. |

### SG4 — UI, audio and game state, by 2026-09-17

> By 2026-09-17 the game is playable end to end in a browser by someone who has not read the code:
> main menu, in-game HUD, pause, win screen and restart, with audio feedback, in German or English.

| | |
| --- | --- |
| **S** | The player-facing shell around the rules: menus, HUD, screen flow, sound, localisation. |
| **M** | #35, #40 and #41 closed; a Playwright test per player-facing flow (take a turn, pick a dice card, play a skill card, capture a pawn, win); a player reaches the win screen and restarts without reloading the page; switching locale changes every visible string, and no hardcoded user-facing string remains in `src/`. |
| **A** | Technically the least risky sub-goal — jQuery rendering over a state object that already exists. It is, however, the one most exposed to overrun, because it sits last and absorbs any slippage from SG1–SG3. |
| **R** | The overall goal says *browser-playable*. Without a win screen and a restart the result cannot be demonstrated in the presentation, and the playtest with external people cannot be run at all. |
| **T** | End of Sprint 3 on the board — the same date as the overall goal, so SG4 has no slack behind it. |

## Prerequisites for measurability

Three of the five criteria (S, A, R) could be satisfied from records that already exist. **M could
not.** The criteria above are written as they should be checked, but four things have to exist before
any of them can actually be read off. Recording this is the point — a measurable criterion with no
measuring apparatus is not measurable, it is just phrased as if it were.

| Missing | Which criterion it blocks | Proposed owner | By |
| --- | --- | --- | --- |
| Acceptance criteria in the bodies of #36–#39 | All four sub-goals. Every one of the 46 issues has an empty body, so "epic closed" currently means only that someone ticked a box. | Product Owner, with each epic's implementer | 2026-08-23 |
| A written **Definition of Done** | All four. It has never been written down anywhere, so "done" is not comparable between the three of us. **Written 2026-08-22 (issue #23)** in section 5 of [Test-Plan-and-Quality-Strategy.md](Test-Plan-and-Quality-Strategy.md), at three levels: issue, sprint and release. What is still outstanding is its adoption: no sprint has been closed against it and the team has not confirmed it in a planning slot. | Whole team, one sprint-planning slot | 2026-08-23 |
| A runnable test and build setup | The ≥ 80 % coverage criterion. No `package.json` and no source code exist yet, so `npm run test:coverage` has never produced a reading — the figure is a target, not a status. | Scrum members, with the first `src/` commit | Sprint 1 |
| Board `Status` and `Sprint` values | Nothing above directly, but the epics cannot be tracked toward their dates while both fields are unset on all 50 board items. | Whoever owns the board configuration | 2026-08-23 |

**Velocity and burn-down are deliberately not used as criteria here.** They are named as
presentation content for the final sprint, but the board carries no story-point field and no
Iteration field, so there is no estimate to sum and no dated status history to burn down against —
confirmed 2026-08-06, see [notes/02-project-management.md](../Documentation/notes/02-project-management.md).
Making a project goal depend on a metric that cannot currently be produced would have made the goal
unmeasurable by construction. Whether those fields get added is a separate decision, tracked in
[00-index.md](../Documentation/00-index.md).

## Interpretation

Two things stand out.

**The goal was always definable; what was missing was a date and a set of checks.** Specific,
Achievable and Relevant could each be argued directly from documents written before this one — the
one-pager for *what*, the 2026-08-06 scope cut for *why it is doable*, the MoSCoW labels for *why it
matters*. The project was never vague about its content. It was vague about its verification, and
that is exactly where the two constructed criteria (M and T) both rest on artefacts that do not exist
yet: a test setup, and a confirmed deadline.

**The tightest sub-goal is SG1, not SG4.** The intuitive reading is that the last sprint carries the
risk, because it absorbs every earlier delay. But SG1 has the most sub-issues (four), it is the
foundation the other three build on, and its sprint starts on 2026-08-10 — one day after this
document — with **no source code, no `package.json` and no tooling in the repository at all**. Sprint
1 therefore contains its own bootstrap before the first rule can be written, which is not in its
planned scope. If any date in this analysis slips, it will most likely be 2026-08-23, and it will
slip for a reason that has nothing to do with Ludo.

## Conclusion

The overall goal and the four sub-goals are formulated so that on 2026-09-17 the question "did we
reach it" has an answer that does not depend on who is asked. The measurable criteria are stated as
checks against artefacts — closed issues, passing tests, a coverage command, a locale file — rather
than as impressions of quality.

**One caveat, stated plainly rather than hidden in the phrasing.** 2026-09-17 is the end of Sprint 3
as recorded on the GitHub board, and it is the *only* calendar date in this repository. The actual
module submission and presentation date is unknown, and is a standing open question in
[00-index.md](../Documentation/00-index.md). Two further contradictions come with the board dates and
are still unresolved: the board defines no buffer sprint although the written plan has one, and its
Sprint 0 runs 2½ weeks against a planned 1 week — both recorded in
[sprint-log.md](../Documentation/sprint-log.md). Should the real deadline turn out to be different,
every `T` value re-anchors to it and the sub-goal dates shift with the sprint boundaries. That is a
date substitution, not a rewrite, which is the reason the dates were taken from a single named source
instead of being distributed through the text.
