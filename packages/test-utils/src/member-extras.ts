const now = Date.now();
const inDays = (d: number) => new Date(now + d * 86_400_000).toISOString();

// Curated Unsplash imagery — safari / wildlife / family / food themed.
// Static photo IDs so the URLs stay stable.
const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

export const memberImagery = {
  lion: img('1546182990-dffeafbe841d'),
  tiger: img('1561731216-c3a4d99437d5'),
  elephant: img('1564349683136-77e08dba1ef7'),
  orangutan: img('1605256585681-455837661b18'),
  rhino: img('1497206365907-f5e630693df0'),
  giraffe: img('1547721064-da6cfb341d50'),
  zebra: img('1551983890-19c0c8aa01ec'),
  flamingo: img('1556979895-72d6b9ce5fc8'),
  birthday: img('1558636508-e0db3814bd1d'),
  cake: img('1551244072-5d12893278ab'),
  food: img('1567620905732-2d1ec7ab7445'),
  drinks: img('1551024601-bec78aea704b'),
  night: img('1444080748397-f442aa95c3e5'),
  family: img('1600880292203-757bb62b4baf'),
  conservation: img('1525134479668-1bee5c7c6845'),
  vet: img('1583337130417-3346a1be7dee'),
  park: img('1535338454770-8be927b5a00b'),
  forest: img('1448375240586-882707db888b'),
  camp: img('1504280390367-361c6d9f38f4'),
  gift: img('1513885535751-8b9238bd345a'),
  parking: img('1597007030739-6d2e7172ee6e'),
  photo: img('1502920917128-1aa500764cbd'),
  hero: img('1564349683136-77e08dba1ef7'),
} as const;

export function makeBanners() {
  return [
    {
      id: 'banner-001',
      title: 'Birthday Bash Weekend',
      subtitle: 'Free cake for members at the Savanna Café',
      tag: 'Members only',
      accent: 'brand',
      ctaLabel: 'See details',
      ctaTarget: '/events',
      validUntil: inDays(14),
      image: memberImagery.birthday,
    },
    {
      id: 'banner-002',
      title: 'Night Safari is back',
      subtitle: 'Friday & Saturday — 18:00 to 22:00',
      tag: 'New',
      accent: 'earth',
      ctaLabel: 'Explore',
      ctaTarget: '/events',
      validUntil: inDays(30),
      image: memberImagery.night,
    },
    {
      id: 'banner-003',
      title: '20% off all F&B this month',
      subtitle: 'Show your QR at any in-park restaurant',
      tag: 'Perk',
      accent: 'rose',
      ctaLabel: 'View perks',
      ctaTarget: '/perks',
      validUntil: inDays(20),
      image: memberImagery.food,
    },
    {
      id: 'banner-004',
      title: 'Conservation Talk · Sunday',
      subtitle: 'Meet our head veterinarian, 14:00 at Auditorium A',
      tag: 'Event',
      accent: 'brand',
      ctaLabel: 'RSVP',
      ctaTarget: '/events',
      validUntil: inDays(7),
      image: memberImagery.conservation,
    },
  ];
}

export function makeParkStatus() {
  return {
    parkName: 'Taman Safari Bogor',
    status: 'open' as const,
    hours: '09:00 — 17:00 WIB',
    weather: {
      tempC: 28,
      conditionLabel: 'Cerah sebagian',
      conditionEn: 'Partly cloudy',
      iconKey: 'partly-cloudy',
    },
    crowdLevel: 'moderate' as const,
    featuredEvent: {
      id: 'evt-001',
      title: 'Lion Feeding · 11:00',
      location: 'Predator Zone',
      image: memberImagery.lion,
    },
    heroImage: memberImagery.park,
  };
}

