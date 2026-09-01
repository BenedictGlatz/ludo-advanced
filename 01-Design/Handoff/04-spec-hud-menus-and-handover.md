# Handoff 04, spec: the HUD, the five overlay screens and the persistent chrome

**From:** Claude Design
**To:** Claude Code
**Date:** 2026-09-01
**Answers:** [04-brief-hud-menus-and-handover.md](04-brief-hud-menus-and-handover.md), D35 to D42,
plus D16, D20 and four unnumbered items from spec 03 § 5 and brief 04 § 5.1

---

## 1 Files delivered

| File | Lines | State |
| --- | --- | --- |
| `src/ui/styles/hud.css` | 174 | **New.** Replaces the interim file |
| `src/ui/styles/overlay.css` | 229 | **New.** Replaces the interim file |
| `src/ui/styles/handover.css` | 90 | **New.** Split out of `overlay.css`, see below |
| `src/ui/styles/prompt.css` | 243 | **New.** Replaces the file Claude Code should not have written |
| `src/ui/styles/chrome.css` | 154 | **New.** Replaces the interim file. Requested in `00-open-requests.md` § 2.2 and in no brief |
| `src/ui/styles/tokens.css` | 231 | **Amended, additive.** 17 tokens added, one reverted, none removed or renamed |
| `src/ui/styles/app.css` | 114 | **Amended.** The grid, per D35 |
| `src/ui/styles/hand.css` | 154 | **Amended.** Two values reverted per D35, plus the empty slot |
| `src/ui/styles/refusal.css` | 50 | **Amended.** Off the grid and onto the board, per D35 |
| `src/ui/styles/pawn.css` | 153 | **Amended.** Six lines removed, per D36 |
| `01-Design/Handoff/04-spec-hud-menus-and-handover.md` | n/a | This file |

**`handover.css` is a split and not a new component.** The handover is the fifth content of the same
`.overlay` element and shares every selector in `overlay.css`. It is a separate file because
`overlay.css` was heading past the 250-line guidance and because the seam is real: the handover is the
only one of the five with a hard rule behind it rather than a preference.

**On the 300-line limit.** Every file above is written one declaration and one selector per line, which
is the shape `npm run format` produces, so these counts should survive it. `board.css` went 248 to 407
because it was full of compact multi-selector rules and Prettier exploded them; there are none here. If
one file does come out over, the seam to cut is the board-picking block at the end of `prompt.css`
(41 lines, `.board[data-picking]` and the two `[data-pickable]` rules), which is board CSS living in a
prompt file for want of a better home.

---

## 2 One answer per open decision

### D35 Where the HUD and the chrome go, and what they cost

**Answer: both go at the top, as full-width rows, exactly where the interim `app.css` put them. Neither
token change is kept. The two rows are paid for out of the foot of the page, which stops existing.**

The interim layout is right about the top of the page and wrong about where the money comes from. Two
new rows had to cost something, and the thing that was cut was the board and the cards, which is the
part of the screen the game happens in. There was a cheaper thing to cut and it was already named in the
brief: the foot of the page holds 116 px plus two gaps, 148 px in total, for two strips that are usually
saying nothing.

**Both strips move next to their subject.**

- **The refusal strip** hangs off the bottom edge of the board region, absolutely positioned inside
  `.app__board`. A refused move is a fact about a pawn. It costs no grid row, it still cannot make the
  page jump, and for the four seconds it is up it overlaps the board's lowest rank, which is the
  correct thing for a message about the board to do.
- **The prompt strip** becomes the third plate in the rail, under the skill hand. It asks about cards,
  and until now it asked from the far side of the page. It is `display: none` at `data-mode="none"`, so
  the rail gives the height back to the board column when nothing is being asked.

**The arithmetic at 1440 by 900**, worst case, with the prompt up:

| Row | px |
| --- | --- |
| Page padding, top and bottom | 48 |
| Two row gaps | 32 |
| Chrome row | 36 |
| HUD row | 61 |
| Board row: the rail, 322 dice + 289 skill + 62 prompt + two gaps, against the board's 634 | 705 |
| **Used** | **882 of 900** |

With no prompt up, 811, and the board is the taller column again. Measured in the mockup, not derived.

