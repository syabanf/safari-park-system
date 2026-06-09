import type { ReactNode } from 'react';
import { ErrorBoundary } from './components/feedback/ErrorBoundary';

export function App({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen text-foreground">{children}</div>
    </ErrorBoundary>
  );
}
