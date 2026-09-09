# Handoff 10, spec: reading a card you are holding

**From:** Claude Design
**To:** Claude Code
**Date:** 2026-09-03
**Answers:** [10-brief-card-reveal-on-hover.md](10-brief-card-reveal-on-hover.md), D65 to D69.
D65 overturns the second half of D33 and supersedes brief 09 § 4's first finding. D69 closes the one
hover finding `00-open-requests.md` § 4 filed against D64.

> **Two notes were added to this document on landing**, and they are recorded here because a delivered
> document should not be changed quietly. The same convention as handoff 07.
>
> 1. The link above pointed at `../../uploads/10-brief-card-reveal-on-hover.md`, which was the path
>    inside the delivery package; the brief is a sibling of this file in the repository.
> 2. **The five stylesheets were read against a tree that was one commit old**, the state before
>    `e486bb4`, and they were therefore merged rather than copied in. Three things this document does not
>    mention would have been reverted by a straight copy: the stage tokens `--stage-w` and `--stage-h`
>    that `app.css` reads (D62), the `--shadow-dir` sign in `card.css`, `card-state.css` and `hand.css`
>    (D64), and the two empty-slot fixes in `hand.css`. All three were kept. The one consequence for a
>    delivered rule is in `card-reveal.css`: both of its `box-shadow` offsets now multiply by
>    `--shadow-dir`, so a revealed card's shadow falls to the left like the rest of the fan instead of
>    flipping direction under the pointer. Nothing else in the five files was changed. The section
>    numbers, the arithmetic and the decisions below are untouched and still read correctly, because
>    § 5's measurements were already taken against the fitted stage.

---

## 1 Files delivered

| File | State | Lines |
| --- | --- | --- |
| `src/ui/styles/card.css` | **Amended.** The paragraph hook, split off the reference size. Three comments, one rule turned from negative to positive | 233 |
| `src/ui/styles/card-state.css` | **Amended.** The back is keyed on `data-face`, not on `data-active`. Six selectors superseded | 121 |
| `src/ui/styles/card-reveal.css` | **New.** The reveal. Split at the seam constraint 6 asked for | 76 |
| `src/ui/styles/hand.css` | **Amended.** The sideways fan out deleted, the closed up overlap re-keyed | 147 |
| `src/ui/styles/tokens.css` | **Amended.** Two tokens added, nothing removed, nothing renamed | 254 |
| `01-Design/Handoff/10-spec-card-reveal-on-hover.md` | New, this file | n/a |

`app.css` is **not** delivered and is not touched. The plate dim at its lines 136 to 138 is the answer to
D65.2 and it already exists.

**Read against the working tree of 2026-09-03**, the same snapshot handoff 07 landed on plus that
delivery. Every line number quoted below is from the version before this delivery, so the two can be
diffed.

**No mouse handler, no new element, no new attribute the view has to write.** The reveal is pure CSS on
`:hover` and `:focus-visible`, which keeps `src/ui/events.js` at `click` and `keydown`. Two things are
asked of Claude Code and both are attributes on markup that already exists: § 8.

---

## 2 The file split, and why the reveal is its own file

`card.css` draws the card's structure, the thing the DOM contract in spec 03 § 3.1 describes.
`card-state.css` draws what happens to a card. `hand.css` draws the row the cards sit in.
`card-reveal.css` draws the one state that changes a card's size and re-flows its insides, which is why
it is the only file in the set that reads all three.

Constraint 6 set the budget: `card.css` had 73 lines of headroom and anything past about thirty had to
split at a real seam. The reveal is about fifty lines and it needs `--card-u` from `card.css`, the lift
and the desaturation from `card-state.css`, and the fan from `hand.css`. Putting it in any one of them
would have made that file reach into the other two. The precedents are `card-state.css` off `card.css`
at 322 lines and `board-trap.css` off `board.css` in handoff 07.

**Load order: after `card.css`, after `card-state.css`, after `hand.css`.** It overrides declarations in
all three and nothing in them overrides it. The four card files are therefore `card.css`,
`card-state.css`, `hand.css`, `card-reveal.css`, in that order.

---

## 3 The decisions

### D65. The player's own hand is always face up

