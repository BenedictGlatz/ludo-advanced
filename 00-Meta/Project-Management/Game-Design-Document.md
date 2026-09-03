# Game Design Document

The rulebook of Ludo Advanced. This document states every rule the game needs to be playable to the
level of its edge cases, so that implementation reads rules instead of inventing them.

It is the layer below [Requirements-Specification.md](Requirements-Specification.md): the
specification says a rule must exist and how it is checked, this document says what the rule *is*.
Where a requirement is referenced, its ID is given, and no requirement is restated.

**Scope boundary.** This is the rulebook and nothing else. Colour palettes, spacing scales,
typography and component looks are Claude Design's territory and belong to issue #3, per
[CLAUDE.md](../../CLAUDE.md) *Design and UI*. No visual specification appears here. Where a rule has
a visual consequence, the rule is stated and the presentation is left open on purpose.

**Status of the eight rules in section 6.** They are written as decided so that implementation is not
blocked, and every one of them carries its rejected alternative. They are Product Owner decisions and
the sign-off table in section 9 is empty until Fabian Gemming confirms or overrides them. A rule
overridden later changes this document and the requirement it traces to, not the code first.

---

## 1 The game in one paragraph

Ludo Advanced is a 2D web Ludo variant for 2 to 4 players, played hot-seat on one device (FR-01,
FR-03). Classic Ludo remains underneath: four pawns per player, leave the start area on the die's
highest number, move along a shared track, capture an opponent by landing exactly on its square.
Two changes carry the whole design. The single die is replaced by a **Dice Card Pool**: each turn a
player draws 3 dice cards from D2 to D20, picks one, rolls it, and returns all 3 to the pool. And a
**Skill Card Pool** adds *Action* cards, played on one's own turn, and *Reaction* cards, played in
response to another player. The decision each turn is therefore *which die to roll* and *which skill
to play*, not only *which pawn to move*.

---

## 2 Board topology

The numbers below are derived rather than asserted, because FR-13 (exact count to enter home) and a
D20 in the pool interact with the track length directly: a long journey plus a large die makes
overshooting the home square a routine event rather than an edge case.

> **Rewritten on 2026-08-30.** This section said 52 track squares at an offset of 13, a 5-square home
> column and a 58-step journey until the first design handoff was implemented. It now says 40, 10, 4
> and 44. Section 2.4 records why, and keeps the earlier reasoning visible instead of deleting it.
> The code in `src/core/board.js` and this section were changed together.

### 2.1 The shared track

- The shared track has **40 squares**, indexed `0` to `39`, and closes on itself: square `39` is
  followed by square `0` (FR-08).
- **40 = 4 × 10.** The four players sit at a fixed offset of 10 squares from one another, which is
  what makes the board symmetric: every player walks the same distance and meets the others at the
  same relative positions.
- **40 is the track length of the printed *Mensch ärgere Dich nicht* board**, which is the game this
  project is named after and the board the design is drawn from. 52 is the British Ludo figure.

### 2.2 Per-player regions

Each player `p` (numbered `0` to `3`) owns two regions outside the shared track (FR-02):

| Region | Size | Rule |
| --- | --- | --- |
| Start area | 4 slots | Holds the player's pawns before they enter the track and after they are captured. Not part of the track, so it has no square index. Called the *yard* on the board. |
| House | 4 squares | Enterable only by its owner. No other player's pawn can ever stand on it, and no two of the owner's pawns can share one of its squares. |

**There is no separate home area.** The house has exactly as many squares as the player has pawns, so
a pawn that has arrived stands on an ordinary house square and the house being full *is* the win.
This is how the printed board works, and it means FR-12 (landing on your own pawn is illegal) does
the work: a player cannot stack pawns at the end, so all four house squares have to be filled.

Two fixed squares per player, both on the shared track:

- **Entry square** `E(p) = 10 × p`: the square a pawn is placed on when it leaves the start area.
  So `E(0) = 0`, `E(1) = 10`, `E(2) = 20`, `E(3) = 30`.
- **Turn-off square** `T(p) = (E(p) + 39) mod 40`: the last shared square a pawn of player `p`
  stands on before its house. It is the square immediately *behind* its own entry square, so a pawn
  walks a full lap of the track before turning off. So `T(0) = 39`, `T(1) = 9`, `T(2) = 19`,
  `T(3) = 29`.

### 2.3 The journey, as one number

A pawn's progress is counted in a per-player relative position `r`, which is what movement and the
exact-count rule are computed on:

| `r` | Where the pawn is |
| --- | --- |
| `0` | Start area |
| `1` | Entry square `E(p)` |
| `1` … `40` | On the shared track; absolute index is `(E(p) + r - 1) mod 40` |
| `41` … `44` | House, squares 1 to 4 |

**A pawn therefore travels 44 steps from its start area to the back of the house**: 40 shared squares
and 4 house squares. A player wins when all four of their pawns stand in the house, which because of
the paragraph in section 2.2 means exactly `r = 41, 42, 43, 44`, one pawn each (FR-05).

**The consequence worth stating.** The mean roll of a D20 is 10.5, so a pawn that only ever moved on
D20 rolls would cross the 40 track squares in roughly four moves. It would then take **another 19
turns on average** to cover the last four, because a roll that overshoots `r = 44` is illegal and the
pawn does not move at all. The exact figures are in section 5.2.1. Track length, pool composition and
the home-entry rule are one design and not three independent choices, and that 4-against-19 split is
the clearest single piece of evidence for it.

### 2.4 Why the track went from 52 squares to 40

**This section is kept because the earlier decision was written down with a reason, and replacing it
without saying why would make the current numbers look like they were never considered.**

Until 2026-08-30 this document said 52 squares at an offset of 13, and it explicitly rejected 40:

> **Rejected: a shorter track**, for example 40 squares, to make matches finish faster now that the
> pool contains dice up to D20. It was rejected because it breaks the 4 × 13 symmetry, and because
> match length is better tuned through the pool composition (section 5), which is data and can be
> changed without touching the board.

**The first half of that reason was simply wrong.** 40 = 4 × 10 is exactly as symmetric as
52 = 4 × 13. There is no symmetry to break. The second half still stands and is not contradicted:
match length is indeed better tuned through the pool, which is why section 5 now has to be re-derived
rather than carried over.

**What actually forced the change** was the board design, not the arithmetic. An arm of the printed
board shows **five fields in its outer row**, and the design handoff of 2026-08-29
([01-spec-foundations-and-board.md](../../01-Design/Handoff/01-spec-foundations-and-board.md), D3a)
established that this is a topology property and not a sizing one: an arm's outer row does not stop
at the centre, it *turns* there, and the corner field of the centre belongs to both that row and the
next arm's inner row. That shared corner field is the hinge that closes the ring. Counting it gives
`4 × (4 + 1 + 4 + 1) = 40` fields per lap and five fields per outer row. A 52-field board on the same
cross shows seven, which is not the board this game is named after.

