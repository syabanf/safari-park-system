import type { ReactNode } from 'react';
import { ErrorBoundary } from './components/feedback/ErrorBoundary';

interface AppProps {
  children: ReactNode;
}

export function App({ children }: AppProps) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground">{children}</div>
    </ErrorBoundary>
  );
}
