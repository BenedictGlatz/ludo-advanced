# Handoff 05, spec: the dice card pool overview

**From:** Claude Design
**To:** Claude Code
**Date:** 2026-09-02
**Answers:** [05-brief-dice-pool-overlay.md](05-brief-dice-pool-overlay.md), D43 to D47

---

## 1 Files delivered

| File | State | Lines |
| --- | --- | --- |
| `src/ui/styles/pool.css` | **Replaces** the placeholder, same path | 210 |
| `01-Design/Handoff/05-spec-dice-pool-overlay.md` | New, this file | n/a |

**No other stylesheet changes.** `card.css` is untouched: everything the overview needs is a rule
scoped to `.overlay__cards`, which is one selector deeper than every rule in `card.css` and so needs
no `!important` and no edit to the shipped file. `chrome.css` is untouched because D46 was answered
inside D42 and the row it describes is the row that shipped on 2026-09-01.

Nothing unchanged is included in the delivery. `pool.css` was read from `dev` at tree
`991ee06c60fa` on 2026-09-02, together with `card.css`, `overlay.css`, `hand.css` and `tokens.css`,
which the answers below are measured against.

The mockup is `Dice Pool and Pawn Mark.dc.html`, and its `view` switch also carries the pawn mark of
[06-spec-pawn-mark.md](06-spec-pawn-mark.md).

---

## 2 The decisions

### D43. Seven cards at once: at what size, and in what arrangement

**Four cards, then three, at `--card-u: 0.68`, in a panel of 54.5rem.** The short row is centred on
the same axis as the title, the sentence and the button.

**The factor is 0.68 because it already ships and because 0.62 is known to be too small.** 0.68 is
the skill hand's factor from D26, and D35 of the last handoff established what breaks below it: at
0.62 a card is 161 px wide and the kind pill lands under 9 px, which contradicts D26's own rule that
a shrinking card drops the rules paragraph and keeps the art and the pill. The placeholder used
0.62. A third factor invented for this screen would have been a third number to maintain, and 0.68
is the largest of the two that ship that lets four cards sit side by side inside a panel narrower
than the viewport.

**The arrangement is arithmetic, not preference.** At 0.68 a card is 11.05rem wide and 16.15rem
tall. Four of them plus three 1.5rem gaps plus 1.275rem for the stack of D44 to lean into plus the
panel's own 2rem of padding each side is 53.98rem, so the panel is 54.5rem. Five cards in that width
need 60.5rem, which is why the wrap after the fourth card is deterministic and not a consequence of
the viewport. Vertically: two rows, one gap, the stack's bleed, the title, the sentence, the button,
three panel gaps and the panel's padding come to 776 px, and the sheet's own padding takes it to
824 px inside 900. Section 2.8 is met with 76 px to spare, and no denomination is off screen.

The container is flex and not grid for one reason: `justify-content: center` centres a short final
row and four fixed grid columns cannot. That is what turns the ragged row into the panel's own
centred column.

*Rejected: a horizontal rail that scrolls.* Section 2.8 rules it out and is right to. A player who
scrolls to find the D20 has been shown a pool of six denominations first, and the whole purpose of
the screen is that the seventh exists.

*Rejected: a two-row grid of four and three, left aligned in four columns.* This is what the
placeholder does, and its own header says the bottom row is short and nothing says whether that
reads as deliberate. Left aligned it does not: the empty fourth cell reads as a card that failed to
load. Centred, on a panel where every other child is centred, it reads as the last line of a
paragraph.

*Rejected: filling the eighth cell with the face-down sentence.* It would have made the row
deliberate at the price of D45: a card-sized tile is as loud as a card, and section 4.2 is explicit
that the number is a reassurance and not a resource.

**`.card--full` survives as the reference size and is now used by the reaction prompt only.** It is
still the only size that shows the rules paragraph, and it is still what an inspect view would want.
The overview is not it: seven paragraphs are not what a player opens this screen to read.

### D44. How the copy count is shown

**Both: the number stays in the third tag, and the card is drawn as the pile it stands for.**

The tag is not the wrong place for the number. It is a locale string, NFR-03 keeps it out of the
CSS, and the tag row is already where the rest of the card's rules live. What the tag cannot do is
the thing section 4.1 says is the most useful thing on the screen: it says the number and not the
proportion, and seven numbers read one at a time do not add up to a distribution in anybody's head.

So the count is also the card's depth. Each copy behind the top one is drawn as a sheet: two hard
shadows, the sheet's face and then its ink edge 2 px further out, no blur, offset down and right in
the same direction as `--shadow-card`. A W6 or a W8 stands on four sheets and a W2 on two, so the
middle of the pool is visibly twice the thickness of its ends before a single word is read. The
weighting becomes the shape of the row.

