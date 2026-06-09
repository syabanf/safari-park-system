import Dexie, { type Table } from 'dexie';
import type { ConsumedJti, PendingRedemption, RecentScan, StoredPublicKey } from './schemas';

export class ValidatorDb extends Dexie {
  pendingRedemptions!: Table<PendingRedemption, string>;
  recentScans!: Table<RecentScan, string>;
  publicKeys!: Table<StoredPublicKey, string>;
  consumedJti!: Table<ConsumedJti, string>;

  constructor() {
    super('tsi-validator');
    this.version(1).stores({
      pendingRedemptions: 'id, jti, passId, scannedAt, syncedAt',
      recentScans: 'id, scannedAt, passId, verdict',
      publicKeys: 'kid, notAfter',
      consumedJti: 'jti, exp',
    });
  }
}

export const validatorDb = new ValidatorDb();
