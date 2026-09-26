import React from 'react';

export default function ErrorState({ error, onRetry, onClearError }) {
  if (!error) return null;

  return (
    <div className="error-box" role="alert" aria-live="assertive">
      <div className="error-header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>Generation Failed</span>
      </div>

      <p className="error-message" id="input-error-msg">{error}</p>

      <div className="error-actions">
        {onRetry && (
          <button type="button" className="btn btn-primary" onClick={onRetry}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Try Again
          </button>
        )}

        {onClearError && (
          <button type="button" className="btn btn-secondary" onClick={onClearError}>
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
