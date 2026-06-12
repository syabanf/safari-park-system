import { AlertTriangle, RotateCw, type LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './button';

interface ErrorStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  /** When provided, renders a retry button. */
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

/**
 * A calm, on-brand failure state for data that didn't load — icon + title +
 * hint + an optional Retry button. Pass translated strings from the caller;
 * the English defaults are only a fallback.
 */
export function ErrorState({
  icon: Icon = AlertTriangle,
  title = 'Something went wrong',
  description = "We couldn't load this just now. Please try again.",
  onRetry,
  retryLabel = 'Try again',
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-2 px-6 py-12 text-center', className)}>
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-500">
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-1 text-sm font-semibold text-foreground">{title}</p>
      {description ? (
        <p className="max-w-[18rem] text-xs leading-snug text-muted-foreground">{description}</p>
      ) : null}
      {onRetry ? (
        <Button size="sm" variant="outline" className="mt-2 gap-1.5" onClick={onRetry}>
          <RotateCw className="h-3.5 w-3.5" />
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
