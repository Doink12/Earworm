import { useState } from "react";

interface BackingSliderProps {
  remainingAllowance: number;
  onConfirm: (points: number) => void;
  justConfirmedPoints: number | null;
}

export function BackingSlider({ remainingAllowance, onConfirm, justConfirmedPoints }: BackingSliderProps) {
  const [points, setPoints] = useState(0);
  const maxable = remainingAllowance;

  if (maxable <= 0) {
    return (
      <div className="card">
        <p className="section-title">Your backing this month</p>
        <p className="empty-state">You've allocated all of this month's points. Come back next cycle.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <p className="section-title">Your backing this month</p>
      <p className="backing-remaining">
        <strong>{maxable}</strong> of your monthly allowance left to allocate
      </p>
      <div className="slider-row">
        <input
          type="range"
          min={0}
          max={maxable}
          step={5}
          value={points}
          onChange={(e) => setPoints(Number(e.target.value))}
          aria-label="Points to back this artist with"
        />
        <span className="slider-value">{points} pts</span>
      </div>
      <button
        className="confirm-btn"
        disabled={points <= 0}
        onClick={() => {
          onConfirm(points);
          setPoints(0);
        }}
      >
        Back with {points} pts
      </button>
      {justConfirmedPoints !== null && (
        <p className="toast">Backed with {justConfirmedPoints} pts — locked in for the rest of this month.</p>
      )}
    </div>
  );
}
