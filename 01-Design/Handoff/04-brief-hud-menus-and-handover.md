# Handoff 04, brief: the HUD, the five overlay screens and the persistent chrome

**From:** Claude Code
**To:** Claude Design
**Date:** 2026-09-01
**Issues:** #35 (HUD), #41 (main menu, pause and win flow), and epic #39, plus the four items
[03-brief-cards-and-hands.md](03-brief-cards-and-hands.md) § 7 deferred to "handoff 04"

---

## 0 Why this brief exists now

Three things are true that were not true at handoff 03.

1. **The rules are finished.** `src/core/` and `src/state/` cover every mechanic in the rulebook.
   Nothing on screen is waiting for a rule any more, which means every remaining gap is a design gap.
2. **The game is not playable, and the reason is entirely in `ui/`.** The Product Owner opened the
   running build on 2026-09-01 and asked two questions: *how do I even see whose turn it is*, and *why
   are the card pictures missing*. The first has no answer at all: there is no textual turn indicator
   anywhere on the page. The locale key `turn.prompt` ("Spieler {{number}} ist am Zug") has existed in
   both languages since the i18n commit and is called from nowhere.
3. **The reaction window and the target picker are real now** (issues #33, #34), so the four items
   handoff 03 pushed to "handoff 04" are no longer guesswork.

There is also a **process debt to settle here**. `src/ui/styles/prompt.css` was written by Claude Code
because issue #34 needed two controls no spec described. Every value in it is an existing token and its
header says so, but it is still a design authored on the wrong side of the line. The same thing is
about to happen again, at larger scale: the HUD and five overlay screens are being built now against
existing tokens only, because the game has to be playable before the sprint ends. **This brief is the
request to replace all of that with a real design.**

---

## 1 What to design

Screen ids from [Obligations-Book.md](../../00-Meta/Project-Management/Obligations-Book.md) § 2.2:

| Id | Screen | What is wanted |
| --- | --- | --- |
| **S7** | HUD | Per-player progress, always visible during a match |
| **S1** | Main menu | Entry point: start a match, and reach the language setting |
| **S2** | Match setup | Choose 2, 3 or 4 players and start |
| **S8** | Pause | Reachable at any point in a turn: resume, or abandon back to the menu |
| **S9** | Win | Names the winner, offers a restart with no page reload |
| — | Handover | **New, no screen id yet.** The moment between two turns at a shared screen |
| — | Chrome | The always-present controls: pause, and the German/English switch |

S1, S2, S8, S9 and the handover are one component with five contents, see § 3.2. Whether that is the
right seam is itself a question, D38.

---

## 2 Hard constraints, each with the reason it exists

The first six are unchanged from handoff 03 and are repeated so the spec can be checked without
leaving this file.

1. **jQuery writes attributes, never styles.** Every visual state is a class or a `data-` attribute
   listed in § 3. `src/ui/` carries no colour and no size (NFR-01, `CLAUDE.md`).
2. **No CSS file over 300 lines, measured after `npm run format`** (NFR-02). This has now bitten
   twice: `board.css` arrived at 248 lines and Prettier expanded it to 407. Please split along a seam
   yourself at roughly 250 unformatted lines.
3. **No user-facing string in CSS.** Nothing a player reads in a `content:` property (NFR-03). A
   decorative glyph is fine. This one matters more here than anywhere so far, because overlays are
   almost entirely text.
4. **Built once, then only attributes rewritten** (D10 of spec 01). The HUD updates after every single
   turn, so a re-created element would restart every transition on it.
5. **Two skins from the tokens**, through `light-dark()` pairs.
6. **`prefers-reduced-motion` is respected.**
7. **Every overlay is keyboard-reachable and dismissible.** NFR-08 already required a focus state on
   anything clickable, and an overlay that traps a hot-seat player with a mouse-only button is worse
   than the timer it replaces. Buttons carry `tabindex` and a `:focus-visible` state is expected.
8. **The handover overlay has one non-negotiable job: it must actually conceal the skill hand.** See
   § 4.2. A panel that leaves the rail readable does not do it. This is the one place in this brief
   where a rule constrains the appearance, and it is a rule and not a preference.

---

## 3 The DOM contract

Claude Code guarantees these elements and attributes exist. The CSS may target them and nothing else.

### 3.1 The HUD

```html
<div class="hud" data-players="4">
  <div class="hud__seat" data-player="0" data-on-turn="true" data-finished="false">
    <span class="hud__name">Spieler 1 (Rot)</span>
    <ul class="hud__counts">
      <li class="hud__count" data-kind="start">
        <span class="hud__value">2</span>
        <span class="hud__label">Start</span>
      </li>
      <!-- and data-kind="track", "home", "cards" -->
    </ul>
  </div>
  <!-- one .hud__seat per seat actually in the match -->
</div>
```

- `data-player` is `0` to `3` and is the **same seat index** the board and the pawns already use, so
  `--color-p0` to `--color-p3` apply unchanged.
- **Only seats in the match are rendered.** A 2-player match produces two `.hud__seat` elements
  carrying `data-player="0"` and `data-player="2"`, because seats 0 and 2 are the two the rules use.
  The *name* says "Spieler 1" and "Spieler 2", see § 4.3.
- `data-on-turn` is on exactly one seat at a time. `data-finished` becomes `true` when that seat has
  all four pawns home.
- Each `.hud__count` has both a value and a label, and the label is a translated word. Four numbers per
  seat times four seats is sixteen numbers on screen, so **how they stay readable is D37**.

### 3.2 The overlay, five screens in one component

```html
<div class="overlay" data-screen="menu" data-open="true" data-player="1">
  <div class="overlay__panel">
    <h2 class="overlay__title">…</h2>
    <p class="overlay__text">…</p>
    <div class="overlay__actions">
      <button class="overlay__button" data-action="start" data-variant="primary">…</button>
      <button class="overlay__button" data-action="quit">…</button>
    </div>
  </div>
</div>
```

- `data-screen` is `menu`, `setup`, `pause`, `win` or `handover`.
- `data-open` is `false` while a match is being played. The element stays in the document.
- `data-player` is present **only** on `win` and `handover`, and carries the seat whose colour the
  panel is about. It is absent otherwise, so the CSS can match on the attribute existing.
- `data-variant="primary"` marks the one button that continues the flow. At most one per screen.
- `data-action` values, so the CSS can style by role if that turns out to be useful: `start`,
  `players` (the setup buttons, which additionally carry `data-count="2|3|4"`), `resume`, `restart`,
  `quit`, `ready`.
- `.overlay__text` may be absent on a screen that has nothing to say beyond its title.

### 3.3 The persistent chrome

```html
<div class="app__chrome">
  <button class="chrome__button" data-action="pause">…</button>
  <button class="chrome__button" data-action="language" data-lang="de">…</button>
</div>
```

`data-lang` is the language currently active, `de` or `en`. Whether the control is a toggle, two
buttons or something else is part of D42.

### 3.4 The shell, as it stands today

```html
<div class="app">
  <div class="app__board">…</div>
  <div class="app__dice">…</div>
  <div class="app__skill">…</div>
  <div class="prompt">…</div>
  <div class="move-refusal">…</div>
</div>
```

`app.css` is your own delivery from spec 03, D30. The HUD and the chrome have to find a place in it,
which is D35.

### 3.5 The card art window is filled in now

`.card__art` held nothing at handoff 03 and holds an inline `<svg>` from this sprint on. All 36
illustrations (29 skill cards plus the 7 dice cards) were extracted out of
`Card artwork design planning/Card Art.dc.html` into `src/ui/art/`. The markup is the artboard's own,
which means it carries **raw hex** such as `#2B1A3D` for the linework and a per-category window fill.
That is a token question and it is D41.

---

## 4 Facts the design must match

None invented here. Sources named per item.

### 4.1 What the HUD shows, and what it does not

FR-36 in [Requirements-Specification.md](../../00-Meta/Project-Management/Requirements-Specification.md):
*"A HUD shows each player's progress: pawns still in start, on track and home."* Acceptance criterion:
the counts match the game state after every turn.

- **Four pawns per player.** So `start + track + home` is always exactly 4, per seat, always.
- **FR-37, the resource and energy display, is `won't have`.** No rule for it exists anywhere in the
  rulebook, and § 5 of the requirements specification states that an unspecified mechanic cannot be
  built. Issue #35 is titled *Game HUD & Resource Display* and **the second half of that title is not
  being built.** Please do not design a slot for it.
- **The skill card count is the one addition beyond FR-36**, and it is there because of D33, see § 4.2.
- Pool and discard counters were named next to the HUD in handoff 03 § 7. **They were considered and
  dropped** by the Product Owner on 2026-09-01: the HUD gets progress plus the hand count and nothing
  else, so that sixteen numbers do not become twenty-four.

### 4.2 D33 is answered, and it is an input to this brief

Spec 03 § D33 asked whether an opponent's skill hand is shown and whether the count is public, and
correctly answered "this needs the Product Owner". **It was decided on 2026-09-01:**

> The cards stay secret. **The count is public** and belongs in the HUD.

Two consequences for this handoff:

1. The `data-kind="cards"` count in § 3.1 exists because of this decision.
2. **Secrecy at a shared screen is now a real requirement rather than theatre**, and that is what
   forces the handover overlay. The rail currently flips from one player's face-up cards to the next
   player's face-up cards after a 320 ms timer, with nothing in between. Constraint 8 in § 2 follows
   from this decision and not from taste.

### 4.3 Player identity, and a bug being fixed alongside

Seats are numbered `0` to `3` and a match uses `seatsFor(playerCount)`, which for two players returns
**seats 0 and 2**, so the players sit opposite each other. Everything on screen has so far labelled a
seat `seat + 1`, which means a 2-player match currently reads **"Spieler 1" and "Spieler 3"**. That is
recorded as a defect in `src/ui/move-hints.js`.

From this sprint on, a player is named by **position in the match plus colour**, decided with the
Product Owner on 2026-09-01: the first seat is "Spieler 1", the second is "Spieler 2", regardless of
which seat index they occupy. The colour is named in the label because colour is the only thing that
identifies a pawn on the board.

The seat-to-colour mapping is your own table from
[01-spec-foundations-and-board.md](01-spec-foundations-and-board.md) § 3, repeated so the words match
the pixels:

| Seat | Token | Colour word used in the label |
| --- | --- | --- |
| 0 | `--color-p0` | red |
| 1 | `--color-p1` | yellow |
| 2 | `--color-p2` | green |
| 3 | `--color-p3` | blue |

**If any of those four words is the wrong name for the colour you specified, say so in the spec.** The
words are going into `ui.json` in two languages and they are the only place the design is described in
prose to the player.

### 4.4 The flow the five screens have to form

FR-38's acceptance criterion is literal: *menu to match to pause to match to win to menu, navigable
without a reload.* FR-01 fixes the player counts at 2, 3 and 4. FR-06 requires a restart that resets
all state without a page reload; FR-07 requires the pause to be reachable **at any point in a turn**,
including while the 30-second reaction clock is running.

The handover sits between every pair of turns. A median four-player match runs long enough that this
is the **most-repeated screen in the game**, which puts it in the same category as D31's dealing
animation: whatever it costs in attention, it costs that many times.

---

## 5 Open decisions this handoff must answer

Numbered from D35, continuing from spec 03.

**D35 Where the HUD and the chrome go.** `app.css` is a three-row grid with the board on the left and
the two hand plates in a rail on the right. Two new things want a place: a HUD showing up to four
seats, and two always-present controls. `--board-size` is `clamp(26rem, min(76vh, 56vw), 60rem)` and
spec 01 § 6 names it *the number to check first* when a new region lands. **What is the layout, and
does `--board-size` change again?** Note that the rail is already the tighter of the two reservations.

**D36 What "on turn" looks like, and how many places say it.** Three cues already exist and none is
text: an ink halo on the active seat's yard (`board.css`), dimmed pawns for everyone else
(`pawn.css`), and a lifted ring on whichever hand plate is asking for a decision (`app.css`). The HUD
adds a fourth place, and it is the first one that can use a name. **Which of the four survive?** Four
simultaneous cues for one fact is noise; the Product Owner's question means one cue was not enough.

**D37 Sixteen numbers.** Four counts times four seats, updated after every turn, plus four names and
four colours. **What is the shape of a seat row, and what does it drop as the seat count falls to
two?** Consider that `start + track + home` always sums to 4, which may mean the three numbers are one
figure rather than three. `--font-num` exists in `tokens.css`, is unused, and spec 01 says it exists
for exactly this and to delete it if #35 goes another way.

**D38 One overlay component, five contents.** Menu, setup, pause, win and handover share § 3.2's
markup. **Is that the right seam, and what does the panel look like?** Specifically: does the board
stay visible behind it, and is the answer the same for all five? Menu and setup happen when there is no
board worth seeing; pause and win happen over a board the player wants to read; handover must not let
the next player read the rail.

**D39 The handover screen.** It replaces a 320 ms timer with a deliberate stop, so it is the single
biggest change to the feel of a turn in this sprint. It must conceal the skill hand (§ 2, constraint
8). It names the next player and it carries their colour on `data-player`. **What does it show, how
does it enter and leave, and what is the reduced-motion version?** A brief flash is not enough to
conceal anything, so this is one animation that cannot simply be shortened.

**D40 The win screen.** This is **D18 from handoff 02, unanswered and now unblocked.** The win message
currently borrows the orange refusal strip and appears in warning colour, which
`notes/04-frontend-building-blocks.md` already records as a defect. **What does winning look like, and
does the refusal strip stop carrying the message?** Note that an abandoned match reaches the same
`match-over` phase by a different route and reads very differently to a player.

**D41 The card artwork against the two skins.** The 36 illustrations are on screen now, drawn on the
artboard's cream ground with raw hex linework. `.card__art` gets its fill from a category token, so the
frame follows the skin and the drawing inside it does not. **Does the artwork need a Night In variant,
and if so, what is the mechanism?** Options include a token substitution pass over the extracted SVG,
a filter on `.card__art`, or accepting that the art window stays light in both skins because a card is
a physical object. The extraction script can re-run with a colour map, so a mechanical answer is
cheap; deciding it is not Claude Code's call.

**D42 The two persistent controls.** A pause button and a German/English switch have to be reachable
during a match without competing with the board for attention. FR-34 is a `must have` and requires the
switch to work at runtime, so it cannot be hidden inside a menu the player has left. **Where do they
sit and what are they?** The language control in particular: a toggle showing the current language, a
toggle showing the other one, or two buttons.

### 5.1 Still open from earlier handoffs, not reopened here

Listed so they stop drifting. **Handoff 02's brief never received a spec**: D19 was answered inside
spec 03 and D16, D17, D18, D20, D21, D22, D23 and D24 have no answer anywhere. D18 is now D40 above.
The rest, plus the four items spec 03 owed to this handoff:

| Item | Where it came from |
| --- | --- |
| **D16, NFR-12: telling four seats apart without colour.** The one open item that blocks a requirement rather than a preference, and the HUD makes it worse, because a colour word in a label is not a substitute for a colour-blind-safe pawn. | Handoff 02 |
| D17, whether the legal-target set reads as one group given the entry-square exception | Handoff 02 |
| D20, whether the four-second refusal minimum becomes a token | Handoff 02 |
| D21, whether a legal target that captures looks different | Handoff 02 |
| D22, the overlapping movable rings in a yard | Handoff 02 |
| D23, who owns `board-track.css` and how CSS is delivered under the 300-line limit | Handoff 02 |
| D24, self-hosting Baloo 2 and Nunito. Still unresolved, and the HUD is the first region that is mostly text, so it is the first place a missing font is visible. | Handoff 02 |
| What the reaction countdown looks like. It is a bare number today: no ring, no bar, no urgency state. | Spec 03 § 5 |
| Whether the prompt strip belongs at the foot of the page or in the rail | Spec 03 § 5 |
| How a pickable pawn differs from a movable one. Both are rings today, in two different tokens. | Spec 03 § 5 |
| Whether a skill square moving should be animated | Spec 03 § 5 |
| **What an empty hand slot looks like.** Found while filling the art windows on 2026-09-01, and visible in any screenshot of a hand holding one card: the skill hand builds five permanent slots, and the four with no card in them render as blank cards with a pale art window. Spec 03 D29 answered *unplayable*, and `card-state.css` answers *face down*. **Neither is *no card at all*.** | New, issue #39 |

Answer any of these that the work on D35 to D42 happens to settle. None of them blocks this handoff.

---

## 6 Deliverables

| File | What |
| --- | --- |
| `01-Design/Handoff/04-spec-hud-menus-and-handover.md` | The spec, five sections per [README.md](../README.md) |
| `src/ui/styles/hud.css` | **Replacing** the interim file described in § 0 |
| `src/ui/styles/overlay.css` | **Replacing** the interim file. Split it if it heads past 250 unformatted lines |
| `src/ui/styles/prompt.css` | **Replacing** the file Claude Code should not have written |
| `src/ui/styles/app.css` | **Amended**: the HUD and chrome regions, per D35 |
| `src/ui/styles/tokens.css` | **Amended, not replaced**: new tokens added to the existing set |

`tokens.css` and `app.css` are both shipped, tested and referenced by name in the documentation notes,
so please keep those two additive.

---

## 7 Out of scope, said explicitly

- **Audio, and every sound cue.** Issue #40, dropped out of epic #39 on 2026-09-01. No audio
  requirement is `must have` and no asset was ever budgeted.
- **The rules screen, S10.** FR-35, `should have`, and it has **no issue on the board at all**. Not
  being asked for, but it is the obvious next overlay content once § 3.2 exists.
- **The board, the pawns, the cards and the two hands.** Specs 01 and 03 own them. Amend them only
  where D35 to D42 force it, and say so in the spec if that happens.
- **The 36 illustrations themselves.** They exist and are now on screen. D41 is about the colour they
  are drawn in, not about the drawings.

---

## 8 The five landing checks

From [README.md](../README.md), repeated so the spec can be checked here:

1. Every open decision D35 to D42 has an answer.
2. Every answer carries a reason **and a named rejected alternative**.
3. No CSS file over 300 lines, after `npm run format`.
4. No user-facing string in a CSS `content:` property.
5. Every state in the § 3 DOM contract is actually styled.