The board row is now set by the rail rather than by the board, which is the thing to carry forward:
**the next region added to the rail is the first one that costs the board its size**, and there are
18 px of headroom before it does. That is why the prompt plate is 62 px and not 90: it is a single row,
one line and one clock and the buttons side by side, and a second row inside it would spend the lot.

**So both changed tokens revert.** `--board-size` goes back to 44vw and the two `--card-u` factors go
back to 0.76 and 0.68. The second one is the one the brief asked to have overruled and it is overruled:
at 0.62 a skill card is 161 px wide and its kind pill is under 9 px, and D26's trade was that a
shrinking card drops the rules paragraph and keeps the art **and the pill**. 0.62 broke the half of that
promise that was written down.

*Rejected: keeping the foot rows and the smaller board.* It buys 148 px by taking it from the two
regions the player looks at, to protect two strips that are empty most of the time. *Also rejected:
putting the HUD in the rail.* It is the only place that costs no full-width row, but the rail already
sets the board row's height, so a HUD there would shrink the board by its own height plus a gap, which
is the trade this answer exists to avoid. *Also rejected: collapsing the refusal strip to zero height in
the grid rather than moving it out.* That is the version that makes the page jump, which is the reason
D9 gave it a permanent row in the first place.

### D36 What "on turn" looks like, and how many places say it

**Answer: four cues become three, and each of the three gets one job. The pawn dim is the one that goes.**

| Cue | Job | Kept |
| --- | --- | --- |
| The turn sentence in the chrome | **Who.** Names the player, in words, in the row the eye starts in | Yes, and it is new |
| The HUD seat plate | **Who, and how they are doing.** The plate fills with the seat's colour | Yes |
| The ink halo on the yard, `board.css` | **Where.** The only cue in the place the pieces are | Yes |
| Everyone else's pawns at 85% opacity, `pawn.css` | none | **Removed** |

The dim is the one to remove and not the halo, for a reason that is not about turn cues at all: it is
the only one of the four that touches all sixteen pieces, and it spends contrast on every pawn that is
not the active seat's. NFR-12 and D16 cannot afford that, and a "these are not yours" affordance is
already carried by the violet ring that marks the movable ones. Six lines gone from `pawn.css`.

The lifted hand plate in `app.css` is not counted above because **it was never a turn cue**, and this
spec renames it in the file: during a reaction window it is another seat's plate that rises. It says
"this region wants an answer".

The chrome sentence says the seat three ways: in words, in the seat's colour, and in the seat's D16
shape. **This needs `data-player` on `.app__chrome`**, which the contract does not promise. See § 5.

*Rejected: removing the yard halo instead.* It is the least reliable of the four by mid-game, because
the yard empties, but it is also the only ambient marker inside the board, and the board is where the
player is looking when they are deciding rather than orienting. *Rejected: keeping all four and simply
ranking them.* Four marks for one fact is the noise the brief describes, and ranking noise leaves noise.

### D37 Sixteen numbers

**Answer: a seat plate has one fixed size, 15.5rem, and the row centres rather than stretching. Nothing
is dropped as the seat count falls, because nothing was sized to the seat count in the first place.**

The plate is two lines. The name line carries the seat mark and the short name. The number line carries
the four counts on one baseline, and they are **ranked rather than equalised**:

- `home` is the score. It is the only count at `--text-lg`, because it is the number that answers "who
  is winning".
- `start` and `track` are the working-out. They sit at `--text-md` and their labels are small caps.
  They are also redundant, since the three always sum to four, and that is exactly why they are quiet
  rather than absent: a player who wants them can read them, and nobody has to.
- `cards` is pushed to the right behind a hairline, in the skill teal. It is the one number that is not
  on the board and not part of the sum of four, and it is only on screen because of D33.

At two seats the row shows two plates of the same shape, centred, with the rest of the row empty. That
is the answer to "what does it drop": **nothing**, and the empty space is what tells you the match is
two-handed.

`--font-num` is used, on the values only, with `font-variant-numeric: tabular-nums`, so a count changing
from 1 to 4 does not move the label next to it. Spec 01 said to use it here or delete it; it is used.

