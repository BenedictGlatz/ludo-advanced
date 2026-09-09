# Handoff 07, spec: traps, blockers and pawn statuses on the board

**From:** Claude Design
**To:** Claude Code
**Date:** 2026-09-03
**Answers:** [07-brief-trap-marker.md](07-brief-trap-marker.md), D51 to D60. The fourth
unnumbered leftover of `00-open-requests.md` § 4 is closed inside D59, for a field rather than a pawn.

> **One edit was made to this document on landing**, and it is recorded here because a delivered document
> should not be changed quietly. The link above pointed at `../../uploads/07-brief-trap-marker.md`, which
> was the path inside the delivery package; the brief is a sibling of this file in the repository. Nothing
> else was touched. The same rule that produced this note is the one handoff 04 taught: an edit to a
> delivered file is better avoided than corrected.

---

## 1 Files delivered

| File | State | Lines |
| --- | --- | --- |
| `src/ui/styles/board.css` | **Amended.** The seat mapping, the turn-off bar, the skill diamond's step back, and the pickable field with its focus | 269 |
| `src/ui/styles/board-trap.css` | **New.** Split off `board.css` at the seam constraint 13 asked for | 129 |
| `src/ui/styles/pawn.css` | **Amended.** The two status treatments; four rules deleted and moved to `board.css` | 284 |
| `src/ui/styles/refusal.css` | **Amended.** Two rules, the trap announcement | 79 |
| `src/ui/styles/tokens.css` | **Amended.** One token added, `--motion-trap-hold`. Nothing removed, nothing renamed | 238 |
| `01-Design/Handoff/07-spec-trap-marker.md` | New, this file | n/a |

All five stylesheets are counted as delivered, written one declaration and one selector per line, so
`npm run format` has little left to expand. The largest is `pawn.css` at 284 and the constraint is 300.

**Read against `dev` at tree `991ee06c60fa`, read on 2026-09-02.** That is the same snapshot handoff 05
and 06 landed on, and `board.css` on it already carried the three-way split the brief describes at 197
lines with D7 and D27 in it.

**One file is delivered that the brief did not ask for.** `board-trap.css` is new, not a snapshot, and it
is the answer to constraint 13: the trap work is roughly seventy unformatted lines and `board.css` had
about a hundred of headroom, but the pickable field and the seat-shape move had to go into `board.css`
itself, and the two together would have taken it past the limit inside one issue. The seam is in § 2.

**One element is needed that § 3 of the brief does not promise**, named here rather than styled around,
the way spec 04 named three and spec 06 named one. It is `.pawn__status`, and D57 says what it is.

---

## 2 The file split, and why it lands where it does

`board.css` draws the board and the states the board itself has. `board-trap.css` draws what the card
game leaves standing on it. Everything a player can see with no card in play stays in the first file;
everything that exists because a card was played moves to the second.

That is why the pickable field of D59 stayed in `board.css` although it arrived with this issue: a field
being offered for a click is board grammar, it predates the trap cards, and five cards use it of which
one is not a trap card. And it is why the aura went into `board-trap.css` although it is a paint on
`.square`: the aura exists only while an It's Not That Deep is standing.

`board-trap.css` loads after `board.css` and before `pawn.css`. It depends on `tokens.css` and on the one
seat mapping in `board.css`, which is now the only place in the project that turns `data-player` into
`--player` and `--seat-shape`.

**D23 is not settled by this.** Handoff 02 asked who owns the `board*.css` split, and this delivery adds a
third file to it without answering the question. What it adds is a criterion that held up under a real
decision: the split is by what puts a thing on the board, not by what the thing is drawn with. If D23 is
ever answered properly, that sentence is the candidate rule.

**The follow-up § 6 of spec 06 named is taken, as the brief asked.** `--seat-shape` now sits in the one
`[data-player="N"]` block in `board.css` next to `--player`, and the four repeats in `hud.css`,
`chrome.css`, `overlay.css` and `pawn.css` are deleted. Only `pawn.css` is delivered here, because the
other three files are not otherwise touched by this issue: **delete the four `--seat-shape` rules in each
of `hud.css`, `chrome.css` and `overlay.css` when this lands**, or they will shadow nothing and mislead
the next reader. Every element that reads `--seat-shape` already inherits it from the ancestor it takes
`--player` from, which is the same ancestor in all five cases.

---

