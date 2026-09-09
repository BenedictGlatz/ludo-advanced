# Handoff 16, spec: the seat is a colour, and the message strip leaves the board

**From:** Claude Design
**To:** Claude Code
**Date:** 2026-09-05
**Answers:** two review notes on the built game rather than a brief. D97 to D99.
**Read against:** the same local stylesheet copies handoff 12 and handoff 15 reported on. The
qualification is unchanged and is repeated in § 1.
**Supersedes:** **D16** and the shape half of **NFR-12**, **D49**, and the placement half of **D35**.
D53 keeps its chip and loses the shape inside it. D57 is unaffected.

Two notes came back from the running game, both about things that look wrong in play rather than in a
drawing.

1. **The pieces have mouths.** The seat shape sat low and centred on the disc, under two eyes, and
   that is a mouth. Four seats therefore had four expressions, none of them chosen: the triangle seat
   reads as shouting, the square seat as gagged, the diamond seat as unwell. The Product Owner asks
   for the seats to be told apart by colour and nothing else.
2. **The message strip covers the board.** It hung off the foot of the board region, and the foot of
   the board is two start areas and the last fields of two tracks. It is asked to sit above the skill
   cards instead.

They are one delivery because the first one is nine files and the second one is two, and both are the
same kind of change: a rule about where something is, not what it says.

---

## 1 Files delivered

| File | State | Lines |
| --- | --- | --- |
| `src/ui/styles/tokens.css` | Amended. Four tokens withdrawn | 265, was 267 |
| `src/ui/styles/board.css` | Amended. Four declarations withdrawn from the seat mapping | 264 |
| `src/ui/styles/pawn.css` | Amended. `.pawn__mark` deleted | 253, was 284 |
| `src/ui/styles/hud.css` | Amended. One declaration | 173 |
| `src/ui/styles/chrome.css` | Amended. One declaration | 153 |
| `src/ui/styles/overlay.css` | Amended. One declaration | 229 |
| `src/ui/styles/board-trap.css` | Amended. Two rules deleted | 115, was 129 |
| `src/ui/styles/refusal.css` | Amended. Four declarations, the position | 143 |
| `src/ui/styles/app.css` | Amended. One `position` moved, one `padding-bottom` added | 128 |
| `src/ui/styles/lineup.css` | Amended. One declaration. **Handoff 15's file, not yet landed** | 223 |
| `01-Design/Handoff/16-spec-seat-dots-and-message-strip.md` | New, this file | n/a |

**Nine of the ten are whole files rather than diffs**, because eight of them carry comment text that
explains a decision this delivery reverses, and a diff of a reversal that leaves the old reasoning
standing is how a stylesheet ends up lying about itself. Every comment naming `--seat-shape`, D16 or
D49 is rewritten in place, and each rewrite names D97 and the date so the next reader can find this
file.

**`lineup.css` is in the list because handoff 15 has not landed.** If it lands first, this is a one
line amendment to it; if the two land together, take the copy here, which is the same 223 lines with
`clip-path` swapped for `border-radius`. It is the same file either way and nothing else in it moves.

**`tokens.css` drops to 265 of 300.** Constraint 6 of brief 15 measured it at 298 and called it full.
It is not full any more, which is worth knowing before the next screen has to argue about a token.

**On the commit, unchanged from handoffs 12 and 15.** The stylesheet copies on this side still predate
the tree the recent briefs measure: `overlay.css` is 229 lines here against 234 there, and
`tokens.css` had no `--stage-w` before this amendment and has none after it. So the selector named
beside each rule is what to trust, not the line number, and nothing here touches a rule that the newer
tree is likely to have moved.

---

## 2 The shape of the answer, in five sentences

Every seat mark in the game becomes a dot in the seat's colour, the four `--seat-shape-*` tokens are
withdrawn, and the one place the mark was a shape on a face, the pawn, loses the mark outright (D97).
Five elements are touched by that and none of them changes size, position or colour, only geometry:
the HUD name line, the chrome turn line, the win and handover panel, the trap chip, and the line-up
row badge. The pawn is the exception and it is a deletion, because a mark under two eyes cannot be
made to stop being a mouth. The message strip stops hanging off the bottom of the board and hangs
above the skill plate instead, out of flow, growing upward, so it still costs no grid row and can
still not make the page jump (D98). What that costs is real and § 4 states it in numbers rather than
burying it: with the shapes gone, red and blue are 1.15:1 apart in greyscale, and D99 books the
follow-up that would fix it without bringing a shape back.

---

## 3 D97: the seat shapes are withdrawn, and the pawn's mark with them

### D97.1 One geometry for all four seats, and it is a dot

