# Handoff 19, brief: the online lobby, three screens and the seats at the table

**From:** Claude Code
**To:** Claude Design
**Date:** 2026-09-10
**Read against:** `272e36e`, on branch `feature/101-online-bots`. Every line number below is that tree
**Issues:** #42, online multiplayer (FR-42), and #101, bots on the free seats of an online match (FR-43)
**Answers:** nothing. Asks **D116 to D122.** It is the brief the status block of 2026-09-09 in
`00-open-requests.md` said was owed and never wrote

---

## 0 Why this brief is the wrong way round, like brief 13 was

Usually a brief describes something that does not exist yet. The online lobby exists, is shipped on `dev`
and has three end-to-end tests on it. It was built on 2026-09-09 **without a handoff**, four working days
before the freeze, on the same exception `pool.css` took in the first week of September: existing patterns
and tokens only, a header that says "placeholder", and a promise that the brief follows. The journal of
2026-09-09 records the exception; this file keeps the promise.

One day later, issue #101 put a second thing into the same lobby without a handoff either: the line-up's
two-position control on the rows of seats nobody has joined, so the host can hand a seat to the computer.
That was spec 15's component unchanged on a second screen, and the CSS change was four selectors naming
`[data-screen="host"]` beside `[data-screen="lineup"]`. It is recorded in the 2026-09-10 status block of
`00-open-requests.md` and folded into this brief, so that the lobby you draw knows about bots from the
start rather than learning about them from a correction.

**So what is being asked is not "draw a lobby" but "replace a placeholder that works".** Everything below
that says how the lobby looks today is a description of what will be thrown away, kept so that you know
what the words currently carry and what the look could carry instead.

---

## 1 The flow: three screens, one overlay, and who is who

**There is still no router.** Which screen is up is one closure variable in `src/ui/match-flow.js`, a
screen is opened by `openScreen(OVERLAY_SCREEN.X)`, and what a button means is one line in
`src/ui/session-actions.js`. The online screens are three more values of `data-screen` on the one overlay
component (D38), and nothing else moved.

```
main menu (S1)                  three doors: hotseat, online, settings
  online click                  session-actions.js line 63       -> online-flow.open()
online door       "online"      Join, Host (primary), Back
  host click                    -> the host's lobby, asking for a count
  join click                    -> the guest's lobby
host lobby        "host"        count buttons 2, 3, 4 (the setup screen's), Back
  count click                   -> the same screen, now with seat rows, an invite code, a reply field
  ... one code exchange per guest, and the Bot switch on any seat nobody joins (issue #101)
  start click                   -> the match, on every connected screen at once
guest lobby       "join"        invite field, Connect (primary), Back
  connect                       -> the same screen, now with a reply code to copy, waiting for the host
  (the host's Start)            -> the match, arriving unasked
```

**How the codes work, because the words on screen have to explain it.** WebRTC needs the two browsers to
swap a description of themselves before a direct connection exists. There is no server, so the players
are the postal service: the host's browser produces an **invite code**, a few hundred characters of
base64 on one line; the host sends it through any chat; the guest pastes it and gets a **reply code**;
the guest sends that back; the host pastes it and presses Connect; the channel opens. Three or four
players repeat the exchange once per guest, each on a fresh connection. The plan is in
`docs/project-management/online-multiplayer-plan.md` § "How starting a game works".

**Who is who.** The host is always seat 0 and its row says "Du (Host)". Guests take the free seats in
join order. Since #101 a seat nobody joins can be a **bot**, played by the host's computer; the bot is
still seat 1, 2 or 3 and keeps that number in its name ("Bot 3 (Grün)"), exactly as on the line-up.

**Four facts about the flow a drawing has to respect:**

