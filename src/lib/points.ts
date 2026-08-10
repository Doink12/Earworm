import type { Contribution, MonthlyAllowance, User } from "../types";

export const MONTHLY_BASE_ALLOWANCE = 100;
export const MAX_CARRYOVER = 5;

/** Unused points above the carryover cap are lost when the next month starts. */
export function computeNextAllowance(previous: MonthlyAllowance): number {
  const leftover = previous.totalAllowance - previous.spent;
  const carryover = Math.max(0, Math.min(MAX_CARRYOVER, leftover));
  return MONTHLY_BASE_ALLOWANCE + carryover;
}

export function currentAllowance(user: User): MonthlyAllowance {
  const allowance = user.allowances.find((a) => a.month === user.currentMonth);
  if (!allowance) {
    throw new Error(`No allowance record for ${user.currentMonth}`);
  }
  return allowance;
}

export function remainingAllowance(user: User): number {
  const allowance = currentAllowance(user);
  return allowance.totalAllowance - allowance.spent;
}

/** Cumulative points a user has ever put behind one artist — never reset, never removed. */
export function cumulativePoints(user: User, artistId: string): number {
  return user.contributions
    .filter((c) => c.artistId === artistId)
    .reduce((sum, c) => sum + c.points, 0);
}

export interface ContributionInput {
  artistId: string;
  points: number;
  scoreAtContribution: number;
  date?: string;
}

/** Logs a contribution and deducts it from this month's allowance. Points are never returned. */
export function contribute(user: User, input: ContributionInput): User {
  const allowance = currentAllowance(user);
  const remaining = allowance.totalAllowance - allowance.spent;
  if (input.points <= 0) {
    throw new Error("Contribution must be a positive number of points");
  }
  if (input.points > remaining) {
    throw new Error(`Only ${remaining} points remaining this month`);
  }

  const contribution: Contribution = {
    id: `${user.id}-${input.artistId}-${Date.now()}`,
    userId: user.id,
    artistId: input.artistId,
    points: input.points,
    month: user.currentMonth,
    date: input.date ?? new Date().toISOString(),
    scoreAtContribution: input.scoreAtContribution,
  };

  const updatedAllowances = user.allowances.map((a) =>
    a.month === user.currentMonth ? { ...a, spent: a.spent + input.points } : a,
  );

  return {
    ...user,
    allowances: updatedAllowances,
    contributions: [...user.contributions, contribution],
  };
}
