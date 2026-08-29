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
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '24px', 
          background: '#0f172a', 
          border: '1.5px solid var(--color-sell)', 
          borderRadius: '8px', 
          color: '#f8fafc', 
          margin: '20px', 
          fontFamily: 'var(--font-mono)',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
          maxWidth: '800px'
        }}>
          <h2 style={{ color: 'var(--color-sell)', marginTop: 0, fontSize: '1.2rem', fontWeight: 600 }}>
            ⚠️ Terminal Render Exception
          </h2>
          <p style={{ fontWeight: 600, fontSize: '0.85rem', margin: '12px 0 6px 0', color: '#f1f5f9' }}>
            {this.state.error?.toString()}
          </p>
          <pre style={{ 
            background: '#020617', 
            padding: '12px', 
            borderRadius: '6px', 
            overflowX: 'auto', 
            fontSize: '0.7rem',
            color: '#cbd5e1',
            border: '1px solid var(--border-color)',
            lineHeight: '1.4'
          }}>
            {this.state.error?.stack}
          </pre>
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button 
              className="btn btn-primary" 
              style={{ padding: '6px 16px', fontSize: '0.8rem', cursor: 'pointer' }} 
              onClick={() => this.setState({ hasError: false })}
            >
              Retry Render
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '6px 16px', fontSize: '0.8rem', cursor: 'pointer' }} 
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
