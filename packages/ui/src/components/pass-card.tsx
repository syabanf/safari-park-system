import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { StatusBadge } from './status-badge';

interface PassCardProps {
  holderName: string;
  tierLabel: string;
  statusLabel: string;
  status: 'active' | 'expired' | 'suspended' | 'pending';
  expiresLabel: string;
  visitsLabel?: string;
}

export function PassCard({
  holderName,
  tierLabel,
  statusLabel,
  status,
  expiresLabel,
  visitsLabel,
}: PassCardProps) {
  return (
    <Card className="relative overflow-hidden border-brand-200/60 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 text-white shadow-xl shadow-brand-900/20">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gradient-to-br from-earth-300/40 to-transparent blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-gradient-to-tr from-brand-400/30 to-transparent blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: '14px 14px',
        }}
      />
      <CardHeader className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardDescription className="text-xs uppercase tracking-widest text-brand-200">
              {tierLabel}
            </CardDescription>
            <CardTitle className="mt-1 text-2xl text-white">{holderName}</CardTitle>
          </div>
          <StatusBadge status={status} label={statusLabel} />
        </div>
      </CardHeader>
      <CardContent className="relative space-y-1.5 text-sm">
        <p className="font-medium text-brand-100">{expiresLabel}</p>
        {visitsLabel ? <p className="text-xs text-brand-300">{visitsLabel}</p> : null}
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[10px] uppercase tracking-widest text-brand-300">
          <span>Annual Pass</span>
          <span>Taman Safari · ID</span>
        </div>
      </CardContent>
    </Card>
  );
}
