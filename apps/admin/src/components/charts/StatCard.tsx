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
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-white/80 shadow-sm ring-1 ring-black/5">
              <Icon className="h-4 w-4" />
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
