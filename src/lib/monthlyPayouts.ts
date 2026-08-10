import type { Artist } from "../types";
import { computePayouts, growthMultiplier, payoutPool, type ArtistMonthlyStats, type ArtistPayout } from "./payout";

export interface MonthlyPayoutRow extends ArtistPayout {
  pointsThisMonth: number;
  growthMultiplier: number;
}

export interface MonthlyPayoutSummary {
  pool: number;
  rows: MonthlyPayoutRow[];
}

/**
 * Runs the artist payout pool math (spec section 5) across the artist pool, sorted by
 * payout amount, largest first.
 */
export function computeMonthlyPayouts(
  artists: Artist[],
  scoreNowByArtist: Record<string, number>,
  activeSubscribers: number,
  minimumPayout = 0,
): MonthlyPayoutSummary {
  const stats: ArtistMonthlyStats[] = artists.map((a) => ({
    artistId: a.id,
    pointsThisMonth: a.platformPointsThisMonth,
    scoreStartOfMonth: a.scoreAtMonthStart,
    scoreEndOfMonth: scoreNowByArtist[a.id] ?? a.scoreAtMonthStart,
  }));

  const pool = payoutPool(activeSubscribers);
  const payouts = computePayouts(pool, stats, minimumPayout);
  const statsByArtist = new Map(stats.map((s) => [s.artistId, s]));

  const rows: MonthlyPayoutRow[] = payouts.map((payout) => {
    const stat = statsByArtist.get(payout.artistId)!;
    return { ...payout, pointsThisMonth: stat.pointsThisMonth, growthMultiplier: growthMultiplier(stat) };
  });

  rows.sort((a, b) => b.amount - a.amount);

  return { pool, rows };
}
