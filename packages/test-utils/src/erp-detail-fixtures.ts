const now = Date.now();
const pastH = (h: number) => new Date(now - h * 3600_000).toISOString();
const inH = (h: number) => new Date(now + h * 3600_000).toISOString();
const inD = (d: number) => new Date(now + d * 86_400_000).toISOString();
const pastD = (d: number) => new Date(now - d * 86_400_000).toISOString();

// ─── Staff detail ───
export function makeStaffDetail(id: string) {
  const seed = Number.parseInt(id.replace(/\D/g, ''), 10) || 0;
  const firstNames = ['Rina', 'Adi', 'Bayu', 'Citra', 'Dewi', 'Farhan', 'Gita', 'Hasan'];
  const last = ['Wijaya', 'Pratama', 'Saputra', 'Lestari'];
  const first = firstNames[seed % firstNames.length] as string;
  const lastName = last[Math.floor(seed / firstNames.length) % last.length] as string;
  return {
    id,
    fullName: `${first} ${lastName}`,
    role: ['Gate Officer', 'Senior Gate Officer', 'Supervisor', 'Field Tech'][seed % 4]!,
    department: ['Operations', 'Animal Care', 'Commercial'][seed % 3]!,
    gateId: ['gate-bgr-01', 'gate-bgr-02', 'gate-prg-01', '—'][seed % 4]!,
    employeeId: `EMP-${2400 + seed}`,
    phone: `+62 812 ${String(1000 + seed).padStart(4, '0')} ${String(seed * 11 % 9999).padStart(4, '0')}`,
    email: `${first.toLowerCase()}.${lastName.toLowerCase()}@tamansafari.id`,
    joinedAt: pastD(180 + (seed * 31) % 800),
    shift: 'Morning · 06:00 — 14:00',
    salaryBandIdr: 6_500_000 + (seed % 6) * 500_000,
    status: 'active' as const,
    badges: [
      { id: 'b1', label: 'Zero-fraud streak', tier: 'gold', count: 60 },
      { id: 'b2', label: 'Sub-200ms latency', tier: 'silver' },
    ],
    attendance30d: 92 + (seed % 8),
    scansThisMonth: 2840 + seed * 23,
    upcomingShifts: Array.from({ length: 7 }, (_, i) => ({
      date: inD(i),
      start: '06:00',
      end: '14:00',
      gateLabel: 'Bogor — Main Entrance',
      status: i === 2 ? 'leave' : i === 5 ? 'swap-requested' : 'scheduled',
    })),
    recentTimeline: [
      { id: 't1', label: 'Clocked in', timestamp: pastH(6), kind: 'attendance' as const },
      { id: 't2', label: 'Processed 142 scans', timestamp: pastH(2), kind: 'work' as const },
      { id: 't3', label: 'Manual entry · damaged QR', timestamp: pastH(1), kind: 'work' as const },
      { id: 't4', label: 'Break · 30 min', timestamp: pastH(3.5), kind: 'attendance' as const },
    ],
    documents: [
      { id: 'd1', name: 'Contract — current', filename: 'contract-rina.pdf', uploaded: pastD(180) },
      { id: 'd2', name: 'NDA', filename: 'nda-rina.pdf', uploaded: pastD(180) },
      { id: 'd3', name: 'Safety training certificate', filename: 'safety-cert.pdf', uploaded: pastD(45) },
    ],
  };
}

