import { describe, expect, it } from "vitest";
import { computePayouts, growthMultiplier, payoutPool } from "./payout";
import type { ArtistMonthlyStats } from "./payout";

describe("payoutPool", () => {
  it("is $2 per active subscriber", () => {
    expect(payoutPool(1000)).toBe(2000);
  });
});

describe("growthMultiplier", () => {
  it("is 1 + growth for a positive month", () => {
    const stats: ArtistMonthlyStats = { artistId: "a1", pointsThisMonth: 100, scoreStartOfMonth: 50, scoreEndOfMonth: 60 };
    expect(growthMultiplier(stats)).toBeCloseTo(1.2, 6);
  });

  it("floors at 0.2 so a bad month can't zero an artist out", () => {
    const stats: ArtistMonthlyStats = { artistId: "a1", pointsThisMonth: 100, scoreStartOfMonth: 50, scoreEndOfMonth: 1 };
    expect(growthMultiplier(stats)).toBe(0.2);
  });

  it("is neutral (1) for a cold-start artist with no prior baseline", () => {
    const stats: ArtistMonthlyStats = { artistId: "a1", pointsThisMonth: 100, scoreStartOfMonth: null, scoreEndOfMonth: 60 };
    expect(growthMultiplier(stats)).toBe(1);
  });
});

describe("computePayouts", () => {
  it("splits the pool proportionally to Points_a * growth multiplier", () => {
    const artists: ArtistMonthlyStats[] = [
      { artistId: "a1", pointsThisMonth: 100, scoreStartOfMonth: 50, scoreEndOfMonth: 60 }, // weight 120
      { artistId: "a2", pointsThisMonth: 100, scoreStartOfMonth: 50, scoreEndOfMonth: 40 }, // weight 80
    ];
    const payouts = computePayouts(200, artists);
    expect(payouts[0].amount).toBeCloseTo(120, 6);
    expect(payouts[1].amount).toBeCloseTo(80, 6);
  });

  it("applies a minimum payout floor when set", () => {
    const artists: ArtistMonthlyStats[] = [
      { artistId: "a1", pointsThisMonth: 1000, scoreStartOfMonth: 50, scoreEndOfMonth: 60 },
      { artistId: "a2", pointsThisMonth: 1, scoreStartOfMonth: 50, scoreEndOfMonth: 50 },
    ];
    const payouts = computePayouts(100, artists, 5);
    expect(payouts[1].amount).toBeGreaterThanOrEqual(5);
  });
});