**Yes, in every phase and whatever the card budget says. `data-face` is split off `data-active`. The
back's remaining users are the pool and the discard pile, and `data-face="down"` stays in the contract
for a hand that is genuinely not the viewer's.**

The brief's § 1 is right and the chain it describes is a defect. `data-active` answers "can something
here be played this instant", which is a question about the rules, and the back answered "may this person
see these cards", which is a question about who is holding the device. The stylesheet used the first to
decide the second, so a player spent the dice card phase, the move, and every action phase after their
budget was spent looking at the back of their own hand. `intents-cards.js` lines 118 to 120 had already
named that conflation one layer up and refused it.

Nothing about hot seat secrecy weakens. It was never this paint that enforced it: `session-actions.js`
lines 55 to 69 passes the turn before the curtain lifts, which is what stops one painted frame of the
leaving player's hand reaching the person picking the device up. A hand belonging to somebody else is
never on screen with the board visible, so every case in which this back fired was the player's own hand.

**1. What replaces it: nothing on the cards, and `data-face` on the row.** The row now carries
`data-face="up"` or `data-face="down"`, default up, and the back hangs off the down value. `data-active`
keeps D36's meaning untouched and keeps driving the plate lift and the plate dim.

**2. `data-face="down"` exists anyway, and it has one named user.** Not normal hot seat play, where it has
no case left, and that is stated plainly rather than hidden. It exists because the secrecy rule then stays
expressible in the DOM instead of becoming an implicit consequence of the curtain's timing, and because
the first thing that will need it is a hand that is not the local seat's: a spectator view, a replay, or
the online mode. It costs six selectors that were already written, it is now the only place the row draws
a back, and a rule that can be pointed at is cheaper to reason about than one that has to be reconstructed
from a comment in `session-actions.js`.

**3. What says the region is dormant: the plate dim, and it is enough.** `app.css` lines 136 to 138 give
the whole plate `--color-dormant-soft` when `data-active="false"`, and every card in an idle hand is
already `data-playable="false"`, which `card-state.css` line 53 desaturates. That is two statements, on
two scales, and neither of them hides anything. A third treatment on a face up idle hand would be the same
mistake in a quieter voice: the region is not asking a question, and the cards in it are still the
player's to read.

**4. The closed up overlap survives, on the attribute that now describes it.**
`--overlap: 0.82` moves from `[data-active="false"]` to `[data-face="down"]`, so it applies exactly when
there is a stack of backs to close up, which was its intent in D33 and is unreachable in normal play
today.

**5. `.card--back` is kept, for the two users D29 named.** The pool and the discard pile. Neither draws a
card yet, and with the `data-active` selectors gone `.card--back` is now the single definition of the back
rather than a duplicate of the hand's version. That is the argument for keeping it: when the discard pile
arrives it has one class to apply, and there is exactly one place in the project that knows what a back
looks like.

*Rejected: leaving it as it is and answering the request with an animation.* This is what the request
literally asked for and it is the one answer that cannot work. Turning over a card that is face down for
a reason unrelated to secrecy would have made the defect harder to see, not easier, because the gesture
would have papered over it.

*Rejected: deleting `.card--back` along with the coupling.* It is the tidy answer and it throws away the
one piece of this that is not a defect. D29 named two users, both are on the roadmap, and the class is
nine declarations that now have no duplicate.

*Rejected: a dormant treatment on the cards of an idle hand, `--card-dormant-wash` on the face.* The token
exists and it was tempting. It would say "not now" three times on one region and it would put a wash over
the art, which is the fastest thing to recognise in a fan by D26's own argument.

### D66. The revealed card is magnified in place to exactly the reference size

**Option 1, with both halves of the brief's question answered: the box magnifies, so the row does not
re-flow, and the insides re-flow, so the paragraph appears at the size it was written for. The scale is
`calc(1 / var(--card-u))`, which lands the card pixel for pixel on `.card--full`.**

The reveal is one rule set on `:hover` and `:focus-visible`. It costs no element, no view code, no mouse
handler and no DOM change, and the card it produces is not an approximation of the reference card, it is
the reference card: 234 by 342 CSS px at the design resolution, with the rules paragraph at 12.6 px, which
is the same box and the same paragraph the pool overview and the reaction prompt already ship. § 5 has
the arithmetic.

