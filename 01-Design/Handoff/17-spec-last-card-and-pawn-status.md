# Handoff 17, spec: the last card played, and what a pawn carries

**From:** Claude Design
**To:** Claude Code
**Date:** 2026-09-06
**Answers:** [17-brief-last-card-and-pawn-status.md](17-brief-last-card-and-pawn-status.md), D100 to D103
**Read against:** the local stylesheet copies of handoff 16, plus the four DOM facts brief 17 § 2
promises from `dev` and the four feature branches of issue #87. Section 1 says exactly what that
means and what to do about it.

---

## 0 The one idea in all four answers

The playtest found three things the player could not see, and the four decisions below keep landing on
the same rule for what to draw:

**Draw the fact that changes what somebody does next. Put the fact that changes only a rule into
words.**

It is why `armoured` and `ghost` get one mark and not two: they end differently, and at the moment a
capture is refused they say the same thing. It is why `nullified` and `negated` read identically in the
last-card plate: an aura cancelled it and a Nühü cancelled it are two rules and one fact. It is why the
`rock` pawn changes shape while `held` gets a tag: one of them is something the other three players
have to walk around, the other is something its owner cannot pick this turn. And it is why D102 comes
back **no**: a designed tooltip is a fifth place to say a thing the piece, the strip and the plate now
say between them.

Words are not the weak option here. `title` from issue #94 is on every pawn already, `ui.json`
`status.*` is written in both languages, and the strip speaks at the moment of the refusal. What was
missing was the glance, and the glance is what D101 and D100 build.

---

## 1 Files delivered, and how to land them

| File | State | Lines |
| --- | --- | --- |
| `src/ui/styles/last-card.css` | **New.** D100 | 234 |
| `src/ui/styles/pawn-status.css` | **New.** D101, and D56 and D57 moved into it | 225 |
| `src/ui/styles/pawn-drag.css` | **New.** D103 | 86 |
| `src/ui/styles/pawn.css` | **Amended, rule by rule.** The two status blocks move out | 192, was 253 |
| `src/ui/styles/board-trap.css` | **Amended, rule by rule.** The D52 blocker rule is deleted | 96, was 115 |
| `01-Design/Handoff/17-spec-last-card-and-pawn-status.md` | New | n/a |

**The two amendments are diffs and not whole files**, which is the request made after handoff 11 and
repeated in 13, 14 and 16. They are in `handoff-17/diffs/`. Both are deletions plus a rewritten header
comment, so a diff is also the honest shape: nothing in either file is being replaced with a newer
opinion, the rules are leaving.

**Nothing else is touched.** No `tokens.css`, no `app.css`, no `hud.css`, no `board.css`, no
`refusal.css`. **No new token, no new duration, no load order surprise**, and the three new files go on
the end of their neighbours:

```
… board-trap.css, pawn.css, pawn-status.css, pawn-drag.css, …
… hud.css, …, card.css, card-state.css, card-reveal.css, last-card.css
```

