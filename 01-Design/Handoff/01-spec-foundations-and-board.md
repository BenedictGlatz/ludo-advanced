# Spec 01: foundations and the board

**Claude Design to Claude Code.** Answers [01-brief-foundations-and-board.md](01-brief-foundations-and-board.md).
Written 2026-08-29. Issue #3 *Create Design System*, Sprint 2.

Five sections, per the template in [../README.md](../README.md). Section 2 answers D1 to D9 from the
brief and adds D10 to D12. Every answer names a reason and a rejected alternative.

---

## 0 Two things to read before the rest

**`src/core/board.js` does not exist.** The brief says the square indices in its section 4 are real
code that can be checked. They are not yet: neither `main` nor `dev` contains a `src/` directory, so
step 2 of the sprint plan has not landed at the time this spec was written. The geometry below was
therefore verified against section 2 of
[Game-Design-Document.md](../../00-Meta/Project-Management/Game-Design-Document.md) instead, which
states the same numbers. It checks out: 52 = 4 x 13, `E(p) = 13p` gives 0, 13, 26, 39, and
`T(p) = (E(p) + 51) mod 52` gives 51, 12, 25, 38. Section 2.1 of this spec shows the 52 grid cells
with those eight squares landing where the arithmetic says they must. **Re-check the mapping against
`board.js` when it lands.** If the two disagree, `board.js` is right and `board.css` changes.

**Read D3a first.** The board is no longer the one the brief describes. On request, matched against
the printed *Mensch ärgere Dich nicht* board, the track is **40 fields on an 11 by 11 grid at an
offset of 10**, not 52 at an offset of 13. Section 2.1 of the game design document and `board.js` both
change. Two further requested changes also depart from the brief: D2 drops the non-colour player
identifier, so NFR-12 is no longer answered as written, and D3 shortens the house to four fields. All
three are marked where they occur and all three need a decision outside this document.

**One constraint in section 2 of the brief makes a design impossible, and I am not working around
it.** It is written up as D10, because it needs a change to the DOM contract rather than a change to
the CSS. Short version: the contract shows pawns as children of `.board` but describes them as
"placed into a square by JS". If the view re-parents a pawn into the target square, the movement
transition of D8 cannot exist, because a CSS transition needs the same element to change position,
and re-parenting destroys and rebuilds it. The pawn has to stay a direct child of `.board`.

---

## 1 Files delivered

| Path | Contains | Lines |
| --- | --- | --- |
| `src/ui/styles/tokens.css` | Every token as a custom property on `:root`. Colour, spacing, typography, geometry, motion, layering. Both skins. | 133 |
| `src/ui/styles/board.css` | The 11 by 11 grid, the 40 track fields, the four yards, the four-field houses, slots and the empty-seat treatment. | 248 |
| `src/ui/styles/pawn.css` | The pawn and its five states, plus the movement transition. | 154 |
| `src/ui/styles/refusal.css` | The S6 refusal region. **A fourth file the brief did not ask for**, see the note below. | 38 |
| `Board Mockup.dc.html` | A rendered board for feedback. Not production code and not in `src/`. It loads the four real stylesheets, so what it shows is what the CSS does. | n/a |

No asset was needed, so `01-Design/assets/` stays empty. Both mechanical checks pass: the largest
file is 248 lines, and the only `content:` declarations in the four stylesheets are `content: ""`.

**Why there are four files and not the three the brief lists.** The refusal region started inside
`board.css`, which took that file to 307 lines and failed NFR-02. The brief says a file at the limit
is split along a real seam rather than compressed, so it was split at the seam that already exists in
the Obligations Book: S6 is a separate screen from S3, and `.move-refusal` sits outside `.board` in
the DOM contract. The alternative was to move the 52 `.square[data-square="N"]` grid placements out
instead. **Rejected**, because those 52 lines are the one part of `board.css` that has to be read
next to the geometry they implement.

---

## 2 The decisions

### D1 Colour palette

Four player colours, fixed hex values taken from the project's layout template:

| Seat | Token | Value, both skins | Reads as |
| --- | --- | --- | --- |
| 0 | `--color-p0` | `#FF5D5D` | red |
| 1 | `--color-p1` | `#FFC93C` | yellow |
| 2 | `--color-p2` | `#2FBF71` | green |
| 3 | `--color-p3` | `#4C86F9` | blue |

**The four seat colours come verbatim from the project's own layout template** (the 1a HUD-zones
board, revised into this handoff on 2026-08-29) and are identical in both skins: they are saturated
enough to sit on cream and on plum without adjustment, which is part of why the template chose them.
Surfaces are the template's two skins, D13. Ink `#3A2B55` outlines every card, pill and pawn.
**Rejected: re-deriving the seat colours in oklch with evenly stepped lightness**, which is what the
two earlier versions of this answer did and what D2 would prefer; it produces a palette measurably
better in greyscale and visibly not the one the project's template and tone references use. The
template wins and D2 records the cost. **Also rejected: per-skin seat colours**, tuned separately for
Picnic and Night In, which doubles every colour decision for a gain the shared values do not need. Signals use two hues no player owns:
violet `oklch(0.55 0.20 320)` for the legal-move highlight and focus, orange `oklch(0.56 0.16 42)`
for refusal.

**Reason.** Red, amber, green and blue are the Ludo colours a player already expects, so the board is
recognisable before anything is read. The four lightnesses are deliberately stepped 0.80, 0.68, 0.58,
0.44 rather than matched: that spread is what stops the palette from collapsing into two grey values
under the D2 test. Keeping the signal hues outside the player set means a highlighted square can
never be mistaken for a fifth player.

**Rejected: four colours at matched lightness**, which is the usual way to build a balanced palette
and would have looked calmer. It fails D2 on its own terms, because matched lightness is exactly what
greyscale destroys. **Also rejected: a colour-blind-safe palette of blue, orange, grey and purple**,
for example the Okabe-Ito set. It is measurably better for deuteranopia and it makes the board stop
looking like Ludo, which is a cost the game pays on every screen. NFR-12 is answered by D2 instead,
which covers every kind of colour loss including a black and white printout.

