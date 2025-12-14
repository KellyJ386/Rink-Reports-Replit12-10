import { openDB, type IDBPDatabase } from 'idb';
import type { SyncQueueItem } from '../types';

const DB_NAME = 'mfo-ice-management';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase | null = null;

/**
 * Initialize and get the IndexedDB database instance
 */
export async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Measurements store
      if (!db.objectStoreNames.contains('measurements')) {
        const measurementsStore = db.createObjectStore('measurements', { keyPath: 'id' });
        measurementsStore.createIndex('by-synced', 'synced');
      }

      // Ice make logs store
      if (!db.objectStoreNames.contains('ice_make_logs')) {
        const iceMakeStore = db.createObjectStore('ice_make_logs', { keyPath: 'id' });
        iceMakeStore.createIndex('by-synced', 'synced');
      }

      // Circle checks store
      if (!db.objectStoreNames.contains('circle_checks')) {
        const circleCheckStore = db.createObjectStore('circle_checks', { keyPath: 'id' });
        circleCheckStore.createIndex('by-synced', 'synced');
      }

      // Sync queue store
      if (!db.objectStoreNames.contains('sync_queue')) {
        const syncQueueStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
        syncQueueStore.createIndex('by-created', 'created_at');
      }

      // Cache store
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache', { keyPath: 'key' });
      }
    },
  });

  return dbInstance;
}

/**
 * Add item to sync queue for later synchronization
 */
export async function addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'created_at' | 'retry_count'>): Promise<void> {
  const db = await getDB();
  const queueItem: SyncQueueItem = {
    id: crypto.randomUUID(),
    ...item,
    created_at: new Date().toISOString(),
    retry_count: 0,
  };
  await db.add('sync_queue', queueItem);
}

/**
 * Get all pending sync items
 */
export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  const db = await getDB();
  return db.getAllFromIndex('sync_queue', 'by-created');
}

/**
 * Remove item from sync queue after successful sync
 */
export async function removeSyncQueueItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('sync_queue', id);
}

/**
 * Increment retry count for a sync item
 */
export async function incrementSyncRetry(id: string): Promise<void> {
  const db = await getDB();
  const item = await db.get('sync_queue', id);
  if (item) {
    item.retry_count += 1;
    await db.put('sync_queue', item);
  }
}

/**
 * Store data in cache with expiration
 */
export async function cacheSet(key: string, data: unknown, ttlMs: number = 15 * 60 * 1000): Promise<void> {
  const db = await getDB();
  await db.put('cache', {
    key,
    data,
    expires_at: Date.now() + ttlMs,
  });
}

/**
 * Get data from cache (returns null if expired or not found)
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const db = await getDB();
  const item = await db.get('cache', key);

  if (!item) {
    return null;
  }

  if (Date.now() > item.expires_at) {
    await db.delete('cache', key);
    return null;
  }

  return item.data as T;
}

/**
 * Clear expired cache entries
 */
export async function clearExpiredCache(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('cache', 'readwrite');
  const store = tx.objectStore('cache');
  const allItems = await store.getAll();

  const now = Date.now();
  for (const item of allItems) {
    if (now > item.expires_at) {
      await store.delete(item.key);
    }
  }

  await tx.done;
}

/**
 * Check if the browser is online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Get count of pending sync items
 */
export async function getPendingSyncCount(): Promise<number> {
  const db = await getDB();
  return db.count('sync_queue');
}