*Rejected: three counts as one figure, a four-segment progress track.* It is the better graphic and the
DOM contract cannot express it: `.hud__count` is four sibling list items with a value and a translated
label each, and turning them into one bar means either new markup or CSS pretending four elements are
one, which breaks the moment a label is longer in English than in German. *Rejected: stretching the
plates to fill the row.* Two seats then get 678 px each of mostly nothing, and the same information
changes shape depending on how many people are playing.

### D38 One overlay component, five contents

**Answer: yes, one component, and the seam is right. The panel does not vary. The sheet does, and it has
exactly two modes.**

| Mode | Screens | What it is |
| --- | --- | --- |
| **Veil** | `pause`, `win` | `--overlay-veil`, the page colour at 74%. The board reads through it |
| **Curtain** | `menu`, `setup`, `handover` | Opaque. There is nothing behind worth showing, or there is something behind that must not be shown |

74% and not 88%: at 88% the board is present but not readable, which is the worst of the two and the
thing the interim file flagged.

The panel is one shape for all five, and the only things that vary are the width (`setup` gets 34rem for
three count buttons side by side; `handover` gets 36rem) and whether it is about a seat. A panel that is
about a seat, which the contract restricts to `win` and `handover`, takes that seat's colour as a top
band **and** its D16 shape as a mark above the title, so it survives greyscale.

The sheet fades in over `--motion-overlay`, 180 ms, using `transition-behavior: allow-discrete` and
`@starting-style`, which is what makes a transition possible across `display: none`. The interim file
correctly noted that it was not. The handover does not fade, and that is D39.

*Rejected: five components.* Menu, setup, pause and win differ by width and by which of two sheet modes
they use, and nothing else; five files is four copies of the same panel waiting to drift apart.
*Rejected: one sheet mode for all five.* A veil over the menu shows a board that has not been dealt, and
a veil over the handover shows the next player the rail, which is the one thing the handover exists to
prevent.

### D39 The handover screen

**Answer: the sheet is opaque in the first frame it exists, in both motion preferences. Nothing about
the concealment is animated. The panel moves; the curtain does not.**

This is the whole mechanism and everything else follows from it. An animated curtain is a curtain that
is briefly open, and at a shared screen the next player is sitting close enough to read five cards in
200 ms.

- **Entry.** The sheet has `transition: none` and appears at full opacity. The panel animates in over
  `--motion-curtain`, 320 ms, rising `--space-6` with a fade, on `--ease-curtain`.
- **What it shows.** The seat's D16 mark at `--space-8`, the arriving player's name at `--text-2xl`, and
  one button, `data-action="ready"`, at 3.25rem tall. The whole sheet takes a 22% wash of the seat's
  colour, so the player recognises the screen is theirs before reading it.
- **Exit.** On `ready`, and on nothing else. **There is no timer.** The 320 ms flip this replaces is the
  behaviour being removed, not shortened.
- **Reduced motion.** `--motion-curtain` becomes 1 ms, which removes the panel's travel. The
  concealment is untouched, because it was never motion.

**No blur and no frosted sheet.** Both are a picture of the rail rather than an absence of it, and five
overlapping cards are recognisable through a blur at conversational distance.

**One ordering requirement for `hand-view.js`**, and it is the only way this can leak: `data-open` must
flip to `true` **before** the rail is rewritten for the next seat. If the hand re-renders first there is
a frame of the new hand in the open, and no CSS can cover a frame that has already been painted.

*Rejected: a wipe or a drop of the sheet itself.* It is the better-looking entrance and it uncovers the
rail for the length of the animation. *Rejected: hiding the rail with `visibility: hidden` instead of an
opaque sheet.* It works, and it means the concealment lives in two files that have to agree; when they
stop agreeing the failure is silent and the cost is the game.

### D40 The win screen, which is D18 from handoff 02

**Answer: the win screen is a veil, a panel in the winner's colour, and a title at `--text-2xl`. The
refusal strip stops carrying the message.**

The strip is orange, orange is `--color-warn`, and `--color-warn` means the game has refused something.
Telling the winner they have won in the colour reserved for "you cannot do that" is the defect
`notes/04-frontend-building-blocks.md` already records, and one message in two places is the other half
of it. The overlay says it; the strip says nothing.

Winning is a veil rather than a curtain, because the final board is the thing the winner wants to look
at, and it is the only screen in the game whose title is set at `--text-2xl`.

