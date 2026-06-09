import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@tsi/ui';
import { motion } from 'framer-motion';
import { ArrowLeft, FileCheck, FileText } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

interface ComplianceDetail {
  id: string;
  name: string;
  authority: string;
  issuedAt: string;
  expires: string;
  status: string;
  referenceNumber: string;
  owner: string;
  nextAction: string;
  history: { id: string; date: string; label: string; actor: string }[];
  documents: { id: string; filename: string; size: string }[];
}

async function fetchDoc(id: string): Promise<ComplianceDetail> {
  return (await api.http.get(`admin/compliance/${id}`).json()) as ComplianceDetail;
}

export function ComplianceDetailRoute() {
  const { id = '' } = useParams();
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'compliance', id], queryFn: () => fetchDoc(id), enabled: !!id });

  if (isLoading || !data) return <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>;

  const fmt = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' });
  const days = Math.round((new Date(data.expires).getTime() - Date.now()) / 86_400_000);

  return (
    <div className="space-y-6">
      <Link to="/compliance" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" />
        Back to compliance
      </Link>

      <motion.header initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-100 text-brand-700"><FileCheck className="h-6 w-6" /></div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{data.authority} · {data.referenceNumber}</p>
              <h1 className="text-2xl font-bold tracking-tight">{data.name}</h1>
              <p className="mt-1 text-xs text-muted-foreground">Owner: {data.owner}</p>
            </div>
          </div>
          <Badge variant="success">{days}d to expiry</Badge>
        </div>
      </motion.header>

      <div className="grid gap-3 md:grid-cols-3">
        <Tile label="Issued" value={fmt.format(new Date(data.issuedAt))} />
        <Tile label="Expires" value={fmt.format(new Date(data.expires))} />
        <Tile label="Next action" value={data.nextAction} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">History</CardTitle></CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {data.history.map((h, i) => (
              <motion.li
                key={h.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
                className="flex items-start gap-3"
              >
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-500" />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-medium">{h.label}</p>
                  <p className="text-xs text-muted-foreground">{fmt.format(new Date(h.date))} · {h.actor}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Files</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {data.documents.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-xl bg-muted/30 p-3 text-sm">
              <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-brand-700" />{d.filename}</span>
              <span className="font-mono text-xs text-muted-foreground">{d.size}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return <Card><CardContent className="p-4"><p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p><p className="mt-2 text-sm font-medium">{value}</p></CardContent></Card>;
}
