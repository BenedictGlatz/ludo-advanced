# Handoff 18, brief: an animation of its own for every skill card

**From:** Claude Code
**To:** Claude Design
**Date:** 2026-09-06
**Read against:** `4fcec3d` on branch `dev`. Every line count and measurement below was taken from that
tree. The bot tactics work that landed the same evening touched `src/ai/`, `scripts/` and the notes only,
and nothing this brief names
**Issue:** none yet. A feature request from the Product Owner
**Answers:** nothing. **D104 to D115**

> **Where this file lives.** It was written to the repository root because that is where it was asked
> for. When it goes into the loop it belongs at `01-Design/Handoff/18-brief-skill-card-animations.md`,
> next to the spec that answers it, per [01-Design/README.md](01-Design/README.md).

---

## 0 What was asked for, and what is actually there

The request was one sentence: **every skill card should get its own attractive animation that fits the
design we already have.**

Four answers were settled with the Product Owner before this brief was written, and they are the frame
everything below sits in:

| Question | Answer |
| --- | --- |
| Where does it play? | **Two stages.** The card shows itself large, then the effect lands on the board |
| How individual per card? | **A shared base per family, plus an accent of its own per card** |
| What moves? | **The card as an object, plus a new effect layer.** The 36 drawings are not touched |
| How does it fit in the turn? | **Its own moment**, like the roll's. Bots animate too. `?fast=1` and reduced motion collapse it |

And here is what the repository actually has today:

| What was asked for | What is actually there |
| --- | --- |
| "its own animation per card" | **Nothing, for any of the 29.** No keyframe, no transition, no token anywhere is keyed on a skill card being played |
| (not reported) | **A played skill card does not even leave the hand visibly.** It is gone from `state.skillHands` on the next render, the slot renders as an empty dashed silhouette, and the fan re-flows. Zero frames of motion |
| (not reported) | **The dice hand has all three of the hand animations.** `card-deal`, the fly-back of the two unkept cards on `data-resolved`, and D71's `dice-throw` are every one of them scoped to `.hand--dice`. The skill hand inherits none of it |
| (not reported) | **A card play has no moment either**, in the sense D70 gave that word. `card-controls.js`'s `carryOn` does hold the turn for `--motion-trap-hold`, but only when the state has something to *announce*: a fired trap, a nullified card, or a **bot's** card. A person playing an ordinary card gets 0 ms |
| (not reported) | **The state does not record where the effect landed.** `lastCardPlayed` is `{ seat, cardId }` and `lastCard` is `{ seat, cardId, turnNumber, outcome }`. Neither carries the target, so nothing in `ui/` can currently know which square a Banana Peel went on |

So this is not 29 animations bolted onto an existing effect. It is a stage that does not exist, a
moment that only half exists, and a target the view is not told about. The last two are Claude Code's
to build and section 8 says what will be there when the spec arrives.

---

## 1 What to design

Screen ids are from [Obligations-Book.md](00-Meta/Project-Management/Obligations-Book.md) § 2.2.

| Screen | What this handoff adds to it |
| --- | --- |
| **S5 Skill hand** | The card leaves the hand and goes somewhere. The hand is where every cast starts |
| **S3 Board** | The second stage. 17 of the 29 cards do something on the board that can be shown |
| **new** | **The cast stage**: the place a card shows itself between leaving the hand and its effect landing. It has no screen id, because it does not exist |

**The new region's row in § 2.2 is Claude Code's to write, not the spec's**, and it will be written from
the spec's answer to D104. Naming it S12 here and then finding out that the answer is "it happens inside
S3 and needs no region" would put an invented screen in the obligations book.

**"Cast" is a working name for a region, not a design decision.** If the spec renames it, the DOM contract
in section 3 renames with it and this brief is wrong about a word rather than about a thing.

---

## 2 What the repository already decides, so nothing is answered twice

The standing section since brief 08, and it exists because of the D59 accident: a question was answered
twice, in two files, and neither side could see the other.