`--seat-shape-0` to `--seat-shape-3` leave `tokens.css`. `--seat-shape` leaves the `[data-player="N"]`
block in `board.css`, where it arrived only two days ago under D53's follow-up. Every element that
read it now sets `border-radius: var(--radius-pill)` instead of `clip-path: var(--seat-shape, …)`.
That is one declaration per element and the same declaration in all five places:

| Element | File | Was | Is |
| --- | --- | --- | --- |
| `.hud__name::before` | `hud.css` | Clipped block, `--seat-mark` square | Dot, `--seat-mark` across |
| `.app__chrome[data-player] .chrome__turn::before` | `chrome.css` | Clipped block, `--space-5` | Dot, `--space-5` across |
| `.overlay[data-player] .overlay__panel::before` | `overlay.css` | Clipped block, `--space-6` | Dot, `--space-6` across |
| `.square__trap::before` | `board-trap.css` | Ink shape inside the chip | **Deleted.** The chip is the dot |
| `.overlay__seat::before` | `lineup.css` | Clipped block, `--space-5` | Dot, `--space-5` across |
| `.pawn__mark` | `pawn.css` | Ink shape on the disc | **Deleted.** See D97.3 |

**Rejected: keep the shapes everywhere except on the pawn.** It is the smallest change and it is the
worst of the options. A legend is only worth carrying if it is present where the player has to read
it, and the place a player has to tell two seats apart is sixteen pieces on a board, not four plates
in a HUD. Keeping the shape on the HUD alone would be teaching a code that the board never uses.

**Rejected: one shape for all four seats, kept on the pawn.** An ink dot low on the disc is still a
mouth, and an identical mark on four seats says nothing about which seat it is, so it costs the same
and buys less than nothing.

**Rejected: numerals, 1 to 4.** NFR-03 forbids a user-facing string in a `content` property, a numeral
in a shared component is exactly that, and the seat number is already spelled out in the HUD name line
and in the chrome sentence.

### D97.2 The dot gets the ink ring the shape was throwing away

This is a gain rather than a cost and it is worth naming, because it is a second change riding along
with the first. All four marks already carried `outline: … solid var(--color-ink)` with a negative
`outline-offset`, and all four were throwing it away: `clip-path` clips the element's whole rendering,
outline included, which is the finding 04-spec D16 recorded and `board-trap.css` repeats. So the
shapes had no edge. A `border-radius` does not clip anything, so the outline now paints, and the dot
has the hairline ink ring the declaration always asked for.

It matters most on the yellow seat. `--color-p1` is `#ffc93c`, and against `--color-surface` in the
Picnic skin an unringed yellow disc on a near-white plate is a smudge. With the ring it is a token.
Nothing about the declaration changed, only whether it renders.

### D97.3 The pawn loses the mark, it does not get a dot

The other five elements swap a shape for a dot. The pawn deletes the element.

The mark spanned 48 to 86 per cent of the disc, low and centred, deliberately clear of the eyes, which
sit between 19 and 41 per cent. Every one of those numbers is the reason it failed: an ink shape
directly under two eyes, filling the lower half of a round face, is read as a mouth before it is read
as anything else. 06-spec section 4 chose that position for contrast, measured it at 3.67:1 against
its own ground at the worst seat, and the measurement was correct. What it did not measure is that the
piece is drawn as a creature on purpose (D14, the googly eyes), and a creature's lower face is not
available for a legend.

**Rejected: move the mark to the shoulder.** That is where `.pawn__status` sits (D57), it is the only
other free part of a 38 per cent inset on a disc, and putting the seat mark there would mean the seat
mark and the slippery tag swap places depending on which one is present. It also does not solve the
problem it was moved for: a small ink shape on a face still reads as a feature of the face, just a
different one.

**Rejected: white or seat-lightened instead of ink.** 06-spec already tested this and ink won on
contrast. It also does not help: a white mouth is a mouth.

The pawn keeps everything else. The disc, the 3px ink border, the two eyes, the hard shadow, the four
interactive states, the stun tilt and the status tag are all untouched. Sixteen pieces on the board
now differ by fill colour, by which start area they came out of and by which home column they are
walking toward.

---

## 4 What NFR-12 rests on now, and what it costs

NFR-12 asks that no fact in this game be carried by colour alone. D97 takes away the mechanism that
answered it for the seats. This section is the honest accounting, not a reassurance.

### 4.1 The numbers

The four seat colours, converted to relative luminance, which is what a greyscale render leaves:

| Seat | Colour | Greyscale luminance |
| --- | --- | --- |
| 0, red | `#ff5d5d` | 0.299 |
| 1, yellow | `#ffc93c` | 0.634 |
| 2, green | `#2fbf71` | 0.391 |
| 3, blue | `#4c86f9` | 0.254 |

Contrast between the pairs, worst first:

