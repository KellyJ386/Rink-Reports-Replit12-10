import { supabase } from '../lib/supabase';
import { getDB, addToSyncQueue, isOnline } from '../lib/offline-storage';
import type { IceMakeLog, CutType } from '../types';

export interface CreateIceMakeInput {
  rink_id: string;
  resurfacer_id: string;
  water_used_percent: number;
  snow_in_tank_percent: number;
  cut_type: CutType;
  battery_start_percent?: number;
  battery_end_percent?: number;
  hour_meter_reading?: number;
  notes?: string;
}

/**
 * Save a new ice make log
 */
export async function saveIceMake(
  input: CreateIceMakeInput,
  userId: string,
  facilityId: string
): Promise<IceMakeLog> {
  const iceMake: IceMakeLog = {
    id: crypto.randomUUID(),
    facility_id: facilityId,
    rink_id: input.rink_id,
    resurfacer_id: input.resurfacer_id,
    operator_id: userId,
    water_used_percent: input.water_used_percent,
    snow_in_tank_percent: input.snow_in_tank_percent,
    cut_type: input.cut_type,
    battery_start_percent: input.battery_start_percent,
    battery_end_percent: input.battery_end_percent,
    hour_meter_reading: input.hour_meter_reading,
    notes: input.notes,
    created_at: new Date().toISOString(),
    synced: false,
  };

  const db = await getDB();
  await db.add('ice_make_logs', iceMake);

  if (isOnline()) {
    try {
      const { error } = await supabase.from('ice_make_logs').insert({
        ...iceMake,
        synced: true,
      });

      if (!error) {
        iceMake.synced = true;
        await db.put('ice_make_logs', iceMake);
      } else {
        await addToSyncQueue({
          table_name: 'ice_make_logs',
          operation: 'insert',
          data: iceMake as unknown as Record<string, unknown>,
        });
      }
    } catch {
      await addToSyncQueue({
        table_name: 'ice_make_logs',
        operation: 'insert',
        data: iceMake as unknown as Record<string, unknown>,
      });
    }
  } else {
    await addToSyncQueue({
      table_name: 'ice_make_logs',
      operation: 'insert',
      data: iceMake as unknown as Record<string, unknown>,
    });
  }

  return iceMake;
}

/**
 * Get all ice make logs from local storage
 */
export async function getLocalIceMakes(): Promise<IceMakeLog[]> {
  const db = await getDB();
  return db.getAll('ice_make_logs');
}

/**
 * Get ice makes for a specific rink
 */
export async function getIceMakesByRink(rinkId: string): Promise<IceMakeLog[]> {
  const all = await getLocalIceMakes();
  return all
    .filter((m) => m.rink_id === rinkId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/**
 * Get today's ice makes count
 */
export async function getTodayIceMakesCount(rinkId?: string): Promise<number> {
  const all = await getLocalIceMakes();
  const today = new Date().toISOString().split('T')[0];

  return all.filter((m) => {
    const isToday = m.created_at.startsWith(today);
    const matchesRink = rinkId ? m.rink_id === rinkId : true;
    return isToday && matchesRink;
  }).length;
}

/**
 * Get recent ice makes
 */
export async function getRecentIceMakes(limit: number = 10): Promise<IceMakeLog[]> {
  const all = await getLocalIceMakes();
  return all
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}
