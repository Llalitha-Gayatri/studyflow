import React, { useRef } from 'react';

const SUGGESTIONS = [
  {
    label: 'DBMS Normalization (1NF–BCNF)',
    text: 'DBMS normalization covering 1NF, 2NF, 3NF and BCNF',
  },
  {
    label: 'Operating Systems & Deadlocks',
    text: 'Operating Systems: Process Synchronization, Semaphores & Deadlocks',
  },
  {
    label: 'JavaScript Internals & Event Loop',
    text: 'JavaScript: Event Loop, Microtasks, Closures & Promises',
  },
  {
    label: 'Computer Networks & OSI Model',
    text: 'Computer Networks: OSI 7-Layer Model, TCP vs UDP & Handshake',
  },
];

const COUNT_OPTIONS = [5, 8, 10, 15];

export default function PromptInput({
  input,
  setInput,
  cardCount = 10,
  setCardCount,
  onGenerate,
  isLoading,
  error,
}) {
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate();
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        onGenerate();
      }
    }
  };

  const handlePillClick = (suggestionText) => {
    setInput(suggestionText);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(suggestionText.length, suggestionText.length);
      }
    }, 10);
  };

  const handleClear = () => {
    setInput('');
    textareaRef.current?.focus();
  };

  return (
    <section className="input-section" aria-label="Topic input section">
      <div className="input-label-row">
        <label htmlFor="prompt-input" className="input-label">
          What do you want to learn today?
        </label>
        <span className="input-hint">Ctrl + Enter to generate</span>
      </div>

      <div className="textarea-container">
        <textarea
          ref={textareaRef}
          id="prompt-input"
          className="prompt-textarea"
          placeholder="Paste your notes or describe what you want to study (e.g. 'Create flashcards for React hooks: useState, useEffect, useRef')..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'input-error-msg' : undefined}
          rows={4}
        />
        {input.length > 0 && !isLoading && (
          <button
            type="button"
            className="clear-input-btn"
            onClick={handleClear}
            title="Clear prompt"
            aria-label="Clear input text"
          >
            ✕
          </button>
        )}
      </div>

      <div className="suggestions-block">
        <span className="suggestions-title">Quick Suggestion Pills:</span>
        <div className="suggestions-pills" role="list">
          {SUGGESTIONS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              className="suggestion-pill"
              onClick={() => handlePillClick(item.text)}
              disabled={isLoading}
              title={`Click to populate: "${item.text}"`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="pill-spark-icon">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="input-actions">
        <div className="card-count-control">
          <span id="card-count-label" className="card-count-label">
            Number of flashcards:
          </span>
          <div
            className="card-count-options"
            role="radiogroup"
            aria-labelledby="card-count-label"
          >
            {COUNT_OPTIONS.map((count) => {
              const isSelected = cardCount === count;
              return (
                <button
                  key={count}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`count-pill-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => setCardCount && setCardCount(count)}
                  disabled={isLoading}
                  title={`Generate ${count} flashcards`}
                >
                  {count}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-generate"
          onClick={handleSubmit}
          disabled={isLoading || !input.trim()}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
              Generating Cards...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
              </svg>
              Generate Flashcards
            </>
          )}
        </button>
      </div>
    </section>
  );
}
