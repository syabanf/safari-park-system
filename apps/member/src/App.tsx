import { MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';
import { ErrorBoundary } from './components/feedback/ErrorBoundary';

interface AppProps {
  children: ReactNode;
}

export function App({ children }: AppProps) {
  return (
    <ErrorBoundary>
      {/* Honour the OS "reduce motion" setting across all framer-motion animations. */}
      <MotionConfig reducedMotion="user">
        <div className="min-h-screen bg-background text-foreground">{children}</div>
      </MotionConfig>
    </ErrorBoundary>
  );
}
