const now = Date.now();
const inD = (d: number) => new Date(now + d * 86_400_000).toISOString();
const pastD = (d: number) => new Date(now - d * 86_400_000).toISOString();
const pastH = (h: number) => new Date(now - h * 3600_000).toISOString();

// ─── Staff / HR ───
export function makeStaffDirectory() {
  const roles = ['Gate Officer', 'Senior Gate Officer', 'Supervisor', 'Field Tech', 'Vet', 'Curator', 'Ticketing'] as const;
  const gates = ['gate-bgr-01', 'gate-bgr-02', 'gate-prg-01', 'gate-prg-02', 'gate-bli-01', '—'] as const;
  const shifts = ['Morning · 06:00 — 14:00', 'Afternoon · 14:00 — 22:00', 'Office hours · 08:00 — 17:00'] as const;
  const firstNames = ['Rina', 'Adi', 'Bayu', 'Citra', 'Dewi', 'Farhan', 'Gita', 'Hasan', 'Indah', 'Joko', 'Lestari', 'Made', 'Nia', 'Oki', 'Putri', 'Rama', 'Sari', 'Teguh', 'Wahyu', 'Wulan'];
  const lastNames = ['Wijaya', 'Pratama', 'Saputra', 'Lestari', 'Hartono', 'Setiawan', 'Kusuma', 'Permata', 'Mahendra', 'Nuraini'];
  return Array.from({ length: 28 }, (_, i) => {
    const first = firstNames[i % firstNames.length] as string;
    const last = lastNames[Math.floor(i / firstNames.length) % lastNames.length] as string;
    return {
      id: `staff-${String(2400 + i).padStart(4, '0')}`,
      fullName: `${first} ${last}`,
      role: roles[i % roles.length] as string,
      department: i % 3 === 0 ? 'Operations' : i % 3 === 1 ? 'Animal Care' : 'Commercial',
      gateId: gates[i % gates.length] as string,
      shift: shifts[i % shifts.length] as string,
      employeeId: `EMP-${2400 + i}`,
      attendance30d: 92 + (i % 8),
      status: i % 11 === 0 ? 'on-leave' : i % 13 === 0 ? 'sick' : 'active',
      joinedAt: pastD(180 + (i * 31) % 800),
    };
  });
}

export function makeStaffRosterSummary() {
  return {
    headcount: 28,
    onShiftNow: 18,
    onLeaveThisWeek: 2,
    openPositions: 3,
    avgAttendance30d: 95.6,
    byDepartment: [
      { department: 'Operations', count: 14 },
      { department: 'Animal Care', count: 8 },
      { department: 'Commercial', count: 6 },
    ],
    coverageByGate: [
      { gate: 'Bogor — Main', morning: 3, afternoon: 3, gap: 0 },
      { gate: 'Bogor — Family', morning: 2, afternoon: 2, gap: 0 },
      { gate: 'Prigen — North', morning: 2, afternoon: 1, gap: 1 },
      { gate: 'Prigen — South', morning: 2, afternoon: 2, gap: 0 },
      { gate: 'Bali — Coastal', morning: 1, afternoon: 1, gap: 0 },
    ],
  };
}

// ─── Bookings ───
export function makeBookings() {
  const types = ['Group tour', 'Private safari', 'Birthday', 'Corporate', 'School visit'] as const;
  const statuses = ['confirmed', 'pending', 'confirmed', 'confirmed', 'cancelled'] as const;
  return Array.from({ length: 20 }, (_, i) => ({
    id: `bk-${String(40000 + i)}`,
    customer: ['PT. Astra International', 'SD Negeri 1 Bogor', 'Wedding Co.', 'Garuda Wisata', 'Family Sutomo'][i % 5] as string,
    type: types[i % types.length] as string,
    paxCount: 4 + (i * 7) % 80,
    date: inD(-5 + (i % 21)),
    timeSlot: ['09:00', '11:00', '14:00', '16:00'][i % 4] as string,
    location: ['Predator Zone', 'Auditorium A', 'Family Lounge', 'Camp Ground'][i % 4] as string,
    status: statuses[i % statuses.length] as string,
    revenueIdr: (4 + (i * 7) % 80) * 250_000,
  }));
}