## 3 The decisions

### D51. What a trap looks like on a field

**A chip in the foot-left corner: 30 per cent of the cell, the owner's seat colour, a hair ink edge, the
owner's seat shape in ink inside it, and the piece shadow under it. The three trap kinds look identical.**

The construction is the pawn's, deliberately and not for economy. A trap is a thing standing on the board
that belongs to a player, which is what a pawn is, and the game already has one grammar for that: a seat
fill, a 3px ink edge, a hard offset shadow, a seat shape in ink on top. Re-using it means a player learns
nothing new, and it means the measurement spec 06 § 4 made carries over unchanged rather than needing a
new one. § 5 has the numbers.

The corner and not the middle, because the middle of a field is spoken for twice over: a pawn stands
there, and D27's skill diamond sits at `inset: 24%`. The foot-left corner is the one part of a 1-cell
field nothing had claimed. Foot rather than head, because a pawn's own shadow falls downward and to the
foot of the field, so a chip in the head-left corner would sit in the light and a pawn would appear to
stand on top of it.

**The three kinds looking identical is the answer, not an omission.** At 30 per cent of a cell, next to a
diamond, inside a ring, possibly under a pawn, a per-kind geometry is a distinction the player cannot read
in the moment they need it. What is worth reading at a glance is that something is there and whose it is,
because a trap does not fire under a pawn of the seat that placed it (§ 4.1 of the brief). Which kind it
is comes from three other places: the `aria-label`, which i18next writes; the card that was played, which
the player just watched; and, for the one kind whose reach matters before it fires, the aura of D58.

*Rejected: an inner geometry per kind, three shapes inside the chip.* The chip's interior is already
carrying the seat shape, which is the one thing on it NFR-12 depends on. A second geometry inside a 17 px
chip either replaces the seat shape or shares six pixels with it.

*Rejected: three chip colours, one per kind.* There is one hue left in the palette that no seat and no
signal owns, teal, and D27 has it. Three more would have to come from the seat set or from the signal set,
and either one makes a trap readable as a player or as a legal move.

*Rejected: the kind shown only on hover or focus.* The board is playable with a mouse and a keyboard, and
a fact that appears on hover is a fact the touch player and the reader of the board across the table never
get. The `aria-label` already carries it for the one player who is on that field.

### D52. How a blocker reads differently from a trap

**Same object, two variables changed: it covers the field instead of a corner of it, 76 per cent instead
of 30, and its corners are square instead of round. `data-trap="blocker"` is confirmed.**

A trap is a small thing lying on a path. A blocker is the path being gone. The size difference is the
whole message, it needs no legend, and it is legible at the smallest board size and in greyscale, which a
difference of inner geometry would not be. The square corner is the second variable because a rounded
76 per cent chip reads as a large trap; a squared one reads as a wall filling the field.

It stops short of the field's edge at 12 per cent rather than covering it. Squares 9, 19, 29 and 39 are
legal trap targets and they carry the turn-off bar on `::after`, so a blocker on one of them must not
bury the mark that tells a seat where to leave the ring. `board.css` gives that bar `z-index: 2` for this;
the chip is at 1.

**`data-trap="blocker"` rather than the `data-blocked="true"` that `01-spec` § 5 predicted.** Which object
is standing on a field and whether one is standing there are one fact, and one attribute is what keeps
"one object per field, never two" true in the DOM rather than merely true in the rules layer. A separate
boolean allows a state that cannot exist, and the CSS would then have to decide what a field carrying both
looks like.

*Rejected: a different construction entirely, a hatched or striped field for the blocker.* The hatch is
taken by the aura, and a blocker that is a field treatment rather than an object contradicts the rule that
a pawn may already be standing on the field and may walk off it. An object on a field can be stood on. A
field that has become a wall cannot.

*Rejected: the same 30 per cent chip with a heavier edge.* Border weight is the least legible variable on
a 17 px object, it is invisible at the board's floor size, and the two things being told apart here differ
by whether a move is refused outright.

### D53. Whether and how the owning seat is shown, and what it costs

**Shown, by the same pair the rest of the game uses: the seat colour as the chip's fill and the seat's
shape in ink inside it. The rules layer keeps writing `data-player` on the span and both custom
properties come off it with no new mapping.**

