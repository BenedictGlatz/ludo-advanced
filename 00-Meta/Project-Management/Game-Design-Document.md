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
D20 rolls would cover 44 steps in roughly four moves. The pool composition in section 5 is what
prevents a match from being decided in a handful of turns, and the exact-count rule of section 6.2 is
what stops the last stretch from being trivial. Track length, pool composition and the home-entry
rule are one design, not three independent choices.

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
shorter, so a D20 now covers close to half a lap in one roll. The trade-off in section 5.2 between
exit probability and speed was derived against 58 steps and **is now out of date**. Section 5 should
be re-derived against 44 rather than adjusted, and that belongs to issue #37 where the real pool is
built. Until then the dice pool in this document is known to be untuned, which is a smaller problem
than it sounds because the MVP runs on a single stand-in die.

**Rejected: keeping 52 and living with seven fields per outer row.** It costs no rulebook change and
no re-derivation of section 5, and it was the answer this document already held. It was rejected
because the board stops looking like the reference the whole design is oriented on, and the design is
the part a player sees first. **Also rejected: 44 squares on a 13 × 13 grid**, which is closer to 52
and therefore the smaller change. It cannot show five fields per outer row without deleting the
centre corner fields, and deleting those breaks the ring into four unconnected arms.

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

### 5.2 The trade-off the pool creates

This is the central arithmetic of the design, and the whole reason the Dice Card Pool exists.

> **Out of date as of 2026-08-30, and knowingly left standing.** The balance judgements in this
> section and in section 5.1 were derived against a 58-step journey. The journey is now 44 steps
> (section 2.4), so a D20 covers close to half a lap rather than roughly a third of one, and the
> trade-off below is sharper than the numbers suggest. The formulas themselves are unaffected; the
> conclusions drawn from them are. Section 5 should be **re-derived** against 44 rather than adjusted,
> and that work belongs to issue #37, where the real pool replaces the single stand-in die. Nothing
> in the MVP depends on it, because the MVP runs on one fixed die.

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

**Rule.**

- **Pool.** 2 copies of each of the 8 MVP cards in section 7, so 16 cards.
- **Hand limit.** 3 cards. A player at the limit draws nothing.
- **Acquisition.** At the end of their own turn a player draws one card if their hand is below the
  limit. In addition, a player whose pawn is captured draws one card immediately, again only if below
  the limit.
- **After playing.** A played card goes to a face-up discard pile. When the pool is empty and a draw
  is due, the discard pile is shuffled and becomes the new pool.
- **Accounting.** Every card is in exactly one of pool, hand or discard at all times, which is the
  invariant FR-27 asks for and the one a unit test asserts.

**Why one card per turn.** It ties card income to turns taken rather than to luck, so the economy
cannot run away, and it makes the hand limit bite: a player at 3 cards has to spend before earning.
**Why the capture compensation.** A captured pawn loses up to 43 steps of progress, which is the
harshest event in the game; the compensating card keeps a player who is behind in the match without
adding a comeback mechanic that fires on its own.

**Rejected: drawing at the start of the turn**, which would let a player draw and immediately play the
card they drew, making the hand limit decorative. **Rejected: removing played cards from the game**
rather than discarding and reshuffling. It is simpler to account for, and it means the pool empties
during a long match, at which point the mechanic quietly stops existing. **Rejected: buying cards
with a resource**, which is the energy system of FR-37: it is prioritised `W` because no rule for it
exists, and inventing one here would decide an open question by accident.

### 6.6 FR-25: the reaction window

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

The MVP set (FR-28). The `id` is the contract between the two layers: a card's rule is a pure
function in `core/` and its presentation lives in `ui/`, and the two are matched by id and never
import each other (FR-26).

| Card id | Type | Effect |
| --- | --- | --- |
| `action-extra-card` | Action | Draw a fourth dice card before choosing which die to roll; all four return to the pool at the end of the turn. |
| `action-reroll` | Action | Reroll the chosen die once. The second result replaces the first, whether it is better or not. |
| `action-swap-pawns` | Action | Swap the track positions of one of your pawns and one opponent pawn. Neither may be in a start area or a house. |
| `action-step-one` | Action | Move one of your pawns exactly one square, in addition to this turn's move. Subject to sections 6.1 and 6.2 like any other move. |
| `reaction-shield` | Reaction | Cancel a capture of one of your pawns. The capturing pawn returns to the square it started this move from. |
| `reaction-slow` | Reaction | Halve the acting player's roll, rounded down, before the move resolves. The legal-move set is recomputed on the reduced roll. |
| `reaction-cancel-card` | Reaction | Cancel an Action card as it is played. The cancelled card is spent and has no effect. |
| `reaction-mirror` | Reaction | The capture of your pawn resolves as normal, and the capturing pawn also returns to its owner's start area. |

Eight cards, four of each type, two copies of each in the pool (section 6.5). The count is deliberate:
each card is a distinct rule that needs its own unit test and its own presentation, so the set is
sized to what can be finished and tested rather than to what can be imagined. An expanded set is
FR-29, `could have`, and is explicitly a data-plus-one-function addition that does not touch the
resolution engine.

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

The eight rules of section 6, listed for confirmation. The sign-off column is filled by the Product
Owner, Fabian Gemming. An unsigned row is a rule implementation follows provisionally; a row
overridden here changes this document and its requirement.

| # | Requirement | Proposed rule | Sign-off | Date |
| --- | --- | --- | --- | --- |
| 1 | FR-12 | Landing on your own pawn is illegal; no stacking and no blocking | | |
| 2 | FR-13 | Entering home requires an exact count; overshoot is illegal | | |
| 3 | FR-14 | A roll with no legal move passes the turn, with the reason shown | | |
| 4 | FR-17 | 20 cards over 7 denominations, weighted toward D6 and D8 (section 5.1) | | |
| 5 | FR-22, FR-27 | Hand limit 3; one card at end of own turn; one card when a pawn is captured; discard and reshuffle | | |
| 6 | FR-25 | Explicit window at a capture and at an Action card; one reaction per player; no nesting | | |
| 7 | FR-37 | No energy or resource system in the MVP | | |
| 8 | NFR-12 | A non-colour identifier per player; which one is a Claude Design decision | | |

---

## 10 What is still open

- **All eight rules of section 6 are unsigned.** They are decided in this document so that work is
  not blocked, not decided by the person whose decision they are.
- **The pool composition is untested.** The figures in section 5.3 are arithmetic, not playtest
  results. Whether a match finishes in a satisfying number of turns is a question only the
  buffer-sprint playtest answers, and the composition is data so that the answer can be acted on.
- **Match length is unestimated.** No expected turn count is stated, because deriving one honestly
  needs a simulation that does not exist yet. It is the natural first use of the headless `core/`
  layer once it exists.
- **Balance of the skill card set is unassessed.** Eight cards with two copies each is a starting
  point chosen for testability, not a balanced set demonstrated to be one. `reaction-mirror` and
  `reaction-shield` both answer a capture and may turn out to be redundant.
- **No rule covers a player leaving mid-match.** Hot-seat play makes this a menu question rather than
  a rules question (FR-07 pause and abandon), so it is left to the screen flow.
- **Nothing here is verified.** Every rule above is a rule the code does not yet implement, in a
  repository that still has no `src/`.
