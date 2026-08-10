import { describe, expect, it } from "vitest";
import { computeLeaderboardEntry, contributionGrowth, rankLeaderboard } from "./leaderboard";
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

describe("contributionGrowth", () => {
  it("computes G_i as (scoreNow - scoreAtContribution) / scoreAtContribution", () => {
    const { growth } = contributionGrowth(contribution({ scoreAtContribution: 40 }), 50);
    expect(growth).toBeCloseTo(0.25, 6);
  });
});

describe("computeLeaderboardEntry", () => {
  it("sums P_i * G_i across every contribution for total growth points", () => {
    const contributions = [
      contribution({ id: "c1", artistId: "a1", points: 50, scoreAtContribution: 40 }), // G=0.25 -> 12.5
      contribution({ id: "c2", artistId: "a2", points: 20, scoreAtContribution: 50 }), // G=0 (scoreNow 50) -> 0
    ];
    const entry = computeLeaderboardEntry("u1", contributions, { a1: 50, a2: 50 });
    expect(entry.totalGrowthPoints).toBeCloseTo(12.5, 6);
    expect(entry.totalPointsContributed).toBe(70);
  });

  it("computes batting average as total growth points divided by total points, independent of stake size", () => {
    const contributions = [contribution({ points: 100, scoreAtContribution: 40 })]; // G=0.25
    const entry = computeLeaderboardEntry("u1", contributions, { a1: 50 });
    expect(entry.battingAverage).toBeCloseTo(0.25, 6);
  });

  it("ignores other users' contributions", () => {
    const contributions = [contribution({ userId: "other", points: 999 })];
    const entry = computeLeaderboardEntry("u1", contributions, { a1: 50 });
    expect(entry.totalPointsContributed).toBe(0);
    expect(entry.battingAverage).toBe(0);
  });
});

describe("rankLeaderboard", () => {
  it("sorts descending by the chosen metric", () => {
    const entries = [
      { userId: "a", totalGrowthPoints: 5, battingAverage: 0.1, totalPointsContributed: 50 },
      { userId: "b", totalGrowthPoints: 20, battingAverage: 0.05, totalPointsContributed: 400 },
    ];
    expect(rankLeaderboard(entries, "totalGrowthPoints").map((e) => e.userId)).toEqual(["b", "a"]);
    expect(rankLeaderboard(entries, "battingAverage").map((e) => e.userId)).toEqual(["a", "b"]);
  });
});