The Product Owner requires the owner visible and § 4.1 is why it is worth the pixels: a trap belonging to
the player about to walk over it will not fire, so "whose is it" is the difference between a threat and a
decoration. NFR-12 forbids colour alone, and the four `--seat-shape-*` tokens exist for exactly this.

**What it costs, stated plainly.** The shape inside the chip is small. At the design resolution the cell
is 58 px, the chip is 17 px and the shape inside it is 10 px, which is nameable. At the 24rem floor of
`--board-size` the cell is 35 px, the chip is 10 px and the shape is 6 px, which is a shape you can see
but not name. So at the floor the owner is read by colour, and at any normal board size it is read by
both. On the blocker the same shape is 11 px at the design resolution and 6 px at the floor, because the
chip is larger and the inset deeper.

**That is acceptable and it does not weaken NFR-12**, because NFR-12 is measured on the pawn and answered
there: `greyscale.spec.js` asserts a non-zero box and a per-seat `clip-path` on `.pawn__mark`, sixteen
pieces at 38 per cent of a piece. The chip's shape is a confirmation of a seat, on an object of which
there are at most six, and it is never the only place that seat appears on the board.

*Rejected: colour only, with NFR-12 met by the pawn.* It would be defensible under the letter of the
requirement and it would produce the one board object in the game that a colour-blind player cannot
attribute. Six pixels of shape is worth more than the argument.

*Rejected: the owner not shown at all, and `data-player` ignored.* This is the cheapest answer and it
throws away the fact that makes traps interesting to look at. It would also leave the rules layer writing
an attribute nothing reads, which is the state this whole brief exists to end.

*Rejected: a larger chip so that the shape is nameable at the floor size.* Anything past about 34 per cent
of the cell meets the skill diamond at its stepped-back `inset: 30%`, and D54 would have to give something
up to buy legibility in the one configuration that is already the smallest the game ever draws.

### D54. How three marks on one field coexist

**Nothing gives way. The three marks are on three different parts of the field and D27's existing step
back absorbs the one place two of them meet. The fourth state of D59 uses the same step back.**

The ring of D7 is a `box-shadow` on `.square` itself, inset plus a spread outside it, so it is the field's
own edge and cannot collide with anything drawn inside the field. The diamond is centred. The chip is in
the foot-left corner. The only near-miss is the diamond's lower left edge against the chip's upper right
corner, and D27 already had a value for a crowded field: at `inset: 30%` the two pass within a hair
instead of overlapping.

So one declaration answers three conditions, and `board.css` now reads:

```css
.square[data-skill-square="true"][data-legal-target="true"]::before,
.square[data-skill-square="true"][data-pickable="true"]::before,
.square[data-skill-square="true"][data-trap]::before {
  inset: 30%;
}
```

The busiest field the game can draw is a skill square, holding a trap, being offered by a trap card, with
a pawn standing on it. That is four marks and a piece, and it is in the mockup at field 5. It is busy.
It is legible because the four are at four scales and in four positions: an edge, a centre, a corner, and
an object standing over all of them.

*Rejected: the trap chip moving to a different corner when a diamond is present.* A mark whose position
depends on what else is on the field is a mark the player has to find. The chip is always in the same
corner of every field, which is what lets six of them be scanned at once.

*Rejected: the diamond hiding while a trap stands.* A skill square that stops looking like one because
something is lying on it is a rule the player has to learn, and the two facts are independent: the trap
fires on crossing, the skill square counts on landing, and a pawn can do both in one move.

### D55. What a trap firing looks like, and what the announcement is

**On the field: one transition, run in both directions. In the strip: the D9 component in a second voice,
keyed off the `data-message-kind` seam, in the panel colour with an ink dot.**

The chip fades and scales between 0.4 and 1 over `--motion-capture`, with `--ease-capture`. An object
appearing and an object being used up are the same movement in the two directions, so there is one rule
and no state to add. `--motion-capture` and not `--motion-feedback` because it is the timing the game
already uses for a piece leaving the board, and a spent trap is a piece leaving the board. It collapses
to 1 ms under `prefers-reduced-motion` through the token, so nothing here needs a media query.

The chip is at `opacity: 0` and `scale: 0.4` by default and the presence of `[data-trap]` on the parent is
what raises it. That is what makes constraint 11 cheap: the 40 empty spans cost one invisible box each and
no paint, and the view never touches the span, which is constraint 4.

