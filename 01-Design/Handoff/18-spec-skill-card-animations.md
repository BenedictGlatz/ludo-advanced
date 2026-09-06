# Handoff 18, spec: an animation of its own for every skill card

**From:** Claude Design
**To:** Claude Code
**Date:** 2026-09-06
**Answers:** [18-brief-skill-card-animations.md](18-brief-skill-card-animations.md), D104 to D115
**Read against:** the local stylesheet copies handoff 17 reported on, plus the DOM contract brief 18 § 3
proposes. Nothing here rewrites an existing file; the two amendments are one declaration each.

---

## 0 The one idea in all twelve answers

The brief's § 0 is right that this is not 29 animations. It is one thing that happens 29 ways, and the
answers below keep landing on the same rule:

**The card is the moment, the board is the consequence, the plate is the record.** A cast shows the
card once, large, where everyone is already looking; then it shows what the card did, where it did it;
then the card goes to the plate and the turn carries on. Nothing in the cast says a thing in a second
way: the strip still speaks, the plate still keeps, the marks D101 put on a pawn still stay. The cast is
the 1.5 seconds in between, and it is the only part of a card play that has ever been missing.

The corollary is that a cast is allowed to cover the board. D98 forbade a permanent tenant on the board
because the board is read while the player decides; a cast plays while nobody can decide anything, and
it is gone before anyone can.

---

## 1 Files delivered, and how to land them

| File | State | Lines |
| --- | --- | --- |
| `src/ui/styles/cast.css` | **New.** D104, D108, D110, D113: the stage, the four states, arrival, exit, the parts | 199 |
| `src/ui/styles/cast-base.css` | **New.** D105, D106: the six family gestures | 163 |
| `src/ui/styles/cast-parts.css` | **New.** D110: part timing per stage and the eleven shared movements | 245 |
| `src/ui/styles/cast-fx-roll.css` | **New.** D107: seven accents | 153 |
| `src/ui/styles/cast-fx-hand.css` | **New.** D107, D113: five accents, the Nühü among them | 142 |
| `src/ui/styles/cast-fx-trap.css` | **New.** D107: three accents | 95 |
| `src/ui/styles/cast-fx-status.css` | **New.** D107: seven accents | 184 |
| `src/ui/styles/cast-fx-shove.css` | **New.** D107: four accents | 164 |
| `src/ui/styles/cast-fx-area.css` | **New.** D107: three accents | 143 |
| `src/ui/styles/board-cast.css` | **New.** D109, D112: the marks on fields, pawns and the board | 205 |
| `src/ui/styles/tokens.css` | **Amended.** Four tokens added, two entries in the reduced-motion block | 272 to 297 |
| `src/ui/styles/app.css` | **Amended.** One declaration: `.app { position: relative }` | 128 to 131 |
| `01-Design/Handoff/18-spec-skill-card-animations.md` | New | n/a |

Ten new files for one feature is more than any handoff so far, and the count is the 300-line rule and
not taste: the accents are 29 blocks of 8 to 25 lines each, and the seam they split along is the family
of D105, so a reader who wants Hyperbeam opens `cast-fx-area.css` and finds three cards. The two
amendments are in `handoff-18/diffs/` as change lists, the form handoff 17 used and you landed.

**Load order.** `board-cast.css` after `pawn-status.css` and before `pawn-drag.css`; the cast files
last of all, after `last-card.css`, in this order:

```
… board-trap.css, pawn.css, pawn-status.css, board-cast.css, pawn-drag.css, …
… card-reveal.css, last-card.css, cast.css, cast-base.css, cast-parts.css,
cast-fx-roll.css, cast-fx-hand.css, cast-fx-trap.css, cast-fx-status.css,
cast-fx-shove.css, cast-fx-area.css
```

The six `cast-fx-*` files override `animation-name` on the same element `cast-base.css` sets it on, at
equal specificity, so they have to load after it. Among themselves they are independent.

**`tokens.css` is at 297 of 300 after this.** The next token anyone adds has to take one out.

---

## 2 The answers

### D104. The cast's place on screen

