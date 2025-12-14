/**
 * Standard end of day checklist items
 */
export interface EODChecklistItem {
  id: string;
  text: string;
  category: 'ice' | 'equipment' | 'facility' | 'safety';
}

export const END_OF_DAY_CHECKLIST: EODChecklistItem[] = [
  // Ice
  { id: 'eod1', text: 'Final ice resurface completed', category: 'ice' },
  { id: 'eod2', text: 'Ice temperature within range', category: 'ice' },
  { id: 'eod3', text: 'Ice markings clear and visible', category: 'ice' },

  // Equipment
  { id: 'eod4', text: 'Resurfacer parked and plugged in (if electric)', category: 'equipment' },
  { id: 'eod5', text: 'Snow tank emptied', category: 'equipment' },
  { id: 'eod6', text: 'Water tank filled for next shift', category: 'equipment' },
  { id: 'eod7', text: 'Blade condition checked', category: 'equipment' },
  { id: 'eod8', text: 'Equipment cleaned', category: 'equipment' },

  // Facility
  { id: 'eod9', text: 'Boards and glass inspected', category: 'facility' },
  { id: 'eod10', text: 'Goals properly positioned', category: 'facility' },
  { id: 'eod11', text: 'Penalty boxes checked', category: 'facility' },
  { id: 'eod12', text: 'Player benches checked', category: 'facility' },

  // Safety
  { id: 'eod13', text: 'Rink area clear of debris', category: 'safety' },
  { id: 'eod14', text: 'Emergency equipment accessible', category: 'safety' },
  { id: 'eod15', text: 'All gates secured', category: 'safety' },
];

export const CATEGORY_LABELS: Record<string, string> = {
  ice: 'Ice Condition',
  equipment: 'Equipment',
  facility: 'Facility',
  safety: 'Safety',
};

export function getChecklistByCategory(): Record<string, EODChecklistItem[]> {
  const byCategory: Record<string, EODChecklistItem[]> = {};
  for (const item of END_OF_DAY_CHECKLIST) {
    if (!byCategory[item.category]) {
      byCategory[item.category] = [];
    }
    byCategory[item.category].push(item);
  }
  return byCategory;
}