### D2 The player identifier, and an unanswered requirement

**Colour only. Four circular pawns, told apart by hue and by lightness.** Changed on request on
2026-08-29, after the first version answered this with a per-seat silhouette.

**This is the one place in the handoff where a requirement is no longer answered as written, so it is
stated here rather than absorbed.** NFR-12 asks for "a second, non-colour identifier" per player, and
section 6.8 of the game design document repeats it. A colour-only board has no second identifier.
What it still has is the acceptance criterion, which is narrower than the requirement: *a greyscale
screenshot still identifies whose pawns are whose.* That is met by lightness, and it is why the four
lightnesses are now the load-bearing part of the palette rather than a supporting one:

| Seat | oklch lightness | Greyscale rank |
| --- | --- | --- |
| 1 yellow `#FFC93C` | 0.85 | lightest |
| 2 green `#2FBF71` | 0.70 | second |
| 0 red `#FF5D5D` | 0.66 | third |
| 3 blue `#4C86F9` | 0.62 | darkest |

**The spread is no longer even and no longer comfortable.** The template colours put green, red and
blue within 0.08 of each other; only yellow stands clearly apart. Two supporting cues remain: every
pawn wears the same ink outline and eye face, so pawns are at least always distinguishable from
squares, and a pawn is on or next to its own tinted regions for most of its life. But a greyscale
screenshot of three mid-grey pawns on the shared track is now a genuinely hard read, and pretending
otherwise would be the kind of smoothing-over this project's reports get marked down for.
**`greyscale.spec.js` may fail against this palette.** If it does, the options are, in order: darken
`#4C86F9` and lighten `#2FBF71` a step (small, visible only side by side), or reinstate a non-colour
identifier. Both are Product Owner territory via row 8, which D2 already sends there.

**What was lost, said plainly.** Lightness is a weaker carrier than shape in three cases the
silhouette covered: a pawn overlapping another during a capture, a pawn on a home-column square
already tinted in its own colour, and any output where the greys compress, such as a photocopy or a
projector with the contrast turned up. Shape survived all three, lightness survives none of them
completely.

**Reason for doing it anyway.** It was asked for, and the argument for it is real: four pawn shapes
make the board look like four different games sharing a track, and the reference the design is now
oriented on is a colour board. A weaker answer that the team actually wants is worth more than a
stronger one it works around.

**Rejected: keeping the shapes.** Named because it was the previous answer and it is the one that
satisfies NFR-12 literally. **Also rejected: a numeral on each pawn**, which would restore a true
second identifier. It puts a player-facing character in the CSS or a text node in every pawn, which
NFR-03 forbids in the first case and D6's board size makes unreadable in the second.

**Row 8 of the sign-off table is now a question, not an answer.** It should go to the Product Owner
as: *the design answers the acceptance criterion by lightness and does not provide a non-colour
identifier; confirm NFR-12 as met, or reinstate a second identifier.* Filling it in as answered would
misreport what was delivered.

### D3 Board grid geometry

**An 11 by 11 grid, and a 40-field track.** Revised on request on 2026-08-29 against the printed
*Mensch ärgere Dich nicht* board: an arm's outer row must show **five** fields. Each arm is 3 cells
wide and 4 cells long, each corner is a 4 by 4 yard, and the centre is a 3 by 3.

**The four corners of the centre are track fields, and they are what makes the ring continuous.** An
arm's outer row does not stop at the centre, it turns there: the corner field belongs to that row and
is simultaneously the first field of the next arm's inner row. Without it the four arms are four
separate strips. With it the track is one closed loop of `4 x (4 + 1 + 4 + 1) = 40` fields, and an
arm's outer row shows exactly five, four in the arm plus the corner it turns on.

The player offset is therefore **10**, entry fields are 0, 10, 20, 30 and turn-off fields are 39, 9,
19, 29. Travel is clockwise. Index 0 is player 0's entry field.

| Index range | Cells, row / column, 1 based |
| --- | --- |
| 0 to 3 | row 5, columns 1 to 4 |
| 4 | row 5, column 5, inner corner |
| 5 to 8 | column 5, rows 4 down to 1 |
| 9 | row 1, column 6 |
| 10 to 13 | column 7, rows 1 to 4 |
| 14 | row 5, column 7, inner corner |
| 15 to 18 | row 5, columns 8 to 11 |
| 19 | row 6, column 11 |
| 20 to 23 | row 7, columns 11 down to 8 |
| 24 | row 7, column 7, inner corner |
| 25 to 28 | column 7, rows 8 to 11 |
| 29 | row 11, column 6 |
| 30 to 33 | column 5, rows 11 down to 8 |
| 34 | row 7, column 5, inner corner |
| 35 to 38 | row 7, columns 4 down to 1 |
| 39 | row 6, column 1 |

The eight marked fields land as required: entries 0, 10, 20, 30 at cells (row 5, col 1),
(row 1, col 7), (row 7, col 11), (row 11, col 5); turn-offs 39, 9, 19, 29 at the four arm tips, each
directly against its owner's house.

**The house fits its arm exactly.** An arm's middle lane is 4 cells long plus the centre edge cell,
and one of those five is the turn-off field, so the house is the remaining four. No leftover cells and
no hub stubs, which the 15 by 15 version had four of.

| Seat | Position | Yard, 4 by 4 | House, 4 fields |
| --- | --- | --- | --- |
| 0 | west | rows 1 to 4, cols 1 to 4 | row 6, cols 2 to 5 |
| 1 | north | rows 1 to 4, cols 8 to 11 | col 6, rows 2 to 5 |
| 2 | east | rows 8 to 11, cols 8 to 11 | row 6, cols 10 down to 7 |
| 3 | south | rows 8 to 11, cols 1 to 4 | col 6, rows 10 down to 7 |

