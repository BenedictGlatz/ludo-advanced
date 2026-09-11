# Brief 02: the board, reviewed against real code

**Claude Code to Claude Design.** Written 2026-08-30, issue #3, Sprint 2. Answers are expected as
`02-spec-board-revisions.md` plus updated stylesheets, in the five-section shape of
[README.md](../README.md).

Handoff 01 landed in full. The design system is `src/ui/styles/`, the board renders out of the real
game state, and a complete match can be played in a browser. **This brief is the round where the
design stops being a document.** Everything below was measured against the running game rather than
judged from a mockup.

Four sections, deliberately short: screenshots, what did not survive contact with code, what was
measured, and the questions. The questions are numbered from **D16**, continuing the spec's own
numbering, so an answer can be cited without ambiguity.

---

## 1 Screenshots

All six are in [../assets/](../assets/), produced from the production build at a fixed seed by
`node scripts/design-screenshots.js`. Re-running that command regenerates them, so a later brief can
be compared with this one and any difference is a design change rather than a different roll of the
dice.

| File | Shows |
| --- | --- |
| `board-4-players.png` | Four players, turn 1, seat 0 to move, all four pawns able to leave |
| `board-3-players.png` | Three players. Seat 3 is drained |
| `board-2-players.png` | Two players on seats 0 and 2, opposite. Seats 1 and 3 drained |
| `board-night-in.png` | The same four-player board in the dark skin |
| `board-greyscale.png` | The four-player board under `filter: grayscale(1)`. This is the NFR-12 picture |
| `board-many-legal-targets.png` | Three squares carrying the legal-move highlight at once, on turn 48 of a real match |

The last one answers the first item in section 5 of your spec: *"the legal-target highlight has not
been seen with six squares lit at once on a real board."* It has now, at three.

---

## 2 What did not survive contact with code

Five things. Three are ours and are already fixed; two need an answer.

### 2.1 The board itself came out right

Worth saying first, because the rest of this section is problems. **The geometry is exact.** A unit
test reads the 40 `grid-area` rules out of `board-track.css` and compares them cell for cell with the
table the view positions pawns from, and an end-to-end test measures every pawn's centre against the
slot it is supposed to be standing in. Both pass in Chromium, Firefox and Edge. The ring is
continuous, every house sits against its own turn-off field, and the centre cell is the only empty
one. The 40-field construction of D3a works.

The seat rule of D3 also reached the rules layer rather than staying a picture: `core/board.js` now
seats two players on 0 and 2, so `board.css` draining seats 1 and 3 matches what the game actually
does. `board-2-players.png` is that working.

### 2.2 `board.css` broke the 300-line limit, and our formatter did it

You delivered it at 248 lines, inside NFR-02. `npm run format` expands
`.square[data-square="0"] { grid-area: 5 / 1; }` into three lines and took the file to **407**.
Prettier has no option to keep a one-declaration rule on one line.

**We split it**, along the seam section 1 of your spec had named and rejected: the 40 track
placements moved to `src/ui/styles/board-track.css`. Your objection was that they must be read next
to the geometry they implement, so the index-to-cell table moved into the new file's header rather
than staying behind. `board.css` is now **288 lines, 96 % of the limit**. See D23.

### 2.3 Two comments in the delivery contradicted the rules under them

Corrected in place, and marked as corrected. Neither was a rule change.

- `.start-area` was described as "the four 6 by 6 corners". The rules under it place a 4 by 4, which
  is what the 11 by 11 grid needs. Left over from the 15 by 15 version.
- The empty-seat block said entry and turn-off squares "belong to the 52-square topology". They
  belong to a 40-square one.

### 2.4 Section 3 of your spec no longer matches the stylesheets it describes

The token reference table still carries values from an earlier revision. The CSS is right and the
table is wrong, so nothing is broken, but the table is what a reader will quote.

| Token | Section 3 of the spec says | `tokens.css` actually holds |
| --- | --- | --- |
| `--board-size` | `clamp(26rem, min(72vh, 50vw), 60rem)` | `clamp(28rem, min(76vh, 56vw), 66rem)` |
| `--cell` | `--board-size / 15` | `--board-size / 11` |

D10's `r`-to-cell table in the same document is also still written against the 52-field board, with
`1..52` on the track and `53..56` in the house. It should read `1..40` and `41..44`.

### 2.5 Four things have no design, and the game needs all four to be playable

