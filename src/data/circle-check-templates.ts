import type { ChecklistItem, FuelType } from '../types';

/**
 * Standard circle check items for electric resurfacers
 */
export const ELECTRIC_CHECKLIST: ChecklistItem[] = [
  { id: 'e1', text: 'Battery charge level adequate (>40%)', order: 1, fuel_type: 'electric', is_active: true },
  { id: 'e2', text: 'Charging cable disconnected and stored', order: 2, fuel_type: 'electric', is_active: true },
  { id: 'e3', text: 'Blade condition checked - no visible damage', order: 3, fuel_type: 'all', is_active: true },
  { id: 'e4', text: 'Blade height set correctly', order: 4, fuel_type: 'all', is_active: true },
  { id: 'e5', text: 'Water tank filled', order: 5, fuel_type: 'all', is_active: true },
  { id: 'e6', text: 'Snow tank empty', order: 6, fuel_type: 'all', is_active: true },
  { id: 'e7', text: 'Cloth/towel in good condition', order: 7, fuel_type: 'all', is_active: true },
  { id: 'e8', text: 'Tires/tracks inspected', order: 8, fuel_type: 'all', is_active: true },
  { id: 'e9', text: 'Lights working', order: 9, fuel_type: 'all', is_active: true },
  { id: 'e10', text: 'Horn/backup alarm working', order: 10, fuel_type: 'all', is_active: true },
  { id: 'e11', text: 'Mirrors clean and adjusted', order: 11, fuel_type: 'all', is_active: true },
  { id: 'e12', text: 'Seat and seatbelt in good condition', order: 12, fuel_type: 'all', is_active: true },
  { id: 'e13', text: 'Emergency stop button accessible', order: 13, fuel_type: 'all', is_active: true },
  { id: 'e14', text: 'No fluid leaks under machine', order: 14, fuel_type: 'all', is_active: true },
  { id: 'e15', text: 'Conditioner board clean', order: 15, fuel_type: 'all', is_active: true },
];

/**
 * Standard circle check items for gas/propane resurfacers
 */
export const GAS_PROPANE_CHECKLIST: ChecklistItem[] = [
  { id: 'g1', text: 'Fuel level adequate', order: 1, fuel_type: 'gas', is_active: true },
  { id: 'g2', text: 'Propane tank secure (if applicable)', order: 2, fuel_type: 'propane', is_active: true },
  { id: 'g3', text: 'Engine oil level checked', order: 3, fuel_type: 'gas', is_active: true },
  { id: 'g4', text: 'Coolant level checked', order: 4, fuel_type: 'gas', is_active: true },
  { id: 'g5', text: 'Hydraulic fluid level checked', order: 5, fuel_type: 'all', is_active: true },
  { id: 'g6', text: 'Blade condition checked - no visible damage', order: 6, fuel_type: 'all', is_active: true },
  { id: 'g7', text: 'Blade height set correctly', order: 7, fuel_type: 'all', is_active: true },
  { id: 'g8', text: 'Water tank filled', order: 8, fuel_type: 'all', is_active: true },
  { id: 'g9', text: 'Snow tank empty', order: 9, fuel_type: 'all', is_active: true },
  { id: 'g10', text: 'Cloth/towel in good condition', order: 10, fuel_type: 'all', is_active: true },
  { id: 'g11', text: 'Tires/tracks inspected', order: 11, fuel_type: 'all', is_active: true },
  { id: 'g12', text: 'Lights working', order: 12, fuel_type: 'all', is_active: true },
  { id: 'g13', text: 'Horn/backup alarm working', order: 13, fuel_type: 'all', is_active: true },
  { id: 'g14', text: 'Mirrors clean and adjusted', order: 14, fuel_type: 'all', is_active: true },
  { id: 'g15', text: 'Exhaust system - no visible damage/leaks', order: 15, fuel_type: 'gas', is_active: true },
  { id: 'g16', text: 'Fire extinguisher present and charged', order: 16, fuel_type: 'all', is_active: true },
  { id: 'g17', text: 'No fluid leaks under machine', order: 17, fuel_type: 'all', is_active: true },
  { id: 'g18', text: 'Conditioner board clean', order: 18, fuel_type: 'all', is_active: true },
];

/**
 * Get checklist items for a specific fuel type
 */
export function getChecklistForFuelType(fuelType: FuelType): ChecklistItem[] {
  if (fuelType === 'electric') {
    return ELECTRIC_CHECKLIST.filter((item) => item.is_active);
  }
  return GAS_PROPANE_CHECKLIST.filter(
    (item) => item.is_active && (item.fuel_type === 'all' || item.fuel_type === fuelType)
  );
}

/**
 * Get all active checklist items
 */
export function getAllChecklistItems(): ChecklistItem[] {
  return [...ELECTRIC_CHECKLIST, ...GAS_PROPANE_CHECKLIST].filter((item) => item.is_active);
}