**The card stage plays over the board, centred on the board's centre, at the reference size, on a new
layer `--layer-cast: 5`. D98 does not apply to it, and here is the line between them: a permanent thing
may not cover the board because the board is read while the player decides; a cast plays while the turn
is held and nobody can decide anything, and it is gone before anybody can.**

What it covers, measured at 1440 by 900: a card at the reference size is 234 by 342 px against a
633.6 px board of 57.6 px cells, so it stands over columns 4 to 8 and rows 3 to 9: the centre 3 by 3,
the inner two fields of each home column, and the four inner track corners (indices 4, 14, 24, 34) with
one neighbour each: sixteen track fields in all, and 24 of the 40 are never under it, among them every
entry square and every turn-off. The pieces under it are the finished ones and whatever stands on those
sixteen fields, for 1.5 seconds, while nothing is clickable.

**Why not the rail.** The rail is 403 px wide with the dice plate and the skill plate in it, and the one
band with room, above the skill hand, is the message strip's (brief § 4.2). A cast there would either
cover the strip that is announcing the same card or be the size of a hand card, and a card at hand size
is the thing the player was already looking at. The board is also where 17 of the 29 casts have to end
up, and a card that shows itself in one place and lands its effect in another is two moments.

*Rejected: the rail, above the skill hand.* The strip is there, and the card would be small.

*Rejected: the seam between the board and the rail.* It is 24 px of gap; a card there covers half the
board's right arm and half the dice plate, which is the worst of both.

*Rejected: a smaller card, at `--card-u: 0.8`, to cover less board.* D66 made the reference size the one
readable card in the game. A third size would be the second, and it would cover 24 per cent of the
board's width instead of 37 for the same 1.5 seconds.

**The card leaves for the last-card plate.** That is the one geometric fact D100 made available: the
moment ends where the record begins, and the plate is taught by watching a card shrink into it. It
needs the plate's centre, which is `--cast-rest-x` and `--cast-rest-y` in § 5, one pair more than the
brief offered; if it is absent the card shrinks in place.

**The layer.** `--layer-cast: 5`, the refusal's value, and that is deliberate: the two never share a
pixel, the cast is over the board and the strip is in the rail, and the cast has to be under the
overlay at 6 because a paused game must cover a cast in flight. One token, no renumbering.

**`.app` becomes the containing block.** One declaration in `app.css`, `position: relative`, because
the geometry the view writes is in px relative to `.app` and `.cast` is its last child.

**The reveal and the cast share the screen trivially.** A card being revealed is at `--layer-card-
reading`, inside the rail's stacking order; the cast is at a page layer. During a cast the hand is
`pointer-events: none` anyway (the turn is held), so no reveal can start; a reveal that is up when the
cast starts simply stays up under it.

### D105. Which axis groups the 29 into families

**The six mechanic groups of `effects/index.js`, named for what the player looks at.** The values
`data-cast-family` takes:

| Value | Group in `effects/index.js` | Cards | Where the eye goes |
| --- | --- | --- | --- |
| `roll` | the roll chain | 7 | the dice plate |
| `hand` | the card economy | 5 | the hands |
| `status` | statuses on pawns | 7 | one pawn |
| `shove` | pawns moved without a move | 4 | a pawn travelling |
| `trap` | objects on squares | 3 | one field |
| `area` | more than one square at once | 3 | a region |

The reason is what the family is for. The base movement's job is to say, before the effect lands, what
kind of thing is about to happen and where to look for it. Type is already on the card as the band and
category as the pill, both visible the whole time the card is on the stage, so a family keyed on either
would be drawing a fact the card already carries. The one fact about a card that nothing draws yet is
its mechanic, and the mechanic is also what decides whether there is a board stage at all: § 4.3 of the
brief's last column follows this grouping almost exactly, which is the advantage the brief noted.