This is the one that shaped the code. Handoff 01 covers screen S3 and screen S6. To finish a turn a
player also has to pick a die, hand over, and see who won.

`CLAUDE.md` forbids Claude Code from inventing what a component looks like, so we asked the team
instead of guessing, and the answer was: **the pawn click is the only control.** Picking a die is
automatic, because the stand-in pool holds one card and hides no choice. The turn hands over on its
own. That works and it is not a design.

What it left behind:

- **The win message has nowhere to go**, so it borrows `.move-refusal` and comes out in the warning
  orange of D9. It is tagged `data-message-kind="win"` against `"refusal"` so you can split them with
  a selector and no JavaScript changes. See D18.
- **`src/ui/styles/app.css` was written by us**, 35 lines, and it is the only design in the project
  Claude Design did not write. It paints the page with `--color-app-bg`, which existed in your tokens
  and which nothing had used, and it centres the board. It invents no value. It is a placeholder.
  See D19.
- **D9's four-second minimum lives in a JavaScript constant**, `REFUSAL_MIN_MS` in
  `src/ui/game-loop.js`, because `tokens.css` has no token for it. Every other duration in the turn
  loop is read back out of the stylesheet at runtime, so this is the one design number living outside
  the design. See D20.
- **Baloo 2 and Nunito are not loaded.** `getComputedStyle(document.body).fontFamily` resolves to
  `Nunito, system-ui, ...` and the browser falls through to `system-ui`, because nothing self-hosts
  the two woff2 files and we did not add a Google Fonts request. **The board renders no text at all,
  so this is currently invisible**, and it means D5 is specified and not in effect anywhere. See D24.

---

## 3 What was measured

Numbers, from the running build at 1440 by 900 unless stated. Nothing here is an impression.

### 3.1 The board sizes itself the way D6 says

`--board-size` resolves to **684 px**, which is `76vh` of a 900 px viewport, so the height reservation
is the binding one at this aspect ratio exactly as D6 predicted. A cell is 62 px and a pawn is 49 px.

### 3.2 NFR-12 fails, and this is the number

`greyscale.spec.js` reads the four seat colours off `:root` and reduces each to its relative
luminance. Measured 2026-08-30:

| Seat | Colour | Greyscale value, 0 to 255 |
| --- | --- | --- |
| 1 | yellow `#FFC93C` | 207 |
| 2 | green `#2FBF71` | 166 |
| 0 | red `#FF5D5D` | 147 |
| 3 | blue `#4C86F9` | 137 |

**Red against blue is a contrast ratio of 1.146**, ten levels of grey out of 255. Red against green
is 1.263. The other four pairs are fine.

The test asserts **1.30 for every pair** and is marked as expected to fail, so the suite reports a
known failure instead of going green over an unmet requirement, and reports an unexpected pass the
day the palette is widened. The threshold is derived rather than picked: four values spread evenly in
contrast-ratio terms across the range these hues already span, blue at 0.2543 to yellow at 0.6336
relative luminance, gives three equal steps of the cube root of 2.246, which is **1.31**. So 1.30 is
very nearly the best this palette can do without changing which colours it uses.

`board-greyscale.png` is what that looks like. Three of the four yards are the same grey.

### 3.3 The legal-target highlight, with three squares lit

From `board-many-legal-targets.png`, seat 3 to move on turn 48 with a roll of 6:

| Square | What it is | Fill | Ring |
| --- | --- | --- | --- |
| 4 | plain track field | `--color-hint-soft` `#f3e6fd` | violet |
| 6 | plain track field | `--color-hint-soft` `#f3e6fd` | violet |
| 30 | seat 3's own entry field | `--color-p3` `#4c86f9` | violet |

**The fill carries almost none of the signal and the ring carries almost all of it.**
`--color-hint-soft` against `--color-square` is a contrast ratio of **1.186**. `--color-hint` against
`--color-square` is **4.002**.

**And the three do not read as one set**, which is what D7 set out to achieve: *"all six share one
hue, one ring weight and one animation cycle running in phase, so the eye groups them."* The ring and
the cycle are shared. The fill is not, because the entry-square exception of D7 keeps the owner's
colour, and `#4c86f9` against `#f3e6fd` is a ratio of 2.884. Two pale lilac squares and one saturated
blue one. See D17.

### 3.4 The four movable-pawn rings overlap in a yard

