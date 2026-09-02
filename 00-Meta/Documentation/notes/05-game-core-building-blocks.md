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

### The skill squares, the first board feature that changes during a match: 2026-08-31, issue #38

`src/core/skill-squares.js`. Eight of the forty shared track squares hand out an extra skill card to
whoever **lands** on one. The square is then used up: it disappears and reappears on a random other
square, so the board rearranges itself over the course of a match.

#### The starting layout is built, not typed

Each player's quarter of the ring gets a square at `entry + 4` and one at `entry + 7`, which produces
4, 7, 14, 17, 24, 27, 34 and 37. Building it from the offsets rather than writing the eight numbers
out means the symmetry is a property of the code, and a test can assert what the symmetry buys:
**every player meets a skill square at exactly the same points of their own journey**, relative
positions 5, 8, 15, 18, 25, 28, 35 and 38.

Why that matters: FR-04 fixes turn order at the start of the match and does not compensate for going
first. A board that also gave one seat an earlier first card would stack a second advantage on top of
the first, and no rule in the game balances it.

The offsets 4 and 7 themselves are a playtesting question, not a derivation. What can be said for them
is that 4 is far enough from the entry square that a pawn cannot reach a skill square straight out of
the start area even with the smallest die, and 4 and 7 are far enough apart that one move rarely covers
both. Both of those are tests.

#### Landing counts, crossing does not

Only the square a pawn finishes its move on triggers anything.

The reason is the dice pool. If crossing counted, a D20 would collect several squares in a single move
and a D2 almost none, so the answer to "which of these three cards should I take" would always be "the
biggest", and the choice FR-19 is built around would stop being a choice. It also matches capture,
which already only looks at the target square, so a player learns one rule instead of two.

#### The respawn, and what it excludes

`consumeSkillSquare(squares, absolute, rng)` returns a **new**, sorted list. Sorting is not cosmetic:
without it, two boards holding the same eight squares would compare unequal depending on the order the
squares happened to be used in, and every test would have to sort first.

Three exclusions, each for its own reason:

- **The four entry squares**, 0, 10, 20 and 30. Not for fairness: the entry square is the busiest
  square a player has, since every one of their pawns starts on it and passes over it. A skill square
  there would pay out far more often than one anywhere else, and always to the same player.
- **The squares the other seven skill squares are on**, because two on one square cannot be told apart.
- **The square just used.** Having it reappear under the same pawn would read as nothing having
  happened, and a player could not tell that from a bug.

That leaves 28 candidates, and the test asserts the number rather than trusting the arithmetic in this
paragraph. A further test checks that all 28 are actually reachable over 2000 respawns, because a
respawn that only ever used half the board would pass every other test here.

**Houses need no exclusion at all.** A house is not a track square, so an absolute square index never
refers to one. Same for start areas, which is also why a captured pawn cannot trigger a skill square:
it goes back to its start area, and `skillSquareLandedOn` answers `null` there.

#### Negative finding: the skill squares are in no requirement

FR-22 is the closest fit and it does not mention them: *"How a player acquires skill cards is defined:
when a draw happens, how many, and the maximum hand size."* The skill squares are one of the two draw
triggers, so they are implementing FR-22, but the requirement text names neither them nor the draw at
the start of a turn.

FR-08 has the same gap on the board side: *"The board is a closed track shared by all players, plus one
home path per player."* No special square type. Neither does the game design document, and neither does
the obligations book's screen inventory.

This is a consequence of where the rule came from. The skill squares and their respawn are the team's
own decision, taken on 2026-08-30 in answer to a question Claude Code asked, and the requirements
specification has not caught up. **The code is ahead of the requirement, which is the wrong direction.**
Recorded rather than fixed silently, because FR-22 carries a † (needs a decision) and rewriting it is a
requirements change that belongs with the rest of the skill card set.

### The 29-card catalogue and the closed skill pool: 2026-08-31, issue #38

Four new modules under `src/core/cards/` plus `src/core/skill-pool.js`.

| File | What it holds |
| --- | --- |
| `cards/vocabulary.js` | The words a card entry may use: `TYPE`, `CATEGORY`, `KIND`, `TARGET`, `TRIGGER`, `COPIES_PER_CARD` |
| `cards/catalogue-core.js` | The 10 cards of artboard `6a` |
| `cards/catalogue-extra.js` | The 19 cards of artboard `4a` |
| `cards/catalogue.js` | Merges the two, validates them at load, exposes the lookups |
| `skill-pool.js` | The pool, the hands, the discard pile, and the closed accounting rule |

`vocabulary.js` is a module of its own for a boring reason: the two data files import the names and
`catalogue.js` imports the two data files, so keeping the names in `catalogue.js` would be a circle.

#### The catalogue is data, and the effects are not in it

FR-26 says a card's effect is a rule over game state, matched to its artwork **by card id**, with
neither side importing the other. So a catalogue entry says what a card *is*, when it may be played and
what the player must point at. What it *does* is a separate function, arriving with the commits that
implement each card. A view can render a card whose effect does not exist yet, and this whole file can
be tested without loading a single effect.

#### The counts, and why they are asserted twice

29 cards, **22 Action and 7 Reaction**, categories 5 Movement / 5 Blocking / 5 Troll / 4 Offensive. Two
copies of each, so a **58-card pool**.

Those numbers were counted off the artwork independently in section 4.3 of design handoff 03, before the
catalogue was written. The tests assert them, so a transcription slip shows up as a disagreement between
two counts rather than as a card quietly missing.

