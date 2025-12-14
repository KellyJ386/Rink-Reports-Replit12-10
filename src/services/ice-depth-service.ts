import { supabase } from '../lib/supabase';
import { getDB, addToSyncQueue, isOnline } from '../lib/offline-storage';
import type { IceDepthMeasurement, MeasurementMethod } from '../types';

/**
 * Ice Depth Measurement Service
 * Handles saving and retrieving ice depth measurements with offline support
 */

export interface CreateMeasurementInput {
  rink_id: string;
  template_id: string;
  measurements: Record<string, number>;
  measurementMethods?: Record<string, MeasurementMethod>;
  device_id?: string;
  air_temp_c: number;
  ice_temp_c: number;
  humidity: number;
  notes?: string;
}

/**
 * Calculate statistics from measurements
 */
function calculateStats(measurements: Record<string, number>): {
  min_depth: number;
  max_depth: number;
  avg_depth: number;
} {
  const values = Object.values(measurements).filter((v) => typeof v === 'number' && !isNaN(v));

  if (values.length === 0) {
    return { min_depth: 0, max_depth: 0, avg_depth: 0 };
  }

  const min_depth = Math.min(...values);
  const max_depth = Math.max(...values);
  const avg_depth = values.reduce((sum, v) => sum + v, 0) / values.length;

  return {
    min_depth: Math.round(min_depth * 10) / 10,
    max_depth: Math.round(max_depth * 10) / 10,
    avg_depth: Math.round(avg_depth * 10) / 10,
  };
}

/**
 * Save a new ice depth measurement
 * Stores locally first, then syncs to Supabase when online
 */
export async function saveMeasurement(
  input: CreateMeasurementInput,
  userId: string,
  facilityId: string
): Promise<IceDepthMeasurement> {
  const stats = calculateStats(input.measurements);

  const measurement: IceDepthMeasurement = {
    id: crypto.randomUUID(),
    facility_id: facilityId,
    rink_id: input.rink_id,
    technician_id: userId,
    template_id: input.template_id,
    measurements: input.measurements,
    measurement_methods: input.measurementMethods || {},
    device_id: input.device_id,
    air_temp_c: input.air_temp_c,
    ice_temp_c: input.ice_temp_c,
    humidity: input.humidity,
    ...stats,
    notes: input.notes,
    checked_at: new Date().toISOString(),
    synced: false,
    created_at: new Date().toISOString(),
  };

  // Store in IndexedDB
  const db = await getDB();
  await db.add('measurements', measurement);

  // Try to sync to Supabase
  if (isOnline()) {
    try {
      const { error } = await supabase.from('ice_depth_measurements').insert({
        ...measurement,
        synced: true,
      });

      if (!error) {
        // Update local record as synced
        measurement.synced = true;
        await db.put('measurements', measurement);
      } else {
        // Add to sync queue
        await addToSyncQueue({
          table_name: 'ice_depth_measurements',
          operation: 'insert',
          data: measurement as unknown as Record<string, unknown>,
        });
      }
    } catch {
      // Network error, add to sync queue
      await addToSyncQueue({
        table_name: 'ice_depth_measurements',
        operation: 'insert',
        data: measurement as unknown as Record<string, unknown>,
      });
    }
  } else {
    // Offline, add to sync queue
    await addToSyncQueue({
      table_name: 'ice_depth_measurements',
      operation: 'insert',
      data: measurement as unknown as Record<string, unknown>,
    });
  }

  return measurement;
}

/**
 * Get all measurements from local storage
 */
export async function getLocalMeasurements(): Promise<IceDepthMeasurement[]> {
  const db = await getDB();
  return db.getAll('measurements');
}

/**
 * Get measurements for a specific rink
 */
export async function getMeasurementsByRink(rinkId: string): Promise<IceDepthMeasurement[]> {
  const all = await getLocalMeasurements();
  return all.filter((m) => m.rink_id === rinkId).sort(
    (a, b) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime()
  );
}

/**
 * Get a single measurement by ID
 */
export async function getMeasurementById(id: string): Promise<IceDepthMeasurement | null> {
  const db = await getDB();
  return db.get('measurements', id) || null;
}

/**
 * Get recent measurements
 */
export async function getRecentMeasurements(limit: number = 10): Promise<IceDepthMeasurement[]> {
  const all = await getLocalMeasurements();
  return all
    .sort((a, b) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime())
    .slice(0, limit);
}

/**
 * Fetch measurements from Supabase and update local cache
 */
export async function syncFromServer(facilityId: string): Promise<void> {
  if (!isOnline()) return;

  try {
    const { data, error } = await supabase
      .from('ice_depth_measurements')
      .select('*')
      .eq('facility_id', facilityId)
      .order('checked_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    if (data) {
      const db = await getDB();
      for (const measurement of data) {
        await db.put('measurements', { ...measurement, synced: true });
      }
    }
  } catch (error) {
    console.error('Failed to sync from server:', error);
  }
}

/**
 * Sync pending local changes to server
 */
export async function syncPendingChanges(): Promise<number> {
  if (!isOnline()) return 0;

  const db = await getDB();
  const unsyncedMeasurements = await db.getAllFromIndex('measurements', 'by-synced');
  const pending = unsyncedMeasurements.filter((m) => !m.synced);

  let synced = 0;

  for (const measurement of pending) {
    try {
      const { error } = await supabase.from('ice_depth_measurements').upsert({
        ...measurement,
        synced: true,
      });

      if (!error) {
        measurement.synced = true;
        await db.put('measurements', measurement);
        synced++;
      }
    } catch {
      // Skip this one, try next
    }
  }

  return synced;
}