export function makeBookingsCapacity() {
  return Array.from({ length: 14 }, (_, i) => {
    const day = new Date(now + i * 86_400_000);
    return {
      date: day.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
      booked: 80 + Math.round(60 * Math.sin(i * 0.5)) + i * 5,
      capacity: 240,
    };
  });
}

// ─── Animals ───
export function makeAnimals() {
  const list = [
    { id: 'an-001', name: 'Bima', species: 'Sumatran Tiger', sex: 'M', enclosure: 'Tiger Pavilion', age: 8, status: 'healthy', conservation: 'Critically Endangered' },
    { id: 'an-002', name: 'Sari', species: 'Sumatran Tiger', sex: 'F', enclosure: 'Tiger Pavilion', age: 6, status: 'healthy', conservation: 'Critically Endangered' },
    { id: 'an-003', name: 'Raja', species: 'Asiatic Lion', sex: 'M', enclosure: 'Predator Zone', age: 11, status: 'monitoring', conservation: 'Endangered' },
    { id: 'an-004', name: 'Mira', species: 'Asiatic Lion', sex: 'F', enclosure: 'Predator Zone', age: 9, status: 'healthy', conservation: 'Endangered' },
    { id: 'an-005', name: 'Citra', species: 'Komodo Dragon', sex: 'F', enclosure: 'Reptile Hall', age: 18, status: 'healthy', conservation: 'Endangered' },
    { id: 'an-006', name: 'Anaka', species: 'Orangutan', sex: 'F', enclosure: 'Primate House', age: 14, status: 'healthy', conservation: 'Critically Endangered' },
    { id: 'an-007', name: 'Pongo', species: 'Orangutan', sex: 'M', enclosure: 'Primate House', age: 22, status: 'monitoring', conservation: 'Critically Endangered' },
    { id: 'an-008', name: 'Dewi', species: 'Javan Leopard', sex: 'F', enclosure: 'Highland Trail', age: 5, status: 'healthy', conservation: 'Critically Endangered' },
    { id: 'an-009', name: 'Kara', species: 'African Elephant', sex: 'F', enclosure: 'Savanna', age: 24, status: 'healthy', conservation: 'Endangered' },
    { id: 'an-010', name: 'Tomo', species: 'African Elephant', sex: 'M', enclosure: 'Savanna', age: 28, status: 'monitoring', conservation: 'Endangered' },
    { id: 'an-011', name: 'Bibi', species: 'White Rhinoceros', sex: 'F', enclosure: 'Savanna', age: 19, status: 'healthy', conservation: 'Near Threatened' },
    { id: 'an-012', name: 'Wira', species: 'Sun Bear', sex: 'M', enclosure: 'Forest Loop', age: 7, status: 'healthy', conservation: 'Vulnerable' },
  ] as const;
  return list;
}

export function makeAnimalDetail(id: string) {
  const animal = makeAnimals().find((a) => a.id === id) ?? makeAnimals()[0]!;
  return {
    ...animal,
    keeper: ['Wahyu', 'Indah', 'Made'][Math.abs(id.length) % 3],
    diet: 'Mixed protein, vegetables, supplements · ~12 kg/day',
    lastWeightKg: 180 + (Math.abs(id.length) % 60),
    lastCheckup: pastD(Math.abs(id.length) % 14),
    vetLogs: [
      { id: 'v-1', date: pastD(5), title: 'Routine checkup — vitals normal', vet: 'Dr. Hadi', notes: 'No concerns. Weight stable.' },
      { id: 'v-2', date: pastD(28), title: 'Vaccination booster', vet: 'Dr. Hadi', notes: 'Administered annual booster. Brief mild reaction observed.' },
      { id: 'v-3', date: pastD(86), title: 'Dental cleaning', vet: 'Dr. Anwar', notes: 'Tartar removed. Recommend repeat in 12 months.' },
    ],
    feedingSchedule: [
      { time: '08:00', meal: 'Breakfast — 4 kg protein' },
      { time: '12:30', meal: 'Lunch — supplements + 3 kg' },
      { time: '17:00', meal: 'Dinner — 5 kg protein' },
    ],
    enrichmentLog: [
      { id: 'e-1', date: pastD(2), activity: 'Scent enrichment', engagementPct: 82 },
      { id: 'e-2', date: pastD(5), activity: 'Puzzle feeder', engagementPct: 91 },
      { id: 'e-3', date: pastD(8), activity: 'Pool time', engagementPct: 74 },
    ],
  };
}

