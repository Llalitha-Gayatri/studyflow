import React, { useEffect, useCallback } from 'react';
import Flashcard from './Flashcard';
import ProgressBar from './ProgressBar';

export default function FlashcardDeck({
  topic,
  cards,
  currentIndex,
  setCurrentIndex,
  isFlipped,
  setIsFlipped,
  reviewCardIds,
  onMarkKnown,
  onMarkReview,
  onEnterReviewMode,
  onResetTopic,
  isReviewMode,
  onExitReviewMode,
}) {
  const currentCard = cards[currentIndex];
  const isFirstCard = currentIndex === 0;
  const isLastCard = currentIndex === cards.length - 1;
  const isMarkedForReview = currentCard ? reviewCardIds.has(currentCard.id) : false;

  const handlePrev = useCallback(() => {
    if (!isFirstCard) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [isFirstCard, setIsFlipped, setCurrentIndex]);

  const handleNext = useCallback(() => {
    if (!isLastCard) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [isLastCard, setIsFlipped, setCurrentIndex]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, [setIsFlipped]);

  // Keyboard navigation for card flipping, deck progression, and mastery marking
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handlePrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case ' ':
          e.preventDefault();
          handleFlip();
          break;
        case '1':
          if (currentCard) {
            e.preventDefault();
            onMarkKnown(currentCard.id);
          }
          break;
        case '2':
          if (currentCard) {
            e.preventDefault();
            onMarkReview(currentCard.id);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [currentCard, handlePrev, handleNext, handleFlip, onMarkKnown, onMarkReview]);

  if (!currentCard) {
    return null;
  }

  return (
    <section className="study-section" aria-label="Interactive study deck">
      <div className="study-header">
        <div className="topic-meta">
          <div className="topic-badge-row">
            <span className={`mode-badge ${isReviewMode ? 'review' : 'all'}`}>
              {isReviewMode ? 'Review Mode (Difficult Cards)' : 'Full Study Deck'}
            </span>
            <span className="card-counter-tag">
              Card {currentIndex + 1} of {cards.length}
            </span>
          </div>
          <h2 className="topic-title">{topic}</h2>
        </div>

        <div className="deck-header-actions">
          {isReviewMode && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onExitReviewMode}
              title="Return to the full study set"
            >
              ← Back to Full Deck
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onResetTopic}
            title="Start fresh with a new topic"
          >
            + Create New Study Set
          </button>
        </div>
      </div>

      <ProgressBar
        currentIndex={currentIndex}
        totalCards={cards.length}
      />

      <Flashcard
        card={currentCard}
        isFlipped={isFlipped}
        onFlip={handleFlip}
        isMarkedForReview={isMarkedForReview}
        index={currentIndex}
        total={cards.length}
      />

      <div className="card-controls">
        <div className="deck-nav-row">
          <div className="deck-nav-buttons">
            <button
              type="button"
              className="btn btn-secondary btn-nav"
              onClick={handlePrev}
              disabled={isFirstCard}
              aria-label="Previous card (Left Arrow)"
              title="Previous card (←)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Previous
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-nav"
              onClick={handleNext}
              disabled={isLastCard}
              aria-label="Next card (Right Arrow)"
              title="Next card (→)"
            >
              Next
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          <div className="action-buttons-group">
            <button
              type="button"
              className="btn btn-know"
              onClick={() => onMarkKnown(currentCard.id)}
              aria-label="Mark as known (Keyboard: 1)"
              title="Shortcut: Press 1"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Know it</span>
              <kbd className="btn-kbd">1</kbd>
            </button>

            <button
              type="button"
              className="btn btn-review"
              onClick={() => onMarkReview(currentCard.id)}
              aria-label="Mark for review again (Keyboard: 2)"
              title="Shortcut: Press 2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <span>Review again</span>
              <kbd className="btn-kbd">2</kbd>
            </button>
          </div>
        </div>

        <div className="review-stats-bar">
          <div className="review-stats-count">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <span>Difficult cards marked for review:</span>
            <span className="review-badge-num">{reviewCardIds.size}</span>
          </div>

          {!isReviewMode && reviewCardIds.size > 0 && (
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={onEnterReviewMode}
              title="Start focused practice on difficult cards"
            >
              Practice {reviewCardIds.size} Marked {reviewCardIds.size === 1 ? 'Card' : 'Cards'} →
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
