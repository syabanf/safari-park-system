import type { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

/** A warm, friendly placeholder for empty lists — icon + title + hint. */
export function EmptyState({ icon: Icon, title, description, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-2 px-6 py-12 text-center', className)}>
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-1 text-sm font-semibold text-foreground">{title}</p>
      {description ? (
        <p className="max-w-[15rem] text-xs leading-snug text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
