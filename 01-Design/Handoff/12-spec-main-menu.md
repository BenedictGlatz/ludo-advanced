# Handoff 12, spec: the main menu

**From:** Claude Design
**To:** Claude Code
**Date:** 2026-09-03
**Answers:** [12-brief-main-menu.md](../../uploads/12-brief-main-menu.md), D75 to D80.
**Read against:** `3a8c8bc`, on branch `fix/layout-stage-and-fan`, as constraint 9 asks. One
qualification on that, in § 1, and it is the reason this delivery touches neither `tokens.css` nor
`app.css`.

Three mockups were drawn, as § 7 of the brief asks. They are in `handoff-12/mockup/`, they are
**12a**, **12b** and **12c**, and **the Product Owner picked 12c**, the three doors in the game's own
card language. Every decision below is answered for 12c. 12a and 12b are the named rejected
alternatives, and because they are drawn rather than described they carry more of the argument than a
paragraph could.

---

## 1 Files delivered

| File | State | Lines |
| --- | --- | --- |
| `src/ui/styles/menu.css` | **New.** The whole of the menu's own layout | 271 |
| `src/ui/art/menu-hotseat.svg`, `menu-online.svg`, `menu-settings.svg` | **New.** The three door illustrations, in the hand of the 36 card drawings | 3 files |
| `01-Design/Handoff/12-spec-main-menu.md` | New, this file | n/a |

**Nothing else changes. `overlay.css` is not amended and `tokens.css` gains no token.** That is the
shape of the answer rather than an omission, and it is worth stating plainly because it is unusual:

- **`overlay.css` is untouched** because `menu.css` composes with it at higher specificity, exactly the
  way `handover.css` does. Every rule in `overlay.css` still applies to the other five screens, and § 4
  names the three that stop applying on this one. The picked direction is the one of the three that
  leaves the most of that file in force: `.overlay__actions` stays the centred wrapping row it already
  is, because three doors side by side is what that row was shaped like.
- **`tokens.css` gains nothing.** Constraint 6 measured 19 lines of headroom and handoff 11 spends 13 of
  them, which leaves 6. This spec asked itself twice whether the menu needs a number of its own and the
  answer was no both times: the panel width and the door size are values on one screen, so they belong
  in that screen's stylesheet, and there is no new duration, no new colour and no new size.

**Load order: `menu.css` after `overlay.css`.** It overrides `overlay.css` and composes with it, so it
goes later, and it is independent of `handover.css`: the two never match the same element.

**The three illustrations this direction asks for are in the delivery.** They were drawn after the pick
and are the reason the file count is five rather than two. § D76.1 says what they are and § 6 says how
they reach the door.

**On the commit, and this is a finding rather than a formality.** The copies of the eighteen stylesheets
available to this side **predate `3a8c8bc`**: `tokens.css` has no `--stage-w` and no `--stage-h`, and
`card.css` has no `--shadow-dir`, so what is here is a tree from before D62 and D64 landed. Two
consequences, and both are already handled:

1. **Nothing is delivered that would revert them.** The only new file is `menu.css`, and the two files
   handoff 10 nearly reverted are the two this delivery does not open. There is nothing to merge by hand
   this time.
2. **`menu.css` was written against `overlay.css` as it stands here**, 229 lines unformatted against the
   234 the brief measured, and every line number quoted below is from that copy with the selector named
   alongside it. If a rule moved between the two trees the selector is what to trust.

The mockup pins the fitted stage itself rather than reading it from `app.css`, for the same reason. § 3
of the package README says how.

---

## 2 The shape of the answer, in five sentences

The menu keeps every element `overlay-view.js` already builds and stops being a card in the middle of
the stage: the panel gives up its background, its border and its shadow and becomes the ground three
doors are dealt on, 84 per cent of the stage wide, which is a stylesheet of its own and not a second
component (D75). The three items are doors in the game's own card chrome, the same face, ink edge, hard
shadow and radius at a size no hand uses, dealt across the middle in the wrapping row `overlay.css`
already has, with Hotseat wider and taller than the two that do not work, because § 4 of the brief says
Hotseat is the game and the other two are not (D76). A door you cannot open is drawn the way this
project already draws a thing that is not there, as an outline with no face and no shadow in dashed ink
at low weight, and it is `disabled`, so it takes no tab stop where `Enter` would do nothing (D77). Every
door carries a second line, which on Hotseat says what the mode is and on the other two says why it
cannot be used, in two different sentences because there are two different reasons (D78). The game's
name stays at `--text-xl` and D40 keeps its exclusive on `--text-2xl`, nothing else joins it, and
Hotseat still opens S2 (D79, D80).

