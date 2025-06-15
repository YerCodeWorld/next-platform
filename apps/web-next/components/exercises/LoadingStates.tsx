'use client';

import React from 'react';
import '../../styles/exercises/variables.css';
import '../../styles/exercises/base.css';
import '../../styles/exercises/loading.css';

// Skeleton loaders for different components
export function PackageCardSkeleton() {
  return (
    <div className="package-card-skeleton">
      <div className="skeleton-content">
        <div className="skeleton-header">
          <div className="skeleton-title" />
          <div className="skeleton-difficulty" />
        </div>
        <div className="skeleton-description" />
        <div className="skeleton-stats">
          <div className="skeleton-stat" />
          <div className="skeleton-stat" />
          <div className="skeleton-stat" />
        </div>
        <div className="skeleton-progress" />
        <div className="skeleton-actions">
          <div className="skeleton-button" />
          <div className="skeleton-button" />
        </div>
      </div>
    </div>
  );
}

export function ExerciseListSkeleton() {
  return (
    <div className="exercise-list-skeleton">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="exercise-item-skeleton">
          <div className="skeleton-icon" />
          <div className="skeleton-content">
            <div className="skeleton-title" />
            <div className="skeleton-meta" />
          </div>
          <div className="skeleton-actions">
            <div className="skeleton-button-sm" />
            <div className="skeleton-button-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PackageDetailSkeleton() {
  return (
    <div className="package-detail-skeleton">
      <div className="skeleton-hero">
        <div className="skeleton-hero-content">
          <div className="skeleton-title-large" />
          <div className="skeleton-description-large" />
          <div className="skeleton-stats-row">
            <div className="skeleton-stat-large" />
            <div className="skeleton-stat-large" />
            <div className="skeleton-stat-large" />
          </div>
          <div className="skeleton-actions-large">
            <div className="skeleton-button-large" />
            <div className="skeleton-button-large" />
          </div>
        </div>
      </div>
      
      <div className="skeleton-tabs">
        <div className="skeleton-tab" />
        <div className="skeleton-tab" />
        <div className="skeleton-tab" />
      </div>
      
      <div className="skeleton-content">
        <ExerciseListSkeleton />
      </div>
    </div>
  );
}

export function PracticeSkeleton() {
  return (
    <div className="practice-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-progress-bar" />
        <div className="skeleton-stats">
          <div className="skeleton-timer" />
          <div className="skeleton-lives" />
        </div>
      </div>
      
      <div className="skeleton-question">
        <div className="skeleton-question-title" />
        <div className="skeleton-question-content">
          <div className="skeleton-answer" />
          <div className="skeleton-answer" />
          <div className="skeleton-answer" />
          <div className="skeleton-answer" />
        </div>
      </div>
      
      <div className="skeleton-actions">
        <div className="skeleton-button" />
        <div className="skeleton-button" />
      </div>
    </div>
  );
}

// General loading spinners and states
export function LoadingSpinner({ size = 'medium', text }: { size?: 'small' | 'medium' | 'large'; text?: string }) {
  return (
    <div className={`loading-spinner loading-spinner-${size}`}>
      <div className="spinner" />
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}

export function LoadingOverlay({ children, isLoading, text }: { 
  children: React.ReactNode; 
  isLoading: boolean; 
  text?: string; 
}) {
  return (
    <div className="loading-overlay-container">
      {children}
      {isLoading && (
        <div className="loading-overlay">
          <LoadingSpinner size="large" text={text} />
        </div>
      )}
    </div>
  );
}

export function PageLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="page-loading">
      <div className="page-loading-content">
        <LoadingSpinner size="large" text={text} />
      </div>
    </div>
  );
}

// Button loading state
export function LoadingButton({ 
  children, 
  isLoading, 
  loadingText = 'Loading...', 
  className = '', 
  ...props 
}: {
  children: React.ReactNode;
  isLoading: boolean;
  loadingText?: string;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button 
      className={`btn ${className} ${isLoading ? 'loading' : ''}`} 
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="btn-spinner" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

// Empty states
export function EmptyState({ 
  icon, 
  title, 
  description, 
  action 
}: { 
  icon: string; 
  title: string; 
  description: string; 
  action?: React.ReactNode; 
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}

// Error states
export function ErrorState({ 
  title = 'Something went wrong', 
  description = 'An error occurred. Please try again.', 
  onRetry,
  showReload = true 
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  showReload?: boolean;
}) {
  return (
    <div className="error-state">
      <div className="error-state-icon">⚠️</div>
      <h3 className="error-state-title">{title}</h3>
      <p className="error-state-description">{description}</p>
      <div className="error-state-actions">
        {onRetry && (
          <button className="btn btn-primary" onClick={onRetry}>
            Try Again
          </button>
        )}
        {showReload && (
          <button className="btn btn-secondary" onClick={() => window.location.reload()}>
            Reload Page
          </button>
        )}
      </div>
    </div>
  );
}