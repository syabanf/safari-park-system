import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface QuickActionProps {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  asChild?: boolean;
  children?: ReactNode;
  className?: string;
  accent?: 'brand' | 'earth' | 'rose' | 'slate';
}

const accentMap = {
  brand: 'bg-brand-100 text-brand-800',
  earth: 'bg-earth-100 text-earth-800',
  rose: 'bg-rose-100 text-rose-800',
  slate: 'bg-slate-100 text-slate-800',
} as const;

export function QuickAction({
  label,
  icon: Icon,
  onClick,
  children,
  className,
  accent = 'brand',
}: QuickActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-white/80 p-3 backdrop-blur transition-all hover:border-brand-200 hover:bg-white hover:shadow-md hover:shadow-brand-900/5',
        className,
      )}
    >
      <span
        className={cn(
          'grid h-11 w-11 place-items-center rounded-xl transition-transform group-hover:scale-105',
          accentMap[accent],
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-[11px] font-medium leading-tight text-foreground">{label}</span>
      {children}
    </button>
  );
}