---

## 3 The three mockups, and what picking 12c settles

All three are at 1440 by 900, so the stage is 1440 by 810 and every measurement in § 3 of the brief
applies as written. **The markup of all three is identical, character for character**, apart from one
attribute value that lets them sit on one canvas. That is the first thing to read off the package: each
of the three directions is a stylesheet, and none of them asks for a different DOM.

| | What it is | What it costs | What it gives up |
| --- | --- | --- | --- |
| 12a | The panel keeps its place. Widened to the 34rem setup already uses, the centred wrapping row turned into a column of three rows, the pill kept | **Nothing new.** One block in `overlay.css`, about 25 lines | The report. A 490 px card on a 1440 by 810 px stage is still the emptiest screen in the game, and the front door still looks like the screen that asks whether you want to abandon a match |
| 12b | The front door. The panel becomes a two column layout: the name on the left at `--text-2xl`, the three items as a column of wide rows on the right | One new stylesheet and no token, and it spends the size D40 reserved for the winner | The family resemblance. It would have been the one screen in the game with no card under its content |
| **12c** | **Picked.** Three doors in the game's own card language, dealt across the stage, Hotseat the tall one | One new stylesheet, no token, and three illustrations, which are drawn and delivered | One thing, in § D76.1: the order a player meets the game in |

**What the pick settles, and it is more than a look.** 12c is the only one of the three that answers the
emptiness with the game's own material rather than with layout. § 3 of the brief measured the problem as
three elements in a 432 px card using under a third of the stage in both directions; 12c fills the
middle of the stage with the object the whole game is built out of, at a scale a player reads from
across a table, and it does it inside the row `overlay.css` already declares. It is also the direction
where D77 costs the least: the unavailable treatment is "take the face and the shadow away from a
card", and here the thing it takes them away from is already a card.

**What it buys, stated as plainly as the cost.** Three drawings, and they are drawn: § D76.1 says what
each one is and why.

---

## 4 The decisions

### D75. The menu keeps the element and stops being a panel. It gets its own stylesheet

**`menu.css`, new, on the `handover.css` precedent: one screen's own stylesheet, not a second
component. `.overlay__panel` stays in the DOM and gives up its background, its border, its shadow and
its padding on this screen. `--overlay-panel-w` becomes 84rem. The curtain stays opaque and stays
`--color-app-bg`.**

**1. Does it keep `.overlay__panel`?** It keeps the element and loses the card. The element is worth
keeping because `overlay-view.js` lines 128 to 160 build it for all six contents and nothing about the
menu is a reason to fork that function. The card is worth losing twice over here. Once for the reason
that applies to any of the three directions: a 432 px card centred on a 1440 by 810 px stage is the
shape of an interruption, which is right for "are you sure you want to abandon this match" and wrong for
the first thing in the game a player looks at. And once for a reason specific to 12c: the content of
this screen is three cards, and a card inside a card is two edges saying the same thing.

**2. Does it get its own stylesheet? Yes, and it is the cheaper of the two shapes by a wide margin**, as
D75.2 already says. `handover.css` is the precedent and the resemblance is close: one screen, one job
the other five do not have, one file, and `data-screen` on the element is what makes it possible without
touching the component. This is the second time D38's seam has held under a screen that needed its own
layout, which is the answer to the question the brief actually asked. The seam is right. What was
missing is that a screen may own its arrangement without owning its markup.

**3. `--overlay-panel-w` becomes 84rem**, 1210 px at the design resolution, set on
`.overlay[data-screen="menu"]` and not on the panel, the way `handover.css` sets it. Setup's 34rem is
the precedent that the mechanism exists and costs three lines. It is the width three doors and their two
gaps need, plus the room the row would use if a fourth ever joined them, and the remaining 16 per cent
of the stage is the margin the layout needs to not touch the edges.

One mechanical note, because it cost an hour to find and will cost the next person the same. The panel's
width is `min(var(--overlay-panel-w), 100%)`, and in `.overlay`'s grid that percentage resolves against
a single auto sized column track that the panel's own content sized, so 84rem silently did not mean
84rem. The menu's sheet is therefore a flex line rather than a grid: a flex container has a definite
content box and the number lands. It is one extra declaration and it is commented in the file.

