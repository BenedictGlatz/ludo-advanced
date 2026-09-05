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