**The yards are 4 by 4 and sit flush in the corners**, with the four waiting fields as a 2 by 2
cluster in the middle of the yard (cells `(2,2)`, `(3,2)`, `(2,3)`, `(3,3)` for seat 0). On the 11 by
11 grid the corner region *is* 4 by 4, so the yard fills it exactly and the one-cell inset the 13 by
13 version had is gone: there is no cell to inset into. **Rejected: a 3 by 3 yard** with the four
slots packed tighter, leaving a ring of board around it, which reads as a piece placed on the board
rather than as part of it and makes the waiting pawns noticeably smaller than the moving ones.
**Also rejected: four loose fields with no yard block**, closest to the printed board, where the four
circles simply sit in the corner; the block carries the seat colour, and without it a 2 or 3 player
board loses the empty-seat treatment of this same decision.

House step 1 is always the field against the turn-off square and step 4 the last one, on all four
sides. `board.css` gets this from flex direction, not from four separate placements.

**The house is four fields, and there is no separate home area.** Changed on request on 2026-08-29. A
pawn's final resting place is the fourth field of its own house, one field per pawn. The centre 3 by 3
is not a home region and not empty either: four corners are track, four edges are house end fields,
and only cell (6, 6) holds nothing. See D15.

**This changes the rulebook, not just the CSS.** Section 2.3 of the game design document says the home
column is 5 squares and a pawn's journey is 58 steps.
With a 40-field track and a 4-field house it is **40 + 4 = 44**, and `r` runs 0 to 44:

| `r` | Where the pawn is |
| --- | --- |
| 0 | yard |
| 1 to 40 | shared track, absolute index `(10p + r - 1) mod 40` |
| 41 to 44 | house fields 1 to 4; `r = 44` is home |

`board.js` needs `TRACK_LENGTH = 40`, `OFFSET = 10`, `HOME_COLUMN_LENGTH = 4` and `HOME_R = 44`, and
the win condition of FR-05 becomes all four pawns at `r = 44`. **Section 4 of the brief says these numbers are non-negotiable and were
not invented in the brief, so this is a request to change the game design document and not something
the design can decide.** It is implemented in the CSS as asked so that the look can be judged; treat
it as blocked on that document until section 2.3 is updated.

**Rejected: keeping 5 fields and deleting only the centre**, so that field 5 is the home field. It
keeps the 58-step journey and the rulebook intact, and it leaves the house one field longer than the
number of pawns it holds, which is the thing the centre area used to explain. **Also rejected: 4
fields plus a shared centre home**, the classic arrangement, which is what was delivered first and
what the change asked to remove.

**Two and three player boards.** Two players use seats 0 and 2, which are opposite. Three use seats
0, 1 and 2. **Unused seats stay on the board and are drained**: the corner keeps its 6 by 6 footprint
and its four slots, loses its fill, keeps a hairline outline and a grey watermark, and its entry and
turn-off markings go grey. Nothing moves.

The two markings are drained **by CSS, not by the view**. `data-entry-of` and `data-turnoff-of` are
properties of the 52-square topology and are present on all eight squares whatever the seat count, so
`board.css` matches them under `.board[data-players="2"]` and `.board[data-players="3"]` and swaps
`--marked` for the dormant grey. **Rejected: having the view omit the attribute** for an unseated
player, which is one line of JavaScript instead of six selectors. It makes a fact about the board
depend on who is playing, and section 2 of the brief requires every state to be reachable by CSS
selector alone.

**Reason.** A drained seat is visibly a seat with nobody in it, which is the "deliberate rather than
broken" the brief asks for. Keeping the footprint also keeps the geometry constant: the same 52
squares sit in the same cells in a 2, 3 and 4 player match, so `board.css` needs no per-count layout
and the Playwright selectors do not change with player count.

**Rejected: collapsing empty seats** and rebalancing the cross into a smaller board, which uses the
space better and is what a fresh design would do. It makes the track geometry depend on player count,
which means three grid mappings instead of one and three sets of E2E expectations. **Also rejected:
hiding the empty corner entirely**, which reads as a rendering bug: a Ludo board with a missing
corner looks broken, which is the exact failure the brief names.

### D3a Five fields per row, and the 40-field track

**Asked for three times, and the first two answers were wrong in the same way.** It is worth recording
why, because the mistake is easy to repeat: I kept treating the count as a sizing problem and shrank
the arm, when it was a *topology* problem.

| Attempt | Change | Row count | Why it failed |
| --- | --- | --- | --- |
| 1 | 15 by 15, 52 fields, arms 6 long | 7 | Six arm fields plus a centre corner field |
| 2 | 13 by 13, 44 fields, arms 5 long, centre emptied | 6, still not 5 | Removing the centre corners **broke the ring**: four arms, not a loop |
| 3, current | 11 by 11, 40 fields, arms 4 long, centre corners are track | **5** | Correct |

**What the reference actually shows.** An arm's outer row does not end at the centre, it *turns* at
the centre. The corner cell of the centre 3 by 3 is an ordinary field, it belongs to that row, and it
is simultaneously the first field of the next arm's inner row. That single field is the hinge, and it
is what the second attempt deleted. A row is 4 arm fields + 1 corner = **5**, and the loop closes:
`4 x (4 + 1 + 4 + 1) = 40`.

**40 is the real *Mensch ärgere Dich nicht* length**, which the second attempt dismissed on bad
arithmetic. I checked `2n + 1 = 10` for an arm, found no integer solution and concluded 40 was
impossible with symmetric arms. The formula was wrong: it counts an arm as two rows plus a tip and
forgets that the corner field is *shared* between adjacent arms. The correct count per arm is
`2n + 2` with `n = 4`, giving 10 and `4 x 10 = 40`. The board is fully symmetric, every player walks
the same distance, and the number matches the physical game.

