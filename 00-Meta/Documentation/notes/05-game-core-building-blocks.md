# 05 Game core: structure and building blocks

> **Covers:** `src/core/` — the game rules as pure functions. Board topology, pawn movement,
> capture, the dice card pool (D2–D20), the skill card pool and effect resolution, win conditions.
> **Does not cover:** how any of it is drawn (Chapter 04) or how a turn is sequenced and state is
> mutated (Chapter 06).

This is the chapter with the rules and the arithmetic in it. The sample report's equivalent section
sets out its formulas properly — with a legend for every variable, the source of every constant,
and the edge cases written into the text — and that is the standard to match here.

## What this chapter must answer

- The board as a data structure: how many squares, how the tracks and home columns are indexed, how
  a player's start offset is computed.
- Movement: the rule for leaving the start area, the rule for advancing, what happens on an
  overshoot of the goal.
- Capture: the exact-landing condition and its exceptions.
- The Dice Card Pool: what is in it, how the draw-3-pick-1-shuffle-back cycle works, and what that
  does to the distribution. A D20 is not twenty times a D2 in effect — the probability of leaving
  the start area falls as the die grows, and that trade-off is the heart of the design. State it
  with numbers.
- The Skill Card Pool: the Action/Reaction split, when each is playable, how an effect resolves,
  and what happens when a Reaction interrupts an Action.
- Win conditions.
- Edge cases, written into the text rather than left to the tests.

## Facts

*(Nothing yet — `src/core/` does not exist.)*

## Decisions

<!-- Promote decision blocks here from project-journal.md when this chapter is written. -->

## Open / to verify

- No source code exists yet. Declared target state from [CLAUDE.md](../../../CLAUDE.md): `core/` is
  pure — no DOM, no jQuery, no i18next, and no imports from `state/` or `ui/`. It runs and is tested
  without a browser.
- Card effects live here as pure functions over game state and are matched to their presentation in
  `ui/` by card id.
- The dice pool balance was to be paper-prototyped or spreadsheet-tested in Sprint 0
  ([01-Github-Project.md](../../Project-Management/01-Github-Project.md)). If that happened, the
  result is a table for the appendix; if it did not, say so.
- Unresolved rule questions carried over from Chapter 01: overshoot behaviour, and whether the
  highest-number-to-leave-start rule scales sensibly across D2 through D20.