**The cost, stated rather than absorbed.** The journey is 44 steps instead of 58, roughly a quarter
shorter, and a D20's mean roll of 10.5 is now a quarter of a lap rather than a fifth. The trade-off
in section 5.2 between exit probability and speed had been derived against 58 steps and went out of
date the moment this change landed.

**Settled 2026-08-30 with issue #30.** Section 5.2 is re-derived against 44 and is now produced by
`npm run docs:dice-balance` rather than worked out by hand. The re-derivation changed one conclusion
and left the composition alone: the cheapest die for crossing the track moved from the D10 down to
the **D8**, and the cheapest die for a whole journey is the D6 at either track length. Since D6 and
D8 are already the two most common cards in the pool, the composition in section 5.1 needed no
change. What the re-derivation did surface was something the old arithmetic never mentioned at all,
namely how much the exact-count rule of section 6.2 costs a large die. See section 5.2.1.

**Rejected: keeping 52 and living with seven fields per outer row.** It costs no rulebook change and
no re-derivation of section 5, and it was the answer this document already held. It was rejected
because the board stops looking like the reference the whole design is oriented on, and the design is
the part a player sees first. **Also rejected: 44 squares on a 13 × 13 grid**, which is closer to 52
and therefore the smaller change. It cannot show five fields per outer row without deleting the
centre corner fields, and deleting those breaks the ring into four unconnected arms.

### 2.5 Skill squares

**Added 2026-08-31.** Eight of the forty shared track squares hand out an extra skill card. Section 6.5
covers the card economy; this section covers the board.

- **Where they start.** Absolute squares 4, 7, 14, 17, 24, 27, 34 and 37. Built as `entry + 4` and
  `entry + 7` per player quarter, so **every player meets a skill square at the same points of their own
  lap**: relative positions 5, 8, 15, 18, 25, 28, 35 and 38. Turn order already gives seat 0 the first
  move and FR-04 does not compensate for that; a board that also gave one seat an earlier first card
  would stack a second advantage on top with nothing to balance it.
- **Landing, not crossing.** Only the square a pawn finishes its move on counts. If crossing counted, a
  D20 would collect several squares in one move and a D2 almost none, so "take the biggest card" would
  be the only sensible answer to the choice FR-19 is built around. It also matches capture, which
  already looks only at the target square.
- **Using one moves it.** The square disappears and reappears on a random other track square. Excluded:
  the four entry squares, the seven squares the other skill squares occupy, and the square just used.
  That leaves 28 candidates.
- **Why the entry squares are excluded.** Not fairness in the abstract. An entry square is the busiest
  square a player owns, since every one of their pawns starts on it and every one passes over it, so a
  skill square there would pay out far more often than one anywhere else and always to the same player.
- **Why the square does not reappear where it was.** It would read as nothing having happened, and a
  player could not tell that from a bug.
- **Houses and start areas need no rule.** Neither is a track square, so an absolute square index never
  refers to one. This is also why a captured pawn cannot trigger a skill square: it goes back to its
  start area.

**Rejected: static skill squares**, which is what this document assumed before the squares had a
section. Eight fixed squares get farmed: players learn the positions and steer for them all match.
**Rejected: a fixed rotation instead of a random square**, which would be reproducible without needing
the injected randomness, and would make the next position predictable after one match, which is the
farming problem again in slower form.

**Open: the offsets 4 and 7 are not derived.** What can be said for them is that 4 is far enough from
the entry square that a pawn cannot reach a skill square straight out of the start area even with a D2,
and that 4 and 7 are far enough apart that one move rarely covers both. Both are asserted by tests. The
rest is a playtesting question.

---

## 3 Turn sequence

The turn is a state machine, so that the reaction window (section 6.6) has a defined place to
interrupt. This is the sequence the turn manager in `state/` implements and the sequence diagram in
[System-Architecture.md](System-Architecture.md) mirrors.

1. **Turn start.** The active player is fixed by the rotation set at match start (FR-04).
2. **Draw.** 3 dice cards are drawn from the Dice Card Pool and shown to the active player (FR-18).
3. **Choose.** The active player picks exactly one of the 3. The other two are not rolled (FR-19).
   An `action-extra-card` Action card may be played here and only here, before the choice is made.
4. **Roll.** The chosen Dn yields a uniformly distributed integer in `1…n` (FR-20). The RNG is
   injected, so a test can supply a fixed sequence (NFR-09).
5. **Compute legal moves.** The legal-move set is derived from the roll under the rules of section 4.
   If it is empty, jump to step 8 and show the reason (FR-14, FR-32).
6. **Act.** The active player either selects a legal move, or plays an Action card and then selects a
   legal move. Playing a card opens a reaction window (step 7) before the card resolves.
7. **Resolve.** The move is applied. A capture opens a reaction window before it takes effect. When
   the window closes, the action resolves with every accepted reaction applied.
8. **End of turn.** The 3 drawn dice cards are returned to the pool and reshuffled (FR-21). The active
   player draws Skill Cards up to the hand limit (section 6.5). Then the active player advances.

There is no extra turn for any roll. Classic Ludo grants another turn on a 6; here the equivalent
would be "another turn on the die's maximum", which would compound with a D2 (maximum on half of all
rolls) into a player rolling repeatedly. **Rejected for that reason**, and the effect is available as
a skill card instead (`action-reroll`), where it costs a card.

---

## 4 Movement

### 4.1 Leaving the start area

- A pawn leaves the start area only when the roll equals the **maximum** of the die chosen that turn
  (FR-09). With a D6 that is a 6; with a D20 only a 20.
- The pawn is placed on its entry square `E(p)`, that is `r = 1`, and the roll is spent. It does not
  additionally advance.
- If the entry square is already occupied by one of the player's **own** pawns, leaving is illegal:
  section 6.1 applies to entering the track as well as to moving along it.
- If the entry square is occupied by an **opponent's** pawn, the pawn leaving the start area captures
  it (section 4.3). Entry squares are not safe squares (FR-15).
- Rolling the maximum with no pawn left in the start area is not wasted: the roll is used as an
  ordinary move.

### 4.2 Advancing

- A pawn on the track advances exactly the number of squares rolled: `r` becomes `r + roll` (FR-10).
- A pawn passes over occupied squares freely. Only the square it **lands on** matters. There is no
  blocking in the MVP, which follows from section 6.1 rather than being a separate rule.
