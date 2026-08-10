import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { User } from "../types";
import { CURRENT_USER } from "../data/user";
import { contribute, type ContributionInput } from "../lib/points";

interface UserContextValue {
  user: User;
  backArtist: (input: ContributionInput) => void;
  toggleWatch: (artistId: string) => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(CURRENT_USER);

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      backArtist: (input) => setUser((prev) => contribute(prev, input)),
      toggleWatch: (artistId) =>
        setUser((prev) => ({
          ...prev,
          watchlist: prev.watchlist.includes(artistId)
            ? prev.watchlist.filter((id) => id !== artistId)
            : [...prev.watchlist, artistId],
        })),
    }),
    [user],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
}
