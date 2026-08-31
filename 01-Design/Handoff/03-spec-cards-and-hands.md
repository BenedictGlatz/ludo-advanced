# Spec 03: the card, the two hands and the shell

**Claude Design to Claude Code.** Answers [03-brief-cards-and-hands.md](03-brief-cards-and-hands.md).
Written 2026-08-31. Issues #30, #31, #34, and D19 from handoff 02.

Five sections, per the template in [../README.md](../README.md). Section 2 answers D25 to D33 from
the brief and adds D34. Every answer names a reason and a rejected alternative.

> **Two edits made by Claude Code when this spec was landed on 2026-08-31, both recorded rather than
> silent.** Six em dashes were rewritten as ordinary punctuation, because `CLAUDE.md` forbids the
> character in any document in this project. And the line counts in section 1 are the counts of the
> delivered files, which are not the counts after `npm run format`: `board.css` came to 429 formatted
> lines, not 270, and had to be split. See
> [notes/04-frontend-building-blocks.md](../../00-Meta/Documentation/notes/04-frontend-building-blocks.md)
> for what was changed and why. No decision in section 2 was touched.

---

## 0 Three things to read before the rest

**The contract needs three additions and none of them is a colour.** They are written up as D34 and
they are small: two attributes on `.hand--dice`, one span inside `.card`, and `data-card-type` on all
29 skill cards rather than only the ten from artboard `6a`. Dealing, the roll and the Action/Reaction
distinction cannot be drawn without them. Everything else in this spec works against section 3 of the
brief unchanged.

**The artwork cannot be re-skinned, so the art window is not re-skinned.** All 29 illustrations are
drawn with `#2B1A3D` ink lines on a pale ground. In the Night In skin a dark wash behind them turns
every card into a dark rectangle with invisible art. So the wash keeps the artboard's light value in
both skins and the card face carries the skin instead: cream face in Picnic, plum face in Night In,
with the same lit window inside. The card reads as a framed picture rather than a sheet of paper.
This is D25 and it is the one place where "both skins from one token pair" gives way.

**`--board-size` changed.** Spec 01 said that if a region needs more than a quarter of the width, that
token changes and nothing else does. The hand rail needs 49 per cent, so the token is now
`clamp(24rem, min(82vh, 44vw), 60rem)`. `--cell` is derived from it inside `tokens.css`, so anything
that overrides `--board-size` has to re-derive `--cell` in the same rule; `app.css` does that in its
stacked layout and it is the only place that does.

---

## 1 Files delivered

| Path | Contains | Lines |
| --- | --- | --- |
| `src/ui/styles/card.css` | The card: one size knob, the band, the art window, title, tags, both labelling schemes. | 222 |
| `src/ui/styles/card-state.css` | The roll badge, the four interactive states, the back. **A fifth file the brief did not ask for**, see below. | 115 |
| `src/ui/styles/hand.css` | The dice hand, the skill hand, the fan, dealing and returning. | 120 |
| `src/ui/styles/app.css` | The shell, replacing the 35-line placeholder. | 97 |
| `src/ui/styles/tokens.css` | **Amended.** 30 card tokens, 2 skill-square tokens, `--card-u`, `--motion-deal-stagger`, 3 card layers. One value changed: `--board-size`. | 183 |
| `src/ui/styles/board.css` | **Amended.** The skill square state, 14 lines. | 270 |
| `Cards and Hands.dc.html` | The rendered shell and a card gallery, for feedback. Not production code and not in `src/`. It loads the eight real stylesheets, so what it shows is what the CSS does. | n/a |

**Why the card is two files.** `card.css` reached 322 lines, which fails NFR-02 before Prettier even
runs. It is split at the seam the brief's own precedent suggests: `card.css` draws the structure that
section 3 of the brief describes, `card-state.css` draws what happens to that structure. The
alternative was to move the family and category mapping out into `card-family.css`. **Rejected**,
because those seven rules are three lines each and they are the first thing a reader needs next to
the band they colour.

`board.css` is at 270 lines after the amendment. The next addition to it has to split, and the seam
is already known: the 40 `.square[data-square="N"]` grid placements are the `board-track.css` the
brief says already exists upstream.

