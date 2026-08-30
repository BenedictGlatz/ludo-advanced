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

### Board topology, the first module in `core/`: 2026-08-29, issue #26

`src/core/board.js` exists. It is the first observed fact in this chapter and the first evidence that
the architecture of [System-Architecture.md](../../Project-Management/System-Architecture.md) survives
contact with code. Line counts and the coverage figure are in
[09-source-code-overview.md](09-source-code-overview.md), never here.

**The design idea the module is built on, and it is the one worth a paragraph in the report:** a
pawn's position is stored as a **relative position `r`** counted from its own player's viewpoint, not
as a square on the shared board. `r` runs 0 to 58.

| `r` | Where the pawn is |
| --- | --- |
| `0` | Start area |
| `1` | The player's own entry square |
| `1` to `52` | Somewhere on the shared 52-square track |
| `53` to `57` | The player's own home column, steps 1 to 5 |
| `58` | Home |

**Why it is worth stating:** every player walks the same 58 steps, so a movement rule written against
`r` is one rule for all four of them instead of four rules with an offset baked in. The offset between
players appears in exactly one function, `absoluteSquare`, and nowhere else in the codebase. Movement,
capture and the win condition never need to know which player they are computing for.

**What the module exports:**

| Export | What it is |
| --- | --- |
| `TRACK_LENGTH` 52, `MAX_PLAYERS` 4, `PLAYER_OFFSET` 13, `HOME_COLUMN_LENGTH` 5, `PAWNS_PER_PLAYER` 4, `START_R` 0, `HOME_R` 58 | The topology as constants, in one place |
| `REGION` | The four region names as an object, so a failing test reads as words rather than as numbers |
| `entrySquare(player)` | `13 * player`, giving 0, 13, 26, 39 |
| `turnOffSquare(player)` | `(entrySquare(player) + 51) mod 52`, the square immediately behind the entry square |
| `absoluteSquare(player, r)` | `(entrySquare(player) + r - 1) mod 52`, defined only while `r` is on the track |
| `region(r)` | `start`, `track`, `home-column` or `home` |
| `homeColumnStep(r)` | 1 to 5, which the view renders as `data-home-step` |
| `isSameSquare(pawnA, pawnB)` | Whether two pawns stand on the same physical square |

**Two numbers are derived rather than typed in**, so that the code and the rulebook cannot drift:
`PLAYER_OFFSET` is `TRACK_LENGTH / MAX_PLAYERS` and `HOME_R` is
`TRACK_LENGTH + HOME_COLUMN_LENGTH + 1`. The rulebook derives them the same way and for the same
reason.

**`isSameSquare` is where the topology does real work**, and it is the clearest example in the code so
far of a rule that did not have to be written because the data structure already says it:

- **On the shared track**, two pawns collide when their absolute squares match. This is the only case
  in which pawns of *different* players can ever meet, which is why capture (FR-11) can only happen on
  the track.
- **In a home column**, a collision needs the same player *and* the same `r`, because a home column is
  owner-only. So "capture inside a home column" is not forbidden by a rule, it is **inexpressible**.
  The game design document predicted exactly this in section 4.3 and the code confirms it.
- **Start areas and homes never collide at all**, not even for two pawns of the same player, because
  each holds four separate slots. Two pawns there stand next to each other, not on top of each other.

**All three of those properties are asserted exhaustively rather than at a sample point.** The test
file loops over every pair of players and every home column step (4 x 3 x 5 x 5 comparisons) instead
of checking one pair, and over every home column position against all 52 track positions. The reason
is that a topology claim is a claim about *all* positions, and one passing example is not evidence
for it.

**Positions are validated, and the functions throw `RangeError`.** A player outside 0 to 3, an `r`
outside 0 to 58, a non-integer, or an `absoluteSquare` call for a pawn that is not on the track are
all errors rather than silently wrong numbers. This is deliberate for a layer with no UI: a wrong
number here would surface as a pawn in the wrong place three modules later.

