# Handoff 17, brief: the last card played, and what a pawn carries

**From:** Claude Code
**To:** Claude Design
**Date:** 2026-09-06
**Read against:** branch `dev` plus the four feature branches of issue #87 (`feature/90-rock-cards-on-own-pawn`,
`feature/91-move-by-target-and-drag`, `feature/93-last-card-and-brief-17`, `feature/94-pawn-status-tooltip`).
Every element and attribute named below exists on one of them today
**Issue:** #87, a playtest on 2026-09-06, and its children #93, #94, #90 and #91
**Answers:** nothing. **D100 to D103** are the questions

---

## 0 What has happened since brief 16

A teammate played the game for an afternoon and came back with seven findings. Four of them were rules or
bugs and are built; three of them are things the player **could not see**, and those are this brief:

1. **A protected pawn looked like every other pawn.** The tester tried to capture a pawn, was refused, and
   read it as a bug on the square. The pawn was carrying Lock In or Built Different. The message strip
   named the refusal; the piece said nothing. `board-marks.js` has written `data-statuses` on every pawn
   since issue #45 and spec 07 styled two of the nine kinds; the other seven were invisible.
2. **Nobody could tell what the last card was.** A bot's play is announced in the strip for two seconds
   and is then gone; a person's own play is never announced at all. The tester asked for a place that shows
   the last card played and what it did, with the card's text on hover.