- A move whose target `r` exceeds `44` is illegal (section 6.2).
- A move whose target square holds one of the player's own pawns is illegal (section 6.1). This
  includes house squares; two of a player's own pawns cannot share a house square.

### 4.3 Capture

- Landing exactly on a shared-track square occupied by an opponent's pawn captures it. The captured
  pawn returns to its owner's start area, `r = 0`, and must leave again under FR-09 (FR-11).
- The capturing pawn holds the square.
- A capture opens a reaction window (section 6.6) before it takes effect.
- **Capture inside a house is impossible**, because a house is enterable only by its
  owner (section 2.2) and an owner cannot land on its own pawn (section 6.1). The rule needs no
  exception; it follows from the topology.
- The MVP has no safe squares (FR-15, `could have`): every shared-track square is capturable.

---

## 5 The Dice Card Pool

### 5.1 Composition

FR-17 requires the composition to be a single data definition the rules read, so that changing the
balance of the game does not change the code. The proposed composition, 20 cards over 7
denominations:

| Card | Copies | P(maximum) = 1/n | Mean roll = (n+1)/2 |
| --- | --- | --- | --- |
| D2 | 2 | 1/2 = 0.500 | 1.5 |
| D4 | 3 | 1/4 = 0.250 | 2.5 |
| D6 | 4 | 1/6 ≈ 0.167 | 3.5 |
| D8 | 4 | 1/8 = 0.125 | 4.5 |
| D10 | 3 | 1/10 = 0.100 | 5.5 |
| D12 | 2 | 1/12 ≈ 0.083 | 6.5 |
| D20 | 2 | 1/20 = 0.050 | 10.5 |
| **Total** | **20** | | |

Two choices are made here and both are reversible in data:

- **Seven denominations, not all nineteen integers from 2 to 20.** The seven are the standard
  polyhedral set a player recognises. Nineteen denominations would make neighbouring cards (a D11
  against a D12) a distinction without a decision, which costs the turn its interest rather than
  adding to it. **Rejected on that ground**, and reversible: the pool is data.
- **Weighted toward the middle.** D6 and D8 are the most common cards, D2, D12 and D20 the rarest.
  The reason is section 5.2: the extremes are the interesting cards, and a hand that offers an
  extreme *sometimes* is a decision, while a hand that offers one *every turn* is a routine.
  **Confirmed by arithmetic on 2026-08-30**, which was not the reason it was chosen: the D6 is the
  cheapest single die for a pawn's whole journey and the D8 is the cheapest for the travelling part,
  so the two cards with four copies each are also the two the maths picks. See section 5.2.1.

### 5.2 The trade-off the pool creates

This is the central arithmetic of the design, and the whole reason the Dice Card Pool exists.

> **Re-derived on 2026-08-30 against the 44-step journey, issue #30.** This section previously
> carried judgements worked out by hand against 58 steps and a note saying they were out of date. The
> numbers below are now produced by `npm run docs:dice-balance`, which solves the recurrence exactly
> and then plays 1200 real matches through the shipped rules to check it. **Do not edit the tables by
> hand: re-run the command.** The reason this is a script rather than a paragraph is the same lesson
> the seeds taught, recorded in `00-Meta/Documentation/project-journal.md`: a conclusion written down
> without the calculation that produced it expires silently.

For a die with `n` faces:

- The probability of rolling the maximum, and therefore of getting a pawn out of the start area, is
  **P(max) = 1/n**.
- The expected advance of a pawn already on the track is **E(roll) = (n + 1) / 2**.

Legend: `n` is the number of faces of the chosen die, from 2 to 20. Both formulas assume a uniform
die, which FR-20 requires.

The two move in opposite directions as `n` grows. **A small die is the card that gets pawns onto the
board; a large die is the card that moves them.** A D2 leaves the start area on half of all rolls and
advances 1.5 squares on average; a D20 leaves on one roll in twenty and advances 10.5. The decision
each turn is therefore a real one, and it is different depending on the state of the board: a player
with three pawns still in the start area wants small dice, a player with three pawns on the track
wants large ones.

#### 5.2.1 What one die costs a lone pawn, exactly

Two formulas are not enough on their own, because they say nothing about the end of the journey.
FR-13 makes a roll that would overshoot `r = 44` illegal, so a pawn near the house does not move at
all on a roll that is too big. The table below is the exact expected number of turns, solved as a
recurrence rather than sampled, so there is no sampling error in it.

| Die | Turns to leave the yard | Turns to travel | Whole journey | Travel if home took any count | Turns lost to FR-13 |
| --- | --- | --- | --- | --- | --- |
| D2 | 2.0 | 29.6 | **31.6** | 28.7 | 0.9 |
| D4 | 4.0 | 20.0 | **24.0** | 17.2 | 2.8 |
| D6 | 6.0 | 17.0 | **23.0** | 12.3 | 4.8 |
| D8 | 8.0 | 16.3 | **24.3** | 9.6 | 6.7 |
| D10 | 10.0 | 16.5 | **26.5** | 7.8 | 8.7 |
| D12 | 12.0 | 17.3 | **29.3** | 6.6 | 10.7 |
| D20 | 20.0 | 22.8 | **42.8** | 4.1 | 18.7 |

Legend: leaving the yard is a geometric wait on `P = 1/n`, so it costs `n` turns and lands the pawn
on `r = 1`. Travel is from `r = 1` to `r = 44` with FR-13 applied. The last column is the difference
between the two travel figures, which is the price of the exact-count rule.

**Three things follow, and none of them was visible in the old derivation.**

1. **The exact-count rule is the real tax on large dice, and it is enormous.** A D20 spends 18.7 of
   its 22.8 travel turns unable to move, which is 82 % of its journey. The formula `E(roll) =
   (n+1)/2` says a D20 should cross the track in four moves, and it does; then it sits at the mouth
   of the house waiting for a number it rolls one time in twenty. **The pool and the home-entry rule
   are one design, and section 2.3 already said so. This is the measurement behind that sentence.**

2. **Shortening the track moved the sweet spot down one denomination.** On the old 58-step journey
   the cheapest die for travel alone was the D10 at 19.1 turns. On 44 steps it is the **D8 at 16.3**.
   For the whole journey, including leaving the yard, the cheapest single die is the **D6** at both
   lengths, because the `n` turns spent waiting to leave dominate everything else.

3. **The composition in section 5.1 is validated rather than assumed.** D6 and D8 are the two most
   common cards in the pool, four copies each, and they are exactly the best whole-journey die and
   the best travel die. That weighting was chosen for a design reason before this was computed, and
   it turns out to be the arithmetic answer as well.