### The pawn record and capture: 2026-08-29, issue #29

The first two rule modules, `core/pawns.js` and `core/capture.js`. Written the same day the design
brief went out, deliberately: neither touches the DOM, so both were written while Claude Design
worked on the look of the board. Counts and coverage are in
[09-source-code-overview.md](09-source-code-overview.md).

#### A pawn is three numbers, and only one of them ever changes

`{ player, pawn, r }`. `player` and `pawn` together are the identity and never change; `r` is the
relative position from `board.js` and is the only thing a move writes. That is why a move can be
described as a before and an after without copying the board.

**Every function in `core/` returns a new pawn list and writes to none.** Two reasons, and the second
is the one that matters for the report: a test can compare before and after without having taken a
deep copy first, and a stale reference held by `ui/` cannot corrupt the board. The cost is one array
copy of at most 16 entries per move.

#### Capture needed twenty lines, because the topology had already done the work

The whole of FR-11 is: landing exactly on a shared-track square that holds an opponent's pawn sends
that pawn back to `r = 0`, and the arriving pawn holds the square. There are no safe squares in the
MVP (FR-15 is a `could have` and is not built), so all 52 track squares are capturable and there is
no exception list.

Three cases that would normally each need a rule need none, and this is the clearest evidence that
writing the coordinate system in `board.js` first was worth it:

| Rulebook case | Why no rule was written |
| --- | --- |
| Capture inside a home column | A home column is owner-only, so `isSameSquare` can only ever report a collision there between two pawns of the *same* player |
| Capture in a start area or at home | Both hold four separate slots, so `isSameSquare` reports no collision at all; a pawn sent back to `r = 0` therefore never captures on arrival |
| Two opponents on one square | It cannot happen, because whoever arrived second would have captured the first |

**The third one throws rather than assuming.** `captureTarget` checks that at most one opponent is on
the square and raises an error otherwise. A silently ignored second pawn would be a bug that surfaced
several turns later as a pawn that had vanished, which is the most expensive kind to find.

### The legal-move set, the win condition and the dice seam: 2026-08-29, issue #28

Three more headless modules, again written while Claude Design worked on the board.

| Module | Owns | Requirements |
| --- | --- | --- |
| `core/movement.js` | The legal-move set for a roll, and applying a chosen move | FR-09, FR-10, FR-12, FR-13, FR-14 |
| `core/win.js` | The win condition | FR-05 |
| `core/dice-source.js` | Rolling a die, the seeded RNG, and the stand-in for the Dice Card Pool | FR-20, NFR-09 |

#### The legal-move set answers "why not" as well as "what"

`evaluateTurn(pawns, player, roll, dieMax)` returns three things at once:

```js
{ moves: [...], refusals: [{ player, pawn, reason }], reason: null }
```

- `moves` is what the player may do, and is exactly what `ui/` will highlight (FR-32).
- `refusals` says per pawn why it stayed put.
- `reason` is filled only when `moves` is empty, and is the single reason the turn passes (FR-14).

**Why the refusals are computed alongside the moves and not on demand:** a reason worked out later
would have to re-derive the rule that produced it, and the second copy is the one that drifts.
NFR-08 asks that a playtester can say why a move was refused without being told, and this is the
mechanism that makes that possible rather than a hope.

The five reasons are **i18next keys, not sentences** (`move.refused.overshoot` and so on). NFR-03
forbids a user-facing string anywhere in `src/` outside the locale files, and `core/` is the layer
that must not know a language at all.

#### Negative finding: one of the three reasons in the rulebook cannot occur

Section 6.3 of the game design document names three reasons a turn passes: no maximum rolled with no
pawn on the track, **every target square blocked by an own pawn**, and every move overshooting home.
The second one is unreachable as a *turn-level* reason, and the code proves it in a test.

