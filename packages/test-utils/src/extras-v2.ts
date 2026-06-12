const now = Date.now();
const pastH = (h: number) => new Date(now - h * 3600_000).toISOString();
const inH = (h: number) => new Date(now + h * 3600_000).toISOString();
const inD = (d: number) => new Date(now + d * 86_400_000).toISOString();

// ─── Validator extras ───
export function makeValidatorReports() {
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now - (13 - i) * 86_400_000);
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      scans: 80 + Math.round(60 * Math.sin(i * 0.5)) + i * 3,
      allow: 76 + Math.round(58 * Math.sin(i * 0.5)) + i * 3,
      deny: i % 7 === 0 ? 3 : 1,
      manual: 1 + (i % 5),
      offline: i === 6 ? 4 : 0,
    };
  });
  return {
    summary: {
      todayScans: 142,
      todayAllow: 138,
      todayDeny: 2,
      todayManual: 2,
      avgLatencyMs: 264,
      offlineRecoveries: 0,
      shiftStart: pastH(6),
      shiftEnd: inH(2),
    },
    daily: days,
    topReasons: [
      { reason: 'Expired pass', count: 4 },
      { reason: 'Damaged QR — manual entry', count: 7 },
      { reason: 'Network blip — offline tier', count: 2 },
    ],
  };
}

export function makeStaffProfile() {
  return {
    id: 'staff-001',
    fullName: 'Rina Wulandari',
    role: 'Senior Gate Officer',
    employeeId: 'EMP-2410',
    gateId: 'gate-bgr-01',
    gateLabel: 'Bogor — Main Entrance',
    shift: 'Morning · 06:00 — 14:00',
    avatarInitials: 'RW',
    phone: '+62 812 5500 1234',
    email: 'rina.wulandari@tamansafari.id',
    joinedAt: '2023-04-12',
    stats: {
      scansThisShift: 142,
      scansThisWeek: 1247,
      avgPerHour: 23,
      flawlessShiftsStreak: 12,
    },
    badges: [
      { id: 'b1', label: 'Zero-fraud streak', tier: 'gold', count: 60 },
      { id: 'b2', label: 'Sub-200ms latency', tier: 'silver' },
      { id: 'b3', label: 'Offline hero', tier: 'bronze' },
    ],
  };
}

export function makeAttendance() {
  return {
    today: {
      date: new Date(now).toISOString(),
      clockedInAt: pastH(6),
      clockedOutAt: null as string | null,
      scheduledStart: pastH(6.2),
      scheduledEnd: inH(2),
      status: 'on-shift' as const,
      breaks: [
        { startedAt: pastH(3), endedAt: pastH(2.5), durationMin: 30 },
      ],
    },
    week: Array.from({ length: 7 }, (_, i) => {
      const day = new Date(now - (6 - i) * 86_400_000);
      const present = i !== 1;
      return {
        date: day.toISOString(),
        weekday: day.toLocaleDateString('en-US', { weekday: 'short' }),
        present,
        clockedInAt: present ? new Date(day.setHours(6, 5)).toISOString() : null,
        clockedOutAt: present ? new Date(day.setHours(14, 8)).toISOString() : null,
        hoursWorked: present ? 8 + (i % 2 ? 0.1 : -0.05) : 0,
        late: i === 4,
      };
    }),
    monthSummary: {
      totalDaysWorked: 21,
      totalDaysScheduled: 22,
      totalHours: 168,
      attendanceRate: 95.5,
      lateCount: 2,
      onTimeRate: 90.5,
    },
  };
}

export function makeRecentVisits() {
  const tiers = ['Adult', 'Child', 'Senior', 'Family'];
  const names = ['Adi Wijaya', 'Bayu Pratama', 'Citra Saputra', 'Dewi Lestari', 'Eka Hartono', 'Farhan Setiawan', 'Gita Permata', 'Hasan Kusuma'];
  return Array.from({ length: 20 }, (_, i) => ({
    id: `v_${String(90000 - i)}`,
    passId: `p_${2000 + (i * 17) % 999}`,
    holderName: names[i % names.length],
    tier: tiers[i % tiers.length],
    scannedAt: pastH(i * 0.3),
    source: (['online', 'online', 'offline'] as const)[i % 3],
    avatar: names[i % names.length]?.split(' ').map((w) => w[0]).join(''),
  }));
}

