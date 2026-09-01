# Handoff 03, brief: the card, the dice hand, the skill hand and the page around them

**From:** Claude Code
**To:** Claude Design
**Date:** 2026-08-30
**Issues:** #31 (dice hand), #34 (skill hand), #30 (skill squares), and the shell question left open
as D19 in [02-brief-board-review.md](02-brief-board-review.md)

---

## 0 Why this brief exists now and not in handoff 02

Handoff 02 deliberately did **not** ask for the dice hand or the skill hand, and said so:

> a brief that asks for them gets a design nobody can build yet

That has changed. Two things exist now that did not on 2026-08-30 morning:

1. **The real Dice Card Pool is built** (issue #30). A turn deals three different cards and the
   player has to pick one. Until now the pool held a single card and the view chose it silently.
2. **The card set is decided.** The Product Owner chose all 29 cards from the card artwork canvas in
   `01-Design/Handoff/Card artwork design planning/Card Art.dc.html`, artboards `6a` and `4a`, plus
   the seven dice cards on artboard `5a`.

So the hands are now buildable, and the thing blocking them is a design and not a rule.

**There is a second reason this is urgent.** `src/ui/game-loop.js` currently picks `hand[0]` for the
player, because there is nothing to click. That is not a small cosmetic gap: measured over 400
matches, **one turn in three has no legal move at all**, and part of that is the view choosing a D20
when the player needed a D2 to leave the yard. The hand screen is what turns a measurable defect back
into a decision.

---

## 1 What to design

Screen ids from [Obligations-Book.md](../../00-Meta/Project-Management/Obligations-Book.md) § 2.2:

| Id | Region | What is wanted here |
| --- | --- | --- |
| **S4** | Dice hand | The three drawn cards, face up, and the act of picking one |
| **S5** | Skill hand | The player's skill cards at rest. **Only the resting state**, see § 7 |
| **S3** | Board | One addition only: the skill square, a track field that gives a card |
| none | The shell | The page that holds S3, S4, S5 and S6 at once without scrolling (FR-31) |

Plus the thing all of the above are made of: **the card itself**, in its three families (dice card,
Action card, Reaction card) and, for skill cards, its four categories.

---

## 2 Hard constraints, each with the reason it exists

1. **jQuery writes attributes, never styles.** Every visual state is a class or a `data-` attribute
   listed in § 3. `src/ui/` is forbidden from carrying a colour or a size, because NFR-01 puts
   presentation in the stylesheet and `CLAUDE.md` puts design decisions with Claude Design.
2. **No CSS file over 300 lines** (NFR-02). This bit before: `board.css` arrived at 248 lines and
   Prettier expanded it to 407, so it had to be split into `board.css` and `board-track.css` after
   delivery. **Please split along a seam yourself** if a file is heading past roughly 250 lines
   unformatted.
3. **No user-facing string in CSS.** Nothing in a `content:` property that a player reads (NFR-03).
   Every card name, rules text and tag goes through i18next. A decorative glyph is fine.
4. **Elements are built once and then only have attributes rewritten.** This is D10 of spec 01 and it
   is why the pawn movement transition works: a re-created element has no previous position to
   animate from. Cards are dealt, chosen and returned every single turn, so this matters more here
   than anywhere else so far.
5. **Two skins, from the tokens.** Everything resolves through `light-dark()` pairs in `tokens.css`,
   as spec 01 established, so Picnic and Night In both work with no second stylesheet.
6. **Reduced motion is respected** (`prefers-reduced-motion`), as spec 01 already does for the pawn.
7. **The card art is inline SVG and stays that way.** All 29 illustrations are hand-authored vector
   inside the canvas file. No external image assets, because the build ships one bundle and 29 PNGs
   would be 29 requests and a licensing question nobody has asked.

---

## 3 The DOM contract

This is a technical interface, not an appearance. Claude Code guarantees these elements and
attributes exist; the CSS may target them and nothing else.

### 3.1 The card, shared by every family

```html
<div class="card"
     data-card-id="action-angel-die"
     data-card-family="skill"          <!-- "skill" | "dice" -->
     data-card-type="action"           <!-- "action" | "reaction", skill cards only -->
     data-card-category="movement"     <!-- see § 4.3, skill cards only -->
     data-faces="8"                    <!-- dice cards only, 2|4|6|8|10|12|20 -->
     data-playable="true"
     data-selected="true"
     tabindex="0">
  <div class="card__banner">
    <span class="card__type">…</span>   <!-- left label -->
    <span class="card__kind">…</span>   <!-- right label -->
  </div>
  <div class="card__art"><svg …></svg></div>
  <h3 class="card__title">…</h3>
  <p class="card__text">…</p>
  <ul class="card__tags"><li class="card__tag">…</li></ul>
</div>
```

The face-down card, used for the pool and the discard pile:

```html
<div class="card card--back" data-card-family="skill"></div>
```

### 3.2 The two hands

```html
<div class="hand hand--dice" data-count="3" data-active="true">…three .card…</div>
<div class="hand hand--skill" data-count="4" data-limit="5" data-active="false">…cards…</div>
```

`data-active` says whether this hand belongs to the player whose turn it is.

### 3.3 The skill square, on the existing board

The board already renders 40 `.square.square--track` elements carrying `data-square="0"` to `"39"`.
A skill square is one of those with one attribute added:

```html
<div class="square square--track" data-square="14" data-skill-square="true"></div>
```

It is not a new element, and it moves: when a pawn lands on one the attribute is removed from that
field and appears on a different one.

### 3.4 The shell

```html
<div class="app">
  <div class="app__board">…the .board…</div>
  <div class="app__dice">…the .hand--dice…</div>
  <div class="app__skill">…the .hand--skill…</div>
  <div class="move-refusal">…</div>
</div>
```

`src/ui/styles/app.css` is currently **35 lines of placeholder written by Claude Code**, which
`00-Meta/Documentation/notes/04-frontend-building-blocks.md` already records as a rule violation
being carried. This handoff is the chance to replace it with a real design.

### 3.5 Already on the board, listed so the CSS knows it is there

`.board` carries `data-phase`, `data-status`, `data-turn`, `data-roll` and, since issue #30,
`data-die` (the face count of the chosen card). None of them is styled today and none has to be. They
are named here because `data-roll` and `data-die` are the obvious source for showing a player what
they rolled, which is decision D32.

---

## 4 Facts the design must match

All taken from [Game-Design-Document.md](../../00-Meta/Project-Management/Game-Design-Document.md)
and from the card artwork canvas. None invented here.

### 4.1 The dice hand (§ 5 of the rulebook)

- The pool holds **20 cards** over **7 denominations**: D2, D4, D6, D8, D10, D12, D20.
- **Exactly 3 are drawn per turn**, face up, and the player keeps **exactly 1** (FR-18, FR-19).
- The other two go back and the pool is reshuffled. There is no discard pile for dice cards.
- The three cards are frequently but not always different. Measured over 1000 hands: **more than
  half the time all three differ**, so two cards showing the same denomination is normal and not a
  bug the design has to hide.
- The choice is a real one and the design should let a player make it quickly: a small die gets a
  pawn out of the start area, a large die moves one already on the track (§ 5.2).

### 4.2 The skill hand (§ 6.5, as amended by the Product Owner on 2026-08-30)

- **58 cards in the pool**: 29 distinct cards, 2 copies each.
- A player draws **1 card at the start of every turn**, and **1 more whenever a pawn of theirs lands
  on a skill square**.
- **Hand limit 5.** A player at the limit draws nothing. *Provisional: this number is Claude Code's
  assumption pending playtesting, and it is one constant in the code. Please design a hand row that
  survives it changing to 3 or to 6.*
- **Each player plays at most one card per turn.**
- Played cards go to a face-up discard pile, which is reshuffled into the pool when the pool empties.

### 4.3 The 29 cards, as the artwork defines them

Two types, which decide **when** a card may be played:

| Type | When | Count | Banner on the artboard |
| --- | --- | --- | --- |
| Action | Only on your own turn | 22 | green |
| Reaction | Only during someone else's turn | 7 | orange |

Skill cards additionally carry one of four categories, which is flavour and grouping rather than
rules:

| Category | Cards | Banner on artboard `4a` |
| --- | --- | --- |
| Movement | 5 | blue |
| Blocking | 5 | violet |
| Troll | 5 | yellow |
| Offensive | 4 | red |

The ten cards on artboard `6a` carry a type banner and a sub-kind label (`DRAW`, `ECONOMY`,
`LOCKOUT`, `BUFF`, `DEBUFF`, `NEGATE`, `CONTROL`, `CHAOS`) rather than one of the four categories.
**How those two labelling schemes reconcile into one card component is decision D28.**

### 4.4 Skill squares

- **8 of the 40 track fields** are skill squares at the start of a match, at absolute indices
  4, 7, 14, 17, 24, 27, 34, 37. They are symmetric: every player meets them at the same point of
  their own lap.
- A pawn must **land exactly** on one. Passing over does nothing.
- Using one **consumes it**: it disappears and reappears on a random other track field, never on a
  player's entry field (0, 10, 20, 30) and never on a field that already is one.
- So the count is always 8 and the positions change during a match.

---

## 5 Open decisions this handoff must answer

Numbered from D25, continuing from handoff 02.

**D25 The card palette becomes tokens.** The artwork specifies raw hex: `#35204A` for every outline,
`#FFF8EC` for the card face, `#FFEFD9` for the canvas ground, and a banner, art-window and pill
colour per family and per category. `tokens.css` holds every colour as a `light-dark()` pair and has
two skins. **How do the card colours enter the token set, and what is the Night In variant?** The
artwork is drawn on a cream ground that does not exist in the dark skin.

**D26 The card at playing size.** The artboards are drawn at 260 x 380 px with a 128 px art window
and 14 px body text. The board measures 684 px at 1440 x 900 and FR-31 wants board, dice hand, skill
hand and refusal strip visible together with no scrolling. **How big is a card on the real page, and
what does the layout inside it drop as it shrinks?** The rules text at 14 px is unreadable at a third
of the artboard size; the title and the art may not be.

**D27 The skill square, and the colour it collides with.** Skill squares are described as purple. So
is `--color-hint`, which spec 01 already uses for `[data-legal-target]`, the field a pawn is about to
move to. **A field can be both at once.** What does a skill square look like, what does a skill
square that is also a legal target look like, and does one of the two change colour?

**D28 One card component, two labelling schemes.** Artboard `6a` labels a card by type and sub-kind;
artboard `4a` labels it by category and sub-kind. A player holding both in one hand sees two systems.
**Should the hand show type, category, or both, and what carries it: the banner colour, a badge, the
frame?** Reactions in particular have to be recognisable at a glance, because they are the only cards
playable on somebody else's turn.

**D29 Cards that are not yours to play.** In a hand of up to five, at most one is playable this turn
and often none is. **What does an unplayable card look like** without making a hand of five read as
broken? Note that `card--back` is also needed, for the pool and the discard pile.

**D30 The page around the board.** This is D19 from handoff 02, unanswered, and it is now blocking.
Four regions exist and want to be on screen together. `--board-size` is
`clamp(26rem, min(72vh, 50vw), 60rem)` and spec 01 says that if a region needs more than a quarter of
the width, that token changes and nothing else does. **What is the layout, and does `--board-size`
change?**

**D31 Dealing, choosing and returning.** Three cards appear every turn, one is chosen, three go back.
That is the most-repeated animation in the game, roughly 250 times in a median four-player match.
**What moves, how long does it take, and what is the reduced-motion version?** For comparison, the
existing motion tokens are 90 ms feedback, 240 ms move, 320 ms capture.

**D32 Showing the player what they rolled.** The roll is currently invisible: `data-roll` is on the
board for tests only, and spec 01's reasoning was that the legal-target highlight says where the pawn
lands, which is what the player needs. With seven denominations that is weaker, because "you rolled 7
on a D8" and "you rolled 7 on a D20" are different situations. **Does the chosen card show its
result, and if so where?**

**D33 The hand that is not yours.** Hot-seat means all players share one screen. The skill hand is
private information in a way the dice hand is not. **Is an opponent's hand shown at all, and if so as
what?** This one is a rules-adjacent question, so a "this needs the Product Owner" answer is a
legitimate answer.

---

## 6 Deliverables

| File | What |
| --- | --- |
| `01-Design/Handoff/03-spec-cards-and-hands.md` | The spec, five sections per `01-Design/README.md` |
| `src/ui/styles/card.css` | The card component in every family, category and state |
| `src/ui/styles/hand.css` | The two hand rows |
| `src/ui/styles/app.css` | **Replacing** the 35-line placeholder, the real shell |
| `src/ui/styles/tokens.css` | **Amended**, not replaced: the new card tokens added to the existing set |
| `src/ui/styles/board.css` | **Amended**: the skill square state only |

Please keep the amendments to `tokens.css` and `board.css` additive. Both are shipped, tested and
referenced by name in the documentation notes.

---

## 7 Out of scope, said explicitly

- **The reaction prompt.** S5 has a modal state for "somebody played a card, you have 30 seconds to
  answer". Its interaction is not built and its states are not known yet, so a design for it now
  would be guesswork. It goes in handoff 04, once issue #33 has made the window real.
- **Choosing a target.** Fourteen of the 29 cards need the player to pick a pawn or a field before
  the card resolves. Same reason: handoff 04.
- **The HUD (S7).** Pawn progress, pool and discard counters. That is issue #35.
- **Menus, pause and win screens (S1, S2, S8, S9).** Issue #41.
- **The 29 illustrations.** They already exist on artboard `4a` and `5a` and are not being asked for
  again. What is wanted is the frame they sit in.
- **NFR-12, telling seats apart without colour.** Still open from handoff 02 as row 8 of the Product
  Owner sign-off table. Not reopened here, but if the card design happens to suggest an answer, say
  so.

---

## 8 The five landing checks

Repeated from `01-Design/README.md` so the spec can be checked against them without leaving this
file:

1. Every open decision D25 to D33 has an answer.
2. Every answer carries a reason **and a named rejected alternative**.
3. No CSS file over 300 lines, after `npm run format`.
4. No user-facing string in a CSS `content:` property.
5. Every state in the § 3 DOM contract is actually styled.
