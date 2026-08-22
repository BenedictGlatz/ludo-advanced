# 05 Game core: structure and building blocks

> **Covers:** `src/core/`: the game rules as pure functions. Board topology, pawn movement,
> capture, the dice card pool (D2–D20), the skill card pool and effect resolution, win conditions.
> **Does not cover:** how any of it is drawn (Chapter 04) or how a turn is sequenced and state is
> mutated (Chapter 06).

This is the chapter with the rules and the arithmetic in it. The sample report's equivalent section
sets out its formulas properly, with a legend for every variable, the source of every constant,
and the edge cases written into the text, and that is the standard to match here.

## What this chapter must answer

- The board as a data structure: how many squares, how the tracks and home columns are indexed, how
  a player's start offset is computed.
- Movement: the rule for leaving the start area, the rule for advancing, what happens on an
  overshoot of the goal.
- Capture: the exact-landing condition and its exceptions.
- The Dice Card Pool: what is in it, how the draw-3-pick-1-shuffle-back cycle works, and what that
  does to the distribution. A D20 is not twenty times a D2 in effect: the probability of leaving
  the start area falls as the die grows, and that trade-off is the heart of the design. State it
  with numbers.
- The Skill Card Pool: the Action/Reaction split, when each is playable, how an effect resolves,
  and what happens when a Reaction interrupts an Action.
- Win conditions.
- Edge cases, written into the text rather than left to the tests.

## Facts

*(Nothing observed yet: `src/core/` does not exist.)*

**Planned structure recorded 2026-08-22, issues #21 and #22.** The rules this chapter will describe
are written down, and so is the module structure that will hold them, so this chapter fills from two
existing documents once the code exists rather than from memory:

- The **rules, the board numbers, the pool composition and the probability arithmetic** are in
  [Game-Design-Document.md](../../Project-Management/Game-Design-Document.md), with the facts
  summarised in [01-requirements-and-goals.md](01-requirements-and-goals.md).
- The **8 planned modules of `core/`** and the FR ids each one owns are in
  [System-Architecture.md](../../Project-Management/System-Architecture.md) section 2.1, with the
  facts summarised in [03-tech-stack.md](03-tech-stack.md).

## Decisions

<!-- Promote decision blocks here from project-journal.md when this chapter is written. -->

## Open / to verify

- No source code exists yet. Declared target state from [CLAUDE.md](../../../CLAUDE.md): `core/` is
  pure: no DOM, no jQuery, no i18next, and no imports from `state/` or `ui/`. It runs and is tested
  without a browser.
- Card effects live here as pure functions over game state and are matched to their presentation in
  `ui/` by card id.
- The dice pool balance was to be paper-prototyped or spreadsheet-tested in Sprint 0
  ([01-Github-Project.md](../../Project-Management/01-Github-Project.md)). If that happened, the
  result is a table for the appendix; if it did not, say so.
- ~~Unresolved rule questions carried over from Chapter 01: overshoot behaviour, and whether the
  highest-number-to-leave-start rule scales sensibly across D2 through D20.~~ **Ruled 2026-08-22:**
  overshoot is illegal and the move is not offered (section 6.2 of the game design document); the
  leaving rule scales by design and the arithmetic is written out, `P(max) = 1/n` against
  `E(roll) = (n+1)/2`. Still open: Product Owner sign-off, and whether the composition plays well,
  which only a playtest or a simulation over this layer answers.
