import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service in production
    if (import.meta.env.PROD) {
      console.error('Error caught by boundary:', error, errorInfo);
      // You could send to a logging service here
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md text-center border border-white/10">
            <h2 className="text-2xl font-semibold text-white/90 mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-white/50 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gradient-to-r from-[#5227FF] to-[#FF9FFC] rounded-lg text-white font-medium hover:shadow-lg transition-all"
            >
              Reload Page
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 mt-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 transition-all ml-2"
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;