#### What the ids had to change, and what changed only for readability

Kebab-case, prefixed with the type. Three names could not be transcribed literally:

- **`Nühü` becomes `reaction-nuehue`.** A non-ASCII character in an id is one URL encoding away from a
  bug nobody enjoys.
- **`67` becomes `action-sixty-seven`.** An identifier starting with a digit is a trap in several of the
  places an id travels through.
- **`Speedrun Any%` becomes `action-speedrun`.** A per cent sign is a URL escape waiting to happen.

Two more were shortened purely for readability, and those are the only unforced changes in the file:
`Aight Imma Head Out` to `action-head-out` and `It's Not That Deep` to `action-not-that-deep`.

#### Category is `null` for ten cards, on purpose

The four categories are printed on artboard `4a` only. Artboard `6a` labels its ten cards by type and a
sub-kind instead. Those ten get `category: null` rather than an invented category, because reconciling
the two labelling schemes is **open decision D28 of design handoff 03**, and inventing one here would be
answering a design question that is not this side's to answer.

The sub-kind is stored for all 29 as `kind`, and **no code reads it yet**. Stored anyway, because the
catalogue is the machine-readable transcription of a generated HTML artboard nobody is going to open
again, and being lossy against that source is the worse failure. Some of the values are odd and they are
the artwork's own: `ACTION` and `REACTION` repeat what `type` already says, and `D4` and `D6` name a die.
Transcribed as they are, because tidying them up would be a decision hidden inside a transcription.

#### The catalogue validates itself when it loads

`assertCatalogue` runs at import. The mistakes hand transcription produces are all quiet: a duplicated
id, a typo in a category, a Reaction card whose trigger is the action phase. None of them throws when it
happens, and all of them become a card that cannot be played or cannot be labelled, weeks later.

One of the checks is a real rule rather than a spelling check. FR-23 and FR-24 say an Action is playable
only on your own turn and a Reaction only during someone else's, so an Action may carry only
`ACTION_PHASE` and a Reaction may carry only the three windows. That is asserted per card at load and
again in the tests.

#### 16 of the 29 cards need a target, not 14

`targets` is a list, because Hyperbeam needs a pawn **and** a direction. The plan estimated 14 cards
needing a target before the cards were transcribed one at a time; the real number is 16, and the test
pins it, because it is the surface the target picker of issue #34 has to cover.

`TARGET.NONE` may not be combined with a real target, which is checked, because a card that says both
"nothing to pick" and "pick a pawn" would make the picker guess.

### The skill pool is built completely differently from the dice pool, and the reason is lifetime

`core/dice-pool.js` is an object holding its remaining cards in a closure. `core/skill-pool.js` is pure
functions over arrays that live in the game state. The two are deliberately not the same shape.

A **dice** hand exists for one turn. All three cards go back at the end of it (FR-21), there is no
discard pile, and nothing about it survives into the next turn, so nobody outside that turn needs to see
it. Hiding it in a closure costs nothing.

A **skill** card, once drawn, sits in a hand for as long as its owner keeps it. The pool, four hands and
the discard pile are all things the view has to show, all things a saved match would have to write down,
and all things a replay has to reproduce. That makes them state, and state in this project lives in one
frozen object in `state/`, not in a closure only one module can see.

#### The pool holds ids, not card objects

Two copies of Angel Die are indistinguishable to every rule, so storing two references to the same
frozen object would be storing the same string twice with extra steps. It also keeps the state small and
JSON-shaped, which matters the day a match has to be written down.

#### The closed accounting rule, and the test that is the reason this module exists (FR-27)

Every one of the 58 cards is in exactly one of pool, a hand, or the discard pile, at every moment.
`totalCards` is the only function here that no rule calls; it exists because FR-27's acceptance criterion
is a property of the whole system rather than of any single step, and a property is only worth stating if
something checks it.

**A card that quietly disappears is the most likely silent bug in a system like this.** It throws
nothing, breaks nothing at the time, and shows up as a pool that is mysteriously thin an hour into a
playtest. The test plays 400 draws and discards across four hands and asserts the total after every
single step, and a second test asserts that no card ever exists in more copies than the catalogue
defines, which is what would catch a reshuffle that copied instead of moving.

#### Two refusals rather than two errors

- **A full hand draws nothing** and the card stays in the pool. Rejected alternative: draw it and put it
  straight in the discard pile, which some card games do. It burns a card for nothing and thins the pool
  measurably over a match, for no gain a player would notice.
- **An empty pool and an empty discard pile** draw nothing. Only reachable if all 58 cards are in hands,
  which four hands of five cannot hold, so it cannot happen. Handled rather than assumed, because
  "cannot happen" is how closed accounting stops being closed.

#### Negative finding: the hand limit of 5 is an assumption

The game design document said 3. It was written for a game that drew cards far more rarely, and with a
draw at the start of every turn plus the skill squares a limit of 3 means a player is at the limit almost
always and the extra draws do nothing. 5 is a guess at "enough room that a draw is usually worth
something". Neither number has been playtested. It is one constant, and it is flagged in the plan, in
section 4.2 of design handoff 03, and now in section 10 of the game design document.

### The rules substrate the skill cards needed: 2026-08-31, issue #38

Before a single card effect could be written, five things had to exist that the game had no concept of.
All five are `core/`, all five are pure, and none of them mentions a card by name. That separation is
deliberate: a card is data, an effect is a function, and this layer is what both of them stand on.

