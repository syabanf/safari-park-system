import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ExternalLink, Grid3x3, ScanLine, ShieldCheck, Smartphone } from 'lucide-react';
import { cn } from '../lib/utils';

export type AppId = 'member' | 'validator' | 'admin';

interface AppEntry {
  id: AppId;
  label: string;
  description: string;
  port: number;
  icon: React.ReactNode;
  accent: string;
}

const APPS: AppEntry[] = [
  {
    id: 'member',
    label: 'Member PWA',
    description: 'Annual Pass · QR · perks',
    port: 5173,
    icon: <Smartphone className="h-4 w-4" />,
    accent: 'from-brand-500 to-brand-800',
  },
  {
    id: 'validator',
    label: 'Gate Validator',
    description: 'Scan · offline queue · reports',
    port: 5174,
    icon: <ScanLine className="h-4 w-4" />,
    accent: 'from-earth-500 to-earth-800',
  },
  {
    id: 'admin',
    label: 'Admin Console',
    description: 'ERP · CMS · master data',
    port: 5175,
    icon: <ShieldCheck className="h-4 w-4" />,
    accent: 'from-slate-700 to-slate-900',
  },
];

// Env-var override per app, set in each Vercel project:
//   VITE_MEMBER_URL=https://safari-park-member.vercel.app
//   VITE_VALIDATOR_URL=https://safari-park-validator.vercel.app
//   VITE_ADMIN_URL=https://safari-park-admin.vercel.app
// Falls back to `<protocol>//<hostname>:<port>` so localhost dev keeps working.
const ENV_OVERRIDES: Record<AppId, string | undefined> = {
  member: (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_MEMBER_URL,
  validator: (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_VALIDATOR_URL,
  admin: (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_ADMIN_URL,
};

function urlFor(app: AppEntry): string {
  const override = ENV_OVERRIDES[app.id];
  if (override) return override;
  if (typeof window === 'undefined') return `http://localhost:${app.port}`;
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:${app.port}`;
}

interface Props {
  current: AppId;
  variant?: 'icon' | 'inline';
  className?: string;
}

export function AppSwitcher({ current, variant = 'icon', className }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onEsc);
    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  if (variant === 'inline') {
    return (
      <div className={cn('grid grid-cols-1 gap-2 sm:grid-cols-3', className)}>
        {APPS.map((app) => {
          const isCurrent = app.id === current;
          return (
            <a
              key={app.id}
              href={urlFor(app)}
              target={isCurrent ? '_self' : '_blank'}
              rel="noopener noreferrer"
              aria-current={isCurrent}
              className={cn(
                'group flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-shadow',
                isCurrent
                  ? 'border-transparent bg-white/70 shadow-sm ring-1 ring-brand-200'
                  : 'border-border/60 bg-white/60 hover:shadow-md',
              )}
            >
              <div
                className={cn(
                  'grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-white shadow',
                  app.accent,
                )}
              >
                {app.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 truncate text-sm font-semibold">
                  {app.label}
                  {!isCurrent ? <ExternalLink className="h-3 w-3 text-muted-foreground" /> : null}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">{app.description}</p>
              </div>
              {isCurrent ? (
                <span className="rounded-full bg-brand-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-brand-800">
                  here
                </span>
              ) : null}
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        aria-label="Switch app"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-border/60 bg-white/80 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <Grid3x3 className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Apps</span>
        <ChevronDown
          className={cn('h-3 w-3 transition-transform', open ? 'rotate-180' : '')}
        />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-72 overflow-hidden rounded-xl border border-border/60 bg-white/95 p-2 shadow-xl backdrop-blur"
        >
          <p className="px-2 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Taman Safari · workspace
          </p>
          <ul className="space-y-1">
            {APPS.map((app) => {
              const isCurrent = app.id === current;
              return (
                <li key={app.id}>
                  <a
                    href={urlFor(app)}
                    target={isCurrent ? '_self' : '_blank'}
                    rel="noopener noreferrer"
                    aria-current={isCurrent}
                    className={cn(
                      'group flex items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors',
                      isCurrent ? 'bg-brand-50' : 'hover:bg-muted/60',
                    )}
                  >
                    <div
                      className={cn(
                        'grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-white shadow',
                        app.accent,
                      )}
                    >
                      {app.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1 truncate text-sm font-medium leading-tight">
                        {app.label}
                        {!isCurrent ? <ExternalLink className="h-3 w-3 text-muted-foreground" /> : null}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">{app.description}</p>
                    </div>
                    {isCurrent ? (
                      <span className="rounded-full bg-brand-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-brand-800">
                        here
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] text-muted-foreground">:{app.port}</span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
          <p className="border-t px-2 pb-0.5 pt-2 text-[10px] text-muted-foreground">
            Each app opens in its own tab — they share MSW mocks.
          </p>
        </div>
      ) : null}
    </div>
  );
}