#### 5.2.2 Why a mixed hand beats any single die

The table is for a pawn that only ever uses one denomination, which no player is forced into. Read
down the last column and the strategy the pool is built to reward falls out:

- **Leaving the yard:** small. A D2 costs 2 turns, a D20 costs 20.
- **Crossing the track:** large. A D20 covers 10.5 squares a turn against a D2's 1.5.
- **The last four squares:** small again, because FR-13 punishes anything big.

**A pawn's life has three phases and they want three different cards.** That is the decision FR-18
and FR-19 put in front of the player three times a turn, and it is why the pool is worth having at
all rather than being a single die with extra steps.

#### 5.2.3 Measured: what real matches actually cost

Played through the shipped rules, 400 seeds per player count:

| Players | Finished | Shortest | Median | Mean | Longest | Turns with no legal move |
| --- | --- | --- | --- | --- | --- | --- |
| 2 | 400/400 | 80 | 127 | 128 | 209 | 32.9 % |
| 3 | 400/400 | 103 | 186 | 188 | 344 | 33.3 % |
| 4 | 400/400 | 157 | 252 | 256 | 401 | 34.8 % |

**These are worst cases, not expected play.** The simulation uses the no-skill policy the tests
click: take the first drawn card without looking at the other two, move the lowest-numbered movable
pawn. A player who chooses does better on both counts.

Two findings worth carrying:

- **A two-player match takes about 127 turns, so each player takes about 64 turns to bring four pawns
  home, or 16 turns per pawn.** The single-die table says 23 turns for the best case, a D6. Four
  pawns are cheaper per pawn than one, because a turn where the leading pawn is stuck waiting for an
  exact count is not wasted: another pawn moves instead. **The exact-count tax is mostly paid by
  players who bring their pawns out one at a time.**
- **Negative finding: one turn in three has no legal move at all.** Roughly 33 % across all three
  player counts. Part of that is the no-skill policy, which cannot pick the small die it needs to
  leave the yard, and part of it is structural, because FR-09 requires the maximum. It is the number
  to re-measure once the dice hand of issue #31 lets a player choose, and if it stays near a third
  with real choices then FR-09 or the composition needs revisiting rather than the interface.

### 5.3 What a hand of three offers

The three cards are drawn from 20 without replacement, so the hand is a hypergeometric draw. Two
figures worth stating, both computed from the composition in section 5.1:

**Probability that a hand contains at least one D2 or D4**, that is at least one card whose exit
chance is 1/4 or better. There are 5 such cards and 15 others:

```
P(none of the 5) = C(15,3) / C(20,3) = 455 / 1140 = 91/228 ≈ 0.399
P(at least one)  = 1 - 91/228 = 137/228 ≈ 0.601
```

**Probability that a hand contains at least one D12 or D20**, that is at least one card advancing
6.5 squares or more on average. There are 4 such cards and 16 others:

```
P(none of the 4) = C(16,3) / C(20,3) = 560 / 1140 = 28/57 ≈ 0.491
P(at least one)  = 1 - 28/57 = 29/57 ≈ 0.509
```

So roughly three hands in five offer a good exit card and roughly one hand in two offers a fast
mover. Neither is guaranteed, which is what makes the choice a choice, and neither is rare, which is
what stops a player being stuck. These two figures are the numbers to re-check first if playtesting
finds the game too slow or too fast, and they move by editing the copy counts in section 5.1 only.

**This section survived the track shortening untouched, and it is worth saying why.** A hypergeometric
draw depends on the composition of the pool and on nothing else. Track length, house length and the
exact-count rule do not appear in it. So when the journey went from 58 steps to 44 in 2026-08-30,
section 5.2 had to be re-derived and section 5.3 did not. That is a small piece of evidence that the
two sections are cut along the right seam: one is about the pool, the other is about the board.

`C(20,3) = 1140`, `C(16,3) = 560` and `C(15,3) = 455` are binomial coefficients of the pool size and
the non-favourable subsets. All three follow from the 20-card composition; change the pool and all
figures in this section change with it.

### 5.4 Pool accounting

- All 3 drawn cards return to the pool and are reshuffled at the end of the turn (FR-21). The pool is
  therefore stationary: its composition at the start of every turn is exactly the table in
  section 5.1, and a card drawn this turn can be drawn again next turn.
- Pool size before and after a turn is identical. There is no dice card discard pile.

---

## 6 The eight decided rules

Each rule below is a **†** requirement from
[Requirements-Specification.md](Requirements-Specification.md) section 5: a rule that exists in no
earlier document and had to be decided before implementation could start. Each is stated as a rule,
with its reason and the alternatives that lost. The sign-off table in section 9 lists them again for
confirmation.

### 6.1 FR-12: landing on your own pawn is illegal

**Rule.** A move whose target square holds one of the mover's own pawns is not in the legal-move set.
The move is not offered, and an attempt is refused with the reason shown (FR-32).

**Why.** It keeps the legal-move calculation local: a move is legal or not by looking at the target
square alone, which is what makes the rule cheaply unit-testable and cheaply explainable on screen.

**Rejected: stacking**, where two of a player's pawns share a square. It doubles the state a square
can hold and forces every rule that reads a square to handle a set instead of a pawn. **Rejected:
blocking**, where a pair of pawns blocks opponents from passing. It is the most interesting of the
three and the most expensive: it changes the legal-move calculation for *every* player, because
advancing then depends on the whole path rather than the target square. Named as the first candidate
if the MVP finishes early, since it needs no new UI.

**Consequence.** There is no blocking mechanic in the MVP, and two pawns of the same colour can never
occupy one square, on the track or in a house.

### 6.2 FR-13: entering home requires an exact count

**Rule.** A pawn enters a house square only on a roll that lands it exactly on that square, and the
last one is `r = 44`. A move that would take `r` past 44 is illegal and is not offered.

**Why.** With dice up to D20 this rule fires constantly rather than occasionally, so it is a core
mechanic here and not an edge case. It gives the last stretch of the board its own decision: a player
close to home wants small dice, which inverts the preference of section 5.2 and makes the pool choice
interesting again late in the match.

**Rejected: bouncing back** from the home square, where the surplus is walked backwards. It is common
in Ludo variants and it is the softer rule. It loses here because with a D20 a pawn would bounce a
long way back regularly, which reads as an accident rather than a decision, and because it adds a
second direction of travel to a movement rule that is otherwise strictly forward.

**Consequence.** A pawn can be blocked from finishing for several turns. That is intended, and
section 6.3 covers the case where it blocks the whole turn.

### 6.3 FR-14: a roll with no legal move passes the turn