**The Banana Peel case, which is the one that matters.** The pawn arrives exactly where the player aimed
it, and the only consequence is a turn lost. Three things happen at once and none of them is a movement:
the chip on the field goes out, the pawn tips over and dims toward dormant (D56), and the strip says what
happened. The pawn is the load-bearing one. A mark that appears on the piece the player was just moving is
the only one of the three they are certainly looking at.

**In the strip.** `showMessage` already writes `data-message-kind` and no stylesheet has ever read it.
Two rules now do:

```css
.move-refusal[data-message-kind="trap"] { background: var(--color-panel); }
.move-refusal[data-message-kind="trap"]::before { background: var(--color-ink); }
```

Orange with an orange dot is a refusal: you cannot do that. The panel colour with an ink dot is the game
reporting something that happened. Same box, same ink border, same hard shadow, same position under the
board, so it is recognisably the same object saying a different kind of thing. No new token, no new
component, and § 4.4's deviation closes with two declarations.

*Rejected: a second component of its own for announcements.* A third box hanging off the board is a third
place to look, it needs its own position, its own timing and its own reduced-motion behaviour, and D40
already established that this strip is where the game speaks. The defect D40 fixed was the colour, not the
component.

*Rejected: a new hue for news, a third signal colour.* The palette has two signal hues by design, and both
are outside the seat set for a reason that would have to be re-argued for a third. The panel colour is the
absence of a signal, which is the correct thing to say about news.

*Rejected: the chip staying on the field, greyed, after it fires.* It is honest about what happened and it
leaves a mark on a field where nothing is standing, which is precisely the misreading traps already suffer
from. The rules layer removes the object; the board should agree.

### D56. How a stunned pawn reads

**The piece tips nine degrees and its fill mixes toward `--color-dormant`. Answered with D57 as one pawn
status decision, and the two get different treatments on purpose.**

A stun stops the pawn, so the treatment changes the piece. A slip changes what a field hands the pawn, so
the treatment is a tag stuck on the piece. Two facts of two different sizes, two treatments of two
different weights.

The tilt is what makes it unmistakable rather than merely dull. A stunned pawn is the only piece on the
board that is not upright: it reads at a glance across sixteen pieces, it reads in greyscale, and it says
"out" in a way a colour shift cannot. It is a static transform, folded into the existing
`rotate(var(--pawn-tilt, 0deg))` on `.pawn`, so it costs no new element, it composes with the movement
transform, and `prefers-reduced-motion` has nothing to stop.

The fill mixes 58 per cent seat colour into `--color-dormant`, the value the game already uses for a thing
that is present and not available. The seat colour stays under the mix and the ink mark is untouched, so
the piece is still identifiable while it is out, which matters because the player has to count their own
pieces while one of them is missing a turn.

**The existing absence is not enough, which the brief asks about directly.** A stunned pawn is also not
`data-movable`, and that is true of eleven other pieces on a four-seat board on any given turn. An absence
shared by eleven pieces cannot mark one.

*Rejected: a status tag for the stun as well, the same shoulder tag D57 uses with different geometry.* It
is consistent and it is too quiet. The one status in this issue that takes a turn away from the player
would be a 6 px tag in the corner of a piece, the same size as the one that costs them a card.

*Rejected: dimming the piece with `opacity`, the captured pawn's treatment.* `opacity` on `.pawn`
composites the whole group and drops the seat mark's contrast to about 2.16:1, which spec 06 accepted for
a 320 ms transient and should not accept for a state that stands for a full round.

### D57. How the Oil Spill `SLIPPERY` status reads

**A tag on the piece's upper right shoulder: a dormant disc with a hair ink edge and an ink skid inside
it, 38 per cent of the piece, on a new empty span `.pawn__status`.**

It lasts one turn and its only consequence has already happened by the time the player reads it: the field
the pawn stopped on handed out no card. So the mark is a note about the piece rather than a change to it,
and the piece stays upright and stays its own colour.

The shoulder, because the pawn's face is taken by the eyes at 19 to 41 per cent of the disc and the foot
by the seat mark at 48 to 86 per cent. The upper right corner is outside the disc, at `top: -8%; right:
-8%`, which is the one place a tag can sit without touching either, and it is on the opposite corner from
the hard offset shadow so it does not read as part of it.

`--color-dormant` and not a seat colour or a signal colour: the tag is not about a player and it is not
telling anyone to click. Ink geometry inside it, so it survives greyscale and needs no text (NFR-03).

