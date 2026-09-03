# Open requests: everything Claude Design is currently owed

**From:** Claude Code
**To:** Claude Design
**Date:** 2026-09-01, **updated the same evening, twice on 2026-09-02**

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
| 07 Traps, blockers and pawn statuses | [07-brief](07-brief-trap-marker.md) | *none yet* | **Open.** Sent 2026-09-02 for issue #45. D51 to D60. Blocks no requirement: FR-30 is a `could have` |

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
| **D51** | What a trap looks like on a field. Three kinds, one shape language or three | 07 | No |
| **D52** | How a blocker reads differently from a trap. Confirms or replaces `data-trap="blocker"`, which spec 01 § 5 predicted as `data-blocked="true"` | 07 | No |
| **D53** | Whether and how the owning seat is shown on a 1-cell field, given that NFR-12 forbids colour alone | 07 | No, but the answer must keep `greyscale.spec.js` green |
| **D54** | How three marks on one field coexist: trap, D27's skill diamond, D7's legal-target ring | 07 | No |
| **D55** | What a trap firing looks like, and what the announcement is. **The one that fixes a deviation already shipping**: the announcement is currently in the refusal orange, and a trap going off is not a refusal | 07 | No, but it is a live defect rather than a preference |
| **D56** | How a stunned pawn reads. The first status mark on a pawn in the project | 07 | No |
| **D57** | How the Oil Spill `SLIPPERY` status reads. Answerable with D56 | 07 | No |
| **D58** | Whether the It's Not That Deep aura is drawn, and how. Seven contiguous fields | 07 | No |
| **D59** | What a pickable field looks like, and its keyboard state. Also answers the third unnumbered leftover below, asked for a field | 07 | Indirectly: NFR-08, since no field is keyboard-reachable today |
| **D60** | Whether a trap announcement gets a hold token, and whether the game waits for a mid-turn one. D20 is the precedent | 07 | No |

Four more items are open from spec 03 § 5 and brief 04 § 5.1 and are not numbered: what the reaction
countdown looks like, whether the prompt strip belongs at the foot or in the rail, how a pickable pawn
differs from a movable one, and what an **empty hand slot** looks like. The last one is visible in any
screenshot of a hand holding one card and currently renders as a blank card, which is neither of the two
answers the existing specs give. The third is now asked properly as **D59**, for a field rather than for a
pawn, because issue #45 makes four of the five field-targeting cards trap cards.

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