// ─── Member extras ───
const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

const promoImagery = {
  birthday: img('1558636508-e0db3814bd1d'),
  night: img('1444080748397-f442aa95c3e5'),
  food: img('1567620905732-2d1ec7ab7445'),
  referral: img('1513885535751-8b9238bd345a'),
  photo: img('1502920917128-1aa500764cbd'),
};

export function makePromotions() {
  return [
    {
      id: 'promo-001',
      title: 'Birthday Bash Weekend',
      subtitle: 'Free cake at the Savanna Café',
      description: 'Members celebrating their birthday this month get a complimentary slice of our signature safari cake. Just show your QR at any in-park café and let the staff know.',
      tag: 'Members only',
      accent: 'brand',
      heroEmoji: '🎂',
      image: promoImagery.birthday,
      validUntil: inD(14),
      ctaLabel: 'How to claim',
    },
    {
      id: 'promo-002',
      title: 'Night Safari is back',
      subtitle: 'Fri & Sat · 18:00 — 22:00',
      description: 'Discover the nocturnal side of the park. Special after-hours rates for members. RSVP required — slots are limited each night.',
      tag: 'New',
      accent: 'earth',
      heroEmoji: '🦉',
      image: promoImagery.night,
      validUntil: inD(30),
      ctaLabel: 'RSVP',
    },
    {
      id: 'promo-003',
      title: '20% off all F&B',
      subtitle: 'In-park restaurants this month',
      description: 'Members receive 20% off every meal and snack at participating restaurants. Show your QR at the counter — the discount applies automatically.',
      tag: 'Perk',
      accent: 'rose',
      heroEmoji: '🍽️',
      image: promoImagery.food,
      validUntil: inD(20),
      ctaLabel: 'Find a restaurant',
    },
    {
      id: 'promo-004',
      title: 'Refer a friend',
      subtitle: 'Earn Rp 100.000 voucher',
      description: 'When a friend you refer signs up for an Annual Pass, you both get a Rp 100.000 voucher to spend in-park.',
      tag: 'Referral',
      accent: 'slate',
      heroEmoji: '🎁',
      image: promoImagery.referral,
      validUntil: inD(365),
      ctaLabel: 'Get your code',
    },
    {
      id: 'promo-005',
      title: 'Photo Day · Sunday',
      subtitle: 'Free portrait with park animals',
      description: 'Pro photographers stationed across the park for one-day-only free portraits. Bookings open at the visitor centre from 09:00.',
      tag: 'Event',
      accent: 'brand',
      heroEmoji: '📸',
      image: promoImagery.photo,
      validUntil: inD(7),
      ctaLabel: 'See locations',
    },
  ];
}

const eventImagery: Record<string, string> = {
  'evt-001': img('1546182990-dffeafbe841d'), // lion
  'evt-002': img('1444080748397-f442aa95c3e5'), // night
  'evt-003': img('1583337130417-3346a1be7dee'), // vet
  'evt-004': img('1561731216-c3a4d99437d5'), // tiger
  'evt-005': img('1504280390367-361c6d9f38f4'), // camp
};

