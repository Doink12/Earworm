import { HashRouter, Route, Routes } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { DiscoveryScreen } from "./components/DiscoveryScreen";
import { ArtistProfileScreen } from "./components/ArtistProfileScreen";
import { LeaderboardScreen } from "./components/LeaderboardScreen";
import { BottomNav } from "./components/BottomNav";

function App() {
  return (
    <UserProvider>
      <HashRouter>
        <div className="app-shell">
          <Routes>
            <Route path="/" element={<DiscoveryScreen />} />
            <Route path="/artist/:artistId" element={<ArtistProfileScreen />} />
            <Route path="/leaderboard" element={<LeaderboardScreen />} />
          </Routes>
          <BottomNav />
        </div>
      </HashRouter>
    </UserProvider>
  );
}

export default App;