Mechanical checks: largest file 270 lines, and every `content:` declaration in all eight stylesheets
is `content: ""`.

---

## 2 The decisions

### D25 The card palette becomes tokens

Thirty tokens, in three groups.

| Group | Tokens | Skin behaviour |
| --- | --- | --- |
| Card chrome | `--card-face`, `--card-text`, `--card-band-text`, `--card-result-bg`, `--card-back`, `--card-back-mark`, `--card-back-frame` | Face and body text are `light-dark()` pairs. |
| Type | `--card-action`, `--card-reaction`, `--card-dice` and a `-wash` each | One value, both skins. |
| Category | `--card-movement`, `--card-blocking`, `--card-troll`, `--card-offensive` and a `-wash` each | One value, both skins. |

Two rules decide which tokens are paired and which are not:

1. **A family hue is the same hex in both skins.** Green means Action. If the green drifted between
   skins, a player switching skins mid-match would have to relearn the band.
2. **A wash is the same value in both skins**, because the illustrations are dark-on-light vector and
   CSS cannot recolour their strokes. See section 0.

The card face, the body text and the tag pill are paired. The tag pill is not a token at all: it is
`color-mix(in oklab, var(--wash) 26%, var(--card-face))`, so one declaration produces a pale tint on
a cream card and a dark tint on a plum one, and a new category needs no new pill token.

**Rejected alternative:** keep the artboard's cream face in both skins and darken only the page
around it. On the Night In board five cream cards are the brightest thing on screen by a wide margin,
brighter than the four pawn colours, and the hand stops being a supporting region.

### D26 The card at playing size

**Two authored sizes, one knob.** `--card-u` is a factor on the artboard: `1` is 260 by 380 px, and
every length in `card.css` is `calc(var(--card-u) * Nrem)` with `N` taken straight from the artboard.
A hand sets `--card-u` and nothing else moves. The knob lives on `:root` so a hand can override it by
inheritance.

| Where | `--card-u` | Card | Rules paragraph |
| --- | --- | --- | --- |
| Reference, `.card--full` | 1 | 260 x 380 | yes |
| Dice hand | 0.76 | 198 x 289 | no |
| Skill hand | 0.68 | 177 x 258 | no |

**What the hand size drops: the rules paragraph. What it gains: the art.** 14 px body text at 0.68 is
9.5 px, which is not a small paragraph but an unreadable one, so it is not shown at all. The tag row
is the rules at hand size: "DRAW 2", "NO REACTIONS", "RANGE 1 TO 6" is what a player needs mid-turn,
and it is already authored on all 29 cards. The space the paragraph frees goes to the art window,
which grows from a fixed 8 rem strip to whatever is left between band and title. The illustration is
the fastest thing to recognise in a fan.

`.card--full` is delivered now although nothing in this handoff shows it, because the pool overlay,
the reaction prompt of handoff 04 and any inspect view all need exactly it, and a size added later
would be a second component.

**Rejected alternative:** one fluid card that scales continuously with its container, keeping the
paragraph. It fails twice: the paragraph goes below the legibility floor before the card is small
enough to fit the rail, and a fluid card in a fan has no stable size to compute the overlap from.

### D27 The skill square, and the colour it collides with

**A skill square is a mark, not a fill.** The field keeps `--color-square` and gains an ink-outlined
teal diamond, inset 24 per cent, from `.square[data-skill-square="true"]::before`. Geometry only, no
glyph and no `content:` text.

**A skill square that is also a legal target shows both.** The hint is a violet ring plus a soft fill
around the edge of the field; the diamond is a solid shape in the middle of it. They do not compete
for the same pixels. The diamond steps back to inset 30 per cent under `[data-legal-target="true"]`
so the ring stays the widest thing on the field.

**Teal, not purple.** Violet is `--color-hint`, which is shipped, tested, used by `[data-legal-target]`
and by `--color-focus`. Teal is the only hue left that is not a seat colour (red, yellow, green,
blue), not the hint (violet) and not the refusal (orange).

