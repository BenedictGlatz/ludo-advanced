# Handoff 06, spec: the seat mark on the pawn

**From:** Claude Design
**To:** Claude Code
**Date:** 2026-09-02
**Answers:** [06-brief-pawn-mark.md](06-brief-pawn-mark.md), D48, D49 and D50, and D16 of handoff 02
with them

---

## 1 Files delivered

| File | State | Lines |
| --- | --- | --- |
| `src/ui/styles/pawn.css` | **Amended.** Two blocks added after the disc, nothing removed | 219 |
| `01-Design/Handoff/06-spec-pawn-mark.md` | New, this file | n/a |

**No new token, so `tokens.css` is not delivered.** The four `--seat-shape-*` values and `--color-ink`
are all the answer needs, and the brief is right that `--seat-mark` is not usable here: it is a rem and
the piece scales with the board.

53 unformatted lines added, on a file the brief counts at 166, which is inside the 80 the brief allows
before a split, so `pawn.css` stays one file. It was read from `dev` at tree `991ee06c60fa` on 2026-09-02, so the amendment sits on
the version that landed with handoff 04 including the six lines D36 removed.

**No mockup folder in the repository.** The mark is in `Dice Pool and Pawn Mark.dc.html` under
`view: pawns`, with a `greyscale` switch and both skins, and it ships in the `handoff-05/` review
package next to the handoff 05 answer rather than in `01-Design/Handoff/`. Nothing to delete after the
review.

---

## 2 The decisions

### D48. Size and placement of the mark, and its relationship to the eyes

**38 per cent of the pawn, centred horizontally, sitting low on the disc: 48 to 86 per cent of its
height. Filled with ink. The creature is unchanged.**

The eyes decide the placement. They are ink circles centred at 30 per cent of the disc and 22 per cent
wide, so they occupy 19 to 41 per cent of its height, and the mark starts below where they end. It
reads as a badge on a creature's front, which is what lets it be this large: at the design resolution
the pawn is 45 px and the mark is 17 px, and a 17 px triangle is not a shape anybody has to squint at.
Centred on the disc it would have read as a mouth on some seats and a third eye on others.

Per cent and not rem, for the reason the brief gives: the piece is `calc(var(--cell) * 0.78)` and a rem
does not follow the board. One consequence worth stating: at the 24rem floor of `--board-size` the
pawn is 27 px and the mark is 10 px, which is the smallest it ever gets and is still four
distinguishable shapes.

**Ink, and this is the one place the pawn does not copy the HUD.** On a HUD plate the mark has to be
the seat colour, because the plate is neutral and the mark is the only thing carrying the seat; even
mixed toward ink in Picnic the worst seat measures 2.74:1 there. On the piece the ground is already
the seat colour, so the seat is said by the disc and the mark only has to be legible on it. Ink
against its own seat colour measures **3.67:1 at the worst seat and 11.61:1 at the best**, and ink is
already the pawn's outline and its eyes, so the piece gains no new material. Section 4 has the table.

**The creature stays, and D14 is not reopened.** The mark is inside the silhouette, so all sixteen
pieces are still the same object at a glance and the board still reads as one set.

*Rejected: the shape as the piece's silhouette, a triangular pawn.* This is where the project started:
handoff 01 answered NFR-12 with a shaped piece and it was removed on request. It is the strongest
possible answer to the requirement and it costs the most: four different objects on one board are
harder to count as a group, the hard offset shadow of D14 has to be redrawn per shape, and the yard
slots are round. The mark buys the same identification for none of that.

*Rejected: the mark replacing the eyes.* It is the cheapest place with the most room, and it removes
the one decision that gives the pieces their character. A counter with a triangle on it is a counter.

*Rejected: the HUD's own construction, a seat-coloured fill with a hairline ink outline.* `clip-path`
removes an outline and a border along with everything outside the shape, which is the finding from
04-spec D16, and the four zero-blur drop shadows that survive it are invisible to the renderers a
reviewer looks through. On the piece the question does not arise: the fill is ink and needs no edge.

### D49. The mark through the five states

**It takes part in none of them, and that is a decision rather than an omission. Nothing in the state
rules needed a change.**

