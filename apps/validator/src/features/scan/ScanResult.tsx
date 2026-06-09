import { useTranslation } from '@tsi/i18n';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tsi/ui';

interface ScanResultProps {
  status: 'allow' | 'deny' | 'manual';
  passId?: string;
  holderName?: string;
  offline: boolean;
  reason?: string;
  onAllow: () => void;
  onDeny: () => void;
  onNext: () => void;
}

export function ScanResult({
  status,
  passId,
  holderName,
  offline,
  reason,
  onAllow,
  onDeny,
  onNext,
}: ScanResultProps) {
  const { t } = useTranslation();
  const title =
    status === 'allow'
      ? t('validator.result.allowTitle')
      : status === 'deny'
        ? t('validator.result.denyTitle')
        : t('validator.result.manualTitle');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {holderName ? <CardDescription>{holderName}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {passId ? <div className="font-mono text-xs text-muted-foreground">{passId}</div> : null}
        {reason ? <p className="text-muted-foreground">{reason}</p> : null}
        {offline ? (
          <p className="rounded-md bg-earth-100 px-3 py-2 text-earth-800">
            {t('validator.result.offlineHint')}
          </p>
        ) : null}
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button variant="destructive" onClick={onDeny}>
            {t('validator.result.deny')}
          </Button>
          <Button onClick={onAllow}>{t('validator.result.allow')}</Button>
        </div>
        <Button variant="ghost" className="w-full" onClick={onNext}>
          {t('validator.result.next')}
        </Button>
      </CardContent>
    </Card>
  );
}
