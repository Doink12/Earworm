import { describe, expect, it } from "vitest";
import { computeMonthlyPayouts } from "./monthlyPayouts";
import type { Artist } from "../types";

function artist(overrides: Partial<Artist> = {}): Artist {
  return {
    id: "a1",
    name: "Test Artist",
    genre: "Pop",
    location: "Nowhere",
    country: "USA",
    avatarColor: "#000",
    metrics: {
      spotifyFollowers: 0,
      spotifyListeners: 0,
      instagramFollowers: 0,
      ticketsSold: 0,
      tiktokFollowers: 0,
      soundcloudFollowers: 0,
      soundcloudStreams: 0,
      festivalsPlayed: 0,
    },
    scoreAtMonthStart: 50,
    rewardTiers: [],
    platformPointsThisMonth: 100,
    verificationStatus: "verified",
    ...overrides,
  };
}

describe("computeMonthlyPayouts", () => {
  it("computes the pool as $2 per active subscriber", () => {
    const { pool } = computeMonthlyPayouts([artist()], { a1: 50 }, 1000);
    expect(pool).toBe(2000);
  });

  it("splits the pool across artists proportional to points-weighted-by-growth", () => {
    const artists = [
      artist({ id: "a1", platformPointsThisMonth: 100, scoreAtMonthStart: 50 }), // growth 0 -> mult 1 -> weight 100
      artist({ id: "a2", platformPointsThisMonth: 100, scoreAtMonthStart: 40 }), // scoreNow 60, growth 0.5 -> weight 150
    ];
    const { rows } = computeMonthlyPayouts(artists, { a1: 50, a2: 60 }, 500);
    const a1 = rows.find((r) => r.artistId === "a1")!;
    const a2 = rows.find((r) => r.artistId === "a2")!;
    expect(a1.amount).toBeCloseTo(400, 6); // 1000 * 100/250
    expect(a2.amount).toBeCloseTo(600, 6); // 1000 * 150/250
  });

  it("sorts rows by payout amount, largest first", () => {
    const artists = [
      artist({ id: "small", platformPointsThisMonth: 10 }),
      artist({ id: "big", platformPointsThisMonth: 1000 }),
    ];
    const { rows } = computeMonthlyPayouts(artists, { small: 50, big: 50 }, 500);
    expect(rows.map((r) => r.artistId)).toEqual(["big", "small"]);
  });

  it("respects a minimum payout floor", () => {
    const artists = [
      artist({ id: "whale", platformPointsThisMonth: 10000 }),
      artist({ id: "tiny", platformPointsThisMonth: 1 }),
    ];
    const { rows } = computeMonthlyPayouts(artists, { whale: 50, tiny: 50 }, 100, 5);
    const tiny = rows.find((r) => r.artistId === "tiny")!;
    expect(tiny.amount).toBeGreaterThanOrEqual(5);
  });

  it("carries through the growth multiplier used for each artist's weight", () => {
    const artists = [artist({ id: "a1", scoreAtMonthStart: 50 })];
    const { rows } = computeMonthlyPayouts(artists, { a1: 60 }, 500); // +20% growth
    expect(rows[0].growthMultiplier).toBeCloseTo(1.2, 6);
  });
});