// ─── Booking detail ───
export function makeBookingDetail(id: string) {
  return {
    id,
    customer: 'PT. Astra International',
    contactPerson: 'Bu Sari · Events Manager',
    contactEmail: 'sari@astra.co.id',
    contactPhone: '+62 811 5500 1234',
    type: 'Corporate',
    paxCount: 48,
    date: inD(3),
    timeSlot: '11:00',
    location: 'Auditorium A',
    status: 'confirmed' as const,
    notes: 'Outbound team building. Vegetarian meal options for 4 attendees. Need projector + microphone.',
    revenueIdr: 12_000_000,
    depositIdr: 4_000_000,
    balanceIdr: 8_000_000,
    paymentStatus: 'partial' as const,
    timeline: [
      { id: 'b1', label: 'Quote sent', timestamp: pastD(10), actor: 'sales@tamansafari.id' },
      { id: 'b2', label: 'Quote accepted', timestamp: pastD(7), actor: 'sari@astra.co.id' },
      { id: 'b3', label: 'Deposit received', timestamp: pastD(5), actor: 'finance@tamansafari.id' },
      { id: 'b4', label: 'Catering confirmed', timestamp: pastD(2), actor: 'fb@tamansafari.id' },
    ],
    itinerary: [
      { time: '11:00', item: 'Welcome & briefing' },
      { time: '11:30', item: 'Guided park tour' },
      { time: '13:00', item: 'Lunch — Savanna Café' },
      { time: '14:30', item: 'Team activities — Auditorium A' },
      { time: '17:00', item: 'Closing & departure' },
    ],
  };
}

// ─── Safety incident detail ───
export function makeSafetyIncidentDetail(id: string) {
  return {
    id,
    title: 'Animal escape attempt — perimeter fence',
    type: 'animal',
    severity: 'high' as const,
    status: 'investigating' as const,
    reportedBy: 'Curator Made',
    location: 'Tiger Pavilion',
    reportedAt: pastH(18),
    closedAt: null,
    injuries: 0,
    description:
      'Routine perimeter check identified bent section of fencing in Tiger Pavilion north-east corner. No animals breached. Mitigation: temporary barrier installed, full inspection scheduled. Cause: suspected stress from overnight thunderstorm.',
    actions: [
      { id: 'a1', label: 'Install temporary barrier', timestamp: pastH(17), actor: 'Maintenance', status: 'done' as const },
      { id: 'a2', label: 'Full perimeter inspection', timestamp: pastH(16), actor: 'Curator team', status: 'done' as const },
      { id: 'a3', label: 'Permanent fence reinforcement', timestamp: inH(48), actor: 'Vendor PO #15021', status: 'pending' as const },
      { id: 'a4', label: 'Update enclosure standard', timestamp: inH(120), actor: 'Curator Made', status: 'pending' as const },
    ],
    relatedDocs: ['Incident form #INC-12', 'Photo evidence', 'CCTV clip 03:14:22'],
  };
}

// ─── Inventory item detail ───
export function makeInventoryItemDetail(id: string) {
  return {
    id,
    sku: 'MT-SCR-001',
    name: 'Validator screen assembly',
    category: 'Maintenance parts',
    unit: 'pcs',
    stock: 2,
    reorderAt: 4,
    leadTimeDays: 12,
    unitCostIdr: 850_000,
    description: 'Replacement OLED touchscreen assembly for Zebra ET51 validators.',
    movement: Array.from({ length: 14 }, (_, i) => {
      const d = new Date(now - (13 - i) * 86_400_000);
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        inflow: i % 5 === 4 ? 6 : 0,
        outflow: i % 3 === 0 ? 1 : 0,
      };
    }),
    history: [
      { id: 'h1', date: pastD(2), action: 'used' as const, qty: 1, by: 'wahyu@tamansafari.id', note: 'Bogor — Family validator repair' },
      { id: 'h2', date: pastD(8), action: 'restocked' as const, qty: 6, by: 'PO #15014', note: 'Received from PT. Cipta Teknologi Maju' },
      { id: 'h3', date: pastD(12), action: 'used' as const, qty: 2, by: 'wahyu@tamansafari.id', note: 'Prigen — South validators' },
    ],
    locations: [
      { warehouse: 'Bogor — Main store', qty: 1 },
      { warehouse: 'Prigen — South store', qty: 1 },
    ],
  };
}

