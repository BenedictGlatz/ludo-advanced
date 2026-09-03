# Handoff 07, brief: traps, blockers and pawn statuses on the board

**From:** Claude Code
**To:** Claude Design
**Date:** 2026-09-02
**Issue:** #45, Trap Card System & Tile Trigger Logic. Requirement FR-30, WBS 6.4, `could have`
**Answers:** nothing from an earlier handoff. D51 to D60 are new, and D59 picks up the fourth unnumbered
leftover from `00-open-requests.md` § 4

---

## 0 Why this brief exists

**This one does not block a requirement, and it is worth saying so plainly.** FR-30 is a `could have`.
Brief 06 was the last item in the project that blocked one, and it closed on 2026-09-02.

What this brief does block is different: **a rule that already exists being visible at all.** The trap
mechanic shipped with epic #38 on 2026-08-31. Objects sit on the shared track squares, they fire when a
pawn crosses them, and one of them refuses a move outright. Not one file under `src/ui/` reads
`state.traps`. So for two days the game has been enforcing rules the player cannot see.

Issue #45 makes that worse before it makes it better, for two reasons:

1. **The Product Owner has made every trap and blocker public**, with its owner shown. The Game Design
   Document calls one of them "a face-down trap"; that is now a recorded deviation. So the mechanic goes
   from invisible-by-accident to needing a deliberate look.
2. **One of the four cards no longer moves anything.** Under the new rules Banana Peel applies a status
   instead of sending the pawn home. The player commits a move, the pawn arrives exactly where they
   expected, and the only consequence is that the pawn loses its next turn. **With no visible mark and no
   announcement, that reads as the game eating a turn for no reason.** It is the strongest argument in
   this brief and it is the reason D55 and D56 matter more than the rest.

**The clock.** Sprint 3's feature freeze is 2026-09-11. Everything that lands after it is documentation.

**What ships without waiting for you.** The commit that sends this brief also puts every attribute below
into the DOM, unstyled, along with the announcement text through i18next and a full Playwright suite that
asserts the attributes. That is the D27 precedent applied on purpose: markup now, stylesheet when the
spec lands. So nothing here is blocking Claude Code, and a trap is currently in the DOM and invisible.

---

## 1 What to design

| Id | Screen | What is wanted |
| --- | --- | --- |
| **S3** | Board | Two kinds of object standing on a track field, the seat that owns each one, the field an object protects, a field that can be picked, and up to eight status marks on a pawn |

Nothing else. The HUD, the chrome, the two hands, the overlays and the pawn's own seat mark are delivered
and are not reopened.

---

## 2 Hard constraints, each with the reason it exists

The first nine are the standing ones from handoffs 03 to 06, repeated so the spec can be checked without
leaving this file. The last four are specific to a field.

1. **jQuery writes attributes, never styles.** Everything below is keyed off a `data-` attribute or a
   class. `src/ui/` carries no colour and no size (NFR-01, `CLAUDE.md`).
2. **No CSS file over 300 lines, measured after `npm run format`** (NFR-02). See constraint 13.
3. **No user-facing string in CSS.** Nothing a player reads in a `content:` property (NFR-03). A letter or
   a word as a trap mark would break this, which is why § 3 promises an `aria-label` fed by i18next
   instead: the accessible name comes from the markup, the visible mark is geometry.
4. **Built once, then only attributes rewritten** (D10 of spec 01). The 40 fields and their trap spans are
   created when the board is built and never re-created. That is what lets a trap appearing or firing be
   transitioned at all, so do not require the view to touch the span.
5. **Two skins from the tokens**, through `light-dark()` pairs where a new value is needed.
6. **`prefers-reduced-motion` is respected.** If anything here loops or animates, it stops under it.
7. **No em dash, anywhere, in the spec or in a CSS comment.** `CLAUDE.md` bans the character and the
   rhetorical habit it enables. Use a colon, a semicolon, a comma or two sentences. In a table cell where
   a value is absent, write `n/a` or `none`.
8. **Every existing state keeps working** with the new elements and attributes present.
9. **If an answer needs an element this brief does not promise, name it in the spec** rather than styling
   around its absence. Claude Code adds it, the way spec 04 named three and spec 06 named one.

The four that are new, and the first is the one to read twice:

