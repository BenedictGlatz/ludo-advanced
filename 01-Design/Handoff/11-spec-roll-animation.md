# Handoff 11, spec: the roll

**From:** Claude Design
**To:** Claude Code
**Date:** 2026-09-03
**Answers:** [11-brief-roll-animation.md](11-brief-roll-animation.md), D70 to D74.
**Read against:** `3a8c8bc`, on branch `fix/layout-stage-and-fan`, as constraint 9 asks.

One note on line numbers before anything else. The copies in this package are pre `npm run format`, so
they run shorter than the brief's tree: `tokens.css` is 267 lines here and the brief measured 281 there.
Where a line number would be ambiguous below, the selector is named instead of the line.

---

## 1 Files delivered

| File | State | Lines |
| --- | --- | --- |
| `src/ui/styles/roll.css` | **New.** The throw and the landing | 96 |
| `src/ui/styles/refusal.css` | **Amended.** The breakdown, as a third voice on D55's seam | 137 |
| `src/ui/styles/tokens.css` | **Amended.** Two tokens added, nothing removed, nothing renamed | 267 |
| `01-Design/Handoff/11-spec-roll-animation.md` | New, this file | n/a |

**`card-state.css`, `card.css` and `hand.css` are not delivered and are not touched.** That is a result
rather than a coincidence, and it is the whole of D72: the badge is left alone because the answer stops
needing it to change.

**Load order: `roll.css` last of the card files**, after `card.css`, `card-state.css`, `hand.css` and
`card-reveal.css`. It overrides nothing in them; it composes with all four, which is why it goes last.
`refusal.css` keeps its place.

---

## 2 The shape of the answer, in four sentences

The roll gets a moment, and the loop waits for it, because a stylesheet cannot make a moment out of a
frame that has already been painted (D70). The kept dice card is the die and performs the throw itself,
because the game has never drawn a die as an object and a D8 card already depicts one (D71). The badge
never animates out of nothing, because the number is written into it at the start of the roll and simply
is not legible until the card comes to rest, which leaves `:empty { display: none }` untouched (D72). A
roll that cards changed explains itself in the message strip, all steps at once, and only when there is
more than one step (D73).

---

## 3 The decisions

### D70. The roll gets a hold, of 900 ms, and the hold does not shorten under reduced motion

**A hold, not a movement. `--motion-roll: 520ms` is the throw and `--motion-roll-hold: 900ms` is what
`game-loop.js` waits. `--motion-roll` collapses to 1 ms under `prefers-reduced-motion` and
`--motion-roll-hold` does not.**

**1. Why a hold.** The brief's § 1 is not a report that the animation is poor, it is a report that there
is no moment for one. `advance()` is synchronous and re-entrant, so the kept card's lift, the two unkept
cards leaving and the number all reach the browser in the same paint. A movement would put a keyframe
inside that single frame: the number would animate while two other cards were animating past it, which
is the defect with motion added rather than the defect fixed. A hold is the only one of the two that
buys the thing that is actually missing, which is a frame in which the roll is the only thing happening.

D60 is the precedent and its reasoning transfers almost unchanged. A trap firing got two seconds because
the game was doing something to the player and not showing it. The roll is the same shape of problem: the
game produced the number the whole turn hangs on and gave it no time of its own.

**2. The two numbers, and how they are spent.**

| From | To | What | Where it comes from |
| --- | --- | --- | --- |
| 0 ms | 240 ms | The two unkept cards travel home; the kept card winds up | `--motion-move`, existing, and the first 46 per cent of the throw |
| 240 ms | 427 ms | The shake, three oscillations | 46 to 82 per cent of `--motion-roll` |
| 427 ms | 520 ms | The settle | 82 to 100 per cent of `--motion-roll` |
| 520 ms | 700 ms | The number stamps into the badge | `calc(var(--motion-feedback) * 2)`, derived |
| 610 ms | 700 ms | The breakdown fades into the strip, if there is one | derived, D73 |
| 700 ms | 900 ms | The number sits still and is read | the remainder of `--motion-roll-hold` |