**4. The curtain stays opaque, and it stays plain `--color-app-bg`.** Behind the menu there is no match
to see through to, so the veil of `overlay.css` lines 51 to 54 would be a window onto the page's own
background colour, which is a more expensive way to draw the same flat field. And with three cards on
it, the sheet is the table: a flat, plain ground is what a card needs behind it, which is the same
reason `--card-art-ground` is fixed in both skins (D41).

*Rejected: keep the panel as a card and widen it, which is artboard 12a.* It is genuinely cheaper: one
block in `overlay.css`, no new file, D38 untouched in appearance as well as in structure. It loses
because it answers a smaller question than the one that was asked. § 3 of the brief measured the
emptiness and 12a improves the measurement by four percentage points.

*Rejected: a second component, `menu-view.js` and `menu.css`, with its own render function.* This is
what "its own thing" would mean if taken literally, and it is what D75 is really testing. It loses on
three counts: the six contents share `data-open`, the `@starting-style` arrival, the focus call and the
`Escape` handling, so a second component either duplicates four behaviours or grows a shared base; the
menu would be the only screen whose title and text are not built by the function that builds every other
title and text, which is where the language switch of FR-34 is wired; and nothing in the drawing needs
it. A stylesheet was enough.

*Rejected: a seat coloured wash on the curtain, as `handover.css` does.* There is no seat on the menu.
Nobody has chosen a colour yet, and picking one would be the game telling a player which player they
are before they have said how many are playing.

### D76. Three doors in the game's card chrome. The row stays a row. Hotseat is the tall one

**Doors, not rows and not tiles: the card's face, its 3 px ink edge, its hard offset shadow and its
radius, at 15 by 19rem and 17 by 22rem, which is a size no hand uses. `.overlay__actions` is unchanged
apart from its gap. Tab order is Hotseat and then nothing, and the first item still takes the keyboard
when the screen opens.**

**1. What are they?** The game's card chrome, and not `.card`. D76.1 asks for a reason rather than a
reach on exactly this, so here is both halves of it.

The case for it: the card is the object this game is built out of, it is already drawn and already
decided (D25 to D28), and a player who has met a card on the menu has met the game's whole visual
argument before the board arrives. Three doors also read from further away than three rows, which
matters on the one screen four people look at over each other's shoulders.

The case against it, which the pick accepts rather than dismisses. A card in this game is a thing you
hold, read and play, and none of the three items is one: you cannot hold Settings. So the door borrows
the chrome and stops there, and the spec is explicit about the boundary. **It is not `.card`, it takes
no `--card-u`, it has no banner, no kind pill, no tag list and no `data-card-family`**, and it is
therefore not touched by `card.css`, `card-state.css`, `card-reveal.css` or the reveal of D66. It is a
door in the game's hand, drawn in the game's ink.

And the mechanical half: a card face with nothing on it is a blank, so the direction needs three
drawings, and they are delivered. Each is 232 by 128 like the 36 card illustrations, in the same ink
(`#2B1A3D`, 4 px, round joins), with the same flat fills and the same pawn creature of D14, so a
player who has met a door has met the hand every card is drawn in:

- **Hotseat.** Four pawns in the four seat colours behind one table, and the board between them. It is
  the sentence on the door drawn: one screen, passed around.
- **Online Multiplayer.** One blue pawn here, one pawn at half opacity across from it, and a dashed line
  between them that does not close. The ghost is Double Dip's own device, and the dashed line is the
  door's dashed edge carried into the picture.
- **Settings.** A gear in the dice cards' cream and a small pawn behind it in the signal violet, which
  is not a seat colour on purpose: settings belong to nobody at the table.

They go into `.overlay__art`, the door's first grid row, and on a door you cannot open they fade to
50 per cent with the label. The drawing is decoration, so it is `aria-hidden` and the door's name is
carried by `.overlay__label` (NFR-08), the same split `card.css` makes for `.card__art`.

**2. They are not equals, and Hotseat is the larger.** 2rem wider and 3rem taller, its label at
`--text-xl` against `--text-lg`, and it is the one door on the screen with a face. § 4 of the brief is
the whole argument: Hotseat is FR-01 and built, Online Multiplayer is FR-42 with no chosen technology,
Settings is S11 and was deliberately deleted. Three doors dealt as equals would say the game has three
modes, which is false, and it would say it on the screen where the player has the least ability to tell.

How unequal: enough that the difference is not a mistake, not enough to make the other two look like
footnotes. The three sit on one bottom line, `align-items: end`, so the difference reads as one card
being nearer rather than as two cards being shrunk.