| State | What happens to the mark | Read? |
| --- | --- | --- |
| default | 17 px at the design resolution, ink on the seat colour | yes, 3.67:1 at worst |
| `data-movable="true"` | Nothing. The `pawn-breathe` loop is on `::before`, the ring outside the disc, and the piece itself does not move | yes, unchanged |
| `data-selected="true"` | Scales with the piece to 1.14, so 19.5 px. The ring grows outward from `inset: -20%` and never reaches the mark | yes, better |
| `data-captured="true"` | Scales to 0.82, so 14 px, and dims with the piece to 70 per cent | **2.16:1 for 320 ms.** See below |
| `:focus-visible` | Nothing. The ring is outside the disc and the mark is inside it | yes, unchanged |
| `prefers-reduced-motion` | Nothing to stop. The mark has no animation and no transition of its own | yes |

**The mark does not breathe.** The `data-movable` loop scales `::before`, and putting the mark in it
would mean a shape whose size changes, which is the one property carrying identity on this screen. A
pulsing triangle is a worse triangle.

**The capture state is the one number that does not clear 3:1, and it stays as it is.** `opacity: 0.7`
on `.pawn` composites the whole group, so the disc and the mark fade together and the ratio between
them falls to about 2.16:1 in Picnic. Three reasons to leave it: it lasts `--motion-capture`, 320 ms,
and collapses to 1 ms under `prefers-reduced-motion`; the pawn it describes is leaving the board, so
its seat is the one thing about it that no longer matters; and NFR-12's acceptance criterion is a
greyscale screenshot of a board, which is not a board caught inside a 320 ms transient.

*Rejected: exempting the mark from the capture dim.* It would need the dim moved off `.pawn` and onto
`::after` and the mark separately, and the result is a piece that comes apart while it travels: a
solid ink shape floating over a ghost of a disc. The dim is deliberate, it is D14's answer to keeping
the pawn's identity while it moves, and a mark that ignores it stops being part of the creature.

*Rejected: a stronger mark in the captured state only, scaled up to compensate.* A shape that changes
size to stay visible is a shape that changes size, which D49's first answer above already rules out.

### D50. What happens to the luminance measurement

**Retire the 1.30 case. Keep the existing "four different greys" case as the palette floor, and record
1.146 in the notes as history. The palette does not move.**

The 1.30 threshold measured a proxy. In the period when colour was the only identifier, the spread of
the four hues in greyscale *was* NFR-12, and the test's derivation of 1.31 as the best an evenly
spread four-value palette could reach over this luminance range is the reason falling short of it was
a fact about the hues. With the shape on the piece the requirement is met another way, and what is
left is a threshold nothing is trying to reach: a test that reports a known failure forever, which is
how a suite learns to be ignored.

**Nothing measured is lost by retiring it.** `greyscale.spec.js` already carries a second case
asserting that every pair clears 1.0, described in the file as the floor below which the board would
be unreadable rather than merely hard. That is the regression worth catching, two seats reducing to
the same grey, and it passes today and keeps passing. The 1.146 figure and the 1.31 derivation belong
in `00-Meta/Documentation/notes/01-requirements-and-goals.md` next to NFR-12, where the next person
who proposes moving a seat colour will find them.

**What it costs.** The visible reminder that the palette is thin. A number in a notes file is read
less often than a red line in a test run. That is the trade, and it is worth making once the thing the
red line was about is satisfied.

*Rejected: keeping it as a weaker check with a named threshold.* 1.10 is the only threshold that both
passes today and means anything, and the measured worst pair is 1.146, so it has 4 per cent of
headroom: it would fire on a colour tweak that harms nothing while a real regression would have to
cross the 1.0 case anyway. A threshold that thin is a maintenance cost, not a guard.

*Rejected: re-spreading the palette as well, D2's other way out.* Darkening blue and lightening green
a step buys a margin the shape now provides, and it costs the four hues that came from the layout
template verbatim, every screenshot in the documentation notes, `handoff-01`'s sign-off, and a Product
Owner decision. If the palette is ever re-spread it should be for a reason of its own and not to
satisfy a requirement that is already met.

**The rewrite in section 4.3 of the brief is exactly right and this spec asks for no change to it.**
All three assertions are true of this delivery: the mark has a non-zero box on every pawn, the
computed `clip-path` is identical within a seat and different across seats, and both hold under
`filter: grayscale(1)`, because a filter changes what a pixel looks like and not what a box measures.

---

## 3 Token reference

No new tokens, nothing removed, nothing renamed.