**Rule.** If the legal-move set is empty, the turn ends immediately. The game states why on screen,
naming the reason (no maximum rolled and no pawn on the track, every target square blocked by an own
pawn, or every move overshooting home), and the active player advances. The end-of-turn steps still
run: the dice cards return to the pool and the player draws skill cards up to the hand limit.

**Why.** Nothing in the sources covered this, and it is not rare: with a D20 in hand and pawns close
to home it happens regularly. Stating the reason on screen is required by NFR-08, and this is the one
place where a player would otherwise have no way to tell a refused move from a broken game.

**Rejected: re-drawing** a new hand of dice cards until a legal move exists. It removes the
consequence of a bad choice, which is where the decision in section 5.2 gets its weight, and it can
loop when the position is blocked for every die in the pool.

### 6.4 FR-17: the pool composition

**Rule.** Section 5.1, as a single data definition.

**Why and rejected alternatives.** Section 5.1.

### 6.5 FR-22 and FR-27: the skill card economy

This was the largest hole in the specification: the rulebook never said how a player gets a skill
card, so the Skill Card Pool had no defined behaviour at all.

> **Revised 2026-08-31 by the Product Owner, and this section is the revision.** The pool, the hand
> limit and the acquisition rule below all changed. What did not change is the discard-and-reshuffle
> rule and the accounting invariant. The original wording is preserved under "What this section used
> to say" at the end of the section, because the reasons it gave are still the reasons the new rule has
> to answer.

**Rule.**

- **Pool.** 2 copies of each of the 29 cards in section 7, so **58 cards**.
- **Hand limit.** **5 cards.** A player at the limit draws nothing and the card stays in the pool.
- **Acquisition.** A player draws one card **at the start of their own turn**, and one more **whenever
  one of their pawns lands exactly on a skill square** (section 2.5). Both draws are skipped if the
  hand is at the limit.
- **After playing.** A played card goes to a face-up discard pile. When the pool is empty and a draw
  is due, the discard pile is shuffled and becomes the new pool.
- **Accounting.** Every card is in exactly one of pool, hand or discard at all times, which is the
  invariant FR-27 asks for and the one a unit test asserts.

**Why the start of the turn and not the end.** A card drawn at the start is a card the player can
actually use this turn, so the draw is a decision and not bookkeeping. Drawing at the end means every
card sits unused for a full lap of the table before its owner can do anything with it, which makes the
whole mechanic feel like it is happening to somebody else.

**Why a second draw on the skill squares.** It puts card income partly under the player's control. With
one draw per turn and nothing else, a player's card count is a function of how long the match has run
and nothing they did; the skill squares make "steer for that square" a real move, and they are the
reason the choice of dice card matters in the second half of a match, once every pawn is out.

**Why 5 and not 3.** With a draw at the start of every turn plus the skill squares, a limit of 3 means a
player is at the limit almost always and the extra draws do nothing at all. **This number is an
assumption and has not been playtested.** It is one constant in `core/skill-pool.js` and it is expected
to move after the first play session.

**Rejected: keeping the old end-of-turn draw plus a draw on capture.** The reasoning behind it is still
sound and is quoted below. It lost to the Product Owner's decision, and the compensation half was lost
with it, so **a captured player no longer gets a card**. That is a real loss: the argument that a
captured pawn loses up to 43 steps and deserves something back has not been answered, only overruled.
It should be revisited after the first playtest, and if it comes back it should come back as its own
rule rather than as a modifier on this one.

**Rejected: removing played cards from the game** rather than discarding and reshuffling. Discarding is
simpler to account for, and removal means the pool empties during a long match, at which point the
mechanic quietly stops existing. **Rejected: buying cards with a resource**, which is the energy system
of FR-37: it is prioritised `W` because no rule for it exists, and inventing one here would decide an
open question by accident.

**What this section used to say**, kept because its reasons still have to be answered:

> **Pool.** 2 copies of each of the 8 MVP cards, so 16 cards. **Hand limit.** 3 cards. **Acquisition.**
> At the end of their own turn a player draws one card if their hand is below the limit. In addition, a
> player whose pawn is captured draws one card immediately.
>
> **Why one card per turn.** It ties card income to turns taken rather than to luck, so the economy
> cannot run away, and it makes the hand limit bite: a player at 3 cards has to spend before earning.
> **Why the capture compensation.** A captured pawn loses up to 43 steps of progress, which is the
> harshest event in the game; the compensating card keeps a player who is behind in the match without
> adding a comeback mechanic that fires on its own.
>
> **Rejected: drawing at the start of the turn**, which would let a player draw and immediately play
> the card they drew, making the hand limit decorative.

### 6.6 FR-25: the reaction window

> **Superseded 2026-08-31 by the Product Owner and not yet rewritten.** The decided rule is **one
> shared 30-second window** for all eligible players at once, and a budget of **one card per player per
> turn** rather than per window. Point 5 below, that a Reaction opens no window of its own, is also
> reversed: a Reaction can be answered, and the per-turn budget is what makes that terminate. The
> section is rewritten when the window is implemented, which is the commit after the card catalogue.
> Left standing until then rather than deleted, because the reasoning it gives against a timed window
> is the argument the new rule has to beat, and it should be answered in writing rather than dropped.

**Rule.** A reaction window opens at exactly two points, both named in section 3: when a capture is
about to take effect, and when an Action card is played.

1. The triggering action pauses before it resolves.
2. Every player other than the acting one who holds a Reaction card that is playable against this
   trigger is prompted, in turn order starting from the player after the acting player.
3. Each prompted player plays one Reaction card or declines. **At most one card per player per
   window.**
4. When every prompted player has answered, the trigger resolves with the accepted reactions applied,
   in the order they were played.
5. **A Reaction played inside a window does not open a window of its own.** Windows do not nest.

**Why.** Reactions are the only mechanic that interrupts the turn sequence, so this is a requirement
on the turn manager rather than on the cards, and it has to be settled before the turn manager is
built. Rules 3 and 5 exist to bound the interruption: without them, two players holding
`reaction-cancel-card` could answer each other indefinitely.

**Rejected: a timed window** in which reactions are played simultaneously. It fits an online game and
not a hot-seat one, where all players share one screen and one input device (FR-03), so a
simultaneous window has nowhere to happen. **Rejected: reactions playable at any moment**, without a
defined window, which makes the turn sequence non-deterministic and untestable.

### 6.7 FR-37: no energy or resource system in the MVP

**Rule.** There is no energy, mana or currency in the MVP. Skill cards are acquired as in section 6.5
and cost nothing to play.