**An abandoned match is not a win and does not look like one.** It reaches the same `match-over` phase
by a different route, and the same screen with a different seat colour would be a small cruelty. It
drops the seat colour to `--color-dormant`, drops the title to `--text-xl` and sets it in muted text.
**This needs `data-outcome="won|abandoned"` on `.overlay`**; see § 5. Without it the CSS has no way to
tell the two apart, and styling around its absence would mean guessing from the presence of
`data-player`, which is exactly the guess the brief asks us not to make.

*Rejected: a curtain for the win screen.* It hides the board at the one moment the board is the reward.
*Rejected: confetti, a burst, any celebration animation.* It is the obvious thing and it is 320 ms of
motion on the screen a player sees once per match, in a game whose whole motion budget is spent on
things that happen 250 times.

### D41 The card artwork against the two skins

**Answer: the art window stays light in both skins. There is no Night In variant of the 36 drawings. The
mechanism is two tokens, and the extraction script's colour map points at them.**

A card is a printed object. The frame, the band and the pill follow the skin because they are the game's
chrome; the drawing inside the window is ink on paper and paper does not change colour when the lights
go down. This is already the position `tokens.css` took at D25 for `--card-dormant-wash` and the family
hues, and it is the same argument.

Two tokens, both fixed in both skins, so the raw hex stops being raw:

- `--card-art-ground: #fff8ec`, the cream the artboard draws on.
- `--card-art-ink: #2b1a3d`, the linework. The brief quotes `#2B1A3D`; the same value, lowercased to
  match the file.

Re-run the extraction with those two in the map and nothing on screen changes, which is the point: the
values become named and reviewable without a visual diff.

*Rejected: a filter on `.card__art`.* `invert()` destroys the hue relationships the four category washes
depend on, and `hue-rotate()` moves the green that means Action. *Rejected: a token substitution pass
producing dark-skin artwork.* Mechanically cheap, as the brief says, and it needs 36 hand-checks to
confirm no drawing lost its linework contrast, which is a day of somebody's attention for a window
90 px wide.

### D42 The persistent controls, and D46 with it

**Answer: one row at the top, sentence left, controls right, ordered by how often a hand reaches for
them: pool overview, language, pause. The language control is one button showing the language you would
switch to.**

The brief's placement was right and it stays. What changes:

- **Three controls, not two.** Issue #30's pool overview joins the same cluster, which answers **D46**
  in this spec, as `00-open-requests.md` § 3 suggests. It is the only control in the row with a coloured
  edge, `--card-dice`, because it opens a panel about the dice cards and the row is otherwise
  deliberately colourless.
- **Pause is last, at the right-hand end.** It is the one that stops the game.
- **Every control is at least 2.25rem square**, 2.75rem below the breakpoint, so the row is a real hit
  target and not a line of text links.
- **The turn sentence is set at `--text-lg`, not `--text-md`.** It is the answer to the Product Owner's
  question and it was the smallest text in the row.

**The language control is one button, labelled with the language it switches to**, because a control is
labelled with what it does. `data-lang` carries the language currently active, so the attribute and the
label disagree on purpose, and the CSS keys off the attribute.

*Rejected: a toggle showing the current language.* "DE" on a button is a statement, not an action, and
half of everyone reads it as the thing that will happen. *Rejected: two buttons with a selected state.*
It doubles the width of the cluster, adds a state to style, and turns a one-click switch into a target
choice, for a control that has exactly two values.

---

### Also settled, though not asked for in this handoff

**D16, NFR-12: telling four seats apart without colour.** The one open item that blocks a `must have`,
and it is answered here because the HUD, the chrome and two overlay screens all had to name a seat and
it would have been four more places relying on hue.

> **Correction added by Claude Code on landing, and the mistake was ours.** NFR-12 is **`should have`**,
> not `must have`. The work order this spec answers said `must have`, so this sentence is repeating a
> label it was given. Row NFR-12 of `Requirements-Specification.md` reads `S`, and section 3.2 of that
> document names NFR-12 as one of the last two should-haves to be cut. Nothing about the answer below
> changes; what changes is how urgent the unfinished half is.

**A shape per seat**, as a clip path rather than a glyph: no font dependency, nothing readable, nothing
a translator will ever be handed.

