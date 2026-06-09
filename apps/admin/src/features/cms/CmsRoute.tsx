import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@tsi/ui';
import { motion } from 'framer-motion';
import {
  BellRing,
  CalendarDays,
  Cloud,
  Edit3,
  Image as ImageIcon,
  MapPin,
  Megaphone,
  Plus,
  Search,
  Sparkles,
  Ticket,
  Trash2,
  Users,
} from 'lucide-react';
import { useState } from 'react';

interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  accent: string;
  ctaLabel: string;
  ctaTarget: string;
  validUntil: string;
  status: 'active' | 'scheduled' | 'expired';
  impressions: number;
  clicks: number;
  image: string;
}
interface PromotionItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  heroEmoji: string;
  validUntil: string;
  status: string;
  claims: number;
  image: string;
}
interface EventItem {
  id: string;
  title: string;
  tag: string;
  location: string;
  datetime: string;
  capacity: number;
  booked: number;
  status: 'active' | 'sold-out' | 'past';
  image: string;
}
interface PerkItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  validUntil: string;
  status: string;
  redeemed: number;
  image: string;
}
interface NotificationItem {
  id: string;
  title: string;
  body: string;
  channel: string;
  audience: string;
  sentAt: string | null;
  status: 'sent' | 'scheduled' | 'draft';
  delivered: number;
  opened: number;
}
interface ParkStatus {
  parkName: string;
  status: string;
  hours: string;
  weather: { tempC: number; conditionEn: string; conditionLabel: string; iconKey: string };
  crowdLevel: 'low' | 'moderate' | 'high';
  featuredEvent: { id: string; title: string; location: string };
  lastUpdated: string;
  editor: string;
}
interface CmsContent {
  banners: BannerItem[];
  promotions: PromotionItem[];
  events: EventItem[];
  perks: PerkItem[];
  notifications: NotificationItem[];
  parkStatus: ParkStatus;
  summary: {
    totalBanners: number;
    activeBanners: number;
    totalPromotions: number;
    activePromotions: number;
    totalEvents: number;
    upcomingEvents: number;
    totalPerks: number;
    activePerks: number;
    pushSentThisMonth: number;
    avgOpenRate: number;
  };
}

async function fetchCms(): Promise<CmsContent> {
  return (await api.http.get('admin/cms').json()) as CmsContent;
}

const statusTone: Record<string, string> = {
  active: 'bg-brand-100 text-brand-800',
  scheduled: 'bg-blue-100 text-blue-800',
  expired: 'bg-muted text-muted-foreground',
  draft: 'bg-amber-100 text-amber-800',
  sent: 'bg-brand-100 text-brand-800',
  'sold-out': 'bg-rose-100 text-rose-800',
  past: 'bg-muted text-muted-foreground',
};

const num = new Intl.NumberFormat('id-ID');