10. **Both pseudo-elements of `.square` are already taken.** `::before` is D27's skill diamond
    (`board.css` line 182). `::after` is the turn-off bar on the four squares where a seat leaves the ring
    (`board.css` lines 108 to 133), which are squares 9, 19, 29 and 39, **and all four of them are legal
    trap targets**. That is why the trap mark is a real element and not a third layer: there was no third
    layer to give it. Same situation `.pawn__mark` solved in handoff 06.
11. **The trap span is present on all 40 track fields at all times**, and must render nothing when its
    parent carries no `[data-trap]`. An empty span on 40 fields is the price of constraint 4.
12. **A field can carry three marks at once.** A trap, D27's teal skill diamond, and D7's legal-target
    ring with its pulse. All three are already possible on one field today, and a trap card's own target
    picker adds a fourth state on top (D59). D27 answered the two-mark case by stepping the diamond back
    from `inset: 24%` to `inset: 30%`; the three-mark case has never been drawn.
13. **`board.css` is at 197 lines and holds both D7 and D27.** If the answer needs more than roughly fifty
    unformatted lines, split at a real seam and name it in the spec. `board-track.css` and
    `board-regions.css` are the precedent, and D23 of handoff 02 is still the open question about who owns
    that split.

---

## 3 The DOM contract

Claude Code guarantees these elements and attributes exist. The CSS may target them and nothing else.

```html
<div class="board" data-players="4" data-active-player="0" data-die="6" data-picking="free-square">

  <!-- a field holding a trap, which is also a legal square to pick right now -->
  <div class="square square--track" data-square="17"
       data-trap="trap" data-trap-kind="banana-peel"
       data-pickable="true" tabindex="0">
    <span class="square__trap" data-player="2" aria-label="Spieler 3: Bananenschale"></span>
  </div>

  <!-- a field holding a blocker -->
  <div class="square square--track" data-square="23"
       data-trap="blocker" data-trap-kind="big-ah-rock">
    <span class="square__trap" data-player="0" aria-label="Spieler 1: Big Ah Rock"></span>
  </div>

  <!-- a field inside an It's Not That Deep aura, holding no object of its own -->
  <div class="square square--track" data-square="19" data-trap-aura="true">
    <span class="square__trap"></span>
  </div>

  <!-- a clear field: the span is still there and renders nothing -->
  <div class="square square--track" data-square="31">
    <span class="square__trap"></span>
  </div>

  <!-- a pawn carrying two statuses at once -->
  <div class="pawn" data-player="1" data-pawn="0" data-r="14"
       data-statuses="stunned slippery" tabindex="0">
    <span class="pawn__mark"></span>
  </div>

</div>
```

| Selector | Meaning | Who sets it |
| --- | --- | --- |
| `.square--track > .square__trap` | **New.** Empty span, no text. Present on every one of the 40 track fields from the moment the board is built | view, once |
| `.square[data-trap="trap"]` | A single-use object: a pawn crossing this field sets it off and the object is gone | view, every update |
| `.square[data-trap="blocker"]` | A standing obstruction: no pawn may cross or land on this field while it is there. The move is refused before the player can make it | view, every update |
| `.square[data-trap-kind]` | Which object: `banana-peel`, `oil-spill`, `not-that-deep`, `big-ah-rock`. The first three are traps, the last is the blocker | view, every update |
| `.square[data-trap-aura="true"]` | This field is inside an It's Not That Deep's reach, so an offensive card aimed here does nothing. Up to seven contiguous fields, one of which also carries the trap | view, every update |
| `.square__trap[data-player="0..3"]` | The seat that put the object there. `board.css` lines 44 to 59 already turn `[data-player]` into `--player` and `--player-soft` for any element, so both are available on the span with no new mapping. Absent on a field with no object | view, every update |
| `.square__trap[aria-label]` | The object's name and its owner, from i18next. **This is where the words live**, so nothing needs a `content:` string (constraint 3) | view, every update |
| `.square--track[data-pickable="true"]` | This field may be clicked to answer the card being played. **The value is unchanged and the meaning is new**: it used to be all 40 fields, and for a trap card it is now only the legal ones. See § 4.3 | view, while a card is mid-play |
| `.square--track[tabindex="0"]` | **New.** A pickable field is reachable from the keyboard. Present only while it is pickable | view, while a card is mid-play |
| `.board[data-picking="free-square"]` | **New value** on an existing attribute. The board is asking for an empty field, as opposed to `track-square`, which asks for any field | view |
| `.pawn[data-statuses]` | A space-separated list of the statuses on that pawn. Match with `[data-statuses~="stunned"]`. Absent when the pawn carries none | view, every update |

