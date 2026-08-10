import { Link } from "react-router-dom";
import { ARTISTS, getArtist, liveScoreMap } from "../data/artists";
import { computeMonthlyPayouts } from "../lib/monthlyPayouts";
import { initials } from "../lib/format";

const ACTIVE_SUBSCRIBERS_THIS_MONTH = 24_600;
const MINIMUM_PAYOUT = 5;

export function ArtistDashboardScreen() {
  const scores = liveScoreMap();
  const { pool, rows } = computeMonthlyPayouts(ARTISTS, scores, ACTIVE_SUBSCRIBERS_THIS_MONTH, MINIMUM_PAYOUT);

  return (
    <div className="screen">
      <div className="top-bar" style={{ padding: 0 }}>
        <Link className="back-link" to="/portfolio">
          ← You
        </Link>
      </div>

      <div className="top-bar" style={{ padding: 0 }}>
        <h1>Artist dashboard</h1>
      </div>
      <p className="rough-note">
        Rough placeholder — the spec leaves the minimum payout floor undecided (using $5 here) and
        hasn't settled how a brand-new artist's cold start should render. Active subscribers and
        each artist's points-this-month are mocked platform-wide figures, not derived from the 4
        demo users used elsewhere in this prototype.
      </p>

      <div className="stat-grid">
        <div className="stat-tile stat-tile-wide">
          <div className="stat-value">${pool.toLocaleString()}</div>
          <div className="stat-label">
            This month's pool · $2 × {ACTIVE_SUBSCRIBERS_THIS_MONTH.toLocaleString()} active subscribers
          </div>
        </div>
      </div>

      <div className="card">
        <p className="section-title" style={{ marginBottom: 4 }}>
          Revenue split
        </p>
        {rows.map((row) => {
          const artist = getArtist(row.artistId);
          if (!artist) return null;
          return (
            <Link className="holding-row" to={`/artist/${artist.id}`} key={row.artistId}>
              <div className="avatar avatar-sm" style={{ background: artist.avatarColor }}>
                {initials(artist.name)}
              </div>
              <div className="grow">
                <p className="name">{artist.name}</p>
                <p className="sub">
                  {row.pointsThisMonth.toLocaleString()} pts · {row.growthMultiplier.toFixed(2)}×
                </p>
              </div>
              <div className="right">
                <div className="score">${Math.round(row.amount).toLocaleString()}</div>
                <div className="sub" style={{ marginTop: 1 }}>
                  {(row.share * 100).toFixed(1)}% share
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