`last-card.css` must load after `card.css` (it overrides nothing in it, but it reads the component's
sizing) and after `hud.css` (it copies the seat plate's chrome and must be able to win a tie). It can
go last in the file; nothing loads after it.

**One token is read that this side's copy of `tokens.css` did not have.** `--layer-card-reading: 4`,
which Claude Code added on 2026-09-04 for the dice card painting over a revealed skill card. It is in
the repository, it is not in this package, and `last-card.css` reads it for the reveal. If it has moved
or been renamed since, that is the one line in the delivery to check.

---

## 2 The answers

### D100. The last-card slot

**The slot is a fifth plate at the right-hand end of the HUD row, 15.5rem wide, the same object as a
seat plate. It shows the card's name, the seat that played it and the turn, and it holds the card
itself at the reference size, revealed on hover or on focus.**

**Where it goes, and it displaces nothing.** The rail was the obvious home and it has no room. Measured
on the fitted stage at 1440 by 900: the three rail plates stand about 723 px in a column about 738 px
tall, so the slack in the rail is roughly two centimetres of nothing. A fourth plate there is paid for
out of the dice hand's `--card-u`, which is the one size in the game a player is asked to compare three
objects at. The board column has slack at 1440 by 900 and none at 1920 by 1080, where the board is
larger than the rail, so a plate above the board would sit **on** the board at the larger size, which
is the thing D98 spent a handoff undoing.

The HUD row has the room and, more to the point, it is the right row. Whose turn it is, how far each
seat has got and what was played last are one kind of fact: public, true between turns, nobody's hand.
Four plates at 15.5rem with their gaps are 925 px in a 1397 px row, so a fifth of the same width fits
with 236 px still spare, and `.hud` already wraps and centres, so nothing in `hud.css` changes. **Zero
declarations in `hud.css`, zero in `app.css`.**

*Rejected: a plate in the rail above the dice hand.* It is where the eye already is and it costs the
dice cards about 13 per cent of their size, permanently, for a fact that is read once a turn.

*Rejected: the foot of the board column.* No room at 1920 by 1080, and D98 has just moved the one strip
that was there off the board.

*Rejected: the chrome row.* `--layer-chrome` floats over everything and the row is the three persistent
controls. Match state in it would be the first thing there that is not a control.

**A face, not a small card.** The plate carries the card's **name** in words, not a thumbnail. A card at
a unit small enough for a 15.5rem plate is about 32 px wide, at which its 3 px ink edge is under a pixel
and its title is not a title. The name is legible, it is the thing a player would say out loud, and the
card is one hover away at the size its paragraph was written for.

**The reveal is D66 reused and not a second mechanism.** The `.card--full` element is in the plate,
absolutely positioned so it costs no height, at `opacity: 0` and `scale: 0.94`. Hover or focus brings it
up over `--motion-reveal` after `--motion-reveal-delay`, hanging below the plate and growing down and to
the left over the head of the rail, at `--layer-card-reading`. It is `pointer-events: none`, so it can
never take a click from a dice card underneath it.

*Rejected: the card visible in the plate at all times.* It is the tallest thing that could be there and
it would make the HUD row a card row.

**The four outcomes.**

| Outcome | How it reads |
| --- | --- |
| `resolved` | Nothing. It is what almost every card does, and a treatment on the ordinary case leaves the plate shouting between turns |
| `pending` | A violet edge around the plate, breathing on `--motion-pulse`. Violet is the game's colour for a thing that wants an answer, and the breath is the only motion in the plate, because this is the only outcome that is not yet a fact |
| `nullified` | The card's name struck through, the seat dot dormant, the revealed card desaturated with `card-state.css`'s own unplayable filter. The sentence names the aura |
| `negated` | Identical. The sentence names the Nühü |

`nullified` and `negated` reading the same is § 0's rule, not an economy. A player who wants to know
which one it was reads the sentence, which is one line long and right there.

**Before the first card**, `data-empty="true"`: the plate is in the row from the first frame of the
match, dashed and dormant, with the "nothing played yet" sentence and no seat dot. It holds its place
because a plate that appears on turn three moves the other four sideways, once, in the middle of a game,
for no reason the player can see. The dashed edge is `hand.css`'s empty-slot treatment, the project's
one existing answer to "a place where a thing will be".

*Rejected: rendering the plate only once there is a card.* One sideways jump per match is worse than a
dashed rectangle for two turns.

**A bot's play is not drawn differently.** The seat dot and the name do it, and `player-labels.js`
already says "Bot 3". A bot playing a card is not a different kind of event, and a bot glyph here would
be the second place in the UI that has to know which seats are computers, after the HUD's own
`data-controller` from D85.

**One entry, not two or three.** The ask is "what just happened". Two entries is a log, which D73
rejected for the strip on the same screen and for the same reason.

**And D87 is not made moot by this**, since brief 17 § 6 asks. The strip announces a bot's play in the
moment, which is the thing that catches an eye that was looking somewhere else; the plate is what you
can look **at**, afterwards, deliberately. They are the moment and the record. D87's answer is unchanged
and still two declarations on the `data-message-kind` seam D55 opened, and it is not delivered here
because brief 14 owns it.

### D101. Marks for the six unstyled statuses, and the protection aura

**Three channels, not one slot.** D57 reserved `.pawn__status` for all six and the playtest showed why
one slot cannot carry them: Lock In writes `locked` **and** `armoured` in a single play, so the most
common multi-status pawn in the game needs two marks at once. The nine kinds sort by who the fact is
aimed at.

| Channel | Kinds | What it is |
| --- | --- | --- |
| The piece | `rock`, `stunned` | The whole object changes. These stop the pawn being a pawn |
| The shell | `armoured`, `ghost` | A second ink ring standing off the disc. "You cannot take this" |
| The tag | `locked`, `held`, `ragebait`, `slippery` | `.pawn__status`, one kind at a time. "This turn cannot do that with it" |

`purge` is board-wide and never in `data-statuses`, so nothing reads it.

**The shell is one mark for `armoured` and `ghost` together (D101.2).** They differ in how they end: one
lasts a round, one is spent by the capture it dodges. At the moment a player points at the piece and is
told no, they say the same thing, and that moment is the only one where the mark is being read. Which of
the two it was is in the `title` and, if the card was just played, in the last-card plate.

It is drawn with `outline` on the disc, which is the one box property nothing on the pawn uses:
`::after` is the disc, `::before` is the state ring, and `box-shadow` on both is spoken for. Ink and not
a hue, so it survives greyscale and both skins on all four seat colours. It follows `border-radius`, so
an armoured rock gets a squared shell for nothing. Its outer edge sits at 0.66 of the piece's width from
the centre and the state ring starts at 0.70, so they are concentric, they never touch, and they are
never confusable: the shell is thin, ink and still, the state ring is thick, violet and breathing.

*Rejected: a grey disc, which the brief pre-rejected and was right to.* `--color-dormant` is the colour
of a seat nobody is playing.

*Rejected: an aura, in the sense of a soft glow.* Nothing in this game is blurred (D14), and a glow at
the size of a pawn on a cell is the first thing to disappear at the board's floor.

*Rejected: two marks, one each.* Two ring weights would be a distinction nobody looks up, on the one
mark that has to be read instantly by somebody who is being told no.

**`rock` changes the piece (D101.3).** The corners square off, the eyes close, the fill mixes 46 per
cent toward dormant and the shadow lengthens to `--shadow-lift`. The square corner is **D52's own
language, one level up**: a trap is a small thing lying on the path, a blocker is the path being gone.
Issue #90 moved that rule from the field to the pawn and the mark moves with it, which is why retiring
D52 costs the game nothing. The eyes close because the creature is inside the stone and because a face
invites a click that will be refused. The fill goes less far than `stunned`'s 58 per cent, because a
rock is still somebody's pawn and comes back.

*Rejected: a tag for `rock`.* It is the one status the other three players plan around, and a 12 px mark
on a shoulder is not what "there is a wall here" looks like.

**The tag carries four kinds, and precedence is source order.** `locked` beats `held` beats `ragebait`
beats `slippery`. The order is how much of the turn the status takes away: `locked` and `held` both take
the pawn out of the choice and `locked` lasts longer, `ragebait` puts it into the choice and only matters
if it is in the choice at all, and `slippery`'s one consequence has already happened by the time the mark
is read. In the stylesheet the four rules are written in reverse, each setting the same property set on
both pseudo-elements, so the last match wins outright and there is not a single `:not()` chain in the
file.

| Kind | The ink inside the tag |
| --- | --- |
| `locked` | The tag fills solid. The strongest mark for the status that takes the most, and the only one that is a shape rather than a drawing at 12 px |
| `held` | Two upright bars. The shape every player reads as paused, and the only symmetrical mark, which is what tells it from `slippery` at the board's floor |
| `ragebait` | A bar over a dot. An exclamation drawn as geometry, not set as a character, so no glyph has to be right in two languages. The only status that compels rather than prevents, so it is the only loud one |
| `slippery` | The skid, unchanged from D57 |

**A Lock In pawn wears two marks and that is deliberate.** A filled tag on the shoulder and a shell
around the piece. The two facts are aimed at two different people: the shell is for the player who wants
to capture it, the tag is for the owner, who cannot move it.

**Greyscale and the dark skin.** Every mark in D101 is ink on the seat fill or ink on `--color-dormant`,
and every one is a difference of geometry: a ring, a square corner, a filled disc, two bars, a bar and a
dot, a diagonal. None of them is a hue, so none of them is touched by the 1.15:1 red-to-blue problem
16-spec § 4 recorded and D99 books. **This is the first decision since D97 that adds to NFR-12 rather
than spending it.**

### D102. The native `title` stays, and there is no designed tooltip

**No.** The `title` from issue #94 stays as the accessible name and nothing replaces it.

The tester's report is the argument. They tried to capture, were refused, and read it as a bug on the
square. The strip named the refusal and the piece said nothing: **the missing thing was on the piece,
at a glance, and D101 is what puts it there.** A hover readout would not have helped, because the
player was clicking rather than hovering, and it is invisible on touch, which is where a delayed tooltip
is worst.

*Rejected: a designed tooltip on the pawn.* It is a fifth place to say a thing the piece, the strip and
the last-card plate now say between them, and it is the only one of the five that requires the player
to already suspect something.

*Rejected: a line in the seat's HUD row.* A seat can have four pawns carrying four different statuses.
The row would have to list them, and D63 has just had to widen that plate to fit four numbers.

*Rejected: folding it into D100's plate.* The plate is about a card, not about a pawn. A pawn is still
carrying Built Different three turns after the card that put it there.

**What this costs, stated.** A player who wants to know **which card** protected a pawn hovers it and
waits for the browser, or looks at the last-card plate if it was recent. That is the same cost the game
already pays, and it is now the only thing the `title` is load-bearing for.

### D103. The carried pawn

**The piece grows to 1.22, throws the longest shadow in the game, and loses every transition it has.
The field under the pointer answers with an ink ring drawn inside its own edge.**

`data-selected="true"` is set in the same moment as `data-dragging="true"`, so 1.14 is already on the
piece and the carry has to be visibly more than the pick. 1.22 wins by load order at equal specificity.
The shadow goes to 0.30 of a cell against `--shadow-lift`'s 0.18: the longest shadow in the game, and
the only one a player produces by holding something. Hard and unblurred like every other one (D14).

**`transition: none` is the load-bearing declaration.** `pawn.css` moves a pawn on `--motion-move`,
which is right for a piece crossing the board on its own and fatal for one following a finger: 240 ms of
easing behind the pointer reads as the game being slow, not as the piece being heavy.

**The release needed one line that is not obvious.** The position of a carried pawn is the sum of two
properties, `transform` from the grid coordinates and `translate` from the drag offsets, and the view
clears the offsets and writes the new coordinates in the same frame. With only `transform` animated the
piece snaps back to the square it left and then slides to the new one, which is the one thing a drag must
never do. `pawn-drag.css` restates `pawn.css`'s transition with `translate` added, so both travel
together and the path starts exactly where the hand let go.

*Rejected: no tilt.* The tilt is `stunned`'s and it is the only piece on the board that is not upright.
Two reasons to be crooked is one too many.

*Rejected: amending `pawn.css` for the transition line.* The whole gesture is then in two files, and the
next person to read `pawn.css` finds a rule about an attribute the file never mentions.

**The target answers, and it answers as a field.** `[data-drop="true"]` gets an ink ring drawn inside its
own edge with `outline` and a negative `outline-offset`, which is the trick `hud.css` already uses on the
seat dot. It is told apart from the selected state trivially, because selected is on the pawn and this is
on the square; and it is told apart from every other square state by being the only one made of
`outline`. The square's own edge, `data-legal-target` and `data-pickable` are all `box-shadow: inset`,
they collide with each other already (D61, still open), and a fourth inset ring would join that argument
for nothing.

Ink and not a hue, so **this rule is correct whichever way D61 is settled** and no second colour appears
on the board mid-gesture.

*Rejected: lighting every legal target harder while a pawn is carried.* They are already lit. The
question a carried piece asks is not "where may I go", it is "will it land here".

`data-drop` is the one attribute this handoff needs that brief 17 § 2 does not promise. It is in § 5.

---

## 3 Tokens

**No token is added, renamed or removed.** Everything below already exists.

| Token | Read by | For |
| --- | --- | --- |
| `--color-ink`, `--border-hair`, `--border-thick`, `--border-ink` | all three files | Every mark in D101 and D103 is ink geometry |
| `--color-dormant` | `pawn-status.css`, `last-card.css` | The tag ground, the `rock` and `stunned` mixes, the dormant seat dot |
| `--color-hint` | `last-card.css` | The `pending` edge. The game's colour for a thing that wants an answer |
| `--color-surface`, `--color-panel`, `--color-dormant-soft` | `last-card.css` | The plate, copied from `.hud__seat` |
| `--seat-mark` | `last-card.css` | The seat dot, the same 0.85rem the HUD and the chrome wear |
| `--radius-sm` | `pawn-status.css` | The `rock` corner. D52's value, on the pawn now |
| `--shadow-lift`, `--ink-dim`, `--cell` | `pawn-status.css`, `pawn-drag.css` | The stone's weight and the carried piece's 0.30 of a cell |
| `--motion-pulse` | `last-card.css` | The `pending` breath. It collapses to 0 ms under reduced motion and the ring stays up, which is D12 |
| `--motion-reveal`, `--motion-reveal-delay` | `last-card.css` | The reveal, at D68's two values |
| `--motion-move`, `--ease-move`, `--motion-feedback`, `--ease-ui` | `pawn-drag.css` | The release, and the transition the drag suspends |
| `--layer-pawn-active`, `--layer-region` | `pawn-drag.css` | The carried piece and the field under it |
| `--layer-card-reading` | `last-card.css` | The reveal. **Added by Claude Code on 2026-09-04, not by this package** |
| `--text-xs`, `--text-sm`, `--tracking-wide`, `--font-display` | `last-card.css` | The plate's two type sizes, both taken from `hud.css` |

---

## 4 The states, against the brief's DOM contract

**The pawn**, brief 17 § 2.1. Every state below was drawn on all four seats, in both skins and in
greyscale, on the review canvas named in the README.

| State | Drawn |
| --- | --- |
| No `data-statuses` | Unchanged. The piece, two eyes, the seat colour |
| `stunned` | The tilt and the 58 per cent dormant mix. D56, moved file, unchanged |
| `slippery` | The skid tag. D57, moved file, unchanged |
| `rock` | Square corners, no eyes, 46 per cent dormant, `--shadow-lift` |
| `armoured`, `ghost`, or both | One shell |
| `locked` | Filled tag |
| `held` | Two bars |
| `ragebait` | Bar over dot |
| `locked armoured` (Lock In, one play) | Filled tag **and** shell. The common case |
| `rock slippery` | Squared stone wearing the skid |
| `stunned` plus `data-movable` | Cannot occur; a stunned pawn is not movable. Nothing depends on it |
| `data-dragging` plus any status | The status marks are untouched by the drag. The piece is the same object in the hand |
| `data-selected`, `data-captured`, `data-movable`, `:focus-visible` | Unchanged. `pawn.css` still owns all five and the shell is inside all of their rings |

**The last-card plate.** `data-empty="true"`; `resolved`, `pending`, `nullified`, `negated`; four seats;
hover, `:focus-visible` and the pinnable `.last-card--reading`; and the plate in a two-seat row and a
four-seat row, above and below the 84rem breakpoint.

**The drag.** `data-dragging="true"` on a pawn carrying nothing, on a `locked armoured` pawn, and over a
`[data-drop="true"]` field that is also a legal target, a skill square and a trapped field.

---

## 5 What Claude Code writes

Four things, and three of them are one attribute or one element.

**1. The last-card section, once, as the last child of `.hud`.** Not a sibling in the app grid: the HUD
row spans both columns and the plates centre, so the plate has to be in that flex row to sit at its end.

```html
<section class="last-card" data-player="2" data-outcome="resolved" data-empty="false" tabindex="0">
  <h2 class="last-card__heading">…</h2>   <!-- t("lastCard.heading") -->
  <p class="last-card__line">…</p>        <!-- the card's own name, from the card data -->
  <p class="last-card__by">…</p>          <!-- t("lastCard.<outcome>", { player, turn }) -->
  <div class="last-card__reveal">
    <div class="card card--full" data-card-id="reaction-nuehue" …>…</div>  <!-- card-view.js, as is -->
  </div>
</section>
```

Four differences from the element brief 17 § 2.2 proposed, all of them small:

- **`data-player`, not `data-seat`.** Same value. `board.css` maps `--player` off `[data-player]` for
  the whole document, and that mapping is the one place seat colour is written since D97. A second
  attribute name means a second mapping.
- **`.last-card__by` is new**, and it is where the seat dot and the outcome sentence live. `__line` is
  the card's name on its own, so it is the one thing in the plate that can be struck through cleanly.
- **`.last-card__reveal` is new**, a wrapper the card sits in. It carries the position, the layer and
  the transition, so nothing about `.card` changes and `card-view.js` renders it exactly as it does for
  the pool overview.
- **`tabindex="0"` on the section**, because the reveal answers focus as well as hover, which is D67's
  rule: every card in the game can be read from the keyboard.

`data-turn` is not read by CSS. Keep it if the view finds it useful; the number is in the sentence.
`data-outcome` and `data-empty` are both read.

**2. `data-drop="true"` on the field under the pointer during a drag**, cleared on `pointerleave` and on
release. One attribute, one field at a time. It is the only hook D103 needs that issue #91 did not ship.

**3. The `ui.json` keys.** English wordings below; German is Claude Code's, as always.

| Key | English |
| --- | --- |
| `lastCard.heading` | Last card |
| `lastCard.empty` | Nothing played yet |
| `lastCard.resolved` | {{player}}, turn {{turn}} |
| `lastCard.pending` | {{player}}, turn {{turn}}, unanswered |
| `lastCard.nullified` | {{player}}, turn {{turn}}, cancelled by an aura |
| `lastCard.negated` | {{player}}, turn {{turn}}, cancelled by Nühü |

`{{player}}` is `player.named` or `player.botNamed`, the same pair the line-up screen and the reaction
sentences use. When `data-empty="true"`, `lastCard.empty` goes in `.last-card__by` and the card's name
line is empty.

**4. Two test changes, both deletions.** `board-trap.css` no longer has a `blocker` rule, so any case
asserting the 76 per cent chip or its square corners should be deleted rather than pointed at the pawn:
the pawn's corner is a different element with a different value and a case that follows the mark from one
to the other is asserting the spec's prose, not the game. Nothing needs to be added for D101; the marks
are geometry, and a case pinning `inset: 22% 58% 22% 22%` would report the next adjustment as a defect.
If one assertion is wanted, assert that a pawn with `data-statuses="locked armoured"` renders **two**
marks, because that is the fact the playtest was about.

---

## 6 Noticed and not done

**`.pawn__status` is now shown by four kinds and hidden by five.** The span is on every pawn either way,
which is issue #45's contract and is right, but it means a pawn carrying only `rock` has an empty span
inside a squared disc. It costs nothing and it is worth knowing before somebody deletes it as dead.

**The `pending` plate and the reaction prompt are up at the same time**, by definition: a card is pending
exactly while a reaction window is open. Two violet things on screen, one in the rail and one in the HUD
row, both saying "somebody owes an answer". That reads as agreement rather than as noise, but it has only
been drawn, not played, and it is the first thing to look at in the next playtest.

**The plate makes the HUD row about 6 px taller** at the design resolution, because it has three lines of
type against the seat plate's two and the row stretches to the tallest. FR-31 has the room; it is
recorded because the next handoff to argue about page height should know where it went.

---

## 7 What is still open

Unchanged by this delivery: D17, D20 to D24 from handoff 02, D61 from brief 08, D62 to D64 from brief 09,
D81 and D84 to D89 from briefs 13 and 14. **D52 is retired**, as brief 17 § 0 asks, and its rule is
deleted rather than left inert.

**D99 is the one that matters to this handoff.** Every mark in D101 is ink geometry, so none of it rests
on the four seat hues; but the piece those marks are stuck to still tells you whose it is by colour
alone, and red against blue is 1.15:1 in greyscale. This delivery makes the board say more without
making that better. It is still a Product Owner call and it is still eight values in two skins.

**D87 is answered in prose in D100 above and deliberately not delivered.** Two declarations, brief 14's
to land.
