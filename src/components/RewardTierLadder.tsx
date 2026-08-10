import type { RewardTier } from "../types";
import { tierStatuses } from "../lib/tiers";

export function RewardTierLadder({ tiers, cumulativePoints }: { tiers: RewardTier[]; cumulativePoints: number }) {
  const statuses = tierStatuses(tiers, cumulativePoints);

  return (
    <div className="card">
      <p className="section-title">Reward tiers</p>
      <div className="tier-ladder">
        {statuses.map((tier, i) => (
          <div className="tier-row" key={tier.id}>
            <div className={`tier-marker ${tier.unlocked ? "unlocked" : "locked"}`}>
              {tier.unlocked ? "✓" : i + 1}
            </div>
            <div className="tier-body">
              <div className="tier-title">{tier.title}</div>
              <div className="tier-desc">{tier.description}</div>
              <div className="tier-progress">
                {tier.unlocked
                  ? `Unlocked at ${tier.threshold} pts`
                  : `${cumulativePoints} / ${tier.threshold} pts`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
