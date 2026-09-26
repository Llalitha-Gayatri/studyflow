import React from 'react';

export default function Header() {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="logo-badge" aria-hidden="true">
          <svg
            className="logo-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <path d="M8 7h8" />
            <path d="M8 11h6" />
          </svg>
        </div>
        <div className="brand-text">
          <h1>StudyFlow</h1>
          <p className="brand-tagline">Turn any topic into interactive flashcards.</p>
        </div>
      </div>
      <div className="header-actions">
        <span className="kb-badge" title="Use Arrow keys & Spacebar to navigate and flip cards">
          <kbd>Space</kbd> Flip
        </span>
      </div>
    </header>
  );
}