**Rejected alternative:** keep the purple the existing material describes and recolour `--color-hint`.
Rejected because that changes every legal-move highlight and every focus ring in the game to answer a
question about eight fields, and `--color-hint` is named in the shipped documentation notes.

### D28 One card component, two labelling schemes

**The band is the type. The kind pill is the category.** One 34 px band carries both:

- Band colour and left label: `ACTION` green, `REACTION` orange, `DICE CARD` violet. Type decides
  *when* a card may be played, which is the only thing a hand has to communicate before anything
  else, so it gets the largest colour surface on the card.
- Right label: the sub-kind word (`DRAW`, `TRAP`, `CHAOS`), sitting in an ink-outlined pill filled
  with the category hue. Cards with no category, which is the ten from artboard `6a` plus every
  dice card, keep the same word as a plain label on the band. No second layout.
- The wash behind the art is the category too, so in a fan, where the pill is covered by the next
  card, the exposed left strip of a card still shows type (band) and category (wash).

**Reactions are marked twice, and the second mark is not a colour.** The Reaction band is striped
(`repeating-linear-gradient`, 45 degrees) and its label is ink rather than cream. Solid band with
cream label means Action; striped band with dark label means Reaction. Both survive greyscale, which
is the first thing in this project to answer that kind of question in a non-colour way. See
section 5 on NFR-12.

**Rejected alternative:** follow artboard `4a` and let the band carry the category, with the type as
a badge. Rejected because in a fan the badge lands in the covered part of the card, and because it
would leave the ten `6a` cards with a band colour their artwork does not have.

### D29 Cards that are not yours to play

**The signal is on the card you can play, not on the four you cannot.** A `[data-playable="true"]`
card sits 0.5 rem proud of the row with its full hard shadow and rises another 0.5 rem on hover or
focus. A `[data-playable="false"]` card sits flat, keeps a shorter shadow, and drops to
`filter: saturate(0.5) contrast(0.97)`. Full opacity, full text contrast, ink outline unchanged: a
hand of five unplayable cards has to stay a hand a player can read and plan with, because that is the
normal case, not the exception.

`.card--back` is the plum ground from artboard `5a`: diagonal stripes, a dashed inner frame and an
ink-outlined diamond, all from CSS, since the contract's back element has no children.

**Rejected alternative:** `opacity: 0.5` on unplayable cards. Five half-transparent cards read as a
disabled interface rather than as a hand, and the body text drops below contrast on a card the player
still has to read to plan the next turn.

### D30 The page around the board

**Board left, both hands stacked in a rail on the right, refusal a strip across the foot.**

```
+-----------------------------+---------------------+
|                             |  dice hand, 3 cards |
|          board              +---------------------+
|                             |  skill hand, fan    |
+-----------------------------+---------------------+
|            move refusal, full width               |
+---------------------------------------------------+
```

At 1440 by 900: board 634, rail 702, dice row 629 wide and 313 tall, skill fan 589 wide and 280 tall,
page height 776. Nothing scrolls. The rail is the wider region because both hands are rows and
neither can be a column, because three dice cards in a column is 900 px of card in a 900 px window.

`--board-size` changes, as section 0 says. Both region plates use the same chrome as every other
panel in the game, so the hands read as part of the table. The plate holding the hand whose
`data-active="true"` gains an ink ring: `:has()` reads the attribute the contract already provides,
so whose turn it is is stated twice, once on the board where the pawns are and once in the rail where
the decision is.

Below 84 rem, or in portrait, the four regions stack in turn order and the page may scroll. FR-31 asks
for one screen at the design resolution, not at every size. The breakpoint is 84 rem and not 80 rem
because at exactly 1280 the rail comes out 14 px narrower than three dice cards.

**Rejected alternative:** hands centred below the board, full width, as most digital board games do.
At 900 px tall it forces the board under 500 px, which puts `--cell` at 45 px and the pawn at 35 px,
below the 44 px hit target spec 01 committed to.

### D31 Dealing, choosing and returning

The most repeated animation in the game, so it reuses the existing budget rather than inventing one.

