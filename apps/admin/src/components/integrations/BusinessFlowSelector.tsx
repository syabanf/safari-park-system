import { Card, CardContent } from '@tsi/ui';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  Clock,
  Database,
  KeyRound,
  Receipt,
  ScanLine,
  ShoppingCart,
  Sparkles,
  Timer,
  Wallet,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { BusinessFlow, type FlowStage } from './BusinessFlow';

export type FlowCategory =
  | 'gate'
  | 'transaction'
  | 'risk'
  | 'catalogue'
  | 'lifecycle'
  | 'security'
  | 'engagement'
  | 'reconciliation';

export interface BusinessFlowDef {
  key: string;
  label: string;
  description: string;
  category: FlowCategory;
  frequency: string;
  todayVolume: number;
  lastActivity: string;
  successRatePct: number;
  stages: FlowStage[];
}

interface Props {
  flows: BusinessFlowDef[];
  /** Optional: pre-select a flow by key. Defaults to first. */
  initialFlowKey?: string;
  /** When provided, highlight this stage on the selected flow. */
  highlightStageKey?: string | null;
}

const categoryMeta: Record<FlowCategory, { label: string; icon: LucideIcon; tone: string }> = {
  gate: { label: 'Gate', icon: ScanLine, tone: 'bg-brand-100 text-brand-800' },
  transaction: { label: 'Transaction', icon: ShoppingCart, tone: 'bg-blue-100 text-blue-800' },
  risk: { label: 'Risk', icon: AlertTriangle, tone: 'bg-amber-100 text-amber-800' },
  catalogue: { label: 'Catalogue', icon: Database, tone: 'bg-purple-100 text-purple-800' },
  lifecycle: { label: 'Lifecycle', icon: Clock, tone: 'bg-slate-100 text-slate-800' },
  security: { label: 'Security', icon: KeyRound, tone: 'bg-rose-100 text-rose-800' },
  engagement: { label: 'Engagement', icon: Sparkles, tone: 'bg-pink-100 text-pink-800' },
  reconciliation: { label: 'Reconciliation', icon: Receipt, tone: 'bg-teal-100 text-teal-800' },
};

const num = new Intl.NumberFormat('id-ID');

function timeAgo(iso: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function BusinessFlowSelector({ flows, initialFlowKey, highlightStageKey }: Props) {
  const [selectedKey, setSelectedKey] = useState(initialFlowKey ?? flows[0]?.key ?? '');
  const flow = flows.find((f) => f.key === selectedKey) ?? flows[0];

  if (!flow) return null;
  const meta = categoryMeta[flow.category];
  const Icon = meta.icon;

  return (
    <div className="space-y-3">
      {/* Flow chips */}
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">All business flows</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Every process where this vendor touches the business. Pick one to see its pipeline.
              </p>
            </div>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${meta.tone}`}>
              <Icon className="h-3 w-3" />
              {meta.label}
            </span>
          </div>
          <div className="-mx-1 flex flex-wrap items-center gap-1.5 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {flows.map((f) => {
              const fm = categoryMeta[f.category];
              const FIcon = fm.icon;
              const active = f.key === selectedKey;
              return (
                <motion.button
                  key={f.key}
                  type="button"
                  onClick={() => setSelectedKey(f.key)}
                  whileTap={{ scale: 0.97 }}
                  className={`group flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors ${
                    active
                      ? 'border-foreground/20 bg-foreground/[0.04] shadow-sm'
                      : 'border-border/60 bg-white/60 hover:border-border hover:bg-white'
                  }`}
                >
                  <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${fm.tone}`}>
                    <FIcon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold leading-tight">{f.label}</p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {num.format(f.todayVolume)} today · {f.successRatePct}% ok
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected flow meta strip */}
      <Card>
        <CardContent className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
          <Meta icon={<Activity className="h-3.5 w-3.5" />} label="Today" value={num.format(flow.todayVolume)} hint="runs" />
          <Meta
            icon={<Wallet className="h-3.5 w-3.5" />}
            label="Success rate"
            value={`${flow.successRatePct}%`}
            hint="last 24h"
            tone={flow.successRatePct >= 99.5 ? 'ok' : flow.successRatePct >= 98 ? 'warn' : 'rose'}
          />
          <Meta icon={<CalendarClock className="h-3.5 w-3.5" />} label="Frequency" value={flow.frequency} hint="" />
          <Meta icon={<Timer className="h-3.5 w-3.5" />} label="Last activity" value={timeAgo(flow.lastActivity)} hint="" />
        </CardContent>
      </Card>

      {/* Selected flow's pipeline */}
      <BusinessFlow
        description={flow.description}
        stages={flow.stages}
        highlightStageKey={highlightStageKey ?? undefined}
      />
    </div>
  );
}

function Meta({
  icon,
  label,
  value,
  hint,
  tone = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  tone?: 'default' | 'ok' | 'warn' | 'rose';
}) {
  const tones = {
    default: 'bg-muted text-foreground',
    ok: 'bg-brand-100 text-brand-800',
    warn: 'bg-amber-100 text-amber-800',
    rose: 'bg-rose-100 text-rose-800',
  } as const;
  return (
    <div className="flex items-start gap-2">
      <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${tones[tone]}`}>
        {tone !== 'default' && value.endsWith('%') ? <Wallet className="h-3.5 w-3.5" /> : icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold tracking-tight">{value}</p>
        {hint ? <p className="truncate text-[10px] text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
}

// Silence unused-import lint by re-exporting; some icon imports are
// declared above for future-flow categories not currently in use.
export { XCircle };
