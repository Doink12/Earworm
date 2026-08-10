import { useMemo, useState } from "react";
import { useUser } from "../context/UserContext";
import { OTHER_USERS, OTHER_CONTRIBUTIONS } from "../data/user";
import { liveScoreMap } from "../data/artists";
import { computeLeaderboardEntry, rankLeaderboard } from "../lib/leaderboard";

type Scope = "global" | "country";

export function LeaderboardScreen() {
  const { user } = useUser();
  const [scope, setScope] = useState<Scope>("global");

  const rows = useMemo(() => {
    const scores = liveScoreMap();
    const allUsers = [
      { id: user.id, name: user.name, country: user.country },
      ...OTHER_USERS,
    ];
    const allContributions = [...user.contributions, ...OTHER_CONTRIBUTIONS];

    const entries = allUsers.map((u) => ({
      ...computeLeaderboardEntry(u.id, allContributions, scores),
      name: u.name,
      country: u.country,
    }));

    const scoped = scope === "country" ? entries.filter((e) => e.country === user.country) : entries;
    return rankLeaderboard(scoped, "totalGrowthPoints");
  }, [user, scope]);

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
        {rows.length === 0 && <p className="empty-state">No one here yet.</p>}
        {rows.map((row, i) => {
          const value = row.totalGrowthPoints;
          const display = value.toFixed(1);
          return (
            <div className="leaderboard-row" key={row.userId}>
              <div className="leaderboard-rank">{i + 1}</div>
              <div className="leaderboard-name">
                {row.name}
                {row.userId === user.id && " (you)"}
              </div>
              <div className={`leaderboard-metric ${value >= 0 ? "positive" : "negative"}`}>{display}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
