import type { Artist } from "../types";
import { computeScores } from "../lib/scoring";

interface RawArtist extends Omit<Artist, "scoreAtMonthStart"> {
  /** Assumed growth this month, used only to derive a plausible monthStart baseline for the mock. */
  assumedMonthlyGrowth: number;
}

const RAW_ARTISTS: RawArtist[] = [
  {
    id: "nova-wren",
    name: "Nova Wren",
    genre: "Pop",
    location: "Los Angeles, USA",
    country: "USA",
    avatarColor: "#e85d75",
    assumedMonthlyGrowth: 0.08,
    platformPointsThisMonth: 8200,
    metrics: {
      spotifyFollowers: 1_850_000,
      spotifyListeners: 6_200_000,
      instagramFollowers: 2_100_000,
      ticketsSold: 48_000,
      tiktokFollowers: 3_400_000,
      soundcloudFollowers: 210_000,
      soundcloudStreams: 4_100_000,
      festivalsPlayed: 14,
    },
    rewardTiers: [
      { id: "t1", threshold: 50, title: "Early access post", description: "See the next single before anyone else." },
      { id: "t2", threshold: 150, title: "Unreleased song", description: "A demo that never made the album." },
      { id: "t3", threshold: 300, title: "Signed merch", description: "Tour poster signed by the whole band." },
    ],
  },
  {
    id: "kilo-static",
    name: "Kilo Static",
    genre: "Hip-Hop",
    location: "Atlanta, USA",
    country: "USA",
    avatarColor: "#4f5df2",
    assumedMonthlyGrowth: -0.04,
    platformPointsThisMonth: 3100,
    metrics: {
      spotifyFollowers: 640_000,
      spotifyListeners: 2_800_000,
      instagramFollowers: 510_000,
      ticketsSold: 12_000,
      tiktokFollowers: 1_100_000,
      soundcloudFollowers: 380_000,
      soundcloudStreams: 9_600_000,
      festivalsPlayed: 6,
    },
    rewardTiers: [
      { id: "t1", threshold: 40, title: "Beat pack", description: "Unreleased instrumentals from the vault." },
      { id: "t2", threshold: 120, title: "Studio session video", description: "Behind-the-scenes of the next single." },
      { id: "t3", threshold: 250, title: "1-on-1 video call", description: "A 10 minute video call, once a year." },
    ],
  },
  {
    id: "marlow",
    name: "Marlow",
    genre: "Indie",
    location: "London, UK",
    country: "UK",
    avatarColor: "#2f9e6f",
    assumedMonthlyGrowth: 0.03,
    platformPointsThisMonth: 1400,
    metrics: {
      spotifyFollowers: 210_000,
      spotifyListeners: 890_000,
      instagramFollowers: 95_000,
      ticketsSold: 8_200,
      tiktokFollowers: 240_000,
      soundcloudFollowers: 64_000,
      soundcloudStreams: 1_200_000,
      festivalsPlayed: 9,
    },
    rewardTiers: [
      { id: "t1", threshold: 50, title: "Lyric notebook scans", description: "Handwritten drafts of the new EP." },
      { id: "t2", threshold: 150, title: "Acoustic unreleased track", description: "Stripped-back version, unmastered." },
      { id: "t3", threshold: 300, title: "Signed vinyl", description: "First pressing, numbered and signed." },
    ],
  },
  {
    id: "selin-aydin",
    name: "Selin Aydın",
    genre: "Pop",
    location: "Istanbul, Turkey",
    country: "Turkey",
    avatarColor: "#f2a134",
    assumedMonthlyGrowth: 0.15,
    platformPointsThisMonth: 5200,
    metrics: {
      spotifyFollowers: 95_000,
      spotifyListeners: 420_000,
      instagramFollowers: 640_000,
      ticketsSold: 3_100,
      tiktokFollowers: 1_900_000,
      soundcloudFollowers: 18_000,
      soundcloudStreams: 310_000,
      festivalsPlayed: 2,
    },
    rewardTiers: [
      { id: "t1", threshold: 50, title: "Voice memo demo", description: "A phone-recorded first draft of a new song." },
      { id: "t2", threshold: 150, title: "Livestream Q&A seat", description: "Small-group video call before the show." },
      { id: "t3", threshold: 300, title: "Meet & greet pass", description: "Backstage pass at the next local show." },
    ],
  },
  {
    id: "dust-chapel",
    name: "Dust Chapel",
    genre: "Rock",
    location: "Austin, USA",
    country: "USA",
    avatarColor: "#8a4fd1",
    assumedMonthlyGrowth: -0.02,
    platformPointsThisMonth: 320,
    metrics: {
      spotifyFollowers: 58_000,
      spotifyListeners: 190_000,
      instagramFollowers: 41_000,
      ticketsSold: 6_500,
      tiktokFollowers: 22_000,
      soundcloudFollowers: 30_000,
      soundcloudStreams: 480_000,
      festivalsPlayed: 11,
    },
    rewardTiers: [
      { id: "t1", threshold: 30, title: "Rehearsal clip", description: "Raw phone footage from practice space." },
      { id: "t2", threshold: 100, title: "Guitar pick set", description: "Picks used on the last tour." },
      { id: "t3", threshold: 220, title: "Signed poster", description: "Tour poster signed by the whole band." },
    ],
  },
  {
    id: "nuvem",
    name: "Nuvem",
    genre: "Electronic",
    location: "São Paulo, Brazil",
    country: "Brazil",
    avatarColor: "#1fb8c4",
    assumedMonthlyGrowth: 0.11,
    platformPointsThisMonth: 2600,
    metrics: {
      spotifyFollowers: 320_000,
      spotifyListeners: 1_400_000,
      instagramFollowers: 180_000,
      ticketsSold: 15_000,
      tiktokFollowers: 560_000,
      soundcloudFollowers: 95_000,
      soundcloudStreams: 2_600_000,
      festivalsPlayed: 18,
    },
    rewardTiers: [
      { id: "t1", threshold: 50, title: "Unreleased mix", description: "A festival edit that never got a release." },
      { id: "t2", threshold: 150, title: "Stems pack", description: "Track stems for a remix contest." },
      { id: "t3", threshold: 300, title: "Backstage pass", description: "Side-of-stage access at the next set." },
    ],
  },
];

const scoreResults = computeScores(RAW_ARTISTS.map((a) => a.metrics));

export const ARTISTS: Artist[] = RAW_ARTISTS.map((raw, i) => {
  const { assumedMonthlyGrowth, ...artist } = raw;
  const scoreNow = scoreResults[i].score;
  const scoreAtMonthStart = scoreNow / (1 + assumedMonthlyGrowth);
  return { ...artist, scoreAtMonthStart };
});

export function getArtist(id: string): Artist | undefined {
  return ARTISTS.find((a) => a.id === id);
}

export function liveScores(): { artistId: string; score: number }[] {
  const results = computeScores(ARTISTS.map((a) => a.metrics));
  return ARTISTS.map((a, i) => ({ artistId: a.id, score: results[i].score }));
}

export function liveScoreMap(): Record<string, number> {
  return liveScores().reduce((acc, { artistId, score }) => {
    acc[artistId] = score;
    return acc;
  }, {} as Record<string, number>);
}
