import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useArtists } from "../context/ArtistsContext";
import { METRIC_LABELS } from "../lib/scoring";
import { colorForName } from "../lib/format";
import type { ArtistMetrics, MetricKey, RewardTier } from "../types";

const STEPS = ["welcome", "basics", "metrics", "tiers", "review"] as const;
type WizardStep = (typeof STEPS)[number];
type Step = WizardStep | "confirmation";

const METRIC_KEYS = Object.keys(METRIC_LABELS) as MetricKey[];

interface TierDraft {
  id: string;
  threshold: string;
  title: string;
  description: string;
}

function emptyMetricInputs(): Record<MetricKey, string> {
  return METRIC_KEYS.reduce((acc, key) => {
    acc[key] = "";
    return acc;
  }, {} as Record<MetricKey, string>);
}

function newTierDraft(): TierDraft {
  return { id: Math.random().toString(36).slice(2), threshold: "", title: "", description: "" };
}

export function ArtistOnboardingScreen() {
  const { previewScore, submitArtist, verifyArtist, getArtist, scores, lastSubmittedId } = useArtists();

  // Resume at the confirmation screen if this session already submitted an application —
  // otherwise leaving the wizard (e.g. to preview the profile) and coming back would lose it.
  const [step, setStep] = useState<Step>(lastSubmittedId ? "confirmation" : "welcome");
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("");
  const [metricInputs, setMetricInputs] = useState<Record<MetricKey, string>>(emptyMetricInputs());
  const [tiers, setTiers] = useState<TierDraft[]>([newTierDraft()]);
  const [submittedId, setSubmittedId] = useState<string | null>(lastSubmittedId);

  const metrics: ArtistMetrics = useMemo(() => {
    return METRIC_KEYS.reduce((acc, key) => {
      acc[key] = Number(metricInputs[key]) || 0;
      return acc;
    }, {} as ArtistMetrics);
  }, [metricInputs]);

  const previewedScore = useMemo(() => previewScore(metrics), [metrics, previewScore]);
  const validTiers = tiers.filter((t) => t.title.trim() && Number(t.threshold) > 0);
  const submittedArtist = submittedId ? getArtist(submittedId) : undefined;
  const stepIndex = STEPS.indexOf(step as WizardStep);

  function updateTier(id: string, patch: Partial<TierDraft>) {
    setTiers((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  function handleSubmit() {
    const rewardTiers: RewardTier[] = validTiers.map((t, i) => ({
      id: `t${i + 1}`,
      threshold: Number(t.threshold),
      title: t.title.trim(),
      description: t.description.trim(),
    }));

    const id = submitArtist({
      name: name.trim(),
      genre: genre.trim(),
      location: location.trim(),
      country: country.trim(),
      avatarColor: colorForName(name.trim() || "Artist"),
      metrics,
      rewardTiers,
    });
    setSubmittedId(id);
    setStep("confirmation");
  }

  return (
    <div className="screen">
      <div className="top-bar" style={{ padding: 0 }}>
        <Link className="back-link" to="/portfolio">
          ← You
        </Link>
      </div>

      {step !== "confirmation" && (
        <div className="onboarding-progress">
          {STEPS.map((s, i) => (
            <div key={s} className={`dot ${i <= stepIndex ? "done" : ""}`} />
          ))}
        </div>
      )}

      {step === "welcome" && (
        <div className="card">
          <p className="section-title" style={{ marginBottom: 10 }}>
            Join Earworm as an artist
          </p>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
            Fans back you with monthly points, unlock the reward tiers you set, and you earn a share of
            the subscriber pool based on how much you're backed and how much you grow.
          </p>
          <ul style={{ fontSize: 13, color: "var(--text-secondary)", paddingLeft: 18, margin: "12px 0 0", lineHeight: 1.7 }}>
            <li>Set your own reward tiers — merch, unreleased tracks, meet &amp; greets</li>
            <li>Get a composite Earworm Score built from your real audience metrics</li>
            <li>Earn a monthly payout split by how much you're backed and how you grow</li>
          </ul>
          <button className="confirm-btn" style={{ marginTop: 16 }} onClick={() => setStep("basics")}>
            Get started
          </button>
        </div>
      )}

      {step === "basics" && (
        <div className="card">
          <p className="section-title" style={{ marginBottom: 10 }}>
            Tell us about you
          </p>
          <div className="form-stack">
            <div className="field">
              <label htmlFor="ob-name">Artist / band name</label>
              <input id="ob-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nova Wren" />
            </div>
            <div className="field">
              <label htmlFor="ob-genre">Genre</label>
              <input id="ob-genre" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="e.g. Pop" />
            </div>
            <div className="field">
              <label htmlFor="ob-location">City, region</label>
              <input
                id="ob-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Austin, USA"
              />
            </div>
            <div className="field">
              <label htmlFor="ob-country">Country</label>
              <input id="ob-country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. USA" />
            </div>
          </div>
          <div className="step-nav" style={{ marginTop: 16 }}>
            <button className="confirm-btn secondary" onClick={() => setStep("welcome")}>
              Back
            </button>
            <button
              className="confirm-btn"
              disabled={!name.trim() || !genre.trim() || !location.trim() || !country.trim()}
              onClick={() => setStep("metrics")}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === "metrics" && (
        <div className="card">
          <p className="section-title" style={{ marginBottom: 4 }}>
            Verify your reach
          </p>
          <p className="rough-note" style={{ marginBottom: 10 }}>
            In production this would connect live via the Spotify, Instagram, TikTok, and SoundCloud APIs.
            For this prototype, enter your own numbers.
          </p>
          <div className="form-stack">
            {METRIC_KEYS.map((key) => (
              <div className="field" key={key}>
                <label htmlFor={`ob-${key}`}>{METRIC_LABELS[key]}</label>
                <input
                  id={`ob-${key}`}
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={metricInputs[key]}
                  onChange={(e) => setMetricInputs((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
          <div className="step-nav" style={{ marginTop: 16 }}>
            <button className="confirm-btn secondary" onClick={() => setStep("basics")}>
              Back
            </button>
            <button className="confirm-btn" onClick={() => setStep("tiers")}>
              Continue
            </button>
          </div>
        </div>
      )}

      {step === "tiers" && (
        <div className="card">
          <p className="section-title" style={{ marginBottom: 10 }}>
            Set your reward tiers
          </p>
          <div className="form-stack">
            {tiers.map((tier, i) => (
              <div className="tier-editor-row" key={tier.id}>
                <div className="tier-editor-head">
                  <span>Tier {i + 1}</span>
                  {tiers.length > 1 && (
                    <button
                      className="remove-link"
                      onClick={() => setTiers((prev) => prev.filter((t) => t.id !== tier.id))}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="field">
                  <label htmlFor={`tier-threshold-${tier.id}`}>Points threshold</label>
                  <input
                    id={`tier-threshold-${tier.id}`}
                    type="number"
                    min={0}
                    value={tier.threshold}
                    onChange={(e) => updateTier(tier.id, { threshold: e.target.value })}
                    placeholder="e.g. 50"
                  />
                </div>
                <div className="field">
                  <label htmlFor={`tier-title-${tier.id}`}>Reward title</label>
                  <input
                    id={`tier-title-${tier.id}`}
                    value={tier.title}
                    onChange={(e) => updateTier(tier.id, { title: e.target.value })}
                    placeholder="e.g. Early access post"
                  />
                </div>
                <div className="field">
                  <label htmlFor={`tier-desc-${tier.id}`}>Description</label>
                  <input
                    id={`tier-desc-${tier.id}`}
                    value={tier.description}
                    onChange={(e) => updateTier(tier.id, { description: e.target.value })}
                    placeholder="e.g. See the next single before anyone else"
                  />
                </div>
              </div>
            ))}
            <button className="add-tier-btn" onClick={() => setTiers((prev) => [...prev, newTierDraft()])}>
              + Add another tier
            </button>
          </div>
          <div className="step-nav" style={{ marginTop: 16 }}>
            <button className="confirm-btn secondary" onClick={() => setStep("metrics")}>
              Back
            </button>
            <button className="confirm-btn" disabled={validTiers.length === 0} onClick={() => setStep("review")}>
              Continue
            </button>
          </div>
        </div>
      )}

      {step === "review" && (
        <>
          <div className="card score-card">
            <div>
              <div className="score-value">{previewedScore.toFixed(1)}</div>
              <div className="score-label">Your Earworm score</div>
            </div>
          </div>
          <p className="rough-note">
            This is a cold-start score — you have no prior baseline yet, so growth reads as neutral until
            next month (the spec's cold-start rule).
          </p>
          <div className="card">
            <p className="section-title" style={{ marginBottom: 4 }}>
              {name}
            </p>
            <p className="sub">
              {genre} · {location}
            </p>
          </div>
          <div className="card">
            <p className="section-title" style={{ marginBottom: 4 }}>
              Reward tiers
            </p>
            {validTiers.map((t) => (
              <div key={t.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>
                  {t.title} · {t.threshold} pts
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{t.description}</div>
              </div>
            ))}
          </div>
          <div className="step-nav">
            <button className="confirm-btn secondary" onClick={() => setStep("tiers")}>
              Back
            </button>
            <button className="confirm-btn" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </>
      )}

      {step === "confirmation" && submittedArtist && (
        <>
          <div className="card">
            {submittedArtist.verificationStatus === "pending" ? (
              <span className="pending-status-badge">⏳ Pending verification</span>
            ) : (
              <span className="verified-badge">✓ Verified</span>
            )}
            <div className="score-value" style={{ marginTop: 14 }}>
              {(scores[submittedArtist.id] ?? submittedArtist.scoreAtMonthStart).toFixed(1)}
            </div>
            <div className="score-label">Your Earworm score</div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 12, lineHeight: 1.5 }}>
              {submittedArtist.verificationStatus === "pending"
                ? "Your application is in for review. In production our team verifies your metrics before you go live — for this prototype, simulate that approval below."
                : "You're verified! Fans can now discover and back you."}
            </p>
          </div>

          <div className="step-nav">
            <Link
              className="confirm-btn secondary"
              to={`/artist/${submittedArtist.id}`}
              style={{ textAlign: "center", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              Preview your profile
            </Link>
            {submittedArtist.verificationStatus === "pending" ? (
              <button className="confirm-btn" onClick={() => verifyArtist(submittedArtist.id)}>
                Simulate approval
              </button>
            ) : (
              <Link
                className="confirm-btn"
                to="/"
                style={{ textAlign: "center", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                View in Discover
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
