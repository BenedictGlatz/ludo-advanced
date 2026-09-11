# Handoff 10, brief: reading a card you are holding

**From:** Claude Code
**To:** Claude Design
**Date:** 2026-09-03
**Issue:** none. A feature request from the Product Owner, and two defects found underneath it
**Answers:** nothing. **D65 to D69**, and D65 asks you to overturn part of D33

---

## 0 What was asked for, and what it turned out to be

The request was one sentence: **hovering an Action or Reaction card should turn it over so the text on it
can be read.**

Looking for the place to put that turned up two separate reasons a player cannot read a card in their own
hand. Both are live, both are ours, and neither is what the request described.

| What was asked for | What is actually there |
| --- | --- |
| "the cards should turn over" | They are already face down for most of every turn, **including the player's own hand**, and the thing that puts them face down is the question "is a card playable right now", which is not the same question as "is this hand somebody else's" |
| "so the text can be read" | Turning a hand card over does not make its text readable. `card.css` shows the rules paragraph at one size only, and a hand card is not that size. At the hand's factor the paragraph would render near 9 px |

So the request is not a single animation. It is two decisions that happen to meet at the same gesture,
and D65 is the one that has to be answered first, because a card that is face down cannot be made
readable by any amount of hovering.

---

## 1 Why the card back on the player's own hand is a defect and not secrecy

This is the part to read, because it asks you to take back half of D33.

**The chain, in four steps.**

1. `src/ui/skill-hand-view.js` line 118 writes `data-active` on the hand from
   `playableCards(state, seat).length > 0`. The attribute therefore means "at least one card here can be
   played this instant".
2. `src/ui/styles/card-state.css` lines 76 to 92 draws **every** card in a hand with
   `data-active="false"` as a card back, and `src/ui/styles/hand.css` lines 101 to 103 then closes the
   row up to the overlap D33 asked for.
3. `src/state/intents-cards.js` line 80 refuses every card while `state.phase !== ACTION`. So during the
   dice card choice and during the move, nothing is playable, and in the action phase nothing is playable
   once the card budget is spent.
4. Therefore the row of backs appears **on the hand of the player sitting in front of the screen**,
   through most of their own turn.

**The state layer already fixed this exact confusion, and the stylesheet undid it.**
`src/state/intents-cards.js` lines 118 to 120 says, about the seat whose hand is on screen:

> **Never `null`.** A hand is always on screen, and whether any card in it is *playable* is a separate
> question that `playableCards` answers. Conflating the two would blank the hand in every phase but one,
> which is exactly the bug the end-to-end spec caught.

That is the same conflation, one layer up, described in advance. It was caught in `state/` by a test and
came back through the cascade, where nothing was looking.

**And the back is not what enforces D33.** Hot seat secrecy is enforced by the handover curtain and by
one ordering rule. `src/ui/session-actions.js` lines 55 to 69 passes the turn **before** taking the
curtain down, and its comment names D33 and D39 as the reason:

> closing the overlay first left one painted frame of the *leaving* player's five skill cards in front of
> the person picking the device up, which is the exact leak D33's secrecy rule and D39's handover exist to
> prevent.

A hand belonging to someone else is therefore never on screen with the board visible. Every case in which
this card back fires is the player's own hand. On top of that, `src/ui/styles/app.css` lines 136 to 138
already dims the whole plate when `data-active="false"`, so the region is saying "I am not asking you
anything" twice, once in a way that also hides information the player owns.

**This was already on record, and it was filed too low.** Brief 09 § 4 named it as one of two findings
that need no decision, in these words: "`data-active` on the skill hand means *some card is playable*
rather than *this seat is on turn*, so D33's hot-seat privacy hangs on the wrong state." That was right
about the cause and wrong about the consequence. Filed as a tidiness note it stayed a note. What it
actually does is hide from a player information they own, in every phase but one, and that is a decision
rather than a note. It is promoted to **D65** here, and brief 09's own § 4 entry is superseded by it.

**We did not simply delete it.** Removing a card back is a change to how something looks, and `CLAUDE.md`
forbids this side from taking that decision.

---

## 2 The measurements

Every number here is read off the repository or computed from it, per the brief rule that facts are not
invented in a brief.

**The rules paragraph.** `src/ui/styles/card.css` lines 203 to 205 hide `.card__text` on anything that is
not `.card--full`. The chain that makes the paragraph unreadable at hand size:

| Step | Where | Value |
| --- | --- | --- |
| Root text size on the fitted stage | `app.css` line 47, at a 1440 by 900 window | 14.4 px |
| The skill hand's size factor | `hand.css` line 35 | 0.68 |
| The card's own font size | `card.css` line 38, `--card-u * 1rem` | 9.79 px |
| The paragraph, `0.875em` of that | `card.css` line 195 | **8.57 px** |

`card.css` line 202 states the same conclusion in its own comment, at "near 9 px". So the paragraph is
hidden for a good reason, and the reason does not go away by unhiding it.

**Where the paragraph can be read today.** In the dice pool overview and in the reaction prompt, both of
which use `.card--full`. Neither is reachable while the player is looking at their own hand deciding what
to do.

**The fan, for D69.** The overlap follows `data-count`, `hand.css` lines 34 to 53: 0.24 at up to three
cards, 0.26 at four, 0.3 at five, 0.44 at six, 0.52 at seven. The hover reveal in `hand.css` lines 62 to
66 shifts the following siblings by `4rem * 0.68`, which is 43.5 px. The covered strip is 42.4 px at
overlap 0.24 and 77.8 px at 0.44. **At the higher counts a card cannot be fully revealed by hovering it**,
which `00-open-requests.md` § 4 already records against D64.

Those three figures are the ones brief 09 recorded, at a 16 px root, which is a window 1600 px wide or
wider. The table above uses 14.4 px, which is the 1440 by 900 design resolution. Both are correct for
their window and they are not mixed in any single comparison: the shift and the strip scale with the same
root, so the shift falls short of the strip at every window size, and the paragraph is under 9 px at
every window size at or below 1600.

**What has no hover feedback at all today.** `card-state.css` lines 45 to 46 key both the hover and the
focus treatment on `[data-playable="true"]`. An Action card you are holding but cannot play right now
does nothing when you point at it. That is the card a player most often wants to read.

---

## 3 The DOM contract we offer

Three changes, all on our side of the line, all conditional on your answers. Nothing here is built yet.

| Selector | Meaning | Why it is new |
| --- | --- | --- |
| `.hand--skill[data-face="up"]` / `[data-face="down"]` | Whether the row shows faces or backs | Splits the two meanings that share `data-active` today. `data-active` keeps D36's meaning, "this region wants an answer", and keeps driving the plate lift and the dim in `app.css` lines 129 to 138. The back would hang off `data-face` instead of off playability |
| `.card[data-card-id]` as the reveal target | Every real card responds, not only a playable one | Today only `[data-playable="true"]` responds. An empty slot has no id, so it is excluded for free, which is the same hook `hand.css` line 167 already uses |
| A hook for the rules paragraph, separate from `.card--full` | "shows the paragraph" stops meaning "is the reference size" | The two are welded together in `card.css` line 203. Separated, you can put the paragraph on a revealed hand card at whatever size you choose |

**No mouse handler unless D66 asks for one.** There is not a single `mouseenter`, `mouseover` or
`pointerenter` anywhere in `src/` today. `src/ui/events.js` binds `click` and `keydown` and nothing else,
and hover is deliberately pure CSS. Option 3 in D66 is the one answer that would change that, and it is
priced accordingly below.

**What stays as it is.** Every element and attribute named in the DOM contract in spec 03 § 3.1:
`.card__banner`, `.card__type`, `.card__kind`, `.card__art`, `.card__title`, `.card__text`,
`.card__tags`, `.card__tag`, `.card__result`, and the identity attributes `data-card-id`,
`data-card-family`, `data-card-type`, `data-card-category`. Cards are still built once and then only
rewritten, spec 03's standing rule.

---

## 4 The five open decisions

### D65. Does the player's own hand stay face down when nothing is playable?

Against the coupling described in § 1. Four parts.

1. **Is the player's own hand always face up**, whatever phase the turn is in and whatever the card
   budget says? If yes, we split `data-face` off `data-active` as § 3 offers, and `data-face="down"` is
   then left with no case at all in normal play. Say whether it should exist anyway.
2. **If it goes, what still says the region is dormant?** The plate dim in `app.css` lines 136 to 138 is
   already there and is untouched by this. Is that enough on its own, or does a face up but idle hand
   need its own treatment, and if so is that a treatment on the plate or on the cards?
3. **Does the closed up overlap survive anywhere?** `hand.css` line 102 tightens the row when the hand is
   a stack of backs. If there is no stack of backs, that value has no situation left.
4. **What is `.card--back` still for?** The class exists in `card-state.css` line 76 and **no JavaScript
   ever applies it**. Spec 03 D29 named the pool and the discard pile as its users. Neither draws a card
   today. Confirm it is being kept for those, or say it goes.

