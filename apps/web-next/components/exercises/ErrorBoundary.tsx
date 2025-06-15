'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import '../../styles/exercises/variables.css';
import '../../styles/exercises/base.css';
import '../../styles/exercises/error.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Exercise System Error:', error);
    console.error('Error Info:', errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-boundary-icon">
              <div className="error-icon">⚠️</div>
            </div>
            
            <div className="error-boundary-text">
              <h2>Something went wrong</h2>
              <p>The exercise system encountered an unexpected error. Please try again.</p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="error-details">
                  <summary>Technical Details</summary>
                  <pre className="error-stack">
                    {this.state.error.name}: {this.state.error.message}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            <div className="error-boundary-actions">
              <button 
                className="btn btn-primary"
                onClick={this.handleRetry}
              >
                Try Again
              </button>
              <button 
                className="btn btn-secondary"
                onClick={this.handleReload}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component for easier usage
interface ExerciseErrorBoundaryProps {
  children: ReactNode;
  context?: string;
}

export function ExerciseErrorBoundary({ children, context }: ExerciseErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Could send to error reporting service
    console.error(`Exercise Error in ${context}:`, error, errorInfo);
  };

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  );
}