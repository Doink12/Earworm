import { describe, expect, it } from "vitest";
import { computeScores, growthRate, normalizeMetric } from "./scoring";
import type { ArtistMetrics } from "../types";

function metrics(overrides: Partial<ArtistMetrics> = {}): ArtistMetrics {
  return {
    spotifyFollowers: 100,
    spotifyListeners: 100,
    instagramFollowers: 100,
    ticketsSold: 100,
    tiktokFollowers: 100,
    soundcloudFollowers: 100,
    soundcloudStreams: 100,
    festivalsPlayed: 100,
    ...overrides,
  };
}

describe("normalizeMetric", () => {
  it("maps the pool minimum to 0", () => {
    expect(normalizeMetric(10, 10, 1000)).toBeCloseTo(0, 6);
  });

  it("maps the pool maximum to 100", () => {
    expect(normalizeMetric(1000, 10, 1000)).toBeCloseTo(100, 6);
  });

  it("returns 100 when every artist ties on the metric (no log-range to divide by)", () => {
    expect(normalizeMetric(50, 50, 50)).toBe(100);
  });
});

describe("computeScores", () => {
  it("gives an artist trailing on every metric a score of 0 and one leading on every metric a score of 100", () => {
    const pool = [
      metrics({
        spotifyFollowers: 1,
        spotifyListeners: 1,
        instagramFollowers: 1,
        ticketsSold: 1,
        tiktokFollowers: 1,
        soundcloudFollowers: 1,
        soundcloudStreams: 1,
        festivalsPlayed: 1,
      }),
      metrics({
        spotifyFollowers: 1_000_000,
        spotifyListeners: 1_000_000,
        instagramFollowers: 1_000_000,
        ticketsSold: 1_000_000,
        tiktokFollowers: 1_000_000,
        soundcloudFollowers: 1_000_000,
        soundcloudStreams: 1_000_000,
        festivalsPlayed: 1_000_000,
      }),
    ];
    const [low, high] = computeScores(pool);
    expect(low.score).toBeCloseTo(0, 5);
    expect(high.score).toBeCloseTo(100, 5);
  });

  it("normalizes ties (equal values across the pool) to 100 for that metric rather than dividing by zero", () => {
    const pool = [metrics({ spotifyFollowers: 1 }), metrics({ spotifyFollowers: 1_000_000 })];
    const [low] = computeScores(pool);
    // Every metric but spotifyFollowers ties at 100 across the pool, so those all normalize to 100;
    // only the spotifyFollowers weight (22.2%) contributes 0 for the trailing artist.
    expect(low.score).toBeCloseTo(100 * (1 - 0.222), 5);
  });

  it("ranks a mid-pool artist strictly between the pool extremes", () => {
    const pool = [metrics({ spotifyFollowers: 100 }), metrics({ spotifyFollowers: 10_000 }), metrics({ spotifyFollowers: 1_000_000 })];
    const [low, mid, high] = computeScores(pool);
    expect(mid.score).toBeGreaterThan(low.score);
    expect(mid.score).toBeLessThan(high.score);
  });
});

describe("growthRate", () => {
  it("computes positive growth", () => {
    expect(growthRate(110, 100)).toBeCloseTo(0.1, 6);
  });

  it("computes negative growth", () => {
    expect(growthRate(90, 100)).toBeCloseTo(-0.1, 6);
  });

  it("returns 0 instead of dividing by zero when the baseline score is 0", () => {
    expect(growthRate(50, 0)).toBe(0);
  });
});
