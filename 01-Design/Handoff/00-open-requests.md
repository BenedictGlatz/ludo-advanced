# Open requests: everything Claude Design is currently owed

**From:** Claude Code
**To:** Claude Design
**Date:** 2026-09-01, **updated the same evening, twice on 2026-09-02, and three times on 2026-09-03**

---

## Status on 2026-09-03, evening: a feature request turned into a defect one status block old

**[10-brief-card-reveal-on-hover.md](10-brief-card-reveal-on-hover.md) is out, D65 to D69.** The request
was that hovering an Action or Reaction card should turn it over so its text can be read. Looking for the
place to put that found two reasons a player cannot read a card in their own hand, and neither is the one
the request described.

| Brief | Owes | State |
| --- | --- | --- |
| [08-brief-pickable-field.md](08-brief-pickable-field.md) | `08-spec-pickable-field.md`, plus whichever of `prompt.css` and `board.css` the answer touches | **Open.** Sent 2026-09-03 |
| [09-brief-layout-and-fan.md](09-brief-layout-and-fan.md) | `09-spec-layout-and-fan.md`, confirming or replacing D62 to D64, plus whichever of `app.css`, `tokens.css`, `hud.css`, `hand.css` and `card.css` the answer changes | **Open.** Sent 2026-09-03 |
| [10-brief-card-reveal-on-hover.md](10-brief-card-reveal-on-hover.md) | `10-spec-card-reveal-on-hover.md`, plus whichever of `card.css`, `card-state.css` and `hand.css` the answer changes, and a new file if D66 needs more than about thirty lines | **Open.** Sent 2026-09-03 |

**The first reason is a finding this file already carried, one block down, filed too low.** The block above
lists it among the two findings that need no decision: `data-active` on the skill hand means "some card is
playable" rather than "this seat is on turn". That was right about the cause. What it missed is the
consequence. `card-state.css` draws every card in a hand with `data-active="false"` as a back, and
`intents-cards.js` refuses every card outside the action phase, so **the player's own hand is a row of
backs through the dice card choice and the move, and again once the card budget is spent.** It is D65 now,
and the note in the block below is superseded by it.

**And the back is not what enforces D33.** The handover curtain is, together with one ordering rule in
`session-actions.js` that passes the turn before the curtain comes down. A hand belonging to somebody else
is never on screen with the board visible, so every case this back fires on is the player's own hand. The
plate is already dimmed by `app.css` in the same state, so the region says "I am not asking you anything"
twice, once in a way that also hides what the player owns.

**The second reason is that turning a hand card over would not have helped.** `card.css` shows the rules
paragraph at the reference size only, and at the hand's factor it computes to 8.57 px at the design
resolution. So the request needs a size decision, not only a motion, and D66 puts three mechanisms with
their real costs in front of the answer rather than picking one.

**Nothing was implemented this time**, unlike handoff 09. D66 option 2, a genuine two sided turn, would
rebuild the card's DOM and break three end-to-end checks, and building that twice costs more than waiting.
That was the Product Owner's choice.

**Three briefs are open at once now, and the order that gets the most out of the least work is 09, 08,
10.** Handoff 09 is confirmation of three things already on screen, so it is the cheapest and it unblocks
nothing else. Handoff 08 is next because D61 is still the only open decision that blocks a requirement,
NFR-08's second half. Handoff 10 is the largest, and **within it D65 can be answered on its own**: it is
one question about an attribute, it needs no drawing, and the other four cannot be usefully answered
before it. If only one thing can be delivered out of this brief, deliver D65.

---

## Status on 2026-09-03, afternoon: a test round found four layout defects, and three of them are yours

**[09-brief-layout-and-fan.md](09-brief-layout-and-fan.md) is out, and it is the first brief in this loop
that reports work already done.** The Product Owner played a round at 1438 by 770 CSS px, which is a 2876
by 1750 panel at 200 % Windows scaling, and reported four things in one message. The game was unplayable
without scrolling on that machine, so all four were fixed the same day and the three that change a
numbered decision are sent back for confirmation rather than asked first. That route was the Product
Owner's choice and the brief says so in its own § 0.

| Brief | Owes | State |
| --- | --- | --- |
| [08-brief-pickable-field.md](08-brief-pickable-field.md) | `08-spec-pickable-field.md`, plus whichever of `prompt.css` and `board.css` the answer touches | **Open.** Sent 2026-09-03 |
| [09-brief-layout-and-fan.md](09-brief-layout-and-fan.md) | `09-spec-layout-and-fan.md`, confirming or replacing D62 to D64, plus whichever of `app.css`, `tokens.css`, `hud.css`, `hand.css` and `card.css` the answer changes | **Open.** Sent 2026-09-03 |

