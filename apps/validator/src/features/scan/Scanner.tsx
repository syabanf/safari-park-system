import { useTranslation } from '@tsi/i18n';
import { Scanner as QrScanner } from '@yudiel/react-qr-scanner';
import { motion } from 'framer-motion';
import { Camera, ScanLine, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

interface ScannerProps {
  onDetected: (value: string) => void;
}

/** Corner-bracket reticle overlay drawn on top of the camera feed. */
function Reticle({ animate = false }: { animate?: boolean }) {
  const corner = 'absolute h-7 w-7 border-white/90';
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-6 rounded-2xl">
        <span className={`${corner} left-0 top-0 rounded-tl-2xl border-l-[3px] border-t-[3px]`} />
        <span className={`${corner} right-0 top-0 rounded-tr-2xl border-r-[3px] border-t-[3px]`} />
        <span className={`${corner} bottom-0 left-0 rounded-bl-2xl border-b-[3px] border-l-[3px]`} />
        <span className={`${corner} bottom-0 right-0 rounded-br-2xl border-b-[3px] border-r-[3px]`} />
        {animate ? (
          <motion.span
            className="absolute inset-x-1 h-[2px] rounded-full bg-lime-400 shadow-[0_0_12px_2px] shadow-lime-400/70"
            initial={{ top: '4%' }}
            animate={{ top: ['4%', '94%', '4%'] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        ) : null}
      </div>
    </div>
  );
}

export function Scanner({ onDetected }: ScannerProps) {
  const { t } = useTranslation();
  const [active, setActive] = useState(false);
  const [denied, setDenied] = useState(false);

  if (denied) {
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-rose-950/90">
        <Reticle />
        <div className="absolute inset-0 grid place-items-center p-6 text-center">
          <div>
            <ShieldAlert className="mx-auto h-10 w-10 text-rose-300" />
            <p className="mt-3 text-sm font-medium text-rose-100">{t('validator.scan.cameraDenied')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!active) {
    return (
      <button
        type="button"
        onClick={() => setActive(true)}
        className="group relative block aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950"
      >
        <Reticle />
        <div className="absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-white/10 backdrop-blur transition-transform group-hover:scale-105">
              <Camera className="h-7 w-7 text-white" />
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-500 px-4 py-2 text-sm font-bold text-brand-950 shadow-lg">
              <ScanLine className="h-4 w-4" />
              {t('validator.scan.grantCamera')}
            </span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-black">
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
      <Reticle animate />
    </div>
  );
}
