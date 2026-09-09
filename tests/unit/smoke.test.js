import { describe, it, expect } from "vitest";

// This test asserts nothing about the game. It exists to prove that Vitest is installed, that the
// config resolves, and that `npm test` runs and reports. It is a toolchain check and it is called
// one in the commit that adds it, rather than being dressed up as coverage.
describe("toolchain smoke test", () => {
  it("runs the test runner at all", () => {
    expect(1 + 1).toBe(2);
  });
});
