import type { Contribution } from "../types";

export interface Holding {
  artistId: string;
  cumulativePoints: number;
  /** Points-weighted average score across every contribution to this artist — your "entry price". */
  weightedEntryScore: number;
  scoreNow: number;
  /** Growth relative to your own entry, not the artist's month-over-month growth. */
  growthSinceEntry: number;
  /** Sum of P_i * G_i for this artist only — same unit as the leaderboard's Total Growth Points. */
  growthPoints: number;
}

/** Groups one user's contributions by artist into a holdings list, most-invested first. */
export function computeHoldings(
  userId: string,
  contributions: Contribution[],
  scoreNowByArtist: Record<string, number>,
): Holding[] {
  const byArtist = new Map<string, Contribution[]>();
  for (const c of contributions) {
    if (c.userId !== userId) continue;
    const list = byArtist.get(c.artistId) ?? [];
    list.push(c);
    byArtist.set(c.artistId, list);
  }

  const holdings: Holding[] = [];
  for (const [artistId, cs] of byArtist) {
    const scoreNow = scoreNowByArtist[artistId];
    if (scoreNow === undefined) continue;

    const cumulativePoints = cs.reduce((sum, c) => sum + c.points, 0);
    const weightedEntryScore =
      cs.reduce((sum, c) => sum + c.points * c.scoreAtContribution, 0) / cumulativePoints;
    const growthSinceEntry =
      weightedEntryScore === 0 ? 0 : (scoreNow - weightedEntryScore) / weightedEntryScore;
    const growthPoints = cs.reduce((sum, c) => {
      const g = c.scoreAtContribution === 0 ? 0 : (scoreNow - c.scoreAtContribution) / c.scoreAtContribution;
      return sum + c.points * g;
    }, 0);

    holdings.push({ artistId, cumulativePoints, weightedEntryScore, scoreNow, growthSinceEntry, growthPoints });
  }

  return holdings.sort((a, b) => b.cumulativePoints - a.cumulativePoints);
}

export function totalPointsInvested(holdings: Holding[]): number {
  return holdings.reduce((sum, h) => sum + h.cumulativePoints, 0);
}
