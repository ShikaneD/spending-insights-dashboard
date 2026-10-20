import { Component, type ReactNode } from 'react';

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="card">
        <h2>Something went wrong</h2>
        <p>Reload the page to try again. Your data hasn&apos;t changed.</p>
        <button type="button" onClick={() => window.location.reload()}>Reload page</button>
      </div>
    );
  }
}