| Step | What moves | How long |
| --- | --- | --- |
| Deal | Each card scales up from 0.88 and rotates out of the pool corner into place | `--motion-move`, 240 ms, staggered by `--motion-deal-stagger`, 60 ms |
| Hover | The card under the pointer rises 0.5 rem | `--motion-feedback`, 90 ms |
| Keep | The chosen card rises 1.25 rem and takes a focus ring | 90 ms |
| Return | The two nobody kept travel back toward the pool corner and fade | `--motion-move`, 240 ms, `--ease-capture` |

Longest path, deal to settled: 240 + 120 = 360 ms. Both animations are driven by attributes on the
hand, not by rebuilding elements, so D10 of spec 01 holds: cards are dealt by rewriting
`data-card-id` on three permanent elements, and `data-dealing` is what tells the CSS to play the
arrival.

**Reduced motion:** nothing new. `--motion-move` is already 1 ms and `--motion-deal-stagger` is 0 ms
under `prefers-reduced-motion`, so both animations collapse to an instant appearance and the 90 ms
feedback stays. This is D12 of spec 01 applied, not re-decided.

**Rejected alternative:** a cross-fade in place, no travel. Cheaper, and it loses the one thing the
animation is for: the pool is off-screen in this shell, and the travel is the only thing that says
where three cards came from and where two of them went.

### D32 Showing the player what they rolled

**Yes, on the card that produced it.** `.card__result` is a badge in the top-right of the art window:
cream, ink-outlined, `--font-display`, 1.625 em. The card's own title already says the denomination,
so the pair reads "7" over "D8" and answers the brief's example directly.

It carries no words, so NFR-03 is untouched: the view writes a number into the span and leaves it
empty otherwise, and `.card__result:empty { display: none; }` takes it off the card. No `content:`
and no `attr()`.

**Rejected alternative:** the roll on the board, in the hub. The hub is where four home columns meet
and pawns pass through it, so a numeral there is covered by a pawn exactly when the player wants to
read it.

### D33 The hand that is not yours

**Not shown as faces. `.hand--skill[data-active="false"]` renders every card as a back**, overlapped
to 82 per cent so the hand reads as a stack with a visible count rather than a row. The same rule
covers the case that actually matters in hot-seat: your own hand, while the player next to you is
taking their turn and looking at the same screen.