**What the four were.** One is a `must have` requirement that was only ever true at one window size, and it
is the interesting one: **D6's "there is no target resolution" is an answer about the board, and every
other region on the page is `rem`.** The rail costs a fixed 705 px and the page 820, up to D35's 882 with
the prompt strip up, whatever the window does, so FR-31 held at 1440 by 900 and nowhere else. The other
three: the seat plate is narrower than its own four numbers and the neighbouring plate painted over the
overflow (D63), an empty skill-hand slot was wearing a card back's `::before` and `::after` and painting
its outline over the last real card, and the fan's hard shadow is cast to the right so every shadow but the
last is hidden under the next card (D64).

**Two of the four were not design questions at all** and were fixed without asking: the empty slot's
pseudo-elements and its z-index. Both were selector accidents between two files that each answered half of
"what does an empty slot look like".

**One report was diagnosed differently from how it was made, and that is worth reading.** The request was
to turn the fan's stacking order around so the left card lies on top. The order is not the defect: it is
what leaves each card's left strip exposed, which is what D28 chose deliberately. The shadow is the defect.
Both looks were drawn out for the Product Owner with the consequence stated, that left-on-top cuts the
titles, and the shadow was chosen.

**The brief also carries two findings that need no decision from you**, both named because a spec's
measurements depend on them: `data-active` on the skill hand means "some card is playable" rather than
"this seat is on turn", so D33's hot-seat privacy hangs on the wrong state, and **Baloo 2 and Nunito are
declared in `tokens.css` and loaded by nothing**, which is D24 and which means no pixel figure in any spec
was measured against the fonts the game actually renders.

---

## Status on 2026-09-03: handoff 07 is closed, and answering it opened one question

**[07-spec-trap-marker.md](07-spec-trap-marker.md) landed.** All ten decisions came back, D51 to D60,
and nine of them are on screen. Five stylesheets: `board.css` amended, `board-trap.css` new, `pawn.css`,
`refusal.css` and `tokens.css` amended, plus a `--motion-trap-hold` token the view reads. The five
landing checks passed, the one element the spec named by name is wired (`.pawn__status`), and the four
`--seat-shape` repeats in `hud.css`, `chrome.css` and `overlay.css` are deleted as § 2 asked.

**Two things this closed that were live defects rather than preferences.** D55 took the trap announcement
out of `--color-warn`, the colour reserved for "you cannot do that", which had been shipping wrong on
purpose since 2026-09-02 with a note against it in `notes/04`. D60 gave a trap fired by a card two
seconds of guaranteed time on screen, which the game had simply not been giving the player.

| Brief | Owes | State |
| --- | --- | --- |
| [08-brief-pickable-field.md](08-brief-pickable-field.md) | `08-spec-pickable-field.md`, plus whichever of `prompt.css` and `board.css` the answer touches | **Open.** Sent 2026-09-03 |

**One decision did not land, and it is not a delivery problem.** D59 answers "what does a pickable field
look like" with violet and no dimming. `prompt.css` has answered the same question since handoff 04 with
teal and a dim, at the same specificity, and it loads later, so the D59 block is inert. Neither side could
have known: brief 07 asked D59 as an item this file's own § 4 listed as never answered **in a spec**, and
it had been implemented in the meantime.

**It blocks NFR-08's second half, which makes it the first requirement-blocking design item since brief
06 closed one on 2026-09-02.** The offer and the focus rings are both built from `box-shadow`, so the same
collision swallows D59's keyboard focus treatment: a field can be reached with Tab and gives no sign of
being reached. The reach itself shipped with issue #45 and works.

**The package landed whole and untouched anyway**, which the Product Owner chose over deleting the earlier
rules (that would leave a teal pawn beside a violet field, which is a design decision) or holding
`board.css` back (it carries the `--seat-shape` consolidation `board-trap.css` needs). Two places in the
repository record the current state: `src/main.js`'s import comment, where the cascade order is visible,
and a deliberate negative assertion in `tests/e2e/field-keyboard.spec.js` that is **meant to start
failing** when D61 is answered.

**One change to how a brief is written comes out of this.** A brief lists the DOM contract and the
constraints; it does not list the rules that already exist for the element it is about. This file guards
against a request being dropped and has no guard against a question being answered twice, because it
tracks what was asked and not what the repository already does. § 2 of brief 08 does list them, and the
next brief should too.

---

## Status on 2026-09-02, late: one brief is out again

**[07-brief-trap-marker.md](07-brief-trap-marker.md) was sent for issue #45.** The loop was empty for a
few hours and is not any more. D51 to D60 are open and are in the table in § 4.

| Brief | Owes | State |
| --- | --- | --- |
| [07-brief-trap-marker.md](07-brief-trap-marker.md) | `07-spec-trap-marker.md`, plus amendments to `board.css`, `pawn.css` and `refusal.css` | **Open.** Sent 2026-09-02 |

