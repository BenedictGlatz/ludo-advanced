# Plan: Online multiplayer over WebRTC (option C), FR-42 / issue #42

> **Status: executed on 2026-09-09** on branch `feature/42-online-multiplayer`. Written the day before at
> the repository root; moved here with the implementation so the plan and the options document sit
> together. Where the code deviates from the plan the journal's 2026-09-09 decision block says so.

## Context

FR-42 reads "Online multiplayer with a lobby", acceptance criterion "two browsers on different
machines play one match", `should have`, 13 points. On 2026-09-08 the team weighed six
architectures in [Online-Multiplayer-Options.md](Online-Multiplayer-Options.md) and did not decide.
The Product Owner has now picked **option C: WebRTC peer-to-peer, host-authoritative, whole
state travels**, and answered the document's open decisions:

| Open decision | Answer |
| --- | --- |
| Signaling | **Manual codes.** No server, no new dependency. Host and guest swap two text blobs via any chat. |
| Seats | **Up to 4 players.** Star topology: the host holds one connection per guest. Two players is the first milestone, 3 and 4 add only lobby plumbing. |
| Bots online | **No bots in v1.** Humans only. Bots would run on the host later without touching the network. **Done on 2026-09-10, issue #101, exactly that way:** the lobby seats them, `src/net/` did not change. |
| Hidden hands | **"We trust our friends."** Every browser holds the full state. Written into CHANGELOG as a known limitation. |
| New layer | `src/net/` is added. It may import `core/` and `state/`, never `ui/` or `i18n/`. Decision block in the journal, CLAUDE.md architecture block updated. |
| Dependency | **None.** `RTCPeerConnection` is a browser API. One public STUN server (`stun:stun.l.google.com:19302`) is listed so codes carry public addresses; without it only the same network works. That is an external service, not a dependency, and is named in the journal. |

**Why host-authoritative whole state, not lockstep intents.** Only the host owns
`deps = { rng, diceSource }` (the mutable 20 dice cards and the mulberry32 counter). Guests never
roll or shuffle, so nothing outside the frozen state has to be serialised and a guest can never
drift out of sync. Lockstep needs identical `deps` on every peer and identical intent order; the
options document scored it higher on report value, but it is the harder thing to get right in the
time left. Recorded as the rejected alternative. A serialised 4-player state is about 4 KB, worst
case under 6 KB, so one data-channel message per accepted intent needs no chunking.

## How starting a game works (the player's view)

WebRTC needs a "signaling" step before a direct connection exists: the browsers must swap a
description of themselves (an SDP offer and answer with network candidates). With manual codes,
the players are the signaling server.

```
HOST                                          GUEST
Menu > Online Multiplayer > Host a match      Menu > Online Multiplayer > Join a match
App builds an RTCPeerConnection, creates an
offer, waits until ICE gathering is complete,
shows the INVITE CODE with a Copy button.
Status: "Waiting for the reply code".
Host sends the code via Discord/WhatsApp  ->  Guest pastes the INVITE CODE, presses Connect.
                                              App creates the answer, waits for gathering, shows
                                              the REPLY CODE with a Copy button.
                                              Status: "Waiting for the host".
Host pastes the REPLY CODE, presses Connect <- Guest sends the reply code back via chat.
Data channel opens. Lobby row: "Seat 2: connected".
For 3 or 4 players the host presses "Add player"
and repeats the exchange once per guest, with a
fresh RTCPeerConnection each time.
Host presses "Start match". App runs
startMatch(playerCount, deps) with no bots and
sends every guest `hello` (its seat, all seats,
the reaction window length) followed by the
first `state`.                                Guest receives them, mounts the board, sees the
                                              host's first turn begin.
```

From here both boards follow the host's clock. Each browser controls only its own seat: on another
seat's turn the board is not clickable and the hand on show is face down, exactly as a bot's is
today. Nobody sees a handover curtain, because every player has their own screen. Seats are
assigned in join order from `seatsFor(playerCount)`: host is seat 0, guests take the rest.

Facts the lobby text must state (and the journal records):

