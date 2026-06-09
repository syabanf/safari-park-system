import { useOnline } from '@/hooks/useOnline';
import { track } from '@/lib/telemetry';
import { useTranslation } from '@tsi/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tsi/ui';
import { useEffect } from 'react';
import { QrDisplay } from './QrDisplay';
import { useRotatingQR } from './useRotatingQR';
import { useTokenBuffer } from './useTokenBuffer';

export function QrRoute() {
  const { t } = useTranslation();
  const online = useOnline();
  const { activeCount, isRefilling } = useTokenBuffer();
  const { token, secondsRemaining } = useRotatingQR();

  useEffect(() => {
    if (token) track('qr.rendered', { jti: token.jti });
  }, [token]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('member.qr.title')}</CardTitle>
        <CardDescription>{t('member.qr.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {token ? (
          <>
            <QrDisplay value={token.jws} />
            <p className="text-sm text-muted-foreground">
              {t('qr.rotates', { seconds: secondsRemaining })}
            </p>
          </>
        ) : (
          <div className="flex h-[280px] w-[280px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            {isRefilling ? t('common.loading') : t('qr.bufferLow')}
          </div>
        )}
        <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
          <span>buffer: {activeCount}</span>
          <span>{online ? 'online' : t('qr.offline')}</span>
        </div>
      </CardContent>
    </Card>
  );
}