Assignment, for the catalogue: `roll` is Critical Success, Angel Die, Critical Failure, Devil Die, 67,
Speedrun Any%, FR FR. `hand` is Pot of Greed, Double Dip, No Take-Backsies, Nühü, Tax Fraud. `status` is
Hold Pawn, Rock, Big Ah Rock, Built Different, Lock In, Ragebait, Ghost Mode. `shove` is Yeet, Uno
Reverse, Aight Imma Head Out, Let Him Cook. `trap` is Banana Peel, Oil Spill, It's Not That Deep. `area`
is Hyperbeam, Janky RPG, The Purge. Two placements are judgement calls and are stated: Big Ah Rock is
`status` because the stone is the card and the knockback is its accent; Ghost Mode is `status` because
a dodge is a protection the pawn had, not a pawn being moved.

*Rejected: type plus category, with the ten as their own family.* It draws the band and the pill a
second time, and it puts Hyperbeam and 67 in one family because both are offensive, when one of them
lands on four fields and the other changes a number.

*Rejected: `kind`.* Nineteen values for 29 cards is a label, not a grouping.

### D106. The base movement, per family

**Every cast has the same three beats and every family does the middle one differently.** The card
leaves its hand slot at hand size and reaches the board's centre at the reference size in 240 ms, with
a 6 degree turn as it comes out of the fan; it stands there for the rest of the card stage while its
family's gesture plays; it leaves for the plate in 240 ms. The arrival and the exit are on the wrapper
`.cast__card`, the gesture on the `.card` inside it, so the two never fight over a property.

| Family | Gesture, 400 ms | What it says |
| --- | --- | --- |
| `roll` | The throw at half amplitude: `roll.css`'s rotate and translate, quieter | This card is about the die, and it is not the die |
| `hand` | A deal: tips 7 degrees and 4 per cent left, settles | This card moves cards |
| `status` | A stamp: 1.06, then 0.96, then 1 | Something is being pressed onto a piece and will stay |
| `shove` | A lunge: 3 per cent back, 7 per cent forward along `--cast-dir` | A piece is about to travel |
| `trap` | A drop: lifts 5 per cent, sets down with a 2 degree tilt | Something is being placed |
| `area` | A swell: 1.09 and back | What this does goes out over more than one field |

Forwards is `--cast-dir: 1` and reads as rightwards, which is the direction the HUD and the plate read
in. The two `roll` and `hand` families never reach the board, so their gesture is the whole cast and it
is the quietest of the six on purpose: the roll and the hand will say the rest.

### D107. The 29 accents

The accent is what one card does that its family does not. Three of the 29 replace the family gesture
(Nühü, Speedrun Any%, FR FR) and three more replace it on the board cards (Uno Reverse, Ghost Mode,
Ragebait); the rest add parts. "Part" numbers are `data-part`. The last column is what the board shows
through `data-cast-hit` (D109).

