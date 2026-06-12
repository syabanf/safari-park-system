import { useAuthStore } from '@/features/auth/store';
import { api } from '@/lib/api';
import { track } from '@/lib/telemetry';
import { useMutation } from '@tanstack/react-query';
import { endpoints } from '@tsi/api-client';
import { useTranslation } from '@tsi/i18n';
import { validatorDb } from '@tsi/offline-storage';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@tsi/ui';
import { HTTPError } from 'ky';
import { AlertTriangle, CheckCircle2, CloudOff, XCircle } from 'lucide-react';
import { useState } from 'react';

type Feedback =
  | { kind: 'ok'; passId: string }
  | { kind: 'denied'; passId: string; reason: string }
  | { kind: 'buffered'; passId: string }
  | { kind: 'error' };

export function ManualEntryRoute() {
  const { t } = useTranslation();
  const [passId, setPassId] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const gateId = useAuthStore((s) => s.gateId) ?? 'gate-unknown';

  const reasonText = (code: string) =>
    t(`validator.result.reason.${code}`, { defaultValue: t('validator.result.reason.unknown') });

  const mutation = useMutation({
    mutationFn: () => {
      const scannedAt = Math.floor(Date.now() / 1000);
      track('scan.manual', { passId });
      return endpoints.submitRedemption(api, {
        jti: `manual_${scannedAt}`,
        passId,
        gateId,
        scannedAt,
        verdict: 'manual',
        reason: 'manual-entry',
      });
    },
    async onSuccess(response) {
      const scannedAt = Math.floor(Date.now() / 1000);
      const submitted = passId;
      await validatorDb.recentScans.put({
        id: response.id,
        jti: `manual_${scannedAt}`,
        passId: submitted,
        holderName: response.passHolder ?? submitted,
        scannedAt,
        verdict: 'manual',
        source: 'manual',
      });
      setFeedback({ kind: 'ok', passId: submitted });
      setPassId('');
    },
    async onError(err) {
      const scannedAt = Math.floor(Date.now() / 1000);
      const submitted = passId;

      // Server deny (HTTP 409) — show a red verdict with the translated reason.
      if (err instanceof HTTPError && err.response.status === 409) {
        let reason = 'unknown';
        try {
          const body = (await err.response.clone().json()) as { status?: string; reason?: string };
          if (body.status === 'denied' && body.reason) reason = body.reason;
        } catch {
          /* non-JSON body — fall back to the generic deny reason */
        }
        await validatorDb.recentScans.put({
          id: `deny_${scannedAt}_${submitted}`,
          jti: `manual_${scannedAt}`,
          passId: submitted,
          holderName: submitted,
          scannedAt,
          verdict: 'deny',
          source: 'manual',
        });
        track('scan.denied', { manual: true, reason });
        setFeedback({ kind: 'denied', passId: submitted, reason });
        return;
      }

      // Network failure — buffer the entry for later sync (same as scan commit).
      try {
        await validatorDb.pendingRedemptions.put({
          id: `local_${scannedAt}_manual_${submitted}`,
          jti: `manual_${scannedAt}`,
          passId: submitted,
          gateId,
          scannedAt,
          verdict: 'manual',
          reason: 'manual-entry',
          syncedAt: null,
          attemptCount: 0,
        });
        await validatorDb.recentScans.put({
          id: `local_${scannedAt}_manual_${submitted}`,
          jti: `manual_${scannedAt}`,
          passId: submitted,
          holderName: submitted,
          scannedAt,
          verdict: 'manual',
          source: 'offline',
        });
        track('scan.offline', { manual: true });
        setFeedback({ kind: 'buffered', passId: submitted });
        setPassId('');
      } catch {
        setFeedback({ kind: 'error' });
      }
    },
  });

  const submit = () => {
    setFeedback(null);
    mutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('validator.manual.title')}</CardTitle>
        <CardDescription>{t('validator.manual.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="passId">{t('validator.manual.passIdLabel')}</Label>
          <Input
            id="passId"
            value={passId}
            onChange={(e) => setPassId(e.target.value)}
            autoCapitalize="characters"
          />
        </div>
        <Button
          className="w-full"
          disabled={!passId || mutation.isPending}
          onClick={submit}
        >
          {mutation.isPending ? t('common.loading') : t('validator.manual.submit')}
        </Button>

        {feedback?.kind === 'ok' ? (
          <p className="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2.5 text-xs font-medium text-brand-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="font-mono">{feedback.passId}</span> · {t('validator.result.allowTitle')}
          </p>
        ) : null}
        {feedback?.kind === 'denied' ? (
          <p className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-800">
            <XCircle className="h-4 w-4 shrink-0" />
            <span className="font-mono">{feedback.passId}</span> · {reasonText(feedback.reason)}
          </p>
        ) : null}
        {feedback?.kind === 'buffered' ? (
          <p className="flex items-center gap-2 rounded-xl bg-earth-100 px-3 py-2.5 text-xs font-medium text-earth-800">
            <CloudOff className="h-4 w-4 shrink-0" />
            {t('validator.manual.buffered')}
          </p>
        ) : null}
        {feedback?.kind === 'error' ? (
          <p className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {t('validator.manual.error')}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