| Already decided | Where | Status in this brief |
| --- | --- | --- |
| **The tone**: flat fills, a 3 px ink outline on every card, pill and pawn, hard offset shadows that are never blurred, big radii, no gradients, no soft shading | D14, the header of `tokens.css` | **Confirmed and binding.** Every cast has to look like it belongs to this game |
| **Two skins**, Picnic and Night In, switched on `<html>`, every colour through `light-dark()` | D13, `tokens.css` | **Confirmed.** A cast that only reads in one skin is not finished |
| **Loops stop, feedback stays** under `prefers-reduced-motion` | D12, the block at the foot of `tokens.css` | The rule D112 has to apply to a two-stage cast |
| **Reading time is not movement.** `--motion-refusal-hold`, `--motion-trap-hold` and `--motion-roll-hold` sit deliberately *outside* the reduced-motion block, `--motion-roll` inside it | D20, D60, D70 | The precedent D111 has to take a side on |
| **The roll's moment**: 520 ms of throw inside a 900 ms hold, because a number that is immediately overtaken has been mentioned rather than shown | D70, `roll.css`, `timers.js` | The model for the cast's own moment. Not reopened |
| **`rotate` and `translate`, never `transform`**, in anything that animates a card. `card.css` transitions `transform`, and `card-state.css` and `hand.css` both write `translateY` into it | `roll.css` header, `card-reveal.css` precedent with `scale` | **Binding on every keyframe in this handoff** |
| **The board is the one region that may not be covered.** The message strip was moved off it for exactly that reason | D98, `page.js` | D104 has to say what a *transient* cast may do that a permanent strip may not |
| **Built once, then rewritten.** `updateCard` writes attributes and never creates an element, because an element that is replaced restarts every transition on it | D10, `card-view.js` | **Binding.** The cast stage is built empty at mount and filled, like the last-card plate |
| **One card component behind all three families**, rendered from a description | D28, `card-view.js` | The cast reuses it. It does not get a second card component |
| **The card art is inline SVG, generated from the artboard by `scripts/extract-card-art.js`, and the `.svg` files are not hand-edited** | Brief 03 § 2, `src/ui/art/index.js` | **Not reopened. The drawings are not animated from the inside**, per the Product Owner's answer. That is what section 7 lists as out of scope |
| The hover reveal grows a hand card to `--card-u: 1` on `--motion-reveal`, and the dice row is excluded from it | D66, D68, `card-reveal.css` | Not reopened. D104 has to say how a cast and a reveal share the screen |
| The last-card plate keeps the record of what was played, as the fifth HUD plate | D100, `last-card-view.js` | Not reopened. The cast is the moment, the plate is the record |
| The five card layers `--layer-card` to `--layer-card-reading`, and the seven page layers up to `--layer-chrome` | `tokens.css` | A cast needs a layer. Whether it is a new token is D104's |

---

## 3 The DOM contract

**This is a proposal, and every part of it is negotiable.** It exists so both sides can work at the same
time without meeting: the CSS may target exactly what is named here, and Claude Code guarantees to
produce exactly this. If the spec needs a different shape, say so in D104 or D110 and Claude Code builds
that instead.

### 3.1 The cast stage

Built empty once per match by `page.js`, as the last child of `.app` before the overlay, and filled by a
new `src/ui/cast-view.js`.

```html
<div class="cast"
     data-cast="idle"                      <!-- idle | card | board | done -->
     data-card-id="action-banana-peel"      <!-- absent while idle -->
     data-card-type="action"                <!-- action | reaction -->
     data-card-category="blocking"          <!-- absent for the 10 core cards -->
     data-cast-family="?"                   <!-- D105 names the values -->
     data-seat="2"
     data-actor="bot"                       <!-- human | bot -->
     data-outcome="resolved"                <!-- pending | resolved | nullified | negated -->
     data-board="true">                     <!-- does this card have a board stage at all -->
  <div class="cast__card">
    <!-- a .card.card--full built by card-view.js, exactly as the last-card plate holds one -->
  </div>
  <div class="cast__fx" aria-hidden="true">
    <span class="cast__part" data-part="0"></span>
    <span class="cast__part" data-part="1"></span>
    <!-- how many, and whether any card needs more, is D110 -->
  </div>
</div>
```

