import { motion } from 'framer-motion';
import { createContext, useContext, useId, useState, type ReactNode } from 'react';
import { cn } from '../lib/utils';

interface TabsContextValue {
  value: string;
  setValue: (v: string) => void;
  layoutId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('useTabs must be inside <Tabs>');
  return ctx;
}

interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (v: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
  const [internal, setInternal] = useState(defaultValue);
  const layoutId = useId();
  const current = value ?? internal;
  const set = (v: string) => {
    if (value === undefined) setInternal(v);
    onValueChange?.(v);
  };
  return (
    <TabsContext.Provider value={{ value: current, setValue: set, layoutId }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 rounded-xl border border-border bg-white/80 p-1 backdrop-blur',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  count?: number;
}

export function TabsTrigger({ value, children, className, icon, count }: TabsTriggerProps) {
  const { value: current, setValue, layoutId } = useTabs();
  const active = current === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => setValue(value)}
      className={cn(
        'relative inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
        active ? 'text-brand-900' : 'text-muted-foreground hover:text-foreground',
        className,
      )}
    >
      {active ? (
        <motion.span
          layoutId={layoutId}
          className="absolute inset-0 rounded-lg bg-white shadow-sm shadow-brand-900/10 ring-1 ring-border"
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        />
      ) : null}
      <span className="relative flex items-center gap-2">
        {icon}
        {children}
        {count !== undefined ? (
          <span
            className={cn(
              'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
              active ? 'bg-brand-100 text-brand-800' : 'bg-muted text-muted-foreground',
            )}
          >
            {count}
          </span>
        ) : null}
      </span>
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { value: current } = useTabs();
  if (current !== value) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn('mt-4', className)}
    >
      {children}
    </motion.div>
  );
}