| New module | What it owns |
| --- | --- |
| `core/roll.js` | The roll as an ordered chain of modifiers rather than one number |
| `core/statuses.js` | States that outlive the card that caused them, measured in turns |
| `core/path.js` | The squares a move steps on, relative in and absolute out |
| `core/traps.js` | Objects that sit on a square: three traps and two blockers |
| `core/move-rules.js` | The per-pawn movement rules, split out of `movement.js` |

#### The roll stopped being one line, and the order had to be written down

Four of the ten cards of artboard `6a` change the number that comes off the die, and they do not
commute. A 3 doubled and then given a +5 is 11; the same 3 given a +5 and then doubled is 16. That is a
difference of a full lap, so the order is written once, in the module's own table, and obeyed nowhere
else: named number, then advantage or disadvantage, then extra dice, then multiplier, then a floor at
zero.

**Advantage and disadvantage cancel out.** The alternatives all need a written rule about which card was
played first. Cancelling needs none, and "the two effects undo each other" is what a player would guess.
The test proves the second roll is never even spent: the scripted RNG throws when it is asked for a
number it was not given.

#### Two rules had to change, and both are in the journal

1. **Leaving the start area became `roll >= dieMax`** (FR-09). Angel Die adds a D8, and under the old
   `roll === dieMax` a **buff would have made leaving the yard impossible**. Without card modifiers a
   roll can never exceed the maximum, so every match played before the change plays identically. That
   compatibility claim is asserted, not argued: the movement tests from issue #28 pass untouched.
2. **A roll of zero is now a legal outcome.** Devil Die can subtract more than the die produced.
   `movement.js` used to throw a `RangeError` for anything outside 1 to `dieMax`, which would have
   turned one card into a crash. Zero now has its own refusal reason, `move.refused.no-steps`, and is
   answered once for the turn rather than four times, once per pawn.

#### A duration is normalised before it is stored

The artwork measures time in two units. Some cards say "for 2 rounds", some say "for 3 turns". Those are
not comparable: one round is four turns at a full table and two at a small one. So `turnsForRounds` is
the single conversion and everything downstream is in turns. Without it the same card would quietly mean
something different at a different table size.

A status stores an **absolute deadline** and not a countdown. A missed decrement would leave a pawn
frozen forever with no error; a missed filter shows up immediately as a status that will not go away.

#### A broader status answers a narrower question

`hasStatus(statuses, kind, { player, pawn })` matches loosely upwards: an entry with `pawn: null`
belongs to a whole player, and one with both fields `null` belongs to the whole board. That is what lets
The Purge be **one** entry rather than sixteen. It never matches downwards, so a status on pawn 1 cannot
answer a question about pawn 2.

#### Rock is a status on a pawn, Big Ah Rock is an entry on a square

Both block passage, and they are stored differently because of what they are attached to. A Big Ah Rock
is dropped on a square and stays there. **A Rock turns one of your own pawns into a blocker**, so the
blocked square moves when the pawn moves. Storing that square would be storing a copy of a pawn position
that goes stale the moment the pawn walks, which is exactly the quiet duplication the frozen state object
exists to prevent. `blockedSquares(pawns, board)` therefore reads one from the list and derives the other
from the pawns, every time it is asked.

#### The one rule that had to look at the whole walk

Everything in this project checks the destination square, and `movement.js` says why in its own comment:
a pawn jumping over three opponents is classic Ludo working correctly. Rocks and traps are the exception,
and they are the **only** exception. `squaresCrossed` exists for them alone, and an ordinary move still
never calls it.

#### Why `movement.js` was split, and where the seam is

The file was at 207 of its 300 lines and had two jobs in it: deciding what a single pawn can do, and
collecting four of those decisions into an answer for the turn. Every skill card lands on the first job.
So that half moved to `move-rules.js`, and `movement.js` kept the public API, the turn-level collection
and `applyMove`.

The seam is a real one and not a line count: **everything in `move-rules.js` takes one pawn, everything
left in `movement.js` takes a player's four.** `MOVE_KIND` and `REFUSAL` are re-exported from the old
place, so every caller and test written before the split imports them unchanged.

#### Ragebait is the one card that could not be a per-pawn rule

"If the taunted pawn can move, you must move it" is a statement about the **relationship** between a
player's moves. Asking one pawn "may I move" cannot answer "is a different pawn obliged to". So it is a
filter over the finished move list, `applyRagebait`, and it stands down when the taunted pawn has no move
at all. Without that, a taunt on a pawn that is already home would end its owner's turn for them, which
is not what a taunt is.

#### Built Different became a refusal rather than a spent shield

The artwork reads as "survives one capture". Implemented literally, the capture is refused and the
mover's pawn still arrives on the square, which puts two pawns on one square. So the rule is: **a pawn
that cannot be captured cannot be landed on either**, and the move is refused with
`move.refused.protected`. The duration replaces the "once" in the card text. Recorded as a deviation
rather than a transcription.

#### Negative finding: nothing yet reads three of these five modules

`path.js`, `traps.js` and half of `statuses.js` are complete and tested and **no card uses them yet**.
They were written first on purpose, because writing nineteen card effects against a substrate that does
not exist is how the substrate ends up shaped by whichever card was written first. The cost is that
their tests are the only callers until the artboard `4a` commits land.

### The effect engine, and 17 of the 29 cards: 2026-08-31, issue #38