**`data-cast` is the state machine and the only thing that has to be read.** It moves
`idle` to `card` to `board` to `done` and back to `idle`. A card with no board stage skips `board`
entirely, which is what `data-board` lets the CSS see coming.

The attributes follow the two rules the existing contract already follows. An attribute with nothing to
say is **removed** and never set to the empty string, because `card.css` already distinguishes
`data-card-category` absent from present and empty. And `data-actor` and `data-seat` are written whether
any stylesheet reads them or not, on D51's precedent: a fact that is already known costs nothing in the
DOM and gives a later decision something to hang off.

### 3.2 What the cast is told about geometry

Written by `cast-view.js` as inline custom properties on `.cast`, in the same units the board already
uses:

| Property | What it is | Where it comes from |
| --- | --- | --- |
| `--cast-from-x`, `--cast-from-y` | The centre of the hand slot the card left, in px relative to `.app` | The slot's `getBoundingClientRect()` |
| `--cast-to-x`, `--cast-to-y` | The centre of the field or pawn the effect lands on, in px relative to `.app`, for the 17 cards that have one | `board-geometry.js`'s `cellCentre` and `pawnCentre`, which already exist and are already used by the drag |
| `--cast-span` | How many fields the effect covers, unitless: 1 for a single square, up to 12 for Let Him Cook | The state, per card |
| `--cast-dir` | `1` forwards, `-1` backwards, for the cards that have a direction | The played target |

**Only these four kinds of number are available**, and if the spec needs a fifth it has to be derivable
from the state. Anything a stylesheet cannot get from an attribute or one of these has to be asked for in
the spec, so Claude Code can add it.

### 3.3 The board stage

The board already carries the precedent this follows exactly. `.square__trap` is an empty `<span>` on
**all 40 fields from the moment the board is built**, whether anything stands there or not, for two
stated reasons: D10 forbids creating an element at the moment it gets content, and both pseudo-elements
of `.square` are already taken by D27's skill diamond and the turn-off bar.

So, proposed on the same pattern:

```html
<div class="square" data-cast-hit="direct">      <!-- direct | splash | path | aura, absent normally -->
  <span class="square__trap"></span>
  <span class="square__cast"></span>             <!-- new, empty, on all 40 from build time -->
</div>

<div class="pawn" data-cast-hit="victim">        <!-- victim | actor | shielded, absent normally -->
  <span class="pawn__status"></span>
</div>
```

`.pawn` has no free pseudo-element either and already carries `.pawn__status` for the same reason, so a
pawn's part in a cast is proposed as an **attribute only**, no new child. If D109 needs a mark on the
pawn that a `data-` attribute cannot draw, say so and Claude Code adds `.pawn__cast` next to
`.pawn__status`.

`.board` also gains `data-cast="<cardId>"` while the board stage runs, so a whole-board card like The
Purge has something to key on.

### 3.4 The lifecycle, so the CSS knows what it can rely on

1. The card is played. `state/` accepts the intent.
2. `cast-view.js` fills `.cast`, sets `data-cast="card"`, and the card stage runs.
3. If `data-board="true"`, `data-cast` goes to `board`, the board attributes go on, the board stage runs.
4. `data-cast="done"`, then `idle`, and every board attribute comes off.
5. The turn carries on.

**The sequence is identical under `?fast=1` and under reduced motion**, and only the waiting is shorter.
That is the property that makes the override safe, it is the rule `turn-waits.js` already states in those
words, and it is why the whole end-to-end suite can keep the ordering it was written against.

---

## 4 Facts the design must match

### 4.1 The card set