| `data-copies` | Sheets drawn | Deepest offset |
| --- | --- | --- |
| 2 | 1 | 1rem times `--card-u`, 10.9 px |
| 3 | 2 | 1.4375rem times `--card-u`, 15.6 px |
| 4 | 3 | 1.875rem times `--card-u`, 20.4 px |

**This needs `data-copies` on the overview card**, an integer, the same number the third tag states
in words. See section 5. A count with no rule falls back to the single card in `card.css`, which is
the right failure: one card is a card, not a false claim about the pool.

*Rejected: a badge in the corner.* A second place for the same number, and it competes with the kind
pill, which is already a badge in a corner of that card.

*Rejected: size or repetition as the only carrier, with the number dropped.* Seven cards at seven
sizes cannot be compared to each other as objects any more, and the count in words is what a player
checks when they want to be sure. The pile shows the proportion and the tag states the number: they
answer different questions.

*Rejected: seven stacks with no tag at all.* Reading a pile of four as exactly four is guesswork at
this size, and "how many W20 are in there" deserves an answer rather than an impression.

**Two small legibility corrections come with it, both scoped to this screen.** The band drops
`.card__type`: every card here is a dice card and the panel is titled with that fact, so
"Würfelkarte" seven times is a label repeating the heading, and at 0.68 the two band labels together
put both of them in an ellipsis. The denomination gets the whole band. And a tag does not wrap:
"Reichweite 1 bis 12" broken over two lines reads as two tags, and at 19 characters the longest of
them fits the card's inner width at this factor.

### D45. Where the face-down sentence sits, and how loud it is

**It stays in the `.overlay__text` slot, unchanged. No DOM change.**

Section 4.2 is the whole answer. The number is 17 every time the screen can be opened, and 20 only
in a window a player cannot open it inside. A gauge, a counter beside the title or anything that
moves would be a moving part drawn around a value that does not move, and the first time a player
noticed it was always the same they would stop reading it. What the sentence is for is the
reassurance that the twenty cards are still there and three of them are in their hand, and a quiet
line under the title is exactly the volume that fact deserves.

It also earns its place where it is by what it is next to: the sentence is the only thing on the
screen that is about right now, and everything below it is about the pool's fixed composition. Above
the cards is where the difference is legible.

*Rejected: a gauge, 17 of 20 as a bar.* It oversells a constant and it invites the reading that the
pool is a resource that depletes, which is the one thing about the pool that is not true.

*Rejected: a counter beside the title.* It makes the number a headline, and it competes with the
title for the one line a player actually reads first.

### D46. A third chrome button

**Answered on 2026-09-01 inside D42 of [04-spec](04-spec-hud-menus-and-handover.md), and nothing
here reopens it.** The row carries three controls, ordered by how often a hand reaches for them:
pool overview, language, pause. Pause is last because it is the one that stops the game. The pool
button is the only control in the row with a coloured edge, the dice family's violet, because it is
the only one that opens a panel about a subsystem rather than about the session.

**Three buttons is not the point at which the row needs a different structure.** The row is a title
bar: one sentence that takes the slack, then a group of pill controls at the end. Three pills at
2.25rem plus 0.5rem gaps is 8.5rem of a 1392 px row, and the turn sentence still has 45 characters
before it truncates. The structure changes when the controls stop fitting beside the sentence, and
`chrome.css` already has that breakpoint: below 84rem the sentence gives up the row first and the
controls grow to 2.75rem, because three controls at a comfortable hit size are worth more than a
line of text that every HUD plate repeats. A fourth or fifth control is where the group would need
to become a menu, and this is not that.

### D47. Does the overview open from the dice hand as well as from the chrome

**No. Nothing is added, and `hand.css` is untouched.**

The overview is reference material, not a live reading. The composition is fixed for the whole match
and the face-down count is 17 every time it can be seen, so it is a screen a player opens once or
twice, learns, and stops needing. The chrome control is present on every screen of the game and is
one reach away from the hand.

The cost of the second door is paid at the wrong moment. FR-19 puts the game's central decision on
the dice plate, three cards wide, and the overview pauses the match loop to open. A control on that
plate is a control inside the frame the player is choosing in, and what it offers them at that
moment is to leave the choice and read a table. The chrome row is far enough away to be deliberate,
which for this screen is the right distance.

*Rejected: a `.hand__pool` button on the dice plate, top right.* It is the nearest thing to the
question and it would have cost Claude Code one element. If the Product Owner disagrees on the basis
of players actually asking for it, the element to add is that one, and `pool.css` needs no change
either way.

---

## 3 Token reference

No new tokens. Every value in `pool.css` is a token from `tokens.css` or a factor on `--card-u`.