Only two of those six are tokens. Everything else is derived from `--motion-move`, `--motion-feedback`
and `--motion-roll` in the stylesheets, which is deliberate: constraint 6 measured 19 lines of headroom
in `tokens.css` and this delivery spends 13 of them, comments included.

**520 ms for the throw** is the one number with a taste in it, so here is the reasoning rather than the
assertion. It has to be longer than `--motion-move`, because the throw cannot be over before the two
cards leaving it are gone. It has to be short of a second, because a party game plays this about 250
times in a four player match. A wind up needs roughly a quarter of a second to read as anticipation
rather than as a glitch, and three oscillations need roughly 60 ms each or they blur. That is 240 plus
190 plus a settle, and 520 is where those land.

**900 ms for the hold** is the throw plus the stamp plus 200 ms of stillness. The stillness is the part
that is worth arguing for: a number that appears and is immediately overtaken by the next thing has not
been shown, it has been mentioned. The total cost is about 0.9 seconds per turn, which is roughly three
and a half minutes over a four player match, and that is the price of the feature stated plainly rather
than discovered later.

Not `--motion-trap-hold`'s two seconds. A trap arrives unasked and carries a sentence to read. The roll
follows the player's own click, they are already looking at the card, and what arrives is one number.

**3. Under `prefers-reduced-motion`, the throw goes and the hold stays.** `--motion-roll: 1ms` in the
token block, so the card does not move and the number is on screen in the first frame of the hold instead
of at 520 ms into it. `--motion-roll-hold` is not in that block.

The argument is D20's and D60's, and this makes it the third token to sit outside the block, which turns
it from an exception into a rule worth stating: **a hold is time, not movement.** A player who asked for
less motion asked for less motion. Taking the result away faster would be answering a request they did
not make, and there is a second reason specific to the roll: with the throw gone there was no wind up to
warn them the number was coming, so if anything they have less warning and not more.

*Rejected: a movement, one keyframe and no change to `game-loop.js`.* This is by far the cheaper answer
and it is what the request literally asked for. It loses on the finding: the number would animate in the
same frame as two cards flying back to the pool, so the roll would still not be a moment, it would be a
busier version of the same instant. It also has an odd consequence. The one place the game already pauses
in front of a roll is the on roll reaction window at `intents.js` lines 116 to 123, so the game would keep
a real pause for Critical Failure and refuse one for the roll itself.

*Rejected: a hold measured in frames of the animation rather than as a token, so the loop waits for
`animationend`.* Tempting, because the two numbers could never drift apart. It puts a rule of the game
loop behind an event that does not fire when the tab is hidden, when the element is replaced mid
animation, or when `--motion-roll` is 1 ms and the event races the next render. `--motion-trap-hold` is
already a token the view reads, and a second mechanism for the same job is worse than a number that has
to be kept in step with a stylesheet.

*Rejected: reusing `--motion-trap-hold` for the roll.* Free, no new token, and it welds two unrelated
durations together. The next time either is tuned the other moves, and they answer different questions:
one is reading time for a sentence, the other is the length of a movement plus a beat.

### D71. The kept card performs the throw, and the number lands in the badge D32 already put on it

**Option 2, with Option 1's badge arrival as its last beat. The card the player chose is the die. No new
element, no new view code, and the number stays exactly where D32 put it.**

The three options are three answers to one question: what object is rolling. The answer this spec takes
is that the object is already on screen and the player already chose it. A dice card is not a card that
reports a roll, it is the die: `card.css`'s `[data-card-family="dice"]` branch gives it a bigger title
because the title is the rule, and the illustration on a D8 card is a drawing of a D8. Making that card
tip, shake and settle is the cheapest of the three routes that still answers FR-33's "rolling produces
visible feedback", because the thing that moves is the thing the player picked up.

**1. The mechanism, and the collision the brief named.** `rotate` and `translate`, never `transform`.
`card.css` transitions `transform` and both `card-state.css` and `hand.css` write `translateY` into it,
including `hand.css`'s `[data-resolved="true"] .card[data-selected="true"]`, which is the exact rule in
force during the roll. The individual transform properties compose with `transform` instead of replacing
it, so the lift survives untouched and nothing has to be reconciled. This is `card-reveal.css`'s
precedent, which the brief pointed at, applied to the two properties the throw needs.
`transform-origin: 50% 100%` puts the pivot on the card's bottom edge, so it rocks on its base like a
card standing on a table rather than spinning about its middle.