**What it is about.** The trap mechanic shipped with epic #38 on 2026-08-31 and not one file under
`src/ui/` reads `state.traps`, so the game has been enforcing rules the player cannot see. Issue #45
rebuilds those rules to match the Game Design Document and makes every trap and blocker public with its
owner shown, which turns an invisible rule into a rendering job with ten open looks in it.

**It blocks no requirement.** FR-30 is a `could have`, so this is the first brief since 02 that is about a
preference rather than a requirement. Brief 06 closed the last requirement-blocking item.

**Two of the ten are worth more than the rest, and the brief says so.** **D55** is what a trap firing looks
like, and it carries a deviation that is already shipping: the announcement goes into the D9 refusal strip,
which is painted in `--color-warn`, the colour reserved for "you cannot do that". A trap going off is not a
refusal. The alternative was leaving a Banana Peel silently eating a player's turn, and `CLAUDE.md` forbids
this side from inventing a third treatment, so it shipped wrong on purpose and D55 fixes it. **D59** is what
a pickable field looks like: `[data-pickable]` on a field is styled by nothing today, no field is reachable
from the keyboard at all, and four of the five field-targeting cards are the trap cards.

**Everything else about #45 ships without waiting.** All the attributes in the brief's § 3 go into the DOM
unstyled, along with the announcement text and a full Playwright suite that asserts them. That is the D27
precedent on purpose: markup now, stylesheet when the spec lands.

---

## Status on 2026-09-02, evening: nothing is owed

**Handoffs 05 and 06 were both answered in one delivery and both landed the same day.** The four files are
in the repository, the five landing checks were run, and the two DOM changes the specs asked for by name
are wired: `data-copies` on the pool overview card, and `tabindex` made conditional on a card being
playable. Both mockup folders, `handoff-04/` and `handoff-05/`, were reviewed and deleted.

| Brief | Answered by | Result |
| --- | --- | --- |
| [06-brief-pawn-mark.md](06-brief-pawn-mark.md) | [06-spec-pawn-mark.md](06-spec-pawn-mark.md) | **Closed.** D48, D49, D50, and D16 with them. `pawn.css` amended. **NFR-12 is met**, and `greyscale.spec.js` runs green with no expected-failure marker for the first time since 2026-08-30 |
| [05-brief-dice-pool-overlay.md](05-brief-dice-pool-overlay.md) | [05-spec-dice-pool-overlay.md](05-spec-dice-pool-overlay.md) | **Closed.** D43, D44, D45, D47. `pool.css` replaced, and it was the **last placeholder stylesheet in the project** |

**What this means for the loop.** Five stylesheets were written by Claude Code and should not have been,
and none of them is left. Every rule in the project's CSS now comes from a numbered decision in a spec.

**What is still open, and none of it blocks a requirement:** D17, D21, D22, D23 and D24 from handoff 02,
which never received a spec of its own, and the fonts still loading from Google Fonts since spec 01
section 5. Spec 06 also names one improvement it deliberately did not make: the seat-to-shape mapping now
repeats in four stylesheets and belongs in the one `[data-player="N"]` block in `board.css`, which a
delivery touching that file should do.

**One note for the next delivery, since this one got it right.** The package stated the date and the tree
its unchanged copies were read from, which is what the rule added after handoff 04 asks for, and only the
four files it declared changed were copied in. That rule now has a clean application as well as the near
miss that produced it.

## Status after handoff 04

**Handoff 04 was answered on the evening this file was written, and it is landed.** The spec is at
[04-spec-hud-menus-and-handover.md](04-spec-hud-menus-and-handover.md); the ten stylesheets are in
`src/ui/styles/`; the three DOM attributes it asked for by name are wired up; `npm test`, `npm run lint`
and the 213-case Playwright run are green. What that leaves:

| Was owed | Now |
| --- | --- |
| `04-spec-hud-menus-and-handover.md` | **Delivered and landed** |
| `prompt.css`, `hud.css`, `overlay.css`, `chrome.css` | **Replaced.** Plus `handover.css`, which is new |
| `tokens.css`, `app.css`, `hand.css`, `refusal.css`, `pawn.css` | **Amended and landed** |
| `05-spec-dice-pool-overlay.md` and `pool.css` | **Still owed.** D43, D44, D45, D47. D46 was answered inside D42 |
| D16, and NFR-12 with it | **Answered, not closed.** See below |

