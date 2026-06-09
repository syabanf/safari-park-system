import { useTranslation } from '@tsi/i18n';
import { Button } from '@tsi/ui';
import { Scanner as QrScanner } from '@yudiel/react-qr-scanner';
import { Camera } from 'lucide-react';
import { useState } from 'react';

interface ScannerProps {
  onDetected: (value: string) => void;
}

export function Scanner({ onDetected }: ScannerProps) {
  const { t } = useTranslation();
  const [active, setActive] = useState(false);
  const [denied, setDenied] = useState(false);

  if (!active) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-dashed bg-muted">
          <Camera className="h-12 w-12 text-muted-foreground" />
        </div>
        <Button onClick={() => setActive(true)}>{t('validator.scan.grantCamera')}</Button>
      </div>
    );
  }

  if (denied) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        {t('validator.scan.cameraDenied')}
      </div>
    );
  }

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg">
      <QrScanner
        onScan={(results) => {
          const value = results[0]?.rawValue;
          if (value) onDetected(value);
        }}
        onError={(err) => {
          console.warn('scanner error', err);
          setDenied(true);
        }}
        constraints={{ facingMode: 'environment' }}
        styles={{ container: { width: '100%', height: '100%' } }}
      />
    </div>
  );
}
