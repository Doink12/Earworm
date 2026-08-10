import { HashRouter, Route, Routes } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { ArtistsProvider } from "./context/ArtistsContext";
import { DiscoveryScreen } from "./components/DiscoveryScreen";
import { ArtistProfileScreen } from "./components/ArtistProfileScreen";
import { LeaderboardScreen } from "./components/LeaderboardScreen";
import { PortfolioScreen } from "./components/PortfolioScreen";
import { ArtistDashboardScreen } from "./components/ArtistDashboardScreen";
import { ArtistOnboardingScreen } from "./components/ArtistOnboardingScreen";
import { BottomNav } from "./components/BottomNav";

function App() {
  return (
    <UserProvider>
      <ArtistsProvider>
        <HashRouter>
          <div className="app-shell">
            <Routes>
              <Route path="/" element={<DiscoveryScreen />} />
              <Route path="/artist/:artistId" element={<ArtistProfileScreen />} />
              <Route path="/portfolio" element={<PortfolioScreen />} />
              <Route path="/artist-dashboard" element={<ArtistDashboardScreen />} />
              <Route path="/onboarding" element={<ArtistOnboardingScreen />} />
              <Route path="/leaderboard" element={<LeaderboardScreen />} />
            </Routes>
            <BottomNav />
          </div>
        </HashRouter>
      </ArtistsProvider>
    </UserProvider>
  );
}

export default App;