// ─── Vendor detail ───
export function makeVendorDetail(id: string) {
  return {
    id,
    name: 'CV. Pangan Sejahtera',
    category: 'F&B',
    rating: 4.6,
    onTimePct: 96,
    contactPerson: 'Pak Joko',
    contactEmail: 'joko@pangansejahtera.co.id',
    contactPhone: '+62 22 1234 5678',
    address: 'Jl. Industri 17, Bandung, Jawa Barat',
    sinceYear: 2021,
    totalSpendIdr: 412_000_000,
    activeOrders: 3,
    purchaseOrders: Array.from({ length: 8 }, (_, i) => ({
      id: `po-${String(15000 + i)}`,
      placedAt: pastD(i * 3),
      amountIdr: 2_500_000 + (i * 850_000) % 8_000_000,
      status: (['draft', 'sent', 'confirmed', 'delivered', 'closed'] as const)[i % 5]!,
      items: 1 + (i % 4),
    })),
    deliveryHistory: Array.from({ length: 6 }, (_, i) => ({
      id: `dl-${i + 1}`,
      date: pastD(i * 7),
      onTime: i !== 2,
      qualityScore: 4 + (i % 2 ? 0.5 : 0),
      notes: i === 2 ? 'Delivered 2h late due to traffic. Quality unaffected.' : 'On time, quality verified.',
    })),
  };
}

// ─── Marketing campaign detail ───
export function makeCampaignDetail(id: string) {
  return {
    id,
    name: 'Birthday Bash · June',
    channel: 'Email + Push',
    audience: 'Active members',
    status: 'running' as const,
    startsAt: pastD(8),
    endsAt: inD(8),
    sent: 1247,
    opened: 821,
    clicked: 314,
    conversions: 64,
    revenueIdr: 18_400_000,
    funnel: [
      { stage: 'Sent', count: 1247 },
      { stage: 'Opened', count: 821 },
      { stage: 'Clicked', count: 314 },
      { stage: 'Converted', count: 64 },
    ],
    daily: Array.from({ length: 14 }, (_, i) => {
      const d = new Date(now - (13 - i) * 86_400_000);
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sent: i < 8 ? 0 : 80 + Math.round(40 * Math.sin(i * 0.7)),
        opened: i < 8 ? 0 : 50 + Math.round(30 * Math.sin(i * 0.7)),
        converted: i < 8 ? 0 : 4 + Math.round(3 * Math.sin(i * 0.7)),
      };
    }),
    creatives: [
      { id: 'cr1', kind: 'Email · Subject A', preview: 'Birthday cake on us 🎂', openRate: 64 },
      { id: 'cr2', kind: 'Email · Subject B', preview: 'Make your birthday wild', openRate: 71 },
      { id: 'cr3', kind: 'Push notification', preview: 'Members get free cake this week!', openRate: 28 },
    ],
  };
}

// ─── Compliance doc detail ───
export function makeComplianceDocDetail(id: string) {
  return {
    id,
    name: 'Wildlife handling permit',
    authority: 'KLHK',
    issuedAt: pastD(320),
    expires: inD(45),
    status: 'valid' as const,
    referenceNumber: 'WHP-2024-00284',
    owner: 'Curator team',
    nextAction: 'Renew 30 days before expiry',
    history: [
      { id: 'h1', date: pastD(320), label: 'Issued', actor: 'KLHK' },
      { id: 'h2', date: pastD(180), label: 'Mid-year inspection — passed', actor: 'KLHK regional officer' },
      { id: 'h3', date: pastD(60), label: 'Internal review completed', actor: 'Curator Made' },
    ],
    documents: [
      { id: 'f1', filename: 'whp-2024.pdf', size: '2.1 MB' },
      { id: 'f2', filename: 'inspection-report.pdf', size: '840 KB' },
    ],
  };
}

// ─── Redemption detail ───
export function makeRedemptionDetail(id: string) {
  return {
    id,
    passHolder: 'Adi Wijaya',
    passId: 'p_2034',
    memberId: 'm_1000',
    gateId: 'gate-bgr-01',
    gateLabel: 'Bogor — Main Entrance',
    scannedAt: pastH(1.5),
    verdict: 'allow' as const,
    source: 'online' as const,
    latencyMs: 264,
    operator: 'Rina Wijaya',
    jti: 'jti_1733742000_7',
    kid: 'k_2026_q2_001',
    deviceId: 'dev_bgr_01_a',
    signatureValid: true,
    geo: { lat: -6.715, lng: 106.93, accuracyM: 12 },
    timeline: [
      { id: 'r1', label: 'QR captured by camera', timestamp: pastH(1.502), latencyMs: 12 },
      { id: 'r2', label: 'JWS decoded & signature verified', timestamp: pastH(1.501), latencyMs: 8 },
      { id: 'r3', label: 'jti checked against replay set', timestamp: pastH(1.5008), latencyMs: 4 },
      { id: 'r4', label: 'POST /redemptions → 200', timestamp: pastH(1.5), latencyMs: 240 },
      { id: 'r5', label: 'Gate opened — visitor admitted', timestamp: pastH(1.4995), latencyMs: 50 },
    ],
  };
}

