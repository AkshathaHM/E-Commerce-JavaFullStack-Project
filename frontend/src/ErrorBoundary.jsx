import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-error-boundary">
          <div className="auth-page">
            <div className="auth-page__container">
              <div className="auth-card auth-card--error-boundary">
                <h1>Something went wrong.</h1>
                <p>Please refresh the page or try again later.</p>
                <button type="button" className="form-button" onClick={this.handleReload}>
                  Reload
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