Eight values can appear in `data-statuses`. Only the first two are created or used by this issue; the
other six are already in the rules and go into the DOM in the same pass so that the attribute is written
once and not revisited:

| Value | What it means for the player | In scope for this brief |
| --- | --- | --- |
| `stunned` | This pawn loses its next turn. **New in this issue** | **Yes, D56** |
| `slippery` | This pawn slid rather than walked, so the field it stopped on hands out no card. Lasts this turn only | **Yes, D57** |
| `held`, `rock`, `ghost`, `locked`, `armoured`, `ragebait` | Six existing statuses, none of which is shown anywhere today | No. Listed as owed, answer them if D56 and D57 happen to settle them |

There is no `data-` attribute on `.pawn__mark` and none is planned. There is no `data-trap` on `.board`:
a trap is a fact about a field. `STATUS.PURGE` is deliberately absent from `data-statuses` because it
applies to the whole board rather than to a pawn, and it has no mark anywhere yet either.

### Tokens that already exist, and what they are spoken for

Listed so that the answer knows which hues are taken before it picks one. From `tokens.css`.

| Token | Value today | Already used for |
| --- | --- | --- |
| `--color-square`, `--color-square-edge` | `#fffefa` / `#4d3c65`, `#3a2b55` / `#1c1230` | The field itself and its edge |
| `--color-skill`, `--color-skill-soft` | `#0f9c93` / `#33d2c4` | **D27's skill diamond.** Teal, both skins |
| `--color-hint`, `--color-hint-soft` | `#a35de0` / `#c08bf2` | **D7's legal-target ring**, and every focus ring in the game. Violet, which is why D27 did not use it |
| `--color-warn`, `--color-warn-soft` | `#e07038` / `#f2955c` | **The refusal strip.** "You cannot do that." See § 4.4 |
| `--color-p0` to `--color-p3` and their `-soft` pairs | four seat colours | Every region and every pawn |
| `--seat-shape-0` to `--seat-shape-3` | `circle()`, `polygon()`, `inset()`, `polygon()` as `clip-path` values | **D16 and D48**, how a seat is told apart without colour. Available on the trap span for D53 |
| `--cell`, `--radius-sm`, `--radius-md` | `board-size / 11`, `cell * 0.22`, `cell * 0.32` | Field geometry |
| `--border-hair`, `--border-thick`, `--border-ink` | `cell * 0.055`, `0.06`, `0.07` | Outlines. D27's diamond uses an inset `--border-ink` shadow |
| `--color-ink` | `#3a2b55` / `#1c1230` | Every outline in the game |
| `--layer-square` to `--layer-refusal` | 1 to 5 | Stacking. A trap mark sits above the field and below a pawn |
| `--motion-feedback` | `90ms` | The NFR-11 budget. D27's diamond transitions its inset over it |
| `--motion-refusal-hold` | `4s` | **D20's answer**, how long a refusal stays readable. The precedent for D60 |

---

## 4 Facts the design must match

Every number and rule here comes from a document. None is invented in this brief.

### 4.1 The four objects and what they do

From Game Design Document § 7.2, as the Product Owner confirmed it on 2026-09-02. Where the shipped code
disagreed with the GDD, the GDD won and the code is being changed, so this table is the new truth and not
a description of what runs today.

| Object | `data-trap-kind` | Kind | What it does |
| --- | --- | --- | --- |
| Banana Peel | `banana-peel` | trap | The next pawn to cross it is **stunned and loses its next turn**. It does not move the pawn at all |
| Oil Spill | `oil-spill` | trap | Whoever steps on it **slides 3 to 5 fields forward**, hands out no card on the field it stops on, and can be carried into a capture |
| It's Not That Deep | `not-that-deep` | trap | The pawn is pushed **1 field back**, and while the trap stands, **offensive cards aimed within 3 fields of it do nothing**. Nullifying does not use the trap up |
| Big Ah Rock | `big-ah-rock` | **blocker** | The field is impassable for **3 rounds**. On being placed it also knocks the nearest enemy pawn behind it back 3 fields. A pawn already standing on the field is not moved and may walk off |