3. **A pawn can be dragged now** (issue #91), and the carried pawn is deliberately unstyled.

One more thing changed underneath: **Big Ah Rock is no longer a square object** (issue #90). Both rock
cards petrify one of the caster's own pawns, so `data-trap="blocker"` has no writer, the D52 blocker mark
is deleted from `board-trap.css`, and the stone is a pawn that needs a mark of its own.

Under the 2026-09-06 amendment to `CLAUDE.md`, all of this is Claude Design's: new components and new
marks, nothing broken to repair. What Claude Code did ship is the fallback that costs no design decision: a
native `title` on every pawn naming its statuses in words (issue #94), and the data for the slot.

---

## 1 Hard constraints

Unchanged from brief 16 § 1. The ones that bite here:

| Constraint | Why it exists | What it means for this brief |
| --- | --- | --- |
| No file over 300 lines, stylesheets included (NFR-02) | `npm run format` expands compact rules; `board.css` went from 248 to 407 once | A new component gets its own stylesheet; `pawn.css` is at 252 lines with the drag rule in it |
| Every player-visible string comes from `ui.json` (NFR-03) | Two languages, switchable mid-match | A mark is geometry; words go through i18next and Claude Code writes them |
| One screen, no scrolling, at 1440 by 900 (FR-31) | The stage is a fixed 16:9 frame | The slot has to fit the rail as it stands, or say what it displaces |
| Everything is an attribute the view already writes | `CLAUDE.md`: `ui/` contains no game rules | Every hook you need is listed in § 2; ask for a new one rather than deriving state in CSS |
| Both skins, and greyscale (NFR-12) | The four seat hues are 10 levels apart in greyscale | A status mark cannot be a hue alone |

---

## 2 The DOM contract

### 2.1 The pawn, as it stands

```html
<div class="pawn" tabindex="0"
     data-player="0" data-pawn="2" data-r="17"
     data-statuses="locked armoured"
     title="Locked in (Lock In): may not be moved and cannot be captured. · Armoured (Built Different): cannot be captured.">
  <span class="pawn__status"></span>
</div>
```

- `data-statuses` is the space-separated list of status kinds the pawn carries, written by
  `board-marks.js` on every update, absent when the pawn carries nothing. The nine kinds are in § 3.
- `title` is the fallback tooltip from issue #94: one clause per kind from `ui.json` `status.*`, joined
  with `status.separator`. It stays under whatever you design, as the accessible name.
- `.pawn__status` is the shoulder tag D57 put there. It renders `slippery` today and D57 named it as the
  slot for the other six kinds, "one at a time, in an order the spec that answers them sets".
- `data-dragging="true"` while the pawn is being carried (issue #91), plus `--drag-dx` and `--drag-dy` in
  pixels on the element, applied by `pawn.css` as a `translate`. `data-selected="true"` is set at the same
  moment, so the pawn's one target is lit while it is in the hand.

### 2.2 The last-card slot, proposed

No element exists yet. The state carries the fact since issue #93:

```js
state.lastCard = { seat: 2, cardId: "reaction-nuehue", turnNumber: 14, outcome: "resolved" }
```

`outcome` is `pending` while the card waits in a reaction window, then `resolved`, `nullified` (an It's
Not That Deep aura cancelled it) or `negated` (a Nühü cancelled it). It survives the turn and is
overwritten by the next play.

The proposed element reuses the card component, because a card the player can read on hover already
exists and the reveal (spec 10) is what the tester asked for:

```html
<section class="last-card" data-seat="2" data-outcome="resolved" data-turn="14" data-empty="false">
  <h2 class="last-card__heading">…</h2>            <!-- t("lastCard.heading") -->
  <p class="last-card__line">…</p>                 <!-- t("lastCard.line", { player, turn }) -->
  <div class="card" data-card-id="reaction-nuehue" data-family="skill" …>…</div>  <!-- card-view.js -->
</section>
```

Open to change: the element names, whether the card is the full component or a smaller face, and where
it goes. **Not** open: the card's own DOM, which is spec 03's and spec 10's, and the four data attributes
on the section, which are what the state can say.

---

## 3 Facts the design must match

The nine status kinds, from `core/statuses.js`, with what the rules do and how long they last:

| Kind | Card | The pawn… | Lasts |
| --- | --- | --- | --- |
| `rock` | Rock, Big Ah Rock | is a wall nothing passes, cannot be moved by its owner, cannot be pushed | 2 rounds (Rock), 3 (Big Ah Rock) |
| `locked` | Lock In | cannot be moved by its owner | 1 round |
| `armoured` | Lock In, Built Different | cannot be captured; a capture attempt is refused | 1 round (Lock In), 2 (Built Different) |
| `ghost` | Ghost Mode | cannot be captured; spent by the capture it dodges | until spent |
| `held` | Hold Pawn | drops out of this turn's move choice | this turn |
| `ragebait` | Ragebait | must be moved if it can move | 1 round |
| `stunned` | Banana Peel | sits the next turn out | 1 round. **Styled by D56** |
| `slippery` | Oil Spill | skips the next skill square | 1 round. **Styled by D57** |
| `purge` | The Purge | is board-wide, not on a pawn; never in `data-statuses` | 1 round |

One round is one turn per seat at the table. A pawn can carry several at once: Lock In writes `locked`
**and** `armoured` in one play, and a Rock pawn can be `slippery` too. Two of the nine are drawn; the
tester's "aura for the invulnerable" is `armoured` and `ghost`, and `rock` is the most visible of the rest:
a stone is something every other player has to walk around.

The rail today, top to bottom: dice hand, skill hand, prompt (the reaction plate). The message strip hangs
above the skill hand (spec 16). The board column is the stage's height.

---

## 4 Open decisions this handoff must answer

### D100. The last-card slot: where it lives, and what it says

The tester's words: "you have to be able to see which card was played last and which effect fired; hover
the card and you see the effect." The state can say who, which card, which turn, and how it ended.

- Where does it go? The rail has three plates and a strip already; the board column is full-height. If it
  displaces something, say what.
- Is it the full card at a small unit with spec 10's hover reveal, or a face with the text on hover?
- How do the four outcomes read? `pending` is the one that matters most: a card sitting in a window that
  somebody may still cancel.
- What does it show before the first card, and does it show a **bot's** play differently from a person's?

*Rejected on this side, for the record: a scrolling log.* The strip is a single slot by decision (D73), and
a log is a new kind of thing on a screen that has no room for one. If you think the slot should hold the
last two or three, that is a design answer, not a constraint.

### D101. Marks for the six unstyled statuses, and the protection aura

D57 reserved `.pawn__status` for `held`, `rock`, `ghost`, `locked`, `armoured` and `ragebait`, "with their
own inner geometry, one at a time, in an order the spec that answers them sets". The playtest turned that
from a leftover into a defect: **`armoured` and `ghost` are the reason a capture is refused, and the pawn
does not show them.** The tester suggested an aura, or another colour such as grey.

- Which of the six get a mark, and in what order when a pawn carries several? Lock In alone produces two.
- Is "cannot be captured" one mark for `armoured` and `ghost` together, or two?
- Is `rock` a change to the piece rather than a tag? It is the one status the *other* players plan around.
- Does the tag survive greyscale and the dark skin on all four seat colours?

*Rejected on this side: a grey disc for every protected pawn.* Grey is `--color-dormant`, the colour of a
seat nobody is playing, and a protected pawn is the opposite of dormant. But that is a reason, not a veto.

### D102. A designed tooltip, or the native one

Issue #94 ships a native `title`. It answers "why can I not do this" but it is the browser's tooltip:
delayed, unstyled, invisible on touch. Is a designed status readout wanted, and if so, is it the tooltip
pattern, a line in the HUD row of that seat, or part of D100's slot? The `title` stays either way as the
accessible name.

### D103. The carried pawn

A pawn being dragged (issue #91) carries `data-dragging="true"`, the active z-index and a `grabbing`
cursor, and follows the pointer. Nothing else is decided. Does the piece lift, cast a longer shadow, tilt?
Does the lit target square answer the approach, and if so, how is that told apart from the selected
state, which is already on? `pawn.css` is at 252 lines; a second stylesheet for the gesture is fine.

---

## 5 Deliverables

- `01-Design/Handoff/17-spec-last-card-and-pawn-status.md`: one answer per D100 to D103, with reasons
  and rejected alternatives, in the five-section template.
- `src/ui/styles/last-card.css` (new) or amendments to an existing stylesheet, named per rule.
- Amendments to `src/ui/styles/pawn.css` for D101 and D103, **as a diff or rule-by-rule**, not a whole
  file: the 2026-09-05 status block in `00-open-requests.md` says what a whole-file delivery cost twice.
- If D100 needs a new element or attribute beyond § 2.2, name it and Claude Code writes it.
- The `ui.json` strings the slot needs (`lastCard.*`) as a list of keys and English wordings; Claude
  Code adds the German and wires them.

---

## 6 Out of scope

- The rules of any status, and the rounds in § 3. `core/` owns them.
- The message strip's card voice (D87, open since brief 14). If D100 makes D87 moot, say so.
- The reaction plate's own design (open since spec 04; its colour was fixed as a small fix on
  2026-09-06, see `00-open-requests.md`).
- The bot's card play pause (D88) and target mark (D89).

---

## 7 What Claude Code has already done, so the spec does not re-ask it

- `data-statuses` and `.pawn__status` on every pawn (issue #45), `title` on a pawn carrying a status
  (issue #94), `state.lastCard` with its four outcomes (issue #93), `data-dragging` and the two drag
  properties (issue #91).
- Retired D52: the blocker mark is deleted with its writer (issue #90).
- Wordings for the nine statuses in both languages, `ui.json` `status.*`, reusable for D102.