**`scale` and not `transform`.** They are separate properties, `scale` composes with the lift that
`card-state.css` puts in `transform`, and this is the same reason `hand.css` gave for using `translate` in
the rule D69 now deletes. `transform-origin: 50% 100%` anchors the card on its bottom edge, so it stays in
the row and grows upward.

**The box magnifies and the insides re-flow, which is not a contradiction.** The card's layout box stays
159.1 px wide, so no neighbour moves and the fan's geometry is untouched, and `scale` paints that box at
234. Inside it, the paragraph is unhidden and the art gives back the space `card.css` lets it borrow while
the paragraph is absent, so the card's insides are laid out as a reference card and then magnified. That
is why the result is the reference card and not a stretched hand card.

**It covers the foot of the dice plate, and that is the decision rather than a discovery.** The card grows
109.4 px upward out of a plate whose `min-height` is 235 px, so about 107 px of it stands above the plate,
over the bottom of the dice row. `.app__dice` precedes `.app__skill` in the DOM, so the skill plate paints
over it with no `z-index` needed, and `#app` clips at the stage edge, which the card never reaches: the
skill plate is the fourth of five rows. The overlap is correct as behaviour. A player reading a card in
their hand is not comparing dice cards in the same instant, and the dice row's own decision is already
made by the time a skill card matters.

**What the reveal shows: the whole reference card.** The paragraph, the title at its full 1.6875em, the
type label, the kind pill, the category tag and the art back in its fixed window. Nothing is added and
nothing is left out, because the point of landing on `.card--full` exactly is that the player has met this
object before, in the pool overview and in the reaction prompt.

**It stays clickable in the same gesture.** Reading and playing are one action: the card under the pointer
is the card a click plays, the cursor stays `pointer` on a playable one, and the growth does not move the
card out from under the pointer, since it grows around its own centre line from its bottom edge.

**It is dismissed by pointing somewhere else, or by moving focus.** D67.4.

**The dice row is excluded.** The reveal is scoped to `.hand--skill`. A dice card's title is its rule, the
three are already at 0.76 and never overlap, and magnifying one to 1.32 would cover the two it exists to
be compared against. § 6 of the brief asked for this to be said explicitly.

*Rejected: Option 2, a real two sided turn.* It is the gesture the request named and it does not answer
the request. The card is the same size when the turn finishes and the paragraph is still under 9 px, so a
turn has to be bought on top of Option 1 or Option 3 rather than instead of them. The price is the highest
of the three: a `preserve-3d` wrapper with two faces inside it breaks every rule that targets `.card > *`,
which is `card-state.css` line 89 and `hand.css` line 181, moves the back's dashed frame and mark off
`::before` and `::after` onto real elements, drags `pool.css` and the reaction prompt along because they
render the same component, and rewrites three checks in `tests/e2e/skill-hand.spec.js` lines 66 to 98.
Paid for a look that leaves the reason for the request unfixed.

*Rejected: the cheap variant of Option 2, one element keyframed from 0 to 90 degrees and back with the
face swapped at the halfway point.* Much cheaper, still not an answer on its own, and it makes the reveal
a keyframe instead of a state, which means the look has to be authored twice, once in the keyframe and
once at rest, and cannot compose with the lift. There is a smaller reason too: after D65 there is no
second face in the hand to turn to, so the turn would be an animation between a card and itself.

*Rejected: Option 3, a detail card beside the hand.* The lowest risk of the three and the one this spec
came closest to taking. It loses on what it costs against what it adds: a new element, new view code, the
first `mouseenter` in the project, and a region that appears and disappears in a rail that has no spare
row, in exchange for a card at the reference size, which Option 1 produces for free by landing its
magnification exactly there. Its real advantage, that the hand's card contract is not touched, is worth
less than it looks: Option 1 does not touch the contract either.

*Rejected: raising `--card-u` on the hovered card instead of scaling it.* It re-flows the row rather than
the card. The card's layout width would go from 159.1 px to 234 px and the fan would shuffle sideways
under the pointer at every count, which is the defect D69 deletes, reintroduced by a different route. Text
laid out at the real size is crisper than text magnified, and it is not worth the row moving.

### D67. Every card you are holding reveals, playable or not, and it takes a tab stop