**2. The beats.** A wind up: the card tips 5 degrees back and dips 3.5 per cent of its own height, on
`--ease-capture`, which is slow to start and gathering speed, so it reads as drawing back. Three
oscillations of 6, then 5.5, then 4 degrees with 1.5 per cent of sideways travel, decreasing, which is
what a hand shaking a die does. A settle on `--ease-move`, the bezier that overshoots slightly, and the
card is back at rest. At the dice hand's measurements, 177.8 by 259.9 px, 5 degrees of tip moves the top
corner about 11 px and 3.5 per cent of height is 9.1 px, so the whole throw stays inside the card's own
footprint and no neighbour is touched.

**3. The number arrives as the card comes to rest**, stamping from 40 per cent to 114 per cent to 100 per
cent of its size over 180 ms. That is Option 1's beat, kept, and it is where the brief's measurement gets
its answer: the badge is 30.1 px square and the digits are 17.8 px, which is too small to be the whole
event and exactly the right size to be its last frame. The eye is on a 260 px card that has just stopped
moving, and the number appears in it. It is on `scale`, so a two digit or a three digit result stamps
identically, which is what the badge's `min-width` and padding were already built for since issue #38.

**4. What happens to the two cards nobody kept: they leave during the wind up, and they are gone before
the shake.** The return runs on `--motion-move` and starts at the click, unchanged. The wind up is the
first 240 ms of the throw, which is the same 240 ms. Those two do not compete: one is two cards fading
and shrinking away at the edges of the row, the other is a slow tip at its centre. What is not allowed to
overlap is the number's arrival, and it does not: it lands at 520 ms, 280 ms after the last of them is
gone. Making the throw wait for the return instead would have been more honest to the finding and would
have cost another 240 ms per turn for a frame nobody is looking at.

**5. The kept card is still the subject, and D32 is confirmed rather than quietly dropped.** The card
that produced the roll is the card that performs it and the card that carries the number. Nothing is
drawn anywhere else on the page, the board's `data-roll` stays the test hook its comment says it is, and
the badge does not move by a pixel.

**6. The row or the one card: the attribute goes on the row, the animation goes on the one card.**
`.hand--dice[data-rolling="true"]`, the twin of `data-dealing`, so `replayDeal`'s remove, reflow, re add
already works for it and the once per turn gate at `dice-hand-view.js` lines 92 to 95 already exists.
The stylesheet then scopes down to `.card[data-selected="true"]` inside it. The row also gets
`pointer-events: none` while it is true, so a click cannot land on a card that is mid throw, which the
row already does for the two cards that are leaving.

**7. What is on screen while the roll runs: one card, and it is moving.** The two unkept cards are gone
after 240 ms and the kept one is shaking, so the answer to the brief's "nothing yet is a poor thing to
look at" is that there is never a moment of nothing. The badge is the only thing withheld, and it is
withheld for 520 ms of a 900 ms hold.

*Rejected: Option 3, a die as its own object.* This is the option with the best single argument in the
brief, that a tumbling die is the one answer nobody has to be taught, and it is rejected on what it would
mean rather than on what it would cost. The dice card **is** the die. A D8 card is titled D8, its
illustration is an octahedron, and the player chose it out of three. Putting a second octahedron on the
page while the first one sits underneath it draws the same object twice in two visual languages, and the
player would then have to learn that the card is a card after all. The costs the brief lists are real as
well: a new element, new view code, no spare grid row, and the first thing in the project that could
contradict D32 by putting the number somewhere else for a moment.

*Rejected: Option 1 alone, the whole event inside the badge.* Cheapest, and it is kept as the last beat
rather than dropped, which is the part worth noting. Alone it fails on the brief's own measurement:
30.1 px square, smaller than the fingertip pointing at it, in the top right corner of a card, at the foot
of a page whose centre of attention is a board. A number tumbling in a 30 px box is a detail, and the
report was that the roll does not feel like an event.

