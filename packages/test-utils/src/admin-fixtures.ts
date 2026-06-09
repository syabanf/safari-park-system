const ID_FIRST = ['Adi', 'Bayu', 'Citra', 'Dewi', 'Eka', 'Farhan', 'Gita', 'Hasan', 'Indah', 'Joko', 'Kirana', 'Lestari', 'Made', 'Nia', 'Oki', 'Putri', 'Rama', 'Sari', 'Teguh', 'Wulan'];
const ID_LAST = ['Wijaya', 'Pratama', 'Saputra', 'Lestari', 'Hartono', 'Setiawan', 'Kusuma', 'Permata', 'Mahendra', 'Nuraini'];
const TIERS = ['adult', 'child', 'senior', 'family'] as const;
const STATUSES = ['active', 'active', 'active', 'active', 'pending', 'expired'] as const;
const GATES = ['gate-bgr-01', 'gate-bgr-02', 'gate-prg-01', 'gate-prg-02', 'gate-bli-01'];
const GATE_LOCATIONS: Record<string, string> = {
  'gate-bgr-01': 'Bogor — Main Entrance',
  'gate-bgr-02': 'Bogor — Family Gate',
  'gate-prg-01': 'Prigen — North',
  'gate-prg-02': 'Prigen — South',
  'gate-bli-01': 'Bali — Coastal Gate',
};

function pick<T>(arr: readonly T[], seed: number): T {
  return arr[seed % arr.length] as T;
}

function makeName(seed: number): string {
  return `${pick(ID_FIRST, seed)} ${pick(ID_LAST, Math.floor(seed / 3))}`;
}

export function makeAdminMembers(count = 42) {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const tier = pick(TIERS, i);
    const status = pick(STATUSES, i + 1);
    const valid = new Date(now + (180 + (i % 200)) * 86_400_000);
    return {
      id: `m_${String(1000 + i)}`,
      fullName: makeName(i),
      email: `${pick(ID_FIRST, i).toLowerCase()}.${pick(ID_LAST, Math.floor(i / 3)).toLowerCase()}@mail.id`,
      tier,
      status,
      validUntil: valid.toISOString(),
      entries: 3 + (i * 7) % 47,
    };
  });
}

export function makeOverview() {
  const today = new Date();
  const entriesLast7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i));
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      entries: 280 + Math.round(120 * Math.sin(i * 0.9)) + i * 18,
      activations: 18 + Math.round(8 * Math.sin(i * 1.3 + 1)),
    };
  });

  return {
    activeMembers: 1247,
    activeMembersTrendPct: 8.4,
    todaysEntries: 412,
    todaysEntriesTrendPct: -2.1,
    weekRevenueIdr: 187_500_000,
    weekRevenueTrendPct: 12.3,
    offlinePending: 4,
    entriesLast7Days,
    gateDistribution: GATES.map((g) => ({
      gate: g.replace('gate-', '').toUpperCase(),
      entries: 80 + Math.round(120 * Math.random()),
    })),
    tierDistribution: TIERS.map((tier, i) => ({
      tier: tier.charAt(0).toUpperCase() + tier.slice(1),
      count: [612, 308, 184, 143][i] ?? 100,
    })),
  };
}

export function makePassesBreakdown() {
  return {
    byTier: TIERS.map((tier, i) => ({
      tier: tier.charAt(0).toUpperCase() + tier.slice(1),
      count: [612, 308, 184, 143][i] ?? 100,
    })),
    byStatus: [
      { status: 'active', count: 1098 },
      { status: 'expired', count: 84 },
      { status: 'suspended', count: 12 },
      { status: 'pending', count: 53 },
    ],
  };
}

export function makeAdminRedemptions(count = 30) {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const verdict = (['allow', 'allow', 'allow', 'allow', 'manual', 'deny'] as const)[i % 6] as 'allow' | 'deny' | 'manual';
    const source = (['online', 'online', 'online', 'offline'] as const)[i % 4] as 'online' | 'offline' | 'manual';
    return {
      id: `r_${String(50000 - i)}`,
      passHolder: makeName(i),
      passId: `p_${String(2000 + (i * 13) % 999)}`,
      gateId: pick(GATES, i),
      scannedAt: new Date(now - i * 90_000).toISOString(),
      verdict,
      source,
    };
  });
}

export function makeAdminAnalytics() {
  const days = 30;
  const today = new Date();
  return {
    daily: Array.from({ length: days }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (days - 1 - i));
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        entries: 220 + Math.round(160 * Math.sin(i * 0.4)) + i * 4,
        activations: 14 + Math.round(10 * Math.sin(i * 0.6 + 1)),
        renewals: 6 + Math.round(5 * Math.cos(i * 0.5)),
      };
    }),
  };
}

export function makeAdminGates() {
  const now = Date.now();
  return GATES.map((id, i) => ({
    id,
    location: GATE_LOCATIONS[id]!,
    status: (['online', 'online', 'online', 'degraded', 'offline'] as const)[i] as 'online' | 'offline' | 'degraded',
    lastScanAt: new Date(now - i * 120_000).toISOString(),
    pendingRedemptions: [0, 0, 2, 7, 11][i] ?? 0,
    scansToday: [142, 218, 87, 64, 12][i] ?? 50,
  }));
}

export function makeGapRegister() {
  return [
    {
      id: 'gap-001',
      gap: 'No native multi-visit / re-entry model',
      impact: 'Forced manual handling for resort 2-visit guests',
      phase2: 'WIT entitlement ledger handles cleanly',
      status: 'documented' as const,
    },
    {
      id: 'gap-002',
      gap: 'No dynamic / rotating QR',
      impact: 'Static QR is shareable; anti-share gap',
      phase2: 'WIT owns anti-share validation',
      status: 'mitigated' as const,
    },
    {
      id: 'gap-003',
      gap: 'Limited webhook coverage for status changes',
      impact: 'Reconciliation lag between WIT and GlobalTix',
      phase2: 'Native event bus in WIT ticketing core',
      status: 'open' as const,
    },
    {
      id: 'gap-004',
      gap: 'No tier-level pricing rules API',
      impact: 'Pricing config drift between systems',
      phase2: 'Single source of truth in WIT settings',
      status: 'open' as const,
    },
    {
      id: 'gap-005',
      gap: 'No bulk member export',
      impact: 'CSV pulls require backend support tickets',
      phase2: 'Self-serve in admin dashboard',
      status: 'documented' as const,
    },
  ];
}
