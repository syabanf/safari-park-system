import type { StorageAdapter } from './storage';

const DB_NAME = 'tsi-platform-storage';
const STORE = 'kv';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | T,
): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const store = tx.objectStore(STORE);
    const result = fn(store);
    if (result instanceof IDBRequest) {
      result.onsuccess = () => resolve(result.result);
      result.onerror = () => reject(result.error);
    } else {
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
    }
  });
}

export const webStorageAdapter: StorageAdapter = {
  async getItem<T>(key: string): Promise<T | null> {
    const value = await withStore<T | undefined>('readonly', (s) => s.get(key));
    return value ?? null;
  },

  async setItem<T>(key: string, value: T): Promise<void> {
    await withStore('readwrite', (s) => s.put(value, key));
  },

  async removeItem(key: string): Promise<void> {
    await withStore('readwrite', (s) => s.delete(key));
  },

  async clear(): Promise<void> {
    await withStore('readwrite', (s) => s.clear());
  },
};