FR-26 says a card's rule and its artwork are matched **by card id**, with neither importing the other.
That sentence is now three files that do not know about each other:

| Place | Says | File |
| --- | --- | --- |
| The catalogue | What a card **is** | `core/cards/catalogue-core.js`, `catalogue-extra.js` |
| The effect table | What a card **does** | `core/cards/effects/index.js` |
| The card view | What a card **looks like** | `ui/card-view.js` |

The practical payoff is that a card can exist in one and not the others, and it did: the 29-card
catalogue shipped two commits before any effect, and the view rendered all of them.

#### An effect takes a flat snapshot, not the game state

NFR-01 forbids `core/` from knowing the shape of the state object, and this is where that rule earns its
keep rather than merely being obeyed. An effect takes a **context** and returns a **patch**, both flat:

```js
(context) => ({ modifiers: withModifier(context.modifiers, { addDice: [8] }) })
```

**Every one of the effect tests is three or four literals.** Against the state object each would need a
started match, a chosen die and a scripted RNG, and the tests would be about the builder rather than
about the card. `state/skill-play.js` is the single module that translates, in both directions.

A patch names only the fields it changes, so an effect that touches the roll cannot blank the trap list
by omission. A patch that names a field that is not on the allowed list **throws**, because a typo like
`{ status: [...] }` for `{ statuses: [...] }` is otherwise silently ignored: the card does nothing and
nothing fails.

#### Two patch fields are instructions rather than data

`negate` and `cancelMove` are not board state. They are answers to questions an effect cannot see the
subject of: "the card that opened this window does not happen" and "the declared move does not happen".
`skill-play.js` hands both back to the caller untouched, and `reaction-window.js` and `intents.js` act
on them.

#### The target check is in one place rather than in 29 effects

A card's `targets` list says what the player has to point at. `checkTarget` in `state/skill-play.js` is
the only thing that checks it, which means every effect may read `context.target.pawn` without guarding
it. Two rejection reasons rather than one, and the difference matters to the player: **"you have not
picked a pawn yet" is a prompt and "that pawn is not yours" is a mistake.**

One card needs something the catalogue cannot express. 67 says "roll a 6", which on a D2 or a D4 is not
unlikely but impossible, so the card is unplayable when the chosen dice card has fewer than six faces.
That is a **playability** rule and not a target, so it lives in a small table in `skill-play.js` rather
than in the catalogue.

#### The effects are grouped by mechanic, not by artboard

`roll-effects.js` holds the five that write one entry into the roll chain, `card-effects.js` the five
that act on hands and budgets, `status-effects.js` the six that leave something on a pawn. Two artboard
`4a` cards, Speedrun Any% and Tax Fraud, sit with artboard `6a` cards, and that is right: **the artboard
a card was drawn on is a delivery fact, not a taxonomy.** Grouping by mechanic is also what keeps each
file well under 300 lines and readable as one idea.

#### A card writes a fact and movement reads it

Not one of the six status cards contains a movement rule, and not one movement rule knows a card by
name. `action-rock` writes `{ kind: "rock", player, pawn }`; `blockedSquares` in `core/move-rules.js`
reads it. The tests are split the same way, deliberately: `effects.test.js` asserts that the status is
written, `move-rules.test.js` asserts that it stops a pawn. Testing both in one place would hide which
of the two is wrong when it breaks.

#### Three cards were changed from what the artwork says

Each is recorded as a deviation rather than a transcription, with the reason:

| Card | Artwork | Implemented | Why |
| --- | --- | --- | --- |
| Hold Pawn | "as its turn begins" | Played into the roll window | Nothing happens at the start of a turn that another player could answer |
| The Purge | Also reaches pawns already home, and lets you enter an opponent's house | Only the "every landing captures" half | A house is private to one player and no number names another player's house square |
| Lock In | Labelled `DEFENSIVE`, effect not stated | The pawn cannot be moved **and** cannot be captured | A card that only stopped you moving your own pawn would be a card that only hurts its owner |

> **This table was incomplete and issue #45 found out how.** Three *more* cards had been changed from
> what the artwork and the rulebook say, and none of them was written down here: Banana Peel, It's Not
> That Deep and Big Ah Rock. See "The rules the code had quietly rewritten" below. The three rows above
> are deviations that were decided; those three were deviations that simply happened.

#### Negative finding: 12 of 29 cards still have no rule

`hasEffect` is the question both `state/` and `ui/` ask, and a card with no entry can be drawn, held and
looked at, and is refused when played. The count is **asserted** in the effect test rather than described
in a comment, so the number in this note cannot go stale silently: when the assertion reads 29 the game
is complete.

### The last twelve cards, and the three mechanics they needed: 2026-08-31, issue #38

All 29 cards now have a rule. The twelve added here are the ones that need something the board did not
have, and the three new mechanics are what the plan predicted would be the expensive half.

| Mechanic | Cards | New module |
| --- | --- | --- |
| A pawn moved without a move | Yeet, Aight Imma Head Out, Let Him Cook, Ghost Mode, Uno Reverse | `core/displacement.js` |
| Objects sitting on a square | Banana Peel, Oil Spill, It's Not That Deep, Big Ah Rock | `core/traps.js` |
| More than one square at a time | Hyperbeam, Janky RPG, 67 | `core/path.js` |

#### `applyMove` was not enough, and the second way is deliberately blunt

Everything a pawn did before this was a **move**: an object produced by `evaluateTurn`, checked against
every rule, then written by `applyMove`. A pawn shoved by Yeet is not making a move. Nobody chose it, no
legality was checked, and its owner cannot refuse it.