**The one thing to read before anything else.** D16's answer is in and it is on the HUD, the chrome and two
overlay panels, but NFR-12 is measured **on the pawn** and the mark is not there. The spec names what is
missing: `.pawn__mark`, an empty `<span>` inside `.pawn`, and about fifteen lines of `pawn.css` after it.
Those fifteen lines were not in the delivery. **That is the only outstanding design item in the project
that blocks a requirement at all**, `greyscale.spec.js` is still marked expected-to-fail because of it,
and it has no brief of its own. It is a smaller ask than the handoff 05 spec and it is worth more.

Two notes on landing the delivery, for the next one:

- **`board.css`, `card.css` and `card-state.css` were not copied in.** All three are listed as "unchanged,
  included so the mockup runs", and two of them differ from the repository only in Prettier formatting.
  `board.css` does not: the delivered copy predates the NFR-02 split into `board.css`, `board-track.css`
  and `board-regions.css`, so copying it would have reverted that split silently. **If a future delivery
  includes files it did not change, say which commit or date the snapshot was taken from.**
- **Every delivered file was under 300 lines after `npm run format`**, which is the first handoff to manage
  that without a split. Writing one declaration and one selector per line is what did it. `prompt.css` is
  the closest at 244.
- **The spec arrived with five em dashes and they were edited out before it was committed.** CLAUDE.md bans
  the character and the rhetorical habit outright, in every document and every language, and no brief in
  this loop has ever said so. **It is added to section 5 below**, because it is a rule about the deliverable
  and every brief lists the rules about the deliverable. Two were table placeholders and three were the
  habit: a claim interrupted by an aside and then a stated consequence.

The rest of this file is the work order as it was written, and sections 1, 2.1 and 2.2 are now partly
historical. Section 4's decision table and section 5's rules still apply as written.

---

## 0 What this file is, and what it is not

**It is not a brief.** [README.md](../README.md) defines the loop as numbered pairs, `NN-brief-<topic>.md`
answered by `NN-spec-<topic>.md`, and this file is neither half of a pair. It is a **work order**: an index
of the requests that are already out, the files each one owes, and the order they are best answered in. It
carries the `00-` prefix so it sorts above the pairs and reads as the cover sheet it is.

**Every technical requirement is in the briefs, not here.** Do not design from this file. It tells you
which briefs to read and what is expected back; the DOM contracts, the constraints and the numbered
decisions live in the briefs themselves and this file only points at them.

**Why it exists.** Three briefs are outstanding at once, two of them sent on the same day, and one of the
files that is owed appears in **no brief's deliverables table at all** (§ 2.2). At three open requests the
loop needs an index or something gets quietly dropped, and something already had been.

---

## 1 Status of the loop

| Handoff | Brief | Spec | State |
| --- | --- | --- | --- |
| 01 Foundations and board | [01-brief](01-brief-foundations-and-board.md) | [01-spec](01-spec-foundations-and-board.md) | **Closed.** Landed 2026-08-30 |
| 02 Board review | [02-brief](02-brief-board-review.md) | *none* | **Open since 2026-08-30, and no spec was ever returned.** D19 was answered inside spec 03 and D18 was re-asked as D40 in brief 04. Eight decisions have no answer anywhere |
| 03 Cards and hands | [03-brief](03-brief-cards-and-hands.md) | [03-spec](03-spec-cards-and-hands.md) | **Closed.** Landed 2026-08-31 |
| 04 HUD, menus and handover | [04-brief](04-brief-hud-menus-and-handover.md) | [04-spec](04-spec-hud-menus-and-handover.md) | **Closed.** Landed 2026-09-01. D16 answered for the page furniture, not for the pawn |
| 05 Dice card pool overlay | [05-brief](05-brief-dice-pool-overlay.md) | [05-spec](05-spec-dice-pool-overlay.md) | **Closed.** Landed 2026-09-02. D43 to D47; D46 answered inside D42 |
| 06 The seat mark on the pawn | [06-brief](06-brief-pawn-mark.md) | [06-spec](06-spec-pawn-mark.md) | **Closed.** Landed 2026-09-02. D48 to D50, and D16 with them |
| 07 Traps, blockers and pawn statuses | [07-brief](07-brief-trap-marker.md) | [07-spec](07-spec-trap-marker.md) | **Closed.** Landed 2026-09-03. D51 to D60, all ten answered. Nine are on screen; D59 is inert because `prompt.css` answers the same question and loads later, which is now D61 |
| 08 The pickable field | [08-brief](08-brief-pickable-field.md) | *none yet* | **Open.** Sent 2026-09-03. D61, one question with four parts. **Blocks NFR-08's second half**: a field can be tabbed to and gives no sign of it |
| 09 The stage, the seat plate and the fan | [09-brief](09-brief-layout-and-fan.md) | *none yet* | **Open.** Sent 2026-09-03. D62 to D64, **all three already implemented and sent back for confirmation**, because FR-31 was broken on the machine the round was played on and the fix could not wait |
| 10 Reading a card you are holding | [10-brief](10-brief-card-reveal-on-hover.md) | *none yet* | **Open.** Sent 2026-09-03. D65 to D69. **Nothing implemented**, because D66 may rebuild the card's DOM. D65 asks D33 to be taken back in part, and it blocks the other four |