*Rejected: the whole dice row shaking rather than the kept card.* Very slightly cheaper, one less
selector. It would shake two cards that have just been rejected and are already leaving, so the moment
would be about the choice again instead of about its result.

*Rejected: a keyframe on `transform` with the lift folded into it.* The obvious way to write the throw,
and the reason the brief flagged the collision. It would take over `card.css`'s transition and both
`translateY` writers, so the selected lift, the hover lift and the playable lift would all have to be
restated inside the keyframe and kept in step with three other files.

### D72. Nothing replaces `:empty { display: none }`, because the badge is never empty during the roll

**A fourth route, and it is the one that changes least. The view writes the number into `.card__result`
in the same pass that sets `data-rolling="true"`. The badge is therefore in the layout from the first
frame of the roll, holding the result, and the keyframe's `backwards` fill keeps it at `opacity: 0` and
40 per cent scale until its beat. `card-state.css` is not touched.**

The brief's premise is right: an element with `display: none` has no start state. The three routes all
attack the `display: none`. The cheaper move is to attack the emptiness, because `:empty` is only a
problem while the badge is empty, and nothing requires it to be empty during a roll except the habit of
writing the number at the end.

**1. What this costs, stated plainly.** The number is in the DOM about 520 ms before it is legible. That
has three consequences and two of them are gains.

- **A screen reader on a live region announces the result at the start of the roll rather than at the
  end.** That is the correct behaviour and this spec would have asked for it anyway. A player who cannot
  see the card shake should not be made to wait out a shake they cannot see.
- **`tests/e2e/dice-hand.spec.js` stays green.** Both cases that read the badge read `textContent`, and
  the text is there earlier than before rather than later. Landing check 6 in the brief asked which of
  those cases is superseded, and the answer is none of them.
- **A player who inspects the DOM mid roll can read the number early.** True, and it is worth naming
  rather than hiding. It is a hot seat party game on one device, not a competitive server, and the same
  player can already read `state.roll`.

**2. What it does not cost.** No change to `card-state.css`, no new attribute, no placeholder string, and
no element that has to be un hidden and re hidden. The badge's existing behaviour between turns is
exactly as it was: the view clears it, `:empty` hides it, and the next turn's three cards start blank.

**3. One correction to the brief, offered rather than argued.** Route 3's stated cost, that three
invisible badges would take space in the card's box, does not hold: `.card__result` is
`position: absolute`, so it costs no layout at any time. Route 3's real cost is different and it is the
reason it is still rejected below.

*Rejected: route 2, a placeholder character in the badge while the roll runs.* This was the closest
alternative and it has a genuine advantage, that the badge is visibly present and visibly waiting. It
loses on three things. It is a string a player reads, so NFR-03 makes it a locale key in two languages
for a character that says nothing the shaking card does not already say. It makes the badge's content
change twice per roll instead of once, so a live region announces a question mark and then a number. And
it puts something in the badge that is not a result, in the one place on the card whose entire meaning is
"this is the result".

*Rejected: route 3, dropping `:empty` and hanging visibility on an attribute we write.* It is the most
explicit of the routes and it moves the badge's visibility from a fact, there is a number, to a state
somebody has to write and un write on three cards every turn. That is a state the DOM can then get wrong,
and the failure mode is an empty badge sitting on a card, which is exactly the object `:empty` was added
to prevent.

*Rejected: route 1, animating an ancestor or a pseudo element.* The ancestor is the card, which is
already animating something else, and a pseudo element cannot hold the number without a `content:`
string, which rule 1 of the work order forbids outright.

### D73. The breakdown is one line in the message strip, all steps at once, only when there is more than one

**Four parts, four answers: the message strip; together and not in sequence; nothing at all on a one step
roll; and it stays until the next message rather than holding the loop.**

**1. Where it lives: the message strip, as a third value of `data-message-kind`.** The two candidates
were the card and the strip. The card is 177.8 px wide and already carries a title, a type label, two
tags, the art and now a badge that is being stamped, and the sentences are sentences: "Rolled twice,
higher: 17" does not become a chip by being put in a smaller box. The strip is where the game already
explains itself in a sentence, D55 already opened it to a second voice that is not a refusal, and it sits
over the board, which is where the player is looking by the time the number has landed.