**Yes to all of it. The reveal is keyed on `[data-card-id]` and not on `[data-playable="true"]`, the focus
ring is the same ring, the reveal sits on top of the lift rather than replacing it, and nothing needs
`Escape`.**

The card a player most wants to read is the one they cannot play yet, so keying the reveal on playability
would have missed the case the request was made about. `card-state.css` lines 45 to 46 key both hover and
focus on `[data-playable="true"]` today, which is why an Action card you are holding does nothing when you
point at it.

**1. A card that cannot be played reveals identically**, on hover and on focus. An empty slot does not: it
has no `data-card-id`, which is the same hook `hand.css` line 167 uses, and it keeps `pointer-events:
none`.

**2. The focus ring is unchanged and it is the same on both.** `card-state.css` lines 68 to 71 draw one
ring for every card and that stays. The ring says "you are here", not "you may play this"; playability is
said by the lift at rest and by the desaturation, which are two other properties. Giving an unplayable
card a quieter ring would make the keyboard player's position harder to find in the one row where five
cards look alike.

**The reveal does cancel one thing: the desaturation.** `card-state.css` line 53 puts
`filter: saturate(0.5) contrast(0.97)` on an unplayable card, and a card being read has to be read at full
contrast. `filter: none` while revealed, and the card goes back to being desaturated when the pointer
leaves. The two statements do not conflict: dulled is what an unplayable card looks like in the fan, and
the card under the pointer is out of the fan.

**3. The reveal sits on top of the lift, and the two are sequenced rather than stacked.** Pointing at a
card lifts it inside `--motion-feedback`, which is the response NFR-11 measures, and the growth follows
`--motion-reveal-delay` later. That ordering is what lets the reveal have a delay at all. The lift is
extended to unplayable cards for the same reason: after D67.1 every real card answers a pointer, so every
real card needs the immediate half of the answer, not only the one that can be played. A card that is
selected keeps its selection ring while revealed.

**4. No `Escape`.** The reveal ends when focus moves, and there is nothing to escape from: no focus trap,
nothing modal, and the card underneath is unchanged. `Escape` belongs to the overlays, the pool overview
and the handover curtain, and a second meaning for it here would be the first ambiguous one.

*Rejected: the reveal on playable cards only, keeping the existing `[data-playable="true"]` keys.* It is
the smallest possible change and it answers the request for the one card that needed it least. During the
dice card phase it would reveal nothing at all.

*Rejected: keeping `tabindex="0"` on playable cards only and revealing on hover alone.* It would leave the
reveal a mouse feature, which is NFR-08's exact complaint, and it would keep a keyboard user unable to
read their own hand. The reason `card-view.js` line 167 gave for the restriction was that a tab stop where
`Enter` does nothing tells the user nothing. That reason dissolves here: focus now does something.

### D68. `--motion-reveal: 160ms`, with `--motion-reveal-delay: 120ms` before the growth starts

**Two new tokens, on the D20 and D60 precedent that a new duration gets a number and a reason rather than
a literal in a stylesheet.**

**1. Not `--motion-feedback`.** 90 ms is the budget for the first visible response and the lift keeps it.
Forty seven per cent of growth inside 90 ms is a jump rather than a movement, and the object is 342 px
tall when it arrives. Not `--motion-move` either: 240 ms is what a piece crossing the board costs, and it
reads as slow for something happening under the pointer. 160 ms is between them, which is where the
gesture is.

**2. Under `prefers-reduced-motion` the reveal stays and arrives at once.** D12's rule is that loops stop
and feedback stays, and reading a card is feedback, so `--motion-reveal` collapses to 1 ms in the token
block. There is no turn to decide about, since D66 did not take one.

**3. There is a delay, and it is only on the way in.** 120 ms before the growth starts, so sweeping the
pointer across a fan of five does not fire five reveals; zero on the way out, so a card that is left
behind starts shrinking immediately. The delay is declared per property, so the lift, the shadow and the
filter are never delayed and NFR-11's budget is not touched.

**`--motion-reveal-delay` is not in the reduced-motion block.** It is a guard against a latch, not a
movement, and the player who asked for less motion did not ask for five cards to grow while the pointer
crosses them. That is the same argument `--motion-refusal-hold` and `--motion-trap-hold` are kept out on.