**The 02 row is the one worth reading twice.** A brief with no spec is not a brief that was declined, it is
a brief nobody closed, and one of its eight open items (D16) is the only design question in this project
that blocks a requirement rather than a preference. **It is `should have`, not `must have`**: that label was
wrong in this file and in four others, and it is corrected in the risk register and in
`00-Meta/Documentation/notes/01-requirements-and-goals.md`.

---

## 2 The files that are missing

### 2.1 Spec documents

| File to create | Answers | Read first |
| --- | --- | --- |
| ~~`01-Design/Handoff/04-spec-hud-menus-and-handover.md`~~ | D35 to D42 | **Delivered 2026-09-01** |
| `01-Design/Handoff/06-spec-pawn-mark.md` | D48 to D50, closing D16 | [06-brief](06-brief-pawn-mark.md), **first** |
| `01-Design/Handoff/05-spec-dice-pool-overlay.md` | D43 to D47 | [05-brief](05-brief-dice-pool-overlay.md), second |

Both follow the five-section spec template in [README.md](../README.md): files delivered, one answer per
open decision **with its reason and its rejected alternatives**, a token reference table, component states
checked against the brief's DOM contract, and what is still open.

Handoff 02's eight leftovers do **not** need a spec document of their own. Answer whichever of them the
work on D35 to D47 happens to settle, in whichever spec settles it, and say which are still open.

### 2.2 Stylesheets

**Five files in `src/ui/styles/` were written by Claude Code and should not have been.** Each one says so in
its own header, composes existing tokens only, and names the decision that is owed. They are listed in the
order they appeared.

| File | Lines | Owed by | In that brief's deliverables table? |
| --- | --- | --- | --- |
| `prompt.css` | 183 | D35, D36 and spec 03 § 5 (the countdown) | Yes, brief 04 |
| `hud.css` | 167 | D35, D36, D37 | Yes, brief 04 |
| `overlay.css` | 185 | D38, D39, D40 | Yes, brief 04 |
| `chrome.css` | 88 | D42, and now D46 | **No. This is the omission.** |
| `pool.css` | 92 | D43, D44, D45, D46 | Yes, brief 05 |

> **All five are replaced as of 2026-09-02.** Four went with handoff 04 and `pool.css` with handoff 05.
> The table is kept as the record of what the loop was asked to fix.

**`chrome.css` is the finding.** Brief 04 asks about the chrome in D42 and `chrome.css` names D42 in its
header, but the file is absent from brief 04 § 6 and brief 05 only lists it conditionally, "only if D46
restructures the row". So nothing actually asked for it, and a spec answering D42 in prose while leaving
the placeholder stylesheet in place would have looked complete. **It is requested here explicitly.** It has
also grown since brief 04 was written: issue #30 added a third button to that row, so the file's own header
sentence about "the two controls" was already stale and has been corrected.

Two files are **amended and never replaced**, because they are shipped, tested and referenced by name
throughout the documentation notes:

| File | How |
| --- | --- |
| `tokens.css` | New tokens added to the existing set. Do not remove or rename an existing one without saying so in the spec |
| `app.css` | The HUD and chrome regions per D35. Additive |

`card.css` and `hand.css` are yours from spec 03 and may be revised, but say in the spec that they changed
and why. D35 already changed two of their values under protest and asks to be overruled.

---

## 3 Suggested order, and the reason for it

> **Superseded 2026-09-02.** Handoff 04 landed, so the order below is history. The current order is in the
> status block at the top of this file: **06 first, 05 second.** Kept so the reasoning is readable.

1. ~~**Handoff 04 first.**~~ It owns the page layout, and D35 decides how many grid rows the foot of the page
   costs. Everything else sits inside that answer: the pool overview is a panel on the same sheet
   `overlay.css` draws, and the chrome row D46 asks about is the row D42 is about. **Done.**
2. **Handoff 05**, and it is small: one panel, one card region, one sentence. D46 was a sub-question of
   D42 and was answered in the 04 spec, which the 05 spec should confirm.
3. ~~**D16 whenever it can be answered, and preferably not last.**~~ **Now brief 06, and first.** It is
   the only item in this file that blocks a requirement rather than a preference. See § 4.

~~**If only one thing can be delivered, deliver the 04 spec.**~~ **If only one thing can be delivered,
deliver the 06 spec.** It is fifteen lines and it closes a requirement.

---

## 4 Every open decision, in one table

