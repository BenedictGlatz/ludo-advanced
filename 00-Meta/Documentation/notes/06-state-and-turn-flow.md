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

### The turn became nine steps, and both empty seams got filled: 2026-08-31, issue #38

The eight-step turn from issue #27 had two places that were deliberately left open. Both are now in use,
and **neither needed the sequence reshaped**. That was the whole point of leaving them open, and it is
worth stating as a result rather than as an intention:

| Step | Phase | What changed |
| --- | --- | --- |
| 1, 2 | `draw` | Now draws a **skill card** as well as three dice cards, and expires statuses and traps |
| 3 | `choose` | Ends in `action` instead of going straight to the roll |
| 4 | **`action`** | New. The active player may play one Action card, or pass (FR-23) |
| 5, 6 | `roll` | Now a real phase, and the roll is `core/roll.js`'s chain rather than one call |
| 7 | `act` | Declares a move and **stops** |
| 8 | `reaction` | Applies the declared move, or throws it away if a card cancelled it |
| 9 | `turn-end` | Unchanged |

#### Turn start deliberately did not become a phase

The plan sketched a `turn-start` phase in which the skill card is drawn. It was not built, and the
reason is what a phase name is for: **a phase says what the game is waiting for**, and this one would be
waiting for nobody. The view would have to skip it immediately, which is a phase that exists only to be
skipped. `drawHand` already covered "turn start and draw" as one step, so the card is drawn there.

#### The intent list went from four to seven, and one intent got smaller

`choose-die` used to pick the card **and roll it**, steps 3 to 5 in one intent, because the rulebook had
no player input between them. The action phase is exactly that input, so `choose-die` now does step 3
alone and `skip-action` and `roll-die` are separate.

`commit-move` used to commit **and resolve**, steps 7 and 8. It now stops, and `close-window` finishes
the job. That split is what makes a Reaction card against a capture possible at all (FR-25): there has
to be a moment where the capture has been declared and has not happened.

**`roll-die` is a separate intent rather than part of `skip-action`.** It costs one more intent and it
buys two things: a place for the roll animation to hang off, and the moment the on-roll reaction window
opens. Both were going to need it.

#### Why the rejection reasons moved to their own file

`state/rejections.js` holds `REJECTED`, `accept` and `reject` and imports nothing. `intents.js` and the
card intents both need all three, and `intents.js` will fall through *into* the card intents, so putting
them in either file would make a circle. A file with no imports cannot be part of one.

#### The state gained thirteen fields, and they have three different lifetimes

That is the change worth recording, more than the field names. Before issue #38 a field was either
match-level or turn-level, and `clearedTurnFields` drew the line. Now there is a middle:

| Lives for | Fields | Cleared by |
| --- | --- | --- |
| The match | `skillPool`, `skillDiscard`, `skillHands` | nothing |
| Several turns | `statuses`, `traps` | their own deadline, or being used up |
| One turn | `modifiers`, `cardsPlayed`, `cardBudget`, `reactionWindow`, `pendingCard`, `rollSteps`, `reactionsLocked` | `clearedTurnFields` |

**The failure mode this creates is invisible in every ordinary test**: a field that a card writes and
nothing clears, leaking a roll modifier or a spent budget into the next player's turn. Every test looks
at one turn, so none of them would see it. `game-state.test.js` now compares `clearedTurnFields()` field
by field against a **fresh match** instead, which catches a missing entry rather than trusting the list.

#### The skill pool is shuffled in `match.js`, not in `createGameState`

A shuffle needs the injected RNG, and keeping `createGameState` free of randomness is what lets about
half the unit tests build a starting board with no `deps` at all. It is also what made the third seed
regeneration survivable, below.

#### Negative finding: the seeds went stale for the third time, and this time it cost one command

`scripts/find-seeds.js` exists because the first two times this happened, the replay had to be rebuilt
from undocumented work. Issue #38 spends the RNG in two more places: **57 draws** to shuffle the
58-card skill pool when a match starts, and one more at the start of every turn. Every seed produced a
different match from the same number.

The fix was `npm run test:seeds`, one command, and two of the five pinned seeds changed. The other three
kept working by coincidence. What the script needed was three added lines, because the replay policy has
to match what the browser does step for step, and the browser now walks through two more phases.

**A second consequence, and it is the one that will bite again.** Shuffling 58 cards spends 57 RNG draws
*before the first die is thrown*, so every unit test that scripts an exact sequence of rolls was
exhausted instantly. `startMatch` therefore takes a `skillPool` override, for the same reason it already
took a `skillSquares` one, and the tests that script rolls pass `[]` for both. The pattern is now
established twice: **anything that spends the injected RNG at match start needs a test-side off switch,
or it silently invalidates every scripted test in the project.**

### The reaction window, and the one decision the whole design rests on: 2026-08-31, issue #38

A window opens at three moments and is a **field** rather than a phase:

| Trigger | Opened by | Answered by |
| --- | --- | --- |
| `on-card` | An Action card being played | Nühü, The Purge |
| `on-roll` | The roll, **before** the number is known | Critical Failure, Devil Die, Hold Pawn, The Purge |
| `on-capture` | A declared move that would capture | Ghost Mode, Uno Reverse, The Purge |

`reaction` was already a phase, for the move. A second phase for "waiting inside the roll" and a third
for "waiting inside the action phase" would have tripled the machine to express one idea, so the window
is a field and `dispatch` freezes every other intent while it is set. That guard is one line and it
catches the case that would otherwise **deadlock**: `roll-die` opens an on-roll window, so dispatching
it again while one is open would open a second one and the turn would never reach the roll.

#### Nothing resolves until the window shuts, and that is the decision everything else follows from

A card played into a window leaves its player's hand immediately and its **rule does not run** until
the window closes. Then the played cards resolve in the order they were played, and the card that opened
the window resolves last.

**The reason is that nothing here can be undone.** `pawns`, `statuses` and `traps` are each replaced
wholesale by a patch, so "cancel that card" cannot mean reversing an effect that has already run. Because
nothing has run, cancelling is simply not running it, and Nühü needs no machinery at all.

That also settles the resolution order without a rule about which card was played first: the opening
card is last because it is the thing being answered.

#### A window that nobody could use does not open

`eligibleSeats` asks three questions of every other seat: is your card budget unspent, do you hold a
Reaction whose triggers include this moment, and does that card have a rule yet. If nobody answers yes to
all three, no window opens and the turn carries on.

**This is not an optimisation.** A window that opened every time would put a thirty-second countdown in
front of every roll of a game whose ordinary turn is two clicks, and it would show a prompt to players
with nothing to press.

For the same reason `on-capture` opens only when the declared move actually captures. A pawn walking onto
an empty square is the ordinary turn.

#### The thirty seconds are not in `state/`, and the reason is not tidiness

ESLint forbids `window` and `setTimeout` under `state/`. A rules layer that reads a clock cannot be
tested, so the countdown runs in `ui/` and dispatches `close-window` when it expires. **A timeout is
therefore the same thing as every eligible seat declining**, and FR-25's "if everybody declines, play
continues at once" needs no timer at all: every play and every decline shortens `eligible` by one, a
seat cannot rejoin, and the last one empties the list.

Not one test in `reaction-window.test.js` mentions time.

#### One intent covers two very different card plays

`play-card` is an Action card in the action phase **and** a Reaction in an open window, told apart by one
question: is a window open? That is not a shortcut. A window is only ever open when somebody is being
asked to answer, and an Action card cannot be played into one.