**What this contradicts.** Section 2.1 of the game design document, reproduced as non-negotiable in
section 4 of the brief:

| Was | Now |
| --- | --- |
| 52 track fields | **40** |
| Offset 13, entries 0 / 13 / 26 / 39 | **Offset 10**, entries 0 / 10 / 20 / 30 |
| Turn-offs 51 / 12 / 25 / 38 | **39 / 9 / 19 / 29** |
| Journey 58 steps | **44** (40 track + 4 house) |
| 15 by 15 grid | **11 by 11** |

Section 2.1 argued for 52 on two grounds: 4 x 13 symmetry, and being the classic Ludo length. **40
keeps both**: 4 x 10 is equally symmetric, and 40 is the classic length of the German game this
project is named after, where 52 is the British Ludo figure.

**The balance consequence is real and is not a design decision.** The journey drops from 58 steps to
44, a quarter shorter. A D20 now covers nearly half the track in one roll, so section 5.2's trade-off
between exit probability and speed changes materially, and the dice pool in section 5 should be
re-derived rather than carried over. **That is for the Product Owner.**

`board.js`, `movement.js` and section 2 of the game design document change together. The 40 cells were
generated from one arithmetic construction and `board.css` and the mockup were emitted from that same
source, so they cannot disagree with each other.

**Rejected: keeping 52 and living with seven fields per row**, the brief's own answer, which needs no
rulebook change and was rejected three times by the person who owns the brief. **Also rejected: 44 on
a 13 by 13 grid**, the previous attempt, which is closer to 52 and therefore a smaller rulebook
change, and which cannot show five fields per row without breaking the loop, which is the whole reason this
decision exists.

### D4 Spacing scale

Two scales, deliberately separate.

**Inside the board, the only unit is `--cell`**, which is `--board-size / 15`. Every margin, radius,
border and pawn size is a multiple of it. **Outside the board**, an eight-step scale in rem:
`--space-1` 0.25rem through `--space-8` 4rem, on a 4 px base.

**Reason.** The board is one object that scales as a whole, so a fixed pixel gap inside it would grow
proportionally wrong as the board changes size: at a small board a 4 px square margin is a quarter of
the gap between squares, at a large one it is a hair. Tying board internals to `--cell` makes the
board resolution independent by construction, which is what D6 requires. Chrome around the board is
not part of that object and follows text, so it uses rem and inherits browser zoom.

**Rejected: one scale for everything**, the usual approach and simpler to remember. It forces one of
the two to be wrong: either the board stops scaling cleanly, or the chrome starts scaling with the
board and text-adjacent spacing drifts away from the text. **Also rejected: a modular scale** at a
1.25 ratio, which produces better typographic rhythm and worse arithmetic; a board built on halves
and quarters of a cell wants a scale that divides evenly.

### D5 Typography

**Baloo 2 for headings and buttons, Nunito for names, body and labels**, from the layout template:
Baloo 2 at 800, Nunito at 600/700, Nunito 800 caps for counters and zone labels. Revised on
2026-08-29; the first version of this answer was a system stack.

**Reason.** The template already made this decision and the tone the project now wants cannot be hit
with a system stack: round, heavy, toy-like type is most of what makes the chrome read as a party
game rather than a utility. The board itself still renders no text, so the font cost is paid only by
the chrome. The mockup loads both families from Google Fonts; **production should self-host the two
files** (both are OFL-licensed), because a third-party request on every page load is the thing the
original system-stack answer existed to avoid. That is a bootstrap task, one-time, two woff2 files.

**Rejected: the system stack**, the previous answer, kept as the fallback in every font token. It
costs nothing and it cannot look like the template. **Also rejected: Baloo 2 for everything**, which
is rounder still; at body sizes it gets hard to read and Nunito is the template's own body choice.

### D6 Target resolution and board size

**There is no target resolution, and that is the answer rather than a dodge.** The board is a single
fluid unit:

```css
--board-size: clamp(28rem, min(76vh, 56vw), 66rem);
--cell: calc(var(--board-size) / 11);
```

Everything inside the board is a multiple of `--cell`, so the board is one object that scales.
`min(76vh, 56vw)` is the load-bearing part: the board takes at most 76% of the viewport height, which
leaves the strip above and below for the HUD and the refusal region, and at most 56% of the width,
which leaves 44% for the two side columns holding the dice hand and the skill hand. Raised from
`min(72vh, 50vw)` on 2026-08-29 to make the individual fields larger; **this is the number to check
first** when the two hands are actually built, because it is now the tighter of the two reservations. That is FR-31's five regions
expressed as a constraint on one number instead of as a fixed pixel layout.

Two numbers are still stated, because "fluid" without bounds is not a specification.
**`--board-min-width: 80rem` and `--board-min-height: 45rem`** are the smallest viewport at which the
five regions fit without scrolling, which is 1280 by 720 at default text size. Below that the layout
is out of spec and NFR-10 does not require it. The design was drawn at 1920 by 1080, which is where
the mockup screenshots come from.

Hi-dpi needs no separate answer: everything here is CSS pixels, `clamp`, `rem` and `oklch`, with no
raster asset and no SVG anywhere in the delivery, so there is nothing that can be the wrong
resolution.

**Reason.** The brief records that this was never agreed, and picking a number now would agree it by
accident. A fluid unit answers the requirement FR-31 actually states, which is that five regions are
visible at once, without also inventing the monitor they are visible on.

**Rejected: pinning the design to 1920 by 1080**, which is the most common desktop resolution and
would make every size in the design a fixed number that can be checked. It breaks on the 1366 by 768
laptops that are still the second most common desktop size, it breaks at 125% Windows scaling, which
is the default on many machines, and it wastes a 1440p or 4K monitor. **Also rejected: three
breakpoints** at 1366, 1920 and 2560. It is three layouts to maintain, three sets of screenshots for
the review round in step 9, and it still snaps at a boundary that some real monitor sits on.