| Card | Family | The accent | Parts | Board marks |
| --- | --- | --- | --- | --- |
| Pot of Greed | hand | Two card silhouettes leave the stage for the hand slot, 90 ms apart | 0, 1 | none |
| Double Dip | hand | Two rings go out, 135 ms apart | 0, 1 | none |
| No Take-Backsies | hand | An ink bar shuts across the card's foot | 0 | none |
| Nühü | hand | Replaces the deal: a head shake, and a warn ring closes on the card | 0 | none |
| Tax Fraud | hand | A card silhouette lifts out and away, up and right toward the HUD | 0 | none |
| Critical Success | roll | A dot rises out of the card and fades | 0 | none |
| Angel Die | roll | A ring rises, slower | 0 | none |
| Critical Failure | roll | A dot sinks | 0 | none |
| Devil Die | roll | Two ink horns pop at the card's top corners | 0, 1 | none |
| 67 | roll | Two dots stamp above the card, 90 ms apart | 0, 1 | none |
| Speedrun Any% | roll | Replaces the throw: the lunge, twice, and three ink streaks trail off | 0, 1, 2 | none |
| FR FR | roll | Replaces the throw with the stamp, and one ring goes out | 0 | none |
| Banana Peel | trap | The part is thrown: it arcs 1.6 cells high and squashes on landing | 0 | `direct` |
| Oil Spill | trap | The part lands and spreads flat to 2.6 cells wide | 0 | `direct`, `path` 3 to 5 |
| It's Not That Deep | trap | The flight, then two rings go out from the field | 0, 1, 2 | `direct`, `aura` 6 |
| Rock | status | A squared stone falls from 2.2 cells above the pawn and squashes | 0 | `actor` |
| Big Ah Rock | status | The stone, and a shard knocked 2.2 cells backwards out of the landing | 0, 1 | `actor`, `victim` |
| Hold Pawn | status | The flight, then two ink bars stand up on the pawn | 0, 1, 2 | `victim` |
| Built Different | status | The flight, then a ring goes out from the pawn | 0, 1 | `shielded` |
| Lock In | status | The flight, then a ring closes on the pawn | 0, 1 | `shielded` |
| Ghost Mode | status | Replaces the stamp: the card fades to 0.35 and back; a ring puffs off the pawn, nothing crosses | 0 | `shielded` |
| Ragebait | status | Replaces the stamp: a fast 3 degree shake; the part bounces twice on the pawn | 0 | `victim` |
| Yeet | shove | The flight, with two smaller parts trailing it 63 and 126 ms behind | 0, 1, 2 | `victim`, `path` |
| Uno Reverse | shove | Replaces the lunge: the card turns 180 degrees; the part is a bar and spins as it crosses | 0 | `victim` (the attacker) |
| Aight Imma Head Out | shove | The flight, then one high hop off the pawn along `--cast-dir` | 0 | `actor`, `path` 4 |
| Let Him Cook | shove | The flight, then three small parts rise off the pawn like heat, 72 ms apart | 0, 1, 2, 3 | `actor`, `path` up to 12 |
| Hyperbeam | area | The flight, then three parts burst on along `--cast-dir`, fanning | 0, 1, 2, 3 | `victim`, `path` 1 to 4 |
| Janky RPG | area | The part wobbles in size on the way; two parts splash to either side on landing | 0, 1, 2 | `direct`, `splash` 2 |
| The Purge | area | No flight: four warn parts scatter from the card to the board's four corners | 0, 1, 2, 3 | the board frame |

Four parts is the most any card uses, and four cards use all four. The Purge is the only card whose part
0 does not fly to a target, because it has none.

### D108. The card stage's duration, and its tokens

**Three new duration tokens; everything else is derived from tokens that exist.**

| Token | Value | What it is |
| --- | --- | --- |
| `--motion-cast` | 640 ms | The card stage. 37.5 per cent, which is 240 ms, is the arrival; 62.5 per cent, 400 ms, the gesture |
| `--motion-cast-board` | 560 ms | The board stage. 43 per cent, 240 ms, is the flight; 57 per cent, 320 ms, the landing |
| `--motion-cast-hold` | 1500 ms | What the loop waits: 640 + 560 + 240 of exit + 60 of the card at rest |

The proportions are not new numbers. 240 ms is `--motion-move`, the budget for a piece crossing the
board, and it is used for the two crossings a cast has: the card to the stage, and the effect to the
target. 320 ms is `--motion-capture`, the budget for a piece leaving the board, and it is what the
landing takes. 400 ms for the gesture is the one taste number: it is `--motion-reveal` two and a half
times over, long enough for three oscillations of a shake or one swell and back, short enough that a
card is never seen waiting.

**Why not reuse `--motion-move` and `--motion-capture` directly.** Because the two stages are each a
single animation with percentage keyframes, and a single animation has one duration. Deriving 640 as
`calc(var(--motion-move) + 400ms)` would put the taste number inline where nobody can find it.

**A card with no board stage costs the hold minus the board stage: 940 ms**, which is the roll's own
moment within 40 ms. `timers.js` derives it, `calc(var(--motion-cast-hold) - var(--motion-cast-board))`
in whatever form it reads tokens; it is not a fourth token because it is not a fourth number.

**NFR-11.** The click that plays a card is answered by two things inside `--motion-feedback`: the slot
empties, and the card appears at that slot's position as the first frame of `cast-arrive`. It is the
same card, in the same place, one frame later and already moving. The 1.5 seconds after that are the
game's, not the click's.

