import React from 'react';

export default function ReviewSummary({
  topic,
  totalCards,
  reviewCount,
  knownCount,
  onReviewDifficult,
  onResetTopic,
  onRestartAll,
}) {
  const hasReviewCards = reviewCount > 0;

  return (
    <section className="summary-container" aria-label="Study session summary">
      <div className="summary-icon-wrap" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>

      <h2 className="summary-title">Study Session Complete!</h2>
      <p className="summary-subtitle">
        You went through all flashcards for <strong>{topic}</strong>. Here is your mastery summary:
      </p>

      <div className="summary-stats-grid">
        <div className="stat-box">
          <span className="num">{totalCards}</span>
          <span className="label">Total Cards</span>
        </div>
        <div className="stat-box success">
          <span className="num">{knownCount}</span>
          <span className="label">Mastered</span>
        </div>
        <div className="stat-box review">
          <span className="num">{reviewCount}</span>
          <span className="label">Needs Review</span>
        </div>
      </div>

      <div className="summary-actions">
        {hasReviewCards && (
          <button
            type="button"
            className="btn btn-review"
            onClick={onReviewDifficult}
          >
            Review Difficult Cards ({reviewCount})
          </button>
        )}

        <button
          type="button"
          className="btn btn-secondary"
          onClick={onRestartAll}
        >
          Study All Cards Again
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onResetTopic}
        >
          Create New Study Set
        </button>
      </div>
    </section>
  );
}