- A code is compressed (browser `CompressionStream`, deflate-raw) and base64url-encoded so it
  pastes as one line. A copy button is mandatory.
- No TURN server exists, so two players behind strict NATs may fail to connect. The lobby says so
  when the channel does not open within 20 s ("NAT can fail" in the options document).
- Codes go stale after a few minutes; the lobby tells the host to make a new one if that happens.
- No reconnect in v1. A dropped guest abandons the match for everyone (`abandonMatch`), and the
  win screen shows the abandoned state.
- A guest's Pause only pauses their own screen. The host's Pause pauses the match for everyone:
  the host broadcasts `paused`/`resumed` and refuses guest intents meanwhile.
- Play Again is the host's button only. The guest's win screen offers Quit.

## Architecture

### The one seam, two roles

`dispatch(` appears once in `src/ui/`, at `game-loop.js:116` inside `apply(intent)`. Two roles
are built around that:

**Host** runs the ordinary `createGameLoop` with full `deps`, timers, the 30 s reaction clock and
bots (none in v1). Two additions: its dispatcher broadcasts the new state after every accepted
intent, and intents arriving from guests enter the loop through a new `submit(intent)` method
(apply + advance), after validation.

**Guest** runs a **mirror loop** (`src/ui/online/guest-loop.js`) with the same public surface the
flow calls on a loop (`start, refresh, stop, pause, resume, arrive, passTurn, getState`) but: it
never auto-advances a phase, never runs bots, never owns the reaction clock. Its `apply(intent)`
sends the intent to the host and returns `true`; the echo is a `state` message that replaces its
state and re-renders. It reuses the existing controls, target picker, renderer, waits and events
unchanged.

### `isLocal(seat)`: a remote human is a bot to the UI, not to the AI

Every UI guard that asks `isBot(state, seat)` today is made to ask an injectable `isLocal(seat)`
carried in the loop `wiring`. Default `seat => !isBot(getState(), seat)`, so hot-seat is unchanged
and existing unit tests stay green. Online: `seat => localSeats.includes(seat)`. Result on every
browser: another player's seat is unclickable, its hand never face up, no curtain. `bot-driver.js`
keeps asking `decide` only for `state.bots`, so the AI never moves a remote human.

### Things in the current code that fight the design (each has a fix below)

| Where | Problem | Fix |
| --- | --- | --- |
| `handover.js:84` seeds `viewerSeat = humanSeats(state)[0]` | On a guest the viewer becomes the host's seat, so the guest's own hand is face down all match | seed with first `isLocal` seat |
| `handover.js:97` `needsCurtain` | Host would raise the curtain and pause whenever the guest is asked anything | `if (!isLocal(seat)) return false` |
| `card-controls.js:225, 258` use `seatOnShow` as the acting seat | Guest's Decline would send a decline for the host's seat | guard with `isLocal(seatOnShow(state))` |
| `turn-waits.js` only runs from `advance()` | Guest never calls `endRoll`, so `data-rolling` sticks and dice cards become unclickable after the first roll; no cast animation | guest calls `waits.takeMoment(next)` on every incoming state |
| `card-controls.js:106` `syncClock` only runs from `handleWindow` | Guest has no countdown; if it runs the clock, it would dispatch `close-window` | guest calls `syncClock()` on every incoming state; guest session refuses loop-owned intents locally |
| `intents-cards.js:148` `intent.seat ?? state.activePlayer` | A guest could omit `seat` and play as the active player | host guard requires `seat` explicitly |
| `game-loop.js:213` `afterTurn` callback closes over `state` | Breaks once the state cell moves into a store | callback reads `store.getState()` when it fires |
| `session-actions.js:52-53` RESTART / QUIT | Guest Play Again would build a local match with a null rng; Quit does not tell the other side | host-only restart, `online.leave()` on quit |
| `overlay-view.js` at 297 lines, no text field region | Lobby needs textareas | split out `overlay-regions.js` |
| `tests/e2e/menu.spec.js:62, 100` assert the online door is disabled | Goes red when the door opens | update the expected list |
| `eslint.config.js` has no `src/net/**` block | New layer needs its import ban and browser globals | add block |
| CLAUDE.md: a new screen is Claude Design's job | The lobby is a new screen | write a brief in `01-Design/Handoff/00-open-requests.md`, ship a plain version on existing overlay patterns and tokens, record the exception in the journal |
| `submit()` while the host's pause or pool overlay is up | `advance()` would restart timers under the overlay | `submit` refuses while paused |

