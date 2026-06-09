import { Badge, Button, Card, CardContent } from '@tsi/ui';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  Globe,
  Heart,
  HeartCrack,
  RotateCw,
  ShieldCheck,
  Timer,
  WifiOff,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface HeartbeatTick {
  at: string;
  ok: boolean;
  latencyMs: number | null;
}

interface CallRow {
  id: string;
  at: string;
  direction: 'inbound' | 'outbound';
  method: string;
  endpoint: string;
  purpose: string;
  statusCode: number;
  latencyMs: number;
  sizeBytes: number;
  correlationId: string;
  retryAttempt: number;
}

export interface BlackboxData {
  heartbeat: {
    lastPingAt: string | null;
    lastPingOk: boolean;
    lastPingLatencyMs: number | null;
    uptime24hPct: number;
    consecutiveSuccess: number;
    consecutiveFailure: number;
    nextProbeAt: string | null;
    probeIntervalSec: number;
    history: HeartbeatTick[];
  };
  connection: {
    p50LatencyMs: number;
    p95LatencyMs: number;
    p99LatencyMs: number;
    errorRate1hPct: number;
    throughputPerMin: number;
    tlsHandshakeMs: number | null;
    dnsLookupMs: number | null;
  };
  recentCalls: CallRow[];
  sample: {
    requestHeaders: string;
    requestBody: string;
    responseHeaders: string;
    responseBody: string;
  };
}

interface Props {
  data: BlackboxData;
  /** If true, render an "offline / pending real endpoint" overlay. */
  pending?: boolean;
}

