/**
 * Composition root.
 *
 * This is the only file allowed to know about all four layers at once. Its job is to boot i18next,
 * build the game state with a dice source injected into it, and hand the state to the view. Nothing
 * in `core/`, `state/`, `ui/` or `i18n/` imports this file; the arrows all point inward.
 *
 * It is deliberately empty of behaviour for now. The pieces it will wire arrive in this order:
 *   - #64  i18n setup, so no string reaches a view untranslated
 *   - #26  board topology            (landed)
 *   - #28  movement rules
 *   - #29  capture
 *   - #27  game state and turn manager
 *   - #62  board view and event binding
 *
 * The RNG and the dice source enter here as arguments rather than being reached for inside the
 * rules, which is NFR-09 and what makes a scripted match assertable in a test.
 */

export function boot() {
  // Intentionally does nothing yet. The bootstrap commit proves the toolchain runs; it does not
  // pretend to run a game.
  return { booted: true };
}

boot();
