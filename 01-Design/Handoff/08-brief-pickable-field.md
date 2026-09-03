# Handoff 08, brief: the pickable field, where two specs disagree

**From:** Claude Code
**To:** Claude Design
**Date:** 2026-09-03
**Issue:** #45, Trap Card System & Tile Trigger Logic. Requirement NFR-08 for the second half
**Answers:** nothing. **D61 is one question**, and it is a question about two answers that already exist

---

## 0 What happened, said plainly

**This brief exists because handoff 04 and handoff 07 answered the same question in opposite directions,
and neither delivery could have known.** Nine of handoff 07's ten decisions landed on 2026-09-03 and are
on screen. D59 did not, and it is not a delivery problem: the answer is in the repository and the cascade
throws it away.

| Spec | What it says a pickable field looks like | Where |
| --- | --- | --- |
| **Handoff 04**, 2026-09-01 | The skill teal, with every field and pawn that is **not** offered dimmed to `opacity: 0.45` | `prompt.css` lines 190 to 222 |
| **Handoff 07**, D59, 2026-09-03 | Violet, the same "you may click this" as a legal move target, with the four refused fields **not** painted at all | `board.css`, the block at the foot |

D59 rejects the earlier answer by name, twice: *"Rejected: a second hue for picking, teal"*, because a
field can be a skill square and pickable at once, and *"Rejected: the refused fields dimmed or hatched"*.
So this is not a preference between two drawings, it is one decision that has been taken twice.

**Nobody was careless.** Brief 07 asked D59 as the fourth unnumbered leftover of `00-open-requests.md`
§ 4, which had been open since spec 03 § 5 and had genuinely never been answered **in a spec**. It had
been *implemented* in the meantime, in a file whose own comment says it is answering that leftover. The
open list was right that no spec covered it and wrong that nothing did.

---

## 1 Why it matters more than a hue, and this is the part to read

`prompt.css` loads after `board.css`, and the two selectors have **the same specificity**: one class and
one qualifier each, `.square--track[data-pickable="true"]` against `.square--track:focus-visible` and
`.square--track[data-pickable="true"]`. So the later file wins every one of them. Three consequences, and
the second is a requirement rather than a look.

**1. The violet fill never appears.** The board looks exactly as it did before handoff 07 while a card is
being aimed. That is survivable: the existing treatment is coherent and shipped.

**2. D59's keyboard focus never appears either, and that is NFR-08.** The offer and the focus rings are
both built from `box-shadow`, so `prompt.css`'s offer overrides the focus rule as well. **A player can tab
across 36 fields and see nothing at all change.** Issue #45 gave a field a `tabindex` and an Enter
handler, so the reach works; the state does not. Nothing in the suite had ever asserted a focus treatment
on a field, because until #45 no field could be focused, so this went unnoticed until an end-to-end case
printed the colour it was actually measuring.

**3. The aura loses its hatch on any field that is offered.** `prompt.css:219` uses the `background`
**shorthand**, which resets `background-image`, and `background-image` is the layer D58 chose for the
It's Not That Deep hatch precisely because nothing else on `.square` used it. So the seven fields a player
most needs to see stop being hatched at the moment they are being offered a place to put a card.

**And one nobody has decided at all.** The `opacity: 0.45` dim applies to the 34 fields a trap card is not
offering, which means it dims the trap chips already standing on them, at exactly the moment D51 says
whose trap it is matters most.

---

## 2 What was done instead of guessing

**The package landed whole and untouched, and the D59 block sits in `board.css` doing nothing.** That was
the Product Owner's decision on 2026-09-03, over two alternatives:

| Option | Why it was not taken |
| --- | --- |
| Delete the conflicting rules from `prompt.css` | The earlier rule covers the **pawn** as well as the field and D59 speaks only about the field. It would leave a pickable pawn teal next to a violet field, and non-offered pawns dimmed next to undimmed fields. That is a design decision, and `CLAUDE.md` forbids this side from taking one |
| Hold `board.css` back until this is answered | `board.css` also carries the `--seat-shape` consolidation that `board-trap.css` needs to draw a trap's owner, so holding it would ship a trap mark that cannot say whose it is, which touches NFR-12 |
| Reorder the imports so `board.css` wins | Same objection as the first, taken silently instead of openly, and it would move a file whose position `board-trap.css` depends on |

**Two things in the repository record the current state so it cannot be mistaken for an oversight.**
`src/main.js`'s import comment states the collision where the cascade order is visible, and
`tests/e2e/field-keyboard.spec.js` carries a deliberate negative assertion that a focused field is drawn
identically to an offered one. **That case is meant to start failing when this brief is answered.** If it
goes red, the conflict is resolved and the thing to do is check the focus treatment against D59.

---

## 3 The DOM, which has not changed

Everything is as brief 07 § 3 promised it. No new element is needed and none is offered.

