import { useAuthStore } from '@/features/auth/store';
import { useOnline } from '@/hooks/useOnline';
import { api } from '@/lib/api';
import { track } from '@/lib/telemetry';
import { useMutation } from '@tanstack/react-query';
import { endpoints } from '@tsi/api-client';
import { useTranslation } from '@tsi/i18n';
import { validatorDb } from '@tsi/offline-storage';
import { decodeJws } from '@tsi/qr-core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tsi/ui';
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
  reason?: string;
  jws: string;
}

export function ScanRoute() {
  const { t } = useTranslation();
  const online = useOnline();
  const gateId = useAuthStore((s) => s.gateId) ?? 'gate-unknown';
  const verification = useVerification();
  const keys = usePublicKeySync();
  const [result, setResult] = useState<PendingResult | null>(null);

  const redeem = useMutation({
    mutationFn: (body: Parameters<typeof endpoints.submitRedemption>[1]) =>
      endpoints.submitRedemption(api, body),
  });

  const handleDetected = async (value: string) => {
    if (result) return;
    track('scan.detected');

    const decoded = decodeJws(value);
    if (!decoded) {
      setResult({ status: 'deny', reason: 'malformed QR', jws: value });
      return;
    }

    if (!verification.loaded) {
      setResult({
        status: 'manual',
        jws: value,
        passId: decoded.payload.passId,
        jti: decoded.payload.jti,
        reason: 'Keys not loaded yet',
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

    setResult({
      status: 'allow',
      passId: verdict.payload.passId,
      jti: verdict.payload.jti,
      jws: value,
    });
  };

  const commit = async (verdict: 'allow' | 'deny') => {
    if (!result) return;
    const scanned = result;
    const scannedAt = Math.floor(Date.now() / 1000);

    if (scanned.jti) {
      await validatorDb.consumedJti.put({
        jti: scanned.jti,
        exp: scannedAt + 120,
        consumedAt: scannedAt,
      });
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
    } catch {
      const offlineId = `local_${scannedAt}_${scanned.jti ?? 'manual'}`;
      await validatorDb.pendingRedemptions.put({
        id: offlineId,
        ...submission,
        syncedAt: null,
        attemptCount: 0,
      });
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('validator.scan.title')}</CardTitle>
          <CardDescription>{t('validator.scan.hint')}</CardDescription>
        </CardHeader>
        <CardContent>
          {result ? null : <Scanner onDetected={handleDetected} />}
          {!keys.data && keys.isLoading ? (
            <p className="mt-3 text-xs text-muted-foreground">{t('common.loading')}</p>
          ) : null}
        </CardContent>
      </Card>

      {result ? (
        <ScanResult
          status={result.status}
          passId={result.passId}
          holderName={result.holderName}
          reason={result.reason}
          offline={!online}
          onAllow={() => commit('allow')}
          onDeny={() => commit('deny')}
          onNext={() => setResult(null)}
        />
      ) : null}
    </div>
  );
}