// ─── Shifts ───
export function makeShiftRoster() {
  const staff = [
    'Rina Wijaya',
    'Adi Pratama',
    'Bayu Saputra',
    'Citra Lestari',
    'Dewi Hartono',
    'Eka Setiawan',
    'Farhan Kusuma',
    'Gita Permata',
  ];
  const symbols = ['M', 'A', '—', 'M', 'A', 'L', 'M', 'A'] as const;
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now + i * 86_400_000);
    return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  });
  return {
    weekStart: new Date(now).toISOString(),
    weekEnd: new Date(now + 6 * 86_400_000).toISOString(),
    days,
    legend: [
      { key: 'M', label: 'Morning · 06:00 — 14:00', color: 'brand' },
      { key: 'A', label: 'Afternoon · 14:00 — 22:00', color: 'earth' },
      { key: 'L', label: 'Leave', color: 'rose' },
      { key: '—', label: 'Off', color: 'slate' },
    ],
    rows: staff.map((name, i) => ({
      name,
      role: ['Gate Officer', 'Senior Officer', 'Supervisor'][i % 3]!,
      gate: ['Bogor — Main', 'Bogor — Family', 'Prigen — North', 'Prigen — South', 'Bali — Coastal'][i % 5]!,
      cells: days.map((_, di) => {
        const s = symbols[(i + di) % symbols.length] as string;
        return s;
      }),
      hours: 40 + ((i * 7) % 8),
    })),
  };
}

export function makeSwapRequests() {
  return [
    {
      id: 'sw-1',
      from: 'Rina Wijaya',
      to: 'Bayu Saputra',
      date: inD(2),
      shift: 'Morning · 06:00 — 14:00',
      reason: 'Family appointment',
      status: 'pending' as const,
      requestedAt: pastH(3),
    },
    {
      id: 'sw-2',
      from: 'Citra Lestari',
      to: 'Dewi Hartono',
      date: inD(4),
      shift: 'Afternoon · 14:00 — 22:00',
      reason: 'Wedding attendance',
      status: 'approved' as const,
      requestedAt: pastH(48),
    },
    {
      id: 'sw-3',
      from: 'Farhan Kusuma',
      to: 'Eka Setiawan',
      date: pastD(1),
      shift: 'Morning · 06:00 — 14:00',
      reason: 'Medical appointment',
      status: 'completed' as const,
      requestedAt: pastD(3),
    },
  ];
}

export function makeShiftCoverage() {
  return [
    { gate: 'Bogor — Main', morningStaffed: 3, morningNeeded: 3, afternoonStaffed: 3, afternoonNeeded: 3 },
    { gate: 'Bogor — Family', morningStaffed: 2, morningNeeded: 2, afternoonStaffed: 2, afternoonNeeded: 2 },
    { gate: 'Prigen — North', morningStaffed: 2, morningNeeded: 2, afternoonStaffed: 1, afternoonNeeded: 2 },
    { gate: 'Prigen — South', morningStaffed: 2, morningNeeded: 2, afternoonStaffed: 2, afternoonNeeded: 2 },
    { gate: 'Bali — Coastal', morningStaffed: 1, morningNeeded: 1, afternoonStaffed: 1, afternoonNeeded: 1 },
  ];
}