### D7 The five states

| Selector | Treatment |
| --- | --- |
| `.square[data-legal-target="true"]` | Violet fill at low chroma, a 2 px violet inset ring, and an outer glow that pulses over 1200 ms. |
| `.pawn[data-movable="true"]` | Unclipped violet outer ring at 45% strength, breathing over the same 1200 ms cycle. |
| `.pawn[data-selected="true"]` | Scale 1.12, solid violet ring at full strength, lifted shadow, animation stopped. |
| `.pawn[data-captured="true"]` | Scale 0.82, opacity 0.65, orange ring, and the longer capture transition. |
| `.board[data-active-player="N"]` | That seat's own yard takes a heavy ink frame, and every pawn not belonging to it drops to opacity 0.85. |

**The legal-target highlight, since FR-32 depends on it.** The hard case is six squares highlighted
at once, which happens whenever several pawns can move. The highlight is therefore built to read as
one set rather than as six separate alerts: all six share one hue, one ring weight and one animation
cycle running in phase, so the eye groups them. The pulse is on the outer glow only, so the squares
do not appear to change size. A pawn that can move carries the same violet at lower strength, which
is what ties a movable pawn to the squares it can reach without drawing a line between them.

**No violet on an entry square.** Changed on request on 2026-08-29. An entry square is the one square
whose own colour a player has to be able to find, so when it is also a legal target it keeps its
owner's fill and takes the highlight as a ring only. One rule does it, so the exception cannot drift
from the base treatment. **Rejected: highlighting it in violet like any other square**, which is
simpler and one selector shorter, and which hides the seat colour at exactly the moment the player is
deciding whether to bring a pawn out. **Also rejected: not highlighting entry squares at all**, which
would make leaving the start area the one legal move FR-32 does not show.

**Entry and turn-off squares are marked, and differently from each other.** An entry square is filled
at 36% of its owner's colour with a full ring. A turn-off square carries a bar in its owner's colour,
**and the bar sits against the board edge that square sits on**: left for seat 0, top for seat 1,
right for seat 2, bottom for seat 3. Changed on request on 2026-08-29; it used to be along the bottom
on all four. The bar now points out of the board on the outward side and the house is on the other,
so the square reads as the corner the lap turns at. **Rejected: one direction for all four**, which is
one rule instead of four and makes the bar look like a shadow on three of the four arms. **Reason:** they answer two different player questions,
"where do my pawns come out" and "where do I leave the track", and a player asks the second one under
time pressure late in a match. **Rejected: leaving both unmarked**, which is cleaner and is what many
Ludo boards do; it makes a first-time player count squares to find their turn-off, and the brief's own
NFR-08 standard is that a player should not have to be told.

**The active-seat signal sits on the yard, not on the board frame.** Changed on request on 2026-08-29.
The frame version was an inset ring in the seat's colour; because the four yards sit flush against the
board edge, the ring showed through the seams between them and ran against the 4px ink outline at the
rounded corners, which read as a stray red line rather than as a signal. It is now a **thicker ink
frame on the active seat's own yard**, drawn inward so it has nowhere to bleed, and it answers "whose
turn" in the same place a player looks for their own pawns. **Rejected: an outward halo** around the
active yard, which is more visible and has no room: the yard is flush with the board edge, so the halo
would sit on the frame and on the neighbouring track fields. The yard is now inset one cell (D3), so
this is worth revisiting at the review round. **Also rejected: tinting every track field**
for the active seat, the loudest option, which repaints the whole board every turn.

**A start slot is a field.** The four waiting positions in a yard use the `.square` treatment exactly,
so a pawn stands on the same kind of thing for its whole life. The cream inner tray that used to hold
them is gone: once the slots are drawn as fields, the tray was a second frame around nothing.
**Rejected: keeping the circular slots**, which distinguish "waiting" from "on the track" and which
made the yard three frames deep and the waiting pawns look like they were on a different board.

**Rejected for the highlight: using the active player's own colour** for the legal squares, which is
the obvious choice and ties the highlight to whose turn it is. It fails when the highlighted square is
an entry or home-column square already tinted in that colour, so the strongest signal on the board
would be least visible exactly where it matters. **Also rejected: dimming everything except the legal
squares**, which is the most unmistakable treatment of all. It changes the appearance of all 52
squares for a transient state, so the board flickers on every roll, and it cannot be combined with the
active-player dimming above without one of the two becoming unreadable.

### D8 Movement animation

| Token | Value | Applies to |
| --- | --- | --- |
| `--motion-feedback` | 90 ms, `cubic-bezier(0.2, 0, 0, 1)` | Every state change: selection, highlight, refusal, board edge. |
| `--motion-move` | 240 ms, `cubic-bezier(0.34, 1.1, 0.64, 1)` | The pawn's `transform`, one move. |
| `--motion-capture` | 320 ms, `cubic-bezier(0.55, 0, 0.85, 0.3)` | The captured pawn's return to its start area. |

**Reason.** NFR-11 is a budget on the *first* visible response, not on the whole animation, so the two
are separated. 90 ms is comfortably inside the 100 ms budget with room for a slow frame, and it covers
every state that a click produces. The move itself is 240 ms, which is long enough to see which pawn
went where on a board this size and short enough that a turn with several actions does not feel
queued. The easing overshoots slightly at the end, which makes a pawn look like it lands on a square
rather than sliding to a stop on it. The capture uses a fast-in easing and takes longer, because a
capture is the harshest event in the game and should read as something that happened to a pawn rather
than as a move it made.

**Rejected: animating the move square by square** along the path, which is what a physical Ludo player
sees and would make the count legible. At 240 ms per square a roll of 14 on a D20 takes 3.4 seconds,
and the pool contains two D20s, so the common case would be the slow one. **Also rejected: a single
duration for everything**, one token instead of three. It forces a choice between missing the 100 ms
budget on feedback and making the move too fast to follow.

