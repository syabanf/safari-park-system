import { api } from '@/lib/api';
import type {
  BannerData,
  EventData,
  NotificationData,
  ParkInfo,
  ParkStatus,
  PerkData,
} from './types';

export async function fetchBanners(): Promise<BannerData[]> {
  const json = (await api.http.get('banners').json()) as { banners: BannerData[] };
  return json.banners;
}

export async function fetchParkStatus(): Promise<ParkStatus> {
  return (await api.http.get('park/status').json()) as ParkStatus;
}

export async function fetchParkInfo(): Promise<ParkInfo> {
  return (await api.http.get('park/info').json()) as ParkInfo;
}

export async function fetchNotifications(): Promise<NotificationData[]> {
  const json = (await api.http.get('notifications').json()) as {
    notifications: NotificationData[];
  };
  return json.notifications;
}

export async function fetchEvents(): Promise<EventData[]> {
  const json = (await api.http.get('events').json()) as { events: EventData[] };
  return json.events;
}

export async function fetchPerks(): Promise<PerkData[]> {
  const json = (await api.http.get('perks').json()) as { perks: PerkData[] };
  return json.perks;
}