The argument is short. `r` only ever counts upward, so a player's pawns form a line. The pawn
furthest along has nobody in front of it, so it is never blocked by one of its own. It therefore
either has a legal move or overshoots, and in both cases the turn does not pass for the own-pawn
reason.

The key stays in the code for two reasons. It is a real **per-pawn** reason and is shown on screen
under FR-32 whenever a player picks a blocked pawn. And FR-12 is still unsigned by the Product Owner:
if it is overridden toward the blocking mechanic named as its rejected alternative, the arithmetic
above stops holding.

#### Two more rules that needed no code

The same pattern as the capture section above, and worth listing because it is what the layering was
supposed to buy:

| Rulebook case | Why no rule was written |
| --- | --- |
| Two own pawns on one square | `isSameSquare` reports it and the move is refused; there is one check, not one per rule that reads a square |
| A pawn passing over occupied squares | Only the landing square is ever inspected, so "no blocking in the MVP" is the absence of code rather than a rule |

#### What fails loudly rather than quietly

Two more deliberate choices to throw instead of returning a defensible-looking value, alongside
`captureTarget` from issue #29:

- `applyMove` throws when the pawn is not standing where the move says it was. A stale move applied
  to a moved-on board is the one mistake that would otherwise corrupt the board without a symptom.
- `hasWon` checks the pawn count as well as the positions. Without it a seat nobody occupies would
  win, because `[].every(...)` is `true`.

#### The dice stub, and why it is a seam rather than throwaway code

The real Dice Card Pool is issue #37 and does not exist. `core/dice-source.js` holds a stand-in that
always draws one card of the same die, behind the interface the real pool will implement
(`handSize`, `draw(rng)`, `returnHand(hand)`). Two things make the later swap cheap:

- The rule for leaving the start area is written as `roll === dieMax` (FR-09), never as `roll === 6`.
  It already works for a D2 and a D20, so no rule is written twice.
- The randomness enters from outside (NFR-09), so a test hands in a fixed sequence.

**The stub draws a hand of one, not three identical cards.** Faking a hand of three would let a
"pick one of three" screen be built against something that never had a choice in it, and the missing
choice would only surface in #37.

**Planned structure recorded 2026-08-22, issues #21 and #22.** The rules this chapter will describe
are written down, and so is the module structure that will hold them, so this chapter fills from two
existing documents once the code exists rather than from memory:

- The **rules, the board numbers, the pool composition and the probability arithmetic** are in
  [Game-Design-Document.md](../../Project-Management/Game-Design-Document.md), with the facts
  summarised in [01-requirements-and-goals.md](01-requirements-and-goals.md).
- The **8 planned modules of `core/`** and the FR ids each one owns are in
  [System-Architecture.md](../../Project-Management/System-Architecture.md) section 2.1, with the
  facts summarised in [03-tech-stack.md](03-tech-stack.md).

### The board was re-topologised after the first design handoff: 2026-08-30, issues #3 and #26

**The numbers changed, the rules did not.** Issue #26 closed on 2026-08-29 with a 52-square track.
The design handoff that arrived the next morning was drawn on a 40-square board, and the two could
not both ship. The user chose the design. Section 2 of the game design document and
`src/core/board.js` were rewritten in the same commit.

| Constant | Was | Now |
| --- | --- | --- |
| `TRACK_LENGTH` | 52 | **40** |
| `PLAYER_OFFSET` | 13 | **10** |
| Entry squares `E(p)` | 0, 13, 26, 39 | **0, 10, 20, 30** |
| Turn-off squares `T(p)` | 51, 12, 25, 38 | **39, 9, 19, 29** |
| `HOME_COLUMN_LENGTH` | 5 | **4** |
| `HOME_R` | 58 | **44** |
| `REGION` members | start, track, home-column, home | **start, track, home-column** |

#### The layering is what made this an hour instead of a week

