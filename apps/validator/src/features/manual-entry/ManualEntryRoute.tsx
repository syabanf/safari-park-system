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
import { useState } from 'react';

export function ManualEntryRoute() {
  const { t } = useTranslation();
  const [passId, setPassId] = useState('');
  const gateId = useAuthStore((s) => s.gateId) ?? 'gate-unknown';

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
      await validatorDb.recentScans.put({
        id: response.id,
        jti: `manual_${scannedAt}`,
        passId,
        holderName: response.passHolder ?? passId,
        scannedAt,
        verdict: 'manual',
        source: 'manual',
      });
      setPassId('');
    },
  });

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
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? t('common.loading') : t('validator.manual.submit')}
        </Button>
      </CardContent>
    </Card>
  );
}