So `core/displacement.js` checks nothing about legality, because the card is the authority. It enforces
only the two things that are properties of the **board** rather than of any rule: a pawn never lands
outside 0 to 44, and a pawn pushed backwards stops at `r = 1`.

**The backwards floor is a game decision and it is the most important one in this commit.** If a pushback
could reach the start area, then Yeet, It's Not That Deep and Big Ah Rock would all be cheap substitutes
for a capture, and capture is the mechanic the whole game is built around: a captured pawn loses most of
a lap. Stopping at `r = 1` keeps a pushback a setback. The two cards that are *meant* to send a pawn
home say so and call `sendHome`, which is a different function for exactly that reason.

#### A trap fires on crossing, and a skill square only on landing

These two are the opposite of each other and both are right:

| | Fires on | Why |
| --- | --- | --- |
| A trap | Crossing **or** landing | A trap that needed an exact landing would almost never fire. A D20 crosses twenty squares and lands on one |
| A skill square | Landing only | Collecting them in bulk with the biggest die would undo the point of the dice pool |

Said plainly: **a reward you can farm is broken, and a punishment you can jump over is not a punishment.**

Only the **first** trap on a walk fires, so one move has one outcome, and a trap never fires under a pawn
belonging to the player who laid it. A card that punishes its own player is a card nobody plays.

> **Half of that is superseded.** "Only the first trap on a walk fires" is still exactly true, and it is
> now the load-bearing half. **"One move has one outcome" is not:** since issue #45 a trap that moves the
> pawn starts a new walk, which can fire a trap of its own, up to a bounded chain. The section below
> restates both properly.

#### The order inside `resolveMove` is a rule, and it is invisible in almost every test

Three things happen in one transition:

1. the pawn arrives, and a captured pawn goes home
2. a trap it walked into goes off, **which can move it again**
3. the square it is *actually standing on* is asked whether it hands out a card

Step 2 moving the pawn is what makes the order matter, and a trap and a skill square rarely meet, so
getting it wrong would pass nearly every test. `move-resolution.test.js` therefore puts them in each
other's way on purpose, in both directions: a trap that knocks a pawn **off** a skill square before it
can collect, and a trap that pushes a pawn **onto** one it was never going to reach.

#### Two cards needed a new step in the roll chain

67 is "roll a six or go nowhere, and if you do, take double". That is a **threshold**, which the chain
had no notion of, so `modifiers.atLeast` was added and sits **before** the multiplier. The order is the
rule: a 3 doubled to 6 must not pass a test the dice failed.

The guard on it caught a real bug immediately. `atLeast` defaults to 0, and without `atLeast > 0` a roll
that Devil Die had pushed to -7 was reported as a *missed threshold* rather than as the floor doing its
job. The trace is what the screen reads out, so a wrong label there is a wrong explanation.

#### Four more cards were changed from what the artwork says

| Card | Artwork | Implemented | Why |
| --- | --- | --- | --- |
| Hyperbeam | A straight cardinal lane on the 11 by 11 grid | A run of 1 to D4 squares along the track, friendly fire included | The grid lives in `ui/board-geometry.js` and `core/` may not import `ui/`. The D4, the direction, the run and the friendly fire all survive; the geometry does not |
| Oil Spill | Skips every skill tile **and safe zone** | Skips the skill square only | There are no safe squares in the MVP (FR-15 is a `could have`) |
| Aight Imma Head Out | Two options, not stated precisely | Forward four, or back to your own entry square | Retreating to `r = 1` rather than to the yard is what makes it a choice rather than a worse capture |
| Let Him Cook | Labelled `RISKY`, risk not stated | A D12 run, and an overshoot sends the pawn home | `displace` alone clamps at the deepest house square, which would make it a free win for any pawn near home. Deliberately harsher than FR-13: a move the player chose is refused, a gamble the player took is lost |

#### Both area cards hit their own side, on purpose

Hyperbeam's artwork says "friendly fire" outright and Janky RPG's whole name is that it is unreliable.
Neither filters the player's own pawns out of the sweep. **A card that sent four pawns home with no risk
to its owner would be the only card anybody ever played.**

Janky RPG is the sharper of the two: a D6 of 4 or better hits the square that was named, and 3 or less
hits both its neighbours instead, which makes the square you aimed at the one place that is safe.

#### The 29 rules sentences are provisional copy

Every card now has a `text` key in both locales, and it describes the rule that was **implemented**
rather than the artwork's wording. Seven cards differ from the artwork and each deviation is in the
tables above.

**This is Product Owner work that was done to unblock the code**, and it is recorded as such: a card
with a name and no rules text is a card nobody at the table can play. The locale test checks that all 29
have one, so replacing the wording is editing text and not hunting for gaps.

### Counting how far a player has got: 2026-09-01, issue #39

`pawnProgress(pawns, player)` in `core/pawns.js` returns `{ start, track, home }`, which is the whole
content of FR-36 and therefore of the HUD.

- **The three buckets are the three regions of `board.js`, not a scale invented for the HUD.** That is
  what makes `home` mean exactly what winning means: `hasWon` is all four pawns in the home column, so a
  HUD row reading `home: 4` and a won match are the same fact read twice. A unit test asserts the two
  together rather than trusting the coincidence.
