# 06 State and turn flow: the integration layer

> **Covers:** `src/state/`: the single game-state object, its transitions, the turn manager, and
> the intent boundary between `ui/` and `core/`.
> **Does not cover:** the rules themselves (Chapter 05) or their presentation (Chapter 04).

This chapter is the seam. It is where the two other architecture chapters meet, and it is the one
that shows the layering was a real design decision rather than a folder naming convention.

## What this chapter must answer

- The shape of the game-state object: what is in it, and what deliberately is not.
- Which values are stored and which are derived. Derived values in state go out of sync; if that
  reasoning applies here, state it.
- The turn cycle end to end: draw 3 dice cards → pick one → roll → move or leave start → resolve
  skill cards → pass to the next player.
- How a Reaction card interrupts another player's turn, and what that does to the turn sequence.
- The intent boundary: what `ui/` is allowed to send in, and how `state/` applies `core/` rules to
  it. Include one worked example: an intent arriving, the rule applied, the new state out.
- Persistence, if any. If the game keeps nothing between sessions, say so and give the reason
  rather than skipping the topic.

## Facts

*(Nothing observed yet: `src/state/` does not exist.)*

**Planned structure recorded 2026-08-22, issues #21 and #22.** The 4 planned modules of `state/`
(`game-state`, `turn-manager`, `intents`, `match`), the intent vocabulary and the five-step data flow
are in [System-Architecture.md](../../Project-Management/System-Architecture.md) sections 2.2 to 4,
with the facts summarised in [03-tech-stack.md](03-tech-stack.md). The turn sequence itself is
section 3 of [Game-Design-Document.md](../../Project-Management/Game-Design-Document.md), as eight
steps, and the architecture document draws the same eight as an interaction between the layers
(Figure 3). Two points belong to this chapter specifically: the **reaction window is a phase of the
turn** held by `state/turn-manager.js` rather than an event the cards raise, which follows from FR-25
being a requirement on the turn manager; and the rule check and the state write are separate steps on
purpose, so that the FR-32 legal-move highlighting and the validation on commit are one rule
implementation and not two. This chapter fills from observation once the code exists.

## Decisions

<!-- Promote decision blocks here from project-journal.md when this chapter is written. -->

## Open / to verify

- No source code exists yet. Declared target state from [CLAUDE.md](../../../CLAUDE.md): `state/`
  holds the single game-state object and its transitions, is the only writable source of truth,
  imports `core/` and never `ui/`.
- Multiplayer is planned for Sprint 2. Whether it is local hot-seat or networked changes this
  chapter substantially: networked play makes state authority a real question. Undecided. **The MVP
  is hot-seat** (FR-03), and the architecture document states plainly that where a network layer
  would attach is not answered, rather than guessing at it.
- No decision yet on whether a game in progress survives a page reload.
