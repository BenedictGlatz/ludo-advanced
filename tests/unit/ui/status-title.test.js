/**
 * The sentence a pawn's tooltip says about its statuses. Issue #94.
 *
 * Tested here rather than left to Playwright for the same reason `player-labels.test.js` gives: the
 * wording has one key per status kind, and a kind with no wording would print `status.ghost` on a
 * hover, which nothing else in the suite reads. `initI18n` runs under `environment: "node"` with no DOM.
 */

import { beforeAll, describe, expect, it } from "vitest";

import { STATUS } from "../../../src/core/statuses.js";
import { initI18n } from "../../../src/i18n/index.js";
import { statusTitle } from "../../../src/ui/status-labels.js";

describe("statusTitle", () => {
  beforeAll(async () => {
    await initI18n("en");
  });

  it("is null for a pawn carrying nothing, so the attribute is removed rather than emptied", () => {
    expect(statusTitle([])).toBeNull();
  });

  it("names one status in one clause", () => {
    expect(statusTitle([STATUS.LOCKED])).toMatch(/^Locked in/);
  });

  it("joins several statuses in the order they are carried", () => {
    const title = statusTitle([STATUS.LOCKED, STATUS.ARMOURED]);

    expect(title.indexOf("Locked in")).toBeLessThan(title.indexOf("Armoured"));
  });

  /** Every kind in `STATUS` has a wording, and none of them leaks its key. */
  it("has a wording for every status kind", () => {
    for (const kind of Object.values(STATUS)) {
      expect(statusTitle([kind])).not.toContain("status.");
    }
  });
});
