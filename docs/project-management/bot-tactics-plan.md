# Bot Tactics Plan: making the bots play smarter

Written 2026-09-06 against `dev` at `7eccd8c`. A working plan, not a report chapter: it is meant to be
turned into GitHub issues and deleted once the work is built, the same way the handoff 15 plan was.

## 1. Where the bot stands today

The bot (`src/ai/`, issues #43 and #82) is already a **value-based** player: every choice it makes is
priced in one currency, "steps of a pawn", and the highest price wins. That design is good and this
plan keeps it. In short:

| Decision | How it is made today | File |
| --- | --- | --- |
| Which die to pick | Average best move over every face the die can roll | `dice-choice.js`, `roll-odds.js` |
| Which pawn to move | Highest category: finish 100, capture 60 + victim's progress, enter house 30, leave yard 25, else 1 per step | `move-scoring.js` |
| Whether to play a card, and which | Every card in hand is priced; the best one plays if it beats 4 points (1 point when the hand is full) | `card-choice.js`, `card-values.js`, `values-*.js` |
| How dangerous a pawn's square is | A pawn `d` squares behind hits with 1/6 (d up to 6), 1/12 (up to 12), 1/20 (up to 20) | `threat.js` |

**What it cannot do yet**, all of it already named as follow-up work in `notes/06-state-and-turn-flow.md`:

1. **Moving a pawn ignores danger.** `scoreMove` never asks "does this move park my pawn six squares in
   front of an opponent?" or "does it leave the pawn where it was, in danger?". A 6-step walk into the
   jaws of two enemies scores exactly like a 6-step walk onto an empty stretch of track.
2. **Moving a pawn ignores opportunity.** Landing four squares behind an enemy pawn sets up a capture
   next turn. The bot does not see it.
3. **The danger model is crude and too optimistic.** The real chance of being hit depends on the dice
   pool an opponent draws from (2 x D2, 3 x D4, 4 x D6, 4 x D8, 3 x D10, 2 x D12, 2 x D20, three cards a
   turn). Worked example: an opponent one square behind me draws a D2 in about 28 % of hands
   (1 − C(18,3)/C(20,3)) and then hits on a coin flip; with a D4 or D6 in hand they still hit one time
   in four or six. The true chance is roughly double the flat 1/6 the bot assumes. Pawns in an
   opponent's **yard** are not counted at all, although they enter onto their entry square whenever they
   roll a maximum. Standing on somebody's entry square is a classic Ludo mistake the bot does not know
   about.
4. **Cards treat every opponent alike.** `share` is a flat `1 / (opponents)`. Hurting the player who is
   about to win is worth exactly as much as hurting the player who has not left the yard.
5. **Trap cards aim one square ahead of a victim**, which is the single square a victim is least likely
   to land on next (only a D2 or a natural 1 gets there).
6. **Nothing measures strength.** `bot-match.test.js` proves the bot can *finish* a match without an
   illegal intent. It does not say whether a change made the bot better or worse. Every constant in
   `ai/` is labelled "a guess" and there is no tool to replace the guess with a measurement.

Point 6 is the reason the plan starts with a scoreboard and not with a smarter bot.

## 2. Rules the plan keeps

These are existing project decisions. The plan works inside them rather than reopening them.

- **One currency.** Every new term is in the units of `SCORE` in `move-scoring.js`: one step is one point.
- **`ai/` stays pure and deterministic.** No `Math.random`, no `Date`, no `rng`. A seeded match replays
  exactly (NFR-09). Probabilities are computed, never sampled.
- **The bot does not cheat.** It reads only what a person sees: the board, its own hand, everybody's hand
  *size*, the public dice pool composition. `card-choice.test.js` enforces this by experiment and every
  new value must pass the same experiment.
- **No file over 300 lines.** `values-pawns.js` is at 290 and `values-window.js` at 257 today, so both
  split *before* anything is added to them.
- **No refused intents, ever.** A refused bot intent parks the match. `bot-match.test.js` stays the guard.
- **Numbers live in `notes/09` only**, next to the command that produced them. This plan quotes no
  measured figure; Phase 0 produces the command.

Out of scope, on purpose: look-ahead search (minimax or Monte Carlo). With random dice, hidden cards and
up to four seats the tree explodes, and a one-move expected-value model is exactly how strong human Ludo
players think anyway. The Purge and Oil Spill stay unplayed unless the arena shows hands clogging.
An LLM bot was rejected in issue #43 and stays rejected.

## 3. The phases

Each phase is one issue and one PR off `dev`. Each carries the five mandatory steps: prompt log, notes
(`notes/06` for facts, `project-journal.md` for the why, `notes/09` for numbers), changelog, tests,
Conventional Commit. Sizes are rough: S is about a day for one person, M two to three, L a week.

### Phase 0. A scoreboard: the bot arena (S to M)

**Goal.** One command that plays many seeded bot matches and prints who won how often, so that every
later change is judged by a number instead of by a feeling.

**Why this matters.** In a four-seat match a bot that is *exactly as good* as the others wins one match
in four. To see a real improvement over noise you need a few hundred matches, which the test suite must
never run but a script can. Their own header in `dice-balance.js` says why this is a script and not a
paragraph: a conclusion without the calculation that produced it expires silently.

**Changes.**

- `scripts/bot-arena.js`, run as `npm run bots:arena`. Plays N matches from seeds `1..N` through the real
  `startMatch` and `dispatch`, exactly like `bot-match.test.js` does, and prints a table: wins per seat,
  average turns, cards played, captures. Takes the player count and N from the command line.
- **Per-seat profiles.** `decide(state, profile)` gets an optional second argument, a frozen object of the
  tuning knobs (`riskWeight`, `opportunityWeight`, `playAt`, and so on), defaulting to `DEFAULT_PROFILE`.
  The arena can then seat a bot with the new terms **switched off** (all new weights at zero, which is
  today's behaviour exactly) against a bot with them on, in the same build. That is how "new versus
  old" is measured without keeping a copy of old code around.
- A **random-legal baseline** as the floor: a seat that picks a legal move and die at random from a
  seeded RNG. It lives in `scripts/`, never in `src/ai/`, because randomness may not enter `ai/`. If a
  change ever loses to the random bot, the change is wrong however good the argument for it sounded.
- The profile is also the seam a later **difficulty setting** would use (easy, normal, hard). Whether
  the line-up screen should offer one is a Product Owner and design question, filed as an open request
  and not built in this plan.

**Tests.** The arena is a script, so it is not unit tested. `bot-match.test.js` gains one case: two
profiles at one table still finish a match with no refused intent. The determinism case stays.

**Done when** `npm run bots:arena` prints a table, `notes/09` holds the baseline output next to the
command, and `notes/07` records the new script.

### Phase 1. Danger and opportunity in the move choice (M)

**Goal.** The bot stops walking into captures and starts setting them up. This is the single biggest
gain available and it improves the dice choice for free, because `chooseDie` already averages
`bestMove` over every face: a smarter `scoreMove` makes every die choice smarter with no change to
`dice-choice.js`.

**Step 1a. A real hit table in `threat.js`.** Replace the three-step `REACH` guess with a table
`P(hit at distance d)` for `d = 1..20`, computed **once at import** from `POOL_COMPOSITION` and
`HAND_SIZE` in `core/dice-pool.js`: over all C(20,3) = 1140 possible hands, the chance that the hand
contains a die that reaches `d`, times one over the faces of the smallest such die (the die an opponent
who wants to hit you would pick). Pessimistic on purpose: it assumes the opponent goes for the capture.
The pool composition is public (the pool screen shows it), so reading it is not cheating.

**Step 1b. Entry-square danger.** For each opponent with a pawn in the yard, my pawn on their entry
square is hit with `P(they roll a maximum)`, again from the hand table. Pawns already on their entry
square block their own entering pawn, so that case is zero.

**Step 1c. Proper "at least one" probability.** `threatOn` returns `1 − Π(1 − p)` instead of the sum.
The sum was defended in issue #82 because it was only ever compared to another threat. From Phase 1 on
it is multiplied by a pawn's worth and compared against a *gain* such as 25 for leaving the yard, so it
has to be a real probability. Armoured pawns (Built Different) have threat 0.

**Step 1d. Three new terms in `scoreMove`.** The category score stays as it is (the ranking is the
heuristic, its authors were right about that) and gets a correction added:

| Term | Meaning | Sign |
| --- | --- | --- |
| Risk delta | `threat(after) × worth(after) − threat(before) × worth(before)` for the moved pawn | subtracted |
| Opportunity | For each enemy pawn `d` squares ahead of the landing square: `P(I roll d next turn) × share × worth(enemy)` | added |
| Landing bonus | A skill square earns a card: `CARD_WORTH`. An enemy Banana Peel costs `STUN_WORTH`; It's Not That Deep costs one step | added or subtracted |

Both weights come from the profile so the arena can switch them off and tune them. `bestMove` gains
the `board` argument (`{ statuses, traps }`) it needs for armour and traps; `roll-odds.js` passes it
through.

**Why the correction and not a new category.** A category is all-or-nothing. Danger is a matter of
degree: a pawn on `r = 3` in front of one enemy is a small risk, a pawn on `r = 38` in front of three is
a catastrophe. A term that scales with worth and probability says both.

**Files.** `threat.js` (grows; split the geometry helpers `pawnsBehind`, `enemiesBehind`,
`friendsBehind`, `squareAhead`, `onTrack` into `geometry.js` first), `move-scoring.js`,
`roll-odds.js`, `bot-policy.js`, a new `profile.js`.

**Tests, all literal boards.** "Prefers the 4-step move onto an empty square over the 6-step move that
lands one square in front of two enemies." "Still finishes a pawn even when the alternative is safe."
"Does not leave the yard onto its entry square when an enemy pawn sits right behind it and another
pawn can move safely." "Parks four squares behind an enemy when the plain walk is otherwise equal."
"The hit table sums to a probability between 0 and 1 for every distance and is monotonically
non-increasing beyond the D2 range." `dice-choice.test.js`: "picks the die whose likely landing squares
are safe." Then the arena: profile with the terms on against profile with them off, both orders of
seating, and the result goes into `notes/09`.

**Journal decisions to record.** Sum to product in `threatOn` (with the rejected alternative and the
reason it was fine before). Correction instead of category. Pessimistic opponent model, and why a
too-cautious bot is preferable to a too-brave one here.

### Phase 2. Cards aimed where they hurt (M)

Four independent improvements, all small, all riding on Phase 1's hit table. They can be one issue or
four; one issue with four commits is recommended, because the arena run at the end is the same.

**2a. Gang up on the leader.** `share(state)` becomes `share(state, opponent)`: an opponent's loss is
weighted by how close they are to winning (their pawns' total progress over all opponents' progress),
so a Yeet against the leader is worth more than one against the last-placed player. Every reaction card
and every offensive action inherits it through the one function. This is the standard multiplayer
tactic and it is one function.

**2b. Traps where the victim will actually land.** `squaresAheadOfEnemies` in `values-squares.js` prices
each free square `d` ahead of an enemy by `P(they land on it)` from the hit table, summed over every
enemy pawn that could reach the square, instead of always taking `d = 1`. A square that three enemy
pawns can each reach is a better trap than one only the leader can reach.

**2c. Nühü priced by the real harm.** The flat `AIMED_AT_ME = 8` is replaced by four small
receiving-end values: Yeet at me costs the expected pushback plus the threat increase; Ragebait at me
costs `TAUNT_WORTH`; Hold Pawn on my pawn costs `turnValue(before) − turnValue(with the hold)`, which is
`holdPawn`'s own formula without `share`; Tax Fraud at me costs `CARD_WORTH`. Four cards, not a second
value table for 29.

**2d. Dice choice that knows the hand.** The die is chosen one phase *before* an Action card can be
played, and today `chooseDie` prices every die with empty modifiers. A bot holding FR FR should know
that a D20 plus FR FR means "name any number from 1 to 20", and one holding Speedrun should know a D10
doubles into a D20's range. Each die is priced as `max(turn without a roll card, turn with the best held
roll card − the card's holding value)`. Roll cards only; pawn and square cards do not change the die.

**Files.** `values-shared.js` (2a), `values-squares.js` (2b), `values-window.js` after its split (2c),
`dice-choice.js` (2d). Each has its own test file already; each gains two or three literal cases.

**Journal decisions.** Leader weighting and the rejected flat share. Why Nühü gets four values and not
twenty-nine.

### Phase 3. Tuning by measurement, not by argument (S, recurring)

**Goal.** Replace the guessed constants with measured ones: `PLAY_AT`, `LOCKOUT_SHARE`, `BLOCK_WORTH`,
`STUN_WORTH`, `LOCK_COST`, `riskWeight`, `opportunityWeight`.

**Method, one rule.** Change **one** knob, run the arena with the changed profile in two seats against
the current profile in the other two, both seatings, a few hundred matches. Keep the change only when
it wins by more than the noise band the arena prints (it prints the 95 % confidence interval alongside
the win rate, so nobody has to compute it). Record every run in `notes/09` next to its command, the
losers included: a negative finding is worth a line in the report and it stops the next person trying
the same knob.

**Why one knob at a time.** Two knobs changed together and a better result tells you nothing about
which one helped, and the knobs interact (a higher `riskWeight` makes Built Different look cheaper).

**Done when** the profile's numbers are the ones the arena chose, `notes/09` shows the runs, and the
"a guess" labels in the source comments say "measured, see notes/09" instead.

## 4. Order and dependencies

```
Phase 0  arena + profiles          (nothing depends on the bot changing)
   |
Phase 1  danger + opportunity       (needs the arena to be judged)
   |
Phase 2  a, b, c, d in any order    (2b and 2c use Phase 1's hit table)
   |
Phase 3  tuning                     (needs everything above in place)
```

Phase 0 first is the one non-negotiable ordering. Phase 1 without it would be one more guess with a
longer argument, which is exactly what the project's own documentation rules warn against.

## 5. Risks

| Risk | Why it is real | What to do |
| --- | --- | --- |
| Seeded end-to-end tests go stale | `bots.spec.js` plays seed 1 with three bots and asserts, among other things, that cards get played within a few turns. A smarter bot spends the RNG differently and may hold that card | Run `npm run test:e2e` after every phase; repin seeds with `npm run test:seeds` where the script covers it, and reread the bot cases by hand where it does not (the script never plays cards) |
| A too-cautious bot | Pessimistic threat plus a high `riskWeight` could make the bot hide in the yard and lose on tempo | Phase 3 tunes `riskWeight` against the arena; the random baseline and the terms-off profile are the floor and the reference |
| Slower turns | `expectedMoveScore` calls `bestMove` up to 60 times a turn per card priced; a threat computation inside `scoreMove` multiplies that | It is arithmetic over at most 16 pawns and 40 squares and runs behind a pause anyway. Measure with the arena's average time per match; only optimise (a per-turn threat cache) if the four-bot match test slows noticeably |
| The 300-line limit | `values-pawns.js` (290) and `values-window.js` (257) cannot take more | Split first, in their own commit, along the seam the file headers already name (offensive versus defensive cards) |
| Double counting | Card values that already use `threatOn` (Built Different, Lock In, Head Out) plus a `scoreMove` that now prices danger too | They price different things: a card buys protection for a pawn that stays; a move changes where it stands. Write the test that shows the bot still plays Built Different on a threatened leading pawn rather than walking it |

## 6. Open questions for the Product Owner

1. **Difficulty levels.** Phase 0's profile makes an easy, normal and hard bot a one-object change each.
   Should the line-up screen offer it? If yes, that is a design brief (a new control on an existing
   screen), not part of this plan.
2. **Double Dip's net-zero rule** (recorded in `notes/01` since issue #82) still makes the card worth 1
   to the bot. Fixing the rule is a `core/` change and would let the bot price it as a real second card.
3. **Should a bot ever play Oil Spill or The Purge?** Both are `null` today by decision. The arena can
   answer whether unplayable cards clog bot hands; if they do, the cheapest fix is a rules question
   (may a full hand discard?) rather than a value function.

## 7. Proposed issues, in English, ready for the board

| # | Title | Labels | Size |
| --- | --- | --- | --- |
| 1 | `bots: add a seeded bot arena script and per-seat bot profiles` | `4-implementation`, `tooling`, `should have` | S to M |
| 2 | `bots: price danger and capture opportunity in the move choice` | `4-implementation`, `game-logic`, `should have` | M |
| 3 | `bots: weight card damage by the opponent's lead, aim traps by landing odds, price Nühü by real harm, choose dice knowing the hand` | `4-implementation`, `game-logic`, `should have` | M |
| 4 | `bots: tune the value constants against the arena and record every run` | `4-implementation`, `game-logic`, `could have` | S, recurring |

Issue 2 depends on 1; issue 3 depends on 2; issue 4 depends on all three. All four trace to FR-43.