**This is the one that blocks the other four.** A face down card cannot be made readable by hovering.

### D66. What does a revealed card look like, and by which mechanism?

The core question. We are not choosing, because all three routes are a look. Here is what each one
actually costs us, so the choice is made against real numbers rather than against a guess.

**Option 1, grow in place.** The card under the pointer gets larger where it stands, by `scale()` or by
raising `--card-u`, and the paragraph becomes legible because the whole card is magnified.

- No DOM change at all. The cheapest by a wide margin.
- Cost: `#app` clips at the stage edge, `app.css` line 63, and the skill plate is the fourth of five grid
  rows. A card growing upward covers the dice card plate above it. That is survivable in the paint order
  as things stand, but it is a thing you should decide rather than discover.
- Cost: `scale()` magnifies the existing layout rather than re-flowing it, and at hand size the art
  currently expands to fill the space the missing paragraph frees, `card.css` lines 169 to 173. If the
  paragraph appears, that space is claimed back and the card's insides move. Say whether the reveal
  re-flows or magnifies.

**Option 2, a real turn.** The card rotates about its vertical axis.

- Cost, stated openly: a genuine two sided flip needs two faces, so `card-view.js` grows a
  `preserve-3d` wrapper with a front and a back inside it. **Every rule that targets `.card > *` breaks**,
  which is `card-state.css` line 89 and `hand.css` line 181, and the back's dashed frame and mark, which
  live in `::before` and `::after` on `.card` itself, have to move onto a real element. `pool.css` and the
  reaction prompt render the same component and come along.
- Cost: three checks in `tests/e2e/skill-hand.spec.js` lines 66 to 98 read those two pseudo-elements
  directly, and they would be rewritten rather than kept.
- There is no `perspective`, `transform-style` or `rotateY` anywhere in the project today, so this is new
  ground rather than an extension of something.
- **A cheaper variant exists and may be enough.** One element, rotated from 0 to 90 degrees and back to 0
  as a keyframe, with the face swapped at the halfway point. It reads as a turn, it needs no second face
  and no DOM change, and the price is that the look has to be keyframed alongside the rotation instead of
  being a plain state. If a turn is what you want, say which of the two, because the difference between
  them is most of the work.
- Note that a turn on its own does **not** answer the request. The card is the same size afterwards and
  the paragraph is still near 9 px. A turn has to come with either Option 1 or Option 3.

**Option 3, a detail card beside the hand.** One extra card at the reference size, filled from whichever
card is under the pointer.

- Cost: a new element, new view code, and the first mouse handler in the project.
- Gain: it reuses `.card--full`, which is already designed and already shows the paragraph at a size that
  works, and the card contract in the hand is not touched at all. It is the lowest risk of the three and
  the only one that solves readability outright rather than by magnification.
- If you pick it, say where it sits and what happens to it when nothing is hovered, because an empty
  region that appears and disappears is a layout decision and the stage has no spare rows.

Whichever it is, three things need saying with it:

- **What the reveal shows.** The paragraph, and what else. The card holds a title, a type label, a kind
  pill, a category tag and the art, and at hand size the art is currently the fastest thing to recognise
  by D26's own argument.
- **Whether the revealed card is still clickable in the same gesture**, or whether reading and playing
  are two separate actions.
- **How the reveal is dismissed.** Pointer out is obvious for a mouse. For the keyboard it is D67.

### D67. Does the reveal apply to a card that cannot be played, and what is the focus state there?

NFR-08, and there is an existing decision in the way.

`card-view.js` line 167 gives a card `tabindex="0"` only when it is playable, so **the keyboard cannot
reach a card in order to read it**. The comment at lines 155 to 167 gives the reason, and it is a good
one: a tab stop where `Enter` does nothing tells a keyboard user nothing, which is why the pool overview
lost its seven dead stops.

**That reason changes if focus reveals.** Focusing the card would then do something, so the objection
dissolves and every card with an id can hold a tab stop. We are ready to make that change and we are not
making it unasked, because it puts a focus ring on a card that cannot be played and that is a state you
have not drawn.

1. Does a card you cannot play reveal on hover and on focus, the same as one you can?
2. If it does, is the focus ring on such a card the same as on a playable one? `card-state.css` lines 68
   to 71 draws one ring for every card, and lines 60 to 66 draw the selection ring from the same token.
3. Does the reveal replace the existing lift on a playable card, `card-state.css` lines 40 to 51, or sit
   on top of it? Two treatments on one gesture may be one too many.
