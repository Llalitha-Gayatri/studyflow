import React from 'react';

export default function Flashcard({
  card,
  isFlipped,
  onFlip,
  isMarkedForReview,
  index,
  total,
}) {
  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onFlip();
    }
  };

  return (
    <div className="flashcard-wrapper">
      <div
        className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}
        onClick={onFlip}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`Flashcard ${index + 1} of ${total}. Current side: ${
          isFlipped ? 'Answer' : 'Question'
        }. Press Space or Enter to flip.`}
        aria-expanded={isFlipped}
      >
        <div className="flashcard-face front">
          <div className="card-top-bar">
            <span className="card-type-tag question">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Question
            </span>

            {isMarkedForReview ? (
              <span className="card-tag-status marked" title="Marked for review">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Marked for Review
              </span>
            ) : (
              <span className="card-tag-status neutral">Click to Reveal Answer</span>
            )}
          </div>

          <div className="card-content-area">
            <h3 className="card-text">{card.question}</h3>
          </div>

          <div className="card-bottom-bar">
            <div className="card-footer-hint">
              <svg className="flip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 16h5v5" />
              </svg>
              <span>Click anywhere or press <kbd>Space</kbd> to reveal</span>
            </div>

            <button
              type="button"
              className="card-reveal-btn"
              onClick={(e) => {
                e.stopPropagation();
                onFlip();
              }}
              aria-label="Reveal Answer"
            >
              Reveal Answer →
            </button>
          </div>
        </div>

        <div className="flashcard-face back">
          <div className="card-top-bar">
            <span className="card-type-tag answer">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Answer
            </span>

            {isMarkedForReview ? (
              <span className="card-tag-status marked" title="Marked for review">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Marked for Review
              </span>
            ) : (
              <span className="card-tag-status neutral">Click to View Question</span>
            )}
          </div>

          <div className="card-content-area">
            <p className="card-text answer-text">{card.answer}</p>
          </div>

          <div className="card-bottom-bar">
            <div className="card-footer-hint">
              <svg className="flip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 16h5v5" />
              </svg>
              <span>Click anywhere to flip back</span>
            </div>

            <button
              type="button"
              className="card-reveal-btn secondary"
              onClick={(e) => {
                e.stopPropagation();
                onFlip();
              }}
              aria-label="View Question"
            >
              ← View Question
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