**This is the slot for the six statuses this issue does not answer.** `held`, `rock`, `ghost`, `locked`,
`armoured` and `ragebait` take the same box with their own inner geometry, one at a time, in an order the
spec that answers them sets. That is stated so the next person does not invent a seventh position.

**A pawn can carry both statuses at once and both stay readable**, which is the case the space-separated
attribute exists for: the tilt and the dormant mix are on the piece, the tag is outside the disc, and
neither rule touches the other's property.

*Rejected: no mark at all, on the grounds that the status is spent.* The player who is not looking at the
strip when it happens has no way of learning why their pawn collected nothing, and the rules layer will
keep the status for a full turn.

*Rejected: the tag inside the disc, over the face.* The disc is 45 px at the design resolution and already
carries two eyes and a seat mark. A third thing inside it turns a creature into a badge.

**Element needed from Claude Code:** `<span class="pawn__status"></span>`, empty, no attributes, a direct
child of `.pawn` after `.pawn__mark`. Present on every pawn from the moment the board is built, the same
contract `.square__trap` has and for the same reason (constraint 4). It renders nothing until the pawn
carries a status.

### D58. Whether the It's Not That Deep aura is drawn, and how

**Drawn, as a 45 degree hatch in `--color-text` at 22 per cent, painted with `background-image` on the
field itself.**

A player who cannot see the aura cannot avoid spending an offensive card inside it, which is the whole
point of the card that made it. Seven fields is a lot of board, and that is the argument against drawing
it in colour rather than the argument against drawing it.

`background-image` is the one paint layer on `.square` that nothing else uses. The aura therefore costs no
pseudo-element, which it could not have had, and no `background-color` and no `box-shadow`, which are
taken by the field's own state. It survives on an entry square, on a home-column field and under the
legal-target fill with no override, which is what makes seven contiguous fields safe to tint at all.

`--color-text` and not `--color-ink`, because the hatch has to stay visible on the plum field of Night In
and `--color-text` is the ink that inverts with the skin. Texture and not colour, because seven fields of
texture read as one region and seven fields of colour read as a second board.

*Rejected: an outline around the region's perimeter.* It is the clearest possible drawing of a region and
it cannot be done from the fields: each field would need to know which of its neighbours are in the aura,
which is four more attributes on 40 fields, and the region is not always a rectangle.

*Rejected: not drawn, with the reason recorded.* The brief offers this and it is the one answer that makes
a card's own effect invisible while the card is still standing. The aura is not a consequence, it is a
zone the player is meant to plan around.

### D59. What a pickable field looks like, and its keyboard state

**Violet, like a legal move target, without the pulse. The four refused fields are not painted. Focus is
two rings outside the field with a surface-coloured gap between them.**

**Offered fields are violet**, the same fill and the same inset ring D7 uses, because a pickable field and
a legal move target are never on screen at the same time: a move target answers a die that has been
rolled, a pickable field answers a card that is mid-play. Teaching the player one vocabulary twice is
cheaper than teaching them two, and "violet means you may click this" is already the strongest association
on the board, including every focus ring in the game.

**The difference is the pulse, and the pulse belongs to D7.** Six move targets pulse so that they read as
one group inside a move already under way. A trap card offers up to 36 fields at once, and 36 pulsing
fields is a board that flashes rather than a board that asks a question. So the pulse stays where it is
and the pickable field is the same signal held still.

**The four refused fields are not painted as refused.** They are simply not offered, which is the signal
the other 29 cards already use, and the refusal strip answers a click on one of them with the reason. A
board that paints 36 offers and 4 refusals is a board where every one of the 40 fields is shouting; the
absence of an offer is a complete answer, and it is the same one the player reads on every non-track cell.

**Focus is told apart from offered by construction, not by hue**, which it cannot be: D11's focus ring is
`--color-hint` and so is the offer. The offer is an inset ring, on the inside of the field. Focus is two
rings on the outside with a `--color-surface` gap between them, which is the pawn's focus treatment
brought down to field scale, so the player who has met one has met the other. The field lifts to
`--layer-region` while focused so its outer ring is not clipped by its neighbours.

An entry square keeps its owner's colour when it is offered, exactly as it does when it is a legal move
target: the offer is the ring, never the fill.