### D9 The refusal reason

**A strip directly under the board, in the layout flow, always present as reserved space.**
`.move-refusal`, in `refusal.css`, styles the container; i18next writes the text; the view sets `data-reason-key` to show
it and removes the attribute to hide it. It appears within `--motion-feedback`, fading and rising 8 px
in 90 ms, in orange on a warm tint with a solid orange dot at the left. It stays until the player's
next action, and at minimum for 4 seconds. The four reason keys of FR-14 all render in the same place
with the same treatment.

**Reason.** NFR-08's acceptance criterion is that a playtester can state why a move was refused
without being told, which is a question about attention and not about wording. Two things follow. It
has to be somewhere the player is already looking, which is directly under the board and not in a
screen corner. And the space has to be reserved rather than inserted, because a strip that pushes the
board down on every refusal moves the thing the player is looking at, which costs more attention than
the message gains. Orange is the only warm signal colour in the palette and belongs to no seat, so a
refusal cannot be misread as a player's own colour.

**Rejected: a modal dialog**, which guarantees the message is read and guarantees it is dismissed
without being read after the third time. It also stops the game to deliver information about something
that did not happen. **Also rejected: a toast in a screen corner**, which is the cheapest to build and
the standard pattern. It appears outside the region the player is watching during a move, so a fast
player misses it entirely, and the acceptance criterion is written about exactly that player.

### D10 Pawn positioning, and a required change to the DOM contract

**This is the one place a constraint made the design impossible, so it is written down instead of
worked around.**

Section 3 of the brief shows `.pawn` as a direct child of `.board`, with the comment "placed into a
square by JS". Read as re-parenting, that makes D8 impossible: a CSS transition needs one element to
change position over time, and moving a node to a new parent destroys layout continuity, so the pawn
would disappear from the old square and appear in the new one with no motion between them. No CSS can
recover this, and it is the reason the DOM-in-a-grid decision was taken in the first place.

**What is needed instead**, added to the contract:

```html
<div class="pawn" data-player="0" data-pawn="0" data-r="7"
     style="--pawn-col: 3.5; --pawn-row: 6.5"></div>
```

The pawn stays a direct child of `.board` for its whole life. The view sets two custom properties, the
fractional cell coordinates of the pawn's centre measured from the board's top left corner, and
changes only those two values when the pawn moves. `pawn.css` turns them into a `transform`, which is
transitionable and compositor-friendly.

The view computes the pair from `data-r` and the seat, using the mapping in D3:

| `r` | Cell |
| --- | --- |
| 0 | start slot `k`, at the corner origin plus (1, 1), (4, 1), (1, 4) or (4, 4) |
| 1 to 52 | track index `(13p + r - 1) mod 52`, then the table in D3 |
| 53 to 56 | house field `r - 52` |

A cell at column `c` and row `t`, both 1 based, has centre `--pawn-col: c - 0.5` and
`--pawn-row: t - 0.5`.

**Reason.** It is the smallest change that makes the animation possible, it keeps every other part of
the contract intact, and the `.slot` elements stay in the markup as visual receptacles, so nothing in
the brief is deleted. **Rejected: keeping the re-parenting and animating with FLIP**, measuring the
old and new positions in JavaScript and animating the difference. It works, and it puts animation code
in `ui/` for a project that decided animation would be a CSS token. **Also rejected: `view-transition`
API**, which is the modern answer to exactly this problem and is not supported in the Firefox versions
NFR-10 requires.

### D11 Keyboard focus

Desktop only rules out touch, not the keyboard. `.pawn:focus-visible` gets a violet ring with a white
outer ring, so it is visible on every square colour. It is distinguishable from `data-selected` in
weight and from `data-movable` in that it does not animate.

**Reason.** The ring is four lines of CSS and it is the difference between the game being operable
without a mouse and not. Adding it later means revisiting every interactive element. **Rejected:
leaving the browser default outline**, which costs nothing and disappears against the darker player
colours and the tinted home column squares.

### D12 Reduced motion

`prefers-reduced-motion: reduce` collapses `--motion-move`, `--motion-capture` and `--motion-pulse` to
1 ms or 0. `--motion-feedback` is untouched, and every state ring stays exactly as it is.

**Reason.** The pulse and the breathe loop are the two things in this design that run without the
player doing anything, which is the case the media query exists for. The information they carry lives
in the ring itself, not in the loop, so the loop can stop without any state becoming invisible.
**Rejected: disabling all transitions** under the query, the common one-line implementation. It also
removes the 90 ms feedback transition, so the interface starts snapping instead of responding, which
is not what the setting asks for.

### D13a Contrast, both skins

**Revised on request on 2026-08-29.** The first pass gave Picnic an off-white board on a cream shell
with hairline tile edges, which measures as contrast and disappears as a board: nothing separated the
playing surface from the page, and the tile grid read as a texture rather than as 52 places a pawn can
stand. Three changes, applied to both skins so they stay one design:

| Was | Now |
| --- | --- |
| Shell and board within a few percent of each other | Picnic shell is tan `#E9D3AE`, board `#FFFCF3`. Night In shell `#2A1E3F`, board `#3B2C53`. |
| Tile edge a muted tint of the surface | Tile edge is **ink**: `#3A2B55` in Picnic, `#1C1230` in Night In |
| `--border-hair` 1.5px, `--border-board` 3px | 2px and 4px, both cell-proportional above that |

House fields and entry squares also went up: a house field is 55% of the seat colour rather than a
pale tint, and an entry square is the seat colour at full strength. The outline is now the same weight
and the same ink on every field, so the board reads as one printed lattice rather than as tiles of
varying importance.

**Reason.** The tone references get their legibility from outline weight, not from fill contrast: they
are flat saturated colour separated by heavy dark lines. Reproducing that means the outline has to be
ink rather than a tint, and once it is, the fills can stay bright without the board turning into
noise.