It takes the trap's voice and not the refusal's: the panel colour with an ink dot. A roll that three
cards changed is the game reporting what happened, and nobody did anything wrong. That is D55's
distinction exactly, applied a second time, which is the first evidence that the seam it opened was the
right one.

**2. Together, in one paint.** Sequential is what a player would say out loud and the brief is right
about that. It loses on three counts. It costs time on top of a hold that is already this feature's
price, and D70 spent that budget on the number rather than on its footnotes. A strip that rewrites itself
three times in half a second is a flicker rather than an explanation, because the whole line reflows each
time a step is added. And it is the one choice here that would have needed a separate answer under
`prefers-reduced-motion`, which is D74.1: choosing together means there is nothing to undo.

**3. On an ordinary roll the strip says nothing at all.** The view writes the message only when
`rollSteps` has two or more entries. One step is `base`, which is almost every roll, and "D8: 5" beside a
badge reading 5 is noise that would teach the player to stop reading the strip. This makes the strip's
appearance itself the signal: it speaks when cards changed the roll, and its silence is information.

**4. It stays until it is replaced, and it holds nothing.** No token, no timer. The player is about to
move a pawn and the breakdown explains the number they are moving by, so it should be readable for as
long as the decision takes. It is replaced by the next message and cleared when the phase leaves `act`.
This is the one part of the answer that costs zero milliseconds, which is also why D70's hold could stay
as short as it is.

**5. The element, named so it can be built.** Inside the existing strip:

```html
<div class="move-refusal" data-message-kind="roll" data-reason-key="turn.roll-steps">
  <ol class="move-refusal__steps">
    <li class="move-refusal__step" data-roll-step="advantage">Rolled twice, higher: 17</li>
    <li class="move-refusal__step" data-roll-step="add-die">Plus a D8: 22</li>
    <li class="move-refusal__step" data-roll-step="multiplier">Times 2: 44</li>
  </ol>
</div>
```

One `<li>` per step, in chain order, the sentence from `ui.json` as its text. `data-roll-step` carries the
kind and **no stylesheet reads it**, which is D51's precedent: the kind is in the sentence, and putting
it in the DOM as well costs nothing and means a later decision has a hook. The separator between two
steps is a 4 px ink dot drawn as an empty pseudo element, so the chain reads in order with no character
in a `content:` property and nothing to translate.

**6. All nine step kinds look identical.** Including `missed` and `floor`, the two that take a roll away.

*Rejected: colouring the two steps that reduce the roll.* It is the obvious flourish and there is no hue
for it. Orange is "you cannot do that", violet is the hint, the four seat colours are seats, and the only
one left is the skill square's teal. A ninth meaning for a colour in a game that already carries eight is
worse than nine sentences that look alike, and NFR-12 would need a second cue on top of the colour
anyway.

*Rejected: the breakdown on the card, under the badge.* The card is 177.8 px wide and the sentences are
already written as sentences. It would need either a second, shorter set of strings in both languages or
a card that is mostly text, and it would cover the illustration during the one moment the card is the
centre of the page.

*Rejected: the breakdown in the HUD, next to the seat's numbers.* The HUD is sixteen numbers that persist,
and this is one sentence that does not. D37's problem there is density, and adding a line that appears and
vanishes to the one region built for reading at a glance is the wrong trade.

*Rejected: showing the chain on every roll, `base` included.* One line of code less in the view and it
spends the player's attention on the case where there is nothing to explain.

### D74. The suite gets a fifth key, and 90 ms is answered by the click, not by the roll

**1. Reduced motion, for the breakdown specifically.** There is nothing left to answer, because D73 chose
together. The steps arrive in one paint in both cases. The strip's fade in is delayed by
`calc(var(--motion-roll) + var(--motion-feedback))`, which is derived rather than a token, so under
`prefers-reduced-motion` it collapses to 91 ms along with the throw and the sentence arrives with the
number instead of after it. No media query in `refusal.css` and none in `roll.css`; the only one in this
delivery is the block that already exists in `tokens.css`.