**This closes the fourth unnumbered leftover of `00-open-requests.md` § 4**, "how a pickable pawn differs
from a movable one", asked for a field. The answer generalises: the two states share the hue because they
never coexist, and they are told apart by the pulse when they do appear next to each other in time.

*Rejected: a second hue for picking, teal or a new one.* Teal is the skill square, and a field can be a
skill square and pickable at once, which would put two teals on one field meaning two things.

*Rejected: the refused fields dimmed or hatched.* The hatch is the aura and the dim would land on four
fields that are perfectly ordinary the rest of the time. The player learns "the entry squares are never
offered" once.

*Rejected: focus as a thicker version of the offer.* Two states of one property, differing in weight, on
an object 35 px wide at the floor size. The keyboard player is the one who most needs to be sure.

### D60. Whether a trap announcement gets a hold token, and whether the game waits for a mid-turn one

**Yes to both. `--motion-trap-hold: 2s`, and the view holds the turn for it when a trap fires from a
card.**

D20 is the precedent and this is the same argument with a shorter number. A refusal follows the player's
own click, so they are already looking at the board and four seconds is a minimum for reading something
they asked for. A trap fired by a card interrupts a turn that is under way and arrives unasked, so it
needs a guaranteed window rather than a long one. Two seconds is long enough that the strip cannot be
missed and short enough that a turn with two traps in it does not become a slideshow.

**The dice-move case needs nothing new.** The announcement is on screen while the pawn finishes its move
and the hook that delays the handover screen already exists.

**The card case is the one the game currently owes the player.** The trap resolves mid-turn, the turn
carries on, and the announcement gets no guaranteed time at all: a fast player can dismiss the board state
before the strip has finished fading in over `--motion-feedback`. So the game owes a pause it does not
currently take, and this is a two-second pause and not a modal.

`--motion-trap-hold` is a token the view reads and no stylesheet does, exactly like `--motion-refusal-hold`
today. It is not in the `prefers-reduced-motion` block: it is a reading time, not a motion, and the player
who has asked for less motion has not asked for less time to read.

*Rejected: no hold for the card case, letting the strip take its chances.* It is the status quo, it is
free, and it fails the one case this whole brief is about: the Banana Peel that takes a turn away and
moves nothing. If the announcement can be missed then the mark on the pawn is the only evidence, and the
player has to work backwards from it.

*Rejected: reusing `--motion-refusal-hold` for both.* Four seconds twice in a turn that the player did not
interrupt is long enough to feel like a fault in the game. Two numbers, because the two events differ in
who caused them.

---

## 4 Token reference

One token added. Nothing removed, nothing renamed.

| Token | Value | Used for |
| --- | --- | --- |
| `--motion-trap-hold` | `2s` | **New.** How long a trap announcement is guaranteed on screen before the turn may carry on (D60). Read by the view, not by any stylesheet |

Everything else the answer needs already existed:

| Token | Used here for |
| --- | --- |
| `--seat-shape-0` to `--seat-shape-3` | The owner's shape inside the chip (D53), through `--seat-shape` on the seat mapping |
| `--color-p0` to `--color-p3` | The chip's fill, through `--player` |
| `--color-ink` | The chip's edge, the shape inside it, the skid in the status tag, the announcement's dot |
| `--color-dormant` | The status tag's ground, and the mix on a stunned pawn's disc |
| `--color-text` | The aura hatch, because it inverts with the skin |
| `--color-hint`, `--color-hint-soft` | The pickable field (D59) |
| `--color-focus`, `--color-surface` | The two rings of a field's keyboard focus |
| `--color-panel` | The trap announcement's ground (D55) |
| `--border-hair`, `--border-ink`, `--border-thick` | The chip's edge, the blocker's edge, the offered field's ring |
| `--radius-pill`, `--radius-sm` | The chip's round corner, the blocker's square one |
| `--shadow-piece` | Under the chip, the same hard offset every object in the game carries |
| `--motion-capture`, `--ease-capture` | The chip arriving and being used up (D55) |
| `--motion-feedback`, `--ease-ui` | The status tag, the diamond's step back |
| `--layer-region` | The focused field, lifted so its outer ring is not clipped |

**`--color-warn` is not used anywhere in this delivery**, which is the point of D55.

---

## 5 The measurement

Two questions: does the chip separate from the field it sits on, and does the seat shape survive
greyscale on top of it.