**3. The row stays the row, and this is the cheapest thing about the pick.** `.overlay__actions` needs
`gap` and `align-items` and nothing else: `overlay.css` lines 158 to 163 already declare a centred
wrapping row, which is what three doors side by side are. The wrap is not decoration either, it is what
lets a fourth door join them one day without a new rule, and it is what the breakpoint uses.

**4. Tab order and focus.** DOM order is unchanged: Hotseat, Online Multiplayer, Settings, and the two
unavailable doors are `disabled`, so the sheet has exactly one tab stop. `overlay-view.js` lines 169 to
171 focus the first `.overlay__button` when a screen opens and that is Hotseat, so **that function does
not change.** The language button in the chrome is reached after it, because the chrome is earlier in
the DOM but outside the overlay: the one thing to check on landing is which of the two a first `Tab`
lands on, and either answer is acceptable as long as `Enter` on it does what it says.

*Rejected: three full width rows in a column, which is artboard 12b.* It holds a sentence more
comfortably than a door does, it needs no artwork at all, and it was the recommendation before the pick.
It loses to the direction that was chosen and it loses nothing else: if the illustrations never arrive,
it is the fallback that costs one stylesheet.

*Rejected: three equal doors.* Cheaper by three declarations. It loses because it is not true, and § 4
of the brief is the evidence.

*Rejected: making the doors real `.card` elements with `--card-u`.* This is the version of 12c that
looks free and is not. It would put the menu inside `card.css`, `card-state.css` and `card-reveal.css`,
so a menu item would inherit the hover reveal of D66, the desaturation of a card that cannot be played
and the back of `.card--back`, and each of those would then need a menu exception. Borrowing four
declarations is cheaper than inheriting a component and subtracting from it.

*Rejected: taking the items off `.overlay__button`.* The brief offers this and it is the wrong side of a
real line. They are controls that start something, the click routing and the focus call already reach
them by that class, and a screen owning its layout is not a reason for it to own a second kind of
control. What they give up on this screen is named: the pill radius, the word shaped centred padding,
and the `min-height` of 2.75rem, which the door's own height exceeds. The hover lift, the active press
and the focus ring of `overlay.css` lines 205 to 217 are inherited unchanged, on purpose.

### D77. An outline with no face and no shadow, in dashed ink at low weight. `disabled`

**Three cues, and two of them survive greyscale: no face and no shadow, a dashed ink edge at low
weight, and the muted label. The attribute is `disabled`, so the item takes no tab stop and the click
stops without a filter in `session-actions.js`.**

**1. The treatment, and it is a reuse rather than an invention.** § 2 of the brief is right that nothing
in this project styles a control you cannot use. It has a precedent for something else that turns out to
be the same idea: **`hand.css` lines 137 to 141, the empty skill hand slot**, which is drawn as the
card's silhouette in dashed ink at low weight with no face, no shadow, no lift and no tab stop. That is
the vocabulary for "there is nothing here yet", it is already in the game, and Online Multiplayer is
precisely a place where something would go. In the picked direction the resemblance is exact rather than
analogous: the object losing its face is a card, and the empty slot is a card that has lost its face.

Why it works with the colour taken away, which is what NFR-12 measures. Every card, pill, pawn and panel
in this game is a raised object with a hard offset shadow under it (D14). A door with no face and no
shadow is the only unraised control in the project, and beside Hotseat it says "a door with nothing
behind it" before a word of it is read, in colour, in greyscale, and at a glance from across a table.
The dashed edge is the second cue and it is also not a colour. The muted label is the third and it is
the only one that is.

**2. `disabled`, not `aria-disabled`.** The two produce different screens and the brief is right that
this is the technical half of the question, so here is the reason rather than a preference.
`aria-disabled` buys one thing: the item stays reachable by keyboard and announces itself as
unavailable. It costs the click filter at `session-actions.js` lines 44 to 71, and it buys that one
thing only if focusing the item tells the keyboard user something they could not otherwise get. **It does
not, because of D78.** The reason each door cannot be opened is permanent text inside it, in the DOM, on
screen at all times and read in document order by any screen reader traversing the group. There is
nothing behind the focus to find.

**3. So the two decisions agree, and the argument is spec 05's.** § 5 of spec 05 took seven tab stops
out of the pool overview because a stop where `Enter` does nothing tells a keyboard user nothing, and
D67 gave every card in the hand a stop *because* focusing one now does something. The menu's unavailable
doors are the first case, not the second. The cost, stated plainly: a keyboard only user tabbing through
the sheet reaches Hotseat and nothing else, so they learn the other two doors exist by reading the
screen rather than by tabbing to them. That is the same deal the pool overview already makes.