**2. `FAST_DELAYS` gets a fifth key, and skipping the wait entirely in a test run is acceptable.
Confirmed.** `roll: 0`, alongside `afterMove`, `afterRefusal`, `afterTrapCard` and `reaction`. Nothing in
the game state depends on the hold: it is reading time, it changes no value, and no rule branches on it.
A figure that had to be honoured everywhere would make every one of the roughly 250 rolls in an
end to end run cost 900 ms for nothing, which is the flake risk landing check 7 describes, arriving as
minutes of wall clock instead.

The place timing is asserted is the new `roll-animation.spec.js` of landing check 8, at real speed with
`?fast=1` off. That is one spec paying for the timing rather than every spec paying for it.

**3. NFR-11's 90 ms is answered by the click, and the roll is the second response, not the first.** The
budget is on the first visible response to the player's input, and the input here is clicking a dice
card. That is answered by things that already exist and are unchanged: the kept card takes its selection
ring and its deeper lift on `--motion-feedback`, and the two unkept cards start leaving in the same
frame. The throw's own first movement is a wind up that begins immediately as well, so the 90 ms budget
is met three times over before the roll's own event starts.

This is D68's structure repeated on purpose. There, the lift answered inside the feedback budget and the
growth followed a delay. Here, the choice answers inside the feedback budget and the roll follows it. In
both cases the rule is that the slow thing is never the first thing.

---

## 4 Token reference

Two tokens added. Nothing removed, nothing renamed.

| Token | Value | Used for |
| --- | --- | --- |
| `--motion-roll` | `520ms`, `1ms` under `prefers-reduced-motion` | **New.** The kept card's throw, wind up through settle (D70, D71) |
| `--motion-roll-hold` | `900ms`, unchanged under `prefers-reduced-motion` | **New.** What `game-loop.js` waits before the turn carries on (D70) |

Everything else is derived in the stylesheets, which is how this delivery spends 11 lines of `tokens.css`
rather than 30:

| Derived value | From | Where |
| --- | --- | --- |
| The wind up's length | 46 per cent of `--motion-roll`, matched to `--motion-move` by hand | `roll.css`, the keyframe |
| The badge stamp | `calc(var(--motion-feedback) * 2)`, delayed by `--motion-roll` | `roll.css` |
| The strip's delay | `calc(var(--motion-roll) + var(--motion-feedback))` | `refusal.css` |

Existing tokens the answer reads: `--motion-move` for the two cards leaving, `--motion-feedback` for the
stamp and the strip's fade, `--ease-capture` for the wind up, `--ease-move` for the shake's settle and the
stamp's overshoot, `--ease-ui` as the keyframe default, `--color-panel` and `--color-ink` for the strip's
second voice, `--space-2` and `--space-3` for the step list, `--radius-pill` for the separator dot.

**No colour is added and no colour changes.** The roll is a movement, a duration and a list.

---

## 5 The measurements

At the design resolution, 1440 by 900, where the root is 14.4 px and the dice hand's `--card-u` is 0.76.

| Thing | Value | Note |
| --- | --- | --- |
| The card that throws | 177.8 by 259.9 px | Unchanged, § 3 of the brief |
| Tip at the wind up | 5 degrees | About 11 px at the top corner, pivoting on the bottom edge |
| Dip at the wind up | 3.5 per cent of height | 9.1 px |
| Shake, three oscillations | 6, then 5.5, then 4 degrees | Sideways travel 1.5 per cent of width, which is 2.7 px |
| The badge | 30.1 px square, digits 17.8 px | Unchanged. D32 is confirmed |
| The stamp | 40 per cent to 114 per cent to 100 per cent | On `scale`, so a three digit result behaves identically |
| **How long the roll takes** | **900 ms**, of which 520 is the throw | It was 0 ms |

**The throw stays inside the card's own footprint.** The largest excursion is the wind up's 9.1 px dip
plus a 5 degree rotation about the bottom edge, and the dice row's gap is 8.2 px between cards that are
already leaving. Nothing reaches a neighbour, and because `rotate` and `translate` are not layout, the row
cannot re flow.