## Changes, file by file

### 1. `src/state/auto-steps.js` (new, pure)

`autoIntent(state)` returns the intent the loop takes by itself, or `null`: `skip-action` in the
action phase with no playable card, `roll-die` in `roll`, `close-window` in `reaction`; `null`
while a reaction window is open. Plus `LOOP_OWNED_INTENTS = [roll-die, close-window, end-turn]`.
This replaces the three `if` blocks at `game-loop.js:190-210` and `mechanicalIntent` in
`tests/unit/ai/bot-match.test.js` (whose comment already asks for this), and it is what the host
guard uses to refuse guest duplicates. Lives in `state/` because `net/` may not import `ui/`.

### 2. `src/ui/loop-store.js` (new) and `src/ui/game-loop.js`

Move the state cell, `apply` and `getState` out of `game-loop.js` into
`createLoopStore({ initialState, deps, dispatcher = dispatch, localSeats = null })` returning
`{ getState, apply, replace, isLocal }`. `replace(next)` is used only by the guest. The seam is the
sentence in game-loop's own header: "the only stateful thing in ui/: it holds the current state
object and hands intents to state/".

`createGameLoop` gains options `dispatcher` and `localSeats` (passed to the store), puts `isLocal`
into `wiring`, replaces the three self-taken `if` blocks with one `autoIntent` block, and exposes
`submit(intent)` = `store.apply` then `advance()`, refusing while `paused` (a flag set in `pause`,
cleared in `resume`). Every read of `state` in `advance()` becomes `const state = store.getState()`
at the top, except the `afterTurn` callback, which reads the store when it fires. Lands near 289
lines.

### 3. `isLocal` through the siblings

- `loop-parts.js`: pass `isLocal: wiring.isLocal` to `createTurnControls` (the others spread wiring).
- `turn-controls.js` `playableBy`: `isLocal(state.activePlayer)` instead of `!isBot(...)`.
- `card-controls.js`: `onSkillCardActivated` guards `isLocal(seatOnShow(state))`; Skip guards
  `isLocal(state.activePlayer)`; `onDecline` guards `isLocal(seatOnShow(state))`.
- `handover.js`: seed `viewerSeat = getState().seats.find(isLocal) ?? null`; `needsCurtain`
  returns false for a non-local seat; line 140 becomes `if (isLocal(seat)) viewerSeat = seat`.
  All with the `!isBot` default so `tests/unit/ui/handover.test.js` and
  `turn-controls.test.js` pass unchanged.

### 4. `src/ui/match-setup.js` (new) and `src/ui/match-flow.js`

Move the construction in `freshMatch` and `playAgain` into pure builders
`freshMatchParts(rng, playerCount, { botSeats, botCount, stack })` and `restartParts(state, rng)`,
each returning `{ state, deps }` (`matchDeps(rng, createDicePool())` plus `startMatch` or
`restartMatch`). Three callers now (hot-seat, Play Again, online host) and jQuery-free, so "one
pool per match" becomes a unit test.

`beginMatch(nextState, nextDeps, { createLoop = createGameLoop, loopOptions = {} } = {})` sets
`state` and `deps`, builds parts, calls `createLoop({ ...usual, ...loopOptions })` and **returns
the loop**. match-flow adds `const online = createOnlineFlow({ openScreen, drawShell, beginMatch,
rng, delays })` beside `lineup`, passes `online` to `createSessionActions` and to
`screenDescription`, calls `online.leave()` in `quitToMenu`, and routes `playAgain` to
`online.playAgain()` when online is active. Lands near 287 lines.

### 5. `src/net/` (new layer, headless, Vitest-tested)