**4. The door does not respond to a pointer at all.** No lift, no shadow change, `cursor: default`. A
hover that lifts and then refuses is worse than no hover, and `overlay.css` lines 205 to 217 lift every
button today, so the lift has to be turned off by name.

*Rejected: `aria-disabled="true"` with the click filtered.* Named above. It is the better answer the
moment an unavailable item gains something worth focusing, and if D78 is ever narrowed so that the
reason is not permanently on screen, this is the decision that has to flip with it.

*Rejected: the `--color-dormant` fill.* It is what a dormant thing is drawn in elsewhere and it was the
obvious candidate. It loses because a filled dormant object is still an object: it keeps the shadow and
the presence and only changes hue, which is the one cue NFR-12 does not count. The empty slot precedent
takes the fill away instead, and that is the stronger half of it.

*Rejected: drawing the two as card backs, `.card--back`.* This is the idea 12c invites and it is worth
saying why it is not taken. D65 made `.card--back` the one definition of the back and kept it for the
pool and the discard pile, where a back means "a card you may not see". An unavailable menu item is not
a card being withheld, it is a card that does not exist, and those are opposite facts drawn in the same
ink. It would also give the two doors a saturated purple face, which is the most present thing on the
screen after Hotseat.

*Rejected: a word on the door, a tag reading "soon" or a lock mark.* It is a fourth cue on top of three
that already work, it is another string in two languages, and a lock is a picture of a rule rather than
the rule.

### D78. A second line on every door. One sentence each. Settings stays

**`.overlay__hint`, a `<span>` inside the item, on all three doors and not only on the two that do not
work. Two different sentences for the two unavailable items, because there are two different reasons.
Settings appears.**

**1. On the item, not under the group.** The reason belongs to the door: a hint under the group would
have to say which door it is about in words, and it would have to say it twice, which is a paragraph
where the design has a line. Putting it on the door also means the second line is not a badge that
appears only when something is broken, which is why it is on all three: on Hotseat it says what the mode
is, and a door does not change size between an available state and an unavailable one.

**2. One sentence each.** "Not built yet" and "the language switch is in the bar at the top" are
different facts, and the second one is the more useful sentence on the whole screen: it is the answer to
the question a player opening Settings is actually asking. One sentence for both would be cheaper and
would say less, which is the brief's own formulation and it is correct.

**3. What it is made of.** Two elements, both `<span>`, both plain text in the DOM and neither one a
`content:` property (NFR-03):

```html
<button type="button" class="overlay__button" data-action="hotseat" data-variant="primary">
  <span class="overlay__art" aria-hidden="true"><svg viewBox="0 0 232 128" …></svg></span>
  <span class="overlay__label">Hotseat</span>
  <span class="overlay__hint">Two to four players, one screen, passed around the table.</span>
</button>
<button type="button" class="overlay__button" data-action="online" disabled>
  <span class="overlay__label">Online Multiplayer</span>
  <span class="overlay__hint">Not built yet.</span>
</button>
<button type="button" class="overlay__button" data-action="settings" disabled>
  <span class="overlay__label">Settings</span>
  <span class="overlay__hint">The language switch is in the bar above. Sound is not built yet.</span>
</button>
```

The two spans are the door's second and third grid rows; the first is `.overlay__art`, a `<span>`
holding the inline drawing, `aria-hidden="true"`. `.overlay__label` exists because a button with two text children needs both of them to be
elements. Only the three menu items carry the pair; every other screen's buttons keep their plain text
and are unaffected. The six strings are `menu.hotseat`, `menu.hotseat.hint`, `menu.online`,
`menu.online.hint`, `menu.settings` and `menu.settings.hint`, and the sentences above are English
placeholders: German is the default and the longer of the two, and the layout was checked with the doors
at 216 px, which holds the German of all three hints in four lines or fewer.

**4. Settings appears.** The brief offers "no" as an answer here and it is the one place this spec
declines the offer. A menu item that opens a screen holding one button that is also four inches above it
is indeed hard to defend, but the item is not that: **the item is where the sentence gets said.** Take it
out and a player looking for settings finds no settings, and the reasonable conclusion is that the game
has none, which is false in the one respect FR-34 makes a `must have`. Two doors would also make the
menu emptier than the report that asked for it to be fuller, and the row is drawn for three.