`board.js` is the only file in `core/` that holds a topology number. Everything else derives from its
exports. The measured consequence: **`movement.js`, `capture.js`, `win.js` and `pawns.js` needed
comment changes only.** No rule was rewritten, and the four modules passed on the new numbers as soon
as `board.js` changed.

The tests were the opposite, and deliberately so. Roughly 30 assertions hold literal positions,
because a test that recomputes the number it is checking has stopped checking anything. Every one of
them had to be re-derived by hand. That asymmetry is the honest summary of what "one source for the
numbers" buys: it protects the code, not the tests, and the tests are where the cost lands.

#### The house replaced the home area, and one rule disappeared

The house has **four squares and the player has four pawns**, so a full house is the win. There is no
separate home area any more, and `REGION.HOME` was deleted.

This removed code rather than adding it. `isSameSquare` already reported a collision between two
pawns of the same player inside a house, so FR-12 refuses a second pawn arriving on an occupied house
square, and the four pawns are forced onto the four squares **with no rule written for it**. The win
condition in `win.js` stopped testing one number and started testing a region:

```js
own.every((entry) => region(entry.r) === REGION.HOME_COLUMN)
```

`isFinished(r)` was added for the one thing that genuinely needed a number: a pawn on `r = 44` can
never move again, which is a refusal reason and not a win condition.

#### Negative finding, reversed: "blocked by an own pawn" is now reachable as a turn reason

Recorded on 2026-08-29 as unreachable, and it is no longer. The old argument was that `r` only counts
upward, so the pawn furthest along always has somewhere to go and can never report `OWN_PAWN`. That
held only while home was a shared area no own pawn could block. With the four-square house the leader
can sit on `r = 44`, report `ALREADY_HOME`, drop out of the turn-level vote, and leave the three
pawns behind it agreeing on `OWN_PAWN`. The test that recorded the original finding now records the
reversal, with the old reasoning quoted in it.

#### Negative finding, new: one line in `core/` is unreachable and is kept anyway

`turnLevelReason` in `movement.js` returns `NONE_AVAILABLE` when every refusal was `ALREADY_HOME`.
That needs all four pawns on `r = 44` at once, which the house forbids. **It is the single uncovered
line in `src/core/`.** It stays, because deleting it would make the next line read `blocked[0]` of an
empty array, and a guard that is unreachable by construction is cheaper than a crash that is not.

### The Dice Card Pool replaced the stand-in: 2026-08-30, issue #30

`core/dice-pool.js` is the seventh module in `core/` and the first half of issue #37. It implements
the interface `core/dice-source.js` documented, so the stand-in is no longer wired into a match but
stays in the file for tests that want a predictable die.

| What | Value | Requirement |
| --- | --- | --- |
| Cards in the pool | 20 | FR-16 |
| Denominations | D2, D4, D6, D8, D10, D12, D20 | FR-16 |
| Copies, in that order | 2, 3, 4, 4, 3, 2, 2 | FR-17 |
| Drawn per turn | 3, without replacement | FR-18 |
| Kept | 1 | FR-19 |
| Returned at end of turn | all 3, reshuffled | FR-21 |
| Discard pile | none, the pool is stationary | FR-21 |

**There is no shuffle function, and that is a choice rather than an omission.** `draw` picks a
uniformly random index out of what is left and swaps the last card into the gap. Twenty of those
picks in a row *is* a Fisher-Yates shuffle, so the distribution is identical and there is one code
path instead of two. **Rejected: shuffling the whole array on every `returnHand`.** It would be a
second source of randomness with its own tests, doing work no rule can observe, because the pool is
face down.

**This is the only module in `core/` that holds mutable state.** Which cards are on the table is not
a rule, it is the pool's own bookkeeping, and the part that matters to the turn is already stored by
the turn manager as `state.hand`. Keeping the twenty cards inside a closure means no other layer can
reach in and take one. The closure is built once per match by the composition root, so two matches
never share a pool.

