import { cn } from '@tsi/ui';
import { Gauge, LayoutDashboard, type LucideIcon, Menu, Newspaper, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

// Four most-used destinations on the small-screen experience; everything else
// is one tap away via the "More" button that opens the full drawer.
const ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/members', label: 'Members', icon: Users },
  { to: '/sla', label: 'Ops', icon: Gauge },
  { to: '/cms', label: 'CMS', icon: Newspaper },
];

interface Props {
  onMoreClick: () => void;
}

export function BottomNav({ onMoreClick }: Props) {
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-border/60 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      {ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
              isActive ? 'text-brand-700' : 'text-muted-foreground hover:text-foreground',
            )
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  'grid h-7 w-7 place-items-center rounded-lg transition-colors',
                  isActive ? 'bg-brand-100' : 'bg-transparent',
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              {label}
            </>
          )}
        </NavLink>
      ))}
      <button
        type="button"
        onClick={onMoreClick}
        aria-label="More navigation"
        className="flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <span className="grid h-7 w-7 place-items-center rounded-lg">
          <Menu className="h-4 w-4" />
        </span>
        More
      </button>
    </nav>
  );
}