| Selector | Meaning |
| --- | --- |
| `.square--track[data-pickable="true"]` | This field may be clicked to answer the card being played. Up to 36 of the 40 for a trap card, all 40 for Janky RPG |
| `.square--track[tabindex="0"]` | The same field, reachable from the keyboard. Present only while it is pickable |
| `.pawn[data-pickable="true"]` | A **pawn** that may be clicked to answer a card. The half of the earlier rule D59 does not speak about |
| `.board[data-picking]` | A card is mid-play and the board is asking for something. `free-square` for the four trap cards, `track-square` for Janky RPG, and the pawn kinds for the other cards |
| `.square[data-trap-aura="true"]` | Inside an It's Not That Deep's reach, drawn by D58 as a `background-image` hatch |

---

## 4 The one open decision

**D61. How the pickable field and the pickable pawn are drawn, given that both questions have already
been answered once.**

Four parts, and the second is the one that blocks a requirement.

1. **Which answer wins for the field**, D59's violet or handoff 04's teal? If it is D59, say which rules
   in `prompt.css` are superseded and are to be deleted, by line. If it is the existing teal, say so and
   D59's block comes out of `board.css`; that is a legitimate answer and it is cheaper.
2. **What a focused field looks like, and it has to survive whatever answers part 1.** This is NFR-08 and
   it is currently unmet. D59's own construction argument stands whichever hue wins: the focus cannot be
   told from the offer by colour, because D11's focus ring and the offer are the same token, so it has to
   be told apart by construction. If the two treatments must live in two files, say which file owns which
   and in what order they load.
3. **The pawn, which D59 did not cover.** A pickable pawn is teal with a filled halo today, answering the
   same leftover from spec 03 § 5. If the field becomes violet, does the pawn follow? The two are never on
   screen at once for one card, but a player meets both across a match.
4. **The dim.** `prompt.css` dims every non-offered field and pawn; D59 rejects that for fields. Does it
   go for pawns too, and what happens to a trap chip standing on a dimmed field?

**One structural question comes with it, and it may be the more useful answer.** D23 has been open since
handoff 02: who owns the `board*.css` split. This conflict happened because board rules live in
`prompt.css`, which spec 04 § 1 itself flagged as "board CSS living in a prompt file" while naming it as
the seam to cut if that file ever passed 300 lines. It was filed as a size risk and it turned out to be a
place where two decisions could collide. If the answer is that those rules move into the board family,
that is worth saying, and `board-trap.css` has just established the criterion 07-spec § 2 records: the
split is by what puts a thing on the board, not by what the thing is drawn with.

---

## 5 The rules that apply to the delivery

The five standing ones from `00-open-requests.md` § 5, unchanged: no user-facing string in a `content:`
property; no CSS file over 300 lines after `npm run format`; built once, then only attributes rewritten;
two skins from the tokens with `prefers-reduced-motion` respected; and **no em dash**, in the spec or in a
CSS comment, neither the character nor the rhetorical habit.

Two that are specific to this one:

6. **Say which existing rules are superseded, by file and line.** This brief exists because a rule was
   answered twice without either side seeing the other, and the only defence is naming what is replaced.
7. **`prompt.css` is at 244 lines** and `board.css` at 268, so neither has much room. If the answer needs
   more than about thirty lines in either, split at a real seam and name it, as `board-trap.css` did.

---

## 6 What is out of scope

- **Everything handoff 07 already landed.** The trap chip, the blocker, the aura, the two pawn statuses
  and the announcement are on screen and are not reopened. Amend only where part 1's answer forces it.
- **The rules.** Which fields are offered and why is `core/` and the Game Design Document's. It is 36 of
  40 for a trap card: not a field that already holds an object, not a field a pawn is standing on, and
  not one of the four entry fields.
- **The six pawn statuses** other than `stunned` and `slippery`, which D57 gave a box and a position and
  which need inner geometry and an order. They are owed, not asked for here.
- **`--color-dormant` doing three jobs**, which spec 07 § 8 noticed and deliberately left. Worth looking
  at in the pass that answers the six statuses, since they all take the same ground.

---

## 7 The landing checks

The five standing ones, plus:

6. **`npx playwright test tests/e2e/field-keyboard.spec.js`.** The last case in that file asserts the
   current wrong outcome and is expected to **fail** once this lands. That is the signal, not a defect,
   and the case is rewritten into its opposite the way `trap-fires.spec.js`'s chip case was.
7. **`npx playwright test tests/e2e/trap-marks.spec.js`.** The aura case must stay green, including on a
   field that is being offered, which is the `background` shorthand finding in § 1.
8. **`npx playwright test tests/e2e/greyscale.spec.js`** with no expected-failure marker, since any change
   to `board.css` touches the file that now owns the one seat mapping.
