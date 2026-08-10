import { Link } from "react-router-dom";
import { useArtists } from "../context/ArtistsContext";
import { growthRate } from "../lib/scoring";
import { initials } from "../lib/format";
import { formatPercent } from "../lib/format";

export function DiscoveryScreen() {
  const { verifiedArtists, scores } = useArtists();
  const ranked = [...verifiedArtists].sort((a, b) => scores[b.id] - scores[a.id]);

  return (
    <div className="screen">
      <div className="top-bar" style={{ padding: 0 }}>
        <h1>Discover artists</h1>
      </div>
      <p className="rough-note">
        Rough placeholder — the spec hasn't nailed down a discovery/leaderboard design yet. This is just
        enough to browse artists and get to the profile screen.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {ranked.map((artist) => {
          const scoreNow = scores[artist.id];
          const growth = growthRate(scoreNow, artist.scoreAtMonthStart);
          return (
            <Link className="artist-list-item" to={`/artist/${artist.id}`} key={artist.id}>
              <div className="avatar avatar-sm" style={{ background: artist.avatarColor }}>
                {initials(artist.name)}
              </div>
              <div className="grow">
                <p className="name">{artist.name}</p>
                <p className="meta">
                  {artist.genre} · {artist.location}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="score">{scoreNow.toFixed(1)}</div>
                <div className={growth >= 0 ? "leaderboard-metric positive" : "leaderboard-metric negative"} style={{ fontSize: 11 }}>
                  {formatPercent(growth)}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
