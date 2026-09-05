# Handoff 14, brief: a bot playing a card

**From:** Claude Code
**To:** Claude Design
**Date:** 2026-09-04
**Read against:** `35993fe`, on branch `feature/82-bot-card-tactics`. Every line number below is that tree
**Issue:** #82, bots play skill cards tactically. Requirement FR-43
**Answers:** nothing. **D87 to D89**, and D87 is the one that is on screen today in the wrong colour

---

## 0 What has happened since brief 13, which was this morning

Brief 13 said, twice, that a bot plays no skill cards. **That is no longer true**, and both places in
that document now carry a dated correction pointing here. A bot prices every card in its hand against
the board it is looking at and plays the best one when it is worth more than keeping it, in its own turn
and in other people's.

So a bot's turn now has a third visible event in it, after the dice card and the move: **it plays a
card**, and something has to say so. That is D87, and unlike most questions in these briefs it is
already answered badly in the shipped build rather than missing.

**What the bot does, in one paragraph, because the design does not need the rest.** Every card is priced
in the same units as a move: one point is one step, getting a pawn out of the yard is 25, a capture is
60 or more. A card is played when it beats a threshold, so a bot holds a card that would do nothing on
this board, and a full hand lowers the threshold because the next draw would be thrown away. Two of the
29 cards are never played. A bot reads the board and how **many** cards everybody else holds, never
which ones.

---

## 1 Hard constraints

Unchanged from brief 13 section 1, and one of them is why this brief exists: **`CLAUDE.md` says Claude
Code does not invent design rules**, so where a design is missing the code borrows an existing one and
files a question rather than choosing a look.

Three things are borrowed today. Each is named where it is used and each is a question below.

| Borrowed | Used for | Because |
| --- | --- | --- |
| `--motion-trap-hold` (2 s) | How long a bot's card play stays on screen | It already means "reading time for something that happened without being asked" |
| `--motion-roll-hold` (900 ms) | The pause before a bot plays a card into a window | It is the same pause a bot's other decisions take, D81 |
| The message strip's default colour | The announcement itself | No rule exists for a fourth kind of message, and inventing one is not this side's to do |

---

## 2 The DOM contract

One element, one attribute, one sentence. `src/ui/move-hints.js` writes all three.

```html
<div class="message-strip" data-message-kind="card" data-reason-key="turn.cardPlayed">
  Bot 3 spielt Angel Die
</div>
```

- `data-message-kind` is the seam the strip's four kinds are told apart by. It already carries
  `refusal`, `trap` and `roll`; `card` is the fourth.
- `message-strip.css` styles `[data-message-kind="trap"]` and `[data-message-kind="roll"]` identically
  today: the panel colour with an ink dot, which is the strip's second voice, "the game is reporting
  something that happened". **Nothing styles `card`**, so it falls back to the first voice, orange with
  an orange dot, which the game reserves for "you cannot do that".
- The sentence comes from `ui.json`'s `turn.cardPlayed`, `"{{name}} spielt {{card}}"`. The name is
  `seatLabel`, so it says "Bot 3", and the card is its own title out of `cards.json`.

The strip is built once and only ever gets attributes, so a rule can rely on the element being there
with no kind at all most of the time.

---

## 3 Facts the design must match

1. **A card play is announced only for a bot.** A person who plays a card watched themselves do it, and
   announcing it would cost two seconds per card in every match including the all-human ones.
2. **The announcement is held for two seconds and then the turn carries on.** It is not dismissed by a
   click, and the player is not asked to acknowledge it.
3. **The strip is shared.** During the same turn it may also carry the roll's breakdown, which takes
   over once the die is rolled, and a trap report, which outranks everything except a refusal.
4. **A bot can play a card in somebody else's turn**, into a reaction window, and that is announced the
   same way. In that case the person whose turn it is is watching, and it is their move being answered.
5. **A bot plays at most one card per turn** (FR-23's budget), except after Double Dip, which buys one
   more.
6. **Roughly every other turn contains a card play** on the seeds measured so far, which is the number
   that decides whether two seconds is generous or intrusive.

---

## 4 Open decisions this handoff must answer

### D87. What a bot's card play looks like when it is announced. **This is the real commission.**

Today: the message strip, in `--color-warn`, for 2 s, saying "Bot 3 spielt Angel Die".

**The orange is wrong and the code knows it.** It is the colour of a refusal, and a bot playing a card
is not a refusal, it is the game reporting something. This is exactly the deviation issue #45 shipped
for the trap announcement, which D55 answered with two selectors giving that message the strip's second
voice. The cheapest answer here is the same two selectors.

Three things to decide, and the first is the only one that blocks anything:

1. **Which voice?** The second voice, panel colour with an ink dot, as the trap and the roll use, or
   something of its own. If something of its own, it needs a token: there is no third colour in
   `tokens.css` that means "an opponent did something to you".
2. **Should the card itself be shown**, rather than only named? The artwork exists, `card-view.js`
   renders it, and the reveal-on-hover work of handoff 10 already knows how to show a card large. A
   sentence is cheap and a card is unambiguous, and a sentence in the wrong colour is what ships today.
3. **Is two seconds right for a message that appears every other turn?** Brief 13's D81 asks the same
   question about the thinking pause, and the two add up: a bot turn with a card in it currently spends
   about four seconds of reading time before anything moves.

### D88. The pause before a bot answers a reaction window

A bot's decline is instant, deliberately: a window is a question put to somebody else, and three bots
each taking 900 ms to say no would put nearly three seconds in front of every capture a person makes.

**A bot playing a card into a window is not instant.** It waits `--motion-roll-hold`, 900 ms, then
plays, then holds the announcement for two seconds. So in the middle of a person's turn the game can
stop for nearly three seconds to report that a bot answered them.

Is that right? The alternatives are a shorter pause for a window than for a turn, no pause at all with
only the announcement's hold, or one pause for the whole window however many bots answer it.

### D89. Should a bot mark its target before the card resolves?

Twelve of the 29 cards name a pawn or a square: Yeet pushes an opponent's pawn back, a Banana Peel is
laid one square in front of somebody, Hyperbeam sweeps a lane. Today the card resolves and the board
simply changes, with the sentence naming the card but not what it was aimed at.

The board already has the marks: `data-legal-target` on a square, `data-selected` on a pawn, and the
pickable-field treatment from handoff 08 that a person sees while they aim a card themselves.

Should a bot's target be marked for the length of the announcement's hold, using the treatment a person
gets while aiming? This is D84 for cards rather than for pawns, and the two should be answered the same
way or the answer will look arbitrary. It costs `ui/` a mark and no rules change: the target is already
in the state.

---

## 5 Deliverables

The same shape as every earlier handoff: `14-spec-bot-cards.md` with a numbered answer per decision,
plus whatever CSS the answers imply, delivered into `src/ui/styles/` as usual. If D87 is answered with
the second voice, the deliverable is two selectors in `message-strip.css` and nothing else, which is a
perfectly good handoff.

---

## 6 Out of scope

- **Difficulty levels.** There is one bot and it plays one way. Not in FR-43 and not on the board.
- **How well the bot plays.** The value model is a rules question, and its reasons are in Ch. 06 of the
  documentation notes rather than in a design decision.
- **The setup screen** (D86 of brief 13, issue #76). Still open, still the real commission of that
  brief, and unchanged by this one: bots come from `?bots=` in the address bar today.
- **A bot's skill hand and dice hand** (D82 and D83 of brief 13). Both are still open and both now have
  a dated update pointing here, because the answers interact with D87.
