import React from 'react';

export default function ProgressBar({
  currentIndex,
  totalCards,
}) {
  const currentNum = Math.min(currentIndex + 1, totalCards);
  const percentage = totalCards > 0 ? Math.round((currentNum / totalCards) * 100) : 0;

  return (
    <div className="progress-card" aria-label="Study progress">
      <div className="progress-info">
        <span className="progress-count">
          Card {currentNum} of {totalCards}
        </span>
        <span className="progress-pct">{percentage}% Complete</span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