| Token | Value | Used here for |
| --- | --- | --- |
| `--card-u` | set to `0.68` on `.overlay__cards` | The card factor, D43. The skill hand's, from D26 |
| `--overlay-panel-w` | set to `54.5rem` on this screen | The panel width, D43. The handle `overlay.css` offers |
| `--space-5` | `1.5rem` | The gap between cards, wide enough to clear a stack of three sheets |
| `--card-face` | `light-dark(#fff8ec, #473758)` | A sheet's face in the stack, D44 |
| `--color-ink` | `light-dark(#3a2b55, #1c1230)` | A sheet's edge |
| `--ink-dim` | `light-dark(rgb(58 43 85 / 0.22), rgb(0 0 0 / 0.38))` | The pile's drop shadow, the outermost of the set |
| `--card-dice-wash` | `#f3e6fb` | The copy-count tag, so the same tag is findable on all seven cards |

---

## 4 The DOM contract, state by state

Section 3 of the brief, every element and attribute it promises.

| Element or state | Styled | How |
| --- | --- | --- |
| `.overlay[data-screen="pool"]` | Yes | Panel widened to 54.5rem. Curtain, not veil: it inherits the opaque default from `overlay.css`, which is right, because the board behind it is paused |
| `.overlay__panel` children and their order | Unchanged | Title, text, cards, actions. Nothing moved |
| `.overlay__cards` | Yes | Flex wrap, four then three, centred. `:empty` takes it out of flow on the other five screens so their gaps do not double |
| `.overlay__cards[data-count="7"]` | Read, not keyed on | The layout follows the card width and the panel width, so a composition of six or eight lays itself out without a new rule. `data-count` stays useful as a hook and is not needed by this design |
| `.card` in the overview | Yes | `--card-u: 0.68`, no lift, no transition, flat |
| `.card[data-playable="false"]` | Yes | The `saturate(0.5)` wash of D29 is taken back off. These cards are not unavailable, they are the pool |
| `.card[data-copies]` | Yes | The stack of D44. **New attribute, requested in section 5** |
| `.card__banner` | Yes | `.card__type` hidden on this screen, `.card__kind` takes the whole band |
| `.card__result` empty | Yes | `card.css` has no result element in the overview flow and the empty div collapses. No roll here |
| `.card__text` empty | Yes | Already `display: none` below `.card--full` in `card.css` |
| `.card__tags`, third tag | Yes | No wrap, and the last tag takes the dice wash. Selected as `:last-child` and not `:nth-child(3)`, because a W2 and a W4 carry no "Start frei bei 6" line |
| `.overlay__actions`, `.overlay__button[data-action="resume"]` | Inherited | Unchanged from `overlay.css`, D38 |
| No `data-player` on this screen | Correct | The pool belongs to nobody, and no rule here reads a seat |
| `hidden` plus `data-open` | Inherited | Both spellings, as `overlay.css` handles them |
| `prefers-reduced-motion` | Yes | Nothing on this screen animates. The stack is static geometry and stays |
| Keyboard | Yes | The panel's button takes focus. The short-viewport scroll region is in the normal flow, so it is reachable by keyboard as well as by wheel |

Below the design resolution: under 50rem of viewport height the panel scrolls inside itself, which
keeps the button reachable; under 60rem of width the panel takes what width it can get and the row
wraps to three cards, or two. **The factor stays at 0.68 at every size.** D35's floor is a property
of the card and not of the viewport, so the fallback spends rows and a scroll rather than shrinking
the pill below 9 px, and section 2.8's no-scroll promise is about 1440 by 900, where all seven are on
screen at once.

---

## 5 What this needs, and what is still open

**One new attribute, and it is the only thing this delivery asks for.**

- **`data-copies` on the overview card**, an integer, the number of that denomination in the pool.
  The same number the third tag states in words. It drives the stack of D44 and nothing else, and a
  card without it draws as a single card rather than incorrectly.

**One request about an attribute the contract already writes.** Section 3.2 asks whether a
non-interactive card in the tab order is wrong. **It is.** Nothing on this screen can be clicked,
`aria` gets nothing from the stop, and seven tab stops sit between the player and the one button
that closes the panel. Make `tabindex` conditional on the card being playable. The focus ring stays
styled for the cards that keep it, in the hands.

**Still open from earlier handoffs, and no work here touched them:** D17, D21, D22, D23, D24 from
handoff 02. Fonts are still loaded from Google Fonts, unchanged since spec 01 section 5.

**Closed by the companion spec:** D16 and NFR-12, in
[06-spec-pawn-mark.md](06-spec-pawn-mark.md). It is the fifteen lines of `pawn.css` that 04-spec
section 5 named and did not deliver, and it carries one finding about `greyscale.spec.js` that is
worth reading before the test is re-run.

**Out of scope, as the brief said:** pool and discard counters in the HUD stay dropped, and this
spec has no note asking for them. Which three cards are on loan is not shown. The skill card pool
still needs its own brief. S10 is not built.
