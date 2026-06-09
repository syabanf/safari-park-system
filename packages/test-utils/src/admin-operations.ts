const now = Date.now();
const inHours = (h: number) => new Date(now + h * 3600_000).toISOString();
const pastHours = (h: number) => new Date(now - h * 3600_000).toISOString();

export function makeSlaMetrics() {
  return {
    metrics: [
      {
        id: 'gate-success-rate',
        label: 'Gate validation success rate',
        category: 'gate',
        unit: '%',
        target: 99.5,
        value: 99.72,
        status: 'on-target',
        trendPct: 0.18,
        description: 'Successful scans / total scans (24h rolling)',
      },
      {
        id: 'gate-latency-p95',
        label: 'Validation latency (online)',
        category: 'gate',
        unit: 'ms',
        target: 500,
        value: 287,
        status: 'on-target',
        trendPct: -8.4,
        description: 'p95 over the last 24h',
      },
      {
        id: 'offline-reliability',
        label: 'Offline validation reliability',
        category: 'gate',
        unit: '%',
        target: 100,
        value: 100,
        status: 'on-target',
        trendPct: 0,
        description: 'Zero lost/duplicate entries on reconnect',
      },
      {
        id: 'fraud-incidents',
        label: 'Dynamic-QR fraud incidents',
        category: 'security',
        unit: 'count',
        target: 0,
        value: 0,
        status: 'on-target',
        trendPct: 0,
        description: 'Confirmed shared/replayed entries — 7 day window',
      },
      {
        id: 'activation-rate',
        label: 'Member activation rate',
        category: 'membership',
        unit: '%',
        target: 80,
        value: 76.4,
        status: 'at-risk',
        trendPct: 3.2,
        description: 'Issued passes activated within 14 days',
      },
      {
        id: 'reconciliation-accuracy',
        label: 'GlobalTix reconciliation accuracy',
        category: 'integration',
        unit: '%',
        target: 100,
        value: 99.91,
        status: 'at-risk',
        trendPct: -0.04,
        description: 'WIT redemption ledger match vs GlobalTix',
      },
      {
        id: 'multi-visit-handling',
        label: 'Multi-visit handling — automated',
        category: 'membership',
        unit: '%',
        target: 100,
        value: 100,
        status: 'on-target',
        trendPct: 0,
        description: 'Zero manual interventions for re-entry',
      },
      {
        id: 'support-tickets',
        label: 'Support tickets / entry incidents',
        category: 'support',
        unit: 'count',
        target: 5,
        value: 3,
        status: 'on-target',
        trendPct: -25,
        description: 'Per 1,000 entries — daily',
      },
    ],
    latencyTrend: Array.from({ length: 24 }, (_, i) => ({
      hour: `${String(i).padStart(2, '0')}:00`,
      p50: 90 + Math.round(40 * Math.sin(i * 0.3)),
      p95: 220 + Math.round(120 * Math.sin(i * 0.4 + 1)),
      p99: 380 + Math.round(150 * Math.sin(i * 0.5 + 2)),
    })),
  };
}

export function makeReconciliation() {
  const sources = ['globaltix', 'wit'] as const;
  return {
    summary: {
      totalToday: 412,
      matched: 410,
      mismatched: 1,
      pending: 1,
      accuracyPct: 99.51,
    },
    mismatches: [
      {
        id: 'mm-001',
        passId: 'p_2034',
        holderName: 'Adi Wijaya',
        gateId: 'gate-bgr-01',
        witTimestamp: pastHours(2),
        globaltixTimestamp: null,
        delta: 'GlobalTix entry missing',
        severity: 'high' as const,
        status: 'open' as const,
      },
      {
        id: 'mm-002',
        passId: 'p_2108',
        holderName: 'Bayu Pratama',
        gateId: 'gate-prg-01',
        witTimestamp: pastHours(5),
        globaltixTimestamp: pastHours(5.05),
        delta: 'Tier mismatch (Adult vs Child)',
        severity: 'medium' as const,
        status: 'investigating' as const,
      },
      {
        id: 'mm-003',
        passId: 'p_2240',
        holderName: 'Citra Saputra',
        gateId: 'gate-bli-01',
        witTimestamp: pastHours(9),
        globaltixTimestamp: pastHours(9.1),
        delta: 'Duplicate entry — manual override at gate',
        severity: 'low' as const,
        status: 'resolved' as const,
      },
    ],
    sources,
  };
}

export function makeAuditLog(count = 24) {
  const levels = ['info', 'warn', 'error', 'info', 'info', 'warn'] as const;
  const actors = ['system', 'staff:gate-bgr-01', 'admin:syaban@wit.id', 'system', 'staff:gate-prg-02'];
  const verbs = [
    'redemption.confirmed',
    'token.refilled',
    'gate.disconnected',
    'gate.reconnected',
    'pass.renewed',
    'reconciliation.flagged',
    'admin.login',
    'member.enrolled',
    'pass.suspended',
    'pass.reactivated',
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: `log-${String(20000 - i)}`,
    timestamp: pastHours(i * 0.5),
    level: levels[i % levels.length] as 'info' | 'warn' | 'error',
    actor: actors[i % actors.length] as string,
    event: verbs[i % verbs.length] as string,
    target: i % 3 === 0 ? `pass:p_${2000 + i}` : i % 3 === 1 ? `gate:gate-bgr-0${(i % 2) + 1}` : `member:m_${1000 + i}`,
    summary: 'Operational event captured by audit collector.',
  }));
}