// ─── Safety / Incidents ───
export function makeSafetyIncidents() {
  return [
    {
      id: 'inc-001',
      title: 'Visitor slipped near Café Savanna',
      severity: 'medium' as const,
      status: 'closed' as const,
      reportedBy: 'Staff Wahyu',
      location: 'Café Savanna',
      reportedAt: pastH(72),
      closedAt: pastH(60),
      injuries: 0,
      type: 'visitor',
    },
    {
      id: 'inc-002',
      title: 'Animal escape attempt — perimeter fence',
      severity: 'high' as const,
      status: 'investigating' as const,
      reportedBy: 'Curator Made',
      location: 'Tiger Pavilion',
      reportedAt: pastH(18),
      closedAt: null,
      injuries: 0,
      type: 'animal',
    },
    {
      id: 'inc-003',
      title: 'Near-miss — vehicle in safari zone',
      severity: 'medium' as const,
      status: 'open' as const,
      reportedBy: 'Driver Rama',
      location: 'Safari Route 2',
      reportedAt: pastH(6),
      closedAt: null,
      injuries: 0,
      type: 'operational',
    },
    {
      id: 'inc-004',
      title: 'Power outage — auxiliary cafeteria',
      severity: 'low' as const,
      status: 'closed' as const,
      reportedBy: 'Maintenance',
      location: 'Cafeteria North',
      reportedAt: pastH(96),
      closedAt: pastH(90),
      injuries: 0,
      type: 'facility',
    },
    {
      id: 'inc-005',
      title: 'Visitor minor bee sting',
      severity: 'low' as const,
      status: 'closed' as const,
      reportedBy: 'First Aid Office',
      location: 'Picnic Area',
      reportedAt: pastH(120),
      closedAt: pastH(119.5),
      injuries: 1,
      type: 'visitor',
    },
  ];
}

export function makeSafetySummary() {
  return {
    openIncidents: 2,
    daysWithoutMajor: 87,
    drillsThisMonth: 3,
    avgResponseMin: 4.2,
    bySeverity: { low: 12, medium: 4, high: 1 },
  };
}

// ─── Compliance ───
export function makeCompliance() {
  const today = now;
  const documents = [
    { id: 'doc-001', name: 'Wildlife handling permit', authority: 'KLHK', expires: today + 45 * 86_400_000, status: 'valid' as const },
    { id: 'doc-002', name: 'Food service licence — F&B', authority: 'BPOM', expires: today + 12 * 86_400_000, status: 'expiring-soon' as const },
    { id: 'doc-003', name: 'Fire safety certificate', authority: 'Pemadam Kebakaran Bogor', expires: today + 280 * 86_400_000, status: 'valid' as const },
    { id: 'doc-004', name: 'Animal import — Sumatran tiger', authority: 'KLHK', expires: today + 540 * 86_400_000, status: 'valid' as const },
    { id: 'doc-005', name: 'Employee insurance master policy', authority: 'BPJS Ketenagakerjaan', expires: today - 8 * 86_400_000, status: 'expired' as const },
    { id: 'doc-006', name: 'Operating licence — Bogor', authority: 'Pemerintah Kabupaten Bogor', expires: today + 95 * 86_400_000, status: 'valid' as const },
    { id: 'doc-007', name: 'Data privacy registration', authority: 'Kominfo', expires: today + 8 * 86_400_000, status: 'expiring-soon' as const },
  ];
  return documents.map((d) => ({ ...d, expires: new Date(d.expires).toISOString() }));
}

