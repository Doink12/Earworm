import type { Contribution } from "../types";

export interface ContributionGrowth {
  contribution: Contribution;
  growth: number; // G_i
}

/** G_i = (Score_now - Score_at_contribution_i) / Score_at_contribution_i */
export function contributionGrowth(
  contribution: Contribution,
  scoreNow: number,
): ContributionGrowth {
  const base = contribution.scoreAtContribution;
  const growth = base === 0 ? 0 : (scoreNow - base) / base;
  return { contribution, growth };
}

export interface LeaderboardEntry {
  userId: string;
  totalGrowthPoints: number; // rewards volume + good timing
  battingAverage: number; // rewards accuracy regardless of stake size
  totalPointsContributed: number;
}

/**
 * Aggregates one user's contributions (across every artist they've backed)
 * into the two leaderboard metrics from the spec.
 * `scoreNowByArtist` supplies each artist's current score, keyed by artist id.
 */
export function computeLeaderboardEntry(
  userId: string,
  contributions: Contribution[],
  scoreNowByArtist: Record<string, number>,
): LeaderboardEntry {
  const userContributions = contributions.filter((c) => c.userId === userId);

  let totalGrowthPoints = 0;
  let totalPointsContributed = 0;

  for (const c of userContributions) {
    const scoreNow = scoreNowByArtist[c.artistId];
    if (scoreNow === undefined) continue;
    const { growth } = contributionGrowth(c, scoreNow);
    totalGrowthPoints += c.points * growth;
    totalPointsContributed += c.points;
  }

  const battingAverage = totalPointsContributed === 0 ? 0 : totalGrowthPoints / totalPointsContributed;

  return { userId, totalGrowthPoints, battingAverage, totalPointsContributed };
}

export function rankLeaderboard<T extends LeaderboardEntry>(
  entries: T[],
  by: "totalGrowthPoints" | "battingAverage",
): T[] {
  return [...entries].sort((a, b) => b[by] - a[by]);
}