| Token | Value | Used here for |
| --- | --- | --- |
| `--seat-shape-0` | `circle(50% at 50% 50%)` | Seat 0's mark on the piece |
| `--seat-shape-1` | `polygon(50% 4%, 96% 94%, 4% 94%)` | Seat 1's, a triangle |
| `--seat-shape-2` | `inset(6%)` | Seat 2's, a square |
| `--seat-shape-3` | `polygon(50% 2%, 98% 50%, 50% 98%, 2% 50%)` | Seat 3's, a diamond |
| `--color-ink` | `light-dark(#3a2b55, #1c1230)` | The mark's fill. The piece's own outline colour |
| `--seat-shape` | set per seat on `.pawn` | The indirection the mark reads. Not a new token, the same name `hud.css`, `chrome.css` and `overlay.css` already set |

---

## 4 The measurement

Greyscale contrast of the mark against the disc it sits on, which is the seat colour in both skins.
Relative luminance by the WCAG channel formula, the same one `greyscale.spec.js` uses.

| Seat | Colour | Luminance | Against ink, Picnic | Against ink, Night In |
| --- | --- | --- | --- | --- |
| 0, circle | `#ff5d5d` | 0.2987 | **4.21:1** | 5.92:1 |
| 1, triangle | `#ffc93c` | 0.6337 | 8.25:1 | 11.61:1 |
| 2, square | `#2fbf71` | 0.3906 | 5.32:1 | 7.48:1 |
| 3, diamond | `#4c86f9` | 0.2543 | **3.67:1** | 5.16:1 |

Ink is `#3a2b55` in Picnic, luminance 0.0329, and `#1c1230` in Night In, luminance 0.0089. The worst
case in the game is seat 3 in Picnic at 3.67:1, which clears 3:1 for a non-text graphic and is 34 per
cent better than the 2.74:1 the same four shapes manage on the HUD's on-turn tint. The piece is the
one place in the game where this answer is comfortable rather than marginal, which is a good argument
for it being the place the requirement is measured.

**A shape is not a contrast ratio, and the ratio is not the requirement.** What the numbers establish
is that the shape is visible. What identifies the seat is that there are four shapes and they are
different from each other, which no luminance measurement can express. That is the whole of D50.

---

## 5 The DOM contract, state by state

Section 3 of the brief, every selector it promises.

| Selector | Styled | How |
| --- | --- | --- |
| `.pawn > .pawn__mark` | Yes | Ten declarations. Absolutely positioned inside the piece, ink fill, clipped to the seat's shape |
| `.pawn[data-player="0..3"]` | Yes | Four one-property rules mapping the seat to `--seat-shape`. `--player` still comes from `board.css` |
| `.pawn[data-r]` | Not read | Position is the view's, and the mark is the same at every step of the 44 |
| `.pawn[data-movable="true"]` | Unchanged | The ring breathes, the mark does not. D49 |
| `.pawn[data-selected="true"]` | Unchanged | The mark scales with the piece to 1.14 for free |
| `.pawn[data-captured="true"]` | Unchanged | Scales to 0.82 and dims with the piece. D49 names the number |
| `.pawn:focus-visible` | Unchanged | The ring is outside the disc, the mark inside it, no overlap |
| `prefers-reduced-motion` | Nothing to add | The mark has no animation and no transition |
| Two-player match, seats 0 and 2 | Correct | Circle against square, which is the widest pair of the four shapes |
| Pieces sharing a field before a capture | Correct | The upper pawn takes `--layer-pawn-active` and its mark travels with it |
| No attribute on the span | Correct | It reads `data-player` off the pawn it is inside. Nothing is asked for |

**Stacking, since it is the one thing that could have needed an extra element.** `::after` is the disc
and `::before` is the ring, both at `z-index: auto`, so paint order decides and `::after` is painted
last of the three. The mark takes `z-index: 1` and sits over the face. One declaration, no wrapper.

---

## 6 What is still open

**Nothing this delivery needs.** The span exists, the attribute exists, and no new token was added.

**One thing worth doing in the next pass that opens `board.css`, and deliberately not done here.** The
seat-to-shape mapping is now in four stylesheets: `hud.css`, `chrome.css`, `overlay.css` and
`pawn.css`. `board.css` already has one bare `[data-player="N"]` block that every region and every
pawn takes `--player` from, and `--seat-shape` belongs in it, which would delete all four repeats. It
is not in this delivery because `board.css` has since been split into three files, a delivery that
touches it has to be read against the split rather than against a snapshot, and this answer is worth
more landed than bundled with a refactor.

**Still open from handoff 02, and no work here touched them:** D17, D21, D22, D23, D24. Fonts are
still loaded from Google Fonts, unchanged since spec 01 section 5.

**Handoff 05** is answered separately in
[05-spec-dice-pool-overlay.md](05-spec-dice-pool-overlay.md), delivered the same day. D43 to D47 are
closed there.