**The shape against the chip is spec 06's measurement unchanged**, because it is the same two materials:
ink on the seat colour. 3.67:1 at the worst seat in Picnic, 5.16:1 in Night In, 11.61:1 at the best. That
is the number NFR-12 rests on and this delivery does not move it.

**The chip against the field is new.** Relative luminance by the WCAG channel formula, the same one
`greyscale.spec.js` uses. The field is `--color-square`, `#fffefa` in Picnic and `#4d3c65` in Night In.

| Seat | Chip fill | Against the Picnic field | Against the Night In field |
| --- | --- | --- | --- |
| 0 | `#ff5d5d` | 2.98:1 | 3.24:1 |
| 1 | `#ffc93c` | **1.52:1** | 6.35:1 |
| 2 | `#2fbf71` | 2.36:1 | 4.09:1 |
| 3 | `#4c86f9` | 3.42:1 | **2.83:1** |
| The ink edge | `--color-ink` | 12.55:1 | 1.83:1 |

**Each skin has one of the two doing the work, and they are opposite skins.** In Picnic the field is near
white, the fills sit between 1.52:1 and 3.42:1, and the ink edge carries the separation at 12.55:1. In
Night In the field is plum, the ink edge falls to 1.83:1, and the fills carry it at 2.83:1 to 6.35:1. So
no seat in no skin is separated by less than 2.83:1, and every chip has the hard offset shadow under it as
well.

**The one number that does not clear 3:1 is the blue chip on the Night In field, at 2.83:1, and it is not
new.** The blue pawn's disc is the same fill with the same ink edge on the same field, and it has been on
the board since spec 01. The chip inherits an already-accepted case rather than introducing one, which is
the strongest argument for having borrowed the pawn's construction in the first place.

**On the size of the shape**, which § D53 costs out: 10 px at the design resolution on the trap chip, 11
px on the blocker, 6 px on either at the 24rem floor of `--board-size`. NFR-12's acceptance criterion is
measured on `.pawn__mark`, which is 17 px at the design resolution and 10 px at the floor, and is not
affected by anything here.

---

## 6 The DOM contract, state by state

Section 3 of the brief, every selector it promises, plus the states that are correct to leave alone.

| Selector | Styled | How |
| --- | --- | --- |
| `.square--track > .square__trap` | Yes | The chip. Absent object means `opacity: 0` and `scale: 0.4`, so the 40 empty spans paint nothing |
| `.square[data-trap="trap"]` | Yes | Raises the chip to full opacity and scale over `--motion-capture` |
| `.square[data-trap="blocker"]` | Yes | Same, plus the four declarations that grow it to 76 per cent and square its corners |
| `.square[data-trap-kind]` | **Not read, deliberately** | D51. The four kinds share one look; the kind is in the `aria-label` |
| `.square[data-trap-aura="true"]` | Yes | The 45 degree hatch on `background-image` |
| `.square__trap[data-player="0..3"]` | Yes | `--player` fills the chip, `--seat-shape` clips the shape inside it. Both come from the one mapping in `board.css`; no rule was added for the span |
| `.square__trap[aria-label]` | Correct as is | Nothing to style. It is where the words live, which is why nothing here has a `content:` string |
| `.square--track[data-pickable="true"]` | Yes | Violet fill and inset ring, no pulse. Entry squares keep their owner's fill |
| `.square--track[tabindex="0"]` | Yes, through `:focus-visible` | Two rings outside the field with a surface gap; the field lifts to `--layer-region` |
| `.board[data-picking="free-square"]` | **Not read** | The board does not change when it asks a question; the fields it is asking about do. `data-picking` stays available for a future prompt strip |
| `.pawn[data-statuses~="stunned"]` | Yes | `--pawn-tilt: -9deg` and the disc mixed toward dormant |
| `.pawn[data-statuses~="slippery"]` | Yes | Raises `.pawn__status` |
| `.pawn[data-statuses]`, six other values | Not styled | Out of scope by § 7 of the brief. The tag box is the slot they take |
| `.pawn__status` | Yes | **Needs the element.** D57 |
| Both statuses on one pawn | Correct | The tilt is on the piece, the tag is outside the disc, neither rule touches the other's property |
| A stunned pawn that is also selected or captured | Correct | The tilt composes inside the existing `transform`; the scale and the dim are unaffected |
| A trap on a turn-off square, 9, 19, 29, 39 | Correct | The bar takes `z-index: 2` in `board.css`, the chip is at 1, and the blocker stops 12 per cent short of the edge |
| A trap on a skill square | Correct | The diamond steps back to `inset: 30%`, D54 |
| A trap on a field that is also a legal target or pickable | Correct | The ring is the field's own `box-shadow` and never reaches the corner |
| A pawn standing on a trap | Correct | The pawn is at `--layer-pawn`, the chip at 1 inside a field at `--layer-square` |
| An entry square, 0, 10, 20, 30 | Correct | Never a legal trap target, so the chip never appears on the owner's fill |
| `prefers-reduced-motion` | Nothing to add | The chip's transition runs on `--motion-capture`, which the token block already collapses to 1 ms. The tilt is static and the hatch does not move |
| Two-player match, seats 0 and 2 | Correct | Circle against square, the widest pair of the four shapes |
| `.move-refusal[data-message-kind="trap"]` | Yes | Panel ground, ink dot. Two declarations |
| `.move-refusal[data-message-kind]`, other values | Correct as is | Anything that is not `trap` keeps the refusal treatment, which is what every existing message is |