| Pair | Ratio |
| --- | --- |
| Red against blue | **1.15:1** |
| Green against red | 1.26:1 |
| Green against blue | 1.45:1 |
| Yellow against green | 1.55:1 |
| Yellow against red | 1.96:1 |
| Yellow against blue | 2.25:1 |

**Red and blue at 1.15:1 are the same grey.** A player with a red-blue confusion, or anyone looking at
a greyscale render, cannot tell a red pawn from a blue pawn standing side by side on the track. That
was exactly what D16 existed to prevent, and it is no longer prevented.

### 4.2 What still tells the seats apart, and where it works

Three things survive, and it is worth being precise about which of them reach the pieces.

1. **Words, everywhere a seat is named.** The HUD plate reads "Spieler 1 (Rot)", the chrome sentence
   names the seat on turn, the win and handover panels name the seat, the line-up row names it. Every
   one of these is a string i18next writes, so it is a real cue and it survives any colour condition.
   None of them is on the board.
2. **Position, on the board's own furniture.** Each seat owns one corner start area, one home column,
   one entry square and one turn-off bar, all four in fixed places for the life of the match. A pawn
   sitting in a start area or walking a home column is identified by where it is, with no colour at
   all.
3. **Nothing at all, for a pawn on the shared track.** This is the gap. Between leaving its start
   area and turning off into its home column, a pawn's seat is carried by its fill and by nothing
   else. That is thirty-nine of the forty track fields and it is most of a match.

So the honest statement is: **NFR-12 holds for every seat fact stated in the page furniture and fails
for a pawn on the track.** It should be recorded as failing rather than quietly re-scoped.

### 4.3 The one thing that would fix it without a shape

D99. Read on.

---

## 5 D98: the message strip hangs above the skill plate

### 5.1 What moves

`.move-refusal` was absolutely positioned against `.app__board`, `bottom` at `calc(var(--space-4) *
-1)`, `left: 50%`, `width: var(--board-size)`. It is now positioned against `.app__skill`, `bottom` at
`calc(100% + var(--space-2))`, `left: 0`, `right: 0`, no width. `position: relative` moves from
`.app__board` to `.app__skill` in `app.css`; the board owns no other absolutely positioned descendant,
so nothing is left behind.

Everything else about the strip is unchanged: the ink border, the hard shadow, the pill dot, the
`--layer-refusal` z-index, the two voices of D55 and D73, the roll breakdown's delay, and the
transition, which is still an eight pixel rise into place over `--motion-feedback`.

### 5.2 Three properties this placement keeps or gains

**It still costs no grid row.** That was the whole of D35 and it is intact. The strip is out of flow
above a plate rather than out of flow below a region.

**It grows upward, so it can never cover the cards it sits over.** `bottom` is the anchored edge, so a
two line message extends into the gap above rather than down onto the skill plate. At the design
resolution the rail is narrower than the board, roughly 28rem to 34rem against 44rem, so a long
refusal is likelier to wrap than it was; the direction it wraps in is what makes that harmless.

**It is beside the thing the player is deciding about.** A refused move ends with the player choosing
a different pawn or playing a card, and the cards are directly under the strip.

### 5.3 What it costs, and the one declaration that pays for it

A one line strip stands 46 px tall and sits `--space-2` above the skill plate's top edge. The gap
between the two plates is `--space-4`, 16 px, so about 30 px of strip lands inside the dice plate.

**The first draft of this left that overlap alone and it was wrong.** The dice hand is centred and its
cards run to the plate's edge, so the band the strip occupies is always card and never padding: a
refusal cut the cards' tag row through the middle of the glyphs, which reads as broken layout rather
than as a message arriving. Nudging the strip does not fix it, because wherever it goes it is 46 px
tall and the plates are 16 px apart.

So the plate reserves the band once, and that is the only other declaration in this half of the
delivery: `padding-bottom: calc(var(--space-6) + var(--space-3))` on `.app__dice`, 44 px, which clears
the 30 px with room for the strip's shadow. The cards lift clear and stay clear whether the strip is
speaking or not.

**The price, plainly.** The dice cards lose 44 px of height at the design resolution. They are sized
from `--card-u` against the plate's own box, so they take it as a scale rather than as a crop, and
three dice cards side by side in a 28rem rail were never height bound. It is a permanent cost for a
transient message, which is the thing D35 refused to pay in grid rows; the difference is that this is
44 px inside a plate that already exists, not a 46 px row that pushes the board.

**Rejected: cap the strip so its top cannot pass the dice plate's bottom edge.** A two line message
would then have to grow downward onto the skill cards, which is the one direction § 5.2 makes
impossible on purpose.

**Rejected: the top edge of the board instead of the foot.** The top of the board is two more start
areas, and the HUD sits directly above it, so the strip would be reading against four seat plates.

**Rejected: its own grid row again.** That is 46 px of permanent empty page, which is what D35 removed
and what buys the board its 44vw.

