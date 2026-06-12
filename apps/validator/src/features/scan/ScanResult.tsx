import { useTranslation } from '@tsi/i18n';
import { Button } from '@tsi/ui';
import { motion } from 'framer-motion';
import { CheckCircle2, RotateCw, ShieldQuestion, WifiOff, XCircle } from 'lucide-react';

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

const theme = {
  allow: {
    ring: 'ring-brand-300',
    head: 'bg-gradient-to-br from-brand-600 to-brand-800',
    icon: CheckCircle2,
  },
  deny: {
    ring: 'ring-rose-300',
    head: 'bg-gradient-to-br from-rose-600 to-rose-800',
    icon: XCircle,
  },
  manual: {
    ring: 'ring-amber-300',
    head: 'bg-gradient-to-br from-amber-500 to-amber-700',
    icon: ShieldQuestion,
  },
} as const;

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

  const v = theme[status];
  const Icon = v.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ${v.ring}`}
    >
      {/* Verdict header */}
      <div className={`${v.head} px-5 py-6 text-center text-white`}>
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.08, type: 'spring', stiffness: 240, damping: 16 }}
          className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/15 backdrop-blur"
        >
          <Icon className="h-9 w-9" />
        </motion.span>
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight">{title}</h2>
        {holderName ? <p className="mt-0.5 text-sm text-white/90">{holderName}</p> : null}
      </div>

      <div className="space-y-3 p-5">
        {passId ? (
          <div className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2.5 text-sm">
            <span className="text-muted-foreground">Pass ID</span>
            <span className="font-mono font-semibold">{passId}</span>
          </div>
        ) : null}
        {reason ? (
          <p className="rounded-xl bg-muted/60 px-3 py-2.5 text-xs text-muted-foreground">{reason}</p>
        ) : null}
        {offline ? (
          <p className="flex items-center gap-2 rounded-xl bg-earth-100 px-3 py-2.5 text-xs font-medium text-earth-800">
            <WifiOff className="h-3.5 w-3.5 shrink-0" />
            {t('validator.result.offlineHint')}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <Button variant="destructive" size="lg" className="h-12 text-base font-bold" onClick={onDeny}>
            <XCircle className="h-5 w-5" />
            {t('validator.result.deny')}
          </Button>
          <Button size="lg" className="h-12 text-base font-bold" onClick={onAllow}>
            <CheckCircle2 className="h-5 w-5" />
            {t('validator.result.allow')}
          </Button>
        </div>
        <Button variant="ghost" className="h-10 w-full gap-1.5 text-muted-foreground" onClick={onNext}>
          <RotateCw className="h-4 w-4" />
          {t('validator.result.next')}
        </Button>
      </div>
    </motion.div>
  );
}