| Seat | Token | Shape |
| --- | --- | --- |
| 0 | `--seat-shape-0` | circle |
| 1 | `--seat-shape-1` | triangle |
| 2 | `--seat-shape-2` | square |
| 3 | `--seat-shape-3` | diamond |

Applied in this delivery to the HUD seat plate, the chrome turn sentence, the win panel and the handover
panel. **It is not closed**, and honestly so: the pawn is where NFR-12 is actually measured, and
`greyscale.spec.js` will keep failing until the mark is on the piece. That needs one element the
contract does not promise, `.pawn__mark`, an empty `<span>` inside `.pawn`. It is named in § 5 rather
than styled around, and `pawn.css` gets the same four tokens in a follow-up of about fifteen lines.
Removing the pawn dim under D36 helps the measurement and does not settle it.

**D20, whether the four-second refusal minimum becomes a token.** Yes. `--motion-refusal-hold: 4s`. It
is a timing the player feels and it was a number in a JavaScript file; the answer costs one line.
*Rejected: leaving it in `move-refusal.js`.* It is the only duration in the game that is not in
`tokens.css`, and the next person to tune it would have had to know that.

**What the reaction countdown looks like** (spec 03 § 5). It was a bare number. It is now that number
inside a ring that empties over `--clock-window`, 30s, driven by a CSS animation off `data-mode`
alone, so jQuery still writes nothing but attributes. The ring is `--color-hint` and turns
`--color-warn` for the last eight seconds, at the 74% keyframe. `@property` is what makes an angle and a
colour animatable; both are declared in `prompt.css`. It keeps running under `prefers-reduced-motion`,
because thirty seconds of linear progress is information and not decoration. **FR-07 puts pause inside
the reaction window, so it needs `data-paused` on `.app`**; see § 5.

**Whether the prompt strip belongs at the foot or in the rail** (spec 03 § 5). The rail. Answered inside
D35 and it is half of what pays for the HUD.

**How a pickable pawn differs from a movable one** (spec 03 § 5). They were two rings in two tokens,
which is a difference nobody reads at a glance. They are now two kinds of mark: **movable is an
outline**, the piece is ready; **pickable is a filled teal halo**, the piece is a target for the card in
your hand. Outline against fill survives greyscale; two hues do not.