**Against the plate.** The dice hand's `min-height` is `0.76 * 24rem`, which is 262.7 px, against a card
of 259.9 px, so the throw's upward travel of 6.5 px at 82 per cent has room inside the plate and is not
clipped.

**No new contrast case.** The badge is `--color-ink` on `--card-result-bg` at 17.8 px throughout, exactly
as before; only its opacity and scale are animated. The strip's roll voice is `--color-text` on
`--color-panel`, which is the trap voice D55 already shipped and measured.

---

## 6 The DOM contract, state by state

| Selector | Styled | How |
| --- | --- | --- |
| `.hand--dice[data-rolling="true"]` | Yes | `pointer-events: none` on the row, and the scope for everything else. The twin of `data-dealing`, so `replayDeal`'s restart works unchanged |
| `.hand--dice[data-rolling="true"] .card[data-selected="true"]` | Yes | The throw, on `rotate` and `translate`, composing with the lift in `transform` |
| The same on `.card:not([data-selected="true"])` | **Not read, deliberately** | The two unkept cards are travelling home on `data-resolved` and are gone before the shake |
| `.card__result` while rolling | Yes | The stamp, `backwards`, delayed by `--motion-roll`. Holds the number for the whole roll |
| `.card__result:empty` | **Untouched** | `card-state.css` keeps it exactly as it is. That is D72 |
| `.hand--dice[data-dealing="true"]` | Correct as is | `hand.css`, unchanged. `data-rolling` must be cleared before the next turn sets `data-dealing`, or the throw restarts on a card that is arriving |
| `.hand--dice[data-resolved="true"]` | Correct as is | `hand.css`, unchanged. Its `translateY` on the kept card is in `transform` and the throw does not touch that property |
| `.move-refusal[data-message-kind="roll"]` | Yes | The panel colour with an ink dot, delayed so it never precedes the number |
| `.move-refusal__steps` | **New element, named here** | An `<ol>` inside the strip. Flex row, wrapping, no bullets |
| `.move-refusal__step` | **New element, named here** | One `<li>` per step, in chain order, the `ui.json` sentence as its text |
| `.move-refusal__step[data-roll-step]` | **In the DOM, deliberately unread** | Nine kinds, one look. D51's precedent |
| `.move-refusal[data-message-kind="trap"]` | Correct as is | D55, untouched. The roll is the third value on the same seam |
| `.pool .card`, `.card--full` | **Excluded** | Every selector in `roll.css` starts at `.hand--dice[data-rolling="true"]`. The pool overview and the reaction prompt render the same component and inherit nothing |
| `.hand--skill .card` | **Excluded** | Same reason. D66's reveal and this throw never meet |
| `prefers-reduced-motion` | Yes | `--motion-roll` collapses in `tokens.css`. No media query in `roll.css` or `refusal.css` |
| A three digit result | Yes | The stamp is on `scale`; the badge's `min-width` and padding are unchanged |

---

## 7 The landing checks

1. **D70 to D74 answered**, none skipped. § 3.
2. **Every answer carries a reason and a named rejected alternative.** Fifteen across the five decisions,
   four of them on D71, where constraint 8 asked for the reason to carry the weight.
3. **No CSS file over 300 lines.** 96, 137, 267. **`tokens.css` at 267 is the one to watch**: it was 281
   after `npm run format` on `3a8c8bc` and this adds 13 lines, so it lands near 294. Constraint 6 asked
   for the seam to be named rather than the comments dropped, so: **if it needs a split, the seam is
   motion.** Everything from `--motion-feedback` to `--ease-curtain` plus the four hold tokens and the
   whole `prefers-reduced-motion` block moves to `motion.css`, which is about 60 lines, leaves `tokens.css`
   near 230, and is the only group in the file that is read by rules rather than by paint. It is not done
   here because it touches no decision in this brief.
4. **No user-facing string in a `content:` property.** The one `content:` added is `""` on the step
   separator, which is a dot.
