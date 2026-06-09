import type { PublicKeyEntry, TokenBufferEntry } from '@tsi/qr-core';

export interface CachedPass {
  id: string;
  tier: string;
  holderName: string;
  status: 'active' | 'expired' | 'suspended';
  validFrom: number;
  validUntil: number;
  visitsAllowed: number | null;
  visitsUsed: number;
  updatedAt: number;
}

export interface PendingRedemption {
  id: string;
  jti: string;
  passId: string;
  gateId: string;
  scannedAt: number;
  verdict: 'allow' | 'deny' | 'manual';
  reason?: string;
  syncedAt: number | null;
  attemptCount: number;
}

export interface RecentScan {
  id: string;
  jti: string;
  passId: string;
  holderName: string;
  scannedAt: number;
  verdict: 'allow' | 'deny' | 'manual';
  source: 'online' | 'offline' | 'manual';
}

export interface ConsumedJti {
  jti: string;
  exp: number;
  consumedAt: number;
}

export type StoredTokenBufferEntry = TokenBufferEntry;
export type StoredPublicKey = PublicKeyEntry;
