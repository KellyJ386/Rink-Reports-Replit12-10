import { supabase } from '../lib/supabase';
import { getDB, addToSyncQueue, isOnline } from '../lib/offline-storage';
import type { BladeChangeLog, BladeChangeReason } from '../types';

export interface CreateBladeChangeInput {
  resurfacer_id: string;
  hour_meter_reading: number;
  reason: BladeChangeReason;
  notes?: string;
}

/**
 * Get the last blade change for a resurfacer
 */
async function getLastBladeChange(resurfacerId: string): Promise<BladeChangeLog | null> {
  const db = await getDB();
  const all = await db.getAll('blade_changes') as BladeChangeLog[];
  const forResurfacer = all
    .filter((b) => b.resurfacer_id === resurfacerId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return forResurfacer[0] || null;
}

/**
 * Save a new blade change log
 */
export async function saveBladeChange(
  input: CreateBladeChangeInput,
  userId: string,
  facilityId: string
): Promise<BladeChangeLog> {
  const lastChange = await getLastBladeChange(input.resurfacer_id);
  const hoursSinceLastChange = lastChange
    ? input.hour_meter_reading - lastChange.hour_meter_reading
    : 0;

  const bladeChange: BladeChangeLog = {
    id: crypto.randomUUID(),
    facility_id: facilityId,
    resurfacer_id: input.resurfacer_id,
    operator_id: userId,
    hour_meter_reading: input.hour_meter_reading,
    hours_since_last_change: Math.max(0, hoursSinceLastChange),
    reason: input.reason,
    notes: input.notes,
    created_at: new Date().toISOString(),
    synced: false,
  };

  const db = await getDB();

  // Create blade_changes store if it doesn't exist
  if (!db.objectStoreNames.contains('blade_changes')) {
    // Store will be created on next DB upgrade, for now use a fallback
  }

  try {
    await db.add('blade_changes', bladeChange);
  } catch {
    // Store might not exist yet, store in sync queue
  }

  if (isOnline()) {
    try {
      const { error } = await supabase.from('blade_changes').insert({
        ...bladeChange,
        synced: true,
      });

      if (!error) {
        bladeChange.synced = true;
        try {
          await db.put('blade_changes', bladeChange);
        } catch {
          // Ignore if store doesn't exist
        }
      } else {
        await addToSyncQueue({
          table_name: 'blade_changes',
          operation: 'insert',
          data: bladeChange as unknown as Record<string, unknown>,
        });
      }
    } catch {
      await addToSyncQueue({
        table_name: 'blade_changes',
        operation: 'insert',
        data: bladeChange as unknown as Record<string, unknown>,
      });
    }
  } else {
    await addToSyncQueue({
      table_name: 'blade_changes',
      operation: 'insert',
      data: bladeChange as unknown as Record<string, unknown>,
    });
  }

  return bladeChange;
}

/**
 * Get all blade changes from local storage
 */
export async function getLocalBladeChanges(): Promise<BladeChangeLog[]> {
  try {
    const db = await getDB();
    return await db.getAll('blade_changes');
  } catch {
    return [];
  }
}

/**
 * Get blade changes for a specific resurfacer
 */
export async function getBladeChangesByResurfacer(resurfacerId: string): Promise<BladeChangeLog[]> {
  const all = await getLocalBladeChanges();
  return all
    .filter((b) => b.resurfacer_id === resurfacerId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/**
 * Get average blade life for a resurfacer
 */
export async function getAverageBladeLife(resurfacerId: string): Promise<number> {
  const changes = await getBladeChangesByResurfacer(resurfacerId);
  if (changes.length < 2) return 0;

  const hoursUsed = changes
    .slice(0, -1) // Exclude the first ever change
    .map((c) => c.hours_since_last_change)
    .filter((h) => h > 0);

  if (hoursUsed.length === 0) return 0;
  return Math.round(hoursUsed.reduce((a, b) => a + b, 0) / hoursUsed.length);
}
