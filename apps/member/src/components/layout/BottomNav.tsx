import { useTranslation } from '@tsi/i18n';
import { cn } from '@tsi/ui';
import { Compass, Home, QrCode, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export function BottomNav() {
  const { t } = useTranslation();

  const items = [
    { to: '/home', label: t('member.nav.home'), icon: Home },
    { to: '/qr', label: t('member.nav.pass'), icon: QrCode },
    { to: '/discover', label: t('member.nav.discover'), icon: Compass },
    { to: '/profile', label: t('member.nav.profile'), icon: User },
  ];

  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-10 mx-auto max-w-md border-t border-border/50 px-3 pb-[max(env(safe-area-inset-bottom),0.6rem)] pt-2">
      <ul className="flex items-center justify-around">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  'group flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-all',
                  isActive ? 'text-brand-800' : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'grid h-9 w-9 place-items-center rounded-xl transition-all',
                      isActive
                        ? 'bg-brand-100 text-brand-800 shadow-sm shadow-brand-900/10'
                        : 'text-muted-foreground group-hover:bg-muted',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