export function makeMemberDetail(id: string) {
  const seed = parseInt(id.replace(/\D/g, ''), 10) || 0;
  return {
    id,
    fullName: `${['Adi', 'Bayu', 'Citra', 'Dewi'][seed % 4]} ${['Wijaya', 'Pratama', 'Saputra', 'Lestari'][Math.floor(seed / 4) % 4]}`,
    email: `member-${id}@mail.id`,
    phone: `+62 812 ${String(1000 + seed).padStart(4, '0')} ${String(seed * 7 % 9999).padStart(4, '0')}`,
    nationality: 'ID',
    dateOfBirth: '1992-04-12',
    joinedAt: new Date(now - 380 * 86_400_000).toISOString(),
    pass: {
      id: `p_${2000 + seed}`,
      tier: (['adult', 'child', 'senior', 'family'] as const)[seed % 4],
      status: 'active' as const,
      validFrom: '2026-01-01',
      validUntil: '2027-01-01',
      visitsAllowed: null,
      visitsUsed: 5 + (seed % 30),
      renewals: 2,
    },
    recentRedemptions: Array.from({ length: 8 }, (_, i) => ({
      id: `r_${String(40000 - i)}`,
      gateId: `gate-bgr-0${(i % 2) + 1}`,
      scannedAt: pastHours(i * 12),
      verdict: (['allow', 'allow', 'allow', 'allow', 'manual', 'allow'] as const)[i % 6] as 'allow' | 'deny' | 'manual',
      source: (['online', 'online', 'offline', 'online'] as const)[i % 4] as 'online' | 'offline' | 'manual',
    })),
    timeline: [
      { id: 't-1', label: 'Pass renewed', timestamp: pastHours(72), category: 'renewal' as const },
      { id: 't-2', label: 'Entered Bogor — Main Entrance', timestamp: pastHours(96), category: 'entry' as const },
      { id: 't-3', label: 'Redeemed 20% F&B perk', timestamp: pastHours(96.5), category: 'perk' as const },
      { id: 't-4', label: 'Buffer refill (10 tokens)', timestamp: pastHours(120), category: 'system' as const },
      { id: 't-5', label: 'Profile updated — phone number', timestamp: pastHours(168), category: 'profile' as const },
    ],
  };
}

export function makeGateDetail(id: string) {
  return {
    id,
    location: 'Bogor — Main Entrance',
    status: 'online' as const,
    hardware: 'Zebra ET51 · firmware 2.4.1',
    pendingRedemptions: 0,
    publicKeyCacheAgeMinutes: 7,
    uptimePct: 99.8,
    avgLatencyMs: 264,
    todaysScans: 412,
    scansLast24h: Array.from({ length: 24 }, (_, i) => ({
      hour: `${String(i).padStart(2, '0')}:00`,
      online: 14 + Math.round(8 * Math.sin(i * 0.4)),
      offline: i === 7 || i === 8 ? 2 : 0,
      manual: i % 12 === 0 ? 1 : 0,
    })),
    recentScans: Array.from({ length: 10 }, (_, i) => ({
      id: `s_${String(80000 - i)}`,
      passHolder: `Member ${i + 1}`,
      passId: `p_${2000 + i}`,
      verdict: (['allow', 'allow', 'allow', 'manual', 'allow', 'deny'] as const)[i % 6],
      source: (['online', 'online', 'offline'] as const)[i % 3] as 'online' | 'offline' | 'manual',
      scannedAt: inHours(-i * 0.5),
    })),
    incidents: [
      {
        id: 'inc-1',
        title: 'Brief network drop',
        timestamp: pastHours(8),
        durationMin: 4,
        severity: 'low' as const,
      },
    ],
  };
}

export function makePassDetail(id: string) {
  return {
    id,
    memberId: 'm_1023',
    holderName: 'Demo Member',
    tier: 'adult' as const,
    status: 'active' as const,
    validFrom: '2026-01-01',
    validUntil: '2027-01-01',
    issuedAt: '2026-01-01T08:00:00Z',
    renewals: [
      { id: 'rn-1', date: '2026-01-01', amountIdr: 850_000, channel: 'web' },
      { id: 'rn-2', date: '2025-01-01', amountIdr: 800_000, channel: 'on-site' },
    ],
    redemptions: Array.from({ length: 12 }, (_, i) => ({
      id: `r_${String(60000 - i)}`,
      gateId: `gate-bgr-0${(i % 2) + 1}`,
      scannedAt: pastHours(i * 18),
      verdict: 'allow' as const,
      source: (['online', 'online', 'offline'] as const)[i % 3] as 'online' | 'offline',
    })),
  };
}
