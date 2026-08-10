import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { OTHER_USERS, OTHER_CONTRIBUTIONS } from "../data/user";
import { ARTISTS, liveScoreMap } from "../data/artists";
import { computeLeaderboardEntry, rankLeaderboard } from "../lib/leaderboard";
import { growthRate } from "../lib/scoring";
import { formatPercent, initials } from "../lib/format";

type Scope = "global" | "country";

export function LeaderboardScreen() {
  const { user } = useUser();
  const [scope, setScope] = useState<Scope>("global");

  const scores = liveScoreMap();

  const userEntries = useMemo(() => {
    const allUsers = [{ id: user.id, name: user.name, country: user.country }, ...OTHER_USERS];
    const allContributions = [...user.contributions, ...OTHER_CONTRIBUTIONS];

    const entries = allUsers.map((u) => ({
      ...computeLeaderboardEntry(u.id, allContributions, scores),
      name: u.name,
      country: u.country,
    }));

    return scope === "country" ? entries.filter((e) => e.country === user.country) : entries;
  }, [user, scope, scores]);

  const byGrowthPoints = useMemo(() => rankLeaderboard(userEntries, "totalGrowthPoints"), [userEntries]);
  const byBattingAverage = useMemo(() => rankLeaderboard(userEntries, "battingAverage"), [userEntries]);

  const artistRows = useMemo(() => {
    const rows = ARTISTS.map((artist) => ({
      artist,
      scoreNow: scores[artist.id],
      growth: growthRate(scores[artist.id], artist.scoreAtMonthStart),
    }));
    const scoped = scope === "country" ? rows.filter((r) => r.artist.country === user.country) : rows;
    return [...scoped].sort((a, b) => b.growth - a.growth);
  }, [scope, user.country, scores]);

  return (
    <div className="screen">
      <div className="top-bar" style={{ padding: 0 }}>
        <h1>Best A&R</h1>
      </div>
      <p className="rough-note">
        Rough placeholder — leaderboard/discovery screens aren't designed yet in the spec. Shown here so
        the growth-accuracy formulas have somewhere to render.
      </p>

      <div className="pill-toggle">
        <button className={scope === "global" ? "active" : ""} onClick={() => setScope("global")}>
          Global
        </button>
        <button className={scope === "country" ? "active" : ""} onClick={() => setScope("country")}>
          {user.country}
        </button>
      </div>

      <div className="card">
        <p className="section-title" style={{ marginBottom: 10 }}>
          Growth points
        </p>
        {byGrowthPoints.length === 0 && <p className="empty-state">No one here yet.</p>}
        {byGrowthPoints.map((row, i) => (
          <div className="leaderboard-row" key={row.userId}>
            <div className="leaderboard-rank">{i + 1}</div>
            <div className="leaderboard-name">
              {row.name}
              {row.userId === user.id && " (you)"}
            </div>
            <div className={`leaderboard-metric ${row.totalGrowthPoints >= 0 ? "positive" : "negative"}`}>
              {row.totalGrowthPoints.toFixed(1)}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <p className="section-title" style={{ marginBottom: 10 }}>
          Top % growth — users
        </p>
        {byBattingAverage.length === 0 && <p className="empty-state">No one here yet.</p>}
        {byBattingAverage.map((row, i) => (
          <div className="leaderboard-row" key={row.userId}>
            <div className="leaderboard-rank">{i + 1}</div>
            <div className="leaderboard-name">
              {row.name}
              {row.userId === user.id && " (you)"}
            </div>
            <div className={`leaderboard-metric ${row.battingAverage >= 0 ? "positive" : "negative"}`}>
              {formatPercent(row.battingAverage)}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <p className="section-title" style={{ marginBottom: 10 }}>
          Top % growth — artists
        </p>
        {artistRows.length === 0 && <p className="empty-state">No one here yet.</p>}
        {artistRows.map(({ artist, growth }, i) => (
          <Link className="leaderboard-row" to={`/artist/${artist.id}`} key={artist.id}>
            <div className="leaderboard-rank">{i + 1}</div>
            <div className="avatar avatar-sm" style={{ background: artist.avatarColor, marginRight: 2 }}>
              {initials(artist.name)}
            </div>
            <div className="leaderboard-name">{artist.name}</div>
            <div className={`leaderboard-metric ${growth >= 0 ? "positive" : "negative"}`}>
              {formatPercent(growth)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
