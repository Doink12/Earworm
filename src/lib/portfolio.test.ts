import { describe, expect, it } from "vitest";
import { computeHoldings, totalPointsInvested } from "./portfolio";
import type { Contribution } from "../types";

function contribution(overrides: Partial<Contribution> = {}): Contribution {
  return {
    id: "c1",
    userId: "u1",
    artistId: "a1",
    points: 50,
    month: "2026-07",
    date: "2026-07-01T00:00:00Z",
    scoreAtContribution: 40,
    ...overrides,
  };
}

describe("computeHoldings", () => {
  it("groups multiple contributions to the same artist into one holding", () => {
    const contributions = [
      contribution({ id: "c1", points: 40, scoreAtContribution: 40 }),
      contribution({ id: "c2", points: 60, scoreAtContribution: 60 }),
    ];
    const [holding] = computeHoldings("u1", contributions, { a1: 100 });
    expect(holding.cumulativePoints).toBe(100);
    // Points-weighted average entry: (40*40 + 60*60) / 100 = 52
    expect(holding.weightedEntryScore).toBeCloseTo(52, 6);
    expect(holding.growthSinceEntry).toBeCloseTo((100 - 52) / 52, 6);
  });

  it("keeps separate artists as separate holdings", () => {
    const contributions = [
      contribution({ artistId: "a1", points: 10 }),
      contribution({ artistId: "a2", points: 90 }),
    ];
    const holdings = computeHoldings("u1", contributions, { a1: 50, a2: 50 });
    expect(holdings).toHaveLength(2);
  });

  it("sorts holdings by cumulative points, largest first", () => {
    const contributions = [
      contribution({ artistId: "a1", points: 10 }),
      contribution({ artistId: "a2", points: 90 }),
    ];
    const holdings = computeHoldings("u1", contributions, { a1: 50, a2: 50 });
    expect(holdings.map((h) => h.artistId)).toEqual(["a2", "a1"]);
  });

  it("excludes other users' contributions", () => {
    const contributions = [contribution({ userId: "other" })];
    const holdings = computeHoldings("u1", contributions, { a1: 50 });
    expect(holdings).toHaveLength(0);
  });
});

describe("totalPointsInvested", () => {
  it("sums cumulative points across all holdings", () => {
    const holdings = computeHoldings(
      "u1",
      [contribution({ artistId: "a1", points: 30 }), contribution({ artistId: "a2", points: 20 })],
      { a1: 50, a2: 50 },
    );
    expect(totalPointsInvested(holdings)).toBe(50);
  });
});
