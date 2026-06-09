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
