import { Card, CardContent } from '@tsi/ui';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Cog, Server } from 'lucide-react';

export interface FlowStage {
  key: string;
  label: string;
  description: string;
  count: number;
  system: 'WIT' | 'GT' | 'ESB';
  avgLatencyMs: number | null;
}

interface Props {
  description: string;
  stages: FlowStage[];
  /** When set, highlight which stage of the flow a row is stuck at. */
  highlightStageKey?: string | null;
  /** Show as a compact inline strip (no card chrome). */
  inline?: boolean;
}

const systemTone: Record<FlowStage['system'], string> = {
  WIT: 'bg-brand-100 text-brand-800 border-brand-300/70',
  GT: 'bg-blue-100 text-blue-800 border-blue-300/70',
  ESB: 'bg-earth-100 text-earth-800 border-earth-300/70',
};

const num = new Intl.NumberFormat('id-ID');

export function BusinessFlow({ description, stages, highlightStageKey, inline = false }: Props) {
  const first = stages[0]?.count ?? 0;

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Business flow</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="hidden items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground sm:flex">
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-brand-800">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
            WIT
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-blue-800">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            GT/ESB
          </span>
        </div>
      </div>

      {/* Mobile: vertical stack */}
      <ol className="mt-4 space-y-2 md:hidden">
        {stages.map((s, i) => {
          const next = stages[i + 1];
          const drop = next ? s.count - next.count : 0;
          const pct = first > 0 ? Math.round((s.count / first) * 1000) / 10 : 0;
          const active = highlightStageKey === s.key;
          return (
            <motion.li
              key={s.key}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
              className={`rounded-xl border p-3 ${active ? 'ring-2 ring-rose-400 ring-offset-2' : ''} ${systemTone[s.system]}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono opacity-60">{i + 1}.</span>
                    <p className="text-sm font-semibold leading-tight">{s.label}</p>
                  </div>
                  <p className="mt-0.5 text-[11px] opacity-80">{s.description}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-base font-bold leading-none">{num.format(s.count)}</p>
                  <p className="mt-0.5 text-[10px] opacity-70">{pct}%</p>
                </div>
              </div>
              {drop > 0 ? (
                <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-rose-700">
                  <ChevronRight className="h-3 w-3" />
                  {drop} dropped before next step
                </div>
              ) : null}
              {s.avgLatencyMs !== null ? (
                <p className="mt-1 font-mono text-[10px] opacity-60">latency · {s.avgLatencyMs}ms avg</p>
              ) : (
                <p className="mt-1 text-[10px] italic opacity-60">latency · pending real endpoint</p>
              )}
            </motion.li>
          );
        })}
      </ol>

      {/* Desktop / tablet: horizontal pipeline */}
      <div className="mt-4 hidden gap-1.5 md:flex md:items-stretch">
        {stages.map((s, i) => {
          const next = stages[i + 1];
          const drop = next ? s.count - next.count : 0;
          const pct = first > 0 ? Math.round((s.count / first) * 1000) / 10 : 0;
          const active = highlightStageKey === s.key;
          return (
            <div key={s.key} className="flex min-w-0 flex-1 items-stretch">
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                className={`flex min-w-0 flex-1 flex-col rounded-xl border p-3 ${active ? 'ring-2 ring-rose-400 ring-offset-2' : ''} ${systemTone[s.system]}`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/60 text-[10px] font-bold">
                    {i + 1}
                  </span>
                  <div className="inline-flex items-center gap-1 rounded-full bg-white/60 px-1.5 text-[9px] font-bold uppercase tracking-widest">
                    {s.system === 'WIT' ? <Cog className="h-2.5 w-2.5" /> : <Server className="h-2.5 w-2.5" />}
                    {s.system}
                  </div>
                </div>
                <p className="mt-2 text-xs font-semibold leading-tight">{s.label}</p>
                <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug opacity-80">{s.description}</p>
                <div className="mt-auto pt-2">
                  <p className="font-mono text-lg font-bold leading-none">{num.format(s.count)}</p>
                  <p className="mt-0.5 text-[10px] opacity-70">{pct}% of input</p>
                  {s.avgLatencyMs !== null ? (
                    <p className="mt-0.5 font-mono text-[10px] opacity-60">{s.avgLatencyMs}ms avg</p>
                  ) : (
                    <p className="mt-0.5 text-[10px] italic opacity-60">— pending endpoint</p>
                  )}
                </div>
              </motion.div>
              {next ? (
                <div className="relative flex w-6 shrink-0 items-center justify-center text-muted-foreground lg:w-8">
                  <ArrowRight className="h-3.5 w-3.5" />
                  {drop > 0 ? (
                    <span className="absolute top-full mt-0.5 whitespace-nowrap rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-semibold text-rose-800">
                      −{drop}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );

  if (inline) return <div>{body}</div>;
  return (
    <Card>
      <CardContent className="p-5">{body}</CardContent>
    </Card>
  );
}
