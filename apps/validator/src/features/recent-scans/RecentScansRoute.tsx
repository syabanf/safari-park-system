import { useTranslation } from '@tsi/i18n';
import { validatorDb } from '@tsi/offline-storage';
import { Card, CardContent, CardHeader, CardTitle } from '@tsi/ui';
import { useLiveQuery } from 'dexie-react-hooks';

export function RecentScansRoute() {
  const { t, i18n } = useTranslation();
  const scans = useLiveQuery(
    () => validatorDb.recentScans.orderBy('scannedAt').reverse().limit(20).toArray(),
    [],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('validator.recent.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {!scans || scans.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('validator.recent.empty')}</p>
        ) : (
          <ul className="space-y-2">
            {scans.map((scan) => (
              <li
                key={scan.id}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <div>
                  <div className="font-medium">{scan.holderName}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat(i18n.language, { timeStyle: 'medium' }).format(
                      new Date(scan.scannedAt * 1000),
                    )}{' '}
                    · {scan.source}
                  </div>
                </div>
                <span
                  className={
                    scan.verdict === 'allow'
                      ? 'rounded bg-brand-100 px-2 py-0.5 text-xs text-brand-800'
                      : scan.verdict === 'deny'
                        ? 'rounded bg-destructive/10 px-2 py-0.5 text-xs text-destructive'
                        : 'rounded bg-earth-100 px-2 py-0.5 text-xs text-earth-800'
                  }
                >
                  {scan.verdict}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