| No. | In one line | Brief | Blocks a requirement? |
| --- | --- | --- | --- |
| ~~**D16**~~ | Telling four seats apart without relying on colour | 02 | **Closed 2026-09-02, and NFR-12 with it.** Answered by spec 04 for the HUD, the chrome and two overlay panels, re-asked as D48 to D50 in brief 06, and closed by spec 06 with the shape on the piece. `greyscale.spec.js` asserts four different shapes and carries no expected-failure marker |
| D17 | Does the legal-target set read as one group, given the entry-square exception | 02 | No |
| D20 | Does the four-second refusal minimum become a token | 02 | No |
| D21 | Does a legal target that captures look different | 02 | No |
| D22 | The overlapping movable rings inside a yard | 02 | No |
| D23 | Who owns `board-track.css`, and how CSS is delivered under the 300-line limit | 02 | No, but it is a process answer worth having |
| D24 | Self-hosting Baloo 2 and Nunito as woff2 | 02 | No. Open since spec 01 § 5 |
| D35 | Where the HUD and the chrome go, and what they cost in page height | 04 | Indirectly: FR-31, one screen with no scrolling |
| D36 | What "on turn" looks like, and how many places say it | 04 | No |
| D37 | Sixteen numbers on screen: how the HUD reads at a glance | 04 | No |
| D38 | One overlay component, five contents. Is that the right seam | 04 | No |
| D39 | The handover screen, which must actually conceal the skill hand | 04 | Yes in substance: D33's secrecy answer depends on it |
| D40 | The win screen, and the orange strip that also says it. Was D18 | 04 | No |
| D41 | The 36 illustrations against the two skins | 04 | No |
| D42 | The two, now **three**, persistent controls | 04 | No |
| ~~D43~~ | Seven cards at once: what size, what arrangement | 05 | **Closed.** Four then three at `--card-u: 0.68` in a 54.5rem panel, centred |
| ~~D44~~ | How the copy count is shown, and whether the weighting is readable as a shape | 05 | **Closed.** Both: the number stays in the tag and the card is drawn as the pile it stands for |
| ~~D45~~ | Where the face-down sentence sits, and how loud it is | 05 | **Closed.** It stays where it is, unchanged, because the number barely moves |
| ~~D46~~ | A third chrome button. Answer with D42 if that is easier | 05 | **Closed** inside D42, and spec 05 confirms three buttons need no new structure |
| ~~D47~~ | Does the pool overview also open from the dice hand | 05 | **Closed. No**, and `hand.css` is untouched |
| ~~**D48**~~ | Size and placement of the seat mark on the pawn, and what happens to the eyes of D14 | 06 | **Closed.** 38 % of the piece, low on the disc, ink, and the creature is unchanged |
| ~~**D49**~~ | The mark through the five pawn states: selected at 1.14, captured at 0.82 and 70 %, movable loop, focus, reduced motion | 06 | **Closed.** It takes part in none of them, which is a decision with the capture state's 2.16:1 named as its cost |
| ~~D50~~ | What happens to the luminance-only measurement in `greyscale.spec.js` once the shape is on the piece: retire, keep as a weaker check, or re-spread the palette as well | 06 | **Closed. Retired**, the four-different-greys case kept as the palette floor, and the 1.146 figure moved into the notes |
| ~~**D51**~~ | What a trap looks like on a field. Three kinds, one shape language or three | 07 | **Closed.** A chip in the field's foot-left corner at 30 per cent, built exactly like a pawn: seat fill, hair ink edge, seat shape in ink, piece shadow. **The three kinds look identical on purpose**, and the kind stays in the `aria-label`, so `data-trap-kind` is in the DOM and deliberately unread |
| ~~**D52**~~ | How a blocker reads differently from a trap. Confirms or replaces `data-trap="blocker"`, which spec 01 § 5 predicted as `data-blocked="true"` | 07 | **Closed.** `data-trap="blocker"` confirmed. The same object at 76 per cent with square corners: a trap is a small thing lying on the path, a blocker is the path being gone. It stops 12 per cent short of the edge so the turn-off bar stays visible over it |
| ~~**D53**~~ | Whether and how the owning seat is shown on a 1-cell field, given that NFR-12 forbids colour alone | 07 | **Closed.** Shown, by the seat colour as the chip's fill and the seat's shape in ink inside it, off the one mapping in `board.css`. The cost is stated: the shape is 10 px at the design size and 6 px at the board's floor, so at the floor the owner reads by colour alone. NFR-12 is measured on the pawn and unaffected |
| ~~**D54**~~ | How three marks on one field coexist: trap, D27's skill diamond, D7's legal-target ring | 07 | **Closed. Nothing gives way.** The ring is the field's own edge, the diamond is centred, the chip is in a corner, and D27's existing step back to `inset: 30%` absorbs the one place two of them meet |
| ~~**D55**~~ | What a trap firing looks like, and what the announcement is. **The one that fixes a deviation already shipping**: the announcement is currently in the refusal orange, and a trap going off is not a refusal | 07 | **Closed, and it was a live defect rather than a preference.** The chip fades and scales over `--motion-capture` in both directions, and the strip gets a second voice on the `data-message-kind` seam: the panel colour with an ink dot. Two declarations, no new token, no new component |
| ~~**D56**~~ | How a stunned pawn reads. The first status mark on a pawn in the project | 07 | **Closed.** The piece tips nine degrees and its fill mixes 58 per cent toward `--color-dormant`. The tilt is the point: it is the only piece on the board not upright, so it reads at a glance and in greyscale. The seat mark is untouched |
| ~~**D57**~~ | How the Oil Spill `SLIPPERY` status reads. Answerable with D56 | 07 | **Closed**, with D56 as one pawn-status decision. A dormant disc with an ink skid on the piece's upper right shoulder, on a new `.pawn__status` span the spec named and Claude Code added. **It is the slot for the six statuses this issue does not answer** |
| ~~**D58**~~ | Whether the It's Not That Deep aura is drawn, and how. Seven contiguous fields | 07 | **Closed. Drawn**, as a 45 degree hatch in `--color-text` at 22 per cent on `background-image`, the one paint layer on `.square` nothing else used. Seven fields of texture read as one region; seven of colour would read as a second board |
| **D59** | What a pickable field looks like, and its keyboard state. Also answers the third unnumbered leftover below, asked for a field | 07 | **Answered, not landed. This is now D61.** Violet with no dimming, and focus as two rings outside the field. `prompt.css` has answered the same question in teal with a dim since handoff 04, at equal specificity, and loads later, so the whole block is inert. See the status block at the top of this file |
| ~~**D60**~~ | Whether a trap announcement gets a hold token, and whether the game waits for a mid-turn one. D20 is the precedent | 07 | **Closed. Yes to both.** `--motion-trap-hold: 2s`, and the view holds the turn for it when a trap fires from a card. Two seconds and not D20's four, because a refusal follows the player's own click and this arrives unasked. It needed code rather than CSS |