**Time budget, stated as the brief asked.** One card per turn, two after a Double Dip, one per reaction
window; 1.5 s each with a board stage, 0.94 s without. How many that is per match is the measurement
the bot arena will produce; the number to compare it against is D70's 0.9 s per roll.

### D109. The board stage

**Something travels from the card to the target and lands; what it leaves behind is a mark on the
field or the pawn, and the mark is an attribute state, not a frame of the flight.**

The shape, for 16 of the 17: part 0 crosses from the board's centre to `--cast-to` in 240 ms on
`--ease-move`, and lands over 320 ms by swelling to 1.5 and going. As it lands, the target already
carries `data-cast-hit`, and the mark under it is what stays for the rest of the hold. The 17th is The
Purge, which has no target and scatters to the corners instead.

**Fields.** `.square__cast`, the second empty span on all 40 fields from build time, on
`.square__trap`'s precedent and for the same two reasons (D10, and both pseudo-elements taken). Four
kinds of hit, one span, and every one of them is on the span and not on `.square`, so none of them
joins the inset-ring collision D61 is still open on:

| `data-cast-hit` | The mark | For |
| --- | --- | --- |
| `direct` | A ring at `--border-thick` in the hue, over a 34 per cent fill of it | The field the card was aimed at |
| `splash` | The ring only, at hair weight | A neighbour the effect spills onto |
| `path` | A dot with an ink edge, the size of a trap chip, in the field's centre | A field the effect travels across. A run reads as a dotted line |
| `aura` | `board-trap.css`'s hatch in the hue, plus the hair ring | The reach of an It's Not That Deep, and the fields that cancelled a card (D113) |

A `path` field also carries `--cast-i`, its place along the run from 0, and its mark arrives
`--cast-i` feedback beats after the first, so a Let Him Cook run of twelve draws itself over 1.08 s from
the pawn outward. That is the second geometric fact this spec asks for beyond the brief's four (§ 5),
and it is derivable: it is the order of the path in the state.

**Pawns.** Three kinds of hit, and the mark is `outline` on the `.pawn` box, which nothing on the pawn
uses (the shell is `outline` on `::after`). No new child. The ring is the state and stays for the hold;
the movement is the hit and goes.

| `data-cast-hit` | The ring | The movement |
| --- | --- | --- |
| `victim` | `--border-ink` in `--color-warn`, the one colour that means "this is happening to you" | A shake: 9 degrees and 6 per cent, three swings |
| `actor` | `--border-ink` in the hue | A hop: 18 per cent up and back |
| `shielded` | Ink, closing from a wide `--border-ink` ring to the shell's own hair weight and offset | The ring arriving on the piece it will stay on, so the D101 shell is seen forming |

**The board.** `.board[data-cast="reaction-the-purge"]` turns the frame's outline `--color-warn` for the
board stage on the frame's own transition. The board is the thing that changed, so the board is what
says so.

**The hue.** The type's: `--card-action` green for an Action landing, `--card-reaction` orange for a
Reaction, keyed on the id prefix on `.board` and on `data-card-type` on `.cast`. The category is on the
card, which is on screen the whole time, and a category hue on the board would be the pill drawn a
second time at cell scale. `--color-warn` on a victim is the one exception and it is not a category.

**The twelve without a board stage end on the card stage, and the thing they changed says the rest.**
Seven change the roll, which has D70's throw and D73's breakdown. Two change a hand, which re-flows.
One shuts the window, and no prompt appears. One negates a card, and the plate reads negated. One takes
a card from a hand nobody on this screen can see. Drawing any of those on the board would be drawing
a thing that did not happen on the board.

### D110. What the effect layer is made of

**Four generic parts, empty spans, no card needs a fifth, and no card needs its own markup.**