// ─── Inventory ───
export function makeInventory() {
  const items = [
    { id: 'inv-001', sku: 'FB-CKE-001', name: 'Birthday Cake (slice)', category: 'F&B', stock: 8, reorderAt: 20, unit: 'pcs' },
    { id: 'inv-002', sku: 'FB-DRK-021', name: 'Bottled water 600ml', category: 'F&B', stock: 1240, reorderAt: 400, unit: 'pcs' },
    { id: 'inv-003', sku: 'MR-TSH-008', name: 'TSI T-shirt — Adult M', category: 'Merchandise', stock: 36, reorderAt: 50, unit: 'pcs' },
    { id: 'inv-004', sku: 'MR-PLU-014', name: 'Plush tiger 30cm', category: 'Merchandise', stock: 18, reorderAt: 25, unit: 'pcs' },
    { id: 'inv-005', sku: 'MT-SCR-001', name: 'Validator screen assembly', category: 'Maintenance parts', stock: 2, reorderAt: 4, unit: 'pcs' },
    { id: 'inv-006', sku: 'MT-USB-002', name: 'USB-C cable 1m', category: 'Maintenance parts', stock: 14, reorderAt: 10, unit: 'pcs' },
    { id: 'inv-007', sku: 'AF-MEAT-PR1', name: 'Chicken — premium grade', category: 'Animal feed', stock: 380, reorderAt: 200, unit: 'kg' },
    { id: 'inv-008', sku: 'AF-FRU-MIX', name: 'Mixed fruit (daily)', category: 'Animal feed', stock: 220, reorderAt: 150, unit: 'kg' },
    { id: 'inv-009', sku: 'MD-VAC-A1', name: 'Annual vaccine boosters', category: 'Medical', stock: 6, reorderAt: 10, unit: 'doses' },
    { id: 'inv-010', sku: 'MD-FRSTAID', name: 'First aid replenishment kit', category: 'Medical', stock: 22, reorderAt: 15, unit: 'kits' },
    { id: 'inv-011', sku: 'FB-MEAL-PKG', name: 'Lunch box — packed', category: 'F&B', stock: 64, reorderAt: 80, unit: 'pcs' },
    { id: 'inv-012', sku: 'MR-CAP-002', name: 'TSI Cap — embroidered', category: 'Merchandise', stock: 92, reorderAt: 40, unit: 'pcs' },
  ];
  return items.map((i) => ({
    ...i,
    lastRestocked: pastD(((i.sku.charCodeAt(3) ?? 0) % 14) + 1),
    needsReorder: i.stock < i.reorderAt,
  }));
}

export function makeInventorySummary() {
  return {
    skuCount: 12,
    valueIdr: 142_500_000,
    belowReorder: 5,
    expiringSoon: 2,
    byCategory: [
      { category: 'F&B', value: 28_500_000 },
      { category: 'Merchandise', value: 64_300_000 },
      { category: 'Maintenance parts', value: 18_700_000 },
      { category: 'Animal feed', value: 22_800_000 },
      { category: 'Medical', value: 8_200_000 },
    ],
  };
}