- **It sums to `PAWNS_PER_PLAYER` at every position**, and there is a test that walks a pawn from `r=0`
  to `r=44` and checks the total after every step. A player reads three numbers as a breakdown of four
  pawns, so a bucket that missed a region would show a breakdown of three and nothing else would notice.
- **It is in `core/` and not in `ui/`** because it is arithmetic over pawn positions, the same kind of
  question `seatsIn` answers. The practical consequence is that it sits inside the coverage figure,
  where `ui/` does not.

### `remaining()` became part of the dice-source interface: 2026-09-01, issue #30

The interface `core/dice-source.js` documents gained a fourth method. It is now
`{ handSize, draw(rng), returnHand(hand), remaining() }`, and `fixedDieSource` answers `remaining()` with
1.

- **It already existed on `createDicePool` and had done since 2026-08-30.** What changed is that it is
  now a property of the *interface* rather than of one implementation. Before this, a caller that wanted
  the count had to write `typeof source.remaining === "function"` first, and that guard would have been
  the only place in `ui/` that had to know which dice source it had been handed.
- **The stand-in returns 1 and that is not a placeholder.** `fixedDieSource` holds exactly one card and
  never runs out, so one is the honest answer for it. An implementation that omitted the method would
  push the guard back out to every caller, which is the thing being removed.
- **Rejected: reading `POOL_SIZE` and subtracting the hand size in `ui/`.** It computes the right number
  today and it is a rule about the pool living in the view. It would also be silently wrong the first
  time anything holds a dice card across a turn boundary.
- **The comment on `remaining()` was wrong and was corrected.** It said "for tests and for the HUD in
  issue #35". The HUD dropped pool and discard counters on 2026-09-01, so the sentence pointed at a
  caller that had been decided against. It names the pool overview now.

#### Negative finding: the FR-20 test proved reachability and was read as proving uniformity