export function CmsRoute() {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'cms'], queryFn: fetchCms });
  const [search, setSearch] = useState('');

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>;
  }

  const fmtDate = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' });
  const fmtDateTime = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'short' });

  const filterFn = <T extends { title?: string }>(items: T[]) =>
    search ? items.filter((it) => (it.title ?? '').toLowerCase().includes(search.toLowerCase())) : items;

  return (
    <div className="space-y-6">
      <header className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content (CMS)</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage everything shown in the Member app — banners, promotions, events, perks, push notifications, today's park status
          </p>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search content…"
            className="h-9 w-full rounded-full bg-white pl-9 text-sm sm:w-64"
          />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatTile icon={<ImageIcon className="h-4 w-4" />} label="Banners" primary={`${data.summary.activeBanners}/${data.summary.totalBanners}`} hint="active" />
        <StatTile icon={<Megaphone className="h-4 w-4" />} label="Promotions" primary={`${data.summary.activePromotions}/${data.summary.totalPromotions}`} hint="active" />
        <StatTile icon={<CalendarDays className="h-4 w-4" />} label="Events" primary={`${data.summary.upcomingEvents}/${data.summary.totalEvents}`} hint="upcoming" />
        <StatTile icon={<Sparkles className="h-4 w-4" />} label="Perks" primary={`${data.summary.activePerks}/${data.summary.totalPerks}`} hint="live" />
        <StatTile icon={<BellRing className="h-4 w-4" />} label="Push · 30d" primary={num.format(data.summary.pushSentThisMonth)} hint={`${data.summary.avgOpenRate}% open`} />
      </div>

      <Tabs defaultValue="banners">
        <TabsList className="flex-wrap">
          <TabsTrigger value="banners" icon={<ImageIcon className="h-3.5 w-3.5" />} count={data.banners.length}>Banners</TabsTrigger>
          <TabsTrigger value="promotions" icon={<Megaphone className="h-3.5 w-3.5" />} count={data.promotions.length}>Promotions</TabsTrigger>
          <TabsTrigger value="events" icon={<CalendarDays className="h-3.5 w-3.5" />} count={data.events.length}>Events</TabsTrigger>
          <TabsTrigger value="perks" icon={<Sparkles className="h-3.5 w-3.5" />} count={data.perks.length}>Perks</TabsTrigger>
          <TabsTrigger value="notifications" icon={<BellRing className="h-3.5 w-3.5" />} count={data.notifications.length}>Notifications</TabsTrigger>
          <TabsTrigger value="park-status" icon={<Cloud className="h-3.5 w-3.5" />}>Park status</TabsTrigger>
        </TabsList>

        <TabsContent value="banners">
          <ContentToolbar onCreate={() => alert('New banner — stub')} createLabel="New banner" />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filterFn(data.banners).map((b, i) => (
              <CmsTile
                key={b.id}
                index={i}
                image={b.image}
                tag={b.tag}
                title={b.title}
                subtitle={b.subtitle}
                status={b.status}
                metaLines={[
                  `Valid until ${fmtDate.format(new Date(b.validUntil))}`,
                  `${num.format(b.impressions)} impressions · ${num.format(b.clicks)} clicks (${b.impressions > 0 ? Math.round((b.clicks / b.impressions) * 1000) / 10 : 0}% CTR)`,
                  `CTA: ${b.ctaLabel} → ${b.ctaTarget}`,
                ]}
                onEdit={() => alert(`Edit ${b.id} — stub`)}
                onDelete={() => alert(`Delete ${b.id} — stub`)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="promotions">
          <ContentToolbar onCreate={() => alert('New promotion — stub')} createLabel="New promotion" />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filterFn(data.promotions).map((p, i) => (
              <CmsTile
                key={p.id}
                index={i}
                image={p.image}
                tag={p.tag}
                emoji={p.heroEmoji}
                title={p.title}
                subtitle={p.subtitle}
                status={p.status}
                metaLines={[
                  `Valid until ${fmtDate.format(new Date(p.validUntil))}`,
                  `${num.format(p.claims)} claims`,
                ]}
                onEdit={() => alert(`Edit ${p.id} — stub`)}
                onDelete={() => alert(`Delete ${p.id} — stub`)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events">
          <ContentToolbar onCreate={() => alert('New event — stub')} createLabel="New event" />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filterFn(data.events).map((e, i) => {
              const pct = Math.round((e.booked / e.capacity) * 100);
              return (
                <CmsTile
                  key={e.id}
                  index={i}
                  image={e.image}
                  tag={e.tag}
                  title={e.title}
                  subtitle={e.location}
                  status={e.status}
                  metaLines={[
                    fmtDateTime.format(new Date(e.datetime)),
                    `${num.format(e.booked)} / ${num.format(e.capacity)} booked (${pct}%)`,
                  ]}
                  progressPct={pct}
                  onEdit={() => alert(`Edit ${e.id} — stub`)}
                  onDelete={() => alert(`Delete ${e.id} — stub`)}
                />
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="perks">
          <ContentToolbar onCreate={() => alert('New perk — stub')} createLabel="New perk" />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filterFn(data.perks).map((p, i) => (
              <CmsTile
                key={p.id}
                index={i}
                image={p.image}
                tag={p.category}
                title={p.title}
                subtitle={p.summary}
                status={p.status}
                metaLines={[
                  `Valid until ${fmtDate.format(new Date(p.validUntil))}`,
                  `${num.format(p.redeemed)} redemptions`,
                ]}
                onEdit={() => alert(`Edit ${p.id} — stub`)}
                onDelete={() => alert(`Delete ${p.id} — stub`)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsPanel
            items={filterFn(data.notifications)}
            fmtDateTime={fmtDateTime}
          />
        </TabsContent>

        <TabsContent value="park-status">
          <ParkStatusPanel status={data.parkStatus} fmtDateTime={fmtDateTime} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatTile({
  icon,
  label,
  primary,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  primary: string;
  hint: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-700">{icon}</div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="text-lg font-bold tracking-tight">{primary}</p>
          <p className="text-[10px] text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ContentToolbar({ onCreate, createLabel }: { onCreate: () => void; createLabel: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <p className="text-xs text-muted-foreground">Click a card to preview · changes apply to the Member app instantly</p>
      <Button size="sm" onClick={onCreate} className="gap-1.5">
        <Plus className="h-3.5 w-3.5" />
        {createLabel}
      </Button>
    </div>
  );
}

function CmsTile({
  index,
  image,
  tag,
  emoji,
  title,
  subtitle,
  status,
  metaLines,
  progressPct,
  onEdit,
  onDelete,
}: {
  index: number;
  image: string;
  tag: string;
  emoji?: string;
  title: string;
  subtitle: string;
  status: string;
  metaLines: string[];
  progressPct?: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: Math.min(index * 0.04, 0.32) }}
    >
      <Card className="group overflow-hidden">
        <div className="relative h-32 w-full overflow-hidden bg-muted">
          <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-foreground backdrop-blur">
            {tag}
          </span>
          <span
            className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest backdrop-blur ${statusTone[status] ?? 'bg-muted text-muted-foreground'}`}
          >
            {status}
          </span>
          {emoji ? (
            <div className="absolute bottom-3 left-3 grid h-10 w-10 place-items-center rounded-xl bg-white/90 text-xl shadow-sm backdrop-blur">
              {emoji}
            </div>
          ) : null}
        </div>
        <CardContent className="p-4">
          <p className="text-sm font-semibold leading-tight">{title}</p>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{subtitle}</p>
          {progressPct !== undefined ? (
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full ${progressPct >= 100 ? 'bg-rose-500' : 'bg-brand-500'}`}
                style={{ width: `${Math.min(progressPct, 100)}%` }}
              />
            </div>
          ) : null}
          <ul className="mt-3 space-y-0.5 text-[11px] text-muted-foreground">
            {metaLines.map((line, i) => (
              <li key={i} className="truncate">{line}</li>
            ))}
          </ul>
          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 flex-1 gap-1.5" onClick={onEdit}>
              <Edit3 className="h-3 w-3" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-rose-700 hover:bg-rose-50"
              onClick={onDelete}
              aria-label="Delete"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function NotificationsPanel({
  items,
  fmtDateTime,
}: {
  items: NotificationItem[];
  fmtDateTime: Intl.DateTimeFormat;
}) {
  return (
    <div className="space-y-3">
      <ContentToolbar onCreate={() => alert('Compose push — stub')} createLabel="Compose push" />
      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3 font-medium">Message</th>
                <th className="px-6 py-3 font-medium">Channel</th>
                <th className="px-6 py-3 font-medium">Audience</th>
                <th className="px-6 py-3 font-medium">When</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Performance</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((n, i) => {
                const openRate = n.delivered > 0 ? Math.round((n.opened / n.delivered) * 1000) / 10 : null;
                return (
                  <motion.tr
                    key={n.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: Math.min(i * 0.03, 0.3) }}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-6 py-3">
                      <p className="font-medium">{n.title}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{n.body}</p>
                    </td>
                    <td className="px-6 py-3 text-xs">
                      <Badge variant="secondary">{n.channel}</Badge>
                    </td>
                    <td className="px-6 py-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {n.audience}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                      {n.sentAt ? fmtDateTime.format(new Date(n.sentAt)) : '—'}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${statusTone[n.status] ?? 'bg-muted text-muted-foreground'}`}
                      >
                        {n.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs">
                      {n.delivered > 0 ? (
                        <>
                          <p>
                            <span className="font-mono">{num.format(n.delivered)}</span> delivered
                          </p>
                          <p className="text-muted-foreground">
                            {openRate}% open · <span className="font-mono">{num.format(n.opened)}</span> opens
                          </p>
                        </>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Button size="sm" variant="outline" className="h-8 gap-1.5">
                        <Edit3 className="h-3 w-3" />
                        Edit
                      </Button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function ParkStatusPanel({
  status,
  fmtDateTime,
}: {
  status: ParkStatus;
  fmtDateTime: Intl.DateTimeFormat;
}) {
  const [tempC, setTempC] = useState(status.weather.tempC);
  const [condition, setCondition] = useState(status.weather.conditionEn);
  const [crowd, setCrowd] = useState<ParkStatus['crowdLevel']>(status.crowdLevel);
  const [featuredTitle, setFeaturedTitle] = useState(status.featuredEvent.title);
  const [featuredLocation, setFeaturedLocation] = useState(status.featuredEvent.location);
  const [open, setOpen] = useState(status.status === 'open');

  const crowdOpts: ParkStatus['crowdLevel'][] = ['low', 'moderate', 'high'];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardContent className="space-y-5 p-6">
          <div>
            <h2 className="text-base font-semibold">Today at the park</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Shown on the member home screen — last updated {fmtDateTime.format(new Date(status.lastUpdated))} by {status.editor}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Park" icon={<MapPin className="h-3.5 w-3.5" />}>
              <Input value={status.parkName} readOnly />
            </Field>
            <Field label="Hours" icon={<CalendarDays className="h-3.5 w-3.5" />}>
              <Input value={status.hours} readOnly />
            </Field>
            <Field label="Status" icon={<Sparkles className="h-3.5 w-3.5" />}>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={open ? 'default' : 'outline'}
                  onClick={() => setOpen(true)}
                  className="h-9"
                >
                  Open
                </Button>
                <Button
                  size="sm"
                  variant={!open ? 'default' : 'outline'}
                  onClick={() => setOpen(false)}
                  className="h-9"
                >
                  Closed
                </Button>
              </div>
            </Field>
            <Field label="Crowd level" icon={<Users className="h-3.5 w-3.5" />}>
              <div className="flex items-center gap-1.5">
                {crowdOpts.map((c) => (
                  <Button
                    key={c}
                    size="sm"
                    variant={crowd === c ? 'default' : 'outline'}
                    onClick={() => setCrowd(c)}
                    className="h-9 flex-1 capitalize"
                  >
                    {c}
                  </Button>
                ))}
              </div>
            </Field>
            <Field label="Temperature (°C)" icon={<Cloud className="h-3.5 w-3.5" />}>
              <Input type="number" value={tempC} onChange={(e) => setTempC(Number(e.target.value))} />
            </Field>
            <Field label="Weather condition" icon={<Cloud className="h-3.5 w-3.5" />}>
              <Input value={condition} onChange={(e) => setCondition(e.target.value)} />
            </Field>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Featured event (Up next)
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="Title" icon={<Ticket className="h-3.5 w-3.5" />}>
                <Input value={featuredTitle} onChange={(e) => setFeaturedTitle(e.target.value)} />
              </Field>
              <Field label="Location" icon={<MapPin className="h-3.5 w-3.5" />}>
                <Input value={featuredLocation} onChange={(e) => setFeaturedLocation(e.target.value)} />
              </Field>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t pt-4">
            <Button variant="outline">Revert</Button>
            <Button onClick={() => alert('Saved (stub)')}>Save & publish</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div>
            <h2 className="text-base font-semibold">Live preview</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">How it looks on a member's home screen</p>
          </div>
          <div className="overflow-hidden rounded-2xl border bg-gradient-to-br from-brand-100 to-earth-100">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold">{status.parkName}</p>
                  <p className="text-[10px] text-muted-foreground">{status.hours}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${open ? 'bg-brand-500 text-white' : 'bg-rose-500 text-white'}`}
                >
                  {open ? 'open' : 'closed'}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-xl bg-white/70 p-2.5">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Weather</p>
                  <p className="mt-1 text-sm font-semibold">{tempC}°C</p>
                  <p className="text-[10px] text-muted-foreground">{condition}</p>
                </div>
                <div className="rounded-xl bg-white/70 p-2.5">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Crowd</p>
                  <p className="mt-1 text-sm font-semibold capitalize">{crowd}</p>
                </div>
                <div className="rounded-xl bg-white/70 p-2.5">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Up next</p>
                  <p className="mt-1 truncate text-sm font-semibold">{featuredTitle}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{featuredLocation}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </p>
      {children}
    </div>
  );
}
