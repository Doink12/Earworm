export const SUBSCRIBER_PAYOUT_RATE = 2; // $ per active subscriber, per month

export function payoutPool(activeSubscribers: number): number {
  return SUBSCRIBER_PAYOUT_RATE * activeSubscribers;
}

/** Growth multiplier floor of 0.2 keeps one bad month from zeroing an artist's share out. */
const GROWTH_MULTIPLIER_FLOOR = 0.2;

export interface ArtistMonthlyStats {
  artistId: string;
  pointsThisMonth: number; // Points_a
  scoreStartOfMonth: number | null; // null => cold start, no prior baseline
  scoreEndOfMonth: number;
}

export function growthMultiplier(stats: ArtistMonthlyStats): number {
  // New artist with no baseline yet: neutral multiplier until a real one exists.
  if (stats.scoreStartOfMonth === null || stats.scoreStartOfMonth === 0) return 1;
  const growth = (stats.scoreEndOfMonth - stats.scoreStartOfMonth) / stats.scoreStartOfMonth;
  return Math.max(1 + growth, GROWTH_MULTIPLIER_FLOOR);
}

export interface ArtistPayout {
  artistId: string;
  weight: number; // Payout_Weight_a
  share: number; // Artist_Share_a
  amount: number; // Artist_Payout_a ($)
}

export function computePayouts(
  pool: number,
  artists: ArtistMonthlyStats[],
  minimumPayout = 0,
): ArtistPayout[] {
  const weights = artists.map((a) => ({
    artistId: a.artistId,
    weight: a.pointsThisMonth * growthMultiplier(a),
  }));
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);

  return weights.map(({ artistId, weight }) => {
    const share = totalWeight === 0 ? 0 : weight / totalWeight;
    const amount = Math.max(pool * share, minimumPayout);
    return { artistId, weight, share, amount };
  });
}