#### The seam held, and the measurement is two lines

Swapping the stand-in for the real pool changed **one default argument in `state/match.js` and one
call in `src/main.js`**. Nothing in `core/movement.js`, `state/turn-manager.js` or `state/intents.js`
moved. That is the payoff of the two decisions recorded on 2026-08-29: FR-09 written as
`roll === dieMax` rather than `roll === 6`, and the RNG injected from outside.

#### Negative finding: every end-to-end seed became worthless, and the replay had never been committed

The pool draws from **the same generator the die rolls from**. So the moment it was wired in, every
`?seed=N` played a different match and all five seeds in `tests/e2e/helpers.js` were wrong. Two of
the seven specs failed on facts that were true only for a fixed D6.

The seeds had originally been found by replaying matches headlessly, and **that replay was never
committed**, so there was no way to find new ones except to redo undocumented work. It is a script
now: `scripts/find-seeds.js`, run by `npm run test:seeds`. It imports the real `startMatch` and
`dispatch` and uses the same policy the Playwright helpers click with, so its output is a fact about
the shipped code and not about a model of it.

The cost of not having written it the first time was the whole of that second search. The
[08-quality.md](08-quality.md) note carries the same finding from the testing side.

#### Negative finding: the view now hides a choice the rulebook gives the player

FR-19 says the player picks one of the three drawn cards. `ui/game-loop.js` still takes `hand[0]`,
because the hand has no design yet and therefore nothing to click. Before #30 that was honest, since
the stand-in dealt one card and there was no choice to hide; now it is a real gap and it is visible
in play, because a hand whose first card is a D20 needs a twenty to get a pawn out of the yard and
the turn usually passes.

It stays as `hand[0]` rather than becoming a "pick the most useful die" rule. A clever rule would be
a second player living in the view, and it would have to be unwritten again in issue #31.

**Measured, not assumed:** `npm run test:seeds` replays 400 two-player matches, and 400 of them
finish inside 600 turns. So the gap costs turns and does not deadlock the game.

## Decisions

<!-- Promote decision blocks here from project-journal.md when this chapter is written. -->

## Open / to verify

- ~~No source code exists yet.~~ **One module exists as of 2026-08-29: `core/board.js`.** The purity
  rule from [CLAUDE.md](../../../CLAUDE.md) is no longer only declared: since the same day it is a
  **failing lint run**, through `no-restricted-imports` and `no-restricted-globals` scoped to
  `src/core/**`, and a failing test run, through `environment: "node"` in Vitest. See
  [07-tooling.md](07-tooling.md). ~~Seven of the eight planned `core/` modules do not exist yet.~~
  **Seven of the eight exist as of 2026-08-30.** Missing: `core/skill-pool.js` and
  `core/card-effects.js`, both issue #38.
- Card effects live here as pure functions over game state and are matched to their presentation in
  `ui/` by card id.
- The dice pool balance was to be paper-prototyped or spreadsheet-tested in Sprint 0
  ([01-Github-Project.md](../../Project-Management/01-Github-Project.md)). If that happened, the
  result is a table for the appendix; if it did not, say so. **Still open after #30:** the
  composition shipped as specified, and the arithmetic in section 5 of the game design document is
  still derived against the old 58-step journey. Re-deriving it against 44 is the remaining half of
  the paper work, not a code change.
- ~~Unresolved rule questions carried over from Chapter 01: overshoot behaviour, and whether the
  highest-number-to-leave-start rule scales sensibly across D2 through D20.~~ **Ruled 2026-08-22:**
  overshoot is illegal and the move is not offered (section 6.2 of the game design document); the
  leaving rule scales by design and the arithmetic is written out, `P(max) = 1/n` against
  `E(roll) = (n+1)/2`. Still open: Product Owner sign-off, and whether the composition plays well,
  which only a playtest or a simulation over this layer answers.