Two behaviours that apply to all four and matter for how a mark should read:

- **A trap never fires under a pawn belonging to the player who placed it.** So a trap you can see is not
  necessarily a trap that threatens you, and whose it is may be worth reading at a glance (D53).
- **A trap fires on crossing, not only on landing.** A pawn that walks past a field sets off whatever is
  on it. A skill square is the exact opposite and only counts on a landing. That asymmetry is deliberate
  and is recorded in `notes/05-game-core-building-blocks.md`.

### 4.2 The board these sit on

- **40 shared track fields**, numbered 0 to 39, drawn on the 11 by 11 grid by spec 01 D3.
- **One object per field, never two.** The rules layer refuses a second one.
- **An object may not be placed** on a field that already holds one, on a field a pawn is standing on, or
  on one of the four fields where a seat enters the ring (0, 10, 20 and 30). So at most 36 fields are ever
  offered, which is what D59's picking state has to render.
- **Eight of the 40 fields are skill squares** at any moment, and a used one moves to a random other
  field. So a field can gain or lose D27's diamond between two turns, and a trap can be standing on one.
- **Up to 16 pawns**, 4 per seat, 2 seats in a two-player match.
- **Six objects can be on the board at once** in the worst case: three firing kinds, two copies of each
  card in the pool.

### 4.3 What is new about `data-pickable` on a field

Today `[data-pickable]` on a field is styled by **nothing**, and the picking mode is signalled only by
`[data-picking]` on the board. That was survivable when one card in 29 pointed at a field.

Issue #45 changes the arithmetic: **five cards point at a field and four of them are the trap cards.**
Two things follow, and both are D59.

- A trap card offers at most 36 of the 40 fields, and the four it refuses are refused for three different
  reasons. A player who cannot see which fields are offered will click a refused one.
- **A field cannot be reached from the keyboard at all today.** `bindPickEvents` binds `click` on a
  pickable field and no `keydown`, and no code gives a field a `tabindex`. Pawns and cards both got a
  keyboard pair; fields were missed. Issue #45 adds the handler and the `tabindex`, so a focus state for a
  field is needed and does not exist. NFR-08.

### 4.4 The announcement, and the colour it currently ships in

A trap firing moves a pawn, or takes a turn away, **without the player having asked for it**. So the game
has to say so. The message region already exists: `.move-refusal`, hanging off the bottom edge of the
board, which spec 04's D35 chose so that it costs no page height.

`showMessage` already writes two attributes on it, `data-reason-key` and `data-message-kind`, and
`refusal.css` reads only the first. **`data-message-kind` is an existing seam that no stylesheet uses.**
Issue #45 starts writing `data-message-kind="trap"` into it.

**The problem, stated honestly, because it is a deviation and not a request.** `refusal.css` paints that
strip in `--color-warn-soft` with a `--color-warn` dot. That is the colour the game reserves for "you
cannot do that". A trap going off is not a refusal: the player did nothing wrong. Announcing it in the
refusal orange repeats exactly the defect D40 fixed when it took the win message out of that strip.

It ships that way anyway, and the reasoning is recorded in
`notes/04-frontend-building-blocks.md` so it is not mistaken for an oversight: a trap that eats a turn in
silence is a bug, a trap announced in the wrong hue is cosmetic debt with a brief open against it, and
`CLAUDE.md` forbids Claude Code from inventing a third treatment to sit between them. **D55 is the
decision that fixes it.**

### 4.5 What NFR-12 now requires of anything new

NFR-12 reads: *Players are distinguishable without relying on colour alone: shape, pattern or label as
well.* It was met on 2026-09-02 by spec 06, and `greyscale.spec.js` runs green with no expected-failure
marker for the first time since 2026-08-30.

The trap span carries `data-player`, so **whatever answers D53 has to survive `html { filter:
grayscale(1) }`**, and `greyscale.spec.js` must still pass with the trap marks present. The four
`--seat-shape-*` tokens exist precisely for this, and they are already used on the pawn at 38 per cent of
the piece. Reusing a seat shape on a 1-cell field, next to a trap mark, next to a skill diamond, next to a
target ring, is a crowding problem rather than a palette problem, and it is the hard part of D53.

