import type { ArtistMetrics } from "../types";
import { METRIC_LABELS } from "../lib/scoring";
import { formatCompactNumber } from "../lib/format";

const DISPLAY_ORDER: (keyof ArtistMetrics)[] = [
  "spotifyFollowers",
  "spotifyListeners",
  "instagramFollowers",
  "ticketsSold",
  "tiktokFollowers",
  "soundcloudFollowers",
  "soundcloudStreams",
  "festivalsPlayed",
];

export function MetricsGrid({ metrics }: { metrics: ArtistMetrics }) {
  return (
    <div className="metrics-grid">
      {DISPLAY_ORDER.map((key) => (
        <div className="metric-tile" key={key}>
          <div className="metric-value">{formatCompactNumber(metrics[key])}</div>
          <div className="metric-label">{METRIC_LABELS[key]}</div>
        </div>
      ))}
    </div>
  );
}
