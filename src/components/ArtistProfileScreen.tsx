import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useArtists } from "../context/ArtistsContext";
import { useUser } from "../context/UserContext";
import { cumulativePoints, remainingAllowance } from "../lib/points";
import { growthRate } from "../lib/scoring";
import { GrowthBadge } from "./GrowthBadge";
import { MetricsGrid } from "./MetricsGrid";
import { BackingSlider } from "./BackingSlider";
import { RewardTierLadder } from "./RewardTierLadder";
import { initials } from "../lib/format";

export function ArtistProfileScreen() {
  const { artistId } = useParams<{ artistId: string }>();
  const { getArtist, scores } = useArtists();
  const { user, backArtist, toggleWatch } = useUser();
  const [justConfirmed, setJustConfirmed] = useState<number | null>(null);

  const artist = artistId ? getArtist(artistId) : undefined;
  if (!artist) {
    return (
      <div className="screen">
        <p className="empty-state">Artist not found.</p>
        <Link className="back-link" to="/">
          ← Back to discover
        </Link>
      </div>
    );
  }

  const isPending = artist.verificationStatus === "pending";
  const scoreNow = scores[artist.id] ?? artist.scoreAtMonthStart;
  const growth = growthRate(scoreNow, artist.scoreAtMonthStart);
  const alreadyBacked = cumulativePoints(user, artist.id);
  const remaining = remainingAllowance(user);
  const isWatching = user.watchlist.includes(artist.id);

  return (
    <div className="screen">
      <div className="top-bar" style={{ padding: 0 }}>
        <Link className="back-link" to="/">
          ← Discover
        </Link>
      </div>

      <div className="artist-header">
        <div className="avatar" style={{ background: artist.avatarColor }}>
          {initials(artist.name)}
        </div>
        <div className="grow">
          <p className="name">{artist.name}</p>
          <p className="meta">
            {artist.genre} · {artist.location}
          </p>
        </div>
        <button
          className={`watch-btn ${isWatching ? "watching" : ""}`}
          onClick={() => toggleWatch(artist.id)}
        >
          {isWatching ? "★ Watching" : "☆ Watch"}
        </button>
      </div>

      {isPending && (
        <p className="pending-banner">
          ⏳ This artist is pending verification and isn't backable yet.
        </p>
      )}

      <div className="card score-card">
        <div>
          <div className="score-value">{scoreNow.toFixed(1)}</div>
          <div className="score-label">Artist score</div>
        </div>
        <GrowthBadge growth={growth} />
      </div>

      <div>
        <p className="section-title" style={{ marginBottom: 10 }}>
          Key metrics
        </p>
        <MetricsGrid metrics={artist.metrics} />
      </div>

      {!isPending && (
        <BackingSlider
          remainingAllowance={remaining}
          justConfirmedPoints={justConfirmed}
          onConfirm={(points) => {
            backArtist({ artistId: artist.id, points, scoreAtContribution: scoreNow });
            setJustConfirmed(points);
          }}
        />
      )}

      <RewardTierLadder tiers={artist.rewardTiers} cumulativePoints={alreadyBacked} />
    </div>
  );
}
