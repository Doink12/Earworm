import type { RewardTier } from "../types";

export interface TierStatus extends RewardTier {
  unlocked: boolean;
  /** Points still needed to reach this tier; 0 once unlocked. */
  pointsRemaining: number;
}

/** Tier_n unlocked when cumulative points >= T_n. Unlocking never deducts points. */
export function tierStatuses(tiers: RewardTier[], cumulativePoints: number): TierStatus[] {
  return [...tiers]
    .sort((a, b) => a.threshold - b.threshold)
    .map((tier) => ({
      ...tier,
      unlocked: cumulativePoints >= tier.threshold,
      pointsRemaining: Math.max(0, tier.threshold - cumulativePoints),
    }));
}

export function nextLockedTier(tiers: RewardTier[], cumulativePoints: number): TierStatus | undefined {
  return tierStatuses(tiers, cumulativePoints).find((t) => !t.unlocked);
}