function timeAgo(iso: string | null): string {
  if (!iso) return '—';
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function statusTone(s: number): string {
  if (s === 0) return 'bg-slate-200 text-slate-700'; // timeout
  if (s < 300) return 'bg-brand-100 text-brand-800';
  if (s < 500) return 'bg-amber-100 text-amber-800';
  return 'bg-rose-100 text-rose-800';
}

function statusLabel(s: number): string {
  if (s === 0) return 'TIMEOUT';
  return String(s);
}

function formatSize(b: number): string {
  if (b < 1024) return `${b} B`;
  return `${(b / 1024).toFixed(1)} kB`;
}

export function BlackboxPanel({ data, pending = false }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'ok' | 'errors'>('all');

  const calls = useMemo(() => {
    if (filter === 'ok') return data.recentCalls.filter((c) => c.statusCode >= 200 && c.statusCode < 300);
    if (filter === 'errors') return data.recentCalls.filter((c) => c.statusCode === 0 || c.statusCode >= 400);
    return data.recentCalls;
  }, [data.recentCalls, filter]);

  const heartHealthy = data.heartbeat.lastPingOk && data.heartbeat.uptime24hPct >= 99;

  return (
    <div className="space-y-4">
      {/* Heartbeat strip */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={pending ? {} : { scale: [1, 1.18, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className={`grid h-11 w-11 place-items-center rounded-2xl ${
                  pending
                    ? 'bg-slate-100 text-slate-500'
                    : heartHealthy
                      ? 'bg-rose-100 text-rose-600'
                      : 'bg-amber-100 text-amber-700'
                }`}
              >
                {pending ? <HeartCrack className="h-5 w-5" /> : <Heart className="h-5 w-5 fill-current" />}
              </motion.div>
              <div>
                <p className="text-sm font-semibold">
                  {pending ? 'No heartbeat — endpoint pending' : heartHealthy ? 'Heartbeat healthy' : 'Heartbeat degraded'}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {pending
                    ? 'Connect ESB credentials to start probing'
                    : `Last ping ${timeAgo(data.heartbeat.lastPingAt)} · ${data.heartbeat.lastPingLatencyMs}ms · next probe in ${Math.max(
                        0,
                        Math.round((new Date(data.heartbeat.nextProbeAt ?? '').getTime() - Date.now()) / 1000),
                      )}s`}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                <Activity className="h-3 w-3" />
                Probe every {data.heartbeat.probeIntervalSec}s
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                <Globe className="h-3 w-3" />
                DNS {data.connection.dnsLookupMs ?? '—'}ms
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                <ShieldCheck className="h-3 w-3" />
                TLS {data.connection.tlsHandshakeMs ?? '—'}ms
              </span>
            </div>
          </div>

          {/* 24h heartbeat sparkline */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>Last 24h · 30-min ticks</span>
              <span>
                Uptime <span className="font-mono text-foreground">{data.heartbeat.uptime24hPct}%</span>
              </span>
            </div>
            <div className="mt-1.5 flex h-8 items-end gap-[2px] overflow-hidden rounded-lg bg-muted/40 p-1">
              {data.heartbeat.history.map((tick, i) => {
                const heightPct = tick.ok && tick.latencyMs ? Math.min(100, 30 + (tick.latencyMs / 600) * 70) : 100;
                return (
                  <div
                    key={i}
                    title={`${new Date(tick.at).toLocaleTimeString()} · ${tick.ok ? `${tick.latencyMs}ms` : 'down'}`}
                    className={`flex-1 rounded-sm ${tick.ok ? 'bg-brand-500' : 'bg-rose-500'}`}
                    style={{ height: `${heightPct}%` }}
                  />
                );
              })}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat icon={<Zap className="h-3.5 w-3.5" />} label="P50" value={`${data.connection.p50LatencyMs}ms`} />
            <Stat icon={<Zap className="h-3.5 w-3.5" />} label="P95" value={`${data.connection.p95LatencyMs}ms`} />
            <Stat icon={<Zap className="h-3.5 w-3.5" />} label="P99" value={`${data.connection.p99LatencyMs}ms`} />
            <Stat
              icon={data.connection.errorRate1hPct < 1 ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
              label="Error rate · 1h"
              value={`${data.connection.errorRate1hPct}%`}
              tone={data.connection.errorRate1hPct < 1 ? 'ok' : 'warn'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Call log */}
      <Card>
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
            <div>
              <p className="text-sm font-semibold">API call log</p>
              <p className="text-[11px] text-muted-foreground">
                Last {data.recentCalls.length} exchanges · newest first · click a row to see request/response
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {(['all', 'ok', 'errors'] as const).map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={filter === f ? 'default' : 'outline'}
                  onClick={() => setFilter(f)}
                  className="h-7 px-3 capitalize"
                >
                  {f}
                  <span className="ml-1.5 rounded-full bg-white/30 px-1.5 text-[10px] font-semibold">
                    {f === 'all'
                      ? data.recentCalls.length
                      : f === 'ok'
                        ? data.recentCalls.filter((c) => c.statusCode >= 200 && c.statusCode < 300).length
                        : data.recentCalls.filter((c) => c.statusCode === 0 || c.statusCode >= 400).length}
                  </span>
                </Button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">When</th>
                  <th className="px-4 py-2.5 font-medium">Dir</th>
                  <th className="px-4 py-2.5 font-medium">Method · path</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Latency</th>
                  <th className="px-4 py-2.5 font-medium">Size</th>
                  <th className="px-4 py-2.5 font-medium">Correlation</th>
                  <th className="px-4 py-2.5 font-medium">Retry</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {calls.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-xs text-muted-foreground">
                      <WifiOff className="mx-auto mb-2 h-5 w-5 opacity-50" />
                      No calls match this filter
                    </td>
                  </tr>
                ) : (
                  calls.map((c, i) => {
                    const open = openId === c.id;
                    return (
                      <motion.tr
                        key={c.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.16, delay: Math.min(i * 0.015, 0.3) }}
                        className="border-b last:border-0"
                      >
                        <td className="px-4 py-2.5 align-top">
                          <button
                            type="button"
                            onClick={() => setOpenId(open ? null : c.id)}
                            className="font-mono text-[11px] hover:underline"
                          >
                            {timeAgo(c.at)}
                          </button>
                          {open ? (
                            <div className="absolute z-10 -mx-4 mt-2 w-[min(720px,calc(100vw-3rem))] rounded-xl border bg-white shadow-xl">
                              <Drawer call={c} sample={data.sample} onClose={() => setOpenId(null)} />
                            </div>
                          ) : null}
                        </td>
                        <td className="px-4 py-2.5 align-top">
                          {c.direction === 'outbound' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
                              <ArrowUpRight className="h-2.5 w-2.5" />
                              OUT
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-800">
                              <ArrowDownLeft className="h-2.5 w-2.5" />
                              IN
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 align-top">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                              {c.method}
                            </span>
                            <span className="font-mono text-[11px]">{c.endpoint}</span>
                          </div>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">{c.purpose}</p>
                        </td>
                        <td className="px-4 py-2.5 align-top">
                          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${statusTone(c.statusCode)}`}>
                            {statusLabel(c.statusCode)}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 align-top font-mono text-[11px] text-muted-foreground">{c.latencyMs}ms</td>
                        <td className="px-4 py-2.5 align-top font-mono text-[11px] text-muted-foreground">{formatSize(c.sizeBytes)}</td>
                        <td className="px-4 py-2.5 align-top font-mono text-[10px] text-muted-foreground">{c.correlationId}</td>
                        <td className="px-4 py-2.5 align-top">
                          {c.retryAttempt > 0 ? (
                            <Badge variant="secondary" className="gap-0.5 text-[10px]">
                              <RotateCw className="h-2.5 w-2.5" />
                              {c.retryAttempt}
                            </Badge>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 align-top text-right">
                          <button
                            type="button"
                            onClick={() => setOpenId(open ? null : c.id)}
                            aria-label="Inspect"
                            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  tone = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: 'default' | 'ok' | 'warn';
}) {
  const tones = {
    default: 'bg-muted text-foreground',
    ok: 'bg-brand-100 text-brand-800',
    warn: 'bg-amber-100 text-amber-800',
  } as const;
  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-2.5 py-1.5">
      <div className={`grid h-6 w-6 shrink-0 place-items-center rounded ${tones[tone]}`}>{icon}</div>
      <div className="min-w-0">
        <p className="truncate text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="font-mono text-xs font-semibold">{value}</p>
      </div>
    </div>
  );
}

function Drawer({
  call,
  sample,
  onClose,
}: {
  call: CallRow;
  sample: BlackboxData['sample'];
  onClose: () => void;
}) {
  const [tab, setTab] = useState<'request' | 'response' | 'curl'>('request');
  // Build a representative cURL for replay.
  const curlSample = [
    `curl --location '${call.endpoint}' \\`,
    `  --header 'Authorization: Bearer ***REDACTED***' \\`,
    `  --header 'Accept-Version: 1.0' \\`,
    `  --header 'Content-Type: application/json' \\`,
    `  --header 'X-Correlation-Id: ${call.correlationId}'`,
  ].join('\n');

  return (
    <div className="p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700">{call.method}</span>
          <span className="font-mono text-[11px]">{call.endpoint}</span>
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${statusTone(call.statusCode)}`}>
            {statusLabel(call.statusCode)}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            <Timer className="-mt-0.5 mr-0.5 inline h-2.5 w-2.5" />
            {call.latencyMs}ms
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close inspector"
        >
          <ChevronDown className="h-3.5 w-3.5 rotate-180" />
        </button>
      </div>
      <div className="flex items-center gap-1 border-b">
        {(['request', 'response', 'curl'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-2.5 py-1.5 text-xs font-medium capitalize transition-colors ${
              tab === t ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
              const content = tab === 'curl' ? curlSample : tab === 'request' ? sample.requestBody : sample.responseBody;
              void navigator.clipboard.writeText(content);
            }
          }}
          className="ml-auto inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <Copy className="h-3 w-3" />
          Copy
        </button>
      </div>
      <div className="mt-2 max-h-72 overflow-auto rounded-lg bg-slate-950 p-3 font-mono text-[11px] leading-relaxed text-slate-100">
        {tab === 'request' ? (
          <>
            <pre className="opacity-70">{sample.requestHeaders}</pre>
            <div className="my-2 h-px bg-slate-700" />
            <pre>{sample.requestBody}</pre>
          </>
        ) : tab === 'response' ? (
          <>
            <pre className="opacity-70">{sample.responseHeaders}</pre>
            <div className="my-2 h-px bg-slate-700" />
            <pre>{sample.responseBody}</pre>
          </>
        ) : (
          <pre>{curlSample}</pre>
        )}
      </div>
      <p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
        <Clock className="h-2.5 w-2.5" />
        Sample payload — actual request/response of cid <span className="font-mono">{call.correlationId}</span> is preserved in the WIT log retention window.
      </p>
    </div>
  );
}