**The rules-adjacent part needs the Product Owner** and is in section 5: whether an opponent's hand
should be represented at all, and whether the count is public. If it is, the count belongs in the HUD
(S7, issue #35), not in S5. The CSS is ready for either answer: the hook is one attribute the
contract already defines.

**Rejected alternative:** faces kept, with a translucent veil over the region. In hot-seat the next
player is looking at the same screen, and a veil a player can read past is not privacy, it is a
gesture at privacy.

### D34 The three contract additions

Requests, not decisions. Each is the minimum for a thing the brief asks for.

| Addition | For | Why nothing smaller works |
| --- | --- | --- |
| `data-dealing="true"` and `data-resolved="true"` on `.hand--dice` | D31 | A CSS animation cannot be retriggered by rewriting `data-card-id`. An attribute that is present while the deal plays is the smallest trigger that respects "built once, attributes rewritten". |
| `<span class="card__result"></span>` inside `.card`, always present, empty when there is no roll | D32 | The number is user-visible text. NFR-03 forbids it in CSS, so it has to be in the DOM, and it has to exist before the roll so the badge is not a re-created element. |
| `data-card-type` on all 29 skill cards | D28 | Artboard `4a` shows only the category, so 19 of the 29 cards have no type in their artwork. Without it the band cannot say when a card may be played, which is the one thing the hand must say. |

---

## 3 Token reference

New in `tokens.css`. One row per group; the file is the reference.

| Group | Tokens | Note |
| --- | --- | --- |
| Card chrome | `--card-face`, `--card-text`, `--card-band-text`, `--card-result-bg`, `--card-back`, `--card-back-mark`, `--card-back-frame`, `--card-dormant-wash` | Face and body text paired; the rest single-value. |
| Type | `--card-action`, `--card-reaction`, `--card-dice`, plus `-wash` each | `#3fa35b`, `#ff9a3c`, `#8b5fb8` from the artwork. |
| Category | `--card-movement`, `--card-blocking`, `--card-troll`, `--card-offensive`, plus `-wash` each | `#4c86f9`, `#b98ce0`, `#ffc93c`, `#ff5d5d` from artboard `4a`. |
| Card geometry | `--card-u` | Size factor on the 260 by 380 artboard. On `:root` so hands can override it. |
| Skill square | `--color-skill`, `--color-skill-soft` | Teal, both skins. |
| Motion | `--motion-deal-stagger` | 60 ms, 0 ms under reduced motion. |
| Layering | `--layer-card`, `--layer-card-raised`, `--layer-card-selected` | Local to a hand; the board layers are untouched. |

Changed: `--board-size`, from `clamp(28rem, min(76vh, 56vw), 66rem)` to
`clamp(24rem, min(82vh, 44vw), 60rem)`. Nothing else in `tokens.css` was edited.

---

## 4 Component states covered

Walked against section 3 of the brief.

| Contract | Styled by |
| --- | --- |
| `.card` | `card.css`, both sizes, both skins |
| `data-card-family="dice"` / `"skill"` | Band and wash, `card.css` |
| `data-card-type="action"` / `"reaction"` | Band colour, stripes, label colour |
| `data-card-category`, four values | Kind pill and wash |
| `data-faces` | Not styled. The title says the denomination and the faces attribute would repeat it. |
| `data-playable="true"` / `"false"` | `card-state.css` |
| `data-selected="true"` | `card-state.css`, lift plus focus ring |
| `tabindex`, `:focus-visible` | `card-state.css`, ring in `--color-focus` |
| `.card__banner`, `__type`, `__kind` | `card.css` |
| `.card__art` | `card.css`, fixed at reference size, grows at hand size |
| `.card__title`, `.card__text`, `.card__tags`, `.card__tag` | `card.css`; `__text` at reference size only |
| `.card--back` | `card-state.css` |
| `.hand--dice`, `data-count`, `data-active` | `hand.css` |
| `.hand--skill`, `data-count` 3 to 7, `data-limit`, `data-active` | `hand.css`, fan overlap per count |
| `.square[data-skill-square="true"]` | `board.css`, alone and combined with `[data-legal-target]` |
| `.app`, `__board`, `__dice`, `__skill` | `app.css` |
| `.move-refusal` inside `.app` | `app.css` places it; `refusal.css` still draws it |
| `.board[data-phase]`, `[data-status]`, `[data-turn]`, `[data-roll]`, `[data-die]` | Not styled, as the brief allows. `data-roll` is answered by `.card__result` instead. |

`data-limit` is read by nobody, deliberately: the fan overlap follows `data-count`, so a limit change
from 5 to 3 or 6 needs no CSS change and no new rule. Overlap is authored for counts 3 to 7.

---

## 5 What is still open

- **The three D34 contract additions need an answer before `hand-view.js` is written.** The dealing
  animation, the roll badge and the Action/Reaction band all depend on them.
- **D33 needs the Product Owner**, not the designer: is an opponent's skill hand represented on
  screen at all, and is the card count public? The CSS supports both answers today.
- **NFR-12, telling seats apart without colour, is still open from handoff 02** and this handoff does
  not close it. It does suggest a shape for the answer: the Reaction band is marked by stripes as
  well as by orange, and the same trick works on a pawn. Four seats need four fills that survive
  greyscale, so solid, striped, dotted and ringed, and that is a change to `pawn.css` rather than to
  this handoff. Raise it with the sign-off table rather than in passing.
- **The 44-field track and the dice pool balance are still unresolved** from spec 01, D3a. Nothing in
  this handoff depends on the answer.
- **Skill squares move during a match** and the CSS assumes the view simply rewrites the attribute.
  If the move should be animated, that is a decision nobody has asked for yet, and it needs the
  reappearance to be visible on a field the player is not looking at.
- **Fonts are still loaded from Google Fonts in the mockup.** Self-hosting Baloo 2 and Nunito as
  woff2 is unchanged from spec 01, section 5, and is still open.