| File | Exports | Purpose |
| --- | --- | --- |
| `protocol.js` | `MESSAGE`, `encode`, `decode` | Wire shapes: `hello { seat, seats, windowMs, version }`, `state { seq, state, pool: { remaining } }`, `intent { seq, intent }`, `refused { seq, reason }`, `paused`, `resumed`, `bye`. `decode` returns `null` on bad JSON or unknown kind. |
| `transport.js` | `channelTransport(dataChannel)`, `createLoopbackPair()` | Same shape `{ send, onMessage, onClose, close }`; the loopback pair delivers via microtask so a whole match runs in Vitest. |
| `signal-codes.js` | `encodeSignal({ type, sdp })`, `decodeSignal(code)`, `waitForIceComplete(pc)` | deflate-raw + base64url. Non-trickle ICE: a code is produced only after gathering is complete, so one paste carries every candidate. |
| `webrtc-link.js` | `createHostLink({ iceServers })`, `createGuestLink({ iceServers })` | Host: `invite() -> code`, `accept(replyCode) -> transport`. Guest: `join(inviteCode) -> { replyCode, ready }`. One ordered `RTCDataChannel("ludo")`. `RTCPeerConnection` is taken from an injected factory so the state machine is testable with a fake. |
| `intent-guard.js` | `guestIntentRefusal(state, intent, guestSeats)` | The table below. |
| `host-session.js` | `createHostSession({ transports, guestSeats, poolRemaining, onLost })` → `{ dispatcher, attach(loop), detach(), broadcastPause(bool) }` | `dispatcher` = `dispatch` then broadcast `state` to every guest on accept. `attach` routes each guest's `intent` through the guard and `loop.submit`, answering `refused` when either says no. One transport per guest, tagged with its seat. |
| `guest-session.js` | `createGuestSession({ transport })` → `{ apply, onHello, onState, onRefused, onPaused, onClose, poolRemaining }` | `apply` refuses `LOOP_OWNED_INTENTS` locally, refuses while one intent is in flight (avoids a double `select-pawn` before the echo), otherwise sends and returns `true`. |

Host validation (`intent-guard.js`, every row unit-tested):

| Intent from a guest | Allowed when | Otherwise |
| --- | --- | --- |
| `choose-die`, `select-pawn`, `commit-move` | `activePlayer` is that guest's seat and no window is open | `not-your-turn` |
| `skip-action` | as above and `autoIntent(state) === null` | `not-your-turn` / `loop-owned` |
| `play-card { seat, cardId, target }` | `seat` is an integer and that guest's; then `cardRefusal(state, seat, cardId)` from `intents-cards.js` decides | `not-your-seat` or the card reason |
| `decline-reaction { seat }` | `seat` is that guest's and in `reactionWindow.eligible` | `not-your-seat` / `not-eligible` |
| `roll-die`, `close-window`, `end-turn` | never; the host loop and clock own them | `loop-owned` |
| anything else | never | `unknown-intent` |

`dispatch` then re-checks everything against the host's state anyway; the guard adds only "who sent
it" and "what the loop owns". Reasons are i18n keys under `intent.rejected.*` so the guest's message
strip can print them.

### 6. `src/ui/online/guest-loop.js` (new, about 120 lines)

`createGuestLoop({ initialState, deps, parts, delays, localSeats, session, onMatchOver })`:
store with `dispatcher = (state, intent) => ({ accepted: session.apply(intent), state })`; wiring
with `resume: render`; `createLoopParts` unchanged (bots and handover idle). On `session.onState`:
`store.replace(next)`, `cards.syncClock()`, halt and `onMatchOver` if not running, else
`waits.takeMoment(next)` or `render()`. `stop`/`pause` halt, `resume` renders, `arrive`/`passTurn`
are no-ops. Guest `deps` is `{ rng: null, diceSource: stub }` where the stub has `handSize: 3`,
`remaining: () => session.poolRemaining()`, and `draw`/`returnHand` throw. Nothing on the guest
calls `startMatch`, so `assertDeps` never runs.