| Fact | Where | Consequence |
| --- | --- | --- |
| The overlay's controls are **rebuilt on every screen change and on every language switch** | `overlay-view.js`, the reason in its header | Nothing may animate a control's arrival. A textarea is rebuilt too: `overlay-regions.js` lines 105 to 112 remember what was typed into a writable one and put it back, so a half-pasted code survives a redraw |
| The keyboard goes to the **first `.overlay__button`** when a screen opens | `overlay-view.js` | On the host's screen that is the first seat row's Bot switch, if a seat is free. Say if Copy or Connect should have it instead |
| A code is produced **after** the browser has finished gathering its network candidates | `signal-codes.js` line 30, up to 5 seconds | The host's screen shows "Code wird erzeugt …" for up to five seconds with nothing to click. That is a real waiting state |
| The channel may **never** open, and nothing in the browser says so | `host-role.js` line 41, 20 seconds | After twenty seconds the host's sentence changes to the NAT explanation. That is the one failure a player will actually meet |

---

## 2 What the repository already decides here, so nothing is answered twice

| Already decided | Where | Status in this brief |
| --- | --- | --- |
| **One overlay component**, told apart by `data-screen`; a screen may have its own stylesheet without becoming a second component | D38, `menu.css`, `lineup.css` | Unchanged. `lobby.css` is that stylesheet for `online`, `host` and `join`, and it is the placeholder this brief replaces |
| **Pre-match screens are an opaque curtain** | `overlay.css` | The three online screens are pre-match screens and take the curtain today |
| **At most one primary button per screen** | `overlay.css` | Host on the door, Start on the host's screen once everybody is in, Connect on the guest's. Confirm or move them |
| **A seat is identified by a colour and a dot, never by colour alone** (NFR-12, D97) | spec 01, spec 16 | Binding on the seat rows. They are the line-up's rows and inherit it |
| **A bot keeps its seat's number**, and the row renames itself when switched | spec 15, D96.2 | Binding. `player.named` and `player.botNamed` are reused unchanged |
| **The two-position control**: `aria-pressed` carries the state, the unchosen position lies flat, the refused position is `disabled` in `--color-dormant` | spec 15, D91 and D93 | **Reused on the host's rows since #101.** Whether it should look identical there is D120 |
| **A dead control is `disabled`, with the reason as permanent text on screen** rather than a spoken refusal | D77.2, D93 | The Bot position of the last free seat is `disabled` while no guest is in, and the idle sentence states the rule (issue #101) |
| **The chrome sits above the overlay** and keeps only the language button on a menu screen | D42, `chrome-view.js` | The top right is occupied, as on the menu |
| **A guest's Pause pauses only their screen; the host's pauses everybody** | journal 2026-09-09 | The pause screen gained one sentence for each. Not this brief's screen, but its words are in § 6 |
| **Play Again is the host's button only** | journal 2026-09-09 | The guest's win screen shows Quit alone. Not this brief's screen either; listed so the asymmetry is known |
| **Hands are not hidden online** ("we trust our friends") | journal 2026-09-09 | Nothing on the lobby says so, and D122 asks whether something should |

---

## 3 The measurements

The root text size is `min(100vw / 100, 100vh / 56.25)`, **14.4 px** at 1440 by 900, on a fitted stage of
1440 by 810 px (`app.css`).

| Thing | Where | At 14.4 px |
| --- | --- | --- |
| The host and join panels | `lobby.css` lines 22 to 27, `--overlay-panel-w: 44rem`, the line-up's width | 633.6 px wide |
| The door's panel | the default, `overlay.css` | 432 px wide |
| A textarea | `lobby.css` lines 66 to 80, three rows, `--font-num`, `--text-sm` | about 3 lines of 12.6 px monospaced text, wrapping |
| A seat row | `lineup.css` lines 80 to 92 and `lobby.css` line 38, four tracks `auto 1fr auto auto` | plate, name, status word, control |
| The two-position control | `lineup.css` line 128, `14rem` | 201.6 px wide |
| A status word | `lobby.css` lines 42 to 52, `--text-sm`, muted, ink once connected | 12.6 px |
| The longest word on the screen | `online.addGuest`, "Nächsten Spieler einladen" | one button |
| A code | `signal-codes.js`: deflate-raw, base64url | typically 300 to 600 characters, one line, no spaces |

**The worst case is the host's screen with four seats, an invite out and the Bot switch on two rows**:
title, a two-sentence paragraph, four rows of plate, name, status and a 201.6 px control, two labelled
textareas of three rows each, then Copy, Connect and Back. It fits the 810 px stage today with room to
spare, and it is a lot of different kinds of thing in one card. The join screen is the opposite: one
field, one button, and a long wait.

---

## 4 The facts the screens must obey

| Fact | Value |
| --- | --- |
| Seats and which they are | 2 players on seats 0 and 2, 3 on 0 to 2, 4 on 0 to 3, as everywhere |
| The host | always seat 0, always a person, never switchable |
| A guest | takes the first seat that is neither the host's, nor a bot's, nor taken |
| A bot (issue #101) | any seat nobody has joined, switched by the host; never a seat a guest already holds |
| The floor of persons online | **two**: the host plus at least one guest. A host alone against bots is refused, because it is a hot-seat match by a detour (`lobby-seats.js`, `canBeBot(…, 2)`) |
| So the last free seat while no guest is in | its Bot position is `disabled` |
| Start is offered when | every seat is spoken for, by a guest or a bot, and at least one is a guest |
| A code | copy, never read. The Copy button is mandatory; the textarea exists so a player sees that something long was pasted whole |
| Connection stages | `gathering`, `waiting`, `connecting`, `connected`; failures `badCode`, `failed`, `nat` (20 s), and `lost` |
| `stale` | a stage with a sentence in both languages and **no code that sets it**. Nothing detects an expired code today; the `failed` sentence tells the player to make a new one |
| A dropped guest | ends the match for everybody. There is no reconnect, and a bot does not take the seat over |
| What a guest sees while waiting | its own screen only. It does not see the host's seat rows and does not know who else is coming until the first state arrives |

---

## 5 The DOM contract as built

All of it exists and all of it is yours to keep, re-scope, or replace. Where a decision below would need
an element that is not listed, name it in the spec and we add it.

| Selector | Meaning | Note |
| --- | --- | --- |
| `.overlay[data-screen="online"]`, `"host"`, `"join"` | The three screens | Values of `OVERLAY_SCREEN` |
| `.overlay__seat[data-player="N"]` | One row of the host's table | The line-up's row, colour and dot from `data-player` |
| `.overlay__seat[data-controller="human"]`, `"bot"` | What plays that seat | `hud-view.js`'s word, reused |
| `.overlay__seat[data-status="host"]`, `"connected"`, `"waiting"`, `"bot"` | The lobby's word for the row | `lobby.css` reads it for the status word's colour today |
| `.overlay__seat-status` | The status word inside the row | Muted while waiting, ink once connected or host |
| `.overlay__button[data-action="controller"][data-seat="N"][data-value="human"|"bot"]` with `aria-pressed` | The two-position control, on `waiting` and `bot` rows only | Spec 15's control, unchanged; `disabled` on the Bot position of the last free seat while no guest is in |
| `.overlay__fields` | The region the text fields live in | Hidden while empty |
| `.overlay__field` | A `<label>` over a textarea | |
| `.overlay__field-label` | The label's text | |
| `.overlay__textarea[data-field="invite"|"reply"]`, `[readonly]` | The code | Readonly is the one to copy, writable the one to paste into |
| `.overlay__button[data-action="copy"][data-field="…"]` | Copy the named field | Its label flips to "Kopiert" until the next redraw of the stage |
| `.overlay__button[data-action="connect"][data-field="…"]` | Paste done, connect | Reads the named field |
| `.overlay__button[data-action="add-guest"]` | Invite the next player | Present while a seat is free and no invite is out |
| `.overlay__button[data-action="start-online"]` | Start | The host's one primary, present once everybody is in |
| `.overlay__button[data-action="host"][data-count="N"]` | The three count buttons on the host's screen | The setup screen's, reused |
| `.overlay__button[data-action="host"]`, `"join"`, `"back"` | The door's buttons and Back everywhere | |
| `.overlay__text` | The one sentence under the title | Carries **everything** about the connection today: the stage, the error, the hint, and since #101 the bot rule. D118 is about that |

What we are **not** offering:

- **No new game state.** The lobby is view state in `host-role.js` and `guest-role.js`; nothing about it
  reaches `core/` or the wire.
- **No string in CSS.** Every word is a locale key in both languages (§ 6).
- **No lobby chat, no player name, no avatar, no ready check.** None exists and none is in FR-42.
- **No hidden hands, no reconnect, no relay server.** Each is a known limitation in `CHANGELOG.md`. A
  design may say them better; it cannot remove them.

---

## 6 The words on the screens today

The `online` block of `src/i18n/locales/de/ui.json` and `en/ui.json`, so you can see what the words are
made to carry. Every one is replaceable; say which.

| Key | German today | Carries |
| --- | --- | --- |
| `online.title`, `online.text` | "Online-Mehrspieler", one paragraph explaining host, code and chat | The door |
| `online.host`, `online.join`, `online.back` | "Partie eröffnen", "Partie beitreten", "Zurück" | The door's three buttons |
| `online.hostTitle`, `online.joinTitle` | the same two words as the buttons | The two lobbies' titles |
| `online.playerCount` | "Wie viele spielen mit, dich eingerechnet?" | The host's screen before a count |
| `online.inviteLabel`, `online.replyLabel` | "Einladungscode", "Antwortcode" | The two field labels |
| `online.copy`, `online.copied`, `online.connect` | "Kopieren", "Kopiert", "Verbinden" | The buttons beside the fields |
| `online.addGuest`, `online.start` | "Nächsten Spieler einladen", "Partie starten" | The host's two flow buttons |
| `online.seat.host`, `.waiting`, `.connected`, `.bot` | "Du (Host)", "Wartet auf Verbindung", "Verbunden", "Bot" | The status word on a row |
| `online.stage.gathering` … `.stale` | "Code wird erzeugt …", "Wartet auf die Antwort der anderen Seite.", "Verbindet …", "Verbunden.", "Die Verbindung ist abgebrochen.", "Der Code ist abgelaufen. Erzeuge einen neuen." | The one sentence, by stage |
| `online.hint.host`, `.join` | how to use the codes, one sentence each | The one sentence when idle |
| `online.hint.hostBots` | "Sitze, an die niemand kommt, kannst du auf Bot stellen. Mindestens ein Mitspieler muss verbunden sein." | Appended to the host's idle sentence while a seat is free or a bot (issue #101) |
| `online.hint.nat` | "Ohne Vermittlungsserver klappt die Verbindung nicht hinter jedem Router." | Unused today; `online.error.nat` carries the case |
| `online.error.badCode`, `.failed`, `.nat`, `.version` | the four failures in one sentence each | The one sentence, on failure. `.version` is written but nothing sets it yet |
| `pause.online.host`, `.guest` | who is paused by a Pause | The pause screen, online only |
| `intent.rejected.not-your-seat`, `.not-your-turn`, `.loop-owned`, `.paused` | why the host refused | The message strip on a guest's board, not the lobby |

---

## 7 The open decisions

### D116. Is the door a fourth thing, or is it the main menu's Online door grown?

Today the Online door on the main menu opens a screen with a title, a paragraph and two more doors,
Host and Join. That is a door behind a door.

1. **Keep the door screen**, and give it a look: it is the one place the whole idea (one hosts, codes
   travel by chat) can be said before anybody is committed to anything.
2. **Fold Host and Join into the main menu's Online door**, so the choice is made on S1 and the door
   screen disappears. Fewer clicks, and one less `data-screen`; the paragraph would have to go
   somewhere or be lost.
3. If it stays: does it look like the menu's card language (12c) or like the setup screen it precedes?

### D117. The host's table: what is a seat row when it can be four different things?

A row is the host, a connected guest, a free seat waiting for somebody, or a bot. Today all four are the
line-up's row with a status word, and two of them also carry spec 15's control.

1. **How do the four states read at a glance**, and without colour (NFR-12)? Today: the same row, a word
   at the end, and a control or its absence.
2. **Does a connected guest look different from a free seat in more than the word?** "Verbunden" versus
   "Wartet auf Verbindung" is the whole difference now.
3. **Does the status word and the control share the row, or does the word give way to the control on a
   free seat?** `lobby.css` line 38 gives the row four tracks so both fit; whether both should be there
   is yours.
4. **Where does the row say which seat plays first?** Turn order is seat order and the host is seat 0.
   Nothing on the screen says so, and online the seats are on different screens, so nobody can point.

### D118. The one sentence that carries everything

`.overlay__text` under the host's title is, in turn, a hint, a stage ("Code wird erzeugt …"), a failure
("Nach 20 Sekunden keine Verbindung …"), and since #101 a hint with a second sentence about bots. On the
join screen the same slot is a hint, then "Wartet auf den Host." for as long as it takes.

1. **Does a connection stage deserve a mark on the seat row** it belongs to, rather than a sentence for
   the whole screen? `data-status` on the row already exists for it.
2. **Does a failure deserve `--color-warn`**, and if so which: a wrong code is the player's, the twenty
   seconds is the network's, a lost connection is nobody's.
3. **Does the `gathering` wait deserve motion?** Up to five seconds with nothing to click, and
   `prefers-reduced-motion` applies. Nothing moves today.
4. **Where does the bot rule live** once the sentence is redesigned: with the rows, as the line-up does
   (D91.4), or nowhere, because the `disabled` position says it?

### D119. The codes: a thing to copy, never to read

A code is a few hundred base64 characters in a three-row textarea in the numeric face, with the
button's chrome. It is there so the player sees that something long arrived or was pasted whole.

1. **Is a textarea the right object for a thing nobody reads?** Alternatives: a single-line field that
   shows the first and last characters, a "code ready" tile whose only control is Copy, or the textarea
   kept because pasting into a visible field is what people trust.
2. **Copy and Connect sit in the actions row under both fields today**, each naming its field with
   `data-field`. Should each button sit beside its own field?
3. **"Kopiert" flips back on the next redraw**, which is the next stage change. Is that the right
   duration, and is a label change enough of a confirmation?
4. **The paste field on the guest's screen is the whole screen** for a moment. Does it deserve to be
   larger, or a drop target, or is the one field right?

### D120. The Bot switch on a lobby row: identical to the line-up's, or a lobby variant?

Issue #101 put spec 15's control on the host's free rows unchanged, and the four `lineup.css` rules now
name `[data-screen="host"]` too. The line-up's rows are all switchable; here only some are, and the
refusal rule is different (two persons, not one).

1. **Same look, same size?** 201.6 px is a fifth of the panel, on a row that also carries a status word.
2. **Should a bot row look like a bot row in the match** (D85 of brief 13, still open) rather than like
   a line-up row set to Bot? This is the second screen that has to say "the computer sits here", and it
   would be good if the two agreed.
3. **What tells the host why the last free seat's Bot position is dead** while nobody is in? Today one
   sentence in the paragraph, on the D93 precedent. Confirm or replace.

### D121. Waiting, and the two ways it ends badly

Online play is mostly waiting: for the code to be made, for a friend to answer a chat, for the channel to
open, for the host to press Start. The two failures the player will meet are the twenty seconds and a lost
connection, and the second one ends the match on the win screen with `data-outcome="abandoned"`.

1. **What does "waiting for the other side" look like** on each screen, when it may take minutes because
   the other side is in a chat window?
2. **The twenty-second failure**: does the screen offer a way out other than Back, for example "make a
   new code" in place, and how loud is it?
3. **A dropped guest mid-match**: the win screen says abandoned. Should it say who left? The state knows
   the seat; the words today do not name it.

### D122. What the lobby should say about its limitations, if anything

Three are written into `CHANGELOG.md`: every browser holds the whole match, so hands are not really
hidden; no relay server, so some routers fail; no reconnect. The lobby says the second when it happens
and never the other two.

1. **Does the lobby state "hands are visible to anyone who looks"** before the match, or is the
   changelog enough? The Product Owner's ruling was "we trust our friends".
2. **Is "no reconnect" a sentence a host should read before pressing Start**, or only after somebody has
   dropped?

---

## 8 Deliverables

| File | What |
| --- | --- |
| `design/handoff/19-spec-online-lobby.md` | The spec. D116 to D122, one answer each, each with its reason and its named rejected alternative, following the five-section template in `design/README.md` |
| `src/ui/styles/lobby.css` | **Replaced**, not amended. It is a placeholder and says so in its header (116 lines on `272e36e`) |
| A diff for `lineup.css` if D120 changes the control on the host's rows | A diff, not a whole file. The four rules at lines 144, 160, 183 and 193 name both screens today |
| A diff for `overlay.css` or `tokens.css` if either changes | A diff, not a whole file, standing since handoff 11 |
| Artboards, if more than one direction is worth looking at | Optional. If drawn, **draw the host's screen with four seats, one guest connected, one bot and an invite out**, which is the case with every kind of row and both fields on it, and the join screen during its long wait |

---

## 9 The rules that apply to the delivery

The five standing ones from `00-open-requests.md` § 5: no user-facing string in a `content:` property;
no CSS file over 300 lines after `npm run format`; built once, then only attributes rewritten; two skins
from the tokens with `prefers-reduced-motion` respected; **no em dash**, neither the character nor the
habit.

Four specific to this one:

6. **Room in the files.** On `272e36e`: `overlay.css` 233 lines, `lineup.css` 238, `tokens.css` 229 after
   its split, `lobby.css` 116. A new token has room; a new `overlay.css` rule has little.
7. **The control is spec 15's.** If D120 changes it on the host's rows, say what stays shared, because
   `seatChoices` in `lineup-screen.js` builds it for both screens from one function and we would rather
   keep that than fork it.
8. **The wait states are real time.** ICE gathering is up to five seconds and the NAT timeout is twenty;
   a treatment that assumes either is instant will be wrong on every real network.
9. **Name the commit you read us against.** `272e36e` is at the top of this file.

---

## 10 What is out of scope

- **The protocol, the codes' format, the twenty seconds and the five.** All are `src/net/`'s and
  `host-role.js`'s and were decided with the Product Owner on 2026-09-08. The lobby explains them; it
  does not change them.
- **A relay server, reconnect, hidden hands, a lobby server.** Each is a rejected alternative in the
  journal of 2026-09-09 with its reason, and none is a design question.
- **A bot taking over a dropped guest's seat, and a difficulty per bot.** Both declined under #101 and
  recorded in the journal of 2026-09-10; the second is also the open 2026-09-06 status block.
- **How the match looks on a guest's screen.** A remote seat is drawn exactly as a bot's seat is (face
  down, not clickable, no curtain), and how a bot looks in play is D85 of brief 13, still open.
- **The main menu's three doors** (spec 12) and the setup screen's count buttons, both reused here as
  they are.

---

## 11 The landing checks

The five standing ones from `00-open-requests.md` § 6, plus:

6. **`npx playwright test tests/e2e/online.spec.js --project=chromium`.** Three cases drive the real lobby
   through `data-action`, `data-field`, `data-status`, `data-controller` and `[data-seat][data-value]`;
   every one of those attributes is in the contract above and a rename needs the spec to say so.
7. **`npx vitest run tests/unit/ui/lobby-screen.test.js tests/unit/ui/lobby-seats.test.js`.** They
   assert what the screens offer and which rows carry the control. A spec that removes a button or moves
   the rule changes them, and that is our work, listed so the author knows the words have tests.
8. **The `gathering` state, watched at least once on a real network**, because nothing in the test suite
   waits five seconds for a code on purpose.
9. **1440 by 900, and one check in the dark skin**, because a code in `--font-num` on the surface token is
   the first long monospaced text the game has shown.