5. **Built once, then only attributes rewritten.** `data-rolling` is one attribute on the row, written and
   cleared once per turn. The step list is the one element that is built per message, and it is built
   inside the strip that already exists.
6. **`npx playwright test tests/e2e/dice-hand.spec.js`.** Expected green, all three cases, and none is
   superseded. The two that read the badge read text that now arrives earlier rather than later (D72.1),
   and the keyboard case is untouched. The one thing to watch is a case that asserts the badge is
   *visible* rather than that it holds text: for 520 ms of the roll it is present at `opacity: 0`.
7. **`npx playwright test tests/e2e/pawn-moves.spec.js` and `capture.spec.js`.** Both need the fifth
   `FAST_DELAYS` key before they are run, or every turn in them waits 900 ms. D74.2 confirms `roll: 0`.
8. **A new `tests/e2e/roll-animation.spec.js`.** Four assertions this spec would want: `data-rolling` is
   on the dice hand for the duration of the roll and gone before the next deal; the badge holds the result
   from the start of the roll and is at full opacity by its end; the strip carries
   `data-message-kind="roll"` with one `<li>` per step when cards changed the roll and no message at all
   when they did not; and both of those hold under `prefers-reduced-motion`, where the whole thing is over
   inside 200 ms.
9. **1440 by 900, and one check below the 84rem breakpoint.** The throw is `rotate` and `translate`, not
   layout, so it cannot lengthen a page that scrolls or move the scroll position. The strip hangs off
   `.app__board` and is unaffected by the stack. The hold is the one thing that behaves the same at every
   width, which is the point of it being a wait rather than an animation.

---

## 8 What is still open

**Needed from Claude Code.**

1. **`data-rolling="true"` on `.hand--dice`** for the length of `--motion-roll-hold`, cleared before the
   turn carries on and before the next deal. The brief offers this and says the restart is already
   written.
2. **The number written into `.card__result` in the same pass that sets `data-rolling`**, not at the end
   of the roll. This is the whole of D72 and it is why `card-state.css` needed no change.
3. **The wait in `game-loop.js`**, `--motion-roll-hold`, read the way the view reads `--motion-trap-hold`
   today.
4. **`roll: 0` in `FAST_DELAYS`**, `main.js` line 108, passed at line 170.
5. **The step list in the message strip**, § D73.5, written only when `state.rollSteps` has two or more
   entries. The sentences are the `ui.json` keys that already exist.
6. **The two gaps the brief named as yours**, unchanged: `ROLL_STEP.MISSED` has no locale key in either
   language, and `turn.rolled` is read by nothing. On the second one this spec has an opinion:
   **leave it unread and delete it.** The badge says the number, the breakdown explains it, and a third
   sentence saying "Rolled: 5" would be the strip repeating the card.

**Superseded, by file and line, as constraint 7 asks.**

| Superseded | By |
| --- | --- |
| `game-loop.js` lines 26 and 27, the claim that the `roll` phase exists so an animation has something to hang off | D70. It is true from this delivery on. Nothing else in the comment changes |
| Nothing in `card.css`, `card-state.css` or `hand.css` | D71 took the route that composes with all three. The rules D29 put there are intact, which is the answer to constraint 7's specific worry about Option 2 |
| The brief's § 5 statement that route 3 of D72 would cost layout space | D72.3. `.card__result` is `position: absolute` |

**Noticed and not done.** The strip's class is `.move-refusal` and it now carries three kinds of message,
two of which are not refusals. The name has been wrong since D55 and this delivery makes it wrong a third
time rather than renaming it mid feature. It is a rename of one class across `refusal.css`, `app.css` and
three specs, it touches no decision, and it is worth doing in a delivery that has a reason to open those
files.

**Owed and not answered, unchanged from handoff 10.** The six pawn statuses other than `stunned` and
`slippery`. The reaction window countdown and whether the prompt strip belongs at the foot or in the rail.
D61, the pickable field's remainder, and D62 to D64 from handoff 09. D17, D21, D22, D23 and D24 from
handoff 02. Fonts are still loaded from Google Fonts.

**No em dash, in this spec or in the three stylesheets.** Rule 5 of the work order, checked.