### 7. Lobby: `src/ui/online/online-flow.js`, `lobby-screen.js`, overlay, menu

- `overlay-vocabulary.js`: `OVERLAY_SCREEN` gains `ONLINE`, `HOST`, `JOIN`; `OVERLAY_ACTION` gains
  `HOST`, `JOIN`, `CONNECT` (carries the pasted code as `value`), `COPY`, `ADD_GUEST`,
  `START_ONLINE`; `BACK` becomes context-aware in `session-actions.js` (online screens → `leave()`
  + MENU). Update the doc comment saying nothing handles `ONLINE`.
- `overlay-regions.js` (new, split from `overlay-view.js`): the rebuilt regions `setCards`,
  `setSeats`, plus new `setFields($overlay, fields)` rendering `{ name, label, value, readonly }`
  as `<label>` + `<textarea data-field>`. `overlay-view.js` keeps the shell and lands near 250.
- `events.js` `bindOverlayEvents`: a button carrying `data-field` passes that textarea's value.
- `lobby-screen.js` (pure): descriptions for ONLINE (Host primary, Join, Back), HOST (player
  count 2 to 4, seat rows with status, invite field + Copy, reply field + Connect, Add player,
  Start match, Back), JOIN (invite field + Connect, then reply field + Copy, Back). Three `case`s
  in `overlay-screens.js`.
- `online-flow.js` (the `lineup.js` pattern, links injectable): `open`, `host(playerCount)`,
  `addGuest`, `connect(code)`, `join`, `copy`, `start`, `leave`, `snapshot`, `active`,
  `playAgain`. Host `start`: `freshMatchParts(rng, playerCount, { botSeats: [] })`,
  `createHostSession`, `beginMatch(state, deps, { loopOptions: { dispatcher, localSeats: [0] } })`,
  `attach(loop)`, send `hello` and the first `state`. Guest on first `state`:
  `beginMatch(state, stubDeps, { createLoop: createGuestLoop wrapper, loopOptions: { localSeats } })`.
  Guest takes `delays.reaction` from `hello.windowMs` so both countdown rings agree.
- `menu-screen.js`: drop `disabled: true` on ONLINE; `session-actions.js`: `ONLINE → online.open()`.
- `winScreen` gets `{ canRestart }`; guest shows Quit only.
- `src/ui/styles/lobby.css` for `.overlay__fields`, tokens only, imported after `overlay.css`.
- Locales `de/ui.json`, `en/ui.json`: replace `menu.online.hint`; new top-level `online` block
  (title, text, host, join, back, playerCount, seatRow, inviteLabel, replyLabel, copy, copied,
  connect, addGuest, start, stage.{gathering,waiting,connecting,connected,lost,stale}, hint.{host,join,nat},
  error.{badCode,failed,version}); `intent.rejected.{not-your-seat,not-your-turn,loop-owned,paused}`;
  pause screen online line. `tests/unit/i18n/locales.test.js` enforces parity.

### 8. Tooling

- `eslint.config.js`: `src/net/**` block banning `**/ui/**`, `**/i18n/**`, `jquery`, `i18next`;
  globals `RTCPeerConnection`, `RTCSessionDescription`, `CompressionStream`, `DecompressionStream`,
  `btoa`, `atob`, timers. No `document`/`window`.
- `vitest.config.js`: coverage include `src/net/**`, exclude `src/net/webrtc-link.js` (browser API,
  covered by Playwright).
- CLAUDE.md architecture block: add `net/` and its import rule.

## Tests

- Unit: `state/auto-steps`, `net/intent-guard` (every table row, built with `stateFor` from
  `tests/helpers/fixtures.js`), `net/signal-codes` (round trip, garbage → null),
  `net/protocol`, `ui/match-setup` (two fresh matches never share a pool), `ui/online-flow` with
  fake links (host with 1, 2, 3 guests, join, bad code, leave, `beginMatch` called with the right
  `localSeats` per role).
