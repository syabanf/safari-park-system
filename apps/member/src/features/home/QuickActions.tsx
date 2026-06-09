import { useTranslation } from '@tsi/i18n';
import { QuickAction } from '@tsi/ui';
import { CalendarDays, MapPin, QrCode, RefreshCw, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function QuickActions() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const actions = [
    { label: t('member.home.showQr'), icon: QrCode, to: '/qr', accent: 'brand' as const },
    { label: t('member.home.renew'), icon: RefreshCw, to: '/renewal', accent: 'earth' as const },
    { label: t('member.home.events'), icon: CalendarDays, to: '/events', accent: 'rose' as const },
    { label: t('member.home.perks'), icon: Sparkles, to: '/perks', accent: 'brand' as const },
    { label: t('discover.map'), icon: MapPin, to: '/map', accent: 'slate' as const },
  ];
  return (
    <div className="grid grid-cols-4 gap-2">
      {actions.slice(0, 4).map((a) => (
        <QuickAction key={a.to} label={a.label} icon={a.icon} accent={a.accent} onClick={() => navigate(a.to)} />
      ))}
    </div>
  );
}
