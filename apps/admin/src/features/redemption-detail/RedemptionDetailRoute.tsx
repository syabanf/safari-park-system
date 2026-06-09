import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@tsi/ui';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, ShieldCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

interface RedemptionDetail {
  id: string;
  passHolder: string;
  passId: string;
  memberId: string;
  gateId: string;
  gateLabel: string;
  scannedAt: string;
  verdict: 'allow' | 'deny' | 'manual';
  source: 'online' | 'offline' | 'manual';
  latencyMs: number;
  operator: string;
  jti: string;
  kid: string;
  deviceId: string;
  signatureValid: boolean;
  geo: { lat: number; lng: number; accuracyM: number };
  timeline: { id: string; label: string; timestamp: string; latencyMs: number }[];
}

async function fetchRedemption(id: string): Promise<RedemptionDetail> {
  return (await api.http.get(`admin/redemptions/${id}`).json()) as RedemptionDetail;
}

const verdictVariant = { allow: 'success', deny: 'destructive', manual: 'warning' } as const;

export function RedemptionDetailRoute() {
  const { id = '' } = useParams();
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'redemptions', id], queryFn: () => fetchRedemption(id), enabled: !!id });

  if (isLoading || !data) return <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>;

  const fmt = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'medium' });

  return (
    <div className="space-y-6">
      <Link to="/redemptions" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" />
        Back to redemptions
      </Link>

      <motion.header initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-100 text-brand-700"><ShieldCheck className="h-6 w-6" /></div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Redemption · {data.id}</p>
              <h1 className="text-2xl font-bold tracking-tight">{data.passHolder}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                <Link to={`/members/${data.memberId}`} className="hover:text-brand-700 hover:underline">{data.memberId}</Link>{' '}·{' '}
                <Link to={`/passes/${data.passId}`} className="hover:text-brand-700 hover:underline">{data.passId}</Link>{' '}·{' '}
                <Link to={`/gates/${data.gateId}`} className="hover:text-brand-700 hover:underline">{data.gateLabel}</Link>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={verdictVariant[data.verdict]}>{data.verdict}</Badge>
            <Badge variant="secondary">{data.source}</Badge>
          </div>
        </div>
      </motion.header>

      <div className="grid gap-3 md:grid-cols-4">
        <Tile label="Scanned" value={fmt.format(new Date(data.scannedAt))} />
        <Tile label="Latency" value={`${data.latencyMs} ms`} />
        <Tile label="Operator" value={data.operator} />
        <Tile label="Signature" value={data.signatureValid ? 'Valid' : 'INVALID'} highlight={data.signatureValid} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Validation pipeline</CardTitle></CardHeader>
        <CardContent>
          <ol className="relative space-y-3 border-l-2 border-brand-200 pl-5">
            {data.timeline.map((s, i) => (
              <motion.li key={s.id} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: i * 0.05 }}>
                <span className="absolute -left-[9px] mt-1.5 grid h-4 w-4 place-items-center rounded-full border-2 border-brand-200 bg-white">
                  <Check className="h-2.5 w-2.5 text-brand-700" />
                </span>
                <p className="text-sm font-medium">{s.label}</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {fmt.format(new Date(s.timestamp))} · +{s.latencyMs} ms
                </p>
              </motion.li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Technical details</CardTitle></CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <Row label="jti" value={data.jti} mono />
          <Row label="kid (public key)" value={data.kid} mono />
          <Row label="Device ID" value={data.deviceId} mono />
          <Row label="GPS" value={`${data.geo.lat.toFixed(4)}, ${data.geo.lng.toFixed(4)} · ±${data.geo.accuracyM}m`} mono />
        </CardContent>
      </Card>
    </div>
  );
}

function Tile({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className={`mt-2 text-sm font-bold tracking-tight ${highlight ? 'text-brand-800' : ''}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl bg-muted/30 p-3">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`mt-1 ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
    </div>
  );
}