// ─── Vendors / Procurement ───
export function makeVendors() {
  return [
    { id: 'ven-001', name: 'CV. Pangan Sejahtera', category: 'F&B', rating: 4.6, onTimePct: 96, lastDelivery: pastD(2), activeOrders: 3 },
    { id: 'ven-002', name: 'PT. Bumi Hijau Distribusi', category: 'Animal feed', rating: 4.8, onTimePct: 98, lastDelivery: pastD(1), activeOrders: 2 },
    { id: 'ven-003', name: 'CV. Sablon Kreatif', category: 'Merchandise', rating: 4.2, onTimePct: 88, lastDelivery: pastD(5), activeOrders: 1 },
    { id: 'ven-004', name: 'PT. Cipta Teknologi Maju', category: 'Maintenance parts', rating: 4.4, onTimePct: 91, lastDelivery: pastD(8), activeOrders: 4 },
    { id: 'ven-005', name: 'Apotek Hewan Mitra', category: 'Medical', rating: 4.7, onTimePct: 95, lastDelivery: pastD(3), activeOrders: 1 },
    { id: 'ven-006', name: 'Sumber Air Bersih Tbk.', category: 'Utilities', rating: 4.0, onTimePct: 99, lastDelivery: pastD(0.5), activeOrders: 0 },
  ];
}

export function makePurchaseOrders() {
  const statuses = ['draft', 'sent', 'confirmed', 'delivered', 'closed'] as const;
  return Array.from({ length: 12 }, (_, i) => ({
    id: `po-${String(15000 + i)}`,
    vendor: ['CV. Pangan Sejahtera', 'PT. Bumi Hijau Distribusi', 'CV. Sablon Kreatif', 'PT. Cipta Teknologi Maju', 'Apotek Hewan Mitra'][i % 5] as string,
    amountIdr: 2_500_000 + (i * 850_000) % 14_000_000,
    placedAt: pastD(i),
    expected: inD(2 + (i % 6)),
    status: statuses[i % statuses.length] as string,
    items: 1 + (i % 4),
  }));
}

// ─── Marketing campaigns ───
export function makeCampaigns() {
  return [
    {
      id: 'camp-001',
      name: 'Birthday Bash · June',
      channel: 'Email + Push',
      audience: 'Active members',
      sent: 1247,
      opened: 821,
      clicked: 314,
      conversions: 64,
      revenueIdr: 18_400_000,
      status: 'running' as const,
      startsAt: pastD(8),
      endsAt: inD(8),
    },
    {
      id: 'camp-002',
      name: 'Night Safari Launch',
      channel: 'Push + In-app',
      audience: 'All members',
      sent: 1432,
      opened: 1188,
      clicked: 412,
      conversions: 96,
      revenueIdr: 32_640_000,
      status: 'running' as const,
      startsAt: pastD(4),
      endsAt: inD(26),
    },
    {
      id: 'camp-003',
      name: 'Renewal reminders (60d)',
      channel: 'Email',
      audience: 'Lapsing pass holders',
      sent: 184,
      opened: 142,
      clicked: 88,
      conversions: 42,
      revenueIdr: 35_700_000,
      status: 'running' as const,
      startsAt: pastD(30),
      endsAt: inD(60),
    },
    {
      id: 'camp-004',
      name: 'Refer-a-friend Q2',
      channel: 'Email + SMS',
      audience: 'Members 6m+',
      sent: 845,
      opened: 612,
      clicked: 218,
      conversions: 38,
      revenueIdr: 28_500_000,
      status: 'paused' as const,
      startsAt: pastD(45),
      endsAt: inD(15),
    },
    {
      id: 'camp-005',
      name: 'F&B perk · weekend',
      channel: 'Push',
      audience: 'Visiting today',
      sent: 412,
      opened: 388,
      clicked: 167,
      conversions: 84,
      revenueIdr: 4_200_000,
      status: 'completed' as const,
      startsAt: pastD(8),
      endsAt: pastD(6),
    },
  ];
}

export function makeMarketingSummary() {
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now - (29 - i) * 86_400_000);
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sent: 200 + Math.round(180 * Math.sin(i * 0.4)),
      opened: 140 + Math.round(140 * Math.sin(i * 0.4 + 0.2)),
      clicks: 60 + Math.round(50 * Math.sin(i * 0.4 + 0.4)),
    };
  });
  return {
    totalSent30d: 8_420,
    totalOpened30d: 5_320,
    totalClicks30d: 1_980,
    totalConversions30d: 412,
    avgOpenRatePct: 63.2,
    avgClickRatePct: 23.5,
    days,
  };
}