4. Is the reveal dismissed by moving focus away, or does it need `Escape`?

### D68. Which token times the reveal, and what survives reduced motion?

D8 owns motion and D12 owns reduced motion. D20 and D60 are the precedent that a new duration gets a
number rather than being invented in a stylesheet.

1. Is `--motion-feedback` the right budget, or does the reveal need its own token? A turn is a longer
   gesture than a lift, and `--motion-feedback` is the NFR-11 budget for first visible response.
2. Under `prefers-reduced-motion`, D12's rule is that loops stop and feedback stays. Revealing a card is
   feedback, so it should stay and become immediate. Confirm, and say whether a turn under reduced motion
   is an instant swap or no turn at all.
3. Is there a delay before the reveal starts, so that sweeping the pointer across a fan of five does not
   fire five reveals? That is a duration and therefore yours.

### D69. Does the reveal replace the sideways fan out, or join it?

`hand.css` lines 62 to 66 push the right hand neighbours aside so a covered card can be read without
leaving the row. § 2 measured that it under shifts at the higher card counts, which is already on record
against D64.

A card that grows or turns may not need the neighbours moved at all, in which case the under shift stops
mattering and the rule comes out. If both stay, the shift has to reach the widest covered strip, 77.8 px
at overlap 0.44. Either answer is fine; they need different code.

---

## 5 The rules that apply to the delivery

The five standing ones from `00-open-requests.md` § 5, unchanged: no user-facing string in a `content:`
property; no CSS file over 300 lines after `npm run format`; built once, then only attributes rewritten;
two skins from the tokens with `prefers-reduced-motion` respected; and **no em dash**, in the spec or in a
CSS comment, neither the character nor the rhetorical habit.

Three that are specific to this one:

6. **Room is tight in the two files this lands in.** `card.css` is at 227 lines and `tokens.css` at 265,
   so those have 73 and 35 lines of headroom. `card-state.css` is at 115 and `hand.css` at 200. If the
   answer needs more than about thirty lines in `card.css`, split at a real seam and name it, the way
   `card-state.css` was split off `card.css` at 322 lines and `board-trap.css` off `board.css`.
7. **Name what is superseded, by file and line.** This is now a standing request after handoff 08, where
   two specs answered one question without either seeing the other. D65 in particular retires rules in
   `card-state.css` and `hand.css` that D33 put there.
8. **Say which of the three options in D66 you took, and why the other two lost.** The rejected
   alternative is the part the report is graded on, and here the three differ in cost by a large factor,
   so the reason is worth more than usual.

---

## 6 What is out of scope

- **Dice cards.** They render from the same component and they have no rules paragraph worth reading:
  the title is the rule. If your answer to D66 changes `.card` rather than `.hand--skill .card`, say
  explicitly whether the dice row inherits it or is excluded.
- **The pool overview and the reaction prompt.** Both already show a card at the reference size with its
  paragraph, and both work. They are only affected if D66 option 2 forces the DOM change.
- **D61, the pickable field**, and **D64, the fan's shadow and stacking order**. Both still open, neither
  reopened here. D69 takes over the one hover finding that was filed under D64 and nothing else of it.
- **The empty slot.** Settled on 2026-09-03 as a dashed silhouette rather than a card. It has no id, so
  every hook in § 3 excludes it by construction. It is not asked about again.
- **The reaction window countdown and the prompt strip placement**, two of the four unnumbered leftovers
  in `00-open-requests.md` § 4. Still owed, still not asked for here.

---

## 7 The landing checks

The five standing ones, plus:

6. **`npx playwright test tests/e2e/skill-hand.spec.js`.** Three of its cases read computed style off
   cards, including the two pseudo-elements that D66 option 2 would move. They must stay green, or the
   spec must say which of them is superseded and what replaces it.
7. **`npx playwright test tests/e2e/handover.spec.js`.** D65 touches the one thing that hides a hand, so
   the handover has to be checked even though the curtain is what actually does the hiding.
8. **A new `tests/e2e/card-reveal.spec.js`**, which we write once the spec lands. It will assert that the
   paragraph is readable under the pointer, that the keyboard reaches the same state, and, as a
   regression on § 1, that the player's own hand is face up during the dice card phase. **There is no
   test on the hover behaviour today at all**, which is the reason § 1's defect survived two sprints.
9. **1440 by 900**, the design resolution, and one check below the 84rem breakpoint where the stage is off
   and the regions stack. A card that grows on hover behaves differently once the page is allowed to
   scroll.