*Rejected: no delay.* Free, and it makes the fan flinch. Five cards at 0.3 overlap span 480 px, which a
pointer crosses in well under half a second on the way to the board.

*Rejected: the delay on the whole transition rather than per property.* One line shorter and it puts the
card's first response 120 ms after the pointer arrives, which is the number NFR-11 exists to stop.

*Rejected: one token for both, the delay taken from `--motion-feedback`.* 90 ms is a plausible delay and
it means two unrelated numbers move together the next time either is tuned. The reveal's guard and the
feedback budget answer different questions.

### D69. The sideways fan out comes out

**Deleted, not joined. The reveal replaces it.**

`hand.css` lines 62 to 66 pushed the right hand neighbours aside by `4rem * --card-u`, so that a covered
card could be read inside the row's own geometry. The brief measured that it under shifts at every count
above four: the shift is 43.5 px at a 16 px root against a covered strip of up to 77.8 px, which
`00-open-requests.md` § 4 already had on record against D64.

It is not fixed because the problem it solved no longer exists. A revealed card is magnified out of the
row and painted at `--layer-card-raised`, on top of both its neighbours, so nothing covers the thing being
read and there is nothing left for the neighbours to step aside for. Deleting the rule removes a number
that had to be right at five different counts, and it removes the second thing that moved when a pointer
crossed the fan.

The card the pointer leaves goes back into the fan and the row is where it was, because the row never
moved.

*Rejected: keeping both and raising the shift to reach the widest strip.* It would have to reach 82.7 px
at the design resolution, at overlap 0.52, and it would push the rightmost card 82.7 px out of a plate it
already fills. Two objects moving in answer to one gesture, one of which is now redundant.

*Rejected: keeping the shift for the lower counts, where it does reach.* A behaviour that appears at three
cards and vanishes at five is a rule the player cannot learn.

---

## 4 Token reference

Two tokens added. Nothing removed, nothing renamed.

| Token | Value | Used for |
| --- | --- | --- |
| `--motion-reveal` | `160ms`, `1ms` under `prefers-reduced-motion` | **New.** How long the growth takes (D68) |
| `--motion-reveal-delay` | `120ms`, unchanged under `prefers-reduced-motion` | **New.** How long the growth waits, so a sweep across the fan does not latch (D68) |

Everything else the answer needs already existed:

| Token | Used here for |
| --- | --- |
| `--card-u` | The magnification, as `calc(1 / var(--card-u))`, which is the whole of D66 |
| `--motion-feedback`, `--ease-ui` | The lift, the shadow and the filter, none of them delayed |
| `--layer-card-raised` | The revealed card, above both its neighbours |
| `--ink-dim` | The revealed card's hard offset shadow, the existing hover value |
| `--color-focus` | The selection ring a revealed card keeps |
| `--card-back`, `--card-back-mark`, `--card-back-frame` | The back, now reached only through `.card--back` and `data-face="down"` |
| `--color-dormant-soft` | The plate dim in `app.css`, which is D65.2's answer and is not touched |

**No colour is added and no colour changes.** The reveal is a size and a duration.

---

## 5 The measurement

At the design resolution, 1440 by 900, where `app.css` line 47 puts the root at 14.4 px.

| | Layout box | Painted | Rules paragraph |
| --- | --- | --- | --- |
| A hand card, unrevealed | 159.1 by 232.6 px | same | hidden |
| A hand card, revealed | 159.1 by 232.6 px | **234 by 342 px** | **12.6 px** |
| `.card--full`, the reference card | 234 by 342 px | same | 12.6 px |

The scale is `1 / 0.68`, which is 1.470588. `159.1 * 1.470588 = 234.0` and `232.6 * 1.470588 = 342.1`, so
the revealed card is the reference card to within a rounding error, and the paragraph that was 8.57 px in
the fan is painted at 12.6 px, which is the size `card.css` line 195 was written for.

Measured in the browser at a 16 px root, where the same arithmetic gives a 176.8 px layout box: the
painted box is 260 by 380 px, the computed `scale` is 1.47059, the paragraph's computed `font-size` is
9.52 px and it paints at 14.0 px. Both roots produce the reference card, because the scale is derived from
`--card-u` and not from a length.