---

## 5 Open decisions this handoff must answer

Ten, continuing from D50. Each with its reason and at least one named rejected alternative, as always.
D55 and D59 are the two whose absence is visible on screen; if the delivery has to be cut short, cut from
the bottom of this list rather than the top.

**D51. What a trap looks like on a field.** Three kinds share one shape language, or they do not. Is the
kind told apart by form, by fill, by an inner geometry, or not told apart at all? Constraint 3 rules out a
letter or a word, and § 3 already gives the object an `aria-label`, so the mark can be less specific than
the name if that reads better. If the three kinds should look identical and only the `aria-label`
distinguishes them, say so: that is a legitimate answer and it is cheaper.

**D52. How a blocker reads differently from a trap.** These are genuinely different things and the DOM
separates them for that reason. A trap is a single-use surprise that may not even be aimed at you. A
blocker is a standing wall that refuses a move outright and lasts 3 rounds. Same family with one variable
changed, or two different looks? Note that `01-spec-foundations-and-board.md` § 5 already predicted this
state from the other direction, suggesting "a sixth field state, something like `data-blocked="true"`", so
confirm `data-trap="blocker"` or replace it.

**D53. Whether and how the owning seat is shown, and what it costs.** The Product Owner requires the owner
visible. NFR-12 forbids colour alone. § 4.5 is the constraint and § 4.1 is the reason it is worth
anything: a trap belonging to the player about to walk over it will not fire. If the answer is that the
owner is shown by colour only and NFR-12 is met elsewhere on the field, argue it; if the answer is that
the owner is not worth showing on a 1-cell field at all, argue that instead and say what the rules layer
should do with the `data-player` it is already writing.

**D54. How three marks on one field coexist.** Trap, D27's skill diamond, D7's legal-target ring and
pulse. D27's answer to two marks was to step the diamond back to `inset: 30%`; there is no answer for
three, and D59 can add a fourth. Does something give way, does something take a different position on the
field, or is the stack accepted as busy?

**D55. What a trap firing looks like, and what the announcement is.** Two halves, and the second is the
one that fixes § 4.4.

- **On the field:** the object is consumed and the mark disappears. Is that a transition, and how does a
  Banana Peel that **moves nothing at all** read as having happened? This is the case where the pawn
  arrives exactly where the player aimed it and silently loses its next turn.
- **In the strip:** is a trap announcement the D9 refusal component in a second treatment, keyed off the
  `data-message-kind` seam § 4.4 describes, or a component of its own? Whichever it is, it must not be
  `--color-warn`.

**D56. How a stunned pawn reads.** A stunned pawn cannot be moved for one of its owner's turns. Today
**nothing is shown for any status on any pawn**, so this is the first one. Both `.pawn` pseudo-elements
are taken (spec 06 constraint 7), so a status treatment is either a third layer, a change to
`.pawn__mark`, or something on the field beneath the pawn. Note that a stunned pawn is also simply not
`data-movable`, which is a state that already has a look, so part of the answer may be "the existing
absence is enough".

**D57. How the Oil Spill `SLIPPERY` status reads.** It lasts one turn and its only consequence is that the
pawn collects no card from the field it stopped on. Much weaker than a stun. Answerable together with D56
as one "pawn status marks" decision, and if you do that, say so explicitly rather than leaving one of the
two looking unanswered.

**D58. Whether the It's Not That Deep aura is drawn, and how.** Up to seven contiguous fields, one of
which also carries the trap itself. A player who cannot see the aura cannot avoid wasting an offensive
card inside it, which is the whole point of the card. Against that: seven fields tinted at once is a large
amount of board, the aura moves the moment the trap fires, and `data-trap-aura` ships in the DOM whether
or not it is drawn. "Not drawn, and here is why" is an acceptable answer with a reason.

**D59. What a pickable field looks like, and its keyboard state.** See § 4.3. Three sub-questions: how a
pickable field differs from D7's legal **move** target, since both mean "click here" and they are never on
screen at the same time; whether the four refused fields need to look refused or merely not-offered; and
what focus looks like on a field, given that D11's focus ring is `--color-hint` and a legal-target ring is
also `--color-hint`. This also answers the fourth unnumbered leftover in `00-open-requests.md` § 4, "how a
pickable pawn differs from a movable one", asked for a field instead.

