// components/exercises/ExerciseErrorBoundary.tsx
'use client';

import React from 'react';
import Link from 'next/link';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ExerciseErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{error?: Error; reset: () => void}>;
}

export class ExerciseErrorBoundary extends React.Component<
  ExerciseErrorBoundaryProps, 
  ErrorBoundaryState
> {
  constructor(props: ExerciseErrorBoundaryProps) {
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
    this.setState({
      error,
      errorInfo
    });

    // Log error to monitoring service
    console.error('Exercise Error Boundary caught an error:', error, errorInfo);
    
    // You could send this to an error reporting service
    // reportError(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <this.props.fallback error={this.state.error} reset={this.handleReset} />;
      }

      return <DefaultErrorFallback error={this.state.error} reset={this.handleReset} />;
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error?: Error;
  reset: () => void;
}

function DefaultErrorFallback({ error, reset }: DefaultErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-6">😵</div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Oops! Something went wrong
          </h1>
          
          <p className="text-gray-600 mb-6">
            We encountered an unexpected error while loading the exercise. 
            Don&apos;t worry, your progress is safe!
          </p>

          {error && process.env.NODE_ENV === 'development' && (
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                Technical details (Development mode)
              </summary>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                {error.message}
                {error.stack}
              </pre>
            </details>
          )}
          
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              🔄 Try Again
            </button>
            
            <Link
              href="/exercises"
              className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              ← Back to Exercises
            </Link>
            
            <Link
              href="/"
              className="block w-full px-6 py-3 text-gray-500 hover:text-gray-700 transition-colors"
            >
              🏠 Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for functional components to trigger error boundaries
export function useErrorHandler() {
  return (error: Error, errorInfo?: {componentStack: string}) => {
    // In a real app, you might want to throw the error to trigger the boundary
    // For now, we'll just log it
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    throw error;
  };
}