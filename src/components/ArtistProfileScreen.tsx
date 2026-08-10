import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getArtist, liveScoreMap } from "../data/artists";
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
  const { user, backArtist } = useUser();
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

  const scoreNow = liveScoreMap()[artist.id] ?? artist.scoreAtMonthStart;
  const growth = growthRate(scoreNow, artist.scoreAtMonthStart);
  const alreadyBacked = cumulativePoints(user, artist.id);
  const remaining = remainingAllowance(user);

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
        <div>
          <p className="name">{artist.name}</p>
          <p className="meta">
            {artist.genre} · {artist.location}
          </p>
        </div>
      </div>

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

      <BackingSlider
        remainingAllowance={remaining}
        justConfirmedPoints={justConfirmed}
        onConfirm={(points) => {
          backArtist({ artistId: artist.id, points, scoreAtContribution: scoreNow });
          setJustConfirmed(points);
        }}
      />

      <RewardTierLadder tiers={artist.rewardTiers} cumulativePoints={alreadyBacked} />
    </div>
  );
}