- **Whole online match in Vitest**, `tests/unit/net/loopback-match.test.js`, modelled on
  `tests/unit/ai/bot-match.test.js`: loopback pair, host session on a fake headless loop
  (`dispatch` + `autoIntent` + `end-turn`), guest session on the other end, both seats driven by
  `decide` (with the seat added to a `bots` view so the policy answers). Assert guest state
  deep-equals host state after every echo, a guest `roll-die` is refused with the host state
  untouched, a guest `choose-die` on the host's turn is refused, the match reaches `WON` with the
  same winner, and a mid-match 4-player state serialises under 16 KB.
- **Playwright** `tests/e2e/online.spec.js`, chromium first (`test.skip` on other engines,
  recorded as outstanding): two `browser.newContext()` pages; host opens the lobby, the test reads
  the invite textarea and fills it into the guest, reads the reply back into the host; both boards
  show two players; host plays turn one with `tests/e2e/turn-helpers.js`; guest sees its seat
  active with a face-up hand and picks a dice card; host board moves. Two contexts in one Chromium
  connect over 127.0.0.1 with no STUN; if ICE stalls on CI add
  `--disable-features=WebRtcHideLocalIpsWithMdns`. Give the invite textarea a 10 s expect timeout
  for gathering.
- Existing hot-seat unit and E2E suites stay green: every new option has a default that reproduces
  today's behaviour. Fix `tests/e2e/menu.spec.js` for the opened door.

## Sequencing (each step leaves the suite green)

1. `state/auto-steps.js` + test; `ui/loop-store.js`; refactor `game-loop.js`. No user-visible change.
2. `isLocal` through loop-parts, turn-controls, card-controls, handover.
3. `ui/match-setup.js`; `beginMatch(state, deps, options)` returning the loop.
4. `net/protocol`, `transport`, `intent-guard`, `host-session`, `guest-session` + the loopback
   match test. The design is proven here without a browser.
5. `ui/online/guest-loop.js`.
6. `overlay-regions.js` split, fields, events value, vocabulary, `lobby-screen.js`,
   `online-flow.js`, locales, menu door, `menu.spec.js`. Two players end to end.
7. `net/signal-codes.js`, `net/webrtc-link.js`, `lobby.css`, Playwright two-context spec.
8. Add player loop in the lobby for 3 and 4 seats; loopback test with two guests.
9. Docs and changelog (below), final commit `Closes #42`.

## Documentation and process (mandatory steps)

- AI prompt log entry in `00-Meta/AI-Prompts/lbolender/2026-09-08.json` first thing in
  implementation (not writable in plan mode).
- Notes: `06-state-and-turn-flow.md` (auto-steps, loop-store, `submit`, `isLocal`, guard rules),
  `04-frontend-building-blocks.md` (guest loop, lobby, online flow, the three splits),
  `03-tech-stack.md` (WebRTC as browser API, STUN, no dependency), `08-quality.md` (loopback
  harness, chromium-only E2E and why), `01-requirements-and-goals.md` (FR-42 decision).
- `project-journal.md` decision block "2026-09-08: FR-42 is built as option C": rejected
  lockstep, PeerJS, relay; the `src/net/` layer and import rule; hands not hidden; NAT and
  stale-code risks; lobby built without a design handoff and why.
- `01-Design/Handoff/00-open-requests.md`: brief for the lobby screen look.
- `CHANGELOG.md` `[Unreleased]`: Added (online multiplayer, 2 to 4 players, manual invite codes);
  known limitations (every browser holds every hand, no TURN, no reconnect, guest pause is local).
- `Online-Multiplayer-Options.md` header: "Decided 2026-09-08: option C, see journal."
- Branch `feature/42-online-multiplayer` off `dev`; Conventional Commits per step; push only when asked.

## Verification

1. `npm test`, `npm run test:coverage` (floor holds for core, state, ai, net), `npm run lint`,
   `npm run build`.
2. `npx playwright test tests/e2e/online.spec.js --project=chromium`, then the full
   `npm run test:e2e`.
3. Manual: two browser windows on one machine via `npm run preview`, swap codes, play to a capture,
   a reaction window answered by the guest, and a win. Then one real run across two machines on
   different networks to learn whether STUN alone connects; write the result into notes/08.