A part is a disc, 0.42 of a cell, in the cast hue with an ink edge and the piece's shadow: a small
solid object, like every other object in this game. An accent may reshape it, and does, into exactly
four other things: a ring (no fill, hue edge at `--border-thick`), an ink bar, a squared stone, and a
card silhouette (the face, the ink edge, the card's corner, at a fifth of the size). Nothing is drawn
that is not one of those five, and none of them is an image asset or a `content:` string. Sparks are
discs; a spill is a disc scaled flat; a beam is three discs in a row.

Position is set on the element where a part does not move and in the keyframe where it does, and a
keyframe that ends at an offset reads `--bx` and `--by` from the element, so eleven keyframes in
`cast-parts.css` serve 29 cards and the family files add sixteen more.

Under `prefers-reduced-motion` both stage tokens are 1 ms and every part animation begins and ends at
`opacity: 0`, so the parts never draw. That is the whole reduced-motion treatment of this layer.

### D111. The hold: is a cast reading time or movement?

**Both, and the split is the roll's. `--motion-cast` and `--motion-cast-board` go inside the block;
`--motion-cast-hold` stays outside it.**

The brief's doubt is that a cast carries no number and no sentence, only the fact that a card was
played, and the plate carries that too. It does, five plates along, in 12 px type, after the fact. What
the hold carries at the moment is different: for the player who played the card, the confirmation that
the game took it; for the other three, the only 1.5 seconds in which the fact is anywhere they are
looking. That is reading time in D20's and D60's sense, and it is exactly the case D70 made for the
roll: a fact that is immediately overtaken has been mentioned, not shown. A player who asked for less
movement did not ask for less time to see what was played.

It also keeps the property brief § 3.4 leans on: the sequence is identical under reduced motion and
under `?fast=1`, and only the waiting differs. `?fast=1` sets the hold to zero; reduced motion leaves
it at 1.5 s and empties it of movement.

### D112. What survives under `prefers-reduced-motion`

**A still card over the board, and the marks under it.** In detail:

- The card is on the stage in frame one (`cast-arrive` is 1 ms) and stays for the hold.
- The family gesture and the parts are gone (both are on the stage tokens and the parts begin and end
  invisible).
- Every `data-cast-hit` mark appears at once and stays for the hold, because it is an attribute state
  on `--motion-feedback`, which the block does not touch. A `path` run still draws itself a beat at a
  time, because the sequence is the run's length and that is information.
- The pawn movements (shake, hop, the closing shell) are gone; the rings stay.
- The card leaves in 1 ms, because `--motion-move` is 1 ms in the block.

This is D12 applied literally: what moved stops, what says something stays. The alternative in the
brief, "the cast disappears and leaves only the strip and the plate", would make a reduced-motion
player the only one at the table who does not get to see a bot's card, which is the thing D115 exists
to prevent.

### D113. A cancelled card

**The cast plays for every card that was played, because cancellation is a fact about a card that was
played, and the two cancellations read differently because they happen at different times.**

**`nullified`, the aura.** The card stage plays as normal. The board stage does not land the card's
effect; it lights the aura's fields instead, `data-cast-hit="aura"` on each, while the card on the stage
takes `card-state.css`'s unplayable desaturation on `--motion-feedback` as it lands. The player sees
the card go to the board, the hatched region answer, and the card grey. The view writes the aura fields
as the hits, in place of the card's own; that is the one branch in `cast-view.js` this decision costs.

**`pending`, the window.** A card that opens a reaction window plays its card stage with the violet
ring the plate and a selected card wear, and skips the board stage: `data-cast` goes `card` to `done`.
The card goes to the plate as pending, which D100 already draws. If the window closes with no reaction,
the view fills `.cast` again with the same card and sets `data-cast="board"` directly: the effect lands
without the card showing itself twice. That is a fifth lifecycle path and it is in § 5.

**`negated`, the Nühü.** The negated card's cast has already played, as pending, and is on the plate.
The Nühü's own cast is what says no: a head shake and a warn ring closing on the card, no board stage,
and it leaves for the plate, which then reads negated. The brief's awkward case, two casts wanting the
screen inside one moment, does not arise: they are two moments with a window between them. What is
never drawn is a board stage for a card that did nothing on the board.

*Rejected: no cast for a cancelled card.* A cancelled card was still played, still left a hand, still
cost a turn's card. Not showing it makes the cancellation look like a bug in the hand.

*Rejected: a strike drawn across the negated card.* There is no negated card on the stage to strike;
it left 30 seconds ago.

### D114. A Reaction's cast

**The same stage, the same place, the same base, no difference of its own.** The band is orange and
striped and that is already the whole of what "this is a Reaction" looks like on a card. The prompt
strip is in the rail and the cast is over the board, so they never touch, and the clock keeps running
in plain view, which is right: a Reaction is played against a deadline and the deadline does not pause
for the animation.

One thing the geometry has to get right, and it is in § 5: a Reaction is played out of a hand that may
not be the one on screen. `--cast-from` is the slot if the actor's hand is showing and the actor's HUD
plate if it is not, so a card always comes from somewhere the player can point at.

### D115. The bot's cast

**Not different.** The hold is the announcement, and `timers.js` already treats it as one. A bot's card
arrives from its HUD plate rather than from a hand slot (the same rule as D114's), which is the one
visible difference and it is a fact about geometry, not about the actor. `data-actor` is written and
unread, on D51's precedent: a later decision may want it.

*Rejected: a face-down arrival that turns over.* It is the second place in the UI that would have to
know which seats are computers, after `data-controller` on the HUD, and D100 has just declined to make
the plate the second. A bot playing a card is not a different kind of event.

---

## 3 Tokens

| Token | Value | Block | Read by |
| --- | --- | --- | --- |
| `--motion-cast` | 640 ms | inside, 1 ms | `cast.css`, `cast-base.css`, `cast-parts.css`, the fx files |
| `--motion-cast-board` | 560 ms | inside, 1 ms | `cast.css`, `cast-parts.css`, `board-cast.css`, the fx files |
| `--motion-cast-hold` | 1500 ms | **outside** | `timers.js` only. No stylesheet reads it |
| `--layer-cast` | 5 | n/a | `cast.css` |

Existing tokens read: `--motion-move`, `--motion-capture`, `--motion-feedback`, the four easings,
`--card-action`, `--card-reaction`, `--card-face`, `--color-warn`, `--color-ink`, `--color-dormant`,
`--color-hint`, `--ink-dim`, `--cell`, `--pawn-size`, the three border weights, `--radius-sm`,
`--radius-pill`, `--shadow-piece`, `--layer-pawn-active`.

---

## 4 The states, against the DOM contract

Every state below is on the review canvas `Skill Card Cast.dc.html`, which plays a cast when a hand card
is clicked, with the 29 cards on a switch, the three outcomes, both skins, greyscale and a slow switch
that stretches the tokens threefold so a frame can be looked at.

| State | Drawn |
| --- | --- |
| `data-cast="idle"` | Hidden. The card and the four parts are in the DOM |
| `data-cast="card"`, each of the six families | Arrival from the slot, the family gesture, the card-stage parts of the twelve no-board cards |
| `data-cast="board"`, each of the 17 board cards | The flight or its replacement, the landing, and the marks below |
| `data-cast="done"` | The exit to the plate |
| `data-outcome="pending"` | The violet ring; no board stage |
| `data-outcome="nullified"` | The aura fields lit; the card greys |
| `data-board="false"` | The board stage skipped |
| `.square[data-cast-hit]` all four values, `--cast-i` 0 to 11 | On a target field, a run, and an aura, with a trap chip and a skill diamond under them |
| `.pawn[data-cast-hit]` all three values | On a plain pawn and on a `locked armoured` one |
| `.board[data-cast="reaction-the-purge"]` | The frame |

The mockup's geometry is measured from `getBoundingClientRect` exactly as § 5 asks the view to, so what
it shows at 1440 by 900 is what the game will show.

---

## 5 What Claude Code writes

The brief's § 3 contract stands, with six additions, all small. In the order they would be done:

**1. The stage, as proposed**, last child of `.app`, built once. Two more pairs of geometry on it, both
derivable, both from `getBoundingClientRect()`:

| Property | What it is |
| --- | --- |
| `--cast-stage-x`, `--cast-stage-y` | The centre of `.board`, in px relative to `.app`. Measured, not assumed, so it is right at every size and below the breakpoint |
| `--cast-rest-x`, `--cast-rest-y` | The centre of `.last-card`. If the plate is not built the pair is omitted and the card shrinks in place |

**`--cast-from`** for a card whose hand is not on screen (a bot, or a Reaction from a hot-seat player
whose hand is a stack of backs) is the centre of the actor's `.hud__seat`. That is D114's and D115's one
rule.

**2. `.square__cast`**, the second empty span on all 40 track fields and the 16 home-column fields,
after `.square__trap`. **`--cast-i`** inline on each `path` field, 0 first, in the order the effect
travels; on no other field.

**3. The pawn needs nothing new.** `data-cast-hit` with the three values, on at board start, off at
done.

**4. `.board` gets `data-cast="<cardId>"`** for the board stage, as proposed.

**5. The lifecycle**, with two branches beyond § 3.4:

- `data-outcome="pending"`: `idle` to `card` to `done` to `idle`. No board stage.
- The window closes unanswered: fill again with the same card, `idle` to `board` to `done` to `idle`.
  No card stage.
- `data-outcome="nullified"`: as § 3.4, but the board stage's hits are the aura's fields, each
  `data-cast-hit="aura"`, and not the card's own target.
- `done` lasts `--motion-move`, then `idle`.

**6. `timers.js`** waits `--motion-cast-hold` for a card with a board stage and
`--motion-cast-hold` minus `--motion-cast-board` for one without, reading `data-board` or the catalogue.
`?fast=1` sets both to zero.

**7. `data-cast-family`** takes the six values in D105, from a table in the catalogue.

**8. The catalogue's ids.** The stylesheets key on `data-card-id` in the form the plate already uses,
`action-banana-peel`, `reaction-nuehue`, with the 29 spellings in the D107 table's order as they appear
in `Skill Card Cast.dc.html`. If one differs, the selector is the one thing to change.

**Tests.** The end-to-end test the brief promises, that a cast starts, finishes and leaves no
`data-cast-hit` behind, is the right one. Nothing here should be pinned by value: a case asserting that
a Banana Peel's arc is 1.6 cells high would report the next adjustment as a defect. If a second case is
wanted, assert that under `prefers-reduced-motion` a `direct` field still carries its mark for the whole
hold, because that is D112 in one line.

---

## 6 Noticed and not done

**The card covers the inner two fields of each home column for 1.5 seconds**, and a piece on its last
step before home is under it. Nothing can be clicked while it is, so it costs nothing, but it is the
first thing a playtester will mention and it is D104's deliberate price.

**`--cast-dir` is one number and the track turns corners.** A lunge to the right for a pawn that is
about to travel down the right-hand arm is correct in the HUD's frame and wrong in the board's. The
alternative is a direction per arm, which is four values and a mapping the state does not have. Left
as is; if it grates in play, `--cast-dir` becomes an angle and the lunge reads it.

**A `path` of twelve takes 1.08 s to draw and the board stage is 0.56 s.** The last dots arrive after
the parts have gone and inside the exit. It reads as the run outlasting the throw, which is right for
Let Him Cook, and it is inside the hold, which is what matters.

**The Purge scatters to fixed offsets of four cells**, not to the board's corners, because the board's
size in cells is the one number the stage cannot read from `.cast`. At every board size the four parts
leave the card's corners diagonally and fade before the frame, which is the gesture; if a corner is
wanted, `--cast-span` could carry 5.5 for this card.

---

## 7 What is still open

Unchanged by this delivery: D17, D20 to D24, D61, D62 to D64, D81, D84 to D89, D99. Nothing is retired.

**Two follow-ups this handoff creates.** The hold's cost per match, once the arena measures card plays,
against D70's 0.9 s per roll (D108). And whether `--motion-cast-hold` at 1.5 s is right in play or a
touch long: the review canvas plays it, and the first playtest with bots will say.