| Fact | Value | Where |
| --- | --- | --- |
| Distinct skill cards | **29** | `catalogue.js`, `CARD_COUNT` |
| Copies of each in the pool | 2, so a 58-card pool | `vocabulary.js`, `COPIES_PER_CARD` |
| Cards in a hand | up to **5** | `skill-pool.js`, `SKILL_HAND_LIMIT` |
| Cards a seat may play per turn | 1 by default, 2 after a Double Dip | FR-23 |
| Action cards | 22 | `catalogue.js` |
| Reaction cards | 7 | `catalogue.js` |
| Cards with a `category` | **19 of 29.** The other 10 have `category: null` | `vocabulary.js` |
| Distinct `kind` values | 19, for 29 cards | `vocabulary.js` |
| Mechanic groups in `core/cards/effects/` | 6 | `effects/index.js` |

**The hole in the middle of that table is the reason D105 exists.** The four categories, Movement,
Blocking, Troll and Offensive, are the artwork's own and they cover only artboard `4a`. The ten cards of
artboard `6a` have no category at all, and `vocabulary.js` says in as many words that inventing one there
would be answering a design question that is not the code side's to answer. So the "family" the base
movement hangs off cannot simply be `data-card-category`. Three candidates exist and D105 picks one.

### 4.2 The measurements

Read off the files. `app.css`'s `html` rule sets the root text size to `min(100vw / 100, 100vh / 56.25)`,
which at 1440 by 900 is **14.4 px**. `card.css` sets a card's width to `--card-u * 16.25rem` at a 260 by
380 aspect ratio.

| Thing | Where | At 14.4 px |
| --- | --- | --- |
| The stage | `--stage-w` 100rem by `--stage-h` 56.25rem | 1440 by 810 px |
| The board | `--board-size`, 44 % of the stage width | 633.6 px square |
| One field | `--cell`, the board over 11 | 57.6 px |
| A pawn | `--pawn-size`, 0.78 of a cell | 44.9 px |
| A skill hand card | `--card-u: 0.68` | 159.1 by 232.6 px |
| A dice hand card | `--card-u: 0.76` | 177.8 by 259.9 px |
| A card at the reference size | `.card--full`, `--card-u: 1` | 234 by 342 px |
| The right-hand rail | `minmax(28rem, 1fr)` | at least 403 px |
| **How long a card play takes today** | nowhere | **0 ms of motion** |

Two consequences worth having in front of you before D104. **A card at the reference size is 234 px wide
against a 633.6 px board**, so a cast card at that size covers about 37 % of the board's width. And **the
band directly above the skill hand is already spoken for**: the message strip hangs above `.app__skill`
and stands 46 px tall, the gap between the two plates gives 16 px of that back, and the remaining 30 px
is paid for out of the foot of the dice plate above it. A cast that begins by lifting a card straight up
out of the fan begins in the one band on that side of the page that already has a tenant.

### 4.3 All 29 cards, what they do, and whether the board can show it

Card texts are `card.skill.<id>.text` from `src/i18n/locales/en/cards.json`, verbatim in substance. The
last column is the fact that decides how much work D109 is: **12 of the 29 do nothing the board can
show.** Their whole cast is the card stage.