*Rejected: a hint under the group, one paragraph for both items.* Named above. Cheaper, one element,
one string, and it says less while taking more room.

*Rejected: the hint only on the two unavailable doors.* This was the shape the brief describes and it
was drawn first. It loses on a small thing that matters: the second line then means "something is
wrong", so Hotseat is the door with nothing to say about itself, which is the opposite of true.

*Rejected: two doors, dropping Settings.* Named above.

### D79. The name stays at `--text-xl`, above the doors, and nothing else joins it

**The title keeps `--text-xl` and D40 keeps its exclusive on `--text-2xl`. `menu.text` stays exactly as
it is. The language button is accounted for in the sheet's padding and in the row's own width. Nothing
else is on the menu, and the place for S10 is a fourth door the wrapping row can already hold.**

**1. The name.** Unchanged: `--text-xl`, 25.2 px, display face, centred above the three doors. This is
the one answer that the pick changed, and it changed for a good reason rather than a cautious one. On
this screen the doors are the loud thing, and they are loud by being large, ink edged and one of them
violet. A 36 px name over them would be a second loud thing on a page with room for one, and the two
would compete for the same glance. So D40's `--text-2xl` stays spent on exactly one thing in the game,
the winner's name, and this screen needs no exception to it.

Worth recording, because it was nearly the other way: in 12b the name was the only large thing on the
screen and it took `--text-2xl` for exactly that reason. The size of a title is a fact about what else
is on the page, not about the title.

**2. The sentence stays as it is**, `--text-md`, muted, capped at 34ch, with one change that is spacing
and not type: `--space-4` under it, so the sentence belongs to the name above rather than to the doors
below. It is the only line on the screen that says what the game is, and on the front door that is worth
keeping. It does not grow, for the same reason the name does not.

**3. The language button.** The chrome row sits above the overlay at `--layer-chrome` on purpose, so the
menu is drawn around it rather than under it, in two places. The sheet's top padding is
`calc(2.25rem + var(--space-5) * 2)`, which is the chrome's own `min-height` plus the page's padding
twice, so no menu content can reach the row. And the three doors end 261 px short of the button's left
edge at the design resolution, because the row is centred and 84rem wide while the doors need 49 of it.
Below the 84rem breakpoint the padding follows `chrome.css`, where the controls grow to 44 px.

**4. Nothing else.** No version line, no credit, no fourth object. Everything on the front door should
be something a player can act on or a sentence that tells them what they are looking at, and a version
number is neither. The place for the rules screen is a **fourth door**: the row wraps and is centred, so
one more `.overlay__button` needs no new rule at all, at the smaller of the two sizes. That reserves the
place without designing it, which is what D79.4 permits, and it is a cheaper reserve than 12b's would
have been.

*Rejected: `--text-2xl` for the name, which is what 12b does.* Named above. Its own argument is that 25
px of display face across 1440 px reads as a caption, and that is true of a screen with nothing else on
it. This screen has three doors on it.

*Rejected: a wordmark instead of a line of text.* D79.1 offers it. There is no logo file in the
project, drawing one is not what this brief asked for, and a wordmark would put the game's name in an
image, where FR-34's language switch cannot reach it. It stays a translatable `<h2>`.

*Rejected: a version line in the corner.* Named above. It is also the kind of thing that is added
because a corner is empty, and the emptiness on this screen is doing work.

### D80. Confirmed. Hotseat still opens S2

**No change. The Hotseat door opens the separate player count screen, and `OVERLAY_ACTION.START` is what
it renames.**

The three reasons in the brief hold and this spec adds nothing to them: S2 has its own requirement and
its own acceptance criterion, its three count buttons are already designed as a choice between equals
(`overlay.css` lines 196 to 203), and `.overlay__button[data-count]` is clicked by three end to end
specs. The menu gains one thing that makes the two screens read better together rather than worse: the
Hotseat door's second line says "two to four players", so the count screen arrives as the question that
sentence set up.

*Rejected: folding the three counts into the menu.* The brief prices it and the price is right: FR-01's
acceptance criterion would read against a screen that no longer exists, and three end to end specs
would need rewriting. There is also a design reason to leave it alone, and the pick sharpens it. The
menu's three doors are deliberately unequal and S2's three counts are deliberately equal, so they want
opposite treatments, and on one screen one of the two treatments would be wrong.

---

## 5 Token reference

**No token is added, removed or renamed.** What `menu.css` reads:

| Token | Where |
| --- | --- |
| `--space-2`, `--space-3`, `--space-4`, `--space-5`, `--space-6` | The door's rows and padding, the row's gap, the sheet's padding |
| `--text-sm`, `--text-lg`, `--text-xl` | The hint, the two label sizes |
| `--font-display`, `--weight-strong`, `--weight-regular`, `--leading-tight`, `--leading-body` | The label and the hint |
| `--card-face` | The door's face |
| `--color-hint` | Hotseat's face, restated from `overlay.css` line 183 |
| `--card-band-text` | Hotseat's hint, which is cream on violet |
| `--color-text-muted` | The hint, and the label of a door you cannot open |
| `--color-ink` | The dashed edge, at 32 per cent through `color-mix` |
| `--radius-card` | The door's corner, in place of `--radius-pill` |
| `--overlay-panel-w` | Set to 84rem on this screen, 34rem below the breakpoint |

Three of those are worth a note. **`--card-face` is the whole of what makes a door a door** and it is
the one card token used off a card in the project; it is deliberate and it is the point of the
direction. `--card-band-text` is the project's single answer to "what is text on a saturated fill", and
`overlay.css` line 184 already uses it on a primary button. The `color-mix` on `--color-ink` is copied
from `hand.css` line 139 rather than derived, so the two dashed edges in the game are the same weight.

**The door does not read `--card-u`, `--card-text`, `--card-action`, `--card-dice` or any other card
token**, and that is the boundary § D76.1 draws: it borrows the chrome, not the object.

---

## 6 The DOM contract, state by state

Against § 5 of the brief. Every state it promises is styled, and the two elements it offers to add are
named in § D78.3.

| Selector or state | Styled | Where |
| --- | --- | --- |
| `.overlay[data-screen="menu"]` | Yes. The sheet, the flex line, the padding that clears the chrome | `menu.css`, first block |
| `.overlay__panel` on this screen | Yes. No background, no border, no shadow, no padding | second block |
| `.overlay__title` on this screen | Not touched. `--text-xl` is inherited from `overlay.css` lines 116 to 124, which is D79.1's answer | n/a |
| `.overlay__text` on this screen | One declaration, the space under it | third block |
| `.overlay__actions` on this screen | Two declarations, the gap and the bottom line. The centred wrapping row of `overlay.css` lines 158 to 163 is what it stays | fourth block |
| `.overlay__button[data-action="hotseat"]` | Yes. The larger door, `data-variant="primary"`, face restated | door blocks |
| `.overlay__button[data-action="online"]`, `[data-action="settings"]` | Yes, in both states, though neither is ever enabled | the `:disabled` block |
| An unavailable item | Yes. `:disabled`, and `:disabled:hover` separately | the `:disabled` block |
| A second line inside an item | Yes. `.overlay__hint`, and `.overlay__label` with it | the two element blocks |
| Hover, active, focus on the one usable door | Inherited from `overlay.css` lines 205 to 217, deliberately unchanged | n/a |
| `.overlay__art` | Yes. Fills the door's width, centred in its row, fades to 50 per cent on a door you cannot open, and turns into a 6.5rem picture beside the name below the breakpoint | the art blocks |
| Below 84rem, and portrait | Yes. The doors go full width and give up their height, so the row becomes a column of three, each with its drawing beside its name | the media block |
| `prefers-reduced-motion` | Nothing to declare. This file has no transition and no animation, and the hover lift and the ring are already answered in `overlay.css` lines 220 to 228 | n/a |
| Both skins | Every value is a token or a `color-mix` of one, so the dark skin needs no rule of its own. `--card-face` is one of the paired card tokens, so a door follows the lights the way a card does | n/a |
| Greyscale | Two of the three unavailable cues are not colour. § D77.1 | n/a |

**What Claude Code has to do**, and it is one attribute, three elements, three renames and three files:

1. **Three actions in `OVERLAY_ACTION`**, `overlay-vocabulary.js` lines 41 to 60: `hotseat`, `online`,
   `settings`. `hotseat` is what `start` becomes, and D80 confirms it opens S2 unchanged.
2. **`.overlay__art`, `.overlay__label` and `.overlay__hint`** inside the three menu items, in that
   order, per § D78.3. Menu items only.
6. **The three drawings into `src/ui/art/`** and one export beside `skillArt` and `diceArt` in
   `art/index.js`, `menuArt(action)`, reading `menu-<action>.svg` through the same glob. They are
   hand delivered files and not extracted from an artboard: `scripts/extract-card-art.js` matches a
   drawing to a card by its title, and these are not cards. `card-art.test.js` walks the catalogue and
   the pool, so its count of 36 is unaffected; the two contracts it checks, `aria-hidden` and no inline
   style on the root, hold for all three.