**Why.** The mechanic appears in the Sprint 2 prose plan and in the title of issue #35 *Game HUD &
Resource Display*, and nowhere else: no rule for it has ever been written. It is prioritised `W`,
*won't have this time*, in the specification on the grounds that an unspecified mechanic cannot be
built, and this document does not invent one, because inventing it would settle a Product Owner
question silently.

**Rejected: omitting the subject**, which would be tidier and would leave two artefacts pointing at
something the rulebook does not contain. **Consequence:** if the Product Owner wants the system, the
blocker is rules and not priority, and the HUD of issue #35 shows pawn progress only (FR-36).

### 6.8 NFR-12: players are distinguishable without colour

**Rule.** Every player carries a second, non-colour identifier in addition to their colour: the
requirement is that a greyscale screenshot still identifies whose pawns are whose.

**Why.** Colour is the primary way players are told apart in Ludo, so this is a question about this
game specifically rather than a generic accessibility checkbox. The rule is stated here because it
constrains the rules layer: a pawn needs a stable player identity that presentation can render, not
only a colour.

**What this document deliberately does not decide.** Whether the second identifier is a shape, a
pattern, a letter or a number is a design decision and belongs to Claude Design and issue #3, per
[CLAUDE.md](../../CLAUDE.md). Naming a solution here would be exactly the invented design rule that
file forbids.

---

## 7 Skill card catalogue

> **Replaced 2026-08-31.** This section used to hold an 8-card set invented while writing this
> document. The Product Owner chose the full 29-card set from the card artwork instead
> (`01-Design/Handoff/Card artwork design planning/Card Art.dc.html`, artboards `6a` and `4a`). The
> eight invented cards are gone: none of them existed as artwork, and keeping them would have meant
> eight cards nobody had drawn sitting next to 29 that had been. The old table is quoted at the end of
> this section, because the argument it made about set size is the argument the new set has to answer.

The `id` is the contract between the two layers: a card's rule is a pure function in `core/` and its
presentation lives in `ui/`, matched by id, neither importing the other (FR-26). The machine-readable
version of this table is `src/core/cards/`, which validates itself when it loads.

**29 cards, 22 Action and 7 Reaction, two copies of each, so a 58-card pool.**

### 7.1 The ten cards that need no new board concept

From artboard `6a`. Every one of them acts on the roll, on another card, or on a player's card budget,
all of which the turn already has. These are the ten that ship first.

| Card id | Title | Type | Sub-kind | Needs a target | Effect |
| --- | --- | --- | --- | --- | --- |
| `action-pot-of-greed` | Pot of Greed | Action | draw | no | Draw two Action cards. No cost and no condition. |
| `action-double-dip` | Double Dip | Action | economy | no | On your next turn you may play two Action cards instead of one. |
| `action-no-take-backsies` | No Take-Backsies | Action | lockout | no | Nobody may play Reaction cards for the rest of this turn. |
| `action-critical-success` | Critical Success | Action | buff | no | Roll with advantage: throw twice and keep the higher. Played before the roll. |
| `action-angel-die` | Angel Die | Action | buff | no | Add a D8 to your roll this turn. Stacks with everything. |
| `reaction-critical-failure` | Critical Failure | Reaction | debuff | no | Played as any player rolls: they throw twice and keep the lower. |
| `reaction-devil-die` | Devil Die | Reaction | debuff | no | Subtract a D8 from a roll as it happens. At zero or less the pawn does not move. |
| `reaction-nuehue` | Nühü | Reaction | negate | no | Cancel one card or effect as it is played. |
| `reaction-hold-pawn` | Hold Pawn | Reaction | control | enemy pawn | The named pawn drops out of this turn's move choice. |
| `reaction-the-purge` | The Purge | Reaction | chaos | no | For one round every landing captures: own pawns no longer block, they are captured. |

### 7.2 The nineteen cards that need new mechanics

From artboard `4a`. Between them these need five things the game does not have: traps on squares,
blockers that stop a pawn passing through, backward movement, statuses with a duration, and effects
over several squares at once.

| Card id | Title | Type | Category | Needs a target | Effect |
| --- | --- | --- | --- | --- | --- |
| `action-banana-peel` | Banana Peel | Action | blocking | track square | A trap. The next pawn to cross it is stunned and loses its next turn. |
| `action-hyperbeam` | Hyperbeam | Action | offensive | own pawn, direction | Roll a D4. Every pawn on the next 1 to D4 squares in that direction goes home, yours included. |
| `reaction-uno-reverse` | Uno Reverse | Reaction | troll | no | When an opponent lands on your pawn to capture it, their pawn goes home instead. |
| `action-rock` | Rock | Action | blocking | own pawn | One of your pawns becomes immovable stone for 2 rounds. Nothing lands on it or passes through it. |
| `action-big-ah-rock` | Big Ah Rock | Action | blocking | track square | A square becomes a boulder for 3 turns, and the enemy pawn directly behind you is knocked back 3. |
| `action-oil-spill` | Oil Spill | Action | blocking | track square | A trap. Whoever steps on it slides 3 to 5 squares forward, triggering no skill square on the way. |
| `reaction-ghost-mode` | Ghost Mode | Reaction | movement | no | Played when someone captures or blocks you: pass through every blocker and ignore capture this turn. |
| `action-head-out` | Aight Imma Head Out | Action | movement | own pawn, choice | Swap with a random pawn, or teleport to the nearest skill square. Your call. |
| `action-speedrun` | Speedrun Any% | Action | movement | no | Double your roll this turn. On an odd roll you must move backwards instead. |
| `action-janky-rpg` | Janky RPG | Action | offensive | track square | Roll a D6. On 2 to 6 the target square and both neighbours are cleared; on a 1 it hits your own pawn. |
| `action-yeet` | Yeet | Action | offensive | enemy pawn | Grab an opponent's pawn within 3 squares and throw it 4 squares backward. |
| `action-tax-fraud` | Tax Fraud | Action | troll | player | Steal one random skill card from another player's hand. |
| `action-lock-in` | Lock In | Action | troll | own pawn | Your pawn is immune to capture and to forced movement until your next turn. |
| `action-not-that-deep` | It's Not That Deep | Action | blocking | track square | A trap. The pawn that steps on it moves 1 square back. Offensive cards played within 3 squares of it are nullified. The artwork says "face-down"; see 7.3 |
| `action-let-him-cook` | Let Him Cook | Action | movement | own pawn | The pawn skips this turn. Next turn roll twice, take the higher, and double the move. Captured while cooking, both pawns go home. |
| `action-built-different` | Built Different | Action | movement | own pawn | Armour for 2 turns. Ordinary collisions cannot capture the pawn and attackers bounce 1 square back. |
| `action-fr-fr` | FR FR | Action | troll | number | Skip the roll and pick any number from 1 to 6. Move that far. |
| `action-sixty-seven` | 67 | Action | offensive | no | Played before rolling. Roll a 6 and you move 13 instead, and every pawn in the last 7 squares goes home. |
| `action-ragebait` | Ragebait | Action | troll | enemy pawn | Next turn the target must move toward you if a legal path exists. Fail and it wastes half its roll. |

