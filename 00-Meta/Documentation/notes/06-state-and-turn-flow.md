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

### The state layer exists: 2026-08-29, issue #27

All four planned modules landed, with the names the architecture document predicted. This is the
8-point integration point everything else waits on, and it was written **in parallel with Claude
Design**, because nothing in it touches the DOM. Counts and coverage are in
[09-source-code-overview.md](09-source-code-overview.md).

| Module | Owns |
| --- | --- |
| `state/game-state.js` | The state object, the phase names, and the only function that ever produces a new state |
| `state/turn-manager.js` | The eight-step turn sequence from section 3 of the game design document |
| `state/intents.js` | The four things `ui/` may ask for, and why each refusal happened |
| `state/match.js` | Start, restart and abandon (FR-01, FR-06, FR-07) |

#### The shape of the state object

```js
{
  playerCount, status, activePlayer, turnNumber, phase, pawns,   // the match
  hand, chosenDie, roll, legalMoves, selectedPawn,               // this turn only
  pendingMove, refusalReason,                                    // this turn only
  winner,
}
```

**Stored, because nothing else can produce it:** the pawn positions, whose turn it is, the phase, the
drawn hand, the chosen die, the roll.

**Derived and cached for exactly one turn:** `legalMoves` and `refusalReason`. Both come from
`core/movement.js` when the die is rolled. This chapter's own brief warns that derived values in
state go out of sync, and the answer here is the lifetime: they are written once per roll and wiped
at the end of the turn, so there is no window in which they can disagree with the pawn positions. The
alternative, recomputing them on every render, would put a rules call in the render path and would
make FR-32's highlighting and NFR-08's refusal text two calls instead of one.

**Deliberately not stored: whether anyone has won.** `core/win.js` answers that from the pawn
positions. `winner` holds the answer *after* the match is over, which is a record of an outcome
rather than a shortcut around a rule.

#### The turn cycle, end to end

Each function moves the turn one step and the phase name says what the game is waiting for:

| Rulebook step | Function | Phase afterwards |
| --- | --- | --- |
| 1 Turn start, 2 Draw | `drawHand` | `choose` |
| 3 Choose | `chooseDie` | `roll` |
| 4 Roll, 5 Compute legal moves | `rollChosenDie` | `act`, or `turn-end` when nothing can move |
| 6 Act | `commitMove` | `reaction` |
| 7 Resolve | `resolveReactions` | `turn-end`, or `match-over` |
| 8 End of turn | `endTurn` | `draw`, next player |

**Every one of them refuses to run in the wrong phase and throws.** A state machine that accepts a
transition out of order is not one. `intents.js` checks the phase first and turns it into a refusal
the player can see, so reaching the thrown error means something inside `state/` called out of order,
which is a bug and not a player action.

**The reaction window is a phase with nothing in it.** Skill cards are issue #38.
`commitMove` records the move and opens the window; `resolveReactions` closes it and applies the
move. Retrofitting an interruption point into a sequence that resolved a move in one step would mean
rewriting the sequence; filling an empty phase does not. This is the same reasoning the architecture
document gave on 2026-08-22 for making the window a phase rather than an event the cards raise, now
carried out.

#### The intent boundary, with the worked example this chapter asks for

`ui/` may send exactly four things. There is deliberately **no "move this pawn to that square"**: the
target comes from the legal-move set, so the rule is applied once and not once per caller.

| Intent | Payload | What it runs |
| --- | --- | --- |
| `choose-die` | `{ faces }` | Steps 3 to 5. The player chose, so the roll follows with no further input |
| `select-pawn` | `{ pawn }` | Highlighting only. Nothing moves (FR-32) |
| `commit-move` | `{ pawn }` | Steps 6 and 7, because the window between them is empty until #38 |
| `end-turn` | none | Step 8, and then draws the next player's hand |

A dispatch returns `{ state, accepted, reason }`. **A rejected intent returns the object it was
given**, identical rather than copied, so a test asserts `result.state === before`. Every check runs
before anything is written, so there is never a half-applied intent to undo. The reason is an i18next
key, for the same reason the movement refusals are (NFR-03).

**The worked example.** A player with a pawn on relative position 10 clicks it, holding a rolled 4:

1. `ui/events.js` turns the click into `{ type: "commit-move", pawn: 0 }` and dispatches it.
2. `intents.js` checks the phase is `act`, then asks `moveForPawn` whether that pawn has a move.
3. `turn-manager.js` takes the move out of `state.legalMoves`, records it as `pendingMove` and moves
   the phase to `reaction`. Nothing on the board has changed yet.
4. `resolveReactions` calls `core/movement.js`'s `applyMove`, which returns a **new** pawn list with
   the pawn at 14, and `core/win.js`'s `findWinner`, which returns `null`.
5. `nextState` freezes the result. The phase is `turn-end`, and the view re-renders from it.

The rule was consulted twice, at step 2 and step 4, and written zero times outside `core/`.

#### Persistence: none, and it is a decision

Nothing is written to `localStorage` or anywhere else, so a page reload starts a new match. FR-45
(persistence across a reload) is `could have` and is not built. FR-06 asks only that a **finished**
match can be restarted without reloading, which `restartMatch` does by rebuilding the state from
`createGameState`, so no field can survive by being forgotten.

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

### Freezing became generic, and the reason is the fields that are about to arrive: 2026-08-31, issue #38

