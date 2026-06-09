import { Card, CardContent } from '@tsi/ui';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trendPct?: number;
  trendLabel?: string;
  accent?: 'brand' | 'earth' | 'rose';
  children?: ReactNode;
  index?: number;
}

const accentMap = {
  brand: 'from-brand-100 via-white to-white text-brand-700',
  earth: 'from-earth-100 via-white to-white text-earth-800',
  rose: 'from-rose-100 via-white to-white text-rose-700',
} as const;

export function StatCard({
  label,
  value,
  icon: Icon,
  trendPct,
  trendLabel,
  accent = 'brand',
  children,
  index = 0,
}: StatCardProps) {
  const positive = (trendPct ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
    >
      <Card className={`bg-gradient-to-br ${accentMap[accent]} shadow-sm transition-shadow hover:shadow-md`}>
        <CardContent className="p-3.5 lg:p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground lg:text-xs">{label}</p>
              <p className="mt-1.5 truncate text-xl font-bold tracking-tight text-foreground lg:mt-2 lg:text-3xl">{value}</p>
            </div>
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/80 shadow-sm ring-1 ring-black/5 lg:h-10 lg:w-10">
              <Icon className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
            </div>
          </div>
          {trendPct !== undefined ? (
            <div className="mt-3 flex items-center gap-1.5 text-xs font-medium">
              <span
                className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 ${
                  positive
                    ? 'bg-brand-100 text-brand-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(trendPct).toFixed(1)}%
              </span>
              {trendLabel ? (
                <span className="text-muted-foreground">{trendLabel}</span>
              ) : null}
            </div>
          ) : null}
          {children ? <div className="mt-3">{children}</div> : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}