**Rejected: dropping Picnic and shipping only Night In**, which is the skin the critique preferred and
which would halve the colour work. Two skins are already built and the template names both, and a
party game played in a lit room wants the light one. **Also rejected: raising fill contrast instead**,
darkening the tiles toward grey, which fixes the measurement and moves the design away from the flat
bright look the whole tone rests on.

### D13 Dark mode: the two skins

**Picnic (light) and Night In (dark plum), named as in the layout template.** `:root` declares `color-scheme: light dark`, so left
alone the board follows the operating system. A `data-theme` attribute on `<html>` overrides it:
`light`, `dark`, or absent for automatic. Every colour token is one `light-dark()` pair, so a token
still has exactly one definition and both themes come out of it.

```css
--color-square: light-dark(oklch(0.955 0.005 84), oklch(0.295 0.008 84));
```

Nothing outside `tokens.css` changed. `board.css`, `pawn.css` and `refusal.css` reference tokens and
never a literal colour, which is what makes a second theme 26 edited lines instead of a second
stylesheet. Three things were re-decided rather than inverted:

- **The four seat colours do not change between skins.** They are single hex values, not
  `light-dark()` pairs, because they are saturated enough to sit on cream and on plum unaltered. That
  is D1, and it means a greyscale run against one skin is a run against both.
- **Ink stays dark in both skins.** `--color-ink` is the outline on every card, pill and pawn, and its
  job is separating a piece from the surface under it. A light outline on a plum board makes every
  pawn glow instead.
- **Signal colours get lighter and their soft variants get darker**, violet and orange both, because
  on a plum board a mid-lightness accent stops being an accent.

**Reason for `light-dark()` over a duplicated override block.** A `:root[data-theme="dark"] { ... }`
block plus a `@media (prefers-color-scheme: dark)` copy of the same block is the usual
implementation and it states every dark value twice, so the two drift the first time one is edited.
`light-dark()` keeps a token to one line and puts the manual override on `color-scheme`, which is a
single declaration. It is supported in the current and previous major versions of Chrome, Firefox and
Edge, which is exactly the browser set NFR-10 names, so it costs nothing here that it would cost on a
wider support matrix.

**Rejected: a second stylesheet, `theme-dark.css`**, loaded conditionally. It is the version that
needs no new CSS feature. It doubles the number of files a colour decision touches and it makes the
theme a loading question rather than a token question. **Also rejected: automatic only**, following
the operating system with no override. It is less code and it is wrong for a game: a player on a
bright monitor in a dark room, or the other way round, has a preference for this screen that has
nothing to do with their system setting, and hot-seat play means several people share the screen.

**What this does not cover.** `--shadow-color` goes to 50% black in dark, which is a guess that has
not been seen on a real monitor. The dark board has not been through the greyscale test either; the
ranking argument above says it should pass, and step 6's `greyscale.spec.js` should run in both
themes rather than trusting that.

### D15 The centre, superseded by D3a

**Two earlier answers here were both wrong**, and the sequence is worth keeping because it explains
the current one.

1. A single decorative panel filling the centre 3 by 3. Rejected on request: it was the largest object
   on the board and the only one that was not a field.
2. Four ordinary fields in the corners of the centre, the rest empty. Closer, but they were treated as
   decoration with no index, which is why attempt 2 of D3a felt free to delete them.
3. **Current, per D3a:** the centre 3 by 3 is not one region at all. Its four corners are *track
   fields* carrying real indices 4, 14, 24 and 34, its four edge cells are the last field of each
   house, and only the middle cell (6, 6) is empty. Nine cells, three different jobs.

No `.square--hub` element exists and the DOM contract gains nothing from this decision.

---

## 3 Token reference

Abbreviated to one row per group; the file is the reference.

| Token | Value | For |
| --- | --- | --- |
| `--color-p0` to `--color-p3` | `#FF5D5D` `#FFC93C` `#2FBF71` `#4C86F9` | Seat colours and the only player identifier (D1, D2) |
| `--color-p0-soft` to `--color-p3-soft` | oklch, lightness 0.94 to 0.96 | Region fills |
| `--color-board-bg`, `--color-square`, `--color-square-edge` | warm neutrals, hue 84 | Board surfaces |
| `--color-text`, `--color-text-muted` | `oklch(0.29 0.012 80)`, `oklch(0.54 0.010 80)` | Text |
| `--color-hint`, `--color-hint-soft`, `--color-focus` | violet, hue 320 | Legal target, movable, selected, focus (D7, D11) |
| `--color-warn`, `--color-warn-soft` | orange, hue 42 | Refusal (D9), captured pawn |
| `--color-dormant`, `--color-dormant-soft` | grey, hue 84 | Empty seats (D3) |
| `--color-ink`, `--ink-dim` | `#3A2B55` and its 22% tint | Outlines and hard shadows (D14) |
| `--font-display` | Baloo 2 stack | Headings and buttons (D5) |
| `--shadow-color` | 14% warm ink in light, 50% black in dark | Every shadow (D13) |
| `--space-1` to `--space-8` | 0.25rem to 4rem | Chrome spacing (D4) |
| `--font-ui`, `--font-num` | system stacks | Typography (D5) |
| `--text-xs` to `--text-xl` | 0.75rem to 1.625rem | Type scale |
| `--board-size` | `clamp(26rem, min(72vh, 50vw), 60rem)` | The one board dimension (D6) |
| `--cell` | `--board-size / 15` | The only unit inside the board (D4, D6) |
| `--pawn-size`, `--slot-size`, `--pawn-scale` | 0.76, 0.80 and 1 cell | Pieces |
| `--board-min-width`, `--board-min-height` | 80rem, 45rem | Smallest in-spec viewport (D6) |
| `--radius-sm` to `--radius-lg`, `--radius-pill` | 0.14 to 0.40 cell | Corners |
| `--border-hair`, `--border-thick`, `--border-board` | 1px, 0.06 cell, 0.08 cell | Edges |
| `--shadow-board/-piece/-region/-lift/-card` | hard offsets, never blurred | Depth (D14) |
| `--motion-feedback`, `--motion-move`, `--motion-capture`, `--motion-pulse` | 90, 240, 320, 1200 ms | Motion (D8) |
| `--ease-ui`, `--ease-move`, `--ease-capture` | cubic-beziers | Motion (D8) |
| `--layer-square` to `--layer-refusal` | 1 to 5 | Stacking |