// ─── Master data ───
export function makeMasterData() {
  return {
    departments: [
      { id: 'dept-001', code: 'OPS', name: 'Operations', headcount: 14, manager: 'Pak Hadi' },
      { id: 'dept-002', code: 'CARE', name: 'Animal Care', headcount: 8, manager: 'Curator Made' },
      { id: 'dept-003', code: 'COMM', name: 'Commercial', headcount: 6, manager: 'Bu Rina' },
      { id: 'dept-004', code: 'ENG', name: 'Engineering & Maintenance', headcount: 4, manager: 'Pak Wahyu' },
      { id: 'dept-005', code: 'FIN', name: 'Finance & Admin', headcount: 3, manager: 'Bu Lina' },
    ],
    roles: [
      { id: 'role-001', code: 'GO', name: 'Gate Officer', department: 'Operations', baseSalary: 5_500_000 },
      { id: 'role-002', code: 'SGO', name: 'Senior Gate Officer', department: 'Operations', baseSalary: 7_000_000 },
      { id: 'role-003', code: 'SUP', name: 'Supervisor', department: 'Operations', baseSalary: 9_500_000 },
      { id: 'role-004', code: 'FT', name: 'Field Tech', department: 'Engineering & Maintenance', baseSalary: 8_200_000 },
      { id: 'role-005', code: 'VET', name: 'Veterinarian', department: 'Animal Care', baseSalary: 14_000_000 },
      { id: 'role-006', code: 'CUR', name: 'Curator', department: 'Animal Care', baseSalary: 12_000_000 },
      { id: 'role-007', code: 'TIX', name: 'Ticketing', department: 'Commercial', baseSalary: 5_200_000 },
    ],
    tiers: [
      { id: 'tier-001', code: 'AD', name: 'Adult', priceIdr: 850_000, visits: 'Unlimited', validityDays: 365 },
      { id: 'tier-002', code: 'CH', name: 'Child', priceIdr: 600_000, visits: 'Unlimited', validityDays: 365 },
      { id: 'tier-003', code: 'SR', name: 'Senior', priceIdr: 500_000, visits: 'Unlimited', validityDays: 365 },
      { id: 'tier-004', code: 'FA4', name: 'Family (4 pax)', priceIdr: 2_800_000, visits: 'Unlimited', validityDays: 365 },
      { id: 'tier-005', code: 'CMP', name: 'Companion', priceIdr: 50_000, visits: 'Single', validityDays: 1 },
    ],
    enclosures: [
      { id: 'enc-001', code: 'TP', name: 'Tiger Pavilion', capacity: 4, occupants: 2, lastInspection: pastD(7) },
      { id: 'enc-002', code: 'PZ', name: 'Predator Zone', capacity: 6, occupants: 4, lastInspection: pastD(5) },
      { id: 'enc-003', code: 'PH', name: 'Primate House', capacity: 8, occupants: 6, lastInspection: pastD(10) },
      { id: 'enc-004', code: 'SV', name: 'Savanna', capacity: 12, occupants: 9, lastInspection: pastD(2) },
      { id: 'enc-005', code: 'RH', name: 'Reptile Hall', capacity: 20, occupants: 14, lastInspection: pastD(8) },
      { id: 'enc-006', code: 'FL', name: 'Forest Loop', capacity: 10, occupants: 7, lastInspection: pastD(4) },
    ],
    taxes: [
      { id: 'tax-001', code: 'PPN', name: 'PPN (VAT)', rate: 11, appliesTo: 'Pass renewal · F&B' },
      { id: 'tax-002', code: 'PB1', name: 'Pajak Hiburan', rate: 10, appliesTo: 'Entry tickets' },
      { id: 'tax-003', code: 'PPH', name: 'PPh 23', rate: 2, appliesTo: 'Vendor services' },
    ],
    paymentMethods: [
      { id: 'pm-001', code: 'QRIS', name: 'QRIS', feePct: 0.7, settlement: 'T+1' },
      { id: 'pm-002', code: 'CC', name: 'Credit Card', feePct: 2.5, settlement: 'T+2' },
      { id: 'pm-003', code: 'CASH', name: 'Cash', feePct: 0, settlement: 'Instant' },
      { id: 'pm-004', code: 'GOPAY', name: 'GoPay', feePct: 0.7, settlement: 'T+1' },
      { id: 'pm-005', code: 'OVO', name: 'OVO', feePct: 0.7, settlement: 'T+1' },
      { id: 'pm-006', code: 'BANKIN', name: 'Bank transfer', feePct: 0, settlement: 'T+0' },
    ],
    notificationTemplates: [
      { id: 'nt-001', code: 'WELC', name: 'Welcome new member', channel: 'Email', lastEdited: pastD(40) },
      { id: 'nt-002', code: 'RENL', name: 'Renewal reminder · 60d', channel: 'Email + SMS', lastEdited: pastD(15) },
      { id: 'nt-003', code: 'PERK', name: 'Monthly perk drop', channel: 'Push', lastEdited: pastD(8) },
      { id: 'nt-004', code: 'EVNT', name: 'Event RSVP confirmation', channel: 'Email', lastEdited: pastD(12) },
      { id: 'nt-005', code: 'INC', name: 'Incident escalation', channel: 'SMS', lastEdited: pastD(60) },
    ],
    locations: [
      { id: 'loc-001', code: 'BGR', name: 'Taman Safari Bogor', address: 'Jl. Capolaga, Bogor, Jawa Barat', timezone: 'Asia/Jakarta', activeGates: 5, manager: 'Pak Hadi' },
      { id: 'loc-002', code: 'PRG', name: 'Taman Safari Prigen', address: 'Jl. Raya Taman Safari II, Pasuruan', timezone: 'Asia/Jakarta', activeGates: 4, manager: 'Bu Sari' },
      { id: 'loc-003', code: 'BAL', name: 'Bali Marine & Safari Park', address: 'Jl. Bypass Prof. Dr. Ida Bagus Mantra, Gianyar', timezone: 'Asia/Makassar', activeGates: 3, manager: 'Pak Komang' },
    ],
    species: [
      { id: 'sp-001', code: 'SUMTGR', name: 'Sumatran Tiger', latin: 'Panthera tigris sumatrae', iucn: 'CR', count: 4 },
      { id: 'sp-002', code: 'AFRELE', name: 'African Elephant', latin: 'Loxodonta africana', iucn: 'EN', count: 6 },
      { id: 'sp-003', code: 'BORORG', name: 'Bornean Orangutan', latin: 'Pongo pygmaeus', iucn: 'CR', count: 5 },
      { id: 'sp-004', code: 'BLKRHI', name: 'Black Rhinoceros', latin: 'Diceros bicornis', iucn: 'CR', count: 2 },
      { id: 'sp-005', code: 'GIRAF', name: 'Reticulated Giraffe', latin: 'Giraffa reticulata', iucn: 'VU', count: 5 },
      { id: 'sp-006', code: 'KMODR', name: 'Komodo Dragon', latin: 'Varanus komodoensis', iucn: 'EN', count: 8 },
      { id: 'sp-007', code: 'FLAMI', name: 'Greater Flamingo', latin: 'Phoenicopterus roseus', iucn: 'LC', count: 14 },
    ],
    sponsors: [
      { id: 'sp-001', code: 'GUDFM', name: 'Good Food Mart', category: 'F&B', tier: 'Gold', contractEnds: inD(180) },
      { id: 'sp-002', code: 'BLUTL', name: 'BluTel Communications', category: 'Telco', tier: 'Platinum', contractEnds: inD(365) },
      { id: 'sp-003', code: 'BBANK', name: 'Bank BBAN', category: 'Banking', tier: 'Platinum', contractEnds: inD(540) },
      { id: 'sp-004', code: 'WLFND', name: 'Wildlife Foundation', category: 'NGO', tier: 'Partner', contractEnds: inD(730) },
    ],
  };
}