**The growth, in numbers.** 74.9 px wider, 37.5 px of it on each side, and 109.4 px taller, all of it
upward from `transform-origin: 50% 100%`. The skill plate's `min-height` is `0.68 * 24rem`, which is
235.1 px, so about 107 px of a revealed card stands above the plate. The stage's fourth row is 342 px from
the top of the plate to the bottom of the page, so the card is never clipped by `#app`.

**Against the fan.** The overlap strip at u = 0.68 is 38.2 px at `--overlap: 0.24`, 41.4 at 0.26, 47.7 at
0.3, 70.0 at 0.44 and 82.7 at 0.52. None of them matters any more: the revealed card is at
`--layer-card-raised` and its neighbours are at `--layer-card`, so the covered strip is on top of the
neighbour rather than under it. This is the number D69 stops needing.

**No new contrast case.** The revealed card is the same two materials as the reference card,
`--card-text` on `--card-face`, at the same size, in both skins. Cancelling the desaturation on an
unplayable card (D67.2) moves that card's contrast up rather than down, since `saturate(0.5)
contrast(0.97)` was reducing it.

---

## 6 The DOM contract, state by state

| Selector | Styled | How |
| --- | --- | --- |
| `.hand--skill[data-face="up"]` | **Not read, deliberately** | Up is the default and the absence of `down`. One value, one rule, so a missing attribute cannot hide a hand |
| `.hand--skill[data-face="down"]` | Yes | The back, in `card-state.css`, and `--overlap: 0.82` in `hand.css`. Excluded from the reveal by construction, in the selector itself, so no gesture can reveal a card the viewer does not own |
| `.hand--skill[data-active="true"/"false"]` | Yes, in `app.css`, unchanged | D36's meaning: this region wants an answer. It drives the plate lift and the plate dim and nothing else. It no longer decides what a card looks like |
| `.hand--skill .card[data-card-id]` | Yes | The reveal target. Playability is not part of the selector (D67) |
| `.hand--skill .card:not([data-card-id])` | Correct as is | The empty slot of 2026-09-03. No id, so every rule in `card-reveal.css` excludes it, and it keeps `pointer-events: none` |
| `.card[data-playable="false"]` while revealed | Yes | `filter: none`, so a card being read is read at full contrast. Dulled again when the pointer leaves |
| `.card[data-selected="true"]` while revealed | Yes | Keeps the selection ring and its deeper lift; the reveal changes the size, never what the ring says |
| `.card:focus-visible` | Correct as is | One ring for every card, `card-state.css` lines 68 to 71, unchanged |
| `.card--reading` | Yes | The third trigger, alongside `:hover` and `:focus-visible`. **The app never writes it.** It exists so `card-reveal.spec.js` can assert the state without synthesising a pointer, and so the mockup can pin it |
| `.card__text` | Yes | Hidden by default, shown by `.card--full` and by a revealed hand card. `card.css` lines 202 to 205 welded "shows the paragraph" to "is the reference size"; they are two rules now |
| `.card__art` while revealed | Yes | Back to its fixed `8rem` window, giving up the space it borrows while the paragraph is hidden |
| `.hand--dice .card` | **Excluded, deliberately** | D66. The reveal is scoped to `.hand--skill`. The dice row's title is its rule and its three cards exist to be compared |
| `.card--full` in the pool and the reaction prompt | Untouched | Both already show the paragraph at the reference size. Nothing in this delivery reaches them |
| `.card--back` | Yes, kept | The pool and the discard pile, D29's two users. Now the only definition of the back |
| `prefers-reduced-motion` | Yes | `--motion-reveal` collapses to 1 ms in `tokens.css`; the reveal stays and is immediate. No media query in any of the four card files |
| The card under the pointer, clicked | Correct | Reading and playing are one gesture. The growth is centred on the card's own vertical centre line and anchored at its bottom edge, so it does not move out from under the pointer |

---

## 7 The landing checks

1. **D65 to D69 answered**, none skipped. § 3.
2. **Every answer carries a reason and a named rejected alternative.** Fourteen rejected alternatives
   across the five decisions, five of them on D66, where constraint 8 asked for the reason to be worth
   more than usual.
3. **No CSS file over 300 lines.** 233, 121, 76, 147, 254. `tokens.css` at 254 is the one to watch.
4. **No user-facing string in a `content:` property.** Nothing was added to a `content:` anywhere.
5. **Built once, then only attributes rewritten.** The reveal writes nothing at all: it is `:hover` and
   `:focus-visible`. `data-face` is written once per hand per turn, next to `data-active`.
6. **`npx playwright test tests/e2e/skill-hand.spec.js`.** Nothing in D66 moved the two pseudo-elements
   the three checks read, because the option that would have was rejected. The one thing those checks may
   assert and this delivery changes is the card back on an inactive hand: if a case asserts that
   `[data-active="false"]` draws a back, **it is superseded by D65** and its replacement is the regression
   in check 8, that the hand is face up during the dice card phase.
7. **`npx playwright test tests/e2e/handover.spec.js`.** Unchanged and expected green. The curtain and the
   ordering rule in `session-actions.js` lines 55 to 69 are what conceal a hand, and neither is touched.
8. **A new `tests/e2e/card-reveal.spec.js`.** Three assertions, and `.card--reading` is there so the third
   does not need a synthesised pointer: the paragraph is `display: block` and painted above 12 px on a
   revealed card, the keyboard reaches the same state on a card with `data-playable="false"`, and the
   player's own hand is `data-face="up"` during the dice card phase.
9. **1440 by 900, and one check below the 84rem breakpoint.** Above it, a revealed card stands about
   107 px above the skill plate, over the foot of the dice plate, and is not clipped by `#app`. Below it
   the regions stack and the page scrolls: the card still grows upward out of its own plate, into the plate
   above it in stack order, and because the growth is `scale` and not a layout change it cannot lengthen
   the page or move the scroll position.