| Card | Type | Category | Kind | What happens | Board stage? |
| --- | --- | --- | --- | --- | --- |
| Pot of Greed | Action | none | draw | Draw two Action cards | no, the hand grows |
| Double Dip | Action | none | economy | You may play a second card this turn | **no** |
| No Take-Backsies | Action | none | lockout | No reaction window opens for the rest of the turn | **no** |
| Critical Success | Action | none | buff | Roll twice, keep the higher | no, the roll badge changes |
| Angel Die | Action | none | buff | Add a D8 to the roll | no, the roll badge changes |
| Critical Failure | Reaction | none | debuff | Roll twice, the lower counts | no, the roll badge changes |
| Devil Die | Reaction | none | debuff | Subtract a D8. At 0 nobody moves | no, the roll badge changes |
| Nühü | Reaction | none | negate | The card that opened the window does nothing | no, it acts on another card |
| Hold Pawn | Reaction | none | control | One opponent's pawn sits this turn out | **yes**, one enemy pawn |
| The Purge | Reaction | none | chaos | For one round every landing captures, own pawns included | **yes**, the whole board |
| Banana Peel | Action | blocking | trap | A trap. Whoever touches it loses their next turn with that pawn | **yes**, one free square |
| Oil Spill | Action | blocking | trap | A trap. Whoever touches it slides 3 to 5 further | **yes**, one free square |
| It's Not That Deep | Action | blocking | trap | A trap, pushes back 1, and cancels enemy offensive cards within 3 squares | **yes**, a square and a 3-square aura |
| Rock | Action | blocking | action | Your own pawn is stone for 2 rounds. Nothing gets past | **yes**, one own pawn |
| Big Ah Rock | Action | blocking | upgrade | Stone for 3 rounds, and the nearest enemy behind is knocked back 3 | **yes**, own pawn plus an enemy moving 3 back |
| Hyperbeam | Action | offensive | d4 | Pick a pawn and a direction, roll a D4, everything on the next 1 to D4 squares goes home. Friendly fire included | **yes**, a line of up to 4 fields |
| Janky RPG | Action | offensive | d6 | Pick a square, roll a D6. On 4+ it hits that square, below it hits both neighbours | **yes**, one or two fields |
| Yeet | Action | offensive | action | Roll a D6, push one enemy pawn back that far | **yes**, one enemy pawn travelling back |
| 67 | Action | offensive | gamble | Needs a D6 or larger. Under 6 nothing moves, on 6+ the roll counts double | no, the roll badge changes |
| Uno Reverse | Reaction | troll | reaction | The capture backfires: the attacker goes to its own start area | **yes**, the attacker to its yard |
| Ghost Mode | Reaction | movement | reaction | You dodge: the declared move does not happen | **yes**, a pawn that stays put |
| Aight Imma Head Out | Action | movement | action | Your pawn jumps 4 forward, or returns to your entry square. Your choice | **yes**, one own pawn |
| Let Him Cook | Action | movement | risky | Roll a D12 and run. Past home means back to the start area | **yes**, a run of up to 12 fields |
| Built Different | Action | movement | passive | Your pawn cannot be captured for 2 rounds | **yes**, one own pawn |
| Speedrun Any% | Action | movement | risky | Your roll is doubled. Too far is still too far | no, the roll badge changes |
| Lock In | Action | troll | defensive | Your pawn is locked a round: you cannot move it, nobody can capture it | **yes**, one own pawn |
| Ragebait | Action | troll | taunt | If the named enemy pawn can move, its owner has to move it | **yes**, one enemy pawn |
| Tax Fraud | Action | troll | action | Take one card at random out of an opponent's hand | no, a card crosses between hands |
| FR FR | Action | troll | action | Name a number instead of rolling | no, the roll badge changes |

**Seven of the twelve without a board stage change the roll**, and the roll already has a stage of its
own: D70's throw, and D73's breakdown in the message strip. That is a fact D109 can use rather than a
problem it has to solve.

### 4.4 The turn's time budget, and what it is not

The roll's hold costs about 0.9 s per turn, which `timers.js` puts at roughly three and a half minutes
over a four-player match, "the price of the feature stated rather than discovered". The same arithmetic
for a cast is **not available**, because nobody has measured how many cards a match actually plays.

So the fact, and only the fact: **a seat may play one card per turn, two after a Double Dip, plus one per
open reaction window.** Whatever D111 sets the hold to is paid that many times. The number of card plays
per match is a measurement that belongs in `notes/09-source-code-overview.md` next to the command that
produced it, and the bot arena in the Bot Tactics Plan is what will produce it.

---

## 5 Open decisions this handoff must answer

### D104 The cast's place on screen

Where does the card stage happen, and how much may it cover while it does?

The constraints, all of them already on record: the board may not be **permanently** covered (D98), the
stage is 1440 by 810 px at the design resolution, a card at the reference size is 234 px wide against a
633.6 px board, and the hover reveal already grows a hand card to that same reference size in place.

The question underneath it: **a transient cast is not a permanent strip, so does D98 apply to it at all?**
If the answer is that it does, the cast has nowhere to be except the rail, and the rail is 403 px wide
with two hand plates already in it. Please also say which layer the cast sits on, and whether that is a
new token.