const img = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

export function makeCmsContent() {
  return {
    banners: [
      { id: 'cms-bn-001', title: 'Birthday Bash Weekend', subtitle: 'Free cake for members at the Savanna Café', tag: 'Members only', accent: 'brand', ctaLabel: 'See details', ctaTarget: '/events', validUntil: inD(14), status: 'active', impressions: 12_408, clicks: 1_624, image: img('1558636508-e0db3814bd1d') },
      { id: 'cms-bn-002', title: 'Night Safari is back', subtitle: 'Friday & Saturday — 18:00 to 22:00', tag: 'New', accent: 'earth', ctaLabel: 'Explore', ctaTarget: '/events', validUntil: inD(30), status: 'active', impressions: 18_902, clicks: 3_201, image: img('1444080748397-f442aa95c3e5') },
      { id: 'cms-bn-003', title: '20% off all F&B this month', subtitle: 'Show your QR at any in-park restaurant', tag: 'Perk', accent: 'rose', ctaLabel: 'View perks', ctaTarget: '/perks', validUntil: inD(20), status: 'active', impressions: 9_120, clicks: 880, image: img('1567620905732-2d1ec7ab7445') },
      { id: 'cms-bn-004', title: 'Conservation Talk · Sunday', subtitle: 'Meet our head veterinarian, 14:00 at Auditorium A', tag: 'Event', accent: 'brand', ctaLabel: 'RSVP', ctaTarget: '/events', validUntil: inD(7), status: 'scheduled', impressions: 0, clicks: 0, image: img('1525134479668-1bee5c7c6845') },
      { id: 'cms-bn-005', title: 'Last month — Refer a friend', subtitle: 'Earn Rp 100.000 voucher', tag: 'Referral', accent: 'slate', ctaLabel: 'Refer now', ctaTarget: '/perks', validUntil: pastD(2), status: 'expired', impressions: 32_104, clicks: 4_902, image: img('1513885535751-8b9238bd345a') },
    ],
    promotions: [
      { id: 'cms-pr-001', title: 'Birthday Bash Weekend', subtitle: 'Free cake at the Savanna Café', tag: 'Members only', heroEmoji: '🎂', validUntil: inD(14), status: 'active', claims: 87, image: img('1558636508-e0db3814bd1d') },
      { id: 'cms-pr-002', title: 'Night Safari is back', subtitle: 'Fri & Sat · 18:00 — 22:00', tag: 'New', heroEmoji: '🦉', validUntil: inD(30), status: 'active', claims: 412, image: img('1444080748397-f442aa95c3e5') },
      { id: 'cms-pr-003', title: '20% off all F&B', subtitle: 'In-park restaurants this month', tag: 'Perk', heroEmoji: '🍽️', validUntil: inD(20), status: 'active', claims: 1_204, image: img('1567620905732-2d1ec7ab7445') },
      { id: 'cms-pr-004', title: 'Refer a friend', subtitle: 'Earn Rp 100.000 voucher', tag: 'Referral', heroEmoji: '🎁', validUntil: inD(365), status: 'active', claims: 38, image: img('1513885535751-8b9238bd345a') },
      { id: 'cms-pr-005', title: 'Photo Day · Sunday', subtitle: 'Free portrait with park animals', tag: 'Event', heroEmoji: '📸', validUntil: inD(7), status: 'active', claims: 21, image: img('1502920917128-1aa500764cbd') },
    ],
    events: [
      { id: 'cms-ev-001', title: 'Lion Feeding', tag: 'Daily', location: 'Predator Zone', datetime: inH(2), capacity: 80, booked: 47, status: 'active', image: img('1546182990-dffeafbe841d') },
      { id: 'cms-ev-002', title: 'Night Safari', tag: 'Weekend', location: 'Main Park', datetime: inD(3), capacity: 200, booked: 142, status: 'active', image: img('1444080748397-f442aa95c3e5') },
      { id: 'cms-ev-003', title: 'Conservation Talk', tag: 'Members only', location: 'Auditorium A', datetime: inD(5), capacity: 60, booked: 28, status: 'active', image: img('1583337130417-3346a1be7dee') },
      { id: 'cms-ev-004', title: 'Sumatran Tiger Encounter', tag: 'Booking required', location: 'Tiger Pavilion', datetime: inD(8), capacity: 24, booked: 24, status: 'sold-out', image: img('1561731216-c3a4d99437d5') },
      { id: 'cms-ev-005', title: 'Family Camp Weekend', tag: 'Family', location: 'Camp Ground', datetime: inD(14), capacity: 40, booked: 11, status: 'active', image: img('1504280390367-361c6d9f38f4') },
      { id: 'cms-ev-006', title: 'Earth Day Festival 2026', tag: 'Special', location: 'Main Park', datetime: pastD(8), capacity: 500, booked: 487, status: 'past', image: img('1448375240586-882707db888b') },
    ],
    perks: [
      { id: 'cms-pk-001', title: '20% off F&B', summary: 'All in-park restaurants. Show QR at checkout.', category: 'Food & Drink', validUntil: inD(20), status: 'active', redeemed: 1_204, image: img('1567620905732-2d1ec7ab7445') },
      { id: 'cms-pk-002', title: 'Free guided tour', summary: 'One tour per quarter, book at the visitor centre.', category: 'Experience', validUntil: inD(60), status: 'active', redeemed: 312, image: img('1547721064-da6cfb341d50') },
      { id: 'cms-pk-003', title: 'Companion entry — Rp 50.000', summary: 'Bring a friend at member rate.', category: 'Ticketing', validUntil: inD(30), status: 'active', redeemed: 856, image: img('1600880292203-757bb62b4baf') },
      { id: 'cms-pk-004', title: 'Souvenir shop · 10% off', summary: 'Across all merchandise.', category: 'Retail', validUntil: inD(90), status: 'active', redeemed: 422, image: img('1513885535751-8b9238bd345a') },
      { id: 'cms-pk-005', title: 'Priority parking', summary: 'Designated members-only lot near Gate A.', category: 'Convenience', validUntil: inD(365), status: 'active', redeemed: 2_104, image: img('1597007030739-6d2e7172ee6e') },
      { id: 'cms-pk-006', title: 'Birthday treat', summary: 'Free cake voucher in your birthday month.', category: 'Celebration', validUntil: inD(365), status: 'active', redeemed: 79, image: img('1551244072-5d12893278ab') },
    ],
    notifications: [
      { id: 'cms-nt-001', title: 'New perk · 20% off F&B', body: 'Valid this month at all in-park restaurants.', channel: 'Push', audience: 'All members', sentAt: pastH(6), status: 'sent', delivered: 12_840, opened: 4_122 },
      { id: 'cms-nt-002', title: 'Night Safari opens this weekend', body: 'Friday & Saturday from 18:00. Limited spots — RSVP early.', channel: 'Push + Email', audience: 'Bogor members', sentAt: pastD(1), status: 'sent', delivered: 6_410, opened: 2_018 },
      { id: 'cms-nt-003', title: 'Renewal reminder — 30 days left', body: 'Renew now to avoid lapsing.', channel: 'Email + SMS', audience: 'Expiring in 30d', sentAt: pastD(2), status: 'sent', delivered: 412, opened: 297 },
      { id: 'cms-nt-004', title: 'Earth Day Festival 2026 — recap', body: 'Thank you to 487 members who attended.', channel: 'Email', audience: 'Festival attendees', sentAt: null, status: 'draft', delivered: 0, opened: 0 },
      { id: 'cms-nt-005', title: 'Conservation Talk · RSVP open', body: 'Sun 14:00 at Auditorium A. Members only.', channel: 'Push', audience: 'All members', sentAt: inD(2), status: 'scheduled', delivered: 0, opened: 0 },
    ],
    parkStatus: {
      parkName: 'Taman Safari Bogor',
      status: 'open',
      hours: '09:00 — 17:00 WIB',
      weather: { tempC: 28, conditionEn: 'Partly cloudy', conditionLabel: 'Cerah sebagian', iconKey: 'partly-cloudy' },
      crowdLevel: 'moderate',
      featuredEvent: { id: 'evt-001', title: 'Lion Feeding · 11:00', location: 'Predator Zone' },
      lastUpdated: pastH(1),
      editor: 'admin@tamansafari.id',
    },
    summary: {
      totalBanners: 5,
      activeBanners: 3,
      totalPromotions: 5,
      activePromotions: 5,
      totalEvents: 6,
      upcomingEvents: 5,
      totalPerks: 6,
      activePerks: 6,
      pushSentThisMonth: 19_662,
      avgOpenRate: 32.4,
    },
  };
}
