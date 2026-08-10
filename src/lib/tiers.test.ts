import { describe, expect, it } from "vitest";
import { nextLockedTier, tierStatuses } from "./tiers";
import type { RewardTier } from "../types";

const tiers: RewardTier[] = [
  { id: "t1", threshold: 50, title: "Early access", description: "" },
  { id: "t2", threshold: 150, title: "Unreleased song", description: "" },
  { id: "t3", threshold: 300, title: "Signed merch", description: "" },
];

describe("tierStatuses", () => {
  it("marks tiers unlocked only once cumulative points meet the threshold", () => {
    const statuses = tierStatuses(tiers, 150);
    expect(statuses.map((s) => s.unlocked)).toEqual([true, true, false]);
  });

  it("reports points remaining for locked tiers, 0 for unlocked ones", () => {
    const statuses = tierStatuses(tiers, 38);
    expect(statuses[0].pointsRemaining).toBe(12);
    expect(statuses[1].pointsRemaining).toBe(112);
  });

  it("does not require unlocking in order — redeeming/holding points never resets progress", () => {
    const statuses = tierStatuses(tiers, 300);
    expect(statuses.every((s) => s.unlocked)).toBe(true);
  });
});

describe("nextLockedTier", () => {
  it("returns the lowest-threshold locked tier", () => {
    expect(nextLockedTier(tiers, 60)?.id).toBe("t2");
  });

  it("returns undefined once every tier is unlocked", () => {
    expect(nextLockedTier(tiers, 1000)).toBeUndefined();
  });
});
