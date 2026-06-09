import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Badge, Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '@tsi/ui';
import { motion } from 'framer-motion';
import { Activity, ArrowLeft, Calendar, FileText, Mail, Phone, User as UserIcon } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

interface MemberDetail {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  nationality: string;
  dateOfBirth: string;
  joinedAt: string;
  pass: {
    id: string;
    tier: 'adult' | 'child' | 'senior' | 'family';
    status: 'active' | 'expired' | 'suspended' | 'pending';
    validFrom: string;
    validUntil: string;
    visitsAllowed: number | null;
    visitsUsed: number;
    renewals: number;
  };
  recentRedemptions: {
    id: string;
    gateId: string;
    scannedAt: string;
    verdict: 'allow' | 'deny' | 'manual';
    source: 'online' | 'offline' | 'manual';
  }[];
  timeline: {
    id: string;
    label: string;
    timestamp: string;
    category: 'renewal' | 'entry' | 'perk' | 'system' | 'profile';
  }[];
}

async function fetchMemberDetail(id: string): Promise<MemberDetail> {
  return (await api.http.get(`admin/members/${id}`).json()) as MemberDetail;
}

const verdictVariant: Record<MemberDetail['recentRedemptions'][number]['verdict'], 'success' | 'destructive' | 'warning'> = {
  allow: 'success',
  deny: 'destructive',
  manual: 'warning',
};

const categoryDot: Record<MemberDetail['timeline'][number]['category'], string> = {
  renewal: 'bg-earth-500',
  entry: 'bg-brand-600',
  perk: 'bg-rose-500',
  system: 'bg-slate-400',
  profile: 'bg-brand-400',
};

export function MemberDetailRoute() {
  const { id = '' } = useParams();
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'members', id],
    queryFn: () => fetchMemberDetail(id),
    enabled: !!id,
  });

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>;
  }

  const formatter = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="space-y-6">
      <Link
        to="/members"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        {t('admin.members.detail.backToList')}
      </Link>

      <motion.header
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-4"
      >
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800 text-lg font-bold text-white shadow-lg shadow-brand-900/20">
          {data.fullName.split(' ').map((w) => w[0]).slice(0, 2).join('')}
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {t('admin.members.detail.title')}
          </p>
          <h1 className="text-2xl font-bold tracking-tight">{data.fullName}</h1>
          <p className="text-xs text-muted-foreground">{data.id}</p>
        </div>
      </motion.header>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile" icon={<UserIcon className="h-3.5 w-3.5" />}>Profile</TabsTrigger>
          <TabsTrigger value="activity" icon={<Activity className="h-3.5 w-3.5" />} count={data.recentRedemptions.length}>
            Activity
          </TabsTrigger>
          <TabsTrigger value="documents" icon={<FileText className="h-3.5 w-3.5" />}>Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base">{t('admin.members.detail.profile')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Row icon={Mail} label="Email" value={data.email} />
                <Row icon={Phone} label="Phone" value={data.phone} />
                <Row icon={UserIcon} label="Nationality" value={data.nationality} />
                <Row icon={Calendar} label="Joined" value={formatter.format(new Date(data.joinedAt))} />
              </CardContent>
            </Card>

            <Card className="overflow-hidden lg:col-span-2">
              <div className="bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 p-5 text-white">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-brand-200">
                      {t('admin.members.detail.passInfo')}
                    </p>
                    <p className="mt-1 font-mono text-xs text-brand-100">{data.pass.id}</p>
                    <p className="mt-2 text-xl font-bold capitalize">
                      {t(`pass.tier.${data.pass.tier}`)}
                    </p>
                  </div>
                  <Badge variant="success">{t(`pass.status.${data.pass.status}`)}</Badge>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                  <Stat label="Valid until" value={new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }).format(new Date(data.pass.validUntil))} />
                  <Stat label="Visits used" value={data.pass.visitsUsed.toString()} />
                  <Stat label="Renewals" value={data.pass.renewals.toString()} />
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">{t('admin.members.detail.recentRedemptions')}</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0">
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
                    {data.recentRedemptions.map((r, i) => (
                      <motion.tr
                        key={r.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.03 }}
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

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('admin.members.detail.timeline')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {data.timeline.map((entry, i) => (
                    <motion.li
                      key={entry.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.04 }}
                      className="flex items-start gap-3"
                    >
                      <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${categoryDot[entry.category]}`} />
                      <div className="min-w-0 flex-1 text-sm">
                        <p className="font-medium">{entry.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatter.format(new Date(entry.timestamp))}
                        </p>
                      </div>
                    </motion.li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Identity & consent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DocRow label="ID document" status="verified" filename="ktp-front.jpg" date={formatter.format(new Date(data.joinedAt))} />
              <DocRow label="Selfie verification" status="verified" filename="selfie.jpg" date={formatter.format(new Date(data.joinedAt))} />
              <DocRow label="Data processing consent" status="signed" filename="consent-v2.pdf" date={formatter.format(new Date(data.joinedAt))} />
              <DocRow label="Marketing consent" status="opt-in" filename="marketing-consent.pdf" date={formatter.format(new Date(data.joinedAt))} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 p-2.5">
      <p className="text-[10px] uppercase tracking-widest text-brand-200">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

function DocRow({ label, status, filename, date }: { label: string; status: string; filename: string; date: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 p-3 text-sm">
      <div>
        <p className="font-medium">{label}</p>
        <p className="font-mono text-[11px] text-muted-foreground">{filename} · {date}</p>
      </div>
      <Badge variant={status === 'verified' || status === 'signed' || status === 'opt-in' ? 'success' : 'secondary'}>
        {status}
      </Badge>
    </div>
  );
}