export function makeNotifications() {
  return [
    {
      id: 'n-001',
      title: 'Your Annual Pass is active',
      body: 'Welcome — show your QR at any gate to enter.',
      timestamp: new Date(now - 1 * 3600_000).toISOString(),
      read: false,
      category: 'pass',
    },
    {
      id: 'n-002',
      title: 'New perk · 20% off F&B',
      body: 'Valid this month at all in-park restaurants.',
      timestamp: new Date(now - 6 * 3600_000).toISOString(),
      read: false,
      category: 'perk',
    },
    {
      id: 'n-003',
      title: 'Night Safari opens this weekend',
      body: 'Friday & Saturday from 18:00. Limited spots — RSVP early.',
      timestamp: new Date(now - 24 * 3600_000).toISOString(),
      read: true,
      category: 'event',
    },
    {
      id: 'n-004',
      title: 'Renewal reminder — 30 days left',
      body: 'Renew now to avoid lapsing.',
      timestamp: new Date(now - 2 * 86_400_000).toISOString(),
      read: true,
      category: 'renewal',
    },
    {
      id: 'n-005',
      title: 'Birthday treat unlocked 🎂',
      body: 'Your free cake voucher is ready — claim it at any Savanna Café.',
      timestamp: new Date(now - 3 * 86_400_000).toISOString(),
      read: false,
      category: 'perk',
    },
    {
      id: 'n-006',
      title: 'Conservation Talk · Sunday 14:00',
      body: 'Meet our head veterinarian at Auditorium A. Members only.',
      timestamp: new Date(now - 4 * 86_400_000).toISOString(),
      read: true,
      category: 'event',
    },
    {
      id: 'n-007',
      title: 'Sumatran Tiger Encounter is filling up',
      body: 'Only a few slots left for this weekend — book now.',
      timestamp: new Date(now - 5 * 86_400_000).toISOString(),
      read: true,
      category: 'event',
    },
    {
      id: 'n-008',
      title: 'Park hours updated',
      body: 'Weekend hours extended to 18:00 starting this month.',
      timestamp: new Date(now - 6 * 86_400_000).toISOString(),
      read: true,
      category: 'pass',
    },
    {
      id: 'n-009',
      title: 'Refer a friend, earn Rp 100.000',
      body: 'Share your code — you both get a voucher when they join.',
      timestamp: new Date(now - 8 * 86_400_000).toISOString(),
      read: false,
      category: 'perk',
    },
    {
      id: 'n-010',
      title: 'Photo Day this Sunday 📸',
      body: 'Free professional portraits with park animals. Bookings at 09:00.',
      timestamp: new Date(now - 10 * 86_400_000).toISOString(),
      read: true,
      category: 'event',
    },
    {
      id: 'n-011',
      title: 'Thanks for visiting! 🦁',
      body: 'You visited Taman Safari Bogor last weekend — see you again soon.',
      timestamp: new Date(now - 12 * 86_400_000).toISOString(),
      read: true,
      category: 'pass',
    },
  ];
}

export function makeEvents() {
  return [
    {
      id: 'evt-001',
      title: 'Lion Feeding',
      summary: 'Watch our pride enjoy their afternoon feed.',
      datetime: inDays(0),
      location: 'Predator Zone',
      tag: 'Daily',
      image: memberImagery.lion,
    },
    {
      id: 'evt-002',
      title: 'Night Safari',
      summary: 'Discover nocturnal wildlife under the stars.',
      datetime: inDays(3),
      location: 'Main Park',
      tag: 'Weekend',
      image: memberImagery.night,
    },
    {
      id: 'evt-003',
      title: 'Conservation Talk',
      summary: 'Meet our head veterinarian and ask questions.',
      datetime: inDays(5),
      location: 'Auditorium A',
      tag: 'Members only',
      image: memberImagery.vet,
    },
    {
      id: 'evt-004',
      title: 'Sumatran Tiger Encounter',
      summary: 'Behind-the-scenes look at our breeding program.',
      datetime: inDays(8),
      location: 'Tiger Pavilion',
      tag: 'Booking required',
      image: memberImagery.tiger,
    },
    {
      id: 'evt-005',
      title: 'Family Camp Weekend',
      summary: 'Camp overnight in the park with guided activities.',
      datetime: inDays(14),
      location: 'Camp Ground',
      tag: 'Family',
      image: memberImagery.camp,
    },
    {
      id: 'evt-006',
      title: 'Elephant Bath Time',
      summary: 'Help our keepers wash and feed the herd up close.',
      datetime: inDays(1),
      location: 'Savanna',
      tag: 'Daily',
      image: memberImagery.elephant,
    },
    {
      id: 'evt-007',
      title: 'Giraffe Feeding Experience',
      summary: 'Hand-feed our reticulated giraffes from the platform.',
      datetime: inDays(2),
      location: 'Savanna Deck',
      tag: 'Daily',
      image: memberImagery.giraffe,
    },
    {
      id: 'evt-008',
      title: 'Birds of Prey Show',
      summary: 'Watch eagles and owls soar in our live flight demo.',
      datetime: inDays(4),
      location: 'Bird Amphitheatre',
      tag: 'Show',
      image: memberImagery.flamingo,
    },
    {
      id: 'evt-009',
      title: 'Earth Day Festival',
      summary: 'A day of conservation activities for the whole family.',
      datetime: inDays(10),
      location: 'Main Park',
      tag: 'Special',
      image: memberImagery.forest,
    },
    {
      id: 'evt-010',
      title: 'Photo Day with the Animals',
      summary: 'Pro photographers stationed across the park — free portraits.',
      datetime: inDays(7),
      location: 'Visitor Centre',
      tag: 'Members only',
      image: memberImagery.photo,
    },
    {
      id: 'evt-011',
      title: 'Junior Ranger Workshop',
      summary: 'Kids learn animal care and earn a ranger badge.',
      datetime: inDays(12),
      location: 'Education Hall',
      tag: 'Family',
      image: memberImagery.family,
    },
    {
      id: 'evt-012',
      title: 'Sunset Savanna Dinner',
      summary: 'An exclusive members dinner overlooking the savanna.',
      datetime: inDays(18),
      location: 'Savanna Lodge',
      tag: 'Members only',
      image: memberImagery.drinks,
    },
  ];
}

