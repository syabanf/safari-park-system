import { api } from '@/lib/api';
import { useOnline } from '@/hooks/useOnline';
import { track } from '@/lib/telemetry';
import { endpoints } from '@tsi/api-client';
import { useTranslation } from '@tsi/i18n';
import { validatorDb } from '@tsi/offline-storage';
import { Badge, Button, Card, CardContent } from '@tsi/ui';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  CloudOff,
  Filter,
  Pause,
  Play,
  RotateCw,
  Sparkles,
  Square,
  Wifi,
  WifiOff,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type Filter = 'pending' | 'failed' | 'synced' | 'all';
type RowStatus = 'pending' | 'syncing' | 'synced' | 'failed';

const CHUNK_SIZES = [5, 10, 25, 50] as const;
const verdictTone: Record<string, string> = {
  allow: 'bg-brand-100 text-brand-800',
  deny: 'bg-rose-100 text-rose-800',
  manual: 'bg-amber-100 text-amber-800',
};

export function OfflineQueueRoute() {
  const { t, i18n } = useTranslation();
  const online = useOnline();

  const all = useLiveQuery(
    () => validatorDb.pendingRedemptions.orderBy('scannedAt').reverse().toArray().catch(() => []),
    [],
  );
  const rows = useMemo(() => all ?? [], [all]);

  const [filter, setFilter] = useState<Filter>('pending');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [chunkSize, setChunkSize] = useState<number>(10);
  const [autoRetry, setAutoRetry] = useState(true);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());

  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, succeeded: 0, failed: 0 });
  const cancelRef = useRef(false);
  const pauseRef = useRef(false);

  const stats = useMemo(() => {
    const pending = rows.filter((r) => r.syncedAt === null && r.attemptCount === 0).length;
    const failed = rows.filter((r) => r.syncedAt === null && r.attemptCount > 0).length;
    const synced = rows.filter((r) => r.syncedAt !== null).length;
    return { pending, failed, synced, total: rows.length };
  }, [rows]);

  const filtered = useMemo(() => {
    switch (filter) {
      case 'pending':
        return rows.filter((r) => r.syncedAt === null);
      case 'failed':
        return rows.filter((r) => r.syncedAt === null && r.attemptCount > 0);
      case 'synced':
        return rows.filter((r) => r.syncedAt !== null);
      default:
        return rows;
    }
  }, [rows, filter]);

  // Auto-retry pending when back online.
  useEffect(() => {
    if (autoRetry && online && stats.pending > 0 && !running) {
      const t = setTimeout(() => void runBatch(rows.filter((r) => r.syncedAt === null).map((r) => r.id)), 600);
      return () => clearTimeout(t);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online]);

  function rowStatus(row: (typeof rows)[number]): RowStatus {
    if (syncingIds.has(row.id)) return 'syncing';
    if (row.syncedAt !== null) return 'synced';
    if (row.attemptCount > 0) return 'failed';
    return 'pending';
  }

  function toggleSelect(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function selectVisible() {
    setSelected(new Set(filtered.filter((r) => r.syncedAt === null).map((r) => r.id)));
  }
  function selectFailedOnly() {
    setSelected(new Set(rows.filter((r) => r.syncedAt === null && r.attemptCount > 0).map((r) => r.id)));
  }
  function clearSelection() {
    setSelected(new Set());
  }

  async function runBatch(ids: string[]) {
    if (running) return;
    cancelRef.current = false;
    pauseRef.current = false;
    setRunning(true);
    setPaused(false);
    setProgress({ done: 0, total: ids.length, succeeded: 0, failed: 0 });

    track('queue.batch.start', { total: ids.length, chunkSize });

    let succeeded = 0;
    let failed = 0;

    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);
      setSyncingIds(new Set(chunk));
      const results = await Promise.allSettled(chunk.map(processOne));
      for (const r of results) {
        if (r.status === 'fulfilled') succeeded += 1;
        else failed += 1;
      }
      setProgress((p) => ({ ...p, done: Math.min(p.done + chunk.length, ids.length), succeeded, failed }));
      setSyncingIds(new Set());

      // Pause loop.
      while (pauseRef.current && !cancelRef.current) {
        await new Promise((r) => setTimeout(r, 200));
      }
      if (cancelRef.current) break;
      if (i + chunkSize < ids.length) await new Promise((r) => setTimeout(r, 250));
    }

    track('queue.batch.end', { total: ids.length, succeeded, failed, cancelled: cancelRef.current });
    setRunning(false);
    setPaused(false);
    setSyncingIds(new Set());
    setSelected(new Set());
  }

  async function processOne(id: string): Promise<void> {
    const row = await validatorDb.pendingRedemptions.get(id);
    if (!row || row.syncedAt !== null) return;
    try {
      if (simulateFailure && Math.random() < 0.5) {
        throw new Error('Simulated network failure');
      }
      await endpoints.submitRedemption(api, {
        jti: row.jti,
        passId: row.passId,
        gateId: row.gateId,
        scannedAt: row.scannedAt,
        verdict: row.verdict,
        ...(row.reason ? { reason: row.reason } : {}),
      });
      await validatorDb.pendingRedemptions.update(row.id, {
        syncedAt: Math.floor(Date.now() / 1000),
      });
      setErrors((e) => {
        const { [row.id]: _, ...rest } = e;
        return rest;
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sync failed';
      await validatorDb.pendingRedemptions.update(row.id, {
        attemptCount: row.attemptCount + 1,
      });
      setErrors((e) => ({ ...e, [row.id]: msg }));
      throw err;
    }
  }

  async function seed(n = 20) {
    const now = Math.floor(Date.now() / 1000);
    const passes = ['AP-1024', 'AP-1108', 'AP-1212', 'AP-1335', 'AP-1402', 'AP-1499', 'AP-1567'];
    const verdicts: Array<'allow' | 'deny' | 'manual'> = ['allow', 'allow', 'allow', 'manual', 'deny'];
    const gates = ['gate-bgr-01', 'gate-bgr-02', 'gate-prg-01'];
    const items = Array.from({ length: n }, (_, i) => ({
      id: `pq-${now}-${i}`,
      jti: `jti-${now}-${i}`,
      passId: passes[i % passes.length]!,
      gateId: gates[i % gates.length]!,
      scannedAt: now - i * 27,
      verdict: verdicts[i % verdicts.length]!,
      syncedAt: null,
      attemptCount: 0,
    }));
    await validatorDb.pendingRedemptions.bulkAdd(items);
  }

  async function clearSynced() {
    const synced = (await validatorDb.pendingRedemptions.toArray()).filter((r) => r.syncedAt !== null);
    await validatorDb.pendingRedemptions.bulkDelete(synced.map((s) => s.id));
  }

  const fmt = new Intl.DateTimeFormat(i18n.language, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const queueable = rows.filter((r) => r.syncedAt === null).map((r) => r.id);
  const selectedQueueable = Array.from(selected).filter((id) => queueable.includes(id));
  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{t('validator.queue.title')}</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Buffered scans sync automatically when online — process in batches if backlog grows
          </p>
        </div>
        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${
            online ? 'bg-brand-100 text-brand-800' : 'bg-rose-100 text-rose-800'
          }`}
        >
          {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {online ? 'Online' : 'Offline'}
        </div>
      </header>

      <div className="grid grid-cols-4 gap-2">
        <Stat icon={<Clock className="h-4 w-4" />} label="Pending" value={stats.pending} tone="default" />
        <Stat icon={<AlertCircle className="h-4 w-4" />} label="Failed" value={stats.failed} tone={stats.failed > 0 ? 'warn' : 'default'} />
        <Stat icon={<CheckCircle2 className="h-4 w-4" />} label="Synced" value={stats.synced} tone="ok" />
        <Stat icon={<Sparkles className="h-4 w-4" />} label="Total" value={stats.total} tone="default" />
      </div>

      <AnimatePresence>
        {running ? (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            <Card className="border-brand-300/60 bg-brand-50/70">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <RotateCw className={`h-3.5 w-3.5 ${paused ? '' : 'animate-spin'} text-brand-700`} />
                    <span className="font-semibold">
                      {paused ? 'Paused' : 'Processing'} {progress.done}/{progress.total}
                    </span>
                    <span className="text-muted-foreground">
                      · {progress.succeeded} ok · {progress.failed} failed
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1"
                      onClick={() => {
                        pauseRef.current = !pauseRef.current;
                        setPaused(pauseRef.current);
                      }}
                    >
                      {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                      {paused ? 'Resume' : 'Pause'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1 text-rose-700 hover:bg-rose-50"
                      onClick={() => {
                        cancelRef.current = true;
                      }}
                    >
                      <Square className="h-3 w-3" />
                      Cancel
                    </Button>
                  </div>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-brand-100">
                  <motion.div
                    className="h-full bg-brand-600"
                    style={{ width: `${pct}%` }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.25 }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Chunked {chunkSize} at a time · {Math.ceil((progress.total - progress.done) / chunkSize)} batches left
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Card>
        <CardContent className="space-y-3 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              {(['pending', 'failed', 'synced', 'all'] as Filter[]).map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={filter === f ? 'default' : 'outline'}
                  onClick={() => setFilter(f)}
                  className="h-7 capitalize"
                >
                  {f}
                  <span className="ml-1.5 rounded-full bg-white/30 px-1.5 text-[10px] font-semibold">
                    {f === 'pending' ? stats.pending : f === 'failed' ? stats.failed : f === 'synced' ? stats.synced : stats.total}
                  </span>
                </Button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground">
              Chunk
              {CHUNK_SIZES.map((n) => (
                <Button
                  key={n}
                  size="sm"
                  variant={chunkSize === n ? 'default' : 'outline'}
                  onClick={() => setChunkSize(n)}
                  className="h-7 px-2 text-[11px]"
                  disabled={running}
                >
                  {n}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" className="h-8" onClick={selectVisible} disabled={running}>
              Select all visible ({filtered.filter((r) => r.syncedAt === null).length})
            </Button>
            <Button size="sm" variant="outline" className="h-8" onClick={selectFailedOnly} disabled={running || stats.failed === 0}>
              Select failed ({stats.failed})
            </Button>
            <Button size="sm" variant="outline" className="h-8" onClick={clearSelection} disabled={running || selected.size === 0}>
              Clear ({selected.size})
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-muted-foreground">
                <input type="checkbox" checked={autoRetry} onChange={(e) => setAutoRetry(e.target.checked)} className="h-3.5 w-3.5" />
                Auto-retry when online
              </label>
              <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-muted-foreground">
                <input type="checkbox" checked={simulateFailure} onChange={(e) => setSimulateFailure(e.target.checked)} className="h-3.5 w-3.5" />
                Simulate failures
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t pt-2">
            <Button
              size="sm"
              className="h-9 gap-1.5"
              disabled={!online || running || queueable.length === 0}
              onClick={() => runBatch(queueable)}
            >
              <RotateCw className="h-3.5 w-3.5" />
              Process all ({queueable.length})
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9 gap-1.5"
              disabled={!online || running || selectedQueueable.length === 0}
              onClick={() => runBatch(selectedQueueable)}
            >
              Process selected ({selectedQueueable.length})
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9 gap-1.5"
              disabled={running || stats.failed === 0 || !online}
              onClick={() => runBatch(rows.filter((r) => r.syncedAt === null && r.attemptCount > 0).map((r) => r.id))}
            >
              Retry failed ({stats.failed})
            </Button>
            <div className="ml-auto flex items-center gap-1.5">
              <Button size="sm" variant="outline" className="h-9 gap-1.5" onClick={() => void seed(20)} disabled={running}>
                Seed 20 demo rows
              </Button>
              <Button size="sm" variant="outline" className="h-9 gap-1.5" onClick={clearSynced} disabled={running || stats.synced === 0}>
                Clear synced
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <CloudOff className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-medium">
              {filter === 'pending' ? t('validator.queue.empty') : 'No items in this view'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {filter === 'pending'
                ? 'Scans buffered offline will appear here'
                : 'Try a different filter or seed demo data'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              <AnimatePresence initial={false}>
                {filtered.slice(0, 200).map((row) => {
                  const status = rowStatus(row);
                  const checked = selected.has(row.id);
                  return (
                    <motion.li
                      key={row.id}
                      layout
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                      className="flex items-center gap-3 p-3 text-sm hover:bg-muted/40"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={row.syncedAt !== null || running}
                        onChange={() => toggleSelect(row.id)}
                        className="h-4 w-4 shrink-0"
                      />
                      <StatusChip status={status} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold">{row.passId}</span>
                          <Badge variant="secondary" className={`${verdictTone[row.verdict]} text-[10px]`}>
                            {row.verdict}
                          </Badge>
                          <span className="font-mono text-[10px] text-muted-foreground">{row.gateId}</span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span>{fmt.format(new Date(row.scannedAt * 1000))}</span>
                          {row.attemptCount > 0 ? (
                            <span className="text-amber-700">· {row.attemptCount} attempts</span>
                          ) : null}
                          {row.reason ? <span>· {row.reason}</span> : null}
                        </div>
                        {errors[row.id] && status === 'failed' ? (
                          <p className="mt-0.5 truncate text-[11px] text-rose-700">↳ {errors[row.id]}</p>
                        ) : null}
                      </div>
                      {row.syncedAt === null && status !== 'syncing' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 shrink-0 gap-1"
                          disabled={!online || running}
                          onClick={() => void runBatch([row.id])}
                        >
                          <RotateCw className="h-3 w-3" />
                          Retry
                        </Button>
                      ) : null}
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
            {filtered.length > 200 ? (
              <p className="px-3 py-2 text-center text-[11px] text-muted-foreground">
                Showing first 200 of {filtered.length} — narrow the filter or process some
              </p>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: 'default' | 'ok' | 'warn';
}) {
  const tones: Record<typeof tone, string> = {
    default: 'bg-muted text-foreground',
    ok: 'bg-brand-50 text-brand-800',
    warn: 'bg-amber-50 text-amber-800',
  };
  return (
    <Card>
      <CardContent className="flex items-center gap-2 p-3">
        <div className={`grid h-8 w-8 place-items-center rounded-lg ${tones[tone]}`}>{icon}</div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="text-lg font-bold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusChip({ status }: { status: RowStatus }) {
  const map: Record<RowStatus, { label: string; cls: string; icon: React.ReactNode }> = {
    pending: { label: 'pending', cls: 'bg-muted text-muted-foreground', icon: <Clock className="h-3 w-3" /> },
    syncing: { label: 'syncing', cls: 'bg-blue-100 text-blue-800', icon: <RotateCw className="h-3 w-3 animate-spin" /> },
    synced: { label: 'synced', cls: 'bg-brand-100 text-brand-800', icon: <CheckCircle2 className="h-3 w-3" /> },
    failed: { label: 'failed', cls: 'bg-rose-100 text-rose-800', icon: <XCircle className="h-3 w-3" /> },
  };
  const v = map[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${v.cls}`}
    >
      {v.icon}
      {v.label}
    </span>
  );
}
