import { formatPercent } from "../lib/format";

export function GrowthBadge({ growth }: { growth: number }) {
  const isPositive = growth >= 0;
  return (
    <span className={`growth-badge ${isPositive ? "positive" : "negative"}`}>
      {isPositive ? "▲" : "▼"} {formatPercent(growth)} this month
    </span>
  );
}
