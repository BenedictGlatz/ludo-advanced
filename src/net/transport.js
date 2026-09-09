/**
 * One shape for "a pipe that carries text", with two things behind it. Issue #42.
 *
 * `net/` may import `core/` and `state/`, never `ui/` or `i18n/`. This file imports nothing.
 *
 * The sessions in `host-session.js` and `guest-session.js` talk to a **transport** and never to an
 * `RTCDataChannel` directly. That is what lets a whole online match run in Vitest: `createLoopbackPair`
 * hands back two transports wired to each other inside one process, and the sessions cannot tell the
 * difference. The seam is the same one `deps.rng` cuts for the dice: the thing that reaches outside the
 * program is injected, so the program can be tested without it.
 *
 * The shape is `{ send(text), onMessage(fn), onClose(fn), close() }`. Listeners are lists, because the
 * session and the lobby both want to hear when a pipe closes.
 */

/** The listener lists every transport keeps, and the two ways of firing them. */
function listeners() {
  const message = [];
  const close = [];
  let closed = false;

  return {
    onMessage: (fn) => message.push(fn),
    onClose: (fn) => close.push(fn),
    deliver: (text) => {
      if (!closed) for (const fn of message) fn(text);
    },
    end: () => {
      if (closed) return;
      closed = true;
      for (const fn of close) fn();
    },
    isClosed: () => closed,
  };
}

/**
 * A transport over a real `RTCDataChannel`.
 *
 * The channel is taken as an argument rather than created here, so this file never names a browser API
 * and the function can be handed any object with `send`, `close` and the two `on*` properties.
 */
export function channelTransport(channel) {
  const ears = listeners();

  channel.onmessage = (event) => ears.deliver(event.data);
  channel.onclose = () => ears.end();
  channel.onerror = () => ears.end();

  return {
    send(text) {
      if (ears.isClosed()) return;
      channel.send(text);
    },
    onMessage: ears.onMessage,
    onClose: ears.onClose,
    close() {
      ears.end();
      channel.close();
    },
  };
}

/**
 * Two transports wired to each other, in one process.
 *
 * Delivery is **asynchronous on purpose**, one microtask later, because that is the property the real
 * channel has and the one a session is most likely to get wrong: a `send` never re-enters the caller
 * synchronously. A test that passed on a synchronous loopback could still deadlock on a real channel.
 */
export function createLoopbackPair() {
  const a = listeners();
  const b = listeners();

  const pipe = (mine, theirs) => ({
    send(text) {
      if (mine.isClosed()) return;
      queueMicrotask(() => theirs.deliver(text));
    },
    onMessage: mine.onMessage,
    onClose: mine.onClose,
    close() {
      mine.end();
      queueMicrotask(() => theirs.end());
    },
  });

  return [pipe(a, b), pipe(b, a)];
}
