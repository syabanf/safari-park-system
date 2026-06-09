import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@tsi/ui';
import { motion } from 'framer-motion';
import { ArrowLeftRight, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface Mismatch {
  id: string;
  passId: string;
  holderName: string;
  gateId: string;
  witTimestamp: string | null;
  globaltixTimestamp: string | null;
  delta: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'investigating' | 'resolved';
}

interface ReconciliationData {
  summary: {
    totalToday: number;
    matched: number;
    mismatched: number;
    pending: number;
    accuracyPct: number;
  };
  mismatches: Mismatch[];
}

async function fetchReconciliation(): Promise<ReconciliationData> {
  return (await api.http.get('admin/reconciliation').json()) as ReconciliationData;
}

const severityVariant = {
  low: 'secondary',
  medium: 'warning',
  high: 'destructive',
} as const;

const statusVariant = {
  open: 'destructive',
  investigating: 'warning',
  resolved: 'success',
} as const;

export function ReconciliationRoute() {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'reconciliation'],
    queryFn: fetchReconciliation,
  });

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>;
  }

  const formatter = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.reconciliation.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('admin.reconciliation.subtitle')}</p>
      </header>

      <div className="grid gap-3 md:grid-cols-5">
        <SummaryTile label={t('admin.reconciliation.summary.total')} value={data.summary.totalToday} />
        <SummaryTile
          label={t('admin.reconciliation.summary.matched')}
          value={data.summary.matched}
          icon={<CheckCircle2 className="h-4 w-4 text-brand-700" />}
        />
        <SummaryTile
          label={t('admin.reconciliation.summary.mismatched')}
          value={data.summary.mismatched}
          icon={<XCircle className="h-4 w-4 text-rose-600" />}
        />
        <SummaryTile
          label={t('admin.reconciliation.summary.pending')}
          value={data.summary.pending}
          icon={<Clock className="h-4 w-4 text-earth-700" />}
        />
        <SummaryTile
          label={t('admin.reconciliation.summary.accuracy')}
          value={`${data.summary.accuracyPct.toFixed(2)}%`}
          icon={<ArrowLeftRight className="h-4 w-4 text-brand-700" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('admin.reconciliation.table.title')}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3 font-medium">{t('admin.reconciliation.table.pass')}</th>
                <th className="px-6 py-3 font-medium">{t('admin.reconciliation.table.gate')}</th>
                <th className="px-6 py-3 font-medium">{t('admin.reconciliation.table.wit')}</th>
                <th className="px-6 py-3 font-medium">{t('admin.reconciliation.table.globaltix')}</th>
                <th className="px-6 py-3 font-medium">{t('admin.reconciliation.table.delta')}</th>
                <th className="px-6 py-3 font-medium">{t('admin.reconciliation.table.severity')}</th>
                <th className="px-6 py-3 font-medium">{t('admin.reconciliation.table.status')}</th>
              </tr>
            </thead>
            <tbody>
              {data.mismatches.map((m, i) => (
                <motion.tr
                  key={m.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-6 py-3">
                    <div className="font-medium">{m.holderName}</div>
                    <div className="font-mono text-xs text-muted-foreground">{m.passId}</div>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">{m.gateId}</td>
                  <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                    {m.witTimestamp ? formatter.format(new Date(m.witTimestamp)) : '—'}
                  </td>
                  <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                    {m.globaltixTimestamp ? formatter.format(new Date(m.globaltixTimestamp)) : '—'}
                  </td>
                  <td className="px-6 py-3 text-sm">{m.delta}</td>
                  <td className="px-6 py-3">
                    <Badge variant={severityVariant[m.severity]}>{m.severity}</Badge>
                  </td>
                  <td className="px-6 py-3">
                    <Badge variant={statusVariant[m.status]}>{m.status}</Badge>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
          {icon ?? null}
        </div>
        <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}