---

## 8 What is still open

**Needed from Claude Code, two attributes and no code.**

1. **`data-face` on `.hand--skill`.** `"up"` for the local seat's hand, in every phase and whatever
   `playableCards` returns; `"down"` only for a hand that is not the viewer's, which is no case in hot seat
   play today. Absent counts as up. `skill-hand-view.js` line 118 keeps writing `data-active` from
   `playableCards(state, seat).length > 0`, unchanged: D36's meaning is correct and D65 does not touch it.
2. **`tabindex="0"` on every card with a `data-card-id`**, playable or not, in the skill hand.
   `card-view.js` line 167 restricts it to playable cards today, and the comment at lines 155 to 167 gives
   the reason, which D67 retires: focus now reveals, so the tab stop does something. An empty slot keeps
   no tab stop, since it has no id.

**Superseded, by file and line, as constraint 7 asks.**

| Superseded | By |
| --- | --- |
| `card-state.css` lines 76 to 92, the six `.hand--skill[data-active="false"]` selectors | D65. `.card--back` and `[data-face="down"]` |
| `hand.css` lines 62 to 66, the sibling `translate`, and lines 68 to 74, the `.hand--skill .card` transition that existed to carry it | D69 |
| `hand.css` lines 78 to 80 and 84 to 87, `[data-active="false"]` on the overlap and its hover override | D65.4. `[data-face="down"]` |
| `card.css` lines 202 to 205, `.card:not(.card--full) .card__text` | D66. Two positive rules |
| Spec 03 D33's second half, the back on an inactive hand | D65. The secrecy rule itself stands and is enforced where it always was |
| Brief 09 § 4, first finding, filed as a tidiness note | D65, as the brief itself asks |
| `00-open-requests.md` § 4's hover finding against D64 | D69. The rest of D64 is untouched and still open |
| `card-view.js` lines 155 to 167's reason for restricting the tab stop | D67 |

**One thing this delivery noticed and did not do.** `.app__skill` paints over `.app__dice` because it
comes second in the DOM, which is what keeps a revealed card above the dice plate. If the rail's two
plates are ever reordered, `.app__skill` needs `position: relative` and a `z-index`. `app.css` is not
delivered here and does not need changing today.

**Owed and not answered, unchanged from handoff 07.** The six pawn statuses other than `stunned` and
`slippery`. The reaction window countdown and whether the prompt strip belongs at the foot or in the rail.
D61, the pickable field's remainder, and D64, the fan's shadow and stacking order, both still open. D17,
D21, D22, D23 and D24 from handoff 02. Fonts are still loaded from Google Fonts.

**No em dash, in this spec or in any of the five stylesheets.** Rule 5 of the work order, checked.