3. **`disabled` on the online and settings items.** No click filter is needed, which is the whole point
   of D77.2.
4. **Six locale keys in both `de/ui.json` and `en/ui.json`** in the same commit, per
   `tests/unit/i18n/locales.test.js`. `menu.title` and `menu.text` keep their current values and their
   current keys.
5. **`menu.css` added to the load order** in `main.js`, after `overlay.css`.

---

## 7 What is still open

**Nothing from this brief.** The three illustrations were the one item this direction opened and they
closed inside the same delivery. One note on them for later: they live in `src/ui/art/` as files and
not on the card artboard, so a redraw is a file edit and `npm run assets:card-art` neither touches nor
removes them. If they are ever moved onto an artboard, `extract-card-art.js` will need a second match
rule, because it keys on card titles.

**One finding, and it is small enough that it may be nothing.** `chrome.css` takes the turn sentence out
of flow on the menu with `.chrome__turn:empty { display: none }`, and the sentence is empty on the menu
and on setup. `.app__chrome` is a flex row with a `gap` and no spacer, so with the sentence gone the
language button should sit at the **left** end of the row, not the right as § 1 of the brief describes.
Either `chrome-view.js` writes something into the sentence on the menu, in which case this is nothing,
or the button is on the wrong side today and nobody has looked at the menu closely enough to see it. The
mockup pushes the button right with a one declaration mockup override and does not guess which.

**Still open and not touched here:** D61 from brief 08, D62 to D64 from brief 09, D70 to D74 from brief
11, and the eight leftovers of handoff 02. Nothing in this spec depends on any of them: the menu draws
no board, no pawn and no real card, and it is the one screen in the game where `--cell` is not read.

**One thing this spec deliberately did not do.** The brief's § 5 says a mockup that implies navigation
between several new screens is asking for more than a stylesheet. None of the three does. All three are
one screen with three items on it, and 12c's answer needs no `state.screen` and no router.

---

## 8 The landing checks

The five standing ones, plus the four from § 10 of the brief:

1. **D75 to D80 answered**, none skipped, and each of the six carries at least one named rejected
   alternative. Eighteen across the six.
2. **No CSS file over 300 lines after `npm run format`.** `menu.css` is 271 unformatted. Prettier
   expands one declaration per line and every declaration in it is already on its own line, so the
   growth is in the selectors that are already wrapped. It lands near 280, which is inside the limit
   and close to it: the next thing this file gains should be weighed against a split at the media
   block.
3. **No user-facing string in a `content:` property.** `menu.css` declares no `content:` at all. The
   word appears in it once, in a comment, naming the rule.
4. **Built once, then only attributes rewritten.** The menu's buttons are rebuilt on every screen
   change, which `overlay-view.js` lines 24 to 26 explain, and nothing in this file animates a button's
   arrival. A language switch on the menu therefore restarts nothing.
5. **Two skins and `prefers-reduced-motion`.** § 6.
6. **`npx playwright test tests/e2e/match-flow.spec.js`.** The one case to watch is the language switch
   on the menu: it asserts the title and the button label are rewritten, and the button label is now
   inside `.overlay__label` rather than being the button's own text. If it reads `textContent` it stays
   green; if it reads the first child node it does not.
7. **`npx playwright test tests/e2e/dice-pool.spec.js`.** One case starts from the menu. It clicks
   through by action, so `start` becoming `hotseat` is the only thing it can trip on.
8. **A new case for the unavailable item**, which the brief offers to write: that both items are
   visible, that clicking one starts nothing, and that `disabled` is on the element. Three additions
   worth making while it is being written: that the sheet has exactly one tab stop, that
   `.overlay__hint` is non empty on all three items, since it is the reason D77 does not need
   `aria-disabled`, and that no menu item carries `data-card-family`, which is the boundary § D76.1
   draws and the one a later change is most likely to cross.
9. **1440 by 900, and one check below the 84rem breakpoint.** Both are in the mockup, the second at 430
   by 820, where the three doors become three full width rows with the drawing beside the name, and the
   page does not scroll.
10. **`card-art.test.js` stays green** with three more files in the glob, because its count walks the
    catalogue and not the directory. Worth a case of its own: `menuArt("hotseat")` resolves and
    `menuArt("nope")` is null.

**No em dash, in this file or in `menu.css`.** Rule 5 of the work order, checked.