Keeping them one intent matters for the view: a click on a card in a hand is one gesture, and the player
is not choosing which kind of card play they are performing.

#### The order the checks run in is a usability decision

Whose turn it is, then whether you hold the card, then whether the card fits the moment, then the budget,
then the target. Every check runs before anything is written, so there is no half-played card to undo.
The order is chosen so the **most useful** message wins when more than one thing is wrong: telling a
player "that card needs a target" when it was not even their turn would be true and useless.

### The HUD reads a selector, not a stored field: 2026-09-01, issue #39

`seatProgress(state, seat)` in `state/game-state.js` returns `{ start, track, home, cards }`.

- **A selector and not a state field.** Everything in it is derivable from `state.pawns` and
  `state.skillHands`, and storing it would create two places that can disagree about how far a player
  has got. FR-36's acceptance criterion is precisely that the HUD matches the state after every turn, so
  the cheapest way to satisfy it is to make disagreement unrepresentable.
- **It is the seam between `core/` and the state object.** The three pawn counts come from
  `pawnProgress` in `core/`; `cards` is added here, because a hand is a state field and `core/` is not
  allowed to know the shape of the state object (NFR-01).
- **`cards` is on screen at all because of a Product Owner decision**, not because it was convenient.
  Design spec 03 escalated open decision D33 (is an opponent's hand shown, and is the count public), and
  on 2026-09-01 the answer was: cards secret, **count public**. Without that decision this selector
  returns three numbers.
- **An unseated seat returns `cards: 0` rather than throwing.** The HUD is redrawn on every render, so a
  crash there is worse than a wrong number.

### A pool belongs to one match, and nothing had been enforcing that: 2026-09-01, issue #41

`createDicePool`'s own header has said since issue #30 that "the closure is created once per match by
the composition root, so two matches never share a pool". Until the restart button existed there was
only ever one match, so nothing tested the claim.

**The defect it hides:** a match that ends mid-turn never runs `endTurn`, so its three drawn dice cards
are never returned. `restartMatch(state, deps)` forwards whatever `deps` it is given, so a restart on the
same pool starts seventeen cards deep, and `draw()` throws outright once four matches have leaked twelve
of the twenty.

**The fix is in the caller and not in `match.js`.** `match-flow.js` builds a fresh `matchDeps(rng,
createDicePool())` for every match, new or restarted, which is what the pool asked for in the first
place. Making `restartMatch` build its own pool internally would not work: the state it returns and the
`deps` the caller keeps dispatching with have to come from the same pool, and only the caller holds both.

**The RNG is deliberately not reset.** One per session, so a restart plays a different match rather than
replaying the one that just finished.

`match-flow.spec.js` asserts three dice cards on the board after a restart, which is the cheapest
observable form of "the pool came back whole".

### `nextSeat` became public: 2026-09-01, issue #39

The handover overlay names the player it is passing to, and it has to name the same one `endTurn` is
about to hand the turn to. A second walk over `state.seats` in `ui/` would be a second answer to the same
question, and the two would disagree the first time turn order changes.

### `trapChanges` lost its rule and kept its signature: 2026-09-02, issue #45

The trap check used to live here in full: this layer walked the path, picked the trap and fired it. All
of that moved into `core/enter.js`, and what is left is three lines that hold no rule at all.

**Why it moved.** FR-30 says a trap fires when a pawn *enters* a tile, and this was the only place that
checked. So a trap fired for a dice move and for nothing else, and four cards that move pawns fired
none. Chapter 05 has the finding; the state-layer half of it is that **`state/` had been holding a rule,
which it is not supposed to do.** `skill-turn.js`'s own header says it "holds no rules: every question is
asked of `core/` and the answer is written into a changes object". That was true of the other four
functions in the file and had quietly stopped being true of this one.

**The signature and the return shape are deliberately unchanged**, and the reason is a line count.
`turn-manager.js` was at exactly 300 lines, the NFR-02 limit. Keeping `trapChanges(state, move, deps)`
answering the same `{ pawns, statuses, traps }` meant `resolveMove` needed no edit, so the file that had
no room did not need any. Worth noting as a technique: **an interface kept stable on purpose is what
lets a refactor stop at the module that needed it.**

**One fact most likely to be forgotten later:** a trap now fires from **two** call sites where there was
one. `resolveMove` for a dice move, and the card-driven path for Yeet, Aight Imma Head Out and Let Him
Cook. Both go through `core/enter.js`, which is the point, but anybody adding a third way to move a pawn
has to route it through there too or it will silently fire nothing.

#### `worldOf` is here and not next to `boardOf`

`core/enter.js` wants six fields: the three lists it may change, plus `turnNumber`, `playerCount` and
`rng`. That projection is called a `world`, and it is a superset of the `{ statuses, traps }` pair the
movement rules already call a `board`, so it can be handed straight to `slidePawn` with no repacking.

It lives in `skill-turn.js` rather than in `game-state.js` next to `boardOf`, which is where the other
state-to-core projection sits. The reason is `deps`: a world needs the injected RNG, and
**`game-state.js` mentions `deps` nowhere at all.** Putting the first `deps`-aware function into the
state-shape module would cost that file its one clean property, and every function in `skill-turn.js`
already takes `deps`. Rejected alternative: `boardOf(state, deps)`, which would have made every existing
caller pass something none of them has.

#### The step order inside `resolveMove` is now four things, not three

1. the pawn arrives, and a captured pawn goes home
2. a trap it walked into goes off
3. **that trap's push resolves its own capture and can set off one more trap**, up to the chain limit
4. the square the pawn is *actually standing on* is asked whether it hands out a card

Step 3 is new and step 4 is why the order still matters: the skill square is asked last, about the
position the pawn really ended on, which is read back off the pawn list rather than off the move. A
chain can move the pawn several times, so reading it off the declared move would be wrong in a new way
that it was not wrong before.

### `skill-play.js` split at a seam that had been visible for two days: 2026-09-02, issue #45

`state/card-legality.js` is new and holds the legality half. `skill-play.js` keeps the translator and
re-exports the rest, so `intents-cards.js`, `reaction-window.js`, `ui/target-picker.js` and
`skill-play.test.js` were all left untouched.

**The seam was not invented for the line count.** The file had two halves that never spoke to each
other. One translates between the shape of the game state and the shape a card effect sees, which is a
single well argued idea and is what the file's header is about. The other answers "is this play legal",
which is a different question with a different audience: the intent handlers ask it after a dispatch, and
the **target picker** asks it before one, because it has to know what to offer.

What forced it was that FR-30's placement rules land entirely on the second half. Doing them in place
would have pushed `skill-play.js` toward NFR-02's limit, and splitting at a seam that already exists is
better than compressing one that does not. That is the same argument as `blockedSquares` moving into
`traps.js` earlier in this issue, and it is now clearly a pattern worth stating in the report: **the
300-line limit does not tell you to make files smaller, it tells you to go looking for a seam, and in
both cases there was a real one being ignored.**

#### `pickableSquares` exists so that `ui/` cannot hold a rule

`ui/target-picker.js` used to mark all forty track squares for any square-targeting card. That was
correct while one card in 29 wanted a square. Five do now and four of them need the square to be free,
so the view would have had to work out the difference.

It asks instead. `pickableSquares(state, cardId)` answers the list, derived from the same function
`checkTarget` uses, so the two cannot disagree. The view writes the answer down as `data-pickable`,
which is the shape `move-hints.js` already uses for `state.legalMoves`: **the view records an answer
rather than computing one.**

Two details in it are deliberate. It answers `null` for a card that asks about no square at all, so a
caller can tell "this card wants no square" from "this card wants a square and there is none left". And
the picker does **not** re-check the clicked square: only offered squares carry `data-pickable`,
`events.js` binds the click to that selector, and `checkTarget` refuses an illegal square anyway. Two
guards are enough, and a third in the middle is the one that goes stale.

### Two turn-level fields carry what the board cannot show, and one of them was being dropped: 2026-09-03, issue #45

`trapFired` and `nullifiedCard` joined `clearedTurnFields`. Both exist for the same reason
`refusalReason` does: the player did something and the game has to tell them what came of it, and
neither can be derived afterwards. A fired trap has been removed from the list, a Banana Peel does not
move the pawn, and a cancelled card never ran. In each case the board looks exactly as it would if
nothing had happened.

**`trapFired` is a report from `core/`, which is new.** `core/enter.js` returns it beside the three
board lists, and `PATCH_FIELDS` in `core/cards/context.js` lists it beside `negate` and `cancelMove`.
Those two are instructions the caller acts on and never writes to state; `trapFired` is the opposite,
a fact the caller writes to state and the view reads. `FIELD_FOR` in `skill-play.js` maps it, so a trap
a **card** set off is announced through the same field as one a dice move set off.

**The hand-off dropped it once.** `resolveMove` repacked `trapChanges`'s answer into a `board` of three
named fields and the fourth was left behind: the trap fired, every list was right, and the player was
told nothing. The end-to-end spec found it on its first run and no unit test had, because every case
asserted the board. The fix went to the source of the awkwardness rather than to the symptom:
`trapChanges` used to short-circuit to `{}` on an empty trap list, which is why its caller could not
spread the answer. It now returns the whole shape always, `resolveMove` spreads it, and the file stays
at its 300 lines. Chapter 08 has the finding in full.

**`?stack=`** arrived in the same commit and touches `state/` only through `startMatch`'s fourth
argument, which has existed since issue #38 with no production caller. `match-flow.js` passes it through
and nothing else changed. The reason it exists is a testing question and is recorded in chapter 08 and
the journal.

**`match-flow.js` split at the same time**, because passing the parameter through pushed it to 308
lines. `session-actions.js` took the two action routers, `onOverlayAction` and `onChromeAction`. The
seam is that neither of them touched a closure variable: they read `getScreen()` and call `openScreen()`,
so moving them was a move rather than a rewrite. `match-flow.js` owns the session; that file decides
what a click asks of it.

### A seventh match-level field, and a fourth layer that reads it: 2026-09-04, issue #43

`bots` joined the match row of the lifetimes table, beside `seats`. It is a **sorted list of seat
numbers**, `[]` by default, and it lives for the whole match: nothing clears it and `restartMatch`
carries it over.

**Why a list and not a count.** It follows `seats` exactly, and for the same reason that field gives:
state asks `core/` once and everybody else reads the answer. Storing the number 2 would make every
reader re-derive "the last two of the seats in play", and the same rule copied into five readers is a
rule that drifts. Rejected: a `controllers` map like `{ 0: "human", 2: "bot" }`, because it is a second
truth about who is playing beside `seats`, and object keys are strings, so `Object.entries` hands back
`"0"` and the seat comparisons stop matching. `skillHands` had already cost an afternoon that way.

**`state/bots.js` owns the last-M rule.** `botSeatsFor(playerCount, count)` returns the last `count`
seats, which for two players is seat **2** and not seat 1, because `seatsFor` seats two players
opposite each other. The humans fill up from the front so that the person at the keyboard keeps seat 0.
One line in that file has a comment on it and deserves one: `slice(-0)` is `slice(0)`, so a zero-bot
match written the obvious way would come back with every seat a bot.

**`handoverNeeded(state, seat)` is in `state/` and not in `ui/`**, on the `seatOnShow` precedent: it is
a question about the screen, but it is answered out of pure state, and putting it here makes it a unit
test instead of a Playwright run. Its consequence is a rule change and not only a convenience: **with
one human and three bots the hand-over screen never appears at all.** D33's secrecy argument has
nothing to protect when there is no second person at the screen.

**`bots` is a fifth positional parameter on `startMatch`, and that decision has a deadline written
into the file.** Five positionals is one too many; an options object would read better. It is not worth
doing today because `startMatch(2, deps, [], [])` is written out in `match.test.js`, in
`scripts/find-seeds.js` and in `ui/match-flow.js`, and rewriting three call sites to change no
behaviour is work spent on the shape of a call. `match.js`'s header names the trigger: the day FR-46's
rule toggles ask for a sixth parameter is the day to convert it.

**The `ai/` layer's import contract**, enforced by ESLint (see [07-tooling.md](07-tooling.md)):
`ai/` may read `state/` and ask `core/`, and may never touch `ui/`, `i18n/`, jQuery or the DOM. `ui/`
may import `ai/`. So the dependency arrow is `ui -> ai -> state -> core`, with `ui -> state` still
direct. A bot is a player without a screen: `decide(state)` returns one intent, dispatches nothing,
and knows nothing about time.

**A negative finding, recorded rather than half-built: the bot cannot see danger.** `move-scoring.js`
ranks finishing, capturing, entering the home column, leaving the yard and walking, and nothing in it
asks whether a move parks a pawn in front of an opponent. That term needs absolute-square arithmetic
across seats plus a model of what the opponent's dice hand can roll, and a wrong model plays worse
than no model. It is the obvious next tuning step and it is not in this issue.

### The bot values a card in the currency of a move: 2026-09-04, issue #82

**The 2026-09-04 decision that a bot plays no skill cards is superseded.** That block stays in the
journal, because it records what was believed at the time and why; what changed is that the hand of a
bot filled to its limit of five and was never spent, so a person playing against three bots played a
game with no card mechanic in it at all. `src/ai/` gained eight files and the policy now answers the
action phase and every reaction window with a card or with a pass.

**One currency, and it is the move scorer's.** Every card value is in the units of `SCORE` in
`ai/move-scoring.js`: one point is one step, leaving the yard is 25, a capture is 60 plus the victim's
progress, finishing is 100. The reason is comparability: "Angel Die on a D6" and "Yeet the leading
pawn" have to be rankable against each other and against passing, and a second scale would need a
conversion factor nobody could justify. It also means the bot-against-bot match stays the scoreboard
for tuning either half. Rejected: *a scale of its own per card family*, which reads more natural per
card and makes the comparison between families a guess.

**A card is played only when it beats a threshold.** `PLAY_AT` is 4 points, and at a full hand
(`SKILL_HAND_LIMIT`, five) it drops to 1. The reason for the threshold is that a card in hand is worth
something: the budget is one card per turn (FR-23), so a cheap play spends the only slot the turn has.
The reason it drops at a full hand is that `drawSkillCard` refuses a draw into a full hand and the card
stays in the pool, so holding on has stopped buying anything. Rejected: *play the best playable card
every turn*, which empties the hand and plays Lock In on a pawn nobody is chasing.

**Damage to one opponent counts as `1 / (seats - 1)` of my own gain.** In a duel an opponent's loss is
my gain outright; at a four-player table the other two benefit from it as much as I do. One line,
applied in every value, and the effect is that reaction cards are sharp in a two-player match and rare
in a four-player one without a single card carrying a special case. Own gain and a pawn of my own saved
from a capture count in full.

**The bot asks the card its own rule.** For the seven cards whose whole effect is a roll modifier, the
value calls the real effect out of `core/cards/effects/` and reads the modifiers back, then computes
the roll's whole probability distribution in `ai/roll-odds.js`. So 67's threshold sitting before
Speedrun's multiplier, and FR FR's named number being clamped to the die, are correct in the bot
because they are correct in the card. Rejected: *a copy of each card's arithmetic in `ai/`*, which is a
second rulebook that can disagree with the first.

**`ai/roll-odds.js` is a deliberate second implementation of `core/roll.js`.** It walks the same six
steps over probabilities instead of dice. The duplication is real and it is the cheaper of two evils:
the alternative is to roll the real chain a few hundred times with a throwaway RNG, which puts
randomness into the one layer whose whole property is that it has none (NFR-09, `?seed=42` replays a
match). The drift risk is covered by a test that knows the closed-form answers independently.

**Two cards are never played, as a negative finding rather than a gap.** *Oil Spill* slides whoever
steps on it three to five squares **forwards**, so on almost every board it is a gift to the victim;
the one board where it is good needs the victim's exact distance from their house. *The Purge*
suspends the rule that an own pawn blocks, board-wide and for everybody, including the player who
played it, so whether it is good depends on four seats' positions at once. Both return `null` from
their value function, which is a different thing from a missing entry: `ai/card-values.js` throws at
**boot** for a card with no value at all, on the pattern of `assertCatalogue` and `core/trap-fire.js`.

**A bot reads only what a person can see, and a test enforces it by experiment.** Allowed: the board,
the statuses, the traps, its own hand, the chosen dice card, the modifiers, `pendingCard`,
`pendingMove`, the open window, and **how many** cards every other seat holds, which is public since
decision D33 and printed in the HUD. Forbidden: `state.skillHands[anotherSeat]`. Nothing in JavaScript
stops the peek, so `card-choice.test.js` decides the same board twice with completely different cards
in the opponents' hands and asserts the answer is identical, plus a second case proving the public
count still changes the answer, so the first case cannot be passed by a bot that ignores the other
seats entirely.

**A bad target is turned into a pass, not into a refused intent.** Each value picks its own target and
`card-choice.js` then asks `checkTarget`, the same function the dispatcher will ask. The asymmetry with
a person is the reason: a refused click is a message on screen, while a refused bot intent stops
`ui/bot-driver.js`, leaves the phase unchanged, and parks the match for ever. `bot-match.test.js`
carries the property over whole matches: no intent a bot produces is ever refused.

**The It's Not That Deep aura is checked once, in `card-choice.js`, for all six offensive cards.** It
depends on the target rather than on the card, so asking it in six values would be the same question
written six times. **A known simplification:** a card whose best target sits inside the aura is
dropped rather than re-aimed at the best square outside it.

**A rule finding for the Product Owner, not fixed here: Double Dip is net zero.** `spendCard` counts
Double Dip itself against the budget of one, and the card then sets the budget to two, which leaves
exactly one further play: the one the seat had anyway. `card-effects.js`'s own header claims the card
is "net positive". The bot therefore prices it as "make room in a full hand" and worth 1. Recorded in
[01-requirements-and-goals.md](01-requirements-and-goals.md) as an open rule question.

**Where the crude edges are, named rather than hidden.** `ai/threat.js` prices "a pawn `d` squares
behind could roll exactly `d`" as one in six, twelve or twenty by the smallest die that reaches, and
sums those instead of computing a proper "at least one of them" probability. The trap cards all aim one
square in front of an opponent rather than at the square that opponent is most likely to enter, which
would need a model of the dice hand they will draw. Nühü prices a card aimed at me as a flat number
rather than by that card's own value, because pricing all 29 cards from the receiving end is a second
value table.

**A turn-level field that carries no rule: `lastCardPlayed`.** `{ seat, cardId }`, written by both card
intents when the card leaves the hand, cleared by `clearedTurnFields` at the handover. Nothing in
`core/` or `state/` reads it and a match plays out identically without it, which makes it the first
field in the state object that exists purely so the screen can say something.

**Why it is in the state at all.** A bot's card play has to be announced or, as far as the player is
concerned, it did not happen: several cards leave the board looking exactly as it did before, and the
card itself goes into the discard pile with every other card of the match, so the play cannot be
reconstructed afterwards. Rejected: *a variable in `ui/`*. The message strip is drawn out of the state
and nothing else, so a fourth piece of presentation state threaded through `render` would be one
refresh out of step with the board it describes. `nullifiedCard` and `trapFired` are the same kind of
field for the same reason, and both predate this one.

**It is written when the card is played, not when its rule runs.** An Action card that somebody can
answer waits in `pendingCard` while a window is open, and the moment worth announcing is the moment the
player did something. Both branches of `playActionCard` therefore inherit it from the state that spends
the card, which is one line rather than two.

**Two lines of `state/` shipped in a `ui/` commit**, which is worth naming because it looks like a
layering slip. The field is only ever read by `ui/`, its whole justification is a screen requirement,
and splitting it into its own commit would produce a commit that adds a field nothing reads. The value
model in the commit before it does not touch either file.

### FR-01 got a second home, and it takes arrays because there is no state: 2026-09-05, issue #76

`state/bots.js` gained `canBeBot(seats, bots, seat)` and `toggleController(seats, bots, seat)` for the
line-up screen (design handoff 15, D93). Both are pure, both are unit tested, and both look wrong next
to the two functions above them until the reason is written down.

**Why the rule is in `state/` and not in `ui/`.** "The last person may not become a bot" is a rule about
who is playing, which is the sentence this file's own header uses to explain why `botSeatsFor` lives
here. A rule inside a click handler is a rule that cannot be unit tested without booting jQuery.

**Why they take two arrays where `isBot` and `humanSeats` take a state.** There is no state. A player
halfway through a line-up has not started a match, and `createGameState` has no field for one that has
not started, so the only things to work with are the seats the count produced and the bot seats chosen
so far. The asymmetry is deliberate and the file says so, because it is exactly the kind of thing that
gets tidied up later by somebody who has not noticed there is no match yet.

**FR-01 is now enforced in two places, and that is not duplication.** `options.js` still refuses
`bots >= players` for `?bots=`, silently and before anything is drawn, which is the right answer for a
number typed into an address bar. The screen refuses it one click at a time, in front of the player.
Two entry points, two guards, one requirement.

**`toggleController` returns the list unchanged rather than throwing when it refuses.** The caller is a
click, and a refused click on a menu is a normal event rather than a programming error. `assertBotSeats`
three functions above keeps the job of throwing, and it is asked once, about a list that has already
been decided, at the moment a match is built.

**The result is sorted**, so a line-up's bot list and `botSeatsFor`'s output are the same shape.
`state.bots` is in seat order whichever of the two routes into a match was taken.

### Two routes into a match, one argument at the bottom of both: 2026-09-05, issue #76

`startMatch(playerCount, deps, skillSquares, skillPool, bots)` has taken a **list of seats** since issue
#43. The line-up screen is the second thing to call it and the first to produce that list directly.

| Route | How the seats are decided |
| --- | --- |
| `?bots=3` | A count. `botSeatsFor(playerCount, count)` turns it into the last seats, clamped to one below the player count |
| The line-up screen | The player says it, seat by seat. `botSeatsFor` is not involved at all |

**`freshMatch` gained one optional argument and no branch worth the name:** it falls back to
`botSeatsFor` when no list is handed in. So the two entry points share one code path from `startMatch`
downwards and there is nothing to drift.

**The screen can say things the parameter cannot, and that is D95.** `botSeatsFor` always leaves seat 0
to a person, because somebody had to decide and the person at the keyboard keeping the first seat is a
sensible default. The screen lets the player put the computer on seat 0 and take green instead. That is a
default being overridden and not a rule being broken: `options.js` still refuses more bots than players
for the address bar, and `canBeBot` refuses the last person on the screen.

### A turn can roll three times, and steps 8 and 9 moved out of `turn-manager.js`: 2026-09-06, issue #89

**The rule.** A natural maximum on a D6 or larger rolls the same die again, at most three rolls a turn.
GDD § 3 had rejected any bonus roll because of the D2; the playtest asked for the classic rule and the
Product Owner took it with a six-face floor and a three-roll cap. `core/bonus-roll.js` holds the whole
decision as `grantsBonusRoll({ dieMax, rollSteps, rollsThisTurn })`: it reads the **natural** face out of
`rollSteps` (`base`, or the kept value of an `advantage`/`disadvantage` pair; a `fixed` step from FR FR is
not a roll), so no card can buy a second roll.

**The transition.** `closeOrRollAgain(state, changes)` in the new `state/turn-resolution.js` replaces
the three places that used to write `phase: TURN_END`: after a resolved move, after a cancelled move
(Ghost Mode, Uno Reverse), and after a roll with no legal move. When the bonus is granted the turn goes
back to `roll` with the same `chosenDie` and everything the last roll produced cleared: `roll`,
`rollSteps`, `legalMoves`, `selectedPawn`, `pendingMove`, `refusalReason` and **`modifiers`**. A card
buffs the roll it was played into; an Angel Die that buffed two rolls would be worth twice what it says.
The hand, the die, the card budget and the reaction lock stay, so there is no second Action card.

Two turn-level fields carry it: `rollsThisTurn` (the cap reads it, the view keys its roll moment on it)
and `bonusRoll` (for the strip, stays `true` for the rest of the turn). `game-state.test.js`'s field
comparison against a fresh match covers both.

**Why `turn-manager.js` was split.** It stood at exactly 300 lines. Steps 8 and 9 (`resolveMove`,
`cancelPendingMove`, `endTurn`, `nextSeat`) moved to `turn-resolution.js` together with
`closeOrRollAgain`, because "the turn is over, or rolls again" is asked where turns end. `rollChosenDie`
imports it back for the no-move case; there is no cycle, `turn-resolution.js` imports nothing from
`turn-manager.js`. Importers changed: `intents.js`, `game-loop.js`, and four test files.

**What the loop needed.** `game-loop.js` rolls by itself in `roll`, so a bonus roll happens with no new
branch. Two places keyed on the turn number had to key on the roll instead: `turn-waits.js`'s roll moment
(`needsRollMoment` compares `turnNumber.rollsThisTurn`, or the second roll would have had no animation
and, worse, `data-rolling` would have been left on) and `dice-hand-view.js`'s throw replay. The board
carries `data-rolls` so a spec can tell a bonus roll from the first one.

**What the screen says.** Every dice card gained a third standing tag from `dice-card.js`: the D6 to D20
say the maximum rolls again, the D2 and the D4 say "no bonus roll". That was the Product Owner's condition
for the rule. `roll-steps.js` makes one exception to D73.3's "two or more, never one": a bonus roll is
worth a first line saying why a second roll happened, even when nothing else changed the number.

**The bot.** No change. A bot in `act` after a bonus roll is a bot in `act`, and `bot-match.test.js`
plays full matches through the new transition unchanged.

### An eighth match-level field, and it carries no rule at all: 2026-09-06, issue #93

`state.lastCard = { seat, cardId, turnNumber, outcome }` records the last skill card anybody played, for
the last-card slot a playtest asked for. It is written where `lastCardPlayed` is written
(`intents-cards.js`, both paths a card play takes) and settled in `reaction-window.js` when a window
shuts: `pending` until then, `resolved`, `nullified` (an aura cancelled it) or `negated` (a Nühü cancelled
the card that opened the window). It is **match-level**, in the first row of the lifetime table, because
the slot's whole purpose is to survive the turn: the player who was not watching wants to know what the
last thing that happened was, and that is a turn or more later. Overwritten by the next play, cleared by
nothing.

**Why not widen `lastCardPlayed`.** That field is turn-level on purpose (issue #82): it drives the bot
announcement and has to be gone by the next turn or the strip would keep announcing a card from a turn
ago. Two fields with two lifetimes beat one field with a flag saying which lifetime applies.

**Why `negated` is a fourth outcome and not a case of `resolved`.** A Nühü cancels the card that opened
the window; that card's rule never ran. The slot will name the Nühü (it was played last), but the record
of the negated card is settled too, so a later reader of the state can tell "cancelled" from "did
nothing visible", which is the distinction `nullifiedCard` exists for at turn level.

**`game-state.js` was split to make room.** The new field took it to 301 lines. `boardOf` and
`seatProgress`, the two read-only selectors, moved to `selectors.js` and are re-exported, so no importer
changed. Chosen over moving `clearedTurnFields`, which is the other clean seam, because the bonus-roll
branch (#89) edits that function and a move on one side of a merge and an edit on the other is the
conflict nobody wants to resolve on merge day.

**No view yet.** Design brief 17 asks where the slot goes and what it shows (D100). The state is
testable without it: `last-card-played.test.js` covers the four outcomes and the survival of the turn.

### The bot gets a scoreboard, then a danger model: 2026-09-06, the bot tactics plan

Four phases, planned in `00-Meta/Project-Management/Bot-Tactics-Plan.md` and built in that order.
Everything below is still one currency: a point is one step of one pawn (`SCORE` in `src/ai/score.js`).

**Phase 0, the arena.** `npm run bots:arena` plays seeded bot-against-bot matches through the real
`startMatch` and `dispatch` and prints wins, captures and cards played per bot with a 95 % confidence
interval. `decide(state, profile)` gained a second argument: a profile is a frozen object of tuning
knobs, and it may be a **function from a seat to a profile**, which is how two different bots sit at the
same table out of the same source. The alternative, keeping a copy of the old bot's code to play
against, goes stale the first time either copy is edited. A `random` seat that picks a legal die and a
legal move uniformly is the floor; it lives in `scripts/` and not in `src/ai/`, because `ai/` may hold
no randomness at all (NFR-09).

**Phase 1, danger and opportunity.** Three new files under `src/ai/`:

- `score.js` holds the currency (`SCORE`, `pawnWorth`, the four standing worths) and imports nothing.
  It exists because `move-scoring.js` now prices danger, danger is `threat.js`, and `threat.js` needs
  the currency: with the table in the scorer those three would import each other in a ring.
- `geometry.js` holds `pawnsBehind`, `pawnsAhead` and the rest, split out of `threat.js`.
  `pawnsBehind` was rewritten as one pass over the pawns rather than one pass per distance, because the
  move scorer asks it twice per candidate move inside `expectedMoveScore` inside every card value.
- `hit-odds.js` computes, once at import, `P(hit at distance d)` for `d = 1..20` over all
  C(20, 3) = 1140 hands the dice pool can deal, as the mean of `1 / (smallest die in the hand that
  reaches d)`. It replaces the old flat guess of 1/6, 1/12 and 1/20 by range.

`threat.js` changed in three ways and each was a real mistake: the odds became a calculation instead of
a guess, the sum over attackers became `1 - prod(1 - p)` (it is now multiplied by a pawn's worth and
compared against a gain such as the 25 of leaving the yard, so it has to be a real probability), and a
pawn standing on an opponent's **entry square** is now counted as being in danger from that opponent's
yard, which is the classic Ludo mistake the bot used to make happily. An armoured pawn answers 0.

`scoreMove(move, pawns, context)` keeps the five exclusive categories and adds three corrections:
risk (`threat x worth` after the move minus before), opportunity (the same difference for enemy pawns
the landing field puts within a roll) and the landing field (a skill field earns a card, somebody
else's Banana Peel costs a turn). A correction and not a sixth category, because danger is a matter of
degree and there is no honest place for "this is a bit dangerous" between "capture" and "leave the
yard". `scoreMove(move, pawns)` with no context answers exactly what it answered before.

**Only the first of the three is switched on in the shipped bot.** The arena measured the other two as
losses, so `DEFAULT_PROFILE` carries them at zero and `FULL_PROFILE` is what the plan designed. The code
stays, tested and off, because deleting it would throw away both the measured finding and the knob a
later run needs to re-test it. See phase 3 below.

**The die choice improved for free.** `chooseDie` already averages `bestMove` over every face, so a
smarter `scoreMove` prices every die by where it is likely to land, with no change in `dice-choice.js`.

**Phase 2, sharper cards.** Four independent changes:

- `share(state, opponent)` weights an opponent's loss by their progress against the table average,
  clamped between half and double. One function, and every offensive card and every reaction inherits
  it: the bot now gangs up on the leader.
- The trap cards search **every** legal field by how likely somebody is to walk onto it, instead of
  always taking the field one step in front of the leading opponent, which is the one distance a victim
  is least likely to roll.
- Nühü prices the four cards an opponent can aim at a bot separately (Yeet by the steps lost plus the
  danger it lands in, Hold Pawn by what the turn loses, Ragebait by a taunt, Tax Fraud by a card)
  instead of a flat 8 for all four. Four entries and not twenty-nine, because those are the only four
  cards in the catalogue an opponent can aim at somebody else's pawn or at somebody else.
- Two files were split before anything was added to them, both being close to NFR-02's 300 lines:
  `values-pawns.js` (own-pawn cards) against `values-attacks.js` (the two cards played on an
  opponent's pawn), and `values-window.js` against `values-nuehue.js`.

**Phase 2d was not built.** Pricing each die as "the best of the turn without a roll card and the turn
with the best held roll card" is written up in the plan and is the one item of it that is outstanding.
It is the only change of the four that needs `chooseDie` to look at the skill hand, and the arena said
the first three were worth measuring on their own first.

**Phase 3, tuning, and it is the part with the negative finding in it.** See
[09-source-code-overview.md](09-source-code-overview.md) for every run and its command. In short: with
all three corrections on, the new bot **lost** to the old one, and the arena is the only reason anybody
knows that. Measured one term at a time, the opportunity term was the loss; it was written as an
absolute ("what is in front of where I land") while danger was written as a difference, so it paid the
bot for every short move that ended near an enemy, including the ones that gave up a better position.
Rewritten as a difference and measured again. The shipped `DEFAULT_PROFILE` is what the arena chose and
nothing else.

### `lastCardPlayed` carries the target, `lastCard` does not (2026-09-06, design spec 18)

`lastCardPlayed` was `{ seat, cardId }`. It is now `{ seat, cardId, target }`, where `target` is the
same object the intent carried: `{ square: 7 }`, `{ pawn: { player, pawn } }`, `{ direction: 1 }`, or
`{}` for the 12 cards that point at nothing.

**Why the field had to grow.** The cast (design spec 18) draws a played card's effect landing on the
board. 17 of the 29 cards act on a place, and which place it was is the one fact about a card play
that cannot be recovered afterwards: the card is in the discard pile with every other card of the
match, and several cards (a Banana Peel, a nullified anything) leave the board looking exactly as it
did before.

**Why its match-level sibling did not grow with it.** `lastCard`, the record behind the HUD plate,
still holds `{ seat, cardId, turnNumber, outcome }`. The plate outlives the turn and shows what was
played and how it went; a target from three turns ago is a fact nobody reads. Growing both records
because they look alike is how a field ends up with two meanings.

**What was checked rather than assumed.** `card-controls.js`'s `carryOn` compares the announcement it
is holding for by **identity**, so that one announcement is not held twice, and `botCardPlayed`
returns this frozen object. Adding a field to an object that is built once per dispatch and then
frozen does not touch that comparison, and the test pinning the behaviour stayed green.
`clearedTurnFields()` already listed the field, so the growth costs nothing at the handover.


### The turn's second moment, and the announcement it replaced (2026-09-06, design spec 18)

**`advance()` now asks one question where it asked one before, and it covers two waits.** The loop's
roll branch was `if (waits.needsRollMoment(state)) { waits.showRoll(); return; }`, three lines for one
wait and six for two. It is now `if (waits.takeMoment(state)) return;`, which is a **net loss of two
lines** in a file that was at exactly 300, and which puts the choice of which moment to take in the
file named for the loop's own waits.

**The cast is asked before the roll**, and the reason is a rule about the game rather than about the
code: seven of the 29 cards act on the roll chain and two more add a whole extra die, so a turn that
plays a card and then rolls owes two moments at once. Showing the modified number before the card that
modified it is the wrong order, because the player sees a 14 on a D8 and only afterwards finds out why.

**The question is asked of the state and not of the phase**, which is the lesson `turn-waits.js`
already paid a red suite for. A card play arrives through four doors: a person's own play, a bot's
play, a Reaction into an open window, and a window closing that resolves the card that opened it. The
marker is `turnNumber`, the number of cards played this turn, the card id, **and the outcome the
`lastCard` record carries**. The last part is what makes a pending card work: a card that opens a
window is `pending` when it is played and settles when the window shuts, so the same card gets two
moments with a window between them, and nothing else in the state changes at that instant.

*Rejected: comparing `lastCardPlayed` by identity.* It is `null` for every turn in which nobody plays
anything, and a marker that is null most of the time is one `??` away from a bug.

#### A bot's card play stopped being a mid-turn announcement, and that is a subtraction

Issue #82 made a bot's card play a mid-turn announcement: the strip said one sentence and the turn held
two seconds for it, on the argument that a card played by nobody the player can see has to be
announced. **The cast is that announcement and a better one**, so `botCardPlayed` came out of
`midTurnAnnouncement` rather than stacking on top of it.

Leaving both in would have added two seconds to every bot turn that plays a card, on top of the 1.5
second cast, on top of the 900 ms the bot already pauses before it acts. A **fired trap** keeps its own
hold, because a trap is a second event the cast did not show: the cast draws the card landing, and the
trap goes off afterwards. `botCardPlayed` is still exported and still answers, because `move-hints.js`
prints the sentence and that sentence has not changed. What moved is the hold, not the words.

#### `timers.js` split into the registry and the holds

The sixth named wait would have taken the file past 300 lines, and the seam is the one the file's own
header already described in those words: *the loop decides that it waits, `holds.js` decides how long.*
`timers.js` keeps the `setTimeout` registry and nothing else; `holds.js` holds every duration, every
fallback constant, and the rule that separates a movement from a reading time.

### Online play adds a fourth headless layer and one question the UI had never asked: 2026-09-09, issue #42

Full decision block: project journal, 2026-09-09. Facts about the code:

- **`state/auto-steps.js`** names the steps the loop takes by itself. `autoIntent(state)` answers
  `skip-action` in an action phase with nothing playable, `roll-die` in `roll`, `close-window` in
  `reaction` and for an emptied window, `null` while a window still has somebody in it.
  `LOOP_OWNED_INTENTS` is `roll-die`, `close-window`, `end-turn`. It replaced three `if` blocks in
  `ui/game-loop.js` and `mechanicalIntent` in `tests/unit/ai/bot-match.test.js`, whose comment had asked
  for exactly this. It is in `state/` and not `ui/` because `net/` reads it and may not import `ui/`.
- **`ui/loop-store.js`** is the state cell that used to be a closure variable in `game-loop.js`:
  `createLoopStore({ initialState, deps, dispatcher = dispatch, localSeats = null })` returning
  `{ getState, apply, replace, isLocal }`. `dispatcher` is the seam the options document found: the host
  broadcasts after `dispatch`, the guest sends instead of dispatching, and the loop and its siblings see
  neither. `replace` is used only by the guest. **`isLocal(seat)`** is the new question: does a person at
  this screen play `seat`. Default `!isBot(state, seat)`, online `localSeats.includes(seat)`.
- **The loop gained `submit(intent)`** (apply, then `advance()`), refused while paused because
  `advance()` would restart timers under the pause screen, and **`abandon()`**, which replaces the state
  with `abandonMatch` and lets `advance()` open the win screen. `submit` is the door a guest's intent
  enters through; `abandon` is what a dropped guest causes.
- **Why `isLocal` and not `isBot`.** Every guard in `turn-controls.js`, `card-controls.js` and
  `handover.js` asked `isBot(state, seat)` to decide whether a click is a person's to make. Online, a
  seat can be a person **at another screen**, and to this screen that person is exactly what a bot is:
  unclickable, hand never face up, no curtain. To the AI they are not a bot, and `bot-driver.js` still
  asks `decide`, which reads `state.bots`, so the AI never plays a remote human's seat. Four call sites
  changed, each with the `!isBot` default, so `handover.test.js` and `turn-controls.test.js` pass
  unchanged and two new cases each cover the remote seat.
- **The table of things that fought the design, from the plan, and what each became:**

  | Where | Problem | Fix |
  | --- | --- | --- |
  | `handover.js` seeded the viewer with `humanSeats(state)[0]` | On a guest the viewer would be the host's seat, own hand face down all match | `state.seats.find(isLocal)` |
  | `handover.js` `needsCurtain` | The host would raise a curtain, and pause, whenever the guest is asked anything | `false` for a non-local seat |
  | `card-controls.js` used `seatOnShow` as the acting seat for a click and for Decline | The guest's Decline would answer for the host's seat | guarded with `isLocal(seatOnShow(state))` |
  | `turn-waits.js` only ran from `advance()` | A guest never calls `endRoll`, so `data-rolling` sticks and the dice cards stop being clickable | the guest loop calls `waits.takeMoment(next)` on every incoming state |
  | `syncClock` only ran from `handleWindow` | No countdown on the guest; a running clock would dispatch `close-window` | the guest calls `syncClock()` per state and its session refuses loop-owned intents locally |
  | `intents-cards.js` fills in `state.activePlayer` when `seat` is missing | A guest omitting `seat` plays as whoever's turn it is | the host guard requires an integer `seat` the guest holds |
  | `afterTurn` closed over `state` | Breaks once the cell is in a store | the callback reads `store.getState()` when it fires |
  | `session-actions.js` RESTART and QUIT | A guest's Play Again would build a local match on a `null` rng; Quit told nobody | host-only restart, `online.leave()` on quit |
  | `submit()` under the host's pause overlay | `advance()` would restart timers under it | `submit` refuses while paused, the session answers `paused` |

- **`src/net/`, headless, seven files:**

  | File | Owns |
  | --- | --- |
  | `protocol.js` | `hello { seat, seats, windowMs, version }`, `state { seq, state, pool: { remaining } }`, `intent { seq, intent }`, `refused { seq, reason }`, `paused`, `resumed`, `bye`; `decode` answers `null` to garbage |
  | `transport.js` | `{ send, onMessage, onClose, close }` over a data channel, and `createLoopbackPair()` delivering one microtask later |
  | `signal-codes.js` | a session description as one line: deflate-raw plus base64url; `waitForIceComplete` |
  | `webrtc-link.js` | the host's offer/accept and the guest's join machines, `RTCPeerConnection` from an injected factory |
  | `intent-guard.js` | the table below |
  | `host-session.js` | `dispatcher` (rules, then broadcast), `attach(loop)` routing guest intents through the guard and `loop.submit`, `sayHello`, `broadcastPause`, `onLost(seat)` |
  | `guest-session.js` | `apply` sends and refuses loop-owned intents and a second intent in flight; one listener each for hello, state, refused, paused, close |

- **The host guard**, every row a unit test in `intent-guard.test.js`:

  | Intent from a guest | Allowed when | Otherwise |
  | --- | --- | --- |
  | `choose-die`, `select-pawn`, `commit-move` | the active player is that guest's and no window is open | `not-your-turn` |
  | `skip-action` | as above and `autoIntent(state) === null` | `not-your-turn` / `loop-owned` |
  | `play-card { seat, cardId, target }` | `seat` is an integer the guest holds; then `cardRefusal` | `not-your-seat` or the card's reason |
  | `decline-reaction { seat }` | `seat` is the guest's and in `eligible` | `not-your-seat` / `not-eligible` / `no-window` |
  | `roll-die`, `close-window`, `end-turn` | never | `loop-owned` |
  | anything else | never | `unknown-intent` |

  `dispatch` re-checks every rule anyway; the guard adds only "who sent it" and "what the loop owns".
  Reasons are `intent.rejected.*` keys, three of them new (`not-your-seat`, `loop-owned`, `paused`), so
  the guest's message strip prints them in both languages.
- **Why the whole state travels.** Only the host owns `deps = { rng, diceSource }`, the twenty physical
  dice cards and the seeded generator's counter, both outside the frozen state. A guest never rolls or
  shuffles, so nothing outside the state has to be serialised and a guest cannot drift: whatever
  arrived last is the truth. The state survives JSON because it is plain data throughout; the
  `loopback-match.test.js` deep-equals the guest's mirror with the host's state after every echo of a
  whole match, and a second case does it for three players over two pairs.
- **The 30 seconds have one owner.** The host's `reaction-clock.js` dispatches expiry. The guest runs the
  same clock for the ring only: its expiry is `close-window`, which `guest-session.js` refuses before
  sending. `hello.windowMs` carries the host's duration so the two rings agree, including under `?fast=1`.
- **`reaction-clock.js` split out of `card-controls.js`** when the `isLocal` guards took that file to
  302 lines. The seam was the header's own "The thirty seconds" section: the clock is about time passing,
  the rest of the file about a card being played. `REACTION_WINDOW_MS` is re-exported so no importer moved.


### Bots online run on the host, and the network never heard of them: 2026-09-10, issue #101

- **Nothing in `src/net/` changed.** The online plan of 2026-09-08 said "bots would run on the host later
  without touching the network", and that turned out to be literally true: the host's Start button hands
  `freshMatchParts` a `botSeats` list instead of `[]`, and everything else already existed. `state.bots`
  is a match field and travels in every `state` message; the host runs the ordinary `createGameLoop`,
  which includes `bot-driver.js`; the guest's mirror loop never asked the driver anything and still does
  not. The protocol, the guard and both sessions are byte-for-byte the files of 2026-09-09.
- **Why this was free: `isLocal` and `isBot` were kept as two questions on 2026-09-09.** A bot seat on
  the host is not local to any screen, so no browser can click it and every browser draws its hand face
  down, exactly as for a remote person. It is a bot to the AI, so the host's driver asks `decide` for it
  and dispatches through the broadcasting dispatcher, exactly as for a hot-seat bot. Had the two been
  merged into one "who may click here", one of the two behaviours would have had to be re-derived.
- **The guard needed no new row.** A guest sending an intent on the bot's turn is refused with
  `not-your-turn`, because the bot's seat is not in that guest's `guestSeats`. A guest can no more play
  the bot's seat than the host's, and `loopback-bot-match.test.js` asserts the refusal with the very
  intent the bot itself would have played.
- **`canBeBot` gained a fourth parameter, `minPeople = 1`.** FR-01's floor is one person; the online
  lobby's floor is two, the host plus one guest, because a host alone against bots is a hot-seat match
  reached by a detour. One rule with two thresholds, in `state/bots.js`, rather than a second predicate
  beside it that would drift the day one is fixed and the other forgotten. `toggleController` passes it
  through; every existing caller keeps the default.
- **Rejected: a `bots` field in `hello`.** The guest would learn the bot seats a message earlier, and
  hold a second copy of a fact the next `state` carries anyway. `guest-role.js` mounts the board on
  whichever of `hello` and `state` arrives second, so "earlier" buys nothing, and two truths about who
  plays is the mistake `state/bots.js`'s header already rejected for the `controllers` map.
- **Rejected: a bot takes over a dropped guest's seat.** It would soften "no reconnect", which is the
  first limitation the changelog lists. It needs a transition in `state/` that turns a person into a bot
  mid-match, with the open reaction window as the hard case (the seat may be `eligible` and the clock
  running), and a lobby word for "your friend left, the computer has their pawns". Four days before the
  freeze that is a feature, not a fix. Recorded so that the option is visible as declined rather than
  missed.
- **Rejected: a bot on a guest.** Impossible by construction: the guest's `deps` has `rng: null` and a
  dice source whose `draw` throws. The host owns randomness; a bot needs none, but the turn it plays does.


### The state remembers who dropped, and the host says so before hanging up: 2026-09-10, issue #42, design spec 19

- **`abandonedBy` is a match field**, `null` from `startMatch` and set by `abandonMatch(state, by = null)`.
  The pause screen's Quit and the guest's "host went away" pass nothing and the field stays `null`; the
  host's `onLost(seat)` passes the seat. It lives in the state rather than in the flow because three
  screens show the abandoned match and only the host knows which pipe closed: the state is the one thing
  every screen gets, so the fact travels with it (D121.3 of spec 19).
- **The host broadcasts the abandoned state before it closes the pipes.** `host-role.js`'s `onLost` is
  now `loop.abandon(seat)`, `session.broadcastState(loop.getState())`, `session.close()`. Before, the
  other guests learned only that the host had gone quiet and abandoned on their own `onClose`, with
  nobody named. `guest-loop.js`'s `receive` already finishes a match whose status is not `running`, so
  the abandoned state arriving on the wire is the guest's ending and the `onClose` that follows is a
  no-op through `finished`.
- **`onLost` answers the first loss only.** Closing the pipes in `onLost` reports every other guest as
  lost too, and the second call used to abandon again, overwriting `abandonedBy` with an innocent seat.
  The `lost` flag that already gated Play Again now gates the callback. Found by the first run of
  `online-flow-failures.test.js`, which asserted seat 1 and got seat 2.
- **`game-loop.js`'s `abandon(by = null)`** passes the seat through to `abandonMatch`; `guest-loop.js`'s
  `abandon()` still passes nothing, because a guest never knows who left. No protocol change: the field is
  part of the state, and the state travels whole.


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
- ~~Multiplayer is planned for Sprint 2. Whether it is local hot-seat or networked changes this
  chapter substantially: networked play makes state authority a real question. Undecided. **The MVP
  is hot-seat** (FR-03), and the architecture document states plainly that where a network layer
  would attach is not answered, rather than guessing at it.~~ **Answered 2026-09-09, issue #42.** State
  authority is the host's; the network layer attaches at the one `dispatch` call in `ui/`, now the
  `dispatcher` argument of `loop-store.js`. See the fact block above and the journal.
- No decision yet on whether a game in progress survives a page reload.

### The TURN relay, and what it did not change in this layer: 2026-09-10, issue #42

- **`src/net/ice-servers.js` is a new file in `net/` and imports nothing**, like `signal-codes.js`. It
  holds the list of STUN and TURN servers a peer connection may use, plus `relayServers()` and
  `hasWorkingRelay()` for a diagnostic to ask with. The import rule is unchanged and still enforced by
  ESLint: no `ui/`, no `i18n/`.
- **The relay changes nothing about the protocol, the sessions or the intent guard.** It changes only how
  the two browsers find each other. `host-session.js`, `guest-session.js`, `protocol.js` and
  `transport.js` are untouched, and the loopback match test that stands in for a whole online game did
  not need a line changed. That is the seam `transport.js` was built for doing its job: the sessions
  never knew they were on WebRTC, so they equally do not know a relay is now carrying it.
- **`relayOnly` is the one new argument on the two links**, and it sets `iceTransportPolicy: "relay"` on
  the peer connection. `?relay=1` reaches it from `options.js` through `main.js` and `match-flow.js`,
  which wraps the two link factories so neither lobby role has to learn about a setting it cannot act on.
  The roles' snapshots, stages and error strings are unchanged.
- **What is still not covered by the twenty-second NAT message.** It now means "no direct route *and* the
  relay did not answer", which in practice means the credentials have expired. The message still names
  the NAT, because that is the cause a player can act on, and the expiry is the maintainer's problem
  rather than the player's.

### `net-log.js`, a fifth file in `net/` that only watches: 2026-09-10, issue #42

- **It imports nothing and is imported by three files**, `webrtc-link.js`, `transport.js` and `main.js`.
  The layer rule holds: no `ui/`, no `i18n/`. `console` was already in the layer's allowed globals.
- **On is module state, set once by `main.js`.** The alternative was threading a logger through
  `match-flow.js`, both lobby roles and both links, which is five files changed so that a diagnostic can
  be handed down. A switch a composition root flips once is the smaller change, and it is why
  `net-log.test.js` re-imports the module to test the "on" case.
- **It reads and never decides.** No retry, no close, no branch anywhere else in `net/` asks whether
  logging is on. A diagnostic that changes what it measures is worse than none, and this one has to be
  trustworthy precisely when something is already going wrong.
- **`waitForIceComplete` now answers a boolean**, `true` for finished and `false` for cut short by the
  timeout. Nothing acts on it. It exists because a half-empty invite code and a network that genuinely
  has no relay produce the same code, and only the caller knows which happened.
- **`channelTransport` takes a `who` label and wraps `send` in a try.** A send on a closing channel
  throws, and an uncaught throw there would have taken down the turn that produced it rather than the
  pipe that caused it.
