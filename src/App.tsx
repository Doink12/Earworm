import { HashRouter, Route, Routes } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { DiscoveryScreen } from "./components/DiscoveryScreen";
import { ArtistProfileScreen } from "./components/ArtistProfileScreen";
import { LeaderboardScreen } from "./components/LeaderboardScreen";
import { PortfolioScreen } from "./components/PortfolioScreen";
import { ArtistDashboardScreen } from "./components/ArtistDashboardScreen";
import { BottomNav } from "./components/BottomNav";

function App() {
  return (
    <UserProvider>
      <HashRouter>
        <div className="app-shell">
          <Routes>
            <Route path="/" element={<DiscoveryScreen />} />
            <Route path="/artist/:artistId" element={<ArtistProfileScreen />} />
            <Route path="/portfolio" element={<PortfolioScreen />} />
            <Route path="/artist-dashboard" element={<ArtistDashboardScreen />} />
            <Route path="/leaderboard" element={<LeaderboardScreen />} />
          </Routes>
          <BottomNav />
        </div>
      </HashRouter>
    </UserProvider>
  );
}

export default App;
