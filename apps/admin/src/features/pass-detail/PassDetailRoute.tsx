import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Badge, Card, CardContent, CardHeader, CardTitle, PassCard } from '@tsi/ui';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

interface PassDetail {
  id: string;
  memberId: string;
  holderName: string;
  tier: 'adult' | 'child' | 'senior' | 'family';
  status: 'active' | 'expired' | 'suspended' | 'pending';
  validFrom: string;
  validUntil: string;
  issuedAt: string;
  renewals: { id: string; date: string; amountIdr: number; channel: string }[];
  redemptions: {
    id: string;
    gateId: string;
    scannedAt: string;
    verdict: 'allow' | 'deny' | 'manual';
    source: 'online' | 'offline' | 'manual';
  }[];
}

async function fetchPass(id: string): Promise<PassDetail> {
  return (await api.http.get(`admin/passes/${id}`).json()) as PassDetail;
}

const idr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

const verdictVariant = {
  allow: 'success',
  deny: 'destructive',
  manual: 'warning',
} as const;

export function PassDetailRoute() {
  const { id = '' } = useParams();
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'passes', id],
    queryFn: () => fetchPass(id),
    enabled: !!id,
  });

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>;
  }

  const formatter = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'short' });
  const dateOnly = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' });

  return (
    <div className="space-y-6">
      <Link
        to="/passes"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to passes
      </Link>

      <motion.header
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {t('admin.passes.detail.title')}
        </p>
        <h1 className="text-2xl font-bold tracking-tight">{data.holderName}</h1>
        <p className="font-mono text-xs text-muted-foreground">{data.id}</p>
      </motion.header>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <PassCard
            holderName={data.holderName}
            tierLabel={data.tier}
            statusLabel={data.status}
            status={data.status}
            expiresLabel={`Valid until ${dateOnly.format(new Date(data.validUntil))}`}
            visitsLabel="Unlimited visits"
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('admin.passes.detail.renewals')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Channel</th>
                </tr>
              </thead>
              <tbody>
                {data.renewals.map((r, i) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.04 }}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-5 py-3">{dateOnly.format(new Date(r.date))}</td>
                    <td className="px-5 py-3 font-mono">{idr.format(r.amountIdr)}</td>
                    <td className="px-5 py-3 text-muted-foreground">{r.channel}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('admin.passes.detail.redemptions')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3 font-medium">Time</th>
                <th className="px-6 py-3 font-medium">Gate</th>
                <th className="px-6 py-3 font-medium">Verdict</th>
                <th className="px-6 py-3 font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              {data.redemptions.map((r, i) => (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.025 }}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                    {formatter.format(new Date(r.scannedAt))}
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">
                    <Link to={`/gates/${r.gateId}`} className="hover:text-brand-700 hover:underline">
                      {r.gateId}
                    </Link>
                  </td>
                  <td className="px-6 py-3">
                    <Badge variant={verdictVariant[r.verdict]}>{r.verdict}</Badge>
                  </td>
                  <td className="px-6 py-3 text-xs">{r.source}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