`game-state.js` froze the state **field by field**: freeze every pawn, freeze the pawn array, freeze
the seat array, walk `legalMoves` and freeze each move and its `captures`, then freeze the state
itself. The comment on it argued for that explicitly, on the grounds that the state was a known,
flat-ish shape and a general recursive freeze would need a cycle guard for cycles the state cannot
have. That was a fair reading of the state as it stood.

The skill cards break the premise. They add nine fields, and two of them are nested two levels deep:
`skillHands` is an object keyed by seat holding an array per seat, and `statuses` and `traps` are
arrays of objects.

**What actually changed the decision was not length, it was the failure mode.** A hand-written freeze
list is a list that must be edited every time a field is added. Forget one line and the state looks
frozen, one array inside it stays writable, and a view can quietly write to the game state. Freezing
exists to turn the "`ui/` never mutates state" convention into a thrown error; a freeze list with a
hole in it gives that up without anything going red.

`src/state/freeze.js` now holds `deepFreeze` and `isDeeplyFrozen`. The cycle objection turned out to
cost four lines: a `WeakSet` of objects already visited in this call, which doubles as a guard against
walking a shared subtree twice.

Two limits are deliberate:

- **Only plain objects and arrays are frozen.** A `Map`, a `Date`, a class instance or a function is
  left alone, because `Object.freeze` on a `Map` does not stop `map.set`: freezing it would look like
  protection and not be one. Nothing of that kind belongs in the state, and leaving it untouched keeps
  the lie out of the code rather than hiding it.
- **An already-frozen subtree is still walked.** Skipping it would be the obvious speed-up, since an
  unchanged array carries the same frozen reference from one state to the next. It is only sound while
  every frozen object anywhere in the project is also *deeply* frozen, and one shallow `Object.freeze`
  in `core/` on an object with a mutable child would make the shortcut skip that child forever, in
  silence. What it saves is a walk over a few dozen numbers and strings a handful of times per turn.

`nextState` and `createGameState` are the only callers, so there is still exactly one line to read to
know that no state is ever written in place.

### The state gained its first match-level field, and `resolveReactions` gained a reason to take `deps`: 2026-08-31, issue #38

`skillSquares` joined the state object. Every field before it was either a description of the pawns or
something wiped at the end of the turn; this one is neither. A used-up skill square moves and stays
moved, so it belongs to the match.

`core/skill-squares.js` owns every rule about it. `state/` asks and writes the answer, which is the same
division the pawn positions already follow.

#### Where the square is used up, and why there

In `resolveReactions`, the step that applies the committed move. Not in `commitMove`, which only records
the intention: a skill square counts only if the pawn actually finished there, and a reaction card will
be able to cancel a committed move once the cards exist. Putting it in the resolve step means it is
already in the right place for that.

**The win branch returns early, so the move that wins the match does not use up a square.** Deliberate,
and tested as such: nothing happens after the match ends, so a card earned on the winning move would
have nowhere to go.

#### `resolveReactions` now takes `deps`, and `commit-move` forwards it

A respawn needs randomness, and randomness in this project is injected (NFR-09). So the signature changed
from `resolveReactions(state)` to `resolveReactions(state, deps)`, and `handleCommitMove` in `intents.js`
passes it through.

**The consequence is worth writing down: `deps.rng` is now drawn from twice in a turn**, once for the
roll and once for a possible respawn. Anything that scripted an exact sequence of rolls silently played a
different match from the moment a pawn landed on a skill square. That hit the same two places it hit for
issue #30, the exact-final-state unit test and all five Playwright seeds, and it is written up as a
challenge in the journal.

#### `createGameState` gained a `skillSquares` parameter

The board's skill squares can be pinned when a match is created, defaulting to the real eight-square
layout so that no production caller passes anything.

It exists because of the `rng` consequence above. A test that scripts rolls hands in an empty list, which
says "this test is about movement and turn order" rather than encoding a rule it is not testing. The
alternative, interleaving dummy respawn draws into the roll script at the right points, would make that
test depend on the exact rule it is not testing, and it would break again on the next rule that draws.

The second caller is the one this will really pay for: a Playwright spec needs a skill square in a place
its pawn actually reaches, and a random layout cannot promise that.

**A restart does not carry the arrangement over.** `restartMatch` rebuilds from the default, because a
restart is a fresh match and a board that kept where the last match had wandered to would start the
second match from a position nobody chose.

## Decisions

<!-- Promote decision blocks here from project-journal.md when this chapter is written. -->

## Open / to verify

- ~~No source code exists yet.~~ **All four modules exist as of 2026-08-29.** `state/` holds the
  single game-state object and its transitions, is the only writable source of truth, imports `core/`
  and never `ui/`. The import half is enforced by ESLint (see [07-tooling.md](07-tooling.md)); the
  "only writable" half is enforced by freezing every state object, so an assignment from `ui/` throws
  rather than being silently dropped.
- **Nothing has been read from `state/` by a view yet**, because `ui/` does not exist. The intent
  boundary is tested from unit tests standing in for the view, which proves the contract holds and
  not that a jQuery handler can satisfy it. That is issue #62.
- **The reaction window has never had anything in it.** Its correctness as a seam is a claim about
  issue #38 and cannot be checked until skill cards exist.
- Multiplayer is planned for Sprint 2. Whether it is local hot-seat or networked changes this
  chapter substantially: networked play makes state authority a real question. Undecided. **The MVP
  is hot-seat** (FR-03), and the architecture document states plainly that where a network layer
  would attach is not answered, rather than guessing at it.
- No decision yet on whether a game in progress survives a page reload.
