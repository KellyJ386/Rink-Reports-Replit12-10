import { supabase } from '../lib/supabase';
import { getDB, addToSyncQueue, isOnline } from '../lib/offline-storage';
import type { CircleCheckLog, ChecklistItemStatus } from '../types';

export interface CreateCircleCheckInput {
  resurfacer_id: string;
  checklist_type: 'electric' | 'gas_propane';
  items: Record<string, ChecklistItemStatus>;
  notes?: string;
}

/**
 * Determine if a circle check passed
 */
function calculatePassed(items: Record<string, ChecklistItemStatus>): boolean {
  return Object.values(items).every((status) => status === 'pass' || status === 'na');
}

/**
 * Save a new circle check log
 */
export async function saveCircleCheck(
  input: CreateCircleCheckInput,
  userId: string,
  facilityId: string
): Promise<CircleCheckLog> {
  const circleCheck: CircleCheckLog = {
    id: crypto.randomUUID(),
    facility_id: facilityId,
    resurfacer_id: input.resurfacer_id,
    operator_id: userId,
    checklist_type: input.checklist_type,
    items: input.items,
    notes: input.notes,
    passed: calculatePassed(input.items),
    created_at: new Date().toISOString(),
    synced: false,
  };

  const db = await getDB();
  await db.add('circle_checks', circleCheck);

  if (isOnline()) {
    try {
      const { error } = await supabase.from('circle_checks').insert({
        ...circleCheck,
        synced: true,
      });

      if (!error) {
        circleCheck.synced = true;
        await db.put('circle_checks', circleCheck);
      } else {
        await addToSyncQueue({
          table_name: 'circle_checks',
          operation: 'insert',
          data: circleCheck as unknown as Record<string, unknown>,
        });
      }
    } catch {
      await addToSyncQueue({
        table_name: 'circle_checks',
        operation: 'insert',
        data: circleCheck as unknown as Record<string, unknown>,
      });
    }
  } else {
    await addToSyncQueue({
      table_name: 'circle_checks',
      operation: 'insert',
      data: circleCheck as unknown as Record<string, unknown>,
    });
  }

  return circleCheck;
}

/**
 * Get all circle checks from local storage
 */
export async function getLocalCircleChecks(): Promise<CircleCheckLog[]> {
  const db = await getDB();
  return db.getAll('circle_checks');
}

/**
 * Get circle checks for a specific resurfacer
 */
export async function getCircleChecksByResurfacer(resurfacerId: string): Promise<CircleCheckLog[]> {
  const all = await getLocalCircleChecks();
  return all
    .filter((c) => c.resurfacer_id === resurfacerId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/**
 * Get today's circle checks
 */
export async function getTodayCircleChecks(): Promise<CircleCheckLog[]> {
  const all = await getLocalCircleChecks();
  const today = new Date().toISOString().split('T')[0];
  return all.filter((c) => c.created_at.startsWith(today));
}

/**
 * Check if a resurfacer has been checked today
 */
export async function hasBeenCheckedToday(resurfacerId: string): Promise<boolean> {
  const todayChecks = await getTodayCircleChecks();
  return todayChecks.some((c) => c.resurfacer_id === resurfacerId);
}

/**
 * Get recent circle checks
 */
export async function getRecentCircleChecks(limit: number = 10): Promise<CircleCheckLog[]> {
  const all = await getLocalCircleChecks();
  return all
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}
