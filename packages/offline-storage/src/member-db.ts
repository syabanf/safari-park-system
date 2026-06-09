import Dexie, { type Table } from 'dexie';
import type { CachedPass, ConsumedJti, StoredPublicKey, StoredTokenBufferEntry } from './schemas';

export class MemberDb extends Dexie {
  tokenBuffer!: Table<StoredTokenBufferEntry, string>;
  consumedJti!: Table<ConsumedJti, string>;
  cachedPasses!: Table<CachedPass, string>;
  publicKeys!: Table<StoredPublicKey, string>;

  constructor() {
    super('tsi-member');
    this.version(1).stores({
      tokenBuffer: 'jti, exp, kid, passId',
      consumedJti: 'jti, exp',
      cachedPasses: 'id, status, updatedAt',
      publicKeys: 'kid, notAfter',
    });
  }
}

export const memberDb = new MemberDb();