export function makeEventDetail(id: string) {
  const base = {
    'evt-001': {
      title: 'Lion Feeding',
      summary: 'Watch our pride enjoy their afternoon feed.',
      tag: 'Daily',
      location: 'Predator Zone',
      datetime: inH(2),
    },
    'evt-002': {
      title: 'Night Safari',
      summary: 'Discover nocturnal wildlife under the stars.',
      tag: 'Weekend',
      location: 'Main Park',
      datetime: inD(3),
    },
    'evt-003': {
      title: 'Conservation Talk',
      summary: 'Meet our head veterinarian.',
      tag: 'Members only',
      location: 'Auditorium A',
      datetime: inD(5),
    },
  } as const;
  const fallback = {
    title: 'Event',
    summary: 'Park event.',
    tag: 'Event',
    location: 'Main Park',
    datetime: inD(1),
  };
  const data = (base as Record<string, typeof fallback>)[id] ?? fallback;
  return {
    id,
    ...data,
    image: eventImagery[id] ?? img('1564349683136-77e08dba1ef7'),
    durationMin: 45,
    capacity: 80,
    booked: 47,
    host: 'TSI Wildlife Team',
    requirements: ['Annual Pass required', 'Comfortable footwear recommended', 'No flash photography'],
    schedule: [
      { time: '15 min before', label: 'Arrival & seating' },
      { time: 'Start', label: 'Introduction & briefing' },
      { time: '15 min in', label: 'Main activity' },
      { time: 'End', label: 'Q&A and dispersal' },
    ],
    similar: ['evt-002', 'evt-003'],
  };
}

// ─── Admin: Maintenance / Finance / Reports / Gate map ───
export function makeMaintenanceTickets() {
  return [
    {
      id: 'mt-001',
      title: 'Validator screen flickering',
      gateId: 'gate-bgr-02',
      gateLabel: 'Bogor — Family Gate',
      severity: 'medium' as const,
      status: 'in-progress' as const,
      assignee: 'Wahyu (Field tech)',
      openedAt: pastH(36),
      due: inD(1),
      category: 'hardware',
    },
    {
      id: 'mt-002',
      title: 'Network slowness — peak hours',
      gateId: 'gate-prg-02',
      gateLabel: 'Prigen — South',
      severity: 'high' as const,
      status: 'open' as const,
      assignee: 'Network ops',
      openedAt: pastH(8),
      due: inH(20),
      category: 'network',
    },
    {
      id: 'mt-003',
      title: 'Camera lens cleaning — weekly',
      gateId: 'gate-bli-01',
      gateLabel: 'Bali — Coastal Gate',
      severity: 'low' as const,
      status: 'scheduled' as const,
      assignee: 'On-site staff',
      openedAt: pastH(72),
      due: inD(3),
      category: 'preventive',
    },
    {
      id: 'mt-004',
      title: 'UPS battery test',
      gateId: 'gate-bgr-01',
      gateLabel: 'Bogor — Main Entrance',
      severity: 'low' as const,
      status: 'resolved' as const,
      assignee: 'Wahyu (Field tech)',
      openedAt: pastH(200),
      due: pastH(150),
      category: 'preventive',
    },
    {
      id: 'mt-005',
      title: 'QR scanner re-calibration',
      gateId: 'gate-prg-01',
      gateLabel: 'Prigen — North',
      severity: 'medium' as const,
      status: 'in-progress' as const,
      assignee: 'Wahyu (Field tech)',
      openedAt: pastH(18),
      due: inH(6),
      category: 'hardware',
    },
    {
      id: 'mt-006',
      title: 'Turnstile motor replacement',
      gateId: 'gate-bgr-02',
      gateLabel: 'Bogor — Family Gate',
      severity: 'high' as const,
      status: 'open' as const,
      assignee: 'Network ops',
      openedAt: pastH(5),
      due: inH(12),
      category: 'hardware',
    },
    {
      id: 'mt-007',
      title: 'CCTV feed dropout — Gate B',
      gateId: 'gate-bgr-02',
      gateLabel: 'Bogor — Family Gate',
      severity: 'medium' as const,
      status: 'open' as const,
      assignee: 'Security tech',
      openedAt: pastH(9),
      due: inH(20),
      category: 'network',
    },
    {
      id: 'mt-008',
      title: 'Thermal printer paper jam',
      gateId: 'gate-prg-02',
      gateLabel: 'Prigen — South',
      severity: 'low' as const,
      status: 'resolved' as const,
      assignee: 'Wahyu (Field tech)',
      openedAt: pastH(60),
      due: pastH(48),
      category: 'hardware',
    },
    {
      id: 'mt-009',
      title: 'Validator firmware update v2.4',
      gateId: 'gate-bli-01',
      gateLabel: 'Bali — Coastal',
      severity: 'medium' as const,
      status: 'in-progress' as const,
      assignee: 'Network ops',
      openedAt: pastH(26),
      due: inH(30),
      category: 'software',
    },
    {
      id: 'mt-010',
      title: 'Backup generator monthly test',
      gateId: 'gate-prg-01',
      gateLabel: 'Prigen — North',
      severity: 'low' as const,
      status: 'open' as const,
      assignee: 'Facilities',
      openedAt: pastH(2),
      due: inH(72),
      category: 'preventive',
    },
    {
      id: 'mt-011',
      title: 'Network switch overheating',
      gateId: 'gate-bgr-01',
      gateLabel: 'Bogor — Main Entrance',
      severity: 'high' as const,
      status: 'in-progress' as const,
      assignee: 'Network ops',
      openedAt: pastH(14),
      due: inH(4),
      category: 'network',
    },
  ];
}

