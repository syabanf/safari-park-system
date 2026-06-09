import { useTranslation } from '@tsi/i18n';
import { cn } from '@tsi/ui';
import { BarChart3, Camera, Keyboard, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export function BottomNav() {
  const { t } = useTranslation();
  const items = [
    { to: '/scan', label: t('validator.nav.scan'), icon: Camera },
    { to: '/manual', label: t('validator.nav.manual'), icon: Keyboard },
    { to: '/reports', label: t('validator.nav.reports'), icon: BarChart3 },
    { to: '/profile', label: t('validator.nav.profile'), icon: User },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-md border-t border-border/50 bg-background/80 px-3 pb-[max(env(safe-area-inset-bottom),0.6rem)] pt-2 backdrop-blur-md">
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
                        : 'group-hover:bg-muted',
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