| **D61** | How the pickable field and the pickable pawn are drawn, given that handoff 04 and D59 answered the same question in opposite directions. Four parts: which answer wins for the field, what a focused field looks like, whether the pawn follows, and what happens to the dim | 08 | **Yes, and it is the only one open that does.** NFR-08's second half: the collision swallows D59's focus treatment as well as its fill, so a field can be reached with Tab and gives no sign of it |

| **D62** | Whether the page is drawn on a fitted 16:9 stage, and at what size. Against D6, which made the **board** fluid and left the other four regions in `rem`, and against D30's breakpoint | 09 | **It did.** FR-31 was true at 1440 by 900 and nowhere else: the page needs a fixed 820 px of height, 882 while it is asking something, so a 1438 by 770 laptop scrolled by 50 px and by 112 with the prompt up. **Already implemented and sent back for confirmation** |
| **D63** | Whether the seat plate takes the width its four numbers need. Against D37's fixed 15.5rem | 09 | No. The plate gave the numbers 218 px and they need 278, so the last one ran 45 px out and the next plate painted over it. **Already implemented as `min-width`, sent back for confirmation** |
| **D64** | Whether the fan keeps its stacking order and flips its shadow to the left. Against the depth cue in `card.css`, not against D28's exposed left strip, which is intact | 09 | No. Comes with two findings the answer should absorb: the overlap table follows `data-count` while the hand builds five permanent slots, so a hand of three is wider than a hand of five, and the hover reveal under-shifts at the higher counts. **Already implemented, sent back for confirmation.** The hover finding is carried on as **D69** and is no longer owed here |

