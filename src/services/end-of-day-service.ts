import { supabase } from '../lib/supabase';
import { getDB, addToSyncQueue, isOnline } from '../lib/offline-storage';
import type { EndOfDayReport } from '../types';
import { getTodayIceMakesCount } from './ice-make-service';

export interface CreateEndOfDayInput {
  rink_id: string;
  checklist_items: Record<string, boolean>;
  notes?: string;
}

/**
 * Save a new end of day report
 */
export async function saveEndOfDayReport(
  input: CreateEndOfDayInput,
  userId: string,
  facilityId: string
): Promise<EndOfDayReport> {
  const todayIceMakes = await getTodayIceMakesCount(input.rink_id);

  const report: EndOfDayReport = {
    id: crypto.randomUUID(),
    facility_id: facilityId,
    rink_id: input.rink_id,
    operator_id: userId,
    date: new Date().toISOString().split('T')[0],
    total_ice_makes: todayIceMakes,
    checklist_items: input.checklist_items,
    notes: input.notes,
    created_at: new Date().toISOString(),
    synced: false,
  };

  const db = await getDB();

  // Try to store locally
  try {
    await db.add('end_of_day_reports', report);
  } catch {
    // Store might not exist
  }

  if (isOnline()) {
    try {
      const { error } = await supabase.from('end_of_day_reports').insert({
        ...report,
        synced: true,
      });

      if (!error) {
        report.synced = true;
        try {
          await db.put('end_of_day_reports', report);
        } catch {
          // Ignore
        }
      } else {
        await addToSyncQueue({
          table_name: 'end_of_day_reports',
          operation: 'insert',
          data: report as unknown as Record<string, unknown>,
        });
      }
    } catch {
      await addToSyncQueue({
        table_name: 'end_of_day_reports',
        operation: 'insert',
        data: report as unknown as Record<string, unknown>,
      });
    }
  } else {
    await addToSyncQueue({
      table_name: 'end_of_day_reports',
      operation: 'insert',
      data: report as unknown as Record<string, unknown>,
    });
  }

  return report;
}

/**
 * Get all end of day reports from local storage
 */
export async function getLocalEndOfDayReports(): Promise<EndOfDayReport[]> {
  try {
    const db = await getDB();
    return await db.getAll('end_of_day_reports');
  } catch {
    return [];
  }
}

/**
 * Get reports for a specific date range
 */
export async function getReportsByDateRange(
  startDate: string,
  endDate: string
): Promise<EndOfDayReport[]> {
  const all = await getLocalEndOfDayReports();
  return all
    .filter((r) => r.date >= startDate && r.date <= endDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get recent reports
 */
export async function getRecentEndOfDayReports(limit: number = 10): Promise<EndOfDayReport[]> {
  const all = await getLocalEndOfDayReports();
  return all
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

/**
 * Check if a report exists for today for a rink
 */
export async function hasReportForToday(rinkId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  const all = await getLocalEndOfDayReports();
  return all.some((r) => r.rink_id === rinkId && r.date === today);
}
