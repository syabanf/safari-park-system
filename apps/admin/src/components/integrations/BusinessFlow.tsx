import { Card, CardContent } from '@tsi/ui';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';

export interface FlowStage {
  key: string;
  label: string;
  description: string;
  count: number;
  system: 'WIT' | 'GT' | 'ESB';
  avgLatencyMs: number | null;
  /** Optional engineering detail (endpoint, webhook name). Rendered dimmed. */
  tech?: string | null;
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

const systemLabel: Record<FlowStage['system'], string> = {
  WIT: 'Our platform',
  GT: 'GlobalTix',
  ESB: 'ESB',
};

const num = new Intl.NumberFormat('id-ID');

/** Turn a raw millisecond figure into something a non-engineer can read. */
function humanSpeed(ms: number | null): string | null {
  if (ms === null) return null;
  if (ms === 0) return 'instant';
  if (ms < 1_000) return 'under a second';
  if (ms < 10_000) return `about ${(ms / 1_000).toFixed(1)}s`;
  return `about ${Math.round(ms / 1_000)}s`;
}

export function BusinessFlow({ description, stages, highlightStageKey, inline = false }: Props) {
  const first = stages[0]?.count ?? 0;
  const partner = stages.find((s) => s.system !== 'WIT')?.system ?? 'GT';

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">How this works, step by step</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="hidden items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground sm:flex">
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-brand-800">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
            Our platform
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${partner === 'ESB' ? 'bg-earth-100 text-earth-800' : 'bg-blue-100 text-blue-800'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${partner === 'ESB' ? 'bg-earth-600' : 'bg-blue-600'}`} />
            {systemLabel[partner]}
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
          const speed = humanSpeed(s.avgLatencyMs);
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
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/60 text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <p className="text-sm font-semibold leading-tight">{s.label}</p>
                  </div>
                  <p className="mt-1 text-[11px] leading-snug opacity-80">{s.description}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-base font-bold leading-none">{num.format(s.count)}</p>
                  <p className="mt-0.5 text-[10px] opacity-70">{pct}% reached</p>
                </div>
              </div>
              {drop > 0 ? (
                <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-rose-700">
                  <ChevronRight className="h-3 w-3" />
                  {num.format(drop)} didn't reach the next step
                </div>
              ) : null}
              <div className="mt-1.5 flex items-center gap-2 text-[10px] opacity-60">
                <span className="rounded-full bg-white/50 px-1.5 py-px font-semibold uppercase tracking-wide">
                  {systemLabel[s.system]}
                </span>
                {s.avgLatencyMs !== null ? (
                  <span>{speed}</span>
                ) : (
                  <span className="italic">not live yet</span>
                )}
              </div>
              {s.tech ? <p className="mt-1 font-mono text-[9px] leading-tight opacity-40">{s.tech}</p> : null}
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
          const speed = humanSpeed(s.avgLatencyMs);
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
                  <div className="inline-flex items-center gap-1 truncate rounded-full bg-white/60 px-1.5 text-[9px] font-bold uppercase tracking-wide">
                    {systemLabel[s.system]}
                  </div>
                </div>
                <p className="mt-2 text-xs font-semibold leading-tight">{s.label}</p>
                <p className="mt-0.5 line-clamp-3 text-[10px] leading-snug opacity-80">{s.description}</p>
                <div className="mt-auto pt-2">
                  <p className="font-mono text-lg font-bold leading-none">{num.format(s.count)}</p>
                  <p className="mt-0.5 text-[10px] opacity-70">{pct}% reached</p>
                  {s.avgLatencyMs !== null ? (
                    <p className="mt-0.5 text-[10px] opacity-55">{speed}</p>
                  ) : (
                    <p className="mt-0.5 text-[10px] italic opacity-55">not live yet</p>
                  )}
                  {s.tech ? <p className="mt-0.5 font-mono text-[9px] leading-tight opacity-40">{s.tech}</p> : null}
                </div>
              </motion.div>
              {next ? (
                <div className="relative flex w-6 shrink-0 items-center justify-center text-muted-foreground lg:w-8">
                  <ArrowRight className="h-3.5 w-3.5" />
                  {drop > 0 ? (
                    <span className="absolute top-full mt-0.5 whitespace-nowrap rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-semibold text-rose-800">
                      −{num.format(drop)}
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
