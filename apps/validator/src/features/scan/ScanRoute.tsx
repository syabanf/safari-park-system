import { useAuthStore } from '@/features/auth/store';
import { useOnline } from '@/hooks/useOnline';
import { api } from '@/lib/api';
import { track } from '@/lib/telemetry';
import { useMutation, useQuery } from '@tanstack/react-query';
import { endpoints } from '@tsi/api-client';
import { useTranslation } from '@tsi/i18n';
import { validatorDb } from '@tsi/offline-storage';
import { ErrorState } from '@tsi/ui';
import { decodeJws } from '@tsi/qr-core';
import { HTTPError } from 'ky';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, DoorOpen, ShieldQuestion, Wifi, WifiOff, XCircle } from 'lucide-react';
import { useState } from 'react';
import { ScanResult } from './ScanResult';
import { Scanner } from './Scanner';
import { usePublicKeySync } from './usePublicKeySync';
import { useVerification } from './useVerification';

interface PendingResult {
  status: 'allow' | 'deny' | 'manual';
  passId?: string;
  holderName?: string;
  jti?: string;
  /** Raw reason code (e.g. 'expired', 'suspended'); translated at render time. */
  reason?: string;
  jws: string;
}

/** Parse the `{ status, reason }` body of a server 409 deny. */
async function readDeny(
  err: unknown,
): Promise<{ reason: string } | null> {
  if (!(err instanceof HTTPError) || err.response.status !== 409) return null;
  try {
    const body = (await err.response.clone().json()) as { status?: string; reason?: string };
    if (body.status === 'denied') return { reason: body.reason ?? 'unknown' };
  } catch {
    // Non-JSON 409 — treat as a generic server deny rather than a network buffer.
    return { reason: 'unknown' };
  }
  return { reason: 'unknown' };
}

interface ScanSummary {
  summary: {
    todayScans: number;
    todayAllow: number;
    todayDeny: number;
    todayManual: number;
    offlineRecoveries: number;
    shiftStart: string;
    shiftEnd: string;
  };
}

async function fetchSummary(): Promise<ScanSummary> {
  return (await api.http.get('validator/reports').json()) as ScanSummary;
}