### D105 Which axis groups the 29 into families

The base movement is shared per family and the accent is per card. But `data-card-category` covers only
19 of 29 cards, so it cannot be the family on its own. Three candidates, and the spec may name a fourth:

1. **Type plus category, with the ten as their own family.** `action` and `reaction` are the only field of
   a card that is a hard rule, and the ten uncategorised cards are exactly the ones that act on the roll,
   on another card or on a hand.
2. **The six mechanic groups of `effects/index.js`**: the roll chain, the card economy, statuses on pawns,
   pawns moved without a move, objects on squares, more than one square at once. These map almost exactly
   onto the last column of § 4.3, which is the practical advantage.
3. **`kind`**, which exists for all 29 and is the artwork's own sub-label, but has 19 values for 29 cards
   and so is barely a grouping at all.

Whatever the answer, please give the values `data-cast-family` may take, because the DOM writes it.

### D106 The base movement, per family

What every card of a family does the same way: how the card arrives on the stage, how it holds, how it
leaves. This is the part that makes 29 animations look like one game.

### D107 The 29 accents

One row per card. § 4.3 is the fact base for it. What the accent is allowed to consist of is D110's
answer, and the deliverable is a table so a missing card is visible.

### D108 The card stage's duration, and its tokens

How long, split how, on which curve. The existing budgets are `--motion-feedback` 90 ms,
`--motion-move` 240 ms, `--motion-capture` 320 ms, `--motion-roll` 520 ms, `--motion-pulse` 1200 ms, and
the four easing curves. Please say whether the cast reuses them or needs its own, and if it needs its
own, why the existing ones were not enough. NFR-11's first-response budget is `--motion-feedback` and the
click that plays a card has to answer inside it whatever the rest of the cast costs.

### D109 The board stage

What the 17 cards that reach the board actually look like there, and what the shape of it is: a mark that
appears on a field, something travelling from the card to the field, something that spreads over
`--cast-span` fields.

And the harder half: **what do the 12 without a board stage do instead?** Seven of them change the roll,
which already has D70's stage and D73's breakdown, so one honest answer is "they end on the card stage and
the roll says the rest".

### D110 What the effect layer is made of

`.cast__fx` and its `.cast__part` children exist so a cast can have sparks, a wave, a splash of oil, a
puff of ghost. The question is how many parts, and whether any card needs its own markup or whether
pseudo-elements and a fixed number of generic parts cover all 29. Two working constraints: no external
image assets, because the build ships one bundle (brief 03 § 2), and no user-facing string in a CSS
`content:` property, because every readable string goes through i18next.

### D111 The hold: is a cast reading time or movement?

D70 gave the roll 520 ms of movement inside a 900 ms hold, and put `--motion-roll` inside the
reduced-motion block while `--motion-roll-hold` stayed outside it, on the argument that a player who
asked for less movement did not ask for less time to read.

**A cast is the one case where that split is not obvious**, because a cast is not carrying a number or a
sentence to read: it is carrying the fact that a card was played, and the last-card plate carries that
too, permanently, five plates along. Please name the new token or tokens, and say for each one whether it
goes inside the block or outside it, with the reason.

### D112 What survives under `prefers-reduced-motion`

D12 is "loops stop, feedback stays", and D39 keeps the handover curtain's opacity while dropping its
travel, because concealment is not a decoration. Applied to a two-stage cast: does the whole thing
collapse to a still frame of the card, does the board stage survive alone because it is the part that
says what happened, or does the cast disappear and leave only the message strip and the plate?

### D113 A cancelled card

`data-outcome` can be `nullified`, which is It's Not That Deep's aura cancelling a card, or `negated`,
which is a Nühü. D100 already ruled that the plate reads those two identically, because an aura cancelling
a card and a Nühü cancelling it are two rules and one fact.

Does the cast play at all for a cancelled card, and if it does, how does the cancellation read? The
awkward case is a Nühü: a card is played into the window the first card opened, so **two casts want the
screen inside one moment**, and the second one exists to say the first did nothing.