export function makePerks() {
  return [
    {
      id: 'perk-001',
      title: '20% off F&B',
      summary: 'All in-park restaurants. Show QR at checkout.',
      category: 'Food & Drink',
      validUntil: inDays(20),
      image: memberImagery.food,
    },
    {
      id: 'perk-002',
      title: 'Free guided tour',
      summary: 'One tour per quarter, book at the visitor centre.',
      category: 'Experience',
      validUntil: inDays(60),
      image: memberImagery.giraffe,
    },
    {
      id: 'perk-003',
      title: 'Companion entry — Rp 50.000',
      summary: 'Bring a friend at member rate.',
      category: 'Ticketing',
      validUntil: inDays(30),
      image: memberImagery.family,
    },
    {
      id: 'perk-004',
      title: 'Souvenir shop · 10% off',
      summary: 'Across all merchandise.',
      category: 'Retail',
      validUntil: inDays(90),
      image: memberImagery.gift,
    },
    {
      id: 'perk-005',
      title: 'Priority parking',
      summary: 'Designated members-only lot near Gate A.',
      category: 'Convenience',
      validUntil: inDays(365),
      image: memberImagery.parking,
    },
    {
      id: 'perk-006',
      title: 'Birthday treat',
      summary: 'Free cake voucher in your birthday month.',
      category: 'Celebration',
      validUntil: inDays(365),
      image: memberImagery.cake,
    },
    {
      id: 'perk-007',
      title: 'Free coffee refills',
      summary: 'Unlimited brewed coffee at Predator Coffee.',
      category: 'Food & Drink',
      validUntil: inDays(120),
      image: memberImagery.drinks,
    },
    {
      id: 'perk-008',
      title: 'Conservation tour · members rate',
      summary: 'Behind-the-scenes vet tour at half price.',
      category: 'Experience',
      validUntil: inDays(75),
      image: memberImagery.conservation,
    },
    {
      id: 'perk-009',
      title: 'Free digital photo pack',
      summary: 'One complimentary photo bundle per visit.',
      category: 'Celebration',
      validUntil: inDays(180),
      image: memberImagery.photo,
    },
  ];
}

export function makeParkInfo() {
  return {
    locations: [
      {
        id: 'bogor',
        name: 'Bogor',
        address: 'Jl. Capolaga, Bogor, Jawa Barat',
        hours: '09:00 — 17:00',
        phone: '+62 251 1234567',
        image: memberImagery.elephant,
      },
      {
        id: 'prigen',
        name: 'Prigen',
        address: 'Jl. Raya Taman Safari Indonesia II, Pasuruan',
        hours: '09:00 — 17:00',
        phone: '+62 343 1234567',
        image: memberImagery.forest,
      },
      {
        id: 'bali',
        name: 'Bali Marine & Safari Park',
        address: 'Jl. Bypass Prof. Dr. Ida Bagus Mantra, Gianyar',
        hours: '09:00 — 18:00',
        phone: '+62 361 1234567',
        image: memberImagery.flamingo,
      },
    ],
    tips: [
      'Best time to see lions: feeding times at 11:00 and 14:30.',
      'Weekdays are noticeably quieter than weekends.',
      'Bring a refillable bottle — water stations across the park.',
      'Photography is welcome; flash is discouraged in nocturnal exhibits.',
    ],
  };
}

// Profile-screen extras: member stats, visit history, active perks.
// Powers the redesigned Akun/Profile screen.
export function makeMemberProfileExtras() {
  return {
    stats: {
      visitsThisYear: 6,
      remainingVisits: 6,
      activePerks: 5,
      totalSavedIdr: 652_000,
    },
    recentVisits: [
      {
        id: 'visit-001',
        park: 'Taman Safari Bogor',
        activity: 'Safari Siang',
        date: inDays(-25),
        image: memberImagery.lion,
      },
      {
        id: 'visit-002',
        park: 'Taman Safari Bogor',
        activity: 'Safari Malam',
        date: inDays(-40),
        image: memberImagery.night,
      },
      {
        id: 'visit-003',
        park: 'Taman Safari Bogor',
        activity: 'Istana Burung',
        date: inDays(-59),
        image: memberImagery.giraffe,
      },
      {
        id: 'visit-004',
        park: 'Taman Safari Bogor',
        activity: 'Safari Journey',
        date: inDays(-78),
        image: memberImagery.elephant,
      },
      {
        id: 'visit-005',
        park: 'Taman Safari Bogor',
        activity: 'Predator Zone',
        date: inDays(-95),
        image: memberImagery.tiger,
      },
    ],
    activePerks: [
      { id: 'ap-001', title: 'Diskon F&B 10%', icon: 'percent', validUntil: inDays(135) },
      { id: 'ap-002', title: 'Diskon Merchandise 10%', icon: 'bag', validUntil: inDays(135) },
      { id: 'ap-003', title: 'Gratis Foto Digital', icon: 'camera', validUntil: inDays(135) },
    ],
  };
}