---

## 4 Component states covered

Walked against section 3 of the brief.

| Contract element or state | Styled in | Note |
| --- | --- | --- |
| `.board` | board.css | 11 by 11 grid, fluid via `--cell` (D3a) |
| `.board[data-players="N"]` | board.css | 2 and 3 player empty-seat treatment (D3) |
| `.board[data-active-player="N"]` | board.css, pawn.css | That seat's yard takes a heavy inset ink frame; other seats' pawns drop to 0.85. The board edge carries no seat colour, see D7 |
| `.square.square--track` | board.css | All **40**, placed by `data-square` (D3a) |
| `.square[data-entry-of="N"]` | board.css | Marked, all four (D7) |
| `.square[data-turnoff-of="N"]` | board.css | Marked differently, all four (D7) |
| `.square.square--home-column` | board.css | Tinted with the owner's colour |
| `.square[data-legal-target="true"]` | board.css | Violet ring and pulse (D7, FR-32) |
| `.start-area[data-player="N"]` | board.css | All four, 4 by 4 seat-coloured block flush in its corner, four field-styled slots in a 2 by 2 cluster |
| `.slot[data-slot="N"]` | board.css | Four per start area |
| `.home-column[data-player="N"]` | board.css | **Four** fields, step 1 against the track, all four sides |
| `.home[data-player="N"]` | not styled | **Removed from the contract**, see D3 |
| `.pawn[data-player="N"]` | pawn.css | Colour from the seat mapping (D2) |
| `.pawn[data-movable="true"]` | pawn.css | Breathing violet ring |
| `.pawn[data-selected="true"]` | pawn.css | Scale, solid ring, lift |
| `.pawn[data-captured="true"]` | pawn.css | Shrink, dim, orange ring, longer transition |
| `.pawn:focus-visible` | pawn.css | Added, D11 |
| `.move-refusal[data-reason-key]` | refusal.css | Shown by the attribute, hidden by its absence (D9) |
| `.pawn` position | pawn.css | Requires the D10 contract change |

Nothing in the contract is unstyled. One thing was added to it, D10; one thing was removed from it,
`.home` per D3; the field count dropped from 52 to 40 per D3a; and two states were added that the
contract does not have, D11 and D12.

---

## 5 What is still open

- **The D10 contract change needs an answer before `board-view.js` is written.** Everything else in
  this delivery works without it; the movement animation does not.
- **The mapping in D3 can no longer be verified against the game design document**, because it
  deliberately departs from it. The 40 cells were generated from one arithmetic construction and the
  CSS and the mockup were emitted from that same source, so they cannot disagree with each other. They
  can and do disagree with section 2.1. What they *were* checked against is the rendered board: 40
  track fields, 16 house fields, a continuous ring, five fields in every arm's outer row, and exactly
  one empty cell at the centre.
- **NFR-12 is not answered as written.** D2 has the detail. Row 8 of the sign-off table needs a
  Product Owner decision, not a design one.
- **The 40-field track contradicts section 2.1 of the game design document, and it is the biggest open
  item in this delivery.** D3a has the arithmetic, the two wrong turns that preceded it, and the
  balance consequence. `TRACK_LENGTH`, `OFFSET`, `HOME_COLUMN_LENGTH` and `HOME_R` are all in dispute
  until section 2 is rewritten, and the dice pool in section 5 should be re-derived against the
  44-step journey rather than adjusted.
- **The greyscale test has not been run.** It cannot be, until something renders in a browser under
  Playwright. `Board Mockup.dc.html` is a rendered board and is good enough to judge the design by
  eye, and it is not the test. It matters more now that D2 is colour only. Step 6 of the plan writes `greyscale.spec.js`; treat D2 as proposed
  until it passes.
- **The legal-target highlight has not been seen with six squares lit at once on a real board.** The
  mockup shows it and the mockup chooses its own six. This is the first question for the review round
  in step 9.
- **The five-region layout is asserted, not built.** D6 reserves the space with `min(72vh, 50vw)`, but
  the dice hand, the skill hand and the HUD do not exist, so nothing has been placed in the space that
  was reserved. If any of the three needs more than a quarter of the width, `--board-size` changes and
  nothing else does.
- **FR-12 is still unsigned**, and the brief is right that it is the one that could reach this
  delivery. If it were overridden toward blocking, a square would need a sixth state, something like
  `data-blocked="true"`. It would be a variant of the refusal treatment in D9 and would not disturb
  D1 to D8.
- **Dark mode is untested against NFR-12.** `greyscale.spec.js` should run twice, once per theme.
  The seat lightness ranking is the same in both, so it should pass; that is an argument, not a run.
- **Baloo 2 and Nunito are loaded from Google Fonts in the mockup only.** Production self-hosts two
  woff2 files; that belongs to the bootstrap issue. Until then `src/` has no font asset.
- **The mockup's skin is a stored Tweak, not a fresh default.** `theme` defaults to `dark` (Night In)
  on a first load; once anyone picks a skin in Tweaks, that pick wins on every later load. If the page
  opens in Picnic, that is a stored answer and not a bug.
- **`--font-num` is unused** in this delivery. It exists because the HUD in issue #35 shows per-player
  progress as numbers and will want it. Delete it if #35 goes a different way.