**D60. Whether a trap announcement gets a hold token, and whether the game waits for a mid-turn one.** D20
is the precedent: the four-second refusal minimum became `--motion-refusal-hold`. Two cases here. A trap
fired by a dice move can be held before the handover screen covers the board, and Claude Code has the hook
for it. A trap fired by a **card** resolves mid-turn, the turn carries straight on, and the announcement
gets no guaranteed time on screen at all. Is that acceptable, or does the game owe the player a pause it
does not currently take?

### 5.1 Still open from earlier handoffs, not reopened here

D17, D21, D22, D23 and D24 from handoff 02, which never received a spec of its own. Three of the four
unnumbered leftovers from spec 03 § 5 and brief 04 § 5.1: the reaction countdown, whether the prompt strip
belongs at the foot or in the rail, and what an empty hand slot looks like. The fonts still loading from
Google Fonts since spec 01 § 5.

Answer any of them here only if the field work happens to settle it, and say which. D23 is the one most
likely to come up, because constraint 13 may force a `board.css` split.

---

## 6 Deliverables

| File | Contains |
| --- | --- |
| `01-Design/Handoff/07-spec-trap-marker.md` | The five-section spec: files delivered, D51 to D60 answered each with a reason and a named rejected alternative, tokens added if any, every state in § 3 checked, what is still open |
| `src/ui/styles/board.css` | Amended, or split with the seam named per constraint 13. The trap and blocker marks, the owner, the three-mark case, the aura, the pickable field and its focus. Under 300 lines after `npm run format` |
| `src/ui/styles/pawn.css` | Amended. The status marks of D56 and D57 |
| `src/ui/styles/refusal.css` | Amended, or a second file named. The trap announcement treatment of D55 |
| `src/ui/styles/tokens.css` | Only if a new token is needed. Additive: nothing removed or renamed without saying so in the spec |
| `01-Design/Handoff/handoff-07/` | Optional. A mockup shell if you need one to look at it, in its own folder with a `README.md` saying it is not production code. Deleted after the review, the same as `handoff-04/` and `handoff-05/` |

If a file arrives that this brief did not ask for and you did not change, **say which commit or date the
snapshot was taken from.** Handoff 04 delivered a `board.css` that predated an NFR-02 split and copying it
would have reverted the split silently. Handoff 05 got this right and it is now the standing rule.

One improvement spec 06 named and deliberately did not make, which a delivery touching `board.css` should
take: the seat-to-shape mapping now repeats in four stylesheets and belongs in the one `[data-player="N"]`
block in `board.css`. D53 puts a seat mark on a fifth element, so this is the delivery to fix it in.

---

## 7 Out of scope, said explicitly

- **The rules themselves.** What a trap does, when it fires, where it may be placed, how far a slide
  carries. That is `core/`'s and the Game Design Document's, and § 4.1 is the finished answer.
- **The trap card faces.** The four cards are drawn, in the hand and in the pool overview, and spec 03
  owns them. This brief is about the object on the field, not the card that placed it.
- **The board, the pawns, the two hands and the overlays** beyond what a mark forces. Amend only where a
  decision needs it, and say so.
- **The six statuses other than `stunned` and `slippery`.** In the DOM, listed as owed, not asked for.
- **`STATUS.PURGE`**, which is board-scoped and has no element yet.
- **The palette.**
- **Audio and every sound cue.** Issue #40.
- **The rules screen, S10** (FR-35).

---

## 8 The landing checks

Claude Code does not merge a spec unread. The five standing ones plus two:

1. D51 to D60 answered, none silently skipped.
2. Every answer carries a reason **and** a named rejected alternative.
3. No CSS file over 300 lines after `npm run format`.
4. No user-facing string in a `content:` property.
5. Every state in § 3 actually styled, and any element the spec needs that § 3 does not promise is named
   rather than assumed.
6. **`npx playwright test tests/e2e/traps.spec.js` passes in Chromium, Firefox and Edge.** That suite is
   written before this brief is answered and asserts attributes, so it should pass throughout; it is here
   because a stylesheet that hides a field or changes its box can break a click.
7. **`npx playwright test tests/e2e/greyscale.spec.js` still passes with no expected-failure marker**,
   with the trap marks present. See § 4.5.