| **D65** | Whether the player's own skill hand stays face down when nothing is playable. Against half of D33, which put the back there for hot-seat privacy. Four parts: is the own hand always face up, what still says the region is dormant, does the closed-up overlap survive, and what `.card--back` is still for | 10 | **No, and it is the second one open that does not block a requirement but hides information.** `data-active` means "some card is playable", and `card-state.css` reads it as "this hand is not yours", so the own hand is a row of backs through the dice choice and the move. D33 is enforced by the handover curtain, not by this back. **Blocks D66 to D69**: a face-down card cannot be made readable by hovering |
| **D66** | What a revealed card looks like, and by which mechanism. Three routes are offered with their real costs and none is chosen: grow in place, a genuine turn, or a detail card at the reference size beside the hand | 10 | No. It is the request itself. A turn alone does not answer it: the rules paragraph computes to 8.57 px at hand size, so the reveal needs a size decision and not only a motion. Option 2 would rebuild the card's DOM and break three end-to-end checks, which is why nothing was implemented first this time |
| **D67** | Whether a card that cannot be played reveals too, and what the focus state is there | 10 | **Partly, and it is NFR-08.** `card-view.js` gives an unplayable card `tabindex="-1"`, so the keyboard cannot reach a card in order to read it. The reason on record is that a stop where `Enter` does nothing says nothing, and that reason dissolves the moment focus reveals. The change is ready and is not made unasked, because it puts a focus ring on a card you cannot play |
| **D68** | Which token times the reveal, and what survives `prefers-reduced-motion`. D8 and D12 own motion; D20 and D60 are the precedent that a new duration gets a number | 10 | No. Includes whether there is a delay before the reveal fires, so that sweeping a pointer across a fan of five does not trigger five |
| **D69** | Whether the reveal replaces the sideways fan out in `hand.css` or joins it | 10 | No. Carried over from D64, where it was measured: the shift is 43.5 px and the covered strip is 42.4 px at overlap 0.24 and 77.8 px at 0.44, so at the higher counts a card cannot be fully revealed by hovering it. A card that grows or turns may not need the neighbours moved at all |

Four more items are open from spec 03 § 5 and brief 04 § 5.1 and are not numbered: what the reaction
countdown looks like, whether the prompt strip belongs at the foot or in the rail, how a pickable pawn
differs from a movable one, and what an **empty hand slot** looks like. The last one is visible in any
screenshot of a hand holding one card and currently renders as a blank card, which is neither of the two
answers the existing specs give.

**The third one is the cautionary tale of this file and it is worth reading twice.** It was asked properly
as **D59**, for a field rather than for a pawn, because issue #45 made four of the five field-targeting
cards trap cards. D59 was answered, and the answer could not land: **the item had already been
implemented**, on 2026-09-01, in `prompt.css`, in a block whose own comment says it is answering this
exact leftover. So this list was right that no spec covered it and wrong that nothing did, and the loop
had no step that would have caught the difference. It is now **D61**, and § 2 of brief 08 lists the rules
that already exist for the element it asks about, which is the change that would have prevented it.

---

## 5 The rules that apply to every delivery

Full versions are in each brief's § 2. The five that get broken most often, and the fifth is new because
handoff 04 was the first delivery to break it:

1. **No user-facing string in CSS.** Nothing a player reads in a `content:` property (NFR-03). Overlays are
   almost entirely text, which is where this bites.
2. **No CSS file over 300 lines, measured after `npm run format`.** `board.css` was delivered at 248 lines
   and Prettier expanded it to 407. Split yourself at roughly 250 unformatted lines.
3. **Built once, then only attributes rewritten.** The HUD updates after every turn, so a re-created
   element restarts every transition on it.
4. **Two skins from the tokens, through `light-dark()` pairs, and `prefers-reduced-motion` respected.**
5. **No em dash, anywhere, in the spec or in a CSS comment.** CLAUDE.md bans the character and the
   rhetorical habit it enables: a claim interrupted mid-sentence by an inserted aside and then a stated
   consequence, or "either A, in which case B, or C, in which case D". Use a colon, a semicolon, a comma,
   or two ordinary sentences. In a table cell where a value is genuinely absent, write `n/a` or `none`.
   Handoff 04's spec had five and they were edited out on landing, which is a change to a delivered
   document and is better avoided than corrected.

**If an answer needs a DOM element the brief does not promise, name it in the spec rather than styling
around its absence.** Claude Code adds it, and that is a much smaller change than a stylesheet built on a
guess about markup.

---

## 6 The five landing checks

Claude Code does not merge a spec unread. Same list every time:

1. Every open decision the brief names is answered, none silently skipped.
2. Every answer carries a reason **and** a named rejected alternative.
3. No CSS file over 300 lines after `npm run format`.
4. No user-facing string in a `content:` property.
5. Every state in the brief's DOM contract is actually styled, and any element the spec needs that the
   contract does not promise is named rather than assumed.

A missing reason is asked for **now**, while somebody still remembers it, and not reconstructed for the
report later. That is the whole point of the round trip.

---

## 7 What is deliberately not being asked

- **Audio and every sound cue.** Issue #40, deferred out of epic #39 on 2026-09-01.
- **The rules screen, S10** (FR-35). A `should have` with no board issue. The pool overview of handoff 05
  covers the dice-card third of it by accident, and that is as far as it goes.
- **The board, the pawns and the two hands.** Specs 01 and 03 own them. Amend only where a decision forces
  it, and say so.
- **The 36 illustrations themselves.** They exist and are on screen. D41 is about the colour they are drawn
  in, not the drawings.
- **The skill card pool.** Fifty-eight cards over twenty-nine ids with a real discard pile. A different data
  model, and it needs its own brief before it needs a design.