**What an empty hand slot looks like** (new, issue #39). Neither *unplayable* nor *face down*: there is
no card, and both of those are things a card can be. An empty slot is the outline of where a card would
go, the silhouette in dashed ink at 32%, no face, no shadow, no lift, out of the tab order, keeping the
fan's geometry so a hand of one does not re-flow to the middle of the plate. Selected on
`:not([data-card-id])`, so it needs no new attribute. If the slot does carry an id when empty, say so
and it becomes `[data-empty="true"]`.

**Not settled here, and untouched:** D17, D21, D22, D23, D24, and whether a skill square moving is
animated. D24 in particular is now visible: the HUD is the first region that is mostly text and it is
the first place a missing Baloo 2 shows.

---

## 3 Token reference

Seventeen added, one reverted, none removed and none renamed.

| Token | Value | What it is for |
| --- | --- | --- |
| `--seat-shape-0` | `circle(50% at 50% 50%)` | Seat 0's mark. D16 |
| `--seat-shape-1` | `polygon(50% 4%, 96% 94%, 4% 94%)` | Seat 1's mark, a triangle |
| `--seat-shape-2` | `inset(6%)` | Seat 2's mark, a square |
| `--seat-shape-3` | `polygon(50% 2%, 98% 50%, 50% 98%, 2% 50%)` | Seat 3's mark, a diamond |
| `--seat-mark` | `0.85rem` | The mark's size in a HUD plate. Overridden larger on overlays |
| `--text-2xl` | `2.5rem` | The win title and the handover title, and nothing else |
| `--overlay-veil` | `color-mix(in srgb, var(--color-app-bg) 74%, transparent)` | The sheet you can read the board through |
| `--motion-overlay` | `180ms` | An overlay arriving. 1 ms under reduced motion |
| `--motion-curtain` | `320ms` | The handover panel's travel. Never the sheet |
| `--ease-curtain` | `cubic-bezier(0.16, 1, 0.3, 1)` | The same panel. Decelerating, so it settles rather than lands |
| `--motion-refusal-hold` | `4s` | How long a refusal stays up. D20 |
| `--clock-window` | `30s` | The reaction window, and the ring's duration |
| `--clock-urgent` | `8s` | When the ring turns orange. The 74% keyframe is this over `--clock-window` |
| `--card-art-ground` | `#fff8ec` | The artwork's paper. Fixed in both skins. D41 |
| `--card-art-ink` | `#2b1a3d` | The artwork's linework. Fixed in both skins. D41 |
| `--layer-overlay` | `6` | Above the refusal strip |
| `--layer-chrome` | `7` | Above the overlay, because FR-34 |
| `--board-size` | `clamp(24rem, min(82vh, 44vw), 60rem)` | **Reverted** from 39vw. D35 |

`--font-num` was in the file and unused. It is used now, on `.hud__value`, `.prompt__clock` and the
setup screen's three count buttons.

Two `--card-u` factors in `hand.css` revert to 0.76 and 0.68. They are not tokens and are listed here
because D35 asked about them.

---

## 4 Component states covered, against the § 3 DOM contract

**§ 3.1 the HUD.** `.hud`; `.hud__seat` for `data-player` 0 to 3; `data-on-turn` true and false;
`data-finished` true and false; `.hud__name`; `.hud__counts`; `.hud__count` for `data-kind` start,
track, home and cards; `.hud__value`; `.hud__label`. `data-players` on `.hud` is **not** styled: the
plate has one size, so the seat count needs no rule, and the attribute stays available.

**§ 3.2 the overlay.** `.overlay` for `data-screen` menu, setup, pause, win and handover; `data-open`
true and false, and `[hidden]` alongside it; `data-player` present and absent, 0 to 3;
`.overlay__panel`; `.overlay__title`; `.overlay__text`, including absent and `:empty`;
`.overlay__actions`; `.overlay__button` for `data-variant="primary"` and for `data-action` start,
players, resume, restart, quit and ready; hover, active and `:focus-visible` on all of them.
`data-count` on the setup buttons is not styled: the three are a choice between equals and one size.

**§ 3.3 the chrome.** `.app__chrome`; `.chrome__turn`, including empty; `.chrome__button` for
`data-action` pause, language and pool; `data-lang` is available and deliberately not styled, see D42;
hover, active, `:focus-visible`.

**§ 3.4 the shell.** All seven regions placed. `.prompt` moved to the rail, `.move-refusal` moved into
`.app__board`.

**§ 3.5 the card art.** `.card__art` unchanged in behaviour; two tokens named for the extraction map.

Both skins, through `light-dark()` throughout. `prefers-reduced-motion` handled in every file that
animates. No user-facing string in any `content:` property: the four `content: ""` occurrences are an
empty string on a decorative shape.

---

## 5 What is still open

**Three DOM elements or attributes this spec needs and the contract does not promise.** Named rather
than styled around, per brief § 2:

1. **`data-player` on `.app__chrome`**, seat index of whoever is on turn, absent on menu and setup. D36
   puts the seat's colour and shape on the turn sentence and there is nothing to key them off.
2. **`data-outcome="won|abandoned"` on `.overlay`** when `data-screen="win"`. D40 draws two different
   screens and cannot tell them apart otherwise.
3. **`data-paused="true"` on `.app`** while the game is paused. It stops the reaction ring, which FR-07
   requires and a CSS animation cannot do by itself.

And one for the follow-up that closes D16: **`.pawn__mark`**, an empty `<span>` inside `.pawn`, so the
seat shape can go on the piece. Fifteen lines of `pawn.css` and `greyscale.spec.js` can come off
expected-to-fail. Nothing in this delivery depends on it.

**One ordering requirement.** `data-open="true"` on the handover overlay must be written **before** the
rail is re-rendered for the next seat. See D39.

**Still open from handoff 02, and no work here touched them:** D17, D21, D22, D23, D24. D16 is answered
but not closed, above. D20 is answered.

**Handoff 05 is not answered.** `00-open-requests.md` § 2.1 asks for
`05-spec-dice-pool-overlay.md` answering D43 to D47, and `05-brief-dice-pool-overlay.md` is not in the
repository on `dev`, and neither is the `pool.css` that § 2.2 lists at 92 lines. D46 is answered above,
inside D42, because it is a question about the chrome row and the chrome row is here. D43, D44, D45 and
D47 need the brief.
