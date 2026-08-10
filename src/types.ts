export interface ArtistMetrics {
  spotifyFollowers: number;
  spotifyListeners: number;
  instagramFollowers: number;
  ticketsSold: number;
  tiktokFollowers: number;
  soundcloudFollowers: number;
  soundcloudStreams: number;
  festivalsPlayed: number;
}

export type MetricKey = keyof ArtistMetrics;

export interface RewardTier {
  id: string;
  threshold: number;
  title: string;
  description: string;
}

export interface Artist {
  id: string;
  name: string;
  genre: string;
  location: string;
  country: string;
  avatarColor: string;
  metrics: ArtistMetrics;
  /** Composite score at the start of the current month, for growth-badge math. */
  scoreAtMonthStart: number;
  rewardTiers: RewardTier[];
}

/** A single points contribution, logged forever for leaderboard math. */
export interface Contribution {
  id: string;
  userId: string;
  artistId: string;
  points: number;
  month: string; // "YYYY-MM"
  date: string; // ISO date
  scoreAtContribution: number;
}

export interface MonthlyAllowance {
  month: string; // "YYYY-MM"
  totalAllowance: number; // 100 base + up to 5 carryover
  spent: number;
}

export interface User {
  id: string;
  name: string;
  country: string;
  currentMonth: string;
  allowances: MonthlyAllowance[];
  contributions: Contribution[];
  /** Artists the user is tracking but hasn't necessarily backed. */
  watchlist: string[];
}