**Rejected: below the skill plate.** At 1440 by 900 the skill plate is the last row of the grid, so
below it is the page edge, and in the stacked layout below 84rem it would be off the bottom of a
scrolled page.

**Rejected: inside the skill plate as a flow item.** The plate would grow, row 4 is `auto`, and the
page would jump. Same objection as the grid row, in a smaller place.

---

## 6 D99: the open follow-up, and it is not this delivery's to take

§ 4.1 leaves red and blue at 1.15:1 in greyscale. There is one fix that does not put a shape back:
**re-tune the four seat colours so they differ in lightness as well as in hue.** The seats would still
be told apart by colour alone, which is what was asked for; the colours would simply be chosen so that
telling them apart does not depend on hue perception.

Indicative targets, not a delivery: hold yellow where it is, take red down and blue further down,
leave green between them, and aim for no pair closer than about 1.6:1. That is achievable inside the
existing four hues.

**It is not done here for two reasons.** The four colours are quoted verbatim from the layout template
under D1 and D2, so changing them is a Product Owner decision and not a stylesheet decision. And they
are not four values: each has a `--color-pN-soft` partner used as a wash on plates, rows and start
areas in both skins, so a re-tune is eight values and a re-check of every plate's text contrast.

**Rejected: reinstate the shapes behind `prefers-contrast` or a greyscale setting.** A cue that only
exists under a setting is a cue the game is not designed around, and the greyscale switch in the
mockups is a review tool, not a product feature.

**Rejected: do nothing and re-scope NFR-12.** § 4.2 says where it fails. Writing that down is the
minimum; pretending the requirement changed is not available.

---

## 7 What this needs from Claude Code

Two DOM changes, one test, one load order note.

1. **Delete `<span class="pawn__mark"></span>` from every pawn.** It is the first child of `.pawn` in
   the DOM contract from 04-spec section 5. With the rule gone it renders nothing, so leaving it in
   is harmless and wrong; the contract should say what is there.
2. **Move `<div class="move-refusal">` to be the first child of `.app__skill`.** It is currently a
   child of `.app__board`. Nothing about the element itself changes: same class, same
   `data-reason-key`, same `data-message-kind`, same text node. `showMessage` needs no change.
3. **`greyscale.spec.js` will fail and the failing assertions should be deleted, not fixed.** It
   asserts a non-zero box and a per-seat `clip-path` on `.pawn__mark`, sixteen pieces at 38 per cent
   of a piece. Both facts are gone on purpose. D50 already retired the 1.30 luminance case in that
   file; what is left after this is whatever the file asserts about the page furniture, and § 4.2 is
   the list of what is still true. **Do not replace the assertion with one about the dots**, because
   a dot is a dot on all four seats and an assertion that four identical shapes are identical is not a
   test.
4. **No load order change.** No file is added or removed, and no rule moved between files except the
   one `position` between two selectors inside `app.css`.

**Nothing in `core/` is touched, no locale key is added or removed, and no token is added.** Four
tokens are removed; grep for `--seat-shape` before landing and expect zero hits outside the frozen
`handoff-04`, `handoff-07`, `handoff-11` and `handoff-12` packages, which are review folders and are
deleted rather than maintained.

---

## 8 The landing checks

1. **`grep -r "seat-shape" src/` returns nothing.** Four token definitions, four mapping declarations
   and six `clip-path` reads, all gone.
2. **`grep -r "pawn__mark" src/ tests/` returns nothing** once check 3 of § 7 is done.
3. **No CSS file over 300 lines after `npm run format`.** The longest here is `board.css` at 264 and
   every file in the delivery got shorter or stayed the same. `tokens.css` is 265 of 300.
4. **Two skins.** The dot is `--seat-color` or `--player` on both, and the ink ring is `--color-ink`,
   which is skin aware. The yellow seat on `--color-surface` in Picnic is the case to look at, and it
   is the one D97.2 improves.
5. **`prefers-reduced-motion`.** Nothing here declares a transition or an animation except the strip,
   whose transition is unchanged and already collapses through `--motion-feedback`.
6. **A refusal, a trap announcement and a roll breakdown, each at 1440 by 900 and each below the 84rem
   breakpoint.** All three use the same strip and the roll breakdown is the one that wraps to two
   lines. Check that it grows upward.
7. **A refusal while the dice plate is showing three unresolved cards.** The strip must clear the
   cards' tag row completely, at 1440 by 900 and stacked below 84rem. § 5.3 reserves 44 px at the foot
   of the plate for it; this is the check that 44 is enough at both widths.
8. **Sixteen pieces at four seats, greyscale off.** The pieces should read as sixteen creatures with
   two eyes. If any of them still has a mouth, a `handoff-*` stylesheet is in the load order.

**No em dash, in this file or in any of the ten stylesheets.** Rule 5 of the work order, checked.
