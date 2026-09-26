import React, { useState, useRef, useMemo } from 'react';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import FlashcardDeck from './components/FlashcardDeck';
import ReviewSummary from './components/ReviewSummary';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import { generateFlashcards } from './lib/api';
import { validateFlashcardResult } from './lib/validateResult';
import './styles.css';

export default function App() {
  const [input, setInput] = useState('');
  const [cardCount, setCardCount] = useState(10);
  const [studyData, setStudyData] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [reviewCardIds, setReviewCardIds] = useState(new Set());
  const [knownCardIds, setKnownCardIds] = useState(new Set());
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Stale request protection: AbortController cancels network request; latestRequestIdRef discards out-of-order completions
  const latestRequestIdRef = useRef(0);
  const abortControllerRef = useRef(null);

  const handleGenerate = async (overridePrompt, overrideCount) => {
    const promptToUse = (typeof overridePrompt === 'string' ? overridePrompt : input).trim();
    const countToUse = typeof overrideCount === 'number' ? overrideCount : cardCount;

    if (!promptToUse) {
      setError('Enter a topic or paste some notes to get started.');
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const currentRequestId = ++latestRequestIdRef.current;

    setIsLoading(true);
    setError(null);
    setIsCompleted(false);

    try {
      const rawResponse = await generateFlashcards(promptToUse, countToUse, abortController.signal);

      if (currentRequestId !== latestRequestIdRef.current) {
        return;
      }

      const validation = validateFlashcardResult(rawResponse, countToUse);
      if (!validation.isValid) {
        throw new Error(validation.error || 'We received an unexpected response format. Please try again.');
      }

      setStudyData(validation.data);
      setCurrentIndex(0);
      setIsFlipped(false);
      setReviewCardIds(new Set());
      setKnownCardIds(new Set());
      setIsReviewMode(false);
      setIsCompleted(false);
      setError(null);
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }

      if (currentRequestId === latestRequestIdRef.current) {
        setError(err.message || 'Something went wrong while generating your cards.');
      }
    } finally {
      if (currentRequestId === latestRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  const activeCards = useMemo(() => {
    if (!studyData?.cards) return [];
    if (!isReviewMode) return studyData.cards;
    return studyData.cards.filter((card) => reviewCardIds.has(card.id));
  }, [studyData, isReviewMode, reviewCardIds]);

  const advanceDeckOrComplete = (nextIdx) => {
    setIsFlipped(false);
    if (nextIdx < activeCards.length) {
      setCurrentIndex(nextIdx);
    } else {
      setIsCompleted(true);
    }
  };

  const handleMarkKnown = (cardId) => {
    setKnownCardIds((prev) => {
      const next = new Set(prev);
      next.add(cardId);
      return next;
    });

    setReviewCardIds((prev) => {
      const next = new Set(prev);
      next.delete(cardId);
      return next;
    });

    advanceDeckOrComplete(currentIndex + 1);
  };

  const handleMarkReview = (cardId) => {
    setReviewCardIds((prev) => {
      const next = new Set(prev);
      next.add(cardId);
      return next;
    });

    setKnownCardIds((prev) => {
      const next = new Set(prev);
      next.delete(cardId);
      return next;
    });

    advanceDeckOrComplete(currentIndex + 1);
  };

  const handleEnterReviewMode = () => {
    if (reviewCardIds.size === 0) return;
    setIsReviewMode(true);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
  };

  const handleExitReviewMode = () => {
    setIsReviewMode(false);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
  };

  const handleRestartAll = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
    setIsReviewMode(false);
  };

  const handleResetTopic = () => {
    setStudyData(null);
    setInput('');
    setCurrentIndex(0);
    setIsFlipped(false);
    setReviewCardIds(new Set());
    setKnownCardIds(new Set());
    setIsReviewMode(false);
    setIsCompleted(false);
    setError(null);
  };

  return (
    <div className="app-container">
      <Header />

      <main>
        {!studyData && !isLoading && (
          <PromptInput
            input={input}
            setInput={setInput}
            cardCount={cardCount}
            setCardCount={setCardCount}
            onGenerate={() => handleGenerate()}
            isLoading={isLoading}
            error={error}
          />
        )}

        {isLoading && <LoadingState topic={input.slice(0, 40)} />}

        {error && !isLoading && (
          <div style={{ marginTop: studyData ? '1rem' : '1.5rem' }}>
            <ErrorState
              error={error}
              onRetry={() => handleGenerate()}
              onClearError={() => setError(null)}
            />
          </div>
        )}

        {!isLoading && studyData && isCompleted && (
          <ReviewSummary
            topic={studyData.topic}
            totalCards={studyData.cards.length}
            reviewCount={reviewCardIds.size}
            knownCount={knownCardIds.size}
            onReviewDifficult={handleEnterReviewMode}
            onRestartAll={handleRestartAll}
            onResetTopic={handleResetTopic}
          />
        )}

        {!isLoading && studyData && !isCompleted && activeCards.length > 0 && (
          <FlashcardDeck
            topic={studyData.topic}
            cards={activeCards}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            isFlipped={isFlipped}
            setIsFlipped={setIsFlipped}
            reviewCardIds={reviewCardIds}
            onMarkKnown={handleMarkKnown}
            onMarkReview={handleMarkReview}
            onEnterReviewMode={handleEnterReviewMode}
            onResetTopic={handleResetTopic}
            isReviewMode={isReviewMode}
            onExitReviewMode={handleExitReviewMode}
          />
        )}

        {!isLoading && studyData && !isCompleted && activeCards.length === 0 && isReviewMode && (
          <div className="summary-container" style={{ marginTop: '1.5rem' }}>
            <div className="summary-icon-wrap" aria-hidden="true" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3 className="summary-title">All Difficult Cards Mastered!</h3>
            <p className="summary-subtitle">You have reviewed and mastered every card in this review set.</p>
            <div className="summary-actions">
              <button type="button" className="btn btn-secondary" onClick={handleExitReviewMode}>
                ← Back to Full Deck
              </button>
              <button type="button" className="btn btn-primary" onClick={handleResetTopic}>
                Create New Study Set
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="shortcuts-panel" aria-label="Keyboard Shortcuts">
        <div className="shortcut-item">
          <kbd>Space</kbd> <span>Flip</span>
        </div>
        <div className="shortcut-item">
          <kbd>←</kbd> <kbd>→</kbd> <span>Prev / Next</span>
        </div>
        <div className="shortcut-item">
          <kbd>1</kbd> <span>Know it</span>
        </div>
        <div className="shortcut-item">
          <kbd>2</kbd> <span>Review again</span>
        </div>
      </footer>
    </div>
  );
}
