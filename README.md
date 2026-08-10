# Earworm

A prototype for a music-artist prediction market: fans back artists each month with points
predicting growth, artists unlock reward tiers as cumulative backing rises, and a
growth-accuracy leaderboard ranks the best pickers. This is a frontend-only prototype built
against mock data — no backend, no real payments, no persistence.

## What's implemented

- **Artist composite score** (`src/lib/scoring.ts`) — the 8-metric, log-normalized,
  rank-weighted score from the spec, computed live across the mock artist pool.
- **Points economy** (`src/lib/points.ts`) — 100 pts/month allowance, up to 5 pts carryover,
  cumulative per-user-per-artist contributions that are never removed.
- **Reward tiers** (`src/lib/tiers.ts`) — threshold-based unlocks per artist.
- **Leaderboard math** (`src/lib/leaderboard.ts`) — Total Growth Points and Batting Average,
  computed per contribution using the artist's score at the time it was made.
- **Artist payout formula** (`src/lib/payout.ts`) — monthly payout pool split by
  `Points_a * growth multiplier`, with the 0.2 floor and cold-start neutral multiplier from
  the spec. (Not wired into any screen yet — there's no admin/artist-facing view.)
- **Screens**: Discover (artist list), Artist profile / backing (the screen designed in the
  spec — score card, growth badge, metrics grid, backing slider, reward tier ladder), and a
  Leaderboard screen (Global/Country, Growth Points/Batting Average). The discovery and
  leaderboard screens are explicitly rough placeholders — the spec hadn't designed them yet,
  they exist here just to make the app navigable end-to-end.

## Not implemented

Artist verification/onboarding, reward redemption flow, subscriptions/payments, any backend
or persistence, and the artist payout pool isn't exposed anywhere in the UI.

## Running it

```bash
npm install
npm run dev       # starts the app at http://localhost:5173
npm test          # runs the formula unit tests (vitest)
npm run build     # typecheck + production build
npm run lint       # oxlint
```

## Mock data

`src/data/artists.ts` and `src/data/user.ts` seed a handful of artists and a sample user with
a contribution history spanning a few months, so the leaderboard and growth-badge math has
something realistic to compute over.
