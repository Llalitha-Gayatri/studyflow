import React from 'react';

export default function LoadingState({ topic }) {
  return (
    <div className="loading-box" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <div>
        <h3 className="loading-text">Creating your study cards...</h3>
        <p className="loading-subtext">
          {topic
            ? `Generating tailored flashcards for "${topic}"...`
            : 'Analyzing your notes and extracting key concepts...'}
        </p>
      </div>
    </div>
  );
}