### 7.3 Seven cards the artwork describes and the board model cannot express

Each of these was read as something as close to the printed text as the board allows. The reading is in
the effect column above; this table is why. The seventh row is different in kind from the other six: the
board model *could* express it, and the Product Owner chose not to.

| Card | What the artwork asks for | Why it cannot be built | What is built instead |
| --- | --- | --- | --- |
| Hyperbeam | "a straight cardinal lane" | A cardinal direction is a property of the 11 x 11 drawing grid, which lives in `ui/board-geometry.js`. `core/` may not import `ui/`, and a rule that needs the drawing grid is not a rule. | A pawn plus a direction along the track. Friendly fire and the D4 both survive. |
| The Purge | "even pawns already home", "enter an opponent's house" | Houses are private in the data model: `isSameSquare` requires the same player, so a foreign house has no address at all. | Every landing captures for one round, own pawns included. The house half is dropped. |
| Hold Pawn | "as its turn begins" | That is a point in time, not a response to an action, so it is not a Reaction. | Played into the window the roll opens. The named pawn drops out of that turn's move choice. |
| Oil Spill | "skipping every skill tile and safe zone" | There are no safe squares in the MVP (FR-15, `could have`). | Slides 3 to 5 forward and triggers no skill square on the way. |
| Janky RPG | "both neighbour tiles" | Unambiguous on the ring, undefined in a house, where only one of the two neighbours exists. | Playable on a track square only. Neighbours are `(square + 1) mod 40` and `(square - 1) mod 40`. |
| 67 | "roll a 6" | Impossible on a D2 or a D4. | The card is only playable when the chosen dice card has at least six faces. |
| It's Not That Deep | "a face-down trap" | Not a model limit: a per-seat render is possible. **Decided against by the Product Owner on 2026-09-02.** Four people share one screen, so hidden information is theatre, and a trap nobody can see cannot be avoided, which is the only way the aura in 7.2 is a choice rather than a fine. | Every trap and blocker is visible to every player, with the seat that laid it shown. |

**Two rules elsewhere in this document have to change because of these cards**, and both are recorded
in the project journal:

1. **Leaving the start area becomes `roll >= dieMax` instead of `roll === dieMax`** (section 4.1).
   Angel Die adds a D8 to the roll, so under the old wording a buff would make leaving the start area
   *impossible*. Without card modifiers a roll can never exceed `dieMax`, so every match played so far
   behaves identically.
2. **Backward movement stops at the first track square and never returns a pawn to its start area.**
   Yeet, It's Not That Deep and Big Ah Rock all push pawns backward. If that reached the start area they
   would be cheap substitutes for capture, and capture as a mechanic would be worth nothing.

### 7.4 What this section used to say

> Eight cards, four of each type: `action-extra-card`, `action-reroll`, `action-swap-pawns`,
> `action-step-one`, `reaction-shield`, `reaction-slow`, `reaction-cancel-card`, `reaction-mirror`.
>
> The count is deliberate: each card is a distinct rule that needs its own unit test and its own
> presentation, so the set is sized to what can be finished and tested rather than to what can be
> imagined.

**That argument was right and the new set does not answer it.** 29 cards is 29 rules, 29 unit tests and
29 presentations, against 8. The Product Owner chose the larger set knowing this, and the mitigation is
the split above: the ten cards of section 7.1 are a complete, playable game on their own, and section
7.2 is ordered so that the work can stop at a sensible point. Whether it has to stop is a schedule
decision and belongs in the sprint log, not here.

---

## 8 Win condition and edge cases

**Win condition.** A player whose four pawns fill the four house squares wins, and the match ends immediately
(FR-05). Remaining players are not ranked in the MVP: there is no second place. Reason: ranking needs
a rule for what happens after the win, and nothing in the sources asks for one.

The cases below are the ones that would otherwise be decided during implementation under time
pressure. Each is settled by a rule already stated above; this section exists so that no one has to
re-derive them.

| Case | Resolution | Follows from |
| --- | --- | --- |
| Roll would overshoot home | Move is illegal and is not offered | 6.2 |
| No legal move at all | Turn passes with the reason shown | 6.3 |
| Target square holds an own pawn | Move is illegal | 6.1 |
| Capture inside a house | Cannot occur: houses are owner-only | 2.2, 6.1 |
| Two own pawns on one square | Cannot occur | 6.1 |
| Entry square blocked by an own pawn when the maximum is rolled | Leaving the start area is illegal that turn | 4.1 |
| Entry square held by an opponent when the maximum is rolled | The entering pawn captures it | 4.1, 4.3 |
| Maximum rolled with no pawn in the start area | The roll is used as an ordinary move | 4.1 |
| Last pawn captured while others are home | The captured pawn restarts at `r = 0`; pawns already home never move again | 4.3, 2.2 |
| Two players hold a Reaction against the same trigger | Both are prompted in turn order; each may play at most one card | 6.6 |
| A Reaction is played against an Action card | Resolves inside the same window; opens no new window | 6.6 |
| The Skill Card Pool runs out | The discard pile is shuffled and becomes the new pool | 6.5 |
| A player is at the hand limit at the end of their turn | No card is drawn | 6.5 |

---

## 9 Product Owner sign-off

The rules of section 6 plus the two that section 7 forced, listed for confirmation. The sign-off column
is filled by the Product Owner, Fabian Gemming. An unsigned row is a rule implementation follows
provisionally; a row overridden here changes this document and its requirement.

**Three rows were overridden on 2026-08-31**, rows 5, 6 and 9, all in the same conversation and all in
the same direction: the Product Owner chose the printed card artwork over the rules this document had
invented for it. Rows 10 and 11 are new and unsigned; they are consequences of that choice rather than
decisions of their own, and section 7.3 explains both.

**Rows 12 to 14 were decided on 2026-09-02 for issue #45** and are entered here as decided rather than
proposed, because the Product Owner took them in the planning conversation itself. Row 12 is the one
that reverses a printed fact, the "face-down" on It's Not That Deep; rows 13 and 14 are rules the artwork
never spoke to.

