// packages/edu-exercises/src/components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';
import './styles/errorBoundary.css';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void; errorInfo?: React.ErrorInfo }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

/**
 * Error boundary component for catching and handling React component errors
 * Prevents the entire app from crashing when an exercise component fails
 */
export class ExerciseErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Exercise Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (handlerError) {
        console.error('Error in error boundary handler:', handlerError);
      }
    }
    
    // Log error details for debugging
    this.logError(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;
    
    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys && resetKeys.length > 0) {
        this.resetErrorBoundary();
      }
    }
    
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
  }

  private logError = (error: Error, errorInfo: React.ErrorInfo) => {
    const errorData = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // Store error in localStorage for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('exercise-errors') || '[]');
      existingErrors.push(errorData);
      
      // Keep only last 10 errors
      const recentErrors = existingErrors.slice(-10);
      localStorage.setItem('exercise-errors', JSON.stringify(recentErrors));
    } catch (storageError) {
      console.warn('Failed to store error in localStorage:', storageError);
    }
  };

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
    
    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined
      });
    }, 100);
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent 
            error={this.state.error!} 
            retry={this.resetErrorBoundary}
            errorInfo={this.state.errorInfo}
          />
        );
      }

      return <ExerciseErrorFallback error={this.state.error!} retry={this.resetErrorBoundary} />;
    }

    return this.props.children;
  }
}

/**
 * Default error fallback component
 */
export function ExerciseErrorFallback({ 
  error, 
  retry, 
  errorInfo 
}: { 
  error: Error; 
  retry: () => void; 
  errorInfo?: React.ErrorInfo;
}) {
  return (
    <div className="exercise-error-boundary">
      <div className="error-content">
        <h3>🚫 Something went wrong with this exercise</h3>
        <p>Don't worry, your progress is saved. You can try again or contact support if this keeps happening.</p>
        
        <div className="error-actions">
          <button 
            onClick={retry} 
            className="retry-button"
            type="button"
          >
            🔄 Try Again
          </button>
          
          <button 
            onClick={() => window.location.reload()} 
            className="refresh-button"
            type="button"
          >
            ↻ Refresh Page
          </button>
        </div>
        
        <details className="error-details">
          <summary>Technical Details (for developers)</summary>
          <div className="error-info">
            <p><strong>Error:</strong> {error.message}</p>
            {error.stack && (
              <pre className="error-stack">
                <code>{error.stack}</code>
              </pre>
            )}
            {errorInfo?.componentStack && (
              <pre className="component-stack">
                <code>{errorInfo.componentStack}</code>
              </pre>
            )}
          </div>
        </details>
      </div>
      
    </div>
  );
}

/**
 * Specialized error boundary for exercise creation/editing
 */
export function ExerciseBuilderErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ExerciseErrorBoundary 
      fallback={({ error, retry }) => (
        <div className="builder-error">
          <h4>❌ Exercise Builder Error</h4>
          <p>There was a problem with the exercise builder. Your work may be saved.</p>
          <p><strong>Error:</strong> {error.message}</p>
          <div className="builder-error-actions">
            <button onClick={retry}>🔄 Try Again</button>
            <button onClick={() => localStorage.removeItem('exercise-draft')}>
              🗑️ Clear Draft
            </button>
          </div>
          
        </div>
      )}
    >
      {children}
    </ExerciseErrorBoundary>
  );
}

/**
 * Specialized error boundary for exercise display
 */
export function ExerciseDisplayErrorBoundary({ 
  children, 
  exerciseId 
}: { 
  children: ReactNode; 
  exerciseId: string;
}) {
  return (
    <ExerciseErrorBoundary 
      resetKeys={[exerciseId]}
      fallback={({ error, retry }) => (
        <div className="display-error">
          <h4>⚠️ Exercise Display Error</h4>
          <p>This exercise couldn't be displayed properly.</p>
          <p><strong>Exercise ID:</strong> {exerciseId}</p>
          <p><strong>Error:</strong> {error.message}</p>
          <div className="display-error-actions">
            <button onClick={retry}>🔄 Retry</button>
            <button onClick={() => window.history.back()}>← Go Back</button>
          </div>
          
        </div>
      )}
    >
      {children}
    </ExerciseErrorBoundary>
  );
}