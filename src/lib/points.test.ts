import { describe, expect, it } from "vitest";
import { computeNextAllowance, contribute, cumulativePoints, remainingAllowance } from "./points";
import type { User } from "../types";

function baseUser(overrides: Partial<User> = {}): User {
  return {
    id: "u1",
    name: "Test",
    country: "USA",
    currentMonth: "2026-08",
    allowances: [{ month: "2026-08", totalAllowance: 100, spent: 0 }],
    contributions: [],
    watchlist: [],
    ...overrides,
  };
}

describe("computeNextAllowance", () => {
  it("carries over the unused amount when it's under the 5-point cap", () => {
    expect(computeNextAllowance({ month: "2026-07", totalAllowance: 100, spent: 97 })).toBe(103);
  });

  it("caps carryover at 5 points even if more is unused", () => {
    expect(computeNextAllowance({ month: "2026-07", totalAllowance: 100, spent: 40 })).toBe(105);
  });

  it("carries over 0 when the full allowance was spent", () => {
    expect(computeNextAllowance({ month: "2026-07", totalAllowance: 100, spent: 100 })).toBe(100);
  });
});

describe("contribute", () => {
  it("logs a contribution and deducts it from the current month's allowance", () => {
    const user = baseUser();
    const updated = contribute(user, { artistId: "a1", points: 30, scoreAtContribution: 50 });
    expect(remainingAllowance(updated)).toBe(70);
    expect(cumulativePoints(updated, "a1")).toBe(30);
  });

  it("accumulates points across multiple contributions to the same artist", () => {
    let user = baseUser();
    user = contribute(user, { artistId: "a1", points: 30, scoreAtContribution: 50 });
    user = contribute(user, { artistId: "a1", points: 20, scoreAtContribution: 55 });
    expect(cumulativePoints(user, "a1")).toBe(50);
  });

  it("rejects a contribution larger than the remaining allowance", () => {
    const user = baseUser({ allowances: [{ month: "2026-08", totalAllowance: 100, spent: 90 }] });
    expect(() => contribute(user, { artistId: "a1", points: 20, scoreAtContribution: 50 })).toThrow();
  });

  it("rejects a non-positive contribution", () => {
    const user = baseUser();
    expect(() => contribute(user, { artistId: "a1", points: 0, scoreAtContribution: 50 })).toThrow();
  });
});