---

## 7 The landing checks

1. **D51 to D60 answered**, none skipped. § 3.
2. **Every answer carries a reason and a named rejected alternative.** D51 has three, D52 two, D53 three,
   D54 two, D55 three, D56 two, D57 two, D58 two, D59 three, D60 two.
3. **No CSS file over 300 lines.** 269, 129, 284, 79, 238. `pawn.css` is the closest at 284 and it is the
   file that will need the next split; the seam is the status block, which is already a contiguous run at
   the foot of the file.
4. **No user-facing string in a `content:` property.** Nothing was added to a `content:` anywhere. The
   object's name and its owner are in the span's `aria-label`.
5. **Every state in § 3 of the brief styled**, § 6 above is the table, and the one element the brief does
   not promise is named rather than assumed: `.pawn__status`, D57.
6. **`traps.spec.js`.** Nothing here hides a field, changes a field's box or takes a field out of the flow.
   The chip and the status tag are `position: absolute` inside their parents, the aura is a
   `background-image`, and the only geometry change to a `.square` is a `box-shadow`. A focused field takes
   `z-index: var(--layer-region)`, which lifts it above its neighbours and cannot move a click target.
7. **`greyscale.spec.js` with the trap marks present.** The chip carries `--seat-shape` from the same
   mapping the pawn reads, so a per-seat `clip-path` is computed on the chip as well and it differs across
   seats and is identical within one. The spec's assertions are about `.pawn__mark` and nothing in this
   delivery touches it: the four rules deleted from `pawn.css` moved to `board.css` unchanged, and the
   mark's own rule is untouched. No expected-failure marker is needed.

---

## 8 What is still open

**Needed from Claude Code, one element.** `<span class="pawn__status"></span>` on every pawn, D57. The
`.square__trap` span, the `data-statuses` attribute, the `tabindex` on a pickable field and the
`data-message-kind` value are all already promised by § 3 of the brief.

**Needed when this lands, three files not delivered here.** Delete the four `--seat-shape` rules in each of
`hud.css`, `chrome.css` and `overlay.css`. § 2 says why they are not in this package.

**Owed and not answered.** The six statuses other than `stunned` and `slippery`: `held`, `rock`, `ghost`,
`locked`, `armoured`, `ragebait`. They have a box and a position, they need inner geometry and an order.
`STATUS.PURGE` still has no element anywhere.

**D23 is not settled**, and § 2 records the criterion this split used in case it helps whoever answers it.
**Still open from handoff 02 and untouched here:** D17, D21, D22, D24. **Still open from spec 03 § 5 and
brief 04 § 5.1:** the reaction countdown, whether the prompt strip belongs at the foot or in the rail, and
what an empty hand slot looks like. Fonts are still loaded from Google Fonts, unchanged since spec 01 § 5.

**One thing this delivery noticed and deliberately did not do.** `--color-dormant` is now doing three
jobs: a card that cannot be played, a status tag's ground, and the mix on a stunned pawn. That is fine
while the three never appear on one element, and it is the kind of overload that is cheap to fix early and
expensive to fix late. Worth a look in the pass that answers the six remaining statuses, since they will
all take the same ground.

**No em dash, in this spec or in any of the five stylesheets.** Rule 5 of the work order, checked.
