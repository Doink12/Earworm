import type { Artist, ArtistMetrics, MetricKey } from "../types";

/**
 * Weights confirmed in the Earworm scoring spec (section 1).
 * Ranked by influence on the composite score; sums to 1.
 */
export const METRIC_WEIGHTS: Record<MetricKey, number> = {
  spotifyFollowers: 0.222,
  spotifyListeners: 0.194,
  instagramFollowers: 0.167,
  ticketsSold: 0.139,
  tiktokFollowers: 0.111,
  soundcloudFollowers: 0.083,
  soundcloudStreams: 0.056,
  festivalsPlayed: 0.028,
};

export const METRIC_LABELS: Record<MetricKey, string> = {
  spotifyFollowers: "Spotify Followers",
  spotifyListeners: "Spotify Listeners",
  instagramFollowers: "Instagram Followers",
  ticketsSold: "Tickets Sold",
  tiktokFollowers: "TikTok Followers",
  soundcloudFollowers: "SoundCloud Followers",
  soundcloudStreams: "SoundCloud Streams",
  festivalsPlayed: "Festivals Played",
};

const METRIC_KEYS = Object.keys(METRIC_WEIGHTS) as MetricKey[];

/**
 * norm_i = 100 * (log10(x+1) - log10(min+1)) / (log10(max+1) - log10(min+1))
 * Falls back to 100 when every artist in the pool ties on this metric,
 * since the log-range collapses to zero (0/0 is otherwise undefined).
 */
export function normalizeMetric(value: number, min: number, max: number): number {
  const logMin = Math.log10(min + 1);
  const logMax = Math.log10(max + 1);
  const range = logMax - logMin;
  if (range === 0) return 100;
  return (100 * (Math.log10(value + 1) - logMin)) / range;
}

export interface MetricBreakdown {
  key: MetricKey;
  value: number;
  normalized: number;
  weight: number;
  weighted: number;
}

export interface ScoreResult {
  score: number;
  breakdown: MetricBreakdown[];
}

/**
 * Computes each artist's composite 0-100 score relative to the pool passed in.
 * Min/max are taken across `pool` per metric, so scores shift whenever the
 * pool's extremes change (the open normalization-stability question in the spec).
 */
export function computeScores(pool: ArtistMetrics[]): ScoreResult[] {
  const ranges = METRIC_KEYS.reduce((acc, key) => {
    const values = pool.map((a) => a[key]);
    acc[key] = { min: Math.min(...values), max: Math.max(...values) };
    return acc;
  }, {} as Record<MetricKey, { min: number; max: number }>);

  return pool.map((metrics) => {
    const breakdown: MetricBreakdown[] = METRIC_KEYS.map((key) => {
      const { min, max } = ranges[key];
      const normalized = normalizeMetric(metrics[key], min, max);
      const weight = METRIC_WEIGHTS[key];
      return { key, value: metrics[key], normalized, weight, weighted: normalized * weight };
    });
    const score = breakdown.reduce((sum, b) => sum + b.weighted, 0);
    return { score, breakdown };
  });
}

export function computeScoreForArtist(artist: Artist, pool: Artist[]): ScoreResult {
  const metricsPool = pool.map((a) => a.metrics);
  const idx = pool.findIndex((a) => a.id === artist.id);
  const results = computeScores(metricsPool);
  return results[idx];
}

/** Month-over-month growth, used for the profile screen's growth badge and payouts. */
export function growthRate(scoreNow: number, scoreThen: number): number {
  if (scoreThen === 0) return 0;
  return (scoreNow - scoreThen) / scoreThen;
}