FR-20's acceptance criterion is "over a large sample each face occurs with frequency consistent with
1/*n*". What `dice-source.test.js` asserted was `seen.size === faces` over four thousand rolls: every
face turns up at least once. **A die that returned the 1 in ninety per cent of rolls and spread the
remaining ten per cent over the other faces would have passed it.**

The same shape of gap was in the pool test for FR-16, "each defined denomination is reachable" over a
long run: it checked the composition *table* rather than what `draw` actually deals.

Both are closed by `tests/unit/core/dice-distribution.test.js`, and how the tolerance was chosen is in
[08-quality.md](08-quality.md). The finding worth carrying into the report is not the missing test, it
is that **the test's name was accurate and its assertion was not.** It was called `rollDie (FR-20)` and
it sat next to the requirement id for two days, which is exactly the state in which nobody re-reads it.

### `blockedSquares` moved to the module whose subject it is: 2026-09-02, issue #45

A refactor with no behaviour change, done first and on its own so that the seam is a reviewable commit
rather than noise inside a feature. `blockedSquares` left `move-rules.js` for `traps.js`.

**Why it belonged there and not where it was.** It answers "which absolute squares may nothing cross
right now", and its own comment was already entirely about how the two sources of that answer are
stored: a Big Ah Rock is an entry in the trap list with a square of its own, a Rock is a status on a pawn
whose square is wherever that pawn is standing this instant. Both halves of that explanation are
`traps.js`'s subject. It sat in `move-rules.js` because that is where the first caller happened to be.

**Two things it buys, and the second is the one that forced it.**

1. `move-rules.js` came down far enough to take the new `STUNNED` refusal without approaching NFR-02's
   300-line limit.
2. `core/slide.js`, which issue #45 adds, has to ask about blockers. With `blockedSquares` in
   `move-rules.js`, a **displacement** module would have had to import the **move rules**, which is the
   wrong way round: displacement is what cards do to a pawn without a move, and it has no business
   knowing how a legal move is evaluated. With the function in `traps.js` both callers ask the same
   module the same question.

**It is re-exported from `move-rules.js`**, the way that file already re-exports `TRAP_KIND` and the way
`movement.js` re-exports `MOVE_KIND` and `REFUSAL`. Not politeness: `move-rules.test.js` imports it from
there, and **the test file was not touched.** That is the proof the move was pure, and it is the reason
the commit is worth being separate. A refactor whose test file has to change is not a refactor.

One incidental tidy: the literal `40` in the Rock filter became `TRACK_LENGTH`, which is the constant it
had always meant.

**Rejected alternative:** compressing `move-rules.js` to make room instead. `CLAUDE.md` forbids meeting
the line limit by deleting comments or whitespace, and in this codebase the header comments are the part
worth keeping. The limit is there to force a seam to be found, and there was a real one here.

### A second way to move a pawn, and why `displace` could not become it: 2026-09-02, issue #45

`core/slide.js`. Two functions, `slideStop` and `slidePawn`. Nothing calls them yet; they land on their
own so that the rule they carry can be tested before anything depends on it.

**The problem it closes.** `displace` clamps a pawn's position and does nothing else. That is deliberate
and its header says so: "it checks nothing about legality, because the card is the authority." Eleven of
the 29 cards call it, and that sentence is why they safely can. What it means in practice is that before
this, **an Oil Spill slide or a Yeet could put a pawn onto a square that already held one and leave both
there.**

The two halves of that bug behave very differently, and the asymmetry is the interesting part:

| Two pawns on one square | Caught by | When |
| --- | --- | --- |
| Different players | `captureTarget` **throws**, because FR-11 makes it impossible | The next time anything lands there |
| The **same** player | Nothing. That function filters to opponents | Never |

So the loud case was already loud, and the quiet case could corrupt the board indefinitely. Inside a
house column it would break the FR-05 win condition, because two pawns stacked on one house square means
the four house squares can never all be filled, and the symptom would appear many turns later with
nothing pointing at the cause.

**Why a new module rather than making `displace` careful.** Adding blockers and captures to `displace`
would falsify the one sentence that makes it safe to call from eleven places. So `displace` stays blunt
for the cards that want blunt, and the shove that a *trap* performs is a different function. The
distinction is real: a card being deliberately reckless is the card's authority; a trap firing is the
board resolving a consequence, and a consequence has to leave the board in a state the other rules can
still read.

**The rule, in one line: a pushed pawn stops on the square before the first thing it cannot share.**
Three things count, and two of them are rules that already existed somewhere else:

| What | The rule it reuses |
| --- | --- |
| A Rock or a Big Ah Rock | `blockedSquares`, which is why that function moved into `traps.js` first |
| A pawn of the pushed pawn's own player | FR-12, via `isSameSquare`, which is also what forces all four house squares to be filled |
| A pawn carrying `STATUS.ARMOURED` | `moveOnto`'s existing reasoning: a pawn that cannot be captured cannot be landed on either |

Both decisions behind it are in the journal, including the rejected step-back loop and the cost: **Yeet
and Aight Imma Head Out now stop short in board states where they used to overlap two pawns silently.**
That is a stronger invariant, and it is written down so it cannot later be argued as a regression.

**One design detail worth carrying into the report**, because it is the same shape of answer twice. The
clamp runs **before** the walk, so a slide is never stopped by something on a square it was not going to
reach. And `slideStop` answers the pawn's *current* position when nothing can happen, instead of
returning a "did it move" flag: the caller compares `from` and `to`, which it needs anyway to ask what
the pawn crossed. Both are cases of letting the data answer the question rather than adding a signal.

### One place a pawn enters a square, and the rules that stopped being spread out: 2026-09-02, issue #45

Two new modules and one that shrank. `core/enter.js` is the choke point, `core/trap-fire.js` holds the
firing rules, and `core/cards/effects/trap-effects.js` is down to what it says on the tin: four cards
that put something on a square.

#### The rule was only as complete as the list of call sites, and the list was one

FR-30 says a trap fires when a pawn **enters** a tile. Until this commit the check lived in
`state/skill-turn.js` and was called from exactly one place, `resolveMove`. So a trap fired for a dice
move and for nothing else. Yeet, Aight Imma Head Out and Let Him Cook could push a pawn straight over a
Banana Peel and nothing happened, and **Yeet's own printed card text says "or forward onto a trap, if
you're feeling mean"**, which the game could not do.

That is the general shape of the finding, and it is worth the report: a rule implemented at its call
sites is a rule whose completeness nobody can check. Moving it behind one function makes "every
movement fires traps" a property of the code instead of a claim about a list.

#### No trap kind writes a pawn position any more

The seam the whole issue hangs off. `fireTrap` used to move the pawn itself, with `displace`, which
checks neither blockers nor captures. Now it returns the two lists it can change plus a **number**:

```js
{ statuses, traps, slide }   // slide is 0 when the trap moves nothing
```

One place performs the displacement, and it is the place that knows about blockers and captures. Three
rules each doing their own arithmetic is three chances to get it wrong; one number handed to one walker
is none. It also made the Banana Peel rule change almost free, because a stun is simply `slide: 0`.

#### The chain, and what actually bounds it

A trap that moves the pawn starts a **new** walk from where the pawn was pushed to, and that walk can
fire a trap of its own. The two halves call each other, which is why they share a file rather than
being split into two:

```
enterSquares -> fireTrap -> slide != 0 -> shove -> slidePawn -> enterSquares -> ...
```

Two properties, and the second is the one that is easy to state wrongly:

- **Only the first trap on any one walk fires.** A move crossing two Banana Peels sets off the near one
  and stops. That is unchanged and is what keeps a single walk from having two outcomes.
- **The chain is bounded at `TRAP_CHAIN_LIMIT = 6`, and the cap is not what makes it terminate.** Every
  firing calls `removeTrap`, so each link consumes an entry and the recursion is already bounded by the
  length of the trap list. The cap guards against a future trap kind that survives its own firing,
  which this issue itself makes plausible. The journal block spells that out, because a cap whose reason
  is misremembered as "otherwise it loops" is a cap somebody later deletes after proving it cannot loop.

Two arrivals set off nothing at all, and both are implemented by *structure* rather than by a condition:
a pawn going home, because `sendHome` is a different function that never reaches the choke point; and a
slide that moved nothing, because there is no walk to ask about and asking about a zero-length one would
re-fire the trap that had just gone off.

#### The rules the code had quietly rewritten

The Product Owner decided that the Game Design Document wins wherever it and the code disagree. Three of
the four square cards were affected, and **none of the three was in the deviation table above**:

| Card | The rulebook and the artwork | What the code did | Now |
| --- | --- | --- | --- |
| Banana Peel | Stunned, loses its next turn | Sent the pawn back to its start area | A `STATUS.STUNNED` for one round |
| It's Not That Deep | 1 back, plus offensive cards nullified within 3 squares | Pushed back a D6, no aura | Pushed back exactly 1. The aura lands separately |
| Big Ah Rock | 3 rounds, plus the enemy pawn behind knocked back 3 | 2 rounds, no knockback | Landing in a later commit |

#### The two card texts that had started describing the code

`en/cards.json` said Banana Peel sends a pawn "back to the start area" and It's Not That Deep pushes it
"back a D6", in both languages. Both were accurate descriptions of the implementation and neither matched
the card the player is holding. **They were corrected in the same commits as the rules**, rather than in
one tidy-up at the end, because a wrong sentence in a player's hand is a worse bug than a wrong constant:
a constant is invisible until it fires, and the sentence is on screen every time the card is drawn.

Two texts are still incomplete rather than wrong: Oil Spill does not mention that its slide now resolves
captures and is stopped by a boulder, and Big Ah Rock still says two rounds. Both land with their rules.

#### Losing the D6 changed how often a chain happens, in the direction nobody expected

It's Not That Deep pushed back an average of 3.5 squares and now pushes back exactly 1. The obvious
reading is that the card got weaker, which it did. The less obvious consequence is about the **chain**
added in the same issue: two traps now have to be on **neighbouring** squares for a pushback to walk into
the second one, where a D6 would have reached anything within six.

So the two changes pull against each other, and the net effect is that chains are rare. That is worth
recording as a balance fact rather than discovered later as a surprise: the chain is a correctness
mechanism, not a feature the player will see often. It exists so that a push resolves its capture and
respects a boulder, and the second trap going off is the uncommon case.

It also removes one draw from the injected RNG per firing, which is why three scripted-roll tests had to
be re-counted. Chapter 08 has the general version of that problem.

**How the drift happened is the interesting part, and it was not carelessness.** Epic #38 implemented
nineteen cards in one pass, five of which needed mechanics that did not exist. These three are exactly
the three whose printed rule needed a mechanic that *still* did not exist after that work: a status that
costs a turn, a rule measured in a radius, and a knockback that searches the board. Each was replaced by
the nearest thing the engine could already express, and the substitution was never recorded.

**The mechanism to record it existed and was not used.** Section 7.3 of the Game Design Document is a
table of six cards whose printed text the board cannot express, each with the reading built instead and
the reason. That is precisely the right home for all three. A deviation on the record is a decision; the
same deviation off the record is a bug with good manners, and the locale files had already started
describing the code rather than the game.

#### The stun, and one deadline that looks like an off-by-one

`STATUS.STUNNED` is read by `evaluatePawn` exactly the way `STATUS.HELD` is, so **only the caught pawn
sits out** and its owner's other three are unaffected. No new step in the turn sequence, because Hold
Pawn had already established the shape. It gets its own refusal reason rather than reusing `held`,
because the two are different things to the player: Hold Pawn is something an opponent played at them, a
stun is something they walked into.

The deadline is `turnNumber + turnsForRounds(1, playerCount) + 1`. The `+ 1` is not a fencepost error.
`hasStatus` applies while `turnNumber < until`, and a trap sprung during a dice move fires under the
**active** seat's own pawn, so the turn to be missed is a full round away and `until` must exceed it. The
same expression also costs exactly one turn when a card sprang the trap under another seat's pawn, whose
next turn is sooner than a round away. One expression, no branch, and a test at two, three and four
seats so that a hard-coded four could not have hidden a two-player bug.

#### A missing rule now stops the game at boot

`fireTrap`'s closed `switch` is gone. In its place is a frozen table of one rule per kind, plus a loop
that runs **at import** and throws if any non-blocker kind has no entry.

What the `switch` did wrong is worth naming precisely, because it looked correct: its `default:` returned
everything untouched, which is right for a blocker, since blockers share the list and never fire. So the
same branch also swallowed a missing rule for a *new* kind, in silence, while the module's header
promised "a fifth trap is a line there and a case here". The failure would have appeared as a trap that
did nothing, several matches later. `assertCatalogue` already set the pattern: check the table against
the vocabulary once, when the module loads, so the failure lands on the day the kind was added.

A blocker reaching `fireTrap` now throws too. Two guards already stand between a blocker and that
function, so arriving anyway means one of them broke, and an exception says which.

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
- ~~The dice pool balance was to be paper-prototyped or spreadsheet-tested in Sprint 0
  ([01-Github-Project.md](../../Project-Management/01-Github-Project.md)).~~ **Closed 2026-08-30 with
  issue #30, and not by a spreadsheet.** Section 5.2 of the game design document is re-derived
  against the 44-step journey by `npm run docs:dice-balance`, which solves the journey exactly as a
  recurrence and then plays 1200 matches through the shipped rules to check the result. The
  composition needed no change. The table for the appendix is that command's output. Still open: a
  **human** playtest, because the simulation says a match is 127 turns and cannot say whether that is
  enjoyable.
- **Negative finding carried forward from that measurement:** one turn in three has no legal move at
  all. It is partly an artefact of the simulation's no-skill policy and partly structural, and it is
  the first thing to re-measure once the dice hand of issue #31 exists. Recorded in section 5.2.3 of
  the game design document.
- ~~Unresolved rule questions carried over from Chapter 01: overshoot behaviour, and whether the
  highest-number-to-leave-start rule scales sensibly across D2 through D20.~~ **Ruled 2026-08-22:**
  overshoot is illegal and the move is not offered (section 6.2 of the game design document); the
  leaving rule scales by design and the arithmetic is written out, `P(max) = 1/n` against
  `E(roll) = (n+1)/2`. Still open: Product Owner sign-off, and whether the composition plays well,
  which only a playtest or a simulation over this layer answers.
