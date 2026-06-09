import { cn } from '@tsi/ui';
import {
  ArrowLeftRight,
  BarChart3,
  CalendarClock,
  CalendarRange,
  Database,
  DoorOpen,
  FileCheck,
  FileClock,
  FileText,
  Gauge,
  LayoutDashboard,
  Megaphone,
  Newspaper,
  PackageSearch,
  PawPrint,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Ticket,
  Truck,
  Users,
  UsersRound,
  Wallet,
  Workflow,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    items: [{ to: '/', label: 'Overview', icon: LayoutDashboard, end: true }],
  },
  {
    title: 'Pass directory',
    items: [
      { to: '/members', label: 'Members', icon: Users },
      { to: '/passes', label: 'Annual Passes', icon: Ticket },
      { to: '/redemptions', label: 'Redemptions', icon: Workflow },
    ],
  },
  {
    title: 'People',
    items: [
      { to: '/staff', label: 'Staff', icon: UsersRound },
      { to: '/shifts', label: 'Shifts', icon: CalendarClock },
      { to: '/bookings', label: 'Bookings', icon: CalendarRange },
    ],
  },
  {
    title: 'Park',
    items: [
      { to: '/gates', label: 'Gates', icon: DoorOpen },
      { to: '/animals', label: 'Animals', icon: PawPrint },
      { to: '/safety', label: 'Safety', icon: ShieldCheck },
      { to: '/compliance', label: 'Compliance', icon: FileCheck },
    ],
  },
  {
    title: 'Operations',
    items: [
      { to: '/sla', label: 'SLA — Smooth', icon: Gauge },
      { to: '/maintenance', label: 'Maintenance', icon: Wrench },
      { to: '/reconciliation', label: 'Reconciliation', icon: ArrowLeftRight },
      { to: '/audit', label: 'Audit log', icon: FileClock },
      { to: '/gap-register', label: 'Gap Register', icon: ShieldAlert },
    ],
  },
  {
    title: 'Commerce',
    items: [
      { to: '/finance', label: 'Finance', icon: Wallet },
      { to: '/inventory', label: 'Inventory', icon: PackageSearch },
      { to: '/vendors', label: 'Vendors', icon: Truck },
      { to: '/marketing', label: 'Marketing', icon: Megaphone },
    ],
  },
  {
    title: 'Content',
    items: [{ to: '/cms', label: 'Member app CMS', icon: Newspaper }],
  },
  {
    title: 'Reporting',
    items: [
      { to: '/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/reports', label: 'Reports', icon: FileText },
    ],
  },
  {
    title: 'Setup',
    items: [
      { to: '/master-data', label: 'Master data', icon: Database },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: Props) {
  return (
    <>
      {/* Backdrop — only on mobile when drawer is open */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col border-r border-white/5 bg-[hsl(var(--sidebar-bg))] px-4 py-6 text-[hsl(var(--sidebar-fg))] transition-transform',
          // Off-canvas on mobile, persistent on desktop.
          'lg:sticky lg:top-0 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="mb-4 flex items-center gap-2 px-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 text-base font-bold text-white shadow-md shadow-black/20">
            T
          </div>
          <div className="flex flex-1 flex-col">
            <span className="text-sm font-semibold tracking-tight">TSI Admin</span>
            <span className="text-[11px] text-[hsl(var(--sidebar-muted))]">Venue ERP</span>
          </div>
          {/* Close button — mobile only */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid h-8 w-8 place-items-center rounded-lg text-[hsl(var(--sidebar-muted))] transition-colors hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto pr-1 [scrollbar-width:thin]">
          {sections.map((section, si) => (
            <div key={si} className="mt-2 first:mt-0">
              {section.title ? (
                <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--sidebar-muted))]">
                  {section.title}
                </p>
              ) : null}
              <div className="flex flex-col gap-0.5">
                {section.items.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-white/10 text-white'
                          : 'text-[hsl(var(--sidebar-muted))] hover:bg-white/5 hover:text-white',
                      )
                    }
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3 text-xs">
          <p className="font-semibold text-white">Phase 1 wedge</p>
          <p className="mt-1 text-[hsl(var(--sidebar-muted))]">
            Strangler-fig path to replace GlobalTix.
          </p>
        </div>
      </aside>
    </>
  );
}
