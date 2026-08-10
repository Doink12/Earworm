import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Artist, ArtistMetrics, RewardTier } from "../types";
import { ARTISTS as SEED_ARTISTS } from "../data/artists";
import { computeScores } from "../lib/scoring";

export interface NewArtistInput {
  name: string;
  genre: string;
  location: string;
  country: string;
  avatarColor: string;
  metrics: ArtistMetrics;
  rewardTiers: RewardTier[];
}

interface ArtistsContextValue {
  /** Seed artists plus anything submitted through onboarding this session, verified or not. */
  artists: Artist[];
  /** What Discover, Leaderboard, and payouts should show. */
  verifiedArtists: Artist[];
  scores: Record<string, number>;
  getArtist: (id: string) => Artist | undefined;
  /** Composite score an artist would get if they joined the pool right now, without actually submitting. */
  previewScore: (metrics: ArtistMetrics) => number;
  submitArtist: (input: NewArtistInput) => string;
  verifyArtist: (id: string) => void;
  /** The most recent onboarding submission this session, so leaving and returning to the wizard doesn't lose it. */
  lastSubmittedId: string | null;
}

const ArtistsContext = createContext<ArtistsContextValue | undefined>(undefined);

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "artist"}-${Date.now().toString(36)}`;
}

export function ArtistsProvider({ children }: { children: ReactNode }) {
  const [submittedArtists, setSubmittedArtists] = useState<Artist[]>([]);
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);

  const artists = useMemo(() => [...SEED_ARTISTS, ...submittedArtists], [submittedArtists]);

  const scores = useMemo(() => {
    const results = computeScores(artists.map((a) => a.metrics));
    return artists.reduce((acc, a, i) => {
      acc[a.id] = results[i].score;
      return acc;
    }, {} as Record<string, number>);
  }, [artists]);

  const value = useMemo<ArtistsContextValue>(
    () => ({
      artists,
      verifiedArtists: artists.filter((a) => a.verificationStatus === "verified"),
      scores,
      getArtist: (id) => artists.find((a) => a.id === id),
      previewScore: (metrics) => {
        const pool = [...artists.map((a) => a.metrics), metrics];
        const results = computeScores(pool);
        return results[results.length - 1].score;
      },
      submitArtist: (input) => {
        const id = slugify(input.name);
        const pool = [...artists.map((a) => a.metrics), input.metrics];
        const results = computeScores(pool);
        const scoreAtMonthStart = results[results.length - 1].score;

        const newArtist: Artist = {
          id,
          name: input.name,
          genre: input.genre,
          location: input.location,
          country: input.country,
          avatarColor: input.avatarColor,
          metrics: input.metrics,
          rewardTiers: input.rewardTiers,
          scoreAtMonthStart,
          platformPointsThisMonth: 0,
          verificationStatus: "pending",
        };
        setSubmittedArtists((prev) => [...prev, newArtist]);
        setLastSubmittedId(id);
        return id;
      },
      verifyArtist: (id) =>
        setSubmittedArtists((prev) =>
          prev.map((a) => (a.id === id ? { ...a, verificationStatus: "verified" } : a)),
        ),
      lastSubmittedId,
    }),
    [artists, scores, lastSubmittedId],
  );

  return <ArtistsContext.Provider value={value}>{children}</ArtistsContext.Provider>;
}

export function useArtists(): ArtistsContextValue {
  const ctx = useContext(ArtistsContext);
  if (!ctx) throw new Error("useArtists must be used within an ArtistsProvider");
  return ctx;
}
