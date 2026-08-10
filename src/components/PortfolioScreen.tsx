import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useArtists } from "../context/ArtistsContext";
import { OTHER_USERS, OTHER_CONTRIBUTIONS } from "../data/user";
import { computeHoldings, totalPointsInvested } from "../lib/portfolio";
import { computeLeaderboardEntry } from "../lib/leaderboard";
import { remainingAllowance } from "../lib/points";
import { growthRate } from "../lib/scoring";
import { formatPercent, initials } from "../lib/format";

export function PortfolioScreen() {
  const { user, toggleWatch } = useUser();
  const { getArtist, scores } = useArtists();

  const holdings = useMemo(() => computeHoldings(user.id, user.contributions, scores), [user, scores]);
  const performance = useMemo(
    () => computeLeaderboardEntry(user.id, user.contributions, scores),
    [user, scores],
  );
  const invested = totalPointsInvested(holdings);
  const remaining = remainingAllowance(user);

  const watchedArtists = user.watchlist
    .map((id) => getArtist(id))
    .filter((a): a is NonNullable<typeof a> => a !== undefined);

  const friends = useMemo(
    () =>
      OTHER_USERS.map((friend) => ({
        friend,
        holdings: computeHoldings(friend.id, OTHER_CONTRIBUTIONS, scores),
      })),
    [scores],
  );

  return (
    <div className="screen">
      <div className="top-bar" style={{ padding: 0 }}>
        <h1>Your portfolio</h1>
      </div>

      <div className="stat-grid">
        <div className="stat-tile">
          <div className="stat-value">{invested}</div>
          <div className="stat-label">Total points invested</div>
        </div>
        <div className="stat-tile">
          <div className="stat-value">{remaining}</div>
          <div className="stat-label">Left to allocate this month</div>
        </div>
        <div className="stat-tile stat-tile-wide">
          <div className={`stat-value ${performance.totalGrowthPoints >= 0 ? "positive" : "negative"}`}>
            {performance.totalGrowthPoints >= 0 ? "+" : ""}
            {performance.totalGrowthPoints.toFixed(1)}
          </div>
          <div className="stat-label">Total growth points</div>
        </div>
      </div>

      <div className="card">
        <p className="section-title" style={{ marginBottom: 4 }}>
          Currently backing
        </p>
        {holdings.length === 0 && (
          <p className="empty-state">You haven't backed any artists yet — head to Discover.</p>
        )}
        {holdings.map((h) => {
          const artist = getArtist(h.artistId);
          if (!artist) return null;
          return (
            <Link className="holding-row" to={`/artist/${artist.id}`} key={h.artistId}>
              <div className="avatar avatar-sm" style={{ background: artist.avatarColor }}>
                {initials(artist.name)}
              </div>
              <div className="grow">
                <p className="name">{artist.name}</p>
                <p className="sub">{h.cumulativePoints} pts invested</p>
              </div>
              <div className="right">
                <div className="score">{h.scoreNow.toFixed(1)}</div>
                <div className={`delta ${h.growthSinceEntry >= 0 ? "positive" : "negative"}`}>
                  {formatPercent(h.growthSinceEntry)} since your entry
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="card">
        <p className="section-title" style={{ marginBottom: 4 }}>
          Watchlist
        </p>
        {watchedArtists.length === 0 && (
          <p className="empty-state">Nothing on your watchlist. Star an artist from their profile to track it here.</p>
        )}
        {watchedArtists.map((artist) => {
          const scoreNow = scores[artist.id] ?? artist.scoreAtMonthStart;
          const growth = growthRate(scoreNow, artist.scoreAtMonthStart);
          return (
            <div className="holding-row" key={artist.id}>
              <Link to={`/artist/${artist.id}`} style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0, textDecoration: "none", color: "inherit" }}>
                <div className="avatar avatar-sm" style={{ background: artist.avatarColor }}>
                  {initials(artist.name)}
                </div>
                <div className="grow">
                  <p className="name">{artist.name}</p>
                  <p className="sub">
                    {artist.genre} · {artist.location}
                  </p>
                </div>
                <div className="right">
                  <div className="score">{scoreNow.toFixed(1)}</div>
                  <div className={`delta ${growth >= 0 ? "positive" : "negative"}`}>{formatPercent(growth)}</div>
                </div>
              </Link>
              <button className="unwatch-btn" onClick={() => toggleWatch(artist.id)} aria-label={`Remove ${artist.name} from watchlist`}>
                ✕
              </button>
            </div>
          );
        })}
      </div>

      <div className="card">
        <p className="section-title" style={{ marginBottom: 4 }}>
          Friends &amp; follows
        </p>
        {friends.length === 0 && <p className="empty-state">No friends yet.</p>}
        {friends.map(({ friend, holdings: friendHoldings }) => (
          <div className="friend-block" key={friend.id}>
            <div className="friend-block-header">
              <div className="avatar avatar-sm" style={{ background: friend.avatarColor }}>
                {initials(friend.name)}
              </div>
              <div>
                <p className="name">{friend.name}</p>
                <p className="sub">{friend.country}</p>
              </div>
            </div>
            {friendHoldings.length === 0 ? (
              <p className="empty-state" style={{ padding: 0 }}>
                Not backing anyone yet.
              </p>
            ) : (
              <div className="backing-tags">
                {friendHoldings.map((h) => {
                  const artist = getArtist(h.artistId);
                  if (!artist) return null;
                  return (
                    <Link className="backing-tag" to={`/artist/${artist.id}`} key={h.artistId}>
                      {artist.name} <span className="tag-points">{h.cumulativePoints} pts</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card">
        <p className="section-title" style={{ marginBottom: 4 }}>
          For artists
        </p>
        <Link className="dashboard-link" to="/onboarding">
          <div>
            <div className="title">Apply to join as an artist</div>
            <div className="subtitle">Verify your reach and set up reward tiers</div>
          </div>
          <span className="chevron">›</span>
        </Link>
        <Link className="dashboard-link" to="/artist-dashboard">
          <div>
            <div className="title">Artist dashboard</div>
            <div className="subtitle">If you're already verified, see this month's revenue split</div>
          </div>
          <span className="chevron">›</span>
        </Link>
      </div>
    </div>
  );
}