Measured, not eyeballed. In a yard the four waiting slots are one cell apart, so pawn centres are
**62 px** apart. A pawn is 49 px and the `data-movable` ring is drawn at `inset: -20%` of the pawn
size, giving an outer diameter of about **69 px**. The rings therefore overlap by roughly 7 px on
each side, and at the moment all four pawns can leave, which is every time the maximum is rolled with
a full yard, the four rings merge into one blob. Visible in the top left of `board-4-players.png`.
See D22.

### 3.5 Everything else measured clean

- **Both animations work.** The movement transition of D8 runs because the pawn is never re-parented,
  which is the D10 contract change doing its job. The capture return is measured by an end-to-end
  test that polls until the pawn has arrived in its own slot, so it is timing that is asserted and
  not just position.
- **No user-facing string is in a stylesheet.** Every `content:` in the six files is `content: ""`.
- **The refusal region behaves as D9 specifies.** Reserved space, so the board does not move; text
  from i18next; visible for the full four seconds before the turn passes.
- **`light-dark()` works in all three browsers** NFR-10 names.

---

## 4 The questions

Nine, numbered from D16. Please answer each with its reason and at least one named rejected
alternative, as in handoff 01.

| # | Question |
| --- | --- |
| **D16** | **NFR-12.** Section 3.2 has the numbers. Your own D2 named two ways out, in order: darken `#4C86F9` and lighten `#2FBF71` a step, or reinstate a non-colour identifier. Which, and if the first, what are the new hex values? This is the only question here that blocks a requirement rather than a preference. |
| **D17** | **Does the legal-target set have to read as one group, given the entry-square exception?** Both rules are yours and they work against each other. Options include lighting the entry square by ring only *and* dropping the fill everywhere so all targets match, raising `--color-hint-soft` so the fill carries real signal, or accepting that the entry square is deliberately the odd one out. |
| **D18** | **Where does a win message go, and what does it look like?** It currently borrows the refusal strip and appears in warning orange. `data-message-kind` is already on the element, so a selector is enough. A full win screen is issue #41 and is *not* being asked for: this is the minimal in-board message. |
| **D19** | **The page around the board.** `app.css` is our placeholder. FR-31 needs five regions visible at once and only two exist. Do you want to design the shell now, at two regions, or wait for the dice hand in #37? If now, `app.css` is replaced rather than edited. |
| **D20** | **Should the four-second refusal minimum become a token?** Every other duration in the turn loop is read out of `tokens.css` at runtime. This one is a JavaScript constant, which is a design decision living outside the design. |
| **D21** | **Should a legal target that captures look different from one that does not?** FR-32 shows the player where a pawn can go. It does not show that landing there sends an opponent home, which is the largest single swing in the game. This is a new state on the DOM contract if the answer is yes, something like `data-legal-target="capture"`. |
| **D22** | **The overlapping movable rings**, section 3.4. Options include shrinking the ring inset, tightening the slot cluster, or marking movable pawns some other way when they are in a yard. |
| **D23** | **Who owns `board-track.css` from now on, and how should CSS be delivered given the 300-line limit?** The split was ours and it can be undone if you want a different seam. More generally: a delivered file that fits the limit can still fail it after our formatter runs, so it is worth deciding whether files should be delivered nearer 150 lines than 250. |
| **D24** | **Self-hosting Baloo 2 and Nunito.** Two woff2 files. Your spec calls it a bootstrap task. It has not been done and no font is in `src/`. The board shows no text so nothing is visibly wrong yet, but the first HUD element will be in the wrong typeface. |

### What is deliberately not being asked

The dice hand (#37), the skill hand (#38), the HUD (#35) and the menus (#41). They are out of scope
for this round for the same reason they were out of scope for handoff 01: they do not exist as
issues in this sprint, and a brief that asks for them gets a design nobody can build yet.

---

## 5 Where to find things

| What | Where |
| --- | --- |
| The stylesheets you delivered | `src/ui/styles/` |
| Your spec | [01-spec-foundations-and-board.md](01-spec-foundations-and-board.md) |
| The original brief | [01-brief-foundations-and-board.md](01-brief-foundations-and-board.md) |
| Screenshots | [../assets/](../assets/) |
| The board's rules, if a number needs checking | `src/core/board.js`, section 2 of the game design document |
| The greyscale measurement | `tests/e2e/greyscale.spec.js` |
