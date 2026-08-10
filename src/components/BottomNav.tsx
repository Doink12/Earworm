import { NavLink } from "react-router-dom";

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")} end>
        Discover
      </NavLink>
      <NavLink to="/leaderboard" className={({ isActive }) => (isActive ? "active" : "")}>
        Leaderboard
      </NavLink>
    </nav>
  );
}
