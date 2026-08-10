import type { Contribution, MonthlyAllowance, User } from "../types";

const allowances: MonthlyAllowance[] = [
  { month: "2026-06", totalAllowance: 100, spent: 95 },
  { month: "2026-07", totalAllowance: 105, spent: 100 },
  { month: "2026-08", totalAllowance: 105, spent: 35 },
];

const contributions: Contribution[] = [
  {
    id: "c1",
    userId: "u1",
    artistId: "nova-wren",
    points: 40,
    month: "2026-06",
    date: "2026-06-04T00:00:00Z",
    scoreAtContribution: 80.1,
  },
  {
    id: "c2",
    userId: "u1",
    artistId: "kilo-static",
    points: 25,
    month: "2026-06",
    date: "2026-06-11T00:00:00Z",
    scoreAtContribution: 78.4,
  },
  {
    id: "c3",
    userId: "u1",
    artistId: "marlow",
    points: 30,
    month: "2026-06",
    date: "2026-06-20T00:00:00Z",
    scoreAtContribution: 34.2,
  },
  {
    id: "c4",
    userId: "u1",
    artistId: "nuvem",
    points: 45,
    month: "2026-07",
    date: "2026-07-05T00:00:00Z",
    scoreAtContribution: 45.0,
  },
  {
    id: "c5",
    userId: "u1",
    artistId: "selin-aydin",
    points: 35,
    month: "2026-07",
    date: "2026-07-14T00:00:00Z",
    scoreAtContribution: 20.3,
  },
  {
    id: "c6",
    userId: "u1",
    artistId: "kilo-static",
    points: 20,
    month: "2026-07",
    date: "2026-07-22T00:00:00Z",
    scoreAtContribution: 73.1,
  },
  {
    id: "c7",
    userId: "u1",
    artistId: "nova-wren",
    points: 20,
    month: "2026-08",
    date: "2026-08-02T00:00:00Z",
    scoreAtContribution: 89.48,
  },
  {
    id: "c8",
    userId: "u1",
    artistId: "nuvem",
    points: 15,
    month: "2026-08",
    date: "2026-08-06T00:00:00Z",
    scoreAtContribution: 48.89,
  },
];

export const CURRENT_USER: User = {
  id: "u1",
  name: "You",
  country: "USA",
  currentMonth: "2026-08",
  allowances,
  contributions,
  watchlist: ["dust-chapel"],
};

// A couple of other users purely so the leaderboard screen has something to rank against.
export const OTHER_USERS: { id: string; name: string; country: string }[] = [
  { id: "u2", name: "Priya K.", country: "UK" },
  { id: "u3", name: "Marco T.", country: "Brazil" },
  { id: "u4", name: "Jess O.", country: "USA" },
];

export const OTHER_CONTRIBUTIONS: Contribution[] = [
  { id: "d1", userId: "u2", artistId: "marlow", points: 60, month: "2026-06", date: "2026-06-02T00:00:00Z", scoreAtContribution: 30.0 },
  { id: "d2", userId: "u2", artistId: "selin-aydin", points: 40, month: "2026-07", date: "2026-07-10T00:00:00Z", scoreAtContribution: 22.0 },
  { id: "d3", userId: "u3", artistId: "nuvem", points: 80, month: "2026-06", date: "2026-06-08T00:00:00Z", scoreAtContribution: 40.0 },
  { id: "d4", userId: "u3", artistId: "kilo-static", points: 20, month: "2026-07", date: "2026-07-18T00:00:00Z", scoreAtContribution: 75.0 },
  { id: "d5", userId: "u4", artistId: "nova-wren", points: 90, month: "2026-06", date: "2026-06-03T00:00:00Z", scoreAtContribution: 85.0 },
  { id: "d6", userId: "u4", artistId: "dust-chapel", points: 30, month: "2026-07", date: "2026-07-25T00:00:00Z", scoreAtContribution: 9.0 },
];