| # | Requirement | Proposed rule | Sign-off | Date |
| --- | --- | --- | --- | --- |
| 1 | FR-12 | Landing on your own pawn is illegal; no stacking and no blocking | | |
| 2 | FR-13 | Entering home requires an exact count; overshoot is illegal | | |
| 3 | FR-14 | A roll with no legal move passes the turn, with the reason shown | | |
| 4 | FR-17 | 20 cards over 7 denominations, weighted toward D6 and D8 (section 5.1) | | |
| 5 | FR-22, FR-27 | **Overridden 2026-08-31 by the Product Owner.** Hand limit **5**; one card at the **start** of the own turn; one card on landing on a skill square; no card on being captured; discard and reshuffle | Overridden | 2026-08-31 |
| 6 | FR-25 | **Overridden 2026-08-31 by the Product Owner.** One shared **30-second** window; one card per player per **turn**; a Reaction may be answered | Overridden | 2026-08-31 |
| 9 | FR-28 | **Overridden 2026-08-31 by the Product Owner.** The MVP card set is all **29** cards of the artwork, not the 8 invented in section 7 | Overridden | 2026-08-31 |
| 10 | FR-09 | Leaving the start area becomes `roll >= dieMax`, because Angel Die can push a roll above the die's maximum | | |
| 11 | FR-11 | Backward movement from a card stops at the first track square and never returns a pawn to its start area | | |
| 7 | FR-37 | No energy or resource system in the MVP | | |
| 8 | NFR-12 | **Now a rule, 2026-09-02.** Each seat has a **shape** as well as a colour: circle, triangle, square, diamond. It sits on the pawn, on the scoreboard, in the top bar and on the win and handover screens. Confirm that this is the second identifier NFR-12 asks for | | |
| 12 | FR-30 | **Decided 2026-09-02.** Every trap and blocker is **public**: visible to every player with the seat that laid it shown. Overrides the artwork's "face-down" on It's Not That Deep; section 7.3 | Decided | 2026-09-02 |
| 13 | FR-30 | **Decided 2026-09-02.** A trap may not be laid on a square that already holds one, on a square a pawn is standing on, or on one of the four entry squares | Decided | 2026-09-02 |
| 14 | FR-30 | **Decided 2026-09-02.** A trap fires on **any** movement onto or across its square, including a pawn pushed there by a card, and a push it causes can set off another trap. A captured pawn going home fires nothing | Decided | 2026-09-02 |

**Row 8 changed twice, and the second change is the answer.** On 2026-08-30 it recorded a question:
Claude Design was asked for a non-colour player identifier, first delivered one as a per-seat pawn
silhouette, and then removed it on request in favour of colour alone. That left lightness alone to carry
the requirement, and the Playwright check measured it as soon as the board rendered: the worst pair of
seat colours, red against blue, reduces to greys 1.146 apart, and three of the four yards are effectively
the same grey.

**On 2026-09-02 the row became a rule.** Each seat now has a shape as well as a colour, filled in ink and
placed low on the pawn's disc so it reads as a badge on the creature's front rather than as a third eye:

| Seat | Colour | Shape |
| --- | --- | --- |
| 0 | red | circle |
| 1 | yellow | triangle |
| 2 | green | square |
| 3 | blue | diamond |

The same four shapes appear on the scoreboard, in the top bar and on the win and handover screens, so the
seat is named the same way everywhere. The palette was **not** changed: D2's other way out, nudging green
and blue apart, was considered and rejected, because the shape provides the margin and the four hues come
from the layout template and are cited across the documentation. The reasoning is in
`01-Design/Handoff/06-spec-pawn-mark.md`, D48 to D50.

**What the Product Owner is asked to confirm** is narrower than before: not whether the requirement can be
met by colour alone, but whether a shape per seat is the second identifier NFR-12 means. The greyscale
screenshot the criterion names is produced by `tests/e2e/greyscale.spec.js` on every run and is attached
to the report.

---

## 10 What is still open

- **Six of the eleven rows of section 9 are unsigned.** They are decided in this document so that work
  is not blocked, not decided by the person whose decision they are. Rows 5, 6 and 9 now carry a real
  answer, because they were overridden out loud.
- **The hand limit of 5 is an assumption, not a decision.** It replaced 3 for a stated reason, that a
  limit of 3 makes the extra draws do nothing, and neither number has been playtested. It is one
  constant in `core/skill-pool.js`.
- **A captured player no longer gets a compensating card**, and the argument for one was never
  answered. A captured pawn loses up to 43 steps, which is the harshest event in the game. Section 6.5
  records the loss; it should be revisited after the first playtest.
- **Section 6.6 is superseded and not yet rewritten.** The 30-second window is decided and not
  implemented, and the section still describes the untimed one.
- **The pool composition is untested by humans.** The figures in sections 5.2 and 5.3 are arithmetic
  and simulation, not playtest results. Whether a match *feels* like a satisfying length is a
  question only the buffer-sprint playtest answers, and the composition is data so that the answer
  can be acted on.
- ~~**Match length is unestimated.**~~ **Measured 2026-08-30, issue #30.** A two-player match takes a
  median of 127 turns, three players 186, four players 252, over 400 seeds each. The simulation is
  `npm run docs:dice-balance` and it was indeed the first use of the headless `core/` layer. **The
  figures are a worst case**, because the simulation plays with no skill: it takes the first drawn
  card without looking at the other two. What it needs next is a re-run once issue #31 lets a real
  player choose, and a human playtest to say whether 127 turns is enjoyable or merely finite.
- **Open, and new from that measurement: one turn in three has no legal move at all.** Roughly 33 %
  at every player count. Some of that is the no-skill policy, which cannot pick the small die it
  needs to leave the yard. If it stays near a third once players choose properly, then FR-09 or the
  composition needs revisiting, and the interface does not.
- **Balance of the skill card set is unassessed.** Eight cards with two copies each is a starting
  point chosen for testability, not a balanced set demonstrated to be one. `reaction-mirror` and
  `reaction-shield` both answer a capture and may turn out to be redundant.
- **No rule covers a player leaving mid-match.** Hot-seat play makes this a menu question rather than
  a rules question (FR-07 pause and abandon), so it is left to the screen flow.
- ~~**Nothing here is verified.** Every rule above is a rule the code does not yet implement, in a
  repository that still has no `src/`.~~ **Out of date since 2026-08-29.** Sections 2, 3, 4, 5, 6.1,
  6.2, 6.3, 6.4 and 8 are implemented and under test. Sections 6.5, 6.6 and 7, the skill cards, are
  not, and section 7's catalogue is additionally contradicted by the card artwork handoff, which
  holds 29 cards under different names. That contradiction is issue #38's to settle.