export function makeMaintenanceDetail(id: string) {
  const ticket = makeMaintenanceTickets().find((t) => t.id === id) ?? makeMaintenanceTickets()[0]!;
  return {
    ...ticket,
    description:
      'Observed during morning shift. Issue is intermittent and may be related to the latest firmware update. Field tech dispatched and verified with diagnostics on-site.',
    timeline: [
      { id: 'e1', label: 'Ticket opened', timestamp: ticket.openedAt, actor: 'system' },
      { id: 'e2', label: 'Assigned to tech', timestamp: pastH(35), actor: 'admin@tamansafari.id' },
      { id: 'e3', label: 'On-site diagnostic complete', timestamp: pastH(20), actor: 'wahyu@tamansafari.id' },
      { id: 'e4', label: 'Parts ordered', timestamp: pastH(18), actor: 'wahyu@tamansafari.id' },
    ],
    parts: [
      { sku: 'SCR-VAL-001', name: 'Validator screen assembly', qty: 1, status: 'ordered' },
      { sku: 'CBL-USB-C', name: 'USB-C cable 1m', qty: 2, status: 'in-stock' },
    ],
  };
}

export function makeFinanceSummary() {
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now - (29 - i) * 86_400_000);
    const revenue = 18_000_000 + Math.round(8_000_000 * Math.sin(i * 0.4 + 1)) + i * 200_000;
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue,
      refunds: i % 6 === 0 ? 800_000 : 200_000,
      payouts: revenue - 1_500_000,
    };
  });
  return {
    todayRevenue: 22_400_000,
    todayRevenueTrendPct: 6.4,
    monthRevenue: 612_300_000,
    monthRevenueTrendPct: 11.8,
    pendingPayouts: 18_750_000,
    refundsToday: 600_000,
    refundsTrendPct: -22.5,
    daily: days,
    byChannel: [
      { channel: 'Annual Pass renewal', amount: 312_500_000 },
      { channel: 'New enrolment', amount: 184_200_000 },
      { channel: 'F&B (perk reconciliation)', amount: 78_400_000 },
      { channel: 'Companion tickets', amount: 37_200_000 },
    ],
  };
}

export function makeFinanceTransactions() {
  const channels = ['Pass renewal', 'New enrolment', 'Companion ticket', 'Refund'] as const;
  const methods = ['QRIS', 'Credit card', 'Cash', 'GoPay'] as const;
  return Array.from({ length: 24 }, (_, i) => ({
    id: `tx_${String(70000 - i)}`,
    timestamp: pastH(i * 1.5),
    member: `Member ${i + 1}`,
    channel: channels[i % channels.length],
    method: methods[i % methods.length],
    amountIdr: (channels[i % channels.length] === 'Refund' ? -1 : 1) * (i % 4 === 3 ? 50_000 : i % 3 === 0 ? 850_000 : 600_000),
    status: i % 11 === 0 ? 'pending' : 'settled',
  }));
}