export function ScanRoute() {
  const { t, i18n } = useTranslation();
  const online = useOnline();
  const gateId = useAuthStore((s) => s.gateId) ?? 'gate-unknown';
  const displayName = useAuthStore((s) => s.displayName);
  const role = useAuthStore((s) => s.role);
  const verification = useVerification();
  usePublicKeySync();
  const [result, setResult] = useState<PendingResult | null>(null);
  // A deny returned by the server *after* commit (suspended / out-of-visits /
  // wrong-gate). Shown as a red verdict; distinct from an offline buffer.
  const [serverDeny, setServerDeny] = useState<{ passId?: string; reason: string } | null>(null);

  /** Translate a raw verify/deny reason code to a localized string. */
  const reasonText = (code?: string) =>
    code ? t(`validator.result.reason.${code}`, { defaultValue: t('validator.result.reason.unknown') }) : undefined;

  const reportsQuery = useQuery({ queryKey: ['validator-reports'], queryFn: fetchSummary });

  const redeem = useMutation({
    mutationFn: (body: Parameters<typeof endpoints.submitRedemption>[1]) =>
      endpoints.submitRedemption(api, body),
  });

  const handleDetected = async (value: string) => {
    if (result) return;
    track('scan.detected');

    const decoded = decodeJws(value);
    if (!decoded) {
      setResult({ status: 'deny', reason: 'malformed', jws: value });
      return;
    }

    if (!verification.loaded) {
      setResult({
        status: 'manual',
        jws: value,
        passId: decoded.payload.passId,
        jti: decoded.payload.jti,
        reason: 'keys-not-loaded',
      });
      return;
    }

    const verdict = verification.verify(value);
    if (!verdict.ok) {
      setResult({
        status: 'deny',
        reason: verdict.reason,
        jws: value,
        passId: decoded.payload.passId,
        jti: decoded.payload.jti,
      });
      return;
    }

    setResult({ status: 'allow', passId: verdict.payload.passId, jti: verdict.payload.jti, jws: value });
  };

  const commit = async (verdict: 'allow' | 'deny') => {
    if (!result) return;
    const scanned = result;
    const scannedAt = Math.floor(Date.now() / 1000);

    if (scanned.jti) {
      await validatorDb.consumedJti.put({ jti: scanned.jti, exp: scannedAt + 120, consumedAt: scannedAt });
    }

    const submission = {
      jti: scanned.jti ?? `manual_${scannedAt}`,
      passId: scanned.passId ?? 'unknown',
      gateId,
      scannedAt,
      verdict,
      ...(scanned.reason ? { reason: scanned.reason } : {}),
    };

    try {
      const response = await redeem.mutateAsync(submission);
      await validatorDb.recentScans.put({
        id: response.id,
        jti: submission.jti,
        passId: submission.passId,
        holderName: response.passHolder ?? 'Pass holder',
        scannedAt,
        verdict,
        source: 'online',
      });
      track(verdict === 'allow' ? 'scan.allowed' : 'scan.denied', { online: true });
    } catch (err) {
      // Server deny (HTTP 409) — record as a deny and surface a red verdict.
      const deny = await readDeny(err);
      if (deny) {
        await validatorDb.recentScans.put({
          id: `deny_${scannedAt}_${scanned.jti ?? 'manual'}`,
          jti: submission.jti,
          passId: submission.passId,
          holderName: 'Pass holder',
          scannedAt,
          verdict: 'deny',
          source: 'online',
        });
        track('scan.denied', { online: true, reason: deny.reason });
        setServerDeny({ passId: submission.passId, reason: deny.reason });
        setResult(null);
        return;
      }
      // Genuine network failure — buffer for later sync (NOT a deny).
      const offlineId = `local_${scannedAt}_${scanned.jti ?? 'manual'}`;
      await validatorDb.pendingRedemptions.put({ id: offlineId, ...submission, syncedAt: null, attemptCount: 0 });
      await validatorDb.recentScans.put({
        id: offlineId,
        jti: submission.jti,
        passId: submission.passId,
        holderName: 'Pending sync',
        scannedAt,
        verdict,
        source: 'offline',
      });
      track('scan.offline', { verdict });
    }

    setResult(null);
  };

  const fmtTime = new Intl.DateTimeFormat(i18n.language, { hour: '2-digit', minute: '2-digit' });
  const s = reportsQuery.data?.summary;

  return (
    <div className="space-y-4">
      {/* Gate status header */}
      <motion.section
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 p-4 text-white shadow-lg shadow-brand-900/20"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '14px 14px' }}
        />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15 backdrop-blur">
              <DoorOpen className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-brand-200">{role ?? t('validator.scan.console')}</p>
              <p className="truncate text-base font-bold">{displayName ?? t('validator.scan.console')}</p>
              <p className="font-mono text-[11px] text-brand-200">{gateId}</p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              online ? 'bg-lime-500/90 text-brand-950' : 'bg-earth-200 text-earth-900'
            }`}
          >
            {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {online ? t('validator.common.online') : t('validator.common.offline')}
          </span>
        </div>
        {s ? (
          <div className="relative mt-3 flex items-center gap-1.5 border-t border-white/10 pt-2.5 text-[11px] text-brand-100">
            <Clock className="h-3 w-3" />
            <span>
              {t('validator.scan.shift')} · {fmtTime.format(new Date(s.shiftStart))} — {fmtTime.format(new Date(s.shiftEnd))}
            </span>
          </div>
        ) : null}
      </motion.section>

      {/* Today's tally */}
      {s ? (
        <div className="grid grid-cols-4 gap-2">
          <Tally icon={<Wifi className="h-3.5 w-3.5" />} label={t('validator.scan.today')} value={s.todayScans} tone="default" />
          <Tally icon={<CheckCircle2 className="h-3.5 w-3.5" />} label={t('validator.result.allow')} value={s.todayAllow} tone="ok" />
          <Tally icon={<XCircle className="h-3.5 w-3.5" />} label={t('validator.result.deny')} value={s.todayDeny} tone="bad" />
          <Tally icon={<ShieldQuestion className="h-3.5 w-3.5" />} label={t('validator.scan.manual')} value={s.todayManual} tone="warn" />
        </div>
      ) : null}

      {reportsQuery.isError && !s ? (
        <section className="rounded-2xl border border-border/50 bg-white shadow-sm">
          <ErrorState
            title={t('validator.common.error')}
            description={t('validator.common.errorHint')}
            retryLabel={t('validator.common.retry')}
            onRetry={() => void reportsQuery.refetch()}
          />
        </section>
      ) : null}

      {/* Scanner / result */}
      {serverDeny ? (
        <ScanResult
          status="deny"
          passId={serverDeny.passId}
          reason={reasonText(serverDeny.reason)}
          offline={false}
          onAllow={() => setServerDeny(null)}
          onDeny={() => setServerDeny(null)}
          onNext={() => setServerDeny(null)}
        />
      ) : result ? (
        <ScanResult
          status={result.status}
          passId={result.passId}
          holderName={result.holderName}
          reason={reasonText(result.reason)}
          offline={!online}
          onAllow={() => commit('allow')}
          onDeny={() => commit('deny')}
          onNext={() => setResult(null)}
        />
      ) : (
        <section className="rounded-2xl border border-border/50 bg-white p-4 shadow-sm">
          <div className="mb-3 text-center">
            <h1 className="text-lg font-bold text-brand-900">✦ {t('validator.scan.ready')} ✦</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">{t('validator.scan.hint')}</p>
          </div>
          <Scanner onDetected={handleDetected} />
        </section>
      )}
    </div>
  );
}

function Tally({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: 'default' | 'ok' | 'bad' | 'warn';
}) {
  const tones = {
    default: 'bg-muted text-foreground',
    ok: 'bg-brand-100 text-brand-800',
    bad: 'bg-rose-100 text-rose-800',
    warn: 'bg-amber-100 text-amber-800',
  } as const;
  return (
    <div className="rounded-2xl border border-border/50 bg-white p-2.5 text-center shadow-sm">
      <span className={`mx-auto grid h-7 w-7 place-items-center rounded-lg ${tones[tone]}`}>{icon}</span>
      <p className="mt-1.5 text-lg font-bold leading-none text-brand-900">{value}</p>
      <p className="mt-1 truncate text-[9px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
