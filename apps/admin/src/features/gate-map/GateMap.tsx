import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@tsi/ui';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface GatePosition {
  id: string;
  label: string;
  x: number;
  y: number;
  status: 'online' | 'offline' | 'degraded';
  scansToday: number;
  location: string;
}

async function fetchPositions(): Promise<GatePosition[]> {
  const json = (await api.http.get('admin/gates/map/positions').json()) as { positions: GatePosition[] };
  return json.positions;
}

const statusFill = {
  online: 'fill-brand-600 stroke-brand-700',
  offline: 'fill-rose-500 stroke-rose-700',
  degraded: 'fill-earth-500 stroke-earth-700',
} as const;

const statusLabel = {
  online: 'bg-brand-100 text-brand-800',
  offline: 'bg-rose-100 text-rose-700',
  degraded: 'bg-earth-100 text-earth-800',
} as const;

export function GateMap() {
  const { data } = useQuery({ queryKey: ['admin', 'gate-positions'], queryFn: fetchPositions });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Park network — gate locations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border bg-gradient-to-br from-brand-50 via-earth-50/40 to-brand-100/40">
          <svg
            viewBox="0 0 100 62.5"
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Stylised park outline */}
            <path
              d="M 6 14 Q 20 4 36 8 T 64 6 Q 82 8 92 18 Q 96 32 90 46 Q 76 58 56 56 T 28 54 Q 12 52 6 38 Z"
              className="fill-white/70 stroke-brand-300"
              strokeWidth="0.25"
            />
            {/* Inner zones */}
            <ellipse cx="34" cy="32" rx="14" ry="10" className="fill-brand-100/60 stroke-brand-300" strokeWidth="0.2" strokeDasharray="0.6 0.6" />
            <ellipse cx="68" cy="36" rx="12" ry="8" className="fill-earth-100/60 stroke-earth-300" strokeWidth="0.2" strokeDasharray="0.6 0.6" />
            <text x="34" y="34" textAnchor="middle" className="fill-brand-700/70" fontSize="2.4">
              Wildlife
            </text>
            <text x="68" y="38" textAnchor="middle" className="fill-earth-700/70" fontSize="2.4">
              Facilities
            </text>

            {/* Paths between gates */}
            {data?.slice(0, -1).map((g, i) => {
              const next = data[i + 1];
              if (!next) return null;
              return (
                <line
                  key={`${g.id}-${next.id}`}
                  x1={g.x * 0.95}
                  y1={g.y * 0.625}
                  x2={next.x * 0.95}
                  y2={next.y * 0.625}
                  className="stroke-brand-400"
                  strokeWidth="0.18"
                  strokeDasharray="0.8 0.6"
                />
              );
            })}

            {/* Gate markers */}
            {data?.map((g, i) => (
              <motion.g
                key={g.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                <circle
                  cx={g.x * 0.95}
                  cy={g.y * 0.625}
                  r="2.4"
                  className={`${statusFill[g.status]} drop-shadow-sm`}
                  strokeWidth="0.4"
                />
                {g.status === 'online' ? (
                  <circle
                    cx={g.x * 0.95}
                    cy={g.y * 0.625}
                    r="3.8"
                    className="fill-brand-500/20"
                  >
                    <animate attributeName="r" values="2.4;5;2.4" dur="2.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0;0.4" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                ) : null}
              </motion.g>
            ))}
          </svg>

          {data?.map((g) => (
            <Link
              key={g.id}
              to={`/gates/${g.id}`}
              className="absolute -translate-x-1/2 -translate-y-full"
              style={{ left: `${g.x * 0.95}%`, top: `${g.y * 0.625 + 0.5}%` }}
            >
              <span className="block whitespace-nowrap rounded-full border border-border/60 bg-white px-2 py-0.5 text-[10px] font-semibold shadow-sm hover:bg-brand-50">
                {g.label}
              </span>
            </Link>
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((g) => (
            <Link
              key={g.id}
              to={`/gates/${g.id}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white p-3 text-sm transition-shadow hover:shadow-md"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{g.label}</p>
                <p className="font-mono text-[11px] text-muted-foreground">{g.id}</p>
              </div>
              <div className="text-right">
                <span className={`block rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusLabel[g.status]}`}>
                  {g.status}
                </span>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">{g.scansToday} today</p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