export function makeOperationalReports() {
  return [
    {
      id: 'rpt-daily',
      title: 'Daily operational summary',
      cadence: 'Daily · 23:00 WIB',
      lastRun: pastH(13),
      nextRun: inH(11),
      recipients: ['ops@tamansafari.id'],
      status: 'healthy' as const,
    },
    {
      id: 'rpt-weekly',
      title: 'Weekly KPI report',
      cadence: 'Mondays · 08:00 WIB',
      lastRun: pastH(40),
      nextRun: inD(5),
      recipients: ['leadership@tamansafari.id', 'ops@tamansafari.id'],
      status: 'healthy' as const,
    },
    {
      id: 'rpt-monthly',
      title: 'Monthly finance close',
      cadence: 'First Mon of month · 09:00 WIB',
      lastRun: pastH(96),
      nextRun: inD(22),
      recipients: ['finance@tamansafari.id'],
      status: 'healthy' as const,
    },
    {
      id: 'rpt-reconciliation',
      title: 'GlobalTix reconciliation export',
      cadence: 'Every 6 hours',
      lastRun: pastH(5),
      nextRun: inH(1),
      recipients: ['integrations@tamansafari.id'],
      status: 'at-risk' as const,
    },
    {
      id: 'rpt-incidents',
      title: 'Incident & maintenance digest',
      cadence: 'Weekdays · 18:00 WIB',
      lastRun: pastH(20),
      nextRun: inH(4),
      recipients: ['ops@tamansafari.id', 'leadership@tamansafari.id'],
      status: 'healthy' as const,
    },
    {
      id: 'rpt-membership',
      title: 'Membership growth & churn',
      cadence: 'Weekly · Monday 08:00 WIB',
      lastRun: pastH(40),
      nextRun: inH(128),
      recipients: ['marketing@tamansafari.id', 'leadership@tamansafari.id'],
      status: 'healthy' as const,
    },
    {
      id: 'rpt-revenue',
      title: 'Revenue & reconciliation summary',
      cadence: 'Daily · 23:30 WIB',
      lastRun: pastH(8),
      nextRun: inH(16),
      recipients: ['finance@tamansafari.id'],
      status: 'at-risk' as const,
    },
    {
      id: 'rpt-attendance',
      title: 'Staff attendance & shift coverage',
      cadence: 'Weekly · Friday 17:00 WIB',
      lastRun: pastH(72),
      nextRun: inH(96),
      recipients: ['hr@tamansafari.id'],
      status: 'healthy' as const,
    },
  ];
}

export function makeGateMapPositions() {
  // Normalised positions (0..100) for a stylised park map.
  return [
    { id: 'gate-bgr-01', label: 'Bogor — Main', x: 22, y: 30, status: 'online' as const, scansToday: 142, location: 'Bogor' },
    { id: 'gate-bgr-02', label: 'Bogor — Family', x: 34, y: 56, status: 'online' as const, scansToday: 218, location: 'Bogor' },
    { id: 'gate-prg-01', label: 'Prigen — North', x: 58, y: 22, status: 'online' as const, scansToday: 87, location: 'Prigen' },
    { id: 'gate-prg-02', label: 'Prigen — South', x: 64, y: 68, status: 'degraded' as const, scansToday: 64, location: 'Prigen' },
    { id: 'gate-bli-01', label: 'Bali — Coastal', x: 82, y: 80, status: 'offline' as const, scansToday: 12, location: 'Bali' },
    { id: 'gate-bgr-03', label: 'Bogor — VIP', x: 16, y: 64, status: 'online' as const, scansToday: 38, location: 'Bogor' },
    { id: 'gate-prg-03', label: 'Prigen — East', x: 72, y: 44, status: 'online' as const, scansToday: 53, location: 'Prigen' },
    { id: 'gate-bli-02', label: 'Bali — Marine', x: 90, y: 58, status: 'degraded' as const, scansToday: 29, location: 'Bali' },
  ];
}