### D114 A Reaction's cast

Seven of the 29 are Reactions, played into someone else's turn, into a window that has a 30-second clock
and a prompt on screen. Does a Reaction's cast look like an Action's, and where does it happen given that
the prompt strip is up while the window is open?

### D115 The bot's cast

A bot plays cards. `timers.js` already treats a bot's card play as an **announcement** and holds the turn
for it, on the argument that a card played by nobody the player can see has to be announced or, as far as
the player is concerned, it did not happen.

`data-actor` is in the contract so the answer can be "different". Is it?

---

## 6 Deliverables

| File | What it is |
| --- | --- |
| `01-Design/Handoff/18-spec-skill-card-animations.md` | The spec. Five sections per the README, one answer per decision with its reason **and its rejected alternatives**, and D107's 29-row table |
| `src/ui/styles/cast.css` | The cast stage: its place, its layout, its four `data-cast` states |
| `src/ui/styles/cast-base.css` | D106's base movement per family |
| `src/ui/styles/cast-fx-*.css` | D107's 29 accents, split across as many files as it takes |
| `src/ui/styles/board-cast.css`, or diffs against the existing board sheets | D109's board stage |
| A diff against `src/ui/styles/tokens.css` | The new motion tokens, and their entries in the `prefers-reduced-motion` block |

Two constraints on the file list, both from `CLAUDE.md` and neither negotiable. **No CSS file over 300
lines**, which is why the accents are a `*` and not one file: 29 accents in one sheet is not a question of
taste. And when a file has to be split, it splits along a real seam and not by having its comments
removed.

If the spec needs an element, an attribute or a number that section 3 does not give it, **say so in the
spec rather than working around it.** Claude Code adds it. Working around a missing hook is what produces
CSS that depends on DOM order.

---

## 7 Out of scope

- **Sound.** Audio is deferred with issue #40 and screen S11 says so. A cast makes no noise.
- **The dice cards and the roll.** Handoff 11 owns the throw, the badge and the breakdown, and none of it
  is reopened here. The seven cards that change the roll ride on it.
- **The 36 drawings, and `scripts/extract-card-art.js`.** The Product Owner's answer was explicit: the
  card as an object plus a new effect layer, and the artwork untouched. Animating the inside of a drawing
  needs anchors in the generated SVGs, which means the extractor **and** the artboard, and that is a
  handoff of its own if it is ever wanted.
- **New card art**, and any change to a card's face, band, pill or tag row.
- **The hover reveal** (handoff 10) and **the last-card plate** (handoff 17). The cast has to coexist with
  both, which is D104's and D114's, but neither changes.
- **Pawn movement, capture and the trap marker.** D9, D31 and handoff 07 own those. A cast may hand a pawn
  over to them; it does not redraw them.
- **The message strip.** It already says what happened, in words, in both languages. A cast does not
  duplicate it and does not replace it.

---

## 8 What Claude Code builds regardless of the answers

So that the spec can assume it. None of it is a design question, all of it is missing today, and it is
laid out phase by phase in [Skill-Card-Animations-Plan.md](Skill-Card-Animations-Plan.md).

1. **The target in the state.** `lastCardPlayed` grows a `target` field, so the view can know which square
   a Banana Peel went on and which pawn a Yeet pushed. This is the one change outside `ui/` and it is why
   the plan starts there.
2. **The cast's moment.** A new wait, on `turn-waits.js`'s and `card-controls.js`'s pattern: the loop
   decides *that* it waits, `timers.js` decides *how long* from the token, and `?fast=1` sets it to zero
   without changing the order of anything.
3. **`src/ui/cast-view.js`.** The region, its lifecycle, and the four geometry properties of § 3.2. It
   holds no rule and reads the state, like every other view.
4. **A bot's cast.** `bot-driver.js` already routes a bot's card play through the same `carryOn` a person's
   goes through, so a bot animates for free.
5. **The tests.** A unit test per new pure function, and an end-to-end test that a cast starts, finishes
   and leaves the board with no `data-cast-hit` attributes behind.
