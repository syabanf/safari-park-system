export interface BannerData {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  accent: 'brand' | 'earth' | 'rose' | 'slate';
  ctaLabel: string;
  ctaTarget: string;
  validUntil: string;
  image?: string;
}

export interface ParkStatus {
  parkName: string;
  status: 'open' | 'closed';
  hours: string;
  weather: {
    tempC: number;
    conditionLabel: string;
    conditionEn: string;
    iconKey: string;
  };
  crowdLevel: 'low' | 'moderate' | 'high';
  featuredEvent: {
    id: string;
    title: string;
    location: string;
    image?: string;
  };
  heroImage?: string;
}

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  category: 'pass' | 'perk' | 'event' | 'renewal';
}

export interface EventData {
  id: string;
  title: string;
  summary: string;
  datetime: string;
  location: string;
  tag: string;
  image: string;
}

export interface PerkData {
  id: string;
  title: string;
  summary: string;
  category: string;
  validUntil: string;
  image?: string;
}

export interface ParkInfo {
  locations: {
    id: string;
    name: string;
    address: string;
    hours: string;
    phone: string;
    image?: string;
  }[];
  tips: string[];
}
